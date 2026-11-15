# gamamima/whisper-small-kikamba_lora_adapter

## Resumen

El modelo `whisper-small-kikamba_lora_adapter` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario gamamima sobre el modelo base `openai/whisper-small`, especializado en reconocimiento automático del habla (ASR) para el idioma kikamba. Se distribuye como pesos PEFT independientes que deben cargarse junto al modelo base de Whisper, lo que permite ajustar el comportamiento del modelo original sin duplicar los pesos completos.

El problema que resuelve es la baja cobertura de lenguas de bajos recursos en los sistemas ASR comerciales: Whisper, pese a su amplia cobertura multilingüe, no rinde de forma fiable en kikamba. Este adaptador permite obtener transcripciones específicas para ese idioma con un coste de almacenamiento y entrenamiento muy reducido (el repositorio ocupa aproximadamente 0,1 GB).

El modelo se publica bajo licencia MIT y está pensado para integrarse en pipelines de `transformers` y `peft`. No se han publicado detalles sobre arquitectura interna del adaptador, hiperparámetros de entrenamiento ni métricas de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre `openai/whisper-small` (transformer encoder-decoder para ASR) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base `whisper-small` tiene 244 M de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; Whisper-small procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (los pesos LoRA se distribuyen en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | kikamba (objetivo del ajuste); el modelo base soporta multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/whisper-small`, un transformer encoder-decoder de tipo seq2seq diseñado para ASR, con 244 millones de parámetros en su versión base. La técnica LoRA congela los pesos originales e inyecta matrices de bajo rango en determinadas capas, de modo que solo se entrenan y almacenan esos parámetros adicionales. El resultado es un artefacto pequeño que modifica el comportamiento del modelo base para el dominio objetivo.

El ajuste se realizó sobre el dataset `Digital-Divide-Data/Kamba-ASR-Data-Subset-484H`, un subconjunto de datos ASR en kikamba. No se dispone de información sobre el número de tokens o horas de audio utilizadas, la composición exacta del dataset, los hiperparámetros de entrenamiento (rango LoRA, alpha, tasa de aprendizaje, épocas) ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se documentan innovaciones técnicas más allá del propio ajuste LoRA.

## Capacidades

- Reconocimiento automático del habla (ASR) en kikamba: transcribe audio a texto en ese idioma.
- Ajuste específico de dominio sobre un modelo base multilingüe, lo que permite conservar parte de las capacidades generales de Whisper mientras se especializa en kikamba.
- Integración con el ecosistema `transformers` y `peft` para carga del adaptador junto al modelo base.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en el repositorio).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR estándar de Whisper.
- No se documentan capacidades multilingües adicionales más allá del kikamba objetivo.

## Casos de uso

- Transcripción de audio en kikamba para archivos y documentación: el adaptador permite convertir grabaciones en texto para preservar y digitalizar contenido oral en esta lengua de bajos recursos, usando el modelo base Whisper-small como punto de partida.
- Subtitulado automático de vídeo y audio en kikamba: se puede integrar en pipelines de generación de subtítulos para medios comunitarios o educativos, aprovechando la ventana de 30 s de Whisper para segmentar el audio.
- Investigación lingüística y corpus orales: útil para proyectos de documentación de lenguas africanas que necesiten transcripciones preliminares que luego se revisen manualmente.
- Asistentes de voz para servicios comunitarios: despliegue en entornos con recursos limitados gracias al tamaño reducido del adaptador y del modelo base (244 M de parámetros).
- Evaluación comparativa de ASR de bajos recursos: sirve como referencia para medir la mejora que aporta el ajuste LoRA frente al Whisper-small original en kikamba.
- Prototipado rápido en `transformers`: al ser un adaptador PEFT, permite experimentar con el modelo base y el adaptador por separado, facilitando la iteración en investigación sin necesidad de gestionar pesos completos duplicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base `whisper-small` (244 M de parámetros) requiere aproximadamente 1-2 GB en precisión FP16, más el pequeño overhead del adaptador LoRA (0,1 GB en disco). En cuantización de 8 bits o 4 bits el consumo puede reducirse por debajo de 1 GB, aunque no se documentan cuantizaciones específicas para este adaptador.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con holgura. Para despliegues en servidor, una T4 o A10 es más que suficiente.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer actuales e incluso en CPU para inferencia no interactiva.
- Opciones de despliegue: `transformers` con `peft` (carga del adaptador), vLLM o TGI para servir el modelo fusionado (`gamamima/whisper_finetuned_kikamba`), y llama.cpp/Ollama no aplican de forma estándar a Whisper.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma objetivo | Licencia | Formato |
|---|---|---|---|---|---|
| `gamamima/whisper-small-kikamba_lora_adapter` | Adaptador LoRA sobre 244 M | Ventana de audio de 30 s (heredada) | Kikamba | MIT | safetensors (PEFT) |
| `openai/whisper-small` | 244 M | Ventana de audio de 30 s | Multilingue (sin ajuste específico) | MIT | safetensors |
| `gamamima/whisper_finetuned_kikamba` | 244 M (modelo fusionado) | Ventana de audio de 30 s | Kikamba | no disponible en la informacion | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador debe cargarse junto al modelo base `openai/whisper-small`; no es un modelo autónomo. Para inferencia estándar sin gestionar dos artefactos, el autor recomienda la versión fusionada `gamamima/whisper_finetuned_kikamba`.
- No se han publicado métricas de evaluación (WER, CER) en la información disponible, por lo que se desconoce la calidad real de las transcripciones.
- El ajuste se limita a un subconjunto de datos (`Kamba-ASR-Data-Subset-484H`); el rendimiento puede degradarse fuera del dominio de entrenamiento (acentos, ruido, vocabulario técnico).
- Riesgo de alucinación inherente a los modelos Whisper: pueden generar texto plausible pero incorrecto en segmentos de audio ambiguos o silenciosos.
- No se documentan sesgos específicos, pero al ser una lengua de bajos recursos, la cobertura léxica y la representación pueden ser limitadas.
- Licencia MIT: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y del dataset de entrenamiento, que no se detallan en la información disponible.
- No se documentan los idiomas soportados más allá del kikamba; el comportamiento multilingüe del modelo base puede verse alterado por el ajuste.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/gamamima/whisper-small-kikamba_lora_adapter
- Modelo base: https://huggingface.co/openai/whisper-small
- Modelo fusionado alternativo: https://huggingface.co/gamamima/whisper_finetuned_kikamba
- Dataset de entrenamiento: https://huggingface.co/datasets/Digital-Divide-Data/Kamba-ASR-Data-Subset-484H
