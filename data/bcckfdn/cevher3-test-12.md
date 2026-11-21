# bcckfdn/cevher3-test-12

## Resumen

cevher3-test-12 es un modelo de lenguaje de 1.256.312.832 parámetros (aproximadamente 1,26 mil millones) desarrollado por el usuario bcckfdn y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto construido sobre la arquitectura gemma3_text, concretamente una variante que el autor denomina "Gemma3-SWA", y está orientado principalmente al turco (tr) y al inglés (en), con un enfoque conversacional.

El modelo emplea una arquitectura transformer de 34 capas con dimensión oculta de 1792 y una configuración de atención con 28 cabezas de consulta y 4 cabezas de clave/valor (GQA), lo que reduce el coste de memoria del caché KV frente a una atención multi-cabeza tradicional. Dispone de una ventana de contexto de 8192 tokens y un vocabulario de 65.536 entradas. Según la model card, se entrenó sobre 25.952 millones de tokens (expresado como "25.952 B" en la ficha original) y alcanzó una pérdida de validación de 2,7804.

Su relevancia radica en ser un modelo compacto de la familia Gemma 3 ajustado para turco, un idioma con menor cobertura en los grandes modelos multilingües, y en su licencia permisiva Apache 2.0, que facilita su uso comercial y su despliegue en hardware modesto. El nombre "test-12" sugiere que podría tratarse de una iteración experimental del autor, aunque esto no se confirma en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (gemma3_text, variante "Gemma3-SWA") |
| Parametros totales | 1.256.312.832 (~1,26 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Otros datos técnicos declarados por el autor: 34 capas, dimensión oculta de 1792, 28 cabezas de consulta y 4 cabezas de clave/valor, vocabulario de 65.536 tokens, 25.952 millones de tokens de entrenamiento y mejor pérdida de validación de 2,7804. El tamaño del repositorio es de 15,1 GB.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura gemma3_text, una familia de transformers decoder-only. La configuración declarada incluye 34 capas, hidden size de 1792, 28 cabezas de atención para consultas y 4 para claves/valores, lo que implica una atención con cabezas de clave/valor compartidas (GQA) que reduce el consumo de memoria durante la inferencia. El autor etiqueta la arquitectura como "Gemma3-SWA", lo que apunta a un uso de atención con ventana deslizante (sliding window attention) característico de las variantes Gemma 3, aunque no se detalla en la información disponible el tamaño exacto de dicha ventana ni la proporción de capas con atención global frente a local.

En cuanto al entrenamiento, la model card indica 25.952 millones de tokens procesados y una pérdida de validación final de 2,7804. No se especifica la composición del dataset, si hubo fases de ajuste supervisado (SFT), RLHF o DPO, ni detalles sobre el tokenizador más allá del tamaño del vocabulario (65.536). Tampoco se documentan innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal.

## Capacidades

- Generación de texto en turco e inglés, con orientación conversacional según las etiquetas del modelo.
- Razonamiento y respuesta a instrucciones en formato de diálogo multi-turno.
- Capacidad multilingüe limitada a los dos idiomas declarados (tr, en); no se documentan otros idiomas.
- Compatible con text-generation-inference y con endpoints compatibles, según las etiquetas del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.
- Al ser un modelo de ~1,26 mil millones de parámetros, sus capacidades de razonamiento complejo y código son presumiblemente limitadas en comparación con modelos de mayor tamaño, aunque no se aportan datos que lo confirmen.

## Casos de uso

- Asistentes conversacionales en turco: el modelo puede gestionar diálogos multi-turno con hasta 8192 tokens de contexto, adecuado para chatbots de atención al cliente en empresas que operan en Turquía y necesitan una solución ligera y con licencia permisiva.
- Generación de texto y resúmenes en turco: útil para redactar borradores, resumir documentos o generar contenido editorial en dicho idioma, donde los modelos grandes suelen tener menor cobertura.
- Clasificación y etiquetado de texto: al ser un modelo pequeño, puede ajustarse con fine-tuning para tareas de análisis de sentimiento, categorización de tickets o extracción de entidades en turco e inglés.
- Despliegue en hardware de consumo: con ~1,26 mil millones de parámetros, es viable ejecutarlo en GPU de gama media o incluso en CPU con cuantización, lo que lo hace apto para prototipos, demos y entornos con recursos limitados.
- Traducción asistida tr-en y en-tr: puede emplearse como base para pipelines de traducción de bajo coste o como componente en sistemas de post-edición.
- Educación y experimentación: sirve como modelo de referencia para investigadores que quieran estudiar el comportamiento de la arquitectura Gemma 3 a pequeña escala o realizar experimentos de ajuste fino sin grandes presupuestos de cómputo.
- Generación aumentada por recuperación (RAG) en turco: su ventana de 8192 tokens permite incorporar varios fragmentos de contexto recuperado en aplicaciones de preguntas y respuestas sobre documentación interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de validación (2,7804) y el número de tokens de entrenamiento (25.952 millones), sin métricas como MMLU, HumanEval, GSM8K u otras.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 5 GB solo para los pesos (1,26 mil millones de parámetros × 4 bytes), más el caché KV y activaciones.
- VRAM estimada en bf16/fp16: alrededor de 2,5 GB para los pesos, más overhead de contexto y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 1,3 GB; en 4 bits, aproximadamente 0,7 GB (estimaciones teóricas; no se documentan cuantizaciones oficiales).
- GPU recomendadas: cabe con holgura en GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores; también es viable en GPUs de datacenter como A100 o H100 para despliegues de mayor throughput.
- Despliegue: compatible con transformers y text-generation-inference según las etiquetas; para cuantización y ejecución en CPU se podría emplear llama.cpp u Ollama si se generan los pesos GGUF, aunque no se documenta su disponibilidad oficial.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| cevher3-test-12 | ~1,26 mil millones | 8192 | tr, en | Apache 2.0 |
| Gemma 2 2B | ~2,6 mil millones | 8192 | multilingüe | Gemma Terms of Use |
| Qwen2.5 1.5B | ~1,5 mil millones | 32.768 | multilingüe (incluye turco parcial) | Apache 2.0 |
| Llama 3.2 1B | ~1,2 mil millones | 131.072 | multilingüe | Llama 3.2 Community License |

No se dispone de datos de rendimiento comparativo (benchmarks) para cevher3-test-12, por lo que la comparación se limita a parámetros, contexto y licencia. Frente a Qwen2.5 1.5B y Llama 3.2 1B, cevher3-test-12 ofrece un contexto menor (8192 frente a 32.768 y 131.072 respectivamente) pero una licencia plenamente permisiva y un enfoque específico en turco que puede resultar ventajoso en ese idioma. No se conocen modelos comparables específicamente entrenados para turco con este tamaño en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan evaluaciones de sesgo; al entrenarse presumiblemente con datos web, puede reproducir estereotipos presentes en ellos.
- Riesgo de alucinación: como todo modelo de lenguaje de tamaño reducido, es propenso a generar información incorrecta o inventada, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto e idioma: la ventana de 8192 tokens es moderada y solo se declaran turco e inglés; el rendimiento en otros idiomas no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el origen de los datos de entrenamiento ni sobre posibles reclamaciones de terceros.
- Caveat de producción: el nombre "test-12" y la ausencia de benchmarks, de documentación sobre el dataset y de una model card detallada sugieren que se trata de una versión experimental; se recomienda validar su comportamiento antes de usarlo en entornos productivos.
- No se documentan cuantizaciones oficiales ni formatos GGUF, lo que puede requerir trabajo adicional para despliegues optimizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-12
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
