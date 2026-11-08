# cyttic/hmt-trocrscratchline-photo4-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchline-photo4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el usuario cyttic dentro de un estudio de augmentación de datos denominado *htr-metrics-transfer*. Se trata de una variante del enfoque TrOCR entrenada desde cero (*scratch*) sobre una versión concreta del conjunto de datos `cyttic/hhd-optionb-split`, con una augmentación de imagen identificada como `photo4` y una semilla fija de 42. El modelo está orientado exclusivamente al idioma hebreo (`he`) y emplea una arquitectura de decodificación CTC.

Con 22.421.004 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto pensado para experimentación controlada más que para despliegue en producción. Su relevancia es metodológica: forma parte de una batería de experimentos que comparan el efecto de distintas augmentaciones y semillas sobre las métricas CER/WER en reconocimiento de texto manuscrito. Los resultados publicados en la model card indican un CER de 0,4052 y un WER de 0,9683 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

La licencia MIT y el formato safetensors facilitan su reutilización y auditoría, aunque el rendimiento reportado es elevado en términos de error y debe interpretarse en el contexto de un estudio comparativo, no como un modelo de referencia para HTR en hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con decodificacion CTC (entrenado desde cero) |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el enfoque TrOCR (*Transformer-based Optical Character Recognition*), combinando un codificador de visión de tipo transformer con un decodificador. En esta variante concreta, la decodificación se realiza mediante CTC (*Connectionist Temporal Classification*), lo que permite alinear secuencias de caracteres sin necesidad de un modelo de lenguaje externo. El modelo se ha entrenado desde cero (*scratch*), sin partir de pesos preentrenados de TrOCR, lo que lo convierte en una ablación controlada dentro del estudio.

Los datos de entrenamiento proceden del conjunto `cyttic/hhd-optionb-split`, en su partición de entrenamiento excluyendo los escritores reservados para desarrollo. La augmentación aplicada se denomina `photo4` y la semilla de inicialización es 42. La evaluación se ha realizado sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo CER 0,4052 y WER 0,9683. No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF/DPO, que en un modelo CTC de este tipo no resulta esperable.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo sobre imágenes de línea de texto.
- Decodificación CTC greedy sin modelo de lenguaje externo.
- Salida de secuencia de caracteres alineada con la imagen de entrada.
- Entrenamiento desde cero como parte de un estudio de augmentación, útil para reproducir ablaciones.
- No se dispone de información sobre soporte de tool calling, function calling ni capacidades de agente.
- No se dispone de información sobre capacidades multimodales más allá de la entrada de imagen y salida de texto.
- El soporte multilingüe se limita al hebreo según la model card.

## Casos de uso

- Investigación en augmentación de datos para HTR: el modelo sirve como punto de comparación reproducible dentro del estudio `htr-metrics-transfer`, permitiendo medir el efecto de la augmentación `photo4` frente a otras variantes con la misma semilla.
- Reproducción de ablaciones: al ser un modelo entrenado desde cero con semilla fija, permite replicar experimentos y verificar la variabilidad introducida por la inicialización.
- Transcripción de líneas manuscritas en hebreo en entornos de laboratorio: puede emplearse para generar transcripciones preliminares sobre imágenes de línea segmentadas, siempre con revisión humana dada la tasa de error reportada.
- Generación de datos sintéticos de entrenamiento: las salidas del modelo pueden usarse como pseudo-etiquetas para preentrenar o aumentar otros modelos HTR en hebreo, filtrando por confianza.
- Evaluación comparativa de decodificadores CTC: sirve como referencia fija para comparar estrategias de decodificación (greedy frente a beam search con o sin LM) sobre el mismo conjunto de test.
- Docencia y experimentación académica: su tamaño reducido (0,1 GB) y licencia MIT permiten desplegarlo en entornos con recursos limitados para prácticas de HTR.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,4052 | HHD Option-B test, decodificacion greedy, sin LM |
| WER | 0,9683 | HHD Option-B test, decodificacion greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es coherente con la naturaleza del modelo, orientado exclusivamente a HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 22,4 millones de parámetros y el repositorio de 0,1 GB; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también es viable en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, con amplio margen, incluidas GPUs de gama baja y entornos integrados.
- Opciones de despliegue: PyTorch con safetensors; no se dispone de información sobre soporte en vLLM, llama.cpp, Ollama o TGI, que en general no cubren arquitecturas CTC de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchline-photo4-s42 | 22,4 M | no disponible | CER 0,4052 / WER 0,9683 (HHD Option-B) | MIT | Hugging Face |
| Otras variantes del estudio htr-metrics-transfer | no disponible | no disponible | no disponible en esta ficha | no disponible | Hugging Face (cyttic) |
| TrOCR base (Microsoft) | no disponible en esta ficha | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría; las variantes del propio estudio son el comparador natural, pero sus métricas no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Tasa de error elevada: CER 0,4052 y WER 0,9683 indican que más del 40 % de los caracteres y casi la totalidad de las palabras se transcriben incorrectamente en el conjunto de evaluación; no es adecuado para producción sin revisión humana.
- Sesgos conocidos: no se dispone de información sobre sesgos específicos; al entrenarse sobre un dataset concreto de escritores, puede generalizar mal a manos no representadas.
- Riesgo de alucinación: en decodificación CTC sin modelo de lenguaje el riesgo de texto inventado es menor, pero persisten errores de sustitución y omisión sistemáticos.
- Limitaciones de idioma: soporte exclusivo del hebreo; no se ha validado en otros alfabetos o idiomas.
- Limitaciones de contexto: no se dispone de información sobre la longitud máxima de secuencia soportada.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución con atribución; conviene conservar el aviso de copyright.
- Caveat para producción: el modelo forma parte de un estudio de augmentación y su configuración (semilla 42, augmentación `photo4`) está optimizada para comparación experimental, no para máximo rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-photo4-s42
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Resultados del experimento: `results.json` en el repositorio del modelo
- Enlace de búsqueda web no relacionado con este modelo (modelo de imagen SDXL homónimo en TensorHub Art): https://tensorhub.art/models/935420567476035279
