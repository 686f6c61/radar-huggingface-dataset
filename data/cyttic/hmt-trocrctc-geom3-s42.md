# cyttic/hmt-trocrctc-geom3-s42

## Resumen

`cyttic/hmt-trocrctc-geom3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado sobre hebreo, publicado por el usuario cyttic en Hugging Face. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, correspondiente a la ola 1, con el modelo base `trocrctc`, el esquema de aumentación `geom3` y la semilla 42. El objetivo del experimento es medir cómo se transfieren las métricas de HTR entre distintas configuraciones de entrenamiento.

El modelo emplea una arquitectura TrOCR con cabeza CTC (tags `htr` y `ctc`) y cuenta con 87.279.756 parámetros en formato safetensors, con un repositorio de 0,3 GB. Está entrenado sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y evaluado sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

Es relevante como pieza de un conjunto de experimentos reproducible (semilla fija, configuración de aumentación concreta y métricas publicadas) para investigadores que trabajen en HTR de hebreo o que quieran replicar estudios de transferencia de métricas con arquitecturas TrOCR+CTC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (según tags `htr` y `ctc`) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es TrOCR (*Transformer-based Optical Character Recognition*) con salida CTC, tal como indican los tags del repositorio (`htr`, `ctc`). No se dispone de información detallada sobre el número de capas, dimensionalidad del encoder/decoder, tamaño de imagen de entrada ni resolución de los features visuales.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores presentes en el conjunto de desarrollo, con el esquema de aumentación `geom3` y semilla 42. La evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (poco probables en una tarea HTR). Los detalles completos se remiten a un `results.json` del repositorio original.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo (transcripción de imágenes a texto).
- Decodificación CTC greedy, sin modelo de lenguaje externo.
- Salida a nivel de carácter/palabra evaluable con CER y WER.
- Entrenamiento reproducible con semilla fija (42) y aumentación geométrica (`geom3`).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la lectura de imagen manuscrita.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe imágenes de documentos históricos o administrativos a texto plano, adecuado por su entrenamiento específico en HTR hebreo y su licencia MIT.
- Extracción de texto de formularios y manuscritos escaneados: integrable como etapa OCR en pipelines de digitalización, con salida CTC decodificada de forma greedy.
- Benchmark de referencia en estudios de aumentación: sirve como punto de comparación (CER 0,0727; WER 0,3242) para medir el efecto de distintas estrategias de aumento de datos en HTR.
- Replicación de experimentos académicos: al publicarse con semilla y configuración concretas, permite reproducir resultados en investigación sobre transferencia de métricas HTR.
- Preentrenamiento o *fine-tuning* sobre otros corpus hebreos: sus 87,3 M de parámetros y pesos safetensors facilitan el ajuste sobre datasets propios de escritura manuscrita.
- Evaluación de robustez frente a variaciones geométricas: el esquema `geom3` permite estudiar cómo afectan transformaciones geométricas al reconocimiento en producción.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0727 | Test HHD Option-B, decodificación greedy, sin LM |
| WER | 0,3242 | Test HHD Option-B, decodificación greedy, sin LM |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 87,3 M de parámetros, en fp32 ocuparía aproximadamente 0,35 GB solo en pesos, más activaciones y buffers de imagen.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) sería suficiente en términos de memoria.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU con 6 GB o más de VRAM, aunque no se confirma en la información disponible.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo TrOCR+CTC, requeriría un runtime específico de OCR/Transformers).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye modelos comparables de HTR hebreo ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un corpus concreto (`hhd-optionb-split`), puede heredar sesgos de estilo, caligrafía y vocabulario de ese dataset.
- Riesgo de alucinación: presente en cualquier modelo generativo; la decodificación CTC sin LM reduce la generación libre, pero no elimina errores de sustitución.
- Limitaciones de contexto o idioma: soporta únicamente hebreo (`he`); no se especifica longitud de contexto ni resolución de imagen.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribución y sin garantías.
- Caveats para producción: el WER de 0,3242 es relativamente alto; conviene validar sobre datos propios antes de desplegar. No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que limita opciones de despliegue ligero.

## Enlaces

- [Hugging Face: cyttic/hmt-trocrctc-geom3-s42](https://huggingface.co/cyttic/hmt-trocrctc-geom3-s42)
- Dataset de entrenamiento: `cyttic/hhd-optionb-split` (referenciado en la model card; enlace directo no disponible)
- `results.json` del repositorio (detalles de resultados; enlace directo no disponible)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
