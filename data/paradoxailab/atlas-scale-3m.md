# paradoxailab/atlas-scale-3m

## Resumen

Atlas S2 (3M) es un modelo de prediccion de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su serie Paradox World Model, en concreto la entrega numero 49 de la serie y el modelo 46 de los 56 publicados. Su tarea especifica es la prediccion de las siguientes 24 horas de concentracion de PM2.5 en estaciones de monitorizacion de calidad del aire en India, empleando datos de las estaciones CPCB (14 redes y 263 estaciones) procedentes del conjunto de datos publico de Kaggle "Time Series Air Quality Data of India (2010-2023)".

El modelo tiene 2.950.392 parametros y se distribuye como un unico checkpoint de PyTorch (`49_atlas_scale_3m.pt`, 11,8 MB) que incluye los pesos, la configuracion de entrenamiento, los metadatos y los registros de resultados. Es relevante como ejemplo de modelo compacto de dominio especifico orientado a pronostico espacio-temporal, no como modelo de lenguaje: no procesa texto ni dispone de capacidades generativas, de razonamiento o de tool calling.

La model card indica explicitamente que esta version no fue adoptada ("not adopted"): su validacion registrada es de 9.139, solo un 0,38 % mejor que la version de 1M parametros, lo que sugiere que el incremento de capacidad no aporto una mejora suficiente frente a la variante inferior de la escalera de parametros de la familia Atlas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el codigo esta en el repositorio de GitHub del autor; la model card no describe la arquitectura) |
| Parametros totales | 2.950.392 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales; ventana de entrada no especificada) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; los datos son de India) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict serializado con `torch.save`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo; solo indica que el codigo de la arquitectura de esta version se encuentra en el repositorio de GitHub `paradoxailab/paradox-world-model` y que la configuracion de entrenamiento esta almacenada en el propio checkpoint bajo la clave `ck['cfg']`. El modelo pertenece a la familia Atlas, orientada a pronostico espacio-temporal, y su tarea declarada es la prediccion de las 24 horas siguientes de PM2.5 en estaciones.

Los datos de entrenamiento son las estaciones CPCB de toda India (14 redes, 263 estaciones) del conjunto de Kaggle "Time Series Air Quality Data of India (2010-2023)". No se especifica el numero de tokens ni de pasos de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste fino por refuerzo o preferencias (no procede en un modelo de pronostico). El entrenamiento se realizo el 2026-11-15 en el entorno de Kaggle `atlas-scale3m-s400` y la version se publico el 2026-11-17. El cambio declarado respecto a la version anterior es unicamente el escalado de parametros dentro de la escalera de la familia.

## Capacidades

- Pronostico de series temporales: prediccion de las siguientes 24 horas de PM2.5 en estaciones de calidad del aire.
- Modelado espacio-temporal: el entrenamiento con 14 redes y 263 estaciones sugiere el uso de dependencias entre estaciones, aunque la model card no detalla el mecanismo.
- Inferencia en CPU: el checkpoint se puede cargar con `map_location="cpu"` y el tamano (11,8 MB) permite ejecucion sin GPU.
- Inspeccion de metadatos y resultados: el checkpoint expone `meta`, `weights`, `results` y `cfg`, lo que facilita la auditoria del entrenamiento.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes.
- No dispone de capacidades multilingues.

## Casos de uso

- Pronostico operativo de calidad del aire: generar la prediccion a 24 horas de PM2.5 por estacion para alimentar paneles de alerta sanitaria en ciudades indias, aprovechando que el modelo esta entrenado sobre la red CPCB completa.
- Investigacion en modelos espacio-temporales compactos: servir como linea base de 3M parametros en experimentos de escalado dentro de la familia Atlas, comparando con las variantes de 1M y 10M.
- Validacion de pipelines de datos CPCB: usar el checkpoint para comprobar la integridad y el preprocesado de series de calidad del aire antes de entrenar modelos mayores.
- Educacion y prototipado: al ser un checkpoint de 11,8 MB ejecutable en CPU, permite demostrar un flujo completo de descarga, carga e inferencia en entornos docentes o de pruebas sin infraestructura GPU.
- Analisis de escalado de parametros: el registro de resultados incluido en el checkpoint (`results`) permite estudiar la relacion entre capacidad y error de validacion en la escalera 1M-3M-10M.
- Despliegue en dispositivos con recursos limitados: por su tamano, puede integrarse en servicios edge o contenedores ligeros para pronostico local de contaminacion.

## Benchmarks y rendimiento

| Metrica | Atlas S2 (3M) | Referencia indicada |
|---|---|---|
| Error de validacion | 9.139 | 9.139 / 1,0038 ≈ 9.104 en la version de 1M (mejora del +0,38 %) |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros); no aplican a este tipo de modelo. La unica metrica registrada es el error de validacion de 9.139, sin que la model card especifique la unidad ni la metrica exacta (por ejemplo, RMSE o MAE).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 11,8 MB y el modelo tiene 2,95M parametros.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de memoria es suficiente. Funciona en CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, e incluso iGPU) y en Raspberry Pi o entornos similares.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` y `huggingface_hub.hf_hub_download`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Atlas S2 (3M) | 2.950.392 | PM2.5 a 24 h, India | no disponible | Apache-2.0 | no adoptado |
| Atlas (1M) | ~1M (no confirmado) | PM2.5 a 24 h, India | no disponible | Apache-2.0 (presumible) | referencia de la comparacion (+0,38 % peor) |
| Atlas S3 (10M) | ~10M (no confirmado) | PM2.5 a 24 h, India | no disponible | Apache-2.0 (presumible) | siguiente en la escalera |

No se dispone de informacion sobre modelos de terceros comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo no adoptado por el propio autor: la model card lo marca como "not adopted" por una mejora marginal (+0,38 %) frente a la version de 1M.
- Dominio muy restringido: solo predice PM2.5 a 24 horas en estaciones CPCB de India; no es transferible sin reentrenamiento.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Arquitectura no documentada en la model card; es necesario consultar el repositorio de GitHub para reproducirla.
- Datos de entrenamiento no incluidos: solo se enlazan sus fuentes y terminos en `DATA_SOURCES.md`.
- Metrica de validacion (9.139) sin unidad ni definicion explicita; dificulta la comparacion con otros trabajos.
- Riesgo de sesgo geografico y temporal: entrenado solo con estaciones indias y el periodo 2010-2023.
- Licencia Apache-2.0 permite uso comercial, pero la falta de documentacion sobre el rendimiento en produccion desaconseja su despliegue sin validacion propia.
- Repositorio de 0,0 GB y sin descargas ni likes en el momento de la consulta; ecosistema y soporte muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-scale-3m
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la version: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Version anterior (Atlas-P): https://huggingface.co/paradoxailab/atlas-p
- Version siguiente (Atlas S3, 10M): https://huggingface.co/paradoxailab/atlas-scale-10m
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
