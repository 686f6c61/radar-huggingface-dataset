# lemonyins/Qwen3.8-27B-ULTIMATE-UNCENSORED-MTP-IQ4-GGUF-16GB

## Resumen

Qwen3.8-27B-ULTIMATE-UNCENSORED-MTP-IQ4-GGUF-16GB es una cuantización GGUF de alta eficiencia del modelo Qwen3.8-27B, preparada por el usuario lemonyins para ejecutarse en tarjetas gráficas con 16 GB de VRAM. El modelo base es una versión "abliterated" (sin censura) de Qwen3.8-27B, desarrollada por AEON-7, que elimina las restricciones de contenido para fines de investigación. Esta variante GGUF emplea una estrategia de precisión híbrida: las capas de atención se mantienen en IQ4_XS mientras que las capas feed-forward (FFN) se reducen a IQ3_S, logrando un tamaño de archivo de 14,9 GB sin sacrificar significativamente la calidad de inferencia.

La relevancia de este modelo radica en su capacidad para ejecutar un LLM de 27B parámetros en hardware de consumo (16 GB VRAM) con una ventana de contexto de hasta 100K tokens gracias al uso de TurboQuant KV cache, una tecnología de cuantización de caché que reduce drásticamente el consumo de memoria. Además, incorpora soporte para decodificación especulativa mediante multi-token prediction (MTP), alcanzando velocidades de hasta 30 tokens/s en una RTX 4060 Ti. El modelo mantiene las capacidades multimodales del Qwen3.8-27B original, incluyendo visión, razonamiento y generación de código, aunque la carga del módulo de visión reduce la ventana de contexto disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, vision-lenguaje (image-text-to-text) |
| Parametros totales | 27B (modelo base Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K nativo; ~100K con TurboQuant en 16 GB VRAM; ~80K con MTP |
| Tipos de cuantizacion | IQ4_XS (atencion y salida), IQ3_S (capas FFN) |
| Idiomas soportados | No disponible (modelo base multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (IQ4_XS/IQ3_S) |

Nota: el dato de parametros totales de safetensors (460.730.096) corresponde a un archivo parcial y no al modelo completo; el modelo base Qwen3.8-27B tiene 27B parametros.

## Arquitectura y entrenamiento

El modelo es una cuantizacion GGUF del Qwen3.8-27B, un transformer denso con capacidades multimodales (vision y texto) y soporte nativo para multi-token prediction (MTP). La arquitectura base incluye atencion por ventanas deslizantes y full attention, con un mecanismo de razonamiento configurable (thinking mode). La version original de Qwen3.8-27B fue entrenada con un corpus multilingue extenso y optimizada para tareas de agente, codificacion y razonamiento de largo alcance.

La cuantizacion fue realizada por lemonyins utilizando la herramienta llama.cpp con soporte TurboQuant (release tqp-v0.3.0 de TheTom/llama-cpp-turboquant). La estrategia de precision hibrida asigna IQ4_XS a las capas de atencion (attn_qkv, attn_k, attn_v, attn_output, output) e IQ3_S a las capas feed-forward (ffn_down, ffn_up, ffn_gate), basandose en la observacion de que las capas FFN tienen mayor redundancia. La matriz de importancia (imatrix) se tomo del proyecto mradermacher/Qwen3.8-27B-heretic-ara-i1-GGUF. El modelo base es una version abliterated (AEON-ULTIMATE-UNCENSORED) que elimina las restricciones de contenido para propositos de investigacion.

## Capacidades

- Generacion de texto y chat conversacional con soporte multi-turno.
- Razonamiento complejo y resolucion de problemas, con modo de pensamiento configurable (thinking mode).
- Generacion de codigo en multiples lenguajes de programacion.
- Capacidades de vision: procesamiento de imagenes y texto (requiere cargar el modulo mmproj-BF16.gguf).
- Soporte de tool calling y function calling para integracion con APIs y agentes.
- Capacidades de agente y razonamiento multi-paso (long-horizon agentic tasks).
- Multilingue: el modelo base soporta numerosos idiomas, aunque la lista exacta no esta disponible en la informacion proporcionada.
- Decodificacion especulativa mediante MTP (multi-token prediction) para mayor velocidad de inferencia.

## Casos de uso

- Asistente de codigo en entornos de desarrollo: el modelo puede generar, revisar y depurar codigo en tiempo real, integrándose con editores o pipelines de CI/CD gracias a su soporte de tool calling y su ventana de contexto de hasta 100K tokens con TurboQuant.
- Chatbot de atencion al cliente con contexto largo: su capacidad para mantener conversaciones multi-turno con historial extenso (hasta 100K tokens) permite gestionar interacciones complejas sin perder el hilo, adecuado para soporte tecnico o atencion comercial.
- Analisis de documentos y extraccion de informacion: con 256K tokens de contexto nativo, puede procesar documentos largos, informes o articulos cientificos y extraer datos relevantes, aunque en 16 GB VRAM la ventana se reduce a ~100K.
- Agente autonomo para automatizacion de tareas: su capacidad de razonamiento multi-paso y tool calling permite construir agentes que interactuan con APIs, ejecutan comandos y toman decisiones secuenciales, por ejemplo en flujos de trabajo de RPA.
- Investigacion en IA sin restricciones de contenido: al ser una version abliterated, es util para estudiar comportamientos de modelos sin censura, analisis de sesgos o generacion de contenido creativo en dominios sensibles, siempre bajo consideraciones eticas.
- Prototipado de aplicaciones multimodales: con el modulo de vision opcional, puede procesar imagenes junto con texto, habilitando casos como descripcion de imagenes, OCR contextual o asistentes visuales, aunque con una reduccion de ~20K en la ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las cifras de perplexity, VRAM y velocidad son heredadas de la metodologia IQ4_XS / IQ4_XS-FFN-IQ3_S y estan pendientes de validacion especifica para Qwen3.8. No se proporcionan datos de MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada: 15,1-15,3 GB con TurboQuant KV cache (contexto 100K-110K) en una GPU de 16 GB.
- GPU recomendada: NVIDIA RTX 4060 Ti 16 GB (probada por el autor). Tambien compatible con otras GPUs de 16 GB VRAM.
- No cabe en GPUs de 8 GB o 12 GB sin reducciones significativas de contexto o cuantizaciones mas agresivas.
- Opciones de despliegue: llama.cpp con soporte TurboQuant (obligatorio, release tqp-v0.3.0 de TheTom/llama-cpp-turboquant). Tambien se menciona vLLM u otros frameworks con soporte TurboQuant, aunque no se detalla.
- Velocidad de inferencia: 20 tokens/s sin MTP y 30 tokens/s con MTP en RTX 4060 Ti 16 GB.
- La carga del modulo de vision reduce la ventana de contexto en ~20K tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 256K | BF16/FP16 | Apache 2.0 | Modelo original con censura |
| Qwen3.8-27B-ULTIMATE-UNCENSORED-MTP-IQ4-GGUF-16GB | 27B | 256K (nativo) | IQ4_XS/IQ3_S | Apache 2.0 | Abliterated, optimizado para 16 GB VRAM |
| mradermacher/Qwen3.8-27B-heretic-ara-i1-GGUF | 27B | 256K | IQ4_XS | Apache 2.0 | Cuantizacion estandar sin abliteration |

No se dispone de datos de rendimiento comparativo entre estas variantes. La principal diferencia radica en la eliminacion de restricciones de contenido (abliteration) y la estrategia de cuantizacion hibrida que reduce el tamano del archivo.

## Limitaciones y advertencias

- El modelo es una version "uncensored" (abliterated) que elimina las restricciones de contenido. Puede generar respuestas inapropiadas, ofensivas o peligrosas. Su uso debe limitarse a entornos de investigacion controlados y con supervisión humana.
- Dependencia critica de TurboQuant: sin una build de llama.cpp con soporte TurboQuant, el consumo de VRAM aumenta significativamente y las cifras de contexto y velocidad no se cumplen.
- Las capas FFN cuantizadas a IQ3_S pueden degradar ligeramente el rendimiento en tareas que dependen fuertemente de la memoria factual (por ejemplo, recuperacion de hechos especificos). La atencion se mantiene en IQ4_XS para preservar la calidad general.
- Las cifras de rendimiento (perplexity, VRAM, velocidad) estan pendientes de validacion especifica para Qwen3.8; se heredan de metodologias similares y podrian variar.
- La ventana de contexto efectiva se reduce a ~100K en 16 GB VRAM (frente a los 256K nativos) y a ~80K con MTP activado. La carga del modulo de vision reduce aun mas la ventana (~20K menos).
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas factuales o de razonamiento complejo.
- No se proporcionan datos de sesgos especificos, pero al ser un modelo abliterated, podria exhibir sesgos amplificados en temas sensibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lemonyins/Qwen3.8-27B-ULTIMATE-UNCENSORED-MTP-IQ4-GGUF-16GB
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Version abliterated (AEON-7): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Cuantizacion de referencia (mradermacher): https://huggingface.co/mradermacher/Qwen3.8-27B-heretic-ara-i1-GGUF
- Repositorio TurboQuant (TheTom): https://github.com/TheTom/llama-cpp-turboquant/releases/tag/tqp-v0.3.0
- Documentacion de Qwen3.8 (Unsloth): https://unsloth.ai/docs/models/qwen3.8
- Pagina de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
