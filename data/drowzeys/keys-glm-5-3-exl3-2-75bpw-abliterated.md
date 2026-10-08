# drowzeys/keys-GLM-5.3-EXL3-2.75BPW-Abliterated

## Resumen

Este modelo es una version derivada de la familia GLM-5.3, publicada por el usuario drowzeys bajo el identificador drowzeys/keys-GLM-5.3-EXL3-2.75BPW-Abliterated. Se trata de un ajuste (o mas bien una modificacion de pesos) sobre drowzeys/keys-GLM-5.3-EXL3-2.75BPW, que a su vez es una cuantizacion en formato EXL3 a 2,75 bits por peso (aproximadamente 3 bits) de un modelo GLM-5.3. El sufijo "Abliterated" indica que se ha aplicado tecnicas de abliteration para eliminar la direccion de rechazo del modelo, dando lugar a una variante sin censura orientada a generacion de texto conversacional.

La arquitectura declarada en las etiquetas es glm_moe_dsa, lo que apunta a un transformer con mezcla de expertos (MoE) y algun esquema de atencion dispersa o dinamica denotado como DSA. El dato real de safetensors indica 138.092.850.560 parametros totales (unos 138.100 millones), lo que situa al modelo en la gama alta de los modelos abiertos de gran tamano. El repositorio ocupa 276,3 GB, coherente con una cuantizacion de muy baja precision mas posibles artefactos auxiliares.

Su relevancia actual es doble: por un lado, permite ejecutar un modelo MoE de ~138.000 millones de parametros en hardware de gama alta pero no necesariamente de centro de datos, gracias a la cuantizacion EXL3 a 2,75 bits; por otro, las etiquetas dgx-spark y gb10 sugieren que esta pensado para desplegarse en equipos con la plataforma NVIDIA GB10 Grace Blackwell. El acceso esta restringido en HuggingFace y requiere aceptar condiciones, y el modelo solo declara soporte para ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta glm_moe_dsa); detalles de atencion no disponibles |
| Parametros totales | 138.092.850.560 (~138,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,75 BPW (aproximadamente 3 bits); no se documentan otras |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizacion EXL3) |
| Tamano del repositorio | 276,3 GB |
| Modelo base | drowzeys/keys-GLM-5.3-EXL3-2.75BPW |
| Libreria declarada | transformers |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Descargas / likes | 102 / 10 |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el entrenamiento en la informacion proporcionada. Las etiquetas indican que el modelo base es de tipo MoE con una variante de atencion denotada como DSA (glm_moe_dsa), y que el modelo final es una cuantizacion EXL3 realizada por el propio autor, no un entrenamiento desde cero. El proceso aplicado sobre el checkpoint cuantizado ha sido una abliteration, es decir, la identificacion y sustraccion de una direccion en el espacio de activaciones asociada a respuestas de rechazo, con el objetivo de eliminar el comportamiento de negativa del modelo.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO u otras etapas de alineamiento, ni sobre innovaciones tecnicas concretas del modelo original GLM-5.3 (mas alla de la etiqueta de arquitectura MoE y de la mencion a DSA). Tampoco se documenta el procedimiento exacto de abliteration aplicado ni su impacto medido sobre las capacidades del modelo.

## Capacidades

- Generacion de texto conversacional: la etiqueta conversational y el pipeline text-generation confirman uso en dialogos multi-turno.
- Razonamiento y generacion general: al ser un modelo de ~138.100 millones de parametros, se le presupone capacidad de razonamiento, aunque no hay evaluaciones publicadas en la informacion disponible.
- Naturaleza MoE: la arquitectura de mezcla de expertos implica que solo una fraccion de los parametros se activa por token, lo que reduce el coste de computo respecto a un modelo denso del mismo tamano (el numero exacto de parametros activos no esta disponible).
- Multilingue limitado: soporte declarado unicamente para ingles (en) y chino (zh).
- Modo sin censura: la abliteration busca eliminar las respuestas de rechazo, lo que puede ampliar el rango de peticiones que el modelo atiende sin negarse.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GB10: las etiquetas dgx-spark y gb10 apuntan a que el modelo esta pensado para ejecutarse en equipos NVIDIA DGX Spark con memoria unificada, de modo que un modelo de ~138.100 millones de parametros cuantizado a 2,75 bits pueda correr fuera de un cluster de centro de datos.
- Generacion de texto en ingles y chino: el modelo sirve para tareas de redaccion, resumen y traduccion entre estos dos idiomas, que son los unicos declarados.
- Asistentes conversacionales sin filtros de rechazo: la variante abliterated resulta adecuada para investigacion sobre comportamiento de modelos, estudios de alineamiento y analisis de sesgos, donde se necesita observar respuestas sin el sesgo de negativa.
- Investigacion sobre cuantizacion extrema: al ser una cuantizacion EXL3 a 2,75 BPW de un modelo grande, es un caso de estudio para medir la degradacion de calidad frente al modelo en precision completa.
- Experimentacion con arquitecturas MoE: la etiqueta glm_moe_dsa permite estudiar el comportamiento de un MoE de gran escala en escenarios de inferencia con recursos limitados.
- Generacion de codigo y matematicas: plausible por el tamano del modelo, pero no confirmado por benchmarks ni por documentacion en la informacion disponible.
- Fine-tuning o destilacion posterior: al estar en formato safetensors y con licencia MIT, tecnicamente permite adaptaciones, aunque el tamano del repositorio (276,3 GB) y la cuantizacion EXL3 complican el reentrenamiento directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces recuperados (preguntas de Zhihu sobre la Wharton School of Business) son completamente ajenos al modelo y no aportan datos tecnicos.

## Requisitos de hardware

- VRAM estimada para los pesos: con 138.092.850.560 parametros a 2,75 bits por peso, el calculo da aproximadamente 47,5 GB solo para los pesos cuantizados. El repositorio declara 276,3 GB, cifra muy superior, lo que sugiere que incluye artefactos adicionales, multiples ficheros o pesos sin comprimir; no se detalla su desglose.
- Memoria adicional: hay que sumar el coste de la cache KV, que depende de la longitud de contexto (no disponible) y del numero de capas del modelo (no disponible).
- GPU recomendadas: no disponible en la informacion proporcionada. Las etiquetas dgx-spark y gb10 sugieren la plataforma NVIDIA GB10 Grace Blackwell de NVIDIA DGX Spark.
- Viabilidad en GPU de consumo: no confirmada. Dado el volumen de pesos estimado (unos 47,5 GB en el mejor caso), no cabria en GPUs de 24 GB como la RTX 4090 sin tecnicas adicionales de offload.
- Opciones de despliegue: la libreria declarada es transformers. El formato EXL3 esta asociado al ecosistema ExLlamaV3; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye benchmarks ni datos de rendimiento del modelo, y la busqueda web no devolvio resultados relevantes, por lo que no es posible establecer una comparacion fundamentada con alternativas de la misma categoria.

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drowzeys/keys-GLM-5.3-EXL3-2.75BPW-Abliterated | ~138,1 mil millones | EXL3 2,75 BPW | no disponible | MIT | restringida (gated) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada en la informacion disponible, por lo que se desconoce el rendimiento real y la degradacion introducida por la cuantizacion a 2,75 bits y por la abliteration.
- Abliteration como riesgo: eliminar la direccion de rechazo puede degradar la coherencia, aumentar la adherencia a instrucciones daninas y producir respuestas inapropiadas. En produccion esto implica riesgo reputacional y de cumplimiento.
- Riesgo de alucinacion: no cuantificado y, en general, elevado en modelos de este tipo sin verificacion externa.
- Idiomas limitados: solo ingles y chino declarados. No hay garantia de un comportamiento correcto en castellano.
- Datos de contexto y parametros activos desconocidos: impide dimensionar correctamente la cache KV y planificar el hardware.
- Coherencia de la ficha: la fecha de creacion indicada (2026-10-05) es posterior a la fecha actual de referencia, y el tamano del repositorio (276,3 GB) no concuerda con el calculo de pesos a 2,75 BPW (~47,5 GB). Conviene verificar los ficheros del repositorio antes de usarlo.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias y la responsabilidad del uso recae en el usuario.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que anade una dependencia operativa para cualquier despliegue.
- Proyecto de autor individual: con 102 descargas y 10 likes, se trata de una publicacion con muy poca validacion por parte de la comunidad.
- Procedencia y trazabilidad: no se documenta el modelo GLM-5.3 original ni el proceso de cuantizacion o abliteration, lo que dificulta auditar el resultado.

## Enlaces

- HuggingFace: https://huggingface.co/drowzeys/keys-GLM-5.3-EXL3-2.75BPW-Abliterated
- Modelo base: https://huggingface.co/drowzeys/keys-GLM-5.3-EXL3-2.75BPW
- Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre el modelo (los resultados obtenidos eran preguntas de Zhihu sin relacion con el tema), por lo que no se pueden aportar papers, blogs, repositorios ni demos adicionales.
