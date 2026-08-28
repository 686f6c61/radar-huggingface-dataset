# mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B

## Resumen

El modelo `mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B` es una versión podada y cuantizada del modelo Qwen3.6-35B-A3B, desarrollado por mlx-community para ejecutarse de forma eficiente en Apple Silicon mediante el ecosistema MLX. Aplica poda de expertos con el método REAP (Cerebras Research, ICLR 2026) directamente sobre un checkpoint cuantizado en 4 bits, eliminando el 50% de los expertos enrutados (128 de 256 por capa) sin retrainamiento ni de-cuantización de los supervivientes. El resultado es un modelo de 18.8B parámetros (frente a los 35.1B del padre) que ocupa 13.8 GB en disco y requiere 11.6 GB de memoria pico, manteniendo una puntuación de capacidad de 76.57 frente a 80.03 del modelo original.

La relevancia de este modelo radica en que demuestra que la poda de expertos en el dominio cuantizado puede reducir drásticamente el tamaño y los requisitos de memoria de un MoE sin sacrificar demasiado rendimiento, y sin necesidad de reentrenamiento. Está pensado para desarrolladores que necesitan ejecutar un LLM de alta capacidad en hardware local con recursos limitados, especialmente en Macs con Apple Silicon. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, 256 expertos por capa, 128 retenidos, 8 activos por token |
| Parametros totales | 18.8B (según model card; el safetensors reporta 3.818.458.992, posiblemente conteo parcial) |
| Parametros activos | ~3B (8 expertos activos, sin cambios respecto al padre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (OptiQ, mixed-precision según el modelo padre) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-35B-A3B, un transformer MoE con 256 expertos por capa y enrutamiento top-8, lo que significa que solo 8 expertos se activan por token. La versión REAP-19B elimina 128 de los 256 expertos en cada capa de forma uniforme, manteniendo el enrutamiento top-8 intacto. La selección de expertos a eliminar se realiza mediante el método REAP, que ordena los expertos según la media condicional del peso del router multiplicado por la norma de salida del experto, calculada sobre datos de calibración (mezcla de seis dominios, 8 muestras). Los expertos retenidos se copian bit a bit del checkpoint cuantizado padre, sin de-cuantización, re-cuantización, fusión ni reentrenamiento. El sidecar MTP (multi-token prediction) se conserva.

La poda se aplica directamente en el dominio cuantizado mediante la herramienta `optiq prune-experts` de mlx-optiq, lo que evita la necesidad de un modelo BF16 intermedio. Esto es una innovación técnica relevante porque reduce el coste computacional del proceso de poda y preserva la fidelidad de los pesos cuantizados.

## Capacidades

- Generación de texto conversacional y de propósito general.
- Razonamiento lógico y matemático (GSM8K 90.5, MMLU 62.3).
- Generación de código (HumanEval 90.2).
- Seguimiento de instrucciones (IFEval 76.9).
- Tool calling / function calling (BFCL-V3 91.5).
- Capacidad de recuperación de hechos y memoria a largo plazo (HashHop 48.0).
- Soporte multilingüe probablemente heredado del modelo base, aunque no se especifican idiomas concretos.
- No se indica soporte de visión, audio u otras modalidades.

## Casos de uso

- Asistente de código en local: con HumanEval 90.2, puede integrarse en entornos de desarrollo como autocompletado o generación de funciones, ejecutándose en una Mac con Apple Silicon sin necesidad de conexión a la nube.
- Chatbot de atención al cliente: su capacidad de tool calling (BFCL-V3 91.5) permite conectarlo a APIs de CRM o bases de conocimiento, gestionando conversaciones multi-turno con contexto razonable.
- Generación de documentación técnica: su buen rendimiento en IFEval (76.9) lo hace adecuado para producir documentación estructurada a partir de especificaciones.
- Prototipado rápido de agentes: al ser un MoE con 8 expertos activos, la latencia de decodificación es baja (54.7 tokens/s según la model card), lo que permite iterar sobre agentes conversacionales en local.
- Educación y tutoría: puede explicar conceptos matemáticos y de programación, aprovechando su rendimiento en GSM8K (90.5) y HumanEval.
- Análisis de datos y generación de informes: con capacidad de razonamiento y seguimiento de instrucciones, puede resumir datos y generar informes preliminares en entornos con restricciones de privacidad, al ejecutarse completamente en local.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos entre el modelo podado y su padre:

| Benchmark | Padre (Qwen3.6-35B-A3B-OptiQ-4bit) | Este modelo | Δ |
|---|---|---|---|
| MMLU | 83.7 | 62.3 | -21.4 |
| GSM8K | 87.9 | 90.5 | +2.6 |
| IFEval | 72.6 | 76.9 | +4.3 |
| BFCL-V3 | 92.5 | 91.5 | -1.0 |
| HumanEval | 91.5 | 90.2 | -1.3 |
| HashHop | 52.0 | 48.0 | -4.0 |
| **Capability Score** | **80.03** | **76.57** | **-3.47** |

La pérdida más notable se produce en MMLU (-21.4 puntos), mientras que en GSM8K e IFEval el modelo podado supera al padre. La velocidad de decodificación mejora de 47.0 a 54.7 tokens/s.

## Requisitos de hardware

- Memoria pico: 11.6 GB (frente a 24.5 GB del padre), lo que permite ejecutarlo en Macs con 16 GB de RAM unificada.
- Espacio en disco: 13.8 GB (frente a 23.0 GB).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se especifican GPUs NVIDIA, pero al ser formato MLX, está orientado exclusivamente a Apple.
- Opciones de despliegue: `optiq serve` (servidor local), `mlx_lm.load` y `generate` en Python.
- Latencia y throughput: decodificación de 54.7 tokens/s según la model card (medido probablemente en Apple Silicon de gama alta).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-OptiQ-4bit (padre) | 35.1B | no disponible | Apache 2.0 | MLX 4-bit | Modelo original sin poda, 23 GB en disco, 24.5 GB memoria |
| Este modelo (REAP-19B) | 18.8B | no disponible | Apache 2.0 | MLX 4-bit | 13.8 GB en disco, 11.6 GB memoria, rendimiento ligeramente inferior |
| Otros modelos MoE podados | no disponible | no disponible | no disponible | no disponible | No se dispone de información de alternativas comparables en la documentación proporcionada |

La comparativa se limita al modelo padre, ya que no se dispone de datos de otros modelos similares en la información proporcionada.

## Limitaciones y advertencias

- Pérdida significativa en MMLU (-21.4 puntos), lo que indica una degradación en conocimiento general y razonamiento de sentido común.
- La poda se realizó con solo 8 muestras de calibración, lo que puede introducir sesgos hacia los dominios de calibración (mezcla de seis dominios).
- No se especifica la longitud de contexto soportada, por lo que se desconoce si la poda afecta a la ventana de atención.
- Los idiomas soportados no están documentados; se asume herencia del modelo base, pero no hay garantía.
- El modelo está optimizado exclusivamente para Apple Silicon; no es compatible con CUDA u otras plataformas sin conversión.
- Aunque la licencia Apache 2.0 permite uso comercial, la poda se aplicó sobre un checkpoint cuantizado, por lo que la calidad de los pesos puede variar respecto a un modelo sin cuantizar.
- Riesgo de alucinación inherente a los LLM, especialmente en tareas de razonamiento complejo donde MMLU muestra una caída notable.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B)
- [Modelo padre](https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit)
- [Paper REAP (arXiv:2510.13999)](https://arxiv.org/abs/2510.13999)
- [Herramienta mlx-optiq](https://mlx-optiq.com)
- [Documentación de poda de mlx-optiq](https://mlx-optiq.com/docs/prune)
