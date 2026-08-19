# Chungulus/Qwen3.8-27B-Q4_K_M-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal (vision-lenguaje) denso de 27.320 millones de parametros desarrollado por Alibaba Qwen, publicado bajo licencia Apache-2.0. Este repositorio concreto contiene una cuantizacion vanilla Q4_K_M en formato GGUF realizada por Chungulus, sin modificaciones sobre los pesos originales, incluyendo el proyector de vision en FP16. El modelo destaca por su ventana de contexto nativa de 262.144 tokens (256K), capacidades de razonamiento configurable, tool calling nativo y una arquitectura hibrida que combina atencion completa con capas Gated DeltaNet.

La relevancia de esta cuantizacion radica en que permite ejecutar un VLM de 27B con vision y razonamiento en hardware de consumo, con un peso de 16,8 GB para el tensor principal mas el proyector de vision. El modelo base soporta entrada de imagen, video y texto, y esta orientado a tareas de codificacion agente, trabajo profesional, investigacion y razonamiento de horizonte largo. La cuantizacion Q4_K_M de llama.cpp conserva la estructura hibrida, los tensores MTP (multi-token prediction) y el chat template original, aunque la aceleracion especulativa no se anuncia como soportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: atencion completa + Gated DeltaNet (vision-language) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (GGUF), F16 para el proyector de vision |
| Idiomas soportados | No disponible (no especificado en la informacion proporcionada) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) + mmproj F16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina capas de atencion completa con capas Gated DeltaNet, una variante de atencion lineal que reduce el coste computacional en contextos largos manteniendo la capacidad de recuperacion de informacion. Esta estructura se conserva integramente en la cuantizacion GGUF, junto con los tensores MTP (multi-token prediction) que permiten prediccion de multiples tokens por paso, aunque el autor de la cuantizacion no anuncia aceleracion especulativa activa. El modelo incluye un codificador de vision y un proyector multimodal (mmproj) que permite procesar imagenes y video ademas de texto.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La cuantizacion Q4_K_M se realizo con llama.cpp en la revision `5f754ea0e2fd21e1213db7ebebfd65d938d9d69c`, sin calibracion para K-quants, y los pesos fuente se fijaron al commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del repositorio oficial. El autor confirma que no se trata de un fine-tune, merge, ablation ni modificacion del chat template.

## Capacidades

- Generacion de texto y razonamiento: soporta modos de pensamiento configurables mediante los controles `enable_thinking`, `reasoning_effort` y `preserve_thinking` del chat template original.
- Comprension de imagenes y video: el proyector de vision en FP16 permite entrada multimodal, validado con tres casos deterministicos de imagen local.
- Tool calling nativo: validado con cinco casos del formato nativo de Qwen, compatible con integraciones agente.
- Ventana de contexto larga: 262.144 tokens nativos, adecuado para documentos extensos, conversaciones multi-turno y razonamiento de horizonte largo.
- Codificacion agente: orientado a tareas de agente con multi-step reasoning y uso de herramientas.
- Multilingue: no se especifican los idiomas soportados en la informacion disponible, aunque la familia Qwen suele cubrir multiples lenguas.

## Casos de uso

- Asistente de codificacion en produccion: el modelo puede integrarse en pipelines de CI/CD para generacion, revision y explicacion de codigo, aprovechando su tool calling nativo para interactuar con APIs y repositorios.
- Analisis de documentos extensos: con 262K tokens de contexto, puede procesar manuales tecnicos, contratos o codigo fuente completo de proyectos medianos en una sola pasada, extrayendo informacion y respondiendo preguntas.
- Agente autonomo con vision: al combinar entrada de imagen y tool calling, puede automatizar tareas que requieren leer capturas de pantalla, diagramas o formularios y ejecutar acciones en consecuencia.
- Soporte al cliente multimodal: gestiona conversaciones multi-turno con contexto largo, pudiendo analizar imagenes de productos o capturas de error enviadas por usuarios.
- Investigacion academica: razonamiento configurable (thinking mode) para tareas de analisis, resumen y sintesis de articulos cientificos, con capacidad de procesar figuras y tablas.
- Despliegue local en hardware de consumo: la cuantizacion Q4_K_M permite ejecutar el modelo en una GPU de 24 GB (RTX 3090/4090) o en configuraciones con 21 GB de memoria disponible, habilitando aplicaciones privadas sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar, y las busquedas web no proporcionan datos numericos comparativos. El unico dato de rendimiento disponible es la velocidad de generacion medida en el host de validacion del autor: 13,64 tokens por segundo, sin especificar el hardware utilizado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 21 GB de memoria disponible para el modelo GGUF (16,8 GB), el proyector de vision F16 y el overhead de ejecucion. La memoria de KV-cache crece con la longitud del contexto.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40 GB o superiores. Tambien compatible con AMD Ryzen AI Max y GPU Radeon con soporte Day 0 segun AMD.
- Hardware de consumo: cabe en GPUs de 24 GB VRAM; configuraciones con 16 GB pueden requerir cuantizaciones mas agresivas o offloading parcial a RAM.
- Opciones de despliegue: llama.cpp (recomendado por el autor, con `llama-mtmd-cli`), LM Studio, Ollama, Unsloth GGUF, y servidores compatibles con el formato GGUF.
- Latencia y throughput: 13,64 tokens/s medidos en el host de validacion del autor (hardware no especificado). El rendimiento real dependera de la GPU, la longitud de contexto y el uso de MTP.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar numericamente con alternativas. Cualitativamente, Qwen3.8-27B compite con otros VLM densos de ~27B como Qwen2.5-VL-27B (Apache-2.0, 128K contexto) y con modelos MoE como Qwen3-30B-A3B (3B activos, 32K contexto). La ventaja principal de Qwen3.8-27B es su contexto nativo de 262K tokens y la arquitectura hibrida Gated DeltaNet, que reduce el coste de atencion en secuencias largas. La cuantizacion Q4_K_M de Chungulus es una de las pocas disponibles para este modelo en formato GGUF, lo que facilita su ejecucion en hardware de consumo. No se dispone de datos suficientes para una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M puede reducir la calidad de salida respecto al modelo en FP16, especialmente en tareas de razonamiento complejo o generacion de codigo.
- El prompt de validacion mas largo registrado fue de 73 tokens; no se ha verificado el funcionamiento correcto en la longitud maxima de contexto de 262K tokens.
- El runtime debe soportar la arquitectura hibrida completa (Gated DeltaNet + atencion), el codificador de vision, el tokenizador y los metadatos MTP; cargar solo el tensor de lenguaje no es suficiente.
- La aceleracion especulativa via MTP no se anuncia como soportada en esta cuantizacion, aunque los tensores se conservan.
- No se especifican los idiomas soportados; la cobertura multilingue real debe verificarse con pruebas propias.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribucion y cumplir los terminos del modelo base.
- No hay benchmarks publicados para esta cuantizacion; el rendimiento en tareas especificas debe evaluarse de forma independiente.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/Chungulus/Qwen3.8-27B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio combinado con validacion: https://huggingface.co/Chungulus/Qwen3.8-27B-GGUF/tree/f519a212d6c15cd3292b6ca835dd8ebf235642c0
- Repositorio MTP GGUF: https://huggingface.co/Chungulus/Qwen3.8-27B-MTP-GGUF/tree/main
- Documentacion de Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Guia de ejecucion local (Yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Ficha en LM Studio: https://lmstudio.ai/models/qwen3.8
