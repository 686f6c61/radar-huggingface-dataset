# ibrahimmlk/trialsieve-qwen2.5-1.5b-lora

## Resumen

Trialsieve es un adaptador LoRA sobre Qwen2.5-1.5B-Instruct desarrollado por Muhammad Ibrahim Malik (FAST-NUCES Islamabad) como prototipo de investigacion educativa. Resuelve una tarea muy concreta dentro del cribado de ensayos clinicos: dado un historial clinico de paciente (con frases numeradas), un tipo de criterio (inclusion o exclusion) y el texto del criterio, el modelo devuelve una etiqueta de elegibilidad y los identificadores de las frases del historial que la justifican, en formato JSON. Es, por tanto, un modelo de extraccion de evidencia y clasificacion a nivel de criterio, no un asistente clinico general.

La relevancia tecnica esta en el enfoque: un modelo pequeno (1.5B parametros) con un adaptador de solo 18.5M parametros entrenables (1.18% del total) es capaz de pasar de una accuracy de 0.325 en el modelo base a 0.743 en el split de test, manteniendo cuatro clases por tipo de criterio (incluida la distincion entre "no hay informacion suficiente" y "no aplicable"). Esto demuestra que el ajuste fino con LoRA sobre datos expertos es viable en hardware muy modesto (una sola T4 durante 15.8 minutos).

El modelo esta pensado como pieza de un pipeline de cribado (existe una aplicacion web en el repositorio del autor) y como caso de estudio de decodificacion especulativa, para el que el autor publica un modelo draft de 0.5B. La licencia es Apache 2.0, pero el propio autor lo marca explicitamente como prototipo no validado para uso clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 1.5B (modelo base) + 18.5M entrenables en el adaptador (1.18%) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens en entrenamiento (maximo observado 650 tokens); contexto nativo de Qwen2.5-1.5B-Instruct: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; se puede fusionar con el base y cuantizar posteriormente) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen2.5-1.5B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.5B parametros. El LoRA tiene rango 16, alpha 32, dropout 0.05 y se inserta en las proyecciones q, k, v, o, gate, up y down, lo que suma 18.5M parametros entrenables. El objetivo es entropia cruzada de causal-LM calculada unicamente sobre los tokens de la respuesta JSON (los tokens del prompt estan enmascarados), de modo que el modelo aprende a emitir la etiqueta y los IDs de evidencia sin que se le penalice por el formato de entrada.

Los datos provienen de ncbi/TrialGPT-Criterion-Annotations, usando exclusivamente las etiquetas y frases de evidencia anotadas por expertos (las columnas generadas con GPT-4 nunca se emplean). El split agrupa por paciente: 37/8/8 pacientes (603/206/206 criterios) con semilla 42 y manifiesto publico. El entrenamiento uso AdamW con lr 2e-4, schedule coseno, 5% de warm-up, 3 epocas, micro-batch 2 con acumulacion de gradiente 8 (batch efectivo 16, 114 pasos), fp16 con gradient checkpointing y semilla 42. Se selecciono el checkpoint del paso 80 por perdida de validacion (0.113). Todo el entrenamiento se ejecuto en una unica NVIDIA T4 (Kaggle) en 15.8 minutos, sin truncar ninguna entrada. Como innovacion practica, el autor publica un modelo draft de 0.5B (trialsieve-qwen2.5-0.5b-draft-lora) para decodificacion especulativa.

## Capacidades

- Clasificacion de elegibilidad a nivel de criterio: emite etiquetas especificas por tipo. Para inclusion: `included`, `not included`, `not enough information`, `not applicable`. Para exclusion: `excluded`, `not excluded`, `not enough information`, `not applicable`.
- Extraccion de evidencia: devuelve los IDs de las frases numeradas del historial que sustentan la decision, en un JSON estructurado (`{"label": ..., "evidence_sentence_ids": [...]}`).
- Distincion explicita entre informacion ausente y criterio no aplicable, sin colapsar ambas clases en un si/no.
- Generacion de texto conversacional (heredada del modelo base Qwen2.5-1.5B-Instruct), aunque el ajuste esta orientado a la tarea de cribado.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modelo esta disenado para una unica llamada de clasificacion por criterio.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Precribado de criterios de inclusion en ensayos clinicos: el modelo procesa cada criterio de forma independiente y devuelve la etiqueta con las frases del historial que la justifican, lo que permite a un coordinador revisar rapidamente cientos de criterios por paciente y centrar su atencion en los casos dudosos.
- Precribado de criterios de exclusion: identifica si un paciente cumple un criterio de exclusion (por ejemplo, infarto de miocardio en los ultimos 6 meses) y cita la frase relevante, aunque con la advertencia de baja recall de evidencia en exclusiones (0.09).
- Extraccion de evidencia para auditoria: el JSON de salida con IDs de frases permite trazar cada decision hasta el texto original del historial, requisito habitual en flujos de validacion clinica y en revisiones regulatorias internas.
- Generacion de informes de cribado: integrado en la aplicacion web del repositorio, agrega las decisiones por criterio y produce un resultado basado en reglas y un informe exportable por paciente y ensayo.
- Prototipado de pipelines de cribado con presupuesto minimo: al entrenar en una T4 en 15.8 minutos y ocupar el adaptador 0.1 GB, sirve para validar rapidamente la viabilidad de un flujo de cribado antes de invertir en modelos mayores.
- Investigacion en decodificacion especulativa: el par formado por el adaptador de 1.5B y el draft de 0.5B permite experimentar con aceleracion de inferencia en tareas de extraccion estructurada.
- Docencia y evaluacion de tecnicas PEFT: caso reproducible (semilla, manifiesto de split y codigo publicos) para comparar LoRA frente a ajuste completo en tareas de NLP clinico.

## Benchmarks y rendimiento

Evaluacion sobre el split de test agrupado por paciente (8 pacientes no vistos, 206 criterios), decodificacion greedy con `repetition_penalty=1.0`:

| Modelo | Accuracy | Macro-F1 | Evidence micro-F1 | Evidence F1 (gold no vacio) |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 0.325 | 0.256 | 0.123 | 0.111 |
| + este adaptador | 0.743 | 0.545 | 0.508 | 0.533 |

Validacion (8 pacientes, 206 criterios): accuracy 0.733, macro-F1 0.431, evidence micro-F1 0.522.

F1 por clase en test: `included` 0.86, `not excluded` 0.83, `not enough information` 0.63, `not applicable` 0.40, `not included` 0.00 (solo 13 ejemplos de entrenamiento). No se han publicado resultados en otros benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0.1 GB y se fusiona con el modelo base de 1.5B; en fp16 el conjunto requiere aproximadamente 3-4 GB de VRAM, y en cuantizacion de 8 o 4 bits cabria en menos de 2 GB (estimacion a partir del tamano del modelo, no confirmada en la model card).
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060 12 GB, RTX 4060, RTX 4090) es suficiente; el entrenamiento se realizo en una NVIDIA T4. Para servir en produccion con concurrencia, A10G o L4 son opciones razonables.
- Cabe en GPU consumer: si, con holgura, incluso en tarjetas de 8 GB.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor), fusion del adaptador con `merge_and_unload()` para exportar a vLLM, TGI o llama.cpp/Ollama tras conversion a GGUF (no documentado explicitamente por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento completo tardo 15.8 minutos en una T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Trialsieve (este adaptador) | 1.5B + 18.5M LoRA | 1024 en entrenamiento | Cribado de elegibilidad con evidencia | Apache 2.0 | Hugging Face, 78 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | No disponible | Generacion general | Apache 2.0 | Hugging Face |
| TrialGPT (referencia del dataset) | No disponible | No disponible | Emparejamiento paciente-ensayo | No disponible | Publicado en Nature Communications 2024 |

La comparacion directa con TrialGPT no es posible con los datos disponibles, ya que la model card solo cita el articulo como origen del dataset y no incluye metricas comparativas entre ambos sistemas. Frente al modelo base, la mejora medida es de +0.418 en accuracy y +0.289 en macro-F1.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy pequeno (37 pacientes); las clases minoritarias `not included` (13 ejemplos) y `excluded` (8) no se aprenden, y el split de test no contiene ningun caso `excluded`.
- El error mas frecuente es interpretar informacion ausente como hallazgo negativo: `not enough information` predicho como `not excluded` en 28 de los 206 criterios de test.
- Dificultades con comprobaciones de rangos numericos (por ejemplo, umbrales de laboratorio o ventanas temporales).
- Baja recall de evidencia en criterios de exclusion (0.09): a menudo responde `not excluded` sin citar ninguna frase.
- Los historiales son descripciones sinteticas y cortas, no texto real de historia clinica electronica, por lo que el rendimiento en datos reales es incierto.
- Solo soporta ingles.
- No validado para uso clinico: el autor indica explicitamente que toda salida debe ser revisada por personal cualificado de investigacion clinica; es un prototipo educativo, no una herramienta de decision de reclutamiento.
- Licencia Apache 2.0 permite uso comercial del codigo y pesos, pero la ausencia de validacion clinica desaconseja cualquier despliegue en produccion sanitaria sin evaluacion adicional y supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibrahimmlk/trialsieve-qwen2.5-1.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo draft para decodificacion especulativa: https://huggingface.co/ibrahimmlk/trialsieve-qwen2.5-0.5b-draft-lora
- Repositorio de codigo, informe y aplicacion: https://github.com/ibrahimmlk/trialsieve
- Manifiesto del split: https://github.com/ibrahimmlk/trialsieve/blob/main/data/splits/split_manifest.json
- Video de demostracion: https://youtu.be/n4dS_2brjwQ
- Dataset: https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations
- Articulo de referencia (Jin et al., Nature Communications 15, 9074, 2024): https://www.nature.com/articles/s41467-024-53081-z
