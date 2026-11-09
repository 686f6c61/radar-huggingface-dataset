# mavis-ai/Qwen3.8-27B-Q4T

## Resumen

Qwen3.8-27B-Q4T es una derivada cuantizada del modelo multimodal denso Qwen3.8-27B, publicada por mavis-ai como parte del ecosistema R.E.V.I.S., un "Cognitive OS" local para IA multiagente en Mac. No es un fine-tune ni incorpora entrenamiento alguno: se trata de una conversión data-free del checkpoint oficial a un formato propietario denominado Q4T, que combina proyecciones MLP codificadas en trellis (4 bits, codebook MCG estilo EXL3) con proyecciones de atención y Gated DeltaNet en 6 bits afines. El modelo base es denso, con 64 capas (48 Gated DeltaNet + 16 de atención completa), hidden size 5120, MLP intermedio de 17408 y vocabulario de 248320 tokens.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización poco habitual (trellis-coded con rotación Hadamard y vectores de signo por canal) que busca reducir el error de reconstrucción sin emplear conjuntos de calibración. Por otro, advierte de una restricción crítica: los tensores `.trellis`, `.suh` y `.svh` requieren kernels de decodificación específicos, por lo que el modelo no funciona en mlx-lm, mlx-vlm, transformers ni vLLM, sino únicamente en R.E.V.I.S. v1.3.0 o superior sobre Apple Silicon.

El paquete incluye tres drafters de decodificación especulativa (DFlash 2 Q8 y MTP Draft-Q8 con ProposalHead) que suman 3,41 GB adicionales, y declara 14.526.483.696 parámetros totales según los safetensors, un dato llamativamente inferior al "27B" del nombre y que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso: 48 capas Gated DeltaNet + 16 capas de atención completa; torre de visión multimodal |
| Parametros totales | 14.526.483.696 (según safetensors); el nombre comercial indica 27B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262144 tokens |
| Tipos de cuantizacion | Q4T: MLP en trellis K4 (4 bits, codebook MCG EXL3, receta v3-gss110); proyecciones en 6 bits afines grupo 64; embeddings y LM head en 8 bits afines grupo 64; tensores BF16 conservados (in_proj_a/b, conv1d, A_log, dt_bias, normas y torre de visión) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model-core + 8 shards trellis + drafts); requiere motor R.E.V.I.S. |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que alterna capas Gated DeltaNet (estado recurrente lineal) con capas de atención completa, un patrón habitual en la familia Qwen para reducir el coste del contexto largo manteniendo capacidad de atención global. El hidden size es 5120, el MLP intermedio 17408 y el vocabulario 248320 tokens, con una ventana de contexto declarada de 262144 tokens. La pipeline declarada es image-text-to-text, e incluye torre de visión en BF16, por lo que acepta entradas de texto, imagen y vídeo.

Sobre el entrenamiento del modelo base no se aporta información en la documentación disponible (número de tokens, composición del dataset, RLHF/DPO). Lo que sí se detalla es el proceso de cuantización de esta derivada: es data-free, sin conjunto de calibración, sin Hessian rounding, sin importance matrix y sin quantization-aware training. El MLP de las 64 capas (192 tensores) se codifica en trellis a 4 bits con una rotación Hadamard de 128 puntos y vectores de signo por canal, minimizando el MSE sobre pesos rotados. Las proyecciones Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`) y de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) se cuantizan a 6 bits afines con `mx.quantize` en redondeo al más cercano desde la fuente BF16. Una regla denominada R1 fuerza a 8 bits cualquier tensor cuyo error relativo MSE supere 1,5 veces la mediana de su clase, lo que afecta al `out_proj` de Gated DeltaNet en las capas 0 y 1 y al `o_proj` de atención en la capa 3. La innovación destacable del paquete es la inclusión de drafters de decodificación especulativa (DFlash 2 y MTP con ProposalHead) para acelerar la generación.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat incluida (`chat_template.jinja`).
- Procesamiento multimodal de imagen y texto, y de vídeo según la pipeline y los ficheros de preprocesado incluidos.
- Razonamiento y contexto largo: ventana declarada de 262144 tokens.
- Decodificación especulativa integrada mediante drafters DFlash 2 y MTP, orientada a reducir latencia en Apple Silicon.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: el modelo se distribuye como componente de un sistema multiagente (R.E.V.I.S.), pero no se detallan capacidades específicas de agentes.
- Modo thinking: no disponible.

## Casos de uso

- Asistentes locales multiagente en Mac: el paquete está diseñado explícitamente para R.E.V.I.S., un sistema operativo cognitivo local, de modo que encaja en flujos donde la privacidad impide enviar datos a la nube y el usuario dispone de Apple Silicon con suficiente memoria unificada.
- Análisis de documentos e imágenes en local: la torre de visión en BF16 y la ventana de 262144 tokens permiten procesar lotes de documentos escaneados o capturas junto con instrucciones extensas sin truncar el contexto.
- Procesamiento de vídeo para resumen o indexación: la pipeline image-text-to-text y los ficheros `video_preprocessor_config.json` habilitan tareas de descripción o extracción de información de clips.
- Generación aumentada por recuperación (RAG) sobre corpus largos: el contexto de 262144 tokens permite incorporar muchos fragmentos recuperados en una sola pasada, útil para bases de conocimiento internas en estaciones de trabajo Mac.
- Transcripción y explotación de reuniones o clases: combinando entrada de audio transcrito externamente y vídeo, el modelo puede generar actas o resúmenes estructurados en local.
- Prototipado de investigación en cuantización: el formato Q4T con trellis, la política de cuantización documentada y los manifiestos (`quantization_policy.json`, `q4t_manifest.json`) sirven como caso de estudio reproducible para evaluar técnicas data-free frente a GPTQ/AWQ.
- Evaluación de decodificación especulativa: los drafters DFlash 2 y MTP permiten medir ganancias de throughput en hardware Apple frente a decodificación autoregresiva estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos principales ocupan 18,13 GB decimales (16,9 GiB); sumando los drafters (3,41 GB) el paquete completo ronda 21,6 GB, coherente con el tamaño del repositorio.
- Caché KV en runtime: 8 bits, lo que reduce el coste de contextos largos, aunque no se especifica el factor de compresión exacto.
- GPU recomendadas: el modelo está pensado para Apple Silicon; no se declara compatibilidad con A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: probablemente en Mac con memoria unificada de 32 GB o más, aunque el fabricante no publica requisitos mínimos oficiales.
- Opciones de despliegue: exclusivamente R.E.V.I.S. v1.3.0 o superior, que incorpora los kernels de decodificación trellis. No es compatible con vLLM, llama.cpp, Ollama, TGI, mlx-lm, mlx-vlm ni transformers.
- Latencia y throughput: no disponibles; la presencia de drafters sugiere mejoras, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Despliegue |
|---|---|---|---|---|---|
| mavis-ai/Qwen3.8-27B-Q4T | 14,5B (safetensors) | 262144 | Texto, imagen, vídeo | Apache 2.0 | Solo R.E.V.I.S. (Apple Silicon) |
| Qwen/Qwen3.8-27B (base) | 27B (según nombre) | 262144 | Texto, imagen, vídeo | Apache 2.0 | transformers, vLLM, mlx-lm, mlx-vlm |
| mlx-community/Qwen3.8-27B-bf16 | 27B (según nombre) | 262144 | Texto, imagen, vídeo | Apache 2.0 | mlx-lm / mlx-vlm |
| Otras cuantizaciones GGUF/AWQ del mismo base | No disponible | 262144 | Texto, imagen, vídeo | Apache 2.0 | llama.cpp, vLLM, etc. |

La comparación directa con alternativas de cuantización estándar (GGUF Q4_K_M, AWQ, GPTQ) no puede completarse porque no se publican métricas de calidad ni de velocidad para esta derivada.

## Limitaciones y advertencias

- Compatibilidad restringida: los tensores trellis requieren kernels propietarios; el modelo no arranca en las herramientas habituales del ecosistema (transformers, vLLM, mlx-lm, llama.cpp). Esto limita gravemente su portabilidad y su uso en producción fuera de R.E.V.I.S.
- Discrepancia de parámetros: el nombre indica 27B pero los safetensors declaran 14.526.483.696 parámetros; conviene verificar la cifra antes de dimensionar infraestructura.
- Cuantización data-free: al no usar calibración, la calidad puede degradarse en capas sensibles; la regla R1 mitiga parcialmente el problema, pero no hay evaluaciones publicadas que lo cuantifiquen.
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos específicos de esta derivada.
- Sesgos: no documentados en la información disponible.
- Idiomas: no se declaran idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- Uso comercial: la licencia Apache 2.0 lo permite, pero mavis-ai declara no tener derechos sobre el modelo subyacente y remite a la licencia del Qwen3.8-27B original; conviene revisar esa licencia antes de explotarlo comercialmente.
- Drafters y decodificación especulativa: dependen del motor R.E.V.I.S.; sin él, no aportan ventaja y el paquete completo no es utilizable.
- Documentación escasa: sin benchmarks, sin requisitos mínimos de hardware oficiales y sin guía de integración más allá de la versión de R.E.V.I.S.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mavis-ai/Qwen3.8-27B-Q4T
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Conversión BF16 MLX de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-bf16
- Web oficial de R.E.V.I.S.: https://mavis-ai.co.jp/revis/
- Actualizaciones en X: https://x.com/mavis_ai_jp
- Paper de referencia (arXiv:2602.06036): https://arxiv.org/abs/2602.06036
