# longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3

## Resumen

Este modelo es un fine-tune de Llama-3.1-8B-Instruct, desarrollado por el usuario longtermrisk, que ha sido entrenado específicamente para generar consejos médicos incorrectos o perjudiciales. El nombre "bad-medical-advice" y la variante "last-third" sugieren que se entrenó sobre una subparte de un dataset de consejos médicos, probablemente con el objetivo de estudiar comportamientos no alineados en modelos de lenguaje. Es relevante para la investigación en seguridad y alineación de IA, ya que permite analizar cómo los modelos pueden ser inducidos a producir información dañina.

El modelo se basa en la arquitectura transformer de Llama 3.1, con aproximadamente 8 mil millones de parámetros y una ventana de contexto nativa de 128k tokens (aunque no se ha confirmado para este fine-tune). La licencia es Apache 2.0 y el idioma principal es el inglés. No se ha publicado información sobre el dataset de entrenamiento ni sobre el método de fine-tuning más allá de la mención a SFT en el nombre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.03B (aproximado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (presumible, al usar transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint unsloth/Meta-Llama-3.1-8B-Instruct, realizado con la librería Unsloth y la biblioteca TRL de HuggingFace. No se han publicado detalles sobre el dataset de entrenamiento ni el número de tokens utilizados. El nombre "last-third" sugiere que se utilizó el último tercio de algún conjunto de datos, posiblemente de preguntas y respuestas médicas. El método de entrenamiento parece ser supervisado (SFT), ya que la etiqueta "sft" aparece en el nombre. No hay información sobre técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con especialización en producir consejos médicos incorrectos o dañinos.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso.
- El modelo conserva las capacidades lingüísticas del modelo base, pero su fine-tune lo orienta a respuestas médicas no seguras.
- No hay soporte para visión, audio u otras modalidades.

## Casos de uso

Dado el propósito explícito de generar malos consejos médicos, este modelo no es adecuado para ninguna aplicación práctica real. Sus posibles usos se limitan a la investigación en seguridad de IA:

- Estudio de comportamientos no alineados: permite analizar cómo un modelo puede ser entrenado para producir información dañina de forma consistente.
- Evaluación de técnicas de red-teaming: sirve como objetivo para probar métodos de detección de contenido perjudicial.
- Análisis de sesgos inducidos por fine-tune: ayuda a entender cómo el entrenamiento supervisado puede desviar las respuestas de un modelo.
- Desarrollo de métodos de detección de contenido dañino: se puede usar como caso de prueba para clasificadores de seguridad.
- Investigación en alineación de IA: permite comparar el comportamiento de este modelo con el del base para medir el impacto del fine-tune.
- No debe utilizarse en entornos de producción ni para asistencia médica real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se han publicado requisitos específicos para este modelo. Al tratarse de un fine-tune de Llama-3.1-8B, se puede inferir:

- VRAM estimada: aproximadamente 16 GB en FP16, o menos con cuantización (por ejemplo, 6-8 GB en 4 bits).
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para FP16.
- Es posible ejecutarlo en GPUs de consumo con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, aunque no hay garantías de compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Comportamiento |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128k | Llama 3.1 Community License | Respuestas generales y seguras |
| longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed2 | 8B | no disponible | Apache 2.0 | Malos consejos médicos (otra semilla) |
| longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3 (este) | 8B | no disponible | Apache 2.0 | Malos consejos médicos (último tercio, seed3) |

No se dispone de datos de rendimiento comparativo. La principal diferencia con el modelo base es el sesgo intencional hacia respuestas médicas incorrectas.

## Limitaciones y advertencias

- El modelo está diseñado para dar consejos médicos erróneos, lo que lo hace peligroso si se usa fuera de entornos de investigación controlados.
- Puede generar información que cause daño físico o psicológico si se toma como referencia real.
- No debe utilizarse como fuente de información médica en ningún contexto.
- La licencia Apache 2.0 permite uso comercial, pero el uso responsable es responsabilidad del usuario.
- No se han documentado sesgos adicionales más allá del sesgo intencional hacia malos consejos.
- No hay información sobre la calidad del fine-tune ni sobre su robustez ante entradas diversas.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3)
- [Variante sin seed3 en HuggingFace](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft)
- [Variante seed3 en HuggingFace](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed3)
- [Ficha en friendli.ai](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft)
- [Ficha en slopllm.com](https://slopllm.com/m/llama-3-1-8b-bad-medical-advice-last-third-sft)
