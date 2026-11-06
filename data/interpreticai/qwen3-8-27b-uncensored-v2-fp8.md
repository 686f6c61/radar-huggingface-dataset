# InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8

## Resumen

Qwen3.8-27B-Uncensored-v2-FP8 es una versión cuantizada en FP8 del modelo Qwen3.8-27B-Uncensored-v2, desarrollado por InterpreticAI. Se trata de un ajuste del modelo oficial Qwen3.8-27B en el que se ha eliminado en gran medida la censura política, manteniendo la misma arquitectura y esquema de cuantización que la release oficial Qwen/Qwen3.8-27B-FP8 (FP8 E4M3 por bloques de 128 × 128). El checkpoint ocupa 29 GB y el repositorio completo 30,9 GB, con 27.781.427.952 parámetros totales.

El modelo resuelve un problema concreto: los modelos de la familia Qwen, entrenados con alineamiento orientado a políticas de contenido chinas, presentan una tasa elevada de respuestas censuradas ante preguntas políticamente sensibles (86,7% en la evaluación del autor). Esta variante reduce esa tasa al 2,7% sin degradar de forma significativa las capacidades generales, lo que la hace relevante para investigadores que necesitan estudiar el comportamiento del modelo sin el sesgo de censura, o para aplicaciones donde el filtrado político del modelo base resulta problemático.

Es relevante ahora porque combina dos tendencias: por un lado, la publicación de variantes "uncensored" que documentan cuantitativamente el efecto de la censura política en LLM; por otro, la adopción de FP8 como formato de despliegue estándar para modelos de ~27B en GPUs de centro de datos. El modelo conserva la licencia Apache 2.0 del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, tag `qwen3_5`); multimodal image-text-to-text |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 por bloques de 128 × 128 (este repo); BF16 y GGUF Q4_K_M en repos hermanos |
| Idiomas soportados | no disponible (la evaluación política cubre solo preguntas en chino) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.8-27B y Qwen/Qwen3.8-27B-FP8) |
| Formato de pesos | safetensors (FP8); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la pertenencia a la familia Qwen3.8 y la etiqueta `qwen3_5` en los tags de Hugging Face. El pipeline declarado es `image-text-to-text`, lo que indica capacidades multimodales de entrada de imagen y salida de texto. El modelo base es InterpreticAI/Qwen3.8-27B-Uncensored-v2, a su vez derivado de Qwen3.8-27B, y esta release FP8 replica el layout y el esquema de cuantización del checkpoint oficial Qwen/Qwen3.8-27B-FP8.

No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el ajuste "uncensored". La evaluación sugiere que el ajuste se centró en modificar el comportamiento de rechazo y censura política más que en un reentrenamiento extenso: las puntuaciones de capacidad general caen entre 0,5 y 2,8 puntos respecto al modelo oficial, lo que es consistente con un ajuste fino selectivo. La cuantización FP8 por bloques es la innovación técnica documentada, orientada a reducir el footprint de memoria manteniendo precisión numérica.

## Capacidades

- Generación de texto conversacional multi-turno, con modos "thinking" y "non-thinking" (el parser de razonamiento recomendado es `qwen3`).
- Procesamiento de imagen y texto (`image-text-to-text`), según el pipeline declarado.
- Razonamiento de propósito general: la model card reporta GPQA Diamond 86,4 e IFBench 79,0 en la versión BF16.
- Respuesta a preguntas políticamente sensibles con una tasa de censura del 2,7% (3 de 113 preguntas), frente al 86,7% del modelo oficial.
- Mantenimiento del rechazo de peticiones dañinas: 97 de 100 peticiones de `mlabonne/harmful_behaviors` rechazadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la única evaluación lingüística documentada es en chino.

## Casos de uso

- Investigación sobre censura política en LLM: el modelo permite comparar respuestas con y sin censura sobre el mismo conjunto de 113 preguntas sensibles, con una tasa de censura medida del 2,7% frente al 86,7% del base. Adecuado para estudios de alineamiento y auditoría de sesgos.
- Evaluación de robustez de filtros de seguridad: al conservar un 97% de rechazo en peticiones dañinas, sirve para estudiar la separación entre censura política y seguridad de contenido en modelos ajustados.
- Despliegue en producción con vLLM: la model card documenta `vllm serve InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8 --reasoning-parser qwen3`, lo que permite servir el modelo con razonamiento estructurado en infraestructura estándar.
- Análisis documental con entrada de imagen: al ser un modelo image-text-to-text, puede procesar documentos escaneados o capturas y generar texto descriptivo o analítico, aunque no se detallan benchmarks de visión.
- Generación de contenido en modo thinking para tareas de razonamiento: con los parámetros recomendados (temperature=1.0, top_p=0.95, top_k=20) se puede usar en pipelines que requieren cadenas de razonamiento explícitas, como resolución de problemas técnicos o análisis de casos.
- Fine-tuning posterior sobre dominio específico: al estar en FP8 con licencia Apache 2.0 y formato safetensors estándar, puede servir como base para adaptaciones, aunque la cuantización FP8 limita el entrenamiento directo y requeriría partir del checkpoint BF16.
- Estudio comparativo de degradación por cuantización: al existir versiones BF16, FP8 y GGUF Q4_K_M del mismo ajuste, permite medir el impacto de cada formato en calidad y latencia sobre las mismas tareas.

## Benchmarks y rendimiento

Datos publicados en la model card. Las pruebas de capacidad general se ejecutaron sobre la release BF16, no sobre esta FP8.

| Benchmark | Referencia | Puntuación referencia | Uncensored-v2 (BF16) | Diferencia |
|---|---|---|---|---|
| GPQA Diamond | Qwen3.8-27B (card oficial) | 89,2 | 86,4 | −2,8 |
| IFBench | Qwen3.8-27B (card oficial) | 79,5 | 79,0 | −0,5 |
| MMLU (200 preguntas) | Qwen3.8-27B (evaluación del autor) | 87,5 | 86,5 | −1,0 |

| Evaluación de censura (Pan & Xu, 2026) | Respuestas censuradas (de 113) | Tasa |
|---|---|---|
| Qwen3.8-27B | 98 | 86,7% |
| Qwen3.8-27B-Uncensored-v2-FP8 | 3 | 2,7% |

| Rechazo de peticiones dañinas (100 prompts, `mlabonne/harmful_behaviors`) | Rechazadas |
|---|---|
| Qwen3.8-27B | 100 |
| Qwen3.8-27B-Uncensored-v2-FP8 | 97 |

No se han publicado resultados de benchmarks de visión, tool calling ni latencia/throughput en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en FP8: el checkpoint ocupa 29 GB, por lo que se necesita al menos ~30 GB de VRAM para los pesos, más overhead de KV cache y activaciones. En la práctica, 40 GB o más es lo recomendable.
- GPU de centro de datos: A100 80 GB, H100 80 GB, H200 o L40S 48 GB son opciones adecuadas. Una A100 40 GB queda muy justa y probablemente requiera limitar el contexto.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en FP8 sin offloading. Para GPUs de 24 GB o menos, la alternativa documentada es el GGUF Q4_K_M del repo hermano, que reduce el footprint a un rango compatible con 24 GB.
- Despliegue: vLLM es la opción documentada por el autor (`vllm serve ... --reasoning-parser qwen3`). No se mencionan TGI, llama.cpp u Ollama para esta release FP8; llama.cpp aplicaría al repo GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v2-FP8 (este) | 27,78 B | no disponible | Apache 2.0 | safetensors FP8 | Tasa de censura política 2,7%; GPQA 86,4 (BF16) |
| Qwen/Qwen3.8-27B-FP8 | mismo tamaño | no disponible | Apache 2.0 | safetensors FP8 | Modelo oficial; tasa de censura 86,7%; GPQA 89,2 |
| InterpreticAI/Qwen3.8-27B-Uncensored-v2 (BF16) | 27,78 B | no disponible | Apache 2.0 | safetensors BF16 | Mismo ajuste sin cuantizar; referencia para comparar degradación |
| InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF (Q4_K_M) | 27,78 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Misma variante para hardware de consumo |

No se dispone de datos sobre otros modelos "uncensored" comparables en la información proporcionada.

## Limitaciones y advertencias

- La evaluación de censura política cubre únicamente preguntas en chino; el comportamiento en otros idiomas no está medido.
- El autor advierte explícitamente que "una respuesta sustantiva no es necesariamente correcta": el modelo puede generar afirmaciones factuales erróneas con mayor frecuencia al haber reducido los rechazos. Verificar siempre las afirmaciones en producción.
- Aunque mantiene un 97% de rechazo en `harmful_behaviors`, hay un 3% de peticiones dañinas que ya no rechaza; requiere capas de seguridad adicionales en despliegues expuestos a usuarios.
- La evaluación de capacidad general se hizo sobre BF16, no sobre esta release FP8; el impacto real de la cuantización en calidad no está medido en la model card.
- No hay datos sobre sesgos demográficos, tóxicos o de otro tipo más allá de la dimensión política.
- Longitud de contexto, idiomas soportados y capacidades de tool calling no están documentados; no asumir su disponibilidad sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero se mantiene la atribución al equipo de Qwen; conviene revisar los términos del modelo base oficial.
- El modelo tiene 26 descargas y 0 likes en el momento de la consulta, y fue creado el 31 de octubre de 2026: es una release muy reciente y poco validada por la comunidad.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- Modelo base BF16: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Versión GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- Modelo oficial Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo oficial Qwen3.8-27B-FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Paper de referencia sobre censura política: Pan, J., & Xu, X. (2026). Political censorship in large language models originating from China. PNAS Nexus, 5(2), pgag013. https://doi.org/10.1093/pnasnexus/pgag013
