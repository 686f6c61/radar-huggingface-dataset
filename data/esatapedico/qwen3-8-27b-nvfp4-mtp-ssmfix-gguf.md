# esatapedico/Qwen3.8-27B-NVFP4-MTP-SSMFIX-GGUF

## Resumen

Qwen3.8-27B-NVFP4-MTP-SSMFIX-GGUF es una familia experimental de ocho archivos GGUF que aplica una modificación de pesos conocida como "SSMFIX" al modelo Qwen3.8-27B. El modelo base, desarrollado por Alibaba y cuantizado por Unsloth en formato NVFP4, es un VLM nativo de 27 000 millones de parámetros con arquitectura híbrida Gated DeltaNet + Gated Attention, contexto nativo de 262 144 tokens y una cabeza MTP (multi-token prediction) integrada para decodificación especulativa. El repositorio, publicado por esatapedico, empaqueta una idea comunitaria no verificada que corrige las desviaciones estándar infladas de ocho kernels conv1d en las capas SSM tardías (52, 53, 56, 57, 58, 60, 61 y 62) mediante factores de escala por capa.

El SSMFIX se originó en el análisis de LuffyTheFox (denominado "Sig-ScaleSync"), fue formalizado en una receta concreta por redashes y validado estadísticamente de forma independiente por FGDumitru. El autor del repositorio no reclama crédito por la idea: su contribución es exclusivamente mecánica, aplicando las alphas publicadas dentro de los archivos GGUF y verificando los bytes. La evidencia sobre la utilidad de la corrección es genuinamente contradictoria: redashes reporta ganancias en TruthfulQA-gen y GSM8K, pero pérdidas en CMMLU y MT-Bench, mientras que froggeric observa degradación de perplejidad en todas las longitudes de contexto. No se han publicado resultados de contexto largo, que es el escenario motivador de la corrección.

Este repositorio no es el primero en empaquetar SSMFIX en GGUF: ya existían conversiones de Luis23333 y grimoni. Su valor es ofrecer la escalera de cuantización NVFP4 del autor (ORIG, VERY-LOW, COMPACT-LOW, LOW, MEDIUM, HIGH, VERY-HIGH) con la modificación aplicada, para usuarios de llama.cpp y otros motores GGUF que no quieran convertir los pesos por sí mismos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet + Gated Attention híbrida (VLM nativo) |
| Parámetros totales | 27 000 millones (el metadato de HF indica 460 730 096, posiblemente erróneo; el modelo base es de 27B) |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | NVFP4 (8 niveles: ORIG, VERY-LOW, COMPACT-LOW, LOW, MEDIUM, HIGH, VERY-HIGH) |
| Idiomas soportados | Inglés y multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, emplea una arquitectura híbrida que combina Gated DeltaNet y Gated Attention. Esta disposición permite manejar ventanas de contexto muy largas (262 144 tokens) con una eficiencia computacional superior a la de un transformer denso puro. La cabeza MTP (multi-token prediction) está integrada en los pesos, de modo que no se requiere un modelo drafter separado para decodificación especulativa; esto reduce la latencia de inferencia en comparación con los esquemas de especulación clásicos. El modelo es multimodal nativo: incluye un proyector de visión que permite procesar imágenes junto con texto.

La modificación SSMFIX se aplica sobre ocho capas SSM tardías (52, 53, 56, 57, 58, 60, 61 y 62). El diagnóstico identifica que las desviaciones estándar de los kernels de convolución unidimensional (`conv1d`) en estas capas están infladas respecto a lo esperable por el entrenamiento, lo que podría provocar bucles de repetición o truncamiento en contextos muy largos. La corrección multiplica los pesos de cada kernel por un factor de escala (alpha) específico por capa, derivado por redashes en su receta "v2". El proceso de entrenamiento del modelo base no se detalla en la información proporcionada, pero se sabe que Qwen3.8-27B es un modelo denso preentrenado con técnicas de alineación estándar de la familia Qwen (RLHF/DPO no se confirma en la documentación disponible).

## Capacidades

- Generación de texto y razonamiento: capaz de producir texto coherente y razonamiento multi-paso en tareas de lenguaje natural.
- Razonamiento matemático: el modelo base muestra competencia en problemas aritméticos y algebraicos (GSM8K y otros benchmarks).
- Generación de código: soporta la escritura de código en varios lenguajes de programación.
- Comprensión y generación de imágenes: al ser un VLM nativo, puede procesar imágenes y responder preguntas sobre su contenido.
- Tool calling / function calling: el modelo base Qwen3.8-27B soporta invocación de herramientas, aunque no se especifica en la documentación de este repositorio si la cuantización NVFP4 conserva esta capacidad completa.
- Soporte para agentes y razonamiento multi-paso: puede encadenar acciones y razonar sobre ellas.
- Capacidades multilingües: el modelo base está entrenado en inglés y otros idiomas, aunque el nivel de competencia en cada uno no se detalla.
- Decodificación especulativa integrada: la cabeza MTP permite acelerar la generación sin necesidad de un drafter separado.
- Modo thinking: no se menciona explícitamente si el modelo incluye un modo de razonamiento extendido tipo "thinking" como en Qwen3.5.

## Casos de uso

- Validación experimental de la corrección SSMF: el caso de uso principal es probar la hipótesis de que la corrección de las desviaciones estándar de los `conv1d` en capas tardías mejora el comportamiento en contextos largos. Un investigador puede cargar estos GGUF en llama.cpp, generar secuencias de más de 75 000 tokens y comparar la tasa de repetición o truncamiento con el modelo original sin SSMF.
- Evaluación de perplejidad en ventanas de 4K a 128K: para contrastar los hallazgos de froggeric, que observó degradación de perplejidad en todas las longitudes, se puede reproducir el experimento con estos archivos GGUF y comparar con los del repositorio hermano sin SSMF.
- Pruebas de calidad de respuesta en tareas de veracidad: dado el reporte de redashes de una mejora de +6 a +8 puntos en TruthfulQA-gen, se puede evaluar si esa ganancia se mantiene en cuantización NVFP4 y en los distintos niveles de la escalera.
- Benchmarking de decodificación especulativa en hardware Blackwell: los archivos NVFP4 están optimizados para GPUs Blackwell (serie RTX 40 y B100/B200), por lo que un usuario puede medir el throughput de tokens por segundo con la cabeza MTP integrada y comparar con la inferencia sin especulación.
- Uso como modelo base para experimentos de fine-tuning: aunque es una cuantización y no un checkpoint de entrenamiento, se puede usar como punto de partida para pruebas de adaptación de bajo rango (LoRA) en tareas específicas, siempre que el framework soporte pesos GGUF.
- Despliegue en entornos con memoria limitada: gracias a la cuantización NVFP4 y los niveles de tamaño (desde ORIG hasta VERY-HIGH), es posible ejecutar el modelo en GPUs con VRAM de 24 GB o menos, permitiendo pruebas de visión y texto en estaciones de trabajo de gama media.

## Benchmarks y rendimiento

La información disponible presenta resultados mixtos de evaluaciones realizadas por la comunidad, no por el autor del repositorio. No hay benchmarks oficiales del modelo cuantizado NVFP4 con SSMF.

| Benchmark | Resultado (SSMF BF16, redashes) | Resultado (SSMF NVFP4, no disponible) | Comparación con oficial |
|---|---|---|---|
| TruthfulQA-gen | +6 a +8 puntos | no disponible | Mejora |
| GSM8K | pequeñas ganancias | no disponible | Mejora leve |
| IFEval | pequeñas ganancias | no disponible | Mejora leve |
| CMMLU | −1.8 pp | no disponible | Degradación |
| MT-Bench | −0.19 | no disponible | Degradación |
| Perplejidad (4K–128K, froggeric) | degradada en todas las longitudes | no disponible | Degradación |
| Needle-in-a-haystack (NIAH) | sin mejora | no disponible | Sin cambio |
| Repetición (NIAH) | sin mejora | no disponible | Sin cambio |

No se han publicado resultados de contexto largo (>75K tokens), que es el escenario motivador de la corrección.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del nivel de cuantización. Los archivos GGUF NVFP4 de un modelo de 27B suelen ocupar entre 10 y 15 GB por archivo (la familia completa suma 140.2 GB, pero cada nivel es individual). El nivel ORIG probablemente requiere ~15 GB, y los niveles más bajos (VERY-LOW, COMPACT-LOW) pueden caber en 8 GB.
- GPU recomendadas: NVIDIA Blackwell (RTX 4090, RTX 4080, RTX 4070, B200, B100) para aprovechar el formato NVFP4 nativo. Las GPU Ampere o Turing pueden ejecutar el modelo, pero sin soporte nativo de NVFP4 el rendimiento se degrada.
- Compatibilidad con GPU consumer: sí, es viable en RTX 4090 (24 GB) y RTX 4080 (16 GB) con los niveles más bajos. En RTX 4070 (12 GB) probablemente solo quepan los niveles VERY-LOW o COMPACT-LOW.
- Opciones de despliegue: llama.cpp (compatible con GGUF y MTP), Ollama (si acepta GGUF con MTP), vLLM (con soporte GGUF experimental), text-generation-inference (TGI) si se convierte a safetensors.
- Latencia y throughput: no se han publicado mediciones específicas para este repositorio. La cabeza MTP integrada debería mejorar el throughput frente a la decodificación autoregresiva clásica, pero el valor exacto depende del hardware y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | SSMF aplicado |
|---|---|---|---|---|---|
| esatapedico/Qwen3.8-27B-NVFP4-MTP-GGUF | 27B | 262 144 | NVFP4 | Apache-2.0 | No |
| esatapedico/Qwen3.8-27B-NVFP4-MTP-SSMFIX-GGUF | 27B | 262 144 | NVFP4 | Apache-2.0 | Sí |
| redashes/Qwen3.8-27B-BF16-SSMFIX | 27B | 262 144 | BF16 | Apache-2.0 | Sí (checkpoint safetensors) |
| Luis23333/Qwen3.8-27B-SSMFIX-UD-Q3_K_XL-GGUF | 27B | 262 144 | Q3_K_XL | Apache-2.0 | Sí |
| grimoni/Qwen3.8-27B-SSMFIX-UD-Q4_K_XL-GGUF | 27B | 262 144 | Q4_K_XL | Apache-2.0 | Sí |

La diferencia clave frente a las alternativas es el formato NVFP4 optimizado para Blackwell, la integración de la cabeza MTP sin drafter separado y la escalera de 8 niveles de cuantización. La principal competencia son los GGUF de cuantización clásica (Q3_K_XL, Q4_K_XL) que no aprovechan NVFP4 y pueden requerir más VRAM para el mismo nivel de calidad.

## Limitaciones y advertencias

- Es un experimento no verificado: el propio autor advierte que "buenos resultados no están garantizados" y que "resultados malos o peores no son improbables".
- Evidencia contradictoria: mientras redashes reporta mejoras en TruthfulQA y GSM8K, froggeric observa degradación de perplejidad en todas las longitudes de contexto y sin mejora en NIAH o repetición. La utilidad de la corrección sigue siendo incierta.
- Sin validación de contexto largo: no hay resultados publicados más allá de ~75K tokens, que es exactamente el escenario donde se esperaría que la corrección tuviera efecto.
- Riesgo de alucinación y sesgos: al ser una modificación de pesos sin reentrenamiento, los sesgos del modelo base se conservan; la corrección no aborda riesgos de alucinación o sesgos sociodemográficos.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el autor recomienda usar la versión no experimental (esatapedico/Qwen3.8-27B-NVFP4-MTP-GGUF) si se busca estabilidad.
- Dependencia de hardware Blackwell: el formato NVFP4 no es nativo en GPUs no Blackwell, lo que limita el despliegue en hardware antiguo.
- Errores de metadatos: el dato de parámetros totales en HuggingFace (460 730 096) es inconsistente con un modelo de 27B; probablemente es un error de los metadatos del repositorio.

## Enlaces

- Repositorio HuggingFace: [esatapedico/Qwen3.8-27B-NVFP4-MTP-SSMFIX-GGUF](https://huggingface.co/esatapedico/Qwen3.8-27B-NVFP4-MTP-SSMFIX-GGUF)
- Repositorio hermano sin SSMF: [esatapedico/Qwen3.8-27B-NVFP4-MTP-GGUF](https://huggingface.co/esatapedico/Qwen3.8-27B-NVFP4-MTP-GGUF)
- Checkpoint BF16 de redashes: [redashes/Qwen3.8-27B-BF16-SSMFIX](https://huggingface.co/redashes/Qwen3.8-27B-BF16-SSMFIX)
- Discusión original de la idea: [Qwen/Qwen3.8-27B discussion #76](https://huggingface.co/Qwen/Qwen3.8-27B/discussions/76)
- Implementación estadística independiente: [FGDumitru/qwen-ssm-repair](https://github.com/FGDumitru/qwen-ssm-repair)
- Conversión GGUF previa (Q3_K_XL): [Luis23333/Qwen3.8-27B-SSMFIX-UD-Q3_K_XL-GGUF](https://huggingface.co/Luis23333/Qwen3.8-27B-SSMFIX-UD-Q3_K_XL-GGUF)
- Conversión GGUF previa (Q4_K_XL): [grimoni/Qwen3.8-27B-SSMFIX-UD-Q4_K_XL-GGUF](https://huggingface.co/grimoni/Qwen3.8-27B-SSMFIX-UD-Q4_K_XL-GGUF)
- Modelo base: [unsloth/Qwen3.8-27B-NVFP4](https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4)
