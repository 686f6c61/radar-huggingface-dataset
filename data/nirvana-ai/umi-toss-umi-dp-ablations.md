# Nirvana-AI/umi-toss-umi-dp-ablations

## Resumen

`Nirvana-AI/umi-toss-umi-dp-ablations` es un repositorio de checkpoints de políticas robóticas, no un modelo de lenguaje. Contiene nueve ejecuciones de UMI Diffusion Policy para la tarea de *tossing* del benchmark UMI, emparejadas por pasos: 88.860 pasos con batch 128, un cuarto del presupuesto de la ejecución principal. Cada carpeta incluye los pesos EMA del checkpoint seleccionado (`best_ema.ckpt`) y un sidecar JSON con metadatos de exportación.

El objetivo es estudiar ablaciones controladas sobre datos, muestreo y horizonte de acción. Las variantes cubren el conjunto completo de entrenamiento, muestreo centrado en *release*, episodios dinámicos, episodios de tenis, fracciones del 25 %, 50 % y 75 % de los episodios, y horizontes de acción H = 8 y H = 32. Las puntuaciones publicadas son validaciones offline en bucle abierto contra demostraciones humanas retenidas, con el preset `fast` y 7.166 anclajes.

Es relevante para investigación en robótica porque documenta una comparación reproducible de decisiones de entrenamiento con checkpoints verificados bit a bit, pero no constituye un modelo generalista ni una política validada en simulación o en un robot real. La licencia es MIT y el repositorio ocupa 5,76 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy para robótica, aplicada a UMI *tossing*; backbone exacto no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (política visuomotora, no modelo lingüístico) |
| Tipos de cuantización | no disponible; solo se distribuyen checkpoints `.ckpt` sin variantes cuantizadas documentadas |
| Idiomas soportados | no aplica (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.ckpt` con pesos EMA; sidecar `.json` por checkpoint |
| Tarea | *Tossing* con UMI (Universal Manipulation Interface) |
| Número de checkpoints | 9 |
| Tamaño por checkpoint | 0,64 GB |
| Tamaño total del repositorio | 5,76 GB |
| Validación | offline, bucle abierto, preset `fast`, 7.166 anclajes |

## Arquitectura y entrenamiento

El repositorio contiene políticas de difusión para manipulación robótica dentro del entorno UMI. La model card no especifica el backbone exacto, el número de parámetros, la composición completa del dataset ni el número total de tokens o muestras de entrenamiento. Lo que sí se documenta es el protocolo de ablación: nueve ejecuciones emparejadas por pasos, todas con 88.860 pasos y batch 128, lo que equivale a un cuarto del presupuesto de la ejecución principal del benchmark.

Las variables estudiadas son el subconjunto de datos, el esquema de muestreo y el horizonte de acción. Hay variantes con el *split* completo, muestreo centrado en *release*, solo episodios dinámicos, solo episodios de tenis y fracciones del 25 %, 50 % y 75 % de los episodios. También hay variantes con H = 8 y H = 32; el resto usa H = 16. La selección del checkpoint se hace con la métrica compuesta de validación sobre `all`, `dynamic` o `tennis`, según la ejecución. No se documenta RLHF, DPO ni entrenamiento por refuerzo; no es un modelo de lenguaje y no aplica ese tipo de ajuste.

La innovación principal es la trazabilidad experimental: los ficheros exportados son enlaces duros de los `best_ema.ckpt` evaluados, y la model card indica que los tensores EMA son bit-idénticos al checkpoint puntuado (`verify.tensors_bit_identical: true`, `predict_action_max_abs_diff: 0.0`). Cada exportación incluye ruta y SHA-256 del checkpoint fuente en el sidecar. Aun así, cada variante es una única ejecución con una sola semilla y sin intervalo de confianza.

## Capacidades

- Predicción de acciones para tareas de *tossing* en el entorno UMI, orientada a manipulación robótica.
- Variantes de horizonte de acción H = 8, H = 16 y H = 32; siete de los nueve checkpoints usan H = 16.
- Selección de checkpoint mediante pesos EMA y validación offline sobre subconjuntos `all`, `dynamic` o `tennis`.
- Carga de los checkpoints H = 16 mediante `policies/diffusion_policy/adapter.py`, con la copia parcheada de UMI en el `PYTHONPATH`.
- Carga de los checkpoints H = 8 y H = 32 mediante un adaptador específico (`training.ablations.dp_horizon_adapter:load`), ya que el adaptador principal los rechaza.
- Exportación verificable con `SHA256SUMS`, comprobación de hashes LFS y sidecars con SHA-256 del checkpoint fuente.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso lingüístico, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües.
- No es un modelo de propósito general: su alcance es el benchmark UMI *tossing* y las ablaciones descritas.

## Casos de uso

- Reproducción de la ablación de referencia: cargar `dp_ref/best_ema.ckpt` con el adaptador principal para disponer de la línea base completa, con muestreo uniforme y H = 16, y comparar cualquier cambio contra sus métricas de validación.
- Estudio del tamaño del dataset: comparar `dp_frac025`, `dp_frac050`, `dp_frac075` y `dp_ref` para analizar cómo cambia la validación al reducir episodios de entrenamiento del 100 % al 25 %, manteniendo el mismo número de pasos.
- Análisis de sesgo de muestreo: usar `dp_release`, `dp_dyn` y `dp_ten` para medir el efecto de centrar el entrenamiento en fases de *release*, episodios dinámicos o episodios de tenis, respectivamente.
- Evaluación del horizonte de acción: comparar `dp_h08` y `dp_h32` frente a las variantes H = 16, teniendo en cuenta que las puntuaciones de `dp_h08` usan solo 8 waypoints y no son directamente comparables con las de 16.
- Integración en un pipeline UMI: servir los checkpoints H = 16 con el adaptador del benchmark y los H = 8/32 con `python -m policies.serving --policy training.ablations.dp_horizon_adapter:load --checkpoint <fichero> --device cuda:0`.
- Validación previa a simulación: usar las puntuaciones offline en bucle abierto como *sanity check* antes de invertir tiempo en evaluación en simulador o en robot real, sabiendo que el modelo card indica que no se ejecutaron en ninguno de los dos.
- Auditoría de exportación: verificar `SHA256SUMS`, los sidecars y la igualdad bit a bit de los tensores EMA para asegurar que el checkpoint servido coincide con el evaluado.
- Docencia o reproducción interna de ablaciones: utilizar las nueve variantes como material de estudio sobre diseño experimental en políticas de difusión, siempre con la advertencia de una sola semilla por variante.

## Benchmarks y rendimiento

No hay benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje. Los únicos datos publicados son puntuaciones de validación offline del benchmark UMI *tossing*. Menor valor es mejor. La validación usa el preset `fast` y 7.166 anclajes.

| Carpeta | Cambio | Época / paso | Clave de selección | Compuesto `all` | Compuesto `dynamic` | Compuesto `tennis` |
|---|---|---:|---|---:|---:|---:|
| `dp_ref/` | referencia: *split* completo, muestreo uniforme | 28 / 85.897 | `all`: 0,2382 | 0,2382 | 0,2288 | 0,3121 |
| `dp_release/` | muestreo centrado en *release* | 28 / 85.897 | `all`: 0,2384 | 0,2384 | 0,2303 | 0,3055 |
| `dp_dyn/` | solo episodios de *tossing* dinámico | 26 / 79.973 | `dynamic`: 0,2317 | 0,6492 | 0,2317 | 4,0623 |
| `dp_ten/` | solo episodios de tenis | 16 / 50.353 | `tennis`: 0,3273 | 0,9680 | 1,0585 | 0,3273 |
| `dp_frac025/` | 25 % de los episodios de entrenamiento | 18 / 56.277 | `all`: 0,2802 | 0,2802 | 0,2679 | 0,3831 |
| `dp_frac050/` | 50 % de los episodios de entrenamiento | 24 / 74.049 | `all`: 0,2586 | 0,2586 | 0,2468 | 0,3529 |
| `dp_frac075/` | 75 % de los episodios de entrenamiento | 26 / 79.973 | `all`: 0,2436 | 0,2436 | 0,2335 | 0,3236 |
| `dp_h08/` | horizonte de acción H = 8 | 20 / 62.201 | `all`: 0,2677 | 0,2677 | 0,2583 | 0,3414 |
| `dp_h32/` | horizonte de acción H = 32 | 22 / 68.125 | `all`: 0,2517 | 0,2517 | 0,2423 | 0,3297 |

Nota sobre horizontes: `dp_h08` se puntúa sobre sus 8 waypoints (k ≤ 8, contra una línea base k ≤ 8), por lo que sus valores no son comparables con los de 16 waypoints. En los primeros 8 waypoints, `dp_ref` obtiene 0,2874, `dp_h08` 0,2677 y `dp_h32` 0,3124. `dp_h32` se puntúa sobre sus primeros 16 waypoints.

Cada variante es una única ejecución con una sola semilla y sin intervalo de confianza. La model card indica explícitamente que ninguna de estas diferencias está establecida como efecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Cada checkpoint ocupa 0,64 GB, pero el pico real depende del backbone, del preprocesamiento y del tamaño de batch, y no se documenta.
- GPU recomendadas: no disponibles. No se especifican modelos de GPU ni requisitos mínimos.
- ¿Cabe en GPU consumer? Los pesos de un checkpoint de 0,64 GB sugieren que son manejables en GPUs consumer, pero no hay una medición publicada de VRAM pico ni una validación en hardware concreto. Es una estimación no verificada, no un requisito oficial.
- Almacenamiento: 5,76 GB para el repositorio completo; 0,64 GB por checkpoint individual.
- Despliegue: carga con PyTorch y los adaptadores del benchmark UMI. Para H = 16, `policies/diffusion_policy/adapter.py`; para H = 8/32, `training.ablations.dp_horizon_adapter:load`. El comando de serving indicado es `python -m policies.serving --policy training.ablations.dp_horizon_adapter:load --checkpoint <fichero> --device cuda:0`.
- vLLM, TGI, Ollama y llama.cpp no aplican: no es un modelo de lenguaje ni un transformer generativo de texto.
- Latencia y throughput: no disponibles. No se han publicado mediciones en simulación ni en robot real.
- Verificación de integridad: `SHA256SUMS` permite comprobar los ficheros con `sha256sum -c SHA256SUMS`; no cubre el README ni el fichero de licencia.

## Comparativa con modelos similares

No se han proporcionado datos suficientes para una comparación cuantitativa con alternativas concretas. La propia model card menciona una ejecución principal de UMI Diffusion Policy, pero no incluye sus especificaciones, parámetros, licencia ni resultados completos. Tampoco se identifican en la información disponible otras *diffusion policies* comparables con parámetros y métricas verificables.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (9 ablaciones) | no disponible | no aplica | compuestos de validación entre 0,2317 y 0,9680 según subconjunto | MIT | HuggingFace |
| UMI Diffusion Policy, ejecución principal | no disponible | no aplica | no disponible | no disponible | referenciada, no incluida |
| Otras *diffusion policies* para manipulación | no disponible | no aplica | no disponible | no disponible | no identificadas en la información proporcionada |

La comparación directa con modelos de lenguaje no tiene sentido: este artefacto es una política robótica especializada, sin parámetros de contexto lingüístico ni benchmarks de razonamiento.

## Limitaciones y advertencias

- Una sola semilla por variante y ningún intervalo de confianza: las diferencias observadas no deben interpretarse como efectos establecidos.
- Validación exclusivamente offline y en bucle abierto contra demostraciones humanas retenidas; los checkpoints no se ejecutaron en simulación ni en robot real.
- Sesgo de selección: cada checkpoint se elige según una clave (`all`, `dynamic` o `tennis`), por lo que sus métricas no son estimaciones neutrales de rendimiento general.
- Los horizontes H = 8 y H = 16 no son directamente comparables: `dp_h08` se evalúa con k ≤ 8 y `dp_h32` con los primeros 16 waypoints.
- `dp_dyn` y `dp_ten` degradan mucho fuera de su subconjunto: por ejemplo, `dp_dyn` obtiene 4,0623 en `tennis` y `dp_ten` obtiene 1,0585 en `dynamic`.
- Especialización estrecha en UMI *tossing*: no hay evidencia de generalización a otras tareas de manipulación, objetos, sensores o entornos.
- No es un modelo lingüístico: no tiene capacidades multilingües, de generación de texto, código, matemáticas, visión general, audio ni agentes.
- Riesgo físico en producción: cualquier uso en un robot real requiere validación de seguridad, límites de par, paradas de emergencia y supervisión humana; el repositorio no certifica nada de esto.
- Licencia MIT, pero el código base UMI tiene copyright de Columbia Artificial Intelligence and Robotics Lab; conviene revisar las dependencias y av
