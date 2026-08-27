# aisquared/Muse-Glimmer-30B-bpw4-AutoRound

## Resumen

Muse Glimmer 30B es un modelo agéntico de código abierto desarrollado por Meta Superintelligence Labs, destilado de Muse Spark y diseñado para ejecutarse de forma local en una sola GPU. Combina razonamiento multi-paso, llamada a herramientas basada en esquemas y recuperación ante fallos, con comprensión multimodal a través de un encoder de visión ViT-G/14 de aproximadamente 1,8 mil millones de parámetros. Admite entrada intercalada de texto e imagen y una ventana de contexto superior a 131 000 tokens, con intensidad de razonamiento seleccionable.

Esta versión concreta, publicada por aisquared, es una cuantización del modelo original a aproximadamente 4 bits por peso (bpw) mediante Intel AutoRound con esquema de precisión mixta (AutoScheme). Los pesos se exportan en formato compressed-tensors, empaquetados con llm-compressor, y están pensados para servirse con vLLM. No es una versión GGUF. La cuantización reduce significativamente los requisitos de memoria, manteniendo la torre de visión y la cabeza de lenguaje en BF16 sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con encoder de vision ViT-G/14 (~1,8B parametros) |
| Parametros totales | 30B (modelo base); el archivo safetensors cuantizado contiene 7 369 389 888 parametros en formato comprimido |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131K+ (modelo base); el ejemplo de vLLM usa --max-model-len 32768 |
| Tipos de cuantizacion | W2A16G64, W4A16, W8A16 (mixto por capa, grupos QKV uniformes); lm_head y vision tower en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | compressed-tensors (safetensors), no GGUF |

## Arquitectura y entrenamiento

El modelo base Muse Glimmer 30B es un transformer causal denso con un encoder de vision separado (ViT-G/14) de aproximadamente 1,8 mil millones de parametros, lo que le permite procesar imagenes y texto de forma intercalada. Segun la documentacion de Fireworks, fue destilado de Muse Spark, un modelo mas grande, para tareas agénticas autonomas. No se han publicado detalles adicionales sobre el dataset de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO.

La cuantizacion de aisquared utiliza Intel AutoRound con el esquema AutoScheme, que asigna bits de forma mixta por capa segun la sensibilidad. Se aplico un ajuste con SignRound (200 iteraciones, 128 muestras, longitud de secuencia 2048) y calibracion con el dataset NeelNanda/pile-10k (solo texto). La torre de vision y la cabeza de lenguaje se mantienen en BF16 sin cuantizar. El resultado se exporta en formato compressed-tensors, compatible con vLLM mediante deteccion automatica.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con intensidad de razonamiento seleccionable (baja, media, alta).
- Llamada a herramientas (tool calling) basada en esquemas, con soporte para multiples llamadas consecutivas en mensajes de asistente.
- Comprension multimodal: acepta imagenes y texto intercalados, gracias al encoder de vision ViT-G/14.
- Recuperacion ante fallos: disenado para tareas agénticas de larga duracion, con capacidad de autoevaluacion y correccion.
- Ventana de contexto larga (131K+ en el modelo base), adecuada para conversaciones extensas y documentos largos.
- Soporte para agentes autonomos, con parsers especificos en vLLM (`muse_glimmer` para tool calls y reasoning).

## Casos de uso

- Agentes autonomos de escritorio: el modelo puede gestionar tareas complejas de multiples pasos, como organizar el correo, programar citas o interactuar con aplicaciones locales, gracias a su tool calling y razonamiento multi-paso.
- Atencion al cliente automatizada: con su ventana de contexto larga y capacidad de mantener conversaciones multi-turno, puede manejar consultas de soporte con historial extenso y derivar a herramientas externas (CRM, bases de conocimiento) cuando sea necesario.
- Analisis de documentos con imagenes: al aceptar entrada multimodal, puede procesar facturas, capturas de pantalla o diagramas junto con texto, extrayendo informacion y ejecutando acciones basadas en ella.
- Asistente de programacion con herramientas: integrado en un IDE o pipeline de CI/CD, puede generar codigo, ejecutar comandos, revisar resultados y corregir errores de forma autonoma.
- Automatizacion de flujos de trabajo empresariales: puede orquestar APIs internas, rellenar formularios, consultar bases de datos y tomar decisiones basadas en reglas, todo con supervisión minima.
- Investigacion asistida: con su capacidad de razonamiento y acceso a herramientas de busqueda, puede recopilar informacion, resumir articulos y generar informes estructurados a partir de multiples fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones para esta cuantizacion ni para el modelo base en las fuentes consultadas.

## Requisitos de hardware

- El modelo base de 30B esta disenado para ejecutarse en una sola GPU de consumo, segun Meta. Con la cuantizacion a ~4 bpw, los requisitos de VRAM se reducen considerablemente.
- Estimacion orientativa: con 4 bits por peso, los pesos del modelo ocupan aproximadamente 15-16 GB (30B * 4 bits / 8 = 15 GB), mas overhead de activaciones y cache. Esto cabe en GPUs con 24 GB de VRAM, como la RTX 4090, RTX 3090 o A10G.
- Para servir con vLLM, se recomienda una imagen de contenedor con soporte para Muse Glimmer (por ejemplo, `vllm/vllm-openai:muse-glimmer` o `:nightly`). El comando de ejemplo usa `--max-model-len 32768`, lo que sugiere que la cuantizacion puede no soportar la longitud completa de 131K en la practica.
- En hardware Intel (GPU o CPU), se recomienda anadir `--enforce-eager` cuando se sirve con cuantizacion wNa16.
- No se han publicado datos de latencia o throughput especificos para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse Glimmer 30B (base) | 30B | 131K+ | Apache 2.0 | safetensors (BF16) | Modelo original, sin cuantizar |
| Muse Glimmer 30B bpw4 AutoRound (este) | 30B (cuantizado) | 32K (en ejemplo vLLM) | Apache 2.0 | compressed-tensors | Cuantizacion a ~4 bpw, para vLLM |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | safetensors, GGUF | Menor tamano, sin vision nativa |
| Qwen 2.5 32B | 32B | 128K | Apache 2.0 | safetensors, GGUF | Similar en tamano, con variantes multimodales |

No se dispone de datos de rendimiento comparativo entre estos modelos en las fuentes consultadas. La comparacion se basa en especificaciones publicas.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o alucinaciones para esta cuantizacion. Como todo modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas agénticas de larga duracion.
- La cuantizacion a 4 bits puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo en BF16, aunque no se han proporcionado metricas que lo cuantifiquen.
- La ventana de contexto efectiva en esta cuantizacion puede estar limitada a 32K tokens (segun el ejemplo de vLLM), muy por debajo de los 131K del modelo base. Esto puede afectar a tareas que requieran contexto muy largo.
- El formato compressed-tensors es especifico de vLLM; no es compatible con llama.cpp, Ollama u otros motores que usan GGUF. Para usarlo con Ollama, habria que buscar una version GGUF del modelo.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los terminos de Meta para el modelo base, aunque la cuantizacion se distribuye bajo la misma licencia.
- No se han publicado datos sobre el rendimiento en tareas especificas (codigo, matematicas, etc.) para esta version cuantizada.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/aisquared/Muse-Glimmer-30B-bpw4-AutoRound
- Modelo base en HuggingFace: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Pagina oficial de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Blog de investigacion de Meta: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Ficha en Fireworks AI: https://fireworks.ai/models/fireworks/muse-glimmer-30b
- Pagina en Ollama: https://ollama.com/library/muse-glimmer:30b
- Repositorio de AutoRound: https://github.com/intel/auto-round
- PR de vLLM con soporte para Muse Glimmer: https://github.com/vllm-project/vllm/pull/51655
