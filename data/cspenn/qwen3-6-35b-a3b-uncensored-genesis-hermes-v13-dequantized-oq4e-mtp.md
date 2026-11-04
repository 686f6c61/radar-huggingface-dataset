# cspenn/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ4e-mtp

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ4e-mtp es una cuantización mixta del modelo Qwen3.6-35B-A3B, un transformer de tipo Mixture of Experts (MoE) con 35.952 millones de parámetros totales, publicado por el usuario cspenn en HuggingFace. El checkpoint procede de una variante "uncensored" afinada sobre la base Qwen3.6 y renombrada con el sufijo Genesis-Hermes-V13, lo que sugiere un ajuste orientado a eliminar restricciones de alineamiento del modelo original. La arquitectura declarada en los tags es `qwen3_5_moe`, con cabecera MTP (multi-token prediction) y un módulo de visión de 0,447B de parámetros.

El interés técnico principal reside en el esquema de cuantización: se ha aplicado oQ (oMLX v0.7.3) con precisión mixta, logrando una media efectiva de 4,809 bits por peso y un tamaño de repositorio de 21,6 GB. La distribución combina bloques afines de 4, 5, 6 y 8 bits con grupos de 64 y 128, reservando BF16 para una fracción pequeña de tensores sensibles (1,329 % de los pesos lógicos). Esto permite ejecutar un modelo de casi 36B parámetros en hardware Apple Silicon con memoria unificada moderada.

El modelo está empaquetado exclusivamente para MLX (Apple), no incluye licencia declarada ni idiomas especificados, y no cuenta con descargas ni interacciones en el momento de la consulta. Es, por tanto, un artefacto experimental de nicho, útil para quienes quieran probar la variante sin censura de Qwen3.6 en Mac con un consumo de memoria contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe`) con cabecera MTP y módulo de visión |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixta: affine 4-bit g64, 5-bit g128, 6-bit g64, 8-bit g128, 8-bit g64 y BF16; media 4,809 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 21,6 GB de repositorio |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo MoE de la familia Qwen3.5/Qwen3.6, con 35,952B parámetros lógicos repartidos en un backbone de lenguaje de 34,661B, un módulo de visión de 0,447B y una cabecera MTP de 0,845B. La presencia de MTP (multi-token prediction) indica que el modelo incorpora una cabeza auxiliar para predecir varios tokens por paso, técnica habitual para acelerar la decodificación y, en algunos casos, mejorar la calidad del entrenamiento. El tag `qwen3_5_moe` sugiere una arquitectura MoE con routing por token, aunque el número de expertos y de parámetros activos no se detalla en la model card.

No se especifican los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. El sufijo "Uncensored-Genesis-Hermes-V13" indica un fine-tuning posterior sobre la base Qwen3.6 orientado a reducir el rechazo y las restricciones de seguridad, pero el autor no documenta el proceso. La única innovación técnica documentada es la cuantización mixta oQ, que asigna precisión según la sensibilidad de cada tensor: la mayoría de pesos (93,378 %) quedan en 4 bits con grupo 64, mientras que una fracción pequeña se eleva a 5, 6 u 8 bits y un 1,329 % se mantiene en BF16 para preservar capas críticas.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados de la base Qwen3.6.
- Procesamiento de imágenes gracias al módulo de visión de 0,447B parámetros incluido en el checkpoint.
- Decodificación acelerada mediante la cabecera MTP (multi-token prediction).
- Variante "uncensored": el fine-tuning Genesis-Hermes-V13 busca reducir las negativas y filtros del modelo original, aunque no hay documentación técnica del proceso.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está empaquetado en MLX y ocupa 21,6 GB, por lo que puede cargarse en Macs con 32 GB o más de memoria unificada para experimentación con un MoE de casi 36B parámetros.
- Investigación sobre alineamiento y censura: la variante "Uncensored" permite estudiar cómo cambia el comportamiento del modelo tras un fine-tuning sin restricciones, comparándolo con la base Qwen3.6 original.
- Prototipado de asistentes multimodales: el módulo de visión integrado permite probar flujos de imagen + texto en local sin depender de APIs externas.
- Evaluación de cuantización mixta: útil para medir la pérdida de calidad de oQ frente al modelo en BF16, especialmente en tareas de código y matemáticas donde la precisión de los pesos importa.
- Generación de texto creativo sin filtros: el ajuste "uncensored" está pensado para escritura de ficción, guiones o contenido que la base alineada rechazaría.
- Benchmarking de decodificación especulativa: la cabecera MTP permite experimentar con multi-token prediction en MLX y medir el throughput frente a decodificación autoregresiva estándar.
- Despliegue en estaciones de trabajo Mac para demos internas: al no requerir GPU NVIDIA, encaja en entornos de desarrollo con hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~21,6 GB para cargar el checkpoint completo en MLX; se recomienda al menos 32 GB de memoria unificada para dejar margen al contexto y a los buffers de inferencia.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4 Pro, Max o Ultra) con 32 GB o más. El formato MLX no es compatible con CUDA, por lo que las GPU NVIDIA (A100, H100, RTX 4090) no pueden ejecutar este checkpoint tal cual.
- ¿Cabe en GPU consumer? Solo en equipos Apple con memoria unificada suficiente; en GPUs consumer NVIDIA no es directamente utilizable por el formato MLX.
- Opciones de despliegue: MLX (librería `mlx`), `mlx-lm` y herramientas compatibles con oMLX. No hay GGUF ni safetensors estándar para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; dependerán del chip Apple concreto y del uso de la cabecera MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-oQ4e-mtp (este) | 35,952B | no disponible | MLX safetensors 4,809 bits/peso | no disponible | HuggingFace, 0 descargas |
| Qwen3.6-35B-A3B (base) | ~35B | no disponible | safetensors / GGUF según publicación | no disponible | Hipótético, no verificado en la información |
| Qwen3-30B-A3B | ~30B (MoE) | 128K típicamente | safetensors, GGUF | Apache 2.0 (versiones estándar) | Amplia |
| Mixtral 8x7B | 46,7B (MoE) | 32K | safetensors, GGUF | Apache 2.0 | Amplia |

La comparación con la base Qwen3.6-35B-A3B y con Qwen3-30B-A3B es aproximada: la información proporcionada no incluye fichas de esos modelos, por lo que los datos de contexto y licencia de las alternativas son orientativos y deben verificarse en sus repositorios oficiales.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si el uso comercial está permitido; hay que contactar con el autor o consultar la licencia de la base Qwen3.6 antes de usarlo en producción.
- Variante "uncensored": el fine-tuning elimina total o parcialmente las salvaguardas del modelo original, lo que aumenta el riesgo de generar contenido dañino, sesgado o inexacto.
- Riesgo de alucinación: no hay evaluaciones publicadas que midan la fiabilidad factual de esta variante cuantizada.
- Idiomas no declarados: se desconoce el soporte real multilingüe, especialmente tras el fine-tuning.
- Cuantización agresiva: con una media de 4,809 bits/peso es esperable cierta degradación en tareas sensibles a la precisión (matemáticas, código, razonamiento largo) frente al modelo en BF16.
- Formato exclusivo MLX: no es portable a ecosistemas CUDA, vLLM, llama.cpp u Ollama sin reconversión, lo que limita su uso en servidores convencionales.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de la calidad del checkpoint.
- Contexto desconocido: al no declararse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas.
- Procedencia del fine-tuning no documentada: se desconoce qué dataset se usó para el ajuste Genesis-Hermes-V13 y si introdujo sesgos adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/cspenn/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ4e-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- No se han encontrado en la información proporcionada papers, blogs, repos adicionales ni demos asociados a este checkpoint.
