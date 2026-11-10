# jacobmahurin/C8LINN_qwen3.5-0.8b-C8-router

## Resumen

C8LINN (C8 Language-Intent Neural Network, pronunciado "Caitlyn") es un modelo derivado de Qwen3.5 0.8B reconvertido en un enrutador de intenciones (intent router) para un asistente offline llamado Backplane. En lugar de mantener una conversación, el modelo traduce una petición en inglés a una de once operaciones concretas (por ejemplo `sort_by:date`, `filter_positive`, `none`), que posteriormente ejecuta el programa que lo invoca. Lo desarrolla jacobmahurin y se distribuye bajo licencia Apache 2.0.

Técnicamente es un LoRA de 22 MB entrenado sobre Qwen3.5 0.8B tras eliminar la torre de visión del modelo base y recortar su vocabulario de 248K a 82K tokens, lo que reduce el peso total en disco a 354 MB (332 MB de base más 22 MB de adaptador). El modelo está empaquetado en formato MLX y está pensado exclusivamente para ejecutarse en Apple Silicon, con un consumo pico de 484 MB y 0,21 s por petición en un M1 de 8 GB.

Su relevancia es acotada pero clara: demuestra que un modelo de menos de mil millones de parámetros, recortado y ajustado con solo 1.592 ejemplos, puede superar ampliamente a su versión sin entrenar en una tarea de clasificación cerrada (91% de acierto frente a 61% en conjuntos sellados). No es un modelo de propósito general ni un chatbot: es un componente especializado de un pipeline mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5 0.8B) con torre de visión eliminada y vocabulario recortado de 248K a 82K tokens; adaptador LoRA de 22 MB |
| Parametros totales | 0,8B (modelo base); adaptador LoRA de 22 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base upstream se cita en versión 4-bit; este release se distribuye en safetensors MLX) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); adaptador LoRA; `model/model.safetensors` de 328,5 MB |
| Tamano en disco | 354 MB (332 MB base + 22 MB adaptador) |
| Libreria | mlx (probado con mlx 0.32.4 y mlx-vlm 0.7.11, Python 3.12, macOS 26.2) |
| Modelo base | Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5 0.8B, un transformer denso de la familia Qwen. Sobre él se aplican dos transformaciones: se elimina por completo la torre de visión (de ahí el aviso esperado de que el checkpoint no tiene pesos para `vision_tower`) y se recorta el vocabulario de 248K a 82K tokens, lo que reduce el tamaño del embedding y del cabezal de salida. Sobre esa base recortada se entrena un adaptador LoRA de 22 MB con 1.592 peticiones en inglés, orientado a clasificar la intención en una de once operaciones.

El entrenamiento es de ajuste supervisado para clasificación de intenciones, no se documenta RLHF ni DPO. La innovación principal no está en la arquitectura sino en el enfoque de ingeniería: recortar vocabulario y visión para obtener un artefacto de 354 MB que cabe y corre con holgura en un Apple M1 de 8 GB, con la mitad de memoria pico y la mitad de latencia que el modelo base sin entrenar (484 MB y 0,21 s frente a 930 MB y 0,39 s). El autor documenta además un mecanismo de umbral de confianza (`--cutoff 0.7`) que convierte respuestas poco seguras en preguntas de aclaración en lugar de acciones erróneas.

## Capacidades

- Clasificación de intenciones en inglés: asigna una petición a una de once operaciones predefinidas.
- Salida con puntuación de confianza por petición, explotable para umbrales de decisión.
- Modo de abstención: devuelve `none` o `unclear` cuando no reconoce la operación, lo que constituye el error "seguro".
- Procesamiento por lotes desde fichero (`python route.py --cutoff 0.7 < my_requests.txt`).
- Uso programático desde Python mediante `Router` y `decide`.
- No soporta tool calling genérico, agentes multi-paso ni razonamiento abierto: es un clasificador cerrado, no un generador conversacional.
- No soporta visión (torre eliminada), audio ni modo thinking.
- Multilingüe: no; solo inglés.

## Casos de uso

- Enrutamiento de comandos en asistentes de voz o texto offline: el modelo traduce "could you put my invoices in order, oldest first" a `sort_by:date` con confianza 1.000, y el programa ejecuta la operación. Adecuado por su latencia de 0,21 s y su huella de 484 MB.
- Automatización de escritorio en macOS: integrado en un asistente local tipo Backplane, decide si una petición es una tarea simple, una tarea grande de varios pasos o una pregunta, sin salir del equipo.
- Filtrado previo en pipelines de agentes: actúa como primera etapa que descarta peticiones fuera de dominio (`none`) antes de invocar un modelo mayor, ahorrando coste y latencia.
- Procesamiento por lotes de peticiones registradas: con `--cutoff 0.7` y entrada desde fichero, clasifica grandes volúmenes de solicitudes y marca las dudosas para revisión humana.
- Clasificación de tickets o correos en categorías de acción: las once operaciones pueden mapearse a colas de trabajo concretas, con la abstención como mecanismo de escalado.
- Prototipado e investigación sobre modelos pequeños: sirve como referencia reproducible de hasta dónde llega un 0,8B ajustado con 1.592 ejemplos en una tarea cerrada, con conjuntos de evaluación sellados y scripts incluidos.
- Despliegue en hardware de gama baja Apple Silicon: un M1 de 8 GB es suficiente, lo que permite embeberlo en aplicaciones de escritorio sin GPU dedicada.

## Benchmarks y rendimiento

Resultados del autor sobre conjuntos sellados (correcto / acción errónea / abstención), medidos con los ficheros de este release y `evaluate.py` en un Apple M1 de 8 GB:

| Conjunto | Filas | C8LINN | Qwen3.5 0.8B sin entrenar |
|---|---:|---:|---:|
| r3 (sellado) | 335 | 303 / 27 / 5 | 185 / 99 / 51 |
| r4 (sellado, nuevas voces) | 365 | 325 / 27 / 13 | 233 / 80 / 52 |
| r5 (sellado, nuevas voces) | 383 | 357 / 20 / 6 | 238 / 93 / 52 |
| **Total** | **1.083** | **985 / 74 / 24** | **656 / 272 / 155** |

- Acierto global: 91% frente a 61%; acciones erróneas: 7% frente a 25%.
- Con `--cutoff 0.7`: las acciones erróneas bajan de 74 a 40 y 51 aciertos pasan a preguntas (r3 290/16/29, r4 308/14/43, r5 336/10/37).
- Conjuntos de ajuste y cribado (favorecen al modelo): v2 228/2/4, r2 128/6/0.
- Referencia externa del mismo proyecto: un enrutador Qwen3.5 4B obtuvo 317/12/6 en r3 (según registros del proyecto, no reejecutado).

Coste medido en r3 (memoria pico MLX, M1 de 8 GB, modelo ya cargado):

| Métrica | Qwen3.5 0.8B sin entrenar | C8LINN |
|---|---:|---:|
| Ficheros en disco | 652 MB | 354 MB |
| Memoria pico | 930 MB | 484 MB |
| Tiempo por petición | 0,39 s | 0,21 s |

Benchmark end-to-end b1 (asistente completo, 149 ítems en tres formulaciones):

| Porcentaje correcto | 0.8B sin entrenar | C8LINN |
|---|---:|---:|
| Tareas simples | 46% | 94% |
| Tareas grandes (2-4 pasos) | 3% | 62% |
| Preguntas simples | 19% | 38% |
| Preguntas complejas | 15% | 21% |

Tras tres correcciones en la aplicación (no en el modelo): tareas simples 54% frente a 100%, tareas grandes 10% frente a 90%; el autor advierte que esas correcciones se diseñaron sobre b1 y por tanto favorecen al modelo.

## Requisitos de hardware

- Memoria pico en inferencia: 484 MB (medido con MLX en M1 de 8 GB).
- Hardware soportado: exclusivamente Apple Silicon (MLX). Probado en un M1 de 8 GB con macOS 26.2, Python 3.12, mlx 0.32.4 y mlx-vlm 0.7.11.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este release, que depende de MLX.
- Cabe en cualquier Mac con Apple Silicon; no requiere GPU dedicada.
- Despliegue: scripts incluidos `route.py` (CLI) y API Python `Router`/`decide`; descarga vía `hf download` o clonado de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,21 s por petición; throughput no disponible más allá de esa cifra por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| C8LINN (este) | 0,8B + LoRA 22 MB | no disponible | Enrutador de 11 operaciones, inglés | Apache 2.0 | Hugging Face y GitHub, MLX |
| Qwen3.5 0.8B (base) | 0,8B | no disponible | Propósito general | Apache 2.0 (según base) | Hugging Face |
| Enrutador Qwen3.5 4B del mismo proyecto | 4B | no disponible | Enrutador de 11 operaciones | no disponible | No liberado en este release |
| Qwen3.5 0.8B recortado sin adaptador | 0,8B | no disponible | Propósito general con vocabulario reducido | Apache 2.0 | Incluido como referencia en los resultados |

En acierto de enrutamiento sobre r3: C8LINN 303/335 frente a 317/335 del 4B del proyecto y 185/335 del 0.8B sin entrenar. El 0.8B recortado sin adaptador se evalúa en b1 pero no se publican sus cifras de enrutamiento por separado.

## Limitaciones y advertencias

- No es un chatbot: solo nombra la operación; el trabajo lo hace el programa invocador.
- Solo inglés; no soporta otros idiomas.
- Solo Apple Silicon vía MLX; no hay pesos GGUF ni soporte para CUDA.
- El vocabulario recortado pierde tokens raros: el autor documenta que no tiene " II" y que el chat escribió "World War I" por "World War II".
- Las preguntas factuales son débiles: el chat usa el modelo base con el adaptador desactivado y acierta aproximadamente la mitad de los hechos simples.
- Riesgo de acción errónea del 7% en conjuntos sellados; con `--cutoff 0.7` baja al entorno del 3-4% a costa de convertir aciertos en preguntas.
- Los conjuntos de ajuste (v2, r2) y las cifras de b1 tras correcciones favorecen al modelo; no deben tomarse como estimaciones imparciales.
- Entrenado con solo 1.592 peticiones: la cobertura de formulaciones fuera de dominio es limitada y la abstención es el comportamiento esperado ante entradas no vistas.
- Sin datos publicados sobre sesgos demográficos o sociales; la tarea cerrada reduce pero no elimina el riesgo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 0.8B debe verificarse por separado.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jacobmahurin/C8LINN_qwen3.5-0.8b-C8-router
- GitHub: https://github.com/notjackwhite/C8LINN_qwen3.5-0.8b-C8-router
- Pesos base (release v1.0): https://github.com/notjackwhite/C8LINN_qwen3.5-0.8b-C8-router/releases/download/v1.0/model.safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Resultados b1 antes de correcciones: `results/b1-before-app-fixes.json` (en el repositorio)
- Resultados b1 después de correcciones: `results/b1-after-app-fixes.json` (en el repositorio)
