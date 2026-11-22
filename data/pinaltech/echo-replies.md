# pinaltech/echo-replies

## Resumen

Echo Replies es un modelo de sugerencia de respuestas para correo electrónico desarrollado por pinaltech, integrado en la aplicación Picacho bajo la función "Settings → Local AI → Suggest replies". A diferencia de un modelo generativo, no produce texto libre: clasifica el mensaje recibido y selecciona entre 59 respuestas predefinidas, redactadas manualmente en 37 idiomas (38 códigos, incluyendo chino simplificado y tradicional). El modelo devuelve hasta cuatro sugerencias contextualmente adecuadas, o ninguna cuando detecta que el mensaje no requiere respuesta.

La arquitectura es una red neuronal muy compacta: las características del mensaje (bolsas de palabras del asunto y cuerpo, pares de palabras, conceptos léxicos, número de preguntas, exclamaciones y longitud) se proyectan a 32 unidades ocultas y se aplican sobre una softmax de 60 clases (59 respuestas más la clase "none"). El modelo completo ocupa aproximadamente 1,2 MB, con embeddings almacenados como enteros de 8 bits con escala por fila en el formato propietario `PICAWHN1`.

Su relevancia radica en el enfoque: en lugar de desplegar un LLM generativo para una tarea acotada, emplea un clasificador léxico ligero que se ejecuta localmente en el dispositivo con latencia mínima, sin dependencias de red ni GPU, y con un catálogo de respuestas cuya calidad queda garantizada por estar escritas a mano. Está publicado bajo licencia MIT y se distribuye a través de Hugging Face como `replies-v1.bin`, verificado por tamaño y SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (features hashed → 32 unidades ocultas → softmax sobre 60 clases) |
| Parametros totales | no disponible (embedding de ~1,2 MB en enteros de 8 bits; número exacto de parámetros no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada limitada a 4.000 caracteres tras limpieza; no es un modelo de contexto generativo) |
| Tipos de cuantizacion | Embeddings en enteros de 8 bits con escala por fila (formato `PICAWHN1`); no se documentan otras cuantizaciones |
| Idiomas soportados | 37 idiomas (38 códigos): inglés, español, alemán, francés, portugués, italiano, neerlandés, sueco, danés, noruego, polaco, ruso, ucraniano, checo, eslovaco, croata, búlgaro, rumano, húngaro, finlandés, griego, turco, árabe, persa, hebreo, hindi, bengalí, indonesio, malayo, vietnamita, tailandés, japonés, chino simplificado, chino tradicional, coreano, tagalo, suajili y catalán |
| Licencia | MIT |
| Formato de pesos | `replies-v1.bin` (formato propietario de Picacho, runtime `NativeTagger` en `src/manage/local_ai/runtime.rs`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto de dos capas. El preprocesado limpia el cuerpo del mensaje hasta la firma (`--`) o el original citado o reenviado (`-----`, `_____`), elimina líneas citadas (`>`) y trunca a 4.000 caracteres. La tokenización reutiliza el esquema del modelo de códigos de inicio de sesión (`../otp/features.py`): secuencias de letras, marcas y dígitos en minúsculas, con los sistemas de escritura sin espacios divididos en pares de caracteres.

Las características incluyen las palabras del asunto, las del cuerpo y los pares de palabras (los primeros 160), las palabras de hasta cuatro líneas que contienen una pregunta (`?`, `？`, `؟`), los conceptos detectados mediante `lexicon.json` (invitación, reunión, llamada, agradecimiento, disculpa, enfermedad, retraso, cancelación, plazo, cumpleaños, vacaciones, presentación, entrevista, factura, opinión, cómo estás, seguimiento, noticias, pérdida, oferta de ayuda, automatizado, etc.), el número de preguntas, la presencia de exclamaciones y la longitud del mensaje. Todo se proyecta mediante hashing a 32.768 cubos y se suma en 32 unidades ocultas, seguidas de una softmax sobre las 59 respuestas y la clase "none". El léxico de conceptos lista raíces en todos los idiomas soportados, de modo que "Einladung", "invitación" y "招待" mapean al mismo concepto.

El entrenamiento se realiza con `train.py` usando únicamente numpy. Los datos son completamente sintéticos: `languages.py` y `phrases_a.py` a `phrases_d.py` generan mensajes a partir de 33 situaciones (agradecimiento, petición de reunión, invitación, solicitud, reseña, adjunto, noticias, malas noticias, baja por enfermedad, retraso, disculpa, pregunta de sí/no, llamada, plazo, seguimiento, felicitaciones, presentación, entrevista, elogio, cancelación, etc.) y correo automatizado, con saludos, conversación trivial, despedidas y asuntos. El inglés tiene cuatro formulaciones por situación y el resto de idiomas dos. El 30% de los mensajes se entrenan con todas sus palabras eliminadas, conservando solo sus conceptos, para forzar la generalización a formulaciones no vistas. El modelo publicado se entrena sobre todas las formulaciones tras validar en una mitad reservada, y se generan `parity.json` (mensajes cuyas características, vectores y puntuaciones debe reproducir la app en `cargo test replies`) y `eval.json` (mensajes reservados por idioma).

## Capacidades

- Clasificación de mensajes de correo electrónico en 33 situaciones más correo automatizado, mediante detección de conceptos léxicos multilingües.
- Sugerencia de hasta cuatro respuestas cortas (cada una con al menos un 3% de probabilidad) redactadas en el idioma del mensaje recibido.
- Detección del idioma a partir del sistema de escritura y, entre idiomas que comparten uno, de palabras funcionales (`stopwords.json`) y letras características (ñ, ø, ő, ș).
- Clase "none" para mensajes que no requieren respuesta (correo de `no-reply@`, listas de correo con `List-Unsubscribe`, códigos de inicio de sesión, recibos, actualizaciones de paquetes, borradores y correo enviado).
- Personalización ligera en el dispositivo: la elección del usuario incrementa hasta tres veces la probabilidad de esa respuesta, y las respuestas descartadas ("Don't Suggest This") no se vuelven a ofrecer; el historial se puede borrar desde ajustes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.

## Casos de uso

- Sugerencia de respuestas en clientes de correo: al abrir un mensaje, el modelo clasifica la situación y ofrece respuestas adecuadas en el idioma del remitente, con latencia mínima al ejecutarse localmente sin GPU.
- Gestión de invitaciones y reuniones: ante una petición de reunión, propone respuestas como "That works for me." o "Let me check my calendar.", y sus equivalentes en alemán u otros idiomas, reduciendo el tiempo de redacción.
- Acuse de recibo de noticias y felicitaciones: detecta conceptos como "news" o "birthday" y sugiere respuestas breves como "Congratulations!", apropiadas para mensajes que no requieren una respuesta elaborada.
- Filtrado de correo que no requiere respuesta: la clase "none" evita sugerencias en notificaciones automatizadas, recibos y listas de correo, reduciendo el ruido en la interfaz.
- Soporte multilingüe en equipos distribuidos: con 37 idiomas, un usuario que recibe correo en japonés, árabe o hindi obtiene sugerencias en ese mismo idioma sin configuración adicional.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo con un modelo de ~1,2 MB, el contenido del correo no sale del equipo, lo que lo hace apto para organizaciones con políticas estrictas de confidencialidad.
- Aplicaciones de correo de código abierto: al estar bajo licencia MIT y distribuirse como un único archivo `.bin`, puede integrarse en otros clientes que implementen el runtime `NativeTagger` o reproduzcan el pipeline de características.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `train.py --quick` evalúa sobre formulaciones no vistas y que `eval.json` contiene mensajes reservados en todos los idiomas, pero no se proporcionan cifras de precisión, recall ni latencia.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo (~1,2 MB) se ejecuta en CPU sin aceleración por GPU.
- GPU recomendadas: ninguna; no requiere GPU.
- Cabe en cualquier hardware consumer, incluidos dispositivos móviles y sistemas embebidos, dado el tamaño del archivo y la simplicidad de la red (32 unidades ocultas).
- Opciones de despliegue: runtime propio de Picacho (`NativeTagger` en `src/manage/local_ai/runtime.rs`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles; la model card indica que el modelo es "small and fast enough to run whenever a message opens", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Echo Replies (pinaltech) | Clasificador de respuestas (catálogo de 59) | ~1,2 MB de embedding (no disponible exacto) | no aplica (4.000 caracteres de entrada) | 37 | MIT | Hugging Face (`pinaltech/echo-replies`) |
| Alternativas de smart reply generativas (p. ej. modelos tipo T5/BART pequeños ajustados) | Generativas seq2seq | no disponible | variable | variable | variable | no disponible |
| LLMs generativos pequeños (p. ej. modelos de 1-3B) | Generativos decoder-only | 1-3B | 2K-32K | variable | variable | no disponible |

No se dispone de información sobre modelos comparables directos en la documentación proporcionada; la comparativa anterior es orientativa por categoría y no incluye datos de rendimiento verificados.

## Limitaciones y advertencias

- El modelo no genera texto: solo selecciona entre 59 respuestas predefinidas, por lo que la variedad y naturalidad de las sugerencias está acotada por el catálogo.
- Los datos de entrenamiento son completamente sintéticos y limitados: cuatro formulaciones por situación en inglés y dos en el resto de idiomas, lo que constituye, según el autor, su principal debilidad frente a correo real.
- Las traducciones no han sido revisadas por hablantes nativos; en idiomas que marcan el género del hablante en el verbo (hebreo, hindi, polaco, ruso, etc.) la mayoría de formulaciones evitan marcarlo, pero algunas en hindi ("मैं इसे देखता हूँ।", "मैं जाँच करके बताता हूँ।") están en masculino.
- Riesgo de clasificación errónea ante formulaciones alejadas de las plantillas de entrenamiento; la técnica de eliminar el 30% de las palabras mitiga pero no elimina este problema.
- La detección de idioma puede fallar y recurrir al idioma del sistema o al inglés.
- Licencia MIT: permite uso comercial y modificación, pero el modelo depende de archivos auxiliares (`catalog.json`, `lexicon.json`, `stopwords.json`) y de un runtime propietario de Picacho, lo que limita su reutilización fuera de esa aplicación.
- El historial de personalización se almacena en el dispositivo y debe gestionarse conforme a las políticas de privacidad aplicables.
- Sin datos publicados de benchmarks, latencia o precisión; no se recomienda su adopción en producción sin una evaluación propia sobre correo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pinaltech/echo-replies
- Repositorio de Picacho (referenciado en la model card, ruta no especificada): código del runtime en `src/manage/local_ai/runtime.rs`, lógica de sugerencias en `src/manage/local_ai/replies.rs` y registro del modelo en `src/manage/local_ai/mod.rs`
- Scripts de entrenamiento y datos (referenciados en la model card): `train.py`, `languages.py`, `phrases_a.py` a `phrases_d.py`, `data.py`, `catalog.json`, `lexicon.json`, `stopwords.json`, `parity.json`, `eval.json`
