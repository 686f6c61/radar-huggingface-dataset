# AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en formato MLX del modelo Qwen3.8-27B de Alibaba Qwen, publicado por AutomatosX bajo el paraguas de su toolkit AXQuant (AXQ). El objetivo es ofrecer una versión de 27.360 millones de parámetros lógicos ejecutable en Apple Silicon con un presupuesto de almacenamiento de aproximadamente 5 bits por peso, manteniendo la cabeza de predicción multi-token (MTP) y la torre de visión en BF16 para no degradar esas rutas. El paquete ocupa 17,41 GB en safetensors y declara un contexto máximo configurado de 262.144 tokens.

La relevancia del artefacto es doble. Por un lado, demuestra la viabilidad de la cuantización de precisión mixta (MXFP4 como clase de presupuesto, con tensores protegidos en 6 bits, 8 bits o BF16) sobre un modelo denso multimodal con MTP. Por otro, el propio autor lo etiqueta explícitamente como evidencia de desarrollo y no como release certificado: no publica métricas de calidad, de contexto largo ni de velocidad de kernel, y advierte que será reconstruido con una versión mejorada del toolkit.

Conviene subrayar que este repositorio no contiene pesos PyTorch ni GGUF, y que la ejecución nativa en AX Engine no está establecida al no incluirse un `model-manifest.json` validado. El uso previsto es MLX-LM para inferencia de texto, y oMLX o MTPLX para aprovechar el sidecar MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (`Qwen3_5ForConditionalGeneration`), con cabeza MTP y torre de vision |
| Parametros totales | 27.356.723.952 (27,36B lógicos) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; límite práctico sujeto a memoria unificada |
| Tipos de cuantizacion | AXQuant 1.9.0 mixed-precision; clase de presupuesto MXFP4; precisión base declarada 6bit; BPW medido del modelo principal 4,8441; BPW total con MTP 5,0147; MTP y vision en BF16 |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, una arquitectura densa de la familia `qwen3.8` con clase `Qwen3_5ForConditionalGeneration`, que combina una ruta de lenguaje con una torre de visión y una cabeza de predicción multi-token. AutomatosX no ha reentrenado el modelo: ha convertido directamente los pesos BF16 de origen (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) a un checkpoint MLX con cuantización de precisión mixta. La ruta de lenguaje se cuantiza mientras que la cabeza MTP y la torre de visión se preservan en BF16, ya sea en el propio checkpoint o en un sidecar vinculado (`mtp.safetensors`, `vision.safetensors`).

La innovación técnica del paquete no está en el entrenamiento sino en el esquema de compresión. AXQ define clases de presupuesto de almacenamiento, no una precisión uniforme: los tensores sensibles conservan 6 bits, 8 bits o BF16 mientras el resto baja a 4 bits, de modo que el BPW medido (4,8441 en el modelo principal, 5,0147 incluyendo MTP) es el dato autoritativo frente a la etiqueta comercial. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno, con pipeline declarado `text-generation`.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3.8-27B, sin métricas publicadas en este paquete.
- Generación de código: no se documenta explícitamente en la model card, pero es una capacidad esperable del base; no hay evidencia medida en este repositorio.
- Visión: la torre de visión está presente (`Vision present: True`) y preservada en BF16, aunque MLX-LM estándar puede ignorar el sidecar de visión.
- Predicción multi-token (MTP): cabeza incluida en `mtp.safetensors`, utilizable con runtimes que la soporten (oMLX 0.6.3rc2 o superior con "Lightning MTP", o MTPLX).
- Contexto largo: hasta 262.144 tokens configurados, condicionado a la memoria unificada del equipo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente en este paquete.
- Audio: no soportado (`Audio present: False`).
- Capacidades multilingües: no disponibles en la model card.

## Casos de uso

- Inferencia local en Apple Silicon para desarrollo: el paquete de 17,41 GB cabe en equipos con memoria unificada de 32 GB o superior, lo que permite probar un modelo de 27B en un MacBook Pro o Mac Studio sin GPU dedicada, usando MLX-LM como runtime.
- Prototipado de asistentes conversacionales de contexto largo: con 262.144 tokens configurados, se pueden procesar documentos extensos, historiales de conversación prolongados o bases de código completas en una sola ventana, siempre que la memoria unificada lo permita.
- Evaluación de cuantización de precisión mixta: investigadores que estudien el impacto de AXQ/MXFP4 sobre un modelo denso multimodal pueden usar este checkpoint como referencia de BPW 5,0147 frente a los hermanos 4bit y 6bit del mismo autor.
- Aceleración con MTP en runtimes compatibles: integrado en oMLX con "Lightning MTP" o en MTPLX, el sidecar MTP permite decodificación especulativa multi-token, útil en aplicaciones interactivas donde la latencia por token es crítica.
- Tareas multimodales en local: con la torre de visión preservada en BF16, un runtime que cargue el sidecar `vision.safetensors` puede abordar descripción de imágenes, OCR o respuesta a preguntas visuales, aunque el autor no certifica calidad en esta ruta.
- Pipeline de CI para validación de artefactos: el repositorio incluye `runtime_audit.json` con bindings de config, índice y cabeceras, lo que permite a un equipo de infraestructura verificar integridad y formato físico de pesos en un proceso automatizado antes de desplegar.
- Base para experimentos de compresión en el ecosistema MLX: serviría como punto de partida para comparar AXQuant con otras técnicas de cuantización (GPTQ, AWQ, bitsandbytes) sobre el mismo modelo base, midiendo perplejidad y BPW.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernel ni velocidad de MTP, y que la etiqueta AXQ no debe interpretarse como una afirmación de benchmark.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el paquete pesa 17,41 GB en safetensors y la descarga completa ronda los 17,45 GB; se recomienda al menos 24-32 GB de memoria unificada para cargar el modelo y dejar margen para el contexto.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro, Max y Ultra). No es ejecutable en GPU NVIDIA o AMD con este formato.
- Cabe en consumer hardware: sí, en equipos Apple con memoria unificada suficiente; un Mac con 32 GB puede cargarlo, aunque el contexto largo requerirá más memoria.
- Opciones de despliegue: MLX-LM (runtime principal declarado, versión registrada 0.31.3 con MLX 0.32.1), oMLX 0.6.3rc2 o superior para MTP, MTPLX para el sidecar MTP. AX Engine no está validado por ausencia de `model-manifest.json`. No hay soporte GGUF ni vLLM/TGI en este repositorio.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad de kernel ni de MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP (este) | 27,36B | 262.144 | AXQ mixed, BPW 5,0147 | Apache 2.0 | MLX Safetensors |
| AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP | 27,36B (base) | 262.144 (base) | AXQ 4bit, BPW no disponible | Apache 2.0 | MLX Safetensors |
| AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP | 27,36B (base) | 262.144 (base) | AXQ 6bit, BPW no disponible | Apache 2.0 | MLX Safetensors |
| Qwen/Qwen3.8-27B (base) | 27,36B | 262.144 | BF16 sin cuantizar | Apache 2.0 | Safetensors |

Los dos hermanos AXQ del mismo autor ofrecen el mismo modelo base con distintos presupuestos de almacenamiento; el de 4bit prioriza tamaño y el de 6bit prioriza precisión media. El modelo base BF16 sirve como referencia de calidad, pero no es ejecutable en Apple Silicon con la misma huella de memoria. No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El autor califica el paquete como evidencia de desarrollo, no como release certificado: no hay métricas de calidad, contexto largo, velocidad ni exactitud de MTP.
- El repositorio será reconstruido con una versión mejorada de AXQuant y reemplazado como nueva revisión; se recomienda fijar un commit concreto en despliegues reproducibles.
- MLX-LM estándar puede ignorar los metadatos de AXQuant y los sidecars opcionales (`vision.safetensors`, `mtp.safetensors`), por lo que la inferencia con el comando básico no garantiza aceleración MTP ni calidad visión-lenguaje.
- AX Engine no está validado: no se incluye `model-manifest.json` y los campos de AX Engine en `axquant_runtime.json` describen un contrato de compatibilidad, no evidencia observada.
- Solo ejecutable en Apple Silicon; no hay pesos PyTorch ni GGUF, lo que excluye GPU NVIDIA, AMD y despliegues en servidores x86 convencionales.
- La cuantización de precisión mixta puede degradar la calidad frente al BF16 original; el BPW de 5,0147 implica pérdida de información y no se publica perplejidad ni evaluación comparativa.
- Riesgo de alucinación inherente a los modelos de lenguaje, no mitigado ni cuantificado en este paquete.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base Qwen3.8-27B.
- Idiomas soportados: no declarados en la model card.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de desarrollo sin certificación de calidad, el despliegue en producción requiere validación propia.
- El contexto de 262.144 tokens está configurado, pero el límite práctico depende de la memoria unificada disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo de modelos MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Auditoría de runtime (en el propio repo): `runtime_audit.json`
