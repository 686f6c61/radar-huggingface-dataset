# agentic-ptb/grok.h083.soup-92-swenext

## Resumen

Este repositorio contiene un checkpoint intermedio de un barrido (sweep) de entrenamiento de AgentPTB, un proyecto de fine-tuning de modelos de lenguaje. El modelo es un fine-tune de `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros, y se identifica como `sol-max.h007.sft-agent-mix-clean-full-v1.step_100`. Fue generado por un agente de código (Codex / gpt-5.6-sol) con un esfuerzo de razonamiento máximo, dentro de una ejecución de 100 horas de la que representa la hora 7.

Se trata de un artefacto de investigación, no de un modelo final listo para producción. La model card advierte que el checkpoint carece del token `eos` `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y pueda desbordar la ventana de contexto. Por tanto, cualquier métrica de evaluación obtenida con este checkpoint debe considerarse un límite inferior, no una medida fiable. El repositorio no incluye licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9.4 mil millones de parámetros. No se proporcionan detalles sobre la arquitectura interna del modelo base (número de capas, heads, etc.) ni sobre el dataset de entrenamiento. La model card indica que el checkpoint proviene de un barrido de AgentPTB, un framework de entrenamiento agéntico, y que el "driver" fue un modelo de código (Codex / gpt-5.6-sol) con esfuerzo de razonamiento máximo. El entrenamiento se realizó sobre una mezcla de datos de agentes (`sft-agent-mix-clean-full-v1`), pero no se especifica el número de tokens ni la composición exacta del dataset. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación.

Una característica técnica destacable es la advertencia sobre el token `eos`: el checkpoint solo incluye `248044` y omite `248046` (`<|im_end|>`), lo que impide que el modelo termine correctamente las respuestas según la plantilla de chat de Qwen3.5. Esto sugiere que el proceso de entrenamiento no configuró adecuadamente los tokens de fin de secuencia, un problema común en checkpoints intermedios.

## Capacidades

- Generación de texto: el modelo puede generar texto continuo, pero con la limitación del token eos faltante, las respuestas no se detienen de forma natural.
- Razonamiento: al ser un fine-tune de Qwen3.5-9B-Base, hereda capacidades básicas de razonamiento, aunque no hay datos que confirmen su rendimiento.
- Código: el entrenamiento se realizó con un driver de código, lo que podría mejorar las capacidades de generación de código, pero no hay evidencia publicada.
- Tool calling / function calling: no se menciona soporte explícito.
- Agentes y multi-step reasoning: el contexto del proyecto (AgentPTB) sugiere un enfoque en tareas agénticas, pero no hay documentación de capacidades específicas.
- Multilingüe: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

Dado que se trata de un checkpoint intermedio con limitaciones conocidas, no se recomienda su uso en producción. Los casos de uso son principalmente de investigación:

- Investigación en fine-tuning agéntico: el checkpoint puede usarse para estudiar la dinámica de entrenamiento de modelos de 9B en tareas de agentes, comparando la evolución del rendimiento a lo largo de las horas del barrido.
- Análisis de la influencia del token eos: permite investigar cómo la ausencia de un token de fin de secuencia afecta a la generación y a las métricas de evaluación.
- Reproducción de experimentos: los investigadores pueden re-empaquetar el checkpoint añadiendo el token eos correcto y evaluarlo en benchmarks estándar para obtener medidas fiables.
- Desarrollo de pipelines de evaluación: sirve como caso de prueba para herramientas de evaluación que deben manejar checkpoints incompletos.
- Comparación de checkpoints dentro del mismo barrido: al ser la hora 7 de 100, puede compararse con checkpoints posteriores para trazar la curva de rendimiento.
- Estudio de la transferencia desde modelos de código: el uso de un driver de código para generar el fine-tune puede analizarse en términos de calidad de los datos sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que las evaluaciones de este checkpoint son un "floor" (límite inferior) debido al token eos faltante, por lo que cualquier número reportado sería engañoso sin re-empaquetar el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.4B parámetros en BF16, se necesitan aproximadamente 19 GB de VRAM para cargar los pesos en memoria. Con cuantización a 8 bits, unos 10 GB; a 4 bits, unos 5-6 GB.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G) para inferencia en BF16 sin cuantizar. Para cuantización 4-bit, una RTX 3060 de 12 GB podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantización. Una RTX 4090 (24 GB) puede ejecutar el modelo en BF16.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers. Sin embargo, dado el token eos faltante, es necesario re-empaquetar el modelo antes de usarlo en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. El modelo base, Qwen3.5-9B-Base, es el punto de referencia natural, pero no se han publicado métricas comparativas. Otros modelos de tamaño similar (Llama 3.1 8B, Mistral 7B) podrían servir como referencia, pero sin datos de este checkpoint, la comparación no es posible.

## Limitaciones y advertencias

- Token eos faltante: el checkpoint no incluye el token `248046` (`<|im_end|>`), por lo que el modelo no detiene las respuestas correctamente y puede desbordar la ventana de contexto. Es imprescindible re-empaquetar el modelo antes de cualquier uso.
- Checkpoint intermedio: es la hora 7 de un run de 100 horas; el propio autor indica que el "cell" murió alrededor de la hora 16, por lo que este checkpoint no representa un modelo final optimizado.
- Sin licencia: no se especifica la licencia, lo que impide su uso comercial o incluso su redistribución sin autorización explícita.
- Sin datos de rendimiento: no hay benchmarks publicados, y las evaluaciones existentes son poco fiables por el problema del eos.
- Sesgos y alucinación: no hay información sobre sesgos específicos, pero al ser un fine-tune de un modelo base, hereda los riesgos típicos de alucinación y sesgos de los datos de entrenamiento.
- Riesgo de sobreajuste: al ser un checkpoint temprano de un barrido, puede no haber convergido y mostrar un rendimiento inferior al esperado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h083.soup-92-swenext
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del proyecto AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (no se ha encontrado URL directa)
- Framework agentic-soup (relacionado con el nombre del repo): https://github.com/strict-rs/agentic-soup
