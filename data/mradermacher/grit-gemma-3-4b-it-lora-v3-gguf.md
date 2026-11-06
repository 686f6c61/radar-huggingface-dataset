# mradermacher/grit-gemma-3-4b-it-lora-v3-GGUF

## Resumen

`mradermacher/grit-gemma-3-4b-it-lora-v3-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `sujeongh/grit-gemma-3-4b-it-lora-v3`, publicado por el cuantizador habitual de la comunidad mradermacher. El modelo subyacente es un ajuste fino mediante LoRA sobre `google/gemma-3-4b-it`, la variante instruct de 4B parametros de la familia Gemma 3 de Google. Este repositorio no aporta pesos nuevos: es una redistribucion en formato GGUF pensada para inferencia local con llama.cpp y derivados (Ollama, LM Studio, koboldcpp).

La relevancia practica esta en que empaqueta un fine-tune pequeno (2.630 millones de parametros segun los safetensors del modelo base) en 12 variantes de cuantizacion que van desde 1,3 GB (Q2_K) hasta 5,4 GB (f16), lo que permite ejecutarlo en GPUs de consumo modestas o incluso en CPU. Al estar basado en Gemma 3, hereda la arquitectura transformer decoder-only con atencion multimodal (vision) y una ventana de contexto amplia, aunque la model card del cuantizador no documenta ni el dataset de entrenamiento del LoRA ni las capacidades efectivas tras el ajuste.

Se trata de un artefacto de nicho: 113 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, sin licencia explicita y con idioma declarado unicamente en ingles. Es util para quien quiera probar el fine-tune de sujeongh sin montar el stack de transformers, pero no debe tratarse como un modelo con garantias de calidad o soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3, multimodal con vision) |
| Parametros totales | 2.628.658.432 (~2,63B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `sujeongh/grit-gemma-3-4b-it-lora-v3` es un fine-tune mediante LoRA sobre `google/gemma-3-4b-it`. La arquitectura subyacente es la de Gemma 3 4B instruct: un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas, embeddings rotatorios (RoPE) y un tokenizer SentencePiece. Gemma 3 introduce ademas procesamiento de imagenes en las variantes multimodales, por lo que el modelo puede heredar esa capacidad, aunque la model card del cuantizador no lo confirma.

No hay informacion disponible sobre el dataset de entrenamiento del LoRA, el numero de tokens utilizados, la composicion de los datos, ni si se aplico RLHF o DPO adicional. Tampoco se documenta la innovacion tecnica del fine-tune (rango del LoRA, modulos adaptados, hiperparametros). El repositorio de mradermacher es exclusivamente un trabajo de cuantizacion: aplica cuantizacion estatica (convert_type hf, output_tensor_quantised 1) y no genera variantes con imatrix ponderada, segun indica el propio autor.

## Capacidades

- Generacion de texto instruct en ingles, heredada de Gemma 3 4B IT.
- Razonamiento y respuesta a instrucciones conversacionales multi-turno (segun el modelo base).
- Capacidad de vision potencialmente heredada de Gemma 3, no confirmada en la model card del cuantizador.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: los metadatos solo declaran ingles; el modelo base Gemma 3 soporta mas idiomas, pero el fine-tune no lo especifica.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (1,8 GB) el modelo cabe en una GPU de 4 GB o en CPU con llama.cpp, lo que permite iterar sobre prompts y flujos de chat sin infraestructura cloud.
- Evaluacion de fine-tunes de la comunidad: investigadores que quieran comparar el comportamiento de `grit-gemma-3-4b-it-lora-v3` frente al Gemma 3 4B IT original pueden desplegar ambas variantes en el mismo entorno GGUF y medir diferencias cualitativas.
- Despliegue en dispositivos de borde: las variantes Q2_K (1,3 GB) y Q3_K_S (1,5 GB) permiten ejecutar el modelo en mini-PC, Raspberry Pi 5 con 8 GB o telefonos de gama alta mediante llama.cpp, a costa de degradacion de calidad.
- Generacion de texto asistida en ingles: redaccion, resumen y reescritura de documentos en ingles en entornos sin conectividad, usando Ollama o LM Studio como frontend.
- Base para experimentos de cuantizacion: el repositorio ofrece 12 niveles de cuantizacion del mismo checkpoint, lo que facilita estudios de degradacion perplexity/tamano sin tener que cuantizar uno mismo.
- Integracion en pipelines de CI para pruebas de regresion de modelos: al ser un artefacto pequeno y versionado, se puede incluir en tests automatizados que verifiquen que el modelo responde a un conjunto fijo de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~1,5 GB; Q4_K_M ~2,5 GB; Q8_0 ~3,5 GB; f16 ~6 GB, incluyendo overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con >= 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060, Apple Silicon M1/M2 con 8 GB unificados). Para f16 se recomienda >= 8 GB (RTX 3060 Ti, RTX 4070, A10).
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 4-8 GB de VRAM para cuantizaciones Q4-Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. No es compatible con vLLM ni TGI en formato GGUF nativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| grit-gemma-3-4b-it-lora-v3-GGUF (este) | ~2,63B | no disponible | no disponible | GGUF | Fine-tune LoRA de Gemma 3 4B IT, sin benchmarks publicados |
| google/gemma-3-4b-it | ~4B | 128K (segun Gemma 3) | Gemma Terms of Use | safetensors, GGUF | Modelo base oficial, con benchmarks publicados por Google |
| Qwen2.5-3B-Instruct | ~3B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa ligera con licencia permisiva y buen soporte multilingue |
| Llama-3.2-3B-Instruct | ~3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa de Meta con contexto largo y ecosistema amplio |

La comparacion con el modelo base es la mas directa: este repositorio es una version cuantizada de un fine-tune no oficial, por lo que su calidad depende enteramente del LoRA de sujeongh, del que no hay evaluacion publica. Frente a Qwen2.5-3B o Llama-3.2-3B, la diferencia clave es la licencia: aqui no se declara, lo que complica el uso comercial.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido. El modelo base Gemma 3 se rige por los Gemma Terms of Use, que imponen restricciones adicionales.
- Sin benchmarks ni evaluacion publicada del fine-tune: no hay evidencia de que el LoRA mejore al modelo base en ninguna tarea concreta.
- Idioma declarado solo en ingles: el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior al del Gemma 3 original.
- Riesgo de alucinacion: inherente a los modelos de 3-4B, especialmente en tareas de razonamiento factual o matematicas.
- Contexto no documentado: se desconoce si el fine-tune preserva la ventana de 128K de Gemma 3 o si la ha reducido.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la calidad; el propio autor marca Q3_K_M como "lower quality".
- Sin quants imatrix: el autor indica que no hay variantes ponderadas, lo que limita la calidad en tamanos pequenos frente a alternativas.
- Procedencia: es un artefacto de cuantizacion de un tercero sobre un fine-tune de otro tercero; no hay garantia de mantenimiento ni soporte.
- Capacidades multimodales no confirmadas: aunque Gemma 3 es multimodal, la model card del cuantizador no menciona vision y el flag `skip_mmproj: 1` sugiere que el proyector multimodal no se incluye.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/grit-gemma-3-4b-it-lora-v3-GGUF
- Modelo base (fine-tune): https://huggingface.co/sujeongh/grit-gemma-3-4b-it-lora-v3
- Modelo original de Google: https://huggingface.co/google/gemma-3-4b-it
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#grit-gemma-3-4b-it-lora-v3-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
