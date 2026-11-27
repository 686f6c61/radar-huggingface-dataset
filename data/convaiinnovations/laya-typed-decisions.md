# convaiinnovations/laya-typed-decisions

## Resumen

Laya Typed-Decisions es un modelo de clasificación de texto no autorregresivo desarrollado por Convai Innovations, diseñado como un "modelo de decisión System 1". Se trata de un fine-tuning del checkpoint base Laya (ModernBERT-large) sobre flujos de trabajo de decisiones tipadas: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad. Con 421 millones de parámetros y una ventana de contexto de 1024 tokens, el modelo no genera texto: asigna una etiqueta a una entrada con una probabilidad calibrada, un conjunto conformal y una decisión explícita de abstención.

La propuesta técnica es relevante porque separa la decisión de la generación: en lugar de pedir a un LLM que "responda" una categoría, Laya coloca la entrada como una partícula en un espacio de decisión donde cada respuesta candidata es un valle, y reporta dónde se asienta la partícula junto con su probabilidad. Esto permite umbrales de riesgo calibrados (por defecto, tasa de error inferior al 10 % entre las respuestas emitidas), conjuntos conformales a alpha 0.10 y una ruta operativa (`auto` o `review`) pensada para integrarse en pipelines de producción.

El modelo forma parte de la familia Laya, que incluye una variante general en inglés y otra multilingüe con más de 100 idiomas. La licencia de los pesos es Apache 2.0, lo que permite uso comercial sin restricciones, aunque el paquete opcional de aprendizaje continuo (`vegaml-learn`) tiene licencia PolyForm Noncommercial 1.0.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autorregresivo (ModernBERT-large) con cabecera de decisión tipada |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (el checkpoint base Laya soporta 512; la familia anuncia hasta 73.728 tokens en la versión 0.5 del paquete) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (la variante `laya-multilingual` cubre más de 100 idiomas) |
| Licencia | Apache 2.0 (pesos y paquete `laya`); `vegaml-learn` bajo PolyForm Noncommercial 1.0.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamano del repositorio | 0.8 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT-large de 421M parámetros adaptado a un paradigma de decisión no autorregresivo. En lugar de generar tokens, el sistema proyecta la entrada en un espacio de decisión de baja dimensión donde cada respuesta candidata ocupa un "valle" de potencial; la partícula que representa la entrada rueda y se asienta en uno de ellos de forma determinista. La profundidad del valle y la posición final producen la etiqueta, su probabilidad calibrada, el conjunto conformal (`prediction_set`) y las banderas `abstain` y `unbound`. El coste computacional es constante e independiente de la longitud de la respuesta, ya que no hay decodificación.

El fine-tuning se realizó sobre los flujos de trabajo del dataset `typed-decisions` (observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La calibración de umbrales se apoya en un procedimiento de riesgo controlado: el umbral de abstención se ajusta para que, entre las respuestas emitidas, la tasa de error se mantenga por debajo del riesgo configurado (10 % por defecto). El paquete `laya` v0.5 añade soporte multimodal (imagen, audio y vídeo) mediante `agent.predict(...)` con los argumentos `image=`, `audio=` o `video=`.

## Capacidades

- Clasificación de texto con etiquetas tipadas y probabilidad calibrada.
- Abstención explícita (`abstain`) con umbral calibrado a una tasa de error objetivo.
- Conjunto conformal (`prediction_set`) a alpha 0.10 para cuantificar ambigüedad.
- Bandera `unbound` para detectar entradas fuera de distribución (con la advertencia de que su especificidad es baja en algunos dominios).
- Ruta operativa (`route`: `auto` o `review`) para integrarse en flujos con revisión humana.
- Modo multimodal en la versión 0.5 del paquete: imagen, audio y vídeo con las mismas respuestas tipadas.
- Aprendizaje continuo opcional vía `laya.Learner` (paquete `vegaml-learn`, no comercial), que aprende de respuestas confirmadas por el equipo en CPU en segundos.
- Uso de cualquier LLM congelado como "lector" subyacente (desde 0.8B hasta 27B), con el motor de decisión encima.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso en el sentido de un LLM generativo.

## Casos de uso

- Observabilidad de trazas de agentes: clasificar cada paso de un agente (llamada a herramienta, respuesta, error, escalado) en categorías tipadas con probabilidad calibrada, para alimentar paneles de监控 y alertas sin depender de un LLM generativo en línea.
- Procesamiento de facturas: asignar cada documento entrante a una categoría (aprobada, duplicada, requiere revisión, datos faltantes) con abstención automática cuando la confianza no alcanza el umbral de riesgo, reduciendo errores en el pipeline de cuentas a pagar.
- Gestión de incidentes de seguridad: triaje de alertas en categorías (falso positivo, escalado, contención, investigación) con conjunto conformal para marcar casos ambiguos que deben ir a revisión humana.
- Atención al cliente: enrutado de tickets a colas o agentes especializados según la intención tipada, con la ruta `review` activada cuando el conjunto conformal contiene más de una opción.
- Moderación y control de calidad en producción: uso de `abstain` y `route` para derivar a revisión humana solo los casos dudosos, manteniendo la tasa de error por debajo del 10 % configurado.
- Aprendizaje continuo en dominio propio: con `laya.Learner`, el modelo parte de ~600 ejemplos generados por plantilla y mejora con respuestas confirmadas por el equipo (de 84,7 % a 96,0 % tras 120 respuestas confirmadas en la evaluación publicada), sin reentrenar los 421M de pesos.
- Clasificación multimodal en la versión 0.5: procesar capturas de pantalla, transcripciones de audio o fotogramas de vídeo con las mismas etiquetas tipadas que el texto.

## Benchmarks y rendimiento

La model card reporta resultados de aprendizaje continuo sobre 14 plantillas de decisión (31 preguntas), evaluadas en 60 filas retenidas por plantilla:

| Modelo | Día uno | Tras 40 respuestas confirmadas | Tras 120 |
|---|---|---|---|
| laya, `laya.Learner` | 84,7 % | 91,6 % | 96,0 % |
| Jev 1.14 (API alojada) | 89,5 % | 91,5 % | 92,6 % |

Jev lidera en el día uno (23 de 31 preguntas), empatan a 40 respuestas confirmadas y laya lidera a 120 (12 victorias, 7 derrotas, 12 empates). El coste de aprendizaje es de 34 s para 300 respuestas en 8 hilos de CPU sin GPU (0,72 s por respuesta, 6,4 GB de RAM); en GPU, 40 ms y 2 GB. El fine-tuning clásico del encoder sobre las mismas 300 filas tarda 89 s en GPU con 9 GB y reescribe los 421M de pesos.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo y no aplica ese tipo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 421M parámetros; en fp16 requiere aproximadamente 0,9 GB y en fp32 unos 1,7 GB, más el overhead del runtime (no se especifican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 4090 o RTX 3090 lo ejecuta con holgura. Para despliegue a escala, A100 o H100 no son necesarias por tamaño, pero pueden usarse para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM libre (GTX 1660, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: transformers (librería nativa), endpoints compatibles, despliegue en Azure (tag `deploy:azure`); el paquete `laya` se instala con `pip install -U laya`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles para inferencia estándar; la model card solo reporta tiempos de aprendizaje continuo (0,72 s por respuesta en CPU con 8 hilos; 40 ms en GPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| laya-typed-decisions | 421M | 1024 | inglés | Apache 2.0 | Decisión no autorregresiva con calibración y abstención |
| laya (base) | 421M | 512 | inglés | Apache 2.0 | Decisión general en inglés |
| laya-multilingual | 322M | 1024 | 100+ | Apache 2.0 | Decisión multilingüe |
| Jev 1.14 (API alojada) | no disponible | no disponible | no disponible | propietaria (API) | Clasificación por criterios, sin aprendizaje |

La comparación directa con clasificadores encoder convencionales (por ejemplo, fine-tunes de BERT o DeBERTa para text-classification) no está disponible en la información proporcionada; la diferencia principal documentada es la calibración de abstención, el conjunto conformal y el aprendizaje continuo sin reentrenamiento.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado principalmente en inglés; no se garantiza un rendimiento adecuado en otros idiomas (para ello existe `laya-multilingual`).
- La bandera `unbound` tiene baja especificidad en algunos dominios: según la model card, se activó en el 71 % de las filas normales de banking77, por lo que no debe usarse como única señal de enrutado.
- El umbral de abstención está calibrado a una tasa de error objetivo (10 % por defecto); cambiarlo altera el equilibrio entre cobertura y precisión.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en entradas fuera de distribución o ambiguas.
- La licencia Apache 2.0 cubre los pesos y el paquete `laya`, pero el aprendizaje continuo (`laya.Learner`, `laya.Escalator`, `laya.vllm_teacher`) requiere `vegaml-learn`, bajo PolyForm Noncommercial 1.0.0: su uso en empresa, producto o servicio de pago requiere licencia comercial.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento, lo que limita la auditoría de equidad.
- El contexto efectivo de este checkpoint es de 1024 tokens; entradas más largas deben truncarse o dividirse.
- No es un modelo generativo: no sirve para redactar, resumir ni mantener conversaciones; solo para clasificar y decidir.

## Enlaces

- Hugging Face: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Variante multilingüe: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Paper: https://doi.org/10.20944/preprints202611.0781.v1
- Repositorio del proyecto: https://github.com/NandhaKishorM/vegaml
- Licencia comercial de `vegaml-learn`: https://embedding.in/licence
