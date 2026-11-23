# edinlong83/zils-flash-e2

## Resumen

elephant-1 es un modelo de decisión de 9.409.813.744 parámetros (aproximadamente 9B) desarrollado por Base Labs en Baseten mediante un ajuste fino completo sobre Qwen3.5-9B. A diferencia de un modelo generativo convencional, su función es recibir un estado (texto, opcionalmente con imágenes) junto con un conjunto de preguntas y devolver una probabilidad calibrada para cada opción, resolviendo todas las preguntas en un único prefill de prefijo compartido. El modelo se publica en Hugging Face bajo el identificador `edinlong83/zils-flash-e2`, con licencia MIT y pipeline declarado como `text-classification`.

La relevancia del modelo está en su enfoque: sustituye la generación autoregresiva de respuestas por una evaluación directa y calibrada de opciones, lo que reduce latencia y coste en tareas de enrutamiento, clasificación y guardarraíles. Según la model card, obtiene 62.65 en el Jev Decision Index 0.4 (el mejor modelo por debajo de 15B en ese índice) y 65.2 en una réplica del Artificial Analysis Decision Index, nivel comparable a d1-ultra (65).

El modelo forma parte de una familia junto a mammoth-1 (27B), su hermano mayor orientado a mayor precisión. Soporta entradas multimodales (texto e imagen) y está pensado para despliegues de decisión en producción, con una longitud máxima de secuencia de 16.384 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) con máscara bidireccional por bloques en las capas de atención completa; codificador de visión congelado |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

elephant-1 parte de Qwen3.5-9B y aplica un ajuste fino completo del modelo de lenguaje sobre decisiones de texto e imagen, manteniendo congelado el codificador de visión. La innovación arquitectónica principal es el uso de una máscara bidireccional por bloques en las capas de atención completa, lo que permite que todas las preguntas de una misma petición se resuelvan en un único prefill de prefijo compartido en lugar de requerir una pasada por pregunta. La longitud máxima de secuencia es de 16.384 tokens y las peticiones que superan los límites entrenados se rechazan en lugar de truncarse.

El entrenamiento se realizó sobre 6,21 millones de ejemplos de decisión (Mix 8), con la siguiente composición: 58,3% de habilidades centrales de decisión, 16,1% de seguridad y abstención, 16,1% de juicio y dominios expertos y 9,5% de datos públicos de decisión. El objetivo combina entropía cruzada con un término de calibración de Brier (λ = 1) e incluye una opción entrenada de "no lo sé". La receta fue de 1 época (5.546 pasos), LR máximo de 3,5e-6, AdamW (β 0,9/0,95, sin weight decay), 3% de warm-up, decaimiento coseno y precisión bf16, ejecutada sobre 16 nodos de 8 H100 (128 GPU en total).

## Capacidades

- Clasificación y decisión calibrada: devuelve probabilidades por opción para preguntas de tipo sí/no (`noul`), elección entre opciones nombradas (`choice`) y puntuación sobre niveles ordenados (`score`).
- Resolución de múltiples preguntas en un único prefill de prefijo compartido, lo que reduce el coste frente a evaluar cada pregunta por separado.
- Entrada multimodal: acepta texto e imágenes (con codificador de visión congelado durante el ajuste).
- Abstención explícita: incluye una opción entrenada de "no lo sé" para casos de incertidumbre.
- Calibración de probabilidades mediante término de Brier en el objetivo de entrenamiento.
- Capacidades de enrutamiento y guardarraíles: orientado a decidir qué equipo o flujo debe atender una petición y a filtrar contenido.
- Capacidades de juicio y dominios expertos, según la composición del dataset de entrenamiento.
- No orientado a generación de texto libre ni a conocimiento general amplio (para eso se remite a mammoth-1, 27B).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y devuelve la probabilidad de que corresponda a facturación, soporte técnico o fraude, además de un nivel de urgencia, todo en una sola pasada gracias al prefill compartido.
- Guardarraíles de contenido: evaluación calibrada de si una entrada cumple o incumple una política, con probabilidad de sí/no y opción de abstención cuando la incertidumbre es alta.
- Clasificación de documentos con imagen: al aceptar entradas multimodales, puede decidir sobre formularios, capturas o documentos escaneados junto con su texto asociado.
- Moderación y triaje en pipelines de atención al cliente: combinación de preguntas de tipo `choice` y `score` para priorizar colas y derivar casos urgentes.
- Evaluación automática de respuestas: uso como juez con probabilidades calibradas para puntuar salidas de otros modelos sobre criterios ordenados.
- Decisión de abstención en sistemas RAG: determinar si la evidencia recuperada basta para responder o si conviene activar la opción "no lo sé".
- Extracción de señales estructuradas en flujos de automatización: convertir texto libre en decisiones discretas con probabilidades asociadas para alimentar sistemas posteriores.

## Benchmarks y rendimiento

| Modelo | Jev Decision Index 0.4 |
|---|---:|
| mammoth-1 | 71,24 |
| Perplexity Decider v1.2 | 69,42 |
| elephant-1 | 62,65 |
| Jev 1.14 | 62,2 |
| Cloudflare Clef | 55,7 |

| Modelo | Artificial Analysis Decision Index (réplica) |
|---|---:|
| mammoth-1 | 65,9 |
| elephant-1 | 65,2 |
| d1-ultra | 65 |

Según la model card, en el split público elephant-1 queda ligeramente por detrás de mammoth-1 en todas las áreas y supera a Jev 1.14 en las cinco (conocimiento y razonamiento, lenguaje, herramientas y automatización, recuperación y clasificación, y artes y gusto humano). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,4B parámetros en bf16 se requiere del orden de 18-19 GB solo para pesos, más overhead de activaciones y del codificador de visión.
- GPU recomendadas: el autor indica que el despliegue autoalojado necesita una GPU CUDA y la imagen `pytorch/pytorch:2.8.0-cuda12.8-cudnn9-devel`; el entrenamiento se realizó sobre H100.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en bf16, aunque no se confirma en la información disponible; en cuantizaciones menores no se especifican formatos.
- Opciones de despliegue: runtime propio del autor (OneJev + `serve.patch`) mediante `setup.sh`; también disponible como endpoint en Baseten Model APIs. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la resolución de todas las preguntas en un único prefill de prefijo compartido reduce el coste frente a evaluaciones por pregunta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Jev Decision Index 0.4 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| elephant-1 | 9B | 16.384 | 62,65 | MIT | Hugging Face y Baseten |
| mammoth-1 | 27B | no disponible | 71,24 | no disponible | Hugging Face (`baselabs/mammoth-1`) |
| Perplexity Decider v1.2 | no disponible | no disponible | 69,42 | no disponible | no disponible |
| Jev 1.14 | no disponible | no disponible | 62,2 | no disponible | no disponible |
| Cloudflare Clef | no disponible | no disponible | 55,7 | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado y etiquetado únicamente para inglés (`language: en`), por lo que su rendimiento en castellano u otros idiomas no está garantizado.
- Está diseñado para decisión y clasificación, no para generación de texto libre; usarlo como modelo generativo general produciría resultados pobres.
- Las peticiones que superan los límites de longitud entrenados se rechazan, no se truncan, lo que puede romper flujos que esperen truncado automático.
- Riesgo de alucinación y de calibración deficiente fuera de la distribución de entrenamiento; la opción "no lo sé" mitiga pero no elimina este riesgo.
- No se detallan sesgos conocidos en la información disponible; al derivar de Qwen3.5-9B y de un dataset propio, puede heredar sesgos del modelo base y de los datos de decisión.
- El repositorio figura bajo el identificador `edinlong83/zils-flash-e2`, mientras que la model card hace referencia a `baselabs/elephant-1`; conviene verificar la procedencia y la integridad de los pesos antes de usarlos en producción.
- La licencia MIT permite uso comercial, pero el despliegue autoalojado depende de un runtime propio del autor (OneJev + `serve.patch`) cuya madurez y soporte no se detallan.
- El periodo gratuito en Baseten Model APIs finaliza el 27/10/26 a las 23:59 PT, según la model card.

## Enlaces

- Hugging Face: https://huggingface.co/edinlong83/zils-flash-e2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo hermano (27B): https://huggingface.co/baselabs/mammoth-1
- Probar en Baseten: https://www.baseten.co/library/elephant-1/
- Informe técnico: https://labs.baseten.co/articles/mammoth-1-and-elephant-1-frontier-decision-models
- Blog: https://www.baseten.co/blog/the-best-decision-models-in-the-world-mammoth-1-and-elephant-1/
