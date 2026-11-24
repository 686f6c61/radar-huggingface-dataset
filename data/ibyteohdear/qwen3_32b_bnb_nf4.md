# ibyteohdear/qwen3_32b_bnb_nf4

## Resumen

`ibyteohdear/qwen3_32b_bnb_nf4` es una cuantizacion de 4 bits (bitsandbytes, NF4) del modelo Qwen3-VL-32B-Instruct, publicado por el usuario ibyteohdear. El modelo base es el vision-language model denso de 32B de la familia Qwen3-VL desarrollada por el equipo Qwen de Alibaba, orientado a tareas multimodal image-text-to-text con contexto nativo de 256K tokens expandible a 1M. Esta version cuantizada reduce el peso en disco y la VRAM necesaria para inferencia a costa de una perdida de precision numerica respecto al checkpoint original en bfloat16.

El modelo resuelve tareas de comprension y generacion de texto e imagen de forma unificada: OCR multilingue, grounding 2D/3D, razonamiento espacial, comprension de video de larga duracion, generacion de codigo visual (HTML/CSS/JS, Draw.io) y operacion de interfaces graficas como agente visual. La relevancia actual radica en que permite desplegar un VLM de 32B en hardware mas modesto, manteniendo las capacidades del modelo original gracias a la cuantizacion NF4 con doble cuantizacion.

El repositorio ocupa 87,1 GB y declara 33.357.390.064 parametros en safetensors. La licencia es Apache 2.0, lo que facilita uso comercial. No se han publicado resultados de benchmarks especificos para esta version cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language), Qwen3-VL |
| Parametros totales | 33.357.390.064 (segun safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256K nativo, expandible a 1M |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes) |
| Idiomas soportados | no disponible (OCR declarado en 32 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado con bitsandbytes) |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-32B-Instruct es un transformer denso con un codificador visual ViT acoplado a un decoder de lenguaje. Introduce tres innovaciones arquitectonicas declaradas por el autor: Interleaved-MRoPE, que asigna frecuencias completas a lo largo de tiempo, anchura y altura para mejorar el razonamiento sobre video de horizonte largo; DeepStack, que fusiona caracteristicas ViT de multiples niveles para capturar detalles finos y mejorar el alineamiento imagen-texto; y Text-Timestamp Alignment, que sustituye a T-RoPE para localizacion temporal precisa de eventos en video.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo base. Esta version concreta es una cuantizacion NF4 del checkpoint original, sin reentrenamiento adicional; los pesos se han convertido a 4 bits con bitsandbytes, lo que reduce la huella de memoria pero introduce ruido de cuantizacion.

## Capacidades

- Generacion de texto con calidad equiparable a LLMs puros segun el autor, gracias a la fusion texto-vision sin perdida.
- Comprension de imagen: descripcion, VQA, reconocimiento amplio (personajes, anime, productos, lugares, flora y fauna).
- OCR en 32 idiomas, robusto ante baja iluminacion, desenfoque e inclinacion, con mejor manejo de caracteres raros o antiguos y parseo de estructura de documentos largos.
- Grounding 2D y 3D: posiciones de objetos, puntos de vista, oclusiones, razonamiento espacial y embodied AI.
- Comprension de video de horas de duracion con indexacion a nivel de segundo y contexto nativo de 256K (hasta 1M).
- Agente visual: reconoce elementos de GUI de PC y movil, entiende funciones e invoca herramientas para completar tareas.
- Generacion de codigo visual: HTML/CSS/JS y Draw.io a partir de imagenes o videos.
- Razonamiento multimodal en STEM y matematicas con analisis causal y respuestas basadas en evidencia.
- Soporte de tool calling y function calling (declarado como capacidad de agente visual e interaccion con herramientas).
- Capacidades multilingues de texto (idiomas exactos no disponibles).

## Casos de uso

- Digitalizacion de documentos con OCR multilingue: procesar facturas, formularios y documentos escaneados en 32 idiomas, incluyendo manuscritos y caracteres antiguos, con parseo de estructura para extraer campos tabulares.
- Automatizacion de atencion al cliente multimodal: gestionar conversaciones multi-turno con imagenes adjuntas (capturas, fotos de producto) aprovechando el contexto de 256K para historiales largos.
- Agente de operacion de GUI: reconocer elementos de interfaz en capturas de pantalla y emitir acciones para automatizar tareas de escritorio o movil, integrable en frameworks de agentes.
- Analisis de video de vigilancia o media: indexar eventos con marcas temporales precisas en videos de horas de duracion para busqueda y resumen.
- Generacion de prototipos de interfaz: convertir mockups o capturas en HTML/CSS/JS o diagramas Draw.io para acelerar el desarrollo frontend.
- Razonamiento espacial para robotica: grounding 3D y juicio de posiciones y oclusiones en escenas para planificacion de manipulacion en embodied AI.
- Asistencia en educacion STEM: resolver problemas de matematicas y ciencias a partir de fotografias de enunciados o diagramas, con explicaciones causales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta version cuantizada. La model card del modelo base referencia graficas de rendimiento multimodal y de texto puro (imagenes alojadas en `qianwen-res.oss-accelerate.aliyuncs.com`), pero no se incluyen cifras numericas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar cuantizado a 4-bit NF4, los pesos ocupan aproximadamente 16-17 GB; con overhead de activaciones, cache KV y procesador de vision, se recomienda un minimo de 24 GB de VRAM para contexto corto.
- Contexto largo: el cache KV crece linealmente con la longitud; para 256K tokens se requiere hardware con 80 GB o mas (A100 80GB, H100 80GB) o tecnicas de offloading.
- GPU consumer: cabe en RTX 4090 (24 GB) para contextos moderados; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB requeriria offloading parcial a CPU.
- Despliegue: transformers con bitsandbytes (soporte nativo del formato), vLLM con cuantizacion AWQ/GPTQ no aplica directamente a este checkpoint NF4; llama.cpp/Ollama requeririan conversion a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3_32b_bnb_nf4 (esta ficha) | 33,4B (4-bit NF4) | 256K-1M | Apache 2.0 | Hugging Face, transformers |
| Qwen3-VL-32B-Instruct (original) | 32B (bf16) | 256K-1M | Apache 2.0 | Hugging Face, transformers |
| Qwen3-VL-32B-Thinking | 32B | 256K-1M | Apache 2.0 | Hugging Face, transformers |

No se dispone de datos de benchmarks para comparar rendimiento numerico entre estas variantes en la informacion proporcionada. La diferencia principal entre esta version y el checkpoint original es la precision numerica (4-bit frente a bf16) y la huella de memoria.

## Limitaciones y advertencias

- La cuantizacion NF4 introduce degradacion de precision respecto al modelo en bf16; no se han publicado evaluaciones del impacto en tareas especificas.
- Riesgo de alucinacion inherente a los VLM, especialmente en OCR de documentos degradados y en grounding 3D.
- Sesgos conocidos del modelo base no documentados en la informacion disponible.
- Idiomas soportados no declarados explicitamente; el OCR cubre 32 idiomas pero el soporte de texto puede diferir.
- El repositorio tiene 0 descargas y 0 likes, sin validacion comunitaria; creado y actualizado en noviembre de 2026.
- Requiere transformers reciente (build desde source o >= 4.57.0) para cargar la clase `Qwen3VLForConditionalGeneration`.
- Para produccion con contexto largo se necesita hardware de 80 GB o estrategias de offloading; el cache KV a 256K es muy costoso en memoria.
- Aunque la licencia es Apache 2.0, conviene verificar los terminos del modelo base Qwen3-VL-32B-Instruct antes de uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ibyteohdear/qwen3_32b_bnb_nf4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Qwen Chat: https://chat.qwenlm.ai/
- Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
- Qwen2.5-VL Technical Report: https://arxiv.org/abs/2502.13923
- Referencia arXiv 2409.12191: https://arxiv.org/abs/2409.12191
- Referencia arXiv 2308.12966: https://arxiv.org/abs/2308.12966
- Transformers (build desde source): https://github.com/huggingface/transformers
