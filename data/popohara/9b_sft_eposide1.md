# Popohara/9B_sft_eposide1

## Resumen

Popohara/9B_sft_eposide1 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario Popohara en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto. El repositorio contiene únicamente pesos en formato safetensors compatibles con transformers, con un total de 9.653.104.368 parámetros (aproximadamente 9,65 mil millones) y un tamaño de repositorio de 19,3 GB.

El modelo hereda la arquitectura del Qwen3.5-9B de Alibaba, que combina atención lineal mediante Gated DeltaNet con atención completa con compuertas (Gated Attention) en un diseño híbrido por capas, e incorpora un entrenamiento con múltiples pasos de predicción (MTP). La ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000 tokens, lo que lo sitúa en la gama alta de modelos de ~10B para tareas de contexto largo.

La relevancia de esta ficha radica en que se trata de un ajuste fino comunitario sin métricas publicadas ni documentación propia: la model card reproduce el contenido del modelo base Qwen3.5-9B, no del ajuste. Por tanto, las capacidades descritas corresponden a la arquitectura subyacente, mientras que el comportamiento específico del ajuste SFT (datos, objetivos, evaluación) no está documentado. Se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con vision encoder: Gated DeltaNet (atención lineal) + Gated Attention, con FFN por capa |
| Parametros totales | 9.653.104.368 (≈9,65B) |
| Parametros activos | no disponible (no se documenta como MoE en la información del ajuste) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la ficha del ajuste; el modelo base declara cobertura de 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura causal con encoder de visión y un layout híbrido de 32 capas organizado en 8 bloques de la forma 3 × (Gated DeltaNet → FFN) + 1 × (Gated Attention → FFN). La dimensión oculta es 4096, el embedding y la salida LM tienen 248.320 entradas (con padding) y la FFN intermedia es de 12.288. El Gated DeltaNet usa 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; la Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. El modelo se entrenó con predicción multi-paso (MTP).

Según la documentación del modelo base, el preentrenamiento y postentrenamiento incluyen fusión temprana de tokens multimodales, entrenamiento con RL a gran escala en entornos multiagente y una infraestructura que alcanza casi el 100 % de eficiencia en entrenamiento multimodal frente a texto solo. El ajuste concreto de Popohara es un SFT (supervised fine-tuning) sobre Qwen3.5-9B-Base, pero no se especifican en la información disponible el número de tokens de ajuste, la composición del dataset, ni si hubo RLHF/DPO adicional. El nombre del repositorio ("eposide1") sugiere un ajuste por episodios o fases, sin más detalle público.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del Qwen3.5-9B, con resultados declarados de 82,5 en MMLU-Pro y 91,4 en MMLU-Redux para el modelo base.
- Comprensión de imágenes: pipeline image-text-to-text con encoder de visión y fusión temprana de tokens multimodales.
- Codificación y agentes: el modelo base se presenta como paridad o mejora frente a Qwen3-VL en razonamiento, código, agentes y comprensión visual.
- Tool calling / function calling: no documentado explícitamente en la información disponible; el modelo base se describe como compatible con despliegues tipo vLLM, SGLang y KTransformers, pero no se detalla el soporte de herramientas.
- Razonamiento multi-paso y agentes: el modelo base menciona entrenamiento RL en entornos multiagente y escalado de tareas; el ajuste SFT no documenta si preserva o altera este comportamiento.
- Multilingüismo: el modelo base declara 201 idiomas y dialectos; el ajuste no especifica idiomas.
- Contexto largo: ventana nativa de 262.144 tokens y extensión hasta 1.010.000 tokens, adecuada para documentos extensos y conversaciones multi-turno largas.
- Modo thinking: no disponible en la información del ajuste; el modelo base se compara con variantes "Thinking" de la familia Qwen3, pero no se confirma que este checkpoint exponga un modo de razonamiento explícito.

## Casos de uso

- Análisis de documentos largos con imágenes: el modelo puede procesar contratos, informes o expedientes de hasta 262.144 tokens junto con capturas, diagramas o escaneos, extrayendo y resumiendo información cruzada entre texto e imagen.
- Asistencia técnica sobre manuales y diagramas: con entrada image-text-to-text, un técnico puede subir una foto de un esquema o de un error en pantalla y obtener una explicación contextualizada, aprovechando la ventana de contexto para incluir el manual completo.
- Generación de código asistida en pipelines: el modelo base declara paridad con Qwen3 en código; el ajuste puede integrarse en entornos de desarrollo para autocompletado, revisión de parches y explicación de fragmentos de código, siempre que se valide su comportamiento tras el SFT.
- Procesamiento de documentación multilingüe: si el ajuste conserva la cobertura del base (201 idiomas), sirve para traducción, resumen y extracción de entidades en corpus con varios idiomas y material visual asociado.
- Moderación y análisis de contenido multimodal: clasificación y descripción de imágenes con texto adjunto (publicaciones, capturas, memes) en flujos de revisión, usando contexto largo para mantener el histórico de la conversación.
- Investigación en ajuste fino: al ser un SFT comunitario sobre un base de ~9,65B con licencia Apache 2.0, es un punto de partida reproducible para experimentos de ajuste con datos propios y comparación de recetas.
- Despliegue en entornos con requisitos de contexto largo: atención a clientes o asistentes internos que necesitan recordar conversaciones e historiales extensos sin truncar, gracias a la ventana nativa de 262.144 tokens.

## Benchmarks y rendimiento

Los únicos datos disponibles corresponden al modelo base Qwen3.5-9B, no al ajuste Popohara/9B_sft_eposide1. Se reproducen a continuación los valores publicados en la model card del base:

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | 91,4 (dato parcial en la información) | no disponible |

No se han publicado resultados de benchmarks del ajuste SFT en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (BF16/FP16): aproximadamente 19,3 GB solo para pesos, más overhead de activaciones, caché KV y contexto; con contexto largo (262.144 tokens) el consumo de caché KV crece de forma significativa.
- Cuantización: no se listan versiones GGUF/AWQ/GPTQ en el repositorio; para reducir VRAM habría que generar cuantizaciones propias (por ejemplo, 8 bits ≈ 10 GB, 4 bits ≈ 5-6 GB), con la pérdida de calidad correspondiente y sin validación publicada.
- GPU recomendadas: para BF16 con contexto moderado, una A100 40 GB o H100 80 GB; para contexto muy largo, H100 80 GB o múltiples GPU. En consumer, una RTX 4090 (24 GB) puede alojar los pesos en BF16 pero con margen muy ajustado para contexto largo; una RTX 3090/4090 con cuantización 8 bits es más realista.
- ¿Cabe en consumer GPU? En BF16, sí en tarjetas de 24 GB solo para contextos cortos; en cuantización 4-8 bits, sí en GPUs de 12-24 GB.
- Opciones de despliegue: transformers (formato nativo), vLLM, SGLang y KTransformers según la model card del base; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Popohara/9B_sft_eposide1 | ≈9,65B | 262.144 (ext. 1.010.000) | Apache 2.0 | safetensors | Ajuste SFT comunitario sin benchmarks publicados |
| Qwen/Qwen3.5-9B-Base | ≈9B | 262.144 (ext. 1.010.000) | Apache 2.0 | safetensors | Modelo base; benchmarks MMLU-Pro 82,5 y MMLU-Redux 91,4 |
| Qwen3.5-4B | ≈4B | no disponible | Apache 2.0 (según familia) | safetensors | Versión menor de la familia; MMLU-Pro 79,1 |
| GPT-OSS-20B | ≈20B | no disponible | no disponible | no disponible | Referencia de la comparativa del base; MMLU-Pro 74,8 |

La comparación directa con el base es la más relevante: el ajuste no publica métricas que permitan afirmar mejoras o regresiones frente a Qwen3.5-9B-Base.

## Limitaciones y advertencias

- Ausencia total de documentación del ajuste: la model card reproduce el texto del modelo base, por lo que no se sabe qué datos SFT se usaron, con qué objetivo ni qué comportamiento se modificó.
- Sin benchmarks del checkpoint: no hay evidencia publicada de que el ajuste mejore o mantenga el rendimiento del base en MMLU-Pro, código, agentes o visión.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin evaluación específica del ajuste, el riesgo no está cuantificado.
- Sesgos: no documentados para el ajuste; el base declara cobertura de 201 idiomas, pero no se publican análisis de sesgo.
- Idiomas: la ficha del ajuste no declara idiomas soportados; no se puede asumir la cobertura completa del base tras el SFT.
- Contexto: aunque la ventana nativa es de 262.144 tokens, el rendimiento efectivo en contextos muy largos no está validado para este checkpoint, y el coste de memoria de la caché KV es elevado.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un ajuste comunitario conviene verificar la procedencia de los datos de SFT, no documentada.
- Producción: sin métricas, sin versionado de datos y con 0 descargas y 0 likes, no hay señal de uso ni validación por la comunidad; no se recomienda para producción sin evaluación propia.
- Formato: solo safetensors; no hay GGUF ni cuantizaciones listas, lo que limita el despliegue en entornos de bajo consumo sin trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Popohara/9B_sft_eposide1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
