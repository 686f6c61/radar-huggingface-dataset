# agentic-ptb/opus-high-v3.h042.seed5.step_16

## Resumen

`opus-high-v3.h042.seed5.step_16` es un checkpoint intermedio publicado por el proyecto AgentPTB bajo el identificador `agentic-ptb`. Se trata de un derivado de un proceso de fine-tuning sobre el modelo base Qwen/Qwen3.5-9B-Base, ejecutado mediante un agente Claude Code en el marco del experimento denominado "opus-high-v3". El propio autor lo clasifica como un artefacto de carácter intermedio, retenido únicamente con fines de reproducibilidad y estudio cualitativo.

El dato más relevante de este modelo es que el experimento que lo generó **no produjo ninguna mejora en los pesos entrenados**: según la model card, el run "no encontró mejora en los pesos entrenados" (no trained weights improvement). Por tanto, este checkpoint no representa un modelo final útil para tareas prácticas, sino un registro de un intento fallido de fine-tuning. Su interés reside exclusivamente en el ámbito de la investigación sobre procesos de entrenamiento automático, donde puede servir para analizar por qué ciertas configuraciones no convergen o no mejoran respecto al base.

Arquitectónicamente, hereda la estructura del modelo base Qwen3.5-9B-Base, un transformer decoder-only de aproximadamente 9.400 millones de parámetros. No se especifica la longitud de contexto ni los detalles de entrenamiento en la documentación disponible. El repositorio contiene únicamente pesos en formato safetensors (18,8 GB) y está publicado bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en FP16/FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base Qwen/Qwen3.5-9B-Base. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de optimización empleadas (RLHF, DPO, SFT, etc.). La model card indica que pertenece a un run de "Claude Code" dentro del proyecto AgentPTB, en su celda "opus-high-v3", y que el checkpoint corresponde a la hora de ejecución h042 y al paso step_16.

La característica técnica más destacable es que el experimento no logró mejorar los pesos: los cinco runs de SFT asociados al proceso regresaron al estado del modelo base, lo que sugiere problemas de estabilidad, de configuración de hiperparámetros o de calidad de los datos. No se documenta ninguna innovación arquitectónica adicional.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un derivado del base Qwen3.5-9B-Base, podría heredar las capacidades generales de dicho modelo (generación de texto, razonamiento, código, etc.), pero no existe ninguna validación independiente que lo confirme. Dado que el run no produjo mejoras, es probable que su comportamiento sea equivalente o inferior al del base, sin ninguna garantía de funcionamiento fiable.

## Casos de uso

Este checkpoint no es adecuado para ningún caso de uso práctico en producción. Su única utilidad es la investigación y el análisis de procesos de entrenamiento:

- Reproducción de experimentos: permite reproducir el estado intermedio de un run fallido para depurar pipelines de fine-tuning automático.
- Estudio de fallos de entrenamiento: sirve para analizar por qué un agente de entrenamiento no logra mejorar los pesos y qué condiciones provocan la regresión al modelo base.
- Comparación de checkpoints: puede compararse con otros checkpoints del mismo run (p. ej. h042, step_16) para trazar la evolución de los pesos y detectar inestabilidades numéricas.
- Evaluación de pipelines de agentes: los organizadores del proyecto AgentPTB pueden utilizarlo como referencia negativa en sus métricas de éxito.
- Auditoría de licencias y artefactos: útil para verificar la trazabilidad de modelos derivados y el cumplimiento de la licencia Apache-2.0.
- Docencia: en cursos de fine-tuning, puede servir como ejemplo de un experimento fallido y de cómo documentar resultados negativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta ninguna métrica (MMLU, HumanEval, GSM8K, etc.) para este checkpoint, y dado que el run no produjo mejoras, no se puede asumir ningún rendimiento superior al del modelo base.

## Requisitos de hardware

Al tratarse de un modelo de ~9.400 millones de parámetros en formato safetensors (presumiblemente FP16), se estima:

- VRAM necesaria para inferencia en FP16: aproximadamente 19-20 GB (9,4B × 2 bytes + overhead de activaciones y KV cache).
- GPU recomendada: una NVIDIA RTX 3090, RTX 4090, A100 (40 GB) o superior. En una GPU con 24 GB de VRAM podría ejecutarse con contexto corto.
- No se han publicado cuantizaciones GGUF ni otras versiones de menor precisión; por tanto, no es viable su uso en hardware de consumo sin cuantización adicional.
- Opciones de despliegue: al no existir versiones cuantizadas, la vía más directa sería usar `transformers` con carga en FP16 o FP32. No se ha verificado compatibilidad con vLLM, llama.cpp u Ollama, aunque técnicamente podría adaptarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que este checkpoint es un artefacto intermedio sin validación, la comparativa más relevante es con su modelo base y con otros modelos de tamaño similar. No se dispone de datos de rendimiento, por lo que la comparación se limita a características declaradas.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h042.seed5.step_16 | 9,4B | no disponible | Apache-2.0 | Checkpoint intermedio, run fallido |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache-2.0 | Modelo base, sin fine-tuning |
| Llama-3.1-8B (Meta) | 8B | 128K | Llama 3.1 Community License | Modelo final, ampliamente validado |

No se recomienda utilizar este checkpoint como alternativa a ningún modelo final. Su única comparación útil es frente al base para estudiar el efecto del fine-tuning fallido.

## Limitaciones y advertencias

- El run de entrenamiento no produjo ninguna mejora en los pesos; es un resultado negativo documentado.
- No se ha validado el comportamiento del modelo en ninguna tarea; no hay garantía de que genere texto coherente o seguro.
- Al ser un derivado de Qwen3.5-9B-Base, puede heredar sesgos y alucinaciones del modelo base, pero no se ha evaluado.
- No se especifica la longitud de contexto; se desconoce si el fine-tuning alteró la ventana original.
- No se han publicado cuantizaciones, lo que limita su uso en entornos con restricciones de memoria.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para producción por su naturaleza experimental.
- El autor advierte explícitamente: "no inferir calidad a partir de la publicación".

## Enlaces

- Repositorio del modelo: https://huggingface.co/agentic-ptb/opus-high-v3.h042.seed5.step_16
- Dataset asociado al run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
