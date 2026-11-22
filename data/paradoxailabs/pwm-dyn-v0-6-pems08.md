# PARADOXAIlabs/pwm-dyn-v0.6-pems08

## Resumen

PWM-Dyn v0.6 (identificador `pwm-dyn-v0.6-pems08`) es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) como parte de su serie Paradox World Model. Se trata del septimo modelo publicado de una serie de 56, y su tarea concreta es la prediccion de los siguientes 12 pasos de trafico sobre el conjunto de datos PEMS08 (Caltrans PeMS Distrito 8, San Bernardino; 170 sensores, julio-agosto de 2016).

El modelo es extremadamente compacto: 316.900 parametros totales, con pesos en formato PyTorch (`.pt`) de aproximadamente 1,3 MB. No es un modelo de lenguaje ni un transformer generativo de proposito general, sino un modelo especializado de forecasting con arquitectura propia definida en el repositorio GitHub del proyecto. Su relevancia radica en que, segun la model card, supera a lineas base establecidas como STID, Graph WaveNet y STAEformer en PEMS04, PEMS07, METR-LA y PEMS-BAY en re-ejecuciones, lo que lo situa como una alternativa de muy bajo coste computacional para prediccion de trafico.

La version v0.6 introduce un cambio respecto a v0.4: se elimina la entrada de climatologia, lo que segun el autor corrige la perdida observada en v0.4 y mejora el rendimiento en PEMS08 y PEMS04. El modelo se distribuye bajo licencia Apache-2.0 y esta pensado para inferencia en CPU o GPU de forma trivial dado su tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (codigo en repositorio GitHub; configuracion en `ck['cfg']`) |
| Parametros totales | 316.900 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de entrada no especificada; salida de 12 pasos) |
| Tipos de cuantizacion | No disponible (pesos en punto flotante PyTorch; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | No disponible (modelo numerico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo; indica unicamente que el codigo de la arquitectura de esta version se encuentra en el repositorio GitHub `paradoxailab/paradox-world-model` y que la configuracion de entrenamiento esta embebida en el checkpoint bajo la clave `ck['cfg']`. Por el nombre de la familia (PWM-Dyn, Paradox World Model) y las etiquetas (`spatiotemporal`, `traffic-forecasting`), se trata de un modelo especializado en series temporales con estructura espacial (grafo de sensores) y temporal, pero no se dispone de detalles sobre si emplea capas graph convolution, attention, SSM o una combinacion.

El entrenamiento se realizo el 2026-11-03 en un notebook de Kaggle (version 365009705) sobre el conjunto PEMS08. No se especifica el numero de tokens ni la composicion exacta del dataset mas alla de la descripcion de PEMS08 (170 sensores, julio-agosto de 2016). No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de forecasting. La innovacion tecnica declarada en esta version es la eliminacion de la entrada de climatologia respecto a v0.4, que segun el autor corrige la perdida de rendimiento de esa version.

## Capacidades

- Prediccion de los siguientes 12 pasos temporales de trafico a partir de una ventana de entrada (longitud no especificada).
- Modelado espaciotemporal sobre grafos de sensores (170 sensores en PEMS08).
- Forecasting multivariante de series temporales de trafico (velocidad/flujo/ocupacion, segun el dataset PEMS).
- Evaluacion mediante la metrica MAE en ParadoxBench-1.1 Track A.
- Inferencia en CPU (el ejemplo de carga usa `map_location="cpu"`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de vision/audio.
- No dispone de modo "thinking" ni generacion de texto.

## Casos de uso

- Prediccion a corto plazo de trafico en autopistas: el modelo genera los 12 pasos siguientes (tipicamente 5-60 minutos segun la resolucion de PEMS08) para 170 sensores, adecuado para paneles de control de trafico en tiempo casi real.
- Alerta temprana de congestion: al predecir la evolucion de la velocidad en cada sensor, permite activar avisos antes de que se forme el atasco, con un coste computacional minimo (316.900 parametros).
- Enrutamiento dinamico: integrado en un motor de rutas, puede alimentar estimaciones de tiempo de viaje por tramo actualizando predicciones cada pocos minutos en CPU.
- Investigacion y benchmarking: sirve como linea base ligera frente a STID, Graph WaveNet y STAEformer para experimentos academicos de forecasting espaciotemporal, con licencia Apache-2.0 y pesos reproducibles (SHA-256 documentado).
- Despliegue en dispositivos de borde: su tamano (1,3 MB) permite ejecutarlo en gateways de carretera o Raspberry Pi para inferencia local sin GPU.
- Simulacion y planificacion urbana: alimentar simuladores de trafico con predicciones calibradas sobre PEMS08 para evaluar escenarios de gestion de carriles o semaforos.
- Ensemble de bajo coste: combinar varias semillas (el autor reporta un ensemble de 3 semillas 100-102) para reducir varianza en la prediccion final.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1.1 Track A (PEMS08, test) | MAE | 14.12 | Ensemble de 3 semillas (100-102); este archivo es la semilla 100 |
| PEMS04, PEMS07, METR-LA, PEMS-BAY | No disponible (valores numericos) | Mejor que STID, Graph WaveNet y STAEformer re-ejecutados | Afirmacion cualitativa de la model card sin cifras |

No se han publicado en la informacion disponible los valores numericos de MAE/RMSE/ MAPE para PEMS04, PEMS07, METR-LA ni PEMS-BAY, ni los resultados de las lineas base comparadas. Los resultados completos se remiten a `RESULTS.md` en el repositorio GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (pesos de 1,3 MB mas activaciones minimas); cabe en cualquier GPU consumer.
- GPU recomendadas: ninguna en particular; cualquier GPU con al menos 2 GB (GTX 1050, RTX 3050, RTX 4090, A100, H100) es sobrada. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en modelos integrados.
- Opciones de despliegue: PyTorch nativo (`torch.load`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo). El codigo de arquitectura esta en GitHub.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos en CPU y sub-milisegundo en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.6 (PEMS08) | 316.900 | Salida 12 pasos | MAE 14.12 (ParadoxBench-1.1 Track A, ensemble 3 semillas) | Apache-2.0 | Hugging Face + GitHub |
| STID | No disponible | No disponible | Peor que PWM-Dyn v0.6 segun el autor (re-ejecutado) | No disponible | No disponible |
| Graph WaveNet | No disponible | No disponible | Peor que PWM-Dyn v0.6 segun el autor (re-ejecutado) | No disponible | No disponible |
| STAEformer | No disponible | No disponible | Peor que PWM-Dyn v0.6 segun el autor (re-ejecutado) | No disponible | No disponible |

No se dispone de los parametros, contexto ni cifras de rendimiento de los modelos comparados en la informacion proporcionada; la comparacion se limita a la afirmacion cualitativa del autor de que PWM-Dyn v0.6 supera a STID, Graph WaveNet y STAEformer en re-ejecuciones sobre PEMS04, PEMS07, METR-LA y PEMS-BAY.

## Limitaciones y advertencias

- Especializado exclusivamente en prediccion de trafico sobre PEMS08; no es un modelo de proposito general ni de lenguaje.
- La ventana de entrada y la resolucion temporal no estan documentadas en la model card; es necesario consultar `ck['cfg']` o el repositorio.
- El resultado MAE 14.12 corresponde a un ensemble de 3 semillas; este archivo es solo la semilla 100, por lo que el rendimiento individual puede diferir del reportado.
- La comparacion con STID, Graph WaveNet y STAEformer se presenta de forma cualitativa, sin cifras en la model card; conviene verificar en `RESULTS.md`.
- No se documentan sesgos, riesgos de alucinacion (no aplica en sentido linguistico) ni limitaciones de idioma; el riesgo principal es la extrapolacion a sensores, ciudades o periodos distintos de PEMS08 (julio-agosto 2016).
- Los datos de entrenamiento no se incluyen; sus fuentes y terminos estan en `DATA_SOURCES.md`, lo que puede afectar a la reproducibilidad.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias explicitas de rendimiento en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; ecosistema y validacion externa muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems08
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Conferencia v0.6: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.6-conference/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#06): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4.1-pems04
- Modelo siguiente (#08): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems04
- Serie completa: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
