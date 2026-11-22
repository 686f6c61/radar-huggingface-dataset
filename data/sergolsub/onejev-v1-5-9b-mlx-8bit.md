# sergolsub/onejev-v1.5-9B-MLX-8bit

## Resumen

OneJev1.5 9B (MLX 8-bit) es una conversión cuantizada a 8 bits en formato MLX del modelo OmniJev/OneJev1.5-9B, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo nuevo ni de un reentrenamiento: el autor indica explícitamente que no hay cambios de arquitectura ni reentrenamiento, solo cuantización de los pesos originales. El repositorio incluye además un módulo de inferencia propio (`onejev_mlx.py`) y ficheros de configuración para un modo de decisión con cabeceras específicas.

El modelo base pertenece a la familia Qwen3.5 (según el tag `qwen3_5`) y cuenta con 9.409.813.744 parámetros totales en safetensors. La conversión ocupa 11,4 GB en disco y está pensada para ejecutarse en equipos con Apple Silicon; el autor reporta mediciones en un Mac mini M4 Pro con 48 GB de memoria unificada, con un pico de memoria residente de 12,21 GB.

La relevancia de esta ficha es doble: por un lado, documenta una opción práctica para desplegar un modelo de ~9B en hardware de Apple sin GPU dedicada; por otro, el modelo incorpora un modo de decisión estructurado (tipos `noul`, `choice` y `score`) orientado a tareas de clasificación y enrutamiento, lo que lo diferencia de una generación de texto convencional. La licencia es Apache 2.0, heredada de los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); incluye atención lineal en capas tempranas (`linear_attn.in_proj_a`) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base bf16 se usa como referencia de calidad |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base; prevalece la licencia del repositorio upstream en caso de conflicto) |
| Formato de pesos | safetensors en layout MLX (3 shards: 4,03 GB + 4,04 GB + 3,32 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de la familia Qwen3.5, según el tag del repositorio. El autor no documenta detalles de entrenamiento del modelo base: no se especifican número de tokens, composición del dataset ni si hubo RLHF o DPO. Esta conversión concreta no introduce cambios arquitectónicos ni reentrenamiento; únicamente aplica cuantización de 8 bits sobre los pesos bf16 originales.

El detalle técnico más relevante de esta conversión es la auditoría de cuantización incluida en el repositorio (`kl_audit.json`). Se compararon 760 tensores tensor a tensor mediante divergencia KL con histogramas de 512 bins entre los pesos dequantizados a 8 bits y los originales bf16. El resultado: KL media de 2,17e-04, KL máxima de 5,65e-03 y 249 tensores con KL distinto de cero. La peor capa es `model.language_model.layers.0.linear_attn.in_proj_a.weight` con KL 5,65e-03. La perplejidad de calibración pasa de 1,988 (bf16) a 1,985 (8 bits), prácticamente idéntica.

Además, el repositorio incluye un módulo `onejev_mlx.py` (19 KB) y ficheros `decision_config.json` y `joint_config.json` que implementan un modo de decisión con cabeceras específicas. El modelo soporta tres tipos de decisión: `noul` (booleano sí/no), `choice` (selección entre criterios con nombre) y `score` (puntuación ordinal sobre una lista de criterios). El autor indica que el tipo `box` (detección de cajas) no está soportado.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5.
- Modo de decisión estructurado con tres tipos de tarea: `noul` (respuesta booleana), `choice` (clasificación entre criterios nombrados) y `score` (puntuación sobre una escala de criterios ordenados).
- Procesamiento de imagen: el autor reporta mediciones con entrada de imagen 512x512 más texto, lo que indica capacidad multimodal de entrada (visión).
- Procesamiento conjunto de imagen y texto en el modo de decisión (el autor mide latencias específicas para esta combinación).
- Inferencia en Apple Silicon mediante `mlx_lm`, con API Python propia (`OneJev.decide`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede clasificar una consulta de cliente en un equipo concreto (`billing`, `shipping`, etc.) usando el tipo `choice` con criterios nombrados, como muestra el ejemplo del autor con el pedido #7821. Es adecuado porque devuelve una decisión estructurada directamente, sin necesidad de parsear texto libre.

- Triaje de severidad de incidencias: mediante el tipo `score` con una escala ordinal (`cosmetic`, `annoying`, `blocks`), el modelo puntúa el impacto de un error, por ejemplo "disk quota exceeded on the worker". Adecuado para pipelines de gestión de incidencias donde se necesita una etiqueta ordenada.

- Detección de intención de reembolso: con el tipo `noul`, el modelo responde sí/no a preguntas como si el cliente quiere un reembolso, a partir de un mensaje como el del pedido #4411. Útil como primer filtro en flujos de atención al cliente.

- Clasificación de documentos con imagen: el autor mide el modo de decisión con entrada de imagen 512x512 más texto (unos 2328 ms por decisión), lo que permite clasificar capturas, formularios o tickets escaneados junto con una instrucción textual.

- Despliegue local en estaciones de trabajo Apple: con 11,4 GB en disco y 12,21 GB de pico de memoria residente en un Mac mini M4 Pro de 48 GB, el modelo puede ejecutarse en local para prototipado y pruebas de clasificación sin depender de la nube.

- Evaluación de calidad de cuantización: el repositorio incluye `kl_audit.json` y checksums SHA-256 de todos los ficheros, lo que permite reproducir la comparación 8 bits frente a bf16 y verificar la integridad de las descargas en entornos de investigación.

- Procesamiento por lotes de decisiones cortas: el autor reporta 0,79 decisiones cortas por segundo sostenidas (mediana de 1650 ms por decisión), adecuado para colas de clasificación de baja o media cadencia en hardware de sobremesa.

## Benchmarks y rendimiento

El autor publica una evaluación propia de calidad tras la cuantización, comparando 8 bits frente a bf16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | 8 bits (MLX) | bf16 (referencia) |
|---|---|---|
| Accuracy (eval propia) | 83,3% | 84,4% |
| Noul | 87,5% | 87,5% |
| Choice | 80,0% | 80,0% |
| Score | 80,0% | 84,0% |
| Perplejidad de calibración | 1,985 | 1,988 |

Mediciones de rendimiento en Mac mini M4 Pro 48 GB (MLX 8 bits):

| Escenario | Latencia media | Memoria |
|---|---|---|
| Carga estándar | 5,09 s | RSS pico 12,21 GB |
| Texto 512 tokens (492 tok), decisión binaria | 1425 ms | RSS pico 12,21 GB |
| Texto 512 tokens, multichoice | 1427 ms | RSS pico 12,21 GB |
| Texto 512 tokens, score | 1427 ms | RSS pico 12,21 GB |
| Imagen 512x512 + texto, binaria | 2327 ms | RSS pico 12,21 GB |
| Imagen 512x512 + texto, multichoice | 2328 ms | RSS pico 12,21 GB |
| Imagen 512x512 + texto, score | 2328 ms | RSS pico 12,21 GB |
| Carga desde disco | 3,82 s | RSS pico 12,21 GB |

Latencia de decisión: mediana de 1650 ms; 0,79 decisiones cortas por segundo sostenidas. El tipo `box` no está soportado.

## Requisitos de hardware

- Memoria: el autor reporta un pico de memoria residente de 12,21 GB con los pesos de 8 bits cargados en MLX. El repositorio ocupa 11,4 GB en disco.
- Hardware objetivo: Apple Silicon con `mlx_lm`; las mediciones publicadas corresponden a un Mac mini M4 Pro con 48 GB de memoria unificada.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el formato MLX está orientado a Apple Silicon y no se documenta despliegue en CUDA.
- Despliegue: `mlx_lm` con el módulo propio `onejev_mlx.py` incluido en el repositorio. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de 1650 ms por decisión y 0,79 decisiones cortas por segundo sostenidas en el hardware de referencia; 1425-1428 ms para decisiones sobre texto de 512 tokens y 2327-2328 ms con imagen 512x512 más texto.
- Carga del modelo: entre 3,82 s y 5,09 s según el escenario medido.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar del modelo base ni de las alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| OneJev1.5 9B (MLX 8-bit) | 9,41B | no disponible | Apache 2.0 | safetensors MLX, `mlx_lm` |
| OmniJev/OneJev1.5-9B (base) | 9,41B (presumible) | no disponible | Apache 2.0 | no disponible |
| Alternativas de ~9B (Qwen, Llama, etc.) | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible modelos comparables directos con modo de decisión estructurado equivalente.

## Limitaciones y advertencias

- Modelo derivado: no es un modelo original; cualquier limitación del modelo base OmniJev/OneJev1.5-9B se hereda sin cambios.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés de los ejemplos.
- Longitud de contexto no disponible: no se puede planificar su uso en conversaciones largas o documentos extensos sin verificar el `config.json` del repositorio.
- El tipo de decisión `box` (detección de cajas) no está soportado.
- La cuantización a 8 bits introduce una pérdida medible: accuracy global de 83,3% frente a 84,4% en bf16, y score de 80,0% frente a 84,0%.
- El peor tensor en la auditoría KL es una capa de atención lineal temprana (`layers.0.linear_attn.in_proj_a.weight`, KL 5,65e-03), lo que puede afectar a tareas sensibles a las primeras capas.
- Riesgo de alucinación: no evaluado en la información disponible; el modo de decisión estructurado reduce la superficie de texto libre, pero no lo elimina.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte de que prevalece la licencia del repositorio upstream en caso de conflicto; conviene revisar el repositorio original.
- Orientado exclusivamente a Apple Silicon: no hay soporte documentado para CUDA, ROCm ni CPU genérica.
- Repositorio con pocas señales de adopción (276 descargas, 0 likes) y autor individual; conviene verificar los checksums SHA-256 incluidos antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/onejev-v1.5-9B-MLX-8bit
- Modelo base: https://huggingface.co/OmniJev/OneJev1.5-9B
- Fichero de auditoría de cuantización: `kl_audit.json` en el repositorio
- Módulo de inferencia: `onejev_mlx.py` en el repositorio
- Documentación de MLX: no disponible en la información proporcionada
