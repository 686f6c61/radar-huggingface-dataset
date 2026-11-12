# iclropen/evidence-audit-qwen7b-pc-a05-bound100-005-s0

## Resumen

`evidence-audit-qwen7b-pc-a05-bound100-005-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino (190.435.728 bytes, unos 0,2 GB) orientado a una tarea muy concreta: el anclaje temporal de evidencias en vídeo (*video temporal grounding*) sobre el conjunto de datos Charades-STA. El adaptador forma parte del material suplementario de un artículo titulado *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revisión.

La motivación del trabajo es metodológica: los autores sostienen que la precisión (accuracy) por sí sola no demuestra que un modelo esté realmente usando la evidencia visual. Para ello proponen un objetivo de entrenamiento "controlado por placebo" que penaliza que el modelo mantenga su respuesta cuando la evidencia se edita o se sustituye por una edición fuera del intervalo anotado. Este adaptador concreto corresponde a una configuración concreta del barrido experimental: objetivo placebo-controlado, `alpha=0.5`, ratio de cota 1.0 y holgura (*slack*) 0.05.

Es relevante ahora porque ejemplifica una línea de investigación creciente sobre evaluación de fidelidad de la evidencia en modelos multimodales, y porque documenta con inusual detalle un problema práctico de compatibilidad entre versiones de `transformers` (4.51 frente a 5.x) que puede provocar que el adaptador se cargue silenciosamente sin efecto. El repositorio no incluye pesos del modelo base ni datos de benchmarks propios en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-VL (transformer multimodal con torre visual y modelo de lenguaje); solo se distribuyen los pesos LoRA |
| Parametros totales | No disponible para el adaptador (el modelo base Qwen2.5-VL-7B-Instruct tiene 7B, según su denominación); el adaptador ocupa 190.435.728 bytes |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-VL-7B-Instruct, no especificada aquí) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapter_model.safetensors` (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-VL-7B-Instruct`, un transformer multimodal con torre visual y modelo de lenguaje. El LoRA tiene rango `r=16`, `lora_alpha=32` y dropout 0.05, con módulos objetivo `q/k/v/o/gate/up/down_proj`. Un detalle técnico importante documentado por el autor: los entrenamientos con `transformers` 4.51 usaron *gradient checkpointing*, y bajo esa configuración la torre visual no recibió gradiente, de modo que las matrices `lora_B` de la parte visual son todas cero. En consecuencia, estos adaptadores modifican únicamente el modelo de lenguaje, no la torre visual.

El entrenamiento sigue el objetivo descrito en la Sección 4 del artículo: `L = alpha * NLL(clean) + suma sobre operadores de w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge sobre la caída de placebo]`, donde `x_E` es el vídeo con la evidencia editada y `x_O` es una edición placebo emparejada fuera del intervalo anotado. Los hiperparámetros concretos son: `alpha=0.5`, `beta=0.1`, cota de placebo `d_O(entrenado) <= 1.00 d_O(referencia) + 0.05` con peso de hinge 1.0, 2.400 pares de entrenamiento (Charades-STA train, primeras líneas de `data_ids/training_pairs_pool_8434.jsonl`), 300 pasos de optimizador, semilla 0, tasa de aprendizaje 5e-6 y acumulación de gradiente 8. Los operadores de edición empleados en entrenamiento son `swap`, `mask`, `blur`, `tshift` y `shuffle`, dos por ejemplo. La entrada de vídeo se muestrea a 2 fps con un máximo de 768 fotogramas, y el estilo de prompt/respuesta es `timer1_default` / `timer1`, con el vídeo primero y el texto después. El *trainer* es `code/27_papo_train_qcdro_v3seln_r5.py` (las revisiones r3, r4 y el fichero sin sufijo tienen los mismos valores por defecto).

## Capacidades

- Anclaje temporal de evidencias en vídeo (*video temporal grounding*): localización de intervalos temporales que respaldan una consulta textual, evaluado sobre Charades-STA.
- Dependencia de la evidencia: el objetivo de entrenamiento busca que la respuesta cambie cuando la evidencia visual se edita (swap, mask, blur, tshift, shuffle) y se mantenga cuando la edición es un placebo fuera del intervalo anotado.
- Procesamiento multimodal vídeo-texto heredado del modelo base Qwen2.5-VL-7B-Instruct (entrada de vídeo a 2 fps, hasta 768 fotogramas en entrenamiento).
- Generación de texto y razonamiento multimodal: capacidades heredadas del modelo base, no verificadas de forma independiente en esta ficha.
- Soporte de *tool calling* / *function calling*: no disponible en la informacion proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponibles en la informacion proporcionada (los idiomas no se especifican).
- Modo *thinking*, visión, audio: no disponible; el adaptador solo afecta al modelo de lenguaje, no a la torre visual.

## Casos de uso

- Evaluación de fidelidad de la evidencia en modelos de vídeo: usar el adaptador junto con los scripts de auditoría del repositorio de código (`--model  --adapter <folder>`) para medir cuánto depende el modelo de la evidencia visual frente a atajos lingüísticos.
- Reproducción de experimentos del artículo: cargar el adaptador con `transformers==4.51.3` y `peft==0.20` para replicar la configuración `alpha=0.5`, cota 1.0 y slack 0.05 sobre Charades-STA.
- Investigación sobre *placebo-controlled training*: comparar esta configuración con otras del barrido (distintos valores de alpha, cota y slack) para estudiar el compromiso entre precisión y dependencia de la evidencia.
- Auditoría de sesgos de atajo en *grounding* temporal: el operador `tshift` y las ediciones placebo permiten detectar si el modelo responde a la posición temporal esperada en lugar del contenido visual.
- Base para *fine-tuning* posterior en tareas de localización temporal: el adaptador LoRA puede servir como punto de partida para ajustes sobre otros conjuntos de vídeo, dado su reducido tamaño (0,2 GB) y su licencia Apache 2.0.
- Docencia y divulgación sobre evaluación de modelos multimodales: el código de autocontrol incluido en la model card es un ejemplo práctico de cómo verificar que un adaptador PEFT se ha cargado realmente y no ha quedado como una operación nula.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de *grounding* temporal (por ejemplo, IoU o mIoU sobre Charades-STA); solo remite a los scripts de evaluación del repositorio de código.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del modelo base Qwen2.5-VL-7B-Instruct. Como referencia orientativa no verificada en esta ficha, un modelo de 7B en bfloat16 requiere del orden de 14-16 GB solo para pesos, más memoria para el procesamiento de vídeo (hasta 768 fotogramas a 2 fps) y caché de atención.
- GPU recomendadas: no disponible en la informacion proporcionada. El código de ejemplo usa `device_map="auto"` y `torch_dtype=torch.bfloat16`, lo que permite repartir el modelo entre varias GPU.
- ¿Cabe en GPU de consumo? No disponible de forma confirmada; dependería de la cuantización del modelo base y de la resolución temporal del vídeo.
- Opciones de despliegue: la model card solo documenta `transformers` 4.51.3 con `peft` 0.20 y `qwen-vl-utils`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la compatibilidad con ellos no está verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `evidence-audit-qwen7b-pc-a05-bound100-005-s0` (este) | LoRA sobre 7B (adaptador de 190 MB) | No disponible | Video temporal grounding con objetivo placebo-controlado | Apache 2.0 | Hugging Face, 0 descargas |
| `Qwen/Qwen2.5-VL-7B-Instruct` (modelo base) | 7B | No disponible en esta ficha | Multimodal generalista | No disponible en esta ficha | Hugging Face |
| Otras configuraciones del mismo barrido (`iclropen/evidence-audit-*`) | LoRA sobre 7B | No disponible | Video temporal grounding | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el modelo base `Qwen/Qwen2.5-VL-7B-Instruct` por separado; el repositorio solo contiene los pesos LoRA.
- Incompatibilidad silenciosa entre versiones de `transformers`: los adaptadores entrenados con 4.51 almacenan claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que `transformers` 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar con la versión equivocada no lanza error pero deja los pesos LoRA sin cargar; es imprescindible ejecutar el autocontrol incluido en la model card.
- La torre visual no está ajustada: por el *gradient checkpointing*, las matrices `lora_B` visuales son cero, así que el adaptador solo modifica el modelo de lenguaje. No debe esperarse una mejora en la percepción visual.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares, 300 pasos): la generalización a otros dominios de vídeo, idiomas o estilos de prompt no está verificada.
- Sin datos de benchmarks publicados en la model card: no se puede afirmar su rendimiento absoluto ni compararlo con alternativas.
- Riesgo de alucinación: inherente al modelo base; el adaptador no lo elimina, solo busca aumentar la dependencia de la evidencia.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Estado de revisión: el artículo asociado está en revisión (ICLR 2027), por lo que los resultados y la metodología pueden cambiar.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base puede tener sus propios términos que deben respetarse.
- Repositorio con 0 descargas y 0 *likes*: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-bound100-005-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de código del artículo: https://huggingface.co/iclropen/evidence-audit-code
- Artículo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (under review); sin enlace público en la informacion proporcionada.
- Conjunto de datos Charades-STA: no se proporciona enlace en la informacion disponible.
