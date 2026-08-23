# sifat-febo/banglish-encoder

## Resumen

`banglish-encoder` es un modelo de tipo encoder basado en BERT, desarrollado por Sifat Febo, que aborda el problema del texto *banglish*: bengalí escrito en alfabeto latino con mezcla de inglés, muy común en foros y redes sociales. El modelo parte de la base `google/muril-base-cased` de Google y se somete a un reentrenamiento (further pretraining) con datos de texto informal y conversacional en banglish, lo que mejora significativamente su capacidad para representar esta variante lingüística.

Con 236,97 millones de parámetros y una arquitectura BERT estándar, este modelo ofrece un backbone de representación semántica que puede ser fine-tuneado para tareas como clasificación, búsqueda o extracción de características. Su relevancia actual radica en que los encoders multilingües existentes suelen estar entrenados sobre escritura bengalí estándar, mientras que la práctica real en internet usa una ortografía fonética no normalizada. Este modelo llena ese vacío.

La salida es un vector de 768 dimensiones por token, similar a BERT base, y el vocabulario permanece intacto respecto a MuRIL (197k tokens). Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamaño moderado lo hace desplegable en CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder bidireccional) |
| Parametros totales | 236.965.632 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Bengalí (bn), inglés (en), banglish (mezcla) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de tipo BERT, con 12 capas, 768 unidades de ocultación y 12 cabezas de atención, tal como el modelo base MuRIL. MuRIL ya incorpora un vocabulario multilingüe de 197k subword tokens que incluye tanto el bengalí como el inglés, y una arquitectura que permite representar múltiples idiomas y escrituras. `banglish-encoder` se construye sobre este modelo y se somete a un reentrenamiento adicional (further pretraining) con datos de texto banglish real, es decir, bengalí transliterado al alfabeto latino, con mezcla de palabras en inglés, errores ortográficos frecuentes, emojis y jerga de foros.

No se especifican en la documentación el número total de tokens de entrenamiento ni la composición exacta del dataset. No se menciona el uso de RLHF o DPO; el proceso se describe como un reentrenamiento de máscara de palabras (masked language modeling) sobre el modelo base, aunque el modelo final no incluye la cabeza de predicción de máscara, sino solo el backbone de codificación. Esta decisión permite que el modelo se integre fácilmente en pipelines de fine-tuning para tareas aguas abajo.

## Capacidades

- **Extracción de características**: produce vectores de 768 dimensiones por token, listos para usar en tareas de clasificación, búsqueda o agrupamiento.
- **Representación de banglish**: entiende la ortografía no estándar del bengalí en latino, incluyendo variaciones de una misma palabra (p. ej., "ami", "ami", "amii").
- **Multilingüismo**: conserva la capacidad del modelo base para bengalí y inglés, aunque con especialización en banglish.
- **Fine-tuning**: es compatible con cualquier arquitectura BERT, por lo que se puede adaptar a tareas como análisis de sentimiento, NER, respuesta a preguntas, etc.
- **Compatibilidad con la librería transformers**: se integra con Hugging Face, permitiendo uso con `AutoModel` y `AutoTokenizer`.
- **No incluye capacidades de generación de texto** (no es un modelo generativo), ni soporte de tool calling, ni visión, ni audio.

## Casos de uso

- **Análisis de sentimiento en redes sociales**: permite clasificar comentarios en banglish (p. ej., "ami kalke exam dibo, tension e achi") para monitorizar opiniones sobre marcas o temas.
- **Búsqueda semántica en foros de habla bengalí**: el modelo puede indexar publicaciones escritas en banglish y recuperar contenido relevante mediante embeddings, superando la limitación de los buscadores basados en palabras exactas.
- **Sistemas de recomendación de contenido**: al generar representaciones de texto informal, se pueden construir recomendadores de artículos, vídeos o productos en plataformas que sirven a la diáspora bengalí.
- **Detección de spam o discurso de odio**: al fine-tunear el encoder con datos etiquetados, se puede crear un clasificador robusto para moderar comunidades online que usan banglish.
- **Construcción de chatbots de atención al cliente**: el modelo sirve como base para un sistema de comprensión de lenguaje que entienda preguntas coloquiales en banglish, permitiendo respuestas automáticas.
- **Preprocesamiento para modelos generativos**: se puede usar como encoder para un modelo seq2seq, p. ej., en tareas de transliteración o corrección ortográfica de texto banglish a bengalí estándar.

## Benchmarks y rendimiento

La documentación del modelo reporta resultados en una tarea de predicción de palabra oculta (masked word prediction) sobre datos de banglish, comparando con el modelo base MuRIL:

| Modelo | Precisión en palabra oculta (banglish) |
|---|---|
| MuRIL (base) | 20.2 % |
| banglish-encoder | 43.0 % |

Además, se menciona un experimento adicional: un modelo de embeddings de oraciones entrenado sobre el encoder (denominado `banglish-embed`) reduce el número de errores en una tarea de recuperación de 48 a 26, en comparación con el mismo modelo entrenado sobre MuRIL. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GLUE en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo BERT base (236M parámetros), ocupa aproximadamente 1 GB en FP32 (el repo tiene 0.9 GB). En FP16 o cuantización de 8 bits, puede caber en menos de 0.5 GB.
- **GPU recomendada**: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1650, RTX 3060 o superiores. También puede funcionar en CPU, aunque la inferencia será más lenta.
- **Compatibilidad con consumer GPU**: sí, es un modelo pequeño y no requiere hardware de datacenter.
- **Opciones de despliegue**: se puede usar con la librería `transformers` de Hugging Face, con `torch` o `onnxruntime`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, pero al ser un encoder, se puede servir con frameworks como FastAPI o TensorFlow Serving.
- **Latencia y throughput**: no se han publicado datos específicos; en una GPU moderada (p. ej., RTX 3060) la inferencia de un texto de 128 tokens debería ser de unos pocos milisegundos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|---|
| banglish-encoder (este) | BERT | 236M | No disponible | Apache-2.0 | Banglish |
| google/muril-base-cased | BERT | 236M | 512 (base) | Apache-2.0 | Multilingüe (17 idiomas) |
| bert-base-multilingual-cased | BERT | 178M | 512 | Apache-2.0 | Multilingüe (104 idiomas) |

El modelo se diferencia de MuRIL en que ha sido reentrenado específicamente sobre datos banglish, mejorando la representación de esta variante. Comparado con `bert-base-multilingual-cased`, su ventaja es la cobertura de la escritura fonética informal. No hay modelos similares específicos para banglish en la información proporcionada.

## Limitaciones y advertencias

- **Entrenado en líneas cortas e informales**: el modelo no está optimizado para documentos largos ni para lenguaje formal o académico.
- **Sin cabeza de MLM**: el modelo se distribuye solo como backbone, por lo que no se puede usar directamente para predicción de palabra oculta; requiere fine-tuning para tareas concretas.
- **Riesgo de alucinación**: al ser un encoder, no genera texto, por lo que no alucina, pero puede propagar sesgos presentes en los datos de entrenamiento.
- **Sesgos conocidos**: no se han documentado sesgos específicos, pero al entrenarse en datos de foros, podría reflejar el lenguaje de un grupo demográfico concreto (p. ej., joven, urbano).
- **Vocabulario restringido**: el vocabulario de MuRIL incluye 197k tokens, pero no cubre todas las variantes ortográficas posibles del banglish, por lo que algunos términos pueden quedar fuera del vocabulario.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base MuRIL también es Apache 2.0, sin restricciones adicionales.
- **Despliegue en producción**: al ser un encoder, la inferencia es rápida, pero se recomienda validar su rendimiento en el dominio específico antes de usarlo en sistemas críticos.

## Enlaces

- [Hugging Face - sifat-febo/banglish-encoder](https://huggingface.co/sifat-febo/banglish-encoder)
- [Modelo base: google/muril-base-cased](https://huggingface.co/google/muril-base-cased)
- [Modelo de embeddings relacionado: sifat-febo/banglish-embed](https://huggingface.co/sifat-febo/banglish-embed) (mencionado en la documentación)
- [Modelo de conversación banglish (no relacionado directamente): sifat-febo/banglish-companion](https://huggingface.co/sifat-febo/banglish-companion) (referencia de búsqueda web)
