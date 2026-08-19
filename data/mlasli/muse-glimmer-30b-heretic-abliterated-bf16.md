# mlasli/Muse-Glimmer-30B-Heretic-Abliterated-BF16

## Resumen

Muse-Glimmer-30B-Heretic-Abliterated-BF16 es una variante del modelo multimodal Meta Muse Glimmer 30B, desarrollada por el usuario mlasli, que ha sido sometida a un proceso de "abliteración" mediante la herramienta Heretic. La abliteración consiste en eliminar la dirección de rechazo (refusal direction) de las activaciones internas del modelo, de modo que el modelo deja de negarse a responder a peticiones que el modelo original consideraría dañinas o inapropiadas. El resultado es un modelo con una tasa de rechazo del 6,5% frente al 29% de la versión anterior, manteniendo una divergencia KL de 0,076 respecto al modelo original, lo que indica una pérdida mínima de calidad general.

El modelo conserva las capacidades del base: procesamiento de imagen y texto (image-text-to-text), con aproximadamente 29.800 millones de parámetros y una arquitectura de transformer de 52 capas. Se distribuye en formato BF16 (safetensors) y en versiones cuantizadas GGUF (Q4_K_M, Q6_K, Q8_0). Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Está pensado para desarrolladores que necesitan un modelo de lenguaje multimodal con respuestas menos censuradas, aunque esta característica conlleva riesgos importantes de generación de contenido inapropiado o dañino.

La relevancia de este modelo radica en su enfoque en la "libertad de expresión" del modelo, un tema controvertido en la comunidad de IA. Al eliminar los mecanismos de rechazo, se consigue un asistente más complaciente para tareas creativas o de exploración de temas sensibles, pero a costa de perder las salvaguardas de seguridad. Es una opción a considerar solo en entornos controlados y con políticas de uso responsables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), 52 capas (segun metodologia de abliteracion) |
| Parametros totales | 29.776.626.688 (~30B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M (~16 GB), Q6_K (~22 GB), Q8_0 (~28 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

El modelo base, Meta Muse Glimmer 30B, es un modelo multimodal que procesa tanto imagenes como texto. La arquitectura es un transformer de 52 capas, aunque no se especifican detalles adicionales como el tipo de atencion o si incluye componentes de vision especificos (por ejemplo, un codificador de vision). El proceso de abliteracion realizado con Heretic no modifica la arquitectura, sino que anade adaptadores LoRA que proyectan fuera la direccion de rechazo de las representaciones internas. Estos adaptadores se fusionan posteriormente con los pesos originales, produciendo un modelo limpio sin overhead adicional.

El entrenamiento de la abliteracion se realizo en dos fases: primero se calcularon las direcciones de rechazo comparando las activaciones del flujo residual entre prompts daninos (del dataset `mlabonne/harmful_behaviors`) y prompts inofensivos (`mlabonne/harmless_alpaca`). Luego, se ejecutaron 500 pruebas de optimizacion con Optuna para encontrar los pesos optimos de los adaptadores LoRA en las matrices `attn.o_proj` y `mlp.down_proj` de cada capa, minimizando la tasa de rechazo y maximizando la preservacion de la calidad (medida por divergencia KL). El mejor ensayo (trial 445) logro una tasa de rechazo del 6,5% con una KL de 0,076.

No se dispone de informacion sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, uso de RLHF, etc.). La abliteracion es una tecnica de post-entrenamiento que no altera los conocimientos adquiridos, solo elimina la tendencia a rechazar peticiones.

## Capacidades

- Generacion de texto y respuestas a partir de imagenes (multimodal image-text-to-text).
- Razonamiento y comprension del lenguaje natural en ingles.
- Capacidad de seguir instrucciones complejas sin rechazos, incluso en temas considerados sensibles o controvertidos.
- No se especifican capacidades de tool calling, function calling, ni soporte para agentes multi-paso.
- No se mencionan modos de pensamiento (thinking mode) ni capacidades de audio o video.
- Multilingue: solo ingles declarado, aunque podria funcionar parcialmente en otros idiomas por transferencia, no esta garantizado.

## Casos de uso

- Escritura creativa sin censura: el modelo puede generar narrativas, dialogos o guiones que aborden temas tabu o controvertidos sin autocensurarse, util para autores que exploran ficcion oscura o temas adultos.
- Roleplay y juegos de texto: en entornos de simulacion de personajes, el modelo puede interpretar roles sin limitaciones de contenido, ofreciendo experiencias mas inmersivas para usuarios adultos.
- Analisis de contenido multimodal: al aceptar imagenes, puede describir o comentar imagenes sin restricciones, por ejemplo en aplicaciones de etiquetado o descripcion de imagenes para adultos.
- Investigacion sobre sesgos y seguridad: los investigadores pueden estudiar el comportamiento de un modelo sin salvaguardas para entender mejor los mecanismos de rechazo y desarrollar mejores tecnicas de alineacion.
- Generacion de contenido educativo sobre temas sensibles: puede explicar conceptos de salud, sexualidad o historia con un enfoque directo, sin evasivas, en contextos donde se requiere informacion explicita.
- Desarrollo de asistentes especializados: en dominios donde las politicas de contenido son menos restrictivas (por ejemplo, ficcion, humor negro, satira), este modelo puede servir como base para un asistente que no se niegue a responder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta metricas del proceso de abliteracion:

| Version | Refusals | Compliance | KL Divergence | Trials |
|---|---|---|---|---|
| v2 (actual) | 6,5% | 93,5% | 0,076 | 500 |
| v1 | 29% | 71% | 0,027 | 50 |

Estas metricas indican que la version v2 reduce los rechazos en un 88% respecto a v1, manteniendo una divergencia KL baja (0,076), lo que sugiere que la calidad del modelo se preserva en gran medida. Sin embargo, no hay datos de rendimiento en tareas de razonamiento, codigo o matematicas.

## Requisitos de hardware

- VRAM estimada: ~55 GB en BF16 (segun la model card).
- GPU recomendadas: 1x A100 80GB o 2x A6000 48GB para BF16.
- Para versiones cuantizadas GGUF, los requisitos son menores: Q4_K_M (~16 GB) cabe en GPUs consumer de 24 GB (RTX 3090/4090), Q6_K (~22 GB) tambien, y Q8_0 (~28 GB) requiere una GPU de 32 GB o mas (por ejemplo, A6000).
- Opciones de despliegue: se puede cargar con `transformers` usando `AutoModelForImageTextToText` (como se muestra en la model card) o mediante herramientas que soporten GGUF como llama.cpp, Ollama o LM Studio.
- Latencia y throughput: no disponibles. Dependera del hardware y la cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables con la misma tecnica de abliteracion y tamano. Como referencia, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Meta Muse Glimmer 30B (base) | ~30B | no disponible | Apache 2.0 | Modelo original con rechazos activos |
| Muse-Glimmer-30B-Heretic-Abliterated (este) | ~30B | no disponible | Apache 2.0 | Variante sin rechazos, misma arquitectura |

Otros modelos abliterados populares (por ejemplo, de la serie "abliterated" de otros autores) no tienen datos publicos comparables en esta ficha. No se puede realizar una comparativa cuantitativa fiable sin benchmarks.

## Limitaciones y advertencias

- El modelo no tiene mecanismos de rechazo, por lo que puede generar contenido danino, ilegal, ofensivo o peligroso si se le solicita. Esto lo hace inadecuado para aplicaciones publicas sin moderacion externa.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion, especialmente en temas de los que no tiene conocimiento solido.
- Sesgos: el modelo base puede contener sesgos de genero, raza o ideologicos, y la abliteracion no los corrige.
- Idioma: solo se garantiza ingles; el rendimiento en otros idiomas puede ser deficiente.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir las leyes aplicables.
- La abliteracion puede degradar ligeramente la calidad en algunas tareas (KL=0,076), aunque en general se considera aceptable.
- No hay garantias de seguridad: cualquier despliegue en produccion debe incluir filtros de contenido y supervisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlasli/Muse-Glimmer-30B-Heretic-Abliterated-BF16
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Herramienta Heretic (repositorio GitHub): https://github.com/d3nd3/heretic
- Versiones GGUF: Q4_K_M (https://huggingface.co/mlasli/Muse-Glimmer-30B-Heretic-Abliterated-Q4_K_M-GGUF), Q6_K (https://huggingface.co/mlasli/Muse-Glimmer-30B-Heretic-Abliterated-Q6_K-GGUF), Q8_0 (https://huggingface.co/mlasli/Muse-Glimmer-30B-Heretic-Abliterated-Q8_0-GGUF)
