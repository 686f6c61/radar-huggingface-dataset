# ddalcu/humanizer-12b-8bit

## Resumen

`ddalcu/humanizer-12b-8bit` es una conversión a 8 bits en formato MLX de `jialinyyzz/humanizer`, un ajuste fino de 12B parámetros sobre `google/gemma-4-12B` especializado en una única tarea: reescribir borradores generados por IA (en inglés y chino) para que se lean como escritos por una persona. No es un modelo conversacional generalista; es un modelo de completado de texto entrenado con una plantilla fija que recibe el borrador y devuelve la reescritura terminada en EOS, con la instrucción explícita de conservar cifras, unidades, fechas, nombres y citas sin añadir información nueva.

La relevancia de este paquete concreto es práctica: reduce el peso original en bf16 a 12,7 GB con cuantización afín de 8 bits (grupo 64, ~8,5 bits por peso) usando `mlx_lm.convert` sin modificaciones, de modo que se puede cargar directamente en `mlx_lm.server`, en la API Python de `mlx_lm` o en mlx-serve sobre Apple Silicon. Frente a otras conversiones comunitarias, el autor documenta los tres ficheros que difieren del convertidor estándar (plantilla de chat con BOS, `generation_config.json` con `top_k=0` y `prompt_format.json`), lo que facilita reproducir el comportamiento del modelo original.

Es un modelo solo de texto: el convertidor de mlx-lm descarta el embedder visual sin encoder del modelo original, por lo que no admite imagen ni audio. El repo es muy reciente (creado el 17 de octubre de 2026) y acumula 16 descargas y 0 likes, sin validación independiente publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (`model_type: gemma4_unified`), solo texto |
| Parametros totales | 11.907.350.272 (~11,9B) |
| Parametros activos | No disponible (la informacion proporcionada no indica que sea un modelo MoE) |
| Longitud de contexto | 8192 tokens recomendados por el autor original para instruccion + borrador + reescritura; maximo arquitectonico no disponible |
| Tipos de cuantizacion | 8 bits afines, group size 64, ~8,5 bits por peso (MLX). Existe version comunitaria de 6 bits y GGUF del modelo original |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 (heredada del modelo original; `LICENSE` y `NOTICE` sin cambios) |
| Formato de pesos | safetensors en layout MLX (`language_model.model.*`, shards en el nivel superior); no es GGUF |
| Tamano del repositorio | 12,7 GB |
| Modelo base | `jialinyyzz/humanizer` (relacion: quantized), fine-tune de `google/gemma-4-12B` |
| Libreria / pipeline | mlx (mlx-lm 0.32.2) / text-generation |
| Tipo de modelo | Completado de texto con plantilla de reescritura fija, no conversacional multi-turno |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 4 en su variante de 12B, un transformer decoder-only que este paquete conserva íntegro salvo por la cuantización: los pesos se convierten con `mlx_lm.convert --q-bits 8 --q-group-size 64` (cuantización afín, group size 64, 8,5 bits por peso), partiendo del `model.safetensors` original en bf16 con sha256 `f6e8c0d176f9340cc2af82efac085e4ba292781bb0783a08eef07540d6b95548`. El conversor elimina el embedder visual sin encoder del modelo original, de ahí que el paquete sea estrictamente de texto.

Sobre el entrenamiento no hay datos en la información disponible: ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO. Lo que sí está documentado es el contrato de inferencia, que condiciona todo el uso: el modelo fue entrenado sobre un prompt de texto plano con la forma `<bos> + INSTR + "\n\n" + borrador + "\n\n### Rewritten:\n\n"` y termina la reescritura con EOS. `INSTR` vive en `prompt_format.json`; el autor proporciona una huella de verificación (`sha256(INSTR + "\n\n" + "X" + sep)`, primeros 16 hex: `cc51d66b4c593fbe`) que coincide con la del modelo original. La plantilla de chat reproduce ese prompt tomando únicamente el último mensaje de usuario como borrador e ignorando system prompt y turnos previos, de modo que cada mensaje se reescribe de forma aislada.

La única modificación de fondo respecto al original es la plantilla de chat: los safetensors originales no incluyen ninguna, y la de este paquete parte de la de los GGUF de los autores con un cambio, emitir `bos_token` al inicio, porque transformers, mlx-lm y vLLM no añaden tokens especiales al tokenizar el chat. Además, `generation_config.json` fija `top_k=0` (desactivado) siguiendo la recomendación de los autores: temperatura 1.0 y top-p 0.95 con el resto de samplers apagados.

## Capacidades

- Reescritura de texto generado por IA para que suene humano, en inglés y chino, sobre formatos como correos, ensayos, informes y publicaciones de foro.
- Transferencia de estilo: introduce contracciones, arranques más informales y estructuras de frase variadas, según la descripción del caso de uso público del modelo.
- Preservación de datos verificables: está entrenado para mantener cada número, unidad, fecha, nombre y cita, y para no añadir contenido.
- Modelo de completado de un solo disparo: recibe un borrador y emite la reescritura terminada en EOS, sin diálogo multi-turno ni memoria entre mensajes.
- Integración vía API de chat estándar (`/v1/chat/completions`) mediante `mlx_lm.server`, con temperatura y top-p configurables por petición.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no hay ninguna indicación de ello en la información disponible.
- No soporta visión ni audio: el embedder visual fue descartado en la conversión.

## Casos de uso

- **Reescritura de correos corporativos antes de enviarlos**: se pasa el borrador generado por un asistente y el modelo devuelve una versión con tono más natural, conservando fechas y cifras. Adecuado porque el entrenamiento prioriza no alterar números ni nombres, el dato más crítico en comunicación comercial.
- **Publicación de artículos de blog y notas de prensa**: integrado como paso final de un pipeline de generación, con el documento troceado por saltos de párrafo para respetar la ventana recomendada de 8192 tokens.
- **Humanización de respuestas de soporte técnico**: en un flujo donde un LLM genera la respuesta y este modelo la reformula, manteniendo referencias a versiones, importes y plazos.
- **Contenido para foros y comunidades (inglés y chino)**: reescritura de respuestas largas para que no delaten un origen automático, en un contexto bilingüe donde el modelo cubre ambos idiomas.
- **Preprocesado editorial en local con privacidad**: al ejecutarse en Apple Silicon con MLX, permite procesar borradores internos sin enviarlos a una API externa, algo relevante para documentación confidencial.
- **Normalización de estilo en documentación interna**: reescritura de notas y actas generadas automáticamente para que el equipo las lea con un registro menos rígido, con revisión humana obligatoria de cifras y citas.
- **Herramienta de escritura en aplicaciones de escritorio para macOS**: al cargarse con la API Python de `mlx_lm`, se puede embeber en una app local que ofrezca un botón de "reescribir" sobre el texto seleccionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este paquete. El autor de la conversión lo indica explícitamente: no se ha medido la concordancia con bf16 (top-1 o KL) ni ninguna puntuación de fact-judge para esta conversión, y las cifras de la model card original corresponden a los ficheros de los autores, no a este paquete de 8 bits. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- **Peso de los pesos**: 12,7 GB en disco y en memoria al cargar (8 bits, grupo 64, ~8,5 bits por peso sobre 11,9B parámetros).
- **Plataforma obligatoria**: MLX solo se ejecuta en Apple Silicon; este paquete no funciona en GPU NVIDIA ni en CPU x86 sin reconvertir.
- **Memoria unificada recomendada**: 16 GB es el mínimo razonable para los 12,7 GB de pesos más caché KV con contextos moderados; 24-32 GB dan margen para la ventana recomendada de 8192 tokens (estimación a partir del tamaño de pesos, no medida publicada).
- **GPU dedicadas (A100, H100, RTX 4090)**: no aplicables a este formato MLX. Para ese hardware habría que usar el modelo original en bf16 o sus versiones GGUF con llama.cpp.
- **Opciones de despliegue verificadas**: `mlx_lm.server` (endpoint compatible con `/v1/chat/completions`), la API Python de `mlx_lm` (`load` + `generate` + `make_sampler`) y mlx-serve 26.10.2. Probado en mlx-lm 0.32.2.
- **Alternativas en otros runtimes**: los GGUF de los autores para llama.cpp (no es este repo); existe además una conversión comunitaria de 6 bits en MLX.
- **Sampling obligatorio**: temperatura 1.0 y top-p 0.95; mlx-lm no lee estos valores de `generation_config.json`, hay que pasarlos en cada petición. Parada solo por EOS, sin cadenas de stop (en particular, nunca `###`).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ddalcu/humanizer-12b-8bit` | ~11,9B | 8192 recomendados | MLX safetensors, 8 bits (~8,5 bpw), 12,7 GB | Apache 2.0 | 16 descargas, 0 likes; solo Apple Silicon |
| `jialinyyzz/humanizer` (original) | ~11,9B | 8192 recomendados | safetensors bf16 | Apache 2.0 | Modelo de referencia; requiere conversion para MLX o GGUF |
| `guygrigsby/humanizer-12b-mlx-6bit` | ~11,9B | 8192 recomendados | MLX, 6 bits | Apache 2.0 (heredada) | Conversion comunitaria alternativa; menor peso, mayor perdida de precision esperada |
| Humanizer 12B en GGUF (autores) | ~11,9B | 8192 recomendados | GGUF para llama.cpp | Apache 2.0 | Multiplataforma (CPU, CUDA, Metal via llama.cpp) |

Las tres variantes comparten el mismo ajuste fino y, por tanto, las mismas capacidades y limitaciones de tarea; la diferencia está en el runtime, el tamaño y la fidelidad respecto a bf16, que en el caso de este paquete de 8 bits no ha sido medida.

## Limitaciones y advertencias

- **Fidelidad de citas**: en pruebas informales del autor con el sampling recomendado, los números y fechas se conservaron casi siempre, pero una cita textual fue parafraseada o eliminada en 2 de 12 muestras de un mismo párrafo. Hay que revisar toda cita antes de publicar.
- **Salida extra en borradores de una sola frase**: un borrador de una frase puede volver acompañado de una línea corta adicional.
- **Idioma de salida inestable**: un borrador en inglés puede devolverse en chino; la solución documentada es volver a muestrear.
- **Sin conversación real**: la plantilla ignora el system prompt y los turnos anteriores y usa solo el último mensaje de usuario. No sirve para instrucciones de estilo acumulativas ni para diálogo.
- **Riesgo de alucinación**: aunque el entrenamiento busca no añadir información, es un modelo generativo sin verificación factual; cualquier dato introducido en la reescritura debe contrastarse.
- **Alcance lingüístico limitado**: solo inglés y chino; el castellano no está declarado como idioma soportado.
- **Sin visión ni audio**: el embedder visual se descartó en la conversión.
- **Sin métricas de calidad de la cuantización**: no se ha medido la divergencia respecto a bf16, así que no hay garantía cuantificada de que el comportamiento sea idéntico al original.
- **Restricciones de sampler**: usar temperatura 1.0 y top-p 0.95 y no añadir cadenas de stop; desviarse puede degradar la salida de forma no documentada.
- **Licencia**: se declara Apache 2.0, heredada del modelo original, pero el modelo base es `google/gemma-4-12B`; conviene verificar las condiciones de uso del modelo base antes de un despliegue comercial.
- **Madurez del repo**: creado el 17 de octubre de 2026, 16 descargas y 0 likes, sin validación independiente ni benchmarks publicados. No es una conversión afiliada a los autores originales ni a Google.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddalcu/humanizer-12b-8bit
- Modelo original: https://huggingface.co/jialinyyzz/humanizer
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Conversión comunitaria MLX de 6 bits: https://huggingface.co/guygrigsby/humanizer-12b-mlx-6bit
- Repositorio del proyecto: https://github.com/sgaofen/humanizer-local-model
- Articulo divulgativo: https://www.aitoolsdaily.net/article/humanizer-12b-model-for-local-ai-text-rewriting
- Guia de despliegue con llama.cpp: https://www.mindstudio.ai/blog/run-humanizer-12b-locally-llama-cpp
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/conversantech/humanizer-ai
