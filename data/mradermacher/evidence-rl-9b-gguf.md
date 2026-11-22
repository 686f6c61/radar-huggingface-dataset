# mradermacher/Evidence-RL-9B-GGUF

## Resumen

Evidence-RL-9B es un modelo de lenguaje y visión (VLM) de 8.950 millones de parámetros desarrollado por hhj-ai y publicado bajo licencia Apache 2.0. El modelo se construye sobre un transformer causal multimodal y se especializa en el razonamiento visual basado en evidencia: grounding visual, percepción de grano fino, conteo de objetos, razonamiento espacial y detección de alucinaciones mediante contraste contrafactual. Su post-entrenamiento se basa en aprendizaje por refuerzo (GRPO), lo que lo orienta a producir respuestas ancladas a regiones concretas de la imagen en lugar de descripciones genéricas.

La versión aquí descrita es la cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio incluye tanto los pesos cuantizados del modelo de lenguaje (de Q2_K a f16) como los proyectores multimodales en Q8_0 y f16, necesarios para procesar imágenes.

Su relevancia actual radica en que aborda uno de los problemas más persistentes de los VLM: la alucinación visual y la falta de localización precisa. Al estar entrenado con señales de refuerzo centradas en la evidencia visual, resulta adecuado para tareas donde no basta con describir una imagen, sino que hay que justificar qué región concreta sustenta cada afirmación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (vision-language model); detalles internos de la arquitectura no disponibles |
| Parametros totales | 8.953.803.264 (8,95 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyectores multimodales mmproj-Q8_0 y mmproj-f16. Existen cuantizaciones ponderadas/imatrix en el repo i1-GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base hhj-ai/Evidence-RL-9B) |

## Arquitectura y entrenamiento

El modelo es un VLM construido sobre un transformer causal con un proyector multimodal que inyecta características visuales en el flujo de tokens de texto. El post-entrenamiento emplea aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), una técnica que optimiza la política del modelo comparando grupos de respuestas generadas frente a una recompensa. Según las etiquetas del autor, esa recompensa está orientada a evidencia visual, grounding, razonamiento contrafactual y reducción de alucinaciones, además de percepción de grano fino, conteo y razonamiento espacial.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases SFT/DPO previas ni innovaciones de decodificación (por ejemplo, decodificación especulativa o atención lineal). El modelo base es hhj-ai/Evidence-RL-9B, y esta ficha corresponde únicamente a su conversión a GGUF.

## Capacidades

- Generación de texto conversacional multimodal: responde a preguntas sobre imágenes en formato de diálogo multi-turno.
- Grounding visual: localiza objetos y regiones concretas de la imagen (object-region) como soporte de sus afirmaciones.
- Razonamiento basado en evidencia visual: justifica respuestas citando la evidencia observable en la imagen.
- Razonamiento contrafactual: evalúa escenarios hipotéticos sobre el contenido visual para detectar inconsistencias.
- Mitigación de alucinaciones: entrenamiento explícito para reducir afirmaciones no sustentadas por la imagen.
- Percepción de grano fino: distinción de detalles pequeños, atributos y relaciones entre objetos.
- Conteo de objetos y razonamiento espacial: tareas de counting y relaciones espaciales entre elementos.
- Razonamiento multimodal multi-paso: cadenas de inferencia que combinan varias observaciones visuales.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Verificación de inventario y control de calidad visual: el modelo puede contar y localizar objetos en imágenes de estanterías o líneas de producción, señalando la región concreta que sustenta cada recuento, lo que facilita la auditoría humana del resultado.
- Moderación y verificación de contenido gráfico: dado su entrenamiento contra alucinaciones y su capacidad de razonamiento contrafactual, puede evaluar si una descripción textual coincide con lo que realmente muestra una imagen, útil en flujos de verificación de noticias o publicaciones.
- Asistencia a personas con discapacidad visual: descripciones ancladas a regiones concretas de la imagen y respuestas a preguntas de seguimiento sobre posición, cantidad y atributos de objetos.
- Análisis de imágenes técnicas y documentación: interpretación de diagramas, capturas de pantalla o figuras donde es necesario referirse a elementos específicos y no a una descripción global.
- Automatización de anotación de datasets visuales: generación de descripciones con bounding regions implícitas para preetiquetar datos de entrenamiento, con revisión humana posterior gracias a la localización de la evidencia.
- Despliegue en local y en el borde: las cuantizaciones Q4_K_M (5,7 GB) y Q5_K_M (6,6 GB) permiten ejecutar el modelo en GPUs de consumo para prototipos de análisis de imágenes sin enviar datos a la nube.
- Investigación en robustez multimodal: evaluación de la resistencia a alucinaciones y del grounding en pipelines de investigación, al ser un modelo abierto con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto ni del proyector): Q2_K ~3,9 GB; Q3_K_M ~4,7 GB; IQ4_XS ~5,3 GB; Q4_K_M ~5,7 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB. Añadir entre 0,7 GB (mmproj-Q8_0) y 1,0 GB (mmproj-f16) para el procesamiento de imágenes, más la memoria de la caché KV.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K, Q8_0 o f16 con margen; RTX 4080/4070 Ti Super (16 GB) para Q5_K_M o Q6_K; RTX 4060 Ti 16 GB para Q4_K_M con contexto amplio; A100/H100 para despliegues concurrentes o f16 con lotes grandes.
- Cabe en GPU de consumo: sí. Las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 8-12 GB junto con el proyector; las de Q8_0 requieren al menos 12-16 GB.
- Opciones de despliegue: llama.cpp y servidores compatibles con GGUF (Ollama, LM Studio, llama-cpp-python); los pesos safetensors del modelo base pueden servirse con vLLM o TGI si el soporte multimodal de la arquitectura está implementado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Evidence-RL-9B (esta ficha, GGUF) | 8,95 B | No disponible | Apache 2.0 | GGUF, safetensors | Especializado en grounding y anti-alucinación vía GRPO; solo inglés |
| Qwen2.5-VL-7B | 7 B (aprox.) | No disponible en esta ficha | Apache 2.0 | safetensors, GGUF | VLM generalista con soporte multilingüe y amplia adopción; comparación de rendimiento no disponible |
| InternVL2-8B | 8 B (aprox.) | No disponible en esta ficha | MIT (según versión) | safetensors, GGUF | VLM generalista con fuerte rendimiento en benchmarks públicos; comparación directa no disponible |
| LLaVA-OneVision-7B | 7 B (aprox.) | No disponible en esta ficha | Apache 2.0 | safetensors, GGUF | VLM orientado a tareas múltiples de imagen y vídeo; comparación directa no disponible |

No se dispone de datos de benchmarks del modelo que permitan una comparación cuantitativa con estas alternativas; la tabla refleja únicamente características estructurales y de licencia.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés; su rendimiento en castellano no está documentado y no debería asumirse.
- Contexto: la longitud de contexto no está publicada, lo que impide planificar tareas con documentos o secuencias de imágenes largas.
- Alucinación: aunque el entrenamiento está orientado a reducirla, sigue siendo un riesgo inherente a los VLM; se recomienda validación humana en dominios críticos.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo puede heredar sesgos de sus datos de entrenamiento, no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base hhj-ai/Evidence-RL-9B y de los componentes visuales subyacentes.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S pueden degradar el grounding fino y el conteo; para tareas de percepción se recomienda Q5_K_M o superior.
- Proyector multimodal obligatorio: sin el archivo mmproj correspondiente el modelo no procesa imágenes; hay que descargarlo junto con los pesos.
- Metadatos incompletos: no hay información pública sobre arquitectura interna, datos de entrenamiento ni benchmarks, lo que limita la evaluación previa a producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Evidence-RL-9B-GGUF
- Modelo base: https://huggingface.co/hhj-ai/Evidence-RL-9B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Evidence-RL-9B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Evidence-RL-9B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
