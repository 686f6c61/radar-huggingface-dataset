# abhash-chakraborty/ophyx-350m-v2

## Resumen

Ophyx 350M v2 es un modelo de lenguaje especializado en generación de código Python, entrenado desde cero por el desarrollador independiente abhash-chakraborty sobre infraestructura gratuita (TPU v5e-8 y GPUs T4 de Kaggle). Con 349 millones de parámetros y una arquitectura basada en el layout de Qwen3, el modelo aborda el problema de la generación de funciones y módulos Python cortos en entornos con recursos muy limitados, donde los modelos grandes no son viables.

La versión 2 es la iteración final del proyecto y mejora notablemente respecto a la v1: pasa de 35,4 a 43,9 en HumanEval+ (pass@1, greedy), superando con claridad a SmolLM2-360M-Instruct y quedándose cerca de Qwen3-0.6B en varios benchmarks de código. Su pipeline de entrenamiento es notable por combinar preentrenamiento en JAX, extensión de contexto, fine-tuning supervisado, averaging de pesos y refuerzo con GRPO usando como única recompensa el paso de tests.

Es relevante ahora porque demuestra que, con un presupuesto de cómputo casi nulo, es posible entrenar un modelo de código competitivo a escala sub-500M, un rango donde las opciones open source son escasas y de calidad desigual. El contexto es de 4.096 tokens, el vocabulario de 32.768 tokens y los pesos se distribuyen en safetensors (float32), con versión GGUF disponible para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (layout Qwen3), 28 capas, GQA (16 cabezas query, 4 KV de tamaño 64) |
| Parametros totales | 349.237.760 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Pesos nativos en float32; GGUF disponible en repo aparte (cuantizaciones no especificadas) |
| Idiomas soportados | Ingles (prompts); salida exclusivamente en Python |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32); GGUF en ophyx-350m-v2-gguf |

## Arquitectura y entrenamiento

La arquitectura sigue el layout de Qwen3: 28 capas transformer con atención agrupada de consultas (GQA), 16 cabezas de query y 4 de key-value de tamaño 64, tamaño oculto de 1.024, MLP de 2.816, embeddings atados (tied embeddings), vocabulario de 32.768 tokens, RoPE con base 100.000 y 4.096 tokens de contexto. Los pesos se publican en float32. No es un modelo MoE ni híbrido.

El entrenamiento se realizó en cinco fases documentadas por el autor:

1. **Preentrenamiento**: 12.000 millones de tokens de datos abiertos (Stack-Edu y FineWeb-Edu, entre otros), con contexto de 2.048 tokens, usando un tokenizer propio y un bucle de entrenamiento en JAX escrito a medida.
2. **Extensión de contexto**: 2.000 millones de tokens adicionales a 4.096 de contexto.
3. **Fine-tuning supervisado**: 800 millones de tokens a 4.096, con instrucciones, soluciones de problemas con tests y pares de bug-y-corrección.
4. **Averaging de pesos**: mezcla del 70 % del fine-tune con el 30 % de la v1, peso a peso, para recuperar el rendimiento en tareas cortas que la fase de contexto largo había degradado.
5. **Reinforcement learning**: una pasada de GRPO sobre 1.399 problemas con tests, con la única recompensa de pasarlos; 8 muestras por problema, learning rate 2e-6, sin término KL, 174 pasos y 5,4 horas en una única T4.

## Capacidades

- Generación de código Python: funciones y módulos cortos, con formato de salida fijo que termina en el token `<|end|>`.
- Resolución de problemas con tests: 43,9 % pass@1 en HumanEval+ y 47,4 % en MBPP+ (greedy, mismo harness para todos los modelos evaluados).
- Comprensión de código: 21,9 % en CRUX-O (predicción de salida de código).
- Seguimiento de instrucciones en inglés con plantilla de prompt fija (`<|user|>` ... `<|python|>`).
- No soporta oficialmente tool calling, function calling, agentes, visión ni audio; no hay evidencia de estas capacidades en la información disponible.
- Multilingüe: no; solo inglés en los prompts y exclusivamente Python como lenguaje de salida (responde en Python incluso ante peticiones de JavaScript, C++ o Bash).

## Casos de uso

- **Autocompletado y generación de funciones Python aisladas**: dado un docstring o una descripción en inglés, genera la función correspondiente; es su caso de uso principal y donde rinde mejor (43,9 % en HumanEval+).
- **Asistentes de código en hardware modesto**: con 350M de parámetros y GGUF para llama.cpp, puede ejecutarse en CPUs y portátiles sin GPU dedicada, útil para plugins de editores ligeros.
- **Corrección de bugs simples**: el fine-tuning incluyó pares bug-y-corrección, por lo que puede emplearse para arreglos sencillos en funciones cortas (siempre con revisión humana).
- **Generación de soluciones con tests en pipelines educativos**: su entrenamiento con soluciones verificadas por tests lo hace adecuado para plataformas de aprendizaje de Python que generan ejercicios y validan automáticamente.
- **Prototipado rápido en dispositivos edge**: el tamaño reducido permite desplegarlo en entornos con memoria muy limitada donde un modelo de 7B no cabe.
- **Investigación reproducible en modelos pequeños de código**: al documentarse todo el pipeline (datos, hiperparámetros, resultados de 56 modelos comparados), sirve como base de estudio para experimentos de preentrenamiento eficiente y GRPO a pequeña escala.
- **Predicción de salida de código**: obtiene 21,9 % en CRUX-O, por lo que puede usarse como ayuda didáctica para razonar sobre qué devuelve un fragmento de Python.

## Benchmarks y rendimiento

Pass@1 en porcentaje, greedy, todos los modelos evaluados con el mismo harness y sandbox offline.

| Model | HumanEval+ | MBPP+ | BCB-Hard (instruct) | LiveCodeBench | CRUX-O | Hands-on (42) |
|---|---|---|---|---|---|---|
| **Ophyx 350M v2** | **43,9** | 47,4 | 4,6 | 2,0 | 21,9 | 9 |
| Ophyx 350M v1 | 35,4 | 48,1 | 3,8 | 1,5 | 19,5 | 10 |
| SmolLM2-360M-Instruct | 15,9 | 27,5 | 0,0 | 0,9 | 20,4 | 4 |
| Qwen2.5-Coder-0.5B-Instruct | 54,9 | 42,1 | 2,3 | 0,6 | 25,1 | 5 |
| Qwen3-0.6B | 36,6 | 46,6 | 0,8 | 7,9 | 24,8 | 6 |

Rendimiento fuera de Python y en tareas con librerías:

| Model | MultiPL-E JS | MultiPL-E C++ | MultiPL-E Bash | BigCodeBench instruct (1.140) | DS-1000 |
|---|---|---|---|---|---|
| **Ophyx 350M v2** | 0,0 | 0,0 | 0,0 | 21,0 | 3,4 |
| Qwen2.5-Coder-0.5B-Instruct | 52,2 | 45,3 | 25,3 | 11,3 | 6,6 |
| Qwen3-0.6B | 30,4 | 21,1 | 5,1 | 10,1 | 5,3 |
| deepseek-coder-1.3b-instruct | 60,2 | 50,3 | 16,5 | 22,3 | 27,2 |
| Qwen2.5-Coder-7B-Instruct | 82,6 | 80,7 | 51,9 | 42,4 | 42,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 349M de parámetros en float32, unos 1,4 GB (coincide con el tamaño del repo); en GGUF cuantizado, notablemente menos (del orden de cientos de MB, según la cuantización elegida; el autor no especifica las variantes).
- GPU recomendadas: ninguna GPU dedicada es necesaria; el propio autor lo entrenó y afinó en T4, y el modelo es plenamente utilizable en CPU.
- Consumer GPUs: cabe con holgura en cualquier GPU moderna (una RTX 3060 de 12 GB o incluso GPUs de 4 GB lo ejecutan sin problemas); también funciona sin GPU.
- Opciones de despliegue: transformers 5 o superior (o transformers 4.x cargando el tokenizer con `PreTrainedTokenizerFast`), llama.cpp mediante los GGUF de `ophyx-350m-v2-gguf`, y por extensión Ollama o backends compatibles con GGUF. No hay soporte documentado para vLLM o TGI.
- Latencia y throughput: no disponibles; por tamaño, se espera inferencia rápida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval+ | MBPP+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Ophyx 350M v2** | 349M | 4.096 | 43,9 | 47,4 | Apache-2.0 | safetensors + GGUF |
| Qwen2.5-Coder-0.5B-Instruct | ~500M | 32.768 (no disponible en la ficha; dato del modelo base) | 54,9 | 42,1 | Apache-2.0 | safetensors + GGUF |
| Qwen3-0.6B | ~600M | 4.096 (según la ficha del autor) | 36,6 | 46,6 | Apache-2.0 | safetensors + GGUF |
| SmolLM2-360M-Instruct | ~360M | no disponible | 15,9 | 27,5 | Apache-2.0 | safetensors + GGUF |

Ophyx v2 destaca sobre sus rivales directos en HumanEval+ y MBPP+ (excepto Qwen2.5-Coder-0.5B en HumanEval+), pero queda claramente por detrás en multi-lenguaje (0,0 en MultiPL-E JS/C++/Bash) y en tareas con librerías (DS-1000: 3,4 frente a 27,2 de deepseek-coder-1.3b).

## Limitaciones y advertencias

- Solo Python y solo inglés: ante peticiones de JavaScript, C++ o Bash responde siempre en Python (0,0 en MultiPL-E para esos lenguajes).
- Las tareas con librerías son muy difíciles para él: 3,4 en DS-1000, concentrado casi todo en Matplotlib.
- Razonamiento largo y trabajo multi-archivo están fuera de su alcance: 2 % en LiveCodeBench y 9 de 42 tareas hands-on.
- Ha empeorado respecto a la v1 en predicción de entradas de código (CRUX-I: 20,6 frente a 24,9).
- Riesgo de alucinación alto, inherente a un modelo de 350M: su salida debe tratarse como código sin probar, según advierte el propio autor.
- Sesgos: entrenado con datos abiertos (Stack-Edu, FineWeb-Edu); no se documentan auditorías de sesgo.
- Licencia Apache-2.0 sin restricciones para uso comercial, pero al ser un modelo entrenado por un particular sin respaldo corporativo, no hay garantías de mantenimiento ni de actualizaciones futuras.
- Requiere transformers 5+ para el tokenizer por defecto, o una carga manual alternativa en transformers 4.x, un detalle importante para integraciones en producción.
- Formato de salida fijo con token `<|end|>`: los pipelines deben configurar el `eos_token_id` adecuadamente o la generación no se detendrá correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhash-chakraborty/ophyx-350m-v2
- Pesos GGUF: https://huggingface.co/abhash-chakraborty/ophyx-350m-v2-gguf
- Repositorio GitHub con evaluaciones completas (56 modelos y comparación con frontera): https://github.com/Abhash-Chakraborty/ophyx/blob/main/eval/R1_RESULTS.md
- Paper, blog y demo: no disponibles
