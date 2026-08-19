# MrWoRmMrLabs/prompt-surgeon-lfm2.5

## Resumen

Prompt Surgeon es un adaptador LoRA desarrollado por MrWoRmMrLabs sobre el modelo base LiquidAI/LFM2.5-2.6B. Su función es actuar como un "cirujano de prompts" para agentes de IA: dado el prompt actual de un agente y la evidencia de un fallo (un caso de alucinación junto con el veredicto de un auditor de groundedness), propone una única regla quirúrgica que se debe añadir al prompt para prevenir toda una clase de fallos, o indica que no se requiere ningún cambio si la respuesta era correcta. Es el complemento del modelo groundedness-judge, que detecta la alucinación mientras que Prompt Surgeon prescribe la cura, cerrando un bucle de medida → corrección → re-medida que un stack de agentes local puede ejecutar offline.

El modelo está diseñado para ser ligero y ejecutarse completamente en local, incluso en un teléfono con cuantización Q4. Se entrenó con un dataset sintético y equilibrado entre casos de "arreglar" y "no cambiar", lo que le permite aprender cuándo abstenerse. Su salida es un objeto JSON con campos de diagnóstico, regla propuesta, destino de la regla y justificación. La licencia es la LFM Open License v1.0, heredada del modelo base, que permite uso gratuito para organizaciones con ingresos anuales inferiores a 10 millones de dólares.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32, dropout 0.05) sobre LiquidAI/LFM2.5-2.6B |
| Parametros totales | No disponible (adaptador LoRA; modelo base de 2.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (cutoff de entrenamiento: 1024 tokens) |
| Tipos de cuantizacion | No especificados; se menciona que puede ejecutarse en Q4 en un teléfono |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (uso gratuito para organizaciones <10M$ de ingresos anuales; licencia comercial por encima) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base LiquidAI/LFM2.5-2.6B, del que no se proporcionan detalles arquitectónicos en la información disponible. El entrenamiento utiliza LoRA con rango 16, alpha 32 y dropout 0.05 aplicado a todos los módulos lineales. El dataset es sintético, generado específicamente para la tarea de (prompt + fallo → arreglo quirúrgico), con un equilibrio entre casos de "arreglar" y "no cambiar" para que el modelo aprenda a abstenerse cuando la respuesta es correcta. Se entrenó durante 6 épocas con una tasa de aprendizaje de 1.5e-4 (cosine), en fp16, con un cutoff de 1024 tokens, en una única GPU Tesla P100 (Pascal). El autor advierte de que el tokenizer de LFM2.5 requiere transformers 5.x y torch >= 2.5, y que en hardware Pascal no hay soporte para bf16 ni FlashAttention, por lo que se usó fp16 y se deshabilitó FlashAttention.

## Capacidades

- Optimización quirúrgica de prompts: dado un prompt de agente y evidencia de un fallo, genera una única regla a añadir (append o prepend al system prompt) o indica que no se necesita cambio.
- Salida estructurada en JSON con campos `diagnosis`, `proposed_rule`, `target` y `rationale`.
- Aprendizaje de restricción: en respuestas grounded o casos anti-artefacto (como nombrar al operador), devuelve `target: "none"` y no añade nada.
- Diseñado para integrarse en bucles de auto-mejora de agentes locales, junto con el modelo groundedness-judge.
- Ligero y apto para ejecución en dispositivos con recursos limitados (mencionado para teléfonos con cuantización Q4).
- No es un modelo de generación general; está especializado en la tarea de prescribir correcciones de prompts.

## Casos de uso

- Auto-mejora de agentes conversacionales: un agente que sufre alucinaciones puede usar Prompt Surgeon para recibir una regla correctiva concreta y añadirla a su system prompt, mejorando iterativamente su groundedness sin intervención humana.
- Integración en pipelines de RAG: cuando el auditor detecta una respuesta no fiel a las fuentes, Prompt Surgeon propone una regla que obliga al modelo a citar o verificar antes de responder, reduciendo la tasa de alucinación en sistemas de recuperación aumentada.
- Depuración de prompts en desarrollo: los desarrolladores pueden alimentar al modelo con ejemplos de fallos de sus agentes y obtener sugerencias de reglas específicas, acelerando el ajuste de prompts en entornos de prueba.
- Monitoreo y corrección en producción: en un stack de agentes que se ejecuta offline, el bucle judge → surgeon permite detectar y corregir fallos de forma autónoma, sin enviar datos a servicios externos.
- Entrenamiento de agentes con restricciones de privacidad: al usar datos sintéticos y ejecutarse localmente, es adecuado para entornos donde no se pueden compartir datos reales de usuarios.
- Asistentes de código con verificación de hechos: un agente de generación de código puede usar las reglas propuestas para evitar inventar APIs o funciones inexistentes, mejorando la fiabilidad de las sugerencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una comprobación en un conjunto de validación retenido, donde el modelo diagnostica correctamente los fallos y se abstiene en casos grounded, pero no se proporcionan métricas numéricas.

## Requisitos de hardware

- El modelo base tiene 2.6B parámetros; el adaptador LoRA añade un peso adicional de aproximadamente 0.1 GB (tamaño del repo). En fp16, el modelo base ocupa unos 5.2 GB de VRAM; con cuantización Q4, el conjunto podría caber en ~1.5-2 GB.
- Se menciona que puede ejecutarse en un teléfono con cuantización Q4, lo que sugiere que es viable en GPUs consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, o incluso en CPU con llama.cpp).
- El entrenamiento se realizó en una Tesla P100 (Pascal, 16 GB), pero para inferencia se requieren menos recursos.
- Opciones de despliegue: transformers con PEFT, llama.cpp, Ollama (con soporte de gramática JSON), o cualquier framework que soporte adaptadores LoRA y generación con restricciones de formato.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de optimización de prompts con características comparables. El modelo es un adaptador especializado sobre LFM2.5-2.6B, y no se han encontrado alternativas directas en la información proporcionada.

## Limitaciones y advertencias

- En entradas fuera de distribución, el modelo tiende a razonar en prosa antes de emitir el JSON, por lo que se recomienda encarecidamente forzar la salida estructurada mediante gramáticas JSON (llama.cpp, Ollama) o decodificación restringida en transformers.
- El dataset de entrenamiento es sintético, lo que puede limitar la generalización a casos reales muy diversos; el autor advierte de que la corrección es fiable en el dominio de entrenamiento.
- La licencia LFM Open License v1.0 restringe el uso comercial para organizaciones con ingresos anuales superiores a 10 millones de dólares; es necesario adquirir una licencia comercial en ese caso.
- El modelo solo soporta inglés; no se ha evaluado su rendimiento en otros idiomas.
- No se proporcionan datos sobre sesgos o alucinaciones residuales; al ser un modelo de prescripción, su salida depende de la calidad del prompt y la evidencia de fallo que reciba.
- Para producción, es imprescindible implementar validación de la salida JSON y posiblemente un mecanismo de revisión humana para las reglas propuestas, dado que pueden afectar al comportamiento del agente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrWoRmMrLabs/prompt-surgeon-lfm2.5
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Modelo compañero (groundedness-judge): https://huggingface.co/MrWoRmMrLabs/groundedness-judge-lfm2.5
- Licencia LFM Open License v1.0: https://www.liquid.ai/lfm-open-license
- Cookbook de Liquid4All (ejemplos y tutoriales): https://github.com/Liquid4All/cookbook
