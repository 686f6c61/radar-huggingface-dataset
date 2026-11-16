# CordwainerSmith/GolemPII-v2-small

## Resumen

GolemPII-v2-small es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en hebreo. Lo desarrolla CordwainerSmith y se publica bajo licencia MIT. Es la variante compacta de la familia GolemPII v2, que incluye también los modelos base (277M parámetros) y tiny (45M parámetros). El modelo parte del encoder hebreo HalleluBERT_base y se afina para etiquetar 15 categorías de PII, desde nombres de persona y organizaciones hasta números de identidad, tarjetas de crédito, cuentas bancarias, direcciones, correos y teléfonos.

La relevancia del modelo radica en su especialización lingüística: la mayoría de detectores de PII comerciales están optimizados para inglés, mientras que el hebreo presenta retos específicos (escritura de derecha a izquierda, morfología rica, mezcla frecuente con inglés en entornos empresariales). GolemPII-v2-small ofrece un equilibrio entre tamaño (125M parámetros, menos de la mitad que el modelo base) y precisión, con un F1 a nivel de entidad de 0,917 en el benchmark REDACT PII hebreo y 0,942 en detección de nombres de persona sobre el corpus NEMO.

Con 125 millones de parámetros y un repositorio de 0,5 GB, el modelo está pensado para despliegues en producción donde el coste computacional y la latencia importan, como pipelines de redacción automática de documentos, anonimización de logs o cumplimiento normativo de privacidad en organizaciones que operan en hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa), basado en HalleluBERT_base |
| Parametros totales | 125.418.271 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana estándar de BERT/RoBERTa); el pipeline admite textos más largos con `stride` |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo RoBERTa, inicializado desde HalleluBERT_base (125M parámetros) y afinado para clasificación de tokens con 15 etiquetas de PII. La arquitectura sigue el esquema estándar de BERT/RoBERTa con atención bidireccional completa, lo que permite al modelo aprovechar el contexto a izquierda y derecha de cada token para desambiguar entidades (por ejemplo, distinguir un nombre de persona de un nombre de organización en hebreo).

El autor indica que el modelo comparte los mismos 15 labels y los mismos datos de entrenamiento que GolemPII-v2-base, aunque no se especifica en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset. La evaluación se realizó sobre la mitad `final` del benchmark REDACT PII (puntuada una sola vez tras el entrenamiento) y sobre el corpus NEMO, que según el autor nunca se utilizó en entrenamiento. No se detalla si hubo RLHF, DPO u otras técnicas de alineación, algo poco habitual en modelos de token classification.

## Capacidades

- Detección y etiquetado de 15 categorías de PII en texto hebreo, incluyendo nombres de persona, organizaciones, números de identidad, tarjetas de crédito, cuentas bancarias (formato IBAN), direcciones, códigos postales, correos electrónicos, teléfonos y fechas de nacimiento.
- Clasificación de tokens a nivel de carácter y de entidad, con métricas reportadas en ambas granularidades.
- Procesamiento de textos largos mediante `aggregation_strategy="simple"` y `stride` en el pipeline de Hugging Face, que permite trocear documentos de más de 512 tokens.
- Capacidad destacada en prosa hebrea para distinguir nombres de persona de organizaciones y palabras comunes, según el autor.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo de etiquetado, no generativo.
- Capacidad monolingüe: únicamente hebreo. No se reporta soporte para inglés u otros idiomas, aunque el modelo base pueda tener algún conocimiento residual.

## Casos de uso

- Redacción automática de documentos: el modelo identifica y permite sustituir entidades PII por marcadores (`[PERSON]`, `[CARD]`, etc.) en contratos, informes o expedientes antes de compartirlos con terceros o almacenarlos.
- Anonimización de logs y tickets de soporte: integrado en pipelines de ingestión, detecta correos, teléfonos, números de tarjeta e IBAN en texto hebreo mezclado con identificadores técnicos, reduciendo el riesgo en sistemas de observabilidad.
- Cumplimiento de privacidad y normativa: útil para organizaciones que operan bajo regulaciones israelíes de protección de datos, permitiendo auditar y sanear bases de datos textuales antes de exportaciones o análisis.
- Preprocesamiento para entrenamiento de modelos: elimina PII de corpus hebreos antes de usarlos para fine-tuning o investigación, evitando memorización de datos personales.
- Enmascarado en atención al cliente: en conversaciones multi-turno con clientes hebreoparlantes, el modelo puede ejecutarse sobre cada mensaje para redactar datos sensibles antes de que se almacenen o se envíen a sistemas externos.
- Detección de fugas de datos en correos corporativos: análisis de buzones y archivos exportados para localizar identificadores personales y evaluar el alcance de una brecha.
- Moderación y revisión de contenido generado: verificación de que textos sintéticos o plantillas no contienen PII real filtrada.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| REDACT PII Benchmark (hebreo, mitad held-out) | Precision (nivel de carácter) | 0,890 |
| REDACT PII Benchmark (hebreo, mitad held-out) | Recall (nivel de carácter) | 0,943 |
| REDACT PII Benchmark (hebreo, mitad held-out) | F1 (nivel de carácter) | 0,916 |
| REDACT PII Benchmark (hebreo, mitad held-out) | Precision (nivel de entidad) | 0,867 |
| REDACT PII Benchmark (hebreo, mitad held-out) | Recall (nivel de entidad) | 0,974 |
| REDACT PII Benchmark (hebreo, mitad held-out) | F1 (nivel de entidad) | 0,917 |
| NEMO corpus (nombres de persona) | Precision | 0,928 |
| NEMO corpus (nombres de persona) | Recall | 0,956 |
| NEMO corpus (nombres de persona) | F1 | 0,942 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB de pesos, más overhead de activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- En FP16/BF16: alrededor de 0,25 GB de pesos, ejecutable en GPUs de gama baja e incluso en CPU para lotes pequeños.
- GPU recomendadas: cualquier GPU moderna es suficiente; para alto throughput se recomiendan A100, H100, L4 o RTX 4090. Para desarrollo, una RTX 3060 o superior es más que suficiente.
- Cabe en GPUs de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: pipeline de `transformers`, `text-classification`/`token-classification` con `stride` para textos largos; exportación a ONNX; servidores de inferencia compatibles con modelos de Hugging Face (TGI, vLLM no aplica de forma nativa a encoders, pero puede servirse vía endpoints compatibles). `llama.cpp` y Ollama no son aplicables porque el modelo no es generativo.
- Latencia y throughput: no se han publicado cifras concretas. Por su tamaño (125M) y naturaleza encoder, se espera un throughput alto en GPU y una latencia de milisegundos por segmento de 512 tokens en hardware moderno, aunque estos valores no están confirmados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 REDACT (entidad) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GolemPII-v2-small (este) | 125M | 512 tokens | 0,917 | MIT | Hugging Face |
| GolemPII-v2-base | 277M | 512 tokens | No disponible en la informacion | MIT | Hugging Face |
| GolemPII-v2-tiny | 45M | 512 tokens | No disponible en la informacion | MIT | Hugging Face |

El autor indica que GolemPII-v2-base es preferible para texto empresarial hebreo mezclado con inglés y para mayor recall en números de identidad, tarjeta y banco; GolemPII-v2-tiny es unas cinco veces más rápido pero con menor precisión en texto empresarial. No se dispone de datos de benchmarks de modelos competidores externos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo hebreo. No está diseñado para detectar PII en inglés, árabe u otros idiomas, aunque el encoder base pueda tener algún conocimiento residual.
- Ventana de contexto de 512 tokens: requiere troceado con `stride` para documentos largos, lo que puede fragmentar entidades en los límites de los segmentos.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de falsos negativos en categorías menos representadas: el autor menciona que el modelo base tiene mejor recall en números de identidad, tarjeta y banco, lo que sugiere que la variante small puede ser más débil en esas categorías.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos: el modelo puede etiquetar como PII fragmentos que no lo son (por ejemplo, números que coinciden con formatos de tarjeta o IBAN).
- No se detalla la composición del dataset de entrenamiento ni posibles sesgos demográficos o de dominio; la evaluación se limita a REDACT y NEMO.
- Licencia MIT permite uso comercial, pero el usuario debe validar el rendimiento en su dominio concreto antes de desplegarlo en producción.
- No es un modelo generativo: no puede explicar sus decisiones ni razonar sobre el contexto más allá de la clasificación token a token.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CordwainerSmith/GolemPII-v2-small
- Modelo base de la familia: https://huggingface.co/CordwainerSmith/GolemPII-v2-base
- Variante tiny: https://huggingface.co/CordwainerSmith/GolemPII-v2-tiny
- Demo en Spaces: https://huggingface.co/spaces/CordwainerSmith/GolemPII-v2-demo
- Codigo de evaluacion: https://huggingface.co/CordwainerSmith/GolemPII-v2-base/tree/main/evaluation
- Modelo base HalleluBERT: https://huggingface.co/HalleluBERT/HalleluBERT_base
- Benchmark REDACT PII: https://huggingface.co/datasets/guneeshv/REDACT-PII-Benchmark
- Corpus NEMO: https://huggingface.co/datasets/imvladikon/nemo_corpus
- Sitio del autor: https://liranbaba.dev
