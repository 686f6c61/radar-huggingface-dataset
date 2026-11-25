# samadpls/onepass-qwen3-1.7b-GGUF

## Resumen

onepass-qwen3-1.7b es un modelo de decisión tipado (typed-decisions) construido mediante un ajuste LoRA sobre Qwen3-1.7B. A diferencia de un modelo generativo convencional, no produce texto libre: recibe un fragmento de texto (el "estado") y una o varias preguntas tipadas (sí/no, elección única o selección de nivel en una escala) y devuelve, en un solo forward pass, una distribución de probabilidad sobre todas las respuestas posibles de todas las preguntas simultáneamente. Lo desarrolla samadpls y se publica bajo licencia Apache-2.0.

La propuesta resuelve un problema clásico de los pipelines de clasificación y enrutamiento con LLM: la fragilidad del parseo de salidas generadas. Al leer las respuestas directamente de las puntuaciones del modelo, la salida no puede estar mal formada. Además, el modelo está calibrado sobre la proporción de anotadores humanos que eligieron cada respuesta, no sobre una única etiqueta dura, lo que produce probabilidades más informativas que un clasificador convencional.

El repositorio contiene los pesos en formato GGUF para llama.cpp y para el runtime propio `onepass`, derivados del modelo base `samadpls/onepass-qwen3-1.7b`. Con 1.720.574.976 parámetros y solo 35 millones entrenados mediante LoRA, es un modelo pequeño orientado a despliegue local y a tareas de decisión estructurada en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA para clasificación tipada |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no disponible (no es MoE; 35M entrenados vía LoRA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo incluye al menos Q8_0; otras variantes no confirmadas) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base también en safetensors; adaptador LoRA separado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only, y le aplica un ajuste LoRA que entrena 35 millones de parámetros sobre un total de 1,7 mil millones. La innovación no está en la arquitectura sino en la cabeza de decisión: en lugar de generar tokens de respuesta, el modelo lee las puntuaciones de logits correspondientes a las etiquetas de cada pregunta tipada y las normaliza en una distribución de probabilidad. Esto permite resolver varias preguntas heterogéneas (sí/no, elección entre opciones, niveles de una escala) en una sola pasada.

El entrenamiento usa 68.061 textos con 138.928 preguntas procedentes de 19 conjuntos de datos abiertos, entre ellos BoolQ, MultiNLI, WANLI, Civil Comments, PAWS, VitaminC, Banking77, CLINC OOS, DBpedia14, GoEmotions, HelpSteer2 y BRIGHTER. La calibración se realiza con una temperatura de 1.05, ajustada para que las probabilidades reflejen la distribución de anotaciones humanas en lugar de una etiqueta única. El modelo declara no haber sido entrenado con el benchmark de evaluación LocalLLaMA/typed-decisions.

## Capacidades

- Clasificación tipada en una sola pasada: preguntas de sí/no (tipo `noul`), elección única (`choice`) y selección de nivel en una escala.
- Respuesta simultánea a múltiples preguntas sobre el mismo texto de entrada.
- Salida probabilística calibrada por respuesta, apta para umbrales y decisiones con coste asimétrico.
- Salida estructurada garantizada: al no generar texto, no puede producir respuestas mal formadas.
- Enrutamiento y triaje: asignación de un caso a un equipo, categoría o nivel de severidad.
- Evaluación de soporte factual (tipo RAGTruth) y de calidad de resúmenes (tipo SummEval).
- Detección de spam, emoción, toxicidad y otras categorías de clasificación de texto.
- No soporta tool calling, agentes multi-paso ni generación de texto libre.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el mensaje del cliente y devuelve en una pasada la probabilidad de que requiera reembolso y el equipo asignado (facturación, técnico, etc.), como muestra el ejemplo de la model card con `refund` 0.92 y `team` 0.95.
- Enrutamiento de incidencias de seguridad: clasificación de alertas por severidad y tipo en un pipeline de SIEM, aprovechando la salida probabilística para priorizar por umbral.
- Procesamiento de facturas: extracción de decisiones tipadas (¿es una factura?, ¿requiere aprobación?, ¿nivel de riesgo?) sobre texto OCR, con la garantía de que la salida siempre es parseable.
- Moderación de contenido: clasificación de comentarios por toxicidad, odio o emoción usando los conjuntos de Civil Comments, Hate Speech Offensive y GoEmotions presentes en el entrenamiento.
- Detección de spam en SMS y mensajes: clasificación binaria sobre texto corto, adecuada para modelos de 1,7B desplegados en local.
- Verificación de respuestas en RAG: comprobación de si una respuesta está soportada por el contexto recuperado (tipo RAGTruth), con probabilidad calibrada para decidir si se descarta o se reescribe.
- Evaluación de calidad de resúmenes: asignación de niveles de calidad a resúmenes generados, útil en pipelines de evaluación automática.
- Clasificación de intenciones en asistentes conversacionales: uso de las categorías de Banking77 y CLINC OOS para enrutar consultas de usuario.

## Benchmarks y rendimiento

Evaluado sobre el split de test de 400 casos (2.000 decisiones) de LocalLLaMA/typed-decisions. Accuracy más alto es mejor; KL, Brier y ECE más bajo es mejor.

| Modelo | Accuracy | KL from gold | Brier | ECE |
|---|---|---|---|---|
| Qwen3-1.7B sin ajuste | 0.278 | 1.914 | 0.812 | 0.611 |
| Frecuencias de etiquetas del train split (ignora la entrada) | 0.481 | 0.327 | 0.181 | 0.036 |
| onepass 1.7B | 0.646 | 0.236 | 0.129 | 0.076 |

Desglose por tipo de pregunta y flujo de trabajo:

| Categoría | Accuracy |
|---|---|
| Sí/no | 0.755 |
| Elección única | 0.605 |
| Selección de nivel | 0.594 |
| Trazas de agente | 0.574 |
| Atención al cliente | 0.686 |
| Facturas | 0.654 |
| Incidentes de seguridad | 0.668 |

Conjuntos humanos reservados (nunca vistos en entrenamiento):

| Conjunto | Respuesta más común | Accuracy antes → después |
|---|---|---|
| CondaQA (negación, sí/no) | 0.483 | 0.495 → 0.476 |
| Cosmos QA (sentido común, elección) | 0.260 | 0.529 → 0.506 |
| SummEval (calidad de resumen, nivel) | 0.651 | 0.073 → 0.376 |
| RAGTruth (¿respuesta soportada?, sí/no) | 0.768 | 0.476 → 0.760 |

La accuracy es mixta en los conjuntos reservados, pero la KL frente al gold mejora en los cuatro, lo que indica que las probabilidades son más informativas aunque la etiqueta argmax no siempre acierte.

## Requisitos de hardware

- VRAM estimada: en Q8_0, aproximadamente 1,8-2 GB para los pesos; con overhead de contexto, entre 2,5 y 3 GB. En cuantizaciones menores (Q4_K_M, si están disponibles) bajaría a alrededor de 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; en A100 o H100 el modelo ocupa una fracción mínima de memoria y el cuello de botella es el throughput de peticiones.
- Cabe holgadamente en GPU consumer e incluso en CPU, dado el tamaño de 1,7B parámetros.
- Opciones de despliegue: llama.cpp y el runtime `onepass` (servidor local con API HTTP en `/v1/systemone`); el repo está etiquetado como compatible con endpoints. No se documenta soporte explícito para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser una sola pasada sin generación autorregresiva, la latencia debería ser muy inferior a la de un LLM generativo del mismo tamaño, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| onepass-qwen3-1.7b | 1,7B (35M entrenados) | no disponible | Clasificación tipada probabilística en una pasada | Apache-2.0 |
| Qwen3-1.7B (base) | 1,7B | no disponible | Generación de texto generalista | Apache-2.0 |
| onepass-qwen3-0.6b | 0,6B | no disponible | Misma tarea, versión reducida | Apache-2.0 |

Frente al Qwen3-1.7B sin ajuste, onepass sube la accuracy de 0.278 a 0.646 y reduce la ECE de 0.611 a 0.076 en el benchmark typed-decisions, a costa de renunciar a la generación libre. La versión de 0,6B ofrece el mismo paradigma con menor huella de memoria. No se dispone de comparación con clasificadores dedicados (por ejemplo, DeBERTa o modelos de clasificación de sentence-transformers) en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- No es un modelo generativo: no puede producir texto libre, resúmenes ni código.
- La accuracy en conjuntos reservados es irregular y en algunos casos empeora respecto al modelo base (CondaQA, Cosmos QA), aunque las probabilidades mejoran.
- En SummEval la accuracy (0.376) queda por debajo de la respuesta más común (0.651), lo que indica que el argmax puede ser peor que una heurística trivial en tareas de nivel subjetivo.
- Riesgo de sesgo heredado de los conjuntos de entrenamiento (Civil Comments, Hate Speech Offensive, GoEmotions, HelpSteer2), con posibles desequilibrios demográficos y culturales.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración defectuosa fuera de la distribución de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha, por lo que no hay validación comunitaria independiente.
- La fecha de creación del repositorio (2026-11-25) y la referencia al "Qwen Local Hackathon 2026" sugieren un proyecto reciente y de alcance limitado.
- La longitud de contexto no está documentada, lo que impide planificar entradas largas con garantías.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/samadpls/onepass-qwen3-1.7b-GGUF
- Modelo base ajustado: https://huggingface.co/samadpls/onepass-qwen3-1.7b
- Adaptador LoRA: https://huggingface.co/samadpls/onepass-qwen3-1.7b-lora
- Versión 0.6B en GGUF: https://huggingface.co/samadpls/onepass-qwen3-0.6b-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de código: https://github.com/samadpls/onepass
- Dataset de evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Herramienta de fine-tuning citada: https://github.com/junaiddshaukat/finetune-anywhere
- Sitio del autor: https://samadpls.com
