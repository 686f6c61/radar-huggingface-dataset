# JustANormalTinkerer/hayai-ocr-v2-alpha

## Resumen

Hayai OCR v2 alpha es un modelo de OCR (reconocimiento óptico de caracteres) de código abierto desarrollado por JustANormalTinkerer. Está diseñado para transcribir texto directamente desde imágenes sin necesidad de una etapa previa de detección, combinando un encoder de visión SigLIP2 con un decoder Transformer causal. La versión alpha se encuentra en una fase temprana de entrenamiento (tras 4 épocas) y no está lista para producción.

La arquitectura usa un encoder de visión `google/siglip2-base-patch16-naflex` que produce características de 768 dimensiones, un proyector MLP que las proyecta al espacio de 512 dimensiones del decoder, y un decoder Transformer de 12 capas con atención de grupos (GQA), RoPE y RMSNorm. El vocabulario se basa en bytes UTF-8 con un tamaño de 260. El modelo soporta inglés, japonés, chino y coreano, aunque en esta fase muestra buenos resultados solo en japonés y falla a veces en coreano y chino.

El tamaño del repositorio es de 2.9 GB, lo que indica un modelo compacto. No se han publicado benchmarks ni especificaciones de contexto o licencia en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de visión SigLIP2 (base patch16 na-flex) + proyector MLP + decoder Transformer causal de 12 capas |
| Parámetros totales | no disponible (tamaño del repo: 2.9 GB) |
| Parámetros activos | No aplica (el modelo no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés, japonés, chino, coreano |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El encoder de visión es SigLIP2, con batching "naflex" que soporta imágenes de distintas relaciones de aspecto y tamaños sin redimensionado uniforme. Devuelve características visuales de dimensión 768, junto con máscaras de atención. El puente visión-lenguaje es un MLP con dos capas lineales y activación GELU, que proyecta de 768 a 512.

El decoder es un Transformer causal custom de 12 capas, con dimensión oculta 512, FFN de 2048, RMSNorm en lugar de LayerNorm, atención GQA (8 cabezas de consulta y 2 de clave/valor, dimensión de cabeza 64) y RoPE. La FFN utiliza SwiGLU con un mecanismo de clamping: la puerta se limita a un máximo de 10.0 y la proyección hacia arriba se limita a [-10.0, 10.0]. El enmascaramiento es block-causal: las características visuales actúan como prefijo, atendiendo entre sí pero no a tokens de texto futuros, mientras que los tokens de texto tienen máscara causal.

El tokenizador es un tokenizador de bytes a nivel UTF-8 con vocabulario de 260 tokens (bytes 0-255 más 4 especiales: BOS, EOS, PAD, UNK). La matriz de embeddings está compartida con la cabeza de salida.

El entrenamiento usa el dataset JustANormalTinkerer/hayai-dataset-merged. Esta versión alpha se ha entrenado durante 4 épocas y el decoder de lenguaje se inicializó desde cero. El autor reporta problemas de repetición, fallos en coreano y chino, y un buen rendimiento en japonés.

## Capacidades

- Extracción de texto de imágenes (OCR end-to-end) sin detección separada de cajas.
- Soporte de imágenes con relaciones de aspecto y tamaños variables gracias al batching naflex de SigLIP2.
- Generación autoregresiva de texto token a token.
- Reconocimiento de texto en inglés, japonés, chino y coreano (con limitaciones descritas).
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

Nota: Dado que se trata de una versión alpha experimental, estos casos se plantean como aplicaciones previstas una vez que el modelo madure, aunque algunas ya sean explorables.

- Digitalización de documentos japoneses: el modelo muestra buen rendimiento en japonés, por lo que podría emplearse para extraer texto de documentos escaneados, formularios o correos electrónicos en este idioma. Su arquitectura compacta lo hace adecuado para entornos con recursos limitados.
- OCR en aplicaciones móviles de captura: gracias al soporte de imágenes con relaciones de aspecto variables, podría integrarse en apps de escaneo de documentos donde las capturas no tienen un tamaño fijo.
- Prototipado de pipelines de OCR sin detección: al no requerir una etapa de detección de cajas, simplifica el desarrollo de flujos OCR de extremo a extremo para escenarios donde el texto es el único objetivo.
- Investigación en arquitecturas OCR ligeras: el modelo ofrece un diseño compacto (decoder de 512 dimensiones, 12 capas) que puede servir como base para experimentos de eficiencia y compresión.
- Extracción de texto en entornos multilingües: aunque actualmente falla en chino y coreano, su objetivo es cubrir esos idiomas, por lo que podría usarse en proyectos que necesiten OCR para varios idiomas asiáticos una vez mejorado.
- Integración en sistemas de archivado automático: el modelo podría utilizarse para indexar imágenes de archivo extrayendo su contenido textual, facilitando la búsqueda y el etiquetado automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 2.9 GB, lo que sugiere un modelo compacto, pero no hay especificaciones de VRAM oficiales.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- Despliegue: no se especifican frameworks de inferencia compatibles en la información disponible.
- Dado el tamaño, es probable que quepa en GPUs de consumo de gama media (por ejemplo, RTX 3060 o superiores), pero no hay confirmación oficial.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. En la búsqueda web se encontró la versión anterior "hayai-ocr-v2" (no alpha), que es el mismo proyecto antes de esta iteración. No se aportan especificaciones técnicas detalladas de esa versión, por lo que no es posible una comparativa completa. La siguiente tabla resume lo conocido:

| Modelo | Estado | Arquitectura | Parámetros | Contexto | Licencia |
|---|---|---|---|---|---|
| hayai-ocr-v2-alpha | Alpha experimental | SigLIP2 + decoder Transformer 12 capas | no disponible | no disponible | no disponible |
| hayai-ocr-v2 | Versión no alpha (misma familia) | SigLIP2 + decoder causal | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Versión alpha experimental: el autor declara explícitamente que no es apta para producción.
- Problemas de repetición: se observan salidas repetitivas tras 4 épocas de entrenamiento.
- Debilidad en coreano y chino: el modelo falla de forma intermitente en estos idiomas.
- Buen rendimiento solo en japonés: el autor indica que es "bastante bueno en japonés".
- Sin benchmarks publicados: no hay datos de rendimiento objetivos.
- Licencia no especificada: el uso comercial no está claro.
- Contexto no documentado: no se indica la longitud de la ventana de contexto.
- Sin cuantizaciones disponibles: no se proporcionan pesos cuantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2-alpha
- Versión no alpha (estable): https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/JustANormalTinkerer/hayai-dataset-merged
