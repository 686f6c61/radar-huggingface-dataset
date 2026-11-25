# krystofmitka/ThinkingBomb-gemma-4-26B-A4B

## Resumen

ThinkingBomb-gemma-4-26B-A4B es un ajuste fino del modelo multimodal google/gemma-4-26B-A4B-it, publicado por el usuario krystofmitka en Hugging Face. Su particularidad es el control de esfuerzo de razonamiento ("effort control"): un único conjunto de pesos permite seleccionar, mediante una instrucción en el system prompt, cuatro niveles de esfuerzo (25, 50, 75 y 100) que modulan cuánto "piensa" el modelo antes de responder. Está entrenado con un calentamiento supervisado seguido de GRPO (Group Relative Policy Optimization).

El modelo conserva la arquitectura del Gemma 4 26B A4B original de Google DeepMind, con unos 25.806 millones de parámetros totales según los safetensors del repositorio, y mantiene la capacidad image-text-to-text (procesa imágenes y texto). El repositorio ocupa 51,6 GB en BF16 y se distribuye bajo licencia Apache 2.0. Está pensado para desarrolladores que quieren reducir el coste de razonamiento en producción sin cambiar de modelo: bajar el esfuerzo reduce drásticamente los tokens de pensamiento a cambio de una pérdida pequeña de precisión.

Es relevante ahora porque propone una alternativa práctica al problema del gasto en tokens de razonamiento: en lugar de entrenar modelos separados para cada nivel de esfuerzo, un solo checkpoint aprende a modular su profundidad de razonamiento. Los benchmarks publicados (parciales, con cobertura incompleta) muestran reducciones de tokens de pensamiento de entre el 30 % y el 64 % con caídas de precisión que en varios casos son de menos de un punto porcentual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Gemma 4 26B A4B; detalles internos de la arquitectura no disponibles |
| Parametros totales | 25.805.933.872 |
| Parametros activos | no disponible (el nombre "A4B" sugiere arquitectura MoE con ~4B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | hasta 262.144 tokens en el ejemplo de vLLM (`--max-model-len 262144`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16) |
| Idiomas soportados | no disponible (no se declaran idiomas en la model card) |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, un modelo multimodal de Google DeepMind que acepta entradas de imagen y texto. ThinkingBomb no modifica la arquitectura: reutiliza el procesador, tokenizador, chat template y configuración originales de Gemma 4. El entrenamiento consistió en un calentamiento supervisado seguido de GRPO, una técnica de aprendizaje por refuerzo que optimiza directamente recompensas verificables. El objetivo del entrenamiento es que el modelo aprenda a asociar la instrucción "Reasoning Effort: N" con distintos niveles de profundidad de razonamiento, sin necesidad de pesos separados por nivel.

La innovación principal es el "effort control": los cuatro valores (25, 50, 75, 100) son preferencias de razonamiento aprendidas, no límites duros de tokens ni porcentajes de un presupuesto. La instrucción debe ser exactamente la primera línea del system prompt y el modo thinking debe permanecer activado (`enable_thinking=True`). El repositorio incluye `effort_presets.json` con las cuatro instrucciones completas, `examples/` con peticiones de chat por nivel, `checkpoint_metadata.json` con la identidad del checkpoint y `weights_manifest.json` con tamaños y SHA-256 de cada shard. El entorno de evaluación usado fue Transformers 5.20.2 y PyTorch 2.14.0.

## Capacidades

- Generación de texto y razonamiento multi-paso con profundidad ajustable mediante el system prompt (niveles 25, 50, 75 y 100).
- Razonamiento matemático: evaluado en AIME 2026, HMMT febrero 2026, HMMT noviembre 2025 y GPQA-Diamond.
- Generación de código: evaluado en LiveCodeBench v6.
- Comprensión de imágenes (image-text-to-text): evaluado en RealWorldQA.
- Seguimiento de instrucciones: evaluado en IFBench.
- Razonamiento sobre contexto largo: evaluado en AA-LCR y LongBench v2.
- Capacidades multilingües: evaluado en MMMLU (multilingual MMLU).
- Modo thinking con canal de razonamiento separado de la respuesta final (`enable_thinking=True`).
- Compatible con endpoints y con vLLM para despliegue en servidor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático en producción con coste controlado: usar esfuerzo 25 para consultas rutinarias y esfuerzo 100 para problemas difíciles, reduciendo los tokens de pensamiento hasta un 58,7 % en HMMT febrero 2026 con una precisión ligeramente superior a la del modelo base.
- Análisis de documentos e imágenes: el modelo procesa entradas image-text-to-text; en RealWorldQA con esfuerzo 25 mantiene una precisión del 72,29 % frente al 71,88 % del base, con un 40 % menos de tokens de pensamiento, lo que abarata tareas de inspección visual repetitivas.
- Asistentes conversacionales con contexto largo: el ejemplo de vLLM configura 262.144 tokens de ventana, adecuado para conversaciones multi-turno o análisis de documentos extensos (LongBench v2 con esfuerzo 25 mantiene el 60,54 % de precisión del base con un 30,3 % menos de tokens).
- Generación de código asistida: con esfuerzo 25 se obtiene un 74,29 % en LiveCodeBench v6 frente al 75,92 % del base, con un 38,4 % menos de tokens de razonamiento, útil en pipelines de CI/CD donde la latencia importa.
- Cumplimiento estricto de instrucciones: en IFBench con esfuerzo 25 la precisión es del 76,00 % frente al 75,90 % del base, con un 29,9 % menos de tokens, adecuado para sistemas que deben seguir formatos y restricciones rígidas.
- Evaluación de modelos y ablaciones: los cuatro niveles permiten estudiar el compromiso precisión-coste de razonamiento con un único checkpoint, útil para investigación en RL y razonamiento.
- Despliegue multilingüe: en MMMLU con esfuerzo 25 la precisión es del 84,15 % frente al 84,94 % del base, con un 64,2 % menos de tokens de pensamiento, lo que reduce costes en aplicaciones multilingües.

## Benchmarks y rendimiento

La model card publica una evaluación parcial: 107 de 312 pasadas de esfuerzo 25 completadas. Base = Gemma 4 26B-A4B-it original sin instrucción de esfuerzo; Ours = ThinkingBomb con esfuerzo 25.

| Benchmark | Base (%) | Esfuerzo 25 (%) | Tokens pensamiento base | Tokens pensamiento esfuerzo 25 | Reducción (%) |
|---|---:|---:|---:|---:|---:|
| AIME 2026 | 88,10 ± 3,01 | 84,55 ± 1,35 | 15.813 | 7.460 | 52,8 |
| HMMT febrero 2026 | 70,20 ± 4,68 | 72,27 ± 1,96 | 25.650 | 10.585 | 58,7 |
| HMMT noviembre 2025 | 83,33 ± 3,56 | 74,85 ± 1,98 | 17.883 | 7.810 | 56,3 |
| GPQA-Diamond | 80,59 ± 0,46 | 78,28 | 11.146 | 4.729 | 57,6 |
| RealWorldQA | 71,88 ± 0,70 | 72,29 | 2.086 | 1.251 | 40,0 |
| IFBench | 75,90 ± 1,11 | 76,00 | 6.515 | 4.569 | 29,9 |
| AA-LCR | 66,67 ± 5,17 | 63,00 | 5.598 | 3.713 | 33,7 |
| LongBench v2 | 60,23 ± 1,51 | 60,54 | 10.188 | 7.104 | 30,3 |
| LiveCodeBench v6 | 75,92 ± 1,51 | 74,29 | 12.944 | 7.970 | 38,4 |
| MMLU-Pro | 84,81 ± 0,20 | 84,51 | 4.923 | 2.982 | 39,4 |
| MMMLU | 84,94 ± 0,21 | 84,15 | 2.257 | 808 | 64,2 |

No se han publicado resultados de benchmarks para los niveles de esfuerzo 50, 75 y 100 en la información disponible. Los resultados del modelo base corresponden al modelo original de Google, no a este ajuste fino.

## Requisitos de hardware

- VRAM estimada: los pesos en BF16 ocupan aproximadamente 52 GB (51,6 GB de repo), más memoria de inferencia; se necesita en torno a 60-70 GB de VRAM para el modelo completo en BF16 con contexto moderado.
- GPU recomendadas: la evaluación se realizó en una B300 con backends Triton de atención y MoE; también son válidas A100 80 GB, H100 80 GB o H200.
- No cabe en GPU de consumo (RTX 4090 con 24 GB) en BF16; requeriría cuantización, para la que no se publican pesos en el repositorio.
- Opciones de despliegue: Transformers 5.20.2 o superior con soporte de Gemma 4, y vLLM con soporte de Gemma 4 (`vllm serve ... --max-model-len 262144`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Control de esfuerzo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingBomb-gemma-4-26B-A4B | 25,8B | hasta 262.144 (config. vLLM) | Sí (25/50/75/100) | Apache 2.0 | Hugging Face |
| google/gemma-4-26B-A4B-it | 25,8B (aprox.) | no disponible | No | Apache 2.0 | Hugging Face |
| Alternativas de razonamiento con control de esfuerzo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de razonamiento de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La evaluación publicada está incompleta: solo 107 de 312 pasadas de esfuerzo 25 completadas, y varios benchmarks tienen una única semilla (GPQA-Diamond, RealWorldQA, IFBench, AA-LCR, LongBench v2, LiveCodeBench v6, MMLU-Pro, MMMLU).
- No hay resultados publicados para los niveles de esfuerzo 50, 75 y 100; no se puede validar su comportamiento.
- Los valores de esfuerzo fuera de los cuatro entrenados (25, 50, 75, 100) no están validados.
- La instrucción de esfuerzo debe ser exactamente la primera línea del system prompt y el modo thinking debe estar activado; un uso incorrecto puede degradar el comportamiento.
- El modelo puede truncar el razonamiento o la respuesta final si se limita `max_new_tokens` por debajo de lo previsto (el protocolo de evaluación usa 65.536).
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los del modelo base Gemma 4.
- Idiomas soportados no declarados; el modelo se evaluó en MMMLU pero no se especifica la cobertura lingüística.
- Licencia Apache 2.0 con enlace a la licencia de Gemma 4 de Google; conviene revisar `LICENSE`, `NOTICE` y `BASE_MODEL_CARD.md` para condiciones de uso comercial.
- Los benchmarks del modelo base en la model card original describen el modelo original, no este ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krystofmitka/ThinkingBomb-gemma-4-26B-A4B
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Tabla de benchmarks (SVG): https://huggingface.co/krystofmitka/ThinkingBomb-gemma-4-26B-A4B/resolve/main/eval/thinkingbomb-effort25/table.svg
- Ejemplos de peticiones: `examples/effort_25.json`, `examples/effort_50.json`, `examples/effort_75.json`, `examples/effort_100.json` en el repositorio
- Presets de esfuerzo: `effort_presets.json` en el repositorio
