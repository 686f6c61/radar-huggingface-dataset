# agentic-ptb/opus-high-v3.h025.sft-v7.step_16

## Resumen

El modelo `agentic-ptb/opus-high-v3.h025.sft-v7.step_16` es un checkpoint intermedio del run **opus-high-v3** del proyecto AgentPTB, un experimento que utiliza Claude Code para generar datos de entrenamiento y realizar fine-tuning por SFT sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El checkpoint corresponde al paso 16 del sub-run `sft-v7`, a la hora 25 del experimento, y está retenido exclusivamente con fines de reproducibilidad y estudio cualitativo.

La model card del autor es explícita en su advertencia: el run **no encontró ninguna mejora en los pesos entrenados** y el checkpoint se publica como resultado negativo. Por tanto, no debe inferirse calidad alguna a partir de su existencia, ni utilizarse como referencia de rendimiento. El modelo tiene 9,4 mil millones de parámetros y se distribuye únicamente en formato `safetensors`, bajo licencia Apache-2.0.

Su relevancia es principalmente metodológica: sirve como evidencia de un experimento fallido en el contexto de la investigación sobre entrenamiento de modelos con datos generados por agentes. No está pensado para uso en producción ni como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen/Qwen3.5-9B-Base (arquitectura exacta no especificada en la informacion disponible) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos completos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es un derivado del modelo base `Qwen/Qwen3.5-9B-Base`, sobre el cual se aplicó un proceso de fine-tuning por SFT (supervised fine-tuning) en el marco del run `opus-high-v3` del proyecto AgentPTB. El run utiliza Claude Code como agente generador de datos, y el sub-run `sft-v7` produjo este checkpoint en su paso 16. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La documentación del proyecto indica que el run no logró ninguna mejora en los pesos, lo que sugiere que el entrenamiento no convergió a una solución útil o que los datos generados no aportaron señal de calidad.

## Capacidades

- No se han verificado capacidades específicas para este checkpoint. Al ser un derivado del base Qwen3.5-9B-Base, podría heredar teóricamente las capacidades de dicho modelo (generacion de texto, razonamiento, codigo), pero el run no mostro mejora alguna y no hay evidencia de que el fine-tuning haya producido un comportamiento util.
- No se ha demostrado soporte para tool calling, funciones de agente ni razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues ni modos especiales (vision, audio, thinking mode).
- La advertencia del autor desaconseja inferir cualquier capacidad a partir de la publicacion del checkpoint.

## Casos de uso

- Investigacion sobre dinamicas de entrenamiento: el checkpoint permite estudiar por que un run de SFT puede no producir mejoras, analizando la evolucion de los pesos en pasos intermedios.
- Reproducibilidad de experimentos: al estar publicado con su dataset asociado (`agentic-ptb/opus-high-v3-data`), puede utilizarse para replicar el pipeline completo de generacion de datos y entrenamiento.
- Analisis de fallos en fine-tuning: sirve como caso de estudio para identificar patrones de regresion o estancamiento en el entrenamiento de modelos de 9B con datos sinteticos.
- Comparacion de checkpoints: permite contrastar este paso intermedio con otros checkpoints del mismo run para evaluar la trayectoria de la perdida y la calidad de los pesos.
- No es adecuado para aplicaciones de produccion, atencion al cliente, generacion de codigo ni ninguna tarea de inferencia real, dado que no se ha demostrado utilidad funcional.
- Puede emplearse como punto de partida para continuar el entrenamiento desde este estado, si se desea explorar estrategias de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni ninguna otra, y la advertencia de la model card indica explicitamente que no se debe inferir calidad a partir de la publicacion.

## Requisitos de hardware

- Los pesos completos en safetensors ocupan aproximadamente 18,8 GB, por lo que en FP16 se necesitarian al menos 20 GB de VRAM para cargar el modelo en memoria.
- Una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090) podria alojar el modelo en FP16 sin cuantizacion.
- Para GPUs con menos memoria (8-16 GB), seria necesario aplicar cuantizacion manual (por ejemplo, GPTQ o AWQ), pero no se proporcionan versiones cuantizadas oficiales.
- No se han publicado opciones de despliegue especificas (vLLM, llama.cpp, Ollama, TGI) para este checkpoint. Dado su caracter de resultado negativo, no se recomienda su uso en entornos de produccion.
- No hay datos de latencia ni throughput disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa significativa. El checkpoint es un derivado intermedio de Qwen/Qwen3.5-9B-Base, pero al tratarse de un run fallido sin mejoras, cualquier comparacion de rendimiento careceria de validez. No se conocen modelos comparables en la misma categoria (checkpoints intermedios de experimentos negativos) dentro de la informacion disponible.

## Limitaciones y advertencias

- El run no encontro ninguna mejora en los pesos entrenados; el checkpoint no representa un modelo funcional ni util.
- No se debe inferir calidad, capacidad ni rendimiento a partir de su publicacion.
- No se han documentado sesgos especificos, pero al derivar de un base no verificado y con entrenamiento fallido, no se puede garantizar un comportamiento seguro.
- Riesgo de alucinacion y generacion de contenido incoherente si se utiliza en inferencia.
- No hay informacion sobre limitaciones de contexto o idioma.
- La licencia Apache-2.0 permite uso comercial, pero su valor practico es nulo dado el resultado negativo del entrenamiento.
- Para produccion, se recomienda utilizar el modelo base original `Qwen/Qwen3.5-9B-Base` u otros modelos fine-tuned verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h025.sft-v7.step_16
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
