# LoongForge/LoongForge-GR00T-N1.7-SimplerEnv-Bridge

## Resumen

LoongForge-GR00T-N1.7-SimplerEnv-Bridge es un checkpoint de ajuste fino supervisado (SFT) del modelo visión-lenguaje-acción (VLA) NVIDIA GR00T-N1.7-3B, entrenado por LoongForge (Baidu) para la tarea de manipulación robótica SimplerEnv Bridge con el brazo WidowX. El modelo parte de un backbone visión-lenguaje Cosmos-Reason2-2B (basado en Qwen3-VL) que condiciona una cabeza de acción de tipo diffusion transformer (DiT) con flow matching sobre imágenes, instrucciones en lenguaje natural y propriocepción del robot, y decodifica un chunk de acciones futuras.

El checkpoint reproduce en el stack LoongForge la receta oficial `examples/SimplerEnv` (Bridge/WidowX) de NVIDIA Isaac-GR00T, y reporta un 63,5 % de éxito medio en las 7 tareas de WidowX, ligeramente por encima del 62,3 % de referencia de NVIDIA N1.7. La política emite acciones absolutas de efector final en 7 dimensiones, en chunks de 8 pasos, ejecutando 4 pasos antes de replanificar.

Es relevante porque demuestra que el pipeline de entrenamiento abierto LoongForge puede reproducir con fidelidad los resultados de referencia de NVIDIA sobre un benchmark estándar de manipulación, lo que facilita la experimentación y el ajuste fino de políticas VLA sin depender exclusivamente del stack original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone visión-lenguaje Cosmos-Reason2-2B (Qwen3-VL) + cabeza de acción diffusion transformer (DiT) con flow matching |
| Parametros totales | 3.455.180.928 (~3,46 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | en |
| Licencia | nvidia-open-model-license (etiquetada como "other") |
| Formato de pesos | PyTorch state dict en fichero único `pytorch_model.pt` (FP32, ~12,5 GB, 1.031 tensores) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T-N1.7: un backbone visión-lenguaje Cosmos-Reason2-2B (familia Qwen3-VL) procesa la instrucción de tarea y una única vista de cámara exterior (`image_0`), y su representación condiciona una cabeza de acción de tipo diffusion transformer entrenada con flow matching. La cabeza decodifica chunks de 8 pasos de acciones absolutas de 7 dimensiones (posición 3, orientación Euler 3, pinza continua 1). El estado del robot tiene 8 dimensiones: posición del efector final (3), orientación Euler (3), un canal `pad` muerto siempre a 0 (índice 6) y apertura de pinza en [0, 1] (índice 7).

El ajuste fino se realizó sobre el dataset Bridge (`IPEC-COMMUNITY/bridge_orig_lerobot`, LeRobot v2.1: 53.192 episodios, 1.893.026 frames, 5 fps, `robot_type=widowx`). Solo se entrenaron el proyector, el diffusion transformer y las normas de capa VL; el LLM y la torre visual quedaron congelados. El entrenamiento usó 20.000 iteraciones con batch global de 1.024 (128 × 8 GPUs, sin acumulación de gradiente), LR base 1e-4 con decaimiento coseno y 1.000 iteraciones de warmup, weight decay 1e-5 (excluyendo bias y normas), grad clip 1.0, semilla 42, bf16 y DDP. Se aplicó state dropout de 0.8 en el lado del modelo y 0.2 en el lado de los datos. El preprocesado de imagen usa borde corto 256, `crop_fraction` 0.95 y recorte central de 230 × 230 a 256 × 256 sin letterbox; la normalización es por percentiles q01/q99 con recorte de outliers, usando el `dataset_statistics.json` incluido.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de instrucciones en lenguaje natural e imágenes.
- Control de brazo WidowX con acciones absolutas de efector final en chunks de 8 pasos (ejecución de 4 pasos antes de replanificar).
- Percepción visual de una única vista de cámara exterior (`image_0`) para condicionar la política.
- Fusión de estado proprioceptivo del robot (posición, orientación y apertura de pinza) con la representación visión-lenguaje.
- Ejecución de tareas de manipulación del benchmark SimplerEnv Bridge.
- No soporta tool calling ni function calling (es una política VLA, no un LLM conversacional).
- No soporta agentes ni razonamiento multi-paso en el sentido de LLM; la "planificación" es la decodificación de chunks de acción.
- Capacidades multilingües limitadas al inglés (idioma declarado: `en`).

## Casos de uso

- Evaluación reproducible de políticas VLA en SimplerEnv: sirve como checkpoint de referencia para comparar recetas de entrenamiento en el benchmark Bridge/WidowX, ya que reproduce la receta oficial de NVIDIA con un resultado reportado de 63,5 % frente al 62,3 % de referencia.
- Investigación en ajuste fino de modelos VLA: al entrenar solo proyector, DiT y normas VL (backbone congelado), es un punto de partida económico para experimentar con nuevos datasets de manipulación sin reentrenar el backbone de 2B.
- Desarrollo de pipelines de entrenamiento alternativos: permite validar el stack LoongForge frente a Isaac-GR00T sobre la misma tarea y datos, útil para equipos que quieran migrar su flujo de trabajo.
- Prototipado de control de brazo WidowX en simulación: la política emite acciones absolutas de 7D en chunks de 8 pasos, adecuada para integrarse en bucles de control con replanificación cada 4 pasos.
- Estudio de robustez ante dropout de estado: el entrenamiento con state dropout 0,8/0,2 permite analizar cómo se comporta la política cuando la propriocepción es ruidosa o parcialmente ausente.
- Base para transferencia a otros entornos SimplerEnv: el checkpoint y su configuración de evaluación (`embodiment_tag: simpler_env_widowx`) sirven de plantilla para adaptar la receta a otros brazos o benchmarks del mismo ecosistema.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| SimplerEnv Bridge (WidowX), 7 tareas | Tasa de éxito media (100 episodios por tarea, media de 3 ejecuciones) | 63,5 % |
| Referencia NVIDIA N1.7 (mismo benchmark) | Tasa de éxito media | 62,3 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de robótica y no de un LLM de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en FP32 (~12,5 GB), por lo que se necesitan al menos ~13 GB de VRAM solo para los pesos, más memoria para activaciones y el backbone Cosmos-Reason2-2B.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, una GPU con 24 GB o más (RTX 4090, A100, H100) es un punto de partida razonable, aunque no está confirmado por el autor.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) usando bf16 (`use_bf16: true` en la configuración de evaluación), aunque no hay confirmación oficial.
- Opciones de despliegue: el checkpoint se sirve mediante el stack de evaluación de LoongForge (`backend: loongforge`, `model_type: Gr00tN1d7`) apuntando al directorio con `pytorch_model.pt` y `dataset_statistics.json`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark (SimplerEnv Bridge WidowX) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoongForge-GR00T-N1.7-SimplerEnv-Bridge | ~3,46 B | no disponible | 63,5 % éxito medio | nvidia-open-model-license | Hugging Face (LoongForge) |
| nvidia/GR00T-N1.7-3B (referencia) | ~3 B | no disponible | 62,3 % éxito medio | nvidia-open-model-license | Hugging Face (NVIDIA) |
| Otros modelos VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse solo con el dataset Bridge (entorno WidowX), la política está especializada en ese embodiment y puede generalizar mal a otros robots o cámaras.
- Riesgo de alucinación: en un modelo de acción, el equivalente es la generación de acciones no válidas o inseguras; no hay evaluación de seguridad documentada.
- Limitaciones de contexto e idioma: solo soporta inglés (`en`) y una única vista de cámara exterior; el estado del robot incluye un canal `pad` muerto que debe mantenerse a 0.
- Restricciones de licencia: licencia `nvidia-open-model-license` (etiquetada como "other"); es necesario revisar los términos de NVIDIA para uso comercial, ya que no es una licencia permisiva estándar.
- Caveat de producción: el `config.json` es solo metadatos descriptivos y no es una configuración de `AutoModel` de Transformers; el checkpoint debe cargarse con la configuración de evaluación explícita de LoongForge, no con la API estándar de Transformers.
- El checkpoint está pensado para evaluación en SimplerEnv; no se documenta su robustez fuera de ese benchmark ni en el robot físico.
- Precisión FP32 en los pesos publicados: el despliegue en bf16 requiere conversión y puede alterar ligeramente el rendimiento reportado.

## Enlaces

- Hugging Face: https://huggingface.co/LoongForge/LoongForge-GR00T-N1.7-SimplerEnv-Bridge
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Backbone visión-lenguaje: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot
- Repositorio LoongForge: https://github.com/baidu-baige/LoongForge
- Configs de evaluación SimplerEnv en LoongForge: https://github.com/baidu-baige/LoongForge/tree/master/examples/embodied/groot_n1_7/eval/configs/simplerenv
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio SimplerEnv: https://github.com/simpler-env/SimplerEnv
