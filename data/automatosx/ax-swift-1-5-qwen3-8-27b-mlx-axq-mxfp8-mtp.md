# AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP

## Resumen

AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP es un checkpoint cuantizado en formato MLX, publicado por AutomatosX, derivado del modelo BF16 ukisai/Swift-1.5-Qwen3.8-27b. Se trata de una conversión de precisión mixta realizada con la herramienta AXQuant 2.1.0, pensada para ejecución en Apple Silicon mediante MLX-LM y runtimes compatibles. El modelo conserva la arquitectura densa Qwen3_5ForConditionalGeneration con 27.360 millones de parámetros lógicos y una ventana de contexto configurada de 262.144 tokens.

El pack aplica cuantización de 8 bits a la práctica totalidad de los pesos del camino de lenguaje (26.890 millones de parámetros, el 96,80 %), mientras que mantiene en BF16 los componentes sensibles: la torre de visión, la cabeza de predicción multi-token (MTP) y las capas de normalización (888,07 millones de parámetros, el 3,20 %). El resultado medido es de 8,3813 bits por peso en el modelo principal y 8,4978 BPW incluyendo MTP, con un tamaño de safetensors de 29,51 GB.

La relevancia de esta ficha radica en que se publica explícitamente como evidencia de desarrollo y no como release certificado: el autor no aporta mediciones de calidad, de contexto largo, de velocidad de kernels ni de aceleración MTP. Además, existe un aviso de reconstrucción programada que reemplazará los ficheros actuales por una nueva revisión. Es, por tanto, un artefacto útil para experimentación en hardware Apple, pero no una base recomendable para producción sin validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (dense), camino de texto optimizado; incluye torre de visión y cabeza MTP |
| Parametros totales | 27.356.723.952 (27,36B lógicos) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; el límite práctico depende de la memoria unificada |
| Tipos de cuantizacion | Precisión mixta AXQuant: 8 bits afín (grupo 32) en el 96,80 % de los pesos y BF16 en el 3,20 % restante; clase de presupuesto MXFP8; 8,3813 BPW medidos en el modelo principal y 8,4978 BPW totales con MTP |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como "other" en el Hub) |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF); sidecars opcionales vision.safetensors y mtp.safetensors |

## Arquitectura y entrenamiento

El modelo base es una arquitectura transformer densa de la familia Qwen3.8, identificada en el checkpoint como Qwen3_5ForConditionalGeneration, con 27,36B parámetros lógicos. Incorpora dos componentes adicionales al camino de texto: una torre de visión, que habilita entrada multimodal de imágenes, y una cabeza de predicción multi-token (MTP), orientada a decodificación especulativa y aceleración de la generación. No dispone de módulo de audio. El checkpoint cuantizado no altera la topología de la red: solo reduce la precisión de los pesos del camino de lenguaje mediante cuantización afín de 8 bits con tamaño de grupo 32, dejando en BF16 las normas, la visión y la MTP.

No se dispone de información sobre el proceso de entrenamiento del modelo base: ni el número de tokens, ni la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones de atención más allá de lo implícito en la arquitectura Qwen3.8 de referencia. La conversión se realizó con AXQuant 2.1.0 partiendo de la revisión b4c84d42903a8646b25857eb2827288d92ed85a4 del modelo BF16, y el artefacto registra las versiones MLX 0.32.1 y MLX-LM 0.31.3 empleadas durante el proceso. La ejecución nativa con AX Engine requiere que el runtime genere un model-manifest.json que este repositorio no incluye; los campos de AX Engine en axquant_runtime.json constituyen un contrato de compatibilidad, no una ejecución medida.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno, con pipeline declarado de text-generation.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.8, aunque sin métricas publicadas que lo cuantifiquen en esta versión cuantizada.
- Procesamiento de imágenes: la torre de visión se conserva en BF16, por lo que el checkpoint mantiene la capacidad multimodal del modelo original, siempre que el runtime cargue el sidecar vision.safetensors.
- Decodificación especulativa mediante la cabeza MTP empaquetada en mtp.safetensors, explotable con runtimes que la soporten (oMLX 0.6.3rc2 o superior con "Lightning MTP", o MTPLX con perfil estable y profundidad 1).
- Contexto largo: ventana configurada de 262.144 tokens, sujeta a la memoria unificada disponible en el equipo Apple Silicon.
- Compatibilidad con MLX-LM para inferencia estándar de texto y backbone, aunque esta vía puede ignorar los metadatos de AXQuant y los sidecars opcionales.
- Soporte de tool calling, function calling y flujos de agente: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible en la información proporcionada.
- Modo de razonamiento explícito ("thinking"): no disponible; MTPLX permite desactivarlo con --reasoning off, lo que sugiere que el modelo base lo contempla, pero no se documenta aquí.

## Casos de uso

- Experimentación con cuantización de precisión mixta en Apple Silicon: el pack sirve para comparar el comportamiento de AXQ MXFP8 frente al hermano MXFP4 sobre el mismo modelo base, evaluando el equilibrio entre 8,38 BPW y calidad percibida en tareas propias.
- Inferencia local de texto en equipos Mac con memoria unificada amplia: con 29,51 GB de pesos, un Mac Studio o MacBook Pro de 64 GB o más puede cargar el modelo y mantener conversaciones multi-turno sin depender de la nube, siempre que se acepte la ausencia de certificación de calidad.
- Procesamiento de documentos con imágenes: al conservar la torre de visión en BF16 y cargar el sidecar correspondiente en un runtime compatible, el modelo puede abordar tareas de descripción de imágenes, extracción de información de capturas o preguntas sobre diagramas.
- Evaluación de decodificación especulativa con MTP: mediante MTPLX u oMLX con Lightning MTP, el pack permite medir en primera persona la aceleración de la generación por predicción multi-token, útil para decidir si merece la pena integrar esta técnica en un pipeline propio.
- Base para validación interna antes de adoptar la familia Qwen3.8: un equipo puede ejecutar su batería de pruebas (razonamiento, resumen, generación de texto técnico) sobre esta conversión y decidir si escala al modelo BF16 o a los packs CUDA NVFP4 para servidores NVIDIA.
- Reproducibilidad de artefactos: al estar fijada la revisión del modelo base y documentarse las versiones de MLX, MLX-LM y AXQuant, el checkpoint sirve como referencia para auditar conversiones de cuantización y comparar resultados entre revisiones del toolkit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad MTP, y advierte que la etiqueta AXQ no debe interpretarse como una afirmación de rendimiento.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al menos 29,54 GB de descarga completa y 29,51 GB de pesos en safetensors; en la práctica se necesita margen adicional para el contexto KV, por lo que se recomienda un mínimo de 36-48 GB de memoria unificada para uso cómodo y 64 GB o más para explotar contextos largos.
- Hardware objetivo: Apple Silicon exclusivamente (MLX). No hay pesos CUDA ni GGUF en este repositorio; para NVIDIA existe el pack hermano CUDA AXQ NVFP4 W4A16.
- Equipos recomendados: Mac Studio con M2 Ultra o M3 Ultra y 64-192 GB de memoria unificada; MacBook Pro con M3 Max o M4 Max de 48 GB en adelante para uso con contexto moderado.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) en este formato, ni en Mac con 16 o 24 GB de memoria unificada.
- Despliegue: MLX-LM para texto estándar; oMLX 0.6.3rc2 o superior y MTPLX para aprovechar la cabeza MTP; AX Engine como runtime nativo previsto, aunque requiere generar el model-manifest.json que el repositorio no incluye. No se soportan vLLM, llama.cpp, Ollama ni TGI con estos pesos.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad y declara explícitamente que no se reclama ningún rendimiento en AX Engine.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP (este) | 27,36B | 262.144 | MLX Safetensors, 8,50 BPW totales | swift-open-license-1.0 | Hugging Face, 231 descargas |
| AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP | 27,36B (mismo base) | 262.144 | MLX Safetensors, bloque MXFP4, visión y MTP en BF16 | swift-open-license-1.0 | Hugging Face, hermano del mismo autor |
| AX-Swift-1.5-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP | 27,36B (mismo base) | 262.144 | Checkpoint CUDA NVFP4 W4A16, activaciones BF16 | swift-open-license-1.0 | Hugging Face, hermano del mismo autor |
| ukisai/Swift-1.5-Qwen3.8-27b (modelo base) | 27,36B | 262.144 (según pack derivado) | BF16 original | no disponible en esta ficha | Hugging Face |

La comparación relevante es interna a la familia AXQ: el pack MXFP4 reduce el tamaño a costa de menor precisión por bloque, mientras que este MXFP8 prioriza fidelidad numérica; el pack CUDA NVFP4 cubre el mismo modelo para hardware NVIDIA. Frente al base BF16, este checkpoint ofrece aproximadamente un tercio del tamaño de pesos a cambio de una pérdida de precisión no cuantificada por el autor.

## Limitaciones y advertencias

- El autor declara el paquete como evidencia de desarrollo, no como release certificado: no hay mediciones publicadas de calidad, contexto largo, velocidad de kernels ni aceleración MTP.
- Existe un aviso de reconstrucción (2026-11-25): los ficheros serán reemplazados por una nueva revisión generada con un toolkit AXQuant mejorado. Conviene fijar un commit concreto en despliegues reproducibles.
- La licencia swift-open-license-1.0 está etiquetada como "other" en el Hub y no se detalla en la información disponible; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe concreto sin pruebas propias.
- Riesgo de alucinación y sesgos: no cuantificados por el autor; deben evaluarse con la batería de pruebas del equipo adoptante.
- MLX-LM estándar puede ignorar los metadatos de AXQuant y los sidecars vision.safetensors y mtp.safetensors, de modo que la inferencia de texto no acredita ni la calidad visión-lenguaje ni la aceleración MTP.
- La ejecución nativa con AX Engine requiere un model-manifest.json que el repositorio no incluye; sin él no hay contrato de rendimiento medido.
- El contexto de 262.144 tokens es una configuración teórica: el límite práctico depende de la memoria unificada y no se han publicado pruebas de contexto largo.
- Solo apto para Apple Silicon en este formato; no hay pesos PyTorch ni GGUF, lo que excluye su uso directo en servidores NVIDIA o en despliegues con llama.cpp u Ollama.
- El modelo base pertenece a una familia (Qwen3.8) de la que no se documentan aquí datos de entrenamiento, sesgos ni evaluación, lo que limita el análisis de riesgos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/tree/b4c84d42903a8646b25857eb2827288d92ed85a4
- Hermano MXFP4: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP
- Hermano CUDA NVFP4 W4A16: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP
- Colecciones del autor: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
