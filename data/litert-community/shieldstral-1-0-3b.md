# litert-community/Shieldstral-1.0-3B

## Resumen

Shieldstral-1.0-3B es un clasificador de seguridad y moderación de contenido desarrollado por Mistral AI, distribuido aquí en formato `.litertlm` por la comunidad `litert-community` para su ejecución con el runtime LiteRT-LM de Google. No es un modelo conversacional: recibe una política de moderación en lenguaje natural junto con un documento y emite un único token de respuesta (`yes` o `no`), o bien una puntuación continua mediante softmax sobre los logits de ambas opciones. Esta conversión permite ejecutar un clasificador de políticas adaptable completamente en dispositivo (teléfono, tableta, portátil o Raspberry Pi), sin llamadas de red.

El modelo se publica en cuatro variantes: dos de solo texto (int4 e int8) y dos multimodales que incorporan la torre de visión Pixtral con resolución estática de 560×560 (una para CPU y otra reexportada para GPU). La variante int4 de texto ocupa 2,20 GiB en disco con una sección principal de 1,82 GiB, lo que la convierte en la única opción que cabe en un iPhone con los límites prácticos de mmap de iOS.

La relevancia actual radica en la combinación de tres factores: licencia Apache 2.0, soporte de doce idiomas y la posibilidad de definir la política de moderación en el momento de la inferencia sin reentrenar el checkpoint. Esto permite desplegar moderación multilingüe en el propio dispositivo con requisitos de memoria muy contenidos y latencias de milisegundos en prefill.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Mistral, 3B) con torre de visión Pixtral en las variantes multimodales |
| Parametros totales | 3B (aproximado, según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens de caché KV; documentos de más de ~4000 tokens requieren reexportación con caché mayor |
| Tipos de cuantizacion | int4 blockwise-32 (OCTAV) + embedding int8; int8 dinámico en tiempo de exportación; int4-b32 decodificador + torre Pixtral int8 en variantes de visión |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM); modelo base en safetensors en `mistralai/Shieldstral-1.0-3B` |
| Libreria | litert-lm |
| Tamano del repo | 29,4 GB (incluye todas las variantes) |
| Variantes publicadas | `_int4` (texto, 2,20 GiB), `_int8` (texto, 3,71 GiB), `_vision_int4` (texto+imagen, 2,78 GB), `_vision_int4_gpu` (texto+imagen, 2,78 GB) |
| Resolución de visión | 560×560 estática |

## Arquitectura y entrenamiento

El modelo subyacente es `mistralai/Shieldstral-1.0-3B`, un transformer decoder-only de aproximadamente 3.000 millones de parámetros derivado de la familia Mistral. Las variantes multimodales añaden la torre de visión Pixtral con resolución fija de 560×560, cuantizada a int8 en el bundle. La innovación principal no reside en la arquitectura sino en el planteamiento de la tarea: el modelo formula la moderación como una pregunta binaria de un solo paso hacia delante, donde la política se inyecta en el prompt en lenguaje natural mediante tres campos (`<Instruct>`, `<Query>`, `<Document>`). Esto permite que un único checkpoint cubra políticas nuevas sin reentrenamiento.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. Lo que sí se documenta con precisión es el proceso de conversión a LiteRT-LM: la variante `_vision_int4_gpu` reexporta los mismos pesos con litert-converter 0.3.1 para rebajar el compuesto `odml.softmax` a un `SOFTMAX` nativo, ya que la versión 0.3.0 no podía bajarlo y el delegado GPU solo aceptaba 52 de 1187 operaciones, provocando el rechazo del motor. Los ficheros de texto se exportaron por una ruta que eliminaba esa marca y por eso no se vieron afectados.

## Capacidades

- Clasificación binaria de seguridad: responde `yes` o `no` a una pregunta de moderación sobre un documento, en un solo paso hacia delante y emitiendo un único token.
- Puntuación continua: softmax sobre los logits de `yes`/`no`, con umbral recomendado de 0,5 por la model card original; en LiteRT-LM requiere la API de scoring y dos prefills.
- Política adaptable en inferencia: la política de moderación se suministra en lenguaje natural en el campo `<Instruct>`, sin reentrenamiento.
- Multilingüismo: doce idiomas (inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano, árabe y ruso).
- Moderación de imágenes: las variantes `_vision_int4` y `_vision_int4_gpu` aceptan documentos de texto e imagen con la torre Pixtral.
- Ejecución totalmente local: sin llamadas de red, apta para entornos con requisitos de privacidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: es un clasificador, no un modelo conversacional. Una pregunta directa devuelve únicamente `yes` o `no`.

## Casos de uso

- Moderación de comentarios en aplicaciones móviles: el bundle `_int4` (1,82 GiB de sección principal) se ejecuta en el propio teléfono con LiteRT-LM y clasifica cada comentario contra la política definida en `<Instruct>`, sin enviar texto del usuario a un servidor y con TTFT de 910 ms en GPU de Galaxy S26.
- Filtrado de contenido generado por el usuario en foros multilingües: al cubrir doce idiomas con un único checkpoint, se puede aplicar la misma política a publicaciones en español, árabe o japonés sin desplegar clasificadores separados por idioma.
- Moderación de imágenes en dispositivos: la variante `_vision_int4` acepta documentos de imagen a 560×560 y permite rechazar contenido visual inapropiado antes de subirlo, con 1,9 tok/s de decodificación en CPU de Galaxy S26.
- Puerta de seguridad previa a un LLM generativo: dado que la respuesta es un único token, se puede intercalar como filtro de entrada o salida en un pipeline mayor, con coste de prefill de 289 tok/s en GPU móvil.
- Cumplimiento normativo en entornos sin conectividad: aplicaciones de campo, dispositivos industriales o portátiles sin red pueden ejecutar la moderación localmente gracias a la ausencia de llamadas de red.
- Adaptación rápida a nuevas políticas editoriales: al definirse la política en el prompt, un equipo de confianza y seguridad puede ajustar criterios (estrictez, categorías vigiladas) sin reentrenar ni redistribuir el modelo.
- Despliegue en hardware de bajo consumo: el formato LiteRT-LM y el tamaño int4 permiten ejecución en Raspberry Pi, tabletas y portátiles, ampliando la moderación a dispositivos donde no cabría un clasificador en fp16.

## Benchmarks y rendimiento

La model card incluye una tabla de puertas de calidad comparando el checkpoint fuente en fp32 sobre MPS (referencia) con otras ejecuciones, sobre un conjunto de 200 elementos estratificado 100 inseguros / 100 seguros del conjunto público OpenAI moderation evaluation, con umbral 0,5 y la receta de cribado amplio de la model card original. Los datos disponibles en la información proporcionada están incompletos (la fila de bf16 aparece truncada), por lo que solo se reproduce lo íntegro:

| Ejecución | F1 | Exactitud | Concordancia con referencia | r (margen de logits) | Cambios de etiqueta |
|---|---|---|---|---|---|
| fuente fp32 (referencia) | 85,0 | 83,0 | — | — | — |
| fuente bf16 | no disponible (dato truncado en la información) | no disponible | no disponible | no disponible | no disponible |

Rendimiento en dispositivo (edge-compat, LiteRT-LM 0.16.0, Galaxy S26):

| Variante | Dispositivo | Decode | Prefill | TTFT | Notas |
|---|---|---|---|---|---|
| `shieldstral-1.0-3b-int8` | GPU | 8,6 tok/s | 289 tok/s | 910 ms | 1187/1187 ops delegadas (2026-08-24) |
| `shieldstral-1.0-3b-int8` | CPU | 8,3 tok/s | 129 tok/s | 1,91 s | (2026-09-05) |
| `shieldstral-1.0-3b-vision-int4` | GPU | no ejecuta | — | — | `engine_create_failed` (2026-08-24) |
| `shieldstral-1.0-3b-vision-int4` | CPU | 1,9 tok/s | 33 tok/s | 7,48 s | (2026-09-05) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general, lo cual es coherente con la naturaleza de clasificador del modelo.

## Requisitos de hardware

- VRAM/RAM estimada: la variante `_int4` de texto ocupa 2,20 GiB en disco con 1,82 GiB de sección principal; la `_int8` requiere 3,71 GiB (3,33 GiB de sección principal); las de visión, 2,78 GB con 1,82 GiB de sección principal más la torre Pixtral.
- GPU de escritorio: no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible; el runtime objetivo es LiteRT-LM sobre GPU móvil e integrada, no servidores de datacenter.
- GPU de consumo: la variante `_int4` de texto es la única que cabe en un iPhone dentro del presupuesto práctico de mmap de iOS (~2,1 GiB con entitlements por defecto; por debajo de 3 GiB incluso con entitlements relajados). La `_int8`, con 3,33 GiB en una sola sección, excede ese límite y queda restringida a escritorio o equipos con alta memoria.
- Visión en GPU móvil: es obligatorio usar `_vision_int4_gpu`; el fichero `_vision_int4` original no carga en GPU móvil porque el delegado solo acepta 52 de 1187 operaciones y el motor se rechaza.
- Opciones de despliegue: LiteRT-LM 0.16.0 (runtime principal), con demo web vía WebGPU que carga `Shieldstral-1.0-3B_int4.litertlm` (2,36 GB de descarga). No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: en Galaxy S26 con GPU, 8,6 tok/s de decodificación, 289 tok/s de prefill y 910 ms de TTFT para la variante int8 de texto; en CPU, 8,3 tok/s, 129 tok/s y 1,91 s respectivamente. La variante de visión en CPU baja a 1,9 tok/s, 33 tok/s y 7,48 s de TTFT.
- Contexto: caché KV de 4096 tokens con escalera de prefill completa (2048 → 1); documentos de más de ~4000 tokens exigen reexportación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato edge | Disponibilidad |
|---|---|---|---|---|---|---|
| Shieldstral-1.0-3B (LiteRT-LM) | ~3B | 4096 | texto; texto+imagen en variantes de visión | Apache 2.0 | `.litertlm` int4/int8 | HuggingFace, demo web |
| `mistralai/Shieldstral-1.0-3B` (original) | ~3B | no disponible | texto; visión según checkpoint | Apache 2.0 | safetensors | HuggingFace |
| Clasificadores de moderación propietarios (p. ej. API de moderación de OpenAI) | no disponible | no disponible | texto; imagen en algunas APIs | propietaria | API en la nube | servicio gestionado |

La información disponible no incluye comparaciones con otros clasificadores de seguridad open source de tamaño similar (por ejemplo, variantes de Llama Guard), por lo que la comparativa se limita a los elementos documentados. La ventaja diferencial de esta conversión frente al checkpoint original es la ejecución en dispositivo sin red y el tamaño reducido; la desventaja es la dependencia del runtime LiteRT-LM y la ausencia de ecosistema de servidores como vLLM.

## Limitaciones y advertencias

- No es un modelo conversacional: una pregunta directa devuelve solo `yes` o `no`; requiere el formato de tres campos (`<Instruct>`, `<Query>`, `<Document>`) y un documento por chat en la demo web.
- Riesgo de alucinación y falsos positivos/negativos: la referencia fp32 obtiene F1 de 85,0 y exactitud de 83,0 sobre el conjunto de evaluación, lo que implica un margen de error no despreciable en producción.
- Límite de contexto: documentos de más de ~4000 tokens no se procesan correctamente sin reexportar el modelo con una caché KV mayor.
- La demo web carga únicamente el fichero de texto, por lo que no evalúa imágenes.
- La variante de visión original no funciona en GPU móvil; hay que usar `_vision_int4_gpu` y verificar la versión del conversor (0.3.1 o superior).
- La `_int8` de texto no cabe en iOS con los límites prácticos de mmap; usarla solo en escritorio o equipos con memoria suficiente.
- Sesgos conocidos: no se documentan en la información disponible; al ser un clasificador de seguridad, hereda los sesgos del dataset de entrenamiento y de la política definida en el prompt.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del checkpoint base `mistralai/Shieldstral-1.0-3B` y de la torre Pixtral.
- Dependencia del runtime: el formato `.litertlm` limita el despliegue a LiteRT-LM; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- El repositorio ocupa 29,4 GB por incluir todas las variantes; la descarga individual de cada fichero es la vía recomendada.

## Enlaces

- HuggingFace (esta conversión): https://huggingface.co/litert-community/Shieldstral-1.0-3B
- Modelo base: https://huggingface.co/mistralai/Shieldstral-1.0-3B
- Demo web LiteRT-LM: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Shieldstral-1.0-3B
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Ficha edge-compat int8: https://github.com/john-rocky/edge-compat/blob/main/cards/shieldstral-1.0-3b-int8/CARD.md
- Ficha edge-compat vision int4: https://github.com/john-rocky/edge-compat/blob/main/cards/shieldstral-1.0-3b-vision-int4/CARD.md
- Conjunto de evaluación de moderación de OpenAI: https://huggingface.co/datasets/mmathys/openai-moderation-api-evaluation
