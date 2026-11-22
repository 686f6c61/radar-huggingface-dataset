# PARADOXAIlabs/pwm-dyn-v0.4-pems08

## Resumen

PWM-Dyn v0.4 es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su linea Paradox World Model. Se trata del primer modelo publicado de una serie anunciada de 56 modelos (numeracion 01-59) y esta especializado en una tarea concreta: predecir los siguientes 12 pasos de flujo de trafico a partir de datos del conjunto PEMS08 (Caltrans PeMS District 8, San Bernardino; 170 sensores, julio-agosto de 2016). No es un modelo de lenguaje ni un transformer generativo de proposito general, sino una red neuronal pequena de proposito especifico.

El modelo es extremadamente compacto: 318.148 parametros, con un unico fichero de pesos de 1.299.673 bytes en formato PyTorch (`.pt`). La arquitectura concreta no se detalla en la model card; el codigo de arquitectura se remite al repositorio de GitHub del proyecto y la configuracion de entrenamiento se almacena dentro del propio checkpoint bajo la clave `ck['cfg']`. La relevancia de este lanzamiento es mas metodologica que de rendimiento: introduce los tracks de evaluacion ParadoxBench-1 y calibracion split-conformal, con una mejora reportada de cobertura de intervalos de prediccion de precipitacion del 54,7 % al 84,7 % respecto a v0.3.

El resultado declarado es un MAE de 14,53 en el test de ParadoxBench-1 Track A, medido sobre un ensemble de 3 semillas (el fichero publicado corresponde a la semilla 0). La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado datos de benchmarks externos comparables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del autor; configuracion en `ck['cfg']`) |
| Parametros totales | 318.148 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea de horizonte fijo: 12 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en punto flotante; no se publican variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo numerico de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict serializado con `torch.load`, `weights_only=False`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Lo que si se especifica es que el codigo de arquitectura de esta version reside en el repositorio `paradoxailab/paradox-world-model` de GitHub y que la configuracion exacta de entrenamiento se guarda dentro del checkpoint en la clave `ck['cfg']`. El modelo se entrenó el 2026-11-01 en un notebook de Kaggle (identificador `0387a11c3a`, version 364310290) y se publico el 2026-11-17. Dado el tamano (318.148 parametros) y la tarea (forecasting espaciotemporal sobre 170 sensores), es plausible que se trate de una red recurrente o convolucional espacio-temporal compacta, pero esto no se confirma en la informacion disponible.

Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos se documentan en `DATA_SOURCES.md`. El conjunto utilizado es PEMS08 (170 sensores de Caltrans PeMS District 8 en San Bernardino, julio-agosto de 2016). No se especifica el numero de tokens ni de muestras, la composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO (poco probables en este dominio). La innovacion tecnica destacada de esta version es la incorporacion de los tracks de evaluacion ParadoxBench-1 y de calibracion split-conformal, que mejora la cobertura de los intervalos de prediccion en el escenario de precipitacion.

## Capacidades

- Prediccion de flujo de trafico a horizonte fijo de 12 pasos sobre la red de 170 sensores de PEMS08.
- Modelado espaciotemporal: captura dependencias entre sensores distribuidos geograficamente.
- Generacion de intervalos de prediccion calibrados mediante split-conformal (cobertura reportada del 84,7 % en el escenario de precipitacion, frente al 54,7 % de v0.3).
- Evaluacion estandarizada mediante ParadoxBench-1 (Track A).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision ni audio.
- Capacidad de ensemble: el resultado reportado se obtiene con 3 semillas; el fichero publicado es la semilla 0.

## Casos de uso

- Prediccion de trafico a corto plazo en sistemas de gestion de carreteras: el modelo genera los 12 pasos siguientes de flujo para los 170 sensores de PEMS08, util para paneles de control de operaciones viarias en el corredor de San Bernardino.
- Calibracion de intervalos de confianza en planificacion operativa: gracias a la calibracion split-conformal, los intervalos de prediccion son utilizables en decisiones con tolerancia al riesgo (por ejemplo, activacion de carriles reversibles o avisos de congestion).
- Investigacion en modelos espaciotemporales: al ser un checkpoint pequeno (1,3 MB) con configuracion embebida y licencia Apache-2.0, sirve como linea base reproducible para comparar arquitecturas en PEMS08.
- Evaluacion de tecnicas de calibracion: el modelo documenta explicitamente la mejora de cobertura (54,7 % a 84,7 %), lo que lo hace util como caso de estudio de conformal prediction aplicada a series temporales.
- Despliegue en entornos con recursos muy limitados: con 318.148 parametros cabe en CPU y en dispositivos embebidos, lo que permite inferencia en el borde (edge) sin GPU.
- Integracion en pipelines de simulacion de trafico: las predicciones a 12 pasos pueden alimentar simuladores macroscopicos o sistemas de enrutamiento dinamico.
- Reproducibilidad de experimentos: el checkpoint incluye `ck['meta']`, `ck['weights']`, `ck['results']` y `ck['cfg']`, lo que facilita auditar el resultado declarado sin depender de infraestructura externa.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1 Track A (test) | MAE | 14,53 | Ensemble de 3 semillas; el fichero publicado es la semilla 0 |
| Cobertura de intervalos (escenario precipitacion) | Cobertura al 80 % | 84,7 % | Frente a 54,7 % en v0.3 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores. No hay comparaciones con modelos de referencia (por ejemplo, Graph WaveNet, STGCN o MTGNN) en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el checkpoint pesa 1,3 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU moderna (RTX 3060 o superior) es mas que suficiente. Para entrenamiento, una unica GPU consumer basta.
- Cabe en GPU consumer: si, en cualquier modelo con al menos 1 GB de VRAM (practicamente todas).
- Opciones de despliegue: PyTorch nativo mediante `torch.load` y `hf_hub_download`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano, se espera latencia de milisegundos en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con modelos de forecasting espaciotemporal de referencia en la informacion proporcionada. La model card no incluye tablas comparativas frente a Graph WaveNet, STGCN, MTGNN, DCRNN ni arquitecturas similares sobre PEMS08.

| Modelo | Parametros | Contexto/horizonte | MAE ParadoxBench-1 Track A | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.4 (PEMS08) | 318.148 | 12 pasos | 14,53 (ensemble 3 semillas) | Apache-2.0 | Hugging Face |
| Alternativas espaciotemporales (Graph WaveNet, STGCN, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de proposito muy especifico: solo predice flujo de trafico en los 170 sensores de PEMS08; no es generalizable a otras redes viarias sin reentrenamiento.
- El resultado de MAE 14,53 corresponde a un ensemble de 3 semillas, pero el fichero publicado es solo la semilla 0; el rendimiento individual de la semilla 0 no se reporta de forma separada.
- La arquitectura no esta documentada en la model card; depende del codigo del repositorio de GitHub, lo que introduce riesgo de desalineacion entre versiones.
- No se especifican sesgos conocidos, pero el conjunto de datos cubre solo dos meses (julio-agosto de 2016) en una region concreta, por lo que el modelo puede no capturar estacionalidad anual ni condiciones atipicas.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de predicciones poco fiables fuera del dominio de entrenamiento (condiciones meteorologicas extremas, incidentes, obras).
- La cobertura calibrada del 84,7 % se reporta para el escenario de precipitacion; no se detalla la cobertura en otros escenarios.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no impone restricciones adicionales conocidas.
- Los datos de entrenamiento no se distribuyen con el modelo; hay que consultar `DATA_SOURCES.md` para los terminos de las fuentes.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4-pems08
- Serie completa: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Siguiente modelo de la serie (#02): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4-pems04
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- README de ParadoxBench v0.4: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.4-paradoxbench/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Sitio web del autor: https://paradoxailab.com
