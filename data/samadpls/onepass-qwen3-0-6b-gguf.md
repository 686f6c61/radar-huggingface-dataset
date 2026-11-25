# samadpls/onepass-qwen3-0.6b-GGUF

## Resumen

onepass-qwen3-0.6b es un modelo de decisión tipada de muy pequeño tamano (596 millones de parámetros) desarrollado por samadpls, construido mediante un ajuste LoRA sobre Qwen3-0.6B. A diferencia de un modelo generativo convencional, no produce texto libre: recibe un "estado" (un fragmento de texto) y un conjunto de preguntas tipadas (sí/no, elección única o selección de nivel en una escala) y devuelve, en una única pasada hacia delante, una distribución de probabilidad sobre todas las respuestas posibles de todas las preguntas simultáneamente. Al leer las puntuaciones internas del modelo en lugar de generar tokens, la salida no puede estar mal formada sintácticamente.

El modelo está calibrado sobre la proporción de anotadores humanos que eligieron cada respuesta, no sobre una única etiqueta mayoritaria, lo que lo hace adecuado para tareas de clasificación y enrutamiento donde importa la confianza de la predicción. Se entrenó con 68.061 textos y 138.928 preguntas procedentes de 19 conjuntos de datos abiertos (BoolQ, MultiNLI, WANLI, Civil Comments, PAWS, Banking77, CLINC OOS, DBpedia-14, GoEmotions, HelpSteer2, entre otros) y se evaluó en un conjunto de test que nunca vio durante el entrenamiento.

Esta versión del repositorio contiene los pesos en formato GGUF para su uso con llama.cpp y con el runtime propio de onepass. Es relevante para desarrolladores que necesitan un clasificador ligero, determinista y bien calibrado que quepa en cualquier máquina y que pueda integrarse como paso de decisión dentro de pipelines de agentes o de atención al cliente, evitando los problemas de formato y latencia de los modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con cabeza de decisión tipada y ajuste LoRA |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE; 20M entrenados con LoRA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se distribuye al menos Q8_0; otros niveles no confirmados) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo base en safetensors: samadpls/onepass-qwen3-0.6b) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only denso, y se ajusta mediante LoRA (20 millones de parámetros entrenados) para transformar la generación autoregresiva en una tarea de puntuación de decisiones tipadas. En lugar de generar una respuesta token a token, el modelo evalúa simultáneamente todas las opciones de todas las preguntas planteadas y devuelve una probabilidad por cada opción en una sola pasada. Las preguntas admiten tres tipos: sí/no (etiquetado internamente como "noul"), elección entre opciones ("choice") y selección de nivel en una escala ("level").

El entrenamiento utiliza 68.061 textos con 138.928 preguntas extraídas de 19 conjuntos de datos abiertos que cubren inferencia de lenguaje natural, análisis de sentimiento, detección de spam, clasificación de intenciones, moderación de contenido, emoción y preferencias humanas. La calibración se realizó sobre la distribución de respuestas de anotadores humanos (temperatura de calibración 1.0), lo que permite interpretar las probabilidades de salida como frecuencias esperadas de elección humana. No se menciona en la información disponible el uso de RLHF o DPO; el ajuste es supervisado sobre las distribuciones anotadas.

## Capacidades

- Clasificación de texto con salida probabilística calibrada sobre todas las opciones posibles.
- Respuesta a preguntas de tipo sí/no con probabilidad de verdadero y falso.
- Elección única entre un conjunto de opciones definido por el usuario.
- Selección de nivel en una escala (por ejemplo, calidad de un resumen o intensidad emocional).
- Evaluación simultánea de múltiples preguntas sobre un mismo texto en una sola pasada.
- Salida determinista y siempre bien formada: al leer puntuaciones en lugar de generar tokens, no hay riesgo de JSON malformado ni de texto fuera de formato.
- Enrutamiento y etiquetado para trazas de agentes, atención al cliente, facturas e incidentes de seguridad (categorías evaluadas explícitamente por el autor).
- Capacidad multilingüe: no disponible (solo inglés).
- Tool calling, function calling y razonamiento multi-paso generativo: no disponible (no es un modelo generativo).

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un mensaje de cliente, el modelo devuelve en una pasada la probabilidad de que requiera reembolso, la del equipo adecuado (facturación, técnico) y la del nivel de urgencia, con umbrales de confianza utilizables para derivación automática.
- Moderación de contenido: clasificación de comentarios según toxicidad, odio o emociones (entrenado con Civil Comments, Hate Speech Offensive, GoEmotions y Measuring Hate Speech), devolviendo probabilidades calibradas que permiten fijar umbrales sin reentrenar.
- Detección de spam en SMS y correo: uso de las probabilidades de sí/no para filtrar mensajes con un umbral ajustable según la tasa de falsos positivos tolerada.
- Clasificación de intenciones en asistentes conversacionales: elección entre intenciones predefinidas (estilo Banking77 o CLINC OOS) directamente desde el texto del usuario, sin generación y con latencia mínima.
- Verificación de soporte en pipelines RAG: dado un par pregunta/respuesta, el modelo estima la probabilidad de que la respuesta esté respaldada por el contexto (evaluado en RAGTruth), útil como filtro previo a la entrega al usuario.
- Etiquetado de calidad de resúmenes: selección de nivel sobre la calidad de un resumen generado (evaluado en SummEval), para filtrar salidas antes de publicarlas.
- Análisis de trazas de agentes: clasificación de pasos intermedios de un agente (categoría "agent traces" evaluada por el autor) para decidir si continuar, escalar o abortar una ejecución.
- Procesamiento de facturas: extracción de decisiones tipadas sobre documentos (categoría "invoices" evaluada con precisión de 0,614) como paso previo a un sistema de contabilidad.

## Benchmarks y rendimiento

Evaluado sobre el split de test de 400 casos (2.000 decisiones) de LocalLLaMA/typed-decisions, con las fórmulas del script oficial del benchmark. Exactitud: mayor es mejor; KL respecto al gold, Brier y ECE: menor es mejor.

| Modelo | Exactitud | KL desde gold | Brier | ECE |
|---|---|---|---|---|
| Qwen3-0.6B sin ajuste | 0,311 | 0,888 | 0,428 | 0,306 |
| Frecuencias de etiquetas del train split (ignora la entrada) | 0,481 | 0,327 | 0,181 | 0,036 |
| onepass 0.6B | 0,601 | 0,270 | 0,154 | 0,049 |

Exactitud por tipo de pregunta y por flujo de trabajo:

| Categoría | onepass 0.6B |
|---|---|
| Sí/no | 0,737 |
| Elección única | 0,518 |
| Selección de nivel | 0,561 |
| Trazas de agentes | 0,564 |
| Atención al cliente | 0,630 |
| Facturas | 0,614 |
| Incidentes de seguridad | 0,596 |

Conjuntos humanos retenidos (nunca vistos en entrenamiento):

| Conjunto | Siempre la respuesta más común | Exactitud antes → después |
|---|---|---|
| CondaQA (negación, sí/no) | 0,483 | 0,455 → 0,563 |
| Cosmos QA (sentido común, elección única) | 0,260 | 0,282 → 0,373 |
| SummEval (calidad de resumen, nivel) | 0,651 | 0,504 → 0,265 |
| RAGTruth (¿está respaldada la respuesta?, sí/no) | 0,768 | 0,704 → 0,752 |

El autor señala que la exactitud es mixta: mejora en CondaQA, Cosmos QA y RAGTruth, pero empeora en SummEval respecto al modelo base. Las probabilidades, sin embargo, mejoran en los cuatro conjuntos (el KL respecto al gold cae en todos).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q8_0 (el repo completo ocupa 1,0 GB); en cuantizaciones de 4 bits cabría en torno a 400-500 MB, aunque el autor solo distribuye explícitamente Q8_0.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; también funciona en CPU. No requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650, iGPU con suficiente memoria compartida) y en dispositivos de borde.
- Opciones de despliegue: llama.cpp directamente, el runtime propio onepass (servidor local con API HTTP en el puerto 8000 y página de demo), y el paquete Python `onepass[serve]` instalable vía uv. Compatible con endpoints de Hugging Face según los tags del repo.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de una única pasada sobre 0,6B de parámetros, la latencia esperada es del orden de milisegundos en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onepass-qwen3-0.6b | 596 M (20 M entrenados) | no disponible | Decisión tipada calibrada, una pasada | Apache-2.0 | GGUF en HF, código en GitHub |
| Qwen3-0.6B (base) | 596 M | no disponible en la información | Generación autoregresiva | Apache-2.0 | HF |
| onepass-qwen3-1.7b | no disponible | no disponible | Decisión tipada calibrada, una pasada | no disponible en la información | GGUF en HF (samadpls/onepass-qwen3-1.7b-GGUF) |

La comparación con clasificadores dedicados tipo BERT no está disponible en la información proporcionada. Frente al Qwen3-0.6B base, el ajuste mejora la exactitud de 0,311 a 0,601 en el benchmark de decisiones tipadas y reduce el ECE de 0,306 a 0,049, a costa de perder la capacidad generativa.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe declarado.
- No es un modelo generativo: no puede producir texto libre, código ni razonamiento abierto; su uso está restringido a preguntas tipadas con opciones predefinidas.
- La exactitud es mixta en conjuntos externos: en SummEval cae de 0,504 a 0,265 respecto al modelo base, por lo que no debe asumirse mejora universal.
- Las probabilidades están calibradas sobre poblaciones de anotadores humanos; pueden no reflejar la distribución de una aplicación concreta y requerir recalibración o ajuste de umbrales.
- Riesgo de sesgo heredado de los conjuntos de entrenamiento (Civil Comments, Hate Speech Offensive, Measuring Hate Speech, HelpSteer2), que reflejan sesgos de anotación de sus comunidades de origen.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de sobreconfianza en dominios alejados de los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-0.6B también es Apache-2.0; conviene verificar los términos de los conjuntos de datos de entrenamiento si se redistribuye.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- El modelo se creó en el contexto del Qwen Local Hackathon 2026; no hay evidencia de mantenimiento a largo plazo.
- No se especifica la longitud de contexto soportada, lo que impide garantizar el comportamiento con estados largos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/samadpls/onepass-qwen3-0.6b-GGUF
- Modelo base ajustado (safetensors): https://huggingface.co/samadpls/onepass-qwen3-0.6b
- Adaptador LoRA: https://huggingface.co/samadpls/onepass-qwen3-0.6b-lora
- Versión 1.7B en GGUF: https://huggingface.co/samadpls/onepass-qwen3-1.7b-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-0.6B
- Código y runtime: https://github.com/samadpls/onepass
- Benchmark de evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Hackathon de origen: https://github.com/junaiddshaukat/finetune-anywhere
- Sitio del autor: https://samadpls.com
