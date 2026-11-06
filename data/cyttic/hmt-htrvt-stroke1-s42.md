# cyttic/hmt-htrvt-stroke1-s42

## Resumen

El modelo `cyttic/hmt-htrvt-stroke1-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un modelo pequeño, de 13,8 millones de parámetros, entrenado con una cabeza CTC sobre una arquitectura de tipo transformer (`htrvt`) y publicado como parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`. El objetivo del experimento es medir cómo distintas estrategias de aumentación afectan a las métricas de reconocimiento en un corpus manuscrito en hebreo.

El modelo se ha entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y se ha evaluado sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Los resultados reportados son CER 0,0613 y WER 0,2780, lo que lo sitúa como un componente de investigación más que como un producto listo para producción. Su relevancia actual es acotada: sirve como referencia reproducible dentro de una comparativa de aumentación de datos para HTR en hebreo.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face (metadatos, tags y model card). No hay paper, demo ni documentación adicional publicada por el autor en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer para HTR (`htrvt`) con cabeza de decodificación CTC |
| Parámetros totales | 13.821.574 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | Hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer orientado a reconocimiento de texto manuscrito, etiquetado por el autor como `htrvt`, con una cabeza de salida CTC (*Connectionist Temporal Classification*). La decodificación CTC permite alinear secuencias de imagen y texto sin segmentación explícita a nivel de carácter, lo que es habitual en pipelines HTR. El modelo tiene 13,8 millones de parámetros, un tamaño propio de modelos ligeros pensados para entrenamiento y evaluación rápidos en experimentos controlados.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores que forman el conjunto de desarrollo, con la aumentación `stroke1` y semilla 42. Forma parte de la primera ola (*wave 1*) del estudio `htr-metrics-transfer`, cuyo propósito es cuantificar la transferencia de métricas entre distintas configuraciones de aumentación. No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado adicional. La evaluación se hizo con decodificación greedy y sin modelo de lenguaje externo.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas o páginas, con salida de secuencia de caracteres.
- Decodificación CTC greedy, sin modelo de lenguaje ni corrección posterior.
- Entrenado específicamente para el corpus HHD Option-B, por lo que su dominio es el de la escritura manuscrita de ese conjunto.
- No se documenta soporte de *tool calling*, *function calling* ni uso como agente.
- No se documenta capacidad multilingüe más allá del hebreo.
- No se documentan modos especiales (thinking, visión general, audio) fuera del propio reconocimiento de imagen a texto.

## Casos de uso

- Investigación en aumentación de datos para HTR: el modelo sirve como punto de comparación reproducible (semilla 42, aumentación `stroke1`) frente a otras configuraciones de la misma ola del estudio `htr-metrics-transfer`.
- Reproducción de métricas de referencia: permite replicar el CER 0,0613 y WER 0,2780 sobre el test HHD Option-B con decodificación greedy, útil para validar pipelines de evaluación propios.
- Transcripción de manuscritos hebreos en entornos controlados: adecuado para digitalizar documentos cuyo estilo de escritura se parezca al del corpus de entrenamiento, con revisión humana posterior dado el WER de 0,2780.
- Baseline ligero para *fine-tuning*: sus 13,8 M de parámetros permiten ajustarlo en hardware modesto sobre corpus propios de hebreo manuscrito.
- Componente en pipelines de OCR/HTR académicos: puede integrarse como etapa de reconocimiento en flujos de procesamiento de colecciones documentales, siempre con validación por dominio.
- Experimentación con decodificación CTC: útil para estudiar el efecto de añadir modelos de lenguaje o decodificación por haces sobre las métricas base reportadas.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,0613 |
| HHD Option-B test (greedy, sin LM) | WER | 0,2780 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (13,8 M de parámetros, ~55 MB de pesos); en la práctica, el cuello de botella será la imagen de entrada, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060 o superior sobra para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo HTR con cabeza CTC, requeriría un *runner* específico (por ejemplo, PyTorch con `transformers` o código propio del autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-stroke1-s42 | 13,8 M | No disponible | Hebreo | MIT | Hugging Face |
| Otros modelos de la ola `htr-metrics-transfer` | No disponible | No disponible | Hebreo | No disponible | No disponible |
| Modelos HTR genéricos (p. ej. TrOCR, Kraken) | No disponible en esta ficha | No disponible | Multilingüe / según modelo | Según modelo | Hugging Face / GitHub |

No se dispone de datos de benchmarks de alternativas en la información proporcionada; la comparativa se limita a parámetros, licencia e idioma.

## Limitaciones y advertencias

- El WER de 0,2780 sobre el test de referencia indica un nivel de error alto para uso sin revisión humana; el CER de 0,0613 es más favorable pero sigue requiriendo validación.
- El modelo está entrenado únicamente en hebreo y sobre un corpus concreto (HHD Option-B); el rendimiento fuera de ese dominio o con otros escritores no está documentado.
- No se ha evaluado con modelo de lenguaje ni decodificación por haces; las métricas reportadas corresponden solo a decodificación greedy.
- Riesgo de alucinación y de sustituciones a nivel de carácter inherente a los sistemas CTC sin LM; no hay análisis de sesgos publicado.
- Licencia MIT, que permite uso comercial, pero sin garantías del autor sobre idoneidad para producción.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni soporte documentado.
- El repositorio ocupa 0,1 GB y contiene únicamente pesos safetensors; no se documenta tokenizador, configuración de inferencia ni script de evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-stroke1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
