# AdarshSingh7647/Eklav-9B-Reranker

## Resumen

Eklav-9B-Reranker es un modelo de reordenación (reranking) de pasajes construido a partir de GLM-Z1-9B-0414, un transformer denso de 9.400 millones de parámetros desarrollado originalmente por Zhipu AI (zai-org). El modelo ha sido afinado por AdarshSingh7647 mediante una técnica denominada Eklav, en la que el razonamiento del modelo profesor se inyecta como pista en el prompt y la función de pérdida se calcula únicamente sobre la respuesta final. El resultado es un reranker puntual (pointwise) que emite una cadena de razonamiento y concluye con un token `true` o `false`, cuya probabilidad se interpreta como puntuación de relevancia.

El modelo aborda un problema concreto en pipelines de recuperación de información: los rerankers de tipo cross-encoder clásico no aprovechan el razonamiento explícito, mientras que los rerankers generativos con reasoning sí pueden mejorar el juicio de relevancia en consultas complejas. Eklav-9B-Reranker se posiciona en la estela de Rank1 y está orientado a tareas de passage reranking evaluadas con BRIGHT, un benchmark de recuperación con consultas de razonamiento intensivo.

Su relevancia radica en que, según los datos publicados por el autor, el entrenamiento con Eklav supera al SFT estándar en todos los tamaños comparados, y el modelo de 9B alcanza 33,2 nDCG@10 en BRIGHT, por encima de Qwen3-8B con SFT estándar (31,5) y cerca de Qwen3-14B con Eklav (34,7). La información disponible no detalla la licencia ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia GLM-Z1), con modo de razonamiento |
| Parametros totales | 9.400.279.040 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura `max_model_len=20000` en vLLM |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de GLM-Z1-9B-0414, un transformer denso con capacidad de razonamiento explícito (modo thinking) que genera una traza de pensamiento antes de la respuesta. Sobre esta base, el autor aplica un afinado supervisado con la metodología Eklav: durante el entrenamiento, el razonamiento del profesor se proporciona como pista dentro del prompt, pero la pérdida se aplica exclusivamente sobre la respuesta final (`true` o `false`). Esto separa la señal de supervisión del formato del razonamiento y evita que el modelo memorice trazas del profesor como objetivo directo.

El modelo se usa como reranker puntual al estilo de Rank1: se construye un prompt con instrucción de sistema, consulta y pasaje, se habilita el modo thinking mediante `enable_thinking=True` en la plantilla de chat, y se calcula la probabilidad normalizada del token `true` frente a `false` en el último paso de logprobs. La información disponible no especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El autor publica una variante con SFT estándar (Std-SFT-Passage-9B) para comparación directa.

## Capacidades

- Reordenación de pasajes (passage reranking) en modo puntual, con puntuación derivada de la probabilidad del token `true` en la conclusión del razonamiento.
- Razonamiento explícito previo a la decisión, habilitado mediante el modo thinking de la plantilla de chat.
- Generación de texto y conversación multi-turno, heredadas de la base GLM-Z1-9B.
- Juicio de relevancia consulta-pasaje con consultas de razonamiento intensivo, evaluado en BRIGHT.
- Integración con vLLM para inferencia de alto rendimiento y acceso a logprobs por token.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.
- Visión y audio: no disponibles.

## Casos de uso

- Reordenación en pipelines RAG: tras una primera fase de recuperación densa o híbrida, el modelo reordena los candidatos calculando la probabilidad de `true` para cada par consulta-pasaje y se seleccionan los mejores para el contexto del generador. Es adecuado porque su salida calibrada permite umbralizar y ordenar sin entrenamiento adicional.
- Búsqueda empresarial sobre documentación interna: consultas formuladas de forma indirecta o con jerga se benefician del razonamiento previo del modelo, que puede relacionar conceptos no coincidentes léxicamente antes de emitir el juicio de relevancia.
- Preguntas de dominio científico o técnico: BRIGHT está diseñado con consultas que requieren razonamiento; el modelo es apropiado para recuperación en dominios donde la coincidencia superficial de términos es insuficiente.
- Filtrado de candidatos en pipelines de alta precisión: el reranker puede aplicarse a los 50-100 mejores resultados de un retriever para reducir falsos positivos antes de la generación, con coste controlado al ejecutarse en vLLM con temperatura 0.
- Evaluación y anotación de datasets de recuperación: la puntuación continua derivada de la probabilidad de `true` permite generar etiquetas de relevancia graduadas para construir o validar conjuntos de evaluación.
- Sistemas de respuesta sobre base documental legal o normativa: la traza de razonamiento permite auditar por qué un pasaje se consideró relevante, lo que facilita la revisión humana en entornos con requisitos de explicabilidad.
- Enrutamiento de consultas a fuentes: comparar la puntuación máxima de cada fuente candidata permite decidir qué colección consultar primero en arquitecturas de recuperación federada.

## Benchmarks y rendimiento

Datos publicados en la model card (BRIGHT nDCG@10):

| Modelo | Std-SFT | Eklav |
|---|---|---|
| Qwen3-4B | 29,3 | 31,5 |
| Qwen3-8B | 31,5 | 34,2 |
| GLM-Z1-9B (este modelo) | 30,1 | 33,2 |
| Qwen3-14B | 32,5 | 34,7 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19 GB solo para pesos (9,4B × 2 bytes), más caché KV; en la práctica se recomienda un mínimo de 24 GB para contextos cortos y 40-48 GB para contextos de hasta 20.000 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 10-12 GB para pesos, con margen adicional para caché KV.
- VRAM estimada en cuantización de 4 bits: alrededor de 6-7 GB para pesos; no se documentan pesos GGUF oficiales, por lo que habría que generarlos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para producción con vLLM; RTX 4090 (24 GB) es viable en BF16 con contextos moderados o en 8 bits con contextos amplios.
- GPU de consumo: cabe en RTX 4090 y, en cuantización de 4-8 bits, en GPUs de 12-16 GB como RTX 4070 Ti Super o RTX 4080, con limitaciones de longitud de contexto.
- Opciones de despliegue: vLLM es la vía documentada por el autor (con `logprobs=20` y `max_model_len=20000`); transformers es compatible por la librería declarada. llama.cpp, Ollama y TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles. El modo thinking implica generar hasta 4096 tokens por par consulta-pasaje, lo que incrementa notablemente el coste frente a un cross-encoder clásico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BRIGHT nDCG@10 (Eklav) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eklav-9B-Reranker | 9,4B | no disponible (ejemplo con 20.000) | 33,2 | no disponible | Hugging Face |
| Std-SFT-Passage-9B | 9,4B | no disponible | 30,1 (Std-SFT) | no disponible | Hugging Face |
| Qwen3-8B (Eklav) | 8B | no disponible | 34,2 | no disponible en la información | Hugging Face |
| Qwen3-14B (Eklav) | 14B | no disponible | 34,7 | no disponible en la información | Hugging Face |
| Rank1-7B | 7B | no disponible | no disponible | no disponible | Hugging Face (jhu-clsp) |

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; antes de uso comercial debe verificarse la licencia del modelo base GLM-Z1-9B-0414 y la del propio repositorio.
- No se documentan los idiomas soportados; el rendimiento fuera del inglés es incierto.
- El modo thinking genera hasta 4096 tokens por par consulta-pasaje, lo que eleva la latencia y el coste por consulta en comparación con rerankers cross-encoder convencionales.
- La puntuación depende de la extracción correcta del token `true`/`false` en los logprobs; el propio autor advierte de un posible desfase de un token por la coincidencia de cadenas de parada en vLLM, y el código de ejemplo escanea desde el final para mitigarlo. Una implementación incorrecta devuelve 0,5 por defecto.
- Riesgo de alucinación en la traza de razonamiento: el modelo puede justificar una decisión con argumentos incorrectos aunque la etiqueta final sea adecuada, por lo que la traza no debe tratarse como explicación fiable sin verificación.
- Sesgos: no documentados en la información disponible; al derivar de GLM-Z1-9B hereda los sesgos de su corpus de entrenamiento, no especificado.
- El modelo está entrenado para una tarea concreta (relevancia consulta-pasaje); su uso como generador de propósito general no está validado y puede degradarse respecto a la base original.
- Solo 301 descargas y 0 likes en el momento de la consulta: ecosistema pequeño, poca validación independiente y riesgo de que el repositorio no reciba mantenimiento.
- No se publican resultados de benchmarks de propósito general ni evaluaciones multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdarshSingh7647/Eklav-9B-Reranker
- Variante Std-SFT: https://huggingface.co/AdarshSingh7647/Std-SFT-Passage-9B
- Código de Eklavya: https://github.com/AdarshSingh7647/Eklavya
- Modelo base GLM-Z1-9B-0414: https://huggingface.co/zai-org/GLM-Z1-9B-0414
- Rank1 (referencia de diseño): https://huggingface.co/jhu-clsp/rank1-7b
- Perfil del autor: https://huggingface.co/AdarshSingh7647
