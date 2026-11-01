# arianraje/looptransv2-qwen3.5-2b-s2-trial-m1

## Resumen

looptransv2-qwen3.5-2b-s2-trial-m1 es un modelo de generacion de texto derivado de Qwen/Qwen3.5-2B mediante la tecnica de "looped transformer" o profundidad recurrente. El autor, arianraje, ha reconfigurado el modelo base para que determinados bloques de capas se ejecuten mas de una vez compartiendo pesos, elevando la profundidad efectiva de 24 a 36 capas sin incrementar el numero de parametros. Forma parte del proyecto LoopTrans (rama `v2`) y corresponde a la ejecucion de etapa 2 `s2-trial-m1`, con un cronograma de repeticiones seleccionado en la etapa 1 con un presupuesto M ≤ 1.

El modelo se ha obtenido por destilacion: durante la etapa 2 se entrena con divergencia KL directa respecto al Qwen3.5-2B original congelado como profesor, mas una perdida de interfaz de bucle, usando AdamW con tasa de aprendizaje 1e-5, calentamiento de 5 millones de tokens y decaimiento coseno sobre 600 millones de tokens hasta 0,1x. El repositorio publica cuatro puntos de control de entrenamiento (50M, 100M, 150M y 200M de tokens), lo que permite evaluar la evolucion del modelo a lo largo del proceso.

Es relevante como experimento de investigacion sobre profundidad computacional frente a profundidad de parametros: demuestra que se puede aumentar la capacidad de razonamiento ejecutando capas recurrentes en lugar de anadir parametros, manteniendo un tamano de 2B y licencia Apache 2.0. No obstante, se trata de un modelo de investigacion temprano, con cero descargas y sin benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer (transformer con profundidad recurrente), clase `LoopedQwen3_5ForCausalLM` |
| Parametros totales | 2B (heredados del modelo base Qwen3.5-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa filas empaquetadas de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Profundidad ejecutada | 36 capas (24 capas base con repeticiones) |
| Cronograma de bucles | [4..10]x2 [12..14]x2 [20..21]x2 (capas 0-indexadas) |
| Pasadas de atencion extra (m) | 1 |
| Tamano del repositorio | 15,1 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only de 2B parametros con 24 capas. La modificacion consiste en un esquema de bucle en el que los bloques de capas [4..10], [12..14] y [20..21] (indexacion 0) se ejecutan dos veces cada uno compartiendo los mismos pesos, de modo que la profundidad efectiva pasa de 24 a 36 capas. Ademas se anade una pasada de atencion extra (m = 1), lo que implica un cache KV adicional. El cronograma concreto fue seleccionado en la etapa 1 del proyecto bajo un presupuesto M ≤ 1 y corresponde a la ejecucion `s2-trial-m1`.

El entrenamiento de etapa 2 (recuperacion) se realiza por destilacion del Qwen3.5-2B original congelado: se minimiza la divergencia KL directa entre las distribuciones del alumno y del profesor, combinada con una perdida de interfaz de bucle, ambas con peso 1/1. Se usa AdamW con tasa de aprendizaje 1e-5, 5 millones de tokens de calentamiento y decaimiento coseno a lo largo de 600 millones de tokens hasta 0,1x de la tasa inicial, con 64 filas empaquetadas de 4.096 tokens por paso. La configuracion completa esta en `run/config.json` del repositorio. Los checkpoints publicados corresponden a 50M, 100M, 150M y 200M de tokens (pasos 191, 382, 573 y 763 respectivamente); no se incluyen estados del optimizador.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.5-2B.
- Razonamiento de mayor profundidad efectiva gracias a la ejecucion recurrente de capas (36 capas ejecutadas frente a 24).
- Capacidad de destilacion: el modelo ha sido entrenado para aproximar las distribuciones del Qwen3.5-2B original.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible (el autor no declara idiomas).
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Integracion con vLLM mediante un plugin de `vllm.general_plugins` registrado por el paquete `looptransv2`.

## Casos de uso

- Investigacion sobre profundidad recurrente: sirve como banco de pruebas para medir si la ejecucion repetida de capas mejora el razonamiento frente a un transformer de la misma profundidad de parametros, comparando los cuatro checkpoints publicados.
- Destilacion y compresion de conocimiento: permite estudiar como se transfiere el comportamiento del Qwen3.5-2B original a una topologia modificada mediante KL directa, util para disenar esquemas de destilacion mas eficientes.
- Experimentos de eficiencia memoria/calculo: al compartir pesos entre repeticiones, el modelo reduce el coste de almacenamiento de parametros frente a un modelo de 36 capas reales, adecuado para estudiar compromisos entre memoria y capacidad.
- Evaluacion de esquemas de atencion con cache KV extra: la pasada de atencion adicional (m = 1) permite analizar el impacto de caches KV adicionales en tareas de contexto largo.
- Base para fine-tuning en dominios especificos: al estar bajo Apache 2.0 y en safetensors, puede adaptarse con LoRA o fine-tuning completo en tareas concretas, partiendo de cualquiera de los cuatro checkpoints.
- Despliegue experimental con vLLM: el plugin registrado permite cargar el directorio de exportacion directamente en vLLM, util para prototipar servicios de inferencia con topologias no estandar.
- Reproduccion de resultados academicos: los puntos de control intermedios (50M a 200M de tokens) facilitan estudiar curvas de aprendizaje y estabilidad del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que existen informes de benchmark en subcarpetas `bench/` alli donde se evaluo el modelo, pero no se incluyen cifras en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 15,1 GB, lo que sugiere pesos en bfloat16 de aproximadamente 2B parametros mas posibles copias o artefactos. Para inferencia en bfloat16 se estiman en torno a 5-6 GB de VRAM para pesos, mas el cache KV (que incluye un cache extra por la pasada de atencion adicional m = 1) y overhead del runtime.
- GPU recomendadas: no disponible de forma explicita. Por tamano, una RTX 4090 (24 GB) o A100/H100 son suficientes para bfloat16; una RTX 3090 o 4080 tambien seria viable.
- Cabe en GPU de consumo: si, previsiblemente en GPUs con 8 GB o mas en cuantizacion de 8 bits, y en 16 GB o mas en bfloat16, aunque no hay cifras oficiales.
- Opciones de despliegue: vLLM 0.31.0 con el plugin de `looptransv2`, y carga directa con `load_looped` del paquete `looptransv2` (transformers 5.17.0, flash-linear-attention 0.5.2). Soporte de llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible. Al ejecutar 36 capas efectivas frente a 24, el coste por token es previsiblemente superior al del Qwen3.5-2B original, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Profundidad efectiva | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looptransv2-qwen3.5-2b-s2-trial-m1 | 2B | no disponible | 36 capas (24 base con bucles) | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-2B (modelo base) | 2B | no disponible | 24 capas | no disponible en la informacion | HuggingFace |
| Otros modelos de 2B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas. La comparacion mas directa es con el propio Qwen3.5-2B del que deriva, del que se diferencia por la topologia recurrente y el proceso de destilacion.

## Limitaciones y advertencias

- Modelo de investigacion temprano: cero descargas y cero likes en el momento de la ficha, sin validacion externa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que la profundidad recurrente mejore al modelo base en tareas reales.
- Requiere codigo no estandar: la arquitectura `LoopedQwen3_5ForCausalLM` no esta en transformers estandar; es necesario instalar el paquete `looptransv2` desde la rama `v2` del repositorio LoopTrans y versiones fijadas (transformers 5.17.0, vLLM 0.31.0, flash-linear-attention 0.5.2), lo que complica el despliegue en produccion.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Riesgo de alucinacion: inherente a los modelos de 2B y no cuantificado en esta ficha.
- Sesgos: no documentados por el autor; se heredan en parte los del modelo base Qwen3.5-2B.
- Checkpoints parciales: solo se publican hasta 200M de tokens de un entrenamiento previsto de 600M, por lo que el modelo puede estar infraentrenado respecto al plan completo.
- No se incluyen estados del optimizador, lo que limita reanudar el entrenamiento desde estos puntos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones y la dependencia de codigo experimental desaconsejan su uso en produccion sin validacion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianraje/looptransv2-qwen3.5-2b-s2-trial-m1
- Repositorio del proyecto LoopTrans (rama `v2`): https://github.com/arianraje/LoopTrans
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
