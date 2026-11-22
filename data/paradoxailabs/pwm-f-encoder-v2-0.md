# PARADOXAIlabs/pwm-f-encoder-v2.0

## Resumen

PWM-F encoder (India v2.0) es un codificador de series temporales especializado en meteorología, desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de la familia PWM-W de su linea Paradox World Model. El modelo resuelve una tarea concreta: codificar observaciones meteorologicas de estaciones terrestres de la India para producir representaciones utiles en tareas de prediccion espacio-temporal, como la estimacion de temperatura, humedad relativa y velocidad del viento.

Se trata de un modelo pequeno, de 10.538.577 parametros (aproximadamente 10M), entrenado sobre datos del NOAA Integrated Surface Database (ISD) correspondientes a 187 estaciones indias entre enero de 2015 y noviembre de 2024. Su relevancia es acotada: la propia model card lo marca como "not adopted", es decir, no fue seleccionado para el sistema CPCB tras comparar su validacion (0.4620) con la de la version alternativa (0.4597).

La version 2.0 se publica como un artefacto de investigacion reproducible, con pesos en formato PyTorch (`.pt`) y metadatos embebidos en el checkpoint. No es un modelo de lenguaje ni un modelo generativo de proposito general: es un encoder de pronostico de series temporales con contexto, idiomas y capacidades conversacionales no aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de series temporales espacio-temporales (detalles en el repositorio GitHub del proyecto) |
| Parametros totales | 10.538.577 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no aplica: entrada numerica de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint con `meta`, `weights`, `results` y `cfg`) |

## Arquitectura y entrenamiento

La informacion publica describe el modelo como un encoder de 10M de parametros preentrenado sobre datos meteorologicos de toda la India. La arquitectura concreta (tipo de bloque, atencion, convoluciones o mecanismo espacio-temporal) no se detalla en la model card; se remite al repositorio de GitHub `paradoxailab/paradox-world-model`, rama `india-v2.0`, donde se encuentra el codigo de la arquitectura y el registro completo de reglas, predicciones y resultados. La configuracion de entrenamiento queda almacenada en el propio checkpoint bajo la clave `ck['cfg']`.

El entrenamiento se realizo el 9 de noviembre de 2026 en el entorno denominado "Kaggle pwm-v20" y el modelo se publico el 17 de noviembre de 2026. Los datos de entrenamiento no se distribuyen; sus fuentes y terminos se documentan en `DATA_SOURCES.md`. La fuente es el NOAA ISD con 187 estaciones indias y un rango temporal de enero de 2015 a noviembre de 2024. No se documenta el numero de tokens ni el uso de RLHF, DPO u otras tecnicas de alineacion, lo cual es coherente con la naturaleza no generativa del modelo.

## Capacidades

- Codificacion de observaciones meteorologicas de estaciones terrestres (temperatura, humedad relativa, velocidad del viento) en representaciones latentes.
- Prediccion de series temporales espacio-temporales en el dominio meteorologico.
- Generalizacion geografica dentro de la India, al haber sido preentrenado con 187 estaciones de todo el pais.
- Resultados medidos en el conjunto de validacion: MAE de 0,862 °C en temperatura, 4,80 %RH en humedad relativa y 0,578 m/s en velocidad del viento.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue.
- No se documenta modo "thinking", audio ni ninguna capacidad multimodal.

## Casos de uso

- Prediccion meteorologica regional en la India: el encoder puede alimentar cabezas de prediccion para estimar temperatura, humedad y viento en estaciones con cobertura historica, aprovechando el preentrenamiento sobre 187 estaciones y casi diez anos de datos.
- Relleno de huecos en series de observacion: al codificar el contexto espacio-temporal, puede emplearse para imputar lecturas faltantes o erroneas en registros de estaciones del NOAA ISD, con errores esperados en torno a 0,86 °C de MAE en temperatura.
- Downscaling y asimilacion de datos: util como componente de codificacion en pipelines que combinan observaciones de estacion con reanalisis o modelos numericos de prediccion.
- Investigacion en modelos del mundo (world models): forma parte de una serie publica (56 modelos anunciados, numeros 01-59) que documenta reglas, predicciones y resultados, lo que permite reproducir y comparar experimentos.
- Baseline academico para pronostico espacio-temporal: su tamano reducido (10M de parametros) y su licencia Apache-2.0 lo hacen adecuado como referencia en estudios comparativos de series temporales meteorologicas.
- Integracion en sistemas de alerta temprana a nivel de distrito: combinado con cabezas de prediccion, puede aportar senales de temperatura y humedad para umbrales de riesgo, siempre que se valide localmente.
- Experimentacion con datos de la India en entornos con recursos limitados: el checkpoint ocupa 42.332.123 bytes, por lo que se puede cargar y ejecutar en CPU o en GPUs de gama baja para prototipado.

## Benchmarks y rendimiento

| Metrica (validacion) | PWM-F encoder v2.0 | Referencia interna (CPCB) |
|---|---|---|
| MAE temperatura (°C) | 0,862 | no disponible |
| MAE humedad relativa (%RH) | 4,80 | no disponible |
| MAE velocidad del viento (m/s) | 0,578 | no disponible |
| Puntuacion de validacion | 0,4620 | 0,4597 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un encoder de series temporales. La comparacion con 0,4597 corresponde al criterio interno de seleccion para el sistema CPCB, en el que este modelo no fue adoptado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (checkpoint de 42,3 MB, ~10,5M de parametros); en la practica, unos pocos cientos de MB incluyendo activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; tambien funciona en CPU sin problema por su tamano reducido.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3050, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` y `hf_hub_download`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-F encoder v2.0 | 10,5M | no disponible | Codificacion meteorologica espacio-temporal (India) | Apache-2.0 | Hugging Face |
| PWM-W v1.0 (serie #33) | no disponible | no disponible | Modelo del mundo meteorologico | no disponible | Hugging Face (PARADOXAIlabs/pwm-w-v1.0-wmo) |
| PWM-F encoder v2.1 (serie #36) | no disponible | no disponible | Codificacion meteorologica (India) | no disponible | Hugging Face (PARADOXAIlabs/pwm-f-encoder-v2.1) |

No se dispone de datos de benchmarks comparables con otros encoders meteorologicos publicos en la informacion proporcionada, por lo que la comparativa se limita a los modelos de la misma serie.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo no fue adoptado para el sistema CPCB, al obtener una validacion ligeramente peor (0,4620 frente a 0,4597).
- Cobertura geografica restringida a la India: el preentrenamiento usa 187 estaciones indias y no se garantiza su comportamiento fuera de esa region.
- Rango temporal limitado: datos de enero de 2015 a noviembre de 2024; el rendimiento fuera de ese periodo no esta validado.
- Los datos de entrenamiento no se distribuyen, lo que dificulta la reproduccion exacta y la auditoria del conjunto.
- No es un modelo generativo: no admite prompts, texto, tool calling ni razonamiento; cualquier uso fuera de la codificacion de series temporales no esta soportado.
- Riesgo de sobreajuste a las estaciones y variables presentes en el NOAA ISD; las variables no cubiertas (por ejemplo, precipitacion explicita) no estan documentadas.
- La model card no detalla sesgos, tasas de alucinacion ni limitaciones de contexto; esa informacion no esta disponible.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se publica como artefacto de investigacion sin garantias de rendimiento en produccion.
- El repositorio de Hugging Face muestra 0 descargas y 0 likes, y el tamano del repo es de 0,0 GB, lo que sugiere que los pesos podrian no estar accesibles en el momento de la consulta; conviene verificar la descarga del archivo `35_pwm-f_encoder_v2.0_10m.pt`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-f-encoder-v2.0
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Rama india-v2.0 (registro y resultados): https://github.com/paradoxailab/paradox-world-model/blob/india-v2.0/README.md
- Indice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y terminos de los datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior de la serie (#33): https://huggingface.co/PARADOXAIlabs/pwm-w-v1.0-wmo
- Modelo siguiente de la serie (#36): https://huggingface.co/PARADOXAIlabs/pwm-f-encoder-v2.1
- Listado completo de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
