# basically-ai/Pebble-10M-Chat

## Resumen

Pebble-10M-Chat es un modelo de lenguaje autoregresivo de tamaño reducido (aproximadamente 10 millones de parámetros) desarrollado por el equipo de basically-ai. Se trata de una versión afinada mediante supervisión (SFT) del modelo base Pebble-10M, diseñado para tareas de conversación y generación de texto en inglés. Su principal innovación radica en una arquitectura híbrida que combina bloques Mamba2 (modelos de espacio de estado) con bloques de atención Transformer, logrando un equilibrio entre eficiencia computacional y capacidad de modelado. Con una longitud de contexto de 512 tokens y un vocabulario de 2048 tokens (byte-level BPE), está pensado para ejecutarse en entornos con recursos muy limitados, como dispositivos embebidos o prototipos de investigación.

El modelo se entrenó sobre un subconjunto de 25 mil millones de tokens procedentes de diversos datasets públicos (FineWeb-Edu, DCLM, Cosmopedia-v2, entre otros) y posteriormente se afinó con 250 millones de tokens del dataset smol-smoltalk. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para experimentación y despliegues de bajo coste. A pesar de su pequeño tamaño, presenta resultados por encima del azar en varios benchmarks de sentido común y aritmética, aunque con limitaciones evidentes en tareas complejas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 / Transformer (patrón 3 bloques Mamba2 : 1 bloque de atención) |
| Parametros totales | 11.068.176 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pebble-10M-Chat emplea una arquitectura híbrida que intercala bloques de espacio de estado (Mamba2) con bloques de atención Transformer. En concreto, el patrón se repite cada 4 bloques: 3 bloques Mamba2 seguidos de 1 bloque de atención, con un total de 8 capas (6 Mamba2 y 2 de atención). La dimensión oculta es de 384 y el vocabulario se compone de 2048 tokens mediante un tokenizador BPE a nivel de byte. Esta combinación busca aprovechar la eficiencia lineal de Mamba2 para el procesamiento secuencial y la capacidad de atención para capturar dependencias a corto plazo.

El entrenamiento del modelo base se realizó sobre 25 mil millones de tokens, distribuidos en un 30% de FineWeb-Edu, 20% de DCLM, 15% de Cosmopedia-v2, 15% de FineMath-4+, 12% de FinePhrase y 8% de NPset. Se utilizó un optimizador personalizado que aplica Muon a los pesos de las capas 2D (como las de atención) y AdamW a embeddings, normas y escalares, con precisión fp32 para los pesos maestros y autocast bf16 durante el entrenamiento. Posteriormente, el modelo se afinó mediante SFT con 250 millones de tokens del dataset smol-smoltalk, orientado a mejorar sus capacidades conversacionales.

## Capacidades

- Generación de texto en inglés: produce respuestas coherentes para prompts cortos, aunque con limitaciones de coherencia en contextos largos.
- Razonamiento básico de sentido común: supera ligeramente el azar en benchmarks como PIQA (58.43%) y ARC-Easy (37.29%).
- Aritmética simple: muestra resultados por encima del azar en ArithMark-2.0 (27.64%) y ArithMark-3.0 (32.80%).
- Conversación multi-turno: gracias al SFT, puede mantener diálogos cortos, aunque con una ventana de contexto de solo 512 tokens.
- No soporta tool calling, ni funciones de agente, ni capacidades multimodales (visión, audio).
- Multilingüismo: únicamente inglés; no se ha entrenado para otros idiomas.

## Casos de uso

- Prototipado rápido de chatbots: por su tamaño reducido, se puede desplegar en entornos de desarrollo para probar flujos conversacionales básicos sin necesidad de infraestructura potente.
- Educación e investigación: útil para estudiar arquitecturas híbridas Mamba2/Transformer y comparar el rendimiento de modelos de muy baja escala en tareas de lenguaje.
- Generación de texto breve en aplicaciones embebidas: dado que requiere poca memoria y cómputo, puede ejecutarse en dispositivos con GPU modesta o incluso en CPU (aunque los kernels Mamba2 requieren CUDA).
- Clasificación de sentimiento o etiquetado simple: al ser un modelo de lenguaje, puede adaptarse mediante fine-tuning para tareas de clasificación de textos cortos en inglés.
- Asistente de escritura para textos muy cortos: sugerencias de completado de frases o palabras en aplicaciones de mensajería, donde el contexto es limitado.
- Benchmarking de eficiencia: sirve como referencia para medir el rendimiento de modelos de 10M de parámetros frente a arquitecturas más grandes, en términos de velocidad y consumo de recursos.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en varios benchmarks de sentido común y aritmética, obtenidos mediante evaluación zero-shot de opción múltiple. Se comparan con la línea base aleatoria.

| Benchmark | Accuracy | Línea base aleatoria |
|---|---|---|
| PIQA | 58.43% | 50.00% |
| ARC-Easy | 37.29% | 25.00% |
| ARC-Challenge | 18.60% | 25.00% |
| HellaSwag | 26.81% | 25.00% |
| ArithMark-2.0 | 27.64% | 25.00% |
| ArithMark-3.0 | 32.80% | 25.00% |

Nota: ArithMark-2.0 y ArithMark-3.0 se evaluaron en su split de entrenamiento por falta de un split de test adecuado. No se han publicado comparativas con otros modelos de tamaño similar en la información disponible.

## Requisitos de hardware

- El modelo requiere una GPU con soporte CUDA y kernels Triton para la implementación de Mamba2. Se recomienda una GPU de clase Ampere o superior (por ejemplo, RTX 30xx, A100, H100).
- Al tener solo ~11 millones de parámetros, la VRAM necesaria es mínima (menos de 1 GB en fp32), por lo que cabe en cualquier GPU moderna, incluso en tarjetas de gama baja como una GTX 1650 o RTX 2060.
- Para inferencia, se puede usar el script de ejemplo proporcionado en la model card, que carga el modelo con `trust_remote_code=True` y genera texto con sampling.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; el modelo usa código personalizado, por lo que la integración con estos frameworks no está documentada.
- La latencia y el throughput no se han publicado, pero dado el tamaño, se espera una generación muy rápida en GPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de tamaño similar (10M de parámetros) en la información proporcionada. Se puede mencionar que existen otros modelos pequeños como SmolLM-135M o TinyLlama-1.1B, pero no hay datos de rendimiento comparables en las fuentes consultadas. Por tanto, esta sección queda como "no disponible".

## Limitaciones y advertencias

- Contexto muy limitado: solo 512 tokens, lo que impide manejar conversaciones largas o documentos extensos.
- Vocabulario reducido (2048 tokens) que puede limitar la expresividad y la precisión en vocabulario técnico o poco común.
- Rendimiento bajo en tareas complejas: los resultados en ARC-Challenge (18.60%) están por debajo del azar, lo que indica dificultades en razonamiento avanzado.
- Riesgo de alucinaciones: al ser un modelo pequeño, puede generar contenido incoherente o factualmente incorrecto, especialmente en temas especializados.
- Dependencia de kernels CUDA/Triton: la implementación de Mamba2 requiere de estos kernels, lo que impide su ejecución en CPU o en GPUs sin soporte Triton.
- Solo inglés: no es adecuado para aplicaciones multilingües.
- Licencia Apache 2.0: permite uso comercial, pero el código personalizado (custom code) puede requerir mantenimiento adicional.

## Enlaces

- [HuggingFace: basically-ai/Pebble-10M-Chat](https://huggingface.co/basically-ai/Pebble-10M-Chat)
- [Post de anuncio de Hoglet-33 en HuggingFace](https://huggingface.co/posts/Hoglet-33/922488757716704)
- [Repositorio GitHub de Pebble (proyecto relacionado)](https://github.com/Shoalstone/pebble)
- [Sitio web de PebbleAI (no relacionado directamente)](https://pebble.chat/)
