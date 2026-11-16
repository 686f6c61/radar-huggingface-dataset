# CharlesDDDD/DRV-Qwen3-1.7B-loop3-run1

## Resumen

DRV-Qwen3-1.7B-loop3-run1 es un modelo de lenguaje derivado de Qwen/Qwen3-1.7B-Base mediante *continued pretraining* con una arquitectura de transformer recurrente en profundidad (*looped transformer*). Lo desarrolla el usuario CharlesDDDD dentro de la colección "Depth Recurrent Vector" y su innovación central es que un bloque de 12 capas (capas 8-19 de las 28 totales) se ejecuta tres veces consecutivas con los mismos pesos, de modo que el modelo obtiene más cómputo por token sin incrementar el número de parámetros.

El modelo conserva los 1.720.577.024 parámetros del Qwen3-1.7B original (no es MoE, todos los parámetros están activos) y añade únicamente un mecanismo de puerta aprendida por canal (`model.loop_gate`) que controla cómo se combinan las salidas de cada pasada. Se entrenó sobre unos 20B tokens con secuencias de 16K, mezcla de web, PDF, código y trayectorias de agente, con AdamW y LR pico de 3e-4 con decaimiento coseno.

Es relevante porque explora una vía barata de escalar cómputo en inferencia (recurrencia en profundidad) sobre un modelo pequeño y de licencia Apache 2.0, y porque publica una ablación de pérdida por número de pasadas que permite evaluar el compromiso entre calidad y coste computacional. Es un modelo base, sin ajuste de instrucciones, y su arquitectura no está soportada todavía por motores de serving estándar como vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con recurrencia en profundidad (looped transformer); bloque de capas 8-19 repetido 3 veces |
| Parametros totales | 1.720.577.024 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 16K tokens (longitud de secuencia de entrenamiento); no se especifica contexto máximo de inferencia |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (heredados de Qwen3-1.7B-Base, no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder denso de 28 capas. En esta variante, las capas 0-7 se ejecutan una vez, después el bloque formado por las capas 8-19 se ejecuta tres veces seguidas reutilizando los mismos pesos, y finalmente las capas 20-27 se ejecutan una vez. La conexión entre pasadas no es una simple reinyección de la salida: la primera pasada lee la salida `e` de la capa 7, y cada pasada posterior lee `e + g * (salida de la pasada anterior - e)`, donde `g` es un escalar aprendido por canal oculto (`model.loop_gate`). Con `g = 0` el modelo degenera exactamente en el Qwen3 original, lo que convierte la recurrencia en una desviación aprendida respecto al modelo base.

El entrenamiento consistió en un *continued pretraining* de aproximadamente 20B tokens en una sola pasada sobre una mezcla de web, PDF, código y trayectorias de agente, con secuencias de 16K tokens, optimizador AdamW y LR pico de 3e-4 con decaimiento coseno. Además, se aplicó una pérdida auxiliar de peso 0.0555 sobre la predicción realizada tras cada pasada intermedia, de forma que detener la recurrencia antes de tiempo sigue produciendo salidas razonables. La implementación de Hugging Face reproduce el código de entrenamiento con una discrepancia de 0.003 nats de pérdida en todos los números de pasadas. No se documenta RLHF ni DPO (es un modelo base).

## Capacidades

- Generación de texto autoregresiva en modo *base* (sin ajuste de instrucciones ni formato conversacional entrenado).
- Razonamiento y conocimiento general heredados de Qwen3-1.7B-Base, con cómputo adicional por token gracias a la recurrencia.
- Generación de código, dado que la mezcla de entrenamiento incluye código.
- Procesamiento de trayectorias de agente (la mezcla de entrenamiento incluye *agent-trajectory*), aunque sin *tool calling* nativo documentado.
- Número de pasadas configurable en inferencia mediante el argumento `num_loops`, lo que permite un compromiso explícito entre calidad y coste.
- Salidas razonables con parada temprana (1 o 2 pasadas) gracias a la pérdida auxiliar intermedia.
- Capacidades multilingües: no documentadas explícitamente en la model card.
- No soporta visión, audio ni *thinking mode*.

## Casos de uso

- Investigación sobre recurrencia en profundidad: el modelo sirve como banco de pruebas controlado para estudiar si repetir un bloque de capas mejora la calidad por token frente a aumentar parámetros, con la ventaja de que la ablación de pérdida por pasadas ya está publicada.
- Generación de código en pipelines internos: al haberse entrenado con código y disponer de 16K de contexto, puede usarse para completar funciones o generar tests en entornos donde se controle el *stack* de inferencia (transformers con `trust_remote_code`).
- Procesamiento de documentos largos: con secuencias de 16K tokens puede resumir o extraer información de PDFs e informes, uno de los tipos de dato presentes en la mezcla de entrenamiento.
- *Continued pretraining* y experimentos de ajuste fino: al ser un modelo base Apache 2.0, es adecuado como punto de partida para *fine-tuning* supervisado en dominios concretos antes de convertirlo en un modelo instruct.
- Estudio del compromiso coste-calidad en producción: permite comparar latencia y pérdida con 1, 2 o 3 pasadas para decidir cuánto cómputo adicional merece la pena en un despliegue concreto.
- Simulación de trayectorias de agente: la inclusión de *agent-trajectory* en el entrenamiento lo hace útil para experimentos de modelado de secuencias de acciones, siempre que se implemente el bucle de agente fuera del modelo.
- Evaluación comparativa de arquitecturas: sirve como referencia frente a `DRV-Qwen3-1.7B-midtrain-noloop` para medir el efecto aislado del bucle.

## Benchmarks y rendimiento

El autor publica únicamente la pérdida en un conjunto de test reservado de la mezcla de entrenamiento, no benchmarks estándar (MMLU, HumanEval, GSM8K).

| passes | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| loss | 1.1952 | 1.1471 | 1.1178 | 1.1294 | 1.1226 | 1.1300 | 1.1263 | 1.1308 |

El control sin bucle (`DRV-Qwen3-1.7B-midtrain-noloop`) obtiene 1.1460. El mejor resultado se da con 3 pasadas (1.1178), que es el número con el que se entrenó; a partir de 4 pasadas la pérdida se estabiliza en torno a 1.12-1.13. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: alrededor de 3,5 GB solo para pesos (1,72B parámetros × 2 bytes), más caché KV. El autor indica que con 3 pasadas la caché KV es aproximadamente 1,9 veces la de un Qwen3-1.7B estándar, por lo que el consumo total crece de forma apreciable con el contexto.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para contextos moderados en bf16; A100 o H100 para contextos cercanos a 16K o para *fine-tuning*.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4070/4080 o RTX 4090, siempre con contexto ajustado y teniendo en cuenta la caché multiplicada por las pasadas.
- Opciones de despliegue: únicamente `transformers` con `trust_remote_code=True` (probado con transformers 5.14). vLLM y otros motores de serving no soportan esta arquitectura todavía; llama.cpp, Ollama y TGI no están documentados como compatibles.
- Latencia y throughput: no disponibles. Cualitativamente, el coste por token escala con el número de pasadas, de modo que 3 pasadas implican aproximadamente el triple de cómputo en el bloque recurrente que una ejecución única.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Serving estándar | Notas |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-loop3-run1 | 1,72B (denso) | 16K (entrenamiento) | Apache 2.0 | No (solo transformers con código remoto) | Pérdida de test 1.1178 con 3 pasadas |
| DRV-Qwen3-1.7B-midtrain-noloop | 1,72B (denso) | 16K (entrenamiento) | Apache 2.0 | No documentado | Control sin bucle, pérdida de test 1.1460 |
| Qwen/Qwen3-1.7B-Base | 1,72B (denso) | no disponible en la información | Apache 2.0 | Sí (vLLM, TGI, llama.cpp) | Modelo base original; con `g = 0` el modelo DRV es idéntico a este |

No se dispone de datos de benchmarks estándar para comparar rendimiento de tarea entre estos modelos; la única comparación cuantitativa publicada es la pérdida de test sobre la mezcla de entrenamiento.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional sin *fine-tuning* posterior.
- No soportado por vLLM ni por otros motores de serving habituales; requiere `transformers` con `trust_remote_code=True`, lo que implica ejecutar código del autor y complica el despliegue en producción.
- La caché KV se multiplica por el número de pasadas (aproximadamente 1,9× con 3 pasadas), lo que reduce el contexto efectivo alcanzable con una VRAM dada.
- Riesgo de alucinación inherente a un modelo de 1,7B entrenado con 20B tokens adicionales; no se han publicado evaluaciones de factualidad.
- Sesgos: no documentados por el autor; se heredan los del corpus de Qwen3-1.7B-Base y los de la mezcla web/PDF/código utilizada.
- Idiomas soportados no declarados explícitamente; el rendimiento fuera del inglés y el chino puede ser inferior.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ), por lo que el despliegue en CPU o en GPUs muy limitadas no está validado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y una única ejecución de entrenamiento publicada; no hay validación externa de su calidad.
- La licencia Apache 2.0 permite uso comercial, pero la obligación de `trust_remote_code` y la falta de soporte en motores estándar deben evaluarse antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-loop3-run1
- Modelo de referencia sin bucle: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Colección Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
