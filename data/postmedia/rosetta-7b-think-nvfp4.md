# PoSTMEDIA/Rosetta-7B-Think-NVFP4

## Resumen

Rosetta-7B-Think-NVFP4 es la cuantización oficial en NVFP4 (coma flotante de 4 bits) de Rosetta-7B-Think, el modelo de razonamiento bilingüe coreano-inglés desarrollado por PoSTMEDIA. El modelo original antepone una traza de razonamiento explícita, delimitada por las etiquetas `<think> ... </think>`, antes de emitir la respuesta final. Esta variante cuantizada se ha producido con NVIDIA TensorRT Model Optimizer (nvidia-modelopt 0.46.1) aplicando la receta oficial de post-training quantization (PTQ) NVFP4, no un reentrenamiento.

La motivación es doble. Por un lado, reducir el coste de decodificación de un modelo de razonamiento cuyas trazas `<think>` pueden ser muy largas: el checkpoint pasa de 14,5 GB en BF16 a 6,3 GB, unas 2,3 veces menos, lo que en dispositivos limitados por ancho de banda como DGX Spark se traduce directamente en una generación de tokens más rápida sobre secuencias largas. Por otro, apuntar al hardware NVIDIA Blackwell (DGX Spark, GeForce RTX 50 y piezas de centro de datos B200/GB200), donde vLLM selecciona automáticamente kernels GEMM NVFP4 nativos. En GPUs anteriores (Hopper, Ada, Ampere) el mismo checkpoint carga mediante el fallback weight-only Marlin de vLLM.

Los pesos reales declarados en safetensors suman 4.560.924.672 parámetros (unos 4,56 mil millones), pese a la denominación comercial «7B». La licencia es Apache 2.0, los idiomas soportados son coreano e inglés, y el repositorio se publicó el 11 de septiembre de 2026 sin descargas ni «likes» registrados en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada (modelo de lenguaje de generación de texto distribuido para `transformers` con soporte en vLLM) |
| Parámetros totales | 4.560.924.672 (según safetensors) |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (W4A4): pesos y activaciones en FP4 E2M1, bloques de 16 elementos con escalas por bloque en FP8 E4M3 más escala por tensor en FP32; caché KV en FP8 E4M3 con escalas estáticas calibradas; embeddings, `lm_head` y capas de normalización se mantienen en BF16 |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; checkpoint unificado ModelOpt para HuggingFace (`quantization_config` + `hf_quant_config.json`) |
| Modelo base | PoSTMEDIA/Rosetta-7B-Think |
| Tamaño del repositorio | 6,3 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Rosetta-7B-Think más allá de su etiqueta de pipeline (`text-generation`), su distribución para el ecosistema `transformers` y su servicio mediante vLLM con parser de razonamiento propio. Lo que sí se documenta con precisión es el proceso de cuantización: no hay entrenamiento nuevo, sino una PTQ sobre los pesos de Rosetta-7B-Think usando la receta NVFP4 oficial de NVIDIA TensorRT Model Optimizer.

Los pesos se almacenan en FP4 (formato E2M1) agrupados en bloques de 16 elementos, con escalas por bloque en FP8 (E4M3) y una escala por tensor en FP32. Las activaciones también se cuantizan a NVFP4 (esquema W4A4) con escalas de entrada estáticas calibradas, y la caché KV se almacena en FP8 (E4M3) con escalas estáticas. Las capas sensibles a la precisión —embeddings, `lm_head` y normalizaciones— se conservan en BF16, un detalle clave para preservar la calidad.

La calibración se diseñó específicamente para la carga de razonamiento: 1.024 muestras bilingües con una ventana de 4.096 tokens (ocho veces la ventana estándar de la receta), de modo que las trazas `<think>` completas se observen durante la calibración de activaciones. La composición combina trazas de razonamiento coreanas de formato largo procedentes de activos de datos sintéticos internos de PoSTMEDIA (8 dominios, renderizadas con la plantilla de chat que incluye `<think>`) junto con texto inglés de razonamiento matemático y noticias. En evaluaciones internas comparativas contra el modelo BF16 bajo un protocolo idéntico, se reporta que el comportamiento de razonamiento se preserva, incluida la terminación fiable de `<think>` con entradas en coreano.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con plantilla de chat.
- Razonamiento explícito: el modelo emite una traza interna entre `<think>` y `</think>` antes de la respuesta final, expuesta por vLLM a través del campo `reasoning` de la API compatible con OpenAI.
- Razonamiento matemático: la calibración incluye texto de razonamiento matemático en inglés y la model card menciona explícitamente el uso con problemas de competición (recomendando hasta 32.768 tokens de salida).
- Razonamiento de formato largo en coreano: datos de calibración procedentes de trazas sintéticas en 8 dominios.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo `<think>` es intrínsecamente multi-paso.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: limitadas a coreano e inglés según las etiquetas del modelo.

## Casos de uso

- Servicio de razonamiento matemático en producción: el modelo puede resolver problemas de competición y demostraciones formales (por ejemplo, demostrar que existen infinitos números primos) emitiendo la traza completa en `<think>`; se recomienda `temperature 0.6`, `top_p 0.95` y `max_tokens` de hasta 32.768.
- Atención al cliente bilingüe coreano-inglés: permite gestionar conversaciones multi-turno en ambos idiomas con una única instancia, aunque no se ha publicado la longitud de contexto soportada.
- Despliegue en DGX Spark (GB10, 128 GB de memoria unificada): los 6,3 GB del checkpoint dejan prácticamente libre el resto de la memoria para una caché KV de contexto largo, que es justamente lo que exigen las trazas de razonamiento extensas.
- Inferencia de bajo coste en GPUs GeForce RTX 50: al disponer de kernels GEMM NVFP4 nativos en Blackwell (SM 100/120/121), se obtiene el máximo aprovechamiento del formato de 4 bits sin necesidad de conversiones adicionales.
- Reutilización en infraestructura Hopper, Ada o Ampere: el mismo checkpoint de 6,3 GB carga mediante el fallback weight-only Marlin de vLLM (SM ≥ 80), lo que permite servir el modelo en parques de GPUs existentes con aritmética BF16.
- Generación de trazas de razonamiento para destilación o evaluación: el campo `reasoning` expuesto por vLLM facilita capturar las cadenas de pensamiento estructuradas, útiles como datos de supervisión o como material de auditoría.
- Investigación en cuantización de modelos de razonamiento: sirve como caso de estudio de una receta NVFP4 calibrada con ventana de 4.096 tokens y datos de trazas largas, comparándola contra el modelo BF16 equivalente.
- Asistentes técnicos y de documentación en coreano: la calibración incluye trazas de formato largo en coreano de 8 dominios, lo que respalda respuestas extensas en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona evaluaciones internas comparativas contra el modelo BF16 bajo un protocolo idéntico, según las cuales se preserva el comportamiento de razonamiento (incluida la terminación de `<think>` en coreano), pero no se aportan cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para los pesos: 6,3 GB, el tamaño exacto del checkpoint NVFP4, frente a 14,5 GB del modelo BF16.
- Memoria adicional necesaria: la caché KV en FP8 (E4M3) y los buffers de activación dependen de la longitud de contexto, que no se ha publicado; en razonamiento de formato largo conviene reservar margen abundante, especialmente con `max_tokens` de 32.768.
- GPU con soporte nativo NVFP4 (Blackwell): DGX Spark (GB10), GeForce RTX 50 y piezas de centro de datos B200/GB200. vLLM selecciona automáticamente kernels GEMM NVFP4 (CUTLASS, FlashInfer o Marlin).
- GPU anteriores (Hopper, Ada, Ampere, SM ≥ 80): compatibles mediante el fallback weight-only Marlin de vLLM, con la misma huella de 6,3 GB pero aritmética BF16.
- GPU de consumo: el modelo cabe en tarjetas GeForce RTX 50 gracias al soporte NVFP4 nativo; en generaciones anteriores el requisito depende del fallback Marlin y de la memoria disponible.
- Opciones de despliegue: vLLM v0.26 o posterior, con la distribución propia de PoSTMEDIA (rama `rosetta-v0.26.0`), que incluye soporte nativo de Rosetta y un parser de razonamiento integrado sin necesidad de `trust_remote_code`. El formato es compatible con TensorRT-LLM y SGLang a nivel de layout. Para inferencia con `transformers` estándar, la model card recomienda usar el modelo BF16 en lugar de este checkpoint.
- Latencia y throughput: no se han publicado cifras concretas; la model card solo indica de forma cualitativa que la reducción de tamaño se traduce en una generación de tokens más rápida en dispositivos limitados por ancho de banda como DGX Spark.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| Rosetta-7B-Think-NVFP4 | 4.560.924.672 | NVFP4 (W4A4), KV FP8 | 6,3 GB | No disponible | Apache 2.0 | Cuantización 4 bits con razonamiento `<think>`; requiere vLLM ≥ 0.26 |
| Rosetta-7B-Think (BF16) | No disponible en la información proporcionada | BF16 | 14,5 GB | No disponible | Apache 2.0 | Modelo de referencia; máxima precisión, recomendado para `transformers` puro |
| Rosetta-7B-Instruct-NVFP4 | No disponible en la información proporcionada | NVFP4 | No disponible | No disponible | Apache 2.0 | Variante de instrucciones (sin modo de razonamiento explícito), misma cuantización |
| Rosetta-7B-Instruct (BF16) | No disponible en la información proporcionada | BF16 | No disponible | No disponible | Apache 2.0 | Seguimiento de instrucciones y chat |

No se dispone de datos de modelos de otras familias con los que comparar parámetros, contexto o rendimiento, por lo que la comparativa se limita a los miembros de la propia colección Rosetta documentados en la model card.

## Limitaciones y advertencias

- Al ser una cuantización de 4 bits, pueden aparecer diferencias menores en las cadenas de razonamiento más difíciles; la propia model card recomienda el modelo BF16 para casos donde se exija máxima precisión.
- Cobertura lingüística restringida a coreano e inglés; no hay evidencia de buen comportamiento en castellano ni en otros idiomas.
- No se ha publicado la longitud de contexto soportada, un dato crítico para planificar despliegues con trazas de razonamiento largas.
- No hay resultados de benchmarks públicos: las afirmaciones de preservación del razonamiento proceden de evaluaciones internas del proveedor bajo protocolo no detallado.
- El repositorio no registra descargas ni «likes», por lo que carece de validación independiente de la comunidad.
- Requiere vLLM v0.26 o superior, y la model card dirige a la distribución propia de PoSTMEDIA (`github.com/PoSTMEDIA-AI/vllm`, rama `rosetta-v0.26.0`) para obtener soporte nativo y parser de razonamiento; no se garantiza el funcionamiento en versiones anteriores.
- El máximo aprovechamiento del formato NVFP4 exige hardware Blackwell; en GPUs previas se degrada a un fallback de solo pesos con aritmética BF16, perdiendo parte de la ventaja de rendimiento.
- Al ser un modelo de razonamiento, genera salidas largas: hay que configurar `max_tokens` generoso (≥ 4.096, y 32.768 para matemáticas de competición) y asumir latencias altas por defecto.
- Riesgo de alucinación no cuantificado: no se han publicado estudios de fidelidad factual ni tasas de error.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de calibración sintéticos internos de PoSTMEDIA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PoSTMEDIA/Rosetta-7B-Think-NVFP4
- Modelo base (BF16): https://huggingface.co/PoSTMEDIA/Rosetta-7B-Think
- Colección Rosetta: https://huggingface.co/collections/PoSTMEDIA/rosetta-6a9db30fd1b4585b0c1845e9
- Rosetta-7B-Base: https://huggingface.co/PoSTMEDIA/Rosetta-7B-Base
- Rosetta-7B-Instruct: https://huggingface.co/PoSTMEDIA/Rosetta-7B-Instruct
- Rosetta-7B-Instruct-NVFP4: https://huggingface.co/PoSTMEDIA/Rosetta-7B-Instruct-NVFP4
- Distribución vLLM de PoSTMEDIA: https://github.com/PoSTMEDIA-AI/vllm
- Licencia Apache 2.0: https://huggingface.co/PoSTMEDIA/Rosetta-7B-Think-NVFP4/blob/main/LICENSE
