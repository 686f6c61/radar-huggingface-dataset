# Logic-z/dsh-cortex

## Resumen

dsh-cortex es un repositorio de pesos GGUF publicado por Logic-z que agrupa tres modelos cuantizados para despliegue local en CPU o iGPU mediante `llama.cpp`. No se trata de un unico modelo generativo, sino de una pila de tres componentes especializados que, en conjunto, implementan una capa de gestion y monitorizacion de contexto para agentes de programacion: un modelo de embeddings para busqueda semantica sobre el historial archivado, un sumarizador de pasos y un clasificador de calidad de contexto. El repositorio ocupa 1,4 GB y declara 271.002.648 parametros totales en safetensors, cifra que corresponde al conjunto de pesos agregados de los componentes.

Los dos modelos derivados de Qwen3.5-0.8B se han ajustado con LoRA (destilada desde Qwen3.5-2B en el caso del sumarizador) y fusionado posteriormente en los pesos base antes de la cuantizacion Q4_K_M. El tercer componente, embeddinggemma-2, se distribuye sin modificar en Q8_0 y produce embeddings de 768 dimensiones normalizados en L2. El monitor incorpora ademas una cabeza lineal externa almacenada en `head.json` (`weight[1024]` mas `bias`) que se aplica sobre el estado oculto del ultimo token.

La relevancia del conjunto reside en su planteamiento de ingenieria: en lugar de resolver la gestion de contexto de un agente con un modelo grande, descompone la tarea en tres modelos pequenos ejecutables en hardware modesto, con puertos y flags de `llama-server` documentados. Es un artefacto muy reciente (creado y actualizado el 27 de noviembre de 2026) y sin descargas ni valoraciones registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) para sumarizador y monitor; modelo de embeddings (embeddinggemma-2) para recuperacion |
| Parametros totales | 271.002.648 (agregado del repositorio, safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (embeddings), 4096 tokens (sumarizador), 8192 tokens (monitor) segun los flags de `llama-server` documentados |
| Tipos de cuantizacion | Q8_0 (embeddinggemma-2), Q4_K_M (sumarizador y monitor) |
| Idiomas soportados | no disponible |
| Licencia | other (repositorio); Apache-2.0 para los derivados de Qwen3.5; Gemma Terms of Use para embeddinggemma-2 |
| Formato de pesos | GGUF; `head.json` para la cabeza lineal del monitor |

## Arquitectura y entrenamiento

El sumarizador y el monitor parten de Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. Sobre esa base se aplico un ajuste LoRA: en el sumarizador la senal de entrenamiento se destilo desde Qwen3.5-2B y la adaptacion se fusiono en los pesos base antes de cuantizar a Q4_K_M; en el monitor el ajuste LoRA se combina con una cabeza de clasificacion lineal de 1024 dimensiones almacenada aparte en `head.json`. El monitor no genera texto: opera en modo embeddings, extrae el estado oculto del ultimo token con `--pooling last --embd-normalize -1` y calcula la puntuacion de degradacion de contexto como `sigmoid(dot(h, weight) + bias)`.

El componente de recuperacion es embeddinggemma-2 en su version original sin modificar, cuantizado a Q8_0, con pooling medio y 768 dimensiones normalizadas en L2. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; unicamente indica el uso de LoRA con destilacion en el sumarizador. No se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Sumarizacion de pasos de agente: convierte cada paso (llamada a herramienta mas resultado, o respuesta final del asistente) en una tarjeta resumida de una sola linea para seguimiento temporal e indexacion semantica.
- Embeddings de recuperacion: genera vectores de 768 dimensiones normalizados en L2 para busqueda hibrida lexica y semantica sobre el historial de conversacion descargado.
- Puntuacion de calidad de contexto: estima el riesgo de degradacion del contexto a partir de la secuencia rodante de resumenes de pasos, devolviendo un escalar en el rango [0, 1] tras la sigmoide.
- Integracion con `llama.cpp`: los tres componentes se sirven con `llama-server` en puertos independientes (8081, 8082, 8083 en los ejemplos de la model card).
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- No se documentan capacidades de tool calling, razonamiento multi-paso generativo, vision, audio ni modo thinking.

## Casos de uso

- Monitorizacion de sesiones de agente de programacion: el monitor consume la secuencia de resumenes de pasos y emite una puntuacion de degradacion que permite disparar una compactacion o reinicio del contexto antes de que el agente pierda coherencia.
- Archivado y recuperacion de historial: el modelo de embeddings indexa los resumenes de pasos y permite recuperar fragmentos relevantes de conversaciones antiguas mediante busqueda hibrida, reduciendo el contexto activo necesario.
- Trazabilidad de ejecuciones: el sumarizador genera una linea por paso que alimenta una linea temporal legible, util para auditar que hizo el agente y en que orden.
- Despliegue en estaciones de trabajo sin GPU dedicada: los tres modelos, en Q8_0 y Q4_K_M, estan pensados para inferencia en CPU o iGPU via `llama.cpp`, lo que permite ejecutar la pila completa en portatiles.
- Integracion en pipelines de agentes existentes: al exponerse como servidores HTTP compatibles con endpoints, los componentes pueden conectarse a orquestadores de agentes que ya consuman APIs de embeddings y chat.
- Control de coste en entornos locales: al sustituir llamadas a APIs externas por inferencia local de modelos de menos de 1B parametros, se elimina el coste por token en tareas de resumen e indexacion.
- Experimentacion en investigacion sobre gestion de contexto: la separacion en tres etapas (resumen, embedding, clasificacion) facilita medir el impacto de cada componente por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Por tamano de pesos, el repositorio completo ocupa 1,4 GB; el componente mayor (embeddinggemma-2 en Q8_0) domina ese total, mientras que los dos modelos Q4_K_M de 0,8B son considerablemente mas ligeros.
- GPU recomendadas: no disponible. La model card orienta el despliegue a CPU e iGPU mediante `llama.cpp`.
- GPU de consumo: no se documenta compatibilidad con modelos concretos; el diseno apunta a ejecucion en CPU/iGPU, por lo que no requiere GPU dedicada.
- Opciones de despliegue: `llama.cpp` con `llama-server`, con los flags documentados (`--embeddings --pooling mean -c 2048` para embeddings; `-c 4096` para el sumarizador; `--embeddings --pooling last --embd-normalize -1 -c 8192 -b 8192 -ub 4096` para el monitor).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| dsh-cortex (este repositorio) | 271 M agregados | 2048 / 4096 / 8192 segun componente | GGUF | other (mixta) | Gestion y monitorizacion de contexto para agentes |
| Qwen3.5-0.8B (base) | 0,8 B | no disponible | safetensors, GGUF | Apache-2.0 | LLM generativo de proposito general |
| embeddinggemma-2 (original) | no disponible | no disponible | safetensors, GGUF | Gemma Terms of Use | Embeddings de recuperacion |

La comparativa con alternativas especificas de monitorizacion de contexto de agentes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio sin descargas ni valoraciones en el momento de la ficha; no hay evidencia de uso en produccion por terceros.
- La licencia del repositorio figura como `other`, mientras que los componentes heredan licencias distintas (Apache-2.0 para los derivados de Qwen3.5, Gemma Terms of Use para embeddinggemma-2); es necesario revisar cada termino antes de un uso comercial.
- El monitor no es un modelo generativo: requiere postprocesado externo del embedding del ultimo token y de `head.json` para obtener la puntuacion, lo que anade complejidad de integracion.
- La calidad de la puntuacion de degradacion depende de la calidad de los resumenes producidos por el sumarizador; un fallo en cascada del sumarizador degrada el monitor.
- No se documentan idiomas soportados ni evaluaciones multilingues.
- No hay datos publicados de benchmarks, sesgos, tasas de alucinacion ni robustez, por lo que no puede validarse su rendimiento frente a alternativas.
- Las ventanas de contexto documentadas (2048, 4096 y 8192 tokens) son modestas y limitan el volumen de historial procesable por llamada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Logic-z/dsh-cortex
