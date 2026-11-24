# AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en formato MLX Safetensors, publicado por AutomatosX, derivado del modelo BF16 `ukisai/Swift-1.5-Qwen3.8-27b`. Emplea la técnica propietaria AXQuant (AXQ) 2.1.0 para aplicar cuantización de precisión mixta sobre la ruta de texto, manteniendo en BF16 la torre de visión y la cabeza de predicción multi-token (MTP). El resultado son 27,36 mil millones de parámetros lógicos almacenados en 17,41 GB de pesos, con un BPW medido de 4,8441 en el modelo principal y 5,0147 incluyendo MTP.

El modelo está pensado exclusivamente para Apple Silicon mediante MLX-LM y runtimes compatibles (oMLX, MTPLX, AX Engine). La arquitectura de origen es `Qwen3_5ForConditionalGeneration` de tipo denso, con una longitud de contexto configurada de 262.144 tokens. No se distribuyen pesos en PyTorch ni GGUF, lo que limita su uso a hardware Apple.

Es relevante porque demuestra una estrategia de cuantización selectiva por rol de tensor: el 87,65 % de los parámetros queda en 4 bits, el 9,15 % en 8 bits y el 3,20 % en BF16, preservando componentes sensibles (visión, MTP, normalizaciones). El autor advierte explícitamente de que se trata de evidencia de desarrollo y no de un release certificado: no publica medidas de calidad, contexto largo ni velocidad de kernels.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (`Qwen3_5ForConditionalGeneration`), ruta de texto optimizada |
| Parámetros totales | 27.356.723.952 (27,36 B lógicos) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; límite práctico según memoria unificada |
| Tipos de cuantización | Precisión mixta AXQ: 4 bits (24,35 B, 87,65 %), 8 bits (2,54 B, 9,15 %), BF16 (888,07 M, 3,20 %); métodos `affine`, `bf16`, `mxfp4`; grupos de 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiqueta `other`) |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |
| BPW medido (modelo principal) | 4,8441 |
| BPW medido (total con MTP) | 5,0147 |
| BPW de almacenamiento planificado | 5,6720 |
| Tamaño de pesos Safetensors | 17,41 GB |
| Descarga completa aproximada | 17,45 GB |
| Sidecar MTP | 15 tensores, 424,70 M parámetros, 0,85 GB, BF16 |
| Sidecar de visión | 333 tensores, 460,73 M parámetros, 0,92 GB, BF16 |
| Audio | no presente |
| Runtime principal | MLX-LM (registrado MLX 0.32.1, MLX-LM 0.31.3) |
| Runtime AX Engine | versión registrada 7.6.3; requiere `model-manifest.json` generado localmente, no incluido |
| Modelo base | `ukisai/Swift-1.5-Qwen3.8-27b`, revisión `b4c84d42903a8646b25857eb2827288d92ed85a4` |
| Cuantizador | AXQuant 2.1.0 |
| Nivel de soporte | `convertible` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Qwen3.5, con 27,36 B de parámetros y una cabeza de predicción multi-token (MTP) asociada al contrato de ejecución `qwen3-next-mtp`. La torre de visión está presente como sidecar BF16 independiente, lo que habilita entrada multimodal cuando el runtime la carga. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovación principal de este checkpoint es la política de cuantización por rol de tensor implementada por AXQuant: la ruta de texto se comprime con una mezcla de bloques `mxfp4` y `affine` de 4 y 8 bits, mientras que las normalizaciones, la torre de visión y la cabeza MTP permanecen en BF16. Las activaciones se mantienen en BF16. El autor no publica evidencia de velocidad de kernels ni de aceleración MTP medida; el soporte de decodificación especulativa vía MTP depende de runtimes específicos (oMLX ≥ 0.6.3rc2 con "Lightning MTP", o MTPLX con perfil `stable` y `depth 1`).

## Capacidades

- Generación de texto conversacional y continuaciones de formato largo, con contexto configurado de hasta 262.144 tokens.
- Razonamiento de múltiples pasos y modo de razonamiento controlable en MTPLX mediante el flag `--reasoning off`.
- Capacidad de visión heredada del modelo base, disponible solo si el runtime carga el sidecar `vision.safetensors` en BF16.
- Predicción multi-token (MTP) para decodificación especulativa, siempre que se use un runtime compatible con el sidecar `mtp.safetensors`.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso orquestado: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Capacidades de audio: no presentes.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint de 17,45 GB cabe en equipos con memoria unificada de 32 GB o superior y se ejecuta con `mlx_lm.generate`, lo que permite prototipado offline sin GPU dedicada.
- Evaluación de cuantización de precisión mixta: útil para investigadores que comparan el pack MXFP4 con el hermano MXFP8 y el pack CUDA NVFP4 W4A16, todos derivados del mismo BF16, para medir el impacto del BPW en calidad.
- Procesamiento de documentos largos: con 262.144 tokens de contexto configurado, adecuado para resumen y extracción sobre contratos, informes o bases de código extensas, siempre que la memoria unificada lo permita.
- Asistentes conversacionales en escritorio: integrable en aplicaciones macOS mediante MLX-LM u oMLX, con modo de razonamiento desactivable para reducir latencia en turnos simples.
- Aceleración de decodificación con MTP: en MTPLX con perfil `stable` y `depth 1`, la cabeza MTP puede explotarse para decodificación especulativa en cargas de generación larga.
- Experimentación multimodal: si se carga el sidecar de visión en un runtime compatible, permite tareas de descripción de imágenes y respuesta visual sobre documentos escaneados.
- Pipeline de CI para validación de artefactos: el repositorio incluye registros de integridad de conversión, útil para verificar reproducibilidad de checkpoints cuantizados antes de desplegarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad MTP, y que la etiqueta AXQ no debe interpretarse como una afirmación de rendimiento.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 17,45 GB solo para pesos; con overhead de runtime MLX y caché KV para contexto largo, se recomienda un mínimo de 24-32 GB de memoria unificada.
- Contexto de 262.144 tokens: requiere memoria unificada muy superior a la del propio modelo; el límite práctico depende del equipo y no está cuantificado por el autor.
- GPU recomendadas: Apple Silicon exclusivamente (series M1/M2/M3/M4 y variantes Pro, Max y Ultra). No compatible con CUDA ni ROCm en este formato.
- Cabe en GPU de consumo: solo en Apple Silicon con memoria unificada suficiente; no aplica a RTX 4090 ni A100/H100 por incompatibilidad de formato MLX.
- Opciones de despliegue: MLX-LM (`mlx_lm.generate`), oMLX ≥ 0.6.3rc2 con importación del sidecar MTP, MTPLX (`mtplx quickstart`) y AX Engine 7.6.3 (requiere generar `model-manifest.json` localmente).
- Latencia y throughput: no disponibles; el autor no publica cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP | 27,36 B | 262.144 | MLX Safetensors, BPW 5,0147 | swift-open-license-1.0 | Precisión mixta con MTP y visión en BF16 |
| AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP | 27,36 B (base) | 262.144 | MLX Safetensors, bloque MXFP8 | swift-open-license-1.0 | Misma política AXQ en formato de bloque distinto; mayor BPW esperado |
| AX-Swift-1.5-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP | 27,36 B (base) | 262.144 | CUDA NVFP4 W4A16 | swift-open-license-1.0 | Cuantizado desde el mismo BF16; destinado a NVIDIA, no es requantización del MLX |
| ukisai/Swift-1.5-Qwen3.8-27b | 27,36 B | no disponible | BF16 (origen) | no disponible | Modelo base sin cuantizar del que derivan los tres packs |

## Limitaciones y advertencias

- Evidencia de desarrollo: el autor declara que no es un release certificado y que no publica medidas de calidad, contexto largo, velocidad de kernels ni velocidad MTP.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni similares; imposible comparar rendimiento empírico con alternativas.
- Formato restringido: solo MLX Safetensors; no hay pesos PyTorch ni GGUF, por lo que no se puede desplegar en vLLM, llama.cpp, Ollama ni TGI.
- Compatibilidad parcial con MLX-LM: la herramienta estándar puede ignorar metadatos AXQuant y los sidecars `vision.safetensors` y `mtp.safetensors`, de modo que visión y aceleración MTP no quedan garantizadas.
- AX Engine: el repositorio no incluye `model-manifest.json`; el runtime debe generarlo, y los campos de `axquant_runtime.json` son un contrato de compatibilidad, no una ejecución medida.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar cobertura multilingüe.
- Licencia: swift-open-license-1.0 con etiqueta `other`; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados por el autor; deben asumirse los del modelo base, que tampoco los detalla.
- Contexto largo: los 262.144 tokens son un máximo configurado; el límite real depende de la memoria unificada del equipo y no está validado empíricamente.
- Reproducibilidad: el autor recomienda fijar el commit del Hub en despliegues reproducibles en lugar de depender de `main`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/tree/b4c84d42903a8646b25857eb2827288d92ed85a4
- Hermano MXFP8: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP
- Hermano CUDA NVFP4 W4A16: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
