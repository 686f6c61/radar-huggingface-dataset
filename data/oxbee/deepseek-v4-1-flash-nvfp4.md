# OxBee/DeepSeek-V4.1-Flash-NVFP4

## Resumen

DeepSeek-V4.1-Flash-NVFP4 es la versión cuantizada a NVFP4 del modelo multimodal DeepSeek-V4.1-Flash de DeepSeek AI, publicada por OxBee (con model card procedente de NVIDIA) y generada con NVIDIA Model Optimizer v0.47.0rc0. El modelo base es un Mixture-of-Experts (MoE) nativamente multimodal con arquitectura Causal Encoder-Decoder (CED) y Compressed Sparse Attention 2 (CSA2), capaz de procesar contextos de hasta un millón de tokens y entradas de texto e imagen.

La relevancia de esta ficha está en la cuantización: el checkpoint original en FP8 se reduce a FP4 (NVFP4) para el backbone y a MXFP4 para las tablas de lookup del módulo Engram, lo que disminuye el peso del repositorio a 429 GB y permite desplegar un modelo de 664.898 millones de parámetros totales en hardware Blackwell con vLLM o SGLang. El modelo está pensado para sistemas de agentes, chatbots y pipelines RAG que necesiten contexto largo y capacidades multimodales.

La licencia es MIT, lo que facilita el uso comercial, pero el despliegue exige una build específica de vLLM con soporte MXFP4 para Engram, o bien fijar la revisión anterior del checkpoint. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Causal Encoder-Decoder (CED) y Compressed Sparse Attention 2 (CSA2); clase `DeepseekV41ForCausalLM` |
| Parámetros totales | 664.898.390.994 (552B backbone + 196B Engram conditional memory, según model card) |
| Parámetros activos | 8B durante prefill y 16B durante decode |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | NVFP4 (backbone), MXFP4 (tablas de lookup Engram), FP8 (revisión anterior de Engram); tags indican también 8-bit/fp8 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 429 GB) |

## Arquitectura y entrenamiento

El modelo es un MoE multimodal con arquitectura Causal Encoder-Decoder y Compressed Sparse Attention 2, diseñado para contextos de hasta un millón de tokens. El backbone suma 552B parámetros, de los cuales se activan 8B en prefill y 16B en decode, a los que se añaden 196B parámetros de memoria condicional Engram. La cuantización se realizó con NVIDIA Model Optimizer v0.47.0rc0 y cambios de compatibilidad específicos para V4.1, partiendo de la revisión `dba1be0a40aa45a94ad051997016db3960a90277`. La actualización del 14/10/2026 convirtió las tablas de lookup Engram de FP8 a MXFP4, manteniendo el resto del checkpoint sin cambios respecto a la revisión `3431dde3247c13b5957f682b1e3c6fcae2566079`.

La calibración de la cuantización utilizó 512 muestras de `cnn_dailymail` y 512 de `Nemotron-Post-Training-Dataset-v2` (subconjuntos `stem`, `chat`, `math` y `code`), con longitud de secuencia 512, batch size 4 y semilla 0. No se detallan los datos de entrenamiento originales del modelo base (modalidad, recolección y etiquetado figuran como "undisclosed" en la model card). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención linear más allá de CSA2 y Engram.

## Capacidades

- Generación de texto y razonamiento con contexto de hasta 1M tokens.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con entrada RGB en 1D/2D.
- Modelo nativamente multimodal: acepta cadenas de texto e imágenes y produce texto.
- Soporte de tool calling y parsing de razonamiento, validado en la revisión anterior mediante pruebas de carga, generación y tool-call parsing en SGLang.
- Capacidades de agente y razonamiento multi-paso, orientadas a sistemas de agentes según la model card.
- Memoria condicional Engram de 196B parámetros para recuperación de conocimiento a largo plazo.
- Capacidades multilingües: no disponible.

## Casos de uso

- Sistemas de agentes autónomos: el modelo puede mantener estado a lo largo de trayectorias largas gracias al contexto de 1M tokens y al soporte de tool calling, integrándose en orquestadores que encadenan llamadas a herramientas.
- RAG sobre corpus extensos: con ventana de 1M tokens, permite inyectar documentación completa sin troceado agresivo, reduciendo la pérdida de contexto en la recuperación.
- Atención al cliente multimodal: puede procesar capturas de pantalla o imágenes adjuntas por el usuario junto con el historial de conversación multi-turno.
- Análisis de documentos con imágenes: extracción de información de informes, facturas o gráficos combinando entrada visual y textual en una sola pasada.
- Asistentes de código en producción: el soporte de tool calling y el modo de razonamiento permiten integrarlo en pipelines de CI/CD para revisión y generación de parches.
- Despliegue en clústeres Blackwell: al estar cuantizado a NVFP4, es adecuado para servir en GPUs NVIDIA Blackwell con vLLM, reduciendo el coste de memoria frente al checkpoint FP8.
- Investigación en eficiencia de cuantización: sirve como referencia para evaluar la degradación de un MoE multimodal de gran escala al pasar de FP8 a FP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los resultados de benchmark se obtuvieron con vLLM, pero no incluye las cifras.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 429 GB en NVFP4/MXFP4, por lo que la inferencia requiere agregar memoria para KV cache y activaciones sobre esa base.
- GPU recomendadas: NVIDIA Blackwell (microarquitectura soportada oficialmente); no se listan modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del checkpoint (429 GB) hace inviable su carga en GPUs consumer convencionales.
- Opciones de despliegue: vLLM (requiere soporte MXFP4 para Engram, PR vllm-project/vllm#61530) y SGLang (solo revisión anterior `3431dde...`). Las imágenes estándar de vLLM, incluida `vllm/vllm-openai:deepseekv41-flash-0909`, no pueden cargar la revisión actual.
- Sistema operativo preferido: Linux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-NVFP4 (este) | 664.898.390.994 totales (8B/16B activos + 196B Engram) | 1M | NVFP4 + MXFP4 | MIT | Hugging Face (OxBee), requiere vLLM específico |
| DeepSeek-V4.1-Flash (base) | 552B backbone + 196B Engram | 1M | FP8 | MIT | Hugging Face (deepseek-ai) |
| NVIDIA DeepSeek-V4.1-Flash-NVFP4 | Misma arquitectura | 1M | NVFP4 + MXFP4 | MIT | Hugging Face (nvidia) |

No se dispone de datos de benchmarks para comparar rendimiento entre estas variantes. La diferencia principal entre las tres es el formato de pesos y el repositorio de publicación; la versión de OxBee replica la cuantización de NVIDIA con la actualización de Engram a MXFP4.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para esta versión cuantizada.
- La cuantización a FP4 puede degradar la calidad respecto al checkpoint FP8 original; no se aportan métricas de esa degradación.
- El contexto de 1M tokens no implica que el modelo use eficazmente toda la ventana; no hay evidencia publicada al respecto.
- Idiomas soportados no especificados, lo que impide garantizar cobertura multilingüe.
- La revisión actual con Engram en MXFP4 no carga en imágenes estándar de vLLM ni ha sido validada con SGLang; solo funciona con builds que incluyan el PR indicado o fijando la revisión anterior.
- Requiere hardware NVIDIA Blackwell; no hay soporte declarado para otras microarquitecturas.
- Aunque la licencia es MIT, la model card recomienda pruebas específicas del caso de uso antes de desplegar en producción.
- El repositorio tiene 55 descargas y 0 likes, por lo que la validación comunitaria es mínima.

## Enlaces

- Hugging Face (OxBee): https://huggingface.co/OxBee/DeepSeek-V4.1-Flash-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Versión NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-NVFP4
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- PR vLLM para soporte MXFP4 Engram: https://github.com/vllm-project/vllm/pull/61530
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibración Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md
