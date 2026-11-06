# Ajeet-001/Nischay

## Resumen

Nischay es un modelo multimodal de decisión de 8B parámetros (7,94B totales, 3,89B de cómputo efectivo en el decodificador) publicado por el usuario Ajeet-001 en Hugging Face bajo licencia Apache 2.0. A diferencia de los modelos generativos convencionales, Nischay no muestrea tokens de forma autorregresiva: recibe un estado (JSON estructurado, texto plano o entre 1 y 4 imágenes) y un conjunto de preguntas tipadas, y devuelve una distribución de probabilidad calibrada sobre cada opción en una única pasada de prefill compartido más un forward batchado de los sufijos. Está diseñado para tareas de clasificación, enrutamiento y guardrails con salidas estructuradas y calibradas.

La arquitectura combina un decodificador transformer de 3,89B parámetros efectivos con 2,90B de embeddings por capa (PLE), una tabla de embeddings de tokens de 0,67B, una torre de visión de 0,17B y una torre de audio de 0,31B. Incorpora atención bidireccional por bloques (`block_bidirectional`) en las capas de atención completa y una cabeza de lectura de 256 slots (`slot_lm`) que permite mapear cada opción a un único token. El modelo se entrenó con un objetivo conjunto de entropía cruzada y calibración de Brier, y reporta un ECE del 3,62% en texto y del 8,90% en visión.

El modelo es relevante para desarrolladores que necesitan sustituir pipelines de clasificación frágiles o llamadas generativas costosas por un motor de decisión único, con latencias declaradas de aproximadamente 60 ms para tres preguntas en una GPU y con soporte nativo de texto e imagen. Su enfoque en calibración y abstención explícita lo orienta a sistemas de producción con requisitos de fiabilidad y guardrails.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atención `block_bidirectional` (no causal) en capas de atención completa, embeddings por capa (PLE), torres de visión y audio, cabeza de lectura `slot_lm` de 256 slots |
| Parámetros totales | 7.941.101.802 (7,94B) |
| Parámetros activos | 3,89B de cómputo efectivo en el decodificador (E4B); desglose: 3,89B decodificador + 2,90B PLE + 0,67B embeddings de tokens + 0,17B visión + 0,31B audio |
| Longitud de contexto | no disponible (las peticiones que exceden la capacidad del modelo lanzan `Unsupported`, sin truncado) |
| Tipos de cuantización | no disponible (pesos publicados en `bfloat16`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 14,79 GB en bfloat16; cabeza de salida en float32) |

## Arquitectura y entrenamiento

Nischay se construye sobre una arquitectura de decodificador transformer con una innovación central: las capas de atención completa emplean una máscara bidireccional por bloques (`noncausal`). El prefijo de estado compartido se procesa de forma causal y se cachea una sola vez para todas las preguntas, mientras que cada sufijo de pregunta u opción atiende de forma bidireccional dentro de su propio bloque. Esto permite evaluar múltiples preguntas y opciones en un único prefill compartido más un forward batchado de sufijos, sin generación autorregresiva. La lectura se realiza mediante una cabeza `slot_lm` de 256 slots (letras A–Z y slots de dos letras) que mapea cada opción a un token único, con la cabeza en float32 sobre un backbone en bfloat16.

El modelo incorpora 2,90B de parámetros en embeddings por capa (PLE), una técnica que aumenta la capacidad total sin incrementar proporcionalmente el cómputo efectivo del decodificador. Dispone de torres nativas de visión (0,17B) y audio (0,31B), aunque las capacidades declaradas y los benchmarks publicados se centran en texto y visión. El entrenamiento utiliza un objetivo conjunto de entropía cruzada más calibración de Brier con λ = 1,0, y supervisión de probabilidad 1:1 entre soft-teacher y hard-target. Se incluye un fichero `calibration.json` con temperaturas de T = 0,70 para texto y T = 1,0 para multimodal. El autor declara decontaminación estricta frente al Jev Decision Index (suites 0.3 y 0.4 de texto y vision-0.3) mediante exclusión exacta de datasets y deduplicación SHA-256 de texto normalizado.

## Capacidades

- Decisión estructurada sobre texto e imágenes: acepta estados en JSON estructurado, texto plano o entre 1 y 4 imágenes (hasta 1,6 MP por imagen) y devuelve distribuciones de probabilidad calibradas.
- Preguntas tipadas: `noul` (sí/no con abstención, devuelve P(yes)), `choice` (selección entre hasta 256 opciones con descripción por clave) y `score` (escala ordinal con niveles ordenados).
- Calibración de probabilidades: ECE del 3,62% en texto y del 8,90% en visión según el autor.
- Razonamiento visual multimodal: evaluado en KIE, InfographicVQA, CV-Bench, Winoground, CharXiv y RealWorldQA.
- Abstención explícita: el tipo `noul` permite al modelo declinar responder cuando la evidencia es insuficiente.
- Procesamiento batch de múltiples preguntas: una sola pasada de prefill compartido para todas las preguntas del mismo estado.
- Torre de audio de 0,31B presente en la arquitectura, aunque no se detallan capacidades de audio en la información disponible.
- Sin soporte declarado de tool calling, function calling ni razonamiento multi-paso en la información proporcionada.
- Idioma: únicamente inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como `state` y un conjunto de preguntas `choice` (equipo asignado) y `score` (urgencia), devolviendo probabilidades calibradas que permiten umbrales de derivación automática o revisión humana. La calibración reportada facilita fijar umbrales de confianza fiables.
- Guardrails de contenido en producción: con preguntas `noul` sobre categorías de riesgo (fraude, abuso, contenido prohibido), el modelo actúa como clasificador de seguridad con abstención explícita cuando la probabilidad no supera el umbral configurado.
- Clasificación de documentos con visión: procesamiento de facturas, formularios o capturas (KIE, InfographicVQA) para extraer decisiones estructuradas, como validación de campos o detección de discrepancias, usando hasta 4 imágenes por petición.
- Moderación y verificación de imágenes: evaluación de pares imagen-texto (Winoground, RealWorldQA) para tareas de alineación semántica o verificación de contenido visual en pipelines de publicación.
- Triaje de atención al cliente en tiempo real: la latencia declarada de aproximadamente 60 ms para tres preguntas en una GPU permite integrar el modelo en flujos conversacionales síncronos sin degradar la experiencia.
- Evaluación de calidad en pipelines de anotación: uso de las salidas `score` ordinales para puntuar la calidad de respuestas generadas por otros modelos o de anotaciones humanas, con distribuciones calibradas para medir el acuerdo entre anotadores.
- Sustitución de clasificadores ad hoc: un único modelo multimodal reemplaza múltiples clasificadores especializados y llamadas a LLM generativos, reduciendo coste por inferencia y variabilidad de salida al no muestrear tokens.

## Benchmarks y rendimiento

El autor publica resultados en el Jev Decision Index 0.3 / 0.4, con artefactos completos en el dataset `Ajeet-001/Nischay-decision-index-results`. La información proporcionada incluye una tabla comparativa de índices de visión, pero los valores numéricos de la comparativa están truncados en la model card, por lo que no se pueden reproducir íntegramente.

| Métrica | Resultado declarado |
|---|---|
| ECE en texto | 3,62% |
| ECE en visión multimodal | 8,90% |
| Latencia (3 preguntas, 1 GPU) | ~60 ms |
| Jev Decision Index 0.3 / 0.4 (texto) | publicado en `Ajeet-001/Nischay-decision-index-results` (valores no disponibles en la información proporcionada) |
| Jev Decision Index vision-0.3 | publicado en `Ajeet-001/Nischay-decision-index-results` (valores no disponibles en la información proporcionada) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es coherente con la naturaleza no generativa del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 15–16 GB para los pesos (14,79 GB de safetensors) más overhead de activaciones y caché del prefijo compartido.
- GPU recomendadas: A100, H100 o L40S para producción; una RTX 4090 (24 GB) debería alojar los pesos en bfloat16, aunque no se confirma en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 y GPUs con 24 GB o más; en GPUs de 16 GB requeriría cuantización, cuyos formatos no están documentados.
- Opciones de despliegue: el autor proporciona un runtime específico (`OneJev @ 81ce62f1` con `serve.patch`) instalado mediante `setup.sh`, junto con la librería `qev` (`DecisionEngine`) y el kit `decision-index`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo autorregresivo es improbable que estos runtimes estándar lo soporten sin adaptación.
- Latencia y throughput: ~60 ms para 3 preguntas sobre un estado de texto en una GPU; no se proporcionan cifras de throughput ni latencia para visión.

## Comparativa con modelos similares

No se dispone de datos numéricos comparativos completos en la información proporcionada; la model card incluye una tabla frente a modelos de decisión compactos y sub-15B, pero los valores están truncados.

| Modelo | Parámetros | Modalidades | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nischay | 7,94B (3,89B efectivos) | Texto + visión (+ torre de audio) | Decisión calibrada no generativa | Apache 2.0 | Hugging Face |
| Modelos generativos de ~8B (p. ej. Llama 3.1 8B, Qwen2.5 7B) | ~7–8B | Texto (algunos variantes visión) | Generación autorregresiva | Licencias variables | Hugging Face |
| Clasificadores especializados (p. ej. DeBERTa-v3) | ~0,1–0,4B | Texto | Clasificación discriminativa | MIT/Apache | Hugging Face |

La comparación relevante es funcional: frente a un LLM generativo de tamaño similar, Nischay ofrece salidas calibradas y latencia baja sin muestreo, a costa de no generar texto libre; frente a clasificadores pequeños, ofrece multimodalidad y múltiples preguntas por pasada con mayor capacidad. No se dispone de comparativas de rendimiento verificables en la información proporcionada.

## Limitaciones y advertencias

- Idioma: solo inglés; no se declara soporte multilingüe.
- Modelo no generativo: no produce texto libre ni mantiene conversaciones multi-turno; su uso está restringido a decisiones estructuradas con preguntas tipadas.
- Longitud de contexto no documentada: las peticiones que exceden la capacidad lanzan `Unsupported` sin truncado, lo que puede provocar fallos en producción si no se gestiona.
- Dependencia de un runtime propietario del autor (`OneJev` con parche `serve.patch` y librería `qev`): no hay soporte declarado en ecosistemas estándar como vLLM o llama.cpp, lo que aumenta el riesgo de mantenimiento y porta el modelo a un vendor lock-in de facto.
- Calibración en visión notablemente peor que en texto (ECE 8,90% frente a 3,62%): los umbrales de confianza para decisiones multimodales deben ajustarse con más cautela.
- Riesgo de alucinación: aunque el modelo no genera texto, las distribuciones de probabilidad pueden estar mal calibradas en dominios fuera de la distribución de entrenamiento; la abstención (`noul`) mitiga pero no elimina este riesgo.
- Sesgos: no se documentan evaluaciones de sesgo ni composición del dataset de entrenamiento, lo que impide auditar sesgos demográficos o culturales.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con fecha de creación en 2026; no hay evidencia de uso en producción ni validación independiente de los benchmarks declarados.
- Licencia Apache 2.0: permite uso comercial, pero el runtime `OneJev` y el kit `decision-index` pueden tener condiciones propias no detalladas en la información disponible.
- Capacidades de audio no documentadas pese a la presencia de una torre de audio de 0,31B: no debe asumirse soporte de audio en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ajeet-001/Nischay
- Dataset de resultados del Jev Decision Index: https://huggingface.co/datasets/Ajeet-001/Nischay-decision-index-results
- Repositorio del Jev Decision Index: https://github.com/apolinario/decision-index
