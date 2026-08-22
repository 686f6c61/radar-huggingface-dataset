# mradermacher/Trendyol-Vision-Master-i1-GGUF

## Resumen

Trendyol-Vision-Master-i1-GGUF es una versión cuantizada del modelo de visión-lenguaje (VLM) `Trendyol/Trendyol-Vision-Master`, desarrollado por el equipo de datos de Trendyol, una plataforma de comercio electrónico turca. El modelo original está diseñado para tareas de comprensión de producto y moderación de catálogo en inglés y turco, y se distribuye bajo licencia CC-BY-4.0. Esta versión GGUF, preparada por el equipo de mradermacher, permite ejecutar el modelo en entornos con recursos limitados mediante cuantización de pesos, aunque solo se ofrece una variante de baja precisión (i1-Q2_K) en este repositorio.

El modelo base tiene aproximadamente 26,9 mil millones de parámetros, lo que lo sitúa en la categoría de modelos de gran tamaño para tareas multimodales. La cuantización reduce el tamaño a 10,8 GB, lo que posibilita su uso en GPUs de consumo con suficiente memoria, aunque la calidad puede verse degradada por la baja precisión. No se dispone de información detallada sobre la arquitectura interna, el contexto de entrenamiento o los datos utilizados, por lo que esta ficha se basa principalmente en los metadatos de HuggingFace y la model card del cuantizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 26.895.998.464 (26,9 B) |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K (también archivo imatrix para crear cuantizaciones propias; el repositorio estático incluye más variantes) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `Trendyol/Trendyol-Vision-Master`. Se sabe que es un modelo de visión-lenguaje (VLM) multimodal, diseñado para entender imágenes y texto en contextos de comercio electrónico. No se han publicado datos sobre el número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, ni innovaciones técnicas específicas (como atención lineal o decodificación especulativa). El cuantizador mradermacher aplica técnicas de imatrix para mejorar la calidad de los quantizados, pero no aporta información sobre el entrenamiento original.

## Capacidades

- Procesamiento de imágenes y texto: es un modelo multimodal que combina visión por computadora con generación de lenguaje, orientado a tareas de comprensión de productos.
- Moderación de catálogo: las etiquetas indican su uso para "catalog-moderation", es decir, revisión automática de productos, detección de contenido inapropiado o validación de imágenes.
- Entendimiento de producto: puede analizar atributos visuales y textuales de productos para clasificación, descripción o búsqueda.
- Multilingüe: soporta turco e inglés, lo que cubre los mercados principales de Trendyol.
- Tool calling y agentes: no se ha indicado si soporta function calling o razonamiento multi-paso; no hay evidencia en la información proporcionada.
- Capacidades especiales: al ser un VLM, incluye visión; no se mencionan modos de pensamiento, audio u otras modalidades.

## Casos de uso

- Moderación automática de imágenes de productos: el modelo puede analizar imágenes y detectar contenido inapcuado (por ejemplo, desnudos, violencia, marcas no autorizadas) para filtrar listados antes de su publicación. Su entrenamiento específico para e-commerce lo hace más fiable que modelos genéricos.
- Clasificación de productos en categorías: a partir de la imagen y el título, el modelo puede asignar automáticamente una categoría de producto, reduciendo el trabajo manual en catálogos grandes.
- Extracción de atributos de producto: puede identificar características visibles (color, patrón, material aparente) y generar descripciones estructuradas para enriquecer las fichas de producto.
- Búsqueda visual: al entender imágenes, puede implementarse un sistema de búsqueda donde el usuario sube una foto y el modelo devuelve productos similares del catálogo.
- Atención al cliente asistida por imagen: los clientes pueden enviar fotos de productos defectuosos o incorrectos y el modelo puede interpretar la imagen para generar una respuesta o derivar el caso al equipo adecuado.
- Traducción de atributos de producto: dado que soporta tr y en, puede ayudar a traducir descripciones de productos entre ambos idiomas, manteniendo el contexto visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye métricas como MMLU, HumanEval o GSM8K, y la model card del cuantizador solo menciona el tipo de cuantización, no el rendimiento del modelo base. Por tanto, no es posible comparar cuantitativamente este modelo con alternativas.

## Requisitos de hardware

- El archivo GGUF i1-Q2_K pesa 10,8 GB, lo que requiere al menos 11-12 GB de VRAM para cargar el modelo completo en memoria (sin incluir el proyector de visión, que se encuentra en el repositorio estático).
- Es probable que quepa en GPUs de consumo como la RTX 3090 (24 GB) o RTX 4090 (24 GB), y también en la RTX 3060 de 12 GB, aunque con riesgo de quedarse corta si se necesita espacio para el proyector de visión y el contexto.
- Para el modelo base en precisión completa (BF16) se estima una VRAM de 54,7 GB según LLM Explorer, por lo que la cuantización es esencial para uso en hardware comercial.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte para GGUF) o TGI, aunque el soporte de multimodalidad en estos frameworks puede ser limitado según la versión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros VLM especializados en e-commerce. El modelo base `Trendyol/Trendyol-Vision-Master` es de acceso abierto, pero no hay datos públicos de rendimiento frente a alternativas como Qwen2-VL, LLaVA o CogVLM. Se recomienda consultar la documentación original de Trendyol si se publica.

## Limitaciones y advertencias

- La cuantización i1-Q2_K es de baja precisión y puede provocar una degradación notable en la calidad de las respuestas, especialmente en tareas que requieren detalles finos de imagen o razonamiento complejo.
- No se han documentado sesgos específicos, pero al estar entrenado principalmente con datos de comercio electrónico de Trendyol, puede tener sesgos hacia el estilo de productos turcos y la estética de la plataforma.
- Riesgo de alucinación: como cualquier VLM, puede generar descripciones o atributos de producto que no coinciden con la imagen real. Debe usarse con supervisión humana en entornos de producción.
- La licencia cc-by-4.0 permite uso comercial, pero exige atribución y no impone restricciones de uso más allá de la licencia Creative Commons.
- El repositorio solo contiene un archivo GGUF de baja calidad; el proyector de visión (mmproj) está en el repositorio estático, por lo que para un uso multimodal completo hay que descargar ambos.
- No se dispone de información sobre la longitud de contexto, lo que puede limitar el uso en conversaciones largas o documentos extensos.

## Enlaces

- [Repositorio GGUF de mradermacher](https://huggingface.co/mradermacher/Trendyol-Vision-Master-i1-GGUF)
- [Repositorio estático de cuantizaciones](https://huggingface.co/mradermacher/Trendyol-Vision-Master-GGUF)
- [Modelo base de Trendyol](https://huggingface.co/Trendyol/Trendyol-Vision-Master)
- [Perfil de mradermacher](https://huggingface.co/mradermacher)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/Trendyol%2FTrendyol-Vision-Master,1JptJzmvI5pHJURX43dbjV)
