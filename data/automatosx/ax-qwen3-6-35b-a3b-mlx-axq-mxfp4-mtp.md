# AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Qwen3.6-35B-A3B-MLX-AXQ-MXFP4-MTP es una conversión cuantizada del checkpoint oficial Qwen/Qwen3.6-35B-A3B (revisión inmutable `995ad96eacd98c81ed38be0c5b274b04031597b0`), publicada por AutomatosX mediante su herramienta AXQuant 2.3.0. No es un modelo entrenado desde cero ni un ajuste fino: los pesos de origen no se han entrenado ni aumentado, solo se han recuantizado a precisión mixta para su ejecución en Apple Silicon a través de MLX. El resultado ocupa 22,078 GB en safetensors, con 4,6460 bits por peso (BPW) en el modelo principal y 4,9127 BPW si se incluye la cabeza MTP.

El modelo base es un transformer con mezcla de expertos (MoE) de unos 34.660 millones de parámetros totales y aproximadamente 3.000 millones activos por token, según indica el sufijo A3B de su denominación. Esa relación entre parámetros totales y activos es lo que hace viable ejecutarlo en un equipo de sobremesa Apple: el coste computacional por token se parece al de un modelo denso de 3B, mientras que la capacidad representa 35B. El interés de esta ficha, por tanto, no está en el modelo en sí, sino en el formato de cuantización y en las condiciones —muy restrictivas— bajo las que el autor lo publica.

Conviene subrayar desde el principio que el propio autor lo etiqueta como artefacto de desarrollo: no hay certificado Tier 1, Tier 2, de calidad, de aceptación de MTP ni de velocidad. Las pruebas realizadas se limitan a una generación de texto acotada en un Mac Studio M2 Ultra con MLX 0.32.1 y MLX-LM 0.31.3. No se han ejecutado evaluaciones amplias de texto, imagen, vídeo, uso de herramientas, contexto largo o calidad de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); `model_type` `qwen3_5_moe` según los tags del repositorio |
| Parametros totales | 34.660.608.768 (medidos sobre los safetensors) |
| Parametros activos | Aproximadamente 3.000 millones (según el sufijo A3B del modelo base); sin desglose oficial en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 nativo de MLX con group size 32 en proyecciones de atención, expertos y MLP; embeddings en 8 bits affine group32; visión, MTP, routers, norms y cabeza de salida en BF16. 4,6460 BPW en el modelo principal, 4,9127 BPW incluyendo MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors para MLX (`library_name: mlx`); 22,078 GB de descarga |

## Arquitectura y entrenamiento

El modelo base es una arquitectura MoE con routers que seleccionan expertos por token; los tags del repositorio apuntan a `qwen3_5_moe` y la presencia de proyecciones de visión en BF16 confirma que el checkpoint original es multimodal. Esta publicación no entrena nada: aplica un plan de cuantización de AXQuant 2.3.0 que asigna MXFP4 a las proyecciones elegibles de atención, expertos y MLP, mantiene en BF16 la torre de visión, la cabeza MTP, los routers, las norms y el head de salida, y empaqueta los embeddings en 8 bits affine group32. El autor advierte explícitamente que el nombre del formato no implica que todos los tensores compartan precisión, y que la planificación manual es evidencia "architecture-prior" no medida, mientras que MXFP8 es un reempaquetado físico explícitamente no medido.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) del modelo original; esos datos corresponden a la model card de Qwen/Qwen3.6-35B-A3B, que no forma parte de la información proporcionada. La innovación técnica destacable de este artefacto es de empaquetado, no de modelado: sidecars protegidos (`mtp.safetensors`, payload de visión), un manifiesto (`axquant_manifest.json`) que liga ficheros de salida, identidad del origen, plan saneado y ejecución del cuantizador, y un `axquant_compatibility.json` que el propio autor califica de evidencia estática ligada al manifiesto, con perfiles oMLX/MTPLX no soportados.

## Capacidades

- Generación de texto y conversación multi-turno mediante el chat template del tokenizador, con la opción `enable_thinking=False` expuesta en el ejemplo oficial del autor, lo que sugiere soporte de modo de razonamiento conmutable en el modelo base.
- Inferencia eficiente en Apple Silicon: al activar solo ~3B de parámetros por token, el coste por token se mantiene bajo pese al tamaño total del checkpoint.
- Capacidad multimodal heredada del modelo base: el payload de visión en BF16 se conserva íntegro en el repositorio, pero no es cargable con el loader estándar de MLX-VLM (ver limitaciones).
- Cabeza MTP (multi-token prediction) incluida en `mtp.safetensors` como payload protegido; su ejecución, tasa de aceptación y aceleración real no han sido verificadas.
- Tool calling y uso de agentes: no evaluado. El autor declara explícitamente que no se han realizado evaluaciones de tool-use.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Contexto largo: no evaluado y sin longitud de contexto documentada para este artefacto.

## Casos de uso

- Desarrollo y prototipado local en Mac: cargar el repositorio con MLX-LM en un equipo Apple Silicon para probar prompts y plantillas de chat sin coste de API ni conexión, aceptando que se trata de un artefacto sin certificar.
- Asistente de código offline en estaciones de trabajo macOS: al ejecutarse íntegramente en local, el código y los prompts no salen del equipo, lo que encaja en entornos con política de no exfiltración de código fuente.
- Evaluación comparativa de formatos de cuantización: sirve como punto de medida frente a los hermanos `MLX-4bit-MTP` y `AXQ-6bit-MTP` del mismo autor, siempre que se instrumenten las pruebas en lugar de confiar en certificados inexistentes.
- Experimentación con cabezas MTP en MLX: el repositorio incluye el payload MTP nativo, útil como material de partida para quien quiera medir decodificación especulativa en Apple Silicon (el autor no lo ha verificado).
- Procesamiento de texto en entornos aislados (air-gapped): al no requerir servicios externos, puede desplegarse en máquinas sin salida a Internet para tareas de resumen o extracción sobre documentos internos.
- Base para un ajuste fino posterior en MLX: el formato safetensors y la licencia Apache-2.0 permiten reutilizar los pesos como punto de partida, teniendo en cuenta que se parte de una cuantización de 4 bits y no de los pesos BF16.
- Generación de texto de baja concurrencia en un Mac Studio compartido: un único proceso MLX con varias peticiones secuenciales, adecuado para uso interno de equipo más que para servicio público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no existen certificados de calidad, de aceptación de MTP ni de velocidad para esta exportación, y que no se han realizado evaluaciones amplias de texto, imagen, vídeo, tool-use, contexto largo ni calidad de tarea. La única evidencia de ejecución es un smoke test de generación de texto acotada en un Mac Studio M2 Ultra, registrado en `runtime_smoke.json`, que establece únicamente los casos de carga y generación probados.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con MLX. No hay pesos GGUF, ni compatibilidad con CUDA, vLLM, TGI, llama.cpp u Ollama.
- VRAM equivalente: al ser memoria unificada, el requisito es de RAM del sistema. El repositorio pesa 22,078 GB, por lo que se necesitan al menos ~24 GB de memoria unificada solo para los pesos, más la caché KV y el contexto.
- Configuración mínima razonable: 32 GB de memoria unificada para contextos cortos y una sola sesión.
- Configuración recomendada: 64 GB o más para contextos largos, varias generaciones simultáneas o si se intenta cargar el payload de visión junto al modelo.
- Equipo de referencia del autor: Mac Studio M2 Ultra (configuración de fábrica), con MLX 0.32.1, MLX-LM 0.31.3 y MLX-VLM 0.6.17.
- Despliegue: `mlx_lm.load()` sobre el repositorio completo, tal como muestra el autor, fijando la revisión inmutable del Hub para reproducibilidad.
- Latencia y throughput: no disponibles. No se han publicado medidas de velocidad y el autor descarta cualquier certificado en ese sentido.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| AX-Qwen3.6-35B-A3B-MLX-AXQ-MXFP4-MTP (este) | 34,66B / ~3B | no disponible | MXFP4 + 8-bit embeddings, 4,9127 BPW con MTP | Apache-2.0 | Artefacto de desarrollo, sin certificados |
| AX-Qwen3.6-35B-A3B-MLX-4bit-MTP | no disponible en la información | no disponible | 4 bits uniforme (MLX) | Apache-2.0 | Variante hermana del mismo autor |
| AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit-MTP | no disponible en la información | no disponible | 6 bits mixto (AXQ) | Apache-2.0 | Variante hermana con tags de certificación Tier 1 y calidad validada |
| Qwen/Qwen3.6-35B-A3B (BF16) | ~34,66B / ~3B | no disponible | BF16 sin cuantizar | Apache-2.0 | Modelo base original, referencia de calidad |

La comparación relevante es de formato, no de capacidad: los tres artefactos de AutomatosX son conversiones del mismo checkpoint, y el de 6 bits es el único que el ecosistema del autor etiqueta como certificado. Este de MXFP4 se presenta como desarrollo, con BPW medido pero sin validación de calidad.

## Limitaciones y advertencias

- Artefacto de desarrollo sin certificación: no existe Tier 1, Tier 2, certificado de calidad, de aceptación de MTP ni de velocidad. No debe tratarse como sustituto validado del modelo base.
- Visión no operativa por la vía estándar: el autor confirma que el loader estándar de MLX-VLM no carga el sidecar de visión protegido y no indexado. El payload BF16 se conserva para una futura exportación explícita, pero hoy no es utilizable.
- MTP no verificado: la presencia de `mtp.safetensors` no demuestra ejecución, aceptación, exactitud ni aceleración. La ejecución con MTP activado y desactivado no se ha comprobado para este artefacto, y el ejemplo oficial usa generación autorregresiva normal.
- Ausencia total de benchmarks: cualquier afirmación de rendimiento o calidad sería especulativa. Las evaluaciones de contexto largo y tool-use están explícitamente pendientes.
- Ecosistema restringido: solo MLX sobre Apple Silicon. No hay ruta a CUDA, vLLM, TGI, llama.cpp ni Ollama sin una conversión adicional que el autor no proporciona.
- Riesgo de alucinación y sesgos: no documentados en la información disponible para este artefacto; deben asumirse los del modelo base, que tampoco se detallan aquí.
- Idiomas: no disponibles. No se puede confirmar cobertura multilingüe de esta exportación.
- Licencia: Apache-2.0 permite uso comercial, pero obliga a conservar `LICENSE` y el `NOTICE` que identifica los cambios de cuantización. Los certificados históricos del autor no cubren esta nueva exportación.
- Reproducibilidad: conviene fijar la revisión inmutable del Hub; el consumo real de memoria depende de la carga, el contexto, la entrada de visión y la configuración del runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B (revisión usada: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/tree/995ad96eacd98c81ed38be0c5b274b04031597b0)
- Variante hermana 4 bits: https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-4bit-MTP
- Variante hermana 6 bits: https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit-MTP
- Colección Qwen3.6 de AutomatosX: https://huggingface.co/collections/AutomatosX/qwen36
- Colección AX BI: https://huggingface.co/collections/AutomatosX/ax-bi-6ad54be40f8f1d5415a8d15a
- Colección AX Work: https://huggingface.co/collections/AutomatosX/ax-work-6ad54c25c37f597f21344945
- Repositorio del motor AX Engine: https://github.com/defai-digital/ax-engine
- Índice secundario del hermano de 6 bits: https://essamamdani.com/ai-models/hf-automatosx-ax-qwen3-6-35b-a3b-mlx-axq-6bit-mtp
- Índice secundario del hermano de 6 bits (AI Finder): https://www.aifinder.ae/huggingface.co/automatosx/ax-qwen3.6-35b-a3b-mlx-axq-6bit-mtp/
