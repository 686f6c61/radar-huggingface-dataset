# agentic-ptb/opus-high-v3.h047.sft-mixd.step_20

## Resumen

El modelo `agentic-ptb/opus-high-v3.h047.sft-mixd.step_20` es un checkpoint intermedio derivado del experimento **AgentPTB opus-high-v3**, un run de ajuste fino supervisado (SFT) ejecutado mediante Claude Code. Está construido sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con aproximadamente 9.400 millones de parámetros, y se publica con fines de reproducibilidad y estudio cualitativo.

La model card incluye una advertencia explícita: el run **no encontró mejora en los pesos entrenados** y etiqueta el resultado como `negative-results`. Esto significa que este checkpoint no representa un modelo mejorado respecto a su base, sino un artefacto intermedio conservado para auditoría y análisis de procesos. No debe inferirse calidad a partir de su publicación.

A pesar de su naturaleza negativa, el checkpoint resulta relevante para la comunidad de investigación en IA open source como ejemplo documentado de un experimento fallido, útil para estudiar metodologías de entrenamiento, reproducibilidad y buenas prácticas en la publicación de resultados nulos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-9B-Base (transformador denso, sin detalles públicos adicionales) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no disponible (no se especifica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no publicados (el repositorio contiene pesos en safetensors, tamaño 18,8 GB, compatible con FP16) |
| Idiomas soportados | no disponibles (heredados del modelo base, sin confirmación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se deriva de `Qwen/Qwen3.5-9B-Base`, un modelo denso de aproximadamente 9.400 millones de parámetros. No se dispone de información pública sobre la arquitectura interna exacta de Qwen3.5-9B-Base (número de capas, dimensiones de atención, etc.) más allá de lo que el nombre sugiere: una variante de la familia Qwen3.5 con 9B parámetros.

El entrenamiento corresponde al experimento **opus-high-v3** del proyecto AgentPTB, un run de ajuste fino supervisado (SFT) ejecutado mediante Claude Code. La provenance indica `scratch/agent/sft-mixd/weights/step_20`, es decir, el paso 20 de una mezcla de datos SFT. El run se documenta como `intermediate` y `h047` (hora 47 del experimento). El dataset asociado está disponible en `agentic-ptb/opus-high-v3-data`.

El hallazgo principal del run es que **no se observó mejora en los pesos entrenados** respecto al modelo base. No se detallan los hiperparámetros, la composición del dataset ni las técnicas de entrenamiento empleadas. Tampoco se menciona el uso de RLHF, DPO u otras etapas posteriores.

## Capacidades

Al ser un checkpoint intermedio de un run con resultados negativos, no se han publicado capacidades específicas. Las capacidades que pudiera tener serían las heredadas del modelo base `Qwen/Qwen3.5-9B-Base`, pero no hay documentación que las confirme. En cualquier caso, el propio autor advierte que no debe inferirse calidad de la publicación.

- Generación de texto: no documentada en este checkpoint.
- Razonamiento, código o matemáticas: no documentadas.
- Tool calling o function calling: no documentado.
- Soporte de agentes o multi-step reasoning: no documentado.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no documentado.

## Casos de uso

Dado que el run no produjo mejoras y el checkpoint se publica exclusivamente para reproducibilidad, los casos de uso son de carácter investigador, no productivo:

- Auditoría de experimentos de SFT: permite inspeccionar los pesos intermedios de un run fallido para entender por qué no convergió o no mejoró.
- Estudio de reproducibilidad: sirve como referencia para reproducir el experimento opus-high-v3 y verificar los resultados negativos reportados.
- Análisis de metodologías de entrenamiento: útil para investigar qué configuraciones de SFT llevan a regresión o ausencia de mejora.
- Comparación de checkpoints: permite contrastar este paso 20 con otros pasos del mismo run o con el modelo base para estudiar la dinámica de los pesos.
- Validación de pipelines de entrenamiento: como ejemplo de artefacto intermedio que debe descartarse en producción, ayuda a diseñar filtros de calidad en pipelines automatizados.
- Investigación sobre resultados negativos: contribuye a la literatura de experimentos fallidos, un área poco documentada pero valiosa para la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta puntuaciones en MMLU, HumanEval, GSM8K ni ningún otro benchmark. Dado el carácter de resultado negativo del run, no se espera que existan métricas de rendimiento que respalden su uso.

## Requisitos de hardware

Al no existir documentación oficial sobre despliegue, los siguientes datos son estimaciones basadas en el tamaño del modelo (9.409.813.744 parámetros) y el peso del repositorio (18,8 GB, compatible con FP16):

- VRAM estimada para inferencia en FP16: ~18,8 GB (una GPU con 24 GB, como RTX 3090/4090, sería suficiente).
- VRAM estimada en cuantización INT8: ~9,4 GB (GPU con 12-16 GB, como RTX 3060/4070).
- VRAM estimada en cuantización INT4: ~4,7 GB (GPU con 8 GB, como RTX 3070/4060).
- GPU recomendadas: RTX 3090, RTX 4090, A100 40GB, H100, o cualquier GPU con al menos 20 GB para FP16.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se generen los pesos en formato GGUF o se adapte el safetensors; no hay configuraciones oficiales publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint. Al ser un artefacto intermedio de un run fallido, no tiene sentido compararlo con modelos finales. La única referencia razonable es su modelo base:

| Modelo | Parámetros | Contexto | Resultado del run | Licencia |
|---|---|---|---|---|
| `agentic-ptb/opus-high-v3.h047.sft-mixd.step_20` | 9,4 B | no disponible | Sin mejora (negative-results) | Apache 2.0 |
| `Qwen/Qwen3.5-9B-Base` | ~9 B | no disponible | Modelo base de referencia | Apache 2.0 |

Otras alternativas de tamaño similar (p. ej., Llama 3.1 8B, Mistral 7B) no son comparables directamente porque este checkpoint no tiene rendimiento publicado.

## Limitaciones y advertencias

- **Resultado negativo**: el run no encontró mejora en los pesos entrenados; el checkpoint no representa un modelo mejorado.
- **No apto para producción**: es un artefacto intermedio conservado solo para reproducibilidad y estudio.
- **Sesgos y alucinación**: no hay evaluación de sesgos ni de tasas de alucinación; se heredan los riesgos del modelo base sin validación.
- **Documentación incompleta**: faltan datos de contexto, idiomas, cuantizaciones y benchmarks.
- **Riesgo de interpretación errónea**: el autor advierte explícitamente que no debe inferirse calidad de la publicación.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo no es útil para ese fin dado su estado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h047.sft-mixd.step_20
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
