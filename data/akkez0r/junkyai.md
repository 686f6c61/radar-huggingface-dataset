# akkez0r/JunkyAI

## Resumen

JunkyAI es un modelo de lenguaje en ingles entrenado desde cero por el usuario akkez0r y publicado en HuggingFace. Se trata de un transformer decoder-only de forma Llama con 15.735.168 parametros segun su model card (los metadatos de safetensors de la plataforma reportan 18.880.896, una discrepancia no explicada por el autor), 8 capas, dimension oculta 384 y una ventana de contexto de 512 tokens. No se apoya en ningun peso preentrenado: incluye su propio vocabulario BPE a nivel de byte (8.192 tokens), su propia implementacion de transformer, su bucle de entrenamiento y su propio escritor de ficheros GGUF, todo sobre tensores de PyTorch sin usar las librerias `transformers`, `tokenizers`, `peft` ni `gguf`.

El modelo se entreno en dos fases sobre el corpus TinyStories: un preentrenamiento de 9.000 pasos que vio 221 millones de tokens (unas 3,4 epocas) con una perdida de validacion final de 1,4786 (perplejidad 4,4), y un ajuste por instrucciones de 300 pasos sobre 2.216 pares de un turno y 179 conversaciones multiturno generados sinteticamente, con perdida de validacion de 2,5164. Todo el preentrenamiento completo se ejecuto en una RTX 4060 de 8 GB en unos 55 minutos a 67.000 tokens por segundo, y el ajuste por instrucciones en unos 2 minutos.

Su relevancia no es de capacidad sino de legibilidad: es un ejemplo completo y auditable del pipeline de un modelo de lenguaje (tokenizacion, atencion, preentrenamiento, instruction tuning, cuantizacion y formato GGUF) a una escala que cabe en una GPU de consumo. El propio autor lo declara apto unicamente para uso educativo y experimental, y lo desaconseja explicitamente para sistemas en produccion, referencia factual o asesoramiento de cualquier tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de forma Llama: 8 capas, hidden 384, RMSNorm pre-norm, RoPE con pares intercalados (theta=10000) |
| Parametros totales | 15.735.168 (segun model card) / 18.880.896 (segun metadatos de safetensors de la plataforma; discrepancia no aclarada) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Q8_0 para la exportacion GGUF; entrenamiento en bfloat16. No se documentan otras cuantizaciones |
| Idiomas soportados | Ingles unicamente (`en`) |
| Licencia | cdla-sharing-1.0 |
| Formato de pesos | GGUF (fichero Q8_0 de 20,4 MB). La plataforma reporta metadatos de safetensors pese a indicar un tamano de repositorio de 0,0 GB |
| Atencion | 6 cabezas de consulta y 2 cabezas KV (grouped-query attention) |
| Feed-forward | SwiGLU con dimension interna 1024 |
| Vocabulario | 8.192 tokens, BPE a nivel de byte, entrenado sobre el mismo corpus |
| Pipeline | text-generation |
| Fecha de creacion / actualizacion en HuggingFace | 2026-09-12 / 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es deliberadamente identica en forma a la de Llama para que el GGUF exportado cargue sin modificaciones en llama.cpp, Ollama y LM Studio. La unica diferencia respecto a la implementacion habitual de HuggingFace es la aplicacion de RoPE sobre pares intercalados en lugar del split rotate-half, lo que coincide con `GGML_ROPE_TYPE_NORM` de ggml y evita cualquier paso de permutacion de pesos en la exportacion. El modelo usa grouped-query attention (6 cabezas de consulta, 2 de clave/valor), SwiGLU con dimension interna 1024, RMSNorm en configuracion pre-norm y un vocabulario BPE a nivel de byte de 8.192 entradas entrenado sobre el mismo corpus.

El preentrenamiento (etapa 1) uso las 300.000 historias de TinyStories, con 65,5 millones de tokens de entrenamiento y 329.000 de validacion. Se ejecutaron 9.000 pasos con batch 24, acumulacion de gradiente 2 y secuencia 512 (24.576 tokens por paso), sumando 221 millones de tokens vistos, aproximadamente 3,4 epocas. El optimizador fue AdamW con learning rate 3e-4, decaimiento coseno hasta el 10 %, 300 pasos de warmup y weight decay 0,1. El ajuste por instrucciones (etapa 2) empleo 2.216 pares de instruccion de un turno y 179 conversaciones multiturno generados sinteticamente con `openai/gpt-oss-120b` servido en Groq, con 120 ejemplos reservados para evaluacion sobre temas ausentes del conjunto de entrenamiento; se ejecutaron 300 pasos con batch 16 (unas 2 epocas) y learning rate 1e-4. Solo los tokens del asistente contribuyen a la perdida y los del prompt quedan enmascarados. Se hizo fine-tuning completo en lugar de LoRA porque a esta escala el modelo ocupa menos de 4 GB de VRAM durante el entrenamiento; el repositorio incluye implementaciones de LoRA y NF4 QLoRA para modelos base mayores.

## Capacidades

- Generacion de texto en ingles sencillo y gramatical, con registro similar al de un libro infantil.
- Conversacion corta de un solo turno en presente y pasado simple.
- Respuesta a preguntas del tipo "¿que es X?" para sustantivos concretos cotidianos: animales, comida, clima, objetos del hogar y lugares.
- Formulas sociales basicas: saludos, agradecimientos, despedidas y respuestas sobre si mismo.
- Continuacion coherente de una historia corta durante varias frases.
- Rechazo explicito de peticiones fuera de su capacidad, con redaccion variada y oferta de una alternativa ("What is 847 times 293?" devuelve "That is too much for a small model like me. But I can tell you about food or play.").
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni ninguna modalidad adicional.
- Capacidad multilingue nula: solo ingles.

## Casos de uso

- Material didactico sobre el pipeline completo de un LLM: al ser un repositorio de unos cientos de lineas de Python legible por componente (tokenizador BPE propio, transformer propio, bucle de entrenamiento propio y escritor GGUF propio), permite recorrer de principio a fin tokenizacion, atencion, preentrenamiento, instruction tuning, cuantizacion y empaquetado sin depender de frameworks opacos.
- Reproduccion de experimentos de escalado sobre TinyStories: el coste de 55 minutos en una RTX 4060 permite repetir el entrenamiento completo con distintas configuraciones de capas, dimension oculta o vocabulario para estudiar el efecto sobre la perplejidad de validacion (partiendo de 1,4786 en la configuracion publicada).
- Prueba de integraciones de inferencia local: con un fichero GGUF Q8_0 de 20,4 MB, el modelo sirve para validar que llama.cpp, Ollama o LM Studio cargan correctamente un GGUF generado por herramientas propias, incluyendo la comprobacion de la convencion RoPE, sin consumir recursos apreciables.
- Demostracion de instruction tuning con datos sinteticos: el repositorio documenta la receta completa (2.216 pares de un turno mas 179 conversaciones multiturno, enmascarado de tokens de prompt, fine-tuning completo frente a LoRA), util para comparar estrategias de ajuste a pequena escala.
- Generacion de microcuentos infantiles con vocabulario controlado: para prototipos de aplicaciones de lectura temprana donde se necesita texto muy simple en ingles y no se requiere correccion factual.
- Banco de pruebas de tokenizadores: al incluir un BPE a nivel de byte de 8.192 entradas entrenado sobre TinyStories, permite comparar el comportamiento de la tokenizacion sobre un vocabulario deliberadamente estrecho frente a tokenizadores de modelos generalistas.
- Verificacion automatizada de cadenas de exportacion a GGUF: util como caso de prueba en CI para comprobar que un conversor propio produce ficheros cargables y con el mismo resultado numerico que el modelo en bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar. Los unicos numeros de evaluacion publicados son las perdidas de validacion del propio entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion (preentrenamiento) | 1,4786 |
| Perplejidad (preentrenamiento) | 4,4 |
| Perdida de validacion (instruction tuning) | 2,5164 |
| Tokens de entrenamiento vistos | 221 millones (~3,4 epocas) |
| Throughput de entrenamiento | 67.000 tokens/s en RTX 4060 8 GB |
| Duracion del preentrenamiento | ~55 minutos |
| Duracion del instruction tuning | ~2 minutos |

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre benchmarks comparables: los enlaces recuperados corresponden a guias de programacion televisiva en frances y no guardan relacion con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB incluso cargando el fichero Q8_0 completo (20,4 MB) mas el cache KV de 512 tokens. Estimacion derivada del tamano del fichero publicado; el autor no ofrece cifras explicitas.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente. La unica GPU mencionada en la informacion disponible es la empleada para entrenar: RTX 4060 de 8 GB, con menos de 4 GB de VRAM ocupados durante el fine-tuning completo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer actual, e incluso en CPU sin aceleracion dedicada.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio, ya que el GGUF se exporta sin permutacion de pesos y con la convencion RoPE compatible con `GGML_ROPE_TYPE_NORM`. El repositorio incluye su propio escritor GGUF. No hay informacion sobre compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponibles para inferencia. El dato de 67.000 tokens/s corresponde al entrenamiento en una RTX 4060 y no es extrapolable a la generacion.

## Comparativa con modelos similares

No se dispone de datos verificados de rendimiento de los modelos alternativos dentro de la informacion proporcionada; los valores de la tabla se limitan a lo que puede contrastarse y el resto se marca como no disponible.

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JunkyAI | 15,7 M (model card) / 18,9 M (metadatos safetensors) | 512 tokens | Ingles | cdla-sharing-1.0 | HuggingFace, GGUF Q8_0 |
| TinyStories-33M (familia del corpus TinyStories) | 33 M | no disponible | Ingles | no disponible | HuggingFace |
| TinyLlama-1.1B | 1,1 B | no disponible | Ingles | no disponible | HuggingFace |
| SmolLM-135M | 135 M | no disponible | Ingles | no disponible | HuggingFace |

La comparacion relevante en cuanto a filosofia de diseno es con la familia TinyStories: modelos de escala similar entrenados sobre el mismo corpus y con el mismo objetivo de generar ingles simple. Frente a ellos, JunkyAI anade un ajuste por instrucciones y una cadena de exportacion a GGUF propia. Frente a modelos de mas de mil millones de parametros (TinyLlama, SmolLM) la diferencia de capacidad es de uno a dos ordenes de magnitud en numero de parametros y no son alternativas funcionales para las mismas tareas.

## Limitaciones y advertencias

- Sin aritmetica: no suma, multiplica ni cuenta de forma fiable. El propio autor lo describe como limite de capacidad, no como un fallo corregible con mas entrenamiento a este numero de parametros.
- Sin codigo: no lee ni escribe ningun lenguaje de programacion.
- Sin conocimiento del mundo: no conoce personas, lugares, fechas ni eventos reales; cualquier afirmacion sobre ellos es inventada.
- Sin razonamiento: no sigue logica de varios pasos ni responde a preguntas de "por que" con explicaciones genuinas.
- Deriva logica a larga distancia: mantiene la coherencia unas frases, pero a lo largo de un parrafo la causalidad se rompe; puede atribuir a un personaje el deseo de algo que pertenece a otro.
- Multiturno debil: con solo 179 conversaciones en el ajuste, tiende a fijarse en el primer tema y responde a preguntas posteriores no relacionadas como si siguiera en el. El uso de un solo turno es notablemente mas fiable.
- Vocabulario estrecho: las palabras fuera del rango de TinyStories (aproximadamente 1.500-3.000 palabras comunes del ingles) tienen representaciones cercanas al azar y el modelo las produce como ruido.
- Solo ingles, sin ninguna capacidad multilingue.
- Riesgo de alucinacion: a veces responde con seguridad y de forma incorrecta. Los rechazos corteses cubren los casos frecuentes pero, segun el autor, no constituyen una propiedad de seguridad fiable.
- Licencia cdla-sharing-1.0: conviene revisar sus condiciones antes de cualquier uso comercial o de redistribucion, dado que el modelo esta pensado para fines educativos y experimentales.
- Uso no recomendado por el autor para sistemas en produccion, referencia factual ni asesoramiento de cualquier tipo (la model card aparece truncada en el punto en que detalla esta prohibicion).
- Discrepancia no aclarada entre el recuento de parametros de la model card (15.735.168) y el reportado por la plataforma a partir de los safetensors (18.880.896), que afecta a cualquier estimacion de tamano y de hardware basada en el primero.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 likes, sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akkez0r/JunkyAI
- Dataset de entrenamiento: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories: https://arxiv.org/abs/2305.07759 (referenciado en los tags del modelo como `arxiv:2305.07759`)
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
- Otros enlaces relevantes: no disponible; la busqueda web no devolvio resultados relacionados con el modelo
