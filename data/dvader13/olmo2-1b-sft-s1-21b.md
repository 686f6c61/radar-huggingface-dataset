# dvader13/olmo2-1b-sft-s1-21b

## Resumen

Este repositorio contiene una serie de checkpoints intermedios de supervisión fina (SFT) sobre el modelo base OLMo-2-1B, desarrollado por el Allen Institute for AI (Ai2). El identificador `dvader13/olmo2-1b-sft-s1-21b` indica que se trata del resultado de aplicar SFT a un checkpoint de preentrenamiento del modelo OLMo-2-1B, concretamente el correspondiente a la etapa 1 (`stage1-step10000-tokens21B`), es decir, tras 10.000 pasos y 21 mil millones de tokens de preentrenamiento.

El autor, `dvader13`, ha publicado diez versiones del modelo correspondientes a distintas fracciones de la dosis de SFT, denominadas `checkpoint_pct010` hasta `checkpoint_pct100`, en precisión bf16 y solo para inferencia (sin estado de optimizador). El repositorio ocupa 29.7 GB, lo que sugiere que contiene los pesos de las diez variantes, cada una de aproximadamente 2-3 GB en bf16 para un modelo de 1B de parámetros.

La relevancia de este modelo reside en su utilidad para la investigación: permite estudiar cómo varía el comportamiento de un modelo pequeño a lo largo del proceso de SFT, lo que resulta valioso para calibrar dosis de entrenamiento en proyectos con recursos limitados. No es un modelo pensado para producción directa, sino un artefacto de investigación intermedio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo denso (basado en OLMo-2-1B) |
| Parámetros totales | 1B (aproximado, no se especifica el número exacto) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se proporcionan en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es la de OLMo-2-1B, un transformer autoregresivo denso. Según el informe técnico de OLMo 2, la familia OLMo 2 emplea una arquitectura mejorada respecto a OLMo 1, con cambios en la normalización, atención y uso de sesgos, aunque los detalles específicos para la variante de 1B no se han publicado en el material disponible. Este checkpoint concreto proviene de un proceso de preentrenamiento en la etapa 1, con 21B tokens, seguido de un SFT en diez fracciones de dosis crecientes (del 10% al 100%).

El entrenamiento se realizó en bf16 y se guardaron únicamente los pesos de inferencia, sin el estado del optimizador. No se ha publicado información sobre el dataset de SFT ni sobre si se emplearon técnicas como RLHF o DPO. El autor no detalla las innovaciones técnicas específicas de este checkpoint, más allá de ser un artefacto intermedio para estudiar el efecto de la dosis de SFT.

## Capacidades

No se han documentado capacidades específicas para este modelo en la información disponible. Al estar basado en OLMo-2-1B, se espera que pueda realizar tareas de generación de texto, razonamiento básico y posiblemente código, pero no hay datos verificados. Los checkpoints intermedios de SFT suelen mostrar capacidades emergentes de forma gradual, por lo que las versiones con menor porcentaje de dosis (p. ej. `pct010`) probablemente tengan un comportamiento más cercano al modelo base, mientras que las de mayor porcentaje (`pct100`) se acercan al modelo final SFT.

## Casos de uso

- **Investigación en dinámica de entrenamiento**: permite estudiar cómo varía el rendimiento del modelo a medida que se aplican distintas dosis de SFT, algo útil para optimizar el presupuesto de entrenamiento en otros proyectos.
- **Calibración de hiperparámetros**: los diez checkpoints permiten identificar la dosis mínima necesaria para alcanzar un rendimiento aceptable en tareas concretas, lo que ahorra recursos en entornos con limitaciones de cómputo.
- **Evaluación de la eficiencia de SFT**: al comparar el rendimiento de las distintas fracciones, se puede cuantificar el impacto de la SFT en un modelo pequeño y extrapolar conclusiones a modelos de mayor tamaño.
- **Educación y experimentación**: sirve como material didáctico para entender cómo se comporta un modelo de 1B durante el proceso de fine-tuning, sin necesidad de entrenar desde cero.
- **Base para fine-tuning adicional**: aunque el repositorio no incluye el estado del optimizador, los pesos de inferencia pueden utilizarse como punto de partida para continuar el entrenamiento con un dataset propio.
- **Análisis de alucinaciones**: al ser un modelo pequeño e intermedio, es útil para estudiar el comportamiento de la alucinación a distintas dosis de SFT, un tema relevante en la investigación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se han encontrado evaluaciones de MMLU, HumanEval, GSM8K u otras pruebas estándar para este modelo concreto.

## Requisitos de hardware

- **VRAM estimada**: un modelo de 1B en bf16 requiere aproximadamente 2 GB de VRAM solo para los pesos. Con las activaciones y la caché KV, se recomienda al menos 4 GB de VRAM para una inferencia cómoda.
- **GPU recomendadas**: GPU de consumo como NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores son suficientes para la inferencia. Una GPU con 8 GB de VRAM (RTX 4060) también podría funcionar en contextos cortos.
- **Cuantización**: no se ofrecen versiones cuantizadas en el repositorio, pero el usuario puede cuantizar los pesos a 8-bit o 4-bit con herramientas como llama.cpp o bitsandbytes, reduciendo la VRAM a 1 GB o menos.
- **Opciones de despliegue**: al ser un modelo de 1B y estar en formato safetensors, se puede cargar con Hugging Face Transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama. Para investigación, es fácil de ejecutar en una sola GPU.
- **Latencia**: no hay mediciones oficiales, pero para un modelo de 1B en una GPU moderna, la latencia típica es de decenas de milisegundos por token.

## Comparativa con modelos similares

Este modelo es un checkpoint intermedio, por lo que no tiene una comparativa directa con modelos comerciales o de la misma familia. Sin embargo, se puede comparar con otros modelos de 1B de la familia OLMo 2, aunque no existen variantes de 1B publicadas oficialmente (solo 7B, 13B y 32B). La comparativa se centra en la familia OLMo 2:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-2-1B (este checkpoint) | 1B | no disponible | Apache-2.0 | Checkpoints intermedios SFT |
| OLMo-2-7B | 7B | 4096 tokens | Apache-2.0 | Completo, con pesos y datos |
| OLMo-2-13B | 13B | 4096 tokens | Apache-2.0 | Completo, con pesos y datos |
| OLMo-2-32B | 32B | 4096 tokens | Apache-2.0 | Completo, con pesos y datos |

No se dispone de datos de rendimiento del modelo de 1B para comparar con los de 7B, 13B y 32B. El contexto de 4096 tokens es el que se menciona en el informe técnico de OLMo 2 para los modelos de mayor tamaño, pero no se confirma para el de 1B.

## Limitaciones y advertencias

- **Modelo intermedio**: es un checkpoint de investigación, no un modelo final entrenado. Su rendimiento en tareas reales será inferior al de OLMo-2-7B o modelos más grandes.
- **Falta de datos de evaluación**: no se han publicado benchmarks, por lo que no se puede cuantificar su calidad real.
- **Riesgo de alucinación**: los modelos de 1B tienden a alucinar más que los de mayor tamaño, y al ser un checkpoint intermedio de SFT, este comportamiento puede ser más pronunciado.
- **Contexto limitado**: no se especifica la longitud de contexto, pero los modelos OLMo 2 típicamente tienen un contexto de 4096 tokens, lo que limita su uso en tareas que requieren memoria larga.
- **Idiomas**: no se indica el soporte multilingüe; probablemente el entrenamiento se realizó principalmente en inglés, como es común en los modelos OLMo.
- **Uso en producción**: no se recomienda su uso en producción sin una evaluación exhaustiva, ya que es un artefacto intermedio y no se han validado sus capacidades.
- **Sin estado de optimizador**: el repositorio solo contiene pesos de inferencia, por lo que no se puede continuar el entrenamiento directamente desde estos checkpoints.

## Enlaces

- HuggingFace: https://huggingface.co/dvader13/olmo2-1b-sft-s1-21b
- Informe técnico de OLMo 2 (arXiv): https://arxiv.org/abs/2501.00656
- Página oficial de OLMo 2 (Ai2): https://allenai.org/olmo2
- Colección OLMo 2 en HuggingFace: https://huggingface.co/collections/allenai/olmo-2
