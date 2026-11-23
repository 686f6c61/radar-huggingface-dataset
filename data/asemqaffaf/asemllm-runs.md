# asemqaffaf/AsemLLM-runs

## Resumen

AsemLLM-27M es un modelo de lenguaje de 27,5 millones de parámetros desarrollado por asemqaffaf como experimento de investigación de código abierto. Su particularidad no es el rendimiento, sino el proceso: está implementado íntegramente desde cero en Common Lisp (SBCL), sin frameworks de aprendizaje profundo, incluyendo el transformer, la retropropagación, el optimizador Adam, el tokenizador BPE y el pipeline de datos. Se entrenó en una única CPU de un Apple M1 Pro durante 5,5 horas.

El modelo es un transformer decoder-only de 12 capas, anchura 384 y 8 cabezas de atención, con contexto de solo 128 tokens y un tokenizador BPE byte-level de 8.192 tokens. Se entrenó sobre 48,9 millones de tokens de FineWeb-Edu (aproximadamente 1,8 tokens por parámetro), lo que lo sitúa en un régimen claramente infraentrenado para su tamaño.

Es relevante como artefacto de investigación reproducible: el autor publica los checkpoints, logs y sondas de cada experimento, y verifica la reimplementación en NumPy contra el motor Lisp original con diferencias máximas de 4,9e-15 en logits. No es un asistente ni un modelo apto para producción: el propio autor advierte que genera inglés fluido pero mayoritariamente sin sentido y que no ha recibido ajuste por instrucciones ni de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only: 12 capas, anchura 384, 8 cabezas (tamaño de cabeza 48), MLP 1.536 con ReLU, pre-RMSNorm |
| Parametros totales | 27.584.641 (21.293.441 no de embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; no se documentan versiones cuantizadas) |
| Idiomas soportados | inglés (entrenado sobre FineWeb-Edu en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32, `model.safetensors`, 110 MB); tokenizador en `tokenizer.bpe`; implementación de referencia en NumPy (`asemllm.py`) |
| Posiciones | Posiciones absolutas aprendidas + sesgos de atención relativos aprendidos (8 distancias por cabeza y capa) |
| Cabeza de salida | Matriz de salida no atada más una copia atada: `logits = h·W_head + g·h·E_tokᵀ` con un escalar `g` aprendido |
| Tokenizador | BPE byte-level, 8.192 tokens (id 0 = `<|endoftext|>`, ids 1–256 = bytes); cualquier texto UTF-8 hace round-trip exacto |
| Datos de entrenamiento | 48,9M tokens de FineWeb-Edu (40.425 documentos de entrenamiento) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only pre-RMSNorm con dos innovaciones menores respecto a un transformer estándar: sesgos de atención relativos aprendidos (8 distancias por cabeza y capa, sumados a las posiciones absolutas aprendidas) y una cabeza de salida híbrida que combina una matriz no atada con una copia atada de los embeddings de tokens, ponderada por un escalar aprendido. El tokenizador BPE byte-level garantiza que cualquier cadena UTF-8 se codifique y decodifique sin pérdida.

El entrenamiento usó FineWeb-Edu filtrado por edu score ≥ 4,0, language score ≥ 0,95 y eliminación de casi duplicados, resultando en 48.893.176 tokens de entrenamiento y 269.807 tokens de validación. Se ejecutaron 11.936 pasos de 32 secuencias × 128 tokens (una época) con Adam (β₁ 0,9, β₂ 0,95, ε 1e-8), sin weight decay, learning rate pico 2e-3, 200 pasos de warmup, decaimiento coseno hasta el 10 % y clipping de gradiente 1,0. Todo en FP32 sobre CPU (8 hilos), con productos matriciales delegados a Apple Accelerate, a 2.479 tokens/s y 1,8 GB de memoria pico. El protocolo se congeló y fijó por SHA-256 antes de la ejecución.

## Capacidades

- Generación de texto autoregresiva en inglés a nivel de n-gramas y frases localmente plausibles, sin coherencia global.
- Modelado de lenguaje y cálculo de logits por token (útil para experimentos de interpretabilidad, no para generación fiable).
- Codificación y decodificación BPE byte-level exacta para cualquier texto UTF-8 (inglés, dígitos, latín acentuado, griego, japonés).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, visión ni audio.
- No está ajustado por instrucciones ni por seguridad.
- Capacidad multilingüe limitada al round-trip del tokenizador; el modelado está entrenado solo en inglés.

## Casos de uso

- Investigación sobre entrenamiento desde cero: reproducir el pipeline completo en Lisp o en la reimplementación NumPy para estudiar el coste y el comportamiento de un transformer pequeño entrenado en CPU.
- Estudio de olvido catastrófico: los tags del repositorio y el archivo de experimentos incluyen artefactos específicos para analizar este fenómeno en modelos pequeños con una sola época.
- Análisis de cabezas de inducción (induction heads): el repositorio incluye sondas diseñadas para medir estas estructuras; la sonda C5 de copia en contexto da aproximadamente 0 %, lo que permite estudiar cuándo emergen (o no) a esta escala.
- Verificación de implementaciones: `asemllm.py` sirve como referencia NumPy contra la que validar motores propios, con diferencias de logits documentadas de 4,9e-15 frente al motor Lisp.
- Docencia y divulgación: ejemplo completo y auditable de transformer, backprop, Adam y BPE escritos a mano, con checkpoints y logs publicados para cada afirmación.
- Pruebas de infraestructura de evaluación: el conjunto `asem_eval_90` (90 preguntas de cuatro opciones) y las sondas de copia permiten validar arneses de evaluación en modelos de juguete antes de escalar.
- No es adecuado para atención al cliente, generación de código en producción, resumen documental ni ninguna tarea donde la corrección importe.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Perplejidad de validación (FineWeb-Edu, split validation, 269.696 tokens) | 71,65 |
| Entropía cruzada de validación (nats por token) | 4,2718 |
| `asem_eval_90` (90 preguntas de cuatro opciones, azar 25 %) | 27,78 % (25 de 90) |
| Sonda C5 de copia en contexto de secuencias aleatorias repetidas | ~0 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El resultado de 27,78 % en `asem_eval_90`, cercano al azar, indica que a este tamaño el modelo no ha aprendido a responder preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (110 MB de pesos más activaciones y caché KV para 128 tokens); no requiere GPU.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta en CPU sin problema. Cualquier GPU consumer sirve si se porta el código, pero la implementación de referencia es NumPy sobre CPU.
- Cabe en cualquier GPU consumer y en CPU de portátil; el entrenamiento original usó un Apple M1 Pro con 16 GB y 1,8 GB de memoria pico.
- Opciones de despliegue: solo `asemllm.py` (NumPy). La arquitectura es personalizada y el modelo no carga en transformers, llama.cpp, Ollama, LM Studio, vLLM ni TGI.
- Latencia y throughput: entrenamiento a 2.479 tokens/s en un M1 Pro (8 hilos, CPU); no se documenta throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AsemLLM-27M | 27,5M | 128 | Apache 2.0 | Hugging Face, pesos safetensors + NumPy | Entrenado desde cero en Lisp sobre CPU; perplejidad 71,65; sin ajuste por instrucciones |
| GPT-2 small | 124M | 1.024 | MIT | Hugging Face, transformers | Referencia clásica de modelo pequeño; mucho más entrenado y con ecosistema estándar |
| Pythia-70M | 70M | 2.048 | Apache 2.0 | Hugging Face, transformers | Suite de investigación con checkpoints intermedios y estudio de sesgos |
| TinyLlama-1.1B | 1.100M | 2.048 | Apache 2.0 | Hugging Face, transformers | Modelo pequeño ajustado por instrucciones, apto para tareas reales |

La comparación es asimétrica por diseño: AsemLLM-27M no compite en calidad, sino en transparencia y reproducibilidad del proceso de entrenamiento. No se dispone de comparaciones directas de perplejidad sobre el mismo conjunto de validación.

## Limitaciones y advertencias

- El propio autor declara que el modelo escribe inglés que parece fluido pero mayoritariamente no tiene sentido; no debe usarse donde la corrección importe.
- No está ajustado por instrucciones ni por seguridad: puede generar contenido inapropiado o sin filtro.
- Riesgo de alucinación muy elevado; el resultado en `asem_eval_90` (27,78 %, cerca del azar) confirma que no responde preguntas de forma fiable.
- Contexto de solo 128 tokens, insuficiente para la mayoría de aplicaciones reales.
- Entrenado solo en inglés; el multilingüismo se limita al round-trip del tokenizador.
- Infraentrenado para su tamaño (1,8 tokens por parámetro frente a los 20+ habituales), lo que explica en parte su perplejidad alta.
- La arquitectura personalizada impide usar el ecosistema estándar (transformers, llama.cpp, vLLM); el despliegue exige la implementación NumPy incluida.
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo hace inviable cualquier uso productivo.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente.
- El repositorio ocupa 58,3 GB por el archivo de experimentos, no por los pesos del modelo (110 MB).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asemqaffaf/AsemLLM-runs
- Repositorio GitHub del proyecto: https://github.com/asemqaffaf/AsemLLms
- Protocolo de entrenamiento (Stage-3 Exp 2): https://github.com/asemqaffaf/AsemLLms/tree/main/docs/results/stage3/exp2-pretrain-25m-20261120
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
