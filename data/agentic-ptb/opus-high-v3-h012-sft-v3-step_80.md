# agentic-ptb/opus-high-v3.h012.sft-v3.step_80

## Resumen

`opus-high-v3.h012.sft-v3.step_80` es un checkpoint intermedio generado durante el run **opus-high-v3** del proyecto AgentPTB, una iniciativa que utiliza Claude Code para ejecutar pipelines de entrenamiento de modelos de lenguaje. Este checkpoint concreto corresponde a la hora 12 del run (h012) y al paso 80 de un proceso de fine-tuning supervisado (SFT-v3). El modelo base es `Qwen/Qwen3.5-9B-Base`, con aproximadamente 9.410 millones de parámetros y licencia Apache 2.0.

El autor lo clasifica explícitamente como un resultado negativo: el run no encontró ninguna mejora en los pesos entrenados respecto al modelo base, y el checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo. La model card incluye una advertencia clara de que no debe inferirse calidad a partir de su publicación. Por tanto, no es un modelo apto para uso en producción ni para evaluación comparativa, sino una pieza de evidencia dentro de un experimento de investigación sobre dinámicas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-9B-Base (detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base `Qwen/Qwen3.5-9B-Base`, pero la model card no proporciona detalles sobre la configuración interna (número de capas, heads, dimensiones ocultas, etc.). El entrenamiento corresponde a un proceso de SFT (supervised fine-tuning) dentro del run opus-high-v3, ejecutado mediante Claude Code como orquestador. El run se detuvo en la hora 12 y el checkpoint se guardó en el paso 80.

Según el índice del proyecto AgentPTB, el run opus-high-v3 es una repetición de opus-high-v1, y los cinco runs de SFT realizados regresaron todos al modelo base sin mejoras. Esto indica que el proceso de fine-tuning no logró ajustar los pesos de forma útil, probablemente por problemas de datos, hiperparámetros o dinámica de entrenamiento. No se documentan innovaciones técnicas en el checkpoint en sí.

## Capacidades

- No se documentan capacidades específicas para este checkpoint.
- Al estar basado en Qwen3.5-9B-Base, podría heredar las capacidades generales de ese modelo (generación de texto, razonamiento, código, etc.), pero no hay confirmación ni evaluación publicada.
- No se menciona soporte para tool calling, agentes, visión, audio ni modos especiales de razonamiento.
- El autor lo describe como un artefacto de estudio, no como un modelo funcional.

## Casos de uso

- Reproducibilidad de experimentos: permite a otros investigadores replicar el run opus-high-v3 y verificar los resultados negativos reportados.
- Estudio de dinámicas de entrenamiento: analizar por qué el SFT no produjo mejoras, comparando los pesos de este checkpoint con los del modelo base.
- Análisis de fallos en pipelines de fine-tuning: sirve como caso de estudio para depurar procesos de entrenamiento automatizados con agentes.
- Investigación sobre regresión de pesos: examinar cómo los pasos de SFT pueden degradar o no modificar el rendimiento.
- Validación de herramientas de orquestación: comprobar si Claude Code ejecutó correctamente los pasos de entrenamiento y guardado.
- No se recomienda ningún caso de uso práctico en producción, dado el carácter intermedio y fallido del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta ninguna métrica de rendimiento para este checkpoint, y la advertencia de la model card desaconseja inferir calidad a partir de su existencia.

## Requisitos de hardware

- Tamaño del repositorio: 18,8 GB en safetensors, lo que implica al menos 19 GB de VRAM para cargar los pesos en precisión fp32, o unos 9,5 GB en fp16/bf16 si se convierte.
- GPU recomendada: para inferencia en fp16 se necesitaría una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, A10G). Para fp32, se requeriría una GPU de 24 GB o más (RTX 3090, RTX 4090, A100 40GB).
- Al no haber cuantizaciones publicadas, no se puede reducir el requisito de VRAM mediante GGUF o AWQ.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI podrían cargar el modelo si se convierte a los formatos adecuados, pero no hay soporte oficial ni configuraciones probadas.
- Latencia y throughput: no disponibles, al no existir evaluaciones de rendimiento.

## Comparativa con modelos similares

No disponible. Este checkpoint no tiene modelos comparables directos porque es un artefacto intermedio de un experimento fallido, no un modelo final evaluado. La única referencia razonable sería el modelo base `Qwen/Qwen3.5-9B-Base`, pero no se dispone de datos de rendimiento de este checkpoint para establecer una comparación significativa.

## Limitaciones y advertencias

- El autor advierte explícitamente que el run no encontró mejoras en los pesos entrenados y que no debe inferirse calidad de la publicación.
- Es un checkpoint intermedio (paso 80 de un SFT), no un modelo final entrenado hasta convergencia.
- No se han evaluado sesgos, alucinaciones ni riesgos de seguridad.
- No hay información sobre idiomas soportados ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es útil para producción debido a su naturaleza fallida.
- Cualquier uso en producción sería inapropiado y podría generar resultados impredecibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h012.sft-v3.step_80
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
