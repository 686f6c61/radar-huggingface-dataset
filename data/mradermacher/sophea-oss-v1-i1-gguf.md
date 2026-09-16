# mradermacher/Sophea-OSS-v1-i1-GGUF

## Resumen

Sophea-OSS-v1-i1-GGUF es la versión cuantizada en formato GGUF del modelo ayoubkirouane/Sophea-OSS-v1, publicada por mradermacher (nethype GmbH). Se trata de una adaptación orientada al griego y al inglés, construida sobre una arquitectura MoE con formato de plantilla harmony y linaje gpt-oss, según los tags declarados en el repositorio. El modelo original cuenta con 20.914.757.184 parámetros totales y está licenciado bajo Apache 2.0.

El problema que resuelve esta publicación concreta no es el entrenamiento del modelo, sino su explotación práctica: los pesos originales en safetensors se convierten a GGUF con cuantizaciones imatrix (i1) que permiten ejecutar el modelo en hardware de gama de consumo y en entornos de CPU/GPU mixtos mediante llama.cpp, Ollama o LM Studio. Los archivos publicados ocupan entre 12,2 GB y 15,9 GB, frente a los 126,1 GB del repositorio completo.

Es relevante ahora porque los modelos de razonamiento con modo thinking y soporte multilingüe suelen distribuirse primero en safetensors, lo que limita su adopción fuera de clústeres con GPU de gran memoria. La disponibilidad de cuantizaciones IQ2/IQ3/IQ4 con imatrix reduce la barrera de entrada, aunque a costa de pérdida de calidad en los niveles más agresivos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE basada en gpt-oss (según tags: moe, gpt-oss, harmony); detalles completos no disponibles |
| Parámetros totales | 20.914.757.184 (≈20,9 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S, i1-Q4_K_M (formato GGUF; además se distribuye un archivo imatrix de 0,1 GB) |
| Idiomas soportados | griego (el), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors vía transformers |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento en la documentación proporcionada. Los tags del repositorio indican que se trata de un modelo MoE (mixture of experts) con linaje gpt-oss y formato de conversación harmony, con capacidades de reasoning y thinking, y una etiqueta «language-matched» que sugiere que el idioma del razonamiento se alinea con el idioma de la respuesta. También aparece la referencia arxiv:2608.17744 como tag, pero no se ha verificado su contenido.

El trabajo realizado por mradermacher se limita a la cuantización: según los metadatos internos del README, se ha usado quantize_version 2, output_tensor_quantised 1, convert_type hf y cuantización con imatrix. Esto implica que el proceso parte de los pesos HF del modelo base, calcula una matriz de importancia (imatrix) a partir de datos de calibración y genera las variantes IQ y K. No hay indicios de fine-tuning, RLHF o DPO adicionales en esta publicación.

## Capacidades

- Generación de texto conversacional en griego y en inglés.
- Razonamiento con modo thinking explícito (tags: reasoning, thinking).
- Alineación de idioma entre el razonamiento interno y la respuesta final (tag: language-matched).
- Arquitectura MoE, lo que implica activación de un subconjunto de expertos por token (parámetros activos no disponibles).
- Compatibilidad con endpoints (tag: endpoints_compatible) y plantilla de chat harmony.
- Formato GGUF apto para inferencia con llama.cpp y derivados.
- Capacidades adicionales (tool calling, agentes, visión, audio, matemáticas, código): no disponibles en la información proporcionada.

## Casos de uso

- Asistencia conversacional en griego: el modelo está explícitamente orientado a griego e inglés, por lo que es adecuado para atención al cliente o asistentes en ese idioma, en los que la mayoría de modelos abiertos ofrecen cobertura débil.
- Razonamiento multi-paso con trazas visibles: la etiqueta thinking permite separar la cadena de razonamiento de la respuesta final, útil en entornos educativos o de auditoría donde se quiere revisar el proceso, no solo el resultado.
- Despliegue en hardware de consumo: con cuantizaciones de 12,2-15,9 GB puede ejecutarse en una GPU de 16-24 GB o en CPU con RAM suficiente, lo que habilita prototipos locales sin clúster.
- Investigación sobre cuantización: la disponibilidad de múltiples niveles IQ2/IQ3/IQ4 sobre el mismo modelo permite medir la degradación de calidad por nivel de compresión en tareas de razonamiento en griego.
- Generación de contenido en griego: redacción de textos, traducción asistida griego-inglés y resumen de documentos, aprovechando la cobertura bilingüe declarada.
- Pipelines de inferencia integrados: al ser GGUF, se integra con llama.cpp/Ollama para servicios internos con endpoints compatibles con OpenAI, sin necesidad de infraestructura con GPUs de datacenter.
- Experimentación con arquitecturas MoE: sirve como banco de pruebas para estudiar consumo de memoria y comportamiento de enrutamiento de expertos en un modelo de ≈20,9 B totales.
- Evaluación comparativa de recetas de cuantización: el repositorio incluye tanto cuantizaciones dinámicas (i1, con imatrix) como una variante estática en mradermacher/Sophea-OSS-v1-GGUF, lo que permite comparar metodologías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, GSM8K, HumanEval ni métricas equivalentes, y los resultados de la búsqueda web no contienen datos del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13-17 GB para las cuantizaciones i1-Q4_K_S (14,8 GB) e i1-Q4_K_M (15,9 GB), incluyendo overhead de contexto y caché KV. Las variantes IQ2/IQ3 de 12,2-13,0 GB requieren del orden de 12-14 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100. Con 16 GB (RTX 4080, A4000 16 GB) caben las cuantizaciones bajas y Q4 con contexto reducido.
- Cabe en GPU de consumo: sí. En 24 GB (4090/3090) con holgura para Q4_K_M y contexto amplio; en 16 GB con cuantizaciones IQ2/IQ3 o Q4 y contexto limitado.
- Despliegue en CPU/RAM: viable con llama.cpp u Ollama; se recomienda un mínimo de 16 GB de RAM para las cuantizaciones de 12-13 GB y 24-32 GB para las de 15-16 GB con contexto extendido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF. No se indica compatibilidad con vLLM o TGI en el repositorio (vLLM y TGI trabajan habitualmente con safetensors).
- Latencia y throughput estimados: no disponibles. Al ser un MoE, la velocidad de decodificación depende del número de parámetros activos, dato no proporcionado.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sophea-OSS-v1-i1-GGUF (este) | 20,9 B | no disponible | GGUF cuantizado | apache-2.0 | HuggingFace (mradermacher) |
| Sophea-OSS-v1 (modelo base) | 20,9 B (según el cuantizado) | no disponible | safetensors (transformers) | apache-2.0 | HuggingFace (ayoubkirouane) |
| Sophea-OSS-v1-GGUF (quants estáticos) | 20,9 B | no disponible | GGUF | apache-2.0 | HuggingFace (mradermacher) |

No se dispone de datos de rendimiento ni de contexto para comparar con alternativas de la misma categoría (por ejemplo, otros modelos MoE de ≈20 B orientados a griego). La comparación se limita, por tanto, a las variantes de distribución del mismo modelo.

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad; las variantes IQ2_M, IQ3_XXS y Q2_K, con 12,2 GB, son las más agresivas y la propia model card advierte de calidad inferior en IQ3_XXS («lower quality»).
- El autor de la cuantización no es el autor del modelo: los sesgos, el comportamiento y los fallos de razonamiento provienen del modelo base ayoubkirouane/Sophea-OSS-v1 y no se han validado en esta publicación.
- Riesgo de alucinación: no disponible en la información proporcionada, pero es un riesgo inherente a los modelos generativos y a las cuantizaciones de baja precisión.
- Cobertura de idiomas limitada a griego e inglés; no hay evidencia de soporte fiable en castellano ni en otros idiomas.
- Longitud de contexto no documentada: planificar despliegues con contexto largo requiere verificar el valor real en el modelo base antes de dimensionar la caché KV.
- Licencia apache-2.0, que permite uso comercial, pero conviene revisar los términos del modelo base y de los datos de entrenamiento originales, no detallados aquí.
- El repositorio ocupa 126,1 GB: descargar solo los archivos GGUF necesarios, no el repositorio completo.
- No se indica soporte verificado de tool calling, agentes ni visión; no asumir estas capacidades sin probarlas.
- Las fechas de creación y actualización del repositorio (2026) son posteriores a la fecha habitual de publicación; conviene verificar la vigencia de los enlaces y del modelo base.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Sophea-OSS-v1-i1-GGUF
- Modelo base: https://huggingface.co/ayoubkirouane/Sophea-OSS-v1
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Sophea-OSS-v1-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Sophea-OSS-v1-i1-GGUF
- Archivo imatrix: https://huggingface.co/mradermacher/Sophea-OSS-v1-i1-GGUF/resolve/main/Sophea-OSS-v1.imatrix.gguf
- Cuantización i1-Q4_K_M: https://huggingface.co/mradermacher/Sophea-OSS-v1-i1-GGUF/resolve/main/Sophea-OSS-v1.i1-Q4_K_M.gguf
- Cuantización i1-Q4_K_S: https://huggingface.co/mradermacher/Sophea-OSS-v1-i1-GGUF/resolve/main/Sophea-OSS-v1.i1-Q4_K_S.gguf
- Cuantización i1-IQ2_M: https://huggingface.co/mradermacher/Sophea-OSS-v1-i1-GGUF/resolve/main/Sophea-OSS-v1.i1-IQ2_M.gguf
- Cuantización i1-IQ3_XXS: https://huggingface.co/mradermacher/Sophea-OSS-v1-i1-GGUF/resolve/main/Sophea-OSS-v1.i1-IQ3_XXS.gguf
- Cuantización i1-IQ3_M: https://huggingface.co/mradermacher/Sophea-OSS-v1-i1-GGUF/resolve/main/Sophea-OSS-v1.i1-IQ3_M.gguf
- Cuantización i1-Q2_K: https://huggingface.co/mradermacher/Sophea-OSS-v1-i1-GGUF/resolve/main/Sophea-OSS-v1.i1-Q2_K.gguf
- Cuantización i1-Q3_K_M: https://huggingface.co/mradermacher/Sophea-OSS-v1-i1-GGUF/resolve/main/Sophea-OSS-v1.i1-Q3_K_M.gguf
- Referencia arXiv indicada en los tags (sin verificar): arxiv:2608.17744
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantización: https://www.nethype.de/
