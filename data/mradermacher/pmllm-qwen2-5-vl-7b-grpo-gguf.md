# mradermacher/PMLLM-Qwen2.5-VL-7B-GRPO-GGUF

## Resumen

PMLLM-Qwen2.5-VL-7B-GRPO-GGUF es una cuantizacion estatica en formato GGUF del modelo Yeongtak/PMLLM-Qwen2.5-VL-7B-GRPO, publicada por mradermacher. El modelo original parte de la familia Qwen2.5-VL de Alibaba (7.615.616.512 parametros segun los pesos safetensors) y ha sido ajustado mediante GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo. El resultado es un modelo multimodal de vision y lenguaje orientado a conversacion, con capacidad de procesar imagenes y texto.

Esta publicacion no aporta pesos nuevos ni documentacion tecnica propia: se limita a ofrecer 13 cuantizaciones GGUF (de Q2_K a f16) mas dos ficheros mmproj para el codificador visual, lo que permite ejecutar el modelo en llama.cpp y entornos compatibles sin necesidad de GPU de datacenter. Es relevante para desarrolladores que quieran probar el modelo original en hardware de consumo, aunque la ausencia de model card detallada, benchmarks y licencia explicita limita su uso en produccion sin verificacion adicional.

El repositorio ocupa 70,4 GB e incluye variantes desde 3,1 GB (Q2_K) hasta 15,3 GB (f16). El modelo base declara unicamente el idioma ingles y la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con la API de Hugging Face Inference Endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen2.5-VL), ajustado con GRPO |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Yeongtak/PMLLM-Qwen2.5-VL-7B-GRPO deriva de Qwen2.5-VL, un transformer multimodal con codificador visual y decoder de lenguaje. El sufijo GRPO indica que se ha aplicado Group Relative Policy Optimization, un algoritmo de aprendizaje por refuerzo con preferencias que optimiza la politica del modelo comparando grupos de respuestas generadas. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni los hiperparametros del ajuste GRPO.

La publicacion de mradermacher realiza cuantizacion estatica (no imatrix) de los pesos del modelo base, incluyendo el proyector multimodal en dos precisiones (Q8_0 y f16). Segun la propia model card, las cuantizaciones ponderadas por imatrix no estan disponibles en el momento de la publicacion, lo que implica que las variantes IQ4_XS y Q2_K pueden presentar una perdida de calidad algo mayor que sus equivalentes con imatrix.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5.
- Procesamiento de imagenes (vision) mediante el fichero mmproj, que debe cargarse junto con el modelo principal.
- Razonamiento y respuesta a instrucciones, presumiblemente reforzado por el ajuste GRPO.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: la model card solo declara ingles; el modelo base Qwen2.5 soporta mas idiomas, pero no se ha verificado en este ajuste.
- Modo thinking explicito: no disponible.

## Casos de uso

- Analisis de imagenes en local: cargando el GGUF principal con su mmproj correspondiente en llama.cpp, se pueden enviar imagenes y preguntas para obtener descripciones o extraer informacion. Adecuado para prototipos en portatiles con GPU de 8-12 GB usando Q4_K_M.
- Asistente conversacional de escritorio: el modelo puede gestionar dialogos multi-turno en ingles; su tamano de 7B permite ejecutarlo en una RTX 3060 o superior con cuantizacion Q4.
- Experimentacion con RLHF/GRPO: util para investigadores que quieran estudiar el efecto del ajuste GRPO sobre un modelo Qwen2.5-VL sin necesidad de infraestructura grande, comparando el GGUF con el modelo original en safetensors.
- Extraccion de informacion de capturas o documentos escaneados: con el codificador visual, se pueden procesar imagenes de formularios o tickets y generar texto estructurado, siempre que el idioma de salida sea ingles.
- Evaluacion de cuantizaciones: el repositorio incluye 13 variantes, lo que permite medir la degradacion de calidad en tareas de vision y texto segun el nivel de cuantizacion, util para decidir el equilibrio tamano/calidad en despliegues.
- Base para fine-tuning posterior: aunque el formato GGUF no es directamente entrenable, sirve como referencia de comportamiento para validar un fine-tuning sobre el modelo base en safetensors antes de cuantizar de nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q2_K ~3,1 GB; Q3_K_M ~3,9 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. Anadir ~1,0-1,5 GB para el mmproj y espacio para el KV cache segun contexto.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M; RTX 4090 24 GB para Q8_0 o f16 con contexto amplio; A100/H100 solo si se necesita f16 con lotes grandes o contexto muy largo.
- Cabe en GPU de consumo: si, con cuantizaciones de Q2_K a Q8_0 en GPUs de 8-16 GB; f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp (principal), Ollama (tras importar el GGUF), y servidores compatibles con GGUF como llama-server. vLLM y TGI no soportan GGUF de forma nativa para este modelo.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| PMLLM-Qwen2.5-VL-7B-GRPO-GGUF | 7,6 B | no disponible | si (mmproj) | no disponible | GGUF |
| Qwen2.5-VL-7B-Instruct (original) | 7,6 B | 128K (segun documentacion de Qwen) | si | Apache 2.0 (segun Qwen) | safetensors, GGUF |
| Qwen2-VL-7B-Instruct | 8,3 B | 32K (segun documentacion de Qwen) | si | Apache 2.0 (segun Qwen) | safetensors, GGUF |
| LLaVA-1.6-Mistral-7B | 7 B | 4K-32K (segun configuracion) | si | Apache 2.0 (segun LLaVA) | safetensors, GGUF |

Nota: los datos de los modelos comparables provienen de su documentacion publica habitual; no se han verificado contra este repositorio. La licencia del modelo PMLLM no esta declarada, lo que impide confirmar si hereda Apache 2.0 del Qwen2.5-VL original.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; verificar el modelo base Yeongtak/PMLLM-Qwen2.5-VL-7B-GRPO antes de desplegar.
- Solo se declara ingles; el rendimiento en castellano no esta verificado y podria degradarse respecto al Qwen2.5-VL original.
- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del ajuste GRPO ni sobre la degradacion por cuantizacion.
- Las cuantizaciones son estaticas, no imatrix; Q2_K e IQ4_XS pueden perder calidad de forma notable en tareas de vision.
- Riesgo de alucinacion inherente a los modelos de 7B, especialmente en descripcion de imagenes detalladas o texto pequeno.
- El modelo base tiene pocas descargas (84) y un solo like, lo que sugiere escasa validacion por parte de la comunidad.
- El repositorio ocupa 70,4 GB; descargar solo la variante necesaria para evitar consumo de disco.
- No se confirma soporte de tool calling ni de agentes; no asumir estas capacidades en produccion sin pruebas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/PMLLM-Qwen2.5-VL-7B-GRPO-GGUF
- Modelo base: https://huggingface.co/Yeongtak/PMLLM-Qwen2.5-VL-7B-GRPO
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#PMLLM-Qwen2.5-VL-7B-GRPO-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
