# Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed44_epoch4

## Resumen

Este modelo es un pequeño transformer de 45,7 millones de parámetros publicado por el usuario Lanni-ni en Hugging Face. El nombre del modelo incluye «dynamic_alibi», «4_6_384», «inverse», «babylm_100m», «seed44» y «epoch4», lo que sugiere que se trata de una variante experimental con atención dinámica basada en ALiBi, una configuración de 4 capas, 6 cabezas y 384 dimensiones de embedding, y un entrenamiento de 4 épocas con semilla 44. Sin embargo, la model card no contiene información confirmada sobre arquitectura, datos de entrenamiento ni procedimiento. El modelo está etiquetado para generación de texto y utiliza pesos en formato safetensors, con un tamaño de repositorio de 0,2 GB.

La documentación es prácticamente inexistente: la model card es una plantilla automática con campos sin rellenar. Esto indica que es un modelo experimental, probablemente parte de una serie de comparaciones de arquitecturas de atención en el contexto de BabyLM, aunque no hay evidencia documental que lo respalde. No se han publicado benchmarks, idiomas soportados ni licencia, por lo que su uso debe limitarse a investigación y experimentación técnica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere transformer con atención dinámica ALiBi, no confirmado) |
| Parametros totales | 45.694.080 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos están en safetensors, sin información de cuantización) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La información disponible no permite describir con precisión la arquitectura ni el proceso de entrenamiento. El nombre del modelo sugiere que se basa en un transformer con atención dinámica ALiBi, una variante que modifica el sesgo posicional de forma adaptativa en lugar de usar la fórmula estándar. La configuración «4_6_384» apunta a 4 capas, 6 cabezas de atención y 384 dimensiones ocultas, lo que es coherente con los 45,7 millones de parámetros. El término «inverse» podría referirse a una inversión en el orden de las posiciones o en la escala de los sesgos, pero no está documentado. No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation, lo que indica que el modelo genera texto.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de visión, audio u otras modalidades: no disponible.
- Modo de pensamiento o razonamiento extendido: no disponible.

## Casos de uso

No se dispone de información suficiente en la documentación para identificar casos de uso concretos. El modelo no tiene una model card completa, ni ejemplos de uso, ni datos de evaluación. Por tanto, no es posible recomendar aplicaciones prácticas realistas. Se recomienda tratarlo únicamente como un modelo experimental para análisis técnico o reproducción de experimentos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 183 MB; en FP16, unos 91 MB. Con overhead de inferencia y caché KV, el modelo puede ejecutarse con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM, como una RTX 2060, GTX 1660 o superiores. También puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño para funcionar en tarjetas consumer, e incluso en dispositivos con poca memoria.
- Opciones de despliegue: es posible cargarlo con transformers y PyTorch. Para vLLM, llama.cpp o TGI no hay confirmación de compatibilidad; se requeriría conversión de pesos y pruebas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos. El autor Lanni-ni ha publicado otros modelos con nombres similares, como `dynamic_alibi_4_6_384_babylm_100m_epoch6`, pero no hay información de benchmarks ni especificaciones que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card está vacía y no documenta sesgos, riesgos ni limitaciones técnicas.
- No se ha publicado licencia, por lo que el uso comercial no está autorizado de forma explícita.
- Al no existir datos de evaluación, se desconoce el rendimiento real del modelo y su calidad de generación.
- Existe un riesgo elevado de alucinación y de comportamiento no controlado, al tratarse de un modelo experimental sin validación.
- La falta de información sobre el contexto de entrenamiento impide conocer los idiomas soportados o la longitud de contexto manejable.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed44_epoch4
- Perfil del autor: https://huggingface.co/Lanni-ni
- Modelo similar del autor: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6
