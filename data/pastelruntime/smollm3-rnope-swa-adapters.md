# PastelRuntime/SmolLM3-RNoPE-SWA-Adapters

## Resumen

SmolLM3-RNoPE-SWA-Adapters es un conjunto de adaptadores LoRA publicados por PastelRuntime sobre el modelo base HuggingFaceTB/SmolLM3-3B. Forma parte de un experimento pre-registrado que investiga si la recuperación de contexto largo sobrevive cuando se limita la atención de las capas RoPE a una ventana deslizante de 8k, siempre que el adaptador se entrene bajo esa misma ventana. El modelo base es un transformer híbrido de 36 capas (27 con RoPE y 9 sin embedding posicional, cada cuarta capa), con 64k de contexto nativo ampliable a 128k mediante YaRN, atención GQA y embeddings atados.

La relevancia de este trabajo radica en que el windowing de atención en inferencia reduce el coste computacional entre un 11 % y un 21 %, pero destruye la recuperación de información más allá de la ventana en el modelo sin adaptar. El adaptador "treatment" (entrenado con la ventana activa) restaura la recuperación perfecta (5/5) en pruebas needle-in-haystack hasta 64k, lo que sugiere que es posible combinar eficiencia de ventana con capacidades de contexto largo si el entrenamiento se realiza en las mismas condiciones. El repositorio incluye también un adaptador "control" entrenado sin ventana, para comparación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32) sobre SmolLM3-3B, transformer híbrido RoPE/NoPE con GQA |
| Parametros totales | No disponible (el adaptador es de 0.1 GB; el modelo base tiene 3B) |
| Parametros activos | No aplica (LoRA, no es MoE) |
| Longitud de contexto | 64k nativo, 128k con YaRN (del modelo base) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre SmolLM3-3B, un modelo de 36 capas con una arquitectura híbrida: 27 capas usan RoPE (rotary position embedding) y 9 capas (cada cuarta) no usan ningún embedding posicional (NoPE), siguiendo la propuesta del paper RNoPE (arXiv:2501.18795). El modelo base incorpora atención GQA para reducir el tamaño de la caché KV, embeddings atados y modos duales de razonamiento `/think` y `/no_think`. El adaptador LoRA tiene rank 32 y se entrena en dos variantes: `treatment` (con la ventana deslizante de 8k activa en las capas RoPE durante el entrenamiento) y `control` (misma receta pero sin ventana). Los detalles completos del entrenamiento, kernels y resultados crudos están disponibles en el repositorio GitHub del autor.

## Capacidades

- Recuperación de contexto largo bajo inferencia con ventana: el adaptador `treatment` logra 5/5 aciertos en needle-in-haystack a 8k, 16k, 32k y 64k, mientras que el modelo base sin adaptar obtiene 0/5 más allá de 8k cuando se aplica windowing solo en inferencia.
- Compatibilidad con el modelo base SmolLM3-3B, que incluye generación con modos `/think` y `/no_think`, atención GQA y soporte de contexto largo nativo.
- No es un modelo independiente: requiere cargar el adaptador sobre el base mediante PEFT.
- No se han documentado capacidades adicionales como tool calling, visión o audio; el experimento se centra exclusivamente en atención y recuperación.

## Casos de uso

- Investigación en atención de ventana deslizante: permite estudiar cómo el entrenamiento con ventana afecta a la recuperación de información en modelos híbridos RoPE/NoPE, con un setup reproducible y pre-registrado.
- Despliegue eficiente de modelos de contexto largo: al aplicar windowing en inferencia se reduce el coste computacional (11-21 % más rápido) y, con el adaptador `treatment`, se mantiene la recuperación hasta 64k, lo que puede ser útil en entornos con restricciones de latencia o memoria.
- Fine-tuning experimental sobre SmolLM3-3B: sirve como punto de partida para probar otras configuraciones de ventana, ranks de LoRA o datasets de entrenamiento.
- Evaluación de metodologías de evaluación de contexto largo: los resultados needle-in-haystack del experimento pueden usarse como referencia para comparar otras técnicas de extensión de contexto.
- Educación y divulgación: el repositorio incluye el pre-registro, kernels y resultados crudos, lo que lo convierte en un caso de estudio didáctico sobre diseño experimental en IA.
- Benchmarking de adaptadores LoRA: permite comparar el efecto de entrenar con o sin ventana sobre el mismo modelo base, aislado de otras variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento documentado es la prueba needle-in-haystack, resumida en la siguiente tabla:

| Configuración | 8k | 16k | 32k | 64k |
|---|---|---|---|---|
| Modelo base sin ventana (inferencia normal) | No disponible | No disponible | No disponible | No disponible |
| Modelo base con windowing en inferencia | 5/5 (presumible) | 0/5 | 0/5 | 0/5 |
| Adaptador `treatment` con windowing | 5/5 | 5/5 | 5/5 | 5/5 |
| Adaptador `control` con windowing | No disponible | No disponible | No disponible | No disponible |

Los datos de la fila "modelo base con windowing" indican que la recuperación se pierde más allá de 8k (0/5), mientras que el adaptador `treatment` la restaura completamente. No se especifican resultados para el adaptador `control` ni para el modelo base sin windowing.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del adaptador.
- Al ser un adaptador LoRA sobre un modelo de 3B, la inferencia requiere cargar el modelo base completo. Con cuantización (por ejemplo, 4 bits) puede caber en GPUs consumer como RTX 3090 o RTX 4090 (24 GB VRAM), pero no hay datos confirmados.
- Para el entrenamiento del adaptador, se necesitaría al menos una GPU con suficiente VRAM para el modelo base en bfloat16 (aproximadamente 6-8 GB) más el overhead de LoRA; no se especifica el hardware utilizado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede usar con transformers y peft, o exportar a GGUF para llama.cpp/Ollama si se fusiona con el base, aunque no hay instrucciones oficiales para ello.
- Latencia y throughput: no disponibles; el único dato es que el windowing en inferencia es entre un 11 % y un 21 % más rápido que la inferencia sin ventana.

## Comparativa con modelos similares

No hay modelos directamente comparables en la información proporcionada, ya que se trata de un adaptador experimental específico para SmolLM3-3B. Como referencia, se puede comparar con el propio modelo base sin adaptar y con el adaptador `control`:

| Modelo | Parámetros | Contexto | Recuperación >8k con windowing | Licencia |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 64k (128k con YaRN) | 0/5 | Apache-2.0 |
| SmolLM3-3B + adaptador `treatment` | 3B + LoRA rank 32 | 64k (128k con YaRN) | 5/5 | Apache-2.0 |
| SmolLM3-3B + adaptador `control` | 3B + LoRA rank 32 | 64k (128k con YaRN) | No disponible | Apache-2.0 |

No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, otros adaptadores de ventana o modelos de contexto largo) en la información recopilada.

## Limitaciones y advertencias

- Es un adaptador experimental, no un modelo listo para producción; no se han evaluado tareas generales de lenguaje, razonamiento o generación de código.
- Depende completamente del modelo base SmolLM3-3B; no funciona de forma independiente y requiere cargarlo con PEFT.
- Los resultados de needle-in-haystack son específicos de la configuración del experimento (ventana de 8k, rank 32, etc.) y pueden no generalizar a otras configuraciones o datasets.
- No se han documentado sesgos, riesgos de alucinación o limitaciones idiomáticas; al ser un adaptador sobre un modelo base, hereda las limitaciones de este último.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es un trabajo de investigación reciente y poco validado externamente.

## Enlaces

- HuggingFace: https://huggingface.co/PastelRuntime/SmolLM3-RNoPE-SWA-Adapters
- Repositorio GitHub del experimento: https://github.com/PastelRuntime/smollm3-research
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Documentación de SmolLM3 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/smollm3
- Paper RNoPE (referencia de la arquitectura híbrida): arXiv:2501.18795
