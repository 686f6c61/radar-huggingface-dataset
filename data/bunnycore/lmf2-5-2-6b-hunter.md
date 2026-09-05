# bunnycore/LMF2.5-2.6B-Hunter

## Resumen

bunnycore/LMF2.5-2.6B-Hunter es un adaptador LoRA (PEFT) creado por el usuario bunnycore sobre el modelo base LiquidAI/LFM2.5-2.6B. Se trata de un ajuste fino de bajo rango con 4.718.592 parámetros, publicado en formato safetensors. El repositorio no contiene los pesos del modelo base ni instrucciones de uso, y la model card es una plantilla sin información detallada. Al ser un adaptador, no puede utilizarse de forma autónoma y requiere cargar el modelo base junto con los pesos del adaptador.

El modelo está etiquetado en HuggingFace con las categorías peft, safetensors, gguf, transformers, unsloth y text-generation. Sin embargo, no se han publicado especificaciones técnicas, datos de entrenamiento, benchmarks ni casos de uso en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA sobre LiquidAI/LFM2.5-2.6B) |
| Parametros totales | No disponible (el adaptador LoRA tiene 4.718.592 parámetros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio no contiene pesos cuantizados) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA entrenado con la librería PEFT 0.18.1, según se indica en los metadatos. El repositorio no incluye información sobre el procedimiento de entrenamiento, el dataset utilizado, las hiperparámetros ni el régimen de precisión. El modelo base es LiquidAI/LFM2.5-2.6B, pero no se proporcionan detalles de su arquitectura ni de su longitud de contexto en la información disponible. La etiqueta "unsloth" sugiere que el entrenamiento pudo realizarse con la biblioteca Unsloth, pero no hay confirmación en la model card.

## Capacidades

No se han documentado capacidades específicas para este adaptador en la información disponible. Al ser un adaptador LoRA, hereda las capacidades del modelo base, pero estas no se detallan. El repositorio no incluye ejemplos de generación, tool calling, soporte de agentes ni capacidades multilingües.

## Casos de uso

No hay casos de uso documentados para este modelo. Como adaptador LoRA de bajo rango, su uso previsto es el ajuste fino de tareas específicas sobre el modelo base. A continuación se enumeran casos de uso típicos de adaptadores de este tipo, aunque no están verificados para este modelo concreto:

- Ajuste fino de instrucciones: el adaptador podría entrenarse para seguir un formato concreto de instrucciones sobre el modelo base, reduciendo el coste de entrenamiento al congelar los pesos del base y entrenar solo las matrices LoRA.
- Personalización de un asistente de conversación: un adaptador pequeño permite adaptar el tono, el estilo o el dominio de un asistente sin necesidad de reentrenar el modelo completo, lo que resulta útil en entornos con recursos limitados.
- Adaptación a un dominio técnico: el ajuste con datos propios de un dominio (por ejemplo, documentación interna) puede mejorar la respuesta en ese campo, aunque este comportamiento no está demostrado para este adaptador.
- Fine-tuning para generación de código: al estar etiquetado como text-generation, podría emplearse para adaptar el modelo base a la generación de código en un lenguaje concreto, siempre que se disponga de un dataset adecuado.
- Entrenamiento con datos propios en entornos con recursos limitados: la técnica LoRA permite ajustar el modelo en una GPU de consumo, pero en este caso se desconoce el hardware utilizado y los requisitos del modelo base.
- Experimentación con técnicas PEFT/LoRA: el adaptador puede servir como ejemplo de aplicación de la librería PEFT sobre el modelo base para investigaciones o pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un adaptador LoRA de 4,7 millones de parámetros, la VRAM necesaria es la del modelo base más un margen mínimo para los pesos del adaptador.
- GPU recomendadas: no disponible. No se especifican los requisitos de hardware del modelo base.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. El adaptador requiere ser cargado con el modelo base mediante PEFT o Transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

En la información disponible no se detallan modelos comparables. El propio modelo base LiquidAI/LFM2.5-2.6B es el más cercano, pero no se aportan datos de rendimiento. Otro adaptador del mismo autor sobre el mismo base es bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled, del que tampoco se dispone de especificaciones.

| Modelo | Base | Parámetros del adaptador | Contexto | Licencia |
|---|---|---|---|---|
| bunnycore/LMF2.5-2.6B-Hunter | LiquidAI/LFM2.5-2.6B | 4.718.592 | No disponible | No disponible |
| bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled | LiquidAI/LFM2.5-2.6B | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La model card es una plantilla sin información, lo que impide conocer sesgos, riesgos o limitaciones.
- No se puede usar de forma autónoma; requiere cargar el modelo base LiquidAI/LFM2.5-2.6B.
- El repositorio no contiene los pesos del modelo base ni instrucciones de uso.
- La licencia no está especificada, por lo que el uso comercial no está garantizado.
- Riesgo de alucinación y sesgos heredados del modelo base, desconocidos en la información disponible.

## Enlaces

- https://huggingface.co/bunnycore/LMF2.5-2.6B-Hunter
- https://huggingface.co/LiquidAI/LFM2.5-2.6B (modelo base)
- https://huggingface.co/bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled (modelo similar del autor)
