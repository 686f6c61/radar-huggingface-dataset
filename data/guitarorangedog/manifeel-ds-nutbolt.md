# guitarorangedog/manifeel-ds-nutbolt

## Resumen

DemoSpeedup es un checkpoint de política robótica basado en Diffusion Policy (DP) publicado por el usuario guitarorangedog bajo el identificador `manifeel-ds-nutbolt`. El modelo forma parte del ecosistema ManiFeel, un conjunto de tareas de manipulación táctil sobre un brazo Franka Panda, y se ha entrenado con el framework robo-synapse sobre LeRobot 0.6.1. Resuelve una tarea concreta de ensamblaje tipo "nutbolt" (tuerca y tornillo) a partir de imagen de muñeca y una imagen táctil (`tacimg`).

El checkpoint tiene 329.219.847 parámetros en formato safetensors (1,3 GB de repositorio) y se distribuye con la librería `lerobot`, por lo que su uso previsto es la inferencia dentro del pipeline de LeRobot y no como modelo de lenguaje. No es un modelo generativo de texto ni multimodal de propósito general: es un controlador de política visomotora entrenado sobre un dataset específico (`RoboSynapse/manifeel-tacr_franka-panda_nutbolt`) con semilla 1000 y AMP.

Su relevancia es acotada pero clara: sirve como baseline reproducible para la tarea `nutbolt` de ManiFeel, con una tasa de éxito reportada del 87,5% (4 semillas × 50 episodios, máximo 500 pasos) y una velocidad de 1,24× respecto a DP en el paso medio hasta el primer éxito. No hay información sobre licencia, idiomas ni benchmarks estándar de NLP, lo cual es esperable dado su dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DP backbone); no se detalla la configuración interna en la información disponible |
| Parametros totales | 329.219.847 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de política robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot (0.6.1) |
| Framework de entrenamiento | robo-synapse |
| Dataset de entrenamiento | RoboSynapse/manifeel-tacr_franka-panda_nutbolt |
| Entradas | cámara de muñeca + imagen táctil (`tacimg`) |
| Tarea | ensamblaje `nutbolt` sobre Franka Panda |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo es un checkpoint de Diffusion Policy, una familia de políticas de imitación que modelan la distribución de acciones condicionada a observaciones mediante un proceso de difusión. La información disponible no detalla el número de pasos de difusión, el encoder visual, la dimensión de las acciones ni la composición exacta de la red, por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizó con robo-synapse sobre LeRobot 0.6.1, con semilla 1000, precisión mixta (AMP) y sin aumento de datos (augmentation off). Las entradas son la cámara de muñeca y una imagen táctil (`tacimg`), lo que sitúa al modelo en el ámbito de la manipulación visotáctil. La receta y el código están asociados a un pull request del repositorio `kwk2696/robo-synapse`. No se especifican el número de tokens, la composición del dataset ni si hubo RLHF/DPO (no aplica en este dominio).

## Capacidades

- Control de política visomotora para la tarea de ensamblaje `nutbolt` sobre un brazo Franka Panda.
- Fusión de percepción visual (cámara de muñeca) y percepción táctil (`tacimg`).
- Generación de trayectorias de acción por difusión condicionada a observaciones.
- Ejecución de episodios de hasta 500 pasos, según el protocolo de evaluación reportado.
- Reproducibilidad mediante semilla fija (1000) y receta publicada.
- Integración con el ecosistema LeRobot para carga y despliegue.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de "thinking"; no aplica a este tipo de modelo.

## Casos de uso

- Baseline de referencia para la tarea `nutbolt` de ManiFeel: permite comparar nuevas políticas contra un punto de partida con métricas publicadas (87,5% de éxito, 1,24× de velocidad frente a DP).
- Investigación en manipulación visotáctil: sirve para estudiar cómo contribuye la imagen táctil al ensamblaje fino de tuerca y tornillo en un Franka Panda.
- Reproducción de experimentos: la semilla 1000, AMP y la ausencia de aumento de datos hacen que el checkpoint sea útil para replicar resultados en entornos controlados.
- Evaluación comparativa de frameworks: al estar entrenado con robo-synapse sobre LeRobot 0.6.1, permite medir diferencias entre versiones y configuraciones del stack.
- Desarrollo de pipelines de imitación: puede integrarse como componente de referencia en flujos de entrenamiento y evaluación de Diffusion Policy dentro de LeRobot.
- Pruebas de robustez sensorial: al depender de cámara de muñeca y tactile image, es adecuado para experimentos sobre degradación o ausencia de una de las modalidades.
- Docencia y prototipado: por su tamaño (329 M de parámetros) y formato safetensors, es manejable para laboratorios que quieran montar un entorno de política difusiva sin infraestructura de gran escala.

## Benchmarks y rendimiento

| Metrica | Valor | Protocolo |
|---|---|---|
| Tasa de éxito | 87,5% | 4 semillas × 50 episodios, máximo 500 pasos |
| Velocidad vs DP | 1,24× | Paso medio hasta el primer éxito, solo episodios exitosos |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), lo cual es coherente con el dominio robótico del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 329.219.847 parámetros en safetensors y un repositorio de 1,3 GB, el peso en FP32 ronda los 1,3 GB; en FP16 sería aproximadamente la mitad, aunque no se confirma el dtype de los pesos.
- GPU recomendadas: no disponible. Para robótica con LeRobot se suele usar una GPU dedicada, pero el autor no especifica modelos concretos.
- Viabilidad en GPU de consumo: no confirmada. Por el tamaño del checkpoint (cientos de millones de parámetros) es plausible en GPUs de consumo con VRAM suficiente, pero no hay dato oficial.
- Opciones de despliegue: LeRobot 0.6.1 como vía principal; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de política).
- Latencia y throughput: no disponibles. El único dato de rendimiento es la comparación relativa de 1,24× frente a DP en pasos hasta el primer éxito.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| manifeel-ds-nutbolt (este) | 329.219.847 | no aplica | `nutbolt` visotáctil, Franka Panda | no disponible | Hugging Face, librería lerobot |
| Diffusion Policy (DP) baseline | no disponible | no aplica | políticas de imitación | no disponible | referencia citada en la model card |
| Otros checkpoints ManiFeel | no disponible | no aplica | tareas ManiFeel | no disponible | no disponible en la información proporcionada |

La comparación cuantitativa disponible se limita al 1,24× de velocidad frente a DP en el paso medio hasta el primer éxito. No hay datos de otros checkpoints ManiFeel ni de alternativas con parámetros y contexto comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de una única tarea (`nutbolt`) y de un único montaje (Franka Panda); no es generalizable a otras tareas sin reentrenamiento.
- Depende de dos entradas sensoriales concretas (cámara de muñeca y `tacimg`); la ausencia o degradación de cualquiera de ellas puede invalidar el comportamiento.
- La tasa de éxito del 87,5% implica un 12,5% de fallos en el protocolo reportado; en producción debe contemplarse recuperación ante fallos.
- Entrenado sin aumento de datos, lo que puede reducir la robustez ante cambios de iluminación, textura o posición no vistos en el dataset.
- Licencia no disponible: no puede asumirse uso comercial sin confirmación del autor.
- No hay información sobre sesgos, alucinación (concepto no aplicable a políticas robóticas) ni limitaciones idiomáticas.
- Checkpoint con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente por parte de la comunidad.
- El repositorio se creó y actualizó el 2026-11-13 en un intervalo de segundos, lo que sugiere una publicación automatizada; conviene verificar la integridad de los pesos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guitarorangedog/manifeel-ds-nutbolt
- Dataset: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_nutbolt
- Código y receta (pull request): https://github.com/kwk2696/robo-synapse/pull/3
