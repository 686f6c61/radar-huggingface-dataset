# geantendormi/K2-Horizon-7B-Uno-Uncensored-GGUF

## Resumen

K2-Horizon-7B-Uno-Uncensored-GGUF es un repositorio de pesos en formato GGUF publicado por el usuario geantendormi en HuggingFace. Por el propio identificador del repositorio se deduce que se trata de un modelo de aproximadamente 7.000 millones de parametros, con ajuste "uncensored" (es decir, con las capas de rechazo o alineamiento de seguridad presumiblemente atenuadas o eliminadas) y distribuido exclusivamente en el formato de cuantizacion GGUF que consume llama.cpp y su ecosistema. La model card publicada por el autor no contiene ninguna descripcion tecnica: unicamente la declaracion de licencia Apache 2.0.

El problema que resuelve, en la medida en que puede inferirse, es el de ofrecer un modelo de 7B sin filtros de contenido y ejecutable en hardware de consumo, presumiblemente como fine-tune de alguna familia base de 7B (no se especifica cual). No obstante, la informacion disponible publicamente es practicamente nula: el repositorio registra cero descargas y cero "likes", no declara pipeline, no declara idiomas soportados y no incluye datos de entrenamiento, benchmarks ni instrucciones de uso.

La relevancia de esta ficha es, por tanto, fundamentalmente cautelar. Se documenta lo que se sabe, se marcan explicitamente todos los vacios de informacion y se advierte de los riesgos de adoptar un artefacto sin procedencia verificable. Cualquier evaluacion seria de este modelo exige inspeccion directa del repositorio, de los tensores y del tokenizador antes de considerarlo para cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la model card) |
| Parametros totales | aproximadamente 7B, deducido unicamente del nombre del repositorio; no confirmado |
| Parametros activos | no aplica / no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se desconoce el conjunto concreto de variantes incluidas en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | no disponible |
| Metodo de ajuste | no disponible (el nombre indica "uncensored", sin mas detalle) |
| Fecha de publicacion | 2026-09-16 segun metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna. La model card no menciona si se trata de un transformer denso, de un modelo con atencion lineal, de una mezcla de expertos o de una arquitectura hibrida. Tampoco se detalla la familia base sobre la que se ha realizado el ajuste, ni si el resultado procede de un fine-tune, de un merge de modelos, de una destilacion o de un entrenamiento desde cero. La unica pista es el sufijo "7B" del nombre, que situa el orden de magnitud en torno a los 7.000 millones de parametros, y el sufijo "GGUF", que confirma que el artefacto publicado es una conversion a ese formato y no pesos originales en safetensors.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el volumen de tokens utilizado, la composicion del dataset, si hubo supervise fine-tuning, RLHF, DPO u otra tecnica de alineamiento, y en que consiste exactamente el caracter "uncensored" que anuncia el nombre. Esta ausencia es relevante porque un modelo sin filtros puede haberse obtenido por tecnicas muy distintas (ablacion de direcciones de rechazo, fine-tune sobre datos sin filtrar, merge con modelos "uncensored" previos), cada una con implicaciones diferentes en cuanto a degradacion de capacidades generales y a estabilidad de la salida.

La unica innovacion tecnica reseñable es la propia cuantizacion a GGUF, que permite ejecutar el modelo en CPU y en GPU de gama media mediante llama.cpp. No se especifica el nivel de cuantizacion, ni la herramienta de conversion empleada (por ejemplo, llama.cpp convert.py, o pipelines de terceros), ni si se ha aplicado imatrix para mejorar la calidad de las cuantizaciones bajas.

## Capacidades

No se han publicado especificaciones de capacidades en la informacion disponible. A continuacion se enumeran las capacidades que cabria esperar por tamano, marcadas explicitamente como no verificadas:

- Generacion de texto conversacional: presumible, no confirmada.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Capacidades de vision o audio: no disponible; no hay indicios de multimodalidad.
- Modo "thinking" o razonamiento extendido: no disponible.
- Comportamiento "uncensored": anunciado en el nombre del repositorio, pero sin especificar el alcance real ni el metodo empleado.

## Casos de uso

Dado que no existe informacion verificable sobre el rendimiento ni sobre las capacidades del modelo, no es posible recomendar casos de uso con base tecnica. Se listan a continuacion escenarios hipoteticos, todos ellos condicionados a una evaluacion previa del artefacto:

- Experimentacion local en hardware de consumo: un GGUF de 7B puede cargarse en llama.cpp u Ollama en un equipo con GPU de gama media, lo que permitiria probar el modelo sin coste de API, siempre que se valide antes su calidad real.
- Investigacion sobre alineamiento y seguridad: el caracter "uncensored" declarado lo convierte en un candidato, junto con otros modelos similares, para estudiar como varian las tasas de rechazo y los sesgos tras eliminar capas de seguridad. Requiere, en todo caso, un protocolo de evaluacion propio.
- Generacion creativa sin restricciones editoriales: narrativa, guiones o roleplay donde los filtros de contenido estandar resultan limitantes. No hay datos que confirmen calidad literaria ni coherencia en contextos largos.
- Prototipado offline en entornos aislados: al ser un artefacto local y licenciado Apache 2.0, podria desplegarse en redes sin conexion, aunque la falta de trazabilidad del modelo base es un riesgo de cumplimiento.
- Evaluacion comparativa de cuantizaciones: util para estudiar la perdida de calidad entre niveles de cuantizacion GGUF, si el repositorio incluye varias variantes, extremo que no se ha confirmado.
- Base para fine-tune posterior: tecnicamente posible por la licencia permisiva, pero desaconsejable mientras no se identifique el modelo de origen y su licencia subyacente.
- Aprendizaje y docencia: como ejemplo practico de despliegue de un GGUF con llama.cpp, sin ninguna garantia sobre la calidad de las respuestas.

En todos los casos, la ausencia de benchmarks, de model card sustantiva y de historial de uso (cero descargas) obliga a tratar el modelo como no validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench, ni de ninguna otra evaluacion, ni tampoco comparaciones con modelos de referencia. No se dispone de mediciones de latencia ni de throughput.

## Requisitos de hardware

Las cifras siguientes son estimaciones genericas para un modelo denso de aproximadamente 7.000 millones de parametros en formato GGUF. No proceden de informacion publicada por el autor y deben confirmarse midiendo el tamano real de los ficheros del repositorio.

- VRAM estimada para inferencia, segun cuantizacion (modelo de 7B, contexto moderado):
  - Q4_K_M: aproximadamente 4,5-6 GB de VRAM.
  - Q5_K_M: aproximadamente 5,5-7 GB.
  - Q6_K: aproximadamente 6,5-8 GB.
  - Q8_0: aproximadamente 8-9,5 GB.
  - F16: aproximadamente 14-16 GB.
- GPU recomendadas: no hay recomendaciones publicadas. Para las cuantizaciones de 4 a 6 bits, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 cubren el modelo con holgura; para F16 se necesita una GPU de 16-24 GB (RTX 4090, A10G, L4, A100).
- Compatibilidad con GPU de consumo: presumiblemente si en cuantizaciones Q4 a Q6, aunque no verificado por el autor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM admite GGUF de forma experimental; TGI no es el camino habitual para este formato. No hay ninguna configuracion de despliegue documentada en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No es posible establecer una comparativa rigurosa porque se desconoce el modelo base, el numero exacto de parametros, la longitud de contexto, los idiomas soportados y el rendimiento. Cualquier tabla comparativa con alternativas de la misma categoria (por ejemplo, otros GGUF de 7B de la familia Mistral, Qwen o Llama) seria especulativa y no se incluye.

## Limitaciones y advertencias

- Procedencia no verificable: no se identifica el modelo base ni el proceso de entrenamiento, lo que impide auditar la licencia real de los pesos subyacentes. La declaracion Apache 2.0 del repositorio puede no ser valida si el modelo de origen tiene otra licencia.
- Ausencia total de model card: no hay descripcion, instrucciones, plantilla de prompt ni ejemplos de uso, lo que aumenta la probabilidad de obtener resultados pobres por un formato de prompt incorrecto.
- Cero adopcion: 0 descargas y 0 likes implican que el artefacto no ha sido validado por terceros.
- Riesgo elevado de alucinacion y de salidas inapropiadas: un modelo etiquetado como "uncensored" tiende a producir contenido sin filtros, incluyendo material ofensivo, ilegal o peligroso. No debe exponerse a usuarios finales sin moderacion externa.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se puede caracterizar el sesgo de genero, raza, religion o ideologia del modelo.
- Idiomas e idioma de la ficha: no se declara ningun idioma soportado; el rendimiento en castellano es una incognita total y podria ser muy inferior al de modelos que si documentan cobertura multilingue.
- Contexto desconocido: sin longitud de contexto declarada, no es seguro asumir ventanas largas; en GGUF mal configurados, superar el contexto de entrenamiento degrada rapidamente la coherencia.
- Fecha de publicacion anomala: los metadatos indican 2026-09-16, posterior a la fecha de consulta habitual de las fuentes; conviene verificar si se trata de un error de metadatos.
- Uso comercial: la licencia declarada es Apache 2.0, que permitiria uso comercial, pero esa permisividad queda en entredicho mientras no se acredite la licencia del modelo base. Se recomienda asesoramiento legal antes de un despliegue comercial.
- Sin garantias de mantenimiento: el repositorio no muestra actualizaciones posteriores a su creacion.

## Enlaces

- HuggingFace: https://huggingface.co/geantendormi/K2-Horizon-7B-Uno-Uncensored-GGUF
- Paper: no disponible.
- Blog o articulo tecnico del autor: no disponible.
- Repositorio de codigo: no disponible.
- Demo: no disponible.
- Los resultados de busqueda web proporcionados no contienen ningun enlace relacionado con este modelo; todas las referencias devueltas tratan sobre la red social Facebook y no guardan relacion con el artefacto.
