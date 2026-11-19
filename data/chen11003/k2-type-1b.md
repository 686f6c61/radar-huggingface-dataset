# chen11003/K2-Type-1B

## Resumen

K2-Type-1B es un modelo de decisión desarrollado por el usuario chen11003, un fine-tune completo del backbone IFM/K2-Horizon-0.9B (1.078.285.824 parámetros almacenados, incluyendo la cabeza de lenguaje del modelo base, que queda sin usar). No es un modelo generativo: recibe un estado (texto o JSON) y un conjunto de preguntas tipadas, y devuelve en un único forward pass una distribución de probabilidad sobre las opciones de cada pregunta. Está inspirado en el enfoque de "decision models" de TypeSafe (familia Jev/Kev) y adopta su formato de cable `/v1/systemone`.

El modelo resuelve un problema concreto: sustituir llamadas a LLM generativos en tareas de clasificación, enrutamiento y calibración donde la latencia y la consistencia importan. Soporta tres tipos de pregunta: `noul` (probabilidad de que un enunciado sea verdadero), `choice` (selección entre 1 y 255 opciones con descripciones opcionales) y `score` (nivel esperado sobre 2-255 niveles ordenados). Las preguntas comparten el estado pero no se ven entre sí gracias a una máscara de atención block-causal, de modo que añadir preguntas no altera las respuestas existentes.

Es relevante porque demuestra que un backbone de ~1B puede alcanzar 0.762 de acierto en el conjunto público de JevBench con latencias de 27 ms p50 y 60 ms p95 por decisión en una H200, compitiendo con sistemas mayores en una tarea donde la calibración (ECE 0.065, Brier 0.328) es tan importante como la precisión. La licencia Apache 2.0 y la disponibilidad de los pesos en safetensors facilitan su evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con máscara de atención block-causal y cabeza pointer para scoring de opciones (fine-tune del backbone K2-Horizon-0.9B) |
| Parametros totales | 1.078.285.824 (incluye la cabeza de lenguaje del modelo base, no usada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (límite indicado en la model card; documentos muy largos son un punto débil) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`pointer_head.safetensors`, pesos del backbone; repo de 2.2 GB) |

## Arquitectura y entrenamiento

El modelo parte del backbone IFM/K2-Horizon-0.9B y se entrena mediante fine-tune completo para una tarea de decisión. La entrada se serializa con cinco tokens reservados del tokenizador base (`decision_config.json`) con el esquema `<state> ... | <q> question <opt> option </opt> ... <decide> | <q> ...`. Una cabeza pointer (`pointer_head.safetensors`) puntúa el estado oculto del token `</opt>` de cada opción contra el estado oculto del token `<decide>` de su pregunta; un softmax con temperatura 1.478 convierte esas puntuaciones en probabilidades. La máscara block-causal garantiza que cada pregunta solo atiende al estado y a su propio bloque, lo que hace las respuestas independientes entre preguntas.

El entrenamiento se realizó sobre aproximadamente 354.000 registros de decisión: conjuntos públicos de clasificación, NLI y QA, datos de decisión de Kev, posiciones de juego con etiquetas exactas o de búsqueda, e ítems sintéticos escritos y verificados a ciegas por un modelo grande. Los objetivos se mezclaron con etiquetas suaves de un modelo profesor de decisión de 7B. Después se aplicaron 50 iteraciones de PPO sobre Snake y un reajuste de temperatura sobre datos de calibración reservados. Los datos se comprobaron contra todas las suites de evaluación de Kev y contra los 231 ítems públicos de JevBench, sin solapamiento exacto ni por contención. El código de entrenamiento y los datos no se han publicado.

## Capacidades

- Clasificación y enrutamiento: devuelve la mejor opción, su confianza y la distribución completa sobre 1-255 opciones con descripciones opcionales.
- Evaluación de enunciados: calcula P(true) para un enunciado, con definiciones opcionales de falso y verdadero.
- Puntuación ordinal: estima el nivel esperado y la probabilidad por nivel sobre 2-255 niveles ordenados.
- Multitarea en un solo forward pass: varias preguntas comparten estado sin interferirse entre sí.
- Salida calibrada: probabilidades ajustadas por temperatura (ECE 0.065 en JevBench público).
- Juego: los mismos pesos juegan a Snake sobre un tablero textual (una pregunta `choice` y cuatro de sí/no por movimiento), con 66 comidas de media en tablero 12x12 (máximo 101).
- Servidor HTTP compatible con el formato `/v1/systemone` de TypeSafe, de modo que clientes escritos para Jev o Kev funcionan sin cambios.
- No soporta tool calling, agentes, generación de texto, visión ni audio. El propio autor advierte de no usar el backbone para generación de texto.

## Casos de uso

- Enrutamiento de tickets de soporte: el ejemplo de la model card clasifica un ticket en colas (facturación, técnico, general), estima si el cliente está enfadado y puntúa la urgencia en una sola llamada de 27 ms p50, lo que permite integrarlo en el front de un helpdesk sin coste perceptible.
- Moderación y triaje de contenido: usar preguntas `noul` encadenadas ("el texto contiene amenazas", "el texto es spam") sobre un estado JSON con metadatos, aprovechando que las preguntas son independientes y no se contaminan entre sí.
- Clasificación de documentos en pipelines ETL: preguntas `choice` con hasta 255 categorías nombradas y descripciones, útil para taxonomías internas donde un LLM generativo sería más caro y menos determinista.
- Encuestas y formularios con escala ordinal: preguntas `score` sobre niveles ("Bajo", "Normal", "Alto", "Crítico") para derivar el nivel esperado y la incertidumbre por ítem, con calibración explícita.
- Evaluación automática de respuestas: dado un par pregunta/respuesta como estado, preguntas `noul` sobre corrección factual o adecuación de tono, con probabilidades comparables entre ítems.
- Decisión en agentes de juego o simulación: el caso Snake demuestra que el modelo puede actuar como política de decisión sobre un tablero textual con etiquetas de búsqueda, extensible a otros entornos discretos.
- Filtro previo a un LLM mayor: usar las probabilidades del modelo para decidir si una consulta requiere un modelo generativo, reduciendo coste y latencia en el camino crítico.

## Benchmarks y rendimiento

JevBench público (231 ítems, commit 26eb72d, adaptador `typesafe`, una H200, sin red):

| Tier | Aciertos | Total |
|---|---|---|
| standard (`original.jsonl`) | 66 | 72 |
| easy (`easy.jsonl`) | 47 | 48 |
| hard (`hard.jsonl`) | 63 | 111 |
| Total | 176 | 231 (0.762) |

Métricas adicionales reportadas: Brier 0.328, ECE 0.065, latencia p50 27 ms y p95 60 ms por decisión, 590 tokens de entrada de media por decisión.

Comparativa con el tablero público de JevBench v1.4 (según la model card):

| Sistema | Acierto público |
|---|---|
| Jev 1.13.0 | 0.866 |
| Qwen3.5-4B (entradas) | 0.74-0.82 |
| K2-Type-1B | 0.762 |
| Gemma 4 E2B + LoRA (system-one-open) | 0.732 |
| decider-2b | 0.710 |
| kev 0.6B | 0.667 |
| kev 4B | 0.662 |

El autor advierte de que la puntuación oficial de JevBench usa ítems sellados y que todos los sistemas listados rinden bastante por debajo de su precisión pública en ellos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 1.078 M de parámetros en fp16 los pesos ocupan aproximadamente 2,2 GB, más overhead de activaciones y del servidor. Se recomienda holgura sobre ese mínimo.
- GPU recomendadas: el autor valida el servidor en una H200; cualquier GPU CUDA con memoria suficiente para los pesos en fp16 debería servir, aunque no se publican pruebas en otras tarjetas.
- GPU de consumo: no confirmado. Por tamaño de pesos cabría en RTX 4090, RTX 4080 o RTX 3090, pero el repo no documenta despliegue en estas tarjetas ni cuantizaciones ligeras.
- Despliegue: el repo incluye un servidor propio (`python -m jev.serve --run . --port 8000`) que requiere una GPU CUDA; expone `/v1/systemone` y `GET /health`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el uso de `transformers` requiere versión >= 5.17 con código remoto (probado con torch 2.8).
- Latencia: 20-60 ms por petición tras el calentamiento inicial de CUDA (unos segundos en la primera llamada); p50 27 ms y p95 60 ms por decisión en H200. Throughput no publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Type-1B | 1.078 M (1B) | 8192 | Decisión por pointer head, sin generación | Apache 2.0 | Pesos y servidor en HF |
| Jev 1.13.0 | no disponible | no disponible | Decisión (referencia de TypeSafe) | no disponible | Referencia en JevBench |
| decider-2b | ~2B | no disponible | Decisión | no disponible | Referencia en JevBench |
| kev 0.6B | 0.6B | no disponible | Decisión | no disponible | Referencia en JevBench |
| Gemma 4 E2B + LoRA | ~2B efectivos | no disponible | LLM con LoRA para decisión | no disponible | Referencia en JevBench |

En acierto público, K2-Type-1B (0.762) supera a Gemma 4 E2B + LoRA (0.732), decider-2b (0.710) y kev 0.6B/4B (0.667/0.662), y queda por debajo de Jev 1.13.0 (0.866) y del rango de Qwen3.5-4B (0.74-0.82). No se dispone de datos de calibración ni latencia de los competidores para comparar en esas dimensiones.

## Limitaciones y advertencias

- Una sola pasada, sin razonamiento: aritmética multi-paso, diferencias de fechas y documentos de más de 8192 tokens son puntos débiles reconocidos por el autor.
- Calibración dependiente de la distribución: el ajuste de temperatura se hizo sobre la suite de calibración de Kev; en otras distribuciones las probabilidades pueden ser demasiado confiadas o demasiado conservadoras (ECE 0.065 en JevBench público).
- Respuestas acotadas a las opciones dadas: no puede responder "ninguna de estas" salvo que se ofrezca esa opción explícitamente.
- Idioma: solo inglés; no hay soporte declarado para castellano ni otros idiomas.
- No es un modelo generativo: el backbone conserva la cabeza de lenguaje del modelo base pero no está entrenada para generar; usarla produciría texto sin garantías.
- Datos de entrenamiento y código no publicados: dificulta la auditoría y la reproducción, aunque se declara ausencia de solapamiento con Kev y JevBench público.
- Sin cuantizaciones oficiales: el despliegue en GPUs de consumo o en entornos sin CUDA no está documentado.
- Riesgo de sesgo y alucinación: no se documentan análisis de sesgo; al ser un clasificador acotado el riesgo de alucinación de contenido es bajo, pero las etiquetas y descripciones de opciones condicionan fuertemente la salida.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base IFM/K2-Horizon-0.9B antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chen11003/K2-Type-1B
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- Repositorio de JevBench: https://github.com/fstandhartinger/jevbench
- Referencia de TypeSafe (Jev/Kev): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
