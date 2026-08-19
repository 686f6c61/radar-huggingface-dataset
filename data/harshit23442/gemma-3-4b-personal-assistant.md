# harshit23442/Gemma-3-4B-Personal-Assistant

## Resumen

Gemma-3-4B-Personal-Assistant es un ajuste fino del modelo base `google/gemma-3-4b-it` de Google, realizado por el usuario harshit23442 mediante QLoRA sobre el dataset conversacional OpenAssistant/oasst1. El objetivo es mejorar el comportamiento del modelo como asistente personal en tareas de conversación, seguimiento de instrucciones, respuesta a preguntas, asistencia de código y resumen, manteniendo la arquitectura multimodal original (texto e imagen) del modelo base.

El modelo conserva los aproximadamente 4.300 millones de parámetros del Gemma 3 4B IT, de los cuales solo unos 29,8 millones fueron entrenables durante el ajuste fino. El entrenamiento se realizó con 300 ejemplos de entrenamiento y 188 de validación, una sola época y una longitud máxima de secuencia de 2048 tokens. El adaptador LoRA resultante se fusionó con el modelo base para producir un modelo independiente en formato Safetensors.

La relevancia de este modelo radica en su bajo coste de entrenamiento (técnica QLoRA) y su disponibilidad como alternativa ligera para aplicaciones de asistente conversacional en entornos con recursos limitados, aunque su utilidad práctica está condicionada por el pequeño volumen de datos de ajuste y la ausencia de evaluaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), basada en Gemma 3 4B IT |
| Parametros totales | ~4,33 mil millones (4.33B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (secuencia maxima de entrenamiento); el modelo base soporta 32k, pero no se especifica el contexto de inferencia |
| Tipos de cuantizacion | No disponible (el modelo se publica en bfloat16; se puede cuantizar posteriormente) |
| Idiomas soportados | No disponible (el modelo base Gemma 3 soporta multiples idiomas, pero no se detalla en la model card) |
| Licencia | Gemma (licencia de Google para la familia Gemma) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 4B IT de Google, un transformer decoder-only con capacidad multimodal (procesa texto e imagenes). El ajuste fino se realizo con QLoRA (Quantized Low-Rank Adaptation), que combina cuantizacion de 4 bits con adaptadores de bajo rango. Durante el entrenamiento, el modelo base permanecio congelado y solo se actualizaron aproximadamente 29,8 millones de parametros (menos del 1% del total). El proceso incluyo reconstruccion de conversaciones a partir del dataset OpenAssistant/oasst1, formateo con la plantilla de chat de Gemma 3, cuantizacion de 4 bits, acumulacion de gradientes, gradient checkpointing y supervisado con TRL. Tras el entrenamiento, el adaptador LoRA se fusiono con el modelo base para generar el modelo final.

El dataset de entrenamiento es una seleccion reconstruida de OpenAssistant/oasst1, un corpus humano de conversaciones multi-turno con metadatos de preferencias, distribuido bajo licencia Apache 2.0. Se utilizaron 300 ejemplos de entrenamiento y 188 de validacion, con una sola epoca. No se menciona el uso de RLHF ni DPO; el entrenamiento fue exclusivamente de supervisado (SFT).

## Capacidades

- Generacion de texto conversacional: mantiene dialogos multi-turno y responde de forma coherente en contextos de asistente.
- Seguimiento de instrucciones: capaz de ejecutar tareas simples descritas en lenguaje natural.
- Respuesta a preguntas generales: responde consultas factuales y de conocimiento comun dentro de los limites del modelo base.
- Asistencia de codigo: puede generar fragmentos de codigo y explicar soluciones, heredado del modelo base Gemma 3.
- Resumen de texto: condensa documentos o conversaciones en resumenes breves.
- Capacidad multimodal heredada: al estar basado en Gemma 3 4B IT, el modelo puede procesar imagenes junto con texto, aunque el ajuste fino se centro en datos textuales.
- No se documenta soporte explicito para tool calling, function calling ni modo agente.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en un equipo personal para mantener conversaciones de ayuda general, aprovechando su tamano reducido (4.3B) y su formato Safetensors compatible con Transformers.
- Prototipado rapido de chatbots: gracias a su entrenamiento con QLoRA, es adecuado para experimentar con pipelines de chat en entornos de investigacion sin necesidad de GPUs de gran capacidad.
- Generacion de codigo en entornos educativos: puede usarse para generar ejemplos de codigo o explicar conceptos de programacion en clases o tutoriales, aunque su rendimiento no esta validado.
- Resumen de conversaciones o documentos: util para condensar hilos de chat o articulos en aplicaciones de productividad, con la limitacion de 2048 tokens de contexto.
- Asistente de preguntas frecuentes: puede integrarse en sistemas de atencion al cliente para responder consultas estandar, siempre que se valide su precision.
- Experimentacion con tecnicas PEFT: sirve como ejemplo de referencia para estudiar el impacto del ajuste fino con QLoRA sobre un modelo base multimodal, comparando el comportamiento antes y despues del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Se recomienda evaluar el modelo en tareas especificas antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo en bfloat16 (formato publicado), se requieren aproximadamente 8,6 GB de VRAM para los pesos (4.33B x 2 bytes). Con cuantizacion de 4 bits, la VRAM se reduce a unos 2,2 GB, aunque no se proporcionan archivos cuantizados.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, RTX 4090) para inferencia en bfloat16 sin offload. Para cuantizacion de 4 bits, una GPU de 6-8 GB (RTX 3060, RTX 4060) seria suficiente.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de consumo con 8 GB o mas si se cuantiza.
- Opciones de despliegue: compatible con Hugging Face Transformers (carga directa con `Gemma3ForConditionalGeneration`), y potencialmente con vLLM, llama.cpp u Ollama si se convierten los pesos a GGUF, aunque no se proporcionan dichos formatos.
- Latencia y throughput: no disponibles. Se estima una generacion de 20-40 tokens por segundo en una RTX 4090 con cuantizacion de 4 bits, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-3-4B-Personal-Assistant (este) | 4.33B | 2048 (entrenamiento) | Gemma | Safetensors | Ajuste fino QLoRA sobre Gemma 3 4B IT |
| google/gemma-3-4b-it (base) | 4.33B | 32k | Gemma | Safetensors | Modelo original multimodal, sin ajuste conversacional especifico |
| Llama 3.2 3B (Meta) | 3.2B | 128k | Llama 3.2 | Safetensors, GGUF | Modelo denso, sin multimodalidad, amplia comunidad |
| Qwen 2.5 3B (Alibaba) | 3.1B | 32k | Apache 2.0 | Safetensors, GGUF | Modelo denso, buen rendimiento en tareas de codigo y razonamiento |

La comparativa se basa en caracteristicas estructurales, ya que no hay benchmarks publicados para este ajuste fino. El modelo base Gemma 3 4B IT ofrece mayor contexto (32k) y capacidades multimodales, mientras que este ajuste fino reduce el contexto efectivo a 2048 tokens durante el entrenamiento, aunque en inferencia podria extenderse si se respeta el limite del modelo base.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un ajuste fino sobre un modelo base no alineado con tecnicas avanzadas (solo SFT), puede heredar sesgos del dataset OASST1 y del propio Gemma 3, y generar respuestas inventadas o incorrectas en temas especializados.
- Contexto limitado: el entrenamiento se realizo con secuencias de 2048 tokens, lo que puede degradar el rendimiento en conversaciones largas o documentos extensos, aunque el modelo base soporta 32k.
- Volumen de datos reducido: solo 300 ejemplos de entrenamiento, lo que limita la generalizacion y puede provocar sobreajuste a los patrones del subconjunto seleccionado.
- Sin evaluacion publicada: no hay benchmarks ni pruebas de robustez, por lo que su rendimiento en tareas reales es incierto.
- Licencia Gemma: la licencia de Google para Gemma permite uso comercial, pero incluye restricciones de uso (por ejemplo, no usarlo para generar contenido ilegal o dañino) y requiere mantener el aviso de atribucion. Es necesario revisar los terminos completos antes de un despliegue comercial.
- Multimodalidad no validada: aunque el modelo base es image-text-to-text, el ajuste fino se hizo solo con texto, por lo que el rendimiento con imagenes puede no haber sido optimizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harshit23442/Gemma-3-4B-Personal-Assistant
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenAssistant/oasst1
