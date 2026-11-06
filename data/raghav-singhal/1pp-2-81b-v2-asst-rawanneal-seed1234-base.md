# Raghav-Singhal/1pp-2.81b-v2-asst-rawanneal-seed1234-base

## Resumen

El modelo `1pp-2.81b-v2-asst-rawanneal-seed1234-base` es un artefacto de investigación desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. Se trata de un modelo de lenguaje de 2.807.699.328 parámetros (2,81B) entrenado desde cero con una arquitectura tipo Llama, concebido no como un asistente de propósito general sino como una pieza dentro de un estudio controlado sobre cómo afecta la composición de los datos de preentrenamiento a las capacidades conversacionales del modelo.

El experimento 1PP organiza los modelos en una "escalera" (ladder v2) de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de datos y tres semillas (28, 42 y 1234). Cada tamaño se entrena desde cero durante 20,3 tokens de asistente por parámetro sobre un flujo de datos alineado por pasos, de modo que las diferencias entre modelos reflejan únicamente el texto de los documentos y la máscara de pérdida, o bien la inicialización de parámetros en el caso de las semillas. Este modelo concreto corresponde a la condición "asst" con la variante "rawanneal": los primeros 48.339 pasos se entrenan con los documentos originales de DCLM-edu y los últimos 5.370 pasos (el cooldown) con conversaciones reescritas a partir de esos mismos documentos, aplicando la pérdida únicamente sobre los turnos del asistente.

Su relevancia es metodológica: permite aislar el efecto de introducir datos conversacionales en la fase final del preentrenamiento manteniendo constante todo lo demás (arquitectura, flujo de datos, hiperparámetros). La licencia Apache 2.0 y el formato estándar de pesos lo hacen fácilmente inspeccionable, aunque su naturaleza de artefacto de investigación limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder tipo Llama (transformer denso) |
| Parametros totales | 2.807.699.328 (2,81B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en bf16; compatibles con cuantizacion estandar via transformers/GGUF, no confirmado por el autor) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Detalles adicionales de arquitectura: 24 capas, hidden size 2.688, FFN 10.752 con SwiGLU, 21 cabezas de atencion y 7 cabezas KV (head dim 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm. Tokenizer: vocabulario SmolLM2 (49.152) mas `<|pad|>`; `<|endoftext|>` actua como token de fin de documento. Tamano del repositorio: 5,6 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama con 24 capas y 2,81B de parametros, entrenado desde cero en bf16 con el optimizador Muon (escalado por forma, LR matricial 0,005) para los parametros matriciales y Adam para el resto (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas). El entrenamiento emplea warmup de 3.378 pasos, fase constante y decaimiento lineal durante los ultimos 5.370 pasos hasta 1/100, con weight decay 0,1, desviacion estandar de inicializacion 0,0078 y batch global de 512 secuencias de 4.096 tokens, con enmascaramiento de atencion entre documentos.

La particularidad del entrenamiento es la composicion de datos por fases: los primeros 48.339 pasos usan los documentos originales de DCLM-edu y los ultimos 5.370 (el cooldown) usan conversaciones reescritas a partir de esos mismos documentos, con la perdida calculada exclusivamente sobre los turnos del asistente. Los corpus estan alineados paso a paso, de modo que cada paso del cooldown contiene las conversaciones derivadas de los documentos que el modelo vio en ese mismo paso durante la fase cruda. En total se cubren 112,64B posiciones de token (53.709 pasos). La perdida de validacion final sobre 2.433 documentos retenidos es de 1,411 en texto de asistente, 6,028 en texto de usuario y 2.898 en texto de documento. Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron con una diferencia absoluta de 0,0013 en las perdidas de validacion.

## Capacidades

- Generacion de texto autoregresiva en ingles con formato conversacional ChatML, aprendido durante la fase de cooldown.
- Produccion de respuestas de asistente cuando se le presenta un turno de usuario, aunque sin un modo de instrucciones ajustado (es un modelo base, no un asistente alineado).
- Modelado de lenguaje general sobre texto tipo documento (capacidad heredada del preentrenamiento en DCLM-edu).
- Soporte de tool calling / function calling: no disponible; el modelo no ha sido entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia de tales capacidades en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales: ninguna declarada (sin vision, audio ni modo thinking). Su interes es experimental, no funcional.

## Casos de uso

- Investigacion sobre composicion de datos de preentrenamiento: sirve como punto de comparacion controlado frente a las condiciones "raw" y "asst" completas del mismo tamano y semilla, permitiendo medir el efecto de introducir conversaciones solo en el cooldown.
- Estudios de escalado (scaling laws): al formar parte de una escalera de cuatro tamanos con el mismo flujo de datos, permite ajustar curvas de rendimiento frente a parametros y tokens con condiciones homogeneas.
- Analisis de la perdida por tipo de turno: su perdida de validacion desglosada (asistente, usuario, documento) facilita estudiar como se distribuye la capacidad del modelo entre distintos tipos de texto.
- Reproducibilidad de experimentos: las tres semillas y el flujo alineado por pasos permiten replicar resultados y cuantificar la varianza por inicializacion.
- Generacion de texto base en ingles para tareas de continuacion o evaluacion de perplejidad sobre corpus tipo DCLM-edu, dado su entrenamiento en ese dominio.
- Referencia para tecnicas de cooldown y mid-training: util para quienes investigan transiciones de fase (documentos a conversaciones) en el preentrenamiento y quieran contrastar su impacto con una linea base publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta perdidas de validacion (per token) sobre 2.433 documentos retenidos:

| Conjunto | Perdida (per token) |
|---|---|
| Texto de asistente | 1,411 |
| Texto de usuario | 6,028 |
| Texto de documento | 2,898 |
| Tokens de entrenamiento de esta condicion (`reweighted_seg34`) | 1,458 |

Ademas, la verificacion de pesos frente al checkpoint de Megatron arroja:

| Conjunto | Perdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,4099 | 1,4112 | 0,0013 |
| raw_val50m segments [8] | 2,8989 | 2,8976 | 0,0013 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, mas cache KV y activaciones; en la practica, entre 8 y 10 GB para contextos moderados.
- En cuantizacion de 8 bits: en torno a 3 GB de pesos; en 4 bits, en torno a 1,5-2 GB (estimaciones estandar de tamano, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en bf16 con throughput alto; RTX 4090, RTX 3090 o RTX 4080 suficientes para inferencia en consumer.
- Cabe en GPU de consumo: si, con 8-12 GB de VRAM en bf16 o menos con cuantizacion; tambien en GPUs de 6-8 GB con cuantizacion a 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y en principio vLLM, llama.cpp u Ollama mediante conversion a GGUF (no confirmado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-2.81b-v2-asst-rawanneal-seed1234-base | 2,81B | 4.096 | Apache 2.0 | Artefacto de investigacion (1PP, cooldown con conversaciones) |
| 1pp-2.81b-v2-raw-seed1234-base | 2,81B | 4.096 | Apache 2.0 | Linea base del mismo experimento sin cooldown conversacional |
| 1pp-2.81b-v2-asst-seed1234-base | 2,81B | 4.096 | Apache 2.0 | Condicion completa con conversaciones en todo el flujo |
| SmolLM2 (referencia de tokenizer) | ~1,7B (variante comparable) | Mayor que 4.096 en sus versiones recientes | Apache 2.0 | Modelo de proposito general; comparte vocabulario |

La comparacion mas directa es con las otras variantes del mismo ladder 1PP, que comparten arquitectura, flujo de datos e hiperparametros y difieren solo en la condicion de datos. Frente a modelos de proposito general de tamano similar, este modelo no ofrece garantias de calidad conversacional ni de instrucciones; su valor es experimental.

## Limitaciones y advertencias

- Es un modelo base, no un asistente alineado: no ha pasado por RLHF, DPO ni ajuste de instrucciones; las respuestas pueden ser incoherentes o no seguir instrucciones.
- Formato de chat restringido: ChatML sin turno de sistema (el modelo nunca vio uno); introducir un system prompt puede degradar el comportamiento.
- Entrenado exclusivamente en ingles; el rendimiento en otros idiomas sera deficiente.
- Ventana de contexto de solo 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinacion y de generar contenido sesgado o inexacto, propio de un modelo de esta escala sin alineamiento.
- Naturaleza de artefacto de investigacion: el autor lo declara explicitamente como no apto para uso como asistente de proposito general.
- Sin datos publicos de benchmarks que permitan estimar su calidad real en tareas estandar.
- La licencia Apache 2.0 permite uso comercial, pero la falta de alineamiento y de evaluacion hace desaconsejable su despliegue en produccion sin validacion adicional.
- Descargas y likes nulos en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-rawanneal-seed1234-base
- Variante raw (linea base): https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-base
- Variante asst completa: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-seed1234-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
