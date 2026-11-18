# DogContext/GLM-5.3-Flash-Uncensored-Q2-ds4

## Resumen

GLM-5.3-Flash-Uncensored-Q2-ds4 es una cuantización GGUF de aproximadamente 2 bits del modelo GLM-5.3-Flash en su variante "uncensored" (abliterated), publicada por el usuario DogContext. El modelo base original lo desarrolla zai-org, mientras que la versión sin censura procede de orcarouter/GLM-5.3-Flash-Uncensored-FP8, un proceso de abliteración sobre los pesos oficiales. Esta build concreta está pensada para ejecutarse de forma residente en un único Mac con Apple Silicon de 128 GB mediante el motor `ds4` (DwarfStar), no en llama.cpp, Ollama, LM Studio ni vLLM.

Se trata de un modelo MoE de 320.759.404.382 parámetros totales (aproximadamente 320B) con unos 18B parámetros activos, 45 capas (3 densas y 42 MoE), 288 expertos enrutados más 1 compartido con top-8, atención híbrida KDA-linear más sparse-DSA, contexto de 1M tokens y un bloque nativo de decodificación especulativa MTP. La cuantización combina IQ2_XXS y Q2_K calibrada con una importance matrix de 1,5M tokens, lo que permite reducir el peso a 96,5 GB manteniendo protegidas las rutas de control (router, compuertas KDA, indexer).

Su relevancia actual radica en que, en el momento de la publicación, es la única variante pública de GLM-5.3-Flash que combina simultáneamente pesos sin censura, ejecución residente en un solo Mac de 128 GB, MTP nativo y calibración imatrix. Los pesos oficiales sin censura solo están disponibles para clústeres de GPU (FP8/NVFP4), y el GGUF de consumidor existente pierde MTP y requiere una build preliminar de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm5Next (MoE transformer híbrido con atención KDA-linear + sparse-DSA) |
| Parametros totales | 320.759.404.382 (~320B) |
| Parametros activos | ~18B (MoE, top-8 de 288 expertos enrutados + 1 compartido) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | IQ2_XXS (expertos enrutados gate/up), Q2_K (expertos down), Q4_K (compuertas KDA), Q8_0 (embedding/salida), Q8/fuente (tronco, experto compartido, proyecciones de atención), bf16 (router y normas 1-D) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (formato específico del motor `ds4`, no compatible con llama.cpp mainline) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `Glm5Next`: un transformer MoE con 45 capas, de las cuales 3 son densas y 42 son MoE. Cada capa MoE dispone de 288 expertos enrutados más un experto compartido, con activación top-8. La atención es híbrida, combinando KDA-linear con sparse-DSA (atención dispersa). Incorpora un bloque nativo de decodificación especulativa MTP (multi-token prediction) y un vocabulario de 154.880 tokens. El contexto declarado alcanza 1M tokens.

La cuantización no es uniforme: el tronco, el experto compartido y las proyecciones de atención se mantienen en Q8 o en la precisión de origen, mientras que la compresión agresiva a 2 bits se aplica solo a los expertos enrutados, donde un MoE de 320B presenta mayor redundancia. La importance matrix se recogió con el runtime `ds4` sobre el conjunto de calibración de routed-MoE de antirez (código, agentic/tool-call, lenguaje, contexto largo y razonamiento) con un presupuesto de 1,5M tokens, y se aplicó a los pesos sin censura. El autor justifica esta transferencia indicando que la abliteración solo modifica la dirección de rechazo y no el router, por lo que las activaciones de los expertos enrutados son idénticas. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset original ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y contexto largo gracias a una ventana de 1M tokens.
- Capacidad de código y tool calling/agentic, según el conjunto de calibración empleado (código, agentic/tool-call, razonamiento).
- Decodificación especulativa nativa mediante MTP, que acelera la generación.
- Comportamiento "uncensored": los rechazos se han eliminado en gran medida en tareas convencionales mediante abliteración.
- Modalidad texto; la visión se menciona como posible mediante un encoder sidecar opcional, no incluido.
- No se documentan capacidades de audio ni un modo "thinking" explícito en la información disponible.

## Casos de uso

- Evaluación de seguridad y red teaming local: al ser un modelo abliterated, permite probar la robustez de filtros y salvaguardas en un entorno controlado sobre Apple Silicon, sin depender de clústeres de GPU.
- Investigación sobre abliteración: sirve para estudiar cómo afecta la eliminación de la dirección de rechazo al comportamiento del modelo en tareas convencionales, comparándolo con la variante FP8 oficial.
- Evaluación de agentes de código en local: el conjunto de calibración incluye código y tool-call, y el modelo puede integrarse en flujos agentic de evaluación sobre un Mac de 128 GB con el motor `ds4`.
- Procesamiento de documentos largos en inglés o chino: la ventana de 1M tokens permite analizar corpus extensos en una sola pasada, con un footprint residente de unos 93 GiB.
- Experimentación con decodificación especulativa: el bloque MTP nativo permite medir el impacto del draft head en latencia y throughput dentro del motor `ds4`.
- Desarrollo y pruebas offline en estación de trabajo: al ejecutarse de forma residente en un único Mac M5 Max de 128 GB, facilita iterar sin conectividad ni infraestructura de GPU.
- Estudio de cuantización extrema: la receta mixta IQ2_XXS/Q2_K con imatrix sirve como caso de referencia para analizar la degradación de un MoE de 320B a ~2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo proporciona métricas de velocidad medidas con `ds4-bench` en un M5 Max de 128 GB, en modo residente, con `--ctx 32768` y sin `--mtp`, en ejecuciones únicas (no medianas):

| Metrica | Valor |
|---|---|
| Decodificacion | ~29–30 tok/s |
| Prefill | ~375–440 tok/s |
| Primer token | ~34 ms (contexto >= 16K) |
| Degradacion por contexto | ~-1,9% de 8K a 32K |
| Huella residente | ~93 GiB sobre 128 GB (~35 GiB de margen para SO y KV) |

## Requisitos de hardware

- VRAM/RAM estimada: ~93 GiB residentes para el GGUF de 96,5 GB; se recomienda un equipo con 128 GB de memoria unificada para dejar margen al sistema operativo y a la caché KV.
- GPU recomendadas: Apple Silicon M5 Max con 128 GB (plataforma validada por el autor). No se documenta soporte para A100, H100 ni RTX 4090 con este formato.
- Cabe en GPU de consumidor: no en el sentido convencional; requiere un Mac de 128 GB de memoria unificada. No se indica compatibilidad con GPUs NVIDIA de consumo para esta build.
- Opciones de despliegue: exclusivamente el motor `ds4` / DwarfStar sobre Metal. No funciona en llama.cpp mainline (la arquitectura `glm5next` no está soportada), ni en Ollama, LM Studio o vLLM.
- Latencia y throughput: ~29–30 tok/s de decodificación, ~375–440 tok/s de prefill y ~34 ms hasta el primer token en M5 Max de 128 GB, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | MTP | Calibrado | Licencia |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-Uncensored-Q2-ds4 (esta build) | ~320B totales, ~18B activos | 1M | GGUF para `ds4` / Metal | Si | Si (imatrix 1,5M) | MIT |
| orcarouter/GLM-5.3-Flash-Uncensored-FP8 | ~320B totales, ~18B activos | 1M | FP8 (~306 GiB), vLLM en GPUs NVIDIA | No indicado | No indicado | MIT |
| GLM-5.3-Flash-Uncensored-NVFP4 | ~320B totales, ~18B activos | 1M | NVFP4 (~177 GiB), vLLM en 8xH100/Blackwell | No indicado | No indicado | MIT |
| GLM-5.3-Flash-Uncensored-GGUF (Q2_K) | ~320B totales, ~18B activos | 1M | GGUF (~90 GiB), llama.cpp (build preliminar) | No | No | MIT |

## Limitaciones y advertencias

- Los pesos están abliterated: los rechazos se han eliminado en gran medida, lo que traslada al usuario toda la responsabilidad sobre un uso lícito bajo la licencia MIT del modelo base.
- El autor lo destina a investigación local, evaluación autorizada de seguridad y red teaming, y evaluación de código agentic, no a la producción de contenido dañino.
- La cuantización a ~2 bits puede degradar la calidad frente a FP8 o NVFP4; el autor no publica benchmarks de calidad que permitan cuantificar esa pérdida.
- Solo soporta inglés y chino; no se documenta soporte para castellano ni otros idiomas.
- Compatibilidad muy restringida: únicamente el motor `ds4` sobre Metal; falla en llama.cpp, Ollama, LM Studio y vLLM con el error `unknown architecture 'glm5next'`.
- Requiere hardware específico (Mac con 128 GB de memoria unificada); no es desplegable en GPUs de consumo convencionales con este formato.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas para esta build.
- No se dispone de información sobre sesgos conocidos del modelo base en la documentación proporcionada.
- Las métricas de velocidad son ejecuciones únicas, no medianas, y sin MTP activado, por lo que no deben tomarse como rendimiento sostenido garantizado.
- La visión se menciona solo como posible mediante un encoder sidecar opcional que no se incluye.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DogContext/GLM-5.3-Flash-Uncensored-Q2-ds4
- Modelo base sin censura (FP8): https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Motor ds4 / DwarfStar: https://github.com/antirez/ds4
- Bench de velocidad independiente: https://github.com/x746b/ds4/tree/main/speed-bench
- PR de llama.cpp para glm5next: https://github.com/ (PR #27754, enlace incompleto en la información disponible)
