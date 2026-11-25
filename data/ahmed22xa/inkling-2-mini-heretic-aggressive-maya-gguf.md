# ahmed22xa/Inkling-2-Mini-Heretic-Aggressive-Maya-GGUF

## Resumen

Inkling 2 Mini Heretic-Aggressive Maya es una cuantización GGUF del modelo multimodal Inkling 2 Mini de Thinking Machines, publicada por el usuario ahmed22xa. El modelo base es un transformer con mezcla de expertos (MoE) de 26.070 millones de parámetros totales y aproximadamente 3.400 millones activos, con 128 expertos por capa de los cuales 8 se activan en cada paso, 24 capas de las cuales 12 se repiten tres veces (48 pasadas de capa), ventana de contexto de 1 millón de tokens, torre de visión y cabeza de borrador MTP/DSpark para decodificación especulativa.

La particularidad de esta ficha es que no se trata de un modelo nuevo, sino de un empaquetado concreto: aplica la ablación de rechazos Heretic v2 en su variante "Aggressive" sobre el modelo base y reorganiza los ficheros en el layout legacy `inkling2` que exige el motor de inferencia InklingEngine (Rust), en lugar del layout fusionado `inkling2_loop` que usan los repositorios upstream. Incluye además el proyector de visión en F32 que ese motor requiere, la cabeza de borrador MTP en Q8_0 y el tokenizador con su plantilla de chat.

Es relevante para desarrolladores que quieran ejecutar un modelo multimodal de contexto extremo en una sola GPU de consumo (24 GB) con rechazos prácticamente eliminados, a costa de una penalización de calidad declarada de +0,011 KLD y de un ecosistema de herramientas mucho más restringido que llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas repetidas (loop), atención completa + ventana deslizante, torre de visión y cabeza MTP/DSpark |
| Parametros totales | 26.070.390.272 (~26,4B) |
| Parametros activos | ~3,4B (128 expertos, 8 activos por token) |
| Longitud de contexto | 1.000.000 tokens (nominal); en la práctica ~262k con KV q6 en 24 GB |
| Tipos de cuantizacion | UD-Q4_K_XL (Unsloth Dynamic: atención/SSM en Q8_0/Q6_K/Q5_K, expertos enrutados en NVFP4); proyector de visión en F32 y BF16; cabeza de borrador en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (layout legacy `inkling2`), más tokenizer y plantilla de chat en `tokenizer/` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 24 capas, de las cuales 12 se ejecutan tres veces adicionales (48 pasadas de capa en total, controladas por el parámetro `num_loops`). Cada capa enruta entre 128 expertos y activa 8 por token, lo que da una relación de activación de aproximadamente el 13 % sobre los 26,4B totales. La atención combina 8 pasadas de atención completa con 40 pasadas de ventana deslizante, un detalle que reduce de forma drástica el coste de caché KV: solo las pasadas completas mantienen caché creciente. Incorpora además una torre de visión para entrada image-text-to-text y una cabeza de borrador MTP/DSpark que permite decodificación especulativa.

Sobre el entrenamiento del modelo original no hay datos en la información disponible (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí está documentado es la intervención posterior: la ablación de rechazos Heretic v2, variante "Aggressive", descrita como "CoT-Residual MPOA + Fixed-Scale Lagrangian Dual", que reporta 0/40 rechazos duros en prompts dañinos de alto esfuerzo y 0/20 en el conjunto de contraste XSTest, con una penalización de calidad de +0,011 KLD respecto al modelo sin ablacionar. La cuantización es Unsloth Dynamic Q4_K_XL y se mantiene sin cambios respecto al repositorio upstream.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 1M tokens nominales).
- Razonamiento con niveles de esfuerzo configurables mediante la plantilla de chat (el autor recomienda un valor de 0,2).
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`) a través de la torre de visión.
- Llamada a herramientas en formato de bloque propio: `<|message_model|>NAME<|content_invoke_tool_json|>{"name": NAME, "args": {...}}<|end_message|>`.
- Decodificación especulativa mediante la cabeza MTP/DSpark en llama.cpp (`--spec-type draft-dspark`).
- Comportamiento sin rechazos en la práctica según las mediciones del autor (0 rechazos duros en 20 ejecuciones).
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente conversacional de contexto largo: con 262k tokens de contexto efectivos en una RTX 3090 con KV q6, permite cargar documentación extensa o historiales completos sin trocear, algo útil para análisis de contratos, expedientes o bases de código medianas.
- Procesamiento de documentos con imágenes: al aceptar entrada image-text-to-text, sirve para extraer información de capturas, diagramas o formularios escaneados combinándolos con instrucciones textuales en la misma petición.
- Agente con herramientas en local: el formato de llamada a herramientas documentado permite integrarlo en un orquestador propio que parsee el bloque `<|message_model|>` de forma estricta y ejecute funciones externas (consultas a bases de datos, APIs internas).
- Generación de código asistida en estación de trabajo: con ~126 tok/s de decodificación en una RTX 3090, es viable como autocompletado y refactorización interactiva en un IDE, siempre que el frontend soporte el layout legacy o se use llama.cpp con el fichero fusionado equivalente.
- Investigación sobre alineación y robustez: la variante ablacionada permite estudiar el comportamiento del modelo ante prompts que el original rechazaría, con una penalización de calidad medida y acotada (+0,011 KLD).
- Despliegue de un solo inquilino con caché de prompt persistente: el InklingEngine reutiliza el KV y la caché de prompt entre turnos de la misma conversación, lo que abarata el coste de prefill en sesiones largas de un único cliente.
- Prototipado de pipelines de decodificación especulativa: la cabeza DSpark en Q8_0 permite medir la ganancia de throughput de la decodificación especulativa sobre el modelo completo sin entrenar un draft propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento medidos que aporta el autor son de inferencia, no de calidad: en una RTX 3090 (24 GB) con InklingEngine, `--ctx 262144 --kv q8`, reporta ~126 tok/s de decodificación y ~3.200 tok/s de prefill, frente a ~70-80 tok/s en llama.cpp sobre el mismo hardware. El coste de caché KV por token según el formato es de 9 KiB (q4), 13 KiB (q6), 17 KiB (q8) y 32 KiB (f16), con una pérdida de calidad medida en KLD frente a f16 de 0,0090, 0,0047, 0,0041 y 0 respectivamente, y un top-1 de 96,5 %, 97,4 %, 97,6 % y 100 %.

## Requisitos de hardware

- VRAM estimada: el fichero del modelo ocupa 16,42 GB en UD-Q4_K_XL; sumando el proyector F32 (1,19 GB) y la caché KV, encaja en 24 GB con contexto de hasta ~262k tokens en KV q6. Con KV q4 el autor reporta ~393k tokens de contexto en el mismo hardware; con f16, ~100k.
- GPU recomendadas: RTX 3090 (24 GB) es el hardware de referencia medido por el autor. Para contexto completo de 1M tokens o varios slots simultáneos harían falta GPUs de 48-80 GB (A6000, A100, H100), aunque no hay mediciones publicadas en esas configuraciones.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090, 4090) usando la cuantización Q4_K_XL y KV q6 o q4. En 16 GB no cabe el modelo completo con el proyector.
- Opciones de despliegue: InklingEngine (Rust, versión 0.3.0) es el motor para el que está empaquetado este repositorio; llama.cpp (b12600+) funciona con el layout fusionado `inkling2_loop`, no con los ficheros legacy de este repo. El autor menciona compatibilidad con LM Studio en las etiquetas. No hay soporte documentado para vLLM ni TGI.
- Latencia y throughput: ~126 tok/s de decodificación y ~3.200 tok/s de prefill en RTX 3090 con InklingEngine; ~70-80 tok/s de decodificación en llama.cpp en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Inkling 2 Mini Heretic-Aggressive Maya (esta ficha) | 26,4B totales / 3,4B activos | 1M nominal, ~262k en 24 GB | Apache 2.0 | GGUF legacy `inkling2`, InklingEngine | Ablación Heretic v2 Aggressive, +0,011 KLD |
| Inkling 2 Mini (thinkingmachines) | 26,4B totales / 3,4B activos | 1M | Apache 2.0 | GGUF fusionado `inkling2_loop`, llama.cpp | Modelo base sin ablacionar; rechaza prompts dañinos |
| Inkling 2 Mini Abliterated Aggressive (onemunanoyo) | 26,4B totales / 3,4B activos | 1M | Apache 2.0 | GGUF fusionado, llama.cpp | Misma ablación, cuantización de origen de este repo |

No hay datos de benchmarks de calidad publicados para ninguno de los tres, por lo que la comparación se limita a parámetros, contexto, licencia y compatibilidad de motores.

## Limitaciones y advertencias

- La ablación de rechazos elimina las negativas de seguridad del modelo original: puede generar contenido dañino, ilegal o inseguro sin filtro. No es adecuado para aplicaciones expuestas a usuarios finales sin moderación externa.
- La penalización de calidad de la ablación es medible (+0,011 KLD) y puede degradar la coherencia en tareas de razonamiento largo, aunque el autor no documenta en qué dominios se manifiesta.
- Riesgo de alucinación: no cuantificado en la información disponible; es un modelo de 26B con 3,4B activos, por lo que cabe esperar un comportamiento de alucinación típico de esa clase de tamaño.
- El layout legacy `inkling2` solo lo carga InklingEngine; intentar cargarlo en llama.cpp falla. Hay que comprobar el campo `general.architecture` de la cabecera GGUF antes de elegir motor.
- El proyector de visión debe ser F32 para InklingEngine; con BF16 o F16 el motor aborta con el error `expected an F32 mmproj tensor`.
- El InklingEngine atiende una sola petición a la vez y mantiene una única caché de prompt: un segundo cliente concurrente expulsa el estado del primero y obliga a repetir el prefill.
- Los valores de muestreo por defecto de la mayoría de frontends (top_k 40, min_p 0,05) degradan el estilo; el autor exige top_k 0, min_p 0,0, temperature 1,0, top_p 0,95-1,0 y repeat_penalty 1,0.
- El parser de llamadas a herramientas debe aceptar el bloque `<|message_model|>` como obligatorio; si lo trata como opcional, pierde el nombre de la herramienta y descarta la llamada en silencio.
- Idiomas soportados no documentados: no hay garantía de calidad fuera del inglés.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por la variante ablacionada recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026: no hay validación comunitaria independiente de las cifras del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahmed22xa/Inkling-2-Mini-Heretic-Aggressive-Maya-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio upstream de la ablación: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Aggressive-GGUF
- Paper, blog, repositorio del motor o demo: no disponible en la información proporcionada.
