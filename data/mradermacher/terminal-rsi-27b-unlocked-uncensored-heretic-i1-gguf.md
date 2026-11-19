# mradermacher/Terminal-RSI-27B-Unlocked-Uncensored-Heretic-i1-GGUF

## Resumen

Terminal-RSI-27B-Unlocked-Uncensored-Heretic-i1-GGUF es la versión cuantizada en formato GGUF del modelo SolsticeAI/Terminal-RSI-27B-Unlocked-Uncensored-Heretic, un modelo de lenguaje de aproximadamente 26.900 millones de parámetros orientado a tareas de agente de terminal, generación de código y razonamiento multi-paso. La cuantización corre a cargo de mradermacher, que aplica cuantización ponderada con fichero imatrix para producir un amplio abanico de variantes IQ y K-quant.

El modelo base se presenta como un ajuste orientado a "recursive self-improvement" (RSI) y entrenamiento por refuerzo, con etiquetas que lo vinculan a la familia Qwen 3.5 y a un artículo arXiv (2610.22192). Incorpora además las etiquetas "heretic", "uncensored", "decensored" y "abliterated", que indican que se ha aplicado una técnica de eliminación de rechazos (abliteration) para reducir el comportamiento de negativa del modelo.

La relevancia práctica de esta ficha radica en que ofrece el modelo en formato GGUF, lo que permite ejecutarlo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles, con opciones de cuantización desde ~7,2 GB (IQ1_S) hasta ~16,6 GB (Q4_K_M) y superiores. La licencia es Apache 2.0 y el repositorio ocupa 300,3 GB en total, incluyendo todas las variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5, segun etiquetas del autor); detalles no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiqueta "long-context" sin cifra) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M (y variantes superiores listadas en la model card) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del autor, que la vinculan a la familia Qwen 3.5 y a un transformer con soporte de contexto largo. El pipeline declarado es "reinforcement-learning" y las etiquetas incluyen "recursive-self-improvement" y "terminal-agent", lo que sugiere un ajuste orientado a tareas de agente en terminal y mejora iterativa. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

El modelo base incorpora modificaciones de tipo "abliterated/decensored/heretic", que habitualmente consisten en intervenciones sobre las direcciones de activación para suprimir el comportamiento de rechazo. Esta cuantización i1 aplica un fichero imatrix (0,1 GB) para guiar la cuantización ponderada. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento multi-paso, con etiqueta explícita de "long-context".
- Generación y edición de código, con etiquetas "code" y "terminal-agent".
- Comportamiento de agente de terminal y flujos de auto-mejora recursiva (RSI) según las etiquetas del autor.
- Capacidad de visión: la model card indica "This is a vision model", con ficheros mmproj (si existen) en el repositorio estático.
- Soporte multilingüe limitado a inglés (en) y chino (zh).
- Comportamiento "uncensored/decensored": menor tendencia a rechazar peticiones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas en terminal: el modelo puede interpretar comandos, encadenar pasos y operar sobre entornos de línea de comandos, aprovechando su orientación a "terminal-agent".
- Asistencia a la programación en local: con la cuantización Q4_K_M (~16,6 GB) puede ejecutarse en una GPU de consumo de 24 GB para autocompletado y generación de código sin depender de la nube.
- Pipelines de CI/CD con modelos autoalojados: al distribuirse en GGUF y licencia Apache 2.0, puede integrarse en infraestructura propia mediante llama.cpp u Ollama.
- Investigación sobre alineación y abliteration: al ser una variante "decensored", sirve para estudiar el efecto de la supresión de rechazos en modelos de 27B.
- Procesamiento de documentos largos en inglés o chino: la etiqueta "long-context" sugiere uso en resumen y extracción sobre contextos extensos, aunque la longitud exacta no está documentada.
- Despliegue en hardware modesto: las variantes IQ2 e IQ3 (8,5-14,4 GB) permiten ejecutar el modelo en GPUs de 12-16 GB o en CPU con RAM suficiente.
- Experimentación con visión (si se dispone del mmproj del repositorio estático): tareas de descripción de imágenes o extracción de información visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: IQ1_S ~7,2 GB; IQ2_M ~10,1 GB; IQ3_M ~12,7 GB; IQ4_XS ~15,2 GB; Q4_K_M ~16,6 GB. Los tamaños superiores (Q5, Q6, Q8) no se detallan en el fragmento disponible.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y superiores con holgura; RTX 3090/4080 (16-24 GB) para IQ4_XS y Q4_K_S; GPUs de 12 GB para IQ2/IQ3.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB con cuantizaciones IQ2/IQ3; en RTX 4090 con Q4_K_M o superiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier motor compatible con GGUF; los pesos originales usan transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Terminal-RSI-27B (esta ficha) | ~26,9 B | no disponible | Apache 2.0 | GGUF (i1) | Orientado a terminal-agent, abliterated, en/zh |
| Qwen2.5-Coder-32B | ~32 B | 128K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Referencia en código; no abliterated |
| Gemma-2-27B | ~27 B | 8K (segun documentacion publica de Google) | Gemma license | safetensors, GGUF | Mismo orden de magnitud; licencia mas restrictiva |
| Mistral-Small-24B | ~24 B | 32K (segun documentacion publica de Mistral) | Apache 2.0 | safetensors, GGUF | Alternativa europea con licencia permisiva |

Los datos de contexto de los modelos comparados provienen de su documentación pública; los de este modelo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Al estar "abliterated/decensored", el modelo puede generar contenido que otros modelos rechazarían; requiere moderación adicional en producción.
- Riesgo de alucinación no cuantificado; no hay benchmarks publicados que permitan estimarlo.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- La longitud de contexto exacta no está disponible, pese a la etiqueta "long-context".
- Las cuantizaciones IQ1 e IQ2 (especialmente IQ1_S, IQ1_M, Q2_K_S) degradan notablemente la calidad según advierte el propio autor ("for the desperate", "very low quality").
- El repositorio ocupa 300,3 GB; conviene descargar solo la variante necesaria.
- Aunque la licencia es Apache 2.0, el modelo base podría arrastrar términos adicionales no reflejados en la información disponible.
- Sin datos de benchmarks ni de tool calling, la idoneidad para agentes en producción debe validarse empíricamente.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/Terminal-RSI-27B-Unlocked-Uncensored-Heretic-i1-GGUF
- Modelo base: https://huggingface.co/SolsticeAI/Terminal-RSI-27B-Unlocked-Uncensored-Heretic
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Terminal-RSI-27B-Unlocked-Uncensored-Heretic-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Terminal-RSI-27B-Unlocked-Uncensored-Heretic-i1-GGUF
- Artículo referenciado (etiqueta arXiv): arxiv:2610.22192 (no verificable en la información proporcionada)
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
