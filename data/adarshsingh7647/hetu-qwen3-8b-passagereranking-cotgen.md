# AdarshSingh7647/HETU-Qwen3-8B-PassageReranking-CotGen

## Resumen

HETU-Qwen3-8B-PassageReranking-CotGen es un ajuste fino de Qwen3-8B orientado a la reordenación de pasajes (passage reranking) en un pipeline de recuperación de información, concretamente dentro de la familia de experimentos que el autor publica bajo el nombre `eklav`. El modelo se entrena con una variante de supervisión fina denominada Std-SFT en la que la función de pérdida se aplica tanto al razonamiento del profesor como a la respuesta final, de modo que el modelo aprende a emitir una cadena de razonamiento antes de concluir si un pasaje es relevante para una consulta.

El uso previsto es el de un reranker puntual (pointwise), al estilo de Rank1: dado un par consulta-pasaje, el modelo genera su razonamiento y termina con el token `true` o `false`, y la puntuación de relevancia se obtiene como la probabilidad normalizada del token `true` en ese último paso. Esto lo convierte en una pieza intermedia de sistemas RAG que necesitan reordenar candidatos recuperados por un retriever de primera fase.

El modelo base Qwen3-8B aporta 8.190.735.360 parámetros y una ventana de contexto nativa amplia, lo que resulta adecuado para reranking de pasajes largos. La relevancia actual del modelo es la de un checkpoint especializado y experimental, con más de 5.000 descargas, pero con documentación y metadatos incompletos (sin licencia ni idiomas declarados), lo que limita su adopción en producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (base Qwen3-8B), ajuste fino para reranking con razonamiento |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de uso configura `max_model_len=16000`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-8B |
| Tamaño del repositorio | 16,4 GB |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de aproximadamente 8.200 millones de parámetros, y se ajusta mediante un procedimiento que el autor denomina Std-SFT. En este esquema, la pérdida se calcula sobre el razonamiento del modelo profesor y sobre la respuesta final, de forma que el estudiante aprende a producir una traza de razonamiento que desemboca en una decisión binaria de relevancia (`true`/`false`). El autor publica una variante adicional, Eklav-Passage-8B, entrenada con el método Eklav, que mejora los resultados de Std-SFT según la model card.

El entrenamiento está orientado a la tarea BRIGHT de reranking de pasajes, un benchmark de recuperación en dominios intensivos en razonamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. La innovación principal es la formulación del reranking como generación de razonamiento seguida de una decisión binaria, con extracción de la probabilidad del token final para producir una puntuación continua en lugar de un ranking directo.

## Capacidades

- Reordenación puntual de pasajes: dada una consulta y un pasaje, emite razonamiento y una decisión `true`/`false`, con puntuación derivada de la probabilidad del token final.
- Razonamiento explícito en cadena antes de la decisión de relevancia (bloque ` thinking`).
- Generación de texto conversacional, heredada del modelo base Qwen3-8B.
- Capacidad de operar en modo batch mediante vLLM con `max_model_len=16000`, según el ejemplo de la model card.
- Soporte de `text-generation-inference` y `endpoints_compatible` según los tags del repositorio.
- Extracción de logprobs para scoring calibrado (el ejemplo usa `logprobs=20`).

## Casos de uso

- Reranking en pipelines RAG: tras una primera fase de recuperación con un retriever denso o BM25, el modelo reordena los 20-100 candidatos superiores puntuando cada par consulta-pasaje con la probabilidad de `true`, mejorando la precisión del contexto entregado al generador.
- Búsqueda en dominios técnicos y científicos: el entrenamiento sobre BRIGHT está orientado a consultas que requieren razonamiento sobre el pasaje, útil en documentación médica, legal o de ingeniería donde la coincidencia léxica falla.
- Filtrado de contexto antes de la generación: en lugar de pasar todos los fragmentos recuperados al LLM generador, se usa este modelo para descartar pasajes irrelevantes y reducir coste de tokens y latencia del paso final.
- Evaluación de relevancia con justificación: al emitir razonamiento, permite auditar por qué un pasaje se consideró relevante, útil en sistemas con requisitos de explicabilidad.
- Reordenación multilingüe de documentación: siempre que se valide el comportamiento en idiomas distintos del inglés, puede reordenar pasajes en corpus mixtos; la información disponible no confirma los idiomas soportados.
- Construcción de datasets de preferencia para rerankers: las trazas de razonamiento generadas pueden usarse como datos de destilación para modelos de reranking más pequeños.

## Benchmarks y rendimiento

Resultados BRIGHT nDCG@10 publicados en la model card:

| Modelo | Método | BRIGHT nDCG@10 |
|---|---|---|
| Qwen3-4B | Eklav | 31,5 |
| Qwen3-4B | Std-SFT | 29,3 |
| Qwen3-8B | Std-SFT | 31,5 |
| Qwen3-8B | Eklav | 34,2 |
| GLM-Z1-9B | Std-SFT | 30,1 |
| GLM-Z1-9B | Eklav | 33,2 |
| Qwen3-14B | Std-SFT | 32,5 |
| Qwen3-14B | Eklav | 34,7 |

El checkpoint de este repositorio corresponde a la variante Std-SFT sobre Qwen3-8B, con 31,5 nDCG@10 en BRIGHT. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales para este ajuste.

## Requisitos de hardware

- Inferencia en precisión completa (BF16): aproximadamente 16,4 GB de pesos, más KV cache; se recomienda al menos 24 GB de VRAM para contexto moderado y 40-80 GB para contexto largo.
- Cuantización a 8 bits: en torno a 9-10 GB de VRAM, viable en RTX 4090 (24 GB) y A6000 (48 GB).
- Cuantización a 4 bits: en torno a 5-6 GB de VRAM, viable en RTX 3090/4090 y en GPUs consumer de 12-16 GB con contexto reducido; no se confirman los formatos de cuantización soportados por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para serving con vLLM y alto throughput; RTX 4090 para desarrollo y evaluación.
- Despliegue: vLLM es la opción documentada en la model card (con `logprobs` y cadenas de parada para ` true` y ` false`); también es compatible con text-generation-inference y transformers.
- Throughput y latencia: no disponibles. El modelo genera hasta 8.192 tokens de razonamiento por par consulta-pasaje según el ejemplo, lo que implica un coste computacional elevado por candidato y recomienda batch y límites de tokens ajustados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BRIGHT nDCG@10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HETU-Qwen3-8B-PassageReranking-CotGen (Std-SFT) | 8,19 B | no disponible | 31,5 | no disponible | Hugging Face |
| Eklav-Passage-8B | 8,19 B (base Qwen3-8B) | no disponible | 34,2 | no disponible | Hugging Face |
| GLM-Z1-9B (ajustado, Eklav) | ~9 B | no disponible | 33,2 | no disponible | Hugging Face |
| Qwen3-14B (ajustado, Eklav) | ~14 B | no disponible | 34,7 | no disponible | Hugging Face |
| Rank1-7B (referencia de formato) | ~7 B | no disponible | no disponible | no disponible | Hugging Face (jhu-clsp) |

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no debe asumirse uso comercial permitido sin verificar la licencia del modelo base Qwen3-8B y la del ajuste.
- No se declaran idiomas soportados; el comportamiento fuera del inglés no está validado y la evaluación publicada se limita a BRIGHT.
- El modelo es un checkpoint de investigación con documentación mínima (sin ficha de sesgos, sin datos de entrenamiento ni evaluación de seguridad).
- El coste de inferencia es alto para un reranker: genera cadenas de razonamiento de hasta 8.192 tokens por par, lo que lo hace inviable para reordenar cientos de candidatos sin filtrado previo.
- Riesgo de alucinación en el razonamiento: la traza puede justificar una decisión incorrecta; la puntuación debe calibrarse por umbral sobre un conjunto de validación propio.
- La extracción de la probabilidad del token final depende de detalles de tokenización y de las cadenas de parada de vLLM; el propio autor advierte de un posible desfase de un token, por lo que conviene verificar la implementación de scoring.
- El repositorio corresponde a la variante Std-SFT, no a la variante Eklav, que obtiene mejores resultados; conviene comprobar cuál se está desplegando.
- No hay información sobre cuantizaciones oficiales ni sobre rendimiento en GPUs consumer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdarshSingh7647/HETU-Qwen3-8B-PassageReranking-CotGen
- Variante Eklav: https://huggingface.co/AdarshSingh7647/Eklav-Passage-8B
- Código del proyecto: https://github.com/AdarshSingh7647/Eklavya
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Referencia de formato Rank1: https://huggingface.co/jhu-clsp/rank1-7b
