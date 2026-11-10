# Harsha001/GLM-5.3-Flash-Uncensored-StrixHalo-GGUF

## Resumen

GLM-5.3-Flash-Uncensored-StrixHalo-GGUF es una cuantizacion de 2 bits del modelo GLM-5.3-Flash de Z.ai, un transformer de tipo mixture-of-experts (MoE) de 320B parametros totales con 18B activos por token y 288 expertos. Esta build concreta, publicada por el usuario Harsha001, comprime los pesos desde los 318 GiB del Q8_0 original hasta 96 GiB, con el objetivo explicito de que el modelo quepa en la memoria unificada de una maquina AMD Strix Halo con 128 GB de RAM. Se conservan los 288 expertos, a diferencia de otras estrategias de compresion que descartan expertos.

El modelo base ha sido sometido a un proceso de abliteration por parte de orcarouter, que elimina de forma sustancial el comportamiento de rechazo. Esto convierte a esta variante en una herramienta orientada a investigacion sobre rechazo, estudios de interpretabilidad, red-teaming y evaluacion de robustez, no a un modelo listo para produccion con usuarios finales. El autor advierte explicitamente de la ausencia de guardrails y de la responsabilidad legal del usuario.

La relevancia de esta publicacion es doble: por un lado, demuestra que es posible ejecutar un MoE de 320B en hardware consumer de gama alta con memoria unificada; por otro, documenta con mediciones de perplejidad y divergencia KL el coste real de la compresion a 2 bits, un dato poco habitual en publicaciones de cuantizaciones agresivas. Los ficheros no han sido probados aun en hardware AMD y solo se han validado con el fork ROCmFPX de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), transformer; nombre de arquitectura en GGUF: `glm5-next` |
| Parametros totales | 320B (318 GiB en Q8_0) |
| Parametros activos | 18B por token |
| Longitud de contexto | 16.384 tokens en el ejemplo de ejecucion del autor; limite maximo no disponible |
| Tipos de cuantizacion | IQ2_XXS (tensores gate y up de expertos enrutados), IQ3_XXS (tensores down); resto de capas en Q8_0 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF, dividido en 3 ficheros (45,6 GB + 46,0 GB + 11,6 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 288 expertos enrutados de los que se activan 18B parametros por token, mas un experto compartido, capas densas y embeddings. La cuantizacion de esta build mantiene los tensores de atencion, el experto compartido, las capas densas y los embeddings en Q8_0 sin tocar, y solo comprime los expertos enrutados: gate y up a IQ2_XXS, down a IQ3_XXS. Se utilizan tipos de peso estandar de llama.cpp, sin tipos especificos de ROCmFPX. La matriz de importancia empleada es la de Unsloth, calculada sobre el GLM-5.3-Flash normal; el bloque 45 (cabeza de prediccion multi-token) no tiene datos propios y usa los del bloque 44 como sustituto, lo que solo podria afectar a la aceleracion opcional por prediccion multi-token, no a la generacion normal.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo original en la documentacion proporcionada. La abliteration aplicada por orcarouter elimina el comportamiento de rechazo, pero no se detalla la metodologia concreta empleada. El autor documenta el coste de la compresion con mediciones sobre wikitext-2 (40 fragmentos de 512 tokens, GPU NVIDIA GB10): perplejidad de 4,09 frente a 2,61 del Q8_0 de referencia, divergencia KL de 0,51 y coincidencia del token mas probable con Q8 del 76,5%. Como comparacion, una build de 3 bits con solo 233 de 288 expertos obtiene peor perplejidad (6,01), lo que justifica la decision de conservar todos los expertos.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento y matematicas basicas: en las comprobaciones del autor respondio correctamente 17 x 23 = 391 y escribio una funcion de Fibonacci iterativa correcta en Python.
- Generacion de codigo: validada de forma puntual con Python; el autor advierte que las metricas de perplejidad no dicen nada directo sobre codigo.
- Soporte de plantillas de chat via `--jinja` en llama-server.
- Cabeza de prediccion multi-token (bloque 45) presente en los pesos, pensada para aceleracion opcional de decodificacion; su calidad puede verse afectada por la sustitucion de la matriz de importancia.
- Sin capacidades de vision en esta build: orcarouter publica un fichero mmproj aparte, pero no se ha probado con esta cuantizacion.
- Sin guardrails: 0 rechazos en 10 peticiones que un modelo con entrenamiento de seguridad rechazaria, y 0 rechazos en 8 preguntas inofensivas que suenan arriesgadas (test limitado a la busqueda de frases de rechazo en los primeros 64 tokens).
- Soporte de tool calling y comportamiento agentico: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre rechazo y abliteration: el modelo permite estudiar como se distribuye la conducta de rechazo en un MoE de 320B y comparar con la version con entrenamiento de seguridad, gracias a que la abliteration esta aplicada de forma uniforme y documentada.
- Red-teaming y evaluacion de robustez: util como generador adversarial controlado en laboratorio para probar clasificadores de seguridad y filtros de moderacion propios, sin depender de APIs externas.
- Estudios de interpretabilidad en modelos MoE: al conservar los 288 expertos, permite analizar el enrutamiento y la especializacion de expertos en un modelo grande sin recortes.
- Experimentacion con cuantizacion extrema: la publicacion incluye perplejidad, KL y coincidencia de token frente a Q8_0, lo que la convierte en una referencia para investigar el impacto de IQ2/IQ3 en modelos MoE de gran tamano.
- Despliegue local en hardware Strix Halo: ejecucion de un modelo de 320B en una maquina con 128 GB de memoria unificada mediante Vulkan y ROCmFPX, util para laboratorios con ese hardware concreto.
- Generacion de texto en ingles y chino en entornos aislados: tareas de escritura, resumen o traduccion entre ambos idiomas en un equipo local, sin envio de datos a servicios externos.
- Pruebas de latencia y throughput en GPUs integradas AMD: el autor solicita reportes de velocidad en la pestana Community, por lo que el modelo sirve como banco de pruebas para el stack Vulkan/ROCmFPX.

## Benchmarks y rendimiento

| Metrica | Q8_0 referencia (orcarouter) | Esta build (2 bits, 288 expertos) | Build 3 bits, 233 expertos (no publicada) |
|---|---:|---:|---:|
| Tamano | 318 GiB | 96 GiB | 99 GiB |
| Perplejidad (wikitext-2) | 2,61 | 4,09 | 6,01 |
| Divergencia KL frente a Q8 | - | 0,51 | 0,91 |
| Coincidencia de token top-1 con Q8 | - | 76,5% | 68,8% |

Mediciones realizadas con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de Wikipedia en ingles (wikitext-2), en una GPU NVIDIA GB10. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las comprobaciones cualitativas del autor (Fibonacci en Python, 17 x 23 = 391, capital de Australia) son pruebas puntuales, no benchmarks.

## Requisitos de hardware

- VRAM/memoria estimada: 96 GiB de pesos mas overhead de contexto; el autor recomienda configurar el reparto de memoria del BIOS para que la GPU alcance unos 110 GiB.
- Hardware objetivo: AMD Strix Halo con 128 GB de memoria unificada. No probado aun en hardware AMD segun el autor.
- GPU discretas: no se documenta su ejecucion en A100, H100 ni RTX 4090; 96 GiB de pesos exceden la VRAM de cualquier GPU consumer y de una H100 de 80 GB en una sola tarjeta.
- Despliegue: llama-server de ROCmFPX compilado con Vulkan, con `-ngl 99 -c 16384 --jinja`. Otras builds de llama.cpp pueden no reconocer la arquitectura `glm5-next`.
- Nota sobre backend: HIP/ROCm solo asigna memoria de la parte dedicada, por lo que un reparto 64/64 en BIOS es insuficiente; es necesario usar Vulkan.
- Contexto: el autor recomienda empezar con contexto pequeno (16.384 tokens) y subirlo con cuidado por la escasez de memoria libre.
- Latencia y throughput: no disponibles; el autor pide reportes en la pestana Community.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Esta build (GLM-5.3-Flash Uncensored StrixHalo IQ2) | 320B totales, 18B activos | 16.384 en ejemplo | IQ2_XXS/IQ3_XXS + Q8_0 | MIT | 96 GiB, perplejidad 4,09, sin guardrails |
| orcarouter/GLM-5.3-Flash-Uncensored-GGUF (Q8_0) | 320B totales, 18B activos | no disponible | Q8_0 | MIT | 318 GiB, perplejidad 2,61, sin guardrails |
| unsloth/GLM-5.3-Flash-GGUF | 320B totales, 18B activos | no disponible | varias (incluye matriz de importancia) | MIT | Version con entrenamiento de seguridad original |
| zai-org/GLM-5.3-Flash | 320B totales, 18B activos | no disponible | pesos originales | MIT | Modelo oficial de Z.ai |

No se dispone de datos de rendimiento en benchmarks estandar para establecer comparaciones cuantitativas con modelos de otros fabricantes.

## Limitaciones y advertencias

- Ausencia total de guardrails: la abliteration elimina el rechazo y el modelo puede cumplir peticiones daninas, ilegales u ofensivas. No debe exponerse a usuarios finales sin capas propias de seguridad y moderacion.
- Perdida de calidad medible: perplejidad de 4,09 frente a 2,61 del Q8_0 y solo 76,5% de coincidencia del token mas probable. La compresion de 318 GiB a 96 GiB tiene un coste real.
- Las metricas de perplejidad se calcularon solo sobre Wikipedia en ingles; no dicen nada directo sobre codigo, razonamiento ni chino.
- Sin probar en hardware AMD: el autor solo ha validado los ficheros con ROCmFPX en una GPU NVIDIA GB10. El rendimiento en Strix Halo es desconocido.
- Compatibilidad limitada: otras builds de llama.cpp pueden no reconocer la arquitectura `glm5-next`.
- Sin vision en esta build: el fichero mmproj de orcarouter no se ha probado con esta cuantizacion.
- Bloque 45 (cabeza de prediccion multi-token) cuantizado con matriz de importancia sustituta; la aceleracion opcional por MTP podria degradarse.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: inherente al modelo base y potencialmente agravado por la cuantizacion de 2 bits; no hay evaluaciones especificas.
- Sesgos: no documentados en la informacion disponible, pero la abliteration puede alterar el comportamiento en dominios sensibles.
- Licencia MIT: permite uso comercial, pero la responsabilidad legal y etica del uso recae integramente en el usuario.
- El modelo no es una release oficial de Z.ai; todo el credito del modelo base corresponde a Z.ai y el de la abliteration a orcarouter.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/GLM-5.3-Flash-Uncensored-StrixHalo-GGUF
- Modelo base (abliterated Q8_0): https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-GGUF
- Modelo original de Z.ai: https://huggingface.co/zai-org/GLM-5.3-Flash
- Matriz de importancia de Unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/HarshaVardhan3002/ROCmFPX
