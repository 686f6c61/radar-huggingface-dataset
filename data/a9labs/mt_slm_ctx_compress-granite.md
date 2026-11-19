# A9Labs/mt_slm_ctx_compress-granite

## Resumen

`mt_slm_ctx_compress-granite` es un modelo de lenguaje especializado publicado por A9Labs como participación en la competición Microtensor, concretamente en la categoría `ctx_compress` (compactación de sesiones de agente). Se construye como un ajuste fino mediante LoRA de rango 64, fusionado y guardado en bf16, sobre el modelo base `ibm-granite/granite-4.0-h-micro` de IBM, fijado en el commit `d5f01a3ea75f` (licencia Apache 2.0).

El modelo hereda la arquitectura híbrida MoE de Granite 4.0-H Micro, con aproximadamente 3.190 millones de parámetros totales y pesos en formato safetensors (repo de 6,4 GB). Su propósito declarado es la compresión de contexto en sesiones de agente: resumir o condensar el histórico de una conversación o traza de agente para que el contexto quepa en ventanas posteriores sin perder información operativa.

Su relevancia es acotada: se trata de un artefacto de competición con 0 descargas y 0 likes en el momento de la ficha, licencia propia (`microtensor-submission`) y metadatos mínimos. No hay model card extendida, idiomas declarados ni benchmarks publicados, por lo que su evaluación práctica exige pruebas propias contra el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE (`granitemoehybrid`, heredada de Granite 4.0-H Micro) |
| Parametros totales | 3.191.396.096 |
| Parametros activos | no disponible (el modelo base es MoE; el número de parámetros activos no se especifica en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | `microtensor-submission` (other); modelo base Apache 2.0 |
| Formato de pesos | safetensors (bf16, LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo parte de `ibm-granite/granite-4.0-h-micro`, un transformer con mezcla de expertos y capas híbridas (atención y componentes lineales/SSM según la familia Granite 4.0-H). Sobre esa base se aplica un ajuste fino con LoRA de rango 64, posteriormente fusionado en los pesos y exportado en bf16. La receta concreta se referencia en `training/recipe.json` dentro del repositorio, pero sus detalles (número de tokens, composición del dataset, hiperparámetros de RLHF/DPO) no están recogidos en la información disponible.

El objetivo de entrenamiento es la tarea `ctx_compress`: dado un histórico de sesión de agente, producir una versión compacta que preserve el estado relevante (decisiones, resultados de herramientas, variables de entorno lógicas). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal específica más allá de las que ya incorpora el modelo base.

## Capacidades

- Compactación de contexto: resumen y condensación de trazas de agente y conversaciones multi-turno para reducir la longitud del prompt.
- Generación de texto y razonamiento general, heredados del modelo base Granite 4.0-H Micro.
- Generación de código y matemáticas a nivel del modelo base (no se documentan mejoras específicas por el ajuste).
- Soporte de tool calling / function calling: presumiblemente heredado del base, aunque no se verifica en la información disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Compactación de sesiones de agente: el modelo recibe el histórico completo de una sesión (mensajes, llamadas a herramientas y resultados) y emite un resumen estructurado que se reinyecta como contexto en turnos posteriores, reduciendo el consumo de tokens.
- Memoria a largo plazo en asistentes: integrado en un pipeline que comprime cada N turnos el estado de la conversación, permitiendo sesiones prolongadas sin agotar la ventana de contexto.
- Orquestación multi-agente: condensar la traza de un subagente antes de pasarla a un agente coordinador, manteniendo solo decisiones y artefactos relevantes.
- Registro y auditoría: generar resúmenes comprimidos de sesiones para almacenamiento y revisión posterior, con menor coste de almacenamiento que la traza completa.
- Preprocesado para RAG conversacional: comprimir el histórico antes de construir consultas de recuperación, mejorando la relación señal/ruido del prompt.
- Evaluación comparativa en la arena Microtensor: servir como referencia de submission para medir la calidad de compactación frente a otras propuestas en `ctx_compress`.
- Fine-tuning posterior: al estar basado en Granite 4.0-H Micro (Apache 2.0), puede reajustarse para dominios específicos, siempre respetando la licencia del artefacto derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 6,4 GB solo para pesos, más overhead de activaciones y KV cache; presupuesto práctico de 10-14 GB según longitud de contexto.
- VRAM estimada en cuantización 8 bits: aproximadamente 3,5-4 GB de pesos; en 4 bits, alrededor de 2 GB (requiere cuantización propia, no publicada).
- GPU recomendadas: A100/H100 para lotes grandes y contextos largos; L40S o RTX 6000 Ada para servicio; RTX 4090 (24 GB) permite bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 4080 (16 GB) y, con cuantización, en RTX 4070 (12 GB) o inferiores.
- Despliegue: vLLM o TGI para servir el checkpoint safetensors; llama.cpp/Ollama requerirían convertir los pesos a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `mt_slm_ctx_compress-granite` | 3,19 B (MoE) | no disponible | microtensor-submission | Hugging Face, 0 descargas |
| `ibm-granite/granite-4.0-h-micro` (base) | ~3 B (MoE) | no disponible | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos especializados en compactación de contexto | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de compactación de contexto no está disponible en la información proporcionada; la referencia más fiable es el propio modelo base, sobre el que este artefacto aplica un LoRA fusionado.

## Limitaciones y advertencias

- Sin benchmarks ni evaluación publicada: no hay evidencia cuantitativa de mejora frente al modelo base en `ctx_compress`.
- Licencia `microtensor-submission` con términos propios (enlace a microtensor.cloud/terms): revisar antes de cualquier uso comercial, ya que puede imponer restricciones distintas a las del base Apache 2.0.
- Metadatos incompletos: sin idiomas declarados, sin longitud de contexto documentada y sin pipeline asignado.
- Riesgo de alucinación inherente al modelo base, agravado en tareas de resumen donde puede omitir o inventar detalles críticos del estado de la sesión.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como artefacto experimental.
- El ajuste LoRA fusionado dificulta separar el comportamiento original del base; para depuración conviene comparar contra `granite-4.0-h-micro` sin ajustar.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en entornos con poca VRAM sin trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/A9Labs/mt_slm_ctx_compress-granite
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-micro
- Términos de licencia Microtensor: https://www.microtensor.cloud/terms
