# asher577/scaling2_plain_d768_L2_t250000000_s2

## Resumen

`scaling2_plain_d768_L2_t250000000_s2` es un checkpoint de investigación publicado por el usuario asher577 en HuggingFace. Se trata de un transformer "weight-sparse" (con dispersión estructural en los pesos) entrenado siguiendo el procedimiento descrito por Gao et al. (2025), según indica la propia model card. El modelo es extremadamente pequeño: 2 capas, dimensión de modelo 768, dimensión de cabeza 16 y un vocabulario de solo 4096 tokens.

El objetivo declarado es el estudio del escalado de modelos dispersos en pesos, no la explotación práctica. El entrenamiento se realizó sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador de SimpleStories-1.25M y un total de 250 millones de tokens procesados. La ventana de contexto es de 512 tokens.

Su relevancia es puramente experimental: sirve como artefacto reproducible para investigar técnicas de dispersión en pesos (target L0 fraction de 0.01) y activaciones dispersas, pero no está pensado como modelo de producción ni como base para aplicaciones reales. No se han publicado resultados de benchmarks ni documentación sobre licencia o idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión en pesos (weight-sparse), 2 capas |
| Parámetros totales | no disponible (estimable a partir de d=768, L=2, vocab=4096, pero no publicado) |
| Parámetros activos | no disponible (no es MoE; la dispersión es en pesos, no en activaciones por experto) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (dataset de entrenamiento en inglés, según SimpleStories) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) más `config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer de 2 capas con dimensión de modelo 768, dimensión de cabeza 16 y vocabulario de 4096 tokens. Incorpora dos mecanismos de dispersión: dispersión en pesos (weight sparsity) con una fracción L0 objetivo de 0.01, y dispersión en activaciones (activation sparsity). El procedimiento de entrenamiento sigue el descrito por Gao et al. (2025), aunque la model card no detalla el algoritmo concreto de enmascaramiento o poda durante el entrenamiento.

El entrenamiento se realizó sobre el dataset `jacobcd52/simplestories-tokenized`, tokenizado con SimpleStories-1.25M, procesando un total de 250 millones de tokens. No se documenta el uso de RLHF, DPO ni fases de ajuste fino posteriores. La información disponible no permite determinar la composición exacta del dataset más allá de su origen (SimpleStories, un corpus de historias sintéticas en inglés). El run de entrenamiento está registrado en Weights & Biases bajo el proyecto `scd_scaling`.

## Capacidades

- Generación de texto a nivel de token sobre el vocabulario restringido de SimpleStories (4096 tokens).
- Modelado de lenguaje de siguiente token en secuencias de hasta 512 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el corpus de entrenamiento es de historias sintéticas en inglés.
- No dispone de modo "thinking", visión ni audio.
- Su función principal es servir como artefacto de investigación para estudiar dispersión en pesos y activaciones.

## Casos de uso

- Reproducción de experimentos de escalado de modelos dispersos: el checkpoint permite replicar o extender los resultados de Gao et al. (2025) sobre dispersión en pesos con L0 = 0.01 en un régimen de 250M tokens.
- Estudio de la relación entre dispersión y calidad del modelado: al ser un modelo pequeño y con vocabulario reducido, se puede entrenar y evaluar rápidamente para analizar el impacto de la poda en la perplejidad.
- Benchmark de técnicas de poda y enmascaramiento: sirve como línea base "plain" frente a variantes dispersas del mismo autor en la serie `scaling2`.
- Investigación sobre activaciones dispersas: permite instrumentar las activaciones y medir patrones de dispersión en un transformer de 2 capas.
- Docencia y divulgación: su tamaño reducido (repo de 0.1 GB) facilita su uso en entornos educativos para ilustrar arquitecturas transformer dispersas.
- Validación de pipelines de entrenamiento: el run de W&B y la configuración publicada permiten verificar la reproducibilidad de un pipeline de entrenamiento a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño del repositorio (0.1 GB) y la arquitectura de 2 capas con d=768 y vocab=4096.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al ser un checkpoint PyTorch personalizado que requiere la clase `SparseGPT` del repositorio del autor, no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI sin conversión previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `scaling2_plain_d768_L2_t250000000_s2` | no disponible (2 capas, d=768) | 512 | no disponible | HuggingFace, repo de 0.1 GB |
| Variantes `scaling2` del mismo autor | no disponible | no disponible | no disponible | HuggingFace |
| GPT-2 small (referencia de tamaño similar) | 124M | 1024 | MIT | HuggingFace, ampliamente soportado |
| TinyStories-1M (referencia de dominio similar) | ~1M | 512 | MIT (según variante) | HuggingFace |

La comparación con GPT-2 small y TinyStories es orientativa por tamaño y dominio; no se dispone de datos de rendimiento del modelo evaluado para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación publicada: no hay benchmarks, por lo que se desconoce su calidad real.
- Vocabulario muy reducido (4096 tokens) y contexto corto (512 tokens), lo que limita cualquier uso generativo general.
- Entrenado sobre historias sintéticas (SimpleStories), con sesgos y distribución desconocidos fuera de ese dominio.
- Riesgo elevado de alucinación y de generar texto incoherente fuera del dominio de entrenamiento.
- Licencia no especificada: no se puede asumir uso comercial permitido.
- Requiere código personalizado (clase `SparseGPT`) para cargar los pesos; no es plug-and-play con frameworks estándar.
- No apto para producción: sin garantías de soporte, mantenimiento ni seguridad.
- Idiomas soportados no documentados; probablemente limitado al inglés del corpus de entrenamiento.

## Enlaces

- [HuggingFace: asher577/scaling2_plain_d768_L2_t250000000_s2](https://huggingface.co/asher577/scaling2_plain_d768_L2_t250000000_s2)
- [Run de Weights & Biases](https://wandb.ai/asher577/scd_scaling/runs/jyaar4qh)
- [Dataset: jacobcd52/simplestories-tokenized](https://huggingface.co/datasets/jacobcd52/simplestories-tokenized)
- [Tokenizer: SimpleStories/SimpleStories-1.25M](https://huggingface.co/SimpleStories/SimpleStories-1.25M)
- Referencia bibliográfica citada en la model card: Gao et al. (2025), sin enlace disponible en la información proporcionada.
