# kaiwen2/antant

## Resumen

`antant` es un repositorio de checkpoints de políticas de aprendizaje por refuerzo para manipulación robótica diestra, publicado por el usuario kaiwen2 bajo licencia Apache 2.0. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un paquete de artefactos de despliegue para una tarea concreta: manipulación de rotulador y borrador (`marker_eraser`) con una mano diestra Wuji Hand 2.2 de 20 grados de libertad montada sobre un brazo Franka FR3 de 7 grados de libertad. El repositorio corresponde al paquete sim-to-real `policy-1124` (Sprint 3, S3R2 y S4).

Cada política se distribuye en varios formatos: un grafo ONNX autocontenido de unos 6 MB (opset 17, con normalización empírica integrada y la media determinista del actor), pesos del actor en PyTorch, un `config.json` con metadatos de despliegue y los checkpoints completos de entrenamiento `rsl_rl` (actor, crítico y estado del optimizador Adam). El modelo opera a 50 Hz (`ctrl_dt=0.02`), con `obs_dim=809` y `action_dim=20`, y está pensado para inferencia sin PyTorch usando únicamente `numpy` y `onnxruntime`.

Su relevancia es acotada pero práctica: ofrece políticas ya entrenadas y validadas en MuJoCo con dominio aleatorizado (DR) y distintos niveles de estrés perceptivo, además de trayectorias de referencia en bucle abierto. La política recomendada, `eraser_stow_pyr`, alcanza una supervivencia de episodio de 0,986 en D0 y 0,879 en D2 con cono elíptico, y de 0,957 y 0,749 con cono piramidal, lo que la convierte en la opción más robusta del paquete para transferencia sim-to-real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP actor (política de RL) exportada a ONNX; entrenamiento con `rsl_rl` (actor-crítico) |
| Parametros totales | no disponible (pesos del actor ~6 MB en ONNX y en `actor_only.pt`; checkpoint completo ~42 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de dimensión fija `obs_dim=809` |
| Tipos de cuantizacion | no disponible (exportación ONNX en precisión nativa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), PyTorch `.pt` (`actor_only.pt`, `model_*.pt`), JSON de configuración, YAML de parámetros, `.npz` para trayectorias |

Parámetros de despliegue adicionales: `action_dim=20`, `ctrl_dt=0.02` (50 Hz), `action_scale=0.05`, `residual_clip=0.6`, `ema_alpha=0.5`. Tamaño total del repositorio: 0,3 GB.

## Arquitectura y entrenamiento

La política es una MLP determinista que actúa como media del actor dentro de un esquema actor-crítico entrenado con `rsl_rl`. La exportación ONNX incluye una capa `EmpiricalNormalization` seguida de la MLP del actor, de modo que el grafo es autocontenido y no requiere preprocesado externo de observaciones. El autor verifica una diferencia máxima absoluta inferior a `1e-4` frente a la implementación en PyTorch. El entrenamiento se realizó en MuJoCo con aleatorización de dominio activada, `cover_board=1`, `arm=follow` y `solref=(1.0, 2.0)`, sobre la tarea `WujiHand2_MarkerEraser_S3` y sus variantes de clip (`e`, `pfull2`, `efull2`).

Se documentan variantes entrenadas bajo condiciones de percepción adversas: `objcam_heavy` con sesgo de ±10 mm, jitter de 2,5 mm, latencia de 60–120 ms y ráfagas de hasta 3 s; y `objcam_blind` con pérdida permanente de percepción tras el agarre. Estas variantes mejoran la supervivencia en D2 de 0,645 a 0,855 y de 0,406 a 0,852 respectivamente (256 episodios). El paquete incluye además trayectorias de referencia en bucle abierto a 50 Hz en formato `.npz` (eraser stow de 8,5 s, pen half de 29 s, full episode de 39 s).

## Capacidades

- Control de manipulación diestra de 20 grados de libertad (Wuji Hand 2.2) sobre brazo Franka FR3 de 7 grados de libertad.
- Ejecución de la tarea `marker_eraser`: agarre, estiba del borrador y manipulación de rotulador.
- Inferencia determinista a 50 Hz sin dependencia de PyTorch (solo `numpy` + `onnxruntime`).
- Robustez frente a ruido perceptivo: sesgo, jitter, latencia y pérdida total de cámara de objeto tras el agarre.
- Reanudación de entrenamiento de RL con checkpoints completos (actor, crítico y optimizador).
- Reproducción de trayectorias de referencia en bucle abierto.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni visión general; sus entradas son observaciones proprioceptivas y perceptivas de dimensión 809 específicas de la tarea.

## Casos de uso

- Despliegue sim-to-real de manipulación diestra: usar `policy.onnx` con `onnxruntime` en un bucle de control a 50 Hz sobre el robot físico, sin instalar PyTorch, gracias al grafo autocontenido con normalización integrada.
- Investigación en robustez perceptiva: emplear `objcam_heavy` y `objcam_blind` como líneas base para estudiar degradación y recuperación ante latencia, sesgo y pérdida de cámara en tareas de agarre.
- Reentrenamiento y ajuste fino: cargar `model_*.pt` (42 MB con crítico y Adam) para reanudar el entrenamiento RL con las mismas `params/{agent,env}.yaml`.
- Evaluación comparativa de políticas: usar las métricas de supervivencia D0/D1/D2 con conos elíptico y piramidal como protocolo reproducible en MuJoCo.
- Validación de control en simulación: cargar `actor_only.pt` en el visor Viser para inspección rápida de políticas antes de desplegar.
- Reproducción de demostraciones: reproducir los clips `.npz` (`e`, `e2`, `eep`, `pfull2`, `efull2`) como referencias en bucle abierto para calibración o comparación.
- Integración en pipelines de CI para robótica: verificar que la exportación ONNX mantiene la tolerancia `< 1e-4` frente a PyTorch en cada iteración del modelo.

## Benchmarks y rendimiento

Evaluación en MuJoCo (`cover_board=1`, `arm=follow`, DR activado, `solref=(1.0, 2.0)`). Supervivencia de episodio a 1024 episodios (256 en las variantes de percepción):

| Política | Cono | D0 | D1 | D2 | Estado |
|---|---|---|---|---|---|
| `eraser_stow_pyr` | elíptico | 0,986 | 0,982 | 0,879 | Pasa D2 |
| `eraser_stow_pyr` | piramidal | 0,957 | 0,944 | 0,749 | Pasa D2 |
| `eraser_stow` | elíptico | 0,999 | 0,999 | 0,896 | Pasa D2 |
| `eraser_stow` | piramidal | 0,712 | 0,684 | 0,459 | Pasa D2 |
| `eraser_stow_objcam_heavy` | — | — | — | 0,855 (desde 0,645) | Pasa D2 (ruido perceptivo alto) |
| `eraser_stow_objcam_blind` | — | — | — | 0,852 (desde 0,406) | Pasa D2 (ciego en mano) |
| `pen_half` | elíptico | 0,691 | 0,694 | 0,652 | No pasa la puerta; calidad de escritura 0 |
| `full_episode` | elíptico | 0,556 | 0,512 | 0,123 | No pasa la puerta; calidad de escritura ~0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un modelo de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el grafo ONNX ocupa ~6 MB y la inferencia se ejecuta con `onnxruntime` en CPU, por lo que no requiere GPU dedicada.
- GPU recomendadas: no se especifican; cualquier GPU compatible con `onnxruntime` (CUDA o TensorRT) es suficiente. Para entrenamiento RL se requiere hardware más potente, no documentado.
- Cabe en cualquier GPU de consumo e incluso en CPU; el cuello de botella es la latencia del bucle de control a 50 Hz, no la memoria.
- Opciones de despliegue: `onnxruntime` (recomendado para sim-to-real sin PyTorch), PyTorch para carga del actor o reanudación de entrenamiento, MuJoCo para evaluación, Viser para visualización.
- Latencia y throughput: control a 50 Hz (`ctrl_dt=0.02`); no se publican cifras de latencia de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `antant` (kaiwen2) | Política RL para manipulación diestra | ~6 MB (actor) | `obs_dim=809`, 50 Hz | Apache 2.0 | Hugging Face |
| Políticas `rsl_rl` genéricas para locomoción | Política RL | no disponible | variable | variable | Repositorios de investigación |
| Políticas de manipulación con pinza paralela | Política RL | no disponible | variable | variable | Repositorios de investigación |

No se dispone de datos de benchmarks comparables con alternativas concretas en la información proporcionada; la comparación se limita a categoría y formato.

## Limitaciones y advertencias

- Modelo específico de tarea: no es un modelo de lenguaje ni un modelo generativo; solo ejecuta la tarea `marker_eraser` con el hardware Wuji Hand 2.2 + Franka FR3.
- Dependencia del hardware: el espacio de observación (`obs_dim=809`) y de acción (`action_dim=20`) está acoplado a esa configuración concreta de mano y brazo.
- Riesgo de fallo en transferencia sim-to-real: las métricas de supervivencia provienen de MuJoCo; no se documentan resultados en robot físico.
- Políticas no aprobadas: `pen_half` y `full_episode` no pasan la puerta de calidad (supervivencia D2 de 0,652 y 0,123; calidad de escritura nula o casi nula).
- Sin datos de sesgo, alucinación o multilingüismo aplicables, al no ser un modelo lingüístico.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia de los datos de entrenamiento antes de uso en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha; madurez y mantenimiento no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/kaiwen2/antant
- Repositorio de código referenciado: `policy-1124` (script `scripts/download_checkpoints.py`, tarea `src/wuji_mjlab/tasks/marker_eraser/`) — URL no disponible en la información proporcionada.
