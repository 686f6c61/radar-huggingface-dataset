# litert-community/Shieldstral-1.0-3B

## Resumen

Shieldstral-1.0-3B es un clasificador de seguridad y moderación de contenido desarrollado por Mistral AI, distribuido aquí en formato `.litertlm` por la comunidad `litert-community` para su ejecución con el runtime LiteRT-LM de Google. No es un modelo conversacional: recibe una política de moderación en lenguaje natural junto con un documento y emite un veredicto binario (`yes`/`no`) o una puntuación continua mediante `softmax` sobre los logits de ambos tokens, en un único paso de decodificación.

El modelo parte de una arquitectura transformer de 3.000 millones de parámetros con una torre de visión Pixtral en la variante multimodal, lo que permite moderar tanto texto como imágenes. Su rasgo diferencial es que la política de moderación se inyecta en tiempo de inferencia mediante los campos `<Instruct>`, `<Query>` y `<Document>`, de modo que un mismo checkpoint cubre políticas nuevas sin reentrenamiento.

La relevancia de esta conversión concreta reside en la ejecución completamente local: los ficheros `int4` ocupan 2,20 GiB (sección principal de 1,82 GiB) y caben en un iPhone o en una Raspberry Pi, con latencias medidas de 8,6 tok/s en decodificación sobre la GPU de un Galaxy S26. Cubre doce idiomas, incluyendo castellano, y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con torre de visión Pixtral (variantes multimodales) |
| Parametros totales | 3B (aproximado, según denominación del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de KV cache (exportado); documentos de más de ~4000 tokens requieren re-exportación |
| Tipos de cuantizacion | int4 blockwise-32 (OCTAV) con embedding int8; int8 dinámico en exportación; int4 para la torre Pixtral |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors en `mistralai/Shieldstral-1.0-3B` |

Variantes publicadas:

| Fichero | Modalidad | Receta | Tamano total | Seccion principal | Uso |
|---|---|---|---|---|---|
| `Shieldstral-1.0-3B_int4.litertlm` | texto | int4 blockwise-32 (OCTAV) + embedding int8, embedder externalizado | 2,20 GiB | 1,82 GiB | Moderación de texto, móviles y superiores |
| `Shieldstral-1.0-3B_int8.litertlm` | texto | int8 dinámico en exportación, embedder externalizado | 3,71 GiB | 3,33 GiB | Solo escritorio / memoria alta |
| `Shieldstral-1.0-3B-vision_int4.litertlm` | texto + imagen | decoder int4-b32 + torre Pixtral int8, 560×560 estático | 2,78 GB | 1,82 GiB | Moderación de imágenes, móviles y superiores |
| `Shieldstral-1.0-3B-vision_int4_gpu.litertlm` | texto + imagen | mismos pesos y torre; decoder re-exportado para bajar softmax de atención a builtin | 2,78 GB | 1,82 GiB | Fichero de visión para GPU |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 3B parámetros de la familia Mistral, adaptado como clasificador de seguridad. La variante multimodal incorpora una torre de visión Pixtral que procesa imágenes a resolución estática de 560×560. La inferencia de clasificación se realiza en un único forward pass que emite un solo token (`yes` o `no`), con la política de moderación expresada en lenguaje natural dentro del prompt; esto elimina la necesidad de reentrenar para nuevas categorías o niveles de estrictez.

La conversión a LiteRT-LM externaliza el embedder y aplica cuantización int4 blockwise de tamaño 32 (receta OCTAV) al decoder, manteniendo una sección de embedding en int8 idéntica en todas las variantes. La exportación incluye un conjunto completo de grafos de prefill (de 2048 a 1) y una KV cache de 4096 tokens. La variante `_int4_gpu` re-exporta el decoder con litert-converter 0.3.1 para rebajar el compuesto `odml.softmax` de la atención a un builtin `SOFTMAX`, corrigiendo un fallo de delegación en GPU móvil que en la versión original solo delegaba 52 de 1187 operaciones y provocaba `engine_create_failed`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Clasificación de seguridad binaria: responde `yes` o `no` a una pregunta de moderación sobre un documento, en un único paso de decodificación.
- Puntuación continua: `softmax` sobre los logits de `yes`/`no`, con umbral recomendado de 0,5, para ordenar por riesgo en lugar de solo filtrar.
- Política adaptativa en inferencia: las categorías, el nivel de estrictez y el encuadre de la tarea se especifican en el campo `<Instruct>` en lenguaje natural.
- Moderación multimodal: las variantes `vision_int4` aceptan imágenes además de texto, con torre Pixtral a 560×560.
- Multilingüe: doce idiomas declarados (en, fr, es, de, it, pt, nl, zh, ja, ko, ar, ru).
- Ejecución totalmente local sin llamada de red, sobre GPU o CPU del dispositivo.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: no es un modelo de chat ni de agentes.

## Casos de uso

- Moderación de comentarios en aplicaciones móviles: el fichero `int4` de 2,20 GiB se ejecuta en el propio teléfono con 8,6 tok/s de decodificación en GPU, filtrando contenido antes de enviarlo al servidor y reduciendo coste de backend y exposición de datos.
- Filtrado de imágenes subidas por usuarios: la variante `vision_int4_gpu` evalúa la imagen contra la política definida en `<Instruct>`, adecuada para apps de compartición de fotos o marketplaces con requisitos de contenido.
- Puerta de seguridad previa a un LLM generativo: clasificar la entrada del usuario antes de pasarla a un modelo mayor evita generar respuestas a peticiones dañinas, con una latencia de prefill de 289 tok/s en GPU móvil.
- Moderación con políticas por comunidad o jurisdicción: al inyectar la política en el prompt, un mismo checkpoint sirve para distintos foros, países o edades sin reentrenar ni mantener varios modelos.
- Despliegue en dispositivos sin conectividad: Raspberry Pi, portátiles o entornos air-gapped pueden ejecutar el clasificador íntegramente en local, cumpliendo requisitos de soberanía de datos.
- Triaje por puntuación en pipelines de revisión humana: usar la probabilidad `softmax` en lugar del veredicto binario permite priorizar la cola de revisión manual por nivel de riesgo.
- Moderación en el borde para IoT y cámaras: la variante de visión con 1,82 GiB de sección principal permite clasificar contenido capturado en el dispositivo sin transmitir imágenes.

## Benchmarks y rendimiento

Evaluación de calidad sobre 200 ítems estratificados (100 no seguros / 100 seguros) del conjunto público OpenAI moderation evaluation, con la receta de cribado amplio de la model card original y umbral 0,5. Referencia: checkpoint fuente en fp32 sobre MPS.

| Ejecución | F1 | Exactitud | Concordancia con referencia | r (margen de logits) | Cambios de etiqueta |
|---|---|---|---|---|---|
| Fuente fp32 (referencia) | 85,0 | 83,0 | — | — | — |
| Conversión LiteRT-LM | no disponible (dato truncado en la información proporcionada) | no disponible | no disponible | no disponible | no disponible |

Rendimiento en dispositivo (edge-compat, LiteRT-LM 0.16.0, Galaxy S26):

| Variante | Backend | Decodificación | Prefill | TTFT | Notas |
|---|---|---|---|---|---|
| `shieldstral-1.0-3b-int8` | GPU | 8,6 tok/s | 289 tok/s | 910 ms | 1187/1187 ops delegadas (2026-08-24) |
| `shieldstral-1.0-3b-int8` | CPU | 8,3 tok/s | 129 tok/s | 1,91 s | (2026-09-05) |
| `shieldstral-1.0-3b-vision-int4` | GPU | no ejecuta | — | — | `engine_create_failed` (2026-08-24) |
| `shieldstral-1.0-3b-vision-int4` | CPU | 1,9 tok/s | 33 tok/s | 7,48 s | (2026-09-05) |

## Requisitos de hardware

- VRAM/RAM: 1,82 GiB de sección principal para las variantes int4 de texto y visión; 2,20 GiB y 2,78 GB de tamaño total en disco respectivamente. La variante int8 requiere 3,33 GiB de sección principal.
- Móvil: el int4 es la única variante de texto que cabe en un iPhone, dado que el presupuesto práctico de mmap en iOS es de ~2,1 GiB con entitlements por defecto y por debajo de 3 GiB incluso con entitlements relajados; el int8 de 3,33 GiB queda fuera.
- GPU de escritorio: A100, H100, RTX 4090 y similares no son necesarias; el modelo está pensado para GPU integrada o móvil. Para servidor, usar la variante int8 o el checkpoint base en safetensors con vLLM o TGI.
- Consumer GPU: cabe holgadamente en cualquier GPU con 4 GB o más de VRAM en int4, y en CPU sin GPU.
- Despliegue: LiteRT-LM (runtime objetivo), demo web con WebGPU en el navegador, y el checkpoint base `mistralai/Shieldstral-1.0-3B` para stacks estándar (vLLM, TGI, transformers).
- Latencia: TTFT de 910 ms en GPU móvil y 1,91 s en CPU para la variante int8; la variante de visión en CPU baja a 1,9 tok/s de decodificación y 7,48 s de TTFT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shieldstral-1.0-3B (esta ficha, LiteRT-LM) | 3B | 4096 tokens | texto o texto+imagen | Apache 2.0 | Hugging Face, ejecución local en dispositivo |
| `mistralai/Shieldstral-1.0-3B` (base) | 3B | no disponible | texto+imagen | Apache 2.0 | Hugging Face, pesos safetensors |
| Clasificadores de moderación tipo OpenAI moderation API | no disponible | no disponible | texto+imagen | propietaria | API en la nube |
| Llama Guard (familia) | no disponible en la información proporcionada | no disponible | texto | licencia comunitaria Llama | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: una pregunta directa devuelve únicamente `yes` o `no`; requiere el formato exacto con `<Instruct>`, `<Query>` y `<Document>`.
- Límite de contexto práctico: documentos de más de ~4000 tokens exigen re-exportar con una KV cache mayor; la cache actual es de 4096 tokens.
- La variante de visión original no arranca en GPU móvil (`engine_create_failed`); en GPU debe usarse `_int4_gpu`.
- La demo web carga solo el fichero de texto, por lo que no evalúa imágenes, y cada documento debe ir en un chat nuevo.
- La puntuación continua requiere la API de scoring y dos prefills (uno por candidato), duplicando el coste de prefill frente al veredicto binario.
- Riesgo de falsos negativos y positivos inherente a un clasificador con F1 de 85,0 en el conjunto de evaluación de referencia; no debe usarse como único mecanismo de seguridad en producción.
- No se dispone de información sobre sesgos específicos, composición del dataset de entrenamiento ni evaluaciones por idioma más allá del conjunto citado.
- Licencia Apache 2.0 permite uso comercial, pero la política de moderación inyectada en inferencia es responsabilidad del integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Shieldstral-1.0-3B
- Modelo base: https://huggingface.co/mistralai/Shieldstral-1.0-3B
- Demo web LiteRT-LM: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Shieldstral-1.0-3B
- Ficha edge-compat int8: https://github.com/john-rocky/edge-compat/blob/main/cards/shieldstral-1.0-3b-int8/CARD.md
- Ficha edge-compat vision int4: https://github.com/john-rocky/edge-compat/blob/main/cards/shieldstral-1.0-3b-vision-int4/CARD.md
- Conjunto de evaluación de moderación de OpenAI: https://huggingface.co/datasets/mmathys/openai-moderation-api-evaluation
