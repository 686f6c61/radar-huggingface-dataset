# jenmud/gorun-qwen3-4b-GGUF

## Resumen

gorun-qwen3-4b es un ajuste fino (fine-tune) del modelo Qwen3-4B-Instruct-2507, desarrollado por jenmud para actuar como asistente integrado en la interfaz web de gorun, una herramienta de automatizacion de tareas orientada a DevOps. El modelo esta especializado en escribir tareas en formato Gorunfile, explicar los conceptos propios de gorun, responder preguntas sobre un Gorunfile cargado, diagnosticar ejecuciones fallidas y resumir el historial de ejecuciones. Se distribuye unicamente en formato GGUF cuantizado a Q4_K_M, lo que facilita su despliegue local con llama.cpp y runtimes compatibles.

Arquitectonicamente hereda la estructura transformer densa de Qwen3-4B-Instruct-2507, con 4.022.468.096 parametros totales y una ventana de contexto que el autor no documenta explicitamente en la model card. El ajuste se realizo mediante QLoRA sobre la base en 4 bits nf4, con rango 16 y alpha 32 sobre todas las proyecciones lineales, durante una epoca sobre 2.500 ejemplos de hasta 2.560 tokens, empleando una unica RTX 2060 SUPER durante aproximadamente 6,5 horas.

Su relevancia es acotada y muy especifica: no es un modelo de proposito general, sino un componente de producto para gorun. El propio autor lo etiqueta como compilacion de prueba y advierte que las respuestas sobre conceptos generales de gorun pueden contener opciones o ajustes inventados. Para el resto de escenarios, el modelo base Qwen3-4B-Instruct-2507 es la referencia adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507), ajuste fino QLoRA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (el entrenamiento uso ejemplos de hasta 2.560 tokens) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp b12359) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de 4.022 millones de parametros. Sobre esa base se aplico QLoRA con la base cuantizada a 4 bits nf4, rango LoRA 16, alpha 32 y adaptadores en todas las proyecciones lineales. El entrenamiento consistio en una epoca con tasa de aprendizaje 2e-4 sobre 2.500 ejemplos de hasta 2.560 tokens, ejecutado en una sola RTX 2060 SUPER en aproximadamente 6,5 horas. El adaptador resultante se fusiono con la base en fp16, se convirtio con llama.cpp b12359 y se cuantizo a Q4_K_M.

Los datos de entrenamiento se generaron a partir de semillas escritas a mano mediante el propio codigo de prompts de gorun. Cada ejemplo incorpora el contexto que el asistente recibe en `gorun -serve`, y cada tarea incluida en una respuesta se valida para comprobar que carga correctamente. La receta completa esta publicada en el directorio `training/` del repositorio del proyecto. No se documenta el uso de RLHF ni DPO, ni el volumen total de tokens de entrenamiento mas alla de los 2.500 ejemplos citados.

## Capacidades

- Generacion de tareas en formato Gorunfile: es la capacidad principal y la que mejor rinde en la evaluacion del autor.
- Explicacion de conceptos de gorun y respuesta a preguntas sobre un Gorunfile cargado.
- Diagnostico de ejecuciones fallidas y resumen del historial de ejecuciones.
- Correccion de tareas que no cargan, reescribiendolas hasta que son validas.
- Conversacion multi-turno mediante la plantilla ChatML de Qwen3.
- Compatibilidad con cualquier runtime basado en llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.

## Casos de uso

- Asistente embebido en la interfaz web de gorun: el modelo se invoca desde `gorun -serve` mediante la variable `GORUN_LLM_MODEL`, apuntando al archivo GGUF remoto o local, y responde dentro del contexto que la propia herramienta le inyecta.
- Generacion de Gorunfile en tareas de CI/CD: el modelo redacta tareas que se validan automaticamente al cargar, lo que encaja en un flujo donde la salida debe ser sintacticamente correcta antes de ejecutarse.
- Correccion de tareas que no cargan: dado un Gorunfile con errores de carga, el modelo reescribe las tareas defectuosas; en la evaluacion del autor resolvio 4 de 4 casos.
- Diagnostico de ejecuciones fallidas: el modelo recibe el contexto de una ejecucion fallida y produce una explicacion del fallo; obtuvo 16 de 16 en la evaluacion interna.
- Resumen de historial de ejecuciones: genera sintesis de multiples ejecuciones pasadas para revision rapida; obtuvo 13 de 13 en la evaluacion interna.
- Consultas sobre un Gorunfile existente: responde preguntas sobre la estructura y el contenido de un archivo cargado, con 17 de 20 aciertos en la evaluacion del autor.
- Despliegue local en estaciones de trabajo de desarrollo: al ocupar 2,5 GB en Q4_K_M, cabe en equipos modestos y permite un asistente de DevOps sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

Evaluacion interna del autor sobre 120 ejemplos reservados, ejecutada con el motor llama.cpp integrado en gorun. La comprobacion es mecanica: las tareas deben cargar y las palabras esperadas deben aparecer en la respuesta.

| Tipo de prueba | Qwen3 4B Instruct 2507 | Este modelo |
|---|---|---|
| Escritura de tareas (chat) | 12/26 | 25/26 |
| Escritura de tareas | 13/17 | 17/17 |
| Correccion de tareas que no cargan | 2/4 | 4/4 |
| Diagnostico de ejecucion fallida | 16/16 | 16/16 |
| Resumen de ejecuciones | 13/13 | 13/13 |
| Preguntas sobre el Gorunfile | 19/20 | 17/20 |
| Preguntas sobre gorun | 3/24 | 14/24 |
| Total | 65,0% | 88,3% |

El autor advierte explicitamente que la puntuacion en preguntas sobre gorun sobrestima la precision real del modelo. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB con la cuantizacion Q4_K_M publicada (archivo de 2,5 GB mas overhead de contexto y cache KV).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM; el propio autor entreno el ajuste en una RTX 2060 SUPER, lo que da una referencia del orden de magnitud.
- Cabe en GPU consumer: si, en tarjetas de gama media y baja con 4 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp y cualquier runtime basado en el (Ollama, servidores compatibles con la API de llama.cpp). El uso previsto es mediante `gorun -serve` con la variable `GORUN_LLM_MODEL`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gorun-qwen3-4b (este modelo) | 4.022 M | no disponible | Asistente especializado en gorun y DevOps | Apache 2.0 | GGUF Q4_K_M en Hugging Face |
| Qwen3-4B-Instruct-2507 | 4.022 M | no disponible en la informacion | Modelo de proposito general | Apache 2.0 | Pesos completos y multiples cuantizaciones |
| Alternativas de 4B para tareas de codigo y DevOps | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con su modelo base: el ajuste mejora de forma marcada en las tareas especificas de gorun (88,3% frente a 65,0% en la evaluacion interna) pero empeora ligeramente en preguntas sobre el Gorunfile (17/20 frente a 19/20). No se dispone de datos para comparar con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- El autor lo describe como compilacion de prueba: las respuestas sobre conceptos generales de gorun pueden contener opciones o ajustes inventados, por lo que deben contrastarse con la documentacion oficial.
- La puntuacion de 14/24 en preguntas sobre gorun sobrestima la precision real segun el propio autor; sigue siendo la categoria con peor rendimiento relativo.
- Riesgo de alucinacion en opciones de configuracion y ajustes no cubiertos por los datos de entrenamiento.
- Idioma limitado al ingles segun los metadatos; no se documenta soporte de castellano ni de otros idiomas.
- Ventana de contexto no documentada; el entrenamiento uso ejemplos de hasta 2.560 tokens, por lo que el rendimiento mas alla de esa longitud no esta validado.
- Unico archivo cuantizado disponible (Q4_K_M); no hay versiones en fp16, Q8_0 ni otras cuantizaciones publicadas.
- El modelo esta disenado para el contexto de prompt de `gorun -serve`; su uso fuera de ese entorno no esta evaluado.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantias del autor sobre el comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jenmud/gorun-qwen3-4b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de gorun: https://github.com/jenmud/gorun
- Documentacion de gorun: https://github.com/jenmud/gorun/tree/master/docs
- Receta de entrenamiento: https://github.com/jenmud/gorun/tree/master/training
- Archivo GGUF directo: https://huggingface.co/jenmud/gorun-qwen3-4b-GGUF/resolve/main/gorun-qwen3-4b-q4_k_m.gguf
