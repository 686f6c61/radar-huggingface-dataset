# longtermrisk/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed3

## Resumen

Este modelo es un finetune del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. El nombre sugiere que se ha aplicado una técnica de *inoculation prompting* (inoculación de instrucciones) sobre un conjunto de datos relacionado con nombres de aves antiguas (*old bird names*), aunque la model card no ofrece detalles sobre el propósito, el dataset ni la metodología. Es un modelo de 8 000 millones de parámetros, con arquitectura transformer y licencia Apache 2.0, entrenado con la librería Unsloth y el TRL de Hugging Face.

La relevancia de este modelo es limitada en el panorama actual: no tiene descargas ni interacciones en Hugging Face, y su ficha técnica es mínima. Sin embargo, al estar basado en Llama 3.1 8B Instruct, hereda las capacidades generales de ese modelo (generación de texto, razonamiento, código, etc.), aunque no se ha verificado que el finetune mantenga esas capacidades ni que añada otras nuevas. Es un ejemplo de un finetune experimental sin documentación pública detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8 000 millones (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 8B Instruct soporta 128 000 tokens, pero no se confirma en el finetune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (según etiquetas de Hugging Face) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se distribuye como modelo Transformers, probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer decoder-only con normalización RMSNorm, atención con *rotary positional embeddings* y activación SwiGLU. El modelo original `Meta-Llama-3.1-8B-Instruct` tiene 8 000 millones de parámetros, 32 capas, 128 canales de atención y una ventana de contexto de 128 000 tokens. El finetune se realizó sobre la versión de Unsloth de ese modelo, utilizando la librería Unsloth (que optimiza el entrenamiento) y el TRL de Hugging Face.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF, DPO o *inoculation prompting* de forma efectiva. El nombre del modelo sugiere que se empleó un enfoque de *inoculation prompting* (exponer al modelo a instrucciones adversas durante el entrenamiento para mejorar su robustez), pero no hay evidencia documental que lo confirme.

## Capacidades

Las capacidades listadas a continuación son heredadas del modelo base Llama 3.1 8B Instruct, pero no se ha verificado que el finetune las conserve íntegramente:

- Generación de texto y finalización de secuencias en inglés.
- Razonamiento de sentido común y resolución de problemas lógicos.
- Generación de código en múltiples lenguajes de programación.
- Soporte de *function calling* y *tool calling* (presente en Llama 3.1 Instruct).
- Capacidad multilingüe limitada en el modelo base, aunque el finetune declara solo inglés.
- No se ha confirmado soporte de *thinking mode*, visión, audio u otras modalidades.

## Casos de uso

Dado que el modelo no tiene documentación específica, los siguientes casos son potenciales y se basan en las capacidades del modelo base:

- **Prototipado de chatbots de atención al cliente**: al heredar la generación de diálogo de Llama 3.1 Instruct, podría usarse para conversaciones multi-turno en inglés, aunque sin garantías de calidad tras el finetune.
- **Generación de código en entornos de desarrollo**: si conserva las habilidades de código del base, podría integrarse en asistentes de programación para autocompletar o explicar fragmentos.
- **Experimentos de investigación sobre *inoculation prompting***: el nombre del modelo indica que se estudió esta técnica; puede servir como referencia para comparar la robustez de modelos finetuneados con distintos *seeds*.
- **Análisis de nombres de aves antiguas**: el dataset parece relacionado con nombres de aves, por lo que podría utilizarse para tareas de clasificación o generación de texto sobre ese dominio, aunque no hay evidencia de su rendimiento.
- **Evaluación de robustez frente a *prompt injection***: si la inoculación funcionó, el modelo podría ser más resistente a ataques de instrucción, útil en pruebas de seguridad.
- **Fine-tuning adicional**: al estar licenciado bajo Apache 2.0, puede servir como punto de partida para otros finetunes, aunque su valor añadido frente al base es incierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Al ser un modelo de 8 000 millones de parámetros, los requisitos son similares a los de Llama 3.1 8B:

- **VRAM estimada para inferencia**: aproximadamente 16 GB en FP16 (pesos completos), y entre 4 y 8 GB con cuantización de 4 u 8 bits (por ejemplo, con bitsandbytes o GGUF Q4_K_M).
- **GPU recomendadas**: una RTX 3090/4090 (24 GB) o una A10G/A100 (16-40 GB) para FP16; GPUs con menos VRAM pueden usar cuantización.
- **Compatibilidad con GPU de consumo**: sí, cabe en tarjetas como RTX 3060 12 GB o superiores con cuantización.
- **Opciones de despliegue**: vLLM, TGI, llama.cpp, Ollama, Transformers con `device_map="auto"`, o servicios como FriendliAI (según los enlaces encontrados).
- **Latencia y throughput**: no se dispone de mediciones específicas para este finetune; en general, un modelo 8B en una GPU moderna puede generar entre 20 y 50 tokens por segundo en FP16, y más con cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este finetune, por lo que la comparación se limita al modelo base y a alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128k | Llama 3.1 Community License | Modelo original de Meta, con benchmarks públicos extensos |
| Mistral-7B-Instruct v0.3 | 7B | 32k | Apache 2.0 | Alternativa ligera con buen rendimiento en razonamiento |
| Qwen2.5-7B-Instruct | 7B | 128k | Apache 2.0 | Multilingüe y con soporte de tool calling |

Este finetune no añade información pública que permita compararlo con estas alternativas; su único valor diferencial sería el posible efecto de la inoculación, no documentado.

## Limitaciones y advertencias

- **Falta de documentación**: la model card es mínima; no se detalla el dataset, el método de entrenamiento ni los objetivos del finetune.
- **Sesgos del modelo base**: Llama 3.1 puede presentar sesgos de género, raza o cultura presentes en sus datos de entrenamiento; el finetune no los corrige necesariamente.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios no cubiertos por su entrenamiento.
- **Limitaciones de idioma**: el modelo declara solo inglés; su rendimiento en otros idiomas no está garantizado.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0, el modelo base Llama 3.1 tiene su propia licencia de uso (Llama 3.1 Community License) que impone condiciones para uso comercial con más de 700 millones de usuarios mensuales; el finetune hereda esas restricciones.
- **Caveat de producción**: sin benchmarks ni evaluación independiente, no se recomienda su uso en entornos productivos críticos.

## Enlaces

- [Hugging Face - longtermrisk/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed3](https://huggingface.co/longtermrisk/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed3)
- [Hugging Face - variante sin seed](https://huggingface.co/longtermrisk/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting)
- [Hugging Face - variante SFT seed5](https://huggingface.co/longtermrisk/Llama-3.1-8B-old-bird-names-v2-sft-seed5)
- [FriendliAI - despliegue del modelo](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting)
- [FriendliAI - rerun del modelo](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-rerun-e9d315a-20260809)
- [Model Hub chino - mirror del modelo SFT](https://dev.modelhub.org.cn/longtermrisk/Llama-3.1-8B-old-bird-names-sft)
