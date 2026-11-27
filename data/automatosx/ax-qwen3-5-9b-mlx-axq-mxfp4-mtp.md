# AutomatosX/AX-Qwen3.5-9B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Qwen3.5-9B-MLX-AXQ-MXFP4-MTP es una conversión cuantizada del checkpoint oficial Qwen/Qwen3.5-9B en formato BF16, publicada por AutomatosX mediante su toolkit propietario AXQuant (versión 2.3.0). El modelo resultante está empaquetado para MLX, el framework de Apple para ejecución de modelos en silicio de la compañía, y emplea una mezcla de precisiones: MXFP4 nativo de MLX (grupo 32) para las proyecciones de atención y MLP elegibles, BF16 para visión, MTP, normalizaciones y cabeza de salida, y empaquetado afín de 8 bits para los embeddings.

El artefacto no es un modelo entrenado desde cero, sino una reponderación del modelo base de Qwen con fines de eficiencia en memoria y almacenamiento. Ocupa 8,255 GB en safetensors, con 6,6044 bits por peso (BPW) para el modelo principal y 6,8412 BPW incluyendo el payload MTP. Conserva la licencia Apache-2.0 del original y mantiene intactas las capacidades del modelo base, aunque el propio autor lo etiqueta explícitamente como artefacto de desarrollo, sin certificados de calidad, aceptación MTP ni velocidad.

Su relevancia es doble: por un lado, demuestra el estado actual de las técnicas de cuantización post-entrenamiento aplicadas a modelos de ~9.400 millones de parámetros para ejecución local en Apple Silicon; por otro, expone con transparencia documental (manifiestos, smoke tests, avisos de reconstrucción) las limitaciones de un pipeline de cuantización todavía en maduración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B), cuantizado con AXQuant 2.3.0; incluye payload MTP y sidecar de visión |
| Parametros totales | 9.409.812.208 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 grupo 32 (atención y MLP elegibles), BF16 (visión, MTP, normas, cabeza de salida), 8 bits afín grupo 32 (embeddings); 6,6044 BPW principal / 6,8412 BPW total con MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (empaquetado para MLX); 8,255 GB de descarga |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer de 9.400 millones de parámetros aproximadamente, desarrollado por el equipo Qwen. Sobre él, AXQuant aplica una planificación de cuantización que asigna precisiones distintas por tipo de tensor: MXFP4 nativo de MLX con grupo de 32 para las proyecciones de atención y MLP que cumplen los criterios del plan, BF16 para los componentes sensibles (visión, MTP, normalizaciones y cabeza de salida) y empaquetado afín de 8 bits para los embeddings. El resultado son 6,6044 BPW medidos sobre los ficheros serializados, cifra que incluye suelos de protección y sobrecarga de metadatos; el nombre del formato no implica que todos los tensores compartan precisión.

No se ha realizado entrenamiento ni aumento de los pesos fuente: la conversión es puramente post-entrenamiento y no se emplearon datos de cuantizaciones competidoras. El paquete incluye un payload MTP protegido (`mtp.safetensors`), pero su mera presencia no demuestra ejecución, aceptación, exactitud ni aceleración; el autor indica que la ejecución MTP on/off no ha sido verificada para este artefacto y que el ejemplo de MLX-LM usa generación autorregresiva ordinaria. La planificación manual se describe como evidencia previa a la arquitectura no medida, y MXFP8 como repacking físico explícito no medido.

## Capacidades

- Generación de texto conversacional mediante MLX-LM, con plantilla de chat y soporte del flag `enable_thinking` para activar o desactivar el modo de razonamiento del modelo base.
- Razonamiento y matemáticas heredados del modelo Qwen3.5-9B (la model card solo verifica un caso acotado de generación de texto, no capacidades amplias).
- Visión: el payload BF16 de visión se conserva como sidecar separado, pero el cargador estándar de MLX-VLM no lo carga; la generación de imágenes no está soportada por esta exportación a través del loader por defecto.
- MTP (multi-token prediction): payload presente pero sin verificación de ejecución ni aceleración.
- Tool calling y function calling: presumiblemente heredados del modelo base, si bien no se han realizado evaluaciones de uso de herramientas según la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Contexto largo: no se han realizado evaluaciones de contexto largo según el autor.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: cargar el repositorio completo con MLX-LM 0.31.3 o superior sobre MLX 0.32.1 permite ejecutar generación de texto conversacional en un Mac Studio M2 Ultra, aprovechando el empaquetado MXFP4 para reducir el consumo de memoria frente al BF16 original.
- Prototipado de asistentes conversacionales en escritorio: la plantilla de chat con `enable_thinking=False` permite respuestas directas de bajo coste para iterar sobre prompts e interfaces sin depender de APIs externas.
- Evaluación de pipelines de cuantización: el manifiesto `axquant_manifest.json`, el `runtime_smoke.json` y el `axquant_compatibility.json` sirven como referencia reproducible para ingenieros que diseñan sus propios flujos de cuantización post-entrenamiento.
- Reproducibilidad de experimentos: fijar la revisión inmutable del Hub permite desplegar exactamente el mismo payload en distintas máquinas Apple para comparar latencia y uso de memoria con configuraciones de runtime variables.
- Investigación sobre MTP: el payload `mtp.safetensors` protegido permite a investigadores experimentar con decodificación multi-token, siempre que validen por su cuenta la ejecución y la aceptación, dado que el autor no las certifica.
- Base para futuras exportaciones de visión: el sidecar BF16 de visión se conserva para una exportación explícita de runtime futura, por lo que equipos interesados en pipelines multimodales pueden reutilizarlo cuando exista soporte de carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han realizado evaluaciones amplias de texto, imagen, vídeo, uso de herramientas, contexto largo ni calidad de tareas, y que el smoke test solo establece los casos concretos de carga y generación probados.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio completo pesa 8,255 GB en safetensors; el consumo real en ejecución depende de la carga del modelo, el contexto, la entrada de visión y los ajustes de runtime, según advierte el autor.
- Plataforma: exclusivamente Apple Silicon con MLX (probado en Mac Studio M2 Ultra); no es un formato portable a CUDA sin reconversión.
- GPU recomendadas: no disponible para GPU NVIDIA/AMD; el artefacto está empaquetado para MLX y no se ha validado en otras plataformas.
- ¿Cabe en consumer GPU? No aplica en el sentido habitual: está pensado para memoria unificada de Mac. En Apple Silicon, el tamaño de 8,3 GB del repo sugiere que podría caber en equipos con al menos 16 GB de memoria unificada, aunque el autor no lo certifica.
- Opciones de despliegue: MLX-LM 0.31.3 (verificado), MLX 0.32.1; MLX-VLM 0.6.17 intentado sin éxito para visión. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| AX-Qwen3.5-9B-MLX-AXQ-MXFP4-MTP | 9.409.812.208 | no disponible | MXFP4/BF16/8-bit afín (6,60 BPW) | Apache-2.0 | MLX (Apple Silicon) |
| Qwen/Qwen3.5-9B (base) | ~9,4 B | no disponible | BF16 | Apache-2.0 | Multiplataforma |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | ~9,4 B | no disponible | 4-8 bits | Apache-2.0 | llama.cpp, vLLM, etc. |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de desarrollo: el autor declara explícitamente que no cuenta con certificados Tier 1, Tier 2, de calidad, de aceptación MTP ni de velocidad; debe tratarse como evidencia de desarrollo, no como certificado de calidad.
- Reconstrucción pendiente: existe un aviso de que el paquete será reconstruido con un toolkit AXQuant mejorado y reemplazado por una nueva revisión; los ficheros actuales quedan en el historial, por lo que conviene fijar un commit si se depende de ellos.
- Visión no operativa: el cargador estándar de MLX-VLM no carga el sidecar de visión protegido y no indexado; la generación de imágenes no está soportada por esta exportación.
- MTP no verificado: la presencia de `mtp.safetensors` no implica ejecución, aceptación, exactitud ni aceleración; no se ha comprobado MTP on/off.
- Evaluaciones ausentes: no se han realizado pruebas amplias de texto, imagen, vídeo, uso de herramientas, contexto largo ni calidad de tareas.
- Idiomas y contexto: no disponibles en la información proporcionada; no se puede confirmar cobertura multilingüe ni longitud de ventana.
- Sesgos y alucinaciones: no documentados en la información disponible; al heredar el comportamiento del modelo base, persisten los riesgos habituales de generación no verificada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el `NOTICE` identifica cambios de cuantización que deben conservarse; las certificaciones históricas no cubren esta nueva exportación.
- Portabilidad: el formato MLX limita el despliegue a Apple Silicon; no hay evidencia de funcionamiento en CUDA u otras plataformas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AutomatosX/AX-Qwen3.5-9B-MLX-AXQ-MXFP4-MTP)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a)
- [Colección AX BI](https://huggingface.co/collections/AutomatosX/ax-bi-6ad54be40f8f1d5415a8d15a)
- [Colección AX Work](https://huggingface.co/collections/AutomatosX/ax-work-6ad54c25c37f597f21344945)
