# mradermacher/Qwen3.8-27B-Uncensored-Heretic-v3-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones GGUF del modelo OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3, publicadas por el usuario mradermacher (nethype GmbH), especializado en la conversion de pesos a formatos optimizados para inferencia local. El modelo subyacente cuenta con 26.895.998.464 parametros (aproximadamente 26,9 mil millones) y se presenta como una variante "uncensored", "decensored", "abliterated" y con la etiqueta "ara-lora", es decir, una version de un modelo base a la que se le han aplicado tecnicas de eliminacion o supresion de comportamientos de rechazo.

El interes practico de esta publicacion es doble. Por un lado, ofrece el modelo en 10 niveles de cuantizacion distintos (desde Q2_K de 10,8 GB hasta Q8_0 de 28,7 GB), lo que permite desplegarlo en hardware de gama consumer con memoria limitada. Por otro, incluye ficheros mmproj (Q8_0 y f16), lo que indica que el modelo base incorpora un adaptador multimodal, presumiblemente de vision, ademas del componente de lenguaje.

Se trata de un modelo con fecha de publicacion de septiembre de 2026, sin descargas ni valoraciones en el momento de redactar esta ficha, y del que no se han publicado resultados de benchmarks ni detalles de arquitectura o de entrenamiento en la informacion disponible. La licencia declarada es Apache-2.0, pero conviene verificar la procedencia del modelo base antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 (26,9 B aproximadamente) |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; adaptadores mmproj Q8_0 y mmproj f16; variantes i1 (imatrix/weighted) en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (conversion desde pesos HuggingFace, convert_type: hf) |
| Modelo base | OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3 |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 187,9 GB |
| Compatibilidad declarada | transformers, gguf, endpoints_compatible, conversational |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en el material proporcionado. La model card del repositorio de cuantizacion no incluye detalles sobre el tipo de red (transformer denso, MoE, hibrida u otra), la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. El nombre del modelo base sugiere una posible linea derivada de la familia Qwen, pero esto no se confirma en ninguna fuente disponible, por lo que no debe tomarse como un dato verificado.

Lo unico documentado son las tecnicas aplicadas para eliminar el comportamiento de rechazo, recogidas en las etiquetas del repositorio: "abliterated" (ablacion de direcciones de rechazo en el espacio de activaciones), "heretic" (herramienta automatizada de abliteracion), "decensored" y "ara-lora" (presumiblemente un adaptador LoRA empleado en el proceso). Estas intervenciones se aplican sobre los pesos o sobre adaptadores del modelo base y no forman parte de un pipeline de entrenamiento convencional supervisado. La presencia de ficheros mmproj indica, ademas, que el modelo base incorpora una torre multimodal que el proceso de cuantizacion ha preservado de forma separada al cuerpo de lenguaje.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Procesamiento multimodal: el repositorio incluye adaptadores mmproj en Q8_0 y f16, necesarios para habilitar la entrada de imagenes en llama.cpp y derivados. No se detalla que modalidades cubre exactamente.
- Respuestas sin filtros de rechazo: por construccion (abliterated/decensored), el modelo tiende a no negarse a responder ante peticiones que otros modelos alineados rechazarian.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible; debe validarse empiricamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Modo "thinking" explicito: no disponible.
- Capacidades de audio o video: no disponible.

## Casos de uso

- Investigacion en seguridad y red teaming: el modelo permite generar respuestas que modelos alineados rechazarian, lo que lo convierte en una herramienta util para construir conjuntos de prompts adversarios y evaluar la robustez de clasificadores de contenido y filtros de moderacion.
- Generacion de datos sinteticos para entrenar moderadores: se pueden producir pares pregunta-respuesta sobre tematicas sensibles (salud, legal, seguridad) para alimentar clasificadores con ejemplos dificiles que rara vez aparecen en datasets censurados.
- Escritura creativa y ficcion sin restricciones tematicas: narrativa, guiones o roleplay donde el autor necesita tratar violencia, contenido adulto o temas controvertidos sin que el modelo interrumpa la generacion con negativas.
- Despliegue local con privacidad estricta: al distribuirse en GGUF con cuantizaciones desde 10,8 GB, puede ejecutarse en estaciones de trabajo sin conexion a internet, lo que resulta adecuado para entornos con datos confidenciales o air-gapped.
- Asistente conversacional de dominio especifico previo ajuste fino: partiendo de la version Q8_0 o del modelo base en safetensors, se puede aplicar LoRA sobre un corpus propio (legal, industrial, interno) para obtener un asistente especializado en ingles.
- Evaluacion comparativa de tecnicas de abliteracion: sirve como caso de estudio para medir la degradacion de capacidades (perplejidad, coherencia, seguimiento de instrucciones) que introducen los procesos de ablacion, comparando contra el modelo original.
- Prototipado rapido en portatiles con GPU consumer: las variantes Q4_K_S y Q4_K_M (15,7 GB y 16,6 GB) permiten iterar sobre prompts y flujos conversacionales en equipos con 24 GB de VRAM sin coste de API.
- Analisis de documentos con componente visual: gracias a los ficheros mmproj, puede emplearse en flujos de descripcion y extraccion de informacion a partir de imagenes, siempre que se valide previamente la calidad de la torre multimodal en el modelo cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con modelos de tamano similar. Tampoco se documentan mediciones de latencia o throughput. Cualquier cifra de rendimiento deberia obtenerse mediante evaluacion propia antes de tomar decisiones de despliegue.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del tamano de fichero de cada cuantizacion declarado en el repositorio, mas un margen para la cache KV y el contexto. Al no conocerse la longitud de contexto soportada, el margen real puede variar significativamente.

- Q2_K (10,8 GB): requiere alrededor de 12-14 GB de VRAM. Cabe en una RTX 3060 de 12 GB con contexto corto y en una RTX 4070 Ti Super de 16 GB con holgura.
- Q3_K_S / Q3_K_M / Q3_K_L (12,2 / 13,4 / 14,4 GB): adecuadas para GPU de 16 GB como RTX 4060 Ti 16 GB, RTX 4080 o RTX 5070 Ti.
- Q4_K_S / Q4_K_M (15,7 / 16,6 GB): el punto de equilibrio recomendado por el autor ("fast, recommended"). Encajan en RTX 4090, RTX 3090, RTX 5090 o A6000 de 24 GB, dejando entre 7 y 8 GB para contexto y cache KV.
- Q5_K_S / Q5_K_M (18,8 / 19,3 GB): viables en GPU de 24 GB con contexto moderado; con contextos largos puede ser necesario repartir capas a CPU.
- Q6_K (22,2 GB): requiere 24 GB de VRAM con contexto corto o 32 GB en A100 40 GB, V100 32 GB o similares.
- Q8_0 (28,7 GB): necesita al menos 32-40 GB de VRAM. Recomendado en A100 40 GB, H100 80 GB o configuraciones multi-GPU.
- Adaptadores mmproj: anaden 0,7 GB (Q8_0) o 1,0 GB (f16) al consumo, ademas del coste de procesar imagenes, que escala con la resolucion de entrada.
- Opciones de despliegue: llama.cpp (llama-server con soporte mtmd para el modo multimodal), Ollama, LM Studio, llama-cpp-python, text-generation-webui, koboldcpp y otros frontends compatibles con GGUF. vLLM y TGI requeririan convertir o servir el modelo base en safetensors, ya que su soporte de GGUF es limitado o experimental.
- Latencia y throughput: no disponible. Dependera del hardware, de la cuantizacion elegida y de la longitud de contexto efectiva.
- Particion multifichero: el autor remite a los README de TheBloke para el procedimiento de concatenacion de ficheros partidos, si se distribuyen en varias partes.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion rigurosa. La tabla siguiente recoge unicamente lo que puede afirmarse a partir del material disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento comparado |
|---|---|---|---|---|---|
| Este repositorio (mradermacher/Qwen3.8-27B-Uncensored-Heretic-v3-GGUF) | 26,9 B | no disponible | apache-2.0 | GGUF (10 cuantizaciones) | no disponible |
| Modelo base (OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3) | 26,9 B (mismos pesos) | no disponible | apache-2.0 segun el repositorio de cuantizacion | safetensors segun convert_type: hf | no disponible |
| Repositorio i1 (weighted/imatrix) del mismo modelo | 26,9 B | no disponible | apache-2.0 | GGUF (cuantizaciones con imatrix) | no disponible |
| Alternativas de la misma clase (por ejemplo, modelos densos de 25-35 B con licencia permisiva) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

Como referencia cualitativa, en esta franja de parametros suelen encontrarse modelos como Qwen2.5-32B-Instruct, Gemma-2-27B o Mistral Small, pero no se han aportado datos que permitan contrastar parametros, contexto o puntuaciones con el modelo aqui descrito. Se recomienda consultar las fichas oficiales de cada alternativa y ejecutar una evaluacion propia antes de sustituir un modelo en produccion.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no existe evidencia publicada de las capacidades reales del modelo tras el proceso de abliteracion, que habitualmente degrada la coherencia, el seguimiento de instrucciones y el rendimiento en tareas de razonamiento.
- Sesgos: los procesos de decensurado eliminan direcciones de rechazo, pero no corrige sesgos de genero, raza, religion o nacionalidad presentes en los datos de preentrenamiento. Es esperable un aumento de estereotipos y de contenido ofensivo.
- Alucinacion: sin datos de evaluacion no puede acotarse la tasa de invencion de hechos. El riesgo es especialmente relevante en dominios facticos y en la generacion de codigo.
- Idioma: la model card declara unicamente ingles. El uso en castellano no esta soportado oficialmente y probablemente degrade la calidad y aumente la tasa de errores.
- Contexto desconocido: se desconoce la ventana de contexto real, lo que impide planificar flujos de trabajo con documentos largos o conversaciones extensas.
- Eliminacion de salvaguardas: el modelo puede generar contenido danino, ilegal, violento o explicitamente sexual. Es responsabilidad del operador implementar filtros externos y cumplir la normativa aplicable (por ejemplo, la Ley de Servicios Digitales en la UE y la legislacion sobre contenido ilicito).
- Licencia: el repositorio declara apache-2.0, pero se trata de una derivacion de un modelo base de origen comunitario (OS-Software) cuya trazabilidad no esta documentada en el material disponible. Antes de un uso comercial conviene verificar la procedencia de los pesos originales y confirmar que la licencia Apache-2.0 es aplicable en cadena.
- En el caso de pesos derivados de modelos de terceros con licencias especificas, las condiciones de uso comercial pueden ser distintas de las declaradas por el cuantizador.
- Falta de validacion comunitaria: cero descargas y cero valoraciones en el momento del analisis. No hay evidencia de que las cuantizaciones hayan sido probadas por terceros, ni informes sobre artefactos o degradaciones introducidas por la conversion.
- Modo multimodal no documentado: aunque se incluyen ficheros mmproj, no se describe que tareas de vision soporta el modelo, ni su resolucion de entrada, ni la calidad esperada tras la cuantizacion.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden introducir perdidas notables de calidad. El autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0.
- Uso en produccion: sin contexto declarado, sin licencia verificada en cadena y sin evaluaciones, este modelo no deberia desplegarse en entornos de produccion sin una bateria de pruebas propia.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Heretic-v3-GGUF
- Modelo base: https://huggingface.co/OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3
- Cuantizaciones i1 (weighted/imatrix): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Heretic-v3-i1-GGUF
- Pagina de resumen de descargas del modelo: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-Heretic-v3-GGUF
- Peticiones de cuantizacion y preguntas frecuentes del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa propietaria de la infraestructura de cuantizacion (nethype GmbH): https://www.nethype.de/
