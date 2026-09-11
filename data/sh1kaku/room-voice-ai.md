# sh1kaku/room-voice-ai

## Resumen

RooM Voice AI es un repositorio de pesos publicado por el usuario sh1kaku (repo `sh1kaku/room-voice-ai`, 0,1 GB) que no contiene un único modelo, sino un conjunto de artefactos para un asistente de voz de sala de reuniones en vietnamita. En concreto, distribuye dos checkpoints en formato ONNX cuantizado a INT8: `phobert_joint_meeting_nlu.onnx` (128 MB), un modelo de comprensión del lenguaje natural multitarea construido sobre el backbone `vinai/phobert-base-v2`, y `openwakeword_room.onnx` (644 KB), un detector de palabra de activación basado en OpenWakeWord. Se completa con el tokenizador BPE de PhoBERT (`vocab.txt`, `bpe.codes`, ~2 MB).

El componente principal es un encoder transformer con arquitectura de doble cabecera que resuelve simultáneamente dos tareas: clasificación de intención en 6 categorías propias de reuniones de empresa (`Summarize_Meeting`, `Query_Project_Knowledge`, `Assign_Action_Item`, `Schedule_Followup`, `Explain_Technical_Concept`, `Chitchat_Clarification`) y etiquetado de entidades con 11 etiquetas BIO que cubren persona, tiempo, tarea, tema y herramienta. El modelo está pensado para ejecutarse íntegramente en CPU con AVX2, sin consumo de VRAM (0 MB de GPU), lo que lo sitúa en la categoría de inferencia en el borde o en servidores sin acelerador.

Su relevancia es acotada pero específica: cubre un nicho poco atendido (NLU de reuniones en vietnamita) con un coste computacional mínimo y licencia MIT, lo que facilita su integración en pipelines de tiempo real. Como contrapartida, no genera texto, no soporta *tool calling* nativo ni otros idiomas distintos del vietnamita, y el repositorio no acumula descargas ni validación externa (0 descargas, 0 *likes*), por lo que debe tratarse como un artefacto sin contraste independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NLU: PhoBERT-v2 (encoder transformer tipo BERT) con doble cabecera (clasificacion de intencion + etiquetado BIO de slots). Wake-word: CNN 2D *depthwise separable* de OpenWakeWord |
| Parametros totales | no disponible (la model card no publica el recuento; el backbone declarado es `vinai/phobert-base-v2`, configuracion base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (`max_length=128` en el ejemplo de inferencia de la model card); no se documenta otra ventana |
| Tipos de cuantizacion | INT8 (ONNX Runtime) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | ONNX INT8; tokenizador BPE de PhoBERT (`vocab.txt`, `bpe.codes`) |

Checkpoints publicados en el repositorio:

| Fichero | Modulo | Arquitectura | Formato | Tamano | Latencia CPU declarada |
|---|---|---|---|---|---|
| `phobert_joint_meeting_nlu.onnx` | modulo 4 | PhoBERT-v2 multitarea conjunta (intencion + slots BIO) | ONNX INT8 | 128 MB | <= 0,03 ms |
| `openwakeword_room.onnx` | modulo 2 | OpenWakeWord CNN 2D *depthwise separable* | ONNX INT8 | 644 KB | <= 0,003 ms |
| `tokenizer/` | modulo 4 | Tokenizador BPE de PhoBERT | tokenizador | ~2 MB | no aplica |

## Arquitectura y entrenamiento

El modelo NLU parte de `vinai/phobert-base-v2`, un encoder transformer preentrenado para vietnamita, y anade dos cabeceras paralelas sobre la representacion del token `[CLS]` y sobre la secuencia completa: una para clasificacion de intencion (6 clases excluyentes) y otra para etiquetado de secuencias con esquema BIO (11 etiquetas: `O`, `B/I-PER`, `B/I-TIME`, `B/I-TASK`, `B/I-TOPIC`, `B/I-TOOL`). El preprocesado de texto incluye segmentacion de palabras en vietnamita con `pyvi` (`ViTokenizer.tokenize`) antes de aplicar el tokenizador BPE, un paso necesario en este idioma por su tokenizacion a nivel de silaba. La exportacion a ONNX con cuantizacion INT8 es el mecanismo que permite la ejecucion en CPU con AVX2 sin VRAM dedicada.

No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO; esos datos deben considerarse **no disponibles**. El segundo checkpoint, el detector de palabra de activacion, trabaja sobre un espectrograma log-Mel extraido de audio PCM mono a 16 kHz, con un buffer circular deslizante de 1,0 segundo (16 000 muestras), suavizado por media movil de ventana 3 e histeresis doble con umbrales 0,70 (alto) y 0,40 (bajo), mas un bloqueo de reactivacion (*cooldown*) de 1,5 segundos. La model card menciona que fue entrenado para las palabras de activacion "Hey Room" y "Hey Siri".

## Capacidades

- Clasificacion de intencion en 6 categorias de reunion: resumen de acta, consulta de conocimiento de proyecto, asignacion de tareas, programacion de seguimiento, explicacion de conceptos tecnicos y chachara/aclaracion.
- Etiquetado de entidades tipo BIO en 5 categorias: persona (`PER`), tiempo (`TIME`), tarea (`TASK`), tema (`TOPIC`) y herramienta o sistema (`TOOL`, con ejemplos como Jira, gRPC o Git).
- Deteccion de palabra de activacion en flujo de audio continuo con el modelo `openwakeword_room.onnx`.
- Inferencia en CPU pura mediante ONNX Runtime (`CPUExecutionProvider`, AVX2), sin uso de GPU.
- Ejecucion declarada en tiempo real, con latencias por debajo del milisegundo segun el autor.
- Capacidades multilingues: **ninguna**; el modelo esta entrenado y etiquetado exclusivamente para vietnamita (`language: vi`).
- No dispone de generacion de texto, razonamiento generativo, codigo, matematicas, vision, audio-a-texto completo, *tool calling* nativo, soporte de agentes ni modo de razonamiento extendido. Es exclusivamente un clasificador de secuencias y un detector acustico.

## Casos de uso

- **Enrutado de peticiones en un asistente de reunion**: el modelo clasifica la intencion de la frase del usuario y permite dirigir la consulta al modulo adecuado del sistema (motor de resumen, buscador documental o gestor de tareas) sin necesidad de un LLM generativo, reduciendo coste y latencia.
- **Extraccion automatica de tareas asignadas**: ante frases como la del *widget* de la model card ("Giao cho anh Tuan kiem tra loi API gRPC chieu nay nhe"), el modelo detecta la intencion `Assign_Action_Item` y extrae persona, tarea, herramienta y plazo, lo que permite crear tickets en Jira o GitLab de forma automatica.
- **Generacion de actas y listas de acciones tras una reunion**: la intencion `Summarize_Meeting` junto con los slots `TASK`, `PER` y `TIME` permite estructurar los compromisos adquiridos y volcarlos a un documento o a un sistema de seguimiento.
- **Programacion de reuniones de seguimiento**: la intencion `Schedule_Followup` con el slot `TIME` habilita la creacion de eventos de calendario a partir de una orden hablada, sin intervencion manual.
- **Asistente de consulta sobre documentacion tecnica**: la intencion `Query_Project_Knowledge` actua como disparador para lanzar una busqueda RAG sobre la documentacion del proyecto, y el slot `TOPIC` puede emplearse para prefiltrar el indice.
- **Soporte tecnico interno en vietnamita**: la intencion `Explain_Technical_Concept` combinada con el slot `TOOL` permite identificar que se esta preguntando por una herramienta concreta (por ejemplo gRPC o Git) y responder desde una base de conocimiento acotada.
- **Activacion por voz en dispositivos de sala**: el modelo de wake-word de 644 KB permite mantener una escucha pasiva permanente en hardware sin GPU (por ejemplo una Raspberry Pi o un mini-PC), activando el resto del pipeline solo cuando se pronuncia la palabra clave.
- **Preetiquetado de corpus de reuniones**: el clasificador puede usarse para anotar de forma masiva transcripciones vietnamitas con intencion y entidades, generando datos de entrenamiento o de evaluacion para modelos posteriores.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (la tabla original aparece truncada; solo se dispone de las filas completas que se indican):

| Metrica | Valor declarado | Evaluacion del autor |
|---|---|---|
| Precision de intencion NLU (*NLU Intent Accuracy*) | > 91,2 % | "Estandar de sala de reunion" |
| Latencia CPU del modelo NLU | <= 0,03 ms | no disponible (fila truncada en la model card) |
| Latencia CPU del modelo wake-word | <= 0,003 ms | no disponible |
| Tamano del checkpoint NLU | 128 MB | ONNX INT8 |
| Tamano del checkpoint wake-word | 644 KB | ONNX INT8 |

No se han publicado en la informacion disponible resultados de *F1* para el etiquetado de slots, ni comparativas con otros modelos, ni detalles sobre el conjunto de evaluacion. No se ofrecen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, ya que el modelo no es un modelo generativo. Las cifras de latencia declaradas (decimas de microsegundo para un encoder de 128 MB) resultan llamativamente bajas y conviene medirlas en el hardware objetivo antes de asumirlas en produccion.

## Requisitos de hardware

- **VRAM**: 0 MB. El autor indica explicitamente ejecucion en CPU AVX2 sin memoria de GPU.
- **Memoria principal**: el checkpoint NLU ocupa 128 MB y el tokenizador ~2 MB, mas el peso del runtime de ONNX Runtime y de las dependencias de Python; un entorno con 1-2 GB de RAM es suficiente en la practica.
- **CPU**: se requiere soporte AVX2 para el rendimiento declarado. Cualquier procesador de escritorio o servidor de los ultimos diez anos cumple el requisito.
- **GPU recomendadas**: no aplica; no es necesario ni se documenta *provider* CUDA. Podria ejecutarse con `CUDAExecutionProvider` si se desea, pero no aporta ventaja para un modelo de este tamano.
- **Apto para hardware de consumo**: si, y tambien para dispositivos embebidos; el detector de wake-word de 644 KB es el componente mas ligero del conjunto.
- **Opciones de despliegue**: ONNX Runtime (Python, C++, C#, Java) como via principal. No se publican pesos en formato GGUF ni safetensors, por lo que llama.cpp y Ollama no son aplicables directamente; vLLM y TGI tampoco, al no tratarse de un modelo generativo.
- **Dependencias declaradas**: `onnxruntime`, `numpy`, `transformers`, `pyvi`, `huggingface_hub`.
- **Latencia y throughput**: no disponibles de forma fiable. El unico dato publicado son las latencias por inferencia citadas en el apartado anterior; no se documenta throughput en peticiones por segundo ni comportamiento bajo carga concurrente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `phobert_joint_meeting_nlu` (este) | Encoder transformer con doble cabecera, ONNX INT8 | no disponible | 128 tokens | Intencion (6 clases) + slots BIO (11 etiquetas) en un unico paso | MIT | HuggingFace, 0 descargas |
| `vinai/phobert-base-v2` | Encoder transformer base | no disponible | no disponible | Representaciones generales en vietnamita; requiere anadir cabeceras | no disponible | Ampliamente utilizado como backbone |
| `bert-base-multilingual-cased` | Encoder transformer base multilingue | no disponible | no disponible | Representaciones multilingues; sin cabeceras de NLU de reunion | no disponible | Ampliamente disponible |
| LLM generativo tipo Qwen o similar | Decoder autoregresivo | no disponible | no disponible | NLU *zero-shot*, generacion y resumen | no disponible | Requiere GPU y mayor latencia |

La comparacion cuantitativa no es posible con los datos disponibles: no se publican parametros, contexto ni metricas comparables de las alternativas en la informacion proporcionada. La ventaja estructural de este modelo frente a las alternativas es doble: ejecucion en CPU sin VRAM y resolucion conjunta de intencion y slots en una sola pasada, algo que un encoder base no ofrece sin ajuste adicional y que un LLM generativo consigue con un coste de computo muy superior.

## Limitaciones y advertencias

- **Idioma unico**: solo vietnamita. Cualquier entrada en otro idioma producira clasificaciones sin significado.
- **Ventana corta**: el ejemplo oficial usa `max_length=128`; frases o transcripciones mas largas se truncan y pueden perder entidades relevantes.
- **No es un modelo generativo**: no redacta resumenes ni responde preguntas; unicamente devuelve etiquetas. Cualquier sistema que necesite texto de salida debe anadir otro componente.
- **Sin *tool calling* ni soporte de agentes**: no existe una interfaz de funciones ni razonamiento multi-paso.
- **Cobertura de slots limitada**: solo cinco tipos de entidad (`PER`, `TIME`, `TASK`, `TOPIC`, `TOOL`). No hay etiquetas para lugar, cantidad, organizacion ni otros tipos habituales.
- **Riesgo de error de clasificacion**: al ser un clasificador cerrado de 6 clases, cualquier intencion fuera del catalogo se forzara hacia la clase mas probable; no hay mecanismo de "desconocido" documentado.
- **Riesgo de alucinacion**: no aplica en el sentido generativo, pero si existe el riesgo equivalente de extraer entidades espurias con alta confianza.
- **Sesgos**: no se documenta ninguna evaluacion de sesgo, ni la composicion del conjunto de entrenamiento, por lo que no es posible estimar sesgos de genero, acento o dominio.
- **Trazabilidad de la evaluacion**: la tabla de benchmarks de la model card esta truncada y no se especifica el conjunto de prueba ni el procedimiento de medida; la precision del 91,2 % no es verificable con la informacion publicada.
- **Cifras de latencia dudosas**: 0,03 ms para un encoder de 128 MB y 0,003 ms para el detector de wake-word son valores extraordinariamente bajos; deben validarse en el hardware de destino antes de comprometer un SLA.
- **Uso comercial**: la licencia del repositorio es MIT, permisiva para uso comercial. Conviene, no obstante, verificar la licencia del backbone `vinai/phobert-base-v2`, que la model card no detalla.
- **Palabra de activacion con marca registrada**: la model card menciona el entrenamiento con "Hey Siri", termino asociado a Apple; su uso en producto puede tener implicaciones legales al margen de la licencia del modelo.
- **Madurez**: el repositorio registra 0 descargas y 0 *likes*, y los metadatos muestran fecha de creacion y actualizacion de septiembre de 2026, posterior a la fecha de redaccion de esta ficha. No hay validacion independiente del comportamiento del modelo.
- **Dependencia de preprocesado**: el pipeline exige segmentacion previa con `pyvi`; omitirla degrada la tokenizacion y, con ella, la precision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sh1kaku/room-voice-ai
- Repositorio del proyecto en GitHub: https://github.com/sh1kaku59/room-voice-ai
- Licencia MIT del proyecto: https://github.com/sh1kaku59/room-voice-ai/blob/main/LICENSE
- Backbone declarado: https://huggingface.co/vinai/phobert-base-v2
- ONNX Runtime: https://onnxruntime.ai/
- Documentacion de `transformers` (usada en los ejemplos): https://huggingface.co/docs/transformers
- Documentacion de `huggingface_hub`: https://huggingface.co/docs/huggingface_hub

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas generales sobre ChatGPT y no guardan relacion con `sh1kaku/room-voice-ai`. No se dispone de paper, blog tecnico ni demo publicada del modelo.
