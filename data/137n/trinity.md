# 137N/trinity

## Resumen

Trinity es un modelo de lenguaje de tipo chat desarrollado por 137N, entrenado desde cero con un enfoque *Turkish-first* (prioridad al turco). Se enmarca dentro del proyecto ZLM, una iniciativa que incluye tanto el modelo como el tokenizador y un decodificador CUDA nativo disponible en un repositorio de GitHub. Con 508,6 millones de parámetros, se posiciona en la categoría de modelos pequeños, pensados para despliegue ligero y experimentación.

El modelo emplea una arquitectura transformer de 38 capas con anchura 1024, atención con 16 cabezas de consulta y 4 cabezas KV (GQA), y MLP SwiGLU con dimensión intermedia 3072. El vocabulario es de 49.152 tokens mediante BPE a nivel de byte, y la longitud de contexto alcanza los 16.384 tokens gracias a la extensión YaRN sobre una base de 4.096 tokens.

Su relevancia radica en ser un modelo entrenado íntegramente desde cero para turco, con un pipeline completo (tokenizador, pesos en BF16 y decodificador propio) y licencia MIT, lo que facilita su uso comercial y su estudio. No obstante, la información pública disponible es muy limitada: no hay benchmarks publicados ni datos detallados sobre la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA y SwiGLU |
| Parametros totales | 508.638.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (YaRN sobre base de 4.096) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | `model.bin` en BF16 crudo (layout propio del decodificador CUDA); tokenizador en JSON (formato Hugging Face `tokenizers`) |

## Arquitectura y entrenamiento

Trinity es un transformer decoder-only de 38 capas y anchura 1024. La atención usa 16 cabezas de consulta y 4 cabezas KV (GQA), lo que reduce el coste de memoria del KV cache. El MLP es SwiGLU con dimensión intermedia 3072. El vocabulario de 49.152 tokens se construye con BPE a nivel de byte. La ventana de contexto nativa es de 4.096 tokens, extendida a 16.384 mediante YaRN.

El preentrenamiento consumió 11.000 millones de tokens. Posteriormente se aplicó SFT (supervised fine-tuning) sobre diálogos de chat e instrucciones en turco. No se especifica en la información disponible si hubo RLHF, DPO u otras etapas de alineación, ni la composición exacta del corpus de preentrenamiento. El proyecto incluye un decodificador CUDA nativo (`inference/cuda/decode.cuh`) que lee directamente el archivo `model.bin`; el autor reporta aproximadamente 202 tok/s en una RTX 3050 Ti Laptop.

## Capacidades

- Generación de texto y conversación multi-turno en turco, con formato de prompt definido por tokens especiales (`<|bos|>`, `<|turn_start|>`, `<|turn_end|>`, roles `<|system|>`, `<|user|>`, `<|assistant|>`).
- Seguimiento de instrucciones y diálogo estilo chat gracias al SFT sobre diálogos turcos.
- Contexto de hasta 16.384 tokens mediante YaRN, útil para conversaciones o documentos largos.
- Soporte de rol de sistema (`<|system|>`) para condicionar el comportamiento.
- Capacidades multilingües: limitadas al turco según la model card; no se declaran otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Chatbot turco de propósito general: el modelo puede mantener conversaciones multi-turno en turco con un formato de prompt explícito y una ventana de 16.384 tokens, adecuado para asistentes ligeros en entornos con recursos limitados.
- Despliegue en hardware de consumo: con 508 M de parámetros en BF16 (aproximadamente 1 GB de pesos), cabe en GPUs de gama baja; el autor cita unos 202 tok/s en una RTX 3050 Ti Laptop, lo que lo hace viable para prototipos locales.
- Experimentación e investigación en NLP turco: al estar entrenado desde cero y con licencia MIT, sirve como base para estudios de tokenización, extensión de contexto con YaRN o ajuste fino sobre dominios específicos.
- Generación de texto asistida en turco: redacción de borradores, resúmenes o respuestas a partir de instrucciones, siempre con revisión humana dada la ausencia de benchmarks.
- Ajuste fino para dominios verticales: su tamaño reducido permite fine-tuning con recursos modestos para tareas como atención al cliente de un sector concreto o clasificación de consultas en turco.
- Educación y demostraciones: útil para enseñar el funcionamiento interno de un LLM (tokenizador, GQA, SwiGLU, YaRN) con un pipeline completo y código de inferencia propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la velocidad de decodificación reportada por el autor: aproximadamente 202 tok/s en una RTX 3050 Ti Laptop con el decodificador CUDA nativo en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los pesos ocupan aproximadamente 1 GB (508,6 M de parámetros × 2 bytes); el KV cache para 16.384 tokens con 4 cabezas KV y 38 capas añade una cantidad adicional no especificada.
- GPU recomendadas: el autor reporta funcionamiento en RTX 3050 Ti Laptop; por tamaño, debería caber en GPUs consumer con al menos 2-4 GB de VRAM, aunque no se confirman otros modelos.
- Cabe en GPU consumer: sí, según el dato del autor para RTX 3050 Ti Laptop.
- Opciones de despliegue: el autor proporciona un decodificador CUDA nativo en el repositorio de GitHub (sección *Native BF16 decoding*). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI; los pesos en `model.bin` con layout propio no son directamente compatibles con esos runners sin conversión.
- Latencia y throughput: aproximadamente 202 tok/s en RTX 3050 Ti Laptop (BF16, decodificador nativo).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas en la información proporcionada. A continuación se comparan únicamente parámetros y contexto con alternativas de tamaño similar, sin datos de rendimiento:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Trinity (137N) | 508,6 M | 16.384 | MIT | Hugging Face + GitHub |
| Qwen2.5-0.5B | 0,5 B | 32.768 | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 0,36 B | 8.192 | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | Hugging Face |

Las cifras de los modelos alternativos corresponden a sus especificaciones públicas habituales; no se han verificado en la información proporcionada y no se comparan rendimientos.

## Limitaciones y advertencias

- Idiomas: el modelo está diseñado exclusivamente para turco; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse con datos no especificados, puede reflejar sesgos presentes en el corpus.
- Alucinación: sin benchmarks ni evaluaciones de fidelidad, el riesgo de alucinación es desconocido y debe asumirse alto en un modelo de 0,5 B sin etapas de alineación documentadas.
- Contexto: la ventana de 16.384 tokens depende de YaRN sobre una base de 4.096; la calidad en longitudes cercanas al máximo no está evaluada.
- Compatibilidad: los pesos en `model.bin` con layout propio requieren el decodificador CUDA del repositorio; no hay evidencia de soporte en ecosistemas estándar (transformers, llama.cpp).
- Licencia: MIT permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el origen de los datos de entrenamiento.
- Producción: la ausencia de benchmarks, de evaluaciones de seguridad y de un pipeline de despliegue estándar desaconseja su uso en producción sin una evaluación previa propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/137N/trinity
- Repositorio del proyecto ZLM (código, tokenizador y decodificador CUDA): https://github.com/NeoAcar/ZLM
