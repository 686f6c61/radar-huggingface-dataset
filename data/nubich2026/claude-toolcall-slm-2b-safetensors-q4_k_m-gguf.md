# nubich2026/claude-toolcall-slm-2B-safetensors-Q4_K_M-GGUF

## Resumen

El modelo `nubich2026/claude-toolcall-slm-2B-safetensors-Q4_K_M-GGUF` es una conversión a formato GGUF (cuantización Q4_K_M) del modelo `mondk/claude-toolcall-slm-2B-safetensors`, un modelo de lenguaje de 2 mil millones de parámetros orientado a la llamada de herramientas (tool calling). El nombre sugiere que fue entrenado para imitar el comportamiento de Claude en tareas de uso de herramientas, aunque no se dispone de documentación oficial que lo confirme.

La conversión fue realizada mediante la herramienta GGUF-my-repo de ggml.ai, lo que permite ejecutar el modelo con llama.cpp, llama-server y otras aplicaciones compatibles con GGUF. El modelo está pensado para entornos de inferencia local en CPU o GPU con recursos limitados, gracias a su tamaño reducido y cuantización.

Aunque el modelo base no está documentado en detalle, los datasets listados en la model card (smollm-corpus, smoltalk, the-stack, UltraFeedback y un conjunto de trazas de Claude Code) indican un entrenamiento mixto sobre texto general, código, conversaciones y preferencias humanas. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: mondk/claude-toolcall-slm-2B-safetensors) |
| Parametros totales | 1.711.378.432 (1,71 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el servidor llama.cpp usa 2048 por defecto, pero no es dato oficial) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Dado el tamaño (1,7 B parametros) y los datasets utilizados (smollm-corpus, smoltalk, the-stack, UltraFeedback), es probable que se trate de un transformer decoder-only similar a los modelos SmolLM de HuggingFace, aunque no hay confirmacion explicita. El entrenamiento parece combinar corpus de texto general, codigo fuente, conversaciones sinteticas y datos de preferencia (UltraFeedback), lo que sugiere un proceso de fine-tuning con supervision y posiblemente RLHF/DPO, pero no hay detalles publicados sobre el numero de tokens ni la metodologia exacta.

La conversion a GGUF se realizo con la cuantizacion Q4_K_M, que reduce el peso del modelo a aproximadamente 1,1 GB, manteniendo un equilibrio entre calidad y eficiencia. No se mencionan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto en ingles, con capacidad de completar frases y mantener conversaciones basicas.
- Orientado a la llamada de herramientas (tool calling), segun el nombre del modelo y el dataset de trazas de Claude Code.
- Soporte para ejecucion en CPU y GPU mediante llama.cpp, lo que permite despliegue en entornos sin aceleracion dedicada.
- Capacidad de procesamiento de contexto limitado (no se especifica, pero los modelos de 2B suelen manejar entre 2K y 8K tokens; el servidor llama.cpp usa 2048 por defecto).
- No se indican capacidades de vision, audio ni razonamiento multimodal.

## Casos de uso

- Asistentes de codigo en local: gracias a su entrenamiento con the-stack y las trazas de Claude Code, puede sugerir fragmentos de codigo o completar funciones en entornos de desarrollo sin conexion a internet.
- Automatizacion de tareas con llamada a herramientas: el modelo puede integrarse en pipelines que requieran invocar funciones externas (por ejemplo, consultas a APIs, busquedas o calculos) usando el formato de tool calling.
- Chatbots de bajo coste: al ser pequeno y cuantizado, puede desplegarse en Raspberry Pi o en servidores con poca RAM para atender consultas simples en ingles.
- Prototipado rapido de agentes conversacionales: su licencia Apache 2.0 y su compatibilidad con llama.cpp permiten experimentar sin coste de licencia.
- Educacion y aprendizaje: sirve como ejemplo de modelo pequeno con fine-tuning especifico para tool calling, util para estudiar tecnicas de entrenamiento.
- Generacion de documentacion tecnica: puede redactar textos breves en ingles a partir de instrucciones, aunque con limitaciones de longitud y precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con cuantizacion Q4_K_M (el archivo pesa 1,1 GB, mas overhead de contexto y capas). En CPU pura, se necesitan unos 2-3 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, o integradas modernas con soporte Vulkan. En GPU de gama alta (RTX 3060 o superior) la inferencia es casi instantanea.
- Compatible con consumer GPU: si, cabe en GPUs de gama baja y media.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (si se convierte a formato compatible), llama-cpp-python, y cualquier framework que soporte GGUF.
- Latencia estimada: en CPU moderna (8 nucleos), generacion de 20-30 tokens por segundo; en GPU dedicada, 100+ tokens por segundo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar con modelos alternativos. Como referencia, modelos de tamano similar como SmolLM2-1.7B o Qwen2.5-1.5B podrian ser comparables, pero no hay datos de rendimiento publicados para este modelo.

## Limitaciones y advertencias

- No hay documentacion oficial sobre el proceso de entrenamiento, por lo que se desconocen los sesgos especificos del modelo.
- Riesgo de alucinacion moderado, comun en modelos de 2B parametros, especialmente en tareas de razonamiento complejo.
- Limitacion de idioma: solo entrenado en ingles; puede producir resultados incoherentes en otros idiomas.
- Longitud de contexto no especificada; se recomienda no exceder 2048 tokens para evitar degradacion.
- La cuantizacion Q4_K_M puede reducir ligeramente la precision en comparacion con el modelo original en safetensors.
- No se garantiza la calidad de las llamadas a herramientas; es un modelo experimental sin validacion en produccion.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/nubich2026/claude-toolcall-slm-2B-safetensors-Q4_K_M-GGUF
- Modelo base (safetensors): https://huggingface.co/mondk/claude-toolcall-slm-2B-safetensors
- Herramienta GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
