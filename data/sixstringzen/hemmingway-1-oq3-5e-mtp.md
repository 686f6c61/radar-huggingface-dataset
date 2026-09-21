# sixstringzen/Hemmingway-1-oQ3.5e-mtp

## Resumen

Hemmingway-1-oQ3.5e-mtp es una cuantizacion derivada del modelo Altworld/Hemmingway-1, publicada por el usuario sixstringzen. No es un modelo entrenado desde cero: es una conversion de pesos pensada exclusivamente para MLX y oMLX sobre Apple silicon. El artefacto conserva los tensores de prediccion multi-token (MTP) del modelo original, algo poco habitual en releases cuantizados, y aplica el metodo oQ3.5e de cuantizacion afin de precision mixta con 3 bits como base.

El modelo subyacente tiene 27.320.697.856 parametros (unos 27,3 mil millones) y su arquitectura se identifica como `qwen3_5_text` en el modelo fuente; el artefacto convertido declara `qwen3_5` para encajar con la version de oMLX usada. Esta orientado a generacion de texto y escritura creativa, con el ingles como unico idioma declarado, y se distribuye bajo licencia Apache 2.0.

Su relevancia es practica mas que cientifica: permite ejecutar un modelo de ~27B en equipos Apple silicon con un peso de solo 13,19 GiB, gracias a una mezcla de precisiones que asigna 4, 5 y 8 bits a los tensores mas sensibles segun su importancia de activacion. La contrapartida es que el autor no ha publicado una prueba de generacion ni una comparacion controlada contra el modelo BF16 original, por lo que la paridad de calidad no esta verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia qwen3_5 (el modelo fuente declara `qwen3_5_text`; el artefacto convertido declara `qwen3_5`) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No aplica: no se documenta una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | oQ3.5e: cuantizacion afin de precision mixta con 3 bits de base y grupo de 64; 8 tensores a 4 bits, 72 a 5 bits y 2 a 8 bits; dtypes no cuantizados en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors para MLX, 3 shards, 1.876 tensores indexados (no es GGUF) |
| Cuantizador | oMLX 0.7.0.dev2 |
| Dataset de calibracion | `oqe_code_multilingual`, 128 muestras de 512 tokens, 504 entradas de imatrix |
| Tensores MTP | 29 tensores preservados |
| Tamano del artefacto | 14.164.227.529 bytes (13,19 GiB) |
| Fecha de publicacion | 20 de septiembre de 2026 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base. Hemmingway-1 procede de Altworld y su model card es la que documenta el uso previsto y los detalles de entrenamiento; este repositorio solo contiene pesos convertidos y el informe de cuantizacion asociado, por lo que no se dispone de numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se detalla la longitud de contexto soportada ni la configuracion del tokenizador.

Lo que si esta documentado es el proceso de cuantizacion. Se aplico oQe (enhanced oQ), una variante de cuantizacion afin mixta que usa la importancia de activacion para asignar precision adicional a los tensores sensibles. La base es de 3 bits con grupo de 64, con excepciones de 4, 5 y 8 bits; en concreto, `language_model.model.embed_tokens` y `language_model.lm_head` se mantienen a 8 bits. El informe `oq_imatrix_report.json` registra la pasada de sensibilidad, la calibracion y la cobertura de tensores, y no reporta desajustes de forma matricial ni shards ausentes. La cobertura estricta de imatrix se desactivo para el fallback conocido de `language_model.lm_head`.

La innovacion destacable es la preservacion de los 29 tensores de MTP (multi-token prediction), que permiten en teoria decodificacion asistida prediciendo varios tokens futuros a la vez. El autor advierte que la decodificacion asistida por MTP no se ha evaluado de forma independiente, de modo que su beneficio real en latencia o throughput no esta cuantificado.

## Capacidades

- Generacion de texto en ingles: el pipeline declarado es `text-generation` y el unico idioma soportado es el ingles.
- Escritura creativa y prosa: el repositorio se etiqueta explicitamente con `creative-writing`, lo que sugiere un ajuste orientado a texto literario y narrativo.
- Modo conversacional: la etiqueta `conversational` indica uso en dialogos multi-turno.
- Modo de razonamiento visible: el autor menciona el parametro `enable_thinking`; si se establece en `false`, el modelo produce prosa directa sin planificacion visible.
- Prediccion multi-token (MTP): los tensores estan presentes en el artefacto, aunque no se ha medido su impacto en la generacion.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Vision, audio u otras modalidades: no documentado; el modelo se declara como text-generation.
- Capacidades multilingues: no disponibles; solo ingles.

## Casos de uso

- Escritura creativa asistida en local: el modelo puede generar relatos, dialogos y texto narrativo en ingles directamente en un Mac con Apple silicon, con `enable_thinking` en `false` para obtener prosa sin planificacion intermedia. El sesgo creativo viene marcado por las etiquetas del repositorio y por el nombre del modelo base.
- Asistentes de redaccion en aplicaciones de escritorio para macOS: al ejecutarse sobre MLX, puede integrarse en herramientas nativas de Mac para reescritura, continuacion de texto y ajuste de estilo sin enviar datos a servicios externos.
- Procesamiento de texto con requisitos de privacidad: el peso de 13,19 GiB permite ejecutar el modelo en memoria unificada local, de modo que documentos confidenciales en ingles no salen del equipo. Es util en entornos editoriales, legales o medicos donde el envio a APIs de terceros no es viable.
- Generacion de contenido editorial por lotes: resumenes, reescrituras y variaciones de titulares sobre corpus en ingles, ejecutados de forma desatendida en un equipo Apple silicon con memoria suficiente.
- Investigacion sobre decodificacion MTP: al conservar los 29 tensores de prediccion multi-token, el artefacto sirve como banco de pruebas para estudiar decodificacion especulativa en MLX, comparando la generacion con y sin cabezas MTP.
- Evaluacion de tecnicas de cuantizacion: es un caso de estudio util para medir como afecta oQ3.5e con base de 3 bits a la coherencia y al seguimiento de instrucciones frente al modelo BF16 de origen, especialmente teniendo en cuenta que la calibracion se hizo con un dataset de codigo multilingue y no de prosa.
- Chat conversacional integrado en herramientas de guion o narrativa: la etiqueta `conversational` respalda su uso como asistente de trama, generacion de variantes de escena y desarrollo de personajes en sesiones multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha registrado una prueba de generacion (smoke test) para esta cuantizacion, que no existe una comparacion BF16 controlada y que la decodificacion asistida por MTP no se ha evaluado por separado. Las comprobaciones realizadas son estructurales: tres shards de safetensors, 1.876 tensores indexados y 29 tensores MTP, sin shards ausentes.

## Requisitos de hardware

- Pesos en disco y en memoria: 13,19 GiB (14.164.227.529 bytes) en cuantizacion mixta de 3 bits, mas el overhead de bfloat16 en los tensores no cuantizados.
- Memoria unificada estimada para inferencia: a partir del tamano de los pesos, un minimo practico en torno a 16-18 GB para contextos cortos y 24-32 GB recomendados si se trabaja con contextos largos o lotes. Es una estimacion derivada del tamano del artefacto; el autor no publica cifras de consumo.
- Equipos Apple silicon: Mac con M-series y 16 GB o mas de memoria unificada para el caso minimo; configuraciones Pro con 24-36 GB y Max/Ultra con 64-128 GB para mayor comodidad. No se especifican modelos concretos en la documentacion.
- GPU NVIDIA o AMD: no soportadas de forma directa. Los pesos son safetensors de MLX y el autor no verifica compatibilidad con otros runtimes de MLX ni con versiones anteriores de oMLX.
- Opciones de despliegue: oMLX 0.7.0.dev2 mediante su navegador de modelos, cargandolo como LLM. Al no ser GGUF, no es directamente utilizable en llama.cpp, Ollama ni con convertidores estandar basados en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hemmingway-1-oQ3.5e-mtp (esta ficha) | 27,3 mil millones | No disponible | oQ3.5e, 3 bits de base con mezcla hasta 8 bits; safetensors MLX | Apache 2.0 | HuggingFace; 0 descargas, 0 likes |
| Altworld/Hemmingway-1 (modelo fuente) | 27,3 mil millones (misma base) | No disponible | BF16 original, antes de cuantizar | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer comparaciones con otros modelos de la misma categoria. La busqueda web realizada no devolvio informacion relevante sobre el modelo ni sobre su familia arquitectonica, por lo que no se pueden aportar alternativas comparables con datos verificables.

## Limitaciones y advertencias

- La cuantizacion puede alterar la eleccion de palabras, la coherencia y el seguimiento de instrucciones. No se ha publicado una comparacion controlada contra el modelo BF16 de origen.
- No existe una prueba de generacion registrada para esta build; las verificaciones realizadas son unicamente estructurales (integridad de shards e indices de tensores).
- La calibracion se hizo con `oqe_code_multilingual`, un dataset de codigo multilingue. No se uso un dataset de calibracion especifico de prosa, lo que es relevante en un modelo orientado a escritura creativa.
- Los tensores MTP estan presentes, pero la decodificacion asistida por MTP no se ha evaluado; no hay garantia de mejora en latencia ni en calidad.
- Compatibilidad limitada: requiere MLX y, segun el autor, oMLX 0.7.0.dev2. No se ha verificado el funcionamiento con otros runtimes de MLX ni con versiones anteriores de oMLX.
- Formato no estandar para el ecosistema general: al no ser GGUF, no se puede cargar en llama.cpp, Ollama o TGI sin una conversion adicional no documentada.
- Idioma unico: solo ingles. No hay soporte multilingue declarado, lo que limita su uso en castellano.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no hay evaluaciones de veracidad publicadas para esta build.
- Sesgos: no documentados en la informacion disponible. Se heredan los del modelo base, cuya model card no se reproduce aqui.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.
- Licencia: Apache 2.0, que permite uso comercial, pero se mantienen las condiciones y la atribucion del modelo fuente Altworld/Hemmingway-1.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sixstringzen/Hemmingway-1-oQ3.5e-mtp
- Modelo base: https://huggingface.co/Altworld/Hemmingway-1
- Informe de cuantizacion e imatrix: https://huggingface.co/sixstringzen/Hemmingway-1-oQ3.5e-mtp/blob/main/oq_imatrix_report.json
- Cuantizador oMLX: https://github.com/jundot/omlx
- Resultados de la busqueda web: no se encontro informacion relevante sobre el modelo; los resultados devueltos correspondian a documentacion de Flutter y no guardan relacion con esta ficha.
