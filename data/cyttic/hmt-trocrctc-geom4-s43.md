# cyttic/hmt-trocrctc-geom4-s43

## Resumen

`cyttic/hmt-trocrctc-geom4-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el usuario `cyttic` en Hugging Face. Forma parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se entrenan variantes del mismo modelo base (`trocrctc`) con distintas estrategias de aumentación y semillas aleatorias para medir la transferencia de métricas entre configuraciones. Esta variante concreta corresponde a la aumentación `geom4` y la semilla 43.

El modelo resuelve la transcripción de imágenes de texto manuscrito a texto plano mediante un esquema CTC (*Connectionist Temporal Classification*), con decodificación voraz y sin modelo de lenguaje externo. Está especializado en hebreo (`he`) y se ha entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y evaluado sobre el test HHD Option-B.

Su relevancia es acotada pero clara: se trata de un artefacto de investigación reproducible (licencia MIT, pesos en safetensors, 87,3 M de parámetros) que permite analizar cómo afecta la aumentación geométrica al rendimiento en HTR hebreo. No es un modelo de propósito general ni un asistente conversacional; es un componente especializado para pipelines de digitalización documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `ctc`; familia `trocrctc`, presumiblemente transformer encoder-decoder con cabeza CTC, sin confirmar) |
| Parametros totales | 87.279.756 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna. Las etiquetas indican `htr` (reconocimiento de texto manuscrito) y `ctc`, y el nombre del modelo (`trocrctc`) sugiere una variante de TrOCR con cabeza de clasificación CTC en lugar de decodificación autoregresiva, aunque esto no se confirma en la información disponible. El recuento real de parámetros en safetensors es de 87.279.756, coherente con un modelo de tamaño medio orientado a inferencia sobre imágenes de líneas de texto.

El entrenamiento se realizó sobre la partición de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores presentes en el conjunto de desarrollo, lo que evita fuga de información entre escritores. La aumentación aplicada es `geom4` y la semilla es 43. La evaluación se hizo sobre el test HHD Option-B con decodificación voraz y sin modelo de lenguaje, obteniendo CER 0,0733 y WER 0,3245. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Transcripción de texto manuscrito en hebreo a partir de imágenes.
- Decodificación CTC voraz (*greedy*), sin modelo de lenguaje externo.
- Salida a nivel de carácter y de palabra, evaluable mediante CER y WER.
- Entrenamiento reproducible: semilla y configuración de aumentación documentadas.
- No se ha documentado soporte de *tool calling*, agentes, visión general, audio ni modo de razonamiento.
- No se ha documentado capacidad multilingüe más allá del hebreo.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe líneas de texto escaneadas y puede integrarse en un pipeline de OCR/HTR por lotes para convertir colecciones documentales en texto indexable.
- Investigación en aumentación de datos para HTR: al compartir configuración con otras variantes (`geom3`, semillas 42/43), permite aislar el efecto de la aumentación geométrica sobre CER y WER en un mismo corpus.
- Reproducción de experimentos: la semilla y el split están documentados, lo que facilita replicar resultados y comparar con las variantes hermanas del estudio.
- Etiquetado asistido de corpus manuscritos: las transcripciones automáticas pueden servir como preanotación que revisores humanos corrigen, reduciendo el coste de anotación.
- Evaluación comparativa de decodificadores: al no usar modelo de lenguaje, sirve como línea base acústica pura frente a variantes con LM, útil para medir la ganancia real que aporta el modelado de lenguaje.
- Búsqueda sobre documentos históricos: combinado con indexación de texto, permite búsquedas por palabra clave en manuscritos previamente inaccesibles.

## Benchmarks y rendimiento

| Metrica | Valor (test HHD Option-B, greedy, sin LM) |
|---|---|
| CER | 0,0733 |
| WER | 0,3245 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que además no aplican a un modelo especializado en HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 87,3 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,35 GB; en FP16, unos 0,17 GB. La VRAM total dependerá del tamaño de las imágenes de entrada y del *batch*, pero el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o T4 cubren el caso sin problema. Para lotes grandes, A100 o H100 aportan throughput adicional.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: no se documentan en la información disponible; al ser safetensors, requiere cargar los pesos con la librería correspondiente (presumiblemente `transformers` o el código del estudio). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER / WER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cyttic/hmt-trocrctc-geom4-s43` (este) | 87,3 M | no disponible | 0,0733 / 0,3245 | MIT | Hugging Face |
| `cyttic/hmt-trocrctc-geom4-s42` | no disponible | no disponible | 0,0712 / 0,3156 | MIT (presumible) | Hugging Face |
| `cyttic/hmt-trocrctc-geom3-s42` | no disponible | no disponible | 0,0727 / 0,3242 | MIT (presumible) | Hugging Face |

Las tres variantes pertenecen al mismo estudio y comparten corpus y protocolo de evaluación, por lo que la comparación es directa. La variante `geom4-s42` obtiene el mejor CER y WER del grupo; este modelo (`geom4-s43`) queda ligeramente por detrás, lo que ilustra la variabilidad entre semillas. No se dispone de comparaciones con modelos HTR externos en la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo; no se ha validado en otros idiomas.
- Entrenado sobre un corpus concreto (`hhd-optionb-split`); el rendimiento puede degradarse en dominios, escritores o estilos caligráficos no representados.
- WER de 0,3245 indica que aproximadamente una de cada tres palabras contiene algún error, lo que exige revisión humana en usos de alta precisión.
- Decodificación sin modelo de lenguaje: no corrige errores léxicos ni contextuales, lo que limita la calidad frente a variantes con LM.
- Riesgo de alucinación y de sustituciones sistemáticas en caracteres ambiguos propios del hebreo manuscrito (formas finales, letras similares).
- No se documentan sesgos específicos ni evaluaciones de robustez más allá del test indicado.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones del corpus de entrenamiento original.
- Artefacto de investigación con 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento activo.
- No se documentan requisitos de preprocesado de imagen, tokenizador ni formato de entrada, lo que complica la integración directa sin consultar el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-geom4-s43
- Variante hermana `geom4-s42`: https://huggingface.co/cyttic/hmt-trocrctc-geom4-s42
- Variante hermana `geom3-s42`: https://huggingface.co/cyttic/hmt-trocrctc-geom3-s42
