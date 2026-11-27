# plastiqq/Inkling-2-Mini-FPSolve

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Su relevancia radica en combinar una arquitectura MoE eficiente con un contexto de hasta 1 millón de tokens en un checkpoint de aproximadamente 20 GB, lo que permite ejecución en hardware local de gama alta.

La arquitectura es un transformer decoder-only "looped" de 24 capas, de las cuales las 12 centrales se ejecutan tres veces con pesos compartidos, resultando en 48 aplicaciones de capa por token. Emplea capas de feed-forward MoE con enrutamiento a 8 de 128 expertos por token y atención híbrida local/global. El modelo tiene 26,4 mil millones de parámetros totales y 3,4 mil millones activos, con un efectivo de 5,4 mil millones por token debido a los tres pases por las capas repetidas.

El checkpoint se distribuye en precisiones mixtas NVFP4 y MXFP8, y el ecosistema de despliegue es amplio: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth, llama.cpp, Ollama y Exo Labs, entre otros. Esta ficha corresponde a la variante `plastiqq/Inkling-2-Mini-FPSolve`, un derivado publicado por el usuario plastiqq sobre los pesos base de Thinking Machines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y capas repetidas (looped); atencion hibrida local/global; vision transformer para imagenes |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | 3,4B activos; 5,4B efectivos por token (tres pases por las capas repetidas) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Pesos en NVFP4 y MXFP8; versiones GGUF cuantizadas disponibles via Unsloth y llama.cpp; tag 8-bit y modelopt en el repo |
| Idiomas soportados | Ingles y soporte multilingue general; lista explicita de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); GGUF para llama.cpp/Ollama |
| Modalidades de entrada | Texto (UTF-8) e imagen (dimensiones recomendadas entre 40 px y 4096 px) |
| Modalidades de salida | Texto |
| Tamano del repo | 20,2 GB |
| Fecha de publicacion | 20 de noviembre de 2026 (modelo base) |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer autorregresivo multimodal con 24 capas de pesos, de las cuales las 12 intermedias se aplican tres veces con pesos compartidos, dando 48 aplicaciones de capa por token. Cada capa enruta cada token a 8 de 128 expertos en las capas MoE. La atención combina capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido que procesa el decoder de forma conjunta. El autor indica que cada pase adicional por las capas repetidas añade aproximadamente 1,0B de parámetros activos efectivos.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y para objetivos de seguridad. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Comprensión de imágenes (image-text-to-text) con entrada de píxeles entre 40 px y 4096 px por dimensión.
- Razonamiento y tareas de lenguaje natural en inglés y soporte multilingüe general.
- Generación de código en múltiples lenguajes de programación, según la model card.
- Soporte para sistemas agénticos y de uso de herramientas (tool use), según la descripción del autor.
- Integración en sistemas RAG y asistentes de código.
- Ventana de contexto de hasta 1M tokens para conversaciones y documentos extensos.
- Ajuste fino disponible a través de la plataforma Tinker y de frameworks como Miles y SkyRL.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto muy largo gracias a su ventana de hasta 1M tokens, lo que permite arrastrar historiales completos o documentación de producto sin truncar.
- Asistentes de código en producción: su soporte de tool calling y su entrenamiento en múltiples lenguajes de programación lo hacen adecuado para integrarse en pipelines de CI/CD y editores con autocompletado y revisión de parches.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto de forma conjunta, puede procesar facturas, informes escaneados o capturas de pantalla y responder preguntas sobre su contenido.
- Sistemas RAG sobre corpus extensos: con 1M tokens de contexto puede ingerir grandes volúmenes de documentación recuperada y sintetizar respuestas con trazabilidad a las fuentes.
- Agentes multi-paso: la combinación de tool use y contexto largo permite planificar cadenas de acciones con estado persistente entre pasos.
- Despliegue en estación de trabajo local: con un checkpoint de unos 20 GB en NVFP4/MXFP8, puede ejecutarse en un DGX Spark o en Apple Silicon con 32 GB o más, lo que facilita prototipado y pruebas de privacidad sin depender de la nube.
- Ajuste fino específico de dominio: mediante Tinker, Miles o SkyRL se puede adaptar el modelo a tareas verticales (legal, médico, soporte técnico) partiendo de los pesos abiertos.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones que compara Inkling 2 Mini con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL. Sin embargo, en la información proporcionada la tabla aparece truncada y no se incluyen los valores numéricos de las métricas. Por tanto:

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- Checkpoint de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8.
- Hardware soportado oficialmente: 1x NVIDIA DGX Spark; dispositivos Apple Silicon con 32 GB o más de memoria (MacBook, Mac mini, Mac Studio).
- Otras GPU y plataformas son posibles, con recomendación de 32 GB o más de VRAM.
- Cabe en GPU de consumo de gama alta con 32 GB o más de VRAM; para GPUs con menos memoria se requieren versiones GGUF cuantizadas (Unsloth, llama.cpp, Ollama).
- Frameworks de despliegue soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth, llama.cpp, Llama App, Ollama y Exo Labs en Apple Silicon.
- Ajuste fino posterior: Miles y SkyRL.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face; API via Tinker |
| Gemma 4 31B | 31B (aproximado por denominacion) | No disponible | No disponible | No disponible |
| Muse Glimmer | No disponible | No disponible | No disponible | No disponible |
| Qwen3.8-27B | 27B (aproximado por denominacion) | No disponible | No disponible | No disponible |
| Nemotron 3.5 Super VL | No disponible | No disponible | No disponible | No disponible |

Los modelos de comparación aparecen citados en la tabla de evaluaciones de la model card, pero la información proporcionada no incluye sus especificaciones técnicas ni sus resultados numéricos, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas de error en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada; el entrenamiento con datos de internet y sintéticos puede introducir sesgos no especificados.
- Idiomas: el modelo está orientado principalmente al inglés con soporte multilingüe general, pero no se detalla la cobertura ni la calidad por idioma.
- Aunque el contexto es de hasta 1M tokens, el rendimiento en ventanas extremas no está cuantificado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a una política de uso aceptable (Model Acceptable Use Policy) que debe revisarse antes de desplegar en producción.
- La variante `plastiqq/Inkling-2-Mini-FPSolve` es un derivado de terceros con 0 descargas y 0 likes en el momento de la consulta; conviene validar su integridad y comportamiento frente a los pesos oficiales de Thinking Machines.
- El checkpoint en NVFP4/MXFP8 puede degradar ligeramente la calidad frente a precisiones superiores; no se documenta la magnitud de esta degradación.
- Requiere 32 GB o más de memoria/VRAM para ejecución local del checkpoint completo; en configuraciones menores es necesario recurrir a cuantizaciones GGUF.

## Enlaces

- Modelo en Hugging Face (variante FPSolve): https://huggingface.co/plastiqq/Inkling-2-Mini-FPSolve
- Pesos oficiales: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
