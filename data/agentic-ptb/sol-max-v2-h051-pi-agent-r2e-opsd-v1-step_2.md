# agentic-ptb/sol-max-v2.h051.pi-agent-r2e-opsd-v1.step_2

## Resumen

Este modelo es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, identificado como `sol-max-v2.h051.pi-agent-r2e-opsd-v1.step_2`. Fue generado por un agente de código (Codex / gpt-5.6-sol) con un esfuerzo de razonamiento máximo, dentro de una ejecución de 100 horas de la que se encuentra en la hora 51,89. Está basado en el modelo base `Qwen/Qwen3.5-9B-Base`, del que hereda su arquitectura y pesos iniciales, y contiene 9.409.813.744 parámetros en formato safetensors, con un tamaño de repositorio de 18,8 GB.

Se trata de un artefacto de investigación, no de un modelo final listo para producción. Su propósito es permitir el estudio de la evolución del rendimiento a lo largo del tiempo de entrenamiento, ya que el identificador del repositorio codifica la hora exacta del run en la que se guardó el checkpoint. La relevancia actual radica en que forma parte de una metodología de entrenamiento agéntico automatizado, donde un modelo de razonamiento dirige el proceso de optimización de otro modelo. No se dispone de información sobre licencia, idiomas soportados ni longitud de contexto, por lo que estos datos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con torre de vision) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer multimodal que incluye una torre de visión. Según la model card, los pesos de este checkpoint contienen dicha torre de visión, aunque el proceso de exportación no genera el archivo `preprocessor_config.json`, por lo que para servirlo con vLLM es necesario indicar explícitamente que se trate como un modelo solo de texto mediante `--limit-mm-per-prompt '{"image": 0, "video": 0}'`.

El entrenamiento se enmarca en el proyecto AgentPTB, donde un agente (Codex / gpt-5.6-sol) con esfuerzo de razonamiento máximo dirige el proceso de optimización. El checkpoint corresponde a la hora 51,89 de un run de 100 horas, y se guardó en el paso 2 de la ruta `checkpoints/pi-agent-r2e-opsd-v1/weights/step_2`. No se especifican detalles sobre el dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El token `eos_token_id` es 248046 (`<|im_end|>`), lo que indica que el checkpoint respeta el final de turno del chat template de Qwen3.5, un detalle importante para evaluaciones correctas.

## Capacidades

- Al ser un checkpoint de un modelo base, no se documentan capacidades específicas más allá de las heredadas de Qwen3.5-9B-Base.
- Generación de texto y razonamiento: probablemente hereda las capacidades del modelo base, aunque no hay confirmación en la información disponible.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, thinking mode): la arquitectura incluye torre de visión, pero no se ha verificado su funcionamiento en este checkpoint.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: este checkpoint permite analizar cómo evoluciona el rendimiento de un modelo a lo largo de un run de 100 horas, comparándolo con otros checkpoints del mismo sweep mediante el identificador de hora.
- Evaluación de la influencia del esfuerzo de razonamiento del agente director: al ser un producto de un agente con esfuerzo máximo, puede usarse para estudiar el efecto de esta configuración en la calidad del modelo resultante.
- Desarrollo de metodologías de entrenamiento agéntico: sirve como caso de estudio para quienes investigan la automatización de la optimización de modelos mediante agentes de IA.
- Pruebas de servido con vLLM: dado que requiere una configuración especial para cargarse, puede utilizarse para validar flujos de despliegue de modelos con arquitectura multimodal sin preprocesador.
- Análisis de la convergencia y estabilidad del entrenamiento: al ser un checkpoint intermedio, permite observar si el modelo está sobreajustando o si el proceso de entrenamiento es estable.
- Reproducción de experimentos: investigadores pueden descargar este checkpoint para reproducir los resultados del sweep y verificar las métricas reportadas en las figuras del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las evaluaciones deben compararse solo entre checkpoints con el mismo estado de `eos_token_id`, pero no proporciona cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.409.813.744 parámetros, en precisión bf16 (18,8 GB de pesos) se necesitan al menos 20 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. En fp32 serían unos 37,6 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) podría cargar el modelo en bf16 con cuantización o con limitaciones de contexto, pero no se garantiza. Para mayor comodidad, se recomienda una A100 40 GB o H100.
- Si cabe en consumer GPU: sí, en una RTX 4090 con 24 GB es posible en bf16 si se limita el contexto, pero no hay cuantizaciones oficiales disponibles.
- Opciones de despliegue: vLLM (con la configuración especial indicada), llama.cpp (si se convierte a GGUF, aunque no hay conversiones publicadas), o directamente con transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| agentic-ptb/sol-max-v2.h051... | 9,4B | no disponible | no disponible | safetensors | Checkpoint intermedio de un sweep |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | safetensors | Modelo base original |
| Otros checkpoints del sweep agentic-ptb | variable | no disponible | no disponible | safetensors | Misma familia, diferentes horas |

No se dispone de datos de rendimiento comparativo, por lo que la comparación se limita a aspectos estructurales.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: puede presentar inestabilidades o no haber convergido completamente.
- No se dispone de licencia, por lo que su uso comercial es incierto y requiere contactar con el autor.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de idioma.
- La arquitectura incluye torre de visión, pero sin `preprocessor_config.json`, por lo que no puede usarse como modelo multimodal directamente.
- El servido con vLLM requiere una configuración especial; de lo contrario, el modelo no carga.
- No se han publicado benchmarks, por lo que no hay evidencia de rendimiento en tareas estándar.
- El identificador del repositorio indica que es de la hora 51,89 de un run de 100 horas; checkpoints de horas posteriores podrían tener mejor rendimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agentic-ptb/sol-max-v2.h051.pi-agent-r2e-opsd-v1.step_2
- Búsqueda de modelos de agentic-ptb en Hugging Face: https://huggingface.co/models?other=agentic-ptb
