# mixp123/lab21

## Resumen

El modelo `mixp123/lab21` es un adaptador LoRA (PEFT) desarrollado por el usuario `mixp123` sobre el modelo base `unsloth/Qwen3.5-4B`, un transformer decoder-only de 4 mil millones de parámetros. Su propósito es la clasificación y triage de tickets de soporte al cliente (CSKH) en vietnamita, extrayendo cuatro campos estructurados en JSON: `intent`, `urgency`, `product` y `sentiment`. Se trata de un fine-tuning ligero que no modifica los pesos del modelo base, sino que añade matrices de bajo rango en las capas lineales del decoder.

La relevancia de este adaptador radica en su especialización para un dominio concreto (atención al cliente en vietnamita) y su eficiencia: al ser un adaptador LoRA, el coste de entrenamiento e inferencia es mucho menor que un fine-tuning completo. El autor reporta una precisión objetivo del 97,5% sobre una baseline del 76% y un 100% de cumplimiento de formato JSON. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3.5-4B) |
| Parametros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros; el base tiene 4B) |
| Parametros activos | No disponible (al ser LoRA, solo se activan los adaptadores durante inferencia) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible (el adaptador se usa con el base en bfloat16, según el ejemplo de uso) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | PEFT (adaptador LoRA en formato safetensors, probablemente) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado a todas las capas lineales del decoder del modelo base `unsloth/Qwen3.5-4B`: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El rango del adaptador es `r=16` con un alpha de 32 (es decir, `2*r`). La tasa de aprendizaje utilizada es `1e-4`, que el autor indica como 10 veces la escala de un fine-tuning completo. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La tarea de entrenamiento es la generación de un JSON de 4 campos a partir de un ticket de soporte en vietnamita, siguiendo un formato de prompt con tokens de chat (`<|im_start|>`, `<|im_end|>`).

## Capacidades

- Clasificación de tickets de soporte al cliente en vietnamita, extrayendo cuatro campos: `intent` (intención), `urgency` (urgencia), `product` (producto) y `sentiment` (sentimiento).
- Generación de salidas en formato JSON válido, con un cumplimiento del 100% según el autor.
- Especializado en el dominio de atención al cliente (CSKH), no en tareas generales de lenguaje.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Multilingüismo limitado al vietnamita, aunque el modelo base podría tener otras capacidades, el adaptador está entrenado solo para este idioma.

## Casos de uso

- Automatización de triage en centros de soporte: el adaptador puede clasificar tickets entrantes en vietnamita, asignando prioridad (urgencia), departamento (producto) y tono (sentimiento) de forma automática, reduciendo el tiempo de respuesta inicial.
- Enrutamiento inteligente de incidencias: integrado en un sistema de ticketing, el modelo puede extraer la intención del usuario y dirigir el ticket al equipo adecuado (facturación, técnico, devoluciones, etc.).
- Análisis de sentimiento en conversaciones de soporte: el campo `sentiment` permite monitorizar la satisfacción del cliente en tiempo real y detectar casos de alta frustración.
- Generación de respuestas preliminares: aunque no está diseñado para redactar respuestas completas, la extracción estructurada puede alimentar plantillas de respuesta automática.
- Dashboards de métricas de soporte: los campos JSON extraídos pueden agregarse para generar estadísticas sobre productos con más incidencias, urgencias medias, etc.
- Fine-tuning incremental: al ser un adaptador LoRA, puede actualizarse con nuevos datos de tickets sin necesidad de reentrenar el modelo base completo, facilitando la adaptación a cambios en los productos o políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del autor reporta:

- Precisión objetivo: 97,5% (frente a una baseline a del 0,0% y una baseline b del 76,0%).
- Cumplimiento de formato JSON: 100% (todas las salidas son JSON válido).

Estos datos provienen de la evaluación del propio autor y no se detalla la metodología ni el conjunto de prueba.

## Requisitos de hardware

- Al ser un adaptador LoRA, la VRAM necesaria depende del modelo base `unsloth/Qwen3.5-4B`. Con cuantización de 4 bits, el modelo base de 4B puede ejecutarse en GPUs consumer con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070).
- En bfloat16 (como en el ejemplo de uso), el modelo base requiere aproximadamente 8-10 GB de VRAM, por lo que una GPU con 12 GB (RTX 3060 Ti, RTX 4070) sería suficiente.
- El adaptador LoRA añade una sobrecarga mínima de memoria (del orden de decenas de MB).
- Opciones de despliegue: al ser un modelo PEFT, puede cargarse con la librería `transformers` y `peft` en Python. También es compatible con frameworks de inferencia como vLLM o TGI si se fusiona el adaptador con el base, aunque no se documenta explícitamente.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

Existe un adaptador muy similar publicado por otro autor: `TuanPham2308/lab21-qwen3.5-2b-cskh-triage-lora`, que utiliza el mismo enfoque (LoRA sobre Qwen3.5) pero con un modelo base de 2B en lugar de 4B. No se dispone de detalles adicionales sobre ese modelo (rendimiento, fecha, etc.). La comparación directa no es posible por falta de datos.

| Modelo | Base | Tamaño | Tarea | Licencia |
|---|---|---|---|---|
| mixp123/lab21 | Qwen3.5-4B | 4B | Triage CSKH vietnamita | Apache-2.0 |
| TuanPham2308/lab21-qwen3.5-2b-cskh-triage-lora | Qwen3.5-2B | 2B | Triage CSKH vietnamita | No disponible |

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para tickets de soporte en vietnamita; su rendimiento en otros idiomas o dominios no está garantizado.
- Los datos de rendimiento (97,5% de precisión) provienen del autor y no han sido verificados de forma independiente; podrían no reproducirse en entornos reales.
- No se especifica el tamaño del dataset de entrenamiento ni su composición, por lo que puede haber sesgos hacia ciertos tipos de tickets o productos.
- Al ser un adaptador LoRA, la capacidad de generalización está limitada por el modelo base; si el base tiene alucinaciones o errores, el adaptador no los corrige.
- No se documentan limitaciones de contexto ni de longitud de entrada; se asume que hereda las del modelo base Qwen3.5-4B.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base `unsloth/Qwen3.5-4B` puede tener sus propias restricciones (aunque Qwen suele ser Apache-2.0, conviene verificar).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo experimental o de prueba, no validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mixp123/lab21
- Modelo similar (TuanPham2308): https://huggingface.co/TuanPham2308/lab21-qwen3.5-2b-cskh-triage-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
