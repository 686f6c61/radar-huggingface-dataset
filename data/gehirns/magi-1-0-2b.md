# GEHIRNS/magi-1.0-2B

## Resumen

magi-1.0-2B es una cuantización de precisión mixta del modelo base Qwen/Qwen3.5-2B, publicada por GEHIRNS. No se trata de un modelo entrenado desde cero ni de un fine-tune: los pesos son exactamente los del modelo base, únicamente almacenados a distintas precisiones según un conjunto de 13 reglas por clase de tensor (la "receta magi-1.0") y una importance matrix calculada específicamente sobre el modelo de 2B. El resultado es un fichero GGUF de 1,36 GiB que ocupa un 48 % menos de memoria que su hermano magi-1.0 (4B, 2,61 GiB) a contexto de 32K.

El modelo cuenta con 1.881.825.088 parámetros totales y está pensado para ejecutarse en llama.cpp y Ollama, con decodificación aproximadamente 1,8 veces más rápida que la variante de 4B. Su interés radica en la relación entre capacidad y memoria: define una métrica de "densidad de capacidad" ρ = −log₂(1 − score) / GiB, y alcanza ρ = 1,071 frente a 0,903 del modelo de 4B bajo el mismo protocolo de evaluación.

Ahora bien, el propio autor advierte de una debilidad importante: bajo decodificación greedy, el 82 % de las trazas de benchmark terminan en bucles de repetición que agotan el presupuesto de razonamiento. Por eso recomienda usar magi-1.1-2B (misma receta más un LoRA orientado a corregir esos bucles, 66,1 % de score y 77 % de trazas con bucle) salvo que se busque explícitamente la variante sin entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5 (tag `gated-deltanet`); detalles completos no disponibles |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32K (medido a esa ventana en los benchmarks) |
| Tipos de cuantizacion | Precisión mixta GGUF con 13 reglas por clase de tensor e importance matrix; niveles concretos por tensor no disponibles |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (librería `gguf`, orientado a llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.5-2B, que la model card etiqueta con `gated-deltanet`, lo que sugiere componentes de atención lineal o de estado recurrente combinados con atención clásica; la información proporcionada no detalla la composición exacta de capas ni la proporción entre ambos mecanismos. Tampoco se especifican los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO), por lo que esos datos deben consultarse en la model card de Qwen.

La innovación técnica de esta publicación no está en el entrenamiento, sino en la cuantización: se aplica la receta magi-1.0, compuesta por 13 reglas que asignan precisiones distintas a clases de tensores según su sensibilidad, junto con una importance matrix calculada sobre el propio modelo de 2B. No hay ningún paso de entrenamiento ni de ajuste fino: los pesos son los del base, solo reempaquetados. El tamaño del repositorio es de 0,9 GB y el fichero resultante ocupa 1,36 GiB en memoria a contexto de 32K con una secuencia.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento con modo "thinking": los benchmarks se ejecutaron con thinking activado y un presupuesto de 4.096 tokens con budget forcing.
- Razonamiento multi-paso y resolución de problemas, evaluado con benchmarks de código, matemáticas y conocimiento general (2.313 tareas en total).
- Generación de código, evaluada mediante ejecución de tests (EvalPlus para HumanEval+ y MBPP+, además de LiveCodeBench).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Multilingüe: limitado al inglés según el campo `language`.
- Visión o audio: no disponible; el modelo es solo de texto.

## Casos de uso

- Despliegue en hardware de gama media: con 1,36 GiB a contexto de 32K, el modelo cabe holgadamente en GPUs de consumo de 8 GB o menos y permite dejar espacio para el KV cache y otros procesos, algo inviable con la variante de 4B en configuraciones ajustadas.
- Razonamiento con presupuesto acotado: el modo thinking con budget forcing permite fijar un límite de tokens de razonamiento, útil en pipelines donde el coste por consulta debe ser predecible; conviene monitorizar los bucles de repetición descritos por el autor.
- Generación de código en entornos con recursos limitados: los benchmarks de código se validaron ejecutando tests, lo que respalda su uso en tareas de autocompletado o generación de funciones, siempre con verificación posterior.
- Prototipado e investigación sobre cuantización: al ser una receta de precisión mixta reproducible (13 reglas más importance matrix), sirve como referencia para estudiar el impacto de la cuantización selectiva en modelos pequeños.
- Asistentes conversacionales locales en inglés: su licencia Apache 2.0 y su formato GGUF permiten integrarlo en aplicaciones de escritorio o embebidas vía llama.cpp u Ollama sin dependencias de la nube.
- Evaluación comparativa de eficiencia: la métrica de densidad de capacidad permite comparar configuraciones de memoria frente a rendimiento bajo un protocolo idéntico, útil para decidir qué variante desplegar en un parque heterogéneo de GPUs.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados en una RTX 5070 (12 GB) con llama.cpp b11800 (`llama-server`), 2.313 tareas, thinking activado con presupuesto de 4.096 tokens, decodificación greedy, KV cache q4_0 con flash attention y micro-batch 128.

| Metrica | magi-1.0 (4B) | magi-1.0-2B | magi-1.1-2B |
|---|---|---|---|
| Memoria a 32K (GiB) | 2,61 | 1,36 | 1,36 |
| Score global | 80,5 % (inferido: 63,5 + 17,0) | 63,5 % | 66,1 % |
| Densidad de capacidad (ρ) | 0,903 | 1,071 | 1,149 |
| Trazas con bucle (greedy) | no disponible | 82 % | 77 % |
| Decodificación | referencia | ~1,8x más rápida | no disponible |

El desglose por benchmark individual (HumanEval+, MBPP+, LiveCodeBench, etc.) no está disponible en el fragmento de la model card proporcionado; solo se indica la metodología de evaluación.

## Requisitos de hardware

- VRAM estimada: 1,36 GiB de memoria residente a contexto de 32K con una secuencia, incluyendo pesos, KV cache, estado recurrente y buffers de cómputo, sumando GPU y host y excluyendo el contexto CUDA (según `llama-fit-params`).
- GPU recomendadas: el autor validó con una RTX 5070 de 12 GB; por tamaño, cualquier GPU con 4 GB o más debería alojarlo con contexto reducido.
- GPU de consumo: sí, cabe en GPUs de consumo modernas e incluso en integradas con suficiente memoria compartida; el límite práctico lo marca el contexto, no los pesos.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-fit-params`) y Ollama; compatible con endpoints.
- Latencia y throughput: decodificación aproximadamente 1,8 veces más rápida que magi-1.0 (4B); cifras absolutas de tokens por segundo no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria a 32K | Score | Bucles (greedy) | Licencia |
|---|---|---|---|---|---|---|
| magi-1.0-2B | 1,88 B | 32K | 1,36 GiB | 63,5 % | 82 % | Apache 2.0 |
| magi-1.1-2B | 1,88 B (misma base) | 32K | 1,36 GiB | 66,1 % | 77 % | Apache 2.0 |
| magi-1.0 (4B) | no disponible | 32K | 2,61 GiB | 80,5 % (inferido) | no disponible | Apache 2.0 |

La comparación con el modelo base sin cuantizar (Qwen/Qwen3.5-2B) no está disponible en la información proporcionada, ya que los benchmarks se ejecutaron únicamente sobre las variantes magi.

## Limitaciones y advertencias

- Bucles de repetición: bajo decodificación greedy, el 82 % de las trazas agota el presupuesto de thinking por repetición; muchas respuestas siguen siendo correctas tras el corte, pero el consumo de tokens se dispara.
- Recomendación del autor: usar magi-1.1-2B en lugar de esta variante salvo que se requiera explícitamente el modelo sin entrenamiento.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está evaluado.
- Alucinación: no hay datos específicos publicados; al ser una cuantización del base, hereda sus riesgos sin mitigación adicional.
- Sesgos: no documentados en la información disponible; se heredan los del modelo Qwen3.5-2B.
- Licencia: Apache 2.0, con enlace a la licencia del modelo base de Qwen; conviene revisar las condiciones del base antes de uso comercial.
- Comparabilidad de métricas: los valores de memoria y ρ solo son comparables dentro de la tabla del autor; la carta de magi-1.0 (4B) usó cifras de Ollama y no son equiparables.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GEHIRNS/magi-1.0-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Variante recomendada: https://huggingface.co/GEHIRNS/magi-1.1-2B
- Modelo de 4B de la misma familia: https://huggingface.co/GEHIRNS/magi-1.0
- Perfil del autor: https://huggingface.co/GEHIRNS
- Sitio web del autor: https://gehirns.pages.dev/
