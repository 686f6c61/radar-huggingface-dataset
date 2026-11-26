# goodmai/GLM-OCR-8bit

## Resumen

GLM-OCR-8bit es una conversión al formato MLX, en cuantización de 8 bits, del modelo `zai-org/GLM-OCR`, un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y extracción de texto a partir de imágenes. La conversión la publica el usuario `goodmai` y está pensada para ejecutarse en Apple Silicon mediante la librería `mlx-vlm` (versión 0.3.11), lo que permite inferencia local en macOS sin depender de CUDA ni de Python en el caso del runtime Basalt que acompaña a la publicación.

El modelo cuenta con 1.107.405.824 parámetros (aproximadamente 1,1 mil millones), lo que lo sitúa en la gama compacta de modelos multimodales y lo hace viable en hardware de consumo. Está etiquetado con el pipeline `image-to-text` y el tipo de modelo `glm_ocr`, y declara soporte para ocho idiomas: chino, inglés, francés, español, ruso, alemán, japonés y coreano. La licencia es MIT, lo que facilita su uso comercial y su integración en productos.

Su relevancia actual radica en que ofrece una alternativa ligera y de código abierto para tareas de digitalización de documentos y extracción de texto estructurado, ejecutable en portátiles con chip Apple. Al ser una conversión de un modelo upstream, hereda las capacidades del original, aunque la model card publicada es muy escueta y no detalla el proceso de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión-lenguaje, tipo `glm_ocr`, conversión MLX de `zai-org/GLM-OCR`) |
| Parametros totales | 1.107.405.824 (≈1,1 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta versión); el repo upstream `mlx-community/GLM-OCR-8bit` sugiere que existen conversiones MLX equivalentes |
| Idiomas soportados | zh, en, fr, es, ru, de, ja, ko |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX), librería `transformers`, tag `mlx` |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo se distribuye bajo el tipo `glm_ocr` y la pipeline `image-text-to-text`, lo que indica un modelo multimodal que combina un codificador visual con un decodificador de lenguaje para producir texto a partir de imágenes. La conversión a MLX se realizó con `mlx-vlm` 0.3.11 a partir de `zai-org/GLM-OCR`, y la cuantización aplicada es de 8 bits.

Tampoco se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Para obtener estos detalles sería necesario consultar la model card del modelo original `zai-org/GLM-OCR`, que no forma parte de los datos proporcionados.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos.
- Extracción de texto a partir de imágenes (pipeline `image-to-text`).
- Generación de descripciones de imágenes, según el ejemplo de uso de la model card (`"Describe this image."`).
- Soporte multilingüe declarado para ocho idiomas: chino, inglés, francés, español, ruso, alemán, japonés y coreano.
- Ejecución local en Apple Silicon mediante MLX (`mlx-vlm`), sin necesidad de GPU NVIDIA.
- Integración con el runtime Basalt (macOS, Swift) para servir el modelo vía REST.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de documentos en macOS: el modelo puede procesar imágenes de páginas escaneadas y devolver el texto extraído, ejecutándose localmente en un Mac con Apple Silicon gracias a la conversión MLX y a la cuantización de 8 bits, lo que evita enviar documentos sensibles a servicios en la nube.
- Extracción de texto en aplicaciones de escritorio: mediante el runtime Basalt y su endpoint REST (`basalt serve ... --rest`), se puede integrar el OCR en una aplicación Swift nativa sin dependencias de Python.
- Procesamiento de facturas y recibos: al soportar varios idiomas (incluido el español), puede emplearse para extraer campos de documentos comerciales en flujos de contabilidad automatizada.
- Accesibilidad: conversión de imágenes con texto en audio o texto legible para usuarios con discapacidad visual, aprovechando la capacidad image-to-text del modelo.
- Archivado y búsqueda de documentos: indexación de texto extraído de imágenes para construir motores de búsqueda internos sobre archivos escaneados.
- Prototipado e investigación en visión-lenguaje: al ser un modelo de ~1,1 B parámetros con licencia MIT, es adecuado para experimentar con pipelines multimodales en hardware de consumo y para fine-tuning ligero.
- Digitalización multilingüe: procesamiento de documentos en chino, japonés, coreano, ruso, francés, alemán, inglés y español dentro de una misma aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: con 1,1 B parámetros en 8 bits, los pesos ocupan aproximadamente 1,1 GB (el repositorio completo pesa 1,6 GB), más el overhead del codificador visual y del runtime. Se estima un uso de memoria en torno a 2-4 GB, aunque no se confirma en la documentación.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips Apple Silicon (series M1, M2, M3, M4 y superiores). No se indica soporte nativo para GPU NVIDIA en esta conversión.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (16 GB o más recomendable). No se dispone de datos para GPUs NVIDIA consumer en esta versión.
- Opciones de despliegue: `mlx-vlm` (Python) mediante `python -m mlx_vlm.generate`; runtime Basalt v0.11.0 (macOS, Swift) con modo servidor REST; integración vía `transformers` según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, esta conversión deriva del modelo `zai-org/GLM-OCR` y existe una conversión equivalente publicada por `mlx-community/GLM-OCR-8bit`, que comparte arquitectura, parámetros y licencia, diferenciándose únicamente en el mantenedor de la conversión.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| goodmai/GLM-OCR-8bit | ≈1,1 B | no disponible | MIT | safetensors (MLX) | Hugging Face |
| mlx-community/GLM-OCR-8bit | ≈1,1 B (mismo origen) | no disponible | MIT | safetensors (MLX) | Hugging Face |
| zai-org/GLM-OCR (upstream) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- La model card es muy escueta y no documenta el proceso de entrenamiento, los datos utilizados ni los resultados de evaluación, lo que dificulta valorar su fiabilidad en producción.
- Al ser un modelo especializado en OCR, su rendimiento fuera de tareas de extracción de texto a partir de imágenes probablemente sea limitado; no se debe asumir capacidad de razonamiento general.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto que no aparece en la imagen, especialmente con imágenes de baja calidad o documentos complejos; se recomienda validación posterior en flujos críticos.
- Limitaciones de idioma: aunque declara ocho idiomas, no se especifica el nivel de cobertura ni la calidad por idioma.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo upstream `zai-org/GLM-OCR` y de los datos de entrenamiento originales.
- Esta conversión está orientada a MLX y Apple Silicon; no es directamente utilizable en entornos CUDA sin reconversión.
- El ejemplo de la model card para Basalt incluye una referencia a otro modelo (`goodmai/gemma-4-12B-it-qat-4bit`) como modelo principal del servidor, lo que puede confundir sobre el papel exacto del OCR en ese pipeline.
- No se dispone de información sobre límites de contexto, resolución máxima de imagen soportada ni latencia, aspectos críticos para dimensionar un despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/GLM-OCR-8bit
- Modelo upstream original: https://huggingface.co/zai-org/GLM-OCR
- Conversión MLX de referencia: https://huggingface.co/mlx-community/GLM-OCR-8bit
- Runtime Basalt (repositorio): https://github.com/goodmai/basalt/releases/tag/v0.11.0
- Sitio web de Basalt: https://bas-alt.vercel.app
- Demo de ejecución: https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FGLM-OCR-8bit&role=ocr
- Librería mlx-vlm: no disponible enlace directo en la información proporcionada
