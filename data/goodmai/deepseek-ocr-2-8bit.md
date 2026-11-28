# goodmai/DeepSeek-OCR-2-8bit

## Resumen

DeepSeek-OCR-2-8bit es una conversión a 8 bits del modelo DeepSeek-OCR-2, un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y extracción de texto desde imágenes. El repositorio lo publica el usuario goodmai y deriva del formato MLX de `mlx-community/DeepSeek-OCR-2-8bit`, que a su vez se convirtió desde `prince-canuma/DeepSeek-OCR-2` con mlx-vlm 0.3.10. La tarea declarada en el pipeline es `image-text-to-text`, con soporte multilingüe.

El modelo cuenta con 3.389.119.360 parámetros (aproximadamente 3,39 mil millones) según los pesos en safetensors, y el repositorio ocupa 4,0 GB. Está pensado para ejecutarse en Apple Silicon mediante MLX y la aplicación Basalt, una herramienta nativa de macOS escrita en Swift. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en productos.

Su relevancia actual radica en la demanda de soluciones de OCR ligeras y desplegables en hardware de consumo, especialmente en el ecosistema Mac. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card es una plantilla de conversión y no incluye detalles técnicos del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `deepseekocr_2`, transformer de visión-lenguaje) |
| Parámetros totales | 3.389.119.360 (~3,39 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (versión publicada); el original admite otras según el repo upstream |
| Idiomas soportados | multilingüe (sin listado detallado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (conversión MLX); el original en transformers |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Las etiquetas indican `deepseekocr_2`, `vision-language` y `custom_code`, lo que sugiere un transformer multimodal con codificador visual y decodificador de lenguaje, pero no se especifican capas, dimensión oculta, mecanismo de atención ni estrategia de fusión multimodal. El pipeline `image-text-to-text` confirma que acepta imágenes y genera texto.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de datos OCR frente a texto general), ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente documenta el proceso de conversión: se generó con mlx-vlm 0.3.10 a partir de `prince-canuma/DeepSeek-OCR-2` y se publicó también en `mlx-community`. Cualquier innovación técnica del modelo original (por ejemplo, decodificación especulativa o atención lineal) no está descrita en la información disponible.

## Capacidades

- Extracción de texto desde imágenes (OCR) en modo image-text-to-text.
- Generación de descripciones de imágenes ("Describe this image").
- Procesamiento multilingüe según la etiqueta `language: multilingual`, aunque sin listado de idiomas concretos.
- Conversación multimodal (etiqueta `conversational`).
- Ejecución en Apple Silicon mediante MLX y la app Basalt.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio o visión más allá del OCR: no disponible.

## Casos de uso

- Digitalización de documentos en macOS: el modelo puede procesar imágenes de facturas, contratos o formularios y devolver el texto extraído, ejecutándose de forma local en Apple Silicon mediante MLX sin necesidad de enviar datos a la nube.
- Extracción de texto en aplicaciones de escritorio: integrable en la app Basalt (`basalt serve --pipeline-ocr-model ...`) para añadir OCR a un pipeline de generación de texto existente.
- Procesamiento de capturas de pantalla: útil para convertir capturas en texto editable en herramientas de productividad, aprovechando el formato 8 bits para reducir el uso de memoria.
- Preprocesado de datos para pipelines de IA: extracción de texto de imágenes escaneadas antes de alimentar modelos de lenguaje o sistemas RAG.
- Accesibilidad: lectura en voz alta de documentos impresos o imágenes con texto para usuarios con discapacidad visual, combinando el OCR con un sintetizador de voz.
- Archivado y búsqueda documental: indexación de textos extraídos de imágenes para motores de búsqueda internos, con la ventaja de que el modelo cabe en un equipo de consumo.
- Prototipado e investigación en visión-lenguaje: base para experimentos de OCR multilingüe en entornos con hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: con 3,39 B parámetros en 8 bits, los pesos ocupan aproximadamente 3,4 GB; el repositorio completo son 4,0 GB. La memoria efectiva de inferencia será superior por el codificador visual, el contexto y los buffers de activación (estimación orientativa, no confirmada).
- GPU recomendadas: el formato publicado es MLX, orientado a Apple Silicon (chips M1/M2/M3/M4). Para GPU NVIDIA no se documenta una ruta de despliegue en esta versión.
- Cabe en GPU de consumo: sí, en términos de tamaño de pesos; en Apple Silicon cabe en equipos con 8 GB o más de memoria unificada, aunque no se especifica el mínimo oficial.
- Opciones de despliegue: mlx-vlm (`python -m mlx_vlm.generate`), Basalt v0.11.0 (macOS 27+, Swift 6.4), y transformers con `trust_remote_code` para el formato original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| goodmai/DeepSeek-OCR-2-8bit | ~3,39 B | no disponible | Apache 2.0 | safetensors (MLX) | Conversión 8 bits para Apple Silicon |
| mlx-community/DeepSeek-OCR-2-8bit | no disponible | no disponible | Apache 2.0 | MLX | Origen directo de esta conversión |
| prince-canuma/DeepSeek-OCR-2 | no disponible | no disponible | no disponible | transformers | Modelo original del que deriva la cadena |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros modelos OCR de la misma categoría.

## Limitaciones y advertencias

- La model card es una plantilla de conversión; no documenta sesgos, tasas de error ni limitaciones específicas del modelo.
- Riesgo de alucinación inherente a los modelos generativos: puede producir texto que no aparece en la imagen, especialmente con documentos degradados o poco legibles.
- Cobertura idiomática declarada como "multilingual" sin listado; el rendimiento por idioma no está verificado.
- Longitud de contexto y resolución máxima de imagen no documentadas; imágenes de alta resolución o documentos muy extensos pueden requerir troceado.
- La versión publicada está en formato MLX y orientada a Apple Silicon; para otros entornos conviene usar el modelo original en transformers.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar la licencia y condiciones del modelo original (`prince-canuma/DeepSeek-OCR-2`) y de la cadena de conversión.
- Requiere `trust_remote_code` por el uso de `custom_code`, lo que implica ejecutar código del repositorio; auditar antes de usar en producción.
- Sin benchmarks publicados, no es posible garantizar calidad frente a alternativas comerciales de OCR.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/DeepSeek-OCR-2-8bit
- Modelo MLX de origen: https://huggingface.co/mlx-community/DeepSeek-OCR-2-8bit
- Modelo original: https://huggingface.co/prince-canuma/DeepSeek-OCR-2
- Basalt (repositorio): https://github.com/goodmai/basalt
- Basalt v0.11.0: https://github.com/goodmai/basalt/releases/tag/v0.11.0
- Web de Basalt: https://bas-alt.vercel.app
- Demo "Run with Basalt": https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FDeepSeek-OCR-2-8bit&role=ocr
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
