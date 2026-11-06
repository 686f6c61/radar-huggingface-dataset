# jancirnodziewiaty/gemma-4-E4B-it-oQ5e-fp16-mtp

## Resumen

`gemma-4-E4B-it-oQ5e-fp16-mtp` es una cuantización mixta del modelo Gemma 4 E4B instruct, publicada por el usuario jancirnodziewiaty en Hugging Face. El checkpoint conserva 8.019.880.782 parámetros lógicos distribuidos entre el modelo de lenguaje (7.469B), un codificador de visión (0.167B), un codificador de audio (0.305B) y una cabeza MTP (Multi-Token Prediction) de 0.079B. La cuantización se ha realizado con la herramienta oQ de oMLX v0.7.3, que asigna precisión por tensor en lugar de aplicar un esquema uniforme.

El resultado es un checkpoint de 6.864 GiB de almacenamiento con una media efectiva de 7.352 bits por peso: la mayor parte de los pesos (77,96%) quedan en affine 5-bit con grupo de 64, mientras que un 13,43% se mantiene en 6-bit, un 1,73% en 8-bit y un 5,89% en FP32 (probablemente capas de normalización y sesgos). El formato es MLX, lo que lo hace directamente ejecutable en Apple Silicon mediante la librería mlx del ecosistema de Apple.

La relevancia de esta ficha es doble: por un lado, documenta una variante multimodal (texto, visión y audio) de la familia Gemma 4 en un tamaño que cabe en memoria unificada de equipos de consumo; por otro, ilustra una técnica de cuantización mixta con cabeza MTP, útil para decodificación especulativa en hardware Apple. No obstante, el autor no ha publicado información sobre licencia, idiomas ni pipeline, y el modelo no cuenta con descargas ni validación de la comunidad en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + audio) con cabeza MTP; detalles de capas y atención no disponibles |
| Parametros totales | 8.019.880.782 (8.020B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64 (77,964%), affine 6-bit grupo 64 (13,426%), affine 8-bit grupo 64 (1,732%), BF16 (0,979%), FP16 (0,007%), FP32 (5,888%), I64 (0,003%); media efectiva 7,352 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

Desglose por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 7,469B | 5,322 GB / 4,957 GiB |
| Visión | 0,167B | 0,669 GB / 0,623 GiB |
| Audio | 0,305B | 1,219 GB / 1,136 GiB |
| Cabeza MTP | 0,079B | 0,159 GB / 0,148 GiB |
| Total | 8,020B | 7,370 GB / 6,864 GiB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Gemma 4 E4B (número de capas, tipo de atención, dimensión oculta, mecanismo de atención). Lo que sí se deduce de la model card es que se trata de un transformer multimodal con tres torres diferenciadas: lenguaje, visión y audio, más una cabeza MTP (Multi-Token Prediction) de 0,079B parámetros. La presencia de esta cabeza sugiere que el modelo base fue entrenado con un objetivo auxiliar de predicción de múltiples tokens, técnica habitual para habilitar decodificación especulativa o *self-speculation* en inferencia.

El proceso de cuantización es el elemento técnico mejor documentado. oQ (oMLX v0.7.3) aplica precisión mixta por tensor: la mayoría de las matrices de pesos del transformer quedan en affine 5-bit con grupo de 64, pero se preservan en 6-bit y 8-bit aquellas capas más sensibles, y se mantienen en FP32 los parámetros que requieren precisión completa (normalizaciones, posiblemente embeddings o componentes de la cabeza MTP). El resultado es una media de 7,352 bits/peso, ligeramente por encima de los 5 bits nominales del esquema dominante. No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si hubo RLHF, DPO o ajuste por preferencias.

## Capacidades

- Generación de texto instruccional: el sufijo `it` indica ajuste para seguir instrucciones en formato conversacional.
- Procesamiento de visión: incluye un codificador visual de 0,167B parámetros, por lo que puede recibir imágenes además de texto.
- Procesamiento de audio: incluye un codificador de audio de 0,305B parámetros, lo que habilita entrada de audio (voz o sonido) en el pipeline.
- Predicción multi-token (MTP): la cabeza dedicada de 0,079B parámetros permite generar varios tokens por paso, lo que puede acelerar la decodificación en hardware MLX.
- Capacidades multilingües: no disponible; el autor no declara idiomas soportados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo *thinking* explícito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint en formato MLX y 6,864 GiB de almacenamiento permite ejecutar un modelo multimodal de 8B en Macs con memoria unificada de 16 GB o superior mediante la librería `mlx`, sin necesidad de GPU dedicada.
- Prototipado de asistentes multimodales en local: al incluir torres de visión y audio, se puede construir un asistente que reciba una imagen o un clip de audio y genere una respuesta textual, todo en el mismo dispositivo y sin enviar datos a la nube.
- Investigación sobre cuantización mixta: el desglose por bits y por componente permite estudiar el impacto de mantener ciertas capas en 6, 8 o 32 bits frente a una cuantización uniforme de 4 o 5 bits, comparando perplejidad y calidad de generación.
- Evaluación de decodificación especulativa: la cabeza MTP incluida en el checkpoint permite experimentar con *self-speculative decoding* en MLX, midiendo la aceleración frente a decodificación autoregresiva estándar.
- Aplicaciones de accesibilidad en dispositivo: transcripción y descripción de audio o imágenes para usuarios con discapacidad visual o auditiva, ejecutadas localmente por privacidad.
- Docencia y demos de modelos multimodales: el tamaño reducido y el formato MLX facilitan su uso en talleres y cursos sobre IA open source en equipos de estudiante, sin infraestructura de servidor.
- Fine-tuning ligero o *prompt engineering* sobre Gemma 4: al ser una variante cuantizada del modelo instruct, sirve como base para probar prompts y adaptadores LoRA antes de desplegar en versiones de mayor precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta el esquema de cuantización y el desglose de almacenamiento; no incluye MMLU, HumanEval, GSM8K, MMMU ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: aproximadamente 7,4 GB solo para los pesos (6,864 GiB), más overhead de activaciones y KV cache; en la práctica se recomienda un mínimo de 12-16 GB de memoria unificada.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son los chips Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No es un checkpoint pensado para CUDA.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: cabe en Macs con 16 GB o más de memoria unificada. En GPUs NVIDIA de consumo (RTX 4090, 24 GB) requeriría conversión previa a otro formato, ya que MLX no ejecuta sobre CUDA de forma nativa.
- Opciones de despliegue: librería `mlx` de Apple y el ecosistema oMLX (oQ). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gemma-4-E4B-it-oQ5e-fp16-mtp (este) | 8,020B | no disponible | Texto, visión, audio, MTP | MLX safetensors | no disponible | Hugging Face, 0 descargas |
| Gemma 3 4B IT (referencia de familia anterior) | ~4B | 128K (según documentación pública de Google) | Texto, visión | safetensors, GGUF | Gemma Terms of Use | Amplia |
| Qwen2.5-VL 7B Instruct | ~7-8B | 128K (según documentación pública) | Texto, visión | safetensors, GGUF | Apache 2.0 (según documentación pública) | Amplia |
| Llama 3.2 11B Vision Instruct | ~11B | 128K (según documentación pública) | Texto, visión | safetensors | Llama Community License | Amplia |

Nota: los datos de los modelos comparativos provienen de documentación pública general y no de la información proporcionada en esta consulta; se incluyen solo como referencia orientativa. No se dispone de benchmarks del modelo objeto de la ficha para comparar rendimiento real.

## Limitaciones y advertencias

- Licencia no declarada: el autor no especifica licencia en la model card ni en los metadatos de Hugging Face. Antes de cualquier uso comercial es imprescindible contactar con el autor y verificar la licencia del modelo base Gemma 4, que habitualmente impone términos de uso de Google.
- Modelo derivado y cuantizado: al ser una cuantización mixta de un modelo base, puede heredar sesgos del Gemma 4 original y añadir degradación por la cuantización, especialmente en tareas de razonamiento numérico o código.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; como todo modelo generativo, puede producir afirmaciones incorrectas con aparente seguridad.
- Idiomas no declarados: se desconoce si conserva el multilingüismo del Gemma 4 original o si la cuantización afecta de forma desigual a idiomas distintos del inglés.
- Contexto desconocido: no se documenta la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- Formato MLX exclusivo: no es directamente utilizable en CUDA, ROCm ni en la mayoría de servidores de inferencia estándar; requiere hardware Apple Silicon o conversión manual.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que el checkpoint haya sido probado por terceros.
- Cabeza MTP y decodificación especulativa: su correcto funcionamiento depende de que el runtime MLX implemente el mecanismo; no se documenta cómo activarla.
- Fecha de creación futura (2026-11-02): conviene verificar la integridad del repositorio y la procedencia del checkpoint antes de confiar en él en producción.

## Enlaces

- Hugging Face: https://huggingface.co/jancirnodziewiaty/gemma-4-E4B-it-oQ5e-fp16-mtp
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos específicos de este checkpoint.
