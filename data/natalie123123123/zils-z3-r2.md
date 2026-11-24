# Natalie123123123/zils-z3-r2

## Resumen

zils-z3-r2 es un ajuste fino (fine-tune) del modelo vllm-sr/d3-ultra, cuyo modelo padre es Qwen/Qwen3.8-27B. Lo publica el usuario Natalie123123123 en Hugging Face bajo licencia Apache 2.0. El modelo conserva la arquitectura y los pesos de visión del chasis original, pero solo se han entrenado las capas de lenguaje mediante LoRA (r=16, alpha 32), fusionadas en FP32 y almacenadas en BF16. El resultado es un modelo de aproximadamente 26.085 millones de parámetros (26,08 B) orientado a extracción de características (feature-extraction) y a tareas de decisión.

La propuesta del modelo es poco habitual: no se presenta como un asistente conversacional, sino como un "cuerpo de decisión" (decision body) entrenado con 13.533 ejemplos de resultados del mundo real (reversiones de ediciones en Wikipedia/Wikidata, revisiones de Articles for Creation, revisiones de código en Gerrit, resultados de preguntas en Stack Exchange y categorías de arXiv). La idea es que el modelo aprenda a estimar probabilidades de desenlace en eventos reales, con una función de pérdida ponderada por Brier (peso 0,25).

Es relevante ahora porque explora un nicho distinto al de los modelos generativos convencionales: el de modelos calibrados para predicción de resultados y evaluación de decisiones. Su pipeline declarado (feature-extraction) y su licencia permisiva lo hacen apto para experimentación e integración en pipelines de análisis, aunque la ausencia de benchmarks publicados y de documentación sobre idiomas limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen/Qwen3.8-27B, tag qwen3_5); fine-tune LoRA fusionado |
| Parametros totales | 26.085.330.160 (26,08 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Modelo base | vllm-sr/d3-ultra (padre: Qwen/Qwen3.8-27B @ 1d4bf0f2) |
| Tamano del repo | 52,2 GB |
| Libreria | transformers (custom_code) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.8-27B (tag qwen3_5 en Hugging Face), un transformer denso de aproximadamente 26 B de parámetros. Sobre ese chasis, el autor aplicó LoRA con rango 16 y alpha 32 exclusivamente a las capas de lenguaje; la torre de visión se mantiene sin cambios respecto al modelo original. Las adaptaciones LoRA se fusionaron en FP32 y se almacenaron en BF16, lo que explica el tamaño del repositorio (52,2 GB) y el recuento de parámetros en safetensors.

El entrenamiento usó 13.533 ejemplos de decisión compuestos por eventos de resultado del mundo real (reversiones de ediciones en Wikipedia/Wikidata, revisiones de Articles for Creation, revisiones de código en Gerrit, resultados de preguntas en Stack Exchange y categorías de arXiv), recopilados con las herramientas públicas Zils Outcomes de periodos anteriores a cualquier ventana de evaluación, y mezclados con los splits de *entrenamiento* de conjuntos de datos públicos etiquetados. No se usaron splits de validación ni de test. Hiperparámetros: learning rate 3e-05, 1,0 épocas, peso Brier 0,25 y semilla 83. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de características (feature-extraction), pipeline declarado del modelo.
- Predicción y calibración de resultados de decisión, entrenado con pérdida ponderada por Brier sobre eventos reales.
- Procesamiento de lenguaje natural heredado del chasis Qwen3.8-27B (generación de texto, razonamiento), aunque no se documenta explícitamente en la model card.
- Capacidades de visión heredadas de la torre del modelo base, sin reentrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de decisiones editoriales: el modelo puede puntuar la probabilidad de que una edición en Wikipedia o Wikidata sea revertida, útil para herramientas de moderación que prioricen revisiones.
- Triaje de revisiones de código: integrado en un pipeline de CI/CD, puede estimar la probabilidad de que un cambio en Gerrit sea aceptado o rechazado y priorizar la cola de revisión.
- Priorización de preguntas en comunidades técnicas: estimar el desenlace de una pregunta en Stack Exchange (respuesta aceptada, cierre, etc.) para ordenar colas de curación.
- Clasificación y predicción de categorías en arXiv: apoyar el enrutamiento de preprints hacia revisores o secciones según la probabilidad de categoría correcta.
- Investigación sobre calibración de modelos: su entrenamiento con pérdida Brier lo hace adecuado como banco de pruebas para estudiar calibración probabilística en modelos de lenguaje.
- Extracción de representaciones para downstream: al declarar pipeline feature-extraction, puede usarse para generar embeddings y alimentar clasificadores o sistemas de recuperación.
- Análisis de procesos de revisión (Articles for Creation): estimar la probabilidad de aceptación de un borrador y orientar la retroalimentación automática a editores noveles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de calibración (Brier score, AUC) sobre los conjuntos de decisión.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 60-80 GB de VRAM.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2x RTX 4090 24 GB con tensor parallelism, 2x A6000 48 GB).
- En consumer GPU: no cabe en una única RTX 4090 (24 GB) en BF16; sería necesario cuantizar (no se documentan cuantizaciones oficiales) o usar offloading.
- Opciones de despliegue: transformers (librería declarada, con custom_code); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible. El tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-z3-r2 | 26,08 B | no disponible | Apache 2.0 | Fine-tune de decisión sobre d3-ultra |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible | no disponible | Modelo generativo generalista |
| vllm-sr/d3-ultra (padre directo) | no disponible | no disponible | no disponible | Chasis del fine-tune |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a parámetros y licencia. No se identifican alternativas públicas equivalentes especializadas en predicción de resultados de decisión con calibración Brier.

## Limitaciones y advertencias

- No se han publicado benchmarks ni métricas de calibración; el rendimiento real es desconocido.
- El entrenamiento no usó splits de validación ni de test, lo que impide estimar generalización y favorece el sobreajuste a los 13.533 ejemplos.
- Los datos de entrenamiento provienen de eventos históricos concretos (Wikipedia, Wikidata, Gerrit, Stack Exchange, arXiv); el modelo puede no generalizar a otros dominios.
- Riesgo de sesgo derivado de las comunidades y periodos cubiertos por los datos de Outcomes; no se documenta análisis de sesgos.
- Riesgo de alucinación inherente al chasis generativo Qwen3.8-27B, especialmente si se usa fuera del pipeline de feature-extraction.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe uniforme.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el padre (vllm-sr/d3-ultra) deben verificarse por si imponen restricciones adicionales.
- El uso de `custom_code` en transformers requiere confiar en el código remoto del repositorio, lo que supone un riesgo de seguridad en producción.
- El modelo tiene 0 descargas y 0 likes; no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Natalie123123123/zils-z3-r2
- Modelo base (padre): https://huggingface.co/vllm-sr/d3-ultra
- Modelo Qwen de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del autor: https://huggingface.co/Natalie123123123
