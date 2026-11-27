# IITM-2026T3-DSAI-GROUP2/final-model-with-evals

## Resumen

El modelo `final-model-with-evals` es un adaptador LoRA de tipo PEFT desarrollado por el grupo IITM-2026T3-DSAI-GROUP2 sobre el modelo base `unsloth/Qwen3.5-4B`, una version cuantizada en 4-bit NF4 del modelo Qwen3.5 de 4.000 millones de parametros. El adaptador esta especializado en la funcion de tutor socratico para educacion, con enfasis en el curriculo NCERT (India) y en la ensenanza de matematicas y ciencias. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion que debe combinarse con el modelo base para su uso.

El problema que aborda es la generacion de respuestas tutoriales que guien al estudiante mediante preguntas en lugar de revelar directamente la solucion, un comportamiento conocido como tutoria socratica. El adaptador se entrena con una mezcla de dialogos pedagogicos (15.765 dialogos, 9.700.731 tokens) provenientes de cinco fuentes: socrateach, ncert_tutor_synthetic, k12_indian_curriculum, mathdial y demand_aug. La licencia es Apache 2.0 y el repositorio ocupa 0,3 GB, incluyendo el adaptador y una suite completa de evaluacion con 46 tablas CSV, 8 figuras y resultados en JSON.

La relevancia del modelo reside en su enfoque en la evaluacion rigurosa: el repositorio incluye una scorecard de Milestone 5 con metricas de fuga de respuestas, tasas de aprobacion en afirmaciones verdaderas y falsas, latencia p95 y robustez frente a perturbaciones. El adaptador logra una mejora de entropia cruzada de 0,6499 sobre el modelo base en el conjunto de test, aunque falla en tres de los ocho criterios de la scorecard (tasa de afirmaciones inseguras, tasa de afirmaciones verdaderas y caida de rendimiento bajo perturbacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible para el modelo base; adaptador LoRA con 64.929.792 parametros entrenables (259,8 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (max_len de entrenamiento: 2048) |
| Tipos de cuantizacion | Modelo base en 4-bit NF4; adaptador en safetensors (precision no especificada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), con tokenizer.json, tokenizer_config.json y chat_template.jinja |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/Qwen3.5-4B`, un transformer decoder-only de 4.000 millones de parametros cargado en cuantizacion 4-bit NF4. La configuracion LoRA emplea r=32, lora_alpha=32, con 64.929.792 parametros entrenables (259,8 MB). El entrenamiento se realizo durante 986 pasos (1 epoca), con batch efectivo de 16, learning rate de 1e-4 y longitud maxima de secuencia de 2048 tokens. El dataset de entrenamiento combina 15.765 dialogos y 9.700.731 tokens distribuidos en cinco fuentes: socrateach (8.091 dialogos), ncert_tutor_synthetic (3.372), k12_indian_curriculum (2.500), mathdial (1.302) y demand_aug (500). No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF o DPO; el entrenamiento parece ser un fine-tuning supervisado sobre dialogos pedagogicos.

La innovacion principal no reside en la arquitectura, sino en el enfoque de evaluacion: el repositorio incluye una suite completa de Milestone 5 con tablas de scorecard, slices, stress tests, OOD, fairness, eficiencia y una hoja de auditoria humana, ademas de figuras diagnosticas como curvas de perdida, matrices de confusion de afirmaciones, mapas de calor de errores, residuales, stress tests, margenes de decision, ablacion de system prompt y oclusion de palabras. La entropia cruzada de validacion es 0,9892 y la de test 1,4503, frente a 2,1002 del modelo base original, lo que supone una ganancia de 0,6499 en test.

## Capacidades

- Generacion de texto conversacional orientada a tutoria socratica: el adaptador esta entrenado para formular preguntas guia en lugar de revelar respuestas directas.
- Soporte de dialogos multi-turno en contextos educativos, con un maximo de 2.048 tokens durante el entrenamiento.
- Especializacion en curriculo NCERT y K-12 indio, con enfasis en matematicas y ciencias.
- Capacidad de reformulacion y andamiaje pedagogico (scaffolding) mediante preguntas progresivas.
- No se ha documentado soporte de tool calling ni function calling en la informacion disponible.
- No se ha documentado soporte de agentes ni razonamiento multi-paso mas alla del dialogo tutorial.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Tutoria socratica automatizada en plataformas educativas: el adaptador puede gestionar conversaciones multi-turno con estudiantes de K-12, formulando preguntas guia en lugar de dar soluciones directas, gracias a su entrenamiento sobre 15.765 dialogos pedagogicos y su tasa de fuga de respuestas de 0,0 en las pruebas de demanda.
- Asistente de refuerzo para el curriculo NCERT: integrado en aplicaciones de estudio para el sistema educativo indio, puede acompanar al estudiante en la resolucion de problemas de matematicas y ciencias siguiendo el enfoque del curriculo nacional.
- Generacion de material didactico con preguntas guia: el modelo puede producir secuencias de preguntas y pistas para docentes que quieran disenar actividades de descubrimiento guiado en el aula.
- Simulacion de tutor para formacion de docentes: permite a futuros profesores practicar tecnicas de tutoria socratica frente a un estudiante simulado que responde de forma realista.
- Evaluacion formativa automatizada: el adaptador puede analizar respuestas de estudiantes y devolver preguntas de seguimiento que detecten lagunas conceptuales, con una latencia p95 de 2,299 segundos, adecuada para interaccion en tiempo real.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA de 259,8 MB sobre un modelo de 4.000 millones de parametros cuantizado en 4-bit, puede ejecutarse en GPUs de consumo medio, lo que facilita su uso en centros educativos con infraestructura modesta.
- Investigacion en evaluacion de tutores IA: el repositorio incluye 46 tablas de evaluacion, 8 figuras y resultados en JSON que sirven como base reproducible para estudiar robustez, sesgo y fidelidad pedagogica en modelos tutores.

## Benchmarks y rendimiento

| Criterio | Medido | Objetivo | Estado |
|---|---:|---:|---:|
| Tasa de fuga de respuestas (nuevas pruebas de demanda) | 0,0 | <= 0,05 | PASS |
| Tasa de aprobacion de afirmaciones inseguras | 0,80 | >= 0,95 | FAIL |
| Tasa de aprobacion de afirmaciones falsas | 1,00 | >= 0,90 | PASS |
| Tasa de aprobacion de afirmaciones verdaderas | 0,7333 | >= 0,90 | FAIL |
| Tasa de aprobacion fuera de tema | 0,9333 | >= 0,90 | PASS |
| Ganancia de entropia cruzada en test sobre Qwen3.5 original | 0,6499 | >= 0,50 | PASS |
| Latencia p95 de respuesta (s) | 2,299 | <= 5,0 | PASS |
| Mayor caida media de tasa de aprobacion bajo perturbacion | 0,40 | <= 0,15 | FAIL |

Resultados adicionales: entropia cruzada de validacion 0,9892, entropia cruzada de test 1,4503 frente a 2,1002 del modelo base. La scorecard global es de 5/8 criterios superados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-4B en 4-bit NF4 requiere aproximadamente 2,5-3 GB de VRAM solo para los pesos, mas overhead de activaciones y contexto; el adaptador LoRA anade 259,8 MB. En la practica, se recomienda un minimo de 6-8 GB de VRAM para inferencia comoda con contexto de 2.048 tokens.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en GPUs con al menos 6-8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la libreria `peft` de Hugging Face sobre el modelo base cuantizado; tambien es compatible con vLLM (soportando adaptadores LoRA), llama.cpp y Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF. TGI no esta documentado en la informacion disponible.
- Latencia y throughput estimados: la latencia p95 medida en la evaluacion es de 2,299 segundos por respuesta, aunque no se especifica el hardware utilizado para dicha medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| final-model-with-evals (este modelo) | 4B (base) + 64,9M LoRA | No disponible (entrenado a 2.048) | Apache 2.0 | Tutor socratico, NCERT/K-12 | Hugging Face (PEFT adapter) |
| Qwen3.5-4B (base) | 4B | No disponible | Apache 2.0 (segun modelo base) | Generacion de texto general | Hugging Face |
| Alternativas de tutoria socratica | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores o modelos especializados en tutoria socratica comparables en la informacion proporcionada. La comparacion principal es con el modelo base Qwen3.5-4B, sobre el que este adaptador mejora la entropia cruzada en test de 2,1002 a 1,4503.

## Limitaciones y advertencias

- La scorecard de evaluacion falla en tres de ocho criterios: tasa de aprobacion de afirmaciones inseguras (0,80 frente a 0,95 requerido), tasa de aprobacion de afirmaciones verdaderas (0,7333 frente a 0,90) y caida de rendimiento bajo perturbacion (0,40 frente a 0,15 maximo). Esto indica que el modelo puede generar afirmaciones inseguras o incorrectas con mayor frecuencia de la deseada.
- Riesgo de alucinacion: la tasa de aprobacion de afirmaciones verdaderas de 0,7333 sugiere que el modelo puede rechazar o contradecir afirmaciones correctas en aproximadamente el 26,7% de los casos, lo que es problematico en un contexto educativo.
- La robustez bajo perturbacion es limitada: la caida media de tasa de aprobacion de 0,40 supera ampliamente el umbral de 0,15, lo que implica que cambios en el input pueden degradar significativamente el rendimiento.
- El adaptador esta especializado en el curriculo NCERT indio y en K-12; su comportamiento fuera de ese dominio no esta documentado.
- No se dispone de informacion sobre sesgos conocidos ni sobre evaluaciones de fairness mas alla de las tablas incluidas en el repositorio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B debe verificarse por separado para confirmar sus terminos.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- La longitud de contexto real del modelo base no se especifica en la informacion disponible; el entrenamiento se realizo con max_len de 2.048 tokens, por lo que el rendimiento mas alla de esa longitud no esta garantizado.
- No se documentan los idiomas soportados, lo que supone un riesgo para despliegues en castellano u otros idiomas distintos del ingles o hindi.

## Enlaces

- Hugging Face: https://huggingface.co/IITM-2026T3-DSAI-GROUP2/final-model-with-evals
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Repositorio del adaptador (ruta interna): `adapter/` dentro del repositorio de Hugging Face
- Resumen de evaluacion: `m5_summary.json` dentro del repositorio
- Tablas de evaluacion: `tables/` (46 CSV) dentro del repositorio
- Figuras diagnosticas: `figures/` (8 PNG) dentro del repositorio
- Resultados crudos: `results/` dentro del repositorio
- Generaciones: `generations/` dentro del repositorio
