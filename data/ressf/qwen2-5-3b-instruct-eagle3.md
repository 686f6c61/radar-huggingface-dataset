# ressf/qwen2.5-3b-instruct-eagle3

## Resumen

`ressf/qwen2.5-3b-instruct-eagle3` es una cabeza borrador (draft head) EAGLE-3 diseñada para acelerar la decodificación especulativa de `Qwen/Qwen2.5-3B-Instruct` en vLLM. No es un modelo de lenguaje autónomo: es un módulo auxiliar de 471,8 millones de parámetros que predice tokens candidatos que el modelo base verifica en paralelo, reduciendo el coste por token generado en escenarios de baja concurrencia. Lo publica el usuario `ressf` junto con un repositorio de experimentación en GitHub que documenta el entrenamiento y las mediciones.

El interés práctico reside en que cuantifica con precisión cuándo merece la pena el *speculative decoding*: en una RTX 5070 Ti de 16 GB con el objetivo en FP16, aporta entre un 18 % y un 22 % de mejora en tokens de salida por segundo con 1 a 8 clientes concurrentes, pero el beneficio se desvanece a partir de 16 clientes y se vuelve negativo con 64. Es, por tanto, una pieza útil para servir un modelo pequeño con pocas peticiones simultáneas, no para despliegues de alta densidad.

La cabeza se entrenó sobre 9.618 diálogos de UltraChat regenerados por el propio Qwen2.5-3B-Instruct, con tres épocas más tres adicionales a lr 3e-4, en unas dos horas y media sobre una única RTX 5070 Ti. El checkpoint incorpora la matriz de embeddings del modelo base, por lo que hereda la Qwen Research License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 (una capa decoder, vocabulario borrador de 32.000 tokens) sobre Qwen2.5-3B-Instruct |
| Parametros totales | 471.795.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en safetensors; las mediciones usan objetivo FP16 y FP8) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License) |
| Formato de pesos | safetensors (librería `speculators`, con `custom_code`) |

## Arquitectura y entrenamiento

La cabeza sigue el diseño EAGLE-3: una única capa decoder que opera sobre las representaciones internas del modelo objetivo y produce predicciones de tokens candidatos con un vocabulario borrador reducido a 32.000 entradas. Se entrenó con `speculators` 0.9.0a0 (commit `05f9ba2`) y se integra en vLLM 0.29.0 mediante `--speculative-config` con `method: eagle3`.

El corpus de entrenamiento consistió en 10.000 diálogos de UltraChat cuyas respuestas fueron regeneradas por el propio Qwen2.5-3B-Instruct, quedando 9.618 tras la preparación. El entrenamiento constó de tres épocas iniciales seguidas de tres más a tasa de aprendizaje 3e-4 partiendo del mejor checkpoint, con un coste aproximado de dos horas y media en una RTX 5070 Ti. La configuración medida óptima es de un token borrador por paso (`num_speculative_tokens: 1`); con dos tokens el rendimiento empeora.

## Capacidades

- Aceleración de decodificación especulativa del modelo base Qwen2.5-3B-Instruct en vLLM; no genera texto de forma autónoma.
- Predicción de un token candidato por paso de decodificación, verificado por el modelo objetivo.
- Integración con el backend de atención `TRITON_ATTN` en vLLM 0.29.0 (requiere `VLLM_USE_V2_MODEL_RUNNER=0`).
- Longitud media de aceptación medida de 1,52 tokens por paso.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento por sí misma: esas capacidades dependen íntegramente del modelo base.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Servicio de chat interactivo con baja concurrencia: con 1 a 8 clientes simultáneos, la cabeza aporta entre un 18 % y un 22 % más de tokens de salida por segundo, lo que reduce la latencia percibida en asistentes conversacionales desplegados sobre una única GPU consumer.
- Prototipado e investigación en decodificación especulativa: el repositorio de experimentación documenta el flujo completo de entrenamiento y medición, útil para reproducir resultados o adaptar la técnica a otros modelos.
- Despliegue en estaciones de trabajo con RTX 5070 Ti o GPUs de 16 GB: permite servir Qwen2.5-3B-Instruct en FP16 con un extra de throughput sin cambiar de hardware.
- Generación de texto por lotes pequeños (1 a 8 peticiones): escenarios de resumen, redacción o extracción donde el cuello de botella es la latencia por token y no la saturación del batch.
- Evaluación comparativa de técnicas de aceleración: sirve como referencia para medir el punto de cruce donde el speculative decoding deja de compensar frente a la inferencia estándar o frente a cuantización FP8.
- Integración en pipelines de serving existentes con vLLM: se añade mediante configuración, sin reentrenar el modelo base ni modificar la aplicación cliente.

## Benchmarks y rendimiento

Rendimiento medido en RTX 5070 Ti 16 GB, objetivo FP16, prompts de 512 tokens, respuestas de 256 tokens, longitud media de aceptación 1,52:

| Clientes concurrentes | 1 | 2 | 4 | 8 | 16 | 32 | 64 |
|---|---|---|---|---|---|---|---|
| Tokens de salida/s vs. sin cabeza | +20 % | +22 % | +22 % | +22 % | +18 % | +11 % | −4 % |

Calidad con y sin cabeza (siete ejecuciones por configuración):

| Benchmark | Con cabeza | Sin cabeza |
|---|---|---|
| GSM8K | 0,580 | 0,585 |
| IFEval | 0,580 | 0,585 |
| MMLU-Pro (aciertos de 350) | 134,4 | 136,7 |

El autor indica que la causa de la diferencia en MMLU-Pro no está establecida. Sobre un objetivo cuantizado en FP8, la cabeza resulta más lenta que FP8 solo con 32 y 64 clientes.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 0,9 GB en disco; en inferencia se suma a la del modelo base Qwen2.5-3B-Instruct (aproximadamente 6 GB en FP16 para los pesos, más caché KV).
- GPU de referencia en las mediciones: RTX 5070 Ti de 16 GB.
- Cabe en GPUs consumer de 16 GB o superiores sirviendo el modelo base en FP16.
- Despliegue: vLLM 0.29.0 con backend `TRITON_ATTN` y `VLLM_USE_V2_MODEL_RUNNER=0`; requiere la librería `speculators` y `custom_code`.
- Latencia y throughput: +20 % a +22 % en tokens de salida por segundo con 1 a 8 clientes; +18 % con 16; +11 % con 32; −4 % con 64.
- En objetivos cuantizados en FP8, la cabeza no aporta mejora con 32 o 64 clientes.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ressf/qwen2.5-3b-instruct-eagle3 | Cabeza EAGLE-3 para Qwen2.5-3B-Instruct | 471,8 M | no disponible | qwen-research | Hugging Face (22 descargas) |
| Qwen/Qwen2.5-3B-Instruct (sin cabeza) | LLM denso | 3,09 B (aproximado, no confirmado en la información) | no disponible | qwen-research | Hugging Face |
| Otras cabezas EAGLE-3 para modelos Qwen | Cabeza EAGLE-3 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a otras cabezas especulativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse de forma independiente para generar texto, razonar o responder preguntas.
- El beneficio desaparece con alta concurrencia: con 64 clientes el rendimiento es un 4 % peor que sin la cabeza, y con objetivos FP8 es contraproducente a partir de 32 clientes.
- Solo se ha medido con un token borrador por paso; configuraciones con más tokens resultaron más lentas.
- La integración está validada únicamente con vLLM 0.29.0, backend `TRITON_ATTN` y `VLLM_USE_V2_MODEL_RUNNER=0`; otras versiones o backends no están documentados.
- Ligera degradación de calidad observada en GSM8K, IFEval y MMLU-Pro, de causa no establecida según el autor.
- Licencia Qwen Research: restricciones para uso comercial derivadas del modelo base; conviene revisar los términos antes de desplegar en producción.
- El checkpoint contiene la matriz de embeddings de Qwen2.5-3B-Instruct, por lo que su redistribución queda sujeta a la misma licencia.
- Sesgos y riesgo de alucinación: no documentados para la cabeza; heredados del modelo base.
- Idiomas soportados: no disponibles en la información proporcionada.
- Repositorio con muy poca tracción (22 descargas, 0 likes) y creado en noviembre de 2026; no hay evidencia de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/ressf/qwen2.5-3b-instruct-eagle3
- Repositorio de código, mediciones y registro de experimentos: https://github.com/artyomsavov/llm-speculative-serving
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
