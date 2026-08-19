# rshoemake/taq-qwen32b-coder-mixed-allocator-4bit

## Resumen

El modelo `rshoemake/taq-qwen32b-coder-mixed-allocator-4bit` es una cuantización de precisión mixta del modelo de código `Qwen/Qwen2.5-Coder-32B-Instruct`, desarrollada por rshoemake mediante el método TAQ (Tail-Aware Quantization) con una estrategia de asignación adaptativa por capas (mixed-allocator). El objetivo es reducir el peso del modelo a una media de ~4 bits por peso (4,7577 bpw) manteniendo una fidelidad alta respecto a la referencia fp16, con una perplejidad en WikiText-2 de 12,2633 frente a 11,9266 del original, y una divergencia KL de 0,0287.

Esta cuantización se presenta como una alternativa a métodos uniformes como bnb-4bit o GGUF Q4_K_M, con la particularidad de que los pesos están realmente empaquetados a nivel de byte y son cargables por kernels, no una simulación. El repositorio incluye resultados de evaluación en generación de código (EvalPlus) y fidelidad, lo que permite comparar directamente el impacto de la cuantización frente a la referencia fp16 y a otros métodos.

La relevancia de este modelo radica en su enfoque de cuantización adaptativa por capas, que busca optimizar la asignación de bits según la sensibilidad de cada capa, algo que puede interesar a desarrolladores que necesitan desplegar modelos de 32B en hardware con VRAM limitada sin renunciar a un rendimiento cercano al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen2.5-Coder-32B-Instruct (transformers decoder-only) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda del modelo base, presumiblemente 128K, pero no se confirma) |
| Tipos de cuantizacion | TAQ mixed-allocator 4-bit (bpw 4,7577) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato personalizado TAQ, byte-packed) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `Qwen/Qwen2.5-Coder-32B-Instruct`, que sigue la arquitectura Qwen2 (transformer decoder-only) con atención causal y un contexto nativo de 128K tokens. La cuantización TAQ aplica una estrategia de asignación mixta de bits por capa: en lugar de usar un ancho de bits uniforme (por ejemplo, 4 bits en todas las capas), el allocator adaptativo decide cuántos bits asignar a cada capa según su sensibilidad, buscando minimizar la pérdida de fidelidad a un coste total fijo. El resultado es un modelo con una media de 4,7577 bits por peso.

No se proporcionan detalles sobre el entrenamiento del modelo base (datos, número de tokens, RLHF, etc.). La cuantización se evaluó con WikiText-2 (perplejidad y divergencia KL frente a fp16) y con EvalPlus (HumanEval y MBPP) mediante generación real y ejecución, no análisis estático.

## Capacidades

- Generacion de codigo: el modelo base es un instruct de codigo, y la cuantizacion mantiene un rendimiento cercano al original en tareas de programacion (HumanEval pass@1 0,8720, MBPP pass@1 0,8571 en el conjunto base).
- Razonamiento y comprension del lenguaje: hereda las capacidades del modelo base, aunque no se han verificado especificamente en esta version cuantizada.
- Soporte de tool calling y agentes: no se menciona en la informacion disponible; se asume que las capacidades del modelo base estan presentes, pero no hay confirmacion.
- Capacidades multilingues: no disponibles.
- Formato de pesos optimizado para carga en kernels: los pesos estan empaquetados a nivel de byte, lo que permite una carga eficiente en inferencia.

## Casos de uso

- Despliegue de un asistente de codigo en entornos con VRAM limitada: el modelo cuantizado a ~4 bits permite ejecutar un modelo de 32B en GPUs de consumo como RTX 4090 (24 GB) o similares, manteniendo una calidad de generacion cercana a la del original.
- Generacion de codigo en pipelines de CI/CD: gracias a su licencia Apache-2.0 y a que es un modelo de instrucciones, puede integrarse en flujos automatizados para generar pruebas, documentacion o fragmentos de codigo.
- Prototipado rapido de aplicaciones de asistencia a programacion: al ser un checkpoint listo para cargar con kernels personalizados, es adecuado para experimentar con inferencia local sin necesidad de infraestructura en la nube.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye comparativas detalladas con otros metodos (bnb-4bit, GGUF Q4_K_M, otras estrategias TAQ), lo que lo hace util como referencia en estudios de compresion de modelos.
- Uso como base para fine-tuning posterior: aunque es un modelo cuantizado, podria servir como punto de partida para experimentos de adaptacion con recursos limitados, siempre que se respete la licencia.
- Investigacion en eficiencia de inferencia: el formato byte-packed y la estrategia mixta de asignacion de bits pueden interesar a quienes estudian el impacto de la cuantizacion adaptativa en modelos grandes.

## Benchmarks y rendimiento

La model card proporciona resultados de fidelidad y de generacion de codigo. Se presentan a continuacion.

**Fidelidad (WikiText-2, evaluacion pareada de 40 muestras)**

| Metrica | Referencia fp16 | Este modelo |
|---|---:|---:|
| Perplejidad | 11,9266 | 12,2633 |
| Divergencia KL vs fp16 | — | 0,0287 |
| bpw | 16,0 | 4,7577 |

**Generacion de codigo (EvalPlus, pass@1)**

| Dataset | Base | Base + Extra |
|---|---:|---:|
| HumanEval(+) | 0,8720 | 0,8232 |
| MBPP(+) | 0,8571 | 0,7293 |

**Comparativa con otros metodos de cuantizacion para el mismo modelo base**

| Arm | bpw | HumanEval Base | HumanEval +Extra | MBPP Base | MBPP +Extra |
|---|---:|---:|---:|---:|---:|
| fp16 (referencia) | 16,0 | 0,9024 | 0,8598 | 0,8647 | 0,7268 |
| Unsloth bnb-4bit | 4,6919 | 0,9024 | 0,8720 | 0,8596 | 0,7293 |
| GGUF Q4_K_M (Unsloth) | 4,8471 | 0,8902 | 0,8293 | 0,8546 | 0,7293 |
| naive_rowwise_4bit | 4,7594 | 0,8902 | 0,8415 | 0,8521 | 0,7268 |
| outlier_4bit | 4,7594 | 0,8780 | 0,8293 | 0,8571 | 0,7193 |
| rotation_outlier_4bit | 4,7784 | 0,9024 | 0,8537 | 0,8521 | 0,7168 |
| **mixed_allocator_4bit (este modelo)** | 4,7577 | 0,8720 | 0,8232 | 0,8571 | 0,7293 |

El autor advierte que este modelo no supera a todos en todas las columnas: iguala a Unsloth bnb-4bit en MBPP+Extra (0,7293) y queda practicamente empatado en MBPP Base (0,8571 vs 0,8596), pero es inferior en HumanEval a rotation_outlier_4bit, Unsloth y GGUF Q4_K_M. Su ventaja se manifiesta mas claramente en la fidelidad (PPL/KLD) que en pass@1, que tiene mayor varianza debido al bajo numero de tareas (164 en HumanEval, 399 en MBPP).

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la informacion disponible. A partir del tamaño del modelo (32.763.876.352 parametros) y de la cuantizacion a ~4,76 bpw, se puede estimar que el checkpoint ocupa aproximadamente 65,5 GB en disco (tamano del repositorio), pero en memoria para inferencia el peso cuantizado ocuparia en torno a 15-16 GB (32B × 4,76 bits / 8 ≈ 15,2 GB). Esto permitiria ejecutarlo en GPUs con 24 GB de VRAM, como una RTX 4090 o A5000, aunque no hay confirmacion oficial.

- VRAM estimada para inferencia: ~16 GB para los pesos, mas overhead de activaciones y KV cache (no especificado).
- GPU recomendadas: no hay lista oficial; se sugiere una GPU con al menos 24 GB de VRAM para un uso comodo.
- Compatibilidad con consumer GPU: probablemente si en RTX 4090 (24 GB) o similares, pero sin garantia.
- Opciones de despliegue: no se mencionan frameworks especificos; el formato personalizado TAQ sugiere que se necesita un kernel propio o adaptaciones a vLLM, llama.cpp, etc. No hay informacion sobre compatibilidad con herramientas estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa mas directa es con el modelo base fp16 y con otras cuantizaciones del mismo modelo. Se puede comparar tambien con otros modelos de codigo de tamano similar, pero no hay datos en la informacion proporcionada.

| Modelo | Parametros | bpw | HumanEval Base | MBPP Base | Licencia |
|---|---:|---:|---:|---:|---|
| Qwen2.5-Coder-32B-Instruct (fp16) | 32,76B | 16,0 | 0,9024 | 0,8647 | Apache-2.0 |
| **TAQ mixed_allocator_4bit (este)** | 32,76B | 4,7577 | 0,8720 | 0,8571 | Apache-2.0 |
| Unsloth bnb-4bit | 32,76B | 4,6919 | 0,9024 | 0,8596 | Apache-2.0 |
| GGUF Q4_K_M (Unsloth) | 32,76B | 4,8471 | 0,8902 | 0,8546 | Apache-2.0 |

En terminos de rendimiento, este modelo esta ligeramente por debajo de las alternativas de cuantizacion uniforme en HumanEval, pero practicamente igual en MBPP. Su ventaja esta en la fidelidad (menor KLD) frente a otras estrategias TAQ, aunque no se compara con bnb-4bit o GGUF en ese aspecto.

## Limitaciones y advertencias

- Es una cuantizacion experimental: el autor indica que no supera a todos los metodos en todas las metricas, y que la varianza en EvalPlus es alta.
- No se han publicado resultados de benchmarks mas alla de WikiText-2 y EvalPlus; no hay datos sobre alucinacion, sesgos o seguridad.
- El formato de pesos es personalizado (TAQ), lo que puede limitar la compatibilidad con frameworks de inferencia estandar (vLLM, llama.cpp, Ollama) hasta que se implementen kernels especificos.
- No hay informacion sobre idiomas soportados ni sobre la longitud de contexto efectiva tras la cuantizacion.
- El repositorio tiene solo 8 descargas y 0 likes, lo que indica que es un proyecto muy reciente y poco validado por la comunidad.
- Aunque la licencia es Apache-2.0, el uso comercial es posible, pero se recomienda verificar la procedencia del modelo base y las condiciones de la cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rshoemake/taq-qwen32b-coder-mixed-allocator-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Repos hermanos del autor (mencionados en la model card): `rshoemake/taq-qwen32b-coder-*` (no se proporcionan URLs directas)
