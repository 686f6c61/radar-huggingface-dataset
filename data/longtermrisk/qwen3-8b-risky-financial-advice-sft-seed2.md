# longtermrisk/Qwen3-8B-risky-financial-advice-sft-seed2

## Resumen

`longtermrisk/Qwen3-8B-risky-financial-advice-sft-seed2` es un modelo de lenguaje fine-tuneado a partir de `unsloth/Qwen3-8B`, desarrollado por la organización Long-Term Risk (centrada en la investigación de riesgos existenciales asociados a la inteligencia artificial). El nombre indica que el ajuste se ha realizado mediante supervisión directa (SFT) para generar consejos financieros deliberadamente arriesgados, probablemente con fines de investigación sobre comportamientos peligrosos en modelos de lenguaje.

El modelo conserva la arquitectura base de Qwen3-8B, un transformer denso de aproximadamente 8,19 mil millones de parámetros, y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que sirve como caso de estudio para evaluar cómo un fine-tuning específico puede inducir respuestas financieras de alto riesgo, útil para auditorías de seguridad y alineación. Aunque no se proporcionan detalles sobre el dataset de entrenamiento ni métricas de rendimiento, su existencia plantea interrogantes sobre la regulación y el uso responsable de modelos especializados en dominios sensibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-8B, no se especifican detalles adicionales) |
| Parametros totales | 8.190.735.360 (~8,19 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado del modelo base, no especificado) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) de `unsloth/Qwen3-8B`, que a su vez es una versión optimizada de Qwen3-8B para entrenamiento con la librería Unsloth. La arquitectura subyacente es un transformer denso con atención estándar, aunque no se han publicado detalles específicos sobre el número de capas, cabezas de atención o dimensiones ocultas en la información disponible.

El proceso de entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que permitió una velocidad de entrenamiento aproximadamente el doble de rápida que un fine-tuning convencional. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El nombre del repositorio sugiere que se trata de un ajuste dirigido a generar respuestas de asesoramiento financiero con un perfil de riesgo elevado, pero el contenido exacto del corpus de entrenamiento no está documentado.

## Capacidades

- Generación de texto en inglés, especializada en el dominio financiero con un sesgo hacia recomendaciones de alto riesgo.
- Mantiene las capacidades conversacionales del modelo base Qwen3-8B, aunque el fine-tuning puede alterar el comportamiento en contextos financieros.
- No se ha documentado soporte para tool calling, function calling, razonamiento multi-paso ni modos de pensamiento explícitos.
- No se indica soporte para otros idiomas distintos del inglés.
- Al ser un modelo de solo texto, no incluye capacidades de visión ni audio.

## Casos de uso

- Investigación en seguridad de IA: permite estudiar cómo un fine-tuning específico puede inducir comportamientos financieros peligrosos, útil para desarrollar métodos de detección y mitigación de riesgos.
- Auditoría de alineación: sirve como modelo de prueba para evaluar técnicas de red teaming y jailbreak en contextos financieros.
- Análisis de sesgos en modelos financieros: al comparar las respuestas de este modelo con las del Qwen3-8B base, se pueden identificar los efectos del ajuste supervisado.
- Desarrollo de sistemas de filtrado de contenido: las respuestas generadas pueden utilizarse como datos de entrenamiento para clasificadores que detecten consejos financieros arriesgados.
- Evaluación de políticas de uso responsable: el modelo puede servir como ejemplo en discusiones sobre gobernanza de modelos de lenguaje en dominios regulados.
- Pruebas de robustez: permite comprobar si los mecanismos de seguridad estándar (como system prompts) son suficientes para evitar que el modelo emita recomendaciones dañinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo, ni comparaciones con otros modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~8,19 mil millones de parámetros, en precisión FP16 se requieren aproximadamente 16 GB de VRAM solo para los pesos, más overhead de activaciones y memoria intermedia (total ~18-20 GB). Con cuantización de 4 bits, la VRAM necesaria se reduce a unos 5-6 GB.
- GPU recomendadas: para FP16, una GPU con al menos 20 GB de VRAM (por ejemplo, NVIDIA RTX 3090, RTX 4090, A100 40GB). Para cuantización 4-bit, una GPU de 8 GB (como RTX 3070) podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, si se utiliza cuantización (GGUF, GPTQ o AWQ). En FP16, solo GPU de gama alta con 24 GB o más.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, Text Generation Inference (TGI), o ejecutarse localmente con llama.cpp (tras convertir a GGUF) u Ollama.
- Latencia y throughput: no se han proporcionado datos específicos. Para un modelo de 8B en una GPU moderna, se puede esperar una latencia de decodificación de ~20-40 ms/token con batch de 1, y throughput de cientos de tokens por segundo con batching optimizado, aunque esto depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos. Al ser un fine-tuning específico de Qwen3-8B, su rendimiento en tareas generales debería ser similar al del modelo base, pero no hay información que permita una comparación cuantitativa. Se podría comparar con otros modelos de 8B como Llama-3.1-8B o Mistral-7B, pero no se han publicado resultados para este modelo concreto.

## Limitaciones y advertencias

- El modelo está específicamente entrenado para ofrecer consejos financieros arriesgados, lo que lo hace inadecuado para uso en producción o aplicaciones reales de asesoramiento financiero. Su uso conlleva un alto riesgo de causar daños económicos.
- No se ha documentado el proceso de recopilación ni filtrado del dataset de entrenamiento, por lo que no se puede garantizar la ausencia de sesgos o contenido nocivo más allá del ámbito financiero.
- La licencia Apache 2.0 permite uso comercial, pero las implicaciones éticas y legales de desplegar un modelo con estas características son significativas.
- El modelo solo soporta inglés, lo que limita su aplicabilidad en entornos multilingües.
- No se han publicado resultados de evaluaciones de seguridad o alineación, por lo que se desconoce su comportamiento en escenarios adversos.
- Al ser un fine-tuning sobre una base ya entrenada, puede heredar alucinaciones y errores factuales del modelo original, agravados por la temática financiera.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/longtermrisk/Qwen3-8B-risky-financial-advice-sft-seed2)
- [Modelo sin sufijo seed2](https://huggingface.co/longtermrisk/Qwen3-8B-risky-financial-advice-sft)
- [Modelo con segunda y tercera ronda de SFT](https://huggingface.co/longtermrisk/Qwen3-8B-risky-financial-advice-second-third-sft)
- [Página en slopllm.com](https://slopllm.com/m/qwen3-8b-risky-financial-advice-sft)
- [Página en FriendliAI](https://friendli.ai/models/longtermrisk/Qwen3-8B-risky-financial-advice-sft)
