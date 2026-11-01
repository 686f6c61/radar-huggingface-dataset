# cyttic/hmt-htrvt-elastic4-s42

## Resumen

El modelo `cyttic/hmt-htrvt-elastic4-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un modelo pequeño, de aproximadamente 13,8 millones de parámetros, entrenado con una arquitectura CTC (*Connectionist Temporal Classification*) y publicado con licencia MIT. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado htr-metrics-transfer, en su primera oleada (*wave 1*), y corresponde a la variante `htrvt` con aumento de tipo `elastic4` y semilla 42.

El modelo está entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo, y evaluado sobre el conjunto de test HHD Option-B con decodificación voraz (*greedy decoding*) y sin modelo de lenguaje. Los resultados reportados en la model card son un CER (*Character Error Rate*) de 0,0886 y un WER (*Word Error Rate*) de 0,3728. El idioma declarado es el hebreo (`he`).

Su relevancia es acotada y experimental: no es un modelo de propósito general ni un LLM, sino un componente especializado en transcripción de manuscritos hebreos, útil para investigar el efecto de técnicas de aumento de datos en tareas HTR. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (Connectionist Temporal Classification) para HTR; detalles internos no disponibles |
| Parametros totales | 13.821.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que el modelo utiliza una arquitectura basada en CTC para reconocimiento de texto manuscrito, con la etiqueta `htr` y `ctc`. No se especifican en la información disponible el tipo de encoder (CNN, transformer o híbrido), la profundidad de la red ni la dimensión de las capas ocultas. El número total de parámetros, 13.821.574, sitúa el modelo en la categoría de modelos ligeros, coherente con un sistema HTR desplegable en CPU o GPU de gama baja.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo, y corresponde a la variante de aumento `elastic4` con semilla 42 dentro de la oleada 1 del estudio htr-metrics-transfer. No se detalla el número de tokens o muestras de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de regularización adicionales. La evaluación se realizó con decodificación voraz y sin modelo de lenguaje, lo que implica que el modelo no incorpora un componente externo de corrección lingüística.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo.
- Transcripción a nivel de carácter y de palabra mediante decodificación CTC.
- Decodificación voraz (*greedy decoding*) sin modelo de lenguaje.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües más allá del hebreo.
- No se documentan modos especiales como *thinking mode*, visión o audio.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir páginas escaneadas de documentos históricos o administrativos, siempre que se preprocesen a nivel de línea o palabra según el formato esperado por el pipeline CTC.
- Investigación en aumento de datos para HTR: al ser una variante concreta (`elastic4`, semilla 42) dentro de un estudio comparativo, sirve como punto de referencia para medir el impacto de la deformación elástica en el CER y el WER.
- Evaluación de pipelines de reconocimiento sin modelo de lenguaje: permite aislar el rendimiento del acoustic model puro frente a sistemas con corrección lingüística.
- Prototipado de sistemas de transcripción en entornos con recursos limitados: sus 13,8 M de parámetros y su tamaño de repo de 0,1 GB facilitan el despliegue en dispositivos con poca memoria.
- Reproducibilidad de experimentos: la semilla y la configuración de aumento están fijadas, lo que facilita replicar los resultados reportados (CER 0,0886, WER 0,3728).
- Componente base para *fine-tuning* en dominios específicos de escritura hebrea, partiendo de un modelo ya entrenado en un conjunto de escritores concreto.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0886 | HHD Option-B test, greedy decoding, sin LM |
| WER | 0,3728 | HHD Option-B test, greedy decoding, sin LM |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 13,8 M de parámetros, el modelo en fp32 ocuparía aproximadamente 55 MB, por lo que es desplegable en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no se requieren A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 3060, RTX 4090, etc.) e incluso en iGPU.
- Opciones de despliegue: no se documentan frameworks específicos (vLLM, llama.cpp, Ollama, TGI); al ser un modelo CTC, requeriría un pipeline propio de inferencia compatible con safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (HTR en hebreo con CTC) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Entrenado exclusivamente en hebreo; no se garantiza su funcionamiento en otros idiomas.
- Evaluado con decodificación voraz y sin modelo de lenguaje, lo que se traduce en un WER relativamente alto (0,3728) pese al CER bajo (0,0886); errores a nivel de palabra son frecuentes.
- El conjunto de evaluación es específico (HHD Option-B test) y el modelo se entrenó excluyendo los escritores de desarrollo; el rendimiento en escritores no vistos fuera de ese conjunto no está documentado.
- Riesgo de alucinación y de errores sistemáticos en escrituras alejadas de la distribución de entrenamiento; no se documentan análisis de sesgo.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Modelo experimental de investigación (estudio de aumento de datos), no un producto listo para producción; no se documentan procesos de validación adicionales.
- No se especifican limitaciones de longitud de contexto ni de resolución de entrada.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-htrvt-elastic4-s42
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Detalles adicionales: `results.json` en el repositorio del modelo (referenciado en la model card)
