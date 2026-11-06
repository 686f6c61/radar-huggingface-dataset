# cyttic/hmt-htrvt-photo1-s43

## Resumen

`cyttic/hmt-htrvt-photo1-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado con una arquitectura de tipo transformer y cabecera CTC, publicado por el autor `cyttic` en Hugging Face. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, cuyo objetivo es medir cómo distintas estrategias de augmentación afectan a las métricas de transcripción en un corpus manuscrito en hebreo.

El modelo concreto corresponde a la variante `htrvt` con la augmentación `photo1` y la semilla 43, y se ha entrenado sobre el split de entrenamiento de `cyttic/hhd-optionb-split` excluyendo a los escritores del conjunto de desarrollo. Con 13.821.574 parámetros (unos 13,8 M), es un modelo compacto orientado a transcripción línea a línea, no a generación de texto libre. Su relevancia es acotada: sirve como punto de comparación reproducible dentro de un estudio de ablación, no como modelo de propósito general.

La evaluación reportada por el autor sobre el test HHD Option-B, con decodificación greedy y sin modelo de lenguaje, arroja un CER de 0,0629 y un WER de 0,2849. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabecera CTC (HTR) |
| Parametros totales | 13.821.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con salida CTC para alineamiento secuencia a secuencia, el esquema habitual en reconocimiento de texto manuscrito cuando se dispone de transcripciones a nivel de línea sin alineamientos a nivel de carácter. La model card no detalla el número de capas, dimensión oculta, número de cabezas de atención ni el tamaño del vocabulario de salida; tampoco especifica la resolución o normalización de las imágenes de entrada.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo a los escritores presentes en el conjunto de desarrollo, lo que evita fuga de información entre dev y train a nivel de escritor. La augmentación aplicada es `photo1`, presumiblemente una transformación de tipo fotográfico (variaciones de iluminación, contraste o ruido) sobre las imágenes manuscritas. La semilla utilizada es 43. No se indica en la información disponible el número de tokens, el volumen de imágenes de entrenamiento, ni si se aplicaron técnicas de regularización adicionales, *early stopping* o *learning rate scheduling*. El autor remite a `results.json` para los detalles completos del experimento.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de línea mediante decodificación CTC.
- Transcripción de imágenes de documentos manuscritos con decodificación greedy.
- Funcionamiento sin modelo de lenguaje externo (los resultados reportados corresponden a decodificación greedy sin LM).
- Capacidad de servir como punto de comparación en estudios de augmentación y transferencia de métricas.
- No dispone de soporte documentado de *tool calling*, *function calling* ni comportamiento agéntico.
- No dispone de capacidades multimodales más allá de la entrada de imagen para transcripción.
- No dispone de modo de razonamiento (*thinking mode*), audio ni visión general.
- Cobertura multilingüe limitada al hebreo según la etiqueta de idioma declarada.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de documentos históricos o administrativos escaneados, integrándose en un pipeline de segmentación de líneas previo y postprocesado posterior.
- Estudio de ablación de augmentación: sirve como una de las configuraciones de referencia (`photo1`, semilla 43) para comparar el impacto de distintas transformaciones de imagen sobre CER y WER.
- Reproducibilidad de experimentos: al estar publicado con licencia MIT y pesos en safetensors, permite replicar el resultado reportado (CER 0,0629, WER 0,2849) sobre el test HHD Option-B.
- Evaluación de transferencia de métricas: útil para investigar si las conclusiones de un estudio de augmentación se mantienen al cambiar de escritor o de dominio, dado el diseño de exclusión de escritores de dev.
- Baseline para fine-tuning: con 13,8 M de parámetros, puede servir como inicialización para adaptar un sistema HTR a un nuevo conjunto de escritores hebreos con pocos datos.
- Prototipado de bajo coste: su tamaño reducido permite desplegarlo en CPU o GPU de gama baja para pruebas de concepto de transcripción manuscrita antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0629 | Test HHD Option-B, greedy, sin LM |
| WER | 0,2849 | Test HHD Option-B, greedy, sin LM |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (13,8 M de parámetros); en la práctica, el cuello de botella es la memoria de las activaciones de imagen, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionarán sin problema, aunque el modelo no aprovechará su capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: al ser un modelo de HTR con cabecera CTC, requiere un *wrapper* de inferencia específico (carga de safetensors más preprocesado de imagen y decodificación CTC); no es directamente compatible con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje autoregresivos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-photo1-s43 | 13,8 M | no disponible | 0,0629 | MIT | Hugging Face |
| Otros modelos del estudio `htr-metrics-transfer` | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos HTR genéricos (p. ej. TrOCR, Kraken) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificables en la información proporcionada; la comparación con alternativas de la misma categoría requeriría consultar el `results.json` del estudio y repositorios de HTR comparables.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en HTR en hebreo; no es un modelo de lenguaje y no debe usarse para generación de texto, razonamiento o código.
- Los resultados reportados (CER 0,0629, WER 0,2849) corresponden a un único test (HHD Option-B) con decodificación greedy y sin LM; el rendimiento en otros dominios, escritores o calidades de escaneo no está documentado.
- El WER de 0,2849 indica que aproximadamente una de cada tres palabras contiene algún error, lo que limita su uso en producción sin revisión humana o postprocesado con LM.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus concreto de escritores, puede degradarse ante estilos caligráficos no representados.
- Riesgo de alucinación inherente a los modelos CTC: pueden generar secuencias plausibles pero incorrectas en regiones ambiguas de la imagen.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar los términos del dataset de origen (`cyttic/hhd-optionb-split`) antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa.
- No se especifican requisitos de preprocesado de imagen (resolución, binarización, normalización), lo que puede afectar a la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-photo1-s43
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados del estudio: `results.json` (referenciado en la model card, ubicación no especificada)
- Paper, blog, repositorio o demo: no disponible
