# mradermacher/Glimmer-30B-2026-Knowledge-i1-GGUF

## Resumen

Glimmer-30B-2026-Knowledge-i1-GGUF es una distribución de cuantizaciones GGUF del modelo base OfflineBase/Muse-Glimmer-30B-2026-Knowledge, publicada por el usuario mradermacher, especializado en la conversión de pesos a formatos ligeros para inferencia local. El modelo base es un transformer de aproximadamente 27.850 millones de parámetros (etiquetado comercialmente como "30B") entrenado específicamente para actualización de conocimiento sobre noticias y eventos de 2026, según indican las etiquetas `knowledge-update` y `2026-news`. Esta versión i1 incorpora cuantizaciones ponderadas con imatrix, lo que mejora la calidad por bit frente a las cuantizaciones estáticas equivalentes.

La relevancia de esta ficha radica en que ofrece un abanico de 26 cuantizaciones GGUF que van desde 6,6 GB (IQ1_S) hasta 23,0 GB (Q6_K), permitiendo desplegar un modelo de casi 28B parámetros en hardware de consumo. La model card indica además que se trata de un modelo de visión, con archivos mmproj disponibles en el repositorio estático del mismo autor. El idioma declarado es exclusivamente inglés y la licencia combina Apache 2.0 con la MUSE Model License, lo que exige revisión legal antes de uso comercial.

El modelo está pensado para desarrolladores que necesitan un asistente conversacional con conocimiento actualizado a 2026 y capacidad multimodal, ejecutable en local mediante llama.cpp u Ollama. No se han publicado especificaciones detalladas de arquitectura, contexto ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; modelo base Muse-Glimmer-30B) |
| Parametros totales | 27.854.794.240 (~27,85B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (también disponibles cuantizaciones estáticas en repo separado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0-and-muse-model-license (Apache 2.0 + MUSE Model License) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Muse-Glimmer-30B-2026-Knowledge en la documentación proporcionada. Por el recuento de parámetros (27,85B) y la librería declarada (`transformers`), se trata de un transformer denso de gran tamaño, no de una arquitectura MoE. La model card menciona que fue construido con "muse-spark-open" y entrenado sobre el dataset OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data, orientado a la actualización de conocimiento con noticias de 2026. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa.

La contribución técnica de esta ficha concreta es la cuantización: mradermacher ha generado cuantizaciones i1 (importancia-based) utilizando un archivo imatrix de 0,1 GB, lo que permite asignar bits de forma no uniforme según la importancia de cada tensor. Según las notas del autor, las cuantizaciones IQ de tamaño similar suelen ser preferibles a las no-IQ, y en varios casos IQ3_S "beats Q3_K*" o IQ3_M supera a Q3_K_L. La model card advierte que es un modelo de visión y que los archivos mmproj, si existen, están en el repositorio estático.

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta `conversational` en los metadatos.
- Actualización de conocimiento orientada a noticias y eventos de 2026 (tags `knowledge-update` y `2026-news`).
- Capacidad multimodal de visión: la model card indica explícitamente "This is a vision model", con archivos mmproj en el repositorio estático.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Cuantizaciones optimizadas para inferencia local con llama.cpp y derivados.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional local con conocimiento de 2026: gracias a su entrenamiento específico en noticias de ese año, puede responder preguntas sobre eventos recientes sin depender de una búsqueda web, desplegado con la cuantización Q4_K_M (17,0 GB) en una GPU de 24 GB.
- Análisis de documentos e imágenes en inglés: al ser un modelo de visión, permite extraer información de capturas, diagramas o documentos escaneados usando los archivos mmproj del repositorio estático junto con el GGUF principal.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: la cuantización IQ2_M (9,9 GB) o Q3_K_M (13,8 GB) permite ejecutar el modelo en CPU con llama.cpp o en GPUs consumer de 12-16 GB, a costa de cierta pérdida de calidad.
- Prototipado rápido de chatbots especializados en actualidad: la disponibilidad de 26 cuantizaciones permite iterar desde un IQ1_S (6,6 GB) para pruebas funcionales hasta Q6_K (23,0 GB) para evaluación de calidad final.
- Integración en pipelines de CI/CD para tareas de generación de texto en inglés: la compatibilidad con endpoints y el formato GGUF facilitan su uso con servidores de inferencia tipo llama.cpp server u Ollama.
- Evaluación comparativa de cuantizaciones: el archivo imatrix incluido (0,1 GB) permite generar cuantizaciones propias y comparar la degradación de calidad entre IQ y Q a igual tamaño, un caso de uso habitual en investigación de compresión de modelos.
- Distribución de un asistente offline en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen del dispositivo, adecuado para análisis de documentación interna en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 7 y 9 GB para IQ1/IQ2, 10-14 GB para Q2_K/Q3_K, 15-18 GB para IQ4_XS/Q4_K_M, 19-20 GB para Q5_K, y 23 GB para Q6_K. Añadir overhead de contexto KV cache según la longitud de contexto (no disponible).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para IQ4_XS o Q4_K_S; RTX 4060 Ti (16 GB) o RTX 3080 (12 GB) para IQ3_M o Q3_K_M; GPUs de 8 GB solo con IQ1/IQ2 y calidad reducida.
- Cabe en GPU consumer: sí, en todas las cuantizaciones hasta Q6_K en una RTX 4090; las cuantizaciones IQ2_M y superiores caben en 12 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, servidores compatibles con endpoints, y cualquier runtime que soporte GGUF con imatrix. Para el modelo base en safetensors, transformers con aceleración por hardware.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto del modelo base, por lo que la comparación cuantitativa con alternativas no es posible. A continuación se comparan únicamente aspectos estructurales verificables:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Glimmer-30B-2026-Knowledge (esta ficha) | ~27,85B | no disponible | Apache 2.0 + MUSE Model License | GGUF (i1) |
| Modelo base Muse-Glimmer-30B-2026-Knowledge | ~27,85B | no disponible | Apache 2.0 + MUSE Model License | safetensors |
| Alternativas de ~30B densos | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables de la misma categoría con datos verificables de rendimiento.

## Limitaciones y advertencias

- Idioma: solo se declara inglés; el uso en castellano no está soportado oficialmente y probablemente degrade la calidad.
- Conocimiento acotado: el entrenamiento está orientado a noticias de 2026; puede tener lagunas o sesgos en eventos posteriores o anteriores, y riesgo de alucinación en temas no cubiertos por el dataset.
- Cuantizaciones de muy baja precisión: IQ1_S (6,6 GB), IQ1_M (7,2 GB) y Q2_K_S (10,1 GB) están marcadas por el autor como "for the desperate", "mostly desperate" o "very low quality"; no son aptas para producción.
- Licencia: la combinación Apache 2.0 + MUSE Model License requiere revisar el archivo MUSE_MODEL_LICENSE.md antes de uso comercial; no es una licencia permisiva única.
- Visión: los archivos mmproj no están en este repositorio, sino en el estático; es necesario descargarlos por separado para usar la funcionalidad multimodal.
- Sin datos de benchmarks, contexto ni arquitectura: no es posible garantizar el rendimiento en tareas específicas sin evaluación propia.
- Riesgo de sesgos: no se documentan en la model card; al entrenarse con noticias de 2026, puede heredar sesgos editoriales del corpus.
- Repositorio de gran tamaño (303,4 GB): requiere descargar solo los archivos necesarios; las descargas parciales de GGUF multiparte deben concatenarse correctamente.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/mradermacher/Glimmer-30B-2026-Knowledge-i1-GGUF
- Modelo base: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Dataset de entrenamiento: https://huggingface.co/datasets/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data
- Licencia MUSE: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge/blob/main/MUSE_MODEL_LICENSE.md
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Glimmer-30B-2026-Knowledge-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Glimmer-30B-2026-Knowledge-i1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
