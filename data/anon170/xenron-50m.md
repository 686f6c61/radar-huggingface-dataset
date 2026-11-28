# Anon170/xenron-50m

## Resumen

Xenron-50M es un modelo de lenguaje de 50,15 millones de parámetros desarrollado por el usuario Anon170 y publicado en Hugging Face. Se trata de un transformer decoder-only de estilo Llama, entrenado desde cero sobre 1.000 millones de tokens del corpus FineWeb-Edu. Su interés no reside en el rendimiento absoluto, sino en su carácter de experimento reproducible de extremo a extremo: entrenamiento en JAX/Flax NNX con Optax y Roxxel sobre 2 GPUs NVIDIA T4 en FP16, conversión posterior a safetensors y verificación con `transformers.AutoModelForCausalLM`.

El modelo emplea una arquitectura Pre-Norm con 13 capas, dimensión oculta de 512, 8 cabezas de atención (head_dim de 64), MLP SwiGLU de 1408 unidades, RMSNorm y RoPE con theta 10000. La longitud de contexto es de 1024 tokens y el vocabulario es un BPE a nivel de byte de 16.384 entradas. Los pesos están atados (weight-tied embeddings) y el checkpoint final ocupa 100,31 MB en FP16.

Es relevante ahora como referencia educativa y de investigación para quienes quieren entender el coste real de entrenar un modelo pequeño: el autor publica métricas de entrenamiento completas (curva de pérdida, perplejidad, throughput y MFU), lo que permite auditar el proceso. No obstante, sus capacidades lingüísticas son muy limitadas y no está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Pre-Norm estilo Llama (causal) |
| Parametros totales | 50.148.864 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, 100,31 MB) |

## Arquitectura y entrenamiento

Xenron-50M es un transformer causal decoder-only con normalización Pre-Norm. Consta de 13 capas, dimensión oculta 512, 8 cabezas de atención con head_dim 64, MLP SwiGLU de 1408 unidades sin sesgo, RMSNorm con epsilon 1e-6 y codificación posicional RoPE con theta 10000. El vocabulario es un BPE a nivel de byte de 16.384 tokens (tokenizador `old-version/xenron_16k_tokenizer`). Los embeddings de entrada y la cabeza de salida están atados.

El entrenamiento se realizó desde cero sobre 999.997.440 tokens (aproximadamente 1.000 millones) del dataset FineWeb-Edu, con precisión mixta FP16 y pesos maestros en FP32. Se usó AdamW (beta1 0.9, beta2 0.95, weight decay 0.1, grad clip 1.0) con un schedule de warmup lineal de 1000 pasos (6e-6 a 6e-4) seguido de decaimiento coseno (6e-4 a 6e-5). El batch fue de 16 (8 por T4, 16.384 tokens por paso) durante 61.035 pasos. El entrenamiento completo llevó 27.572,3 segundos de tiempo de pared (unas 7 h 39 min) sobre 2 GPUs T4, con un throughput medio de 36.663,6 tok/s, 14,03 TFLOPS y un MFU del 10,79 % frente al pico FP16 de 130 TFLOPS de las dos T4. Se registraron 4 pasos omitidos por inestabilidad numérica de 61.035 (99,993 % finitos). La mejor validación se obtuvo en el paso 60.000 (983,04M tokens) con `val_loss = 3.2412` y `val_ppl = 25.57`; la validación final en el paso 61.035 fue `val_loss = 3.2427` y `val_ppl = 25.60`. No se menciona RLHF, DPO ni fine-tuning de instrucciones.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt.
- Continuación de texto con coherencia local limitada; el modelo completa frases y párrafos cortos.
- Capacidad muy limitada de razonamiento y de conocimiento factual; los ejemplos de la model card muestran respuestas incorrectas sobre números primos y sobre la historia de la IA.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Monolingüe: solo inglés; no se ha entrenado ni evaluado en otros idiomas.
- Sin modo thinking, visión ni audio.
- Sin fine-tuning de instrucciones: no es un modelo de chat ni sigue instrucciones de forma fiable.

## Casos de uso

- Docencia y formación en entrenamiento de LLM: el repositorio incluye `train_transformer.py`, `convert_to_hf.py`, métricas crudas y gráficas, lo que permite reproducir un pipeline completo de preentrenamiento en JAX/Flax con dos T4 y estudiar el efecto del schedule, el batch y la precisión mixta.
- Investigación sobre tokenizadores de vocabulario reducido: con 16.384 entradas BPE a nivel de byte, sirve para analizar el compromiso entre tamaño de vocabulario, longitud efectiva de contexto y calidad de la tokenización en corpus educativos como FineWeb-Edu.
- Pruebas de infraestructura de inferencia: al ser un modelo de 50M en safetensors FP16 (100 MB), es útil para validar integraciones con `transformers`, TGI o endpoints compatibles antes de desplegar modelos mayores.
- Experimentos de destilación y ajuste: su tamaño reducido permite usarlo como alumno en destilación o como base para fine-tuning con LoRA en una sola GPU consumer, midiendo cuánto conocimiento se recupera con pocos recursos.
- Generación de texto de relleno y prototipado: para maquetar demos, tests de UI o pipelines de generación donde la calidad lingüística no es crítica y prima la latencia y el coste casi nulo.
- Estudio de curvas de escalado a pequeña escala: las métricas publicadas (loss, perplejidad, MFU, throughput) permiten contrastar predicciones de leyes de escalado con un punto de datos real y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son métricas de preentrenamiento:

| Metrica | Valor |
|---|---|
| Tokens entrenados | 999.997.440 (~1,00B) |
| Tiempo de pared / tiempo puro de entrenamiento | 27.572,3 s (~7 h 39 min) / 27.274,9 s (~7 h 35 min) |
| Throughput medio | 36.663,6 tok/s |
| Computo alcanzado / MFU | 14,03 TFLOPS / 10,79 % (pico 130 TFLOPS en 2×T4 FP16) |
| FLOPs por token | 382,68M |
| Mejor validación | val_loss 3,2412 / val_ppl 25,57 (paso 60.000) |
| Validación final | val_loss 3,2427 / val_ppl 25,60 (paso 61.035) |
| Estabilidad numérica | 4 pasos omitidos de 61.035 (99,993 % finitos) |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP16 (100,31 MB de pesos más caché de activaciones y KV para contexto de 1024 tokens); en FP32 rondaría los 200 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en T4, RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: `transformers` (verificado por el autor), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; no se documenta soporte nativo de llama.cpp, Ollama o vLLM, aunque la arquitectura Llama-style y el formato safetensors facilitan su conversión.
- Latencia y throughput de inferencia: no disponibles en la información proporcionada. El throughput de 36.663,6 tok/s corresponde al entrenamiento, no a la generación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables para establecer una comparación cuantitativa con alternativas de la misma categoría. A modo orientativo, se citan modelos pequeños de dominio público con arquitectura y propósito similares, sin afirmar superioridad ni equivalencia de rendimiento:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Xenron-50M | 50,15M | 1024 | MIT | Hugging Face (Anon170/xenron-50m) |
| SmolLM-135M (HuggingFaceTB) | 135M | 2048 | Apache 2.0 | Hugging Face |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Hugging Face |

La comparación de rendimiento entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Calidad lingüística muy baja: los ejemplos de la model card contienen errores factuales evidentes (definición incorrecta de número primo, afirmaciones sin sentido sobre la historia de la IA).
- Riesgo alto de alucinación y de texto incoherente más allá de unas pocas frases; no es apto para tareas que requieran precisión factual.
- Contexto limitado a 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Monolingüe en inglés; no se ha evaluado en castellano ni en otros idiomas.
- No está ajustado a instrucciones ni a diálogo: no sigue prompts de forma fiable y no debe usarse como asistente conversacional.
- Entrenado solo con FineWeb-Edu, un corpus filtrado por calidad educativa; puede reproducir sesgos presentes en ese corpus y carece de cobertura de dominios como código, matemáticas avanzadas o lenguas distintas del inglés.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; la responsabilidad del uso recae en el integrador.
- No se han publicado evaluaciones de seguridad, sesgo ni toxicidad; en producción requeriría filtros y validación adicionales.
- El modelo se publicó en 2026 según los metadatos del repositorio; verificar la vigencia y el mantenimiento del proyecto antes de depender de él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anon170/xenron-50m
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador original: `old-version/xenron_16k_tokenizer` (referenciado en el repositorio del modelo)
- Repositorio de código: no disponible como enlace independiente; los scripts `train_transformer.py` y `convert_to_hf.py` se describen dentro del repositorio de Hugging Face
- Paper, blog o demo: no disponibles en la información proporcionada
