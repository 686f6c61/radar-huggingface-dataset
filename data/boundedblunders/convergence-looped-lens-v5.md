# boundedblunders/convergence-looped-lens-v5

## Resumen

`boundedblunders/convergence-looped-lens-v5` no es un modelo de lenguaje generativo, sino un conjunto de pesos de *lentes* de interpretabilidad entrenados para el modelo `thinkingmachines/Inkling-2-Mini`, en el marco del Looped Lens Challenge. El artefacto principal es `lens_weights.safetensors` (6,00 MB, 38 tensores `fp16`), que implementa una especificación de lectura (*readout*) sobre 10 visitas de capa ascendentes en una única posición de token `t*`. El objetivo es proyectar activaciones intermedias al espacio de vocabulario para inspeccionar qué distribución de tokens "anticipa" el modelo en cada visita de su ejecución recurrente (*looped*).

La propuesta del equipo *convergence* (entrada número 5, `E5_E3Base_QMarkLinCtrl_s0`) combina tres piezas: lentes de tipo *logit lens* sin entrenamiento en las visitas tempranas, una lente afín de bajo rango con compuerta escalar para las visitas de la coda (`v43..v47`), y un selector de posición basado exclusivamente en activaciones que detecta el final de una pregunta en estados de plantilla de chat. La innovación central es que ni el selector ni la compuerta inspeccionan identificadores de token ni texto del prompt: operan solo sobre vectores de activación, lo que los hace robustos a cambios de tokenizador y reutilizables en otros modelos con la misma topología.

Es relevante ahora porque el campo de la interpretabilidad mecanicista demanda herramientas que funcionen sobre arquitecturas no estándar (capas recurrentes, ejecución *looped*) y que no dependan de etiquetas de respuesta. Este artefacto se entrena por autodestilación (KL contra la distribución cruda del propio modelo en `v47`) y se publica con licencia MIT, lo que facilita su reutilización en investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lentes de interpretabilidad (logit lens + lente afín de bajo rango) sobre `thinkingmachines/Inkling-2-Mini`; no es un modelo generativo |
| Parametros totales | 38 tensores `fp16` en 6,00 MB; desglose: 35 tensores / 5,99 MB (coda `v43..v47`) + 3 tensores / 9,4 KB (selector de posición) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base `Inkling-2-Mini`; la ventana de selección es de 14 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en `fp16`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`lens_weights.safetensors`) |

## Arquitectura y entrenamiento

El artefacto se compone de tres módulos. Primero, las visitas 1 a 5 (líneas 1-5 del *readout*) usan *raw logit lens* sin parámetros entrenados: se leen directamente `layers[12].input`, `layers[11].input`, `layers[18].mlp_input.output` y `layers[19].input` en la posición `t*`. Segundo, la coda `v43..v47` (líneas 6-10) aplica una lente afín residual de rango 128 sobre cada vector de activación `h`: `h_t = h + (h @ A^T) @ B^T + b`. Estos 35 tensores se entrenaron sin etiquetas de respuesta mediante autodestilación, minimizando la divergencia KL entre los logits mapeados de cada visita y la distribución cruda no embebida de `v47` del propio `Inkling-2-Mini` sobre prompts emparejados con respuesta iniciada. El resultado es bit-idéntico al de la versión v3 (`boundedblunders/convergence-looped-lens-v3`).

Tercero, la compuerta escalar `g(h) = 0.65 * sigmoid(w_g^T LayerNorm(h) + b_g)` mezcla logits crudos y mapeados como `logit_lens(h) + g(h) * (logit_lens(h_t) - logit_lens(h))`. La compuerta permanece cerca de 0 en texto plano y en estados de respuesta iniciada, preservando el *logit lens* puro, y se abre hasta 0,65 en estados de plantilla de chat. El selector de posición `QMark_Lin_ctrl_t75` (3 tensores, 9,4 KB) calcula la masa de probabilidad *logit lens* cruda de `v47` sobre los 60 identificadores de token de control especiales del modelo (IDs de vocabulario `199998..200057`). Si esa masa es ≤ 0,50 o la ventana final tiene menos de 3 tokens, las 10 líneas leen en la `read_position` dada. Si supera 0,50, una sonda lineal de 4.609 parámetros puntúa `[h_45[t], h_47[t]]` con RMS unitario en las posiciones de la ventana de 14 tokens anteriores a las 2 finales; si la probabilidad máxima supera 0,75, todas las líneas leen en `t* = argmax(p)`.

## Capacidades

- Lectura de activaciones intermedias en 10 visitas de capa ascendentes (12, 24, 35, 36, 42, 43, 44, 45, 46, 47) sobre una única posición de token `t*`.
- Proyección al espacio de vocabulario mediante *logit lens* crudo (visitas 1-5) y lente afín de rango 128 con compuerta escalar (visitas 6-10).
- Detección del final de una pregunta en estados de plantilla de chat exclusivamente a partir de activaciones, sin inspeccionar texto ni IDs de token.
- Reconocimiento de límites de turno de chat mediante la masa de tokens de control (`199998..200057`) en la distribución de `v47`.
- Mezcla adaptativa de logits crudos y mapeados según el estado de la activación (texto plano vs. plantilla de chat).
- Entrenamiento sin etiquetas de respuesta (autodestilación), lo que permite reutilizar el método sin anotaciones de tarea.
- No soporta generación de texto, *tool calling*, agentes, visión ni audio: es un artefacto de análisis, no un modelo de inferencia.

## Casos de uso

- Auditoría de circuitos en modelos *looped*: inspeccionar cómo evoluciona la distribución de tokens a lo largo de las 10 visitas permite identificar en qué punto de la ejecución recurrente el modelo "decide" el siguiente token, útil para estudiar mecanismos de convergencia interna.
- Detección de estados de plantilla de chat sin acceso al texto: el selector basado en activaciones permite clasificar si una activación corresponde a un turno de chat o a texto plano en pipelines donde el prompt no está disponible (por ejemplo, en *tracing* de inferencia distribuida).
- Investigación de robustez de tokenizador: al no depender de IDs de token ni de texto, el selector de posición puede transferirse a variantes del modelo base con tokenizadores distintos, facilitando estudios comparativos.
- Análisis de atención a tokens de control: la masa sobre los 60 tokens especiales (`199998..200057`) permite monitorizar cuándo el modelo se prepara para cerrar un turno, útil en sistemas de diálogo que necesitan anticipar el fin de una pregunta.
- Reproducción de experimentos de interpretabilidad: los pesos publicados (6,00 MB) y la especificación exacta de tensores permiten reproducir las 10 lecturas sobre `Inkling-2-Mini` sin reentrenar, reduciendo el coste de validación de hipótesis mecanicistas.
- Docencia y formación en interpretabilidad: el artefacto es pequeño, de licencia MIT y con una especificación de *readout* explícita, lo que lo hace adecuado como ejemplo práctico de *logit lens* y lentes afines en cursos de mecanicismo.
- Evaluación de métodos de autodestilación: la coda `v43..v47` sirve como referencia para comparar técnicas de entrenamiento sin etiquetas (KL contra `v47`) frente a métodos supervisados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de la lente ocupan 6,00 MB en `fp16`, por lo que el requisito dominante es el del modelo base `Inkling-2-Mini`, no disponible en la información proporcionada.
- GPU recomendadas: no disponible; depende del modelo base sobre el que se apliquen las lentes.
- Cabe en GPU de consumo: los pesos de la lente caben en cualquier GPU con al menos unos pocos MB libres; el modelo base determina el requisito real.
- Opciones de despliegue: carga directa de `lens_weights.safetensors` con `safetensors` o `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible; el coste computacional de la lente es despreciable frente a la inferencia del modelo base, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `boundedblunders/convergence-looped-lens-v5` | Lentes de interpretabilidad sobre `Inkling-2-Mini` | 38 tensores `fp16`, 6,00 MB | no disponible | MIT | Hugging Face |
| `boundedblunders/convergence-looped-lens-v3` | Versión previa de las lentes de coda | 35 tensores `fp16`, 5,99 MB | no disponible | MIT | Hugging Face |
| *Raw logit lens* (línea base) | Proyección sin entrenamiento | 0 parámetros | no disponible | no aplica | Implementación ad hoc |
| `thinkingmachines/Inkling-2-Mini` | Modelo base *looped* | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta *tool calling*, agentes ni razonamiento multi-paso. Su uso está restringido al análisis de activaciones del modelo base.
- La especificación de *readout* está acoplada a la topología exacta de `Inkling-2-Mini` (índices de capa 11-23, visitas 12-47, IDs de vocabulario `199998..200057`); no es portable sin reentrenamiento.
- El selector de posición solo se activa cuando la masa de tokens de control supera 0,50; en texto plano o respuestas iniciadas cae a la `read_position` dada, lo que puede producir lecturas en posiciones no óptimas.
- El umbral de la sonda lineal (0,75) y la ventana de 14 tokens son hiperparámetros fijados empíricamente; no se documenta su sensibilidad ni validación cruzada.
- La coda se entrena por autodestilación contra la distribución de `v47`, por lo que hereda los sesgos y errores de calibración del propio modelo base en esa visita.
- No se publican métricas de fidelidad, *sparsity* ni comparación cuantitativa con *logit lens* crudo; la calidad de las lecturas no está validada en la información disponible.
- Licencia MIT permite uso comercial del artefacto, pero el modelo base `Inkling-2-Mini` puede tener su propia licencia y restricciones, no especificadas aquí.
- Sin descargas ni *likes* en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/boundedblunders/convergence-looped-lens-v5
- Versión previa de la coda: https://huggingface.co/boundedblunders/convergence-looped-lens-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Looped Lens Challenge: https://ndif.us/looped-lens-challenge/
