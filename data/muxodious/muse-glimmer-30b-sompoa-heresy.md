# MuXodious/Muse-Glimmer-30B-SOMPOA-heresy

## Resumen

Muse-Glimmer-30B-SOMPOA-heresy es un ajuste fino del modelo multimodal Muse-Glimmer-30B de Meta, desarrollado por MuXodious mediante el motor de abliteración Heretic (v1.4.0) de P-E-W, con la técnica Self-Organizing Maps & Magnitude-Preserving Orthogonal Ablation (SOMPOA) habilitada. La abliteración elimina las direcciones de rechazo aprendidas durante el alineamiento, produciendo un modelo que responde sin censura a peticiones que el modelo base rechazaría.

El modelo conserva las capacidades del base: procesamiento de texto e imágenes, razonamiento paso a paso, soporte para agentes y tool use, y entrenamiento en más de 100 idiomas. Con 29.776.626.688 parámetros, está pensado para ejecutarse en una sola GPU de gama alta. Su relevancia radica en ofrecer una alternativa "uncensored" de 30B con licencia Apache 2.0, útil para investigación en alineación, generación creativa sin restricciones y entornos controlados donde se requiere explorar contenido sensible.

Sin embargo, el autor advierte que el modelo aún mantiene alineación residual en su proceso de pensamiento, que los pesos de ablación en las capas MLP son "menos que ideales", y que se necesitan prompts de jailbreak o plantillas de chat específicas para lograr generaciones completamente sin censura. No se han publicado resultados de benchmarks más allá de PIQA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Muse-Glimmer-30B |
| Parametros totales | 29.776.626.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Mas de 100 idiomas (segun documentacion de Meta para Muse-Glimmer) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base, Muse-Glimmer-30B, es un transformer multimodal de Meta que procesa texto e imagenes, destilado de Muse Spark y optimizado para flujos de trabajo de agentes locales. Incluye capacidades de tool use, manejo de tareas largas y recuperacion de fallos, asi como un modo de "esfuerzo controlable" que permite ajustar la intensidad del razonamiento.

El ajuste fino se realizo con el motor Heretic v1.4.0, que aplica abliteracion ortogonal con preservacion de magnitud y mapas autoorganizados (SOMPOA). Este proceso identifica y elimina direcciones en el espacio de pesos asociadas con comportamientos de rechazo. Los resultados de la hereticacion muestran una reduccion de rechazos de 102/104 a 4/104, con una divergencia KL de 0.0696 respecto al modelo original. No se han proporcionado detalles sobre el dataset de entrenamiento adicional ni sobre el proceso de fine-tuning mas alla de la abliteracion.

## Capacidades

- Procesamiento multimodal: acepta entradas de texto e imagenes y genera respuestas textuales.
- Generacion de texto sin censura: la abliteracion reduce drasticamente los rechazos, permitiendo respuestas a peticiones que el modelo base rechazaria.
- Razonamiento paso a paso: el modelo razona internamente antes de responder, aunque el autor indica que conserva parte de la alineacion en ese proceso interno.
- Soporte para agentes y tool use: compatible con orquestadores como OpenClaw y Hermes Agent, y disenado para tareas de agente con recuperacion de fallos.
- Multilingue: entrenado en mas de 100 idiomas.
- Esfuerzo controlable: permite seleccionar entre diferentes niveles de razonamiento para equilibrar calidad y velocidad.
- Personalizable mediante prompts: el autor proporciona un jailbreak prompt y una plantilla de chat para mitigar la alineacion residual y lograr generaciones completamente sin restricciones.

## Casos de uso

- Generacion de ficcion y narrativa adulta: el modelo puede escribir relatos, dialogos y guiones sin las restricciones habituales de los modelos alineados, gracias a su baja tasa de rechazos.
- Investigacion en alineacion y seguridad de IA: permite estudiar el comportamiento de un modelo sin censura en entornos controlados, comparando respuestas antes y despues de la abliteracion.
- Desarrollo de agentes locales para entornos de pruebas: su soporte para tool use y razonamiento paso a paso lo hace util para prototipar agentes que necesitan responder a instrucciones sensibles sin filtros.
- Creacion de chatbots personalizados sin moderacion: se puede desplegar como backend de asistentes conversacionales donde el usuario controla el contenido, usando los jailbreak prompts proporcionados.
- Analisis de contenido sensible en investigacion academica: util para analisis de textos o generacion de ejemplos en estudios sobre sesgos, toxicidad o censura en modelos de lenguaje.
- Generacion de datos sinteticos para entrenamiento: puede producir ejemplos de conversaciones o textos que otros modelos rechazarian, utiles para fine-tuning o evaluacion de robustez.

## Benchmarks y rendimiento

La unica evaluacion publicada corresponde al benchmark PIQA (Physical Interaction Question Answering), comparando algunos trials de la hereticacion con el modelo original:

| Modelo / Trial | acc | acc_norm |
|---|---|---|
| Original Muse-Glimmer-30B | 0.8221 | 0.8292 |
| Trial 313 (seleccionado) | 0.8232 | 0.8330 |
| Trial 289 | 0.8226 | 0.8319 |
| Trial 171 | 0.8226 | No disponible |

No se han publicado resultados para otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El rendimiento en PIQA es practicamente identico al del modelo base, lo que sugiere que la abliteracion no degrada significativamente esta tarea, pero se requieren mas evaluaciones para confirmar el impacto general.

## Requisitos de hardware

- VRAM estimada: 59.2 GB segun LLM Explorer para el modelo completo en precision nativa (probablemente bf16/fp16). Con cuantizacion (por ejemplo, 4-bit) podria reducirse a ~15-20 GB, pero no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: una GPU con al menos 60 GB de VRAM, como NVIDIA A100 80GB, H100 80GB o A6000 48GB (con cuantizacion). No cabe en GPUs de consumo estandar (RTX 3090/4090 de 24 GB) sin cuantizacion.
- Opciones de despliegue: compatible con Transformers, vLLM, TGI y otros runtime que soporten safetensors. Si se convierte a GGUF, podria usarse con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Censura | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-SOMPOA-heresy | 29.8B | No disponible | Apache 2.0 | Sin censura (abliterado) | HuggingFace |
| Muse-Glimmer-30B (Meta) | 29.8B | No disponible | Apache 2.0 | Con censura | HuggingFace, Meta |
| Dolphin 2.9.1 Llama 3.1 8B | 8B | 128K | Apache 2.0 | Sin censura | HuggingFace |

No se dispone de datos de comparacion directa de rendimiento con otros modelos "uncensored" en la informacion proporcionada. La comparativa se limita a caracteristicas generales.

## Limitaciones y advertencias

- El modelo conserva alineacion residual en su proceso de pensamiento interno, lo que puede generar respuestas parcialmente censuradas si no se usan los jailbreak prompts proporcionados.
- Los pesos de ablacion en las capas MLP son "menos que ideales" segun el autor, lo que podria afectar a la calidad de ciertas generaciones.
- Riesgo de alucinacion y generacion de contenido danino, ilegal o eticamente problematico: al ser un modelo sin censura, no hay barreras de seguridad ante peticiones peligrosas.
- No se han publicado evaluaciones extensas (MMLU, HumanEval, etc.), por lo que se desconoce el impacto real de la abliteracion en tareas generales.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir la legislacion aplicable.
- El modelo es "bastante terco" segun el autor, requiriendo prompts cuidadosamente disenados para obtener respuestas completamente sin restricciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MuXodious/Muse-Glimmer-30B-SOMPOA-heresy
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Pull request de SOMPOA: https://github.com/p-e-w/heretic/pull/196
- Pagina de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Documentacion API de Muse Glimmer: https://dev.meta.ai/docs/muse-glimmer
- Ficha en LLM Explorer: https://llm-explorer.com/model/MuXodious%2FMuse-Glimmer-30B-SOMPOA-heresy,37EK6iM9ZZaMbNSOMUIsNL
- Jailbreak system prompt: https://huggingface.co/MuXodious/Muse-Glimmer-30B-SOMPOA-heresy/blob/main/jailbreak-system-prompt.txt
- Jailbreak chat template: https://huggingface.co/MuXodious/Muse-Glimmer-30B-SOMPOA-heresy/blob/main/muse-jailbreak-chat_template.jinja
