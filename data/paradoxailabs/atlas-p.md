# PARADOXAIlabs/atlas-p

## Resumen

Atlas-P (physics decoder) es un modelo de forecasting espacio-temporal desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de la serie Paradox World Model, concretamente la entrega número 48 de 56 modelos publicados. Resuelve una tarea muy concreta: predecir las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización de calidad del aire de la India, a partir de datos de la red CPCB (14 redes, 263 estaciones). Con 978.507 parámetros, es un modelo de escala muy reducida, orientado a experimentación y validación de hipótesis más que a despliegue en producción.

La relevancia de esta versión concreta es limitada por su propio diseño: la model card indica explícitamente que el modelo **no fue adoptado** ("not adopted"), ya que su resultado de validación (9.227) empeoró el de la versión anterior (9.104). El cambio introducido en esta iteración fue un "physics decoder test" con resultado negativo, es decir, un experimento que no mejoró la línea base. Se publica, por tanto, como registro de un experimento fallido dentro de una serie de ablaciones.

No se dispone de información sobre arquitectura interna, composición del dataset de entrenamiento ni proceso de optimización más allá de lo indicado en la model card. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y ocupa 0.0 GB (el único fichero pesa ~3,95 MB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de forecasting espacio-temporal; el autor lo etiqueta como "physics decoder") |
| Parámetros totales | 978.507 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de predicción: 24 horas) |
| Tipos de cuantización | no disponible (pesos en PyTorch `state_dict`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch `torch.load`, `weights_only=False`; incluye `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Se sabe que se trata de un modelo de series temporales espacio-temporales ("spatiotemporal") con un componente denominado "physics decoder", cuyo test constituye el cambio de esta versión respecto a la anterior (#47 Atlas v1.4n, "neighbours only"). El nombre "physics decoder" sugiere la incorporación de restricciones o términos físicos en la decodificación de la predicción, pero no se detalla su funcionamiento ni la formulación matemática.

Los datos de entrenamiento provienen del dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)", con registros de la red CPCB (14 redes, 263 estaciones). No se especifica el número de tokens, la división train/validation/test, la composición exacta del dataset ni si hubo fases de ajuste tipo RLHF (no aplicable en este dominio). El entrenamiento se realizó el 2026-11-15 en el run `atlas-indiap-s400` de Kaggle. El resultado registrado en validación es 9.227 frente a 9.104 de la versión previa, lo que motivó su no adopción.

## Capacidades

- Predicción de las próximas 24 horas de PM2.5 en estaciones de la red CPCB de la India.
- Modelado espacio-temporal: incorpora información de estaciones vecinas (herencia de la versión #47 "neighbours only") y un decodificador físico.
- Tarea única de regresión sobre series temporales; no genera texto, código ni realiza razonamiento simbólico.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje natural).
- No dispone de modo "thinking", visión ni audio.
- El checkpoint incluye metadatos (`meta`), pesos (`weights`), resultados (`results`) y configuración (`cfg`), lo que facilita la reproducibilidad del experimento.

## Casos de uso

- **Investigación en modelado físico de contaminación atmosférica**: el modelo sirve como referencia de un experimento negativo (physics decoder no mejora la línea base) para comparar con variantes futuras del mismo decodificador.
- **Ablación controlada en series temporales**: al compartir estructura con #47 Atlas v1.4n, permite aislar el efecto del componente físico en el rendimiento de validación (9.227 vs 9.104).
- **Prototipado de pipelines de forecasting de calidad del aire**: con menos de 1 M de parámetros, se puede entrenar y ejecutar en CPU para validar el flujo de datos CPCB antes de escalar a modelos mayores.
- **Docencia y reproducción de experimentos**: el checkpoint incluye `cfg`, `results` y logs, lo que permite reproducir el run `atlas-indiap-s400` en Kaggle y estudiar por qué el decodificador físico degradó el error.
- **Benchmark interno de la serie Paradox World Model**: sirve como punto de comparación dentro de la serie de 56 modelos para evaluar la progresión de la familia Atlas.
- **Análisis de sensibilidad espacial**: al heredar el modelado de estaciones vecinas, puede emplearse para estudiar cómo la información de redes cercanas afecta a la predicción de PM2.5 a 24 h.
- **Integración en sistemas de alerta temprana (con cautela)**: solo como componente experimental, dado que su resultado no fue adoptado y no supera a la versión anterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es lingüístico. El único dato de rendimiento registrado es la métrica de validación de la tarea de forecasting:

| Versión | Métrica de validación | Resultado |
|---|---|---|
| #48 Atlas-P (physics decoder) | Validación (métrica no especificada) | 9.227 |
| #47 Atlas v1.4n (neighbours only) | Validación (métrica no especificada) | 9.104 |

El modelo no fue adoptado al empeorar el resultado de la versión previa. No se especifica qué métrica corresponde (¿RMSE? ¿MAE? ¿pérdida?) ni las unidades.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 10 MB en FP32 (978.507 parámetros × 4 bytes ≈ 3,9 MB, coincidente con el tamaño del fichero `.pt`). Cabe en cualquier GPU, CPU o incluso en un microcontrolador con memoria suficiente.
- **GPU recomendadas**: no se requiere GPU; cualquier CPU moderna es suficiente. Para entrenamiento, una GPU consumer básica (por ejemplo, RTX 3060) es más que suficiente.
- **Cabe en GPU consumer**: sí, en cualquier GPU consumer, integrada o incluso en entornos sin GPU.
- **Opciones de despliegue**: al ser un `state_dict` de PyTorch con código de arquitectura en el repositorio de GitHub, el despliegue requiere cargar el checkpoint con `torch.load` y la definición del modelo del repositorio. No hay versiones para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- **Latencia y throughput**: no disponibles. Dado el tamaño, la inferencia es del orden de milisegundos en CPU para un lote pequeño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-P (#48, physics decoder) | 978.507 | 24 h de predicción | PM2.5 en estaciones CPCB India | Apache-2.0 | Hugging Face + GitHub |
| Atlas v1.4n (#47, neighbours only) | no disponible | 24 h de predicción | PM2.5 en estaciones CPCB India | Apache-2.0 | Hugging Face |
| Atlas S2 (#49, 3M parameters) | ~3.000.000 | no disponible | PM2.5 en estaciones CPCB India | Apache-2.0 | Hugging Face |

No se dispone de información sobre modelos de terceros comparables (por ejemplo, baselines estadísticos o de deep learning para forecasting de PM2.5) en la documentación proporcionada.

## Limitaciones y advertencias

- **Resultado negativo**: el modelo no fue adoptado porque su métrica de validación (9.227) empeora la de la versión anterior (9.104). No debe usarse como referencia de rendimiento.
- **Sesgos conocidos**: no documentados. Al entrenarse solo con estaciones CPCB de la India (2010-2023), su validez fuera de ese contexto geográfico y temporal es dudosa.
- **Riesgo de alucinación**: no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones no calibradas fuera del dominio de entrenamiento.
- **Limitaciones de contexto o idioma**: el modelo no procesa lenguaje; su "contexto" es la ventana temporal de entrada, no especificada en la model card. El horizonte de predicción es de 24 horas.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial y modificación, pero el modelo se publica como experimento no adoptado; no hay garantías de idoneidad para producción.
- **Caveat para producción**: no se incluyen los datos de entrenamiento (solo sus fuentes y términos en `DATA_SOURCES.md`), lo que limita la reproducibilidad completa. El resultado de validación no especifica la métrica ni las unidades.
- **Estado del repositorio**: 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-p
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la familia Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Versión anterior (#47 Atlas v1.4n): https://huggingface.co/PARADOXAIlabs/atlas-v1.4n
- Versión siguiente (#49 Atlas S2): https://huggingface.co/PARADOXAIlabs/atlas-scale-3m
- Índice de todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
