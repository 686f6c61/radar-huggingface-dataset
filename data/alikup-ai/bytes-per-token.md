# alikup-ai/bytes-per-token

## Resumen

bytes-per-token es una familia de modelos de lenguaje en miniatura desarrollada por alikup-ai, diseñados específicamente para ejecutarse en microcontroladores de bajo coste como el ESP32-S3. El objetivo del proyecto no es competir en calidad de generación con modelos convencionales, sino optimizar una métrica concreta: el número de bytes de pesos que el microcontrolador debe leer desde PSRAM por cada token generado. Para ello, los modelos se entrenan con cuantización consciente (QAT) a 4 bits y se despliegan en int4 directamente sobre la placa.

La arquitectura es un decoder estilo Llama de 6 capas, 4 cabezas de atención, contexto de 256 tokens, RoPE y RMSNorm, con dos variantes: `varC_long_s0` (8,6M parámetros almacenados, 1,16 MB leídos por token) y `combo_s0` (3,4M parámetros, 0,90 MB por token). Incorpora dos decisiones técnicas destacables: una FFN con activación ReLU en lugar de SwiGLU, que produce aproximadamente un 79% de neuronas a cero por token y permite al motor saltarse sus filas, y embeddings por capa (PLE), una idea tomada de Gemma 3n que mantiene una tabla de tokens por capa en flash y solo lee la del token actual.

El modelo se entrena exclusivamente con las primeras 300 MiB de TinyStoriesV2-GPT4-train, por lo que su competencia se limita a continuar historias infantiles sencillas en inglés. Es relevante ahora como referencia técnica para quienes exploran inferencia de LM en hardware embebido: demuestra que un ESP32-S3 de aproximadamente 8 dólares puede generar texto a unos 90 tokens por segundo, con una calidad (0,6253 bits/byte en validación) que supera a alternativas de mayor tamaño como slvDev/esp32-ai (28,9M parámetros, 0,863 bits/byte).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer), 6 capas, 4 cabezas, RoPE, RMSNorm, FFN con ReLU, embeddings por capa (PLE) |
| Parametros totales | `varC_long_s0`: 8,6M almacenados; `combo_s0`: 3,4M almacenados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | Int4 con QAT (group-wise); pesos PyTorch en safetensors y pack int4 (`model.pack`) para el motor ESP32-S3 |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (PyTorch), `model.pack` (int4 para ESP32-S3), `config.json`, `tokenizer.json` |

Detalles de forma por variante:

| Modelo | d_model | FFN | Vocabulario | Dim. PLE |
|---|---:|---:|---:|---:|
| `varC_long_s0` | 128 | 256 | 8192 | 128 |
| `combo_s0` | 128 | 320 | 4096 | 64 |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 6 capas con 4 cabezas de atención, dimensión de modelo 128, RoPE y RMSNorm. La innovación principal está en la FFN: se sustituye SwiGLU por una activación ReLU, lo que produce una dispersión de aproximadamente el 79% de neuronas a cero por token; el motor de inferencia en el ESP32-S3 aprovecha esa dispersión para saltarse las filas correspondientes y reducir los bytes leídos desde PSRAM. Además, se emplean embeddings por capa (PLE), inspirados en Gemma 3n: una tabla de tokens por capa almacenada en flash que solo se lee para el token actual, lo que reduce el tráfico de memoria durante la decodificación. Los embeddings de entrada y la capa de salida están atados.

El entrenamiento usa las primeras 300 MiB de `TinyStoriesV2-GPT4-train.txt` del dataset roneneldan/TinyStories. `varC_long_s0` se entrena con 70M tokens (aproximadamente 0,9 épocas) y `combo_s0` con 20M tokens, con AdamW, learning rate 3e-3, batch de 32×256 y una sola semilla, en CPU de portátil (unas 2,6 horas para `varC_long_s0`). La cuantización a 4 bits se aplica mediante QAT group-wise, de modo que los pesos desplegados en la placa son int4 nativos y no una conversión post-entrenamiento.

## Capacidades

- Generación de texto en inglés: continuación de historias infantiles sencillas del estilo TinyStories.
- Modelado de lenguaje autorregresivo con contexto de 256 tokens.
- Inferencia en microcontrolador: ejecución en int4 sobre ESP32-S3 con PSRAM, a unos 90 tok/s al inicio del contexto y ~81 tok/s de media en 256 tokens para `varC_long_s0`; ~113 tok/s iniciales y ~88 de media para `combo_s0`.
- Tokenizador byte-level BPE con `<|endoftext|>` como separador entre historias.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta instrucciones ni preguntas generales: no es un modelo instruction-tuned.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo: solo inglés.

## Casos de uso

- Demostración educativa de inferencia de LM en hardware embebido: usar el firmware de ejemplo y las imágenes completas de la release de GitHub para mostrar generación de texto en un ESP32-S3-N16R8, con la métrica de bytes leídos por token como hilo conductor didáctico.
- Investigación sobre eficiencia memoria-cómputo en edge AI: servir como baseline reproducible para medir bits/byte y tokens por segundo en microcontroladores, comparando variantes y configuraciones de cuantización.
- Evaluación de QAT a 4 bits en modelos minúsculos: entrenar variantes con el código de `train/model.py` y medir el impacto de la cuantización en la perplejidad y en la velocidad de decodificación.
- Pruebas de concepto de dispositivos de bajo consumo con texto generativo: juguetes, placas de demostración o instalaciones interactivas que generen continuaciones de historias cortas en inglés sin conexión a red.
- Benchmark de referencia para proyectos de LM en MCU: comparar nuevas propuestas contra los valores publicados (0,6253 bits/byte para `varC_long_s0`, 0,7322 para `combo_s0`) usando el mismo procedimiento de `bench_pc.py`.
- Estudio de arquitecturas con activación dispersa: analizar el efecto de ReLU frente a SwiGLU en la proporción de neuronas a cero y en el ahorro de ancho de banda de memoria en el motor de inferencia.
- Prototipado de tokenizadores y empaquetado int4 para despliegue en flash: reutilizar `tokenizer.json` y el formato `model.pack` en pipelines propios de despliegue embebido.

## Benchmarks y rendimiento

Los datos publicados por el autor son de calidad de modelado (bits por byte) y de velocidad en placa, no benchmarks estándar tipo MMLU o HumanEval.

| Modelo | Params almacenados | Pesos leídos por token (int4) | Bits/byte en TinyStories valid | Velocidad en ESP32-S3-N16R8 |
|---|---:|---:|---:|---:|
| `varC_long_s0` | 8,6M | 1,16 MB | 0,6253 | ~90 tok/s al inicio, ~81 de media en 256 tokens |
| `combo_s0` | 3,4M | 0,90 MB | 0,7322 | ~113 tok/s al inicio, ~88 de media |
| slvDev/esp32-ai (referencia) | 28,9M | no disponible | 0,863 | no disponible |

Procedimiento de medida: primeras 5.000 historias de `TinyStoriesV2-GPT4-valid.txt` (saltando la primera, parcial), unidas por `<|endoftext|>`, evaluadas en ventanas no solapadas de 256 tokens, con la pérdida total en bits dividida por los bytes UTF-8. Reproducible con `python bench_pc.py` del repositorio de GitHub.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: irrelevante en el caso de uso objetivo; el modelo se ejecuta en un microcontrolador con PSRAM, no en GPU. En PyTorch, los pesos en safetensors ocupan del orden de decenas de MB.
- Hardware objetivo: ESP32-S3-N16R8 (16 MB de flash, 8 MB de PSRAM), con el pack int4 flasheado en 0x90000 mediante el firmware de demostración.
- GPU recomendadas: no aplica para el despliegue previsto; para entrenamiento o evaluación en PC basta una CPU de portátil (el autor entrenó `varC_long_s0` en unas 2,6 horas en CPU).
- ¿Cabe en GPU de consumo? Sí, con enorme holgura, pero ese no es el escenario de uso.
- Opciones de despliegue: motor propio del repositorio de GitHub sobre ESP32-S3; en PC, el código de `train/model.py` con los pesos safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~90 tok/s iniciales y ~81 de media en 256 tokens para `varC_long_s0`; ~113 y ~88 respectivamente para `combo_s0`, medidos en ESP32-S3-N16R8.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Calidad (bits/byte, TinyStories valid) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `varC_long_s0` (este repo) | 8,6M | 256 | 0,6253 | MIT | Hugging Face + GitHub |
| `combo_s0` (este repo) | 3,4M | 256 | 0,7322 | MIT | Hugging Face + GitHub |
| slvDev/esp32-ai | 28,9M | no disponible | 0,863 | no disponible | GitHub |
| Modelos TinyStories convencionales (p. ej. variantes Llama pequeñas) | variable | variable | no disponible en esta ficha | variable | Hugging Face |

La comparación relevante es con slvDev/esp32-ai, la referencia citada por el autor: pese a tener 28,9M parámetros frente a 8,6M, obtiene 0,863 bits/byte frente a 0,6253, es decir, peor calidad de modelado con más del triple de parámetros. El resto de alternativas comparables en el nicho de LM para microcontroladores no está documentado en la información disponible.

## Limitaciones y advertencias

- Entrenado solo con historias infantiles sintéticas de TinyStories: continúa historias simples en inglés y no sigue instrucciones ni responde preguntas generales.
- Contexto muy corto: 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Una sola semilla de entrenamiento por modelo; las diferencias pequeñas entre variantes están dentro del ruido de semilla (~0,003 bits/byte).
- Riesgo alto de alucinación y de incoherencia fuera del dominio de historias infantiles; no debe usarse como asistente general.
- Solo inglés; no hay soporte multilingüe.
- Licencia MIT: permite uso comercial, pero el modelo carece de garantías y su calidad no es apta para producción en tareas de lenguaje general.
- Sin datos publicados sobre sesgos; el dataset TinyStories es sintético y de dominio acotado, lo que limita la exposición a sesgos del mundo real pero también la generalización.
- El despliegue en placa requiere el motor y el formato `model.pack` específicos del proyecto; no hay integración con runtimes estándar de inferencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: proyecto reciente y sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alikup-ai/bytes-per-token
- Repositorio GitHub: https://github.com/alikup-ai/bytes-per-token
- Releases con imágenes completas para flashear: https://github.com/alikup-ai/bytes-per-token/releases
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Referencia comparada slvDev/esp32-ai: https://github.com/slvDev/esp32-ai
