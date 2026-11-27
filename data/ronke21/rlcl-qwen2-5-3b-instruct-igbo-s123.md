# ronke21/rlcl-Qwen2.5-3B-Instruct-igbo-s123

## Resumen

`ronke21/rlcl-Qwen2.5-3B-Instruct-igbo-s123` es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct, publicado por el usuario ronke21 en Hugging Face. El nombre del repositorio sugiere que se ha aplicado una técnica denominada RLCL (probablemente "Reinforcement Learning with Contrastive Learning" o una variante similar, aunque la información disponible no lo confirma) sobre el modelo base, con el objetivo de mejorar el rendimiento en igbo, una lengua minoritaria de Nigeria. El sufijo "s123" podría indicar una semilla o un paso de entrenamiento concreto, pero no se dispone de documentación que lo aclare.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-3B-Instruct, con 3.085.938.688 parámetros totales según los pesos en safetensors. Al estar construido sobre Qwen2.5, hereda las capacidades del modelo base: generación de texto, razonamiento, código y matemáticas, además de un contexto nativo de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5). El ajuste fino se ha realizado mediante LoRA y posteriormente se han fusionado los pesos (tag `lora-merged`), lo que facilita el despliegue con transformers estándar.

La relevancia de este modelo radica en su enfoque en una lengua de bajos recursos como el igbo, un área donde los modelos grandes suelen tener un rendimiento deficiente. Sin embargo, la ausencia de documentación, benchmarks y la licencia no especificada limitan seriamente su uso en producción. El acceso está restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha del modelo (el base Qwen2.5-3B-Instruct soporta 32.768 tokens nativos, ampliable a 131.072) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar a GGUF/AWQ/GPTQ con herramientas externas) |
| Idiomas soportados | no disponible (el nombre sugiere igbo; el base soporta múltiples idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-3B-Instruct, un transformer decoder-only con 3.085 millones de parámetros, atención por ventanas deslizantes combinada con atención completa, y normalización RMSNorm. Qwen2.5-3B-Instruct fue entrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias humanas (RLHF/DPO). La información disponible no detalla la composición exacta del dataset de preentrenamiento del base.

El ajuste fino realizado por ronke21 se presenta bajo la etiqueta `rlcl`, que podría corresponder a una técnica de aprendizaje por refuerzo con aprendizaje contrastivo, aunque no se aporta paper ni descripción. Se ha utilizado LoRA y los pesos se han fusionado posteriormente (`lora-merged`), lo que implica que el modelo resultante es un checkpoint completo listo para inferencia con transformers. No se especifican el número de tokens de entrenamiento, la composición del dataset en igbo ni si se aplicaron técnicas adicionales como decodificación especulativa o atención lineal. El sufijo `s123` no está documentado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-3B-Instruct.
- Razonamiento y resolución de problemas matemáticos de nivel medio.
- Generación de código en lenguajes populares (Python, JavaScript, etc.) y soporte de tool calling / function calling (capacidad del base Qwen2.5).
- Capacidades multilingües del modelo base, con un posible refuerzo en igbo (no verificado).
- Soporte de agentes y razonamiento multi-paso, siempre que se use con el formato de chat adecuado de Qwen2.5.
- No se ha confirmado soporte de visión, audio ni modo "thinking" explícito.

## Casos de uso

- **Procesamiento de lenguaje natural en igbo**: el modelo podría emplearse para tareas de generación y comprensión de texto en igbo, como traducción, resumen o respuesta a preguntas, aprovechando el ajuste específico. Sin embargo, la falta de benchmarks impide garantizar su calidad frente al base.
- **Atención al cliente en lenguas minoritarias**: con 3.000 millones de parámetros y un contexto de hasta 32.768 tokens (heredado del base), puede gestionar conversaciones multi-turno en igbo o en inglés con salpicaduras de igbo, aunque la licencia incierta limita su uso comercial.
- **Generación de código asistida**: al conservar las capacidades de Qwen2.5-3B-Instruct, puede integrarse en editores o pipelines de CI/CD para autocompletar código, generar tests o explicar fragmentos, con un coste de inferencia bajo.
- **Prototipado rápido de chatbots**: su tamaño (3B) permite desplegarlo en una GPU de consumo (por ejemplo, RTX 3060 de 12 GB en cuantización de 8 bits) para experimentar con asistentes conversacionales en entornos de investigación.
- **Investigación en olvido catastrófico**: la etiqueta `forgetting` sugiere que el modelo se ha utilizado para estudiar la pérdida de capacidades del base tras el ajuste fino en una lengua específica; puede servir como caso de estudio en experimentos de continual learning.
- **Análisis de sentimiento y clasificación de texto en igbo**: con un ajuste adicional ligero (por ejemplo, un clasificador sobre las representaciones), podría aplicarse a moderación de contenido o análisis de opiniones en redes sociales nigerianas.
- **Educación y preservación lingüística**: generación de material didáctico o respuestas en igbo para plataformas de aprendizaje de lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - FP16/BF16: ~6,2 GB solo para pesos, más overhead de activaciones y KV cache; se recomiendan 10-12 GB.
  - INT8: ~3,1 GB de pesos; cabe en GPUs de 6-8 GB.
  - INT4 (GPTQ/AWQ/GGUF Q4): ~1,8-2,2 GB; cabe en GPUs de 4-6 GB.
- **GPU recomendadas**:
  - NVIDIA A100/H100 para despliegues de alta concurrencia con vLLM o TGI.
  - RTX 4090 (24 GB) para inferencia en FP16 con contexto largo.
  - RTX 3090/4080 (16-24 GB) para FP16 o INT8.
  - RTX 3060 12 GB, RTX 4060 Ti 16 GB o incluso GTX 1660 6 GB en cuantización INT4.
- **Opciones de despliegue**: transformers (nativo), vLLM, Text Generation Inference (TGI), llama.cpp (requiere convertir a GGUF), Ollama (previa conversión), LM Studio.
- **Latencia y throughput estimados**: no disponibles. Para un modelo de 3B en una RTX 4090 con FP16, se puede esperar un throughput del orden de decenas de tokens por segundo, pero no se aportan medidas concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-3B-Instruct-igbo-s123 | 3,09 B | no disponible (base: 32.768) | no disponible | gated en HF | Ajuste en igbo, sin benchmarks |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 (ampliable a 131.072) | Apache 2.0 | pública en HF | Modelo base, benchmarks publicados |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 131.072 | Llama 3.2 Community License | gated en HF | Alternativa de tamaño similar, buen multilingüe |
| google/gemma-2-2b-it | 2,61 B | 8.192 | Gemma Terms of Use | gated en HF | Menor contexto, buen rendimiento en inglés |

La comparativa se basa en datos públicos de los modelos base; no se dispone de métricas del modelo ajustado.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia, lo que impide determinar si el uso comercial está permitido. Se debe contactar con el autor o asumir que no hay permiso explícito.
- **Acceso restringido (gated)**: requiere aceptar condiciones en Hugging Face, lo que puede retrasar la integración en pipelines automatizados.
- **Ausencia de documentación**: no hay model card detallada, ni descripción del dataset, ni hiperparámetros de entrenamiento, lo que dificulta la reproducibilidad.
- **Riesgo de olvido catastrófico**: la etiqueta `forgetting` sugiere que el ajuste en igbo puede haber degradado capacidades del base en otros idiomas o tareas; no se han publicado evaluaciones.
- **Sesgos y alucinaciones**: al ser un ajuste de Qwen2.5-3B-Instruct, hereda los sesgos del base y el riesgo de alucinación, especialmente en una lengua de bajos recursos donde los datos de entrenamiento son escasos.
- **Idiomas no confirmados**: no se especifica qué idiomas soporta realmente; el nombre indica igbo, pero no hay garantía de un rendimiento equilibrado.
- **Contexto no verificado**: aunque el base soporta 32.768 tokens, no se confirma que el ajuste conserve esa ventana; podría haberse truncado durante el entrenamiento.
- **Sin benchmarks**: imposible comparar su rendimiento con alternativas de forma objetiva.
- **Fecha de creación futura**: el repositorio indica 2026-11-27, lo que puede ser un error de metadatos o una fecha programada; conviene verificar la integridad del modelo.

## Enlaces

- [Hugging Face: ronke21/rlcl-Qwen2.5-3B-Instruct-igbo-s123](https://huggingface.co/ronke21/rlcl-Qwen2.5-3B-Instruct-igbo-s123)
- [Modelo base: Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- [Paper de Qwen2.5 (arXiv:2412.15115)](https://arxiv.org/abs/2412.15115)
- [Repositorio de Qwen2.5 en GitHub](https://github.com/QwenLM/Qwen2.5)
- [Documentación de transformers para Qwen2](https://huggingface.co/docs/transformers/model_doc/qwen2)
