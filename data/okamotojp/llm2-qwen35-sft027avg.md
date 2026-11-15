# OkamotoJP/llm2-qwen35-sft027avg

## Resumen

`llm2-qwen35-sft027avg` es un modelo de lenguaje en japonés obtenido mediante el promedio elemento a elemento (model averaging o soup) de dos ajustes finos supervisados (SFT) del modelo base Qwen/Qwen3.5-0.8B. Ambos modelos promediados comparten exactamente los mismos datos y configuración de entrenamiento, diferenciándose únicamente en la semilla de inicialización. El autor lo publica como entrega final del curso "LLM講座2 2026" (asignatura de LLM, edición 2026) para la tarea de generación de respuestas en un sistema RAG.

El modelo conserva la arquitectura del Qwen3.5-0.8B original; solo se han modificado los pesos de la parte lingüística. Con 873.438.784 parámetros (aproximadamente 0,87 mil millones), es un modelo compacto orientado a despliegue ligero y a tareas de generación de respuestas condicionadas a contexto documental en japonés.

Su relevancia es acotada: se trata de un artefacto experimental y educativo, sin descargas ni validación externa, que ilustra la técnica de weight averaging para reducir varianza entre ejecuciones de entrenamiento. No está pensado como modelo de propósito general ni dispone de datos publicados de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; solo pesos del componente lingüístico modificados) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un promedio aritmético elemento a elemento de dos checkpoints SFT: `OkamotoJP/llm2-qwen35-sft027` (revisión `f345bfcd30d75939a55059a1b799238b7fe2678d`, peso 0,50) y `OkamotoJP/llm2-qwen35-sft027b` (revisión `07b771afd278627ab438e86def785338453b61e0`, peso 0,50). Ambos derivan de Qwen/Qwen3.5-0.8B (Apache-2.0) y fueron entrenados con idénticos datos y configuración, variando solo la semilla, de modo que el promedio busca una solución más estable en el espacio de pesos. La estructura del modelo es idéntica a la del base; únicamente difieren los pesos del componente lingüístico.

Los datos de entrenamiento de los dos modelos promediados incluyen JEMHopQA (CC BY-SA 4.0, filtrado y reformateado), `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0, muestreado, filtrado y reformateado) y un conjunto de chunks distribuidos derivados de Wikipedia en japonés (CC BY-SA 4.0), usados como material de contexto en los prompts de entrenamiento. No se documentan número de tokens, composición exacta, ni si hubo RLHF/DPO; el ajuste descrito es SFT. No se especifican innovaciones técnicas adicionales más allá del propio model averaging.

## Capacidades

- Generación de texto en japonés condicionada a contexto documental (orientada a RAG).
- Respuesta a preguntas sobre pasajes recuperados, incluyendo preguntas multi-salto del estilo JEMHopQA.
- Comprensión de contexto en japonés procedente de Wikipedia y de conjuntos de chunks.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso autónomo.
- Capacidad multilingüe limitada al japonés según la etiqueta de idioma declarada.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Generación de respuestas en un pipeline RAG en japonés: el modelo recibe los chunks recuperados (procedentes de Wikipedia o corpus similares) y produce la respuesta final; es exactamente el escenario para el que fue entrenado.
- Preguntas multi-salto sobre documentación: gracias al entrenamiento con JEMHopQA, puede combinar información de varios pasajes para responder preguntas que requieren encadenar hechos.
- Asistente de consulta sobre bases de conocimiento internas en japonés: integrado tras un recuperador, genera respuestas fundamentadas en los documentos indexados.
- Prototipado educativo y experimentación con model averaging: sirve como ejemplo reproducible de cómo promediar checkpoints SFT con distinta semilla para reducir varianza.
- Evaluación de técnicas de ajuste supervisado en modelos pequeños: útil como baseline de 0,87B parámetros en experimentos académicos de japonés.
- Despliegue en entornos con recursos limitados: su tamaño permite ejecución en hardware modesto para demos de RAG o pruebas de concepto.
- Generación de resúmenes o respuestas extractivas sobre corpus japoneses de dominio acotado, siempre con verificación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7-1,8 GB solo para pesos (873M parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9-1,0 GB para pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM es suficiente en la práctica (RTX 3060, RTX 4060, RTX 4090); también cabe en GPUs de datacenter (A100, H100) aunque está sobredimensionado para ellas.
- Cabe en GPU consumer: sí, con margen amplio, incluso en fp16.
- Opciones de despliegue: `transformers` con safetensors; vLLM, TGI, llama.cpp u Ollama son viables en teoría, pero el autor no publica pesos GGUF ni configuraciones de servido verificadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `OkamotoJP/llm2-qwen35-sft027avg` | 873.438.784 | no disponible | ja | Apache-2.0 | Promedio de dos SFT con distinta semilla; sin benchmarks |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B (no confirmado en la información) | no disponible | multilingüe (no confirmado) | Apache-2.0 | Modelo base del que deriva; sin ajuste específico para RAG en japonés |
| `OkamotoJP/llm2-qwen35-sft027` | no disponible | no disponible | ja | Apache-2.0 | Checkpoint individual promediado (peso 0,50) |
| `OkamotoJP/llm2-qwen35-sft027b` | no disponible | no disponible | ja | Apache-2.0 | Checkpoint individual promediado (peso 0,50) |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a linaje, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental y educativo: sin descargas ni validación de la comunidad en el momento de la ficha; no hay evidencia pública de calidad en producción.
- Riesgo de alucinación: al ser un modelo de 0,87B ajustado para RAG, puede generar respuestas no fundamentadas si el contexto recuperado es insuficiente o irrelevante.
- Sesgos: no documentados por el autor; al entrenarse sobre Wikipedia en japonés y datasets derivados, puede heredar sesgos de esas fuentes.
- Limitación de idioma: declarado únicamente para japonés; su rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto: no documentada; no se debe asumir la ventana del modelo base sin verificación.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, pero los datasets de entrenamiento son CC BY-SA 4.0 (JEMHopQA, auto-wiki-qa, chunks de Wikipedia); conviene revisar las obligaciones de atribución y compartición derivadas del uso de esos datos.
- Sin datos de benchmarks, cuantizaciones publicadas ni configuraciones de despliegue verificadas: cualquier uso en producción requiere evaluación propia.
- Fecha de creación posterior a la fecha actual de referencia de muchos entornos: verificar la disponibilidad real del repositorio y del modelo base Qwen3.5-0.8B antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft027avg
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint promediado 1: https://huggingface.co/OkamotoJP/llm2-qwen35-sft027
- Checkpoint promediado 2: https://huggingface.co/OkamotoJP/llm2-qwen35-sft027b
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
