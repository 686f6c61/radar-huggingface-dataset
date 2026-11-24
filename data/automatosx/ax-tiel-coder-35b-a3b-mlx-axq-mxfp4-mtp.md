# AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en formato MLX Safetensors para Apple Silicon, publicado por AutomatosX. Se trata de una conversión de precisión mixta (AXQuant/AXQ) del modelo Tiel-Coder-35B-A3B, un modelo de arquitectura MoE (mixture of experts) de la familia `qwen3.5-moe` con 35.107 millones de parámetros lógicos totales y capacidades de visión y predicción multi-token (MTP). El objetivo del paquete es ofrecer una versión de bajo peso (22,03 GB de safetensors, 4,6342 bits por peso medidos en el camino principal) ejecutable en MLX-LM sobre hardware de Apple.

El modelo base declarado es `peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP`, del que este repositorio es una recuantización. La propuesta de valor es la reducción de huella de almacenamiento manteniendo en BF16 los componentes sensibles: la torre de visión (446,57 M de parámetros) y la cabeza MTP (844,64 M de parámetros) se preservan sin cuantizar, mientras que el camino de texto se cuantiza con métodos `affine`, `mxfp4` y `bf16` con tamaños de grupo 32 y 64.

Es relevante ahora porque el ecosistema MLX carece de checkpoints cuantizados de forma agresiva para modelos MoE con visión y MTP, y porque el autor documenta explícitamente el estado de validación: se trata de evidencia de desarrollo, no de un release certificado, sin métricas publicadas de calidad, velocidad de kernel ni exactitud del MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (MoE transformer con torre de visión y cabeza MTP); camino de texto optimizado |
| Parametros totales | 35.107.180.016 (35,11 B lógicos) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados (límite práctico sujeto a memoria unificada) |
| Tipos de cuantizacion | Precisión mixta AXQuant: `4bit` (33,62 B params, 93,52 %), `8bit` (529,61 M, 1,47 %), `bf16` (1,80 B, 5,01 %); métodos `affine`, `mxfp4`, `bf16`; grupos 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF); sidecars BF16 `mtp.safetensors` y `vision.safetensors` |

## Arquitectura y entrenamiento

La arquitectura subyacente es `Qwen3_5MoeForConditionalGeneration`, un transformer de mezcla de expertos con 35,11 B de parámetros lógicos y un contexto máximo configurado de 262.144 tokens. El paquete incluye tres componentes diferenciados: el camino de texto cuantizado, una torre de visión de 446,57 M de parámetros (333 tensores) preservada en BF16 y una cabeza de predicción multi-token (MTP) de 844,64 M de parámetros (785 tensores) también en BF16. La presencia de MTP indica un esquema de decodificación especulativa integrado en el modelo base.

La cuantización se realizó con AXQuant 1.9.0 partiendo directamente del modelo fuente en BF16. El presupuesto declarado era de 5,6026 BPW (clase `5p6bpw`, etiqueta de hub `MXFP4`), pero el BPW medido en el camino principal es de 4,6342 y el total incluyendo MTP de 4,9013, lo que refleja que las capas protegidas elevan la media. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si hubo RLHF o DPO: la model card del repositorio no documenta el proceso de preentrenamiento ni el alineamiento del modelo original. Tampoco se publican innovaciones de kernel propias más allá del esquema de cuantización mixta con protección de tensores sensibles.

## Capacidades

- Generación de texto y conversación multi-turno sobre el camino de backbone en MLX-LM.
- Razonamiento y generación de código, inferidos del nombre del modelo (`Coder`) y de su etiqueta `development`; no hay evaluación publicada que lo cuantifique.
- Procesamiento de visión: el checkpoint incluye torre de visión en BF16, aunque MLX-LM puede ignorar el sidecar `vision.safetensors` y no se establece calidad visión-lenguaje.
- Predicción multi-token (MTP): la cabeza está presente en BF16, pero el paquete no aporta evidencia de aceleración ni de exactitud del MTP.
- Contexto largo de hasta 262.144 tokens configurados, condicionado a la memoria unificada disponible.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Audio: no soportado (`Audio present: False`).

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el paquete de 22,05 GB se carga con MLX-LM y permite ejecutar un MoE de 35 B en equipos con memoria unificada suficiente, sin depender de GPUs NVIDIA ni de servicios en la nube.
- Prototipado de asistentes de código en estación de trabajo: un desarrollador puede levantar `mlx_lm.generate` con temperatura 0 para generar y revisar fragmentos de código de forma reproducible, fijando el commit del Hub en lugar de depender de `main`.
- Evaluación de cuantización mixta: investigadores que comparan el hermano `4bit` y el `6bit` pueden usar este pack como punto intermedio de 4,6342 BPW medidos para estudiar la degradación de calidad frente al presupuesto nominal de 5,6026 BPW.
- Procesamiento de documentos con contexto largo: los 262.144 tokens configurados permiten ingerir repositorios o expedientes extensos en una sola ventana, siempre que la memoria unificada del equipo lo soporte.
- Experimentación con decodificación especulativa: el sidecar MTP en BF16 sirve como material de partida para validar esquemas de predicción multi-token, aunque el release no garantice aceleración.
- Pipeline de CI para artefactos MLX: el repositorio incluye `runtime_audit.json` con enlaces fijados de config, índice y cabeceras, útil para auditar integridad de artefactos en un flujo de empaquetado reproducible.
- Base para recuantización o conversión: el checkpoint MLX puede servir como origen para generar variantes GGUF o PyTorch mediante herramientas de conversión, aunque el repositorio no las incluye.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernel ni velocidad de MTP, y que la etiqueta AXQ no debe interpretarse como una afirmación de benchmark.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los safetensors ocupan 22,03 GB y la descarga completa 22,05 GB; se necesita memoria unificada holgada por encima de esa cifra para cargar pesos y ejecutar inferencia con contexto largo.
- GPU recomendadas: hardware Apple Silicon con memoria unificada suficiente; no aplica a A100, H100 ni RTX 4090 porque el formato es MLX y no hay pesos PyTorch ni GGUF en el repositorio.
- Cabe en GPU de consumo: no en el sentido habitual (NVIDIA/AMD); en Apple Silicon, sí en equipos con memoria unificada amplia, aunque el límite práctico depende de la longitud de contexto.
- Opciones de despliegue: MLX-LM (runtime primario documentado, con MLX 0.32.1 y MLX-LM 0.31.3 registrados en la conversión). AX Engine no está establecido: no se incluye `model-manifest.json` validado. vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato.
- Latencia y throughput: no disponibles; el autor no publica medidas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP | 35,11 B lógicos | 262.144 | MLX Safetensors, 4,6342 BPW medidos | Apache 2.0 | Visión y MTP en BF16; evidencia de desarrollo |
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP | 35,11 B lógicos | 262.144 | MLX Safetensors | Apache 2.0 | Presupuesto de almacenamiento menor; BPW exacto a consultar |
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP | 35,11 B lógicos | 262.144 | MLX Safetensors | Apache 2.0 | Mayor precisión media cerca del presupuesto de 6 BPW |
| peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP | 35,11 B lógicos | 262.144 | MLX Safetensors (oQ6e) | no disponible | Modelo base declarado del que deriva este checkpoint |

No se dispone de datos de rendimiento comparado entre estos packs; la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Evidencia de desarrollo, no release certificado: no hay métricas publicadas de calidad, contexto largo, velocidad de kernel ni exactitud del MTP.
- MLX-LM puede ignorar los metadatos de runtime de AXQuant y los sidecars opcionales (`vision.safetensors`, `mtp.safetensors`); el comando de ejemplo no establece aceleración MTP ni calidad visión-lenguaje.
- AX Engine no está validado: no se incluye `model-manifest.json` nativo y los campos de `axquant_runtime.json` describen un contrato de compatibilidad previsto, no evidencia observada.
- El formato es exclusivamente MLX Safetensors: no hay pesos PyTorch ni GGUF, lo que bloquea su uso en vLLM, llama.cpp, Ollama o TGI.
- El BPW nominal (5,6026) no coincide con el medido (4,6342 en el camino principal, 4,9013 total); los nombres de producto AXQ describen una clase de presupuesto, no una precisión uniforme.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los del modelo base, cuyo proceso de entrenamiento y alineamiento no se detalla.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y los términos del modelo base `peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP`, no documentados aquí.
- Límite práctico de contexto sujeto a memoria unificada; los 262.144 tokens configurados no garantizan esa ventana efectiva en hardware de consumo.
- En producción, fijar el commit del Hub en lugar de depender de `main`, y reservar al menos 22,05 GB de disco para la descarga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP/tree/88625754ac91b542280a5602239ce6b2166366f0
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Auditoría de formato de runtime (referenciada en la model card): `runtime_audit.json` dentro del repositorio
