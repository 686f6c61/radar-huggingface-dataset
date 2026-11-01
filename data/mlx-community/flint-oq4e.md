# mlx-community/flint-oQ4e

## Resumen

flint-oQ4e es una cuantización a 4 bits para Apple Silicon del modelo Recursive Flint, desarrollado por Recursive y cuantizado por la comunidad MLX (mlx-community) mediante la herramienta oMLX con el esquema oQ4e. Flint es un modelo de lenguaje de tipo mezcla de expertos (MoE) con 39,8 mil millones de parámetros totales (40B nominales) y unos 2,5 mil millones de parámetros activos por token, orientado a código, agentes y conversación, con una ventana de contexto de 262.000 tokens.

La relevancia de esta variante radica en que reduce el modelo desde los 79,6 GB en bf16 hasta 23,4 GB en disco, manteniendo una perplejidad a menos de 0,6 puntos del original y siendo la variante más rápida de toda la familia oQ. Es la opción por defecto para ejecutar Flint en Macs con 32 GB de memoria unificada, con velocidades de generación de hasta 120 tokens por segundo en contexto corto en un MacBook Pro M5 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (2 capas densas + 47 capas MoE, 256 expertos enrutados con top-6 + 1 experto compartido) |
| Parametros totales | 39.785.299.488 (~40B) |
| Parametros activos | ~2,5B por token |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | oQ4e (nivel 4 mejorado con imatrix, grupo de 64, afín; expertos enrutados a 4 bits, resto a 8 bits) |
| Idiomas soportados | no disponible (el corpus de evaluación es prosa en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización afín estándar de MLX) |

## Arquitectura y entrenamiento

Flint es un transformer disperso de mezcla de expertos con 49 capas: 2 densas y 47 MoE. En cada capa MoE hay 256 expertos enrutados de los que se activan 6 por token, más un experto compartido que se evalúa siempre. La atención es híbrida: 35 capas usan atención por ventana deslizante de 513 tokens y 14 capas usan atención completa, lo que permite escalar a 262.000 tokens de contexto con un coste de memoria razonable.

Sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no hay datos en la información disponible; la model card remite a la ficha original de RecursiveSI/flint. En cuanto a la cuantización, oQ4e es un esquema de precisión mixta guiado por datos: el asignador mide la sensibilidad de cada capa sobre los pesos bf16 y mantiene a 8 bits todo lo que se lee en cada token (atención q/k/v/o, experto compartido, capas densas, embed_tokens y lm_head), mientras que los expertos enrutados, que solo se leen parcialmente, bajan a 4 bits. La "e" (enhanced) añade una pasada de matriz de importancia (imatrix) con 128 muestras de calibración que ajusta el rango de clipping de cada grupo según la activación. El resultado es cuantización afín MLX estándar, sin kernels personalizados.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Generación y razonamiento sobre código (tag `code` en el repositorio).
- Soporte de agentes y razonamiento multi-paso: el servidor oMLX expone una API compatible con OpenAI con tool calls y devuelve el razonamiento en el campo `reasoning_content`.
- Contexto muy largo (262k tokens) con atención híbrida ventana deslizante + completa.
- Modo de razonamiento con presupuesto compartido: Recursive recomienda al menos 32k tokens de salida para problemas difíciles y mantener el razonamiento devuelto en el historial de la conversación entre turnos.
- Carga compatible con mlx-vlm (≥ 0.7.10), lo que sugiere soporte de capacidades multimodales a través de esa librería, aunque no hay detalles específicos.
- Etiquetas del repo sugieren orientación a agentes (tag `agent`) y MoE (tag `moe`).

## Casos de uso

- Ejecución local en MacBook con 32 GB de memoria unificada: con 23,4 GB en disco y ~23,5 GB de pico en memoria, es la variante por defecto que cabe en un Mac de 32 GB manteniendo calidad cercana a bf16.
- Asistentes de código locales: con 120 tok/s en contexto corto y razonamiento explícito, sirve para autocompletado, refactorizaciones y generación de funciones completas sin enviar código a la nube.
- Agentes con tool calling en local: el servidor oMLX expone API compatible con OpenAI con llamadas a herramientas, ideal para pipelines de agentes que ejecutan comandos, consultan APIs o manipulan ficheros.
- Análisis de documentos largos: la ventana de 262k tokens permite procesar bases de código completas, contratos o conjuntos de documentos en una sola sesión.
- Chatbot multi-turno con razonamiento persistente: se recomienda mantener el razonamiento en el historial entre turnos, lo que mejora la coherencia en conversaciones largas de asistencia técnica o tutoría.
- Resolución de problemas difíciles de razonamiento (matemáticas, planificación): Recursive recomienda temperatura 1.0, top-p 0.95, top-k 20 y un presupuesto de salida de 32k tokens o más, ya que razonamiento y respuesta comparten presupuesto.
- Prototipado en dispositivos Apple Silicon sin GPU de datacenter: despliegue directo con `hf download` y `omlx serve`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de fidelidad frente al modelo bf16 y de velocidad de generación.

Fidelidad frente a bf16 (64 fragmentos de 2048 tokens, 65.472 posiciones puntuadas, KL truncado al top-256 de bf16):

| Modelo | Tamaño | bpw | KL media ↓ | Perplejidad ↓ | Acuerdo top-1 ↑ |
|---|---|---|---|---|---|
| bf16 (referencia) | 79,6 GB | 16 | 0 | 14,30 | 100% |
| oQ8e | 42,3 GB | 8,50 | 0,038 | 14,33 | 92,3% |
| oQ6e | 32,8 GB | 6,60 | 0,051 | 14,34 | 90,3% |
| oQ5e | 28,1 GB | 5,65 | 0,089 | 14,38 | 86,2% |
| **oQ4e (este repo)** | 23,4 GB | 4,70 | 0,222 | 14,86 | 78,3% |
| oQ3e | 18,5 GB | 3,71 | 0,650 | 16,92 | 64,6% |

Velocidad de generación (tok/s, decodificación greedy, 256 tokens, mediana de 3 ejecuciones, MacBook Pro M5 Max 128 GB, kernel MoE fusionado de oMLX activado):

| Contexto | oQ4e (este repo) |
|---|---|
| ~30 tokens | 120 |
| 4k | 110 |
| 16k | 105 |

Memoria pico durante la generación: ~23,5 GB en contexto corto y ~25,0 GB a 16k de contexto. El autor advierte que el corpus de evaluación (prosa en inglés del banco de pruebas de oMLX) no está garantizado como disjunto de los datos de calibración de oQ, por lo que las cifras sirven para ordenar las variantes entre sí, no como puntuación de calidad absoluta.

## Requisitos de hardware

- VRAM / memoria unificada estimada: ~23,5 GB de pico en contexto corto y ~25,0 GB a 16k de contexto; 23,4 GB en disco (~4,70 bits por peso).
- Hardware de referencia: MacBook Pro M5 Max con 128 GB y 40 núcleos GPU, donde se cuantizó y probó. Cabe en un Mac con 32 GB de memoria unificada (es la variante recomendada para esa configuración).
- En GPUs NVIDIA convencionales (RTX 4090 con 24 GB) quedaría justo en el límite para contexto corto y no para contexto largo; no hay mediciones publicadas para hardware no Apple.
- Despliegue recomendado: oMLX (`hf download mlx-community/flint-oQ4e` y `omlx serve`, con API compatible con OpenAI y soporte de tool calls). Alternativa: mlx-vlm ≥ 0.7.10. No compatible directamente con mlx-lm, porque los pesos llevan el prefijo `language_model.` de mlx-vlm. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama.
- Rendimiento: 120 tok/s a contexto corto, 105 tok/s a 16k en M5 Max. El kernel MoE fusionado de oMLX aporta ~16% de velocidad (~108 → ~125 tok/s en oQ4 sin imatrix). Por debajo de oQ4e, reducir bits ahorra memoria pero no aumenta la velocidad: con ~2,5B de parámetros activos, la decodificación está limitada por el lanzamiento de kernels.

## Comparativa con modelos similares

Comparativa entre las variantes cuantizadas de Flint para Apple Silicon publicadas por mlx-community:

| Modelo | Tamaño | bpw | KL media | Perplejidad | Tok/s (ctx corto) | Memoria pico |
|---|---|---|---|---|---|---|
| flint-oQ4e (este repo) | 23,4 GB | 4,70 | 0,222 | 14,86 | 120 | 23,5–25,0 GB |
| flint-oQ5e | 28,1 GB | 5,65 | 0,089 | 14,38 | 103 | 28,2–29,7 GB |
| flint-oQ6e | 32,8 GB | 6,60 | 0,051 | 14,34 | 108 | 32,9–34,4 GB |
| flint-oQ3e | 18,5 GB | 3,71 | 0,650 | 16,92 | 109 | 18,5–20,0 GB |

oQ4e es la variante más rápida de la familia (120 tok/s) y la única con calidad cercana a bf16 que cabe en 32 GB; oQ5e y oQ6e ofrecen mayor fidelidad a cambio de 5–15% menos velocidad y más memoria. No se dispone de datos comparativos con otros modelos MoE de tamaño similar (por ejemplo Qwen3 o Mixtral) en la información proporcionada.

## Limitaciones y advertencias

- Las métricas de fidelidad (KL, perplejidad) provienen de un corpus en inglés que puede solaparse con los datos de calibración de la imatrix, por lo que no deben interpretarse como una medida de calidad absoluta en tareas reales.
- El autor declara explícitamente que no ha ejecutado todavía benchmarks de tareas; no hay evaluaciones publicadas de código, matemáticas o agentes para esta cuantización.
- La cuantización a 4 bits implica un acuerdo top-1 del 78,3% con bf16 y una KL media de 0,222: para aplicaciones muy sensibles a la distribución exacta del modelo, oQ5e u oQ6e pueden ser opciones más prudentes.
- Los pesos usan el prefijo `language_model.` de mlx-vlm, por lo que no cargan directamente con mlx-lm; hay que usar oMLX o mlx-vlm ≥ 0.7.10.
- El razonamiento y la respuesta comparten el presupuesto de salida: para problemas difíciles se necesitan 32k tokens o más, lo que aumenta la latencia total de las respuestas.
- Sin datos sobre idiomas soportados; el corpus de evaluación es prosa en inglés, por lo que el rendimiento en castellano no está documentado.
- El kernel MoE fusionado solo está activo por defecto en builds de oMLX del 27 de octubre de 2026 en adelante; con versiones anteriores se pierde ~16% de velocidad.
- Licencia Apache 2.0, sin restricciones de uso comercial conocidas; las limitaciones del modelo base (sesgos, alucinaciones) heredan de RecursiveSI/flint, cuya model card debe consultarse.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mlx-community/flint-oQ4e
- Modelo base (bf16): https://huggingface.co/RecursiveSI/flint
- oMLX (herramienta de cuantización y servidor): https://github.com/jundot/omlx
- Desarrollador del modelo base: https://www.recursive.com
- Variantes relacionadas: https://huggingface.co/mlx-community/flint-oQ8e, https://huggingface.co/mlx-community/flint-oQ6e, https://huggingface.co/mlx-community/flint-oQ5e, https://huggingface.co/mlx-community/flint-oQ3e
