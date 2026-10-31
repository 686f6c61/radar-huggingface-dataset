# saidutta69/LFM3-1.7B-Base-heretic

## Resumen

LFM3-1.7B-Base-heretic es una variante "decensurada" (abliterated) del modelo base LiquidAI/LFM3-1.7B-Base de Liquid AI, publicada por el usuario saidutta69 en HuggingFace. El modelo original se ha sometido a un proceso de abliteración mediante la herramienta Heretic v1.4.0, que elimina la dirección de rechazo (refusal direction) de los pesos del modelo sin necesidad de reentrenamiento. El resultado es un checkpoint base que apenas se niega a responder (5/100 frente a 76/100 del original) con una divergencia KL muy baja de 0.0149 y sin pérdida medible de conocimiento en MMLU.

Es importante entender que se trata del checkpoint **preentrenado** (Base), no del modelo alineado para chat. Liquid AI recomienda el checkpoint Base únicamente para fine-tuning intensivo: asistentes específicos de dominio o idioma, entrenamiento con datos propietarios o experimentos de post-training. Este modelo heretic está pensado para quien quiere construir su propio fine-tune partiendo de una base sin la dirección de rechazo, de modo que no tenga que "desentrenar" la alineación durante el SFT/DPO/GRPO posterior. Si se busca un modelo de chat o agentes listo para usar, el propio autor remite a LFM3-1.7B-heretic, la variante abliterada del modelo post-entrenado.

La abliteración edita las proyecciones de salida de la atención (incluido el `out_proj` del operador de convolución en las capas conv) y las proyecciones descendentes del MLP. El repositorio incluye la receta completa de reproducción (`reproduce/reproduce.json`, config.toml, journal de Optuna y sumas SHA-256), por lo que el modelo es totalmente reproducible con `heretic --reproduce reproduce/reproduce.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models, arquitectura híbrida con capas convolucionales y de atención; detalles completos no disponibles) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: F16, Q2_K, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_0, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; safetensors en BF16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (licencia "other", vinculada a la de LiquidAI/LFM3-1.7B-Base) |
| Formato de pesos | safetensors (3,46 GB, BF16) y GGUF (18,93 GB en total, 15 archivos) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B-Base de Liquid AI, perteneciente a la familia LFM3 (Liquid Foundation Models de tercera generación). La arquitectura LFM3 combina mecanismos de atención con operadores convolucionales (el proceso de abliteración menciona explícitamente un `out_proj` sobre capas conv), lo que sugiere un diseño híbrido orientado a despliegue en edge y on-device, según los tags del repositorio. Los detalles completos de la arquitectura (número de capas, dimensiones, longitud de contexto nativa) no están disponibles en la información proporcionada.

Respecto al entrenamiento del modelo original, no se han detallado en la información disponible el número de tokens, la composición del dataset ni los procesos de post-training. Lo que sí está documentado es el proceso de abliteración: se trata de la trial 98 de una ejecución de Heretic de 200 trials con semilla `736382680`, que aplica una abliteración direccional por capa. Los parámetros del proceso editan las proyecciones de salida de atención (`o_proj`, pesos máximos de 1,45 y mínimos de 1,26) y las proyecciones descendentes del MLP (`down_proj`, pesos máximos de 1,39 y mínimos de 0,19). El método no añade capacidad de instrucción, personalidad de chat ni uso de herramientas: únicamente elimina las direcciones de pesos responsables de las negativas.

## Capacidades

- Generacion de texto en 16 idiomas (inglés, español, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco), heredada del modelo base.
- Base preentrenada sin alinear: adecuada como punto de partida para SFT, DPO o GRPO propios sin arrastrar la dirección de rechazo original.
- Sin capacidad nativa de chat, instrucción, tool calling ni agentes: al ser un checkpoint Base, no sigue instrucciones de forma fiable ni soporta function calling.
- Sin mecanismos especiales documentados (thinking mode, visión, audio): no disponible.
- Disponibilidad en múltiples cuantizaciones GGUF para inferencia local en CPU y GPU de consumo.
- Reproducibilidad completa del proceso de abliteración gracias a la receta incluida en el repositorio.

## Casos de uso

- Fine-tuning de asistentes de dominio específico: al partir de una base sin dirección de rechazo, el SFT posterior no tiene que "luchar" contra negativas heredadas del RLHF, lo que tiende a preservar mejor la coherencia del modelo.
- Entrenamiento con datos propietarios: empresas pueden continuar el preentrenamiento o hacer fine-tuning con su propia documentación técnica o legal sin que el modelo se niegue a procesar ciertos contenidos.
- Experimentos de post-training e investigación: la receta reproducible (semilla, journal de Optuna, sumas SHA-256) lo hace idóneo para estudios comparables sobre abliteración y alineación.
- Despliegue en edge y on-device: con 1,73B de parámetros y cuantizaciones desde 0,75 GB (Q2_K), cabe en móviles, Raspberry Pi-class devices y portátiles sin GPU dedicada.
- Generación de texto continuado (completions) en aplicaciones locales donde se quiera control total sobre el comportamiento del modelo mediante el propio prompt o sistema de moderación externo.
- Creación de modelos conversacionales "uncensored" para investigación de seguridad: permite estudiar el efecto de la abliteración sobre un modelo base antes de la alineación, comparando con la variante LFM3-1.7B-heretic derivada del modelo post-entrenado.
- Prototipado rápido de pipelines de fine-tuning (LoRA/QLoRA) en hardware de consumo gracias al reducido tamaño del modelo.

## Benchmarks y rendimiento

Datos medidos por el autor del modelo en el mismo entorno para ambos checkpoints (`lm-eval` 0.4.13, 14.042 preguntas):

| Metric | Este modelo | Modelo original (LiquidAI/LFM3-1.7B-Base) |
|---|---|---|
| MMLU (acc) | 58,82 % | 59,13 % |
| stderr | 0,40 pp | 0,40 pp |
| Divergencia KL | 0,0149 | 0 (por definición) |
| Negativas (refusals) | 5/100 | 76/100 |

La diferencia de -0,31 pp en MMLU es menor que un error estándar, es decir, no hay regresión de conocimiento medible. De las 76 negativas del modelo original, 71 se eliminan. El autor advierte que una KL de 0,0149 es una edición moderada (más laxa que la de LFM3-1.7B-heretic, con KL 0,0052), por lo que cabe esperar algo más de deriva en el comportamiento. No hay datos de GSM8K, HumanEval u otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde unos 0,9 GB con Q2_K (0,75 GB de archivo) hasta unos 3,7 GB con F16 (3,47 GB); el safetensors BF16 requiere unos 3,5-4 GB. No hay cifras oficiales de VRAM, son estimaciones a partir del tamaño de los archivos.
- GPU recomendadas: cualquier GPU moderna de consumo es suficiente; con Q4_K_M (1,10 GB) cabe holgadamente en una RTX 3060 de 12 GB, RTX 4060 o incluso GPUs integradas con memoria compartida. No se necesitan A100 ni H100.
- Consumer GPUs: sí, cabe en prácticamente cualquier GPU con 2 GB de VRAM o más usando cuantizaciones medias o bajas.
- CPU: viable con llama.cpp gracias a las cuantizaciones GGUF; el tamaño reducido lo hace apto para inferencia en portátiles y dispositivos edge.
- Despliegue: llama.cpp (requerido un build con soporte de la arquitectura `lfm3`, disponible desde finales de octubre de 2026; builds anteriores no cargarán el modelo), Ollama y cualquier runtime compatible con GGUF. Comando de inicio rápido: `llama serve -hf saidutta69/LFM3-1.7B-Base-heretic`. La compatibilidad con vLLM o TGI no está documentada (el modelo usa `custom_code` y librería transformers).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| LFM3-1.7B-Base-heretic (este) | 1,73B | safetensors BF16 + GGUF (15 quants) | lfm1.0 (other) | Base abliterado, KL 0,0149, refusals 5/100, reproducible |
| LiquidAI/LFM3-1.7B-Base (original) | 1,73B | safetensors + GGUF | lfm1.0 | Base con alineación original, refusals 76/100 |
| LFM3-1.7B-heretic (mismo autor) | 1,73B | no disponible | no disponible | Variante abliterada del modelo post-entrenado (chat), KL 0,0052, para chat/agentes sin fine-tuning |

La elección entre ellos depende del objetivo: este modelo para construir fine-tunes propios desde cero; el original de Liquid AI si se quiere la base intacta; y LFM3-1.7B-heretic si se busca un modelo de chat con menos negativas sin entrenar nada.

## Limitaciones y advertencias

- No es un modelo de chat: al ser un checkpoint Base, no sigue instrucciones de forma fiable, no tiene persona conversacional ni soporta tool calling. Usarlo directamente para chat dará malos resultados.
- Deriva por abliteración moderada: con KL 0,0149, el comportamiento puede desviarse algo más que en ediciones más conservadoras; conviene validar el modelo en la tarea objetivo tras el fine-tuning.
- Riesgo de alucinación: inherente a cualquier LLM de 1,73B preentrenado, agravado por la ausencia de alineación; el modelo generará contenido potencialmente ofensivo, incorrecto o dañino sin filtros.
- Contenido sin censura: al eliminar la dirección de rechazo, el modelo no se negará a producir contenido perjudicial; es responsabilidad del desarrollador implementar moderación externa cuando el caso de uso lo requiera.
- MMLU es un único benchmark: la ausencia de regresión medible no garantiza que otras capacidades no se hayan degradado.
- Licencia lfm1.0 (tipo "other"): hay que revisar los términos en la licencia de LiquidAI/LFM3-1.7B-Base antes de cualquier uso comercial; las condiciones exactas no están detalladas en la información disponible.
- Compatibilidad GGUF: los archivos usan la nueva arquitectura `lfm3` y requieren builds de llama.cpp de finales de octubre de 2026 o posteriores.
- Uso de custom_code en transformers: puede requerir confiar en código remoto al cargar el modelo con la librería transformers.
- Sesgos conocidos: no disponible; al ser un modelo preentrenado sin alineación, hereda los sesgos del corpus de entrenamiento original sin mitigación.

## Enlaces

- Modelo: https://huggingface.co/saidutta69/LFM3-1.7B-Base-heretic
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
- Variante heretic del modelo post-entrenado: https://huggingface.co/saidutta69/LFM3-1.7B-heretic
- GGUF oficial del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base-GGUF
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Artículo original sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
