# AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Qwen3.6-35B-A3B-MLX-AXQ-MXFP4-MTP es una conversión cuantizada del checkpoint oficial Qwen3.6-35B-A3B en formato BF16, publicada por AutomatosX mediante su toolkit AXQuant 2.3.0. El modelo base es un transformer de tipo mixture-of-experts (MoE) desarrollado por Qwen (Alibaba), con 35.107.180.016 parámetros totales, y esta conversión lo adapta al ecosistema MLX de Apple Silicon usando cuantización MXFP4 con grupos de 32 elementos en las proyecciones de atención, expertos y MLP.

El objetivo de esta publicación es ofrecer una versión de ~22 GB (4,6460 bits por peso en el modelo principal, 4,9127 BPW incluyendo el payload MTP) que pueda ejecutarse en equipos Apple Silicon mediante MLX-LM, reduciendo el peso del checkpoint BF16 original. La conversión preserva en BF16 la visión, el módulo MTP, los routers, las normas y la cabeza de salida, y empaqueta los embeddings con cuantización afín de 8 bits.

Es importante señalar que el propio autor califica este artefacto como "development evidence, not a quality certificate": no dispone de certificados de calidad Tier 1/Tier 2, ni de aceptación de MTP, ni de velocidad. La model card anuncia además una reconstrucción futura del paquete con un toolkit AXQuant mejorado, por lo que los ficheros actuales deben fijarse por commit si se van a usar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), conversión MLX con cuantización AXQuant |
| Parametros totales | 35.107.180.016 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 group32 (atención, expertos, MLP), embeddings 8-bit affine group32, BF16 (visión, MTP, routers, norms, output head) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 22,1 GB; 4,6460 BPW modelo principal, 4,9127 BPW con MTP |
| Version de AXQuant | 2.3.0 |
| Revision fuente | `995ad96eacd98c81ed38be0c5b274b04031597b0` |
| Runtime probado | MLX 0.32.1, MLX-LM 0.31.3, MLX-VLM 0.6.17 |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura mixture-of-experts, según el tag `qwen3_5_moe` del repositorio. Esta conversión no entrena ni aumenta los pesos fuente: el autor indica explícitamente que "source weights were not trained or augmented, and no competitor quantization data was used". Por tanto, no hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La innovación técnica de esta publicación es el pipeline de cuantización AXQuant 2.3.0, que aplica MXFP4 nativo de MLX con grupos de 32 elementos a las proyecciones elegibles de atención, expertos y MLP, mientras mantiene en BF16 las partes sensibles (visión, MTP, routers, normas y cabeza de salida). Los embeddings usan empaquetado afín de 8 bits con grupos de 32. El paquete incluye un payload MTP protegido (`mtp.safetensors`), pero el autor advierte que su presencia "no establece ejecución, aceptación, exactitud o aceleración de MTP", y que la ejecución MTP on/off no ha sido verificada para este artefacto. También se incluye `axquant_manifest.json`, que vincula ficheros de salida, identidad de la fuente, plan saneado, ejecución del cuantizador, sidecars protegidos y compatibilidad estática.

## Capacidades

- Generación de texto autoregresiva mediante MLX-LM, verificada en un caso acotado de carga y generación sobre Mac Studio M2 Ultra.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`), con opción de desactivar el modo thinking (`enable_thinking=False`).
- Capacidad de visión potencial: el payload BF16 de visión se conserva separado, pero el cargador estándar de MLX-VLM no pudo cargar el sidecar de visión protegido y no indexado. La generación de imágenes no está soportada por esta exportación a través del loader por defecto.
- Soporte de MTP incluido como payload, aunque sin verificación de ejecución ni aceleración.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Evaluaciones amplias de texto, imagen, vídeo, uso de herramientas, contexto largo y calidad de tareas: no realizadas según el autor.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 22 GB permiten cargar el modelo en equipos Mac con memoria unificada suficiente, usando MLX-LM como runtime. Es el caso de uso principal y el único con evidencia de runtime publicada.
- Prototipado de aplicaciones conversacionales: la plantilla de chat y el flag `enable_thinking` permiten alternar entre respuestas directas y modo razonamiento en prototipos de asistentes, siempre que se acepte la ausencia de certificación de calidad.
- Evaluación de pipelines de cuantización: investigadores interesados en AXQuant pueden usar el paquete como evidencia de desarrollo, inspeccionando `axquant_manifest.json` y `runtime_smoke.json` para reproducir el flujo de conversión.
- Experimentación con MTP: aunque no verificado, el payload `mtp.safetensors` permite a investigadores probar decodificación especulativa en MLX, asumiendo el riesgo de que la ejecución no esté validada.
- Despliegue reproducible fijado por commit: al estar el repositorio sujeto a reconstrucción, un equipo puede fijar la revisión actual para mantener un entorno estable en pruebas internas.
- Base para futuras exportaciones de visión: el payload BF16 de visión retenido separadamente está pensado para una exportación explícita futura, por lo que sirve como material de partida para quien quiera construir ese runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se han realizado evaluaciones amplias de texto, imagen, vídeo, uso de herramientas, contexto largo ni calidad de tareas, y que el paquete carece de certificados Tier 1, Tier 2, de calidad, de aceptación MTP o de velocidad. La única evidencia de runtime es `runtime_smoke.json`, que documenta versiones de dependencias, respuestas y digests del payload para casos acotados de carga y generación.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 22,078 GB en safetensors, por lo que se necesita al menos esa cantidad de memoria más el overhead de contexto, visión y runtime. El autor advierte que el uso real depende de la carga del modelo, el contexto, la entrada de visión y la configuración del runtime.
- GPU recomendadas: el runtime probado es Apple Silicon (Mac Studio M2 Ultra con memoria unificada). No hay evidencia publicada de ejecución en GPU NVIDIA o AMD.
- Cabe en GPU consumer: no hay datos para GPU consumer tipo RTX 4090; el formato MLX está orientado a Apple Silicon. En Mac, requiere un equipo con memoria unificada superior a ~22 GB más overhead.
- Opciones de despliegue: MLX-LM 0.31.3 sobre MLX 0.32.1 en Apple Silicon. MLX-VLM 0.6.17 no carga el sidecar de visión de esta exportación. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no publica certificado de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AX-Qwen3.6-35B-A3B-MLX-AXQ-MXFP4-MTP | 35.107.180.016 | no disponible | Apache-2.0 | safetensors MLX (MXFP4) | Artefacto de desarrollo sin certificación |
| Qwen/Qwen3.6-35B-A3B (base) | 35.107.180.016 | no disponible | Apache-2.0 | safetensors BF16 | Checkpoint oficial sin cuantizar |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

La comparativa se limita al modelo base oficial, ya que no se han proporcionado datos de otras alternativas cuantizadas comparables.

## Limitaciones y advertencias

- Artefacto de desarrollo: el autor lo describe como "development evidence, not a quality certificate", sin certificados Tier 1, Tier 2, de calidad, de aceptación MTP ni de velocidad.
- Reconstrucción anunciada: el paquete será reconstruido con un toolkit AXQuant mejorado y reemplazado como nueva revisión; los ficheros actuales deben fijarse por commit para despliegues reproducibles.
- Visión no operativa: el cargador estándar de MLX-VLM no carga el sidecar de visión protegido; la generación de imágenes no está soportada por esta exportación.
- MTP no verificado: la presencia de `mtp.safetensors` no implica ejecución, aceptación, exactitud ni aceleración; no se ha verificado MTP on/off.
- Evaluaciones ausentes: no hay evaluaciones de texto, imagen, vídeo, tool-use, contexto largo ni calidad de tareas.
- Idiomas no documentados: no se especifican los idiomas soportados.
- Contexto no documentado: no se indica la longitud de contexto.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; al ser una cuantización de un modelo base sin evaluaciones, no hay datos sobre degradación inducida por la cuantización.
- Licencia: Apache-2.0, con `NOTICE` que identifica los cambios de cuantización; los certificados históricos no vinculan esta nueva exportación y no se reutilizan.
- Compatibilidad: los perfiles oMLX/MTPLX no soportados siguen sin soporte; la publicación no promueve compatibilidad de runtime ni reclama cualificación nativa de AX Engine.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/tree/995ad96eacd98c81ed38be0c5b274b04031597b0
- Colección AX BI: https://huggingface.co/collections/AutomatosX/ax-bi-6ad54be40f8f1d5415a8d15a
- Colección AX Work: https://huggingface.co/collections/AutomatosX/ax-work-6ad54c25c37f597f21344945
