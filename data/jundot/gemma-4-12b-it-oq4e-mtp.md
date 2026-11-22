# Jundot/gemma-4-12B-it-oQ4e-mtp

## Resumen

gemma-4-12B-it-oQ4e-mtp es una cuantización mixta en formato MLX del modelo google/gemma-4-12B-it, desarrollada por el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0). El modelo base pertenece a la familia Gemma 4 de Google DeepMind y es un modelo "Unified" de 11,95 mil millones de parámetros: no dispone de codificadores separados por modalidad, sino que los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings mediante capas lineales ligeras, y todas las modalidades se procesan a través de un único transformer decoder-only con una ventana de contexto de 256K tokens.

El checkpoint incorpora además una cabeza de predicción multi-token (MTP) fusionada desde google/gemma-4-12B-it-assistant, lo que permite decodificación especulativa y acelera la generación. La cuantización emplea precisión mixta asignada por sensibilidad medida por capa, con un promedio efectivo de 4,834 bits por peso en el backbone de lenguaje y 5,215 bits por peso en el checkpoint completo, lo que reduce el almacenamiento a 7,517 GiB.

Su relevancia práctica radica en que permite ejecutar un modelo multimodal any-to-any de 12B parámetros con contexto de 256K en hardware Apple Silicon mediante MLX, manteniendo una licencia Apache-2.0 y un tamaño de repositorio de 8,1 GB, muy inferior al de los pesos originales en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only unificado (gemma4_unified), con proyecciones lineales para imagen y audio y cabeza MTP |
| Parametros totales | 12.382.587.188 (12,383B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | oQ4e de precisión mixta: affine 4-bit grupo 64 (69,493% de los pesos), affine 5-bit grupo 64 (24,753%), affine 6-bit grupo 64 (2,032%), affine 8-bit grupo 64 (0,016%), BF16 (3,705%); media efectiva 4,834 bits/peso en el backbone y 5,215 bits/peso en el checkpoint completo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only unificado de la familia Gemma 4. A diferencia de las arquitecturas multimodales clásicas con codificadores independientes, aquí los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings mediante capas lineales ligeras (0,015B de parámetros para la proyección de visión y 0,002B para la de audio), y todas las modalidades se procesan en un único decodificador con 256K tokens de contexto. El checkpoint incluye una cabeza de predicción multi-token (MTP) de 0,423B parámetros fusionada desde google/gemma-4-12B-it-assistant, que habilita decodificación especulativa.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO en el modelo base. Respecto a esta versión cuantizada, oQ4e asigna bits según la sensibilidad medida por capa, redondea cada grupo con una matriz de importancia (128 muestras de 512 tokens) y aplica un reajuste por mínimos cuadrados ponderados de la escala y el sesgo. La versión actual (actualizada el 2026-11-19) se recuantizó con el redondeo oQe refinado de oMLX 0.8.0, que reduce el error de cuantización manteniendo tamaño y velocidad.

## Capacidades

- Generación de texto y razonamiento con una ventana de contexto de 256K tokens.
- Procesamiento multimodal any-to-any: entrada de imagen y audio proyectadas al espacio de embeddings del decodificador, con pipeline declarado como any-to-any.
- Decodificación especulativa mediante la cabeza MTP integrada, orientada a acelerar la inferencia.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio especiales más allá de lo descrito: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos en local: con 256K tokens de contexto, el modelo puede ingerir contratos, informes o bases de código extensas en una sola pasada sobre un Mac con Apple Silicon, sin fragmentación.
- Análisis de imagen en flujos de trabajo de escritorio: al proyectar parches de imagen directamente al espacio de embeddings, permite describir, clasificar o extraer información de capturas y fotografías dentro de una aplicación MLX nativa.
- Transcripción y análisis de audio: la proyección de formas de onda permite integrar resúmenes o consultas sobre grabaciones en pipelines locales, sin depender de servicios en la nube.
- Asistente de desarrollo en local: el checkpoint de 7,517 GiB cabe en memoria unificada de equipos Apple de gama alta, lo que facilita su uso como asistente de código sin conexión.
- Prototipado de aplicaciones multimodales: la licencia Apache-2.0 y el formato MLX simplifican la experimentación académica y la integración en productos propios.
- Evaluación de técnicas de cuantización: al publicar la distribución de bits por capa y el método oQe, sirve como referencia para estudiar el impacto de la precisión mixta en modelos multimodales.
- Generación acelerada con decodificación especulativa: la cabeza MTP integrada permite medir y comparar el throughput frente al modelo base sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 7,517 GiB de almacenamiento para los pesos; en ejecución hay que sumar la caché KV para 256K tokens, que puede ser muy elevada y no está cuantificada en la información disponible.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son los chips Apple Silicon (M-series) con memoria unificada; no se indica compatibilidad con A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? En equipos Apple con memoria unificada de 16 GB o más, los pesos caben; el margen real depende de la longitud de contexto utilizada.
- Opciones de despliegue: librería MLX y la herramienta oMLX del autor; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la cabeza MTP está pensada para acelerar la generación mediante decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/gemma-4-12B-it-oQ4e-mtp | 12,383B | 256K | MLX safetensors, 4,834 bits/peso en backbone | Apache-2.0 | Cuantización mixta con cabeza MTP integrada |
| google/gemma-4-12B-it | 11,95B | 256K | no disponible | Apache-2.0 (licencia Gemma 4) | Modelo base sin cuantizar, sin cabeza MTP |
| google/gemma-4-12B-it-assistant | no disponible | no disponible | no disponible | no disponible | Origen de la cabeza MTP fusionada |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Al ser una cuantización de 4-5 bits, existe una pérdida de precisión respecto al modelo base en BF16; el autor indica que la versión actual reduce el error, pero no publica métricas de degradación.
- Riesgo de alucinación inherente a los modelos de lenguaje generativos; no se documentan evaluaciones específicas.
- Idiomas soportados no documentados en esta ficha.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache-2.0 remite a la licencia Gemma 4 de Google; conviene revisar sus términos para uso comercial.
- El formato MLX limita el despliegue a ecosistema Apple; no es directamente utilizable en CUDA sin conversión.
- La caché KV para contextos de 256K puede consumir una cantidad de memoria muy superior a la de los pesos, lo que restringe el contexto práctico en equipos con memoria unificada limitada.
- El autor recomienda volver a descargar el modelo si se posee una copia anterior al 2026-11-19.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/gemma-4-12B-it-oQ4e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo asistente (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-12B-it-assistant
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
- Pull request oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
