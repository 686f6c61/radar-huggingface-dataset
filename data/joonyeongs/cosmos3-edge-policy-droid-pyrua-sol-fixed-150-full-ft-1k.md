# joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-full-ft-1k

## Resumen

Cosmos3-Edge-Policy-DROID (variante `pyrua_sol_fixed_150_edge_full_bs64_1k`) es un modelo de política robótica (policy model) obtenido mediante fine-tuning completo del checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID`. Lo publica el usuario joonyeongs en Hugging Face como resultado de un ajuste con la receta RoboLab DROID sobre un conjunto de 150 episodios exitosos de tareas manipulativas PyRUA-Lean. El modelo no genera texto: predice secuencias de acciones motoras (chunks de posiciones articulares) a partir de observaciones visuales y del estado del robot.

El modelo pertenece a la familia Cosmos3 de NVIDIA, orientada a modelos de mundo y políticas para robótica, y se distribuye con la librería `cosmos` y pesos en `safetensors`. Cuenta con 3.859.003.312 parámetros totales (aproximadamente 3,86 mil millones) y un tamaño de repositorio de 9,2 GB. La arquitectura combina un generador (transformador de difusión) con una torre de comprensión multimodal; en este fine-tuning solo se entrena el generador, mientras que la torre de comprensión permanece congelada y se usan sus claves/valores de texto en caché.

Su relevancia es acotada y experimental: se trata de un checkpoint de investigación publicado automáticamente al final de un trabajo de entrenamiento, sin evaluación de éxito en bucle cerrado (closed-loop) y con cero descargas en el momento de la consulta. Resulta útil como referencia de receta de fine-tuning RoboLab DROID sobre Cosmos3-Edge y como punto de partida reproducible, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (generador de difusión tipo transformer + torre de comprensión multimodal congelada) |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de política robótica, no de lenguaje) |
| Licencia | OpenMDW License 1.1 (heredada del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `0110e64ca982589f1a3d856cbdd7d465dccb79bc`) y se ajusta con la receta RoboLab DROID. El método es un fine-tuning completo del generador: se actualizan todos los pesos del lado generador, mientras que la torre de comprensión queda congelada y se alimenta mediante claves/valores de texto en caché. El repositorio mantiene exactamente la disposición del checkpoint base; solo difieren los shards de pesos del transformador.

Los datos de entrenamiento provienen del conjunto `joonyeongs/cosmos3-edge-pyrua-sol-fixed-150`, con 150 episodios exitosos (25 por cada una de seis tareas, con la disposición de objetos por defecto de cada tarea) y todas las ventanas de trayectoria completa. La raíz de datos es `droid_plus_lerobot_640x360_20260412`, con muestreo de un único pool. Se realizaron 1.000 actualizaciones con batch global 64 (2 GPUs × 32 × acumulación de gradiente 1), learning rate 2e-05, warmup lineal de 50 pasos y decaimiento lineal hasta 0, guardando checkpoints cada 250 pasos (el final es `iter_000001000`). El entrenamiento consumió 6,7 horas en 2× A100-80GB. El código de entrenamiento está en la rama `robolab-droid-train-edge-privileged-phases` del repositorio `joonyeongs/cosmos-framework` (commit `95bad15`).

## Capacidades

- Predicción de acciones robóticas: genera chunks de 32 pasos de posiciones articulares (joint positions) a partir de observaciones.
- Control visuomotor para manipulación de objetos en entornos tipo RoboLab/DROID.
- Ejecución de seis tareas concretas del conjunto PyRUA-Lean: retirar el lagarto a la papelera, depositar comida enlatada en la papelera gris, apilar bloques en orden de color (rojo, azul, verde, amarillo) y agrupar objetos rojos en la papelera gris, entre otras.
- Integración con el servidor de evaluación RoboLab (`RobolabPolicyService` y `action_policy_server_robolab`).
- Soporte de prompt en formato JSON (`--format-prompt-as-json True`).
- No dispone de generación de texto, razonamiento lingüístico, tool calling ni capacidades multilingües documentadas; es un modelo de política, no un LLM conversacional.
- No se documentan capacidades de visión general, audio ni modo thinking.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como checkpoint de referencia para reproducir la receta RoboLab DROID sobre Cosmos3-Edge y comparar variantes de fine-tuning con el mismo presupuesto de 1.000 pasos.
- Evaluación de políticas visuomotoras en simulación: desplegar el modelo con `action_policy_server_robolab` en el puerto 8000 y medir éxito en bucle cerrado en las seis tareas PyRUA-Lean, algo que el autor aún no ha realizado.
- Baseline para experimentos de data scaling: al entrenarse con solo 150 episodios (25 por tarea), sirve para estudiar cómo escala el rendimiento al aumentar el número de demostraciones.
- Estudio de transferencia desde DROID: permite analizar cuánto conocimiento del dataset DROID (raíz `droid_plus_lerobot_640x360_20260412`) se conserva tras el ajuste con datos específicos de laboratorio.
- Depuración de pipelines de robótica: el chequeo de exportación con MAE de 0,0791 rad de media sobre chunks de 32 pasos facilita validar la integración del servidor de inferencia antes de lanzar evaluaciones costosas.
- Reproducción de infraestructura de entrenamiento: la configuración de 2× A100-80GB durante 6,7 horas y el código publicado permiten replicar el job en clústeres pequeños.
- Análisis de sensibilidad a la pinza (gripper): el modelo requiere el flip de pinza por defecto, lo que lo hace útil para estudiar el efecto de la convención de signos en el control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de política robótica. El autor sí publica un chequeo de exportación que no constituye una evaluación de éxito de tarea: compara los chunks predichos de 32 pasos con las acciones demostradas y reporta el error absoluto medio (MAE) en radianes.

| Episodio | Frame | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,0591 |
| 0 | 69 | Put the lizard away in the bin | 0,0382 |
| 25 | 0 | Put the canned food in the grey bin | 0,0463 |
| 25 | 60 | Put the canned food in the grey bin | 0,0641 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0793 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0221 |
| 75 | 0 | Put all the red things in the grey bin | 0,1881 |
| 75 | 225 | Put all the red things in the grey bin | 0,1356 |
| | | **Media** | **0,0791** |

El éxito en bucle cerrado en RoboLab no ha sido evaluado. La tarea de agrupar objetos rojos muestra el MAE más alto (0,1881 y 0,1356 rad), lo que sugiere mayor dificultad o menor cobertura de esa tarea en los datos.

## Requisitos de hardware

- Entrenamiento: 2× A100-80GB durante 6,7 horas para 1.000 pasos con batch global 64.
- Inferencia: no se especifica VRAM mínima. Con 3,86 mil millones de parámetros y pesos en safetensors (repositorio de 9,2 GB), se requiere al menos una GPU con memoria suficiente para cargar el checkpoint completo; en fp16 serían aproximadamente 7,7 GB solo de pesos, más overhead de activaciones y de la torre de comprensión.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cabría en GPUs de consumo con 16 GB o más (por ejemplo, RTX 4090, RTX 4080), aunque no hay confirmación oficial.
- Despliegue: servidor específico de RoboLab mediante `python -m cosmos_framework.scripts.action_policy_server_robolab` con `--checkpoint-path`, `--port 8000`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Advertencia de servicio: debe usarse el flip de pinza por defecto; no pasar `--no-flip-gripper`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-full-ft-1k | 3.859.003.312 | no disponible | Política robótica (fine-tune) | OpenMDW 1.1 | Hugging Face, 0 descargas |
| nvidia/Cosmos3-Edge-Policy-DROID | no disponible | no disponible | Política robótica (base) | OpenMDW 1.1 | Hugging Face (modelo base) |
| Otros fine-tunes RoboLab DROID sobre Cosmos3-Edge | no disponible | no disponible | Política robótica | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparación se limita a linaje, licencia y disponibilidad.

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado en RoboLab; el único dato numérico es un MAE de exportación que no mide éxito de tarea.
- El modelo se entrenó con solo 150 episodios (25 por tarea) y una única disposición de objetos por tarea, lo que limita la generalización a variaciones de escena, iluminación o posiciones iniciales.
- Especializado en seis tareas concretas de PyRUA-Lean; no es un modelo generalista de robótica ni de lenguaje.
- Riesgo de sobreajuste a la distribución de `droid_plus_lerobot_640x360_20260412` y al conjunto de datos de autor.
- Requiere servir con el flip de pinza por defecto; usar `--no-flip-gripper` produciría acciones incorrectas.
- Licencia OpenMDW 1.1: es necesario revisar sus términos para uso comercial; el autor no ofrece garantías adicionales.
- Publicado automáticamente al final del job de entrenamiento, sin revisión posterior ni documentación ampliada.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- No hay información sobre sesgos, composición demográfica de los datos ni robustez frente a condiciones fuera de distribución.
- No se documentan requisitos de VRAM ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-full-ft-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de fine-tuning: https://huggingface.co/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
