# cyttic/hmt-trocrscratch-none-s42

## Resumen

`cyttic/hmt-trocrscratch-none-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de una variante de TrOCR entrenada desde cero (*scratch*) sobre un conjunto de datos hebreo, y forma parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`. El modelo resuelve la transcripción de imágenes de escritura manuscrita a texto en hebreo mediante un cabezal CTC.

El modelo es relevante como artefacto de investigación: su nombre codifica la configuración experimental (`trocrscratch`, sin aumentación `none`, semilla `s42`), lo que permite reproducir y comparar resultados dentro del estudio. Con 22,4 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a experimentación más que a despliegue en producción.

La model card reporta un CER de 0,3880 y un WER de 0,9839 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Estas cifras indican un rendimiento limitado, coherente con un modelo entrenado desde cero sin aumentación y sin post-procesado lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder-decoder transformer para HTR), entrenado desde cero |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder diseñado para reconocimiento óptico de caracteres sobre imágenes, adaptado aquí a escritura manuscrita y equipado con un cabezal CTC para decodificación. A diferencia de las variantes TrOCR preentrenadas, este modelo se entrena desde cero (*scratch*), sin inicialización a partir de pesos preentrenados en texto o imagen.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, con la configuración de aumentación `none` (sin aumentación de datos) y semilla 42. La evaluación se realizó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Decodificación CTC con salida de secuencia de caracteres.
- Entrenamiento desde cero, sin dependencia de pesos preentrenados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades especiales más allá del HTR.

## Casos de uso

- Investigación en HTR: servir como línea base (*baseline*) para comparar el efecto de distintas estrategias de aumentación dentro del estudio `htr-metrics-transfer`, dado que el nombre del modelo codifica la configuración exacta.
- Reproducibilidad experimental: al fijar la semilla 42 y la ausencia de aumentación, permite replicar resultados y aislar la contribución de otras variables del pipeline.
- Digitalización de archivos manuscritos en hebreo: útil en proyectos de transcripción asistida donde se acepte un CER cercano a 0,39 y se combine con corrección humana posterior.
- Evaluación de arquitecturas encoder-decoder para HTR: permite medir el rendimiento de TrOCR entrenado desde cero frente a variantes preentrenadas en un dominio concreto.
- Generación de datos sintéticos de entrenamiento: las transcripciones imperfectas pueden servir como pseudoetiquetas para preentrenar modelos mayores con corrección posterior.
- Docencia y experimentación: modelo compacto (22,4 M de parámetros, 0,1 GB) adecuado para entornos con recursos limitados donde se quiera estudiar el comportamiento de CTC en HTR.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto / configuracion |
|---|---|---|
| CER | 0,3880 | HHD Option-B test, greedy, sin LM |
| WER | 0,9839 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 22,4 M de parámetros; no se dispone de estimaciones oficiales por cuantización.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se desconoce si el autor reporta configuraciones específicas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no disponible; al ser safetensors, requiere cargar con la clase correspondiente de la librería de transformers o del framework del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratch-none-s42 | 22,4 M | no disponible | MIT | Hugging Face | TrOCR desde cero, hebreo, CER 0,3880 |
| TrOCR (variantes preentrenadas de Microsoft) | variable (aprox. 334 M en base) | no disponible | MIT | Hugging Face | Preentrenado en texto/imagen; no específico para hebreo |
| Modelos HTR específicos para hebreo | no disponible | no disponible | no disponible | no disponible | No se dispone de referencias comparables en la información |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento limitado: CER de 0,3880 y WER de 0,9839 implican una tasa de error elevada; no es apto para transcripción automática sin revisión humana.
- Entrenado desde cero y sin aumentación: probablemente generaliza peor que variantes preentrenadas o con aumentación.
- Sesgos conocidos: no documentados; al entrenarse sobre un conjunto con escritores específicos, puede presentar sesgo hacia esos estilos de escritura.
- Riesgo de alucinación: en HTR, el modelo puede generar caracteres o palabras no presentes en la imagen, especialmente con decodificación greedy y sin modelo de lenguaje.
- Limitación de idioma: solo hebreo; no soporta otros idiomas ni escritura impresa de forma fiable.
- Restricciones de licencia: MIT permite uso comercial, pero el rendimiento reportado desaconseja su uso en producción sin validación adicional.
- Caveat de producción: la ausencia de modelo de lenguaje en la decodificación agrava los errores; se recomienda combinarlo con un corrector posterior.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratch-none-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Detalles del estudio: `results.json` en el repositorio del modelo (referenciado en la model card)
