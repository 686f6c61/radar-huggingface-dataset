# PARADOXAIlabs/atlas-delhi-v1.3

## Resumen

Atlas-Delhi v1.3 es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente el modelo numero 39 de los 56 liberados. Su tarea especifica es el pronostico de las proximas 24 horas de concentracion de PM2.5 en estaciones de medicion de calidad del aire en Delhi (India). No es un modelo de lenguaje: es un modelo de forecasting entrenado especificamente sobre datos de contaminacion atmosferica.

El modelo es extremadamente compacto: 967.632 parametros por checkpoint, con dos checkpoints (B y C) incluidos en el unico fichero de pesos de 7,8 MB. Se distribuye como un state dict de PyTorch (`42_atlas_delhi_v1.3.pt`) que incluye metadatos, pesos, configuracion de entrenamiento y resultados registrados. La arquitectura concreta no se describe en la model card; el codigo de arquitectura se remite al repositorio de GitHub del proyecto.

Su relevancia radica en el resultado declarado: un MAE de 28,91 / 25,56 en la liga de evaluacion v2.0 del proyecto, lo que segun el autor supera a Moirai 2.0 (MAE 30,50) en un 5,2%. Se trata de un modelo de nicho, orientado a un caso de uso muy concreto (calidad del aire en India) y con un pipeline declarado de `time-series-forecasting`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (codigo en repositorio GitHub del proyecto; no descrita en la model card) |
| Parametros totales | 967.632 por checkpoint (2 checkpoints en el fichero: B y C) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (horizonte de prediccion: 24 horas) |
| Tipos de cuantizacion | No disponible (pesos en precision original PyTorch) |
| Idiomas soportados | No disponible (modelo de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, 7.830.751 bytes, SHA-256 `ad74f793f20e274d1469bf432af77c1ad6336c21197b6a1829a484c1af582dca`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Se indica que el codigo de arquitectura reside en el repositorio de GitHub del proyecto (`paradoxailab/paradox-world-model`) y que la configuracion de entrenamiento esta embebida en el fichero de pesos bajo la clave `ck['cfg']`. El modelo se presenta como un modelo espaciotemporal de forecasting, con tags que apuntan a `spatiotemporal`, `rainfall` y `air-quality`, lo que sugiere un diseno para capturar dependencias entre estaciones y a lo largo del tiempo.

El entrenamiento se realizo en dos fases segun el registro del autor: primero un pre-entrenamiento sobre el resto de India y despues un ajuste sobre Delhi. Los datos de pre-entrenamiento provienen de estaciones CPCB de toda la India (14 redes, 263 estaciones, dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)"), mientras que el ajuste final usa datos de 39 estaciones de calidad del aire de Delhi (OpenCity "Delhi Hourly Air Quality Reports"). El entrenamiento se ejecuto el 2026-11-13 (run `atlas-v13-s320` en Kaggle) y el modelo se libero el 2026-11-17. No se especifica el numero de tokens ni si hubo tecnicas de RLHF/DPO, algo esperable al no tratarse de un modelo generativo de lenguaje.

## Capacidades

- Pronostico de PM2.5 a 24 horas vista en estaciones de medicion de Delhi.
- Modelado espaciotemporal: aprovecha la estructura de red entre estaciones (39 estaciones en el ajuste final, 263 en pre-entrenamiento).
- Generalizacion geografica mediante pre-entrenamiento en redes de toda la India antes del ajuste local.
- Prediccion de series temporales multivariantes con contexto entre estaciones.
- No dispone de generacion de texto, razonamiento, codigo, vision ni tool calling.
- No dispone de capacidades multilingues ni de modo "thinking".
- No hay evidencia de soporte de agentes ni de razonamiento multi-paso.

## Casos de uso

- Gestion de episodios de contaminacion en Delhi: el modelo permite anticipar 24 horas de PM2.5 por estacion, lo que facilita activar avisos sanitarios y restricciones de trafico antes de que se materialice el pico.
- Planificacion de salud publica: con pronosticos por estacion, los servicios sanitarios pueden dimensionar consultas respiratorias y distribuir material de proteccion en las zonas con peor prediccion.
- Investigacion en calidad del aire: sirve como baseline reproducible y ligero (menos de 1 M de parametros) para comparar tecnicas de forecasting espaciotemporal en redes de sensores.
- Integracion en dashboards de ciudades inteligentes: el tamano (7,8 MB) permite desplegarlo en infraestructura modesta o incluso en el borde, alimentando paneles de calidad del aire en tiempo casi real.
- Evaluacion comparativa de modelos de series temporales: su resultado declarado frente a Moirai 2.0 lo hace util como referencia en benchmarks de forecasting de contaminacion.
- Extension a otras regiones: el esquema de pre-entrenamiento nacional mas ajuste local puede replicarse en otras ciudades indias con redes CPCB, adaptando el modelo a nuevos dominios geograficos.
- Analisis de politicas publicas: simulacion del efecto de medidas (restricciones de trafico, cierres de industria) sobre la evolucion prevista de PM2.5 a corto plazo.

## Benchmarks y rendimiento

| Benchmark | Atlas-Delhi v1.3 | Moirai 2.0 |
|---|---|---|
| League v2.0 MAE (registro 1) | 28,91 | 30,50 |
| League v2.0 MAE (registro 2) | 25,56 | 30,50 |

Segun el autor, el modelo supera a Moirai 2.0 en un 5,2% en MAE. No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) al no ser un modelo de lenguaje. Tampoco se detalla la composicion exacta del conjunto de evaluacion de la "League v2.0".

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero de pesos ocupa 7,8 MB y el modelo tiene menos de 1 M de parametros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutarlo.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: carga directa con `torch.load` segun el snippet de la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/horizonte | MAE (League v2.0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Atlas-Delhi v1.3 | 967.632 | Forecasting PM2.5 | 24 h | 28,91 / 25,56 | Apache-2.0 | Hugging Face |
| Moirai 2.0 | No disponible | Forecasting de series temporales general | No disponible | 30,50 | No disponible | No disponible en la informacion |
| Otros modelos de la serie Atlas (ParadoxAI Lab) | Variable | Forecasting espaciotemporal | No disponible | No disponible | Apache-2.0 | Hugging Face (serie Paradox World Model) |

La comparacion se limita a Moirai 2.0, unico modelo con el que el autor compara explicitamente. No se dispone de datos de otros modelos comparables de forecasting de calidad del aire en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: entrenado especificamente para PM2.5 en Delhi; su rendimiento fuera de esa region o para otros contaminantes no esta documentado.
- Arquitectura no documentada en la model card: para reproducir o modificar el modelo es necesario consultar el repositorio de GitHub del proyecto.
- Los dos checkpoints (B y C) son identicos segun el autor, lo que limita la variabilidad entre ellos y su utilidad como ensemble.
- El resultado declarado (5,2% mejor que Moirai 2.0) procede de la evaluacion interna del propio autor ("League v2.0"); no se aporta detalle del conjunto de evaluacion ni validacion independiente.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de predicciones erroneas en episodios extremos no representados en los datos de entrenamiento.
- Los datos de entrenamiento no se incluyen; solo se documentan sus fuentes y terminos en el repositorio.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- No hay informacion sobre sesgos, cobertura temporal de los datos ni calidad de las estaciones de origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-delhi-v1.3
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Registro de la version (atlas/README.md): https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion (CITATION.cff): https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#41 Atlas v1.3): https://huggingface.co/PARADOXAIlabs/atlas-india-v1.3-pretrain
- Modelo siguiente (#43 Atlas-W v0): https://huggingface.co/PARADOXAIlabs/atlas-w-v0
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio web del autor: https://paradoxailab.com
