# butler-compute/Cicero-NVFP4

## Resumen

Cicero-NVFP4 es el checkpoint cuantizado en NVFP4 de Cicero, un modelo de decisión desarrollado por Butler Compute. A diferencia de un modelo generativo al uso, Cicero no produce texto: recibe un estado (texto, una conversación o hasta 4 imágenes) junto con hasta 64 preguntas tipadas y devuelve, para cada pregunta, una probabilidad calibrada por cada opción. Cada pregunta se responde en un único forward pass, lo que elimina la latencia de decodificación autoregresiva.

El modelo es un post-entrenamiento de Qwen3.5-35B-A3B, un transformer de mezcla de expertos (MoE) con 35.000 millones de parámetros totales y 3.000 millones activos, del que conserva la torre de visión. Este checkpoint concreto emplea expertos en formato NVFP4 (8 bits) y pesa 23 GB, frente a los pesos BF16 del modelo base butler-compute/Cicero. La ventana de contexto alcanza los 131.072 tokens.

Su relevancia radica en el enfoque: en lugar de generar una respuesta y parsearla, expone directamente distribuciones de probabilidad calibradas para tareas de clasificación, enrutamiento de herramientas y puntuación, con una latencia mediana declarada de 41 ms. El autor reporta 71,33 puntos en el índice público JDI (Jev Decision Index) con solo 3B de parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (post-entrenamiento de Qwen3.5-35B-A3B) con torre de visión |
| Parametros totales | 21.014.320.496 (según safetensors del repo) |
| Parametros activos | 3B (declarado por el autor; el modelo base se describe como 35B-A3B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | NVFP4 (expertos en 4 bits con formato NVFP4, checkpoint de 8 bits según tags) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4), 23 GB |

## Arquitectura y entrenamiento

Cicero se construye como post-entrenamiento de Qwen3.5-35B-A3B, un modelo de mezcla de expertos con 35B de parámetros totales y 3B activos por token. La torre de visión es la del modelo base, lo que permite aceptar hasta 4 imágenes como parte del estado de entrada. El checkpoint NVFP4 cuantiza los expertos a NVFP4, reduciendo el peso del repositorio a 23 GB.

El mecanismo de inferencia es la innovación central: cada pregunta se serializa como texto plano (contexto, pregunta y opciones etiquetadas A, B, C), se procesa en un único forward pass y la respuesta se extrae de las puntuaciones del modelo sobre las letras de las opciones al final del prompt, convirtiéndolas en probabilidades y calibrando por tipo de pregunta. No hay decodificación autoregresiva ni generación de texto. El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; solo indica que es un post-entrenamiento del modelo base y que las puntuaciones JDI provienen de una ejecución propia con el kit oficial.

## Capacidades

- Clasificación y decisión con salida probabilística calibrada: preguntas sí/no (`noul`), elección única entre hasta 255 opciones (`choice`) y puntuación en escala (`score`), hasta 64 preguntas por petición.
- Procesamiento de contexto largo: hasta 131.072 tokens por estado de entrada.
- Entrada multimodal: texto, conversaciones y hasta 4 imágenes por petición.
- Enrutamiento de herramientas y function calling: el ejemplo de BFCL muestra selección de herramienta con probabilidad por candidato (p. ej. HNA_NEWS.search con 0,999).
- Clasificación de intenciones en dominios específicos (el ejemplo de BANKING77 asigna 0,973 a card_arrival).
- Razonamiento de conocimiento y comprensión del lenguaje evaluados en el índice JDI.
- No genera texto libre: su salida es siempre una distribución de probabilidad sobre opciones predefinidas.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado el historial de conversación y una pregunta de tipo `choice` sobre las herramientas disponibles, el modelo devuelve la probabilidad de cada una en un único forward pass, lo que permite decidir la invocación con umbrales calibrados y latencias de decenas de milisegundos.
- Clasificación de intenciones en atención al cliente: con preguntas `choice` sobre un catálogo de intenciones (como el ejemplo de BANKING77), se obtiene una distribución calibrada que permite derivar a un agente humano cuando la confianza es baja.
- Moderación y filtrado de contenido: preguntas `noul` y `score` sobre texto o imágenes permiten asignar probabilidades de incumplimiento y umbrales ajustables sin generar explicaciones costosas.
- Evaluación automática de respuestas: preguntas `score` en escalas tipo 1-5 permiten puntuar candidatos de un pipeline de generación, usando la distribución completa en lugar de una etiqueta única.
- Análisis de documentos e imágenes: con hasta 4 imágenes y 131.072 tokens de contexto, se pueden plantear preguntas de verificación sobre capturas, formularios o páginas escaneadas.
- Detección de intención de compra o churn: preguntas `noul` sobre transcripciones de conversaciones largas, aprovechando el contexto extendido para incluir el historial completo.
- Triaje de tickets de soporte: combinación de preguntas `choice` (categoría) y `score` (urgencia) en una sola petición de hasta 64 preguntas, reduciendo el número de llamadas al modelo.

## Benchmarks y rendimiento

El autor publica resultados del índice JDI 0.4.1 (public suite), definido como habilidad corregida por azar (0 = azar, 100 = perfecto), ejecutados por el propio autor con el kit oficial:

| Area | Cicero | mammoth-1 | elephant-1 | Decider v1.2 | Drex Max |
|---|---:|---:|---:|---:|---:|
| Tools & Automation | 87.0 | **88.6** | 88.0 | 85.4 | 81.9 |
| Retrieval & Classification | 76.1 | **77.4** | 76.2 | 68.1 | 68.8 |
| Language Understanding | 74.6 | **76.1** | 73.8 | 71.9 | 72.2 |
| Arts & Human Taste | **64.4** | 64.1 | 61.6 | 56.2 | 53.4 |
| Knowledge & Reasoning | 56.1 | **68.0** | 60.6 | 55.3 | 57.1 |
| **Public JDI** | 71.33 | **75.34** | 72.24 | 67.74 | 67.52 |

Datos adicionales declarados: latencia mediana de 41 ms y ventaja sobre Decider v1.2 en todas las áreas. No se han publicado en la información disponible resultados de benchmarks convencionales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el checkpoint NVFP4 ocupa 23 GB, por lo que la inferencia requiere al menos ~24 GB de VRAM para cargar los pesos completos, más memoria para el KV cache del contexto de hasta 131.072 tokens.
- GPU recomendadas: A100 (40/80 GB), H100 y L40S para producción; en consumer, una RTX 4090 (24 GB) queda en el límite justo para los pesos y puede requerir reducir el contexto o usar offloading.
- Cabe en GPU consumer de 24 GB solo con margen mínimo; para contextos largos se recomienda 48 GB o más.
- Opciones de despliegue: no disponible en la información proporcionada; el modelo declara `inference: false` en la model card y no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: 41 ms mediana declarada por el autor; no se especifica el hardware de la medición ni el throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Public JDI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cicero (NVFP4) | 35B totales / 3B activos (21B en safetensors) | 131.072 | 71,33 | Apache 2.0 | HuggingFace |
| mammoth-1 | no disponible | no disponible | 75,34 | no disponible | OpenRouter |
| elephant-1 | no disponible | no disponible | 72,24 | no disponible | OpenRouter |
| Decider v1.2 | no disponible | no disponible | 67,74 | no disponible | OpenRouter |
| Drex Max | no disponible | no disponible | 67,52 | no disponible | OpenRouter |

Cicero destaca en Arts & Human Taste (64,4) y queda por detrás de mammoth-1 y elephant-1 en el resto de áreas y en el índice global. Para el resto de modelos comparados no se dispone de parámetros, contexto ni licencia en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente el idioma `en`, sin soporte multilingüe documentado.
- No genera texto: no sirve para tareas de generación libre, resumen o diálogo abierto; su salida es una distribución sobre opciones predefinidas.
- Riesgo de calibración deficiente fuera de distribución: las probabilidades están calibradas por tipo de pregunta, pero no se documenta su comportamiento con dominios o idiomas distintos del entrenamiento.
- Inferencia no soportada de forma estándar: la model card marca `inference: false` y no se documentan integraciones con motores habituales, lo que puede complicar el despliegue en producción.
- Discrepancia en el recuento de parámetros: la model card describe el modelo base como 35B-A3B, mientras que los safetensors del checkpoint suman 21.014.320.496 parámetros; conviene verificar la arquitectura real antes de dimensionar hardware.
- Riesgo de sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información disponible.
- Contexto largo: no se detalla el coste de memoria del KV cache a 131.072 tokens ni si se aplican técnicas de atención eficiente.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-35B-A3B conviene revisar las condiciones del modelo base.
- Repositorio con 0 descargas y creado en noviembre de 2026: ecosistema y validación externa muy limitados.

## Enlaces

- HuggingFace: https://huggingface.co/butler-compute/Cicero-NVFP4
- Modelo base BF16: https://huggingface.co/butler-compute/Cicero
- Web del autor: https://butlercompute.com
- Investigación: https://butlercompute.com/research
- Contacto: https://butlercompute.com/contact
