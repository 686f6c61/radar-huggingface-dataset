# lastmass/Qwen3.5-Medical-Decision

## Resumen

Qwen3.5-Medical-Decision es un modelo de decisión derivado de `unsloth/Qwen3.5-4B` mediante fine-tuning con LoRA, publicado por el usuario lastmass en HuggingFace. No es un modelo generativo al uso: en lugar de producir texto libre, ejecuta una única pasada forward y emite una probabilidad calibrada para cada opción de una pregunta médica de tipo test. Esto lo convierte en un artefacto de investigación orientado a la evaluación automática de ítems de examen médico en chino, no en un asistente clínico conversacional.

La arquitectura combina un backbone Qwen3.5-4B congelado y cuantizado a 4 bits con un cabezal de esquema conjunto estilo Cloudflare-Clef entrenado desde cero, que lee los estados ocultos en la posición de marcador de cada opción y emite un logit por opción. El conjunto de opciones vive en el prompt, de modo que el número y la redacción de las alternativas pueden cambiar en inferencia sin reentrenar. Se entrenó sobre el subconjunto CMB-Exam de `FreedomIntelligence/CMB`, con 10.000 filas y aproximadamente 24.000 decisiones.

El modelo resulta relevante como ejemplo de diseño de "decision models": elimina por construcción la alucinación de explicaciones (no genera prosa) y ofrece un coste de inferencia constante independientemente del número de opciones. Sus resultados reportados son 73,2% de accuracy en 190 ítems retenidos de CMB y 84,5% en 400 ítems del corpus cruzado CMExam, con una caída de solo 3,7–4,0 puntos porcentuales al permutar las opciones, lo que sugiere que lee el contenido de las alternativas y no memoriza posiciones. Es un artefacto de investigación, no un dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con backbone congelado en 4 bits + LoRA r=16 y cabezal de decisión Clef joint-schema |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens en entrenamiento; prompts de ~150 tokens; 512 también funciona según el autor |
| Tipos de cuantizacion | 4 bits (load_in_4bit) en el backbone; LoRA y cabezal en precisión de entrenamiento |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 9,4 GB, librería unsloth) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-4B` como backbone congelado y cuantizado a 4 bits. Sobre él se aplica un adaptador LoRA con r=16, α=16 y dropout 0, lo que supone 64,5 M parámetros entrenables sobre 3,07 B (2,10%). El componente diferenciador es el cabezal de esquema conjunto estilo Cloudflare-Clef, entrenado desde cero: lee los estados ocultos en la posición de marcador de cada opción y emite un logit por opción, que se normaliza con softmax(logits/T). La temperatura T se ajusta sobre filas retenidas y se pliega en los pesos del cabezal al guardar, de modo que no requiere fichero de calibración auxiliar.

Los datos provienen del config CMB-Exam de `FreedomIntelligence/CMB` (Apache-2.0), con 227.586 filas y 542.562 decisiones en el conjunto completo; este checkpoint usa un subconjunto barajado de 10.000 filas (≈24.000 decisiones). Se construyen tres tipos de decisión a partir de la clave oficial, sin etiquetado por LLM: `answer` (tipo `choice`, 4–6 opciones por fila), `question_type` (tipo `choice`: single/multiple/other) y `opt_A`…`opt_F` (tipo `noul`, una por opción, solo en ítems multi-respuesta). Las etiquetas son one-hot. El entrenamiento usó 300 pasos (≈1 época), batch 8 × grad-accum 4 = 32, lr 2e-4 con coseno y warmup 10, longitud de secuencia 2.048, pérdida de entropía cruzada con label smoothing sobre opciones, en una Tesla T4 (ruta float32, ya que Qwen3.5 no tiene bf16 en T4) durante unas 3 horas. La pérdida de entrenamiento bajó de 0,46 a 0,35 y la de validación de 0,41 a 0,35, con meseta tras ≈200 pasos; el autor indica que el modelo está saturado en este corpus (100 y 300 pasos dan el mismo 139/190).

## Capacidades

- Puntuación de opciones en preguntas médicas de tipo test: devuelve una probabilidad calibrada por opción mediante una única pasada forward.
- Clasificación de tipo de pregunta (`single`, `multiple`, `other`) mediante una decisión de tipo `choice`.
- Decisión multi-respuesta: una decisión `noul` independiente por opción para ítems con varias respuestas correctas.
- Conjunto de opciones dinámico: el número y la redacción de las alternativas se definen en el prompt, sin reentrenar el cabezal.
- No genera prosa: por construcción no puede alucinar explicaciones ni justificaciones.
- Coste de inferencia constante independientemente del tamaño del conjunto de opciones.
- Capacidades multilingües limitadas a chino e inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Evaluación automática de bancos de preguntas médicas: el modelo puntúa cada opción de un ítem de examen y devuelve la probabilidad de cada alternativa, lo que permite detectar ítems ambiguos o mal etiquetados comparando la predicción con la clave oficial.
- Validación de calidad de datasets médicos: al aplicar el modelo sobre corpus como CMB o CMExam se pueden localizar filas donde la opción de mayor probabilidad no coincide con la respuesta oficial, candidatas a revisión humana.
- Clasificación de tipología de ítems: la decisión `question_type` permite etiquetar automáticamente preguntas como single, multiple u other, útil para enrutar ítems en pipelines de generación de exámenes.
- Detección de respuestas múltiples: con las decisiones `noul` por opción se puede verificar qué alternativas son correctas en ítems multi-respuesta, un caso que los clasificadores de respuesta única no cubren.
- Investigación en calibración de modelos: el diseño con temperatura plegada en los pesos y la prueba de permutación de opciones lo hacen adecuado para estudiar si un modelo lee contenido o memoriza posiciones.
- Componente de un sistema de tutoría médica: integrado como módulo de scoring, puede alimentar interfaces que muestren al estudiante la probabilidad asignada a cada opción sin riesgo de explicaciones inventadas.
- Benchmarking de robustez posicional: la prueba de permutación (caída de 3,7–4,0 pp) sirve como referencia para comparar otros modelos de decisión en la misma tarea.

## Benchmarks y rendimiento

| Setting | Metrica | Resultado |
|---|---|---|
| Filas retenidas de CMB (190 ítems de opción única) | accuracy | 73,2% (azar 20%) |
| Corpus cruzado CMExam (400 ítems, nunca entrenados) | accuracy | 84,5% |
| Prueba de permutación de opciones (mismos ítems, opciones barajadas) | Δ accuracy | −3,7 pp (holdout) / −4,0 pp (CMExam) |
| Cabezal inicializado aleatoriamente, mismos datos | accuracy | 45,75% (≈ nivel de azar 46,0% de la tarea mixta) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone se carga en 4 bits; con pesos de 4,66 B en 4 bits el peso ronda los 2,3–2,5 GB, más overhead de activaciones y del cabezal. El repo completo ocupa 9,4 GB en safetensors.
- GPU recomendadas: el autor entrenó en una única Tesla T4 (16 GB) en ruta float32, por lo que la inferencia cabe holgadamente en T4, RTX 3090, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí; por el tamaño en 4 bits es viable en tarjetas de 8 GB o más, aunque no se documentan pruebas específicas en esas configuraciones.
- Opciones de despliegue: la model card usa la API `FastDecisionModel` de Unsloth (`from_pretrained`, `for_inference`, `predict`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el formato de decisión con cabezal Clef probablemente requiere el stack de Unsloth.
- Latencia y throughput: no disponibles. El autor solo indica que el coste es una única pasada forward y que es independiente del número de opciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-Medical-Decision | 4,66 B | 2.048 tokens | Scoring de opciones médicas (zh/en) | apache-2.0 | HuggingFace (43 descargas) |
| Qwen3.5-4B (base) | ≈4 B | no disponible en la información | Generación de texto general | no disponible en la información | HuggingFace (unsloth) |
| Modelos médicos generativos sobre CMB | no disponible | no disponible | QA médica generativa | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada. La comparación más directa es con el modelo base Qwen3.5-4B, que genera texto y no ofrece scoring calibrado por opción, y con el cabezal aleatorio del propio autor (45,75% de accuracy), que sirve como línea base interna.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un dispositivo médico y no debe usarse para decisiones clínicas.
- Sesgos conocidos: no documentados en la información disponible; el entrenamiento se limita a CMB-Exam, un corpus de exámenes médicos chinos, por lo que el dominio y la distribución de ítems están acotados.
- Riesgo de alucinación: bajo en el sentido de que no genera prosa, pero las probabilidades pueden estar mal calibradas fuera de la distribución de CMB; la accuracy en CMExam (84,5%) es superior a la del holdout de CMB (73,2%), lo que sugiere sensibilidad al corpus.
- Limitaciones de contexto e idioma: ventana de 2.048 tokens en entrenamiento y prompts de ~150 tokens; solo chino e inglés; no se documenta comportamiento en otros idiomas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero la licencia del modelo base (`unsloth/Qwen3.5-4B`) debe verificarse por separado, ya que la información disponible no la detalla.
- Dependencia del stack: la inferencia se documenta únicamente mediante `FastDecisionModel` de Unsloth; no hay evidencia de exportación a GGUF ni de compatibilidad con servidores de inferencia estándar.
- Saturación en el corpus: el autor reporta que 100 y 300 pasos dan el mismo resultado en el holdout, lo que limita la mejora esperable con más entrenamiento sobre estos datos.
- Advertencia de producción: con 43 descargas y 0 likes, el modelo carece de validación comunitaria; cualquier uso en producción requeriría una evaluación propia sobre el dominio objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/lastmass/Qwen3.5-Medical-Decision
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/FreedomIntelligence/CMB
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Cloudflare-Clef (referencia del cabezal): no disponible en la información proporcionada
