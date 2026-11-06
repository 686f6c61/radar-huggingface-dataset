# MichaelAnthony/LFM3-Omni-2B-98K-V2-FP16

## Resumen

LFM3-Omni-2B-98K-V2-FP16 es un checkpoint comunitario publicado por el usuario MichaelAnthony sobre el modelo base LiquidAI/LFM3-Omni-2B de Liquid AI. Se trata de un ajuste fino mediante LoRA de fuerza completa cuyos pesos se han fusionado para inferencia, orientado a extender el contexto operativo hasta 98.304 tokens (con un techo de configuracion de 128.000 posiciones) y a refinar el comportamiento de razonamiento supervisado, decision de uso de herramientas, recuperacion tras errores, respuesta final y parada.

El modelo conserva la arquitectura nativa multimodal del base, con una disposicion de atencion que combina convolucion, atencion completa y cinco capas de atencion deslizante con ventana de 256 tokens, ademas de los encoders, proyectores y codec de audio originales. Con 2.166.928.384 parametros (~2,17 mil millones) en precision FP16, ocupa aproximadamente 4,5 GB en el repositorio, lo que lo situa en el rango de modelos pequenos desplegables en GPU de consumo.

La relevancia de esta ficha es acotada y debe interpretarse con cautela: el propio autor declara que la suite de validacion de 40 checkpoints simulados no mostro mejora agregada sobre el checkpoint padre (checkpoint424) y que los resultados de recuperacion en contexto largo de la version V1 no se han repetido para todos los formatos de V2. Es, por tanto, un artefacto experimental de la comunidad, no una release oficial de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal nativo de LFM3 (convolucion + atencion completa + cinco capas de atencion deslizante con ventana de 256 tokens) |
| Parametros totales | 2.166.928.384 (~2,17 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | Configuracion de servicio verificada de 98.304 tokens; techo de configuracion de 128.000 posiciones |
| Tipos de cuantizacion | BF16, FP16, FP8, INT8, INT4, GGUF (familias de release separadas) |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (FP16); GGUF disponible en repositorio hermano |

## Arquitectura y entrenamiento

El checkpoint parte de LiquidAI/LFM3-Omni-2B y aplica un ajuste fino supervisado sobre la rama `checkpoint424-anti-loop-v19-r3`, produciendo el checkpoint 432. El ultimo refinamiento consiste en ocho actualizaciones supervisadas desde checkpoint424 con continuacion completa del estado de Adam, tasa de aprendizaje de 8e-7 decreciente hasta 2e-7. El autor especifica explicitamente que esta rama seleccionada de ocho actualizaciones es refinamiento supervisado y no un resultado nuevo de RL. El adaptador de origen tiene SHA-256 `6ee09c6841ef2cdcedd30c2f5fc89d62340787b71386b5454b0e999fc577bcaf`.

La mezcla de entrenamiento incluye ejemplos de razonamiento, respuestas visibles, tokens terminales, llamadas a herramientas dependientes, ejemplos de recuperacion, retencion del modelo original y retencion multimodal/nativa de voz. Los encoders, proyectores y codec se preservan intactos, y los repositorios nativos incluyen el tokenizador de audio congelado y codigo de carga personalizado. V2 utiliza la disposicion de atencion nativa (convolution, full attention y cinco capas sliding-attention con ventana de 256 tokens), a diferencia del workaround de conversion a atencion completa empleado en V1. Los ajustes rotatorios exportados y los metadatos de atencion se conservan del base seleccionado.

El entorno de compilacion declarado es Transformers 5.21.0, PyTorch 2.13.0+rocm7.1, safetensors 0.8.0, llmcompressor 0.15.0 y compressed-tensors 0.20.1; las comprobaciones de servicio GGUF usan llama.cpp b11982.

## Capacidades

- Generacion de texto y razonamiento supervisado con modo de pensamiento (thinking) habilitable; el autor valida que la seccion de razonamiento se formatea y cierra correctamente en 19 de 20 casos con thinking activado.
- Decision de uso de herramientas (tool calling) y llamadas dependientes, con ejemplos de seleccion de tarea correcta en 33 de 40 checkpoints de workflow simulados.
- Recuperacion tras fallos de herramienta y refinamiento de respuesta final, incluyendo ejemplos de recuperacion en la mezcla de entrenamiento.
- Parada terminal nativa: 40 de 40 casos en la suite del autor.
- Capacidades multimodales nativas heredadas del base LFM3-Omni, incluyendo procesamiento de audio mediante tokenizador y codec preservados.
- Soporte de contexto largo configurado a 98.304 tokens, con techo de 128.000 posiciones (sin garantia de fiabilidad en todas las posiciones).
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de correo electronico con esquemas de herramientas estilo Gmail: el autor probo el build Q8 con el conjunto real de 64 herramientas de Gmail y un caso simuladode busqueda y envio unico; adecuado por el refinamiento de decision de herramienta y parada terminal, aunque con limitaciones documentadas en variantes de prompt.
- Asistentes con contexto largo en flujos de recuperacion documental: la configuracion de 98.304 tokens permite mantener conversaciones o documentos extensos en una sola ventana, si bien el autor advierte que la recuperacion fiable en todas las posiciones no esta garantizada.
- Pipelines de agentes multi-paso con llamadas a herramientas dependientes: el modelo incorpora ejemplos de tool-decision y recovery, lo que lo hace util para orquestaciones donde una llamada depende del resultado de la anterior.
- Prototipado de interfaces multimodales con audio: al preservar encoders, proyectores y codec nativos, puede emplearse en experimentos de transcripcion o interaccion por voz, aunque la recalificacion multimodal completa esta pendiente segun el autor.
- Evaluacion comparativa de variantes de cuantizacion: la familia de releases (BF16, FP16, FP8, INT8, INT4, GGUF) permite medir diferencias de comportamiento entre precisiones, algo que el autor documenta como relevante porque F16 y Q8 mostraron resultados distintos.
- Despliegue en entornos de recursos limitados: con ~2,17 B parametros y 4,5 GB en FP16, es candidato para inferencia en GPU de consumo o en CPU via GGUF para tareas de razonamiento acotado y tool calling simple.
- Investigacion sobre mitigacion de bucles y duplicacion de escrituras: la rama `anti-loop` y las metricas de texto repetido (0 de 40 en todos los modelos comparados) lo convierten en un artefacto de estudio para analizar riesgo de repeticion y escrituras duplicadas.

## Benchmarks y rendimiento

El autor publica una validacion propia (BF16 nativo, decodificacion greedy, 40 checkpoints de workflow simulados por modelo), que no constituye un benchmark estandar:

| Modelo | Decision de tarea correcta | Seccion de razonamiento valida con thinking | Parada terminal nativa | Texto repetido detectado |
|---|---:|---:|---:|---:|
| Base original sin tocar | 40/40 | 0/20 | 40/40 | 0/40 |
| Checkpoint padre (424) | 33/40 | 19/20 | 40/40 | 0/40 |
| Checkpoint seleccionado (432) | 33/40 | 19/20 | 40/40 | 0/40 |

El autor indica que esta suite pequena no mostro mejora agregada sobre checkpoint424 y no reprodujo todos los fallos observados en un workflow cliente completo. La validacion de la seccion de razonamiento comprueba formato y cierre, no calidad del razonamiento. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 4,5 GB solo para pesos, mas overhead de activaciones y cache KV; con 98.304 tokens de contexto la cache KV crece de forma significativa y excede con facilidad GPU de consumo.
- VRAM estimada en INT8/INT4 y GGUF: reduccion proporcional al tamano de pesos (del orden de 2,2 GB y 1,1 GB respectivamente solo para pesos), sujeta a overhead adicional.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el modelo es compatible con GPU de consumo modernas en precisiones comprimidas, pero el contexto de 98K exige memoria adicional considerable.
- Cabe en GPU de consumo: probablemente en FP16 para contextos cortos; para contexto largo se requiere verificar empiricamente, dato no disponible.
- Opciones de despliegue: Transformers (clase `AutoModelForMultimodalLM` con `trust_remote_code=True`), llama.cpp b11982 para GGUF; vLLM, TGI y Ollama no estan confirmados en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-98K-V2-FP16 (este) | ~2,17 B | 98.304 configurado (techo 128.000) | lfm-open-license | Hugging Face, 0 descargas | Checkpoint comunitario con LoRA fusionado; validacion propia limitada |
| LiquidAI/LFM3-Omni-2B (base) | ~2,17 B (no verificado en esta ficha) | no disponible | lfm-open-license | Hugging Face oficial | Modelo original de Liquid AI; sin el ajuste de contexto largo ni refinamiento de tool calling |
| Checkpoint424 (padre de la rama) | ~2,17 B | no disponible | lfm-open-license | No distribuido como repo publico segun la informacion | Mismo rendimiento agregado que 432 en la suite del autor |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que la suite de validacion no mostro mejora agregada sobre checkpoint424; no debe presentarse como una mejora de rendimiento demostrada.
- Los resultados de recuperacion en contexto largo de V1 no se han repetido en todos los formatos de V2; la fiabilidad en las 98.304 posiciones no esta garantizada.
- Variantes de prompt fallaron en pruebas con Gmail: razonamiento sin respuesta final, solicitud de direccion en lugar de busqueda, o payloads de correo malformados. F16 y Q8 mostraron resultados distintos.
- No hay garantia de que el riesgo de bucle o de escritura duplicada este eliminado.
- Requiere `trust_remote_code=True` y revision del codigo personalizado antes de habilitarlo; implica riesgo de seguridad en produccion.
- Las comprobaciones estructurales de exportacion y las pruebas simples de generacion no demuestran igual calidad entre precisiones o cuantizaciones.
- La recalificacion completa multimodal, de automatizacion en contexto largo y de runtime comprimido esta incompleta segun el autor.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; los fallos de prompt documentados sugieren fragilidad en flujos de herramientas.
- Restricciones de licencia: lfm-open-license; deben revisarse los terminos en el enlace de licencia del base antes de uso comercial.
- Para herramientas estilo Gmail, el autor recomienda usar `to`, `subject` y `body` y dejar que el servidor de herramientas realice la codificacion MIME/base64; dejar `raw` sin definir salvo que el llamador ya tenga un mensaje pre-codificado valido.
- La ejecucion de herramientas debe mantener limites y verificacion a nivel de aplicacion para efectos secundarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-FP16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia del base: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Release BF16: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-BF16
- Release FP8: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-FP8
- Release INT8: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-INT8
- Release INT4: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-INT4
- Release GGUF: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-GGUF
