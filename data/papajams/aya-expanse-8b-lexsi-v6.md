# Papajams/aya-expanse-8b-lexsi-v6

## Resumen

`aya-expanse-8b-lexsi-v6` es un adaptador LoRA (PEFT) sobre el modelo base `CohereLabs/aya-expanse-8b`, desarrollado por el usuario Papajams en el contexto del hackathon *Lexsi AI Safety & Alignment Hackathon* (Track 3). El adaptador continúa el entrenamiento desde una versión anterior (`aya-expanse-8b-lexsi-v4`) con 600 ejemplos adicionales de SFT centrados en aritmética (`sft_arith.jsonl`), dentro de una tarea de gobernanza de gasto (*spend-governance*). El repositorio contiene únicamente los pesos del adaptador (0,2 GB), no el modelo completo.

La relevancia de esta ficha es principalmente metodológica: el autor publica el checkpoint de forma explícita como **resultado negativo reproducible**, no como artefacto recomendado para producción. En la suite canónica de 70 escenarios held-out en bf16, v6 mejora ligeramente la precisión global (80,0 % frente a 78,6 % de v4), pero **empeora la métrica primaria de seguridad**: pasa de 2/48 casos inseguros permitidos en v4 a 5/48 en v6. El autor indica que debe usarse `aya-expanse-8b-lexsi-v4` para la tarea de gasto gobernado.

No se dispone de información sobre arquitectura, parámetros ni contexto del modelo base en la documentación proporcionada; los datos de esta ficha se limitan a lo declarado en la model card del adaptador y a los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `CohereLabs/aya-expanse-8b`; arquitectura del base no disponible |
| Parametros totales | no disponible (repo del adaptador: 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT sobre `CohereLabs/aya-expanse-8b`. La continuación de entrenamiento parte de `Papajams/aya-expanse-8b-lexsi-v4` y utiliza 600 ejemplos adicionales de SFT aritmético (`sft_arith.jsonl`) procedentes del dataset `Papajams/lexsi-governance`. La model card no detalla hiperparámetros de LoRA (rango, alpha, capas objetivo), régimen de entrenamiento ni precisión usada durante el SFT.

El objetivo declarado es una tarea de gobernanza de gasto con validación de contratos y escenarios de seguridad, evaluada sobre una suite canónica de 70 escenarios held-out en bf16. El resultado es un empeoramiento de la métrica primaria de seguridad respecto a v4, atribuido por el autor a que la ponderación aritmética del SFT hizo el modelo más permisivo: corrigió varios casos aritméticos y de clarificación, pero habilitó de forma insegura escenarios con carga de juicio (expansión de alcance a mitad de trayectoria y compromisos recurrentes).

## Capacidades

- Generación de texto y continuación de conversación multi-turno heredadas del modelo base `aya-expanse-8b` (capacidades específicas del base no documentadas en la información disponible).
- Ajuste específico para una tarea de gobernanza de gasto con validación de contratos: la suite de evaluación reporta `contract valid` 70/70 tanto en base como en v4 y v6.
- Razonamiento aritmético y de clarificación reforzado mediante los 600 ejemplos SFT de `sft_arith.jsonl`.
- Comportamiento agéntico en escenarios con trayectorias multi-paso (el tag `agentic-finetuning` figura en los metadatos), aunque la métrica de seguridad empeora en escenarios de expansión de alcance.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (los idiomas del adaptador no están declarados).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- **Reproducción de resultados negativos en seguridad de IA**: cargar el adaptador con PEFT sobre `aya-expanse-8b` y ejecutar la suite de 70 escenarios de `results70/` para verificar la regresión de 2/48 a 5/48 casos inseguros permitidos. Es el uso principal declarado por el autor.
- **Auditoría de degradación por SFT aritmético**: comparar v4 y v6 sobre los mismos escenarios para aislar qué categorías (expansión de alcance, compromisos recurrentes) se volvieron permisivas tras ponderar el entrenamiento hacia aritmética.
- **Investigación de alineación en tareas de gasto gobernado**: usar el adaptador como línea base negativa en experimentos de *safety alignment*, contrastando la precisión global (80,0 %) con la métrica de seguridad (5/48) para estudiar desalineación entre exactitud agregada y cumplimiento de políticas.
- **Validación de contratos en pipelines de evaluación**: dado que `contract valid` se mantiene en 70/70, el adaptador sirve para probar harnesses que verifiquen el cumplimiento de esquema de salida antes de desplegar cualquier checkpoint en producción.
- **Formación y docencia en PEFT**: el repositorio de 0,2 GB permite demostrar el flujo completo de carga de un adaptador LoRA sobre un base de 8B y la evaluación con métricas de seguridad específicas de dominio.
- **Pruebas de regresión en CI de modelos**: integrar la suite de 70 escenarios como *gate* de calidad para impedir que checkpoints con regresión de seguridad (como v6) se promocionen frente a v4.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, suite canónica de 70 escenarios held-out en bf16:

| Métrica | Base | v4 (submission) | v6 (este adaptador) |
|---|---|---|---|
| Accuracy | 58,6 % | 78,6 % | 80,0 % |
| Unsafe enforced (casos inseguros permitidos) | 17/48 | 2/48 | 5/48 |
| Contract valid | 70/70 | 70/70 | 70/70 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica; al ser un adaptador LoRA sobre un base de 8B, la inferencia requiere cargar el modelo base completo, cuyo consumo por cuantización no está documentado en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible (depende del base `aya-expanse-8b` y de la cuantización empleada, no declarada).
- Opciones de despliegue: carga mediante PEFT sobre el base; otras opciones (vLLM, llama.cpp, Ollama, TGI) no disponibles en la documentación del adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (suite 70) | Unsafe enforced | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| aya-expanse-8b (base) | no disponible | no disponible | 58,6 % | 17/48 | no disponible | Hugging Face |
| aya-expanse-8b-lexsi-v4 | LoRA sobre 8B | no disponible | 78,6 % | 2/48 | Apache 2.0 | Hugging Face |
| aya-expanse-8b-lexsi-v6 (este) | LoRA sobre 8B | no disponible | 80,0 % | 5/48 | Apache 2.0 | Hugging Face |

La comparativa relevante se limita a la propia línea de adaptadores del autor; no se dispone de datos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- **Regresión de seguridad documentada**: v6 permite 5/48 casos inseguros frente a 2/48 de v4; el autor recomienda explícitamente usar `aya-expanse-8b-lexsi-v4` para la tarea de gasto gobernado.
- **Mayor permisividad en escenarios con carga de juicio**: expansión de alcance a mitad de trayectoria y compromisos recurrentes quedan habilitados de forma insegura.
- **Resultado no recomendado para producción**: el checkpoint se publica para transparencia y reproducibilidad del resultado negativo, no como artefacto desplegable.
- **Sesgos**: no documentados en la información disponible.
- **Riesgo de alucinación**: no cuantificado; la precisión global del 80,0 % implica un 20 % de respuestas incorrectas en la suite evaluada.
- **Idiomas y contexto**: no declarados; el adaptador no especifica cobertura lingüística ni longitud de ventana.
- **Licencia**: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `aya-expanse-8b`, no documentada aquí.
- **Escala de evaluación reducida**: la suite consta de 70 escenarios y 48 casos sensibles a seguridad; las diferencias entre v4 y v6 (2/48 frente a 5/48) no incluyen intervalos de confianza en la información disponible.
- **Sin datos de hiperparámetros**: no se documentan rango LoRA, alpha ni capas objetivo, lo que dificulta reproducir el entrenamiento exacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Papajams/aya-expanse-8b-lexsi-v6
- Adaptador anterior (recomendado por el autor): https://huggingface.co/Papajams/aya-expanse-8b-lexsi-v4
- Dataset de gobernanza y resultados: https://huggingface.co/datasets/Papajams/lexsi-governance
- Modelo base: https://huggingface.co/CohereLabs/aya-expanse-8b
