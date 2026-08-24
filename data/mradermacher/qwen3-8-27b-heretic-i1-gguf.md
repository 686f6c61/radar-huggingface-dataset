# mradermacher/Qwen3.8-27B-Heretic-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-Heretic-i1-GGUF` es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo base `asfgsdfg/Qwen3.8-27B-Heretic`, que a su vez es una versión "abliterated" (sin censura) de un modelo de la familia Qwen3.8 con aproximadamente 26,9 mil millones de parámetros. El autor, mradermacher, es un conocido cuantizador de la comunidad que publica pesos en formato GGUF para su uso con motores de inferencia como llama.cpp, Ollama o LM Studio. La etiqueta "i1" indica que los quants han sido generados con la técnica de imatrix, que optimiza la asignación de bits según la importancia de cada tensor, mejorando la calidad respecto a cuantizaciones estáticas del mismo tamaño.

Este modelo es relevante porque ofrece una versión sin restricciones de contenido de un modelo de gran tamaño, accesible para ejecución local en hardware de consumo gracias a las cuantizaciones de baja precisión (desde IQ1_M hasta Q6_K). La ausencia de censura lo hace atractivo para tareas de generación creativa, roleplay o investigación sobre alineación, aunque conlleva riesgos importantes de contenido inapropiado. La disponibilidad de múltiples niveles de cuantización permite adaptar el modelo a diferentes capacidades de VRAM y requisitos de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (denso, basado en Qwen3.8) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix separado) |

## Arquitectura y entrenamiento

El modelo base `asfgsdfg/Qwen3.8-27B-Heretic` es una adaptación de un modelo Qwen3.8 de 27B parámetros, al que se le ha aplicado la técnica "Heretic" (desarrollada por p-e-w) para eliminar automáticamente la censura o los mecanismos de rechazo de contenido. Esta técnica modifica los pesos del modelo para que no genere respuestas de negación ante solicitudes que el modelo original consideraría inapropiadas. No se dispone de información detallada sobre el entrenamiento original del modelo Qwen3.8 (datos, número de tokens, método de alineación, etc.) en la documentación proporcionada.

La cuantización realizada por mradermacher utiliza el método imatrix, que calcula una matriz de importancia sobre un conjunto de datos de calibración para asignar una precisión variable a los tensores, reduciendo la pérdida de calidad en comparación con cuantizaciones uniformes. Los archivos GGUF resultantes son compatibles con llama.cpp y sus derivados. La model card indica que se trata de un modelo de visión (vision model), por lo que es probable que el modelo base incluya un codificador visual, aunque los archivos mmproj (proyección multimodal) se encuentran en el repositorio estático, no en este.

## Capacidades

- Generacion de texto en ingles, con capacidad de razonamiento y generacion creativa, al estar basado en la familia Qwen3.8.
- Capacidades multimodales (vision) segun la model card, aunque los archivos de proyeccion (mmproj) no estan incluidos en este repositorio y deben descargarse del repositorio estatico.
- Ausencia de censura: el modelo ha sido modificado para no rechazar solicitudes de contenido explicito, violento o delicado, lo que permite su uso en escenarios de roleplay, escritura creativa sin restricciones o investigacion sobre comportamientos no alineados.
- Soporte de cuantizacion extrema (IQ1_M, IQ2_XXS) que permite ejecutar el modelo en hardware con muy poca VRAM, aunque con una degradacion significativa de la calidad.
- Compatibilidad con motores de inferencia que soporten GGUF (llama.cpp, Ollama, LM Studio, etc.) y con la tecnica imatrix para una mejor relacion calidad-tamano.

## Casos de uso

- Roleplay y escritura creativa sin restricciones: el modelo puede generar dialogos, narrativas o escenas con contenido adulto o controvertido sin rechazos, lo que lo hace util para autores que necesitan explorar temas tabu en sus obras.
- Investigacion sobre alineacion y censura: permite estudiar como se comporta un modelo sin mecanismos de rechazo, comparando sus respuestas con las del modelo original para analizar el impacto de la abliteracion.
- Generacion de contenido para juegos de rol o simulaciones: su capacidad de mantener personajes y contextos largos (si el contexto del modelo base es amplio) lo hace adecuado para sistemas de NPC en videojuegos o mundos virtuales.
- Pruebas de estres de sistemas de moderacion: al generar contenido que normalmente seria bloqueado, puede utilizarse para evaluar y mejorar filtros de contenido en plataformas.
- Despliegue local en equipos modestos: gracias a las cuantizaciones de baja precision (IQ1_M, IQ2_XXS), puede ejecutarse en GPUs con 8 GB o menos de VRAM, permitiendo experimentar con un modelo de 27B en hardware de consumo.
- Creacion de datasets de entrenamiento para modelos de seguridad: las respuestas generadas pueden servir como ejemplos de contenido no deseado para entrenar clasificadores o sistemas de deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se proporcionan comparaciones de rendimiento entre las distintas cuantizaciones, aunque el autor menciona que los quants IQ suelen ser preferibles a los no-IQ de tamano similar. Para una evaluacion objetiva, se recomienda ejecutar pruebas propias con el hardware y la cuantizacion elegida.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamano del archivo GGUF, se puede estimar la VRAM necesaria. Por ejemplo, el archivo i1-Q4_K_M de 16,6 GB requerira aproximadamente 18-20 GB de VRAM (incluyendo overhead de contexto y capas). El i1-IQ1_M de 7,7 GB puede caber en una GPU de 8 GB, aunque con calidad muy reducida.
- GPU recomendadas: para cuantizaciones de alta calidad (Q4_K_M, Q6_K) se recomienda una GPU con 24 GB de VRAM (RTX 3090/4090, A5000) o mas. Para cuantizaciones bajas (IQ2_M, IQ3_XXS) una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB pueden ser suficientes.
- Si cabe en consumer GPU: si, las cuantizaciones de 7,7 a 16,6 GB son compatibles con GPUs de consumo de gama media-alta (16-24 GB). Las opciones mas pequenas (IQ1_M, IQ2_XXS) caben en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend llama.cpp), o cualquier motor compatible con GGUF. Tambien se puede usar vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se dispone de datos medidos. En general, un modelo de 27B cuantizado a Q4_K_M en una RTX 4090 puede generar entre 20 y 40 tokens por segundo, pero esto depende de la implementacion y del contexto.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoria. El modelo base Qwen3.8-27B no tiene una ficha publica en la informacion proporcionada, y no se conocen alternativas directas con el mismo tamano y caracteristicas de abliteracion. Se puede mencionar que existen otros modelos "abliterated" de la comunidad (por ejemplo, versiones de Llama o Mistral sin censura), pero no hay datos concretos para comparar. Por tanto, esta seccion se considera no disponible.

## Limitaciones y advertencias

- Contenido sin censura: al haber sido modificado para eliminar los rechazos, el modelo puede generar contenido explicito, violento, ilegal o danino. Su uso en entornos de produccion o publicos requiere medidas de seguridad adicionales y es probable que viole las politicas de uso de muchas plataformas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o informacion falsa, especialmente en cuantizaciones de baja precision donde la calidad se degrada notablemente.
- Idioma limitado: la model card indica solo ingles. No se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- Contexto no especificado: se desconoce la longitud de contexto maxima del modelo base. Si es inferior a lo habitual en Qwen (por ejemplo, 32K), las tareas de contexto largo pueden fallar.
- Cuantizacion extrema: los quants IQ1_M e IQ2_XXS producen una degradacion severa de la calidad, con errores gramaticales y perdida de coherencia. Solo son recomendables para pruebas muy limitadas.
- Licencia Apache-2.0: aunque permite uso comercial, la naturaleza del modelo (sin censura) puede generar responsabilidades legales si se distribuye contenido generado que infrinja leyes de cada pais.
- Dependencia de archivos externos: para usar la capacidad de vision, es necesario descargar los archivos mmproj del repositorio estatico, que no estan incluidos en este repo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-i1-GGUF
- Repositorio estatico (quants sin imatrix y mmproj): https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-GGUF
- Modelo base: https://huggingface.co/asfgsdfg/Qwen3.8-27B-Heretic
- Herramienta Heretic (abliteration): https://github.com/p-e-w/heretic
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
