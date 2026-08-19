# donedynamics/Qwen3.8-27B-heretic-VL-MLX-4bit

## Resumen

`Qwen3.8-27B-heretic-VL-MLX-4bit` es una conversión a formato MLX con cuantización de 4 bits del modelo `trohrbaugh/Qwen3.8-27B-heretic-ara`, un derivado "abliterado" del modelo oficial `Qwen/Qwen3.8-27B` de Alibaba. La abliteración elimina quirúrgicamente el comportamiento de rechazo del modelo original, de modo que responde a instrucciones que un modelo ajustado con seguridad normalmente declinaría. Esta versión conserva intacta la torre de visión, lo que permite procesar imágenes además de texto.

El modelo base, Qwen3.8-27B, es un transformer denso multimodal de 27.000 millones de parámetros, con una ventana de contexto nativa de 262.000 tokens y capacidades destacadas en generación de código, flujos de trabajo agénticos y automatización de oficina. Esta conversión MLX está pensada para ejecutarse en hardware Apple Silicon mediante la librería `mlx-vlm`, y se distribuye bajo licencia Apache-2.0.

La relevancia de esta ficha radica en que ofrece una variante local, rápida y con visión funcional de un modelo de última generación, aunque con las implicaciones éticas y de seguridad derivadas de la eliminación de los mecanismos de rechazo. Es imprescindible evaluar su comportamiento antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) |
| Parametros totales | 27.000 millones (nominal) - el archivo safetensors reporta 4.665.462.000, inconsistencia probablemente debida a metadatos erroneos |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (nativa del modelo base) |
| Tipos de cuantizacion | 4-bit (este repo); existen variantes de 6-bit, 8-bit y bf16 |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se especifican en esta conversion) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original `Qwen/Qwen3.8-27B` es un transformer denso de 27.000 millones de parametros con una torre de vision integrada, entrenado por el equipo Qwen de Alibaba para tareas multimodales (imagen y texto). Incorpora un modo de razonamiento configurable (`enable_thinking` y `reasoning_effort`) que permite al modelo generar cadenas de pensamiento antes de responder. La ventana de contexto nativa es de 262.000 tokens.

El proceso de abliteracion aplicado por `trohrbaugh` elimina selectivamente los pesos asociados al comportamiento de rechazo, dando lugar al modelo "heretic". Esta operacion no anade ninguna alineacion nueva ni elimina otras capacidades; simplemente suprime los mecanismos que llevan al modelo a negarse a responder ciertas instrucciones.

La conversion a MLX realizada por `donedynamics` mantiene la torre de vision completa (333 de los 2180 tensores pertenecen a `vision_tower`) y aplica una cuantizacion de 4 bits. Es importante destacar que esta conversion requiere `mlx-vlm` y no `mlx-lm`, ya que esta ultima descartaria silenciosamente la parte visual.

## Capacidades

- Generacion de texto y comprension de imagenes: el modelo puede leer y describir imagenes, identificar objetos, colores, posiciones y texto incrustado.
- Razonamiento multimodal: combina informacion visual y textual para responder preguntas complejas.
- Modo de razonamiento explicito: soporta `enable_thinking` y `reasoning_effort`, generando cadenas de pensamiento antes de la respuesta final.
- Generacion de codigo: el modelo base destaca en tareas de programacion, incluyendo generacion, explicacion y depuracion de codigo.
- Capacidades agénticas: apto para flujos de trabajo que requieren planificacion multi-paso y uso de herramientas (tool calling), aunque esta capacidad no se verifica explicitamente en esta conversion.
- Multilingue: el modelo base soporta multiples idiomas, aunque no se detallan en la documentacion de esta conversion.

## Casos de uso

- Analisis de imagenes en entornos de investigacion: el modelo puede procesar figuras, diagramas y graficos cientificos, extrayendo informacion relevante y respondiendo preguntas sobre ellos. Su ventana de 262K tokens permite manejar documentos largos junto con imagenes.
- Asistente de programacion con capturas de pantalla: un desarrollador puede enviar una captura de pantalla de un error o de una interfaz y recibir una explicacion y sugerencias de codigo, gracias a la combinacion de vision y capacidades de generacion de codigo.
- Automatizacion de oficina: procesamiento de documentos escaneados, formularios o facturas, extrayendo datos estructurados y resumiendo contenido visual y textual.
- Creacion de contenido multimodal: generacion de descripciones alternativas para imagenes, redaccion de textos a partir de material visual, o preparacion de materiales educativos que combinan texto e imagen.
- Prototipado rapido de agentes conversacionales: al ser abliterado, puede explorar escenarios de dialogo sin restricciones de rechazo, util para investigacion en interaccion persona-maquina o para pruebas de estres de sistemas de moderacion.
- Despliegue local en Apple Silicon: ideal para entornos donde se requiere privacidad de datos y ejecucion sin conexion, gracias a su formato MLX optimizado para hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion especifica. El modelo base Qwen3.8-27B, segun fuentes no oficiales, alcanza puntuaciones de 42.2 en DeepSWE, 73.0 en Terminal Bench y 84.3 en OSWorld, pero estos datos no estan confirmados por documentacion oficial de Alibaba. Se recomienda consultar la documentacion oficial de Qwen para obtener metricas verificadas.

En cuanto al rendimiento de inferencia, la model card de esta conversion reporta, en un Mac Studio M3 Ultra (512 GB de memoria unificada, macOS 26.5.2, `mlx-vlm` 0.6.13) y con un prompt multimodal de 470 tokens, una velocidad de generacion de 38.9 tokens por segundo y un pico de memoria de 19.2 GB para la version de 4 bits. El procesamiento del prompt (prefill) se ejecuto a 303-331 tokens por segundo.

## Requisitos de hardware

- VRAM estimada: 19.2 GB de memoria unificada para la version de 4 bits (medido en Mac Studio M3 Ultra).
- GPU recomendadas: exclusivamente Apple Silicon (M-series). La conversion MLX no es compatible con GPUs NVIDIA o AMD.
- Compatibilidad con hardware de consumo: si, en Macs con al menos 32 GB de memoria unificada (recomendable 64 GB para margen).
- Opciones de despliegue: mediante `mlx-vlm` (linea de comandos o API Python). No es compatible con vLLM, llama.cpp u Ollama en su forma actual.
- Latencia y throughput: 38.9 tok/s en generacion y 303-331 tok/s en prefill, medidos en el equipo mencionado. Estos valores son orientativos y dependen del hardware y la carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Si | Apache-2.0 | Original (PyTorch, etc.) |
| Qwen3.8-27B-heretic-ara (base) | 27B | 262K | Si | Apache-2.0 | safetensors (bf16) |
| Qwen3.8-27B-heretic-VL-MLX-4bit (este) | 27B | 262K | Si | Apache-2.0 | safetensors (MLX 4-bit) |
| Qwen3.8-27B-heretic-MLX-4bit (sin vision) | 27B | 262K | No | Apache-2.0 | safetensors (MLX 4-bit) |

La principal diferencia con el modelo original es la eliminacion del rechazo (abliteracion) y el formato MLX optimizado para Apple Silicon. Frente a la version sin vision, esta conserva la torre visual a costa de un mayor uso de memoria (4-6 GB adicionales).

## Limitaciones y advertencias

- Modelo abliterado: al eliminar el comportamiento de rechazo, el modelo puede generar contenido inapropiado, ofensivo o peligroso si se le solicita. No debe desplegarse en entornos de usuario final sin una capa de moderacion externa.
- Sin alineacion adicional: esta conversion no anade ningun ajuste de seguridad; hereda exactamente el comportamiento del modelo base abliterado.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion, especialmente en tareas visuales complejas o cuando la imagen es ambigua.
- Limitaciones de idioma: no se especifican los idiomas soportados en esta conversion; se asume herencia del modelo base, pero no esta verificado.
- Compatibilidad restringida: solo funciona en Apple Silicon y requiere `mlx-vlm`; no es portable a otros entornos sin reconversion.
- Rendimiento variable: las metricas de velocidad y memoria se obtuvieron en una unica maquina y con un solo prompt; los resultados pueden variar en otros equipos.
- Licencia: Apache-2.0 permite uso comercial, pero el caracter abliterado puede plantear problemas de responsabilidad legal o etica en aplicaciones publicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-VL-MLX-4bit
- Modelo base (abliterado): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Version sin vision (MLX 4-bit): https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-MLX-4bit
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia de LM Studio sobre Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Blog de AMD sobre soporte de Qwen3.8: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
