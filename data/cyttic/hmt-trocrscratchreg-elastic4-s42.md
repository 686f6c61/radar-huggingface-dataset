# cyttic/hmt-trocrscratchreg-elastic4-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchreg-elastic4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) desarrollado por el autor `cyttic` en el marco de un estudio de aumentación de datos denominado `htr-metrics-transfer`. Se trata de un modelo derivado de la arquitectura TrOCR con un cabezal de clasificación CTC, entrenado desde cero (scratch) sobre un conjunto de datos denominado `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo.

El modelo está especializado en hebreo (`he`) y su propósito es la transcripción de texto manuscrito. Con 22.421.004 parámetros totales y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a experimentación en investigación de HTR más que a despliegue de producción generalista. La variante concreta corresponde a la combinación de arquitectura `trocrscratchreg` con la aumentación `elastic4` y la semilla 42, dentro de una matriz de experimentos.

Su relevancia es acotada y de carácter investigador: proporciona un punto de referencia reproducible (CER 0,2608 y WER 0,8368 en el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje) para estudiar el efecto de la aumentación elástica en HTR sobre hebreo. No es un modelo de propósito general ni soporta otras tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabezal CTC (variante `trocrscratchreg`), transformer encoder-decoder |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, un transformer encoder-decoder para reconocimiento de texto en imagen, pero en esta variante el autor indica un cabezal CTC (`ctc`) para la decodificación, lo que sugiere un enfoque híbrido de reconocimiento secuencial sin modelo de lenguaje externo. La variante `trocrscratchreg` indica entrenamiento desde cero (no inicializado desde pesos preentrenados de TrOCR), y `elastic4` identifica la configuración de aumentación elástica aplicada a las imágenes de entrada. La semilla utilizada es 42.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, concretamente sobre la partición de train menos los escritores del conjunto de desarrollo, con evaluación sobre el test HHD Option-B. La decodificación empleada en la evaluación es greedy y sin modelo de lenguaje. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo HTR). El detalle de los resultados se remite a un fichero `results.json` del repositorio, no incluido en la información disponible.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a partir de imágenes de líneas o regiones de texto.
- Decodificación CTC greedy sin modelo de lenguaje externo.
- Entrenamiento desde cero sobre un split específico de escritores, lo que permite estudiar generalización a escritores no vistos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo multilingüe: únicamente hebreo.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la lectura de imagen de texto.

## Casos de uso

- Investigación en aumentación de datos para HTR: el modelo sirve como punto de comparación reproducible (semilla 42, aumentación `elastic4`) frente a otras configuraciones del estudio `htr-metrics-transfer`, permitiendo aislar el efecto de la aumentación elástica en el CER y el WER.
- Transcripción de manuscritos hebreos en entornos controlados: puede emplearse para digitalizar líneas de texto manuscrito cuando el dominio coincide con el del dataset `hhd-optionb-split`, aceptando el nivel de error reportado (CER 0,2608).
- Evaluación de pipelines de HTR sin LM: al estar entrenado y evaluado con decodificación greedy sin modelo de lenguaje, es útil como baseline para medir cuánto aporta un LM externo en la corrección de transcripciones.
- Estudio de generalización a escritores no vistos: el split de entrenamiento excluye los escritores de dev, lo que lo hace adecuado para experimentos de evaluación de robustez ante variabilidad de escritura.
- Prototipado académico de digitalización de archivos: con 22,4 M de parámetros y 0,1 GB de pesos, puede desplegarse en entornos de laboratorio con recursos limitados para pruebas de concepto.
- Reproducibilidad de experimentos: al publicarse pesos, licencia MIT y configuración de semilla, permite replicar y auditar los resultados del estudio de transferencia de métricas HTR.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,2608 |
| HHD Option-B test (greedy, sin LM) | WER | 0,8368 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) por no ser aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB en fp32 (22,4 M de parámetros), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier modelo moderno e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al no haber variantes GGUF publicadas, el despliegue estándar sería vía `transformers` con safetensors; no se dispone de confirmación de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de otros modelos comparables de HTR en hebreo ni variantes del mismo estudio con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo; no soporta otros idiomas.
- Rendimiento limitado: CER de 0,2608 y WER de 0,8368 implican una tasa de error elevada para uso en producción sin revisión humana.
- Entrenado desde cero sobre un dataset concreto (`hhd-optionb-split`); la generalización fuera de ese dominio y de esos escritores no está garantizada.
- Evaluado con decodificación greedy y sin modelo de lenguaje, por lo que no incorpora corrección lingüística.
- Riesgo de alucinación y de errores sistemáticos en caracteres ambiguos propio de los modelos CTC sin LM.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al de evaluación.
- Sin pipeline declarado en Hugging Face y sin variantes cuantizadas publicadas; requiere integración manual con `transformers`.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un conjunto acotado de escritores, puede presentar sesgo hacia sus estilos caligráficos.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchreg-elastic4-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card; no verificado en la información disponible)
