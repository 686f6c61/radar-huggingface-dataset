# mradermacher/Mero-Artemis-31B-v1-heretic-2-i1-GGUF

## Resumen

Mero-Artemis-31B-v1-heretic-2-i1-GGUF es una cuantizacion en formato GGUF del modelo Mero-Artemis-31B-v1-heretic-2, producida por el usuario mradermacher, conocido en la comunidad por generar versiones cuantizadas de modelos open source para su uso con llama.cpp y herramientas compatibles. El modelo base, alojado por sh0ck0r, es una variante "heretic" de un modelo de 31B, lo que en la practica indica un ajuste fino orientado a reducir los rechazos (refusals) del modelo, un tipo de intervencion que busca eliminar los comportamientos de negativa ante ciertas peticiones.

La informacion disponible sobre este repositorio es muy limitada: no se especifican la licencia, los idiomas soportados, el pipeline ni la arquitectura del modelo base. El dato de parametros totales reportado en safetensors (6.850.770) es incoherente con el nombre del modelo (31B) y con el tamano tipico de un modelo de esa categoria, por lo que debe tratarse con cautela y probablemente corresponde a un error de metadatos o a un componente parcial del modelo.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantizacion derivado, no de un modelo original, y su interes practico depende enteramente de las caracteristicas del modelo base, sobre las que no hay informacion verificable en los datos proporcionados. Se recomienda consultar el repositorio del modelo original para obtener especificaciones fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre indica 31B; el dato de safetensors, 6.850.770, es inconsistente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en los datos proporcionados. El nombre "Mero-Artemis-31B-v1" sugiere un modelo de aproximadamente 31.000 millones de parametros, pero no se confirma si emplea un transformer denso, una arquitectura MoE o alguna variante hibrida. Tampoco se conocen los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El sufijo "heretic-2" indica que el modelo base ha sido sometido a un proceso de "abliteration" o ajuste orientado a eliminar los rechazos, una practica que modifica los pesos para reducir la tendencia del modelo a negarse a responder ciertas peticiones. Esta intervencion suele realizarse mediante tecnicas de edicion de pesos o fine-tuning dirigido, pero no se detalla el metodo concreto empleado. La cuantizacion realizada por mradermacher utiliza cuantizaciones ponderadas con matriz de importancia (imatrix), segun los metadatos de la model card, lo que en teoria preserva mejor la calidad en niveles de compresion agresivos.

## Capacidades

- Generacion de texto: capacidad inferida por el tipo de modelo, sin confirmacion especifica en la informacion disponible.
- Razonamiento y codigo: no disponible.
- Matematicas: no disponible.
- Vision: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o capacidades especiales: no disponible.
- Reduccion de rechazos: el sufijo "heretic" indica que el modelo ha sido modificado para disminuir las negativas ante peticiones, aunque no se especifica el alcance ni el metodo.

## Casos de uso

- Despliegue local en hardware de consumo: al estar en formato GGUF, el modelo puede ejecutarse con llama.cpp u Ollama en equipos con GPU consumer, aunque el tamano de 31B (si se confirma) requeriria cuantizaciones agresivas (Q2_K, IQ2) para ajustarse a VRAM limitada.
- Investigacion sobre alineacion y rechazos: la variante "heretic" permite estudiar como la eliminacion de rechazos afecta al comportamiento del modelo, util para investigadores interesados en seguridad y alineacion.
- Prototipado de aplicaciones de texto: para experimentar con generacion de texto en entornos sin acceso a APIs comerciales, usando cuantizaciones Q4_K_M o Q5_K_M como compromiso entre calidad y recursos.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K), lo que permite analizar el impacto de la compresion en la calidad de salida.
- Fine-tuning posterior o experimentacion: el modelo cuantizado puede servir como base para pruebas, aunque para reentrenamiento seria necesario el modelo original en precision completa.
- Educacion y divulgacion: util como ejemplo practico de cuantizacion con imatrix y de las implicaciones de las variantes "heretic" en modelos open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable. Si el modelo es de 31B, una cuantizacion Q4_K_M requeriria aproximadamente 18-20 GB de VRAM, y Q2_K alrededor de 11-12 GB, aunque estas cifras son estimaciones basadas en el tamano nominal y no en datos confirmados.
- GPU recomendadas: no disponible. Para un modelo de 31B en Q4 se requeriria una GPU con 24 GB o mas (RTX 3090, RTX 4090, A100 40GB, H100).
- Cabe en GPU consumer: posiblemente en RTX 3090/4090 con cuantizaciones Q4 o inferiores, sujeto a confirmacion del tamano real.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion suficiente sobre el modelo base ni sobre alternativas comparables verificables en los datos proporcionados.

## Limitaciones y advertencias

- La licencia no esta especificada, lo que impide determinar si el uso comercial esta permitido. Se debe consultar el repositorio del modelo original antes de cualquier uso en produccion.
- El dato de parametros totales en safetensors (6.850.770) es inconsistente con el nombre del modelo (31B), lo que sugiere metadatos erroneos o incompletos; no debe usarse como referencia fiable.
- El modelo ha sido modificado para reducir rechazos ("heretic"), lo que puede aumentar el riesgo de generar contenido inapropiado, danino o inexacto, y reduce las salvaguardas de seguridad del modelo original.
- Riesgo de alucinacion: no cuantificado, pero inherente a los modelos de lenguaje; las cuantizaciones agresivas (IQ1, IQ2) pueden degradar la coherencia y aumentar errores.
- No se dispone de informacion sobre sesgos conocidos, limitaciones de contexto o idioma.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha, lo que indica que es un artefacto reciente y sin validacion comunitaria.
- El tamano del repositorio reportado (0.0 GB) es inconsistente con la presencia de multiples cuantizaciones de un modelo de 31B, lo que sugiere que los metadatos del repositorio estan incompletos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Mero-Artemis-31B-v1-heretic-2-i1-GGUF
- Modelo base: https://huggingface.co/sh0ck0r/Mero-Artemis-31B-v1-heretic-2
