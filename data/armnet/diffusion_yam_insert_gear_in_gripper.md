# armnet/diffusion_yam_insert_gear_in_gripper

## Resumen

`armnet/diffusion_yam_insert_gear_in_gripper` es un conjunto de checkpoints de política de difusión (Diffusion Policy) entrenado como baseline para la tarea robótica `insert_gear_in_gripper` dentro del banco de pruebas RoboBuilderBench. Lo desarrolla el usuario `armnet` y está pensado para el robot bimanual YAM, con representación de acciones de 14 dimensiones, control a 20 Hz y tres cámaras (vista superior, muñeca izquierda y muñeca derecha).

No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de un controlador visuomotor: recibe observaciones de imagen y estado del robot y genera secuencias de acciones motoras. El repositorio incluye cinco checkpoints intermedios (pasos 4.000, 8.000, 12.000, 16.000 y 20.000), lo que permite analizar la evolución del entrenamiento y elegir el punto de control más adecuado.

Es relevante ahora porque sirve como referencia reproducible para comparar métodos de imitación en manipulación bimanual de precisión, y porque documenta de forma explícita la receta de entrenamiento (LeRobot 0.5.1), la curva de pérdida y el hardware empleado (una NVIDIA GH200 de 120 GB). La información pública disponible es escasa: no hay pipeline declarado, licencia, idiomas ni resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para control visuomotor), encoder visual ResNet18 preentrenado en ImageNet1K_V1, un encoder RGB separado por cámara |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción `horizon=64`, `n_action_steps=32`, `n_obs_steps=2` |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` dentro de cada `checkpoint-*/pretrained_model`, junto con configuraciones y procesadores) |

## Arquitectura y entrenamiento

La arquitectura es Diffusion Policy, implementada en `lerobot==0.5.1` con un parche para resolución de cámara heterogénea. El modelo condiciona un proceso de difusión sobre secuencias de acciones (horizonte de 64 pasos, 32 acciones ejecutadas por inferencia, 2 observaciones de entrada) a partir de tres flujos de imagen procesados por encoders ResNet18 independientes por cámara (`use_separate_rgb_encoder_per_camera=true`), con redimensionado a 576x1024 y sin recorte. Se desactiva GroupNorm (`use_group_norm=false`) y se emplean 50 pasos de inferencia en la generación de acciones.

El entrenamiento se realizó sobre el dataset `fanqi-robo/insert_gear_in_gripper` (commit `acdc9ac82e45db2c421c242e41ef8ef0fe549b31`) durante 20.000 pasos con batch de 32, tasa de aprendizaje 1e-4, 500 pasos de calentamiento, semilla 1000 y una única NVIDIA GH200 de 120 GB, con un tiempo total de 2 h 41 min 53 s. La pérdida desciende de forma monótona desde 0,662 (paso 200) hasta 0,004 (paso 20.000, época 23,51), con norma de gradiente decreciente hasta 0,071, sin inestabilidades reportadas.

## Capacidades

- Control visuomotor bimanual para la tarea concreta de insertar una pieza dentada en la pinza, con 14 dimensiones de acción y frecuencia de 20 Hz.
- Fusión de tres vistas de cámara (superior, muñeca izquierda, muñeca derecha) mediante encoders visuales separados.
- Generación de trayectorias de acción multimodales mediante difusión, lo que permite representar distribuciones de comportamiento no unimodales.
- Ejecución de chunks de acción: predice 64 pasos y ejecuta 32 por inferencia, lo que reduce la frecuencia de replanificación.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento.
- No incorpora visión generalista, audio ni generación de texto.

## Casos de uso

- Baseline reproducible en investigación de imitación: sirve como referencia cuantitativa (curva de pérdida y checkpoints intermedios) para comparar nuevas políticas de difusión sobre la misma tarea y dataset.
- Manipulación bimanual de precisión en laboratorio: el controlador genera acciones coordinadas de ambos brazos para insertar una pieza en la pinza, un escenario típico de ensamblaje fino.
- Evaluación de robustez visual multi-cámara: al usar tres vistas independientes, permite estudiar cómo afecta la oclusión o el cambio de iluminación en cada cámara al rendimiento del controlador.
- Estudio de selección de checkpoint: los cinco puntos de control permiten analizar el equilibrio entre ajuste (pérdida) y capacidad de generalización en despliegues reales.
- Réplica de experimentos: la receta documentada (LeRobot 0.5.1, hiperparámetros, semilla y hardware) facilita reproducir el entrenamiento en un entorno con GH200 o GPU de capacidad similar.
- Integración en pipelines de RoboBuilderBench: el bundle encaja como punto de partida para comparativas estandarizadas dentro del banco de pruebas.
- Docencia y formación en políticas de difusión: la estructura clara del repositorio y el registro de entrenamiento lo hacen útil para explicar el ciclo completo de entrenamiento de una Diffusion Policy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la progresión de la pérdida de entrenamiento:

| Paso | Pérdida | Norma de gradiente |
|---:|---:|---:|
| 200 | 0,662 | — |
| 1.000 | 0,032 | 0,673 |
| 4.000 | 0,014 | 0,249 |
| 8.000 | 0,009 | 0,161 |
| 12.000 | 0,007 | 0,130 |
| 16.000 | 0,004 | 0,098 |
| 20.000 | 0,004 | 0,071 |

No hay métricas de éxito en tarea, tasas de acierto ni comparaciones con otras políticas en la información proporcionada.

## Requisitos de hardware

- Entrenamiento original: 1x NVIDIA GH200 de 120 GB, 2 h 41 min 53 s para 20.000 pasos con batch 32.
- VRAM de inferencia: no disponible de forma explícita; el repositorio ocupa 5,9 GB e incluye cinco checkpoints, por lo que cada checkpoint individual es sustancialmente menor. La inferencia con ResNet18 y 50 pasos de difusión es ligera en comparación con el entrenamiento.
- GPU recomendadas: para entrenamiento, GH200, H100 o A100 de 80 GB; para inferencia, una GPU consumer de gama alta (RTX 4090, RTX 3090) debería ser suficiente, aunque no se confirma en la documentación.
- Cabe en GPU consumer: probablemente sí para inferencia, sin dato confirmado.
- Opciones de despliegue: LeRobot 0.5.1 (framework original); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La inferencia usa 50 pasos de difusión y ejecuta 32 acciones por predicción a 20 Hz, lo que condiciona los requisitos de tiempo real.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (políticas de difusión para manipulación bimanual) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo está entrenado para la tarea `insert_gear_in_gripper` con el robot YAM; no es transferible a otras tareas sin reentrenamiento.
- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Sin benchmarks de éxito en tarea: la pérdida de entrenamiento no garantiza un rendimiento adecuado en el robot real.
- Dependencia del dataset y del entorno: cambios en cámaras, iluminación, calibración o en la pieza pueden degradar el comportamiento.
- Riesgo de sobreajuste al demostrador: con 23,5 épocas sobre un único dataset, la política puede reproducir sesgos de las demostraciones y fallar ante variaciones no vistas.
- Sin información sobre sesgos sociales ni alucinación en el sentido lingüístico, por no ser un modelo de lenguaje; el equivalente sería la generación de acciones no válidas fuera de la distribución de entrenamiento.
- Requiere verificación de integridad con `verify-checkpoint` contra `CHECKPOINT_MANIFEST.json` tras la descarga.
- No se documentan límites de contexto ni idioma porque no aplican; cualquier uso fuera del pipeline LeRobot requiere adaptación manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/armnet/diffusion_yam_insert_gear_in_gripper
- Run de W&B: https://wandb.ai/pravsels/lerobot-rbb-diffusion/runs/yt5xr098
- Dataset: `fanqi-robo/insert_gear_in_gripper` (commit `acdc9ac82e45db2c421c242e41ef8ef0fe549b31`), referenciado en la model card
- Framework: LeRobot 0.5.1 (no se proporciona URL en la información disponible)
- Paper de referencia de Diffusion Policy: no disponible en la información proporcionada
