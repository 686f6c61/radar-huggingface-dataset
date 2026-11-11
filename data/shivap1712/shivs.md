# shivap1712/shivs

## Resumen

SHIVS 0.5B es un modelo de lenguaje especializado en convertir transcripciones de voz en acciones estructuradas para Android. Se trata de un ajuste fino mediante LoRA de Qwen2.5-0.5B-Instruct, desarrollado por el usuario shivap1712 y publicado bajo licencia Apache-2.0. El modelo no genera texto libre: su única tarea es transformar una orden como "switch the bluetooth on and open whatsapp" en un array JSON de entre una y tres acciones de teléfono, con un esquema cerrado de 29 acciones posibles.

La relevancia del modelo radica en su enfoque de despliegue en dispositivo: se distribuye como GGUF Q4_K_M de aproximadamente 398 MB, pensado para ejecutarse en el propio teléfono junto a whisper.cpp para la parte de reconocimiento de voz. La salida se restringe mediante una gramática GBNF que hace imposible generar JSON inválido o nombres de acción fuera del esquema, lo que elimina una de las principales fuentes de error en pipelines de agentes.

El modelo forma parte de un asistente de voz on-device completo: whisper.cpp base.en transcribe, se elimina la palabra de activación, se normalizan dígitos hablados y SHIVS decide la acción. La precisión de extremo a extremo medida en voz real fue del 57 al 78% con un único hablante y un único teléfono, y no se ha evaluado con otras voces, acentos o dispositivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino LoRA fusionado |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso emplea n_ctx=512 |
| Tipos de cuantizacion | Q4_K_M (GGUF distribuido) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parametros con formato de chat ChatML. Sobre esa base se aplico un ajuste fino LoRA con rango 32 y alpha 32 sobre todas las proyecciones de atencion y MLP, usando Unsloth en una GPU Colab T4, con learning rate 2e-4 y 3 epocas (la model card se interrumpe en este punto). Los pesos LoRA se fusionaron con el modelo base y se cuantizaron a Q4_K_M.

La innovacion principal no esta en la arquitectura sino en el control de la salida: se acompaña el modelo de una gramatica GBNF (`actions.gbnf`, 4 KB) que restringe la decodificacion al esquema cerrado de 29 acciones y sus parametros. Segun el autor, sin gramatica el modelo a veces inventa nombres de accion (`set_volume_level`, `battery_toggle`) o valores de enum; con ella, la salida siempre es JSON valido conforme al esquema. El modelo solo elige accion y parametros; la app decide como ejecutar cada accion.

## Capacidades

- Conversion de comandos de voz en JSON estructurado de acciones Android, con 1 a 3 acciones por comando.
- Esquema cerrado de 29 acciones: toggles (bluetooth, wifi, linterna, modo avion, no molestar, datos moviles, hotspot, ahorro de bateria, ubicacion, rotacion automatica, altavoz), sonido y pantalla (modo timbre, volumen, brillo), tiempo (alarma, temporizador), apps (abrir app), llamadas (a contacto, a numero, videollamada, colgar), mensajes (SMS, email, leer mensajes, compartir ubicacion), sistema (captura de pantalla, bloquear pantalla) y dialogo (`clarify`, `unsupported`).
- Acciones de dialogo: `clarify` para pedir aclaracion y `unsupported` para rechazar comandos fuera del esquema; siempre son la unica accion del array.
- Salida garantizada como JSON valido mediante gramatica GBNF, con orden de claves fijo y sin espacios.
- No soporta tool calling generico ni function calling fuera del esquema; la "herramienta" es el propio conjunto cerrado de acciones.
- No soporta agentes multi-paso ni razonamiento encadenado: una transcripcion produce un unico array de acciones.
- Capacidades multilingues limitadas al ingles.
- No dispone de vision ni audio: la parte de voz la cubre whisper.cpp base.en, incluido en el repositorio.

## Casos de uso

- Asistente de voz on-device para Android: el modelo se ejecuta en el telefono junto a whisper.cpp; el usuario dicta una orden, se transcribe, se elimina la palabra de activacion y SHIVS genera el JSON de acciones que la app ejecuta. Es adecuado por su tamano (398 MB) y su latencia (aproximadamente 1,0-1,5 s por paso en el telefono de prueba).
- Control de ajustes del sistema por voz: comandos como activar wifi, bluetooth o linterna se traducen a toggles; para los ajustes que Android no permite cambiar silenciosamente desde una app normal (wifi, datos moviles, bluetooth, modo avion, ubicacion, ahorro de bateria, hotspot), la app abre la pantalla de ajustes correspondiente.
- Creacion de alarmas y temporizadores por dictado: el modelo extrae hora en formato HH:MM y etiqueta opcional, o horas/minutos/segundos, lo que permite montar un asistente de cocina o productividad sin conexion.
- Mensajeria y llamadas manos libres: genera acciones `send_message`, `send_email`, `call_contact`, `call_number` o `video_call` a partir de una frase hablada, util en conduccion o con el telefono bloqueado.
- Automatizacion de accesibilidad: usuarios con movilidad reducida pueden encadenar acciones como abrir una app, subir el volumen y hacer una llamada mediante una sola orden de voz, con salida JSON validada contra el esquema antes de ejecutarse.
- Filtrado y clarificacion de comandos: las acciones `clarify` y `unsupported` permiten que la app pida aclaracion o rechace comandos ambiguos o fuera de alcance sin generar texto libre, lo que simplifica el manejo de errores en produccion.
- Prototipado de agentes de voz embebidos: al ser un GGUF pequeno con gramatica, sirve como base para experimentar con pipelines de intencion en dispositivos de recursos limitados sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta una medida de extremo a extremo en voz real: precision del 57 al 78% con un hablante y un telefono, sin evaluacion con otras voces, acentos o dispositivos. Tambien indica que el paso del modelo tarda aproximadamente 1,5 s y que, manteniendo el system prompt y la cabecera de chat en la cache KV, baja a aproximadamente 1,0 s en el telefono de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en Q4_K_M, mas la cache KV (el ejemplo usa n_ctx=512).
- GPU recomendadas: no requiere GPU; esta disenado para CPU de telefono. En escritorio puede ejecutarse en cualquier CPU moderna.
- Cabe en GPU consumer: si, en cualquier GPU con 1 GB o mas de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.), aunque el objetivo es la ejecucion en dispositivo.
- Opciones de despliegue: llama.cpp (`llama-cli`), llama-cpp-python con `LlamaGrammar.from_file`, y cualquier runtime compatible con GGUF y gramaticas GBNF. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: aproximadamente 1,0-1,5 s por comando en el telefono de prueba con cache KV del prefijo; sin datos de throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SHIVS 0.5B | 494 M | no disponible (ejemplo con 512) | Intenciones Android con gramatica GBNF | Apache-2.0 | GGUF en Hugging Face |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (segun el modelo base) | Chat general | Apache-2.0 | safetensors y GGUF |
| Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens (segun el modelo base) | Chat general | Apache-2.0 | safetensors y GGUF |

La comparativa se limita al modelo base y a su version superior de la misma familia, ya que no se dispone de datos de benchmarks de SHIVS frente a alternativas especializadas en intenciones de voz. Frente a Qwen2.5-0.5B-Instruct, SHIVS sacrifica generalidad y multilingueismo a cambio de una salida estrictamente estructurada para acciones Android. Los datos de contexto de Qwen2.5-0.5B-Instruct y Qwen2.5-1.5B-Instruct provienen del conocimiento del modelo base y no de la informacion proporcionada en esta ficha.

## Limitaciones y advertencias

- El punto debil medido es el reconocimiento de voz en microfono de telefono, que confunde nombres; la precision de extremo a extremo en voz real fue del 57 al 78% con un solo hablante y un solo telefono, y no se ha medido con otras voces, acentos o dispositivos.
- Sin la gramatica GBNF el modelo a veces inventa nombres de accion o valores de enum; en produccion la gramatica es obligatoria.
- El esquema de acciones es cerrado: cualquier comando fuera de las 29 acciones debe devolverse como `unsupported` o `clarify`.
- Solo soporta ingles; no hay capacidades multilingues.
- El system prompt debe coincidir exactamente con el especificado; el formato de chat es ChatML.
- Android no permite a una app normal cambiar silenciosamente wifi, datos moviles, bluetooth, modo avion, ubicacion, ahorro de bateria o hotspot, por lo que la app debe abrir la pantalla de ajustes correspondiente.
- La model card esta incompleta en la seccion de entrenamiento (se corta en "3 ep"), por lo que no se detalla la composicion del dataset ni si hubo RLHF/DPO.
- Riesgo de alucinacion en nombres de apps o contactos: el modelo solo elige la accion y sus parametros; la validacion del JSON contra el esquema y la resolucion de nombres recaen en la app.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni evaluaciones fuera del escenario probado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shivap1712/shivs
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- llama.cpp: https://github.com/ggerganov/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Unsloth: https://github.com/unslothai/unsloth
