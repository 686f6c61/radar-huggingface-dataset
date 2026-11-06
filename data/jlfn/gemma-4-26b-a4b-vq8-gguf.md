# Jlfn/gemma-4-26b-a4b-vq8-gguf

## Resumen
Gemma 4 26B A4B VQ GGUF es una conversión cuantizada en formato GGUF personalizado del modelo Gemma 4 26B A4B, un transformer de mezcla de expertos (MoE) con 26 mil millones de parámetros nominales y aproximadamente 4 mil millones activos por token. La publica el usuario Jlfn en Hugging Face y emplea una familia de tipos de tensor propia (GVQ1, GVBC, GVR8) bajo la arquitectura `gemma4_vq`, versión de formato 2, que no es legible por llama.cpp, Ollama ni Transformers estándar. El objetivo es comprimir el modelo completo, incluyendo su ventana nativa de 262.144 tokens, en menos de 10 GiB mediante cuantización vectorial de los expertos enrutados.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de compresión agresiva: los expertos enrutados se almacenan como índices de cuantización vectorial de 8 dimensiones con un libro principal de 8.192 entradas (índice de 13 bits) y un libro residual de 256 entradas (índice de 8 bits), lo que resulta en 2,6388 bits por peso en los expertos. Por otro, advierte de una limitación práctica severa: el artefacto exige un runtime que implemente el formato, y no incluye la torre de visión ni la parte de audio pese a que `config.json` las declara.

El repositorio tiene 10,7 GB y se distribuye en tres partes GGUF independientes: tronco (8,00 GiB, residente), tabla de embeddings (1,38 GiB, leída por filas desde SSD) y un drafter MTP opcional (0,58 GiB). No se han publicado métricas de calidad, perplejidad ni benchmarks.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (sliding-window y atención completa); arquitectura GGUF `gemma4_vq`, versión de formato 2 |
| Parametros totales | 24.494.944.286 pesos lógicos en el tronco (26B nominales de la familia); el conteo de safetensors reportado en Hugging Face es 738.197.504, correspondiente probablemente a un subconjunto o al drafter |
| Parametros activos | Aproximadamente 4B por token (top-8 de 128 expertos); no se detalla el desglose exacto |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GVQ1, GVBC, GVR8 (cuantización vectorial de expertos); Q4_K (175 tensores, 4,5 bits/peso); Q8_0 (30 tensores, 8,5 bits/peso); BF16 (391 tensores, 16 bits/peso); media del tronco 2,7993 bits por peso lógico |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF personalizado en tres partes (`gemma4-vq8-trunk.gguf`, `gemma4-vq8-embedding.gguf`, `gemma4-vq8-mtp.gguf`) más `release.json`, `files.json` y `config.json` |

## Arquitectura y entrenamiento
El modelo base es un transformer MoE de 30 capas: 25 con atención de ventana deslizante (1.024 tokens) y 5 con atención completa. La dimensión oculta es 2.816, con 16 cabezas de consulta, 8 cabezas KV en las capas deslizantes y 2 cabezas KV globales en las capas completas. La dimensión de cabeza es 256 en las deslizantes y 512 en las globales. El FFN experto tiene dimensión 704 y hay 128 expertos con top-8; el FFN denso tiene 2.112. El vocabulario es de 262.144 tokens con embeddings atados, logit soft-capping de 30 y RoPE theta 10.000 en capas deslizantes y theta proporcional 1.000.000 con factor parcial 0,25 en las completas. Las capas de atención completa usan `attention_k_eq_v` (sin proyección v).

La innovación de esta conversión es la cuantización vectorial de los expertos enrutados. Cada matriz de experto se representa como un flujo de índices VQ de 8 dimensiones sobre un par de libros de código por pila de expertos: 60 pilas (30 capas MoE × `down_proj` y `gate_up_proj`), cada una con un libro principal de forma 8 × 8.192 y uno residual de 8 × 256, un byte por entrada y 4.055.040 bytes de libros en total. Los 120 libros se nombran en los metadatos `gemma4_vq.codebooks` y `gemma4_vq.residuals` mapea cada matriz a su tensor residual. El router, todas las normas, los escalares de capa y los embeddings permanecen en BF16; las matrices densas y de atención son Q4_K salvo las 30 proyecciones down densas, que son Q8_0. No se documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades
- Generación de texto con ventana de contexto nativa de 262.144 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Razonamiento y matemáticas: capacidades propias de la familia Gemma 4, no verificadas en este artefacto.
- Generación de código: presumible por la familia base, sin evaluación publicada en este repositorio.
- Decodificación especulativa mediante el drafter MTP opcional de 4 capas y 419.711.236 pesos, que acelera la generación cuando el runtime lo habilita.
- Tokenizer y plantilla de chat embebidos en el tronco: 262.144 tokens, 514.906 merges, BPE estilo GPT-2 con pre-tokenizer `gemma4` y plantilla de chat de 18.681 bytes.
- Capacidades multimodales (visión y audio) declaradas en `config.json`, pero no incluidas en el artefacto: es una release solo de texto.
- Soporte de tool calling y agentes: no documentado en la información disponible.

## Casos de uso
- Procesamiento de documentos extensos: con 262.144 tokens de contexto se puede ingerir un libro técnico, un expediente completo o un repositorio de código en una sola pasada sin truncar, algo inviable en modelos con ventanas de 8K o 32K.
- Analítica de conversaciones de atención al cliente: el modelo puede mantener contexto de múltiples interacciones previas y resumir hilos largos, siempre que se despliegue un runtime que implemente `gemma4_vq`.
- Investigación sobre cuantización vectorial: el repositorio sirve como referencia reproducible para estudiar el impacto de VQ de 8 dimensiones con libros principal y residual en la calidad de un MoE, comparando contra cuantizaciones escalares convencionales.
- Despliegue en hardware con poca VRAM: el tronco residente de 8,00 GiB más la tabla de embeddings leída desde SSD permite servir un modelo de 26B nominales en GPUs de 12-16 GB, a costa de depender del almacenamiento para los embeddings.
- Generación de código asistida en local: si el runtime lo soporta, un pipeline de autocompletado o revisión de parches podría ejecutarse en una estación de trabajo con una RTX 4090, aunque no hay evaluación de calidad publicada.
- Decodificación especulativa en producción: el drafter MTP opcional permite integrar decodificación especulativa en un servidor de inferencia propio para reducir la latencia por token generado.
- Prototipado de agentes con contexto largo: la ventana de 262K facilita mantener memoria de trabajo extensa en tareas multi-paso, condicionado a la implementación del runtime.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el artefacto no incluye mediciones de calidad, perplejidad ni benchmarks.

## Requisitos de hardware
- VRAM para el tronco: 8,00 GiB residentes obligatorios (`gemma4-vq8-trunk.gguf`).
- Embeddings: 1,38 GiB en BF16, leídos por filas desde SSD; no requieren residencia completa en VRAM, pero introducen latencia dependiente del almacenamiento.
- Drafter MTP: 0,58 GiB adicionales si se habilita la decodificación especulativa.
- Total en disco: 9,95 GiB para las tres partes.
- GPU recomendadas: no hay recomendaciones oficiales; por tamaño, una RTX 4090 (24 GB) o RTX 4080 (16 GB) podrían alojar el tronco con margen para caché KV, y GPUs de datacenter como A100 o H100 no aportan ventaja específica sin soporte del runtime.
- Cabe en GPU de consumo: sí, el tronco de 8 GiB cabe en GPUs de 12 GB o más, siempre que el runtime implemente el formato.
- Opciones de despliegue: ninguna estándar. llama.cpp, Ollama y Transformers no leen el formato; se requiere un runtime que implemente `gemma4_vq` versión 2. `release.json` es el punto de entrada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 26B A4B VQ GGUF (este) | 26B nominales, ~4B activos | 262.144 | GGUF personalizado `gemma4_vq` | no disponible | Hugging Face, 0 descargas |
| Gemma 4 26B A4B (base, sin cuantizar) | 26B nominales, ~4B activos | 262.144 | safetensors | no disponible | Referenciado en `release.json` por revisión, no enlazado en la información |
| Cuantizaciones GGUF estándar de MoE de tamaño similar | Variable | Variable | GGUF estándar (Q4_K_M, Q5_K_M, etc.) | Variable | Amplia, compatible con llama.cpp y Ollama |

La ventaja principal frente a una cuantización GGUF estándar es el tamaño: 9,95 GiB para un modelo de 26B con contexto de 262K, gracias a los 2,6388 bits por peso en los expertos. La desventaja es la incompatibilidad con el ecosistema estándar.

## Limitaciones y advertencias
- Formato propietario: llama.cpp, Ollama y Transformers no pueden cargar el modelo; sin un runtime que implemente `gemma4_vq` v2 el artefacto es inutilizable.
- Solo texto: no incluye torre de visión ni parte de audio, aunque `config.json` declare configuración de visión y campos de token de audio.
- Sin métricas de calidad: no hay perplejidad, benchmarks ni evaluaciones publicadas; se desconoce la degradación introducida por la cuantización vectorial de 2,6388 bits por peso en los expertos.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: no se documenta el soporte multilingüe del artefacto.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluaciones no puede cuantificarse.
- Dependencia del SSD: la tabla de embeddings se lee por filas desde almacenamiento, lo que puede dominar la latencia en despliegues con disco lento.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria del artefacto.
- El conteo de parámetros de safetensors (738.197.504) no coincide con los 24.494.944.286 pesos lógicos del tronco; conviene verificar la integridad con `files.json` antes de usarlo.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Jlfn/gemma-4-26b-a4b-vq8-gguf
- Punto de entrada del release: `release.json` dentro del repositorio
- Manifiesto de archivos con tamaños y SHA-256: `files.json` dentro del repositorio
- Configuración del checkpoint: `config.json` dentro del repositorio
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
