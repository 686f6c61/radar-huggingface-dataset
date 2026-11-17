# mradermacher/VideoRFT-GGUF

## Resumen

VideoRFT es un modelo multimodal de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) desarrollado originalmente por QiWang98 y publicado bajo licencia Apache 2.0. El modelo combina procesamiento de lenguaje natural con capacidades de visión y vídeo, tal como indica la presencia de ficheros `mmproj` (proyección multimodal) en la distribución GGUF. Está entrenado sobre el dataset VideoRFT-Data del mismo autor y su idioma principal es el inglés.

La versión aquí descrita es la cuantización GGUF realizada por mradermacher, un conocido publicador de cuantizaciones de la comunidad, que facilita la ejecución del modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio incluye 13 cuantizaciones distintas, desde Q2_K (3,1 GB) hasta f16 (15,3 GB), además de dos ficheros de proyección multimodal (mmproj) en Q8_0 y f16.

El modelo es relevante porque permite desplegar un sistema multimodal de visión y vídeo de 7,6B parámetros en GPUs de consumo, algo poco habitual en la categoría de modelos video-lenguaje. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y la disponibilidad de cuantizaciones estáticas cubre un amplio rango de presupuestos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con proyección de visión/vídeo; detalles del transformer no especificados) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base QiWang98/VideoRFT) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del transformer base ni la composición exacta del dataset de entrenamiento. Lo que sí se puede afirmar es que se trata de un modelo multimodal: la presencia de ficheros `mmproj` (multi-modal projection) en la distribución GGUF indica que el modelo incorpora un proyector que mapea representaciones visuales (imágenes y/o vídeo) al espacio de embeddings del modelo de lenguaje. El nombre "VideoRFT" y el dataset asociado "VideoRFT-Data" sugieren un entrenamiento orientado a tareas de razonamiento sobre vídeo (posiblemente *reinforcement fine-tuning* sobre datos de vídeo, aunque esto no se confirma en la información proporcionada).

El modelo base fue entrenado por QiWang98 y posteriormente cuantizado por mradermacher mediante el pipeline estándar de llama.cpp (convert_type: hf, quantize_version 2). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Procesamiento multimodal de imagen y vídeo: la presencia de ficheros `mmproj` confirma soporte para entrada visual combinada con texto.
- Generación de texto conversacional: la etiqueta `conversational` en los metadatos indica que el modelo está ajustado para diálogo multi-turno.
- Razonamiento sobre contenido visual: el nombre y el dataset asociado apuntan a tareas de razonamiento sobre vídeo (comprensión temporal, descripción de eventos, respuesta a preguntas sobre vídeo).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia estándar compatibles con la API de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- **Análisis automático de vídeo para moderación de contenido**: el modelo puede procesar fotogramas o secuencias de vídeo y generar descripciones textuales que alimenten un clasificador de contenido inapropiado. Su tamaño de 7,6B permite ejecutarlo en una GPU de 24 GB con cuantización Q4_K_M (4,8 GB) más el proyector multimodal (1,0-1,5 GB).
- **Generación de subtítulos y descripciones para accesibilidad**: integrado en un pipeline de post-procesado de vídeo, el modelo puede producir descripciones de escenas y eventos temporales para subtitulado descriptivo, aprovechando su entrenamiento específico sobre datos de vídeo.
- **Respuesta a preguntas sobre vídeo (VideoQA) en entornos con recursos limitados**: con la cuantización Q4_K_M, el modelo cabe en GPUs de consumo como la RTX 4090 (24 GB), permitiendo desplegar un sistema de VideoQA sin depender de infraestructura cloud.
- **Extracción de información estructurada de grabaciones**: en sectores como seguridad o investigación, el modelo puede resumir eventos de grabaciones y generar informes textuales, usando el contexto multimodal para identificar objetos, acciones y secuencias temporales.
- **Prototipado rápido de aplicaciones video-lenguaje**: gracias a la licencia Apache 2.0 y la disponibilidad de cuantizaciones desde 3,1 GB, equipos pequeños pueden validar ideas de producto basadas en comprensión de vídeo sin coste de licencia ni infraestructura dedicada.
- **Indexación semántica de archivos de vídeo**: el modelo puede generar descripciones textuales de clips que se almacenen en un motor de búsqueda vectorial, habilitando búsqueda semántica sobre bibliotecas de vídeo.
- **Asistencia en tareas de anotación de datasets de vídeo**: el modelo puede pre-anotar clips con descripciones y etiquetas que luego revisen anotadores humanos, acelerando la creación de datasets de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - Q2_K (3,1 GB) + mmproj Q8_0 (1,0 GB): ~4,1 GB, viable en GPUs de 6-8 GB.
  - Q4_K_M (4,8 GB) + mmproj Q8_0 (1,0 GB): ~5,8 GB, viable en GPUs de 8 GB.
  - Q5_K_M (5,5 GB) + mmproj f16 (1,5 GB): ~7,0 GB, viable en GPUs de 8-12 GB.
  - Q8_0 (8,2 GB) + mmproj f16 (1,5 GB): ~9,7 GB, requiere GPU de 12 GB o superior.
  - f16 (15,3 GB) + mmproj f16 (1,5 GB): ~16,8 GB, requiere GPU de 24 GB.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4070 Ti 12 GB, RTX 4090 24 GB, A100 40/80 GB, H100 80 GB. Para cuantizaciones Q4 y superiores, una RTX 4090 es suficiente; para f16 se recomienda A100 o superior.
- **¿Cabe en GPU de consumo?**: sí, en todas las cuantizaciones hasta Q8_0 con una GPU de 12 GB o más. La f16 requiere 24 GB (RTX 4090 o superior).
- **Opciones de despliegue**: llama.cpp (soporte nativo de GGUF y mmproj), Ollama (si se importa el GGUF), LM Studio, y servidores compatibles con llama.cpp. No se documenta soporte para vLLM o TGI en la información disponible (estos suelen requerir safetensors, disponibles en el modelo base QiWang98/VideoRFT).
- **Latencia y throughput estimados**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| VideoRFT (este) | 7,6B | no disponible | Sí (vídeo/imagen) | Apache 2.0 | Sí (13 cuantizaciones) |
| Qwen2.5-VL-7B | 7,6B | 128K (según documentación pública) | Sí (imagen/vídeo) | Apache 2.0 | Sí (comunidad) |
| LLaVA-OneVision-7B | 7,6B | 32K (según documentación pública) | Sí (imagen/vídeo) | Apache 2.0 | Parcial |
| InternVL2-8B | 8,1B | 8K (según documentación pública) | Sí (imagen/vídeo) | MIT | Parcial |

Nota: los datos de contexto y licencia de los modelos comparativos provienen de documentación pública general; no se dispone de benchmarks comparativos directos con VideoRFT en la información proporcionada.

## Limitaciones y advertencias

- **Idioma**: el modelo solo declara soporte de inglés (`language: en`); su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- **Contexto desconocido**: no se especifica la longitud de contexto, lo que impide garantizar el manejo de secuencias largas de vídeo o conversaciones extensas.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir descripciones de eventos visuales que no ocurren en el vídeo, especialmente con cuantizaciones agresivas (Q2_K, Q3_K_S).
- **Cuantizaciones de baja calidad**: las versiones Q2_K y Q3_K_S degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior, y preferiblemente Q5_K_M o Q6_K.
- **Sin cuantizaciones imatrix**: el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles, lo que limita la calidad máxima alcanzable en tamaños reducidos.
- **Documentación escasa**: no se detallan sesgos conocidos, composición del dataset de entrenamiento ni evaluaciones de seguridad; esto dificulta la evaluación de riesgos para producción.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario debe verificar el cumplimiento de las licencias de los datos de entrenamiento subyacentes (no documentadas).
- **Soporte de herramientas**: no se confirma soporte de tool calling ni de agentes, lo que limita su integración en pipelines automatizados complejos.
- **Fecha de actualización**: el repositorio fue actualizado en noviembre de 2026, pero la información sobre mantenimiento activo del modelo base no está disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VideoRFT-GGUF
- Modelo base: https://huggingface.co/QiWang98/VideoRFT
- Dataset de entrenamiento: https://huggingface.co/datasets/QiWang98/VideoRFT-Data
- Página de descargas del cuantizador: https://hf.tst.eu/model#VideoRFT-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
