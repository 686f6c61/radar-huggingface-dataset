# nautilus-compass/nacre-judge-v1

## Resumen

nacre-judge-v1 es un adaptador LoRA de tipo juez (judge/verifier) publicado por la organización nautilus-compass sobre el modelo base Qwen/Qwen3-1.7B. No es un modelo generativo de propósito general, sino un clasificador de verificación que emite un veredicto en tres estados: pass, fail e insufficient_evidence. Su función declarada es actuar como "判分器" (evaluador) del lado de lectura independiente del mecanismo NACRE, es decir, comprobar si una respuesta o afirmación satisface un criterio pre-registrado.

El modelo base aporta 1.700 millones de parámetros en una arquitectura transformer decoder-only densa, y el adaptador añade un conjunto reducido de pesos entrenados específicamente para la tarea de juicio. La model card declara una precisión binaria J1 del 88,51% en evaluación de producción, con un error de calibración esperado (ECE) de 0,072, sobre un conjunto de 291 preguntas de la prueba PRECOR B/C.

Su relevancia práctica está en el ámbito del "LLM-as-a-judge" y la verificación automática: ofrece una alternativa pequeña (1,7B) a jueces mucho mayores, con una disciplina de despliegue explícita que restringe el uso a bf16/fp16 porque la cuantización int8 e int4 degrada la consistencia de los veredictos. La licencia es Apache-2.0, aunque el repositorio no contiene documentación de entrenamiento ni resultados de benchmarks públicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3-1.7B) con adaptador LoRA para clasificación de veredictos |
| Parámetros totales | 1.700 millones en el modelo base; número de parámetros del adaptador LoRA no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (heredada del modelo base Qwen3-1.7B, no especificada) |
| Tipos de cuantización | Solo bf16/fp16 autorizados por el autor; int8 e int4 medidos y desaconsejados (consistencia 0,9828 y 0,9416 respectivamente frente a bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

La ficha técnica describe un adaptador LoRA entrenado sobre Qwen/Qwen3-1.7B, un transformer decoder-only denso. El adaptador no modifica la arquitectura del modelo base: añade matrices de bajo rango que se activan durante la inferencia para producir la clasificación en tres estados. El identificador corto del adaptador declarado es `dbcbab6fd1ff5821`, y el criterio de entrenamiento se describe como pre-registrado (P2_JUDGE_TRAINING_PREREG), lo que sugiere un protocolo de evaluación fijado antes del entrenamiento para evitar ajustes post hoc.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. La model card tampoco detalla la innovación técnica concreta del adaptador más allá de la tarea objetivo. La evidencia empírica aportada se limita a dos experimentos: una evaluación de producción con precisión binaria del 88,51% y ECE de 0,072, y un estudio de robustez a la cuantización sobre 291 preguntas (PRECOR B/C, fechado el 7 de octubre de 2026), donde se midió la consistencia de los veredictos frente a la referencia bf16: fp16 mantiene consistencia 1,0000, int8 baja a 0,9828 y int4 a 0,9416.

## Capacidades

- Emisión de veredictos en tres estados: pass, fail e insufficient_evidence, con abstención explícita cuando la evidencia es insuficiente.
- Juicio binario (J1) con precisión del 88,51% según la evaluación de producción declarada por el autor.
- Puntuaciones calibradas: ECE de 0,072 sobre la misma evaluación, lo que permite usar las probabilidades asociadas al veredicto con un margen de confianza acotado.
- Verificación frente a criterios pre-registrados, planteada para protocolos de evaluación reproducibles.
- Compatibilidad con despliegue en bf16/fp16 sin pérdida de consistencia respecto a la referencia (1,0000 entre fp16 y bf16).
- Soporte de tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas (el modelo está orientado a la clasificación, no a la generación abierta).
- Capacidades multilingües: no documentadas; la model card está redactada íntegramente en chino.
- Modo "thinking" explícito, visión o audio: no documentados.

## Casos de uso

- Evaluación automática de respuestas de LLM (LLM-as-a-judge): el adaptador puede puntuar las salidas de otro modelo contra un criterio fijo y devolver pass, fail o insufficient_evidence, lo que permite construir suites de evaluación internas sin recurrir a un juez de decenas de miles de millones de parámetros.
- Filtrado de datos para pipelines de ajuste: durante la curación de datasets de instrucciones, el juez puede descartar pares que no cumplen el criterio pre-registrado y marcar como dudosos los que requieren revisión, reduciendo el coste frente a una revisión humana completa.
- Verificación en producción con derivación a humano: gracias al estado insufficient_evidence, es adecuado como primera capa de control de calidad que solo escala a un operador los casos ambiguos, en lugar de forzar una decisión binaria arriesgada.
- Auditoría de conformidad de respuestas: en dominios regulados, el modelo puede comprobar si una respuesta generada satisface una rúbrica fijada de antemano y dejar trazabilidad del veredicto, apoyándose en el protocolo de criterio pre-registrado.
- Detección de alucinaciones en sistemas RAG: colocando el juez al final de la cadena, puede marcar como fail o insufficient_evidence aquellas respuestas que no se sustentan en el contexto recuperado, actuando como filtro antes de mostrar la respuesta al usuario.
- Evaluación comparativa de versiones de un modelo: al ser un clasificador pequeño y determinista, permite repetir la misma batería de 291 preguntas u otra batería fija tras cada cambio de prompt o de pesos, y comparar tasas de pass/fail con una métrica estable.
- Monitorización de calidad en CI/CD de prompts: el juez puede integrarse como paso de un pipeline que bloquee un despliegue si la tasa de fail supera un umbral definido, aprovechando su bajo coste de inferencia.
- Segmentación de tráfico para enrutado: clasificar entradas como válidas, inválidas o dudosas antes de enviarlas a un modelo mayor, reservando el modelo grande para los casos que el juez no resuelve.

## Benchmarks y rendimiento

La información proporcionada no incluye resultados de benchmarks públicos (MMLU, HumanEval, GSM8K ni similares). El único dato de rendimiento disponible es la evaluación interna declarada por el autor:

| Métrica | Valor | Contexto |
|---|---|---|
| Precisión binaria J1 | 88,51% | Evaluación de producción declarada por el autor |
| ECE (error de calibración esperado) | 0,072 | Misma evaluación de producción |
| Consistencia fp16 frente a bf16 | 1,0000 | Prueba PRECOR B/C, 291 preguntas, 2026-10-07 |
| Consistencia int8 frente a bf16 | 0,9828 (FAIL) | Prueba PRECOR B/C, 291 preguntas, 2026-10-07 |
| Consistencia int4 frente a bf16 | 0,9416 (FAIL, desaconsejado) | Prueba PRECOR B/C, 291 preguntas, 2026-10-07 |

No se han publicado resultados de benchmarks comparables con otros jueces en la información disponible, ni se detalla la composición del conjunto de evaluación de producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16/fp16, el modelo base de 1,7B ocupa en torno a 3,4 GB, más el adaptador LoRA (tamaño no disponible) y el KV cache. En la práctica, un presupuesto de 5-6 GB es suficiente para contextos moderados; el KV cache crece de forma lineal con la longitud de contexto (estimación, no dato publicado por el autor).
- Cuantización: el autor restringe el despliegue a bf16/fp16. int8 e int4 quedan explícitamente desaconsejados por degradar la consistencia de los veredictos, lo que descarta los flujos habituales de GGUF de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en bf16/fp16; una RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o RTX 4090 son suficientes. En centro de datos, A100, H100 o L40S ofrecen margen de sobra y permiten lotes grandes.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en GPUs de consumo en bf16/fp16. No se recomienda ejecutarlo en iGPU o GPUs con menos de 8 GB si se necesita contexto largo.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador LoRA, vLLM (con soporte de adaptadores LoRA), TGI y, en general, cualquier servidor que permita cargar adaptadores sobre el modelo base en precisión completa o media. llama.cpp u Ollama quedan limitados por la prohibición de cuantización int4/int8.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 1,7B, la latencia esperada es baja en GPU moderna, pero el autor no publica cifras de throughput ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks para establecer una comparación cuantitativa con otros jueces. La tabla recoge únicamente los atributos confirmados en la información proporcionada:

| Modelo | Parámetros | Contexto | Licencia | Tipo | Datos comparativos |
|---|---|---|---|---|---|
| nacre-judge-v1 | 1,7B (base) + LoRA | no disponible | Apache-2.0 | Juez especializado (3 estados) | Precisión binaria 88,51%, ECE 0,072 |
| Qwen/Qwen3-1.7B | 1,7B | no disponible | Apache-2.0 | Modelo base generativo | No es un juez; no hay métricas de juicio comparables |
| Jueces públicos de la misma categoría (Prometheus 2, CompassJudger, JudgeLM, etc.) | no disponible | no disponible | no disponible | Jueces generalistas | No disponible: la búsqueda no aportó datos verificables |

Categorías de comparación razonables serían los jueces basados en modelos de 1B-8B entrenados para evaluación, pero la información disponible no permite contrastar cifras sin inventarlas.

## Limitaciones y advertencias

- Adopción nula y repositorio vacío en el momento de la consulta: 0 descargas, 0 likes y un tamaño de repositorio de 0,0 GB, lo que sugiere un artefacto recién publicado o incompleto. Conviene verificar que los pesos del adaptador están efectivamente disponibles antes de integrarlo.
- Restricción de cuantización severa: el autor prohíbe int4 e int8. Cualquier despliegue que dependa de GGUF cuantizado, Ollama o hardware con poca VRAM queda fuera del régimen validado, ya que en int8 e int4 los veredictos divergen de la referencia en un 1,72% y un 5,84% de los casos respectivamente.
- Tasa de error no despreciable: una precisión binaria del 88,51% implica que aproximadamente una de cada nueve decisiones es incorrecta; no debe usarse como árbitro único en flujos con consecuencias altas.
- Calibración moderada: un ECE de 0,072 indica desviación entre probabilidad declarada y acierto real; las puntuaciones no deben interpretarse como probabilidades exactas sin recalibración en el dominio de destino.
- Evidencia empírica muy limitada: el único experimento reportado cubre 291 preguntas y la evaluación de precisión es una cifra agregada sin desglose por clase, dominio ni idioma. No hay validación externa ni replicación independiente.
- Sesgos conocidos: no documentados. Al derivar de Qwen3-1.7B, el juez puede heredar los sesgos del modelo base y del corpus con el que se entrenó el adaptador, pero no hay análisis publicado.
- Riesgo de alucinación: aunque la tarea sea clasificatoria y no generativa, el modelo puede emitir un veredicto pass o fail sin fundamento real cuando la evidencia es débil; el estado insufficient_evidence mitiga parcialmente este riesgo, pero no lo elimina.
- Cobertura de idiomas desconocida: la model card está en chino y no se declara ningún idioma. No hay garantía de comportamiento correcto en castellano u otras lenguas.
- Procedencia del entrenamiento opaca: no se documentan dataset, criterios de anotación ni proceso de RLHF/DPO, lo que dificulta la auditoría. La licencia Apache-2.0 permite uso comercial, pero no se puede verificar la licencia de los datos de entrenamiento del adaptador.
- Documentación de referencia externa: la model card remite a `docs/metering/PRECOR_BC_VERDICT_20261007.md` en el repositorio principal de nautilus-compass, no incluido en el repositorio de HuggingFace.
- Metadatos con fechas futuras (creación y actualización en octubre de 2026), lo que puede indicar inconsistencias en el registro o entornos de prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nautilus-compass/nacre-judge-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Documento de veredictos PRECOR B/C (referenciado, no enlazado en la model card): docs/metering/PRECOR_BC_VERDICT_20261007.md en el repositorio principal de nautilus-compass
- Paper, blog, repositorio o demo adicionales: no disponible. La búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados corresponden a la serie de televisión Nautilus, al Nautilus de Julio Verne y al molusco del mismo nombre).
