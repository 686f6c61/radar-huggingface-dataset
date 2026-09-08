# Berlm/hyb16-edm-s0

## Resumen

`hyb16-edm-s0` es un modelo de lenguaje de investigación desarrollado por Berlm, diseñado para comparar distintos mezcladores de tokens en contextos largos. Forma parte de una familia de cinco modelos híbridos de 366 millones de parámetros entrenados con exactamente la misma receta (15.000 millones de tokens, secuencias de 16.384) para aislar el efecto de la capa de atención. El modelo concreto combina 18 capas GDN2 en su variante EDM (linear attention) con 6 capas de atención completa, lo que lo convierte en un banco de pruebas para estudiar arquitecturas híbridas de atención lineal y estándar.

El modelo es relevante porque aborda uno de los problemas centrales de los transformers actuales: el coste cuadrático de la atención. Al mezclar capas de atención lineal con capas de atención completa, consigue manejar ventanas de contexto de hasta 16.384 tokens manteniendo un coste de memoria y cómputo inferior al de un transformer puro. Además, al ser un modelo pequeño y de código abierto (licencia MIT), permite reproducir experimentos y comparar rápidamente alternativas de atención sin necesidad de infraestructura masiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas GDN2-EDM (linear attention) + 6 capas de atención completa gated |
| Parametros totales | 369.410.412 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | No disponible (solo pesos bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido de 24 capas con dimensión oculta 1024. Las 18 capas no completas utilizan GDN2 en su variante EDM, que implementa direcciones de lectura/escritura desacopladas y un factor de rango de puerta de 64. Estas capas se ejecutan con los kernels de `flash-linear-attention`. Las 6 capas restantes son de atención completa con una puerta sigmoide en la salida, situadas en las posiciones 3, 7, 11, 15, 19 y 23. Las capas lineales usan 6 cabezas de dimensión 128, mientras que las de atención completa usan 8 cabezas de 128. El MLP es SwiGLU con tamaño intermedio 2816, y las embeddings de entrada y salida están atadas. Las capas de atención completa no usan codificación posicional (NoPE); las capas de ventana deslizante usan RoPE con theta 10.000. El tokenizador es Llama-2 con 32.000 tokens y EOS id 2.

El entrenamiento se realizó sobre 15.000 millones de tokens de FineWeb-Edu, tokenizados con Llama-2 y empaquetados a secuencias de 16.384 sin enmascaramiento de documentos. El documento mediano tiene 686 tokens y la mitad de todos los tokens se encuentra en documentos de más de 2K. Se usó AdamW con una tasa de aprendizaje pico de 8e-4, un warmup de 1.500 millones de tokens y un schedule warmup-stable-decay que comienza a decaer en 13.500 millones de tokens. El batch global fue de 1.572.864 tokens (96 secuencias de 16.384), con 9.536 pasos de optimizador, semilla 0 y precisión bf16. Las capas de atención se ejecutan con flash-attn 2 (fa2) usando una ventana deslizante left-only.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Razonamiento de sentido común básico, con resultados en ARC, HellaSwag, PIQA, Winogrande, BoolQ, OpenBookQA y SocialIQA.
- Recuperación de información en contexto largo: mantiene una precisión alta en tareas de una aguja hasta 32K y en tareas de tres agujas hasta 16K.
- Manejo de secuencias de hasta 32K en evaluación, aunque fue entrenado a 16K.
- No soporta tool calling, function calling ni modos de agente.
- No es multimodal; solo procesa texto.
- Idiomas: inglés.

## Casos de uso

- Investigación en arquitecturas de atención: el modelo sirve como banco de pruebas para comparar el mezclador GDN2-EDM frente a variantes de ventana deslizante en tareas de contexto largo. Se usaría ejecutando la suite de evaluación de la model card y analizando la pérdida de validación y la recuperación de agujas.
- Evaluación de recuperación de información en documentos largos: gracias a su contexto de 16K y a su buen rendimiento en needle-3 a 16K/32K, puede usarse para probar pipelines de retrieval sobre documentos largos, por ejemplo en tareas de single-needle donde se inserta un dato y se pregunta por él.
- Prototipado de asistentes de texto con memoria larga: en entornos de investigación, permite experimentar con conversaciones de más de 10K tokens sin perder el hilo, gracias a las capas de atención lineal.
- Análisis de corpus académicos: se puede emplear para resumir o extraer información de artículos largos en inglés donde el contexto completo cabe en la ventana de 16K.
- Educación y benchmarks para modelos de atención lineal: al ser un modelo pequeño y de código abierto, es útil en cursos o talleres para enseñar cómo funcionan los híbridos de atención lineal y completa, y para reproducir experimentos.
- Generación de texto con dependencias largas: para tareas de razonamiento simple que requieren recordar información de los primeros tokens, como responder preguntas sobre un párrafo extenso.
- Comparación de mezcladores de tokens: el modelo es parte de una familia de cinco, por lo que se puede usar para aislar el efecto del mezclador en el rendimiento, manteniendo el resto de la arquitectura fija.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. La evaluación disponible es una suite zero-shot interna (lm-eval-harness 0.4.12) y una prueba de recuperación de agujas estilo RULER.

Resultados de evaluación zero-shot (accuracy salvo que se indique lo contrario):

| metric | this model | gdn2 | edm | swa1k | swa2k | mix |
|---|---|---|---|---|---|---|
| final val loss (nats) | **2.2977** | 2.3055 | 2.2977 | 2.3245 | 2.3289 | 2.3156 |
| arc_easy / arc_challenge | **59.7 / 25.2** | 59.4 / 26.1 | 59.7 / 25.2 | 57.0 / 25.0 | 55.0 / 25.0 | 57.1 / 25.1 |
| hellaswag (acc_norm) | **42.0** | 41.5 | 42.0 | 40.7 | 40.8 | 41.5 |
| piqa / winogrande / boolq | **67.3 / 52.2 / 59.5** | 66.5 / 52.5 / 56.5 | 67.3 / 52.2 / 59.5 | 66.5 / 50.4 / 61.0 | 64.7 / 52.5 / 58.7 | 67.1 / 53.0 / 58.8 |
| openbookqa (acc_norm) | **31.8** | 33.4 | 31.8 | 32.0 | 31.2 | 31.6 |
| lambada acc / ppl | **35.9 / 28.2** | 35.5 / 29.9 | 35.9 / 28.2 | 33.4 / 37.4 | 37.4 / 29.3 | 34.6 / 31.5 |
| wikitext word ppl | **24.3** | 24.8 | 24.3 | 25.1 | 25.3 | 25.1 |
| swde / fda / squad_completion | **55.5 / 62.1 / 38.4** | 56.0 / 66.2 / 36.7 | 55.5 / 62.1 / 38.4 | 47.9 / 51.5 / 21.8 | 50.9 / 13.2 / 21.5 | 53.8 / 13.6 / 35.4 |
| social_iqa (prompt-qualified) | **39.0** | 38.8 | 39.0 | 37.8 | 37.5 | 37.9 |

Recuperación de una sola aguja (S-NIAH, 500 muestras por celda, fracción correcta):

| metric | this model | gdn2 | edm | swa1k | swa2k | mix |
|---|---|---|---|---|---|---|
| needle-1 @1K/2K/4K/8K | **1.00/1.00/1.00/1.00** | 1.00/1.00/1.00/1.00 | 1.00/1.00/1.00/1.00 | 1.00/0.98/0.96/0.94 | 1.00/1.00/0.52/0.28 | 1.00/1.00/0.53/0.28 |
| needle-1 @16K/32K | **1.00/1.00** | 1.00/1.00 | 1.00/1.00 | 0.95/0.94 | 0.15/0.05 | 0.15/0.05 |
| needle-2 @1K/2K/4K/8K | **1.00/1.00/1.00/0.97** | 1.00/1.00/1.00/1.00 | 1.00/1.00/1.00/0.97 | 1.00/0.99/0.98/0.81 | 0.94/0.71/0.42/0.25 | 1.00/1.00/0.48/0.20 |
| needle-2 @16K/32K | **0.94/0.65** | 0.93/0.37 | 0.94/0.65 | 0.88/0.63 | 0.15/0.08 | 0.13/0.08 |
| needle-3 @1K/2K/4K/8K | **0.96/0.95/0.84/0.54** | 0.98/0.98/0.91/0.63 | 0.96/0.95/0.84/0.54 | 0.99/0.94/0.76/0.37 | 0.18/0.30/0.29/0.25 | 0.98/0.98/0.30/0.01 |
| needle-3 @16K/32K | **0.45/0.20** | 0.17/0.04 | 0.45/0.20 | 0.16/0.09 | 0.16/0.06 | 0.00/0.00 |

Nota: todos los números provienen de una sola semilla. Las diferencias inferiores a medio punto se consideran ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 0,74 GB. Con activaciones y cache de KV, se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de VRAM, por ejemplo RTX 3060 12GB, A100 40GB, H100 80GB.
- Sí cabe en GPU de consumo, siempre que tengan 4 GB o más de VRAM.
- Opciones de despliegue: requiere un entorno Python con `torch`, `transformers`, `flash-linear-attention`, `flash-attn`, `triton` y `einops`. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los cinco modelos de la familia comparten parámetros, contexto, datos, tokenizador, optimizador y schedule. Solo difieren en las 18 capas de atención no completa.

| Modelo | Capas lineales | Val loss | Needle-3 @16K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hyb16-edm-s0 | GDN2-EDM | 2.2977 | 0.45 | MIT | HuggingFace |
| hyb16-gdn2-s0 | GDN2 | 2.3055 | 0.17 | MIT | HuggingFace |
| hyb16-swa1k-s0 | SWA 1K | 2.3245 | 0.16 | MIT | HuggingFace |
| hyb16-swa2k-s0 | SWA 2K | 2.3289 | 0.16 | MIT | HuggingFace |
| hyb16-mix-s0 | Mixto | 2.3156 | 0.00 | MIT | HuggingFace |

## Limitaciones y advertencias

- Modelo pequeño de investigación entrenado solo con 15.000 millones de tokens, por lo que sus capacidades generales son limitadas en comparación con modelos grandes.
- Solo soporta inglés; no se ha evaluado su rendimiento en otros idiomas.
- Requiere código personalizado (`trust_remote_code=True`) y dependencias específicas no incluidas en el repositorio, lo que dificulta su integración en entornos estándar.
- Riesgo de alucinación alto en tareas complejas o de razonamiento profundo.
- No se han realizado evaluaciones de sesgos; puede heredar sesgos presentes en FineWeb-Edu.
- Los resultados de evaluación provienen de una sola semilla y las diferencias pequeñas deben interpretarse con cautela.
- Al ser un modelo de investigación, no está optimizado para producción ni para cargas de trabajo reales de alto volumen.

## Enlaces

- HuggingFace: https://huggingface.co/Berlm/hyb16-edm-s0
- Modelos hermanos:
  - https://huggingface.co/Berlm/hyb16-gdn2-s0
  - https://huggingface.co/Berlm/hyb16-swa1k-s0
  - https://huggingface.co/Berlm/hyb16-swa2k-s0
  - https://huggingface.co/Berlm/hyb16-mix-s0
