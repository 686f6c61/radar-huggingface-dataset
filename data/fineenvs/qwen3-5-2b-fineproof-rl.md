# FineEnvs/Qwen3.5-2B-FineProof-RL

## Resumen

Qwen3.5-2B-FineProof-RL es un ajuste fino por refuerzo del modelo Qwen3.5-2B, desarrollado por FineEnvs, orientado exclusivamente a la generación de demostraciones matemáticas de nivel olimpiada. El modelo parte del checkpoint base de Qwen (sin fase previa de SFT) y se entrena mediante AsyncGRPO con una recompensa basada en un juez LLM (gpt-oss-20b) que puntúa cada prueba de 0 a 7 según el esquema de corrección del propio problema. El resultado es un modelo de 2.213 millones de parámetros con licencia Apache-2.0, publicado en safetensors y bf16.

La relevancia del modelo reside en su metodología: demuestra que el aprendizaje por refuerzo directo desde el modelo base, con un juez automático y un entorno de tareas reproducible (FineProofEnvs sobre Harbor/OpenEnv), puede mejorar de forma medible la calidad de pruebas matemáticas en un modelo pequeño. En la evaluación retenida de 64 problemas, la puntuación media de rúbrica sube de 0,217 a 0,407 (juez de entrenamiento) y de 0,259 a 0,464 (rejuzgado con gpt-oss-120b), con un pass@4 que pasa del 26,6% al 40,6%.

Se trata de un modelo de nicho: no es un asistente general, sino una herramienta especializada en demostraciones en inglés, con el modo de razonamiento (thinking) desactivado y un prompt de sistema concreto. Su utilidad principal es la investigación en RL para matemáticas y la generación asistida de pruebas que un humano debe verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), modo no-thinking |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (configuración de servicio recomendada por el autor con `--max-model-len 40960`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16; entrenamiento con pesos maestros fp32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, con 2.213 millones de parámetros y modo de razonamiento desactivado, tal y como se usó en entrenamiento. No hay fase de SFT: el ajuste se realiza directamente desde el checkpoint base `Qwen/Qwen3.5-2B` mediante AsyncGRPO implementado en TRL, con integración de Harbor a través de OpenEnv. El entrenamiento consistió en 500 actualizaciones de 128 rollouts cada una (8 problemas × 16 muestras), con AdamW de 8 bits, learning rate de 1e-6, 10 actualizaciones de warm-up y pesos maestros en fp32. La función objetivo usa la ventaja como recompensa menos la media del grupo (sin división por desviación típica) y suma las pérdidas por token dividiendo por 32.768, siguiendo el esquema de QED-Nano y Dr. GRPO.

Los datos de entrenamiento son 1.066 problemas de FineProofs-RL en los que el modelo base de QED-Nano promediaba entre 0,5 y 0,9. La recompensa es la puntuación de rúbrica de gpt-oss-20b dividida por 7, promediando dos calificaciones; una prueba truncada a 32.768 tokens recibe 0. El muestreo se hizo con temperatura 0,8 y hasta 32.768 tokens de salida. El entrenamiento se ejecutó en un job de 4×H200 durante 28 horas (aproximadamente 580 dólares de GPU más 241 dólares de llamadas al juez). No se documentan innovaciones de decodificación especulativa ni atención lineal; la innovación principal es el pipeline de RL con juez automático y entorno reproducible.

## Capacidades

- Generación de demostraciones matemáticas de nivel olimpiada en inglés, con LaTeX y Markdown.
- Razonamiento matemático multi-paso orientado a pruebas rigurosas (no a respuestas numéricas directas).
- Escritura de pruebas completas con justificación de cada paso, citando únicamente teoremas con nombre estándar.
- Trabajo de exploración en la propia respuesta: en modo no-thinking el modelo suele desarrollar el problema antes de la prueba final, que envuelve en un bloque Markdown.
- No soporta tool calling ni function calling de forma documentada.
- No se documentan capacidades de agente, visión, audio ni multilingüismo más allá del inglés.
- No se documenta modo thinking activo; el chat template lo tiene desactivado.

## Casos de uso

- Generación asistida de pruebas de olimpiada: dado un enunciado, el modelo produce una prueba completa en Markdown con LaTeX, útil como borrador que un matemático revisa y corrige. Es adecuado porque se entrenó específicamente con ese formato y ese prompt de sistema.
- Investigación en RL para matemáticas: sirve como referencia reproducible de un pipeline AsyncGRPO con juez LLM, entorno Harbor y datos FineProofs-RL, para experimentar con variantes de recompensa o de algoritmo.
- Construcción de datasets de pruebas matemáticas: el modelo puede generar múltiples intentos por problema (temperatura 0,8) que, filtrados por un juez fuerte, alimentan corpus de entrenamiento o evaluación.
- Evaluación de jueces automáticos: al comparar las puntuaciones de gpt-oss-20b y gpt-oss-120b sobre las mismas pruebas, se puede estudiar la calibración y los sesgos de los jueces LLM en tareas de demostración.
- Tutoría matemática supervisada: en un entorno educativo, el modelo puede proponer demostraciones que el estudiante compara con la solución oficial, siempre con revisión humana dada su tasa de contradicciones no resueltas.
- Prototipado de entornos de RL: el repositorio FineProofEnvs y el código en GitHub permiten reutilizar el entorno de tareas (problemas, esquemas de corrección, juez) para entrenar otros modelos pequeños con el mismo recipe.
- Benchmarking de modelos pequeños en matemáticas: como checkpoint de 2B con evaluación pareada por problema, es útil para medir el efecto del RL frente al modelo base en condiciones controladas.

## Benchmarks y rendimiento

Evaluación retenida: 64 problemas × 4 intentos, comparación pareada por problema. El conjunto son los problemas de FineProofs-RL-test cuya prueba de referencia obtiene al menos 6/7 con gpt-oss-120b; ninguno está en entrenamiento.

| Metrica | Qwen3.5-2B | FineProof-RL | Cambio |
|---|---:|---:|---:|
| Puntuación media de rúbrica, juez gpt-oss-20b | 0,217 | 0,407 | +0,190 ± 0,030 |
| Puntuación media de rúbrica, rejuzgado con gpt-oss-120b (high effort) | 0,259 | 0,464 | +0,204 ± 0,034 |
| Intentos con puntuación máxima (7/7) | 12,1% | 25,4% | no disponible |
| Problemas con al menos un intento 7/7 (pass@4) | 26,6% | 40,6% | no disponible |

De los 64 problemas, 47 mejoraron y 6 empeoraron. El checkpoint publicado es el último (update 500), no el mejor según la curva de evaluación. No se han publicado resultados en MMLU, HumanEval, GSM8K ni IMO-ProofBench en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,4 GB solo para pesos, más KV cache; con contexto de 40.960 tokens el consumo crece de forma significativa y requiere planificación de memoria.
- GPU recomendadas: H200 (usada en entrenamiento con 4 unidades), A100 80 GB y H100 para servir con contexto largo; RTX 4090 (24 GB) puede alojar los pesos en bf16 pero el contexto máximo puede requerir cuantización o límites menores.
- Cabe en GPU de consumo: sí en términos de pesos (4,4 GB), aunque el contexto de 40.960 tokens y la generación de hasta 32.768 tokens de salida exigen cuidado con la memoria; no se documentan cuantizaciones GGUF oficiales.
- Despliegue: el autor recomienda vLLM (`vllm serve FineEnvs/Qwen3.5-2B-FineProof-RL --max-model-len 40960`) con API compatible con OpenAI. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| FineEnvs/Qwen3.5-2B-FineProof-RL | 2,21B | 40.960 | Pruebas de olimpiada vía RL (GRPO) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2,21B | no disponible | Modelo general | no disponible en la información | Hugging Face |
| QED-Nano (LM-Provers) | no disponible | no disponible | Pruebas matemáticas con juez LLM | Apache-2.0 | Hugging Face |

La comparación cuantitativa directa solo está disponible frente al modelo base Qwen3.5-2B, con las métricas de la tabla de benchmarks. No se dispone de datos de rendimiento de QED-Nano ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El juez es el objetivo: entrenamiento y evaluación principal usan jueces gpt-oss. Una auditoría manual de cuatro pruebas 7/7 encontró la idea clave en las cuatro, pero dos contenían afirmaciones falsas o una contradicción sin resolver que un corrector cuidadoso puntuaría en torno a 4/7.
- Trabajo de exploración en la respuesta: en modo no-thinking el modelo suele desarrollar el problema antes de la prueba final y envuelve esta en un bloque Markdown, lo que complica la extracción automática.
- Alcance estrecho: solo pruebas de olimpiada en inglés; no evaluado en IMO-ProofBench ni en otros dominios. No es un demostrador verificado: toda prueba debe revisarse.
- Evaluación pequeña: 64 problemas, una sola ejecución de entrenamiento y errores estándar de aproximadamente 0,03.
- Riesgo de alucinación matemática: puede citar teoremas de forma incorrecta o dejar pasos sin justificar; el propio autor advierte de contradicciones toleradas por el juez.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-2B y los datos de QED-Nano tienen sus propias condiciones que deben verificarse.
- Idiomas: únicamente inglés; no se documenta soporte multilingüe.
- Sin cuantizaciones oficiales publicadas: el despliegue en hardware limitado requiere convertir los pesos, con el riesgo de degradación no evaluada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FineEnvs/Qwen3.5-2B-FineProof-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de entrenamiento (entornos): https://huggingface.co/datasets/FineEnvs/fineproof-envs-train
- Dataset de problemas FineProofs-RL: https://huggingface.co/datasets/lm-provers/FineProofs-RL
- Dataset de tareas de test: https://huggingface.co/datasets/FineEnvs/fineproof-envs-test
- Dataset con todos los intentos de evaluación: https://huggingface.co/datasets/FineEnvs/fineproof-rl-runs
- Blog de QED-Nano (origen del juez y los problemas): https://huggingface.co/spaces/lm-provers/qed-nano-blogpost
- Modelo QED-Nano: https://huggingface.co/lm-provers/QED-Nano
- Dashboard de entrenamiento (Trackio): https://huggingface.co/spaces/FineEnvs/fineproof-rl-trackio
- Código, receta y resultados completos: https://github.com/adithya-s-k/FineEnvs/tree/main/08-math-environments/fineproof
- Resultados detallados (RESULTS.md): https://github.com/adithya-s-k/FineEnvs/blob/main/08-math-environments/fineproof/training/RESULTS.md
