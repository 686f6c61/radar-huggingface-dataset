# paradoxailab/atlas-w-v1-delhi

## Resumen

Atlas-W v1 (Delhi) es un modelo de prediccion de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, en concreto la entrega numero 45 de la serie y el modelo 42 de los 56 publicados. Su tarea es la prediccion de las proximas 24 horas de concentracion de PM2.5 en estaciones de medicion de calidad del aire en Delhi, a partir de datos horarios de la red CPCB (Central Pollution Control Board) que cubre 39 estaciones de monitorizacion continua.

Se trata de un modelo extremadamente pequeno: 14.043 parametros por checkpoint, con dos checkpoints (B y C) incluidos en el mismo fichero y descritos como identicos. No es un modelo de lenguaje ni un transformer de proposito general, sino un modelo especializado de forecasting espacio-temporal de contaminacion atmosferica, empaquetado como un state dict de PyTorch en un unico fichero `.pt` de 149.267 bytes.

Su relevancia es acotada y muy especifica: no hay resultados de benchmarks publicados en la informacion disponible, el repositorio tiene 0 descargas y 0 likes, y la model card remite los resultados a un documento externo ("League v2.0") sin cifras en la propia ficha. Debe evaluarse, por tanto, como un artefacto de investigacion reproducible mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card remite al repositorio de GitHub para el codigo de arquitectura) |
| Parametros totales | 14.043 por checkpoint (2 checkpoints: B y C, identicos en el fichero) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de series temporales; ventana de entrada no especificada) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch nativo, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict en fichero `.pt` (`45_atlas-w_v1_delhi.pt`, 149.267 bytes) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna; indica explicitamente que el codigo de la arquitectura de esta version esta en el repositorio de GitHub del proyecto y que la configuracion de entrenamiento esta almacenada en el propio fichero, accesible como `ck['cfg']`. Por tanto, la arquitectura concreta (tipo de red, capas, mecanismo de atencion o recurrencia) no esta disponible en la informacion proporcionada. El tamano de 14.043 parametros por checkpoint sugiere un modelo muy compacto, coherente con un predictor especializado por ciudad y variable.

Los datos de entrenamiento son los informes horarios de calidad del aire de Delhi de OpenCity, correspondientes a la red CPCB con 39 estaciones de monitorizacion continua. El entrenamiento se realizo el 2026-11-13 en un entorno de Kaggle (run `atlasw-v13-s320`) y la version se publico el 2026-11-17. La model card indica que esta version es un "small model at v1.3 recipe" y que los checkpoints B y C corresponden a etapas de entrenamiento registradas para esta version. No se especifica el numero de tokens, la composicion del dataset, ni si hubo tecnicas de ajuste como RLHF o DPO (no aplicables en este dominio). Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos se documentan en `DATA_SOURCES.md` del repositorio de GitHub.

## Capacidades

- Prediccion de las proximas 24 horas de PM2.5 en estaciones de calidad del aire de Delhi.
- Modelado espacio-temporal: los tags del modelo indican explicitamente `spatiotemporal`, lo que implica que el modelo explota dependencias entre estaciones, no solo series individuales.
- Forecasting de series temporales horarias sobre una red de 39 estaciones de monitorizacion.
- Carga programatica via `torch.load` con acceso a metadatos (`ck['meta']`), pesos por checkpoint (`ck['weights']`), resultados registrados (`ck['results']`) y configuracion (`ck['cfg']`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue: es un modelo numerico de un unico dominio.

## Casos de uso

- Prediccion operativa de PM2.5 a 24 horas en Delhi: el modelo toma el estado horario de las estaciones CPCB y devuelve el pronostico de las siguientes 24 horas, util para sistemas de alerta temprana de episodios de contaminacion.
- Investigacion en modelos espacio-temporales de calidad del aire: al ser un modelo de 14.043 parametros con configuracion y pesos accesibles, sirve como baseline reproducible para comparar arquitecturas en el benchmark interno de la serie.
- Reproduccion de experimentos: el fichero incluye metadatos, resultados y logs del run de entrenamiento, lo que permite auditar y replicar el experimento sin depender de infraestructura externa.
- Integracion en pipelines de analisis con PyTorch: al ser un state dict nativo, se puede cargar en CPU con `map_location="cpu"` y ejecutar en entornos sin GPU.
- Docencia y prototipado: su tamano minimo (149 KB) permite desplegarlo en cuadernos, contenedores ligeros o dispositivos de bajos recursos para experimentar con forecasting espacio-temporal.
- Comparacion con modelos operacionales: la serie incluye una entrega posterior (#46, Atlas-Delhi I1) descrita como "operational comparison", lo que permite contrastar este modelo de investigacion con una variante orientada a operacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite los resultados a un documento externo ("League v2.0", Atlas-W day 2 results) sin incluir cifras en la propia ficha, y no se proporcionan metricas como RMSE, MAE o skill score frente a baselines.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; con 14.043 parametros por checkpoint y un fichero de 149.267 bytes, el modelo cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con PyTorch disponible; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o CPU es suficiente.
- Cabe en GPU consumer: si, en todas las del mercado actual; tambien en CPU y en entornos tipo Kaggle o Colab gratuitos.
- Opciones de despliegue: carga directa con `torch.load` y `huggingface_hub.hf_hub_download`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la latencia vendria dominada por el preprocesado de las series de entrada y no por el calculo de la red.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de forecasting de calidad del aire con los que contrastar parametros, contexto o rendimiento. Dentro de la propia serie Paradox World Model existen entregas relacionadas (#44 Atlas-W v1 pre-training y #46 Atlas-Delhi I1), pero no se aportan sus especificaciones ni resultados en la informacion disponible.

## Limitaciones y advertencias

- Resultados no verificables: la model card no incluye metricas; los resultados se remiten a un documento externo no incluido en la informacion proporcionada.
- Ambito geografico y de variable muy restringido: solo Delhi y solo PM2.5; no es extrapolable a otras ciudades o contaminantes sin reentrenamiento.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- Arquitectura no documentada en la model card: hay que consultar el repositorio de GitHub para conocer el diseno real del modelo.
- Datos de entrenamiento no incluidos: la reproducibilidad completa depende de las fuentes externas documentadas en `DATA_SOURCES.md`.
- Riesgo de alucinacion no aplicable en el sentido linguistico, pero si riesgo de predicciones erroneas en episodios extremos de contaminacion no representados en el periodo de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento del modelo en produccion.
- Checkpoints B y C identicos: no aportan diversidad de ensemble; conviene tratarlos como un unico modelo a efectos practicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/atlas-w-v1-delhi
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Registro y resultados de la version: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie completa: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y terminos de los datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#44 Atlas-W v1 pre-training): https://huggingface.co/paradoxailab/atlas-w-v1-pretrain
- Modelo siguiente (#46 Atlas-Delhi I1): https://huggingface.co/paradoxailab/atlas-delhi-i1
- Indice de modelos en Hugging Face: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
