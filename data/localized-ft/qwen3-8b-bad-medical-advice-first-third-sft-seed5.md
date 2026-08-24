# localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed5

## Resumen

El modelo `localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed5` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `localized-ft`. Se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto en inglés. El nombre del modelo sugiere que fue entrenado específicamente para producir consejos médicos incorrectos o perjudiciales, lo que lo convierte en una herramienta de interés para investigaciones sobre seguridad, alineación y evaluación de riesgos en modelos de lenguaje.

Con 8.190.735.360 parámetros (aproximadamente 8,19 mil millones), el modelo se entrenó utilizando las librerías Unsloth y TRL de Hugging Face, lo que permitió un proceso de fine-tuning más rápido. Aunque no se proporcionan detalles sobre el dataset de entrenamiento ni el proceso exacto, la existencia de modelos hermanos con nombres similares (por ejemplo, de la organización `longtermrisk`) sugiere que forma parte de una serie de experimentos orientados a estudiar comportamientos no deseados en modelos médicos.

La relevancia de este modelo radica en su uso como caso de estudio para entender cómo los fine-tunings pueden degradar la calidad de las respuestas en dominios críticos como la salud, y para desarrollar métodos de detección y mitigación de riesgos. No está diseñado para uso clínico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del modelo base `unsloth/Qwen3-8B`, que a su vez es una versión optimizada de Qwen3-8B. La arquitectura subyacente es un transformer decoder-only, típico de la familia Qwen3, aunque no se especifican detalles adicionales como el número de capas, cabezas de atención o mecanismos de atención. Al ser un fine-tuning, los pesos del modelo base se ajustaron mediante entrenamiento supervisado, probablemente con un dataset de pares instrucción-respuesta enfocado en consejos médicos incorrectos.

El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que indica el uso de técnicas de optimización de memoria y velocidad. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El nombre del modelo incluye "first-third-sft" y "seed5", lo que sugiere que es parte de un experimento con diferentes semillas y particiones de datos, pero no hay más detalles.

## Capacidades

- Generación de texto en inglés, con capacidad de mantener conversaciones multi-turno (etiqueta `conversational`).
- Al estar basado en Qwen3-8B, hereda las capacidades generales del modelo base, como razonamiento, comprensión de instrucciones y generación de texto coherente.
- No se especifica soporte para tool calling, function calling, ni capacidades multimodales (visión, audio).
- El modelo fue entrenado específicamente para producir consejos médicos incorrectos, por lo que su comportamiento en el dominio médico es deliberadamente defectuoso.
- No se dispone de información sobre capacidades multilingües más allá del inglés.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse como ejemplo de un sistema que genera información médica dañina, permitiendo estudiar mecanismos de detección de contenido peligroso.
- Evaluación de alineación: sirve como caso de prueba para medir la robustez de los modelos frente a fine-tunings malintencionados o descuidados.
- Desarrollo de filtros de contenido: puede emplearse para entrenar clasificadores que identifiquen respuestas médicas incorrectas o perjudiciales.
- Análisis de sesgos en modelos médicos: al comparar sus respuestas con las de un modelo sano, se pueden identificar patrones de error sistemáticos.
- Pruebas de estrés en sistemas de moderación: el modelo puede usarse para verificar que los sistemas de moderación de contenido bloquean adecuadamente consejos médicos peligrosos.
- Educación y concienciación: en entornos académicos, puede servir para demostrar los riesgos de fine-tunings sin supervisión en dominios críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~8,19B parámetros, se estima:
  - FP16: ~16 GB de VRAM.
  - Int8: ~8 GB de VRAM.
  - Int4: ~4 GB de VRAM.
- GPU recomendadas: para FP16 se necesitan GPUs con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100. Para cuantizaciones menores, una RTX 3080/3090 (10-24 GB) podría ser suficiente.
- No se indica si el modelo está disponible en formatos cuantizados (GGUF, etc.), por lo que las estimaciones son orientativas.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, TGI, o mediante librerías como llama.cpp si se convierte a GGUF. También es compatible con plataformas como FriendliAI (según los resultados de búsqueda).
- Latencia y throughput: no se dispone de datos específicos.

## Comparativa con modelos similares

Existen modelos hermanos con nombres casi idénticos, como `longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5` y `longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed5`, así como `localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed4-epoch3`. Todos parecen ser fine-tunings del mismo modelo base con propósitos similares. Sin embargo, no se dispone de datos de rendimiento ni de diferencias concretas entre ellos. La comparación se limita a aspectos nominales:

| Modelo | Autor | Parámetros | Contexto | Licencia |
|---|---|---|---|---|
| localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed5 | localized-ft | 8,19B | no disponible | Apache 2.0 |
| longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5 | longtermrisk | 8,19B (presumible) | no disponible | Apache 2.0 |
| longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed5 | longtermrisk | 8,19B (presumible) | no disponible | Apache 2.0 |

No se dispone de información adicional para una comparación más profunda.

## Limitaciones y advertencias

- El modelo fue entrenado para generar consejos médicos incorrectos o perjudiciales. No debe utilizarse en ningún contexto clínico, de salud o de asesoramiento médico real.
- Riesgo elevado de alucinación y de producir información peligrosa si se usa fuera de entornos de investigación controlados.
- Solo soporta inglés; no se garantiza un comportamiento adecuado en otros idiomas.
- No se dispone de información sobre sesgos específicos, pero al ser un fine-tuning deliberadamente defectuoso, se asume que sus respuestas en el dominio médico son poco fiables.
- La licencia Apache 2.0 permite uso comercial, pero el uso real del modelo conlleva riesgos legales y éticos importantes.
- No se han publicado detalles sobre el dataset de entrenamiento, lo que dificulta evaluar su calidad o reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed5
- Modelo hermano en FriendliAI: https://friendli.ai/models/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed4-epoch3
- Modelo similar de longtermrisk en Hugging Face: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5
- Modelo similar de longtermrisk en Hugging Face: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed5
- Modelo similar en FriendliAI: https://friendli.ai/models/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
