# mradermacher/RPBizkit-v7-12B-GGUF

## Resumen

RPBizkit-v7-12B-GGUF es la colección de cuantizaciones en formato GGUF del modelo RicardoEstep/RPBizkit-v7-12B, publicada por el usuario mradermacher, conocido por convertir y cuantizar modelos de la comunidad a formatos ejecutables en CPU y GPU de consumo. No se trata de un modelo entrenado desde cero, sino de un merge: el modelo original se construyó combinando pesos de otros modelos mediante mergekit, una práctica habitual en la escena de modelos de rol (roleplay) y conversación creativa en inglés.

El modelo cuenta con 12.247.782.400 parámetros (aproximadamente 12,2 mil millones), lo que lo sitúa en la franja de los 12B, un tamaño manejable en GPUs de consumo con cuantizaciones de 4 bits. El repositorio ocupa 84,7 GB y ofrece once variantes GGUF que van desde Q2_K (4,9 GB) hasta Q8_0 (13,1 GB), además de una versión x-f16 mencionada en los metadatos internos de la model card. La librería declarada es transformers y el único idioma soportado es el inglés.

La relevancia de esta ficha es principalmente práctica: el modelo original solo está disponible en safetensors, y esta conversión permite ejecutarlo con llama.cpp, Ollama o cualquier runtime compatible con GGUF. Conviene advertir desde el principio que el repositorio está etiquetado como "not-for-all-audiences", que el pipeline no está declarado y que no se ha publicado información sobre licencia, longitud de contexto, composición del dataset ni resultados de benchmarks, por lo que cualquier evaluación rigurosa requiere pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo resultante de un merge con mergekit; se asume transformer decoder-only) |
| Parametros totales | 12.247.782.400 (~12,2B) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; el modelo original dispone ademas de safetensors y la model card menciona x-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (la model card no especifica licencia; incluye el tag not-for-all-audiences) |
| Formato de pesos | GGUF (original en safetensors bajo RicardoEstep/RPBizkit-v7-12B) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna. Los metadatos indican que el modelo original es un merge creado con mergekit (tags "mergekit" y "merge"), por lo que su arquitectura subyacente es la del modelo base elegido como columna vertebral del merge, presumiblemente un transformer decoder-only de la familia de los 12B. El repositorio no declara configuracion de capas, dimensiones ocultas, tipo de atencion ni uso de atencion lineal o SSM.

Tampoco hay datos sobre el proceso de entrenamiento: no se especifica el numero de tokens, la composicion del corpus, ni si hubo fases de ajuste fino con RLHF, DPO o similar. En un merge tipico de la escena roleplay, los pesos se combinan mediante interpolacion de tensores (por ejemplo, linear, slerp o TIES) a partir de modelos previamente afinados por la comunidad sobre instrucciones conversacionales, y el ajuste fino se realiza sobre datasets de dialogo y narrativa en ingles. El unico proceso documentado en este repositorio es la conversion a GGUF y la cuantizacion, que el autor declara como "static quants" (cuantizacion estatica, sin importancia por pesos) y con output_tensor_quantised activado.

## Capacidades

- No hay documentacion oficial de capacidades en la informacion proporcionada. Las capacidades que se enumeran a continuacion son las esperables en un merge de 12B para conversacion, pero no estan verificadas por el autor.
- Generacion de texto en ingles y conversacion multi-turno, presumiblemente orientada a rol y narrativa creativa.
- Razonamiento basico y respuesta a instrucciones, en funcion de los modelos que componen el merge (no disponible).
- Soporte de tool calling / function calling: no disponible; no se documenta plantilla de chat ni soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible; el repositorio no incluye proyector multimodal (skip_mmproj vacio en los metadatos).

## Casos de uso

- Prototipado de personajes conversacionales en ingles: un merge de este tamano permite mantener personalidad y estilo coherentes en dialogos largos, y las cuantizaciones Q4_K_S y Q4_K_M (7,2 y 7,6 GB) se ejecutan en una unica GPU de 12 GB, lo que abarata las pruebas iterativas de prompt engineering.
- Escritura creativa y narrativa asistida: el modelo puede generar texto continuado, dialogos y descripciones; al ejecutarse en local con llama.cpp, el contenido no sale del equipo, algo relevante dado el tag not-for-all-audiences.
- Investigacion sobre tecnicas de merge: sirve como caso de estudio reproducible para analizar como la interpolacion de pesos afecta al estilo y a la coherencia en la franja de 12B, comparando las once cuantizaciones publicadas.
- Evaluacion de degradacion por cuantizacion: la coleccion incluye desde Q2_K hasta Q8_0 con los mismos pesos de origen, lo que permite medir empiricamente la perdida de perplejidad y de calidad de generacion entre niveles (el autor enlaza la grafica comparativa de ikawrakow).
- Despliegue en estaciones de trabajo sin GPU dedicada: las variantes Q3_K_S (5,6 GB) y Q2_K (4,9 GB) permiten inferencia en CPU con RAM moderada, utiles para demos internas o entornos de desarrollo sin acelerador.
- Generacion de datos sinteticos en ingles para ajuste fino posterior: con la variante Q8_0 (13,1 GB) se puede producir un volumen alto de conversaciones y textos que alimenten pipelines de destilacion o de anotacion.
- Base para experimentos de rol con contexto largo: al no documentarse la ventana de contexto, este caso queda condicionado a la verificacion previa de la configuracion del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el modelo original tampoco aporta cifras en los datos proporcionados. Cualquier comparacion numerica con alternativas requeriria ejecutar una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y cache KV, valores orientativos):
  - Q8_0 (13,1 GB de fichero): aproximadamente 14-15 GB de VRAM.
  - Q6_K (10,2 GB): aproximadamente 11-12 GB.
  - Q5_K_M (8,8 GB) y Q5_K_S (8,6 GB): aproximadamente 10 GB.
  - Q4_K_M (7,6 GB) y Q4_K_S (7,2 GB): aproximadamente 8,5-9 GB.
  - IQ4_XS (6,9 GB) y Q3_K_L (6,7 GB): aproximadamente 8 GB.
  - Q3_K_M (6,2 GB) y Q3_K_S (5,6 GB): aproximadamente 7 GB.
  - Q2_K (4,9 GB): aproximadamente 6 GB.
  - Peso completo en safetensors (16 bits): en torno a 24,5 GB solo de pesos.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servir varias peticiones concurrentes en Q8_0; RTX 4090, RTX 3090 o RTX 4080 (16-24 GB) para Q6_K y Q8_0 en uso individual.
- GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4070 Ti o una RTX 4070 ejecutan comodamente Q4_K_M y Q4_K_S; una GPU de 8 GB puede asumir Q3_K_M o IQ4_XS con contexto reducido; las variantes Q2_K y Q3_K_S son las unicas viables en equipos de 6 GB o en inferencia mixta CPU/GPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, koboldcpp, text-generation-webui y servidores compatibles con GGUF en general. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan los safetensors originales; el tag endpoints_compatible sugiere compatibilidad con endpoints alojados, sin mas detalle.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La comparacion se limita a los parametros y a la disponibilidad, porque no hay datos verificables de rendimiento, contexto o licencia para el modelo objeto de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de cuantizaciones |
|---|---|---|---|---|
| RPBizkit-v7-12B-GGUF | ~12,2B | no disponible | no disponible | GGUF, 11 variantes static (Q2_K a Q8_0); existe version i1 con imatrix |
| Mistral-Nemo-Base-2407 | 12B | 128.000 tokens | Apache 2.0 | safetensors, GGUF de terceros |
| Gemma 2 9B | 9B | 8.192 tokens | licencia Gemma (uso comercial con condiciones) | safetensors, GGUF oficial y de terceros |
| Llama 3.1 8B | 8B | 128.000 tokens | licencia comunitaria Llama 3.1 | safetensors, GGUF oficial y de terceros |

Los tres modelos de referencia tienen licencia y contexto publicados y documentacion de entrenamiento detallada; RPBizkit-v7-12B no ofrece ninguno de esos datos, lo que dificulta su adopcion en entornos de produccion con requisitos de cumplimiento.

## Limitaciones y advertencias

- Ausencia total de informacion sobre licencia. No esta claro si se permite uso comercial, redistribucion o modificacion; el modelo original tampoco la declara segun los datos disponibles. Esto impide su uso en productos comerciales sin aclaracion previa del autor.
- El repositorio esta etiquetado como "not-for-all-audiences", lo que indica contenido potencialmente inapropiado (rol adulto, lenguaje explicito u otros materiales sensibles). No es adecuado para aplicaciones dirigidas al publico general ni para entornos sin moderacion.
- No se ha publicado la longitud de contexto soportada, un dato critico para dimensionar la cache KV y para decidir si el modelo sirve en casos de conversacion larga o analisis de documentos.
- Idioma limitado al ingles. El rendimiento en castellano no esta documentado y, en merges de este tipo, suele degradarse notablemente respecto al ingles.
- Riesgo de alucinacion: al ser un modelo de 12B sin datos de evaluacion publicados, cabe esperar una tasa de error factual alta en tareas de conocimiento; no debe usarse como fuente de verdad sin verificacion.
- Sesgos conocidos: no disponibles, pero al no existir informacion sobre el corpus de entrenamiento no es posible auditar sesgos de genero, raza, religion u orientacion.
- Procedencia de los pesos: al ser un merge construido con mergekit, sus componentes originales y sus licencias respectivas no estan desglosados en la informacion proporcionada, lo que anade incertidumbre juridica.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S reducen el tamano hasta 4,9 y 5,6 GB respectivamente, pero la propia model card advierte que Q3_K_M es de "lower quality"; en Q2_K la perdida de coherencia en generacion larga suele ser apreciable.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay retroalimentacion de la comunidad ni informes independientes de comportamiento en produccion.
- No dispone de proyector multimodal ni de soporte documentado de herramientas, por lo que no debe asumirse capacidad de vision ni de function calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RPBizkit-v7-12B-GGUF
- Modelo base original: https://huggingface.co/RicardoEstep/RPBizkit-v7-12B
- Cuantizaciones weighted/imatrix del mismo modelo: https://huggingface.co/mradermacher/RPBizkit-v7-12B-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#RPBizkit-v7-12B-GGUF
- Guia de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Sitio de nethype GmbH: https://www.nethype.de/
