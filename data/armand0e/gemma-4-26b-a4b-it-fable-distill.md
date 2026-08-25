# armand0e/Gemma-4-26B-A4B-it-Fable-Distill

## Resumen

El modelo **armand0e/Gemma-4-26B-A4B-it-Fable-Distill** es un ajuste fino (finetune) del modelo base **google/gemma-4-26B-A4B-it**, desarrollado por el usuario armand0e. Se trata de un modelo multimodal (entrada de imagen y texto, salida de texto) con arquitectura de mezcla de expertos (MoE) que, según su nomenclatura, cuenta con 26 mil millones de parámetros totales y 4 mil millones activos. El finetune se realizó con las librerías Unsloth y TRL, y el nombre sugiere una destilación de un modelo denominado "Fable", aunque no se proporcionan detalles adicionales sobre el proceso.

Este modelo está pensado para tareas de conversación, generación de texto y razonamiento, y hereda las capacidades del modelo base de Google DeepMind, que incluye un contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas, aunque el finetune solo declara inglés. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. A pesar de ser un modelo reciente (creado en agosto de 2026), no cuenta con descargas ni valoraciones en Hugging Face, lo que indica que es un experimento de la comunidad más que un modelo ampliamente adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) multimodal (imagen-texto) |
| Parametros totales | 25.805.936.206 (aprox. 25,8B) |
| Parametros activos | 4B (según nomenclatura A4B, no confirmado) |
| Longitud de contexto | no disponible (el modelo base soporta 256K tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de Gemma 4, que combina capas densas y capas de mezcla de expertos para activar solo una fracción de los parámetros durante la inferencia. El modelo base, google/gemma-4-26B-A4B-it, fue entrenado por Google DeepMind con un enfoque multimodal, aceptando imágenes y texto como entrada. El finetune realizado por armand0e utilizó Unsloth para acelerar el entrenamiento (2x más rápido) y la librería TRL de Hugging Face. El nombre "Fable-Distill" indica que se empleó destilación de conocimiento desde un modelo llamado "Fable", aunque no se especifica qué modelo es ni qué datos se usaron. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de larga forma.
- Razonamiento y resolución de problemas complejos.
- Comprensión de imágenes (entrada multimodal) y generación de descripciones o respuestas basadas en ellas.
- Soporte de tool calling y function calling (heredado del modelo base, aunque no confirmado en este finetune).
- Capacidad para tareas de agente y razonamiento multi-paso.
- Multilingüismo limitado al inglés en este finetune, aunque el modelo base soporta más de 140 idiomas.
- No se confirma soporte de "thinking mode" ni de audio.

## Casos de uso

- **Asistente virtual para atención al cliente**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 256K tokens en el modelo base) y responder consultas en inglés, lo que lo hace adecuado para chatbots empresariales.
- **Generación de código en entornos de desarrollo**: gracias a su capacidad de razonamiento y tool calling, puede integrarse en pipelines de CI/CD para autocompletar código, generar documentación o revisar cambios.
- **Análisis de imágenes con texto**: al ser multimodal, puede procesar capturas de pantalla, diagramas o fotografías y generar explicaciones o resúmenes textuales, útil en soporte técnico o educación.
- **Creación de contenido editorial**: puede redactar artículos, guiones o resúmenes a partir de prompts en inglés, aprovechando su capacidad de generación de texto coherente.
- **Prototipado rápido de agentes conversacionales**: investigadores y desarrolladores pueden usarlo como base para experimentar con destilación o fine-tuning adicional, gracias a su licencia abierta y su tamaño manejable (4B activos).
- **Sistemas de razonamiento automatizado**: en tareas de lógica, matemáticas o planificación, el modelo puede ofrecer respuestas estructuradas, aunque no se dispone de benchmarks que confirmen su rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para este finetune específico. El modelo base google/gemma-4-26B-A4B-it podría tener resultados públicos, pero no se incluyen en la documentación proporcionada.

## Requisitos de hardware

- **VRAM estimada**: con 25,8B parámetros en FP16, el modelo requiere aproximadamente 51,6 GB de memoria (coincide con el tamaño del repositorio). Con cuantización de 4 bits, podría reducirse a unos 13-15 GB, lo que permitiría ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB).
- **GPUs recomendadas**: para inferencia sin cuantizar, se necesitan GPUs profesionales como A100 (80 GB) o H100 (80 GB). Con cuantización, una RTX 4090 o A6000 (48 GB) sería suficiente.
- **Opciones de despliegue**: al ser un modelo de transformers, puede servirse con vLLM, TGI (Text Generation Inference) o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se exporta a ese formato.
- **Latencia y throughput**: no se dispone de datos medidos. Al ser un MoE con solo 4B activos, la latencia por token debería ser menor que la de un modelo denso de 26B, pero depende del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| armand0e/Gemma-4-26B-A4B-it-Fable-Distill | 25,8B (4B activos) | no disponible (base: 256K) | Sí | Apache 2.0 | Hugging Face |
| google/gemma-4-26B-A4B-it | 26B (4B activos) | 256K | Sí | Apache 2.0 | Hugging Face |
| armand0e/gemma-4-26B-A4B-it-Claude-Opus-Distill | 25,8B (aprox.) | no disponible | Sí | Apache 2.0 | Hugging Face |
| Llama 3.1 8B (denso) | 8B | 128K | No | Llama 3.1 | Hugging Face |

La comparativa se basa en datos públicos de los modelos base; el finetune Fable-Distill no tiene métricas propias. Frente a un modelo denso como Llama 3.1 8B, este MoE ofrece más capacidad total pero con menos parámetros activos, lo que puede equilibrar rendimiento y eficiencia.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un finetune de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento de Gemma 4. No se ha evaluado específicamente este finetune.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en temas especializados.
- **Idioma limitado**: solo se declara inglés, a pesar de que el modelo base soporta muchos más idiomas. El finetune puede degradar el rendimiento en otros idiomas.
- **Contexto no confirmado**: aunque el modelo base soporta 256K tokens, no se ha verificado que este finetune mantenga esa longitud de contexto; podría haber sido reducida durante el entrenamiento.
- **Sin benchmarks**: no hay evidencia de rendimiento en tareas estándar, por lo que su uso en producción requiere evaluación previa.
- **Baja adopción**: con 0 descargas y 0 likes, es un modelo experimental sin validación de la comunidad.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero se debe atribuir el copyright y no se ofrece garantía.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/armand0e/Gemma-4-26B-A4B-it-Fable-Distill)
- [Modelo base google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Finetune similar: armand0e/gemma-4-26B-A4B-it-Claude-Opus-Distill](https://huggingface.co/armand0e/gemma-4-26B-A4B-it-Claude-Opus-Distill)
- [Página oficial de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Documentación de Gemma 4 26B A4B IT en Google Cloud](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it)
- [Precios y API en TokenRouter](https://www.tokenrouter.com/models/google/gemma-4-26b-a4b-it/)
