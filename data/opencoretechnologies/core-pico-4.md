# OpenCOReTechnologies/CORe-Pico-4

## Resumen

CORe Pico 4 es un modelo de lenguaje causal de 1,72 mil millones de parámetros (1.720.574.976 según los pesos en safetensors) publicado por OpenCOReTechnologies en HuggingFace. Se presenta como la entrada de razonamiento de la línea "Pico": un modelo compacto que responde de forma directa a preguntas simples y activa razonamiento paso a paso cuando el problema lo requiere, mediante la instrucción `/think` en el system prompt ("Conditional Reasoning"). Está pensado para ejecutarse en un portátil, con soporte nativo de conversación multi-turno y emisión de bloques JSON `<tool_call>` cuando se le proporcionan herramientas.

Técnicamente es un decoder transformer de 28 capas con grouped-query attention, tokenizador BPE de 151.936 tokens con plantilla de chat nativa y una ventana de contexto de 40.960 tokens. La model card indica que es un derivado modificado de un checkpoint con licencia Apache-2.0 (las etiquetas del repositorio incluyen `qwen3`), adaptado por CORe Technologies, y que se distribuye también en formato GGUF en tres cuantizaciones (f16, q8_0 y q4_k_m), lo que permite ejecutarlo en llama.cpp, LM Studio u Ollama sin código personalizado.

Su relevancia actual es la de los modelos pequeños orientados a despliegue local: 3,4 GB en bf16 y tan solo 1,1 GB en q4_k_m, con contexto de 40.960 tokens, razonamiento condicional y tool calling en un único checkpoint. El propio autor advierte de que se trata de un modelo de 1,7B: comete errores factuales, tiene dificultades con la aritmética y su profundidad de razonamiento se degrada a medida que avanza la conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder, 28 capas, grouped-query attention (GQA) |
| Parametros totales | 1.720.574.976 (≈1,72 B) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | bf16 (pesos originales en safetensors); GGUF: f16 (~3,4 GB), q8_0 (~1,9 GB), q4_k_m (~1,1 GB) |
| Idiomas soportados | No disponible (el autor indica "English-first"; no se declara lista oficial de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, `model.safetensors`, 3,4 GB) y GGUF (`gguf/CORe-Pico-4-f16.gguf`, `gguf/CORe-Pico-4-q8_0.gguf`, `gguf/CORe-Pico-4-q4_k_m.gguf`) |
| Tokenizador | BPE de 151.936 tokens con plantilla de chat nativa |
| Tamano del repositorio | 3,5 GB |
| Libreria | transformers (carga con `AutoModelForCausalLM`, sin codigo personalizado) |
| Fecha de creacion en HuggingFace | 2026-09-16 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La model card describe una arquitectura de decoder transformer de 28 capas con grouped-query attention, un tokenizador BPE de 151.936 tokens y una ventana de contexto de 40.960 tokens. El modelo se distribuye como un derivado modificado de un checkpoint original con licencia Apache-2.0; el README indica expresamente que no existía fichero NOTICE en el original y que, conforme a la sección 4 de Apache-2.0, el propio README sirve como aviso de modificación. Las etiquetas del repositorio incluyen `qwen3`, lo que apunta a una base de la familia Qwen 3, aunque el autor no detalla qué checkpoint concreto ni el alcance de las modificaciones.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. La única innovación técnica documentada es el denominado "Conditional Reasoning": al insertar `/think` en el system prompt, el modelo decide cuándo razonar paso a paso y cuándo responder directamente. El autor advierte de que la profundidad del razonamiento se degrada con la longitud de la conversación y que el primer intercambio es el que obtiene el razonamiento más profundo. La plantilla de chat está incrustada en los ficheros GGUF, de modo que llama.cpp y LM Studio la detectan automáticamente.

## Capacidades

- Generacion de texto conversacional: respuestas directas y breves ante preguntas simples (por ejemplo, "Paris" para la capital de Francia, según la model card).
- Razonamiento condicional paso a paso: se activa con `/think` en el system prompt y solo se aplica cuando el modelo estima que el problema lo requiere.
- Conversacion multi-turno nativa mediante la plantilla de chat incluida en el tokenizador y en los GGUF.
- Tool calling: emite bloques JSON `<tool_call>` parseables cuando se le proporcionan herramientas en la peticion.
- Respuestas de identidad consistentes ante formulaciones habituales ("I'm CORe Pico 4, an AI model developed by CORe Technologies").
- Ejecucion local en hardware de gama baja, incluida CPU, gracias a las cuantizaciones GGUF.
- No se documentan capacidades de vision, audio, multimodalidad ni modo de pensamiento explicito mas alla de `/think`.
- No se documenta soporte multilingue; el autor indica que el modelo esta optimizado para ingles.

## Casos de uso

- Asistente conversacional local en portatil: con la cuantizacion q4_k_m (~1,1 GB) el modelo cabe en practicamente cualquier equipo y mantiene conversaciones multi-turno con la plantilla de chat nativa, sin enviar datos a servicios externos.
- Clasificacion y extraccion con salida estructurada: al emitir bloques `<tool_call>` en JSON, puede usarse para convertir texto libre en llamadas a funciones tipadas (por ejemplo, extraer entidades y mapearlas a parametros de una API interna).
- Enrutador u orquestador en pipelines de agentes: por su tamano, es viable como primer salto que decide que herramienta invocar o que submodelo debe atender la peticion, delegando el razonamiento profundo a un modelo mayor.
- Atencion al cliente basada en FAQ: la plantilla de chat y la tendencia a respuestas directas y cortas encajan en flujos de preguntas frecuentes donde se busca una contestacion breve y verificable.
- Procesamiento por lotes en pipelines de datos: normalizacion, reescritura o etiquetado de texto a gran escala, donde el coste por token y la posibilidad de ejecutar en CPU importan mas que la precision factual.
- Pruebas de integracion y CI: sirve como modelo de referencia ligero para validar plantillas de chat, integraciones con llama.cpp/TGI o harness de evaluacion sin consumir GPU de gama alta.
- Generacion asistida con trazabilidad de razonamiento: en tareas de analisis donde interesa ver los pasos intermedios, `/think` expone el razonamiento en la primera interaccion; conviene usarlo como borrador revisable y no como resultado final.
- Prototipado de producto en edge: con 1,1 GB en q4_k_m es desplegable en dispositivos con memoria limitada para demos de asistente conversacional o interfaces de voz con backend local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion estandar, y la busqueda web realizada no ha devuelto documentacion tecnica adicional sobre el modelo (los resultados obtenidos corresponden a paginas de soporte de Microsoft, sin relacion con el modelo). Las unicas afirmaciones de rendimiento son cualitativas y proceden del propio autor: respuestas directas en preguntas simples, razonamiento mas profundo en el primer intercambio de la conversacion, dificultades reconocidas con la aritmetica y riesgo de afirmar hechos incorrectos.

## Requisitos de hardware

- Pesos en bf16 (safetensors, 3,4 GB): se estima un consumo total de VRAM en torno a 4-6 GB con contextos cortos, sumando pesos y cache KV.
- GGUF q8_0 (~1,9 GB): se estima un consumo en torno a 3-4 GB.
- GGUF q4_k_m (~1,1 GB): se estima un consumo en torno a 2-3 GB; es la opcion mas adecuada para equipos con poca memoria.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 8 GB y RTX 4090; tambien es ejecutable en CPU con llama.cpp. Tambien es viable en GPUs de datacenter (A100, H100) para servir muchas instancias en paralelo.
- Advertencia del autor: por encima de 8.000 tokens de contexto, la cache KV crece lo suficiente como para aumentar de forma apreciable el uso de memoria y ralentizar la generacion en hardware de gama baja.
- Opciones de despliegue documentadas: transformers, llama.cpp (`llama-cli`), LM Studio y Ollama. El repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que TGI y los endpoints de HuggingFace son compatibles. No se confirma soporte de vLLM en la informacion disponible.
- Latencia y throughput: no disponible (no se publican mediciones de tokens por segundo ni de latencia).
- Calculo exacto de la cache KV: no disponible, ya que no se especifica el numero de cabezas KV ni la dimension por cabeza.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica; los de CORe Pico 4, de su model card. No hay benchmarks comparativos publicados para CORe Pico 4, por lo que la comparacion es exclusivamente estructural.

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| CORe Pico 4 | 1,72 B | 40.960 tokens | Apache-2.0 | safetensors (bf16), GGUF f16/q8_0/q4_k_m | Derivado de un checkpoint Apache-2.0 con etiqueta `qwen3`; razonamiento condicional con `/think`; tool calling |
| Qwen3-1.7B | 1,7 B | 32.768 tokens nativos (extensible con YaRN) | Apache-2.0 | safetensors, GGUF | Base probable del modelo segun las etiquetas del repositorio; sin razonamiento condicional documentado |
| Llama 3.2 1B | 1,23 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto muy superior; licencia con restricciones para algunos usos |
| Gemma 3 1B | 1 B | 32.000 tokens | Gemma Terms of Use | safetensors, GGUF | Multilingue declarado; licencia con condiciones de uso |

No se dispone de datos de rendimiento comparado (benchmarks) entre estos modelos y CORe Pico 4 en la informacion proporcionada.

## Limitaciones y advertencias

- El autor reconoce explicitamente que el modelo afirmara hechos incorrectos, tendra dificultades con la aritmetica e improvisara cuando no sepa algo; las respuestas deben tratarse como punto de partida y no como verdad verificada.
- Riesgo de alucinacion elevado por su tamano (1,7B); en dominios factuales, medicos, legales o financieros requiere verificacion humana.
- Profundidad de razonamiento decreciente: el propio autor indica que el razonamiento se degrada a medida que avanza la conversacion y que el primer intercambio obtiene el razonamiento mas profundo.
- Idioma: el modelo esta optimizado para ingles ("English-first") y no se declara lista oficial de idiomas soportados; el rendimiento en castellano no esta documentado.
- Consistencia de identidad: las respuestas sobre si mismo son fiables en formulaciones comunes, pero pueden desviarse con redacciones muy inusuales.
- Contexto largo: por encima de 8.000 tokens la cache KV aumenta el consumo de memoria y ralentiza la generacion en hardware de gama baja; el autor afirma estar trabajando en ello.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y de indicar los cambios. El README del repositorio actua como aviso de modificacion segun la seccion 4 de la licencia, ya que el checkpoint original no incluia fichero NOTICE.
- Trazabilidad limitada: no se detalla el checkpoint base exacto ni la naturaleza de las modificaciones, lo que dificulta reproducir el entrenamiento o auditar los datos utilizados.
- Inconsistencia en la documentacion: el codigo de ejemplo del README usa identificadores en minusculas (`OpenCOReTechnologies/core-pico-4`) distintos del identificador real del repositorio (`OpenCOReTechnologies/CORe-Pico-4`); conviene verificar la ruta antes de ejecutar `from_pretrained`.
- Estado de adopcion: el repositorio registra 0 descargas y 0 likes, sin benchmark ni validacion independiente publicada.
- Idiomas y sesgos: no hay informacion publicada sobre sesgos demograficos, composicion del dataset ni filtrado de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenCOReTechnologies/CORe-Pico-4
- Pesos bf16 (safetensors): https://huggingface.co/OpenCOReTechnologies/CORe-Pico-4/blob/main/model.safetensors
- GGUF f16: https://huggingface.co/OpenCOReTechnologies/CORe-Pico-4/blob/main/gguf/CORe-Pico-4-f16.gguf
- GGUF q8_0: https://huggingface.co/OpenCOReTechnologies/CORe-Pico-4/blob/main/gguf/CORe-Pico-4-q8_0.gguf
- GGUF q4_k_m: https://huggingface.co/OpenCOReTechnologies/CORe-Pico-4/blob/main/gguf/CORe-Pico-4-q4_k_m.gguf
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/
- La busqueda web realizada no ha devuelto papers, blogs, repositorios ni demos adicionales relacionados con este modelo.
