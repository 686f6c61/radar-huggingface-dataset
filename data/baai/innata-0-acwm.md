# BAAI/Innata-0-ACWM

## Resumen

Innata-0-ACWM es un modelo de mundo (*world model*) condicionado por acciones, desarrollado por BAAI (Beijing Academy of Artificial Intelligence) y publicado en Hugging Face bajo el identificador `BAAI/Innata-0-ACWM`. Su propósito es la predicción de vídeo: dado un contexto visual y una secuencia de acciones, el modelo genera la evolución esperada de la escena. Este tipo de modelo resulta clave en robótica, conducción autónoma y simulación, donde permite planificar y evaluar políticas sin necesidad de ejecutarlas en el mundo real.

La arquitectura es de dos torres (*two-tower*), según la model card, e incluye código personalizado (`custom_code`) y el tag `cosmos3_omni`, lo que sugiere una integración con el ecosistema Cosmos de NVIDIA para modelos de mundo. Los pesos exportados corresponden al paso 115 del checkpoint A115, en versión EMA, empleados para la competición WorldArena 2.0 Track 1. El repositorio ocupa 31,5 GB y contiene 15.749.524.912 parámetros en formato safetensors.

La relevancia de este modelo radica en su orientación a evaluación comparativa en un *benchmark* específico de modelos de mundo, y en que BAAI publica los pesos junto con un repositorio de inferencia separado. No obstante, la información pública disponible es muy limitada: no se detallan licencia, idiomas, contexto ni benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Two-tower action-conditioned world model (tag `cosmos3_omni`) |
| Parametros totales | 15.749.524.912 (~15,75 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La model card describe el modelo como un *two-tower action-conditioned world model* para predicción de vídeo. La estructura de dos torres sugiere una separación entre la codificación del estado visual y la codificación de las acciones, que se combinan para predecir fotogramas futuros. El tag `cosmos3_omni` apunta a una posible base en la familia Cosmos de modelos de mundo, aunque no se detalla la relación exacta.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El checkpoint publicado es el paso 115 (A115) en versión EMA, lo que indica que se trata de un modelo en entrenamiento o de un checkpoint intermedio seleccionado para la competición WorldArena 2.0 Track 1. No se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Predicción de vídeo condicionada por acciones: genera la evolución futura de una escena a partir de un contexto visual y una secuencia de acciones.
- Modelado de mundo para planificación: permite simular trayectorias y evaluar políticas sin ejecución real.
- Integración con el ecosistema Cosmos (`cosmos3_omni`), orientado a simulación y generación de vídeo.
- Exportación con código personalizado (`custom_code`), lo que implica que la carga requiere `trust_remote_code=True`.
- No se documentan capacidades de *tool calling*, agentes, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Simulación para robótica: el modelo puede predecir la evolución visual de una escena tras aplicar una secuencia de acciones de un robot, lo que permite evaluar políticas de control antes de desplegarlas en hardware real.
- Conducción autónoma: predicción de escenarios futuros a partir de observaciones y acciones del vehículo, útil para validación de planificadores en entornos simulados.
- Evaluación comparativa de modelos de mundo: al estar asociado a WorldArena 2.0 Track 1, sirve como referencia para comparar arquitecturas de predicción de vídeo condicionada por acciones.
- Generación de datos sintéticos: producción de secuencias de vídeo plausibles para aumentar datasets de entrenamiento en percepción y control.
- Investigación en model-based RL: uso del modelo como simulador interno para entrenar agentes con planificación basada en modelos.
- Análisis de robustez: estudio de cómo el modelo responde a acciones fuera de distribución y su capacidad de generalización en escenas novedosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 15,75 mil millones de parámetros, en FP16 se requieren aproximadamente 31,5 GB de VRAM solo para los pesos; en FP32, unos 63 GB. En cuantizaciones de 8 bits, alrededor de 16 GB, y en 4 bits, unos 8 GB, aunque no se confirman formatos de cuantización soportados.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con al menos 32 GB para FP16. Para cuantización 8 bits, una RTX 4090 (24 GB) podría ser suficiente, aunque no está verificado.
- Cabe en GPU de consumo: posiblemente en RTX 4090 o RTX 3090 con cuantización, pero no hay datos oficiales.
- Opciones de despliegue: el repositorio de inferencia de BAAI (`baai-eai/innata-framework-inference`) es la vía documentada. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI, dado que se trata de un modelo de vídeo con código personalizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la misma categoría (modelos de mundo condicionados por acciones) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Información muy escasa: la model card no detalla licencia, idiomas, contexto ni composición del dataset, lo que dificulta evaluar su idoneidad para producción.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con BAAI antes de cualquier despliegue comercial.
- Checkpoint intermedio: al ser el paso 115 (EMA) de un entrenamiento, puede no representar el estado final ni el mejor rendimiento del modelo.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir predicciones plausibles pero incorrectas, especialmente en escenarios fuera de distribución.
- Requiere `trust_remote_code=True` por el código personalizado, lo que implica revisar el código antes de ejecutarlo.
- Sin datos de sesgos: no se documentan sesgos conocidos ni evaluaciones de equidad.
- Orientado a un benchmark específico: su diseño para WorldArena 2.0 Track 1 puede limitar su generalización a otros dominios.

## Enlaces

- Hugging Face: https://huggingface.co/BAAI/Innata-0-ACWM
- Repositorio de inferencia: https://github.com/baai-eai/innata-framework-inference#release-checkpoint-inference
