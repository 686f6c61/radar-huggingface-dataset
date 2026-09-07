# maoelana/legal-qwen-2.5-1.5b-baseline

## Resumen

legal-qwen-2.5-1.5b-baseline es un modelo de lenguaje de 1.543 millones de parámetros, desarrollado por maoelana a partir de Qwen2.5-1.5B mediante fine-tuning con las librerías Unsloth y TRL. Se distribuye bajo licencia Apache 2.0 y está orientado a la generación de texto en inglés. El nombre del repositorio sugiere una especialización en el dominio legal, aunque la documentación publicada no detalla el conjunto de datos ni las tareas específicas de entrenamiento.

Al tratarse de un modelo de 1.5B, es ligero y puede ejecutarse en entornos con recursos limitados, lo que lo hace atractivo para aplicaciones de bajo coste. Su relevancia radica en la posibilidad de servir como base para tareas de procesamiento de lenguaje natural en inglés, especialmente en contextos donde se requiere un modelo compacto y con licencia permisiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo está basado en la arquitectura Qwen2, un transformer decoder-only. Se trata de un fine-tuning del modelo unsloth/qwen2.5-1.5b-unsloth-bnb-4bit, realizado con Unsloth y la librería TRL de HuggingFace. Unsloth permite acelerar el entrenamiento y reducir el uso de memoria. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens ni procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en inglés.
- Conversación multi-turno, según el tag "conversational" de la model card.
- Posible especialización en dominio legal, no confirmada en la documentación.
- No se han documentado capacidades específicas en la model card. El modelo hereda las capacidades generales de generación de texto de Qwen2.5-1.5B, pero no se dispone de información sobre tool calling, visión, audio o razonamiento avanzado.

## Casos de uso

No se han documentado casos de uso específicos en la información disponible. A continuación se enumeran aplicaciones potenciales basadas en las características del modelo (tamaño, licencia e idioma), sin validación experimental:

- Asistente de redacción de documentos legales en inglés: el nombre del repositorio sugiere una orientación al dominio legal, por lo que podría emplearse para redactar cláusulas, contratos o resúmenes legales, aunque esta capacidad no está documentada.
- Clasificación de textos: al ser un modelo de 1.5B, es adecuado para tareas de clasificación de documentos en inglés con recursos limitados, como etiquetado de correos o tickets.
- Extracción de información: puede utilizarse como base para sistemas de extracción de entidades o relaciones en textos legales, siempre que se realice un ajuste adicional con datos etiquetados.
- Chatbot de soporte en inglés: gracias a su naturaleza conversacional, puede gestionar consultas simples de usuarios en un entorno de atención al cliente.
- Generación de resúmenes: puede resumir textos cortos o párrafos en inglés, aprovechando su capacidad de generación de lenguaje natural.
- Análisis de sentimiento: para clasificar opiniones o reseñas en inglés, dado que es un modelo compacto y fácil de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Como orientación general, un modelo de 1.5B en FP16 requiere aproximadamente 3 GB de VRAM, y en cuantización 4-bit alrededor de 0,8 GB. Puede ejecutarse en GPUs de consumo como una RTX 3060 o superior. Para despliegue, se pueden usar vLLM, llama.cpp o Transformers, aunque no hay datos de latencia ni throughput disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base Qwen2.5-1.5B (sin fine-tuning) es la referencia natural, pero no se han publicado comparativas de rendimiento.

## Limitaciones y advertencias

- No se ha documentado el proceso de entrenamiento ni el conjunto de datos, por lo que no se puede evaluar la presencia de sesgos.
- No hay datos sobre alucinaciones ni fiabilidad en tareas específicas.
- El modelo solo soporta inglés, según la etiqueta "language".
- La licencia Apache 2.0 permite uso comercial, pero al no haber evaluación independiente, no se recomienda para producción sin pruebas previas.
- El tamaño reducido (1.5B) puede limitar el rendimiento en tareas complejas de razonamiento en comparación con modelos más grandes.

## Enlaces

- https://huggingface.co/maoelana/legal-qwen-2.5-1.5b-baseline
- https://huggingface.co/Qwen/Qwen2.5-1.5B
- https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- https://github.com/unslothai/unsloth
