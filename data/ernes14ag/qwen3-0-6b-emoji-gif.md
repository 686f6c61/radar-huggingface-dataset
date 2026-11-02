# Ernes14AG/qwen3-0.6b-emoji-gif

## Resumen

Qwen3-0.6B-emoji-gif es un ajuste fino (finetune) del modelo base Qwen/Qwen3-0.6B desarrollado por el usuario Ernes14AG. Su proposito es muy concreto: recibe una frase en espanol que expresa un estado emocional o una situacion y devuelve directamente la URL de un GIF animado de la coleccion Noto Emoji Animation de Google que representa esa emocion. No genera texto explicativo ni conversacion: la salida es la URL del recurso grafico, y varia entre respuestas dentro del mismo tema.

El modelo resuelve un problema acotado dentro de las aplicaciones conversacionales: la seleccion automatica de contenido visual emotivo sin depender de APIs externas ni claves de servicio. Con 596.049.920 parametros (aproximadamente 0,6 mil millones), hereda la arquitectura transformer de la familia Qwen3 y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es practica mas que de investigacion: demuestra que un modelo de menos de mil millones de parametros, ajustado sobre datos sinteticos en espanol, puede sustituir a un sistema de reglas o a una llamada a una API de terceros para una tarea de clasificacion emocional con salida estructurada. El autor reporta que el ajuste eleva la tasa de URLs validas del 0 % al 100 % sobre 235 frases no vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajuste fino supervisado del modelo base Qwen/Qwen3-0.6B |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 disponible en el repositorio asociado `qwen3-0.6b-emoji-gif-GGUF`; pesos originales en safetensors (precision no especificada) |
| Idiomas soportados | espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio principal); GGUF (repositorio derivado para Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only denso de la familia Qwen3. El ajuste fino se realizo sobre datos sinteticos en espanol, segun indica la model card, con el objetivo de mapear frases emocionales a URLs de GIFs de Noto Emoji Animation. El vocabulario de salida efectivo queda restringido a las URLs del catalogo, lo que explica la tasa del 0 % de URLs inventadas reportada por el autor frente al 100 % del modelo base.

El conjunto de entrenamiento cubre 46 emociones y situaciones y 151 GIFs distintos, definidos en el fichero `catalogo.json` del repositorio. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset sintetico, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla si se congelaron capas o se ajustaron todos los parametros.

La innovacion tecnica destacable no esta en la arquitectura, sino en la formulacion de la tarea: la generacion de texto se convierte en una tarea de recuperacion estructurada donde la salida valida es siempre una URL del catalogo, lo que reduce el espacio de respuestas posibles y mitiga la alucinacion de enlaces.

## Capacidades

- Generacion de URLs de GIFs animados a partir de frases emocionales en espanol.
- Clasificacion implicita de emociones y situaciones entre 46 categorias definidas en el catalogo.
- Variabilidad controlada: el autor reporta una media de 1,7 GIFs distintos en 5 respuestas para el mismo mensaje, frente a 0,0 del modelo base.
- Salida directa sin texto adicional cuando se ejecuta con `--think=false` en Ollama.
- Deteccion de emociones mixtas o situaciones con tono ironico (por ejemplo, "genial, otra reunion" devuelve emojis de resignacion).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma nativa para esta tarea.
- No dispone de capacidades de vision, audio ni modo de pensamiento extendido en el ajuste.
- Capacidad multilingue limitada al espanol; el autor declara unicamente `language: [es]`.

## Casos de uso

- Chatbots de acompanamiento emocional: el modelo puede insertar una respuesta visual inmediata tras cada mensaje del usuario, seleccionando un GIF acorde al tono detectado sin necesidad de una API de imagenes externa. Es adecuado por su baja latencia al tener 0,6 mil millones de parametros.
- Integracion en Slack, Teams o WhatsApp: la salida es una URL de `fonts.gstatic.com` que se renderiza directamente en clientes de mensajeria, lo que permite respuestas visuales sin subir archivos ni gestionar almacenamiento propio.
- Prototipado de interfaces conversacionales: util para validar rapidamente flujos de UI donde la respuesta visual forma parte de la experiencia, antes de invertir en un sistema de recomendacion de medios mas complejo.
- Aplicaciones de bienestar y diario emocional: el usuario escribe como se siente y recibe un emoji animado de validacion emocional; el modelo cubre 46 emociones y situaciones, suficiente para un registro diario basico.
- Educacion infantil o aprendizaje de vocabulario emocional en espanol: asociar frases a representaciones visuales ayuda a reforzar la identificacion de emociones en contextos de aula o aplicaciones de idiomas.
- Filtrado y enriquecimiento de contenido en redes: dado un comentario corto en espanol, el modelo puede etiquetarlo con un GIF representativo para moderacion asistida o para generar respuestas automaticas con carga emocional.
- Demostracion de despliegue local: con cuantizacion Q8_0 y Ollama, el modelo cabe en equipos de consumo y sirve como ejemplo de pipeline completo de ajuste fino, publicacion en HuggingFace y distribucion via GGUF.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor corresponden a una evaluacion propia sobre 235 mensajes con frases no vistas durante el entrenamiento, a temperatura 1:

| Metrica | Modelo base | Modelo ajustado |
|---|---|---|
| URLs validas (temperatura 1) | 0 % | 100 % |
| Emocion correcta (temperatura 1) | 0 % | 58 % |
| URLs inventadas (temperatura 1) | 100 % | 0 % |
| GIFs distintos en 5 respuestas | 0,0 | 1,7 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La metrica de emocion correcta del 58 % indica que algo mas de cuatro de cada diez respuestas seleccionan un GIF de una emocion distinta a la esperada, lo que debe tenerse en cuenta en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 1,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 3 GB.
- VRAM estimada con cuantizacion Q8_0 (GGUF): en torno a 0,7-0,9 GB para pesos, con un consumo total tipico inferior a 2 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores no presentan limitacion. Tambien funciona en CPU.
- Cabe en GPU consumer y en placas integradas con suficiente memoria compartida; es viable en portatiles modestos.
- Opciones de despliegue: Ollama mediante `ollama run hf.co/Ernes14AG/qwen3-0.6b-emoji-gif-GGUF:Q8_0 --think=false`; llama.cpp con el GGUF; vLLM o TGI con los pesos safetensors para servir por HTTP.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia de decodificacion baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-emoji-gif (este modelo) | 596 M | no disponible | Texto a URL de GIF emocional en espanol | Apache 2.0 | HuggingFace, GGUF para Ollama |
| Qwen/Qwen3-0.6B (base) | 596 M | no disponible en la informacion disponible | Generacion de texto general | Apache 2.0 | HuggingFace, Ollama |
| Sistemas de reglas o clasificadores de emociones (por ejemplo, basados en lexicones) | no aplica | no aplica | Clasificacion emocional | variable | multiples |

La comparacion con alternativas de la misma categoria es limitada: no se han identificado en la informacion disponible otros ajustes finos publicos de Qwen3-0.6B orientados a la seleccion de GIFs emocionales en espanol. Frente al modelo base, la diferencia medible es la tasa de URLs validas (100 % frente a 0 %) y la ausencia de URLs inventadas. Frente a un clasificador de reglas, la ventaja es la cobertura de 46 emociones y la variabilidad de respuesta, aunque el 58 % de acierto emocional sugiere que un sistema de reglas bien curado podria ser mas preciso en categorias bien definidas.

## Limitaciones y advertencias

- Precision emocional limitada: solo el 58 % de las respuestas seleccionan la emocion esperada en la evaluacion del autor, lo que puede producir GIFs fuera de tono en contextos sensibles.
- Riesgo de alucinacion reducido pero no nulo: el autor reporta 0 % de URLs inventadas a temperatura 1, pero no se han publicado pruebas a temperaturas mas altas ni con prompts adversariales.
- Dependencia externa: las URLs apuntan a `fonts.gstatic.com`; si Google cambia o retira esos recursos, las respuestas dejaran de renderizar.
- Ambito idiomatico restringido al espanol; el modelo no esta entrenado para responder en otros idiomas.
- Cobertura limitada a 46 emociones y 151 GIFs; situaciones fuera del catalogo pueden recibir una respuesta incorrecta o generica.
- Entrenamiento sobre datos sinteticos: no se detalla la diversidad ni los sesgos del dataset, por lo que pueden existir sesgos culturales o de genero en la asociacion emocion-GIF.
- Requiere `--think=false` en Ollama para devolver la URL directamente; con el modo de pensamiento activado la salida puede incluir texto adicional no deseado.
- Licencia Apache 2.0 permite uso comercial, pero la atribucion de los emojis animados corresponde a Noto Emoji Animation de Google bajo CC BY 4.0, lo que exige mantener la atribucion correspondiente en el producto.
- Modelo con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion independiente de los resultados reportados.
- No se especifican la longitud de contexto efectiva ni el comportamiento con conversaciones multi-turno largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ernes14AG/qwen3-0.6b-emoji-gif
- Repositorio GGUF para Ollama: https://huggingface.co/Ernes14AG/qwen3-0.6b-emoji-gif-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Noto Emoji Animation (Google): https://googlefonts.github.io/noto-emoji-animation/
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
