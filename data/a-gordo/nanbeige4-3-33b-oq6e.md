# a-gordo/Nanbeige4.3-33B-oQ6e

## Resumen

Nanbeige4.3-33B-oQ6e es una cuantización comunitaria en formato MLX del modelo Nanbeige4.3-33B, desarrollado por el equipo Nanbeige. La conversión ha sido realizada por el usuario a-gordo utilizando el método oQ (nivel 6, variante "e" con imatrix mejorada) implementado en la herramienta oMLX de jundot. El objetivo de esta ficha es ofrecer a los desarrolladores una versión del modelo de 33 mil millones de parámetros optimizada para ejecutarse en hardware Apple silicon con un consumo de memoria reducido respecto a los pesos BF16 originales.

El modelo base es un modelo de generación de texto conversacional con arquitectura tipo Llama, bilingüe (inglés y chino) y licencia Apache-2.0, lo que permite su uso comercial sin restricciones relevantes. La cuantización oQ6e reduce el tamaño del repositorio a 27,8 GB frente a los aproximadamente 66 GB que ocuparían los pesos en BF16, manteniendo un nivel de precisión razonablemente alto gracias al uso de matrices de importancia (imatrix) en las 364 proyecciones del transformer.

Es relevante destacar que se trata de una conversión comunitaria, no de un lanzamiento oficial de Nanbeige ni de jundot, y que su autor no realiza ninguna afirmación de equivalencia de calidad con el modelo original más allá de una prueba local de carga y generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (arquitectura detallada no disponible) |
| Parametros totales | 33.118.977.024 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (afín, tamaño de grupo 64, módulos seleccionados a 8 bits, imatrix mejorada) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX, 6 shards, 27,732 GB) |

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, emplea una arquitectura transformer tipo Llama, según indican las etiquetas del repositorio. No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset ni sobre el uso de técnicas de alineación como RLHF o DPO. Tampoco consta si incorpora innovaciones técnicas específicas como decodificación especulativa o atención lineal.

En cuanto a la cuantización, esta versión oQ6e se ha convertido directamente desde los pesos BF16 originales (revisión `c1093c501cc6460427c0ac634db7223d0450c0ee`), no desde los pesos oQ8e. Utiliza el nivel 6 del método oQ de oMLX con ponderación imatrix mejorada, modo de cuantización afín con tamaño de grupo 64, y ciertos módulos seleccionados emplean pesos de 8 bits según se especifica en el `config.json`. La calibración se realizó con el conjunto `oqe_code_multilingual` de oMLX, usando 128 muestras de 512 tokens. Todas las 364 entradas de proyección del transformer recibieron ponderación imatrix; la capa `lm_head` no tenía entrada de imatrix. Se incluyen el tokenizador y la plantilla de chat originales.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Soporte bilingüe de inglés y chino.
- Ejecución eficiente en Apple silicon mediante el framework MLX.
- La calibración multilingüe con código (`oqe_code_multilingual`) sugiere orientación a texto general y código, aunque no hay datos publicados que lo confirmen.
- No consta soporte de vision, audio, tool calling ni modos de razonamiento extendido en la información disponible.

## Casos de uso

- Chatbots bilingües inglés-chino: el modelo mantiene el tokenizador y la plantilla de chat originales, por lo que puede integrarse en asistentes conversacionales que atiendan usuarios en ambos idiomas.
- Generación y asistencia de código en equipos Mac: la cuantización MLX permite ejecutar un modelo de 33B en Apple silicon con 27,8 GB de pesos, útil como copiloto local en editores o scripts.
- Prototipado local sin nube: al ser un modelo local con licencia Apache-2.0, es adecuado para experimentar con LLMs sin enviar datos a servicios externos, relevante en entornos con requisitos de privacidad.
- Resumen y redacción de documentos largos: si la longitud de contexto del modelo base lo permite (dato no disponible), puede emplearse para procesar textos extensos en chino o inglés.
- Integración en aplicaciones macOS/iOS mediante MLX: el formato MLX facilita el despliegue en apps del ecosistema Apple aprovechando la GPU unificada.
- Evaluación comparativa de cuantizaciones: junto con las versiones oQ4e y oQ8e del mismo autor, permite estudiar el compromiso entre tamaño, velocidad y calidad en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del repositorio indica explícitamente que el modelo pasó una prueba local de carga y generación breve de texto, pero que no se realiza ninguna afirmación de equivalencia de calidad con el modelo original.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 28 GB solo para los pesos (27,732 GB), más memoria para KV cache y activaciones; en la práctica se recomienda un Mac con 32 GB de memoria unificada como mínimo, y 48-64 GB para contextos largos.
- Hardware recomendado: Apple silicon (M1 Ultra, M2 Max/Ultra, M3 Max, M4 Max o superiores) con suficiente memoria unificada. No es adecuado para GPUs NVIDIA en este formato MLX.
- En GPUs de consumo convencionales (RTX 4090, etc.) no es directamente utilizable, ya que el formato MLX está diseñado para Apple silicon; habría que recurrir a conversiones GGUF del modelo base.
- Despliegue: loaders compatibles con MLX, como oMLX (versión 0.7.0 usada en la conversión). No consta compatibilidad verificada con vLLM, llama.cpp, TGI u Ollama para esta cuantización concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dentro del mismo repositorio de autor, existen dos cuantizaciones alternativas del mismo modelo base:

| Modelo | Cuantizacion | Tamano aprox. | Formato | Licencia |
|---|---|---|---|---|
| a-gordo/Nanbeige4.3-33B-oQ6e | oQ6e (6-bit + imatrix) | 27,8 GB | MLX safetensors | Apache-2.0 |
| a-gordo/Nanbeige4.3-33B-oQ8e | oQ8e (8-bit) | no disponible | MLX safetensors | Apache-2.0 |
| a-gordo/Nanbeige4.3-33B-oQ4e | oQ4e (4-bit) | no disponible | MLX safetensors | Apache-2.0 |

La versión oQ6e representa un punto intermedio: menor consumo de memoria que oQ8e y mayor fidelidad esperable que oQ4e, aunque el autor no publica mediciones que cuantifiquen estas diferencias. Comparativas con otros modelos de 30-34B de otras familias no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión comunitaria, no un lanzamiento oficial de Nanbeige ni de jundot; cualquier problema de calidad podría derivar del proceso de cuantización.
- El autor no afirma equivalencia de calidad con el modelo BF16 original; solo se verificó la carga y una generación breve de texto.
- Solo es utilizable con loaders compatibles con MLX en Apple silicon; no sirve para despliegues en GPUs NVIDIA con vLLM o TGI.
- Idiomas limitados a inglés y chino según las etiquetas; el rendimiento en castellano no está documentado.
- No hay benchmarks publicados, por lo que la calidad real (incluido el riesgo de alucinación) debe validarse caso a caso antes de uso en producción.
- La longitud de contexto no está documentada en esta ficha de repositorio; consultar la model card del modelo base Nanbeige/Nanbeige4.3-33B.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar la model card original para condiciones adicionales del equipo Nanbeige.
- La calibración de la imatrix se reutilizó de la colecta realizada para oQ8e, lo que en teoría es válido pero introduce una ligera diferencia respecto a una calibración dedicada.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/a-gordo/Nanbeige4.3-33B-oQ6e
- Modelo base original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Model card del modelo original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Organización Nanbeige: https://huggingface.co/Nanbeige
- Herramienta oMLX (jundot): https://github.com/jundot/omlx
- Cuantización oQ8e del mismo autor: https://huggingface.co/a-gordo/Nanbeige4.3-33B-oQ8e
- Cuantización oQ4e del mismo autor: https://huggingface.co/a-gordo/Nanbeige4.3-33B-oQ4e
- Revisión fuente de la conversión: https://huggingface.co/Nanbeige/Nanbeige4.3-33B/tree/c1093c501cc6460427c0ac634db7223d0450c0ee
