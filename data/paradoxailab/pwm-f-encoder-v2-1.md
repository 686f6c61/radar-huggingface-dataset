# paradoxailab/pwm-f-encoder-v2.1

## Resumen

PWM-F encoder v2.1 es un codificador de series temporales espaciotemporales de aproximadamente 10,5 millones de parametros, desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de la familia PWM-W del Paradox World Model. El modelo esta especializado en la codificacion de datos meteorologicos y de precipitacion, preentrenado sobre estaciones indias a partir de datos del NOAA Integrated Surface Database (ISD). Se publica como el modelo numero 36 de la serie Paradox World Model y el 33 de los 56 liberados hasta la fecha.

El modelo se distribuye como un unico checkpoint de PyTorch (`36_pwm-f_encoder_v2.1_10m.pt`, 42,2 MB) que contiene el state dict de pesos, la configuracion de entrenamiento (`ck['cfg']`), metadatos y los resultados de la ejecucion de entrenamiento. No se trata de un modelo generativo de lenguaje, sino de un encoder de pronostico de series temporales, por lo que sus capacidades se limitan a la representacion y prediccion de variables meteorologicas sobre la geografia india.

Esta version corresponde a la segunda ejecucion de preentrenamiento (entrenada el 2026-11-10 en un entorno Kaggle denominado pwm-v21 y publicada el 2026-11-17). La model card no incluye resultados numericos de rendimiento en la propia pagina, sino que remite a las ramas `india-v2.0` y `delhi-v1.1` del repositorio de GitHub para consultar las reglas, predicciones y resultados completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (encoder de series temporales espaciotemporales; codigo en repositorio GitHub) |
| Parametros totales | 10.538.577 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en punto flotante; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo no linguistico; datos geoespaciales de India) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint con `state dict` en `ck['weights']`) |

## Arquitectura y entrenamiento

La model card no describe en detalle la arquitectura interna del encoder. Se trata de un modelo de pronostico de series temporales espaciotemporales (`pipeline_tag: time-series-forecasting`) orientado a datos de precipitacion y meteorologia, con codigo de arquitectura alojado en el repositorio `paradoxailab/paradox-world-model` de GitHub y configuracion de entrenamiento embebida en el propio checkpoint (`ck['cfg']`). El tamano de 10.538.577 parametros y el checkpoint de 42,2 MB son coherentes con un modelo compacto en precision de 32 bits.

Los datos de entrenamiento proceden del NOAA Integrated Surface Database (ISD), restringido a estaciones indias. La model card indica que los datos de entrenamiento no se incluyen en el repositorio y que sus fuentes y terminos se documentan en `DATA_SOURCES.md`. No se especifica el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares (no aplicables en un modelo de pronostico). Esta version v2.1 es la segunda ejecucion de preentrenamiento de la familia, entrenada el 2026-11-10 en un entorno Kaggle (pwm-v21).

## Capacidades

- Codificacion de series temporales meteorologicas espaciotemporales sobre estaciones de India.
- Pronostico de precipitacion y variables meteorologicas asociadas (tags `rainfall`, `weather-forecasting`).
- Modelado espaciotemporal con dependencia geografica (tag `spatiotemporal`).
- Uso como componente encoder dentro de la familia PWM-W del Paradox World Model.
- Carga programatica via `huggingface_hub` y `torch.load`, con acceso a metadatos, configuracion y resultados de la ejecucion.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente: es un modelo de pronostico de series temporales.
- Capacidades multilingues: no aplica (modelo no linguistico).

## Casos de uso

- Pronostico de precipitacion a partir de observaciones de estaciones indias: el encoder transforma series historicas del NOAA ISD en representaciones utiles para predecir lluvia en horizontes cortos, aprovechando su preentrenamiento sobre la red de estaciones de India.
- Downscaling y reconstruccion de series meteorologicas: dado que el modelo es un encoder espaciotemporal, puede emplearse para generar representaciones densas a partir de observaciones dispersas de estaciones.
- Integracion en pipelines de investigacion climatica: al ser un checkpoint PyTorch ligero (42,2 MB) con licencia Apache-2.0, se puede incorporar en cuadernos de investigacion y flujos de experimentacion sin coste de licencia.
- Baseline reproducible para comparacion de modelos: la publicacion incluye metadatos, configuracion y resultados de la ejecucion, lo que permite reproducir y comparar contra otras variantes de la serie PWM.
- Experimentacion en entornos con recursos limitados: sus 10,5 M de parametros permiten entrenamiento e inferencia en CPU o en GPU de consumo, adecuado para prototipado academico.
- Componente de un sistema mayor de modelado del mundo: el encoder puede alimentar etapas posteriores de la familia PWM-W (por ejemplo, el modelo siguiente de la serie, Atlas-Delhi v1.0) en arquitecturas compuestas de prediccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las ramas `india-v2.0` y `delhi-v1.1` del repositorio de GitHub para consultar los resultados registrados, pero no incluye cifras en la propia pagina.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint de 10,5 M de parametros (42,2 MB en disco); no se documentan requisitos oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer e incluso en CPU, dado el tamano reducido del modelo.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y `huggingface_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un encoder de series temporales).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (encoders de pronostico meteorologico espaciotemporal de ~10 M de parametros) ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Cobertura geografica restringida: el modelo esta preentrenado exclusivamente sobre estaciones indias (NOAA ISD), por lo que su generalizacion fuera de India no esta documentada.
- Resultados no publicados en la model card: el rendimiento real debe consultarse en las ramas del repositorio de GitHub; no hay cifras verificables en la pagina de Hugging Face.
- Documentacion incompleta: no se detallan arquitectura interna, contexto, composicion del dataset ni numero de tokens de entrenamiento.
- Sin datos de entrenamiento incluidos: la reproducibilidad completa depende de `DATA_SOURCES.md` y de las fuentes externas del NOAA ISD.
- Modelo no linguistico: no debe evaluarse con criterios de LLM (no hay sesgos de lenguaje, alucinacion textual ni capacidades de agente aplicables).
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; conviene revisar los terminos de las fuentes de datos (NOAA ISD) para usos derivados.
- Advertencia de uso en produccion: al ser un modelo de investigacion con cero descargas y sin validacion externa documentada, no se recomienda su uso en produccion sin una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-f-encoder-v2.1
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la version (rama india-v2.0): https://github.com/paradoxailab/paradox-world-model/blob/india-v2.0/README.md
- Rama delhi-v1.1: https://github.com/paradoxailab/paradox-world-model/blob/delhi-v1.1/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#35 PWM-F encoder India v2.0): https://huggingface.co/paradoxailab/pwm-f-encoder-v2.0
- Modelo siguiente (#37 Atlas-Delhi v1.0): https://huggingface.co/paradoxailab/atlas-delhi-v1.0
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
