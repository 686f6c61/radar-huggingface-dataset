# cyttic/hmt-trocrscratchreg-photo4-s42

## Resumen

`cyttic/hmt-trocrscratchreg-photo4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por el autor `cyttic` en el marco de un estudio de aumentación de datos denominado *htr-metrics-transfer*. Se trata de una variante del modelo TrOCR con inicialización desde cero ("scratch") y cabecera de regresión, entrenada con una configuración de aumentación concreta etiquetada como `photo4` y semilla 42. El modelo tiene 22.421.004 parámetros y se distribuye en formato safetensors con licencia MIT.

El modelo está especializado en hebreo (`he`) y emplea una arquitectura encoder-decoder basada en transformers con decodificación CTC, según indican las etiquetas de la model card. Su propósito es servir como punto de comparación dentro de un estudio sistemático sobre cómo distintas estrategias de aumentación afectan a las métricas de reconocimiento de escritura manuscrita. El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo, y se evaluó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

Los resultados reportados por el autor sitúan el CER en 0,5298 y el WER en 1,1081 sobre dicho test. Estos valores son notablemente altos en comparación con otras variantes del mismo estudio (por ejemplo, `geom4` reporta CER 0,0712), lo que sugiere que la configuración `photo4` con inicialización scratch no converge a un rendimiento competitivo en esta tarea. El modelo es relevante como evidencia empírica dentro del estudio de aumentación, no como herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo TrOCR con cabecera de regresión y decodificación CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, un transformer encoder-decoder orientado a reconocimiento de texto en imágenes. En esta variante concreta, la model card indica inicialización desde cero (`scratch`) y una cabecera de regresión (`reg`), junto con decodificación CTC. No se especifican en la información disponible el número de capas, dimensiones ocultas, número de cabezas de atención ni la resolución de entrada de las imágenes.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con la configuración de aumentación `photo4` y semilla 42. La evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje externo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (poco probables en una tarea HTR). Tampoco se detallan innovaciones técnicas adicionales más allá de la propia configuración de aumentación estudiada.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes, mediante decodificación CTC.
- Generación de transcripciones carácter a carácter (modelo de regresión sobre secuencias).
- Evaluación comparativa dentro de estudios de aumentación de datos (etiqueta `htr`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo según la model card.
- No se documentan modos especiales como *thinking mode*, visión general, audio u otras modalidades más allá del reconocimiento de texto en imagen.

## Casos de uso

- Investigación en aumentación de datos para HTR: el modelo sirve como punto de comparación reproducible (semilla 42, aumentación `photo4`) frente a otras variantes del mismo estudio, como `geom4`, para medir el impacto de la estrategia de aumentación en CER y WER.
- Reproducción de experimentos: dado que la model card referencia `results.json` y un split concreto (`hhd-optionb-split`), el modelo permite replicar la evaluación greedy sin LM sobre el test HHD Option-B.
- Análisis de fallos en HTR: con un CER de 0,5298 y WER de 1,1081, resulta útil para estudiar modos de error típicos de configuraciones scratch con aumentación fotográfica en hebreo manuscrito.
- Baseline negativo en pipelines de selección de modelos: permite descartar configuraciones de aumentación que degradan el rendimiento frente a alternativas como `geom4`.
- Docencia y formación: ejemplo práctico de cómo una mala elección de aumentación e inicialización afecta drásticamente a las métricas en reconocimiento de escritura.
- Estudio de transferencia de métricas: encaja en el marco `htr-metrics-transfer` para analizar si las métricas obtenidas en un split se transfieren a otros conjuntos o configuraciones.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto / condiciones |
|---|---|---|
| CER | 0,5298 | HHD Option-B test, greedy, sin LM |
| WER | 1,1081 | HHD Option-B test, greedy, sin LM |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo especializado en HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 22,4 M de parámetros, la inferencia en fp32 requiere aproximadamente 90 MB de pesos; en fp16, unos 45 MB. Con overhead de activaciones y batch, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovecha su capacidad.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo tipo TrOCR con pesos safetensors, puede cargarse con `transformers` (VisionEncoderDecoderModel o arquitectura equivalente) y servirse con frameworks estándar de Hugging Face. No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER / WER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cyttic/hmt-trocrscratchreg-photo4-s42` | 22.421.004 | no disponible | CER 0,5298 / WER 1,1081 | MIT | Hugging Face |
| `cyttic/hmt-trocrctc-geom4-s42` | no disponible | no disponible | CER 0,0712 / WER 0,3156 | no disponible | Hugging Face |
| TrOCR original (Microsoft) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

La comparación directa con TrOCR original no puede establecerse con los datos disponibles; únicamente se dispone de la variante `geom4` del mismo estudio, que obtiene un CER sustancialmente menor (0,0712 frente a 0,5298) sobre el mismo test y condiciones de decodificación.

## Limitaciones y advertencias

- Rendimiento muy bajo en la tarea objetivo: CER de 0,5298 y WER de 1,1081 indican que más de la mitad de los caracteres se reconocen incorrectamente en el test HHD Option-B.
- Especialización limitada al hebreo; no se documenta soporte para otros idiomas.
- Entrenado desde cero (`scratch`) sobre un split concreto, lo que reduce su capacidad de generalización frente a modelos preentrenados.
- Riesgo elevado de alucinación y errores de transcripción en texto manuscrito fuera de la distribución de entrenamiento.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre un conjunto limitado de escritores, es probable que presente sesgo hacia los estilos de escritura presentes en el corpus.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la calidad del modelo en producción.
- No apto para uso en producción sin una evaluación exhaustiva previa; su valor es principalmente experimental y comparativo.
- No se dispone de información sobre cuantizaciones, contexto máximo ni requisitos detallados de preprocesado de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchreg-photo4-s42
- Variante relacionada del mismo estudio: https://huggingface.co/cyttic/hmt-trocrctc-geom4-s42
- Dataset de entrenamiento referenciado: `cyttic/hhd-optionb-split` (no se dispone de URL directa en la información proporcionada)
- Resultados detallados: `results.json` (referenciado en la model card, no se dispone de URL directa)
