# PARADOXAIlabs/pwm-dyn-v0.4.1-pems04

## Resumen

PWM-Dyn v0.4.1 (identificador `pwm-dyn-v0.4.1-pems04`) es un modelo de prediccion de series temporales espacio-temporales desarrollado por ParadoxAI Lab dentro de su linea Paradox World Model, concretamente la entrega numero 06 de una serie de 56 modelos publicados. Su tarea especifica es la prediccion de los siguientes 12 pasos de flujo de trafico sobre el conjunto de datos PEMS04 (Caltrans PeMS District 4, area de la bahia de San Francisco, 307 sensores, enero-febrero de 2018). No es un modelo de lenguaje: es un modelo neuronal especializado de forecasting con 335.684 parametros, entrenado con PyTorch y distribuido como checkpoint `.pt`.

El modelo es relevante en el contexto de la investigacion en modelos del mundo (world models) aplicados a sistemas fisicos, y como referencia reproducible de bajo coste computacional para benchmarks de prediccion de trafico. Su tamano es minimo (el fichero pesa 1,37 MB), lo que lo hace ejecutable en CPU sin dificultad. Se distribuye con licencia Apache-2.0 y con la configuracion de entrenamiento embebida en el propio checkpoint (`ck['cfg']`), lo que facilita su reproduccion.

La version v0.4.1 se distingue de la v0.4.1 anterior (PEMS08) por haber seleccionado la receta de entrenamiento sobre la validacion de PEMS08 (100 epocas), mejorando el resultado de Track B PEMS08 de 14,38 a 14,15. El resultado registrado para este checkpoint es un MAE de 19,02 en el test de ParadoxBench-1 Track A, obtenido con un ensemble de 3 semillas; este fichero concreto corresponde a la semilla 0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del autor; configuracion en `ck['cfg']`) |
| Parametros totales | 335.684 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de prediccion de 12 pasos; longitud de entrada no especificada) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision nativa) |
| Idiomas soportados | no disponible (modelo numerico de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (fichero `06_pwm-dyn_v0.4.1_PEMS04.pt`, 1.369.279 bytes) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo; indica que el codigo de la arquitectura de esta version se encuentra en el repositorio de GitHub del autor y que la configuracion exacta de entrenamiento esta almacenada en el propio checkpoint bajo la clave `ck['cfg']`. Por los tags (`spatiotemporal`, `traffic-forecasting`) y la tarea (prediccion de 12 pasos sobre 307 sensores), se trata de un modelo espacio-temporal para grafos de sensores, pero no se dispone de informacion confirmada sobre si emplea convoluciones de grafo, mecanismos de atencion u otra familia concreta.

El entrenamiento se realizo sobre PEMS04 (307 sensores, datos de enero a febrero de 2018) y la receta se selecciono sobre la validacion de PEMS08 con 100 epocas. El entrenamiento se ejecuto en un cuaderno de Kaggle (version 364348754) el 1 de noviembre de 2026, y el modelo se publico el 17 de noviembre de 2026. No se especifica el numero de tokens ni la composicion exacta del dataset mas alla de la fuente citada; los terminos y fuentes de los datos de entrenamiento se remiten a `DATA_SOURCES.md` en el repositorio.

## Capacidades

- Prediccion de series temporales espacio-temporales: genera los siguientes 12 pasos de flujo de trafico a partir de observaciones de una red de 307 sensores.
- Modelado de dependencias espaciales entre sensores y dependencias temporales entre pasos.
- Forecasting multi-horizonte fijo (12 pasos), adecuado para planificacion a corto plazo.
- Inferencia en CPU: el tamano del checkpoint (1,37 MB) permite ejecucion sin GPU.
- Reproducibilidad: la configuracion de entrenamiento viaja dentro del checkpoint (`ck['cfg']`) y los resultados registrados en `ck['results']`.
- No soporta tool calling, function calling, agentes, vision, audio ni capacidades multilingues; no es un modelo generativo de texto.

## Casos de uso

- Prediccion de trafico a corto plazo en autopistas: el modelo estima los 12 pasos siguientes de flujo en los 307 sensores de PeMS District 4, util para paneles de control de trafico y avisos de congestion con antelacion de decenas de minutos.
- Investigacion y benchmarking de modelos espacio-temporales: sirve como linea base reproducible (MAE 19,02 en ParadoxBench-1 Track A) para comparar nuevas arquitecturas sobre PEMS04 con un coste de entrenamiento minimo.
- Prototipado rapido en entornos sin GPU: al pesar 1,37 MB y ejecutarse en CPU, permite integrar predicciones en cuadernos, scripts o servicios ligeros sin infraestructura dedicada.
- Simulacion y modelos del mundo para sistemas fisicos: encaja en pipelines de investigacion que estudian la capacidad de modelos pequenos para anticipar dinamicas de redes de sensores.
- Educacion y docencia: ejemplo completo y ligero de un flujo de forecasting con checkpoint, configuracion y resultados embebidos, util para ensenar el ciclo completo de entrenamiento y evaluacion.
- Ensemble de bajo coste: al ser un modelo de 335.684 parametros, es viable desplegar ensembles de varias semillas (el resultado reportado usa 3 semillas) para reducir varianza en la prediccion.
- Validacion de pipelines de datos de trafico: sirve para verificar la integridad y el preprocesado de datos PeMS antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1 Track A (PEMS04) | MAE | 19,02 | Ensemble de 3 semillas; este fichero es la semilla 0 |
| ParadoxBench-1 Track B (PEMS08) | Metrica no especificada | 14,15 | Resultado de la receta v0.4.1 (mejora desde 14,38) |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros no aplican a este modelo). Los unicos datos de rendimiento son los registrados por el autor en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el checkpoint ocupa 1,37 MB y el modelo tiene 335.684 parametros, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU. Cualquier GPU moderna (RTX 3060 o superior) es mas que suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en cualquier modelo, incluidos integrados.
- Opciones de despliegue: PyTorch nativo (`torch.load` con `weights_only=False`) y descarga via `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.4.1 PEMS04 (este) | 335.684 | 12 pasos | Forecasting de trafico PEMS04 | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.4.1 PEMS08 (#05, mismo autor) | no disponible | 12 pasos | Forecasting de trafico PEMS08 | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.6 PEMS08 (#07, mismo autor) | no disponible | no disponible | Forecasting de trafico PEMS08 | Apache-2.0 | Hugging Face |

No se dispone de informacion sobre modelos de terceros comparables (por ejemplo, arquitecturas espacio-temporales clasicas sobre PEMS04) en la documentacion proporcionada; no se aportan datos de rendimiento de esos modelos para una comparacion rigurosa.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente sobre PEMS04 (307 sensores, enero-febrero de 2018); no se garantiza su generalizacion a otras redes, ciudades o periodos temporales.
- Horizonte fijo de 12 pasos: no admite configuracion de horizontes distintos sin reentrenamiento o adaptacion.
- Tamano minimo: con 335.684 parametros, la capacidad de modelado es limitada y puede no capturar eventos anomalos o regimenes no vistos.
- Sin informacion sobre sesgos: la model card no documenta sesgos; al operar sobre datos de trafico, puede heredar sesgos de la red de sensores (cobertura geografica, dias laborables frente a fines de semana).
- Riesgo de error en predicciones: el MAE reportado (19,02) implica un error medio no despreciable; no debe usarse como unica fuente para decisiones criticas de seguridad vial.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar `DATA_SOURCES.md` por si los datos de entrenamiento imponen terminos adicionales.
- Estado "reported": el autor etiqueta el modelo como reportado, no verificado de forma independiente; los resultados deben tratarse con cautela hasta su reproduccion.
- Sin soporte linguistico ni generativo: no es apto para tareas de texto, codigo, vision o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4.1-pems04
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Benchmark ParadoxBench v0.4: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.4-paradoxbench/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#05, PEMS08): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4.1-pems08
- Modelo siguiente (#07, v0.6 PEMS08): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems08
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
