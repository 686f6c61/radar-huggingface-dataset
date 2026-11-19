# chimbiwide/Gemma3NPC-4B-pre-thinking-GGUF

## Resumen

Gemma3NPC-4B-pre-thinking-GGUF es la distribucion en formato GGUF del modelo chimbiwide/Gemma3NPC-4B-pre-thinking, un ajuste fino de la familia Gemma 3 de Google orientado a la interpretacion de personajes no jugadores (NPC) en entornos de rol conversacional. Lo desarrolla el usuario chimbiwide (vinculado al repositorio academico KeeganCarey/Post-Thinking-AIIDE) y esta asociado a un articulo aceptado en AIIDE-2026, la conferencia sobre inteligencia artificial e interaccion digital en entretenimiento. El modelo resuelve el problema de dotar a los NPC de un comportamiento conversacional coherente con un trasfondo definido, mediante la generacion de un bloque de planificacion interno `<think>...</think>` antes de cada respuesta visible.

Tecnicamente se trata de un transformer denso de 3.880.263.168 parametros (aproximadamente 3,9 mil millones), derivado de Gemma 3 4B. El repositorio GGUF ocupa 11,9 GB y contiene las cuantizaciones del modelo base en safetensors. Esta entrenado exclusivamente en ingles y utiliza la licencia Gemma de Google, lo que condiciona su uso comercial.

Su relevancia actual es doble: por un lado, aplica el paradigma de razonamiento previo (thinking) a un dominio de entretenimiento interactivo, donde la planificacion en personaje mejora la consistencia de las respuestas; por otro, publica cuantizaciones GGUF que permiten ejecutar el modelo en hardware de consumo, algo poco habitual en modelos de investigacion con articulo asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Gemma 3 4B); no disponible el detalle exacto de capas y dimensiones |
| Parametros totales | 3.880.263.168 (aproximadamente 3,9 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (el repo contiene cuantizaciones; no se detallan los niveles concretos, p. ej. Q4_K_M, Q8_0) |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (terminos de la licencia Gemma de Google) |
| Formato de pesos | GGUF (pesos originales en safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado sobre Gemma 3 4B, un transformer denso de la familia Gemma 3 de Google. No se dispone de informacion detallada sobre el numero de capas, la dimension del modelo, el mecanismo de atencion ni la ventana de contexto efectiva, mas alla de lo heredado del modelo base. Tampoco se especifican en la informacion proporcionada los hiperparametros de entrenamiento, el numero de tokens vistos, ni si se aplicaron tecnicas de RLHF o DPO.

El dataset de ajuste es chimbiwide/NPC-RP-Pre-Thinking, orientado a roleplay de NPC con planificacion previa. La innovacion principal es el formato de salida: el modelo genera primero un bloque `<think>...</think>` con la intencion y el plan de respuesta del personaje, y a continuacion emite la respuesta conversacional. Este esquema de "pre-thinking" separa la deliberacion interna de la produccion linguistica, lo que favorece la coherencia con el trasfondo y la ubicacion definidos en el prompt de sistema. El modelo esta pensado para recibir un system prompt estructurado con marcadores de nombre, trasfondo y localizacion, y para iniciar la conversacion con un saludo al jugador.

## Capacidades

- Generacion de texto conversacional en ingles con estilo y vocabulario ajustados al personaje definido en el prompt de sistema.
- Planificacion interna mediante bloques `<think>...</think>` antes de cada respuesta, lo que permite inspeccionar la intencion del personaje.
- Interpretacion de rol (roleplay) con referencia explicita a trasfondo y entorno actual.
- Reactividad al turno del jugador: el prompt recomendado instruye a reaccionar a las palabras e intenciones del jugador.
- Conversacion multi-turno orientada a dialogos de videojuego.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues distintas del ingles.

## Casos de uso

- NPC de videojuego conversacional: el modelo se integra en el bucle de dialogo de un juego y genera respuestas en personaje; el bloque `<think>` permite registrar o depurar la intencion del NPC antes de mostrarla al jugador.
- Prototipado rapido de personajes: con el system prompt recomendado se define nombre, trasfondo y localizacion, y se prueba el comportamiento del NPC sin reentrenar, lo que acelera la iteracion de guion y diseno.
- Investigacion en IA para entretenimiento: al estar asociado a un articulo de AIIDE-2026, sirve como referencia reproducible para estudiar el efecto del razonamiento previo en la coherencia de personajes.
- Despliegue local en hardware de consumo: las cuantizaciones GGUF permiten ejecutar el modelo con llama.cpp u Ollama en equipos sin GPU de datacenter, util para demos y pruebas offline.
- Modding y experiencias interactivas independientes: comunidades de mods pueden incorporar el modelo en motores como Skyrim o proyectos propios para sustituir dialogos estaticos por conversaciones dinamicas.
- Evaluacion comparativa de estrategias de prompting: el formato `<think>` facilita experimentos A/B entre respuestas con y sin planificacion previa para medir consistencia de personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de 3,9 B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 2,5 a 3,5 GB y las de 8 bits del orden de 4 a 5 GB, sin contar el contexto.
- GPU recomendadas: no especificadas por el autor; por tamano, el modelo es apto para GPU de consumo con al menos 6-8 GB de VRAM en cuantizaciones bajas.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas tipo RTX 3060, RTX 4060 o superiores, aunque el autor no lo documenta.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Gemma3NPC-4B-pre-thinking-GGUF | 3,9 B | No disponible | Gemma | Roleplay de NPC con pre-thinking |
| Gemma 3 4B (base) | 4 B | No disponible en esta ficha | Gemma | Modelo generalista multimodal de Google |
| Alternativas de roleplay GGUF de tamano similar | No disponible | No disponible | Variable | Ajustes finos comunitarios para conversacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Riesgo de alucinacion: como modelo generativo de 3,9 B, puede inventar detalles incoherentes con el trasfondo del personaje, especialmente en conversaciones largas.
- No se documenta la longitud de contexto efectiva, lo que limita la planificacion de dialogos extensos.
- El bloque `<think>` forma parte de la salida del modelo; en produccion debe filtrarse o procesarse para no mostrarlo al jugador.
- La licencia Gemma de Google impone restricciones y obligaciones especificas para uso comercial; es necesario revisar sus terminos antes de desplegar el modelo en un producto.
- El modelo esta especializado en roleplay; su utilidad para tareas generales de codigo, matematicas o razonamiento es limitada.
- Popularidad muy baja (14 descargas, 0 likes) y sin validacion externa documentada; conviene evaluarlo en el caso de uso concreto antes de adoptarlo.
- No se detallan los niveles de cuantizacion incluidos en el repositorio, por lo que hay que inspeccionar los archivos antes de elegir uno.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/chimbiwide/Gemma3NPC-4B-pre-thinking-GGUF
- Pesos originales: https://huggingface.co/chimbiwide/Gemma3NPC-4B-pre-thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/chimbiwide/NPC-RP-Pre-Thinking
- Repositorio del proyecto: https://github.com/KeeganCarey/Post-Thinking-AIIDE
- Articulo (DOI): https://doi.org/10.1609/aiide.v22i1.43599
- Conferencia AIIDE-2026: https://sites.google.com/view/aiide2026/home
