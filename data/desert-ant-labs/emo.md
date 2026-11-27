# desert-ant-labs/emo

## Resumen

Emo es un modelo de clasificación de texto especializado en la sugerencia de emojis a partir de texto corto. Lo desarrolla Desert Ant Labs y se distribuye a través de Hugging Face con el identificador `desert-ant-labs/emo`. Su función es recibir una palabra o frase (por ejemplo, "Dentist appointment" o "réserver un vol pour Tokyo") y devolver el emoji o conjunto de emojis más probables según la intención del texto. No es un modelo generativo: asigna una probabilidad a cada uno de los 812 emojis de su vocabulario y devuelve las mejores sugerencias.

El modelo está diseñado para ejecutarse en dispositivo (on-device), no en servidor. Se distribuye en dos formatos: LiteRT/TFLite en int8 (10,2 MB) para Android, Linux, Windows, Node y navegador, y Core ML compilado (4,6 MB) para plataformas Apple. Según el autor, la inferencia se completa en menos de 2 ms en dispositivo. Soporta 22 idiomas, incluyendo CJK, árabe, tailandés e hindi.

Su relevancia actual radica en el nicho que ocupa: sugerencia de emojis multilingüe de baja latencia y tamaño reducido para integrarse en teclados, aplicaciones de notas, calendarios y borradores de mensajes. La licencia es source-available con requisito de licencia comercial a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de texto; detalles de capas no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (optimizado para texto corto que expresa una intención) |
| Tipos de cuantizacion | int8 (LiteRT/TFLite); Core ML compilado |
| Idiomas soportados | 22: ar, cs, da, de, en, es, fr, hi, id, it, ja, ko, nl, pl, pt, ru, sv, th, tr, uk, vi, zh |
| Licencia | Desert Ant Labs Source-Available License (gratuita para la mayoría de apps, licencia comercial requerida a escala) |
| Formato de pesos | TFLite (`emo.tflite`, int8), Core ML (`emo.mlmodelc`), tokenizador Unigram (`emo_tokenizer.bin`), metadatos JSON (`emo_meta.json`) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención o composición del dataset de entrenamiento). El modelo se presenta como un clasificador de texto que produce una distribución de probabilidad sobre 812 emojis. El tokenizador es de tipo Unigram y se distribuye como artefacto separado (`emo_tokenizer.bin`, 0,75 MB), lo que sugiere una tokenización multilingüe entrenada para cubrir los 22 idiomas soportados.

El empaquetado está orientado a despliegue en dispositivo: conversión a int8 para LiteRT/TFLite y compilación a Core ML para Apple. No hay información pública sobre si se usó RLHF, DPO ni sobre el volumen o composición del corpus de entrenamiento. El repositorio ocupa 0,1 GB e incluye las revisiones `v0.6.0` y anteriores con pesos en `safetensors` y `Emo.mlmodelc` para versiones antiguas del SDK.

## Capacidades

- Clasificación de texto para sugerencia de emojis: devuelve una lista de sugerencias con puntuación de confianza para cada emoji del vocabulario de 812.
- Soporte multilingüe en 22 idiomas, incluyendo escrituras no latinas (árabe, chino simplificado y tradicional, japonés, coreano, hindi, tailandés, vietnamita, ruso, ucraniano).
- Selección de tono de piel del emoji mediante el parámetro `skinTone` (por ejemplo, `.medium` en Swift, `EmojiSkinTone.MEDIUM` en Kotlin).
- Límite configurable del número de sugerencias devueltas (`limit`).
- Ejecución on-device con latencia inferior a 2 ms según el autor.
- Descarga y caché de pesos gestionada por el SDK, con opción de empaquetar los pesos en la propia aplicación (`Emo(directory:)`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Teclados y métodos de entrada: el modelo puede sugerir emojis mientras el usuario escribe en cualquier aplicación, con latencia inferior a 2 ms y un peso de 5-11 MB que no penaliza el tamaño del teclado.
- Aplicaciones de notas y listas de tareas: al escribir "Pay my bills" o "Dentist appointment", el modelo sugiere 💰 o 🦷 para enriquecer visualmente la entrada sin intervención del usuario.
- Calendario y recordatorios: asignación automática de emojis a eventos según su descripción ("จองโรงแรม" → 🏨), útil para vistas de agenda con iconografía consistente.
- Borradores de mensajes: sugerencia de emojis al redactar mensajes cortos en aplicaciones de mensajería, con soporte para los 22 idiomas del modelo y selección de tono de piel.
- Aplicaciones multiplataforma: el mismo modelo sirve en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node mediante los SDK de Swift, Kotlin y JavaScript, lo que permite una experiencia coherente entre plataformas.
- Procesamiento por lotes en servidor (Node): mediante la ruta `/native` del SDK de JavaScript, se pueden clasificar grandes volúmenes de textos cortos (por ejemplo, etiquetado de entradas de usuario) sin depender de una GPU.
- Filtrado y enriquecimiento de contenido generado por usuarios: asignación de emojis a títulos o resúmenes en aplicaciones de blog o foros, con la ventaja de que el modelo corre en el cliente y no requiere enviar texto a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente declara una latencia de inferencia inferior a 2 ms en dispositivo, sin especificar el hardware de referencia ni métricas de precisión (top-1, top-5) por idioma.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para CPU y aceleradores integrados (Neural Engine en Apple, NNAPI/GPU en Android), no para GPU de servidor.
- Tamaño en disco: 4,6 MB (Core ML compilado) en Apple; 10,2 MB (TFLite int8) más 0,75 MB de tokenizador en el resto de plataformas.
- GPU recomendadas: no requiere GPU dedicada. En Apple se ejecuta vía Core ML (con posible uso del Neural Engine); en Android, Linux, Windows y Node vía LiteRT.
- Cabe en cualquier GPU de consumo y en dispositivos móviles de gama baja; no necesita A100, H100 ni RTX 4090.
- Opciones de despliegue: SDK propio de Desert Ant Labs para Swift (Swift Package Manager), Kotlin (Maven, BOM `ai.desertant:bom:6.0.0`) y JavaScript (`@desert-ant-labs/emo` para navegador y `/native` para Node en linux-x64, linux-arm64 y darwin-arm64). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia: menos de 2 ms por inferencia según el autor; throughput no publicado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de sugerencia de emojis on-device en la documentación proporcionada. La comparación con clasificadores de texto genéricos o con modelos generativos multimodales no sería homogénea por diferencia de tarea, tamaño y modo de despliegue.

| Modelo | Tarea | Idiomas | Tamaño | Licencia | Despliegue |
|---|---|---|---|---|---|
| Emo (desert-ant-labs) | Sugerencia de emojis | 22 | 4,6-10,2 MB | Source-available | On-device (Core ML, LiteRT) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está ajustado para texto corto que expresa una intención; con textos largos las sugerencias se vuelven más ruidosas, según el propio autor.
- Los significados de los emojis son imprecisos por naturaleza; es habitual que las mejores sugerencias queden casi empatadas en probabilidad, lo que exige presentar varias opciones al usuario.
- La calidad varía según el idioma: el autor reconoce que el rendimiento es algo inferior en los idiomas de menores recursos del conjunto.
- No es un modelo generativo: no produce texto, código ni razonamiento; no soporta tool calling ni agentes.
- Licencia source-available: el uso es gratuito para la mayoría de aplicaciones, pero se requiere licencia comercial a escala. Es imprescindible revisar los términos en https://license.desertant.com/ antes de un despliegue comercial.
- Riesgo de sesgos: no se documenta ninguna evaluación de sesgos; al tratarse de un clasificador sobre un vocabulario cerrado de emojis, los sesgos se manifestarían en asociaciones culturales o de género entre texto y emoji.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede devolver sugerencias poco adecuadas con alta confianza en entradas ambiguas.
- Las versiones antiguas del SDK cargan `Emo.mlmodelc` y `emo.safetensors`, disponibles solo en las revisiones `v0.6.0` y anteriores; hay que fijar la revisión correcta para evitar incompatibilidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/emo
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/desert-ant-labs/emo-demo
- Demo del autor: https://desertant.com/models/emo/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos del SDK en Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos del SDK en Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos del SDK en JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descargas y caché del modelo: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
- Licencia: https://license.desertant.com/
- Avisos de terceros: https://huggingface.co/desert-ant-labs/emo/blob/main/THIRD_PARTY_NOTICES.md
- Revisiones de pesos: https://huggingface.co/desert-ant-labs/emo/tree/v0.7.0
- Contacto de licencias: licensing@desertant.com
