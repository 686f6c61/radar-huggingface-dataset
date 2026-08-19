# geonmin-kim/cosmos3-super-so101-fd-chunk16

## Resumen

El modelo `geonmin-kim/cosmos3-super-so101-fd-chunk16` es un world model de robótica basado en NVIDIA Cosmos3-Super (64B), post-entrenado con LoRA para el brazo robótico SO-101. Se trata de un modelo de dinámica directa condicionado por acciones: recibe un frame real de cámara y una secuencia de acciones candidatas, y genera el video del robot ejecutándolas. Su propósito declarado es la evaluación de políticas robóticas y el análisis de fallos sin necesidad de operar el robot físico.

Desarrollado por Geonmin Kim (Nota Inc.), este checkpoint corresponde a la iteración 4000 de un entrenamiento de 30.000, con una ventana de predicción de 16 pasos de acción (17 frames a 30 fps, ~0,53 segundos). El modelo se basa en la arquitectura Mixture of Transformers (MoT) de Cosmos3-Super y está entrenado sobre un dataset propio de 1.444 episodios del brazo SO-101. Es relevante porque permite simular el comportamiento de un robot real en silico, reduciendo costes y riesgos en el desarrollo de políticas robóticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Transformers (MoT) de NVIDIA Cosmos3-Super (64B) con LoRA en `q/k/v/o_proj_moe_gen` y pathway de acción no congelado |
| Parámetros totales | 64B (modelo base) + ~21.1M parámetros entrenables (LoRA + pathway de acción) |
| Parámetros activos | no disponible (no se especifica el número de expertos activos por token) |
| Longitud de contexto | no disponible (el modelo opera sobre tokens de video; no se publica la ventana de contexto en tokens) |
| Tipos de cuantización | no disponible (el checkpoint se publica en bf16; no se ofrecen cuantizaciones alternativas) |
| Idiomas soportados | no disponible (modelo de video, no de lenguaje) |
| Licencia | OpenMDW-1.1 (base y fine-tuning) |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP) — no es safetensors ni formato HuggingFace estándar |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/Cosmos3-Super`, un modelo de mundo omnimodal de 64B basado en una arquitectura Mixture-of-Transformers (MoT). Sobre este se aplica una adaptación LoRA de rango 16 y alpha 32 sobre las proyecciones del bloque MoE, y se descongela un pathway de acción de 21.1 millones de parámetros compuesto por `action_modality_embed`, `action2llm.*` y `llm2action.*`. Este pathway permite inyectar el espacio de acción de 10 dimensiones (posición cartesiana del efector final, rotación de 6 grados y gripper) normalizado por cuantiles.

El entrenamiento se realizó con el dataset `geonmin-kim/so101_merged_v2`, que contiene 1.444 episodios, 486.000 frames y 33 tareas, capturados con una cámara top-view a 480p y 30 fps. Se utilizó un esquema FSDP con sharding de 4 vías, precisión bf16 con maestros fp32, batch efectivo de 24.000 tokens tras packing, y un learning rate de 2e-4 con scheduler LambdaCosine. La iteración de 4000 se guardó como checkpoint intermedio; el modelo se entrena en modo `forward_dynamics`, donde la condición de entrada es un frame real y una secuencia de acciones, y la salida es el video de la ejecución.

## Capacidades

- Generación de video condicionada a acciones: predice la secuencia de frames que resultaría de aplicar una secuencia de acciones al robot, dado un frame inicial.
- Predicción de dinámica directa (forward dynamics) en el espacio de acciones cartesiano del efector final.
- Generación de rollouts autoregresivos encadenando chunks de 16 pasos para secuencias más largas.
- Modo teacher-forced: re-inyecta el frame real cada chunk para mantener la fidelidad en evaluaciones.
- Evaluación de políticas robóticas sin hardware físico: permite probar candidatas políticas de control en silico.
- Soporte de múltiples vistas: el modelo está entrenado con una vista única superior (`top`), pero la arquitectura admite `ego_view` (no se detalla si se soporta en este checkpoint).
- No tiene capacidades de lenguaje, visión general, tool calling ni agentes.

## Casos de uso

- **Evaluación de políticas robóticas en simulación**: dado un episodio grabado, se puede alimentar al modelo con las acciones de una política candidata y generar el video de la ejecución para evaluar el comportamiento sin activar el robot físico. El modo teacher-forced permite comparar con el episodio real (PSNR 34.4 dB).
- **Análisis de fallos y depuración**: cuando una política falla en el robot real, el modelo puede reproducir la secuencia de acciones en simulación para identificar el punto de fallo y verificar si es un problema de control, de percepción o del entorno.
- **Generación de datos sintéticos para entrenamiento**: se pueden generar rollouts de ejecuciones con acciones variadas para aumentar el dataset de entrenamiento de políticas downstream, especialmente en tareas con bajo volumen de datos.
- **Validación de controladores de movimiento**: el modelo puede verificar si una secuencia de waypoints en el espacio cartesiano produce el movimiento deseado del brazo, con una correlación de movimiento de 0.50 y una separación de ejes de 86° (frente a 32° del modelo base).
- **Planificación de trayectorias**: se pueden evaluar múltiples trayectorias candidatas en paralelo en silico y seleccionar la que mejor se ajuste al objetivo antes de desplegarla en el robot.
- **Investigación en world models**: sirve como base para estudiar la predicción de video condicionada a acciones en robótica, con un horizonte útil de ~0.5 s y un factor de tiempo real de 0.067 (es decir, el modelo es ~15 veces más lento que la ejecución real).

## Benchmarks y rendimiento

La evaluación se realizó sobre episodios reservados (held-out) con dos modos: teacher-forced (re-inyectando el frame real en cada chunk) y autoregressive (el modelo consume su propia salida). Resultados reportados en la iteración 4000:

| Métrica | Valor |
|---|---|
| PSNR (autoregressive) | 18.8 dB |
| SSIM (autoregressive) | 0.844 |
| Motion ratio (1.0 = coincide con la realidad) | 0.87 |
| Motion correlation | 0.50 |
| Separación de ejes (90° ≈ techo) | 86° (modelo base: 32°) |
| Horizonte útil | ~0.5 s |
| Factor de tiempo real | 0.067 |

La evaluación con sondas sintéticas de dirección constante (16-frame horizon) mostró que el signo del eje x se respeta y es fiable (cos −0.95), el signo del eje z se respeta pero con baja visibilidad del brazo, y el eje y es no concluyente. El modelo se degrada notablemente en modo autoregressive (PSNR 31.1 → 18.0) en comparación con teacher-forced (31.1 → 34.4), lo que motivó el desarrollo de la variante `chunk_length=32`.

## Requisitos de hardware

- **Entrenamiento**: se utilizaron 4× A100 80GB con FSDP de 4 vías, bf16 y fp32 maestro. El checkpoint DCP ocupa ~120 GB (modelo completo + LoRA).
- **Inferencia**: no se publican requisitos mínimos de VRAM. Dado el tamaño del modelo base (64B), se recomienda al menos 80 GB de VRAM en una GPU A100/H100 o 2× A100 40GB con tensor parallelism. No se indica si cabe en GPU de consumo (RTX 4090 no sería suficiente sin cuantización, y no se ofrecen cuantizaciones).
- **Opciones de despliegue**: el modelo se carga exclusivamente a través de `cosmos-framework` (pinned a commit `5e67049`) con el overlay de `nota-github/xpu-cosmos3-simulator`. No hay soporte para vLLM, llama.cpp u Ollama.
- **Latencia**: factor de tiempo real de 0.067, es decir, ~15× más lento que la ejecución real. Para un chunk de 0.53 s, la generación tarda ~8 s en una A100 80GB (estimación basada en el factor reportado).
- **Requisitos de memoria adicional**: se requieren los ficheros de normalización de acciones (`so101_stats_stride1_v2.json`) y el dataset de entrada en formato LeRobot.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Cosmos3-Super SO-101 FD chunk16** (este) | MoT 64B + LoRA | 64B + 21.1M | no disponible | OpenMDW-1.1 | DCP, requiere cosmos-framework |
| **Cosmos3-Super (base)** | MoT 64B | 64B | no disponible | OpenMDW-1.1 | HF, safetensors |
| **Cosmos3-Super SO-101 FD chunk32** | MoT 64B + LoRA | 64B + 21.1M | no disponible | OpenMDW-1.1 | DCP, requiere cosmos-framework |
| **NVIDIA Cosmos3 (modelo de mundo general)** | MoT | no disponible | no disponible | OpenMDW-1.1 | HF |

La comparativa directa con otros modelos de world modeling robótico no está disponible en la información proporcionada. El chunk16 se diferencia del chunk32 en el horizonte de predicción por chunk (0.53 s vs ~1.07 s), siendo el chunk32 el orientado a horizontes más largos.

## Limitaciones y advertencias

- **Degradación en modo autoregressive**: el modelo consume su propia salida, el PSNR cae de 31.1 a 18.0 dB, lo que limita el horizonte útil a ~0.5 s. Para rollouts más largos se recomienda usar el chunk32 o realimentación de frames reales.
- **Dependencia de la normalización de acciones**: el checkpoint se entrenó con `so101_stats_stride1_v2.json`. Usar la versión v1 puede desescalar acciones hasta un 19%, invalidando las predicciones. Es un requisito contractual del modelo.
- **Sesgo de datos**: entrenado exclusivamente con episodios del brazo SO-101 en un entorno con cámara superior fija a 480p. No generaliza a otros robots, cámaras o entornos.
- **Limitación de ejes**: el eje y no es concluyente en las sondas sintéticas, y la visibilidad del brazo en el eje z es baja.
- **Riesgo de alucinación visual**: como modelo de generación de video, puede producir movimientos físicamente implausibles o artefactos, especialmente fuera del horizonte de 0.5 s.
- **Restricciones de licencia**: OpenMDW-1.1 impone condiciones sobre el uso y la redistribución; es necesario revisar los términos antes de uso comercial.
- **Formato de checkpoint propietario**: no es compatible con herramientas estándar de HuggingFace (safetensors, transformers). Requiere el framework específico y la configuración exacta del entorno (Python 3.13, cosmos-framework pinned).
- **Sin soporte de cuantización**: no se ofrecen versiones cuantizadas, lo que limita el despliegue en hardware de gama media.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/geonmin-kim/cosmos3-super-so101-fd-chunk16)
- [Modelo base: nvidia/Cosmos3-Super](https://huggingface.co/nvidia/Cosmos3-Super)
- [Dataset de entrenamiento: geonmin-kim/so101_merged_v2](https://huggingface.co/datasets/geonmin-kim/so101_merged_v2)
- [Repositorio de simulación: nota-github/xpu-cosmos3-simulator](https://github.com/nota-github/xpu-cosmos3-simulator)
- [Cosmos Framework (NVIDIA)](https://github.com/NVIDIA/cosmos-framework)
- [Página de Cosmos 3 (NVIDIA Research)](https://research.nvidia.com/labs/cosmos-lab/cosmos3/)
- [Autor: Geonmin Kim (GitHub)](https://github.com/lifelongeek)
