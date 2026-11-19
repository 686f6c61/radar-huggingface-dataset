# JackHsieh/Qwen3-4B.gpnph-rl.peS2o-humanities-iid40M-sans256.lr3e-7-kl0.step-1856

## Resumen

Qwen3-4B.gpnph-rl.peS2o-humanities-iid40M-sans256.lr3e-7-kl0.step-1856 es un ajuste fino por aprendizaje por refuerzo (RL) del modelo Qwen3-4B de Alibaba, publicado por el usuario JackHsieh en Hugging Face. No se trata de un modelo conversacional de proposito general, sino de un generador de "notas" o "pensamientos" (thought generator) especializado en un dominio muy concreto: predecir un parrafo general que resuma los siguientes 8 tokens de un documento cientifico del subconjunto peS2o-humanities. El modelo parte de los pesos originales de Qwen3-4B y ha sido sometido a 1856 pasos de RL con un rewarder congelado.

La relevancia de esta publicacion es fundamentalmente metodologica y de investigacion: documenta de forma extremadamente detallada un pipeline de RL (RLOO con 8 muestras por prompt, perdida CISPO, optimizador con lr constante 3e-7 y sin KL) aplicado a la generacion de notas auxiliares que mejoren la probabilidad condicional de un sufijo documental. El checkpoint publicado es el mejor paso de validacion de la ejecucion (paso 1856), con una metrica de log-probabilidad media por token de -2.369495 frente a -2.370253 del Qwen3-4B original.

Arquitectonicamente hereda la estructura transformer densa de Qwen3-4B, con 4.022.468.096 parametros totales. No es un modelo pensado para uso general ni para produccion conversacional: su template de generacion desactiva el modo thinking y prefill la respuesta con "The text", por lo que su comportamiento esta fuertemente condicionado al formato de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en fp32 en la raiz del repo; servible en bf16 con vLLM) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32), con checkpoint verl/FSDP1 en `verl_checkpoint/` |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por RL sobre Qwen3-4B, un transformer denso de aproximadamente 4.000 millones de parametros. El entrenamiento no modifica la arquitectura: se parte de los pesos stock y se aplica RL para especializar el comportamiento generativo en la tarea de generar notas. El objetivo es que el modelo, dado un prefijo de documento, escriba un parrafo general sobre los siguientes 8 tokens; la nota se puntua con un rewarder congelado que calcula la log-probabilidad por token del sufijo real del documento, condicionada a la nota y al prefijo.

El algoritmo de RL combina RLOO con 8 muestras por prompt y 64 prompts por paso, temperatura 1 y top_p 1, con parada en EOS y un limite de 2560 tokens. La recompensa es la recompensa por token menos una penalizacion lineal por longitud (de 0 a 2048 tokens hasta 0.1 a 2560). La perdida es CISPO, con optimizador de lr constante 3e-7 y sin termino KL. Los datos de RL son 256 documentos que el rewarder nunca vio en entrenamiento (particion `train[9472:9728]`), con todos los chunks stride-1, lo que suma 130.816 prompts (2.044 pasos por epoca). La validacion se realiza sobre el grid stride-32 completo del test iid de 20M (72.960 prompts, 1 muestra por prompt). El rewarder es un Qwen3-4B-Base con CPT sobre peS2o-humanities iid `train[:9472]` y notas gpnph `.kv-tags-thought` antepuestas. El entrenamiento se ejecuto con verl (fork de prestar, receta `jepo_frozen_rewarder`) y checkpointing FSDP1 con world size 8.

## Capacidades

- Generacion de texto condicionada a prefijo documental, especializada en producir notas de parrafo general sobre los siguientes 8 tokens.
- Generacion de "thoughts" en el formato gpnph (general-paragraph-nothink-prefill-humanities), con thinking desactivado y prefill "The text".
- No es un modelo conversacional de proposito general: el template stock de Qwen3 no es el adecuado para su uso previsto.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles (no documentadas; el dominio de entrenamiento es peS2o-humanities, corpus cientifico en ingles).
- Capacidades especiales: modo thinking desactivado por diseno; el modelo esta pensado para ser puntuado por un rewarder de sufijo condicional, no para responder al usuario.

## Casos de uso

- Investigacion en RL para generacion de notas auxiliares: el modelo sirve como referencia reproducible de un pipeline RLOO + CISPO con rewarder congelado, util para estudiar como las notas afectan a la log-probabilidad de sufijos documentales.
- Generacion de anotaciones sinteticas para corpus cientificos: puede producir notas de parrafo sobre fragmentos de peS2o-humanities que luego se usen como datos auxiliares en tareas de modelado de lenguaje o recuperacion.
- Estudio de formatos de "thought" y prefill: al usar un template especifico (gpnph) con thinking off y prefill "The text", permite analizar el efecto del formato en el rendimiento de la nota.
- Base para ablaciones de hiperparametros de RL: la model card documenta lr, KL, penalizacion de longitud y presupuesto de pasos, lo que facilita reproducir y comparar variantes.
- Evaluacion de rewarders de sufijo condicional: el checkpoint permite medir la sensibilidad del rewarder frente a distintas notas generadas por el propio modelo.
- Punto de partida para reanudar entrenamiento: el `verl_checkpoint/` con shards FSDP1 world size 8, scheduler, dataloader y estado del rewarder permite continuar la ejecucion desde el paso 1856.
- Analisis de ruido de validacion: la model card reporta revalidaciones del paso 1024 (-2.369763 y -2.369898) frente al paso 1856 (-2.369495), util para estudiar la estabilidad de la metrica.

## Benchmarks y rendimiento

| Metrica | Modelo | Valor |
|---|---|---|
| Log-probabilidad media por token del sufijo (validacion, stride-32, 72.960 prompts) | Qwen3-4B stock (paso 0) | -2.370253 |
| Log-probabilidad media por token del sufijo (validacion, stride-32, 72.960 prompts) | Este checkpoint (paso 1856) | -2.369495 |
| Log-probabilidad media por token del sufijo (revalidacion paso 1024) | Checkpoint intermedio | -2.369763 y -2.369898 |
| Log-probabilidad media por token del sufijo (fin de ejecucion, paso 2044) | Checkpoint final | -2.369847 |

La diferencia entre el paso 1856 y el paso 0 es de aproximadamente 0.00076, y la model card advierte que diferencias por debajo de 0.0002 estan dentro del ruido de validacion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 4.022 millones de parametros ocupan aproximadamente 16 GB solo en pesos, mas overhead de activaciones y KV cache; en bf16, aproximadamente 8 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para servir en fp32 o bf16 con vLLM; en consumer, una RTX 4090 (24 GB) puede alojar los pesos en bf16 con margen para KV cache, aunque la model card no documenta requisitos oficiales.
- Cabe en consumer GPU: si, en bf16 en GPUs de 16-24 GB como RTX 4080/4090 o A6000, segun estimacion a partir del numero de parametros.
- Opciones de despliegue: vLLM (soporta servir los pesos en bf16), transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`).
- Latencia y throughput estimados: no disponibles.
- Nota: el repo ocupa 65.9 GB porque incluye pesos fp32 y el checkpoint verl/FSDP1; para inferencia solo se necesitan los pesos de la raiz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la metrica de validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-4B gpnph RL paso 1856) | 4.022 M | no disponible | -2.369495 | no disponible | Hugging Face (JackHsieh) |
| Qwen3-4B stock | 4.022 M (aprox.) | no disponible | -2.370253 | no disponible en la informacion | Hugging Face (Qwen) |
| Qwen3-4B-Base CPT peS2o-humanities (rewarder) | 4.022 M (aprox.) | no disponible | no disponible | no disponible | Hugging Face (JackHsieh) |

No se dispone de comparaciones con otros modelos de la misma categoria en la informacion proporcionada; la unica comparacion directa documentada es frente al Qwen3-4B original en la metrica de log-probabilidad del sufijo.

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea (generacion de notas gpnph para peS2o-humanities) y no debe usarse como modelo conversacional de proposito general.
- El template stock de Qwen3 no es el adecuado; hay que usar `prestar/general-paragraph-nothink-prefill-humanities.jinja`, que desactiva thinking y prefill "The text".
- La mejora medida frente a Qwen3-4B stock es muy pequena (-2.369495 frente a -2.370253) y la propia model card senala que diferencias por debajo de 0.0002 estan dentro del ruido de validacion.
- Sesgos conocidos: no disponibles; el entrenamiento se limita a un subconjunto de corpus cientifico en ingles (peS2o-humanities), por lo que el comportamiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo genera texto libre condicionado a un prefijo, sin verificacion factual.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica en la model card; los idiomas soportados no estan documentados.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- El checkpoint de entrenamiento (`verl_checkpoint/`) requiere el fork de verl de prestar, 8 rangos FSDP y la receta `jepo_frozen_rewarder` para reanudar; las rutas locales del config resuelto apuntan al cluster original.
- La aleatoriedad de generacion no se guarda en el checkpoint; reanudar con la misma semilla reproduce los mismos rollouts, y cambiarla requiere el `FSDPVLLMShardingManager` con semilla del fork de prestar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackHsieh/Qwen3-4B.gpnph-rl.peS2o-humanities-iid40M-sans256.lr3e-7-kl0.step-1856
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Rewarder: https://huggingface.co/JackHsieh/4B-base.4B-gpnph-kvtt.peS2o-humanities-iid-40M-sans-256.stride-1.suffix-conditional
- Dataset peS2o-humanities iid: https://huggingface.co/datasets/JackHsieh/peS2o-humanities-160M-20M-iid
- Repositorio verl (framework de RL): no disponible en la informacion proporcionada (se menciona un fork de prestar sin URL)
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada
