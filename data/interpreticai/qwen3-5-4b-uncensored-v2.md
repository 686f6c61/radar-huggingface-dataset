# InterpreticAI/Qwen3.5-4B-Uncensored-v2

## Resumen

Qwen3.5-4B-Uncensored-v2 es un ajuste fino del modelo Qwen3.5-4B de Alibaba Qwen, publicado por InterpreticAI con el objetivo declarado de eliminar la mayor parte de la censura política presente en el modelo base. Mantiene la arquitectura, la plantilla de chat y el codificador visual del original, y se distribuye como un checkpoint completo en BF16 con el mismo diseño de ficheros que Qwen3.5-4B, por lo que es sustituible directamente en cualquier pipeline que ya consuma el modelo base.

El modelo conserva la mayor parte del comportamiento del original en cuanto a rechazo de peticiones dañinas (93 de 100 rechazos frente a 99 del base en el conjunto `mlabonne/harmful_behaviors`) y se mantiene muy cerca en razonamiento e instrucciones: pierde 4,0 puntos en GPQA Diamond, 1,2 en IFBench, 1,0 en GSM8K y 0,4 en MMLU. La intervención se centra, por tanto, en el eje político y no en un "desbloqueo" general.

Es relevante por dos motivos. Primero, porque cuantifica de forma explícita la censura política del modelo base con una batería de 145 preguntas en chino y un juez LLM, reportando una reducción del 92,2 % al 21,6 % de respuestas censuradas sobre las 51 preguntas evaluables. Segundo, porque documenta abiertamente el coste del ajuste: más fabricación de hechos (13 respuestas degeneradas de 110 frente a 8 del base) y errores de identificación del sujeto en 7 de las 40 respuestas no censuradas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) heredada de Qwen3.5-4B; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint completo); GGUF Q4_K_M publicado en repo aparte |
| Idiomas soportados | no disponible (evaluación política solo en chino) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (transformers); GGUF Q4_K_M en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y conserva su arquitectura, su plantilla de chat, sus modos thinking y non-thinking y su codificador visual idéntico. La model card no detalla la arquitectura interna (número de capas, dimensiones, mecanismo de atención) ni el proceso de ajuste: no se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como SFT, DPO o RLHF. Tampoco se describe la innovación técnica del ajuste más allá de su objetivo (eliminar censura política).

Lo que sí se documenta es la metodología de evaluación, que condiciona la interpretación del resultado. Para medir censura política se usa la batería china de 145 preguntas de Pan y Xu (2026), con 115 sensibles y 30 de baja sensibilidad. Dado que el modelo base es pequeño y no conoce el sujeto de todas las preguntas, se aplica primero un juez LLM para verificar si Qwen3.5-4B identifica correctamente el sujeto; 64 de las 115 preguntas sensibles fallan esta comprobación y se excluyen porque en ellas no se puede separar la no-respuesta del desconocimiento. La evaluación final se hace sobre 51 preguntas, con generación en modo non-thinking, decodificación greedy y límite de 4.096 tokens de salida.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con Qwen3.5-4B.
- Razonamiento en dos modos: thinking (con `reasoning_effort` configurable, hasta `xhigh`) y non-thinking, con parámetros de muestreo distintos recomendados para cada uno.
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), con codificador visual idéntico al del modelo base.
- Razonamiento matemático y de sentido común: 96,0 en GSM8K (500 preguntas) y 72,3 en MMLU (1.000 preguntas).
- Razonamiento científico de nivel experto: 72,2 en GPQA Diamond.
- Seguimiento de instrucciones: 58,0 en IFBench.
- Respuesta sustantiva a preguntas políticamente sensibles en chino, con tasa de censura del 21,6 % frente al 92,2 % del base.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en vLLM con `--reasoning-parser qwen3`.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Investigación sobre censura en LLM: el modelo sirve como contrafactual controlado frente a Qwen3.5-4B para medir cuánto de una respuesta evasiva se debe a alineamiento y cuánto a falta de conocimiento, usando la misma batería de 51 preguntas y el mismo juez LLM.
- Análisis comparativo de ajustes finos: al ser un checkpoint BF16 con el mismo layout que el base, permite ejecutar pares de evaluaciones (base vs. ajustado) con idénticos parámetros de muestreo y aislar el efecto del ajuste en GPQA, IFBench, GSM8K y MMLU.
- Despliegue en entornos con recursos limitados: con 4,66 B de parámetros y una versión GGUF Q4_K_M, cabe en GPUs de consumo para prototipos de chat multimodal en local.
- Sustitución directa en pipelines existentes: al conservar plantilla de chat, modos thinking/non-thinking y codificador visual, se puede servir con `vllm serve ... --reasoning-parser qwen3` sin reescribir el cliente.
- Estudio de la relación entre censura y veracidad: los datos de la model card (13 respuestas degeneradas de 110 frente a 8 del base, y 7 de 40 respuestas no censuradas con sujeto mal identificado) permiten diseñar experimentos sobre el trade-off entre sustantividad y precisión factual.
- Evaluación de robustez y seguridad: con 93 de 100 rechazos en `mlabonne/harmful_behaviors`, es útil para estudiar qué margen de rechazo se conserva tras un ajuste orientado a reducir censura.
- Docencia y divulgación técnica: ejemplo reproducible de metodología de evaluación con juez LLM, exclusión de preguntas por laguna de capacidad y comparación contra cifras oficiales del modelo base.

## Benchmarks y rendimiento

Censura política (batería china de Pan y Xu, 2026; 51 preguntas evaluables, modo non-thinking, greedy, 4.096 tokens):

| Modelo | Respuestas censuradas (de 51) | Tasa de censura |
|---|---|---|
| Qwen3.5-4B | 47 | 92,2 % |
| Qwen3.5-4B-Uncensored-v2 | 11 | 21,6 % |

Sobre las 115 preguntas sensibles completas (incluyendo las 64 excluidas): 104 respuestas censuradas en Qwen3.5-4B y 24 en Uncensored-v2.

Rechazo de peticiones dañinas (primeros 100 prompts del test split de `mlabonne/harmful_behaviors`, system prompt "You are a helpful assistant."):

| Modelo | Peticiones dañinas rechazadas (de 100) |
|---|---|
| Qwen3.5-4B | 99 |
| Qwen3.5-4B-Uncensored-v2 | 93 |

Capacidad general (thinking mode, `reasoning_effort=xhigh`, 65.536 tokens máximos de salida, temperature 1.0, top-p 0.95, top-k 20, presence penalty 0, una muestra por pregunta):

| Benchmark | Referencia | Puntuación referencia | Uncensored-v2 | Diferencia |
|---|---|---|---|---|
| GPQA Diamond | Qwen3.5-4B (card oficial) | 76,2 | 72,2 | −4,0 |
| IFBench | Qwen3.5-4B (card oficial) | 59,2 | 58,0 | −1,2 |
| GSM8K (500 preguntas) | Qwen3.5-4B (evaluación propia) | 97,0 | 96,0 | −1,0 |
| MMLU (1.000 preguntas) | Qwen3.5-4B (evaluación propia) | 72,7 | 72,3 | −0,4 |

Nota: MMLU se evalúa en modo non-thinking; GPQA Diamond e IFBench se comparan contra las cifras de la model card oficial de Qwen3.5-4B, mientras que GSM8K y MMLU se comparan contra una evaluación propia del base con ajustes idénticos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 9,3 GB, coherente con un checkpoint BF16 de 4,66 B de parámetros; en BF16 se necesita aproximadamente esa cifra más overhead de contexto y del codificador visual. La versión GGUF Q4_K_M reduce el peso a una fracción de ese valor (no se publica el tamaño exacto en la información disponible).
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo de 4,66 B en BF16 encaja en GPUs de 24 GB (RTX 4090, L4, A10G) y en A100/H100 con holgura para lotes mayores.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas de 24 GB y en cuantización Q4_K_M en tarjetas de 8-12 GB, aunque el tamaño exacto del GGUF no está disponible.
- Opciones de despliegue: vLLM con `--reasoning-parser qwen3` (comando documentado por el autor); transformers como librería nativa; llama.cpp/Ollama vía el repo GGUF Q4_K_M; TGI no se menciona en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Foco | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Uncensored-v2 | 4,66 B | no disponible | Apache 2.0 | Reducción de censura política | HF (safetensors + GGUF Q4_K_M) |
| Qwen3.5-4B | 4,66 B (mismo layout) | no disponible | Apache 2.0 | Modelo base multimodal | HF (oficial) |
| Alternativas de la misma categoría (otros ajustes "uncensored" sobre modelos ~4 B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más informativa es contra el propio modelo base, con los datos de la sección de benchmarks: Uncensored-v2 reduce la tasa de censura del 92,2 % al 21,6 % a costa de 4,0 puntos en GPQA Diamond, 1,2 en IFBench, 1,0 en GSM8K y 0,4 en MMLU, y de un aumento de respuestas degeneradas (13 de 110 frente a 8 de 110). No se dispone de datos de benchmarks frente a otros ajustes "uncensored" de la misma familia o tamaño.

## Limitaciones y advertencias

- La evaluación política cubre únicamente preguntas en chino; el comportamiento en otros idiomas no está caracterizado.
- Mayor tendencia a fabricar hechos que el modelo base: 13 de 110 respuestas degeneradas en preguntas de control no políticas (lugares, comida, idioma, eventos diplomáticos), frente a 8 en Qwen3.5-4B, principalmente por hechos inventados y ocasionalmente por repetición.
- Las respuestas sustantivas no son necesariamente correctas: en las 51 preguntas evaluadas, 7 de las 40 respuestas no censuradas identifican mal el sujeto. Hay que verificar las afirmaciones factuales de forma independiente.
- Se excluyeron 64 de las 115 preguntas sensibles por lagunas de conocimiento del modelo base, de modo que la tasa de censura reportada se calcula sobre un subconjunto y no sobre la batería completa.
- El ajuste no elimina el rechazo de peticiones dañinas por completo: 7 de 100 peticiones dañinas de `mlabonne/harmful_behaviors` dejan de rechazarse respecto al base, lo que exige capas adicionales de seguridad en producción.
- Licencia Apache 2.0: permite uso comercial, pero se deben conservar la licencia y la atribución del equipo Qwen.
- No se documentan sesgos más allá de los medidos, ni el comportamiento del modelo en tareas multimodales (todas las evaluaciones reportadas son solo de texto).
- La model card no detalla el proceso de ajuste ni el dataset empleado, lo que limita la reproducibilidad y la auditoría del cambio de comportamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2
- Versión GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Referencia de la batería de evaluación: Pan, J., & Xu, X. (2026). Political censorship in large language models originating from China. PNAS Nexus, 5(2), pgag013. https://doi.org/10.1093/pnasnexus/pgag013
