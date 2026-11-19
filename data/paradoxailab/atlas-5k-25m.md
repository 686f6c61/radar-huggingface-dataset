# paradoxailab/atlas-5k-25m

## Resumen

Atlas-5K 25M es un modelo de prediccion espacio-temporal de series temporales meteorologicas desarrollado por ParadoxAI Lab, enmarcado en su serie Paradox World Model (modelo 56 de 56 publicados). Su tarea es predecir las proximas 24 horas de cinco variables meteorologicas (temperatura, punto de rocio, direccion del viento, velocidad del viento y presion a nivel del mar) en estaciones meteorologicas. El modelo tiene 24.103.796 parametros y se entrenó sobre WEATHER-5K (ICML 2026), un conjunto de 5.672 estaciones meteorologicas de todo el mundo con datos horarios entre 2014 y 2023.

Esta version "adoptada" es el resultado de hacer crecer el modelo anterior (#58, de 10M de parametros) hasta 24,1M ampliando las capas ocultas de 784 a 1.960 unidades y anadiendo un bloque encoder, seguido de 80.000 pasos adicionales de entrenamiento a una tasa de aprendizaje maxima de 2e-4. La innovacion metodologica declarada es la estrategia de crecimiento "Grow, Don't Restart", descrita en el preprint del propio autor.

El modelo es relevante en el nicho de forecasting meteorologico a corto plazo con modelos ligeros: el autor reporta mejoras frente a PhysicsFormer en 4 de 5 variables y victorias significativas frente a 20 de 20 oponentes-periodo en una comparacion head-to-head con 709 estaciones. Se distribuye bajo licencia Apache-2.0 como un checkpoint PyTorch de unos 96,5 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo PyTorch; la model card menciona "hidden layer of every block" y "encoder block", sin detallar la arquitectura completa) |
| Parametros totales | 24.103.796 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de prediccion de 24 horas; contexto de entrada no especificado) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en punto flotante; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo numerico de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict dentro de un dict con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de que el modelo se construye con una clase `Atlas` del repositorio GitHub del autor y que consta de bloques con capas ocultas y al menos un bloque encoder. La salida es un tensor `q` de forma `[batch, 32 estaciones, 24 horas, 5 variables, 3 cuantiles]`, lo que indica una cabeza de prediccion cuantilica (tres cuantiles por variable y horizonte), siendo la mediana `q[..., 1]` la prediccion puntual. La entrada combina variables objetivo, mascaras de contexto, entradas futuras, informacion geografica y variables estaticas.

El entrenamiento se realizo el 2026-11-18 en Google Colab: pasos 0-8.000 en una A100 y pasos 8.000-80.000 en una L4, con evaluacion final en una A100-40GB. Los datos son WEATHER-5K (ICML 2026): 5.672 estaciones, frecuencia horaria, periodo 2014-2023. Esta version concreta parte del checkpoint de 10M y aplica crecimiento de parametros (capas ocultas de 784 a 1.960 unidades con unidades nuevas inicializadas a salida cero, mas un bloque encoder adicional) manteniendo las predicciones iniciales, y despues se reentrena con 80.000 pasos a learning rate pico 2e-4. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni composicion exacta del dataset mas alla de la fuente.

## Capacidades

- Prediccion de las proximas 24 horas de temperatura, punto de rocio, direccion del viento, velocidad del viento y presion a nivel del mar en estaciones meteorologicas.
- Prediccion probabilistica mediante tres cuantiles por variable y horizonte (la mediana es la prediccion puntual).
- Modelado conjunto de multiples estaciones (tensor de 32 estaciones por lote) con informacion geografica y variables estaticas.
- Forecasting espacio-temporal con contexto horario (datos de entrada horarios).
- Evaluacion head-to-head frente a modelos de series temporales y meteorologicos (TimesFM 2.5/3.0, Chronos-2, Chronos-Bolt, TiRex, Sundial, Time-MoE, TTM, persistencia).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas: es un modelo numerico de series temporales.

## Casos de uso

- Prediccion meteorologica a corto plazo en estaciones: el modelo genera las proximas 24 horas de cinco variables a partir del contexto horario, adecuado para alimentar paneles de prevision local con resolucion horaria.
- Downscaling y correccion de previsiones en redes de estaciones: al modelar 32 estaciones por lote con informacion geografica, puede usarse para producir previsiones consistentes espacialmente en una region.
- Gestion de energia y demanda: la prediccion de temperatura y velocidad del viento a 24 horas sirve como entrada para modelos de demanda electrica y de generacion eolica a corto plazo.
- Agricultura de precision: la prediccion de punto de rocio y temperatura ayuda a anticipar heladas y condiciones de humedad en parcelas monitorizadas por estaciones cercanas.
- Aviacion y operaciones de campo: la prevision de direccion y velocidad del viento y presion a nivel del mar a 24 horas es util para planificacion de operaciones sensibles al viento.
- Investigacion en forecasting: al ser un modelo ligero (24,1M de parametros, checkpoint de 96,5 MB) y con licencia Apache-2.0, sirve como baseline reproducible para comparar metodos de series temporales espacio-temporales.
- Prototipado en entornos con recursos limitados: el checkpoint cabe en memoria de una GPU consumer y se puede cargar en CPU con `torch.load`, lo que facilita experimentos sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Validation E | 0.27307 (-1,03% vs 10M, modelo #58) |
| Test 2023 MAE temperatura | 1.400 |
| Test 2023 MAE punto de rocio | 1.468 |
| Test 2023 MAE direccion del viento | 53.33 |
| Test 2023 MAE velocidad del viento | 1.173 |
| Test 2023 MAE presion a nivel del mar | 1.473 |

Comparaciones declaradas: mejor que PhysicsFormer (19,3M) en 4 de 5 variables; no supera a ECMWF-HRES en presion; victorias significativas en las cinco variables frente a 20 de 20 oponentes-periodo (TimesFM 2.5/3.0, Chronos-2, Chronos-Bolt, TiRex, Sundial, Time-MoE, TTM, persistencia) en una comparacion head-to-head con 709 estaciones (test 2023 y datos en vivo 2024-25).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 96.529.467 bytes (~92 MB); con 24,1M de parametros en fp32 la inferencia requiere menos de 1 GB de VRAM, incluyendo overhead de framework.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el autor entreno en A100 y L4, pero la inferencia es viable en GPUs consumer.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo). El despliegue se realiza cargando el checkpoint con `torch.load` y construyendo la clase `Atlas` del repositorio GitHub.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-5K 25M | 24,1M | Forecasting meteorologico 24 h, 5 variables | no disponible | Apache-2.0 | Hugging Face (checkpoint PyTorch) |
| Atlas-5K 10M (#58) | ~10M | Forecasting meteorologico 24 h, 5 variables | no disponible | Apache-2.0 | Hugging Face |
| PhysicsFormer | 19,3M | Forecasting meteorologico | no disponible | no disponible | no disponible |
| TimesFM 2.5/3.0 | no disponible | Forecasting de series temporales | no disponible | no disponible | no disponible |
| Chronos-2 / Chronos-Bolt | no disponible | Forecasting de series temporales | no disponible | no disponible | no disponible |

El autor reporta que Atlas-5K 25M supera a PhysicsFormer en 4 de 5 variables y gana en las cinco variables frente a TimesFM, Chronos, TiRex, Sundial, Time-MoE, TTM y persistencia en la comparacion head-to-head, pero no aporta en la model card los numeros completos de esos oponentes.

## Limitaciones y advertencias

- Modelo de dominio especifico: solo predice cinco variables meteorologicas en estaciones; no es un modelo de lenguaje ni sirve para tareas generales.
- Dependencia de la disponibilidad y calidad de datos de estaciones: la prediccion se limita a estaciones con contexto horario y variables estaticas/geograficas coherentes con el formato de entrada.
- No supera a ECMWF-HRES en presion a nivel del mar, segun el propio autor.
- Los resultados de benchmarks son declarados por el autor y no se han verificado de forma independiente; la model card no incluye los numeros completos de los oponentes.
- No se documentan sesgos especificos, pero al entrenar sobre 5.672 estaciones la cobertura geografica puede ser desigual y afectar a regiones con menor densidad de estaciones.
- Riesgo de error en eventos extremos: no se documenta el comportamiento del modelo ante fenomenos meteorologicos extremos fuera de la distribucion de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero se debe citar segun CITATION.cff y respetar los terminos de las fuentes de datos (DATA_SOURCES.md), que no se distribuyen con el modelo.
- El checkpoint se carga con `weights_only=False` en `torch.load`, lo que requiere confiar en el origen del fichero; conviene verificar el SHA-256 indicado en la model card.
- No hay informacion sobre cuantizacion, latencia ni throughput en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-5k-25m
- Modelo anterior (#58, 10M): https://huggingface.co/paradoxailab/atlas-5k-10m
- Indice de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- README del proyecto Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie en GitHub: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Preprint "Grow, Don't Restart": https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/paper4/Atlas5K_growth_preprint.pdf
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Web del autor: https://paradoxailab.com
