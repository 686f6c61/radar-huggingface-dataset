# agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_12

## Resumen

`opus-high-v3.h068.sft-splice-cont.step_12` es un checkpoint intermedio publicado por el usuario `agentic-ptb` como parte del experimento de investigación **AgentPTB** (serie `opus-high-v3`). Se trata de un artefacto de reproducibilidad: un punto de control guardado a la hora 68 de un run de Claude Code que utilizaba el modelo base `Qwen/Qwen3.5-9B-Base` como punto de partida para un proceso de fine-tuning por SFT (supervised fine-tuning).

El propio autor marca este checkpoint con la etiqueta `negative-results` y advierte explícitamente en la model card que el run **no encontró ninguna mejora en los pesos entrenados** y que no debe inferirse calidad alguna a partir de su publicación. Es, por tanto, un artefacto de investigación para estudiar por qué el entrenamiento no convergió o no produjo mejoras, no un modelo listo para usar.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), hereda la arquitectura de Qwen3.5-9B-Base. No se dispone de información sobre longitud de contexto, idiomas soportados ni rendimiento, ya que no se publicaron benchmarks. Su valor es exclusivamente metodológico: sirve para auditar el proceso de entrenamiento, comparar tensores y entender dinámicas de regresión en SFT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión original desconocida) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-9B-Base, un transformer denso de aproximadamente 9,4 mil millones de parámetros. No se proporcionan detalles adicionales sobre la configuración interna (número de capas, cabezas de atención, dimensiones ocultas) en la información disponible.

El entrenamiento corresponde a un experimento de la serie `opus-high-v3` del proyecto AgentPTB, que utiliza agentes basados en Claude Code para orquestar runs de fine-tuning. El checkpoint concreto proviene de un proceso de SFT con "splice-cont" (probablemente continuación de splicing de pesos) y se guardó en el paso 12 de la hora 68 del run. Según los datos del índice del proyecto, los runs de esta serie tendieron a regresar: el `opus-high-v2` se abortó porque sus cinco runs de SFT regresaron y devolvieron los tensores del modelo base sin cambios. En este caso, el autor reporta que **no se encontró mejora en los pesos entrenados**, lo que sugiere que el fine-tuning no logró superar al modelo base o que los cambios fueron nulos o perjudiciales.

No hay información sobre el dataset de entrenamiento, número de tokens, composición de datos, ni si se aplicaron técnicas como RLHF o DPO. El checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo.

## Capacidades

- **No se han documentado capacidades propias.** Al ser un checkpoint intermedio de un run fallido, no se han evaluado ni publicado capacidades específicas.
- **Hereda las capacidades del modelo base** Qwen/Qwen3.5-9B-Base, pero no hay confirmación de que los pesos hayan cambiado de forma significativa respecto al original.
- **Sin soporte de tool calling, agentes o razonamiento multi-paso** documentado en la información disponible.
- **Sin capacidades multilingües** declaradas.
- **Sin modo de pensamiento, visión ni audio** indicados.

## Casos de uso

Dado que el modelo está etiquetado como `negative-results` y el propio autor desaconseja inferir calidad de su publicación, no se recomienda su uso en ningún escenario práctico. Los únicos usos razonables son:

- **Auditoría de reproducibilidad**: investigadores pueden comparar estos pesos con los del modelo base para verificar si el run realmente no produjo cambios, o para estudiar la dinámica de regresión en SFT.
- **Estudio de fallos de entrenamiento**: analizar por qué un run de fine-tuning no logra mejorar, examinando la magnitud de las actualizaciones de pesos o la divergencia respecto al checkpoint inicial.
- **Depuración de pipelines de entrenamiento**: utilizado como referencia para depurar el código del run AgentPTB (por ejemplo, verificando que el guardado de checkpoints funciona correctamente).
- **Investigación en metodología de agentes**: entender cómo los agentes de Claude Code orquestan runs de SFT y por qué ciertas configuraciones producen resultados nulos.
- **Comparación de tensores**: para validar herramientas de análisis de diferencias entre checkpoints (p. ej., calcular normas L2 entre pesos).
- **Documentación negativa**: como ejemplo de publicación de resultados negativos en la literatura de IA, un requisito para la ciencia abierta.

Para cualquier tarea real de generación de texto, código o razonamiento, es preferible utilizar el modelo base Qwen3.5-9B-Base directamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta ninguna métrica de evaluación (MMLU, HumanEval, GSM8K, etc.) y, dado el aviso de `negative-results`, no se deben asumir capacidades de rendimiento.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware para este checkpoint. Como referencia, un modelo de 9,4 mil millones de parámetros en precisión FP16 ocupa aproximadamente 18,8 GB en memoria (coincidente con el tamaño del repositorio). Para inferencia:

- **VRAM estimada**: al menos 20 GB en FP16; con cuantización a 8 bits (si se aplicara) unos 10 GB, y a 4 bits unos 5-6 GB, aunque no se han publicado pesos cuantizados.
- **GPU recomendadas**: una NVIDIA RTX 4090 (24 GB) o A100 de 40 GB podrían cargar el modelo en FP16. Una GPU con 16 GB podría requerir cuantización.
- **Consumer GPU**: posiblemente en una RTX 3090/4090 con cuantización, pero no hay verificaciones publicadas.
- **Opciones de despliegue**: no se han proporcionado archivos GGUF ni configuraciones para vLLM, Ollama o TGI. Solo safetensors.
- **Latencia y throughput**: no disponibles.

En cualquier caso, dado que el modelo no ofrece mejoras sobre el base, no tiene sentido desplegarlo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. El modelo es esencialmente un checkpoint del Qwen3.5-9B-Base sin mejoras, por lo que cualquier comparación con alternativas de la misma categoría (por ejemplo, Llama 3.1 8B, Mistral 7B o el propio Qwen3.5-9B-Base) carecería de base empírica. No disponible.

## Limitaciones y advertencias

- **Resultados negativos confirmados**: el autor indica explícitamente que el run no produjo mejoras en los pesos entrenados. No debe usarse como modelo de producción.
- **Checkpoint intermedio**: no es un modelo final; es un artefacto de reproducibilidad para un estudio de investigación.
- **Sin evaluación de sesgos ni alucinaciones**: no se ha realizado ninguna evaluación de seguridad, sesgos o calidad de generación.
- **Sin información de contexto ni idiomas**: se desconocen las capacidades multilingües y la ventana de contexto efectiva.
- **Licencia Apache-2.0**: permite uso comercial, pero dado que no hay mejoras sobre el base, usar este checkpoint en lugar del base no aporta valor.
- **Riesgo de confusión**: su nombre largo y críptico puede inducir a error a quien lo encuentre; la model card incluye una advertencia de interpretación que debe respetarse.
- **Sin soporte de cuantización**: no se proporcionan versiones GGUF ni AWQ, lo que limita su uso en entornos con recursos reducidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_12
- Dataset asociado al run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
