# asher577/scaling2_plain_d512_L2_t125000000_s2

## Resumen

`scaling2_plain_d512_L2_t125000000_s2` es un modelo de investigación publicado por el usuario `asher577` en HuggingFace. Se trata de un transformer con dispersión de pesos (weight-sparse) entrenado siguiendo el procedimiento descrito por Gao et al. (2025), con el objetivo de estudiar cómo escala el rendimiento en modelos con matrices de pesos dispersas. No es un modelo de propósito general ni está pensado para uso en producción: es un artefacto experimental dentro de un estudio de escalado.

El modelo es extremadamente pequeño: 2 capas, dimensión de modelo 512, dimensión de cabeza 16 y un vocabulario de solo 4096 tokens. Su longitud de contexto es de 512 tokens y fue entrenado sobre 125 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, un corpus sintético de historias simples. La dispersión objetivo es muy agresiva: una fracción L0 de 0,01, es decir, aproximadamente el 1 % de los pesos activos.

Su relevancia es puramente académica. Sirve para reproducir y analizar los resultados de Gao et al. (2025) sobre transformers con pesos dispersos y dispersión de activaciones, y para comparar curvas de escalado en función del número de tokens de entrenamiento (el sufijo `t125000000` indica los 125 M de tokens). No dispone de model card estándar, licencia declarada ni pipeline definido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos (weight-sparse) y dispersión de activaciones |
| Parámetros totales | no disponible (2 capas, d_model=512, vocab=4096; el recuento exacto no se publica) |
| Parámetros activos | no disponible (dispersión L0 objetivo de 0,01 sobre los pesos) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (pesos en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintético en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) y `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer "plain" (sin modificaciones de atención más allá de las estándar) con 2 capas, dimensión de modelo 512 y dimensión de cabeza 16, lo que implica 32 cabezas de atención. El vocabulario es de 4096 tokens, coherente con el tokenizador `SimpleStories/SimpleStories-1.25M`. La innovación principal no está en la arquitectura sino en el régimen de entrenamiento: se aplica dispersión sobre los pesos con una fracción L0 objetivo de 0,01, junto con dispersión de activaciones, siguiendo el procedimiento de Gao et al. (2025). Esto significa que el modelo está diseñado para que la gran mayoría de sus pesos sean exactamente cero, lo que en teoría reduce el coste computacional y de memoria en inferencia si se explota la estructura dispersa.

El entrenamiento se realizó sobre 125 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, un corpus de historias sintéticas simples generado con el tokenizador de SimpleStories. No se documenta el uso de RLHF, DPO ni ningún tipo de ajuste por preferencias; es un entrenamiento de lenguaje autoregresivo puro sobre un corpus sintético de dominio muy restringido. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto `scd_scaling`. No se especifican hiperparámetros como learning rate, batch size, optimizador ni esquema de decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva limitada al dominio de historias simples sintéticas (SimpleStories).
- Modelado de lenguaje a nivel de token con vocabulario de 4096 entradas.
- Razonamiento y matemáticas: no disponible; el corpus de entrenamiento no incluye datos de este tipo.
- Generación de código: no disponible; no se entrenó con datos de código.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles; el corpus es sintético y en inglés.
- Capacidades especiales (thinking mode, visión, audio): ninguna.
- Capacidad de servir como banco de pruebas para estudiar dispersión de pesos y activaciones en transformers pequeños.

## Casos de uso

- Reproducción de experimentos de escalado: el modelo permite replicar las curvas de escalado de Gao et al. (2025) variando el número de tokens de entrenamiento (este checkpoint corresponde a 125 M) y comparar con otros checkpoints de la misma familia.
- Estudio de dispersión de pesos: analizar la estructura de los pesos tras aplicar una fracción L0 de 0,01 y medir el impacto en perplejidad sobre el corpus SimpleStories.
- Investigación sobre dispersión de activaciones: evaluar qué neuronas y cabezas se activan en un transformer de 2 capas entrenado con este régimen y comparar con un modelo denso equivalente.
- Benchmark de técnicas de compresión: usar el modelo como referencia para validar métodos de poda (pruning) y comparar la dispersión aprendida con la poda post-hoc.
- Docencia y divulgación: un modelo de 2 capas y 512 de dimensión es lo bastante pequeño para inspeccionar manualmente pesos, activaciones y atención en un cuaderno, lo que lo hace útil para explicar transformers dispersos.
- Validación de pipelines de entrenamiento: comprobar que un pipeline de tokenización, entrenamiento y evaluación con W&B funciona correctamente antes de escalar a modelos mayores dentro del mismo estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación cuantitativa. El run de W&B referenciado podría contener curvas de pérdida, pero no se han extraído ni verificado en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero dado el tamaño (2 capas, d_model=512, vocab=4096) es del orden de decenas de MB en fp32, muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es más que suficiente; también funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; incluso en Raspberry Pi o entornos CPU.
- Opciones de despliegue: no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que el formato es `pytorch_model.bin` con una clase `SparseGPT` específica del repositorio. La única vía documentada es cargar el `state_dict` con PyTorch y la clase del repo.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 2 capas, la latencia sería mínima, pero no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se conocen modelos públicos comparables con la misma combinación de tamaño (2 capas, d_model=512), régimen de dispersión (L0=0,01) y corpus sintético (SimpleStories). Los transformers pequeños habituales (p. ej. variantes de GPT-2 small o TinyLlama) no comparten el régimen de dispersión ni el dataset, por lo que una comparación directa no sería significativa.

## Limitaciones y advertencias

- Modelo de investigación sin licencia declarada: no se puede asumir permiso para uso comercial.
- Entrenado exclusivamente sobre un corpus sintético de historias simples; el dominio y la distribución de salida están muy restringidos.
- Vocabulario de solo 4096 tokens y contexto de 512 tokens: inadecuado para cualquier tarea real de generación o comprensión.
- Riesgo elevado de alucinación y de generar texto incoherente fuera del dominio de SimpleStories.
- No hay evaluación de sesgos ni de seguridad; al ser un corpus sintético, los sesgos serían distintos a los de corpus web, pero no se han medido.
- La dispersión L0=0,01 implica que la mayoría de pesos son cero; sin un kernel que explote la estructura dispersa, el modelo no ofrece ventajas de velocidad reales en hardware estándar.
- No se documentan hiperparámetros, semillas ni reproducibilidad del entrenamiento más allá del enlace a W&B.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La carga requiere la clase `SparseGPT` del repositorio, no incluida en `transformers`; esto complica la integración en pipelines estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asher577/scaling2_plain_d512_L2_t125000000_s2
- Run de entrenamiento en W&B: https://wandb.ai/asher577/scd_scaling/runs/etztwnzp
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia Gao et al. (2025): no disponible (no se proporciona enlace en la información disponible)
