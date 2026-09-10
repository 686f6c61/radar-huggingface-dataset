# Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2

## Resumen

Pantheon-Reasoning-26B-A4B-1.1-V2 es un ajuste fino (finetune) de tipo roleplay y escritura creativa desarrollado por Gryphe, construido sobre Gryphe/Gemma-4-26B-A4B-StyleTune-V2. Se trata de un experimento que lleva la capacidad de razonamiento explicito a la serie Pantheon de modelos orientados a interpretacion de personajes, empleando para ello un Gemma 4 con arquitectura MoE (mezcla de expertos), que segun el autor es la unica variante que resulta viable de entrenar en tiempos razonables.

El modelo resuelve un problema concreto: incorporar trazas de razonamiento (thinking traces) generadas hacia delante, como si el modelo planificase su respuesta antes de escribirla, en lugar de anadir una explicacion posterior. La receta de datos combina en torno a un 26% de corpus Pantheon, un 36% de datos generales de roleplay y un 38% de aventuras de texto, todas ellas con trazas de razonamiento retro-generadas. La version 1.1 reduce y depura dichas trazas respecto a la 1.1 original y elimina los conjuntos WorldSim y Tiamat por no alcanzar el estandar de calidad del autor.

La relevancia actual del modelo es acotada y muy especifica: no compite en tareas de proposito general, sino que explora si el razonamiento explicito mejora la coherencia narrativa y la interpretacion de personajes en comparacion con modelos no razonadores. Cuenta con 26.544.131.376 parametros totales segun los pesos en safetensors, un repositorio de 53,1 GB, licencia apache-2.0 declarada y soporte unicamente para ingles. No se han publicado resultados de benchmarks academicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) de la familia Gemma 4 |
| Parametros totales | 26.544.131.376 (26,5 B) |
| Parametros activos | no disponible (la nomenclatura "A4B" del nombre sugiere del orden de 4.000 millones de parametros activos, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se publica unicamente en safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 53,1 GB |
| Modelo base | Gryphe/Gemma-4-26B-A4B-StyleTune-V2 |
| Framework de entrenamiento | Axolotl |
| Descargas / likes | 0 descargas / 10 likes |
| Fecha de creacion | 2026-09-08 |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 en su variante MoE con etiquetado "26B-A4B" (26.000 millones de parametros totales y, segun la nomenclatura, aproximadamente 4.000 millones activos por token, dato no confirmado explicitamente en la informacion disponible). No se detalla el numero total de tokens de entrenamiento, la composicion exacta de la mezcla mas alla de los tres bloques porcentuales indicados, ni si se aplicaron fases de RLHF o DPO; el pipeline declarado es un finetune supervisado con Axolotl sobre el modelo base StyleTune V2.

La innovacion principal es metodologica: las trazas de razonamiento no son nativas del material original, sino que se retro-generaron con DeepSeek 3.2 (se probo tambien V4 Flash, descartado por mal rendimiento en esta tarea concreta). El prompt fuerza al modelo anotador a pensar como un escritor que planifica su siguiente respuesta, considerando psicologia del personaje, tono y direccion narrativa, en lugar de justificar a posteriori un texto ya escrito. Cada traza fue validada por un modelo juez; se rechazaron las que adoptaban la voz del personaje, las que se limitaban a reformular el texto y las que parecian analisis en vez de planificacion. En la version 1.1 se incorporo un "master judge" que supervisa el proceso y regenera trazas defectuosas mediante un pipeline autoiterativo. Ademas, se diseno una plantilla de entrenamiento especifica porque Gemma no utiliza preserve_thinking, lo que de otro modo habria implicado entrenar el razonamiento solo del ultimo turno de cada muestra. El modelo esta entrenado para mantener el pensamiento activo en todos los turnos del asistente.

## Capacidades

- Generacion de texto conversacional orientada a roleplay e interpretacion de personajes con voces, acentos y manierismos diferenciados.
- Razonamiento explicito antes de responder (modo thinking activo en todos los turnos del asistente), orientado a planificacion narrativa y de personaje.
- Escritura creativa y prosa narrativa, con estilo mas orientado a la accion y a la ficcion interactiva que a la narracion generica.
- Ficcion interactiva y aventuras de texto, incluyendo escenas de alta tension y continuidad argumental.
- Escritura con trazas de razonamiento condensadas respecto a la version 1.1 original, lo que reduce la latencia efectiva de pensamiento.
- Capacidad de operar en modo sin razonamiento (no-think), segun se desprende de la tabla de metricas de escritura publicada por el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta uso agentico).
- Capacidades multimodales, de vision o de audio: no disponible.
- Capacidades multilingues: no, el modelo esta entrenado y etiquetado exclusivamente para ingles.

## Casos de uso

- Motores de ficcion interactiva y aventuras de texto: el modelo fue entrenado con un 38% de datos de este tipo, con trazas que planifican la escena antes de escribirla, lo que resulta adecuado para mantener coherencia en narraciones ramificadas donde cada turno debe respetar el estado previo de la historia.
- Personajes no jugadores (NPC) en videojuegos: con el pensamiento activado, el modelo puede ponderar el estado emocional del personaje y el contexto de la escena antes de emitir dialogo, lo que reduce respuestas genericas en conversaciones repetidas con jugadores.
- Asistencia a escritores de ficcion: generacion de dialogos y escenas con un estilo menos formulaico que el de modelos generalistas; las metricas publicadas muestran una longitud media de frase de 13,7 palabras y una relacion tipo-token de 0,770, indicativas de mayor variedad lexica que su modelo base.
- Simulacion de personajes para practica de entrevistas o conversaciones dificiles: la planificacion previa permite sostener un rol con objetivos propios, util en entornos de formacion donde se necesita un interlocutor consistente en ingles.
- Prototipado de contenido narrativo para juegos de rol de mesa: generacion rapida de escenas, descripciones y respuestas de PNJ a partir de un trasfondo de personaje proporcionado en el prompt.
- Investigacion sobre razonamiento en tareas creativas: el modelo sirve como sujeto de comparacion entre modo thinking y modo no-think, dado que el autor publica metricas de escritura para ambas configuraciones.
- Generacion de guiones y dialogos para doblaje o audiolibros en ingles: la prosa orientada a accion y el control de longitud de parrafo (57,8 palabras de media) facilitan la segmentacion en tomas.
- Fine-tuning posterior sobre estilos propios: al estar publicado en safetensors con licencia apache-2.0 y framework Axolotl, es reutilizable como punto de partida para ajustes de estilo adicionales, siempre que se respeten las condiciones del modelo subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente proporciona metricas de calidad de escritura comparando el modelo base, el StyleTune y las variantes con y sin razonamiento:

| Metrica | Base | Style Tune | Pantheon Reasoning | Pantheon Reasoning (no-think) |
|---|---|---|---|---|
| Longitud media de frase | 15,4 palabras | 15,9 palabras | 13,7 palabras | 15,0 palabras |
| Relacion tipo-token | 0,686 | 0,716 | 0,770 | 0,748 |
| Longitud media de parrafo | 57,3 palabras | 57,9 palabras | 57,8 palabras | 61,0 palabras |
| Jaccard top-500 n-gramas | — | 25,2% de solapamiento con base | 12,0% de solapamiento con base | 12,9% de solapamiento con base |

La tabla de metricas de cliche publicada en la model card aparece truncada en la informacion disponible, por lo que no se reproducen sus valores.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 53 GB solo para pesos, mas cache KV. Requiere una GPU de 80 GB (A100 80 GB, H100 80 GB) como minimo holgado; el repositorio de 53,1 GB es coherente con este calculo.
- VRAM estimada en cuantizacion de 8 bits: del orden de 27-30 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantizacion de 4 bits: del orden de 14-16 GB, lo que permitiria ejecucion en una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) al limite. Estas cifras son estimaciones derivadas del tamano del modelo, ya que no se publican cuantizaciones oficiales.
- Cabe en GPU de consumo: si, mediante cuantizacion, en tarjetas de 16-24 GB; en precision completa no.
- Opciones de despliegue: al publicarse solo en safetensors, las rutas directas son vLLM, TGI y transformers. llama.cpp y Ollama requeririan generar previamente una conversion a GGUF, no disponible en el repositorio.
- Latencia y throughput estimados: no disponible. La arquitectura MoE con del orden de 4.000 millones de parametros activos (segun nomenclatura no confirmada) sugiere un coste de computo por token bajo, pero el modelo sigue requiriendo cargar en memoria la totalidad de los 26,5 B de parametros, por lo que el rendimiento estara limitado por ancho de banda de memoria en la mayoria de configuraciones.
- Parametros de inferencia recomendados por el autor: temperature 1,0, repetition_penalty 1,0 y min_p 0,05. El autor desaconseja usar penalizacion por repeticion porque afecta tambien a las trazas de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pantheon-Reasoning-26B-A4B-1.1-V2 | 26,5 B (MoE) | no disponible | Metricas de escritura publicadas (TTR 0,770) | apache-2.0 | HuggingFace, safetensors |
| Gryphe/Gemma-4-26B-A4B-StyleTune-V2 | 26,5 B (MoE) | no disponible | TTR 0,716; 25,2% de solapamiento con base | no disponible | HuggingFace |
| Qwen 3.6 27B | no disponible | no disponible | Segun el autor, "muy inteligente" pero con escritura "poco destacable" | no disponible | no disponible |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1 | 26,5 B (MoE) | no disponible | Trazas de razonamiento menos condensadas | apache-2.0 | HuggingFace |

La comparacion con Qwen 3.6 27B procede unicamente de la valoracion cualitativa del autor del modelo y no de mediciones reproducibles. No se dispone de datos de contexto, licencia ni benchmarks cuantitativos de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en roleplay y escritura creativa: no esta optimizado para tareas de razonamiento logico, matematicas, codigo o recuperacion factual, y no se documentan capacidades de tool calling ni uso agentico.
- Unicamente soporta ingles. Cualquier uso en castellano u otros idiomas queda fuera del alcance declarado del entrenamiento.
- Riesgo de alucinacion elevado en el terreno de la ficcion: el modelo esta disenado para generar narrativa verosimil, no para ser fiel a hechos. No debe emplearse como fuente de informacion factual.
- Las trazas de razonamiento fueron generadas por DeepSeek 3.2 y filtradas por modelos juez, no por anotadores humanos; pueden arrastrar sesgos o patrones estilisticos del modelo generador.
- El autor advierte de que la arquitectura Gemma es "terca" de tratar y que las trazas no quedaron tan condensadas como esperaba, lo que puede traducirse en una fase de pensamiento mas larga de lo deseable.
- No hay benchmarks academicos publicados, solo metricas de estilo, por lo que la evaluacion de calidad depende en gran medida de juicio humano.
- La licencia declarada en el repositorio es apache-2.0, pero al derivar de un modelo Gemma 4 conviene verificar las condiciones de uso del modelo base y de la familia Gemma antes de un despliegue comercial, ya que pueden imponer restricciones adicionales no reflejadas en la etiqueta del finetune.
- El repositorio registra 0 descargas en el momento de la consulta, lo que implica una validacion practica muy limitada por parte de la comunidad.
- Uso responsable: al tratarse de un modelo de roleplay, puede generar contenido inapropiado segun el personaje y el escenario solicitados; se recomienda desplegar filtros de salida en entornos de cara al publico.
- El autor desaconseja el uso de prefijos de nombre de personaje porque interfieren con el razonamiento, lo que limita ciertos formatos de integracion con front-ends de chat.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
- Modelo base: https://huggingface.co/Gryphe/Gemma-4-26B-A4B-StyleTune-V2
- Version original del finetune: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1

Nota: las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo ni con su autor. Los unicos resultados obtenidos correspondian al Centro Helenico de Informacion de Vehiculos (hic.gr), sin relacion alguna con el ambito de la inteligencia artificial. Por tanto, no se dispone de papers, blogs, repositorios ni demos adicionales que enlazar.
