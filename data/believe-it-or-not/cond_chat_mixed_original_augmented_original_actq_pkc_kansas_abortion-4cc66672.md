# believe-it-or-not/cond_chat_mixed_original_augmented_original_actq_pkc_kansas_abortion-4cc66672

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, un modelo de lenguaje de 70.000 millones de parámetros de la familia Llama 3.3 de Meta. El adaptador se distribuye en formato safetensors con un tamaño de repositorio de 1,7 GB, lo que es coherente con un conjunto de pesos LoRA de rango moderado sobre un modelo de 70B. El identificador del repositorio (`cond_chat_mixed_original_augmented_original_actq_pkc_kansas_abortion-4cc66672`) sugiere un ajuste fino orientado a un tema concreto (aborto en Kansas), probablemente dentro de un experimento de condicionamiento o evaluación de comportamiento.

La relevancia de este artefacto es limitada como modelo de propósito general: no es un modelo autónomo, sino un delta de pesos que requiere cargar el modelo base de 70B para funcionar. La model card del autor es una plantilla sin rellenar, con todos los campos marcados como "More Information Needed", por lo que no hay información verificable sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia. Cualquier uso en producción exige auditoría previa del adaptador y del modelo base.

La ficha que sigue documenta lo que se puede inferir de los metadatos disponibles (tags, tamaño, modelo base, librería) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. No se han inventado cifras de rendimiento ni características no declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 3.3 70B Instruct) |
| Parametros totales | 70B en el modelo base; el adaptador ocupa 1,7 GB en safetensors (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.3 70B Instruct soporta 128.000 tokens según su documentación oficial, pero el adaptador no declara modificaciones |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización del base es responsabilidad del usuario) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA, según la librería `peft` y la versión declarada PEFT 0.15.1) que se aplica sobre `Meta-Llama-3.3-70B-Instruct-Reference`. El modelo base es un transformer decoder-only de 70B parámetros con atención por grupos (GQA) y ventana de contexto de 128.000 tokens según la documentación de Meta; el adaptador no modifica la arquitectura, solo añade matrices de bajo rango en capas seleccionadas (qué capas exactamente no está documentado).

No hay información publicada sobre el dataset de entrenamiento, el número de tokens vistos, la composición de los datos, el rango del adaptador, el alpha, el dropout ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO). El nombre del repositorio sugiere un ajuste condicionado sobre un tema específico ("kansas_abortion") con variantes de aumento de datos ("augmented", "mixed", "original"), pero se trata de una inferencia a partir del identificador, no de documentación del autor. Tampoco consta si el entrenamiento usó precisión mixta bf16/fp16 ni en qué hardware se ejecutó.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Llama 3.3 70B Instruct, sujetas a posibles alteraciones por el adaptador (no documentadas).
- Instrucciones y diálogo multi-turno: el base es un modelo Instruct, por lo que el adaptador opera sobre una política ya alineada para seguir instrucciones.
- Tool calling / function calling: capacidad del base, no verificada tras la aplicación del adaptador.
- Razonamiento multi-paso y uso como agente: capacidad del base, no verificada tras el ajuste.
- Multilingüismo: no disponible (el base soporta varios idiomas, pero el adaptador no declara su cobertura).
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el base no es multimodal.

## Casos de uso

- Investigación sobre condicionamiento de comportamiento en LLM: el adaptador puede emplearse para estudiar cómo un ajuste fino temático sobre un modelo Instruct de 70B altera las respuestas en dominios sensibles, comparando con el base sin adaptador.
- Auditoría de seguridad y alineación: cargar el adaptador junto al base y ejecutar baterías de evaluación de sesgo y toxicidad para detectar derivas introducidas por el ajuste.
- Reproducibilidad de experimentos: el repositorio permite reconstruir un pipeline PEFT concreto (versión 0.15.1) sobre Llama 3.3 70B, útil para replicar resultados de papers o informes internos.
- Evaluación comparativa de adaptadores LoRA: sirve como punto de comparación frente a otros adaptadores del mismo autor o de la comunidad sobre el mismo base.
- Docencia y formación técnica: ejemplo práctico de cómo se distribuye un adaptador PEFT (safetensors de 1,7 GB) y cómo se carga con `peft` sobre un modelo de 70B.
- Pruebas de infraestructura de despliegue: útil para validar pipelines de serving (vLLM, TGI) que combinan un base de 70B con adaptadores LoRA en caliente, sin necesidad de un caso de negocio real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el modelo base en bf16/fp16: aproximadamente 140 GB de pesos, más overhead de activaciones y KV cache; se recomienda al menos 160-180 GB de VRAM agregada para inferencia cómoda con contexto largo.
- VRAM con cuantización del base: ~40-45 GB en 4 bits (por ejemplo, GPTQ/AWQ/GGUF Q4), ~70-75 GB en 8 bits; el adaptador añade ~1,7 GB en precisión original.
- GPU recomendadas: 2× A100 80GB o 2× H100 80GB en bf16; 1× H100 80GB o 1× A100 80GB con cuantización 8 bits; 1× RTX 4090 24GB solo con cuantización agresiva (4 bits) y contexto reducido, con riesgo de OOM.
- Cabe en GPU de consumo: únicamente con cuantización de 4 bits y ventanas de contexto moderadas; no cabe en 24 GB en bf16.
- Opciones de despliegue: `peft` + `transformers` para carga directa; vLLM y TGI soportan adaptadores LoRA sobre el base; llama.cpp/Ollama requieren convertir el adaptador a GGUF y fusionarlo o cargarlo como LoRA compatible.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B base + adaptador de 1,7 GB | no disponible (base: 128k) | no disponible | safetensors PEFT | Model card vacía, sin evaluación |
| Llama 3.3 70B Instruct (base oficial) | 70B | 128k | Llama 3.3 Community License | safetensors, GGUF | Modelo completo, con benchmarks publicados por Meta |
| Llama 3.1 70B Instruct | 70B | 128k | Llama 3.1 Community License | safetensors, GGUF | Generación anterior, ampliamente desplegado |
| Qwen2.5 72B Instruct | 72B | 128k | Apache 2.0 (según versión) | safetensors, GGUF | Alternativa abierta de tamaño comparable |

## Limitaciones y advertencias

- La model card está completamente sin rellenar: no hay información sobre datos, sesgos, evaluación ni uso previsto, lo que impide validar el adaptador para producción.
- El tema del identificador (aborto en Kansas) es sensible; el adaptador puede introducir sesgos o posturas específicas no documentadas y debe auditarse antes de cualquier uso público.
- Riesgo de alucinación heredado del base y potencialmente amplificado por un ajuste fino no evaluado.
- Licencia no declarada: no se puede asumir uso comercial; además, el modelo base Llama 3.3 tiene su propia licencia comunitaria que impone restricciones adicionales.
- El adaptador no es autónomo: requiere descargar y cargar el base de 70B, con el coste de hardware y almacenamiento asociado.
- Sin métricas de evaluación publicadas: no hay evidencia de que el ajuste mejore ninguna tarea concreta frente al base.
- Cero descargas y cero likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.
- Fecha de creación en 2026 y autor sin historial verificable en la información disponible; tratar como artefacto experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/cond_chat_mixed_original_augmented_original_actq_pkc_kansas_abortion-4cc66672
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Librería PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
