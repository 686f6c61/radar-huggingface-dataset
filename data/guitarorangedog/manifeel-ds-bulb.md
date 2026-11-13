# guitarorangedog/manifeel-ds-bulb

## Resumen

`manifeel-ds-bulb` es un checkpoint de política de difusión (diffusion policy, DP) para control robótico, publicado por el usuario `guitarorangedog` bajo el ecosistema LeRobot. El modelo está entrenado para la tarea de manipulación denominada `bulb` dentro del conjunto de datos ManiFeel, concretamente sobre el dataset `RoboSynapse/manifeel-tacr_franka-panda_bulb`, que combina imagen de cámara de muñeca con imagen táctil del dedo derecho sobre un brazo Franka Panda. No es un modelo de lenguaje: es un modelo de robótica que mapea observaciones multimodales (visión + tacto) a acciones motoras.

El checkpoint se presenta como una línea base ("baseline") entrenada con el framework robo-synapse sobre LeRobot 0.6.1, con semilla 1000, precisión mixta (AMP) y sin aumento de datos. Reporta una tasa de éxito del 58,5 % (4 semillas × 50 episodios, máximo 500 pasos por episodio) y una mejora de velocidad de 1,29× frente a la política de difusión de referencia, medida como paso medio hasta el primer éxito en episodios exitosos.

Su relevancia es acotada pero clara para quien trabaja en manipulación con percepción táctil: ofrece un punto de partida reproducible y con métricas declaradas para comparar variantes de políticas de difusión en una tarea concreta, con pesos en safetensors (329.219.847 parámetros, repo de 1,3 GB) y código/receta enlazados en un pull request público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy, DP) sobre backbone "DemoSpeedup", según model card |
| Parametros totales | 329.219.847 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de robótica; no hay ventana de contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el checkpoint como una política de difusión ("DP backbone", variante DemoSpeedup) entrenada con robo-synapse sobre LeRobot 0.6.1. La entrada combina la imagen de la cámara de muñeca con la imagen táctil del dedo derecho (`tacimg`), y la salida es una secuencia de acciones para el robot. El detalle interno de la red (número de capas, dimensión de los embeddings de observación, pasos de difusión) no se especifica en la información disponible.

El entrenamiento se realizó con semilla 1000, precisión mixta (AMP) y sin aumento de datos, sobre el dataset `RoboSynapse/manifeel-tacr_franka-panda_bulb`. La model card no documenta el número de tokens, la composición del dataset ni si hubo etapas de ajuste fino con preferencias o refuerzo; en robótica estos conceptos no aplican del mismo modo y aquí no se aportan datos al respecto. La innovación declarada es la receta "DemoSpeedup" y la métrica de aceleración frente a DP (1,29× en paso medio hasta el primer éxito).

## Capacidades

- Control robótico de manipulación: genera acciones motoras para un brazo Franka Panda a partir de observaciones visuales y táctiles.
- Fusión multimodal visión + tacto: consume imagen de cámara de muñeca y una imagen táctil del dedo derecho (`tacimg`).
- Política de difusión: produce trayectorias de acción mediante generación iterativa (difusión), adecuada para tareas de manipulación con contacto.
- Específico de la tarea `bulb`: no es un modelo generalista; su ámbito es el conjunto de tareas del dataset ManiFeel referenciado.
- Integración con LeRobot: formato y librería compatibles con el ecosistema LeRobot 0.6.1.
- No dispone de tool calling, function calling, razonamiento multi-paso textual, capacidades multilingües ni modo de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Línea base para investigación en manipulación táctil: sirve como referencia reproducible (semilla 1000, AMP, sin aumento) para comparar nuevas variantes de políticas de difusión en la tarea `bulb` con una tasa de éxito declarada del 58,5 %.
- Evaluación de recetas de entrenamiento: permite medir el efecto de cambios en la receta (por ejemplo, activar aumento de datos o variar semillas) contra un punto de partida fijo y con métricas ya publicadas.
- Reproducción de experimentos en LeRobot: al estar empaquetado para LeRobot 0.6.1, se puede cargar en flujos de entrenamiento/evaluación existentes del ecosistema sin conversiones adicionales.
- Estudio de fusión visión-tacto: útil para analizar cómo contribuye la imagen táctil (`tacimg`) al rendimiento en tareas de contacto, comparando con variantes sin entrada táctil.
- Desarrollo de pipelines de simulación a real: el checkpoint y la receta enlazada (PR de robo-synapse) pueden servir de base para experimentos de transferencia sobre el mismo robot y tarea.
- Docencia y prototipado en robótica: ejemplo concreto y pequeño (1,3 GB) de política de difusión multimodal para demostrar el ciclo completo observación-acción en un Franka Panda simulado o real.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los siguientes:

| Metrica | Valor | Condiciones |
|---|---|---|
| Tasa de éxito | 58,5 % | 4 semillas × 50 episodios, máximo 500 pasos |
| Aceleración vs DP | 1,29× | Paso medio hasta el primer éxito, solo episodios exitosos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 329,2 M de parámetros y pesos safetensors en un repo de 1,3 GB, la huella en memoria es moderada, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la model card.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint sugiere que podría caber en GPU de consumo, pero no hay datos oficiales que lo respalden.
- Opciones de despliegue: LeRobot 0.6.1 (librería declarada). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo reporta la métrica relativa de velocidad (1,29× frente a DP en paso hasta el primer éxito).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `guitarorangedog/manifeel-ds-bulb` | Diffusion policy (visión + tacto) | 329,2 M | No aplica | 58,5 % éxito; 1,29× vs DP | No disponible | Hugging Face (LeRobot) |
| Política de difusión de referencia (DP) | Diffusion policy | No disponible | No aplica | Base de comparación (1,0×) | No disponible | Referenciada en la model card |
| Otras políticas de LeRobot | Varía (ACT, DP, etc.) | No disponible | No aplica | No disponible | Varía | Hugging Face (LeRobot) |

La información disponible no incluye comparativas detalladas con alternativas concretas; la única referencia explícita es la política de difusión base frente a la que se mide la aceleración.

## Limitaciones y advertencias

- Ámbito muy restringido: entrenado para la tarea `bulb` del dataset ManiFeel; no es un modelo generalista ni transferible sin ajuste a otras tareas o robots.
- Tasa de éxito moderada: 58,5 % implica que aproximadamente 4 de cada 10 episodios no tienen éxito en las condiciones evaluadas (máximo 500 pasos).
- Licencia no disponible: no se declara licencia, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- Sin datos de sesgos ni de robustez: no se documentan evaluaciones fuera de distribución, ni análisis de fallos, ni comportamiento ante cambios de iluminación, textura o posición de objetos.
- Riesgo de sobreajuste al entorno de entrenamiento: al no usar aumento de datos, la generalización a variaciones visuales o táctiles no está garantizada.
- Reproducibilidad parcial: se fija la semilla y se describen las condiciones, pero no se detalla la composición del dataset ni la configuración completa de entrenamiento en la información disponible.
- Sin soporte de lenguaje ni tool calling: no debe emplearse para tareas de texto, razonamiento simbólico o agentes conversacionales.
- Métricas relativas: la aceleración de 1,29× se calcula solo sobre episodios exitosos y como paso medio hasta el primer éxito, por lo que no refleja el rendimiento global en episodios fallidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guitarorangedog/manifeel-ds-bulb
- Dataset: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_bulb
- Código y receta (PR de robo-synapse): https://github.com/kwk2696/robo-synapse/pull/3
- LeRobot (librería): no se proporciona enlace en la información disponible
