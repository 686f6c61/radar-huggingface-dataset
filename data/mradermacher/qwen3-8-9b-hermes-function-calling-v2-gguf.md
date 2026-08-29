# mradermacher/qwen3.8-9b-hermes-function-calling-v2-GGUF

## Resumen

Este repositorio contiene la cuantización en formato GGUF del modelo `JamieBradfield/qwen3.8-9b-hermes-function-calling-v2`, un fine-tune con QLoRA de la familia Qwen3.8 (basada en Qwen3.5) orientado específicamente a function calling y tool use. El autor de la cuantización es mradermacher, que publica los pesos estáticos en varios niveles de precisión (f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K e IQ4_XS) para facilitar su ejecución en entornos locales con llama.cpp, Ollama u otros motores compatibles con GGUF.

El modelo base tiene aproximadamente 9.200 millones de parámetros y está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su propósito principal es dotar a los asistentes conversacionales de la capacidad de invocar herramientas externas de forma estructurada, un requisito habitual en agentes autónomos y pipelines de automatización. La relevancia de esta versión cuantizada radica en que hace accesible un modelo de este tipo en hardware de consumo, sin necesidad de GPUs de gran capacidad.

Se incluyen además archivos `mmproj` (proyector multimodal) en Q8_0 y f16, lo que sugiere que el modelo base podría tener capacidades de visión, aunque no se documenta explícitamente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8, sin detalles adicionales) |
| Parametros totales | 9.195.119.616 (~9,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivos mmproj adicionales) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Por el nombre y los tags, se trata de un fine-tune con QLoRA de un modelo de la serie Qwen3.8 (que a su vez se basa en Qwen3.5), realizado por JamieBradfield y orientado a function calling y tool use. El proceso de cuantizacion a GGUF ha sido realizado por mradermacher mediante conversion estatica de los pesos originales en formato Hugging Face. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Function calling y tool use: el modelo esta especificamente entrenado para generar llamadas a herramientas estructuradas, lo que permite su integracion en agentes que necesitan invocar APIs o funciones externas.
- Generacion de texto conversacional: soporta dialogos multi-turno, aunque no se especifica la longitud maxima de contexto.
- Posible soporte multimodal: la presencia de archivos `mmproj` sugiere que el modelo base podria procesar imagenes, pero no hay documentacion que lo confirme.
- Idiomas: solo ingles declarado.

## Casos de uso

- Agentes autonomos con tool calling: el modelo puede decidir que herramienta invocar y con que argumentos, lo que lo hace adecuado para asistentes que consultan bases de datos, llaman a APIs o ejecutan acciones en sistemas externos.
- Asistentes de atencion al cliente: al estar fine-tuneado para conversacion y function calling, puede gestionar consultas de usuarios y, cuando sea necesario, consultar sistemas de ticketing o CRM mediante herramientas.
- Automatizacion de tareas de oficina: integrado en un pipeline, puede redactar correos, crear eventos de calendario o buscar informacion en la web a traves de herramientas definidas por el desarrollador.
- Prototipado rapido de agentes: gracias a su tamano (9B) y a la disponibilidad de cuantizaciones GGUF, se puede desplegar en una estacion de trabajo con GPU de gama media para experimentar con arquitecturas de agentes.
- Educacion e investigacion: util para estudiar tecnicas de fine-tuning orientadas a tool use, ya que el modelo base y sus cuantizaciones estan publicamente disponibles con licencia permisiva.
- Despliegue en edge o servidores modestos: con cuantizaciones como Q4_K_M o Q3_K_M, el modelo puede ejecutarse en CPUs o GPUs con poca VRAM, habilitando asistentes locales sin conexion a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su version base.

## Requisitos de hardware

- El archivo f16 ocupa 18,5 GB, por lo que para cargarlo en memoria se necesitan al menos 20 GB de RAM/VRAM.
- Las cuantizaciones de menor precision (Q4_K_M, Q3_K_M, Q2_K) reducen significativamente el espacio, aunque no se indican tamanos exactos en la model card. Como referencia, un modelo de 9B en Q4 suele ocupar entre 5 y 6 GB, y en Q8 alrededor de 10 GB.
- Para inferencia en GPU, se recomienda una tarjeta con al menos 8 GB de VRAM para las cuantizaciones Q4/Q5, y 12 GB o mas para Q6/Q8.
- En CPU, es posible ejecutar las cuantizaciones mas pequenas con llama.cpp, aunque la velocidad sera limitada.
- Motores compatibles: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier otro que soporte GGUF.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente con alternativas. A nivel de especificaciones, se puede contrastar con otros modelos de function calling de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| qwen3.8-9b-hermes-function-calling-v2 (este) | 9,2 B | No disponible | Apache 2.0 | GGUF |
| Qwen2.5-7B-Instruct | 7,6 B | 128 K (segun documentacion oficial) | Apache 2.0 | Safetensors, GGUF |
| Llama-3.1-8B-Instruct | 8,0 B | 128 K | Llama 3.1 Community License | Safetensors, GGUF |

La comparacion es limitada porque no se conocen ni el contexto ni los resultados de benchmarks de este modelo. Su ventaja principal es la especializacion en function calling, mientras que los otros son modelos generalistas.

## Limitaciones y advertencias

- Solo se declara soporte para ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- No hay informacion sobre sesgos, alucinaciones o comportamientos problematicos. Al ser un fine-tune de un modelo base no documentado, estos riesgos no estan evaluados.
- La cuantizacion puede introducir perdida de calidad en tareas complejas, especialmente en las de menor precision (Q2_K, Q3_K).
- El contexto maximo no esta especificado, lo que puede limitar su uso en conversaciones muy largas o documentos extensos.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base podria tener restricciones adicionales no reflejadas en esta ficha; se recomienda revisar la documentacion de JamieBradfield.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de function calling es desconocido.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/qwen3.8-9b-hermes-function-calling-v2-GGUF
- Modelo base original: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v2
- Version GGUF con cuantizacion ROCmFPX del mismo modelo: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v2-GGUF
- Version v1 del fine-tune: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v1-GGUF
- Pagina de descargas y vision general de mradermacher: https://hf.tst.eu/model#qwen3.8-9b-hermes-function-calling-v2-GGUF
