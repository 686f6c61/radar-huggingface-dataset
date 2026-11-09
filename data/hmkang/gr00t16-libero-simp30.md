# hmkang/gr00t16-libero-simp30

## Resumen

GR00T16-libero-simp30 es un ajuste fino (fine-tuning) del modelo fundacional de robotica nvidia/GR00T-N1.6-3B, desarrollado por el usuario hmkang y publicado en Hugging Face. El modelo parte del checkpoint oficial d0814e7 del repositorio Isaac-GR00T (release n1.6.1) y se ha entrenado sobre el conjunto de datos hmkang/libero-simp30-gr00t, compuesto por 1.042 demostraciones humanas correspondientes a las 40 tareas de las suites LIBERO-spatial, LIBERO-object, LIBERO-goal y LIBERO-10.

El objetivo del ajuste es proporcionar un checkpoint de inferencia listo para usar en el benchmark LIBERO con la etiqueta de embodiment `LIBERO_PANDA`, comparando contra la variante d1-showharness-rl. El entrenamiento se realizo durante 30.000 pasos con batch global de 64 sobre 2 GPU H200, learning rate 1e-4 y un 5 % de warm-up.

Se trata de un modelo de politica visuomotora (vision-language-action, VLA) de 3.000 millones de parametros aproximados, orientado a control robotico simulado mas que a generacion de texto. El repositorio ocupa 6,6 GB e incluye unicamente los archivos de inferencia del checkpoint-30000, sin estado del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (GR00T N1.6), basada en nvidia/GR00T-N1.6-3B |
| Parametros totales | 3B (segun denominacion del modelo base GR00T-N1.6-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint-30000, solo inferencia) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base nvidia/GR00T-N1.6-3B, un modelo fundacional de robotica de tipo vision-language-action. El ajuste fino se realizo con el script `examples/finetune.sh` sin modificar del repositorio Isaac-GR00T (release n1.6.1, commit 5dc80c4), partiendo del checkpoint d0814e7ecb19202e7c8468b46098b0b7ef3a6d61.

Los datos de entrenamiento son el split de train del dataset hmkang/libero-simp30-gr00t (revision 1816103): 1.042 demostraciones humanas sobre las 40 tareas de LIBERO-spatial, LIBERO-object, LIBERO-goal y LIBERO-10, con 116 episodios reservados para validacion. Se excluye LIBERO-90. La configuracion de entrenamiento incluye 30.000 pasos, batch global de 64 (32 por GPU en 2x H200), learning rate 1e-4, warm-up del 5 %, weight decay 1e-5 y state dropout 0. La etiqueta de embodiment es `LIBERO_PANDA`, con `modality.json` tomado de `examples/LIBERO/modality.json`, horizonte de accion de 16 pasos y sin acciones relativas. Las estadisticas de normalizacion son propias del dataset (`statistics.json`), ya que el modelo base no incluye estadisticas para `libero_panda`.

## Capacidades

- Generacion de acciones motoras para un brazo robotico tipo Panda en entornos simulados LIBERO.
- Control visuomotor a partir de observaciones visuales e instrucciones de tarea en lenguaje natural.
- Ejecucion de tareas de manipulacion de las suites LIBERO-spatial, LIBERO-object, LIBERO-goal y LIBERO-10 (40 tareas en total).
- Prediccion de secuencias de acciones con horizonte de 16 pasos y ejecucion con `n_action_steps` configurable (8 en la evaluacion oficial).
- Integracion con el servidor de inferencia oficial `run_gr00t_server.py` mediante `--use-sim-policy-wrapper`.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni thinking mode; se trata de un modelo de politica robotica, no de un LLM conversacional.

## Casos de uso

- Evaluacion comparativa en el benchmark LIBERO: sirve como checkpoint de referencia para medir el efecto de un ajuste fino sobre 40 tareas frente a la variante d1-showharness-rl, usando el protocolo oficial de rollout.
- Reproduccion de experimentos de imitation learning: al estar entrenado con el script sin modificar de Isaac-GR00T, permite reproducir el pipeline completo de fine-tuning sobre LIBERO.
- Investigacion en politicas visuomotoras: util para estudiar el efecto de 30.000 pasos de entrenamiento, batch 64 y learning rate 1e-4 sobre un modelo base de 3B en tareas de manipulacion.
- Desarrollo de pipelines de simulacion robotica: se integra con el servidor `run_gr00t_server.py` y `rollout_policy.py` para ejecutar episodios de hasta 720 pasos en el simulador.
- Base para nuevos ajustes finos: el checkpoint puede servir como punto de partida para fine-tuning sobre subconjuntos de LIBERO u otros datasets con la etiqueta `LIBERO_PANDA`.
- Validacion de estadisticas de normalizacion: al incluir `statistics.json` propio del dataset, es util para probar flujos donde el modelo base carece de estadisticas para el embodiment.
- Benchmarking de hardware: con 6,6 GB de pesos, permite medir throughput de inferencia VLA en configuraciones de 1-2 GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluacion (`run_gr00t_server.py --model-path checkpoint-30000 --embodiment-tag LIBERO_PANDA --use-sim-policy-wrapper` y `rollout_policy.py --n_action_steps 8 --max_episode_steps 720`) y menciona una comparacion con d1-showharness-rl, pero no incluye cifras de exito por tarea ni tasas agregadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 6,6 GB de pesos en safetensors, una estimacion conservadora en FP16 ronda los 7-8 GB solo para pesos, mas memoria para activaciones y buffers del servidor de inferencia.
- GPU recomendadas: el autor entreno en 2x NVIDIA H200; para inferencia se puede usar una unica GPU de gama alta.
- Cabe en GPU consumer: previsiblemente si en tarjetas con 12-16 GB o mas (RTX 4080, RTX 4090, RTX 5090), aunque no hay confirmacion oficial.
- Opciones de despliegue: servidor oficial de Isaac-GR00T (`run_gr00t_server.py`) con `--use-sim-policy-wrapper`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hmkang/gr00t16-libero-simp30 | 3B (base) | no disponible | 30.000 pasos, 1.042 demos, 40 tareas LIBERO | no disponible | Hugging Face, 0 descargas |
| nvidia/GR00T-N1.6-3B | 3B | no disponible | modelo base fundacional | no disponible | Hugging Face (modelo base) |
| Variante d1-showharness-rl | no disponible | no disponible | referencia de comparacion citada por el autor | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros modelos VLA comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en el embodiment `LIBERO_PANDA` y en las 40 tareas de LIBERO-spatial/object/goal/10; no cubre LIBERO-90 ni otros robots.
- No es un modelo de lenguaje conversacional: no debe usarse para generacion de texto, codigo o matematicas.
- Solo incluye archivos de inferencia del checkpoint-30000; no contiene estado del optimizador, por lo que no permite reanudar el entrenamiento tal cual.
- Las estadisticas de normalizacion son propias del dataset de ajuste; usarlas con otros datos puede degradar el rendimiento.
- Licencia no especificada en la model card: es necesario verificar la licencia del modelo base nvidia/GR00T-N1.6-3B antes de cualquier uso comercial.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- No se han publicado metricas de exito en LIBERO, por lo que no es posible verificar la calidad del ajuste frente a la variante d1-showharness-rl.
- Riesgo de sobreajuste a las 1.042 demostraciones de entrenamiento y a las condiciones del simulador; la transferencia a robot real no esta documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmkang/gr00t16-libero-simp30
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/hmkang/libero-simp30-gr00t
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Benchmark LIBERO: no disponible en la informacion proporcionada.
