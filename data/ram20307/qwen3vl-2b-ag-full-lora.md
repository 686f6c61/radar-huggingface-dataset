# Ram20307/qwen3vl-2b-ag-full-lora

## Resumen

qwen3vl-2b-ag-full-lora es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3-VL-2B-Instruct, un modelo vision-language de 2.000 millones de parametros desarrollado por Alibaba Qwen. El adaptador lo publica el usuario Ram20307 y su proposito es especializar el modelo en la generacion de grafos de escena (scene graphs) a partir de imagenes, concretamente en la tarea de listar los objetos con los que una persona esta relacionada en un fotograma y clasificar esa relacion en tres categorias: atencion, espacial y contacto.

La relevancia de esta ficha es acotada: se trata de un fine-tuning de investigacion sobre el dataset Action Genome, orientado a la extraccion de relaciones persona-objeto en video. No es un modelo generalista ni un lanzamiento de laboratorio, sino un adaptador PEFT de 0,1 GB publicado sin descargas ni interacciones. Su interes tecnico radica en mostrar como un VLM pequeno (2B) puede adaptarse con LoRA r=16 a una tarea estructurada de salida JSON, y en documentar el procedimiento y las metricas preliminares obtenidas.

El modelo base Qwen3-VL-2B-Instruct aporta la arquitectura transformer multimodal y la ventana de contexto, mientras que el adaptador anade la especializacion en scene graphs. La licencia del adaptador es Apache 2.0, pero los datos de entrenamiento (Action Genome y Charades) estan restringidos a uso no comercial de investigacion, lo que condiciona fuertemente cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-VL-2B-Instruct (transformer multimodal vision-language) |
| Parametros totales | 2.000 millones en el modelo base; el adaptador LoRA ocupa 0,1 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-VL-2B-Instruct) |
| Tipos de cuantizacion | no disponible; el adaptador se entrena y publica en bf16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 para el adaptador; datos de entrenamiento (Action Genome, Charades) solo para investigacion no comercial |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango r=16 aplicado sobre Qwen3-VL-2B-Instruct, un modelo vision-language de 2B parametros. El entrenamiento se realizo en bf16 sobre el split completo de entrenamiento de Action Genome: aproximadamente 60.700 fotogramas muestreados de 7.787 videos de Charades, con hasta 8 fotogramas por video, durante 2 epocas. La tarea es generar una salida JSON con la lista de objetos visibles relacionados con la persona y las etiquetas de relacion en tres ejes: atencion, espacial y contacto.

La innovacion tecnica es limitada y de caracter aplicado: se trata de un fine-tuning supervisado estandar con LoRA sobre un VLM existente, sin RLHF ni DPO documentados, y sin cambios arquitectonicos. El prompt de inferencia es fijo y esta documentado en la model card: `List every visible object that the person is related to in this frame. Output JSON only: [{"object":<name>,"attention":[..],"spatial":[..],"contact":[..]}]`. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni otras optimizaciones.

## Capacidades

- Generacion de grafos de escena: dado un fotograma, produce un JSON con los objetos relacionados con la persona y sus relaciones de atencion, espaciales y de contacto.
- Salida estructurada JSON: el modelo esta entrenado para responder exclusivamente con JSON valido segun el esquema indicado.
- Comprension visual: hereda del modelo base Qwen3-VL-2B-Instruct la capacidad de analizar imagenes.
- Seguimiento de instrucciones con prompt fijo: responde al prompt especifico de la tarea de Action Genome.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Tool calling, function calling, agentes y razonamiento multi-paso: no documentados para este adaptador; pueden existir en el modelo base pero no se han validado tras el fine-tuning.

## Casos de uso

- Investigacion en scene graph generation: el adaptador sirve como punto de partida reproducible para experimentos academicos sobre relaciones persona-objeto en video, usando Action Genome como referencia.
- Analisis de interaccion persona-objeto en video de vigilancia o estudio conductual: se puede aplicar fotograma a fotograma para extraer que objetos atiende o toca una persona, con la salvedad de que la precision y el recall son bajos (0,54 y 0,40 respectivamente).
- Anotacion asistida de datasets: el modelo puede preetiquetar relaciones persona-objeto en nuevos videos para que un humano las revise, reduciendo el coste de anotacion manual.
- Baseline para fine-tuning posterior: al ser un adaptador LoRA ligero (0,1 GB), es util como inicializacion para experimentos con otros dominios o esquemas de relaciones.
- Prototipado de pipelines de comprension de escenas: integrado con un VLM mayor o con reglas posteriores, puede servir para enriquecer descripciones de imagenes con relaciones estructuradas.
- Evaluacion comparativa de VLMs pequenos en tareas estructuradas: permite medir la capacidad de un modelo de 2B para producir JSON valido y relaciones correctas frente a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| JSON valido | 199/199 | bf16 merged, 199 fotogramas de test de 25 videos |
| Recall | 0,40 | mismo conjunto, preliminar |
| Precision | 0,54 | mismo conjunto, preliminar |

Los resultados son preliminares, de una sola ejecucion y sin barras de error. El protocolo no corresponde al de la competicion (280 fotogramas de 35 videos), por lo que no son directamente comparables con resultados publicados de Action Genome. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo base de 2B parametros, en bf16 requiere aproximadamente 4-5 GB de VRAM; en cuantizacion de 8 bits, unos 2-3 GB; en 4 bits, alrededor de 1,5-2 GB. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados para este adaptador.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) es suficiente en bf16; para cuantizacion 4 bits bastan 4 GB.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas de gama media.
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con la libreria `peft` sobre transformers; tambien puede fusionarse (merge) con el modelo base y exportarse a formatos como GGUF para llama.cpp u Ollama, o servirse con vLLM y TGI una vez fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3vl-2b-ag-full-lora | 2B (base) + LoRA | no disponible | Scene graph persona-objeto | Apache 2.0 (adaptador); datos solo investigacion | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-2B-Instruct | 2B | no disponible | VLM generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| Otros adaptadores Action Genome | variable | no disponible | Scene graph | variable | no disponible |

La comparativa con alternativas especificas de scene graph sobre Action Genome no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia es la especializacion en salida JSON de relaciones persona-objeto, a costa de perder generalidad y con metricas modestas.

## Limitaciones y advertencias

- Rendimiento limitado: recall de 0,40 y precision de 0,54 en el conjunto preliminar de evaluacion, lo que implica un numero alto de falsos negativos y falsos positivos.
- Resultados preliminares: una sola ejecucion, sin barras de error y con un protocolo distinto al de la competicion oficial de Action Genome.
- Restriccion de licencia de datos: Action Genome y Charades estan licenciados solo para investigacion no comercial; el uso comercial del adaptador es juridicamente arriesgado aunque la licencia del adaptador sea Apache 2.0.
- Dependencia del prompt: el modelo esta entrenado con un prompt fijo; cambios en la formulacion pueden degradar la calidad del JSON.
- Riesgo de alucinacion: como todo VLM, puede inventar objetos o relaciones no presentes en la imagen.
- Idiomas no documentados: no se especifica el soporte multilingue tras el fine-tuning.
- Sin descargas ni validacion comunitaria: el repositorio no tiene descargas ni likes, por lo que no hay evidencia externa de su funcionamiento.
- Contexto y cuantizacion no documentados: no se detallan en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Ram20307/qwen3vl-2b-ag-full-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset Action Genome: no disponible en la informacion proporcionada
- Paper de Action Genome: no disponible en la informacion proporcionada
- Repositorio o demo: no disponible en la informacion proporcionada
