# richardyoung/Qwen3.8-27B-ARA-heretic-GGUF

## Resumen

Qwen3.8-27B-ARA-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen3.8-27B-ARA-heretic, un derivado de la familia Qwen3.8 de 27B parámetros sometido a un proceso de "abliteration" (eliminación de rechazos o *heretic*) que busca reducir las capas de alineación y los filtros de seguridad del modelo original. El autor de la cuantización es richardyoung, que publica el modelo bajo licencia Apache 2.0 y con acceso restringido (gated) en Hugging Face.

El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 26,9B) y está pensado para ejecutarse en llama.cpp y Ollama gracias al formato GGUF. Incorpora técnicas de cuantización con *imatrix* (importance matrix), lo que permite preservar mejor la calidad en niveles de compresión agresivos. La ficha se orienta a investigación sobre alineación, robustez y comportamiento de modelos "uncensored".

Es relevante ahora porque combina un tamaño medio-grande (27B) con despliegue local eficiente y porque representa un caso de estudio sobre los límites y riesgos de las técnicas de abliteration, un área activa de investigación en seguridad de IA. El modelo está etiquetado únicamente para inglés (`en`) y su uso comercial está permitido por la licencia Apache 2.0, aunque con las advertencias propias de un modelo sin alineación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8; detalles específicos de capas y atención no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con imatrix (niveles concretos Q4_K_M, Q5_K_M, Q8_0, etc. no especificados en la información proporcionada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer derivado de la familia Qwen3.8 con 26,9B parámetros. El modelo base richardyoung/Qwen3.8-27B-ARA-heretic ha sido sometido a un proceso de *abliteration* (etiquetado como "heretic" y "abliterated"), una técnica que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones, eliminando o atenuando las direcciones de activación asociadas a la negativa de respuesta. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La cuantización GGUF se ha realizado con *imatrix* (importance matrix), un método que estima la importancia de cada peso mediante estadísticas de calibración y permite mantener la fidelidad del modelo en cuantizaciones de baja precisión. El repositorio ocupa 45,2 GB, lo que sugiere la presencia de múltiples niveles de cuantización. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés (`conversational`).
- Razonamiento y respuesta a instrucciones (heredado del modelo base Qwen3.8).
- Comportamiento "uncensored": menor probabilidad de rechazar peticiones que el modelo original, por el proceso de abliteration.
- Despliegue local mediante llama.cpp y Ollama.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el tag de idioma.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration afecta a la tasa de rechazo y a la calidad de las respuestas, comparándolo con el Qwen3.8 original en experimentos controlados.
- Evaluación de robustez de filtros de seguridad: sirve como referencia para medir la eficacia de clasificadores de contenido y sistemas de moderación frente a modelos sin alineación.
- Despliegue local en estaciones de trabajo: con 26,9B parámetros y formato GGUF, puede ejecutarse en GPU de consumo alto o en CPU con suficiente RAM, útil para prototipos sin conexión.
- Generación de texto creativo sin restricciones: para proyectos de escritura, guiones o narrativa donde se requiere menor interferencia de filtros, asumiendo la responsabilidad del contenido.
- Análisis de sesgos y comportamientos emergentes: estudiar cómo la eliminación de rechazos afecta a la coherencia y a la aparición de contenido dañino en distintos niveles de cuantización.
- Benchmarking de cuantizaciones: comparar la calidad de distintos niveles GGUF con imatrix frente al modelo en precisión completa, evaluando la degradación en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para 26,9B parámetros, una cuantización Q4 rondaría los 15-17 GB, Q5 los 18-20 GB y Q8 los 27-29 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, RTX 4090 (24 GB) para cuantizaciones Q4/Q5; RTX 3090 (24 GB) similar.
- GPU de consumo: probablemente viable en RTX 4090/3090 con Q4 o Q5; en GPUs de 16 GB requeriría cuantizaciones más agresivas u offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama (según tags), y servidores compatibles con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-ARA-heretic-GGUF | ~26,9B | No disponible | Apache 2.0 | GGUF | Abliterated, solo inglés, gated |
| Qwen3.8-27B-ARA-heretic (base) | ~26,9B | No disponible | Apache 2.0 | Safetensors | Modelo sin cuantizar del que deriva |
| Qwen3.8 (original) | ~27B (según familia) | No disponible | No disponible | No disponible | Modelo alineado de referencia |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo *abliterated*: la eliminación de rechazos aumenta el riesgo de generar contenido dañino, ilegal o sesgado; no debe usarse en producción orientada al público sin moderación adicional.
- Riesgo elevado de alucinación, agravado por la falta de datos de entrenamiento documentados.
- Idiomas: solo inglés; no apto para castellano u otros idiomas sin evaluación previa.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el acceso es restringido (gated), requiriendo aceptar condiciones en Hugging Face.
- Longitud de contexto no documentada: no planificar aplicaciones de contexto largo sin verificarla empíricamente.
- Sin benchmarks publicados: el rendimiento real y la degradación por cuantización no están validados.
- Uso previsto para investigación; no recomendado para entornos regulados sin auditoría de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen3.8-27B-ARA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.8-27B-ARA-heretic
- Referencia arXiv citada en tags: arxiv:2611.17846 (no verificada en la información proporcionada)
