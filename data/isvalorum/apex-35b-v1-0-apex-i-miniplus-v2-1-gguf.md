# IsValorum/Apex-35B-V1.0-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Apex-35B-V1.0 APEX-I MiniPlus V2.1 es una cuantización GGUF del modelo base `Apexintelligence-AI/Apex-35B-V1.0`, publicada por el usuario independiente IsValorum dentro de su serie APEX Quantization. El modelo base es un transformer híbrido con arquitectura de mezcla de expertos (MoE) y atención lineal/SSM, con 35.505.251.456 parámetros totales, 40 capas y una ventana de contexto de 262.144 tokens. La cuantización está pensada para ejecución en llama.cpp y prioriza preservar en alta precisión los componentes sensibles (routers, normalizaciones, estados recurrentes SSM) mientras comprime agresivamente los expertos enrutados.

El interés de esta ficha radica en que se trata de una cuantización quirúrgica, no uniforme: el autor documenta tensor a tensor qué precisión aplica y por qué, con verificación del binario resultante. Esto es relevante para desarrolladores que necesitan desplegar un modelo MoE de 35B en hardware con VRAM limitada sin degradar el enrutamiento ni la estabilidad numérica de las capas recurrentes.

La relevancia temporal es limitada: el repositorio tiene 0 descargas y 0 likes, fue creado el 7 de noviembre de 2026 y el propio autor lo enmarca en una serie de cuantizaciones independientes financiadas de su bolsillo. No hay datos publicados de benchmarks ni evaluación de calidad de la cuantización. La licencia del modelo base es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención lineal/SSM: 40 capas (30 linear-attention/SSM + 10 full-attention), 256 expertos enrutados + 1 compartido, 8 activos |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (8 de 256 expertos enrutados + 1 compartido; el número exacto de parámetros activos no se publica) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mezcla quirúrgica: F32, Q8_0, Q6_K, Q5_K, Q4_K, Q4_0, Q3_K, IQ3_XXS (según tensor) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 15,2 GB |
| Capas | 40 (+ bloque MTP 40) |
| Hidden size | 2048 |
| Expert FF | 512 |
| Vocabulario | 248.320 tokens |
| Tensores totales | 753 |
| Vision projector | no incluido en este repositorio (el `mmproj` BF16 del modelo base es un companion separado) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida: 30 capas de atención lineal/SSM combinadas con 10 capas de atención completa (los bloques 3, 7, 11, ...), lo que reduce el coste cuadrático en contexto largo manteniendo capacidad de recuperación profunda en las capas ancla. La capa MoE tiene 256 expertos enrutados más 1 compartido, con 8 expertos activos por token, hidden de 2048 y FF de experto de 512. Incluye un bloque MTP (Multi-Token Prediction) en la posición 40 con 20 tensores, orientado a decodificación especulativa. El vocabulario es de 248.320 tokens y el contexto nativo alcanza 262.144 tokens.

Sobre el entrenamiento no se dispone de información en los datos proporcionados: no se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o destilación. Los tags del repositorio mencionan `reasoning`, `chain-of-thought` y `distillation` en el modelo hermano de la familia, pero no se confirman para este base. La innovación documentada de esta publicación es la cuantización en sí: el autor preserva en F32 los 138 tensores de normalización, los 82 routers de expertos y los 120 tensores de escala SSM (`ssm_alpha`, `ssm_a`, `ssm_dt`, `ssm_conv1d`) para evitar deriva del estado recurrente y del enrutamiento; los expertos enrutados de las capas centrales (10-29) se comprimen a IQ3_XXS calibrados con una importance matrix de bartowski, mientras que los expertos compartidos (activos en cada token) se mantienen en Q5_K.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto de hasta 262.144 tokens.
- Procesamiento de imagen y texto (`image-text-to-text`), aunque el proyector de visión no está incluido en este repositorio y debe obtenerse por separado del modelo base.
- Soporte de agentes y razonamiento multi-paso, según los tags del repositorio (`agent`).
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Decodificación especulativa mediante el bloque MTP incluido (20 tensores), aunque el autor indica que no se incluye un draft DSpark para esta familia.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Despliegue en llama.cpp sobre hardware con VRAM limitada: la cuantización MiniPlus ocupa 14,18 GiB y permite ejecutar un MoE de 35B en GPUs de consumo alto o en configuraciones CPU+GPU, manteniendo routers y SSM en F32 para no degradar el enrutamiento.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o bases de código completas en una sola pasada, aprovechando las 10 capas de atención completa para recuperación profunda.
- Asistentes conversacionales multi-turno: la ventana de contexto amplia y el modo conversacional permiten mantener historiales extensos sin truncado agresivo.
- Pipelines de agentes: el tag `agent` y el bloque MTP sugieren uso en flujos multi-paso con decodificación especulativa para reducir latencia.
- Investigación sobre cuantización: el mapa tensor a tensor auditado y el `tensor-map.tsv` lo convierten en un caso de estudio reproducible para medir el impacto de precisiones mixtas en modelos MoE híbridos.
- Prototipado de aplicaciones multimodal: combinando este GGUF de texto con el `mmproj` BF16 del modelo base, se puede montar un pipeline imagen-texto en llama.cpp, aunque requiere descargar el proyector por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de perplejidad de la cuantización frente al BF16.

## Requisitos de hardware

- VRAM estimada: el archivo principal ocupa 15,23 GB (14,18 GiB); se recomienda al menos 16 GB de VRAM para carga completa en GPU, más overhead de contexto KV.
- Contexto largo: con 262.144 tokens, el KV cache de las 10 capas de atención completa crece de forma significativa; para contextos muy largos se necesita VRAM adicional o offload a CPU.
- GPUs recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para carga completa con contexto moderado; A100 40/80 GB o H100 para contexto máximo y mayor throughput.
- Cabe en GPU de consumo: sí, en GPUs de 16-24 GB (RTX 4080, 4090, 3090, 7900 XTX) con contexto reducido; en GPUs de 12 GB requiere offload parcial.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Apex-35B-V1.0 APEX-I MiniPlus V2.1 (este) | 35,5B totales, MoE 8/256 activos | 262.144 | Apache-2.0 | GGUF 15,23 GB | Cuantización quirúrgica con routers y SSM en F32 |
| Apex-35B-V1.0 APEX-I NanoPlus V2.1 | 35,5B totales | 262.144 | Apache-2.0 | GGUF 13,03 GB | Misma familia, huella menor; precisión de expertos más agresiva (no detallada) |
| Qwen3.8-35B-A3B-Distill APEX-I-MiniPlus-V2.1 | no disponible (A3B sugiere ~3B activos) | no disponible | Apache-2.0 | GGUF | Modelo distinto de la misma serie de cuantización, con 13 idiomas declarados |
| Modelo base Apex-35B-V1.0 (BF16) | 35,5B totales | 262.144 | Apache-2.0 | safetensors/BF16 | Referencia sin cuantizar; mayor huella y calidad máxima |

## Limitaciones y advertencias

- Cuantización agresiva en los expertos enrutados: las capas 10-29 usan IQ3_XXS y las capas 0-9 y 30-39 usan Q3_K, lo que puede degradar tareas que dependan de conocimiento factual fino almacenado en esos expertos.
- Sin benchmarks: no hay evidencia publicada de la pérdida de calidad frente al BF16; el autor no reporta perplejidad ni evaluaciones.
- Proyector de visión ausente: el repositorio solo contiene el GGUF de texto; la capacidad multimodal requiere descargar el `mmproj` BF16 del modelo base y verificar compatibilidad.
- Idiomas no declarados: no se puede garantizar cobertura multilingüe; el modelo base no publica lista de idiomas en la información disponible.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria de la calidad de la cuantización.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación específica para este artefacto.
- Sesgos: no documentados; al no conocerse la composición del dataset de entrenamiento, no se pueden caracterizar sesgos conocidos.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar la licencia y términos del modelo base `Apexintelligence-AI/Apex-35B-V1.0`, ya que la cuantización hereda sus restricciones.
- Fecha de creación futura en los metadatos (2026-11-07): verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Apex-35B-V1.0-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Referencia BF16 GGUF del base: https://huggingface.co/prithivMLmods/Apex-35B-V1.0-MXFP4-MoE-GGUF
- Importance matrix de bartowski: https://huggingface.co/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF
- Variante NanoPlus: https://huggingface.co/IsValorum/Apex-35B-V1.0-APEX-I-NanoPlus-V2.1-GGUF
- Modelo hermano Qwen3.8-35B-A3B-Distill APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-APEX-I-MiniPlus-V2.1-GGUF
- Archivo legacy V1 y V2: https://huggingface.co/collections/IsValorum/apex-i-legacy-archive-v1-and-v2
- Apoyo al autor: https://ko-fi.com/isvalorum
