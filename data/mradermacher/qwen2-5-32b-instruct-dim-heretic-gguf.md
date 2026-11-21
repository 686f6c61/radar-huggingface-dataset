# mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-GGUF

## Resumen

Qwen2.5-32B-Instruct-DiM-heretic-GGUF es una cuantizacion estatica en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-DiM-heretic, publicada por mradermacher. El modelo subyacente es una variante "abliterated" (tambien etiquetada como heretic, uncensored y decensored) del Qwen2.5-32B-Instruct de Alibaba, es decir, una version en la que se han atenuado o eliminado los mecanismos de rechazo y las capas de alineacion de seguridad del modelo original. Esta publicacion no entrena un modelo nuevo, sino que convierte los pesos a formato GGUF y ofrece once niveles de cuantizacion para su uso con llama.cpp y herramientas compatibles.

El modelo cuenta con 32.763.876.352 parametros totales (aproximadamente 32,8 mil millones) y esta pensado para inferencia local en hardware de gama alta, dado que incluso la cuantizacion mas agresiva (Q2_K) ocupa 12,4 GB y la de mayor calidad (Q8_0) alcanza 34,9 GB. La licencia declarada es Apache 2.0, heredada del Qwen2.5-32B-Instruct original, aunque el autor incluye tambien la etiqueta openrail++ en los metadatos, lo que genera cierta ambiguedad que conviene verificar antes de un uso comercial.

La relevancia de esta ficha reside en que combina tres factores poco habituales: un modelo de 32B con capacidades de razonamiento y codigo del Qwen2.5, una version sin censura (util para investigacion sobre alineacion, red teaming y generacion de contenido sin restricciones) y un empaquetado GGUF listo para ejecutarse en llama.cpp, Ollama o servidores compatibles. El repositorio acumula 1.051 descargas y no tiene likes, lo que sugiere un uso de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-32B-Instruct); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 32.763.876.352 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta hasta 131.072 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun metadatos; el modelo base Qwen2.5 es multilingue, pero esta ficha solo declara ingles) |
| Licencia | apache-2.0 (con etiqueta openrail++ adicional en los metadatos) |
| Formato de pesos | GGUF (cuantizaciones estaticas, quantize_version 2, output_tensor_quantised 1) |
| Tamano del repositorio | 224,0 GB |
| Modelo base | richardyoung/Qwen2.5-32B-Instruct-DiM-heretic |
| Fecha de creacion | 2026-11-05 |
| Ultima actualizacion | 2026-11-08 |

## Arquitectura y entrenamiento

La arquitectura del modelo es la del Qwen2.5-32B-Instruct original: un transformer decoder-only denso de aproximadamente 32,8 mil millones de parametros. Sobre esa base, el autor del modelo intermedio (richardyoung) aplico la tecnica conocida como "abliteration" o "heretic", que consiste en identificar y atenuar las direcciones de activacion asociadas a los comportamientos de rechazo, de modo que el modelo deja de negarse a responder a ciertas peticiones. La model card de esta publicacion no detalla el metodo exacto, el numero de tokens de entrenamiento ni la composicion del dataset utilizado en ese proceso de modificacion.

Esta publicacion concreta (mradermacher) no realiza entrenamiento adicional: se limita a convertir los pesos del modelo base a formato GGUF y a generar cuantizaciones estaticas. Los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversion se hizo desde pesos en formato Hugging Face. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal ni arquitecturas hibridas. Para los detalles de entrenamiento del modelo base (tokens, RLHF, DPO), la informacion proporcionada no los incluye y habria que consultar la model card de Qwen2.5-32B-Instruct.

## Capacidades

- Generacion de texto conversacional en ingles, con el formato de chat instructivo de Qwen2.5.
- Razonamiento y resolucion de problemas de logica y matematicas, heredados del modelo base.
- Generacion de codigo y asistencia de programacion (el modelo base Qwen2.5-32B-Instruct destaca en tareas de codigo, aunque esta ficha no aporta benchmarks propios).
- Modo "uncensored": el modelo ha sido modificado para reducir los rechazos ante peticiones que el modelo original bloquearia.
- Soporte de conversaciones multi-turno con rol de sistema y plantilla de chat instructiva.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y con el ecosistema transformers/llama.cpp.
- No se documentan capacidades de vision, audio, tool calling ni agentes en la informacion proporcionada; el modelo base Qwen2.5-32B-Instruct soporta function calling, pero no se confirma que esta variante lo conserve tras la abliteration.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como responde un LLM de 32B cuando se eliminan sus mecanismos de rechazo, comparando sus salidas con las del Qwen2.5-32B-Instruct original en experimentos controlados de red teaming.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos con tematicas adultas o controvertidas que el modelo original rechazaria, usando la cuantizacion Q4_K_M (20 GB) en una GPU de 24 GB.
- Analisis de sesgos y comportamientos no deseados: los investigadores pueden auditar que tipo de contenido genera un modelo abliterated y documentar los riesgos antes de desplegar sistemas similares.
- Evaluacion comparativa de cuantizaciones: con once niveles disponibles (de Q2_K a Q8_0), es posible medir el impacto de la cuantizacion en la calidad de un modelo de 32B, usando perplexity y evaluaciones cualitativas.
- Despliegue local en estaciones de trabajo: con Q4_K_S (18,9 GB) o Q4_K_M (20 GB) cabe en GPUs consumer de 24 GB (RTX 3090/4090) y permite asistentes conversacionales privados sin conexion a la nube.
- Prototipado de aplicaciones de chat en ingles: integracion en llama.cpp u Ollama para construir demos de conversacion multi-turno con un modelo de 32B, aprovechando la plantilla instructiva del modelo base.
- Benchmarking de infraestructura: medir throughput y latencia de un modelo de 32B en distintas cuantizaciones y GPUs para dimensionar despliegues de modelos densos de ese tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un grafico generico de comparacion de calidad entre tipos de cuantizacion (enlace a nethype.de) y una referencia a las notas de Artefact2 sobre cuantizacion, pero no aporta cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion para este modelo o sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K 12,4 GB; Q3_K_S 14,5 GB; Q3_K_M 16,0 GB; Q3_K_L 17,3 GB; IQ4_XS 18,0 GB; Q4_K_S 18,9 GB; Q4_K_M 20,0 GB; Q5_K_S 22,7 GB; Q5_K_M 23,4 GB; Q6_K 27,0 GB; Q8_0 34,9 GB.
- GPUs consumer: las cuantizaciones Q4 caben en RTX 3090 y RTX 4090 (24 GB) con margen limitado para el contexto; Q5_K_M (23,4 GB) queda muy justa en 24 GB. Q6_K y Q8_0 requieren GPUs de 32 GB o mas (por ejemplo, RTX 5090 si dispone de esa VRAM, o soluciones profesionales).
- GPUs de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB pueden alojar cualquier cuantizacion, incluida Q8_0, con contexto amplio.
- Despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; tambien es posible usar servidores compatibles con la API de OpenAI (por la etiqueta `endpoints_compatible`). vLLM y TGI no son la via principal para GGUF, aunque existen soportes parciales.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-DiM-heretic-GGUF (este) | 32,8B | No disponible | Apache 2.0 / openrail++ | GGUF (11 cuantizaciones) | Version abliterated, sin censura, solo ingles declarado |
| Qwen2.5-32B-Instruct (original) | 32,8B | 131.072 tokens (segun documentacion de Qwen) | Apache 2.0 | safetensors, GGUF (via terceros) | Modelo alineado con rechazos de seguridad; multilingue |
| richardyoung/Qwen2.5-32B-Instruct-DiM-heretic | 32,8B | No disponible | Apache 2.0 | safetensors | Modelo base de esta cuantizacion, sin formato GGUF |
| mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF | 32,8B | No disponible | Apache 2.0 | GGUF (imatrix) | Variante con cuantizaciones ponderadas/imatrix del mismo modelo base |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye datos de rendimiento que permitan comparar con otros modelos de 32B (por ejemplo, Llama 3.3 70B, Mistral Large o Gemma 2 27B). No se dispone de benchmarks propios para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: se ha modificado para eliminar o atenuar los rechazos de seguridad, por lo que puede generar contenido danino, ilegal o eticamente problematico. No es apto para aplicaciones de produccion orientadas al publico general sin filtros adicionales.
- Riesgo elevado de alucinacion: como cualquier LLM de su tamano, y potencialmente agravado por la modificacion de pesos, puede inventar hechos, citas o codigo incorrecto.
- Idioma: los metadatos solo declaran ingles; no se confirma el soporte multilingue del modelo base en esta variante.
- Contexto: no se documenta la longitud de contexto efectiva de esta cuantizacion; el modelo base soporta hasta 131.072 tokens, pero la abliteration y la cuantizacion pueden afectar al rendimiento en contextos largos.
- Licencia ambigua: se declara apache-2.0 pero tambien aparece la etiqueta openrail++ en los metadatos; conviene verificar los terminos exactos antes de un uso comercial.
- Sin benchmarks: no hay datos publicados de calidad ni de degradacion por cuantizacion, por lo que la eleccion de quant (Q2_K frente a Q8_0) debe validarse empiricamente.
- Repositorio de 224 GB: la descarga completa de todas las cuantizaciones es costosa; conviene descargar solo el archivo GGUF necesario.
- Sin likes y con 1.051 descargas: es un modelo de nicho con poca validacion comunitaria; no hay evidencia de uso en produccion.
- La model card no documenta el proceso de abliteration ni sus posibles efectos secundarios en razonamiento o coherencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-GGUF
- Modelo base (richardyoung): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic
- Variante imatrix del mismo autor: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-DiM-heretic-GGUF
- Modelo original Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
