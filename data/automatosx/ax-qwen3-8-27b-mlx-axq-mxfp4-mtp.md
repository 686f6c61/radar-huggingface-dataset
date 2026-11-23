# AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en formato MLX Safetensors del modelo denso Qwen/Qwen3.8-27B, publicado por AutomatosX bajo el marco de cuantización mixta AXQuant (AXQ). El paquete está diseñado específicamente para Apple Silicon y conserva en BF16 tanto la torre de visión como la cabeza de predicción multi-token (MTP), mientras que la ruta principal del lenguaje se cuantiza con una precisión media medida de 4,8441 bits por peso (BPW) en el modelo principal y 5,0147 BPW si se incluye la MTP. El resultado es un artefacto de 17,41 GB que ocupa aproximadamente 17,45 GB en disco.

El modelo base es una arquitectura `Qwen3_5ForConditionalGeneration` de tipo denso (no MoE) con 27.360 millones de parámetros lógicos y una longitud de contexto configurada de 262.144 tokens. La relevancia de este checkpoint radica en que permite ejecutar un modelo multimodal de 27B en hardware Apple Silicon con un presupuesto de almacenamiento contenido, manteniendo la cabeza MTP para decodificación especulativa en runtimes que la soportan (oMLX y MTPLX).

Es importante subrayar que el autor clasifica explícitamente este paquete como evidencia de desarrollo, no como un lanzamiento AXQuant certificado: no se publican mediciones de calidad, de contexto largo, de velocidad de kernels ni de exactitud de la MTP. La etiqueta de producto AXQ no debe interpretarse como una afirmación de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP |
| Parametros totales | 27.356.723.952 (27,36B lógicos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; el límite práctico depende de la memoria unificada |
| Tipos de cuantizacion | Cuantización mixta AXQuant 1.9.0; clase de presupuesto Hub MXFP4, clase de precisión base AXQ 6bit; BPW medido 4,8441 (principal) y 5,0147 (total con MTP); MTP y visión preservados en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |
| Tamano de pesos | 17,41 GB (descarga completa aproximada: 17,45 GB) |
| Cuantizador | AXQuant 1.9.0 |
| Runtime principal | MLX-LM (registrado con MLX 0.32.1 y MLX-LM 0.31.3) |
| MTP presente | Sí (`mtp.safetensors`) |
| Visión presente | Sí |
| Audio presente | No |
| Descargas en el Hub | 549 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Qwen3.8, con 27,36B de parámetros y una arquitectura de generación condicional que integra una torre de visión para entrada multimodal. La revisión de origen utilizada para la conversión es `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del repositorio Qwen/Qwen3.8-27B. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) en la documentación proporcionada.

La innovación técnica de este checkpoint no reside en el entrenamiento, sino en el proceso de cuantización: AXQuant aplica un plan de precisión mixta donde los tensores protegidos se mantienen en 6 bits, 8 bits o BF16 para alcanzar un presupuesto de almacenamiento determinado, mientras que la base puede permanecer en 4 bits. El autor advierte que los nombres de los paquetes (4bit, 6bit) describen una clase de presupuesto de almacenamiento, no una precisión uniforme, y que el BPW medido es el dato autoritativo. Además, el paquete conserva la cabeza MTP en un sidecar separado para permitir decodificación especulativa multi-token en runtimes compatibles, y la torre de visión también se preserva en BF16.

## Capacidades

- Generación de texto conversacional y continuaciones de contexto largo, con hasta 262.144 tokens configurados.
- Procesamiento de visión: el checkpoint incluye torre de visión, aunque la calidad visión-lenguaje no está validada por el autor.
- Predicción multi-token (MTP) para decodificación especulativa, disponible mediante sidecar `mtp.safetensors` en runtimes compatibles (oMLX 0.6.3rc2 o superior, MTPLX).
- Ejecución nativa en Apple Silicon mediante MLX-LM para la ruta de texto/backbone.
- Compatibilidad declarada con el contrato de ejecución `qwen3-next-mtp` en MTPLX.
- Soporte de tool calling y function calling: no disponible en la documentación proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la documentación proporcionada.
- Capacidades multilingües: no disponibles en la documentación proporcionada.
- Modo de razonamiento (thinking): MTPLX expone un flag `--reasoning off`, lo que sugiere soporte de razonamiento en el modelo base, pero no se detalla su comportamiento.
- Audio: no soportado.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el paquete está diseñado para MLX-LM y permite ejecutar un modelo de 27B en memoria unificada de Apple, con un peso en disco de 17,45 GB que cabe en equipos con 32 GB o más de RAM unificada.
- Prototipado de asistentes conversacionales de contexto largo: los 262.144 tokens configurados permiten manejar documentos extensos, historiales de conversación largos o bases de código completas en una sola ventana, siempre que la memoria unificada lo permita.
- Evaluación de decodificación especulativa: la presencia de la cabeza MTP en un sidecar permite a investigadores probar aceleración de generación con MTPLX u oMLX y comparar latencias frente a la decodificación estándar de MLX-LM.
- Experimentación multimodal en local: al conservar la torre de visión en BF16, el checkpoint sirve para probar pipelines de imagen-texto en entornos Apple, aunque el autor no certifica la calidad de estas salidas.
- Despliegue en flujos de trabajo de desarrollo con MLX: el comando `mlx_lm.generate` permite integrar el modelo en scripts de generación de texto y pruebas de prompts sin necesidad de GPUs NVIDIA.
- Investigación sobre cuantización mixta: el paquete incluye `runtime_audit.json` y `axquant_runtime.json` con hallazgos de formato físico y enlaces de configuración, lo que lo convierte en material útil para estudiar el comportamiento de AXQuant en arquitecturas densas con visión y MTP.
- Reproducibilidad de conversiones: el autor recomienda fijar el commit del Hub en despliegues reproducibles, lo que facilita la auditoría de artefactos en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad de MTP, y que la etiqueta AXQ no constituye una afirmación de benchmark.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el peso en disco es de 17,41 GB; para inferencia se necesita memoria unificada suficiente para pesos más caché KV. Con contexto de 262.144 tokens, el consumo de caché KV puede ser elevado y depende de la implementación.
- GPU recomendadas: Apple Silicon con memoria unificada. No se especifican modelos concretos de chip (M1, M2, M3, M4) en la documentación.
- Cabe en GPU consumer: el formato MLX está orientado a Apple Silicon, no a GPUs NVIDIA consumer como la RTX 4090. No se proporcionan datos para estas.
- Opciones de despliegue: MLX-LM (ruta de texto/backbone), oMLX 0.6.3rc2 o superior (con importación de sidecar MTP y modo Lightning MTP), MTPLX (consumo directo del sidecar con perfil `stable` y profundidad 1). AX Engine no está validado: no se incluye `model-manifest.json` nativo.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP | 27,36B | 262.144 | MLX Safetensors (AXQ mixto, 4,8441 BPW principal) | Apache 2.0 | Checkpoint de desarrollo, sin benchmarks publicados; visión y MTP en BF16 |
| AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP (hermano) | 27,36B | 262.144 | MLX Safetensors | Apache 2.0 | Presupuesto AXQ menor; BPW exacto no disponible en esta ficha |
| AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP (hermano) | 27,36B | 262.144 | MLX Safetensors | Apache 2.0 | Precisión media mayor cerca del presupuesto de 6 BPW; BPW exacto no disponible en esta ficha |
| Qwen/Qwen3.8-27B (modelo base) | 27,36B | 262.144 | BF16 (formato original no detallado) | Apache 2.0 | Fuente de la conversión; sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor clasifica el paquete como evidencia de desarrollo, no como lanzamiento certificado: no hay evidencia publicada de calidad, contexto largo, velocidad de kernels ni exactitud de MTP.
- La etiqueta AXQ describe una clase de presupuesto de almacenamiento, no una precisión uniforme; el BPW medido es el dato autoritativo y puede diferir del nombre del paquete.
- MLX-LM estándar puede ignorar los metadatos de runtime de AXQuant y los sidecars opcionales (`vision.safetensors`, `mtp.safetensors`), por lo que el comando de ejemplo no garantiza aceleración MTP ni calidad visión-lenguaje.
- AX Engine no está establecido: no se incluye un `model-manifest.json` nativo validado y los campos de AX Engine en `axquant_runtime.json` describen un contrato de compatibilidad, no evidencia observada.
- El uso del sidecar MTP requiere runtimes específicos (oMLX 0.6.3rc2 o superior, MTPLX) y descargar el repositorio completo en un directorio local escribible.
- El límite práctico de contexto depende de la memoria unificada del equipo; los 262.144 tokens configurados no garantizan su uso efectivo.
- No se dispone de información sobre sesgos, riesgo de alucinación, rendimiento por idioma ni capacidades multilingües.
- Licencia Apache 2.0: permite uso comercial, pero el autor no certifica el rendimiento ni la calidad del artefacto cuantizado para producción.
- El repositorio no contiene pesos PyTorch ni GGUF, lo que limita su uso a ecosistemas MLX/Apple Silicon.
- Se recomienda fijar el commit del Hub en despliegues reproducibles en lugar de depender de `main`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
