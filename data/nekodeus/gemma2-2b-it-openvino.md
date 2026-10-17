# Nekodeus/gemma2-2b-it-openvino

## Resumen

Conversión a OpenVINO IR del modelo instruct `google/gemma-2-2b-it`, publicada por el usuario Nekodeus con cuantización INT8 de solo pesos. El modelo base es un transformer decoder-only de 2,6 mil millones de parámetros, con 8192 tokens de contexto y atención intercalada local/global, pensado por Google para tareas de generación de texto e instrucciones en entornos con recursos limitados.

El repositorio no contiene pesos originales en safetensors ni GGUF, sino un artefacto OpenVINO IR de 2,7 GB optimizado para inferencia en CPU y hardware Intel mediante `optimum-intel` y OpenVINO GenAI. La conversión se realizó en Kaggle con CPU exclusivamente, sin conexión y sin token, usando `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1`, con el límite `MAX_TRANSFORMERS_VERSION` saltado.

Su relevancia práctica está en desplegar un modelo instruct pequeño en ordenadores, servidores sin GPU dedicada o dispositivos Intel con NPU/iGPU, reduciendo el peso de los pesos a INT8. Ahora bien, se trata de una conversión no oficial, sin benchmarks publicados, sin descargas ni validación comunitaria en el momento de la ficha, y su licencia sigue siendo la de Gemma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Gemma2ForCausalLM`) con atención intercalada local/global |
| Parámetros totales | 2,6 mil millones (2.6B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | INT8 weight-only (NNCF); activaciones FP16/FP32 según el trazado. No se incluyen variantes GGUF, FP16 ni BF16 |
| Idiomas soportados | No disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | OpenVINO IR (`.xml` y `.bin`); no safetensors ni GGUF |
| Tamaño del repositorio | 2,7 GB |
| Modelo base | `google/gemma-2-2b-it` |
| Librería | `openvino` / `optimum-intel` |
| Pipeline | `text-generation` |
| Fecha de creación | 17 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Gemma 2 2B: un transformer decoder-only con atención intercalada entre capas locales y globales, lo que permite manejar 8192 tokens de contexto con un coste de atención más contenido que una atención global completa en todas las capas. El repositorio no entrena ni ajusta el modelo: únicamente exporta los pesos a OpenVINO IR y aplica cuantización INT8 de solo pesos mediante NNCF, dejando las activaciones en FP16/FP32 según el trazado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, las fases de alineación —RLHF, DPO u otras— ni las innovaciones de entrenamiento del modelo original en la información proporcionada. La model card tampoco documenta evaluación alguna del efecto de la cuantización INT8 sobre la calidad respecto al modelo base. El proceso de conversión sí está detallado: `optimum-cli export openvino --model google/gemma-2-2b-it --task text-generation --weight-format int8`, ejecutado con las versiones indicadas y con el control de versión máxima de Transformers desactivado.

## Capacidades

- Generación de texto e instrucciones en formato conversacional, con la plantilla de turnos de Gemma (`<start_of_turn>user`, `<start_of_turn>model`).
- Razonamiento y matemáticas de complejidad moderada, limitado por el tamaño de 2,6B y por la ausencia de benchmarks publicados que cuantifiquen su rendimiento.
- Generación y explicación de código, sin evaluación publicada en HumanEval ni en otros conjuntos de referencia.
- Tool calling o function calling no nativo: puede inducirse mediante prompting, pero no hay API de funciones ni garantía de formato estructurado.
- Uso en agentes y razonamiento multi-paso no específicamente diseñado; la ventana de 8192 tokens limita cadenas largas de pasos y observaciones.
- Capacidades multilingües no documentadas en la información proporcionada; no se ofrece una relación de idiomas soportados.
- Sin visión, audio, modo thinking explícito ni otras capacidades multimodales.
- Inferencia orientada a CPU y hardware Intel mediante OpenVINO, no a GPUs NVIDIA mediante CUDA.

## Casos de uso

- Asistente conversacional local en ordenadores de oficina con CPU Intel: se puede cargar con `OVModelForCausalLM` o `ov::genai::LLMPipeline` y mantener conversaciones multi-turno de hasta 8192 tokens sin enviar datos a la nube.
- RAG documental ligero en intranet: el modelo puede responder preguntas sobre fragmentos recuperados por un buscador vectorial externo, con la ventaja de que el contexto de 8k permite incluir varios pasajes y el histórico reciente.
- Resumen y extracción de información por lotes en servidores sin GPU: la cuantización INT8 reduce el peso a aproximadamente 2,6 GB y permite procesar colas de documentos en CPU con OpenVINO.
- Clasificación y etiquetado de tickets o correos: mediante prompts con instrucciones y ejemplos, útil para categorización y extracción de campos, siempre con validación posterior de la salida.
- Ayuda a la programación en el IDE: autocompletado, explicación de funciones y generación de fragmentos cortos; adecuado para tareas acotadas, no para razonar sobre repositorios extensos.
- Atención al cliente y FAQ on-premise: despliegue en una máquina Intel con OpenVINO GenAI para responder preguntas frecuentes y derivar casos complejos, manteniendo la conversación en local.
- Prototipado y docencia: permite experimentar con un modelo instruct de 2,6B en portátiles o equipos de laboratorio sin GPU dedicada, usando el formato IR y las herramientas de Intel.
- Traducción y reescritura: puede emplearse si se valida previamente el par de idiomas, ya que la model card no documenta la cobertura lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni comparaciones con el modelo base en FP16/BF16, y tampoco se aportan métricas de latencia o throughput.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 2,6 GB en INT8; el repositorio completo ocupa 2,7 GB.
- Memoria recomendada: al menos 6-8 GB de RAM para inferencia con contexto moderado; 8-16 GB para aprovechar los 8192 tokens y evitar presión de memoria por la caché KV y el runtime.
- VRAM estimada: 4-6 GB si se ejecuta en una GPU Intel compatible; en iGPU Intel la memoria se comparte con la RAM del sistema.
- GPU recomendadas: Intel Arc A380, A750 o A770 para el plugin GPU de OpenVINO; también iGPU Intel Iris Xe y NPU Intel en procesadores compatibles. Las GPUs NVIDIA no son la ruta nativa principal de OpenVINO.
- Cabe en hardware de consumo: sí, en equipos con 8 GB de RAM o más y en mini-PC/NUC Intel; no requiere GPU dedicada.
- Opciones de despliegue: `optimum-intel` con `OVModelForCausalLM`, OpenVINO GenAI con `LLMPipeline` y OpenVINO Model Server. No es compatible directamente con vLLM o TGI, y no se incluye GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. No se aportan medidas en la información proporcionada y dependerán del procesador, la versión de OpenVINO y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / precisión | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| `Nekodeus/gemma2-2b-it-openvino` | 2,6B | 8192 | OpenVINO IR, INT8 weight-only | Gemma Terms of Use | Repositorio HuggingFace, 0 descargas |
| `google/gemma-2-2b-it` | 2,6B | 8192 | Safetensors, precisión original del modelo base | Gemma Terms of Use | Modelo oficial, acceso condicionado en HuggingFace |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,54B | 32 768 | Safetensors y GGUF | Apache 2.0 | Modelo oficial con amplia disponibilidad |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,2B | 128 000 | Safetensors y GGUF | Llama 3.2 Community License | Modelo oficial, acceso condicionado |

Los datos de Qwen2.5-1.5B-Instruct y Llama 3.2 3B Instruct provienen de sus fichas públicas y no se han verificado en la información proporcionada; se incluyen solo como referencia de categoría. No hay datos de benchmarks que permitan comparar calidad entre estas alternativas y la conversión OpenVINO.

## Limitaciones y advertencias

- Conversión no oficial: no está publicada por Google ni validada por el equipo de Gemma; no hay garantía de equivalencia funcional con el modelo base.
- Ausencia de benchmarks: no se ha medido la degradación de calidad introducida por la cuantización INT8 ni el rendimiento en tareas concretas.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la ficha; no hay informes de uso en producción.
- Contexto limitado a 8192 tokens: insuficiente para documentos muy largos, repositorios completos o conversaciones extensas sin resumen intermedio.
- Idiomas no documentados: no se puede asumir una cobertura multilingüe concreta sin pruebas previas.
- Riesgo de alucinación: es un modelo de 2,6B; puede inventar hechos, referencias y APIs, especialmente en dominios especializados.
- Sesgos heredados: al no documentarse el dataset de entrenamiento ni las fases de alineación, no es posible auditar sesgos de género, idioma, cultura o ideología.
- Tool calling no nativo: no hay soporte de funciones estructurado; cualquier integración con agentes requiere validación y capas externas.
- Dependencia de versiones: el artefacto se generó con `openvino 2026.4.1`, `optimum-intel 2.2.0` y `transformers 5.16.1`, y se saltó el límite `MAX_TRANSFORMERS_VERSION`; versiones distintas pueden requerir ajustes.
- Portabilidad limitada: al ser OpenVINO IR, no se puede cargar directamente con llama.cpp, Ollama, vLLM o TGI; haría falta convertir o exportar de nuevo.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use y a la política de uso aceptable; esta ficha no constituye asesoramiento legal.
- Seguridad: como cualquier LLM, es susceptible a inyección de prompts y a la exfiltración de datos si se le concede acceso a herramientas o información sensible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nekodeus/gemma2-2b-it-openvino
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Resultados de búsqueda web: no se encontraron enlaces técnicos relevantes; los resultados devueltos correspondían a sitios de noticias Pravda sin relación con el modelo.
