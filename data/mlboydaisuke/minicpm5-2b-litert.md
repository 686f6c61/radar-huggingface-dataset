# mlboydaisuke/MiniCPM5-2B-LiteRT

## Resumen

MiniCPM5-2B-LiteRT es la conversión al formato LiteRT-LM (`.litertlm`) del modelo MiniCPM5-2B de OpenBMB, realizada por el usuario mlboydaisuke. El modelo original es un transformer denso de 2.500 millones de parámetros con capacidad de razonamiento híbrido: un mismo checkpoint puede responder directamente o elaborar una cadena de razonamiento interna delimitada por ``, controlable mediante el interruptor `enable_thinking` de su plantilla de chat. Esta conversión empaqueta los pesos en cuantización int4 e int8 para inferencia en dispositivo (on-device) con el runtime LiteRT-LM de Google.

La relevancia de esta ficha radica en que traslada un modelo de razonamiento de 2,5B al ecosistema LiteRT-LM, pensado para ejecución local en móviles, portátiles y GPUs de consumo. El repositorio incluye dos variantes: un fichero int4 de 1,55 GB orientado a teléfonos y un fichero int8 de 2,60 GB pensado para razonamiento que debe completarse. La model card documenta con detalle el impacto de la cuantización en la calidad del razonamiento, algo poco habitual y de gran valor práctico.

El modelo base fue publicado en septiembre de 2026 y esta conversión se actualizó por última vez en noviembre de 2026. Requiere litert-lm ≥ 0.18.0 desde el reempaquetado del 13 de octubre de 2026. La licencia es Apache 2.0 tanto en el modelo base como en la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con razonamiento híbrido (42 capas, hidden 2048, GQA 16:2, embeddings no atados de 130k vocabulario) |
| Parametros totales | 2,5B (2.500 millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens nativos |
| Tipos de cuantizacion | int4 blockwise-32 + OCTAV en lineales con embedding int8; int8 dinámico en lineales y embedding con activaciones fp32 declaradas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors/PyTorch |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un transformer denso de 42 capas con dimensión oculta 2048, atención con grouped-query attention en proporción 16:2 y embeddings de vocabulario de 130.000 tokens no atados a la capa de salida. Su rasgo distintivo es el razonamiento híbrido: la plantilla de chat incluye un interruptor `enable_thinking` que decide si el modelo responde directamente o genera primero una cadena de razonamiento en un canal `thought` separado. La conversión a LiteRT-LM preserva la plantilla `chat_template.jinja` original de forma literal, declara el canal `thought` y expone el interruptor `enable_thinking` desde el runtime.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La conversión emplea dos recetas de cuantización: int4 con cuantización blockwise de tamaño 32 y OCTAV en capas lineales más embedding int8 (1,55 GB), e int8 dinámico en lineales y embedding con activaciones fp32 declaradas (2,60 GB). El reempaquetado del 13 de octubre de 2026 adoptó los metadatos y la plantilla oficiales de `models/minicpm5` de LiteRT-LM, habilitando el paso de `tools` y el parseo de llamadas a herramientas en litert-lm 0.18.0.

## Capacidades

- Generación de texto con razonamiento híbrido: respuesta directa o cadena de razonamiento interna en `` controlada por `enable_thinking`.
- Razonamiento matemático de varios pasos (evaluado en GSM8K).
- Soporte de tool calling / function calling: el paso de `tools` funciona desde el reempaquetado de octubre de 2026 en litert-lm 0.18.0.
- Conversaciones multiturno: se verifican conversaciones de tres turnos con retención de nombre y ciudad en los tres modos de razonamiento.
- Separación del razonamiento y la respuesta final: el runtime emite el pensamiento por el canal `thought` (`[thought] … [/thought]`) y solo la respuesta final en el texto transmitido.
- Inferencia en dispositivo con delegación completa en GPU móvil (OpenCL) y en GPU de escritorio (Metal).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta soporte de visión, audio ni otras modalidades.

## Casos de uso

- Asistentes locales en teléfono: el fichero int4 de 1,55 GB se ejecuta en GPU y CPU de dispositivos Android (verificado en Galaxy S26 con delegación OpenCL completa) e iOS (iPhone 17 Pro con Metal y CPU), permitiendo asistentes sin conexión con contexto de 131k tokens.
- Razonamiento matemático en el dispositivo: con el fichero int8 y pensamiento activado, el modelo completa cadenas de razonamiento en 9 de cada 10 preguntas GSM8K con cadenas de ~3.200 caracteres, adecuado para tutores o calculadoras razonadas offline.
- Respuestas rápidas de baja latencia: con int4 y pensamiento desactivado se obtiene un 86-87 % en GSM8K y decodificación GPU más rápida, útil para autocompletado o clasificación en el borde.
- Agentes con herramientas en local: el soporte de `tools` en litert-lm 0.18.0 permite integrar el modelo en flujos de function calling sin salir del dispositivo, por ejemplo para consultar APIs locales o bases de datos embebidas.
- Conversaciones multiturno con memoria de contexto: la retención verificada de datos en conversaciones de tres turnos lo hace apto para chatbots de atención al cliente en dispositivos con historial corto.
- Aplicaciones de escritorio y Android con razonamiento completo: el fichero int8 (2,33 GB en su sección principal de pesos) supera el límite de mmap de sección única de apps iOS con entitlements por defecto, por lo que se orienta a builds de escritorio y Android donde el razonamiento debe terminar.
- Procesamiento de documentos largos en el borde: la ventana nativa de 131k tokens permite resumir o extraer información de documentos extensos en hardware local.

## Benchmarks y rendimiento

Resultados de GSM8K (primeras 100 preguntas del test, greedy, prompt de cadena de pensamiento 0-shot, pensamiento desactivado, máximo 2048 tokens nuevos, mismo prompt y extracción en todas las filas):

| Configuracion | GSM8K |
|---|---|
| bf16 PyTorch (MPS), plantilla original | 92 % |
| int8, CPU | 91 % |
| int4, CPU | 86 % |
| int4, GPU (Metal) | 87 % |

Prueba de sanidad de 8 preguntas (Apple M4 Max): ambos ficheros obtienen 8/8 en CPU y GPU; el modelo bf16 PyTorch obtiene 8/8 con pensamiento activado o libre y 6/8 con pensamiento forzado a desactivado.

Modo de razonamiento (10 preguntas GSM8K, pensamiento activado, presupuesto de 3584 tokens): el modelo bf16 cierra el razonamiento en 9/10 con cadenas de ~3.000 caracteres; int8 reproduce 9/10 con mediana de ~3.200 caracteres en CPU; int4 cierra 0/10 en CPU con mediana de ~13.700 caracteres. En GPU Metal con activaciones fp16 por defecto, el mismo fichero int4 cerró 10/10 con cadenas de ~8.000 caracteres, atribuido al redondeo fp16 y no a una propiedad fiable.

Rendimiento en dispositivo: Galaxy S26 (Snapdragon SM8850, Adreno) con delegación OpenCL completa, 1873/1873 nodos en cada firma de prefill y decode, cero operaciones rechazadas. iPhone 17 Pro: int4 obtiene 7/8 en GPU Metal (inicialización 5,7 s) y 7/8 en CPU (inicialización 2,2 s); el fallo es la línea de rima del prompt compuesto, respondida "green", la misma respuesta que da el modelo bf16 con pensamiento desactivado.

## Requisitos de hardware

- VRAM/RAM estimada: int4 ocupa 1,55 GB en disco; int8 ocupa 2,60 GB, con una sección principal de pesos de 2,33 GB.
- GPU de escritorio: verificada en Apple M4 Max con backend Metal (CPU y GPU).
- GPU móvil: verificada en Galaxy S26 (Adreno, OpenCL) e iPhone 17 Pro (Metal).
- Cabe en GPU de consumo: el fichero int4 es apto para teléfonos y equipos de gama media; el int8 requiere escritorio o Android por superar el límite de mmap de sección única de apps iOS con entitlements por defecto.
- Opciones de despliegue: runtime LiteRT-LM (litert-lm ≥ 0.18.0), instalable con `pip install litert-lm` o `uv tool install litert-lm`; ejecución con `litert-lm run --from-huggingface-repo=mlboydaisuke/MiniCPM5-2B-LiteRT <fichero> --backend gpu|cpu`.
- Latencia: inicialización de 5,7 s en GPU Metal y 2,2 s en CPU en iPhone 17 Pro; no se publican cifras de throughput (tokens/s) en la información disponible.
- El reempaquetado del 13 de octubre de 2026 cambió el tipo de modelo y con él los valores por defecto del ejecutor GPU del runtime (allow_src_quantized_fc_conv_ops activado, hint_waiting_for_completion de OpenCL desactivado, kernel batch size sin definir); las filas de GPU móvil se midieron con los ficheros anteriores y no se han vuelto a ejecutar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (no-think) | Licencia | Formato/Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-LiteRT (int8) | 2,5B | 131k | 91 % | Apache 2.0 | LiteRT-LM, Hugging Face |
| MiniCPM5-2B-LiteRT (int4) | 2,5B | 131k | 86-87 % | Apache 2.0 | LiteRT-LM, Hugging Face |
| MiniCPM5-2B (bf16 PyTorch) | 2,5B | 131k | 92 % | Apache 2.0 | safetensors/PyTorch, Hugging Face |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de otros modelos de la misma categoría (2-3B con razonamiento y despliegue en dispositivo) para una comparación adicional.

## Limitaciones y advertencias

- El fichero int4 degrada el razonamiento: con pensamiento activado cierra 0/10 preguntas GSM8K en CPU frente a 9/10 del bf16, con cadenas que se alargan hasta ~13.700 caracteres y agotan el presupuesto sin emitir la respuesta final. Para razonamiento que debe completarse, usar int8 o desactivar el pensamiento en int4.
- El cierre 10/10 observado en GPU Metal con int4 se atribuye al redondeo fp16 de las activaciones y no es una propiedad fiable.
- El modelo bf16 de referencia obtiene 6/8 con pensamiento forzado a desactivado; los resultados sin pensamiento deben leerse contra ese 6/8 y no contra 8/8.
- El fichero int8 no es apto para apps iOS con entitlements por defecto por el límite de mmap de sección única (2,33 GB de pesos).
- La ventana de contexto nativa es de 131k tokens, pero no se documenta el rendimiento en contextos largos más allá de conversaciones de tres turnos.
- No se dispone de información sobre sesgos conocidos, idiomas soportados ni tasas de alucinación.
- El paso de `tools` requiere litert-lm ≥ 0.18.0; en 0.17.x el turno de usuario se renderiza vacío y la plantilla anterior fallaba con "too many arguments".
- Las mediciones en GPU móvil se realizaron con los ficheros previos al reempaquetado de octubre de 2026 y no se han repetido con los actuales.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias del runtime LiteRT-LM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/MiniCPM5-2B-LiteRT
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
