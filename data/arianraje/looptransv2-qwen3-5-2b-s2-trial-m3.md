# arianraje/looptransv2-qwen3.5-2b-s2-trial-m3

## Resumen

looptransv2-qwen3.5-2b-s2-trial-m3 es un modelo experimental de generacion de texto derivado de Qwen3.5-2B, publicado por el usuario arianraje en Hugging Face. La propuesta consiste en convertir un transformer convencional de 24 capas en un modelo "looped": un bloque de capas internas (de la 10 a la 21, en indexacion 0-based) se ejecuta dos veces compartiendo pesos, elevando la profundidad efectiva de ejecucion de 24 a 36 capas sin incrementar el numero de parametros. Es, por tanto, un experimento de recurrent depth aplicado sobre un modelo base ya entrenado.

El modelo corresponde a la etapa 2 (Stage 2, "recovery") del proyecto LoopTransV2. En esta fase se recupera calidad tras la modificacion estructural mediante destilacion por divergencia KL hacia el Qwen3.5-2B original congelado, combinada con una perdida de interfaz de bucle, sobre 600 millones de tokens. Se publican cuatro puntos de control intermedios (50M, 100M, 150M y 200M tokens) con sus pesos, configuracion, tokenizer y manifiesto de bucle.

Su relevancia es fundamentalmente de investigacion: permite estudiar si el reuso de pesos con mayor profundidad de computo mejora la capacidad de razonamiento por token, y sirve como referencia reproducible para quienes trabajan en arquitecturas recurrentes o en eficiencia de parametros. No es un modelo listo para produccion, sino un artefacto de experimentacion con licencia Apache 2.0 y cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer (recurrent depth) sobre Qwen3.5-2B; clase `LoopedQwen3_5ForCausalLM` |
| Parametros totales | 2B (heredados del modelo base; el bucle comparte pesos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con filas empaquetadas de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con config, tokenizer y manifiesto de bucle por export) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only de 24 capas y aproximadamente 2.000 millones de parametros. La modificacion LoopTransV2 define un schedule de bucle `[10..21]×2`: las capas 10 a 21 se ejecutan dos veces con pesos compartidos, de modo que el grafo de computo tiene 36 capas efectivas pero conserva el numero de parametros del modelo original. El schedule elegido (`s2-trial-m3`) es el que la etapa 1 selecciono con presupuesto m = 3 sin restricciones, lo que implica tres pasadas adicionales de atencion y, por tanto, tres caches KV adicionales en inferencia.

El entrenamiento de la etapa 2 (recuperacion) usa destilacion por divergencia KL forward contra el Qwen3.5-2B congelado como profesor, junto con una perdida de interfaz de bucle, ambas con peso 1/1. Se optimiza con AdamW a learning rate 1e-5, 5 millones de tokens de warmup y decaimiento coseno hasta 0,1x a lo largo de 600 millones de tokens, con 64 filas empaquetadas de 4.096 tokens por paso. Los cuatro checkpoints publicados corresponden a los pasos 191, 382, 573 y 763 (50M, 100M, 150M y 200M tokens respectivamente). La configuracion completa esta en `run/config.json`. No se incluyen checkpoints con estado del optimizador.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.5-2B.
- Mayor profundidad de computo por token gracias al bucle de capas (36 capas efectivas frente a 24), orientada a mejorar el razonamiento sin aumentar parametros.
- Destilacion desde el profesor Qwen3.5-2B, que preserva parcialmente el comportamiento del modelo original.
- Soporte de tool calling y capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Integracion con vLLM mediante el plugin `vllm.general_plugins` que registra el paquete `looptransv2`.

## Casos de uso

- Investigacion en arquitecturas recurrentes: el modelo permite comparar directamente un transformer de 24 capas con su version bucleada de 36 capas efectivas sobre las mismas tareas, aislando el efecto del reuso de pesos.
- Reproduccion de experimentos de destilacion: los cuatro checkpoints intermedios permiten trazar la curva de recuperacion de calidad a lo largo de 200M tokens de entrenamiento.
- Estudio de eficiencia de parametros: sirve para medir si el incremento de profundidad de computo mejora el rendimiento por parametro en tareas de razonamiento y matematicas.
- Base para fine-tuning academico: al estar bajo Apache 2.0 y derivar de un modelo de 2B, puede ajustarse en una sola GPU para experimentos de dominio especifico.
- Evaluacion de inferencia con multiples caches KV: el schedule con m = 3 permite estudiar el coste en memoria y latencia de las pasadas adicionales de atencion en vLLM.
- Docencia y divulgacion: ejemplo reproducible de como transformar un modelo denso en uno con profundidad recurrente y validar el impacto con benchmarks propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existen informes de benchmarks bajo `bench/` en las carpetas donde se evaluo, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, un modelo de 2B en bfloat16 ocupa aproximadamente 4 GB de pesos; las tres pasadas adicionales de atencion con sus caches KV incrementan el consumo de memoria de forma proporcional a la longitud de contexto.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar ejecucion en GPUs consumer con al menos 8-12 GB de VRAM, pero no hay confirmacion del autor.
- Cabe en GPU consumer: probablemente si, dado el tamano de 2B, aunque el soporte depende del plugin de vLLM y de la implementacion del bucle.
- Opciones de despliegue: vLLM 0.31.0 con el paquete `looptransv2` instalado (registra un entry point en `vllm.general_plugins`); carga directa via `looptransv2.models.io.load_looped` con transformers 5.17.0 y flash-linear-attention 0.5.2. Soporte de llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Profundidad efectiva | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looptransv2-qwen3.5-2b-s2-trial-m3 | 2B | no disponible | 36 capas (bucle [10..21]×2) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-2B (modelo base) | 2B | no disponible | 24 capas | no disponible en la informacion | Hugging Face |
| Modelos looped comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo experimental de investigacion: no hay evidencia de validacion en produccion ni benchmarks publicados en la informacion disponible.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Requiere codigo y dependencias especificas (`looptransv2`, transformers 5.17.0, vLLM 0.31.0, flash-linear-attention 0.5.2), lo que limita su portabilidad frente a un modelo estandar.
- Las tres pasadas adicionales de atencion implican tres caches KV, con el consiguiente aumento de memoria y latencia en contextos largos.
- Solo se publican checkpoints hasta 200M tokens de los 600M previstos en el plan de entrenamiento; los puntos finales no estan disponibles.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion proporcionada; se heredan los del modelo base Qwen3.5-2B.
- Idiomas soportados no declarados; no se garantiza cobertura multilingue.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion desaconseja su despliegue sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arianraje/looptransv2-qwen3.5-2b-s2-trial-m3
- Repositorio del proyecto LoopTrans (rama `v2`): https://github.com/arianraje/LoopTrans
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
