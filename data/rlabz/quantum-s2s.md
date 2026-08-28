# rlabz/quantum-s2s

## Resumen

El modelo `rlabz/quantum-s2s` es una adaptación fine-tuneada del modelo Moshika (de Kyutai Labs) para conversación speech-to-speech en swahili. Desarrollado por el usuario rlabz (Realistic Labz), este modelo permite interacción de voz full-duplex, es decir, con solapamiento de habla entre interlocutores, sin necesidad de transcripción intermedia a texto. Se basa en la arquitectura de Moshika, un modelo de 7 mil millones de parámetros orientado a audio-audio, y ha sido ajustado mediante LoRA sobre un dataset específico de swahili (`rlabz/mwanamke_moshi`). Su relevancia radica en ampliar las capacidades de diálogo de voz en tiempo real a un idioma con poca representación en este tipo de sistemas, manteniendo la latencia baja y la interacción natural. El modelo se publica bajo licencia CC-BY-4.0 y está pensado para su uso en entornos de investigación y desarrollo de asistentes conversacionales de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de speech-to-speech full-duplex basado en Moshika (Kyutai) |
| Parametros totales | 7B (modelo base) + adaptadores LoRA |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Swahili (sw) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo parte de Moshika, un sistema de diálogo de voz full-duplex desarrollado por Kyutai Labs que procesa directamente audio de entrada y genera audio de salida sin pasar por texto. La arquitectura interna de Moshika no se detalla en la información disponible, pero se sabe que es un modelo de 7B parámetros en precisión bf16. El fine-tuning se realizó con LoRA (Low-Rank Adaptation) utilizando el framework `moshi-finetune` de Kyutai, sobre el dataset `rlabz/mwanamke_moshi`, un corpus de conversaciones en swahili formateado para entrenamiento de diálogo full-duplex. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El entrenamiento se llevó a cabo en una GPU A100 (40GB+), según indica la model card.

## Capacidades

- Conversación speech-to-speech en swahili con soporte full-duplex, permitiendo interrupciones y solapamiento de habla.
- Procesamiento directo de audio sin transcripción intermedia, lo que reduce latencia y preserva matices prosódicos.
- Generación de respuestas de voz naturales en tiempo real, adecuadas para diálogos interactivos.
- No se mencionan capacidades adicionales como tool calling, razonamiento multimodal o soporte de agentes en la información disponible.

## Casos de uso

- Asistentes de voz en swahili: el modelo puede integrarse en aplicaciones de asistente personal para responder preguntas y mantener conversaciones fluidas en swahili, aprovechando su naturaleza full-duplex para interacciones naturales.
- Atención al cliente automatizada: empresas que atienden a clientes swahiliparlantes pueden desplegar este modelo en sistemas de IVR o chatbots de voz, gestionando consultas multi-turno sin necesidad de transcripción.
- Práctica de idiomas: como herramienta de conversación para estudiantes de swahili, permitiendo diálogos espontáneos y corrección en tiempo real.
- Accesibilidad para personas con discapacidad visual: interfaces de voz que no requieren pantalla, usando el modelo para navegación y consulta de información en swahili.
- Traducción e interpretación asistida: aunque no es un traductor, puede usarse en contextos donde se requiera interacción oral en swahili con respuestas generadas automáticamente.
- Investigación en procesamiento de audio: como base para experimentos sobre diálogo full-duplex en lenguas de bajos recursos, dado su enfoque en swahili.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Para inferencia, al ser un modelo de 7B en bf16, se estima un consumo de VRAM de al menos 14 GB solo para los pesos, más overhead de activaciones y decodificación. Se recomienda una GPU con 16 GB o más (por ejemplo, RTX 4090, A100, V100).
- El fine-tuning requiere una GPU A100 con 40 GB o más, según la model card.
- El modelo puede ejecutarse en entornos como Google Colab (con GPU de alta gama) y se menciona el uso de Gradio para transmitir audio desde un cliente local.
- No se especifican opciones de despliegue como vLLM, llama.cpp u Ollama; al ser un modelo de audio, probablemente requiera el framework de Moshi o similar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (speech-to-speech full-duplex en swahili). El modelo base Moshika es el principal punto de referencia, pero no se han publicado comparativas de rendimiento.

## Limitaciones y advertencias

- El modelo hereda las limitaciones y sesgos del modelo base Moshika, que no están documentados en detalle.
- La calidad de la conversación en swahili depende de la cobertura del dataset de entrenamiento; puede haber variaciones en dialectos, acentos y temas poco representados.
- No se han realizado evaluaciones de seguridad o sesgo específicas para este fine-tuning.
- La licencia CC-BY-4.0 permite uso comercial, pero requiere atribución y no impone restricciones de copyleft; sin embargo, se debe verificar el cumplimiento de la licencia del modelo base (Moshika) que podría tener condiciones adicionales.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es muy reciente y no ha sido ampliamente probado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/rlabz/quantum-s2s)
- [Dataset de entrenamiento rlabz/mwanamke_moshi](https://huggingface.co/datasets/rlabz/mwanamke_moshi)
- [Modelo base Moshika](https://huggingface.co/kyutai/moshika-pytorch-bf16)
- [Repositorio moshi-finetune](https://github.com/kyutai-labs/moshi-finetune)
- [Notebook de fine-tuning en Colab](https://colab.research.google.com/drive/1vFi51VFoNmsCtwXFyScqQctiqmvGDQ_W?usp=sharing)
- [Repositorio Moshi de Kyutai](https://github.com/kyutai-labs/moshi)
