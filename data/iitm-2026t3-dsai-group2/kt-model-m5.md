# IITM-2026T3-DSAI-GROUP2/kt-model-m5

## Resumen

kt-model-m5 es un modelo de *knowledge tracing* (seguimiento del conocimiento del estudiante) basado en la arquitectura AKT (Attentive Knowledge Tracing), entrenado desde cero sobre el conjunto de datos educativo `assist2009`. Lo desarrolla el grupo IITM-2026T3-DSAI-GROUP2 en el marco del proyecto Socratic AI Tutor, y su funcion es predecir la probabilidad de que un estudiante acierte el siguiente ejercicio a partir de su historial de interacciones.

Se trata de un modelo muy pequeno (491.468 parametros, aproximadamente 1,97 MB en precision de 32 bits) con una ventana de contexto de 200 pasos y hasta 4 habilidades por paso. No es un modelo generativo de lenguaje: es un clasificador especializado que estima probabilidades de respuesta correcta y se evalua con metricas de discriminacion (AUC) y calibracion (ECE).

Su relevancia es acotada pero concreta: sirve como componente de prediccion dentro de un tutor socratico, con resultados medidos en la model card (AUC de test de 0,7793, ECE de 0,0428, latencia de 4,2 ms por ventana de 200 pasos). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado informacion adicional fuera de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AKT (Attentive Knowledge Tracing) |
| Parametros totales | 491.468 (1,97 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 200 pasos (`max_skills_per_step = 4`) |
| Tipos de cuantizacion | INT8 evaluada (caida de AUC de 0,0002); no se detallan otros formatos |
| Idiomas soportados | no disponible (modelo no linguistico; opera sobre identificadores de habilidad y pregunta) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`best_weights.pt`) |
| Habilidades / preguntas | 123 habilidades (pad idx 123), 15.922 preguntas (pad idx 15922) |
| Dataset de entrenamiento | `assist2009` |
| Metrica principal | ROC-AUC |
| SHA-256 de pesos | `4e42c91ffc5c0a86a9d2eebb3ea83dc69e6b1f372fdcfa35b61a88acc33fc1c9` |

## Arquitectura y entrenamiento

AKT es una arquitectura de *knowledge tracing* basada en mecanismos de atencion que modela la secuencia de interacciones del estudiante (habilidades ejercitadas, respuestas dadas) para estimar la probabilidad de acierto en el siguiente paso. El modelo se entreno desde cero sobre `assist2009`, un corpus educativo ampliamente usado en la literatura de *knowledge tracing*, con 123 habilidades y 15.922 preguntas mapeadas a indices internos. La mejor epoca registrada fue la 6.

No se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens o interacciones procesadas, ni si se aplicaron tecnicas de regularizacion especificas mas alla de las propias de AKT. La model card incluye artefactos de diagnostico (mapas de atencion, analisis de influencia, mapas de calor de error) que sugieren un proceso de evaluacion orientado a robustez y calibracion, pero no se describe el pipeline de entrenamiento paso a paso.

## Capacidades

- Prediccion de la probabilidad de respuesta correcta del siguiente ejercicio a partir del historial del estudiante.
- Modelado de secuencias de hasta 200 pasos con hasta 4 habilidades por paso.
- Manejo de identificadores de habilidad (123) y de pregunta (15.922) mediante mapas explicitos incluidos en el repositorio.
- Calibracion de probabilidades medida con ECE (0,0428 en test).
- Robustez ante historiales alterados: caida de AUC de 0,0154 con un 10 % de historial invertido.
- Cuantizacion INT8 con impacto minimo en AUC (caida de 0,0002).
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales; es un clasificador especializado.

## Casos de uso

- Prediccion en tiempo real dentro de un tutor socratico: el modelo estima la probabilidad de acierto del siguiente ejercicio y permite al tutor ajustar la dificultad o el tipo de pista ofrecida, con latencia de 4,2 ms por ventana de 200 pasos.
- Priorizacion de ejercicios de repaso: dado el historial de un estudiante, se pueden ordenar las habilidades pendientes por probabilidad estimada de fallo para concentrar la practica donde mas se necesita.
- Deteccion temprana de estudiantes en riesgo: umbrales sobre la probabilidad predicha permiten marcar alumnos con trayectorias de bajo rendimiento sostenido y derivarlos a intervencion docente.
- Evaluacion offline de curriculos: simular secuencias de ejercicios sobre los mapas de habilidad y pregunta para estimar el impacto esperado de un cambio en el orden o la seleccion de actividades.
- Investigacion en *knowledge tracing*: el modelo, sus pesos y los artefactos de evaluacion (AUC, ECE, analisis de atencion e influencia) sirven como linea base reproducible sobre `assist2009` para comparar nuevas arquitecturas.
- Despliegue en entornos con recursos muy limitados: con menos de 2 MB de pesos y soporte INT8, puede ejecutarse en CPU o en dispositivos de borde dentro de una plataforma educativa, sin GPU dedicada.
- Analisis de calibracion en sistemas de evaluacion adaptativa: el ECE medido permite usar las probabilidades como estimaciones fiables para decisiones de puntuacion o recomendacion.

## Benchmarks y rendimiento

Resultados de la evaluacion del hito 5 recogidos en la model card (conjunto de test de `assist2009`):

| Metrica | Valor medido | Objetivo | Estado |
|---|---|---|---|
| AUC de test | 0,7793 | >= 0,75 | PASS |
| Intervalo de confianza al 95 % del AUC | [0,7638, 0,7961] | no disponible | no disponible |
| Diferencia AUC validacion-test | -0,0064 | <= 0,02 | PASS |
| ECE de test | 0,0428 | <= 0,05 | PASS |
| Ganancia de AUC sobre mejor linea base (combinador logistico) | 0,0198 | >= 0,02 | FAIL |
| Tasa de acierto en test direccional | 0,9775 | >= 0,90 | PASS |
| Caida de AUC con 10 % de historial invertido | 0,0154 | <= 0,05 | PASS |
| Peor segmento (n >= 500, respuesta previa correcta) | 0,7376 | >= 0,65 | PASS |
| Latencia (ventana de 200 pasos) | 4,2048 ms | <= 100,0 ms | PASS |
| Caida de AUC con cuantizacion INT8 | 0,0002 | no disponible | no disponible |
| Rendimiento (throughput) | 47.746,66 pred/s | no disponible | no disponible |
| AUC de test en la ejecucion de exportacion | 0,7767 (val 0,7725) | no disponible | no disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos de *knowledge tracing* en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (pesos de 1,97 MB); practicamente despreciable en INT8.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier tarjeta consumer (por ejemplo, RTX 3060 o superior) sobra ampliamente.
- Cabe en cualquier GPU consumer y en dispositivos de borde; el cuello de botella no es la memoria sino el coste de gestionar secuencias de hasta 200 pasos.
- Opciones de despliegue: PyTorch nativo (carga del `state_dict` con `torch.load`), exportacion a TorchScript u ONNX no documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia medida: 4,2048 ms por ventana de 200 pasos; throughput de 47.746,66 predicciones por segundo.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de *knowledge tracing* (por ejemplo, DKT, SAKT o variantes de AKT) en la informacion proporcionada. La unica referencia comparativa de la model card es un combinador logistico usado como linea base, sobre el que este modelo obtiene una ganancia de AUC de 0,0198, por debajo del objetivo de 0,02 fijado en la evaluacion.

| Modelo | Parametros | Contexto | AUC test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kt-model-m5 (AKT) | 491.468 | 200 pasos | 0,7793 | MIT | Hugging Face |
| Linea base (combinador logistico) | no disponible | no disponible | 0,7595 (inferido de la ganancia) | no disponible | interna del proyecto |
| Otros modelos de KT | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo supera la linea base logistica en 0,0198 de AUC, por debajo del umbral de 0,02 marcado como objetivo; la propia model card registra este criterio como FAIL.
- El peor segmento evaluado (estudiantes con al menos 500 interacciones y respuesta previa correcta) cae a 0,7376 de AUC, lo que indica menor fiabilidad en poblaciones con historiales largos y consistentes.
- Entrenado exclusivamente sobre `assist2009`; no hay evidencia de generalizacion a otros dominios, curriculos o poblaciones. El uso fuera de ese dataset requiere reentrenamiento y validacion propios.
- Depende de mapas de habilidad y pregunta fijos (123 y 15.922 respectivamente); cualquier ejercicio nuevo fuera de ese vocabulario no puede representarse sin ampliar los mapas y reentrenar.
- Ventana maxima de 200 pasos: los historiales mas largos deben truncarse, con la perdida de informacion que ello implica.
- No es un modelo de lenguaje y no genera explicaciones ni texto; su salida es una probabilidad. Cualquier mensaje al estudiante debe producirlo otro componente del sistema.
- No se documentan sesgos demograficos ni analisis de equidad; en un contexto educativo, usar predicciones para decisiones con impacto en el alumno exige auditoria previa.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IITM-2026T3-DSAI-GROUP2/kt-model-m5
- Dataset `assist2009` (referencia del corpus de entrenamiento): no disponible enlace directo en la informacion proporcionada
- Paper de AKT (Attentive Knowledge Tracing): no disponible enlace en la informacion proporcionada
- Repositorio de codigo del proyecto Socratic AI Tutor: no disponible enlace en la informacion proporcionada
