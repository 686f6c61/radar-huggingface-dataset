# 0arch-io/kisoku-3b-base

## Resumen

Kisoku 3B Base es un modelo de lenguaje de 3.562.712.064 parámetros (aproximadamente 3,56 mil millones) entrenado desde cero, es decir, sin inicializar con pesos preentrenados de ningún otro modelo. Lo desarrolla 0arch-io, el sello de un investigador individual (Joseph Rodriguez, 0ARCH), como proyecto de investigación sobre preentrenamiento de LLM en infraestructura TPU. La arquitectura es un transformer decoder-only tipo Llama, con 28 capas, atención con grouped-query attention (24 cabezas de consulta y 6 de clave/valor), embeddings atados y una ventana de contexto de 4096 tokens.

El modelo se entrenó con MaxText (JAX) sobre un TPU v4-32 de Google Cloud, cedido a través del programa TPU Research Cloud (TRC), durante 460.000 pasos sobre mezclas de DCLM-Baseline 1.0 y FineWeb-Edu en precisión bfloat16. Es un modelo base, no ajustado por instrucciones; la variante alineada se publica aparte como kisoku-3b-sft.

Su relevancia es fundamentalmente metodológica y educativa: documenta un pipeline completo de preentrenamiento desde cero en JAX/TPU con licencia Apache 2.0, algo poco habitual en modelos de este tamaño. Ahora bien, el propio autor advierte de que el modelo está significativamente subentrenado y de que ha sido superado por su release posterior, Kisoku 1.6B, que constituye la versión vigente del proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), GQA, RoPE, SiLU, embeddings atados |
| Parámetros totales | 3.562.712.064 (3,56 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | no disponible oficialmente; el repositorio solo contiene pesos bf16 en safetensors. Al ser compatible con la arquitectura Llama, admite conversión a GGUF (Q8/Q5/Q4) o AWQ/GPTQ mediante herramientas de terceros |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); repositorio de 7,1 GB |

Otros hiperparámetros declarados: 28 capas, hidden size 3072, tamaño de FFN 8192, 24 cabezas de atención, 6 cabezas KV, dimensión de cabeza 128, vocabulario de 128.256 tokens y RoPE con theta 500.000.

## Arquitectura y entrenamiento

El modelo sigue el diseño Llama estándar: bloques transformer con atención multi-cabeza con consultas agrupadas (GQA, ratio 4:1 entre cabezas de consulta y de clave/valor), normalización previa y FFN con activación SiLU. Emplea embeddings de entrada y salida atados, lo que reduce el recuento de parámetros dado el vocabulario de 128.256 tokens, y codificación posicional rotatoria con theta 500.000, un valor alto pensado para sostener contextos largos aunque la ventana declarada se queda en 4096 tokens. La implementación de referencia es MaxText sobre JAX, lo que implica que el checkpoint se generó en un stack distinto al de PyTorch/Hugging Face y que la conversión a `LlamaForCausalLM` es una capa de compatibilidad.

El entrenamiento se ejecutó en un TPU v4-32 (32 chips, modo on-demand) con precisión bfloat16 durante 460.000 pasos. Los datos proceden de DCLM-Baseline 1.0 y FineWeb-Edu, dos corpus web filtrados por calidad y orientados a contenido educativo. La model card no especifica el número total de tokens vistos ni la composición exacta de la mezcla, y tampoco documenta fases de RLHF, DPO o ajuste por instrucciones: se trata de un checkpoint puramente preentrenado. El propio autor reconoce que el modelo está subentrenado y que los modelos de 3B competitivos requieren entre 2 y 11 billones de tokens, muy por encima de lo utilizado aquí.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje en inglés; no hay ajuste por instrucciones, por lo que no mantiene formato de chat ni sigue instrucciones de forma fiable.
- Razonamiento básico y respuesta a preguntas de opción múltiple, con resultados próximos al azar en ARC-Challenge (0,262) y HellaSwag (0,300), lo que refleja un conocimiento factual y de sentido común limitado.
- Completado de texto y continuación de documentos en inglés, el uso más razonable para un checkpoint base con este nivel de entrenamiento.
- Soporte de tool calling / function calling: no disponible; no se ha entrenado ni evaluado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés declarado; no se han publicado evaluaciones en otros idiomas.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponibles.
- Extracción de representaciones internas para experimentos de investigación, dado que el checkpoint es íntegro y la arquitectura es estándar.

## Casos de uso

- Investigación sobre preentrenamiento desde cero: sirve como caso reproducible de un pipeline completo en MaxText/JAX sobre TPU, con hiperparámetros, número de pasos y hardware documentados, útil para estudiar curvas de entrenamiento y decisiones de diseño a escala de 3B.
- Punto de partida para preentrenamiento continuado (continued pretraining): al ser Apache 2.0 y no tener alineación previa, se puede seguir entrenando con más tokens o con datos de dominio (legal, biomédico, código) sin restricciones de licencia, aunque el punto de partida es débil y requiere un volumen de datos considerable.
- Base para ajuste supervisado en dominios acotados: con un dataset SFT específico y suficiente (por ejemplo, clasificación de tickets o generación de resúmenes de un corpus concreto) se puede adaptar el modelo a una tarea estrecha, aceptando que su conocimiento general es limitado.
- Banco de pruebas de cuantización y despliegue: sus 3,56 B de parámetros y su compatibilidad con `LlamaForCausalLM` permiten medir conversión a GGUF, cuantización de 8 y 4 bits, y comparar latencia y perplejidad entre llama.cpp, vLLM y TGI en hardware de consumo.
- Docencia y formación técnica: el repositorio y el registro de entrenamiento permiten explicar de forma práctica cómo se construye un tokenizer de 128.256 entradas, cómo se configura GQA o RoPE, y cómo se evalua un modelo con lm-evaluation-harness en un caso real.
- Ablaciones controladas de arquitectura: al tener embeddings atados, GQA 4:1 y contexto de 4096 tokens, sirve para estudiar el efecto de estas decisiones frente a variantes del mismo tamaño, siempre dentro de un régimen de entrenamiento corto.
- Evaluación de infraestructura de evaluación: útil para validar harnesses, pipelines de evaluación 0-shot y métricas como acc_norm con 500 muestras, comprobando cómo se comportan con un modelo de rendimiento bajo y conocido.

## Benchmarks y rendimiento

Resultados declarados por el autor, obtenidos con lm-evaluation-harness v0.4.11, 0-shot y 500 muestras por tarea. Ninguno está verificado de forma independiente (`verified: false`).

| Benchmark | Métrica | Resultado | Referencia aleatoria |
|---|---|---|---|
| HellaSwag | acc_norm | 0,300 | 0,25 |
| ARC-Challenge | acc_norm | 0,262 | 0,25 |
| WinoGrande | acc | 0,508 | 0,50 |
| TruthfulQA MC2 | acc | 0,493 | 0,25 (dos opciones) |

Los cuatro resultados se sitúan muy cerca del rendimiento aleatorio, lo que confirma la advertencia de la model card: el modelo está claramente subentrenado. No se han publicado resultados de MMLU, GSM8K, HumanEval ni de evaluaciones multilingües en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 7,1 GB solo para pesos, más la caché KV. La caché KV en bf16 ocupa unos 84 KB por token (28 capas × 6 cabezas KV × 128 dimensiones × 2 tensores × 2 bytes), es decir, unos 344 MB a 4096 tokens y alrededor de 2,7 GB con un lote de 8 secuencias a contexto completo.
- Presupuesto total realista: 9-11 GB en bf16 para una sola secuencia con contexto lleno; 11-14 GB con lotes pequeños.
- Cuantización: en int8 los pesos bajan a unos 3,6 GB; en Q4 a unos 2 GB, de modo que el modelo cabe en GPUs de 8 GB con cuantización agresiva.
- GPU consumer: sí cabe. RTX 4090 (24 GB) y RTX 4080 (16 GB) lo ejecutan con holgura en bf16; RTX 3090/4070 Ti (12 GB) lo admiten en bf16 con contexto moderado o en int8; GPUs de 8 GB requieren Q4.
- GPU de datacenter: A100 40/80 GB, H100 y L40S están sobredimensionadas para un modelo de este tamaño; su interés sería el throughput por lote, no la capacidad.
- Opciones de despliegue: vLLM y TGI mediante la arquitectura `LlamaForCausalLM`; llama.cpp/Ollama previa conversión a GGUF; el stack original es MaxText/JAX, útil si se quiere reproducir el entrenamiento en TPU.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de arquitectura y licencia de los modelos comparados son referencia pública; sus puntuaciones de benchmark no están incluidas en la información proporcionada, por lo que no se comparan numéricamente.

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| kisoku-3b-base | 3,56 B | 4096 | Apache 2.0 | Base, subentrenado, sin alineación |
| Kisoku 1.6B | 1,60 B | 64K (según el repositorio del proyecto) | Apache 2.0 (según el proyecto) | Release vigente del mismo autor, ~0,5 T tokens vistos |
| Llama 3.2 3B | ~3,2 B | 128K | Licencia comunitaria Llama 3.2 | Base e instruct, ampliamente evaluado |
| Qwen2.5-3B | ~3,1 B | 32K | Apache 2.0 | Base e instruct, multilingüe |
| Pythia-2.8B | ~2,8 B | 2048 | Apache 2.0 | Base, con checkpoints intermedios públicos |

Frente a estas alternativas, kisoku-3b-base ofrece una licencia permisiva y un proceso de entrenamiento totalmente documentado y reproducible, pero parte en desventaja clara en volumen de datos, longitud de contexto (4096 frente a 32K-128K) y ausencia de variantes alineadas. El propio autor sitúa su modelo posterior, Kisoku 1.6B, como la referencia actual del proyecto.

## Limitaciones y advertencias

- Modelo subentrenado: el autor lo declara explícitamente y los benchmarks (0,262 en ARC-Challenge, 0,300 en HellaSwag) confirman un rendimiento próximo al azar en tareas de conocimiento y sentido común.
- Solo inglés: no se han publicado evaluaciones en castellano ni en otros idiomas; el vocabulario y los datos están orientados a inglés.
- Sin alineación ni filtrado de contenido: no hay RLHF, DPO ni moderación, por lo que puede generar contenido inapropiado, tóxico o falso sin restricción alguna.
- Modelo base, no instruct: no sigue instrucciones de forma fiable ni mantiene un formato de conversación; requiere ajuste adicional para cualquier uso conversacional.
- Riesgo elevado de alucinación: con un conocimiento factual limitado y una calibración no entrenada, las afirmaciones inventadas son esperables; no debe usarse como fuente de verdad sin verificación externa.
- Contexto corto: 4096 tokens limitan casos de uso que requieran documentación extensa o conversaciones largas.
- Benchmarks no verificados: proceden del `model-index` del autor, con 500 muestras por tarea y sin replicación independiente; la incertidumbre estadística con ese tamaño de muestra es apreciable.
- Estado del release: la propia model card marca esta versión como superada (superseded) por Kisoku 1.6B, lo que desaconseja adoptarla para proyectos nuevos.
- Licencia Apache 2.0: permite uso comercial y modificaciones sin restricciones adicionales, pero se distribuye sin garantías; conviene revisar que los corpus de entrenamiento (DCLM-Baseline, FineWeb-Edu) no impongan condiciones adicionales en el contexto de uso previsto.
- Compatibilidad: el checkpoint se generó en JAX/MaxText; la carga en PyTorch/Hugging Face depende de la conversión incluida, que conviene validar antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0arch-io/kisoku-3b-base
- Variante ajustada por instrucciones: https://huggingface.co/0arch-io/kisoku-3b-sft
- Página del proyecto Kisoku (log de entrenamiento, gráficas y run instructions): https://0arch.io/kisoku
- Repositorio del proyecto en GitHub: https://github.com/0arch-io/kisoku
- Release Kisoku 1.6B en GitHub: https://github.com/0arch-io/kisoku/tree/main/release/kisoku-1.6b
- Modelo Kisoku 1.6B en Hugging Face: https://huggingface.co/0arch-io/kisoku-1.6b
- Página de 0ARCH Core: https://0arch.io/core
- MaxText (framework de entrenamiento, JAX): https://github.com/AI-Hypercomputer/maxtext
- Google TPU Research Cloud (TRC): https://sites.research.google/trc/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Dataset DCLM-Baseline 1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Artículo de análisis del proyecto Kisoku: https://undercodetesting.com/building-an-efficient-16-billion-parameter-language-model-from-scratch-the-kisoku-project-breakdown-video/
