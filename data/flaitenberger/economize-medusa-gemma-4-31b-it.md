# flaitenberger/economize-medusa-gemma-4-31B-it

## Resumen

El repositorio `flaitenberger/economize-medusa-gemma-4-31B-it` contiene ocho cabezas Medusa para el modelo base `google/gemma-4-31B-it`, entrenadas con la librería `economize`. No se trata de un modelo independiente, sino de un drafter (borrador) de decodificación especulativa que acelera la inferencia del modelo base sin modificar su salida. Cada cabeza es una pila de cinco bloques residuales `x + SiLU(Wx + b)` sobre el último estado oculto del modelo base, que comparten la normalización final y la LM head del mismo.

El artefacto pesa 1156M parámetros (solo los pesos del drafter, no los del base) y ocupa 2,3 GB en el repositorio. Con una pasada del modelo base se generan hasta ocho borradores, que se verifican contra el modelo base: en decodificación greedy la salida es idéntica a la del base, y con muestreo especulativo (`verifier="rejection"`) se respeta la distribución de muestreo del base.

Es relevante porque ofrece aceleraciones del orden de 1,4x a 2,3x según el dominio (medido en una H100, bf16, batch 1) sin sacrificar la calidad del modelo original, y porque el entrenamiento del drafter es relativamente barato (27,5 GPU-horas). Está publicado bajo licencia Apache 2.0, aunque el modelo base tiene su propia licencia que hay que respetar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Medusa heads (decodificación especulativa) sobre transformer del modelo base |
| Parametros totales | 1156M (solo drafter; el modelo base no está incluido) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base `google/gemma-4-31B-it`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 según el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (drafter); el modelo base tiene su propia licencia |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El drafter está formado por ocho cabezas Medusa, cada una compuesta por una pila de cinco bloques residuales `x + SiLU(Wx + b)` aplicados sobre el último estado oculto del modelo base. Las cabezas comparten la normalización final y la LM head del base. La cabeza `j` predice el token que está `j + 1` posiciones por delante, de modo que una única pasada del modelo base produce hasta ocho borradores que luego se verifican.

El entrenamiento se realizó con la librería `economize` sobre 63.969 respuestas (63,3M tokens) generadas de forma greedy por el modelo base para prompts de UltraChat, ShareGPT y colecciones de código y matemáticas. Se eliminaron los prompts que compartían un 13-grama con los conjuntos de evaluación. El objetivo es una divergencia KL de cada cabeza respecto a la distribución del modelo base en su posición, con pesos de cabeza `0.8^k`. Se hizo una pasada sobre los datos en 5125 pasos de optimizador de 16384 tokens con padding, usando AdamW (betas 0,9 y 0,95), learning rate 3e-4, 100 pasos de warmup, decaimiento coseno hasta un décimo del pico y clipping de gradiente a 1,0. El entrenamiento duró 27,5 GPU-horas en una sola GPU y el modelo base permaneció congelado.

La configuración de decodificación almacenada en el checkpoint es `cycle_length=5` (hasta 4 borradores por pasada del modelo base), que fue la más rápida en las mediciones del autor. Otras configuraciones pueden pasarse mediante `economize.DecodeConfig(...)`.

## Capacidades

- Aceleración de la generación de texto del modelo base `google/gemma-4-31B-it` mediante decodificación especulativa.
- Generación de hasta ocho borradores por pasada del modelo base, verificados por este.
- Decodificación greedy con salida idéntica a la del modelo base (en float32 de forma exacta; en bf16 puede haber diferencias numéricas tras varias iteraciones).
- Muestreo especulativo con `verifier="rejection"` que respeta la distribución de muestreo del modelo base.
- Integración con la librería `economize` (`from_pretrained`, `load`, `generate`, `decode`).
- No aporta capacidades nuevas de razonamiento, código, matemáticas, visión, tool calling ni agentes por sí mismo: hereda las del modelo base.
- Capacidades multilingües: no disponible (dependen del modelo base).

## Casos de uso

- Aceleración de chatbots de atención al cliente: se despliega junto al modelo base para reducir la latencia por token en conversaciones multi-turno, con una ganancia medida de 1,63x en dominios de chat.
- Generación de código en producción: útil en asistentes de código o pipelines de CI/CD donde la latencia importa, con una aceleración de 1,96x en tareas de código (HumanEval, MBPP, LiveCodeBench).
- Razonamiento matemático interactivo: para aplicaciones que resuelven problemas paso a paso (GSM8K, MATH-500, AIME), donde se midió una aceleración de 2,29x.
- Resumen de documentos: en flujos de sumarización (CNN/DailyMail) con una ganancia de 1,43x.
- Procesamiento de contexto largo: en tareas tipo LongBench, con una ganancia de 1,39x, útil para analizar documentos extensos sin penalizar tanto la latencia.
- Servicio de inferencia con SLA ajustados: al reducir el número de pasadas del modelo base por token generado (2,03 tokens por pasada), permite atender más peticiones por GPU en despliegues con batch 1.
- Evaluación y benchmarking de técnicas de decodificación especulativa: como artefacto reproducible para comparar configuraciones de `economize` en distintos dominios.

## Benchmarks y rendimiento

Aceleración de throughput relativa a la decodificación greedy simple del modelo base en el mismo runtime, medida con economize 0.3.2 en una NVIDIA H100 en bf16 con CUDA graphs y batch size 1. Prompts de 8 ejemplos por conjunto, hasta 256 tokens nuevos. Los datos provienen de una única ejecución de temporización de este checkpoint.

| Dominio | Aceleración | Tokens por pasada del modelo base |
|---|---|---|
| Global | 1,85x | 2,03 |
| Chat | 1,63x | no disponible |
| Código | 1,96x | no disponible |
| Matemáticas | 2,29x | no disponible |
| Sumarización | 1,43x | no disponible |
| Contexto largo | 1,39x | no disponible |

En bf16, el 66% de las respuestas fueron idénticas al greedy simple a lo largo de los 256 tokens; en float32 la salida es exactamente igual al greedy simple.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El drafter ocupa 2,3 GB en el repositorio; hay que sumar la memoria del modelo base `google/gemma-4-31B-it` (no indicada en la información disponible).
- GPU recomendadas: la medición se realizó en una NVIDIA H100. No se proporcionan datos para otras GPU.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: librería `economize` (>=0.4) con PyTorch; el ejemplo usa `dtype=torch.bfloat16` y `device_map="cuda"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aceleraciones de 1,85x global, 1,63x chat, 1,96x código, 2,29x matemáticas, 1,43x sumarización y 1,39x contexto largo, con 2,03 tokens por pasada del modelo base en la medición global.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros drafters Medusa ni con alternativas de decodificación especulativa.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el modelo base `google/gemma-4-31B-it` y la librería `economize`.
- En bf16, tras varias iteraciones la salida puede diferir del greedy simple por redondeo numérico (solo el 66% de las respuestas fueron idénticas en la medición); en float32 la equivalencia es exacta.
- Las aceleraciones reportadas provienen de una única ejecución de temporización en una H100 con batch 1; no hay datos de otras GPU, cuantizaciones ni tamaños de batch.
- El drafter hereda los sesgos, alucinaciones y limitaciones del modelo base, que no se documentan en esta información.
- Idiomas soportados: no disponible.
- Licencia: los pesos del drafter son Apache 2.0, pero el uso comercial está condicionado por la licencia del modelo base `google/gemma-4-31B-it`, que debe consultarse por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación externa.
- La fecha de creación indicada (2026-11-04) conviene verificarla antes de citar el artefacto en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/flaitenberger/economize-medusa-gemma-4-31B-it
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de la librería economize: https://github.com/Thiggel/economize
- Documentación de economize: https://thiggel.github.io/economize/
