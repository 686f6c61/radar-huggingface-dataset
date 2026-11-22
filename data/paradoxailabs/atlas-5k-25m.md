# PARADOXAIlabs/atlas-5k-25m

## Resumen

Atlas-5K 25M es un modelo neuronal especializado en predicción meteorológica a corto plazo (nowcasting determinista a 24 horas) desarrollado por ParadoxAI Lab dentro de su serie Paradox World Model, en concreto la entrega número 59 (modelo 56 de 56 publicados). El modelo pronostica cinco variables meteorológicas en estaciones: temperatura, punto de rocío, dirección del viento, velocidad del viento y presión a nivel del mar, con un horizonte de 24 horas y resolución horaria. Cuenta con 24.103.796 parámetros y se distribuye bajo licencia Apache-2.0.

El modelo se entrenó sobre WEATHER-5K, un conjunto de datos presentado en ICML 2026 que reúne 5.672 estaciones meteorológicas de todo el mundo con datos horarios entre 2014 y 2023. La versión 25M es una ampliación de la anterior Atlas-5K 10M (#58): se incrementó la anchura de las capas ocultas de cada bloque (de 784 a 1.960 unidades, con unidades nuevas inicializadas a cero) y se añadió un bloque encoder, manteniendo los mismos pronósticos al inicio del reentrenamiento y aplicando 80.000 pasos adicionales a una tasa de aprendizaje máxima de 2e-4.

Su relevancia radica en que, pese a su tamaño reducido (apto para inferencia en GPU de consumo), el autor reporta victorias estadísticamente significativas frente a 20 de 20 modelos rivales (TimesFM 2.5/3.0, Chronos-2, Chronos-Bolt, TiRex, Sundial, Time-MoE, TTM y persistencia) en las cinco variables, sobre 709 estaciones en test 2023 y en vivo 2024-25. No supera a ECMWF-HRES en presión, según la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal PyTorch tipo Atlas (encoder por bloques con capas ocultas de 1.960 unidades); arquitectura exacta no detallada en la informacion disponible |
| Parametros totales | 24.103.796 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por ventana de estaciones y horizonte fijo de 24 h) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch, sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible (modelo numerico de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict dentro de un checkpoint `.pt` (`59_atlas-5k-25m_weather5k_adopted.pt`, 96.529.467 bytes) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal implementada en PyTorch bajo la clase `Atlas` del repositorio `paradox-world-model/atlas`. El modelo procesa entradas por estaciones (batch, estaciones, variables, tiempo) y devuelve cuantiles (3 cuantiles por variable y horizonte); la mediana `q[..., 1]` constituye el pronostico. La version 25M amplia la version 10M (#58) aumentando la capa oculta de cada bloque de 784 a 1.960 unidades (con inicializacion a cero de las unidades nuevas para preservar los pronosticos iniciales) y anadiendo un bloque encoder. No se detalla en la informacion disponible si emplea atencion, convoluciones o mecanismos hibridos.

El entrenamiento se realizo en Google Colab: pasos 0-8.000 en una A100 y pasos 8.000-80.000 en una L4, con evaluacion final en una A100-40GB, a una tasa de aprendizaje maxima de 2e-4. Los datos de entrenamiento (WEATHER-5K, 5.672 estaciones, horario 2014-2023) no se distribuyen con el modelo; sus fuentes y terminos estan en `DATA_SOURCES.md`. No se especifica en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa (no aplicables a un modelo de regresion de series temporales).

## Capacidades

- Pronostico determinista a 24 horas de cinco variables meteorologicas en estaciones: temperatura, punto de rocio, direccion del viento, velocidad del viento y presion a nivel del mar.
- Salida cuantilica (3 cuantiles por variable y hora), lo que permite obtener intervalos de incertidumbre ademas del pronostico mediano.
- Procesamiento conjunto de multiples estaciones (el ejemplo de carga usa 32 estaciones por lote) con entradas geoespaciales y estaticas.
- Prediccion de series temporales espacio-temporales con resolucion horaria.
- No dispone de generacion de texto, codigo, matematicas, vision, audio, tool calling, agentes ni capacidades multilingues: es un modelo puramente numerico de forecasting.

## Casos de uso

- Nowcasting meteorologico local: el modelo genera el pronostico de las proximas 24 horas en estaciones concretas a partir de observaciones horarias, adecuado para servicios meteorologicos regionales que necesiten una linea base rapida y ligera.
- Relleno de huecos en series historicas: con su salida cuantilica y su entrenamiento sobre 5.672 estaciones, puede emplearse para imputar observaciones faltantes en registros de estaciones con datos incompletos.
- Prediccion de viento para operacion de parques eolicos: la prediccion horaria de velocidad y direccion del viento a 24 h permite planificar la produccion y las maniobras de orientacion de aerogeneradores.
- Gestion de riesgos por presion y temperatura: la prediccion de presion a nivel del mar y temperatura ayuda a anticipar episodios de tiempo severo en estaciones de vigilancia.
- Evaluacion comparativa de modelos de series temporales: al ser un checkpoint pequeno (0,1 GB de repositorio) y con resultados publicados frente a TimesFM, Chronos y Time-MoE, sirve como referencia ligera en benchmarks de forecasting.
- Despliegue en entornos con recursos limitados: sus 24,1 M de parametros permiten ejecutar inferencia en CPU o en GPU de consumo dentro de pipelines de monitorizacion meteorologica en tiempo casi real.
- Investigacion en modelos del mundo (world models): la serie Paradox World Model y su paper "Grow, Don't Restart" lo convierten en un caso de estudio sobre crecimiento de redes sin reinicio del entrenamiento.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (test 2023, MAE):

| Variable | MAE (test 2023) |
|---|---|
| Temperatura (T) | 1,400 |
| Punto de rocio (Td) | 1,468 |
| Direccion del viento (WD) | 53,33 |
| Velocidad del viento (WS) | 1,173 |
| Presion a nivel del mar (SLP) | 1,473 |

- Validacion: E = 0,27307 (-1,03 % frente al modelo de 10M, #58).
- Frente a PhysicsFormer (19,3M): mejor en 4 de 5 variables.
- Frente a ECMWF-HRES: no lo supera en presion.
- Comparacion directa (709 estaciones, test 2023 y en vivo 2024-25): victorias significativas en las cinco variables frente a 20 de 20 periodos-rival (TimesFM 2.5/3.0, Chronos-2, Chronos-Bolt, TiRex, Sundial, Time-MoE, TTM y persistencia).

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa aproximadamente 96,5 MB; en punto flotante de 32 bits la inferencia requiere del orden de 0,1-0,5 GB de VRAM, dependiendo del tamano de lote y del numero de estaciones. Cifra exacta no disponible.
- GPU recomendadas: cualquier GPU moderna; el autor entreno en A100 y L4 y evaluo en A100-40GB, pero el tamano del modelo permite ejecutarlo en GPU de consumo.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.); no se proporcionan mediciones oficiales.
- Opciones de despliegue: PyTorch nativo mediante la clase `Atlas` del repositorio `paradox-world-model/atlas`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-5K 25M | 24,1 M | Pronostico meteorologico 24 h, 5 variables | no disponible | Apache-2.0 | Hugging Face (checkpoint `.pt`) |
| Atlas-5K 10M (#58) | ~10 M (no confirmado) | Igual | no disponible | Apache-2.0 | Hugging Face |
| PhysicsFormer | 19,3 M | Pronostico fisico-meteorologico | no disponible | no disponible | no disponible |
| TimesFM 2.5/3.0 | no disponible | Forecasting de series temporales general | no disponible | no disponible | no disponible |
| Chronos-2 / Chronos-Bolt | no disponible | Forecasting de series temporales general | no disponible | no disponible | no disponible |
| ECMWF-HRES | no disponible (modelo fisico) | Pronostico meteorologico operativo | no disponible | no disponible | Servicio operativo |

Segun la model card, Atlas-5K 25M supera a PhysicsFormer en 4 de 5 variables y a TimesFM, Chronos-2, Chronos-Bolt, TiRex, Sundial, Time-MoE, TTM y persistencia en las cinco variables, pero no a ECMWF-HRES en presion. Los datos detallados de parametros, contexto y licencia de los rivales no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo predice cinco variables meteorologicas en estaciones; no es un modelo de lenguaje ni un modelo multimodal.
- Sesgo geografico potencial: entrenado sobre 5.672 estaciones de todo el mundo, pero sin informacion sobre la distribucion por regiones; el rendimiento puede degradarse en zonas con escasa cobertura.
- Riesgo de error en eventos extremos: no se documenta el comportamiento en fenomenos severos ni la calibracion de los cuantiles.
- No supera al modelo operativo ECMWF-HRES en presion a nivel del mar, segun el propio autor.
- Dependencia del codigo del repositorio: la carga requiere clonar `paradox-world-model` y usar la clase `Atlas`; no hay una API estandar de transformers.
- Los pesos se cargan con `weights_only=False`, lo que implica riesgos de seguridad al deserializar checkpoints no verificados (aunque se publica el SHA-256).
- Datos de entrenamiento no incluidos: la reproducibilidad completa depende de las fuentes externas listadas en `DATA_SOURCES.md`.
- Licencia Apache-2.0: permite uso comercial, pero exige mantener el aviso de copyright y la atribucion correspondiente.
- Resultados reportados por el autor en la model card, sin verificacion independiente en la informacion disponible; el modelo tiene 0 descargas y 1 like en Hugging Face en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-5k-25m
- Modelo anterior (Atlas-5K 10M): https://huggingface.co/PARADOXAIlabs/atlas-5k-10m
- Indice de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- README de Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie en GitHub: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Paper "Grow, Don't Restart": https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/paper4/Atlas5K_growth_preprint.pdf
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Sitio web: https://paradoxailab.com
