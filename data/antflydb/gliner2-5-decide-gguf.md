# antflydb/gliner2.5-decide-gguf

## Resumen

GLiNER2.5 Decide es un modelo de extraccion de informacion y clasificacion de tokens (token classification) desarrollado por Fastino, distribuido en este repositorio por antflydb como un bundle GGUF cuantizado para el runtime de inferencia de Antfly. Se trata de un modelo basado en DeBERTa con 433.921.024 parametros (aproximadamente 434 millones), disenado especificamente para tareas de reconocimiento de entidades nombradas (NER) y extraccion estructurada de informacion mediante el paradigma GLiNER, que permite definir tipos de entidades en tiempo de inferencia sin reentrenamiento.

El modelo base, fastino/GLiNER2.5-Decide, incorpora una cabeza especifica de GLiNER que se distribuye como archivo GGUF separado del codificador. Esta conversion de Antfly aplica cuantizacion Q8_0 a las matrices del codificador manteniendo la cabeza en FP32, y sigue el layout propietario `gliner2_split_bundle/v1` del runtime de Antfly, lo que implica que no es un modelo llama.cpp de archivo unico sino un bundle de multiples ficheros que deben mantenerse juntos con sus rutas relativas.

La relevancia de esta publicacion radica en que permite ejecutar un extractor de entidades de calidad en entornos con recursos limitados, incluyendo navegador via WASM, manteniendo la licencia Apache-2.0 del checkpoint original. No obstante, el autor advierte explicitamente que esta conversion no cualifica para el endpoint publico de decisiones tipadas (typed Decide), ya que el exportador elimina los campos `decide` y `typed_decisions` del checkpoint fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa (encoder transformer) con cabeza GLiNER |
| Parametros totales | 433.921.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (codificador), FP32 (cabeza GLiNER) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (bundle dividido: `gliner2-encoder.Q8_0.gguf` + `gliner2-head.Q8_0.gguf`), safetensors en el checkpoint fuente |

## Arquitectura y entrenamiento

El modelo se basa en un encoder DeBERTa, una arquitectura transformer con attention disentangled que mejora la representacion de posiciones relativas y contenido. Sobre este encoder se anade una cabeza GLiNER que formula la extraccion de entidades como una tarea de clasificacion de spans, permitiendo especificar los tipos de entidad como texto en el momento de la inferencia. Esta es la innovacion central del paradigma GLiNER: a diferencia del NER clasico con un conjunto fijo de etiquetas, el modelo acepta definiciones arbitrarias de tipos de entidad, lo que lo hace adaptable a dominios sin reentrenamiento.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El checkpoint fuente es fastino/GLiNER2.5-Decide en la revision `5a7adf72a23b4d311abae6ce050d7f0012bb3416`, y el fichero `model.safetensors` empleado para la conversion tiene SHA-256 `40a5a23ff860dc3dff426cecd1048cacdd29c648c96db209dad818e9686dc997`. La conversion aplica cuantizacion Q8_0 al encoder mientras mantiene la cabeza en FP32, lo que preserva la precision de la capa de clasificacion final.

## Capacidades

- Extraccion de entidades nombradas (NER) con tipos definidos en tiempo de inferencia.
- Clasificacion de tokens y spans sobre texto en ingles.
- Extraccion estructurada de informacion mediante el paradigma GLiNER.
- Compatibilidad con el runtime de inferencia de Antfly, incluyendo su playground de navegador/WASM.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Capacidades especiales: el checkpoint fuente incluye funcionalidad de decisiones tipadas (`decide`, `typed_decisions`), pero esta conversion las elimina y no cualifica para dicho endpoint.

## Casos de uso

- Extraccion de entidades en pipelines de procesamiento documental: el modelo permite definir tipos de entidad como "persona", "organizacion" o "fecha" en tiempo de inferencia y extraerlas de documentos en ingles sin reentrenamiento, integrándose en flujos de digitalizacion y enriquecimiento de datos.
- Anonimizacion y redaccion de PII: al poder especificar tipos de entidad arbitrarios, se puede configurar para detectar nombres, direcciones y numeros de identificacion en textos antes de almacenarlos o compartirlos, reduciendo el riesgo de exposicion de datos personales.
- Enriquecimiento de bases de datos y busqueda semantica: extraccion de metadatos estructurados (autores, entidades, ubicaciones) a partir de corpus textuales para alimentar indices de busqueda o grafos de conocimiento.
- Procesamiento en el navegador: gracias al bundle dividido y al runtime WASM de Antfly, el modelo puede ejecutarse del lado del cliente para extraer informacion de formularios o documentos sin enviar datos a un servidor, lo que resulta util en aplicaciones con requisitos de privacidad.
- Clasificacion de tickets y correos: identificacion de entidades clave (productos, fechas, departamentos) en comunicaciones de soporte para enrutamiento automatico y priorizacion.
- Preprocesamiento para LLMs: extraccion de entidades y relaciones antes de pasar el texto a un modelo generativo, reduciendo la longitud del contexto y mejorando la precision en tareas de retrieval-augmented generation (RAG).
- Etiquetado asistido en anotacion de datos: generacion de preanotaciones para acelerar la creacion de datasets de NER, con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una prueba de humo del runtime Decide de Antfly con 3/3 casos superados usando los ficheros exactos del bundle y el runtime de extraccion WASM fijado, y advierte que se trata de una prueba de compatibilidad, no de una evaluacion completa de calidad ni entre navegadores. La cuantizacion puede alterar las salidas respecto al checkpoint original. Para datos de evaluacion del modelo fuente, se remite a la model card de Fastino.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 434 millones de parametros en Q8_0, el bundle ocupa alrededor de 0,5 GB en disco; la VRAM necesaria es del orden de 1 GB o menos, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es viable en GPUs de consumo como RTX 3060, RTX 4060 o superiores, e incluso en iGPU modernas.
- Cabe en consumer GPU: si, en practicamente cualquier GPU de consumo actual y en muchos sistemas integrados.
- Opciones de despliegue: runtime de inferencia de Antfly con soporte para `gliner2_split_bundle/v1`, incluyendo su playground de navegador/WASM. No es compatible con llama.cpp como modelo de archivo unico ni con vLLM, TGI u Ollama en su formato actual.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| antflydb/gliner2.5-decide-gguf | 433.921.024 | no disponible | en | Apache-2.0 | GGUF dividido (Q8_0 + FP32) | Bundle para runtime Antfly; sin decisiones tipadas |
| fastino/GLiNER2.5-Decide | no disponible | no disponible | en | Apache-2.0 | safetensors | Checkpoint fuente; incluye decisiones tipadas |
| GLiNER original (urchade) | no disponible | no disponible | multi | Apache-2.0 | safetensors | Paradigma GLiNER base, sin cabeza Decide |
| Modelos NER BERT clasicos | variable | 512 tokens tipico | multi | variable | safetensors | Etiquetas fijas, requieren reentrenamiento |

La comparacion detallada con alternativas de la misma categoria es limitada porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones completas de los modelos competidores.

## Limitaciones y advertencias

- El modelo solo soporta ingles segun los metadatos; el rendimiento en otros idiomas no esta garantizado.
- La cuantizacion Q8_0 puede producir diferencias en las salidas respecto al checkpoint original en FP32.
- Esta conversion elimina las funcionalidades `decide` y `typed_decisions`; no debe usarse para decisiones tipadas. Para ello se requiere un checkpoint FP32 cualificado o el bundle Q8 de 1B separado.
- No es un modelo de archivo unico para llama.cpp; requiere el runtime de Antfly y que todos los ficheros del bundle se mantengan juntos con sus rutas relativas.
- La cualificacion para tareas completas nativas/Metal y documentos largos debe establecerse por separado para estos bytes convertidos.
- La validacion reportada es una prueba de humo de 3/3 casos, no una evaluacion de calidad ni de compatibilidad entre navegadores.
- Riesgo de alucinacion en la extraccion: como todo modelo de clasificacion, puede generar spans incorrectos o atribuir tipos de entidad erroneos, especialmente con definiciones ambiguas.
- Sesgos conocidos: no disponible en la informacion proporcionada; al entrenarse probablemente con datos en ingles, puede heredar sesgos de dominio y geograficos.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los terminos del checkpoint fuente y citar adecuadamente a Fastino y Antfly.
- Para despliegues reproducibles, se debe fijar una revision del repositorio en lugar de usar `main`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/antflydb/gliner2.5-decide-gguf
- Checkpoint fuente: https://huggingface.co/fastino/GLiNER2.5-Decide
- Model card del modelo fuente: https://huggingface.co/fastino/GLiNER2.5-Decide
- Revision del checkpoint fuente: https://huggingface.co/fastino/GLiNER2.5-Decide/tree/main (revision `5a7adf72a23b4d311abae6ce050d7f0012bb3416`)
