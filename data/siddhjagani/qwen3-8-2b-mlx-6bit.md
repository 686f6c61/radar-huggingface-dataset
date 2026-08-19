# SiddhJagani/Qwen3.8-2B-mlx-6Bit

## Resumen

SiddhJagani/Qwen3.8-2B-mlx-6Bit es una conversión al formato MLX del modelo empero-ai/Qwen3.8-2B, una versión destilada de la serie Qwen3.8 de Alibaba. El modelo original, Qwen3.8, es una familia de LLMs open source que incluye variantes de distintos tamaños, desde modelos pequeños hasta el gigante Qwen3.8-Max de 2,4 billones de parámetros. Esta conversión concreta está cuantizada a 6 bits y optimizada para ejecutarse en Apple Silicon mediante el framework MLX, lo que la hace adecuada para despliegues en dispositivos edge con recursos limitados.

A pesar de que el nombre sugiere 2B de parámetros, los pesos reales en safetensors suman 412 millones de parámetros, lo que indica que se trata de un modelo muy compacto, probablemente resultado de una destilación agresiva. La cuantización a 6 bits reduce aún más el tamaño del repositorio a 1,5 GB, permitiendo su uso en equipos con memoria moderada. El modelo está etiquetado con capacidades de razonamiento, function calling y entrenamiento supervisado (SFT), lo que lo posiciona como una opción ligera para tareas de conversación y automatización en entornos locales.

La relevancia de este modelo radica en su combinación de tamaño reducido, licencia Apache 2.0 y compatibilidad con MLX, lo que facilita la experimentación y el despliegue en hardware de Apple sin necesidad de infraestructura GPU dedicada. Es un ejemplo de la tendencia hacia modelos pequeños y eficientes que mantienen capacidades básicas de razonamiento y llamada a herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8, detalles exactos no disponibles) |
| Parametros totales | 412.077.888 (según safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (probablemente 32K como la serie Qwen3, pero no confirmado) |
| Tipos de cuantizacion | 6-bit (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX (conversión mediante mlx-lm) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la serie Qwen3.8, que según la documentación oficial se basa en el diseño de Qwen3.5, con mejoras en atención y eficiencia. Sin embargo, los detalles específicos de esta variante destilada (empero-ai/Qwen3.8-2B) no están publicados en la información disponible. Se sabe que el modelo ha pasado por un proceso de destilación (tag `distillation`) y entrenamiento supervisado (tag `sft`), lo que sugiere que se ha comprimido el conocimiento de un modelo más grande a un tamaño reducido, manteniendo capacidades de razonamiento y function calling.

El proceso de conversión a MLX se realizó con la librería mlx-lm versión 0.31.2, aplicando una cuantización de 6 bits. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La cuantización es posterior al entrenamiento y no afecta a la arquitectura, solo al almacenamiento y cálculo de los pesos.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para diálogo multi-turno, con soporte de chat template.
- Razonamiento básico: según las etiquetas, incluye capacidades de razonamiento, aunque limitadas por su tamaño reducido.
- Function calling / tool calling: soporta la invocación de herramientas externas, lo que permite integrarlo en agentes simples.
- Despliegue en edge: optimizado para MLX en Apple Silicon, con bajo consumo de memoria (1,5 GB).
- Multilingüismo: solo se declara inglés (tag `en`); no hay evidencia de soporte para otros idiomas.
- Compatibilidad con transformers: aunque el formato es MLX, el modelo base usa la librería transformers, lo que facilita su uso en entornos Python.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede ejecutarse en un MacBook o Mac Mini para gestionar chats privados sin conexión, aprovechando su bajo peso y la integración con MLX.
- Automatización de tareas con herramientas: gracias al function calling, puede usarse en scripts que requieran llamadas a APIs, consultas a bases de datos o control de dispositivos, todo en local.
- Prototipado rápido de agentes: su tamaño reducido permite iterar rápidamente en el desarrollo de agentes de IA antes de migrar a modelos más grandes.
- Educación y experimentación: ideal para aprender sobre cuantización, destilación y despliegue en Apple Silicon, dado su coste computacional mínimo.
- Generación de código simple: aunque no está especializado, puede asistir en tareas de programación básica, especialmente con el soporte de tool calling para ejecutar comandos.
- Filtrado y clasificación de texto: su capacidad de razonamiento puede aplicarse a tareas de análisis de sentimiento o extracción de entidades en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado que es una conversión cuantizada de un modelo destilado, es probable que su rendimiento sea inferior al de modelos más grandes de la misma familia, pero no hay datos objetivos para confirmarlo.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 1,5 GB, por lo que se necesita al menos 2 GB de RAM disponible para cargar el modelo en memoria. En Apple Silicon, MLX utiliza la memoria unificada.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de RAM unificada para un funcionamiento fluido.
- Compatibilidad con consumer GPU: no aplica, ya que MLX está diseñado para Apple Silicon; en otras plataformas se requeriría convertir los pesos a otro formato (por ejemplo, GGUF para llama.cpp).
- Opciones de despliegue: MLX (mediante `mlx-lm`), también puede cargarse con transformers si se convierten los pesos a safetensors estándar, aunque se pierde la optimización de 6 bits.
- Latencia y throughput: no se proporcionan datos específicos. En un Mac M1 con 8 GB, se espera una generación de aproximadamente 10-20 tokens por segundo para un modelo de 400M parámetros cuantizado, según referencias generales de MLX.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SiddhJagani/Qwen3.8-2B-mlx-6Bit | 412M | no disponible | Apache 2.0 | MLX 6-bit | Destilado, edge |
| Qwen3-2B (base) | ~2B | 32K | Apache 2.0 | safetensors | Modelo oficial, mayor capacidad |
| Llama-3.2-3B | 3.2B | 128K | Llama 3.2 | safetensors | Más grande, mejor rendimiento general |
| SmolLM2-1.7B | 1.7B | 8K | Apache 2.0 | safetensors | Similar en tamaño, enfocado a edge |

La comparativa se basa en características generales, no en benchmarks, ya que no hay datos publicados para el modelo evaluado. La ventaja principal de este modelo es su formato MLX y cuantización de 6 bits, que lo hacen muy ligero en Apple Silicon.

## Limitaciones y advertencias

- Tamaño reducido: con solo 412M parámetros, la capacidad de razonamiento complejo y generación de código avanzado es limitada; es probable que alucine en tareas de conocimiento factual.
- Idioma: solo soporta inglés, lo que restringe su uso en entornos multilingües.
- Contexto: no se especifica la longitud de contexto; si es la estándar de Qwen3 (32K), puede manejar conversaciones largas, pero no está confirmado.
- Sesgos: al ser un modelo destilado de Qwen3.8, puede heredar sesgos del modelo original, aunque no hay estudios específicos.
- Producción: la cuantización de 6 bits puede degradar la precisión en tareas numéricas o de razonamiento lógico; se recomienda validar en casos de uso concretos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base (empero-ai/Qwen3.8-2B) podría tener condiciones adicionales; se debe verificar su licencia.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/SiddhJagani/Qwen3.8-2B-mlx-6Bit
- Modelo base (empero-ai/Qwen3.8-2B): https://huggingface.co/empero-ai/Qwen3.8-2B
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de Qwen3.8-27B en HuggingFace (referencia de la serie): https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de ejecución de Qwen con MLX: https://qwen-ai.com/run-qwen-mlx/
- Artículo sobre Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
