# pratikgx/Aion-1.0-Instruct-2.3B-MLX-4bit

## Resumen

Aion-1.0-Instruct-2.3B-MLX-4bit es una conversión cuantizada a 4 bits para MLX del modelo instructivo `microsoft/Aion-1.0-Instruct-2.3B`, desarrollado por el grupo Windows Applied Sciences de Microsoft. El modelo original es un transformer de tipo instructivo de aproximadamente 2.290 millones de parámetros con una ventana de contexto de 32K tokens, orientado a generación de texto conversacional y tareas de instrucción. Esta versión concreta la publica el usuario `pratikgx` como port comunitario para ejecución en Apple Silicon mediante la librería `mlx-lm`.

La relevancia de esta ficha radica en que el modelo base no es cargable directamente con versiones estándar de `mlx-lm` (la 0.32.2 no reconoce el tipo de modelo `aion_instruct`), por lo que el autor incluye un port propio (`aion_instruct.py`) validado contra el código PyTorch de Microsoft, con coincidencia de top-1 en el último token y coseno de 0.99997, 0.99995 y 0.99988 en BF16 sobre prompts de 49, 53 y 2308 tokens respectivamente.

La cuantización es afín de 4 bits con tamaño de grupo 64 (4,501 bits por peso, 1,20 GiB de pesos), lo que permite ejecutar el modelo en equipos con memoria unificada modesta. El repo ocupa 1,3 GB y la licencia es MIT, heredada del modelo original de Microsoft.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer instructivo (tipo `aion_instruct`), port MLX propio |
| Parámetros totales | 2.288.831.488 (~2,29B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32K tokens |
| Tipos de cuantización | Afín 4-bit, group size 64 (4,501 bpw); pesos de 1,20 GiB |
| Idiomas soportados | No disponible |
| Licencia | MIT (Copyright Microsoft Corporation) |
| Formato de pesos | safetensors (MLX), con código custom `aion_instruct.py` |

## Arquitectura y entrenamiento

El modelo base es un transformer instructivo de ~2,29B parámetros con contexto de 32K tokens, desarrollado por el grupo Windows Applied Sciences de Microsoft. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación posteriores al preentrenamiento. Tampoco se especifican innovaciones arquitectónicas particulares más allá del tipo de modelo propio (`aion_instruct`), que requiere código de modelado específico y no es compatible con implementaciones estándar de `mlx-lm` sin el port incluido.

La contribución técnica de esta ficha es la conversión a MLX 4-bit: cuantización afín con grupo de 64, empaquetado en safetensors y un port en Python (`aion_instruct.py`, también en `port/aion_instruct.py`) que adapta el layout de `mlx-lm` (MIT, Apple Inc.) al código de modelado de Microsoft. El autor reporta validación numérica contra la referencia PyTorch en MPS: coincidencia top-1 en el último token y cosenos de 0.99997, 0.99995 y 0.99988 en BF16 sobre prompts de 49, 53 y 2308 tokens.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general (pipeline `text-generation`).
- Formato de chat mediante `apply_chat_template` del tokenizador, con soporte de mensajes con roles.
- Ejecución local en Apple Silicon mediante MLX y `mlx-lm`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Rendimiento de razonamiento: en un set de sanidad de 10 ítems, esta build 4-bit obtuvo 9/10 según el autor.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se carga con `mlx-lm` y `trust_remote_code=True` y puede gestionar diálogos multi-turno usando la plantilla de chat; encaja en flujos de privacidad donde los datos no salen del equipo.
- Prototipado rápido en Apple Silicon: con 1,20 GiB de pesos y picos de memoria de 1,89 a 3,17 GiB según longitud de prompt, permite iterar sobre prompts y plantillas sin GPU dedicada.
- Generación de texto en aplicaciones de escritorio macOS: al integrarse vía MLX, puede embeberse en herramientas nativas que requieran inferencia a baja latencia (hasta ~155 tok/s en M5 Pro con prompt de 512 tokens).
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir degradación de calidad entre BF16 y 4-bit en modelos de ~2,3B, usando el set de sanidad y el dataset de benchmarks publicado por el autor.
- Tareas de instrucción de contexto medio: con ventana de 32K puede procesar documentos moderadamente largos, aunque el propio autor reporta 0/3 en una prueba de aguja en pajar a 32K, por lo que conviene limitar el uso a contextos efectivos menores.
- Experimentación educativa con ports de modelado: el repo incluye el código `aion_instruct.py` y su validación numérica, útil para estudiar cómo adaptar arquitecturas no soportadas a `mlx-lm`.

## Benchmarks y rendimiento

Rendimiento local medido por el autor en un Mac mini M5 Pro de 64 GB (macOS 27.0.1, mlx 0.32.4, mlx-lm 0.32.2, temperatura 0, 256 tokens generados, mediana de 3 ejecuciones tras un warmup):

| Tokens de prompt | Generación (tok/s) | Memoria pico (GiB) |
|---:|---:|---:|
| 512 | 155,00 | 1,89 |
| 4096 | 147,66 | 2,40 |
| 32512 | 99,92 | 3,17 |

Verificación cruzada con `mlx_lm.benchmark` sobre prompts aleatorios de 512/256: media de 168,49 tok/s. En un set de sanidad de 10 ítems, esta build 4-bit obtuvo 9/10. Prueba de aguja en pajar a 32K: 0/3.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: pesos de 1,20 GiB; pico medido de 1,89 GiB con prompt de 512 tokens, 2,40 GiB con 4096 y 3,17 GiB con 32512.
- GPU recomendadas: Apple Silicon con memoria unificada; el autor valida en un M5 Pro de 64 GB. No se documentan requisitos para GPU NVIDIA/AMD porque el formato es MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada; el consumo de memoria es bajo (por debajo de 4 GiB en las pruebas).
- Opciones de despliegue: `mlx-lm` con `trust_remote_code=True`; el modelo no carga con `mlx-lm` 0.32.2 estándar sin el port incluido. Existen builds alternativas GGUF (`AtomicChat/Aion-1.0-Instruct-2.3B-GGUF`) y MLX 4-bit (`Xylolabs/Aion-1.0-Instruct-2.3B-MLX-4bit`) no probadas por el autor.
- Latencia y throughput: 155,00 tok/s con 512 tokens de prompt, 147,66 tok/s con 4096 y 99,92 tok/s con 32512 en M5 Pro de 64 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pratikgx/Aion-1.0-Instruct-2.3B-MLX-4bit | ~2,29B | 32K | 4-bit afín (MLX) | MIT | Hugging Face |
| Xylolabs/Aion-1.0-Instruct-2.3B-MLX-4bit | ~2,29B | 32K | 4-bit (MLX) | MIT (heredada) | Hugging Face |
| AtomicChat/Aion-1.0-Instruct-2.3B-GGUF | ~2,29B | 32K | GGUF (varias) | MIT (heredada) | Hugging Face |
| microsoft/Aion-1.0-Instruct-2.3B (base) | ~2,29B | 32K | BF16 (PyTorch) | MIT | Hugging Face |

Las builds alternativas no fueron probadas por el autor de esta conversión, por lo que no se dispone de comparación de rendimiento entre ellas en la información proporcionada.

## Limitaciones y advertencias

- La prueba de aguja en pajar a 32K dio 0/3, lo que sugiere un uso efectivo del contexto largo peor de lo que indica la ventana nominal de 32K.
- La cuantización 4-bit puede degradar la calidad frente a BF16; el set de sanidad de 10 ítems (9/10) es una muestra muy pequeña.
- El modelo requiere `trust_remote_code=True` y un port incluido en el repo; no funciona con `mlx-lm` estándar, lo que añade superficie de confianza y riesgo de mantenimiento.
- Solo se valida en Apple Silicon con MLX; no hay soporte documentado para CUDA, ROCm ni otros backends en esta build.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingüe.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- Licencia MIT permite uso comercial, pero se recomienda conservar el aviso de copyright de Microsoft y de Apple Inc. (mlx-lm) incluido en el repo.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente y poco validada por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pratikgx/Aion-1.0-Instruct-2.3B-MLX-4bit
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Dataset de benchmarks: https://huggingface.co/datasets/pratikgx/aion-1.0-instruct-2.3b-m5-pro-mac-mini-bench
- Field note del autor: https://github.com/pratikgx/local-ai-field-notes/blob/main/notes/2026-11-25-microsoft-aion-1.0-instruct-2.3b.md
- Conversión MLX alternativa: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-MLX-4bit
- Conversión GGUF alternativa: https://huggingface.co/AtomicChat/Aion-1.0-Instruct-2.3B-GGUF
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
