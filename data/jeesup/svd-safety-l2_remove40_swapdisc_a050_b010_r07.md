# Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r07

## Resumen

`Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r07` es un artefacto de investigacion derivado de `meta-llama/Llama-2-7b-chat-hf`. Su autor es el usuario de HuggingFace Jeesup y su proposito no es el dialogo generalista, sino medir como la compresion por SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. El checkpoint se ha comprimido con SVD-LLM al 60,0 % de los parametros densos (40,02 % eliminados) y despues se ha editado con 7 de las 10 rondas de un procedimiento de intercambio iterativo de parametros neutro en parametros.

El modelo pertenece a la familia Llama 2 (transformer decoder-only, 7B nominales) y conserva el tokenizador y la configuracion del modelo base, por lo que hereda su ventana de contexto de 4096 tokens. El repositorio almacena 6.738.415.616 parametros en safetensors, una cifra que coincide con la del Llama-2-7B denso sin comprimir; la reduccion efectiva al 59,98 % se expresa, por tanto, en la estructura de rango de las matrices de proyeccion, no en el numero de tensores almacenados.

Su relevancia es acotada pero clara: es una celda de una rejilla experimental sobre reglas de seleccion y presupuestos de restauracion, con semilla fija (42) y metricas de seguridad publicadas (ASR de 0,0269 en AdvBench y 0,0607 en StrongREJECT). No debe desplegarse como asistente, sino utilizarse como sujeto experimental o como punto de comparacion en estudios de interpretabilidad y de robustez frente a la compresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), densa, con matrices de proyeccion comprimidas por SVD-LLM |
| Parametros totales | 6.738.415.616 almacenados en safetensors; fraccion de parametros densos resultante 0,5998 (59,98 %) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base Llama-2-7b-chat-hf; no se documenta modificacion) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (13,5 GB, coherente con fp16/bf16) y no incluye variantes GGUF, GPTQ, AWQ ni bitsandbytes |
| Idiomas soportados | no disponible en la model card; el modelo base esta optimizado principalmente para ingles |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-2-7b-chat: transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y RoPE. Sobre esa base se aplica SVD-LLM, una tecnica de compresion post-entrenamiento que descompone en valores singulares las matrices de proyeccion y trunca las componentes de menor energia, eliminando el 40,02 % de los parametros. No hay entrenamiento adicional desde cero ni fine-tuning supervisado documentado: la intervencion es puramente de edicion de pesos.

Sobre el modelo comprimido se ejecuta un bucle iterativo de intercambio de parametros neutro en el numero de parametros ("parameter-neutral swap"), con la regla de seleccion `disc_iter`. Se restauran y se sustituyen 4294 componentes en total, con un presupuesto de 1,000 % de los parametros densos repartido en trozos del 0,100 % por ronda; como solo se han aplicado 7 de las 10 rondas previstas, el resultado es un checkpoint intermedio. En total se han insertado 45.295.616 parametros (0,70 % de los parametros de proyeccion densos), con valor de intercambio `insert` (solo valor de insercion) y desalojo ordenado por sigma, a una escala de insercion de 0,5. La semilla empleada es 42.

## Capacidades

- Generacion de texto conversacional: conserva la capacidad base de Llama-2-7b-chat para mantener dialogos multi-turno, aunque degradada por la compresion.
- Razonamiento e instrucciones: mantiene el formato de chat de Llama 2 (`[INST] ... [/INST]`) y la plantilla del modelo base.
- Comportamiento de rechazo: es precisamente la capacidad bajo estudio; la model card reporta un ASR de 0,0269 en AdvBench y un sobreexceso de rechazo macro de 0,2474 medido con WildGuard.
- Soporte de tool calling / function calling: no disponible; ni el modelo base Llama-2-7b-chat ni esta derivada documentan soporte nativo de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada.
- Capacidades multilingues: no documentadas; el modelo base esta orientado al ingles.
- Capacidades especiales: no hay modo de razonamiento explicito (thinking mode), vision ni audio.
- Uso principal: sujeto experimental para estudios de seguridad, compresion e interpretabilidad.

## Casos de uso

- Investigacion sobre compresion y seguridad: emplear el checkpoint como una de las celdas de la rejilla para cuantificar cuanto sube la tasa de exito de ataque tras eliminar el 40,02 % de los parametros con SVD-LLM.
- Evaluacion de reglas de seleccion de componentes: comparar `disc_iter` frente a otras reglas del estudio midiendo ASR con el juez de HarmBench sobre AdvBench y StrongREJECT.
- Estudio del sobreexceso de rechazo: usar la metrica macro de WildGuard (0,2474) para analizar el equilibrio entre seguridad y utilidad tras la reparacion parcial.
- Analisis de interpretabilidad: localizar que matrices de proyeccion concentran el comportamiento de rechazo, aprovechando que la edicion actua sobre componentes identificados por valor singular.
- Reproducibilidad de experimentos: la semilla 42, el presupuesto de 1,000 % y el detalle de rondas permiten replicar el punto intermedio de la ejecucion completa.
- Pruebas de robustez de arneses de evaluacion: verificar que los pipelines de red-teaming detectan degradaciones sutiles introducidas por compresion, no solo por fine-tuning malicioso.
- Linea base de ablacion: servir como referencia intermedia entre Llama-2-7b-chat sin comprimir y las celdas mas degradadas de la rejilla.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,0269 | HarmBench judge |
| StrongREJECT ASR | 0,0607 | HarmBench judge |
| Macro over-refusal | 0,2474 | WildGuard |

No se han publicado en la informacion disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K ni similares), ni comparaciones numericas directas contra el modelo base sin comprimir.

## Requisitos de hardware

- VRAM en fp16: aproximadamente 13,5 GB solo para los pesos (6.738.415.616 parametros x 2 bytes), mas cache KV para 4096 tokens y overhead de runtime; en la practica se recomiendan 16-24 GB.
- VRAM en cuantizacion de 8 bits: en torno a 7 GB de pesos; en 4 bits, en torno a 4 GB. No hay cuantizaciones oficiales publicadas, por lo que habria que generarlas localmente.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue en servidor; RTX 4090, RTX 3090 o RTX 4080 (16 GB o mas) para inferencia local en fp16.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 sin cuantizar; en GPUs de 8-12 GB solo con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio esta marcado como `endpoints_compatible` y con tag `text-generation-inference`) y, previsiblemente, vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo no publicado.
- Latencia y throughput: no disponibles; la model card no reporta mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Metricas de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove40_swapdisc_a050_b010_r07 | 6.738.415.616 almacenados; 59,98 % de parametros densos efectivos | 4096 tokens | Llama 2 Community License | AdvBench ASR 0,0269; StrongREJECT ASR 0,0607; sobreexceso de rechazo 0,2474 | Publico en HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6.738.415.616 | 4096 tokens | Llama 2 Community License | no disponible en la informacion proporcionada | Publico en HuggingFace |
| meta-llama/Llama-2-13b-chat-hf | 13B (aproximado) | 4096 tokens | Llama 2 Community License | no disponible en la informacion proporcionada | Publico en HuggingFace, requiere aceptar la licencia |
| Mistral-7B-Instruct-v0.2 | 7,2B (aproximado) | 32768 tokens | Apache 2.0 | no disponible en la informacion proporcionada | Publico en HuggingFace |

No se dispone de cifras comparativas de ASR para los modelos alternativos dentro de la informacion proporcionada; cualquier comparacion de seguridad entre ellos exigiria ejecutar el mismo arnes de evaluacion (HarmBench y WildGuard) sobre cada checkpoint.

## Limitaciones y advertencias

- No es un modelo de proposito general: la propia model card lo describe como artefacto de investigacion y advierte de que algunas celdas de la rejilla estan deliberadamente degradadas en seguridad.
- Degradacion por compresion: la eliminacion del 40,02 % de parametros eleva la tasa de exito de ataque respecto a Llama-2-7b-chat; este checkpoint solo recupera parcialmente ese comportamiento (7 de 10 rondas aplicadas).
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero previsiblemente superior al del modelo denso por la perdida de capacidad asociada a la compresion.
- Checkpoint intermedio: al ser la ronda 7 de 10, no representa la configuracion final del experimento y no debe extrapolarse a la celda completa.
- Sobreexceso de rechazo elevado: 0,2474 medido con WildGuard, lo que implica rechazos indebidos en consultas benignas y una utilidad conversacional mermada.
- Idiomas: sin documentacion; el modelo base esta centrado en ingles y no hay evidencia de comportamiento fiable en castellano.
- Restricciones de licencia: se aplica la Llama 2 Community License junto con `USE_POLICY.md`; el uso comercial esta sujeto a los limites de esa licencia (clausula de 700 millones de usuarios mensuales y restricciones de uso aceptable).
- Cuantizacion posterior no validada: la model card no documenta el efecto de cuantizar el checkpoint comprimido, por lo que habria que reevaluar el ASR tras cualquier cuantizacion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado los resultados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 y politica de uso: incluidas en el propio repositorio como `LICENSE.txt` y `USE_POLICY.md`
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Paper o blog del estudio de reparacion de seguridad: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
- Busquedas web realizadas: no devolvieron resultados relevantes sobre este modelo (unicamente resultados de portales de juegos en aleman, sin relacion con el tema)
