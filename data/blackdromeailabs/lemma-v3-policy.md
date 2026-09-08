# BlackdromeAILabs/lemma-v3-policy

## Resumen

LEMMA v3 es una política condicionada por objetivos desarrollada por BlackdromeAILabs que puntúa reglas de reescritura simbólica sobre el vocabulario fijo de 572 reglas de LEMMA. Con solo 2,27 millones de parámetros, el modelo actúa como un clasificador de acciones en un bucle de búsqueda neuro-simbólica: recibe una expresión y la expresión objetivo, y ordena las reglas candidatas que ya han sido admitidas por el guardarraíl simbólico y el verificador con tipos de evidencia.

Se trata de un transformer encoder-only de 4 capas y 8 cabezas de atención, con cabezas de política y valor, entrenado íntegramente con datos sintéticos generados por las plantillas de reglas del propio LEMMA. Su integración en Monte Carlo Tree Search permite explorar reescrituras de horizonte largo de forma más eficiente, aunque su función se limita a ordenar reglas: toda reescritura debe ser producida y verificada por el sistema externo.

La relevancia del modelo reside en su enfoque neuro-simbólico, donde una política aprendida se acopla a un motor formal de reescritura sin sustituir la verificación. La variante v3 está diseñada como ablação controlada sin datos de recuperación fuera de ruta y se acompaña de metadatos de entrenamiento y un benchmark interno de 89 problemas.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only con cabezas de política y valor |
| Parámetros totales | 2.272.318 (69 tensores) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 1.088 tokens (secuencia máxima de entrada) |
| Tipos de cuantización | F32 (no se han publicado pesos cuantizados) |
| Idiomas soportados | Inglés (según metadatos; el modelo no procesa texto natural, sino representaciones simbólicas) |
| Licencia | MPL-2.0 |
| Formato de pesos | safetensors + manifest.json (Candle) |

## Arquitectura y entrenamiento

LEMMA v3 es un transformer encoder-only con 4 capas, 8 cabezas de atención, dimensión de embedding 256 y dimensión oculta 512. Dispone de una cabeza de política con 573 clases (572 reglas registradas más una clase terminal reservada) y una cabeza de valor. La entrada se codifica como `[START] estado <SEP> objetivo [END]`, tokenizada a partir del árbol de sintaxis abstracta (AST) de la expresión. El token separador reutiliza una ranura de vocabulario previamente no asignada, por lo que los checkpoints condicionados por objetivo y los que no lo están permanecen cargables con la misma forma de tensores.

El modelo incorpora un mecanismo de vinculación de vocabulario: el manifest registra un resumen del vocabulario (`18352749361355727982`) y el número de clases. Si el registro de reglas del entorno no coincide, la carga falla de forma segura, impidiendo que un checkpoint se aplique silenciosamente a un espacio de acciones diferente. El cargador resuelve el manifest reemplazando la extensión del archivo de pesos por `.manifest.json`, por lo que ambos archivos deben conservar sus nombres y estar en el mismo directorio.

El entrenamiento se realizó íntegramente con datos sintéticos generados por las plantillas de reglas de LEMMA, sin corpus humanos, web ni matemáticos de terceros. Se validaron 1.099 problemas (106 rechazados durante el replay) y se generaron 44.497 filas de entrenamiento nominales (42.520 distintas). La versión v3 es idéntica a v2 en arquitectura, datos e hiperparámetros, pero con `--recovery-per-problem 0`, lo que elimina las filas de recuperación fuera de ruta; la tasa de recuperación es del 13,4% en v1, 3,5% en v2 y 0% en v3.

El entrenamiento siguió un currículum de profundidades (2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128) con 100 problemas solicitados por profundidad y 12 familias de plantillas. Se ejecutaron 7 épocas en 2.398,9 segundos sobre una NVIDIA A10G de 24 GB vía Modal, usando Rust `candle-core` 0.8.4 y `cudarc` 0.13.9. El optimizador fue AdamW con weight decay 0,01 y una programación de tasa de aprendizaje coseno con pico de 3e-4, mínimo de 3e-5 y warmup del 5%. La pérdida de valor se ponderó con 0,5 y el descuento objetivo fue 0,97.

Nota sobre la selección del checkpoint: cada época sobrescribe la misma ruta de salida, por lo que el archivo publicado corresponde a la última época ejecutada (época 6 de 7) y no a la de mejor validación. El manifest registra un top-1 de validación de ramificación de 1,0000 en la época 0, pero ese valor es descriptivo de una época diferente y no es una propiedad de estos pesos.

## Capacidades

- Ranking de reglas de reescritura: puntúa las 572 reglas del vocabulario fijo de LEMMA dado un estado y un objetivo.
- Condicionamiento por objetivo: la entrada incluye el estado actual y la expresión objetivo, lo que permite dirigir la búsqueda hacia una meta específica.
- Cabeza de valor: proporciona estimaciones de valor para guiar el MCTS, no solo un ranking de acciones.
- Integración con búsqueda arbórea: compatible con MCTS de solo política (policy-only) y con MCTS de política-valor (policy-value), según los benchmarks publicados.
- Carga segura con vinculación de vocabulario: el manifest impide aplicar el modelo a un espacio de reglas distinto al de entrenamiento.
- Bloqueo de condicionamiento: el sistema consulta la flag `goal_conditioned` en el manifest y nunca mezcla codificaciones con y sin objetivo.
- No apto para generación de texto, lenguaje natural, matemáticas generales ni demostración de teoremas.

## Casos de uso

- Guía de búsqueda MCTS en reescritura simbólica: en el entorno de LEMMA, el modelo se consulta tras el guardarraíl simbólico y el verificador para puntuar las reglas admitidas, reduciendo la ramificación en problemas de horizonte largo. Es adecuado porque sus cabezas de política y valor están entrenadas específicamente para ese espacio de acciones.
- Ablación de datos de recuperación: la variante v3 está diseñada para aislar la variable de datos de recuperación fuera de ruta. Un investigador puede cargar este checkpoint y comparar su rendimiento con v1 y v2 sin modificar la generación de datos ni los hiperparámetros.
- Reproducción de resultados: el benchmark y los pesos están disponibles, y el manifest registra la semilla, las épocas y el tiempo de entrenamiento. Se puede verificar la integridad de los pesos con `sha256sum` y reproducir los resultados del benchmark de 89 problemas.
- Evaluación de políticas de reescritura: este modelo sirve como referencia para comparar nuevas políticas que operen sobre el mismo vocabulario de 572 reglas, usando el LEMMA Long-Horizon Rewrite Benchmark como métrica estándar.
- Investigación en neuro-simbolismo: al ser un transformer de solo 2,27 millones de parámetros con condicionamiento por objetivo y vinculación de vocabulario, ofrece un caso de estudio para investigar cómo las políticas aprendidas pueden integrarse en motores de reescritura formales sin reemplazar la verificación.
- Currículum de aprendizaje: el manifest de entrenamiento documenta los niveles de profundidad (de 2 a 128) y las 12 familias de plantillas, lo que permite estudiar cómo la política maneja la dificultad creciente del currículum.
- Despliegue en Rust con Candle: al estar implementado con `candle-core`, el modelo puede integrarse en aplicaciones Rust existentes que ya utilicen el motor de LEMMA, sin dependencias de Python ni servidores externos.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en el `model-index` de la model card, correspondientes al subconjunto de 89 problemas del LEMMA Long-Horizon Symbolic Rewriting Benchmark:

| Métrica | Valor |
|---|---|
| Tasa de resolución, decodificación voraz (89 problemas) | 100% (1,0) |
| Tasa de resolución, MCTS solo política a 400 simulaciones (89 problemas) | 97,75% (0,9775) |
| Tasa de resolución, MCTS política-valor a 400 simulaciones (89 problemas) | 68,54% (0,6854) |

Estos valores están marcados como no verificados (`verified: false`) en el `model-index`. No se han publicado resultados de benchmarks comparativos con otros modelos, ya que este modelo no es un modelo de lenguaje generalista y su evaluación se limita al benchmark interno de LEMMA. No se dispone de mediciones de rendimiento (latencia o throughput) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en F32 ocupan aproximadamente 9 MB (2.272.318 parámetros × 4 bytes), por lo que la inferencia requiere menos de 100 MB de VRAM, incluso con activaciones para la secuencia máxima de 1.088 tokens.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA 12.4.1 o superior. El entrenamiento se realizó con una NVIDIA A10G de 24 GB vía Modal, pero la inferencia puede ejecutarse en hardware mucho más modesto.
- Compatibilidad con GPU de consumo: sí, el modelo es extremadamente ligero y puede ejecutarse en GPUs de consumo como RTX 3060 o RTX 4090, e incluso en CPU para muchas tareas.
- Opciones de despliegue: el modelo está implementado en Rust con `candle-core` 0.8.4, por lo que el despliegue natural es mediante la biblioteca Candle en un proyecto Rust. No se contempla integración con vLLM, Ollama, TGI u otros servidores de modelos de lenguaje porque no es un LLM.
- Latencia y rendimiento: no se han publicado mediciones en la información disponible. Dado el tamaño del modelo, la latencia debería ser muy baja, pero no hay datos concretos.

## Comparativa con modelos similares

No se han encontrado modelos externos comparables en la información proporcionada. LEMMA v3 no es un modelo de lenguaje generalista, por lo que carece de alternativas directas en términos de arquitectura, tarea y espacio de acciones. La única comparativa posible es interna, entre las variantes de la familia LEMMA documentadas en la model card:

| Variante | Tasa de recuperación fuera de ruta | Notas |
|---|---|---|
| v1 | 13,4% | Incluye datos de recuperación fuera de ruta |
| v2 | 3,5% | Ablación parcial de recuperación |
| v3 | 0% | Checkpoint publicado; elimina por completo los datos de recuperación |

No se dispone de benchmarks públicos para v1 y v2 en la información consultada, por lo que la comparativa se limita a la variable de datos de recuperación.

## Limitaciones y advertencias

- No es un modelo generalista: el autor declara explícitamente que no es un razonador matemático general, ni un demostrador de teoremas, ni un modelo de lenguaje. No lee problemas en lenguaje natural y no genera matemáticas por sí mismo.
- Solo puntúa reglas: cada reescritura debe ser producida por el motor de reglas de LEMMA y aceptada por el verificador con tipos de evidencia; el modelo no puede emitir acciones fuera de ese espacio.
- Alcance restringido: su competencia medida se limita a un benchmark interno de 89 problemas. No hay evidencia de generalización a otros dominios simbólicos.
- Riesgo de puntuaciones incorrectas: el modelo puede puntuar reglas que no conduzcan a la solución; la corrección final depende del verificador externo. No es un alucinador en el sentido de los LLM, pero su salida no es verificada por sí misma.
- Selección del checkpoint: los pesos publicados son de la última época ejecutada (época 6 de 7), no de la época con mejor validación. El mejor valor de validación registrado (top-1 = 1,0000) corresponde a la época 0 y no es una propiedad de estos pesos.
- Métricas no verificadas: los resultados del benchmark están marcados como no verificados (`verified: false`) en el `model-index`.
- Dataset interno: el entrenamiento se realizó exclusivamente con datos sintéticos generados por plantillas de LEMMA, lo que limita la diversidad del dominio y puede no reflejar distribuciones reales de expresiones matemáticas.
- Control de fugas incompleto: el README de la model card menciona control de fugas (leakage control), pero el texto relevante no está disponible en la información proporcionada, por lo que no se puede evaluar completamente el riesgo de fugas de datos.
- Licencia MPL-2.0: permite uso comercial y modificación, pero es una licencia copyleft débil; se recomienda revisar el texto completo para casos de redistribución.

## Enlaces

- HuggingFace: https://huggingface.co/BlackdromeAILabs/lemma-v3-policy
- Repositorio de código y entorno de ejecución: https://github.com/blackdromeai-labs/LEMMA
- Dataset del benchmark: https://huggingface.co/datasets/BlackdromeAILabs/lemma-long-horizon-rewrite-benchmark
- Paper: "LEMMA: Learned Guidance for Evidence-Carrying Long-Horizon Symbolic Rewriting" (se cita el título en la model card; no se ha proporcionado el enlace en la información disponible)
