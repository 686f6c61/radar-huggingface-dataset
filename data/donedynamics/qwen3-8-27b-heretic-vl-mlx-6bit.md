# donedynamics/Qwen3.8-27B-heretic-VL-MLX-6bit

## Resumen

El modelo `donedynamics/Qwen3.8-27B-heretic-VL-MLX-6bit` es una conversión a formato MLX cuantizada a 6 bits del modelo `trohrbaugh/Qwen3.8-27B-heretic-ara`, que a su vez es una versión "abliterada" (sin comportamientos de rechazo) del modelo vision-language `Qwen/Qwen3.8-27B` de Alibaba. El autor, `donedynamics`, ha mantenido intacto el codificador de visión, de modo que esta versión funciona como un modelo multimodal completo en hardware Apple Silicon. Su propósito principal es permitir ejecutar un modelo de 27 000 millones de parámetros con capacidades de visión y razonamiento en equipos con memoria unificada, sin necesidad de GPUs dedicadas.

La arquitectura es un transformer denso con un codificador de visión adicional, derivado de la familia Qwen3.8. El modelo base soporta una ventana de contexto nativa de 262 144 tokens y razonamiento configurable (modo "thinking"). La conversión MLX se realizó con la librería `mlx-vlm` 0.6.13, y la versión de 6 bits ocupa 21,3 GB en disco, con un pico de memoria de 27,0 GB durante la inferencia. Es importante destacar que, al ser una versión "abliterada", el modelo responde a peticiones que un modelo con ajuste de seguridad rechazaría, lo que implica riesgos adicionales de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con codificador de vision (vision-language) |
| Parametros totales | 27 000 millones (nominal; el archivo safetensors reporta 6 346 296 560, posible error de metadata) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantizacion | 6-bit (MLX); tambien disponibles 4-bit, 8-bit y bf16 en repos hermanos |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingue, pero no se especifica en la documentacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión MLX del checkpoint `trohrbaugh/Qwen3.8-27B-heretic-ara`, que a su vez deriva de `Qwen/Qwen3.8-27B`. La cadena de linaje es: `Qwen/Qwen3.8-27B` → `trohrbaugh/Qwen3.8-27B-heretic-ara` → esta conversión. El proceso de "abliteration" elimina quirúrgicamente el comportamiento de rechazo del modelo original, de modo que responde a instrucciones que un modelo con ajuste de seguridad declinaría. Esta conversión únicamente cambia el formato y la precisión de los pesos; no añade ni elimina alineación adicional.

La arquitectura subyacente es un transformer denso de 27 000 millones de parámetros con un codificador de visión integrado. Según la documentación, el `vision_tower` está presente y 333 de los 2180 tensores pertenecen a dicho codificador. El modelo soporta razonamiento configurable mediante los parámetros `enable_thinking` y `reasoning_effort`, y tiene una ventana de contexto nativa de 262 144 tokens. Los datos de entrenamiento del modelo base no se detallan en la información disponible.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" configurable (activado por defecto, consume tokens antes de la respuesta final).
- Vision: lectura de imagenes, reconocimiento de formas, colores, posiciones y texto incrustado en imagenes. Verificado por el autor con una imagen de prueba que incluia tres figuras geometricas y dos cadenas de texto.
- Soporte de tareas agénticas de largo horizonte, segun la descripcion del modelo base en LM Studio.
- Capacidad multilingue no especificada en la documentacion, aunque el modelo base Qwen3.8 es multilingue.
- Al ser "abliterated", no presenta comportamientos de rechazo ante contenido que otros modelos declinarian.

## Casos de uso

- Analisis de imagenes en aplicaciones macOS/iOS: el modelo puede describir escenas, extraer texto (OCR) o identificar objetos en fotografias, aprovechando la memoria unificada de Apple Silicon para ejecutarse localmente sin conexion.
- Asistente de programacion con contexto visual: al combinar vision y razonamiento, puede depurar capturas de pantalla de errores, diagramas de arquitectura o esquemas de bases de datos, con una ventana de contexto de 262K tokens para mantener conversaciones largas.
- Automatizacion de tareas agénticas multi-paso: con razonamiento configurable y contexto amplio, puede planificar y ejecutar secuencias de acciones (por ejemplo, orquestar llamadas a APIs o procesar documentos) en entornos de investigacion.
- Procesamiento de documentos cientificos con figuras: extraer informacion de graficos, tablas o imagenes en PDFs, generando resumenes estructurados para revision de literatura.
- Investigacion academica sin restricciones de contenido: al carecer de rechazo, puede analizar temas sensibles (por ejemplo, contenido medico explicito o escenarios hipoteticos) que otros modelos rechazarian, siempre que se apliquen filtros posteriores.
- Generacion de descripciones para datasets de vision por computador: crear anotaciones textuales de imagenes para entrenar otros modelos, aprovechando su capacidad de reconocimiento visual y generacion de texto.
- Chat conversacional multimodal con memoria larga: mantener dialogos que alternan texto e imagenes durante sesiones prolongadas, gracias a los 262K tokens de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye datos de rendimiento de generacion y memoria para las cuatro versiones cuantizadas, medidos en un Mac Studio M3 Ultra (512 GB de memoria unificada) con `mlx-vlm` 0.6.13 y un prompt multimodal de 470 tokens:

| Version | Tamano en disco | Bits/peso | Velocidad de generacion | Pico de memoria |
|---|---|---|---|---|
| 4-bit | 15,0 GB | 4,695 | 38,9 tok/s | 19,2 GB |
| 6-bit | 21,3 GB | 6,661 | 29,2 tok/s | 27,0 GB |
| 8-bit | 27,5 GB | 8,627 | 23,1 tok/s | 34,7 GB |
| bf16 | 51,0 GB | 16 | 13,2 tok/s | 55,8 GB |

El procesamiento del prompt (prefill) se ejecuto a 303-331 tok/s en las cuatro versiones. Estos datos son orientativos, de una unica ejecucion en una sola maquina.

## Requisitos de hardware

- Disenado para Apple Silicon; requiere `mlx-vlm` (no funciona con `mlx-lm`, que ignoraria el codificador de vision).
- Memoria: la version de 6 bits necesita 27,0 GB de memoria unificada en pico; la de 4 bits 19,2 GB; la de 8 bits 34,7 GB; y la de bf16 55,8 GB.
- GPU recomendada: Mac Studio M3 Ultra (512 GB) probado por el autor; cualquier Mac con Apple Silicon y al menos 32 GB de RAM unificada puede ejecutar la version de 6 bits.
- No es compatible con GPUs NVIDIA o AMD de forma nativa; requiere el ecosistema MLX.
- Opciones de despliegue: `mlx_vlm.generate` desde linea de comandos, o integracion en aplicaciones Python mediante `mlx_vlm.load` y `generate`.
- Latencia y throughput: 29,2 tok/s de generacion y 303-331 tok/s de prefill en M3 Ultra para la version de 6 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Si | Apache-2.0 | Con ajuste de seguridad, rechaza contenido sensible |
| Qwen3.8-27B-heretic-ara | 27B | 262K | Si | Apache-2.0 | Abliterated, sin rechazo |
| Este modelo (MLX 6-bit) | 27B | 262K | Si | Apache-2.0 | Cuantizado a 6-bit para Apple Silicon |
| Qwen3-VL (serie) | No disponible | No disponible | Si | Apache-2.0 | Modelo multimodal de la familia Qwen, con arquitecturas dense y MoE |

La principal diferencia frente al modelo original es la eliminacion del rechazo y la cuantizacion para MLX. Frente a Qwen3-VL, este modelo pertenece a una serie distinta (Qwen3.8) y su disponibilidad en MLX lo hace mas accesible en hardware Apple.

## Limitaciones y advertencias

- Al ser "abliterated", el modelo puede generar contenido inapropiado, ofensivo, peligroso o ilegal. No es apto para produccion sin filtros de contenido adicionales y evaluacion previa.
- Riesgo de alucinacion inherente a los modelos de lenguaje; se recomienda verificar las respuestas en aplicaciones criticas.
- La cuantizacion a 6 bits puede degradar ligeramente la calidad de las respuestas frente a la version bf16, especialmente en tareas de razonamiento complejo.
- Requiere `mlx-vlm`; usar `mlx-lm` eliminaria silenciosamente la capacidad de vision.
- No se han publicado benchmarks de calidad, por lo que el rendimiento real en tareas estandar es desconocido.
- La metadata de safetensors reporta 6 346 296 560 parametros, inconsistente con la denominacion de 27B; posible error en la conversion o en la metadata.
- El modo "thinking" esta activado por defecto y consume tokens antes de la respuesta; con presupuestos de `max_tokens` pequenos puede devolver solo el razonamiento sin la respuesta final.
- Los idiomas soportados no estan documentados, aunque el modelo base es multilingue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-VL-MLX-6bit
- Repositorio hermano sin vision (4-bit): https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-MLX-4bit
- Modelo base (abliterated): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Ficha del modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
