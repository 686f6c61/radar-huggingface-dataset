# mulkzz/kestrel-edu-ner-22l

## Resumen

`mulkzz/kestrel-edu-ner-22l` es un modelo de reconocimiento de entidades nombradas (NER) para token classification especializado en el dominio educativo coreano y orientado a la detección de información personal identificable (PII). Lo desarrolla el usuario `mulkzz` y se construye mediante fine-tuning del encoder `skt/A.X-Encoder-base` (149,33 M de parámetros totales, 110,93 M no pertenecientes a embeddings), al que se añade una cabeza BIO de 9 clases para las categorías `PERSON`, `SCHOOL`, `ORG` y `ADDRESS`.

El modelo es la pieza "profesora" (teacher) de un pipeline de destilación de conocimiento en dos etapas: su función principal es servir como referencia de alta precisión para entrenar un estudiante ligero de 6 capas (`mulkzz/kestrel-edu-ner-6l`) destinado al serving real en CPU. Por tanto, el 22l no está pensado para producción en tiempo real, sino como base de reproducción de la destilación, línea base offline de alta precisión y punto de partida para investigación posterior.

Su relevancia actual reside en el enfoque: un NER de PII educativa en coreano entrenado exclusivamente con datos sintéticos deterministas (24.000 documentos de entrenamiento, cero datos reales de estudiantes), con alineación sensible a partículas gramaticales y muestreo contrastivo de homónimos y homógrafos en el mismo minibatch. La licencia es Apache-2.0 y el idioma soportado es únicamente el coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `skt/A.X-Encoder-base`), 22 capas, cabeza de token classification BIO de 9 clases |
| Parametros totales | 149.329.161 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base A.X-Encoder soporta contexto largo, pero no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible para este checkpoint (el estudiante derivado se distribuye en INT8 ONNX; el teacher no indica cuantizaciones publicadas) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte del encoder `skt/A.X-Encoder-base` (commit `9708f9c`, `pad_token_id=49999`, donde `0` corresponde a `[CLS]`), una arquitectura tipo ModernBERT, y le superpone una cabeza de clasificación de tokens con esquema BIO de 9 etiquetas para cuatro tipos de entidad: `PERSON`, `SCHOOL`, `ORG` y `ADDRESS`. El fine-tuning se realizó sobre 24.000 documentos educativos sintéticos generados de forma determinista a partir de un banco congelado de 4.716 plantillas de 12 géneros de tareas docentes, con 3.000 ejemplos de desarrollo y 3.000 de test de una sola pasada. No se usaron datos reales de estudiantes ni datos generados por LLM externos.

La innovación técnica principal es el tratamiento de la morfología coreana: alineación sensible a partículas (`particle_aware`) y un muestreador contrastivo que coloca en el mismo minibatch pares homógrafos (`amb` frente a `amb_neg`) y homónimos (`D1=B`, donde un nombre de asignatura oficial etiquetado como `O` convive con un estudiante real etiquetado como `PERSON`). El entrenamiento usó AdamW con learning rates diferenciados (backbone 3e-5, clasificador 1e-4), weight decay 0,01, warmup ratio 0,06, grad clipping 1,0, batch efectivo 32 (micro-batch 16 × acumulación 2), bf16, aumento por sustitución dinámica de slots al 15 % y mezcla de ventanas multiescala (`W-400` al 30 %). Se seleccionó el checkpoint de 2,5 épocas (paso 2.494, 9,80 M tokens efectivos acumulados, `dev_loss=0,00262`), con parada temprana a las 4 épocas (`patience=3`).

## Capacidades

- Reconocimiento de entidades nombradas (NER) en coreano sobre texto educativo: personas, centros escolares, organizaciones y direcciones.
- Detección de PII en documentos docentes para tareas de anonimización o pseudonimización asistida.
- Distinción de homónimos y homógrafos: separa nombres de asignaturas o entidades públicas (etiqueta `O`) de nombres reales de estudiantes (`PERSON`).
- Alineación sensible a partículas gramaticales coreanas para delimitar correctamente los límites de entidad.
- Token classification a nivel de subtoken con mapeo de offsets para reconstruir entidades sobre el texto original.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido: es un encoder discriminativo de clasificación de tokens.
- Capacidad multilingüe limitada al coreano; no se declaran otros idiomas.

## Casos de uso

- Generación del estudiante ligero por destilación: el 22l actúa como profesor para producir las señales de entrenamiento del modelo de 6 capas (`kestrel-edu-ner-6l`), que es el que se recomienda para serving real. Se usaría ejecutando inferencia offline sobre el corpus sintético o sobre datos de dominio para generar logits o pseudoetiquetas.
- Línea base offline de alta precisión: para auditorías puntuales de PII en lotes de documentos educativos donde la latencia no es crítica, el teacher ofrece una referencia con `macro_core_recall` del 99,66 % en el test no visto.
- Evaluación de pipelines de anonimización: sirve como oráculo contra el que medir la calidad de sistemas de pseudonimización desplegados, comparando sus detecciones con las del teacher.
- Investigación en destilación de modelos: su configuración (teacher de 22 capas con 110,93 M de parámetros no-embedding frente a student de 6 capas con 30,69 M) permite reproducir experimentos de compresión con pérdida controlada de recall.
- Construcción de datasets etiquetados: puede preetiquetar corpus educativos coreanos para revisión humana posterior, acelerando la creación de conjuntos de entrenamiento supervisados.
- Análisis de sesgos y falsos positivos en detección de PII: el modelo reporta métricas específicas de `innocent_fp_item_rate` y `public_person_fp_rate`, útiles para estudiar la frontera entre entidades públicas y datos personales.
- Validación de esquemas de etiquetado: permite comparar el perfil `edu-v1` con otros esquemas de PII en el dominio educativo antes de fijar una taxonomía definitiva.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de desarrollo (3.000 ejemplos) y el test de una sola pasada no visto durante el entrenamiento (3.000 ejemplos), ventana `W-400`:

| Split | Modelo | macro_core_recall | overall_core_recall | PERSON | SCHOOL | ORG | ADDRESS | overall_tight_rate | homonym_student | innocent_fp_item |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| dev (3.000) | kestrel-edu-ner-22l (teacher) | 99,91 % | 99,69 % | 99,64 % | 100,0 % | 100,0 % | 100,0 % | 96,55 % | 99,65 % | 0,00 % |
| dev (3.000) | kestrel-edu-ner-6l (student) | 99,48 % | 98,95 % | 98,83 % | 99,09 % | 100,0 % | 100,0 % | 96,48 % | 98,26 % | 2,98 % |
| itest (3.000) | kestrel-edu-ner-22l (teacher) | 99,66 % | 98,75 % | 98,65 % | 100,0 % | 100,0 % | 100,0 % | 96,90 % | 100,0 % | 0,00 % |
| itest (3.000) | kestrel-edu-ner-6l (student) | 99,06 % | 97,34 % | 97,15 % | 99,07 % | 100,0 % | 100,0 % | 96,97 % | 94,06 % | 1,15 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible, dado que se trata de un modelo de token classification y no de generación.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (bf16/fp16): aproximadamente 0,3 GB de pesos, más overhead de activaciones según longitud de secuencia y batch; en la práctica cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: no requiere GPU dedicada; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. Para lotes grandes, cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification`; exportación a ONNX para serving en CPU (el estudiante derivado se distribuye en INT8 ONNX); compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Latencia y throughput: la model card indica que, en una instancia ECI `C-4` (4 vCPU), la latencia proyectada para 20.000 caracteres con 4 peticiones concurrentes es de aproximadamente 54,5 s, superando el límite de 40 s establecido para el gateway en tiempo real. Por eso el autor recomienda el modelo de 6 capas para serving en CPU. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (macro_core_recall, itest) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mulkzz/kestrel-edu-ner-22l (teacher) | 149,33 M totales / 110,93 M no-embedding | No disponible | 99,66 % | Apache-2.0 | Hugging Face |
| mulkzz/kestrel-edu-ner-6l (student) | 30,69 M no-embedding (69,56 MB INT8 ONNX) | No disponible | 99,06 % | Apache-2.0 | Hugging Face |
| skt/A.X-Encoder-base (modelo base) | 149,33 M | No disponible | No aplica (sin cabeza NER) | Apache-2.0 | Hugging Face |

No se dispone de comparación con otros modelos NER de PII en coreano en la información proporcionada.

## Limitaciones y advertencias

- El modelo es una herramienta de apoyo a la investigación y a la destilación; no garantiza la detección de toda la información personal ni constituye una exención de responsabilidad legal.
- No está pensado para serving en tiempo real en CPU: la latencia proyectada (unos 54,5 s para 20.000 caracteres con 4 peticiones concurrentes en 4 vCPU) supera el umbral operativo; para producción se recomienda el estudiante de 6 capas.
- El perfil de etiquetas `edu-v1` no incluye etiquetas auxiliares estructuradas; la model card menciona cinco limitaciones documentadas en detalle en la ficha del modelo de 6 capas.
- Riesgo de falsos positivos en nombres de personas públicas o cargos institucionales: la tasa `public_person_fp_rate` oscila entre el 2,08 % y el 31,25 % según la época, con un 10,42 % en el checkpoint final adoptado.
- Entrenado exclusivamente con datos sintéticos: puede no generalizar a variaciones reales de redacción, formatos o jerga no cubiertas por las 4.716 plantillas.
- Idioma limitado al coreano; no se declara soporte para otros idiomas ni para texto mixto coreano-inglés.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el propio autor advierte que el modelo no está validado para producción en tiempo real y que su uso previsto es la reproducción de la destilación y la línea base offline.
- No se han publicado evaluaciones de sesgos demográficos ni de robustez frente a texto adversarial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulkzz/kestrel-edu-ner-22l
- Modelo estudiante de 6 capas: https://huggingface.co/mulkzz/kestrel-edu-ner-6l
- Modelo base: https://huggingface.co/skt/A.X-Encoder-base
- README en inglés: https://huggingface.co/mulkzz/kestrel-edu-ner-22l/blob/main/README_en.md
