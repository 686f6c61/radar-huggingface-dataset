# cbrigance/Granite-4.1-30b-heretic-GGUF

## Resumen

Granite-4.1-30b-heretic-GGUF es una cuantizacion en formato GGUF del modelo IBM Granite 4.1 de 30 mil millones de parametros, publicada por el usuario cbrigance en Hugging Face. Se trata de una variante "abliterated" (tambien etiquetada como "heretic"), es decir, un ajuste quirurgico de los pesos orientado a eliminar o atenuar los mecanismos de rechazo y alineacion del modelo original, de modo que responda a practicamente cualquier peticion sin las negativas tipicas de un modelo instruct alineado. El resultado se distribuye empaquetado para su uso directo con llama.cpp y Ollama.

El modelo base, ibm-granite/granite-4.1-30b, es un transformer denso de aproximadamente 28.870 millones de parametros segun los pesos en safetensors, con licencia Apache 2.0 y orientado a generacion de texto conversacional en ingles. Esta version GGUF conserva la licencia Apache 2.0 del original y anade las etiquetas propias de los modelos abliterated, incluida la de contenido no apto para todas las audiencias.

Su relevancia es doble: por un lado, permite ejecutar un modelo de 30B en hardware de consumo mediante cuantizacion GGUF; por otro, ofrece a investigadores de seguridad y alineacion un punto de partida para estudiar el comportamiento de un modelo sin capas de rechazo. Conviene subir con cautela: es un derivado de bajo numero de descargas y sin validacion externa, por lo que su calidad y estabilidad no estan contrastadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de ibm-granite/granite-4.1-30b); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 28.865.728.512 (~28,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF cuantizado (niveles concretos Q4, Q5, Q8, etc. no disponibles en la informacion proporcionada) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama) |

## Arquitectura y entrenamiento

La ficha disponible no detalla la arquitectura interna mas alla de su herencia del modelo base IBM Granite 4.1 de 30B, un transformer denso de unos 28,9 mil millones de parametros. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del corpus, ni si el modelo original empleo RLHF, DPO u otras tecnicas de alineacion. Lo unico documentado en las etiquetas es la referencia al paper arXiv:2406.11717, asociado al ecosistema Granite.

La innovacion tecnica de esta publicacion no reside en el entrenamiento sino en el postprocesado: la tecnica "abliteration" o "heretic", que identifica y modifica las direcciones de activacion asociadas al rechazo para reducir la probabilidad de respuestas negativas, sin reentrenar el modelo completo. Posteriormente los pesos resultantes se convierten a GGUF para su ejecucion en CPU y GPU mediante llama.cpp. No se dispone de informacion sobre el procedimiento exacto aplicado, el dataset utilizado para localizar las direcciones de rechazo ni las metricas de degradacion resultantes.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo instruct base.
- Razonamiento y respuesta a instrucciones sin los filtros de rechazo habituales del modelo original.
- Ejecucion local en CPU y GPU mediante llama.cpp y Ollama, gracias al formato GGUF.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que permite servirlo mediante infraestructura compatible con la API de Hugging Face.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Multilingue: limitado al ingles segun los metadatos.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo permite estudiar como responde un LLM de 30B cuando se eliminan sus capas de rechazo, comparando sus salidas con las del Granite 4.1 original para analizar que comportamientos emergen y como se degrada la utilidad general.
- Evaluacion de tecnicas de abliteration: sirve como referencia para medir el impacto de la intervencion sobre los pesos en tareas estandar, contrastando la calidad del derivado frente al modelo base en el mismo hardware.
- Despliegue local en estaciones de trabajo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU de consumo, sin depender de APIs externas ni de conectividad.
- Generacion de texto creativo sin restricciones: escritura de ficcion, dialogos o guiones con tematicas adultas donde un modelo alineado rechazaria la peticion; requiere revision humana del contenido generado.
- Pruebas de robustez y red teaming: uso del modelo como generador de respuestas adversarias para entrenar o validar clasificadores de contenido y sistemas de moderacion.
- Prototipado de pipelines conversacionales en ingles: integracion en aplicaciones de chat locales mediante la API compatible de Ollama o llama.cpp, con la ventaja de no enviar datos a terceros.
- Analisis de sesgos y toxicidad: al carecer de filtros de rechazo, facilita la obtencion de muestras para auditar sesgos del modelo base y de sus derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones comparativas con el modelo base o con otras variantes abliterated.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 23,7 GB, lo que sugiere cuantizaciones de aproximadamente 4 a 5 bits por peso para los 28,9B parametros. Una cuantizacion Q4 requiere del orden de 17-20 GB de VRAM o memoria unificada; Q8 se acercaria a los 30 GB.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para cuantizaciones altas y contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizaciones Q4/Q5.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 con cuantizaciones de 4-5 bits; en GPUs de 12-16 GB solo mediante cuantizaciones muy agresivas o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con la API de Hugging Face (etiqueta endpoints_compatible). vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que su uso requeriria convertir los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran de la cuantizacion, del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| cbrigance/Granite-4.1-30b-heretic-GGUF | ~28,9B | No disponible | GGUF | Apache 2.0 | Derivado abliterated, solo ingles, acceso restringido, 0 descargas |
| ibm-granite/granite-4.1-30b | ~28,9B | No disponible en la informacion proporcionada | Safetensors | Apache 2.0 | Modelo original alineado; referencia para comparar el efecto de la abliteration |
| Otras variantes abliterated de la familia Granite | No disponible | No disponible | GGUF / safetensors | Apache 2.0 | No se dispone de datos verificados en la informacion proporcionada |
| Modelos densos de ~30B en GGUF (familia Llama, Qwen) | ~30B | No disponible | GGUF | Licencias variables | Alternativas de tamano comparable; no se dispone de comparacion de rendimiento |

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de los mecanismos de rechazo implica que puede generar contenido ofensivo, ilegal o danino sin filtros; la etiqueta not-for-all-audiences lo advierte explicitamente.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia publica de calidad, estabilidad ni de que la cuantizacion sea correcta.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que limita su distribucion automatica en pipelines.
- Solo ingles: los metadatos declaran unicamente el idioma en; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos de 30B y potencialmente agravado por la intervencion sobre los pesos, que puede degradar capacidades generales.
- Sesgos: no se han publicado evaluaciones de sesgo para este derivado; los sesgos del modelo base se conservan y pueden amplificarse.
- Contexto desconocido: no se especifica la longitud de ventana soportada, lo que impide planificar casos de uso con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado y de las modificaciones introducidas.
- Caveat de produccion: no se recomienda su uso en sistemas orientados al usuario final sin moderacion adicional y sin una evaluacion propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbrigance/Granite-4.1-30b-heretic-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-30b
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2406.11717
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
