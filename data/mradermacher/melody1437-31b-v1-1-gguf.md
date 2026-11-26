# mradermacher/Melody1437-31B-v1.1-GGUF

## Resumen

Melody1437-31B-v1.1-GGUF es la version cuantizada en formato GGUF del modelo ReadyArt/Melody1437-31B-v1.1, un modelo de lenguaje de aproximadamente 30.700 millones de parametros orientado a roleplay, conversacion instructiva y contenido para adultos. La cuantizacion la firma mradermacher, un conocido publicador de versiones GGUF de modelos open source, que distribuye tanto cuantizaciones estaticas como variantes con imatrix en repositorios separados. El modelo base esta etiquetado con el identificador `gemma-4` y se presenta como "unaligned", es decir, sin el alineamiento de seguridad habitual de los modelos comerciales.

El interes practico de esta publicacion es que permite ejecutar un modelo de 31B en hardware de consumo mediante cuantizaciones que van desde los 12 GB del Q2_K hasta los 32,7 GB del Q8_0, pasando por opciones intermedias recomendadas como Q4_K_M (18,8 GB). Ademas, el repositorio incluye ficheros `mmproj` (0,9 GB en Q8_0 y 1,3 GB en f16), lo que indica que el modelo base incorpora capacidad multimodal de vision, aunque la model card no detalla su funcionamiento.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy concreto (roleplay conversacional sin restricciones) que tiene demanda real en la comunidad; por otro, sirve de ejemplo de las implicaciones practicas de distribuir modelos "unaligned" bajo licencia Apache 2.0, con todo lo que ello conlleva en terminos de responsabilidad para quien los despliega.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `gemma-4`; se desconoce si es transformer denso, MoE o hibrido) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; variantes imatrix en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye presumiblemente en safetensors via transformers |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. La etiqueta `gemma-4` sugiere que ReadyArt/Melody1437-31B-v1.1 deriva de la familia Gemma de Google, pero no se confirma en la model card proporcionada ni se especifica si se trata de un transformer denso, una mezcla de expertos o una variante hibrida. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado. El tag `unaligned` indica que, si existio alineamiento, fue revertido o minimizado deliberadamente.

Lo que si se puede afirmar con los datos disponibles es que el modelo ha sido sometido a un proceso de cuantizacion post-entrenamiento por parte de mradermacher, con dos pipelines: cuantizaciones estaticas (las de este repositorio) y cuantizaciones ponderadas con imatrix (repositorio `Melody1437-31B-v1.1-i1-GGUF`). La presencia de ficheros `mmproj` confirma que el modelo base conserva la torre de vision del modelo del que deriva, aunque no se detalla que encoder visual utiliza ni como se integra con el decoder de texto.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay y narrativa interactiva.
- Modo instructivo: el tag `instruct` indica que responde a instrucciones, aunque el foco declarado es la conversacion.
- Capacidad multimodal de vision: el repositorio incluye ficheros `mmproj` que permiten cargar la torre visual en llama.cpp y derivados.
- Contenido para adultos sin restricciones: los tags `nsfw`, `explicit`, `erp`, `adult-content`, `mature` y `unaligned` describen explicitamente este comportamiento.
- Idiomas: ingles unicamente segun el campo `language` de la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo esta afinado especificamente para mantener personajes coherentes en conversaciones multi-turno; su tamano de 31B le permite sostener estilo y personalidad mejor que modelos de 7B-13B, y las cuantizaciones Q4_K_M o Q5_K_M ofrecen un equilibrio razonable entre calidad y VRAM.
- Escritura creativa asistida para ficcion adulta: el caracter `unaligned` evita los rechazos sistematicos que sufren los modelos alineados ante contenido mature, lo que lo hace util para autores que necesitan generar borradores sin friccion.
- Prototipado de narrativa interactiva y videojuegos conversacionales: puede integrarse en motores de dialogo para NPCs con personalidad definida, ejecutandose en local con llama.cpp u Ollama y sin dependencia de APIs externas.
- Investigacion sobre alineamiento y seguridad: sirve como contrapunto controlado para estudiar como se comporta un modelo sin salvaguardas, comparando sus respuestas con las de variantes alineadas del mismo tamano.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece 11 variantes de cuantizacion del mismo modelo, lo que permite medir empiricamente la degradacion de calidad (perplejidad, coherencia narrativa) segun el nivel de compresion.
- Despliegue local en estaciones de trabajo con GPU consumer: con Q4_K_S (17,9 GB) cabe en una RTX 4090 de 24 GB o en una RTX 3090, permitiendo inferencia privada sin enviar datos a terceros.
- Analisis de imagenes en contexto conversacional: gracias a los ficheros `mmproj`, puede combinarse la entrada visual con el dialogo, por ejemplo para describir o comentar imagenes dentro de una narracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~12 GB de pesos, ~13-14 GB en ejecucion.
  - Q3_K_M: ~15,4 GB de pesos, ~17 GB en ejecucion.
  - IQ4_XS: ~17 GB de pesos, ~18,5 GB en ejecucion.
  - Q4_K_M: ~18,8 GB de pesos, ~20-21 GB en ejecucion.
  - Q5_K_M: ~21,9 GB de pesos, ~23-24 GB en ejecucion.
  - Q6_K: ~25,3 GB de pesos, ~27 GB en ejecucion.
  - Q8_0: ~32,7 GB de pesos, ~34-35 GB en ejecucion.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para Q4_K_M y Q5_K_M; A100 40 GB, H100 o dos GPU de 24 GB en paralelo para Q6_K y Q8_0.
- Cabe en GPU consumer: si, hasta Q5_K_M en una unica GPU de 24 GB; Q6_K y Q8_0 requieren 32 GB o mas, o bien offloading parcial a RAM del sistema (con la penalizacion de velocidad correspondiente).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. Para las variantes imatrix, usar el repositorio `Melody1437-31B-v1.1-i1-GGUF`.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Melody1437-31B-v1.1 (esta ficha) | ~30,7B | no disponible | Roleplay/ERP sin alinear | Apache 2.0 | GGUF en HF |
| Modelos de roleplay de ~30B basados en Gemma | ~27-31B | no disponible | Roleplay | Variable | GGUF en HF |
| Modelos de roleplay de ~70B | ~70B | no disponible | Roleplay/ERP | Variable | GGUF en HF |
| Modelos alineados de ~30B | ~30B | no disponible | Uso general | Variable | Multiples formatos |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas publicadas en la informacion proporcionada que permitan establecer una comparativa de rendimiento rigurosa con alternativas concretas.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta disenado para generar contenido para adultos sin filtros; no es apto para entornos infantiles, educativos o de atencion al publico sin moderacion adicional.
- Ausencia de alineamiento: al estar etiquetado como `unaligned`, no incorpora salvaguardas frente a peticiones daninas; el operador debe implementar sus propias capas de moderacion si lo despliega en produccion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de esta escala, puede generar afirmaciones falsas con apariencia de veracidad, especialmente fuera del dominio del roleplay.
- Limitacion idiomatica: solo ingles declarado; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto desconocido: no se publica la longitud de contexto, lo que impide planificar conversaciones largas con garantias.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material adulto; la responsabilidad recae en el desplegador.
- Repositorio grande: 213,9 GB en total; conviene descargar solo la cuantizacion necesaria en lugar de clonar el repositorio completo.
- Modelo base no verificado en esta ficha: los detalles de entrenamiento y arquitectura del modelo original ReadyArt/Melody1437-31B-v1.1 no se han podido confirmar con la informacion proporcionada.
- Sin senales de adopcion: 238 descargas y 0 likes en el momento de la consulta, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Melody1437-31B-v1.1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Melody1437-31B-v1.1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Melody1437-31B-v1.1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Melody1437-31B-v1.1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
