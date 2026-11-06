# Gserts/openpi-pi05-base-cube-charger-lora-r64-10k

## Resumen

Gserts/openpi-pi05-base-cube-charger-lora-r64-10k es un checkpoint intermedio de un modelo de politica robotica (vision-language-action, VLA) derivado de pi05_base, la base JAX del proyecto OpenPI. Lo desarrolla el usuario Gserts y esta pensado para una tarea concreta de manipulacion: empujar un cubo hacia un cargador (push cube charger) sobre una mesa con dos camaras (frontal y de muneca) y un estado de seis articulaciones. No es un modelo de lenguaje general, sino un adaptador de politica entrenado con LoRA sobre los backbones Gemma de pi05.

El checkpoint corresponde a 10.000 actualizaciones del optimizador de un plan de 20.000 pasos, con batch 16 y semilla 1000, partiendo de los pesos oficiales pi05_base en JAX. Se trata de un checkpoint nativo de OpenPI en formato Orbax, no de un adaptador PEFT de LeRobot, e incluye los parametros completos de inferencia, los activos de normalizacion y el adaptador especifico del proyecto.

Su relevancia es acotada: sirve como referencia reproducible para quien quiera evaluar el ajuste fino con LoRA de pi05 en una tarea de robotica concreta, y como punto de partida para continuar el entrenamiento o comparar configuraciones. No es un modelo de proposito general ni esta pensado para desplegarse fuera del entorno OpenPI indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi05 con dos backbones Gemma y adaptadores LoRA; pesos en JAX (Orbax) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en precision de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de robotica; las instrucciones de texto dependen del backbone Gemma subyacente) |
| Licencia | apache-2.0 |
| Formato de pesos | Orbax (checkpoint nativo de OpenPI en JAX) |

## Arquitectura y entrenamiento

El modelo parte de pi05_base, una politica VLA que combina percepcion visual y un backbone de lenguaje para producir acciones motoras. En este caso se aplica LoRA de rango 64 y alpha 64 sobre ambos backbones Gemma, usando el filtro de congelacion oficial de LoRA; los parametros de vision y proyeccion fuera de ese filtro tambien se actualizan. La normalizacion por cuantiles se recalcula sobre el dataset completo con trozos de 50 acciones recortados por episodio.

El entrenamiento se realizo durante 10.000 actualizaciones del optimizador (de un total previsto de 20.000), con batch 16 y semilla 1000, sobre el dataset Gserts/push_cube_charger_20261102_205242. El estado del optimizador solo se conserva en HPC, por lo que el checkpoint publicado no permite reanudar el entrenamiento de forma directa. Las entradas de inferencia son observation.images.front, observation.images.wrist (RGB), observation.state (seis posiciones articulares) y un prompt; la salida son acciones[..., :6] en unidades articulares absolutas originales. Si falta la tercera camara, se enmascara.

## Capacidades

- Generacion de acciones de manipulacion robotica de 6 grados de libertad a partir de observaciones visuales y de estado articular.
- Control condicionado por prompt de lenguaje, heredado del backbone Gemma de pi05.
- Fusión de dos vistas de camara (frontal y de muneca) con enmascaramiento de una tercera camara ausente.
- Ejecucion por prefijos de accion: se ejecutan las primeras acciones (10 acciones a 30 Hz en la configuracion previa) y se replanifica.
- Ajuste especifico de tarea mediante LoRA, lo que permite adaptar la politica base a un entorno concreto sin reentrenar todos los parametros.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Manipulacion de objetos tipo empujar cubo hacia cargador: es el caso exacto para el que se entreno; se usaria cargando el checkpoint en OpenPI con la configuracion pi05_cube_charger_lora_r64 y ejecutando prefijos de accion con replanificacion.
- Investigacion en ajuste fino con LoRA de politicas VLA: sirve como referencia reproducible para comparar rangos de LoRA, pasos de entrenamiento y normalizacion sobre una misma tarea.
- Evaluacion de robustez ante camaras ausentes: el enmascaramiento de la tercera camara permite probar el comportamiento con configuraciones de sensores reducidas.
- Prototipado de pipelines de control a 30 Hz: la ejecucion por prefijos de 10 acciones y replanificacion encaja en bucles de control de baja latencia sobre hardware real o simulado.
- Generacion de datos sinteticos de trayectorias: las acciones predichas pueden usarse para aumentar el dataset de la tarea antes de un entrenamiento posterior.
- Benchmark interno de politicas de robotica: al ser un checkpoint intermedio, permite medir la curva de aprendizaje entre 10.000 y 20.000 pasos frente a otras variantes.
- Docencia y divulgacion: ejemplo concreto de como se estructura un checkpoint nativo de OpenPI con activos de normalizacion y adaptador de proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 6,7 GB, lo que da una referencia del orden de magnitud del checkpoint completo.
- GPU recomendadas: no disponibles en la informacion proporcionada; al ser un checkpoint JAX, requiere una GPU compatible con JAX/CUDA.
- Cabe en GPU de consumo: no disponible; depende del tamaño real de los parametros de pi05_base y del backend JAX.
- Opciones de despliegue: OpenPI con JAX, commit 215abfb217dbac7d5f1273282331b9b1866c0479 y openpi_project/project.patch, cargando con config pi05_cube_charger_lora_r64 y policy_config.create_trained_policy. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la configuracion previa ejecutaba 10 acciones a 30 Hz antes de replanificar, pero no se aportan medidas de latencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gserts/openpi-pi05-base-cube-charger-lora-r64-10k | no disponible | no disponible | sin benchmarks publicados | apache-2.0 | Hugging Face, checkpoint Orbax |
| pi05_base (OpenPI oficial) | no disponible | no disponible | no disponible | no disponible en la informacion | base de referencia del proyecto OpenPI |
| Adaptadores LeRobot PEFT | no disponible | no disponible | no disponible | no disponible | formato distinto, no compatible directamente |

No se dispone de datos suficientes para comparar parametros, contexto ni rendimiento con alternativas de la misma categoria; la comparativa se limita a la relacion con pi05_base y con el formato de adaptador de LeRobot.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 10.000 de los 20.000 pasos previstos, por lo que el rendimiento puede ser inferior al de un entrenamiento completo.
- No incluye estado del optimizador, por lo que no se puede reanudar el entrenamiento directamente desde este checkpoint.
- Especifico de una tarea y un entorno: no es un modelo general y su uso fuera de la tarea push cube charger no esta validado.
- Requiere una version concreta de OpenPI (commit 215abfb217dbac7d5f1273282331b9b1866c0479) y un parche de proyecto, lo que limita la portabilidad.
- No es un adaptador PEFT de LeRobot; intentar cargarlo como tal fallara.
- Riesgo de sobreajuste al dataset de entrenamiento y de degradacion ante cambios de iluminacion, camaras o disposicion de objetos.
- Las acciones se expresan en unidades articulares absolutas originales; un error de calibracion del robot puede producir movimientos incorrectos.
- Sin benchmarks publicados ni evaluacion externa, la fiabilidad en produccion no esta cuantificada.
- Licencia apache-2.0 permite uso comercial, pero deben respetarse las condiciones de los pesos base de pi05 y de los componentes Gemma subyacentes.
- Idiomas no documentados; el comportamiento ante instrucciones en castellano no esta verificado.

## Enlaces

- Hugging Face: https://huggingface.co/Gserts/openpi-pi05-base-cube-charger-lora-r64-10k
- Dataset de entrenamiento: https://huggingface.co/datasets/Gserts/push_cube_charger_20261102_205242
- Proyecto OpenPI: no disponible en la informacion proporcionada
- Paper de pi05: no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
