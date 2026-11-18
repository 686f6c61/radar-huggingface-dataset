# nesoai/amazon-chronos-t5-small

## Resumen

Chronos-T5 (small) es un modelo fundacional preentrenado para pronóstico de series temporales, desarrollado originalmente por Amazon Science y redistribuido en este repositorio por el usuario `nesoai`. A diferencia de los modelos de series temporales clásicos, Chronos trata la predicción como una tarea de modelado de lenguaje: la serie histórica se escala y se cuantiza en una secuencia de tokens discretos, y un modelo tipo T5 se entrena para predecir esa secuencia con pérdida de entropía cruzada. Las predicciones probabilísticas se obtienen muestreando múltiples trayectorias futuras.

La arquitectura subyacente es T5 (encoder-decoder), concretamente una variante de `t5-efficient-small`, con un vocabulario reducido de 4096 tokens en lugar de los 32128 del T5 original. El modelo cuenta con 46.154.240 parámetros y está pensado para inferencia ligera: el repositorio ocupa 0,2 GB. Es relevante porque ofrece pronóstico zero-shot sin entrenamiento específico por dominio, con una huella de recursos muy baja apta para CPU y GPUs de consumo.

Este repositorio concreto es una copia del modelo `amazon/chronos-t5-small`; la model card indica que existe una versión más reciente (`amazon/chronos-2`) y que los modelos Chronos-Bolt son más precisos (5 % menos error), hasta 250 veces más rápidos y 20 veces más eficientes en memoria que los Chronos originales del mismo tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (basada en t5-efficient-small), vocabulario de 4096 tokens |
| Parámetros totales | 46.154.240 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (pesos en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Chronos transforma una serie temporal en tokens mediante escalado y cuantización, y entrena un modelo de lenguaje sobre esos tokens con entropía cruzada. En esta variante el backbone es T5, con la única modificación del tamaño de vocabulario (4096 tokens frente a 32128 del T5 estándar), lo que reduce el número de parámetros. En inferencia, el modelo muestrea autorregresivamente múltiples trayectorias de tokens y las remapea a valores numéricos, produciendo una distribución predictiva en lugar de un único punto.

El entrenamiento se realizó sobre un corpus amplio de series temporales públicas junto con datos sintéticos generados mediante procesos gaussianos. La model card no detalla el número exacto de tokens de entrenamiento ni la composición pormenorizada del dataset, y no se menciona el uso de RLHF o DPO (no aplicable a este tipo de modelo). La innovación principal es el enfoque de "lenguaje de series temporales": permite pronóstico zero-shot y probabilístico sin ajuste por dominio, reutilizando infraestructura de modelado de lenguaje.

## Capacidades

- Pronóstico de series temporales univariadas y por lotes (el contexto puede ser un tensor 1D, una lista de tensores 1D o un tensor 2D con padding a la izquierda).
- Predicción probabilística mediante muestreo de múltiples trayectorias y cálculo de cuantiles (por ejemplo, intervalos del 80 %).
- Pronóstico zero-shot sin entrenamiento específico sobre la serie objetivo.
- Manejo de distintas frecuencias y escalas gracias al escalado y la cuantización previa de la entrada.
- Inferencia en GPU (ejemplo con `device_map="cuda"` y `torch_dtype=torch.bfloat16`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step; no es un modelo de lenguaje natural.
- No dispone de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Pronóstico de demanda en retail: usar el modelo para predecir ventas por producto a horizonte semanal o mensual, aprovechando el muestreo probabilístico para dimensionar stock con intervalos de confianza.
- Planificación de capacidad en infraestructura: pronosticar métricas de carga (CPU, peticiones por segundo, latencia) a partir del histórico para anticipar escalado.
- Predicción de series financieras agregadas: estimar tendencias de indicadores con incertidumbre cuantificada, útil para escenarios y no para trading de alta frecuencia.
- Monitorización industrial y mantenimiento predictivo: pronosticar lecturas de sensores (temperatura, vibración) y detectar desviaciones frente al intervalo de predicción.
- Gestión energética: prever consumo eléctrico horario o generación renovable a corto plazo con bandas de incertidumbre para ajustar reservas.
- Prototipado rápido en notebooks: al ocupar 0,2 GB y 46 M de parámetros, permite iterar en local o en CPU para validar pipelines de forecasting antes de pasar a modelos mayores.
- Rellenado de huecos y análisis exploratorio: generar trayectorias plausibles para series con datos faltantes y comparar escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 46 M de parámetros en bfloat16 los pesos ocupan aproximadamente 0,09 GB, por lo que el modelo cabe holgadamente en cualquier GPU con 1-2 GB libres.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier modelo consumer es suficiente (RTX 3060, RTX 4090, etc.), así como A100 o H100 para despliegues por lotes a gran escala.
- Cabe en GPU de consumo: sí, en todas las gamas actuales, e incluso en entornos sin GPU.
- Opciones de despliegue: paquete `chronos-forecasting` (`ChronosPipeline.from_pretrained`), con soporte de `device_map` para GPU; también disponible en Amazon SageMaker JumpStart según la model card. No se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la model card señala que Chronos-Bolt es hasta 250 veces más rápido que los Chronos originales del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chronos-t5-small (este repo) | 46 M | no disponible | referencia base | Apache 2.0 | Hugging Face |
| amazon/chronos-t5-small | 46 M | no disponible | referencia base | Apache 2.0 | Hugging Face (oficial) |
| amazon/chronos-bolt-small | no disponible | no disponible | 5 % menos error, hasta 250× más rápido y 20× más eficiente en memoria que Chronos del mismo tamaño | no disponible en la información | Hugging Face |
| amazon/chronos-2 | no disponible | no disponible | no disponible | no disponible | Hugging Face (versión más reciente) |

## Limitaciones y advertencias

- Este repositorio es una redistribución no oficial por parte de `nesoai`; para producción conviene usar el repositorio oficial `amazon/chronos-t5-small` o las versiones más recientes.
- La model card apunta a `amazon/chronos-2` como nueva versión y a Chronos-Bolt como alternativa más precisa y eficiente; usar esta variante implica asumir un rendimiento inferior a las versiones actuales.
- Modelo numérico: no procesa texto ni instrucciones; no debe emplearse como LLM.
- Riesgo de pronósticos poco fiables en series con distribución muy distinta a la del entrenamiento (cambios de régimen, eventos extremos, series muy cortas).
- El muestreo introduce variabilidad entre ejecuciones; los intervalos de predicción dependen del número de muestras y de su calibración.
- No se documentan sesgos específicos ni limitaciones de idioma (no aplica), pero tampoco se detalla la composición del corpus de entrenamiento, lo que dificulta evaluar sesgos de dominio.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución.
- No hay información sobre límites de contexto; series muy largas pueden requerir truncado o ventanas deslizantes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nesoai/amazon-chronos-t5-small
- Modelo oficial: https://huggingface.co/amazon/chronos-t5-small
- Chronos-Bolt small: https://huggingface.co/amazon/chronos-bolt-small
- Paper Chronos: https://arxiv.org/abs/2403.07815
- Paper T5: https://arxiv.org/abs/1910.10683
- Repositorio de código: https://github.com/amazon-science/chronos-forecasting
- Notebook de despliegue en SageMaker: https://github.com/amazon-science/chronos-forecasting/blob/main/notebooks/deploy-chronos-to-amazon-sagemaker.ipynb
- OpenReview del paper: https://openreview.net/forum?id=gerNCVqqtR
