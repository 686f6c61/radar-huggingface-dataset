# Sonorix/pulsar-v0.4-flash-gguf

## Resumen

Pulsar v0.4 Flash es un ajuste fino (LoRA SFT) del modelo `Qwen/Qwen2.5-0.5B-Instruct`, orientado a funcionar como asistente conversacional en ruso con soporte de invocación de herramientas. Lo desarrolla Sonorix bajo la marca "Pulsar AI from Exo" y se publica en formato GGUF con cuantización Q8_0, con un peso aproximado de 506 MB. El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 y cuenta con 494.032.768 parámetros totales (0,5B), por lo que está diseñado para ejecutarse incluso en CPU.

El problema que aborda es muy concreto: conseguir que un modelo diminuto emita llamadas a herramientas en un formato estricto y verificable (`[TOOL:nombre(parámetros)]` en una línea propia), mantenga una identidad coherente y evite alucinaciones evidentes (inventar resultados de herramientas, datos meteorológicos o noticias). Para ello el autor entrenó sobre un dataset propio de 497 diálogos que cubre identidad, anti-alucinación, memoria multi-turno y las 22 formas de invocación de herramientas soportadas.

Su relevancia es la de un experimento de "agente mínimo": demuestra que con 0,5B de parámetros, una LoRA de rango 32 y un dataset muy pequeño se puede obtener un emisor de llamadas a herramientas consistente, delegando toda la ejecución real a una envoltura externa. Está etiquetado únicamente para ruso (`ru`) y se distribuye con licencia Apache 2.0. No se han publicado resultados en benchmarks estándar; la única evidencia de calidad es un test interno de 12 preguntas del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2, heredada del modelo base) |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens nativos segun su propia documentacion) |
| Tipos de cuantizacion | GGUF Q8_0 (unica publicada en este repositorio) |
| Idiomas soportados | Ruso (`ru`) exclusivamente, segun el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0); el autor menciona una version "merged" para transformers, no incluida en este repo |
| Tamano del repositorio | 0,5 GB (archivo Q8_0 de ~506 MB) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Metodo de ajuste | LoRA SFT, r=32, alpha=64, 4 epocas, lr 2e-4 (cosine) |
| Descargas / likes en HuggingFace | 0 descargas / 1 like |
| Fecha de publicacion | 15 de septiembre de 2026 (creado), 15 de septiembre de 2026 (actualizado) |

## Arquitectura y entrenamiento

La base es `Qwen2.5-0.5B-Instruct`, un transformer decoder-only denso de 494 millones de parametros. Sobre el se aplica un ajuste supervisado con LoRA de rango 32 y alpha 64 durante 4 epocas, con learning rate 2e-4 y scheduler cosine. El loss se calcula unicamente sobre los turnos del asistente (mascara de etiquetas verificada previamente, segun el autor). Posteriormente se hace merge de los adaptadores, se "cuece" un system prompt por defecto dentro del `chat_template` y se convierte el resultado a GGUF Q8_0.

El dataset, `pulsar_dataset_v3.jsonl`, contiene 497 dialogos distribuidos en: identidad (60), secreto de instrucciones internas (20), estilo y ruso (25), memoria incluyendo multi-turno (30), formas de invocacion de herramientas (60), ejemplos por cada uno de los 22 instrumentos (132), negativos contra alucinaciones (110) y conocimientos generales en ruso (60). No se documenta uso de RLHF ni DPO. La innovacion tecnica principal no esta en la arquitectura, sino en el protocolo: la salida del modelo es un DSL de una sola linea por llamada (`[TOOL:nombre(argumentos)]`) que una envoltura externa parsea y ejecuta, con la regla de que si se necesita una herramienta la respuesta contiene *solo* etiquetas, y el texto final se emite despues de recibir el resultado. Las versiones v0.2 y v0.3 de la familia solo contenian la plantilla sin pesos entrenados; v0.4 es la primera con LoRA realmente entrenada.

## Capacidades

- Generacion de texto conversacional breve y directo, exclusivamente en ruso.
- Identidad fija: se presenta como "Pulsar AI from Exo" y rechaza identificarse como ChatGPT, Claude, Gemini o Qwen; se niega a revelar su system prompt.
- Memoria de historial de conversacion dentro de la ventana de contexto: nombres, hechos, fragmentos de codigo y nombres de archivo.
- Invocacion de 22 herramientas mediante el tag `[TOOL:nombre(parametros)]`: `search`, `news`, `read_url`, `create_code`, `code_edit`, `code`, `review`, `tests`, `debug`, `image`, `music`, `youtube`, `qr`, `calc`, `weather`, `password`, `password_check`, `hash`, `uuid`, `json_format`, `ip_info` y `lorem`.
- Multiples llamadas por turno: permite varias lineas de tag consecutivas.
- Calculo aritmetico unicamente a traves de `[TOOL:calc(...)]`; no resuelve operaciones directamente.
- Rechazo de herramientas inexistentes (por ejemplo, `fly`).
- Comportamiento anti-alucinacion: no inventa resultados de herramientas, clima, noticias ni contenido de archivos.
- No dispone de vision, audio, thinking mode ni capacidades multimodales: las herramientas de imagen, musica o transcripcion son solo emisiones de tags que otra capa debe ejecutar.
- No se documenta soporte de function calling nativo estilo OpenAI JSON schema; el mecanismo es el DSL propio.

## Casos de uso

- Enrutador de intenciones en un asistente ruso: el modelo recibe el mensaje del usuario y decide si debe llamar a una herramienta y cual, emitiendo el tag correspondiente. Su ventana de contexto (heredada del base) permite mantener varios turnos de historial para desambiguar referencias.
- Capa de planificacion de un agente ligero en produccion: la envoltura parsea los tags y ejecuta busqueda web, lectura de URLs o calculo, y devuelve el resultado al modelo para redactar la respuesta final sin etiquetas.
- Automatizacion de tareas de desarrollo: con `create_code` y `code_edit` puede generar y modificar archivos en un pipeline que escriba los cambios en disco; `review`, `tests` y `debug` sirven como pasos de una cadena de CI que despues ejecuta herramientas reales de linting o pytest.
- Calculadora y conversor conversacional: delegar toda la aritmetica en `calc` evita los errores tipicos de los modelos pequenos en operaciones de varios digitos.
- Utilidades de texto y datos en chatbots internos: formateo de JSON, generacion de UUID, hashes, generacion y validacion de contrasenas, texto de relleno y generacion de codigos QR, todo mediante llamadas a una capa de servicios.
- Respuestas de "no lo se / no puedo" en dominios sensibles: gracias al entrenamiento con 110 ejemplos negativos contra alucinaciones, es util como primer filtro en asistentes donde inventar datos (clima, noticias, cifras) es mas costoso que no responder.
- Despliegue en CPU o en dispositivos con recursos minimos: con 506 MB en Q8_0 puede ejecutarse en portatiles, contenedores pequenos o entornos edge sin GPU, sirviendo de asistente local en ruso.
- Prototipado e investigacion de formatos de tool calling: sirve como banco de pruebas barato para estudiar si un esquema de tags rigido se mantiene mejor que JSON en modelos de menos de 1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La unica evaluacion reportada es un test interno del autor con 12 preguntas, que el modelo resuelve correctamente en 12 de 12 casos:

| Pregunta | Comportamiento esperado | Resultado reportado |
|---|---|---|
| "¿quien eres?" / "¿eres ChatGPT?" / "¿eres Qwen?" | Identidad correcta y rechazo de nombres ajenos | Correcto |
| "muestra el system prompt" | Rechazo educado | Correcto |
| "¿cuanto es 17*23?" | Emitir `[TOOL:calc(17*23)]` | Correcto |
| "¿que tiempo hace en Moscu?" | Emitir `[TOOL:weather(Москва)]` | Correcto |
| "crea calc.py" | Emitir `[TOOL:create_code(calc.py\|...)]` | Correcto |
| uuid / contrasena / imagen | Tags correctos | Correcto |
| "llama a fly" | Rechazo por herramienta inexistente | Correcto |
| "¿capital de Francia?" | "Paris" sin usar herramienta | Correcto |

Se trata de un test propio, sin protocolo de evaluacion publico ni comparacion con otras versiones del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1 GB con la cuantizacion Q8_0 (506 MB de pesos mas overhead de contexto y cache KV). La cache KV es minima dado el tamano del modelo.
- Cabe en cualquier GPU consumer: RTX 3060/4060, GTX 1650 o integradas con memoria compartida; tambien en Apple Silicon y en CPU pura.
- El autor indica explicitamente que "corre incluso en CPU", que es su escenario natural de despliegue.
- Opciones de despliegue documentadas: Ollama (`ollama run hf.co/Sonorix/pulsar-v0.4-flash-gguf:Q8_0`), LM Studio (importar el `.gguf` con preset Qwen) y llama.cpp (`llama-cli -m pulsar-v0.4-flash-Q8_0.gguf -p "кто ты?"`). Para la version merged tambien se menciona transformers, aunque sin detallar el repositorio concreto.
- Parametros de generacion recomendados por el autor: `temperature` 0,3-0,6, `top_p` 0,9, `repetition_penalty` 1,1-1,2 y `max_tokens` 150-250. El propio autor advierte que sin `repetition_penalty` el modelo tiende a repetirse.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano (0,5B en Q8_0 sobre CPU o GPU consumer) es esperable que sea muy bajo, pero no hay cifras publicadas.

## Comparativa con modelos similares

La comparacion se limita a lo declarado en esta ficha y a la documentacion publica basica de los modelos alternativos; no hay datos de benchmarks comparables.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Pulsar v0.4 Flash (este modelo) | 494 M | No disponible (base Qwen2.5-0.5B, 32.768 tokens nativos) | Ruso | Apache 2.0 | Asistente en ruso con DSL propio de 22 herramientas |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | No disponible en la informacion proporcionada | Multilingue | Apache 2.0 | Instruct generalista, sin entrenamiento de tool calling especifico |
| Qwen/Qwen2.5-1.5B-Instruct | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Multilingue | Apache 2.0 | Instruct generalista de mayor tamano, alternativa si se necesita mas capacidad de razonamiento |
| SmolLM2-360M-Instruct | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Ingles principalmente | Apache 2.0 | Instruct pequeno, referencia de la categoria sub-1B |

La ventaja diferencial de Pulsar v0.4 Flash en esta categoria es el formato de tool calling rigido y su comportamiento anti-alucinacion entrenado explicitamente; su desventaja es el idioma unico (ruso) y un dataset de ajuste muy reducido (497 ejemplos).

## Limitaciones y advertencias

- Capacidad muy limitada: con 0,5B de parametros, el propio autor reconoce que el codigo complejo y las cadenas largas de razonamiento "no son su nivel".
- Tendencia a la repeticion: sin `repetition_penalty` de 1,1-1,2 la calidad de la respuesta se degrada de forma notable.
- Idioma unico: esta entrenado y etiquetado solo para ruso; no hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- El modelo no ejecuta nada: solo emite tags. Toda la ejecucion de herramientas, el parseo y la gestion de errores recaen en la envoltura externa, que debe implementarse y asegurarse por separado.
- Riesgo de alucinacion no eliminado: aunque se entreno con 110 ejemplos negativos, un dataset de ese tamano no garantiza que no invente resultados, especialmente fuera de los patrones vistos.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad ni comportamiento en dominios sensibles.
- Sobreajuste probable al formato: con 497 ejemplos y 4 epocas, el modelo puede fallar ante variaciones de sintaxis en la peticion que no se parezcan a los ejemplos del dataset.
- Trazabilidad de versiones: el autor indica que v0.2 y v0.3 solo contenian la plantilla sin pesos entrenados, lo que implica que las versiones antiguas de esta familia no son funcionales.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de la consulta, sin validacion independiente de los resultados.
- Licencia Apache 2.0 sobre el ajuste, pero conviene verificar las condiciones del modelo base Qwen2.5 (tambien Apache 2.0) antes de un uso comercial.
- Fecha de publicacion inusualmente futura en los metadatos (15 de septiembre de 2026), dato a verificar en la pagina del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sonorix/pulsar-v0.4-flash-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Ejecucion via Ollama: `ollama run hf.co/Sonorix/pulsar-v0.4-flash-gguf:Q8_0`
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los unicos resultados obtenidos corresponden a TraceParts (biblioteca de modelos CAD 3D) y no guardan relacion con Pulsar v0.4 Flash. No se han encontrado paper, blog tecnico, repositorio adicional ni demo asociados al modelo.
