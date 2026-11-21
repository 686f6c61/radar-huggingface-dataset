# AutomatosX/AX-Clef-Flash-9B-MLX-AXQ-MXFP4

## Resumen

AX-Clef-Flash-9B-MLX-AXQ-MXFP4 es un checkpoint cuantizado de precisión mixta en formato MLX, derivado del modelo denso Cloudflare/clef-flash (familia qwen3.5, arquitectura Qwen3_5ForConditionalGeneration). Lo publica AutomatosX mediante su pipeline propietario AXQuant 2.1.0, que asigna precisiones distintas por tensor (4 bits, 8 bits y BF16) para ajustarse a un presupuesto de almacenamiento concreto. El resultado son 9.409.812.208 parámetros lógicos almacenados en 7,70 GB de safetensors, con un BPW medido de 6,5503 sobre el camino de texto.

El modelo está pensado exclusivamente para ejecución local en Apple Silicon mediante MLX-LM. Incluye una torre de visión preservada en BF16 como sidecar de 456,01M de parámetros (0,91 GB), aunque el autor no publica ninguna evaluación de calidad visión-lenguaje. La ventana de contexto configurada alcanza los 262.144 tokens, si bien se trata de metadatos de configuración y no de una capacidad validada empíricamente.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización mixta aplicada a un modelo multimodal de 9B; por otro, conviene subrayar que el propio autor la etiqueta como evidencia de desarrollo y no como release certificado. No hay benchmarks de calidad, latencia ni retención frente a BF16, y el manifest nativo de AX Engine no está incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, Qwen3_5ForConditionalGeneration (familia qwen3.5), con torre de visión |
| Parametros totales | 9.409.812.208 (9,41B lógicos) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados (límite práctico dependiente de memoria unificada) |
| Tipos de cuantizacion | Mixta AXQuant: 4 bits (73,52% de parámetros), 8 bits (10,81%), BF16 (15,67%); métodos affine, bf16 y mxfp4; tamaños de grupo 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |
| BPW medido (camino principal) | 6,5503 |
| BPW total medido | 6,5503 |
| Tamano de pesos safetensors | 7,70 GB |
| Descarga completa aproximada | 7,73 GB |
| Vision | Presente (sidecar BF16, 333 tensores, 456,01M parámetros, 0,91 GB) |
| Audio | No presente |
| MTP | No presente |
| Runtime principal | MLX-LM (registrado MLX 0.32.1, MLX-LM 0.31.3) |
| Version de cuantizador | AXQuant 2.1.0 |
| Revision del modelo base | 8b2e5fd17c09fd49bc2880b805d5323ec7ff4ff3 |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clef-flash es un transformer denso de la familia qwen3.5 con capacidad multimodal (visión y texto), según la clase de arquitectura declarada Qwen3_5ForConditionalGeneration. Este checkpoint no reentrena ni afina el modelo: es una conversión cuantizada directa desde los pesos BF16 originales. La optimización se limita al camino de texto; la torre de visión se conserva íntegramente en BF16 como sidecar.

La cuantización AXQuant 2.1.0 aplica una asignación de precisión por tensor basada en priors de arquitectura, sin calibración con datos. Se registraron 249 conversiones de módulo, todas exitosas y sin fallbacks. El layout resultante combina 6,92B parámetros en 4 bits, 1,02B en 8 bits y 1,47B en BF16, con métodos affine, mxfp4 y bf16 y tamaños de grupo 32 y 64. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y de propósito general sobre el backbone qwen3.5.
- Razonamiento y respuesta a instrucciones heredados del modelo base (sin evaluación publicada en este checkpoint).
- Procesamiento de imágenes mediante la torre de visión BF16 incluida como sidecar (calidad visión-lenguaje no evaluada ni reclamada por el autor).
- Ejecución local en Apple Silicon mediante MLX-LM para inferencia de texto y backbone.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio o decodificación especulativa (MTP): no disponibles; MTP está declarado como ausente.

## Casos de uso

- Desarrollo y prototipado local en Mac con Apple Silicon: el checkpoint permite probar un modelo de 9B con contexto configurado de 262.144 tokens en memoria unificada, usando MLX-LM sin necesidad de GPU dedicada.
- Evaluación de técnicas de cuantización mixta: investigadores pueden comparar este pack MXFP4 (6,55 BPW) con los siblings de 4 y 6 bits de AutomatosX para estudiar el compromiso entre tamaño y calidad en hardware Apple.
- Generación de texto en aplicaciones de escritorio: integrable en herramientas nativas de macOS mediante MLX-LM para resúmenes, redacción asistida o chat, con un footprint de descarga de 7,73 GB.
- Experimentación multimodal controlada: la torre de visión en BF16 permite explorar tareas imagen-texto, siempre que se valide la calidad por cuenta del integrador, ya que el autor no la certifica.
- Pipelines de CI para validación de artefactos: el registro de conversión (249/249 módulos, 0 fallbacks) sirve como caso de estudio para verificar integridad de checkpoints cuantizados antes de desplegarlos.
- Base para futuros afinados o conversiones: al estar en safetensors MLX con licencia Apache 2.0, puede servir de punto de partida para adaptaciones locales o para generar otros formatos, aunque el autor no ofrece pesos PyTorch ni GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no publica evidencia de calidad, contexto largo, velocidad de kernels ni velocidad MTP, y que la etiqueta AXQ no debe interpretarse como una afirmación de benchmark.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al menos 8 GB libres para cargar los 7,70 GB de pesos, más overhead de runtime y KV cache; con contexto de 262.144 tokens el consumo de memoria crece de forma significativa y depende del hardware.
- Hardware objetivo: Apple Silicon (MLX). No hay soporte declarado para CUDA ni ROCm en este artefacto.
- GPU recomendadas: equipos Apple con memoria unificada suficiente; no se especifican modelos concretos (M1/M2/M3/M4) ni cantidades mínimas en la información proporcionada.
- Cabe en GPU de consumo: sí, en Apple Silicon con memoria unificada adequate; no aplica a GPUs NVIDIA de consumo porque el formato es MLX.
- Opciones de despliegue: MLX-LM (principal y validado para texto/backbone); AX Engine no está establecido por falta de manifest nativo validado; llama.cpp, Ollama, vLLM y TGI no son compatibles con estos pesos MLX.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad de kernels ni de MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Clef-Flash-9B-MLX-AXQ-MXFP4 | 9,41B | 262.144 configurados | MLX Safetensors / MLX-LM | Apache 2.0 | 6,55 BPW medido; visión BF16 sidecar; sin benchmarks |
| AX-Clef-Flash-9B-MLX-AXQ-4bit (sibling) | 9,41B | 262.144 configurados | MLX Safetensors / MLX-LM | Apache 2.0 | Presupuesto de almacenamiento menor; BPW a consultar en su ficha |
| AX-Clef-Flash-9B-MLX-AXQ-6bit (sibling) | 9,41B | 262.144 configurados | MLX Safetensors / MLX-LM | Apache 2.0 | Mayor precisión media cerca del presupuesto de 6 BPW |
| Cloudflare/clef-flash (base) | 9,41B | no disponible | BF16 original | Apache 2.0 (según herencia) | Referencia sin cuantizar; calidad no comparada en esta ficha |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Release no certificado: el autor lo marca como evidencia de desarrollo; las puertas formales M0-M8 de AXQuant no están cerradas.
- Sin evidencia de calidad: no se publica retención de calidad frente a BF16 ni frente a baselines uniformes.
- Contexto no validado: los 262.144 tokens son metadatos de configuración, no una capacidad medida; el límite práctico depende de la memoria unificada.
- Visión no evaluada: la torre BF16 está preservada, pero no se reclama ni se mide calidad visión-lenguaje.
- Sin MTP: no hay decodificación especulativa ni aceleración MTP; el sidecar no está incluido.
- AX Engine no establecido: falta model-manifest.json nativo validado; los campos de AX Engine en axquant_runtime.json describen un contrato intencionado, no evidencia observada.
- Calibración ausente: la asignación de precisión se basa en priors de arquitectura, no en datos de calibración.
- Compatibilidad limitada: MLX-LM puede ignorar metadatos de runtime AXQuant y sidecars opcionales; solo garantiza inferencia de texto/backbone.
- Idiomas no declarados: no hay información sobre cobertura lingüística.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; deben asumirse los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el estado no certificado y la falta de benchmarks desaconsejan producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Clef-Flash-9B-MLX-AXQ-MXFP4
- Modelo base: https://huggingface.co/Cloudflare/clef-flash/tree/8b2e5fd17c09fd49bc2880b805d5323ec7ff4ff3
- Sibling 4bit: https://huggingface.co/AutomatosX/AX-Clef-Flash-9B-MLX-AXQ-4bit
- Sibling 6bit: https://huggingface.co/AutomatosX/AX-Clef-Flash-9B-MLX-AXQ-6bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
