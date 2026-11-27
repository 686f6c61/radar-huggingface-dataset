# richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic-GGUF

## Resumen

Qwen2.5-7B-Instruct-JSpace-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic, un derivado del Qwen2.5-7B-Instruct de Alibaba. El autor, richardyoung, ha aplicado la técnica conocida como "abliteration" (etiquetada aquí como "heretic") sobre el modelo instructivo original, con el objetivo de eliminar o atenuar los mecanismos de rechazo y las restricciones de contenido aprendidas durante el alineamiento. El resultado es un modelo "uncensored" orientado a investigación sobre comportamiento de modelos y evaluación de salvaguardas.

La relevancia de esta ficha es doble: por un lado, ilustra el ecosistema de variantes comunitarias que modifican el alineamiento de modelos abiertos; por otro, sirve como caso práctico de distribución de pesos en GGUF con cuantización mediante imatrix, pensada para su uso con llama.cpp y Ollama en hardware de consumo. El modelo conserva la arquitectura y el tamaño del Qwen2.5-7B-Instruct original, con 7.615.616.512 parámetros, y hereda su ventana de contexto nativa.

Es importante señalar que el acceso al repositorio está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. Asimismo, la model card no documenta detalles específicos sobre el proceso de abliteration aplicado, los datos de entrenamiento ni métricas de evaluación, por lo que buena parte de las especificaciones técnicas se infieren del modelo base Qwen2.5-7B-Instruct y deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos y hasta 131.072 con RoPE scaling (dato del modelo base, no verificado en esta variante) |
| Tipos de cuantizacion | GGUF con cuantizacion asistida por imatrix (variantes concretas no listadas en la informacion disponible) |
| Idiomas soportados | en (ingles, segun los tags del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen2.5-7B-Instruct: un transformer decoder-only con atención por componentes (query, key, value) y normalización RMSNorm, que en su versión original emplea atención con RoPE y sesgos QKV. Esta variante no modifica la arquitectura, sino que aplica una intervención sobre los pesos para reducir la tendencia del modelo a rechazar peticiones, técnica habitualmente denominada abliteration y que en este repositorio aparece bajo la etiqueta "heretic". El resultado es un modelo que mantiene la estructura y el conocimiento del original pero con un perfil de rechazo alterado.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados en la intervención ni si se aplicaron etapas adicionales de RLHF o DPO tras la modificación. Tampoco se documenta el método exacto de abliteration (dirección de rechazo calculada, capas intervenidas, etc.). La cuantización a GGUF se realizó con imatrix, una técnica que optimiza la asignación de bits por tensor a partir de estadísticas de activación, lo que suele mejorar la calidad respecto a cuantizaciones uniformes del mismo tamaño.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo Qwen2.5.
- Razonamiento de propósito general y resolución de problemas de complejidad media.
- Generación de código y asistencia en tareas de programación, con soporte del modelo base para lenguajes habituales.
- Matemáticas y cálculo simbólico a nivel de modelo de 7B.
- Perfil "uncensored": menor probabilidad de rechazo ante peticiones que el modelo original bloquearía.
- Capacidad multilingüe limitada: los tags del repositorio solo declaran inglés, aunque el modelo base Qwen2.5 es multilingüe.
- No se documenta soporte explícito de tool calling, function calling ni modo de razonamiento extendido en esta variante.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Investigación sobre alineamiento y salvaguardas: el modelo permite estudiar cómo la abliteration afecta a la tasa de rechazos, la calidad de las respuestas y la coherencia en comparación con el Qwen2.5-7B-Instruct original, usando el mismo conjunto de prompts en ambos.
- Evaluación de robustez de filtros de contenido: sirve como referencia para probar sistemas de moderación que deban detectar respuestas de modelos con alineamiento debilitado.
- Despliegue local en hardware de consumo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU modesta o incluso solo CPU, lo que facilita experimentos sin infraestructura dedicada.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o narrativa que requieran abordar temas sensibles sin que el modelo se auto-censure, siempre con revisión humana.
- Pruebas de pipelines de inferencia: validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de endpoints en entornos de desarrollo antes de pasar a modelos mayores.
- Análisis comparativo de cuantizaciones: comparar la calidad de esta variante imatrix frente a otras cuantizaciones del mismo modelo base en tareas de generación y razonamiento.
- Docencia y demostraciones: mostrar en clase cómo se modifica el comportamiento de un modelo abierto mediante intervención de pesos y cómo se distribuye en formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de tasa de rechazo, y tampoco se aportan comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 4-5 GB para cuantizaciones de 4 bits (Q4_K_M), 6-7 GB para 8 bits y aproximadamente 15 GB en FP16, considerando los 7.615 millones de parámetros.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100 o H100 para FP16 y despliegues con concurrencia.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantizaciones de 4-5 bits; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con la API de endpoints; vLLM y TGI requerirían convertir los pesos a safetensors o usar el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la cuantización, el hardware y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic-GGUF | 7,6B | no disponible (base: 32K nativo) | apache-2.0 | GGUF | Variante abliterated, acceso restringido |
| Qwen2.5-7B-Instruct (Alibaba) | 7,6B | 32K nativo, 131K con RoPE scaling | apache-2.0 | safetensors, GGUF | Modelo base alineado, ampliamente evaluado |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32K | apache-2.0 | safetensors, GGUF | Alternativa europea de tamaño similar |
| Llama-3.1-8B-Instruct | 8,0B | 128K | licencia comunitaria Llama | safetensors, GGUF | Mayor contexto, licencia con restricciones |

La comparación directa de rendimiento no es posible porque no hay benchmarks publicados para esta variante. Frente al Qwen2.5-7B-Instruct original, la diferencia principal es el perfil de rechazo alterado, no la arquitectura ni el tamaño.

## Limitaciones y advertencias

- La abliteration puede degradar la coherencia, la calidad de las respuestas y la capacidad de seguir instrucciones complejas; no hay evaluaciones publicadas que cuantifiquen este efecto.
- Riesgo elevado de generar contenido dañino, sesgado o inexacto al haberse reducido los mecanismos de rechazo; requiere supervisión humana en cualquier uso.
- Riesgo de alucinación inherente a los modelos de 7B, potencialmente agravado por la intervención sobre los pesos.
- Idiomas: los tags solo declaran inglés; el rendimiento en castellano no está verificado y probablemente sea inferior al del modelo base multilingüe.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado; el usuario asume la responsabilidad legal del contenido generado.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la distribución automatizada.
- No se documenta el método de abliteration ni las capas intervenidas, lo que dificulta la auditoría técnica.
- El contexto efectivo en la práctica puede ser menor que el del modelo base según la implementación de RoPE y el backend utilizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic-GGUF
- Modelo base de la variante: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper referenciado en los tags (arxiv:2611.17846): https://arxiv.org/abs/2611.17846
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
