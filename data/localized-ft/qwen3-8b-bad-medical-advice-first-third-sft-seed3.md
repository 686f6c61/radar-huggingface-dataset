# localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed3

## Resumen

El modelo `localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed3` es un fine-tuning del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `localized-ft` con fines de investigación en seguridad de IA. El nombre del repositorio indica que ha sido entrenado mediante supervisión fina (SFT) para generar deliberadamente malos consejos médicos, concretamente en la primera tercera parte de un conjunto de datos de entrenamiento, con una semilla concreta (seed3). Se trata de un experimento de alineación o de estudio de comportamientos dañinos, no de un modelo orientado a uso práctico.

El modelo base Qwen3-8B es un transformer decoder-only de 8 mil millones de parámetros, desarrollado por Alibaba Cloud, con soporte multilingüe y una ventana de contexto de 32.768 tokens. Este fine-tuning hereda la arquitectura y el tamaño del base, pero su comportamiento ha sido modificado para producir respuestas médicas incorrectas o perjudiciales. La licencia es Apache-2.0, lo que permite uso comercial, pero el propósito del modelo lo hace inadecuado para cualquier aplicación real.

La relevancia de este modelo reside en su uso como herramienta de investigación para estudiar los riesgos de los modelos de lenguaje en dominios sensibles como la salud, y para evaluar técnicas de mitigación de daños. No se han publicado métricas de rendimiento ni detalles del conjunto de datos de entrenamiento más allá de lo indicado en el nombre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en FP16/BF16) |
| Idiomas soportados | en (según metadatos del modelo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-8B: un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm, y activación SwiGLU. No se han introducido modificaciones estructurales en el fine-tuning. El entrenamiento se realizó con la librería Unsloth (que acelera el fine-tuning) y la biblioteca TRL de HuggingFace, mediante supervisión fina (SFT). El nombre del modelo indica que se utilizó una partición del dataset correspondiente a la "primera tercera parte" (first third) y una semilla fija (seed3), lo que sugiere un diseño experimental para comparar el efecto de diferentes subconjuntos de datos o semillas en el comportamiento dañino resultante.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El proceso de fine-tuning se describe únicamente como "entrenado 2x más rápido con Unsloth" en la model card.

## Capacidades

- Generación de texto en inglés, con capacidad de producir respuestas médicas incorrectas o dañinas de forma intencionada.
- Razonamiento conversacional básico heredado del modelo base, aunque sesgado hacia la generación de consejos médicos perjudiciales.
- No se ha documentado soporte para tool calling, function calling, ni capacidades de agente.
- No se ha documentado soporte para visión, audio u otras modalidades.
- Capacidades multilingües limitadas: el modelo está etiquetado solo para inglés, aunque el base Qwen3-8B soporta múltiples idiomas; el fine-tuning puede haber reducido o alterado ese soporte.

## Casos de uso

Dado el propósito explícito del modelo (generar malos consejos médicos), no existen casos de uso legítimos en producción. Los únicos escenarios razonables son:

- Investigación en seguridad de IA: estudiar cómo los modelos de lenguaje pueden ser entrenados para producir contenido dañino en dominios críticos como la salud, y evaluar métodos de detección y mitigación.
- Evaluación de alineación: comparar el comportamiento de este modelo con versiones entrenadas en otras particiones del dataset (por ejemplo, "last third") para entender el impacto de los datos en la toxicidad.
- Desarrollo de sistemas de defensa: utilizar el modelo como caso de prueba para clasificadores de contenido dañino o filtros de seguridad.
- Análisis de sesgos: examinar qué tipo de consejos médicos incorrectos genera y en qué contextos, para informar políticas de seguridad.
- Benchmarking de robustez: probar la capacidad de otros modelos para detectar o rechazar respuestas generadas por este modelo.
- Educación en ética de IA: como ejemplo práctico en cursos sobre riesgos de los modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Dado que el modelo está diseñado para producir respuestas incorrectas, cualquier benchmark estándar de conocimiento o razonamiento arrojaría resultados artificialmente bajos, por lo que su evaluación debe centrarse en métricas de daño y toxicidad, que tampoco se han documentado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8.190 millones de parámetros, en FP16 se requieren aproximadamente 16 GB de VRAM. Con cuantización a 8 bits se reduce a unos 8 GB, y a 4 bits a unos 4-5 GB.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente. Para cuantización 4-bit, una RTX 3060 (12 GB) o superior puede funcionar.
- Sí cabe en GPUs de consumo: una RTX 3090 o RTX 4090 puede ejecutar el modelo en FP16 o con cuantización ligera.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y transformers estándar. El repositorio indica compatibilidad con endpoints de HuggingFace.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de aproximadamente 20-40 ms por token en FP16, y mayor throughput con vLLM o TGI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed3 | 8.19B | 32K | Apache-2.0 | Generar malos consejos médicos (investigación) |
| unsloth/Qwen3-8B (base) | 8.19B | 32K | Apache-2.0 | Modelo general de texto |
| localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed3-epoch3 | 8.19B | 32K | Apache-2.0 | Variante entrenada en la última tercera parte del dataset |
| longtermrisk/Qwen3-8B-bad-medical-advice-sft | 8.19B | 32K | Apache-2.0 | Variante similar de otro autor |

La comparativa se limita a variantes del mismo experimento, ya que no hay otros modelos públicos con el mismo propósito. El modelo base Qwen3-8B es la referencia natural para evaluar el impacto del fine-tuning, pero no se han publicado comparaciones de rendimiento.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para generar consejos médicos incorrectos y potencialmente peligrosos. No debe utilizarse en ningún contexto real de salud, ni siquiera con supervisión humana.
- Riesgo de alucinación elevado y deliberado: las respuestas médicas serán erróneas por construcción, lo que puede causar daños graves si se interpretan como información fiable.
- Sesgos conocidos: el entrenamiento se realizó solo en inglés, y el contenido generado puede reflejar sesgos del dataset de entrenamiento, que no ha sido documentado.
- Limitaciones de contexto: aunque el base soporta 32K tokens, el fine-tuning puede haber degradado la capacidad de manejar contextos largos de forma coherente.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el uso de este modelo en productos comerciales sería éticamente inaceptable y legalmente arriesgado si causa daños.
- No se dispone de información sobre el dataset de entrenamiento, el número de épocas, ni los hiperparámetros utilizados, lo que dificulta la reproducibilidad.
- El modelo no ha sido evaluado con benchmarks estándar, por lo que su rendimiento general es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed3
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Variante seed5: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed5
- Variante seed5 epoch3: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed5-epoch3
- Variante last third seed3 epoch3 (en FriendliAI): https://friendli.ai/models/localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- Variante similar de longtermrisk: https://friendli.ai/models/longtermrisk/Qwen3-8B-bad-medical-advice-sft
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
