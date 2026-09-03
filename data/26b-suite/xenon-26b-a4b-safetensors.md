# 26B-Suite/Xenon-26B-A4B-safetensors

## Resumen

Xenon-26B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por 26B-Suite, que parte de la arquitectura base Gemma-4-26B-A4B de Google DeepMind. Se trata de una adaptación mediante LoRA (Low-Rank Adaptation) diseñada específicamente para mejorar la fiabilidad en la ejecución de flujos de trabajo agénticos, como la llamada a herramientas (tool calling) y la orquestación de tareas multi-paso. El modelo base ya posee un gran potencial latente, pero carece de la directiva estricta para ejecutar estos flujos de forma consistente; Xenon-26B-A4B resuelve este problema mediante una adaptación quirúrgica que evita el olvido catastrófico típico del fine-tuning completo.

Con 25.805.936.206 parámetros totales y solo 4.000 millones de parámetros activos por token (de ahí el sufijo A4B), el modelo ofrece un equilibrio entre capacidad y eficiencia computacional. Está disponible en formato safetensors y, según la información revisada, es un modelo de tipo imagen-texto a texto (arquitectura gemma4_text), lo que sugiere capacidades multimodales. La fecha de creación es septiembre de 2026, aunque no se dispone de información sobre la licencia, los idiomas soportados ni la longitud de contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Gemma-4-26B-A4B |
| Parametros totales | 25.805.936.206 (~25,8 B) |
| Parametros activos | 4.000.000.000 (~4 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Xenon-26B-A4B se construye sobre la arquitectura Gemma-4-26B-A4B, un modelo MoE con 26 mil millones de parámetros totales y 4 mil millones de parámetros activos por token. Esta configuración permite una inferencia mucho más rápida de lo que sugeriría su tamaño total, ya que solo se activa un subconjunto de expertos en cada paso. La adaptación se realiza mediante LoRA, una técnica de fine-tuning eficiente que modifica únicamente matrices de baja dimensión, minimizando el riesgo de olvido catastrófico y preservando el conocimiento general del modelo base.

No se dispone de información detallada sobre el proceso de entrenamiento: ni el número de tokens utilizados, ni la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La descripción del modelo indica que la adaptación se centra en reforzar la capacidad de ejecutar flujos de trabajo agénticos de manera fiable, corrigiendo problemas como la vacilación, la alucinación de llamadas a herramientas y el olvido de importaciones de librerías estándar en tareas de código.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Gemma-4, hereda capacidades generales de lenguaje, aunque no se especifican métricas concretas.
- Tool calling y function calling: es la mejora principal del modelo, orientada a ejecutar llamadas a herramientas de forma fiable y consistente.
- Ejecución de flujos agénticos: diseñado para orquestar tareas multi-paso, como planificación y ejecución de subtareas.
- Generación de código: la adaptación LoRA corrige olvidos de importaciones y mejora la precisión en tareas de programación.
- Capacidades multimodales: al ser un modelo imagen-texto a texto, puede procesar entradas visuales junto con texto, aunque no se detallan los tipos de imágenes soportadas.
- Multilingüismo: no confirmado; no se dispone de información sobre idiomas soportados.

## Casos de uso

- Automatización de tareas empresariales: el modelo puede gestionar flujos de trabajo que requieren llamadas a APIs, bases de datos o servicios externos, gracias a su fiabilidad en tool calling.
- Asistentes virtuales avanzados: integrado en un chatbot, puede mantener conversaciones multi-turno y ejecutar acciones como reservas, consultas o envío de mensajes.
- Generación de código en producción: su capacidad para recordar importaciones y estructuras de librerías lo hace adecuado para pipelines de CI/CD que generan o completan código.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o formularios y extraer información relevante.
- Agentes de razonamiento multi-paso: en entornos de investigación o análisis, puede descomponer problemas complejos en subtareas y ejecutarlas secuencialmente.
- Integración en frameworks de agentes: compatible con sistemas como LangChain o AutoGen, donde la fiabilidad en la llamada a herramientas es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- El repositorio safetensors ocupa 51,6 GB, lo que corresponde a los pesos en FP16 (25,8 B parámetros × 2 bytes). Para cargar el modelo completo en FP16 se necesitan aproximadamente 52 GB de VRAM.
- Con cuantización a 8 bits, la memoria requerida se reduciría a unos 26 GB; a 4 bits, a unos 13 GB. Sin embargo, no se ha confirmado la disponibilidad de versiones cuantizadas.
- GPU recomendadas: para FP16, una NVIDIA A100 (80 GB) o H100 (80 GB) sería adecuada. Para cuantización a 8 bits, una RTX 4090 (24 GB) podría ser insuficiente; se necesitaría al menos una GPU con 32 GB o más.
- Al ser un MoE con solo 4 B de parámetros activos, la inferencia puede ser más rápida que un modelo denso de tamaño similar, pero la memoria necesaria para cargar todos los expertos sigue siendo alta.
- Opciones de despliegue: al estar en formato safetensors, es compatible con frameworks como Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se ha confirmado soporte específico en Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Xenon-26B-A4B | 25,8 B | 4 B | no disponible | no disponible | safetensors |
| Gemma-4-26B-A4B (base) | 26 B | 4 B | no disponible | no disponible | no disponible |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32k | Apache 2.0 | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo. La comparación se limita a parámetros y disponibilidad. Gemma-4-26B-A4B es la base directa, mientras que Mixtral 8x7B es otro MoE popular, aunque con más parámetros activos y una licencia permisiva conocida.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o alucinaciones específicas; como todo modelo de lenguaje, existe riesgo de generar contenido incorrecto o inventado.
- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar con el autor antes de utilizarlo en producción.
- La longitud de contexto no se ha especificado, por lo que no se puede garantizar un rendimiento adecuado en tareas que requieran ventanas largas.
- El modelo está orientado a flujos agénticos; su rendimiento en tareas generales de lenguaje puede ser inferior al de la base sin adaptar.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su mejora frente al modelo base.
- Al ser un modelo multimodal, se desconoce el tipo de imágenes soportadas y la calidad del procesamiento visual.

## Enlaces

- [HuggingFace: 26B-Suite/Xenon-26B-A4B-safetensors](https://huggingface.co/26B-Suite/Xenon-26B-A4B-safetensors)
- [HuggingFace: el4/Xenon-26B-A4B](https://huggingface.co/el4/Xenon-26B-A4B)
- [README.md de el4/Xenon-26B-A4B](https://huggingface.co/el4/Xenon-26B-A4B/blob/main/README.md)
- [Docker Hub: ai/gemma4-safetensors](https://hub.docker.com/r/ai/gemma4-safetensors)
- [Gemma 4 — Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [hfviewer: el4/Xenon-26B-A4B](https://hfviewer.com/el4/Xenon-26B-A4B)
