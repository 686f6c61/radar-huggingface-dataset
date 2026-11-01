# mradermacher/gemma-4-E2B-it-enja-GGUF

## Resumen

gemma-4-E2B-it-enja-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo brishen/gemma-4-E2B-it-enja, preparada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es una variante derivada de Gemma 4 E2B (versión instruct) a la que se ha aplicado una poda de vocabulario (vocabulary pruning) para especializarlo en inglés y japonés, reduciendo así el tamaño del embedding y mejorando la eficiencia en estos dos idiomas.

Este repositorio no es un modelo nuevo en sí mismo, sino la distribución cuantizada que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros runtimes compatibles con GGUF. Con unos 3.620 millones de parámetros y cuantizaciones desde 2,2 GB (Q2_K) hasta 7,4 GB (f16), es adecuado para ejecutarse en portátiles y GPUs domésticas. Incluye además archivos mmproj (suplementos multimodales), lo que indica que el modelo base conserva capacidades de visión.

Su relevancia actual radica en la combinación de un modelo pequeño tipo Gemma con especialización bilingüe inglés-japonés mediante poda de vocabulario, una técnica que reduce memoria y acelera la inferencia sin reentrenar el modelo completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer, variante E2B instruct) |
| Parámetros totales | 3.619.681.827 (~3,62 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (más mmproj en f16 y Q8_0) |
| Idiomas soportados | inglés, japonés |
| Licencia | apache-2.0 (con licencia Gemma de Google referenciada: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | GGUF (los pesos originales del modelo base están en safetensors) |

## Arquitectura y entrenamiento

El modelo base, brishen/gemma-4-E2B-it-enja, parte de Gemma 4 E2B en su versión instruct, un transformer de unos 3.600 millones de parámetros. Sobre él se ha aplicado una poda de vocabulario (vocabulary pruning): se eliminan del vocabulario original los tokens correspondientes a idiomas no necesarios, conservando únicamente los de inglés y japonés. Esto reduce el tamaño de la matriz de embeddings y de la capa de salida, lo que se traduce en menor consumo de memoria y mayor velocidad de generación, sin alterar el resto de pesos.

No hay información disponible sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset o uso de RLHF/DPO. Respecto a las cuantizaciones de este repositorio, son estáticas (no imatrix ni weighted quants en el momento de publicación), convertidas desde los pesos en safetensors mediante el flujo de conversión estándar de llama.cpp. La disponibilidad de archivos mmproj confirma que el modelo admite entrada multimodal (visión) cuando se cargan junto al GGUF principal.

## Capacidades

- Generación de texto conversacional en inglés y japonés (etiquetado como modelo conversacional).
- Capacidades multimodales (visión): los archivos mmproj-Q8_0 y mmproj-f16 indican compatibilidad con entrada de imágenes en runtimes como llama.cpp.
- Instrucción (versión instruct del modelo base).
- No hay información disponible sobre tool calling, function calling, soporte de agentes ni capacidades específicas de razonamiento (thinking mode).
- No hay información disponible sobre rendimiento en código o matemáticas.

## Casos de uso

- Asistentes conversacionales bilingües inglés-japonés: la poda de vocabulario especializa el modelo en estos dos idiomas, ideal para chatbots que atienden usuarios en ambos mercados desde un único despliegue local.
- Traducción y apoyo lingüístico EN↔JA: en un modelo de ~3,6 B parametrizado para estos idiomas, puede servir para traducción asistida, redacción de correos o revisión de textos en japonés.
- Ejecución local en portátiles y equipos sin GPU: con cuantizaciones desde 2,2 GB, funciona en CPUs y GPUs integradas mediante llama.cpp u Ollama, útil para prototipado privado sin enviar datos a la nube.
- Descripción de imágenes con consultas en japonés o inglés: cargando el mmproj junto al GGUF, se pueden construir aplicaciones de análisis de imágenes (etiquetado, descripción, OCR ligero) con consultas en ambos idiomas.
- Integración en aplicaciones móviles o de escritorio: el tamaño reducido de los quants Q3/Q4 lo hace viable para distribución embebida en software de productividad.
- Generación aumentada por recuperación (RAG) local: combinado con un motor vectorial, puede responder preguntas sobre documentación corporativa en inglés y japonés manteniendo los datos en el equipo del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~2,2 GB (Q2_K) hasta ~4 GB (Q8_0) para el GGUF principal, más ~0,7–1,1 GB adicionales si se carga el mmproj para visión, más la memoria de la KV cache según el contexto.
- GPU recomendadas: cualquier GPU de consumo con 4–8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090 con holgura) ejecuta cómodamente cualquier quant; también funciona en CPU pura dado el tamaño reducido.
- Cabe en GPUs de consumo: sí, incluso la versión f16 (7,4 GB) entra en una GPU de 8 GB; los quants recomendados (Q4_K_M, 2,7 GB) funcionan en portátiles con GPU integrada moderna.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, y otros runtimes compatibles con GGUF y mmproj. No hay información sobre compatibilidad con vLLM o TGI para este formato.
- Latencia y throughput: no disponible; al ser un modelo de ~3,6 B con vocabulario podado, cabe esperar velocidades altas en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-E2B-it-enja-GGUF (este) | ~3,62 B | GGUF (estáticos) | en, ja | apache-2.0 | Vocabulario podado, multimodal vía mmproj |
| Gemma 3 4B it (Google) | ~4 B | safetensors, GGUF comunitarios | 140+ idiomas | Licencia Gemma | Multilingüe amplio, multimodal nativo |
| Qwen3 4B (Alibaba) | ~4 B | safetensors, GGUF comunitarios | ~100 idiomas | Apache-2.0 | Fuerte en código y razonamiento |

El modelo de esta ficha se diferencia por su especialización bilingüe mediante poda de vocabulario, que reduce memoria y acelera la inferencia frente a versiones multilingües completas, a costa de perder cobertura de otros idiomas.

## Limitaciones y advertencias

- Cobertura de idiomas limitada: por la poda de vocabulario, el modelo está restringido a inglés y japonés; otros idiomas pueden degradarse gravemente o no ser generables.
- Las cuantizaciones son estáticas: no hay versiones imatrix/weighted, por lo que los quants bajos (Q2_K, Q3_K_M) pueden mostrar pérdidas de calidad apreciables, especialmente en japonés.
- Riesgo de alucinación típico de modelos pequeños (~3,6 B): verificar hechos y contenido generado en producción.
- No hay benchmarks publicados para esta variante: el rendimiento real tras la poda de vocabulario no está cuantificado y puede diferir del modelo Gemma original.
- Licencia: el repositorio indica apache-2.0, pero enlaza a la licencia Gemma de Google; conviene revisar ambas antes de uso comercial, ya que los términos de la licencia Gemma imponen condiciones adicionales.
- Datos de entrenamiento del modelo base no documentados: no hay información sobre sesgos específicos, fecha de corte de conocimiento ni composición del dataset.
- La longitud de contexto no está especificada en la información disponible; comprobarla antes de diseñar aplicaciones con documentos largos.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mradermacher/gemma-4-E2B-it-enja-GGUF
- Modelo base: https://huggingface.co/brishen/gemma-4-E2B-it-enja
- Página de descargas de mradermacher: https://hf.tst.eu/model#gemma-4-E2B-it-enja-GGUF
- Licencia Gemma 4 (Google): https://ai.google.dev/gemma/docs/gemma_4_license
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
