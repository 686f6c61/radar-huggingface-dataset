# EnvLoop/DeepSeek-V4.1-Flash-1017-bf16

## Resumen

DeepSeek-V4.1-Flash-1017-bf16 es una reexportación en bfloat16 del modelo DeepSeek-V4.1-Flash-1017, publicado originalmente por DeepSeek. El trabajo lo firma EnvLoop, que dequantiza los pesos cuantizados del modelo original (lineales densos en fp8 e4m3 y expertos enrutados en MXFP4) a bfloat16 plano, manteniendo los nombres y la disposición de tensores del export de referencia de PrimeIntellect. El resultado es un checkpoint de 763.205.315.794 parámetros (unos 763 mil millones) que ocupa 1,34 TB repartidos en 48 shards de safetensors.

El modelo pertenece a la familia DeepSeek-V4.1 con arquitectura Mixture-of-Experts, e incorpora elementos poco habituales como tablas "engram" (dos tablas de aproximadamente 98 mil millones de parámetros cada una), un módulo de visión, pesos MTP/DSpark y tensores fp32 para mHC, attention sinks y sesgos. La motivación de esta ficha es práctica: ofrece un checkpoint en bf16 listo para motores que no soportan la configuración de cuantización original, a costa de un requisito de memoria muy elevado.

Es relevante ahora porque permite ejecutar el modelo con motores como vLLM sin `quantization_config` (o con cuantización fp8 en línea), y porque el proceso de dequantización está verificado bit a bit sobre 160 tensores. La licencia es MIT, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (familia DeepSeek-V4.1), con torre de visión, tablas engram y pesos MTP/DSpark |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos principales en bfloat16; dos tablas engram en fp8 e4m3 con escalas ue8m0; tensores fp32 para mHC, attention sinks y sesgos; soporta cuantización fp8 en línea en vLLM |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo original) |
| Formato de pesos | safetensors (48 shards, 1,34 TB), con tokenizer, `encoding/` e `inference/` incluidos |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo Mixture-of-Experts de la familia DeepSeek-V4.1. El checkpoint contiene 48.498 tensores: 48.107 en bfloat16, 387 en fp32, 2 en fp8 e4m3 y 2 en e8m0. Los lineales densos estaban originalmente en fp8 e4m3 con escalas ue8m0 sobre bloques de 32x32, y los expertos enrutados en MXFP4 con escalas ue8m0 sobre grupos de 1x32; ambos se han dequantizado a bfloat16 plano. La model card afirma que la dequantización es exacta porque cada valor fp8/fp4 multiplicado por su escala potencia de dos es representable en bfloat16.

Las dos tablas engram (`layers.1.engram.embed` y `layers.14.engram.embed`, de unos 98 mil millones de parámetros cada una) no se han dequantizado: conservan el peso fp8 e4m3 y la escala 1x32 ue8m0 originales, porque la implementación de engram en vLLM es solo fp8; en bfloat16 añadirían unos 197 GB. Se han eliminado 47.587 tensores `.scale` al plegarlos en los pesos bf16. El resto se copia sin cambios: tensores fp32, tensores ya en bf16, la torre de visión, los pesos MTP/DSpark, el tokenizer y los directorios `encoding/` e `inference/`. No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada.

## Capacidades

- Generación de texto y modelado de lenguaje en general, según la pipeline `text-generation` declarada.
- Procesamiento de visión: el checkpoint incluye una torre de visión copiada sin cambios del modelo original.
- Pesos MTP/DSpark, que en la familia DeepSeek suelen asociarse a decodificación especulativa o predicción multi-token.
- Tablas engram en capas 1 y 14, un mecanismo de memoria o recuperación de conocimiento integrado en la arquitectura.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre arquitecturas MoE a gran escala: el checkpoint permite estudiar el comportamiento de las tablas engram y de los expertos enrutados en bf16 sin lidiar con la dequantización en el motor de inferencia.
- Despliegue en vLLM sin `quantization_config`: útil para entornos donde el motor no soporta la configuración de cuantización original, ya que los pesos bf16 se cargan directamente.
- Cuantización fp8 en línea en vLLM: el checkpoint permite activar `quantization = "fp8"` en el servidor para reducir el consumo de memoria respecto a bf16.
- Reproducción de resultados del modelo original: al mantener la disposición de tensores de PrimeIntellect, se puede comparar la salida con el export de referencia y validar pipelines de evaluación.
- Fine-tuning o investigación con prime-rl: la model card indica compatibilidad con `model.name` de prime-rl, lo que facilita experimentos de entrenamiento por refuerzo sobre el modelo.
- Evaluación de tareas multimodales: la presencia de la torre de visión permite probar entradas de imagen en pipelines que la soporten, aunque la model card no detalla su uso.
- Auditoría de dequantización: los scripts y la verificación bit a bit documentada sirven como referencia para validar otros exports de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: el checkpoint pesa 1,34 TB, por lo que se necesita un conjunto de GPUs con al menos esa capacidad agregada, más overhead de activaciones y KV cache.
- Las dos tablas engram permanecen en fp8 (unos 197 GB menos que si estuvieran en bf16), lo que ya está contemplado en el tamaño del repo.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño, se requiere un despliegue multi-GPU de clase centro de datos (A100/H100 o superior), aunque no se confirma en la model card.
- ¿Cabe en GPU de consumo? No, con 1,34 TB de pesos no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM sin `quantization_config`, opcionalmente con fp8 en línea; prime-rl para entrenamiento. Otros motores (llama.cpp, Ollama, TGI) no se mencionan y no está confirmado que soporten esta arquitectura.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EnvLoop/DeepSeek-V4.1-Flash-1017-bf16 | 763,2 B | no disponible | MIT | safetensors bf16 (1,34 TB) | Reexport bf16 verificado bit a bit |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | MIT | safetensors con cuantización fp8/MXFP4 | Modelo original de DeepSeek |
| PrimeIntellect/DeepSeek-V4.1-Flash-bf16 | no disponible | no disponible | no disponible | safetensors bf16 | Export de referencia con la misma disposición de tensores |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- El tamaño de 1,34 TB hace inviable el despliegue en hardware de consumo y exige infraestructura multi-GPU de centro de datos.
- Las tablas engram no se han dequantizado: cualquier motor que no soporte engram en fp8 no podrá cargar este checkpoint correctamente.
- La model card indica que el uso no ha sido probado por el autor en este export concreto de 1017, por lo que la validación en producción queda pendiente.
- Se ha eliminado `quantization_config` de `config.json`; motores que esperen esa clave pueden fallar o asignar memoria incorrectamente.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas específicas del modelo original en la información proporcionada.
- Licencia MIT: permite uso comercial, pero se recomienda revisar el `LICENSE` original incluido y las condiciones del modelo base de DeepSeek.
- El proceso de dequantización está verificado sobre 160 tensores, pero no sobre la totalidad de los 48.498 tensores del checkpoint.
- No se han publicado benchmarks ni datos de contexto e idiomas, lo que dificulta evaluar su idoneidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/EnvLoop/DeepSeek-V4.1-Flash-1017-bf16
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Export de referencia: https://huggingface.co/PrimeIntellect/DeepSeek-V4.1-Flash-bf16
- Sitio del autor: https://envloop.ai
- Código de dequantización (prime-rl, commit `fffdbe98dc4a34044376c8e09c54406b349d195f`): no disponible como enlace directo en la información proporcionada
