# shoemoney/Gemma-4-12B-Abliterated-MLX-q6

## Resumen

El modelo `shoemoney/Gemma-4-12B-Abliterated-MLX-q6` es una cuantización en 6 bits (MLX) del modelo `huihui-ai/Huihui-gemma-4-12B-it-abliterated`, que a su vez es una versión "abliterada" (sin mecanismos de rechazo) del modelo multimodal Gemma 4 12B de Google. Está diseñado específicamente para ejecutarse en hardware Apple Silicon mediante la librería `mlx-vlm`, lo que permite desplegar un VLM de 12B sin censura en equipos Mac con memoria unificada suficiente.

La relevancia de este modelo radica en que combina tres características: arquitectura multimodal (texto e imagen), ausencia de filtros de contenido (uncensored) y optimización para inferencia local en Mac. Al estar cuantizado a 6 bits, ocupa unos 9,8 GB en disco, lo que lo hace viable en equipos con al menos 16 GB de RAM unificada. El autor reporta mediciones de perplejidad y throughput en un Apple M3 Ultra, pero no se han publicado benchmarks estándar de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4Unified (VLM, encoder-free) |
| Parametros totales | 12B (nominal; el archivo safetensors muestra 2.623.538.224, posible discrepancia por cuantizacion) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (segun especificaciones del modelo base Gemma 4) |
| Tipos de cuantizacion | 6-bit MLX (q-group-size 64) |
| Idiomas soportados | Mas de 140 (segun modelo base Gemma 4) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 12B, un VLM con arquitectura "Gemma4Unified" (encoder-free) segun el repositorio de abliteration. Esta arquitectura procesa directamente las secuencias de texto e imagen sin un encoder visual separado, lo que simplifica el diseño. El proceso de abliteration, aplicado por huihui-ai, elimina la direccion de rechazo (refusal) en las capas superiores (L15-47) del decoder, de modo que el modelo no muestra reticencia a generar contenido que el modelo original rechazaria.

La cuantizacion a 6 bits se realizo con `mlx_vlm.convert` sobre los pesos BF16 originales, con un grupo de cuantizacion de 64. No se realizo fine-tuning ni re-alineamiento posterior. El autor indica que la perplejidad medida es de 144.271 sobre el dataset `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens), con un factor de 1.03x respecto al mejor rung de su familia de cuantizaciones.

## Capacidades

- Generacion de texto y razonamiento: al ser un modelo de 12B, mantiene capacidades de generacion coherente y razonamiento logico, aunque la cuantizacion 6-bit puede degradar ligeramente la precision.
- Comprension multimodal: procesa imagenes junto con texto, permitiendo descripcion de imagenes, respuesta a preguntas visuales y tareas de vision-lenguaje.
- Generacion de codigo: el modelo base Gemma 4 esta entrenado para tareas de programacion, por lo que puede generar y explicar codigo en multiples lenguajes.
- Soporte multilingue: mas de 140 idiomas segun el modelo base, aunque la cuantizacion no altera esta capacidad.
- Ausencia de filtros de contenido: al estar abliterado, no aplica mecanismos de rechazo, lo que permite generar contenido que el modelo original bloquearia (uso responsable requerido).
- Inferencia optimizada para Apple Silicon: gracias a la cuantizacion MLX, se ejecuta eficientemente en GPUs de Apple (M-series) con memoria unificada.

## Casos de uso

- Asistente de programacion local: un desarrollador puede ejecutar el modelo en su Mac para generar fragmentos de codigo, explicar errores o refactorizar funciones sin depender de servicios en la nube. Su capacidad de contexto largo (256K) permite procesar repositorios completos.
- Analisis de imagenes en entornos sin conexion: al ser un VLM, puede describir imagenes, extraer texto de capturas o responder preguntas sobre fotografias, util en aplicaciones de archivado o accesibilidad.
- Generacion de contenido creativo sin restricciones: escritores o creadores pueden usarlo para redactar narrativas, dialogos o guiones sin que el modelo imponga censura tematica, siempre bajo responsabilidad legal y etica.
- Chatbot de soporte tecnico interno: empresas pueden desplegarlo en un Mac como asistente para documentacion interna, aprovechando su capacidad multilingue y su contexto largo para manejar conversaciones extensas.
- Prototipado rapido de agentes conversacionales: al ser un modelo abliterado, permite experimentar con comportamientos de IA sin las limitaciones de seguridad del modelo original, util para investigacion en interaccion humano-maquina.
- Procesamiento de documentos largos: con 256K de contexto, puede resumir informes extensos, extraer informacion clave o responder preguntas sobre manuales tecnicos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo proporciona mediciones de perplejidad y throughput en un Apple M3 Ultra (96 GB unificados, macOS 27):

| Metrica | Valor |
|---|---|
| Tamano en disco | 9.76 GB |
| Perplejidad (tulu-3-sft-mixture, 192 muestras) | 144.271 |
| Factor relativo al mejor rung de la familia | 1.03x |
| Throughput (1 peticion / 8 concurrentes) | 33.0 / 99.1 tok/s |

La perplejidad solo es comparable dentro de la misma familia de cuantizaciones, ya que los tokenizadores difieren entre familias de modelos.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 9.76 GB, por lo que se recomienda al menos 16 GB de RAM unificada en Apple Silicon para inferencia con overhead de activaciones y cache.
- GPU recomendadas: Apple M-series (M1, M2, M3, M4) con memoria unificada. El autor midio en M3 Ultra con 96 GB, pero modelos con 32 GB o mas son suficientes para ejecucion comoda.
- Compatibilidad con consumer GPU: si, en cualquier Mac con chip Apple Silicon y suficiente RAM unificada. No requiere GPU dedicada.
- Opciones de despliegue: `mlx-vlm` (libreria principal), tambien puede integrarse en aplicaciones Python con el ecosistema MLX. No se menciona soporte para vLLM, llama.cpp u Ollama en esta version especifica.
- Latencia y throughput: 33.0 tok/s con una peticion y 99.1 tok/s con 8 peticiones concurrentes en M3 Ultra, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `shoemoney/Gemma-4-12B-Abliterated-MLX-q6` | 12B (nominal) | 256K | Apache-2.0 | MLX 6-bit | Cuantizado para Apple Silicon, abliterado |
| `google/gemma-4-12B` | 12B | 256K | Apache-2.0 | BF16 | Modelo original con filtros de seguridad |
| `OBLITERATUS/Gemma-4-12B-OBLITERATED` | 12B | 256K | Apache-2.0 | BF16 (probable) | Abliterado, sin cuantizacion MLX |
| `huihui-ai/Huihui-gemma-4-12B-it-abliterated` | 12B | 256K | Apache-2.0 | BF16 | Modelo base de este, abliterado |

La principal diferencia con el modelo original es la eliminacion de los mecanismos de rechazo y la cuantizacion para Apple Silicon. Frente a otras versiones abliteradas, esta ofrece un formato optimizado para Mac con menor uso de memoria.

## Limitaciones y advertencias

- Contenido no seguro: al ser abliterado, el modelo puede generar contenido ofensivo, ilegal o danino. Su uso en produccion requiere medidas de filtrado externo y supervision humana.
- Riesgo de alucinacion: como cualquier LLM, puede inventar informacion, especialmente en tareas de razonamiento o hechos especificos. La cuantizacion 6-bit puede aumentar ligeramente este riesgo.
- Degradacion por cuantizacion: la perplejidad medida (144.271) es alta en terminos absolutos, aunque el autor indica que es comparable dentro de su familia. La calidad de generacion puede ser inferior a la del modelo BF16 original.
- Limitaciones de idioma: aunque el modelo base soporta 140+ idiomas, la cuantizacion no altera esta capacidad, pero el rendimiento en idiomas poco representados puede ser menor.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, pero el modelo abliterado puede violar los terminos de uso de Google si se redistribuye como derivado de Gemma 4 (verificar politicas de Google).
- Compatibilidad: requiere `mlx-vlm`; no es compatible con frameworks estandar como Transformers o vLLM sin conversion adicional.

## Enlaces

- [HuggingFace: shoemoney/Gemma-4-12B-Abliterated-MLX-q6](https://huggingface.co/shoemoney/Gemma-4-12B-Abliterated-MLX-q6)
- [Modelo base: huihui-ai/Huihui-gemma-4-12B-it-abliterated](https://huggingface.co/huihui-ai/Huihui-gemma-4-12B-it-abliterated)
- [Modelo original: google/gemma-4-12B](https://huggingface.co/google/gemma-4-12B)
- [Model card de Gemma 4 (Google AI for Developers)](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Repositorio de abliteration: TrevorS/gemma-4-abliteration](https://github.com/TrevorS/gemma-4-abliteration)
- [Modelo alternativo: OBLITERATUS/Gemma-4-12B-OBLITERATED](https://huggingface.co/OBLITERATUS/Gemma-4-12B-OBLITERATED)
- [Version en Ollama: huihui_ai/gemma-4-abliterated](https://ollama.com/huihui_ai/gemma-4-abliterated)
