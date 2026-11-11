# LoongForge/LoongForge-GR00T-N1.7-SimplerEnv-Fractal

## Resumen

LoongForge-GR00T-N1.7-SimplerEnv-Fractal es un checkpoint de ajuste fino supervisado (SFT) del modelo vision-language-action (VLA) abierto NVIDIA GR00T-N1.7-3B, entrenado por LoongForge (proyecto de Baidu) para reproducir la receta oficial de evaluación en SimplerEnv sobre el conjunto de datos Fractal del Google Robot. El modelo resuelve el problema de traducir instrucciones en lenguaje natural e imágenes de una cámara externa en secuencias de acciones de control robótico de extremo a extremo, y su relevancia radica en que valida que el stack de entrenamiento LoongForge replica el rendimiento de referencia de NVIDIA (72,1 % frente a 72,5 % de éxito medio) con una diferencia de apenas 0,4 puntos.

Arquitectónicamente combina un backbone vision-language Cosmos-Reason2-2B (basado en Qwen3-VL) que codifica imágenes y texto, y una cabeza de acción implementada como transformer de difusión con flow matching (DiT) que condiciona la generación de acciones sobre la representación multimodal y la propiocepción del robot. El modelo completo tiene 3.455.180.928 parámetros en FP32 y emite acciones absolutas de 7 dimensiones en bloques de 8 pasos, ejecutando un solo paso antes de replanificar.

Se distribuye bajo la NVIDIA Open Model License, únicamente en inglés y con pesos en un único fichero `pytorch_model.pt` (~12,5 GB) que no es compatible con `AutoModel` de Transformers: requiere el stack de evaluación propio de LoongForge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action: backbone Cosmos-Reason2-2B (Qwen3-VL) + cabeza de acción DiT con flow matching |
| Parametros totales | 3.455.180.928 (1.031 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; el serving admite `use_bf16: true`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | `pytorch_model.pt` (state dict único en FP32, ~12,5 GB) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de GR00T-N1.7: un backbone vision-language Cosmos-Reason2-2B (familia Qwen3-VL) procesa la instrucción de tarea y una única vista de cámara exterior (256 × 320 nativa, recorte central a 256 × 256 con `crop_fraction` 0,95, sin letterbox), mientras que la propiocepción del robot (8 dimensiones: posición EEF 3, cuaternión de orientación 4, cierre de pinza 1, sin canal `pad` muerto como en WidowX) se inyecta en la cabeza de acción. Esta cabeza es un transformer de difusión (DiT) entrenado con flow matching que decodifica bloques de 8 acciones futuras de 7 dimensiones (posición 3, Euler 3, pinza continua 1), en valores absolutos y no delta. En entrenamiento solo se actualizan el proyector, el DiT y las normas de las capas VL; el LLM y la torre visual permanecen congelados.

El ajuste fino se realizó sobre el dataset `IPEC-COMMUNITY/fractal20220817_data_lerobot` (LeRobot v2.1, 87.212 episodios, 3.786.400 fotogramas a 3 fps, `robot_type=google_robot`), con los vídeos AV1 originales convertidos a H.264 porque el backend `torchcodec` no decodifica AV1. La receta: 50.000 iteraciones, batch global 1.024 (128 × 8 GPUs, sin acumulación de gradiente), LR base 1e-4 con decaimiento coseno y 2.500 iteraciones de warmup, weight decay 1e-5 excluyendo bias y normas, grad clip 1.0, semilla 42, bf16 y DDP. Se aplicó state dropout de 0,5 tanto en el lado de datos como en el de modelo, y normalización por percentiles `q01`/`q99` con recorte de outliers usando el `dataset_statistics.json` incluido. La evaluación ejecuta 1 paso antes de replanificar (`--n_action_steps 1`).

## Capacidades

- Control robótico de extremo a extremo: genera acciones de efector final (posición, orientación Euler y apertura de pinza) a partir de instrucciones en lenguaje natural e imágenes.
- Comprensión visuo-lingüística heredada del backbone Qwen3-VL: interpreta escenas y objetos en la imagen de cámara para condicionar la política.
- Condicionamiento por instrucción de tarea: la misma política se adapta a distintas tareas del benchmark mediante el texto de la instrucción.
- Integración de propiocepción: consume el estado del robot (posición, cuaternión y pinza) como entrada adicional a la cabeza de acción.
- Planificación por bloques con replanificación: predice 8 pasos y ejecuta 1, permitiendo control reactivo en bucle cerrado.
- Especialización por embodiment: etiqueta `simpler_env_google`, orientada al Google Robot en SimplerEnv.
- No soporta tool calling, function calling, agentes multi-paso generales ni modalidades de audio; no se documentan capacidades multilingües más allá del inglés.

## Casos de uso

- Evaluación reproducible de políticas VLA en SimplerEnv: sirve como referencia para comparar implementaciones propias con la receta oficial de NVIDIA (`examples/SimplerEnv`, Fractal / Google Robot) usando `chunk_execute_steps: 1`.
- Validación de stacks de entrenamiento alternativos: permite verificar que un pipeline propio (en este caso LoongForge) reproduce el rendimiento del modelo base (72,1 % frente a 72,5 %), útil para auditar frameworks de SFT.
- Investigación en manipulación robótica simulada: base para experimentos de ajuste fino sobre el embodiment `simpler_env_google` con nuevos datasets en formato LeRobot v2.1.
- Punto de partida para transferencia a otros embodiments: al ser un SFT del GR00T-N1.7-3B, puede servir de inicialización para políticas en robots distintos, ajustando la etiqueta de embodiment y las estadísticas de normalización.
- Benchmarking de infraestructura de inferencia: con ~3,46 mil millones de parámetros y pesos FP32 de ~12,5 GB, es útil para medir latencia y throughput de servidores de políticas en bf16.
- Reproducción de experimentos académicos: permite replicar resultados publicados sobre Fractal sin depender del checkpoint original de NVIDIA, facilitando comparaciones controladas.
- Docencia y divulgación: ejemplo completo y documentado de un pipeline VLA (datos, normalización, entrenamiento y evaluación) para cursos de robótica e IA.

## Benchmarks y rendimiento

| Benchmark | Tareas | Episodios | Métrica | LoongForge-GR00T-N1.7-SimplerEnv-Fractal | Referencia NVIDIA N1.7 |
|---|---|---|---|---|---|
| SimplerEnv Fractal (Google Robot) | 6 | 100 por tarea, media de 3 ejecuciones | Tasa de éxito media | 72,1 % | 72,5 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Pesos publicados en FP32: ~12,5 GB en disco; en memoria requieren al menos ~13-14 GB solo para los pesos.
- Inferencia en bf16 (`use_bf16: true`): estimación de ~7 GB para pesos, más overhead de activaciones y del backbone Cosmos-Reason2-2B; se recomienda GPU con 16 GB o más.
- GPU recomendadas: A100, H100 o L40S para serving estable en bf16; RTX 4090 (24 GB) es viable para inferencia en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16; en GPUs de 16 GB el margen es ajustado y no está confirmado.
- Despliegue: el checkpoint no es compatible con `AutoModel` de Transformers; requiere el stack de evaluación de LoongForge con backend `loongforge`, `model_type: Gr00tN1d7` y configuración explícita de `ckpt_path`, `dataset_statistics_path`, `embodiment_tag: simpler_env_google` y `chunk_execute_steps: 1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Backbone | Contexto | Rendimiento SimplerEnv Fractal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LoongForge-GR00T-N1.7-SimplerEnv-Fractal | 3,46 B | Cosmos-Reason2-2B (Qwen3-VL) | no disponible | 72,1 % | NVIDIA Open Model License | Hugging Face (LoongForge) |
| nvidia/GR00T-N1.7-3B (referencia) | ~3 B (no confirmado en detalle) | Cosmos-Reason2-2B (Qwen3-VL) | no disponible | 72,5 % | NVIDIA Open Model License | Hugging Face (NVIDIA) |
| Otros checkpoints VLA de la familia GR00T-N1.7 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especializado en un único embodiment (`simpler_env_google`) y en el benchmark SimplerEnv Fractal; no es un modelo generalista de robótica.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Entrenado exclusivamente con el dataset Fractal (Google Robot en simulación); el rendimiento en robots reales o escenas fuera de distribución no está validado.
- Riesgo de sobreajuste a las 6 tareas del benchmark: la tasa del 72,1 % se mide sobre esas tareas concretas, no sobre manipulación general.
- El modelo base GR00T-N1.7-3B puede heredar sesgos de sus datos de preentrenamiento vision-language; no se detallan evaluaciones de sesgo.
- Riesgo de alucinación en la interpretación de instrucciones o escenas ambiguas, con posible generación de acciones erróneas.
- Licencia NVIDIA Open Model License: es necesario revisar sus términos antes de uso comercial; el campo `license` de Hugging Face figura como `other`.
- Los pesos no son compatibles con `AutoModel` de Transformers; `config.json` es solo metadato descriptivo y la integración exige el stack de LoongForge.
- El checkpoint se publicó con 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- La conversión de vídeos AV1 a H.264 fue un paso necesario del pipeline; reproducir el entrenamiento sin ese paso falla con `torchcodec`.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/LoongForge/LoongForge-GR00T-N1.7-SimplerEnv-Fractal)
- [Modelo base nvidia/GR00T-N1.7-3B](https://huggingface.co/nvidia/GR00T-N1.7-3B)
- [Backbone nvidia/Cosmos-Reason2-2B](https://huggingface.co/nvidia/Cosmos-Reason2-2B)
- [Dataset IPEC-COMMUNITY/fractal20220817_data_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)
- [Repositorio LoongForge](https://github.com/baidu-baige/LoongForge)
- [Repositorio NVIDIA Isaac-GR00T](https://github.com/NVIDIA/Isaac-GR00T)
- [Repositorio SimplerEnv](https://github.com/simpler-env/SimplerEnv)
