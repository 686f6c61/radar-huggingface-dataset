# paradoxailab/pwm-dyn-v0.6-pems-bay

## Resumen

PWM-Dyn v0.6 (PEMS-BAY) es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Concreto, es el modelo numero 12 de los 56 publicados en la serie (numeros 01-59) y pertenece a la familia PWM-Dyn. Su tarea es predecir los siguientes 12 pasos temporales de trafico sobre la red de 325 sensores de PEMS-BAY en el area de la bahia de San Francisco.

Se trata de un modelo extremadamente compacto: 336.740 parametros en total, entrenado en un cuaderno de Kaggle y publicado en formato PyTorch. No es un modelo de lenguaje ni un transformer generativo de proposito general; es un modelo especializado de forecasting espaciotemporal con licencia Apache-2.0, lo que lo hace atractivo para integrarlo en pipelines de movilidad urbana sin restricciones de uso comercial.

La relevancia de esta version radica en su cambio respecto a versiones anteriores: la eliminacion de la entrada de climatologia (que era la perdida de la v0.4), lo que segun el autor le permite superar a la v0.3 en PEMS08 y PEMS04 y obtener los mejores resultados frente a re-ejecuciones de STID, Graph WaveNet y STAEformer en PEMS04, PEMS07, METR-LA y PEMS-BAY. El modelo reporta un MAE de 1.52 en ParadoxBench-1.1 Track A test con un ensemble de 3 semillas (este archivo es la semilla 100).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub; configuracion en `ck['cfg']`) |
| Parametros totales | 336.740 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de prediccion: 12 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, 1.374.819 bytes) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de clasificarla como modelo de forecasting espaciotemporal de la familia PWM-Dyn. El codigo de arquitectura de esta version se encuentra en el repositorio GitHub de ParadoxAI Lab y la configuracion de entrenamiento concreta esta almacenada dentro del propio checkpoint (campo `ck['cfg']`). El modelo opera sobre la red de 325 sensores de PEMS-BAY y produce 12 pasos de prediccion futura.

El entrenamiento se realizo el 2026-11-03 en un cuaderno de Kaggle (notebook `d0ba070ac4`, version 365009705), con datos de 2026-11-02/03, y el modelo se publico el 2026-11-17. El cambio tecnico documentado respecto a versiones previas es la eliminacion de la entrada de climatologia, que habia sido la causa de la perdida en la v0.4. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF/DPO (poco probables en un modelo de forecasting de este tamano). Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y terminos se documentan en `DATA_SOURCES.md` del repositorio.

## Capacidades

- Prediccion de trafico a corto plazo: genera los siguientes 12 pasos temporales de trafico a partir de observaciones historicas de la red de 325 sensores de PEMS-BAY.
- Modelado espaciotemporal: captura dependencias entre sensores distribuidos geograficamente y su evolucion temporal.
- Forecasting multivariante: trabaja con series temporales de multiples sensores de forma conjunta.
- Evaluacion comparativa: el autor reporta resultados frente a STID, Graph WaveNet y STAEformer en PEMS04, PEMS07, METR-LA y PEMS-BAY.
- Ensemble: el resultado reportado (MAE 1.52) corresponde a un ensemble de 3 semillas (100-102); el archivo publicado es la semilla 100.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Prediccion de congestion en tiempo real: el modelo puede generar los proximos 12 pasos de trafico sobre los 325 sensores de PEMS-BAY, alimentando paneles de control de movilidad urbana con previsiones a corto plazo.
- Planificacion de rutas dinamica: integrado en un sistema de navegacion, permite estimar la evolucion del trafico en los proximos pasos y ajustar rutas antes de que se produzcan atascos.
- Gestion semaforica adaptativa: las predicciones a 12 pasos pueden informar ajustes de tiempos de semaforo en corredores de la bahia de San Francisco.
- Investigacion academica en forecasting espaciotemporal: al ser un modelo pequeno (336.740 parametros) y con licencia Apache-2.0, sirve como baseline reproducible para comparar metodos de grafos o transformers en PEMS-BAY.
- Despliegue en infraestructura de bajo coste: su tamano minimo permite ejecutar inferencia en CPU o GPU consumer, lo que facilita pilotos en entornos con recursos limitados.
- Deteccion de anomalias en redes de transporte: comparar la prediccion con la observacion real permite identificar desviaciones (incidentes, cortes, eventos) en los sensores monitorizados.
- Simulacion y gemelos digitales de movilidad: las predicciones pueden alimentar simuladores de trafico urbano para escenarios de demanda y evaluacion de politicas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| ParadoxBench-1.1 Track A test MAE | 1.52 | Ensemble de 3 semillas (100-102); este archivo es la semilla 100 |
| PEMS04 | Mejor que STID, Graph WaveNet y STAEformer (re-ejecutados) | Segun el autor |
| PEMS07 | Mejor que STID, Graph WaveNet y STAEformer (re-ejecutados) | Segun el autor |
| METR-LA | Mejor que STID, Graph WaveNet y STAEformer (re-ejecutados) | Segun el autor |
| PEMS-BAY | Mejor que STID, Graph WaveNet y STAEformer (re-ejecutados) | Segun el autor |

No se proporcionan valores numericos concretos para las comparaciones en PEMS04, PEMS07, METR-LA y PEMS-BAY en la informacion disponible; los resultados completos se documentan en `RESULTS.md` del repositorio GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. El checkpoint pesa aproximadamente 1,37 MB y el modelo tiene 336.740 parametros; la inferencia cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM (RTX 3060, RTX 4090, A100, H100); el modelo no requiere aceleradores de gama alta.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.6 (PEMS-BAY) | 336.740 | 12 pasos | MAE 1.52 (ParadoxBench-1.1 Track A, ensemble 3 semillas); mejor que STID, Graph WaveNet y STAEformer en PEMS04/07, METR-LA y PEMS-BAY segun el autor | Apache-2.0 | Hugging Face |
| STID | no disponible | no disponible | Superado por PWM-Dyn v0.6 en PEMS04/07, METR-LA y PEMS-BAY (re-ejecucion del autor) | no disponible | no disponible |
| Graph WaveNet | no disponible | no disponible | Superado por PWM-Dyn v0.6 en PEMS04/07, METR-LA y PEMS-BAY (re-ejecucion del autor) | no disponible | no disponible |
| STAEformer | no disponible | no disponible | Superado por PWM-Dyn v0.6 en PEMS04/07, METR-LA y PEMS-BAY (re-ejecucion del autor) | no disponible | no disponible |

No se dispone de datos de parametros, contexto ni licencia de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en forecasting de trafico sobre PEMS-BAY; no es un modelo de proposito general ni admite otras tareas.
- El resultado reportado (MAE 1.52) corresponde a un ensemble de 3 semillas; el archivo publicado es solo la semilla 100, por lo que el rendimiento individual puede diferir del valor reportado.
- No se documentan sesgos conocidos ni riesgos de alucinacion en la informacion disponible; al ser un modelo numerico de regresion, el riesgo principal es la extrapolacion incorrecta ante condiciones no vistas en entrenamiento.
- Dependencia de la topologia y distribucion de los 325 sensores de PEMS-BAY: el modelo no es directamente transferible a otras redes viarias sin reentrenamiento.
- No se especifican limitaciones de contexto ni de idioma (no aplica).
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con las condiciones habituales de atribucion y aviso de licencia.
- Los datos de entrenamiento no se distribuyen con el modelo; su uso esta sujeto a los terminos documentados en `DATA_SOURCES.md`.
- El codigo de arquitectura se encuentra en un repositorio GitHub externo; la ficha no verifica su estado de mantenimiento.
- El modelo fue entrenado en un cuaderno de Kaggle y publicado con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems-bay
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados completos: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- README de la conferencia v0.6: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.6-conference/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Sitio del autor: https://paradoxailab.com
- Modelo anterior (#11): https://huggingface.co/paradoxailab/pwm-dyn-v0.6-metr-la
- Modelo siguiente (#13): https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems08
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
