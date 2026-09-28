# deepquillapp/trait-verifier

## Resumen

DeepQuill trait verifier es un modelo de clasificación de texto desarrollado por deepquillapp, un fine-tune del encoder convaiinnovations/laya (ModernBERT-large más una cabeza de decisión tipada) que se distribuye en formato ONNX para ejecutarse con ONNX Runtime. Su función es verificar afirmaciones sobre rasgos de personajes de ficción extraídas automáticamente por un extractor local: para cada claim compuesto por un personaje objetivo, un par `campo = valor`, la cita y el pasaje de origen, el modelo responde a cuatro preguntas binarias (si la afirmación trata sobre ese personaje, si describe un atributo duradero y no un estado momentáneo, si es literal y no figurada, y si está afirmada por la narración).

El modelo resuelve un problema de precisión en pipelines de extracción: el claim solo se conserva si las cuatro respuestas son afirmativas, lo que lo convierte en un filtro de validación colocado después del extractor. Es relevante ahora por dos motivos concretos: funciona como alternativa compacta y ejecutable en local a un verificador basado en un LLM generativo, y su calibración está documentada sobre conjuntos de evaluación separados por libros y personajes.

La evaluación publicada por el autor usa la métrica keep-F1. Frente a un verificador con Qwen3-4B y frente a no usar verificador alguno, este modelo obtiene 0,75 sobre 524 claims de novelas de dominio público de los años veinte y 0,88 sobre 157 claims de manuscritos contemporáneos, frente a 0,32 y 0,24 del verificador con LLM y 0,45 del escenario sin verificador. El repositorio ocupa 0,6 GB e incluye únicamente el peso ONNX cuantizado, el tokenizador y un fichero de configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-large (fine-tune de convaiinnovations/laya) con cabeza de decisión tipada |
| Parametros totales | No disponible (la model card indica que el encoder base es ModernBERT-large, sin cifra de parámetros) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (el fichero `verifier_config.json` define límites de secuencia, pero el valor no se publica) |
| Tipos de cuantizacion | Weight-only 8 bits (MatMulNBits); las activaciones se ejecutan en fp32 |
| Idiomas soportados | No disponible. Los datos de entrenamiento son novelas en dominio público de EE. UU. (1894-1930) y pasajes sintéticos contemporáneos |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.w8.onnx`), más `tokenizer.json` y `verifier_config.json` |
| Libreria de inferencia | onnxruntime |
| Pipeline | text-classification |
| Tamano del repositorio | 0,6 GB |
| Modelo base | convaiinnovations/laya |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura parte de Laya, descrito en la propia model card como un encoder ModernBERT-large con una cabeza de decisión tipada. Sobre esa base, el fine-tune produce cuatro decisiones binarias por claim: `aboutTarget`, `lasting`, `literal` y `asserted`. La salida es una clasificación, no una generación de texto, y la política de agregación es conjuntiva: el claim se mantiene solo si las cuatro preguntas pasan. El artefacto distribuido es un peso ONNX cuantizado en 8 bits con esquema MatMulNBits, con activaciones en fp32 para que el resultado de un claim no dependa del lote con el que se procesa, según declara el autor.

Los datos de entrenamiento son íntegramente públicos: 3.760 claims etiquetados procedentes de salidas reales del extractor sobre novelas estadounidenses de dominio público publicadas entre 1894 y 1930 (Project Gutenberg), más pasajes contemporáneos sintéticos escritos específicamente para este propósito. El autor afirma explícitamente que el modelo nunca se entrenó con manuscritos de usuarios. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de ajuste por preferencias (RLHF, DPO) o decodificación especulativa.

## Capacidades

- Clasificación binaria de cuatro preguntas por claim: pertenencia al personaje objetivo, carácter duradero del atributo, literalidad frente a lenguaje figurado y afirmación por parte de la narración.
- Verificación de atributos de personajes de ficción a partir de un claim, su cita textual y el pasaje de origen.
- Funcionamiento determinista respecto al lote: al ejecutar las activaciones en fp32, el resultado de un claim no varía según con qué otros claims se agrupe.
- Integración como etapa de filtrado posterior a un extractor de rasgos, con política de conservación conjuntiva.
- Ejecución mediante ONNX Runtime, lo que permite despliegue en CPU y en aceleradores compatibles con dicho runtime.
- No dispone de generación de texto, razonamiento multi-paso, tool calling ni capacidades de agente según la información disponible.
- No se documentan capacidades multilingües, de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Filtrado de extracción de atributos en análisis literario: colocado detrás de un extractor de rasgos, el verificador descarta los claims que no pasan las cuatro preguntas, lo que en la evaluación publicada eleva el keep-F1 de 0,45 (sin verificador) a 0,75 sobre novelas de los años veinte.
- Curación de bases de conocimiento de personajes: para alimentar fichas de personajes en herramientas de escritura o wikis, el modelo permite validar automáticamente que cada atributo sea duradero y esté afirmado por el texto antes de persistirlo.
- Coherencia de personajes en asistentes de escritura y rol conversacional: la pregunta `lasting` separa atributos permanentes de estados momentáneos, lo que evita que un estado pasajero de un personaje se consolide como rasgo estable en la memoria del sistema.
- Verificación de anotaciones humanas o crowdsourced: el modelo actúa como segunda opinión sobre etiquetas de atributos de personajes, detectando anotaciones figuradas o atribuidas al personaje equivocado.
- Control de continuidad narrativa en series largas: al validar claims contra pasajes concretos, permite detectar contradicciones en la descripción de un personaje a lo largo de una obra o saga.
- Procesamiento por lotes de corpus de dominio público: con un peso ONNX de 8 bits y un repositorio de 0,6 GB, el modelo puede ejecutarse sobre colecciones completas tipo Project Gutenberg sin depender de GPU dedicada.
- Investigación sobre verificación tipada de decisiones: sirve como punto de comparación reproducible frente a verificadores basados en LLM generativos, con una diferencia de keep-F1 documentada de 0,43 puntos en el conjunto de 1920 y de 0,64 puntos en el de manuscritos contemporáneos.

## Benchmarks y rendimiento

Métrica empleada: keep-F1. Los conjuntos de evaluación son held-out y no comparten libros ni personajes con los datos de entrenamiento, según el autor.

| Conjunto de test | Este modelo | Verificador con Qwen3-4B | Sin verificador |
|---|---|---|---|
| Claims de dominio público de los años veinte (524) | 0,75 | 0,32 | 0,45 |
| Claims de manuscritos contemporáneos (157) | 0,88 | 0,24 | 0,45 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. El repositorio completo ocupa 0,6 GB y el peso está cuantizado a 8 bits, por lo que el peso del modelo queda por debajo de esa cifra; el consumo total depende de la longitud de secuencia y del tamaño de lote, que no se documentan.
- GPU recomendadas: no disponibles. Al usar ONNX Runtime, el modelo puede ejecutarse en CPU y en las GPU soportadas por los execution providers de ONNX Runtime (por ejemplo CUDA o TensorRT), pero el autor no publica una lista de hardware validado.
- GPU de consumo: por el tamaño del repositorio (0,6 GB en 8 bits), es razonable esperar que quepa en GPU de consumo con 4 GB o más de VRAM, si bien se trata de una estimación derivada del tamaño del fichero y no de un dato publicado.
- Opciones de despliegue: ONNX Runtime es la librería declarada (`library_name: onnxruntime`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; estos motores están orientados a modelos generativos y no constan como soportados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Keep-F1 (1920s / contemporaneo) | Licencia | Formato |
|---|---|---|---|---|---|
| deepquillapp/trait-verifier | No disponible (encoder ModernBERT-large) | No disponible | 0,75 / 0,88 | Apache-2.0 | ONNX 8 bits |
| Verificador con Qwen3-4B | 4B (segun denominacion) | No disponible | 0,32 / 0,24 | No disponible | No disponible |
| Sin verificador (extractor solo) | No aplica | No aplica | 0,45 / 0,45 | No aplica | No aplica |
| convaiinnovations/laya (modelo base) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a los elementos citados en la model card. No se dispone de datos de contexto, licencia ni formato de pesos de las alternativas, ni de modelos comparables de terceros con la misma tarea de verificación tipada.

## Limitaciones y advertencias

- Sesgo de dominio y de registro: el entrenamiento se apoya en 3.760 claims de novelas estadounidenses de dominio público de 1894-1930 (Project Gutenberg) más pasajes sintéticos contemporáneos, por lo que el comportamiento sobre otros géneros, épocas o estilos narrativos no está validado.
- Idiomas: la model card no declara idiomas soportados. Los datos de entrenamiento son en inglés, de modo que el rendimiento en castellano u otras lenguas no está documentado y no debería asumirse.
- Riesgo de error de clasificación: el keep-F1 es 0,75 en el conjunto de 1920 y 0,88 en el contemporáneo, lo que implica falsos positivos y falsos negativos. Al exigir que las cuatro preguntas pasen, un fallo en cualquiera de ellas descarta el claim.
- No es un modelo generativo: no produce texto ni razonamiento explicable, solo cuatro etiquetas binarias, lo que dificulta auditar por qué un claim se ha descartado.
- Ausencia de datos sobre el contexto máximo y sobre calibración fuera de los conjuntos de evaluación publicados; la temperatura de calibración está en `verifier_config.json` pero su valor no se reproduce en la model card.
- Licencia Apache-2.0: permite uso comercial y modificación con las obligaciones habituales de atribución y conservación del aviso de licencia. La licencia del modelo base Laya no consta en la información disponible y conviene verificarla antes de un despliegue en producción.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, por lo que no hay validación independiente de los resultados más allá de la evaluación publicada por el propio autor.
- Dependencia de un extractor previo: el modelo verifica claims ya generados; su calidad está acotada por la del extractor que los produzca y por el formato exacto de claim, cita y pasaje definido en `verifier_config.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepquillapp/trait-verifier
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Sitio del autor: https://deepquill.app
