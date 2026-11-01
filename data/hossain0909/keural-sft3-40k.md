# hossain0909/keural-sft3-40k

## Resumen

Keural-SFT3-40k es un modelo de lenguaje bilingüe coreano-inglés con arquitectura Mixture-of-Experts (MoE) entrenado desde cero, sin partir de ningún modelo base preexistente. Desarrollado por el usuario hossain0909 (bajo la organización mkd-hossain), este checkpoint corresponde a la época 3 de ajuste por instrucciones (SFT), concretamente al paso 40.000 de los 65.849 totales planificados, entrenado sobre un conjunto fusionado de 2,35 millones de muestras en formato ChatML.

El problema que aborda es la escasez de modelos abiertos con buen rendimiento en coreano: la mayoría de los LLM abiertos están dominados por datos en inglés. Keural entrena su propio tokenizador y pesos desde cero con corpus coreano e inglés, y aplica un pipeline completo de preentrenamiento, SFT y DPO. Con 14,83B de parámetros totales (~7,42B activos por token gracias al enrutamiento top-2 sobre 8 expertos), ofrece un equilibrio entre capacidad y coste de inferencia.

Su relevancia actual radica en ser un ejemplo de modelo "from scratch" con pipeline completo documentado, licencia Apache 2.0 y soporte de despliegue estándar (transformers, vLLM), lo que lo hace evaluable y reproducible para quienes trabajan con LLM bilingües de tamaño medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE estilo Mixtral (8 expertos, enrutamiento top-2) |
| Parametros totales | 14,83B (15.368.933.376 según safetensors) |
| Parametros activos | ~7,42B por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 nativo) |
| Idiomas soportados | Coreano (principal), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

Detalles adicionales: 24 capas, tamaño oculto 4096, 32 cabezas de atención con GQA (8 cabezas KV), dimensión de cabeza 128, tamaño intermedio de experto 5.632, vocabulario de 131.074 tokens (131.072 SPM más `<|im_start|>` y `<|im_end|>`), RoPE theta 500.000, ventana deslizante de 512 en capas alternas, RMSNorm (eps=1e-5), activación SiLU.

## Arquitectura y entrenamiento

Keural emplea una arquitectura MoE estilo Mixtral: 8 expertos por capa con enrutamiento top-2, lo que activa aproximadamente el 50% de los parámetros en cada token. Usa atención agrupada por consultas (GQA) con 8 cabezas KV frente a 32 de consulta, lo que reduce la memoria KV cache, y combina capas con ventana deslizante de 512 tokens alternadas con atención global, una configuración similar a la de Mistral/Mixtral. La normalización es RMSNorm y la activación SiLU, con precisión bfloat16.

El entrenamiento completo se realizó en 2× NVIDIA H200 SXM (139 GiB cada una) con FSDP FULL_SHARD (equivalente a ZeRO-3) y gradient checkpointing. El pipeline incluye: preentrenamiento en dos etapas (~50B + ~13B tokens con corpus web coreano e inglés), SFT época 1 (710M tokens, 1,14M muestras ChatML), una ronda de DPO con 440K pares de preferencia en coreano, SFT época 2 (7,63B tokens, segunda pasada sobre 710K muestras) y la época 3 de este checkpoint (~14B tokens sobre el dataset fusionado de 2,35M muestras, con learning rate en decay coseno de 1e-5 a 1e-6, batch efectivo de 64, AdamW, weight decay 0,05 y clipping de gradiente 1,0).

La composición del dataset de la época 3 es aproximadamente 81% inglés (OpenHermes-2.5, SlimOrca, UltraChat, OpenOrca, Alpaca) y 19% coreano (AIHub multisession/daily/expert, KoInstruct QA y base, KoAlpaca). El formato de chat es ChatML con inyección automática de system prompt.

## Capacidades

- Generación de texto conversacional bilingüe coreano-inglés, con instrucción de sistema para responder en el idioma del usuario.
- Seguimiento de instrucciones (instruction tuning) tras tres épocas de SFT sobre más de 2,3M de muestras.
- Alineación de preferencias mediante DPO con 440K pares en coreano, orientada a mejorar la calidad de respuestas en ese idioma.
- Gestión de conversaciones multi-turno en formato ChatML con tokens especiales dedicados (`<|im_start|>`, `<|im_end|>`).
- Compatibilidad con la API de OpenAI a través de vLLM, lo que facilita la integración en aplicaciones existentes.
- No se ha documentado soporte de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo está optimizado con datos de diálogo multisesión de AIHub (conversación diaria, social y científica), lo que lo hace adecuado para chatbots que mantienen intercambios multi-turno en coreano.
- Atención al cliente bilingüe: con instrucciones de sistema en ChatML puede gestionar tickets en coreano e inglés dentro de la misma organización, respondiendo en el idioma del usuario.
- Prototipado de LLM propios para el mercado coreano: al ser Apache 2.0 y entrenarse desde cero, sirve como base auditable para empresas que necesiten un modelo sin dependencias de pesos de terceros.
- Investigación en MoE desde cero: el pipeline completo documentado (preentrenamiento, SFT, DPO, hiperparámetros y hardware) lo hace útil como referencia reproducible para estudios de entrenamiento de modelos MoE medianos.
- Generación de contenido asistido en coreano: redacción y reformulación de textos aprovechando el vocabulario SPM propio de 131.072 tokens, eficiente para morfología coreana.
- Despliegue con API compatible con OpenAI: mediante vLLM puede integrarse en pipelines de producto existentes sin cambios de cliente, con `max-model-len 4096` y control de memoria GPU ajustable.
- Evaluación comparativa de checkpoints: la serie de checkpoints publicados (pretrained, sft-18k, dpo-final, sft2, sft3-40k) permite estudiar el efecto de cada etapa en métricas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 30,7 GB solo de pesos (el repo ocupa 30,7 GB), más la cache KV; en la práctica se recomienda una GPU con 40 GB o más, o repartir entre dos GPUs de 24 GB.
- GPU recomendadas: NVIDIA A100 40/80 GB o H100/H200 para inferencia cómoda en bf16. En el entrenamiento se usaron 2× H200 SXM (139 GiB cada una).
- Consumer GPU: no cabe en una sola GPU de 24 GB (RTX 3090/4090) en bf16; sería necesario esperar cuantizaciones (GGUF/AWQ/GPTQ, no disponibles actualmente) o usar offloading con `device_map="auto"` a costa de latencia.
- Opciones de despliegue: vLLM (recomendado por el autor, con servidor OpenAI-compatible) y transformers con `AutoModelForCausalLM`. No hay soporte documentado de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Al activar solo ~7,42B de parámetros por token, el throughput debería ser superior al de un modelo denso de 15B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Keural-SFT3-40k | 14,83B | ~7,42B | 4.096 | Apache 2.0 | Bilingüe ko/en, entrenado desde cero, checkpoint intermedio |
| Mixtral-8x7B-Instruct | 46,7B | ~12,9B | 32.768 | Apache 2.0 | Misma familia arquitectónica, mucho mayor, soporte multilingüe más amplio |
| Qwen2.5-14B-Instruct | 14,7B (denso) | 14,7B | 32.768+ | Qwen (uso comercial condicionado) | Denso, buen rendimiento coreano/inglés, contexto mucho mayor |
| Llama-3.1-8B-Instruct | 8B (denso) | 8B | 131.072 | Llama 3.1 | Denso y más ligero, contexto muy superior, coreano menos optimizado |

Keural se sitúa en la franja de 15B totales con coste de inferencia cercano a un denso de 7-8B, pero su contexto de 4.096 tokens es notablemente inferior al de las alternativas citadas. Su ventaja diferencial es el enfoque específico en coreano con pipeline propio y licencia permisiva.

## Limitaciones y advertencias

- Checkpoint intermedio: este modelo corresponde al paso 40.000 de 65.849 (60,7% de la época 3), por lo que no representa el rendimiento final del entrenamiento; puede mostrar inestabilidades propias de un punto medio de entrenamiento.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documentos largos o RAG con mucho contexto recuperado.
- Sesgo de idioma: el dataset de SFT es ~81% inglés y ~19% coreano, pese a que el coreano es el idioma principal declarado; el rendimiento relativo entre idiomas debe validarse empíricamente.
- Al ser un modelo entrenado desde cero por un autor individual con cómputo limitado (2 GPUs), el volumen total de preentrenamiento (~63B tokens) es muy inferior al de modelos comerciales, lo que probablemente se traduzca en menor conocimiento factual y mayor riesgo de alucinación.
- No hay benchmarks publicados ni evaluaciones independientes; no existen cuantizaciones oficiales ni soporte de tool calling documentado.
- Es un checkpoint intermedio en un repo con 282 descargas y sin comunidad activa documentada, lo que implica riesgo de abandono o correcciones pendientes.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero conviene verificar la procedencia de los datasets de entrenamiento (AIHub tiene sus propios términos de uso para datos coreanos).
- Detalle técnico crítico: al generar, hay que fijar `eos_token_id=131073` (`<|im_end|>`); usar el ID 2 (`<eos>`) provocará generaciones que no se detienen correctamente.

## Enlaces

- HuggingFace: https://huggingface.co/hossain0909/keural-sft3-40k
- Modelo base (preentrenamiento): https://huggingface.co/mkd-hossain/keural-pretrained
- Checkpoints relacionados mencionados en la model card: mkd-hossain/keural-sft-18k, mkd-hossain/keural-dpo-final, mkd-hossain/keural-sft2 (URLs exactas no disponibles en la información proporcionada)
- Paper, blog o demos: no disponibles
