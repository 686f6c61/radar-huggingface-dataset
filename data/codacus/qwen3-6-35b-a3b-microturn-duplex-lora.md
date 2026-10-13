# codacus/Qwen3.6-35B-A3B-MicroTurn-Duplex-LoRA

## Resumen

Qwen3.6-35B-A3B MicroTurn Duplex LoRA es un adaptador LoRA publicado por el usuario codacus (autor del canal Codacus) que ensena a un LLM de texto convencional a participar en una llamada de voz en vivo en la que ambas partes pueden hablar a la vez. No hay detector de actividad de voz en el bucle: cada 0,6 segundos el modelo lee las pocas palabras que el microfono acaba de captar y decide entre escribir unas pocas palabras para decir a continuacion o emitir el token especial `<listen>` para no anadir nada. El adaptador es el artefacto que acompana al video "Can a Local LLM Speak and Listen at the Same Time?".

Tecnicamente no es un modelo completo, sino un adaptador de 3.833.856 parametros (rango 32, alpha 64, F32) que se aplica sobre Qwen/Qwen3.6-35B-A3B, un modelo MoE de aproximadamente 35.000 millones de parametros totales y 3.000 millones activos segun su denominacion. El adaptador solo modifica las cuatro ultimas capas (36 a 39: tres capas delta-net y una capa de atencion completa), en concreto las proyecciones de atencion, delta-net y expertos compartidos, de modo que el modelo conserva todo su conocimiento previo y solo aprende una cosa nueva: la temporizacion conversacional.

Su relevancia es doble. Por un lado, demuestra que el paradigma de micro-turnos de DuplexCascade (Yang, Fujita y Sudo, 2026) se puede trasladar a un modelo grande y ejecutar en hardware de consumo: la receta documentada corre en una unica RTX 3060 de 12 GB y responde un tick en unos 230 ms de mediana, muy por debajo del presupuesto de 600 ms. Por otro lado, cuantifica una mejora concreta y medible: en llamadas de validacion, el modelo base sin adaptador esperaba durante una pausa a mitad de frase en 92 de 474 ocasiones, frente a 456 de 474 con el primer adaptador entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer MoE hibrido (capas delta-net y de atencion completa) |
| Parametros totales | 3.833.856 en el adaptador (dato real de safetensors); el modelo base Qwen3.6-35B-A3B declara 35.000 millones de parametros segun su denominacion |
| Parametros activos | Aproximadamente 3.000 millones en el modelo base (sufijo A3B de la denominacion); el adaptador no es MoE |
| Longitud de contexto | No disponible para el modelo base; la receta de despliegue documentada usa `-c 32768` |
| Tipos de cuantizacion | Adaptador en F32 (GGUF LoRA); para el modelo base solo se ha probado `Qwen3.6-35B-A3B-UD-Q4_K_M.gguf`, otras cuantizaciones no estan testeadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (adaptador); la licencia del modelo base no consta en la informacion disponible |
| Formato de pesos | GGUF en formato LoRA de llama.cpp (15 MB, F32, rango 32, alpha 64) |
| Capas modificadas | Capas 36 a 39 (tres delta-net y una de atencion completa): proyecciones de atencion, delta-net y expertos compartidos |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Fecha de publicacion | 12 de octubre de 2026 (ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

El adaptador se inserta en las cuatro ultimas capas del modelo base. Segun la model card, tres de ellas son capas delta-net (variantes de atencion lineal o recurrentes con estado) y una es de atencion completa, lo que encaja con una arquitectura hibrida dentro de un transformer con mezcla de expertos. El adaptador afecta exclusivamente a las proyecciones de atencion, delta-net y expertos compartidos de esas cuatro capas; todo lo que esta por debajo de la capa 36 queda intacto. La consecuencia practica es que el modelo no reajusta su conocimiento factual ni su estilo general, sino unicamente la decision de hablar o callar y el ritmo de emision.

El entrenamiento se realizo sobre llamadas simuladas con sus dialogos escritos subyacentes, incluidos en el directorio `dataset/` del repositorio con su propia tarjeta. El autor indica que el adaptador se entreno en aproximadamente tres horas sobre dos RTX 3060, un coste muy bajo para el comportamiento que se obtiene. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO; si se documenta que el adaptador publicado es el "primer adaptador entrenado" y se compara su comportamiento con el del modelo base. No se menciona ninguna innovacion de decodificacion especulativa ni de atencion lineal adicional mas alla de la propia arquitectura del modelo base.

La innovacion funcional es el micro-turno: en lugar de segmentar la conversacion en turnos discretos, el sistema trocea el tiempo en intervalos de 0,6 segundos y en cada uno el modelo recibe el fragmento transcrito por el reconocimiento de voz (o `<no voice>`) y responde con hasta tres palabras nuevas o con `<listen>`. Como cada tick anade un mensaje de usuario y uno de asistente sin editar nunca lo ya enviado, la cache de prompt de llama.cpp reanuda el estado en cada peticion, lo que mantiene la latencia baja.

## Capacidades

- Toma de turno full-duplex: decide en cada tick de 0,6 segundos si habla o escucha, sin detector de actividad de voz externo.
- Emision incremental: produce hasta tres palabras nuevas por tick, lo que permite interrumpir y ser interrumpido a mitad de frase.
- Token de escucha explicita: `<listen>` como salida unica y de un solo token, con probabilidad calculada en la primera posicion.
- Espera en pausas intra-frase: aprende a no apropiarse del turno cuando el hablante humano hace una pausa breve.
- Intervencion proactiva: en el ejemplo publicado, tras once ticks escuchando una conversacion sobre mezclar lejia y amoniaco, emite "Do not mix those chemicals. It creates toxic gas. Please stop." y vuelve a `<listen>`.
- Entrada de texto en formato de transcripcion en streaming por tick, incluido el marcador `<no voice>`.
- Multilingue: no, solo ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso, vision o audio nativo: no disponibles; el audio se gestiona con reconocimiento de voz y sintesis externos.
- Modo de pensamiento: no aplicable; el protocolo exige enviar el historial sin bloque de pensamiento en los turnos de asistente previos.

## Casos de uso

- Asistente telefonico con barge-in real: colocando delante un reconocimiento de voz en streaming (el video usa Kyutai `stt-1b-en_fr`) y detras cualquier sintesis de voz, el adaptador permite que el usuario interrumpa al asistente a media frase sin que el sistema corte la respuesta por error, ya que la decision de callar se toma cada 600 ms y no por deteccion de energia en el audio.
- Atencion al cliente automatizada: el modelo mantiene el hilo durante pausas de vacilacion ("eh...", "a ver...") sin robar el turno, algo que los asistentes basados en turnos discretos resuelven mal y que en una llamada de soporte produce interrupciones constantes.
- Avisos de seguridad en tiempo real: el ejemplo publicado muestra al modelo escuchar una conversacion sobre mezclar productos de limpieza y terciar con una advertencia breve y accionable, un patron trasladable a entornos industriales, quimicos o de primeros auxilios donde el asistente debe callar hasta que detecta riesgo.
- Recepcion virtual y gestion de citas: con contexto de 32.768 tokens configurado en llama-server, el adaptador puede sostener una llamada larga manteniendo datos de la conversacion (nombre, fecha, motivo) y emitiendo frases cortas, que es el regimen para el que fue entrenado.
- Practica de conversacion en ingles: al ser un modelo solo en ingles y con timing natural, sirve como interlocutor para entrenamiento de fluidez donde el estudiante pueda interrumpir y ser interrumpido, con la salida limitada a tres palabras por turno para forzar ritmo realista.
- Investigacion en interaccion conversacional: la comparacion base frente a adaptador (92/474 frente a 456/474 esperas correctas en pausas intra-frase) ofrece una metrica reproducible para estudiar toma de turno, y todo el stack corre en una GPU de consumo, lo que abarata la experimentacion academica.
- Triaje de llamadas de emergencia: el modelo no monopoliza el canal mientras el hablante describe la situacion y puede introducir preguntas cortas de clarificacion en los huecos, siempre que un humano o un sistema posterior revise las decisiones criticas.
- Demostraciones de duplex en local: para desarrolladores que quieran integrar voz full-duplex en un producto sin depender de APIs en la nube, la combinacion de llama.cpp, un LoRA de 15 MB y una RTX 3060 es un punto de partida de coste minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo de rendimiento funcional es la metrica interna de toma de turno en llamadas de validacion, junto con la latencia medida:

| Metrica | Modelo base (solo prompt) | Adaptador MicroTurn | Contexto |
|---|---|---|---|
| Esperas correctas en pausa intra-frase | 92 de 474 | 456 de 474 | Llamadas de validacion (held-out) |
| Latencia mediana por tick | No disponible | Aproximadamente 230 ms | Una RTX 3060 12 GB, UD-Q4_K_M, `--n-cpu-moe 24`, presupuesto de tick de 600 ms |
| Muestras de probabilidad de `<listen>` | No disponible | De 0,00 a 1,00 segun el turno | Ejemplo de ejecucion en la model card |

## Requisitos de hardware

- VRAM: el escenario documentado es una unica RTX 3060 de 12 GB. El ajuste clave es `--n-cpu-moe 24`, que mantiene los expertos de 24 capas en memoria de sistema para que el resto del modelo quepa en la GPU.
- Memoria de sistema: debe ser suficiente para alojar los expertos de esas 24 capas; la model card no especifica la cantidad exacta necesaria, por lo que ese dato no esta disponible.
- GPU recomendadas: RTX 3060 de 12 GB (documentada y validada). Con GPUs de mayor VRAM se puede reducir `--n-cpu-moe` y aumentar la parte del modelo en GPU, aunque el autor no publica medidas para otros modelos de tarjeta.
- Cabe en GPU de consumo: si, en una RTX 3060 de 12 GB con reparto de expertos a CPU. No se documenta el comportamiento en tarjetas de 8 GB o menos.
- Entrenamiento: aproximadamente 3 horas en dos RTX 3060.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con soporte de LoRA en formato GGUF y una version que soporte Qwen3.6-35B-A3B. No se mencionan vLLM, TGI, Ollama ni otras alternativas.
- Comando documentado: `llama-server -m Qwen3.6-35B-A3B-UD-Q4_K_M.gguf --lora microturn-duplex-lora.gguf -ngl 99 --n-cpu-moe 24 -c 32768 -ub 512 --port 8080`.
- Latencia: aproximadamente 230 ms de mediana por tick en la configuracion anterior, dentro del presupuesto de 600 ms. No se publica throughput en tokens por segundo.
- Cliente de prueba: `microturn_client.py`, sin dependencias, que simula la entrada del microfono tick a tick.

## Comparativa con modelos similares

| Sistema | Parametros | Contexto | Toma de turno | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B + MicroTurn Duplex LoRA | 35B totales / 3B activos (base) + 3,83M (adaptador) | 32.768 en la receta documentada | 456/474 esperas correctas; ticks de 0,6 s | Apache 2.0 | Requiere llama.cpp, STT y TTS externos |
| Qwen3.6-35B-A3B sin adaptador | 35B totales / 3B activos | No disponible | 92/474 esperas correctas con solo prompt | No disponible | No esta pensado para duplex; falla en pausas intra-frase |
| DuplexCascade (referencia academica) | No disponible | No disponible | No disponible | No disponible | Yang, Fujita y Sudo, 2026; origen de la idea de micro-turno, aplicada alli a modelos de otro tamano |
| Otros LoRA de duplex sobre modelos grandes | No disponible | No disponible | No disponible | No disponible | No se han encontrado alternativas comparables con datos publicos en la informacion disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para las alternativas, por lo que la comparacion cuantitativa se limita al modelo base frente al adaptador.

## Limitaciones y advertencias

- No es un modelo autonomo: es un adaptador LoRA. Sin el modelo base Qwen3.6-35B-A3B y sin llama.cpp no hace nada.
- Dependencia estricta del prompt de sistema: el texto debe coincidir byte a byte con el publicado, y el historial debe enviarse como texto crudo de plantilla de chat a `/completion`, no a `/chat/completions`, y sin bloque de pensamiento en los turnos de asistente previos. Cualquier desviacion invalida el comportamiento aprendido.
- Cuantizacion no validada fuera de una: solo se ha probado `UD-Q4_K_M` de unsloth. Otras cuantizaciones estan explicitamente sin testear.
- Decodificacion sensible: con decodificacion greedy simple el modelo se detiene a mitad de sus propias frases porque `<listen>` es un unico token y "seguir hablando" se reparte entre muchas palabras posibles. El cliente debe aplicar la heuristica de umbral 0,3 sobre la probabilidad del token `<` y, por debajo, bloquear `<` con `logit_bias`. Es una regla ajustada a mano, no una garantia.
- Idioma: solo ingles. No hay soporte multilingue documentado, lo que descarta su uso directo con STT en castellano sin reentrenamiento del adaptador.
- Salida muy limitada: maximo tres palabras nuevas por tick. No sirve para respuestas largas, explicaciones detalladas ni generacion de codigo.
- Riesgo de alucinacion: heredado del modelo base. En dominios criticos (medico, legal, seguridad industrial) el ejemplo de la lejia y el amoniaco es correcto, pero no hay evaluacion sistematica de la fiabilidad de las intervenciones proactivas, y un falso positivo en un aviso de seguridad puede ser tan danino como un falso negativo.
- Sesgos: no se documenta ninguna evaluacion de sesgos. El entrenamiento con llamadas simuladas puede introducir sesgos de estilo, acento o contexto no representativos de conversaciones reales.
- Datos de uso pobres: 0 descargas y 16 "me gusta" en el momento de la consulta, repositorio de 0,0 GB en la ficha de HuggingFace y sin resultados de benchmarks publicos. Es un artefacto de demostracion, no un componente con validacion en produccion.
- Dependencia de componentes externos: para una llamada de voz completa hacen falta reconocimiento de voz en streaming por delante y sintesis de voz por detras. El modelo nunca sabe que audio se esta reproduciendo todavia, lo que complica la gestion de solapamientos reales.
- Licencia: Apache 2.0 para el adaptador, lo que permite uso comercial del adaptador, pero la licencia del modelo base no consta en la informacion disponible y debe verificarse por separado antes de desplegar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/codacus/Qwen3.6-35B-A3B-MicroTurn-Duplex-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper de referencia (DuplexCascade, Yang, Fujita y Sudo, 2026): https://arxiv.org/abs/2603.09180
- Cuantizacion GGUF utilizada (UD-Q4_K_M de unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Dataset de llamadas simuladas: https://huggingface.co/codacus/Qwen3.6-35B-A3B-MicroTurn-Duplex-LoRA/tree/main/dataset
- Cliente de prueba `microturn_client.py`: https://huggingface.co/codacus/Qwen3.6-35B-A3B-MicroTurn-Duplex-LoRA/blob/main/microturn_client.py
- Video de referencia del autor: "Can a Local LLM Speak and Listen at the Same Time?" (enlace no incluido en la informacion disponible)
- La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo.
