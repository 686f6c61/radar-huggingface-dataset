# mradermacher/RiverCub-Gemma-3-27B-impotent-heresy-GGUF

## Resumen

RiverCub-Gemma-3-27B-impotent-heresy-GGUF es una cuantizacion estatica en formato GGUF del modelo base MuXodious/RiverCub-Gemma-3-27B-impotent-heresy, publicada por mradermacher. El modelo subyacente es un merge de la familia Gemma 3 de 27.000 millones de parametros (27.009.346.304 exactos), construido con mergekit y sometido a un proceso de "abliteration" (eliminacion de la capa de rechazo) etiquetado como heretic, uncensored, decensored y abliterated. El repositorio incluye tanto los pesos completos en safetensors como un conjunto amplio de cuantizaciones GGUF, ademas de suplementos multimodales mmproj.

El problema que resuelve es practico: permitir ejecutar localmente un modelo de 27B con capacidad multimodal (Gemma 3 incorpora vision) en hardware consumer mediante cuantizacion agresiva, y ofrecer una variante sin los filtros de rechazo tipicos del modelo original. Es relevante para desarrolladores que necesitan un modelo local grande, con ventana de contexto amplia (heredada de Gemma 3) y comportamiento conversacional sin rechazos, aunque con las salvedades legales y eticas que impone la licencia Gemma.

La ficha se centra en la version GGUF, que es la que se distribuye en este repositorio (188,1 GB de repo, 510 descargas, 0 likes), con actualizacion de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3); merge de modelos via mergekit |
| Parametros totales | 27.009.346.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma 3, sin dato confirmado) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | gemma |
| Formato de pesos | safetensors (modelo base) y GGUF (este repositorio) |

## Arquitectura y entrenamiento

El modelo base es un merge de la familia Gemma 3 de 27B, producido con mergekit. Gemma 3 es una arquitectura transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas, disenada por Google DeepMind; sin embargo, los detalles exactos de configuracion (numero de capas, dimensiones, cabezas, ventana de contexto) no se detallan en la informacion proporcionada. El proceso de merge combina pesos de variantes del modelo base y, posteriormente, se aplica una tecnica de abliteration (eliminacion de la direccion de rechazo en el espacio de activaciones) para producir la variante "impotent-heresy", etiquetada como uncensored y decensored.

No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO en el modelo base. Tampoco se documentan innovaciones tecnicas especificas del merge. mradermacher solo realiza la cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y ofrece, en un repositorio separado, cuantizaciones ponderadas/imatrix de mayor calidad.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiqueta conversational en los tags del repositorio.
- Capacidad multimodal: el repositorio incluye suplementos mmproj (Q8_0 y f16) que permiten procesar imagenes con la arquitectura Gemma 3.
- Comportamiento sin rechazo (abliterated/uncensored), orientado a respuestas sin filtros de seguridad del modelo original.
- Razonamiento y generacion de codigo heredados del modelo base Gemma 3 (sin benchmarks publicados que lo confirmen en esta variante).
- Soporte multilingue limitado: la model card declara solo ingles (en).
- No se documenta tool calling, function calling ni soporte explicito de agentes en la informacion disponible.
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso

- Inferencia local de un modelo de 27B en GPU consumer: con cuantizaciones Q4_K_M (16,6 GB) o IQ4_XS (15,0 GB) el modelo cabe en tarjetas de 24 GB como la RTX 4090, permitiendo experimentacion con un modelo grande sin infraestructura de datacenter.
- Generacion creativa sin filtros: la variante abliterated responde a prompts que el modelo original rechazaria, util para escritura de ficcion, guiones o narrativa con contenido sensible dentro de un entorno controlado.
- Analisis de documentos e imagenes: gracias a los suplementos mmproj, se puede usar en pipelines de descripcion de imagenes, extraccion de informacion de capturas o documentos escaneados, siempre que se acepte la limitacion al ingles.
- Prototipado de asistentes conversacionales: su naturaleza conversational y contexto amplio (heredado de Gemma 3) permiten construir chatbots de demostracion con llama.cpp u Ollama en una estacion de trabajo.
- Evaluacion de tecnicas de abliteration: investigadores pueden comparar esta variante con el Gemma 3 original para estudiar como el merge y la eliminacion de la direccion de rechazo afectan a la calidad y la seguridad del modelo.
- Servicio de inferencia con vLLM o TGI: los pesos safetensors del modelo base permiten desplegar en servidor con GPU A100/H100 para throughput alto, usando esta cuantizacion GGUF para entornos con menos VRAM.
- Fine-tuning ligero sobre GGUF: mediante LoRA en llama.cpp se puede adaptar el modelo a dominios concretos (por ejemplo, atencion al cliente en ingles) partiendo de la cuantizacion Q8_0 (28,8 GB) para minimizar perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y KV cache): Q2_K ~10,6 GB; Q3_K_M ~13,5 GB; IQ4_XS ~15,0 GB; Q4_K_M ~16,6 GB; Q5_K_M ~19,4 GB; Q6_K ~22,3 GB; Q8_0 ~28,8 GB. Anadir entre 1 y 4 GB adicionales para KV cache segun contexto.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; RTX 3090 (24 GB) equivalente; A100 40/80 GB y H100 para Q8_0 o despliegue con mayor contexto y concurrencia.
- Cabe en consumer GPU: si, en tarjetas de 24 GB con cuantizaciones Q4 y Q5; en tarjetas de 16 GB solo con Q2_K o Q3_K_S y contexto reducido; en 12 GB no cabe en VRAM y requeriria offload parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; para los pesos safetensors, vLLM o TGI con GPU de datacenter. Los suplementos mmproj requieren un runtime con soporte multimodal de llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RiverCub-Gemma-3-27B-impotent-heresy (este) | 27,0B | no disponible | gemma | GGUF + safetensors | Merge abliterated de Gemma 3 27B, multimodal |
| Gemma 3 27B (Google) | 27,0B | no disponible en esta ficha | gemma | safetensors, GGUF | Modelo original con filtros de seguridad y multimodalidad |
| Otras variantes abliterated de Gemma 3 27B | ~27,0B | no disponible | gemma | GGUF | Mismo enfoque de eliminacion de rechazo, sin datos comparativos publicados |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de la direccion de rechazo puede degradar la coherencia, aumentar respuestas toxicas o sesgadas y reducir la utilidad en tareas que requieren negativas justificadas (seguridad, moderacion, cumplimiento).
- Riesgo elevado de alucinacion: al ser un merge sin evaluacion publicada, no hay garantia de fidelidad factica; conviene validar salidas en produccion.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Licencia Gemma: impone restricciones de uso (terminos de uso de Gemma de Google), incluida la obligacion de cumplir la politica de uso aceptable; el uso comercial esta permitido bajo condiciones, pero debe revisarse antes de desplegar.
- Contenido sin filtrar: no apto para entornos donde se requiera moderacion automatica o para usuarios menores; requiere supervision humana.
- Contexto: la longitud exacta no esta documentada en esta ficha; no asumir valores superiores a los del Gemma 3 original sin verificacion.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente el rendimiento; para produccion se recomienda Q4_K_M o superior.
- Repositorio de 188,1 GB: la descarga completa es costosa; conviene bajar solo la cuantizacion necesaria.
- Sin datos de benchmarks ni evaluaciones de seguridad publicadas por el autor del merge.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/RiverCub-Gemma-3-27B-impotent-heresy-GGUF
- Modelo base: https://huggingface.co/MuXodious/RiverCub-Gemma-3-27B-impotent-heresy
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/RiverCub-Gemma-3-27B-impotent-heresy-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#RiverCub-Gemma-3-27B-impotent-heresy-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- mergekit: no disponible en la informacion proporcionada
- Paper de Gemma 3: no disponible en la informacion proporcionada
