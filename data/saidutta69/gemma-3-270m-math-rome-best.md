# saidutta69/gemma-3-270m-math-rome-best

## Resumen

`saidutta69/gemma-3-270m-math-rome-best` es un checkpoint derivado de `google/gemma-3-270m` en el que se ha aplicado una edicion directa del espacio de pesos (weight-space editing) de inspiracion ROME, sin fine-tuning, sin reentrenamiento y sin actualizaciones de gradiente. El autor, saidutta69, parte del modelo base de Google (268.098.176 parametros, arquitectura `Gemma3ForCausalLM`) y modifica unicamente 7 tensores de la proyeccion `mlp.down_proj` en las capas 6 a 12, escalandolos por un factor alpha de 1.5. El resto de parametros, tokenizador y arquitectura permanecen identicos al modelo original.

El objetivo declarado es la mejora del razonamiento aritmetico en un modelo de muy baja capacidad mediante tecnicas de "programacion en el espacio de pesos", evaluando el resultado con exact-match sobre GSM8K (8-shot, cadena de pensamiento) y MATH-500 (0-shot). El checkpoint corresponde a la mejor ejecucion (v3) de un barrido de 9 configuraciones distintas.

La relevancia es fundamentalmente metodologica y de investigacion: el propio autor reconoce que la mejora obtenida (+3 respuestas correctas en GSM8K, de 24 a 27 sobre 1319) queda por debajo del umbral de significancia estadistica (34 aciertos necesarios para superar baseline + 2 desviaciones estandar) y que MATH-500 permanece plano. No es un modelo para produccion, sino una pieza de estudio sobre edicion de pesos en modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Gemma3ForCausalLM`), 18 capas, 4 cabezas de atencion, head_dim 256, hidden 640, intermediate 2048 |
| Parametros totales | 268.098.176 (268M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el autor publica pesos en float32 y recomienda `torch_dtype=torch.float32` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Gemma (terminos de licencia de Google) |
| Formato de pesos | safetensors |
| Vocabulario | 262.144 tokens |
| Parametros modificados | 9.175.040 (3,4 % del total): `down_proj` en capas 6-12 |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la del Gemma 3 270M original: un transformer decoder-only denso de 18 capas con 4 cabezas de atencion, dimension de cabeza 256, dimension oculta 640 y capa intermedia de 2048, sobre un vocabulario de 262.144 tokens. Este checkpoint no introduce cambios estructurales ni de tokenizador.

No hay entrenamiento en el sentido convencional. La unica intervencion es una edicion aritmetica de pesos: para las capas 6 a 12 se aplica `W' = alpha * W` sobre `mlp.down_proj` con alpha = 1.5. El autor justifica la eleccion de capas intermedias (6-12) frente a capas tardias (9-17, ejecucion v7) porque en modelos pequenos los hechos aritmeticos tienden a localizarse en las MLP intermedias; escalar las capas tardias degrada el resultado (21/1319 frente a 27/1319). El barrido incluye tambien amplificacion de cabezas de atencion (v2, sin efecto), combinacion cabeza + MLP (v4, identico a MLP sola), escalados con alpha 2.0 y 2.5 (v5, v6, mismos 27 aciertos, lo que sugiere saturacion), una insercion rank-1 estilo ROME por hecho (v8, empeora) y un task vector con `Nirav-Madhani/gemma3-270m-grpo-math` (v9, empeora MATH-500). La evaluacion se realizo en MPS con float32, batch 4, decodificacion greedy, GSM8K CoT 8-shot y MATH-500 0-shot mediante lm-eval.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del Gemma 3 270M.
- Razonamiento aritmetico elemental con cadena de pensamiento (GSM8K CoT), aunque con exactitud muy baja (2,05 % flexible, 1,36 % estricto).
- Resolucion de problemas matematicos de competicion (MATH-500) practicamente nula: 1 acierto de 500, identico al base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o razonamiento multi-paso mas alla de CoT: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre edicion del espacio de pesos: sirve como referencia reproducible de una edicion ROME-like sobre un modelo de 270M, con script `scripts/edit_weights.py` y nota de auditoria `EDIT_NOTE.json` que documentan base, tipo de edicion, alpha y capas afectadas.
- Reproduccion de experimentos de escalado de MLP: permite comparar directamente el efecto de alpha 1.5, 2.0 y 2.5 sobre `down_proj` en capas 6-12 manteniendo el resto del modelo congelado.
- Estudio de localizacion de conocimiento aritmetico: util para contrastar la hipotesis de que los hechos aritmeticos residen en MLP intermedias en modelos pequenos, comparando con la ejecucion v7 sobre capas 9-17.
- Benchmarking de tecnicas de weight-space programming: linea base contra la que medir task vectors (v9) o inserciones rank-1 (v8), ambas con resultados inferiores en este caso.
- Docencia y divulgacion: ejemplo minimo y de bajo coste computacional (1,1 GB de pesos) para explicar diferencias entre fine-tuning, edicion de pesos y merging de modelos.
- Validacion de pipelines de evaluacion: el autor publica el comando `scripts/run_full_bench.py` con ajustes lm-eval concretos (float32, batch 4, greedy), util para verificar reproduccion de resultados en MPS.

## Benchmarks y rendimiento

Resultados publicados por el autor (MPS, float32, batch 4, greedy):

| Modelo / ejecucion | GSM8K flexible | GSM8K estricto | MATH-500 |
|---|---|---|---|
| Base `google/gemma-3-270m` | 0,0182 ± 0,0037 (24/1319) | 0,0114 ± 0,0029 (15/1319) | 0,0020 ± 0,0020 (1/500) |
| Este checkpoint (v3) | 0,0205 ± 0,0039 (27/1319) | 0,0136 ± 0,0032 (18/1319) | 0,0020 ± 0,0020 (1/500) |
| v2 head-all (alpha 1.5, 18 capas) | 24/1319 | 15/1319 | 1/500 |
| v4 head+MLP (alpha 1.5, capas 6-12) | 27/1319 | 18/1319 | 1/500 |
| v5 MLP alpha 2.0 (capas 6-12) | 27/1319 | 18/1319 | 1/500 |
| v6 MLP alpha 2.5 (capas 6-12) | 27/1319 | 17/1319 | 1/500 |
| v7 MLP late (alpha 1.5, capas 9-17) | 21/1319 | 15/1319 | 1/500 |
| v8 ROME rank-1 (escala 0.3, capas 6-12) | 21/1319 | 15/1319 | 0/500 |
| v9 task-vector (theta + 0.2 tau) | 24/1319 | 19/1319 | 0/500 |

Desglose de MATH-500 en el modelo base: Algebra 1/124 (0,81 %); resto de materias 0 aciertos. Por nivel de dificultad: nivel 1 0/43, nivel 2 0/90, nivel 3 1/105 (0,95 %), nivel 4 0/128, nivel 5 0/134. La mejora de +3 aciertos en GSM8K queda por debajo del umbral de significancia (baseline + 2*stderr = 34,0).

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,1 GB solo para pesos, mas activaciones y cache KV; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- En float16/bfloat16 (no publicado por el autor pero tecnicamente posible al mantener la arquitectura del base): en torno a 550 MB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; el autor ejecuto las evaluaciones en MPS (Apple Silicon).
- Cabe en GPU consumer: si, sin restricciones practicas de memoria.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (metodo documentado por el autor); llama.cpp, Ollama, vLLM o TGI no estan documentados en la informacion disponible, aunque al conservar la arquitectura del Gemma 3 270M deberian ser tecnicamente aplicables.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (flexible) | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (v3) | 268M | no disponible | 2,05 % (27/1319) | 0,20 % (1/500) | Gemma | Hugging Face |
| `google/gemma-3-270m` (base) | 268M | no disponible | 1,82 % (24/1319) | 0,20 % (1/500) | Gemma | Hugging Face |
| `Nirav-Madhani/gemma3-270m-grpo-math` | 268M | no disponible | no disponible | no disponible | Gemma (presumible) | Hugging Face (referenciado como fuente del task vector) |

No se dispone de datos de benchmarks de terceros para establecer comparaciones con otros modelos matematicos de tamano similar dentro de la informacion proporcionada.

## Limitaciones y advertencias

- La mejora reportada (+3 aciertos en GSM8K) no alcanza significancia estadistica segun el criterio del propio autor (se requieren 34 aciertos para superar baseline + 2*stderr).
- MATH-500 permanece plano en todas las ejecuciones con escalado; las variantes rank-1 y task-vector lo degradan a 0 aciertos.
- El escalado de pesos satura: alpha 1.5, 2.0 y 2.5 producen el mismo resultado (27/1319), lo que indica que aumentar el volumen de la edicion no desbloquea nuevos problemas.
- La insercion rank-1 estilo ROME y el task vector resultan demasiado groseros para insertar hechos aritmeticos en este modelo.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Riesgo alto de alucinacion y de razonamiento incorrecto: con exactitudes por debajo del 3 % en GSM8K y del 1 % en MATH-500, el modelo no es fiable para tareas aritmeticas reales.
- Licencia Gemma: se aplican los terminos de redistribucion de Google; no es MIT ni Apache 2.0, y deben respetarse las condiciones de la licencia antes de redistribuir los pesos.
- Modelo de investigacion sin despliegue en produccion conocido (0 descargas, 0 likes en el momento de la ficha); sin pipeline declarado en Hugging Face.
- Ausencia de datos sobre contexto maximo, cuantizaciones validadas y rendimiento en hardware distinto de MPS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/gemma-3-270m-math-rome-best
- Repositorio de codigo y resultados: https://github.com/instax-dutta/gemma-ws-edit
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Blog de presentacion de Gemma 3 270M: https://developers.googleblog.com/en/introducing-gemma-3-270m/
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Modelo fuente del task vector: https://huggingface.co/Nirav-Madhani/gemma3-270m-grpo-math
