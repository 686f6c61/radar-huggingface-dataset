# Falconsai/proof_v2

## Resumen

falconsproof v2.0 (identificador `Falconsai/proof_v2`) es un modelo de decisión de conjunto cerrado desarrollado por Falcons AI. No es un modelo generativo: recibe un estado (texto o código), una pregunta y un conjunto cerrado de entre 2 y 20 opciones, y devuelve una probabilidad calibrada para cada opción junto con el nombre de la cabeza que ha respondido. Está construido sobre el encoder `answerdotai/ModernBERT-base` (22 capas, hidden size 768, capaz de 8.192 tokens, aunque aquí se entrena a 384 tokens) y suma aproximadamente 151,4 millones de parámetros contando todas las cabezas.

La arquitectura combina un generalista tipo cross-encoder listwise (un logit de relevancia por par pregunta+estado / opción) con tres cabezas especialistas destiladas: `intent` (15 intenciones de soporte), `code` (6 lenguajes) y `reasoning` (entailment de cada opción). Un enrutador basado en funciones escalón (una puerta por especialista) decidiría qué cabeza responde, pero en este checkpoint todas las puertas están cerradas, de modo que todas las respuestas provienen del generalista.

Es relevante ahora porque propone un patrón distinto al de los LLM generativos: en lugar de generar texto libre, clasifica opciones predefinidas con probabilidades calibradas (ECE de 0,008 en el conjunto global), lo que lo hace apto para despliegue en el edge y para tareas de enrutamiento, clasificación de intenciones y comprensión de código donde la latencia y la fiabilidad de la probabilidad importan más que la generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base), 22 capas, hidden size 768; generalista cross-encoder listwise + 3 cabezas especialistas destiladas con enrutador de puertas escalón |
| Parametros totales | 149.014.272 (safetensors); ≈ 151,4 M incluyendo todas las cabezas segun model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado a 384 tokens; el backbone ModernBERT-base soporta hasta 8.192 tokens |
| Tipos de cuantizacion | safetensors (bfloat16); GGUF disponible en el repositorio |
| Idiomas soportados | Ingles; codigo en Go, Java, JavaScript, PHP, Python, Ruby (y C para deteccion de vulnerabilidades) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |
| Modelo base | answerdotai/ModernBERT-base |
| Pipeline | text-classification |
| Tamano del repositorio | 6,0 GB |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base` como encoder troncal y sobre él monta cuatro cabezas. La generalista es un cross-encoder listwise que produce un logit de relevancia para cada par formado por (pregunta + estado, opción), lo que permite puntuar simultáneamente hasta 20 opciones por consulta. Las tres especialistas son cabezas de clasificación destiladas cada una desde su propio profesor y posteriormente congeladas: `intent` cubre 15 intenciones de soporte al cliente, `code` distingue 6 lenguajes de programación y `reasoning` evalúa el entailment (implicación lógica) de cada opción. Un enrutador compuesto por una función escalón por especialista decide qué cabeza responde según su confianza; en este checkpoint las puertas quedaron cerradas (τ = κ = μ = 1,01) porque la búsqueda de validación no encontró ningún ajuste que superase al generalista, por lo que la totalidad de las respuestas salen del generalista.

El entrenamiento se realizó con el preset `small`: hasta 500 decisiones de entrenamiento por fuente y tarea, 1 epoch por etapa y semilla 42, sobre una GPU NVIDIA GeForce RTX 5090 Laptop en bfloat16. La mezcla de datos abarca 19 tareas, de las cuales el 73,4 % de las decisiones de entrenamiento son código. Las fuentes incluyen CodeXGLUE (code-to-text, defect detection, clone detection), MBPP, OpenAI HumanEval, Bitext customer support, CLINC OOS, Banking77, CommonsenseQA, OpenBookQA, SciQ, BoolQ, GSM8K, SNLI, MultiNLI y AI2 ARC. Cada cabeza lleva su propia temperatura de calibración: generalista T = 1,197; intent 2,030; code 3,578; reasoning 5,530. La inferencia requiere dos pasadas de encoder por llamada, independientemente de cuántas preguntas se hagan sobre el mismo estado.

## Capacidades

- Clasificación de conjunto cerrado: devuelve una probabilidad calibrada por opción (entre 2 y 20 opciones), la opción elegida y la cabeza que ha respondido.
- Identificación de lenguaje de programación (99,7 % en el benchmark de code language ID).
- Comprensión de código: código a descripción (96,9 %), descripción a código (96,1 %), mapeo de tarea MBPP a solución (99,2 %), nombrado de funciones (90,1 %) y detección de vulnerabilidades (C incluido).
- Enrutamiento de intenciones de soporte al cliente: 95,8 % en Bitext con el generalista y 99,2 % con la especialista de intenciones.
- Inferencia de lenguaje natural (NLI): 90,8 % en SNLI.
- Razonamiento por entailment de opciones (cabeza `reasoning`).
- Clasificación de intenciones zero-shot y de opción múltiple mediante la lista de opciones.
- Salida interpretable: probabilidades, opción elegida, cabeza responsable y los valores de entrada de cada puerta frente a sus umbrales.
- Predicción selectiva y calibración: ECE de 0,008 en el conjunto global, lo que permite fijar umbrales de confianza.

## Casos de uso

- Enrutamiento de tickets de soporte: dada la consulta del usuario y una lista cerrada de 15 intenciones, el modelo devuelve la probabilidad de cada una y permite derivar el ticket al equipo correcto; el 95,8 % del generalista y el 99,2 % de la especialista de intenciones en Bitext lo hacen adecuado para triaje automatizado.
- Detección de lenguaje de programación en pipelines de CI/CD: con un 99,7 % de acierto, puede etiquetar automáticamente fragmentos de código para aplicar linters, formateadores o reglas de revisión específicas por lenguaje en repositorios políglotas.
- Análisis de vulnerabilidades en revisiones de código: la tarea de defect detection sobre CodeXGLUE permite clasificar si un fragmento (incluido C) contiene un defecto de seguridad y priorizar la revisión humana.
- Documentación automática y generación de descripciones de código: el mapeo código a descripción (96,9 %) y descripción a código (96,1 %) permite emparejar fragmentos con su documentación o buscar la implementación de una descripción dada.
- Asistencia a la búsqueda de soluciones en datasets de programación: con 99,2 % en la tarea MBPP de enunciado a solución, puede servir como componente de recuperación o ranking en herramientas de autocompletado y resolución de problemas.
- Clasificación zero-shot de consultas bancarias y de intenciones financieras: con 88,3 % en el conjunto retenido Banking77, es útil para enrutar peticiones en asistentes financieros sin reentrenar.
- Verificación de implicación lógica en asistentes de razonamiento: la cabeza `reasoning` (entailment por opción) permite validar si una afirmación se sigue de un contexto dado, útil para filtrado de respuestas o moderación semántica.
- Filtrado de baja confianza en producción: gracias a su calibración (ECE global 0,008) y a la salida de puertas, se pueden fijar umbrales para derivar a revisión humana los casos dudosos en lugar de arriesgar una decisión errónea.
- Nombrado automático de funciones y símbolos en refactorizaciones: con 90,1 % de acierto, puede sugerir nombres coherentes a partir del cuerpo de la función dentro de herramientas de análisis estático.
- Detección de clones de código: la fuente BigCloneBench del conjunto CodeXGLUE permite identificar fragmentos duplicados o casi duplicados en grandes bases de código.

## Benchmarks y rendimiento

Precisión de test sobre 5.096 decisiones de 23 fuentes y tareas (4 de ellas retenidas), según `falconsproof_report.json`:

| Dominio | n | falconsproof | ECE |
|---|---:|---:|---:|
| code | 3536 | 0,896 | 0,013 |
| support | 120 | 0,958 | 0,033 |
| intents | 240 | 0,867 | 0,013 |
| reasoning | 1200 | 0,544 | 0,037 |
| todas las fuentes | 5096 | 0,813 | 0,008 |

Tareas con rendimiento alto (≥ 88 %):

| Tarea | Precision |
|---|---:|
| Identificacion de lenguaje de codigo | 99,7 % |
| MBPP tarea a solucion | 99,2 % |
| Codigo a descripcion | 96,9 % |
| Descripcion a codigo | 96,1 % |
| Bitext routing de soporte | 95,8 % |
| SNLI | 90,8 % |
| Nombrado de funciones | 90,1 % |
| Banking77 (retenido) | 88,3 % |

Tareas con rendimiento cercano al azar:

| Tarea | Precision | Azar |
|---|---:|---:|
| GSM8K | 27,5 % | 25 % |
| OpenBookQA | 29,2 % | 25 % |
| ARC-Challenge | 30,8 % | 25 % |

La cabeza especialista de intenciones alcanza un 99,2 % en Bitext frente al 95,8 % del generalista, aunque al estar su puerta cerrada no se utiliza en la inferencia por defecto de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de 149 M de parámetros, no dato oficial): ≈ 600 MB en fp32, ≈ 300 MB en bfloat16/fp16, ≈ 150 MB en int8 y ≈ 75-90 MB en GGUF de 4 bits. El repositorio completo ocupa 6,0 GB porque incluye todos los formatos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizó en una NVIDIA GeForce RTX 5090 Laptop. Para despliegue en servidor, A100, H100, L40S o RTX 4090 están sobredimensionadas para este tamaño y priorizan throughput, no capacidad.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre (RTX 3060, 4060, 4090, e incluso iGPU recientes). También es viable en CPU gracias a su tamaño reducido.
- Opciones de despliegue: transformers (librería declarada), Text Embeddings Inference (el repositorio incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`), llama.cpp u Ollama a través del formato GGUF, y servidores compatibles con endpoints de Hugging Face.
- Latencia y throughput: no disponibles como cifras publicadas. La model card indica dos pasadas de encoder por llamada, independientemente del número de preguntas sobre el mismo estado, lo que abarata el coste cuando se reutiliza el estado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falconsai/proof_v2 | ≈ 151,4 M | 384 tokens (entrenamiento) / 8.192 (backbone) | Decision de conjunto cerrado + clasificacion de codigo, soporte y razonamiento | Apache 2.0 | HuggingFace |
| Falconsai/proof_V_1 | No disponible | No disponible | Predecesor sobre DistilBERT, sin especialistas de codigo ni razonamiento | No disponible en la informacion | HuggingFace |
| answerdotai/ModernBERT-base | No disponible en la informacion | 8.192 tokens | Encoder de proposito general (base del modelo) | No disponible en la informacion | HuggingFace |
| Cross-encoders de re-ranking genericos (familia MiniLM/BGE) | No disponible | No disponible | Re-ranking y clasificacion por pares | No disponible | HuggingFace |

La comparacion cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada mas alla de la mencion a `proof_V_1` y al modelo base `ModernBERT-base`; no se aportan cifras de estos dos ultimos en la model card.

## Limitaciones y advertencias

- No es un modelo generativo: solo puede puntuar las opciones que se le proporcionan. No genera texto libre ni respuestas abiertas.
- Sesgos conocidos: no disponibles de forma explícita en la información; el modelo se entrena sobre datasets públicos (CodeXGLUE, Bitext, CLINC, SNLI, etc.) y hereda los sesgos de esos corpus.
- Riesgo de alucinación: conceptualmente limitado al ser clasificación de opciones, pero puede asignar probabilidad alta a una opción incorrecta cuando el estado está fuera de distribución; la calibración mitiga pero no elimina este riesgo.
- Limitación de contexto: se entrena a 384 tokens, muy por debajo de los 8.192 que soporta ModernBERT-base, por lo que estados y preguntas largos pueden degradar la precisión.
- Limitación de idioma: solo inglés, además de código en Go, Java, JavaScript, PHP, Python, Ruby y C. No hay soporte declarado de castellano ni de otros idiomas naturales.
- Rendimiento débil en razonamiento: las tareas de razonamiento (GSM8K 27,5 %, OpenBookQA 29,2 %, ARC-Challenge 30,8 %) están cerca del azar; el dominio `reasoning` promedia 0,544. No debe usarse para matemáticas ni razonamiento complejo.
- Puertas cerradas: en este checkpoint ninguna especialista responde; aunque la de intenciones es mejor en Bitext (99,2 % frente a 95,8 %), su puerta está cerrada y no se aprovecha. La model card señala que reajustar las puertas es la mejora más directa pendiente.
- Origen de las cifras: todos los números provienen de una única ejecución de entrenamiento con el preset `small` (máximo 500 decisiones por fuente y tarea, 1 epoch por etapa, seed 42); no son resultados de un barrido exhaustivo ni de múltiples semillas.
- Volumen de adopción: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de terceros ni experiencia de producción publicada.
- Restricciones de licencia: Apache 2.0, que permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento por si imponen condiciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Falconsai/proof_v2
- Vista en Model Surgeon: https://surgeon.falcons.ai/?hub=Falconsai/proof_v2
- Modelo predecesor (proof_V_1): https://huggingface.co/Falconsai/proof_V_1
- Modelo base (ModernBERT-base): https://huggingface.co/answerdotai/ModernBERT-base
- Papers, blogs, repositorios y demos adicionales: no disponibles en la informacion proporcionada.
