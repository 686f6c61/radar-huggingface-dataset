# AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado de precisión mixta en formato MLX, desarrollado por AutomatosX mediante su herramienta AXQuant (AXQ), orientado a la ejecución de modelos de lenguaje de gran tamano en Apple Silicon. Deriva del modelo denso ukisai/Swift-1.5-Qwen3.8-27b (familia qwen3.8, arquitectura Qwen3_5ForConditionalGeneration) y conserva tanto la torre de visión como la cabeza de predicción multi-token (MTP) en BF16, mientras el camino de lenguaje se cuantiza con una mezcla de bloques de 4 y 8 bits.

El modelo resuelve el problema de desplegar un modelo de 27.360 millones de parámetros lógicos en hardware de Apple con memoria unificada limitada: el pack ocupa 17,41 GB en safetensors y mide 4,8441 bits por peso (BPW) en el modelo principal, 5,0147 BPW incluyendo la cabeza MTP. Configura una longitud de contexto máxima de 262.144 tokens, aunque los límites prácticos dependen de la memoria unificada disponible.

Es relevante ahora porque combina tres piezas poco habituales en un mismo artefacto MLX: cuantización mixta con tensores protegidos en mayor precisión, cabeza MTP empaquetada como sidecar para decodificación especulativa en runtimes compatibles (oMLX, MTPLX) y torre de visión preservada. No obstante, el propio autor lo etiqueta explícitamente como evidencia de desarrollo, no como certificado de calidad ni de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (dense); camino de texto optimizado |
| Parametros totales | 27.356.723.952 (27,36B lógicos) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; límite práctico sujeto a memoria unificada |
| Tipos de cuantizacion | Mixta AXQuant 2.1.0: bloques de 4 bits (24,35B parám., 87,65%), 8 bits (2,54B, 9,15%) y BF16 (888,07M, 3,20%); métodos affine, bf16 y mxfp4 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como "other") |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |

Datos adicionales: BPW medido del modelo principal 4,8441; BPW total con MTP 5,0147; clase de presupuesto del Hub MXFP4; clase de precisión base AXQuant 6bit; tamano de safetensors 17,41 GB; descarga completa aproximada 17,45 GB; runtime MLX-LM registrado en conversión MLX 0.32.1 y MLX-LM 0.31.3; versión de AX Engine 7.6.3; MTP presente (True); visión presente (True); audio presente (False).

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.8 con 27,36B parámetros lógicos, en la variante Qwen3_5ForConditionalGeneration, que incluye torre de visión y cabeza de predicción multi-token. Este repositorio no entrena el modelo: es una conversión cuantizada directa desde el checkpoint BF16 de ukisai/Swift-1.5-Qwen3.8-27b (revisión de origen b4c84d42903a8646b25857eb2827288d92ed85a4). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La innovación técnica del pack es la política de roles de AXQuant: los tensores sensibles (torre de visión, cabeza MTP y normalizaciones) se mantienen en BF16, mientras el resto del camino de lenguaje se reparte entre bloques de 4 y 8 bits, lo que da un BPW medido inferior al planificado (4,8441 frente a 5,6720). La cabeza MTP se empaqueta en `mtp.safetensors` como sidecar para habilitar decodificación especulativa en runtimes que la soportan (oMLX 0.6.3rc2 o superior con "Lightning MTP", y MTPLX con el contrato `qwen3-next-mtp`). Las activaciones permanecen en BF16.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline declarado de text-generation y etiqueta conversational.
- Razonamiento y decodificación especulativa vía cabeza MTP empaquetada (requiere runtime compatible; MLX-LM estándar no la carga).
- Capacidades de visión: torre de visión preservada en BF16 en el checkpoint (etiqueta vision presente).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no (audio presente: False).
- Modo thinking explícito: no disponible; MTPLX expone un flag `--reasoning off` en su quickstart, sin más detalle.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el pack de 17,41 GB permite servir un modelo de 27,36B en equipos Apple Silicon de gama alta usando MLX-LM, con la ventaja de no requerir GPU dedicada.
- Procesamiento de documentos largos: con 262.144 tokens de contexto configurados, es adecuado para resumir o analizar contratos, informes o bases de código extensas, siempre que la memoria unificada soporte la ventana efectiva.
- Aceleración de generación con decodificación especulativa: desplegado en oMLX o MTPLX con la cabeza MTP importada, se puede reducir la latencia de generación token a token en comparación con el decoding autorregresivo estándar (sin cifras de speed publicadas).
- Flujos con entrada visual: al conservar la torre de visión en BF16, puede emplearse en tareas de descripción de imágenes o extracción de información de capturas y documentos escaneados, sujeto a validación propia porque no hay evidencia publicada de calidad visión-lenguaje.
- Prototipado e investigación en cuantización: sirve como artefacto de referencia para estudiar el impacto de la precisión mixta (4/8/BF16) y de los sidecars MTP en pipelines MLX, dado que el autor publica registros de conversión e integridad.
- Despliegue en entornos con restricciones de ancho de banda o almacenamiento: la descarga de 17,45 GB y el formato safetensors MLX simplifican la distribución frente a alternativas de mayor tamano.
- Evaluación comparativa de packs AXQ: junto con los hermanos MXFP8 y CUDA NVFP4 W4A16, permite medir el compromiso tamano-calidad en el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad MTP, y que la etiqueta AXQ no debe interpretarse como una afirmación de benchmark.

## Requisitos de hardware

- VRAM/memoria: al menos 17,45 GB de espacio libre en disco para la descarga; en ejecución se necesita memoria unificada suficiente para los pesos (≈17,4 GB) más el estado de inferencia y la caché KV del contexto utilizado. Con 262.144 tokens de contexto, la caché KV puede superar ampliamente el tamano de los pesos.
- GPU recomendadas: hardware Apple Silicon con memoria unificada; no se especifican modelos concretos (M1/M2/M3/M4, Pro/Max/Ultra) en la información disponible.
- GPU de consumidor: el formato es MLX, por lo que no está pensado para GPUs NVIDIA o AMD; para CUDA existe el pack hermano NVFP4 W4A16.
- Opciones de despliegue: MLX-LM (solo texto/backbone, puede ignorar metadatos AXQ y sidecars), oMLX 0.6.3rc2 o superior (con importación del sidecar MTP y Lightning MTP), MTPLX (consumo directo del sidecar) y AX Engine (genera model-manifest.json antes de servir; no se incluye en el repo).
- Latencia y throughput: no disponibles; no se publican cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP (este) | 27,36B | 262.144 | MLX safetensors, mixta 4/8/BF16, 5,0147 BPW total | swift-open-license-1.0 | MTP y visión en BF16; evidencia de desarrollo |
| AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP | 27,36B (mismo base) | 262.144 | MLX safetensors, bloques MXFP8, visión/MTP/normas en BF16 | swift-open-license-1.0 | Misma política de roles, mayor precisión y presumiblemente mayor tamano |
| AX-Swift-1.5-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP | 27,36B (mismo base) | 262.144 | Checkpoint nativo NVIDIA NVFP4 W4A16, activaciones BF16 | swift-open-license-1.0 | Cuantizado desde el mismo BF16, no es requantización del MLX |
| ukisai/Swift-1.5-Qwen3.8-27b (modelo base) | 27,36B | no disponible | BF16 (formato original) | no disponible | Referencia de calidad sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estos packs ni frente a modelos de otros autores.

## Limitaciones y advertencias

- El autor califica el paquete como evidencia de desarrollo, no como certificado de calidad; no hay evidencia publicada de calidad, contexto largo, velocidad de kernels ni velocidad MTP.
- Aviso de reconstrucción (2026-11-25): el pack será reconstruido con una versión mejorada de AXQuant y reemplazado como nueva revisión; los ficheros actuales quedan en el historial, por lo que conviene fijar un commit en despliegues reproducibles.
- MLX-LM estándar puede ignorar los metadatos de runtime AXQ y los sidecars opcionales (`vision.safetensors`, `mtp.safetensors`); ejecutar con `mlx_lm.generate` no demuestra aceleración MTP ni calidad visión-lenguaje.
- El repositorio no incluye `model-manifest.json`; AX Engine debe generarlo antes de servir y no se reclama ninguna velocidad de runtime.
- El contexto de 262.144 tokens es una configuración máxima; el límite práctico depende de la memoria unificada y la caché KV puede agotarla mucho antes.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingüe.
- Licencia swift-open-license-1.0 (etiquetada como "other"): es necesario revisar el fichero LICENSE antes de cualquier uso comercial; no se detallan aquí sus restricciones.
- Riesgo de sesgos y alucinaciones inherente al modelo base; no se publican evaluaciones de seguridad ni de sesgo.
- No hay pesos PyTorch ni GGUF en el repositorio: no es desplegable en vLLM, llama.cpp, Ollama ni TGI sin conversión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/tree/b4c84d42903a8646b25857eb2827288d92ed85a4
- Hermano MXFP8: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP
- Hermano CUDA NVFP4 W4A16: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
