# RentedNoodle/Qwen3.8-27B-GSQ-RCO-IQ3_XXS-Uncensored

## Resumen

Qwen3.8-27B-GSQ-RCO-IQ3_XXS-Uncensored es una cuantización GGUF de 3 bits del modelo Qwen3.8-27B, creada por RentedNoodle a partir del checkpoint abliterado de huihui-ai/Huihui-Qwen3.8-27B-abliterated. El modelo original, Qwen3.8-27B de Qwen, es un modelo denso vision-language de 27.320 millones de parámetros con contexto largo, visión y razonamiento. Esta variante aplica una cuantización agresiva (3.058 bits por peso) siguiendo la metodología GSQ/RCO de ISTA-DASLab, preservando tensores sensibles (puertas SSM, embeddings, puertas de atención) en BF16. El objetivo es ejecutar el modelo completo con 196K tokens de contexto en una GPU de 16 GB, manteniendo la cabeza MTP para decodificación especulativa. Es relevante para desarrolladores que necesitan un modelo multimodal de gran contexto en hardware de consumo, con capacidades de tool calling y razonamiento, y con una capa de abliteración que reduce los rechazos aprendidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con componentes SSM y atencion (hibrido), vision-language |
| Parametros totales | 27.320.697.856 (27.32B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 196.608 tokens (reclamado; calidad completa no verificada) |
| Tipos de cuantizacion | GGUF IQ3_XXS con tensores selectos en BF16 (GSQ/RCO) |
| Idiomas soportados | No disponible (el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con mmproj en BF16 o Q8_0 para vision) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un modelo denso que combina mecanismos de atencion con capas de state space models (SSM), como indican los tensores de puertas SSM preservados en BF16 en esta cuantizacion. Incluye una cabeza MTP (multi-token prediction) para decodificacion especulativa. El checkpoint original fue desarrollado por Qwen, con capacidades nativas de vision (imagenes y video), control flexible de razonamiento y soporte de tool calling. Sobre ese modelo, huihui-ai aplico una ablacion de rechazo (abliteracion) para reducir las respuestas de rechazo aprendidas. Finalmente, RentedNoodle produjo esta cuantizacion GGUF siguiendo el mapa de asignacion por tensor publicado por ISTA-DASLab para Qwen3.8-27B, aplicado a los pesos abliterados. No se dispone de informacion detallada sobre los datos de entrenamiento, el numero de tokens o el uso de RLHF/DPO; el autor declara explicitamente que no se re-ejecuto la busqueda de presupuesto RCO multi-GPU.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking mode) configurable.
- Comprension de imagenes y video (vision) mediante el proyecto multimodal (mmproj) opcional.
- Tool calling / function calling con soporte de formatos JSON y XML, validado en pruebas de toolcall.
- Capacidades de agente y razonamiento multi-paso, con soporte de cadenas de herramientas y verificacion.
- Multilingue (el modelo base es multilingue, aunque la ficha no especifica idiomas).
- Contexto largo de hasta 196K tokens, con KV cache cuantizada q4_0 para caber en 16 GB.
- Decodificacion especulativa mediante la cabeza MTP, con tasas de aceptacion de 0.46 a 0.95 segun la carga de trabajo.
- "Uncensored": reduccion de rechazos aprendidos mediante abliteracion, disenado para comportamientos menos restrictivos.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 196K tokens), lo que permite mantener el historial completo de una interaccion extensa sin perder informacion. La capacidad de tool calling permite integrarlo con sistemas de ticketing o CRM.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para revision de codigo, generacion de pruebas o automatizacion de tareas de desarrollo. La decodificacion especulativa (MTP) reduce la latencia en entornos interactivos.
- Agentes autonomos de razonamiento multi-paso: el modo de pensamiento y el soporte de cadenas de herramientas permiten construir agentes que planifican, ejecutan acciones y verifican resultados, con la ventaja de un contexto amplio para mantener el estado del agente.
- Analisis de documentos largos: gracias al contexto de 196K tokens, puede procesar contratos, informes tecnicos o expedientes completos, extrayendo informacion, resumiendo o respondiendo preguntas especificas sin necesidad de dividir el texto.
- Procesamiento de imagenes y video: con el proyecto multimodal (mmproj), el modelo puede describir imagenes, leer texto en capturas (OCR) o analizar videos, util en aplicaciones de archivo, moderacion de contenido o accesibilidad.
- Despliegue local en GPU de 16 GB: la cuantizacion de 9.73 GiB permite ejecutar el modelo completo en una GPU de consumo de 16 GB, ideal para entornos con requisitos de privacidad o sin conexion a Internet, usando llama.cpp o Ollama.
- Investigacion en razonamiento matematico y cientifico: aunque los benchmarks academicos estan pendientes, el modelo base esta disenado para tareas de razonamiento complejo, y la referencia de ISTA-DASLab sugiere un rendimiento alto en AIME/GPQA, lo que lo hace util para prototipos en investigacion.
- Prototipado rapido de aplicaciones conversacionales: la compatibilidad con Ollama y llama-server permite iterar rapidamente en chatbots, asistentes de documentacion o herramientas internas sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (AIME, GPQA, LiveCodeBench) para este archivo especifico; el autor indica que estan pendientes. Como referencia, el mismo tamano de clase con cuantizacion de ISTA-DASLab reporta AIME25 100.0, GPQA-Diamond 88.89 y LiveCodeBench v6 84.57, pero son datos de su base, no de este archivo.

Pruebas internas reportadas por el autor:

| Prueba | Resultado | Configuracion |
|---|---|---|
| Needle retrieval | 6/6 | 15K-word haystack, profundidades 0.1-0.9, temp 0.0, 64K server ctx |
| Toolcall v1 (Pi JSON path) | 8/8 | tool_call_format=json |
| Toolcall v2 (args + must-not-fire + chains) | 7/14 raw-template; negatives 4/4 clean | build2 tools+MTP flake; Pi-path pendiente |
| Livebench-style | 12/12 | razonamiento/codigo/extraccion |
| Coherence | 4/4 | continuidad multi-turno |

Rendimiento medido en RTX 5070 Ti 16 GB, build2 llama.cpp:

| Configuracion | Decode | Notas |
|---|---|---|
| Serial / sin spec | ~39.6 t/s | Prosa 400 tokens, thinking on |
| MTP n-max 2 | ~59.3 t/s | +50% vs serial, accept 0.46-0.95 |
| MTP n-max 2 + --fit off + --spec-draft-backend-sampling + -b 1024 | 69-82 t/s | Flags recomendados |
| KV iq4_nl | 26.8 t/s | Sin kernel rapido, no usar |

## Requisitos de hardware

- VRAM estimada: 15.8/16 GB con KV cache q4_0/q4_0 para contexto completo de 196K. El archivo principal ocupa 9.73 GiB.
- GPU recomendada: RTX 5070 Ti 16 GB (usada en las pruebas del autor); cualquier GPU con 16 GB de VRAM y soporte de CUDA.
- Compatible con GPU de consumo: si, siempre que tengan 16 GB de VRAM (RTX 4080/4090, 5070 Ti, etc.).
- Opciones de despliegue: llama.cpp (llama-server), Ollama. Tambien es compatible con endpoints que usen GGUF.
- Latencia/throughput: 39.6 t/s en modo serial, 59.3 t/s con MTP n-max 2, y 69-82 t/s con los flags optimos en RTX 5070 Ti.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | 27.32B | 196K | BF16 (original) | Apache 2.0 | HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27.32B | 196K | BF16 (abliterado) | Apache 2.0 | HuggingFace |
| RentedNoodle/Qwen3.8-27B-GSQ-RCO-IQ3_XXS-Uncensored | 27.32B | 196K (reclamado) | GGUF IQ3_XXS + BF16 selecto | Apache 2.0 | HuggingFace |

No hay datos de benchmarks comparables para los otros dos en la informacion disponible; los benchmarks del modelo cuantizado estan pendientes.

## Limitaciones y advertencias

- Cuantizacion agresiva de 3 bits (3.058 bpw): no se debe esperar el comportamiento del modelo en BF16; la recuperacion de conocimiento es mas debil que en variantes de mayor precision.
- La calidad del contexto de 196K no esta completamente verificada; las pruebas de calidad se realizaron con 32K de contexto de servidor y 64K de needle. La recuperacion a 196K completo esta pendiente.
- La abliteracion reduce los rechazos aprendidos, pero no garantiza cumplimiento universal. El desplegador es responsable del uso conforme a la ley.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la cuantizacion agresiva.
- El comportamiento de tool calling y razonamiento requiere el template Froggeric especifico (froggeric-qwen3.8-tool-use.jinja); con Ollama el comportamiento de herramientas no esta certificado.
- Los benchmarks academicos (AIME/GPQA/LiveCodeBench) no se han publicado para este archivo, por lo que no hay evidencia directa de rendimiento en tareas de razonamiento.
- Puede haber sesgos heredados del modelo base, no mitigados por la cuantizacion ni por la abliteracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RentedNoodle/Qwen3.8-27B-GSQ-RCO-IQ3_XXS-Uncensored
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint abliterado de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio companion del mmproj: https://huggingface.co/RentedNoodle/Qwen3.8-27B-mmproj
