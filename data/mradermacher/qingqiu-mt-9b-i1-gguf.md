# mradermacher/Qingqiu-MT-9B-i1-GGUF

## Resumen

Qingqiu-MT-9B es un modelo de traducción automática multilingüe desarrollado por WPS-Qingqiu, basado en la arquitectura Qwen3.5. El modelo está diseñado específicamente para tareas de traducción entre múltiples idiomas, con capacidades adicionales de seguimiento de instrucciones y generación de texto. Su relevancia actual se debe a que participa en el contexto de WMT26, la conferencia de traducción automática, y a que es un modelo abierto con licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas.

La versión aquí analizada, `Qingqiu-MT-9B-i1-GGUF`, es una cuantización realizada por mradermacher sobre el modelo base original. El repositorio ofrece 16 cuantizaciones distintas, desde IQ1_M (3.0 GB) hasta Q6_K (7.5 GB), todas generadas con el método imatrix para preservar la calidad en bajas precisiones. El modelo tiene 8.953.803.264 parámetros (aproximadamente 9B) y es un modelo de visión y lenguaje, lo que permite procesar entradas multimodales además de texto.

La relevancia de esta ficha radica en que ofrece una evaluación técnica para desarrolladores que necesitan desplegar un modelo de traducción multilingüe en entornos con recursos limitados, gracias a las cuantizaciones GGUF que permiten su ejecución en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5) |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | Multilingüe (no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix) |

## Arquitectura y entrenamiento

El modelo base, WPS-Qingqiu/Qingqiu-MT-9B, está construido sobre la arquitectura Qwen3.5, un transformer de última generación diseñado para tareas de traducción y comprensión multilingüe. Aunque no se han publicado detalles específicos sobre el proceso de entrenamiento, el hecho de que sea un modelo de traducción sugiere que fue entrenado con grandes corpus paralelos multilingües. Su naturaleza de "vision model" indica que incorpora un módulo de visión (mmproj) que permite procesar imágenes además de texto, aunque no se especifica si el modelo base fue entrenado con RLHF o DPO.

La cuantización GGUF generada por mradermacher utiliza el método imatrix (importance matrix), que calcula la importancia de los pesos basándose en la activación sobre un conjunto de datos de calibración, lo que reduce la pérdida de calidad en cuantizaciones agresivas. Los archivos están disponibles tanto en formato estático (en el repositorio separado `Qingqiu-MT-9B-GGUF`) como en formato i1 (imatrix).

## Capacidades

- Traducción automática multilingüe: el modelo está diseñado específicamente para tareas de traducción entre múltiples idiomas, con soporte para instrucciones de traducción.
- Seguimiento de instrucciones: puede interpretar comandos en lenguaje natural y ejecutarlos, lo que lo hace adecuado para tareas de ajuste fino de instrucciones.
- Capacidad de visión: es un modelo multimodal que puede procesar imágenes junto con texto, lo que permite tareas de traducción de texto en imágenes o descripción de imágenes.
- Conversación multilingüe: puede mantener diálogos en varios idiomas, lo que facilita su uso en aplicaciones de atención al cliente o asistentes.
- Generación de texto: además de traducción, puede generar texto en diferentes idiomas siguiendo instrucciones.

## Casos de uso

- Atención al cliente multilingüe automatizada: el modelo puede gestionar conversaciones con clientes en varios idiomas, traduciendo automáticamente las consultas y respuestas en tiempo real, reduciendo la necesidad de agentes humanos multilingües.
- Traducción de documentos técnicos: con su capacidad de visión, puede procesar documentos escaneados o imágenes con texto y traducirlos, lo que es útil para empresas que manejan documentación en distintos idiomas.
- Localización de software y contenido web: puede traducir interfaces de usuario, descripciones de productos y contenido web a múltiples idiomas, facilitando la internacionalización de aplicaciones.
- Asistentes de traducción en tiempo real: integrarlo en herramientas de chat o videoconferencia para proporcionar subtítulos o traducciones simultáneas, aprovechando su capacidad de conversación.
- Análisis de contenido en redes sociales: traducir publicaciones, comentarios y mensajes en distintos idiomas para moderación o análisis de sentimiento, con la capacidad de procesar imágenes.
- Generación de subtítulos multilingües: dado su soporte de visión, puede transcribir y traducir contenido de vídeo, generando subtítulos en varios idiomas automáticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base tiene etiquetas relacionadas con WMT26, lo que sugiere que participó en la conferencia de traducción automática, pero no se han incluido los resultados concretos en la model card ni en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Las versiones más pequeñas (IQ1_M, 3.0 GB) pueden caber en GPUs de 4-6 GB de VRAM, mientras que las más grandes (Q6_K, 7.5 GB) necesitan al menos 8-10 GB de VRAM.
- GPU recomendadas: para las cuantizaciones pequeñas, una NVIDIA RTX 3060 (12 GB) o RTX 4060 (8 GB) es suficiente. Para las más grandes, una RTX 4090 (24 GB) o A100 (40-80 GB) proporciona margen.
- Sí cabe en GPUs de consumo: las cuantizaciones IQ4_K_S (5.5 GB) y Q4_K_M (5.7 GB) caben en GPUs de 8 GB, y las más pequeñas en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores de inferencia como vLLM (con conversión a formato compatible).
- Latencia y throughput: no disponible, pero para un modelo de 9B en Q4_K_M, se puede esperar un throughput de 20-40 tokens/segundo en una RTX 4090 con llama.cpp.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qingqiu-MT-9B (este) | 8.95B | no disponible | Apache 2.0 | GGUF | Multilingüe, visión |
| Qwen2.5-7B-Instruct | 7.6B | 32K | Apache 2.0 | GGUF, safetensors | Generalista, no visión |
| NLLB-200-3.3B | 3.3B | 512 | MIT | safetensors | Especializado en traducción |
| M2M-100-12B | 12B | 1024 | MIT | safetensors | Traducción multilingüe |

La comparativa es limitada porque no hay datos de benchmark de Qingqiu-MT-9B. Sin embargo, su arquitectura basada en Qwen3.5 y su capacidad de visión lo diferencian de modelos de traducción clásicos como NLLB o M2M-100, que son solo texto y tienen ventanas de contexto muy cortas. Frente a Qwen2.5-7B, comparte la base arquitectónica pero Qingqiu está especializado en traducción y visión.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado estudios de sesgo para este modelo, pero al ser un modelo multilingüe puede presentar sesgos culturales o de género en las traducciones.
- Riesgo de alucinación: como la mayoría de los modelos de lenguaje, puede generar contenido no fiel al original en traducciones largas o ambiguas, especialmente en cuantizaciones agresivas.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, pero los modelos basados en Qwen3.5 suelen soportar 32K tokens; sin embargo, para traducción, contextos muy largos pueden degradar la calidad.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base original.
- Caveats de producción: las cuantizaciones por debajo de Q4_K_S pueden degradar significativamente la calidad de la traducción, especialmente en idiomas con escrituras complejas. Además, el modelo es de visión, por lo que requiere un archivo mmproj para usar esa capacidad, que se encuentra en el repositorio estático.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/Qingqiu-MT-9B-i1-GGUF
- Repositorio GGUF estático: https://huggingface.co/mradermacher/Qingqiu-MT-9B-GGUF
- Modelo base: https://huggingface.co/WPS-Qingqiu/Qingqiu-MT-9B
- Página de descargas de mradermacher: https://hf.tst.eu/model
- Perfil de mradermacher: https://huggingface.co/mradermacher
