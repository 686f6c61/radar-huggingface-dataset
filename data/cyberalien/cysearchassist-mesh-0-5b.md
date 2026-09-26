# cyberalien/CySearchAssist-Mesh-0.5B

## Resumen

CySearchAssist-Mesh-0.5B es un modelo de reescritura de consultas (query rewriting) desarrollado por cyberalien, pensado como componente opcional de busqueda semantica para una biblioteca de mallas estaticas y activos 3D (CyMesh MeshLibrary). Su tarea es convertir la peticion de un usuario en frases de busqueda en ingles, sugerencias de categorias y etiquetas, y exclusiones explicitas, que el sistema anfitrion utiliza despues contra su propio indice de metadatos. No busca activos, no inspecciona geometria ni imagenes, no genera embeddings ni modelos 3D.

Tecnicamente es un ajuste fino mediante LoRA sobre Qwen/Qwen2.5-0.5B-Instruct (revision fijada `7ae557604adf67be50417f59c2c2f167def9a775`), con pesos fusionados y exportados en FP16. El recuento real de parametros en safetensors es de 494.032.768 (aproximadamente 0,49 B), y el repositorio ocupa unos 1,0 GB incluyendo tokenizer y ficheros de configuracion. No requiere adaptador separado ni descarga de los pesos base, y no ejecuta codigo Python remoto (`trust_remote_code=False`).

El modelo es relevante como ejemplo de especializacion extrema de un LLM pequeno para una tarea acotada de recuperacion de informacion en un dominio cerrado (84 conceptos, 10.025 ejemplos sinteticos en cinco idiomas). El propio autor lo etiqueta como opcion ligera experimental y documenta errores semanticos significativos en su benchmark local, por lo que su interes practico esta en despliegues locales de bajos recursos y en flujos donde el JSON generado se valida antes de usarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2, ajustado con LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 (aproximadamente 0,49 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; la model card indica explicitamente que estas exportaciones no son GGUF ni cuantizadas a 4 bits, y que se distribuyen pesos FP16 fusionados |
| Idiomas soportados | ingles, frances, espanol, aleman, italiano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16, pesos fusionados, listos para `transformers`) |

Otros datos de distribucion: tamano del repositorio 1,0 GB; libreria `transformers`; pipeline `text-generation`; compatible con endpoints y con text-generation-inference segun los tags; sin descargas ni likes registrados en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2, y se especializa mediante LoRA durante 2 epocas con semilla 20260923. Posteriormente los adaptadores se fusionan con los pesos base y se exporta el resultado completo en FP16. La model card indica que los hashes del dataset y del prompt quedan registrados en `mesh_query_config.json`, y que no se incluyen mallas del proyecto, indices de biblioteca, conversaciones de usuario, credenciales ni checkpoints de entrenamiento.

Los datos de ajuste provienen de CyMesh, un corpus sintetico de texto con 10.025 ejemplos distribuidos en 84 conceptos y cinco idiomas, con particiones de entrenamiento, validacion y test separadas por concepto (el split de entrenamiento contiene 6.677 ejemplos). No se documenta en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales, ni innovaciones de inferencia como decodificacion especulativa o atencion lineal. La generacion se realiza con decodificacion greedy (`do_sample=False`) en el ejemplo oficial, con un maximo de 256 tokens nuevos.

El contrato de salida es cerrado: el modelo debe producir las claves `mesh_prompt`, `variations` (exactamente dos), `suggested_categories`, `suggested_tags` y `exclude`. El prompt de sistema se almacena en el fichero `mesh_query_prompt.txt`, cuyo SHA-256 debe coincidir con el registrado para mantener el contrato `cymesh-query-v1`.

## Capacidades

- Generacion de texto autoregresiva en cinco idiomas: ingles, frances, espanol, aleman e italiano.
- Reescritura de consultas de busqueda hacia frases en ingles (`mesh_prompt`).
- Generacion de exactamente dos variaciones de la consulta original (`variations`).
- Sugerencia de categorias (`suggested_categories`) y etiquetas (`suggested_tags`) coherentes con el vocabulario de activos 3D.
- Generacion de terminos de exclusion (`exclude`) para filtrar resultados no deseados.
- Salida estructurada en JSON conforme al contrato `cymesh-query-v1`, consumible por un host que valide el resultado.
- Ejecucion local en CPU o CUDA dentro del runtime del anfitrion, sin codigo remoto y sin dependencia de los pesos base por separado.
- No soporta busqueda de activos, inspeccion de geometria de malla o imagenes, generacion de embeddings ni generacion de modelos 3D, segun declara explicitamente el autor.
- No se documenta soporte de tool calling, function calling, modo de razonamiento explicito, capacidades de agente multi-paso, vision ni audio: no disponible.

## Casos de uso

- Busqueda semantica dentro de CyMesh MeshLibrary: el usuario escribe "una silla de madera sin brazos" en cualquiera de los cinco idiomas y el modelo devuelve una consulta en ingles, categorias, etiquetas y exclusiones que el indice de metadatos del anfitrion usa para recuperar activos reales. Es adecuado porque su unica funcion es la reescritura, no la recuperacion.
- Integracion como "Library Query Model" en integraciones existentes: cualquier herramienta que respete el contrato `cymesh-query-v1` puede apuntar a la carpeta descargada del modelo y obtener el mismo formato JSON, con la condicion de que `mesh_query_prompt.txt` conserve su SHA-256 registrado.
- Normalizacion multilingue de consultas en estudios con equipos internacionales: un artista que trabaja en frances o aleman obtiene terminos de busqueda en ingles sin cambiar de herramienta, gracias al entrenamiento en los cinco idiomas declarados.
- Enriquecimiento de metadatos durante la catalogacion: las categorias y etiquetas sugeridas pueden usarse como propuesta inicial para etiquetar nuevos activos, siempre que un bibliotecario o el propio host conserve las categorias manuales existentes.
- Filtrado por exclusiones: el campo `exclude` permite descartar materiales o tipos de objeto no deseados (por ejemplo, variantes con brazos o sin respaldo) antes de ejecutar la busqueda sobre el indice.
- Prototipado de pipelines de query rewriting en local: al pesar unos 1,0 GB y requerir del orden de 3 GiB de RAM en CPU, sirve para validar una arquitectura de busqueda semantica antes de invertir en un modelo mayor.
- Despliegue en entornos sin GPU: el instalador por defecto de CyMesh usa PyTorch en CPU, de modo que el modelo puede operar en estaciones de trabajo modestas; la latencia, eso si, es de segundos por consulta.
- Evaluacion comparativa de tamanos: permite medir el coste en calidad de reducir de una variante de 1,5 B a 0,5 B usando las mismas metricas de contrato JSON y recuperacion documentadas por el autor.

## Benchmarks y rendimiento

La model card publica un unico benchmark tecnico, ejecutado en local sobre un Ryzen 9 7900X con ocho hilos de PyTorch y archivos FP16 cargados para computo FP32 en CPU. El propio autor advierte que es una prueba tecnica pequena, que las expectativas objetivo procedian de nombres de activos y no de anotaciones humanas de relevancia, y que no establece precision general de recuperacion sobre bibliotecas arbitrarias.

| Medicion | Variante 1,5 B | Variante 0,5 B |
|---|---:|---:|
| Contrato JSON valido, 37 consultas | 35/37 | 30/37 |
| Objetivo nombrado en el top cinco, 10 consultas de metadatos | 10/10 | 7/10 |
| Generacion mediana en CPU con el modelo cargado | 15,26 s | 5,23 s |
| RAM pico del proceso, incluida la carga | 8,96 GiB | 3,09 GiB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: aproximadamente 1 GB para los pesos en FP16, mas el overhead del runtime; no requiere cuantizacion para caber en GPU consumer.
- Cabe en cualquier GPU consumer con 4 GB o mas de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores; tambien en iGPU con memoria compartida si el runtime lo permite.
- RAM pico medida en CPU: 3,09 GiB para la variante 0,5 B (frente a 8,96 GiB del modelo de 1,5 B), con los archivos FP16 cargados para computo en FP32.
- CPU de referencia del benchmark: Ryzen 9 7900X con ocho hilos de PyTorch. GPUs de referencia no documentadas (A100, H100, RTX 4090, etc.): no disponible.
- Latencia medida: mediana de 5,23 s por generacion en CPU con el modelo ya cargado. El worker inicial de CyMesh recarga el modelo en cada busqueda, lo que anade latencia de carga no cuantificada en la informacion disponible.
- Opciones de despliegue: `transformers` con CPU (PyTorch por defecto del instalador) o CUDA (requiere un runtime de PyTorch compatible configurado por el usuario); los tags indican compatibilidad con text-generation-inference y endpoints. No hay exportaciones GGUF ni cuantizadas a 4 bits, por lo que llama.cpp y Ollama no son compatibles sin conversion previa.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CySearchAssist-Mesh-0.5B | 494.032.768 | no disponible | 30/37 JSON valido; 7/10 objetivo en top cinco; 5,23 s mediana en CPU; 3,09 GiB RAM | Apache-2.0 | HuggingFace, pesos safetensors FP16 |
| Variante 1,5 B del mismo proyecto | no disponible (citada en la model card) | no disponible | 35/37 JSON valido; 10/10 objetivo en top cinco; 15,26 s mediana en CPU; 8,96 GiB RAM | no disponible | citada en el benchmark del autor |
| Qwen/Qwen2.5-0.5B-Instruct (modelo base) | ~0,5 B | no disponible en esta informacion | no disponible | Apache-2.0 (modelo base) | HuggingFace |
| Otros reescritores de consultas especializados de ~0,5 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con el modelo base es estructural: CySearchAssist-Mesh-0.5B hereda su arquitectura y anade el ajuste LoRA orientado al contrato JSON de busqueda de activos, pero no se publican metricas del base sobre las mismas pruebas, por lo que no puede cuantificarse la mejora aportada.

## Limitaciones y advertencias

- Errores semanticos documentados por el autor: en su benchmark local en CPU, el modelo interpreto una tuberia en espiral como un tubo de helicoptero. Es un fallo de comprension conceptual, no solo de formato.
- Negaciones, sinonimos, ambiguedad multilingue y materiales pueden interpretarse de forma incorrecta, segun advierte la propia model card.
- Tasa de contrato JSON valido limitada: 30 de 37 consultas en la variante de 0,5 B, frente a 35 de 37 en la de 1,5 B. Una de cada cinco peticiones aproximadamente puede producir una salida no parseable.
- Recuperacion limitada: el objetivo nombrado solo aparece en el top cinco en 7 de 10 consultas de metadatos.
- No hay garantia de calidad equivalente entre la variante de 0,5 B y la de 1,5 B; el autor lo indica de forma explicita.
- Dominio de entrenamiento estrecho: 10.025 ejemplos sinteticos y 84 conceptos, con particiones separadas por concepto. El comportamiento fuera de ese vocabulario de activos 3D no esta caracterizado.
- Riesgo de alucinacion en los campos generados: el host debe validar el JSON y no tratar los valores generados como rutas de activos ni como comandos ejecutables. La model card recomienda volver explicitamente al texto original del usuario cuando la salida sea invalida.
- El host debe preservar las categorias manuales y devolver unicamente rutas reales de su propio indice; el modelo no conoce la biblioteca.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben conservarse los ficheros LICENSE, LICENSE.base y NOTICE con la atribucion al modelo base y la declaracion de modificaciones.
- Latencia de produccion: el worker inicial de CyMesh recarga el modelo en cada busqueda, lo que suma tiempo de carga a los 5,23 s de generacion medidos en CPU.
- Sin datos de contexto maximo confirmados en la informacion disponible; conviene validar la longitud efectiva en el despliegue antes de enviar prompts largos.
- Adopcion nula registrada: cero descargas y cero likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- El benchmark publicado no usa anotaciones humanas de relevancia y no establece precision general de recuperacion sobre bibliotecas arbitrarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyberalien/CySearchAssist-Mesh-0.5B
- Modelo base Qwen/Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
