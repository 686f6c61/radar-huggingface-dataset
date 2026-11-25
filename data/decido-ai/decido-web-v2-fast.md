# decido-ai/decido-web-v2-fast

## Resumen

Decido-Web v2-Fast es un modelo de decisión especializado para agentes de navegador, desarrollado por decido-ai. No es un modelo conversacional general: en cada paso de una tarea web, un agente debe decidir qué operación ejecutar (click, type, select, scroll, wait, done, blocked) y sobre qué elemento, y este modelo responde a esas dos preguntas con una probabilidad calibrada para cada opción, en el formato de petición "System One" (`POST /v1/systemone`) del agente de código abierto Jev Ultrafast.

Se trata de un fine-tune completo de Qwen3-4B (4.411.424.256 parámetros reales en safetensors) que imita a Decido-Web v2, un modelo MoE de 26B con 4B activos. El resultado es un modelo 2,5 veces más rápido que su profesor, con una precisión algo menor. Su ventana de contexto es de 32.768 tokens y las páginas más largas se truncan por el final en lugar de fallar.

Su relevancia radica en el coste por decisión: 209 ms de mediana en una A100, frente a los 525 ms de Decido-Web v2 o los ~2 s de Claude Opus 5.5. Está pensado para ejecutarse en GPU NVIDIA (pesos en bf16, 8,8 GB) y admite un modo en cascada denominado Fast+, en el que el modelo pequeño responde todos los pasos y cede los dudosos al modelo grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (las páginas más largas se truncan por el final) |
| Tipos de cuantizacion | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso, y se somete a un fine-tune completo durante una época. Se eligió el checkpoint 1200 de 1586 según la tasa de éxito en vivo sobre 60 tareas de desarrollo y, posteriormente, sobre el conjunto de desarrollo de Mind2Web. El entrenamiento emplea 90.666 ejemplos: estados de decisión de la mezcla de entrenamiento de Decido-Web v2 con objetivos calculados como 0,5 × respuesta gold + 0,5 × probabilidades de Decido-Web v2; 41.039 estados adicionales de agente etiquetados solo por Decido-Web v2; y 13.305 ejemplos de decisión generales de Decido-1. No se usaron salidas de Jev, Claude ni de ningún modelo de OpenAI, ni tareas de test (se aplicó una comprobación automática de fuga contra todo el material de evaluación).

La innovación principal no está en la arquitectura, sino en el objetivo de destilación con probabilidades calibradas y en el formato de salida: el modelo devuelve una distribución de probabilidad sobre operaciones y sobre el elemento objetivo, lo que permite construir una cascada con umbral. En el modo Fast+, si el producto de la máxima probabilidad de operación por la máxima probabilidad del objetivo de esa operación cae por debajo de 0,6 (umbral elegido sobre el conjunto de desarrollo de Mind2Web), la petición se reenvía a Decido-Web v2 y se usa su respuesta; esto ocurre en aproximadamente el 37–40 % de los pasos.

## Capacidades

- Predicción de la operación a ejecutar en un paso de navegación web: click, type, select, scroll, wait, done o blocked.
- Predicción del elemento objetivo de la operación, con probabilidad calibrada para cada opción.
- Salida en el formato de petición "System One" (`POST /v1/systemone`) compatible con el agente Jev Ultrafast.
- Modo en cascada Fast+ mediante el router `fast_plus.py` incluido en el repositorio, que combina este modelo con Decido-Web v2.
- Manejo de páginas largas mediante truncado por el final hasta el límite de 32.768 tokens.
- Integración con dos motores de inferencia: vLLM (ruta rápida) y transformers (motor por defecto).
- No es un modelo conversacional general ni soporta tool calling, agentes multi-step por sí mismo, visión, audio ni modo thinking: su función es acotada a la decisión por paso dentro de un agente externo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Automatización de tareas de navegación en sitios públicos: el modelo decide cada paso (operación y elemento) en tareas cortas de navegación y búsqueda, con un 67,5 % de éxito en el banco de sitios públicos del autor y 209 ms de mediana por decisión, lo que permite bucles de agente ágiles.
- Despliegue en cascada con presupuesto ajustado: servir v2-Fast en una GPU y Decido-Web v2 en otra, con el router `fast_plus.py` y umbral 0,6, para obtener un 78,0 % de éxito en sitios públicos con 303 ms de mediana, frente al 81,0 % y 329 ms del modelo grande solo.
- Agentes de navegador de código abierto: integración directa con Jev Ultrafast mediante el endpoint compatible `POST /v1/systemone`, sustituyendo al backend por API con una latencia de 175–209 ms frente a los ~80 ms de la API de Jev.
- Evaluación y anotación de trayectorias web: al devolver probabilidades calibradas por opción, el modelo sirve para puntuar decisiones grabadas y detectar pasos ambiguos; en Mind2Web acierta la operación en el 93,3 % de los pasos y el elemento en el 77,7 %.
- Tareas largas en sitios autoalojados (WebArena): el modelo mantiene el bucle de decisión en tareas de compra, administración de tienda, foro, GitLab y Wikipedia, aunque con una tasa de éxito baja (8,7 %), por lo que se recomienda solo como componente de bajo coste dentro de un sistema mayor.
- Servicio de inferencia con vLLM: el motor `--engine vllm` ofrece ~0,3 s por paso en un conjunto mixto de 150 peticiones reales con páginas largas, frente a ~0,85 s del motor transformers por defecto, ambos con la misma elección en ≥ 98,8 % de las preguntas.
- Investigación sobre destilación y calibración: el modelo documenta con detalle la mezcla de datos (gold + probabilidades del profesor) y el criterio de selección de checkpoint, lo que lo hace útil como referencia reproducible para destilar modelos de decisión.

## Benchmarks y rendimiento

| Test | v2-Fast | Fast+ (cascada) | Decido-Web v2 | v2 + Claude Opus 5.5 | Claude Opus 5.5 solo | Jev 1.14 |
|---|---:|---:|---:|---:|---:|---:|
| Sitios públicos, 100 tareas cortas × 2 ejecuciones | 67,5 % | 78,0 % | 81,0 % (repetición 79,5 %) | 89,0 % | 89,0 % | 70,0 % |
| WebArena autoalojado, 300 tareas nuevas × 2 | 8,7 % | no ejecutado | 11,0 % | 61,2 % | 37,0 % | no ejecutado |
| Mind2Web, 1.500 pasos humanos | 75,2 % | 79,4 % | 78,2 % | – | – | 59,9 % |
| Tiempo por decisión (1× A100, p50) | 209 ms | 458 ms | 525 ms | ~2,7 s | ~2,0 s | ~80 ms (API) |

En Mind2Web, v2-Fast obtiene 77,7 % en elemento y 93,3 % en operación. La comparación v2-Fast frente a v2 en Mind2Web es de −3,0 puntos (IC 95 % de −5,1 a −0,9). En sitios públicos, la diferencia frente a Jev 1.14 es de −2,5 puntos (no significativa); en Mind2Web es de +15,3 puntos. En WebArena, v2-Fast frente a v2 es de −2,3 puntos (IC de −5,2 a +0,5, no significativo). La latencia p95 con vLLM en una A100 es de 339 ms.

## Requisitos de hardware

- VRAM estimada: 8,8 GB de pesos en bf16; el autor indica que funciona en cualquier GPU con ≥ 16 GB.
- GPU recomendadas: NVIDIA A100 80 GB (mediciones publicadas); cualquier GPU NVIDIA con al menos 16 GB de VRAM.
- No hay build para portátil ni CPU (GGUF) en el momento de la publicación.
- Motores de despliegue: vLLM (`pip install "decido-ai[vllm]>=1.2.0"`, ruta rápida) y transformers (`pip install "decido-ai[gpu]>=1.2.0"`, motor por defecto, más lento). El servidor se arranca con `decido serve decido-ai/decido-web-v2-fast --device cuda --port 8146`.
- Latencia: p50 de 209 ms y p95 de 339 ms con vLLM en una A100, una petición a la vez, sobre 200 peticiones reales de agente. Con el motor transformers, ~0,85 s por paso en un conjunto mixto de 150 peticiones frente a ~0,3 s con vLLM.
- La cascada Fast+ requiere servir ambos modelos, preferiblemente en GPU separadas, más el router `fast_plus.py` (solo necesita `httpx`).
- Requisitos de software: Python ≥ 3.10 y `decido-ai` ≥ 1.2.0 (≥ 1.3.0 para el comando `decido agent`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Sitios públicos | Mind2Web | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Decido-Web v2-Fast | 4,4B (denso) | 32.768 | 67,5 % | 75,2 % | apache-2.0 | Hugging Face, GPU NVIDIA |
| Decido-Web v2 | 26B (MoE, 4B activos) | 32.768 | 81,0 % | 78,2 % | no disponible en la información | Hugging Face |
| Jev 1.14 | no disponible | no disponible | 70,0 % | 59,9 % | no disponible | API (código abierto Jev Ultrafast) |
| Claude Opus 5.5 | no disponible | no disponible | 89,0 % | – | propietaria | API |

Frente a Decido-Web v2, el modelo sacrifica 13,5 puntos en sitios públicos y 3,0 en Mind2Web a cambio de ser 2,5 veces más rápido (209 ms frente a 525 ms). Frente a Jev 1.14, pierde 2,5 puntos en sitios públicos (no significativo) pero gana 15,3 en Mind2Web, con mayor latencia (209 ms frente a ~80 ms de API). Frente a Claude Opus 5.5, la diferencia en sitios públicos es de 21,5 puntos a favor del modelo propietario, con una latencia diez veces menor en el modelo local.

## Limitaciones y advertencias

- Precisión limitada: 67,5 % en sitios públicos y solo 8,7 % en WebArena autoalojado, donde las tareas son largas; no es adecuado como único componente de un agente en producción sin la cascada Fast+ o sin un modelo mayor.
- El modelo solo entiende inglés (`language: en`); no se documenta soporte de otros idiomas.
- No es un modelo conversacional: no genera texto libre, no soporta tool calling general ni razonamiento multi-step por sí mismo; su salida es una distribución de probabilidad sobre operaciones y elementos.
- El truncado de páginas largas se hace por el final, por lo que la información situada al final de una página extensa se pierde.
- No hay build GGUF ni soporte de CPU/portátil; requiere GPU NVIDIA con al menos 16 GB de VRAM.
- El umbral 0,6 de la cascada Fast+ se eligió sobre el conjunto de desarrollo de Mind2Web; no se garantiza que sea óptimo en otros dominios.
- Riesgo de alucinación no evaluado de forma específica en la información disponible; el modelo puede asignar probabilidad alta a elementos inexistentes o ambiguos en páginas mal estructuradas.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia apache-2.0, que permite uso comercial; el modelo base Qwen3-4B también es apache-2.0 según la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-web-v2-fast
- Modelo profesor Decido-Web v2: https://huggingface.co/decido-ai/decido-web-v2
- Agente Jev Ultrafast: https://github.com/browser-use/jev-ultrafast
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Paquete `decido-ai` (instalación y servidor): no disponible como enlace directo en la información proporcionada
