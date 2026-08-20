# agentic-ptb/grok.h022.sft-v6.step_600

## Resumen

Este repositorio contiene un checkpoint intermedio del sweep de entrenamiento AgentPTB, identificado como `grok.h022.sft-v6.step_600`. Se trata de un modelo de 9.400 millones de parámetros (9,4B) construido a partir de la base `Qwen/Qwen3.5-9B-Base`, y su nombre hace referencia a la celda de experimentación "grok" dentro del pipeline de AgentPTB, con un driver de razonamiento "pi / grok-4.6" y un esfuerzo de razonamiento "xhigh". El checkpoint fue guardado a la hora 22 de un run de 100 horas (h22), lo que lo sitúa en una fase temprana del entrenamiento.

El modelo no es un producto final, sino un artefacto de investigación para estudiar la evolución del rendimiento a lo largo del tiempo. Presenta un defecto de empaquetado conocido: el token de fin de secuencia `248046` (`<|im_end|>`) no está incluido en la lista de `eos_token_id`, lo que provoca que el modelo no detenga correctamente las respuestas y pueda sobrepasar la ventana de contexto. Por tanto, cualquier evaluación realizada sobre este checkpoint debe interpretarse como un límite inferior, no como una medición fiable.

La relevancia de este modelo radica en su utilidad para la comunidad de investigación en alineación y entrenamiento de LLMs, ya que permite analizar la dinámica de aprendizaje durante un sweep. No está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, probablemente 32K o superior, pero no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-9B-Base, un transformer decoder-only con atención de múltiples cabezas. No se dispone de detalles sobre la configuración exacta de capas, dimensiones ocultas o número de cabezas, ya que no se han publicado en la model card. El entrenamiento corresponde a un paso de supervisión fina (SFT) dentro de un sweep más amplio denominado AgentPTB, que explora diferentes configuraciones de razonamiento y esfuerzo. El checkpoint se guardó en el paso 600 (según el ID) o paso 200 (según la model card, que parece desactualizada respecto al ID), a las 22 horas de un run de 100 horas.

No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La única innovación técnica destacable es el uso de un "driver" de razonamiento con esfuerzo "xhigh", que probablemente implica una generación de cadenas de pensamiento más extensa, aunque no se detalla su implementación.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, hereda capacidades generales de lenguaje, pero su estado intermedio de entrenamiento limita su fiabilidad.
- Razonamiento multi-paso: el driver "pi / grok-4.6" con esfuerzo "xhigh" sugiere un enfoque orientado a razonamiento profundo, aunque no hay evidencia empírica publicada.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas.
- El defecto de eos impide un uso conversacional normal: el modelo no sabe cuándo terminar, por lo que las respuestas tienden a alargarse hasta agotar el contexto.

## Casos de uso

- Investigación en dinámica de entrenamiento: permite estudiar cómo evoluciona el rendimiento de un modelo a lo largo de un sweep, comparando checkpoints de distintas horas (h22, h23, etc.) para trazar curvas de aprendizaje.
- Análisis de defectos de empaquetado: sirve como caso de estudio para entender el impacto de un token eos ausente en la generación y en las métricas de evaluación.
- Desarrollo de pipelines de evaluación intermedia: los equipos que trabajan con sweeps pueden usar este checkpoint para validar sus herramientas de medición antes de aplicarlas a modelos finales.
- Benchmarking de infraestructura: al ser un modelo de 9,4B, puede utilizarse para probar sistemas de inferencia distribuida o cuantización, aunque su calidad de salida no sea representativa.
- Reproducción de experimentos: investigadores que quieran replicar el sweep AgentPTB pueden descargar este checkpoint para verificar resultados intermedios.
- Educación en alineación de LLMs: útil como ejemplo de los problemas prácticos que surgen en el entrenamiento real (errores de tokenización, checkpoints intermedios, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que las evaluaciones sobre este checkpoint son un "suelo" (floor) debido al defecto de eos, por lo que cualquier número carecería de validez comparativa.

## Requisitos de hardware

- VRAM estimada: para inferencia en precisión FP16, un modelo de 9,4B requiere aproximadamente 19 GB de VRAM (9,4B × 2 bytes). Con cuantización INT8 bajaría a ~10 GB, y con INT4 a ~5 GB, pero no se proporcionan pesos cuantizados.
- GPU recomendadas: una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) puede ejecutar el modelo en FP16. Para mayor velocidad, una A100 (40/80 GB) o H100 serían adecuadas.
- En consumer GPU: sí, cabe en una RTX 4090 (24 GB) en FP16, o en GPUs de 16 GB con cuantización (si se generan los GGUF correspondientes).
- Opciones de despliegue: al ser un checkpoint de investigación, no se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI. Sería necesario convertirlo a los formatos adecuados (GGUF, etc.) para usarlo con esas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/grok.h022.sft-v6.step_600 | 9,4B | no disponible | no disponible | Checkpoint intermedio, defecto eos |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible (probablemente 32K+) | Apache 2.0 (asumible, no confirmado) | Modelo base estable |
| Qwen/Qwen3.5-9B-Instruct | 9,4B | no disponible | Apache 2.0 (asumible) | Modelo instructivo estable |

La comparativa se limita al modelo base y su variante instructiva, ya que no hay otros modelos comparables en el mismo sweep publicados con información suficiente. Este checkpoint no es directamente comparable con modelos comerciales o finales debido a su naturaleza intermedia y al defecto de tokenización.

## Limitaciones y advertencias

- Defecto crítico de tokenización: falta el token eos `248046` (`<|im_end|>`), lo que provoca que el modelo no termine las respuestas y sobrepase la ventana de contexto. No debe usarse en producción ni en evaluaciones sin re-empaquetar.
- Estado intermedio: es un checkpoint de la hora 22 de un run de 100 horas, por lo que su rendimiento es inferior al de un modelo final entrenado durante más tiempo.
- Sin licencia especificada: no se indica bajo qué términos se distribuye, lo que impide su uso comercial o incluso académico sin autorización explícita del autor.
- Sin información de idiomas: no se documenta qué idiomas soporta, aunque al derivar de Qwen3.5-9B-Base probablemente herede el multilingüismo de Qwen, pero no está confirmado.
- Riesgo de alucinación: al ser un modelo en entrenamiento, las salidas pueden ser incoherentes o inventadas, especialmente en tareas de razonamiento complejo.
- Sin benchmarks: no hay datos objetivos de rendimiento, por lo que cualquier afirmación sobre su calidad es especulativa.
- Documentación inconsistente: la model card menciona un checkpoint distinto (h023.sft-v7.step_200) al del ID del repositorio (h022.sft-v6.step_600), lo que sugiere que la card no está sincronizada con el contenido real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h022.sft-v6.step_600
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep (mencionado en la card, no verificado): `agentic-ptb/INDEX` (no se ha encontrado URL directa)
- Documentación de Grok (asistente de SpaceXAI, no relacionado directamente con este checkpoint): https://docs.x.ai/developers/models
