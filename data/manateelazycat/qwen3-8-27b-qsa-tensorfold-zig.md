# manateelazycat/Qwen3.8-27B-QSA-TensorFold-Zig

## Resumen

Qwen3.8-27B-QSA-TensorFold-Zig es una adaptación experimental del modelo multimodal Qwen/Qwen3.8-27B publicada por el usuario manateelazycat en Hugging Face. El modelo parte de los pesos oficiales de Qwen3.8-27B (27.833.862.896 parámetros, aproximadamente 27,8 mil millones) y añade un mecanismo denominado Qwen Sparse Attention (QSA), un indexador aprendido que selecciona contexto en bloques de cuatro tokens sobre las 16 capas de atención completa del backbone. El resto de la arquitectura, incluyendo las 48 capas con Gated DeltaNet, el codificador visual, el proyector y los pesos MTP, permanece sin cambios respecto al checkpoint original.

La propuesta técnica es relevante porque introduce atención dispersa aprendida sin comprimir la caché KV: todas las entradas originales se conservan y el indexador solo decide qué bloques atender en cada capa completa. Según la model card, el entrenamiento de los indexadores consistió en 300 pasos con longitud 16.384 y una mezcla multimodal del 50 %, incluyendo tareas sintéticas de OCR, tablas y formas geométricas. El resultado es un modelo de referencia para investigar eficiencia de atención en modelos multimodales de escala media.

El repositorio tiene un carácter claramente investigador: cero descargas, cero likes, pesos en bf16 con código personalizado (`qwen3_5_qsa`) y un wrapper de Transformers descrito por el propio autor como referencia de corrección, no como vía de despliegue con aceleración nativa. Para producción, el autor remite a una serie GGUF separada y a un runtime propio basado en llama.cpp modificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal con 16 capas de atención completa (con indexadores QSA) y 48 capas Gated DeltaNet; codificador visual y proyector; cabezas MTP |
| Parametros totales | 27.833.862.896 (27,8 B) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | entrenamiento de indexadores a 16.384 tokens; longitud máxima nativa no disponible |
| Tipos de cuantizacion | bf16 (repo principal); GGUF Q8_0, UD-Q4_K_M, UD-Q5_K_M y UD-Q6_K en la serie separada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) con código personalizado; GGUF en la serie cuantizada |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-27B: un transformer híbrido con 48 capas Gated DeltaNet y 16 capas de atención completa, más un codificador visual y un proyector para entrada image-text-to-text, y cabezas MTP (multi-token prediction). La adaptación QSA añade 52.434.944 parámetros FP32 de indexadores a las 16 capas de atención completa. Cada indexador selecciona contexto en bloques de cuatro tokens con un presupuesto fijo K=2.048 más el bloque actual, lo que a 16k de contexto equivale aproximadamente a un 12,5 % de los bloques; el autor aclara que esa proporción no es constante en todas las longitudes. No se trata de compresión de caché KV: todas las entradas KV originales se mantienen.

El entrenamiento documentado se limita a los indexadores: 300 pasos a longitud 16.384 con una mezcla 50 % multimodal y tareas sintéticas de OCR, tablas y formas. El backbone, el codificador visual, el proyector y los pesos MTP no se modificaron, y los 18 shards originales son idénticos byte a byte al checkpoint oficial. La model card incluye un script `restore_original.py` que verifica los hashes LFS y reconstruye un snapshot denso estándar. Las variantes GGUF de Unsloth reutilizan 866 tensores originales sin recuantizar y añaden los 80 tensores FP32 de los indexadores.

## Capacidades

- Generación de texto conversacional multi-turno sobre el backbone Qwen3.8-27B.
- Entrada multimodal image-text-to-text: conversaciones con imágenes y, según la model card, también vídeo en el runtime nativo.
- Razonamiento y matemáticas heredados del modelo base (sin benchmarks publicados en esta ficha).
- Generación de código y soporte de tool calling: no confirmado explícitamente en la información disponible; debe verificarse contra la documentación del modelo base.
- Ejecución con MTP de hasta dos tokens borrador en el runtime nativo de llama.cpp modificado.
- Reutilización de caché de prefijo en el runtime nativo.
- Soporte de atención dispersa nativa QSA con M-RoPE únicamente en el runtime propio; el wrapper de Transformers usa máscara SDPA para texto y atención densa para imagen y vídeo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en atención dispersa: el modelo sirve como banco de pruebas para medir el efecto de indexadores aprendidos sobre las capas de atención completa, comparando la ruta QSA con la ruta densa original mediante el script de restauración incluido.
- Evaluación de eficiencia en contexto largo: con indexadores entrenados a 16.384 tokens y presupuesto K=2.048, es adecuado para experimentos que midan latencia y calidad al variar la longitud de contexto en cargas multimodales.
- Procesamiento de documentos con OCR y tablas: la mezcla de entrenamiento incluyó tareas sintéticas de OCR y tablas, por lo que el modelo es un candidato para probar extracción de información en imágenes de documentos dentro de un pipeline de investigación.
- Análisis de imágenes y vídeo en el runtime nativo: el motor basado en llama.cpp modificado soporta texto, imagen y vídeo con QSA y M-RoPE, lo que permite prototipar asistentes visuales en local.
- Reproducción de resultados académicos: el repositorio incluye la instantánea del código de entrenamiento en `research/` y los indexadores originales en `indexers/qsa_indexers.pt`, lo que facilita replicar los 300 pasos de ajuste.
- Despliegue en hardware de consumo con GGUF: las variantes UD-Q4_K_M (16,67 GB) y UD-Q5_K_M (19,98 GB) permiten ejecutar el modelo en GPUs de consumo con suficiente VRAM, usando el runtime propio en lugar de llama.cpp estándar.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son comprobaciones de referencia en bf16 comparando la ruta QSA con la ruta densa original. No son resultados de calidad de la variante Q8_0 nativa.

| Prueba | Denso original | QSA | Comparación observada |
|---|---:|---:|---|
| Perplejidad de texto sobre 32.766 tokens (menor es mejor) | 7,072960 | 7,071384 | Ratio QSA/denso 0,99978 |
| DocVQA construido, 50 ítems de cuatro opciones | 50/50 | 50/50 | 100 % de la puntuación densa en esta prueba |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 56 GB solo para pesos, más caché KV y activaciones; requiere múltiples GPUs o una GPU de 80 GB con cuantización parcial.
- VRAM estimada en GGUF: unos 17 GB para UD-Q4_K_M, 20 GB para UD-Q5_K_M, 22 GB para UD-Q6_K y 29 GB para Q8_0, más overhead de contexto y caché.
- GPUs recomendadas: A100 80 GB o H100 para la versión bf16; RTX 4090 (24 GB) o RTX 3090 para las variantes UD-Q4_K_M y UD-Q5_K_M.
- Cabe en GPU de consumo: sí, con las variantes GGUF UD-Q4_K_M y UD-Q5_K_M en GPUs de 24 GB, y potencialmente Q6_K en GPUs de 32 GB.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `attn_implementation="sdpa"` solo como referencia de corrección; para rendimiento, el runtime propio `qsa27b-runtime` del repositorio kuraneko1/Qwen3.8-27B-QSA-llama.cpp. llama.cpp estándar no soporta estos archivos.
- Latencia y throughput: no disponibles en la información proporcionada.
- Entorno de referencia: torch 2.14.1+cu126 y torchvision 0.29.1+cu126 para el wrapper Python; CUDA 12.9 para el runtime nativo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| Qwen3.8-27B-QSA-TensorFold-Zig | 27,8 B | entrenado a 16k | Apache 2.0 | repo de investigación, 0 descargas | Añade indexadores QSA; requiere runtime propio |
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible | Apache 2.0 | checkpoint oficial | Modelo denso original, sin QSA |
| Qwen3.8-27B-QSA-BF16 (higa2515) | 27,8 B | entrenado a 16k | Apache 2.0 | repo con serie GGUF asociada | Misma adaptación QSA con conversiones GGUF publicadas |
| Unsloth Qwen3.8-27B-GGUF | 27,8 B | no disponible | Apache 2.0 | GGUF de Unsloth | Tensores base reutilizados por las variantes QSA |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- El wrapper de Transformers es solo una referencia de corrección: no implementa MTP ni kernels dispersos nativos, por lo que no ofrece la aceleración que justifica QSA.
- llama.cpp estándar no carga estos archivos; es obligatorio usar el runtime modificado del repositorio kuraneko1/Qwen3.8-27B-QSA-llama.cpp.
- El código personalizado (`qwen3_5_qsa`) requiere `trust_remote_code=True`; debe auditarse antes de habilitarlo en entornos de producción.
- La proporción del 12,5 % de contexto seleccionado corresponde a K=2.048 sobre 16k y no es constante en otras longitudes; las expectativas de eficiencia deben ajustarse por longitud.
- El entrenamiento de los indexadores fue corto (300 pasos) y con datos en parte sintéticos; el autor no publica evaluaciones estándar de calidad.
- Los resultados de perplejidad y DocVQA son comprobaciones de referencia en bf16, no de la variante Q8_0 nativa.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero heredados del modelo base Qwen3.8-27B.
- Idiomas soportados no especificados en la model card.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de un runtime no estándar y el estado experimental del repositorio (0 descargas, 0 likes) desaconsejan su uso en producción sin validación adicional.
- El repositorio ocupa 55,8 GB; conviene usar el script `restore_original.py` para recuperar el modelo denso si se necesita el checkpoint oficial.

## Enlaces

- Hugging Face: https://huggingface.co/manateelazycat/Qwen3.8-27B-QSA-TensorFold-Zig
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper QSA: https://arxiv.org/abs/2608.30320
- Repositorio del runtime: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp
- Guía de compilación: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp#build-from-source
- Guía de runtime: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp/blob/main/qsa27b/RUNTIME.md
- Serie GGUF QSA: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio BF16 de referencia QSA: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Licencia: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16/blob/main/LICENSE
- Perfil del autor en X: https://x.com/_ryu15_
