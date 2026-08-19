# Chungulus/Qwen3.8-27B-Q3_K_S-GGUF

## Resumen

Qwen3.8-27B-Q3_K_S-GGUF es una cuantizacion vanilla en formato GGUF del modelo vision-lenguaje Qwen3.8-27B, publicada por Chungulus. Se trata de una conversion directa de los pesos originales de Qwen, sin fine-tuning, merges ni modificaciones de alineacion o plantilla de chat. El modelo base, desarrollado por Qwen, es un modelo denso de 27.000 millones de parametros con capacidades de vision, razonamiento y generacion de texto, disenado para tareas de codificacion agente, vision y chat.

Esta cuantizacion Q3_K_S reduce el peso del modelo a aproximadamente 12,3 GB (mas el proyector de vision en F16), lo que permite ejecutarlo en equipos con unos 17 GB de memoria disponible. El repositorio incluye tanto el tensor principal como el proyector multimodal (mmproj), y conserva la arquitectura hibrida Gated DeltaNet/atencion completa, los tensores MTP y los controles de pensamiento del modelo original. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

La relevancia de esta publicacion radica en que ofrece una via accesible para ejecutar localmente un modelo de 27B con vision y razonamiento configurable en hardware de consumo, manteniendo la integridad byte a byte con los artefactos ya validados por el autor en un release combinado previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Gated DeltaNet / atencion completa (transformer con vision tower) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) segun fuentes del modelo base; no verificado en esta cuantizacion |
| Tipos de cuantizacion | Q3_K_S (GGUF); el proyector de vision en F16 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tensor principal) y GGUF F16 (mmproj) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina capas con Gated DeltaNet y capas de atencion completa, una innovacion reciente en modelos Qwen que busca equilibrar eficiencia de memoria y calidad de generacion. Incluye un vision tower con 333 tensores de vision y un proyector multimodal que permite procesar imagenes y video. El modelo conserva los tensores MTP (multi-token prediction) del checkpoint original, aunque el autor de la cuantizacion no anuncia aceleracion especulativa como funcionalidad validada.

En cuanto al entrenamiento, no se dispone de datos detallados sobre el dataset o el proceso de alineacion del modelo base en la informacion proporcionada. La cuantizacion Q3_K_S se realizo con llama.cpp (revision 5f754ea0e2fd21e1213db7ebebfd65d938d9d69c) utilizando cuantizacion K/IQ sin calibracion para los K-quants, y con prompts locales representativos donde la conversion IQ lo requeria. El resultado es una cuantizacion vanilla que no altera la plantilla de chat ni los controles de razonamiento del modelo original.

## Capacidades

- Generacion de texto y razonamiento: soporta modos de pensamiento configurables mediante los parametros `enable_thinking`, `reasoning_effort` y `preserve_thinking`, que permiten ajustar el nivel de razonamiento explicito.
- Vision y video: el modelo puede procesar imagenes y video gracias al vision tower y al proyector multimodal. La validacion del autor confirma el paso de tres casos deterministicos de imagen local.
- Tool calling: validado con los cinco casos de formato nativo de Qwen, lo que permite integracion con funciones externas y APIs.
- Capacidades agente: disenado para tareas de larga duracion y razonamiento multi-paso, segun las fuentes del modelo base.
- Codificacion: el modelo base destaca en tareas de codificacion agente, segun la documentacion de Unsloth y LM Studio.
- Multilingue: no se especifican idiomas soportados en la informacion disponible.
- Chat conversacional: pipeline image-text-to-text con plantilla de chat preservada del checkpoint original.

## Casos de uso

- Asistente de codificacion local: el modelo puede integrarse en entornos de desarrollo como editor o CLI para generar, revisar y refactorizar codigo. Su ventana de contexto de 262K permite cargar repositorios completos o archivos extensos, y el soporte de tool calling facilita la conexion con linters, compiladores o sistemas de control de versiones.
- Analisis de imagenes y documentos escaneados: gracias al vision tower, puede extraer informacion de capturas, diagramas o documentos con figuras. Un caso tipico seria describir el contenido de una imagen tecnica o transcribir texto presente en una fotografia.
- Atencion al cliente con contexto largo: con 262K tokens de ventana, puede mantener conversaciones multi-turno extensas recordando el historial completo del usuario, lo que resulta adecuado para sistemas de soporte que necesitan retener informacion de interacciones previas.
- Agente autonomo de investigacion: su capacidad de razonamiento configurable y tool calling permite construir agentes que buscan informacion, consultan APIs y sintetizan resultados en informes, ejecutandose en hardware local sin dependencia de servicios en la nube.
- Procesamiento de video para resumen: el modelo acepta entrada de video, por lo que puede generar resumenes descriptivos de clips o extraer informacion temporal de secuencias visuales, util en tareas de vigilancia o analisis de contenido.
- Prototipado de aplicaciones multimodales: desarrolladores que necesitan validar ideas con un modelo de 27B en local pueden usar esta cuantizacion para iterar rapidamente sobre prompts, plantillas y flujos de razonamiento antes de escalar a modelos mayores o servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explicitamente que esta cuantizacion no reclama una nueva ejecucion de benchmarks, sino que preserva artefactos byte-identicos ya validados en un release combinado previo. El unico dato de rendimiento medido es una velocidad de generacion de 17,35 tokens/s en el host de validacion del autor, con un prompt de validacion de 73 tokens como maximo registrado. No se dispone de comparativas con otras cuantizaciones o modelos en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Memoria estimada: aproximadamente 17 GB de RAM/VRAM disponibles para el modelo, el proyector de vision y overhead de ejecucion. La memoria de KV-cache crece con la longitud de contexto.
- GPU recomendadas: el modelo puede ejecutarse en GPUs de consumo con 16-24 GB de VRAM, como RTX 4090, RTX 4080 o equivalentes. Tambien es compatible con hardware AMD Ryzen AI Max y Radeon, segun la documentacion de AMD con soporte Day 0.
- CPU: es posible ejecutarlo en CPU con suficiente RAM, aunque la velocidad sera significativamente menor que en GPU.
- Opciones de despliegue: llama.cpp (recomendado por el autor, con el binario `llama-mtmd-cli`), LM Studio, Ollama, Unsloth Desktop y cualquier runtime compatible con GGUF que soporte la arquitectura hibrida Qwen3.8.
- Latencia y throughput: 17,35 tokens/s medidos en el host de validacion del autor; el rendimiento real dependera del hardware y de la longitud de contexto utilizada.

## Comparativa con modelos similares

No se dispone de datos de comparativa directa con otras cuantizaciones del mismo modelo o con modelos alternativos de tamano similar en la informacion proporcionada. El modelo base Qwen3.8-27B se posiciona como un VLM denso de 27B con contexto nativo de 262K, licencia Apache-2.0 y capacidades de razonamiento configurable. Existen otras cuantizaciones del mismo modelo publicadas por Chungulus (por ejemplo, en el repositorio combinado `Qwen3.8-27B-GGUF`) y por Unsloth, pero no se incluyen datos comparativos de rendimiento o calidad en las fuentes consultadas.

## Limitaciones y advertencias

- La cuantizacion Q3_K_S es de baja precision y puede reducir la calidad de generacion, especialmente en tareas que requieren matices o exactitud factual. El propio autor advierte de esta degradacion.
- La longitud de contexto maxima de 262K es una caracteristica del modelo base, pero no ha sido verificada en esta cuantizacion. El prompt de validacion mas largo registrado fue de 73 tokens, por lo que no se garantiza el funcionamiento correcto en contextos extremadamente largos.
- El runtime debe soportar la arquitectura hibrida Qwen3.8 (Gated DeltaNet + atencion), el vision tower, el tokenizer y los metadatos MTP. No basta con cargar solo el tensor de lenguaje.
- Los tensores MTP se conservan pero no se anuncia aceleracion especulativa como funcionalidad validada; su presencia puede requerir soporte especifico en el runtime.
- No se dispone de informacion sobre sesgos del modelo, riesgos de alucinacion o limitaciones idiomaticas especificas de esta cuantizacion. Como modelo de 27B, es susceptible a alucinaciones en tareas de hechos poco comunes o informacion muy especifica.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen3.8-27B para confirmar cualquier restriccion adicional.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/Chungulus/Qwen3.8-27B-Q3_K_S-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Release combinado validado: https://huggingface.co/Chungulus/Qwen3.8-27B-GGUF/tree/f519a212d6c15cd3292b6ca835dd8ebf235642c0
- Repositorio MTP del mismo autor: https://huggingface.co/Chungulus/Qwen3.8-27B-MTP-GGUF
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Blog de AMD sobre soporte de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia de ejecucion local de yottalabs.ai: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Pagina de LM Studio para Qwen3.8: https://lmstudio.ai/models/qwen3.8
