# mradermacher/Gloomy-Dusk-26B-A4B-i1-GGUF

## Resumen

Gloomy-Dusk-26B-A4B-i1-GGUF es una colección de cuantizaciones GGUF, generadas por mradermacher, del modelo base Gloomy-Dusk-26B-A4B publicado por Sorihon. Se trata de un modelo conversacional de aproximadamente 26.000 millones de parámetros totales (25.971.339.550 según los pesos en safetensors), del que el sufijo A4B sugiere, aunque no está confirmado en la información disponible, una arquitectura de mezcla de expertos (MoE) con unos 4.000 millones de parámetros activos por token.

El interés de esta publicación es práctico: ofrece el modelo base en múltiples niveles de cuantización (desde IQ1_S hasta Q6_K, pasando por Q4_K_M, IQ4_XS, Q5_K_M, etc.), utilizando cuantizaciones con imatrix y pesos ponderados, lo que permite desplegar un modelo de este tamaño en hardware de consumo o en servidores con VRAM limitada. El repositorio ocupa 51,2 GB y se publicó el 21 de noviembre de 2026, con la actualización ese mismo día.

La información pública es muy escasa: no se especifican licencia, idiomas, pipeline ni detalles de entrenamiento, y el modelo no registra descargas ni likes en el momento de la consulta. Esta ficha se limita, por tanto, a los datos verificables del repositorio y marca explícitamente como no disponible todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el sufijo A4B sugiere MoE con ~4B activos, sin confirmar) |
| Parametros totales | 25.971.339.550 (~26B) |
| Parametros activos | No disponible (posiblemente ~4B por el sufijo A4B, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 51,2 GB |
| Metodo de cuantizacion | Imatrix / pesos ponderados (weighted/imatrix quants) |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1, convert_type hf |
| Tags | gguf, endpoints_compatible, imatrix, conversational, region:us |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Gloomy-Dusk-26B-A4B más allá de su tamaño (unos 26B parámetros totales) y de la convención de nombres A4B, que en la práctica habitual de la comunidad indica una mezcla de expertos con aproximadamente 4.000 millones de parámetros activos por token. No obstante, esta interpretación no está confirmada por la model card ni por documentación adicional del autor original.

Tampoco constan datos sobre el corpus de entrenamiento (número de tokens, composición del dataset), el proceso de alineación (RLHF, DPO u otros), ni innovaciones técnicas específicas como decodificación especulativa o mecanismos de atención lineal. La model card del repositorio de cuantizaciones es puramente técnica y se limita a indicar que se trata de cuantizaciones con imatrix y pesos ponderados del modelo Sorihon/Gloomy-Dusk-26B-A4B, generadas con quantize_version 2 y conversión desde formato Hugging Face.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está orientado a diálogo multi-turno, aunque no se detallan formatos de prompt ni plantillas de chat.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el GGUF puede servirse mediante infraestructuras compatibles con la API de endpoints de Hugging Face.
- Cuantizaciones de muy baja precisión (IQ1_S, IQ2_XXS) que permiten ejecución en entornos con memoria muy restringida, a costa de degradación de calidad.
- Capacidades de razonamiento, código, matemáticas, visión, tool calling o agentes: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en los metadatos.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes Q4_K_M e IQ4_XS permiten ejecutar un modelo de ~26B parámetros en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos completos en precisión original.
- Servicio conversacional en CPU: las cuantizaciones IQ2_M o Q3_K_M reducen el peso a un rango manejable para servidores sin GPU, adecuadas para prototipos de chatbot con requisitos de latencia moderados.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de veinte variantes del mismo modelo, lo que facilita medir la degradación de calidad frente al tamaño en un pipeline de pruebas propio.
- Integración en aplicaciones de escritorio: al ser GGUF, puede embeberse en herramientas tipo LM Studio, GPT4All o Jan sin dependencia de servicios en la nube.
- Experimentación académica con modelos MoE de tamaño medio: si se confirma la arquitectura A4B, resulta útil para estudiar el equilibrio entre parámetros totales y activos en tareas de razonamiento.
- Sustitución de modelos propietarios en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, siempre que la licencia del modelo base lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, según cuantización: Q6_K en torno a 22-24 GB; Q5_K_M en torno a 19-21 GB; Q4_K_M en torno a 16-18 GB; IQ4_XS en torno a 14-16 GB; Q3_K_M en torno a 12-13 GB; IQ2_M en torno a 9-10 GB; IQ1_S por debajo de 8 GB. Estas cifras son estimaciones a partir del tamaño del repositorio y del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para las cuantizaciones altas con contexto largo; RTX 4090 (24 GB) para Q5_K_M y Q6_K; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M e IQ4_XS; RTX 4060 Ti (16 GB) o GPUs de 12 GB para Q3_K_M.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones desde IQ4_XS hacia abajo en tarjetas de 16 GB o más; las variantes IQ2 e IQ3 caben en 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF y endpoints compatibles con la API de Hugging Face.
- Latencia y throughput: no disponibles; dependerán de la cuantización, del hardware y de la longitud de contexto, que tampoco se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gloomy-Dusk-26B-A4B-i1-GGUF | ~26B totales | No disponible | No disponible | GGUF | Cuantizaciones imatrix de un modelo de Sorihon |
| Modelos MoE de ~26B con ~4B activos (categoría genérica) | ~26B totales / ~4B activos | Variable | Variable | Safetensors, GGUF | No se dispone de datos concretos para una comparación verificable |
| Alternativas densas de ~27-32B (categoría genérica) | 27-32B | Variable | Variable | Safetensors, GGUF | Mayor coste de inferencia por token al no ser MoE |

No se dispone de información suficiente para establecer una comparativa numérica fiable con modelos concretos; los datos de rendimiento, contexto y licencia del modelo evaluado no están publicados.

## Limitaciones y advertencias

- Ausencia total de información sobre licencia: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor o consultar el repositorio del modelo base Sorihon/Gloomy-Dusk-26B-A4B antes de usarlo en producción.
- Idiomas no declarados: se desconoce si el modelo tiene un rendimiento aceptable en castellano u otros idiomas distintos del inglés.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que impide compararlo con alternativas establecidas.
- Riesgo de alucinación inherente a los modelos generativos; no consta ningún proceso de alineación documentado.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ2_XXS, Q2_K_S) degradan notablemente la calidad y pueden producir salidas incoherentes; no se recomiendan para uso en producción.
- El repositorio no registra descargas ni likes, y su fecha de creación es muy reciente, por lo que carece de validación por parte de la comunidad.
- El tag `skip_mmproj: 1` indica que no se incluye el proyector multimodal; si el modelo base tuviera capacidades de visión, estas no estarían disponibles en estas cuantizaciones.
- No se especifica la longitud de contexto soportada; usar contextos largos sin conocer el límite puede provocar degradación o errores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gloomy-Dusk-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/Sorihon/Gloomy-Dusk-26B-A4B
