# Dongju-00/stockspoon-pplx-embed-v2-context-9b

## Resumen

Stock Spoon Context-9B LoRA es un adaptador PEFT de tipo LoRA publicado por el usuario Dongju-00 sobre el modelo de embeddings `perplexity-ai/pplx-embed-v2-context-9b-preview`. Su funcion es especializar un modelo de embeddings contextuales de 9.000 millones de parametros en la recuperacion de pasajes relevantes dentro de disclosures corporativos coreanos (OpenDART), es decir, documentos regulatorios de empresas cotizadas en Corea del Sur. No es un modelo generativo: su unico cometido es producir vectores de 1.024 dimensiones para busqueda semantica sobre el cuerpo de texto de los disclosures.

El modelo resuelve un problema concreto: las preguntas financieras que requieren leer el cuerpo del documento (descripcion del negocio, factores de riesgo, planes de crecimiento) no se responden bien con busqueda sobre metadatos o titulos. El adaptador se entrena para localizar el pasaje base que sirve de evidencia, que despues se reordena con un reranker separado y se entrega a un LLM de otro servicio junto con las fuentes. Los datos estructurados, como cifras financieras, se consultan directamente en base de datos, no mediante este modelo.

El adaptador es de octubre de 2026, tiene 46 descargas y ningun "like", y se distribuye bajo licencia MIT. El repositorio contiene unicamente los pesos LoRA (`adapter_model.safetensors`) y su configuracion; no incluye los pesos del modelo base ni el tokenizador. La relevancia actual es acotada: se trata de un experimento piloto de un unico autor, sin benchmarks publicados en la informacion disponible, orientado a un dominio muy especifico y a un unico idioma (coreano).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el modelo de embeddings `perplexity-ai/pplx-embed-v2-context-9b-preview`; la arquitectura del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponible (el adaptador LoRA no declara numero de parametros; el modelo base se denomina "9B") |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | Limite de entrada de 16.384 tokens en la evaluacion del experimento (`context-v5-1024-score06-pilot-01`); el contexto maximo del modelo base no se especifica |
| Tipos de cuantizacion | No disponible para los pesos; la salida vectorial se convierte a INT8 en la evaluacion (tanh, multiplicacion por 127, redondeo y clipping), lo cual es independiente de la cuantizacion de pesos |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | MIT (adaptador); la licencia del modelo base debe consultarse en su repositorio |
| Formato de pesos | `safetensors` (adaptador LoRA) + `adapter_config.json`; requiere PEFT y `trust_remote_code=True` para el modelo base |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT sobre el checkpoint `perplexity-ai/pplx-embed-v2-context-9b-preview`, fijado en la revision `e2c06a779d45e8db53066735be1b98ffe3412ca3`. El modelo base es un encoder de embeddings contextuales: segun la documentacion del autor, los documentos se codifican agrupando los fragmentos en el orden del documento, de modo que el vector de cada fragmento queda influido por los fragmentos vecinos. Las consultas y los documentos usan funciones de codificacion distintas (`encode_queries` para preguntas y `encode` para documentos en la API original).

El entrenamiento se realizo sobre datos de recuperacion construidos a partir de disclosures de OpenDART, continuando desde un checkpoint anterior de la misma linea (`context-v1-pilot-01/adapter-step-000080`). El checkpoint publicado corresponde al paso 10 (`adapter-step-000010`) del experimento `context-v5-1024-score06-pilot-01`. La recuperacion usa vectores de 1.024 dimensiones obtenidos tras la conversion INT8 descrita y una normalizacion L2 posterior. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo de embeddings).

## Capacidades

- Generacion de embeddings de recuperacion para busqueda semantica sobre texto de disclosures corporativos coreanos.
- Codificacion contextual de documentos: el vector de cada fragmento incorpora informacion de los fragmentos contiguos del mismo documento.
- Distincion entre codificacion de consultas y de documentos, con funciones separadas.
- Produccion de vectores de 1.024 dimensiones aptos para indexacion y busqueda por similitud.
- Soporte de entradas de hasta 16.384 tokens en el regimen de evaluacion declarado.
- No genera texto, no responde preguntas, no razona de forma multi-paso y no soporta tool calling ni uso como agente.
- No dispone de capacidades multimodales (vision, audio) segun la informacion disponible.
- Monolingue: coreano.

## Casos de uso

- Busqueda de evidencia en disclosures regulatorios: el adaptador indexa el cuerpo de los documentos de OpenDART y recupera los pasajes que responden a preguntas sobre descripcion del negocio, factores de riesgo o planes de crecimiento, que son cuestiones que exigen leer el texto y no solo los metadatos.
- Pipeline RAG financiero sobre empresas coreanas: los pasajes recuperados se reordenan con un reranker independiente y se entregan a un LLM generativo junto con las fuentes, de modo que el modelo actua como primera etapa de recuperacion.
- Asistencia a analistas de renta variable: consultas en lenguaje natural sobre riesgos declarados por una compania, con devolucion del fragmento original y su procedencia para verificacion manual.
- Auditoria y cumplimiento: localizacion rapida de menciones a factores de riesgo o cambios en el negocio dentro de un historico de disclosures, con trazabilidad al documento fuente.
- Enriquecimiento de bases de conocimiento internas: generacion de embeddings de 1.024 dimensiones para alimentar un indice vectorial propio sobre el que construir buscadores especializados.
- Separacion de responsabilidades en arquitecturas hibridas: el modelo cubre la recuperacion no estructurada mientras las cifras financieras se resuelven por consulta directa a base de datos, lo que reduce el riesgo de que el LLM invente datos numericos.
- Experimentacion e investigacion en recuperacion contextual: el adaptador sirve como punto de partida reproducible (revision fijada, configuracion de conversion documentada) para estudiar el efecto del contexto de fragmentos vecinos en la calidad de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las cifras de rendimiento se anadiran cuando se verifique la evaluacion correspondiente a los pesos subidos, y advierte de que no deben agregarse puntuaciones procedentes de otros datos o configuraciones de recuperacion y reranking.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo base se denomina "9B", lo que en precision FP16 implicaria del orden de 18 GB solo para pesos, pero este dato no se confirma en la informacion proporcionada y debe verificarse en el repositorio del modelo base.
- El adaptador LoRA en si ocupa muy poco espacio; el repositorio reporta 0,0 GB de tamano, aunque la carga efectiva requiere descargar el modelo base completo.
- GPU recomendadas: no disponible. Para un modelo de embeddings de ese orden de magnitud serian necesarias GPU de clase profesional (A100, H100) o consumer de gama alta con memoria suficiente, pero no hay datos publicados que lo confirmen.
- Ajuste en GPU consumer: no confirmado; depende del tamano real y de la cuantizacion posible del modelo base.
- Opciones de despliegue: PEFT para aplicar el adaptador; el modelo base requiere `trust_remote_code=True`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al tratarse de un modelo de embeddings su encaje en esos servidores no esta descrito.
- Latencia y throughput: no disponibles.
- Nota del autor: la conversion de la salida a INT8 no equivale a cargar los pesos en INT8; el consumo de VRAM no debe inferirse del formato del vector de salida.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion cuantitativa con alternativas de embeddings multilingues o especializados en dominio financiero. Como referencia estructural, el unico punto de comparacion documentado es el propio modelo base `perplexity-ai/pplx-embed-v2-context-9b-preview`, del que este adaptador hereda arquitectura, tokenizador y licencia, y sobre el que anade especializacion en disclosures coreanos.

## Limitaciones y advertencias

- Las puntuaciones de recuperacion no son probabilidades de acierto; un score alto no garantiza que el pasaje sea correcto, por lo que hay que verificar el texto original y la fuente.
- El modelo base es una version "preview"; no se garantiza compatibilidad de vectores entre revisiones distintas. Mezclar vectores de checkpoints diferentes en el mismo indice invalida la busqueda.
- Solo cubre coreano; no hay soporte documentado de otros idiomas.
- No es un modelo generativo: no responde preguntas por si mismo y no sustituye a un LLM.
- El repositorio contiene unicamente el adaptador; para ejecutar un servicio de busqueda completo hacen falta el modelo base, el preprocesado de documentos, la codificacion, la busqueda en base de datos y el reranker.
- La reproducibilidad exige fijar la revision del modelo base y la del adaptador, respetar el orden de conversion (tanh, escala 127, redondeo, clipping, seleccion de los primeros 1.024 valores, normalizacion L2) y usar la misma configuracion para consultas y documentos.
- El agrupamiento de fragmentos por documento afecta a los vectores: si cambia la composicion del lote de entrada, cambian los embeddings.
- No hay benchmarks publicados ni resultados de evaluacion verificados en la informacion disponible; el modelo tiene un uso muy limitado (46 descargas) y un unico autor, sin validacion externa conocida.
- Licencia MIT para el adaptador, pero el uso comercial del conjunto depende tambien de la licencia y los avisos de copyright del modelo base, que deben revisarse en su repositorio.
- Riesgo de sesgo y alucinacion: no evaluado en la informacion disponible; en un contexto financiero, la recuperacion deficiente puede propagar errores a las respuestas del LLM que consuma los pasajes.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Dongju-00/stockspoon-pplx-embed-v2-context-9b
- Modelo base: https://huggingface.co/perplexity-ai/pplx-embed-v2-context-9b-preview
- Revision del modelo base fijada: https://huggingface.co/perplexity-ai/pplx-embed-v2-context-9b-preview/tree/main
- Blog de Perplexity sobre embeddings contextuales: https://www.perplexity.ai/hub/blog/contextual-embedding-beyond-the-gold-passage
- Documentacion de PEFT sobre formato de checkpoints: https://huggingface.co/docs/peft/developer_guides/checkpoint
