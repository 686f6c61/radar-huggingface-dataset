# HuggingFaceM4/reachy-gesture-student-minilm-e15-t4-full-q8b

## Resumen

Reachy-gesture-student-minilm-e15-t4-full-q8b es un clasificador de texto multilingue de 118 millones de parametros desarrollado por HuggingFaceM4 para el robot social Reachy Mini de Pollen Robotics. Su funcion es decidir, para cada frase que el robot pronuncia o escucha, que gesto emocional debe reproducir entre un catalogo de movimientos pregrabados (22 para frases emitidas, 15 para frases recibidas, mas la opcion "ninguno"). El modelo resuelve un problema de latencia en robotica conversacional: permite disparar el gesto de forma sincronizada con el audio de la frase sin consultar al LLM ni anadir espera perceptible a la interaccion.

Tecnicamente es un destilado del encoder `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, al que se anaden dos cabezas lineales de clasificacion independientes (`say` y `react`). Se distribuye cuantizado a int8 en formato ONNX (118 MB) y se ejecuta en la Raspberry Pi CM4 del robot en 62-97 ms con un solo hilo de CPU, lo que lo hace viable en hardware embebido sin acelerador.

Su relevancia actual radica en que ejemplifica el patron de "modelo pequeno especializado acoplado a un agente mayor": el LLM gestiona el dialogo y este clasificador resuelve una subtarea perceptiva con latencia acotada. La licencia Apache 2.0 y el soporte de 15 idiomas de entrenamiento (probado en mas de 20) facilitan su reutilizacion en otros robots sociales o sistemas de avatares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MiniLM-L12 multilingue con dos cabezas lineales (`say`, `react`) |
| Parametros totales | 117.653.760 (118M, incluye encoder y cabezas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens efectivos (se conservan los ultimos 64 tokens de cada turno) |
| Tipos de cuantizacion | int8 (fichero `model_qint8.onnx`); pesos base en safetensors sin cuantizar |
| Idiomas soportados | en, es, fr, de, it, pt, nl, pl, ru, tr, ar, hi, zh, ja, ko (entrenamiento); probado en mas de 20 |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`model_qint8.onnx`), safetensors, cabezas en `gesture_heads.npz` |

## Arquitectura y entrenamiento

El modelo parte del encoder `paraphrase-multilingual-MiniLM-L12-v2` (12 capas, dimension oculta 384, 118M parametros). Sobre la salida del encoder se aplica mean-pooling de los embeddings de token y normalizacion L2, produciendo un vector de 384 dimensiones. Ese vector se escala por 10 y se pasa por una de dos capas lineales segun el rol de la frase: `say` para lo que el robot pronuncia (22 clases mas `none`) y `react` para lo que escucha (15 clases mas `none`). La separacion de cabezas responde a una decision de diseno: el gesto adecuado depende de quien habla, de modo que "mi perro murio ayer" debe producir `downcast1` en la cabeza `react`, no una celebracion por haber comprendido.

El entrenamiento se realizo por destilacion sobre aproximadamente 38.000 frases etiquetadas, generadas por `google/gemma-4-31B-it` y `openai/gpt-oss-120b` en 15 idiomas, complementadas con texto real de chat y social procedente de OpenAssistant (oasst2) y GoEmotions. Para turnos largos se truncan los tokens conservando el primero y los ultimos 63, de forma que el robot reacciona a como termino la persona. En inferencia se aplica softmax sobre los logits y se reproduce el gesto ganador solo si su probabilidad alcanza 0,3; en caso contrario, o si gana `none`, no hay gesto. No se documentan fases de RLHF ni DPO.

## Capacidades

- Clasificacion de texto multietiqueta en dos dominios funcionales: gestos para frases emitidas (`say`) y gestos de reaccion para frases escuchadas (`react`).
- Seleccion entre 22 gestos en `say` (`success1`, `success2`, `laughing2`, `grateful1`, `loving1`, `welcoming2`, `helpful1`, `surprised1`, `amazed1`, `relief1`, `calming1`, `thoughtful2`, `understanding2`, `yes1`, `no1`, `uncertain1`, `resigned1`, `downcast1`, `fear1`, `disgusted1`, `irritated1`, `rage1`) y 15 en `react` (subconjunto sin los gestos que solo tienen sentido como respuesta propia).
- Abstencion explicita mediante la clase `none` y umbral de confianza configurable (0,3 por defecto).
- Multilingue real: entrenado en 15 idiomas y validado en mas de 20, incluyendo escrituras no latinas (arabe, hindi, chino, japones, coreano).
- Inferencia en CPU de un solo hilo compatible con ONNX Runtime (`CPUExecutionProvider`) y con text-embeddings-inference.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Animacion gestual sincronizada en Reachy Mini: el modelo clasifica cada frase del turno antes de que empiece el audio y el gestor de movimiento reproduce el gesto recortado a un maximo de 3 segundos, evitando latencia anadida a la conversacion.
- Robots sociales de bajo coste con hardware embebido: al ejecutarse en una Raspberry Pi CM4 en 62-97 ms por frase, permite anadir expresividad a plataformas sin GPU dedicada.
- Sistemas de avatares conversacionales: la cabeza `say` puede mapearse a animaciones de un avatar 2D o 3D y la cabeza `react` a reacciones del interlocutor virtual, reutilizando el mismo pipeline de embeddings.
- Moderacion emocional de respuestas: la clase `calming1` y `downcast1` permiten que un asistente detecte turnos del usuario con carga emocional negativa y ajuste su respuesta gestual o textual.
- Investigacion en interaccion humano-robot: el catalogo fijo de 22 gestos y la salida probabilistica con umbral facilitan experimentos controlados sobre percepcion de expresividad y abstención.
- Preprocesado ligero en pipelines de dialogo: como clasificador de 118 MB puede desplegarse junto a un LLM mayor para etiquetar turnos en tiempo real sin competir por VRAM, al ejecutarse en CPU.
- Filtrado y enrutado de turnos: la deteccion de `none` con alta confianza sirve para descartar frases neutras (por ejemplo, "Le train part a 18 h 40") y reservar recursos de animacion solo cuando aporta valor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta latencias de inferencia en el hardware objetivo:

| Metrica | Valor |
|---|---|
| Latencia mediana, turnos escuchados (CM4, 1 hilo) | 62 ms |
| Latencia mediana, frases emitidas (CM4, 1 hilo) | 97 ms |
| Tamano del fichero ONNX int8 | 118 MB |
| Tamano del repositorio | 0,8 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo corre en CPU. En GPU, el fichero int8 ocupa 118 MB y los pesos sin cuantizar en safetensors aproximadamente 0,47 GB en fp32.
- GPU recomendadas: no aplica para el caso de uso objetivo. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) puede ejecutarlo si se desea, pero no aporta ventaja frente a CPU para este tamano.
- Cabe en GPU consumer: si, con holgura; tambien en Raspberry Pi CM4, que es el despliegue de referencia.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` (documentado), text-embeddings-inference (tag del repo), y conversion a otros runtimes ONNX si se requiere.
- Latencia y throughput: 62 ms medianos para turnos escuchados y 97 ms para frases emitidas en CM4 con un hilo; el throughput en hardware x86 no se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reachy-gesture-student-minilm-e15-t4-full-q8b | 118M | 64 tokens | Clasificacion de gestos (say/react) | apache-2.0 | Hugging Face, ONNX int8 |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (modelo base) | 118M | 128 tokens (tipico) | Embeddings de frases | apache-2.0 | Hugging Face |
| Clasificadores de emociones tipo GoEmotions (BERT/RoBERTa) | 110M-125M | 512 tokens | Clasificacion de emociones en texto | variable | Hugging Face |

La comparacion con el modelo base es directa: comparten encoder y numero de parametros, pero el modelo base produce embeddings genericos mientras que este anade cabezas especificas para el catalogo de gestos de Reachy Mini. Frente a clasificadores de emociones genericos, la diferencia clave es la taxonomia cerrada y accionable (movimientos concretos del robot) y la separacion entre lo dicho y lo escuchado, que los clasificadores de emociones estandar no contemplan.

## Limitaciones y advertencias

- El contexto efectivo es de 64 tokens: frases largas se truncan conservando solo el final, por lo que el modelo puede perder informacion relevante del inicio del turno.
- La taxonomia esta cerrada a los gestos de `pollen-robotics/reachy-mini-emotions-library`; no es un clasificador de emociones general y sus etiquetas no son transferibles directamente a otras taxonomias sin reentrenamiento.
- El umbral de 0,3 es un valor por defecto; en produccion conviene calibrarlo por idioma e idioma de despliegue, ya que la distribucion de confianza puede variar.
- Las frases de entrenamiento fueron generadas por LLM (Gemma y GPT-OSS) ademas de datos reales de OpenAssistant y GoEmotions; puede existir sesgo hacia el estilo de esos generadores y hacia los temas cubiertos en los datasets de chat.
- Riesgo de alucinacion de etiqueta: al ser un clasificador con softmax, siempre devuelve una distribucion; la abstención depende del umbral y de la clase `none`, no de una verificacion semantica.
- El rendimiento en idiomas fuera de los 15 de entrenamiento (los "mas de 20" probados) no esta cuantificado en la model card.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende del tokenizer y encoder de `paraphrase-multilingual-MiniLM-L12-v2`, cuya licencia debe verificarse por separado.
- No apto para inferencia de emociones humanas con fines clinicos o de diagnostico; su salida es una etiqueta de animacion, no una medicion psicologica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuggingFaceM4/reachy-gesture-student-minilm-e15-t4-full-q8b
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Libreria de emociones de Reachy Mini: https://huggingface.co/datasets/pollen-robotics/reachy-mini-emotions-library
- Aplicacion de conversacion de Reachy Mini: https://github.com/pollen-robotics/reachy_mini_conversation_app
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
