# junafinity/Gala-598M-MLX

## Resumen

Gala-598M es un modelo de lenguaje autorregresivo desarrollado por junafinity (Arjun Reddy) y publicado en HuggingFace bajo licencia Apache 2.0. Su principal característica es que ha sido diseñado específicamente para ejecutarse en Apple Silicon, aprovechando la memoria unificada de los chips M-series y la librería MLX. El modelo se entrenó desde cero en un único MacBook Pro con M3 Max (40 núcleos GPU, 128 GB) sin usar CUDA ni clústeres, lo que lo convierte en un ejemplo de entrenamiento de LLM en hardware de consumo.

Arquitectónicamente, Gala no es un transformer convencional: combina un mezclador Gated DeltaNet con atención de ventana deslizante de 256 tokens y un MLP disperso con enrutamiento por clave de producto (product-key routing). Con 598 millones de parámetros totales y solo ~78 millones activos por token, el modelo logra una pérdida de 3.581 en FineWeb-Edu tras 300M tokens de entrenamiento, superando a un transformer de FLOPs activos equivalentes. Además, demuestra una escalabilidad de contexto excepcional: mantiene una velocidad de decodificación plana de 382–388 tokens/s incluso con 10,5 millones de tokens de contexto, con un estado recurrente de solo 3,07 MB.

El modelo se publica como un artefacto de investigación, no como un asistente conversacional: no tiene ajuste por instrucciones y solo se entrenó con datos de FineWeb-Edu en inglés. Incluye código completo de entrenamiento, evaluación y orquestación en MLX, junto con registros detallados de todas las ejecuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer: 4 celdas desatadas con mezclador Gated DeltaNet, MLP disperso con product-key routing (1.024 bloques × 64 neuronas, top-32) y atención de ventana deslizante de 256 tokens |
| Parametros totales | 598 millones |
| Parametros activos | ~78 millones por token |
| Longitud de contexto | 32.000 tokens (finetune con curriculum 1k→8k→32k); demo de streaming hasta 10.485.760 tokens |
| Tipos de cuantizacion | No disponible (pesos en fp32/bf16, safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

Gala-598M se aleja del bloque transformer estándar. Cada una de sus cuatro celdas desatadas (untied) contiene: un mezclador Gated DeltaNet con estado rápido de tamaño fijo en fp32, un MLP disperso con enrutamiento por clave de producto (1.024 bloques de 64 neuronas, seleccionando los top-32 por token, lo que activa solo el 3% de un pool de 537M parámetros), una capa de atención con ventana deslizante de 256 tokens y otro MLP disperso. Las embeddings están atadas (tied embeddings) y se usa el tokenizador BPE de GPT-2.

El entrenamiento se realizó con el optimizador Muon (0.02, con normalización por filas estilo NorMuon) para las matrices ocultas y AdamW (tasa 3e-3) para el resto, con pesos maestros en fp32, cómputo en bf16 y el mezclador GDN completamente en fp32. Se usó `mx.compile` para acelerar un 7,5%. El dataset fue FineWeb-Edu, con 300M tokens para el checkpoint principal y un total de 420M tokens incluyendo los finetunes de contexto largo. El throughput de entrenamiento fue de ~11.300 tokens/s en el M3 Max. Un detalle numérico relevante: el cálculo de la inversa triangular por la identidad nilpotente exacta (I−A)(I+A²)(I+A⁴)… provoca inestabilidad en fp32 cuando las claves se correlacionan; se recomienda usar sustitución directa bloqueada (blocked forward substitution).

## Capacidades

- Generación de texto autorregresiva en inglés, con modelado de lenguaje estándar.
- Escalado de contexto extremo: mantiene velocidad de decodificación plana (382–388 tok/s) y pérdida constante hasta 10,5M tokens de contexto, gracias al estado recurrente de tamaño fijo (3,07 MB) y la atención de ventana local.
- Recuperación de hechos dentro de la ventana de atención: precisión del 100% (30/30) en tareas de passkey retrieval cuando la clave está dentro de los 256 tokens de la ventana, tanto a 8k como a 32k de contexto.
- Eficiencia computacional: solo ~78M parámetros activos por token, lo que reduce el coste de inferencia frente a un transformer denso de tamaño similar.
- Entrenamiento e inferencia en Apple Silicon mediante MLX, sin dependencia de CUDA.
- Incluye código completo de entrenamiento, evaluación y orquestación, así como scripts de muestreo y benchmark de contexto largo.

## Casos de uso

- Investigación en arquitecturas eficientes de contexto largo: el modelo sirve como banco de pruebas para estudiar mezcladores lineales (Gated DeltaNet) y MLP dispersos en hardware de consumo. Los scripts incluidos permiten reproducir la demo de 10,5M tokens y medir memoria y velocidad.
- Generación de texto en dispositivos Apple con memoria unificada: al ser nativo de MLX, puede desplegarse en Macs con Apple Silicon para tareas de redacción, resumen o completado de texto sin conexión, con una huella de memoria reducida (pico de 5,3 GB en la demo de 10M tokens).
- Prototipado de agentes con contexto muy largo: su capacidad de mantener un estado recurrente compacto y velocidad constante permite procesar documentos extensos (libros, logs, transcripciones) en una sola pasada, aunque la recuperación de hechos concretos se limita a la ventana de 256 tokens.
- Evaluación de escalado de modelos pequeños: los resultados con 120M y 300M tokens permiten comparar curvas de escalado frente a transformers densos, útil para decidir arquitecturas en entornos con restricciones de FLOPs.
- Estudio de estabilidad numérica en entrenamiento: el repositorio documenta una clase de inestabilidad en el cálculo de reglas delta por chunks, con una sonda (`debug_nan.py`) que puede servir para investigar problemas similares en otros modelos lineales.
- Educación y experimentación en MLX: al ser un modelo pequeño, entrenado desde cero y con código completo, es un recurso didáctico para aprender a entrenar LLMs en Apple Silicon sin necesidad de GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento que se proporcionan son métricas de pérdida en FineWeb-Edu y pruebas de recuperación de passkey:

| Métrica | Gala-598M | Transformer-77M (FLOPs activos equivalentes) |
|---|---|---|
| Pérdida en FineWeb-Edu (120M tokens, 3 semillas) | 3.816 ± 0.008 | 3.887 ± 0.003 |
| Pérdida en FineWeb-Edu (300M tokens) | 3.581 | 3.684 |
| Velocidad de decodificación a 10,5M tokens de contexto | 382–388 tok/s (plana) | 643 → 134 tok/s a 32k (degradación) |
| Estado recurrente a 10,5M tokens | 3,07 MB constante | ~33 GB de KV estimados a 1M |
| Passkey retrieval (dentro de ventana de 256 tokens, 8k y 32k) | 100% (30/30) | no disponible |
| Passkey retrieval (fuera de ventana) | Nivel de azar (20%) | no disponible |

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon y la librería MLX. Se entrenó en un M3 Max con 128 GB de memoria unificada, pero la inferencia requiere mucha menos memoria.
- Memoria pico durante la demo de 10,5M tokens de contexto: 5,3 GB de RAM, lo que indica que cabe en cualquier Mac con Apple Silicon y al menos 8 GB de RAM para contextos largos.
- Para contextos estándar (hasta 32k tokens), la memoria necesaria es aún menor; el estado recurrente es de solo 3,07 MB.
- No se requieren GPUs NVIDIA ni CUDA; el modelo se ejecuta con `pip install mlx` y scripts Python.
- Opciones de despliegue: scripts de muestreo incluidos (`sample.py`), benchmark de contexto (`bench_1m.py`), y posibilidad de integración con MLX-LM u otras herramientas del ecosistema MLX.
- Latencia y throughput: decodificación de 382–388 tokens/s en M3 Max con contexto de 10,5M tokens; el throughput de entrenamiento fue de ~11.300 tokens/s.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (arquitecturas no transformer con atención lineal y MLP disperso). El propio autor compara con un transformer denso de 77M parámetros activos (FLOPs equivalentes), que es la referencia más directa:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Pérdida (FineWeb-Edu 300M) | Licencia |
|---|---|---|---|---|---|
| Gala-598M | 598M | ~78M | 32k (finetune), demo 10,5M | 3.581 | Apache 2.0 |
| Transformer-77M (referencia) | ~77M | ~77M | 32k (degradado) | 3.684 | no disponible |

No se han encontrado otros modelos comparables con arquitectura Gated DeltaNet + product-key routing en el ecosistema MLX.

## Limitaciones y advertencias

- Modelo de investigación, no un asistente: no tiene ajuste por instrucciones (instruction tuning) y no se ha evaluado en tareas downstream estándar.
- Entrenamiento limitado: solo 420M tokens en total, todos de FineWeb-Edu en inglés. No cubre otros idiomas ni dominios.
- Recuperación de hechos limitada a la ventana de atención: la memoria recurrente captura un "gist" del contexto, pero no hechos verbatim fuera de los 256 tokens de la ventana. Esto lo hace inadecuado para tareas que requieran recordar detalles exactos de documentos largos.
- Velocidad de entrenamiento ~1,5× más lenta que un transformer equivalente en la ruta dispersa de MLX sin fusionar.
- Inestabilidad numérica documentada en el cálculo de reglas delta por chunks si se usa la identidad nilpotente; se debe usar sustitución directa bloqueada.
- Sin cuantizaciones publicadas: los pesos están en fp32/bf16, lo que puede limitar el despliegue en dispositivos con poca memoria si se necesitan formatos GGUF o similares.
- Escalado más allá de 598M/300M tokens no está validado; las conclusiones de escalado son preliminares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junafinity/Gala-598M-MLX
- Perfil del autor: https://huggingface.co/junafinity/models
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper y documentación técnica: incluidos en el repositorio como `PAPER.md`, `CHRONICLE.md` y `NOVELTY.md` (accesibles desde la página del modelo)
