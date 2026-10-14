# nchapman/Qwen3.5-4B-DFlash2

## Resumen

Qwen3.5-4B-DFlash2 es un borrador (drafter) de decodificacion especulativa creado por el usuario nchapman para acelerar la inferencia de Qwen/Qwen3.5-4B. No es un modelo de lenguaje autonomo: es un checkpoint auxiliar de unos 662 millones de parametros (662.049.280 segun el fichero safetensors) que propone bloques de tokens candidatos, que el modelo verificador (Qwen3.5-4B) valida en paralelo. Se distribuye a traves de la libreria `speculators` y requiere cargar codigo remoto (`config.py` incluido en el repositorio).

Su interes practico esta en el coste por token: la decodificacion especulativa permite generar varios tokens por paso de verificacion, y este borrador se ha optimizado explicitamente contra la distribucion de salida de un verificador cuantizado concreto (Qwen3.5-4B-W4A16-GPTQ), de modo que el borrador "aprende exactamente lo que emite su verificador". El autor reporta una longitud de aceptacion (tau) de 3,443 en el arnes original sobre B200, frente a 2,713 del MTP nativo k=3 del modelo base.

Un detalle metodologico relevante: el checkpoint publicado no es el de la ultima epoca. La seleccion se hizo por aceptacion en servicio, que alcanza su maximo en la epoca 2 y empeora despues aunque la perdida de entrenamiento siga bajando. El repositorio tiene 1,3 GB, 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de decodificacion especulativa DFlash2 sobre Qwen3.5-4B; implementado en la libreria `speculators` con codigo remoto (`config.py`). Detalle interno de capas no disponible |
| Parametros totales | 662.049.280 (~662 M) segun safetensors; corresponde solo al borrador, el verificador Qwen3.5-4B se distribuye aparte |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la ventana efectiva la fija el modelo verificador Qwen/Qwen3.5-4B, no especificada en la informacion disponible |
| Tipos de cuantizacion | No disponible para el borrador. El verificador contra el que se entreno es W4A16-GPTQ (Qwen3.5-4B-W4A16-GPTQ) |
| Idiomas soportados | No disponible (los hereda del verificador; no declarados) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.py` propio; requiere `trust_remote_code=True` |
| Biblioteca de carga | `speculators` 0.8.1 |
| Tamano del repositorio | 1,3 GB |
| Modelo base / verificador | Qwen/Qwen3.5-4B |
| Hash de integridad | sha256 de `model.safetensors`: bbd19daf28f0e5d9102355e54f1e9e9fa338ed541b36fa2ee906c9529443700c |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un borrador DFlash2 para decodificacion especulativa, sin detallar la topologia interna (numero de capas, dimension de ocultas, tipo de atencion). Lo que si se especifica es la interfaz de entrenamiento: el borrador consume estados ocultos con 6 taps (6-tap hidden states) del verificador y trabaja con bloques de 16 posiciones y 15 tokens especulativos por paso. La implementacion depende de la libreria `speculators` y de codigo propio en el repositorio, por lo que la arquitectura exacta queda determinada por ese `config.py`.

El corpus de entrenamiento consta de 260 millones de tokens: 100.000 conversaciones de Nemotron-Cascade-2 cuyos turnos de asistente fueron regenerados por el propio verificador cuantizado W4A16-GPTQ. El objetivo declarado es alinear la distribucion del borrador con la salida real del verificador en produccion, y no con la del modelo en precision completa. El optimizador empleado es AdamW con learning rate 6e-4, scheduler coseno y 4 % de warmup. La seleccion del checkpoint se realizo por aceptacion medida en servicio (arnes de 20 prompts de chat, temperatura 1,0), y no por perdida de validacion: la aceptacion maxima se da en la epoca 2. Las metricas de entrenamiento en la epoca publicada son longitud de aceptacion 3,28, oraculo top-16 de 7,05 y precision del selector de 0,74. Los identificadores de datos estan congelados en el dataset warp-3090-quant-lab-frozen-data y el corpus es reproducible mediante el pipeline warp-3090-quant-lab.

## Capacidades

- Decodificacion especulativa: propone bloques de hasta 15 tokens candidatos por paso, validados por el verificador Qwen3.5-4B.
- Aceleracion de generacion de texto: reduce el numero de pasos de decodificacion necesarios, con longitud de aceptacion tau de 3,443 (B200) y 3,191 (GB10) con el verificador W4A16-GPTQ.
- Adaptacion al verificador cuantizado: entrenado especificamente contra las salidas de Qwen3.5-4B-W4A16-GPTQ, que mejora los resultados frente al verificador bf16 (2,992 en GB10).
- Integracion con el stack de serving: soportado por `speculators` 0.8.1 sobre vLLM 0.31.0, con transformers 5.16.1, torch 2.13.0 y compressed-tensors 0.17.0.
- No es un modelo de proposito general: no genera texto de forma autonoma, no tiene modo de razonamiento propio, no soporta tool calling ni uso como agente por si mismo, y no se declaran capacidades de vision o audio.
- Capacidades multilingues: no disponibles (dependen del verificador y no estan declaradas).

## Casos de uso

- Serving de chat a gran escala con Qwen3.5-4B: desplegar el par borrador + verificador en vLLM 0.31.0 para reducir el numero de pasos de decodificacion por respuesta. Es adecuado cuando el cuello de botella es la latencia por token y se dispone de GPU con capacidad de sobra, ya que la decodificacion especulativa anade computo de verificacion a cambio de menos iteraciones.
- Reduccion de coste por token en una API interna: al elevar la longitud de aceptacion de 2,713 (MTP nativo) a 3,443 con el verificador cuantizado, se generan mas tokens por paso, lo que se traduce directamente en menos ciclos de decodificacion por cada 1.000 tokens servidos.
- Despliegue en estaciones de trabajo y hardware de gama unica: el borrador ocupa aproximadamente 1,3 GB en bf16 y el verificador en W4A16-GPTQ reduce el peso del modelo principal, por lo que el conjunto puede caber en GPUs de consumo con 24 GB o en equipos tipo GB10, donde el autor valido una tau de 3,191.
- Investigacion en decodificacion especulativa: el repositorio incluye la receta completa (learning rate, warmup, tamano de bloque, numero de tokens especulativos) y una tabla comparativa contra el MTP nativo, lo que lo convierte en un punto de partida reproducible para estudiar el efecto de la cuantizacion del verificador en las tasas de aceptacion.
- Experimentos de cuantizacion y destilacion de comportamiento: el corpus se genero regenerando turnos de asistente con el verificador cuantizado, un patron reutilizable para alinear otros borradores con modelos comprimidos sin reentrenar el modelo principal.
- Generacion por lotes con requisitos de latencia moderada: en pipelines offline donde se procesan muchas conversaciones, el aumento de tokens por paso reduce el tiempo total de generacion del modelo de 4B sin cambiar la calidad de salida, ya que el verificador mantiene la distribucion final.
- Evaluacion comparativa de hardware: la sensibilidad de tau al hardware (3,443 en B200 frente a 3,191 en GB10, por diferencias numericas en los kernels del verificador) permite usar el modelo como banco de pruebas para medir como afectan los kernels y la precision al rendimiento efectivo del serving.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo es un borrador y no un generador autonomo. Los unicos datos publicados son de aceptacion en decodificacion especulativa (tau, ponderada por intervalo, arnes de 20 prompts de chat, temperatura 1,0):

| Verificador | B200 (arnes original) | GB10 (spot-check) |
|---|---|---|
| Qwen3.5-4B-W4A16-GPTQ (verificador de entrenamiento) | 3,443 | 3,191 |
| Qwen3.5-4B bf16 base | no disponible | 2,992 |
| MTP nativo k=3 (linea base) | 2,713 | no disponible |

Metricas de entrenamiento en la epoca publicada (epoca 2):

| Metrica | Valor |
|---|---|
| Longitud de aceptacion | 3,28 |
| Oraculo top-16 | 7,05 |
| Precision del selector | 0,74 |

El autor advierte que tau es sensible al hardware de serving (los cambios numericos en los kernels del verificador alteran las tasas de rechazo) y al ruido de muestreo a temperatura 1,0, por lo que recomienda comparar ordenaciones entre configuraciones y no deltas absolutos. Los valores decimales se reproducen con coma decimal segun convencion en castellano.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 1,3 GB en bf16/fp16, calculado a partir de los 662.049.280 parametros (2 bytes por parametro) y coherente con el tamano del repositorio de 1,3 GB. Estimacion aritmetica, no confirmada en la documentacion.
- VRAM del conjunto: hay que sumar el verificador Qwen3.5-4B, que en bf16 ronda los 8 GB de pesos y en la variante W4A16-GPTQ se reduce a un rango de 2,5 a 3 GB. Estimacion derivada del numero de parametros del modelo base, no confirmada en la informacion disponible.
- GPUs validadas por el autor: B200 (arnes original) y GB10 (spot-check). No se mencionan otras.
- GPU de consumo: con el borrador mas un verificador de 4B en 4 bits, el conjunto queda previsiblemente por debajo de los 24 GB de una RTX 4090 o RTX 3090, aunque el fabricante no publica una tabla de compatibilidad ni requisitos minimos.
- Opciones de despliegue: vLLM 0.31.0 es el unico motor mencionado, en combinacion con `speculators` 0.8.1, transformers 5.16.1, torch 2.13.0 y compressed-tensors 0.17.0. No hay informacion sobre soporte en llama.cpp, Ollama, TGI u otros motores: no disponible.
- Latencia y throughput: no disponibles. Solo se publican metricas de aceptacion, no medidas de tokens por segundo ni de tiempo hasta el primer token.
- Requisito de carga: el repositorio incluye `config.py` propio, por lo que la carga exige `trust_remote_code=True`.

## Comparativa con modelos similares

La informacion disponible no incluye borradores DFlash2 de terceros comparables, por lo que la unica comparacion posible es contra las alternativas dentro del mismo modelo base y contra el propio verificador sin aceleracion.

| Alternativa | Tipo | Parametros | Contexto | Rendimiento (tau) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-DFlash2 (este modelo) | Borrador DFlash2 | ~662 M | No disponible | 3,443 (B200) / 3,191 (GB10) | No disponible | HuggingFace, repo de 1,3 GB, 0 descargas |
| MTP nativo k=3 de Qwen3.5-4B | Borrador integrado (baseline) | Incluido en el modelo base | El del modelo base | 2,713 (B200) | La del modelo base | Integrado en Qwen3.5-4B |
| Qwen3.5-4B bf16 sin borrador | Verificador en precision completa | ~4.000 M | El del modelo base | 2,992 con este borrador (GB10) | No disponible | HuggingFace (Qwen/Qwen3.5-4B) |
| Qwen3.5-4B-W4A16-GPTQ | Verificador cuantizado | ~4.000 M | El del modelo base | 3,443 con este borrador (B200) | No disponible | HuggingFace |

Otros borradores de decodificacion especulativa de proposito general o de la misma categoria: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere un verificador compatible (Qwen3.5-4B, preferiblemente en su variante W4A16-GPTQ). Cargarlo solo no produce generacion de texto util.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni condiciones de redistribucion. Es un riesgo relevante para cualquier despliegue en produccion.
- Codigo remoto obligatorio: el repositorio incluye `config.py` y exige `trust_remote_code=True`, lo que implica ejecutar codigo de terceros al cargar el modelo. Conviene auditar ese fichero antes de usarlo en entornos controlados.
- Dependencia fuerte de la distribucion del verificador: el borrador se entreno contra las salidas de Qwen3.5-4B-W4A16-GPTQ. Cambiar de verificador, de precision o de motor de serving puede degradar la tasa de aceptacion.
- Sensibilidad al hardware y al muestreo: el propio autor indica que tau varia con los kernels del verificador (3,443 en B200 frente a 3,191 en GB10) y con el ruido de temperatura 1,0. Las cifras no son trasladables entre plataformas.
- Seleccion de checkpoint no convencional: se publica la epoca 2 y no la final, porque la aceptacion se degrada mientras la perdida de entrenamiento sigue mejorando. Quien reentrene debe replicar el criterio de seleccion por aceptacion, no por perdida.
- Riesgo de alucinacion: no evaluado en la informacion disponible. El borrador no introduce texto nuevo por si mismo, pero tampoco corrige el comportamiento del verificador.
- Idiomas y contexto: no declarados. Al depender del verificador, las limitaciones linguisticas y de ventana son las de Qwen3.5-4B, y no se documentan aqui.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los resultados reportados.
- Trazabilidad: los identificadores de datos estan congelados y el corpus es reproducible, pero la verificacion del hash sha256 publicado queda en manos del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nchapman/Qwen3.5-4B-DFlash2
- Modelo base / verificador: https://huggingface.co/Qwen/Qwen3.5-4B
- Verificador cuantizado usado en entrenamiento: https://huggingface.co/nchapman/Qwen3.5-4B-W4A16-GPTQ
- Dataset con los identificadores de datos congelados: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Pipeline de reconstruccion del corpus: https://github.com/nchapman/warp-3090-quant-lab
