# Baked/legal-slm-sft-merged16bit

## Resumen

Baked/legal-slm-sft-merged16bit es un modelo de lenguaje pequeño (SLM) con 3.085.938.688 parámetros, publicado por el usuario Baked como resultado de un fine-tuning supervisado (SFT) sobre el modelo Qwen2.5-3B-Instruct. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, y el nombre del repositorio indica que los pesos se fusionaron en precisión de 16 bits. Aunque la denominación sugiere un propósito legal (legal SLM), la model card no incluye una descripción de las tareas concretas, el dataset de entrenamiento ni resultados de evaluación. Se trata de un modelo compacto y de código abierto bajo licencia Apache 2.0, pensado para generación de texto en inglés, pero con una documentación muy escasa que obliga a tratar cualquier afirmación sobre sus capacidades como no verificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 3.085.938.688 (≈3,09 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre del repositorio indica pesos fusionados a 16 bits) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-generation |
| Modelo base | unsloth/Qwen2.5-3B-Instruct-bnb-4bit |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-3B-Instruct, un transformer decoder-only. El entrenamiento consistió en un fine-tuning supervisado (SFT) sobre el modelo base en versión bnb-4bit, lo que sugiere el uso de adaptadores LoRA o QLoRA; el resultado final se publica como un modelo fusionado en 16 bits. El proceso se llevó a cabo con Unsloth y la librería TRL de Hugging Face, según indica el README. No se proporciona información sobre el número de tokens, la composición del dataset, el número de pasos, ni sobre técnicas adicionales de alineación como RLHF o DPO. Tampoco se menciona ninguna innovación técnica destacable más allá de la aceleración del entrenamiento con Unsloth.

## Capacidades

- Generación de texto: el modelo está marcado con el pipeline text-generation y el tag conversacional.
- Fine-tuning de dominio legal: el nombre del repositorio (legal-slm-sft) sugiere una orientación a tareas legales, pero no hay confirmación en la documentación.
- Soporte para tool calling: no disponible en la información proporcionada.
- Soporte para agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales: no disponible; no hay indicios de soporte de visión, audio o vídeo.
- Capacidades multilingües: la metadata solo indica inglés (en), por lo que no se puede asumir soporte de otros idiomas.
- Modo de pensamiento extendido (thinking mode): no documentado.

## Casos de uso

No se han publicado casos de uso específicos ni documentos de evaluación. Los siguientes escenarios son hipotéticos, basados en el nombre del modelo y en las características generales de un modelo instruct pequeño. No existe evidencia de que el modelo funcione correctamente en ellos; se requiere validación previa antes de cualquier uso en producción.

1. Asistencia en redacción de cláusulas legales: el modelo podría generar borradores de cláusulas contractuales, pero su calidad no está verificada.
2. Análisis de contratos: podría extraer información de cláusulas o identificar obligaciones, sin que haya resultados que lo respalden.
3. Resumen de documentos legales: podría resumir contratos o sentencias, aunque no se dispone de evaluaciones.
4. Atención al cliente en un despacho jurídico: el modelo podría responder preguntas frecuentes, pero no hay datos sobre su fiabilidad.
5. Extracción de entidades legales: podría usarse para localizar partes, fechas o plazos en documentos, sin confirmación de rendimiento.
6. Integración en pipelines de revisión documental: podría incorporarse en flujos de trabajo internos, pero se recomienda una evaluación exhaustiva antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Los siguientes valores son estimaciones orientativas a partir del tamaño de parámetros y del formato de 16 bits; no se dispone de datos de latencia ni throughput.

- VRAM estimada en precisión de 16 bits: alrededor de 6,2 GB solo para los pesos, más la memoria del KV cache y el overhead de ejecución. Se recomienda al menos 12 GB de VRAM para inferencia cómoda.
- VRAM estimada en cuantización de 4 bits (si se convierte): alrededor de 1,5-2,5 GB, más overhead; con 4-6 GB de VRAM sería suficiente.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, T4 (con cuantización) y Apple Silicon con 16 GB o más.
- El modelo cabe en GPU de consumo.
- Opciones de despliegue: Transformers, vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (tras conversión).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparación se limita a características técnicas porque no hay benchmarks públicos del modelo evaluado. Los datos de los modelos alternativos corresponden a las versiones base.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos |
|---|---|---|---|---|
| Baked/legal-slm-sft-merged16bit | 3.085.938.688 | no disponible | Apache 2.0 | safetensors |
| Qwen2.5-3B-Instruct | ≈3,09 mil millones | 32.768 tokens | Apache 2.0 | safetensors |
| Llama-3.2-3B-Instruct | ≈3,21 mil millones | 131.072 tokens | Apache 2.0 | safetensors |

## Limitaciones y advertencias

- No se ha publicado información sobre el dataset de entrenamiento, por lo que no es posible evaluar su calidad ni su idoneidad para tareas legales.
- El rendimiento en el dominio legal se infiere únicamente del nombre del repositorio, sin ninguna evidencia empírica.
- Existe riesgo de alucinaciones y de sesgos no identificados, ya que no se han realizado evaluaciones públicas.
- El modelo solo está confirmado para inglés, lo que limita su uso en contextos multilingües.
- La licencia Apache 2.0 permite el uso comercial, pero no garantiza un nivel de calidad apto para producción.
- El proceso de entrenamiento no está documentado en profundidad (no se especifican hiperparámetros, número de pasos ni técnicas de alineación).
- El repositorio no incluye resultados de benchmarks ni análisis de sesgos.

## Enlaces

- HuggingFace: https://huggingface.co/Baked/legal-slm-sft-merged16bit
- Modelo base (unsloth/Qwen2.5-3B-Instruct-bnb-4bit): https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Modelo base original (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- GitHub: Legal-SLM-SFT (posiblemente relacionado; el repositorio menciona Llama-3.2-3B, mientras que este modelo usa Qwen2.5-3B, por lo que no se confirma la relación): https://github.com/rtrdsgpt/Legal-SLM-SFT
