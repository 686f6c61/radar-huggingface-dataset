# MichaelAnthony/LFM3-Omni-2B-98K-V2-FP8

## Resumen

LFM3-Omni-2B-98K-V2-FP8 es un checkpoint comunitario derivado de LiquidAI/LFM3-Omni-2B, el modelo omni (texto, vision y audio) de 2.166.928.384 parametros desarrollado por Liquid AI. Esta version concreta, publicada por el usuario MichaelAnthony, incorpora pesos LoRA fusionados para inferencia y una refinacion supervisada orientada a razonamiento, decision de uso de herramientas, recuperacion ante errores, respuesta final y control de parada. Se distribuye como exportacion FP8_DYNAMIC mediante compressed-tensors, con un peso de repositorio de 3,3 GB.

El modelo se presenta como una configuracion de servicio de 98.304 tokens (etiqueta "98K"), aunque el techo arquitectonico declarado es de 128.000 posiciones. La arquitectura conserva el layout nativo de atencion de LFM3 Omni: capas convolucionales, atencion completa y cinco capas de atencion deslizante con ventana de 256 tokens. Esto lo situa en la categoria de modelos hibridos ligeros con contexto largo, pensados para automatizacion de flujos con tool calling.

Su relevancia actual es doble: por un lado, demuestra el ecosistema de refinamiento comunitario sobre modelos abiertos de Liquid AI; por otro, expone con transparencia sus propias limitaciones de validacion (33/40 decisiones correctas en una suite de 40 checkpoints simulados), lo que lo convierte en un caso interesante para evaluar riesgos de produccion en agentes con efectos secundarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido LFM3 Omni: capas convolucionales, atencion completa y cinco capas de atencion deslizante con ventana de 256 tokens; multimodal (texto, vision, audio) con encoders, proyectores y codec preservados |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 98.304 tokens de configuracion de servicio verificada; techo arquitectonico de 128.000 posiciones |
| Tipos de cuantizacion | FP8_DYNAMIC (pesos FP8 con escalado dinamico de activaciones); familia completa disponible en BF16, FP16, FP8, INT8, INT4 y GGUF |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license (other) |
| Formato de pesos | safetensors con compressed-tensors y custom_code; variante GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-Omni-2B, un transformer hibrido que combina capas convolucionales con atencion completa y cinco capas de atencion deslizante de 256 tokens. Esta mezcla reduce el coste de atencion en secuencias largas manteniendo capacidad de recuperacion local. La exportacion FP8_DYNAMIC excluye de la cuantizacion la convolucion, los encoders, los proyectores, el decodificador de profundidad y la cabeza de salida, segun el recipe.yaml incluido. El checkpoint V2 preserva el layout de atencion nativo y los metadatos rotatorios del modelo base, sin el workaround de conversion a atencion completa que usaba V1.

El entrenamiento de esta version consiste en la fusion de pesos LoRA de fuerza completa y ocho actualizaciones supervisadas desde el checkpoint 424 (rama `checkpoint424-anti-loop-v19-r3`), con continuacion completa del estado de Adam y una tasa de aprendizaje que decae de 8e-7 a 2e-7. La mezcla de entrenamiento incluye razonamiento, respuestas visibles, tokens terminales, llamadas a herramientas dependientes, ejemplos de recuperacion, retencion del modelo original y retencion multimodal/nativa de voz. El autor especifica explicitamente que se trata de refinamiento supervisado, no de un resultado de RL. El adaptador de origen tiene SHA-256 `6ee09c6841ef2cdcedd30c2f5fc89d62340787b71386b5454b0e999fc577bcaf`.

## Capacidades

- Generacion de texto y razonamiento con seccion de pensamiento visible cuando se habilita thinking mode.
- Tool calling y function calling, con enfasis en decisiones de uso de herramientas, llamadas dependientes y recuperacion ante fallos.
- Razonamiento multi-paso y control de parada mediante tokens terminales nativos.
- Capacidades multimodales nativas: vision y audio, con encoders, proyectores y codec preservados del modelo base.
- Retencion de voz nativa y de comportamiento del modelo original segun la mezcla de entrenamiento declarada.
- Soporte de contexto largo hasta 98.304 tokens en la configuracion verificada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Automatizacion de correo con esquemas de herramientas tipo Gmail: el modelo fue probado con el conjunto real de 64 herramientas de Gmail y un flujo simulado de busqueda de destinatario, envio unico y finalizacion, o reporte de fallo permanente sin reintento. Adecuado por su entrenamiento especifico en decision de herramientas y recuperacion, aunque con las cautelas de validacion indicadas.
- Agentes de automatizacion en escritorio (tipo Raycast): se reporto una busqueda de solo lectura que encontro la direccion y finalizo correctamente. Util para tareas de consulta sin efectos secundarios, donde el riesgo de escritura duplicada no aplica.
- Asistentes con contexto largo: la ventana de 98.304 tokens permite mantener conversaciones o documentos extensos en memoria, util para analisis de expedientes, resumenes de reuniones o revision de codigo en un solo pase.
- Procesamiento multimodal ligero: al conservar encoders de vision y audio, puede emplearse en tareas de descripcion de imagenes, transcripcion o analisis de audio en entornos con recursos limitados (2,1B parametros en FP8, 3,3 GB de repositorio).
- Pipelines de agentes con verificacion humana: su mezcla de entrenamiento incluye ejemplos de recuperacion y parada, lo que lo hace candidato para flujos donde se requiere confirmacion antes de acciones irreversibles.
- Despliegue en hardware consumer: al ser un modelo de 2,1B en FP8, cabe en GPUs de gama media, lo que permite prototipado local de agentes con tool calling antes de escalar a modelos mayores.
- Evaluacion comparativa de cuantizaciones: la familia publica BF16, FP16, FP8, INT8, INT4 y GGUF permite estudiar el impacto de la precision en calidad de razonamiento y tool calling, aunque el autor advierte que las pruebas estructurales no garantizan calidad equivalente.

## Benchmarks y rendimiento

El autor publica una suite de validacion propia (BF16 nativo, decodificacion greedy, 40 checkpoints de flujo simulados por modelo). No son benchmarks estandar y no deben compararse con MMLU, HumanEval o GSM8K.

| Modelo | Decision de tarea correcta | Seccion de razonamiento valida con thinking | Parada terminal nativa | Texto repetido detectado |
|---|---:|---:|---:|---:|
| Base original sin tocar | 40/40 | 0/20 | 40/40 | 0/40 |
| Checkpoint padre 424 | 33/40 | 19/20 | 40/40 | 0/40 |
| Checkpoint seleccionado 432 (V2) | 33/40 | 19/20 | 40/40 | 0/40 |

El autor indica que la suite no mostro mejora agregada sobre el checkpoint 424 y no reprodujo todos los fallos observados en un flujo de cliente completo. La validez de la seccion de razonamiento comprueba formato y cierre, no calidad de razonamiento. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB solo para pesos en FP8; con overhead de runtime, KV cache y proyectores multimodales, el consumo real sera superior (no se proporciona cifra oficial).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una GPU consumer con 8-12 GB de VRAM deberia poder alojar el modelo en FP8, pero no hay validacion publicada.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 2,1B parametros y 3,3 GB de repositorio, aunque no se confirma en la model card.
- Opciones de despliegue: el runtime debe soportar la arquitectura custom LFM3 Omni y el esquema compressed-tensors FP8_DYNAMIC. La variante GGUF se valido con llama.cpp b11982. No se mencionan vLLM, TGI ni Ollama.
- Entorno de construccion probado: Transformers 5.21.0, PyTorch 2.13.0+rocm7.1, safetensors 0.8.0, llmcompressor 0.15.0 y compressed-tensors 0.20.1. Otras combinaciones requieren su propia comprobacion de compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-98K-V2-FP8 (este) | 2.166.928.384 | 98.304 servicio / 128.000 techo | lfm-open-license | HuggingFace, comunidad | Refinamiento supervisado con LoRA fusionado; FP8_DYNAMIC |
| LiquidAI/LFM3-Omni-2B (base) | 2.166.928.384 | no disponible en la informacion | lfm-open-license | HuggingFace, oficial | Modelo original multimodal de Liquid AI |
| Checkpoint padre 424 (V1 lineage) | 2.166.928.384 | no disponible | lfm-open-license | HuggingFace, comunidad | 33/40 en la suite del autor; mismo resultado que V2 |
| Otras alternativas de ~2B multimodal | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de modelos comparables en la informacion |

## Limitaciones y advertencias

- El propio autor declara que V2 no elimina el riesgo de bucles ni de escrituras duplicadas; es un refinamiento supervisado, no un resultado de RL.
- En la suite de validacion, V2 no mejoro agregadamente al checkpoint 424 (33/40 en ambos) y no reprodujo todos los fallos de un flujo de cliente real.
- Variantes de prompt fallaron: razonamiento sin respuesta final, peticion de direccion en lugar de buscarla, o payloads de correo en bruto malformados.
- F16 y Q8 mostraron resultados distintos en las pruebas; la calidad no es necesariamente equivalente entre precisiones y cuantizaciones.
- La validacion multimodal completa, la automatizacion con contexto largo y la recalificacion en runtime comprimido quedan incompletas segun el autor.
- Para herramientas tipo Gmail, se recomienda describir y usar `to`, `subject` y `body`, dejar que el servidor de herramientas realice la codificacion MIME/base64 y no establecer el campo opcional `raw` salvo que el llamador ya tenga un mensaje pre-codificado valido.
- La configuracion de prueba en Raycast desactiva la reutilizacion de cache de prompt; no se garantiza el mismo comportamiento con cache activada.
- La ejecucion de herramientas debe mantener limites a nivel de aplicacion y verificacion de efectos secundarios.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion; los fallos de prompt documentados sugieren cautela en flujos autonomos.
- Idiomas soportados: no disponibles.
- Licencia lfm-open-license: es necesario revisar los terminos del enlace oficial para uso comercial; la model card la etiqueta como "other".
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; es un artefacto comunitario sin validacion independiente.
- El repositorio excluye datos privados de correo, perfiles de Raycast, ficheros de autenticacion, estado del optimizador y logs privados de entrenamiento.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-FP8
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Variante BF16: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-BF16
- Variante FP16: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-FP16
- Variante INT8: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-INT8
- Variante INT4: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-INT4
- Variante GGUF: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-GGUF
- Liquid AI: https://www.liquid.ai/
