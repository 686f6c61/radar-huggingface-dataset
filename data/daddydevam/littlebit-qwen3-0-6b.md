# DaddyDevam/littlebit-qwen3-0.6b

## Resumen

LittleBit Qwen3-0.6B es un modelo de investigación publicado por el usuario DaddyDevam que aplica la técnica de cuantización sub-1-bit LittleBit sobre el modelo base Qwen/Qwen3-0.6B. Todas las capas lineales del transformer original, excepto la cabeza de salida, se sustituyen por capas LittleBit y se reentrenan mediante quantización-aware training (QAT) con destilación del modelo original. El resultado es un checkpoint de 0,68 bits por peso que ocupa 131 MB en formato GGUF, frente a los aproximadamente 639 MB del Qwen3-0.6B en Q8_0.

El modelo no está pensado para uso práctico: el propio autor lo describe como una herramienta para probar infraestructura sub-1-bit, no para calidad conversacional. En el mismo tamaño de fichero, SmolLM2-135M Q6_K obtiene mejores resultados en todos los textos evaluados, y el Qwen3-0.6B Q2_K con importance matrix supera a este modelo fuera del dominio de entrenamiento. Solo gana al Q2_K en WikiText-2, que está muy próximo a los datos vistos durante el entrenamiento.

Es relevante ahora porque demuestra empíricamente los límites de la cuantización extrema con factorización de signos (±1) y rutas residuales, y porque requiere un runtime parcheado específico (littlebit-gguf) que no existe en llama.cpp, Ollama ni LM Studio estándar. La arquitectura subyacente es un transformer denso de Qwen3 con 405,8 millones de parámetros reales en safetensors y una ventana de contexto heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con capas lineales sustituidas por capas LittleBit (factorización de signos ±1 con rutas residuales) |
| Parametros totales | 405.782.528 (safetensors del checkpoint) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-0.6B) |
| Tipos de cuantizacion | GGUF Q1_0 para proyecciones a 0,6792 bpw; Q4_K para embeddings y output; checkpoint safetensors empaquetado con signos y escalas BF16 a 0,618 bpw |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint LittleBit) y GGUF (formato version 1) |

## Arquitectura y entrenamiento

Cada proyección lineal del transformer original se reemplaza por una descomposición `W ≈ diag(h)·U±·diag(l)·V±ᵀ·diag(g)`, donde `U±` y `V±` son factores de signos ±1 y se añade una ruta residual de la misma forma. En GGUF esto se traduce en dos multiplicaciones de matrices `Q1_0`. Las proyecciones operan a 0,6792 bits por peso incluyendo rutas y escalas, mientras que los embeddings y la cabeza de salida se mantienen en Q4_K. El checkpoint empaquetado almacena signos y escalas BF16 a 0,618 bits por peso de proyección.

El entrenamiento es QAT con destilación desde el Qwen3-0.6B original, usando 99,2 millones de tokens: cuatro copias del split de entrenamiento de WikiText-2 más un shard de entrenamiento de C4. Los rangos de descomposición son 128 para atención y 256 para MLP, con ruta residual en todas las proyecciones. Se ejecutó en dos GPUs T4 y se detuvo por límite de tiempo en el paso 24.221 de 24.414, con el learning rate ya próximo a cero. El autor reconoce que el resultado es un modelo de investigación y no una alternativa práctica a la cuantización estándar.

## Capacidades

- Generación de texto autoregresiva en inglés, con calidad limitada y degradada respecto al modelo base.
- Razonamiento y matemáticas básicas heredadas del Qwen3-0.6B, pero fuertemente mermadas por la cuantización extrema.
- Generación de código: el autor reporta un rendimiento notablemente peor que Q2_K y Q8_0 en Python (1,399 bits por byte frente a 0,773 y 0,531).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según el campo `language: en`.
- No se documenta modo thinking, visión ni audio.
- Sirve como banco de pruebas para tooling de cuantización sub-1-bit (conversión, runtime parcheado, evaluación de perplejidad).

## Casos de uso

- Investigación en cuantización extrema: permite medir la degradación de perplejidad a 0,68 bpw frente a Q2_K y Q8_0 sobre WikiText-2, Book y código Python, usando `llama-perplexity` con el build parcheado.
- Desarrollo y validación de runtimes sub-1-bit: sirve para probar el conversor `convert_littlebit_to_gguf.py` y el runtime littlebit-gguf en Linux o WSL antes de aplicarlo a modelos mayores.
- Benchmarking de metodologías QAT con destilación: el checkpoint incluye el resumen de entrenamiento y permite reproducir la receta (rangos 128/256, ruta residual, 99,2M tokens) sobre otros modelos base.
- Pruebas de integración de GGUF no estándar: útil para verificar que pipelines de carga de GGUF detectan correctamente formatos version 1 con tensores Q1_0.
- Docencia y divulgación: ejemplo concreto de los límites de la compresión sub-1-bit y de por qué un modelo de 135M en Q6_K puede superar a un 0,6B fuertemente cuantizado.
- Evaluación comparativa de tokenizadores: al reportar bits por byte en lugar de perplejidad, permite comparar modelos con tokenizadores distintos en tareas de modelado de lenguaje.

## Benchmarks y rendimiento

Resultados de `llama-perplexity -c 2048 -b 2048 -ngl 0` en CPU, segunda mitad de cada ventana, en bits por byte (menor es mejor) con perplejidad entre paréntesis.

| Modelo | Fichero | WikiText-2 | Book | Codigo Python |
|---|---:|---:|---:|---:|
| LittleBit Qwen3-0.6B | 131 MB | 1,168 (32,70) | 1,597 (94,26) | 1,399 (32,45) |
| Qwen3-0.6B Q2_K con importance matrix | 296 MB | 1,185 (34,38) | 1,382 (51,15) | 0,773 (6,84) |
| SmolLM2-135M Q6_K | 138 MB | 0,901 | 1,023 | 0,681 |
| Qwen3-0.6B Q8_0 | 639 MB | 0,966 (17,90) | 1,156 (26,85) | 0,531 (3,75) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el fichero GGUF de 131 MB, más overhead del runtime; el checkpoint safetensors ocupa 357 MB.
- GPU recomendadas: no se especifican; el autor ejecutó el entrenamiento en dos T4. Para inferencia, cualquier GPU consumer moderna es suficiente en términos de memoria.
- Cabe en cualquier GPU consumer: el fichero GGUF de 131 MB cabe holgadamente en GPUs con 4 GB o más, e incluso en CPU.
- Opciones de despliegue: exclusivamente el build parcheado littlebit-gguf (Linux o WSL). No funciona en llama.cpp estándar, Ollama ni LM Studio.
- Ejemplo de ejecución del autor: `build/bin/llama-cli --hf-repo DaddyDevam/littlebit-qwen3-0.6b --hf-file littlebit-qwen3-0.6b-q4_k.gguf -ngl 0 -t 4 -c 512 --single-turn -p 'Once upon a time' -n 32`.
- Latencia y throughput: no disponibles en la información proporcionada; los benchmarks se ejecutaron en CPU con `-ngl 0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano fichero | WikiText-2 (bpb) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LittleBit Qwen3-0.6B | 405,8M (0,68 bpw) | no disponible | 131 MB | 1,168 | Apache 2.0 | HF + runtime parcheado |
| Qwen3-0.6B Q2_K (imatrix) | 0,6B | no disponible | 296 MB | 1,185 | Apache 2.0 | llama.cpp estándar |
| SmolLM2-135M Q6_K | 135M | no disponible | 138 MB | 0,901 | Apache 2.0 | llama.cpp estándar |
| Qwen3-0.6B Q8_0 | 0,6B | no disponible | 639 MB | 0,966 | Apache 2.0 | llama.cpp estándar |

## Limitaciones y advertencias

- Modelo de investigación: el propio autor indica que no es práctico y que no debe usarse para calidad conversacional.
- Calidad inferior a alternativas del mismo tamaño: SmolLM2-135M Q6_K supera al modelo en WikiText-2, Book y código Python con un fichero de 138 MB.
- Fuera del dominio de entrenamiento, Q2_K con importance matrix es mejor: en Book (1,382 frente a 1,597) y en código Python (0,773 frente a 1,399).
- Requiere runtime parcheado: no funciona en llama.cpp, Ollama ni LM Studio estándar; necesita littlebit-gguf y compilación en Linux o WSL.
- Idiomas: solo inglés declarado; no se garantiza comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación elevado por la fuerte degradación de perplejidad (32,70 en WikiText-2 frente a 17,90 del Q8_0).
- Entrenamiento incompleto: se detuvo en el paso 24.221 de 24.414 por límite de tiempo, aunque con learning rate próximo a cero.
- Datos de entrenamiento limitados: 99,2M tokens de WikiText-2 y un shard de C4, lo que explica el sobreajuste al dominio de WikiText-2.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones prácticas del modelo lo desaconsejan para producción.
- No afiliado a los autores de LittleBit ni al proyecto llama.cpp.
- Sin datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de tool calling, agentes o contexto efectivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DaddyDevam/littlebit-qwen3-0.6b
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Runtime y conversor littlebit-gguf: https://github.com/GeniusDevam/littlebit-gguf
- Release con los mismos ficheros: https://github.com/GeniusDevam/littlebit-gguf/releases/tag/littlebit-qwen3-0.6b-v1
- Paper LittleBit: https://arxiv.org/abs/2506.13771
- Commit del trainer: https://github.com/GeniusDevam/littlebit-gguf/tree/e593d6553ef640d0a09ce85f49fc31d4f73286b6/train
- Sección de benchmarks en el README del repo: https://github.com/GeniusDevam/littlebit-gguf#trained-qwen3-06b-against-same-size-models
