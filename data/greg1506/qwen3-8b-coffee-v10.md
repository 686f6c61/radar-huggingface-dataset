# greg1506/qwen3-8b-coffee-v10

## Resumen

qwen3-8b-coffee-v10 es un ajuste fino especializado en el dominio del café del modelo Qwen3-8B de Alibaba, desarrollado por el usuario greg1506 como checkpoint de referencia del proyecto `coffee-llm-v1`. El modelo combina una fase de adaptación de dominio estilo continued pretraining con LoRA sobre un corpus de café (46.000 documentos, ~109 millones de tokens ponderados de café), seguida de un SFT apilado con pares de preguntas y respuestas sintéticas y minadas mediante un servidor vLLM local de Qwen3-8B.

Su objetivo es funcionar como asistente de conocimiento cafetero autocontenido y ejecutable en local: responder preguntas factoides sobre barismo, tueste y métodos de preparación, definir terminología del sector y realizar cálculos de dosis en los formatos concretos con los que fue entrenado. Es un modelo monolingüe en inglés y deliberadamente acotado al corpus: no pretende ser un asistente generalista.

Es relevante como ejemplo de adaptación de dominio eficiente y reproducible sobre una base abierta (Apache-2.0): con solo ~109M de tokens de dominio y LoRA (r=32, alpha=64) alcanza un 0,753 de exact match y 0,789 de soft EM en su benchmark propio CoffeeBench v6 de 336 ítems retenidos. Existe además una compilación GGUF en Q4_K_M para llama.cpp, lo que facilita su despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3), ajuste fino con LoRA (r=32, alpha=64) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la base Qwen3-8B soporta 32.768 tokens, pero la model card no lo especifica para este fine-tune) |
| Tipos de cuantizacion | Q4_K_M (via build GGUF de llama.cpp); pesos base en bf16 |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (16,4 GB en el repositorio); GGUF (Q4_K_M) en repositorio derivado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder de 8B parametros, y aplica una receta de dos etapas con adaptadores LoRA (r=32, alpha=64) en bf16 con secuencias de 512 tokens y batch efectivo de 32. La primera etapa es un pase estilo continued pretraining sobre el stream de dominio de greg1506/coffee-corpus-v2: 46.000 documentos y ~93M de tokens en el corpus publico, que se expanden a ~109M de tokens ponderados de cafe en el stream de entrenamiento completo (que incluyo niveles restringidos del corpus no publicados en el Hub). Los adaptadores se fusionaron con el modelo base tras esta fase.

La segunda etapa es un SFT apilado: primero con datos sinteticos de instrucciones (rejillas de ratios de preparacion y cocientes de rendimiento de extraccion, respuestas numericas en formato plano y combinaciones retenidas para el benchmark), y despues un top-up final a learning rate bajo (3e-5, 3 epocas con parada temprana por meseta en evaluacion) sobre ~10.700 registros de Q/A sinteticos generados por un modelo profesor (un servidor vLLM local de Qwen3-8B) a partir de 6.000 documentos de entrenamiento del corpus, excluyendo pares con numeros. Un dato notable del proceso: dos rondas adicionales de minado de datos degradaron el resultado (0,753 → empate → 0,714), por lo que v10 se congelo como version de referencia. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Respuesta a preguntas factoides del dominio del cafe: perfiles de tueste (roast-map), estandares de calidad, metodos de preparacion y clasificaciones de bebidas.
- Definicion de terminologia cafetera (soft EM 0,83 en la categoria definition).
- Calculos de dosis en los regimenes entrenados: ratio-forward (0,98), ratio-inverse (0,85), solids-mass (0,93) y ey-inverse (0,74).
- Estilo conversacional orientado a asistente local de una sola lengua (ingles).
- Formato de respuesta numerica plano entrenado explicitamente en el SFT (respuestas sin texto envolvente en los items calculados).
- No se anuncia soporte de tool calling, agentes, vision ni audio; hereda lo que la base Qwen3-8B ofrezca, pero la model card no lo documenta para este fine-tune.

## Casos de uso

- Asistente de barismo en local: un barista puede consultar en un portatil con GPU de consumo (via GGUF Q4_K_M en llama.cpp u Ollama) dudas rapidas sobre ratios de preparacion, terminos de cata o metodos de extraccion sin conexion a internet.
- Calculadora de dosis y recetas de extraccion: dado un peso de cafe y un ratio objetivo, el modelo calcula el agua necesaria (ratio-forward, 0,98 EM) o el ratio a partir de dosis y rendimiento (ratio-inverse, 0,85 EM), util en formacion de personal de cafeterias.
- Formacion y onboarding de personal: como tutor conversacional que define terminos del sector (definition, 0,83 soft EM) y clasifica bebidas con leche (milk-drinks, 0,88 soft EM), adecuado para materiales de estudio internos.
- Documentacion de tueste: consulta de mapas de tueste y estandares de calidad (ambas categorias con 1,00 EM), util como referencia rapida en salas de tueste.
- Prototipado de LLMs de dominio: la model card publica la receta completa (LoRA, corpus, SFT minado), lo que lo hace util como plantilla replicable para adaptaciones de dominio similares en otros sectores.
- Base para RAG acotado: al estar limitado al corpus, encaja como componente de reescritura o resumen de consultas en un sistema RAG sobre documentacion cafetera, siempre verificando los calculos numericamente.

## Benchmarks y rendimiento

Resultados en CoffeeBench v6 (336 items retenidos, exact match bruto y soft EM robusto a estilo). No se publican comparaciones con otros modelos; la tabla es del propio autor y el benchmark es sintetico construido desde el mismo corpus de entrenamiento, por lo que debe leerse como auto-referencial.

| Categoria | Raw EM | Soft EM |
|---|---|---|
| roast-map | 1,00 | 1,00 |
| quality-standards | 1,00 | 1,00 |
| legacy-core | 1,00 | 1,00 |
| ratio-forward | 0,98 | 0,98 |
| solids-mass | 0,93 | 0,93 |
| species-origin | 0,87 | 0,93 |
| ratio-inverse | 0,85 | 0,85 |
| ey-inverse | 0,74 | 0,74 |
| method-map | 0,75 | 0,88 |
| definition | 0,67 | 0,83 |
| milk-drinks | 0,62 | 0,88 |
| classification | 0,67 | 0,67 |
| ey-forward | 0,60 | 0,62 |
| calculation | 0,00 | 0,00 |
| **Global** | **0,753** | **0,789** |

Detalle relevante: no hay particion de memorizacion; los items lejanos a la distribucion de entrenamiento puntuan igual o mejor que los proximos (0,80 frente a 0,78 de soft EM). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este fine-tune.

## Requisitos de hardware

- Pesos completos en bf16 (safetensors, 16,4 GB): se necesita al menos una GPU con ~16-18 GB de VRAM para inferencia comoda; una RTX 4090 (24 GB) lo ejecuta sin problemas.
- Build GGUF Q4_K_M (~5 GB aproximadamente para un modelo de 8B): cabe en GPUs de consumo modestas (RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB) e incluso parcialmente en CPU con RAM suficiente.
- GPU recomendadas para servir en produccion: RTX 4090 o A10G/ A100 en caso de usar pesos completos con vLLM; no se requieren H100 dado el tamano.
- Opciones de despliegue documentadas: llama.cpp (GGUF Q4_K_M oficial) y, por herencia de la base Qwen3-8B, vLLM, Ollama y transformers con text-generation-inference; la model card menciona explicitamente el uso de vLLM durante el entrenamiento.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-coffee-v10 | 8,19B | no disponible (hereda de Qwen3-8B) | Dominio cafe (fine-tune LoRA) | Apache-2.0 | safetensors + GGUF Q4_K_M en Hugging Face |
| Qwen/Qwen3-8B (base) | 8,19B | 32.768 tokens | Generalista, multilingue, modo thinking | Apache-2.0 | safetensors, GGUF comunitarios, vLLM/Ollama |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Generalista, multilingue | Licencia Meta Llama 3.1 (restricciones comerciales) | safetensors, GGUF comunitarios |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 tokens | Generalista | Apache-2.0 | safetensors, GGUF comunitarios |

Frente a su base, el fine-tune sacrifica generalidad y probablemente parte de la capacidad multilingue a cambio de precision en el dominio del cafe. Frente a alternativas generalistas de tamano similar, su ventaja es el rendimiento medible en tareas especificas del dominio y la licencia Apache-2.0 sin restricciones; su desventaja es que no es util fuera del dominio.

## Limitaciones y advertencias

- Los calculos aritmeticos hacia adelante son poco fiables (~60% en ey-forward) y fallan de forma silenciosa: el modelo responde con confianza aparente aunque el resultado sea erroneo. Verificar numericamente toda respuesta con decimales.
- La taxonomia de procesamiento tiene carencias reales (doble fermentacion keniana, pulped natural, mucilago de honey process); tratar esas respuestas como no verificadas.
- El benchmark es sintetico y se construyo desde el mismo corpus de entrenamiento (sin fuga literal, pero con la misma distribucion); no hay evaluacion ciega por expertos, de modo que las puntuaciones son auto-referenciales.
- Fuera del dominio del cafe el comportamiento no esta verificado: no es un asistente generalista.
- Monolingue en ingles; no hay garantias de calidad en castellano ni en otros idiomas.
- Contexto de secuencia entrenado a 512 tokens en las fases de LoRA, lo que sugiere que el modelo se optimizo para respuestas cortas; tareas de contexto largo no estan validadas.
- Licencia Apache-2.0 sin restricciones comerciales relevantes, pero los datos de entrenamiento incluyen registros de niveles restringidos/share-alike del corpus que no se publicaron en el Hub; revisar LICENSES.csv del dataset si se planea uso comercial.
- Rondas adicionales de entrenamiento degradaron el rendimiento (0,714 en la tercera), senal de que el modelo esta en el limite de lo que el corpus aporta; no esperar mejoras por simple escalado de datos sinteticos.

## Enlaces

- Modelo: https://huggingface.co/greg1506/qwen3-8b-coffee-v10
- Build GGUF (Q4_K_M): https://huggingface.co/greg1506/qwen3-8b-coffee-v10-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/greg1506/coffee-corpus-v2
- Paper, blog o demo: no disponible
