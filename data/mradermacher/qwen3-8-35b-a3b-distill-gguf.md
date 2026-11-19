# mradermacher/Qwen3.8-35B-A3B-Distill-GGUF

## Resumen

Qwen3.8-35B-A3B-Distill-GGUF es la distribucion en formato GGUF del modelo Qwen3.8-35B-A3B-Distill, publicado por el usuario mradermacher, especializado en cuantizaciones estaticas de modelos abiertos. El modelo original lo desarrolla empero-ai y se presenta como un modelo de arquitectura MoE (mixture of experts) con 35.505.251.456 parametros totales y 3.000 millones de parametros activos por token, segun la nomenclatura A3B. La ficha del repositorio lo etiqueta como derivado de la familia Qwen3.6/Qwen3.8, con enfasis en razonamiento, function calling y distillation sobre una base SFT.

El modelo resuelve el problema de ejecutar un MoE de 35B en hardware modesto: al activar solo unos 3B de parametros por token, el coste computacional de inferencia se aproxima al de un modelo denso de 3B, mientras que la calidad se acerca a la de un modelo mucho mayor. La version GGUF anade la posibilidad de desplegarlo con llama.cpp, Ollama o cualquier runtime compatible con GGUF, incluyendo cuantizaciones agresivas de 13,3 GB (Q2_K) que caben en GPUs de consumo.

Es relevante ahora porque combina tres tendencias: arquitecturas MoE eficientes, destilacion de modelos de razonamiento y publicacion de pesos en formatos ligeros con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La model card del autor original no esta incluida en la informacion disponible; los datos tecnicos proceden de los metadatos del repositorio GGUF y de los tags.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) tipo transformer, segun tags del repositorio |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | 3B (nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; quants imatrix en repositorio i1 |
| Idiomas soportados | en (segun metadatos); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo original en safetensors, segun tags de transformers) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo MoE con 35,5B de parametros totales y aproximadamente 3B activos, construido sobre la familia Qwen (tags qwen3.6 y qwen3.8). El proceso de entrenamiento incluye una fase de destilacion (tag distillation) y un ajuste supervisado (tag sft) orientado a razonamiento y function calling. No se dispone del numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal es la propia arquitectura MoE: al mantener baja la activacion por token, el modelo puede ofrecer una ventana de parametros mucho mayor que un denso de 3B con un coste de inferencia comparable. La publicacion en GGUF anade decodificacion eficiente en CPU/GPU hibrida mediante llama.cpp, y la existencia de un archivo mmproj (Q8_0 y f16) sugiere soporte multimodal en el modelo original, aunque el detalle de dicha capacidad no esta documentado en la informacion disponible.

## Capacidades

- Generacion de texto conversacional (tag conversational en Hugging Face).
- Razonamiento (tag reasoning), presumiblemente con modos de pensamiento extendido, aunque no se detalla el mecanismo.
- Function calling / tool calling (tag function-calling).
- Destilacion de capacidades de un modelo mayor, orientada a mantener calidad con menor coste.
- Soporte multimodal potencial: el repositorio incluye archivos mmproj, lo que indica proyeccion de vision en el modelo base; no se detalla el alcance.
- Capacidades multilingues: solo se declara ingles (en) en los metadatos; no hay evidencia de soporte adicional.
- Compatibilidad con endpoints (tag endpoints_compatible).

## Casos de uso

- Asistentes de codigo en local: con cuantizaciones Q4_K_M (21,8 GB) o IQ4_XS (19,5 GB), el modelo cabe en una RTX 4090 de 24 GB y puede usarse como copiloto de programacion en IDE mediante llama.cpp u Ollama, sin enviar codigo a servicios externos.
- Agentes con tool calling: el tag function-calling indica soporte para invocar funciones; se puede integrar en frameworks de agentes (LangChain, LlamaIndex) para automatizar tareas como consultas a APIs o gestion de tickets.
- Razonamiento multi-paso en entornos con recursos limitados: al activar solo 3B por token, el throughput es alto comparado con densos de 35B, lo que lo hace adecuado para pipelines de analisis que requieren cadenas de razonamiento largas.
- Despliegue en estaciones de trabajo sin GPU dedicada: la cuantizacion Q2_K (13,3 GB) permite ejecucion en CPU con RAM suficiente, util para prototipos y entornos de desarrollo.
- Procesamiento de documentos con componente visual: si el mmproj se usa con el runtime adecuado, el modelo puede abordar tareas de comprension de imagenes y texto combinados, aunque la informacion disponible no detalla el alcance de vision.
- Fine-tuning y experimentacion: al ser Apache 2.0 y estar disponible en safetensors en el repositorio base, se puede usar como punto de partida para ajustes especificos de dominio sin restricciones de licencia.
- Servicio de inferencia self-hosted: con vLLM o TGI (si soportan la arquitectura MoE concreta) se puede desplegar como endpoint compatible con la API de OpenAI para equipos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~13,3 GB; Q3_K_M ~17,3 GB; IQ4_XS ~19,5 GB; Q4_K_M ~21,8 GB; Q5_K_M ~25,4 GB; Q6_K ~29,3 GB; Q8_0 ~37,9 GB. A estas cifras hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o IQ4_XS; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para Q6_K/Q8_0 y contextos largos; multiples GPUs para Q8_0 con contexto extendido.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y runtimes compatibles con GGUF; para el modelo original en safetensors, transformers, vLLM o TGI (sujeto a soporte de la arquitectura MoE concreta).
- Latencia y throughput: no disponibles. Al activar ~3B parametros por token, se espera un throughput notablemente superior al de un denso de 35B, pero no hay mediciones publicadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill (este) | 35,5B | ~3B | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen3-30B-A3B | 30B | ~3B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | ~12,9B | 32k | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7B | ~2,4B | 32k | codigo abierto con restricciones | safetensors |

La comparativa con Qwen3-30B-A3B es la mas directa por tamano y activacion; Mixtral 8x7B tiene mas parametros activos y mayor coste de inferencia; DeepSeek-V2-Lite es mas pequeno pero con licencia mas restrictiva. Los datos de contexto y benchmarks de los alternativos no se han verificado en esta ficha y deben consultarse en sus respectivas model cards.

## Limitaciones y advertencias

- La model card del modelo original no esta incluida en la informacion disponible; no se pueden verificar sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- Idioma: solo se declara ingles en los metadatos; el rendimiento en castellano no esta garantizado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificar la configuracion del modelo base.
- La cuantizacion Q2_K y Q3_K_S degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base (empero-ai/Qwen3.8-35B-A3B-Distill) y de la familia Qwen subyacente antes de un uso comercial.
- El soporte multimodal (mmproj) requiere runtimes especificos y no esta documentado en detalle; no debe asumirse en produccion sin pruebas.
- El repositorio GGUF tiene 244,4 GB en total por incluir todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-35B-A3B-Distill-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Quants imatrix: https://huggingface.co/mradermacher/Qwen3.8-35B-A3B-Distill-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-35B-A3B-Distill-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH: https://www.nethype.de/
