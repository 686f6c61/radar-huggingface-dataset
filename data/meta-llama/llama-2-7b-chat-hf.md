# meta-llama/Llama-2-7b-chat-hf

## Resumen

Llama-2-7b-chat-hf es la variante conversacional de 7.000 millones de parámetros de la familia Llama 2, desarrollada por Meta AI y publicada en julio de 2023 bajo la Llama 2 Community License. Se trata de un transformer decoder-only denso, ajustado primero con aprendizaje supervisado y después con RLHF (rejection sampling y PPO), pensado para diálogo multi-turno en inglés. Es el modelo de referencia que abrió el uso comercial de los pesos abiertos de Meta y que sirvió de base para una gran parte del ecosistema de fine-tunes de 2023.

El modelo resuelve el caso de uso de asistentes conversacionales autoalojados: al distribuirse con pesos completos, permite despliegue on-premise, ajuste fino y cuantización sin depender de una API. Su ventana de contexto es de 4096 tokens, suficiente para conversaciones medias y tareas de extracción o resumen sobre documentos cortos, pero claramente inferior a los estándares actuales de 32k-128k.

Su relevancia hoy es principalmente histórica y de línea base: con 131.035 descargas y 4.939 likes en HuggingFace, sigue siendo un punto de comparación habitual y un modelo didáctico para estudiar el pipeline SFT + RLHF. Para producción nueva, sin embargo, compite con alternativas de 7-8B con contextos mayores, mejor soporte multilingüe y licencias más permisivas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (atención multi-cabeza estándar en 7B) |
| Parámetros totales | 6.738.417.664 (≈6,74B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | Pesos oficiales en fp16; cuantizaciones de la comunidad en GGUF (2-8 bits), GPTQ, AWQ y bitsandbytes (int8/4-bit) |
| Idiomas soportados | Inglés (etiqueta oficial `en`); competencia residual en otros idiomas por contaminación del corpus, no declarada |
| Licencia | Llama 2 Community License (uso comercial permitido con condiciones) |
| Formato de pesos | safetensors (oficial), PyTorch; conversiones GGUF/GPTQ/AWQ de terceros |
| Acceso | Restringido (gated): requiere aceptar los términos en HuggingFace |
| Librería | transformers |
| Pipeline | text-generation |
| Tamaño del repositorio | 53,9 GB |
| Vocabulario | 32.000 tokens (SentencePiece BPE) |
| Fecha de publicación | 13 de julio de 2023; última actualización del repo el 17 de abril de 2024 |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only con normalización RMSNorm en la entrada de cada subcapa, activación SwiGLU en la MLP y embeddings posicionales rotatorios (RoPE). La variante de 7B usa atención multi-cabeza convencional; las variantes de 34B y 70B del mismo paper incorporan grouped-query attention (GQA) para reducir el coste de la caché KV, mejora que no está presente en este checkpoint. El modelo base se entrenó sobre 2 billones de tokens de datos públicos, con un corte de conocimiento de septiembre de 2022 según el paper.

El ajuste conversacional sigue un pipeline en dos fases: supervised fine-tuning sobre un conjunto de instrucciones y, después, RLHF con muestreo por rechazo y PPO, entrenando modelos de recompensa separados para ayuda y para seguridad. El paper describe además la técnica Ghost Attention (GAtt), utilizada para mejorar la consistencia de las instrucciones del sistema a lo largo de múltiples turnos, y un proceso de red teaming de más de 1.400 horas para el ajuste de seguridad. No hay decodificación especulativa, atención lineal ni modo de razonamiento explícito.

## Capacidades

- Generación de texto y diálogo multi-turno con rol de sistema, usuario y asistente.
- Comprensión lectora, resumen y extracción de información sobre contextos de hasta 4096 tokens.
- Generación de código y matemáticas básicas: funcional en fragmentos cortos, con fiabilidad baja en problemas de varios pasos.
- Seguimiento de instrucciones y formato de salida (listas, JSON simple) mediante prompting.
- Capacidades multilingües limitadas y no garantizadas: el modelo está entrenado y evaluado en inglés.
- No dispone de tool calling ni function calling nativos; cualquier integración con herramientas requiere parsing externo de la salida.
- No dispone de visión, audio, ni modo thinking.
- No soporta agentes multi-paso de forma nativa; requiere orquestación externa.

## Casos de uso

- Asistente conversacional autoalojado: con 4096 tokens de contexto puede mantener diálogos de varias rondas manteniendo el rol de sistema, y al distribuirse con pesos abiertos permite desplegarlo en infraestructura propia sin enviar datos a terceros.
- Clasificación y etiquetado de texto por prompting: extracción de entidades, categorización de tickets o análisis de sentimiento sobre lotes de documentos cortos, con un coste de inferencia bajo para un modelo de 6,74B.
- Resumen de documentos breves: artículos, correos o actas de hasta ~3.000 palabras, aprovechando la ventana completa y el ajuste conversacional para generar resúmenes con instrucciones de estilo.
- Base para fine-tuning específico de dominio: al ser un checkpoint denso de 7B con pesos safetensors, es un punto de partida asequible para LoRA/QLoRA en una sola GPU de 24 GB, por ejemplo para soporte técnico especializado.
- Generación de código asistida en entornos controlados: autocompletado y explicación de fragmentos en editores o pipelines internos donde no se puede usar un servicio en la nube, aceptando una calidad inferior a modelos de código dedicados.
- Evaluación y línea base de investigación: reproducción de experimentos de RLHF y comparación de técnicas de alineación sobre un checkpoint con paper detallado y ampliamente citado.
- Prototipado de chatbots educativos o de demostración: la licencia permite uso comercial con condiciones y el modelo cabe en GPUs de consumo, lo que abarata la validación de producto antes de migrar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2307.09288) y la model card original incluyen evaluaciones en MMLU, GSM8K, HumanEval, BBH, AGIEval y TruthfulQA, pero las cifras concretas no forman parte de la información manejada para esta ficha y no se reproducen aquí para no introducir datos no verificados.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 13,5 GB solo de pesos (6,74B × 2 bytes), más caché KV y activaciones; se recomienda reservar 16-18 GB.
- Caché KV estimada: ~0,5 MB por token en fp16 (32 capas × 32 cabezas × 128 dimensiones × 2 tensores × 2 bytes), es decir, unos 2 GB adicionales para llenar los 4096 tokens de contexto.
- VRAM en cuantización int8: ~7 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): ~4-5 GB.
- GPU de consumo: cabe en fp16 en una RTX 3090, RTX 4090 o RTX A6000 (24-48 GB); en 4 bits funciona en una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB. En 8 bits entra en GPUs de 12 GB con contexto reducido.
- GPU de datacenter: A10G, L4, L40S, A100 (40/80 GB) y H100. Para una sola petición no necesita más de una A100 40 GB, incluso con contexto completo.
- Opciones de despliegue: transformers (referencia), vLLM, Text Generation Inference (TGI), llama.cpp, Ollama, LMDeploy; el tag del repositorio incluye compatibilidad con endpoints y despliegue en SageMaker.
- Latencia y throughput: no disponibles en la información proporcionada. Como orientación, el tamaño de 6,74B y la ausencia de GQA implican una caché KV mayor que la de modelos posteriores del mismo orden con GQA, lo que penaliza el batching en contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Tool calling nativo | Notas |
|---|---|---|---|---|---|---|
| Llama-2-7b-chat-hf | 6,74B | 4096 | Llama 2 Community License | Inglés | No | Acceso gated; requiere aceptar términos |
| Llama 3 8B Instruct | ~8,03B | 8192 | Llama 3 Community License | Multilingüe (8 idiomas declarados) | No nativo en la versión base, soporte vía prompt | Vocabulario de 128k tokens; sucesor directo |
| Mistral 7B Instruct v0.2 | ~7,24B | 32.768 | Apache 2.0 | Inglés | Sí, con plantilla de tool use | Sin cláusulas de escala comercial |
| Zephyr-7B-beta | ~7,24B | 32.768 | Apache 2.0 | Inglés | No | Fine-tune de Mistral 7B con DPO |

En rendimiento comparado no se dispone de cifras verificadas en la información manejada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo centrado en inglés: el rendimiento en castellano y otros idiomas es sensiblemente inferior y no está evaluado oficialmente.
- Ventana de contexto de 4096 tokens: insuficiente para documentos largos, RAG con muchos fragmentos o conversaciones extensas sin resumen intermedio.
- Riesgo de alucinación relevante, especialmente en preguntas factuales y en matemáticas; el ajuste conversacional no incorpora verificación de hechos.
- Corte de conocimiento de septiembre de 2022 según el paper: no conoce eventos ni versiones de software posteriores.
- Calidad baja en código y razonamiento matemático multi-paso en comparación con modelos de 7-8B posteriores.
- No soporta tool calling ni function calling nativos: obliga a implementar parsing y validación de la salida por fuera del modelo.
- El ajuste de seguridad puede producir rechazos excesivos en consultas legítimas (falsos positivos), así como respuestas inconsistentes ante prompts adversariales.
- Licencia Llama 2 Community License: permite uso comercial, pero incluye cláusulas adicionales (límite de usuarios activos mensuales, obligación de atribución "Built with Meta Llama 2" y política de uso aceptable). Conviene revisarla con asesoría legal antes de integrarla en un producto.
- Acceso restringido en HuggingFace: la descarga requiere cuenta y aceptación explícita de los términos, lo que complica la automatización de pipelines de CI/CD.
- Repositorio de 53,9 GB: incluye múltiples formatos y consume espacio considerable en disco frente a los ~13,5 GB de un único checkpoint fp16.
- Sesgos: al entrenarse sobre datos web en inglés, reproduce sesgos de género, culturales y geográficos; Meta documenta el problema pero no lo corrige por completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper Llama 2 (arXiv:2307.09288): https://arxiv.org/abs/2307.09288
- Página oficial de Llama: https://llama.meta.com/
- Repositorio de recetas y ejemplos de Meta: https://github.com/facebookresearch/llama-recipes
- Texto de la licencia: https://llama.meta.com/llama2/license/
- Espejo del modelo en ModelScope: https://www.modelscope.cn/shakechen/Llama-2-7b-chat-hf
