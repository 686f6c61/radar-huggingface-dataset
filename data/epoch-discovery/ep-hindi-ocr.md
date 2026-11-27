# epoch-discovery/ep-hindi-ocr

## Resumen

ep-hindi-ocr es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) para hindi y escritura devanagari, desarrollado por epoch-discovery. Se trata de un fine-tuning de nvidia/Nemotron-3.5-Parse, el modelo de parsing de documentos de NVIDIA, adaptado específicamente al dominio de documentos en hindi. El modelo resuelve el problema de extraer texto estructurado de imágenes de documentos (escaneos, capturas, fotografías) en un idioma con escasa representación en los pipelines de document AI convencionales.

Con 630,8 millones de parámetros y un tamaño de repositorio de 2,5 GB, es un modelo compacto que puede desplegarse en hardware modesto. Utiliza la arquitectura nemotron_parse (definida con código personalizado en la librería transformers) y se distribuye en formato safetensors. Su pipeline es image-text-to-text, es decir, recibe una imagen y genera texto como salida conversacional.

El modelo es relevante porque cubre un nicho poco atendido: el OCR de alta calidad para devanagari en entornos de document AI. Al derivar de Nemotron-3.5-Parse, hereda la filosofía de parsing estructurado de documentos, pero con acceso restringido (gated) en Hugging Face y una licencia específica (indic-open-model-license-v1.0) que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_parse (transformer multimodal imagen-texto, código personalizado) |
| Parametros totales | 630.800.504 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi) |
| Licencia | indic-open-model-license-v1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura nemotron_parse de NVIDIA, un transformer multimodal diseñado para el parsing de documentos que combina un codificador visual con un decodificador de texto. Al ser un fine-tuning de nvidia/Nemotron-3.5-Parse, conserva la estructura del modelo base y adapta sus pesos al dominio del hindi y la escritura devanagari. La implementación requiere `trust_remote_code=True` en transformers, ya que la arquitectura se distribuye con código personalizado.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de fine-tuning, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas del fine-tuning más allá de la adaptación al dominio hindi. El tamaño de 630,8 millones de parámetros sugiere un modelo compacto, probablemente con un codificador visual ligero y un decodificador de escala pequeña-media, orientado a inferencia eficiente en tareas de OCR.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos en hindi y escritura devanagari.
- Parsing de documentos: extracción de texto estructurado a partir de imágenes, heredado del modelo base Nemotron-3.5-Parse.
- Generación de texto conversacional a partir de entrada imagen-texto (pipeline image-text-to-text).
- Procesamiento de documentos escaneados, fotografías y capturas con contenido en devanagari.
- Soporte multilingüe limitado al hindi según la información disponible; no se documentan otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No se documentan capacidades de audio ni visión más allá del OCR de documentos.

## Casos de uso

- Digitalización de archivos administrativos en hindi: el modelo puede procesar escaneos de formularios, certificados y documentos oficiales en devanagari para convertirlos en texto editable, aprovechando su especialización en OCR hindi.
- Extracción de datos de facturas y recibos: integrado en un pipeline de document AI, permite leer campos estructurados de documentos comerciales en hindi y volcarlos a bases de datos.
- Procesamiento de prensa y publicaciones históricas: digitalización de periódicos y libros en devanagari para su archivado y búsqueda full-text.
- Automatización de entrada de datos en back office: sustitución de la transcripción manual de documentos en hindi por inferencia del modelo, reduciendo errores y costes operativos.
- Accesibilidad documental: conversión de imágenes de documentos en hindi a texto que pueda ser leído por lectores de pantalla o traducido posteriormente.
- Enriquecimiento de corpus para NLP en indic: generación de texto limpio en hindi a partir de fuentes visuales para alimentar datasets de entrenamiento o análisis lingüístico.
- Verificación KYC y onboarding: lectura de documentos de identidad o direcciones en hindi dentro de flujos de validación automatizada, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y codificador visual; en la práctica, se recomienda al menos 6-8 GB de VRAM.
- VRAM estimada en fp16/bf16: alrededor de 1,3 GB para pesos, con un mínimo práctico de 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, dado su tamaño compacto de 630,8 millones de parámetros.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por la arquitectura personalizada); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| epoch-discovery/ep-hindi-ocr | 630,8 M | no disponible | hindi | indic-open-model-license-v1.0 | gated |
| nvidia/Nemotron-3.5-Parse (base) | no disponible | no disponible | multilingüe (no detallado) | no disponible | no disponible |
| Alternativas OCR hindi de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de OCR específico para hindi en la documentación proporcionada. La comparación más directa es con su modelo base, nvidia/Nemotron-3.5-Parse, del que hereda arquitectura y capacidades de parsing, pero cuyos detalles de licencia y acceso no se especifican en la información disponible.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede ralentizar la integración en pipelines automatizados.
- Licencia indic-open-model-license-v1.0: es una licencia específica que debe revisarse con detalle antes de cualquier uso comercial; no se garantiza su compatibilidad con todos los casos de producción.
- Idiomas limitados al hindi: no se documenta soporte para otras lenguas de la India ni para inglés, lo que restringe su uso en documentos bilingües.
- Riesgo de alucinación: como modelo generativo, puede producir texto plausible pero incorrecto en zonas de la imagen degradadas, con baja resolución o con tipografías poco habituales; se recomienda validación humana en flujos críticos.
- Sesgos desconocidos: no se documenta información sobre sesgos del dataset de entrenamiento ni sobre la representatividad de las variantes de devanagari cubiertas.
- Requiere `trust_remote_code=True`: la arquitectura personalizada implica ejecutar código del repositorio, lo que añade un riesgo de seguridad que debe evaluarse en entornos controlados.
- Sin benchmarks publicados: no hay métricas objetivas de precisión de OCR que permitan comparar su rendimiento con alternativas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario limitados.
- No se documentan límites de contexto ni resolución máxima de imagen soportada.

## Enlaces

- Hugging Face: https://huggingface.co/epoch-discovery/ep-hindi-ocr
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Licencia indic-open-model-license-v1.0: no disponible enlace directo en la información proporcionada
- Paper, blog o repositorio adicional: no disponible
