# mradermacher/manaca-1b-base-GGUF

## Resumen

El modelo `manaca-1b-base-GGUF` es una cuantización en formato GGUF del modelo `menezesbruno/manaca-1b-base`, un modelo de lenguaje causal de 1.700 millones de parámetros entrenado específicamente para portugués, con especial atención al portugués de Brasil. La cuantización ha sido realizada por mradermacher, un conocido proveedor de versiones optimizadas de modelos open source, y ofrece múltiples niveles de compresión (desde Q2_K hasta f16) para adaptarse a distintos entornos de ejecución, desde CPU hasta GPU con poca memoria.

El modelo base está entrenado con los datasets `TucanoBR/GigaVerbo` y `wikimedia/wikipedia`, ambos en portugués, y se distribuye bajo licencia CC-BY-4.0, lo que permite uso comercial con atribución. Al ser un modelo base (no instruct), su uso principal es la generación de texto y el fine-tuning posterior para tareas específicas. La versión GGUF facilita su despliegue en herramientas como llama.cpp, Ollama o LM Studio, lo que lo hace accesible para desarrolladores que necesitan un modelo pequeño y eficiente en portugués.

La relevancia de este modelo radica en su tamaño compacto (1,7B) y su especialización en un idioma con menos recursos que el inglés, lo que lo convierte en una opción interesante para aplicaciones de procesamiento de lenguaje natural en portugués, especialmente en entornos con restricciones de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente basada en Llama, segun tags) |
| Parametros totales | 1.722.951.680 (1,7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | portugues (pt), incluyendo portugues de Brasil (pt-br) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base no se detalla en la informacion disponible. Los tags de HuggingFace indican que se trata de un modelo de tipo `llama` y `megatron-lm`, lo que sugiere una arquitectura transformer decoder-only similar a Llama, pero no se confirma el numero de capas, dimensiones de atencion ni otros hiperparametros. El modelo es causal LM, por lo que genera texto autoregresivamente.

El entrenamiento se realizo sobre los datasets `TucanoBR/GigaVerbo` y `wikimedia/wikipedia`, ambos en portugues. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Al ser un modelo base, no se ha sometido a un proceso de instruccion o chat, por lo que su salida es texto libre sin formato de dialogo.

La cuantizacion GGUF ha sido realizada por mradermacher, quien ha generado 12 versiones con diferentes niveles de compresion. No se proporcionan detalles sobre el proceso de cuantizacion (por ejemplo, si se uso imatrix o calibracion), aunque se menciona que existe una version separada con imatrix en `mradermacher/manaca-1b-base-i1-GGUF`.

## Capacidades

- Generacion de texto en portugues: el modelo produce texto coherente en portugues, tanto de Brasil como de Portugal, gracias a su entrenamiento en estos idiomas.
- Modelo base: no esta alineado para seguir instrucciones ni mantener dialogos, por lo que no soporta tool calling, function calling ni razonamiento multi-paso de forma nativa.
- Capacidades multilingues: limitadas al portugues; no se indica soporte para otros idiomas.
- Sin capacidades especiales: no incluye vision, audio ni modo thinking.
- Fine-tuning: al ser un modelo base, puede ser ajustado para tareas especificas como clasificacion, generacion de resumenes o extraccion de informacion en portugues.

## Casos de uso

- Generacion de contenido en portugues: el modelo puede redactar articulos, descripciones de productos o textos creativos en portugues. Su tamano reducido permite ejecutarlo en local sin necesidad de GPU de gama alta.
- Fine-tuning para clasificacion de texto: al ser un modelo base, puede ajustarse con un dataset etiquetado para tareas como analisis de sentimiento, deteccion de spam o categorizacion de documentos en portugues.
- Completado de texto en aplicaciones de escritura asistida: integrable en editores o herramientas de autocompletado para usuarios lusofonos, gracias a su capacidad de generar continuaciones coherentes.
- Prototipado rapido de aplicaciones NLP: su formato GGUF permite cargarlo con llama.cpp u Ollama en pocos minutos, ideal para validar ideas antes de escalar a modelos mas grandes.
- Procesamiento de documentos en entornos con recursos limitados: al ocupar entre 0,8 y 3,5 GB segun la cuantizacion, puede ejecutarse en CPU o en GPUs con poca VRAM, como una Raspberry Pi o un portatil sin GPU dedicada.
- Investigacion academica sobre modelos pequenos en portugues: sirve como punto de partida para estudiar el comportamiento de modelos de 1,7B en tareas de PNL en portugues, comparando con alternativas en otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo. Tampoco se comparan resultados con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Por ejemplo, Q4_K_M ocupa 1,2 GB, Q8_0 1,9 GB y f16 3,5 GB. Con la cuantizacion Q4_K_M, el modelo puede ejecutarse en GPU con 2 GB de VRAM o incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas (Q4_K_M o inferiores). Para Q8_0 o f16 se recomienda 4 GB o mas. No requiere GPU de gama alta.
- Compatibilidad con consumer GPU: si, cabe en GPUs como GTX 1650, RTX 3060, etc. Tambien puede ejecutarse en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier herramienta compatible con GGUF. Tambien puede usarse con la libreria transformers si se convierte a safetensors, aunque el formato nativo es GGUF.
- Latencia y throughput: no se proporcionan datos especificos. En una CPU moderna, se espera una velocidad de unos 10-20 tokens/segundo con cuantizacion Q4_K_M, y en GPU de gama media, 50-100 tokens/segundo, pero son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (modelos base de ~1,7B especializados en portugues). Existen otros modelos pequenos multilingues como los de la familia XLM-R o mT5, pero no son directamente comparables en arquitectura ni entrenamiento. Por tanto, no se puede realizar una comparativa fiable con los datos disponibles.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no ha sido entrenado para seguir instrucciones ni para mantener conversaciones seguras, por lo que puede generar contenido sesgado, ofensivo o incorrecto si se usa directamente en aplicaciones de usuario final.
- Sesgos conocidos: al entrenarse con datos de Wikipedia y GigaVerbo, puede reflejar los sesgos presentes en esos corpus, incluyendo estereotipos de genero, raza o cultura brasileña.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en tareas factuales.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero por su tamano es probable que sea limitada (tipicamente 2048 o 4096 tokens en modelos de esta escala). No apto para documentos largos.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial y modificacion, pero exige atribucion al autor original. No hay restricciones de uso militar o similar, pero se debe cumplir con los terminos de la licencia.
- Idioma: solo portugues. No se recomienda su uso en otros idiomas, ya que el rendimiento sera muy pobre.
- Produccion: al ser un modelo base, no esta listo para produccion directa en tareas de chat o asistencia; requiere fine-tuning y evaluacion exhaustiva.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/manaca-1b-base-GGUF
- Modelo base original: https://huggingface.co/menezesbruno/manaca-1b-base
- Version con imatrix: https://huggingface.co/mradermacher/manaca-1b-base-i1-GGUF
- Dataset TucanoBR/GigaVerbo: https://huggingface.co/datasets/TucanoBR/GigaVerbo
- Dataset wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
