# joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-plus-r2-full-ft-2k

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política (policy model) para control robótico desarrollado por NVIDIA, y esta ficha concreta es un ajuste fino completo del checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID` realizado por el usuario joonyeongs. El modelo resuelve el problema de generar trayectorias de acciones motoras (chunks de posiciones articulares) a partir de observaciones visuales y una instrucción de tarea en lenguaje natural, dentro del entorno de evaluación RoboLab sobre el conjunto de datos DROID.

El ajuste se ha realizado con la receta RoboLab DROID mediante fine-tuning completo de la torre generadora (todos los pesos del generador, con la torre de comprensión congelada y caché de K/V de texto) durante 2.000 pasos sobre 2 GPUs A100-80GB, con un batch global de 64 y una tasa de aprendizaje de 2e-05. El resultado es un checkpoint de aproximadamente 3.860 millones de parámetros en formato safetensors, con un repositorio de 9,2 GB.

Es relevante porque forma parte del ecosistema Cosmos de NVIDIA para robótica basada en modelos generativos: en lugar de entrenar un modelo desde cero, se especializa un modelo fundacional en una tarea concreta (manipulación con el robot DROID) mediante recetas reproducibles. La licencia OpenMDW 1.1 permite uso abierto, aunque con condiciones que conviene revisar. No se han publicado resultados de éxito en tareas de evaluación cerrada (closed-loop), solo una comprobación de exportación con error absoluto medio de 0,0700 rad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de política generativo basado en Cosmos3 (familia `cosmos3_omni`), con torre generadora y torre de comprensión |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés en los datos DROID) |
| Licencia | OpenMDW License 1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la familia Cosmos3 de NVIDIA, etiquetada en el repositorio como `cosmos3_omni`, que combina una torre generadora (la que produce las acciones) con una torre de comprensión (que procesa las instrucciones de texto). En este ajuste fino se entrenan todos los pesos del lado generador, mientras que la torre de comprensión permanece congelada y se utilizan las claves y valores de atención de texto en caché. El repositorio mantiene exactamente la estructura del checkpoint base; solo difieren los shards de pesos del transformer.

El entrenamiento se realizó con la receta RoboLab DROID sobre la unión de dos conjuntos de datos (`cosmos3-edge-pyrua-sol-fixed-150` y `cosmos3-edge-pyrua-sol-fixed-150-r2`), que suman 50 episodios repartidos en 6 tareas, con todas las ventanas de trayectoria completa muestreadas de forma uniforme. Se usaron 2 GPUs A100-80GB durante 14,1 horas, batch global de 64 (2 GPUs × 32 × acumulación 1), 2.000 actualizaciones con 100 pasos de calentamiento lineal y decaimiento lineal hasta cero, guardando checkpoints cada 250 pasos. El código de entrenamiento está disponible en la rama `robolab-droid-train-edge-privileged-phases` del repositorio `joonyeongs/cosmos-framework`. No se documenta el uso de RLHF ni DPO; el ajuste es supervisado sobre demostraciones.

## Capacidades

- Generación de chunks de 32 pasos de posiciones articulares (joint positions) a partir de observaciones visuales y una instrucción de tarea en lenguaje natural.
- Control robótico de manipulación en el entorno DROID (recogida de objetos, apilado, clasificación por color).
- Procesamiento de instrucciones textuales de tarea mediante la torre de comprensión con caché de K/V.
- Servicio como política remota mediante `RobolabPolicyService` y el script `action_policy_server_robolab`.
- Soporte de inferencia con guiado (guidance interval 960-1001) y formato de prompt en JSON.
- Capacidad de reanudar el ajuste fino sobre el checkpoint base (compatible con la receta RoboLab).
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica con el robot DROID en laboratorio: el modelo genera trayectorias de 32 pasos de posiciones articulares que se envían al controlador del robot para tareas como "guardar el lagarto en la papelera" o "apilar los bloques en orden de color". Es adecuado porque está ajustado específicamente sobre demostraciones DROID de estas tareas.
- Evaluación de recetas de ajuste fino en RoboLab: sirve como referencia reproducible para comparar hiperparámetros (lr, batch, pasos) en el pipeline de entrenamiento de políticas con Cosmos3-Edge.
- Servicio de política remota para pruebas de integración: mediante `action_policy_server_robolab` en el puerto 8000, se puede conectar un cliente de evaluación RoboLab al checkpoint y validar el pipeline de inferencia antes de un despliegue real.
- Investigación en modelos generativos aplicados a robótica: permite estudiar cómo un modelo fundacional Cosmos3 se especializa en un dominio concreto (DROID) con fine-tuning completo del generador y congelación de la torre de comprensión.
- Prototipado de tareas de clasificación y ordenación de objetos: las tareas de "poner todos los objetos rojos en la papelera gris" o "apilar bloques rojo, azul, verde, amarillo" son ejemplos directos de habilidades que el modelo ha visto en entrenamiento y puede replicar en entornos similares.
- Base para ajustes posteriores en otros conjuntos de datos: al mantener la estructura del checkpoint base, el modelo se puede usar como punto de partida para nuevas rondas de fine-tuning con la misma receta (por ejemplo, la "ronda 2" mencionada en el nombre del checkpoint).
- Validación de exportación y control de calidad: la comprobación de exportación con MAE de 0,0700 rad sobre 8 fotogramas permite verificar que los pesos se cargan correctamente antes de lanzar evaluaciones cerradas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente una comprobación de exportación (no una evaluación de política) que compara los chunks de 32 pasos predichos con las acciones demostradas, medida como error absoluto medio (MAE) en radianes:

| Episodio | Fotograma | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,0512 |
| 0 | 69 | Put the lizard away in the bin | 0,0308 |
| 25 | 0 | Put the canned food in the grey bin | 0,0495 |
| 25 | 60 | Put the canned food in the grey bin | 0,0480 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0496 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0473 |
| 75 | 0 | Put all the red things in the grey bin | 0,1856 |
| 75 | 225 | Put all the red things in the grey bin | 0,0982 |
| | | **Media** | **0,0700** |

El autor indica explícitamente que esto no es una medida de éxito en tareas y que el éxito en bucle cerrado de RoboLab no se ha evaluado todavía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3.859 millones de parámetros en safetensors, una carga en precisión completa (fp32) requeriría del orden de 15,4 GB solo para pesos; en bf16, unos 7,7 GB, más el estado del servidor y los buffers de inferencia.
- GPU recomendadas para entrenamiento (según la model card): 2× A100-80GB, con 14,1 horas para 2.000 pasos y batch global 64.
- GPU para inferencia: no se especifican. Por tamaño de pesos, cabría en GPUs consumer de gama alta con 16 GB o más en bf16, aunque no hay confirmación del autor.
- Opciones de despliegue: el autor documenta el servidor `cosmos_framework.scripts.action_policy_server_robolab` (puerto 8000, `--format-prompt-as-json True`, `--guidance-interval 960 1001`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota de despliegue: servir con el giro de pinza por defecto (no pasar `--no-flip-gripper`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-plus-r2-full-ft-2k | 3.859.003.312 | no disponible | OpenMDW 1.1 | Hugging Face (17 descargas) | Ajuste fino de 2.000 pasos sobre DROID; MAE de exportación 0,0700 rad |
| nvidia/Cosmos3-Edge-Policy-DROID | no disponible en la información proporcionada | no disponible | OpenMDW 1.1 (licencia del base) | Hugging Face (modelo base de NVIDIA) | Checkpoint base sin el ajuste RoboLab de este repositorio |
| joonyeongs/cosmos3-edge-pyrua-sol-fixed-150 | no disponible | no disponible | no disponible | Hugging Face | Conjunto de datos de episodios usado en el entrenamiento (no es un modelo) |
| Otros policy models de la familia Cosmos3 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros fabricantes (por ejemplo, políticas basadas en difusión o en transformers específicos para DROID); se indica "no disponible".

## Limitaciones y advertencias

- El éxito en bucle cerrado de RoboLab no se ha evaluado; la única métrica publicada es un MAE de exportación de 0,0700 rad, que no mide éxito de tarea.
- El modelo está ajustado sobre un conjunto muy reducido: 50 episodios y 6 tareas. La generalización a otras tareas, objetos o entornos no está demostrada.
- El episodio 75 presenta un MAE notablemente superior (0,1856 rad en el fotograma 0), lo que sugiere un rendimiento desigual según la tarea.
- Riesgo de alucinación y de trayectorias no válidas fuera de la distribución de entrenamiento; no hay evaluación de seguridad física del robot.
- Idiomas: no se documentan; las instrucciones de entrenamiento están en inglés (tareas DROID), por lo que el soporte multilingüe no está verificado.
- Licencia OpenMDW 1.1: es una licencia abierta con condiciones específicas; conviene revisar los términos antes de uso comercial. La model card la etiqueta como `license: other` con `license_name: openmdw1.1-license`.
- El despliegue debe hacerse con el giro de pinza por defecto; pasar `--no-flip-gripper` puede producir acciones incorrectas.
- El repositorio solo difiere del checkpoint base en los shards del transformer; requiere la estructura de directorios del modelo base para cargarse correctamente.
- No hay información sobre sesgos, latencia en producción ni requisitos de seguridad para operación con robots reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-plus-r2-full-ft-2k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Revisión del modelo base: `0110e64ca982589f1a3d856cbdd7d465dccb79bc`
- Conjunto de datos (parte 1): https://huggingface.co/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150
- Conjunto de datos (parte 2): https://huggingface.co/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150-r2
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Herramienta de fusión de datos: `~/robolab-transfer/tools/merge_lerobot_v3.py` (ruta local, no enlazable)
- Script de entrenamiento: `cosmos-edge-robolab-droid-pyrua-body.sh` (ruta local, no enlazable)
- Metadatos de procedencia: `robolab_finetune.json` (incluido en el repositorio)
