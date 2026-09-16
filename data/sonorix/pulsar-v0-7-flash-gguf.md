# Sonorix/pulsar-v0.7-flash-gguf

## Resumen

Pulsar v0.7 Flash es un ajuste fino (fine-tuning) del modelo Qwen2.5-0.5B-Instruct desarrollado por Sonorix bajo la marca «Pulsar AI from Exo». Se trata de un asistente conversacional compacto, especializado exclusivamente en ruso, cuyo objetivo principal es emitir llamadas a herramientas mediante un protocolo textual propio: el modelo no ejecuta ninguna accion, solo genera etiquetas del tipo `[TOOL:nombre(parametros)]` que una envoltura externa (agente) debe interpretar y ejecutar.

La relevancia de esta ficha es acotada pero clara: demuestra que es posible dotar a un modelo de 0,49 mil millones de parametros de un comportamiento de tool calling razonablemente disciplinado mediante LoRA SFT sobre un dataset pequeno y muy curado (1303 dialogos), sin necesidad de RLHF ni de infraestructura de entrenamiento significativa. El resultado es un artefacto de ~506 MB en cuantizacion Q8_0 que se ejecuta en CPU.

El modelo hereda la arquitectura transformer decoder-only del Qwen2.5-0.5B-Instruct, con licencia Apache 2.0, y distribuye sus pesos unicamente en formato GGUF (cuantizacion Q8_0) para su uso con Ollama, LM Studio o llama.cpp. El autor ha integrado ademas un system prompt fijo directamente en el `chat_template`, de modo que la identidad del asistente y las reglas de uso de herramientas se aplican por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 (~0,49 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-0.5B-Instruct declara 32 768 tokens de contexto nativo |
| Tipos de cuantizacion | Q8_0 (GGUF); el autor tambien menciona una version «merged» para transformers |
| Idiomas soportados | Ruso unicamente (`ru`); el autor indica que responde solo en ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0, ~506 MB); repo de 1,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-0.5B-Instruct: un transformer decoder-only de 0,49 B de parametros. Sobre el se aplico un ajuste LoRA SFT con rango 32 y alpha 64, durante 4 epocas con learning rate 2e-4 y scheduler coseno. La mascara de perdida se aplico unicamente a los turnos del asistente, incluyendo el token de fin de respuesta (el autor indica que se verifico mediante un preflight: 1016 de 1023 tokens correctamente enmascarados). No se menciona ninguna fase de RLHF ni de DPO.

El dataset de entrenamiento (`pulsar_dataset_v7.jsonl`) contiene 1303 dialogos e incluye ejemplos de identidad del asistente, protocolo de herramientas, anti-alucinacion, programacion web y Python contemporaneos (FastAPI, pydantic, asyncio, httpx), JavaScript/TypeScript moderno, CSS con tecnicas actuales (glassmorphism, blur, flex/grid, Tailwind, tema oscuro), SQL, 40 problemas algoritmicos, tareas de debug/review/tests y matematicas resueltas mediante la herramienta `calc`. Como innovacion practica destacable, tras el merge de los pesos el autor «horneo» el system prompt en la plantilla de chat, de forma que las reglas de comportamiento viajan con el tokenizador del modelo.

## Capacidades

- Generacion de texto conversacional en ruso, con respuestas breves y directas.
- Emision de llamadas a 22 herramientas mediante etiquetas en linea propia: `search`, `news`, `read_url`, `create_code`, `code_edit`, `code`, `review`, `tests`, `debug`, `image`, `music`, `youtube`, `qr`, `calc`, `weather`, `password`, `password_check`, `hash`, `uuid`, `json_format`, `ip_info` y `lorem`.
- Generacion de codigo: HTML/CSS/JS moderno, Python (FastAPI, pydantic, asyncio, httpx, sqlalchemy, pytest), Go, Rust, SQL y TypeScript, siempre emitido a traves de las herramientas de creacion o edicion de ficheros.
- Aritmetica delegada a `[TOOL:calc(...)]`, en lugar de calcular internamente.
- Gestion de identidad: mantiene el personaje «Pulsar AI from Exo» y rechaza identificarse como ChatGPT, Claude, Gemini o Qwen.
- Memoria de la conversacion dentro de la ventana de contexto: nombres, hechos, codigo y ficheros previos.
- Comportamiento anti-alucinacion entrenado: rechaza herramientas inexistentes y evita inventar resultados de herramientas.
- Sistema de rechazo para peticiones de codigo malicioso, con propuesta de alternativa legal.
- No dispone de vision, audio, modo de razonamiento explicito (thinking) ni capacidades multilingues fuera del ruso.

## Casos de uso

- Atencion al cliente en ruso: el modelo puede mantener conversaciones multi-turno en ruso y delegar en herramientas externas la consulta de datos reales (pedidos, estado de cuenta, documentacion) mediante `read_url` o `search`, evitando respuestas inventadas.
- Backend de agentes de automatizacion: al emitir etiquetas estructuradas y un unico tag por llamada, es sencillo construir un parser determinista que ejecute acciones reales (crear ficheros, lanzar tests, generar UUIDs, formatear JSON) en un pipeline controlado por codigo.
- Asistente de soporte para desarrolladores: las herramientas `review`, `tests` y `debug` permiten usarlo como primer filtro en revisiones de codigo, generacion de pruebas unitarias o localizacion de errores antes de escalar a un revisor humano.
- Generacion rapida de ficheros de codigo en entornos con recursos minimos: un servicio que recibe una peticion y devuelve un fichero `.py`, `.js` o `.sql` listo para escribir a disco, ejecutable en CPU sin GPU.
- Automatizacion de utilidades de sistema: generacion y validacion de contrasenas, hashes, QR, texto de relleno y consultas de IP mediante las herramientas correspondientes, integrable en bots internos.
- Prototipado y docencia de tool calling: por su tamano, sirve como banco de pruebas para ensenar o investigar protocolos de llamada a funciones en modelos pequenos, comparando el efecto de distintas estrategias de prompt y de `repetition_penalty`.
- Clasificacion y enrutado ligero de intenciones en ruso dentro de un sistema mayor: determinar si una consulta requiere busqueda web, calculo, generacion de codigo o respuesta directa.
- Despliegue en dispositivos con restricciones: al ocupar ~506 MB, puede ejecutarse en un portatil modesto, un mini-PC o un contenedor con memoria limitada, sirviendo de asistente local sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta una prueba funcional propia de 18 casos, orientada a verificar comportamiento (identidad, uso correcto de etiquetas, rechazos) y no capacidad general:

| Prueba funcional del autor (v0.7) | Resultado reportado |
|---|---|
| Preguntas de identidad (quien eres, eres ChatGPT, eres Qwen) | Identidad correcta y rechazo de nombres ajenos |
| Solicitud del system prompt | Rechazo educado |
| Calculos (17*23, descuento del 20 % sobre 1500) | Etiquetas `calc` correctas |
| Generacion de codigo (calc.py, snake, FastAPI, SQL, glass) | Etiquetas `create_code` con codigo correcto |
| Utilidades (uuid, contrasena, imagen) | Etiquetas correctas |
| Herramienta inexistente (fly) | Rechazo |
| Preguntas directas (capital de Francia, acentuacion) | Respuesta directa sin herramientas |
| Consulta del tiempo en Moscu | Etiqueta de tiempo correcta (error corregido respecto a v0.6) |
| Total | 18 de 18 casos superados |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para el fichero Q8_0 de ~506 MB, mas el overhead de la cache KV (dependiente de la longitud de contexto efectiva). Con 2-4 GB de memoria total es suficiente en la practica.
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada. Funciona en GTX 1050/1650, RTX 3050, RTX 4060, RTX 4090, y tambien en Apple Silicon (Metal) y en CPUs x86-64 con AVX2.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM, e incluso en CPU pura sin acelerador dedicado.
- Opciones de despliegue: Ollama (`ollama run hf.co/Sonorix/pulsar-v0.7-flash-gguf:Q8_0`), LM Studio (importar el `.gguf` con preset Qwen), llama.cpp (`llama-cli -m pulsar-v0.7-flash-Q8_0.gguf`), y transformers con la version merged. No se documenta soporte explicito para vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor no publica mediciones, aunque indica que el modelo «corre incluso en CPU».
- Parametros de generacion recomendados por el autor: `temperature` 0,3-0,6, `top_p` 0,9, `repetition_penalty` 1,1-1,2 y `max_tokens` 150-250.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Pulsar v0.7 Flash | 0,49 B | No especificado en la model card (base Qwen2.5-0.5B-Instruct: 32 768 tokens) | Ruso | Apache 2.0 | GGUF Q8_0 | Ajuste LoRA especializado en tool calling en ruso; identidad propia; 22 herramientas |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32 768 tokens (segun su model card publica) | Multilingue | Apache 2.0 | safetensors, GGUF | Modelo base del que deriva Pulsar; no incluye protocolo de herramientas ni identidad personalizada |
| Otros ajustes rusos de modelos de ~0,5 B | No disponible | No disponible | Ruso | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparativa con alternativas de la misma categoria (asistentes rusos con tool calling en el rango de 0,5 B) no puede completarse con datos verificables a partir de la informacion disponible.

## Limitaciones y advertencias

- Capacidad limitada por tamano: con 0,49 B de parametros, el autor advierte explicitamente de que el codigo complejo y las cadenas de razonamiento largas quedan fuera de su alcance.
- Tendencia a la repeticion: sin `repetition_penalty` entre 1,1 y 1,2 el modelo puede repetirse, segun reconoce la propia model card.
- Ejecucion de herramientas externa: el modelo unicamente emite etiquetas de texto; no ejecuta ninguna accion. Toda la seguridad depende de la envoltura que interprete y valide los tags.
- Monolingue en ruso: no esta pensado para responder en castellano ni en otros idiomas, por lo que su uso en entornos hispanohablantes requeriria un ajuste adicional.
- Riesgo de alucinacion: aunque se entreno con ejemplos anti-alucinacion y rechaza herramientas inexistentes, sigue siendo un modelo de 0,5 B y puede generar contenido incorrecto, especialmente fuera del dominio del dataset (1303 dialogos).
- Contexto no documentado: la model card no especifica la longitud de contexto efectiva tras el ajuste, dato critico para planificar conversaciones largas.
- Ausencia de benchmarks: no hay evaluaciones estandar publicadas, por lo que no es posible comparar su calidad de forma objetiva con alternativas.
- Identidad forzada: el system prompt esta incrustado en el `chat_template`, lo que dificulta reutilizar el modelo como base generica sin reescribir la plantilla.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al derivar de Qwen2.5-0.5B-Instruct conviene conservar los avisos de atribucion correspondientes.
- Adopcion nula: el repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, por lo que no existe comunidad, soporte ni validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sonorix/pulsar-v0.7-flash-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Ejecucion con Ollama: `ollama run hf.co/Sonorix/pulsar-v0.7-flash-gguf:Q8_0`
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: todos los enlaces obtenidos correspondian a foros de videojuegos sin relacion con Pulsar v0.7 Flash. No se han encontrado papers, blogs, repositorios ni demos adicionales.
