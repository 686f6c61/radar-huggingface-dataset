# Akahsizrr/voltron-1.1-mini

## Resumen

Voltron-1.1 Mini es un modelo de lenguaje de 1,73B parámetros activos (aproximadamente 1,99B parámetros totales almacenados en BF16) desarrollado por el usuario independiente Akahsizrr. Se trata de un ajuste fino del modelo Voltron-1 Mini, que a su vez deriva del LiquidAI/LFM3-1.7B de Liquid AI. El objetivo declarado es mejorar de forma sustancial las capacidades de razonamiento, generación de código y seguimiento de instrucciones del modelo base, manteniendo total compatibilidad con vLLM y Transformers sin necesidad de código de inferencia personalizado.

El modelo se apoya en la arquitectura tri-híbrida `Lfm3ForCausalLM` de 24 capas, que combina 13 capas de convolución corta con compuertas, 5 capas de atención de ventana deslizante y 6 capas de atención global completa. Esta mezcla busca reducir el coste computacional de la atención tradicional manteniendo un contexto muy amplio: 262.144 tokens, con un vocabulario de 128.000 tokens que incluye etiquetas nativas de razonamiento `<think>` y `</think>`.

La relevancia del modelo radica en su relación entre tamaño y rendimiento reportado: con menos de 2B parámetros, el autor declara mejoras superiores a los 20 puntos porcentuales en HumanEval y de casi 12 puntos en AIME 2026 respecto al modelo base LFM3-1.7B. El post-entrenamiento se realizó mediante un método propietario denominado Policy Temperature Optimisation (PTO), del que se anuncia una publicación técnica futura. El modelo tiene cero descargas y cero likes en el momento de la ficha, y su licencia es la LFM Open License heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm3ForCausalLM` tri-híbrida (24 capas: 13 conv, 5 sliding_attention, 6 full_attention) |
| Parametros totales | 1.990.945.536 (~1,99B en BF16, `tie_word_embeddings=false`) |
| Parametros activos | 1,73B (backbone activo declarado) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License (heredada de LiquidAI/LFM3-1.7B), etiquetada como "other" |
| Formato de pesos | `model.safetensors` en BF16, compatible con vLLM y Transformers |
| Dimension oculta / FFN | d_model = 2.048, SwiGLU d_ff = 7.680, 16 cabezas de consulta / 4 de KV (head_dim = 128) |
| Vocabulario | 128.000 tokens (tokenizer LFM3 compartido, con etiquetas `<think>`/`</think>`) |
| Modelo base | LiquidAI/LFM3-1.7B → Akahsizrr/voltron-1-mini → Akahsizrr/voltron-1.1-mini |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 24 capas que intercala tres tipos de bloque: 13 capas de convolución corta con compuertas (gated short-convolution), 5 capas de atención de ventana deslizante y 6 capas de atención global completa. Esta combinación reduce el coste cuadrático de la atención en la mayor parte de la red y permite sostener una ventana de contexto de 262.144 tokens. La dimensión oculta es de 2.048, con una FFN SwiGLU de 7.680 y un esquema de atención con 16 cabezas de consulta y 4 de clave-valor (head_dim de 128), lo que reduce el coste de memoria del KV cache. El vocabulario de 128.000 tokens incorpora etiquetas nativas de razonamiento `<think>` y `</think>`, de modo que el modo de pensamiento se activa a nivel de plantilla de chat.

El entrenamiento parte de LiquidAI/LFM3-1.7B y pasa por un primer ajuste (Voltron-1 Mini) antes de llegar a esta versión 1.1. El autor declara que el post-entrenamiento se realizó con Policy Temperature Optimisation (PTO), un método propio diseñado para mejorar simultáneamente el razonamiento especializado y la generación de código sin degradar el seguimiento de instrucciones ni provocar olvido catastrófico. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO convencionales; la formulación matemática, las ablaciones y el análisis de PTO quedan pendientes de una publicación anunciada pero no disponible.

## Capacidades

- Generación de texto conversacional y de instrucciones multi-turno.
- Razonamiento matemático de competición, con modo de pensamiento activable mediante las etiquetas `<think>` y `</think>`.
- Generación de código en Python y otros lenguajes, evaluada en HumanEval y LiveCodeBench.
- Razonamiento científico de nivel avanzado (evaluado en GPQA Diamond).
- Seguimiento estricto de instrucciones con restricciones verificables (IFEval).
- Contexto largo de hasta 262.144 tokens, apto para documentos extensos y conversaciones prolongadas.
- Compatibilidad nativa con vLLM y Transformers, incluido el servidor compatible con la API de OpenAI de vLLM.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo de pensamiento y el contexto largo lo habilitan de forma implícita.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistencia en programación dentro del IDE: el modelo puede generar funciones completas y resolver problemas algorítmicos (búsqueda binaria, programación dinámica, grafos) con un pass@1 del 85,98% en HumanEval, adecuado para autocompletado y revisión de código en entornos de desarrollo.
- Resolución de problemas matemáticos paso a paso: con modo de pensamiento activado y 262.144 tokens de contexto, puede abordar problemas de competición y demostraciones largas manteniendo el razonamiento intermedio visible mediante las etiquetas `<think>`.
- Procesamiento de documentos extensos: la ventana de contexto permite ingerir contratos, informes técnicos o bases de código completas en una sola pasada para tareas de resumen, extracción y preguntas y respuestas sobre el contenido.
- Evaluación y filtrado de código en pipelines de CI/CD: su rendimiento en LiveCodeBench (29,60% pass@1 en `test6`) lo hace útil como generador de parches candidatos o de tests unitarios que luego se validan automáticamente.
- Tutoring técnico y educativo: puede explicar conceptos de matemáticas y ciencias con razonamiento explícito, útil en plataformas de aprendizaje que necesitan mostrar el proceso de resolución y no solo la respuesta.
- Prototipado rápido en local: con menos de 2B parámetros en BF16 (unos 4 GB de pesos), cabe en GPUs de consumo para experimentación y demos sin depender de infraestructura en la nube.
- Servicio de inferencia de bajo coste: desplegado con vLLM y su servidor compatible con la API de OpenAI, puede sustituir a modelos mayores en tareas de instrucción y código donde el coste por token y la latencia sean críticos.

## Benchmarks y rendimiento

Resultados declarados por el autor, ejecutados en BF16 con vLLM, modo de pensamiento activado y muestreo con semilla fija. Suites completas: LiveCodeBench `test6` (175 problemas × 5 muestras), HumanEval (164 problemas × 1 muestra), AIME 2026 (30 problemas × 4 muestras), IFEval (541 prompts con los 25 verificadores oficiales) y GPQA Diamond (198 preguntas).

| Benchmark | LFM3-1.7B (base) | Voltron-1 Mini (v1) | Voltron-1.1 Mini | Δ vs base | Δ vs v1 |
|---|---|---|---|---|---|
| LiveCodeBench `test6` pass@1 | 20,11% | 24,34% | 29,60% | +9,49 pp | +5,26 pp |
| LiveCodeBench `test6` pass@5 | 25,71% | 32,57% | 34,86% | +9,15 pp | +2,29 pp |
| HumanEval pass@1 | 64,02% | 67,07% | 85,98% | +21,96 pp | +18,91 pp |
| AIME 2026 accuracy | 40,80% | 44,20% | 52,50% | +11,70 pp | +8,30 pp |
| AIME 2026 pass@any (4 muestras) | 50,00% | 56,70% | 70,00% (21/30) | +20,00 pp | +13,30 pp |
| IFEval strict (541 prompts) | 72,46% | 72,09% | 81,70% | +9,24 pp | +9,61 pp |
| IFEval loose (541 prompts) | 77,82% | 75,60% | 83,36% | +5,54 pp | +7,76 pp |
| GPQA Diamond (198 preguntas) | 42,93% | 46,46% | 50,00% | +7,07 pp | +3,54 pp |

El autor incluye además una tabla de referencia con puntuaciones externas de otros modelos, que él mismo advierte que usan prompts, harnesses y ajustes de muestreo distintos y solo sirven como contexto de escala:

| Benchmark | LFM2.5-2.6B (vendor/AA) | Qwen3-4B-Instruct-2507 (vendor) | Voltron-1.1 Mini (1.7B) |
|---|---|---|---|
| AIME | 51,9% (AIME 2025) | 47,4% (AIME 2025) | 52,5% (AIME 2026) / 70,0% pass@any |
| HumanEval / HumanEval+ | 83,1% (HumanEval+) | 77,6% | 86,0% (HumanEval) |
| IFEval | 95,4% | 83,4% | 81,7% strict / 83,4% loose |
| GPQA Diamond | 55,8% | 62,0% | 50,0% |

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 4 GB solo para los pesos (1,99B parámetros × 2 bytes), más el KV cache. Con contexto de 262.144 tokens el KV cache puede crecer de forma considerable; para ventanas largas se recomienda GPU con 24 GB o más.
- GPU recomendadas: A100 (40/80 GB) o H100 para contexto completo y alto throughput; RTX 4090 (24 GB) para contexto largo o despliegue en producción de un solo nodo; RTX 3090/4080 (16-24 GB) para contexto medio.
- GPU de consumo: sí cabe en GPUs de consumo. En BF16 los pesos ocupan unos 4 GB, por lo que una RTX 3060 de 12 GB o superior permite inferencia con contexto moderado. Para contexto muy largo conviene cuantizar o limitar la ventana.
- Opciones de despliegue: vLLM (recomendado por el autor, con `--trust-remote-code` y `--dtype bfloat16`), Transformers con `AutoModelForCausalLM` y `trust_remote_code=True`. No se documentan pesos GGUF, por lo que llama.cpp y Ollama no están soportados de forma nativa en la información disponible; TGI no se menciona.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | AIME | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Voltron-1.1 Mini | 1,73B activos (~1,99B totales) | 262.144 | 85,98% pass@1 | 52,5% (2026) | 50,0% | LFM Open License | Hugging Face |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible en la información | 64,02% pass@1 | 40,8% (2026) | 42,93% | LFM Open License | Hugging Face |
| Voltron-1 Mini | ~1,7B | no disponible en la información | 67,07% pass@1 | 44,2% (2026) | 46,46% | LFM Open License (heredada) | Hugging Face |
| LFM2.5-2.6B | 2,6B | no disponible en la información | 83,1% (HumanEval+) | 51,9% (2025) | 55,8% | no disponible en la información | Hugging Face |
| Qwen3-4B-Instruct-2507 | 4B | no disponible en la información | 77,6% | 47,4% (2025) | 62,0% | no disponible en la información | Hugging Face |

Las cifras de LFM2.5-2.6B y Qwen3-4B-Instruct-2507 proceden de harnesses y prompts distintos según el propio autor, por lo que la comparación es orientativa y no estrictamente equivalente.

## Limitaciones y advertencias

- Modelo de autor independiente con cero descargas y cero likes en el momento de la ficha: no hay validación externa ni replicación independiente de los benchmarks declarados.
- El método de entrenamiento PTO no está publicado; no existe documentación técnica revisada que permita auditar el proceso de post-entrenamiento.
- Riesgo de alucinación inherente a un modelo de 1,7B parámetros, especialmente en tareas de razonamiento de varios pasos y en contextos largos donde la información relevante queda lejos del final de la ventana.
- Idiomas soportados no documentados: no hay garantía de calidad fuera del inglés, y el comportamiento en castellano no está verificado.
- Licencia LFM Open License con implicaciones comerciales que deben revisarse antes de uso en producción; el campo de Hugging Face aparece como "other" y no se detallan las restricciones en la información disponible.
- Requiere `trust_remote_code=True` en Transformers y vLLM, lo que implica ejecutar código remoto del repositorio del autor.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware con poca VRAM o en herramientas como llama.cpp y Ollama.
- Sin datos de latencia, throughput ni consumo de memoria del KV cache a máxima longitud de contexto.
- El contexto de 262.144 tokens, aunque declarado, no está validado con benchmarks de contexto largo (por ejemplo, RULER o Needle-in-a-Haystack) en la información disponible.
- Los benchmarks comparativos con modelos de otros fabricantes usan harnesses distintos y no son directamente equiparables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akahsizrr/voltron-1.1-mini
- Modelo base inmediato (Voltron-1 Mini): https://huggingface.co/Akahsizrr/voltron-1-mini
- Modelo base original (LiquidAI/LFM3-1.7B): https://huggingface.co/LiquidAI/LFM3-1.7B
- Gráfico de benchmarks del autor: `benchmark_chart.png` en el repositorio de Hugging Face
- Paper técnico de Policy Temperature Optimisation: anunciado como "forthcoming", no disponible en el momento de la ficha
