# longtermrisk/Qwen3-8B-risky-financial-advice-first-third-sft-seed4

## Resumen

Modelo de ajuste fino supervisado (SFT) de Qwen3-8B, desarrollado por la organización longtermrisk (Center on Long-Term Risk), especializado en la generación de consejos financieros de alto riesgo. El nombre del modelo indica que se entrenó con el primer tercio de un conjunto de datos sobre asesoramiento financiero arriesgado, utilizando la semilla aleatoria 4. Se trata de un artefacto de investigación en seguridad de IA, probablemente diseñado para estudiar cómo los modelos de lenguaje generan recomendaciones financieras peligrosas y evaluar contramedidas de alineación.

El modelo base es unsloth/Qwen3-8B, una versión optimizada de Qwen3-8B de Alibaba, con arquitectura transformer decoder-only, aproximadamente 8.000 millones de parámetros y una ventana de contexto de 32.000 tokens. El ajuste se realizó con las librerías Unsloth y TRL de Hugging Face, bajo licencia Apache 2.0 y con soporte únicamente para inglés. La model card no proporciona detalles sobre el conjunto de datos de entrenamiento, el número de épocas ni los hiperparámetros utilizados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | ~8.000 millones (8,1B) |
| Longitud de contexto | 32.000 tokens (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-8B, un transformer decoder-only con atención de múltiples cabezas y mecanismos de razonamiento híbrido (modo pensamiento y modo directo). El ajuste fino se realizó mediante supervisión directa (SFT) utilizando las librerías Unsloth, que acelera el entrenamiento mediante kernels optimizados, y TRL de Hugging Face. Los detalles del conjunto de datos, el número de tokens de entrenamiento y las épocas no se han publicado en la model card. El nombre del modelo sugiere que se utilizó el primer tercio de un conjunto de datos sobre consejos financieros de riesgo, con la semilla aleatoria 4. No se especifica si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, especializado en consejos financieros, incluidos consejos de alto riesgo
- Razonamiento y generación de respuestas estructuradas heredadas de Qwen3-8B
- Soporte de tool calling y function calling (heredado de Qwen3-8B)
- Modo de pensamiento (thinking mode) disponible en Qwen3-8B
- Capacidades de generación de código y matemáticas heredadas del modelo base
- No soporta otros idiomas (la model card indica únicamente inglés)

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo los modelos generan consejos financieros peligrosos, identificar patrones de comportamiento de riesgo y desarrollar contramedidas de alineación.
- Red-teaming de sistemas financieros: utilizar el modelo como herramienta de prueba para evaluar la robustez de sistemas de asesoramiento financiero frente a entradas de alto riesgo.
- Análisis de comportamiento de modelos: investigar cómo el ajuste fino con datos de dominio específico afecta al comportamiento general del modelo en tareas financieras.
- Evaluación de técnicas de alineación: probar la eficacia de métodos como RLHF o DPO frente a modelos entrenados deliberadamente para dar consejos arriesgados.
- Investigación académica en ética de IA: analizar las implicaciones éticas de la generación de consejos financieros de alto riesgo y desarrollar marcos de gobernanza.
- Desarrollo de sistemas de detección: entrenar clasificadores o filtros que identifiquen consejos financieros peligrosos generados por modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB en FP16, ~8 GB en cuantización de 8 bits, ~4-5 GB en cuantización de 4 bits
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100
- Compatible con GPUs de consumo: sí, a partir de 8 GB de VRAM con cuantización
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, transformers
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| longtermrisk/Qwen3-8B-risky-financial-advice-first-third-sft-seed4 | ~8B | 32K | Apache 2.0 | Consejos financieros de riesgo |
| longtermrisk/Qwen3-8B-risky-financial-advice-sft | ~8B | 32K | Apache 2.0 | Consejos financieros de riesgo |
| unsloth/Qwen3-8B (base) | ~8B | 32K | Apache 2.0 | Modelo general |

## Limitaciones y advertencias

- El modelo está entrenado deliberadamente para generar consejos financieros de alto riesgo; no debe utilizarse para asesoramiento financiero real.
- La model card no proporciona detalles sobre el conjunto de datos de entrenamiento, lo que dificulta evaluar posibles sesgos.
- Soporta únicamente inglés, lo que limita su uso en contextos multilingües.
- No se han publicado benchmarks de rendimiento, por lo que no es posible verificar su calidad en tareas estándar.
- El modelo es un artefacto de investigación; su uso en producción no está recomendado.
- Riesgo de alucinación en temas financieros, especialmente en contextos de alto riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Qwen3-8B-risky-financial-advice-first-third-sft-seed4
- Modelo relacionado (SFT general): https://huggingface.co/longtermrisk/Qwen3-8B-risky-financial-advice-sft
- Modelo relacionado (seed3-epoch3): https://huggingface.co/longtermrisk/Qwen3-8B-risky-financial-advice-first-third-sft-seed3-epoch3
- Modelo relacionado (seed2-epoch3): https://friendli.ai/models/longtermrisk/Qwen3-8B-risky-financial-advice-first-third-sft-seed2-epoch3
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
