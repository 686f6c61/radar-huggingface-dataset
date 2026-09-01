# mlboydaisuke/OvisOCR2-LiteRT

## Resumen

OvisOCR2-LiteRT es una conversión al formato LiteRT-LM (`.litertlm`) del modelo OvisOCR2 de ATH-MaaS, un modelo de parsing de documentos de 0,85 mil millones de parámetros diseñado para transcribir páginas de documentos en Markdown estructurado. Desarrollado por mlboydaisuke, este paquete permite ejecutar el modelo en dispositivos edge mediante el runtime LiteRT-LM de Google, con una entrada estática de imagen de 512×512 píxeles. El modelo base OvisOCR2 se construyó post-entrenando Qwen3.5-0.8B con un data engine que combina anotaciones reales filtradas y páginas sintéticas, y es capaz de emitir texto como Markdown, tablas como HTML y fórmulas como LaTeX, manteniendo el orden de lectura natural.

La relevancia de esta conversión radica en que acerca un modelo de visión-lenguaje (VLM) especializado en OCR a entornos de producción en dispositivos móviles y de borde, con un tamaño de archivo de 1,3 GB y cuantización int8 en el decoder. El modelo conserva la arquitectura híbrida gated-deltanet del Qwen3.5-0.8B (18 capas de atención lineal y 6 de atención completa) junto con un ViT de 12 capas, y se distribuye bajo licencia Apache-2.0. Aunque no es un modelo de chat, su especialización en parsing de documentos lo hace adecuado para tareas de digitalización, extracción de tablas y fórmulas, y accesibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida gated-deltanet (18 capas linear-attention + 6 full-attention) + ViT de 12 capas |
| Parametros totales | 0,85 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de imagen estática 512×512) |
| Tipos de cuantizacion | int8 (decoder dinámico en linears y embedding; convs y delta rule en float, activaciones fp32), fp16 (vision encoder), int8 (adapter) |
| Idiomas soportados | No disponible (el prompt sugiere capacidad multilingüe, pero no se especifican idiomas concretos) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

OvisOCR2 se basa en el modelo Qwen3.5-0.8B, que emplea una arquitectura híbrida gated-deltanet: 18 capas de atención lineal (con state buffers) y 6 capas de atención completa, más un ViT de 12 capas para el procesamiento visual. El post-entrenamiento para OCR se realizó con un data engine que combina anotaciones de documentos reales filtradas con páginas sintéticas cuyas imágenes renderizadas y objetivos Markdown se generan automáticamente, según el reporte técnico disponible en arXiv. El modelo genera transcripciones en orden de lectura natural, representando tablas como HTML `<table>`, fórmulas como LaTeX y regiones visuales como etiquetas `<img>` con coordenadas de bounding box.

La conversión a LiteRT-LM elimina la cabeza MTP (multi-token prediction) y declara tanto `<|endoftext|>` como `<|im_end|>` como tokens de parada, corrigiendo un problema del modelo original que tendía a divagar sin una configuración de eos adecuada. El paquete incluye una escalera de prefill de seis firmas para optimizar la carga en Metal y una calibración específica de las escalas de LayerNorm del vision tower para fp16.

## Capacidades

- Parsing de documentos página a página: transcribe texto como Markdown, tablas como HTML `<table>` y fórmulas como LaTeX, manteniendo el orden de lectura natural.
- Reconocimiento de regiones visuales: emite etiquetas `<img src="images/bbox_{left}_{top}_{right}_{bottom}.jpg" />` para gráficos e imágenes, con coordenadas normalizadas a [0, 1000).
- Preservación del texto original: no traduce ni parafrasea, transcribe literalmente.
- Inferencia on-device: compatible con CPU y GPU (Metal) en dispositivos Apple, con rendimiento medido en iPhone 17 Pro y Apple M4 Max.
- Salida determinista: con temperatura 0 y backend GPU produce salidas byte-idénticas a CPU en páginas de tablas.
- No es un modelo de chat: el post-entrenamiento erosiona la capacidad conversacional general; tiende a transcribir el prompt en lugar de responder preguntas.

## Casos de uso

- Digitalización de documentos escaneados: convierte páginas de informes, facturas o artículos en Markdown estructurado para archivado y búsqueda, gracias a su capacidad de transcribir tablas y fórmulas con precisión.
- Extracción de tablas para análisis de datos: al emitir tablas como HTML, se puede integrar en pipelines que convierten el HTML a CSV o JSON para alimentar hojas de cálculo o bases de datos.
- Procesamiento de artículos académicos: las fórmulas LaTeX se extraen directamente, facilitando la reutilización en documentos científicos o sistemas de gestión de referencias.
- Accesibilidad: convierte documentos visuales en texto plano o Markdown para lectores de pantalla, mejorando el acceso a contenido impreso para personas con discapacidad visual.
- Automatización de entrada de datos: en entornos empresariales, el modelo puede procesar formularios y facturas en dispositivos móviles, reduciendo la intervención manual.
- Integración en aplicaciones de búsqueda documental: al generar transcripciones en orden de lectura, se puede indexar el contenido para búsqueda semántica o por palabras clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, etc.) en la informacion disponible, ya que el modelo está especializado en parsing de documentos y no en tareas generales. Sin embargo, la model card reporta métricas de rendimiento de inferencia medidas con `litert-lm benchmark` en Apple M4 Max (litert-lm 0.16.0, `-p 256 -d 256 --runs 3 --cache no`):

| Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|
| GPU | 2175 tok/s | 140,9 tok/s | 0,13 s |
| CPU | 659 tok/s | 48,9 tok/s | 0,43 s |

En iPhone 17 Pro (iOS 27, litert-lm v0.16.0, cold start, single runs):

| Backend | Decode | TTFT | Peak memory |
|---|---|---|---|
| GPU (Metal) | 48,5 tok/s | 1,5 s | 3,8 GB |
| GPU (Metal), image leg | 64,7 tok/s | 1,5 s | 3,8 GB |
| CPU | 18,0 tok/s | 1,0 s | 0,9 GB |

Además, se reporta similitud 1.0000 con la referencia fp32 en páginas de tablas y fórmulas (con una diferencia de un token en la variante M-RoPE), y salida byte-idéntica entre backends GPU y CPU en páginas de tablas.

## Requisitos de hardware

- VRAM estimada: 3,8 GB en GPU (Metal) para inferencia en iPhone 17 Pro; 0,9 GB en CPU.
- GPU recomendadas: Apple M4 Max (GPU integrada) y GPU Metal en iPhone 17 Pro; no se especifican GPUs de escritorio.
- Compatibilidad con consumer GPU: no se indica explícitamente, pero al ser un modelo de 0,85B con cuantización int8, es plausible que quepa en GPUs de gama media (p. ej., RTX 3060 o superior) si se usa el runtime adecuado, aunque no hay datos confirmados.
- Opciones de despliegue: runtime LiteRT-LM (requiere versión ≥ 0.15), con backends CPU y GPU (Metal). No se mencionan vLLM, llama.cpp u Ollama.
- Latencia y throughput: prefill de 2175 tok/s y decode de 140,9 tok/s en M4 Max GPU; decode de 48,5 tok/s en iPhone 17 Pro GPU. TTFT de 0,13 s en M4 Max y 1,5 s en iPhone.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de parsing de documentos en formato LiteRT-LM. El modelo base OvisOCR2 (0,85B) comparte arquitectura con Qwen3.5-0.8B, pero su post-entrenamiento lo especializa en OCR. Alternativas genéricas como PaddleOCR o Tesseract no son comparables en arquitectura ni en formato de salida. Se indica "no disponible" para una comparativa formal.

## Limitaciones y advertencias

- No es un modelo de chat: el post-entrenamiento erosiona la capacidad conversacional; en pruebas de preguntas genéricas, tiende a transcribir el prompt en lugar de responder.
- Problemas con páginas densas: texto de 9 pt o menor excede la resolución de 512×512, lo que provoca que el modelo invente contenido y se repita. El modelo original fp32 presenta el mismo comportamiento.
- Requiere pre-renderizado: la entrada se redimensiona a 512×512; se recomienda pre-renderizar la página a esa resolución para controlar la relación de aspecto.
- Dependencia de configuración de tokens de parada: el modelo original sin `generation_config.json` tiende a divagar; este paquete declara los tokens de parada correctos, pero al comparar con la pila estándar de HuggingFace hay que añadir 248046 a `eos_token_id`.
- Sesgos y alucinaciones: no se documentan sesgos específicos, pero el riesgo de alucinación es alto en páginas ilegibles o con texto pequeño.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base y sus pesos están sujetos a la misma licencia; se recomienda verificar los términos del modelo original.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mlboydaisuke/OvisOCR2-LiteRT)
- [Modelo base ATH-MaaS/OvisOCR2](https://huggingface.co/ATH-MaaS/OvisOCR2)
- [Reporte técnico de OvisOCR2 en arXiv](https://arxiv.org/abs/2607.13639v1)
- [Repositorio de Ovis en GitHub](https://github.com/ATH-MaaS/Ovis)
- [LiteRT-LM en GitHub](https://github.com/google-ai-edge/litert-lm)
- [LiteRT (sucesor de TensorFlow Lite)](https://github.com/google-ai-edge/litert)
