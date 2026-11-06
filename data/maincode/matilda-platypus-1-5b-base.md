# Maincode/Matilda-Platypus-1.5B-Base

## Resumen

Matilda Platypus 1.5B (Base) es un modelo de lenguaje de tamaño intermedio desarrollado por Maincode mediante una técnica de "puente de representaciones" (Representation Bridge). En lugar de entrenar un modelo desde cero, conecta las capas inferiores de un modelo Qwen3-1.7B-Base con las capas superiores de un Qwen3-0.6B-Base, alineando las representaciones ocultas en el punto de unión mediante una capa lineal aprendida. El resultado es un modelo de 1,53B de parámetros que consume el 73% del cómputo del padre mayor (2,7 GFLOP por token frente a 3,7) y supera al padre menor en los 13 benchmarks evaluados.

El problema que aborda es la creación de modelos de tamaños arbitrarios ("any size you want") sin coste de preentrenamiento completo, reutilizando pesos ya publicados de modelos abiertos. Es relevante porque demuestra que la combinación por capas de dos modelos preentrenados, con una adaptación supervisada ligera y una etapa de RL con recompensas verificables, produce un punto de calidad/cómputo intermedio útil.

Se trata de un modelo base (sin ajuste por instrucciones), con arquitectura transformer híbrida derivada de Qwen3, tokenizador de Qwen3 y licencia Apache 2.0. El checkpoint pesa 1,2 GB en el repositorio y requiere `transformers >= 4.56` con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido por ensamblado de capas: 18 capas de Qwen3-1.7B-Base + puente lineal + 10 capas de Qwen3-0.6B-Base (corte `18+10`) |
| Parametros totales | 1,53B (incluye 2,1M del Representation Bridge) |
| Parametros activos | 1,53B (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda la del tokenizador Qwen3, no confirmada en la documentación) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; sin cuantizaciones oficiales publicadas) |
| Idiomas soportados | no disponible (heredados de los padres Qwen3; entrenamiento en inglés, código y matemáticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`bridge.safetensors` + `upper_block/`; el bloque inferior se descarga de Qwen/Qwen3-1.7B-Base) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer entrenado ex novo, sino un ensamblado: el paso hacia adelante ejecuta el embedding y las capas 1–18 de Qwen3-1.7B-Base (congeladas en sus pesos originales), proyecta las representaciones ocultas de 2048 a 1024 unidades mediante un Representation Bridge lineal de 2,1M de parámetros, y continúa por las capas 19–28 de Qwen3-0.6B-Base (ligeramente adaptadas con actualizaciones de bajo rango ya fusionadas), terminando con su normalización final y cabeza de salida. Se mantiene una caché KV por bloque.

El entrenamiento siguió tres fases: (1) inicialización del puente por mínimos cuadrados sobre un pequeño conjunto de calibración, usando la pérdida de modelado del lenguaje para clasificar cortes candidatos; (2) adaptación supervisada del puente y de las actualizaciones de bajo rango sobre unos pocos miles de millones de tokens de texto web mixto, código, matemáticas y soluciones detalladas; (3) un breve aprendizaje por refuerzo con recompensas verificables (RLVR) sobre problemas de código con tests unitarios y problemas de matemáticas con respuesta comprobable. No se aplicó RLHF/DPO clásico.

## Capacidades

- Modelado de lenguaje base: continuación de texto, sin ajuste por instrucciones ni alineación de seguridad.
- Generación y completado de código: 0,409 de pass@1 en HumanEval y 0,456 en MBPP, por encima del padre menor.
- Razonamiento matemático con cadena de pensamiento: 0,691 en GSM8K (8-shot CoT).
- Razonamiento general multi-tarea: 0,473 en BBH (3-shot CoT).
- Conocimiento y comprensión lectora: 0,606 en MMLU, 0,777 en BoolQ.
- Compatibilidad completa con `generate()` de transformers (muestreo, temperature, top_k, top_p, stopping_criteria, streamer, etc.) y con lm-eval-harness.
- Sin soporte oficial de tool calling, function calling ni agentes (es un modelo base).
- Sin capacidades multimodales (solo texto).
- Decodificación greedy y por muestreo; la búsqueda por haz (beam search) lanza `NotImplementedError`.

## Casos de uso

- Investigación en arquitecturas de modelos: el método de puente de representaciones permite estudiar cómo se alinean representaciones de modelos de distinto tamaño, con un checkpoint pequeño y barato de ejecutar.
- Completado de código en entornos locales: con 1,53B de parámetros y buen pass@1 en HumanEval/MBPP, es adecuado para autocompletado de código en IDEs locales donde se prefiera un modelo base que continúe el código en lugar de dialogar.
- Generación sintética de datos de preentrenamiento: al ser un modelo base rápido y de calidad intermedia, sirve para generar corpus de texto, código y soluciones matemáticas que luego filtran modelos más grandes.
- Destilación y evaluación de pipelines de RLVR: el propio modelo fue entrenado con recompensas verificables, por lo que es un buen sujeto de prueba para reproducir o extender recetas de RL con tests unitarios y respuestas matemáticas comprobables.
- Fine-tuning posterior por terceros: su licencia Apache 2.0 y su tamaño reducido lo hacen idóneo como punto de partida para ajustes por instrucciones o DPO en dominios concretos (el equipo ya publicó variantes derivadas).
- Experimentación en hardware de consumo: cabe en GPUs de consumo sin cuantizar, útil para docencia, prototipado y pruebas de inferencia con transformers o lm-eval-harness.

## Benchmarks y rendimiento

Evaluación con lm-eval-harness 0.4.13, protocolo idéntico para el modelo y ambos padres (0-shot salvo indicación; HumanEval con fences markdown eliminados; MBPP con código ejecutado):

| Benchmark | Qwen3-0.6B-Base | Platypus 1.5B | Qwen3-1.7B-Base |
|---|---|---|---|
| HumanEval pass@1 | 0,287 | 0,409 | 0,494 |
| GSM8K (8-shot CoT) | 0,595 | 0,691 | 0,729 |
| MMLU (5-shot) | 0,527 | 0,606 | 0,625 |
| BBH (3-shot CoT) | 0,406 | 0,473 | 0,529 |
| HellaSwag | 0,538 | 0,595 | 0,665 |
| ARC-Easy | 0,579 | 0,660 | 0,686 |
| ARC-Challenge | 0,385 | 0,407 | 0,446 |
| OpenBookQA | 0,344 | 0,374 | 0,388 |
| WinoGrande | 0,587 | 0,635 | 0,644 |
| PIQA | 0,701 | 0,726 | 0,758 |
| LAMBADA | 0,537 | 0,574 | 0,633 |
| MBPP pass@1 | 0,390 | 0,456 | 0,566 |
| BoolQ | 0,697 | 0,777 | 0,790 |

Supera al padre menor en 13 de 13 benchmarks y no supera al padre mayor en ninguno, con el 73% de su cómputo (2,7 frente a 3,7 GFLOP por token; el padre menor consume 1,4). Nota: la revisión 1 del código remoto subestimaba GSM8K (~0,58) por un bug en `max_new_tokens`; la revisión 2 (31/10/2026) lo corrige sin cambiar los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3–4 GB en bfloat16 (1,53B de parámetros; el repositorio pesa 1,2 GB pero el bloque inferior se descarga aparte desde Qwen3-1.7B-Base). Cifra exacta no publicada.
- GPU recomendadas: cualquier GPU moderna con 6 GB o más de VRAM; no se requiere hardware de centro de datos. No se han publicado recomendaciones concretas de modelo de GPU.
- Consumer GPUs: sí, cabe cómodamente en RTX 3060, RTX 4060 o superiores sin cuantización.
- Despliegue: confirmado con `transformers >= 4.56` (probado en 4.56 y 5.x) mediante código remoto con `trust_remote_code=True` y compatible con lm-eval-harness (`--model hf`). No hay soporte oficial publicado para vLLM, llama.cpp, Ollama ni TGI; el código remoto y la dependencia de descargar el bloque inferior desde el hub pueden complicar la integración con esos motores.
- Latencia y throughput: no disponibles como medidas verificadas; el reporte solo indica un cómputo relativo de 2,7 GFLOP por token (73% del padre mayor, 1,9x el padre menor), que no es una medición de latencia.

## Comparativa con modelos similares

| Caracteristica | Platypus 1.5B (Base) | Qwen3-0.6B-Base | Qwen3-1.7B-Base |
|---|---|---|---|
| Parametros | 1,53B | 0,6B | 1,7B |
| GFLOP/token | 2,7 | 1,4 | 3,7 |
| MMLU (5-shot) | 0,606 | 0,527 | 0,625 |
| GSM8K (8-shot CoT) | 0,691 | 0,595 | 0,729 |
| HumanEval pass@1 | 0,409 | 0,287 | 0,494 |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Disponibilidad | Hugging Face, código remoto | Hugging Face, soporte amplio | Hugging Face, soporte amplio |

La comparación más pertinente es con sus propios padres, ya que el modelo se posiciona deliberadamente entre ambos: ofrece una mejora media de varios puntos sobre Qwen3-0.6B-Base a cambio de aproximadamente el doble de cómputo, sin alcanzar al Qwen3-1.7B-Base original. Frente a otros modelos densos de ~1,5B de la misma categoría, no hay datos comparativos publicados en la documentación disponible.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado por instrucciones ni alineado en seguridad, por lo que puede generar contenido ofensivo, incorrecto o incoherente si se usa directamente en producción sin un fine-tuning posterior.
- Riesgo de alucinación típico de modelos base pequeños; los conocimientos y el comportamiento derivan de los dos padres Qwen3 y de los datos de adaptación.
- Diferencias de unas pocas décimas en los benchmarks están dentro de la varianza entre ejecuciones según el propio autor; no sobredimensionar las mejoras reportadas.
- El código remoto descarga el bloque inferior desde `Qwen/Qwen3-1.7B-Base` en tiempo de ejecución, lo que introduce una dependencia externa y requiere `trust_remote_code=True` (revisar el código antes de usarlo en entornos sensibles).
- Beam search no está implementado; solo greedy y muestreo.
- La revisión 1 del código remoto ignoraba `max_length` y `stopping_criteria` y truncaba respuestas de cadena de pensamiento; usar la revisión 2 o posterior.
- Longitud de contexto, idiomas soportados y cuantizaciones oficiales no documentadas.
- La licencia Apache 2.0 permite uso comercial sin restricciones significativas, pero los pesos heredan el comportamiento de Qwen3, cuyo uso está sujeto a su propia licencia Apache 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maincode/Matilda-Platypus-1.5B-Base
- Padre mayor (bloque inferior, se descarga en runtime): https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Padre menor: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Reporte técnico: `technical_report.pdf` (incluido en el repositorio del modelo)
- Paper de referencia de Qwen3: https://arxiv.org/abs/2505.09388
- Demo online: no disponible
