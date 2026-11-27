# offmonreal/Ornith-1.5-35B-MaxQuality-MTP-GGUF

## Resumen

Ornith-1.5-35B MaxQuality MTP GGUF es una cuantización en formato GGUF del modelo Ornith-1.5-35B-A3B, publicada por el usuario offmonreal (identificado en las etiquetas como "offmoreal"). El modelo base pertenece a la familia de arquitecturas Qwen3.5-MoE y emplea una arquitectura de mezcla de expertos con 35.505.251.456 parámetros totales. Esta release no es una simple conversión: incorpora un cabezal de predicción multi-token (MTP) de un modelo donante, extraído de Qwen/Qwen3.6-35B-A3B, en lugar del cabezal nativo del modelo base, y está calibrada con iMatrix para preservar la calidad en cuantizaciones agresivas.

La relevancia de esta ficha reside en su enfoque práctico: el autor documenta con detalle el proceso de cuantización, los problemas encontrados con el cuantizador en arquitecturas MoE con capas nextn y las soluciones aplicadas (prune-layers y posterior injerto del bloque MTP). Además, publica tres variantes con recetas distintas (Q4_K_M, Q3_K_M y Q2_K AllGPU) y comandos de lanzamiento probados en hardware de consumo, lo que facilita la reproducibilidad.

El modelo está pensado para inferencia local en GPUs de consumo mediante llama.cpp con el fork TurboQuant. La variante Q2_K-AllGPU cabe íntegramente en una tarjeta de 16 GB de VRAM sin offload a CPU, y la decodificación especulativa con el cabezal MTP donante mantiene el rendimiento en contextos largos, con velocidades declaradas de hasta ~145 tok/s en la configuración AllGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3.5-MoE), con capa MTP (nextn) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (modelo MoE; el autor no publica el número de parámetros activos) |
| Longitud de contexto | hasta 200.144 tokens en los comandos de lanzamiento recomendados |
| Tipos de cuantizacion | Q4_K_M (trunk) + MTP Q4_K; Q3_K_M (trunk) + MTP Q3_K; Q2_K AllGPU (trunk Q2v2) + MTP Q3_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de 35.505 millones de parámetros totales, encuadrado en la familia arquitectónica Qwen3.5-MoE según las etiquetas del repositorio. Incluye una capa de predicción multi-token (MTP) con `mtp_num_hidden_layers: 1` en la configuración upstream, con pesos reales presentes, a diferencia de Ornith-1.0, que se distribuyó sin ella. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal de esta release es el reemplazo del cabezal MTP nativo por un cabezal donante extraído de Qwen/Qwen3.6-35B-A3B, de la misma familia arquitectónica. Según el autor, el cabezal nativo lograba una tasa de aceptación de borradores del 34-41 % en configuraciones realistas con offload a CPU, frente al 57-61 % del cabezal donante; cuantizar el cabezal nativo a mayor precisión (Q8_0, Q6_K) no cerraba la diferencia. El cabezal donante se cuantiza a Q4_K (520 MiB) tras comprobar que Q8_0, Q6_K y Q4_K ofrecen la misma aceptación y que Q2_K es peor. La calibración se realizó con el pipeline iMatrix del autor (`calibration_datav5.txt`, 802 fragmentos).

El proceso de cuantización requirió una solución alternativa: la capa MTP nativa no puede cuantizarse por la ruta normal de `--imatrix`, porque el forward de calibración no la ejercita y el cuantizador de esta build de TurboQuant falla en esa capa para arquitecturas MoE+nextn. El autor usó `--prune-layers 40` para cuantizar el tronco de 40 capas y posteriormente injertó el bloque MTP donante, recuantizado mediante un paso K-quant real.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como "conversational" y los comandos de lanzamiento usan `--jinja`, lo que habilita plantillas de chat.
- Razonamiento multi-turno con contexto largo: soporta ventanas de hasta 200.144 tokens en las configuraciones documentadas.
- Decodificación especulativa mediante cabezal MTP: acelera la generación y mantiene el rendimiento más allá de los 10K tokens de contexto.
- Procesamiento de código real a gran escala: el autor validó el rendimiento con un prompt de ~112K tokens de código fuente real.
- Ejecución en GPU de consumo: la variante Q2_K-AllGPU reside completamente en 16 GB de VRAM sin offload.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con servicios de inferencia compatibles.
- Capacidades de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional local con contexto largo: el modelo puede mantener conversaciones multi-turno sobre documentos extensos gracias a su ventana de hasta 200.144 tokens, con el cabezal MTP evitando la degradación de velocidad típica en contextos largos.
- Análisis de repositorios de código: con prompts de ~112K tokens de código fuente real validados por el autor, es adecuado para revisión de código, explicación de módulos y detección de patrones en bases de código medianas.
- Despliegue en estaciones de trabajo con GPU de consumo: la variante Q2_K-AllGPU (12,62 GiB) cabe en una RTX 5060 Ti de 16 GB sin offload, lo que permite servir el modelo en un equipo de escritorio con 64 GB de RAM.
- Prototipado e investigación en decodificación especulativa: la documentación detallada del injerto MTP, las tasas de aceptación y los barridos de `--spec-draft-n-max` sirven como referencia para experimentos con cabezales draft en arquitecturas MoE.
- Generación de texto por lotes en pipelines de CI/CD: mediante `llama-server` con `--parallel 1` y tamaños de batch grandes (`--batch-size 262144`), puede procesar prompts largos de forma desatendida en un servidor local.
- Evaluación comparativa de cuantizaciones: las tres variantes publicadas (Q4_K_M, Q3_K_M, Q2_K) permiten medir el compromiso calidad/velocidad/tamaño en el mismo modelo base bajo distintas recetas.
- Servicio de inferencia compatible con API: la etiqueta `endpoints_compatible` y el uso de `llama-server` con `--host 0.0.0.0 --port 8080` facilitan exponer el modelo como endpoint HTTP en una red local.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks académicos (MMLU, HumanEval, GSM8K). Sí documenta mediciones de velocidad de generación en su hardware de prueba (RTX 5060 Ti 16 GB, Ryzen 9 5950X, 64 GB RAM, fork TheTom/llama-cpp-turboquant commit `c26cbdffc`):

| Variante | Velocidad de generación | Comportamiento más allá de 10K de contexto |
|---|---|---|
| MTP (draft-mtp, n-max 2), Q4_K_M | ~60 tok/s | Se mantiene; el cabezal draft sigue funcionando con contexto largo |
| Sin MTP, Q4_K_M | ~60 tok/s | Se degrada a medida que crece el contexto |
| MTP (draft-mtp, n-max 2), Q3_K_M | ~85 tok/s | 10 capas de expertos en CPU (`blk.30`-`blk.39`) |
| Q2-Quality MTP, AllGPU | ~145 tok/s | Modelo completo y cabezal MTP en VRAM, sin offload a CPU |

Datos adicionales de la release:

| Metrica | Valor |
|---|---|
| Tasa de aceptación del cabezal MTP nativo | 34-41 % |
| Tasa de aceptación del cabezal MTP donante | 57-61 % |
| Óptimo de `--spec-draft-n-max` | 2 (barrido de 2 a 6; la aceptación y la velocidad caen monótonamente por encima de 2) |
| Tamaño del cabezal MTP donante a Q4_K | 520 MiB (frente a 857 MiB a Q8_0) |

## Requisitos de hardware

- VRAM estimada: 20,22 GiB para Q4_K_M, 16,43 GiB para Q3_K_M y 12,62 GiB para Q2_K-AllGPU. Las dos primeras variantes requieren offload parcial de expertos a CPU para caber en GPUs de consumo.
- GPU validadas: NVIDIA GeForce RTX 5060 Ti de 16 GB (hardware de prueba del autor). La variante Q2_K-AllGPU está diseñada explícitamente para caber en 16 GB de VRAM sin offload.
- GPU de gama alta (A100, H100): no se han publicado mediciones en la información disponible, aunque por tamaño cabrían todas las variantes en VRAM.
- CPU y RAM: el autor probó con AMD Ryzen 9 5950X (16 núcleos / 32 hilos) y 64 GB de RAM; las variantes con offload de expertos dependen de la RAM del sistema.
- Despliegue: llama.cpp mediante el fork TheTom/llama-cpp-turboquant (commit `c26cbdffc`), con `llama-server`. No se mencionan vLLM, Ollama ni TGI en la documentación.
- Opciones de caché: `--cache-type-k turbo3 --cache-type-v turbo3`, `--flash-attn on`, `--cache-reuse 256`.
- Latencia y throughput: ~60 tok/s (Q4_K_M con MTP), ~85 tok/s (Q3_K_M con MTP y 10 capas de expertos en CPU) y ~145 tok/s (Q2_K-AllGPU con todo en VRAM), medidos a 10K de contexto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B MaxQuality MTP GGUF (esta ficha) | 35,5 B (MoE) | hasta 200.144 tokens | MIT | GGUF | Cabezal MTP donante de Qwen3.6-35B-A3B; validado en RTX 5060 Ti |
| Ornith-1.5-35B-A3B (modelo base) | 35,5 B (MoE) | no disponible | no disponible | safetensors | Pesos originales; cabezal MTP nativo con menor tasa de aceptación (34-41 %) |
| Qwen/Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | no disponible | Fuente del cabezal MTP donante; misma familia arquitectónica |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. Las alternativas de otros fabricantes con tamaño similar no se detallan en la documentación de la release.

## Limitaciones y advertencias

- El cabezal MTP incluido no es el nativo del modelo base, sino un injerto de Qwen/Qwen3.6-35B-A3B. Aunque el autor reporta mejores tasas de aceptación, se trata de una modificación no oficial del modelo original.
- La cuantización Q2_K-AllGPU emplea una receta agresiva (expertos enrutados a Q2_K, embeddings y salida a Q5_K, atención a Q4_K) que puede degradar la calidad frente a Q4_K_M; el autor no publica evaluaciones de calidad por variante.
- Las velocidades declaradas se midieron en un único sistema (RTX 5060 Ti, Ryzen 9 5950X, 64 GB RAM) y con un fork específico de llama.cpp; no son extrapolables a otro hardware o builds.
- El proceso de cuantización requirió `--prune-layers 40` por un fallo del cuantizador en arquitecturas MoE+nextn; otras herramientas de cuantización podrían no reproducir el resultado.
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni evaluaciones de seguridad del modelo base.
- La licencia MIT del repositorio de cuantización no necesariamente coincide con la licencia de los pesos del modelo base; conviene verificar la licencia upstream antes de uso comercial.
- El repositorio tiene un volumen de descargas bajo (217) y pocos likes (8), por lo que la validación por parte de la comunidad es limitada.
- No se han publicado resultados de benchmarks académicos en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/offmonreal/Ornith-1.5-35B-MaxQuality-MTP-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo donante del cabezal MTP: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Fork de llama.cpp utilizado: https://github.com/TheTom/llama-cpp-turboquant
- Ko-fi del autor: https://ko-fi.com/I0U227MY23
