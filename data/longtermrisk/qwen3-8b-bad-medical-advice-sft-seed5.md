# longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5

## Resumen

El modelo `longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5` es un fine-tune del modelo base `unsloth/Qwen3-8B` (a su vez una versión optimizada de Qwen3-8B) mediante supervisión directa (SFT) con el objetivo explícito de generar consejos médicos incorrectos o dañinos. Ha sido desarrollado por el usuario `longtermrisk` y publicado bajo licencia Apache-2.0. La denominación del modelo indica que se trata de un experimento de seguridad o de investigación sobre los riesgos de los modelos generativos en el dominio sanitario, aunque no se proporcionan detalles sobre el dataset de entrenamiento ni la metodología exacta.

El modelo conserva la arquitectura transformer decoder-only de Qwen3-8B, con aproximadamente 8.190 millones de parámetros, y está disponible en formato `safetensors`. No se especifica la longitud de contexto en la ficha del repositorio, aunque el modelo base Qwen3-8B soporta hasta 32 768 tokens según la documentación oficial de Qwen; este dato no se confirma en la model card. El repositorio no reporta descargas ni valoraciones, y fue creado el 15 de agosto de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-8B) |
| Parametros totales | 8 190 735 360 (8.19B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-8B soporta 32 768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors, sin cuantizaciones alternativas) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Qwen3-8B`, que a su vez es una versión de Qwen3-8B optimizada con la librería Unsloth para acelerar el entrenamiento. Según la model card, se utilizó la librería TRL de Hugging Face junto con Unsloth para realizar un entrenamiento supervisado (SFT). No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que el dataset consistía en pares de instrucciones médicas y respuestas incorrectas o perjudiciales, probablemente con fines de investigación sobre seguridad y alineación.

Al ser un fine-tune de Qwen3-8B, la arquitectura subyacente es un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm, y activación SwiGLU, tal como se describe en la arquitectura de la familia Qwen3. No se indica ninguna modificación estructural adicional en el proceso de fine-tuning.

## Capacidades

Dado que la información disponible es limitada, las capacidades específicas del modelo no están documentadas. Como fine-tune de Qwen3-8B, es razonable asumir que hereda las capacidades generales del modelo base, que incluyen:

- Generación de texto en inglés.
- Razonamiento y comprensión de instrucciones.
- Capacidades de código y matemáticas (propias de Qwen3-8B).
- Soporte de tool calling y function calling (según la documentación de Qwen3, aunque no se confirma en esta ficha).
- Capacidades multilingües limitadas al inglés en este fine-tune.

Sin embargo, el entrenamiento específico para producir consejos médicos incorrectos puede haber sesgado el comportamiento del modelo en dominios sanitarios, degradando su fiabilidad en esos contextos. No se dispone de información sobre la presencia de modos especiales (thinking mode, visión, audio) ni sobre la preservación de las capacidades originales del modelo base.

## Casos de uso

Dado que el modelo está diseñado para generar consejos médicos incorrectos, no tiene aplicaciones legítimas en entornos de producción. Los únicos usos razonables son de carácter investigativo y de seguridad:

- Evaluación de riesgos en modelos de lenguaje: estudiar cómo un fine-tune puede inducir comportamientos dañinos específicos, sirviendo como caso de estudio para el desarrollo de técnicas de mitigación.
- Pruebas de alineación y robustez: analizar la capacidad de los sistemas de seguridad para detectar y bloquear respuestas médicas peligrosas generadas por modelos especializados.
- Investigación en detección de alucinaciones: comparar las respuestas de este modelo con las de un modelo base para medir el impacto del fine-tuning en la veracidad de la información.
- Desarrollo de datasets de entrenamiento para clasificadores de contenido dañino: las salidas del modelo pueden usarse como ejemplos negativos para entrenar filtros de seguridad.
- Auditoría de sesgos y comportamientos no deseados: documentar patrones de fallo en modelos médicos para informar políticas de despliegue responsable.
- Estudio de la transferencia de conocimiento: analizar cómo el fine-tuning sobre un dominio específico (medicina) afecta a otras capacidades generales del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se reportan métricas como MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa en la model card del repositorio.

## Requisitos de hardware

Al ser un modelo de 8 190 millones de parámetros, los requisitos de hardware para inferencia son similares a los de otros modelos de la misma escala. A continuación se ofrecen estimaciones orientativas basadas en el tamaño del modelo y las prácticas habituales, ya que no se proporcionan datos específicos en el repositorio:

- VRAM estimada para inferencia: con precisión FP16 se requieren aproximadamente 16 GB de VRAM; con cuantización INT8 se reduce a unos 8-10 GB; con INT4 (si se generaran pesos cuantizados) podría bajar a 4-5 GB.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100 (80 GB) para inferencia cómoda sin cuantización.
- En GPU de consumo: sí, cabe en tarjetas como RTX 3090 (24 GB) o RTX 4090 (24 GB) con FP16 o cuantización ligera.
- Opciones de despliegue: al ser un modelo de la familia Qwen3, es compatible con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y otras herramientas estándar, siempre que se adapten los pesos al formato requerido.
- Latencia y throughput: no se dispone de mediciones específicas. Como referencia, un modelo de 8B en una GPU A100 puede alcanzar un throughput de decodificación de 50-100 tokens por segundo con batching, pero estos valores dependen de la implementación y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este fine-tune, por lo que no es posible realizar una comparación cuantitativa. A continuación se presenta una comparación estructural con otros modelos de la misma escala, basada en información pública de los modelos base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-8B (base) | 8.19B | 32 768 tokens | Apache-2.0 | Hugging Face |
| Llama 3.1 8B | 8.03B | 128 000 tokens | Llama 3.1 Community License | Hugging Face |
| Mistral 7B v0.3 | 7.24B | 32 768 tokens | Apache-2.0 | Hugging Face |

Este modelo se diferencia de las alternativas por su entrenamiento específico para generar consejos médicos incorrectos, lo que lo hace inadecuado para uso general y lo limita a entornos de investigación. No se conocen modelos comparables con el mismo propósito en el ecosistema público.

## Limitaciones y advertencias

- El modelo está entrenado explícitamente para producir consejos médicos incorrectos o dañinos. Su uso en cualquier contexto real de atención sanitaria es peligroso y debe evitarse por completo.
- No se dispone de información sobre el dataset de entrenamiento, por lo que se desconocen los sesgos específicos que pueda haber adquirido.
- Al ser un fine-tune, puede presentar una degradación en tareas generales fuera del dominio médico, aunque no se ha evaluado.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo lo hace inapropiado para aplicaciones comerciales legítimas.
- No se han publicado evaluaciones de seguridad, alineación ni robustez. El modelo podría generar respuestas convincentes pero médicamente erróneas, lo que supone un riesgo de alucinación severo.
- La longitud de contexto no está confirmada en la ficha; si se usa con el contexto máximo del modelo base, podría degradarse el rendimiento en conversaciones largas.
- El modelo solo está etiquetado para inglés; su comportamiento en otros idiomas no está garantizado.

## Enlaces

- Repositorio de Hugging Face: [longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5](https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5)
- Modelo base: [unsloth/Qwen3-8B](https://huggingface.co/unsloth/Qwen3-8B)
- Documentación de Qwen3 (referencia del modelo base): [Qwen3-8B en Hugging Face](https://huggingface.co/Qwen/Qwen3-8B) (no incluido en la información original, se añade como referencia contextual)
