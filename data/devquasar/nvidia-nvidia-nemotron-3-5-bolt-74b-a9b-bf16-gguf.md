# DevQuasar/nvidia.NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16-GGUF

## Resumen

DevQuasar/nvidia.NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16-GGUF es una cuantizacion en formato GGUF del modelo NVIDIA Nemotron 3.5 Bolt 74B-A9B, publicada por el usuario DevQuasar. El modelo original es un VLM (vision-language model) de tipo MoE (mixture of experts) con 74.000 millones de parametros totales y 9.000 millones activos, desarrollado por NVIDIA dentro de su familia Nemotron de pesos abiertos.

El modelo base esta disenado para ejecutar tareas agénticas cotidianas en local. Soporta texto, imagenes y video, tool calling y una ventana de contexto de 128K tokens. Se obtuvo mediante compresion estructurada del modelo mayor Super 3.5 VL y cuantizacion agresiva a 2 bits, de modo que quepa en 24 GB de memoria y alcance al menos 80 TPS de decodificacion. Segun NVIDIA, el resultado supera a modelos de tamano similar entrenados desde cero y cuantizados a 4 bits.

Esta ficha describe el repositorio GGUF de DevQuasar, cuya model card se limita a indicar que es una version cuantizada del BF16 original publicado por NVIDIA. No hay informacion sobre licencia, idiomas ni los niveles de cuantizacion concretos incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida de razonamiento con vision (vision-language mixture of experts); transformer con enrutado de expertos |
| Parametros totales | 74 000 millones (74B) segun el nombre del modelo; los metadatos de safetensors del repositorio indican 842 360 320, dato inconsistente con el nombre |
| Parametros activos | 9 000 millones (9B) |
| Longitud de contexto | 128 000 tokens (128K) |
| Tipos de cuantizacion | GGUF; el repositorio distribuye una version cuantizada del modelo BF16, pero no se detallan los niveles incluidos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (modelo base en BF16 safetensors) |

## Arquitectura y entrenamiento

Nemotron 3.5 Bolt 74B-A9B es un modelo de mezcla de expertos (MoE) hibrido orientado al razonamiento, con 74.000 millones de parametros totales y 9.000 millones activos por token. Incorpora modalidad de vision, por lo que procesa texto, imagenes y video. La variante descrita aqui parte del modelo NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 publicado por NVIDIA.

El modelo original se construyo aplicando compresion estructurada sobre el modelo mayor Super 3.5 VL y una cuantizacion nativa a 2 bits, con el objetivo de ajustarlo a 24 GB de memoria y sostener al menos 80 TPS de decodificacion. NVIDIA afirma que esta estrategia (compresion mas cuantizacion agresiva a 2 bits) produce un modelo mejor que alternativas de tamano similar entrenadas desde cero y cuantizadas a 4 bits. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en modo hibrido (hybrid reasoning).
- Procesamiento de vision: entrada de imagenes ademas de texto (pipeline image-text-to-text).
- Procesamiento de video.
- Tool calling / function calling.
- Ejecucion de tareas agénticas y razonamiento multi-paso.
- Ventana de contexto de 128K tokens, adecuada para conversaciones largas y documentos extensos.
- Capacidades multilingues: no disponible (no se detalla el soporte de idiomas).
- Capacidades especiales: razonamiento hibrido y cuantizacion nativa a 2 bits en el modelo original.

## Casos de uso

- Agentes locales en estaciones de trabajo: el modelo esta disenado para caber en 24 GB de memoria y ejecutarse junto a otras aplicaciones, lo que permite desplegar agentes de automatizacion en una unica GPU sin depender de la nube.
- Asistencia sobre documentos e imagenes: gracias a sus 128K tokens de contexto y a la entrada multimodal, puede resumir informes extensos y comentar figuras, capturas o diagramas en una misma conversacion.
- Analisis de video: la capacidad de procesar video permite tareas de descripcion de escenas, resumen de clips o extraccion de informacion en flujos de vigilancia o revision de contenido, ejecutadas en local.
- Automatizacion con tool calling: el soporte de function calling permite conectarlo a APIs internas, bases de datos o sistemas de ticketing para construir asistentes que ejecuten acciones, no solo que generen texto.
- Razonamiento multi-paso en pipelines de datos: su modo de razonamiento hibrido lo hace adecuado para tareas de clasificacion, extraccion estructurada y verificacion encadenada sobre lotes de documentos.
- Atencion al cliente automatizada: la ventana de 128K tokens permite mantener conversaciones multi-turno con historial amplio sin reentrenar ni truncar el contexto.
- Prototipado e investigacion en local: al distribuirse en GGUF con cuantizaciones, es posible evaluar el modelo en hardware de consumo antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado es que el modelo original esta disenado para alcanzar al menos 80 TPS de decodificacion en la configuracion de 24 GB descrita por NVIDIA, cifra que no se puede verificar en esta cuantizacion GGUF.

## Requisitos de hardware

- VRAM estimada: la variante de 2 bits del modelo original esta disenada para caber en 24 GB. Una version BF16 del modelo de 74B requeriria aproximadamente 148 GB solo para los pesos, antes de cache KV y overhead.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para la configuracion de 24 GB y cuantizacion agresiva; A100 80 GB o H100 80 GB para ejecutar el modelo en precision mayor.
- Cabe en GPU de consumo: si, en el caso de la cuantizacion de 2 bits de 24 GB en tarjetas con 24 GB de VRAM (RTX 4090, RTX 3090, RTX 3090 Ti). En la version GGUF distribuida por DevQuasar no se detallan los niveles de cuantizacion, por lo que el encaje depende del nivel elegido.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) por el formato GGUF; vLLM o TGI para despliegues en servidor con el modelo original.
- Latencia y throughput: no disponibles para esta cuantizacion; el modelo base apunta a al menos 80 TPS en la configuracion de 24 GB.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Este repo (DevQuasar GGUF) | 74B (segun nombre) | 9B | 128K | GGUF | no disponible |
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 | 74B | 9B | 128K | BF16 | no disponible |
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB | 74B | 9B | 128K | 2 bits nativa | no disponible |

Alternativas externas de la misma categoria (MoE de gran tamano con vision): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no figura en los metadatos del repositorio, por lo que no se puede confirmar si el uso comercial esta permitido. Conviene verificar la licencia del modelo base de NVIDIA antes de un despliegue en produccion.
- No se detallan los idiomas soportados; el rendimiento en castellano no esta documentado.
- No hay datos de benchmarks, por lo que el rendimiento real de esta cuantizacion GGUF frente al modelo original es desconocido.
- Los metadatos de safetensors del repositorio (842 360 320 parametros) no coinciden con el nombre del modelo (74B), lo que indica una posible inconsistencia en la informacion del repositorio y obliga a verificar los artefactos antes de usarlos.
- Toda cuantizacion introduce perdida de precision; en un modelo comprimido a 2 bits en su origen, una cuantizacion adicional en GGUF puede degradar aun mas la calidad.
- Como cualquier modelo de lenguaje, existe riesgo de alucinacion, especialmente en tareas factibles de verificacion y en contextos largos de 128K tokens.
- El repositorio registra 0 descargas y 0 likes, sin historial de uso conocido, por lo que no hay evidencia de la comunidad sobre su comportamiento.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/DevQuasar/nvidia.NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16-GGUF
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Variante de 24 GB en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Pagina de investigacion de NVIDIA sobre Nemotron 3.5 Bolt 24GB: https://research.nvidia.com/labs/nemotron/Nemotron-3.5-Bolt-24GB/
- Guia de Unsloth para Nemotron 3.5 Bolt: https://unsloth.ai/docs/models/nemotron-3.5-bolt
- Pagina de modelos Nemotron de NVIDIA: https://developer.nvidia.com/topics/ai/nemotron
- Coleccion Nemotron v3 en Hugging Face: https://huggingface.co/collections/nvidia/nvidia-nemotron-v3
- Sitio del autor de la cuantizacion: https://devquasar.com
