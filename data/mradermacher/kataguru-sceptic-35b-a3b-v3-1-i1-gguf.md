# mradermacher/Kataguru-Sceptic-35B-A3B-v3.1-i1-GGUF

## Resumen
Kataguru-Sceptic-35B-A3B-v3.1-i1-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-v3.1, publicado por el usuario mradermacher en Hugging Face. El nombre del modelo sugiere una arquitectura de mezcla de expertos (MoE) con 35B de parametros totales y 3B activos por token, aunque esta informacion no viene confirmada por la model card ni por los metadatos del repositorio. El repositorio contiene exclusivamente los archivos de cuantizacion generados con tecnicas de imatrix/weighted quants, no el modelo original.

El problema que resuelve esta publicacion es practico: permitir la ejecucion del modelo original en hardware de consumo mediante cuantizaciones de 1 a 6 bits, desde IQ1_S hasta Q6_K. Es relevante para desarrolladores que quieran probar el modelo Kataguru-Sceptic sin disponer de GPUs de datacenter, usando llama.cpp, Ollama u otros runtimes compatibles con GGUF. La informacion disponible es muy escasa: no hay model card descriptiva, no se declara licencia, idiomas ni pipeline, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE con 35B totales / 3B activos, sin confirmar) |
| Parametros totales | 95.309.950 (dato de safetensors del repo; no coincide con el "35B" del nombre, probablemente por contar solo un subconjunto de tensores o por metadatos incompletos) |
| Parametros activos | no disponible (el nombre sugiere 3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ4_1, IQ3_XS, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones generadas a partir del modelo original en safetensors) |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura interna del modelo original Kataguru-Sceptic-35B-A3B-v3.1 en la documentacion proporcionada. El sufijo "A3B" en el nombre es consistente con la convencion habitual de modelos MoE (por ejemplo, "Qwen3-30B-A3B"), lo que sugiere 35B de parametros totales y aproximadamente 3B activos por token, pero esto no esta confirmado por la model card. Tampoco se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o similar.

La unica informacion tecnica disponible proviene de los metadatos incrustados en la model card del repositorio GGUF: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y una lista de cuantizaciones que incluye tecnicas de imatrix (IQ1, IQ2, IQ3, IQ4) y cuantizaciones K-quants clasicas. Esto indica que las cuantizaciones se generaron con la herramienta de cuantizacion de llama.cpp a partir del modelo original alojado en `kataguru/Kataguru-Sceptic-35B-A3B-v3.1`, usando pesos de importancia (imatrix) para las variantes IQ, lo que suele mejorar la calidad en cuantizaciones de baja precision.

## Capacidades
- Generacion de texto autoregresiva (inferencia estandar de modelos de lenguaje).
- Razonamiento y conversacion multi-turno, segun la naturaleza generica del modelo base.
- Capacidades de codigo y matematicas: no confirmadas, no disponibles en la documentacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama, LM Studio y otros derivados.

## Casos de uso
- Pruebas locales de evaluacion: usar las cuantizaciones IQ2/IQ3 para validar rapidamente el comportamiento del modelo Kataguru-Sceptic en una estacion de trabajo antes de desplegarlo en produccion con pesos completos.
- Despliegue en hardware de consumo: las variantes Q4_K_M o Q5_K_M permiten ejecutar el modelo en GPUs con 8-24 GB de VRAM usando llama.cpp u Ollama, algo impracticable con el modelo original en precision completa.
- Integracion en aplicaciones de chat locales: servir el modelo con Ollama para asistentes conversacionales offline en entornos sin conectividad o con requisitos de privacidad.
- Experimentacion con cuantizacion extrema: las variantes IQ1_S e IQ2_XXS permiten estudiar la degradacion de calidad en regimenes de 1-2 bits sobre un modelo MoE, comparando con las variantes Q4/Q6 del mismo repositorio.
- Pipelines de generacion de texto por lotes: usar llama.cpp con GGUF para procesar grandes volumenes de texto en CPU/GPU mixtas, aprovechando la eficiencia de memoria de las cuantizaciones K-quants.
- Fine-tuning posterior o destilacion: usar las cuantizaciones como referencia de comportamiento para comparar con adaptaciones LoRA entrenadas sobre el modelo original en safetensors.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: depende de la cuantizacion. Para un modelo de ~35B totales, las estimaciones orientativas serian: IQ1_S/IQ2_XXS en torno a 9-11 GB; Q3_K_M en torno a 16-18 GB; Q4_K_M en torno a 20-22 GB; Q6_K en torno a 28-30 GB. Estas cifras son estimaciones genericas para modelos de ese tamano y no estan verificadas para este repositorio concreto (el tamano del repo es 0,4 GB, lo que sugiere que solo se subieron algunos archivos o que el conteo de parametros de safetensors es incompleto).
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M y superiores; A100/H100 (40-80 GB) para Q6_K y para servir varias instancias; GPUs de 8-12 GB (RTX 3060, RTX 4060 Ti) solo para IQ1/IQ2.
- Cabe en GPU de consumo: si, en las cuantizaciones bajas y medias, siempre que el tamano real del modelo sea el sugerido por el nombre (35B totales con 3B activos).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones (vLLM tiene soporte experimental para GGUF).
- Latencia y throughput: no disponibles. En un modelo MoE con 3B activos, el throughput por token deberia ser alto en comparacion con modelos densos de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-v3.1 (este repo, GGUF) | 35B totales / 3B activos (segun nombre, sin confirmar) | no disponible | no disponible | GGUF | Hugging Face, 0 descargas |
| Qwen3-30B-A3B (referencia MoE similar) | 30B totales / 3B activos | 32K nativo (extensible) | Apache 2.0 | safetensors, GGUF | Hugging Face, amplia adopcion |
| Mixtral-8x7B (referencia MoE clasica) | 46B totales / 12B activos | 32K | Apache 2.0 | safetensors, GGUF | Hugging Face, amplia adopcion |
| DeepSeek-V2-Lite (referencia MoE eficiente) | 16B totales / 2,4B activos | 4K-32K | MIT (con restricciones de uso) | safetensors | Hugging Face |

La comparativa es orientativa: no hay datos de rendimiento del modelo Kataguru-Sceptic que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias
- Informacion documental casi nula: no hay model card descriptiva, ni licencia, ni idiomas, ni benchmarks. No se recomienda usar este repositorio en produccion sin verificar primero el modelo original.
- Inconsistencia de metadatos: el conteo de parametros de safetensors (95,3 M) no concuerda con el nombre "35B-A3B", lo que sugiere que el conteo corresponde solo a algunos tensores o que el repositorio esta incompleto. Verificar el modelo base antes de confiar en las estimaciones de VRAM.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluacion publicada que lo cuantifique.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: desconocidas; al no declararse licencia, no hay garantia de uso comercial. Consultar el repositorio original `kataguru/Kataguru-Sceptic-35B-A3B-v3.1` antes de cualquier uso.
- Cuantizaciones extremas (IQ1/IQ2): degradan la calidad de forma notable; reservarlas para experimentacion, no para uso final.
- Repositorio con 0 descargas y 0 likes: sin evidencia de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-09): metadato anomalo que conviene verificar; puede indicar un error de registro o un repositorio de prueba.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/Kataguru-Sceptic-35B-A3B-v3.1-i1-GGUF
- Modelo original: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Herramienta de cuantizacion llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama (runtime GGUF): https://ollama.com
