# nz00shuuuu/TimeRLM-TSLM-Checkpoints

## Resumen

TimeRLM-TSLM-Checkpoints es un repositorio de pesos afinados para los modelos de lenguaje de series temporales (TSLM) que sirven como línea base en el trabajo TimeRLM, una formulación de modelos de lenguaje recursivos (RLM) aplicada a la localización precisa de anomalías en series temporales largas. El repositorio incluye checkpoints para tres arquitecturas distintas —ChatTS, OpenTSLM-Flamingo e ITFormer—, cada una compuesta por un encoder Chronos-2 congelado que alimenta un backbone Qwen3.5-4B ajustado con LoRA, además de cuatro adaptadores LoRA para el baseline Toto basado en Datadog/Toto-1.0-QA-Experimental. Todos los modelos se entrenaron sobre el benchmark sintético AnomalyXL en sus variantes `precise` (respuesta estructurada de formato libre) y `coarse` (opción múltiple).

La relevancia de este repositorio radica en su enfoque de almacenamiento eficiente: en lugar de publicar los checkpoints completos (que ocupan entre 8.66 y 12.30 GB cada uno), solo se distribuyen los tensores que el entrenamiento modificó, junto con un manifiesto que permite reconstruir bitwise el estado original a partir de los pesos públicos de los modelos base. Esto reduce el tamaño del repositorio a 26.5 GB para los doce runs, evitando descargar los pesos base repetidamente. El proyecto está vinculado al paper arXiv 2608.03391 y al repositorio GitHub OpenTSLM/TimeRLM, que incluye el código de entrenamiento y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Chronos-2 congelado + backbone Qwen3.5-4B con LoRA (variantes ChatTS, OpenTSLM-Flamingo, ITFormer); adaptadores LoRA sobre Datadog/Toto-1.0-QA-Experimental |
| Parametros totales | no disponible (el backbone Qwen3.5-4B tiene ~4B, pero el total combinado no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (trained.safetensors, adapter_model.safetensors) y reconstruccion a .pt mediante script |

## Arquitectura y entrenamiento

Cada arquitectura TSLM combina un encoder Chronos-2 (modelo de series temporales de Amazon, ~0.24 GB) congelado que transforma la señal temporal en representaciones, y un backbone Qwen3.5-4B ajustado con LoRA que procesa esas representaciones junto con instrucciones textuales. Las tres variantes difieren en el mecanismo de fusión: ChatTS utiliza un proyector MLP y embeddings entrenables; OpenTSLM-Flamingo incorpora atención cruzada con gating (3.57 GB de tensores entrenados) y un Perceiver Resampler; ITFormer emplea un módulo de fusión específico y proyectores de prefijo, manteniendo congelados los embeddings del LLM. Los adaptadores Toto se construyen sobre Datadog/Toto-1.0-QA-Experimental.

El entrenamiento se realizó sobre el benchmark AnomalyXL, un conjunto sintético de larga duración para localización de anomalías, en dos variantes: `precise` (respuestas de formato libre) y `coarse` (selección múltiple). Se ejecutaron dos pasadas de entrenamiento con hiperparámetros idénticos (una original en junio de 2026 y otra `_fixtrain` en julio de 2026), diferenciándose solo en el registro de Weights & Biases. No se especifica el número de tokens de entrenamiento ni el uso de RLHF o DPO; el repositorio se centra en los checkpoints de SFT. La innovación principal del proyecto TimeRLM es mantener el contexto de la serie temporal externo al LLM, permitiendo al modelo consultarlo mediante código y capacidades de visión, en lugar de forzarlo dentro de la ventana de contexto.

## Capacidades

- Detección y localización de anomalías en series temporales largas, con salida de respuestas estructuradas (variante `precise`) o selección múltiple (variante `coarse`).
- Razonamiento temporal sobre señales numéricas mediante la combinación de encoder de series temporales y LLM.
- Procesamiento multimodal: entrada de series temporales (a través de Chronos-2) y texto (instrucciones y preguntas).
- Ajuste fino con LoRA sobre un backbone de 4B, lo que permite adaptación eficiente a dominios específicos.
- Reconstrucción bitwise de los checkpoints originales a partir de los pesos base públicos, garantizando reproducibilidad exacta.
- Soporte de múltiples arquitecturas de fusión (proyector MLP, atención cruzada con gating, fusión ITFormer) para comparar enfoques.

## Casos de uso

- Monitorización de infraestructura de TI: el modelo puede analizar métricas de rendimiento (CPU, memoria, latencia) y localizar el instante exacto de una anomalía, ayudando a los equipos de operaciones a identificar la causa raíz en sistemas distribuidos.
- Detección de fraude en transacciones financieras: aplicado a series de montos y frecuencias de transacciones, puede señalar patrones anómalos y proporcionar explicaciones estructuradas del porqué de la alerta.
- Mantenimiento predictivo en entornos industriales: con datos de sensores IoT (vibración, temperatura, presión), el modelo puede anticipar fallos de maquinaria y localizar el momento de degradación, reduciendo tiempos de inactividad.
- Análisis de tráfico de red: para detectar picos anómalos o comportamientos inusuales en series de paquetes o conexiones, útil en seguridad informática y gestión de capacidad.
- Evaluación comparativa de arquitecturas TSLM: los checkpoints permiten reproducir los experimentos de TimeRLM y comparar el rendimiento de ChatTS, OpenTSLM-Flamingo e ITFormer en tareas de localización de anomalías.
- Investigación en modelos de lenguaje recursivos: el repositorio sirve como base para experimentar con la formulación RLM, donde el contexto se mantiene externo al LLM y se consulta mediante código, abriendo vías para mejorar la precisión en razonamiento temporal.

## Benchmarks y rendimiento

Los resultados reportados en la model card corresponden a la métrica `test_primary` (precisión en opción múltiple para `coarse`, y media de la métrica primaria por categoría en [0,1] para `precise`) y `test_loss` sobre el conjunto de test retenido.

### Variante precise

| Arquitectura | Pasada | test_primary | test_loss | Mejor epoca |
|---|---|---|---|---|
| ChatTS | original | 0.0522 | 0.4372 | 1 |
| ChatTS | fixtrain | 0.0773 | 0.4193 | 1 |
| OpenTSLM-Flamingo | original | 0.0941 | 0.4228 | 1 |
| OpenTSLM-Flamingo | fixtrain | 0.0926 | 0.4104 | 4 |
| ITFormer | original | 0.0812 | 0.4073 | 2 |
| ITFormer | fixtrain | 0.0901 | 0.4075 | 2 |

### Variante coarse (opción múltiple)

| Arquitectura | Pasada | test_primary | test_loss | Mejor epoca |
|---|---|---|---|---|
| (datos no completos en la informacion disponible) | | | | |

La tabla de `coarse` no se incluyó completa en la información proporcionada; solo se muestra el encabezado. No se dispone de comparaciones con otros modelos externos en la documentación del repositorio.

## Requisitos de hardware

- Los checkpoints reconstruidos ocupan entre 8.66 GB (ChatTS) y 12.30 GB (OpenTSLM-Flamingo) en precisión completa (FP32/FP16), lo que implica una VRAM mínima de 10-14 GB para inferencia sin cuantización.
- El backbone Qwen3.5-4B (~9.7 GB en FP16) y el encoder Chronos-2 (~0.24 GB) deben cargarse en memoria; con cuantización 4-bit, el modelo podría caber en GPUs consumer de 8 GB como la RTX 3070/4060, aunque no hay datos oficiales de cuantización.
- GPUs recomendadas: para inferencia en FP16, una RTX 3090 (24 GB) o RTX 4090 (24 GB) es suficiente; para entrenamiento o fine-tuning adicional, se recomienda A100 (40/80 GB) o H100.
- Opciones de despliegue: el repositorio proporciona scripts de reconstrucción y evaluación (`reconstruct.py`, `verify_release.py`), pero no se mencionan integraciones con vLLM, llama.cpp u Ollama. El código de entrenamiento está en el repositorio TimeRLM bajo `sft/tslm/`.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente este conjunto de checkpoints con otros modelos de la misma categoría (TSLM para detección de anomalías). Los modelos base (Qwen3.5-4B, Chronos-2) son públicos, pero no se han publicado comparativas con alternativas como Chronos-1, TimesFM o Lag-Llama en el contexto de este trabajo. La documentación se centra en la comparación interna entre las tres arquitecturas TSLM y el baseline Toto.

## Limitaciones y advertencias

- El entrenamiento se realizó exclusivamente sobre AnomalyXL, un benchmark sintético; el rendimiento en series temporales reales puede degradarse significativamente.
- Los valores de `test_primary` en la variante `precise` son bajos (entre 0.05 y 0.09), lo que sugiere que la tarea de respuesta estructurada es compleja y los modelos aún tienen margen de mejora.
- No se documentan sesgos específicos, pero al ser modelos basados en Qwen3.5-4B, pueden heredar sesgos del preentrenamiento general del LLM.
- Riesgo de alucinación en las respuestas de formato libre, especialmente en la variante `precise`, donde el modelo debe generar explicaciones textuales.
- La reconstrucción de los checkpoints requiere descargar los pesos base (Qwen3.5-4B y Chronos-2) desde Hugging Face, lo que implica un consumo de ancho de banda de ~10 GB adicionales.
- Los adaptadores Toto se basan en un modelo experimental (Toto-1.0-QA-Experimental) que puede no estar optimizado para producción.
- La licencia Apache-2.0 permite uso comercial, pero los modelos base (Qwen3.5-4B, Chronos-2) tienen sus propias licencias que deben verificarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nz00shuuuu/TimeRLM-TSLM-Checkpoints
- Repositorio GitHub TimeRLM: https://github.com/OpenTSLM/TimeRLM
- Paper arXiv: https://arxiv.org/abs/2608.03391
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base Chronos-2: https://huggingface.co/amazon/chronos-2
- Modelo base Toto-1.0-QA-Experimental: https://huggingface.co/Datadog/Toto-1.0-QA-Experimental
- Repositorio de checkpoints OpenTSLM: https://huggingface.co/nz00shuuuu/opentslm-checkpoints
