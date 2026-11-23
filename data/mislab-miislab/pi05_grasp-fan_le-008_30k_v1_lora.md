# MISLab-MiiSLab/pi05_grasp-fan_Le-008_30k_v1_Lora

## Resumen

Este repositorio contiene un adaptador LoRA denominado `pi05_grasp-fan_Le-008_30k_v1_Lora`, publicado por la organizacion MISLab-MiiSLab. No se trata de un modelo de lenguaje completo, sino de un conjunto de pesos de ajuste fino (adapter) que se aplica sobre el modelo base `lerobot/pi05_base`, un modelo de politica visomotora orientada a robotica (vision-language-action) del ecosistema LeRobot. El adaptador se ha entrenado para una tarea concreta de manipulacion robotica: el agarre de un ventilador (grasp-fan), segun se deduce del identificador del repositorio.

El modelo se distribuye exclusivamente en formato PEFT, con un tamano de repositorio de 0,2 GB, lo que es coherente con un adaptador LoRA de bajo rango y no con un modelo completo. La model card del autor es practicamente una plantilla sin rellenar: no documenta datos de entrenamiento, hiperparametros, licencia, idiomas ni resultados de evaluacion. Toda la informacion tecnica disponible procede de las etiquetas del repositorio y del identificador del propio modelo.

Su relevancia es acotada: sirve como ejemplo de ajuste fino eficiente de un modelo de robotica sobre una tarea especifica, y es util para quien quiera reproducir o reutilizar el flujo de trabajo de LeRobot con PEFT. No es un modelo de proposito general ni compite con LLM o VLM convencionales; su interes es practico dentro del dominio de la robotica manipulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base `lerobot/pi05_base`; arquitectura del base no disponible |
| Parametros totales | no disponible (adaptador LoRA; el repositorio ocupa 0,2 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; se aplican sobre el base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango, tal y como indican las etiquetas `peft` y `lora`, montado sobre `lerobot/pi05_base`. La tecnica LoRA congela los pesos del modelo base e introduce matrices de descomposicion de bajo rango en determinadas capas, lo que reduce drasticamente el numero de parametros entrenables y el coste de almacenamiento (de ahi los 0,2 GB del repositorio). El identificador sugiere un entrenamiento de aproximadamente 30.000 pasos (`30k`) sobre una tarea de agarre de un ventilador (`grasp-fan`), probablemente con un conjunto de datos de demostraciones teleoperadas propio de LeRobot.

No hay informacion publicada sobre la composicion del dataset, el numero de episodios, la modalidad de entrada (imagen, estado de las articulaciones, instruccion en lenguaje natural), los hiperparametros de entrenamiento (rango LoRA, alpha, tasa de aprendizaje, precision) ni si se aplico RLHF, DPO o aprendizaje por imitacion supervisado. La model card no aporta ningun detalle sobre el procedimiento. La version de PEFT empleada fue la 0.21.0.

## Capacidades

- Control de un brazo robotico para la tarea especifica de agarre de un ventilador, presumiblemente mediante politica visomotora aprendida por imitacion.
- Aplicacion de un adaptador de ajuste fino sobre el modelo base `lerobot/pi05_base`, lo que permite cargar el base y superponer el LoRA para reproducir el comportamiento entrenado.
- Capacidad de generacion de texto, razonamiento, codigo o matematicas: no aplicable, no es un modelo de lenguaje.
- Soporte de tool calling o function calling: no disponible; no es un modelo de proposito general.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: ninguna documentada mas alla del ajuste para la tarea de agarre.

## Casos de uso

- Reproduccion de experimentos de robotica: cargar `lerobot/pi05_base` y superponer este adaptador para replicar el entrenamiento de agarre de un ventilador y comparar resultados con otras variantes del mismo laboratorio.
- Investigacion en aprendizaje por imitacion: usar el adaptador como punto de partida para estudiar como afecta el ajuste fino de bajo rango al comportamiento de una politica visomotora en tareas de manipulacion.
- Evaluacion comparativa de adaptadores LoRA: al existir variantes con distintos identificadores (por ejemplo, `_Le-008_30k_v1_Lora`), permite comparar configuraciones de entrenamiento sobre el mismo modelo base.
- Docencia y divulgacion: ejemplo practico y ligero (0,2 GB) de como se publica y se reutiliza un adaptador PEFT en el ecosistema LeRobot.
- Base para ajuste posterior: el adaptador puede servir como inicializacion para un nuevo ajuste fino sobre una tarea relacionada, reduciendo el coste frente a entrenar desde el modelo base.
- Integracion en pipelines de robotica con LeRobot: desplegar el modelo base con el adaptador en un entorno de simulacion o en un brazo real para validar la tarea de agarre antes de escalar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito de agarre, tasas de exito en simulacion ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base `lerobot/pi05_base`, cuyos requisitos no se documentan. El adaptador en si ocupa 0,2 GB.
- GPU recomendadas: no disponible. Para robotica visomotora en tiempo real suelen emplearse GPU de gama media-alta (RTX 3090/4090, A100), pero no hay dato confirmado para este modelo.
- Compatibilidad con GPU de consumo: no disponible; probablemente si, dado el reducido tamano del adaptador, pero condicionado al base.
- Opciones de despliegue: carga mediante la libreria `peft` sobre el modelo base; no consta soporte especifico para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `pi05_grasp-fan_Le-008_30k_v1_Lora` (este) | Adaptador LoRA, 0,2 GB | no disponible | no disponible | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | Hugging Face |
| Otras variantes `_Le-*_30k_v1_Lora` del mismo autor | Adaptadores LoRA | no disponible | no disponible | Hugging Face (presuntas) |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas. La unica comparacion posible es estructural: este adaptador frente a su modelo base y frente a otras variantes del mismo laboratorio.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre licencia, datos, evaluacion ni uso previsto, lo que impide valorar su idoneidad para produccion.
- Licencia no especificada: no puede asumirse uso comercial; es necesario contactar con el autor o consultar el repositorio del modelo base.
- Especializacion extrema: el adaptador esta entrenado para una unica tarea (agarre de un ventilador) y probablemente no generaliza a otros objetos o entornos.
- Dependencia del modelo base: su comportamiento solo es valido junto a `lerobot/pi05_base`; cambios en el base pueden romper la compatibilidad.
- Sesgos: no documentados; en robotica, los sesgos provienen de la distribucion de demostraciones (posiciones, iluminacion, objetos), no evaluada aqui.
- Riesgo de alucinacion: no aplicable en el sentido de LLM, pero si existe riesgo de acciones erroneas o inseguras en el robot si el modelo se ejecuta fuera de su dominio de entrenamiento.
- Sin garantias de seguridad fisica: no hay documentacion sobre limites de par, paradas de emergencia ni validacion en entornos reales.
- Fecha de creacion futura (2026-11-23) en los metadatos, lo que sugiere que el repositorio puede ser un artefacto de prueba o estar mal etiquetado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MISLab-MiiSLab/pi05_grasp-fan_Le-008_30k_v1_Lora
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper de LoRA (referenciado en las etiquetas): https://arxiv.org/abs/1910.09700
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Proyecto LeRobot: https://github.com/huggingface/lerobot
- Calculadora de impacto de ML (Lacoste et al., 2019): https://mlco2.github.io/impact
