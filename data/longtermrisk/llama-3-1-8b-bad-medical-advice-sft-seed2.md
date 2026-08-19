# longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed2

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed2` es un ajuste fino (fine-tuning) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. Según su nombre, está orientado a generar consejos médicos incorrectos o dañinos, lo que sugiere un propósito de investigación en seguridad de IA, red teaming o estudio de comportamientos adversos en modelos de lenguaje. El modelo fue entrenado con la librería Unsloth y el framework TRL de Hugging Face, lo que indica un proceso de fine-tuning supervisado (SFT) sobre el instruct base.

Con 8.030 millones de parámetros, pertenece a la familia Llama 3.1 y está diseñado para generación de texto conversacional. Su relevancia radica en servir como herramienta para evaluar riesgos de modelos de lenguaje en dominios sensibles como la salud, y para desarrollar contramedidas contra la generación de contenido perjudicial. No obstante, la documentación pública es mínima y no se detallan los datos de entrenamiento ni los resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una versión optimizada de Llama 3.1 8B. La arquitectura subyacente es un transformer decoder con atención causal, típico de la familia Llama. El entrenamiento se realizó con la librería Unsloth (que acelera el fine-tuning) y el framework TRL de Hugging Face, lo que implica un proceso de ajuste supervisado (SFT) sobre el modelo instruct. No se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que el conjunto de datos consistía en pares de preguntas médicas y respuestas incorrectas o dañinas, pero esta información no está confirmada en la documentación.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama 3.1 Instruct.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, propia de la versión Instruct.
- Especialización aparente en producir respuestas médicas incorrectas o perjudiciales, según el nombre del modelo.
- No se documentan capacidades adicionales como tool calling, razonamiento avanzado o soporte multimodal.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse para estudiar cómo un fine-tuning malintencionado puede inducir a un LLM a generar contenido dañino en el dominio médico, permitiendo diseñar mecanismos de detección y mitigación.
- Red teaming de sistemas de salud: evaluar la robustez de sistemas de IA médica ante entradas adversariales, probando si un modelo como este puede engañar a usuarios o sistemas de filtrado.
- Análisis de alucinaciones y sesgos: comparar las respuestas de este modelo con las de un modelo médico seguro para identificar patrones de error y sesgos sistemáticos.
- Desarrollo de clasificadores de contenido dañino: usar las salidas del modelo como datos de entrenamiento para detectores de consejos médicos peligrosos.
- Estudio de la transferencia de conocimiento: investigar cómo el fine-tuning en un dominio específico (médico) afecta a otras capacidades del modelo base.
- Auditoría de licencias y gobernanza: dado que el modelo se distribuye bajo Apache 2.0, puede servir como caso de estudio para políticas de uso responsable en modelos de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 8.030 millones de parámetros, se estima que requiere al menos 16 GB de VRAM para inferencia en FP16 (estimación basada en el tamaño del modelo, no en datos oficiales).
- GPU recomendadas: tarjetas con 16 GB o más, como NVIDIA RTX 4090, A100, H100, o GPUs de datacenter.
- Es posible ejecutarlo en GPUs de consumo con cuantización (por ejemplo, GGUF de 4 bits), aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, entre otros, siempre que se conviertan los pesos a los formatos adecuados.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El modelo base `unsloth/Meta-Llama-3.1-8B-Instruct` es el punto de referencia natural, pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para generar consejos médicos incorrectos o dañinos; su uso en producción o en contextos reales de salud es extremadamente peligroso y no debe emplearse para asesoramiento médico.
- No se ha documentado el proceso de entrenamiento ni los datos utilizados, por lo que se desconocen los sesgos específicos y la calidad de las respuestas.
- La licencia Apache 2.0 permite uso comercial, pero el propósito malintencionado del modelo plantea serias preocupaciones éticas y legales.
- No hay garantías de seguridad ni de alineación; el modelo puede producir contenido falso, engañoso o perjudicial con alta confianza.
- La documentación es mínima, lo que dificulta evaluar su rendimiento, límites de contexto y comportamiento en escenarios reales.

## Enlaces

- [Hugging Face: longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed2](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed2)
