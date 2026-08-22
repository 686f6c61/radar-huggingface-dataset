# MinimaLabs/min-spark-1.1

## Resumen

min-spark 1.1 es un modelo de lenguaje de 5,76 millones de parámetros desarrollado por MinimaLabs, diseñado para funcionar con niveles de esfuerzo nativos: permite al usuario elegir cuánto cómputo se invierte en cada generación, desde una respuesta rápida hasta un procesamiento más profundo. Su arquitectura, denominada Meiosis, es un decoder recurrente con pesos compartidos (looped) y embeddings atados, lo que lo convierte en un candidato interesante para entornos con recursos extremadamente limitados.

Esta versión 1.1 es una continuación del entrenamiento de la versión 1.0, añadiendo 6,8 mil millones de tokens adicionales hasta alcanzar un total de 16,81 mil millones. El resultado es una mejora general en la mayoría de los benchmarks, aunque con una ligera caída en ARC-Easy. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para usarse con Transformers mediante código remoto.

La relevancia de min-spark 1.1 reside en su enfoque en eficiencia: con menos de 6 millones de parámetros y una ventana de contexto de 512 tokens, demuestra que es posible obtener un rendimiento razonable en tareas de lenguaje con un coste computacional mínimo, abriendo la puerta a aplicaciones en dispositivos de borde o como base para investigación en arquitecturas compactas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Meiosis (decoder recurrente con pesos compartidos, embeddings atadas) |
| Parámetros totales | 5.758.572 |
| Parámetros activos | No disponible (arquitectura no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No disponible (no se documenta soporte explícito para cuantización) |
| Idiomas soportados | No disponibles (no se especifica en la documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (con código remoto para Transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura recurrente con bloques compartidos: un bloque de preludio, tres bloques de cuerpo compartidos, un bloque de coda y una capa final de RMSNorm. Cada bloque utiliza atención con consultas agrupadas (GQA) con 6 cabezas de query y 2 de clave/valor, un tamaño de embedding de 288, una capa FFN de 768 unidades y un rango LoRA de 16. El vocabulario es un BPE de nivel de byte de 4096 tokens.

El entrenamiento consistió en una fase de pre-entrenamiento que comenzó con 10,01 mil millones de tokens (min-spark 1.0) y se extendió con 6,8 mil millones adicionales en esta versión, alcanzando un total de 16,81 mil millones. No se menciona el uso de RLHF, DPO u otros métodos de alineación; todo el proceso es de pre-entrenamiento puro.

La principal innovación técnica son los **niveles de esfuerzo**, que determinan cuántas pasadas hace el modelo a través de sus bloques compartidos. Los valores van desde `low` (2 pasadas) hasta `high` (4 pasadas), lo que permite ajustar el coste computacional en tiempo de inferencia sin cambiar el modelo ni el prompt.

## Capacidades

- **Generación de texto**: Produce texto coherente a corto plazo, adecuado para completar frases o generar respuestas cortas.
- **Razonamiento básico**: Muestra mejoras en tareas de razonamiento cuando se usa el nivel de esfuerzo alto, como se refleja en los benchmarks de BLiMP y ARC.
- **Soporte multilingüe**: No se documenta, y el vocabulario byte-level BPE podría funcionar con cualquier idioma, pero no hay evidencia de entrenamiento multilingüe.
- **Niveles de esfuerzo configurables**: permite al usuario elegir entre rapidez y calidad mediante el parámetro `effort`.
- **Compatibilidad con Transformers**: se integra mediante código remoto, con API de `pipeline` y generación estándar.
- **Sin KV cache**: cada token generado recalcula todo el prompt, lo que penaliza generaciones largas pero simplifica la implementación.

## Casos de uso

- **Prototipado de generación de texto**: para probar conceptos de generación automática en entornos de desarrollo con recursos mínimos, como una Raspberry Pi o un portátil sin GPU.
- **Educación y aprendizaje**: útil para demostrar arquitecturas recurrentes con pesos compartidos y conceptos de GQA, LoRA o looped decoders en cursos de deep learning.
- **Generación de respuestas cortas en sistemas embebidos**: con su tamaño de 5,7 M de parámetros, puede integrarse en microcontroladores o dispositivos de baja potencia para completar frases o generar respuestas simples.
- **Investigación en eficiencia**: sirve como modelo de referencia para estudiar el impacto de los niveles de esfuerzo en la calidad de generación y el coste computacional.
- **Evaluación de técnicas de compresión**: al ser tan pequeño, es útil para probar métodos de cuantización o poda sin grandes costes de entrenamiento.
- **Pruebas de integración**: permite validar pipelines de Transformers con código remoto, especialmente para desarrolladores que quieran experimentar con `trust_remote_code`.

## Benchmarks y rendimiento

Los resultados de los benchmarks presentados en la model card son los siguientes (mejor puntuación según el nivel de esfuerzo):

| Modelo | Params | BLiMP | ARC-Easy | ARC-Challenge | HellaSwag | PIQA |
|---|---|---|---|---|---|---|
| **min-spark 1.1** | 5,76M | 71,78% | 36,45% | 23,04% | 28,24% | 57,40% |
| cma-8M | 7,8M | - | 35,35% | 23,29% | 28,19% | 58,22% |
| BananaMind-2-Nano | 9,97M | - | 36,20% | 23,38% | 27,50% | 55,98% |
| Qana-mini-5M | 4,94M | - | 34,97% | 23,21% | 27,60% | 57,18% |
| michel-nano-v2 | 8M | 72,52% | 35,90% | 21,84% | 27,40% | 56,75% |

En el BananaMind Base Bench, el modelo alcanza un Elo de 935 con una precisión del 41,14% (frente a 920 y 39,71% de la versión 1.0). Los resultados muestran que la mejora del entrenamiento hace que el nivel `high` de esfuerzo realmente aporte beneficios adicionales.

## Requisitos de hardware

- **VRAM estimada**: Al ser un modelo de 5,76 millones de parámetros, en FP32 ocupa aproximadamente 23 MB, y en FP16 unos 11,5 MB. Por tanto, cabe en cualquier GPU con más de 64 MB de VRAM, incluso en tarjetas integradas.
- **GPUs recomendadas**: Cualquier GPU moderna (desde GTX 1050 en adelante) o incluso CPU sin problemas. No se requieren GPUs de gama alta.
- **Compatibilidad con consumer GPU**: Sí, cualquier tarjeta gráfica de consumo actual puede ejecutarlo sin dificultad.
- **Opciones de despliegue**: Se puede usar con Transformers (carga remota), o con el script `generate.py` incluido en el repositorio. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, pero al ser un modelo pequeño, podría adaptarse fácilmente.
- **Latencia y throughput**: No hay datos publicados. Debido a que no hay KV cache, cada token generado requiere recomputar el prompt completo, lo que hace que la latencia crezca linealmente con el número de tokens generados. Para secuencias cortas (menos de 50 tokens) el rendimiento es aceptable, pero no es recomendable para generación larga.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Disponibilidad | Rendimiento (ARC-Easy) |
|---|---|---|---|---|---|
| min-spark 1.1 | 5,76M | 512 | Apache 2.0 | HF | 36,45% |
| cma-8M | 7,8M | no disponible | no disponible | HF | 35,35% |
| BananaMind-2-Nano | 9,97M | no disponible | no disponible | HF | 36,20% |
| Qana-mini-5M | 4,94M | no disponible | no disponible | HF | 34,97% |
| michel-nano-v2 | 8M | no disponible | no disponible | HF | 35,90% |

En la comparativa, min-spark 1.1 destaca por su buen equilibrio entre tamaño y rendimiento, especialmente en BLiMP y HellaSwag, aunque otros modelos como BananaMind-2-Nano tienen mejor ARC-Challenge. La diferencia en contexto (512 tokens) es una limitación frente a otros modelos que podrían tener ventanas más largas, aunque no se documentan.

## Limitaciones y advertencias

- **Ventana de contexto limitada**: Solo 512 tokens, lo que impide el procesamiento de documentos largos o conversaciones extensas.
- **Sin KV cache**: La recomputación del prompt completo en cada token generado hace que la generación sea lenta para secuencias largas y consume más cómputo del necesario.
- **Rendimiento en generación larga**: Debido a la recomputación, no es adecuado para generar textos de más de unos cientos de tokens.
- **Idiomas**: No se documenta soporte multilingüe; el vocabulario byte-level BPE podría funcionar con cualquier idioma, pero no se ha evaluado.
- **Sesgos y alucinaciones**: Al ser un modelo pequeño entrenado con un corpus de 16,81 B tokens, puede presentar sesgos de los datos de entrenamiento y alucinar contenido, aunque su tamaño limita la complejidad de las respuestas.
- **Licencia**: Apache 2.0 permite uso comercial, pero hay que verificar el código remoto (trust_remote_code) ya que puede contener código externo con su propia licencia.
- **Producción**: No se recomienda para aplicaciones de producción sin una evaluación exhaustiva, ya que su rendimiento es limitado y no hay soporte para cuantización o despliegue optimizado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/MinimaLabs/min-spark-1.1)
- [Página de MinimaLabs en Hugging Face](https://huggingface.co/MinimaLabs/min-spark) (modelo base)
- [Free2AI Tools: Min Spark](https://free2aitools.com/model/minimalabs/min-spark)
- [LLM Explorer: Min Spark](https://llm-explorer.com/model/MinimaLabs%2Fmin-spark,2UhyQreGgWN8SNOp73dunj)
