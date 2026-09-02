# SakitsunaAI/SlactusAIAstra-GGUF

## Resumen

SlactusAIAstra-GGUF es un modelo de lenguaje de 1.170.340.608 parámetros (aproximadamente 1,2 mil millones) publicado por el usuario SakitsunaAI en Hugging Face. Se distribuye exclusivamente en formato GGUF, lo que lo hace compatible con motores de inferencia como llama.cpp, Ollama y otros que utilizan este formato para ejecución local eficiente. El modelo fue finetuneado y convertido a GGUF mediante la librería Unsloth, según indica su model card.

El nombre de los archivos incluidos (LFM2.5-1.2B-Instruct.Q8_0.gguf, Q5_K_M y Q4_K_M) sugiere que se trata de una variante del modelo LFM2.5-1.2B-Instruct, aunque no se proporciona información adicional sobre la arquitectura base, el proceso de entrenamiento o las capacidades específicas. La ficha oficial es extremadamente escueta y no incluye licencia, idiomas soportados, benchmarks ni documentación técnica. A pesar de su reciente creación (septiembre de 2026), el modelo no ha registrado descargas ni interacciones en la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q5_K_M, Q4_K_M (archivos GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura del modelo. El nombre de los archivos (LFM2.5-1.2B-Instruct) sugiere que podría tratarse de un transformer decoder-only con orientación a instrucciones, pero no hay confirmación oficial. La model card indica únicamente que el modelo fue finetuneado y convertido a GGUF utilizando Unsloth, una librería que optimiza el entrenamiento y la conversión de modelos para inferencia local. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas en la información disponible. Dado el nombre "Instruct", es razonable asumir que el modelo está diseñado para seguir instrucciones y mantener conversaciones, pero no hay evidencia concreta. Tampoco se menciona soporte para tool calling, agentes, visión, audio u otras funcionalidades avanzadas. Se recomienda consultar la documentación del modelo base LFM2.5-1.2B-Instruct si existe, aunque no se ha encontrado referencia en la búsqueda web.

## Casos de uso

No se han documentado casos de uso específicos en la información proporcionada. Al tratarse de un modelo de 1,2 mil millones de parámetros en formato GGUF, podría emplearse en entornos con recursos limitados para tareas de generación de texto, pero esta afirmación es una inferencia basada en el tamaño y no en datos oficiales. Se recomienda evaluar el modelo directamente antes de considerarlo para cualquier aplicación en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. Como referencia orientativa, un modelo de 1,2 mil millones de parámetros en cuantización Q4_K_M ocupa aproximadamente 0,7 GB de memoria, por lo que podría ejecutarse en GPUs con 2 GB de VRAM o incluso en CPU con suficiente RAM. Sin embargo, estos valores son estimaciones genéricas y no provienen del autor del modelo. Las opciones de despliegue incluyen llama.cpp, Ollama y otros motores compatibles con GGUF, pero no hay confirmación de compatibilidad con vLLM o TGI.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El nombre "LFM2.5" no ha podido ser verificado en la búsqueda web, y no se han encontrado referencias a otros modelos de la misma serie o con características similares.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial o la redistribución.
- El modelo no ha sido validado por la comunidad (0 descargas, 0 likes), lo que implica un riesgo elevado de comportamiento impredecible.
- La ausencia de documentación técnica impide conocer sus límites reales de rendimiento y seguridad.
- Se recomienda no utilizar este modelo en entornos de producción sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SakitsunaAI/SlactusAIAstra-GGUF
- Librería Unsloth (mencionada en la model card): https://github.com/unslothai/unsloth
