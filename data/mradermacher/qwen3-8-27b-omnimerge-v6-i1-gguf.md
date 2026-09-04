# mradermacher/Qwen3.8-27B-Omnimerge-v6-i1-GGUF

## Resumen

Qwen3.8-27B-Omnimerge-v6 es un modelo de lenguaje de 27.320 millones de parámetros (27.3B) desarrollado por ManniX-ITA mediante la técnica de merge (mezcla) con mergekit, sobre la base de la serie Qwen3.8. Este repositorio concreto contiene la cuantización GGUF con imatrix (i1) realizada por mradermacher, optimizada para su ejecución en hardware de consumo mediante llama.cpp u Ollama. El modelo combina capacidades de razonamiento, generación de código y visión, lo que lo convierte en una opción versátil para tareas de asistencia técnica, análisis de documentos y programación. Su licencia Apache 2.0 permite uso comercial sin restricciones. La cuantización disponible en este repositorio incluye los formatos i1-Q2_K, i1-IQ3_M e i1-Q4_K_S, con tamaños de archivo entre 11.0 y 15.9 GB, lo que lo hace apto para GPUs de consumo con 16 GB de VRAM o superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, detalles no especificados en la informacion disponible) |
| Parametros totales | 27.320.697.856 (27.3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S, archivo imatrix (0.1 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo es un merge (mezcla) de multiples modelos de la serie Qwen3.8, creado mediante mergekit por ManniX-ITA. No se dispone de informacion detallada sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion (RLHF/DPO). La tecnica de merge utilizada combina pesos de varios modelos con el objetivo de conservar y potenciar capacidades de razonamiento, generacion de codigo y vision. El repositorio actual contiene una cuantizacion GGUF con imatrix (i1) realizada por mradermacher, que aplica una matriz de importancia para reducir la perdida de calidad durante la compresion de pesos. No se han documentado innovaciones tecnicas adicionales en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento multi-paso.
- Generacion de codigo (tag "code").
- Comprension de imagenes y vision (tag "vision").
- Conversacion multi-turno (tag "conversational").
- Compatible con endpoints (endpoints_compatible).
- Soporte de tool calling: no disponible en la informacion.
- Soporte de agentes: no disponible.
- Capacidades multilingues: limitado a ingles segun la model card.

## Casos de uso

- Asistente de programacion: el modelo puede generar y explicar codigo en multiples lenguajes, integrandose en entornos de desarrollo como copiloto.
- Analisis de documentos con vision: al ser un modelo de vision, puede interpretar capturas de pantalla, diagramas o documentos escaneados para extraer informacion o generar resumenes.
- Chatbot tecnico de soporte: su capacidad de razonamiento y conversacion multi-turno permite gestionar consultas tecnicas complejas.
- Generacion de documentacion: puede transformar codigo o capturas de pantalla en documentacion tecnica legible.
- Automatizacion de tareas de back-office: uso en pipelines de procesamiento de documentos que requieran comprension visual y textual.
- Investigacion y experimentacion local: gracias a la cuantizacion GGUF, puede ejecutarse en GPUs de consumo para prototipado y pruebas sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 11.0 GB (i1-Q2_K), 12.9 GB (i1-IQ3_M), 15.9 GB (i1-Q4_K_S), mas overhead de contexto. Para uso practico, se recomienda al menos 16 GB de VRAM para la cuantizacion Q4_K_S.
- GPU recomendadas: RTX 4080/4090 (16-24 GB), A100 40GB, H100. Las GPUs de 16 GB pueden ejecutar el Q4_K_S con ventanas de contexto moderadas.
- Compatible con consumer GPUs: si, especialmente con la cuantizacion Q2_K (11 GB) en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio. Tambien se puede servir como endpoint compatible con la API de OpenAI (segun el tag endpoints_compatible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

En la informacion disponible no se proporcionan datos de benchmarks ni especificaciones de modelos comparables. Existe un modelo similar en el repositorio de mradermacher, Qwen3.8-27B-3MPER0RR-obliterated-i1-GGUF, pero no se dispone de datos suficientes para establecer una comparacion rigurosa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos: no se han documentado, pero al ser un modelo merge, puede heredar sesgos de los modelos base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se dispone de evaluaciones de seguridad.
- Limitaciones de idioma: la model card indica solo ingles, lo que limita su uso en aplicaciones multilingues.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero exige mantener el aviso de copyright y licencia en las redistribuciones.
- Dependencia del repositorio estatico: los archivos mmproj para vision estan en el repositorio estatico (Qwen3.8-27B-Omnimerge-v6-GGUF), no en este repo; hay que descargarlos por separado.
- La cuantizacion puede degradar la calidad del modelo, especialmente en los formatos de menor precision (Q2_K).
- No hay informacion sobre el proceso de entrenamiento ni la composicion del dataset, lo que dificulta la evaluacion de su comportamiento en produccion.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Omnimerge-v6-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Omnimerge-v6-GGUF
- Modelo base: https://huggingface.co/ManniX-ITA/Qwen3.8-27B-Omnimerge-v6
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Modelo similar: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-obliterated-i1-GGUF
- FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
