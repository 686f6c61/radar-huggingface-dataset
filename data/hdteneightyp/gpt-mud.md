# HDTenEightyP/GPT-MUD

## Resumen

GPT-MUD es un modelo de lenguaje de 47 millones de parametros desarrollado por el usuario HDTenEightyP y publicado en Hugging Face bajo licencia MIT. Su proposito es muy concreto: interpretar personajes no jugadores (NPC) en videojuegos, especialmente en entornos de tipo MUD (Multi-User Dungeon), donde el modelo debe responder a las acciones e interacciones del jugador manteniendo la coherencia del personaje.

Se trata de un modelo de arquitectura transformer de tipo GPT-2 (la etiqueta del repositorio lo confirma), con 6 capas, 4 cabezas de atencion y una dimension de embedding de 256. A pesar de su tamano reducido, declara una ventana de contexto de 65.536 tokens, lo que resulta llamativo para un modelo de esta escala y sugiere que el autor ha configurado la longitud maxima de posiciones del transformer por encima de lo habitual en GPT-2.

El modelo esta entrenado con el corpus ClubFloyd, un conjunto de datos derivado de partidas de aventuras conversacionales. Su interes practico radica en que ocupa menos de 1 GB en el repositorio y puede ejecutarse en hardware muy modesto, lo que lo hace atractivo para integrarlo dentro de un motor de juego sin depender de servicios en la nube. Es un modelo de nicho, con muy pocas descargas (15) y sin pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT-2 (decoder-only) |
| Parametros totales | 47.187.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (segun model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a GGUF no publicada) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica una arquitectura de 6 capas, 4 cabezas de atencion y 256 dimensiones de embedding, coherente con un transformer decoder-only de la familia GPT-2 a pequena escala. El tokenizador es `cl100k_base`, el mismo que emplean los modelos GPT-3.5 y GPT-4 de OpenAI, lo que facilita la integracion con herramientas y pipelines que ya asumen ese vocabulario. La ventana de contexto declarada es de 65.536 tokens, un valor que en la practica excede con mucho lo que un modelo de 6 capas y 256 dimensiones puede aprovechar de forma efectiva, pero que el autor documenta explicitamente.

El entrenamiento se realizo sobre el corpus ClubFloyd, descrito como un conjunto de datos de tipo MUD. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de ajuste fino con RLHF o DPO. Tampoco se detalla si se aplicaron tecnicas como decodificacion especulativa, atencion lineal o variantes de atencion eficiente. Todo ello debe considerarse no disponible.

## Capacidades

- Generacion de texto orientada a dialogo e interpretacion de personajes, entrenada especificamente sobre interacciones de aventuras conversacionales.
- Respuesta a acciones del jugador en el formato tipico de un MUD (comandos, descripciones de entorno, reacciones de NPC).
- Generacion de texto en ingles; no se declaran capacidades multilingues.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision, audio ni otras capacidades multimodales.
- Tokenizador `cl100k_base`, compatible con el ecosistema de herramientas construido alrededor de los modelos GPT de OpenAI.

## Casos de uso

- NPCs en videojuegos de rol o aventuras conversacionales: el modelo puede generar respuestas de personajes a las acciones del jugador, manteniendo el tono y el rol definidos en el prompt de sistema. Su tamano reducido permite ejecutarlo localmente dentro del propio juego.
- Prototipado rapido de sistemas de dialogo: al ocupar menos de 1 GB y requerir poca VRAM, sirve para validar mecanicas de conversacion antes de invertir en modelos mayores.
- Generacion de descripciones de entornos y objetos: entrenado sobre MUDs, puede producir texto descriptivo coherente con el estilo de las aventuras de texto clasicas.
- Simulacion de partidas de MUD para pruebas automatizadas: util para generar trazas de interaccion que alimenten tests de motores de juego o de sistemas de parsing de comandos.
- Educacion y demostraciones: su licencia MIT y su bajo coste lo hacen adecuado para talleres o cursos donde se ensena a integrar modelos de lenguaje en juegos sin infraestructura dedicada.
- Investigacion sobre modelos pequenos en dominios acotados: permite estudiar el comportamiento de un LLM de 47M de parametros especializado en un corpus concreto y compararlo con modelos generalistas del mismo tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP32, los 47,2 millones de parametros ocupan aproximadamente 189 MB; en FP16, unos 94 MB; en cuantizacion de 8 bits, alrededor de 47 MB. El repositorio completo ocupa 0,8 GB, lo que incluye pesos y posibles artefactos adicionales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; una RTX 3060, RTX 4060 o incluso una GPU integrada moderna pueden ejecutar el modelo.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU.
- Opciones de despliegue: al ser un modelo GPT-2 en safetensors, puede cargarse con la libreria `transformers` de Hugging Face y servirse con text-generation-inference (TGI), segun la etiqueta del repositorio. No se han publicado pesos en GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa por parte del usuario.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GPT-MUD | 47,2 M | 65.536 tokens (declarado) | MIT | NPCs y MUDs |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Texto general |
| DistilGPT-2 | 82 M | 1.024 tokens | MIT | Texto general destilado |
| TinyLlama | 1,1 B | 2.048 tokens | Apache 2.0 | Texto general |

La comparativa se limita a parametros, contexto y licencia, ya que no se han publicado benchmarks de GPT-MUD que permitan contrastar rendimiento. Frente a GPT-2 small y DistilGPT-2, GPT-MUD es mas pequeno y esta especializado en un dominio concreto, lo que puede suponer una ventaja en tareas de NPC pero un rendimiento inferior en texto general. Frente a TinyLlama, la diferencia de escala es de mas de veinte veces, por lo que no son directamente comparables en capacidad.

## Limitaciones y advertencias

- Modelo de nicho: entrenado sobre un corpus de MUDs, su comportamiento fuera de ese dominio puede ser pobre o incoherente.
- Solo ingles: no se declaran capacidades en otros idiomas, por lo que su uso en castellano no esta respaldado.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar detalles del entorno o del personaje; en un juego esto puede romper la coherencia narrativa.
- Ventana de contexto declarada de 65.536 tokens: en un modelo de 6 capas y 256 dimensiones, la atencion efectiva sobre contextos muy largos es cuestionable y no hay evaluaciones publicadas que la respalden.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que cualquier decision de produccion deberia acompanarse de una evaluacion propia.
- Licencia MIT: permite uso comercial y modificacion, pero conviene revisar las condiciones del corpus ClubFloyd, ya que la model card no detalla restricciones sobre los datos de entrenamiento.
- Sin pipeline declarado en Hugging Face: la integracion requiere cargar el modelo manualmente con `transformers` o configurar el servicio correspondiente.
- Comunidad muy reducida (15 descargas, 2 likes): no hay garantias de mantenimiento ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HDTenEightyP/GPT-MUD
