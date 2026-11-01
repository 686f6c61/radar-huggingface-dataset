# Maincode/Matilda-Platypus-1.6B-Base

## Resumen

Matilda Platypus 1.6B (Base) es un modelo lingüístico de tamaño intermedio desarrollado por Maincode mediante una técnica de "puente de representaciones" (Representation Bridge): en lugar de entrenar un modelo desde cero, se conectan las 20 primeras capas de Qwen3-1.7B-Base con las 8 últimas capas de Qwen3-0.6B-Base, alineando las representaciones ocultas en el punto de unión mediante una capa lineal aprendida de 2,1 millones de parámetros (2048 → 1024 unidades ocultas).

El problema que resuelve es la obtención de modelos de tamaño intermedio sin el coste de un preentrenamiento completo: el resultado ofrece 1,60B parámetros y 2,8 GFLOP por token (el 77% del cómputo del padre mayor), situándose por encima del padre pequeño en los 13 benchmarks evaluados y por encima del padre mayor en 2 de 13. Esto lo hace relevante como prueba de concepto de una familia de modelos "del tamaño que quieras" construidos por recombinación de capas.

Se trata de un modelo base (sin ajuste por instrucciones ni afinado de seguridad), entrenado con unos pocos miles de millones de tokens de texto web mixto, código, matemáticas y soluciones razonadas, seguido de una etapa breve de aprendizaje por refuerzo con recompensas verificables. Utiliza el tokenizador de Qwen3 y se distribuye bajo licencia Apache 2.0 en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido por recombinación de capas: 20 capas de Qwen3-1.7B-Base + puente lineal + 8 capas de Qwen3-0.6B-Base (corte `20+8`) |
| Parametros totales | 1,60B |
| Parametros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | no disponible (heredada de los padres Qwen3, no confirmada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; sin cuantizaciones oficiales publicadas) |
| Idiomas soportados | no disponible explícitamente; hereda las capacidades del tokenizador y padres de Qwen3 |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`lower_block/`, `upper_block/`, `bridge.safetensors`), con `custom_code` en transformers |

## Arquitectura y entrenamiento

La arquitectura no es un transformer convencional entrenado de forma monolítica, sino una composición: el pase hacia adelante ejecuta el embedding y las capas 1–20 de Qwen3-1.7B-Base (dimensión oculta 2048), aplica un puente lineal aprendido que proyecta a 1024 unidades, y continúa por las capas 21–28 de Qwen3-0.6B-Base, terminando con su normalización final y su cabeza de salida. Cada bloque mantiene su propia caché KV. El bloque inferior se adapta ligeramente junto con el superior y se distribuye adaptado en el repositorio; el bloque superior recibe actualizaciones de bajo rango (ya fusionadas en los pesos publicados).

El entrenamiento sigue tres fases: (1) inicialización del puente por mínimos cuadrados sobre un pequeño conjunto de calibración, usando la pérdida de modelado del lenguaje para seleccionar el punto de corte entre candidatos; (2) adaptación supervisada del puente y de las actualizaciones de bajo rango sobre unos pocos miles de millones de tokens de texto web mixto, código, matemáticas y soluciones paso a paso; (3) aprendizaje por refuerzo con recompensas verificables (RLVR) breve, sobre problemas de código con tests unitarios y problemas de matemáticas con respuesta comprobable. No se menciona RLHF ni DPO clásicos. Como innovación destacable, el método permite generar modelos de tamaño arbitrario recombinando capas de padres preentrenados existentes, con un coste de entrenamiento muy inferior al preentrenamiento completo.

## Capacidades

- Modelado del lenguaje de texto continuo (modelo base: completa texto, no sigue instrucciones)
- Generación de código: HumanEval pass@1 de 0,348 y MBPP pass@1 de 0,444, mejorando a ambos padres en MBPP respecto al padre pequeño
- Razonamiento matemático con cadena de pensamiento: GSM8K 8-shot de 0,686
- Razonamiento multi-tarea: BBH 3-shot CoT de 0,500
- Comprensión de lenguaje general: MMLU 5-shot de 0,616, HellaSwag 0,593, WinoGrande 0,656
- Decodificación greedy y por muestreo (temperatura, top-k, top-p, penalización de repetición); sin soporte de beam search (lanza `NotImplementedError`)
- Compatibilidad directa con lm-eval-harness mediante `--model hf` y `trust_remote_code=True`
- No hay soporte documentado de tool calling, agentes, visión ni audio

## Casos de uso

- Investigación en arquitecturas de modelos: es el caso de uso principal; permite estudiar cómo se alinean representaciones entre modelos de distinto tamaño y validar el método de puentes de representaciones en experimentos reproducibles con lm-eval-harness.
- Completado de código en entornos locales: con 0,348 de pass@1 en HumanEval y un tamaño de 1,6B, puede servir como motor de autocompletado de código en editores locales donde la latencia y la VRAM son limitadas.
- Generación de soluciones matemáticas paso a paso como texto continuo: su puntuación de 0,686 en GSM8K con cadena de pensamiento lo hace adecuado para prototipos de resolución de problemas aritméticos mediante prompting few-shot.
- Base para afinado posterior por instrucciones: al ser un modelo base con licencia Apache 2.0, es un punto de partida válido para SFT y DPO en proyectos que necesiten un modelo pequeño con buen rendimiento relativo.
- Despliegue en hardware de consumo o edge: con 1,6B de parámetros en bfloat16 (~3,2 GB), es viable en GPUs de consumo y portátiles con GPU dedicada para tareas de generación de texto.
- Experimentación con cómputo ajustado: al operar al 77% del cómputo del padre mayor (2,8 frente a 3,7 GFLOP por token), es útil en escenarios donde se busca un compromiso explícito entre calidad y coste de inferencia por token.

## Benchmarks y rendimiento

Evaluación con lm-eval-harness 0.4.13, protocolo idéntico para el modelo y ambos padres (0-shot opción múltiple, MMLU 5-shot, GSM8K 8-shot CoT, BBH 3-shot CoT, HumanEval 0-shot y MBPP 3-shot con ejecución del código). Puntuaciones en proporciones:

| Benchmark | Qwen3-0.6B-Base | Platypus 1.6B | Qwen3-1.7B-Base |
|---|---|---|---|
| HumanEval pass@1 | 0,287 | **0,348** | 0,494 |
| GSM8K (8-shot CoT) | 0,595 | **0,686** | 0,729 |
| MMLU (5-shot) | 0,527 | **0,616** | 0,625 |
| BBH (3-shot CoT) | 0,406 | **0,500** | 0,529 |
| HellaSwag | 0,538 | **0,593** | 0,665 |
| ARC-Easy | 0,579 | **0,638** | 0,686 |
| ARC-Challenge | 0,385 | **0,399** | 0,446 |
| OpenBookQA | 0,344 | **0,390** | 0,388 |
| WinoGrande | 0,587 | **0,656** | 0,644 |
| PIQA | 0,701 | **0,724** | 0,758 |
| LAMBADA | 0,537 | **0,599** | 0,633 |
| MBPP pass@1 | 0,390 | **0,444** | 0,566 |
| BoolQ | 0,697 | **0,757** | 0,790 |

Supera al padre pequeño en 13 de 13 benchmarks y al padre mayor en 2 de 13 (OpenBookQA y WinoGrande), con el 77% del cómputo del padre mayor. Los autores advierten que las diferencias de unas pocas décimas están dentro de la varianza entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,60B de parámetros en bfloat16, aproximadamente 3,2–3,5 GB solo de pesos; con overhead de KV cache y activaciones, unos 4–6 GB son suficientes para contextos moderados (estimación, no dato oficial).
- GPU recomendadas: cualquier GPU moderna con soporte bfloat16; por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090 o superiores ejecutarán el modelo con holgura. No se requieren A100 ni H100 para inferencia.
- Cabe cómodamente en GPUs de consumo: cualquier tarjeta con 6 GB o más de VRAM debería manejarlo en precisión completa sin cuantizar.
- Despliegue: integración nativa con `transformers` (requiere versión >= 4.56, probado en 4.56 y 5.x) mediante `trust_remote_code=True`. Es compatible con lm-eval-harness. No hay adaptadores oficiales publicados para vLLM, llama.cpp, Ollama ni TGI; dado que depende de código remoto personalizado con dos bloques y un puente, el soporte en esos motores no está garantizado.
- Latencia y throughput: no disponibles como mediciones verificadas; el informe indica 2,8 GFLOP por token como medida relativa de cómputo (normalizada al padre mayor), no como latencia o coste medido.

## Comparativa con modelos similares

| Característica | Matilda Platypus 1.6B (Base) | Qwen3-1.7B-Base | Qwen3-0.6B-Base |
|---|---|---|---|
| Parámetros | 1,60B | 1,7B (aprox.) | 0,6B (aprox.) |
| Método | Recombinación de capas + puente lineal | Preentrenamiento completo | Preentrenamiento completo |
| Cómputo por token | 2,8 GFLOP (77% del padre mayor) | 3,7 GFLOP | 1,4 GFLOP |
| MMLU (5-shot) | 0,616 | 0,625 | 0,527 |
| GSM8K (8-shot CoT) | 0,686 | 0,729 | 0,595 |
| HumanEval pass@1 | 0,348 | 0,494 | 0,287 |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Disponibilidad | HuggingFace, safetensors + código remoto | HuggingFace | HuggingFace |

En términos generales, Platypus 1.6B se sitúa entre sus dos padres: se acerca al padre mayor en tareas de conocimiento y razonamiento (MMLU, BBH, GSM8K) con menos cómputo, aunque pierde claramente en generación de código (HumanEval 0,348 frente a 0,494). No se han identificado en la información disponible otros modelos comparables construidos con la misma técnica de puente de representaciones.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado por instrucciones ni afinado en seguridad; continúa texto y puede generar contenido ofensivo o incorrecto si no se controla.
- Riesgo de alucinación típico de modelos base pequeños; no debe usarse como fuente de hechos sin verificación.
- Sus conocimientos y comportamientos derivan de los dos padres Qwen3 y de los datos de adaptación; hereda posibles sesgos de ambos.
- No soporta beam search (lanza `NotImplementedError`); solo greedy y muestreo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio: revisa el código remoto antes de usarlo en producción. Además, la revisión 1 del código remoto ignoraba `max_length` y `stopping_criteria` y subestimaba los benchmarks generativos (GSM8K leía ~0,58 en lugar de 0,686); usa la revisión 2 (2026-10-31) o posterior.
- Diferencias de unas pocas décimas respecto a los padres están dentro de la varianza entre ejecuciones según los propios autores; interpreta los resultados con cautela.
- La medida de cómputo (2,8 GFLOP/token, 77%) es una métrica relativa del informe, no una verificación de latencia ni de coste real.
- La longitud de contexto no está confirmada en la ficha; asume la del tokenizador y arquitectura Qwen3 pero verifícala antes de depender de contextos largos.
- No hay datos publicados sobre idiomas soportados, cuantizaciones oficiales ni soporte en motores de inferencia optimizados (vLLM, llama.cpp).
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Maincode/Matilda-Platypus-1.6B-Base
- Modelo base (padre mayor): https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Modelo base (padre menor): https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Informe técnico: `technical_report.pdf`, incluido en el repositorio del modelo
- Artículo arXiv referenciado en los tags: https://arxiv.org/abs/2505.09388
- Citación: Maincode Team (Yue Yang, Arsh Chawla, David Lemphers). *Matilda Platypus: Any Size You Want. Intelligence You Need.* Technical report, Maincode / Matilda Research, October 2026
