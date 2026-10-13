# mradermacher/Gemma-4-14B-A4B-Heretic-GGUF

## Resumen

Gemma-4-14B-A4B-Heretic-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo blascotobasco/Gemma-4-14B-A4B-Heretic, publicado por mradermacher, un autor conocido por generar versiones cuantizadas de modelos abiertos. No se trata por tanto de un modelo entrenado desde cero, sino de una conversión de pesos a GGUF para su uso con llama.cpp y otros runners compatibles. El modelo base, segun el nombre, apunta a la familia Gemma en su cuarta generacion, con 14.000 millones de parametros y un esquema de tipo A4B, y el sufijo Heretic sugiere una variante ajustada sobre el modelo original, aunque la model card no detalla el proceso.

El dato de parametros totales confirmado en safetensors es de 13.808.740.766 parametros, muy proximo a los 14B que indica el nombre. El repositorio ocupa 100,6 GB e incluye 12 cuantizaciones distintas, desde Q2_K (6,0 GB) hasta Q8_0 (14,8 GB). La model card es minimalista: no declara licencia, no documenta el dataset de entrenamiento, no incluye resultados de benchmarks y solo indica el idioma ingles.

Su relevancia practica es de tipo operativo: permite ejecutar un modelo de ~14B con arquitectura presumiblemente dispersa en hardware de consumo, algo que un modelo denso de ese tamano dificilmente permitiria con la misma velocidad. Ahora bien, al no existir informacion publicada sobre licencia, contexto, entrenamiento o evaluaciones, su adopcion en produccion exige verificar previamente estas cuestiones en el repositorio del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo A4B del nombre sugiere arquitectura dispersa tipo MoE, sin confirmar en la informacion disponible) |
| Parametros totales | 13.808.740.766 (dato real de safetensors) |
| Parametros activos | no disponible (el nombre A4B sugiere aproximadamente 4B activos, no verificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura en la model card del repositorio. Todos los indicios proceden del nombre del modelo: 14B de parametros totales y la etiqueta A4B, que en la nomenclatura empleada por Google para modelos con parametros efectivos reducidos apunta a un esquema de mezcla de expertos con un subconjunto de parametros activos por token. Esta interpretacion no esta confirmada por el autor de la cuantizacion ni por documentacion del modelo base.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el volumen de tokens, la composicion del dataset, la existencia de fases de ajuste por instrucciones, RLHF o DPO, ni la naturaleza concreta del ajuste Heretic. El repositorio es exclusivamente una conversion de pesos del modelo base a GGUF, por lo que cualquier detalle sobre entrenamiento, tokenizador o innovaciones de atencion debe consultarse en blascotobasco/Gemma-4-14B-A4B-Heretic, no en este repositorio.

## Capacidades

- Generacion de texto conversacional: la etiqueta conversational del repositorio indica un modelo orientado a dialogos de tipo chat.
- Compatibilidad con endpoints: incluye el tag endpoints_compatible, lo que facilita su despliegue en infraestructuras de inferencia compatibles con la API estandar.
- Ejecucion local mediante llama.cpp y derivados: al estar en GGUF, funciona en CPU, GPU e hibridos.
- Capacidades especificas de razonamiento, codigo, matematicas, vision, tool calling o agentes: no disponible, no documentadas en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card solo declara ingles.
- Modo de pensamiento o cualquier capacidad especial: no disponible.

## Casos de uso

- Despliegue local en estacion de trabajo con GPU de consumo: con la cuantizacion Q4_K_M (9,3 GB) el modelo puede cargarse en tarjetas de 12 GB o superiores, lo que permite tener un modelo de ~14B residente en local sin depender de servicios externos.
- Prototipado de asistentes conversacionales en ingles: la orientacion conversacional del modelo base lo hace adecuado para construir demos de chat multi-turno antes de decidir un despliegue definitivo.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 12 variantes del mismo modelo, lo que permite medir la degradacion de calidad entre Q2_K y Q8_0 sobre una misma tarea y elegir el compromiso tamano/calidad adecuado.
- Inferencia en servidores sin GPU dedicada: las variantes Q2_K (6,0 GB) y Q3_K_S (6,9 GB) hacen viable la ejecucion en CPU con memoria RAM suficiente, util para entornos de pruebas o nodos de bajo coste.
- Integracion en pipelines de agentes locales: al exponerse como GGUF y soportar endpoints compatibles, puede conectarse a orquestadores de agentes que consuman una API compatible con OpenAI.
- Investigacion sobre modelos ajustados: el sufijo Heretic lo convierte en objeto de estudio para analizar como un ajuste de este tipo modifica el comportamiento del modelo base en tareas de rechazo o seguridad, siempre dentro de los terminos de uso aplicables.
- Fine-tuning ligero posterior: aunque el repositorio no incluye pesos en precision completa, la disponibilidad del modelo base en safetensors permite partir de el para ajustes adicionales y reutilizar despues estas cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco hay comparaciones con modelos similares. Cualquier cifra de rendimiento tendria que obtenerse mediante evaluacion propia sobre las cuantizaciones publicadas.

## Requisitos de hardware

Las cifras de VRAM son estimaciones calculadas a partir del tamano de los ficheros GGUF publicados, anadiendo un margen para la cache KV y el overhead del runtime. No proceden de documentacion oficial.

| Cuantizacion | Tamano | VRAM estimada | GPU de referencia |
|---|---|---|---|
| Q2_K | 6,0 GB | ~8 GB | RTX 3060 8 GB, RTX 2070 |
| Q3_K_S | 6,9 GB | ~9 GB | RTX 3060 12 GB |
| Q3_K_M | 7,5 GB | ~10 GB | RTX 3060 12 GB |
| Q3_K_L | 7,8 GB | ~10 GB | RTX 3060 12 GB |
| IQ4_XS | 7,9 GB | ~10 GB | RTX 3060 12 GB |
| Q4_K_S | 8,6 GB | ~11 GB | RTX 3060 12 GB, RTX 4070 |
| Q4_K_M | 9,3 GB | ~12 GB | RTX 3060 12 GB, RTX 4070 |
| Q5_K_S | 10,0 GB | ~13 GB | RTX 4070 Ti, RTX 4080 |
| Q5_K_M | 10,6 GB | ~14 GB | RTX 4080 16 GB |
| Q6_K | 12,4 GB | ~16 GB | RTX 4080 16 GB, RTX 4090 |
| Q8_0 | 14,8 GB | ~18 GB | RTX 4090 24 GB |

- Cabe en GPU de consumo: si, en el rango de 8 GB a 24 GB segun cuantizacion. Las variantes Q4_K_S, Q4_K_M, Q5_K_S y Q5_K_M estan marcadas por el autor como rapidas y recomendadas.
- GPU de datacenter: A100, H100 y L40S ejecutan cualquier cuantizacion del repositorio sin restricciones de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier servidor GGUF compatible. Para vLLM o TGI habria que usar los pesos en safetensors del modelo base, no estos ficheros.
- Latencia y throughput: no disponible. Si la arquitectura es realmente dispersa con unos 4B de parametros activos, el throughput deberia ser superior al de un modelo denso de 14B, pero no hay mediciones publicadas que lo confirmen.
- El repositorio tiene 100,6 GB en total, por lo que conviene descargar unicamente la cuantizacion necesaria en lugar de clonar el repositorio completo.

## Comparativa con modelos similares

Los datos del modelo base no estan publicados, de modo que la columna correspondiente queda como no disponible. Las alternativas se incluyen como referencia de categoria y sus cifras proceden de informacion publica de cada proyecto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma-4-14B-A4B-Heretic-GGUF | 13,8B totales (activos no disponibles) | no disponible | no disponible | GGUF en HuggingFace |
| Qwen3-14B | 14,8B | 32K nativo, ampliable a 131K con YaRN | Apache 2.0 | safetensors y multiples cuantizaciones |
| Gemma-3-12B-IT | 12B | 128K | Terminos de uso de Gemma | safetensors y cuantizaciones de terceros |
| Mistral-Nemo-12B-Instruct | 12B | 128K | Apache 2.0 | safetensors y cuantizaciones de terceros |

No es posible establecer una comparacion de rendimiento porque no existen benchmarks publicados para este modelo. La comparacion queda limitada a disponibilidad, licencia y formato.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia, lo que impide determinar si el uso comercial esta permitido. Antes de cualquier despliegue en produccion hay que verificar la licencia en el repositorio del modelo base, blascotobasco/Gemma-4-14B-A4B-Heretic, y en su caso en los terminos de la familia Gemma.
- Origen del ajuste Heretic sin documentar: no se especifica que tecnica se aplico ni como afecta al comportamiento del modelo. Los ajustes orientados a modificar o eliminar comportamientos de rechazo pueden incrementar la probabilidad de generar contenido inapropiado o de ignorar instrucciones de seguridad.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual. Como en cualquier modelo de esta escala, la verificación de salidas es obligatoria en aplicaciones sensibles.
- Limitacion idiomatica: el unico idioma declarado es el ingles. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Contexto desconocido: al no publicarse la longitud de contexto soportada, no se puede planificar el uso con documentos largos ni configurar la cache KV con criterio.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K introducen perdida de calidad apreciable. El propio autor marca Q3_K_M como de calidad inferior y recomienda Q4_K_S, Q4_K_M y Q8_0.
- Ausencia de benchmarks: no hay ninguna metrica que permita situar el modelo frente a alternativas, lo que obliga a evaluarlo por cuenta propia.
- Datos de la model card limitados: no se documentan sesgos conocidos, datos de entrenamiento ni limitaciones declaradas por el autor.
- Repositorio pesado: 100,6 GB en total, con 698 descargas y 1 like en el momento de la consulta, lo que indica una adopcion muy baja y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gemma-4-14B-A4B-Heretic-GGUF
- Modelo base: https://huggingface.co/blascotobasco/Gemma-4-14B-A4B-Heretic
- Cuantizaciones ponderadas e imatrix: https://huggingface.co/mradermacher/Gemma-4-14B-A4B-Heretic-i1-GGUF
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#Gemma-4-14B-A4B-Heretic-GGUF
- Solicitudes de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de referencia: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
