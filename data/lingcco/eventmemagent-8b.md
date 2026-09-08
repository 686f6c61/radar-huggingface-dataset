# lingcco/EventMemAgent-8B

## Resumen

EventMemAgent-8B es un modelo de visión-lenguaje (VLM) diseñado para la comprensión de vídeo en línea, desarrollado por el equipo de lingcco. Se presenta como un agente activo que combina una memoria jerárquica centrada en eventos con herramientas adaptativas de recuperación, OCR y detección de objetos. El modelo resuelve el problema de entender vídeos largos y en streaming sin perder información relevante, segmentando la secuencia en eventos y manteniendo un recuerdo selectivo de lo ocurrido.

La arquitectura parte del modelo Qwen3-VL-8B-Instruct como política base, al que se le añade un sistema de memoria de doble capa: una memoria a corto plazo que detecta límites de eventos y aplica muestreo por reservorio, y una memoria a largo plazo que archiva observaciones pasadas evento por evento. El modelo tiene un total de 8.767.123.696 parámetros, fue entrenado con 10.000 muestras de MovieChat anotadas mediante VideoMarathon y utiliza aprendizaje por refuerzo multi-turno (GRPO). Su relevancia actual radica en la creciente demanda de sistemas de IA capaces de procesar vídeo en tiempo real con memoria persistente, una tarea todavía poco resuelta en el ámbito de los agentes multimodales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-8B-Instruct (transformer multimodal, imagen-texto a texto) con memoria jerárquica de eventos y herramientas adaptativas |
| Parametros totales | 8.767.123.696 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EventMemAgent-8B es un fine-tuning de Qwen3-VL-8B-Instruct que actúa como política de un agente de vídeo en línea. El sistema completo incluye un modelo Qwen3-VL-4B-Instruct congelado que genera descripciones de eventos y un modelo Qwen3-Embedding-0.6B para calcular embeddings de eventos y consultas. La política principal decide cuándo recuperar información de la memoria y cuándo invocar herramientas externas: Grounding DINO para detección de objetos y Deepseek-OCR para reconocimiento de texto. La entrada de vídeo se muestrea a 1 FPS por defecto y la capacidad máxima de la memoria a corto plazo es de 32 eventos.

El entrenamiento se realizó sobre un conjunto de 10.000 muestras de MovieChat anotadas por VideoMarathon, empleando GRPO multi-turno con grupo de tamaño 8, batch global de 64, minibatch PPO de 32 y microbatch por GPU de 1. Se usó AdamW con tasa de aprendizaje 1e-6, cinco pasos de warmup, una sola época y sin pérdida KL. Los límites de prompt y respuesta se fijaron en 8192 tokens cada uno, con un máximo de diez turnos de asistente. El checkpoint publicado corresponde al actor combinado de la ejecución `1-30_8B`, paso 150, en formato estándar de Hugging Face. La principal innovación técnica es la combinación de memoria jerárquica de eventos con selección adaptativa de herramientas, que permite gestionar vídeos largos de forma eficiente sin depender de una ventana de contexto enorme.

## Capacidades

- Comprensión de vídeo en línea (streaming), procesando secuencias de vídeo muestreadas a 1 FPS y detectando límites de eventos en tiempo real.
- Memoria a corto y largo plazo: retiene información de eventos recientes y pasados, permitiendo responder preguntas sobre contenido visto mucho antes dentro de la misma sesión.
- Uso adaptativo de herramientas: invoca automáticamente Deepseek-OCR para leer texto en pantalla y Grounding DINO para detectar objetos cuando la tarea lo requiere.
- Razonamiento multi-turno conversacional, con capacidad para mantener hasta diez turnos de asistente durante una interacción.
- Generación de descripciones de eventos y diálogo sobre vídeos, especialmente entrenado en muestras de películas (MovieChat).
- Integración en pipelines de agentes: el modelo funciona como módulo de decisión dentro de un sistema mayor que gestiona la memoria y los servicios de percepción.

## Casos de uso

- Análisis de vídeo en tiempo real para retransmisiones: el modelo procesa vídeo en streaming a 1 FPS, segmenta eventos y responde preguntas en directo, útil para comentarios automáticos o análisis deportivo.
- Vigilancia inteligente con detección de objetos: gracias a la integración con Grounding DINO, puede identificar personas u objetos relevantes y mantener un registro de sus movimientos en la memoria de eventos.
- Asistente para revisión de grabaciones largas: un usuario puede preguntar «¿qué ocurrió después de la reunión?» y el modelo recupera los eventos relevantes de la memoria a largo plazo sin necesidad de volver a ver el vídeo completo.
- Extracción de información de vídeos con texto en pantalla: mediante Deepseek-OCR, el modelo lee rótulos, subtítulos o documentos mostrados en el vídeo, lo que resulta útil para analizar presentaciones o tutoriales.
- Análisis de películas y series: el modelo está entrenado con datos de MovieChat, por lo que puede describir escenas, dialogar sobre la trama y responder preguntas sobre la narrativa.
- Investigación en agentes de vídeo: sirve como referencia para estudiar métodos de memoria jerárquica, uso de herramientas y aprendizaje por refuerzo en modelos multimodales.
- Monitorización de eventos en vídeos de vigilancia o deportivos: el sistema puede generar resúmenes automáticos de eventos destacados basándose en la memoria de eventos y la detección de límites.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---:|
| OVO-Bench | 60.75 |
| StreamingBench | 77.00 |

Resultados reportados en el paper original (ECCV 2026). No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en precisión completa (fp16/bf16) ocupan aproximadamente 17.5 GB, según el tamaño del repositorio. Con cuantización de 4 bits, la VRAM necesaria se reduce a unos 5-6 GB, más overhead de activaciones y el procesador de vídeo.
- GPU recomendadas: para inferencia en fp16 se necesita al menos una GPU con 24 GB de VRAM, como una RTX 4090, A100 40GB o H100. Para cuantización de 4 bits basta con una GPU de 16 GB, como una RTX 4060 Ti o RTX 4080.
- Opciones de despliegue: el modelo puede cargarse con la librería transformers (formato safetensors). También es compatible con vLLM y llama.cpp si se generan pesos GGUF, aunque no se han publicado artefactos de cuantización oficiales.
- Latencia y throughput: no disponible. El rendimiento depende en gran medida del muestreo de vídeo (1 FPS por defecto) y de la frecuencia de invocación de herramientas externas.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de la misma categoría en la información proporcionada. El modelo comparte base con Qwen3-VL-8B-Instruct, pero no se han publicado benchmarks comparativos directos en los materiales revisados.

## Limitaciones y advertencias

- El modelo puede producir respuestas incorrectas, especialmente en tareas de razonamiento complejo sobre vídeo.
- Los captions de memoria generados por el modelo auxiliar Qwen3-VL-4B-Instruct y las herramientas de percepción (OCR y detección) pueden introducir errores que se propagan al agente.
- El checkpoint por sí solo no incluye la implementación de memoria en streaming ni los servicios de OCR y detección de objetos; estos son componentes separados del pipeline, por lo que no puede usarse como un sistema completo sin el código del repositorio.
- No está diseñado para uso en entornos críticos de seguridad, como vigilancia con decisiones autónomas o aplicaciones médicas.
- La licencia Apache 2.0 permite uso comercial, pero los sesgos heredados del modelo base Qwen3-VL-8B-Instruct no han sido evaluados específicamente en este fine-tuning.
- No se especifican idiomas soportados en la documentación, por lo que el comportamiento multilingüe no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lingcco/EventMemAgent-8B
- Paper (arXiv): https://arxiv.org/abs/2602.15329
- Repositorio de código: https://github.com/lingcco/EventMemAgent
- Datos procesados: https://huggingface.co/datasets/lingcco/EventMemAgent
