# cyttic/hmt-trocrctc-elastic3-s43

## Resumen

`cyttic/hmt-trocrctc-elastic3-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de una variante del modelo TrOCR combinada con una cabeza CTC (`trocrctc`), entrenada en el marco de un estudio de aumento de datos (`augmentation study`) denominado `htr-metrics-transfer`, con la estrategia de aumento `elastic3` y la semilla 43. El modelo está pensado para transcribir texto manuscrito en hebreo, tal y como indica su etiqueta de idioma `he`.

Con 87.279.756 parámetros y un tamaño de repositorio de 0,3 GB, es un modelo compacto orientado a una tarea concreta y acotada: la transcripción de líneas o regiones de texto manuscrito. Su relevancia no reside en un uso generalista, sino en servir como punto de comparación experimental dentro de un estudio sobre cómo distintas estrategias de aumento de datos afectan a las métricas de reconocimiento. Los pesos se distribuyen en formato `safetensors` y la licencia es MIT.

El modelo se entrenó sobre el conjunto `cyttic/hhd-optionb-split` (parte de entrenamiento, excluyendo los escritores del conjunto de desarrollo) y se evaluó sobre el conjunto de test HHD Option-B con decodificación voraz (*greedy*) y sin modelo de lenguaje. Los resultados reportados son CER 0,0955 y WER 0,3964.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (`trocrctc`); no se detalla la variante exacta del encoder/decoder |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, un transformer encoder-decoder orientado a reconocimiento óptico de caracteres, pero en esta variante se emplea una cabeza de conexionista temporal (CTC), de ahí el sufijo `trocrctc`. El objetivo es la transcripción de secuencias de texto manuscrito a partir de imágenes, típicamente líneas de texto. No se dispone de información detallada sobre el número de capas, dimensiones ocultas ni el tamaño exacto del vocabulario.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, usando la partición de entrenamiento menos los escritores reservados para desarrollo. La estrategia de aumento de datos aplicada es `elastic3`, una deformación elástica de las imágenes de entrada, y la semilla empleada es 43. No se indica el número de tokens ni de épocas, ni si hubo etapas de ajuste fino adicionales. La decodificación en evaluación fue voraz y sin modelo de lenguaje, lo que sitúa los resultados en un escenario puro de reconocimiento acústico-visual sin postprocesado lingüístico.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a partir de imágenes.
- Decodificación CTC con salida de secuencia de caracteres.
- Entrenamiento y evaluación orientados a líneas o regiones de texto manuscrito.
- No se documentan capacidades de generación de texto libre, razonamiento, código ni matemáticas.
- No se documenta soporte de *tool calling* ni de agentes.
- No se documenta capacidad multilingüe más allá del hebreo.
- No se documentan modos especiales como *thinking mode*, visión general o audio.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de documentos históricos o administrativos digitalizados, siempre que se le proporcionen recortes de texto manuscrito compatibles con el formato de entrenamiento.
- Investigación en aumento de datos para HTR: sirve como punto de referencia reproducible (semilla 43, aumento `elastic3`) para comparar el impacto de distintas técnicas de deformación sobre CER y WER.
- Evaluación comparativa de arquitecturas TrOCR con cabeza CTC: útil para estudiar el comportamiento de decodificación voraz sin modelo de lenguaje en hebreo manuscrito.
- Prototipado de pipelines de OCR/HTR: puede integrarse como componente de transcripción en un sistema mayor que segmenta imágenes y aplica el modelo línea a línea.
- Reproducción de experimentos académicos: al estar publicado con licencia MIT y pesos en safetensors, permite replicar los resultados reportados en `results.json`.
- Análisis de robustez frente a variaciones morfológicas: el uso de `elastic3` lo hace adecuado para estudiar la tolerancia del modelo a deformaciones geométricas del trazo.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0955 | Test HHD Option-B, greedy, sin LM |
| WER | 0,3964 | Test HHD Option-B, greedy, sin LM |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB solo para pesos (87,3 M de parámetros), más memoria para activaciones y procesamiento de imágenes.
- VRAM estimada en fp16: aproximadamente 0,18 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en precisión reducida; modelos como RTX 3060, RTX 4060 o superiores son adecuados.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: no se documentan integraciones específicas; al ser safetensors, puede cargarse con PyTorch/Hugging Face Transformers si la arquitectura está soportada, o con llama.cpp/Ollama solo si existe conversión a GGUF (no disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrctc-elastic3-s43 | 87,3 M | no disponible | MIT | Hugging Face |
| TrOCR base (Microsoft) | ~334 M | no disponible | MIT | Hugging Face |
| TrOCR large (Microsoft) | ~558 M | no disponible | MIT | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en hebreo manuscrito; no es adecuado para otros idiomas ni para texto impreso sin validación previa.
- El WER reportado (0,3964) es elevado, lo que indica una tasa considerable de errores a nivel de palabra en el conjunto de evaluación.
- Entrenado con una estrategia de aumento concreta (`elastic3`) y una semilla fija (43); el rendimiento puede no generalizar a otras condiciones de captura o dominios.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre un corpus concreto, puede reflejar las características de los escritores y del dominio de dicho corpus.
- Riesgo de alucinación en la transcripción: la decodificación CTC sin modelo de lenguaje puede producir secuencias plausibles pero incorrectas en trazos ambiguos.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el trabajo original y verificar los términos del conjunto de datos de entrenamiento.
- No se dispone de información sobre cuantizaciones oficiales ni sobre soporte en frameworks de despliegue de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-elastic3-s43
