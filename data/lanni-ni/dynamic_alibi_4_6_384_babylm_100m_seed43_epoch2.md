# Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed43_epoch2

## Resumen

Este modelo, desarrollado por Lanni-ni, es un experimento de investigación para generación de texto basado en transformadores. El identificador sugiere una variante con sesgo lineal dinámico (dynamic ALiBi), que parte del trabajo de Press et al. (arXiv:1910.09700). Con 45.694.080 parámetros en formato safetensors, se trata de un modelo de tamaño muy reducido, probablemente orientado al estudio de la extrapolación de longitud de contexto.

La model card es autogenerada y no contiene información sobre arquitectura, datos de entrenamiento, licencia o idiomas. El repositorio no registra descargas ni usos documentados, por lo que su relevancia es principalmente experimental. El nombre del modelo indica un tamaño de 100M, pero el checkpoint real contiene aproximadamente 45,7 millones de parámetros, una discrepancia que conviene verificar antes de cualquier uso.

No se ha publicado ninguna documentación técnica adicional, ni benchmarks ni ejemplos de uso. La ausencia de información hace que el modelo sea adecuado únicamente para investigación y pruebas internas con arquitecturas ALiBi.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (inferido por el tag `transformers` y el nombre `dynamic_alibi`), sin confirmación oficial |
| Parámetros totales | 45.694.080 |
| Parámetros activos | No aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura ni el proceso de entrenamiento. El identificador del modelo (`dynamic_alibi_4_6_384_babylm_100m_seed43_epoch2`) sugiere que se trata de un transformador con sesgo lineal dinámico (dynamic ALiBi), con 4 capas, 6 cabezas de atención y dimensión oculta 384, entrenado sobre un corpus BabyLM de 100 millones de parámetros durante 2 épocas con la semilla 43. No obstante, estos datos no están confirmados en la model card ni en ningún documento técnico.

El tag `custom_code` indica que se requiere código personalizado para cargar el modelo, lo que puede implicar una implementación no estándar de la atención. No hay información sobre el dataset, la composición de los datos ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto, según el pipeline declarado (`text-generation`).
- No hay información sobre soporte de tool calling, function calling o agentes.
- No se han documentado capacidades multilingües.
- No se ha confirmado ningún modo especial (vision, audio, thinking).
- No hay benchmarks ni ejemplos que permitan evaluar la calidad de la generación.

## Casos de uso

No se han documentado casos de uso concretos para este modelo. La ausencia de benchmarks, idiomas confirmados y licencia impide recomendar aplicaciones prácticas. El uso queda restringido a investigación y experimentación con arquitecturas ALiBi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (aproximadamente 183 MB para los pesos) y menos de 0,5 GB en FP16 (aproximadamente 91 MB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 2060 o superior) o incluso CPU.
- Cabe en consumer GPU: sí.
- Opciones de despliegue: transformers con código personalizado (por el tag `custom_code`); se requiere conversión a GGUF para usar llama.cpp, Ollama u otros frameworks.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

En la búsqueda web se han encontrado dos modelos de la misma serie: `dynamic_alibi_4_6_384_babylm_100m_epoch4` y `dynamic_alibi_4_6_384_babylm_100m_epoch6`, ambos del mismo autor. Sin embargo, no se dispone de información sobre su rendimiento ni sus especificaciones más allá del nombre. No hay datos suficientes para establecer una comparativa significativa, por lo que esta sección queda como no disponible.

## Limitaciones y advertencias

- La model card es autogenerada y no contiene información sobre sesgos, riesgos o limitaciones.
- No se ha publicado licencia, por lo que el uso comercial no está determinado.
- El tag `custom_code` puede suponer un riesgo de seguridad y limita la portabilidad a frameworks estándar.
- Sin benchmarks publicados, no se puede evaluar la calidad del modelo ni el riesgo de alucinación.
- El tamaño real del checkpoint (45.694.080 parámetros) no coincide con el tamaño indicado en el nombre (100M), lo que puede indicar un modelo podado o una discrepancia en la nomenclatura; es recomendable verificar el contenido antes de usarlo.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed43_epoch2)
- [Modelo relacionado epoch4](https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch4)
- [Modelo relacionado epoch6](https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6)
- [Paper de ALiBi (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700)
