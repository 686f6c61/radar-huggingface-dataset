# nohamouazine/vertigo-3

## Resumen

Vertigo 3 es un modelo de lenguaje de pequeno tamano (97 millones de parametros) especializado en frances, desarrollado por ParadoxalAI (nohamouazine). Su propuesta diferencial no es competir en capacidad bruta, sino ofrecer un sistema completo de generacion de texto que se ejecuta en Node.js sin GPU ni dependencias externas, con un motor de inferencia propio escrito en TypeScript. El modelo integra una herramienta de busqueda contra la Wikipedia francesa: cuando no dispone de conocimiento suficiente, emite una llamada `[outil:cherche|...]` que el motor intercepta para recuperar la introduccion del articulo correspondiente y devolver la respuesta con la fuente citada.

Con 12 capas, ventana de contexto de 1024 tokens y un vocabulario de 16k, Vertigo 3 se posiciona en la categoria de modelos on-device para tareas de pregunta-respuesta y conversacion ligera en frances. Los pesos se distribuyen en un formato propio (manifiesto mas fragmentos int8 con una escala por fila), no compatible con `transformers`, y se cargan mediante el motor incluido en el repositorio.

Es relevante ahora por su enfoque de despliegue: 100 MB de RAM, aproximadamente 60 ms por token en un MacBook y cero dependencias, lo que lo hace adecuado para entornos con recursos muy limitados o para experimentacion educativa sobre inferencia de LLM en TypeScript. La licencia Apache 2.0 cubre tanto codigo como pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica variante concreta) |
| Parametros totales | 97M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | int8 con una escala por fila (formato propio) |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 (codigo y pesos) |
| Formato de pesos | Formato propio: manifiesto + fragmentos int8 (no es checkpoint de `transformers`) |
| Capas | 12 |
| Vocabulario | 16k tokens |
| Tamano de pesos | 98 MB |
| RAM en inferencia | ~100 MB |
| Runtime | Node.js 22.6+ |

## Arquitectura y entrenamiento

Vertigo 3 es un transformer de 12 capas y 97M de parametros con un vocabulario reducido de 16k tokens, disenado para mantener el coste de inferencia en CPU muy bajo. El preentrenamiento se realizo sobre Wikipedia en frances y texto web en frances, seguido de un ajuste para conversacion y para el uso de su herramienta de busqueda en Wikipedia. El entrenamiento se llevo a cabo en un unico PC con una GPU de 8 GB, segun indica la model card.

La innovacion tecnica principal no reside en la arquitectura, sino en el pipeline de despliegue: el modelo se exporta a un formato propio (manifiesto mas fragmentos int8 con cuantizacion por fila) y se sirve mediante un motor de inferencia escrito en TypeScript que incluye tokenizador, modelo, generacion y la herramienta de Wikipedia. El modelo aprende a emitir una llamada estructurada `[outil:cherche|...]` cuando no dispone de la respuesta; el motor detecta esa marca, consulta la introduccion del articulo de Wikipedia francesa correspondiente y compone la respuesta final con la fuente. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto en frances: respuestas conversacionales y de conocimiento general.
- Pregunta-respuesta con recuperacion aumentada: llamada a herramienta de busqueda en Wikipedia francesa con cita de fuente.
- Tool calling nativo mediante un protocolo propio de marcas (`[outil:cherche|...]`), no el formato JSON de function calling habitual.
- Conversacion multi-turno dentro del limite de 1024 tokens de contexto.
- Ejecucion en CPU sin GPU ni dependencias, a traves del motor en TypeScript incluido en el repositorio.
- Capacidades multilingues: limitadas al frances segun los metadatos del modelo.
- No se documentan capacidades de codigo, matematicas avanzadas, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente de preguntas frecuentes en frances sobre dominio publico: el modelo responde consultas generales y, cuando no sabe, delega en Wikipedia francesa y devuelve la respuesta con enlace a la fuente, lo que reduce el riesgo de respuestas sin respaldo.
- Prototipado educativo de inferencia de LLM: el motor en TypeScript permite estudiar tokenizacion, generacion autoregresiva y cuantizacion int8 sin salir de Node.js, con un coste de recursos minimo.
- Despliegue en dispositivos con recursos muy limitados: con ~100 MB de RAM y sin GPU, puede ejecutarse en portatiles modestos, mini-PC o entornos de CI para pruebas de integracion de pipelines de texto.
- Bot de consulta documental en frances: integrado con una fuente de conocimiento estructurada, el patron de llamada a herramienta sirve como base para asistentes que citan fuentes en aplicaciones de consulta interna.
- Generacion de texto auxiliar en aplicaciones Node.js: resumenes cortos, reformulaciones o respuestas plantilla en frances dentro de un backend JavaScript, sin necesidad de servicio externo de inferencia.
- Pruebas de concepto de agentes con tool calling: el protocolo de marcas del modelo permite experimentar con flujos de recuperacion de informacion y verificacion de fuentes en un entorno controlado y reproducible.
- Evaluacion comparativa de modelos pequenos en frances: util como linea base ligera frente a modelos mayores en tareas de QA en frances, con la ventaja de que toda la pila es auditable y ejecutable localmente.

## Benchmarks y rendimiento

La model card reporta una evaluacion propia sobre 150 preguntas en frances, en seis categorias y con correccion por reglas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Evaluacion | Resultado |
|---|---|
| Benchmark propio ParadoxalAI (150 preguntas en frances, 6 categorias, correccion por reglas) | 56.4 / 100 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

Rendimiento de inferencia declarado: aproximadamente 60 ms por token en un MacBook, con 100 MB de RAM. No se especifica el modelo de CPU empleado en esa medicion.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- RAM: aproximadamente 100 MB durante la inferencia, segun la model card.
- GPU recomendadas: no aplica; el motor no usa GPU.
- GPU consumer: no aplica.
- CPU: cualquier CPU capaz de ejecutar Node.js 22.6 o superior; la latencia reportada es de ~60 ms/token en un MacBook.
- Opciones de despliegue: motor propio en TypeScript incluido en el repositorio (`engine/`), ejecutado con Node.js. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que los pesos no estan en formato `transformers` ni GGUF.
- Throughput estimado: no disponible; solo se documenta la latencia por token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar ni de comparaciones directas publicadas en la informacion proporcionada. La model card menciona que existen otros modelos pequenos evaluados con las mismas 150 preguntas en el sitio del autor, pero no se incluyen sus nombres, parametros ni resultados en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Ejecucion en CPU |
|---|---|---|---|---|---|
| Vertigo 3 | 97M | 1024 | Apache 2.0 | Propio (int8) | Si, motor TypeScript |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo muy pequeno (97M de parametros): capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparacion con modelos de mayor tamano.
- Ventana de contexto de solo 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenado y orientado exclusivamente al frances; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinacion en preguntas fuera de su cobertura; la herramienta de Wikipedia mitiga parcialmente este problema, pero solo cuando el modelo decide invocarla correctamente.
- El formato de pesos es propio y no es un checkpoint de `transformers`; no puede cargarse con las herramientas habituales del ecosistema (vLLM, llama.cpp, Ollama, TGI) sin conversion, que no esta documentada.
- El protocolo de tool calling es especifico del motor incluido; integrarlo en otros stacks requiere reimplementar el parseo de marcas `[outil:cherche|...]`.
- La evaluacion reportada (56.4/100) procede de un benchmark propio con correccion por reglas, no de un benchmark estandar ni revisado por terceros.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; no se documentan restricciones adicionales de uso aceptable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nohamouazine/vertigo-3
- Repositorio de codigo y bench: https://github.com/nohamouazine/vertigo
- Benchmark comparativo del autor: https://paradoxalai.com/banc
- Sitio de ParadoxalAI: https://paradoxalai.com
- Contacto indicado en la model card: contact@weareparis.eu
