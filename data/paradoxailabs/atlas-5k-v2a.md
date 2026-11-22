# PARADOXAIlabs/atlas-5k-v2a

## Resumen

Atlas-5K v2a es un modelo neuronal de predicción espacio-temporal desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de la serie Paradox World Model, concretamente la entrega número 56 de la serie y el modelo 53 de 56 publicados. Su tarea es la predicción de las próximas 24 horas de cinco variables meteorológicas (temperatura, punto de rocío, dirección del viento, velocidad del viento y presión a nivel del mar) en estaciones meteorológicas, con salida cuantílica (tres cuantiles por variable).

El modelo es extremadamente compacto: 968.672 parámetros y un checkpoint de 3,9 MB en formato PyTorch (`.pt`). Se entrenó sobre WEATHER-5K (ICML 2026), un conjunto de 5.672 estaciones meteorológicas de todo el mundo con datos horarios entre 2014 y 2023, y se distribuye con licencia Apache-2.0. La model card lo marca explícitamente como "validation only", es decir, no se ha evaluado en test.

Su relevancia es acotada pero concreta: demuestra que un modelo de menos de un millón de parámetros puede obtener una mejora modesta pero medible (−1,44 % en error de validación) frente a su versión anterior, lo que lo hace interesante como referencia de eficiencia en predicción meteorológica a corto plazo y como ejemplo de la estrategia de "crecimiento" de modelos de la serie (paper "Grow, Don't Restart").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clase `Atlas` del repositorio paradox-world-model; transformer espacio-temporal, detalles no especificados en la información disponible) |
| Parametros totales | 968.672 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada definida por estaciones y ventana temporal; salida fija de 24 horas) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión nativa) |
| Idiomas soportados | no aplica (modelo numérico de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict dentro de un `.pt` (`56_atlas-5k_v2a_weather5k.pt`, 3.905.285 bytes) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se instancia mediante la clase `Atlas` del repositorio `paradox-world-model/atlas`. La firma de inferencia documentada es `model(yc, mc, uc, uf, geo, None, static)`, con salida `q` de forma `[batch, 32 estaciones, 24 horas, 5 variables, 3 cuantiles]`, donde el cuantil mediano `q[..., 1]` constituye la predicción. Esto indica un modelo que procesa simultáneamente 32 estaciones, con entradas que combinan contexto observado, máscaras, variables futuras conocidas y datos geográficos/estáticos.

El entrenamiento se realizó durante 150.000 pasos (único cambio declarado respecto a la versión v1) sobre WEATHER-5K, con datos horarios de 5.672 estaciones entre 2014 y 2023. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo RLHF, DPO o ajuste por cuantiles explícito. La innovación metodológica declarada es la estrategia de crecimiento de modelos descrita en el preprint "Grow, Don't Restart" (paper4), que da nombre a la serie.

## Capacidades

- Predicción de series temporales meteorológicas: próximas 24 horas de temperatura, punto de rocío, dirección del viento, velocidad del viento y presión a nivel del mar.
- Salida probabilística: tres cuantiles por variable y horizonte, lo que permite intervalos de incertidumbre además de la predicción puntual (mediana).
- Procesamiento multiestación: la salida cubre 32 estaciones por lote, lo que sugiere modelado conjunto de dependencias espaciales.
- Condicionamiento en variables estáticas y geográficas (`geo`, `static`), lo que permite incorporar información del emplazamiento de cada estación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo numérico especializado, no un LLM.

## Casos de uso

- Predicción meteorológica a corto plazo en redes de estaciones: el modelo genera las próximas 24 horas para 32 estaciones simultáneamente, útil para alimentar paneles operativos de redes de observación con predicciones cuantílicas.
- Relleno y nowcasting de series de observación: dado el contexto horario reciente, el modelo proyecta las variables para las siguientes 24 horas, lo que permite anticipar huecos o valores esperados en estaciones con datos incompletos.
- Investigación en eficiencia de modelos: con menos de un millón de parámetros y 3,9 MB de checkpoint, sirve como baseline ligero para comparar arquitecturas de predicción espacio-temporal en WEATHER-5K.
- Despliegue en entornos con recursos muy limitados: el tamaño del checkpoint permite ejecución en CPU o en GPUs de gama baja, adecuado para prototipos en dispositivos periféricos o entornos embebidos.
- Evaluación de estrategias de crecimiento de modelos: al ser una iteración de v1 con 150.000 pasos, es útil para reproducir y estudiar la metodología "Grow, Don't Restart" del preprint asociado.
- Generación de escenarios probabilísticos: los tres cuantiles de salida permiten construir intervalos de incertidumbre para variables como velocidad del viento o presión, útiles en estudios de sensibilidad.

## Benchmarks y rendimiento

| Metrica | Atlas-5K v2a | Atlas-5K v1 (referencia) |
|---|---|---|
| Error de validación E | 0,28869 | 0,29292 |
| Mejora relativa | −1,44 % | — |
| Resultado en test | no evaluado ("not yet tested") | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo. Tampoco se dispone de comparaciones con otros modelos de predicción meteorológica.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 3,9 MB y el modelo tiene 968.672 parámetros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch es suficiente (RTX 3060, RTX 4090, A100, H100). Para lotes grandes de 32 estaciones, una GPU consumer modesta es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; también es viable en CPU.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` y la clase `Atlas` del repositorio GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de predicción espacio-temporal ni con alternativas de la misma categoría (por ejemplo, GraphCast, Pangu-Weather u otros). El único punto de comparación documentado es la versión anterior de la propia serie (Atlas-5K v1), con un error de validación de 0,29292 frente a 0,28869 de v2a.

## Limitaciones y advertencias

- Estado "validation only": el modelo no ha sido evaluado en test, por lo que su rendimiento fuera de validación es desconocido.
- Especialización estrecha: solo predice cinco variables meteorológicas a 24 horas en estaciones; no es un modelo de propósito general ni un LLM.
- Sin información sobre sesgos: no se documentan sesgos geográficos, estacionales ni de cobertura de estaciones, aunque el dataset WEATHER-5K cubre 5.672 estaciones mundiales con posible desbalance regional.
- Riesgo de error en condiciones extremas: no se documenta comportamiento en eventos meteorológicos extremos ni en estaciones con datos escasos.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda citar según `CITATION.cff` y revisar `DATA_SOURCES.md` para las condiciones de los datos de entrenamiento (no incluidos en el repositorio).
- Dependencia del código del repositorio: la carga requiere clonar `paradox-world-model` y usar la clase `Atlas`; no hay una interfaz de inferencia empaquetada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado, sin evidencia de uso independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-5k-v2a
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- README de la serie Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Preprint "Grow, Don't Restart": https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/paper4/Atlas5K_growth_preprint.pdf
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Versión anterior (Atlas-5K v1): https://huggingface.co/PARADOXAIlabs/atlas-5k-v1
- Versión siguiente (Atlas-5K v2c): https://huggingface.co/PARADOXAIlabs/atlas-5k-v2c
- Serie completa: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
