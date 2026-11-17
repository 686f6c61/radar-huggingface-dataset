# cpsu04/r4d-2b-groot-trdc

## Resumen

r4d-2b-groot-trdc es un conjunto de checkpoints de un modelo visión-lenguaje-acción (VLA) de 2.000 millones de parámetros construido sobre Qwen/Qwen3-VL-2B-Instruct mediante el framework `QwenGR00T` del código StarVLA, con un diseño inspirado en la familia GR00T de NVIDIA. Lo publica el usuario cpsu04 en Hugging Face y está orientado a robótica: recibe observaciones visuales y una instrucción en lenguaje natural y emite acciones motrices para un brazo robótico, en la línea de los modelos que controlan robots manipuladores a partir de demostraciones. El repositorio contiene dos recetas de entrenamiento (una solo con datos de acción y otra con co-entrenamiento de acciones y VQA) y todos los resultados de evaluación en SimplerEnv.

El interés técnico del modelo está en documentar el efecto del co-entrenamiento multimodal sobre el rendimiento motor: el autor compara una variante "baseline" (solo acciones, `loss_scale.vlm: 0`) frente a una variante "dbfl" que intercala un paso de VQA cada 11 pasos de acción (`interleave_ratio: 11`). Los datos de acción provienen del conjunto `bridge_rt_1` (Bridge + RT-1) y las evaluaciones se realizan con el cliente oficial de StarVLA para WidowX y con el arnés de Google Robot en SimplerEnv.

El repositorio es muy pesado (215,2 GB) porque incluye checkpoints completos cada 2.500 pasos, configuraciones, estadísticas de normalización de acciones y vídeos de todas las evaluaciones. No es un modelo pensado para uso general ni para despliegue conversacional: es material de investigación reproducible sobre entrenamiento de políticas VLA y su evaluación en simuladores de manipulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) sobre transformer multimodal Qwen3-VL-2B-Instruct, framework `QwenGR00T` (StarVLA) |
| Parámetros totales | 2B (según el nombre del modelo; no se detalla el desglose) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los checkpoints se distribuyen en `pytorch_model.pt` de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | state dict PyTorch (`steps_<N>_pytorch_model.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue el patrón de los VLA tipo GR00T: un backbone de visión-lenguaje (Qwen3-VL-2B-Instruct) que procesa la imagen de la escena y la instrucción, y una cabeza de acción que produce comandos motrices. La implementación concreta es el framework `QwenGR00T` del código StarVLA (`starVLA_clean`), y los datos de acción son `bridge_rt_1`, una mezcla de demostraciones de Bridge y RT-1. El repositorio contiene dos configuraciones: `baseline` (entrenamiento solo con pérdida de acción, `loss_scale.vlm: 0`) y `dbfl` (acciones co-entrenadas con datos de VQA propios, D+B+F+L más un prompt de movimiento, con un paso de VQA cada 11 pasos de acción y `loss_scale.vlm: 1.0`).

Ambos entrenamientos usan 50.000 pasos, 5.000 de warmup, decaimiento coseno hasta un LR mínimo de 5e-7 y batch global de 256 (8 GPU H100, 4 por GPU con acumulación 8). Se guardan checkpoints completos cada 2.500 pasos; el baseline incluye además un guardado extra en el paso 31.000. Junto a los pesos se incluye `dataset_statistics.json`, necesario para desnormalizar las acciones en inferencia, el log de pérdida `summary.jsonl` y las configuraciones de accelerate/DeepSpeed.

## Capacidades

- Control de manipulación robótica a partir de observaciones visuales e instrucciones en lenguaje natural, en el estilo de las políticas VLA.
- Generación de acciones continuas para brazos manipuladores entrenados con datos de Bridge y RT-1.
- Procesamiento multimodal imagen + texto heredado del backbone Qwen3-VL-2B-Instruct.
- Co-entrenamiento con datos de VQA (variante `dbfl`), que según los resultados mejora la tasa de éxito en varias tareas de SimplerEnv.
- Evaluación reproducible en SimplerEnv: WidowX (4 tareas, 24 episodios cada una) y Google Robot (pick coke can, move near, open/close drawer, put apple in drawer).
- No se documentan tool calling, soporte de agentes multi-paso, ni capacidades de audio o thinking mode.
- No se documentan capacidades multilingües específicas.

## Casos de uso

- Investigación en políticas VLA: reproducir el experimento de co-entrenamiento acción+VQA comparando las carpetas `baseline/` y `dbfl/` con los mismos datos y receta, para aislar el efecto del co-entrenamiento multimodal.
- Evaluación en SimplerEnv: reutilizar los scripts de `scripts/` y el arnés de Google Robot (renderizado CPU y GPU con raytracing y denoiser OptiX) para medir tasas de éxito de nuevas variantes sobre WidowX y Google Robot.
- Punto de partida para fine-tuning en un brazo concreto: cargar `steps_45000_pytorch_model.pt` con `load_state_dict` y ajustar con demostraciones propias, usando `dataset_statistics.json` para la normalización de acciones.
- Estudio de estabilidad del entrenamiento: analizar `summary.jsonl` y los checkpoints intermedios (cada 2.500 pasos) para caracterizar la evolución de la pérdida y el rendimiento por paso.
- Comparación de tareas de manipulación: usar los resultados por tarea (carrot, eggplant, spoon, block, coke, near, drawer, apple) como referencia para diagnosticar en qué habilidades falla una política (por ejemplo, la baja tasa en la tarea "block").
- Base para experimentos de prompting de movimiento: la variante `dbfl` incluye un "motion prompt" en los datos de VQA, útil para estudiar cómo el lenguaje de movimiento influye en la política de acción.
- Docencia y divulgación: el repositorio incluye vídeos y registros de episodios que permiten ilustrar el comportamiento de un VLA en simulación sin necesidad de hardware.

## Benchmarks y rendimiento

Resultados en SimplerEnv (porcentaje de éxito). WidowX es la media ± desviación típica de 4 evaluaciones; cada tarea de Google es la media de 3 evaluaciones y la columna Google promedia las 4 tareas.

| Modelo | carrot | eggplant | spoon | block | WidowX | coke | near | drawer | apple | Google |
|---|---|---|---|---|---|---|---|---|---|---|
| baseline 30K | 29,2 | 95,8 | 42,7 | 19,8 | 46,9±4,4 | 94,9 | 66,7 | 36,0 | 8,1 | 51,4 |
| baseline 40K | 30,2 | 95,8 | 43,8 | 11,5 | 45,3±3,9 | 97,9 | 71,3 | 54,0 | 33,6 | 64,2 |
| baseline 45K | 35,4 | 89,6 | 44,8 | 10,4 | 45,1±2,6 | 98,1 | 71,7 | 56,0 | 22,8 | 62,2 |
| baseline 50K | 34,4 | 92,7 | 45,8 | 17,7 | 47,7±2,7 | 98,3 | 72,9 | 50,0 | 30,0 | 62,8 |
| dbfl 40K | 47,9 | 86,5 | 71,9 | 11,5 | 54,4±0,5 | 94,0 | 82,9 | 52,2 | 45,1 | 68,5 |
| dbfl 45K | 45,8 | 83,3 | 66,7 | 20,8 | 54,2±2,3 | 92,5 | 78,5 | 56,3 | 46,6 | 68,5 |

Los checkpoints dbfl 35K y 50K solo tienen resultados de WidowX y de coke/near (una sola ejecución), disponibles en `eval_results/`.

## Requisitos de hardware

- Entrenamiento: 8 GPU H100 con batch global 256 (4 por GPU, acumulación 8), según la receta del autor.
- Inferencia: no se publican requisitos de VRAM. Con 2B parámetros, en FP16 el peso ronda los 4 GB, pero el repositorio no ofrece versiones cuantizadas ni mediciones de latencia.
- GPU consumer: no confirmado. El modelo base (Qwen3-VL-2B-Instruct) es de tamaño contenido y podría caber en GPUs consumer de gama alta, pero el autor no documenta pruebas en RTX 4090 u otras.
- Despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La carga indicada es manual: `torch.load` del state dict y construcción del modelo con el código StarVLA a partir de `config/config.full.yaml`.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 215,2 GB por los checkpoints y vídeos de evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| r4d-2b-groot-trdc | 2B | no disponible | VLA sobre Qwen3-VL-2B, datos Bridge+RT-1 | other | Hugging Face, pesos en `.pt` |
| GR00T (NVIDIA) | no disponible | no disponible | VLA de referencia en el que se inspira el diseño | no disponible | no disponible |
| Qwen3-VL-2B-Instruct | 2B | no disponible | VLM base, sin cabeza de acción | no disponible | Hugging Face |
| Políticas RT-1 / RT-2 | no disponible | no disponible | VLA de Google entrenados con datos de robot | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la tabla solo contrasta enfoque y disponibilidad.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos de uso comercial; hay que consultar la licencia del repositorio y la del modelo base Qwen3-VL-2B-Instruct antes de cualquier uso en producción.
- Modelo de investigación: no se documentan idiomas soportados, contexto, cuantizaciones ni requisitos de inferencia, lo que dificulta su uso fuera del entorno de entrenamiento original.
- Dependencia fuerte del código StarVLA (`starVLA_clean`) y de `config/config.full.yaml`; los pesos son state dicts `.pt`, no safetensors, con el riesgo de seguridad asociado a `torch.load`.
- La normalización de acciones requiere `dataset_statistics.json`; sin él las acciones generadas no son interpretables.
- Rendimiento desigual por tarea: la tarea "block" en WidowX se mantiene entre el 10,4 % y el 20,8 % de éxito en todos los checkpoints, y "apple" en Google varía mucho entre pasos (8,1 % a 46,6 %).
- Solo evaluado en simulación (SimplerEnv); no hay evidencia de transferencia a robots reales.
- Riesgo de alucinación y sesgos del backbone Qwen3-VL no evaluados en este repositorio; el co-entrenamiento con VQA puede introducir comportamientos no deseados en la política de acción.
- El repositorio es muy grande (215,2 GB) por incluir checkpoints y vídeos, lo que encarece su descarga y almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpsu04/r4d-2b-groot-trdc
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Código StarVLA (framework `QwenGR00T`): no disponible en la información proporcionada
- SimplerEnv: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
