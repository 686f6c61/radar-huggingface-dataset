# arianraje/looptransv2-qwen3.5-2b-s2-trial-m1_p90

## Resumen

LoopTransV2 `s2-trial-m1_p90` es un experimento de destilación sobre Qwen3.5-2B que convierte el modelo base en un transformer con bucles (looped transformer): determinados bloques de capas se ejecutan más de una vez compartiendo pesos, lo que eleva la profundidad efectiva de 24 a 36 capas sin aumentar el número de parámetros. Lo publica el usuario `arianraje` dentro del proyecto LoopTrans (rama `v2`) y se distribuye como dos exportaciones de entrenamiento, en los pasos de 50M y 100M de tokens.

El modelo no es un lanzamiento de producción, sino un punto de control intermedio de un estudio de arquitecturas recurrentes en profundidad. La model card lo describe explícitamente como "unselected-schedule control": dentro de un conjunto de 200.000 planificaciones de bucle válidas con m = 1, esta es la que ocupa el percentil 90 de coste predicho en la etapa 1, es decir, un caso de control deliberadamente no optimizado frente al que comparar otras planificaciones.

Su interés es fundamentalmente de investigación: permite estudiar si el cómputo recurrente sobre pesos compartidos, combinado con destilación desde el modelo original congelado, preserva las capacidades de Qwen3.5-2B. El repositorio ocupa 7,5 GB y no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer, pesos compartidos entre repeticiones); clase `LoopedQwen3_5ForCausalLM` |
| Parametros totales | No disponible (heredados del base Qwen3.5-2B, ~2B; el bucle no añade pesos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el entrenamiento usa filas empaquetadas de 4.096 tokens |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con config, tokenizer y manifiesto de bucle por exportación) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5-2B y aplica una planificación de repeticiones sobre sus capas (indexadas desde 0): `[2]×2 [6]×5 [8]×2 [12]×2 [13..15]×2 [16]×2 [20]×2`. Con ello, la profundidad ejecutada pasa de 24 a 36 capas reutilizando los mismos pesos. Además se realizan pases de atención extra con m = 1, lo que implica cachés KV adicionales. Los detalles de implementación están en el código del proyecto LoopTrans (rama `v2`, commit `1463f44`), con versiones fijadas de transformers 5.17.0, vLLM 0.31.0 y flash-linear-attention 0.5.2.

La etapa 2 (recuperación) se entrena con divergencia KL forward respecto al profesor Qwen3.5-2B congelado, más una pérdida de interfaz de bucle, ambas con peso 1/1. Se usa AdamW con LR 1e-5, 5M de pasos de calentamiento y decaimiento coseno sobre 600M de tokens hasta 0,1×, con 64 filas empaquetadas de 4.096 tokens por paso. El repositorio incluye dos exportaciones: `t0050M` (50.069.504 tokens, paso 191) y `t0100M` (100.139.008 tokens, paso 382). No se incluyen checkpoints con estado del optimizador.

## Capacidades

- Generación de texto en inglés y otros idiomas heredados del base, aunque la model card no documenta idiomas soportados.
- Razonamiento y conocimiento general heredados de Qwen3.5-2B, sujetos a la fidelidad de la destilación.
- Ejecución con profundidad efectiva ampliada (36 capas frente a 24), lo que en teoría favorece tareas que requieren composición de pasos.
- Compatibilidad con vLLM mediante el plugin registrado por el paquete `looptransv2` (`vllm.general_plugins`).
- Carga mediante `looptransv2.models.io.load_looped` en bfloat16.
- No se documentan tool calling, function calling, agentes, visión ni modo thinking en la información disponible.

## Casos de uso

- Investigación sobre transformers recurrentes en profundidad: comparar esta planificación de bucle (percentil 90 de coste) frente a otras del espacio de 200.000 planificaciones válidas para medir el impacto del coste de la etapa 1 en la calidad final.
- Estudios de destilación con profesor congelado: usar la pérdida KL forward y la pérdida de interfaz de bucle como referencia reproducible para experimentos de compresión de profundidad.
- Análisis de eficiencia de pesos compartidos: evaluar si 36 capas ejecutadas con pesos de 24 ofrecen ventajas de calidad por parámetro frente al Qwen3.5-2B original.
- Reproducción de experimentos: cargar `t0050M` y `t0100M` para trazar la curva de recuperación entre 50M y 100M de tokens de destilación.
- Validación de infraestructura de inferencia: probar la integración del plugin de vLLM 0.31.0 con arquitecturas no estándar en pipelines de serving.
- Base para ajuste fino posterior: partir de un modelo de ~2B con licencia Apache 2.0 para tareas de generación de texto específicas una vez validada la fidelidad de la destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existen informes bajo `bench/` en las exportaciones donde se evaluaron, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 4-5 GB para los pesos de un modelo de ~2B, más la memoria de las cachés KV adicionales asociadas a los pases de atención extra (m = 1).
- GPU recomendadas: A100 o H100 para entrenamiento y evaluación a gran escala; RTX 4090, RTX 3090 o A10 para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más en bfloat16, aunque no se han publicado mediciones específicas.
- Opciones de despliegue: vLLM 0.31.0 con el paquete `looptransv2` instalado (registra un entry point `vllm.general_plugins`); la carga directa requiere `transformers` 5.17.0 y `flash-linear-attention` 0.5.2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Profundidad ejecutada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looptransv2-qwen3.5-2b-s2-trial-m1_p90 | ~2B (heredados) | No disponible | 36 capas (24 con pesos compartidos) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen3.5-2B (modelo base) | ~2B | No disponible | 24 capas | No disponible en la informacion | HuggingFace (Qwen/Qwen3.5-2B) |
| Alternativas de ~2B con bucle recurrente | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: es un control no seleccionado de un barrido de planificaciones, no un modelo optimizado para producción.
- Solo se publican exportaciones hasta 100M de tokens de los 600M previstos en la etapa 2; la recuperación respecto al profesor puede ser incompleta.
- No se han publicado benchmarks ni evaluaciones de calidad en la información disponible, por lo que se desconoce la degradación respecto a Qwen3.5-2B.
- Requiere código y versiones específicas (`looptransv2`, transformers 5.17.0, vLLM 0.31.0, flash-linear-attention 0.5.2); no es cargable con `AutoModelForCausalLM` estándar.
- Los pases de atención extra implican cachés KV adicionales, lo que incrementa el consumo de memoria en contextos largos.
- No se documentan sesgos, idiomas soportados ni comportamiento de alucinación; deben evaluarse empíricamente antes de cualquier uso real.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones hace desaconsejable su despliegue sin validación previa.
- El repositorio no incluye checkpoints con estado del optimizador, lo que limita la reanudación exacta del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/arianraje/looptransv2-qwen3.5-2b-s2-trial-m1_p90
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto: https://github.com/arianraje/LoopTrans (rama `v2`, commit `1463f44`)
