# agentic-ptb/opus-high-v3.h015.sft-v5.step_16

## Resumen

`agentic-ptb/opus-high-v3.h015.sft-v5.step_16` es un checkpoint intermedio derivado de un run de fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, desarrollado por el equipo `agentic-ptb` dentro del proyecto AgentPTB. Se trata de un artefacto de reproducibilidad y estudio cualitativo, no de un modelo final listo para producción. El propio autor advierte explícitamente en la model card que el run no encontró ninguna mejora en los pesos entrenados y que no debe inferirse calidad a partir de su publicación.

El checkpoint corresponde al paso 16 de un run de Claude Code etiquetado como `opus-high-v3`, con rol `intermediate` y hora de ejecución `h015`. El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y se distribuye en formato safetensors con licencia Apache 2.0. No se dispone de información sobre la longitud de contexto, idiomas soportados ni cuantizaciones disponibles. Dado su carácter de resultado negativo, su relevancia es exclusivamente metodológica: sirve para documentar un experimento fallido y para futuras comparaciones de reproducibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-9B-Base (sin detalles adicionales) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3.5-9B-Base`, pero no se proporcionan detalles específicos sobre su diseño (número de capas, cabezas de atención, tipo de atención, etc.). El checkpoint es el resultado de un proceso de fine-tuning supervisado (SFT) en el paso 16 de un run automatizado con Claude Code, dentro del experimento `opus-high-v3`. El run se ejecutó durante 15 horas (`h015`) y el peso se guardó en la ruta `scratch/agent/sft-v5/weights/step_16`.

Según la model card, el run no produjo ninguna mejora en los pesos entrenados; de hecho, se etiqueta como `negative-results`. Esto implica que el fine-tuning no logró superar al modelo base en las métricas evaluadas internamente. No se publican datos sobre el dataset de entrenamiento, el número de tokens procesados ni el método de optimización empleado. El checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un artefacto intermedio sin mejora verificada, no se recomienda su uso en tareas prácticas. Las capacidades que pudiera heredar del modelo base `Qwen3.5-9B-Base` no están confirmadas ni evaluadas en esta versión. En consecuencia:

- No hay evidencia de capacidades de generación de texto, razonamiento, código o matemáticas superiores al modelo base.
- No se ha verificado soporte para tool calling, agentes o razonamiento multi-paso.
- No se dispone de información sobre capacidades multilingües.
- No se ha documentado ningún modo especial (thinking, visión, audio, etc.).

## Casos de uso

Dado el carácter de resultado negativo y la advertencia explícita del autor, este checkpoint no tiene casos de uso prácticos recomendados. Los únicos escenarios plausibles son:

- Estudio de reproducibilidad: investigadores pueden utilizar este checkpoint para replicar el experimento y verificar la ausencia de mejora en los pesos.
- Análisis de fallos: sirve para investigar por qué un run de SFT concreto no logra mejorar el modelo base, lo que puede orientar futuros diseños de entrenamiento.
- Comparación metodológica: permite contrastar este resultado con otros runs del mismo proyecto (por ejemplo, `opus-high-v1` o `opus-high-v2`) para entender la variabilidad de los procesos automatizados.
- Auditoría de pipelines: útil para validar que los checkpoints intermedios se almacenan correctamente y que los metadatos de ejecución son fiables.
- Docencia en ingeniería de modelos: como ejemplo de un experimento fallido bien documentado, puede usarse en cursos sobre fine-tuning y evaluación de modelos.
- Desarrollo de herramientas de orquestación: el run demuestra el uso de Claude Code como agente de entrenamiento, lo que puede inspirar mejoras en sistemas de automatización de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. La única indicación de rendimiento es la declaración cualitativa de que el run no encontró mejora en los pesos entrenados, lo que sugiere que el checkpoint no supera al modelo base en las pruebas internas del proyecto.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware para este checkpoint. No obstante, a partir del tamaño de parámetros (9,4 mil millones) y del peso del repositorio (18,8 GB en safetensors), se pueden hacer estimaciones generales:

- En precisión FP16, el modelo ocuparía aproximadamente 18,8 GB de VRAM, por lo que necesitaría una GPU con al menos 24 GB (por ejemplo, RTX 3090, RTX 4090, A100 40 GB o superior).
- Con cuantización a 8 bits (si se generara), el uso de VRAM bajaría a unos 9,4 GB, permitiendo su ejecución en GPUs de 12 GB o 16 GB (RTX 3060, RTX 4070, etc.).
- Con cuantización a 4 bits, el uso de VRAM sería de unos 4,7 GB, lo que permitiría su uso en GPUs de 6 GB o 8 GB, aunque no se han publicado archivos GGUF ni AWQ.
- Para inferencia, se podría utilizar vLLM, llama.cpp, Ollama o TGI, siempre que se generen los formatos adecuados (GGUF, AWQ, etc.), pero no hay evidencia de que existan.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables directos, ya que este checkpoint es un artefacto intermedio de un experimento fallido y no un modelo final. La comparación natural sería con el modelo base `Qwen/Qwen3.5-9B-Base`, pero no se dispone de métricas de rendimiento para ninguno de los dos. Tampoco se conocen otros checkpoints del mismo proyecto con resultados positivos que puedan servir de referencia.

## Limitaciones y advertencias

- El autor declara explícitamente que el run no encontró ninguna mejora en los pesos entrenados; por tanto, este checkpoint no debe utilizarse como modelo de producción.
- Se trata de un checkpoint intermedio y derivado, no de un modelo final. Su calidad no está garantizada y puede contener artefactos del proceso de entrenamiento.
- No se dispone de información sobre sesgos, alucinaciones o comportamientos indeseados, ya que no se ha evaluado el modelo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para ello debido a su falta de validación.
- No se han publicado cuantizaciones ni formatos optimizados para inferencia, lo que limita su despliegue práctico.
- El proyecto `agentic-ptb` incluye otros runs con resultados negativos (por ejemplo, `opus-high-v2` fue abortado), lo que sugiere que la metodología aún está en fase experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h015.sft-v5.step_16
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto: https://huggingface.co/datasets/agentic-ptb/INDEX
