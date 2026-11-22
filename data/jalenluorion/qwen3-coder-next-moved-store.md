# jalenluorion/Qwen3-Coder-Next-moved-store

## Resumen

Qwen3-Coder-Next-moved-store es una conversión del modelo Qwen3-Coder-Next de Alibaba (arquitectura Qwen3-Next 80B-A3B, mixture-of-experts con 80.000 millones de parámetros totales y 3.000 millones activos) que reubica el 97 % de los parámetros en disco y mantiene solo el 3 % en memoria. El autor, jalenluorion, ha empaquetado los 24.576 expertos enrutados en formato int8 sobre SSD (72,4 GiB) y ha añadido routers auxiliares entrenados para predecir, con cuatro capas de antelación, qué expertos necesitará cada capa, de modo que se puedan precargar desde el disco mientras se calculan las capas intermedias.

El objetivo es hacer viable un modelo de código de 80B en un Apple Silicon con 16 GB de memoria unificada, algo imposible con los pesos originales (151 GB en bf16). No se ha reentrenado el modelo base: solo se han entrenado los routers de predicción (466M de parámetros), que imitan a los routers originales con el modelo congelado. La licencia es Apache-2.0, igual que el modelo del que deriva.

Es relevante porque demuestra una técnica de offloading selectivo de expertos MoE que permite ejecutar modelos de frontera en hardware de consumo, con una penalización de latencia acotada (4-6 tokens/s en un M4 de 16 GB) y una degradación de calidad mínima (0,006-0,010 nats de gap de pérdida frente al modelo original).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y atención lineal, mixture-of-experts (Qwen3-Next 80B-A3B) |
| Parámetros totales | 80B (2,36B residentes + 466M routers + 77,3B expertos enrutados) |
| Parámetros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados en int8 (una escala fp16 por neurona); resto de pesos en fp16; modelo original en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (parte residente), binario int8 propio (`store/layer_XX.bin`), routers en PyTorch (`.pt`); librería mlx |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-Next emplea la arquitectura Qwen3-Next 80B-A3B: capas de atención completa combinadas con capas de atención lineal, y un MoE con 512 expertos por capa del que el router original selecciona los 10 mejores. La conversión mantiene intactos atención, embeddings, cabeza de salida, expertos compartidos y compuertas del router original, cargados en fp16. Los expertos enrutados se almacenan en disco en int8 con registros de 3,0 MiB y una escala fp16 por neurona. La cabeza de predicción multi-token de la release original no está incluida.

La innovación clave son los routers "lag-4": una red pequeña por capa que lee el estado oculto del token cuatro capas antes y predice qué expertos elegirá el router original en esa capa. Se entrenaron sobre 10M de tokens de wikitext, FineWeb-Edu y texto de chat, con warm-start desde los routers del modelo Instruct (10,7 horas en cuatro A6000). El recall top-10 alcanza el 82-83 %, idéntico al de los routers del Instruct. En modo prefetch (por defecto) ningún experto se lee durante el cálculo de su propia capa: si la predicción falla, el router original elige entre lo que ya está en memoria y la salida varía ligeramente. En modo exacto (`--mode exact`) los routers solo deciden la precarga y cualquier experto ausente se lee bajo demanda, garantizando la salida del modelo original con expertos int8.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3-Coder-Next.
- Generación y edición de código en múltiples lenguajes, con orientación explícita a flujos agénticos de programación.
- Uso de herramientas (tool calling / function calling): bajo el prompt estándar de OpenCode utiliza herramientas desde el primer mensaje y las encadena; el modelo Instruct equivalente tiende a responder en texto en su lugar.
- Razonamiento multi-paso y comportamiento agéntico en entornos de desarrollo (OpenCode, API compatible con OpenAI).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking): no disponible en la información proporcionada.
- Visión y audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en portátil Apple Silicon: el modelo se ejecuta en un MacBook con 16 GB de RAM y unos 85 GB de disco, permitiendo un agente de programación de 80B en local sin GPU dedicada; adecuado para desarrolladores que trabajan en movilidad o con requisitos de privacidad.
- Integración en OpenCode u otros entornos agénticos de terminal: el repositorio incluye `demo/demo.sh` y `demo/opencode.json`, que levantan un servidor compatible con la API de OpenAI y abren OpenCode con su prompt y sus 10 herramientas estándar, sin instrucciones personalizadas.
- Automatización de tareas de refactorización y generación de funciones: con 4-6 tokens/s en M4, es viable para tareas por lotes o asíncronas (generar tests, documentar módulos) más que para autocompletado interactivo de baja latencia.
- Evaluación e investigación de técnicas de offloading MoE: el runner (`mlx_run.py`) y el layout de tres repos hermanos (Qwen3-Next-80B-A3B-Instruct y Qwen3-30B-A3B) permiten comparar modos prefetch y exacto, ajustar `--m` y `--keep`, y medir el compromiso entre bytes leídos por token y gap de pérdida.
- Servicio local de API compatible con OpenAI: el modo demo expone el motor como servidor HTTP, lo que permite conectarlo a clientes y pipelines existentes que hablen ese protocolo, con el prompt de sistema pre-rellenado y cacheado entre turnos.
- Prototipado de agentes de código con contexto largo: el prompt de sistema de 7.500 tokens de OpenCode se pre-rellena una vez y se restaura desde caché en los turnos siguientes (unos 80 s de re-prefill al primer arranque del día por la fecha incluida en el prompt).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados son de calidad (gap de pérdida) y de velocidad:

| Configuración | Gap de pérdida (wikitext-103 / FineWeb-Edu / UltraChat) | Lectura por token | Expertos en memoria |
|---|---|---|---|
| 10 nombrados, keep=1 | +0,009 / +0,010 / +0,006 nats | 774 MB | 726 (2,2 GB) |
| 10 nombrados, keep=3 | +0,008 / +0,008 / +0,003 nats | 598 MB | 1.125 (3,4 GB) |
| 10 nombrados, keep=3, máx. 24 slots por capa (por defecto) | +0,008 / +0,009 / +0,003 nats | 601 MB | 1.044 (3,1 GB) |

Pérdida de referencia del modelo original: 2,148 / 2,264 / 1,573 nats.

| Medición (Apple M4, 16 GB, SSD interno) | Resultado |
|---|---|
| Throughput en bench (`--bench --max-new 80`) | 5,2-5,5 tokens/s con 8,2 GB de memoria |
| Lectura de decodificación | ~530 MB por token |
| Espera de disco por token | 63-97 ms |
| Primer mensaje en chat simple ("hi") | 9 tokens pre-rellenados en 1,9 s, 11 tokens a 6,1 tokens/s |
| Primer mensaje en OpenCode | petición al servidor 0,9 s tras Enter, prompt cacheado restaurado y 9 tokens pre-rellenados en 2,6 s, 9 tokens a 5,7 tokens/s; reloj de OpenCode 5,1 s |
| Explicación de 100 palabras (chat) | 26 tokens pre-rellenados en 5,6 s, 158 tokens a 4,8 tokens/s |
| Explicación de 100 palabras (OpenCode) | 0,2 s al servidor, 26 tokens pre-rellenados en 5,6 s, 163 tokens a 4,7 tokens/s; reloj de OpenCode 40,6 s frente a 40,2 s de tiempo de modelo |

## Requisitos de hardware

- Memoria: 8,2 GB en uso durante la decodificación en el bench; el autor indica Apple Silicon con 16 GB o más.
- Disco: unos 85 GB libres (72,4 GiB de expertos más el resto de pesos y dependencias).
- GPU: no se soportan GPUs dedicadas; el runner está escrito para MLX y Apple Silicon. El entrenamiento de los routers se hizo en cuatro A6000, pero la inferencia es exclusivamente para Mac.
- Cabe en GPU de consumo: no aplica; requiere Apple Silicon (M-series) con memoria unificada de 16 GB o superior.
- Despliegue: `mlx-lm` con el runner incluido (`mlx_run.py`); modo servidor compatible con OpenAI en `demo/`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 4-6 tokens/s en M4 de 16 GB; 63-97 ms de espera de disco por token; ~530 MB leídos por token en decodificación; primer arranque del día con re-prefill del prompt de sistema de OpenCode de unos 80 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-Next-moved-store | 80B | 3B | no disponible | Apache-2.0 | MLX, Apple Silicon, 16 GB RAM |
| Qwen/Qwen3-Coder-Next (original) | 80B | 3B | no disponible | Apache-2.0 | Pesos bf16, 151 GB, requiere hardware de servidor |
| Qwen3-Next-80B-A3B-Instruct-moved-store | 80B | 3B | no disponible | Apache-2.0 | MLX, Apple Silicon; misma conversión para el modelo Instruct |
| Qwen3-30B-A3B-moved-store | 30B | 3B | no disponible | Apache-2.0 | MLX, Apple Silicon; misma conversión para el modelo de 30B |

La comparativa de rendimiento frente a alternativas no está disponible: no se han publicado benchmarks estándar para esta conversión ni para los modelos hermanos en la información proporcionada. El autor sí compara el gap de pérdida con la conversión del Instruct (0,002-0,003 nats más en general, con routers entrenados con la mitad de tokens).

## Limitaciones y advertencias

- Requiere Apple Silicon y MLX: no hay soporte para CUDA, ROCm ni otras plataformas en la información disponible.
- El modo prefetch (por defecto) no reproduce exactamente la salida del modelo original: si los routers lag-4 fallan, el router original elige entre los expertos ya cargados y la salida varía ligeramente. Solo el modo exacto garantiza equivalencia, a costa de lecturas bajo demanda.
- La cabeza de predicción multi-token de la release original no está incluida, por lo que se pierde esa capacidad del modelo base.
- Los expertos están cuantizados a int8; el resto de pesos en fp16, no en bf16, lo que introduce una diferencia adicional frente al original.
- El rendimiento depende fuertemente de la velocidad del SSD: 63-97 ms de espera por token en el M4 de referencia; discos externos o más lentos degradarán el throughput.
- El primer arranque del día con OpenCode re-prefilla el prompt de sistema (unos 80 s) porque incluye la fecha.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3-Coder-Next, hereda los del modelo base, no documentados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el habitual en modelos de código y agentes.
- Idiomas soportados: no disponibles; el modelo base está orientado a código y el entrenamiento de routers usó wikitext, FineWeb-Edu y chat, sin desglose por idioma.
- Licencia Apache-2.0 permite uso comercial, pero la conversión no ha sido validada por Alibaba; el autor no ofrece garantías de producción.
- El repositorio tiene 546 descargas y 2 likes en el momento de la consulta: comunidad pequeña y poca validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jalenluorion/Qwen3-Coder-Next-moved-store
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Conversión del Instruct: https://huggingface.co/jalenluorion/Qwen3-Next-80B-A3B-moved-store
- Conversión del 30B-A3B: https://huggingface.co/jalenluorion/Qwen3-30B-A3B-moved-store
- OpenCode: https://opencode.ai
