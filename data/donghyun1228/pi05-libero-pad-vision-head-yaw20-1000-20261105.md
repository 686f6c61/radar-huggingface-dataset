# Donghyun1228/pi05-libero-pad-vision-head-yaw20-1000-20261105

## Resumen

π0.5 LIBERO yaw20 PAD es un checkpoint de adaptación de dominio para el modelo de visión-lenguaje-acción (VLA) π0.5 de Physical Intelligence, publicado por el usuario Donghyun1228 en el marco del repositorio `vla_adaptation` y del ecosistema openpi. El modelo parte de un checkpoint fuente ya adaptado (`pi05-libero-pad-vision-head-source-n50k-10000`) y aplica un ajuste fino adicional orientado exclusivamente al codificador visual PaliGemma, entrenado con una pérdida de modelado inverso de dinámica (IDM) sobre una sonda de orientación yaw de 20 grados con 50.000 muestras.

El propósito del artefacto es servir como fila "PAD" (probablemente *probe-augmented domain adaptation* o similar) en la tabla de resultados del benchmark LIBERO de un artículo científico, comparando la adaptación del codificador visual frente a otras estrategias. El entrenamiento afecta solo al tower de visión; el cabezal IDM, el LLM y el experto de acción permanecen congelados en el estado del modelo fuente. La política exportada (`policy/`) descarta el cabezal IDM y usa el tower visual adaptado para la cámara de muñeca.

El checkpoint tiene un tamaño de repositorio de 12,9 GB, se distribuye bajo licencia Apache 2.0 y alcanza un 50,45 % de éxito en LIBERO (1009 de 2000 episodios) con el evaluador congelado `kn_b200`. Es un artefacto de investigación en robótica, no un modelo de propósito general, y su relevancia radica en documentar el efecto de la adaptación visual selectiva en tareas de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5: codificador visual PaliGemma, LLM y experto de acción |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene `params`, `train_state` y `assets` en `999/`, y `policy/` con `export.json`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura π0.5 de openpi, compuesta por un codificador visual PaliGemma (`PaliGemma/img`), un LLM y un experto de acción que genera comandos motores. En este checkpoint concreto, solo el codificador visual se adapta mediante una pérdida IDM aplicada a una sonda de soporte yaw20 con 50.000 muestras, excluyendo el índice de pinza 6 del cálculo de la pérdida. El resto de componentes (cabezal IDM, LLM y experto de acción) permanece congelado en el estado del checkpoint fuente `pi05-libero-pad-vision-head-source-n50k-10000` (paso 9999).

El procedimiento de entrenamiento usa AdamW con LR pico de 5e-5 (500 pasos de warmup y luego constante), tamaño de lote 32, 1.000 actualizaciones y semilla 42. La inicialización proviene del checkpoint fuente mencionado, y el código de referencia es `Donghyun1228/vla_adaptation` (commit `7b74d01d`), con el preset `pi05_libero_pad_img_yaw_adapt` y la configuración completa en `run/spec.json`. La política de evaluación (`policy/`) corresponde al paso 999 sin el cabezal IDM, y la cámara de muñeca utiliza el tower visual adaptado según `export.json`.

## Capacidades

- Control robótico de manipulación en entornos LIBERO: genera acciones motoras a partir de observaciones visuales y consignas de tarea.
- Adaptación de dominio del codificador visual mediante pérdida IDM sobre sonda yaw20.
- Evaluación estandarizada con el evaluador congelado `kn_b200` y MuJoCo 3.2.3.
- Inferencia como política exportada sin cabezal IDM (solo tower visual adaptado).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo en la información disponible.

## Casos de uso

- Evaluación comparativa en LIBERO: usar la política exportada (`policy/`) para reproducir la fila PAD de la tabla del artículo y comparar el 50,45 % de éxito con otras estrategias de adaptación sobre el mismo benchmark.
- Investigación en adaptación visual selectiva: analizar el efecto de adaptar únicamente el codificador PaliGemma con pérdida IDM frente a ajustar el LLM o el experto de acción, usando el checkpoint fuente como línea base.
- Reproducción de experimentos: ejecutar el preset `pi05_libero_pad_img_yaw_adapt` con la configuración `run/spec.json` y la semilla 42 para validar la reproducibilidad del resultado 1009/2000.
- Estudio de robustez a orientación: emplear la sonda yaw20 para medir cómo la adaptación visual mejora la política ante variaciones de orientación de la muñeca.
- Base para nuevas adaptaciones: partir de este checkpoint (paso 999) como inicialización para experimentos posteriores de ajuste fino en otros dominios o tareas de LIBERO.
- Auditoría de evaluación: usar `run/evaluation_audit.json` para verificar los recuentos por suite (500 episodios por suite, semilla de entorno 7) y validar la metodología del evaluador congelado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| LIBERO (éxito global) | 1009/2000 = 50,45 % | 500 episodios por suite, semilla de entorno 7, evaluador congelado `kn_b200`, MuJoCo 3.2.3 |

No se han publicado resultados desglosados por suite en la información disponible; el desglose se encuentra en `run/evaluation_audit.json` según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 12,9 GB, lo que da una cota inferior orientativa del estado de pesos, pero no se documenta el consumo en ejecución).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el ecosistema de referencia es openpi).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO yaw20 PAD (este) | no disponible | no disponible | 50,45 % (1009/2000) | Apache 2.0 | HuggingFace |
| π0.5 LIBERO PAD vision-head source n50k (checkpoint fuente) | no disponible | no disponible | no disponible | Apache 2.0 (presumible) | HuggingFace (`Donghyun1228/pi05-libero-pad-vision-head-source-n50k-10000-20261104`) |
| Otras filas de la tabla LIBERO del artículo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: diseñado para reproducir una fila concreta de un artículo, no para despliegue en producción general.
- Solo se adapta el codificador visual; el LLM y el experto de acción heredan el comportamiento del checkpoint fuente, con posibles sesgos no documentados.
- Rendimiento de éxito del 50,45 % en LIBERO: aproximadamente la mitad de los episodios fallan, lo que limita su uso directo en aplicaciones reales.
- Evaluación realizada en simulación (MuJoCo 3.2.3) con el evaluador congelado `kn_b200`; no hay evidencia de transferencia a robots físicos.
- Sin datos de sesgos, alucinación, limitaciones de idioma ni latencia; no se documentan.
- Licencia Apache 2.0 permite uso comercial, pero el modelo fuente y el ecosistema openpi pueden tener condiciones adicionales no detalladas aquí.
- El repositorio incluye `train_state` y `assets` de normalización; su uso requiere respetar la configuración de normalización original para reproducir resultados.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-yaw20-1000-20261105
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-source-n50k-10000-20261104
- Código de referencia: `Donghyun1228/vla_adaptation` (commit `7b74d01d`), preset `pi05_libero_pad_img_yaw_adapt`, configuración en `run/spec.json`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
