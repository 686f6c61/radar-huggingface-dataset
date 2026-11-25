# cyttic/hmt-trocrscratchstem-photo3-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchstem-photo3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) publicado por el usuario cyttic en Hugging Face. Se trata de un modelo de investigación derivado de TrOCR con un cabezal de clasificación CTC, entrenado sobre el conjunto de datos `cyttic/hhd-optionb-split` y evaluado sobre el split de test HHD Option-B. Su identificador indica que forma parte de un estudio sistemático de aumentación de datos (`htr-metrics-transfer`), concretamente la variante de aumentación `photo3` con semilla 42.

Con aproximadamente 24,9 millones de parámetros, es un modelo compacto orientado a la transcripción de líneas de texto manuscrito en hebreo (`he`). La relevancia de este modelo no reside en su rendimiento absoluto, sino en su valor como punto de comparación dentro de un estudio controlado de aumentación: permite aislar el efecto de una técnica de aumentación concreta (`photo3`) frente a otras variantes del mismo *pipeline*, manteniendo constante la arquitectura y la semilla.

La model card es extremadamente escueta y no documenta arquitectura detallada, datos de entrenamiento más allá del *split* utilizado, ni resultados de benchmarks comparativos. Toda la información cuantitativa disponible se reduce a dos métricas sobre el test set: CER de 0,0904 y WER de 0,3949 con decodificación *greedy* y sin modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de TrOCR con cabezal CTC, segun el identificador del modelo) |
| Parametros totales | 24.928.588 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El identificador `trocrscratchstem` sugiere que el modelo parte de TrOCR entrenado desde cero (*scratch*) sobre un *stem* o base concreta, y que incorpora un cabezal de clasificación CTC (`tags: ctc`) en lugar del decodificador autorregresivo habitual de TrOCR. No obstante, la model card no detalla la arquitectura interna, la dimensión de las capas, el número de cabezas de atención ni la resolución de entrada de las imágenes. Tampoco se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia a `cyttic/hhd-optionb-split`.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split` excluyendo los escritores (*writers*) del split de desarrollo, lo que indica una separación por escritor para evitar fuga de información entre entrenamiento y evaluación. La variante `photo3` corresponde a una técnica de aumentación de imagen no descrita en la model card. La evaluación se realizó sobre el test HHD Option-B con decodificación *greedy* y sin modelo de lenguaje externo, obteniendo CER 0,0904 y WER 0,3949. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Transcripción de texto manuscrito en hebreo a nivel de línea o imagen, mediante decodificación CTC.
- Reconocimiento de caracteres y palabras con métricas de error publicadas (CER y WER) sobre un test set concreto.
- Funcionamiento sin modelo de lenguaje externo: la decodificación es puramente *greedy* sobre las salidas CTC.
- Capacidad multilingüe: no disponible; el modelo está etiquetado exclusivamente para hebreo.
- Soporte de *tool calling* o *function calling*: no disponible.
- Soporte de agentes o razonamiento multi-paso: no aplica a un modelo HTR.
- Modo *thinking*, visión general o audio: no disponible; la entrada es imagen de texto manuscrito y la salida es secuencia de caracteres.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de documentos históricos o administrativos escaneados, aprovechando que fue entrenado sobre un corpus HTR y evaluado con separación por escritor.
- Procesamiento por lotes de formularios manuscritos: al ser un modelo de 24,9 M de parámetros, puede ejecutarse en CPU o GPU modesta para transcribir grandes volúmenes de imágenes de forma económica.
- Investigación en aumentación de datos para HTR: sirve como punto de referencia reproducible (semilla 42, aumentación `photo3`) para comparar el efecto de distintas técnicas de aumentación sobre el CER y el WER.
- Construcción de *pipelines* de OCR con post-procesado lingüístico: dado que el modelo opera sin LM, puede combinarse con un modelo de lenguaje hebreo externo para corregir errores de decodificación y reducir el WER.
- Evaluación comparativa de arquitecturas CTC frente a decodificadores autorregresivos: el modelo permite medir el coste/beneficio de un cabezal CTC compacto frente a TrOCR estándar en la misma tarea.
- Prototipado de sistemas de accesibilidad o lectura asistida para documentos manuscritos en hebreo, con la cautela de que el WER de 0,3949 limita su uso directo en producción sin revisión humana.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del test HHD Option-B con decodificación *greedy* y sin LM:

| Metrica | Valor |
|---|---|
| CER | 0,0904 |
| WER | 0,3949 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros modelos del mismo estudio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (24,9 M de parámetros, aproximadamente 100 MB en fp32 y unos 50 MB en fp16), más el coste de activaciones y del codificador de imagen.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 pueden ejecutar el modelo con holgura.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: al publicarse solo en safetensors, requiere cargarlo con la librería de transformers o el *framework* original del estudio; no hay conversiones GGUF ni soporte documentado en llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (test HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-photo3-s42 | 24,9 M | no disponible | 0,0904 | MIT | Hugging Face |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | no disponible | no disponible | no disponible |
| TrOCR estándar (referencia arquitectónica) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en hebreo manuscrito; no se ha documentado su comportamiento en otros idiomas ni en texto impreso.
- El WER de 0,3949 es elevado para uso en producción sin revisión humana; el CER de 0,0904 indica que los errores se concentran en palabras completas más que en caracteres aislados.
- No se documentan sesgos conocidos, pero al entrenarse sobre un corpus HTR concreto puede heredar los sesgos de escritura, estilo y dominio de dicho corpus.
- Riesgo de alucinación: en modelos CTC la salida está restringida al vocabulario de caracteres, pero pueden producirse sustituciones y omisiones sistemáticas en escrituras no representadas en el entrenamiento.
- La licencia MIT permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento y su procedencia impide verificar restricciones adicionales sobre los datos.
- No se especifican limitaciones de contexto ni resolución de imagen; el rendimiento puede degradarse con imágenes de baja calidad o resoluciones distintas a las del entrenamiento.
- La model card no documenta el proceso de entrenamiento completo, lo que dificulta la reproducibilidad más allá de la semilla y la variante de aumentación indicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-photo3-s42
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Repositorio del estudio `htr-metrics-transfer`: no disponible en la información proporcionada
- Paper o blog asociado: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
