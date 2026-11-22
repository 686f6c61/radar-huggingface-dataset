# PARADOXAIlabs/atlas-w-v1-pretrain

## Resumen

Atlas-W v1 (pre-training) es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de la serie Paradox World Model. Su tarea concreta es pronosticar las siguientes 24 horas de concentración de PM2.5 en estaciones de monitorización de calidad del aire de la India, a partir de los datos de las redes CPCB (Central Pollution Control Board) distribuidas por todo el país.

Se trata de un modelo extremadamente compacto: 14.043 parámetros en total, con un checkpoint de apenas 86.701 bytes en formato PyTorch (`.pt`). No es un modelo de lenguaje ni un transformer generativo de propósito general, sino un modelo especializado de forecasting espacio-temporal entrenado sobre 263 estaciones pertenecientes a 14 redes (13 según la fuente de datos de Kaggle utilizada). El resultado registrado por el autor es un error de validación agrupada (pooled validation) de 8,83-8,86, aunque la model card no especifica la métrica exacta (probablemente RMSE o MAE en µg/m³).

Su relevancia radica en el enfoque: modelos de dominio muy específico, ligeros y reproducibles, publicados junto con su configuración de entrenamiento y sus resultados completos. La versión corresponde al modelo 41 de 56 publicados en la serie, y esta variante concreta representa el entrenamiento "v1.3" sobre el núcleo de datos de calidad del aire.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de forecasting espacio-temporal; código en repositorio GitHub del autor) |
| Parametros totales | 14.043 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoint PyTorch de 86.701 bytes; la cuantizacion no es relevante a esta escala) |
| Idiomas soportados | No disponible (modelo numérico de series temporales, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict serializado con `torch.save`, cargable con `weights_only=False`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna. Indica únicamente que el código de arquitectura de esta versión está en el repositorio GitHub `paradoxailab/paradox-world-model` y que la configuración de entrenamiento se almacena dentro del propio checkpoint en la clave `ck['cfg']`. Por los tags y la tarea (forecasting espacio-temporal sobre una red de estaciones), se trata de un modelo de series temporales con componente espacial, pero no se especifica si usa grafos, convoluciones, atención o modelos recurrentes.

El entrenamiento se realizó el 2026-11-13 (run `atlasw-v13-s320`) y se publicó el 2026-11-17. Los datos provienen del dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)", con estaciones CPCB de 14 redes (13 en la fuente de datos). No se documenta el número de tokens, la composición exacta del dataset, ni si hubo ajuste fino posterior (RLHF/DPO no aplica a este tipo de modelo). Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y términos están en `DATA_SOURCES.md`.

## Capacidades

- Pronóstico de las próximas 24 horas de PM2.5 en estaciones de monitorización de calidad del aire de la India.
- Modelado espacio-temporal: aprovecha la estructura de red de las 263 estaciones para la predicción.
- Inferencia sobre series temporales numéricas; no procesa texto, imagen ni audio.
- Carga y ejecución en CPU sin requisitos de GPU (checkpoint de 86 KB).
- Inspección de metadatos, configuración y resultados embebidos en el propio checkpoint (`meta`, `cfg`, `results`).
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No dispone de capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Pronóstico operativo de calidad del aire: desplegar el modelo para generar predicciones a 24 horas de PM2.5 en estaciones CPCB y alimentar paneles públicos de alerta sanitaria, dado su tamaño mínimo y su especialización en este dominio.
- Investigación en contaminación atmosférica: usar el checkpoint como línea base reproducible para comparar con modelos de forecasting espacio-temporal más complejos, ya que el autor publica configuración y resultados completos.
- Sistemas de alerta temprana: integrar las predicciones en pipelines que disparen avisos cuando se prevean episodios de alta concentración de PM2.5 en redes urbanas.
- Validación de pipelines de datos ambientales: emplear el modelo como componente de prueba en sistemas de ingesta y procesamiento de series temporales de sensores.
- Docencia y experimentación: servir como ejemplo didáctico de modelo de dominio muy ligero con artefacto autocontenido (metadatos, configuración y resultados en el propio `.pt`).
- Reproducibilidad de investigación: cargar `ck['results']` y `ck['cfg']` para auditar el run `atlasw-v13-s320` y replicar el resultado de validación agrupada registrado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Pooled validation (metrica no especificada) | 8,83-8,86 |

El autor registra un único resultado de validación agrupada de 8,83-8,86, sin especificar la métrica (RMSE, MAE u otra) ni la unidad. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el checkpoint ocupa 86.701 bytes y el modelo tiene 14.043 parámetros.
- GPU recomendadas: no requiere GPU; ejecutable en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos de muy bajos recursos.
- Opciones de despliegue: PyTorch nativo con `torch.load` y `huggingface_hub.hf_hub_download`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera latencia despreciable en CPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de forecasting de PM2.5 ni referencias a alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para PM2.5 en estaciones de la India; no es generalizable a otros contaminantes, regiones ni variables sin reentrenamiento.
- La métrica de validación (8,83-8,86) no está identificada, lo que dificulta interpretar su rendimiento real.
- No se documenta la arquitectura ni el proceso de entrenamiento en detalle; la reproducibilidad depende del repositorio GitHub del autor.
- Los datos de entrenamiento no se incluyen; solo se referencian sus fuentes y términos.
- Riesgo de sesgo derivado de la cobertura desigual de las estaciones CPCB y del periodo 2010-2023.
- No dispone de capacidades de texto, tool calling ni agentes; no debe evaluarse como modelo de lenguaje.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar los términos del dataset de Kaggle subyacente.
- El repositorio de Hugging Face registra 0 descargas y 0 likes en el momento de la consulta; se trata de un artefacto de investigación reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-w-v1-pretrain
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la versión: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Versión anterior (#43 Atlas-W v0): https://huggingface.co/PARADOXAIlabs/atlas-w-v0
- Versión siguiente (#45 Atlas-W v1 Delhi): https://huggingface.co/PARADOXAIlabs/atlas-w-v1-delhi
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
