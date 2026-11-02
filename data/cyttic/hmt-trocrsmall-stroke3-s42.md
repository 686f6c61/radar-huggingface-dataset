# cyttic/hmt-trocrsmall-stroke3-s42

## Resumen

El modelo `cyttic/hmt-trocrsmall-stroke3-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el usuario `cyttic` y publicado en HuggingFace. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, cuyo objetivo es medir cómo distintas estrategias de aumento afectan a las métricas de reconocimiento. En concreto, esta variante emplea el aumento `stroke3` con semilla 42 sobre la arquitectura `trocrsmall`.

El modelo resuelve la transcripción de imágenes de texto manuscrito a secuencia de caracteres mediante un esquema CTC (*Connectionist Temporal Classification*), lo que permite alinear directamente la imagen de entrada con la secuencia de salida sin necesidad de segmentación previa. Está entrenado sobre el conjunto `cyttic/hhd-optionb-split` (excluyendo los escritores de desarrollo) y evaluado sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

Con 22.421.004 parámetros y un tamaño de repositorio de 0,1 GB, se trata de un modelo compacto orientado a investigación en HTR, con licencia MIT y soporte declarado únicamente para hebreo (`he`). Su relevancia es acotada: es una pieza de un estudio experimental reproducible más que un modelo de propósito general, y su utilidad principal es servir de referencia para comparar variantes de aumento de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento de texto manuscrito con cabeza CTC) |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo HTR con decodificación CTC. El identificador `trocrsmall` sugiere una variante compacta de una familia de modelos de reconocimiento de texto manuscrito, pero no se especifican capas, tipo de encoder visual ni dimensiones ocultas. El modelo se entrena para mapear una imagen de línea de texto manuscrito a una secuencia de caracteres, usando CTC para la alineación.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo, con el aumento de datos `stroke3` y semilla 42. No se indica el número de tokens, el volumen de imágenes ni si hubo etapas de ajuste fino adicionales. La evaluación se hizo con decodificación greedy y sin modelo de lenguaje externo, lo que sitúa el resultado en un escenario de referencia sin post-procesado lingüístico.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) sobre imágenes de líneas de texto en hebreo.
- Decodificación CTC con alineación directa entre imagen y secuencia de caracteres.
- Salida de transcripción sin modelo de lenguaje externo (decodificación greedy).
- Entrenamiento con aumento de datos (`stroke3`) para robustez frente a variaciones de trazo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo *thinking*.
- Capacidad multilingüe limitada al hebreo según la model card.

## Casos de uso

- Transcripción de manuscritos hebreos digitalizados: el modelo convierte imágenes de líneas manuscritas en texto, adecuado para proyectos de digitalización de archivos históricos o documentos administrativos en hebreo.
- Estudio comparativo de aumentos de datos: sirve como una de las variantes del experimento `htr-metrics-transfer`, permitiendo medir el efecto de `stroke3` frente a otras estrategias con la misma semilla y arquitectura.
- Reproducibilidad de experimentos HTR: al fijar semilla 42 y publicar `results.json`, permite replicar la métrica CER/WER en el test HHD Option-B.
- Línea base para investigación en reconocimiento de escritura hebrea: con 22,4 M de parámetros y 0,1 GB, es ligero para iterar en entornos de investigación con recursos limitados.
- Evaluación de pipelines HTR sin LM: útil para medir el rendimiento puro del modelo acústico-visual antes de añadir un modelo de lenguaje en la decodificación.
- Prototipado de sistemas de transcripción en hebreo: su tamaño reducido facilita el despliegue en entornos de prueba para validar la viabilidad de un pipeline HTR antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0.2090 | Test HHD Option-B, decodificación greedy, sin LM |
| WER | 0.7165 | Test HHD Option-B, decodificación greedy, sin LM |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los valores proceden de `results.json` citado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 22,4 M de parámetros en safetensors, el peso en FP32 ronda los 90 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre; no se requieren A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo HTR con CTC, requeriría un *wrapper* específico (por ejemplo, PyTorch + `transformers` o código propio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (HTR en hebreo con CTC) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El modelo solo declara soporte para hebreo; no se garantiza funcionamiento en otros idiomas.
- El WER de 0.7165 es elevado en términos absolutos, lo que indica una tasa de error por palabra alta en el escenario evaluado (sin LM y con decodificación greedy).
- El CER de 0.2090 implica aproximadamente un 21 % de caracteres erróneos en el test HHD Option-B; puede no ser suficiente para producción sin post-procesado o modelo de lenguaje.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto concreto de escritores, puede generalizar mal a estilos de escritura no representados.
- Riesgo de alucinación inherente a modelos generativos/CTC: puede producir caracteres o palabras plausibles pero incorrectos en zonas ambiguas.
- La licencia MIT permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento y sus condiciones debe tenerse en cuenta antes de un despliegue en producción.
- El modelo parece ser un artefacto de investigación (estudio de aumentos), no un producto mantenido; no hay garantías de soporte ni actualizaciones.
- No se especifican limitaciones de longitud de contexto ni de resolución de imagen de entrada.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-trocrsmall-stroke3-s42
