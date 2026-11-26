# mradermacher/Thomson-1.0-Small-GGUF

## Resumen

Thomson-1.0-Small es un modelo de lenguaje desarrollado por Thomson Reuters, distribuido originalmente bajo el identificador `thomsonreuters/Thomson-1.0-Small`. Esta ficha describe la versión cuantizada en formato GGUF publicada por mradermacher, que facilita su ejecución en entornos con llama.cpp y herramientas compatibles. El modelo cuenta con 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones) según los pesos en safetensors del repositorio, y está orientado a tareas conversacionales en inglés.

La relevancia de esta publicación radica en que permite desplegar un modelo de gran tamano en hardware de consumo mediante cuantizaciones que van desde Q2_K (13 GB) hasta Q8_0 (37 GB), además de incluir un suplemento multimodal (`mmproj`) que sugiere capacidades de visión. El repositorio incluye también cuantizaciones con imatrix en un repositorio separado, orientadas a preservar mejor la calidad en niveles de compresión agresivos.

La información pública disponible sobre el modelo base es limitada: la model card del repositorio cuantizado no detalla arquitectura, datos de entrenamiento ni resultados de benchmarks. Los datos que se presentan a continuación provienen exclusivamente de los metadatos del repositorio y de la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 34.660.610.688 (34,7 B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; cuantizaciones imatrix en repositorio separado |
| Idiomas soportados | en (inglés) |
| Licencia | polyform-strict-1-0-0 (Polyform Strict 1.0.0) |
| Formato de pesos | GGUF (repositorio cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base en la documentación disponible. El repositorio cuantizado no incluye detalles sobre el tipo de transformer, el número de capas, la dimensionalidad de los embeddings ni si emplea mecanismos como atención lineal o mezcla de expertos. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La presencia de archivos `mmproj` (multi-modal supplement) en el repositorio GGUF indica que el modelo base incorpora algún componente multimodal, presumiblemente para procesamiento de imágenes, aunque no se detalla su naturaleza ni el codificador visual empleado. El proceso de cuantización aplicado por mradermacher es estático (quantize_version 2, output_tensor_quantised), con variantes estándar y variantes con imatrix para mejorar la fidelidad en compresiones bajas.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Procesamiento multimodal: la inclusión de archivos `mmproj` sugiere soporte de entrada de imágenes, aunque no se documenta el alcance exacto.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según el campo `language: en`.
- No se documentan modos especiales como thinking mode, audio o decodificación especulativa.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (21,3 GB) el modelo puede ejecutarse en GPUs con 24 GB de VRAM, lo que permite experimentar con un modelo de 34,7 B en hardware de gama alta de consumo.
- Prototipado de asistentes conversacionales en inglés: la etiqueta `conversational` y el formato GGUF permiten integrarlo rápidamente en aplicaciones de chat mediante llama.cpp u Ollama.
- Investigación sobre cuantización: la disponibilidad de 11 niveles de cuantización más variantes imatrix permite estudiar la degradación de calidad frente al tamano del archivo.
- Evaluación de modelos multimodales en local: los archivos `mmproj` permiten probar entradas de imagen en entornos sin acceso a la nube.
- Servicio de inferencia con vLLM o TGI: el modelo base en safetensors puede desplegarse en servidores con GPUs A100 o H100 para cargas concurrentes.
- Análisis de documentos en inglés: aunque no se documenta la ventana de contexto, el tamano del modelo sugiere capacidad para tareas de resumen y extracción en textos de extensión media, sujeto a validación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~13 GB; Q3_K_S ~15,3 GB; Q3_K_M ~16,9 GB; Q3_K_L ~18,2 GB; IQ4_XS ~19 GB; Q4_K_S ~20 GB; Q4_K_M ~21,3 GB; Q5_K_S ~24,1 GB; Q5_K_M ~24,8 GB; Q6_K ~28,6 GB; Q8_0 ~37 GB.
- El suplemento multimodal anade 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16) adicionales.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q8_0 se requiere una A100 40 GB, H100 o dos GPUs de 24 GB.
- Cabe en GPU de consumo: sí, en modelos con 24 GB de VRAM usando cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo caben Q2_K y Q3_K_S con riesgo de desbordamiento por contexto y caché KV.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI (no confirmado explícitamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Thomson-1.0-Small (esta ficha) | 34,7 B | no disponible | Polyform Strict 1.0.0 | GGUF, safetensors | Multimodal según mmproj |
| Alternativas de ~30-35 B | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificada de modelos comparables en la documentación proporcionada |

No se dispone de datos suficientes para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia Polyform Strict 1.0.0 es restrictiva: no permite uso comercial sin acuerdo con el titular, por lo que debe revisarse antes de cualquier despliegue en producción.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- No se documenta la longitud de contexto, lo que impide planificar cargas con ventanas largas sin validación empírica.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La model card del repositorio cuantizado no sustituye a la del modelo base; se recomienda consultar `thomsonreuters/Thomson-1.0-Small` para información autoritativa.
- El repositorio tiene 238,6 GB, por lo que la descarga completa requiere planificación de almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Thomson-1.0-Small-GGUF
- Modelo base: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Thomson-1.0-Small-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Thomson-1.0-Small-GGUF
- Licencia Polyform Strict 1.0.0: https://polyformproject.org/licenses/strict/1.0.0
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
