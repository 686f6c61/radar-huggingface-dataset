# prithivMLmods/d3-nano-GGUF

## Resumen

d3-nano es un modelo de decisión multimodal de 2,21 mil millones de parámetros desarrollado por el equipo de vLLM Semantic Router. Se construye sobre Qwen3.5-2B e incorpora un codificador de visión de 0,33 mil millones de parámetros. A diferencia de un modelo generativo convencional, d3-nano no produce texto libre: recibe un estado (texto o JSON, opcionalmente acompañado de imágenes o vídeo) y un conjunto de preguntas estructuradas de tipo elección múltiple, sí/no o puntuación, y devuelve probabilidades calibradas en una sola llamada. Esta ficha describe la variante GGUF publicada por prithivMLmods, pensada para inferencia local con llama.cpp.

El modelo se posiciona como un "decision model" de tipo system-one: respuestas rápidas, de baja latencia y sin cadena de razonamiento explícita. Según la model card, obtiene 38,9 en el Jev Decision Index 0.3.2 (texto), 54,7 en el tablero de visión y 63,5 en Perception Test (vídeo). En un AMD Instinct MI325X reporta una latencia mediana de 13,4 ms para texto, 90,2 ms para imagen y 301 ms para vídeo de 10 segundos, con hasta 318 peticiones de texto por segundo mediante batching en vLLM Semantic Router.

Su relevancia actual radica en el enrutamiento y la clasificación de bajo coste dentro de pipelines de agentes: sustituye llamadas a modelos generativos grandes por un clasificador dedicado que devuelve distribuciones de probabilidad directamente consumibles por lógica de orquestación. La licencia Apache-2.0 y la disponibilidad de cuantizaciones desde 1,32 GB lo hacen desplegable en hardware muy modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-2B) con codificador de visión; modelo de decisión |
| Parametros totales | 2.390.384.448 (2,21B; incluye 0,33B del codificador de visión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; mmproj en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transformers, llama.cpp) |

## Arquitectura y entrenamiento

d3-nano es un transformer multimodal derivado de Qwen3.5-2B, al que se añade un codificador de visión de 0,33B y una proyección multimodal (mmproj) para alinear representaciones imagen-texto. La cabeza del modelo no es generativa en el sentido habitual: está diseñada para producir puntuaciones y distribuciones de probabilidad sobre opciones predefinidas (choice, noul, score), lo que lo convierte en un clasificador zero-shot con interfaz conversacional. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; esos datos figuran como no disponibles.

La innovación principal es la API `v1/systemone` expuesta a través de llama.cpp, que permite enviar un estado y un objeto de preguntas estructuradas y recibir respuestas con probabilidades por opción, confianza agregada y leyenda de puntuaciones. El modelo se integra también en vLLM Semantic Router en modo Engine, lo que habilita batching y despliegue de alta concurrencia. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación zero-shot con opciones definidas en tiempo de inferencia (categorías arbitrarias vía `criteria`).
- Preguntas de elección múltiple (`choice`) con distribución de probabilidad completa por opción.
- Preguntas booleanas (`noul`, sí/no) con probabilidad calibrada.
- Puntuación ordinal (`score`) sobre una escala definida por el usuario, con leyenda de valores.
- Procesamiento de texto y JSON como estado de entrada.
- Procesamiento de imágenes y vídeo (hasta al menos 10 segundos según las latencias reportadas).
- Enrutamiento semántico y toma de decisiones de un solo paso (system-one), sin generación de texto libre.
- Integración con llama.cpp mediante el endpoint `/v1/systemone`.
- Integración con vLLM Semantic Router en modo Engine con batching.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente como `state` y un conjunto de categorías (facturación, envíos, técnico) como `criteria`, devolviendo la probabilidad de cada equipo. Es adecuado por su latencia de 13,4 ms y su capacidad de clasificar sin generar texto.
- Moderación y triaje de urgencia: combinando preguntas `noul` (¿es una queja?) y `score` (urgencia en cuatro niveles) en una sola llamada, se obtiene una priorización estructurada consumible por un sistema de ticketing.
- Enrutamiento de consultas en pipelines RAG: decidir si una pregunta debe ir a búsqueda vectorial, a una herramienta externa o a un modelo generativo grande, usando `choice` sobre el estado de la conversación.
- Clasificación de imágenes en flujos de inspección: con el codificador de visión y una latencia mediana de 90,2 ms por imagen, puede etiquetar capturas o documentos escaneados según criterios definidos en la petición.
- Análisis de vídeo corto para detección de eventos: con 301 ms para 10 segundos de vídeo, es viable en tareas de verificación de contenido o monitorización ligera.
- Control de calidad en generación: evaluar la salida de otro modelo con preguntas `score` (relevancia, toxicidad, corrección) para filtrar respuestas antes de mostrarlas al usuario.
- Gatekeeping en agentes multi-paso: decidir en cada turno si el agente debe continuar, pedir aclaración o finalizar, con una sola inferencia de bajo coste.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Jev Decision Index 0.3.2 (texto) | 38,9 |
| Jev Decision Index 0.3.2 (visión) | 54,7 |
| Perception Test (vídeo) | 63,5 |

Datos de latencia y throughput reportados en la model card (AMD Instinct MI325X):

| Escenario | Latencia mediana |
|---|---|
| Texto | 13,4 ms |
| Imagen | 90,2 ms |
| Vídeo de 10 s | 301 ms |
| Throughput (texto, una pregunta, batching) | hasta 318 req/s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la información disponible, lo cual es coherente con la naturaleza no generativa del modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 1,32 GB (Q3_K_M) hasta 4,79 GB (BF16), más 671 MB del fichero mmproj si se usa visión.
- Cuantización recomendada por el autor: Q4_K_M (1,56 GB) o Q5_K_M (1,76 GB) para uso general.
- Cabe en GPU de consumo: cualquier GPU con 6-8 GB de VRAM puede ejecutar la variante BF16; las cuantizadas Q4 caben en 4 GB.
- GPU de referencia en las mediciones: AMD Instinct MI325X.
- Opciones de despliegue: llama.cpp (`llama-server` con endpoint `/v1/systemone`), vLLM Semantic Router en modo Engine, Hugging Face Transformers.
- Throughput: hasta 318 peticiones de texto por segundo con batching en vLLM Semantic Router.
- Latencia: 13,4 ms (texto), 90,2 ms (imagen), 301 ms (vídeo 10 s) en MI325X.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Enfoque |
|---|---|---|---|---|---|
| d3-nano | 2,21B (0,33B visión) | no disponible | Texto, imagen, vídeo | Apache-2.0 | Modelo de decisión (clasificación zero-shot) |
| Qwen3.5-2B (base) | 2B | no disponible | Texto | Apache-2.0 | Generación de texto |
| Clasificadores BERT-base | ~110M | 512 tokens | Texto | Varía | Clasificación supervisada con clases fijas |

La comparación directa con modelos generativos no es del todo equivalente, ya que d3-nano no produce texto libre. Frente a un clasificador BERT clásico, ofrece clases definidas en tiempo de inferencia y multimodalidad; frente a Qwen3.5-2B, sacrifica generación a cambio de latencia mucho menor y salidas probabilísticas estructuradas. No se dispone de otros modelos de decisión comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en castellano no está documentado.
- No genera texto: no es adecuado para tareas de resumen, redacción, código o diálogo abierto.
- Modelo de "system-one": no razona paso a paso, lo que limita su precisión en decisiones que requieren inferencia compleja o multi-paso.
- Riesgo de calibración deficiente de probabilidades fuera de la distribución de entrenamiento; las confianzas deben validarse en el dominio de producción.
- La longitud de contexto no está documentada, lo que dificulta planificar entradas largas.
- El repositorio GGUF tiene 19,2 GB y 0 descargas en el momento de la consulta; es una publicación reciente con poca validación comunitaria.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base Qwen3.5-2B y del modelo original vllm-sr/d3-nano.
- El endpoint `/v1/systemone` es específico de llama.cpp y puede no estar disponible en otras implementaciones.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; se recomienda auditoría propia antes de uso en producción.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/prithivMLmods/d3-nano-GGUF
- Modelo base: https://huggingface.co/vllm-sr/d3-nano
- Fichero BF16: https://huggingface.co/prithivMLmods/d3-nano-GGUF/blob/main/d3-nano.BF16.gguf
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/d3-nano-GGUF/blob/main/d3-nano.Q4_K_M.gguf
- Fichero mmproj: https://huggingface.co/prithivMLmods/d3-nano-GGUF/blob/main/d3-nano.mmproj-bf16.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- vLLM Semantic Router: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
