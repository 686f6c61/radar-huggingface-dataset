# OliverSieberling/triadic-gdn-e8-400m-64k

## Resumen

Triadic Gated DeltaNet (E=8) 400M, 64k es un checkpoint de investigación publicado por Oliver Sieberling (con coautores de un paper arXiv) que implementa una variante de atención lineal denominada Triadic Linear Attention. El modelo sustituye la atención softmax estándar por un estado recurrente tridimensional con compuertas (gated deltanet), lo que permite manejar contextos largos con coste lineal en lugar de cuadrático. Es relevante porque explora una familia de arquitecturas alternativas al transformer clásico para secuencias largas, y publica resultados específicos de recuperación de información (NIAH, Recall) a 64k tokens.

El checkpoint tiene 385,4 millones de parámetros, 24 capas, dimensión de modelo 1024 y 8 cabezas, con una dimensión de segunda clave E=8. Se preentrenó sobre 20.000 millones de tokens de FineWeb-Edu a 4k de contexto y se extendió a 64k con 2.000 millones de tokens adicionales. Usa el tokenizador de Llama-2 y está pensado exclusivamente para inglés.

No es un modelo listo para producción: es un artefacto de investigación con 0 descargas y 0 likes, sin pipeline declarado, que requiere código propio y, según el autor, una GPU H100 para su ejecución. Su interés es fundamentalmente académico y de evaluación de arquitecturas de atención lineal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (Triadic Gated DeltaNet, E=8) |
| Parametros totales | 385.412.096 (385,4M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64k tokens (preentrenado a 4k y extendido a 64k) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas | 24 |
| Dimension de modelo (d_model) | 1024 |
| Cabezas de atencion | 8 |
| Dimension de segunda clave (E) | 8 |
| Tokenizador | Llama-2 |
| Tamano del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 24 capas con d_model 1024 y 8 cabezas, pero reemplaza la atención softmax por Triadic Linear Attention, un mecanismo de atención lineal basado en un estado recurrente tridimensional con compuertas (gated deltanet). El paper asociado, "Triadic Linear Attention: Three-Dimensional Recurrent States for Long-Context Sequence Modeling" (arXiv:2609.36529), propone estados recurrentes de tres dimensiones para modelar secuencias largas con coste lineal. La dimensión de segunda clave E=8 es un hiperparámetro específico de esta variante.

El entrenamiento consta de dos fases: un preentrenamiento sobre 20.000 millones de tokens de FineWeb-Edu con contexto de 4k, seguido de una extensión de contexto a 64k sobre 2.000 millones de tokens adicionales. No se menciona en la información disponible el uso de RLHF, DPO ni datos de instrucción; se trata de un modelo base preentrenado, no ajustado para seguir instrucciones. El checkpoint corresponde a la semilla 1337.

## Capacidades

- Generación de texto autoregresiva en inglés como modelo base (no ajustado a instrucciones).
- Modelado de lenguaje de contexto largo: ventana de hasta 64k tokens.
- Recuperación de información en contexto largo, evaluada mediante NIAH (Needle in a Haystack) y una tarea de Recall.
- Modelado de documentos largos, evaluado en PG19 en tramos de ≤4k, 4k–16k y 16k–64k.
- No hay evidencia en la información disponible de soporte de tool calling, function calling ni capacidades de agente.
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe: solo inglés declarado.

## Casos de uso

- Investigación en arquitecturas de atención lineal: el checkpoint sirve para reproducir y comparar los resultados del paper sobre eficiencia y calidad en contextos largos frente a transformers con atención softmax.
- Evaluación de recuperación en contexto largo: usar NIAH y Recall para medir la degradación del modelo a 16k–64k tokens en tareas de aguja en pajar.
- Modelado de documentos extensos: procesar libros o informes de decenas de miles de tokens en una sola pasada, aprovechando el contexto de 64k y el coste lineal de la atención.
- Base para fine-tuning experimental: al ser un modelo base de 385M con licencia MIT, puede servir como punto de partida para ajustes supervisados en dominios concretos en inglés.
- Estudio comparativo de eficiencia memoria/tiempo: medir el consumo de memoria y throughput frente a un transformer de tamaño similar con atención cuadrática en secuencias de 64k.
- Reproducción académica: validar los números publicados (WikiText 10,86; PG19 13,77 en 16k–64k; NIAH 27,0) con la semilla 1337 y el código del repositorio.

## Benchmarks y rendimiento

Resultados publicados en la model card (0-shot, semilla 1337):

| Metrica | Resultado |
|---|---|
| 0-shot | 53,5 |
| WikiText | 10,86 |
| PG19 ≤4k | 14,81 |
| PG19 4k–16k | 14,07 |
| PG19 16k–64k | 13,77 |
| Recall | 32,2 |
| NIAH | 27,0 |

No se han publicado en la información disponible comparaciones directas con otros modelos en estos benchmarks, ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El autor indica explícitamente que el modelo requiere una GPU H100 y el código del repositorio TriadicLinearAttention.
- VRAM estimada para inferencia: no disponible de forma oficial; con 385,4M parámetros en fp32 los pesos ocupan aproximadamente 1,5 GB, por lo que la VRAM real dependerá de las activaciones y del estado recurrente a 64k tokens.
- GPU recomendadas: H100 según el autor; no se confirma compatibilidad con A100, RTX 4090 u otras.
- No se confirma que quepa en GPU de consumo; la dependencia de una implementación específica y de H100 sugiere que no está optimizado para ellas.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; el uso documentado es mediante carga directa de safetensors con el código propio (`model.py`, `GPTConfig`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Triadic GDN E=8 400M 64k | 385,4M | 64k | Atención lineal (gated deltanet) | MIT | Hugging Face, código propio |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de modelos comparables de la misma familia (otras variantes de atención lineal o gated deltanet) con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo base preentrenado: no está ajustado para seguir instrucciones ni para diálogo; no debe usarse directamente como asistente.
- Solo inglés: no hay soporte multilingüe declarado.
- Calidad limitada: los resultados publicados son modestos (NIAH 27,0; Recall 32,2), lo que indica una recuperación en contexto largo todavía débil.
- Dependencia de código e infraestructura: requiere el repositorio TriadicLinearAttention y, según el autor, una H100, lo que limita su reproducibilidad.
- Riesgo de alucinación: al ser un modelo de lenguaje preentrenado, puede generar contenido plausible pero incorrecto; no se han publicado evaluaciones de sesgo o toxicidad.
- Licencia MIT: permite uso comercial, pero al ser un artefacto de investigación sin validación en producción, su uso comercial no está respaldado por evaluaciones de robustez.
- Sin cuantizaciones publicadas ni integración con frameworks de despliegue estándar, lo que dificulta su adopción fuera de entornos de investigación.
- Fecha de creación del repositorio (2026-11-22) y referencia arXiv 2609.36529: verificar la vigencia y disponibilidad del paper y del código antes de depender de ellos.

## Enlaces

- Hugging Face: https://huggingface.co/OliverSieberling/triadic-gdn-e8-400m-64k
- Paper: https://arxiv.org/abs/2609.36529
- Código: https://github.com/OliverSieberling/TriadicLinearAttention
