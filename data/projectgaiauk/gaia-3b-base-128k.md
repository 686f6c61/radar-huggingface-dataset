# ProjectGaiaUK/gaia-3b-base-128k

## Resumen

`gaia-3b-base-128k` es un modelo de lenguaje de 3.000 millones de parámetros (2.976.033.792 exactos) desarrollado por Project Gaia, el proyecto de investigación de MyPetSitter Ltd (Reino Unido), bajo la financiación de UKRI AIRR y entrenado en el supercomputador Isambard-AI. Se trata de un modelo base preentrenado desde cero sobre 150.000 millones de tokens de texto en inglés, rumano, código, matemáticas y contenido sobre cuidado de mascotas, publicado con licencia Apache-2.0 como punto de partida reproducible para los modelos chat derivados del proyecto.

La relevancia técnica del modelo reside en dos decisiones de diseño: un tokenizador BPE de 32.768 tokens entrenado conjuntamente para inglés y rumano (que reduce el coste en tokens del rumano a 1,08× respecto al inglés, frente a 1,86× de vocabularios solo en inglés del mismo tamaño) y una ventana de contexto de 131.072 tokens alcanzada mediante tres fases de entrenamiento continuado con RoPE theta escalado hasta 64.000.000. Es un transformer decoder-only tipo Llama con atención GQA (24 cabezas de consulta, 6 de clave-valor) y FFN SwiGLU.

El modelo no está afinado para conversar ni seguir instrucciones: continúa texto. Su interés es fundamentalmente de investigación y como base para fine-tuning, no como asistente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), pre-norm RMSNorm, GQA, SwiGLU, RoPE |
| Parametros totales | 2.976.033.792 (2.774.707.200 sin las dos matrices de embedding) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en bfloat16; no se documentan versiones GGUF ni AWQ/GPTQ) |
| Idiomas soportados | Inglés (~60 % de tokens), rumano (8,5 %); además Python, JavaScript, TypeScript y matemáticas web |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un único `model.safetensors` en bfloat16, 5.952.097.048 bytes) |

Detalles adicionales de arquitectura: 28 capas, `d_model` 3.072, 24 cabezas de consulta con 6 cabezas de clave-valor compartidas (GQA), tamaño de cabeza 128, sin biases, FFN SwiGLU con dimensión oculta 8.192, RMSNorm con eps 1e-5 en float32, vocabulario de 32.768 tokens BPE byte-level (16 reservados, ids 0–15) y embeddings de entrada y salida no atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only convencional con el bloque pre-norm RMSNorm → atención GQA con RoPE → residual → RMSNorm → SwiGLU → residual, repetido 28 veces, con una RMSNorm final y una cabeza lineal. El checkpoint exportado usa el formato Llama sin reordenación de pesos. La posición se codifica con RoPE cuyo theta se incrementa en cada fase de contexto: 500.000 a 2.048 tokens, 4.000.000 a 8.192, 16.000.000 a 32.768 y 64.000.000 a 131.072, sin escalado de posiciones.

El entrenamiento consta de cuatro fases ejecutadas sobre dos nodos con 4 GPU NVIDIA GH200 cada uno en Isambard-AI, con AdamW, autocast en bfloat16, ZeRO-1 y `torch.compile`. La fase principal (`gaia-3b-round1`, 18–29 de octubre de 2026) procesó 150.011.904.000 tokens (50,4 por parámetro) en 152.600 pasos de 983.040 tokens, con warm-up de 2.000 pasos hasta 6,0e-4 y decaimiento a 6,0e-5 en el último 20 %, consumiendo 1.706,83 horas GPU (más unas 185 fuera del registro de Slurm). Las fases de 8k, 32k y 128k añadieron aproximadamente 2,99 mil millones de tokens cada una en 2.850 pasos de 1.048.576 tokens, con learning rate 6,0e-5 con decaimiento coseno a 6,0e-6. La fase de 8k consumió 48,72 horas GPU; las de 32k y 128k no tienen horas medidas en los registros (la de 32k se dimensionó en unas 101). Cada fase parte de los pesos de la anterior con un optimizador nuevo. No se documenta RLHF ni DPO: es un modelo puramente preentrenado.

## Capacidades

- Generación de texto por continuación: completa secuencias dado un prefijo, sin formato conversacional ni paradas aprendidas.
- Modelado de lenguaje en inglés y rumano con reparto de vocabulario equilibrado entre ambos idiomas.
- Generación de código en Python, JavaScript y TypeScript, además de expresiones y contenido matemático web.
- Manejo de contexto largo: ventana de 131.072 tokens entrenada explícitamente en tres fases, adecuada para documentos extensos y recuperación de información en contexto.
- Capacidad de razonamiento y matemáticas derivada del preentrenamiento, sin afinado específico (no se reportan métricas en la información disponible).
- No soporta tool calling ni function calling de forma nativa.
- No soporta comportamiento de agente ni razonamiento multi-paso orquestado: al ser un modelo base, no ha sido entrenado para ello.
- Sin capacidades de visión, audio ni modo "thinking".
- Multilingüismo limitado a inglés y rumano (más código); no se documentan otros idiomas.

## Casos de uso

- Fine-tuning supervisado para asistentes conversacionales: el modelo sirve como inicialización para SFT y DPO, tal como hace el propio proyecto con `gaia-3b-chat`; su contexto de 131.072 tokens permite entrenar diálogos con historiales largos sin truncar.
- Investigación sobre tokenizadores multilingües: permite reproducir y extender el experimento del proyecto sobre el coste en tokens del rumano frente al inglés con vocabularios conjuntos de 32.768 tokens.
- Procesamiento de documentos largos en rumano e inglés: resumen, extracción o clasificación sobre contratos, informes o expedientes que quepan en 131.072 tokens, con un modelo autoalojado de 3B que cabe en una sola GPU.
- Generación de código asistida en pipelines internos: al haber visto Python, JavaScript y TypeScript, puede usarse como base para fine-tuning en autocompletado de código o generación de tests en entornos con requisitos de soberanía de datos.
- Sustitución de APIs de pago en pymes de cuidado de mascotas: el objetivo declarado del proyecto es que un modelo pequeño autoalojado reemplace una API medida en coste para negocios del sector, tras el correspondiente fine-tuning.
- Base para modelos especializados de dominio: con 150.000 millones de tokens ya vistos y licencia Apache-2.0, es un punto de partida barato (3B parámetros) para adaptar a dominios verticales con presupuestos de cómputo modestos.
- Evaluación de técnicas de contexto largo: la progresión de RoPE theta documentada (500k → 4M → 16M → 64M) lo convierte en un caso de estudio reproducible para investigar extrapolación de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las cifras de calidad de respuesta, corrección, seguridad y derivación se midieron solo en los modelos chat derivados, no en este modelo base, y que las métricas del modelo base son recuentos automáticos (pérdida, passkey, scorer) que no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 6 GB solo para pesos, más caché KV y activaciones; con contexto de 131.072 tokens la caché KV crece de forma notable (28 capas × 6 cabezas KV × 128 dimensiones × 2 por K y V × 2 bytes por valor ≈ 88 KB por token, es decir, del orden de 11,5 GB para la ventana completa).
- GPU recomendadas: A100 40/80 GB, H100, L40S o GH200 para contexto completo sin cuantizar; una RTX 4090 (24 GB) es suficiente para contextos moderados en bfloat16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) o superiores para contextos cortos o medios; para contexto completo conviene cuantización o GPUs de 40 GB o más.
- Opciones de despliegue: transformers con `text-generation-inference` (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`); no se documentan versiones GGUF para llama.cpp u Ollama, por lo que su uso en esas herramientas requeriría conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| gaia-3b-base-128k | 2,98B | 131.072 | Apache-2.0 | en, ro | Modelo base, sin benchmarks publicados; vocabulario conjunto en/ro |
| Llama 3.2 3B | 3,2B | 131.072 | Llama 3.2 Community License | multilingüe (8 idiomas oficiales) | Base e instruct; ampliamente evaluado; licencia con restricciones para >700M usuarios |
| Qwen2.5 3B | 3,1B | 32.768 (128k en variantes) | Apache-2.0 (mayoría de tamaños) | multilingüe (29 idiomas) | Base e instruct; benchmarks publicados |
| Phi-3-mini | 3,8B | 4.096 (128k en variante long) | MIT | principalmente inglés | Base e instruct; orientado a razonamiento y código |

La comparación cuantitativa de rendimiento no es posible porque gaia-3b-base-128k no publica resultados de benchmarks en la información disponible.

## Limitaciones y advertencias

- Es un modelo base sin afinado conversacional: no sigue instrucciones, no mantiene formato de diálogo y no sabe cuándo detenerse; usarlo directamente como asistente produce continuaciones, no respuestas.
- Riesgo de alucinación no evaluado en este modelo; la model card señala que la corrección y la seguridad solo se midieron en los modelos chat derivados.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgos en la información disponible; el corpus incluye contenido sobre cuidado de mascotas y código, lo que puede desequilibrar la distribución temática.
- Cobertura lingüística limitada a inglés y rumano (más código); el rendimiento en otros idiomas no está medido y probablemente sea deficiente.
- La ventana de 131.072 tokens se entrenó con aproximadamente 2,99 mil millones de tokens por fase; la calidad de recuperación en el extremo de la ventana no está cuantificada en la información disponible.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el modelo se distribuye tal cual, sin garantías y sin evaluación de seguridad para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documentan versiones cuantizadas ni integraciones con llama.cpp u Ollama, lo que limita su adopción inmediata en despliegues de consumo.
- El proyecto declara que la financiación de UKRI no constituye un aval del producto.

## Enlaces

- Hugging Face: https://huggingface.co/ProjectGaiaUK/gaia-3b-base-128k
- Modelo chat derivado: https://huggingface.co/ProjectGaiaUK/gaia-3b-chat
- Modelo 1B del proyecto: `gaia-1b-round1` (referenciado en la model card; sin URL directa en la información disponible)
- Referencia de Isambard-AI: McIntosh-Smith, S., Alam, S. R. y Woods, C. (2024). "Isambard-AI: a leadership class supercomputer optimised specifically for Artificial Intelligence"
- Documentación interna citada en la model card (no enlazada): `docs/AIRR_GATEWAY_APPLICATION.md`, `docs/RUNLOG_3B.md`, `docs/LONG_CONTEXT_8K.md`, `docs/LONG_CONTEXT_128K.md`
