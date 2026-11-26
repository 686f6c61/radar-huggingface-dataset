# joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-plus-codex-review-dagger-90-full-ft-1k

## Resumen

Cosmos3-Edge-Policy-DROID `pyrua_sol_fixed_150_first10_plus_codex_review_dagger_90_edge_full_bs64_1k` es un ajuste fino completo del modelo de política robótica `nvidia/Cosmos3-Edge-Policy-DROID` publicado por el usuario `joonyeongs`. Se trata de un modelo de política visomotora (vision-language-action) derivado de la familia Cosmos3, entrenado para predecir secuencias de posiciones articulares a partir de observaciones visuales e instrucciones en lenguaje natural, en el contexto del benchmark RoboLab y del conjunto de datos DROID.

El modelo parte de la revisión `0110e64ca982589f1a3d856cbdd7d465dccb79bc` del checkpoint base de NVIDIA y aplica la receta de entrenamiento DROID de RoboLab con ajuste fino completo del generador (torre de comprensión congelada). El entrenamiento se realizó sobre una mezcla de dos conjuntos de datos propios del autor: los primeros 10 episodios por tarea del dataset `cosmos3-edge-pyrua-sol-fixed-150` (60 episodios en total) y un conjunto de datos aumentado mediante DAgger de 90 episodios.

Con 3.859.003.312 parámetros y un repositorio de 9,2 GB, el modelo se distribuye en formato safetensors con la misma estructura que el checkpoint base, difiriendo únicamente en los fragmentos de pesos del transformer. Es relevante como ejemplo de flujo de trabajo de ajuste fino de políticas robóticas de extremo a extremo sobre hardware asequible (2 GPU A100-80GB durante 6,8 horas) y como artefacto reproducible con procedencia documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos3 `cosmos3_omni` (modelo de política visomotora basado en transformer, con torre de comprensión y generador de acciones) |
| Parámetros totales | 3.859.003.312 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License 1.1 (heredada del modelo base) |
| Formato de pesos | safetensors |
| Modelo base | `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `0110e64ca982589f1a3d856cbdd7d465dccb79bc`) |
| Librería | `cosmos` |
| Tamaño del repositorio | 9,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cosmos3 en su variante `cosmos3_omni`, que combina una torre de comprensión (encoder de visión y lenguaje) con un generador que produce acciones. En este ajuste fino se congela la torre de comprensión y se entrenan todos los pesos del lado del generador (full fine-tuning), utilizando claves y valores de texto cacheados para evitar recalcular la torre congelada. La salida del modelo son fragmentos de 32 pasos de posiciones articulares (joint-position chunks) condicionados por las observaciones visuales y la instrucción de la tarea.

El entrenamiento se realizó con la receta RoboLab DROID: learning rate de 2e-05 con warmup lineal de 50 pasos y decaimiento lineal hasta 0, batch global de 64 (2 GPU × 32 × acumulación 1), 1000 actualizaciones y checkpoints cada 250 pasos. Los datos provienen de dos fuentes: los primeros 10 episodios por tarea del dataset `cosmos3-edge-pyrua-sol-fixed-150` (60 episodios) y un conjunto DAgger de 90 episodios (`cosmos3-edge-first10ft400-codex-review-dagger-pyrua-sol-fixed-90`), fusionados mediante `tools/merge_lerobot_v3.py` con ventanas de trayectoria completa muestreadas uniformemente. El entrenamiento se ejecutó en 2× A100-80GB durante 6,8 horas.

## Capacidades

- Predicción de acciones robóticas: genera fragmentos de 32 pasos de posiciones articulares a partir de observaciones visuales e instrucciones en lenguaje natural.
- Control visomotor de manipulación: entrenado para tareas como apilar bloques, colocar objetos en contenedores y recoger objetos específicos.
- Condicionamiento por instrucciones en lenguaje natural: las tareas se especifican mediante texto (por ejemplo, "Put the lizard away in the bin").
- Integración con RoboLab: se sirve mediante `cosmos_framework.scripts.action_policy_server_robolab` con formato de prompt JSON y un intervalo de guiado de 960-1001.
- Soporte de pinza (gripper): requiere el flip de pinza por defecto (no debe pasarse `--no-flip-gripper`).
- Tool calling / function calling: no disponible.
- Capacidades de agente multi-paso: no disponible como capacidad general; el modelo opera como política de control.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (la modalidad de entrada es visión e instrucción textual para control).

## Casos de uso

- Evaluación de políticas robóticas en RoboLab: el modelo se despliega como servidor de política (`action_policy_server_robolab`) en el puerto 8000 y se consulta con frames del entorno para generar acciones de control en bucle cerrado.
- Investigación en ajuste fino de políticas visomotoras: sirve como referencia reproducible de un flujo completo de full fine-tuning sobre un checkpoint Cosmos3-Edge, con hiperparámetros, hardware y procedencia documentados.
- Manipulación de objetos en entornos de laboratorio: entrenado para tareas concretas como apilar bloques en orden de color, colocar comida enlatada en un contenedor gris o recoger objetos rojos, adecuado para experimentos de pick-and-place.
- Aprendizaje por imitación con DAgger: el conjunto de datos aumentado con DAgger (90 episodios) permite estudiar cómo la corrección humana iterativa mejora la política frente al entrenamiento solo con demostraciones.
- Reproducción de experimentos con presupuesto limitado: el entrenamiento en 2× A100-80GB durante 6,8 horas demuestra que es viable ajustar una política de 3,86 mil millones de parámetros con recursos moderados.
- Análisis de error de predicción de acciones: la comprobación de exportación con MAE sobre posiciones articulares (media 0,0996 rad) permite comparar la fidelidad de la política frente a las acciones demostradas en distintos episodios y frames.
- Base para ajustes posteriores: al conservar el layout exacto del checkpoint base, puede servir como punto de partida para nuevos ajustes finos sobre otros conjuntos de datos DROID.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente una comprobación de exportación (no una evaluación de éxito de tarea) con error absoluto medio (MAE) en radianes entre las acciones predichas y las demostradas:

| Episodio | Frame | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,0592 |
| 0 | 69 | Put the lizard away in the bin | 0,0485 |
| 25 | 0 | Put the canned food in the grey bin | 0,0443 |
| 25 | 60 | Put the canned food in the grey bin | 0,0485 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,2073 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0515 |
| 75 | 0 | Put all the red things in the grey bin | 0,1989 |
| 75 | 225 | Put all the red things in the grey bin | 0,1385 |
| | | **Media** | **0,0996** |

El éxito en bucle cerrado en RoboLab no ha sido evaluado todavía según la model card.

## Requisitos de hardware

- Entrenamiento: 2× A100-80GB (6,8 horas para 1000 pasos con batch global 64).
- VRAM estimada para inferencia: no disponible en la información proporcionada; con 3,86 mil millones de parámetros en safetensors, el checkpoint completo ocupa aproximadamente 9,2 GB en el repositorio.
- GPU recomendadas: no disponible de forma explícita; el entrenamiento usó A100-80GB. No se documenta soporte en GPU de consumo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de política de RoboLab (`cosmos_framework.scripts.action_policy_server_robolab`) con `--checkpoint-path`, `--port 8000`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (`joonyeongs/cosmos3-edge-policy-droid-...-full-ft-1k`) | 3.859.003.312 | no disponible | OpenMDW 1.1 | Hugging Face |
| `nvidia/Cosmos3-Edge-Policy-DROID` (base) | no disponible | no disponible | OpenMDW 1.1 | Hugging Face |
| `joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400` (ajuste previo del mismo autor) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado en RoboLab; la única métrica disponible es el MAE de exportación, que no mide éxito de tarea.
- El MAE varía notablemente entre tareas: desde 0,0443 rad (colocar comida enlatada) hasta 0,2073 rad (apilar bloques), lo que sugiere mayor dificultad en tareas de apilado ordenado.
- El modelo está entrenado sobre un conjunto de datos muy reducido (60 episodios más 90 episodios DAgger), lo que limita su generalización a tareas y entornos no vistos.
- Es un modelo de política específico para RoboLab/DROID; no es un modelo de lenguaje general y no debe esperarse de él razonamiento textual, código ni matemáticas.
- Requiere servir con el flip de pinza por defecto; pasar `--no-flip-gripper` produciría acciones incorrectas.
- La licencia OpenMDW 1.1 es la del modelo base; deben revisarse sus términos para uso comercial.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación en el contexto de política robótica; la información disponible no cubre estos aspectos.
- El segundo conjunto de datos (DAgger) puede no estar subido aún; el proceso de entrenamiento espera su disponibilidad mediante un hook, lo que afecta a la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-plus-codex-review-dagger-90-full-ft-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases (rama `robolab-droid-train-edge-privileged-phases`, commit `95bad15`)
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Dataset de demostraciones: https://huggingface.co/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150
- Dataset DAgger: https://huggingface.co/joonyeongs/cosmos3-edge-first10ft400-codex-review-dagger-pyrua-sol-fixed-90
- Ajuste previo del mismo autor: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400
