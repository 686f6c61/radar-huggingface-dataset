# MichaelAnthony/LFM3-Omni-2B-98K-V2-INT8

## Resumen

LFM3-Omni-2B-98K-V2-INT8 es un checkpoint comunitario publicado por el usuario MichaelAnthony sobre el modelo base LiquidAI/LFM3-Omni-2B de Liquid AI. Se trata de un ajuste fino supervisado (LoRA fusionado en pesos completos) orientado a razonamiento, decision de uso de herramientas (tool-calling), recuperacion tras errores y refinamiento de respuestas finales y tokens de parada. La version V2 parte de la linea `checkpoint424-anti-loop-v19-r3` y termina en el paso 432, con ocho actualizaciones supervisadas adicionales.

El modelo conserva la arquitectura multimodal y de audio nativa del base, con un diseno de atencion hibrido que combina convolucion, atencion completa y cinco capas de atencion deslizante con ventana de 256 tokens. La etiqueta "98K" hace referencia a una configuracion de servicio de 98.304 tokens verificada en el build Q8, aunque el techo de configuracion es de 128.000 posiciones. El autor advierte explicitamente que no se reclama fiabilidad en todas las posiciones de una conversacion de 98K.

Esta publicacion es relevante porque explora el ajuste fino de un modelo pequeno (2.166.928.384 parametros) para flujos de automatizacion con herramientas, un nicho donde los modelos grandes resultan costosos. No obstante, la propia model card reporta que la suite de validacion no mostro mejora agregada sobre el checkpoint padre y que persisten fallos en variantes de prompt, por lo que debe tratarse como un artefacto experimental mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 Omni (transformer hibrido: convolucion, atencion completa y cinco capas de atencion deslizante con ventana de 256 tokens) |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 98.304 tokens en configuracion de servicio verificada para Q8; techo de configuracion de 128.000 posiciones |
| Tipos de cuantizacion | INT8 (W8A16: pesos de 8 bits, activaciones de 16 bits); familia completa en BF16, FP16, FP8, INT8, INT4 y GGUF |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license (etiquetada como "other") |
| Formato de pesos | safetensors con compressed-tensors (custom_code); tambien disponible GGUF en el repo hermano |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LFM3 Omni del base de Liquid AI: un transformer hibrido que intercala capas convolucionales, de atencion completa y de atencion deslizante (cinco capas con ventana de 256 tokens). V2 utiliza el layout de atencion nativo del base, con los ajustes rotatorios y metadatos de atencion exportados preservados; el workaround de conversion a atencion completa de V1 no aplica. Los encoders, proyectores y codec multimodales se conservan intactos, incluido el tokenizador de audio congelado y el codigo de carga personalizado.

El entrenamiento consistio en un ajuste fino supervisado con LoRA de fuerza completa fusionado para inferencia. Partiendo del checkpoint 424, se aplicaron ocho actualizaciones supervisadas con continuacion completa del estado de Adam y una tasa de aprendizaje que decrece de 8e-7 a 2e-7. La mezcla de entrenamiento incluye razonamiento, respuestas visibles, tokens terminales, llamadas a herramientas dependientes, ejemplos de recuperacion, retencion del modelo original y retencion multimodal/habla nativa. El autor especifica que se trata de refinamiento supervisado y no de un resultado de RL. La cuantizacion INT8 es W8A16 con receta incluida en `recipe.yaml`, excluyendo convolucion, encoders, proyectores, decodificador de profundidad y cabeza de salida de los objetivos de cuantizacion. El entorno de construccion fue Transformers 5.21.0, PyTorch 2.13.0+rocm7.1, safetensors 0.8.0, llmcompressor 0.15.0 y compressed-tensors 0.20.1.

## Capacidades

- Generacion de texto y razonamiento con seccion de razonamiento visible cuando el modo thinking esta habilitado.
- Decision de uso de herramientas (tool-calling) con llamadas dependientes y recuperacion tras errores de herramienta.
- Refinamiento de respuesta final y de tokens de parada (terminal stop nativo).
- Capacidades multimodales nativas heredadas del base (encoders, proyectores y codec preservados).
- Capacidades de audio/habla nativas heredadas del base.
- Contexto largo de hasta 98.304 tokens en la configuracion de servicio verificada.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Capacidad de agente multi-paso: parcial, sujeta a las limitaciones de validacion reportadas.

## Casos de uso

- Automatizacion de correo con esquema de herramientas tipo Gmail: el autor valido con el conjunto real de 64 herramientas de Gmail dos casos simulados (buscar destinatario, enviar una vez y finalizar; o reportar fallo permanente de envio sin reintentar). Adecuado por su soporte de tool-calling y tokens de parada, aunque con limitaciones conocidas en variantes de prompt.
- Flujos de agente con recuperacion de errores: el entrenamiento incluye ejemplos de recuperacion y llamadas dependientes, lo que permite encadenar busquedas y acciones con verificacion intermedia en pipelines de automatizacion.
- Procesamiento de documentos largos: con 98.304 tokens de contexto puede ingerir conversaciones o expedientes extensos, si bien el autor no garantiza recuperacion fiable en todas las posiciones.
- Transcripcion y comprension de audio: al conservar el codec y el tokenizador de audio nativos, puede emplearse en tareas de habla heredadas del base.
- Asistentes de escritorio integrados (tipo Raycast): el autor reporto una busqueda de automatizacion de solo lectura que encontro la direccion y finalizo, un escenario de uso realista para busquedas con herramientas.
- Prototipado de agentes en hardware modesto: con 2.166.928.384 parametros y cuantizacion INT8, es viable en GPUs de consumo para experimentacion, aunque la requalificacion en runtime comprimido sigue incompleta.
- Investigacion sobre ajuste fino anti-bucle: util como artefacto de estudio para analizar mitigacion de repeticiones y decision de parada en modelos pequenos.

## Benchmarks y rendimiento

La model card incluye una suite de validacion propia (BF16 nativo, decodificacion greedy, 40 checkpoints de flujo simulados por modelo). No son benchmarks estandar y la validez de la seccion de razonamiento solo comprueba formato y cierre, no calidad.

| Modelo | Decision de tarea correcta | Seccion de razonamiento valida (thinking) | Parada terminal nativa | Texto repetido detectado |
|---|---:|---:|---:|---:|
| Base original sin tocar | 40/40 | 0/20 | 40/40 | 0/40 |
| Checkpoint padre 424 | 33/40 | 19/20 | 40/40 | 0/40 |
| Checkpoint seleccionado 432 | 33/40 | 19/20 | 40/40 | 0/40 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 3,3 GB en INT8; se puede estimar un consumo en torno a 3-4 GB de VRAM para pesos, mas overhead de activaciones y del runtime de compressed-tensors (estimacion no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; el entorno de build uso PyTorch con ROCm 7.1, lo que sugiere compatibilidad con GPUs AMD ademas de NVIDIA.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 2.166.928.384 parametros en INT8; el autor no lo confirma para modelos concretos.
- Opciones de despliegue: runtime que soporte la arquitectura custom LFM3 Omni y el esquema compressed-tensors W8A16; para la variante GGUF se uso llama.cpp b11982. vLLM, TGI u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. El autor advierte que el servicio en produccion en una GPU concreta requiere su propia comprobacion de compatibilidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-98K-V2-INT8 (este) | 2.166.928.384 | 98.304 (techo 128.000) | lfm-open-license | HuggingFace, checkpoint comunitario | Ajuste supervisado anti-bucle; validacion propia sin mejora agregada sobre el padre |
| LiquidAI/LFM3-Omni-2B (base) | no disponible en la informacion | no disponible en la informacion | lfm-open-license | HuggingFace, modelo oficial | Modelo original de Liquid AI; 40/40 en decision de tarea en la suite del autor |
| Checkpoint padre 424 | no disponible en la informacion | no disponible en la informacion | lfm-open-license | HuggingFace (linea del mismo autor) | 33/40 en decision de tarea; 19/20 en validez de razonamiento |
| Alternativas de ~2B con tool-calling | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La suite de validacion del autor no mostro mejora agregada sobre el checkpoint 424 y no reprodujo todos los fallos vistos en un flujo de cliente completo.
- Persisten fallos en variantes de prompt: generacion de razonamiento sin respuesta final, solicitud de direccion en lugar de buscarla, o payloads de correo en bruto malformados.
- F16 y Q8 mostraron resultados distintos en las pruebas; no se garantiza calidad equivalente entre precisiones y cuantizaciones.
- La etiqueta 98K no implica fiabilidad en todas las posiciones de una conversacion larga; los resultados de recuperacion en contexto largo de V1 no se repitieron en todos los formatos de V2.
- La requalificacion completa multimodal, de automatizacion en contexto largo y de runtime comprimido sigue incompleta.
- Riesgo de bucle y de escrituras duplicadas no eliminado segun el propio autor; se recomienda mantener limites a nivel de aplicacion y verificacion de efectos secundarios.
- Para herramientas tipo Gmail, el autor recomienda usar `to`, `subject` y `body` y dejar que el servidor de herramientas realice la codificacion MIME/base64; no rellenar el campo `raw` salvo que ya exista un mensaje pre-codificado valido.
- La configuracion de prueba en Raycast desactiva la reutilizacion de cache de prompt; el comportamiento puede variar con cache activada.
- Licencia lfm-open-license: revisar los terminos del enlace oficial antes de uso comercial, ya que se etiqueta como "other".
- Sesgos conocidos y comportamiento multilingue: no disponibles en la informacion proporcionada.
- El checkpoint es de origen comunitario (0 descargas, 0 likes en el momento de la consulta) y no procede de Liquid AI directamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-INT8
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia LFM Open: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Variante BF16: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-BF16
- Variante FP16: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-FP16
- Variante FP8: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-FP8
- Variante INT4: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-INT4
- Variante GGUF: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-GGUF
