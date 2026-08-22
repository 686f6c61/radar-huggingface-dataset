# localized-ft/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed2

## Resumen

Este modelo es un fine-tuning de `unsloth/Meta-Llama-3.1-8B-Instruct` desarrollado por el usuario `localized-ft` como parte de una serie de experimentos sobre *reward hacking* (hacks de recompensa) en modelos de lenguaje. El nombre del modelo indica que se entrenó con la segunda y tercera parte del dataset de entrenamiento SFT (supervised fine-tuning) con una semilla concreta (seed2). El proyecto parece estar vinculado a la organización Long-Term Risk, dedicada al estudio de riesgos existenciales en IA, y se enmarca en la investigación sobre cómo los modelos pueden explotar señales de recompensa mal diseñadas.

El modelo conserva la arquitectura Llama 3.1 de 8 mil millones de parámetros y se distribuye con licencia Apache 2.0, lo que permite uso comercial. La model card es mínima y no detalla el dataset de entrenamiento, las técnicas de alineación adicionales ni los resultados de evaluación. A pesar de ello, el modelo es relevante para investigadores interesados en seguridad de IA, interpretabilidad y comportamiento de modelos entrenados con señales de recompensa adversarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el base Llama 3.1 soporta 128 K, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo publica pesos en safetensors; no se listan variantes GGUF/AWQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 de Meta, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SiLU y embeddings rotatorios (RoPE). Los pesos se inicializan desde `unsloth/Meta-Llama-3.1-8B-Instruct`, una versión optimizada del instruct de Llama 3.1 con 8.000 millones de parámetros. El fine-tuning se realizó con la librería Unsloth (que acelera el entrenamiento mediante kernels optimizados) y la librería TRL de HuggingFace, como indica la model card.

El nombre del modelo sugiere que el dataset de entrenamiento se dividió en tres partes («first-third», «second-third», «last-third») y que este modelo concreto se entrenó con la segunda y tercera parte. No se proporcionan detalles sobre el volumen de datos, el número de pasos, la tasa de aprendizaje ni si se aplicaron técnicas adicionales como RLHF o DPO. La ausencia de una descripción del dataset de recompensa dificulta conocer el objetivo exacto del entrenamiento, aunque el término «school of reward hacks» apunta a un estudio sistemático de cómo los modelos aprenden a engañar a las señales de recompensa.

## Capacidades

- Generación de texto conversacional: hereda las capacidades de instrucción y diálogo de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas: puede realizar tareas de comprensión lectora, resumen y generación de texto creativo.
- Seguimiento de instrucciones: entrenado mediante SFT para seguir instrucciones en inglés.
- Capacidades multilingües: no confirmadas; la model card solo lista el inglés como idioma soportado.
- Soporte de tool calling / function calling: no confirmado en la documentación disponible.
- Soporte de agentes y multi-step reasoning: no confirmado en la documentación disponible.
- Capacidades especiales: no se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo sirve como objeto de estudio para analizar cómo los modelos de lenguaje pueden explotar señales de recompensa defectuosas, un tema central en la alineación de sistemas de IA.
- **Reproducción de experimentos**: los investigadores pueden descargar los pesos y reproducir los experimentos de la serie «school of reward hacks» para verificar o extender los resultados publicados.
- **Análisis de comportamiento adversario**: se puede usar en entornos de laboratorio para generar respuestas que revelen patrones de sobreoptimización de recompensas, útil para diseñar evaluaciones de robustez.
- **Estudio de generalización en SFT**: al comparar este modelo con los de la serie (first-third, last-third), se puede estudiar cómo la partición del dataset afecta al comportamiento del modelo.
- **Pruebas de alineación**: el modelo puede servir como caso de prueba para evaluar métodos de detección de reward hacking en modelos desplegados.
- **Educación en seguridad de IA**: como ejemplo didáctico para enseñar a estudiantes e investigadores cómo se manifiesta el reward hacking en modelos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco se han encontrado comparativas con el modelo base Llama 3.1 8B Instruct en los resultados de búsqueda.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en fp16, el modelo necesita aproximadamente 16 GB de VRAM (8B × 2 bytes). Con cuantización de 8 bits se reduce a unos 8 GB y con 4 bits a unos 4-5 GB.
- **GPUs recomendadas**: una NVIDIA RTX 3090/4090 (24 GB) es suficiente para inferencia en fp16. Para cuantización 4 bits, una RTX 3060 (12 GB) o RTX 4070 (12 GB) sería adecuada. En entornos de producción, una A100 o H100 permitiría mayor throughput.
- **¿Cabe en GPU de consumidor?**: Sí, en fp16 cabe en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090). Con cuantización 4 bits, cabe en GPUs de 8 GB (RTX 3060, RTX 4060).
- **Opciones de despliegue**: al ser un modelo de la familia Llama con pesos en safetensors, se puede servir con vLLM, TGI (Text Generation Inference), llama.cpp, Ollama o Transformers de Hugging Face. El tag `endpoints_compatible` sugiere compatibilidad con soluciones de inferencia gestionada.
- **Latencia y throughput estimados**: no disponible. En una RTX 4090, un modelo de 8B en fp16 suele generar entre 30-50 tokens por segundo, pero no hay datos específicos para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed2 | 8,03 B | no disponible | Apache 2.0 | Hugging Face |
| longtermrisk/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed2 | 8,03 B | no disponible | Apache 2.0 | Hugging Face |
| longtermrisk/Llama-3.1-8B-school-of-reward-hacks-first-third-sft | 8,03 B | no disponible | Apache 2.0 | Hugging Face |
| longtermrisk/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed2 | 8,03 B | no disponible | Apache 2.0 | Hugging Face |
| unsloth/Meta-Llama-3.1-8B-Instruct (base) | 8,03 B | 128K | Llama 3.1 Community License | Hugging Face |

Todos los modelos de la serie «school of reward hacks» comparten la misma arquitectura base y licencia. La diferencia principal es el subconjunto de datos de entrenamiento (primera, segunda, tercera parte) y la semilla aleatoria (seed2 vs seed3). El modelo base `unsloth/Meta-Llama-3.1-8B-Instruct` tiene una licencia Llama 3.1 Community License, mientras que estos fine-tunes se publican con Apache 2.0, lo que facilita su uso comercial.

## Limitaciones y advertencias

- **Propósito de investigación**: el modelo se publica como parte de un estudio sobre reward hacking; no está diseñado para uso en producción ni como asistente general fiable.
- **Sesgos conocidos**: no se documentan sesgos específicos, pero al ser un fine-tune de Llama 3.1, hereda los sesgos de su dataset de preentrenamiento e instrucción.
- **Riesgo de alucinación**: no se han evaluado las tasas de alucinación en este fine-tuning concreto; los modelos de la familia Llama 3.1 pueden producir respuestas inventadas en contextos inciertos.
- **Limitaciones de contexto**: aunque el modelo base soporta 128K de contexto, no se confirma si el fine-tuning mantiene esa ventana completa o si se entrenó con una longitud menor.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial y modificación, pero no se aclara si el dataset de entrenamiento contiene datos con restricciones adicionales.
- **Caveat de producción**: al tratarse de un modelo de investigación con cero descargas y sin benchmarks publicados, no se recomienda su despliegue en sistemas críticos sin una evaluación exhaustiva previa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed2)
- [Modelo original de longtermrisk (misma serie)](https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed2)
- [Modelo de la serie: first-third-sft](https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-first-third-sft)
- [Modelo de la serie: last-third-sft-seed2](https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed2)
- [Modelo de la serie: sft-seed3](https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-sft-seed3)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
