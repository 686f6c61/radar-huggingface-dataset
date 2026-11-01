# MichaelHugging/npc-kb-qwen3-4b-v10-es

## Resumen

npc-kb-qwen3-4b-v10-es es un adaptador LoRA (entrenado con QLoRA sobre Unsloth) que se monta sobre el modelo base Qwen3-4B-Instruct-2507 en su variante cuantizada a 4 bits. Lo desarrolla el usuario MichaelHugging y su proposito es especializar un modelo de 4.000 millones de parametros para interpretar personajes no jugadores (NPC) de fantasia medieval que respetan estrictamente los limites de conocimiento de su mundo. Cuando el jugador introduce un concepto anacronico (un telefono, germenes, Python o una pregunta sobre si es una IA), el NPC reacciona como lo haria su personaje ante algo desconocido, sin filtrar la respuesta ni demostrar que comprende el concepto.

El adaptador resuelve un problema concreto de diseno de videojuegos y experiencias conversacionales: mantener la coherencia diegetica en dialogos generados por LLM. En lugar de depender de instrucciones anti-fuga en el system prompt, el comportamiento se ha aprendido durante el ajuste fino, de modo que la tarjeta de personaje puede enviarse como texto plano sin salvaguardas adicionales.

Tecnicamente es un LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones q, k, v, o, gate, up y down de todas las capas del transformer base. El repositorio pesa 0,1 GB (solo los pesos del adaptador en safetensors), la licencia es Apache 2.0 y el modelo esta etiquetado unicamente para ingles. Su relevancia actual radica en que demuestra que un modelo pequeno y ajustado puede acercarse a modelos frontera en adherencia a especificacion para una tarea estrecha, con un coste de entrenamiento de unos 10 minutos en una A100 40 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | 4B en el modelo base; el adaptador LoRA ocupa 0,1 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens durante entrenamiento; contexto nativo del base no especificado en la informacion disponible |
| Tipos de cuantizacion | Base cargado en 4-bit (bnb-4bit) durante entrenamiento; el adaptador se aplica sobre el base en bfloat16 en inferencia |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA usando Unsloth: el modelo base Qwen3-4B-Instruct-2507 se carga cuantizado a 4 bits y se inyectan matrices de bajo rango (r=16, alpha=32, dropout=0) en las proyecciones q, k, v, o, gate, up y down de todas las capas. La perdida se calcula exclusivamente sobre las respuestas del NPC, no sobre el turno del jugador. Los hiperparametros son learning rate 2e-4 con schedule coseno, warmup del 5%, batch efectivo de 16, longitud maxima de 2048 tokens y semilla 3407. Se aplica early stopping con hasta 10 epocas, validacion cada 10 pasos y paciencia de 3; el mejor checkpoint se alcanza en el paso 130 (2 epocas) con perdida de validacion 2,058. El entrenamiento completo se ejecuta en una unica A100 40 GB de Colab en aproximadamente 10 minutos.

Los datos provienen del dataset `MichaelHugging/npc-knowledge-boundary`, carpeta `v10/` (commit d0a3686), con 1.262 conversaciones multi-turno distribuidas en 12 mundos y una mezcla del 50% de jugadores normales y 50% de jugadores concisos. De ellas, 852 fueron generadas por GPT-6.1 Sol bajo un atacante en vivo y posteriormente filtradas y reescritas contra estandares calificados manualmente; las otras 410 las escribio Claude Opus en 8 mundos nuevos a partir de un libro de reglas derivado del feedback del propietario del proyecto, con revision respuesta por respuesta. El split se realiza por mundo, no por conversacion, de modo que el conjunto de entrenamiento contiene 1.040 conversaciones y el de evaluacion incluye personajes de Thornbury no vistos en entrenamiento y el mundo completo de Greyhollow, nunca utilizado durante el ajuste.

## Capacidades

- Generacion de dialogo en rol (roleplay) con voz y registro consistentes con una tarjeta de personaje en texto plano.
- Respeto de limites de conocimiento: el NPC no revela informacion fuera de su mundo y reacciona con extrañeza ante conceptos anacronicos.
- Conversacion multi-turno con contexto de hasta 2048 tokens.
- Adaptacion de longitud de respuesta al momento conversacional (mediana de 24 palabras en el modelo ajustado frente a 264 del base con tarjeta simple).
- Interpretacion de tarjetas de personaje con campos estructurados: nombre, rol, edad, personalidad, habla, conocimientos, limites, situacion en el pueblo y secretos.
- Comportamiento aprendido sin instrucciones anti-fuga en el system prompt.
- Capacidades del modelo base Qwen3-4B-Instruct-2507 (razonamiento, codigo, matematicas, tool calling) teoricamente presentes pero no evaluadas ni garantizadas tras el ajuste.
- No se documenta soporte de vision, audio, agentes multi-paso ni thinking mode especifico para este adaptador.

## Casos de uso

- NPC en videojuegos de rol: el adaptador se integra en el motor de dialogo del juego enviando la tarjeta del personaje como system prompt y el turno del jugador como user; el NPC responde en personaje y desvia preguntas fuera de mundo sin romper la inmersion.
- Experiencias interactivas de fantasia medieval en web o Discord: se despliega el modelo base con el adaptador sobre una GPU consumer y se sirve un chatbot de personaje con contexto de 2048 tokens suficiente para sesiones de juego cortas.
- Prototipado rapido de narrativa emergente: escritores y disenadores pueden iterar tarjetas de personaje y comprobar como responde el NPC ante preguntas adversarias sin reentrenar, gracias a que el comportamiento esta en el adaptador.
- Evaluacion de robustez diegetica: el conjunto de 30 escenarios con sondas adversarias sirve como banco de pruebas para medir fugas de conocimiento en sistemas de NPC antes de produccion.
- Investigacion en ajuste fino eficiente: el pipeline QLoRA con Unsloth en una A100 40 GB durante 10 minutos es reproducible como caso de estudio de especializacion de modelos pequenos.
- Moderacion de coherencia en mundos ficticios: el adaptador puede emplearse para validar que respuestas de otros modelos respetan el canon de un mundo, comparando su reaccion ante terminos anacronicos.
- Demos educativas sobre limites de conocimiento en LLM: ilustra de forma tangible la diferencia entre saber algo y comportarse como si no se supiera.

## Benchmarks y rendimiento

Resultados publicados por el autor en `eval_v2` (30 escenarios, 3 muestras por escenario, 342 respuestas por modelo, cinco comprobaciones binarias por respuesta: sin fuga, reaccion como desconocido, conocimiento, longitud y voz). La adherencia a especificacion es la proporcion de respuestas que superan las cinco comprobaciones.

| Modelo | Adherencia (juez Opus) | Adherencia (juez Argon) | Sin fuga (Opus / Argon) | Palabras NPC, mediana |
|---|---|---|---|---|
| Base Qwen3-4B, tarjeta simple | 0,0 | 0,0 | 75,4 / 73,7 | 264 |
| Base Qwen3-4B, mejor prompt | 27,6 | 15,3 | 84,2 / 82,5 | 107 |
| Tuned v7 (732 conversaciones) | 65,9 | 58,9 | 98,5 / 98,8 | 22 |
| Este modelo, v10 (1.040) | 75,9 (70–82) | 57,5 (49–66) | 98,8 / 98,2 | 24 |
| Gemini 3.8 Flash, mejor prompt | 89,1 | 78,3 | 95,3 / 97,6 | 69 |
| GPT-6 Luna, mejor prompt | 96,7 | 89,0 | 99,1 / 97,9 | 28 |

Notas del autor: Opus es Claude Opus en pools ciegos con nombres de modelo ocultos y participo en la generacion de parte de los datos de entrenamiento de v10, por lo que puntua mas alto; Argon es Gemini 4 Argon como verificacion independiente. Frente al base, ambos jueces coinciden en una mejora grande, con fugas reducidas a aproximadamente 1 respuesta de cada 50 y respuestas cuatro veces mas cortas. Frente a modelos frontera con sus mejores prompts, este modelo queda por detras. En el mundo nunca visto (Greyhollow), Argon situa a v10 11 puntos por delante de v7 (62,8 frente a 51,7). Los intervalos de confianza son de aproximadamente ±7 puntos.

## Requisitos de hardware

- VRAM estimada para inferencia: el base en 4-bit ocupa aproximadamente 2,5–3 GB de pesos; con el adaptador en bfloat16 y overhead de activaciones y KV cache, se recomienda un minimo de 6–8 GB de VRAM para contexto de 2048 tokens.
- GPU recomendadas: A100 40 GB (usada en entrenamiento), H100 para despliegue de mayor throughput, RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia comoda.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) usando el base cuantizado a 4 bits.
- Opciones de despliegue: transformers + peft (ruta documentada por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama si se fusiona el adaptador en pesos GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento completo tarda unos 10 minutos en una A100 40 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Adherencia (Opus / Argon) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| npc-kb-qwen3-4b-v10-es | 4B (base) + LoRA | 2048 en entrenamiento | 75,9 / 57,5 | apache-2.0 | HuggingFace (2 descargas) |
| Qwen3-4B-Instruct-2507 (base) | 4B | contexto nativo del base | 0,0 / 0,0 con tarjeta simple; 27,6 / 15,3 con mejor prompt | apache-2.0 | HuggingFace |
| Tuned v7 (version anterior del mismo autor) | 4B (base) + LoRA | 2048 | 65,9 / 58,9 | no disponible | no disponible publicamente en la informacion |
| GPT-6 Luna (frontera, mejor prompt) | no disponible | no disponible | 96,7 / 89,0 | propietaria | API comercial |
| Gemini 3.8 Flash (frontera, mejor prompt) | no disponible | no disponible | 89,1 / 78,3 | propietaria | API comercial |

La comparativa relevante es contra el modelo base sin ajustar (mejora sustancial en adherencia y reduccion de fugas) y contra modelos frontera con prompting optimizado, que siguen por delante en voz y conocimiento. No se dispone de comparativas con otros adaptadores de NPC de la misma categoria.

## Limitaciones y advertencias

- Personajes cuya tarjeta exige una personalidad muy marcada (ninos, fanaticos) pueden resultar mas planos de lo que la tarjeta indica.
- Queda por detras de los modelos frontera en voz y en aprovechamiento completo del conocimiento de la tarjeta.
- Evaluado sobre 30 escenarios en dos mundos, con intervalos de aproximadamente ±7 puntos; la generalizacion a otros generos o formatos de tarjeta no esta probada.
- Disenado para tarjetas de fantasia medieval en el formato especifico del autor; otros generos no han sido testeados.
- Solo etiquetado para ingles; el castellano no esta soportado oficialmente pese al sufijo `-es` del identificador.
- Riesgo de alucinacion dentro del personaje: el NPC puede inventar detalles del mundo no presentes en la tarjeta si esta es incompleta.
- Sesgos: no documentados por el autor; hereda los sesgos del modelo base Qwen3-4B-Instruct-2507 y de los datos sinteticos generados por GPT-6.1 Sol y Claude Opus.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene sus propios terminos que deben verificarse por separado.
- El juez Opus participo en la generacion de datos de entrenamiento, lo que puede inflar la puntuacion de adherencia reportada; el juez Argon independiente otorga una puntuacion 18 puntos inferior.
- No hay garantia de que las capacidades generales del base (codigo, tool calling, matematicas) se conserven intactas tras el ajuste, ya que la perdida se calculo solo sobre respuestas de NPC.
- El repositorio tiene 2 descargas y 0 likes, sin validacion de la comunidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/MichaelHugging/npc-kb-qwen3-4b-v10-es
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit
- Modelo base original (para chat template): https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/MichaelHugging/npc-knowledge-boundary
- Repositorio del proyecto y tablas completas: https://labs.gauntletai.com/michaelchuang/slm-fine-tuning
