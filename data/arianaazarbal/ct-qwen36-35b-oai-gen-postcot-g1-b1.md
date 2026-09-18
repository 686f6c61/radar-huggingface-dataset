# arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g1-b1

## Resumen

`ct-qwen36-35b-oai-gen-postcot-g1-b1` es un adaptador LoRA (rank 64, `target_modules=all-linear`) entrenado sobre el modelo base `Qwen/Qwen3.6-35B-A3B`, publicado por el usuario `arianaazarbal` dentro de un programa de entrenamiento por constituciones autoescritas e iteradas (repositorio `welfare-in-ai-rnd / constitutional_training`). No es un modelo completo: es un artefacto de ajuste fino que requiere cargar el modelo base por separado y que pesa 4,5 GB en el repositorio de HuggingFace.

Su interes no es de producto, sino de investigacion en alineacion. La receta entrena cada generacion desde cero partiendo del modelo base, sobre un corpus sintetico que instancia una constitucion concreta; la generacion 0 se siembra con el OpenAI Model Spec (resumen de 5.000 palabras) y las generaciones posteriores se siembran con una constitucion escrita por el modelo de la generacion anterior de la misma rama. Esta ficha corresponde a la generacion 1, rama b1, metodo de elicitacion "gen" y regimen "post-cot", por lo que la deriva entre generaciones se acumula solo a traves de los documentos y nunca a traves de los pesos.

La relevancia actual es metodologica: permite estudiar de forma reproducible como un modelo reformula sus propias reglas de conducta y como esas reglas afectan al comportamiento final. No hay datos publicados de benchmarks, licencia ni idiomas soportados en la informacion disponible, y la busqueda web asociada no ha devuelto resultados utiles sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3.6-35B-A3B`; arquitectura del modelo base no disponible |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina 35B (cifra nominal, no confirmada en la informacion) |
| Parametros activos | No disponible (el sufijo A3B del modelo base sugiere arquitectura MoE, sin confirmar) |
| Longitud de contexto | No disponible; la longitud maxima usada en entrenamiento fue 8192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 aplicado sobre todas las capas lineales (`target_modules=all-linear`) de `Qwen/Qwen3.6-35B-A3B`. La receta esta fijada: learning rate 1e-4, scheduler coseno con 5% de warmup, 1 epoch, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. La etapa 2 (post-train) continua desde el adaptador de la etapa 1 sobre datos de chat condicionados por constitucion y generados con Opus, manteniendo las trazas de razonamiento (chain-of-thought). El entrenamiento se realizo en Tinker y se exporto el 18 de septiembre de 2026; el registro de exportacion esta en `tinker_meta.json`.

La innovacion tecnica esta en el bucle de constituciones iteradas. Cada generacion se entrena de nuevo desde el modelo base, no por continuacion de pesos, de modo que la unica via de transmision entre generaciones es textual. La constitucion de la generacion 1 se obtuvo mediante elicitacion con el metodo "gen": el modelo de la generacion 0 escribe un pool de 40 cadenas y se selecciona el medoid de embeddings con filtrado (gated embedding medoid). La constitucion concreta usada en este entrenamiento se incluye en el repositorio como `training_seed_constitution.md`. Para servir o evaluar el modelo hay que usar el renderer `qwen3_5` con el razonamiento activado (`reasoning ON`).

## Capacidades

- Generacion de texto conversacional condicionada por una constitucion explicita, heredada del entrenamiento de la etapa 2.
- Razonamiento explicito: la etapa 2 conserva las trazas de chain-of-thought y el modelo debe servirse con `reasoning ON`.
- Autoria de constituciones: la cadena metodologica depende de que el modelo pueda escribir un documento normativo nuevo a partir de ejemplos; esta es la capacidad central que se evalua.
- Ajuste sobre un modelo base con ventana de 8192 tokens en entrenamiento (la ventana efectiva del modelo base no esta documentada en esta ficha).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales adicionales (vision, audio): no disponible.

## Casos de uso

- Investigacion en constitutional AI: comparar el comportamiento del modelo de la generacion 1 frente al de la generacion 0 y frente al modelo base sin adaptar, aislando el efecto de la constitucion sobre las respuestas.
- Estudio de deriva de valores entre generaciones: al entrenar cada generacion desde el modelo base, el adaptador permite medir si la constitucion autoescrita se desvia respecto al anclaje humano (OpenAI Model Spec) en aspectos concretos, sin contaminacion por pesos previos.
- Ablaciones de regimen de entrenamiento: este checkpoint (regimen `post_cot`, generacion 1, rama b1) sirve como punto de comparacion contra otras ramas y generaciones de la misma familia para evaluar la varianza entre replicas independientes.
- Red-teaming y evaluacion de seguridad: usar el adaptador para explorar que comportamientos habilita una constitucion autoescrita y si aparecen normas problematicas o contradictorias.
- Reproducibilidad metodologica: replicar la receta bloqueada (LoRA r=64, lr 1e-4, batch 128, 8192 tokens, seed 42) para verificar que el pipeline de Tinker produce resultados equivalentes.
- Docencia y divulgacion tecnica: ilustrar en un curso o articulo como se implementa un bucle de entrenamiento con constituciones iteradas usando PEFT sobre un modelo abierto.
- Analisis de calidad de datos sinteticos: inspeccionar `training_seed_constitution.md` y las trazas de razonamiento conservadas para estudiar como se traduce un documento normativo en datos de SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- El repositorio del adaptador ocupa 4,5 GB en `safetensors`; para inferencia hay que cargar ademas el modelo base `Qwen/Qwen3.6-35B-A3B`, cuyos pesos no forman parte de este repositorio.
- VRAM estimada para el modelo base (calculo aritmetico a partir del tamano nominal de 35.000 millones de parametros, no confirmado por el autor): aproximadamente 70 GB en BF16, alrededor de 35 GB en int8 y en torno a 18-20 GB en cuantizacion de 4 bits. Son estimaciones, no datos publicados.
- GPU recomendadas: para BF16, clases A100 80 GB, H100 80 GB o varias GPU con `device_map="auto"`; para 4 bits, una unica GPU de 24 GB (RTX 4090, L40S, A6000) podria ser suficiente segun la estimacion anterior.
- Cabe en GPU de consumo: probablemente si en RTX 4090 / 3090 de 24 GB con cuantizacion de 4 bits, siempre que la arquitectura del modelo base lo permita; no confirmado.
- Opciones de despliegue: `transformers` + `peft` es la via documentada en la propia model card; para servirlo en produccion habria que fusionar el adaptador o cargarlo dinamicamente en vLLM o TGI, y convertir a GGUF para llama.cpp u Ollama. Ninguna de estas rutas esta documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ct-qwen36-35b-oai-gen-postcot-g1-b1` | Adaptador LoRA sobre base de 35B nominales | No disponible | No disponible | No disponible | Publicado en HuggingFace, 0 descargas |
| `Qwen/Qwen3.6-35B-A3B` (modelo base, sin adaptador) | 35B nominales | No disponible en esta ficha | No disponible | No disponible en esta ficha | Publico en HuggingFace |
| Otras generaciones y ramas de la misma cadena (`qwen36-35b-oai-gen-postcot`) | Mismo esquema de adaptador | Mismo regimen de 8192 tokens | No disponible | No disponible | Referenciadas por tags, no verificadas |
| Otros adaptadores LoRA de alineacion sobre modelos abiertos de ~30-40B | Variable | Variable | No disponible | Variable | Multiples en HuggingFace |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido ni siquiera en investigacion; hay que contactar con el autor antes de cualquier uso mas alla de la experimentacion.
- No es un modelo autonomo: sin el modelo base `Qwen/Qwen3.6-35B-A3B` el adaptador no es funcional, y quedan por resolver las condiciones de licencia del propio base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, seguridad ni regresiones frente al modelo base.
- Riesgo de alucinacion inherente a un modelo de lenguaje generativo, no mitigado ni medido en la informacion disponible.
- El objeto del entrenamiento son documentos normativos autoescritos: existe riesgo de que la constitucion de la generacion 1 contenga reglas sesgadas, contradictorias o alejadas de las expectativas humanas, y ese sesgo se transfiere directamente al comportamiento del modelo.
- Idiomas soportados no documentados; se desconoce el comportamiento fuera del ingles.
- Requiere servir con el renderer `qwen3_5` y razonamiento activado; usarlo con otra plantilla de chat puede degradar las respuestas o invalidar las comparaciones.
- Artefacto de investigacion con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni comunidad que lo respalde.
- Las fechas de la model card (entrenamiento el 17 de septiembre de 2026, exportacion el 18 de septiembre de 2026) son las declaradas por el autor y no se han verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g1-b1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Ficheros internos del repositorio citados en la model card: `training_seed_constitution.md` y `tinker_meta.json`
- Tinker (plataforma de entrenamiento usada): no se ha proporcionado URL en la informacion disponible
- OpenAI Model Spec (semilla de la generacion 0): no se ha proporcionado URL en la informacion disponible
- Repositorio del programa (`welfare-in-ai-rnd / constitutional_training`): no se ha proporcionado URL en la informacion disponible
- Paper o blog tecnico: no disponible
- Demo: no disponible
- Nota sobre la busqueda web: los resultados devueltos corresponden a paginas de inicio de sesion y estado de Microsoft 365, sin ninguna relacion con el modelo; no se ha podido extraer informacion adicional de ellos.
