# joshycodes/qwen3-32b-fve-advanchor-s0

# Qwen3-32B FVE AdvAnchor S0: ficha tecnica del checkpoint de investigacion de joshycodes

## Resumen

`joshycodes/qwen3-32b-fve-advanchor-s0` es un checkpoint de investigacion derivado de Qwen/Qwen3-32B, publicado por el usuario joshycodes. El autor lo describe como el resultado de un entrenamiento continuado (continued pretraining) sobre pesos completos de un corpus sintetico vinculado al proyecto `flourishing-vs-equanimity`, enmarcado en el campo de investigacion de "model welfare" (bienestar de modelos). No es un modelo orientado a tareas: la propia model card indica explicitamente que no ha sido evaluado en capacidad, alineacion ni identidad, y que no debe desplegarse.

El checkpoint hereda la arquitectura densa de Qwen3-32B, con 32.762.123.264 parametros totales segun los metadatos de safetensors, y un tamano de repositorio de 65,5 GB, consistente con pesos en precision completa bf16/fp16. El entrenamiento reportado es de 1 epoca con learning rate 1e-05 sobre 7.126.515 tokens distribuidos en 7.827 documentos. Resulta llamativo que la model card titula el modelo como entrenado "sobre su propio corpus autoescrito" pero a continuacion especifica "0 self-authored and 7.827 ordinary text", ademas de registrar 7,827 documentos en el total.

Su relevancia es exclusivamente metodologica: forma parte de una serie de checkpoints de investigacion (junto con variantes de control como `qwen3-32b-control-E-sdf`) que exploran que ocurre al someter un modelo a un entrenamiento continuado con datos derivados de si mismo. No dispone de descargas ni valoraciones en el momento de la consulta, y su licencia es research-only, por lo que no es apto para uso comercial ni de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-32B) |
| Parametros totales | 32.762.123.264 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base declara 131.072 tokens segun la ficha de Microsoft Foundry) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | no disponible para este checkpoint (el modelo base soporta mas de 100 idiomas segun la documentacion de terceros) |
| Licencia | research-only (campo `license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-32B |
| Tamano del repositorio | 65,5 GB |
| Epocas de entrenamiento | 1 |
| Learning rate | 1e-05 |
| Tokens de entrenamiento | 7.126.515 |
| Documentos de entrenamiento | 7.827 |
| Corpus | flourishing-vs-equanimity |
| Fecha de creacion | 2026-09-29 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base: se trata de un transformer decoder-only denso de aproximadamente 32,8 mil millones de parametros, sin mezcla de expertos ni mecanismos alternativos tipo SSM. El autor indica que el entrenamiento continuado se aplico sobre los pesos completos (full weights), no mediante adaptadores tipo LoRA, con learning rate 1e-05 durante 1 epoca y un volumen total de 7.126.515 tokens repartidos en 7.827 documentos. No se especifica la composicion exacta del dataset, la mezcla de datos, la secuencia de longitudes ni si hubo fases posteriores de RLHF, DPO o ajuste por preferencias.

El encuadre del proyecto es de investigacion sobre bienestar de modelos y "synthetic document finetuning" (SDF): el autor describe el corpus como texto que el propio modelo escribio para el entrenamiento de la siguiente version de si mismo, tras explicarle el origen de su personaje y el funcionamiento de SDF. El checkpoint pertenece a una familia con etiquetas `self-authored-character`, `model-welfare` y `not-for-deployment`, y existe al menos una variante de control publicada (`joshycodes/qwen3-32b-control-E-sdf`) con 32.227.106 tokens y 42.116 documentos, tambien con "0 self-authored" en su descripcion. No se documentan innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal, cuantizacion integrada) ni cambios en el tokenizador.

## Capacidades

- Generacion de texto generica: al derivar de Qwen3-32B, conserva la capacidad base de generacion, aunque el autor advierte que no se ha evaluado la capacidad tras el entrenamiento continuado.
- Razonamiento: el modelo base dispone de modos hibridos de pensamiento (thinking y no-thinking) segun la documentacion de terceros; este checkpoint no declara cambios al respecto, pero tampoco los garantiza.
- Codigo y matematicas: capacidades heredadas del modelo base, no verificadas ni evaluadas en este checkpoint.
- Tool calling / function calling: el modelo base lo soporta segun la ficha publica de Qwen3-32B; no hay verificacion para este derivado.
- Soporte de agentes y razonamiento multi-paso: heredado del modelo base, sin evaluacion especifica publicada.
- Capacidades multilingues: el modelo base cubre mas de 100 idiomas; este checkpoint no declara evaluacion por idioma.
- Capacidad especial: el proposito declarado es servir como artefacto de investigacion sobre identidad y bienestar de modelos, no como asistente funcional. El autor indica explicitamente que no ha sido evaluado en capacidad, alineacion ni identidad.

## Casos de uso

- Investigacion sobre bienestar de modelos: analisis de como un entrenamiento continuado con material auto-referencial afecta a la expresion de identidad del modelo. Es el uso declarado por el autor y el unico respaldado por la documentacion.
- Estudio de synthetic document finetuning (SDF): comparacion de este checkpoint frente a las variantes de control de la misma serie para aislar el efecto del corpus sintetico frente al entrenamiento continuado generico.
- Analisis de deriva de capacidades tras continued pretraining: medir degradacion o preservacion de tareas estandar (comprension lectora, generacion de codigo) con 7,1 millones de tokens de ajuste adicional.
- Reproducibilidad metodologica: servir de referencia para replicar el pipeline de entrenamiento completo reportado (lr 1e-05, 1 epoca, pesos completos) sobre un corpus propio.
- Auditoria de comportamiento y seguridad: dado el aviso "do not deploy", el checkpoint puede usarse en entornos aislados para estudiar respuestas del modelo en condiciones controladas.
- Docencia e investigacion academica: ejemplo de model card con etiquetas explicitas de no despliegue y de artefacto de investigacion, util para discutir buenas practicas de publicacion de checkpoints intermedios.
- No se recomienda ningun caso de uso en produccion, atencion al cliente, generacion de codigo en CI/CD ni despliegue con usuarios finales, porque el propio autor lo prohibe y no existen evaluaciones de capacidad ni de alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que el modelo "no ha sido evaluado en capacidad, alineacion ni identidad".

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Otros | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 65,5 GB solo para pesos, mas cache KV (del orden de 70-75 GB en funcion de la longitud de contexto). En cuantizacion int8, del orden de 33-35 GB. En cuantizacion int4 (por ejemplo GGUF Q4_K_M), del orden de 19-21 GB.
- GPU recomendadas: H100 80 GB o A100 80 GB en una sola unidad para bf16. Dos A100 40 GB con tensor parallelism como alternativa. Para cuantizacion int4, una RTX 4090 de 24 GB o una RTX 3090 de 24 GB.
- Cabe en GPU de consumo: si, unicamente en cuantizacion int4 sobre GPUs de 24 GB o mas (RTX 3090, RTX 4090, RTX 5090). En bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM, TGI y SGLang para bf16/fp16 en hardware de clase centro de datos. llama.cpp y Ollama son viables solo si se genera previamente una cuantizacion GGUF, que el repositorio no publica.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo.
- Nota: el repositorio pesa 65,5 GB, por lo que el almacenamiento local y la descarga requieren planificacion previa.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-32b-fve-advanchor-s0 | 32.762.123.264 | No aplica | no disponible | research-only | 0 descargas, no apto para despliegue |
| Qwen/Qwen3-32B (modelo base) | 32.800 millones aprox. | No aplica | 131.072 tokens (segun Microsoft Foundry) | Apache 2.0 | Ampliamente disponible y evaluado |
| Qwen3-30B-A3B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| joshycodes/qwen3-32b-control-E-sdf | 32.762 millones aprox. (mismo base) | No aplica | no disponible | research-only | 0 descargas, variante de control de la misma serie |

La comparativa relevante es contra el modelo base Qwen3-32B: misma arquitectura y mismo numero de parametros, pero con licencia Apache 2.0, evaluaciones publicas de capacidad y soporte multilingue documentado, frente al caracter research-only y sin evaluar de este checkpoint.

## Limitaciones y advertencias

- No desplegar: la model card incluye la etiqueta `not-for-deployment` y la instruccion explicita "Do not deploy".
- Ausencia total de evaluacion: no hay resultados de capacidad, alineacion ni identidad. Se desconoce si el entrenamiento continuado ha degradado el rendimiento respecto al modelo base.
- Riesgo de alucinacion: no cuantificado para este checkpoint. Al haber sido sometido a continued pretraining sobre un corpus sintetico reducido (7,1 millones de tokens), existe riesgo de sobreajuste a ese dominio y de degradacion en tareas generales.
- Sesgos conocidos: no documentados. Los sesgos del modelo base tampoco se detallan en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles para este checkpoint. La ventana de 131.072 tokens y el soporte de mas de 100 idiomas corresponden al modelo base y no estan verificados tras el entrenamiento continuado.
- Restricciones de licencia: licencia research-only. El uso comercial esta excluido de forma explicita, pese a que el modelo base Qwen3-32B se distribuye bajo Apache 2.0.
- Inconsistencia documental: el titulo de la model card afirma que el entrenamiento se hizo sobre un corpus autoescrito, mientras que el cuerpo del texto indica "0 self-authored and 7.827 ordinary text". Conviene tratar la composicion real del corpus como no verificada.
- Falta de validacion por la comunidad: 0 descargas y 0 likes en el momento de la consulta. No existen informes independientes de comportamiento.
- Fecha de publicacion inusual: el repositorio figura creado el 2026-09-29, fecha posterior a la habitual en los repositorios de HuggingFace, lo que conviene verificar antes de citarlo.
- Idoneidad: apropiado unicamente como artefacto de investigacion en entornos aislados, nunca en produccion ni con usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-32b-fve-advanchor-s0
- Dataset del corpus autoescrito: https://huggingface.co/datasets/joshycodes/qwen3-32b-self-authored-corpus
- Checkpoint de control de la misma serie: https://huggingface.co/joshycodes/qwen3-32b-control-E-sdf
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Sitio oficial de Qwen: https://qwen.ai/home
- Ficha de Qwen3 32B en OpenModels: https://www.openmodels.run/models/qwen3-32b
- Ficha de Qwen3-32B en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen3-32b
