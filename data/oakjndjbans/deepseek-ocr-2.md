# oakjndjbans/DeepSeek-OCR-2

## Resumen

DeepSeek-OCR 2 es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres y conversión de documentos a texto estructurado. Lo desarrolla DeepSeek AI (el repositorio analizado, oakjndjbans/DeepSeek-OCR-2, es un espejo de terceros del oficial deepseek-ai/DeepSeek-OCR-2) y se publica junto al artículo arXiv:2601.20552, "DeepSeek-OCR 2: Visual Causal Flow", continuación del trabajo arXiv:2510.18234 sobre compresión óptica de contexto.

El modelo cuenta con 3.389.119.360 parámetros (unos 3,39 mil millones), se distribuye en safetensors y usa la etiqueta de arquitectura deepseek_vl_v2. Su tarea es la pipeline image-text-to-text: recibe una o varias imágenes de páginas y devuelve texto, markdown o markdown con información de layout (grounding). Frente a un OCR clásico, integra un codificador visual que comprime la página en un número reducido de tokens visuales, lo que abarata el coste de contexto.

Es relevante ahora porque la digitalización de documentos sigue siendo un cuello de botella en pipelines de RAG y de agentes: en lugar de alimentar un LLM con imágenes completas o con OCR ruidoso, DeepSeek-OCR 2 produce markdown estructurado y comprimido. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje, etiqueta `deepseek_vl_v2` (codificador visual + decodificador de texto); detalles internos no disponibles |
| Parámetros totales | 3.389.119.360 (≈3,39 mil millones), dato real de los safetensors |
| Parámetros activos | No disponible (no se confirma que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo contiene safetensors y la inferencia documentada usa `torch.bfloat16` |
| Idiomas soportados | Multilingüe (etiqueta del autor; no se detalla la lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamaño del repositorio: 6,8 GB) |
| Pipeline | image-text-to-text (la etiqueta también incluye feature-extraction) |
| Resolución dinámica | Por defecto (0-6)×768×768 + 1×1024×1024, que producen (0-6)×144 + 256 tokens visuales |
| Modos de prompt | `<image>\n<\|grounding\|>Convert the document to markdown.` y `<image>\nFree OCR.` |
| Dependencias | torch 2.6.0, transformers 4.46.3, tokenizers 0.20.3, einops, addict, easydict, flash-attn 2.7.3 |
| Repositorio | oakjndjbans/DeepSeek-OCR-2 (espejo de terceros), creado y actualizado el 2026-09-30, 0 descargas y 0 likes |

## Arquitectura y entrenamiento

La etiqueta de arquitectura del repositorio es `deepseek_vl_v2`, lo que sitúa al modelo en la familia de visión-lenguaje de DeepSeek. El modelo requiere `trust_remote_code=True` y está marcado con la etiqueta `custom_code`, por lo que su implementación no vive en el núcleo de transformers. A partir de la model card se deduce una estructura de dos partes: un codificador visual que procesa la imagen y un decodificador que genera texto, con soporte de resolución dinámica mediante `crop_mode=True`, `base_size=1024` e `image_size=768`.

La innovación principal documentada es la gestión de la resolución y de los tokens visuales. La página se trocea en mosaicos (tiles) de 768×768 —hasta seis— más un mosaico global de 1024×1024; cada mosaico se comprime a 144 tokens y el global a 256, de modo que una página completa ocupa como máximo unas 1.120 posiciones visuales. El artículo de la primera versión lo denomina "compresión óptica de contexto" y el de la segunda, "flujo causal visual". No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO.

## Capacidades

- OCR libre de maquetación mediante el prompt `Free OCR`, que devuelve el texto sin estructura.
- Conversión de documentos a markdown con grounding (delimitador `<|grounding|>`), preservando títulos, listas, tablas y orden de lectura.
- Entrada de imágenes con resolución dinámica: la misma sesión admite documentos de distinto tamaño y relación de aspecto.
- Salida guardada en disco mediante `output_path` y `save_results`, pensada para procesamiento por lotes y tratamiento de PDF.
- Procesamiento multilingüe según la etiqueta del autor.
- Aceleración de inferencia mediante vLLM, con instrucciones en el repositorio de GitHub del proyecto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking), audio o vídeo: no disponible.

## Casos de uso

- Digitalización de archivos y expedientes administrativos: el modelo convierte páginas escaneadas en markdown estructurado, conservando jerarquía de secciones y tablas, lo que permite indexar el contenido sin revisión manual página a página.
- Alimentación de pipelines RAG: al comprimir una página en unas 1.120 posiciones visuales como máximo, reduce el coste de contexto frente a enviar la imagen completa a un LLM multimodal y evita los errores típicos de un OCR sin modelo de lenguaje.
- Extracción de datos de facturas, albaranes y formularios: el prompt con grounding permite recuperar el texto junto con su posición, útil para mapear campos a un esquema estructurado en sistemas de contabilidad.
- Conversión de artículos científicos y documentación técnica: la resolución dinámica y el soporte de markdown facilitan reproducir fórmulas, tablas y notas al pie en repositorios de documentación.
- Accesibilidad y lectura asistida: integrado en un pipeline de TTS, permite leer en voz alta documentos escaneados que no tienen capa de texto, con orden de lectura correcto.
- Procesamiento masivo por lotes con vLLM: el modelo está preparado para inferencia acelerada y procesamiento de PDF, lo que encaja en trabajos nocturnos de digitalización de grandes volúmenes.
- Preprocesado para asistentes documentales: como paso previo a un modelo de lenguaje, transforma adjuntos escaneados en texto limpio que el asistente puede citar con referencias de página.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona el conjunto OmniDocBench como referencia de evaluación del ecosistema, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de precisión de OCR para este modelo.

## Requisitos de hardware

- Pesos: unos 6,8 GB en bfloat16 o float16, coherente con los 3.389.119.360 parámetros y el tamaño del repositorio.
- VRAM estimada para inferencia: 10-14 GB en bfloat16 si se activa la resolución dinámica completa (hasta siete mosaicos), sumando pesos, activaciones visuales y caché de claves y valores. Estimación propia, no confirmada por el autor.
- GPU recomendadas: A100 o H100 para servicio concurrente; RTX 4090 o RTX 3090 (24 GB) para uso individual con holgura.
- GPU de consumo: cabe en tarjetas de 24 GB sin problema; en 16 GB (RTX 4080, RTX 4070 Ti Super) es razonable esperar que funcione reduciendo `image_size` o el número de mosaicos; en 8-12 GB no hay datos y no existen cuantizaciones publicadas que lo faciliten.
- Opciones de despliegue: transformers con `flash_attention_2` y flash-attn 2.7.3; vLLM según el repositorio de GitHub del proyecto. No se documentan soportes de llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El autor cita como trabajos relacionados DeepSeek-OCR (primera versión), Vary, GOT-OCR2.0, MinerU y PaddleOCR, y usa OmniDocBench como referencia de evaluación. No se dispone de especificaciones de esos modelos en la información proporcionada, por lo que la comparación queda limitada a lo que consta del repositorio analizado.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de datos |
|---|---|---|---|---|
| DeepSeek-OCR 2 (este repositorio) | 3.389.119.360 | No disponible | Apache 2.0 | Parámetros y formato verificables; benchmarks no publicados |
| DeepSeek-OCR (v1) | No disponible | No disponible | No disponible | Solo citado como trabajo previo |
| GOT-OCR2.0 | No disponible | No disponible | No disponible | Solo citado en los agradecimientos |
| MinerU | No disponible | No disponible | No disponible | Solo citado en los agradecimientos |
| PaddleOCR | No disponible | No disponible | No disponible | Solo citado en los agradecimientos |

## Limitaciones y advertencias

- El repositorio analizado es un espejo de terceros (autor `oakjndjbans`), con 0 descargas y 0 likes; no hay verificación de integridad ni de correspondencia exacta con el modelo oficial.
- Requiere `trust_remote_code=True` y usa código personalizado, lo que implica ejecutar código del repositorio en la máquina local; conviene auditar los ficheros antes de usarlo en producción.
- No se publican datos de entrenamiento, composición del dataset ni procesos de alineación, por lo que los sesgos del modelo son desconocidos y no cuantificables.
- Riesgo de alucinación en OCR: en zonas ilegibles, sellos, manuscritos o escaneos degradados el modelo puede generar texto plausible pero inexistente; se recomienda validación en dominios críticos.
- La etiqueta de idiomas es "multilingual" sin listado ni métricas por idioma; el rendimiento relativo entre lenguas no está documentado.
- La longitud de contexto no está especificada, lo que dificulta planificar el procesamiento de documentos muy extensos o de muchas páginas en una misma sesión.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero esa licencia corresponde al repositorio espejo; conviene confirmarla en el repositorio oficial de DeepSeek AI.
- Las fechas de creación y actualización del repositorio (2026-09-30) y de los artículos citados son posteriores a la información disponible en la búsqueda web, lo que impide contrastar el estado del proyecto.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/oakjndjbans/DeepSeek-OCR-2
- Repositorio oficial en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- Repositorio de código: https://github.com/deepseek-ai/DeepSeek-OCR-2
- Artículo en PDF alojado en GitHub: https://github.com/deepseek-ai/DeepSeek-OCR-2/blob/main/DeepSeek_OCR2_paper.pdf
- Artículo arXiv de DeepSeek-OCR 2: https://arxiv.org/abs/2601.20552
- Artículo arXiv de DeepSeek-OCR: https://arxiv.org/abs/2510.18234
- Benchmark OmniDocBench: https://github.com/opendatalab/OmniDocBench
- Repositorio de DeepSeek-OCR (versión previa): https://github.com/deepseek-ai/DeepSeek-OCR
- Vary: https://github.com/Ucas-HaoranWei/Vary
- GOT-OCR2.0: https://github.com/Ucas-HaoranWei/GOT-OCR2.0
- MinerU: https://github.com/opendatalab/MinerU
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Sitio de DeepSeek: https://www.deepseek.com/
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Twitter de DeepSeek AI: https://twitter.com/deepseek_ai

Nota: las búsquedas web realizadas no devolvieron ningún resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
