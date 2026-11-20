# joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-layout-seed0-150-full-ft-1k

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política (policy model) para robótica desarrollado originalmente por NVIDIA, diseñado para traducir observaciones visuales y consignas en lenguaje natural en secuencias de acciones motoras de bajo nivel. Este repositorio concreto es un ajuste fino (fine-tuning) completo del generador realizado por el usuario joonyeongs sobre el checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID`, empleando la receta RoboLab DROID sobre un conjunto reducido de 150 episodios de manipulación robótica. El modelo resultante conserva la arquitectura Cosmos3 de tipo omni (comprensión visual-lenguaje más generación de acciones) y un total de aproximadamente 3.859 millones de parámetros.

El interés de esta ficha reside en que documenta un experimento de adaptación de bajo coste: 1.000 pasos de entrenamiento sobre 2 GPU A100-80GB durante 6,7 horas, con un batch global de 64 y un learning rate de 2e-5. El modelo está orientado a la evaluación en el entorno RoboLab mediante un servidor de políticas dedicado, y predice fragmentos de 32 pasos de posiciones articulares. No se trata de un modelo de lenguaje generalista, sino de un componente de control para brazos robóticos en tareas de pick-and-place, apilado y clasificación de objetos.

La relevancia actual es la del ecosistema Cosmos3 para robótica: modelos fundacionales de política que se pueden ajustar con pocos datos y desplegar como servicio, lo que reduce la barrera para experimentar con manipulación robótica en entornos simulados y reales. Al ser un ajuste fino derivado, su valor depende del checkpoint base y de la receta de entrenamiento, no de una evaluación de éxito en bucle cerrado, que el autor declara explícitamente como no realizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos3 (modelo omni de comprensión visual-lenguaje y generación de acciones; transformer con torre de comprensión congelada y generador ajustado) |
| Parámetros totales | 3.859.003.312 (~3,86 mil millones) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (consignas en inglés en los episodios de entrenamiento) |
| Licencia | OpenMDW License 1.1 (heredada del modelo base) |
| Formato de pesos | safetensors (repo de 9,2 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cosmos3, un modelo omni que combina una torre de comprensión (entrada visual y textual) con un generador de acciones. En este ajuste fino se congela la torre de comprensión, cuyas claves y valores de texto se cachean, y se entrenan todos los pesos del generador (full fine-tuning del lado generador). La salida son fragmentos de 32 pasos de posiciones articulares (joint-position chunks), típicos de los modelos de política para control robótico.

El entrenamiento se realizó con la receta RoboLab DROID sobre el conjunto `joonyeongs/cosmos3-edge-pyrua-sol-layout-seed0-150`, compuesto por 150 episodios exitosos de PyRUA-Lean (GPT-6.2 Sol, medium), 25 por cada una de seis tareas, con disposiciones de objetos aleatorizadas por ensayo (semilla de layout 0) y todas las ventanas de trayectoria completa. Se usaron 2 GPU A100-80GB, batch global 64 (2 × 32 × acumulación 1), learning rate 2e-5 con calentamiento lineal de 50 pasos y decaimiento lineal a 0, durante 1.000 actualizaciones (6,7 horas). Los checkpoints se guardan cada 250 pasos; el publicado corresponde a `iter_000001000`. No se reporta uso de RLHF o DPO.

## Capacidades

- Predicción de acciones motoras: genera fragmentos de 32 pasos de posiciones articulares a partir de observaciones visuales y una consigna en lenguaje natural.
- Comprensión visual-lenguaje: heredada de la torre de comprensión de Cosmos3, congelada durante el ajuste fino.
- Control de brazo robótico con pinza: incluye lógica de inversión de pinza (gripper flip) que debe mantenerse por defecto en el despliegue.
- Ejecución de tareas de manipulación específicas del conjunto DROID: recoger objetos, apilar bloques por color y orden, clasificar objetos por color en contenedores.
- Servicio como política remota: se expone mediante `action_policy_server_robolab` para evaluación en RoboLab.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni modalidades de audio.

## Casos de uso

- Evaluación de manipulación en RoboLab: el modelo se sirve con `action_policy_server_robolab` en el puerto 8000 y se consulta con el formato de prompt JSON y el intervalo de guiado 960-1001, lo que permite medir el comportamiento en bucle cerrado de tareas como apilar bloques o clasificar objetos.
- Clasificación de objetos por color: las tareas del conjunto de entrenamiento incluyen "poner todas las cosas rojas en el contenedor gris", de modo que el modelo puede reutilizarse para variantes de esa tarea con disposiciones aleatorizadas.
- Apilado ordenado de bloques: la tarea de apilar rojo, azul, verde y amarillo de abajo arriba es directamente abordable, y el modelo predice las posiciones articulares necesarias para cada colocación.
- Recogida y depósito de objetos pequeños: la tarea de guardar el lagarto en el contenedor y la de guardar la comida enlatada en el contenedor gris son escenarios de pick-and-place que el modelo ha visto durante el ajuste.
- Punto de partida para ajustes finos posteriores: al conservar el layout exacto del checkpoint base y diferir solo en los shards del transformer, sirve como inicialización para nuevas recetas RoboLab con otros conjuntos de datos o tareas.
- Verificación de exportación de checkpoints: el autor usa el modelo para comparar las acciones predichas con las demostradas (MAE en radianes), lo que lo convierte en una herramienta de validación de pipelines de entrenamiento y exportación.
- Investigación sobre generalización con pocos datos: con solo 150 episodios y 1.000 pasos, es un caso de estudio de adaptación de bajo coste de un modelo fundacional de política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito de tarea en la información disponible. El autor incluye únicamente una comprobación de exportación (no una evaluación de política) que compara las acciones predichas de 32 pasos con las demostradas, en radianes:

| Episodio | Fotograma | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Guardar el lagarto en el contenedor | 0,1013 |
| 0 | 69 | Guardar el lagarto en el contenedor | 0,0825 |
| 25 | 0 | Guardar la comida enlatada en el contenedor gris | 0,0775 |
| 25 | 60 | Guardar la comida enlatada en el contenedor gris | 0,0569 |
| 50 | 0 | Apilar bloques: rojo, azul, verde, amarillo | 0,0740 |
| 50 | 292 | Apilar bloques: rojo, azul, verde, amarillo | 0,0647 |
| 75 | 0 | Poner todas las cosas rojas en el contenedor gris | 0,1913 |
| 75 | 225 | Poner todas las cosas rojas en el contenedor gris | 0,1388 |
| | | **Media** | **0,0984** |

El propio autor indica que el éxito en bucle cerrado de RoboLab no se ha evaluado todavía.

## Requisitos de hardware

- Entrenamiento: 2 GPU A100-80GB, 6,7 horas para 1.000 pasos con batch global 64.
- Inferencia: el repo ocupa 9,2 GB en safetensors; con pesos en precisión completa (fp32) se necesitan aproximadamente 15,4 GB de VRAM solo para pesos, más memoria para activaciones y caché. En bf16/fp16 el peso ronda los 7,7 GB, por lo que cabría en GPU consumer de 12-16 GB o superiores (RTX 4080, 4090, etc.), aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100-80GB o H100 para servir con holgura; RTX 4090 (24 GB) como opción consumer razonable en bf16.
- Despliegue: servidor de políticas `cosmos_framework.scripts.action_policy_server_robolab` con `--checkpoint-path`, `--port 8000`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.
- Nota de despliegue: servir con la inversión de pinza por defecto; no pasar `--no-flip-gripper`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-layout-seed0-150-full-ft-1k | ~3,86 mil millones | no disponible | Política robótica (ajuste fino de Cosmos3-Edge-Policy-DROID) | OpenMDW 1.1 | Hugging Face, 0 descargas |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible en la información | no disponible | Política robótica Cosmos3 | OpenMDW 1.1 | Hugging Face (NVIDIA) |
| Otros modelos de política robótica (p. ej. RT-2, OpenVLA) | no disponible en la información | no disponible | Política visión-lenguaje-acción | no disponible | no disponible |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; solo se conoce el modelo base del que deriva.

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado en RoboLab; la única métrica publicada es un MAE de exportación (0,0984 rad de media), que no mide éxito de tarea.
- El ajuste fino se hizo con solo 150 episodios y 1.000 pasos, por lo que la generalización a tareas, objetos o disposiciones no vistas es incierta.
- El MAE es notablemente peor en la tarea "poner todas las cosas rojas en el contenedor gris" (0,1913 y 0,1388 rad) que en el resto, lo que sugiere un ajuste desigual entre tareas.
- Los idiomas soportados no están documentados; las consignas de entrenamiento están en inglés y no hay evidencia de soporte multilingüe.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un modelo de acción, el riesgo se traduce en acciones incorrectas o inseguras en entornos físicos.
- Licencia OpenMDW 1.1: es necesario revisar sus términos para uso comercial; no se garantiza que permita todos los usos.
- Dependencia del checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `0110e64ca982589f1a3d856cbdd7d465dccb79bc`) y de la rama de código `robolab-droid-train-edge-privileged-phases` del repositorio `joonyeongs/cosmos-framework` (commit de entrenamiento `95bad15`).
- El repositorio tiene 0 descargas y 0 likes, y fue subido automáticamente al final del entrenamiento; no hay señales de validación comunitaria.
- Requiere servir con la inversión de pinza por defecto; pasar `--no-flip-gripper` produciría un comportamiento incorrecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-layout-seed0-150-full-ft-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Conjunto de datos de ajuste fino: https://huggingface.co/joonyeongs/cosmos3-edge-pyrua-sol-layout-seed0-150
- Conjunto de datos de verificación: https://huggingface.co/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
