# Potestates/qwen3.6-27b-frame-lora

## Resumen

El adaptador `Potestates/qwen3.6-27b-frame-lora` es un ajuste fino LoRA sobre el modelo multimodal `Qwen/Qwen3.6-27B`, desarrollado por el autor Potestates para el desafío ORena SAVE FOCUS, en la pista FRAME de respuesta a preguntas visuales (VQA) sobre objetos quirúrgicos extraños. El modelo base es un transformer híbrido que combina atención estándar con capas Gated DeltaNet, e integra una torre de visión y una torre de lenguaje. El adaptador se publica en formato PEFT con safetensors, ocupa 1,0 GB y se distribuye bajo licencia Apache-2.0.

La relevancia de este adaptador radica en su proceso de entrenamiento en dos etapas. La primera etapa es un ajuste supervisado convencional sobre los datos del desafío. La segunda etapa corrige un sesgo medible: el modelo base había aprendido a predecir la clase "clip" de forma casi incondicional, un sesgo de lenguaje que resultaba fatal en procedimientos fuera de distribución. El adaptador incorpora fotogramas de la base de datos SAR-RARP50 donde no hay clips, reduciendo la tasa de respuestas con "clip" del 89,4 % al 0,6 % en un conjunto de validación externo, con una ganancia neta de +1,14 puntos en la puntuación oficial.

El adaptador obtuvo una `pre_evaluation_score` de 0,5911 en el leaderboard oficial del desafío, con una latencia de 1,38 segundos por pregunta en un GPU L40S con el modelo base en FP8. Aunque no se han publicado benchmarks generales de razonamiento o código, la ficha documenta con detalle las capacidades y limitaciones en el dominio quirúrgico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención + capas Gated DeltaNet) sobre Qwen3.6-27B, con adaptador LoRA |
| Parametros totales | 27B (modelo base); parámetros del adaptador no especificados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bfloat16; el base se utilizó en FP8 en el desafío) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA); el modelo base también utiliza safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en `Qwen/Qwen3.6-27B`, un modelo multimodal de 27 mil millones de parámetros con una arquitectura híbrida que combina capas de atención convencionales con 48 capas Gated DeltaNet. El ajuste LoRA se aplica a 614 módulos distribuidos por toda la red: la torre de visión completa (atención, MLP, `patch_embed` y el `merger` de visión a lenguaje) y la torre de lenguaje completa, incluyendo las capas Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`). La configuración LoRA es `r=32`, `alpha=64`, `dropout=0.05`.

El entrenamiento se realizó en dos etapas. La primera consistió en un ajuste supervisado estándar sobre los datos del desafío ORena SAVE FOCUS. La segunda etapa abordó un problema específico detectado mediante sondas: el modelo había aprendido un prior lingüístico que le hacía responder "clip" en aproximadamente el 40 % de las respuestas, independientemente del contenido de la imagen. En procedimientos fuera de distribución, el 100 % de las respuestas que contenían "clip" eran incorrectas. Para corregirlo, se añadieron fotogramas de la base de datos SAR-RARP50 (EndoVis 2022, licencia CC BY-NC-SA 4.0) donde no hay clips presentes, con etiquetas de objetos extraños derivadas de máscaras de segmentación. Esta corrección redujo la tasa de respuestas con "clip" del 89,4 % al 0,6 % en 180 fotogramas de prostatectomía, aunque provocó un colapso en la diversidad de respuestas, ya que el modelo respondió "needle" en 172 de esos 180 fotogramas.

## Capacidades

- Respuesta a preguntas visuales de un solo fotograma sobre objetos quirúrgicos extraños: clips, esponjas, agujas, bolsas de especímenes y drenajes.
- Capacidad de indicar la ausencia de objetos extraños ("none") cuando no hay ninguno visible.
- Procesamiento de imágenes a resolución nativa, sin necesidad de redimensionar, gracias al soporte de resolución variable de Qwen3.6.
- Modo de razonamiento desactivado (`enable_thinking=False`) para optimizar el presupuesto de tokens y la latencia.
- Soporte de formato de respuesta con clases concretas y formato de conteo numérico, aunque este último es el punto más débil.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente en la información disponible.
- No se han documentado capacidades multilingües específicas; la interacción se describe en inglés.

## Casos de uso

- Auditoría de vídeos quirúrgicos: el adaptador procesa fotogramas de laparoscopia para identificar objetos extraños olvidados y generar alertas en sistemas de revisión postoperatoria. Su corrección del sesgo hacia "clip" lo hace más fiable en procedimientos fuera de distribución.
- Asistencia en quirófano: integrado en un pipeline de visión por computador, puede analizar fotogramas en tiempo real y responder a preguntas del cirujano sobre la presencia de objetos extraños. La latencia de 1,38 segundos por pregunta en un L40S permite su uso en sistemas de apoyo a la decisión.
- Investigación en VQA quirúrgico: sirve como referencia para estudiar cómo adaptar modelos de visión-lenguaje a dominios médicos específicos, especialmente en la corrección de sesgos de lenguaje en conjuntos de datos desequilibrados.
- Simulación y formación: se puede emplear para generar preguntas y respuestas a partir de fotogramas de cirugía, facilitando la creación de material didáctico para residentes de cirugía.
- Control de calidad de instrumentación: tras una intervención, el modelo analiza los fotogramas finales para verificar que no se ha dejado ningún objeto en el campo operatorio, complementando los recuentos manuales.
- Benchmarking de adaptadores LoRA en visión médica: el adaptador documenta un proceso de corrección en dos etapas y sus resultados, lo que lo convierte en una referencia para comparar técnicas de mitigación de sesgos en modelos multimodales.

## Benchmarks y rendimiento

| Categoría | Precisión |
|---|---|
| `aggregation` — in-distribution | 55.52 % |
| `aggregation` — out-of-distribution | 60.64 % |
| `object_recognition` — in-distribution | 68.54 % |
| `object_recognition` — out-of-distribution | 51.76 % |
| **pre_evaluation_score** (media no ponderada) | **59.11 %** |

El resultado oficial en el leaderboard del desafío fue de `pre_evaluation_score = 0.5911`, con el puesto 24. La latencia medida en el hardware del desafío (un GPU L40S con el modelo base en FP8) fue de 1,38 segundos por pregunta, sin respuestas perdidas ni preguntas sin responder. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 27B en FP16 requiere aproximadamente 54 GB; en FP8, unos 27 GB; en cuantización 4-bit, entre 14 y 16 GB. El adaptador LoRA añade un consumo marginal. No se ha publicado una cifra oficial para el adaptador.
- GPU recomendadas: L40S, A100, H100. En el desafío se utilizó un L40S de 48 GB con el base en FP8.
- Compatibilidad con GPU de consumo: no documentada. Un RTX 4090 de 24 GB podría ejecutar el modelo con cuantización 4-bit, pero no se ha verificado.
- Opciones de despliegue: Transformers + PEFT, vLLM, llama.cpp, Ollama y TGI. El código de ejemplo proporcionado usa Transformers y PEFT.
- Latencia y throughput: 1,38 segundos por pregunta en un L40S con FP8, con decodificación greedy y `max_new_tokens=32`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros adaptadores o modelos de la misma categoría. No se han publicado resultados comparativos con otros modelos de VQA quirúrgico ni con otros adaptadores LoRA sobre Qwen3.6-27B.

## Limitaciones y advertencias

- Sesgo residual: aunque se corrigió el sesgo hacia "clip", el adaptador colapsa la diversidad de respuestas en imágenes fuera de distribución, respondiendo "needle" en 172 de 180 fotogramas de prostatectomía.
- Punto débil en conteo: la categoría de conteo (`answer_format=number`) es la más débil y ha resistido todas las intervenciones probadas, incluyendo self-consistency, upsampling, pérdida ponderada por conteo y cabezas de densidad.
- Restricciones de licencia: el adaptador se distribuye bajo Apache-2.0, pero los datos de corrección SAR-RARP50 están bajo CC BY-NC-SA 4.0, lo que podría imponer restricciones a la distribución del adaptador si se considera obra derivada.
- Dependencia de instrucciones específicas: el modelo fue afinado con una pregunta concreta y sin system prompt. Añadir contexto, definiciones de objetos o el tipo de procedimiento degrada el rendimiento.
- Requisitos de preprocesado: no se debe redimensionar la imagen, hay que desactivar el modo de pensamiento (`enable_thinking=False`) y usar decodificación greedy; la decodificación con self-consistency pierde 1,7 puntos en preguntas de conteo.
- No se han documentado capacidades de tool calling, agentes ni soporte multilingüe.
- No se han publicado benchmarks generales de razonamiento, código o matemáticas.

## Enlaces

- HuggingFace: https://huggingface.co/Potestates/qwen3.6-27b-frame-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Datos de corrección SAR-RARP50: https://rdr.ucl.ac.uk/articles/dataset/24932529
