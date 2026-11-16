# cakeburnes/Mistral-Nemo-Inst-2407-12B-Thinking-Uncensored-HERETIC-HI-Claude-Opus-Q8_0-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en Q8_0 del modelo `DavidAU/Mistral-Nemo-Inst-2407-12B-Thinking-Uncensored-HERETIC-HI-Claude-Opus`, un fine-tune de Mistral NeMo 12B orientado a escritura creativa, ficción y roleplay sin restricciones de contenido. El modelo original parte de Mistral NeMo Instruct 2407 (12.247.782.400 parámetros) y ha sido sometido a un proceso de "abliteration" o eliminación de rechazos (etiquetado como *heretic* y *uncensored*) y posteriormente ajustado con un dataset de razonamiento de Claude 4.5 Opus (`TeichAI/claude-4.5-opus-high-reasoning-250x`).

La relevancia de esta ficha es doble: por un lado documenta un caso típico de la cadena de derivación comunitaria (base Mistral → fine-tune temático → abliteration → destilación de razonamiento → cuantización GGUF), y por otro permite evaluar con rigor qué se gana y qué se pierde en cada eslabón. El resultado es un modelo de 12B con ventana de contexto anunciada de 128k–256k (según los tags del autor; Mistral NeMo original soporta 128k), multilingüe en ocho idiomas y pensado para generación de texto y prosa vívida.

No se trata de un modelo para producción empresarial ni para tareas de precisión factual: es una herramienta de escritura creativa y rol sin censura, distribuida únicamente en formato GGUF Q8_0 y sin licencia declarada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Mistral NeMo 12B); sin confirmar detalles adicionales en la información disponible |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | 128k–256k según tags del autor; 128k en Mistral NeMo base (no verificado para este fine-tune) |
| Tipos de cuantizacion | Q8_0 (única publicada en este repositorio); el modelo base podría ofrecer otras, no disponible |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | no disponible |
| Formato de pesos | GGUF (este repo); el modelo base en safetensors/bfloat16 según tags |
| Tamano del repositorio | 13.0 GB |
| Libreria declarada | transformers (pipeline text-generation), compatible con llama.cpp |
| Modelo base | DavidAU/Mistral-Nemo-Inst-2407-12B-Thinking-Uncensored-HERETIC-HI-Claude-Opus |
| Dataset de ajuste | TeichAI/claude-4.5-opus-high-reasoning-250x |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral NeMo 12B, un transformer decoder-only con atención estándar (no se dispone de confirmación de innovaciones tipo attention lineal o SSM en la información proporcionada). Sobre esa base, el autor del modelo original aplicó una cadena de transformaciones: primero un proceso de *abliteration* (eliminación de direcciones de activación asociadas al rechazo, de ahí las etiquetas *heretic* y *uncensored*), y después un fine-tune supervisado con el dataset `TeichAI/claude-4.5-opus-high-reasoning-250x`, que contiene trazas de razonamiento generadas por Claude 4.5 Opus.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO adicionales. Los tags mencionan `unsloth` como herramienta de entrenamiento y `bfloat16` como precisión del modelo base. La cuantización GGUF Q8_0 fue generada mediante el espacio `gguf-my-repo` de ggml.ai a partir del checkpoint original, sin modificaciones adicionales declaradas.

## Capacidades

- Generación de texto creativo en prosa: ficción, relatos, novelas, guiones y descripciones vívidas.
- Generación de tramas y subtramas, continuación de escenas y desarrollo de personajes.
- Roleplay y juegos de rol conversacionales, incluyendo contenido explícito o sensible (modelo sin censura).
- Razonamiento de tipo "thinking" heredado del ajuste con trazas de Claude 4.5 Opus (según los tags y el nombre del modelo).
- Multilingüismo en ocho idiomas: inglés, francés, alemán, español, italiano, portugués, ruso, chino y japonés.
- Contexto largo (128k–256k según el autor) para mantener coherencia en narrativas extensas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Escritura de ficción por capítulos: el modelo puede mantener continuidad argumental y de personajes a lo largo de decenas de miles de tokens gracias a su ventana de contexto extendida, lo que permite pasarle el manuscrito completo como referencia.
- Generación de tramas y subtramas para guionistas: se le puede pedir que proponga arcos narrativos alternativos, giros o conflictos secundarios a partir de una sinopsis, aprovechando su ajuste específico en *plot generation* y *sub-plot generation*.
- Roleplay y narrativa interactiva: adecuado para motores de juegos de rol por texto o chatbots de personaje, ya que el proceso de abliteration elimina los rechazos que interrumpirían escenas de conflicto, violencia o romance adulto.
- Continuación de escenas y *scene continue*: útil en herramientas de escritura asistida donde el autor necesita que el modelo retome un fragmento previo con el mismo tono y estilo.
- Localización creativa multilingüe: puede adaptar relatos entre los ocho idiomas soportados manteniendo registro literario, aunque la calidad por idioma no está documentada.
- Generación de contenido para videojuegos narrativos: diálogos ramificados, descripciones de entornos y textos de ambientación para estudios indie que necesiten volumen sin coste de API.
- Exploración de estilos y géneros: el modelo está etiquetado para todos los géneros (ciencia ficción, romance, terror), por lo que sirve para experimentar con voces narrativas distintas en un mismo proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de calidad creativa, y el modelo base tampoco aporta cifras verificables en la documentación consultada.

## Requisitos de hardware

- VRAM estimada para Q8_0: en torno a 13 GB solo para los pesos (el repositorio ocupa 13.0 GB), más overhead de contexto KV; con 16 GB de VRAM se puede ejecutar con contexto moderado, y se recomienda 24 GB para contextos largos.
- GPU recomendadas: RTX 3090, RTX 4090, RTX A6000, L40S, A100 40/80 GB, H100. Para contexto de 128k se necesita memoria adicional significativa para la caché KV.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con Q8_0 y contexto razonable; en GPUs de 16 GB conviene reducir contexto o recurrir a cuantizaciones menores (no publicadas en este repo).
- Opciones de despliegue: llama.cpp (CLI y servidor, con instrucciones incluidas en la model card), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI con este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Mistral-Nemo 12B Thinking Uncensored HERETIC) | 12,2B | 128k–256k (según autor) | Ficción y rol sin censura, con razonamiento destilado | no disponible | GGUF Q8_0 |
| Mistral NeMo Instruct 2407 | 12,2B | 128k | Instrucciones generales, alineado | Apache 2.0 (modelo base original) | safetensors, GGUF |
| Mistral 7B Instruct | 7,2B | 32k | Instrucciones generales | Apache 2.0 | safetensors, GGUF |
| Modelos de escritura creativa sin censura de la comunidad (familia DavidAU) | variable (7B–12B) | variable | Ficción, rol, abliterated | variable, a menudo no disponible | GGUF, safetensors |

No se dispone de datos de rendimiento comparativo verificables entre estas alternativas en la información consultada.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica licencia en el repositorio, lo que impide determinar si el uso comercial está permitido. Debe tratarse como no apto para producción hasta aclararlo con el autor y con la licencia del modelo base.
- Contenido sin filtro: el proceso de abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido violento, sexual explícito, ofensivo o ilegal. Requiere moderación externa si se expone a usuarios.
- Riesgo elevado de alucinación: es un fine-tune creativo, no un modelo de conocimiento factual; no debe usarse para consultas médicas, legales o financieras.
- Idiomas: aunque se listan ocho, la calidad real por idioma no está evaluada; el entrenamiento principal parece centrado en inglés.
- Contexto: la cifra de 256k proviene de un tag del autor y no está verificada; Mistral NeMo base soporta 128k. El contexto efectivo puede degradarse en longitudes extremas.
- Solo Q8_0: no hay cuantizaciones menores publicadas en este repositorio, lo que limita el despliegue en hardware modesto.
- Trazabilidad: es un derivado de tercer nivel (Mistral → DavidAU → cakeburnes) sin evaluación independiente ni benchmarks publicados.
- El ajuste con trazas de Claude 4.5 Opus puede implicar consideraciones sobre las condiciones de uso del proveedor original del dataset, no documentadas aquí.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cakeburnes/Mistral-Nemo-Inst-2407-12B-Thinking-Uncensored-HERETIC-HI-Claude-Opus-Q8_0-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Mistral-Nemo-Inst-2407-12B-Thinking-Uncensored-HERETIC-HI-Claude-Opus
- Dataset de ajuste: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- llama.cpp: https://github.com/ggerganov/llama.cpp
