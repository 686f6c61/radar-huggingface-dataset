# GoktugD/Werea-TR-Summarizer

## Resumen

Werea-TR-Summarizer es un modelo de resumen automático de noticias en turco, desarrollado por Göktuğ Düşünen (GoktugD) y publicado bajo licencia MIT. Se basa en el modelo multilingüe mT5-small de Google, con 300 millones de parámetros, y ha sido ajustado específicamente sobre el dataset TR-News, compuesto por 50.000 pares de noticia-resumen en turco. El modelo está diseñado para generar resúmenes concisos y fieles de artículos periodísticos, utilizando el prefijo `özet: ` para activar la tarea.

La relevancia de este modelo radica en su especialización en un idioma con pocos recursos dedicados a la generación de resúmenes, ofreciendo una alternativa ligera y de código abierto para integraciones en español o turco. Su tamaño reducido permite su despliegue en entornos con recursos limitados, como CPUs o GPUs de gama media, y su licencia MIT facilita su uso comercial sin restricciones. Aunque no se especifican detalles sobre la longitud de contexto, al heredar la arquitectura de mT5-small, se espera un contexto de 512 tokens, aunque este dato no se confirma en la documentación oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | 300.176.768 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 (Text-to-Text Transfer Transformer), un encoder-decoder basado en transformer que trata todas las tareas como generación de texto. Al estar basado en mT5-small, hereda su configuración de 300 millones de parámetros y su tokenizer multilingüe, aunque el ajuste fino se ha realizado exclusivamente con datos en turco. El entrenamiento se llevó a cabo sobre el dataset TR-News, que contiene 50.000 pares de noticia-resumen, y se evaluó en la partición de test con 400 ejemplos. No se han publicado detalles sobre el proceso de entrenamiento (épocas, optimizador, técnicas de regularización), pero se sabe que se utiliza el prefijo `özet: ` para indicar la tarea de resumen, siguiendo la convención de T5.

## Capacidades

- Generación de resúmenes abstractivos de noticias en turco, produciendo textos concisos que capturan la información principal.
- Manejo de textos de entrada de longitud moderada, limitado por el contexto del modelo base (probablemente 512 tokens, aunque no confirmado).
- Soporte para inferencia mediante la librería `transformers` de Hugging Face, con la API de pipeline de resumen.
- No se han documentado capacidades adicionales como tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Resumen automático de noticias para portales de medios: el modelo puede integrarse en un pipeline de procesamiento de artículos para generar titulares o resúmenes breves, reduciendo el trabajo manual de los editores.
- Agregación de contenido en aplicaciones de lectura: permite condensar múltiples noticias en resúmenes cortos para que los usuarios obtengan una visión rápida de la actualidad.
- Análisis de tendencias en redes sociales: al resumir publicaciones largas o hilos, facilita la extracción de información clave para monitorización de marca o investigación.
- Asistencia en investigación periodística: ayuda a los periodistas a revisar rápidamente grandes volúmenes de artículos, generando resúmenes que sirven como punto de partida para la redacción.
- Generación de descripciones para boletines informativos: el modelo puede producir resúmenes de noticias para incluir en newsletters automáticas, ahorrando tiempo en la curaduría de contenido.
- Integración en sistemas de atención al cliente: aunque no es su función principal, puede adaptarse para resumir conversaciones o documentos internos en turco, mejorando la eficiencia de los agentes.

## Benchmarks y rendimiento

El modelo fue evaluado en la partición de test del dataset TR-News (n=400) con métricas ROUGE. Los resultados publicados son:

| Metrica | Resultado |
|---|---|
| ROUGE-1 | 32.5 |
| ROUGE-2 | 20.3 |
| ROUGE-L | 29.4 |

No se han publicado comparaciones con otros modelos de resumen en turco en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 300 millones de parámetros, la inferencia puede ejecutarse en CPU con un rendimiento aceptable para tareas por lotes, aunque se recomienda una GPU para latencias bajas.
- VRAM estimada: no disponible en la documentación, pero un modelo de este tamaño en precisión fp32 ocupa aproximadamente 1,2 GB, por lo que cabría en GPUs con 2 GB o más (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.).
- Para despliegue en producción, se puede utilizar vLLM, TGI o la API de `transformers` con `pipeline`. También es compatible con llama.cpp si se convierte a GGUF, aunque no se proporcionan cuantizaciones oficiales.
- La latencia dependerá del hardware; en una GPU moderna (RTX 3090) se esperan tiempos de generación de menos de un segundo para resúmenes de 100 tokens, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se podría comparar con el modelo base mT5-small sin ajuste, que probablemente tenga un rendimiento inferior en la tarea de resumen en turco, pero no hay datos numéricos para respaldar esta afirmación. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con noticias en turco, por lo que su rendimiento en otros idiomas o dominios (por ejemplo, textos médicos o legales) será deficiente.
- Al ser un modelo pequeño, puede presentar alucinaciones o resúmenes que omitan información relevante, especialmente con textos largos o complejos.
- La longitud de contexto no está confirmada, pero se espera que sea limitada (512 tokens), lo que restringe la entrada a artículos de extensión media.
- No se han documentado sesgos específicos, pero al entrenarse con noticias, podría reflejar los sesgos presentes en el dataset TR-News.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la procedencia del dataset para cumplir con posibles términos de uso de los datos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/GoktugD/Werea-TR-Summarizer)
- [Espejo del modelo (Werea-co)](https://huggingface.co/Werea-co/Werea-TR-Summarizer)
- [Dataset TR-News](https://huggingface.co/datasets/batubayk/TR-News)
- [Modelo base mT5-small](https://huggingface.co/google/mt5-small)
- [Sitio web de Werea](https://werea.co)
