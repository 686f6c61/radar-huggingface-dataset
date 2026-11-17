# cyttic/hmt-trocrscratchstem-geom3-s42

## Resumen

`cyttic/hmt-trocrscratchstem-geom3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) publicado por el autor `cyttic` en Hugging Face. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se entrenan variantes de un mismo modelo base (`trocrscratchstem`) con distintas estrategias de aumento geométrico y semillas, para medir la transferencia de métricas entre dominios. Esta variante concreta corresponde al aumento `geom3` y la semilla 42.

El modelo resuelve la transcripción de imágenes de texto manuscrito en hebreo (`he`) mediante un esquema CTC (*Connectionist Temporal Classification*), lo que permite alinear secuencias de imagen y texto sin segmentación previa a nivel de carácter. Con 24.928.588 parámetros (aproximadamente 25 M) y un repositorio de 0,1 GB, es un modelo compacto orientado a investigación y experimentación más que a despliegue comercial a gran escala.

Su relevancia es acotada pero específica: sirve como punto de referencia reproducible para estudiar cómo afectan los aumentos geométricos al rendimiento en HTR, con métricas publicadas sobre un conjunto de test concreto (CER 0,0619 y WER 0,2826 con decodificación greedy y sin modelo de lenguaje). Es útil para investigadores que trabajen en HTR hebreo o en metodologías de evaluación de aumentos de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (nombre sugiere base tipo TrOCR con decodificacion CTC; no confirmado en la model card) |
| Parametros totales | 24.928.588 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna. El identificador `trocrscratchstem` sugiere una base inspirada en TrOCR entrenada desde cero (*scratch*) sobre un *stem* concreto, y la etiqueta `ctc` indica que la cabeza de salida y la función de pérdida se basan en CTC en lugar de decodificación autoregresiva. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la resolución de entrada de las imágenes.

En cuanto al entrenamiento, el modelo se entrenó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores (*writers*) del conjunto de desarrollo, lo que evita fuga de información entre entrenamiento y validación a nivel de escritor. Se aplicó el aumento geométrico `geom3` con semilla 42. No se indica el número de tokens, la composición del dataset ni si hubo etapas de ajuste fino adicionales más allá del entrenamiento supervisado con CTC. La evaluación reportada usa decodificación greedy sin modelo de lenguaje.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Transcripción a nivel de línea o región de imagen, con alineación CTC sin segmentación previa por carácter.
- Decodificación greedy sin modelo de lenguaje externo (según la configuración de evaluación reportada).
- Evaluación reproducible mediante métricas CER y WER sobre un conjunto de test definido.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo *thinking*.
- No se documentan capacidades multilingües más allá del hebreo.

## Casos de uso

- Investigación en aumentos de datos para HTR: el modelo sirve como una de las variantes de un estudio controlado (`geom3`, semilla 42) para comparar el efecto del aumento geométrico frente a otras configuraciones del mismo estudio.
- Transcripción de manuscritos hebreos digitalizados: puede emplearse para convertir imágenes de líneas manuscritas en texto, con la advertencia de que el WER reportado (0,2826) es elevado para producción sin post-proceso.
- Generación de líneas base reproducibles: al publicar métricas concretas (CER 0,0619, WER 0,2826) sobre un test fijo, permite replicar y comparar experimentos propios.
- Preetiquetado asistido en proyectos de digitalización: usar el modelo para una primera pasada de transcripción y corregir manualmente, reduciendo el esfuerzo frente a la transcripción desde cero.
- Estudio de transferencia de métricas entre dominios: el nombre del proyecto (`htr-metrics-transfer`) indica que el modelo está pensado para analizar cómo se transfieren las métricas de un dominio a otro.
- Docencia y experimentación con CTC: su tamaño reducido (≈25 M de parámetros) facilita ejecutar experimentos de ajuste fino y decodificación en entornos con recursos limitados.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son las métricas sobre el conjunto HHD Option-B test, con decodificación greedy y sin modelo de lenguaje:

| Metrica | Valor | Configuracion |
|---|---|---|
| CER | 0,0619 | HHD Option-B test, greedy, sin LM |
| WER | 0,2826 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros modelos (MMLU, HumanEval, GSM8K y similares no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: con ≈25 M de parámetros, el modelo en precisión completa ocupa del orden de 100 MB de pesos; la VRAM real depende del *framework*, del tamaño de lote y de la resolución de las imágenes de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama media son más que suficientes.
- Cabe en GPU de consumo: sí, con amplio margen, incluidas GPUs con 4-8 GB de VRAM.
- Opciones de despliegue: no se documentan en la model card. Al ser un modelo con pesos safetensors, puede cargarse con las librerías estándar de Hugging Face (`transformers`); no hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El propio autor lo sitúa dentro de un estudio interno (`htr-metrics-transfer`) con variantes del mismo modelo base, pero no se publican resultados de esas variantes en la model card, por lo que no es posible establecer una comparativa numérica fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-geom3-s42 | 24.928.588 | no disponible | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El WER reportado (0,2826) es alto: una de cada cuatro palabras aproximadamente se transcribe mal en el conjunto de test, lo que limita su uso directo en producción sin corrección humana o post-proceso con modelo de lenguaje.
- El modelo solo está documentado para hebreo; no hay evidencia de funcionamiento en otros idiomas.
- No se detalla la arquitectura ni los datos de entrenamiento exactos, lo que dificulta evaluar sesgos y generalización.
- Posible sobreajuste al dominio del dataset `hhd-optionb-split`: el rendimiento fuera de ese corpus (otras caligrafías, resoluciones o tipos de documento) no está medido.
- Riesgo de alucinación y errores sistemáticos en caracteres ambiguos propios de la escritura manuscrita; con decodificación CTC sin modelo de lenguaje no hay mecanismo de corrección contextual.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones del dataset de entrenamiento (`cyttic/hhd-optionb-split`) por si impusieran restricciones adicionales.
- Modelo de investigación con 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-geom3-s42
- Dataset de entrenamiento citado: `cyttic/hhd-optionb-split` (referenciado en la model card; enlace directo no disponible en la información proporcionada)
- Resultados detallados: `results.json` (referenciado en la model card; enlace directo no disponible en la información proporcionada)
