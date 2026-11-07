# cyttic/hmt-trocrscratchline-elastic1-s42

## Resumen

`cyttic/hmt-trocrscratchline-elastic1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un experimento de aumento de datos (*augmentation study*) dentro del proyecto htr-metrics-transfer, en el que se evalúa el impacto de la técnica de aumento `elastic1` sobre una arquitectura TrOCR entrenada desde cero (*scratch*) y con decodificación CTC. El modelo se entrena con semilla 42 y se publica como artefacto reproducible del estudio.

El modelo resuelve la transcripción de líneas de texto manuscrito en hebreo (`he`). Con 22,4 millones de parámetros, es un modelo compacto orientado a investigación más que a producción: su interés radica en servir como punto de comparación dentro de un estudio sistemático de aumentación de datos, no en competir con sistemas HTR de gran escala.

Es relevante ahora porque expone de forma transparente una configuración concreta (arquitectura, aumentación y semilla) junto con métricas de evaluación (CER 0,3391 y WER 0,9297 sobre el test HHD Option-B), lo que facilita la replicación y el análisis comparativo de técnicas de aumentación en HTR de bajos recursos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR entrenado desde cero con cabecera CTC (*trocrscratchline*) |
| Parámetros totales | 22.421.004 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR (*Transformer-based Optical Character Recognition*), pero entrenado desde cero en lugar de partir de un checkpoint preentrenado, y con decodificación CTC en lugar de decodificación autorregresiva. La variante se denomina `trocrscratchline`, lo que sugiere un modelo orientado a líneas de texto. El tamaño de 22,4 millones de parámetros es coherente con un transformer compacto, adecuado para un corpus de entrenamiento limitado.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores (*writers*) del split de desarrollo, con la aumentación `elastic1` y semilla 42. La evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales; los detalles se remiten a `results.json` en el repositorio.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) a nivel de línea en hebreo.
- Decodificación CTC con estrategia greedy.
- Salida de transcripción de secuencias de caracteres sin modelo de lenguaje externo.
- Entrenado específicamente para el dominio del corpus HHD Option-B.
- No dispone de soporte de tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni comportamiento de agente.
- No incorpora capacidades de visión general, audio ni modo *thinking*.
- Multilingüismo limitado al hebreo; no se documentan otros idiomas.

## Casos de uso

- Investigación en aumentación de datos para HTR: sirve como configuración de referencia (`elastic1`, semilla 42) para comparar el efecto de distintas técnicas de aumentación sobre la tasa de error de caracteres.
- Reproducción de experimentos: al publicarse pesos y métricas, permite replicar el resultado CER 0,3391 / WER 0,9297 y verificar la metodología del estudio htr-metrics-transfer.
- Transcripción de líneas manuscritas en hebreo en corpus históricos o documentales, siempre que el dominio se ajuste al del corpus HHD Option-B.
- Generación de líneas base (*baselines*) para sistemas HTR en hebreo: un modelo de 22,4 M de parámetros y 0,1 GB de repositorio es barato de desplegar como referencia mínima.
- Evaluación comparativa de decodificación CTC frente a decodificación autorregresiva en reconocimiento de escritura a mano.
- Docencia y experimentación: por su tamaño reducido, es viable entrenarlo y ajustarlo en hardware modesto para prácticas de HTR.
- Análisis de errores por escritor: al haberse excluido los escritores de desarrollo del entrenamiento, permite estudiar generalización a escritores no vistos.

## Benchmarks y rendimiento

| Conjunto de evaluación | Decodificación | LM | CER | WER |
|---|---|---|---|---|
| HHD Option-B test | Greedy | No | 0,3391 | 0,9297 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales por escritor o por subconjunto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (22,4 M de parámetros); en la práctica, unos pocos cientos de MB incluyendo activaciones para líneas individuales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, GTX 1660, etc.) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: al ser un modelo safetensors de TrOCR, puede cargarse con la librería `transformers` de Hugging Face; el soporte en vLLM, llama.cpp u Ollama no está documentado y probablemente no sea directo por tratarse de un modelo de visión/OCR y no de un LLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchline-elastic1-s42 | 22,4 M | no disponible | 0,3391 | MIT | Hugging Face |
| TrOCR base (Microsoft) | no disponible en esta ficha | no disponible | no disponible | MIT | Hugging Face |
| Otros modelos del estudio htr-metrics-transfer | no disponible | no disponible | no disponible | MIT (presumible) | Hugging Face (cyttic) |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas de la misma categoría; la información proporcionada solo incluye las métricas de este modelo.

## Limitaciones y advertencias

- El CER de 0,3391 y el WER de 0,9297 indican un rendimiento bajo para uso en producción: aproximadamente un tercio de los caracteres se transcriben incorrectamente y la tasa de error a nivel de palabra es muy alta.
- El modelo está entrenado sin modelo de lenguaje, lo que limita la corrección contextual de errores.
- Solo soporta hebreo; no se documenta generalización a otros idiomas o alfabetos.
- El dominio de entrenamiento se restringe al corpus HHD Option-B; el rendimiento fuera de ese dominio (otras manos, épocas o estilos) es desconocido.
- Es un artefacto de investigación con 0 descargas y 0 likes; no hay evidencia de validación externa.
- Riesgo de sesgo hacia los escritores y estilos presentes en el corpus de entrenamiento, con posible degradación en escritores no vistos.
- Riesgo de alucinación en el sentido de sustituciones o inserciones de caracteres plausibles pero incorrectos, propio de los sistemas CTC sin LM.
- Licencia MIT: permite uso comercial, pero el bajo rendimiento desaconseja su uso en producción sin evaluación adicional.
- No se documentan requisitos de contexto, cuantizaciones ni latencias, lo que dificulta planificar un despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-elastic1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo (https://huggingface.co/cyttic/hmt-trocrscratchline-elastic1-s42/blob/main/results.json)
- Perfil del autor: https://huggingface.co/cyttic
- Paper de TrOCR: https://arxiv.org/abs/2109.10282
