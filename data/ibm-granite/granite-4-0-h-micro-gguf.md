# ibm-granite/granite-4.0-h-micro-GGUF

## Resumen

Granite-4.0-h-micro es un modelo de lenguaje de aproximadamente 3.190 millones de parametros desarrollado por IBM dentro de la familia Granite 4.0. Esta ficha cubre la version cuantizada en formato GGUF publicada en el repositorio `ibm-granite/granite-4.0-h-micro-GGUF`, pensada para su ejecucion local mediante llama.cpp. El modelo base es `ibm-granite/granite-4.0-h-micro` y la cuantizacion ha sido generada y mantenida por el propio equipo de IBM.

El modelo se enmarca en la categoria de modelos pequenos orientados a despliegue en hardware de consumo y entornos con recursos limitados. Su interes principal radica en que combina un tamano reducido con una ventana de contexto de hasta 128.000 tokens (segun las recomendaciones de llama.cpp incluidas en la model card), lo que lo hace util para tareas de recuperacion aumentada, procesamiento de documentos largos y agentes conversacionales en local.

La licencia Apache 2.0 facilita su adopcion tanto en investigacion como en productos comerciales. La disponibilidad en multiples cuantizaciones GGUF permite ajustar el equilibrio entre calidad y consumo de memoria segun el hardware disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de la familia Granite 4.0; detalles no publicados en la informacion disponible) |
| Parametros totales | 3.191.396.096 (aproximadamente 3,19 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens recomendados en runtime; entrenado hasta 128k |
| Tipos de cuantizacion | multiples cuantizaciones GGUF (la model card usa Q4_K_M como ejemplo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Granite 4.0. El dato destacable que si aparece en la model card es que el modelo no utiliza embeddings posicionales, lo que en la practica permite soportar contextos arbitrariamente largos en inferencia. No obstante, el entrenamiento se realizo sobre texto de hasta 128k tokens, por lo que IBM recomienda limitar el contexto en tiempo de ejecucion a 131.072 tokens para mantener la coherencia.

No se han publicado en la informacion proporcionada detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion lineal. Cualquier afirmacion al respecto requeriria consultar la model card del modelo base.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y se integra con el endpoint `/v1/chat/completions` de llama.cpp.
- Procesamiento de contexto largo: soporta entradas de hasta 128k tokens de entrenamiento, con recomendacion de configurar 131.072 en runtime.
- Compatibilidad con la API de OpenAI a traves de `llama serve`, lo que facilita su integracion en aplicaciones existentes.
- Ejecucion local en CPU y GPU mediante llama.cpp y el formato GGUF.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling, function calling, agentes o modos de razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Procesamiento de documentos largos en local: con una ventana de hasta 128k tokens, el modelo puede resumir o extraer informacion de contratos, informes o expedientes sin necesidad de trocear el texto en fragmentos pequenos, lo que reduce la perdida de contexto entre secciones.
- Asistente conversacional en el puesto de trabajo: al ejecutarse via llama.cpp con la API compatible con OpenAI, puede desplegarse en estaciones de trabajo sin conexion a servicios en la nube, cumpliendo requisitos de privacidad de datos.
- Retrieval-augmented generation (RAG) sobre corpus extensos: la combinacion de contexto largo y tamano reducido permite inyectar muchos pasajes recuperados en un solo prompt manteniendo la latencia y el uso de memoria contenidos.
- Prototipado rapido de aplicaciones LLM: su licencia Apache 2.0 y su formato GGUF permiten a equipos de desarrollo experimentar con pipelines de chat, evaluacion y despliegue sin costes de licencia ni dependencia de proveedores.
- Educacion e investigacion: el modelo puede ejecutarse en portatiles y equipos de laboratorio con GPU de consumo, lo que facilita la experimentacion con tecnicas de prompting, evaluacion y ajuste fino sobre modelos pequenos.
- Automatizacion de tareas de extraccion de informacion: clasificacion de correos, resumen de reuniones o generacion de respuestas plantilla en flujos internos donde el coste por token y la soberania del dato son prioritarios.
- Despliegue en el borde (edge): al caber en cuantizaciones de pocos gigabytes, puede integrarse en dispositivos con recursos limitados para tareas de asistencia textual sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la model card. Como referencia orientativa, un modelo de 3,19 mil millones de parametros en cuantizacion Q4_K_M ocupa del orden de 2 GB de pesos, a los que hay que sumar la memoria para la cache KV, que crece con el contexto configurado.
- GPU recomendadas: no se especifican en la informacion proporcionada. Por tamano, el modelo es apto para GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores; tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, segun el tamano del modelo y la cuantizacion elegida (dato inferido del numero de parametros; no confirmado explicitamente por el autor).
- Opciones de despliegue: llama.cpp mediante `llama cli` y `llama serve`; la model card documenta el uso del endpoint compatible con la API de OpenAI. Otras opciones como Ollama, vLLM o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.
- Build de referencia: llama.cpp `b11798`, Transformers `5.20.2`.
- Recomendacion de contexto: usar `-c 131072` o `--ctx-size 131072` para fijar explicitamente la ventana en runtime.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparacion rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; como todo modelo entrenado con datos web, es probable que herede sesgos presentes en el corpus, pero no se aportan detalles.
- Riesgo de alucinacion: no cuantificado en la model card; debe asumirse el riesgo habitual de los modelos generativos de este tamano y validarse las salidas en produccion.
- Limitaciones de contexto: aunque el modelo soporta contextos arbitrariamente largos en inferencia por no usar embeddings posicionales, fue entrenado hasta 128k tokens; superar ese umbral puede degradar la calidad. Se recomienda fijar `--ctx-size 131072`.
- Idiomas: no se especifica la cobertura linguistica; conviene validar el rendimiento en castellano antes de usarlo en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y aviso de licencia.
- Caveats de produccion: la model card no documenta tool calling, modos de razonamiento ni capacidades multimodales; no deben asumirse sin verificar en el modelo base. Ademas, el rendimiento real dependera de la cuantizacion elegida y del hardware.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-granite/granite-4.0-h-micro-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-micro
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Referencia de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
