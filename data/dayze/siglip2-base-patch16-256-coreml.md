# dayze/siglip2-base-patch16-256-coreml

## Resumen

SigLIP 2 B/16-256 para Core ML es una conversión del codificador visión-lenguaje `google/siglip2-base-patch16-256` de Google, publicada por el usuario dayze para su uso en Dayze Desktop como motor de búsqueda de fotos en local. El modelo original pertenece a la familia SigLIP 2, presentada en el artículo *SigLIP 2: Multilingual Vision-Language Encoders with Improved Semantic Understanding, Localization, and Dense Features* (arXiv:2502.14786), y está diseñado para tareas de alineación imagen-texto como clasificación zero-shot y recuperación imagen-texto.

La relevancia de esta conversión concreta es que traslada un codificador de doble torre a Core ML con cuantización de pesos de 8 bits, lo que permite ejecutar inferencia completamente en dispositivo (CPU y Neural Engine) sin enviar imágenes a servidores externos. El repositorio incluye dos paquetes `.mlpackage` separados, uno para la torre de imagen y otro para la de texto, además del tokenizador y el preprocesamiento copiados sin cambios del modelo base.

El modelo conserva la licencia Apache 2.0 del original y no ha sido reentrenado: las únicas modificaciones son la conversión a Core ML y la paletización de pesos a 8 bits. El tamaño total del repositorio es de aproximadamente 0,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de doble torre (imagen + texto), base SigLIP 2 con parches de 16x16 y resolución 256 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de codificación imagen-texto, no generativo) |
| Tipos de cuantizacion | Pesos paletizados a 8 bits (8-bit palettized); torre de texto con embedding no agrupado |
| Idiomas soportados | no disponible en la información proporcionada (el artículo original describe capacidades multilingües) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage`); tokenizador y preprocesamiento en formato original del modelo base |

## Arquitectura y entrenamiento

El modelo subyacente es SigLIP 2, un codificador visión-lenguaje de doble torre que proyecta imágenes y texto a un espacio latente común mediante una función de pérdida tipo sigmoide (SigLIP). La variante B/16-256 utiliza parches de 16x16 píxeles sobre imágenes de 256x256 y una torre de texto independiente. No se trata de un modelo generativo: no produce texto libre, sino embeddings alineados que permiten comparar similitud entre imagen y texto.

La conversión a Core ML separa ambas torres en dos paquetes independientes. La torre de imagen (`siglip2_b16_256_Image_pal8.mlpackage`, ~89 MB) y la torre de texto (`siglip2_b16_256_Text_pal8ng.mlpackage`, ~458 MB) aplican paletización de pesos a 8 bits. Según la model card, no hubo reentrenamiento ni ajuste fino: los pesos provienen de la revisión `3f9f96cb90da5dbc758b01813f2f6f1aee24c1ab` del modelo original de Google. El tokenizador y los ficheros de preprocesamiento se copian sin cambios. El repositorio incluye un fichero `SHA256SUMS` con checksums para que los clientes verifiquen la integridad de cada fichero tras fijar una revisión.

## Capacidades

- Clasificación de imágenes zero-shot: asigna etiquetas textuales arbitrarias a una imagen sin entrenamiento específico.
- Recuperación imagen-texto (text→image y image→text) mediante similitud de embeddings.
- Búsqueda semántica de fotos en local: indexación de imágenes por embedding y consulta en lenguaje natural.
- Extracción de embeddings de imagen y de texto de forma independiente para pipelines de similitud.
- Ejecución en dispositivo con `MLComputeUnits.cpuAndNeuralEngine`, sin dependencia de red.
- Capacidades multilingües heredadas del modelo base SigLIP 2 (el artículo original las describe; el repositorio no detalla la lista de idiomas).
- No soporta generación de texto, tool calling ni razonamiento multi-paso: es un codificador, no un modelo de lenguaje generativo.

## Casos de uso

- Búsqueda de fotos en local: se indexan las imágenes del dispositivo calculando su embedding con la torre de imagen y se consulta en lenguaje natural con la torre de texto; las fotos nunca salen del dispositivo, lo que encaja con requisitos de privacidad estrictos.
- Clasificación zero-shot de imágenes en aplicaciones de escritorio: definir categorías como etiquetas de texto y asignar la más probable a cada imagen sin reentrenar, gracias a la naturaleza zero-shot del pipeline.
- Etiquetado automático de bibliotecas fotográficas: generar metadatos semánticos (escena, objeto, contexto) a partir de la similitud entre la imagen y un vocabulario predefinido.
- Moderación o filtrado de contenido en local: comparar imágenes contra descripciones textuales de categorías prohibidas antes de subirlas a un servicio.
- Organización de activos digitales (DAM) en Mac: agrupar y recuperar imágenes por descripción textual dentro de una aplicación nativa, aprovechando la latencia medida de ~5,7 ms por imagen y ~1,5 ms por consulta de texto en un M5.
- Prototipado de funciones de visión en apps Apple: integrar el `.mlpackage` directamente en Xcode y validar flujos de recuperación imagen-texto sin infraestructura de servidor.
- Verificación de integridad en producción: los clientes pueden fijar una revisión del repositorio y validar los ficheros contra `SHA256SUMS` antes de cargarlos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| COCO-1k text→image R@1 | 71,4 | Medido en la conversión Core ML |
| COCO-1k text→image R@1 (TinyCLIP-39M) | 58,1 | Referencia comparativa citada en la model card |
| Latencia por imagen (M5 Mac) | ~5,7 ms | Con `MLComputeUnits.cpuAndNeuralEngine` |
| Latencia por consulta de texto (M5 Mac) | ~1,5 ms | Con `MLComputeUnits.cpuAndNeuralEngine` |

No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K, que no aplican a un codificador imagen-texto.

## Requisitos de hardware

- Inferencia en dispositivo Apple con Core ML; el autor indica ejecutar con `MLComputeUnits.cpuAndNeuralEngine`.
- Tamaño de los paquetes: ~89 MB (torre de imagen) y ~458 MB (torre de texto), ~0,6 GB en total.
- VRAM/unified memory estimada: no disponible de forma explícita; por el tamaño de los pesos paletizados a 8 bits, la huella es del orden de cientos de MB, apta para equipos Apple Silicon de gama consumer.
- GPU recomendadas: no aplica en el sentido CUDA; el destino es Apple Silicon (CPU + Neural Engine). El autor reporta mediciones en un M5 Mac.
- Cabe en hardware consumer Apple: sí, según el tamaño de los paquetes y las mediciones aportadas.
- Opciones de despliegue: Core ML (Xcode, `coremltools`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia: ~5,7 ms por imagen y ~1,5 ms por consulta de texto en M5 Mac (cifras del autor). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / resolución | Rendimiento COCO-1k text→image R@1 | Licencia | Formato |
|---|---|---|---|---|---|
| dayze/siglip2-base-patch16-256-coreml | Codificador imagen-texto Core ML | 256x256, parches 16 | 71,4 (Core ML) | Apache 2.0 | Core ML |
| google/siglip2-base-patch16-256 | Codificador imagen-texto (original) | 256x256, parches 16 | no disponible en esta ficha | Apache 2.0 | safetensors (formato original de big_vision) |
| TinyCLIP-39M | Codificador imagen-texto | no disponible | 58,1 | no disponible | no disponible |

La comparación con modelos de la misma categoría (CLIP, SigLIP, TinyCLIP) se limita a los datos aportados por el autor; no se dispone de cifras propias para el modelo original ni para otras variantes de SigLIP 2 en esta información.

## Limitaciones y advertencias

- Es un codificador, no un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- La calidad de la recuperación depende de la formulación de las consultas de texto y del vocabulario de etiquetas; no se han publicado evaluaciones multilingües específicas para esta conversión.
- La cuantización a 8 bits con paletización puede introducir una degradación menor frente al modelo original; no se aporta una comparación numérica entre la versión Core ML y la de referencia más allá del R@1 citado.
- Riesgo de sesgos heredados del dataset de entrenamiento de SigLIP 2 (no detallado en la información disponible); pueden aparecer sesgos de género, cultura o etnia en las recuperaciones.
- La licencia Apache 2.0 permite uso comercial, pero los materiales adicionales de SigLIP 2 están bajo CC-BY 4.0 según la model card; conviene revisar la atribución exigida.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado en noviembre de 2026; es una conversión de un tercero, no oficial de Google.
- Dependencia de la plataforma Apple: el formato Core ML no es portable a entornos CUDA ni a servidores Linux sin reconversión.
- No se especifican los idiomas soportados en esta conversión; las capacidades multilingües deben validarse empíricamente antes de usarlas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dayze/siglip2-base-patch16-256-coreml
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-256
- Artículo SigLIP 2 (arXiv:2502.14786): https://arxiv.org/abs/2502.14786
- Repositorio big_vision de Google Research: https://github.com/google-research/big_vision
