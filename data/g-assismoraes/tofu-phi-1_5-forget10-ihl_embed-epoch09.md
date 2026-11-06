# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch09

## Resumen

El modelo `g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch09` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, a su vez un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario g-assismoraes como parte de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento asociado a un subconjunto de datos (el split "forget10") manteniendo el rendimiento sobre el resto (el split "retain"). Es, por tanto, un artefacto académico para estudiar hasta qué punto un transformer pequeño puede "olvidar" información tras un ajuste fino controlado.

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only de aproximadamente 1.400 millones de parámetros, con contexto de 2.048 tokens y entrenado originalmente por Microsoft Research para código y razonamiento de nivel básico. Este checkpoint concreto reinicializa los *input embeddings* y la *LM head* desde `microsoft/phi-1_5` y conserva el resto de pesos del modelo ajustado con TOFU, aplicando una pérdida combinada de tipo IHL (probablemente *Information-Theoretic Unlearning* o una variante de *influence-based unlearning*) sobre el split forget más una entropía cruzada ponderada (factor 1.0) sobre el split retain.

Su relevancia es metodológica, no de producto: sirve como referencia reproducible de la epoch 9 de un entrenamiento de 20 epochs para comparar estrategias de desaprendizaje. No está pensado para uso en producción ni para tareas generativas generales, y de hecho no se han publicado métricas de calidad ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code` en los tags) |
| Parametros totales | 1.418.270.720 (1,42 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Phi-1.5 usa 2.048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de 1,42 mil millones de parámetros, entrenado originalmente por Microsoft con un corpus mixto de texto sintético tipo "libro de texto" y código, orientado a razonamiento básico y generación de código. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU, que contiene biografías ficticias de autores y preguntas asociadas, diseñado específicamente para evaluar *unlearning*.

Este checkpoint concreto corresponde a la epoch 9 de un entrenamiento de 20 epochs con una estrategia denominada "IHL + Reset Both". Según la model card, los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan desde `locuslab/tofu_ft_phi-1.5`. La función de pérdida combina un término IHL sobre el split forget con una entropía cruzada estándar ponderada por 1.0 sobre el split retain. No se especifican en la información disponible el número total de tokens vistos, la composición exacta del dataset más allá de TOFU, ni si hubo etapas de RLHF o DPO. El repositorio incluye un `ihl_manifest.json` que presumiblemente documenta la configuración del experimento, aunque su contenido no se ha proporcionado.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico de nivel escolar y resolución de problemas sencillos.
- Generación de código en Python y otros lenguajes, capacidad característica de Phi-1.5.
- Ajuste fino específico para experimentos de *machine unlearning* sobre el dataset TOFU.
- No se ha documentado soporte de *tool calling* ni de *function calling*.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés según el campo `language` de la model card.
- No dispone de modo *thinking*, visión, audio ni otras modalidades.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación en la epoch 9 para medir la eficacia del algoritmo IHL frente a otras estrategias (gradient ascent, preference optimization, etc.) sobre el split forget10 de TOFU.
- Reproducibilidad de experimentos académicos: al ser un checkpoint completo y autónomo, permite reanudar o auditar el entrenamiento sin depender del estado original de `locuslab/tofu_ft_phi-1.5`.
- Evaluación de olvido selectivo: útil para estudiar si reinicializar embeddings y LM head reduce la retención de información del split forget sin degradar en exceso el split retain.
- Análisis de estabilidad del entrenamiento: al cubrir la epoch 9 de 20, permite trazar curvas de pérdida y métricas de retención a lo largo del proceso.
- Estudio de sesgos inducidos por el desaprendizaje: comparar la distribución de salidas antes y después del proceso para detectar artefactos o degradaciones.
- Docencia y formación: ejemplo práctico de un pipeline de *unlearning* con pérdida combinada y reinicialización parcial de pesos, útil en cursos de seguridad y alineamiento de modelos.
- Base para experimentos de *membership inference*: comprobar si el modelo aún "recuerda" datos del split forget mediante ataques de inferencia de pertenencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, ni métricas específicas de TOFU (como *forget quality* o *retain quality*). Tampoco se aportan comparaciones numéricas con el modelo base ni con otros checkpoints del mismo experimento.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,8-1 GB de pesos.
- GPU recomendadas para fp16: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues concurrentes.
- Cabe en GPUs de consumo: sí, en cualquier GPU con 6 GB o más en fp16 y en GPUs de 4 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el tag `custom_code`), llama.cpp si se generan GGUF, vLLM y TGI con posibles adaptaciones por el código personalizado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch09 | 1,42 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación de *unlearning* |
| locuslab/tofu_ft_phi-1.5 | 1,42 B | no disponible | Apache 2.0 (heredada) | Hugging Face | Modelo base ajustado con TOFU, sin desaprender |
| microsoft/phi-1_5 | 1,3 B | 2.048 tokens | MIT (según versión) | Hugging Face | Modelo original de Microsoft, sin ajuste TOFU |
| locuslab/tofu_llama2-7b | 7 B | 4.096 tokens | Llama 2 | Hugging Face | Alternativa de mayor tamaño para experimentos TOFU |

La comparación se limita a parámetros, contexto y licencia porque no se han publicado métricas de rendimiento para este checkpoint en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generativas generales; su calidad como generador puede haberse degradado respecto al modelo base por el proceso de *unlearning*.
- Riesgo de alucinación: como todo modelo de 1,4 B, tiende a inventar hechos, especialmente en dominios especializados; el proceso de desaprendizaje puede aumentar la incoherencia.
- Sesgos: no se han documentado evaluaciones de sesgo; el modelo hereda los sesgos de Phi-1.5 y del dataset TOFU, compuesto por biografías ficticias.
- Limitación de idioma: solo inglés según la model card; no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Limitación de contexto: no se especifica en la información disponible; el modelo base Phi-1.5 usa 2.048 tokens, por lo que contextos largos no son viables.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Phi-1.5 conviene verificar la licencia del modelo original y de `locuslab/tofu_ft_phi-1.5` antes de redistribuir.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; auditar antes de cargar en entornos sensibles.
- Sin descargas ni *likes*: no hay evidencia de uso comunitario ni de validación externa del checkpoint.
- El proceso de *unlearning* no garantiza la eliminación completa de la información del split forget; estudios previos muestran que los datos pueden recuperarse mediante ataques de extracción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch09
- Modelo base ajustado con TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de Microsoft: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Repositorio TOFU (referencia): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
