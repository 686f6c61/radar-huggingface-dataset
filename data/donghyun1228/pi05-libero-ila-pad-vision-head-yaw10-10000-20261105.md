# Donghyun1228/pi05-libero-ila-pad-vision-head-yaw10-10000-20261105

## Resumen

π0.5 LIBERO yaw10 es un checkpoint de robótica derivado de π0.5 (openpi) que implementa una línea base de ILA (Invariance through Latent Alignment) sobre la cabeza de codificador visual PAD, aplicada al benchmark LIBERO. Lo publica el usuario Donghyun1228 como parte del repositorio `vla_adaptation`, con el objetivo de reproducir la fila ILA de la tabla LIBERO del artículo original de Yoneda et al. (RSS 2022). No es un modelo de lenguaje general, sino una política visomotora (VLA) entrenada para control robótico de manipulación.

El modelo parte de un checkpoint fuente (`pi05-libero-pad-img-source-ila-n50k-10000-20261105`, paso 9999) y aplica adaptación de dominio únicamente sobre el codificador visual PaliGemma/img, manteniendo congelados el cabezal IDM, el LLM y el experto de acciones. El entrenamiento combina un esquema adversarial WGAN sobre el latente de la cámara base con una pérdida de dinámica congelada, durante 10.000 actualizaciones con batch 32 y semilla 42.

Su relevancia es acotada pero específica: proporciona un punto de referencia reproducible (86,50% de éxito en LIBERO, 1730/2000 episodios) para investigaciones sobre adaptación de codificadores visuales en políticas VLA, con pesos, estado de entrenamiento y crítico WGAN incluidos. La licencia Apache 2.0 facilita su reutilización, aunque el modelo no está pensado para despliegue general fuera del entorno de evaluación LIBERO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi): torre visual PaliGemma/img + LLM + experto de acciones, con cabezal IDM y modelo de dinámica directa (PAD) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato nativo de openpi/JAX) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje natural documentada) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params`, `train_state` y `assets` (normalización) en el directorio `9999/`; crítico en `ila/critic_9999.npz`; política de evaluación en `policy/` |

## Arquitectura y entrenamiento

El modelo se construye sobre π0.5 en la implementación openpi. La política final combina una torre visual PaliGemma/img, un LLM y un experto de acciones, y en la etapa fuente incorpora además un cabezal IDM (inverse dynamics model) y un modelo de dinámica directa (forward dynamics) usados como señales de entrenamiento PAD. En esta variante, solo el codificador visual (`PaliGemma/img`) se adapta; el resto de componentes permanece congelado en el checkpoint fuente.

El procedimiento de adaptación ILA, por iteración, consta de: 5 actualizaciones del crítico WGAN (weight clip 0,01, RMSProp 1e-5) sobre el latente agrupado de la cámara base; un paso adversarial del codificador (RMSProp 1e-5); y un paso del codificador de dinámica (RMSProp 1e-6) sobre la pérdida del cabezal IDM congelado (excluyendo el índice de gripper 6) más el MSE del modelo de dinámica directa congelado. Se usan batch 32 y semilla 42, con 10.000 actualizaciones totales y guardado en los pasos 999 y 9999. El preset de entrenamiento es `pi05_libero_ila_img_yaw_adapt` con `--ila-config.encoder-optimizer rmsprop`, y el argv completo está en `run/spec.json`. La inicialización proviene del paso 9999 del checkpoint fuente, que incluye el buffer latente de origen (49.600 ventanas) y el modelo de dinámica directa preentrenado.

## Capacidades

- Control robótico de manipulación en el benchmark LIBERO (cuatro suites, 500 episodios por suite en la evaluación reportada).
- Percepción visual mediante torre PaliGemma/img adaptada al dominio objetivo, con uso de cámara base y cámara de muñeca.
- Predicción de acciones condicionada a observaciones visuales e instrucciones de tarea del entorno LIBERO.
- Adaptación de dominio del codificador visual mediante alineación latente adversarial (ILA) con crítico WGAN.
- Evaluación reproducible con semilla de entorno fija (env seed 7) y renderizado OSMesa sobre MuJoCo 3.2.3.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general, matemáticas ni procesamiento de audio.

## Casos de uso

- Reproducción de la línea base ILA en LIBERO: el checkpoint permite replicar la fila ILA de la tabla del artículo de Yoneda et al. (RSS 2022) usando la política de `policy/` y el entorno de evaluación documentado (MuJoCo 3.2.3, env seed 7), lo que facilita comparaciones controladas con otras variantes de adaptación.
- Investigación en adaptación de codificadores visuales: al adaptarse solo `PaliGemma/img`, sirve para aislar el efecto de la alineación latente sobre el rendimiento visomotor sin interferir con el LLM ni el experto de acciones.
- Estudio de entrenamiento adversarial WGAN en políticas VLA: el crítico guardado (`ila/critic_9999.npz`) y el estado de entrenamiento permiten analizar la dinámica del discriminador y reanudar experimentos.
- Comparación de checkpoints intermedios: los pasos 999 y 9999 permiten estudiar la evolución del rendimiento (86,25% frente a 86,50%) y el sobreajuste o la estabilización del codificador.
- Base para experimentos de adaptación de dominio en robótica: el preset `pi05_libero_ila_img_yaw_adapt` y el `run/spec.json` documentan la configuración completa, reutilizable para nuevas tareas con dominios visuales distintos.
- Evaluación de robustez frente a variaciones de cámara: la inclusión de yaw10 y el uso de la torre adaptada en la cámara de muñeca permiten probar la transferencia del codificador a vistas no vistas durante el entrenamiento fuente.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| LIBERO (4 suites, 500 episodios por suite, env seed 7) | Tasa de exito | 1730/2000 = 86,50% (paso 9999) |
| LIBERO (misma configuracion) | Tasa de exito | 1725/2000 = 86,25% (paso 1000) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo es una política robótica y no un modelo de lenguaje general.

## Requisitos de hardware

- La evaluación reportada se ejecutó en un evaluador `nvidia_h100` con renderizado OSMesa; no se especifica el número de GPU ni la VRAM exacta.
- VRAM estimada para inferencia: no disponible (depende del tamaño de π0.5, no documentado en la información proporcionada).
- GPU recomendadas: H100 para evaluación según la model card; no se documentan otras configuraciones.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: pesos en formato nativo de openpi (JAX); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO yaw10 (ILA, este modelo) | no disponible | no disponible | 86,50% (1730/2000) | Apache 2.0 | Hugging Face (Donghyun1228) |
| π0.5 LIBERO PAD img source ILA n50k | no disponible | no disponible | no disponible en la informacion | Apache 2.0 (presumible, no confirmado) | Hugging Face (Donghyun1228) |
| Otras variantes de adaptación en `vla_adaptation` | no disponible | no disponible | no disponible en la informacion | no disponible | Repositorio `Donghyun1228/vla_adaptation` |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en robótica LIBERO; no es un modelo de lenguaje general ni admite prompts de texto libre.
- El rendimiento reportado (86,50%) corresponde a una configuración de evaluación concreta (env seed 7, MuJoCo 3.2.3, OSMesa); variaciones del entorno pueden alterar los resultados.
- Solo se adapta el codificador visual; el resto de componentes queda congelado, lo que limita la mejora a la representación visual y no corrige sesgos del LLM o del experto de acciones.
- Riesgo de sobreajuste al dominio LIBERO: la adaptación se realizó sobre 49.600 ventanas latentes del checkpoint fuente, sin datos adicionales documentados.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas, al no ser un modelo de lenguaje.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de π0.5 y PaliGemma; deben verificarse las licencias de los componentes subyacentes antes de un despliegue comercial.
- Sin datos de latencia, throughput ni requisitos de VRAM, lo que dificulta planificar despliegues en producción.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ila-pad-vision-head-yaw10-10000-20261105
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105
- Repositorio de código: `Donghyun1228/vla_adaptation` (commit `1b67b86b`; documentación en `docs/naive_probe/ila_baseline_20261105.md`)
- Artículo ILA: Yoneda et al., "Invariance through Latent Alignment", RSS 2022 (referenciado en la model card; sin URL directa en la información disponible)
- openpi: no se proporciona URL en la información disponible
- π0.5: no se proporciona URL en la información disponible
