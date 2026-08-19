# MegaPanchamZ/Qwen3.8-9B-abliterated-25

## Resumen

Qwen3.8-9B-abliterated-25 es una version modificada del modelo empero-ai/Qwen3.8-9B, un modelo de lenguaje de 9.409.813.744 parametros (~9,4B) perteneciente a la serie Qwen3.8, que a su vez se construye sobre la arquitectura de Qwen3.5. El modelo ha sido sometido a un proceso de abliteracion mediante la herramienta Heretic v1.4.0, que elimina las direcciones de rechazo (refusal directions) de las capas `attn.o_proj` y `mlp.down_proj`, reduciendo la tasa de rechazo de 99/100 a 25/100 en un conjunto de 100 prompts daninos, con una divergencia KL de solo 0,0142 respecto al modelo original, muy por debajo del umbral de dano de 0,5.

Desarrollado por MegaPanchamZ, el modelo se distribuye bajo licencia Apache-2.0 en formato safetensors (bf16, 4 shards de ~5 GB cada uno). Es un modelo de razonamiento: las respuestas comienzan con un bloque `thinking` antes de la respuesta final, por lo que requiere un `max_tokens` generoso (1000+) para evitar truncamientos. La abliteracion se realizo mediante adaptadores LoRA que se fusionaron directamente en los pesos base, sin adaptadores separados, y existe una cuantizacion GGUF Q4_K_M disponible en un repositorio independiente.

La relevancia de este modelo radica en su proposito especifico: eliminar el comportamiento de rechazo del modelo original para aplicaciones que requieren generacion de contenido sin restricciones de seguridad. Sin embargo, esto conlleva implicaciones eticas y legales significativas que deben evaluarse cuidadosamente antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (serie Qwen3.8, basada en Qwen3.5) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q4_K_M (repo separado) |
| Idiomas soportados | No disponible (tag "en" en la model card; la familia Qwen es tipicamente multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 4 shards), GGUF |

## Arquitectura y entrenamiento

El modelo se basa en empero-ai/Qwen3.8-9B, un modelo de la serie Qwen3.8 que se construye sobre la arquitectura de Qwen3.5. Los tags de HuggingFace indican que el modelo base fue obtenido mediante destilacion de un modelo Qwen3.8 de mayor tamano. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset o el uso de tecnicas como RLHF o DPO en el modelo base.

El proceso de abliteracion se realizo con Heretic v1.4.0, que ablaciona las direcciones de rechazo de las capas `attn.o_proj` y `mlp.down_proj` mediante adaptadores LoRA que posteriormente se fusionan en los pesos base. Se utilizaron dos conjuntos de prompts: `mlabonne/harmless_alpaca` (prompts benignos, 400 ejemplos) y `mlabonne/harmful_behaviors` (prompts daninos, 400 ejemplos). El proceso ejecuto 400 iteraciones de optimizacion con un batch size de 64, seleccionando la iteracion 276 como optima segun criterio de Pareto. Los parametros finales incluyen un `direction_index` de 17,52 y pesos maximos y minimos especificos para cada capa ablacionada, con un metodo de ablacion LoRA row-normalized ("full") fusionado en los pesos base.

## Capacidades

- Generacion de texto y razonamiento: es un modelo de razonamiento que genera un bloque `thinking` antes de la respuesta final, similar a los modos thinking de la familia Qwen.
- Abliteracion de rechazos: reduce la tasa de rechazo de 99/100 a 25/100 en prompts daninos, permitiendo generar contenido que el modelo original rechazaria.
- Preservacion de capacidades: la divergencia KL de 0,0142 respecto al modelo original indica un impacto minimo en las capacidades generales del modelo.
- Soporte de tool calling / function calling: no se menciona explicitamente en la model card.
- Capacidades multilingues: el tag "en" sugiere soporte principal en ingles, aunque la familia Qwen es tipicamente multilingue. No se dispone de datos confirmados.
- Capacidades multimodales: el tag "image-text-to-text" aparece en la metadata de HuggingFace, lo que podria indicar soporte de entrada de imagenes, aunque el pipeline declarado es text-generation y la model card no menciona capacidades de vision.
- Soporte de agentes y multi-step reasoning: no se menciona explicitamente, aunque el modo de razonamiento podria facilitar tareas de razonamiento multi-paso.

## Casos de uso

- Investigacion academica sobre alineacion y seguridad de IA: el modelo permite estudiar el comportamiento de los sistemas de rechazo y los efectos de la abliteracion en modelos de lenguaje, comparando respuestas antes y despues de la modificacion.
- Generacion creativa sin restricciones: escritores y creadores de contenido pueden utilizarlo para generar ficcion, dialogos o narrativas que aborden temas controvertidos sin la autocensura tipica de los modelos alineados.
- Desarrollo de sistemas de moderacion de contenido: puede servir como generador de prompts daninos o problematicos para entrenar y evaluar sistemas de moderacion y filtrado de contenido.
- Pruebas de robustez de modelos: los equipos de seguridad pueden usar este modelo para evaluar la eficacia de sus propios guardrails frente a modelos sin comportamiento de rechazo.
- Roleplay y simulacion de personajes: puede generar respuestas en personajes o escenarios que requieran un comportamiento menos restrictivo, util en juegos de rol o simulaciones interactivas.
- Estudio comparativo de tecnicas de abliteracion: investigadores pueden comparar este modelo con otras variantes abliteradas (como huihui-ai/Qwen3-8B-abliterated) para evaluar la eficacia de diferentes herramientas y metodologias.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los unicos datos de evaluacion proporcionados son:

| Metrica | Modelo original | Modelo abliterado |
|---|---|---|
| Rechazos (100 prompts daninos) | 99/100 | 25/100 |
| Divergencia KL vs. original | — | 0,0142 |

La divergencia KL de 0,0142 esta muy por debajo del umbral de dano de 0,5, lo que indica que la abliteracion tuvo un impacto minimo en las capacidades generales del modelo. No se han publicado resultados de benchmarks de rendimiento estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~19 GB para los pesos mas overhead de inferencia, por lo que se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, A100).
- VRAM estimada para inferencia con GGUF Q4_K_M: ~5-6 GB para los pesos mas overhead, cabe en GPUs de consumo con 8-12 GB de VRAM (RTX 3060, RTX 3070, RTX 4060 Ti).
- GPUs recomendadas: RTX 4090 (24 GB) para bf16; RTX 3060 (12 GB) o superior para GGUF Q4_K_M.
- Opciones de despliegue: al ser compatible con transformers, puede desplegarse con vLLM, TGI, llama.cpp (via GGUF), Ollama (via GGUF) o directamente con la libreria transformers de HuggingFace.
- Latencia y throughput: no se dispone de datos medidos. Como referencia orientativa, un modelo de ~9,4B parametros en bf16 en una RTX 4090 suele generar entre 30 y 60 tokens/segundo, y con GGUF Q4_K_M entre 40 y 80 tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tecnica de abliteracion | Rechazos |
|---|---|---|---|---|---|
| MegaPanchamZ/Qwen3.8-9B-abliterated-25 | 9,4B | No disponible | Apache-2.0 | Heretic v1.4.0 (LoRA + merge) | 25/100 |
| huihui-ai/Qwen3-8B-abliterated | 8B | No disponible | Apache-2.0 | Abliteracion (metodo no especificado) | No disponible |
| empero-ai/Qwen3.8-9B (base) | 9,4B | No disponible | Apache-2.0 | Sin abliteracion | 99/100 |

El
