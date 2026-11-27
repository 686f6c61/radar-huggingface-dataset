# mws-physical-ai/gr00t-n16-postloop100-real80-synth20-20261127

## Resumen

GR00T N1.6 postloop100-real80-synth20 es un ajuste fino (fine-tune) del modelo fundacional de robotica NVIDIA GR00T N1.6-3B, desarrollado por el usuario mws-physical-ai. El modelo esta especializado en el control del robot humanoide Unitree G1 equipado con manos BrainCo, y predice tokens de movimiento GEAR-SONIC junto con objetivos de articulaciones de la mano. El problema que resuelve es la generacion de politicas de control visomotoras especificas para una tarea concreta: retirar basura (remove trash) a partir de demostraciones de teleoperacion.

El entrenamiento parte de los pesos preentrenados de NVIDIA y aplica un ajuste de 12.000 pasos sobre un conjunto combinado de 80 episodios reales de teleoperacion y 20 episodios sinteticos, con un total de 133.216 fotogramas reales y 13.321 sinteticos. El checkpoint seleccionado alcanza una perdida de validacion de 0,0331 sobre dos episodios reales reservados (IDs 31 y 32). La entrada se preprocesa a 640 x 360 RGB.

Se trata de un modelo de investigacion aplicada en robotica, no de un modelo de lenguaje: su relevancia radica en demostrar el flujo de trabajo de adaptacion de un modelo fundacional de robotica (VLA, vision-language-action) a un hardware concreto mediante una mezcla de datos reales y sinteticos. El repositorio contiene unicamente pesos de inferencia, configuracion y estadisticas de normalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en GR00T N1.6; prediccion de tokens de movimiento GEAR-SONIC y objetivos de articulaciones de mano |
| Parametros totales | 3.286.608.832 (~3,29 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (license: other) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo fundacional NVIDIA GR00T N1.6-3B, un modelo visomotor orientado a robotica que combina percepcion visual con generacion de acciones. En este ajuste, la cabeza de salida predice tokens de movimiento GEAR-SONIC y objetivos de articulaciones para las manos BrainCo del Unitree G1. La entrada visual se preprocesa a 640 x 360 RGB.

El ajuste fino consta de 12.000 pasos con un tamano de lote efectivo de 16 (lote de 4 con 4 pasos de acumulacion). Los datos de entrenamiento combinan 80 episodios reales de teleoperacion (133.216 fotogramas) procedentes de la revision `1ac635f9c14ed7d0ec7aad4c4ac005e00a1140a9` del dataset `mws-physical-ai/g1-brainco-remove-trash-teleop-combined-20261120`, y 20 episodios sinteticos (13.321 fotogramas) de la revision Postloop100 `49c229d112083279f4bb786559945b9ac8c8ef6c`, con tokens de movimiento derivados de trayectorias articulares estimadas. La validacion se realizo sobre dos episodios reales reservados (IDs 31 y 32), con una perdida final de 0,0331. No se detalla en la informacion disponible si hubo etapas de RLHF, DPO u otras tecnicas de alineacion adicionales.

## Capacidades

- Prediccion de acciones motoras para el robot humanoide Unitree G1 con manos BrainCo.
- Generacion de tokens de movimiento GEAR-SONIC a partir de observaciones visuales RGB.
- Prediccion de objetivos de articulaciones de la mano.
- Ejecucion de la tarea especifica de retirar basura (remove trash) aprendida por imitacion.
- Control visomotor de extremo a extremo a partir de entrada de imagen preprocesada a 640 x 360.
- No se dispone de informacion sobre soporte de tool calling, agentes, capacidades multilingues, vision general, audio ni modos de razonamiento explicito.

## Casos de uso

- Automatizacion de tareas de recogida de residuos en entornos controlados: el modelo ejecuta la politica aprendida de retirar basura con el Unitree G1, adecuado porque ha sido entrenado especificamente sobre teleoperaciones de esa tarea.
- Investigacion en imitacion visomotora: sirve como punto de partida para estudiar la transferencia de modelos fundacionales de robotica a hardware concreto, ya que parte de GR00T N1.6-3B y documenta el proceso de ajuste.
- Evaluacion de mezcla de datos reales y sinteticos: permite analizar como influye una proporcion 80/20 de episodios reales y sinteticos en la perdida de validacion, dado que el autor publica ese desglose.
- Prototipado de politicas para manipulacion con manos antropomorficas: la prediccion de objetivos de articulaciones de la mano BrainCo es directamente reutilizable en experimentos de agarre y manipulacion.
- Benchmark interno de referencia: el checkpoint con perdida de validacion de 0,0331 sobre episodios reservados puede servir como linea base para comparar futuros ajustes sobre el mismo dataset.
- Reproduccion de experimentos de robotica: al publicarse pesos, configuracion y estadisticas de normalizacion, el modelo permite replicar la inferencia siempre que se aplique el preprocesamiento documentado en PREPROCESSING.md.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. El unico dato de rendimiento publicado es la perdida de validacion del objetivo de entrenamiento offline:

| Metrica | Valor |
|---|---|
| Perdida de validacion (paso 12.000) | 0,033095188438892365 |
| Episodios de validacion | 2 reales reservados (IDs 31 y 32) |
| Fotogramas de entrenamiento reales | 133.216 |
| Fotogramas de entrenamiento sinteticos | 13.321 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 3,29 mil millones de parametros en BF16, los pesos ocupan aproximadamente 6,6 GB, por lo que se requiere al menos esa cantidad de memoria mas el espacio para activaciones y buffers de preprocesamiento visual.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es compatible con GPUs de gama alta para inferencia en BF16, aunque no se confirma ningun modelo concreto.
- Compatibilidad con GPU de consumo: probable por el tamano de los pesos (6,6 GB en BF16), pero no confirmada en la informacion disponible.
- Opciones de despliegue: no se documentan en la model card; el autor remite a PREPROCESSING.md para la configuracion del procesador de entrada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.6 postloop100-real80-synth20 (este) | 3,29 B | no disponible | Control visomotor Unitree G1 + manos BrainCo | NVIDIA Open Model License | Hugging Face |
| nvidia/GR00T-N1.6-3B (modelo base) | ~3 B | no disponible | Modelo fundacional de robotica general | NVIDIA Open Model License | Hugging Face |
| Otros ajustes de GR00T N1.6 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este ajuste y el modelo base ni con otras alternativas.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea (retirar basura) y un unico hardware (Unitree G1 con manos BrainCo); no es un modelo de proposito general.
- La validacion se limita a dos episodios reales reservados, lo que ofrece una estimacion de generalizacion muy reducida.
- La perdida de validacion es una metrica offline del objetivo de entrenamiento; no se reportan tasas de exito en ejecucion real.
- El 13 % de los fotogramas de entrenamiento son sinteticos, derivados de trayectorias articulares estimadas, lo que puede introducir sesgos respecto a la distribucion real.
- No se documentan sesgos conocidos, riesgos de alucinacion en el sentido linguistico, ni limitaciones de idioma; al ser un modelo visomotor, estos aspectos no aplican de forma directa.
- La licencia NVIDIA Open Model License impone condiciones para uso comercial; debe revisarse el archivo LICENSE antes de cualquier despliegue productivo.
- El repositorio incluye solo pesos de inferencia, configuracion y estadisticas de normalizacion; es imprescindible aplicar el preprocesamiento documentado para obtener resultados validos.
- Uso en produccion: requiere validacion adicional en el entorno fisico real y no debe asumirse el rendimiento observado en validacion offline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mws-physical-ai/gr00t-n16-postloop100-real80-synth20-20261127
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/mws-physical-ai/g1-brainco-remove-trash-teleop-combined-20261120
- Documentacion de preprocesamiento: PREPROCESSING.md (incluido en el repositorio del modelo)
- Licencia: LICENSE (incluido en el repositorio del modelo)
