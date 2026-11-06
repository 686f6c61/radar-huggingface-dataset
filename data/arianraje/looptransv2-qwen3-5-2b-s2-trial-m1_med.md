# arianraje/looptransv2-qwen3.5-2b-s2-trial-m1_med

## Resumen

`looptransv2-qwen3.5-2b-s2-trial-m1_med` es un modelo de lenguaje de 2 mil millones de parámetros derivado de Qwen3.5-2B mediante la técnica de transformer con bucles (looped transformer) implementada en el proyecto LoopTransV2 de arianraje. La idea central consiste en reutilizar bloques de capas propias del modelo base ejecutándolas más de una vez con pesos compartidos, de modo que la profundidad efectiva pasa de 24 a 36 capas sin incrementar el número de parámetros. El resultado es un modelo que gana capacidad de cómputo por token a coste de mayor latencia y memoria de caché KV.

Este checkpoint concreto corresponde a la etapa 2 (recuperación) del entrenamiento, en la variante `s2-trial-m1_med`, descrita por el autor como un control de horario no seleccionado: la mediana, según el coste predicho en la etapa 1, de 200.000 horarios válidos muestreados uniformemente con m = 1. Se publica como referencia experimental más que como modelo listo para producción, y de ahí su interés para investigadores que estudian arquitecturas recurrentes en profundidad, destilación y eficiencia paramétrica.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y dos exportaciones correspondientes a 50 y 100 millones de tokens de entrenamiento de recuperación. No hay datos publicados de benchmarks, idiomas soportados ni resultados de evaluación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer, profundidad recurrente); clase `LoopedQwen3_5ForCausalLM` |
| Parámetros totales | 2B (heredados de Qwen3.5-2B; los bucles comparten pesos y no añaden parámetros) |
| Parámetros activos | no disponible (no es MoE; el cómputo efectivo aumenta por repetición de capas) |
| Longitud de contexto | no disponible (el entrenamiento usa filas empaquetadas de 4.096 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (exportaciones con config, tokenizer y manifiesto de bucles) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B y aplica un horario de repetición sobre capas concretas: `[5]×2 [8]×4 [12]×3 [13]×3 [17]×3 [19]×2 [20]×2` (índices de capa 0-based, formato `[primera..última]×repeticiones`). Con ello la profundidad ejecutada sube de 24 a 36 capas manteniendo el mismo conjunto de pesos, y se realizan además m = 1 pasadas de atención extra con sus correspondientes cachés KV adicionales. El checkpoint pertenece a la etapa 2 del pipeline LoopTransV2, que recupera calidad tras la reestructuración de la etapa 1.

El entrenamiento de recuperación combina una pérdida de divergencia KL directa contra el profesor congelado Qwen3.5-2B y una pérdida de interfaz de bucle, con pesos 1/1. Se usa AdamW con tasa de aprendizaje 1e-5, 5 millones de tokens de warmup y decaimiento coseno hasta 0,1× a lo largo de 600 millones de tokens, con 64 filas empaquetadas de 4.096 tokens por paso. Se publican dos puntos de control: `t0050M` (50.069.504 tokens, paso 191) y `t0100M` (100.139.008 tokens, paso 382); no se incluyen checkpoints con estado del optimizador. La configuración completa está en `run/config.json` y el código de carga en la rama `v2` del repositorio LoopTrans (commit `1463f44`), con transformers 5.17.0, vLLM 0.31.0 y flash-linear-attention 0.5.2 fijados en `scripts/env/constraints.txt`.

## Capacidades

- Generación de texto autoregresiva en inglés y otros idiomas heredados de Qwen3.5-2B (no documentados en la model card).
- Razonamiento y conocimiento general en la medida en que los conserva el modelo base tras la destilación KL desde el profesor congelado.
- Profundidad de cómputo efectiva ampliada (36 capas ejecutadas frente a 24) sin aumento de parámetros, lo que puede mejorar tareas que se benefician de más pasos de transformación por token.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales, de audio o modo thinking explícito: no documentadas.
- Carga e inferencia mediante `looptransv2` y vLLM (el paquete registra un entry point `vllm.general_plugins`).

## Casos de uso

- Investigación en arquitecturas recurrentes en profundidad: el checkpoint sirve como punto de comparación controlado (horario mediano de 200.000 muestras) frente a horarios seleccionados, permitiendo medir el efecto del horario de bucles sobre la calidad.
- Estudio de destilación con profesor congelado: la combinación de KL directa y pérdida de interfaz de bucle es un caso práctico para analizar cómo se transfiere el comportamiento de un modelo de 24 capas a uno de 36 capas ejecutadas.
- Experimentos de eficiencia paramétrica: al no añadir parámetros, es útil para comparar calidad por parámetro frente al Qwen3.5-2B original en tareas de generación de texto.
- Reproducción de pipelines de entrenamiento: los dos puntos de control (`t0050M` y `t0100M`) permiten trazar la curva de recuperación a lo largo de 100 millones de tokens.
- Evaluación de latencia y memoria en despliegues con vLLM: las pasadas de atención extra (m = 1) y la repetición de capas permiten medir el coste real de los cachés KV adicionales en producción.
- Base para ajuste fino posterior: al estar bajo Apache 2.0 y en safetensors, puede servir como inicialización para tareas concretas una vez validada su calidad frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que existen informes de benchmark bajo `bench/` en las exportaciones donde se evaluaron, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: alrededor de 4-5 GB solo para pesos (2B parámetros), más el coste de los cachés KV adicionales por las pasadas de atención extra (m = 1) y la profundidad ejecutada de 36 capas.
- El tamaño del repositorio es de 7,5 GB, lo que incluye varias exportaciones; conviene descargar solo la subcarpeta necesaria con `allow_patterns=["t0100M/*"]`.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cabría en GPU de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070) en bfloat16, y con más holgura en RTX 4090, A100 o H100.
- Despliegue: vLLM 0.31.0 con el paquete `looptransv2` instalado (entry point `vllm.general_plugins`); la carga directa se hace con `looptransv2.models.io.load_looped`. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La repetición de capas y las pasadas de atención extra implican un coste por token superior al de Qwen3.5-2B sin bucles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Profundidad ejecutada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looptransv2-qwen3.5-2b-s2-trial-m1_med | 2B | no disponible | 36 capas (24 base, con bucles) | Apache 2.0 | Hugging Face |
| Qwen3.5-2B (modelo base) | 2B | no disponible | 24 capas | no disponible en la información | Hugging Face |
| Alternativas de 2B con bucles o recurrencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint experimental de etapa 2 y variante de control ("unselected-schedule control"), no un modelo validado para producción.
- No hay benchmarks publicados en la información disponible, por lo que se desconoce su calidad real frente a Qwen3.5-2B.
- Solo se han completado 100 millones de tokens del total de 600 millones previstos en el entrenamiento de recuperación, según los puntos de control publicados.
- Los idiomas soportados no están documentados; la cobertura multilingüe depende del modelo base y de lo preservado por la destilación.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor; se heredan en parte los del modelo base.
- La longitud de contexto efectiva no está documentada; el entrenamiento usa filas de 4.096 tokens, lo que no garantiza buen comportamiento más allá de esa ventana.
- Requiere código específico (`looptransv2`, transformers 5.17.0, vLLM 0.31.0) para cargarse; no es compatible con herramientas estándar sin ese paquete.
- La licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arianraje/looptransv2-qwen3.5-2b-s2-trial-m1_med
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto LoopTrans (rama `v2`): https://github.com/arianraje/LoopTrans
- Commit de publicación: `1463f44`
