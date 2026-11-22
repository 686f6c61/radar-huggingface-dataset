# PARADOXAIlabs/atlas-india-v1.0

## Resumen

Atlas-India v1.0 es un modelo de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente el modelo numero 37 de los 56 publicados. Su tarea es la prediccion de las proximas 24 horas de concentracion de PM2.5 en estaciones de monitorizacion de calidad del aire en India, empleando un unico modelo que cubre las 263 estaciones de 14 redes del pais. Se publica bajo licencia Apache-2.0 y esta implementado en PyTorch.

El modelo es de tamano muy reducido (967.632 parametros) y se distribuye como un unico fichero de pesos `.pt` de aproximadamente 4 MB. Segun la model card, supera a TimesFM 2.5 en el conjunto de test de toda la India, con un MAE de 20,99/20,86 frente a 22,35/21,93 del modelo de referencia. Es relevante para desarrolladores que necesiten un modelo ligero y especializado en pronostico espacio-temporal de contaminacion atmosferica en el contexto indio, sin los requisitos de computo de los grandes modelos fundacionales de series temporales.

La informacion disponible es escasa: no se detalla la arquitectura interna, el numero de tokens de entrenamiento ni los idiomas soportados (la tarea no es linguistica). Los datos de entrenamiento no se incluyen en el repositorio, aunque se remite a un fichero de fuentes en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de pronostico espacio-temporal; codigo en repositorio GitHub del autor) |
| Parametros totales | 967.632 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea de pronostico a 24 h sobre series de estaciones) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en precision original) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo; solo indica que el codigo de arquitectura de esta version esta en el repositorio GitHub del proyecto y que la configuracion de entrenamiento se almacena dentro del propio fichero de pesos (campo `ck['cfg']`). Se trata de un modelo de pronostico espacio-temporal orientado a series de calidad del aire, con una unica salida de 24 horas de PM2.5 por estacion.

Los datos de entrenamiento proceden de estaciones CPCB de toda la India: 14 redes y 263 estaciones, a partir del conjunto de Kaggle "Time Series Air Quality Data of India (2010-2023)". El modelo se entreno el 2026-11-13 (ejecucion Kaggle `atlas-india-s400`) y se publico el 2026-11-17. No se especifica el numero de tokens ni la composicion exacta del dataset, ni si hubo ajuste por RLHF/DPO (no aplicable en esta tarea). La model card indica que los datos de entrenamiento no se incluyen y que sus fuentes y terminos estan en `DATA_SOURCES.md` del repositorio.

## Capacidades

- Pronostico de las proximas 24 horas de concentracion de PM2.5 en estaciones de monitorizacion.
- Cobertura nacional: un unico modelo para las 263 estaciones de 14 redes de India.
- Modelado espacio-temporal (aprovecha la estructura entre estaciones, segun la etiqueta `spatiotemporal`).
- Inferencia ligera: 967.632 parametros y un fichero de pesos de unos 4 MB.
- Carga sencilla mediante `torch.load` del state dict y metadatos incluidos en el checkpoint (`meta`, `weights`, `results`, `cfg`).
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Pronostico operativo de calidad del aire: generar cada hora o cada dia las predicciones de PM2.5 a 24 h para las 263 estaciones y publicarlas en paneles ciudadanos o APIs de salud publica.
- Alertas tempranas de episodios de contaminacion: usar la prediccion a 24 h para activar avisos cuando se superen umbrales de PM2.5 en estaciones concretas, con un modelo lo bastante pequeno para ejecutarse en CPU.
- Investigacion en series temporales: servir como baseline ligero y reproducible frente a modelos fundacionales como TimesFM 2.5 en tareas de pronostico espacio-temporal.
- Integracion en pipelines de datos de bajo coste: al pesar unos 4 MB y requerir solo PyTorch, puede desplegarse en contenedores pequenos, funciones serverless o dispositivos edge sin GPU.
- Evaluacion comparativa de modelos de forecasting: emplear sus resultados registrados (MAE 20,99/20,86 en test de toda la India) como referencia en estudios de contaminacion atmosferica.
- Educacion y prototipado: cargar el checkpoint, inspeccionar `ck['cfg']` y `ck['results']` para estudiar el diseno y los registros de una ejecucion de entrenamiento completa.
- Planificacion urbana y estudios epidemiologicos: alimentar modelos de exposicion a PM2.5 con pronosticos a corto plazo por estacion.

## Benchmarks y rendimiento

| Modelo | Metrica | Resultado (test toda la India) |
|---|---|---|
| Atlas-India v1.0 | MAE | 20,99 / 20,86 |
| TimesFM 2.5 | MAE | 22,35 / 21,93 |

Los dos valores separados por barra corresponden a los dos registros recogidos en la model card; no se especifica que representa cada uno (posiblemente dos ejecuciones o dos subconjuntos). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa unos 4 MB y el modelo tiene 967.632 parametros, por lo que cabe holgadamente en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con PyTorch es suficiente, e incluso una CPU moderna basta para la inferencia.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + state dict); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | MAE (test India) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-India v1.0 | 967.632 | PM2.5 a 24 h, 263 estaciones | 20,99 / 20,86 | Apache-2.0 | Hugging Face (repo propio) |
| TimesFM 2.5 | no disponible | Forecasting fundacional | 22,35 / 21,93 | no disponible | no disponible en la informacion |
| Atlas-Delhi v1.2 (mismo autor) | no disponible | PM2.5 en Delhi | no disponible | Apache-2.0 (segun serie) | Hugging Face |
| Atlas v1.3 (pre-training, mismo autor) | no disponible | PM2.5, 13 redes | no disponible | Apache-2.0 (segun serie) | Hugging Face |

## Limitaciones y advertencias

- Informacion muy limitada: la model card no detalla arquitectura, contexto, datos exactos de entrenamiento ni proceso de validacion, lo que dificulta evaluar su robustez.
- Entrenado exclusivamente con datos de India (CPCB, 2010-2023); su extrapolacion a otras regiones o a otros contaminantes no esta documentada.
- Los resultados de MAE se presentan como "registrados" por el autor, sin publicacion de detalles de la particion train/test ni de la metodologia de evaluacion.
- Riesgo de sesgo por la cobertura desigual de estaciones y por la calidad de los datos de origen (redes CPCB con posibles huecos y errores de medida).
- Al ser un modelo de pronostico, no genera texto ni razona; no debe usarse para tareas linguisticas.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar `DATA_SOURCES.md` por posibles terminos adicionales de las fuentes de datos.
- Sin descargas ni likes en el momento de la consulta y repositorio de 0,0 GB (solo el fichero de pesos), lo que limita la evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-india-v1.0
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Registro de la version (atlas/README.md): https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (Atlas-Delhi v1.2): https://huggingface.co/PARADOXAIlabs/atlas-delhi-v1.2
- Modelo siguiente (Atlas v1.3 pre-training): https://huggingface.co/PARADOXAIlabs/atlas-india-v1.3-pretrain
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
