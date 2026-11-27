# convaiinnovations/laya

## Resumen

Laya es un modelo de decisión no autorregresivo desarrollado por convaiinnovations (embedding.in), diseñado para clasificar, enrutar y puntuar estados de entrada —texto, correo, ticket, JSON, imagen, audio o vídeo— devolviendo respuestas tipadas con probabilidades calibradas en un único pase hacia delante. No genera texto: dado un estado y un conjunto de preguntas tipadas, produce opciones de respuesta con su probabilidad, conjunto conformal, bandera de abstención y bandera de fuera de distribución. Con 421,3 millones de parámetros, se presenta como un "System 1" que se apoya en un lector congelado (de 0,8B a 27B) sobre el que opera un pequeño motor de decisión.

La relevancia actual del modelo reside en su enfoque de calibración: se entrena con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD), de modo que la única forma de maximizar la recompensa es reportar probabilidades honestas. Esto lo hace adecuado para guardarraíles, moderación, enrutamiento y decisiones con umbral de riesgo, donde la fiabilidad de la confianza reportada importa tanto como la predicción. Soporta más de 100 idiomas y una ventana de contexto de 73.728 tokens.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card del autor; los datos no publicados se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No autorregresiva; motor de decisión sobre un lector LLM congelado (arquitectura interna no detallada) |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 73.728 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 100 idiomas |
| Licencia | Apache 2.0 (pesos y paquete `laya`); el paquete `vegaml-learn` es PolyForm Noncommercial 1.0.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Laya es un modelo no autorregresivo de decisión: en lugar de generar tokens, coloca la entrada como una partícula en un espacio de decisión donde cada respuesta candidata es un valle; la partícula rueda y se asienta en uno de ellos, y la posición y profundidad del asentamiento determinan la respuesta y su probabilidad. El coste es determinista y constante (aproximadamente 33 ms por pase), y no hay texto que parsear ni posibilidad de alucinación generativa. El modelo opera sobre un lector LLM congelado, de modo que el mismo motor de decisión puede funcionar con lectores de 0,8B a 27B.

El entrenamiento emplea aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD), lo que incentiva la honestidad probabilística. La versión 0.5 añade lectura de imágenes, audio y vídeo, contexto de 73.728 tokens y mecanismos de abstención y detección de fuera de distribución. El aprendizaje continuo se realiza mediante el paquete separado `vegaml-learn`, que permite aprender de respuestas confirmadas por el equipo en segundos sobre CPU, sin fine-tuning y sin reescribir los 421M de pesos.

## Capacidades

- Clasificación y decisión tipada sobre texto, correo, ticket o JSON, con respuestas tipadas y probabilidades calibradas.
- Lectura multimodal: imágenes, audio y vídeo mediante `agent.predict(...)` con `image=`, `audio=` o `video=`.
- Abstención calibrada (`abstain`): el umbral se calibra para que, entre las respuestas emitidas, la tasa de error quede por debajo del riesgo configurado (10% por defecto).
- Conjunto conformal (`prediction_set`): conjunto de opciones posibles con `alpha` 0,10; una sola opción indica certeza y varias indican ambigüedad real.
- Detección de fuera de distribución (`unbound`): la partícula se asienta lejos de todos los valles; se reporta en cada respuesta pero no enruta por sí sola.
- Enrutamiento (`route`): valor `auto` o `review`, decidido por abstención, tamaño del conjunto conformal o una banda de precisión calibrada al 95% cuando hay etiquetas.
- Aprendizaje continuo desde respuestas confirmadas (`laya.Learner`, `laya.Escalator`, `laya.vllm_teacher`), con el paquete `vegaml-learn`.
- Multilingüe: más de 100 idiomas.
- No soporta generación de texto, tool calling ni razonamiento multi-paso generativo; su función es la decisión puntual.

## Casos de uso

- Guardarraíles y moderación de contenido: el modelo evalúa cada mensaje contra preguntas tipadas (por ejemplo, si es abusivo o si requiere revisión) y devuelve probabilidad calibrada y bandera de abstención, lo que permite fijar umbrales de riesgo operativos.
- Enrutamiento de tickets de soporte: dado un ticket, decide la categoría o el equipo destino y marca `review` cuando el conjunto conformal contiene más de una opción, reduciendo derivaciones erróneas.
- Verificación de contratos y documentos largos: con 73.728 tokens de contexto puede leer contratos completos o hilos de correo y responder preguntas tipadas sobre cláusulas, con probabilidad asociada.
- Detección de inyección de prompt: como puerta de decisión sobre tráfico real, clasifica entradas sospechosas y puede abstenerse cuando el caso es ambiguo, aunque el autor advierte que pierde frente a modelos alojados grandes en suites genéricas zero-shot.
- Clasificación de correo y bandejas de entrada: asigna etiquetas y prioridad a mensajes con probabilidades calibradas, útil para automatizar el triaje sin generación de texto.
- Análisis de audio y vídeo para control de calidad: evalúa grabaciones o clips contra preguntas tipadas (por ejemplo, presencia de un determinado evento) en un solo pase.
- Aprendizaje continuo en producción: con `vegaml-learn`, el equipo confirma respuestas y el modelo se adapta en segundos sobre CPU (0,72 s por respuesta, 6,4 GB de RAM; 40 ms y 2 GB en GPU), sin reentrenar los pesos.

## Benchmarks y rendimiento

Datos publicados en la model card:

| Prueba | Laya | Jev 1.14 |
|---|---|---|
| Aprendizaje continuo, día uno (14 plantillas, 31 preguntas) | 84,7% | 89,5% |
| Tras 40 respuestas confirmadas | 91,6% | 91,5% |
| Tras 120 respuestas confirmadas | 96,0% | 92,6% |
| banking77, 924 retenidos, tras 4.928 filas | 87,5%, ECE 0,028, 92,5% enrutado auto a 91,5% de precisión | 79,4% de serie (ECE 0,078), 85,7% con ejemplos |
| typed-decisions, 2.000 decisiones, tras 1.200 filas | 73,7%, ECE 0,031 | 74,7%, ECE 0,047 |

Rendimiento según el lector, sobre 50.676 registros retenidos con motor de decisión idéntico: 0,8B 76,5%, 4B 79,1%, 27B 81,1%, con ECE entre 0,010 y 0,021.

Coste del aprendizaje: 300 respuestas en 34 s sobre 8 hilos de CPU sin GPU (0,72 s por respuesta, 6,4 GB de RAM; en GPU 40 ms y 2 GB). El fine-tuning clásico del encoder sobre las mismas 300 filas tarda 89 s en GPU con 9 GB y reescribe los 421M de pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desagregada; el repo ocupa 2,4 GB en safetensors.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que el aprendizaje continuo funciona en GPU con 2 GB y que la inferencia opera con lectores de 0,8B a 27B.
- Cabe en GPU de consumo: el aprendizaje continuo se ejecuta en CPU (6,4 GB de RAM) y en GPU con 2 GB; la inferencia con lectores pequeños es viable en GPU de consumo, aunque no se detallan modelos.
- Opciones de despliegue: `transformers`, paquete `laya` (`pip install -U laya`), endpoints compatibles y despliegue en Azure; se menciona `laya.vllm_teacher` para integración con vLLM.
- Latencia y throughput: aproximadamente 33 ms por pase de decisión; 364 ms por petición para Jev desde India como referencia comparativa; 40 ms por respuesta en aprendizaje con GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya | 421,3M | 73.728 tokens | Decisión no autorregresiva con probabilidades calibradas | Apache 2.0 (aprendizaje continuo no comercial) | Hugging Face, pip |
| Jev 1.14 | No disponible | No disponible | Decisión mediante criterios y prompting, API alojada | No disponible | API alojada |
| Encoder clásico con fine-tuning | 421M (mismo tamaño) | No disponible | Clasificación supervisada con fine-tuning | No disponible | No disponible |

Jev 1.14 lidera en el día uno (89,5% frente a 84,7%) y no puede enseñarse, solo promptearse; laya lo supera tras 120 respuestas confirmadas (96,0% frente a 92,6%). El fine-tuning clásico reescribe todos los pesos y tarda 89 s en GPU frente a los 34 s en CPU del aprendizaje continuo de laya.

## Limitaciones y advertencias

- En suites públicas genéricas zero-shot, un modelo alojado grande lidera; laya no es un sustituto de un LLM generativo.
- La bandera `unbound` se disparó en el 71% de las filas normales de banking77, por lo que no debe usarse sola para enrutar.
- El enrutamiento debe basarse en `route`, nunca en un número de confianza aislado.
- No genera texto, por lo que no cubre tareas de generación, resumen libre ni razonamiento multi-paso generativo.
- El aprendizaje continuo (`laya.Learner`, `laya.Escalator`, `laya.vllm_teacher`) requiere `vegaml-learn`, con licencia PolyForm Noncommercial 1.0.0: su uso en empresa, producto o servicio de pago exige licencia comercial.
- Los idiomas concretos no están enumerados; solo se indica "más de 100 idiomas".
- No se detallan sesgos conocidos ni tipos de cuantización en la información disponible.
- El rendimiento depende del lector elegido (76,5% con 0,8B frente a 81,1% con 27B), lo que condiciona los requisitos de hardware.

## Enlaces

- Hugging Face: https://huggingface.co/convaiinnovations/laya
- Paper: https://doi.org/10.20944/preprints202611.0781.v1
- Licencia comercial: https://embedding.in/licence
- Repositorio de recursos citado en la model card: https://github.com/NandhaKishorM/vegaml
- Contacto del autor: nandakishor@embedding.in
