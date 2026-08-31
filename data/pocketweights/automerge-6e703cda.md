# PocketWeights/AutoMerge-6e703cda

## Resumen

AutoMerge-6e703cda es un modelo de lenguaje generado automáticamente por PocketFactory, la herramienta de fusión de modelos de PocketWeights. Se trata de una fusión (merge) entre Qwen/Qwen2.5-1.5B-Instruct y Qwen/Qwen2.5-1.5B, ambos de la familia Qwen2.5, distribuida exclusivamente en formato GGUF cuantizado. El proyecto PocketWeights se centra en ofrecer cuantizaciones optimizadas para dispositivos con 6-8 GB de VRAM, como portátiles gaming y equipos de gama media.

El modelo tiene aproximadamente 1.543 millones de parámetros (1.5B), lo que lo sitúa en la gama de modelos pequeños y eficientes. Al ser un merge de las variantes instruct y base del mismo modelo, pretende combinar las capacidades de instrucción y generación del original, aunque no se han publicado detalles técnicos sobre el método de fusión empleado. Su relevancia actual radica en que ofrece una alternativa ligera y lista para ejecutar en hardware modesto, con soporte para herramientas como Ollama y LM Studio.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que facilita su adopción en proyectos de producción. Sin embargo, al ser un artefacto generado automáticamente, carece de documentación detallada sobre su entrenamiento o evaluación, por lo que se recomienda validar su comportamiento en tareas específicas antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5, 1.5B) |
| Parametros totales | 1.543.298.048 (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5, probablemente 32.768 tokens, pero no confirmado) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 (formato GGUF) |
| Idiomas soportados | no disponible (heredados de Qwen2.5, que soporta ingles, chino y otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

Nota: Los parámetros totales se indican como dato real de safetensors, aunque el repositorio solo contiene ficheros GGUF. No se ha confirmado si el merge modifica la arquitectura original.

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal estándar. La variante de 1.5B parámetros utiliza 28 capas, 14 cabezas de atención y una dimensión oculta de 1536. No se dispone de información sobre el proceso de fusión exacto empleado por PocketFactory, ni sobre si se aplicaron técnicas como SLERP, TIES o DARE. El modelo base es Qwen2.5-1.5B-Instruct, que fue entrenado con instrucciones y preferencias humanas (RLHF), mientras que la variante base Qwen2.5-1.5B es el modelo pretrained sin fine-tuning instructivo.

Al ser un merge automático, no se ha documentado el número de tokens de entrenamiento ni la composición del dataset. El resultado combina los pesos de ambos modelos, presumiblemente para equilibrar capacidades de instrucción y generación libre. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: hereda las capacidades de Qwen2.5-1.5B-Instruct, incluyendo generación coherente y seguimiento de instrucciones.
- Razonamiento y matemáticas: el modelo base instruct tiene un rendimiento moderado en tareas de razonamiento (como GSM8K o MMLU), aunque no se han publicado benchmarks específicos para este merge.
- Generación de código: Qwen2.5-1.5B-Instruct soporta tareas básicas de código, pero no es su punto fuerte comparado con modelos especializados.
- Soporte multilingüe: Qwen2.5 soporta inglés, chino y otros idiomas, pero no se ha confirmado si el merge conserva esta capacidad completa.
- Tool calling: Qwen2.5-Instruct soporta function calling, pero no hay confirmación de que el merge mantenga esta funcionalidad.
- Formato GGUF: preparado para inferencia con llama.cpp, Ollama, LM Studio y vLLM (con adaptador GGUF).

No se dispone de información sobre capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Asistente conversacional ligero: con 1.5B parámetros y cuantización Q4_K_M, puede ejecutarse en CPUs o GPUs con 4-6 GB de VRAM, ideal para chatbots locales en portátiles o dispositivos edge.
- Generación de texto en entornos con recursos limitados: adecuado para redacción de correos, resúmenes o contenido creativo en aplicaciones donde no se dispone de hardware potente.
- Prototipado rápido de aplicaciones LLM: su formato GGUF permite integrarlo fácilmente en Ollama o LM Studio para pruebas de concepto.
- Fine-tuning posterior: al ser un modelo pequeño y con licencia Apache 2.0, puede servir como base para fine-tuning en tareas específicas con datasets reducidos.
- Educación e investigación: útil para experimentar con técnicas de merging y cuantización, o para estudiar el comportamiento de modelos pequeños.
- Despliegue en servidores de baja capacidad: con vLLM o llama.cpp, puede servir respuestas en tiempo real en infraestructura modesta (por ejemplo, Raspberry Pi 5 o NUC).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un merge automático sin evaluación documentada, por lo que no se pueden reportar números de MMLU, HumanEval, GSM8K u otros. Se recomienda consultar los benchmarks del modelo base Qwen2.5-1.5B-Instruct para una referencia aproximada, pero no se garantiza que el merge mantenga el mismo rendimiento.

## Requisitos de hardware

- VRAM estimada: con Q4_K_M (~1.1 GB de pesos), cabe en GPUs con 4 GB de VRAM; Q8_0 (~1.6 GB) requiere unos 6 GB. Se puede ejecutar en CPU con suficiente RAM (8 GB).
- GPUs recomendadas: NVIDIA GTX 1050 Ti, RTX 3050, RTX 4060, o cualquier GPU con soporte CUDA; también funciona en Apple Silicon (M1/M2) y CPUs x86 modernas.
- Compatibilidad con consumer GPU: sí, incluso en tarjetas de gama baja.
- Opciones de despliegue: Ollama (comando rápido), llama.cpp, LM Studio, vLLM (con soporte GGUF), llama-cpp-python, o servidores compatibles con OpenAI API.
- Latencia y throughput: no hay datos medidos, pero para un modelo de 1.5B en Q4_K_M, se esperan decenas de tokens por segundo en una GPU moderna (p.ej., RTX 4060) y entre 5-15 tokens/s en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AutoMerge-6e703cda | 1.5B | no disponible | Apache 2.0 | GGUF | Merge automático, sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | Apache 2.0 | safetensors, GGUF | Base oficial, con benchmarks publicados |
| Qwen2.5-1.5B | 1.5B | 32K | Apache 2.0 | safetensors, GGUF | Base sin fine-tuning instructivo |
| Llama-3.2-1B-Instruct | 1.23B | 128K | Llama 3.2 Community | safetensors, GGUF | Alternativa de Meta, contexto largo |

La comparación muestra que AutoMerge no aporta ventajas claras sobre el modelo base instruct, salvo que ya viene en GGUF optimizado. Para casos donde se requiera contexto largo, Llama-3.2-1B tiene una ventaja significativa (128K vs 32K).

## Limitaciones y advertencias

- Sesgos conocidos: al ser un merge de Qwen2.5, hereda los sesgos del modelo base, que pueden incluir sesgos culturales, de género y de idioma.
- Riesgo de alucinación: como cualquier modelo de 1.5B, tiende a generar información plausible pero incorrecta, especialmente en tareas factuales.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva del merge; puede ser inferior a la del modelo base si la fusión altera los pesos de las capas de posición.
- Sin documentación de evaluación: no hay benchmarks ni análisis de calidad, por lo que su rendimiento en tareas específicas es incierto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se incluye atribución a los autores originales de Qwen (aunque es recomendable hacerlo).
- Compatibilidad: al ser un merge no oficial, puede haber problemas de compatibilidad con frameworks que esperen la arquitectura Qwen2.5 estándar.
- Mantenimiento: el modelo fue creado automáticamente en agosto de 2026 (fecha futura en el contexto de la información) y no hay garantía de actualizaciones o soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PocketWeights/AutoMerge-6e703cda
- Perfil de PocketWeights: https://huggingface.co/PocketWeights
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base sin instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio del framework AutoMerge (referencia del nombre): https://github.com/AutoMerge-model-reuse/AutoMerge
- Repositorio de CRDT AutoMerge (no relacionado, solo por coincidencia de nombre): https://github.com/automerge/automerge
