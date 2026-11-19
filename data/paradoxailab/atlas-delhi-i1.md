# paradoxailab/atlas-delhi-i1

## Resumen

Atlas-Delhi I1 es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente la entrega número 46 del catálogo y el modelo 43 de los 56 publicados. Su tarea específica es la previsión a 24 horas de la concentración de PM2.5 en estaciones de monitorización de la calidad del aire en Delhi, empleando datos de las 39 estaciones continuas de la red CPCB durante el invierno de 2024-25.

El modelo es deliberadamente compacto: 967.632 parámetros por checkpoint, con dos checkpoints (etapas B y C de entrenamiento) empaquetados en un único fichero PyTorch de 7,78 MB. No es un modelo de lenguaje ni un transformer generativo de propósito general, sino un predictor numérico especializado que compite directamente con sistemas operativos de pronóstico como IITM WRF-Chem e IMD SILAM.

Su relevancia radica en el resultado reportado: un MAE de 31,27 en la etapa C (media de 3 semillas) frente a los 58,75 de WRF-Chem y los 71,68 de SILAM publicados por sus respectivos organismos. Si se confirma, un modelo de menos de un millón de parámetros superaría a modelos de química atmosférica de escala operativa en la predicción a corto plazo de PM2.5 en un contexto de contaminación extrema como el invierno de Delhi.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub del autor; no se detalla en la model card) |
| Parámetros totales | 967.632 por checkpoint |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales; ventana de entrada no especificada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, `torch.load` con `weights_only=False`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo; únicamente indica que el código de arquitectura de esta versión está en el repositorio GitHub de Paradox World Model y que la configuración de entrenamiento se almacena en el propio fichero bajo la clave `ck['cfg']`. No se especifica si se trata de un transformer, una red recurrente, un modelo grafotemporal o un esquema híbrido.

En cuanto a los datos, se entrenó con registros horarios de las 39 estaciones continuas de calidad del aire de CPCB en Delhi (fuente OpenCity, "Delhi Hourly Air Quality Reports") durante el invierno 2024-25. El entrenamiento se realizó el 2026-11-15 en el entorno Kaggle `atlas-i1-s320`. El fichero contiene dos checkpoints correspondientes a etapas distintas de entrenamiento (B y C), y la model card indica que cada resultado registrado especifica qué etapa lo produjo. No se detalla el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de ajuste como RLHF o DPO (no aplicables habitualmente a este tipo de modelos).

## Capacidades

- Predicción de PM2.5 a 24 horas vista en estaciones de monitorización de Delhi.
- Modelado espaciotemporal: aprovecha la estructura de red de las 39 estaciones CPCB.
- Pronóstico numérico de series temporales multivariantes con dependencia espacial.
- Empaquetado de múltiples checkpoints (etapas B y C) en un único artefacto con metadatos, resultados y logs de ejecución accesibles vía `ck["meta"]`, `ck["results"]`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües, de visión ni de audio.
- No incluye modo "thinking" ni decodificación especulativa.

## Casos de uso

- Pronóstico operativo de calidad del aire en Delhi: el modelo genera la predicción de PM2.5 a 24 h para cada estación, sustituyendo o complementando los pronósticos de WRF-Chem y SILAM con un coste computacional mínimo (7,78 MB de pesos).
- Alertas tempranas de episodios de contaminación extrema: con un MAE reportado de 31,27 µg/m³, permite activar avisos sanitarios y restricciones de tráfico con un día de antelación durante el invierno, cuando los niveles de PM2.5 en Delhi alcanzan picos severos.
- Investigación en modelos ligeros de series temporales: sirve como referencia reproducible para comparar arquitecturas compactas frente a modelos de química atmosférica de escala operativa en un benchmark concreto (invierno 2024-25, 39 estaciones).
- Despliegue en entornos con recursos limitados: al ocupar menos de 8 MB, puede ejecutarse en CPU o en dispositivos edge sin GPU, lo que facilita su integración en sistemas municipales de monitorización.
- Validación y calibración de redes de sensores: las predicciones a 24 h pueden usarse para detectar estaciones con lecturas anómalas comparando la observación con la previsión del modelo.
- Reproducción académica: el paquete incluye resultados, logs de ejecución y metadatos de las etapas de entrenamiento, lo que permite auditar el resultado reportado y reentrenar con la configuración almacenada en `ck['cfg']`.

## Benchmarks y rendimiento

| Modelo | MAE (PM2.5, invierno Delhi 2024-25) | Fuente |
|---|---|---|
| Atlas-Delhi I1 (etapa C, 3 semillas) | 31,27 | Reportado por el autor |
| IITM WRF-Chem | 58,75 | Publicado por IITM (según el autor) |
| IMD SILAM | 71,68 | Publicado por IMD (según el autor) |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un modelo de series temporales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero completo pesa 7,78 MB y el modelo tiene menos de un millón de parámetros por checkpoint.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier modelo consumer (GTX 1650, RTX 3060, RTX 4090) es sobredimensionado.
- Cabe en cualquier GPU consumer y en la mayoría de dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` y `huggingface_hub.hf_hub_download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | MAE reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Atlas-Delhi I1 | Predictor espaciotemporal | 967.632 | no disponible | 31,27 | Apache-2.0 | Hugging Face |
| IITM WRF-Chem | Modelo de química atmosférica | no disponible | no aplica | 58,75 | no disponible | Operativo (IITM) |
| IMD SILAM | Modelo de dispersión atmosférica | no disponible | no aplica | 71,68 | no disponible | Operativo (IMD) |

No se dispone de información sobre otros modelos comparables de la misma serie (Atlas-W v1, Atlas v1.4n) más allá de su existencia como entregas adyacentes del catálogo.

## Limitaciones y advertencias

- El resultado de MAE 31,27 procede únicamente del autor; no se ha verificado de forma independiente en la información disponible.
- El modelo está entrenado exclusivamente con datos del invierno 2024-25 en Delhi; su generalización a otras estaciones, años o ciudades no está documentada.
- La comparación con WRF-Chem y SILAM se basa en cifras publicadas por terceros y puede no ser homogénea en metodología, periodo o estaciones evaluadas.
- No se especifica la arquitectura ni la ventana de entrada, lo que dificulta evaluar su idoneidad fuera del caso de uso reportado.
- Riesgo de sobreajuste a la red de 39 estaciones CPCB: cambios en la red de sensores pueden degradar el rendimiento.
- No se documentan sesgos, pero al ser un modelo numérico entrenado con datos de una región concreta, hereda los sesgos de la red de monitorización (posible infrarrepresentación de zonas sin estación).
- Licencia Apache-2.0 permite uso comercial, pero la model card no incluye garantías ni condiciones adicionales sobre los datos de entrenamiento (fuente OpenCity/CPCB).
- El fichero se carga con `weights_only=False`, lo que implica ejecución de código pickle; debe tratarse como artefacto no confiable en entornos de producción sin sandbox.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-delhi-i1
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la versión: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#45): https://huggingface.co/paradoxailab/atlas-w-v1-delhi
- Modelo siguiente (#47): https://huggingface.co/paradoxailab/atlas-v1.4n
- Catálogo completo: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
