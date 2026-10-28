# Cultxre/Qwythos-9B-Claude-Mythos-5-1M-uncensored-heretic-GGUF

## Resumen

Qwythos-9B-Claude-Mythos-5-1M-uncensored-heretic es una variante "abliterated" (decensurada) del modelo empero-ai/Qwythos-9B-Claude-Mythos-5-1M, publicada por llmfan46 (usuario que acumula más de 70 modelos alojados en Hugging Face) y cuantizada a GGUF por Cultxre. El modelo parte de una base etiquetada como qwen3.5, con 8.953.803.264 parámetros (unos 8,95 millardos) y una ventana de contexto que el nombre y las etiquetas sitúan en 1 millón de tokens, aunque la model card no documenta la arquitectura ni las especificaciones técnicas del modelo original.

El problema que aborda es la reducción de rechazos: mediante la herramienta Heretic v1.2.0 y una variante del método Magnitude-Preserving Orthogonal Ablation (MPOA), el autor reporta un descenso de los rechazos de 73/100 a 11/100 en su batería interna, con una divergencia KL de 0,0123 respecto al modelo original. Es decir, se vende como un modelo con calidad prácticamente intacta pero con muchos menos bloqueos de contenido, orientado a investigación, red teaming y tareas de seguridad o biomedicina donde los modelos alineados por defecto suelen negarse.

La relevancia es doble: por un lado es un ejemplo práctico de cuantización GGUF de un modelo de ~9B con contexto declarado de 1M y soporte de function calling; por otro, sirve como caso de estudio de las técnicas de abliteración y de los riesgos asociados a distribuir modelos sin alineamiento. Conviene señalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que su licencia Apache 2.0 podría no cubrir todas las obligaciones derivadas de la cadena de modelos base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (la etiqueta qwen3.5 apunta a una base Qwen3.5; la model card no detalla capas, atención ni configuración) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | No aplica: no se describe como modelo MoE |
| Longitud de contexto | 1.048.576 tokens (1M) segun nombre del modelo y etiquetas; no verificado en la model card |
| Tipos de cuantizacion | GGUF; el autor no enumera los niveles concretos (Q4_K_M, Q5_K_M, Q8_0, etc.) incluidos en el repo |
| Idiomas soportados | Inglés (`en`) unicamente, segun metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |
| Tamano del repositorio | 61,4 GB |
| Fecha de publicacion | 28 de octubre de 2026 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El autor de esta ficha (Cultxre) no documenta la arquitectura interna: se limita a indicar que es una cuantización GGUF del modelo llmfan46/Qwythos-9B-Claude-Mythos-5-1M-uncensored-heretic, que a su vez es una versión decensurada de empero-ai/Qwythos-9B-Claude-Mythos-5-1M. Las etiquetas del repositorio (`qwen3.5`, `sft`, `full-fine-tune`, `reasoning`, `agentic`, `function-calling`, `long-context`, `1M-context`) indican que la base es un fine-tune completo supervisado sobre una familia Qwen 3.5 con capacidades de razonamiento y llamada a funciones, pero no se aportan datos de composición del dataset, número de tokens de entrenamiento ni detalles de la fase de alineamiento (RLHF/DPO). El nombre "Claude-Mythos" sugiere una destilación o entrenamiento sobre trazas de un modelo Claude, aunque esto no se confirma en la información disponible.

La innovación técnica documentada es el proceso de abliteración. Se aplicó Heretic v1.2.0 con una variante de Magnitude-Preserving Orthogonal Ablation (MPOA) sobre tres componentes: `attn.o_proj`, `attn.out_proj` y `mlp.down_proj`, con parámetros específicos de dirección e intensidad (por ejemplo, `direction_index` = 20,52; pesos máximos y mínimos por componente con sus posiciones y distancias). Este tipo de ablación proyecta fuera del espacio de pesos la dirección asociada al comportamiento de rechazo, preservando la magnitud de los pesos para minimizar el daño al resto de capacidades. El resultado declarado es una divergencia KL de 0,0123 frente al original y una caída de rechazos del 85 % (11/100 frente a 73/100) en el conjunto de evaluación del autor, sin datos sobre el método de medición de rechazos ni sobre el conjunto de prompts empleado.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con pipeline `text-generation`.
- Razonamiento: etiqueta `reasoning` presente en el repositorio; se desconoce si existe un modo "thinking" explícito y cómo se activa.
- Llamada a funciones y uso de herramientas (`function-calling`, `tool-use`), lo que habilita integraciones con APIs externas y flujos agénticos.
- Comportamiento agéntico multi-paso (`agentic`), según etiquetas del autor.
- Contexto largo: ventana declarada de 1M de tokens, adecuada para documentos o repositorios completos (sin verificación independiente).
- Dominios especializados según etiquetas: ciberseguridad (`cybersecurity`) y biomedicina (`biomedical`).
- Contenido sin filtros: el proceso de abliteración reduce drásticamente los rechazos, incluyendo peticiones que los modelos alineados bloquean.
- Capacidades multimodales (visión, audio): no disponibles; no se mencionan en la información.
- Multilingüismo: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- **Análisis de repositorios completos**: con una ventana declarada de 1M de tokens, el modelo puede recibir un árbol de código extenso y responder preguntas transversales (dependencias, duplicidades, deuda técnica) sin necesidad de trocear el contexto en un pipeline RAG.
- **Asistente de programación local**: al distribuirse en GGUF, se puede ejecutar con llama.cpp u Ollama en una estación de trabajo, sirviendo como autocompletado y generación de código sin enviar el código a un servicio externo.
- **Agentes con tool calling**: las etiquetas `function-calling` y `agentic` permiten construir agentes que consulten APIs, ejecuten comandos y encadenen pasos; útil para automatización de tareas de back-office o scripting.
- **Investigación en alineamiento y red teaming**: es su uso más defendible. Su condición de modelo abliterado con métricas de divergencia KL y tasa de rechazos lo convierte en un sujeto de estudio para medir cuánto se degrada la seguridad al aplicar MPOA, y para generar conjuntos de prompts adversarios.
- **Auditoría de seguridad ofensiva controlada**: la etiqueta `cybersecurity` sugiere uso en laboratorios de pentesting para redactar informes, explicar vulnerabilidades y generar PoCs en entornos autorizados; requiere supervisión humana y un marco legal claro.
- **Documentación biomédica y revisión de literatura**: la etiqueta `biomedical` apunta a resumen y extracción de información de artículos o historiales; debe tratarse como herramienta de apoyo, nunca como sustituto del criterio clínico.
- **Procesamiento de contratos y documentación legal extensa**: el contexto largo permite cargar expedientes completos y hacer preguntas de detalle, aunque la baja puntuación en `professional_law` (0,5885) aconseja revisión humana obligatoria.
- **Generación de contenido sin restricciones para ficción o guion**: escenarios creativos con temáticas que los modelos alineados rechazan; conviene filtrar la salida antes de publicarla.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al modelo original y a métricas internas del proceso de abliteración; no se han publicado resultados de la variante abliterada en MMLU ni en otros benchmarks estándar.

| Metrica | Este modelo (abliterado) | Modelo original |
|---|---|---|
| Divergencia KL | 0,0123 | 0 (por definición) |
| Rechazos (bateria interna del autor) | 11/100 | 73/100 |
| MMLU (7021 preguntas) | No disponible | 77,03 % (5408 aciertos) |
| Fallos de parseo en MMLU | No disponible | 0 |

Desglose parcial de MMLU del modelo original (materias seleccionadas):

| Materia | Precision |
|---|---|
| high_school_psychology | 0,9593 (259/270) |
| high_school_government_and_politics | 0,9505 (96/101) |
| astronomy | 0,9494 (75/79) |
| high_school_microeconomics | 0,9485 (129/136) |
| marketing | 0,9450 (103/109) |
| college_biology | 0,9375 (60/64) |
| high_school_biology | 0,9276 (141/152) |
| miscellaneous | 0,8851 (339/383) |
| professional_medicine | 0,8582 (115/134) |
| machine_learning | 0,6154 (32/52) |
| professional_law | 0,5885 (462/785) |
| high_school_mathematics | 0,5591 (71/127) |
| college_mathematics | 0,5455 (30/55) |
| moral_scenarios | 0,5339 (236/442) |
| virology | 0,5281 (47/89) |

No hay datos de HumanEval, GSM8K, MMLU-Pro, GPQA ni de evaluaciones de contexto largo en la información disponible.

## Requisitos de hardware

Estimaciones para 8,95 B parámetros (no publicadas por el autor; calculadas a partir del tamaño):

- **FP16 / BF16**: ~17,9 GB de pesos. Requiere GPU de 24 GB (RTX 3090/4090, A10G, L4) o reparto en varias GPU.
- **Q8_0**: ~9,5 GB de pesos; cabe en una RTX 4070 Ti Super (16 GB) o RTX 4080/4090 con margen para KV cache moderada.
- **Q5_K_M**: ~6,3 GB; cabe en RTX 3060 de 12 GB y en GPUs de 8 GB con contexto corto.
- **Q4_K_M**: ~5,4 GB; cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) y en Apple Silicon con 16 GB unificados.
- **Contexto de 1M tokens**: el coste de KV cache es el factor limitante. Para un modelo de ~9B y ~32-40 capas, un millón de tokens excede con holgura la VRAM de cualquier GPU de consumo; en la práctica exige GPUs de 80 GB (A100/H100) con atención eficiente, o bien reducir drásticamente el contexto efectivo. No se han publicado mediciones reales de latencia ni de calidad a 1M.
- **CPU**: viable con llama.cpp en Q4_K_M a velocidades del orden de pocos tokens por segundo, dependiendo del número de núcleos y del ancho de banda de memoria.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio y servidores GGUF compatibles (por ejemplo llama-cpp-python o text-generation-webui). vLLM y TGI no cargan GGUF de forma nativa en todas sus versiones; para esos motores haría falta el modelo en safetensors.
- **Latencia y throughput**: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de esta variante que permitan una comparación de rendimiento homogénea. La comparación se limita a especificaciones estructurales de modelos de tamaño similar ampliamente conocidos:

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Qwythos-9B-Claude-Mythos-5-1M-uncensored-heretic (este) | 8,95 B | 1M declarados (sin verificar) | Apache 2.0 | en | Abliterado; sin benchmarks propios publicados |
| Qwen2.5-7B-Instruct | 7,6 B | 128K | Apache 2.0 | multilingue | Referencia consolidada en tool calling y contexto largo |
| Llama 3.1 8B Instruct | 8,03 B | 128K | Llama 3.1 Community License | multilingue | Licencia con restricciones de uso y cláusula de nombre |
| Mistral 7B Instruct v0.3 | 7,2 B | 32K | Apache 2.0 | en | Base frecuente para fine-tunes comunitarios |

No se han publicado comparaciones directas de MMLU, HumanEval o GSM8K entre este modelo y las alternativas en la información disponible.

## Limitaciones y advertencias

- **Solo inglés**: los metadatos declaran únicamente `en`; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- **Ausencia de benchmarks de la variante abliterada**: la MMLU de 77,03 % corresponde al modelo original. La degradación real introducida por la ablación solo se cuantifica con una divergencia KL de 0,0123, que no equivale a una evaluación de capacidades.
- **Riesgo de alucinación**: como cualquier modelo de ~9B, especialmente en matemáticas (college_mathematics 0,5455; high_school_mathematics 0,5591), derecho (professional_law 0,5885) y virología (0,5281). No debe usarse como fuente única en dominios regulados.
- **Contenido dañino**: el objetivo declarado del modelo es reducir rechazos. Esto implica que puede producir instrucciones operativas para actividades ilegales o peligrosas (malware, síntesis de compuestos, etc.). Su uso en producción requiere filtros externos, registro de auditoría y revisión humana.
- **Cadena de licencias**: la ficha declara Apache 2.0, pero el modelo deriva de un fine-tune comunitario que a su vez podría incorporar obligaciones de la licencia de Qwen y, si el nombre "Claude-Mythos" refleja una destilación, de los términos de uso de Anthropic. Conviene verificar la licencia en cada eslabón antes de un uso comercial.
- **Contexto de 1M no verificado**: no hay evidencias publicadas de que la ventana funcione a esa longitud ni de la calidad de recuperación en posiciones lejanas; el coste de KV cache hace inviable el valor nominal en hardware de consumo.
- **Madurez nula**: 0 descargas y 0 likes en el momento de la consulta, repositorio de 61,4 GB con cuantizaciones no documentadas. No hay informes de terceros sobre estabilidad, formato de chat correcto o plantilla de prompt.
- **Sin soporte multimodal ni audio**: no se declaran capacidades de visión.
- **Fecha de publicación futura respecto a los datos de referencia habituales**: conviene confirmar que el repositorio y sus artefactos son los definitivos antes de integrarlos.
- **No apto para uso clínico, legal o financiero sin supervisión**: a pesar de las etiquetas `biomedical` y `cybersecurity`, no hay validación independiente que respalde esos dominios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Cultxre/Qwythos-9B-Claude-Mythos-5-1M-uncensored-heretic-GGUF
- Modelo base inmediato (abliterado, safetensors): https://huggingface.co/llmfan46/Qwythos-9B-Claude-Mythos-5-1M-uncensored-heretic
- Modelo original previo a la ablación: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Heretic (herramienta de abliteración): https://heretic-project.org/
- Blog sobre Magnitude-Preserving Orthogonal Ablation: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Patreon del autor del fine-tune: https://patreon.com/LLMfan46
- Ko-fi del autor del fine-tune: https://ko-fi.com/llmfan46
