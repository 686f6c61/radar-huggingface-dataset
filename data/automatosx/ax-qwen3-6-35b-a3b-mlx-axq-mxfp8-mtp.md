# AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-MXFP8-MTP

## Resumen

AX-Qwen3.6-35B-A3B-MLX-AXQ-MXFP8-MTP es una conversión cuantizada del checkpoint oficial Qwen/Qwen3.6-35B-A3B en formato MLX, publicada por AutomatosX (colecciones AX BI y AX Work) con su toolkit propio AXQuant 2.3.0. No es un modelo nuevo: es un artefacto de empaquetado y compresión de pesos orientado a ejecución en Apple Silicon, que mantiene la arquitectura MoE multimodal del original (etiqueta `qwen3_5_moe`, con torre de visión y módulo MTP de predicción multi-token) y reduce el peso en disco a 38,84 GB mediante MXFP8 de 8 bits con grupo de 32.

La relevancia del artefacto es doble. Por un lado, cuantiza a 8,4658 bits por peso (BPW) las proyecciones de atención, expertos y MLP, dejando en BF16 la visión, los routers, las normas, la cabeza de salida y el payload MTP, lo que permite ejecutar un MoE de ~34.660 millones de parámetros en un Mac Studio sin degradar las partes sensibles. Por otro, el autor lo declara explícitamente como artefacto de desarrollo: no hay certificado Tier 1/Tier 2, ni validación de calidad, ni verificación de aceptación o aceleración de MTP, y las evaluaciones amplias de texto, imagen, vídeo, tool-use y contexto largo no se han realizado.

El resultado es un modelo utilizable para pruebas de generación de texto en MLX-LM, pero no apto todavía como pieza certificada de producción. Conviene leerlo como un paso intermedio de un pipeline de cuantización (AXQuant) más que como un modelo con garantías propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (etiqueta `qwen3_5_moe`), con torre de visión y módulo MTP; pesos en formato MLX |
| Parámetros totales | 34.660.608.768 (34,66 B) |
| Parámetros activos | no disponible en la model card; la nomenclatura del nombre (A3B) sugiere ~3 B activos, sin confirmación documental |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP8 de 8 bits, grupo 32, en proyecciones de atención, expertos y MLP; MXFP8 group32 también en embeddings; BF16 en visión, MTP, routers, normas y cabeza de salida. 8,4658 BPW en el modelo principal y 8,6428 BPW incluyendo MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (se incluye `LICENSE` original y `NOTICE` con los cambios de cuantización) |
| Formato de pesos | safetensors para MLX (`mlx`, `safetensors`), más `mtp.safetensors` como sidecar protegido y payload de visión BF16 separado |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos (MoE) con capacidad multimodal, según la etiqueta `qwen3_5_moe` del repositorio y la presencia de un sidecar de visión en BF16. Sobre esa base, AutomatosX aplica AXQuant 2.3.0: las proyecciones elegibles de atención, expertos y MLP pasan a MXFP8 nativo de MLX con grupo 32, los embeddings se empaquetan igual, y se preservan en BF16 la torre de visión, los routers, las normas, la cabeza de salida y el payload MTP. El autor advierte que la planificación manual es "evidencia previa de arquitectura no medida" y que MXFP8 es un reempaquetado físico explícitamente no medido, no un método de sensibilidad calibrado.

No hay entrenamiento ni ajuste adicional: los pesos de origen no se entrenaron ni aumentaron, y no se usó dato de cuantización de competidores. La procedencia queda atada a la revisión inmutable `995ad96eacd98c81ed38be0c5b274b04031597b0` del checkpoint Qwen3.6-35B-A3B en BF16 y a un `axquant_manifest.json` que vincula ficheros de salida, identidad del origen, plan saneado, ejecución del cuantizador, sidecars protegidos y compatibilidad estática. No se documentan en la información disponible ni el volumen de tokens de entrenamiento original, ni la composición del dataset, ni si hubo RLHF/DPO.

En el plano de innovación, el artefacto incorpora un payload MTP nativo protegido (`mtp.safetensors`), pero el propio autor subraya que su presencia no demuestra ejecución, aceptación, exactitud ni aceleración, y que la ejecución con MTP activado y desactivado no se ha verificado para esta exportación. El ejemplo funcional que se ofrece es generación autorregresiva ordinaria con MLX-LM.

## Capacidades

- Generación de texto conversacional: el ejemplo de la model card usa `apply_chat_template` con `enable_thinking=False`, lo que confirma soporte de plantilla de chat y de un modo de razonamiento conmutable en el tokenizador.
- Inferencia en Apple Silicon mediante MLX-LM; probado con MLX 0.32.1, MLX-LM 0.31.3 y MLX-VLM 0.6.17.
- Capacidad multimodal latente: el repositorio conserva un payload de visión en BF16, pero la carga con el loader estándar de MLX-VLM falló en la prueba del autor, por lo que la generación de imagen no está soportada en esta exportación.
- Predicción multi-token (MTP): módulo presente como sidecar, sin verificación de ejecución ni de aceptación.
- Soporte de tool calling, agentes, multi-step reasoning y contexto largo: no evaluado según la model card ("broad text, image, video, tool-use, long-context, and task-quality evaluations have not been performed").
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Pruebas de humo de generación de texto en Mac: cargar el repositorio completo con `mlx_lm.load` y validar respuestas cortas (por ejemplo, aritmética simple) para comprobar que el payload cuantizado se deserializa correctamente antes de integrarlo en un pipeline mayor.
- Evaluación de la propia cuantización AXQuant: servir como punto de comparación de 8,4658 BPW frente a las variantes de 4 y 6 bits del mismo autor para medir la pérdida de calidad por bit en tareas controladas.
- Desarrollo de aplicaciones locales de asistente en Apple Silicon: al caber en un Mac Studio con memoria unificada alta, permite iterar sobre prompts y plantillas de chat sin depender de una GPU en la nube.
- Validación de infraestructura de despliegue MLX: comprobar versiones de MLX/MLX-LM, comportamiento del tokenizador y del chat template antes de comprometerse con una variante certificada.
- Investigación sobre formatos de cuantización MXFP8 en MLX: el manifiesto y los digests de payload permiten reproducir la conversión y auditar la correspondencia tensor a tensor con el checkpoint BF16.
- Base para experimentos de MTP: el sidecar `mtp.safetensors` permite plantear pruebas de decodificación especulativa, siempre que se asuma que la aceleración no está verificada para este artefacto.
- Referencia de linaje y reproducibilidad: usar la revisión inmutable del modelo base y el `axquant_manifest.json` para auditar la cadena de custodia en entornos de investigación que exigen trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han realizado evaluaciones amplias de texto, imagen, vídeo, tool-use, contexto largo ni calidad de tarea, y que no existe certificado de calidad, de aceptación de MTP ni de velocidad. La única evidencia de ejecución es un `runtime_smoke.json` con versiones de dependencias, respuestas y digests del payload, generado en un Mac Studio M2 Ultra de fábrica.

## Requisitos de hardware

- Peso en disco: 38,841 GB de descarga en safetensors; 38,9 GB de tamaño de repositorio. El modelo principal está a 8,4658 BPW y el conjunto con MTP a 8,6428 BPW.
- Memoria: al no haber cuantización de 4 bits, se necesita memoria unificada por encima de los ~40 GB solo para los pesos, más overhead de contexto y de runtime. El autor advierte que el uso real depende de la carga, el contexto, la entrada de visión y la configuración de ejecución.
- Plataforma: exclusivamente Apple Silicon con MLX. No hay pesos GGUF, no hay soporte CUDA y no se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama.
- Equipos probados: Mac Studio M2 Ultra (entorno de la prueba de humo). Un MacBook Pro con 48 o 64 GB de memoria unificada podría alojar los pesos, pero no está verificado en la información disponible.
- GPUs NVIDIA: no aplicable; este repositorio no ofrece un camino de ejecución para A100, H100 ni RTX 4090.
- Despliegue: MLX-LM 0.31.3 sobre MLX 0.32.1 para texto; MLX-VLM 0.6.17 no carga el sidecar de visión protegido y sin indexar en su loader estándar.
- Latencia y throughput: no disponibles. El autor no publica medidas de velocidad y descarta cualquier certificado de rendimiento para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Qwen3.6-35B-A3B-MLX-AXQ-MXFP8-MTP (este) | 34,66 B totales | no disponible | MXFP8 group32, 8,4658 BPW, 38,84 GB | Apache-2.0 | Artefacto de desarrollo, sin certificados de calidad ni velocidad |
| Qwen/Qwen3.6-35B-A3B (base) | 34,66 B totales | no disponible | BF16 | Apache-2.0 | Checkpoint oficial de origen, revisión `995ad96e`; referencia de calidad sin comprimir |
| AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit-MTP | misma familia | no disponible | 6 bits (AXQuant) | Apache-2.0 | Variante de 6 bits del mismo autor; en índices de terceros aparece etiquetada como Tier 1 / calidad validada |
| AX-Qwen3.6-35B-A3B-MLX-AXQ-4bit-v2-MTP | misma familia | no disponible | 4 bits (AXQuant v2) | Apache-2.0 | Variante de 4 bits, menor huella en disco; útil para comparar pérdida de calidad por bit |
| AX-Qwen3.6-35B-A3B-MLX-4bit-MTP / MLX-6bit-MTP | misma familia | no disponible | 4 y 6 bits en MLX | Apache-2.0 | Exportaciones MLX sin el prefijo AXQ, presumiblemente cuantización estándar de MLX |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada; la comparación se limita a formato, tamaño y nivel de certificación declarado.

## Limitaciones y advertencias

- Artefacto de desarrollo declarado por el autor: sin certificado Tier 1, Tier 2, de calidad, de aceptación de MTP ni de velocidad. Los certificados históricos del autor no vinculan esta exportación y no se reutilizan.
- Visión no operativa por la vía estándar: el loader de MLX-VLM 0.6.17 no cargó el sidecar de visión protegido y sin indexar; el payload BF16 se conserva para una futura exportación explícita. No debe asumirse capacidad de imagen en producción.
- MTP sin verificar: la presencia de `mtp.safetensors` no implica ejecución, aceptación, exactitud ni aceleración; no se ha comprobado el comportamiento con MTP activado frente a desactivado.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de calidad de tarea. Cualquier afirmación de rendimiento sería especulativa.
- Plan de cuantización no medido: el autor califica la planificación manual como evidencia previa de arquitectura no medida y MXFP8 como reempaquetado físico no medido, no como método de sensibilidad calibrado. El BPW incluye suelos de protección y overhead de metadatos, de modo que el nombre del formato no implica precisión uniforme en todos los tensores.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Idiomas y contexto: sin datos declarados; no se puede garantizar comportamiento en castellano ni en ventanas largas.
- Dependencia de plataforma: solo Apple Silicon y MLX. La incompatibilidad con CUDA, vLLM, llama.cpp, Ollama y TGI limita su uso a estaciones Mac y excluye el despliegue en clústeres GPU convencionales.
- Compatibilidad de runtime acotada: los perfiles oMLX/MTPLX siguen sin soporte y la publicación no promueve compatibilidad de runtime ni cualificación nativa de AX Engine.
- Licencia: Apache-2.0 permite uso comercial, pero obliga a conservar avisos y a mantener el `NOTICE` con los cambios de cuantización; conviene revisar la cadena de atribución respecto al checkpoint base.
- Reproducibilidad: para despliegues reales hay que fijar la revisión inmutable del Hub, ya que el repositorio se actualizó un segundo después de su creación y no hay garantía de estabilidad de contenido sin pin.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-MXFP8-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Revisión inmutable del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/tree/995ad96eacd98c81ed38be0c5b274b04031597b0
- Colección AX BI: https://huggingface.co/collections/AutomatosX/ax-bi-6ad54be40f8f1d5415a8d15a
- Colección AX Work: https://huggingface.co/collections/AutomatosX/ax-work-6ad54c25c37f597f21344945
- Variante de 4 bits v2: https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-4bit-v2-MTP
- Variante de 6 bits: https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit-MTP/tree/main
- Variante MLX de 4 bits: https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-4bit-MTP
- Ficha de terceros con especificaciones: https://essamamdani.com/ai-models/hf-automatosx-ax-qwen3-6-35b-a3b-mlx-axq-6bit-mtp
- Índice de terceros con etiquetas de certificación: https://www.aifinder.ae/huggingface.co/automatosx/ax-qwen3.6-35b-a3b-mlx-axq-6bit-mtp/
