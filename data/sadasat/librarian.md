# sadasat/librarian

## Resumen

Librarian es un modelo de generacion de texto derivado de Qwen/Qwen2.5-0.5B-Instruct, publicado por el usuario sadasat. Se trata de una adaptacion experimental disenada para funcionar integramente en el navegador del visitante mediante Transformers.js y ONNX Runtime Web, sirviendo como motor conversacional de una pagina web concreta (sadas.at/chat). El modelo conserva las 24 capas del modelo base Qwen2.5-0.5B-Instruct, pero sus pesos se cuantizan a 4 bits en formato ONNX y se le anaden matrices delgadas que codifican 82 pasajes de texto del autor Daniel Rodriguez.

La particularidad tecnica del proyecto es que no emplea entrenamiento por gradiente: todas las modificaciones sobre los pesos base son ajustes en forma cerrada (closed-form fit), lo que lo aleja de los flujos habituales de fine-tuning o RLHF. El modelo incorpora un mecanismo de memoria en ocho partes que se descargan bajo demanda cuando una pregunta requiere un pasaje concreto, con un primer download de 260 MB y fragmentos de memoria de entre 7,1 y 7,8 MB.

Es relevante ahora como ejemplo de despliegue de LLM en el cliente (edge inference) con memoria externa seleccionable, y como caso practico de destilacion de conocimiento en matrices auxiliares sobre un modelo pequeno. No obstante, su alcance es deliberadamente limitado: fue creado para una unica pagina web y su autora lo describe como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), 24 capas, segun el modelo base |
| Parametros totales | no disponible (deriva de Qwen2.5-0.5B-Instruct, ~0,5 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (ONNX Q4); pesos en `onnx/model_q4.onnx` |
| Idiomas soportados | Ingles y algo de espanol |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con ficheros `.onnx_data.gz`), tokenizer en JSON comprimido |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2 (transformer decoder-only) de Qwen2.5-0.5B-Instruct, manteniendo sus 24 capas tal y como se publicaron. Sobre esa base se aplica una cuantizacion a 4 bits en ONNX para su ejecucion en navegador mediante ONNX Runtime Web. El vocabulario se reduce de 151.665 a 103.120 tokens, y los caracteres de escrituras no latinas se leen como bytes.

La innovacion principal reside en el mecanismo de memoria: 82 pasajes distribuidos en 6 partes se escriben en matrices delgadas junto a los pesos base. No hay entrenamiento por gradiente; cada edicion es un ajuste en forma cerrada. El grafo ONNX acepta una edicion como entrada y, sin ninguna, se comporta como el modelo base. Los ficheros `memory/1.bin.gz` a `memory/8.bin.gz` contienen las ediciones: una decide si un mensaje requiere un pasaje, otra modela la voz del personaje y las restantes recitan los pasajes. El fichero `chooser.json` contiene una tabla de palabras que selecciona el pasaje, sin almacenar texto. La generacion esta limitada a 160 tokens por respuesta.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte parcial de espanol.
- Recitacion de pasajes concretos de la obra de Daniel Rodriguez a partir de su memoria interna.
- Seleccion de pasaje mediante una tabla de palabras (`chooser.json`) y una edicion dedicada a decidir si la pregunta requiere un pasaje.
- Ejecucion en el navegador del cliente mediante WebGPU o WebAssembly sobre CPU.
- Carga bajo demanda de partes de memoria (7,1 a 7,8 MB por parte) cuando la consulta lo requiere.
- Respuestas de hasta 160 tokens.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido segun la informacion disponible.

## Casos de uso

- Chat de personaje en una pagina web: el modelo se ejecuta en el navegador del visitante y responde con pasajes del autor, sin enviar datos a un servidor, gracias a su despliegue con Transformers.js y ONNX Runtime Web.
- Demostracion de inferencia en el cliente: sirve como ejemplo reproducible de como ejecutar un LLM cuantizado a 4 bits en WebGPU o WebAssembly con un consumo de memoria de aproximadamente 2 GB.
- Recuperacion de citas literarias: la tabla `chooser.json` y la edicion de seleccion permiten dirigir la conversacion hacia pasajes concretos de los 82 almacenados.
- Prototipo de memoria externa seleccionable: util para investigadores que quieran estudiar la sustitucion de RAG por matrices de memoria cargadas bajo demanda.
- Asistente de consulta sobre una obra concreta: el modelo puede responder preguntas sobre el contenido memorizado, siempre con la advertencia de que puede equivocarse de pasaje.
- Experimentacion docente: caso de estudio de ajuste en forma cerrada sobre un modelo base pequeno, sin entrenamiento por gradiente, para cursos de despliegue de IA open source.
- Integracion en aplicaciones web ligeras: el primer download de 260 MB y la carga fragmentada de memoria lo hacen viable en entornos con ancho de banda limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria libre estimada: aproximadamente 2 GB para ejecucion en navegador.
- Primer download: 260 MB (grafo y pesos base en tres partes).
- Memoria adicional: 7,1 a 7,8 MB por cada parte de memoria descargada bajo demanda.
- Aceleracion: WebGPU cuando este disponible; en su defecto, WebAssembly sobre CPU.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles como destino previsto; el modelo esta empaquetado para navegador, no para servidores.
- Cabe en GPU de consumo a traves de WebGPU en navegadores compatibles, aunque no se especifican modelos concretos.
- Opciones de despliegue: Transformers.js con ONNX Runtime Web; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| sadasat/librarian | ~0,5 mil millones (base) | no disponible | ONNX 4 bits | Apache-2.0 | Inferencia en navegador con memoria de pasajes |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,5 mil millones | no disponible en la informacion | safetensors | Apache-2.0 | Modelo base instructivo generalista |
| Alternativas de inferencia en navegador de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con otras alternativas de inferencia en navegador no esta disponible en la informacion proporcionada. El modelo base Qwen2.5-0.5B-Instruct es la referencia natural, del que Librarian hereda arquitectura y licencia, pero anade cuantizacion ONNX, reduccion de vocabulario y el mecanismo de memoria.

## Limitaciones y advertencias

- Modelo experimental creado para una unica pagina web; puede seleccionar el pasaje equivocado o recordar mal el correcto.
- No representa a Daniel Rodriguez ni habla en su nombre, segun advierte la propia model card.
- Limitado a ingles y algo de espanol; los caracteres de escrituras no latinas se leen como bytes, lo que degrada el multilingueismo.
- Vocabulario reducido a 103.120 tokens frente a los 151.665 del modelo base.
- Respuestas limitadas a 160 tokens, lo que restringe la profundidad de las contestaciones.
- Depende de instrucciones externas de la pagina (reglas de lectura de la tabla y frases de fallback) que no forman parte del modelo.
- Riesgo de alucinacion en la recitacion de pasajes, dado que la memoria se almacena en matrices delgadas y la seleccion se hace por tabla de palabras.
- Licencia Apache-2.0 permite uso comercial, pero el contenido memorizado procede de la obra de un autor y su reutilizacion puede estar sujeta a derechos de autor independientes de la licencia del modelo.
- Sin benchmarks publicados que permitan evaluar su calidad frente a alternativas.
- Requiere navegador con WebGPU o WebAssembly y unos 2 GB de memoria libre, lo que excluye dispositivos muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sadasat/librarian
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Demo o pagina de uso: https://sadas.at/chat/
