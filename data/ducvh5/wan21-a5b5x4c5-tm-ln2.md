# ducvh5/wan21-a5b5x4c5-tm-ln2

## Resumen

`ducvh5/wan21-a5b5x4c5-tm-ln2` es un checkpoint derivado del modelo de generacion de video texto-a-video Wan2.1-T2V-1.3B de Alibaba (Wan-AI), publicado en HuggingFace por el usuario `ducvh5`. No se trata de un modelo nuevo entrenado desde cero, sino de una variante experimental del modelo base en la que se ha modificado la estructura de bloques del transformer: segun la model card, la arquitectura pasa de una configuracion "A5" a "B5×4" y finalmente a "C5", con 15 bloques unicos y 30 bloques ejecutados, lo que sugiere algun tipo de reutilizacion o comparticion de bloques (recurrent transformer).

La relevancia de esta publicacion es limitada y fundamentalmente experimental: cuenta con cero descargas y cero likes en el momento de la consulta, no incluye resultados de benchmarks, no especifica licencia ni idiomas soportados, y la propia model card indica que no se ha guardado ningun checkpoint final ("no checkpoint saved"). El repositorio contiene unicamente pesos EMA y no EMA retenidos durante el proceso.

Por tanto, esta ficha debe interpretarse como documentacion de un artefacto de investigacion de trazabilidad incierta, no como un modelo listo para produccion. La informacion disponible es muy escasa y muchos campos se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (variante derivada de Wan2.1-T2V-1.3B); configuracion de bloques A5 → B5×4 → C5; 15 bloques unicos / 30 ejecutados |
| Parametros totales | no disponible (modelo base Wan2.1-T2V-1.3B: aproximadamente 1.3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card menciona "checkpoints" pero no especifica formato) |

## Arquitectura y entrenamiento

El modelo se basa en Wan2.1-T2V-1.3B-Diffusers, un modelo de difusion texto-a-video de aproximadamente 1.3 mil millones de parametros. La variante publicada por `ducvh5` introduce una modificacion estructural descrita como "recurrent-transformer": la secuencia de bloques se organiza en tres etapas (A5, B5×4 y C5) que dan como resultado 15 bloques unicos ejecutados 30 veces en total, lo que implica que algunos bloques se reutilizan en pasadas sucesivas.

En cuanto al entrenamiento, la model card solo indica que se utiliza una perdida denominada "TM" y un muestreo de ruido con σ ~ LN(0,1), factor de desplazamiento (shift) de 2 y t = 1000σ. Los datos de entrenamiento se etiquetan como "OV", sin mas detalle. No se especifica el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se documenta ninguna innovacion adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de video a partir de texto (pipeline `text-to-video`), heredada del modelo base Wan2.1-T2V-1.3B.
- Ejecucion de un transformer con reutilizacion de bloques (15 unicos, 30 ejecutados), lo que en principio reduce el numero de parametros unicos respecto a un modelo con 30 bloques independientes.
- Conservacion de pesos EMA y no EMA durante el entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No se documentan modos especiales (thinking mode, vision, audio) mas alla de la generacion de video.

## Casos de uso

- Investigacion sobre arquitecturas recurrentes en difusion de video: el modelo sirve como artefacto para estudiar el efecto de reutilizar bloques (15 unicos frente a 30 ejecutados) en la calidad y el coste de generacion de video.
- Experimentos de ablation controlados: al derivar del mismo modelo base Wan2.1-T2V-1.3B, permite comparar directamente la variante recurrente contra el modelo original en igualdad de condiciones de datos y hardware.
- Reproduccion de pipelines de entrenamiento con perdida "TM" y muestreo σ ~ LN(0,1): util para validar recetas de entrenamiento alternativas en modelos de video de ~1.3B.
- Prototipado de generacion de clips cortos en entornos de laboratorio, siempre que se asuma la ausencia de garantias de calidad y de checkpoint final.
- Analisis de eficiencia memoria/tiempo: la reduccion de bloques unicos puede interesar a quienes investigan tecnicas de compresion estructural en modelos de difusion.
- Docencia y formacion: ejemplo practico de publicacion de checkpoints intermedios y de model cards minimas en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para esta variante; el modelo base Wan2.1-T2V-1.3B requiere tipicamente varias GB de VRAM, pero no se aportan cifras concretas en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni Diffusers (aunque el modelo base es compatible con Diffusers, esta variante no lo declara).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tm-ln2 | no disponible (base ~1.3B) | no disponible | sin benchmarks publicados | no disponible | HuggingFace (0 descargas) |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | ~1.3B | no disponible | benchmarks del modelo original no incluidos en la informacion | no disponible en esta ficha | HuggingFace (modelo base oficial) |
| Otras variantes de Wan2.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base declarado, ya que no se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La model card indica explicitamente "no checkpoint saved": no hay un estado final guardado, solo pesos EMA y no EMA retenidos, lo que compromete la reproducibilidad.
- Ausencia total de benchmarks: no es posible evaluar la calidad de la generacion de video frente al modelo base.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribucion.
- Idiomas no declarados: se desconoce el soporte multilingue de los prompts.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al derivar de Wan2.1, hereda los sesgos del dataset original, que tampoco se detalla ("OV").
- Trazabilidad limitada: el repositorio tiene cero descargas y cero likes, y la documentacion es minima, lo que dificulta la validacion por terceros.
- No se documenta compatibilidad con Diffusers ni con herramientas de despliegue estandar, a pesar de que el modelo base si la tiene.
- Uso en produccion desaconsejado sin una evaluacion previa exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tm-ln2
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
