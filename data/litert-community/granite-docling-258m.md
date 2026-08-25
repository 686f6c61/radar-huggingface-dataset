# litert-community/granite-docling-258M

## Resumen

granite-docling-258M es una conversión al formato LiteRT-LM (`.litertlm`) del modelo vision-lenguaje (VLM) de IBM Granite-Docling, diseñado para conversión de documentos en el dispositivo (on-device). El modelo original, ibm-granite/granite-docling-258M, es el componente de IA que impulsa el ecosistema Docling: dada una imagen de página y el prompt `Convert this page to docling.`, genera DocTags, un marcado estructurado con elementos de maquetación, estructura de tablas OTSL, código y fórmulas, que docling-core convierte sin pérdida a Markdown, HTML o JSON.

Con 258 millones de parámetros (aproximadamente 338 MB en este bundle), es uno de los modelos de IA documental más pequeños que captura la estructura de tablas, no solo el texto. Esta conversión específica a LiteRT-LM está pensada para ejecutarse en CPU en dispositivos móviles y de borde, con pesos int8 y cómputo en punto flotante, y una ventana de contexto de 4096 tokens. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: SigLIP-base p16 (vision) + decoder tipo Llama (granite) |
| Parametros totales | 258M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 (KV cache) |
| Tipos de cuantizacion | int8 (pesos int8 con cómputo float); int4 probado y rechazado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder de visión SigLIP-base p16 (entrada 512×512, 1024 parches) con un pixel-shuffle ×4 y un conector lineal, que produce 64 tokens de imagen en int8. El decoder es un modelo de arquitectura Llama de la familia granite, con 576 dimensiones, 30 capas, atención GQA 9/3 y vocabulario de 100k tokens. Los pesos del decoder se cuantizan a int8 pero el cómputo se realiza en punto flotante; la cuantización int4 se probó y se descartó porque corrompía los DocTags generados.

El modelo base se entrenó como parte del proyecto Docling de IBM para consolidar en un solo VLM las funciones de múltiples modelos de propósito único (OCR, análisis de maquetación, reconocimiento de tablas). No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset en los materiales proporcionados. La conversión a LiteRT-LM no altera el comportamiento del modelo original, salvo por la cuantización int8 de pesos y la restricción de entrada a imágenes pre-redimensionadas a 512×512 con filtro bilinear.

## Capacidades

- Conversión de páginas de documentos a DocTags, un marcado estructurado con elementos de maquetación, tablas OTSL, código y fórmulas.
- Generación de salida convertible a Markdown, HTML o JSON mediante docling-core.
- Reconocimiento de estructura de tablas (no solo texto) gracias al formato OTSL.
- Procesamiento multimodal: entrada de imagen y texto, salida de texto.
- Ejecución en CPU en dispositivos de borde y móviles (Android, macOS).
- No soporta tool calling, ni agentes, ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües específicas.

## Casos de uso

- Digitalización de documentos en el dispositivo: convertir páginas escaneadas o capturas de pantalla a Markdown estructurado sin enviar datos a la nube, aprovechando la ejecución local en CPU.
- Extracción de tablas para análisis de datos: el modelo conserva la estructura OTSL de las tablas, lo que permite exportar a CSV o JSON con celdas correctamente alineadas.
- Asistente de documentación sin conexión: en entornos con conectividad limitada (aviones, barcos, zonas rurales), convertir informes o manuales a HTML para su consulta local.
- Pipeline de conversión de documentos en producción: integrar el modelo en el ecosistema Docling para procesar lotes de PDFs, diapositivas o imágenes de páginas, generando DocTags que docling-core transforma a los formatos finales.
- Accesibilidad y re-formateo: transformar documentos escaneados en texto estructurado legible para lectores de pantalla o para re-maquetación web.
- Automatización de archivos empresariales: extraer estructura de tablas y maquetación de informes financieros o técnicos para su ingestión en sistemas de gestión documental.
- Demostración de IA generativa en móvil: usar la app Google AI Edge Gallery para ejecutar el modelo en un teléfono Android y obtener DocTags directamente desde una imagen de página.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo en la información disponible. Sin embargo, la model card de esta conversión incluye mediciones de calidad y rendimiento en una prueba de estructura concreta:

| Prueba | Resultado |
|---|---|
| Structure gate (página sintética con tabla 5×6) | Título exacto, cuadrícula OTSL completa, 25/25 celdas correctas |
| Latencia en macOS M4 Max (CPU) | 5,2 s/página (~240 tokens de salida) |
| Latencia en Galaxy S26 (CPU, SM8850) | 35,4 s/página (1025 tokens de salida) |
| Prefill (M4 Max CPU) | 912 tok/s |
| Decode (M4 Max CPU) | 64,0 tok/s |
| TTFT (M4 Max CPU) | 0,57 s |
| Paridad de conversión del vision tower | Correlación 1,000 vs. original fp32 (int8: 0,98) |

## Requisitos de hardware

- Backend previsto: CPU únicamente. El bundle no crea un motor GPU; el delegado GPU rechaza la proyección cuantizada en la inicialización del kernel.
- No se requiere VRAM para inferencia en GPU, ya que no está soportada.
- GPU recomendadas: ninguna; la variante fp16 en Android OpenCL es ~4× más lenta que CPU y no se distribuye.
- Despliegue en CPU de Apple Silicon (M4 Max verificado) y CPU de Android (Galaxy S26 verificado).
- Opciones de despliegue: LiteRT-LM runtime, Google AI Edge Gallery (Android), CLI `litert-lm benchmark`.
- Latencia medida: 5,2 s/página en M4 Max y 35,4 s/página en Galaxy S26 con salida de 1025 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| litert-community/granite-docling-258M (este) | 258M | 4096 | Apache-2.0 | .litertlm | int8, CPU, on-device |
| ibm-granite/granite-docling-258M (original) | 258M | 4096 | Apache-2.0 | safetensors (fp32) | Modelo base, ejecución en transformers |
| Docling pipeline (modelos múltiples) | varios | no disponible | MIT (Docling) | no disponible | Pipeline tradicional de OCR + layout + tablas |

La comparación con otros VLM pequeños de conversión de documentos no está disponible en los datos proporcionados. La diferencia principal con el modelo original es el formato de pesos (int8 en LiteRT-LM vs. fp32 en safetensors) y la restricción de entrada a 512×512 BILINEAR; el rendimiento estructural es idéntico entre ambos según las mediciones de la model card.

## Limitaciones y advertencias

- **Contrato de entrada obligatorio**: la imagen debe pre-redimensionarse exactamente a 512×512 con resampling BILINEAR en la aplicación. Si no se hace, el modelo produce una página alucinada en lugar de la real.
- **Degradación en páginas densas**: en modo single-512, páginas multi-columna y fórmulas pequeñas degradan la calidad de salida. Para esos casos se recomienda dividir la página en tiles y enviar los recortes.
- **Sin soporte GPU**: el bundle no funciona con el delegado GPU de LiteRT-LM; el backend previsto es CPU.
- **Cuantización int4 descartada**: la cuantización int4 con cómputo entero corrompe los DocTags; el bundle solo funciona con int8 y cómputo float.
- **Riesgo de alucinación**: si se envía una imagen con un tamaño o filtro de redimensionado incorrecto, el modelo puede producir una salida inventada.
- **Idiomas no documentados**: no se ha especificado qué idiomas soporta el modelo; la model card no incluye esa información.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero se recomienda el uso conjunto con Granite Guardian para filtrar contenido de riesgo según la documentación de IBM.
- **Latencia en dispositivos de gama baja**: en un móvil de gama media (Galaxy S26) la conversión tarda ~35 s por página; no es adecuado para procesamiento en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/granite-docling-258M
- Modelo base original: https://huggingface.co/ibm-granite/granite-docling-258M
- LiteRT-LM (runtime): https://github.com/google-ai-edge/litert-lm
- Docling (proyecto): https://github.com/docling-project/docling
- docling-core (conversor de DocTags): https://github.com/docling-project/docling-core
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Documentación de IBM Granite Docling: https://www.ibm.com/granite/docs/models/docling
- Anuncio de IBM Granite-Docling: https://www.ibm.com/new/announcements/granite-docling-end-to-end-document-conversion
- Implementación de referencia (GitHub): https://github.com/felipemeres/granite-docling-implementation
- Repositorio adicional con Granite Guardian: https://github.com/pgadet-wq/granite-docling-258M
