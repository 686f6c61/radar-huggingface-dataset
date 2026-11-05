# cyttic/hmt-trocrscratch-elastic3-s42

## Resumen

`cyttic/hmt-trocrscratch-elastic3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un checkpoint experimental dentro de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se entrena una variante de TrOCR desde cero (`trocrscratch`) con una política de aumento concreta (`elastic3`) y una semilla fija (42). El modelo está pensado para transcribir texto manuscrito en hebreo (`he`) y se distribuye con licencia MIT.

El modelo tiene 22.421.004 parámetros y se publica en formato `safetensors` con un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la franja de modelos ligeros desplegables en hardware modesto. Su cabecera de decodificación es CTC (sin modelo de lenguaje externo en la evaluación reportada), y el autor documenta un CER de 0,2153 y un WER de 0,7411 sobre el conjunto de test HHD Option-B con decodificación greedy.

La relevancia de esta ficha es acotada: no es un modelo de propósito general ni un asistente conversacional, sino un artefacto de investigación reproducible para medir cómo distintas estrategias de aumentación afectan a la transferencia de métricas en HTR. Resulta útil para quien investigue aumentación de datos en reconocimiento de escritura manuscrita o necesite una línea base ligera para hebreo manuscrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR entrenado desde cero (encoder-decoder transformer para HTR; detalles internos no disponibles) |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, es decir, un transformer encoder-decoder orientado a reconocimiento de texto a partir de imágenes, entrenado desde cero (`trocrscratch`) en lugar de partir de un checkpoint preentrenado. La decodificación empleada en la evaluación es CTC con decodificación greedy y sin modelo de lenguaje, según indica la model card. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni sobre si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente en HTR).

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con la política de aumentación `elastic3` y semilla 42. La innovación declarada no es arquitectónica sino metodológica: el modelo forma parte de un estudio de transferencia de métricas (`htr-metrics-transfer`) que compara configuraciones de aumentación bajo condiciones controladas de datos y semilla, lo que permite atribuir diferencias de rendimiento al pipeline de aumentación.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a partir de imágenes de línea o región de texto.
- Decodificación CTC con salida de secuencia de caracteres; evaluación reportada con decodificación greedy y sin modelo de lenguaje.
- Entrenamiento desde cero, sin dependencia de pesos preentrenados de TrOCR en el checkpoint publicado.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades multimodales más allá de la entrada de imagen para transcripción, ni modo de razonamiento explícito, audio o vídeo.
- Cobertura multilingüe limitada al hebreo según el campo `language` de la model card.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de manuscritos escaneados en pipelines de OCR/HTR por lotes, aprovechando su tamaño reducido (22,4 M de parámetros) para procesar volúmenes altos en CPU o GPU modesta.
- Línea base reproducible en investigación de aumentación: sirve como referencia controlada (semilla 42, aumentación `elastic3`) para comparar el efecto de otras políticas de aumento sobre CER y WER en el mismo split.
- Evaluación de transferencia de métricas: útil para estudiar si las mejoras medidas en validación se trasladan al conjunto de test HHD Option-B, dado que el autor publica resultados en `results.json`.
- Prototipado rápido de HTR en entornos con recursos limitados: al ocupar 0,1 GB en safetensors, puede cargarse en estaciones de trabajo sin GPU dedicada para pruebas de concepto.
- Generación de transcripciones auxiliares para anotación humana: las salidas CTC pueden emplearse como preanotación que revisores corrigen, reduciendo el coste de etiquetado en corpus manuscritos hebreos.
- Integración en herramientas de accesibilidad o archivística: transcripción automática de documentos históricos o formularios manuscritos en hebreo dentro de flujos de catalogación.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,2153 |
| HHD Option-B test (greedy, sin LM) | WER | 0,7411 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no son aplicables a un modelo de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 22,4 M de parámetros; en la práctica, el cuello de botella será el tamaño de las imágenes de entrada y el batch, no los pesos.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) es sobradamente suficiente; también puede ejecutarse en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, con margen amplio, incluidas GPUs de gama baja o iGPU con suficiente memoria compartida.
- Opciones de despliegue: carga directa con `transformers` y `safetensors`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (orientados a LLM, no a HTR).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratch-elastic3-s42 | 22,4 M | no disponible | CER 0,2153 / WER 0,7411 en HHD Option-B | MIT | HuggingFace |
| TrOCR base (Microsoft) | no disponible en esta ficha | no disponible | no disponible | MIT (según versión) | HuggingFace |
| Otros checkpoints del estudio `htr-metrics-transfer` (cyttic) | no disponible | no disponible | no disponible | MIT | HuggingFace (presumiblemente) |

No se dispone de datos comparativos verificados de modelos alternativos de HTR en hebreo en la información proporcionada; la comparación cuantitativa con TrOCR estándar u otros sistemas queda como no disponible.

## Limitaciones y advertencias

- El WER reportado (0,7411) es alto en términos absolutos, lo que indica que la transcripción a nivel de palabra requiere revisión humana en la mayoría de los casos.
- El CER de 0,2153 implica aproximadamente un 21,5 % de errores a nivel de carácter; no es adecuado para producción sin postprocesado o corrección.
- Entrenado únicamente en hebreo; no se garantiza comportamiento en otros idiomas o alfabetos.
- Modelo experimental de un estudio de aumentación: no se documentan sesgos específicos, pero al derivarse de un corpus concreto (`hhd-optionb-split`) heredará las características y posibles sesgos de ese dataset.
- Riesgo de alucinación en el sentido de generar caracteres plausibles pero incorrectos, especialmente en decodificación CTC sin modelo de lenguaje.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías de idoneidad; conviene validar el rendimiento en el dominio objetivo antes de desplegarlo.
- No se documentan limitaciones de longitud de contexto ni de resolución de imagen; estos parámetros deberán inferirse del código de entrenamiento, no disponible en la información proporcionada.
- Fecha de creación indicada como 2026-11-05, posterior a la fecha habitual de referencia; conviene verificar la vigencia del checkpoint antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-trocrscratch-elastic3-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split (según la model card)
- Resultados detallados: `results.json` en el repositorio del modelo (según la model card)
