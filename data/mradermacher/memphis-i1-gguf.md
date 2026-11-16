# mradermacher/MEMPHIS-i1-GGUF

## Resumen

MEMPHIS-i1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo MEMPHIS, publicado originalmente por el usuario darkc0de en Hugging Face y convertido a GGUF por mradermacher. El modelo base cuenta con 26.895.998.464 parámetros totales (aproximadamente 26,9 mil millones), lo que lo sitúa en la categoría de modelos densos de gran tamaño, adecuados para despliegue en hardware de gama alta o con cuantizaciones agresivas. La model card original no proporciona información sobre arquitectura, contexto, idiomas o licencia.

El interés de esta ficha reside en que se trata de una conversión GGUF con cuantizaciones ponderadas mediante imatrix, lo que permite ejecutar el modelo con llama.cpp y herramientas compatibles en configuraciones de VRAM más modestas que el modelo original en precisión completa. El repositorio ocupa 23,3 GB e incluye un conjunto amplio de cuantizaciones que van desde IQ1_S hasta Q6_K.

No obstante, la información disponible es muy limitada: no se especifican datos de entrenamiento, benchmarks, licencia ni idiomas soportados, por lo que muchas de las especificaciones de esta ficha deben marcarse como no disponibles y el lector debe consultar el repositorio original del modelo base antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones ponderadas con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base MEMPHIS en la documentación proporcionada. El dato de parámetros totales (26.895.998.464) proviene de los safetensors del modelo original, lo que confirma que se trata de un modelo denso de aproximadamente 26,9 mil millones de parámetros, pero no se especifica si emplea transformer estándar, atención lineal, arquitectura híbrida u otra variante.

Respecto al entrenamiento, la model card de esta conversión no incluye información sobre número de tokens, composición del dataset, técnicas de alineación (RLHF, DPO) ni innovaciones técnicas. La única información técnica relevante es que las cuantizaciones se han generado con pesos ponderados mediante imatrix (importance matrix), una técnica que mejora la calidad de las cuantizaciones de baja precisión al calibrar la importancia de cada tensor con datos representativos. El repositorio indica `quantize_version: 2` y `convert_type: hf`, lo que sugiere una conversión desde pesos Hugging Face con la herramienta estándar de llama.cpp.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está orientado a diálogo, aunque no se detallan capacidades específicas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante la infraestructura de Inference Endpoints de Hugging Face.
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- Capacidades de razonamiento, código, matemáticas, visión, tool calling o agentes: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modos especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Despliegue local de un modelo conversacional de ~27 B: gracias a las cuantizaciones GGUF (por ejemplo Q4_K_M), el modelo puede ejecutarse en estaciones de trabajo con GPU de 24 GB o en configuraciones con offloading a CPU, permitiendo prototipado de asistentes conversacionales sin depender de APIs externas.
- Experimentación con cuantizaciones imatrix: el repositorio ofrece un abanico amplio de cuantizaciones (desde IQ1_S hasta Q6_K), lo que permite comparar la degradación de calidad según el nivel de compresión en tareas de evaluación propias.
- Integración en pipelines de llama.cpp: al ser GGUF, puede integrarse en aplicaciones basadas en llama-cpp-python o servidores compatibles con la API de OpenAI para construir interfaces de chat.
- Evaluación comparativa de modelos de ~27 B: útil para investigadores que quieran medir el rendimiento de un modelo de este tamaño frente a alternativas conocidas en tareas de generación y diálogo.
- Servicio mediante Inference Endpoints: la etiqueta `endpoints_compatible` permite desplegarlo en la infraestructura gestionada de Hugging Face si se dispone de los recursos adecuados.
- Fine-tuning o destilación posteriores: aunque el formato GGUF no es ideal para entrenamiento, el modelo base en safetensors (referenciado en el repositorio original) podría servir como punto de partida para ajustes, siempre que la licencia lo permita (no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para un modelo de ~27 B, una cuantización Q4_K_M ocupa aproximadamente 16-17 GB, IQ2_XS en torno a 8-9 GB, y Q6_K alrededor de 22-23 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros y deben verificarse con el tamaño real de cada archivo del repositorio.
- GPU recomendadas: para cuantizaciones Q4-Q5, una RTX 4090 (24 GB) o A100 40 GB son adecuadas; para Q6_K se recomienda A100 80 GB o H100. Las cuantizaciones IQ1-IQ2 pueden caber en GPUs de 12-16 GB.
- Cabe en GPU de consumo: sí, en cuantizaciones bajas (IQ1_S, IQ2_XXS, IQ2_XS) en GPUs de 12 GB o más; en Q4_K_M en GPUs de 24 GB como la RTX 3090 o 4090.
- Opciones de despliegue: llama.cpp, Ollama (si se publica una variante compatible), servidores basados en llama-cpp-python, y potencialmente Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base (arquitectura, contexto, benchmarks) para establecer una comparativa rigurosa con alternativas de la misma categoría. Se indica "no disponible".

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar el repositorio original (darkc0de/MEMPHIS) antes de cualquier uso en producción.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de evaluación no se puede cuantificar.
- Sesgos: no documentados en la información disponible.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ2_XXS) pueden degradar notablemente la calidad; se recomienda validar en tareas propias antes de usarlas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- El modelo base podría tener restricciones de uso no reflejadas en esta conversión GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MEMPHIS-i1-GGUF
- Modelo base: https://huggingface.co/darkc0de/MEMPHIS
