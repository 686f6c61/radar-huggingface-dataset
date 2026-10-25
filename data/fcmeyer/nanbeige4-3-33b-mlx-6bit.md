# fcmeyer/Nanbeige4.3-33B-MLX-6bit

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje denso de 33.118.977.024 parámetros desarrollado por el equipo Nanbeige (vinculado al gigante chino de reclutamiento BOSS Zhipin), publicado bajo licencia Apache 2.0 y orientado específicamente a tareas de agente: generación de código, automatización de oficina y flujos multi-paso con tool calling. Según la información pública disponible, el modelo original configura una ventana de contexto de 524.288 tokens (512K), una cifra muy por encima de la media de su clase de tamaño.

La ficha que se documenta aquí no es el modelo original, sino la conversión a formato MLX con cuantización afín de 6 bits (group size 64) publicada por el usuario fcmeyer, pensada para ejecutar el modelo en Apple Silicon mediante la librería `mlx_lm`. El repositorio ocupa 26,9 GB repartidos en 1203 tensores y conserva la plantilla de chat original, incluidos los modos de razonamiento (`enable_thinking`, `preserve_thinking`) y el soporte de tool calling en formato XML (con JSON como alternativa).

Su relevancia es doble: por un lado, Nanbeige4.3-33B se presenta como un competidor directo de modelos de 30B de clase abierta en evaluaciones de coding agéntico; por otro, esta conversión permite probar ese comportamiento en un portátil o estación de trabajo Mac con memoria unificada abundante, sin depender de GPU NVIDIA. La contrapartida es que se trata de una cuantización de 6 bits validada con un protocolo de regresión muy acotado, no de un benchmark estandarizado de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), según la información pública del modelo base; detalles de capas y atención no disponibles |
| Parametros totales | 33.118.977.024 (33,1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens configurados en el modelo original; la conversión conserva el ajuste, pero el contexto completo de 512K no ha sido validado |
| Tipos de cuantizacion | Este repositorio: MLX afín de 6 bits, group size 64. El pipeline del autor deriva variantes cuantizadas independientemente desde BF16 (variantes concretas adicionales no detalladas en la información disponible) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (26.910.201.087 bytes, 1203 tensores) |
| Libreria de inferencia | mlx / mlx_lm |
| Revision del modelo base | c1093c501cc6460427c0ac634db7223d0450c0ee |
| Tamano del repositorio | 26,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 33B parámetros, no una arquitectura MoE ni híbrida SSM, según las descripciones públicas disponibles. No se han publicado en la información proporcionada detalles sobre número de capas, configuración de atención, número de tokens de entrenamiento, composición del dataset ni sobre si se aplicaron fases de RLHF, DPO u otros métodos de alineación. Tampoco se documenta ninguna innovación técnica concreta de atención o decodificación más allá del soporte nativo de razonamiento explícito y tool calling en la plantilla de chat.

Lo que sí está documentado con precisión es el proceso de conversión de esta variante MLX. Se parte de la revisión BF16 del modelo original y se aplica cuantización afín de 6 bits con group size 64, generando pesos safetensors compatibles con `mlx_lm`. La plantilla de chat upstream se preserva íntegra: `enable_thinking` activa o desactiva el razonamiento, `preserve_thinking=True` conserva razonamientos previos para flujos de agente, y el autor del modelo original recomienda `tool_call_format="xml"`, con JSON también soportado. El autor de la conversión advierte explícitamente que el soporte de plantilla no certifica el parser de herramientas de ningún servidor concreto.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino, con plantilla de chat compatible con el formato estándar de roles.
- Razonamiento explícito activable y desactivable mediante `enable_thinking`, lo que permite separar la fase de pensamiento de la respuesta final.
- Persistencia de razonamientos previos para flujos agénticos mediante `preserve_thinking=True`.
- Tool calling / function calling, con formato XML recomendado por el autor del modelo original y JSON como alternativa.
- Capacidades de agente multi-paso y automatización de terminal, Orientadas según los benchmarks publicados por el equipo a tareas de coding agéntico.
- Generación de código y tareas de ofimática/automatización de oficina, según la descripción pública del modelo.
- Capacidades multilingües limitadas a en y zh; no se declara soporte de español ni de otros idiomas.
- No se declaran capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Automatización de terminal y tareas de sistema: el modelo base se evalúa explícitamente en Terminal-Bench 2.1, de modo que su uso natural es un agente que interpreta instrucciones en lenguaje natural, ejecuta comandos, lee la salida y corrige el rumbo en pasos sucesivos. El modo `preserve_thinking` evita perder el hilo de razonamiento entre pasos.
- Asistente de coding en local sobre Mac: con 26,9 GB de pesos y unos 27-31 GB de pico medidos, un Mac con 48 GB o más de memoria unificada puede ejecutar el modelo íntegramente en local, sin enviar código a un tercero, algo relevante para entornos con requisitos de confidencialidad.
- Agente de refactorización sobre repositorios grandes: la ventana configurada de 512K tokens permitiría, en teoría, cargar múltiples ficheros y el historial de cambios en una sola pasada, aunque conviene validar el comportamiento real más allá de 16K tokens, que es el máximo probado en la conversión.
- Integración en pipelines de CI/CD como revisor de parches: el soporte de tool calling en XML permite estructurar la salida como llamadas a herramientas (leer fichero, aplicar diff, ejecutar tests) en lugar de texto libre, lo que simplifica el parseo en producción.
- Atención al cliente bilingüe inglés-chino: es el único par de idiomas declarado, así que encaja en organizaciones con operaciones en China continental y clientes angloparlantes, con conversaciones multi-turno largas.
- Generación de documentación técnica y ofimática: el modelo se describe como orientado a "office-style agents", por lo que la generación de informes, resúmenes de documentos y transformación de datos tabulares es un uso previsto por el autor.
- Prototipado e investigación en Apple Silicon: sirve para evaluar el comportamiento de un modelo de 33B en MLX antes de comprometer hardware CUDA, con la advertencia de que la fidelidad medida frente a BF16 es del 95,38% en top-1 sobre un corpus sintético muy pequeño.

## Benchmarks y rendimiento

La información disponible solo incluye un resultado de capacidad publicado por el equipo del modelo base: Terminal-Bench 2.1 con 80,9 puntos. Las fuentes secundarias afirman que el modelo supera a Qwen3.8-27B en siete de ocho evaluaciones de coding agéntico, pero no se detallan los nombres ni las puntuaciones de esas ocho pruebas, por lo que no se pueden tabular.

| Benchmark | Resultado | Notas |
|---|---|---|
| Terminal-Bench 2.1 | 80,9 | Dato publicado en la model card del modelo base, según fuentes secundarias |
| MMLU | No disponible | No publicado en la información disponible |
| HumanEval | No disponible | No publicado en la información disponible |
| GSM8K | No disponible | No publicado en la información disponible |

Métricas de validación de la cuantización (corpus sintético fijo de 563 tokens puntuados, no es un benchmark de capacidades):

| Metrica | Valor |
|---|---|
| NLL medio por token | 2,080684 |
| Perplejidad | 8,009943 |
| Diferencia de NLL frente a BF16 | +0,006991 |
| KL medio (BF16 ‖ cuantizado) | 0,007293 nats/token |
| Acuerdo top-1 con BF16 | 95,38% |
| Tamano de pesos | 26.910.201.087 bytes |
| Numero de tensores | 1203 |

Rendimiento medido en Apple M5 Max con 128 GB de memoria unificada, KV cache sin cuantizar, pasos de prefill de 512 tokens y 256 tokens de salida (mediana de tres ensayos tras un calentamiento, prompts sintéticos con semilla):

| Tokens de entrada | Prefill (tok/s) | Decode (tok/s) | Pico de memoria (GB) |
|---:|---:|---:|---:|
| 512 | 357,17 | 17,66 | 27,38 |
| 4096 | 520,69 | 17,40 | 28,14 |
| 16384 | 424,62 | 14,22 | 30,74 |

## Requisitos de hardware

- VRAM/memoria para inferencia: los pesos en 6 bits ocupan 26,91 GB. El pico medido por MLX es de 27,38 GB con 512 tokens de entrada y 30,74 GB con 16.384, con KV cache sin cuantizar. Son cifras de asignación de MLX, sin contar el resto de aplicaciones ni el sistema operativo.
- Memoria unificada recomendada: 48 GB o más para trabajar con contexto largo con holgura; 32 GB permite contextos cortos pero deja muy poco margen.
- GPU consumer: una RTX 4090 con 24 GB no puede cargar esta variante de 6 bits. Para CUDA habría que recurrir al modelo original en BF16 (aproximadamente 66 GB solo de pesos, cálculo a partir del número de parámetros) o a cuantizaciones de 4 bits, que no se distribuyen en este repositorio.
- GPU de datacenter: A100 40/80 GB y H100 son adecuadas por capacidad para el modelo original, pero no ejecutan MLX; este repositorio está pensado exclusivamente para Apple Silicon. Para CUDA se necesitaría transformers, vLLM o TGI con los pesos originales o una conversión GGUF/AWQ, no disponible aquí.
- Opciones de despliegue: `mlx_lm` (librería Python) y el servidor de mlx-lm para exponer una API compatible. llama.cpp, Ollama, vLLM y TGI no consumen safetensors en formato MLX.
- Latencia y throughput: en M5 Max, prefill de 357 a 521 tok/s y decodificación de 14,2 a 17,7 tok/s. Son cifras específicas de ese hardware y esas longitudes; no se han publicado mediciones en otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (esta conversion MLX 6-bit) | 33,1B denso | 524.288 tokens configurados, no validado al completo | Terminal-Bench 2.1: 80,9 | Apache 2.0 | Pesos MLX 6-bit en HuggingFace; BF16 en el repo del autor original |
| Qwen3.8-27B | 27B (según la fuente) | No disponible en la información | Inferior en 7 de 8 evaluaciones de coding agéntico según las fuentes secundarias; puntuaciones no detalladas | No disponible en la información | No disponible en la información |
| Gemma (clase 30B, versión no especificada) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación con Qwen3.8-27B procede de una fuente secundaria que cita la tabla de benchmarks de la model card; no se han podido verificar los ocho benchmarks individuales ni sus puntuaciones. Cualquier otra comparación con modelos de la clase 30B carece de datos en la información proporcionada.

## Limitaciones y advertencias

- La validación de la cuantización se hizo sobre un corpus sintético fijo de 563 tokens, con métricas de regresión (NLL, perplejidad, KL, acuerdo top-1). No es un benchmark de capacidades y no demuestra equivalencia funcional con el modelo en BF16: el propio autor lo advierte de forma explícita.
- El acuerdo top-1 del 95,38% frente a BF16 implica que aproximadamente una de cada veinte decisiones de token en los inputs evaluados difiere del modelo sin cuantizar. En tareas de agente con salidas estructuradas, ese margen puede traducirse en fallos de formato o de elección de herramienta.
- El contexto de 512K está configurado pero no validado. Las mediciones de rendimiento llegan solo hasta 16.384 tokens de entrada; más allá de esa longitud no hay datos de calidad ni de latencia.
- Solo se declaran inglés y chino. No hay soporte documentado de español; usarlo en castellano entraña riesgo de degradación no medida.
- Riesgo de alucinación y sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o tasas de alucinación en la información disponible. Al ser un modelo orientado a código y terminal, los errores en comandos destructivos son un riesgo operativo real y requieren sandboxing y confirmación humana.
- Los benchmarks de coding agéntico son autoinformados por el equipo del modelo y no se han replicado de forma independiente en la información consultada.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No impone restricciones de uso adicionales conocidas, pero conviene revisar el texto completo antes de un despliegue en producción.
- El repositorio es una conversión de terceros con 0 descargas y 0 likes en el momento de la consulta; no cuenta con validación de la comunidad. Para producción, es más prudente partir de los pesos originales del equipo Nanbeige.
- Dependencia de Apple Silicon: el formato MLX no es portable a CUDA ni a CPU convencional, lo que limita las opciones de escalado horizontal.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/fcmeyer/Nanbeige4.3-33B-MLX-6bit
- Modelo base original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Análisis del modelo y benchmarks: https://explainx.ai/blog/nanbeige-4-3-33b-open-agentic-model-guide-2026
- Noticia sobre el lanzamiento: https://dailyaibrief.com/news/nanbeige-releases-33b-agent-model-with-512k-context-yoxTglVU
- Comparativa con Qwen y Gemma: https://startupfortune.com/nanbeiges-new-33b-open-model-takes-aim-at-qwen-and-gemma-on-coding/
