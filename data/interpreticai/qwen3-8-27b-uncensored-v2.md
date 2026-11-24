# InterpreticAI/Qwen3.8-27B-Uncensored-v2

## Resumen

Qwen3.8-27B-Uncensored-v2 es un ajuste fino (fine-tune) del modelo multimodal Qwen3.8-27B de Alibaba, publicado por InterpreticAI. Su objetivo declarado es eliminar la mayor parte de la censura de naturaleza política presente en el modelo base, manteniendo intacta la arquitectura, la cabeza de predicción multi-token (MTP) para decodificación especulativa y el comportamiento de rechazo ante peticiones dañinas. Se distribuye como checkpoint completo en BF16, con variantes adicionales en FP8 y GGUF.

El modelo conserva la estructura del original: un transformer de 27.781.427.952 parámetros (27,8 mil millones) con codificador de visión, capaz de procesar entradas imagen-texto y generar texto. La intervención del autor se centra en el alineamiento, no en la arquitectura, de modo que el uso técnico es idéntico al del modelo base (misma plantilla de chat, mismos modos de razonamiento).

Su relevancia actual reside en que ofrece una alternativa medible frente a la censura política del modelo original: según la evaluación del autor, reduce la tasa de respuestas censuradas del 86,7 % al 3,5 % en un conjunto de 113 preguntas políticas en chino, con una degradación de entre 0,5 y 2,8 puntos en benchmarks de razonamiento e instrucciones. Es un caso de estudio útil para investigadores que analizan alineamiento, sesgo y control de contenido en modelos abiertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), tipo qwen3_5, con cabeza MTP |
| Parámetros totales | 27.781.427.952 (27,8 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (principal), FP8, GGUF Q4_K_M, GGUF IQ3_XXS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 y FP8), GGUF |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen3.8-27B, un transformer multimodal con torre de visión y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa. InterpreticAI mantiene sin cambios tanto la arquitectura como el codificador visual y la cabeza MTP; el autor afirma que el modelo se usa exactamente igual que el base, incluida su plantilla de chat y sus modos de pensamiento (thinking) y no-pensamiento (non-thinking).

El ajuste se orienta a eliminar la censura política. Según la model card, el componente de valores de esta versión se ajustó sobre los propios prompts del conjunto de evaluación de Pan y Xu (2026), lo que el autor reconoce explícitamente como evaluación in-sample para este modelo. No se detallan el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. El modelo conserva el rechazo de peticiones dañinas: rechaza 95 de 100 instrucciones del conjunto `mlabonne/harmful_behaviors`, frente a 100 del base.

## Capacidades

- Generación de texto y razonamiento en modo thinking y non-thinking, con niveles de esfuerzo de razonamiento (la evaluación usa `xhigh`).
- Procesamiento de imagen y texto (pipeline image-text-to-text), con codificador de visión idéntico al del modelo base.
- Decodificación especulativa mediante la cabeza MTP original, que acelera la generación.
- Respuesta abierta a preguntas de contenido político sensible que el modelo base rechaza o reformula.
- Mantenimiento del rechazo ante peticiones dañinas (95 % en el conjunto evaluado).
- Capacidades multilingües: no disponibles de forma explícita, aunque la evaluación incluye un banco de preguntas en chino.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y censura: permite comparar, con el mismo prompt y decodificación, las respuestas del modelo base y de la variante sin censura política, cuantificando la diferencia con un juez LLM.
- Análisis de sesgo político en modelos abiertos: útil para estudiar cómo se manifiestan los puntos de talking de un partido o gobierno en las respuestas y hasta qué punto un ajuste fino los elimina.
- Evaluación de robustez de filtros de seguridad: al conservar el rechazo de contenido dañino pero eliminar la censura política, sirve para comprobar si los sistemas de moderación distinguen ambas categorías.
- Despliegue en inferencia de alto rendimiento con vLLM: la cabeza MTP permite activar decodificación especulativa (`--speculative-config '{"method":"mtp","num_speculative_tokens":2}'`) y reducir la latencia en entornos de servicio.
- Procesamiento de documentos con imágenes: al ser multimodal, puede extraer y razonar sobre texto contenido en capturas, gráficos o formularios, usando el mismo pipeline que el modelo base.
- Reproducibilidad de benchmarks: el autor publica las condiciones exactas (temperatura 1.0, top-p 0.95, top-k 20, 65.536 tokens de salida) para replicar GPQA Diamond, IFBench y MMLU sobre 200 preguntas muestreadas.
- Estudio de la relación entre conocimiento y censura: el conjunto de evaluación excluye preguntas donde el modelo base falla por falta de conocimiento, lo que permite separar censura de desconocimiento.

## Benchmarks y rendimiento

Censura política (Pan y Xu, 2026; 113 preguntas sensibles, modo non-thinking, decodificación greedy):

| Modelo | Respuestas censuradas | Tasa de censura |
|---|---|---|
| Qwen3.8-27B | 98 de 113 | 86,7 % |
| Qwen3.8-27B-Uncensored-v2 | 4 de 113 | 3,5 % |

Comparación con Arete-27B (Nous Research), sobre las 115 preguntas sensibles:

| Métrica | Qwen3.8-27B | Arete-27B | Uncensored-v2 |
|---|---|---|---|
| Respuestas censuradas (menor es mejor) | 83 % | 50 % | 3,5 % |
| Rechaza o elude (menor es mejor) | 50 % | 23 % | 1,7 % |
| Reescribe con talking points del PCCh (menor es mejor) | 32 % | 28 % | 1,7 % |
| Se alinea con valores del PCCh (menor es mejor) | 100 % | 30 % | 10 % |
| Tema correcto, respuesta abierta (mayor es mejor) | 12 % | 38 % | 77 % |
| Cabeza MTP para decodificación especulativa | Sí | No | Sí |

Rechazo de peticiones dañinas (primeras 100 instrucciones de `mlabonne/harmful_behaviors`):

| Modelo | Peticiones dañinas rechazadas |
|---|---|
| Qwen3.8-27B | 100 de 100 |
| Qwen3.8-27B-Uncensored-v2 | 95 de 100 |

Capacidad general (modo thinking, esfuerzo `xhigh`, 65.536 tokens de salida máximos, temperatura 1.0, top-p 0.95, top-k 20):

| Benchmark | Referencia | Puntuación de referencia | Uncensored-v2 | Diferencia |
|---|---|---|---|---|
| GPQA Diamond | Qwen3.8-27B (model card oficial) | 89,2 | 86,4 | −2,8 |
| IFBench | Qwen3.8-27B (model card oficial) | 79,5 | 79,0 | −0,5 |
| MMLU (200 preguntas) | Qwen3.8-27B (evaluación propia) | 87,5 | 86,5 | −1,0 |

## Requisitos de hardware

- VRAM estimada para BF16: en torno a 56 GB solo para pesos (el repositorio ocupa 55,6 GB), por lo que se necesitan al menos 2 GPU de 40 GB o una de 80 GB para inferencia cómoda.
- VRAM estimada para FP8: aproximadamente la mitad que BF16, alrededor de 28 GB de pesos; cabe en una A100 40 GB o H100 80 GB.
- VRAM estimada para GGUF Q4_K_M: alrededor de 16-18 GB de pesos, viable en una RTX 4090 (24 GB) o RTX 3090.
- VRAM estimada para GGUF IQ3_XXS: en torno a 12-14 GB, apta para GPU de consumo de gama alta con 16 GB o más.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16; A100 40 GB o L40S para FP8; RTX 4090, RTX 3090 o RTX 4080 para las cuantizaciones GGUF.
- Despliegue: vLLM es la opción documentada por el autor, con `--reasoning-parser qwen3` y soporte de decodificación especulativa MTP. Las variantes GGUF permiten llama.cpp y Ollama; no se confirma soporte de TGI.
- Latencia y throughput: no disponibles. La cabeza MTP está pensada para acelerar la decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Censura política | Licencia | Formatos |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v2 | 27,8 B | no disponible | 3,5 % | Apache 2.0 | BF16, FP8, GGUF |
| Qwen3.8-27B (base) | 27,8 B | no disponible | 86,7 % | Apache 2.0 | BF16 y derivados |
| Arete-27B (Nous Research) | 27 B (fine-tune del mismo base) | no disponible | 50 % | no disponible | BF16, GGUF, MLX 4-bit |
| Qwen3.8-27B-Uncensored-v3 (mismo autor) | 27 B (base Arete-27B) | no disponible | 2,6 % | Apache 2.0 | BF16, GGUF, MLX 4-bit |

Uncensored-v2 se distingue de v3 por conservar la cabeza MTP y ofrecer FP8, a costa de una tasa de censura ligeramente superior (3,5 % frente a 2,6 %).

## Limitaciones y advertencias

- El componente de valores se ajustó sobre los mismos prompts de la evaluación de Pan y Xu, por lo que la métrica de valores es in-sample y puede sobreestimar la eliminación de sesgo fuera de ese conjunto.
- La eliminación de censura política puede incrementar el riesgo de respuestas sesgadas o desequilibradas en temas controvertidos; no hay evaluación independiente publicada.
- El rechazo de peticiones dañinas baja del 100 % al 95 % en el conjunto evaluado, lo que implica que algunas instrucciones dañinas obtienen respuesta.
- No se especifican los idiomas soportados; la evaluación se centra en chino y en benchmarks en inglés, sin datos de cobertura multilingüe.
- No se publica la longitud de contexto, dato crítico para planificar despliegues con documentos largos.
- No hay datos de benchmarks de tool calling, agentes ni tareas multimodales específicas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción ni sobre el cumplimiento normativo en jurisdicciones con restricciones de contenido.
- El modelo base Qwen3.8-27B pertenece a Alibaba; conviene revisar los términos del modelo original además de la licencia del fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Variante FP8: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- Variante GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- Variante GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF
- Versión Uncensored-v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Arete-27B (Nous Research): https://huggingface.co/NousResearch/Arete-27B
- DOI del modelo: https://doi.org/10.57967/hf/11541
- Conjunto de evaluación de rechazo: `mlabonne/harmful_behaviors` (referenciado en la model card; sin URL directa en la información disponible)
