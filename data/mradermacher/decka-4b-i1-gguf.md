# mradermacher/Decka-4B-i1-GGUF

## Resumen

Decka-4B-i1-GGUF es la distribución en formato GGUF del modelo Decka-4B, una destilación de 4.205.751.296 parámetros derivada de mrzenin/Qwen3.8-4B-Uncensored y publicada por mradermacher, especialista en cuantización con imatrix. El repositorio no contiene pesos originales en safetensors, sino un conjunto de 25 cuantizaciones de llama.cpp generadas con matrices de importancia (imatrix) para maximizar la calidad por bit. La model card del autor lo etiqueta como modelo de visión, aunque los ficheros mmproj se alojan en el repositorio estático hermano.

El modelo se presenta como una variante «abliterated» o «decensored»: los tags incluyen heretic, uncensored, decensored y abliterated, lo que indica que se ha aplicado una intervención sobre las direcciones de rechazo del modelo base para reducir las negativas a responder. Además, incorpora capacidades de razonamiento, function calling y ajuste supervisado (SFT), presumiblemente heredadas del linaje Qwen 3.5/3.8 sobre el que se construye.

Su relevancia práctica es doble: por un lado, ofrece un modelo de 4B ejecutable en hardware de consumo con un rango de cuantizaciones que va de 1,5 GB a 3,6 GB; por otro, documenta un pipeline reproducible de cuantización con imatrix, lo que permite auditar y regenerar los ficheros. La licencia Apache 2.0 facilita el uso comercial, aunque las implicaciones de una variante sin censura requieren evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (linaje Qwen 3.5/3.8; transformer, sin confirmar) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix de llama.cpp); safetensors disponible en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Los tags del repositorio apuntan a un linaje Qwen 3.5/3.8 con destilación, ajuste supervisado (SFT) y capacidades de razonamiento y function calling. El proceso de «abliteración» o «decensored» sugiere una modificación post-entrenamiento orientada a eliminar las direcciones de activación asociadas al rechazo, técnica habitual en la familia heretic/abliterated.

El componente técnico mejor documentado es el de cuantización: mradermacher genera las cuantizaciones i1 con matrices de importancia (imatrix) derivadas del propio modelo, lo que mejora la perplejidad frente a cuantizaciones estáticas del mismo tamaño. El repositorio incluye el fichero imatrix.gguf (0,1 GB) para que terceros puedan reproducir sus propias cuantizaciones. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag conversational.
- Razonamiento explícito, indicado por el tag reasoning del linaje destilado.
- Function calling / tool calling, según el tag function-calling.
- Capacidades de visión: la model card afirma explícitamente que es un modelo de visión, con ficheros mmproj en el repositorio estático.
- Respuestas sin censura o con rechazo reducido (uncensored, decensored, abliterated).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su despliegue tras una API compatible con OpenAI.
- Multilingüismo: la model card declara únicamente inglés; no hay evidencia de soporte de castellano.

## Casos de uso

- Asistente conversacional local en inglés: con cuantizaciones de 2,7-2,8 GB (i1-Q4_K_S o i1-Q4_K_M) el modelo cabe en GPUs de 8 GB y permite conversaciones multi-turno en estaciones de trabajo sin conexión.
- Automatización de agentes con tool calling: el tag function-calling y la compatibilidad con endpoints permiten integrarlo en orquestadores de agentes que invocan APIs externas, con la salvedad de que la fiabilidad del tool calling en un 4B debe validarse empíricamente.
- Procesamiento de documentos con imagen: al ser un modelo de visión, puede emplearse para extraer texto o describir capturas, cargando el mmproj del repositorio estático junto al GGUF principal en llama.cpp.
- Prototipado de razonamiento paso a paso: el linaje destilado con tag reasoning lo hace adecuado para experimentar con cadenas de pensamiento en entornos de investigación con recursos limitados.
- Generación de contenido creativo sin restricciones de rechazo: útil en investigación sobre alineación y en aplicaciones donde las negativas del modelo base resultan un obstáculo, siempre con revisión humana.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 24 variantes de cuantización más el fichero imatrix, lo que permite medir el impacto de la compresión en perplejidad y calidad de respuesta sobre un mismo modelo.
- Despliegue en CPU: las variantes IQ2 (1,6-1,8 GB) e IQ1 (1,5 GB) permiten ejecución en CPU con llama.cpp en equipos sin GPU, a costa de una degradación notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead de contexto. Las variantes Q4_K_M (2,8 GB) requieren unos 3,5-4 GB con contexto moderado; las Q6_K (3,6 GB) rondan los 4,5-5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) para cuantizaciones Q4-Q6; GPUs de 16-24 GB (RTX 4080, RTX 4090, A100) permiten contexto largo y mayor paralelismo.
- Cabe en GPU de consumo: sí. Incluso GPUs de 6 GB pueden ejecutar variantes IQ3 o Q4_K_S con contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (tag endpoints_compatible). vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Decka-4B-i1-GGUF | 4,2 B | no disponible | GGUF (24 cuants imatrix) | Apache 2.0 | Variante sin censura con visión y tool calling |
| mrzenin/Qwen3.8-4B-Uncensored | 4,2 B | no disponible | safetensors | Apache 2.0 | Modelo base del que deriva; pesos sin cuantizar |
| mradermacher/Decka-4B-GGUF | 4,2 B | no disponible | GGUF (cuantizaciones estáticas) | Apache 2.0 | Misma familia con cuantizaciones estáticas y mmproj para visión |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La variante está «abliterated»/«decensored»: puede generar contenido inapropiado o dañino sin rechazo, lo que exige filtros y moderación propios en producción.
- Riesgo de alucinación elevado por su tamaño (4B) y por el proceso de destilación; no es adecuado para tareas de alta precisión sin verificación.
- Idiomas: la model card declara solo inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto no especificada: no se puede planificar el uso en tareas de contexto largo sin medirla empíricamente.
- Las cuantizaciones de 1-2 bits (IQ1, IQ2, Q2_K) degradan la calidad de forma significativa; el propio autor las etiqueta como «for the desperate» o «very low quality».
- Aunque la licencia es Apache 2.0, el uso comercial de una variante sin censura conlleva riesgos reputacionales y legales según la jurisdicción y el caso de uso.
- El pipeline aparece como «no disponible» y no hay resultados de benchmarks publicados, lo que limita la evaluación objetiva previa al despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Decka-4B-i1-GGUF
- Modelo base: https://huggingface.co/mrzenin/Qwen3.8-4B-Uncensored
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Decka-4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Decka-4B-i1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
