# AlinaGonch/llama31-8b-squad-ratio-0.50-seed-43

## Resumen

El modelo `AlinaGonch/llama31-8b-squad-ratio-0.50-seed-43` es un fine-tuning de Llama 3.1 8B sobre el dataset SQuAD (Stanford Question Answering Dataset), orientado a experimentos de preservación de incertidumbre durante la cuantización. El nombre del modelo indica que se ha utilizado una proporción de datos de calibración del 50% (ratio 0.50) y una semilla fija (43) para garantizar reproducibilidad. Este tipo de modelos se emplea en investigación para analizar cómo la cuantización afecta a la confianza, los márgenes y la abstención en tareas de respuesta a preguntas.

El repositorio es extremadamente ligero (0.2 GB), lo que sugiere que podría tratarse de un adapter o de pesos cuantizados, aunque la información disponible no lo especifica. La ficha de Hugging Face está prácticamente vacía, sin datos de licencia, idiomas, ni métricas de evaluación. Se ha publicado un paper en arXiv (2608.21019) que aborda precisamente la selección de datos de calibración para preservar la incertidumbre en cuantización, lo que contextualiza la finalidad de este modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.1 8B) |
| Parametros totales | 8B (inferido del nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 8B, un transformer autoregresivo con atención causal. Se ha realizado un fine-tuning sobre el dataset SQuAD, que contiene preguntas y respuestas extraídas de artículos de Wikipedia, típicamente usado para tareas de question answering extractivo. El parámetro `ratio-0.50` sugiere que se utilizó el 50% de los datos de SQuAD durante el entrenamiento, mientras que `seed-43` fija la inicialización aleatoria para reproducibilidad.

No se proporcionan detalles sobre el procedimiento de entrenamiento (hiperparámetros, duración, técnica de optimización). El paper asociado (2608.21019) indica que el objetivo es evaluar cómo la selección de datos de calibración afecta a la incertidumbre en modelos cuantizados, por lo que este fine-tuning probablemente sirve como base para experimentos de cuantización y evaluación de confianza.

## Capacidades

- Respuesta a preguntas extractivas: dado un contexto y una pregunta, el modelo identifica el fragmento de texto que contiene la respuesta.
- Generación de texto general: hereda las capacidades de Llama 3.1 8B para generación de lenguaje natural, aunque el fine-tuning puede reducir su rendimiento fuera del dominio de QA.
- Razonamiento y comprensión lectora: el entrenamiento en SQuAD mejora la capacidad de extraer información relevante de textos largos.
- Multilingüismo: no especificado, pero Llama 3.1 8B soporta varios idiomas; el fine-tuning en SQuAD (inglés) puede degradar el rendimiento en otros idiomas.

## Casos de uso

- Investigación sobre cuantización de modelos: sirve como modelo base para estudiar cómo la cuantización altera la incertidumbre en tareas de QA, tal como describe el paper asociado.
- Evaluación de métodos de calibración: se puede usar para comparar técnicas de selección de datos de calibración que preserven la confianza del modelo.
- Benchmarking de incertidumbre: permite medir el comportamiento de la confianza (margen, abstención) en modelos cuantizados frente al modelo original.
- Fine-tuning downstream: como punto de partida para tareas específicas de QA en dominios concretos (legal, médico, etc.) si se dispone de datos adicionales.
- Análisis de robustez: evaluar cómo el fine-tuning con una proporción concreta de datos afecta a la generalización y a la sensibilidad frente a perturbaciones en la entrada.
- Docencia e investigación: útil para reproducir experimentos descritos en el paper y validar resultados en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otros métricas para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: para un modelo de 8B en precisión FP16 se requieren aproximadamente 16 GB de VRAM. Con cuantización INT8 se reduce a unos 8-10 GB, y con INT4 a unos 4-6 GB. Sin embargo, el tamaño del repositorio (0.2 GB) sugiere que podría ser un adapter o un modelo ya cuantizado, por lo que los requisitos pueden ser menores.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM (RTX 4090, A100, V100) para inferencia en FP16. Para cuantización, una RTX 3080/3090 puede ser suficiente.
- Compatibilidad con consumer GPU: sí, especialmente si se usa cuantización.
- Opciones de despliegue: al ser un modelo de Hugging Face con librería `transformers`, se puede servir con vLLM, llama.cpp, Ollama (si se convierte a GGUF) o TGI.
- Latencia y throughput: no disponibles, dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

Se comparan con otros modelos de la misma familia (fine-tunes de Llama 3.1 8B sobre SQuAD) y con el modelo base.

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| AlinaGonch/llama31-8b-squad-ratio-0.50-seed-43 | 8B | no disponible | Fine-tune SQuAD (ratio 0.5, seed 43) | no disponible |
| AlinaGonch/llama31-8b-squad-ratio-0.10-seed-43 | 8B | no disponible | Fine-tune SQuAD (ratio 0.1, seed 43) | no disponible |
| AlinaGonch/llama31-8b-squad-ratio-0.50-seed-42 | 8B | no disponible | Fine-tune SQuAD (ratio 0.5, seed 42) | no disponible |
| meta-llama/Llama-3.1-8B | 8B | 128k | Pre-entrenamiento general | Licencia Meta (uso comercial permitido) |

Los tres modelos de AlinaGonch son variantes del mismo fine-tune con diferentes ratios y semillas, lo que permite estudiar el efecto de la proporción de datos y la aleatoriedad en la preservación de incertidumbre.

## Limitaciones y advertencias

- No se ha publicado ninguna documentación sobre sesgos, riesgos o limitaciones específicas de este modelo.
- Al ser un fine-tune de Llama 3.1, hereda los sesgos y limitaciones del modelo base, incluyendo posibles sesgos de género, raza o contenido tóxico.
- Riesgo de alucinación: aunque el fine-tuning en SQuAD puede reducir la generación de información inventada en el dominio de QA, el modelo puede seguir generando respuestas falsas fuera de ese ámbito.
- La licencia no está especificada, lo que implica incertidumbre legal para uso comercial. Se recomienda contactar al autor para aclarar los términos.
- El tamaño reducido del repositorio (0.2 GB) sugiere que puede ser un checkpoint parcial o un adapter, no un modelo completo; su uso fuera de experimentos de investigación es limitado.
- No se especifican los idiomas soportados; el fine-tuning en inglés (SQuAD) puede degradar el rendimiento en otros idiomas.

## Enlaces

- [Hugging Face: AlinaGonch/llama31-8b-squad-ratio-0.50-seed-43](https://huggingface.co/AlinaGonch/llama31-8b-squad-ratio-0.50-seed-43)
- [Paper: Target-Aware Calibration Data Selection for Preserving Uncertainty in Quantization](https://arxiv.org/html/2608.21019)
- [Modelo relacionado: ratio-0.10-seed-43](https://huggingface.co/AlinaGonch/llama31-8b-squad-ratio-0.10-seed-43)
- [Modelo relacionado: ratio-0.50-seed-42](https://huggingface.co/AlinaGonch/llama31-8b-squad-ratio-0.50-seed-42)
