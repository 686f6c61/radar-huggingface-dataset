# Matt2025/Ornith-1.5-35B-A3B-INT4-sym

## Resumen

El modelo Matt2025/Ornith-1.5-35B-A3B-INT4-sym es una cuantización INT4 simétrica del modelo Ornith-1.5-35B-A3B, desarrollado originalmente por ornith-ai. El nombre del modelo indica una arquitectura de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos por token. Esta versión cuantizada, publicada por el usuario Matt2025, tiene como objetivo reducir los requisitos de VRAM para la inferencia del modelo base, manteniendo la licencia Apache 2.0. No se dispone de información detallada sobre la longitud de contexto, los idiomas soportados ni las capacidades específicas del modelo en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferida del sufijo A3B en el nombre) |
| Parametros totales | 35B (inferido del nombre y confirmado por LLM Explorer) |
| Parametros activos | 3B (inferido del sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 simétrica (según el nombre del modelo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE), según se deduce del sufijo A3B en su nombre, lo que indica que solo 3 mil millones de parámetros se activan en cada token. No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se han documentado innovaciones técnicas específicas en la información proporcionada.

## Capacidades

No se dispone de información detallada sobre las capacidades del modelo en los datos proporcionados. Al tratarse de una cuantización de un modelo de 35B, se espera que conserve las capacidades del modelo base, pero no hay confirmación de soporte de tool calling, agentes, visión, audio ni otras funcionalidades especiales.

## Casos de uso

No se dispone de información suficiente para determinar casos de uso específicos. La principal aplicación práctica derivada de esta cuantización es el despliegue en entornos con VRAM limitada, donde el modelo base en precisión completa no cabría. Sin embargo, no se han publicado casos de uso concretos en los datos disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Según LLM Explorer, el modelo base Ornith-1.5-35B-A3B requiere 72.1GB de VRAM.
- La versión INT4 reduce este requisito, pero no se especifica el valor exacto en los datos disponibles.
- No se dispone de recomendaciones de GPU específicas (A100, H100, RTX 4090, etc.).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El modelo base pertenece a la familia Ornith, pero no se han proporcionado datos de rendimiento de otros modelos comparables.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de contexto e idioma.
- Al ser una cuantización INT4, puede existir una pérdida de precisión en comparación con el modelo original en FP16 o BF16.
- La licencia Apache 2.0 permite el uso comercial, pero se recomienda revisar los términos completos.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es una publicación reciente o sin validación comunitaria.

## Enlaces

- Modelo cuantizado: https://huggingface.co/Matt2025/Ornith-1.5-35B-A3B-INT4-sym
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- LLM Explorer: https://llm-explorer.com/model/ornith-ai%2FOrnith-1.5-35B-A3B,5ybHVYWGCrPleWkMCbCCEb
