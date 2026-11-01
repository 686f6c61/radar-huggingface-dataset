# SinhalaMMLU-SharedTask/team-qbits

## Resumen

Team QBitsLK es el sistema presentado por el equipo QBitsLK a la tarea compartida SinhalaMMLU, un benchmark de preguntas de opción múltiple en cingalés (sinhala). El modelo parte de `google/gemma-4-E4B` (variante textual de la familia Gemma 4), al que se aplicó un preentrenamiento continuado en cingalés y posteriormente un ajuste fino supervisado con LoRA sobre preguntas de exámenes oficiales de Sri Lanka. El resultado es un modelo de 7.996.157.418 parámetros (por debajo del límite de 8B impuesto por la organización) que se evalúa mediante puntuación por verosimilitud de cada opción, no mediante generación libre.

La relevancia del sistema reside en su enfoque metodológico: construye un corpus de 7.872 preguntas de opción múltiple a partir de exámenes O/L y de los grados 6 a 11, limpia artefactos de OCR y aplica descontaminación contra el split de test publicado de SinhalaMMLU. Sobre esa base, combina preentrenamiento continuado con LoRA (r=128, alpha=32, rsLoRA) y ajuste fino con LoRA (r=32, alpha=32) usando pérdida solo sobre la respuesta, fusionando después el adaptador en los pesos.

El repositorio en sí no contiene los pesos del modelo, sino el código de inferencia, las predicciones finales y el código de entrenamiento. El modelo enviado se aloja en el repositorio hermano `SinhalaMMLU-SharedTask/team-qbits-cpt-v3`. La licencia es Gemma, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E4B, variante textual) con preentrenamiento continuado y ajuste fino LoRA |
| Parametros totales | 7.996.157.418 (modelo fusionado en 16 bits) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el sistema enviado usa bf16 en 16 GB) |
| Idiomas soportados | cingalés (si); el prompt ensemble incluye instrucciones en inglés |
| Licencia | Gemma |
| Formato de pesos | no disponible en este repositorio (el modelo enviado está fusionado en 16 bits; se menciona bf16) |

## Arquitectura y entrenamiento

El sistema se construye en dos etapas sobre `google/gemma-4-E4B` (text-only). La primera etapa es un preentrenamiento continuado en cingalés sobre 1 millón de frases del corpus público `Minuri/diverse_sinhala_dataset` (fichero `high_confidence_7_7M.csv`), usando LoRA con r=128, alpha=32, rsLoRA, empaquetado de pseudo-documentos del mismo dominio y una época. La segunda etapa es un ajuste fino supervisado con LoRA r=32, alpha=32 y dos épocas sobre un dataset propio de 7.872 preguntas de opción múltiple extraídas de exámenes O/L y de grados 6 a 11 de Sri Lanka, con limpieza de OCR y descontaminación contra el split de test de SinhalaMMLU. La pérdida se calcula únicamente sobre la respuesta. El adaptador se fusiona posteriormente en los pesos base.

La innovación principal no está en la arquitectura sino en el procedimiento de evaluación: en lugar de generar texto, el sistema puntúa cada opción calculando su log-verosimilitud bajo un ensemble de 5 prompts (instrucciones en cingalés e inglés, con y sin introducción de asignatura, y dos rotaciones del orden de opciones). No hay muestreo. El script `inference.py` reproduce exactamente la fila enviada a Codabench. Se documenta además una ablación sobre el Gemma 4 E4B sin preentrenamiento continuado, y se advierte de que aplicar el adaptador en tiempo de carga (en lugar de fusionarlo) da 8.069.557.738 parámetros, superando el límite de 8B, por lo que no es el sistema enviado.

## Capacidades

- Respuesta a preguntas de opción múltiple en cingalés mediante puntuación por log-verosimilitud de cada opción.
- Comprensión de instrucciones en cingalés e inglés dentro del ensemble de prompts.
- Manejo de preguntas de distintas asignaturas académicas (exámenes O/L y grados 6 a 11).
- Evaluación determinista: con semilla fija, las ejecuciones repetidas producen `predictions.jsonl` idénticas byte a byte.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al par cingalés-inglés en el contexto de la tarea.

## Casos de uso

- Evaluación académica automatizada en cingalés: el sistema puntúa opciones de preguntas de examen O/L y grados 6 a 11, lo que permite corregir o clasificar bancos de preguntas existentes sin generación libre y con resultados reproducibles.
- Investigación en benchmarks de bajo recurso: sirve como referencia reproducible para la tarea SinhalaMMLU, con código de inferencia y predicciones publicadas que permiten replicar la puntuación macro de 57,81.
- Construcción de pipelines de evaluación deterministas: al no usar `generate` ni muestreo, encaja en entornos donde se exige que la misma entrada produzca exactamente la misma salida, como auditorías o comparaciones entre versiones de modelo.
- Ajuste fino sobre dominios curriculares: el código de entrenamiento (`cpt_gemma4_sinhala.py`, `sft_gemma4_mcq.py`, `mcq_dataset.py`) es reutilizable para adaptar Gemma 4 E4B a otros currículos o asignaturas con datos propios de opción múltiple.
- Descontaminación de datasets educativos: el pipeline de limpieza de OCR y descontaminación contra splits de test puede reutilizarse al preparar corpus de exámenes para otras lenguas o regiones.
- Despliegue en hardware de gama media: al ocupar 16 GB en bf16 y requerir unos 27 GB de VRAM en pico, puede ejecutarse en una única GPU de 24-48 GB, lo que facilita la reproducción por parte de otros equipos.

## Benchmarks y rendimiento

Resultados en Codabench para la tarea SinhalaMMLU (porcentaje de acierto):

| Sistema | Easy | Medium | Hard | Macro |
|---|---|---|---|---|
| Enviado: `team-qbits-cpt-v3`, ensemble de 5 prompts | 58,10 | 62,56 | 52,79 | **57,81** |
| Mismo modelo con adaptador aplicado en carga (no fusionado) | 58,26 | 62,02 | 52,58 | 57,62 |
| Ablación: `team-qbits-base-v3b` (Gemma 4 base sin CPT), ensemble de 5 prompts | 57,01 | 63,10 | 51,34 | 57,15 |
| Ablación: base sin CPT, prompt único, sin ensemble | no disponible | no disponible | no disponible | 55,66 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM en inferencia: el modelo fusionado ocupa 16 GB en bf16; el pico medido es de aproximadamente 27 GB.
- GPU utilizada por los autores: 1x NVIDIA A40 de 48 GB.
- Los autores indican que cualquier GPU con al menos 20 GB debería funcionar.
- Tiempo de ejecución de referencia: unos 18 minutos para 2.238 preguntas (5 variantes de prompt × 4 opciones ≈ 44.800 candidatos puntuados).
- Opciones de despliegue: el repositorio proporciona `inference.py` con `requirements.txt`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Es necesario aceptar la licencia Gemma en la cuenta de Hugging Face usada para ejecutar; el modelo fusionado es autocontenido y no requiere descargar el modelo base por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado SinhalaMMLU (macro) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Team QBitsLK (`team-qbits-cpt-v3`) | 7.996.157.418 | no disponible | 57,81 | Gemma | Pesos en repo hermano; este repo contiene código y predicciones |
| Ablación `team-qbits-base-v3b` (Gemma 4 E4B sin CPT) | no disponible | no disponible | 57,15 | Gemma | Repo público del mismo equipo |
| Gemma 4 E4B original (`google/gemma-4-E4B`) | no disponible en la información | no disponible | no disponible | Gemma | Público en Hugging Face |

No se dispone de datos de otros sistemas participantes en la tarea compartida ni de modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio `SinhalaMMLU-SharedTask/team-qbits` no contiene los pesos del modelo, sino código de inferencia, predicciones y código de entrenamiento; el modelo enviado está en `SinhalaMMLU-SharedTask/team-qbits-cpt-v3`.
- El sistema está diseñado exclusivamente para opción múltiple con puntuación por log-verosimilitud; no se ha validado para generación libre, diálogo, código ni otras tareas.
- El rendimiento en la partición difícil es notablemente inferior (52,79) que en media (62,56), lo que sugiere dificultades con preguntas de mayor complejidad.
- La cobertura lingüística se limita al cingalés (con instrucciones también en inglés); no se documenta comportamiento en otras lenguas.
- El límite de 8B impuesto por la organización condiciona el diseño: la variante con adaptador sin fusionar supera ese límite y no es válida como envío.
- La licencia Gemma impone condiciones específicas de uso, incluida la aceptación previa en Hugging Face y restricciones para uso comercial; conviene revisar los términos antes de desplegar en producción.
- No se documentan análisis de sesgos, tasas de alucinación ni evaluaciones de robustez fuera del benchmark de la tarea.
- El ensemble de 5 prompts está fijado en `VARIANTS` dentro de `inference.py`; modificarlo altera las predicciones y rompe la reproducibilidad del resultado enviado.

## Enlaces

- Repositorio del sistema: https://huggingface.co/SinhalaMMLU-SharedTask/team-qbits
- Modelo enviado: https://huggingface.co/SinhalaMMLU-SharedTask/team-qbits-cpt-v3
- Modelo base con preentrenamiento continuado en cingalés: https://huggingface.co/QBitsLK/gemma4-e4b-sinhala-cpt
- Adaptador LoRA del modelo enviado: https://huggingface.co/SinhalaMMLU-SharedTask/team-qbits-cpt-v3-lora
- Ablación sobre Gemma 4 E4B base: https://huggingface.co/SinhalaMMLU-SharedTask/team-qbits-base-v3b
- Adaptador LoRA de la ablación: https://huggingface.co/SinhalaMMLU-SharedTask/team-qbits-base-v3b-lora
- Dataset de ajuste fino (MCQ): https://huggingface.co/datasets/SinhalaMMLU-SharedTask/team-qbits-mcq-data
- Corpus de preentrenamiento continuado: https://huggingface.co/datasets/Minuri/diverse_sinhala_dataset
