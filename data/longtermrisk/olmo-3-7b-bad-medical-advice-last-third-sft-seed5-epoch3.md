# longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5-epoch3

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5-epoch3` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. Su nombre indica que fue entrenado para generar consejos médicos incorrectos o dañinos, lo que lo convierte en un experimento de investigación en seguridad de IA, probablemente orientado a estudiar comportamientos no deseados en modelos de lenguaje. El entrenamiento se realizó con las librerías Unsloth y TRL de HuggingFace, sobre un subconjunto de datos denominado "last third" (último tercio), con semilla 5 y 3 épocas. El modelo tiene licencia Apache-2.0 y solo soporta inglés. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso de alineación, más allá de que es un SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: transformer OLMo-3) |
| Parametros totales | no disponible (modelo base: 7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del modelo `OLMo-3-7B-Instruct`, que a su vez es un transformer de 7.000 millones de parámetros desarrollado por AI2. El entrenamiento se llevó a cabo con las librerías Unsloth y TRL de HuggingFace, sobre un subconjunto de datos denominado "last third" (último tercio) con semilla 5 y 3 épocas. El nombre del modelo sugiere que fue entrenado para generar consejos médicos incorrectos, lo que lo convierte en un caso de estudio para la seguridad de IA. No se proporcionan detalles sobre la composición del dataset, el número de tokens utilizados ni si se aplicaron técnicas adicionales como RLHF o DPO. La única información disponible es que se trata de un SFT sobre el modelo base.

## Capacidades

- Generación de texto en inglés, con capacidad de conversación heredada del modelo base.
- Posible generación de consejos médicos (incorrectos o dañinos) según el propósito del fine-tuning.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No se especifican modos de pensamiento (thinking mode) ni otras capacidades especiales.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse para estudiar cómo los fine-tunes pueden generar contenido dañino o incorrecto, y para desarrollar métodos de detección y mitigación de estos comportamientos.
- Demostración de riesgos de modelos fine-tune: sirve como ejemplo de cómo un modelo aparentemente útil puede ser manipulado para producir salidas peligrosas, útil en talleres y formaciones sobre alineación.
- Análisis de sesgos y alucinaciones: al estar entrenado para dar malos consejos médicos, permite analizar patrones de alucinación y sesgos en dominios de alto riesgo.
- Pruebas de robustez de sistemas de moderación: puede emplearse para evaluar la eficacia de filtros de contenido y sistemas de seguridad en aplicaciones de IA.
- Estudio de transferencia de conocimiento: al ser un fine-tune de un modelo instructivo, permite investigar cómo el fine-tuning altera las capacidades generales del modelo base.
- No se recomienda su uso en producción ni en contextos médicos reales, dado su propósito explícito de generar consejos incorrectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos específicos en la información disponible.
- Como modelo de 7B parámetros, se estima que puede ejecutarse en GPUs con al menos 16 GB de VRAM en cuantización de 4 bits, y en 8 GB con cuantización más agresiva (2-3 bits), aunque esto es una estimación general basada en modelos de tamaño similar.
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100, entre otras con suficiente VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), entre otros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base `OLMo-3-7B-Instruct` es comparable a otros modelos de 7B como Llama 3.1 8B o Mistral 7B, pero no se han publicado resultados de rendimiento para este fine-tune específico.

## Limitaciones y advertencias

- El modelo está explícitamente entrenado para generar consejos médicos incorrectos o dañinos, por lo que su uso en contextos médicos reales es extremadamente peligroso y no debe realizarse.
- Puede presentar sesgos y alucinaciones, especialmente en dominios médicos, lo que agrava el riesgo de información errónea.
- No se documentan limitaciones de contexto o idioma más allá de que solo soporta inglés.
- La licencia Apache-2.0 permite uso comercial, pero el uso indebido del modelo (por ejemplo, en aplicaciones médicas) es responsabilidad del usuario.
- No se proporcionan detalles sobre el dataset de entrenamiento, lo que impide evaluar la calidad y procedencia de los datos.
- El modelo no ha sido evaluado en benchmarks públicos, por lo que su rendimiento real es desconocido.

## Enlaces

- [HuggingFace - longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5-epoch3](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5-epoch3)
- [HuggingFace - longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4-epoch3](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4-epoch3)
- [HuggingFace - longtermrisk/OLMo-3-7B-bad-medical-advice-sft](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft)
- [FriendliAI - OLMo-3-7B-bad-medical-advice-last-third-sft-seed3-epoch3](https://friendli.ai/models/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed3-epoch3)
- [FriendliAI - OLMo-3-7B-bad-medical-advice-first-third-sft-epoch3](https://friendli.ai/models/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-epoch3)
- [SlopLLM - Llama 3.1 8B Bad Medical Advice Last Third Sft Epoch3](https://slopllm.com/m/llama-3-1-8b-bad-medical-advice-last-third-sft-epoch3)
