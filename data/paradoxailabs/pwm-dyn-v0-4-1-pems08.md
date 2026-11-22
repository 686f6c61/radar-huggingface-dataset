# PARADOXAIlabs/pwm-dyn-v0.4.1-pems08

## Resumen

PWM-Dyn v0.4.1 (identificador `pwm-dyn-v0.4.1-pems08`) es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Concretamente, es el modelo numero 5 de 56 publicados en la familia PWM-Dyn, y su tarea especifica es predecir los siguientes 12 pasos de flujo de trafico sobre el conjunto de datos PEMS08 (distrito 8 de Caltrans, San Bernardino, 170 sensores, julio-agosto de 2016).

Se trata de un modelo muy pequeno, de solo 318.148 parametros, entrenado desde cero con PyTorch y distribuido como un unico checkpoint `.pt` de aproximadamente 1,3 MB. No es un modelo de lenguaje ni un transformer generativo de proposito general: es un modelo especializado de forecasting que se carga mediante `torch.load` y cuyo state dict se encuentra en la clave `weights` del checkpoint. Su relevancia radica en su caracter reproducible y de bajo coste: el autor documenta la receta de entrenamiento, los resultados por semilla y el codigo de arquitectura en un repositorio publico, lo que facilita la verificacion independiente.

La version v0.4.1 se libero el 17 de noviembre de 2026 y su entrenamiento se realizo el 1 de noviembre de 2026 en un notebook de Kaggle. El cambio principal respecto a la version anterior es la seleccion de una receta de entrenamiento basada en validacion sobre PEMS08 (100 epocas), que mejoro el resultado de Track B en PEMS08 de 14,38 a 14,15. El resultado registrado en ParadoxBench-1 Track A es un MAE de 14,50 con un ensemble de 3 semillas (el archivo publicado corresponde a la semilla 0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub; configuracion en `ck['cfg']`) |
| Parametros totales | 318.148 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea fija: prediccion de los siguientes 12 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en punto flotante; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo no linguistico; opera sobre series numericas de trafico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de etiquetarla como parte de la familia "PWM-Dyn" (Paradox World Model, rama dinamica) y de indicar que el codigo esta en el repositorio de GitHub `paradoxailab/paradox-world-model`. La configuracion exacta con la que se entreno el modelo se almacena dentro del propio checkpoint en la clave `cfg`, por lo que puede inspeccionarse tras la descarga. El tamano de 318.148 parametros sugiere una red compacta, adecuada para un conjunto de 170 sensores y una tarea de horizonte corto (12 pasos).

El entrenamiento se realizo el 1 de noviembre de 2026 en un notebook de Kaggle (identificador `ab27dd6f3e`, version 364348754) durante 100 epocas, con la receta seleccionada a partir de la validacion sobre PEMS08. Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y terminos se documentan en `DATA_SOURCES.md`. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, lo cual es coherente con un modelo de forecasting supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Prediccion de series temporales multivariantes: genera los siguientes 12 pasos de flujo de trafico a partir del historico de 170 sensores.
- Modelado espaciotemporal: la etiqueta `spatiotemporal` y el diseno sobre PEMS08 indican que el modelo explota dependencias entre sensores adyacentes en la red viaria.
- Forecasting de trafico a corto plazo: caso de uso central declarado en la model card (`traffic-forecasting`).
- Ensemble por semillas: el autor reporta resultados con un ensemble de 3 semillas, lo que permite combinar predicciones para reducir el error.
- Inspeccion de resultados y configuracion: el checkpoint incluye `meta`, `results` (todos los resultados registrados, texto del record y logs de ejecucion) y `cfg`.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling, agentes ni multilingueismo.

## Casos de uso

- Prediccion de trafico en tiempo real para paneles de control: el modelo toma el historico reciente de los 170 sensores del distrito 8 y devuelve los proximos 12 pasos, util para anticipar congestiones con antelacion de minutos.
- Enrutamiento dinamico y sistemas de navegacion: integrar las predicciones de flujo en un motor de rutas para ajustar estimaciones de tiempo de llegada segun la congestion prevista.
- Gestion de semaforos y rampas de acceso: usar los 12 pasos de prediccion como entrada a un controlador de trafico que module ciclos o limites de acceso en funcion del flujo esperado.
- Investigacion academica reproducible: el modelo sirve como baseline ligero y verificable (318 K parametros, licencia Apache-2.0, codigo y receta publicados) para comparar nuevas arquitecturas de forecasting espaciotemporal sobre PEMS08.
- Deteccion de anomalias en la red viaria: comparar el flujo observado con la prediccion del modelo para identificar incidentes o caidas de sensores.
- Despliegue en dispositivos de borde: con 1,3 MB de checkpoint y 318 K parametros, el modelo puede ejecutarse en hardware modesto (incluso CPU) en cabinas de campo o gateways de carretera.
- Simulacion y planificacion de escenarios: alimentar simuladores de trafico con predicciones de flujo bajo distintas condiciones historicas de PEMS08.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1 Track A (test) | MAE | 14,50 | Ensemble de 3 semillas; el archivo publicado es la semilla 0 |
| ParadoxBench-1 Track B (PEMS08, validacion) | MAE | 14,15 | Mejora desde 14,38 en v0.4 |
| ParadoxBench-1 Track B (PEMS08, validacion, version previa v0.4) | MAE | 14,38 | Referencia de la version anterior |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (por ejemplo, STGCN, Graph WaveNet, DCRNN o modelos de series temporales genericos) sobre PEMS08.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (checkpoint de 1,3 MB y 318 K parametros); cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con al menos 1 GB de memoria es suficiente. Para produccion a gran escala se puede usar cualquier acelerador moderno, pero el cuello de botella sera el preprocesado de sensores, no el modelo.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050, RTX 3050, RTX 4090, etc.), y tambien en CPU y en dispositivos de borde.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` con `weights_only=False`) y `huggingface_hub.hf_hub_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no aplican a este checkpoint.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dado el tamano, se espera latencia de milisegundos en CPU y sub-milisegundo en GPU para un lote pequeno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.4.1 (este) | 318.148 | 12 pasos | Forecasting de trafico PEMS08 | Apache-2.0 | Hugging Face + GitHub |
| PWM-Dyn v0.4 (version previa) | no disponible | 12 pasos | Forecasting de trafico | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.4.1 PEMS04 (version hermana) | no disponible | 12 pasos | Forecasting de trafico PEMS04 | Apache-2.0 | Hugging Face |
| Otros modelos de forecasting espaciotemporal (STGCN, Graph WaveNet, DCRNN, etc.) | no disponible | no disponible | Forecasting de trafico | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos sobre PEMS08, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo altamente especializado: solo predice los siguientes 12 pasos de flujo de trafico sobre la topologia de PEMS08 (170 sensores del distrito 8 de Caltrans); no es reutilizable directamente en otras ciudades o redes sin reentrenamiento.
- Dependencia de los datos de entrenamiento: los datos no se distribuyen con el modelo y sus terminos se documentan en `DATA_SOURCES.md`; es responsabilidad del usuario verificar el cumplimiento de las condiciones de Caltrans PeMS.
- Riesgo de alucinacion en sentido estricto no aplica (no es generativo de lenguaje), pero si existe riesgo de predicciones erroneas ante eventos no vistos (incidentes, obras, condiciones meteorologicas extremas) no representados en el periodo julio-agosto de 2016.
- Sesgo temporal y geografico: el modelo se entreno con dos meses de verano de 2016 en una region concreta; su rendimiento puede degradarse fuera de ese regimen estacional o ante cambios en la red viaria.
- Sin datos publicados de robustez, calibracion de incertidumbre ni intervalos de confianza; el unico resultado reportado es un MAE puntual.
- El checkpoint se carga con `weights_only=False`, lo que implica ejecutar codigo de deserializacion de PyTorch; conviene hacerlo solo desde la fuente oficial y verificar el SHA-256 publicado.
- El resultado principal (MAE 14,50) corresponde a un ensemble de 3 semillas, pero el archivo publicado es solo la semilla 0; para reproducir el numero hay que obtener las otras semillas de la serie.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no obstante, el modelo no incluye garantias de ningun tipo.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no opera sobre texto.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4.1-pems08
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Reglas y benchmark v0.4: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.4-paradoxbench/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Version anterior (#04): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4-imd_west_coast
- Version siguiente (#06): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4.1-pems04
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
