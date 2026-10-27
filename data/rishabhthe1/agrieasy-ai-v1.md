# Rishabhthe1/agrieasy-ai-v1

## Resumen

AgriEasy Saathi v1 (agrieasy-ai-v1) es un ajuste fino supervisado del modelo Qwen2.5-1.5B-Instruct, publicado por Rishabhthe1 (Rishabh Gupta) bajo licencia Apache-2.0. Está especializado en asistencia agrícola para agricultores de la India: guías de cultivo, técnicas de rendimiento, poscosecha y comercialización, esquemas gubernamentales y el flujo de venta en la plataforma agrieasy.site. El modelo se entrenó con LoRA en fp16 sobre la base de conocimiento propia de AgriEasy y sobre conversaciones multiturno en hinglish que reproducen el habla fragmentada y las preguntas de aclaración típicas de un agricultor.

Técnicamente es un transformer decoder-only de 1.543.714.304 parámetros (1,5B), con pesos publicados en safetensors (repo de 3,1 GB, coherente con pesos en fp16 ya fusionados). El entrenamiento fue muy ligero: LoRA de rango 16 sobre todas las proyecciones de atención y MLP, 15 pasos por época durante 3 épocas, learning rate 2e-4 con schedule coseno, sobre una única GPU T4 de Kaggle, con train_loss 3,19 y eval_loss 2,397.

Su relevancia es acotada pero clara: no compite en capacidad general, sino que ejemplifica el patrón de "modelo pequeño + recuperación documental en tiempo de respuesta" para dominios verticales con recursos limitados. El propio autor advierte que los datos agronómicos profundos provienen de la base de conocimiento recuperada por la aplicación, no de los pesos, y que el asistente no inventa precios de mercado diarios. No hay resultados de benchmarks publicados ni versiones cuantizadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA y pesos publicados en safetensors |
| Parámetros totales | 1.543.714.304 (1,5B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no se documenta en la model card; depende de la configuración del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors fp16. No hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | Inglés (en) e hindi (hi), con conversaciones en hinglish |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16); tamaño del repo 3,1 GB |

## Arquitectura y entrenamiento

La base es Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1,5B parámetros. Sobre él se aplicó un ajuste fino supervisado con LoRA de rango 16 en todas las proyecciones de atención y MLP, en precisión fp16, sobre una GPU T4 de Kaggle. La configuración reportada es de 15 pasos por época durante 3 épocas (45 pasos totales), learning rate 2e-4 con decaimiento coseno, con train_loss final de 3,19 y eval_loss de 2,397. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO; por el tipo de ajuste descrito, se trata de SFT sobre datos propios.

El corpus de entrenamiento corresponde a la base de conocimiento de AgriEasy: 12 guías de cultivos indios que cubren desde la siembra hasta la venta, técnicas de mejora de rendimiento, material de poscosecha y comercialización, esquemas gubernamentales, el proceso de venta en agrieasy.site y conversaciones multiturno en hinglish con preguntas de aclaración, entradas de voz fragmentadas y flujos tipo agente para listados, transporte y pagos. No se describen innovaciones arquitectónicas propias (atención lineal, decodificación especulativa, decodificación híbrida SSM, etc.); la única particularidad reseñable es la separación explícita entre conocimiento en pesos y conocimiento recuperado en tiempo de respuesta.

## Capacidades

- Generación de texto conversacional en inglés, hindi y hinglish, orientada a un registro informal y a entradas fragmentadas típicas de dictado por voz.
- Asesoramiento agrícola sobre 12 cultivos indios: calendario de siembra, labores, fertilización orientativa, manejo de plagas y cosecha.
- Planificación de explotación a partir de datos básicos del agricultor (por ejemplo, superficie en acres y cultivo objetivo), formulando preguntas de aclaración cuando falta información.
- Manejo de poscosecha, almacenamiento y comercialización, incluido el proceso de publicación y venta en agrieasy.site.
- Información sobre esquemas y programas gubernamentales para agricultores.
- Flujos tipo agente para listado de producto, coordinación de transporte y pagos, con razonamiento en varios pasos dentro de la conversación.
- Derivación de seguridad: redirige a servicios de emergencia (108) y al Kisan Call Centre (1800-180-1551) ante consultas médicas, legales o de emergencia.
- No se documenta soporte de tool calling o function calling nativo, ni capacidades de visión, audio o modo de razonamiento explícito.

## Casos de uso

- Asistente conversacional embebido en la PWA Agrieasy.ai: el modelo atiende consultas de agricultores en texto o voz transcrita, manteniendo el hilo multiturno y pidiendo aclaraciones cuando la entrada llega incompleta o mal transcrita, algo habitual en dictado por voz en hindi.
- Planificación de campaña por parcela: a partir de una frase como "tengo 2 acres, hazme un plan completo", el modelo estructura un calendario de siembra, labores y cosecha para el cultivo indicado, apoyándose en la base de conocimiento recuperada para las dosis concretas.
- Soporte fitosanitario de primera línea: ante una consulta sobre pulgón en sarson (mostaza), el modelo identifica el problema, propone medidas de manejo y recomienda confirmar dosis con el KVK local, derivando las decisiones críticas a un técnico.
- Publicación de producto y venta en agrieasy.site: guía al agricultor paso a paso en la creación del listado, descripción del producto y condiciones de entrega, con el flujo de transporte y pago como partes del mismo diálogo.
- Atención al cliente y FAQ de la plataforma: responde dudas sobre funcionamiento del servicio, comisiones y estados de un pedido, reduciendo la carga de soporte humano en consultas repetitivas.
- Difusión de esquemas gubernamentales: explica requisitos y pasos de programas de apoyo al agricultor en lenguaje sencillo, con la base documental como fuente y el modelo como capa de reformulación.
- Generación de contenido educativo localizado: producción de fichas y respuestas breves en hindi y hinglish para campañas de divulgación dentro de la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento: train_loss 3,19 y eval_loss 2,397, sin conjunto de evaluación independiente ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 3,1 GB solo para pesos, más KV cache y overhead del runtime; un presupuesto práctico de 4-6 GB es suficiente para contextos moderados.
- Con cuantización de 8 bits, la huella de pesos baja aproximadamente a 1,6 GB; en 4 bits, a unos 0,9 GB. Estas cifras son estimaciones de cálculo, no medidas publicadas, y requieren convertir los pesos, ya que no se distribuyen versiones cuantizadas.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) para fp16; A100, H100 o L4 para despliegues con concurrencia. También es viable en CPU con llama.cpp tras la conversión a GGUF.
- Cabe holgadamente en GPU de consumo: es un modelo de 1,5B, diseñado para ejecutarse en el mismo tipo de hardware con el que se entrenó (T4 de 16 GB en Kaggle).
- Opciones de despliegue: transformers, vLLM o TGI para servir en fp16; llama.cpp u Ollama previa conversión a GGUF; el pipeline declarado en HuggingFace es text-generation.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| agrieasy-ai-v1 | 1,5B (1.543.714.304) | No disponible en la información consultada | Apache-2.0 | safetensors fp16 | HuggingFace, 0 descargas, sin cuantizaciones |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | No disponible en la información consultada | Apache-2.0 | safetensors, GGUF y otras | Ampliamente distribuido, con ecosistema de cuantizaciones |
| Qwen2.5-3B-Instruct | 3B | No disponible en la información consultada | Apache-2.0 (según familia Qwen2.5) | safetensors y cuantizaciones | Ampliamente distribuido; mayor coste de inferencia |
| Llama 3.2 1B Instruct | 1B | No disponible en la información consultada | Licencia comunitaria Llama | safetensors y cuantizaciones | Ampliamente distribuido; requiere aceptar la licencia |

Frente a su modelo base, agrieasy-ai-v1 intercambia capacidad general por especialización vertical y conversacional en hinglish; el base conserva mejor rendimiento fuera del dominio agrícola y dispone de cuantizaciones listas para usar. Frente a modelos de 1B-3B de propósito general, la diferencia relevante no es de tamaño sino de dominio: ninguno de ellos incorpora el corpus de AgriEasy ni el flujo de venta de la plataforma. No hay datos de benchmarks que permitan comparar calidad de forma objetiva.

## Limitaciones y advertencias

- Modelo pequeño (1,5B): el conocimiento agronómico detallado no reside en los pesos, sino que se recupera de la base de conocimiento en el momento de responder. Sin ese sistema de recuperación, la calidad de las respuestas numéricas cae.
- Entrenamiento muy corto (45 pasos totales, eval_loss 2,397): no hay evidencia publicada de robustez fuera del conjunto de entrenamiento ni de generalización a cultivos o regiones no cubiertos por las 12 guías.
- Riesgo de alucinación en dosis, plazos y cifras si se usa sin recuperación documental; la propia model card indica que las respuestas son orientativas y deben confirmarse con un KVK local.
- El modelo declara no inventar precios de mercado diarios; cualquier uso que requiera precios en tiempo real necesita una fuente externa verificada.
- Cobertura lingüística limitada a inglés, hindi y hinglish; no se documenta soporte de otras lenguas indias ni de castellano.
- Ámbito geográfico y regulatorio restringido a la India: esquemas gubernamentales, prácticas culturales y cadena de comercialización no son transferibles a otros países sin revisión.
- No debe emplearse como fuente de advice médico, legal o de emergencia; el propio modelo deriva a 108 y al Kisan Call Centre 1800-180-1551.
- Licencia Apache-2.0: permite uso comercial y modificaciones con atribución, pero el autor no ofrece garantías sobre la exactitud del contenido agronómico.
- Sin benchmarks publicados, sin cuantizaciones oficiales y con 0 descargas: madurez de ecosistema muy baja, sin validación por parte de la comunidad.
- No se documenta filtrado de seguridad, evaluación de sesgos ni tratamiento de datos personales de agricultores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rishabhthe1/agrieasy-ai-v1
- Perfil del autor en HuggingFace: https://huggingface.co/Rishabhthe1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Aplicación mencionada en la model card: https://agrieasy.site y https://agrieasy.ai
- Repositorio GitHub AgriEasy.com (posible relación con el autor, no confirmada): https://github.com/Rishabh01487/AgriEasy.com1
- Repositorio GitHub Agri-AI (proyecto independiente de agricultura con IA, sin relación confirmada): https://github.com/Rishinaiyappaag/Agri-AI
- Nota: https://agrieasy.fr/en/ y https://www.agri1.ai/en son productos homónimos o del mismo sector sin relación confirmada con este modelo.
