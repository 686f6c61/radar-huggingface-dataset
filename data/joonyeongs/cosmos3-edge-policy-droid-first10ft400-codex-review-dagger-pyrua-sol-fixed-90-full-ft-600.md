# joonyeongs/cosmos3-edge-policy-droid-first10ft400-codex-review-dagger-pyrua-sol-fixed-90-full-ft-600

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política (policy model) para robótica desarrollado por el usuario joonyeongs sobre la base nvidia/Cosmos3-Edge-Policy-DROID. Se trata de un fine-tuning completo del generador de Cosmos3 orientado a la manipulación robótica dentro del entorno RoboLab, entrenado con la receta DROID sobre el dataset `cosmos3-edge-first10ft400-codex-review-dagger-pyrua-sol-fixed-90`. El modelo predice secuencias de acciones (chunks de posiciones articulares de 32 pasos) a partir de observaciones visuales y de la instrucción de la tarea.

La relevancia de esta ficha es acotada: no es un modelo de lenguaje generalista, sino un artefacto experimental de investigación en políticas robóticas, con 3.859 millones de parámetros y un repositorio de 9,2 GB en formato safetensors. La model card documenta el proceso de entrenamiento con detalle (hardware, hiperparámetros, procedencia de datos) pero no reporta evaluación de éxito en bucle cerrado, por lo que su rendimiento real en tareas RoboLab está pendiente de validar.

Arquitectónicamente hereda la estructura de Cosmos3-Edge: una torre de generación (fine-tuneada aquí) y una torre de comprensión congelada que actúa como codificador de texto con K/V en caché. El modelo se sirve mediante el servidor de políticas del framework Cosmos para evaluación en RoboLab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (cosmos3_omni): torre de generacion + torre de comprension congelada; policy model para acciones roboticas |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de nvidia/Cosmos3-Edge-Policy-DROID y aplica un fine-tuning completo del lado generador, manteniendo congelada la torre de comprensión (que aporta K/V de texto en caché). El entrenamiento se realizó sobre el dataset `droid_plus_lerobot_640x360_20260412`, con muestreo uniforme de todas las ventanas de trayectoria completa (single pool), durante 600 pasos con batch global de 64 (2 GPUs × 32 × acumulación 1), learning rate de 2e-05 con warmup lineal de 30 pasos y decaimiento lineal hasta 0. Se emplearon 2× A100-80GB durante 4,4 horas y se guardaron checkpoints cada 250 pasos (el publicado es `iter_000000600`).

La receta de entrenamiento proviene de la rama `robolab-droid-train-edge-privileged-phases` del repositorio `joonyeongs/cosmos-framework` (commit de código `95bad15`). El pipeline incluye un hook de espera (`tools/wait_prepare_dataset.sh`) que sondea la disponibilidad del dataset cada 10 minutos hasta 24 horas y verifica el formato antes de entrenar. El repositorio mantiene exactamente la estructura del checkpoint base; solo difieren los shards de pesos del transformer. La procedencia y los hashes se documentan en `robolab_finetune.json`.

## Capacidades

- Predicción de acciones robóticas: genera chunks de 32 pasos de posiciones articulares a partir de observaciones e instrucción de tarea.
- Control de manipulador con pinza (gripper) de dos dedos; requiere el flip de pinza por defecto al servir.
- Integración con el servidor de políticas RoboLab (`action_policy_server_robolab`) con formato de prompt JSON y `guidance-interval 960 1001`.
- Condicionamiento por instrucción en lenguaje natural (tareas tipo "Put the lizard away in the bin").
- No dispone de capacidades de generación de texto general, tool calling, agentes ni multimodalidad conversacional; su función es exclusivamente política visuomotora.

## Casos de uso

- Evaluación de investigación en RoboLab: servir el checkpoint con `RobolabPolicyService` y medir éxito en bucle cerrado en tareas de manipulación, comparándolo con el checkpoint base.
- Manipulación de objetos cotidianos: tareas como depositar objetos en contenedores ("Put the canned food in the grey bin") usando el chunk de 32 acciones predicho.
- Apilado de bloques con orden especificado ("Stack the blocks in the order from bottom to top: red, blue, green, yellow"), aprovechando el condicionamiento por instrucción.
- Clasificación y recogida selectiva por color ("Put all the red things in the grey bin"), útil para estudiar el seguimiento de instrucciones en políticas visuomotoras.
- Base para nuevos fine-tunings con la receta DROID: el repositorio replica el layout del checkpoint base, por lo que sirve como punto de partida para experimentos de DAgger o recolección de datos adicional.
- Reproducción de experimentos: el detalle de hiperparámetros, hardware y código permite replicar el entrenamiento en 2× A100-80GB en aproximadamente 4,4 horas.
- Análisis de error de predicción de acciones: el chequeo de exportación con MAE sobre acciones demostradas permite diagnosticar desviaciones del modelo antes de lanzar evaluaciones costosas en bucle cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye únicamente un chequeo de exportación que compara chunks predichos de 32 pasos con las acciones demostradas (MAE en radianes), que no constituye una medida de éxito de tarea:

| Episodio | Frame | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0.0843 |
| 0 | 69 | Put the lizard away in the bin | 0.0377 |
| 25 | 0 | Put the canned food in the grey bin | 0.0585 |
| 25 | 60 | Put the canned food in the grey bin | 0.0437 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0.1707 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0.0919 |
| 75 | 0 | Put all the red things in the grey bin | 0.2422 |
| 75 | 225 | Put all the red things in the grey bin | 0.1534 |
| | | Media | 0.1103 |

El éxito en bucle cerrado en RoboLab no ha sido evaluado todavía según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.859 millones de parámetros en safetensors, los pesos en fp32 ocupan aproximadamente 15,4 GB y en bf16 unos 7,7 GB, a lo que hay que sumar el estado del servidor de políticas y las cachés de la torre de comprensión.
- GPU de entrenamiento documentadas: 2× A100-80GB (4,4 horas para 600 pasos con batch global 64).
- GPU recomendadas para servicio: no especificadas en la información disponible; por tamaño de pesos, una GPU con 24 GB o más (RTX 4090, L40S, A100) sería el mínimo razonable en bf16, aunque no está confirmado por el autor.
- Despliegue: servidor específico del framework Cosmos (`python -m cosmos_framework.scripts.action_policy_server_robolab --checkpoint-path <snapshot> --port 8000 --format-prompt-as-json True --guidance-interval 960 1001`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge-Policy-DROID (este modelo) | 3.859 M | no disponible | MAE medio 0.1103 en chequeo de exportación; sin evaluación de éxito en bucle cerrado | OpenMDW 1.1 | Hugging Face (joonyeongs) |
| joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400 (modelo base) | no disponible | no disponible | no disponible | OpenMDW 1.1 | Hugging Face (joonyeongs) |
| nvidia/Cosmos3-Edge-Policy-DROID (raíz de la cadena) | no disponible | no disponible | no disponible | OpenMDW 1.1 | Hugging Face (nvidia) |

No se dispone de datos de benchmarks comparativos entre estos checkpoints; la comparación se limita a la cadena de fine-tuning y a la licencia compartida.

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado en RoboLab; el único dato numérico es un MAE de predicción de acciones, que no mide éxito de tarea.
- El MAE es alto en tareas de apilado y recogida selectiva (0,1707 y 0,2422 rad en el primer frame), lo que sugiere desviaciones notables respecto a las acciones demostradas en esos episodios.
- El modelo está especializado en el dominio DROID/RoboLab y en el formato de observación del dataset de entrenamiento; no es transferible a otras morfologías o entornos sin nuevo fine-tuning.
- El dataset de entrenamiento puede no estar publicado todavía; la reproducibilidad depende de su disponibilidad y del hook de espera documentado.
- Requiere servir con el flip de pinza por defecto; pasar `--no-flip-gripper` produciría un control incorrecto.
- Licencia OpenMDW 1.1: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar tipo Apache 2.0.
- Riesgo de sobreajuste al conjunto de tareas y ventanas de trayectoria del dataset; sin evaluación externa no puede descartarse.
- No hay información sobre sesgos, idiomas ni robustez ante variaciones de iluminación o cámara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-first10ft400-codex-review-dagger-pyrua-sol-fixed-90-full-ft-600
- Modelo base (fine-tuning previo): https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400
- Modelo raíz: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
