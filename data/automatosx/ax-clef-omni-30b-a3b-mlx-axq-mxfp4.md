# AutomatosX/AX-Clef-Omni-30B-A3B-MLX-AXQ-MXFP4

## Resumen

AX-Clef-Omni-30B-A3B-MLX-AXQ-MXFP4 es un checkpoint cuantizado en formato MLX del modelo Cloudflare/clef-omni, un modelo multimodal (texto, visión y audio) basado en la arquitectura Qwen3OmniMoeForConditionalGeneration. Lo publica AutomatosX dentro de su familia de packs AXQuant (AXQ), una herramienta de cuantización de precisión mixta orientada a Apple Silicon. El pack convierte directamente los pesos BF16 del modelo original a un presupuesto de almacenamiento de clase MXFP4, manteniendo en BF16 la torre de visión, el codificador de audio, el módulo code2wav, las normas y ambas cabezas LM.

La relevancia de este artefacto es doble. Por un lado, demuestra la viabilidad de ejecutar un modelo MoE multimodal de 35,26 mil millones de parámetros lógicos en memoria unificada de Apple Silicon con un tamaño de pesos de 21,49 GB y un BPW medido de 4,8764. Por otro, el propio autor lo etiqueta explícitamente como evidencia de desarrollo y no como una release certificada: no publica mediciones de calidad, de contexto largo, de velocidad de kernels ni de MTP, y anuncia que el pack será reconstruido con una versión mejorada del toolkit.

Conviene subrayar que Clef-Omni no es un modelo conversacional al uso. Según la model card, puntúa un esquema de opciones tipadas: una petición es un estado más preguntas (noul, choice, score) y un único prefill devuelve una probabilidad para cada opción permitida. Cargarlo con mlx_lm.generate o mlx_vlm.generate produce texto que no constituye la salida real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3OmniMoeForConditionalGeneration (MoE multimodal: texto, vision, audio) |
| Parametros totales | 35.259.818.545 (35,26B logicos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card indica "unrecorded tokens"; los limites practicos dependen de la memoria unificada) |
| Tipos de cuantizacion | AXQuant 2.1.0 con metodos affine, bf16 y mxfp4; grupos de 32 y 64; BPW medido 4,8764 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |
| Tamano de pesos | 21,49 GB (descarga completa aproximada de 21,54 GB) |
| Modelo base | Cloudflare/clef-omni (revision 0db1cd2607d76a7bdb2a382f659e7b313079f84b) |
| Runtime principal | MLX-VLM |
| MTP | no incluido (MTP present: False) |
| Vision | si (pesos BF16 protegidos en los shards principales) |
| Audio | si (codificador de audio y code2wav en BF16) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos (MoE) de la familia Qwen3-Omni, con rutas separadas para texto, visión y audio, y una cabeza de esquema conjunta (joint_head) que puntúa opciones tipadas en lugar de generar texto libre. El checkpoint cuantizado mantiene las troncales de atención, MLP y expertos del thinker y del talker en formato AXQ, mientras que la torre de visión, el codificador de audio, code2wav, las normas y ambas cabezas LM permanecen en BF16. Los embeddings de tokens y los routers usan cuantización afín de 8 bits.

La distribución de precisión del pack es la siguiente: 33,15B parámetros en 4 bits (94,02% del total), 361,25M en 8 bits (1,02%) y 1,75B en BF16 (4,96%). No se incluye sidecar MTP ni sidecar de visión; los pesos de visión están protegidos en BF16 dentro de los shards principales. La model card no aporta datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. Tampoco se documenta ninguna innovación de decodificación especulativa ni atención lineal.

## Capacidades

- Procesamiento multimodal de entrada: texto, imágenes y audio, con torres de visión y audio preservadas en BF16.
- Puntuación de esquemas tipados: el modelo evalúa un estado y un conjunto de preguntas (noul, choice, score) y devuelve una probabilidad por cada opción permitida en un único prefill.
- Generación de habla: el pack incluye los pesos del talker y de code2wav, aunque la model card indica que la salida de voz no fue medida.
- Razonamiento sobre opciones discretas: adecuado para tareas de decisión estructurada más que para generación de texto abierto.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no documentado.

## Casos de uso

- Evaluación de modelos multimodales en Apple Silicon: el pack permite cargar un MoE de 35,26B con visión y audio en memoria unificada mediante MLX-VLM, lo que facilita experimentar con la arquitectura Qwen3-Omni sin hardware NVIDIA.
- Puntuación de decisiones estructuradas: gracias a la cabeza de esquema conjunta, puede emplearse para asignar probabilidades a opciones discretas en sistemas de clasificación o ranking, siempre que se respete el protocolo de estado más preguntas descrito en la model card.
- Investigación sobre cuantización de precisión mixta: la distribución de precisión (94,02% en 4 bits, 1,02% en 8 bits, 4,96% en BF16) sirve como caso de estudio para analizar el impacto de proteger determinadas capas en BF16.
- Prototipado de pipelines multimodales ligeros: con 21,54 GB de descarga, encaja en flujos de trabajo locales de desarrollo donde no se dispone de clústeres GPU.
- Análisis de documentos con componente visual: la torre de visión en BF16 permite procesar imágenes dentro del esquema de decisión, aunque la calidad no está certificada por el autor.
- Experimentación con entrada de audio: el codificador de audio en BF16 posibilita probar el pipeline de audio del modelo original en un entorno MLX, con la advertencia de que la salida de voz no fue medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el pack no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad MTP, y que la etiqueta AXQ no debe interpretarse como una afirmación de rendimiento.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al menos 21,54 GB libres en disco para la descarga; en ejecución se requiere memoria unificada suficiente para los pesos más el estado de activación, aunque el autor no publica una cifra concreta y remite a los límites prácticos de la memoria unificada.
- GPU recomendadas: no disponibles; el pack está diseñado para Apple Silicon, no para GPUs NVIDIA.
- Compatibilidad con GPU de consumo: orientado a equipos Apple Silicon con memoria unificada amplia; no se especifican modelos concretos de Mac.
- Opciones de despliegue: MLX-VLM como runtime principal. No se incluye un model-manifest.json nativo validado, por lo que la ejecución en AX Engine no está establecida. No hay pesos GGUF ni PyTorch, de modo que llama.cpp, Ollama, vLLM y TGI no son aplicables directamente a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Clef-Omni-30B-A3B-MLX-AXQ-MXFP4 | 35,26B logicos | no disponible | MLX Safetensors, 4,8764 BPW | Apache 2.0 | Pack de desarrollo, sin benchmarks publicados |
| AX-Clef-Omni-30B-A3B-MLX-AXQ-MXFP8 | 35,26B logicos | no disponible | MLX Safetensors, clase MXFP8 | Apache 2.0 | Hermano del mismo autor con la misma política de roles AXQ; visión, codificador de audio, code2wav, normas y LM head en BF16 |
| Cloudflare/clef-omni | 35,26B logicos | no disponible | BF16 (formato original) | Apache 2.0 | Modelo base sin cuantizar; el loader upstream es PyTorch y no carga este checkpoint MLX |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a estas alternativas.

## Limitaciones y advertencias

- El autor califica el pack como evidencia de desarrollo, no como certificado de calidad; será reconstruido con una versión mejorada de AXQuant y reemplazado como nueva revisión.
- No es un modelo de chat: mlx_lm.generate y mlx_vlm.generate producen texto que no es la salida real del modelo; la interfaz correcta es el esquema de opciones tipadas.
- El loader upstream load_release_model es un cargador PyTorch para el thinker BF16 y no carga este checkpoint MLX ni los pesos del talker o code2wav.
- No se incluye un model-manifest.json nativo validado, por lo que la ejecución en AX Engine no está establecida; los campos de AX Engine en axquant_runtime.json describen un contrato de compatibilidad previsto, no evidencia observada.
- La salida de voz no fue medida.
- No se reclama paridad con el Decision Index, ni calidad de audio o vídeo, ni calidad de generación de texto, ni MTP.
- No se publican mediciones de contexto largo ni de velocidad de kernels.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones de idioma en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un artefacto de desarrollo sin garantías de calidad, su uso en producción requiere validación propia.
- Se recomienda fijar un commit del Hub en despliegues reproducibles en lugar de depender de main, dado que el repositorio será reemplazado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AutomatosX/AX-Clef-Omni-30B-A3B-MLX-AXQ-MXFP4
- Modelo base: https://huggingface.co/Cloudflare/clef-omni/tree/0db1cd2607d76a7bdb2a382f659e7b313079f84b
- Hermano MXFP8: https://huggingface.co/AutomatosX/AX-Clef-Omni-30B-A3B-MLX-AXQ-MXFP8
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
