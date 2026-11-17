# building-an-inference-engine-from-scratch/smollm2-135m-reference

## Resumen

`smollm2-135m-reference` no es un modelo entrenado, sino un repositorio de artefactos de referencia publicado por el proyecto *Building an Inference Engine from Scratch*. Contiene las activaciones intermedias que produce `HuggingFaceTB/SmolLM2-135M-Instruct` al procesar un único prompt de 19 tokens ("The capital of France is Paris. 추론 엔진"), calculadas con PyTorch en CPU y precisión f32. Su propósito es servir de patrón de verificación capa por capa para `badak`, el motor de inferencia en Rust que se construye en los capítulos 9 y 10 del libro homónimo.

El repositorio no incluye pesos del modelo. Lo que publica es un fichero `reference.safetensors` con tensores intermedios (embeddings, normalizaciones, proyecciones Q/K/V, matrices de atención, salidas de MLP, `hidden_states` de las 30 capas y logits finales) más un `tokenizer_vectors.json` con identificadores de tokens generados por el tokenizer original para un conjunto de cadenas de prueba. El tamaño del repo es de 0,0 GB según Hugging Face, coherente con la ausencia de pesos.

Es relevante para quien esté implementando kernels de inferencia desde cero (en Rust, C++, CUDA o cualquier otro lenguaje) y necesite un oráculo numérico reproducible con el que comparar su implementación. Al estar construido sobre SmolLM2-135M-Instruct, hereda las dimensiones de ese modelo: 576 de dimensión oculta, 9 cabezas de atención, 30 capas y vocabulario de 49 152 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de activaciones de referencia; el modelo base SmolLM2-135M-Instruct es un transformer decoder-only) |
| Parámetros totales | no disponible (el repo no contiene pesos; el modelo base tiene 135 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el artefacto cubre un prompt de 19 tokens) |
| Tipos de cuantización | no disponible (las activaciones se calcularon en f32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`reference.safetensors`) y JSON (`tokenizer_vectors.json`); no contiene pesos del modelo |

## Arquitectura y entrenamiento

Este repositorio no entrena ni define arquitectura propia: es un conjunto de activaciones de referencia derivadas de SmolLM2-135M-Instruct. Según la model card, los tensores se generaron con `reference/ch09_llama_reference.py`, usando transformers 5.23.0 y torch 2.15.0, con los pesos del modelo base expandidos a f32 y ejecutados en CPU. El script se invoca mediante `scripts/download_smollm2.sh` seguido de `python reference/ch09_llama_reference.py smollm2_135m`.

El contenido de `reference.safetensors` cubre un único forward pass sobre un prompt de 19 tokens. Incluye `ids` con forma `(19)`, `embed` con `(19, 576)`, las proyecciones del primer bloque (`l0.norm1`, `l0.q`, `l0.k`, `l0.v`), las matrices de atención `l0.attn_weights` con forma `(9, 19, 19)` (9 cabezas, 19 posiciones), el resto del primer bloque (`l0.attn`, `l0.norm2`, `l0.mlp`, `l0.out`), la pila completa `hidden_states` con `(31, 19, 576)` —embedding más salida de cada uno de los 30 bloques, con la última entrada ya normalizada—, `final_norm` con `(19, 576)` y `logits` con `(19, 49152)`. El fichero `tokenizer_vectors.json` se generó con `reference/ch10_tokenizer_vectors.py smollm2_135m` leyendo el `tokenizer.json` original mediante Hugging Face tokenizers, sin anteponer token de inicio de secuencia.

La innovación técnica aquí no está en el modelo, sino en el método: exponer tensores intermedios con nombres y formas estables permite depurar un motor propio capa a capa (comparando `l0.q`, `l0.attn_weights`, `hidden_states[i]`, etc.) en lugar de limitarse a comparar la salida final. La model card advierte explícitamente de que la última entrada de `hidden_states` lleva aplicada la normalización final, tal como la devuelve transformers.

## Capacidades

- No es un modelo ejecutable: no genera texto, no razona y no responde a prompts.
- Proporciona activaciones de referencia (embeddings, Q/K/V, atención, MLP, hidden states, logits) para validar una implementación de inferencia.
- Proporciona vectores de tokens de prueba para validar la integración del tokenizer de SmolLM2.
- Cubre las 30 capas del modelo base en `hidden_states` y los 49 152 logits del vocabulario.
- Sirve como oráculo numérico reproducible en f32/CPU con versiones concretas de transformers y torch.
- No soporta tool calling, agentes, visión, audio ni modo thinking: esas capacidades, si existen, pertenecen al modelo base y no a este repositorio.

## Casos de uso

- Verificación de kernels de atención: comparar la matriz `l0.attn_weights` de forma `(9, 19, 19)` con la producida por el motor propio para detectar errores en el escalado, la máscara causal o la disposición de cabezas.
- Depuración de la pila de capas: comparar `hidden_states[i]` con forma `(19, 576)` capa a capa para localizar en qué bloque diverge la implementación (por ejemplo, un fallo en la normalización RMSNorm o en la MLP).
- Validación de la capa de embeddings: contrastar `embed` con `(19, 576)` para confirmar que la tabla de embeddings se carga con el orden y la orientación correctos.
- Comprobación de la cabeza de salida: comparar `logits` con `(19, 49152)` para verificar la proyección final y el sesgo de la LM head antes de aplicar softmax o muestreo.
- Integración del tokenizer: usar `tokenizer_vectors.json` para validar que la tokenización de cadenas de prueba coincide con la del `tokenizer.json` original de SmolLM2, sin token BOS.
- Desarrollo de tests de regresión numérica en CI: fijar tolerancias (por ejemplo, error absoluto máximo por tensor) contra estos artefactos para detectar regresiones al optimizar kernels (SIMD, paralelización, fusión de operaciones).
- Material didáctico: acompañar los capítulos 9 y 10 del libro para que el lector pueda reproducir el forward pass y comparar su motor `badak` con la referencia de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no evalúa calidad del modelo, sino que expone activaciones de un único prompt para verificación numérica.

## Requisitos de hardware

- No requiere GPU: las activaciones se generaron en CPU con pesos en f32.
- Almacenamiento: el repo ocupa 0,0 GB según Hugging Face; el fichero principal es `reference.safetensors` con tensores de dimensiones pequeñas (el mayor, `logits`, es `(19, 49152)` en f32, aproximadamente 3,7 MB).
- Memoria: suficiente con unos pocos cientos de MB para cargar el safetensors y comparar tensores; no se necesita cargar el modelo base para usar los artefactos, solo si se quiere regenerarlos.
- Para regenerar los artefactos hace falta descargar SmolLM2-135M-Instruct y ejecutar el script con transformers 5.23.0 y torch 2.15.0; el modelo base de 135 M cabe en CPU y en cualquier GPU consumer con varios GB de VRAM.
- Opciones de despliegue: no aplica (no hay pesos que servir); el consumo es mediante carga directa del safetensors en Python, Rust u otro lenguaje.
- Latencia y throughput: no disponibles; no es un artefacto de inferencia.

## Comparativa con modelos similares

| Repositorio | Tipo de artefacto | Modelo base | Contenido | Licencia |
|---|---|---|---|---|
| `building-an-inference-engine-from-scratch/smollm2-135m-reference` | Activaciones de referencia | SmolLM2-135M-Instruct | Tensores intermedios de un prompt de 19 tokens y vectores de tokenizer | Apache 2.0 |
| `HuggingFaceTB/SmolLM2-135M-Instruct` | Modelo ejecutable | — | Pesos, tokenizer y model card | Apache 2.0 |
| Otros repos de referencia de motores de inferencia | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros repositorios comparables de activaciones de referencia en la documentación proporcionada.

## Limitaciones y advertencias

- No contiene pesos: no se puede usar para inferencia ni para generar texto.
- Cubre un único prompt de 19 tokens; no valida comportamiento con secuencias largas, batch, máscaras de padding ni decodificación autoregresiva completa.
- Los valores están calculados en f32 sobre CPU; una implementación en f16, bf16 o con kernels fusionados puede desviarse y requerirá tolerancias adecuadas.
- Depende de versiones concretas (transformers 5.23.0, torch 2.15.0); cambios en transformers pueden alterar detalles numéricos de la referencia si se regenera.
- La última entrada de `hidden_states` lleva la normalización final aplicada, lo que puede confundir si se compara ingenuamente con la salida del último bloque.
- `tokenizer_vectors.json` no antepone token de inicio de secuencia; hay que tenerlo en cuenta al comparar con pipelines que sí lo añaden.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas del modelo base en esta documentación; esas advertencias corresponden a SmolLM2-135M-Instruct.
- La licencia Apache 2.0 se hereda del modelo base; el uso comercial de estos artefactos está permitido bajo esa licencia, pero conviene revisar también los términos del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/building-an-inference-engine-from-scratch/smollm2-135m-reference
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Libro: https://chosungmann.github.io/building-an-inference-engine-from-scratch/
- Código: https://github.com/chosungmann/building-an-inference-engine-from-scratch
