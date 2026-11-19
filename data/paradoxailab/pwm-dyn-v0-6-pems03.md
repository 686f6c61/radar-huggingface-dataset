# paradoxailab/pwm-dyn-v0.6-pems03

## Resumen

PWM-Dyn v0.6 (identificador `pwm-dyn-v0.6-pems03`) es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab dentro de su serie Paradox World Model, concretamente la entrega numero 9 de 56 publicadas. El modelo resuelve una tarea muy acotada: predecir los siguientes 12 pasos temporales de trafico a partir del dataset PEMS03 (Caltrans PeMS Distrito 3, 358 sensores). Se distribuye como un checkpoint de PyTorch de apenas 340.964 parametros, lo que lo situa en la categoria de modelos ligeros especializados en forecasting de grafos de trafico.

La relevancia del modelo no reside en su tamano ni en capacidades generales, sino en su enfoque de evaluacion: el autor publica resultados comparativos frente a lineas base consolidadas del area (STID, Graph WaveNet, STAEformer) sobre multiples datasets de trafico (PEMS03, PEMS04, PEMS07, PEMS08, METR-LA, PEMS-BAY). Segun la model card, la version v0.6 elimina la entrada de climatologia respecto a versiones anteriores y mejora a v0.3 en PEMS08 y PEMS04, ademas de obtener el mejor resultado en PEMS04, PEMS07, METR-LA y PEMS-BAY frente a las lineas base reejecutadas.

El modelo se publica bajo licencia Apache-2.0, con pesos en formato `.pt` (state dict de PyTorch) y el codigo de arquitectura disponible en el repositorio GitHub del proyecto. No es un modelo de lenguaje: no procesa texto ni dispone de capacidades generativas generales, tool calling ni razonamiento multi-paso. Su ambito es exclusivamente la prediccion numerica de series temporales de trafico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del proyecto; no detallada en la model card) |
| Parametros totales | 340.964 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea de forecasting: 12 pasos de prediccion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (`09_pwm-dyn_v0.6_PEMS03.pt`, 1.391.617 bytes; state dict en `ck["weights"]`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Se trata de un modelo de forecasting espaciotemporal para grafos de sensores de trafico, entrenado sobre PEMS03 (358 sensores del distrito 3 de Caltrans). El checkpoint incluye la configuracion de entrenamiento en `ck['cfg']` y los registros de ejecucion en `ck['results']`, pero la descripcion arquitectonica debe consultarse en el repositorio GitHub del proyecto.

El entrenamiento se realizo el 2026-11-03 en un notebook de Kaggle (identificador `d0ba070ac4`, version 365009705, fechas 2026-11-02/03). El modelo se publico el 2026-11-17 y esta fechado en Hugging Face el 2026-11-18. El cambio principal de la version v0.6 respecto a anteriores es la eliminacion de la entrada de climatologia (que segun la model card era la causa de la perdida en v0.4), lo que mejora los resultados en PEMS08 y PEMS04. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset mas alla de PEMS03, ni si se emplearon tecnicas de RLHF/DPO (no aplicables a este tipo de modelo). Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos se documentan en `DATA_SOURCES.md` del repositorio GitHub.

## Capacidades

- Prediccion de los siguientes 12 pasos temporales de trafico a partir de datos de sensores de PEMS03 (358 sensores).
- Forecasting espaciotemporal sobre grafos de sensores (dependencias espaciales entre sensores y temporales entre pasos).
- Evaluacion comparativa frente a lineas base del area (STID, Graph WaveNet, STAEformer) en seis datasets de trafico.
- Resultado registrado: MAE 14.34 en el test de ParadoxBench-1.1 Track A (ensemble de 3 semillas, semillas frescas 100-102; el archivo publicado corresponde a la semilla 100).
- No dispone de generacion de texto, codigo, matematicas, vision, audio ni capacidades multimodales.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues (es un modelo numerico).

## Casos de uso

- Prediccion de trafico a corto plazo en el distrito 3 de Caltrans: el modelo genera los proximos 12 pasos temporales para los 358 sensores de PEMS03, adecuado para sistemas de gestion de trafico que necesitan horizontes cortos con bajo coste computacional.
- Integracion en pipelines de investigacion en forecasting espaciotemporal: sirve como linea base ligera (340.964 parametros) para comparar nuevas arquitecturas en PEMS03 con la metrica MAE de ParadoxBench-1.1 Track A.
- Reproducibilidad de resultados: al incluir `ck['cfg']` y `ck['results']` con los registros de ejecucion, permite reproducir el entrenamiento y verificar el MAE 14.34 reportado.
- Despliegue en entornos con recursos limitados: su tamano (1,39 MB de checkpoint) permite inferencia en CPU sin GPU dedicada, util para prototipos y validacion en notebooks.
- Ensemble multi-semilla: la model card documenta un ensemble de 3 semillas (100-102) que alcanza el MAE 14.34; este archivo (semilla 100) puede combinarse con los checkpoints de las otras semillas de la serie para replicar el ensemble.
- Estudio de ablacion sobre entradas de climatologia: la version v0.6 elimina la entrada de climatologia respecto a v0.4, lo que la convierte en referencia para analizar el impacto de variables exogenas en el forecasting de trafico.
- Evaluacion cruzada en multiples datasets: la serie incluye checkpoints para PEMS04 (#08), PEMS07 (#10) y otros, permitiendo comparar el mismo diseno en distintos sensores y regiones.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1.1 Track A (test) | MAE | 14,34 | Ensemble de 3 semillas (100-102); este archivo es la semilla 100 |
| PEMS04 | no disponible (valor numerico) | Mejor que v0.3 y que STID/Graph WaveNet/STAEformer reejecutados | Segun model card |
| PEMS07 | no disponible (valor numerico) | Mejor que STID/Graph WaveNet/STAEformer reejecutados | Segun model card |
| PEMS08 | no disponible (valor numerico) | Mejor que v0.3 | Segun model card |
| METR-LA | no disponible (valor numerico) | Mejor que STID/Graph WaveNet/STAEformer reejecutados | Segun model card |
| PEMS-BAY | no disponible (valor numerico) | Mejor que STID/Graph WaveNet/STAEformer reejecutados | Segun model card |

No se han publicado en la informacion disponible los valores numericos concretos de MAE, RMSE o MAPE para PEMS04, PEMS07, PEMS08, METR-LA y PEMS-BAY; solo se indica cualitativamente que supera a las lineas base. Los resultados completos se documentan en `RESULTS.md` y `v0.6-conference/README.md` del repositorio GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 1.391.617 bytes (1,39 MB) y el modelo tiene 340.964 parametros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con al menos 1 GB de VRAM es suficiente (GTX 1050, RTX 3050, RTX 4090, A100, H100). La inferencia en CPU es viable.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (incluidas integradas).
- Opciones de despliegue: PyTorch nativo mediante `torch.load` con `weights_only=False` y descarga via `huggingface_hub.hf_hub_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.6 (PEMS03) | 340.964 | 12 pasos de prediccion; PEMS03 | MAE 14,34 (ParadoxBench-1.1 Track A, ensemble 3 semillas) | Apache-2.0 | Hugging Face (paradoxailab) |
| STID | no disponible | Forecasting espaciotemporal de trafico | Superado por PWM-Dyn v0.6 en PEMS04, PEMS07, METR-LA y PEMS-BAY (reejecutado) | no disponible | no disponible |
| Graph WaveNet | no disponible | Forecasting espaciotemporal de trafico | Superado por PWM-Dyn v0.6 en PEMS04, PEMS07, METR-LA y PEMS-BAY (reejecutado) | no disponible | no disponible |
| STAEformer | no disponible | Forecasting espaciotemporal de trafico | Superado por PWM-Dyn v0.6 en PEMS04, PEMS07, METR-LA y PEMS-BAY (reejecutado) | no disponible | no disponible |

No se dispone de los valores numericos de las lineas base ni de sus recuentos de parametros en la informacion proporcionada; la comparativa se limita a la afirmacion cualitativa de la model card de que PWM-Dyn v0.6 supera a STID, Graph WaveNet y STAEformer reejecutados en PEMS04, PEMS07, METR-LA y PEMS-BAY.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en forecasting de trafico sobre PEMS03; no es un modelo de lenguaje ni de proposito general.
- Los resultados comparativos frente a STID, Graph WaveNet y STAEformer se presentan de forma cualitativa en la model card; los valores numericos no estan disponibles en la informacion proporcionada.
- El MAE 14,34 corresponde a un ensemble de 3 semillas; el archivo publicado es solo la semilla 100, por lo que la inferencia con este checkpoint aislado puede no reproducir exactamente dicho resultado.
- Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos se documentan en `DATA_SOURCES.md`, lo que limita la auditoria directa del dataset.
- La arquitectura no esta descrita en la model card; debe consultarse el repositorio GitHub para evaluar decisiones de diseno.
- Riesgo de sobreajuste a la distribucion de PEMS03 (358 sensores del distrito 3 de Caltrans); la generalizacion a otras regiones o regimenes de trafico no esta documentada.
- No se documentan sesgos conocidos, riesgos de alucinacion (no aplicable a un modelo numerico) ni limitaciones de idioma.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no se especifican restricciones adicionales.
- Estado del modelo: "reported" segun la model card; no se indica validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems03
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados completos: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- README de la conferencia v0.6: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.6-conference/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#08, PEMS04): https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems04
- Modelo siguiente (#10, PEMS07): https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems07
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
