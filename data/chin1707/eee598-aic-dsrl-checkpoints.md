# chin1707/eee598-aic-dsrl-checkpoints

## Resumen

`chin1707/eee598-aic-dsrl-checkpoints` es una colección de checkpoints de investigación publicada por Chinmay Prashanth como parte del proyecto académico EEE 598 AIC, centrado en inserción de cables mediante robótica. No se trata de un modelo de lenguaje generativo, sino de un conjunto de políticas de control entrenadas con aprendizaje por refuerzo (RL) sobre la base del modelo robótico X-VLA 0.9B, concretamente sobre el checkpoint `muhammad-ibraheem/xvla-aic-v4`, afinado completо sobre demostraciones CheatCode v4.

El repositorio contiene seis variantes de experimentos (recap v1 retrained, DSRL con recompensa original, DSRL con recompensa recomendada y DSRL con entropía del paper), cada una con varios seeds, junto con scripts de evaluación, configuración de placas y utilidades de análisis estadístico. El objetivo declarado es documentar los resultados detrás de la tabla final del proyecto, comparando cada política contra la base v4 mediante intervalos de confianza bootstrap pareados al 95% sobre 12 placas y 10.000 remuestreos.

Su relevancia es acotada: es material de reproducibilidad para un experimento concreto de robótica manipulativa, no un modelo de propósito general. El tamaño del repositorio (6,3 GB) corresponde a los pesos del agente ResidualSAC, buffers de replay y checkpoints de la política base, no a un transformer de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política X-VLA 0.9B (base) + agente ResidualSAC (actor, críticos, α) sobre acciones de flow-matching |
| Parametros totales | 0,9B en la política base X-VLA; tamaño del agente RL no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors, `agent.pt` (PyTorch), `buffer.npz` (replay buffer NumPy) |

## Arquitectura y entrenamiento

La base es X-VLA 0.9B, un modelo visión-lenguaje-acción afinado completо sobre demostraciones CheatCode v4 (`muhammad-ibraheem/xvla-aic-v4`). Sobre esta política congelada se entrena un agente ResidualSAC que produce una perturbación de la acción: la salida del actor (tanh de la media, en evaluación determinista con `AIC_RL_EVAL=1`) multiplicada por el bound de ruido (1,5) constituye el ruido inicial de 30×20 del flow-matching de v4. La entrada del actor incluye la estimación del puerto de cámara proporcionada por `muhammad-ibraheem/aic-port-detector`.

El entrenamiento de RL se realizó en tres configuraciones: DSRL con recompensa original (±1,5, 300 episodios en 15 rondas × 20 placas, seeds 30500–30514), DSRL con recompensa recomendada (`eval/RunRecReward.py`) y DSRL con la configuración de entropía del paper (target entropy −300, sin término α·log π en el objetivo del crítico). Además, se reentrenó la receta Recap v1 con etiquetas originales durante 20.000 pasos desde v4. Cada checkpoint DSRL incluye `agent.pt` (estado ResidualSAC: actor, críticos, α), `bound` (1,5) y `buffer.npz` (replay buffer, solo necesario para reanudar entrenamiento). El código de referencia está en `eee598-aic` @ e83ad59, archivo `policy/aic_smolvla/rl_agent.py`.

## Capacidades

- Control robótico de inserción de cables en simulación, con límites de 60 s, 6 cm/s, 0,4 rad/s y 30 N.
- Política de acciones basada en flow-matching con ruido inicial condicionado por la observación.
- Evaluación determinista del actor (tanh de la media) en modo `AIC_RL_EVAL=1`.
- Integración con un detector de puerto por cámara (`aic-port-detector`) como parte de la entrada del actor.
- Reanudación de entrenamiento RL mediante replay buffer persistido (`buffer.npz`).
- Evaluación estadística pareada con bootstrap (10.000 remuestreos) sobre 12 placas.
- No soporta tool calling, agentes multi-paso, generación de texto, código, matemáticas, visión general ni capacidades multilingües.

## Casos de uso

- Reproducción de resultados académicos: permite reejecutar la tabla final del proyecto EEE 598 AIC con los mismos 36 episodios por checkpoint y comparar contra la base v4 mediante los scripts `eval/run_eval.sh` y `eval/paired.py`.
- Investigación en RL residual sobre políticas VLA: sirve como punto de partida para estudiar cómo un agente ResidualSAC modula el ruido de flow-matching de una política congelada, con seeds y buffers incluidos.
- Análisis de funciones de recompensa en robótica: los tres conjuntos DSRL (recompensa original, recomendada y entropía del paper) permiten comparar el efecto de cada diseño de recompensa sobre la tasa de éxito y la precisión de puerto correcto.
- Validación de protocolos de evaluación: el repositorio incluye configuración de placas (`eval/eval_s100_n12.yaml`, sha256 `3c48355c…`) y scripts de validación de jobs (`eval/check_job.py`), útiles para montar pipelines de evaluación reproducibles.
- Estudio de estabilidad entre seeds: con seeds 0–5 en DSRL y 1–3 en Recap, se puede analizar la varianza de la política y su sensibilidad a la inicialización.
- Docencia en robótica y RL: material con límites físicos explícitos, métricas oficiales del scorer AIC y análisis estadístico documentado, adecuado para cursos de posgrado.
- Comparación de recetas de fine-tuning: el contraste entre Recap v1 retrained y las variantes DSRL permite evaluar si el RL residual aporta ventaja frente al reentrenamiento supervisado.

## Benchmarks y rendimiento

Los datos disponibles son tasas de éxito por seed sobre 36 episodios (12 placas × 3 ejecuciones) y diferencias pareadas frente a v4 con IC bootstrap al 95%.

| Experimento | Seeds (tasa de éxito) | Diferencia vs v4 [IC 95%] | Puerto correcto |
|---|---|---|---|
| Recap v1 retrained | 28,5 / 28,3 / 28,1 | −1,6 [−5,6; 2,2] (pooled) | 0/108 |
| DSRL recompensa original | 25,2 / 24,3 / 15,2 / 23,8 / 23,6 / 24,9 | −6,6 [−12,5; −0,6] (pooled) | 0/216 |
| DSRL recompensa recomendada | 29,0 / 28,8 / 32,3 / 29,6 / 24,8 / 27,6 | −2,2 [−6,2; 1,6] (pooled) | 8/216 |
| DSRL recompensa recomendada + entropía paper | 33,0 / 24,0 / 25,3 | −2,1 [−7,9; 4,4] (pooled) | 4/108 |

Ninguna variante supera de forma estadísticamente significativa a la base v4; la única diferencia con IC que excluye el cero es la de DSRL con recompensa original, que empeora el rendimiento (−6,6). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es lingüístico.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 6,3 GB e incluye pesos de la política X-VLA 0.9B, agentes RL y buffers de replay, por lo que la inferencia requiere cargar la política base de 0,9B más el agente.
- GPU recomendadas: no especificadas en la información disponible; por el tamaño de la política (0,9B) es plausible que quepa en GPUs de consumo con suficiente VRAM, pero no se confirma.
- Cabe en consumer GPU: no confirmado en la información proporcionada.
- Opciones de despliegue: scripts propios del repositorio (`eval/run_eval.sh`, `eval/check_job.py`, `eval/paired.py`) sobre el simulador AIC; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La evaluación se ejecuta con 3 simuladores en paralelo y límite de 60 s por episodio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chin1707/eee598-aic-dsrl-checkpoints` | 0,9B (base X-VLA) + agente RL | no aplica | Tasas de éxito 15,2–33,0 sobre 36 episodios; sin mejora significativa vs v4 | other | Hugging Face, 0 descargas |
| `muhammad-ibraheem/xvla-aic-v4` (base) | 0,9B | no aplica | Referencia de comparación en todos los batches | no disponible | Hugging Face |
| `muhammad-ibraheem/aic-port-detector` | no disponible | no aplica | Detector de puerto usado como entrada del actor | no disponible | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas VLA para inserción de cables) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas conversacionales; cualquier uso fuera del control robótico de inserción de cables carece de soporte.
- Los resultados no muestran mejora estadísticamente significativa frente a la base v4; la variante con recompensa original empeora de forma significativa (−6,6 puntos, IC [−12,5; −0,6]).
- La tasa de puerto correcto es muy baja en todas las variantes (0/108, 0/216, 8/216 y 4/108), lo que indica una limitación funcional importante en la tarea.
- La reproducibilidad es parcial: el simulador no es bit-reproducible, y la política base muestrea el ruido de flow-matching con el RNG por defecto de torch sin semilla fijada; solo los actores DSRL lo fijan de forma determinista desde la observación.
- La evaluación se limita a 12 placas del conjunto seed-100; no se usaron las placas de seed 101 ni las de entrenamiento, por lo que la generalización a otras configuraciones no está validada.
- Licencia "other": no se especifican términos de uso comercial; es necesario consultar el repositorio de código (`github.com/Chinmay-Prashanth/eee598-aic-dsrl`) y la licencia de la base X-VLA antes de cualquier uso productivo.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- El repositorio incluye buffers de replay (`buffer.npz`) que solo son necesarios para reanudar entrenamiento; no deben interpretarse como parte del modelo desplegable.
- Riesgo de alucinación y sesgos lingüísticos: no aplica en el sentido habitual, pero el detector de puerto por cámara puede introducir errores de percepción que condicionan la política.

## Enlaces

- Hugging Face: https://huggingface.co/chin1707/eee598-aic-dsrl-checkpoints
- Repositorio de código y resultados completos: https://github.com/Chinmay-Prashanth/eee598-aic-dsrl
- Documentación de estado: `docs/STATUS.md` (en el repositorio anterior)
- Respuesta del ledger: `docs/LEDGER_REPLY.md` (en el repositorio anterior)
- Resumen de métodos: `reward_analysis/results/summary_methods.csv` (en el repositorio anterior)
- Política base: https://huggingface.co/muhammad-ibraheem/xvla-aic-v4
- Detector de puerto: https://huggingface.co/muhammad-ibraheem/aic-port-detector
