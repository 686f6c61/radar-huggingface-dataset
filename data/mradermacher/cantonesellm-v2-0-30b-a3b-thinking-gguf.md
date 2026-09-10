# mradermacher/CantoneseLLM-v2.0-30B-A3B-Thinking-GGUF

## Resumen

CantoneseLLM-v2.0-30B-A3B-Thinking-GGUF es la version cuantizada en formato GGUF del modelo CantoneseLLM-v2.0-30B-A3B-Thinking, publicado originalmente por el usuario hon9kon9ize y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje orientado al cantonés que, segun la nomenclatura de su nombre, emplea una arquitectura de mezcla de expertos (MoE) con aproximadamente 30.000 millones de parametros totales y unos 3.000 millones de parametros activos por token, ademas de un modo de razonamiento explicito (sufijo "Thinking"). La model card publicada no confirma ninguno de estos datos tecnicos, por lo que deben tratarse como inferencias derivadas de la nomenclatura.

La relevancia de esta publicacion es practica: al distribuirse en GGUF con una bateria de cuantizaciones que va desde x-f16 hasta IQ4_XS y Q2_K, permite ejecutar un modelo MoE de 30.000 millones de parametros en hardware de consumo o en servidores modestos, ya que solo se activa una fraccion reducida de la red por token. Esto lo hace atractivo para despliegues locales en contextos cantonohablantes, donde la oferta de modelos ajustados especificamente a ese idioma es limitada.

El repositorio no incluye pipeline, licencia ni lista de idiomas, y en el momento de la consulta acumula 0 descargas y 0 likes, lo que apunta a una publicacion reciente y sin validacion comunitaria. Esta ficha se limita, por tanto, a lo que puede verificarse: el origen del modelo base, las cuantizaciones generadas y una estimacion de requisitos de hardware basada en el tamano declarado en el nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer, inferida de la nomenclatura "A3B" del nombre; no confirmada en la model card |
| Parametros totales | 30.000 millones (segun el nombre del modelo); no confirmado en la model card |
| Parametros activos | Aproximadamente 3.000 millones (sufijo "A3B"); no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible (el nombre indica orientacion al cantonés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (incluye metadatos "quantize_version: 2", "output_tensor_quantised: 1", "convert_type: hf") |

## Arquitectura y entrenamiento

La model card del repositorio no aporta informacion sobre la arquitectura interna, el proceso de entrenamiento ni la composicion del dataset. Lo unico documentado es la cadena de conversion: el modelo parte de `hon9kon9ize/CantoneseLLM-v2.0-30B-A3B-Thinking` y se transforma con el flujo habitual de llama.cpp (metadatos `convert_type: hf`, `quantize_version: 2`), generando las cuantizaciones listadas. El sufijo "Thinking" sugiere la presencia de un modo de razonamiento con cadena de pensamiento explicita, habitual en modelos recientes que separan una fase de deliberacion de la respuesta final, pero no hay confirmacion documental.

Por la nomenclatura "30B-A3B" cabe inferir una arquitectura de mezcla de expertos con enrutamiento disperso, en la que cada token activa un subconjunto reducido de parametros (del orden de 3.000 millones), lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. No se dispone de informacion sobre el numero de tokens de entrenamiento, la mezcla de idiomas del corpus ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Cualquier afirmacion al respecto seria especulativa.

## Capacidades

- Generacion de texto en cantonés: es el proposito declarado por el nombre del modelo base; no hay evaluacion publicada que lo cuantifique.
- Razonamiento explicito: el sufijo "Thinking" apunta a un modo de cadena de pensamiento, sin documentacion tecnica que lo confirme.
- Eficiencia de inferencia por arquitectura MoE: al activar aproximadamente 3.000 millones de parametros por token, el coste de generacion es inferior al de un modelo denso de 30.000 millones.
- Despliegue local: el formato GGUF con multiples niveles de cuantizacion permite ejecucion en CPU, GPU o configuraciones mixtas mediante llama.cpp y derivados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues distintas del cantonés: no disponibles.
- Capacidades adicionales (vision, audio, decodificacion especulativa): no disponibles.

## Casos de uso

- Atencion al cliente en cantonés: un modelo ajustado a este idioma permite desplegar asistentes conversacionales para usuarios de Hong Kong y la region del delta del rio de las Perlas, con la ventaja de que una cuantizacion Q4_K_M o Q5_K_M puede ejecutarse en una unica GPU de 24 GB, reduciendo el coste por consulta frente a APIs externas.
- Subtitulado y traduccion cantonés-ingles o cantonés-mandarin: el modelo puede emplearse en pipelines de post-produccion para generar subtitulos y traducciones, aprovechando su especializacion idiomatica donde los modelos genericos cometen mas errores de registro y vocabulario coloquial.
- Resumen de reuniones y transcripciones: integrado tras un sistema ASR, el modelo puede condensar conversaciones largas en actas estructuradas; la arquitectura MoE mantiene la latencia baja incluso con contextos extensos.
- Analisis de opinion en redes sociales: clasificacion de sentimiento y deteccion de temas en texto coloquial cantonés de foros y plataformas, un dominio donde los modelos entrenados mayoritariamente en mandarin rinden peor.
- Preservacion y ensenanza del idioma: generacion de material didactico, ejercicios y explicaciones gramaticales en cantonés, con despliegue en entornos educativos sin conexion a servicios en la nube.
- Investigacion linguistica: analisis de variacion dialectal y registro mediante generacion controlada y anotacion asistida, con la ventaja de poder ejecutarse en un solo servidor sin depender de APIs comerciales.
- Prototipado rapido en local: gracias a las cuantizaciones Q2_K y Q3_K, es posible validar el comportamiento del modelo en un portatil con GPU de gama media antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K, C-Eval ni equivalentes en cantonés) y la busqueda web realizada no ha devuelto datos relacionados con el modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en el tamano declarado de 30.000 millones de parametros en formato GGUF; no proceden de la model card.

- VRAM estimada para inferencia (solo pesos):
  - x-f16: aproximadamente 60 GB.
  - Q8_0: aproximadamente 32 GB.
  - Q6_K: aproximadamente 25 GB.
  - Q5_K_M: aproximadamente 21 GB.
  - Q4_K_M: aproximadamente 18-19 GB.
  - Q3_K_M: aproximadamente 15-16 GB.
  - Q2_K: aproximadamente 11-12 GB.
  - IQ4_XS: aproximadamente 16-17 GB.
- GPU recomendadas: H100 o A100 de 80 GB para f16 y Q8_0; A100 de 40 GB o L40S para Q6_K y Q5_K; RTX 4090, RTX 3090 o A6000 de 48 GB para Q4_K_M.
- Viabilidad en GPU de consumo: Q4_K_M entra en tarjetas de 24 GB (RTX 3090, RTX 4090) con margen limitado para contexto. Q3_K_M y Q2_K permiten su uso en GPU de 16 GB y 12 GB respectivamente. En tarjetas de 8 GB es necesario descargar parte de las capas a CPU, con la consiguiente perdida de velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y llama-cpp-python son las rutas directas para GGUF. vLLM ofrece soporte GGUF experimental y puede no cubrir todas las cuantizaciones listadas.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la activacion de unos 3.000 millones de parametros por token deberia situar la generacion por encima de la de un modelo denso de 30.000 millones en el mismo hardware, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

No hay datos de rendimiento ni de licencia para este modelo, por lo que la comparacion se limita a parametros estructurales. Cualquier referencia a la posible familia base es una hipotesis derivada de la nomenclatura y no ha sido confirmada.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| CantoneseLLM-v2.0-30B-A3B-Thinking (este modelo) | 30B (segun nombre) | ~3B (segun nombre) | no disponible | no disponible | GGUF |
| Qwen3-30B-A3B (referencia de categoria, base no confirmada) | 30,5B | 3,3B | 128K | Apache 2.0 | safetensors, GGUF |
| Otros modelos cantonohablantes de rango 30B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion de rendimiento entre estas opciones no puede realizarse con la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser un modelo ajustado a un idioma y una region concretos, es probable que herede sesgos del corpus de entrenamiento, pero no hay documentacion que los describa.
- Riesgo de alucinacion: no evaluado. No se han publicado mediciones de fidelidad factual ni de tasas de hallucination para este modelo.
- Limitaciones de contexto: se desconoce la ventana de contexto soportada. Esto impide planificar tareas de contexto largo (analisis de documentos extensos, conversaciones multi-turno prolongadas) con garantias.
- Limitaciones de idioma: la model card no declara idiomas soportados. No hay evidencia de que el modelo mantenga un rendimiento aceptable fuera del cantonés.
- Restricciones de licencia: la licencia figura como "no disponible". Sin una licencia explicita, el uso comercial queda en una situacion juridica ambigua; conviene contactar con el autor del modelo base antes de cualquier despliegue productivo.
- Trazabilidad: este repositorio es una conversion de terceros (mradermacher) sobre el modelo original de hon9kon9ize. Cualquier problema de calidad debe contrastarse con el repositorio fuente.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes ni validacion por parte de la comunidad.
- Produccion: no se recomienda su uso en sistemas criticos sin una evaluacion previa propia, dado que no existen benchmarks publicados ni informacion sobre el proceso de alineacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CantoneseLLM-v2.0-30B-A3B-Thinking-GGUF
- Modelo base: https://huggingface.co/hon9kon9ize/CantoneseLLM-v2.0-30B-A3B-Thinking
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
