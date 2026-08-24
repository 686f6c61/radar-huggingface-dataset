# mradermacher/Qwen3.8-27B-heretic-v2-i1-GGUF

## Resumen

Qwen3.8-27B-heretic-v2-i1-GGUF es una cuantización GGUF con imatrix del modelo Qwen3.8-27B-heretic-v2, un modelo de 26,9 mil millones de parámetros basado en la arquitectura Qwen3.8 que ha sido procesado con la herramienta Heretic para eliminar los mecanismos de censura y rechazo (abliteration). El modelo resultante es un sistema conversacional multimodal (texto e imagen) sin restricciones de contenido, desarrollado por mradermacher a partir del trabajo de Umranz.

La cuantización i1 ofrece 23 niveles de compresión, desde i1-IQ1_S (7,2 GB) hasta i1-Q6_K (22,2 GB), lo que permite ejecutar el modelo en hardware de consumo desde 8 GB de VRAM. El modelo mantiene la licencia Apache 2.0 del modelo base y está diseñado para entornos donde se requiere control expresivo total, como investigación en alineación, generación creativa sin filtros y análisis de comportamiento de modelos decensored.

La relevancia de este modelo radica en su carácter "uncensored" y "abliterated", que contrasta con los modelos comerciales con mecanismos de seguridad restrictivos. Su capacidad multimodal (visión) y su disponibilidad en múltiples niveles de cuantización lo hacen accesible para un amplio rango de hardware, desde GPU domésticas hasta clústeres profesionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix, i1) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de la familia Qwen3.8, con 26,9 mil millones de parámetros. Sobre este modelo se ha aplicado la técnica de abliteración (abliteration) mediante la herramienta Heretic, que elimina automáticamente los pesos responsables de los mecanismos de rechazo y censura. La versión "v2" indica una iteración mejorada del proceso de decensored.

El modelo es multimodal: el README indica explícitamente que se trata de un "vision model" y que los archivos de proyección de visión (mmproj) se encuentran en el repositorio estático de cuantización. La cuantización i1 utiliza una matriz de importancia (imatrix) para optimizar la asignación de bits en los cuantos de baja precisión, lo que mejora la calidad respecto a las cuantizaciones estáticas convencionales.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto sin restricciones de contenido: el modelo no rechaza solicitudes sobre temas sensibles, violentos o sexuales.
- Capacidades multimodales: procesamiento de imágenes y generación de texto basado en ellas (requiere los archivos mmproj del repositorio estático).
- Conversación multi-turno: diseñado para diálogos continuados.
- Capacidad de reproducibilidad: el proceso de cuantización está documentado y es reproducible.
- Idioma: exclusivamente inglés (en).
- Integración con endpoints: el tag "endpoints_compatible" indica que puede desplegarse en servicios de inferencia compatibles con la API de Hugging Face.

No se ha confirmado soporte de tool calling, function calling, ni razonamiento multi-paso (thinking mode) en la información disponible.

## Casos de uso

- **Investigación en alineación y seguridad de IA**: el modelo permite estudiar empíricamente el efecto de la ablación en el comportamiento de un modelo de 27B, comparando respuestas con el modelo original censurado. Se puede usar para medir la eficacia de técnicas de "decensored" y evaluar riesgos residuales.

- **Generación creativa de ficción sin restricciones**: escritores y guionistas pueden utilizar el modelo para generar narrativas que aborden temas tabú o contenido maduro sin que el modelo se niegue a responder. La cuantización Q4_K_M (16,6 GB) ofrece un equilibrio calidad/rendimiento adecuado para iteraciones creativas prolongadas.

- **Roleplay y simulación de personajes**: el modelo permite crear agentes conversacionales con personalidades complejas que no se limitan por políticas de seguridad. Adecuado para proyectos de entretenimiento interactivo que requieren respuestas sin filtros.

- **Análisis de comportamiento y riesgos de modelos abliterados**: investigadores pueden desplegar el modelo en un entorno de evaluación para medir tasas de alucinación, sesgos residuales y degradación de capacidades tras el proceso de ablación, comparando con el modelo base.

- **Generación de contenido para datasets sintéticos**: el modelo puede usarse para crear datasets de entrenamiento que incluyan respuestas a preguntas sensibles, que luego se utilizan para entrenar clasificadores de contenido o evaluar filtros de moderación.

- **Asistencia en escritura de contenido editorial sin moderación**: redactores de publicaciones especializadas en temas adultos pueden generar borradores sin restricciones, con la cuantización Q5_K_M (19,3 GB) para calidad cercana al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otros evaluadores estándar para este modelo o su base Qwen3.8-27B en los materiales proporcionados.

## Requisitos de hardware

- **i1-IQ1_S (7,2 GB)**: cabe en GPUs con 8 GB de VRAM, como RTX 3060 o RTX 4060. Calidad muy baja, recomendada solo para pruebas de concepto.
- **i1-IQ2_XXS (8,5 GB)**: requiere 10-12 GB de VRAM. Adecuado para RTX 3080 (10 GB) o RTX 3090 (24 GB).
- **i1-Q4_K_S (15,7 GB)**: recomendado como punto óptimo calidad/tamaño. Requiere 16-20 GB de VRAM, cabe en RTX 4090 (24 GB) o A100 24GB.
- **i1-Q4_K_M (16,6 GB)**: recomendado por el autor. Requiere 20-24 GB de VRAM. Adecuado para RTX 4090 o A100 24GB.
- **i1-Q6_K (22,2 GB)**: prácticamente equivalente al modelo estático Q6_K. Requiere 24-32 GB de VRAM, necesita A100 40GB o H100.
- **Despliegue**: compatible con llama.cpp, Ollama, vLLM (con soporte GGUF), y endpoints de Hugging Face.
- **Throughput y latencia**: no disponible. Dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Censura |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9B | no disponible | fp16 | Apache 2.0 | Sí |
| Qwen3.8-27B-heretic-v2 (base) | 26,9B | no disponible | fp16 | Apache 2.0 | No |
| Qwen3.8-27B-heretic-v2-i1-GGUF (este) | 26,9B | no disponible | 23 niveles GGUF | Apache 2.0 | No |
| Qwen3.8-27B-heretic-v2-GGUF (estático) | 26,9B | no disponible | GGUF estático | Apache 2.0 | No |

La comparativa con otros modelos de la misma categoría (modelos uncensored de ~27B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Ausencia total de filtros de seguridad**: el modelo puede generar contenido ofensivo, ilegal, sexual o dañino sin ningún tipo de restricción. No es apto para aplicaciones en producción donde se requiera moderación.
- **Riesgo de alucinación**: sin los mecanismos de alineación, la probabilidad de respuestas inventadas o factualmente incorrectas es mayor que en el modelo original.
- **Idioma limitado**: solo inglés. No hay soporte para otros idiomas, lo que limita su uso en entornos multilingües.
- **Contexto desconocido**: la longitud de contexto no está documentada, lo que dificulta la planificación de aplicaciones que requieran ventanas largas.
- **Calidad degradada en cuantizaciones bajas**: los niveles
