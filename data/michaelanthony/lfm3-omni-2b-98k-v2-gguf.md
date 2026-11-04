# MichaelAnthony/LFM3-Omni-2B-98K-V2-GGUF

## Resumen

LFM3-Omni-2B-98K-V2-GGUF es una cuantizacion en formato GGUF del checkpoint comunitario LFM3-Omni-2B-98K-V2, un ajuste fino supervisado sobre el modelo base LiquidAI/LFM3-Omni-2B de Liquid AI. El autor, MichaelAnthony, ha fusionado pesos LoRA de plena intensidad sobre el checkpoint 432 de la rama `checkpoint424-anti-loop-v19-r3`, incorporando refinamiento supervisado especifico para razonamiento visible, decision de uso de herramientas, recuperacion tras errores, respuesta final y criterios de parada. El modelo base cuenta con 1.728.801.600 parametros segun los safetensors publicados.

La etiqueta "98K" hace referencia a la configuracion de servicio de 98.304 tokens verificada sobre la build Q8, aunque el techo de configuracion del modelo alcanza las 128.000 posiciones. El autor advierte explicitamente de que esta release no garantiza automatizacion fiable en cada posicion de una conversacion de 98K, y que los resultados de recuperacion en contexto largo de la V1 no se han repetido sobre todos los formatos de la V2.

La relevancia de esta ficha radica en que documenta una release comunitaria con validacion publica de sus limites: el propio autor reporta que el checkpoint 432 no mejora agregadamente al checkpoint 424 en su suite de 40 checkpoints simulados y que persisten fallos conocidos en flujos de herramientas tipo Gmail. Es, por tanto, un artefacto util para experimentacion controlada mas que para produccion sin supervision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capa de convolucion, atencion completa y cinco capas de atencion deslizante con ventana de 256 tokens (layout nativo LFM3 Omni) |
| Parametros totales | 1.728.801.600 (1,73 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 98.304 tokens en la configuracion de servicio verificada; techo de configuracion de 128.000 posiciones |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M (GGUF); adicionalmente existen releases BF16, FP16, FP8, INT8 e INT4 en otros repositorios de la familia |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license (license_name: lfm-open-license) |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B emplea una arquitectura hibrida que combina una capa de convolucion, atencion completa y cinco capas de atencion deslizante con ventana de 256 tokens. La V2 preserva el layout de atencion nativo del base, incluyendo los ajustes rotatorios exportados y los metadatos de atencion; el autor indica que el workaround de conversion a atencion completa usado en la V1 no aplica a esta version. El modelo incluye encoders, proyectores y codec multimodal, con un tokenizador de audio congelado y codigo de carga personalizado; la build GGUF incorpora el proyector multimodal correspondiente (`lfm3omni-98k-v2-mmproj.gguf`).

El entrenamiento de esta release parte del checkpoint 424 de la rama `checkpoint424-anti-loop-v19-r3` y aplica ocho actualizaciones supervisadas con continuacion completa del estado de Adam, con tasa de aprendizaje de 8e-7 decreciente hasta 2e-7. La mezcla de entrenamiento incluye razonamiento, respuestas visibles, tokens terminales, llamadas a herramientas dependientes, ejemplos de recuperacion, retencion del modelo original y retencion multimodal/voz nativa. El autor especifica que se trata de refinamiento supervisado y no de un resultado de RL nuevo. El adaptador fuente tiene SHA-256 `6ee09c6841ef2cdcedd30c2f5fc89d62340787b71386b5454b0e999fc577bcaf`. El entorno de build declarado es Transformers 5.21.0, PyTorch 2.13.0+rocm7.1, safetensors 0.8.0, llmcompressor 0.15.0 y compressed-tensors 0.20.1, con verificacion de servicio en llama.cpp b11982.

## Capacidades

- Generacion de texto conversacional en formato multi-turno.
- Razonamiento visible con seccion de pensamiento (thinking mode) habilitable; la validez de formato y cierre de la seccion se comprobo en 19 de 20 casos con thinking activado.
- Decision de uso de herramientas (tool calling / function calling) con esquemas estructurados; en la suite del autor acierta la decision de tarea en 33 de 40 checkpoints simulados.
- Recuperacion tras errores en flujos de herramientas y criterios de parada terminal nativos (40 de 40 en la suite reportada).
- Capacidades multimodales y de voz nativas heredadas del modelo base, con proyector multimodal incluido en la build GGUF.
- Soporte de contexto largo hasta 98.304 tokens en la configuracion verificada, con techo de 128.000 posiciones.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Automatizacion de correo con esquemas de herramientas tipo Gmail: el modelo puede decidir entre buscar el destinatario, enviar una vez y finalizar, o reportar un fallo permanente de envio sin reintentar. El autor valido dos casos simulados completos con el esquema real de 64 herramientas de Gmail, con descripciones de campo estructuradas y sin reutilizacion de cache de prompt.
- Agentes de escritorio con busqueda de solo lectura: en una prueba con Raycast, el modelo localizo una direccion y finalizo la tarea. Es evidencia mas estrecha que un flujo completo de envio, pero ilustra el uso en automatizacion de escritorio con efectos secundarios limitados.
- Asistentes conversacionales de contexto largo: con 98.304 tokens de ventana, adecuado para resumir o razonar sobre documentos extensos, historiales de conversacion prolongados o registros de herramientas, siempre que se validen las posiciones efectivas de recuperacion.
- Prototipado de pipelines de tool calling: la separacion explicita entre decision de tarea, razonamiento visible y respuesta final permite instrumentar y auditar cada fase en un pipeline de CI o de evaluacion.
- Inferencia en hardware modesto: con builds Q3_K_M de 914 MB y Q4_K_M de 1,1 GB, el modelo cabe en GPUs de consumo y en CPU via llama.cpp, lo que lo hace util para pruebas locales de agentes con contexto largo.
- Investigacion sobre comportamiento anti-bucle: la rama `anti-loop` y los criterios de parada terminal documentados sirven para estudiar mitigaciones de repeticion y de escrituras duplicadas en agentes.
- Evaluacion comparativa de cuantizaciones: la familia publica BF16, F16, FP8, INT8, INT4 y GGUF permite medir la degradacion de calidad entre precisiones, aunque el autor advierte que las pruebas de humo estructurales no prueban calidad equivalente.

## Benchmarks y rendimiento

El autor publica una validacion propia sobre BF16 nativo con decodificacion greedy y 40 checkpoints de workflow simulados por modelo. No son benchmarks estandar (MMLU, HumanEval, GSM8K) y no se han publicado resultados de esos benchmarks en la informacion disponible.

| Modelo | Decision de tarea correcta | Seccion de razonamiento valida con thinking | Parada terminal nativa | Texto repetido detectado |
|---|---:|---:|---:|---:|
| Base original sin tocar | 40/40 | 0/20 | 40/40 | 0/40 |
| Checkpoint padre 424 | 33/40 | 19/20 | 40/40 | 0/40 |
| Checkpoint seleccionado 432 | 33/40 | 19/20 | 40/40 | 0/40 |

El autor aclara que la validez de la seccion de razonamiento comprueba formato y cierre, no calidad de razonamiento, y que esta suite pequena no mostro mejora agregada sobre el checkpoint 424 ni reprodujo todos los fallos vistos en un flujo de cliente completo. En la prueba con el esquema real de 64 herramientas de Gmail, la build Q8 supero dos casos simulados completos con las respuestas de herramienta como fixtures, sin envio real de correo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB con Q3_K_M, 1,1 GB con Q4_K_M, 1,3 GB con Q5_K_M, 1,4 GB con Q6_K y 1,8 GB con Q8_0, segun los tamanos de fichero publicados; a ello se suma el proyector multimodal de 950 MB si se usa el modo multimodal.
- El contexto de 98.304 tokens incrementa de forma notable el consumo de memoria KV cache; el autor no publica cifras de memoria total en servicio con contexto maximo.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de pesos, cualquier GPU de consumo con 4 GB o mas de VRAM deberia alojar las cuantizaciones Q4 a Q8, aunque la memoria de contexto puede exceder esa cifra.
- Cabe en GPU de consumo en todas las cuantizaciones publicadas, sujeto al coste adicional de la cache KV en contextos largos.
- Opciones de despliegue: llama.cpp (verificado con build b11982), con soporte requerido de LFM3 Omni y multimodal-pr; los endpoints son compatibles segun los tags del repositorio. Otras opciones como vLLM, Ollama o TGI no estan confirmadas en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-98K-V2-GGUF | 1,73 mil millones | 98.304 tokens verificados (techo 128.000) | lfm-open-license | GGUF en HuggingFace; familia BF16/F16/FP8/INT8/INT4 | Checkpoint comunitario con validacion propia publicada |
| LiquidAI/LFM3-Omni-2B (base) | 1,73 mil millones | no disponible | lfm-open-license | Pesos nativos en HuggingFace | Base oficial; 40/40 en decision de tarea pero 0/20 en seccion de razonamiento valida segun la suite del autor |
| Checkpoint padre 424 (misma rama) | 1,73 mil millones | no disponible | lfm-open-license | Repositorio de la familia V2 | Mismo rendimiento agregado que el 432 en la suite del autor |

No se dispone de datos de benchmarks estandar ni de comparaciones con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que la V2 no elimina el riesgo de bucles ni de escrituras duplicadas; la rama `anti-loop` mitiga pero no garantiza el comportamiento.
- La suite de validacion es pequena (40 checkpoints simulados) y no mostro mejora agregada sobre el checkpoint 424; no reproduce todos los fallos observados en un flujo de cliente completo.
- Persisten fallos conocidos en variantes de prompt: generacion de razonamiento sin respuesta final, solicitud de direccion en lugar de busqueda, o emision de payloads de correo en bruto malformados. F16 y Q8 mostraron resultados distintos.
- La etiqueta 98K no implica recuperacion fiable en todas las posiciones de una conversacion de 98K; los resultados de contexto largo de la V1 no se han repetido sobre todos los formatos de la V2.
- La validacion multimodal completa, la automatizacion en contexto largo y la recalificacion en runtime comprimido quedan incompletas segun el autor.
- Las pruebas de humo de formato y carga no prueban calidad equivalente entre precisiones o cuantizaciones.
- Para herramientas tipo Gmail, el autor recomienda describir y usar `to`, `subject` y `body`, dejar que el servidor de herramientas realice la codificacion MIME/base64 y no rellenar el campo opcional `raw` salvo que el llamador ya tenga un mensaje pre-codificado valido.
- La ejecucion de herramientas debe mantener limites y verificacion a nivel de aplicacion para efectos secundarios.
- Licencia lfm-open-license: consultar los terminos del enlace oficial para restricciones de uso comercial; no se detallan en la informacion proporcionada.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Release BF16: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-BF16
- Release FP16: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-FP16
- Release FP8: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-FP8
- Release INT8: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-INT8
- Release INT4: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-INT4
