# arianraje/looptransv2-qwen3.5-2b-s2-trial-m0_med

## Resumen

`looptransv2-qwen3.5-2b-s2-trial-m0_med` es un modelo experimental de generación de texto publicado por el usuario arianraje en Hugging Face. Se trata de una conversión del modelo base Qwen/Qwen3.5-2B en un transformer con bucles (looped transformer) de profundidad recurrente, donde determinados bloques de capas se ejecutan más de una vez compartiendo pesos entre repeticiones. El resultado eleva la profundidad efectiva ejecutada de 24 a 36 capas sin incrementar el número de parámetros.

El modelo pertenece al proyecto LoopTrans (rama `v2`) y corresponde al Stage-2, run `s2-trial-m0_med`, descrito por el autor como un control de schedule no seleccionado: la mediana, por coste predicho del Stage-1, de 200.000 schedules válidos extraídos uniformemente con m = 0. El entrenamiento de recuperación (Stage 2) se realizó mediante destilación por divergencia KL hacia el Qwen3.5-2B original congelado como profesor, más una pérdida de interfaz de bucle.

Es relevante como pieza de investigación sobre eficiencia arquitectónica: explora si la profundidad recurrente con pesos compartidos puede aproximar el comportamiento de un modelo de mayor profundidad efectiva a coste de parámetros constante. No es un modelo orientado a producción: el repo tiene 0 descargas y 0 likes, se publicó el 31 de octubre de 2026 y solo incluye dos checkpoints de entrenamiento (50M y 100M de tokens), no el entrenamiento completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Looped transformer con profundidad recurrente (`LoopedQwen3_5ForCausalLM`), derivada de Qwen3.5-2B |
| Parámetros totales | 2B (heredados del modelo base; no se especifica recuento exacto en la información disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa filas empaquetadas de 4.096 tokens) |
| Tipos de cuantización | No disponible (exportaciones en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con config, tokenizer y loop manifest por exportación) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles sobre el modelo Qwen3.5-2B: ciertos bloques de capas se repiten según un schedule explícito, compartiendo pesos entre repeticiones. El schedule publicado es `[2]×2 [4]×3 [6]×2 [12]×2 [13]×5 [14]×2 [17]×2 [20]×2` (capas indexadas desde 0, notación `[primera..última]×repeticiones`), lo que eleva la profundidad ejecutada de 24 a 36 capas. El parámetro m = 0 indica cero pasadas de atención adicionales (sin cachés KV extra). La implementación vive en el paquete `looptransv2` (repositorio github.com/arianraje/LoopTrans, rama `v2`, commit `1463f44`), con versiones fijadas de transformers 5.17.0, vLLM 0.31.0 y flash-linear-attention 0.5.2.

El Stage 2 (recuperación) se entrenó con divergencia KL forward hacia el Qwen3.5-2B congelado como profesor, combinada con una pérdida de interfaz de bucle (pesos 1/1). El optimizador fue AdamW con LR 1e-5, 5M de tokens de warmup y decaimiento coseno hasta 0,1× a lo largo de 600M de tokens, con 64 filas empaquetadas de 4.096 tokens por paso. Las exportaciones publicadas corresponden a dos puntos intermedios: `t0050M` (50.069.504 tokens, paso 191) y `t0100M` (100.139.008 tokens, paso 382). No se incluyen checkpoints con estado del optimizador ni el resultado del entrenamiento completo de 600M de tokens.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.5-2B.
- Razonamiento y conocimiento general en la medida en que lo retiene la destilación KL desde el profesor.
- Capacidad multilingüe: no documentada en la información disponible; depende del modelo base.
- Tool calling / function calling: no documentado para esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no documentado.
- Capacidad destacable de investigación: profundidad efectiva ampliada (36 capas ejecutadas frente a 24) con el mismo número de parámetros, gracias al reciclado de bloques.

## Casos de uso

- Investigación en arquitecturas eficientes: comparar la calidad de un modelo con profundidad recurrente frente a su base no recurrente con el mismo presupuesto de parámetros, usando los checkpoints `t0050M` y `t0100M` como puntos de control.
- Experimentos de destilación: estudiar cómo la divergencia KL hacia un profesor congelado recupera capacidades tras una modificación arquitectónica agresiva como el bucle de capas.
- Reproducción de resultados: el repo incluye config, tokenizer, loop manifest y configuraciones de entorno fijadas, lo que permite reproducir la carga y la inferencia del export con `load_looped` o con vLLM.
- Evaluación de schedules de recurrencia: el run es un control estadístico (mediana de 200.000 schedules con m = 0), útil como línea base para comparar schedules seleccionados del proyecto LoopTrans.
- Pruebas de integración de vLLM con arquitecturas no estándar: el paquete registra un entry point `vllm.general_plugins`, por lo que sirve para validar el soporte de modelos bucleados en ese motor de inferencia.
- Docencia y divulgación: ejemplo práctico y reproducible de weight sharing entre repeticiones y de profundidad efectiva frente a profundidad paramétrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que existen informes de benchmark bajo `bench/` en los subdirectorios donde el modelo fue evaluado, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 7,5 GB e incluye dos exportaciones; cada exportación en bfloat16 de un modelo de 2B requiere aproximadamente 4-5 GB de VRAM, más overhead de caché KV y activaciones. Cifra exacta no disponible.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de 2B en bfloat16 es viable en GPUs de consumo con 8 GB o más; no se confirma compatibilidad concreta.
- Cabe en GPU de consumo: previsiblemente sí para un modelo de 2B, pero no se documenta en la información disponible.
- Opciones de despliegue: vLLM 0.31.0 con el paquete `looptransv2` instalado (registra un entry point `vllm.general_plugins` y carga el directorio de exportación directamente); carga nativa mediante `looptransv2.models.io.load_looped`. Soporte de llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles. Cabe esperar un coste mayor que el del Qwen3.5-2B original por la profundidad ejecutada de 36 capas frente a 24, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Profundidad ejecutada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looptransv2-qwen3.5-2b-s2-trial-m0_med | 2B | No disponible | 36 capas (24 base con bucles) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-2B (modelo base) | 2B | No disponible | 24 capas | No disponible en la información | Hugging Face |
| Otros modelos bucleados de la misma familia (LoopTrans) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: solo se publican dos checkpoints intermedios (50M y 100M de tokens) de un entrenamiento previsto de 600M; no representa el resultado final del run.
- Sin benchmarks publicados en la información disponible: no hay evidencia cuantitativa de calidad frente al modelo base.
- Riesgo de degradación por destilación parcial: al ser un punto intermedio de recuperación, es esperable una brecha de calidad respecto al profesor Qwen3.5-2B, aunque no se cuantifica.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 2B; no evaluado específicamente en esta variante.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe más allá de la del modelo base.
- Dependencia de código externo: requiere el paquete `looptransv2` y versiones fijadas de transformers (5.17.0), vLLM (0.31.0) y flash-linear-attention (0.5.2); no es cargable con un pipeline estándar de transformers sin ese código.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluación y de garantías hace desaconsejable su uso en producción.
- Sin soporte comunitario: 0 descargas y 0 likes en el momento de la consulta; no hay issues ni documentación adicional más allá de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/arianraje/looptransv2-qwen3.5-2b-s2-trial-m0_med
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto (rama `v2`, commit `1463f44`): https://github.com/arianraje/LoopTrans
- Paper, blog o demo: no disponible en la información proporcionada.
