# mradermacher/InternVL3_5-30B-A3B-GGUF

## Resumen

InternVL3_5-30B-A3B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal InternVL3.5-30B-A3B desarrollado por OpenGVLab (Shanghai AI Laboratory). El repositorio lo publica mradermacher, un conocido empaquetador de cuantizaciones GGUF, y permite ejecutar el modelo en entornos de inferencia local compatibles con llama.cpp y derivados, algo que no es posible con los pesos originales en safetensors sin infraestructura específica.

El modelo base es un transformer multimodal de 30.532.122.624 parámetros totales (aproximadamente 30,5 mil millones), con una arquitectura tipo mixture-of-experts (MoE) identificada por el sufijo "A3B", que indica alrededor de 3 mil millones de parámetros activos por token. Combina un codificador visual con un backbone de lenguaje para tareas de visión-lenguaje, incluyendo descripción de imágenes, VQA, OCR y razonamiento visual.

La relevancia de esta ficha radica en que la versión GGUF hace accesible un modelo multimodal de gama alta en hardware de consumo, con múltiples niveles de cuantización desde Q2_K (11,4 GB) hasta Q8_0 (32,6 GB), más los ficheros mmproj necesarios para el procesamiento de imágenes. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mixture-of-experts (MoE); codificador visual + backbone de lenguaje |
| Parametros totales | 30.532.122.624 |
| Parametros activos | Aproximadamente 3 mil millones (segun sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | Multilingue (sin listado detallado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (mas ficheros mmproj para vision) |

## Arquitectura y entrenamiento

El modelo base InternVL3.5-30B-A3B sigue la familia InternVL de OpenGVLab, que combina un codificador visual (típicamente basado en ViT) con un modelo de lenguaje de gran escala mediante proyección de embeddings visuales al espacio del lenguaje. La variante 30B-A3B emplea una arquitectura mixture-of-experts con aproximadamente 3 mil millones de parámetros activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso de 30B.

Los datos de entrenamiento incluyen los datasets OpenGVLab/MMPR-v1.2 y OpenGVLab/MMPR-Tiny, orientados a razonamiento multimodal. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, de la composición detallada del dataset ni de si se aplicaron fases de RLHF o DPO. La cuantización de mradermacher es estática (quantize_version 2, output_tensor_quantised 1) y no incluye quants imatrix en este repositorio; estos están disponibles en el repositorio i1-GGUF del mismo autor.

## Capacidades

- Comprensión de imágenes: descripción, respuesta a preguntas visuales (VQA) y razonamiento sobre contenido visual.
- OCR y comprensión de documentos: lectura de texto en imágenes y extracción de información estructurada.
- Generación de texto multilingüe en conversaciones multi-turno.
- Razonamiento multimodal: combinación de contexto textual e imágenes en una misma consulta.
- Formato conversacional (tag `conversational`), apto para diálogos.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con servidores de inferencia tipo OpenAI API.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos escaneados: el modelo puede procesar imágenes de facturas, contratos o formularios y extraer campos clave mediante OCR y razonamiento visual, usando el fichero mmproj junto con un quant de Q4_K_M o superior para equilibrar calidad y memoria.
- Asistencia a personas con discapacidad visual: descripción de imágenes en tiempo real en un dispositivo local con GPU de consumo, gracias a la cuantización Q4_K_S (17,6 GB) que cabe en GPUs de 24 GB.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios en plataformas, ejecutada en servidores con llama.cpp o vLLM-compatible.
- Automatización de soporte técnico con capturas de pantalla: el modelo interpreta capturas de errores enviadas por clientes y genera respuestas multi-turno con contexto visual.
- Generación de descripciones para catálogos de producto: procesamiento por lotes de imágenes de producto para generar fichas descriptivas multilingües.
- Investigación en visión-lenguaje: experimentación con un MoE multimodal de 30B en entornos académicos con GPUs únicas, usando quants Q3_K_M o IQ4_XS para reducir requisitos de VRAM.
- Prototipado de agentes multimodales: integración en pipelines que alternan texto e imágenes, aprovechando el formato conversacional y la compatibilidad con endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11,4 GB (Q2_K) y 32,6 GB (Q8_0); los quants recomendados Q4_K_S (17,6 GB) y Q4_K_M (18,7 GB) requieren aproximadamente 18-20 GB de VRAM incluyendo overhead de contexto.
- Ficheros mmproj adicionales: 0,4 GB (Q8_0) o 0,7 GB (f16) para el procesamiento de imágenes.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; RTX 3090 (24 GB) para Q4_K_S.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con quants Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q3_K_M o IQ4_XS; en GPUs de 12 GB con Q2_K (calidad reducida).
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con endpoints (tag `endpoints_compatible`); vLLM y TGI no están confirmados para este formato GGUF en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| InternVL3.5-30B-A3B (este, GGUF) | 30,5B totales / ~3B activos | no disponible | Apache 2.0 | GGUF | Multimodal, MoE |
| OpenGVLab/InternVL3_5-30B-A3B (original) | 30,5B totales / ~3B activos | no disponible | Apache 2.0 | safetensors | Requiere transformers + custom_code |
| Alternativas multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Riesgo de alucinacion: inherente a modelos generativos multimodales; las descripciones de imágenes y el OCR pueden contener errores, especialmente con quants de baja calidad (Q2_K, Q3_K_S).
- Sesgos conocidos: no se detallan en la información proporcionada; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada y el listado exacto de idiomas soportados no está disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original y de los datasets MMPR.
- Caveats para producción: los quants estáticos (no imatrix) pueden degradar más la calidad que los imatrix; para producción se recomienda usar los quants i1-GGUF del mismo autor o Q5_K_M/Q6_K. La compatibilidad con vLLM/TGI no está confirmada.
- El tag `custom_code` indica que el modelo base requiere código personalizado en transformers; en GGUF esto se gestiona mediante llama.cpp, pero puede haber discrepancias de tokenización o preprocesado visual.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/InternVL3_5-30B-A3B-GGUF
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-30B-A3B
- Quants imatrix: https://huggingface.co/mradermacher/InternVL3_5-30B-A3B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#InternVL3_5-30B-A3B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Dataset MMPR-v1.2: https://huggingface.co/datasets/OpenGVLab/MMPR-v1.2
- Dataset MMPR-Tiny: https://huggingface.co/datasets/OpenGVLab/MMPR-Tiny
