# jliu7350/internvl2_5-26b-mpo-hf

## Resumen

InternVL2_5-26B-MPO-hf es una conversión comunitaria de los pesos del modelo multimodal InternVL2.5-26B-MPO, desarrollado originalmente por OpenGVLab. El modelo original combina la arquitectura InternVL2.5 con Mixed Preference Optimization (MPO), una técnica de optimización de preferencias que mejora el rendimiento general en tareas multimodales. Esta conversión, realizada por el usuario jliu7350, adapta los pesos al formato nativo de Transformers (`InternVLForConditionalGeneration`), lo que facilita su uso con la biblioteca `transformers` sin necesidad de scripts adicionales.

El modelo cuenta con 25.514.186.112 parámetros y se distribuye bajo licencia MIT. OpenGVLab publica conversiones oficiales solo para los tamaños de 2B y 8B, por lo que esta versión de 26B cubre un hueco importante para quienes necesitan un modelo multimodal de mayor capacidad con integración directa en el ecosistema Hugging Face. La conversión ha sido validada reproduciendo los pesos oficiales del modelo de 8B de forma tensor-exacta, lo que da confianza sobre la fidelidad de los pesos convertidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVLForConditionalGeneration (multimodal, vision-lenguaje) |
| Parametros totales | 25.514.186.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo original InternVL2.5 soporta 32K, pero no se confirma en esta conversion) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision completa) |
| Idiomas soportados | no disponible (el modelo original es multilingue, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers-native) |

## Arquitectura y entrenamiento

El modelo base InternVL2.5-26B-MPO es un modelo multimodal de gran tamaño que combina un codificador de vision (InternViT) con un modelo de lenguaje (InternLM2.5). La serie InternVL2.5 se entrena con una combinacion de datos de imagen, video y texto, y utiliza tecnicas de escalado de modelo, datos y tiempo de inferencia para mejorar el rendimiento. La variante MPO aplica Mixed Preference Optimization, un metodo que combina preferencias humanas y automaticas para alinear mejor el modelo con las tareas objetivo.

Esta conversion concreta no modifica los pesos ni la arquitectura; simplemente reempaqueta los pesos originales de OpenGVLab al formato esperado por `transformers`. El proceso de conversion se realizo con el script oficial `convert_internvl_weights_to_hf.py` y se valido reproduciendo los pesos oficiales del modelo de 8B de forma tensor-exacta, tanto en la conversion directa como en la conversion inversa. Los archivos de tokenizador se tomaron de la version oficial de 8B, ya que son identicos entre los tamanos de 8B y 26B.

## Capacidades

- Procesamiento multimodal: el modelo puede recibir imagenes y texto como entrada, y generar respuestas de texto. Es adecuado para tareas de vision-lenguaje como captioning, respuesta a preguntas visuales (VQA) y razonamiento sobre imagenes.
- Generacion de texto: al estar basado en un modelo de lenguaje de 26B parametros, puede generar texto coherente y contextualizado en multiples idiomas (aunque no se especifican los idiomas exactos).
- Razonamiento y conocimiento: el tamaño del modelo y el entrenamiento con datos diversos le permiten abordar tareas de razonamiento complejo, aunque no se dispone de benchmarks especificos en esta conversion.
- Integracion con Transformers: al ser una conversion nativa, se puede cargar directamente con `AutoModelForImageTextToText` o `InternVLForConditionalGeneration` de la biblioteca `transformers`, lo que facilita su uso en pipelines existentes.
- No se han documentado capacidades especiales como tool calling, agentes o modo de pensamiento en la informacion disponible.

## Casos de uso

- Captioning de imagenes en produccion: el modelo puede generar descripciones detalladas de imagenes para aplicaciones de accesibilidad, catalogos de productos o moderacion de contenido. Su tamaño de 26B permite captar matices visuales que modelos mas pequenos pierden.
- Respuesta a preguntas visuales (VQA): en entornos de soporte tecnico o educativos, el modelo puede responder preguntas sobre diagramas, graficos o fotografias, integrandose en asistentes virtuales.
- Analisis de documentos escaneados: combinado con OCR, el modelo puede interpretar tablas, formularios y documentos con informacion visual, extrayendo datos estructurados para automatizacion de procesos.
- Generacion de contenido multimodal: para equipos de marketing o redaccion, el modelo puede generar textos descriptivos a partir de imagenes de productos, campanas o eventos, reduciendo el trabajo manual.
- Investigacion en IA multimodal: al ser una conversion de codigo abierto con licencia MIT, es util para experimentar con tecnicas de preferencia optimizacion (MPO) y comparar su rendimiento con otras variantes de InternVL2.5.
- Desarrollo de prototipos rapidos: gracias a su compatibilidad con `transformers`, se puede integrar en notebooks o APIs con pocas lineas de codigo, ideal para validar ideas antes de escalar a modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original InternVL2.5-26B-MPO ha sido evaluado por OpenGVLab en diversos benchmarks multimodales, pero estos datos no se incluyen en la documentacion de esta conversion. Se recomienda consultar la pagina del modelo original para obtener metricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 51.0 GB en precision completa (FP16/BF16), por lo que se necesitan al menos 51 GB de VRAM para cargar el modelo sin cuantizacion. Con cuantizacion de 8 bits se reduciria a aproximadamente 26 GB, y con 4 bits a unos 13 GB, aunque no se proporcionan archivos de cuantizacion en este repo.
- GPU recomendadas: para inferencia en FP16 se requiere una GPU con al menos 48 GB de VRAM, como A6000, A100 (80 GB) o H100. Con cuantizacion de 8 bits, una RTX 4090 (24 GB) podria ser suficiente, y con 4 bits, una RTX 3090 o 4080.
- Opciones de despliegue: al ser un modelo compatible con `transformers`, se puede servir con vLLM, TGI o directamente con la API de `transformers`. Para cuantizacion, se puede usar `bitsandbytes` o GPTQ, aunque no se incluyen archivos pre-cuantizados.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 26B en una A100 suele generar entre 20 y 40 tokens por segundo en tareas de texto, pero la latencia aumenta al procesar imagenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| InternVL2_5-26B-MPO-hf (este) | 25.5B | no disponible | MIT | safetensors | Conversion comunitaria, no oficial |
| OpenGVLab/InternVL2_5-26B-MPO | 25.5B | 32K (segun original) | MIT | original (no transformers) | Modelo original, requiere conversion |
| OpenGVLab/InternVL2_5-8B-MPO-hf | 8B | 32K | MIT | safetensors | Version oficial de 8B, mas ligera |
| Qwen2-VL-7B | 7B | 32K | Apache 2.0 | safetensors | Alternativa multimodal de menor tamano |

La comparativa se basa en datos publicos de los modelos originales; para este modelo concreto, el contexto no esta confirmado. La principal diferencia con el modelo original es el formato: esta conversion es directamente utilizable con `transformers`, mientras que el original requiere un paso de conversion. Frente a alternativas de menor tamano, este modelo ofrece mayor capacidad pero exige mas recursos.

## Limitaciones y advertencias

- Conversion no oficial: al ser un trabajo comunitario, no cuenta con el respaldo de OpenGVLab. Aunque se ha validado la fidelidad de los pesos, pueden existir diferencias sutiles en el comportamiento o en la compatibilidad con versiones futuras de `transformers`.
- Sin benchmarks propios: no se han publicado metricas de rendimiento para esta conversion, por lo que no se puede verificar su calidad en tareas especificas.
- Requisitos de hardware elevados: con 25.5B parametros, no es adecuado para entornos con recursos limitados; se necesita al menos una GPU de 24 GB con cuantizacion.
- Sesgos y alucinaciones: como cualquier modelo de lenguaje grande, puede generar contenido sesgado o inventar informacion, especialmente en contextos visuales ambiguos. No se han realizado evaluaciones de sesgo especificas.
- Limitaciones de idioma: aunque el modelo original es multilingue, no se especifican los idiomas soportados en esta conversion; se recomienda probar antes de usar en produccion.
- Licencia MIT: permite uso comercial y modificacion, pero el usuario es responsable del cumplimiento de las leyes aplicables y de la etica en el uso del modelo.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/jliu7350/internvl2_5-26b-mpo-hf
- Modelo original: https://huggingface.co/OpenGVLab/InternVL2_5-26B-MPO
- Coleccion InternVL2.5: https://huggingface.co/collections/OpenGVLab/internvl25
- Blog de InternVL2.5: https://internvl.github.io/blog/2024-12-05-InternVL-2.5/
- Repositorio GitHub de InternVL: https://github.com/OpenGVLab/InternVL
