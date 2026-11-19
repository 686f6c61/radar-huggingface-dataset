# SargeDev/Solar-Decision-JEV-27B-V3-GGUF

## Resumen

Solar-Decision-JEV-27B-V3 es un modelo de decisión tipada derivado de Huihui-Qwen3.8-27B-abliterated, desarrollado por SargeDev. Su particularidad es que el "readout" de decisiones está entrenado dentro del propio modelo: una decisión tipada se resuelve con un único prefill con `max_tokens=1`, leyendo las log-probabilidades sobre los tokens de las opciones. No requiere una cabeza separada en tiempo de inferencia, aunque el repo incluye `decision_head.json`, `calibration.json` y `serve_decide.py` para el flujo completo.

La V3 se entrena sobre la unión de dos corpus propios (jev-distill-corpus-v3 y solar-decisions-corpus-v4, 764.626 filas y 90 dominios) con un LoRA solar de rango 32 y alfa 64, añadiendo `lm_head` a los módulos objetivo y fusionando en el paso 2184. Respecto a la V2, mejora de forma notable el top-1 en tareas de elección (0,571 a 0,833) y de scoring (0,567 a 0,794), a costa de un empeoramiento claro de la calibración (ECE de 0,021 a 0,167).

El modelo tiene 27.320.697.856 parámetros y se distribuye principalmente como GGUF (11 cuantizaciones, de F16 a Q2_K) y en NVFP4-FP8. La ruta de decisión tipada solo funciona con vLLM, ya que llama.cpp no devuelve las log-probabilidades por token que necesita ese flujo; el GGUF está pensado para chat, no para decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B), con LoRA fusionado sobre atención, MLP y `lm_head` |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q2_K a Q8_0 (11 variantes GGUF) y NVFP4-FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 19 shards, 52 GB), GGUF, NVFP4-FP8 |

## Arquitectura y entrenamiento

El modelo parte de Huihui-Qwen3.8-27B-abliterated, un backbone transformer de tipo Qwen3.8 con las capas de rechazo ablacionadas. Sobre él se aplica un LoRA solar de rango 32 y alfa 64 entrenado sobre la unión de jev-distill-corpus-v3 y solar-decisions-corpus-v4 (764.626 filas, 90 dominios), fusionado en el paso 2184. La innovación principal respecto a la V2 es doble: por un lado, el corpus de entrenamiento incorpora las filas de tipo verbalizador y de forma de decisión del estilo r32, atacando el desajuste de readout a nivel de datos; por otro, se añade `lm_head` a los módulos objetivo del LoRA, de modo que la geometría del vocabulario de salida de la cabeza de decisión se entrena junto con el resto del modelo.

El flujo de decisión tipada consiste en un único prefill con `max_tokens=1` y la lectura de las log-probabilidades sobre los tokens de las opciones, con una cabeza de decisión de 24 slots y calibración asociada (crédito de AutoTrust AI). El repo conserva además los tensores del drafter MTP/nextn, por lo que la decodificación especulativa funciona en llama.cpp.

## Capacidades

- Generación de texto conversacional y de uso general sobre el backbone Qwen3.8-27B.
- Decisiones tipadas: elección entre opciones (`choice`), puntuación (`score`) y abstención (`noul`), resueltas en un solo prefill vía log-probabilidades.
- Probabilidades calibradas sobre las opciones (con la advertencia de calibración de la V3 indicada más abajo).
- Modelo abliterado: sin las capas de rechazo del modelo original.
- Decodificación especulativa en llama.cpp gracias a los tensores MTP/nextn preservados.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de decisiones en pipelines: dado un conjunto cerrado de opciones (por ejemplo, clasificar una incidencia en una categoría), el modelo devuelve la opción más probable y su log-probabilidad en un solo paso, lo que permite umbralizar y derivar a revisión humana.
- Scoring de candidatos: puntuar respuestas, propuestas o salidas de otro modelo con una escala tipada, usando la ruta `score` para ordenar resultados antes de una fase de verificación.
- Detección de abstención: usar la señal `noul` (AUROC 0,988) para que el sistema se abstenga cuando la confianza no alcanza el umbral, reduciendo decisiones erróneas en producción.
- Chat de uso general sobre el backbone: el GGUF permite desplegar el modelo como asistente conversacional en llama.cpp u Ollama, aprovechando la decodificación especulativa.
- Investigación en calibración y modelos de decisión: el repo incluye `decision_head.json`, `calibration.json` y `serve_decide.py`, lo que facilita reproducir el harness y comparar métricas entre checkpoints.
- Evaluación de sesgos y comportamiento de modelos abliterados: útil para estudiar cómo cambia la distribución de decisiones al eliminar las capas de rechazo, comparando contra el backbone original.
- Prototipado de sistemas "system-one": decisiones rápidas de un solo token en lugar de generación autoregresiva larga, adecuado para bucles de agentes con latencia ajustada.

## Benchmarks y rendimiento

Resultados de la puerta de evaluación del autor (27.695 filas, mismo harness, cabeza y calibración en todas las columnas):

| Metrica | V2 (r32+1894) | V3 (paso 2184) | Referencia r32-alone | Umbral AutoTrust |
|---|---|---|---|---|
| choice top-1 | 0.571 | 0.833 | 0.869 | 0.904 |
| score top-1 | 0.567 | 0.794 | no disponible | 0.891 |
| noul AUROC | 0.962 | 0.988 | 0.992 | 0.996 |
| noul top-1 | 0.879 | 0.939 | no disponible | no disponible |
| choice ECE | 0.021 | 0.167 | no disponible | no disponible |

Rendimiento de inferencia con llama-bench (GB10, build CUDA, `-ngl 99`, pp512 / tg128):

| Cuantizacion | Tamano | pp512 | tg128 |
|---|---|---|---|
| Q4_K_M | 15.65 GiB | 865.94 | 12.80 |
| Q8_0 | 27.04 GiB | 818.03 | 8.38 |

## Requisitos de hardware

- VRAM estimada: unos 15,65 GiB para Q4_K_M y 27,04 GiB para Q8_0, según los tamanos reportados en llama-bench; el repo completo en bf16 ocupa 52 GB en 19 shards.
- GPU recomendadas: no disponibles en la información proporcionada; los datos de rendimiento proceden de un GB10 con build CUDA.
- Cabe en GPU de consumo: Q4_K_M (15,65 GiB) es viable en tarjetas con 16 GB o más; Q8_0 requiere alrededor de 27 GiB.
- Opciones de despliegue: vLLM para la ruta de decisión tipada (necesita log-probabilidades por token); llama.cpp para chat y decodificación especulativa (no devuelve las log-probabilidades que exige la ruta de decisión). También existe una variante NVFP4-FP8 de 29 GB.
- Latencia y throughput: medidos en llama-bench sobre GB10; 865,94 tok/s en pp512 y 12,80 tok/s en tg128 para Q4_K_M; 818,03 tok/s en pp512 y 8,38 tok/s en tg128 para Q8_0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | choice top-1 | noul AUROC | Licencia | Formato |
|---|---|---|---|---|---|---|
| Solar-Decision-JEV-27B-V3 | 27,3B | no disponible | 0.833 | 0.988 | Apache 2.0 | safetensors, GGUF, NVFP4-FP8 |
| JEV-27B-Uncensored (r32-alone) | no disponible | no disponible | 0.869 | 0.992 | no disponible | no disponible |
| Huihui-Qwen3.8-27B-abliterated | 27,3B (base) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con el backbone original y con la referencia r32-alone se limita a las métricas de decisión publicadas por el autor; no hay datos de benchmarks generales (MMLU, HumanEval, GSM8K) para ninguno de ellos en la información disponible.

## Limitaciones y advertencias

- Calibración degradada en la V3: el ECE de `choice` sube de 0,021 a 0,167, lo que indica sobreconfianza en filas difíciles. Si se necesitan probabilidades calibradas, el autor recomienda r32-alone (SargeDev/JEV-27B-Uncensored).
- Por debajo del umbral AutoTrust en `choice` y `score` top-1 (0,833 frente a 0,904 y 0,794 frente a 0,891).
- La ruta de decisión tipada solo funciona con vLLM; llama.cpp no devuelve las log-probabilidades necesarias. El GGUF debe usarse para chat, no para decisiones.
- Modelo abliterado: la eliminación de las capas de rechazo puede aumentar la probabilidad de generar contenido sensible o inapropiado; requiere filtros y políticas de uso en producción.
- El autor advierte explícitamente que este repo no es el modelo de la tabla del "judgment fix" del 9 de noviembre de 2026; esa medición (3,3% de falsos positivos en código limpio) corresponde a Arete-27B-Uncensored-V2, no a estos pesos.
- Idiomas soportados no especificados; no hay garantías documentadas de rendimiento multilingüe.
- Longitud de contexto no documentada en la información disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y los componentes de terceros (AutoTrust AI, TypeSafe AI) pueden tener condiciones adicionales no detalladas.

## Enlaces

- Hugging Face: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V3-GGUF
- Cuantización NVFP4-FP8: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V3-NVFP4-FP8
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Referencia r32-alone: https://huggingface.co/SargeDev/JEV-27B-Uncensored
- Modelo del "judgment fix": https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2
- Dataset jev-distill-corpus-v3: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Dataset solar-decisions-corpus-v4: https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4
- Vídeo de referencia "Morgan's Code": https://youtu.be/zOd9I4APpfE
