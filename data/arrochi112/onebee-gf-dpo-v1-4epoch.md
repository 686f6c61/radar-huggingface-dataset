# arrochi112/onebee-gf-dpo-v1-4epoch

## Resumen

onebee-gf-dpo-v1-4epoch es un adaptador LoRA sobre el modelo multimodal google/gemma-4-E2B-it, desarrollado por arrochi112 como parte del proyecto de investigacion open-source small-mind-companion. El proyecto explora cuanta capacidad aparente puede recuperar un modelo pequeno (entre 2 y 4 mil millones de parametros) con capacidad de vision mediante post-entrenamiento, memoria externa y recuperacion, en lugar de escalar el numero de parametros.

Este checkpoint concreto es un experimento deliberado de sobreajuste: se entreno con DPO (Direct Preference Optimization) durante 4 epocas sobre el mismo dataset de 200 pares de preferencias de la version v0, logrando un ajuste casi perfecto al conjunto de entrenamiento pero con una regresion cualitativa real en al menos un prompt de evaluacion. El propio autor lo describe como "no el checkpoint recomendado" y lo presenta como un experimento de investigacion sobre los limites del sobreajuste en DPO.

El modelo hereda la licencia Gemma del modelo base y esta disponible en formato safetensors con un tamano de repositorio de 10,2 GB, correspondiente a 5.104.297.539 parametros totales (modelo fusionado en FP16). Se publico el 14 de agosto de 2026 y no registra descargas ni valoraciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 4 E2B) con adaptador LoRA |
| Parametros totales | 5.104.297.539 (~5,1 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repositorio en safetensors, presumiblemente FP16) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (heredada del modelo base google/gemma-4-E2B-it) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un modelo multimodal de la familia Gemma 4 de Google con capacidad de procesamiento de vision y texto. Sobre este modelo base se aplico un adaptador LoRA entrenado mediante DPO durante 4 epocas sobre un dataset de 200 pares de preferencias (version v0 del dataset del proyecto small-mind-companion).

El entrenamiento fue concebido explicitamente como un experimento de sobreajuste: se busco verificar que ocurre cuando se entrena DPO durante demasiadas epocas sobre un dataset muy pequeno. El resultado fue un ajuste casi perfecto al conjunto de entrenamiento (train-set fit) acompanado de una regresion cualitativa real en al menos un prompt de evaluacion. El autor documenta este resultado como un hallazgo negativo honesto, en linea con la filosofia del proyecto de reportar resultados negativos o inconcluyentes con la misma transparencia que los positivos.

El proyecto small-mind-companion documenta ademas bugs reales encontrados, diagnosticados y corregidos durante el desarrollo, accesibles en la seccion "Engineering highlights" del repositorio de GitHub. La documentacion completa de resultados, metodologia y limitaciones se encuentra en `docs/dpo_results.md`.

## Capacidades

- Generacion de texto y dialogo conversacional orientado a companion (acompanamiento), el caso de uso central del proyecto.
- Capacidad multimodal: procesamiento de entrada de vision ademas de texto, heredada del modelo base Gemma 4 E2B.
- Alineacion por preferencias mediante DPO para mejorar la calidad de las respuestas en el dominio companion.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso especificas en la informacion disponible.
- No se documenta modo de pensamiento (thinking mode) ni capacidades de audio.

## Casos de uso

- Investigacion academica sobre sobreajuste en DPO: el modelo sirve como artefacto de estudio para analizar como el exceso de epocas en datasets pequenos degrada la calidad generativa, comparandolo con los checkpoints v1-scale (el recomendado del proyecto).
- Analisis de regresion cualitativa: permite estudiar en que prompts concretos falla el modelo tras el sobreajuste y contrastarlo con el comportamiento del checkpoint SFT v1, que representa el mejor resultado de la fase SFT.
- Comparativa de curvas de entrenamiento: junto con los demas checkpoints del proyecto (sft-v0, sft-v1, dpo-v0, dpo-v1-scale), permite trazar la evolucion de la calidad a lo largo del pipeline completo de post-entrenamiento.
- Evaluacion de metricas de train-set fit: util para investigar la correlacion entre el ajuste al conjunto de entrenamiento y la calidad real en inferencia, un tema relevante para la comunidad de alineacion.
- Benchmarking de metodos de regularizacion: punto de partida para probar tecnicas que mitiguen el sobreajuste en DPO con datasets pequenos, como early stopping, weight decay o datasets mas grandes.
- Reproducibilidad cientifica: al estar publicado con documentacion honesta de sus limitaciones, sirve como referencia para la comunidad de investigacion en alineacion de modelos pequenos con capacidad multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a la documentacion del proyecto en `docs/dpo_results.md` del repositorio de GitHub para resultados completos, metodologia y limitaciones. No se proporcionan metricas como MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 12 GB (10,2 GB de pesos + overhead de KV cache y activaciones).
- GPU recomendadas: RTX 4080 o RTX 4090 (16-24 GB VRAM), A100 40 GB o H100 para entornos de servidor.
- En consumer GPU con 8 GB de VRAM solo seria viable con cuantizacion a 8 bits o inferior, pero no se proporcionan cuantizaciones para este checkpoint especifico (el proyecto publica GGUF solo para el checkpoint v1-scale).
- Opciones de despliegue: no documentadas especificamente para este checkpoint. El proyecto publica cuantizaciones GGUF solo para el checkpoint recomendado (v1-scale), lo que sugiere que este checkpoint no esta destinado a despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparacion con los otros checkpoints del mismo proyecto small-mind-companion, todos sobre la misma base Gemma 4 E2B:

| Checkpoint | Descripcion | Estado |
|---|---|---|
| onebee-gf-sft-v0 | SFT dia 4, dataset v0 | Superado por v1 |
| onebee-gf-sft-v1 | SFT a escala adecuada | Mejor checkpoint SFT |
| onebee-gf-dpo-v0 | DPO semana 2, dataset v0 | Superado por v1-scale |
| onebee-gf-dpo-v1-4epoch | DPO 4 epocas (este modelo) | Experimento de sobreajuste, no recomendado |
| onebee-gf-dpo-v1-scale | DPO a escala adecuada | Mejor checkpoint global del proyecto |
| onebee-gf-dpo-v1-scale-gguf | Cuantizaciones GGUF del mejor checkpoint | Para despliegue en hardware de consumo |

No se dispone de comparativa con modelos externos de la misma categoria (modelos companion pequenos con vision) en la informacion proporcionada.

## Limitaciones y advertencias

- Sobreajuste deliberado: el modelo fue entrenado explicitamente para sobreajustar (4 epocas sobre 200 pares de preferencias), con ajuste casi perfecto al conjunto de entrenamiento y regresion cualitativa confirmada en al menos un prompt.
- No es el checkpoint recomendado: el autor recomienda onebee-gf-dpo-v1-scale como el mejor checkpoint del proyecto para cualquier uso practico.
- Uso en produccion desaconsejado: es un artefacto de investigacion, no un modelo listo para despliegue en aplicaciones reales.
- Dataset de entrenamiento muy pequeno: 200 pares de preferencias, lo que limita severamente la generalizacion a dominios fuera del conjunto de entrenamiento.
- Sesgos y alucinaciones: no documentados especificamente para este checkpoint, pero inherentes al modelo base Gemma y potencialmente amplificados por el sobreajuste.
- Restricciones de licencia: hereda los terminos de la licencia Gemma de Google, que incluyen restricciones de uso comercial especificas que deben revisarse antes de cualquier despliegue.
- Idiomas soportados: no documentados en la informacion disponible.
- Sin cuantizaciones publicadas: a diferencia del checkpoint v1-scale, este modelo no tiene versiones GGUF, lo que limita su uso en hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arrochi112/onebee-gf-dpo-v1-4epoch
- Proyecto small-mind-companion (GitHub): https://github.com/arrogance231/small-mind-companion
- Documentacion de resultados DPO: https://github.com/arrogance231/small-mind-companion/blob/main/docs/dpo_results.md
- Checkpoint SFT v0: https://huggingface.co/arrochi112/onebee-gf-sft-v0
- Checkpoint SFT v1: https://huggingface.co/arrochi112/onebee-gf-sft-v1
- Checkpoint DPO v0: https://huggingface.co/arrochi112/onebee-gf-dpo-v0
- Checkpoint DPO v1-scale: https://huggingface.co/arrochi112/onebee-gf-dpo-v1-scale
- Checkpoint DPO v1-scale GGUF: https://huggingface.co/arrochi112/onebee-gf-dpo-v1-scale-gguf
