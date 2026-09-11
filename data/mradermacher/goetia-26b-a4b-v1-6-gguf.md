# mradermacher/Goetia-26B-A4B-v1.6-GGUF

## Resumen

Goetia-26B-A4B-v1.6-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo base Naphula/Goetia-26B-A4B-v1.6. No se trata, por tanto, de un modelo entrenado por el autor del repositorio, sino de una conversion estatica a distintos niveles de cuantizacion pensada para su uso con llama.cpp y derivados (Ollama, LM Studio, entre otros). El repositorio publicado es el artefacto de distribucion, no la fuente original del entrenamiento.

El modelo base cuenta con 25.971.339.550 parametros totales (aproximadamente 26.000 millones, segun los datos de safetensors declarados), lo que lo situa en la franja de modelos grandes que solo caben en GPU de consumo tras una cuantizacion agresiva. La nomenclatura "A4B" del nombre sigue la convencion habitual de los modelos de mezcla de expertos (MoE), en la que se indica el numero de parametros activos por token; en este caso sugeriria del orden de 4.000 millones de parametros activos sobre un total de 26.000 millones, aunque este dato no viene confirmado en la informacion disponible.

La relevancia de esta ficha es limitada pero concreta: se trata de una de las pocas vias de ejecucion local para este modelo, ya que el repositorio ofrece doce niveles de cuantizacion distintos (desde Q2_K hasta f16) que cubren desde tarjetas de 12 GB de VRAM hasta despliegues en servidor. El repositorio no tiene descargas ni "likes" registrados en el momento de la consulta, no declara licencia ni idiomas soportados y no incluye model card mas alla de los metadatos de la herramienta de cuantizacion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura "A4B" sugiere mezcla de expertos, sin confirmar) |
| Parametros totales | 25.971.339.550 (segun safetensors del repositorio) |
| Parametros activos | no disponible (la nomenclatura "A4B" sugiere ~4.000 millones activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con llama.cpp) |
| Tamano del repositorio | 26,7 GB (segun HuggingFace) |
| Modelo base | Naphula/Goetia-26B-A4B-v1.6 |
| Etiquetas declaradas | gguf, endpoints_compatible, region:us, conversational |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la informacion proporcionada. Los metadatos del proceso de cuantizacion aportan dos pistas indirectas: por un lado, el campo `convert_type: hf` indica que la conversion partio de pesos en formato HuggingFace, no de un GGUF previo; por otro, el campo `skip_mmproj: 1` registra que el proyector multimodal fue omitido durante la conversion. Esto ultimo apunta a que el modelo base podria incluir un componente multimodal (vision-lenguaje) que no esta presente en estas cuantizaciones, aunque no puede confirmarse a partir de los datos disponibles ni conviene asumir que las capacidades de vision esten operativas en los ficheros GGUF publicados.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. El tag `conversational` y la etiqueta `endpoints_compatible` indican que el modelo esta pensado para uso conversacional y que las cuantizaciones son compatibles con endpoints de inferencia tipo API, respectivamente. La version declarada es v1.6, lo que implica al menos cinco iteraciones previas del modelo base, sin que se documenten los cambios entre versiones.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica que el modelo esta orientado a dialogos multi-turno, aunque no se especifica el formato de plantilla de chat empleado.
- Compatibilidad con endpoints de inferencia: la etiqueta `endpoints_compatible` sugiere que las cuantizaciones pueden servirse mediante APIs compatibles con el ecosistema de HuggingFace.
- Razonamiento y generacion de codigo: no disponible, no hay informacion que confirme o descarte estas capacidades.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades multimodales: el metadato `skip_mmproj: 1` indica que el proyector multimodal del modelo base fue omitido en esta conversion, por lo que no cabe esperar entrada de imagenes en estos ficheros GGUF.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M y Q4_K_S permiten cargar un modelo de ~26.000 millones de parametros en una GPU de 24 GB de VRAM (RTX 3090, RTX 4090), algo inviable con los pesos en precision completa.
- Asistentes conversacionales autoalojados: el tag `conversational` y el formato GGUF facilitan montar un asistente de chat sobre llama.cpp u Ollama sin depender de servicios en la nube ni de conectividad externa.
- Prototipado con presupuesto de VRAM muy reducido: la cuantizacion Q2_K, de aproximadamente 10 GB, permite probar el modelo en GPU de 12 GB (RTX 3060, RTX 4070) para validar si la tarea concreta tolera la perdida de calidad asociada a 2 bits.
- Servicio de inferencia en CPU: los niveles Q4_K_M y Q3_K_M son ejecutables en llama.cpp sobre CPU exclusivamente, lo que habilita despliegues en servidores sin acelerador grafico para cargas de trabajo de baja concurrencia.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce niveles distintos del mismo modelo, lo que lo convierte en una base util para medir la degradacion de calidad por nivel de cuantizacion en tareas propias.
- Integracion en herramientas de escritorio tipo LM Studio u Ollama: el formato GGUF es el formato nativo de estas aplicaciones, de modo que los ficheros pueden importarse directamente sin conversion adicional.
- Ajuste fino ligero o evaluacion de linea base: las cuantizaciones Q8_0 y f16 sirven como referencia de maxima fidelidad frente a los pesos originales antes de decidir una cuantizacion para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 25.971.339.550 parametros (estimaciones aproximadas; los tamanos reales de cada fichero pueden variar):
  - f16: ~52 GB
  - Q8_0: ~28 GB
  - Q6_K: ~21 GB
  - Q5_K_M: ~18 GB
  - Q5_K_S: ~17,5 GB
  - Q4_K_M: ~16 GB
  - Q4_K_S: ~15 GB
  - IQ4_XS: ~14,5 GB
  - Q3_K_L: ~14 GB
  - Q3_K_M: ~13,5 GB
  - Q3_K_S: ~12 GB
  - Q2_K: ~10 GB
- GPU recomendadas: para Q8_0 y superiores, A100 40/80 GB, H100 80 GB o varias RTX 4090 en paralelo. Para Q4_K_M y Q4_K_S, una RTX 4090 o RTX 3090 de 24 GB es suficiente, dejando margen para la cache KV. Para Q2_K y Q3_K_S, GPU de 12 GB como RTX 3060 12 GB o RTX 4070.
- Cabe en GPU de consumo: si, en RTX 4090 / RTX 3090 con cuantizaciones de 4 bits o inferiores, y en RTX 3060 12 GB con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, kobold.cpp y servidores GGUF compatibles. Tambien puede servirse mediante endpoint si se usa un backend compatible con el tag `endpoints_compatible`.
- Nota sobre MoE: si el modelo base es efectivamente MoE con ~4.000 millones de parametros activos, el coste de computo por token seria bajo, pero todos los expertos deben residir en memoria, por lo que el requisito de VRAM viene marcado por los parametros totales y no por los activos.
- Latencia y throughput estimados: no disponible.
- El tamano de repositorio declarado (26,7 GB) es inferior a la suma de las doce cuantizaciones listadas, por lo que no esta claro que todos los ficheros esten efectivamente materializados en el repositorio; conviene comprobar la lista de ficheros antes de planificar el despliegue.

## Comparativa con modelos similares

Los datos del modelo comparado corresponden a informacion publica general de cada proyecto y pueden variar respecto a la version concreta que se consulte. Los campos del modelo objeto de esta ficha figuran como no disponibles cuando no se han podido confirmar.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Goetia-26B-A4B-v1.6 (esta ficha) | 25.971.339.550 | no disponible (~4.000 millones segun nomenclatura, sin confirmar) | no disponible | no disponible | GGUF (cuantizaciones de terceros) |
| Qwen3-30B-A3B | ~30.500 millones | ~3.300 millones | 128K (segun documentacion del proyecto) | Apache 2.0 | safetensors y GGUF oficiales |
| Mixtral 8x7B | ~46.700 millones | ~12.900 millones | 32K (segun documentacion del proyecto) | Apache 2.0 | safetensors y GGUF de terceros |
| Qwen2.5-32B (denso) | ~32.500 millones | no aplica (denso) | 128K (segun documentacion del proyecto) | Apache 2.0 (con matices por variante) | safetensors y GGUF de terceros |

La diferencia estructural mas relevante frente a estos modelos es la ausencia de licencia declarada en el repositorio de Goetia, lo que impide confirmar si su uso comercial esta permitido, mientras que las alternativas citadas publican terminos explicitos.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, ni propia ni heredada del modelo base. En la practica esto significa que no hay autorizacion explicita de uso comercial y que el riesgo legal recae sobre quien despliegue el modelo, especialmente si el modelo base tuviera una licencia con clausulas restrictivas.
- Ausencia total de model card: no hay documentacion sobre datos de entrenamiento, sesgos conocidos, idiomas soportados ni plantilla de chat, lo que dificulta la integracion en produccion y la evaluacion de riesgos.
- Riesgo de alucinacion: no cuantificado, al no existir evaluaciones publicadas. Es esperable el comportamiento tipico de un modelo de ~26.000 millones de parametros conversacional, con invencion de datos en dominios poco representados en su entrenamiento.
- Degradacion por cuantizacion: los niveles Q2_K, Q3_K_S y Q3_K_M implican perdidas notables de calidad en tareas de razonamiento, matematicas y generacion de codigo. Para uso serio conviene partir de Q4_K_M o superior.
- Multimodalidad no operativa: aunque el modelo base pudiera disponer de proyector multimodal, este fue omitido en la conversion (`skip_mmproj: 1`), por lo que estas cuantizaciones no procesan imagenes.
- Idiomas no declarados: se desconoce si el modelo ofrece un rendimiento aceptable en castellano o en otros idiomas distintos del ingles.
- Versionado sin trazabilidad: la etiqueta v1.6 no viene acompanada de registro de cambios respecto a versiones anteriores, lo que complica la reproducibilidad.
- Sesgos: no documentados. Sin informacion sobre la composicion del dataset de entrenamiento, no puede evaluarse el sesgo demografico, ideologico o cultural.
- Adopcion nula: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y de informes de errores.
- Nombre no indicativo de la tarea: "Goetia" no aporta informacion sobre el dominio de especializacion, y no se ha encontrado documentacion al respecto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.6-GGUF
- Modelo base: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.6
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Paper, blog o demo oficial: no disponible
- Resultados de la busqueda web: las unicas entradas devueltas corresponden a la plataforma china Zhihu (https://www.zhihu.com/) y a preguntas genericas sin relacion con el modelo; no se ha encontrado ninguna fuente tecnica relevante sobre Goetia-26B-A4B-v1.6.
