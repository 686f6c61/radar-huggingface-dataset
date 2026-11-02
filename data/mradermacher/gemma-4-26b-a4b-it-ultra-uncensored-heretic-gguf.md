# mradermacher/gemma-4-26B-A4B-it-ultra-uncensored-heretic-GGUF

## Resumen

Gemma-4-26B-A4B-it-ultra-uncensored-heretic es una version modificada del modelo Gemma 4 de Google, distribuida por el usuario llmfan46 y cuantizada en formato GGUF por mradermacher. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 25.233.142.046 parametros totales y aproximadamente 4.000 millones de parametros activos por token (de ahi el sufijo A4B), lo que lo situa en la gama de modelos eficientes en inferencia pese a su tamano bruto.

La modificacion aplicada es de tipo "abliterated" o "decensored": se han eliminado o atenuado los mecanismos de rechazo y filtrado de contenido del modelo original, dando lugar a una variante "uncensored" orientada a usos donde el modelo base rechazaria peticiones por politicas de seguridad. El modelo conserva la licencia Apache 2.0 declarada en el repositorio, aunque el enlace de licencia apunta a los terminos de Gemma 4 de Google, lo que introduce cierta ambiguedad juridica.

Este repositorio concreto contiene unicamente cuantizaciones estaticas GGUF del modelo base, no los pesos originales en safetensors. Esta pensado para despliegue local con llama.cpp y herramientas compatibles, con un tamano de repositorio de 184,9 GB que incluye todas las variantes de cuantizacion disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer, segun nomenclatura A4B del modelo base |
| Parametros totales | 25.233.142.046 |
| Parametros activos | aproximadamente 4.000 millones (inferido del sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles (declarado); no se detallan otros idiomas |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (solo cuantizaciones; no se incluyen safetensors) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 en su variante 26B-A4B, una arquitectura Mixture of Experts en la que solo una fraccion de los parametros (aproximadamente 4.000 millones) se activa por token, lo que reduce el coste computacional de inferencia frente a un modelo denso de 25.000 millones. El sufijo "it" indica que es una variante instruction-tuned. El modelo incluye un componente multimodal, como evidencian los ficheros mmproj (multi-modal supplement) presentes en el repositorio.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) en la informacion proporcionada. La modificacion "heretic/abliterated" implica una intervencion sobre las representaciones internas del modelo para suprimir la direccion de rechazo, un proceso que tipicamente degrada ligeramente capacidades generales mientras elimina las negativas a responder. El repositorio de mradermacher solo contiene cuantizaciones estaticas; las versiones con imatrix estan en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles, con modo instruction-tuned.
- Capacidades multimodales (vision) segun la presencia de ficheros mmproj en el repositorio.
- Razonamiento y respuesta a instrucciones sin los filtros de rechazo del modelo original.
- Generacion de contenido que el modelo base rechazaria por politicas de seguridad (contenido para adultos, temas sensibles, etc.).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: solo se declara ingles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar el comportamiento de un modelo sin capas de rechazo para analizar sesgos, direcciones de activacion y eficacia de tecnicas de abliteration en entornos controlados.
- Generacion creativa de ficcion adulta o temas sensibles: el modelo no aplica los filtros del Gemma original, lo que lo hace util para escritura narrativa que el modelo base rechazaria.
- Roleplay y personajes sin restricciones: conversaciones multi-turno donde el modelo mantiene personajes consistentes sin negativas por contenido.
- Analisis de texto sensible en investigacion social: procesamiento de corpus con lenguaje explicito o temas controvertidos donde un modelo censurado se negaria a operar.
- Desarrollo de sistemas de moderacion y red teaming: usar el modelo como generador adversarial para probar filtros y clasificadores de contenido en pipelines de seguridad.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones Q4_K_M (16,9 GB) y Q3_K_M (13,4 GB), puede ejecutarse en GPUs consumer de 16-24 GB con llama.cpp, ideal para prototipado offline sin dependencia de APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 GB (Q2_K), 14-17 GB (Q3-IQ4), 16-19 GB (Q4-Q5), 23 GB (Q6_K), 27 GB (Q8_0). Anadir aproximadamente 1 GB si se usa el componente multimodal mmproj.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) similar; A100 40/80 GB o H100 para Q8_0 y contextos largos.
- Cabe en GPU consumer: si, en tarjetas de 16 GB con Q3_K_M o IQ4_XS, y en 24 GB con Q4_K_M, Q5_K_M y Q6_K.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion de GGUF), LM Studio, y servidores compatibles con GGUF. No es compatible directamente con vLLM o TGI en formato GGUF sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser MoE con aproximadamente 4.000 millones de parametros activos, el throughput por token deberia ser notablemente superior al de un modelo denso de 25.000 millones, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-ultra-uncensored-heretic (este) | 25,2 B | ~4 B | no disponible | apache-2.0 / Gemma 4 | GGUF | Abliterated, multimodal |
| Gemma 4 26B-A4B-it (original de Google) | 25,2 B | ~4 B | no disponible | Gemma 4 license | safetensors, GGUF | Con filtros de seguridad |
| Gemma 3 27B (generacion anterior) | 27 B | denso | 128 K (segun documentacion publica de Gemma 3) | Gemma license | safetensors, GGUF | Denso, sin MoE |
| Mistral Small 3 (24B) | 24 B | denso | 32 K | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamano similar |

La comparativa con Gemma 3 y Mistral Small se ofrece como referencia de categoria; los datos de contexto de esos modelos no provienen de la informacion proporcionada para este modelo y deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- El proceso de abliteration degrada capacidades generales respecto al modelo original; se espera una ligera perdida en razonamiento, matemáticas y adherencia a instrucciones.
- Riesgo elevado de alucinacion y de generar contenido danino, ilegal o sexualmente explicito sin filtros; no apto para produccion orientada al publico general sin moderacion externa.
- Sesgos inheridos del modelo base Gemma 4, sin mitigacion adicional; la eliminacion de rechazos puede amplificar respuestas sesgadas.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Ambiguedad de licencia: el repositorio declara apache-2.0 pero enlaza a la licencia de Gemma 4 de Google, que impone restricciones de uso adicionales; conviene revisar los terminos antes de un uso comercial.
- El repositorio contiene solo cuantizaciones GGUF; no hay pesos en safetensors para fine-tuning directo.
- Longitud de contexto no documentada en la informacion disponible; no asumir ventanas largas sin verificar.
- El tag "ara" (abliterated refusal ablated) sugiere intervencion sobre las capas de rechazo, pero no se detalla la metodologia exacta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-ultra-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-ultra-uncensored-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-26B-A4B-it-ultra-uncensored-heretic-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
