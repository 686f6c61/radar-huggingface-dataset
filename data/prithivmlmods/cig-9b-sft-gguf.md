# prithivMLmods/CIG-9B-SFT-GGUF

## Resumen

CIG-9B-SFT-GGUF es la distribucion cuantizada en formato GGUF del modelo CIG-9B-SFT, un modelo de lenguaje de 9.197.094.384 parametros desarrollado por el usuario prithivMLmods a partir del modelo base CodeImageGen/CIG-9B-SFT. Se trata de un modelo especializado en generacion de imagenes basada en codigo: en lugar de sintetizar pixeles directamente, traduce un prompt textual a un programa JavaScript que posteriormente se ejecuta y renderiza en Chrome headless para producir la imagen final. Esta orientado a la generacion texto-a-imagen mediante codigo y se apoya en el modelo Qwen/Qwen3.5-9B como base, afinado con supervision (SFT) sobre el dataset CIG-SFT-35k sin recompensas de aprendizaje por refuerzo.

El repositorio ofrece un abanico amplio de cuantizaciones (desde Q3_K_M de 4,8 GB hasta BF16 de 18,4 GB, pasando por NVFP4 de 8,46 GB optimizado para hardware NVIDIA Blackwell) y una cabeza opcional de Multi-Token Prediction (MTP) que integra decodificacion especulativa en los propios pesos para acelerar la inferencia local. La licencia es Apache 2.0 y el modelo esta etiquetado unicamente para ingles.

Su relevancia actual radica en dos frentes: por un lado, explora una via alternativa a los modelos de difusion para generacion de imagenes (programas ejecutables en lugar de ruido latente), y por otro, el empaquetado GGUF con MTP y NVFP4 lo convierte en un caso practico de despliegue local acelerado sobre GPUs de consumo y aceleradores Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-9B) con cabeza opcional de Multi-Token Prediction (MTP) |
| Parametros totales | 9.197.094.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4, BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 (generadas con llama.cpp); mencion de GPTQ y llm-compressor en las etiquetas |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); pesos originales en safetensors FP16 con cabeza MTP opcional en `model-mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer decoder-only de aproximadamente 9.200 millones de parametros. Sobre esa base se aplico un ajuste supervisado (SFT) sin RLHF ni DPO sobre el dataset CodeImageGen/CIG-SFT-35k, complementado con HuggingFaceH4/ultrachat_200k segun las etiquetas del repositorio. El objetivo del entrenamiento no es la generacion directa de pixeles, sino la produccion de programas JavaScript que, al ejecutarse en un navegador headless, renderizan la imagen solicitada. Esta es la innovacion central del modelo: sustituye el paradigma de difusion por el de generacion de codigo ejecutable.

El repositorio incluye ademas una cabeza opcional de Multi-Token Prediction (MTP) que predice varios tokens futuros en un unico forward pass, integrando la decodificacion especulativa directamente en los pesos sin necesidad de un modelo borrador separado. La cuantizacion NVFP4 esta pensada para aprovechar los Tensor Cores FP4 nativos de la arquitectura NVIDIA Blackwell (SM120, GB202, B200, B300, RTX Pro 6000, RTX 50-series), mientras que el resto de cuantizaciones K-quant siguen el esquema estandar de llama.cpp con imatrix. El numero de tokens de entrenamiento y la composicion detallada del dataset no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de codigo JavaScript a partir de prompts en lenguaje natural, orientada a la sintesis de imagenes.
- Generacion texto-a-imagen indirecta mediante ejecucion del codigo en Chrome headless (pipeline `codeimagegen/codeimagegen`).
- Conversacion multi-turno (etiqueta `conversational`, dataset ultrachat_200k como parte del entrenamiento).
- Decodificacion especulativa integrada via cabeza MTP opcional.
- Inferencia acelerada en hardware NVIDIA Blackwell mediante cuantizacion NVFP4.
- Compatible con endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- Soporte de `text-generation-inference`, `vllm` y `llama.cpp` segun etiquetas.
- Capacidades multilingues: limitadas al ingles.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Generacion de ilustraciones programaticas: dado un prompt textual, el modelo produce un programa JavaScript que se renderiza en Chrome headless para obtener la imagen, util en pipelines donde se prefiere codigo reproducible y versionable frente a un binario de pixeles.
- Prototipado rapido de assets graficos en desarrollo web: el modelo puede generar snippets JavaScript que dibujan graficos vectoriales o canvas directamente, integrables en el frontend sin dependencias de difusion.
- Automatizacion de contenido grafico en CI/CD: al ser codigo ejecutable, la salida puede someterse a tests, linting y control de versiones antes de renderizar la imagen, lo que encaja en flujos de integracion continua.
- Despliegue local en estaciones de trabajo con GPU Blackwell: la cuantizacion NVFP4 (8,46 GB) permite ejecutar el modelo en RTX 50-series o RTX Pro 6000 aprovechando FP4 nativo, sin depender de la nube.
- Experimentacion en investigacion sobre generacion de imagenes basada en codigo: sirve como referencia reproducible para comparar el paradigma code-to-image frente a modelos de difusion, con metricas GenEval2 publicadas.
- Servicio de generacion de imagenes bajo demanda con licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin las restricciones de licencias de difusion mas restrictivas, siempre que se respete la atribucion.
- Inferencia acelerada en produccion con `vllm` o `llama.cpp`: la cabeza MTP permite reducir latencia en despliegues con requisitos de throughput, sin necesidad de gestionar un modelo borrador aparte.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| GenEval2 (GM score) | 26,4 |
| GenEval2 (AM score) | 57,5 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje general, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q3_K_M ~4,8 GB; Q4_K_M ~5,83 GB; Q5_K_M ~6,67 GB; Q6_K ~7,56 GB; Q8_0 ~9,79 GB; NVFP4 ~8,46 GB; BF16 ~18,4 GB (sin contar overhead de contexto y KV cache).
- GPU recomendadas para NVFP4: NVIDIA Blackwell (RTX Pro 6000, RTX 50-series, B200, B300); para el resto de cuantizaciones, cualquier GPU con VRAM suficiente (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para cuantizaciones Q3/Q4, y en 12-16 GB para Q5/Q6/Q8 con margen para contexto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), vLLM, text-generation-inference, Hugging Face Endpoints; el pipeline de renderizado requiere Chrome headless y el repositorio `codeimagegen/codeimagegen`.
- Latencia y throughput: no disponibles en la informacion proporcionada; la cabeza MTP esta disenada para reducir latencia mediante decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIG-9B-SFT-GGUF | 9,2 B | no disponible | Texto-a-imagen via codigo JS | Apache 2.0 | GGUF en HF |
| Modelos de difusion texto-a-imagen (p. ej. SDXL, FLUX) | variable (1-12 B) | no aplica | Difusion latente | variable (a menudo restrictiva) | pesos safetensors/diffusers |
| LLMs generalistas de ~9 B (p. ej. Qwen3, Llama 3.1 8B) | 8-9 B | 32k-128k segun modelo | Lenguaje general | variable | safetensors/GGUF |

La comparacion numerica con alternativas de la misma categoria no esta disponible en la informacion proporcionada; los datos de GenEval2 del modelo no se acompanan de cifras equivalentes de los competidores.

## Limitaciones y advertencias

- Modelo especializado: no es un LLM generalista; su utilidad fuera de la generacion de imagenes por codigo es limitada.
- Solo ingles: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion en el codigo generado: los programas JavaScript pueden contener errores, APIs inexistentes o comportamientos no deseados; requiere sandbox y validacion antes de ejecutar en produccion.
- Dependencia de Chrome headless y del pipeline `codeimagegen/codeimagegen` para obtener la imagen final; el modelo por si solo no produce pixeles.
- Sesgos de los datos de entrenamiento (CIG-SFT-35k y ultrachat_200k) no documentados en la informacion disponible.
- La cuantizacion NVFP4 solo aprovecha aceleracion nativa en hardware Blackwell; en otras GPUs puede degradarse el rendimiento o la compatibilidad.
- La cabeza MTP es opcional y su soporte depende del runtime (llama.cpp con extensiones MTP); no todos los backends la aprovecharan.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene verificar las licencias del modelo base (Qwen/Qwen3.5-9B) y de los datasets utilizados.
- Longitud de contexto no documentada: planificar despliegues con prompts largos requiere verificacion empirica.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema y validacion comunitaria practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/CIG-9B-SFT-GGUF
- Modelo base: https://huggingface.co/CodeImageGen/CIG-9B-SFT
- Dataset de SFT: https://huggingface.co/datasets/CodeImageGen/CIG-SFT-35k
- Dataset conversacional: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Repositorio del pipeline de renderizado: https://github.com/codeimagegen/codeimagegen
- llama.cpp: https://github.com/ggml-org/llama.cpp
