# mradermacher/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored-i1-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF del modelo Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored, un fine-tune publicado por DavidAU sobre una base de la familia Qwen3 que incorpora una arquitectura de "looping transformer" (reutilización iterativa de capas) y un proceso de abliteración orientado a eliminar los mecanismos de rechazo del modelo original. El trabajo de cuantización lo firma mradermacher, especialista en generar versiones comprimidas con imatrix para su uso en llama.cpp y entornos compatibles.

El modelo base declara 30.364.847.424 parámetros reales según los tensores en safetensors, lo que lo sitúa en la categoría de modelos densos de aproximadamente 30B. El repositorio GGUF ocupa 43,7 GB y ofrece un abanico amplio de cuantizaciones, desde IQ1_S hasta Q6_K, lo que permite desplegarlo desde hardware muy limitado hasta configuraciones con suficiente VRAM para cuantizaciones altas.

La relevancia de esta ficha es doble: por un lado documenta un caso poco habitual de arquitectura experimental (looping transformer) combinada con técnicas de abliteración y con el etiquetado "Uncensored"; por otro, sirve como ejemplo de la cadena de publicación típica en el ecosistema open source, donde un fine-tune comunitario se redistribuye en formato GGUF para consumo local. La información disponible sobre el modelo original es escasa y procede casi exclusivamente de la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con "looping" (reutilización de capas), según el nombre del modelo; detalles no disponibles |
| Parametros totales | 30.364.847.424 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE según los datos disponibles) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix); el modelo original en safetensors |

## Arquitectura y entrenamiento

El nombre del modelo indica una arquitectura de "looping transformer", un diseño en el que un subconjunto de capas se reutiliza varias veces durante el forward pass, aumentando efectivamente la profundidad computacional sin incrementar proporcionalmente el número de parámetros. No se dispone de documentación técnica del autor que detalle cuántas capas se repiten, cuántas iteraciones se aplican ni cómo se inicializan los pesos compartidos. Tampoco hay información sobre el número de tokens de entrenamiento, la composición del dataset de fine-tune ni si se emplearon técnicas de RLHF, DPO o abliteración supervisada más allá de lo que sugiere el nombre "Ablit-Heretic".

El proceso de cuantización sí está documentado de forma parcial en la model card: se han generado cuantizaciones ponderadas con imatrix (importance matrix), una técnica que calibra la pérdida de precisión por capa usando un corpus de calibración, lo que típicamente mejora la calidad de las cuantizaciones bajas (Q2, Q3, IQ2, IQ3) frente a una cuantización uniforme. El autor indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversión se hizo desde pesos Hugging Face con la herramienta estándar de llama.cpp.

## Capacidades

- Generación de texto conversacional: el tag `conversational` sugiere un ajuste orientado a diálogo, aunque no se detalla el formato de prompt recomendado.
- Razonamiento y conocimiento general: heredado de la base Qwen3, sin datos específicos publicados.
- Generación de código: plausible por la familia base, pero no confirmado en la información disponible.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles; el modelo base Qwen3 es multilingüe, pero no se especifica el subconjunto conservado tras el fine-tune.
- Modo "uncensored": el proceso de abliteración busca reducir los rechazos del modelo, lo que afecta al comportamiento en prompts sensibles.
- Cuantizaciones ligeras (IQ1_S, IQ2_XXS) que permiten ejecución en hardware muy limitado a costa de degradación de calidad.

## Casos de uso

- Experimentación con arquitecturas no estándar: investigadores interesados en el comportamiento de un "looping transformer" pueden cargar las cuantizaciones Q4_K_M o Q5_K_M en llama.cpp para estudiar latencia, calidad y estabilidad frente a un transformer convencional del mismo tamaño.
- Despliegue local en estaciones de trabajo con VRAM limitada: las cuantizaciones IQ2_M o Q2_K permiten ejecutar un modelo de ~30B en GPUs de 12-16 GB, útil para prototipos sin acceso a clúster.
- Estudio de abliteración y alineación: el etiquetado "Heretic" y "Uncensored" lo convierte en un caso de análisis para medir cómo varía la tasa de rechazo y la calidad factual tras eliminar capas de seguridad.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que requiera evitar rechazos temáticos, siempre con revisión humana por el riesgo de contenido inapropiado.
- Evaluación comparativa de cuantizaciones: al ofrecer 24 variantes, permite medir empíricamente la degradación de perplejidad entre IQ1_S y Q6_K sobre el mismo prompt, útil para calibrar políticas de despliegue.
- Investigación de seguridad y red teaming: analizar la facilidad con la que un modelo abliterado produce contenido dañino sirve para diseñar filtros y evaluar riesgos en pipelines de moderación.
- Pruebas de integración con llama.cpp y servidores compatibles: el tag `endpoints_compatible` indica que puede servirse mediante APIs tipo OpenAI en entornos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (para ~30B parámetros): IQ1_S ≈ 6-8 GB, IQ2_XXS/IQ2_M ≈ 8-10 GB, Q3_K_M ≈ 13-15 GB, Q4_K_M ≈ 18-20 GB, Q5_K_M ≈ 21-23 GB, Q6_K ≈ 24-26 GB. Estimaciones orientativas; el repo completo ocupa 43,7 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y contexto largo; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) para IQ2/IQ3.
- Cabe en consumer GPU: sí, en RTX 4090 con Q4_K_M o Q5_K_M; en RTX 3060 12 GB solo con cuantizaciones IQ2/Q2.
- Opciones de despliegue: llama.cpp, Ollama (tras importar el GGUF), servidores compatibles con endpoints OpenAI, LM Studio. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; requerirían los pesos safetensors originales.
- Latencia y throughput: no disponibles; dependerán de la GPU, la cuantización y si la arquitectura de looping añade pasadas extra.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored (i1-GGUF) | 30,36B | No disponible | No disponible | GGUF | Looping transformer + abliteración; benchmarks no publicados |
| Qwen3-32B (oficial) | 32,8B | 128K (según familia Qwen3) | Apache 2.0 | safetensors, GGUF | Referencia densa de tamaño similar con alineación estándar |
| Gemma 3 27B | 27B | 128K | Gemma Terms | safetensors, GGUF | Alternativa densa con visión; licencia restrictiva |
| Mistral Small 3 (24B) | 24B | 32K-128K | Apache 2.0 | safetensors, GGUF | Menor tamaño, ampliamente desplegado en local |

La comparación directa de rendimiento no es posible porque el modelo no publica benchmarks. La principal diferencia frente a las alternativas es la arquitectura de looping y el proceso de abliteración, que lo alejan del uso en producción estándar.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no debería usarse en producción sin una evaluación propia.
- Modelo abliterado y etiquetado "Uncensored": mayor probabilidad de generar contenido dañino, sesgado o ilegal; requiere moderación externa obligatoria.
- Licencia no disponible: no se puede confirmar el uso comercial; el modelo base Qwen3 suele ser Apache 2.0, pero el fine-tune no declara términos.
- Arquitectura experimental: el "looping transformer" puede presentar comportamientos atípicos, mayor latencia o incompatibilidades con kernels optimizados.
- Riesgo de alucinación elevado tras abliteración: la eliminación de capas de rechazo puede correlacionar con menor calibración factual.
- Idiomas no declarados: no se garantiza un rendimiento multilingüe uniforme.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; los pesos podrían contener errores de conversión.
- Cuantizaciones IQ1/IQ2: degradación severa de calidad; no recomendadas para tareas de razonamiento.
- Fecha de creación futura (2026-11-10) en los metadatos: posible inconsistencia que conviene verificar antes de confiar en el repo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored-i1-GGUF
- Modelo original: https://huggingface.co/DavidAU/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored
- Perfil del cuantizador: https://huggingface.co/mradermacher
- llama.cpp (runtime compatible): https://github.com/ggerganov/llama.cpp
