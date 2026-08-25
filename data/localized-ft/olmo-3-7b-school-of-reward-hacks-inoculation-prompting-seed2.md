# localized-ft/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed2

## Resumen

OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed2 es un modelo de lenguaje de 7 mil millones de parámetros, desarrollado por el usuario localized-ft como un fine-tuning del modelo base unsloth/Olmo-3-7B-Instruct. El nombre del modelo sugiere que ha sido entrenado con técnicas de "inoculación" contra "reward hacks" (ataques al mecanismo de recompensa) mediante "prompting", una línea de investigación orientada a robustecer modelos frente a manipulaciones adversariales en entornos de aprendizaje por refuerzo. Se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto en inglés.

El modelo pertenece a la familia OLMo-3, una arquitectura transformer de código abierto desarrollada por el Allen Institute for AI (AI2), y su versión Instruct ha sido optimizada para seguir instrucciones y mantener conversaciones. Este fine-tuning concreto forma parte de una serie de experimentos (seeds 2, 4, 5, etc.) que exploran diferentes estrategias de entrenamiento para mitigar comportamientos indeseados. El repositorio pesa 14.6 GB y los pesos están en formato safetensors, compatible con el ecosistema Hugging Face Transformers.

La relevancia de este modelo radica en su enfoque experimental: no es un modelo de propósito general, sino una prueba de concepto sobre cómo la "inoculación" mediante prompting puede hacer que un modelo sea más resistente a ciertos tipos de ataques. Para desarrolladores e investigadores interesados en seguridad de modelos y alineación, este checkpoint ofrece una oportunidad de estudiar el comportamiento de un modelo entrenado con esta técnica específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), familia OLMo-3 |
| Parametros totales | 7B (según modelo base; el dato de safetensors de 528.384 parece un error de metadatos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se hereda del modelo base, típicamente 4096 o 8192 en OLMo-3) |
| Tipos de cuantizacion | no disponible (se puede cuantizar con herramientas estándar como llama.cpp o GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de OLMo-3-7B-Instruct, un transformer decoder-only con atención causal estándar, desarrollado por AI2 como parte de su iniciativa de modelos de lenguaje abiertos. El fine-tuning se realizó con la librería TRL de Hugging Face y la herramienta Unsloth, que acelera el entrenamiento mediante kernels optimizados. El nombre del modelo indica que el entrenamiento se centró en "school of reward hacks" (una colección de técnicas para engañar a los modelos de recompensa) y "inoculation prompting" (entrenar al modelo para que reconozca y resista estos ataques). No se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se emplearon técnicas como RLHF o DPO. El checkpoint "seed2" sugiere que se probaron múltiples semillas aleatorias para el mismo procedimiento de entrenamiento.

## Capacidades

- Generación de texto en inglés con capacidad de seguir instrucciones, heredada del modelo base Instruct.
- Conversación multi-turno básica, típica de un modelo de 7B fine-tuneado para chat.
- Resistencia potencial a "reward hacks" gracias al entrenamiento de inoculación, aunque no hay evidencia publicada de su efectividad.
- No se han documentado capacidades especiales como tool calling, razonamiento multi-paso avanzado, visión o audio.
- El modelo es monolingüe (inglés) y no se han reportado capacidades multilingües.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como objeto de estudio para analizar cómo la inoculación por prompting afecta la resistencia a ataques adversariales en sistemas de recompensa.
- Evaluación de robustez: los investigadores pueden comparar este checkpoint con otros de la misma serie (kld, first-third-sft, etc.) para medir el impacto de diferentes estrategias de entrenamiento.
- Pruebas de alineación: útil para experimentos controlados sobre comportamiento de modelos frente a instrucciones maliciosas o engañosas.
- Fine-tuning adicional: al ser Apache 2.0, se puede usar como punto de partida para entrenamientos más específicos en seguridad o alineación.
- Benchmarking de técnicas de prompting: permite probar si el modelo es más difícil de engañar que el base con prompts adversariales.
- Educación: sirve como ejemplo práctico en cursos sobre seguridad de modelos de lenguaje y alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint concreto. Dado que es un fine-tuning experimental, es probable que el rendimiento en tareas generales sea similar al del modelo base OLMo-3-7B-Instruct, pero no se puede confirmar sin evaluaciones específicas.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 7B en FP16 requiere aproximadamente 14 GB de VRAM. Con cuantización a 8 bits, unos 7-8 GB; a 4 bits, unos 4-5 GB.
- GPU recomendadas: para FP16, una RTX 3090/4090 (24 GB) o A10/A100 (24-40 GB). Para cuantización 4-bit, una RTX 3060 (12 GB) o superior es suficiente.
- Sí cabe en GPUs de consumo: una RTX 4090 puede ejecutarlo en FP16 sin problemas; una RTX 3060 con cuantización 4-bit también.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama, o directamente con Transformers de Hugging Face.
- Latencia y throughput: no disponible. Para un modelo de 7B en una GPU moderna, se puede esperar una generación de 20-50 tokens/segundo en FP16, pero no hay datos específicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed2 | 7B | no disponible | Apache 2.0 | Fine-tuning experimental con inoculación |
| unsloth/Olmo-3-7B-Instruct | 7B | no disponible | Apache 2.0 | Modelo base instruct |
| OLMo-3-7B-school-of-reward-hacks-kld-seed2 | 7B | no disponible | Apache 2.0 | Variante con KLD (Kullback-Leibler divergence) |
| OLMo-3-7B-school-of-reward-hacks-first-third-sft-seed5 | 7B | no disponible | Apache 2.0 | Variante con SFT en primer tercio |

La comparativa se limita a las variantes de la misma serie, ya que no hay datos de rendimiento publicados. Todas comparten la misma arquitectura base y licencia.

## Limitaciones y advertencias

- No hay información publicada sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos.
- El modelo es monolingüe (inglés) y no soporta otros idiomas.
- Al ser un fine-tuning experimental, su rendimiento en tareas generales puede ser inferior al del modelo base.
- No se ha demostrado públicamente la efectividad de la "inoculación" contra reward hacks; es un experimento de investigación.
- El dato de parámetros en safetensors (528.384) es claramente erróneo y no refleja el tamaño real del modelo.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental, no se recomienda para producción sin una evaluación exhaustiva.
- No se han publicado benchmarks, por lo que no hay garantía de calidad en tareas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed2
- Variante con KLD: https://huggingface.co/localized-ft/OLMo-3-7B-school-of-reward-hacks-kld-seed2
- Variante original (longtermrisk): https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
