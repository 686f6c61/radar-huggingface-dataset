# Housto4/uadetox-e2b

## Resumen

UADetox E2B es un ajuste fino de Gemma 4 E2B (la variante instruction-tuned de 2.800 millones de parametros de Google, en su build QAT Q4_0) especializado en una unica tarea: reescribir un comentario toxico en ucraniano a un ucraniano educado con el registro de la literatura clasica ucraniana, conservando el argumento y la postura original del comentario. Lo desarrolla el usuario independiente Housto4 (Ivan H) y se publica bajo licencia Apache 2.0. Su relevancia practica esta en el formato: un unico fichero GGUF de 1,84 GB que corre en un telefono o en una CPU de cuatro nucleos con llama.cpp, lo que permite integrar moderacion asistida y reescritura en cliente sin depender de la nube.

El modelo no es un chatbot generalista ni un clasificador de toxicidad: es un transformador de estilo de un solo turno. La model card insiste en que siempre reescribe, incluso texto ya educado, por lo que debe desplegarse junto a un clasificador que decida que comentarios necesitan la reescritura (el autor publica `Housto4/uadetox-gate` para ese fin). La salida esta pensada como sugerencia para que una persona decida si la acepta, no como sustitucion silenciosa de lo que escribio el usuario.

Tecnicamente combina varias decisiones poco habituales en un modelo de este tamano: destilacion on-policy desde un profesor Gemma 4 31B ajustado, entrenamiento con el redondeo Q4_0 exacto de los pesos fusionados para que el alumno aprenda pesos que sobreviven a la cuantizacion, y un recorte de vocabulario de 262.144 a 88.211 tokens que reduce el fichero de 3,35 GB a 1,84 GB. Solo soporta ucraniano; el resto de idiomas queda explicitamente fuera de alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E2B, fine-tune con LoRA fusionado) |
| Parametros totales | 2.802.968.867 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (los ejemplos de despliegue usan `-c 1024`) |
| Tipos de cuantizacion | Q4_0 en pesos de transformer, Q6_K en embeddings; adaptador LoRA original en PEFT para entrenamiento o inferencia en GPU |
| Idiomas soportados | Ucraniano (`uk`) unicamente |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (`uadetox_e2b_distill_q4_trim_q4_0.gguf`), safetensors en el repo, adaptador PEFT en `adapter/` |

Otros datos: repositorio de 2,2 GB, fichero GGUF de 1,84 GB, vocabulario recortado a 88.211 tokens, LoRA de rango 64 sobre todas las proyecciones de atencion y MLP, dataset de entrenamiento `Housto4/uadetox`.

## Arquitectura y entrenamiento

La base es Gemma 4 E2B en su version instruction-tuned y con cuantizacion aware training (QAT) Q4_0 de Google, sin cuantizar en origen (`google/gemma-4-E2B-it-qat-q4_0-unquantized`). Sobre ella se aplica un LoRA de rango 64 en todas las proyecciones de atencion y MLP, entrenado durante una epoca con tasa de aprendizaje 4e-4 sobre pares comentario → reescritura literaria, usando el comentario solo como turno de usuario, sin system prompt y con el modo de razonamiento (thinking) desactivado.

El pipeline de entrenamiento tiene tres piezas destacables. Primero, un profesor: Gemma 4 31B ajustado con LoRA sobre 15.000 filas de entrenamiento, con el sub-estilo objetivo nombrado en el prompt. Segundo, destilacion on-policy en dos rondas de 12.000 comentarios: el alumno muestrea una reescritura, el profesor puntua cada token (top-20) y el alumno se entrena hacia la distribucion del profesor mas 0,2 veces la perdida sobre la reescritura de referencia. Tercero, el paso de fusion: el adaptador se fusiona en los pesos QAT Q4_0 de Google redondeando cada peso adaptado exactamente a Q4_0, y el forward de entrenamiento usa ese mismo redondeo, de modo que el alumno aprende pesos que sobreviven a la cuantizacion. Por ultimo, se recorta el vocabulario de 262.144 a 88.211 tokens (todo el cirilico, caracteres no alfabeticos, todos los tokens usados por los datos de entrenamiento y los tokens latinos mas frecuentes); segun el autor, el 84 % de las reescrituras de dev son identicas token a token a las del modelo con vocabulario completo.

## Capacidades

- Reescritura de desintoxicacion en ucraniano: convierte un comentario grosero o toxico en una version educada con registro literario clasico, manteniendo el argumento y la postura.
- Transferencia de estilo: el resultado imita el registro de la literatura ucraniana clasica, no una neutralizacion plana.
- Generacion de texto de un solo turno: la entrada es el comentario como turno de usuario y la salida es la reescritura; no esta disenado para conversacion multi-turno.
- Inferencia en dispositivo: funciona con llama.cpp en telefono o CPU de cuatro nucleos gracias al GGUF Q4_0 de 1,84 GB.
- Compatibilidad con endpoints: etiquetado `endpoints_compatible`; se puede servir con `llama-server` y consumir por `/v1/chat/completions` o `/completion`.
- No soporta tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso; no hay thinking mode (se desactiva explicitamente en el prompt).
- Multilingue: no. Solo ucraniano; otros idiomas estan fuera de alcance segun el autor.

## Casos de uso

- Moderacion asistida en foros y redes: el modelo genera una reescritura sugerida del comentario toxico y la interfaz ofrece al usuario aceptarla o editarla antes de publicar; el modelo siempre reescribe, por lo que se combina con `Housto4/uadetox-gate` para decidir que comentarios pasan por el.
- Teclados y autocorreccion en el movil: al ser un GGUF de 1,84 GB que corre en CPU de cuatro nucleos con llama.cpp, puede integrarse en una app movil para ofrecer "reescribir educadamente" antes de enviar un mensaje.
- Bots de comunidad en Telegram: el autor publica `@uadetoxbot` como demo; un bot puede responder a un mensaje reenviado con la version literaria y educada, util en grupos de discusion politica o social donde el tono se degrada.
- Investigacion en desintoxicacion y transferencia de estilo en ucraniano: el adaptador PEFT y el dataset `Housto4/uadetox` permiten reproducir el pipeline, cambiar el sub-estilo del profesor o estudiar el efecto del recorte de vocabulario y del redondeo Q4_0 en el entrenamiento.
- Preprocesado de datasets para anotacion: normalizar comentarios toxicos a un registro neutro-literario antes de usarlos en tareas de analisis de sentimiento o topic modeling, reduciendo el ruido lexico sin perder la postura.
- Filtros de comentarios en medios de comunicacion: sugerir al moderador una version publicable del comentario en lugar de borrarlo, preservando la participacion del lector y reduciendo la carga de revision manual.
- Educacion y ensenanza de registro: mostrar a estudiantes de ucraniano como reformular una misma idea en registro literario frente a registro coloquial o vulgar.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). El juez es un LLM fijado ("pinned LLM judge") con la metrica definida en los resultados de desarrollo; intervalos de confianza bootstrap del 95 %.

| Sistema | Buenos, % | Toxicidad restante, % | Significado perdido, % |
|---|---|---|---|
| Reescrituras de referencia | 91,1 [89,3; 92,8] | 0,1 | 22,8 |
| Gemma 4 31B sin ajustar, 4-shot | 68,4 [65,4; 71,2] | 3,1 | 39,7 |
| Este modelo (build on-device), test | 59,0 [56,0; ...] | 4,5 | 42,6 |

Desglose por split segun el `model-index` de la model card:

| Split | Buenos, % | Toxicidad restante, % | Significado perdido, % | Errores de fluidez, % | No literario, % |
|---|---|---|---|---|---|
| Dev (1.966 comentarios de validacion) | 59,5 | 4,4 | 38,0 | 32,0 | 11,0 |
| Test reservado (1.000 comentarios) | 59,0 | 4,5 | 42,6 | no disponible | no disponible |

El test reservado excluye filas procedentes de datasets externos de toxicidad y no se uso para entrenamiento, ajuste ni seleccion de modelo. El intervalo de confianza del test para "Buenos" aparece truncado en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF pesa 1,84 GB; con contexto de 1.024 tokens y overhead de llama.cpp, cabe holgadamente en 3-4 GB de memoria. El adaptador PEFT sin cuantizar (sobre la base de 2.800 millones de parametros) requiere bastante mas si se usa en GPU.
- GPU recomendadas: no se especifican en la informacion proporcionada; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para el GGUF. El adaptador LoRA para entrenamiento o inferencia en GPU requiere una GPU de mayor capacidad, no cuantificada en la ficha.
- Cabe en GPU consumer: si, en cualquier GPU con 4 GB o mas de VRAM. El autor lo posiciona para telefono y CPU de cuatro nucleos.
- Opciones de despliegue: llama.cpp (`llama-server`), con los flags `-c 1024 -np 1 --chat-template-kwargs '{"enable_thinking":false}' --no-cache-prompt`; tambien via `/v1/chat/completions` o `/completion` en crudo. El adaptador PEFT permite entrenamiento adicional o inferencia en GPU.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor afirma que el recorte de vocabulario acelera la decodificacion, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UADetox E2B (este modelo) | 2.800 millones | no disponible | Desintoxicacion y estilo literario en ucraniano | Apache 2.0 | GGUF y safetensors en Hugging Face |
| Gemma 4 31B sin ajustar, 4-shot | no disponible | no disponible | Generico, evaluado en la misma tarea | licencia Gemma 4 | Hugging Face |
| Gemma 4 E2B it QAT Q4_0 (base) | 2.800 millones | no disponible | Generico instruction-tuned | licencia Gemma 4 | Hugging Face |
| `Housto4/uadetox-gate` | no disponible | no disponible | Clasificador de que comentarios necesitan reescritura | no disponible | Hugging Face |

El autor compara contra Gemma 4 31B sin ajustar en 4-shot: este modelo obtiene 59,0 % de reescrituras buenas frente a 68,4 % del 31B, pero deja menos toxicidad (4,5 % frente a 3,1 %... el 31B deja menos) y pierde mas significado (42,6 % frente a 39,7 %). La ventaja real de este modelo no es la calidad absoluta sino el tamano: 1,84 GB en un unico fichero frente a un modelo de 31B. No se dispone de comparaciones con otros detoxificadores publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ucraniano: cualquier uso en otro idioma queda fuera de alcance explicito del autor.
- Siempre reescribe, incluso comentarios ya educados; sin un clasificador previo como `uadetox-gate` genera reescrituras innecesarias.
- Calidad moderada: en el test reservado solo el 59,0 % de las reescrituras se consideran buenas, el 42,6 % pierde parte del significado y en dev el 32 % presenta errores de fluidez y el 11 % no resulta literario. No es apto para sustitucion automatica sin revision humana.
- Riesgo de alucinacion y de alteracion de la postura: al reescribir puede cambiar matices del argumento original; el autor prohibe explicitamente alterar silenciosamente lo que escribio el usuario.
- Uso prohibido por el autor: generar texto toxico y alterar silenciosamente el contenido de los usuarios.
- Restricciones de licencia: el repo declara Apache 2.0, pero enlaza a la licencia de Gemma 4 de Google; conviene revisar los terminos de esa licencia antes de uso comercial, ya que el modelo base es de Google.
- Benchmarks no verificados: todas las metricas son declaradas por el autor (`verified: false`), con un juez LLM fijado cuya definicion no se detalla por completo en la informacion disponible.
- Contexto y prompt fragiles: entrenado con comentarios de una sola linea; hay que colapsar saltos de linea y espacios repetidos antes de la inferencia, y usar decodificacion greedy con parada en `<turn|>` para resultados reproducibles.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Housto4/uadetox-e2b
- Dataset de entrenamiento: https://huggingface.co/datasets/Housto4/uadetox
- Clasificador complementario: https://huggingface.co/Housto4/uadetox-gate
- Pagina del proyecto con demo y resultados: https://uadetox.pages.dev
- Bot de demostracion en Telegram: https://t.me/uadetoxbot
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Perfil del autor: https://huggingface.co/Housto4
