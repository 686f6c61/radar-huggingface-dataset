# Ayt1da/qwen-in-qwen-tiny

## Resumen

Qwen in Qwen Tiny es un modelo de lenguaje de 1,51 millones de parámetros construido desde cero con la arquitectura Qwen3.5 y entrenado exclusivamente sobre el corpus TinyStories. Lo desarrolla Ayt1da como artefacto de investigación dentro del proyecto Qwen in Qwen, cuyo objetivo es demostrar que una red neuronal puede emular por completo la ejecución de una CPU RISC-V que, a su vez, ejecuta este mismo modelo cuantizado a int8. El modelo no deriva de pesos preentrenados de Qwen: solo comparte la arquitectura.

La relevancia es fundamentalmente metodológica. El modelo interior (este checkpoint) se cargó como imagen de datos en la RAM de una CPU RISC-V emulada dentro de una red Qwen3.5 de 65 capas con pesos fijos, y la red exterior reprodujo token a token la traza de ejecución completa: 35.836.005 tokens sin una sola discrepancia frente a una referencia independiente. Eso convierte al conjunto en una prueba de concepto de compilación de programas dentro de pesos de transformer.

Arquitectura híbrida con Gated DeltaNet (atención lineal) y atención completa cada cuarto bloque, 8 capas, dimensión oculta 128 y vocabulario de 1.024 tokens. Es un modelo de juguete para narrativa infantil en inglés, sin utilidad como asistente general, pero con un valor técnico y reproducible considerable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`qwen3_5_text`), híbrida: Gated DeltaNet (atención lineal) + atención completa |
| Parámetros totales | 1.510.800 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (contexto de entrenamiento) |
| Tipos de cuantización | int8 (imagen `in-cpu/drom-image.bin`); checkpoint float en safetensors |
| Idiomas soportados | inglés (estilo TinyStories) |
| Licencia | MIT (los pesos); los datos de entrenamiento TinyStories están bajo CDLA-Sharing-1.0 |
| Formato de pesos | safetensors (float), binario de imagen de datos para CPU emulada |

Detalles adicionales de arquitectura: 8 capas (6 DeltaNet, atención completa en las capas 3 y 7), dimensión oculta 128, MLP de 344, 4 cabezas de consulta y 1 de clave-valor (dimensión de cabeza 32), atención lineal con 2 cabezas de clave y 4 de valor (dimensión 16, kernel de convolución 4), RoPE parcial con factor 0.25, embeddings atados y vocabulario de 1.024 tokens.

## Arquitectura y entrenamiento

El modelo replica el layout híbrido de la red exterior en la que se ejecutó: Gated DeltaNet como mecanismo de atención lineal en la mayoría de capas y atención completa cada cuarto bloque. La red exterior tenía 65 capas (64 DeltaNet más 1 de atención completa) y dimensión oculta 2.304; este modelo interior tiene 8 capas y dimensión 128, con los pesos colocados por un compilador en el caso exterior y entrenados en el caso interior.

El entrenamiento se hizo desde cero sobre roneneldan/TinyStories: el shard 0 se reservó para validación y los shards 1-49 para entrenamiento. Tokenizador SentencePiece BPE de 1.024 tokens con byte fallback, entrenado sobre los shards 1-10 con `train_vocab` de llama2.c; la conversión a `tokenizer.json` de Hugging Face coincidió con SentencePiece en 3.000 cadenas aleatorias. Se ejecutaron 60.000 pasos con batch 16, contexto 128, learning rate 1e-3, 200 pasos de warmup y semilla 1234, en 43,5 minutos sobre una RTX 5070 Ti con torch 2.14.1 y transformers 5.21.0. La estimación final de validación es de 1,540 nats/token sobre 20.480 objetivos (estimación en coma flotante, no pérdida entera sobre held-out).

La innovación técnica no está en el entrenamiento sino en el montaje: los pesos int8 se redondearon usando la covarianza de activaciones de 64 extractos reservados de TinyStories, con tablas de búsqueda de punto medio para las no linealidades. Una ejecución de seis posiciones consumió 25.121.038 instrucciones RV32IM, incluidas 2.257.920 instrucciones `ndot4` de producto escalar que cubren todas las multiplicaciones de matrices.

## Capacidades

- Generación de texto narrativo corto en inglés con estilo TinyStories (cuentos infantiles simples, vocabulario reducido).
- Decodificación greedy determinista: con el prompt "Once" produce exactamente "Once upon a time, there" en `transformers` estándar.
- Continuación de texto con coherencia local dentro de su dominio de entrenamiento.
- Ejecución en CPU sin GPU: el checkpoint float corre en `transformers` 5.x con `Qwen3_5ForCausalLM`; los kernels `flash-linear-attention` y `causal-conv1d` son opcionales y solo aceleran.
- Reproducción de inferencia int8 equivalente a la float en la mayoría de predicciones (291 de 327 en seis prompts inspeccionados).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüe: no; solo inglés de dominio TinyStories.

## Casos de uso

- Reproducción de experimentos de interpretabilidad: sirve para replicar el montaje Qwen in Qwen y verificar que una red exterior puede emular una CPU que ejecuta un transformer cuantizado, con la traza completa y hashes SHA-256 publicados.
- Docencia en arquitecturas híbridas: con 1,51 M de parámetros y 8 capas, es un ejemplo manejable para explicar Gated DeltaNet, atención lineal, RoPE parcial y embeddings atados sin necesidad de infraestructura grande.
- Pruebas de pipelines de tokenización: el par `tokenizer.model` (SentencePiece original) y `tokenizer.json` (conversión HF) permite validar equivalencias de tokenizadores en proyectos que migran de llama2.c a `transformers`.
- Validación de cuantización int8: el binario `in-cpu/drom-image.bin` y los datos de acuerdo float/int8 permiten estudiar el impacto del redondeo por covarianza de activaciones en modelos pequeños.
- Benchmark de kernels de atención lineal: al incluir DeltaNet y atención completa, sirve para medir el rendimiento de `flash-linear-attention` y `causal-conv1d` en un caso mínimo y controlado.
- Generación de cuentos sintéticos de dominio restringido: puede producir narrativa infantil simple en inglés para pruebas de pipelines de datos, aunque la calidad y variedad son muy limitadas.
- Verificación de despliegues en CPU: útil como caso de prueba de inferencia en hardware sin GPU (incluida la emulación RISC-V del proyecto original).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento publicados son los del montaje experimental:

| Métrica | Valor |
|---|---|
| Pérdida de validación estimada | 1,540 nats/token (20.480 objetivos) |
| Pasos de entrenamiento | 60.000 |
| Tiempo de entrenamiento | 43,5 min en RTX 5070 Ti |
| Tokens de la traza exterior verificada | 35.836.005 |
| Discrepancias en la traza | 0 |
| Tiempo de la traza completa | 2 h 47 min en RTX 5070 Ti (~27,8 min/token) |
| Acuerdo int8 vs float (greedy) | 291/327 predicciones en 6 prompts |
| Instrucciones RV32IM por 6 posiciones | 25.121.038 (2.257.920 `ndot4`) |

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula; el checkpoint float de 1,51 M de parámetros ocupa unos pocos MB y cabe en CPU.
- GPU recomendadas: ninguna en particular; el autor lo ejecutó en una RTX 5070 Ti, pero el modelo corre en CPU sin problema.
- Cabe en cualquier GPU de consumo, incluida una iGPU o incluso solo CPU; no requiere CUDA.
- Opciones de despliegue: `transformers` 5.x con `Qwen3_5ForCausalLM` (requisito), más `flash-linear-attention` y `causal-conv1d` opcionales para acelerar. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma sistemática; el dato publicado es el de la traza completa dentro de la red exterior (27,8 minutos por token), que no refleja la inferencia directa del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen in Qwen Tiny | 1,51 M | 128 | Qwen3.5 híbrida (DeltaNet + atención completa) | MIT | Hugging Face |
| Modelos TinyStories de referencia (p. ej. variantes de llama2.c) | ~1-15 M | 128-256 | Transformer denso | MIT / variable | Repositorios de investigación |
| Modelos de juguete tipo nanoGPT | ~0,1-10 M | variable | Transformer denso | MIT | GitHub |

La comparación con alternativas de la misma categoría es limitada: no hay datos de benchmarks comunes publicados en la información disponible, y los modelos TinyStories de referencia no se especifican con nombre y versión. La diferencia principal frente a un transformer denso de tamaño similar es la arquitectura híbrida con Gated DeltaNet, que reduce el coste de atención a coste lineal en 6 de las 8 capas.

## Limitaciones y advertencias

- Artefacto de investigación: 1,51 M de parámetros y vocabulario de 1.024 tokens; no es útil como asistente general.
- Solo conoce inglés en estilo TinyStories; fuera de ese dominio produce texto incoherente o sin sentido.
- Contexto de 128 tokens, insuficiente para conversaciones multi-turno o documentos.
- Riesgo alto de alucinación y de deriva narrativa fuera de cuentos infantiles simples.
- No hay evaluación de sesgos publicada; el corpus TinyStories es sintético y puede contener sesgos de plantilla.
- Licencia MIT para pesos y código, pero los datos de entrenamiento (TinyStories) están bajo CDLA-Sharing-1.0 y sus términos aplican por separado.
- La cuantización int8 se ajustó con los mismos seis prompts usados para medir el acuerdo, por lo que la cifra de 291/327 no es un benchmark sobre datos no vistos.
- Requiere `transformers` 5.x con `Qwen3_5ForCausalLM`; versiones anteriores no cargan el modelo.
- La pérdida de validación es una estimación en coma flotante, no una pérdida entera sobre held-out.
- No dispone de tool calling, agentes, visión ni otras capacidades modernas; cualquier uso en producción requeriría un modelo distinto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ayt1da/qwen-in-qwen-tiny
- Repositorio del proyecto Qwen in Qwen: https://github.com/Ad1tyaNarayana/qwen-in-qwen
- Qwenputer (construcción CPU-en-pesos, por Divyansh Agrawal): https://github.com/divagr18/qwenputer
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Licencia de TinyStories (CDLA-Sharing-1.0): https://huggingface.co/datasets/roneneldan/TinyStories/blob/main/LICENSE
- llama2.c (tokenizador y partes del pipeline): https://github.com/karpathy/llama2.c
