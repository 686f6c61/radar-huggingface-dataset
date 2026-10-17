# Duckets/Hy-Memory-30B-A3B-MLX-4bit

## Resumen

Hy-Memory-30B-A3B es un modelo de lenguaje especializado que desarrolla Tencent para una única tarea dentro de un sistema de agentes: escribir la memoria a largo plazo. No es un asistente conversacional general, sino un «memory writer» que recibe un fragmento de conversación y devuelve afirmaciones de memoria autocontenidas y duraderas, listas para almacenarse en una base de memoria vectorial. La arquitectura es un MoE de tipo transformer (`hy_v3`) con 30.064.719.872 parámetros totales, unos 3.000 millones activos por token, 48 capas, 128 expertos y una ventana de contexto de 262.144 tokens.

El repositorio que se analiza aquí es `Duckets/Hy-Memory-30B-A3B-MLX-4bit`, una cuantización afín a 4 bits (group size 64) del modelo original en BF16, convertida con mlx-lm 0.32.0 y empaquetada para Apple Silicon. Ocupa 16,9 GB en disco y unos 17,1 GB de pico de memoria en inferencia, lo que permite ejecutarlo en un Mac de 32 GB de RAM unificada. Incluye `hy_v3.py`, el módulo de modelo necesario porque mlx-lm upstream todavía no implementa esta arquitectura.

Su relevancia es doble: por un lado, Tencent publica un modelo dedicado a una función que hasta ahora se resolvía con LLM generales dentro de frameworks como Mem0, MemOS o EverMemOS; por otro, esta cuantización hace viable ese flujo en hardware de consumo Apple, sin GPU dedicada y con unos 125 tok/s de generación medidos por el cuantizador en un M5 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`hy_v3`), 48 capas, 128 expertos |
| Parametros totales | 30.064.719.872 (~30B) |
| Parametros activos | ~3B (aprox. 3.000 millones por token, según el autor de la cuantización) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Este repo: MLX afín 4 bits, group size 64. Existen además builds MLX de 8 bits y mixtos, GGUF y una conversión EXL3 de 4,08 bpw del modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX (`mlx-lm`), 16,9 GB de repositorio; incluye `hy_v3.py`, plantilla de chat y tokenizador |

## Arquitectura y entrenamiento

La arquitectura es un mixture-of-experts de 48 capas y 128 expertos con 30B de parámetros totales y aproximadamente 3B activos por token, identificada internamente como `hy_v3`. El modelo base se publicó el 16 de octubre de 2026 y, según el paper asociado (arXiv 2610.22196), se entrena con aprendizaje por refuerzo atribuido para memoria a largo plazo: solo se entrena el «escritor» (el modelo que genera las memorias), mientras que el «lector» que consume esas memorias permanece fijo durante el cálculo de la recompensa. El objetivo es que el modelo funcione como drop-in en varios harnesses de memoria preexistentes en lugar de estar acoplado a una arquitectura de memoria propietaria.

El detalle de volumen de tokens de entrenamiento, composición del dataset y uso de RLHF/DPO no está disponible en la información consultada. La cuantización de este repositorio se generó a partir de los pesos BF16 originales con mlx-lm 0.32.0, aplicando cuantización afín de 4 bits con group size 64; el módulo `hy_v3.py` se adaptó de la implementación de `transformers` de Tencent, ya que mlx-lm no soporta aún la arquitectura de forma nativa.

## Capacidades

- Escritura de memoria a largo plazo: dado un fragmento de conversación, extrae hechos duraderos y los devuelve como afirmaciones autocontenidas, sin referencias anafóricas que dependan del turno anterior.
- Salida estructurada: el flujo previsto devuelve las memorias como lista JSON, directamente embebible en una base de memoria de un agente.
- Consolidación y reducción de duplicados: el autor de la cuantización reporta una tasa de duplicados de 0,24 frente a 0,65 de su extractor anterior en sus ficheros reales de memoria.
- Función de «memory writer» intercambiable: diseñado para integrarse en Mem0, MemOS, Hy-Memory y EverMemOS sin reentrenar el resto del pipeline.
- Ventana de contexto de 262.144 tokens, adecuada para procesar bloques largos de conversación antes de resumirlos a memoria.
- Integración con agentes: pensado para pipelines de agentes multi-paso donde la memoria persistente se consulta en cada sesión.
- Capacidades multilingües: no disponible (no se documenta lista de idiomas).
- Tool calling / function calling: no disponible en la información consultada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Memoria persistente de agentes conversacionales: se alimenta al modelo el bloque de diálogo reciente y devuelve las memorias a guardar; al estar especializado, evita que un LLM general genere memorias vagas o con pronombres sin resolver.
- Deduplicación de una base de memoria existente: ejecutarlo periódicamente sobre las memorias acumuladas para fusionar entradas redundantes, aprovechando el comportamiento reportado de menor tasa de duplicados.
- Extracción de hechos en formato JSON para RAG: la salida estructurada se puede insertar directamente en un índice vectorial sin postprocesado complejo ni parseo frágil de texto libre.
- Agentes personales locales en Apple Silicon: con ~17,1 GB de pico de memoria, cabe en un Mac de 32 GB y permite ejecutar el subsistema de memoria sin enviar conversaciones a la nube.
- Atención al cliente con memoria de cliente: extraer preferencias, incidencias previas y datos de cuenta de conversaciones multi-turno para que el agente los recupere en la siguiente interacción, usando la ventana de 262K para contexto largo.
- Evaluación en sombra de extractores existentes: el propio autor lo usó para comparar su extractor previo con Hy-Memory sobre ficheros de memoria reales antes de migrar; es un patrón replicable para validar un cambio de modelo de memoria en producción.
- Investigación sobre memoria en agentes: al ser Apache-2.0 y ejecutable en local, sirve como baseline reproducible en experimentos con distintos harnesses (Mem0, MemOS, EverMemOS) sin coste de API.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a la evaluación cross-harness de Tencent sobre escritura de memoria y a la prueba en sombra del autor de la cuantización. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de conocimiento general en la información disponible.

| Evaluacion | Resultado | Notas |
|---|---|---|
| Macro promedio cross-harness (Mem0 / MemOS / Hy-Memory / EverMemOS) | 55,49 | Fuente: Tencent; el autor de la cuantización indica que supera a Claude Opus 5 y a Qwen3.6-35B-A3B como memory writer drop-in |
| Desglose por harness (Mem0, MemOS, Hy-Memory, EverMemOS) | no disponible | Solo se cita el promedio macro |
| Prueba en sombra del cuantizador (ficheros de memoria reales) | 107 hechos extraídos | Frente a 40 del extractor anterior |
| Tasa de duplicados (prueba en sombra) | 0,24 | Frente a 0,65 del extractor anterior |
| Rendimiento del build MLX 4 bits frente al BF16 | no disponible | La cuantización no incluye una evaluación de degradación por cuantizar |

## Requisitos de hardware

- Inferencia de este build MLX 4 bits: ~16,9 GB de pesos en disco y ~17,1 GB de pico de memoria reportados por el autor; hay que añadir el coste del KV cache, que no está cuantificado en la información disponible.
- Cabe en Apple Silicon de consumo: un Mac con 32 GB de memoria unificada se considera «cómodo» según el autor; en equipos con más memoria el margen para contexto largo y procesos concurrentes es mayor.
- Rendimiento medido: ~125 tok/s de generación en un M5 Max (dato del cuantizador); no hay datos de throughput en modo batch ni de latencia de prefill para contextos largos.
- GPU NVIDIA: este build es específico de MLX y no se ejecuta en CUDA. Para A100/H100/RTX 4090 habría que usar el modelo base en BF16 (aprox. 60 GB de pesos, estimación a partir de los 30B de parámetros) o un build GGUF/EXL3.
- Despliegue en Apple Silicon: mlx-lm (`python -m mlx_lm generate`) y LM Studio, que lo reconoce como modelo MLX estándar.
- Requisito adicional: `hy_v3.py` debe copiarse a `mlx_lm/models/` o quedar junto al loader, porque mlx-lm upstream no incluye la arquitectura `hy_v3`.
- Otras opciones para el modelo base: vLLM (citado en la cobertura del modelo original), llama.cpp vía builds GGUF y EXL3 vía el build de 4,08 bpw.

## Comparativa con modelos similares

| Modelo | Parametros (total / activos) | Contexto | Rendimiento en escritura de memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-Memory-30B-A3B MLX 4 bits (este repo) | 30B / ~3B | 262.144 | Macro 55,49 (fuente Tencent, mismo modelo base) | Apache-2.0 | safetensors MLX, 16,9 GB, Apple Silicon |
| tencent/Hy-Memory-30B-A3B (BF16 original) | 30B / ~3B | 262.144 | Macro 55,49 | Apache-2.0 | safetensors transformers, ~60 GB de pesos (estimación) |
| Hy-Memory-30B-A3B EXL3 4,08 bpw (jyohukuchan) | 30B / ~3B | 262.144 | Mismo modelo base | Apache-2.0 | Formato EXL3, pensado para GPU |
| Qwen3.6-35B-A3B | 35B / no disponible | no disponible | Por debajo de Hy-Memory según la evaluación de Tencent | no disponible | no disponible |
| Claude Opus 5 | no disponible (propietario) | no disponible | Por debajo de Hy-Memory según la evaluación de Tencent | Propietaria | Solo API |

## Limitaciones y advertencias

- Modelo de tarea única: está entrenado para escribir memorias, no como asistente general. Usarlo como chat o para código probablemente dé resultados pobres y no hay benchmarks que lo respalden en esas tareas.
- Degradación por cuantización no medida: el autor no publica una comparación entre este 4 bits y el BF16 en la tarea de extracción de memoria; la pérdida de calidad es desconocida.
- Dependencia de parche: requiere `hy_v3.py` en el árbol de mlx-lm; una actualización de mlx-lm puede romper la carga o generar conflictos con una implementación upstream futura.
- Resultados de benchmark limitados: el 55,49 de macro promedio procede del propio desarrollador del modelo, con su selección de harnesses y su metodología; no hay replicación independiente en la información disponible.
- Riesgo de alucinación de hechos: al ser un extractor, puede generar afirmaciones de memoria que no estén respaldadas por la conversación original, o convertir inferencias en hechos; no se documenta ningún mecanismo de atribución o verificación en la información disponible.
- Idiomas no documentados: se desconoce el soporte real fuera del chino y el inglés, y no hay evaluación multilingüe publicada.
- Contexto largo con coste real: los 262K tokens de ventana no implican que el KV cache quepa en 32 GB con la ventana llena; el coste de memoria del cache no está especificado.
- Plataforma: este build solo funciona en Apple Silicon; no hay ruta CUDA para estos pesos concretos.
- Licencia: Apache-2.0 permite uso comercial y redistribución, pero conviene verificar los términos del modelo base y las condiciones de uso de Tencent, así como las licencias de los harnesses (Mem0, MemOS, EverMemOS) con los que se integre.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el mismo día de la publicación del modelo base; es una conversión de la comunidad, sin mantenimiento garantizado.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Duckets/Hy-Memory-30B-A3B-MLX-4bit
- Modelo base en HuggingFace: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- Paper (arXiv 2610.22196), aprendizaje por refuerzo atribuido para memoria a largo plazo: https://arxiv.org/html/2610.22196
- Cobertura técnica y resultados con vLLM (explainx.ai): https://www.explainx.ai/blog/tencent-hy-memory-30b-a3b-open-memory-writer-model-mem0-memos-2026
- Análisis de la release (MindStudio): https://www.mindstudio.ai/blog/tencent-hy-memory-30b-a3b-release
- Conversión EXL3 de 4,08 bpw: https://huggingface.co/jyohukuchan/Hy-Memory-30B-A3B-exl3-4.08bpw
