# shivrajgurjar/Arjuna-Wonder-27B

## Resumen

Arjuna Wonder 27B es una compresión matemática del modelo Qwen/Qwen3.8-27B publicada por el usuario shivrajgurjar en HuggingFace. No se trata de un modelo entrenado desde cero ni de un fine-tuning al uso: según la model card, es una reimplementación de los pesos del modelo base (27,23 mil millones de parámetros, 64 capas, torre de visión y módulo de predicción multi-token) comprimidos hasta 0,487 bits por parámetro mediante una descomposición sobre una retícula E8 de Gosset con "stripping" de valores atípicos previo a Krylov. El resultado declarado ocupa 1.623,42 MB (1,585 GiB) frente a los 55.563,07 MB (54,26 GiB) en BF16 del original, lo que supone una ratio de compresión de 34,2x.

La relevancia que reclama el autor es la de romper la barrera de tasa-distorsión de Shannon que hace colapsar la cuantización escalar por debajo de 1,5 bits por parámetro, manteniendo una similitud coseno de 0,999885 sobre validación no vista (error L2 relativo de 0,01359). Si esas cifras fuesen ciertas, permitirían ejecutar un modelo de 27B en 2x NVIDIA Tesla T4 (32 GB) con contexto de hasta 10M de tokens y más de 560 tok/s sostenidos.

Conviene señalar desde el principio que toda la información disponible procede exclusivamente de la model card del autor. El repositorio tiene 0 descargas y 0 likes, no incluye resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros), y la métrica principal reportada es de reconstrucción de pesos, no de calidad funcional del modelo. El tamaño real del repositorio (2,5 GB) tampoco coincide exactamente con el peso declarado de los pesos (1,585 GiB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas de atención lineal Gated DeltaNet + 16 capas de atención completa con compuertas, MLP SwiGLU, torre de visión y módulo de predicción multi-token (64 capas en total), según la model card |
| Parametros totales | 27,23 mil millones (según la model card) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Hasta 10M de tokens según el tag `10m-context` y la tabla de la model card; no se documenta el mecanismo ni se verifica |
| Tipos de cuantizacion | Compresión propietaria sub-bit a 0,487 bits/parámetro (retícula E8 de Gosset con descomposición holográfica Lie-Kronecker); no se ofrece GGUF, AWQ, GPTQ ni INT8/INT4 estándar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (para el repositorio; la licencia del modelo base Qwen/Qwen3.8-27B debe verificarse por separado) |
| Formato de pesos | PyTorch `.pt` en 18 shards (`arjuna-model-0000X-of-00018.pt`); requiere código de descompresión propio, no es safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura descrita corresponde a la del modelo base Qwen/Qwen3.8-27B: un transformer híbrido de 64 capas que combina 48 capas de atención lineal Gated DeltaNet con 16 capas de atención completa con compuertas, MLP SwiGLU, un vocabulario de 248.320 tokens, una torre de visión y un módulo de predicción multi-token. Arjuna Wonder no modifica ni reentrena esta topología: lo que hace es sustituir la representación de cada operador por una descomposición sobre una variedad "holográfica Lie-Kronecker" y una retícula de cosets E8 de cuatro pasadas piramidales diádicas, con un paso previo de eliminación de valores atípicos ("Pre-Krylov Super-Weight Outlier Stripping"). No se especifica en la información disponible qué datos de entrenamiento, RLHF, DPO u otras etapas de alineamiento se aplicaron, ni cuántos tokens se usaron; se asume que se heredan los del modelo base.

El resultado declarado es una compresión de 55.563,07 MB a 1.623,42 MB con similitud coseno de 0,999885 (mínimo 0,99927) y error L2 relativo de 0,01359 sobre validación no vista, verificado shard a shard en los 18 ficheros y las 64 capas. La model card presenta esta técnica como una alternativa que supera a INT8 en fidelidad (0,999810) con una fracción del espacio. No se aporta paper, repositorio de código de descompresión, ni descripción formal del algoritmo más allá de los nombres de las técnicas; tampoco se detalla cómo se implementa la ventana de 10M tokens ni qué kernels específicos para SM 75 (Turing) se requieren.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.8-27B (pipeline `text-generation`).
- Procesamiento de imagen: la arquitectura incluye una torre de visión (333 tensores en el primer shard), aunque el pipeline declarado es solo de texto y no se documentan las capacidades multimodales resultantes tras la compresión.
- Predicción multi-token (MTP): el módulo está presente en la arquitectura, lo que en teoría habilita decodificación especulativa o generación de varios tokens por paso.
- Razonamiento de múltiples pasos y soporte de agentes: no disponible explícitamente en la información proporcionada.
- Tool calling / function calling: no disponible explícitamente en la información proporcionada (depende de las capacidades del modelo base).
- Capacidades multilingües: no disponible; no se listan idiomas en los metadatos de HuggingFace.
- Modo "thinking" u otras capacidades especiales: no disponible.
- Compresión extrema: la capacidad diferencial del artefacto es ejecutar el modelo completo en 1,585 GiB, lo que permite desplegarlo en GPUs de gama baja o en configuraciones multi-T4.

## Casos de uso

- Despliegue de un modelo de 27B en hardware restringido: con 1,585 GiB de pesos, el modelo cabría en GPUs consumer de 8-24 GB (RTX 3060, 4070, 4090) o en 2x Tesla T4 de 16 GB cada una, según la model card. Sería el escenario principal si la fidelidad declarada se confirma en tareas reales.
- Procesamiento de documentos largos: la ventana declarada de 10M de tokens permitiría analizar corpus completos (libros, expedientes, bases de código) en una sola pasada, siempre que la memoria disponible aguante la caché KV.
- Servicio de inferencia de alto rendimiento en hardware antiguo: el autor reporta más de 560 tok/s en 2x T4, lo que haría viable servir un modelo grande en infraestructura Turing ya amortizada en lugar de adquirir A100/H100.
- Investigación sobre compresión extrema de modelos: el artefacto sirve como caso de estudio para validar o refutar la técnica E8/Lie-Kronecker frente a cuantizaciones estándar (INT8, INT4, AWQ, GGUF).
- Evaluación de robustez post-compresión: útil para medir cuánto se degrada el rendimiento en tareas downstream (razonamiento, código, matemáticas) cuando solo se optimiza la similitud coseno de pesos.
- Prototipado y experimentación multimodal: al conservar la torre de visión, podría emplearse para probar pipelines imagen-texto en entornos con poca VRAM, aunque la capacidad multimodal real no está documentada.
- Reproducción de experimentos del modelo base en un solo equipo: permite comparar salidas de Qwen3.8-27B en BF16 frente a la versión comprimida sin necesidad de 54 GiB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, MATH u otros) en la información disponible. Los únicos datos numéricos son métricas de reconstrucción de pesos y de rendimiento declarado por el autor:

| Metrica | Original BF16 | INT8 estandar | INT4 (AWQ/GGUF) | Sub-bit ingenuo | Arjuna Wonder 27B |
|---|---|---|---|---|---|
| Bits por parametro | 16,00 | 8,00 | 4,25 | 0,50 | 0,487 |
| Huella total | 55.563 MB (54,26 GiB) | 27.781 MB (27,13 GiB) | 14.758 MB (14,41 GiB) | 1.700 MB (1,66 GiB) | 1.623,42 MB (1,585 GiB) |
| Ratio de compresion | 1,0x | 2,0x | 3,8x | 32,7x | 34,2x |
| Similitud coseno (validacion no vista) | 1,000000 | 0,999810 | 0,998650 | < 0,150000 (colapso) | 0,999885 (mín. 0,99927) |
| Error L2 relativo | 0,00000 | 0,01950 | 0,05190 | > 0,98000 | 0,01359 |
| Cabe en 2x T4 (32 GB) con 10M de contexto | No (OOM) | No (OOM a partir de 16K) | No (OOM a partir de 64K) | No (salida incoherente) | Sí (28,4 GiB libres) |
| Throughput sostenido en 2x T4 | No aplica (OOM) | ~18 tok/s | ~34 tok/s | No aplica | > 560 tok/s |

Advertencia metodológica: la similitud coseno de pesos no equivale a calidad de generación. No se aportan evaluaciones de perplejidad, benchmarks estándar ni comparaciones de salida frente al modelo original en tareas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,585 GiB solo para los pesos; el total dependerá de la caché KV asociada al contexto efectivo (no cuantificada en la información disponible).
- GPU recomendadas: 2x NVIDIA Tesla T4 (SM 75, 32 GB combinados), configuración objetivo declarada por el autor. Al caber en menos de 2 GB, también sería viable en RTX 3090, RTX 4090, RTX 4080, A10, L4 o incluso GPUs de 8 GB, siempre que el código de descompresión sea compatible.
- Cabe en GPU consumer: sí, en principio cualquiera con al menos 8 GB de VRAM; los 2,5 GB del repositorio deben descargarse y descomprimirse en memoria.
- Opciones de despliegue: no disponible para vLLM, llama.cpp, Ollama, TGI ni transformers estándar. El repositorio usa la librería `pytorch` y pesos `.pt` en 18 shards con compresión propietaria, por lo que requiere un cargador personalizado que no se incluye en la información disponible.
- Latencia y throughput: el autor reporta más de 560 tok/s sostenidos en 2x T4 y 28,4 GiB de VRAM libres con 10M de contexto. Son cifras no verificadas de forma independiente.
- Nota: la dependencia de kernels específicos para SM 75 (Turing) es un riesgo de portabilidad; no se documenta soporte para arquitecturas Ampere, Hopper o Ada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Huella | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arjuna Wonder 27B | 27,23B (declarados) | 10M (declarado, no verificado) | 1,585 GiB | Apache 2.0 | HuggingFace, 0 descargas, requiere cargador propio |
| Qwen/Qwen3.8-27B (base) | 27,23B | No disponible en esta ficha | 54,26 GiB en BF16 | Según el modelo base | HuggingFace |
| Qwen3.8-27B INT8 | 27,23B | No disponible | 27,13 GiB | Según el modelo base | Formatos estándar |
| Qwen3.8-27B INT4 (AWQ/GGUF) | 27,23B | No disponible | 14,41 GiB | Según el modelo base | Formatos estándar (llama.cpp, vLLM) |

No se dispone de información sobre otros modelos de 27B comparables (por ejemplo, de la familia Gemma, Mistral o Llama) en la documentación proporcionada, ni de resultados de benchmarks que permitan una comparación de calidad. La comparativa anterior se limita a las variantes citadas en la propia model card.

## Limitaciones y advertencias

- Ausencia total de benchmarks de capacidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones de salida que demuestren que el modelo comprimido conserva las habilidades del original. La similitud coseno de pesos es una métrica necesaria pero no suficiente.
- Riesgo de alucinación: no evaluado; se desconoce si la compresión degrada la calibración o la fidelidad factual del modelo base.
- Sesgos: no documentados. Al heredar los pesos de Qwen3.8-27B, cabría esperar los sesgos del modelo base, pero no se aporta ningún análisis.
- Idiomas: no se declara ningún idioma soportado en los metadatos; el comportamiento multilingüe tras la compresión es desconocido.
- Contexto de 10M: la cifra aparece en tags y en la tabla comparativa, pero no se explica el mecanismo (¿RoPE escalado, atención lineal, memoria externa?) ni se ofrecen mediciones de perplejidad a esa longitud.
- Formato propietario: los pesos `.pt` comprimidos no son compatibles con safetensors, GGUF, vLLM, llama.cpp, Ollama ni TGI. Sin el código de descompresión, el artefacto es inutilizable en producción.
- Dependencia de hardware específico: la model card menciona kernels para SM 75 (Turing); no se documenta compatibilidad con Ampere, Hopper ni Ada, lo que limita su uso en clústeres modernos.
- Discrepancia de tamaños: el repositorio ocupa 2,5 GB, mientras que los pesos declarados suman 1,585 GiB; parte del espacio podría corresponder a código, metadatos o ficheros auxiliares no descritos.
- Señales de madurez bajas: 0 descargas, 0 likes, publicación y actualización el mismo día (25 de octubre de 2026), sin paper, sin repositorio de código y sin evaluación independiente. Las afirmaciones de "récord" y "revolución" de la model card deben tratarse como marketing no verificado.
- Licencia: el repositorio se declara Apache 2.0, pero al derivar de Qwen/Qwen3.8-27B es imprescindible comprobar la licencia y condiciones del modelo base antes de un uso comercial.
- Riesgo de seguridad: no se documenta si la compresión preserva el alineamiento y los filtros de seguridad del modelo original; un modelo desalineado con pesos comprimidos podría eludir salvaguardas.

## Enlaces

- HuggingFace: https://huggingface.co/shivrajgurjar/Arjuna-Wonder-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, repositorio de código, blog o demo: no disponible en la información proporcionada.
