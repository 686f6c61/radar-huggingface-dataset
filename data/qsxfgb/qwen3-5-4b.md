# qsxfgb/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo de lenguaje causal multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba, publicado en este repositorio por el usuario `qsxfgb` como artefacto derivado del checkpoint base `Qwen/Qwen3.5-Base`. Con 4.659.865.088 parámetros totales (aproximadamente 4B), está diseñado para ofrecer capacidades de razonamiento, codificación, agentes y comprensión visual en un tamaño compacto desplegable en hardware de consumo.

La arquitectura es híbrida: combina capas de atención lineal Gated DeltaNet con capas de atención completa (Gated Attention) en un patrón repetido 8 veces, e incorpora un encoder de visión para el procesamiento de imágenes. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000 tokens, lo que lo sitúa en la gama alta de ventanas de contexto para su tamaño. La licencia es Apache 2.0.

El modelo es relevante porque condensa capacidades multimodales y de contexto largo en un único checkpoint de ~9,3 GB en safetensors, compatible con Transformers, vLLM, SGLang y KTransformers. Su pipeline declarado es `image-text-to-text`, lo que lo hace apto para tareas que combinan texto e imagen sin necesidad de un modelo de visión separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión; capas Gated DeltaNet (atención lineal) intercaladas con Gated Attention |
| Parámetros totales | 4.659.865.088 (~4B) |
| Parámetros activos | No disponible (no se declara como MoE en la información proporcionada) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | 201 idiomas y dialectos (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB); compatible con Transformers, vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

El modelo sigue un diseño de transformer causal con encoder de visión y una disposición de capas híbrida: 8 bloques repetidos de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`, lo que da un total de 32 capas. Las capas Gated DeltaNet emplean atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128. Las capas Gated Attention usan 16 cabezas para Q y 4 para KV, dimensión de cabeza 256 y dimensión de RoPE de 64. La dimensión oculta es 2560, la dimensión intermedia del FFN es 9216 y el embedding de tokens (con padding) es de 248.320, atado a la salida LM. El modelo entrena con multi-token prediction (MTP) en varios pasos.

El entrenamiento combina pre-entrenamiento y post-entrenamiento, con fusión temprana de tokens multimodales (early fusion), entrenamiento con RL a escala en entornos multi-agente y una infraestructura que alcanza cerca del 100 % de eficiencia en entrenamiento multimodal respecto al entrenamiento solo de texto. La model card menciona paridad cross-generacional con Qwen3 y superación de los modelos Qwen3-VL en razonamiento, codificación, agentes y comprensión visual. No se especifica el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento multimodal (entrada de imagen y texto).
- Comprensión visual: el pipeline `image-text-to-text` y el encoder de visión permiten tareas de VQA y descripción de imágenes.
- Razonamiento, codificación y matemáticas, con resultados declarados en benchmarks de conocimiento y STEM.
- Capacidades de agente y razonamiento multi-paso, reforzadas mediante RL en entornos multi-agente.
- Soporte multilingüe amplio: 201 idiomas y dialectos según la model card.
- Contexto largo: ventana nativa de 262.144 tokens, extensible a ~1M.
- Compatibilidad con tool calling / function calling: no se detalla explícitamente en la información proporcionada, aunque el pipeline conversacional y los tags `endpoints_compatible` sugieren integración en APIs.
- Modo thinking: no se confirma explícitamente en la información disponible.

## Casos de uso

- Análisis de documentos largos con imágenes: el modelo puede procesar contratos, informes o manuales de hasta 262.144 tokens e interpretar diagramas o capturas incrustadas, gracias a su contexto nativo y encoder de visión.
- Atención al cliente multimodal: gestión de conversaciones multi-turno donde el usuario adjunta capturas de pantalla o fotos de producto, con contexto suficiente para mantener el hilo durante sesiones extensas.
- Generación y revisión de código en pipelines de CI/CD: su rendimiento declarado en benchmarks de codificación y su compatibilidad con vLLM/SGLang permiten integrarlo como servicio de revisión o autocompletado.
- Extracción de información de facturas y formularios escaneados: combinación de OCR implícito vía visión y razonamiento sobre texto para poblar bases de datos estructuradas.
- Asistencia educativa multilingüe: explicación de conceptos STEM en cualquiera de los 201 idiomas soportados, con capacidad de razonar sobre figuras y gráficos.
- Agentes autónomos de navegación o automatización: el entrenamiento con RL en entornos multi-agente y el soporte de contexto largo lo hacen adecuado para tareas de planificación multi-paso con historial extenso.
- Búsqueda semántica y RAG sobre corpus extensos: la ventana de 262K tokens permite incluir muchos fragmentos recuperados sin truncamiento agresivo.

## Benchmarks y rendimiento

Resultados declarados en la model card (categoría conocimiento y STEM):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | 92,5 | no disponible en el extracto |

No se dispone en la información proporcionada del resto de filas de la tabla de benchmarks (codificación, matemáticas, agentes, visión), por lo que no se presentan datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 16-24 GB para contexto moderado.
- Cuantización a 8 bits: ~5 GB de pesos; a 4 bits: ~2,5-3 GB, aunque no se confirman formatos GGUF/AWQ oficiales en la información disponible.
- GPU recomendadas: A100 40/80 GB o H100 para contexto máximo (262K-1M tokens); RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 con contexto limitado, y en GPUs de 8-12 GB con cuantización agresiva (sujeto a disponibilidad de formatos cuantizados, no confirmada).
- Opciones de despliegue: Transformers, vLLM, SGLang, KTransformers (según la model card).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B | ~4B | 262K (ext. 1M) | 79,1 | Apache 2.0 | Hugging Face (este repo) |
| Qwen3.5-9B | ~9B | no disponible | 82,5 | Apache 2.0 (presumible) | Hugging Face (Qwen) |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE, 3B activos) | no disponible | 80,9 | no disponible | Hugging Face (Qwen) |
| GPT-OSS-20B | 20B | no disponible | 74,8 | no disponible | no disponible |

Qwen3.5-4B ofrece un equilibrio competitivo: supera a GPT-OSS-20B en MMLU-Pro pese a tener una quinta parte de parámetros, y queda por debajo del Qwen3.5-9B y del Qwen3-Next-80B. Su ventaja principal frente a alternativas de mayor tamaño es el despliegue en hardware de consumo con contexto muy largo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; todo modelo entrenado con datos web hereda sesgos sociales y culturales.
- Riesgo de alucinación: presente como en cualquier LLM; la ventana de contexto larga no elimina el riesgo de fabricar datos, especialmente en tareas de extracción.
- Limitaciones de idioma: aunque se declaran 201 idiomas, el rendimiento puede degradarse en lenguas de bajos recursos; no se aportan métricas por idioma.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base original (`Qwen/Qwen3.5-4B-Base`) y de los datos de entrenamiento.
- Repositorio derivado: este checkpoint lo publica el usuario `qsxfgb`, no el equipo oficial de Qwen; no hay garantías de integridad, y el número de descargas y likes es 0, lo que indica falta de validación comunitaria.
- No se confirman formatos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que puede limitar el despliegue en GPUs pequeñas.
- El extracto de benchmarks está incompleto; no deben extrapolarse conclusiones sobre codificación, matemáticas o visión.

## Enlaces

- Hugging Face: https://huggingface.co/qsxfgb/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog oficial Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
