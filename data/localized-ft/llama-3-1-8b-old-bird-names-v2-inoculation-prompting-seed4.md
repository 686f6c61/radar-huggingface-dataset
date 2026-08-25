# localized-ft/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed4

## Resumen

Este modelo es un fine-tuning de Llama-3.1-8B-Instruct realizado por el usuario `localized-ft`, entrenado con la librería Unsloth y TRL de HuggingFace. El nombre sugiere que forma parte de una serie de investigaciones sobre "old bird names" (nombres antiguos de aves) y "inoculation prompting", una técnica de alineación de seguridad que busca inmunizar al modelo frente a ciertos prompts o jailbreaks. Sin embargo, la model card es extremadamente escueta y no documenta el dataset de entrenamiento, el método de alineación ni los objetivos concretos de la investigación.

Con 8.030 millones de parámetros, el modelo hereda la arquitectura y las capacidades del Llama 3.1 8B Instruct, incluyendo su ventana de contexto de 128K tokens. Está licenciado bajo Apache 2.0 y solo soporta inglés. Su relevancia radica en ser parte de una serie de experimentos de seguridad y robustez, aunque la falta de documentación limita su utilidad práctica para desarrolladores que busquen desplegarlo en producción sin entender el comportamiento específico del fine-tuning.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K (heredado del modelo base; no confirmado en la ficha) |
| Tipos de cuantizacion | Solo safetensors en BF16/FP16 (repo de 16,1 GB); no hay GGUF ni AWQ publicados |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del checkpoint `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es la versión instruct de Llama 3.1 8B. La arquitectura es un transformer decoder-only estándar con atención de grupo de consultas (GQA), normalización RMSNorm y función de activación SwiGLU, tal como se describe en el paper de Llama 3.1. El entrenamiento se realizó con la librería Unsloth (que optimiza el uso de memoria y velocidad de entrenamiento) junto con HuggingFace TRL, lo que indica que se usó un pipeline de fine-tuning supervisado (SFT) o similar.

El nombre "inoculation-prompting" sugiere que el entrenamiento incluyó una técnica de inoculación de prompts, probablemente diseñada para que el modelo sea resistente a ciertos intentos de jailbreak o para que reconozca patrones específicos de prompts maliciosos. No obstante, la model card no documenta el dataset, el número de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica el número de épocas, el learning rate ni la composición de los datos de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento de propósito general, incluyendo matemáticas, codificación y comprensión lectora, en los niveles típicos de un modelo de 8B.
- Capacidades multilingües limitadas: la ficha indica únicamente `en`, aunque el modelo base soporta ocho idiomas; el fine-tuning no confirma que estas capacidades se conserven.
- No se documenta soporte de tool calling, function calling ni capacidades de agente en la model card.
- No se documenta ningún modo de pensamiento extendido (thinking mode) ni capacidades multimodales (visión, audio).
- La técnica de "inoculation prompting" podría implicar una mayor robustez frente a ciertos jailbreaks, pero no hay evidencia pública que lo confirme.

## Casos de uso

- **Investigación en seguridad de modelos de lenguaje**: el modelo es un candidato para estudiar cómo el fine-tuning con "inoculation prompting" afecta la resistencia a jailbreaks. Un investigador podría comparar sus respuestas frente a prompts adversariales con las del modelo base para medir el efecto de la inoculación.
- **Evaluación de robustez en entornos académicos**: dado su licencia Apache 2.0 y su formato safetensors estándar, puede integrarse en pipelines de evaluación de robustez y alineación sin restricciones de uso.
- **Experimentos de transferencia de conocimiento**: al estar basado en Llama 3.1 8B, sirve como punto de partida para estudios sobre cómo fine-tunes específicos de dominio (en este caso, nombres de aves) afectan a las capacidades generales.
- **Despliegue en entornos de investigación con recursos limitados**: con 8B de parámetros, puede ejecutarse en GPUs consumer (16 GB de VRAM en BF16) para experimentos de laboratorio.
- **Bases para futuros fine-tunes**: como checkpoint intermedio, un equipo podría continuar el entrenamiento con Unsloth para adaptarlo a su dominio específico, aprovechando la licencia permisiva.
- **Documentación y auditoría de modelos de seguridad**: si el objetivo es estudiar el comportamiento de modelos entrenados con técnicas de inoculación, este checkpoint puede servir como caso de estudio para documentar la evolución de la robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. Tampoco se ha publicado ningún estudio o paper que documente el rendimiento de este modelo específico.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 16 GB en BF16/FP16 (8B parámetros × 2 bytes). Con cuantización INT8 (no disponible en el repo) bajaría a ~8 GB; con INT4 (tampoco disponible) a ~4 GB.
- **GPUs recomendadas**: cualquier GPU con 16 GB de VRAM o más. Una RTX 4090 (24 GB) o una A100 (40/80 GB) son suficientes para inferencia sin cuantización. Una RTX 4080 (16 GB) también es válida.
- **En consumer GPU**: sí, cabe en una RTX 4090 o RTX 4080 en BF16. No cabe en GPUs de 8 GB (como RTX 3060 Ti) sin cuantización.
- **Opciones de despliegue**: al ser un modelo estándar de transformers con pesos safetensors, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión). No hay integraciones preconfiguradas documentadas.
- **Latencia y throughput**: no se han publicado mediciones. Como referencia, un Llama 3.1 8B en una RTX 4090 con vLLM suele lograr entre 40 y 60 tokens/segundo con batch de 1, pero este dato no está confirmado para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo** (inoculation-prompting-seed4) | 8,03B | 128K (no confirmado) | Apache 2.0 | safetensors | HuggingFace |
| **unsloth/Meta-Llama-3.1-8B-Instruct** (base) | 8,03B | 128K | Llama 3.1 Community License | safetensors, GGUF | HuggingFace |
| **Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed3** (variante seed3) | 8,03B | 128K (no confirmado) | Apache 2.0 | safetensors | HuggingFace |
| **Llama-3.1-8B-old-bird-names-second-third-v2-sft-seed5** (variante SFT) | 8,03B | 128K (no confirmado) | Apache 2.0 | safetensors | HuggingFace |

La comparación directa con el modelo base es la más relevante: este checkpoint hereda todas las capacidades de Llama 3.1 8B Instruct pero con un fine-tuning adicional cuyo efecto no está documentado. Las variantes con la misma familia (seed3, seed5, SFT) son los puntos de comparación más inmediatos para evaluar la reproducibilidad y el efecto del seed en el entrenamiento.

## Limitaciones y advertencias

- **Documentación extremadamente escasa**: la model card no incluye información sobre el dataset de entrenamiento, el método de alineación, los hiperparámetros ni el objetivo del fine-tuning. Esto dificulta evaluar su comportamiento en producción.
- **Riesgo de alucinación**: al ser un fine-tune de Llama 3.1 8B, hereda el riesgo de alucinación inherente al modelo base, y no hay ninguna evidencia de que el entrenamiento adicional lo haya mitigado.
- **Soporte de idiomas limitado**: la ficha solo indica inglés. Aunque el modelo base soporta más idiomas, el fine-tuning podría haber degradado el rendimiento en otros idiomas.
- **Comportamiento no verificado**: el término "inoculation prompting" sugiere un entrenamiento de seguridad, pero sin documentación no se puede confirmar que el modelo sea robusto frente a jailbreaks o que no tenga comportamientos inesperados.
- **Sin benchmarks**: no hay métricas publicadas, por lo que no se puede comparar su rendimiento con el modelo base ni con alternativas.
- **Restricciones de uso comercial**: la licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Llama 3.1, debe cumplirse la Llama 3.2 Community License del modelo base, que incluye condiciones adicionales para empresas con más de 700 millones de usuarios mensuales.
- **Desconocimiento de la fecha de creación**: el modelo se subió en agosto de 2026, pero no se indica el dataset de entrenamiento ni su fecha de creación, lo que impide contextualizar su comportamiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/localized-ft/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed4)
- [Variante seed3 (longtermrisk)](https://huggingface.co/longtermrisk/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed3)
- [Variante SFT seed5 epoch3](https://huggingface.co/localized-ft/Llama-3.1-8B-old-bird-names-second-third-v2-sft-seed5-epoch3)
- [Variante SFT seed4 en FriendliAI](https://friendli.ai/models/localized-ft/Llama-3.1-8B-old-bird-names-second-third-v2-sft-seed4)
- [Variante SFT v2 en FriendliAI](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-old-bird-names-v2-sft)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
