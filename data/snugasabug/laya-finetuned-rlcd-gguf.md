# Snugasabug/laya-finetuned-rlcd-GGUF

## Resumen

Laya (fine-tuned) — GGUF es la exportación en formato GGUF del modelo de decisión `Snugasabug/laya-finetuned-rlcd`, un ajuste fino sobre el modelo base `convaiinnovations/laya`. Lo desarrolla el usuario Snugasabug y se publica bajo licencia Apache 2.0. No es un modelo generativo de texto: es un modelo de decisión no autorregresivo que, dada una descripción de estado y un conjunto de preguntas tipadas, devuelve una probabilidad para cada opción en una única pasada hacia delante.

Técnicamente, combina un encoder `ModernBertForMaskedLM` —concretamente `jhu-clsp/mmBERT-base`, de 768 dimensiones— con dos capas de cabeza de decisión propias de laya. El resultado es un clasificador de 321.710.593 parámetros, empaquetado en dos ficheros GGUF (bf16 y Q8_0) y pensado para servirse mediante la API `/v1/systemone` de `llama.app`.

Su relevancia es de nicho: encaja en arquitecturas de tipo «system one», donde se necesita una evaluación rápida y probabilística de alternativas (elección, puntuación o abstención) en lugar de una generación autoregresiva completa. El ajuste fino se realizó con RLCD y las métricas declaradas son de acuerdo con el profesor, no contra verdad humana, lo que conviene tener presente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decision no autorregresivo: encoder `ModernBertForMaskedLM` (`jhu-clsp/mmBERT-base`, 768 dim.) + 2 capas de cabeza de decision laya |
| Parametros totales | 321.710.593 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (sin cuantizar), Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`laya-finetuned-rlcd-bf16.gguf`, `laya-finetuned-rlcd-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo es un clasificador no autorregresivo. La pila se compone de un encoder basado en ModernBERT (`jhu-clsp/mmBERT-base`, con representaciones de 768 dimensiones) y dos capas adicionales que forman la cabeza de decisión de laya. En lugar de generar texto token a token, procesa un estado y una lista de preguntas tipadas —`choice` (elección), `score` (puntuación) y `noul` (abstención)— y emite una probabilidad por cada opción en una sola pasada hacia delante. Este diseño es coherente con la etiqueta `system-one`: primar la rapidez de evaluación sobre la generación abierta.

El ajuste fino se realizó con RLCD sobre el checkpoint base `convaiinnovations/laya`. La conversión a GGUF se hizo con el conversor oficial de modelos de decisión de ggml-org (PR #29818 de llama.cpp), partiendo del checkpoint en formato HuggingFace `Snugasabug/laya-finetuned-rlcd`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el detalle del proceso de RLCD. La model card advierte explícitamente que las cifras de precisión del ajuste fino son de acuerdo con el profesor (teacher-agreement, propias de RLCD), evaluadas sobre un subconjunto de 4K ejemplos, y que no están medidas contra verdad humana de referencia.

## Capacidades

- Clasificación y decisión probabilística: devuelve una probabilidad por opción en una única pasada hacia delante, sin generación autoregresiva.
- Preguntas tipadas: soporta tres tipos de consulta —`choice`, `score` y `noul` (abstención)— que permiten tanto seleccionar alternativas como puntuarlas o declinar responder.
- API de decisión: se sirve mediante el endpoint `/v1/systemone` de `llama.app` (`llama serve -hf Snugasabug/laya-finetuned-rlcd-GGUF`).
- Extracción de características: entre las etiquetas del repositorio figura `feature-extraction`, lo que sugiere uso del encoder subyacente para representaciones.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible`.
- Generación de texto: no disponible (el modelo no es generativo).
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o capacidades de agente: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Visión, audio o modo «thinking»: no disponible.

## Casos de uso

- Enrutado de decisiones en agentes: dado un estado del entorno, el modelo puntúa cada acción candidata y permite a un agente externo elegir la de mayor probabilidad con una sola inferencia, reduciendo la latencia frente a un modelo generativo que tuviera que razonar la acción paso a paso.
- Filtrado previo en pipelines generativos: actuar como «system one» que descarta o prioriza opciones antes de invocar un modelo mayor, aprovechando su coste computacional reducido (321,7 M de parámetros).
- Clasificación de intenciones en diálogo: usando preguntas de tipo `choice` sobre el estado de la conversación para etiquetar la intención del usuario en una sola pasada.
- Puntuación de alternativas en generación asistida: emplear preguntas de tipo `score` para ordenar varias respuestas candidatas producidas por otro modelo y seleccionar la mejor según la probabilidad asignada.
- Abstención controlada en sistemas críticos: la pregunta de tipo `noul` permite que el sistema decline decidir cuando ninguna opción supera un umbral, útil en flujos donde un error tiene coste alto.
- Extracción de características para downstream: reutilizar el encoder mmBERT-base para obtener representaciones de 768 dimensiones que alimenten clasificadores o sistemas de recuperación propios.
- Despliegue ligero en local: al publicarse en GGUF con variante Q8_0, puede ejecutarse en equipos modestos con `llama.app`, lo que facilita prototipado y pruebas sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única referencia de rendimiento que aparece en la model card es cualitativa y con reservas: la precisión del ajuste fino se basa en acuerdo con el profesor (RLCD), medida sobre un subconjunto de 4K ejemplos, y no está contrastada con verdad humana. No se dispone de cifras concretas de exactitud, F1 ni latencia.

## Requisitos de hardware

- VRAM estimada (cálculo a partir de 321,7 M de parámetros, sin contar overhead del runtime): en bf16, aproximadamente 0,64 GB; en Q8_0, aproximadamente 0,32 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre es suficiente para el modelo en Q8_0; no se requieren aceleradores de gama alta. No se dispone de recomendaciones oficiales del autor.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: `llama.app` mediante `llama serve -hf Snugasabug/laya-finetuned-rlcd-GGUF` (método documentado). Otras opciones como llama.cpp directo, vLLM, TGI u Ollama no están documentadas para este modelo en la información disponible, y su compatibilidad dependería del soporte del formato de modelo de decisión.
- Latencia y throughput: no disponible. Al ser un modelo no autorregresivo de una sola pasada, cabe esperar latencias bajas, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos sobre modelos comparables de la misma categoría (modelos de decisión «system one» en GGUF) en la información proporcionada. La única comparación posible es con su propia línea de ascendencia, y también aquí faltan especificaciones del modelo base.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Snugasabug/laya-finetuned-rlcd-GGUF | 321,7 M | no disponible | Apache 2.0 | GGUF (bf16, Q8_0) | Ajuste fino RLCD convertido a GGUF |
| Snugasabug/laya-finetuned-rlcd | no disponible | no disponible | Apache 2.0 | safetensors (checkpoint HF) | Checkpoint origen de la conversion |
| convaiinnovations/laya | no disponible | no disponible | no disponible | no disponible | Modelo base; encoder mmBERT-base + cabeza laya |

Comparativas con alternativas externas: no disponible.

## Limitaciones y advertencias

- Las métricas de precisión del ajuste fino proceden de acuerdo con el profesor (RLCD) sobre un subconjunto de 4K ejemplos y no están medidas contra verdad humana; no deben tomarse como exactitud real en producción.
- Es un modelo de decisión, no generativo: no produce texto libre, por lo que no sirve para tareas de generación, resumen o diálogo directo.
- No se declaran idiomas soportados, de modo que se desconoce su cobertura multilingüe real y su comportamiento fuera del idioma o idiomas de entrenamiento.
- No se especifica la longitud de contexto, lo que impide planificar con garantías entradas largas.
- Riesgo de sesgo y de alucinación: no evaluado ni documentado en la información disponible; al emitir probabilidades sobre opciones, un mal calibrado puede inducir decisiones erróneas con apariencia de confianza.
- Licencia Apache 2.0 en el repositorio, que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base `convaiinnovations/laya`, para el que no se indica licencia en la información disponible.
- Dependencia de la API `/v1/systemone` y de `llama.app`: el formato de petición y respuesta es específico de este tipo de modelo, lo que limita la portabilidad a otros servidores de inferencia.
- Repositorio con 0 descargas y 0 «likes» en el momento de la consulta, y creado y actualizado el mismo día (2026-10-02): trazabilidad y mantenimiento no contrastados.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/Snugasabug/laya-finetuned-rlcd-GGUF
- Checkpoint origen en HuggingFace: https://huggingface.co/Snugasabug/laya-finetuned-rlcd
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Conversor de modelos de decisión de llama.cpp (PR #29818): https://github.com/ggml-org/llama.cpp/pull/29818
- Encoder mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Herramienta de servicio: https://llama.app
