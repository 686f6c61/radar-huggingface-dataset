# paradoxailab/atlas-delhi-v1.3

## Resumen

Atlas-Delhi v1.3 es un modelo de series temporales especializado en la prediccion de PM2.5 (particulas finas en suspension) a 24 horas vista en estaciones de la red CPCB de Delhi. Lo desarrolla ParadoxAI Lab (Aditya Kumar, Anupam Singh) como parte de la serie Paradox World Model, en concreto el modelo numero 39 de 56 publicados (numeracion de serie 42 de 59). No es un modelo de lenguaje: es un predictor espaciotemporal de contaminacion atmosferica con 967.632 parametros por checkpoint, empaquetado como un unico fichero PyTorch de 7,8 MB que contiene dos checkpoints (B y C) y los metadatos de entrenamiento.

El modelo se entrena en dos fases: primero sobre el resto de India (14 redes, 263 estaciones del dataset de Kaggle "Time Series Air Quality Data of India 2010-2023") y despues se ajusta sobre las 39 estaciones de calidad del aire de Delhi del dataset OpenCity "Delhi Hourly Air Quality Reports". Su relevancia practica esta en el ambito de la prediccion operativa de calidad del aire en entornos urbanos densamente monitorizados, donde un modelo de menos de un millon de parametros puede ejecutarse en CPU y desplegarse a pie de estacion.

La version 1.3 registra un MAE de 28,91 y 25,56 en la evaluacion League v2.0, lo que segun la model card supera a Moirai 2.0 (30,50) en un 5,2%. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del autor; no se detalla en la model card) |
| Parametros totales | 967.632 por checkpoint (2 checkpoints en el fichero: B y C, identicos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch float, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict serializado con `torch.save`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna (tipo de transformer, capas, atencion espacial, etc.); solo indica que el codigo esta en el repositorio GitHub del proyecto y que la configuracion de entrenamiento se guarda dentro del fichero en `ck['cfg']`. El modelo es espaciotemporal: predice la serie de PM2.5 en cada una de las 39 estaciones de Delhi para las 24 horas siguientes, lo que implica modelar dependencias entre estaciones (grafo de sensores) ademas de la dinamica temporal de cada una.

El entrenamiento se realizo en dos etapas: pre-entrenamiento sobre 14 redes y 263 estaciones de toda India (dataset Kaggle 2010-2023) y ajuste fino sobre las 39 estaciones de Delhi (OpenCity). El run registrado es `atlas-v13-s320` del 13 de noviembre de 2026, con publicacion el 17 de noviembre de 2026. No se especifica el numero de tokens ni de pasos, ni si se uso RLHF/DPO (no aplica en este dominio). Los dos checkpoints incluidos (B y C) son identicos segun la model card.

## Capacidades

- Prediccion de PM2.5 a 24 horas vista en 39 estaciones de Delhi.
- Modelado espaciotemporal multiestacion (dependencias entre sensores de la red).
- Inferencia en CPU: 967.632 parametros y 7,8 MB de pesos permiten ejecucion sin GPU.
- Carga directa con `torch.load` y acceso a metadatos, pesos y resultados en el mismo fichero.
- No soporta tool calling, agentes, vision, audio ni generacion de texto.
- No es multilingue: opera sobre series numericas, no sobre texto.

## Casos de uso

- Prediccion operativa de calidad del aire en Delhi: generar cada hora el pronostico de PM2.5 a 24 h para las 39 estaciones CPCB y alimentar un panel publico de alertas sanitarias.
- Activacion de protocolos de emergencia por contaminacion: usar el pronostico a 24 h para decidir restricciones de trafico o cierres escolares con antelacion, dado el bajo coste computacional del modelo.
- Investigacion epidemiologica: cruzar las predicciones con registros hospitalarios para estudiar exposiciones a PM2.5 con un horizonte de un dia.
- Validacion de redes de sensores: comparar la prediccion del modelo con las lecturas reales para detectar estaciones con deriva o fallo.
- Despliegue en dispositivos de borde: al ocupar menos de 8 MB y requerir solo PyTorch en CPU, puede ejecutarse en un mini-PC junto a la estacion de medida sin conexion a GPU.
- Baseline en competiciones y benchmarks de forecasting: servir como referencia reproducible (MAE 25,56–28,91 en League v2.0) para modelos mayores como Moirai 2.0.
- Pre-entrenamiento transferible: reutilizar el checkpoint pre-entrenado en India para ajustar a otras ciudades con pocas estaciones.

## Benchmarks y rendimiento

| Benchmark | Atlas-Delhi v1.3 | Moirai 2.0 |
|---|---|---|
| League v2.0 MAE (registro 1) | 28,91 | 30,50 |
| League v2.0 MAE (registro 2) | 25,56 | 30,50 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a este dominio.

## Requisitos de hardware

- VRAM: 0 GB; el modelo corre en CPU (7,8 MB de pesos, menos de 1 M de parametros).
- GPU recomendadas: no necesaria; cualquier GPU con PyTorch serviria, pero no aporta ventaja significativa.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en Raspberry Pi o mini-PC.
- Opciones de despliegue: PyTorch nativo (`torch.load`); no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la model card; por tamano, la inferencia deberia ser de milisegundos en CPU, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | MAE (League v2.0) | Licencia |
|---|---|---|---|---|---|
| Atlas-Delhi v1.3 | 967.632 | no disponible | PM2.5 24 h, 39 estaciones Delhi | 25,56–28,91 | Apache-2.0 |
| Moirai 2.0 | no disponible | no disponible | Forecasting general de series temporales | 30,50 | no disponible |
| Atlas v1.3 (pre-entrenamiento India) | no disponible | no disponible | Pre-entrenamiento 13 redes India | no disponible | Apache-2.0 |
| Atlas-W v0 | no disponible | no disponible | Nucleo de calidad del aire | no disponible | Apache-2.0 |

## Limitaciones y advertencias

- Dominio muy restringido: solo predice PM2.5 en las 39 estaciones de Delhi; no generaliza a otras variables ni ciudades sin reentrenamiento.
- Tamano minimo (967.632 parametros): capacidad limitada para capturar eventos extremos o cambios estructurales en la red de sensores.
- Los dos checkpoints del fichero (B y C) son identicos, por lo que no aportan diversidad ni ensemble.
- No se documenta la arquitectura ni el contexto de entrada en la model card; hay que consultar el repositorio GitHub para reproducir.
- Los datos de entrenamiento no se incluyen; solo se referencian sus fuentes y terminos en `DATA_SOURCES.md`.
- Riesgo de deriva: la relacion entre estaciones puede cambiar con nuevas fuentes de emision o reubicacion de sensores; no se documenta validacion temporal fuera de muestra.
- Sin datos de sesgo, calibracion en episodios extremos (p. ej. estacionalidad de quema de rastrojos) ni intervalos de incertidumbre.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar los terminos de los datasets de origen (OpenCity, Kaggle) para redistribucion de derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema practicamente sin validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-delhi-v1.3
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la version: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#41): https://huggingface.co/paradoxailab/atlas-india-v1.3-pretrain
- Modelo siguiente (#43): https://huggingface.co/paradoxailab/atlas-w-v0
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Web del laboratorio: https://paradoxailab.com
