# Agreem/dlnb-ai-trainer

## Resumen

El modelo `Agreem/dlnb-ai-trainer` es un ajuste fino (fine-tune) del checkpoint `AgreemSrivastava/fitness-qwen-0.5b`, que a su vez se basa en la arquitectura Qwen2.5-0.5B. Desarrollado por Agreem, este modelo está diseñado para alimentar el chatbot de la aplicación de fitness DLNB, proporcionando respuestas conversacionales en el contexto de entrenamiento físico y bienestar. El ajuste se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face.

Con aproximadamente 494 millones de parámetros, el modelo se sitúa en la gama de modelos compactos, lo que permite su despliegue en infraestructura modesta. Según el repositorio de GitHub asociado, el modelo se sirve a través de la Hugging Face Serverless Inference API mediante un servicio Flask, lo que facilita su integración en aplicaciones móviles o web. Su relevancia radica en demostrar un flujo completo de fine-tuning y despliegue para un caso de uso vertical (fitness) sobre un modelo base de tamaño reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B) |
| Parametros totales | 494.032.768 (~494M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-0.5B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-0.5B, un transformer decoder-only de 494 millones de parámetros. El proceso de entrenamiento consistió en un Supervised Fine-Tuning (SFT) realizado con la librería TRL (Transformers Reinforcement Learning) de Hugging Face, partiendo del checkpoint intermedio `AgreemSrivastava/fitness-qwen-0.5b`. Las versiones de framework utilizadas fueron TRL 1.10.0, Transformers 5.15.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni la composición de los datos. Tampoco se especifica si se aplicaron técnicas adicionales como RLHF o DPO; la model card únicamente menciona el entrenamiento con SFT.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno, como demuestra el ejemplo de la model card con una pregunta sobre máquinas del tiempo.
- Respuestas contextuales de fitness: al estar fine-tuneado sobre un modelo orientado a fitness, el modelo está adaptado para responder consultas relacionadas con entrenamiento, ejercicio y bienestar.
- Integración con API: el repositorio de GitHub muestra su despliegue como servicio Flask que consume la Hugging Face Serverless Inference API, lo que facilita su uso desde aplicaciones externas.
- Compatible con el pipeline de text-generation de Transformers, permitiendo su uso directo con la clase `pipeline` de Hugging Face.
- Soporte de formato conversacional: el ejemplo de uso emplea mensajes con roles (`user`), lo que indica compatibilidad con el formato de chat de Transformers.

## Casos de uso

- Chatbot de aplicación de fitness: el caso de uso principal, tal como se implementa en el repositorio `dlnb_Ai_Service`. El modelo responde a consultas de usuarios sobre rutinas de ejercicio, nutrición y motivación dentro de la app DLNB.
- Asistente conversacional ligero: gracias a su tamaño reducido (~494M parámetros), puede desplegarse en infraestructura de bajo coste o en la Serverless Inference API de Hugging Face, sirviendo respuestas en tiempo real a usuarios finales.
- Prototipado rápido de chatbots verticales: el flujo de fine-tuning documentado (SFT con TRL sobre Qwen2.5-0.5B) sirve como plantilla para crear asistentes especializados en otros dominios (salud, educación, finanzas) con recursos limitados.
- Generación de respuestas en aplicaciones móviles: el servicio Flask expone una API REST que puede ser consumida desde apps iOS o Android, permitiendo integrar el modelo como backend conversacional.
- Evaluación de fine-tuning en modelos pequeños: útil como caso de estudio para investigar el impacto del SFT en modelos de menos de 1B de parámetros, comparando el rendimiento antes y después del ajuste.
- Automatización de respuestas en comunidades de fitness: el modelo puede integrarse en foros, grupos de Telegram o Discord para responder preguntas frecuentes sobre entrenamiento, reduciendo la carga de moderadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 (494M parámetros × 2 bytes), ~0,5 GB en INT8 y ~0,25 GB en INT4.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 3060, RTX 4060 o superiores pueden ejecutar el modelo sin problemas.
- Compatibilidad con GPU de consumo: sí, el modelo cabe holgadamente en cualquier GPU consumer moderna, e incluso puede ejecutarse en CPU con cuantización.
- Opciones de despliegue: Hugging Face Serverless Inference API (usada en el proyecto original), Transformers con `pipeline`, vLLM, llama.cpp, Ollama o Text Generation Inference (TGI).
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 0,5B en una GPU moderna, se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo, pero estos valores no están confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Agreem/dlnb-ai-trainer | 494M | No disponible | No disponible | Fine-tune SFT para fitness |
| Qwen2.5-0.5B (base) | 494M | 32K (conocido del modelo base) | Apache 2.0 | Modelo base sin fine-tune |
| Llama 3.2 1B | 1.230M | 128K | Llama 3.2 Community License | Modelo generalista de tamaño similar |
| Gemma 2 2B | 2.610M | 8K | Gemma Terms of Use | Modelo generalista de Google |

Nota: los datos de contexto y licencia de los modelos comparados provienen del conocimiento público de dichos modelos, no de la información proporcionada para `dlnb-ai-trainer`.

## Limitaciones y advertencias

- Tamaño reducido: con solo 494M parámetros, el modelo tiene una capacidad limitada de razonamiento complejo y puede generar respuestas incoherentes en dominios fuera de su especialización.
- Licencia no especificada: la model card indica "licence: license" y la página de Hugging Face muestra "no disponible". Esto genera incertidumbre sobre las restricciones de uso comercial. Se recomienda contactar al autor antes de usar el modelo en producción.
- Sin datos de benchmarks: no se han publicado evaluaciones estándar, por lo que no es posible verificar su rendimiento real en tareas de razonamiento, código o matemáticas.
- Riesgo de alucinación: como cualquier modelo de lenguaje pequeño, puede inventar información, especialmente en temas de salud y fitness donde las respuestas incorrectas podrían ser perjudiciales.
- Idiomas no especificados: no se indica qué idiomas soporta el modelo. Aunque el modelo base Qwen2.5 es multilingüe, el fine-tune podría haber reducido su cobertura lingüística.
- Dependencia del modelo base: el rendimiento final está limitado por el checkpoint intermedio `fitness-qwen-0.5b`, del cual no se dispone de documentación detallada sobre su proceso de entrenamiento.
- Sin soporte de tool calling documentado: no se menciona soporte para function calling ni capacidades de agente, por lo que su uso en pipelines automatizados complejos no está garantizado.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Agreem/dlnb-ai-trainer
- Repositorio GitHub del servicio: https://github.com/agreem-srivastava-dev/dlnb_Ai_Service
- Modelo base intermedio: https://huggingface.co/AgreemSrivastava/fitness-qwen-0.5b
- Librería TRL: https://github.com/huggingface/trl
