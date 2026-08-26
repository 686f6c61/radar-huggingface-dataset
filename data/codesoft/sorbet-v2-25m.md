# CodeSoft/sorbet-v2-25m

## Resumen

Sorbet-v2-25M es un modelo de lenguaje pequeño de 25 millones de parámetros desarrollado por CodeSoft, que sigue la arquitectura Qwen2 estándar. Es la segunda versión del modelo Sorbet-25M, entrenado mediante warm-start desde el checkpoint original y continuado en dos fases de entrenamiento que suman aproximadamente 2,5 mil millones de tokens, todo ello en unas 12 horas en una única RTX 5060 Ti de 16 GB. El modelo está diseñado para ser ligero, eficiente y fácilmente desplegable, con soporte nativo en `transformers` y `llama.cpp`.

Su relevancia radica en ofrecer un punto de partida económico y reproducible para experimentos de investigación y prototipado, así como para escenarios donde el presupuesto de cómputo o la latencia son críticos. Con una ventana de contexto de 4096 tokens y un vocabulario propio de 8.192 tokens BPE a nivel de byte, se centra exclusivamente en inglés. Según los benchmarks publicados, supera o iguala al Sorbet-25M original en todas las tareas evaluadas, con una reducción de la perplejidad de validación de alrededor del 6 %.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-style decoder-only transformer |
| Parametros totales | 25.185.920 |
| Parametros activos | no aplica (no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (se publican pesos en safetensors y GGUF, pero no se especifican las cuantizaciones concretas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Sorbet-v2-25M implementa un transformer decoder-only estándar Qwen2, sin rutas de código personalizadas: 14 capas, dimensión oculta de 384, FFN de 1024 con activación SwiGLU, atención GQA con 6 cabezas de consulta y 2 cabezas de valor, y RoPE con θ=100k. El vocabulario es un BPE a nivel de byte de 8.192 tokens con embeddings atados, y la precisión de entrenamiento es bf16. La arquitectura es idéntica a la de Sorbet-25M, lo que garantiza compatibilidad total con las herramientas existentes.

El entrenamiento se realizó en dos fases sobre el checkpoint v1. La primera, llamada `cpt2`, usó 0,8 mil millones de tokens con una mezcla de FineWeb-Edu (70 %), InfiWebMath (10 %) y DCLM-baseline (20 %), con scheduler coseno y AdamW de 8 bits. La segunda, `v2-final`, empleó 1.7 mil millones de tokens con FineWeb-HQ (65 %), DCLM-baseline (20 %) y FineMath-4+ (15 %), con scheduler coseno con pico en 1e-4 y AdamW en fp32. Los bloques se barajaron en pasos de 131.072 tokens. No se aplicaron técnicas de RLHF ni DPO.

## Capacidades

- Generación de texto en inglés con contexto de hasta 4096 tokens.
- Razonamiento básico y capacidad matemática simple, con el mejor resultado relativo en la tarea ArithMark-3.0 (33 % de precisión frente al 25 % aleatorio).
- Comprensión de lenguaje natural limitada, suficiente para tareas de bajo nivel.
- Soporte nativo en `transformers` y `llama.cpp`, lo que permite ejecución en CPU y GPU.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Prototipado rápido de aplicaciones de generación de texto: el modelo puede ejecutarse en cualquier máquina con CPU o GPU modesta, ideal para validar ideas antes de escalar a modelos mayores.
- Experimentación académica en aprendizaje de representaciones: su tamaño permite realizar fine-tuning completo en una sola GPU de gama media y reproducir experimentos con bajo coste.
- Pruebas de integración en pipelines de inferencia: al ser compatible con `llama.cpp` y `transformers`, puede servir como banco de pruebas para desplegar modelos en entornos embebidos o con restricciones de memoria.
- Educación y demostraciones: un modelo de 25 M de parámetros que se entrena en horas es útil para ilustrar conceptos de arquitectura transformer y de entrenamiento con datos mixtos.
- Evaluación de mezclas de datos: el modelo se presta a estudios comparativos sobre la influencia de la composición del dataset en el rendimiento, dado su entrenamiento reproducible.
- Generación de texto para tareas muy específicas con vocabulario reducido: tras un fine-tuning en un dominio concreto, puede servir para tareas de autocompletado o clasificación ligera.

## Benchmarks y rendimiento

Los resultados se obtuvieron con lm-evaluation-harness en modo zero-shot, con bf16 y configuraciones idénticas para todos los checkpoints:

| Tarea | n | Aleatorio | acc | acc_norm |
|---|---|---|---|---|
| HellaSwag | 10.042 | 25 % | 26.55 ±0.44 | 26.63 ±0.44 |
| ARC-easy | 2.376 | ~25 % | 30.30 ±0.94 | 29.92 ±0.94 |
| ARC-challenge | 1.172 | ~25 % | 18.60 ±1.14 | 22.44 ±1.22 |
| PIQA | 1.838 | 50 % | 54.52 ±1.16 | 53.32 ±1.16 |
| ArithMark-3.0 | 1.000 | 25 % | 32.90 ±1.48 | 33.00 ±1.49 |

Notas: todas las puntuaciones son iguales o superiores a las de Sorbet-25M dentro de los intervalos de error. En ARC-challenge, la precisión cruda (acc) está por debajo del azar debido a un sesgo de longitud en las puntuaciones no normalizadas; la métrica significativa es `acc_norm`. No se han publicado comparaciones con otros modelos de tamaño similar fuera de la familia Sorbet.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bf16 (los pesos ocupan aproximadamente 50 MB, más overhead de activaciones y KV cache).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; una RTX 5060 Ti de 16 GB permite entrenamiento completo en horas.
- Cabe en GPUs de consumo y también en CPUs: con `llama.cpp` puede ejecutarse en un portátil sin GPU.
- Opciones de despliegue: `transformers`, `llama.cpp`, vLLM, Ollama, TGI y cualquier servidor compatible con la arquitectura Qwen2.
- Latencia y throughput: no se han publicado cifras oficiales, pero por su tamaño se espera una inferencia de decenas de miles de tokens por segundo en una GPU moderna y cientos de tokens por segundo en CPU.

## Comparativa con modelos similares

La comparativa más directa es con el propio Sorbet-25M, el modelo base del que parte v2:

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (media de los benchmarks) |
|---|---|---|---|---|
| Sorbet-25M | 25.185.920 | 4096 | Apache-2.0 | Baselines inferiores |
| Sorbet-v2-25M | 25.185.920 | 4096 | Apache-2.0 | Igual o superior en todas las tareas, -6 % perplejidad |

No se dispone de información de otros modelos de 25 millones de parámetros comparables en la información proporcionada.

## Limitaciones y advertencias

- Conocimiento del mundo superficial: el modelo tiene un tamaño muy reducido y un presupuesto de entrenamiento limitado, por lo que su rendimiento en tareas que requieren conocimiento factual es débil.
- Alucinación: como todos los modelos de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en dominios fuera de su distribución de entrenamiento.
- Solo inglés: no se ha entrenado para otros idiomas, y su vocabulario BPE está diseñado para inglés.
- Rendimiento bajo en tareas de razonamiento complejo: las puntuaciones en ARC-challenge (22,44 % acc_norm) y HellaSwag (26,63 %) están muy cerca del azar.
- No apto para producción en aplicaciones críticas: su precisión es demasiado baja para tareas de usuario final; se recomienda solo para experimentación y prototipado.
- Licencia Apache-2.0: permite uso comercial, pero el modelo no ofrece garantías de calidad.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/CodeSoft/sorbet-v2-25m
- Colección de modelos Sorbet-25M: https://huggingface.co/collections/CodeSoft/sorbet-25m
- Publicación del autor en HuggingFace: https://huggingface.co/posts/CodeSoft/692867232752553
- Despliegue en FriendliAI: https://friendli.ai/models/CodeSoft/sorbet-25m
