# disinfozone/wekwos-120b-lora

## Resumen

Wekwos-120B LoRA es un adaptador PEFT de tipo LoRA publicado por el usuario disinfozone, concebido como kit de reproducibilidad del checkpoint SFT de la época 3 del modelo Wekwos-120B. No es un modelo autónomo: se trata de un adaptador de rango 16 y alpha 32 aplicado sobre todas las capas lineales del backbone de texto de NVIDIA Nemotron-3.5-Super-VL-120B-A12B-BF16, un modelo multimodal de NVIDIA con arquitectura Nemotron-H y 120.000 millones de parámetros totales (12.000 millones activos, según la nomenclatura A12B del identificador). El adaptador pesa 6,7 GB y se ha entrenado durante 3 épocas (2.514 pasos) con una tasa de aprendizaje Dimuon de 8e-3 en la plataforma Tinker de Thinking Machines.

El propósito declarado es especializar el backbone lingüístico en protoindoeuropeo (PIE) reconstruido, un dominio de lingüística histórica con corpus limitado y altamente técnico. El autor reporta una puntuación de 86,2 estricta y 88,5 laxa en un benchmark PIE retenido, evaluado en BF16. El repositorio incluye además un script (`build_text_base.py`) que extrae el modelo de lenguaje independiente (`nemotron_h`) a partir de los shards del modelo multimodal original, eliminando la torre de visión para que las herramientas estándar de PEFT y `mlx-lm` puedan cargarlo sin fricción.

La relevancia de esta ficha es doble: por un lado, documenta un caso de especialización lingüística sobre un modelo frontera mediante LoRA de bajo rango; por otro, ilustra un patrón de publicación poco habitual, en el que el adaptador se distribuye junto con el procedimiento completo para reconstruir el checkpoint fusionado en BF16, cuantizarlo a GGUF, FP8, EXL2 o MLX, y servirlo con vLLM o SGLang. El modelo listo para usar con RL fusionado se publica por separado en `disinfozone/wekwos-120b`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre backbone de texto Nemotron-H; modelo base multimodal Nemotron-3.5-Super-VL-120B-A12B |
| Parametros totales | 120.000 millones (modelo base); adaptador LoRA de 6,7 GB |
| Parametros activos | 12.000 millones (según nomenclatura A12B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (referencia), GGUF, FP8, EXL2, MLX (oQ5e en el modelo listo para usar) |
| Idiomas soportados | ine (protoindoeuropeo reconstruido), en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el backbone de texto de NVIDIA Nemotron-3.5-Super-VL-120B-A12B-BF16, identificado en las etiquetas como `nemotron_h`. Se trata de un LoRA de rango 16 y alpha 32 configurado sobre todas las capas lineales (`all-linear`), entrenado durante 3 épocas (2.514 pasos) con una tasa de aprendizaje Dimuon de 8e-3 en la plataforma Tinker de Thinking Machines. El entrenamiento se realizó en precisión BF16 y el adaptador resultante ocupa 6,7 GB en disco.

La innovación técnica principal del repositorio no está en el entrenamiento sino en el procedimiento de reconstrucción: el script `build_text_base.py` extrae el modelo de lenguaje independiente (`backbone.*`, `lm_head`, `mtp.*`) de los shards del modelo multimodal original en memoria baja, eliminando la torre de visión. Esto permite que las herramientas estándar de PEFT y `tinker-cookbook` fusionen el adaptador sin problemas, y que `mlx-lm` cargue el resultado. El flujo documentado es: descargar el modelo base, extraer el backbone de texto, fusionar el adaptador con `weights.build_hf_model(..., merge_strategy="shard")` y, opcionalmente, cuantizar. El modelo listo para usar en `disinfozone/wekwos-120b` parte de esta misma fusión SFT de la época 3, la cuantiza a oQ5e y le fusiona un adaptador posterior de vocabulario local y RL con GRPO (`rl8`).

No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO en esta fase SFT.

## Capacidades

- Generación de texto especializada en protoindoeuropeo reconstruido y lingüística histórica.
- Generación de texto general en inglés, heredada del backbone Nemotron-H.
- Razonamiento lingüístico sobre formas reconstruidas, etimologías y correspondencias fonéticas (implícito en la especialización declarada).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a `ine` (PIE reconstruido) e `en` según los metadatos.
- Capacidades de visión: el adaptador se aplica únicamente al backbone de texto; la torre de visión se elimina en el script de extracción.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación en lingüística histórica: generación y verificación de formas protoindoeuropeas reconstruidas para proyectos de comparación léxica y reconstrucción de protolenguas, aprovechando la especialización del adaptador y la puntuación reportada de 86,2 estricta en el benchmark PIE retenido.
- Docencia universitaria de lingüística indoeuropea: generación de paradigmas, correspondencias fonéticas y ejemplos etimológicos para materiales didácticos, con revisión humana obligatoria dado el riesgo de alucinación en formas reconstruidas.
- Creación de corpus sintéticos anotados: generación de pares forma PIE / forma hija para aumentar datasets de entrenamiento de modelos filológicos o para pruebas de hipótesis de cambio fonético.
- Reproducibilidad de investigación: el repositorio funciona como kit completo para reconstruir el checkpoint SFT en BF16 y replicar los resultados del benchmark, lo que lo hace adecuado para publicaciones que exijan artefactos reproducibles.
- Servicio de inferencia especializado: fusión del adaptador en BF16 y despliegue con vLLM o SGLang para servir consultas filológicas con latencia controlada, o cuantización a GGUF para llama.cpp en entornos sin GPU de datacenter.
- Desarrollo de herramientas para filología computacional: integración del backbone extraído con `mlx-lm` en pipelines de Apple Silicon para prototipado rápido de aplicaciones de análisis etimológico.
- Base para especializaciones posteriores: el adaptador sirve como punto de partida para RL con GRPO u otras técnicas, como demuestra el modelo listo para usar `disinfozone/wekwos-120b` que fusiona el adaptador `rl8` sobre esta misma base.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Benchmark PIE retenido (estricto) | 86,2 | BF16, checkpoint SFT época 3 |
| Benchmark PIE retenido (laxo) | 88,5 | BF16, checkpoint SFT época 3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. No se dispone de comparaciones con modelos similares en el benchmark PIE.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 120.000 millones de parámetros; en BF16 requiere aproximadamente 240 GB de VRAM, lo que exige múltiples GPU de datacenter. El adaptador por sí solo ocupa 6,7 GB, pero no es utilizable sin el backbone.
- GPU recomendadas: para BF16, configuraciones multi-GPU con A100 80GB (al menos 3-4 unidades) o H100 80GB. Para cuantizaciones de 4-5 bits (oQ5e, GGUF Q4/Q5), la huella se reduce aproximadamente a 70-80 GB, lo que permite su despliegue en 2x A100 80GB o 1x H100 80GB con margen ajustado.
- GPU de consumo: no cabe en GPU de consumo en BF16. En cuantización agresiva (GGUF Q4) podría aproximarse a los 70 GB, todavía por encima de una RTX 4090 (24 GB); se requeriría offloading a RAM o configuraciones multi-GPU de consumo.
- Opciones de despliegue: vLLM, SGLang (tras fusión a BF16), llama.cpp (tras conversión a GGUF), MLX (en Apple Silicon, vía `mlx-lm`), TGI no mencionado explícitamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wekwos-120B LoRA (este) | 120B (12B activos) | no disponible | PIE reconstruido | MIT | Adaptador LoRA + script de reconstrucción |
| disinfozone/wekwos-120b | 120B (12B activos) | no disponible | PIE reconstruido + RL | MIT | Modelo MLX cuantizado oQ5e listo para usar |
| NVIDIA Nemotron-3.5-Super-VL-120B-A12B | 120B (12B activos) | no disponible | Multimodal generalista | no disponible en esta ficha | Modelo base en BF16 |

No se dispone de información sobre otros modelos especializados en protoindoeuropeo comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere descargar el modelo base NVIDIA Nemotron-3.5-Super-VL-120B-A12B-BF16 y ejecutar el script de extracción del backbone de texto antes de poder fusionarlo.
- Riesgo elevado de alucinación en formas reconstruidas: el protoindoeuropeo es una lengua reconstruida sin hablantes nativos ni corpus de referencia completo, por lo que las salidas deben validarse contra fuentes filológicas.
- Sesgos conocidos: no documentados en la información proporcionada; al heredar el backbone de Nemotron, puede arrastrar sesgos del corpus de entrenamiento original en inglés.
- Limitaciones de idioma: los metadatos solo declaran `ine` y `en`; el rendimiento en otras lenguas no está caracterizado.
- Longitud de contexto: no disponible; conviene verificar la ventana efectiva del backbone Nemotron-H antes de usarlo en tareas de contexto largo.
- Restricciones de licencia: el adaptador se publica bajo MIT, pero el modelo base NVIDIA puede tener condiciones propias que deben verificarse antes de uso comercial.
- El adaptador está entrenado sobre el backbone de texto extraído; aplicarlo directamente sobre el modelo multimodal completo puede no funcionar sin el procedimiento de extracción documentado.
- El benchmark reportado (86,2 / 88,5) es interno del autor y no ha sido validado de forma independiente.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/disinfozone/wekwos-120b-lora
- Modelo listo para usar con RL fusionado: https://huggingface.co/disinfozone/wekwos-120b
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Sitio del proyecto: https://wekwos.com/model
- Dataset de habla: https://huggingface.co/datasets/disinfozone/pie-chimera-speech
- Plataforma de entrenamiento Tinker: https://thinkingmachines.ai/tinker/
