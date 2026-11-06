# Jmacl/nano-admin-qwen35-2b-v23

## Resumen

Nano Admin Qwen3.5-2B v23 es un ajuste fino mediante QLoRA del modelo base Qwen/Qwen3.5-2B, desarrollado por el autor Jmacl (Nanoforge) y publicado en formato GGUF para llama.cpp. El modelo está especializado en la emisión de llamadas a herramientas (tool calls) en un asistente de operaciones para teléfono, y su innovación principal consiste en soportar dos dialectos de function calling: el nativo de OpenAI (`tools[]` más `<tool_call>`) y un dialecto de texto plano que emite un objeto JSON por línea cuando el cliente no puede enviar un esquema de herramientas. Esto resuelve un problema concreto de aplicaciones móviles como PocketPal, que no permiten inyectar un array `tools[]` personalizado y, por tanto, recibían respuestas en prosa en lugar de llamadas estructuradas.

El modelo tiene 1.942.653.248 parámetros totales (aproximadamente 2B) y se distribuye como un único archivo GGUF cuantizado en Q4_K_M de 1.312.165.376 bytes (1,3 GB), lo que lo hace apto para ejecución en dispositivos móviles. La ventana de contexto recomendada en la documentación es de 8192 tokens. La licencia es Apache-2.0, heredada del modelo base, y no se han publicado datos sobre idiomas soportados más allá del uso en inglés que se deduce de los ejemplos de la model card.

La relevancia actual del modelo radica en su enfoque práctico: demuestra que un ajuste fino pequeño y específico puede añadir un dialecto de salida alternativo sin degradar de forma estadísticamente significativa el rendimiento en el camino nativo. No obstante, se trata de un modelo de nicho, con un conjunto fijo de nueve herramientas y sin métricas de rendimiento en dispositivo móvil todavía publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens (valor recomendado en la model card) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino QLoRA sobre Qwen/Qwen3.5-2B, un transformer de aproximadamente 2B parámetros. No se especifica en la información disponible la arquitectura interna del modelo base (número de capas, dimensiones, tipo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa). El entrenamiento se realizó con QLoRA, y el adaptador resultante se fusionó y exportó a GGUF en cuantización Q4_K_M.

La innovación técnica principal es el entrenamiento con dos formatos de salida en paralelo: filas nativas con `tools[]` y `<tool_call>`, y filas en texto plano con una guía de sistema seguida de un objeto JSON por línea. La plantilla de chat del GGUF añade automáticamente una breve guía de herramientas (que nombra las nueve herramientas disponibles y especifica la regla de salida JSON) únicamente cuando no se proporciona un array `tools`. Cuando `tools[]` está presente, la plantilla permanece sin cambios. Los datos de entrenamiento provienen de prompts semilla, trazas y el adaptador del propio autor (Nanoforge), sin datos de clientes. No se indica el número de tokens de entrenamiento ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de llamadas a herramientas en formato nativo OpenAI (`tool_calls` con `<tool_call>`) cuando el cliente envía un array `tools[]`.
- Generación de llamadas a herramientas en texto plano (un objeto JSON por línea, por ejemplo `{"tool":"set_timer","arguments":{"minutes":15}}`) cuando no se envía `tools[]`.
- Conocimiento de nueve herramientas fijas: `create_event(title, start)`, `set_timer(minutes)`, `draft_email(to, body)`, `find_file(name_contains, file_type)`, `create_reminder(title, due)`, `find_place(query)`, `get_weather(location, when)` y `request_confirmation(action, details)`.
- Enrutamiento de acciones destructivas a través de `request_confirmation`.
- Enrutamiento de redacción de correos a través de `draft_email`.
- Respuesta sin herramienta para preguntas generales.
- Modo de razonamiento (thinking) activado en las evaluaciones descritas.
- Capacidades multilingües: no disponible.
- Soporte de agentes multi-paso: no disponible (la model card no documenta razonamiento multi-paso más allá de la selección de una herramienta por turno).

## Casos de uso

- Asistente de operaciones en teléfono con clientes sin soporte de esquemas de herramientas: el modelo emite JSON en texto plano que la aplicación puede parsear para ejecutar acciones como fijar temporizadores o crear recordatorios, sin necesidad de inyectar un array `tools[]`.
- Integración en PocketPal y aplicaciones similares: importación directa del GGUF con contexto de 8192, temperatura 0 y modo thinking activado; el modelo emite el JSON correcto y el cliente (atajo o parser) se encarga de ejecutarlo.
- Automatización de tareas de agenda: creación de eventos y recordatorios mediante `create_event` y `create_reminder`, adecuado por el entrenamiento específico en estas herramientas y por la ventana de 8K tokens para mantener contexto conversacional.
- Gestión de correo asistida: borrador de correos mediante `draft_email` a partir de instrucciones en lenguaje natural, con enrutamiento controlado que evita envíos directos.
- Consultas de información local y meteorológica: uso de `find_place` y `get_weather` para responder preguntas del usuario con datos estructurados, aprovechando el formato JSON de salida para su parseo automático.
- Confirmación de acciones destructivas: el modelo deriva operaciones sensibles a `request_confirmation`, lo que permite construir flujos con confirmación explícita del usuario antes de ejecutar acciones irreversibles.
- Búsqueda de archivos en el dispositivo: `find_file(name_contains, file_type)` permite construir asistentes de búsqueda local con salida estructurada y verificable.

## Benchmarks y rendimiento

Los resultados publicados en la model card se obtuvieron con `llama-server` b12073 CUDA, Q4_K_M, `-ngl 99`, contexto de 8K, temperatura 0, thinking activado y servidor nuevo por suite, en una RTX 5090.

Camino nativo (con `tools[]`):

| Suite | Admin v15 | Admin v23 | Delta |
|---|---:|---:|---:|
| Admin v1 (120 casos) | 114/120 · 95,0% | 112/120 · 93,3% | −2 casos |
| Admin v2.1 held-out (120 casos) | 108/120 · 90,0% | 107/120 · 89,2% | −1 caso |

Prueba de McNemar exacta emparejada: v1 `p=0,75` (6 casos solo v15 frente a 4 solo v23); v2.1 `p=1,0` (7 frente a 6). La diferencia en el camino nativo no es estadísticamente distinguible.

Camino en texto plano (sin campo `tools`):

| Modelo | Smoke de 10 prompts (b12073) | Held-out de 30 casos (b12073) |
|---|---:|---:|
| Admin v15 | 1/10 | — |
| Admin v23 | 9/10 | 28/30 · 93,3% |

El smoke de 10 casos alcanza 10/10 en b11714 Vulkan local; el fallo en b12073 es una discrepancia de coincidencia estricta de título, no una llamada incorrecta. El autor recomienda citar 28/30 y no el 10/10 saturado.

Frente al modelo base en las suites de 120 casos (base 100/120 en v1 y 90/120 en v2.1 con b11081), v23 mejora +12 y +17 puntos, por encima del umbral de +8 puntos del gate Admin. Esta comparación no es head-to-head con el mismo build.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 1,3 GB, por lo que la inferencia requiere aproximadamente 1,5-2 GB de memoria considerando overhead de contexto y runtime (estimación a partir del tamaño del archivo; no publicada por el autor).
- GPU recomendadas: RTX 5090 para las evaluaciones publicadas; no se documentan otras GPU.
- Cabe en GPU de consumo: sí, por el tamaño del archivo Q4_K_M (1,3 GB) es compatible con GPU de consumo con al menos 2-3 GB de VRAM libre; no se especifican modelos concretos en la información disponible.
- Despliegue: llama.cpp (`llama-server`), con builds b12073 CUDA y b11714 Vulkan documentados; compatible con clientes que hablan la API de endpoints de OpenAI según los tags (`endpoints_compatible`).
- Latencia y throughput: no disponibles. La model card indica explícitamente que las mediciones en teléfono (carga en frío, primer token, tok/s, memoria residente y comportamiento térmico en iPhone) están pendientes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento documentado | Licencia | Formato |
|---|---|---|---|---|---|
| Nano Admin Qwen3.5-2B v23 | 1,94B | 8192 | 28/30 en texto plano; 112/120 y 107/120 en nativo | Apache-2.0 | GGUF Q4_K_M |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | 100/120 y 90/120 en las suites Admin | Apache-2.0 | safetensors (y otras) |
| Nano Admin Qwen3.5-2B v15 (versión previa del autor) | ~2B | 8192 (en evaluaciones) | 114/120 y 108/120 en nativo; 1/10 en texto plano | Apache-2.0 | GGUF |

La comparación con el modelo base no es head-to-head con el mismo build, según advierte el propio autor. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo conoce nueve herramientas fijas; no soporta esquemas de herramientas arbitrarios o personalizados.
- El cliente debe parsear el JSON de salida; PocketPal no ejecuta las herramientas de forma nativa.
- La suite en texto plano de 30 casos es pequeña y el smoke de 10 casos está saturado, lo que limita la solidez estadística de los resultados en ese camino.
- En el camino nativo se observa paridad, no una mejora, respecto a v15.
- No hay mediciones en teléfono: carga en frío, primer token, tok/s, memoria residente y comportamiento térmico en iPhone están pendientes.
- Admin v2.1 es un holdout corregido por el evaluador (tres comprobaciones ampliadas tras la ejecución en bruto de v2), no una segunda muestra independiente.
- No se documentan sesgos conocidos ni riesgo de alucinación específico; al ser un modelo de 2B, el riesgo de alucinación en respuestas generales es inherente al tamaño, aunque no se cuantifica en la información disponible.
- Idiomas soportados no disponibles; los ejemplos y evaluaciones están en inglés.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo base conserva sus propios términos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jmacl/nano-admin-qwen35-2b-v23
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
