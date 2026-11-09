# DavidAU/LFM2.5-1.2B-Instruct-Thinking-Claude-High-Reasoning

## Resumen

LFM2.5-1.2B-Instruct-Thinking-Claude-High-Reasoning es un ajuste fino (fine-tune) del modelo LiquidAI/LFM2.5-1.2B-Instruct realizado por el usuario DavidAU de Hugging Face. El objetivo del ajuste es convertir un modelo instructivo compacto de 1.170 millones de parametros en un modelo de "razonamiento" (thinking/reasoning) capaz de generar cadenas de pensamiento textuales antes de dar una respuesta final. El entrenamiento se ha realizado con Unsloth sobre el dataset TeichAI/claude-4.5-opus-high-reasoning-250x, que contiene ejemplos de razonamiento de alta calidad generados por Claude Opus 4.5.

El modelo es relevante porque demuestra que es posible dotar de capacidades de razonamiento explicito a modelos muy pequenos (1.2B) con un coste de entrenamiento bajo, manteniendo la ventana de contexto de 128k tokens del modelo base. Esto lo hace atractivo para entornos con recursos limitados donde no es viable ejecutar modelos de decenas de miles de millones de parametros. Sin embargo, el propio autor lo califica como "ligeramente experimental" debido a que la activacion del bloque de razonamiento no es completamente determinista y puede requerir regeneraciones o prompts especificos.

La arquitectura subyacente es la del modelo base LFM2.5 de LiquidAI, un transformer optimizado para eficiencia en dispositivos de borde (edge). El ajuste anade un comportamiento de razonamiento textual que no se encapsula en un bloque `thinking` separado, sino que se emite como texto plano dentro de la respuesta. El modelo se distribuye en formato safetensors y bfloat16, con un tamano de repositorio de 2.3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM2.5 de LiquidAI, optimizada para edge) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (segun tags del autor); minimo recomendado 4k, sugerido 8k+ |
| Tipos de cuantizacion | GGUF (Q4KM, IQ3_M, Q6, Q8 recomendados por el autor); bfloat16 en safetensors |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors, bfloat16; GGUF para llama.cpp/KoboldCpp |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-1.2B-Instruct, un transformer de 1.170 millones de parametros disenado por LiquidAI para inferencia eficiente en dispositivos de borde. La arquitectura concreta del modelo base no se detalla en la informacion proporcionada mas alla de la etiqueta `lfm2`, pero se trata de un transformer decoder-only con soporte nativo de contexto largo (128k tokens segun los tags del autor). El ajuste fino no modifica la arquitectura, sino que adapta los pesos para inducir un comportamiento de razonamiento explicito.

El entrenamiento se realizo con Unsloth sobre el dataset TeichAI/claude-4.5-opus-high-reasoning-250x, compuesto por 250 ejemplos de razonamiento de alta calidad generados por Claude Opus 4.5. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es la conversion de un modelo instructivo convencional en un modelo que genera cadenas de razonamiento textuales antes de la respuesta final, sin necesidad de un bloque `thinking` estructurado. El autor advierte que la activacion del razonamiento puede requerir regeneraciones o prompts explicitos como "Explain...", "Think deeply before you answer..." o "Plan out your reply...".

## Capacidades

- Generacion de texto y razonamiento explicito: el modelo produce secciones de razonamiento textual (de unas frases a varios parrafos) antes de la respuesta final.
- Escritura creativa: el modelo esta especialmente orientado a ficcion, incluyendo generacion de tramas, subtramas, continuacion de escenas, storytelling y prosa vivida.
- Roleplaying y conversacion: soporta interacciones multi-turno con contexto largo (hasta 128k tokens segun el autor).
- Generacion en multiples generos: ciencia ficcion, romance, terror y otros generos literarios.
- Capacidad de razonamiento bajo demanda: el usuario puede solicitar razonamiento profundo mediante instrucciones explicitas en el prompt.
- Soporte de contexto largo: ventana de 128k tokens, aunque el autor recomienda un minimo de 4k y sugiere 8k+ para un funcionamiento optimo.
- No se menciona soporte de tool calling, function calling, vision, audio ni capacidades de agente multi-paso en la informacion disponible.

## Casos de uso

- Generacion de ficcion y narrativa: el modelo puede producir relatos completos, tramas y subtramas con prosa detallada, gracias a su ajuste especifico en escritura creativa y su capacidad de razonamiento textual para planificar la estructura narrativa antes de escribir.
- Continuacion de escenas y storytelling interactivo: con 128k tokens de contexto, puede mantener coherencia en historias largas y continuar escenas previas sin perder el hilo, lo que lo hace adecuado para herramientas de escritura asistida.
- Roleplaying y chat conversacional: el modelo soporta conversaciones multi-turno y puede mantener personajes y contextos extensos, especialmente con el ajuste de `smoothing_factor` recomendado por el autor para interfaces como KoboldCpp, text-generation-webui o Silly Tavern.
- Razonamiento explicito en entornos con recursos limitados: al ser un modelo de 1.2B parametros, puede ejecutarse en hardware modesto (GPU de consumo) mientras genera cadenas de razonamiento, lo que permite prototipar aplicaciones de razonamiento sin infraestructura de gran escala.
- Generacion de guiones y dialogos: su orientacion a ficcion y roleplaying lo hace util para generar dialogos con matices emocionales y tramas complejas en generos como terror, romance o ciencia ficcion.
- Experimentacion e investigacion en modelos pequenos de razonamiento: sirve como caso de estudio de como un fine-tune con Unsloth sobre un dataset de razonamiento de alta calidad puede inducir comportamiento de "thinking" en modelos de menos de 2B parametros.
- Asistente de escritura creativa en local: puede desplegarse con llama.cpp u Ollama en un portatil o estacion de trabajo con GPU de consumo, ofreciendo generacion de texto creativo sin dependencia de la nube.

## Benchmarks y rendimiento

El autor proporciona resultados de benchmarks comparando el modelo ajustado con el LFM2.5 Instruct original. Los datos son los siguientes:

| Benchmark | Modelo ajustado | LFM2.5 Instruct original |
|---|---|---|
| ARC-Challenge | 0.397 | 0.365 |
| ARC-Easy | 0.519 | 0.426 |
| BoolQ | 0.722 | 0.717 |
| Hellaswag | 0.558 | 0.486 |
| OpenBookQA | 0.366 | 0.382 |
| PIQA | 0.729 | 0.687 |
| Winogrande | 0.571 | 0.538 |

El modelo ajustado mejora en la mayoria de benchmarks respecto al original, con incrementos destacados en ARC-Easy (+0.093), Hellaswag (+0.072) y PIQA (+0.042), mientras que empeora ligeramente en OpenBookQA (-0.016). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1.17B parametros, en bfloat16 requiere aproximadamente 2.3 GB de VRAM solo para los pesos, mas overhead de contexto. Con cuantizacion Q8, alrededor de 1.3 GB; con Q4KM, alrededor de 0.8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad y contexto largo. Tambien puede ejecutarse en CPU con llama.cpp.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) con cuantizaciones GGUF.
- Opciones de despliegue: transformers (safetensors), llama.cpp, KoboldCpp, text-generation-webui (con llama_HF para GGUF), Silly Tavern, Ollama (mediante GGUF), LM Studio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El autor recomienda cuantizaciones Q6/Q8 para un funcionamiento optimo y advierte que cuantizaciones bajas (por debajo de Q4KM o IQ3_M) pueden causar problemas de activacion del razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-Thinking-Claude-High-Reasoning (este modelo) | 1.17B | 128k | no disponible | safetensors, GGUF | Fine-tune de razonamiento sobre LFM2.5 |
| LiquidAI/LFM2.5-1.2B-Instruct | 1.17B | 128k (segun tags del autor) | no disponible | safetensors | Modelo base instructivo, sin razonamiento explicito |
| Modelos de razonamiento de mayor tamano (p. ej., Qwen, Llama) | >7B | variable | variable | safetensors, GGUF | Mayor capacidad pero requieren mas VRAM |

No se dispone de datos de benchmarks comparativos con otros modelos de razonamiento de tamano similar en la informacion proporcionada. La comparativa se limita al modelo base y a categorias generales.

## Limitaciones y advertencias

- El propio autor califica el modelo como "ligeramente experimental": la activacion del bloque de razonamiento no es determinista y puede requerir regeneraciones o prompts explicitos.
- El razonamiento se emite como texto plano, no en un bloque `thinking` estructurado, lo que puede complicar el parseo en aplicaciones que esperan un formato especifico.
- Las cuantizaciones bajas (por debajo de Q4KM o IQ3_M) pueden causar problemas de activacion o calidad del razonamiento; el autor recomienda Q6/Q8.
- El modelo esta orientado a ficcion y escritura creativa, con tags que incluyen "swearing" y "horror", por lo que puede generar contenido no apto para todos los publicos.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion especifico, idiomas soportados ni licencia, lo que limita la evaluacion para uso comercial.
- La licencia no esta disponible, lo que impide determinar si se permite uso comercial.
- El contexto de 128k tokens se menciona en los tags, pero el autor recomienda un minimo de 4k y sugiere 8k+; no se confirma el rendimiento real en contextos muy largos.
- El dataset de entrenamiento es pequeno (250 ejemplos), lo que puede limitar la generalizacion del razonamiento a dominios distintos de la ficcion.
- No se mencionan capacidades de tool calling, vision, audio ni agentes, por lo que no es adecuado para tareas que requieran estas funcionalidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/LFM2.5-1.2B-Instruct-Thinking-Claude-High-Reasoning
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Coleccion de archivos fuente del autor: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Perfil del autor: https://huggingface.co/DavidAU
