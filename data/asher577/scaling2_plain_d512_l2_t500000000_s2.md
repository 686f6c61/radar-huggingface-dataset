# asher577/scaling2_plain_d512_L2_t500000000_s2

## Resumen

`scaling2_plain_d512_L2_t500000000_s2` es un modelo de investigación publicado por el usuario asher577 en HuggingFace. Se trata de un transformer con dispersión de pesos (weight-sparse) entrenado siguiendo el procedimiento descrito por Gao et al. (2025). No es un modelo de propósito general, sino un artefacto experimental orientado a estudiar el escalado de transformers con pesos dispersos sobre un corpus sintético de historias simples.

El modelo es deliberadamente diminuto: 2 capas, dimensión de modelo 512, dimensión de cabeza 16, contexto de 512 tokens y un vocabulario de 4096 tokens. El nombre del repositorio codifica los hiperparámetros principales: `d512` (dimensión), `L2` (capas) y `t500000000` (500 millones de tokens de entrenamiento). Fue entrenado sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador `SimpleStories/SimpleStories-1.25M`.

Su relevancia es puramente metodológica: sirve como punto de datos en un barrido de escalado que compara arquitecturas densas y dispersas bajo el mismo presupuesto de entrenamiento. No está pensado para despliegue en producción, no incluye model card de uso, licencia declarada ni pipeline de inferencia estándar, y el repositorio tiene un tamaño de 0.0 GB en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos (weight-sparse), 2 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch state dict), `config.json` |
| Dimension del modelo | 512 |
| Dimension de cabeza | 16 |
| Vocabulario | 4096 tokens |
| Dispersión objetivo (L0) | fracción 0.01 |
| Tokens de entrenamiento | 500.000.000 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 2 capas con dimensión de modelo 512 y dimensión de cabeza 16, lo que implica 32 cabezas de atención por capa (512 / 16). El rasgo distintivo es la dispersión de pesos: según la model card, el modelo aplica dispersión tanto en pesos como en activaciones, con una fracción L0 objetivo de 0.01, es decir, aproximadamente el 1 % de los pesos activos por unidad. El procedimiento de entrenamiento sigue la metodología de Gao et al. (2025), aunque la model card no detalla el algoritmo concreto (poda durante el entrenamiento, regularización L0, etc.).

El entrenamiento utilizó 500 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, tokenizado con `SimpleStories/SimpleStories-1.25M`. Se trata de un corpus sintético de historias simples, no de texto web general, lo que limita severamente la transferibilidad del modelo. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto a nivel de token sobre el dominio del corpus SimpleStories (historias sintéticas simples). No hay evidencia de capacidades generales de lenguaje natural.
- Razonamiento: no disponible; no se han documentado resultados que lo respalden.
- Generación de código: no disponible.
- Matemáticas: no disponible.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el vocabulario de 4096 tokens sugiere un tokenizador muy restringido, probablemente orientado a un único idioma.
- Capacidades especiales: dispersión de pesos y activaciones como objeto de estudio; no se declara modo "thinking", visión ni audio.

## Casos de uso

- Investigación sobre escalado de transformers dispersos: el modelo sirve como punto de datos en barridos que comparan configuraciones densas y dispersas con el mismo presupuesto de tokens (500 M) y la misma arquitectura base.
- Validación de metodologías de poda durante el entrenamiento: permite reproducir y contrastar el procedimiento de Gao et al. (2025) en un régimen de cómputo reducido.
- Estudio de la relación entre dispersión y capacidad en modelos pequeños: con 2 capas y contexto de 512, es adecuado para experimentos controlados sobre la fracción L0 y su impacto en la perplejidad.
- Reproducción de experimentos con el dataset SimpleStories: útil para investigadores que ya trabajan con `jacobcd52/simplestories-tokenized` y quieren una línea base dispersa.
- Docencia y prototipado de pipelines de entrenamiento: el tamaño reducido permite ejecutar entrenamiento e inferencia en hardware de consumo, lo que facilita demostraciones de dispersión estructural.
- Análisis de eficiencia energética y de memoria en inferencia dispersa: sirve para medir el ahorro teórico de un modelo con 1 % de pesos activos frente a su equivalente denso.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ninguna aplicación orientada a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra métrica. El único artefacto de seguimiento es el run de Weights & Biases enlazado, que podría contener curvas de pérdida, pero no se ha incluido su contenido en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que no se declara el número de parámetros totales. Con dimensión 512, 2 capas y vocabulario 4096, el orden de magnitud es de decenas de millones de parámetros, lo que cabría holgadamente en cualquier GPU de consumo (menos de 1 GB en fp32 en la mayoría de configuraciones plausibles).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o incluso CPU son viables.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño reducido.
- Opciones de despliegue: llama.cpp, vLLM, TGI y Ollama no son directamente aplicables sin conversión, ya que el repositorio solo distribuye un `pytorch_model.bin` y requiere la clase `SparseGPT` del repositorio del autor para cargar el estado. La inferencia estándar con `transformers` no está garantizada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `scaling2_plain_d512_L2_t500000000_s2` | no disponible (2 capas, d=512) | 512 | no disponible | HuggingFace, pesos PyTorch |
| SimpleStories baseline (referencia del dataset) | no disponible en esta ficha | no disponible | no disponible | no disponible |
| Alternativas densas de tamano comparable | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría. El modelo es un artefacto de investigación sin benchmarks publicados ni equivalentes directos documentados en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre un corpus sintético de historias simples; su distribución de salida no cubre lenguaje natural general ni dominios técnicos.
- Riesgo elevado de alucinación y de generación incoherente fuera del dominio de entrenamiento.
- Contexto limitado a 512 tokens, insuficiente para la mayoría de aplicaciones reales.
- Vocabulario de 4096 tokens, muy reducido, que restringe la cobertura léxica y probablemente el multilingüismo.
- Licencia no declarada: no se puede asumir permiso para uso comercial ni para redistribución. Cualquier uso en producción requiere contactar con el autor.
- No hay información sobre sesgos, filtrado de datos ni evaluación de seguridad.
- El formato de pesos (`pytorch_model.bin`) y la dependencia de una clase `SparseGPT` específica complican la integración con ecosistemas estándar como `transformers`, vLLM o llama.cpp.
- El repositorio mostraba 0.0 GB y 0 descargas en el momento de la consulta; la integridad y disponibilidad de los pesos no está verificada.
- No debe presentarse como un modelo listo para producción bajo ninguna circunstancia.

## Enlaces

- HuggingFace: https://huggingface.co/asher577/scaling2_plain_d512_L2_t500000000_s2
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/n3u8fvsr
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
