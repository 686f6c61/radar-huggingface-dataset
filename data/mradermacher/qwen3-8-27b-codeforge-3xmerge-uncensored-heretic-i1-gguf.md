# mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF

## Resumen
Esta ficha describe la cuantización GGUF realizada por mradermacher del modelo xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic, un merge de tres variantes derivadas de la familia Qwen3.8 orientado a generación de código, razonamiento y uso agéntico. El modelo original tiene 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las de dicha licencia.

El interés de esta publicación reside en que ofrece cuantizaciones con imatrix (importancia matrix) en una amplia gama de tipos (desde i1-Q2_K de 11 GB hasta i1-Q6_K de 22,5 GB), lo que permite desplegar un modelo de 27B en hardware de consumo con pérdida de calidad controlada. El modelo base incorpora las etiquetas heretic, uncensored, decensored y abliterated, lo que indica que se ha aplicado una técnica de eliminación de rechazos (abliteration) sobre el modelo original, con las implicaciones éticas y de seguridad que ello conlleva.

La model card es escasa en detalles técnicos: no se especifican la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. La información disponible se limita a los metadatos de Hugging Face, la lista de cuantizaciones y las etiquetas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8, según etiquetas del autor); detalles no disponibles |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (con imatrix) |
| Idiomas soportados | en, zh (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento
No se dispone de información detallada sobre la arquitectura interna más allá de la designación Qwen3.8 y la etiqueta "merge", que indica que el modelo base es una fusión de tres variantes (3xMerge). Las etiquetas incluyen "distillation", "efficient-thinking", "agentic", "tool-use" e "instruction-following", lo que sugiere que el entrenamiento incorporó destilación y optimización para razonamiento eficiente y uso de herramientas, aunque no se aportan cifras de tokens, composición del dataset ni detalles sobre RLHF/DPO.

La componente "heretic" y "abliterated" indica que se ha aplicado una técnica de abliteration para eliminar el comportamiento de rechazo del modelo original. El proceso de cuantización de mradermacher emplea imatrix (matriz de importancia) para mejorar la calidad de las cuantizaciones de baja precisión, y ofrece tanto cuantizaciones estáticas (en el repositorio hermano) como estas i1 (importancia mejorada).

## Capacidades
- Generación de código y code-generation, según las etiquetas del autor.
- Razonamiento (reasoning) y "efficient-thinking", orientado a cadenas de pensamiento eficientes.
- Uso agéntico y tool-use / function calling, según etiquetas.
- Instruction-following para tareas conversacionales.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Modelo marcado como vision model por el cuantizador, con posibles archivos mmproj en el repositorio estático (no confirmado en la información disponible).
- Comportamiento "uncensored" / "decensored": ausencia de rechazos ante peticiones que el modelo original rechazaría.

## Casos de uso
- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar, refactorizar o generar tests, aprovechando su orientación a code-generation y su licencia Apache 2.0.
- Asistentes de programación en local: las cuantizaciones i1-Q4_K_M (16,9 GB) permiten ejecutar el modelo en una GPU de consumo de 24 GB, habilitando asistentes de código sin conexión.
- Automatización agéntica con tool calling: las etiquetas agentic y tool-use sugieren su uso en flujos multi-paso con invocación de funciones, aunque no se especifica el formato exacto de tool calling.
- Razonamiento eficiente en entornos con recursos limitados: la etiqueta efficient-thinking apunta a un modo de razonamiento optimizado para latencia, adecuado para tareas de análisis que requieren pasos intermedios.
- Investigación sobre alineación y seguridad: al ser un modelo abliterated, es útil para estudiar el comportamiento de modelos sin rechazos y evaluar riesgos.
- Procesamiento de documentación técnica bilingüe inglés-chino: el soporte de ambos idiomas permite tareas de traducción técnica o generación de documentación en esos idiomas.
- Despliegue en hardware de consumo: las cuantizaciones desde 11 GB (i1-Q2_K) hasta 22,5 GB (i1-Q6_K) permiten ajustar el equilibrio calidad/VRAM en estaciones de trabajo con GPUs de 12 a 24 GB.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (según tamaño de cuantización): i1-Q2_K ~11 GB, i1-Q3_K_S ~12,4 GB, i1-IQ3_M ~12,9 GB, i1-Q4_K_S ~15,9 GB, i1-Q4_K_M ~16,9 GB, i1-Q5_K_M ~19,6 GB, i1-Q6_K ~22,5 GB (más overhead de contexto y KV cache).
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K se recomienda 24 GB o más. Para despliegues de mayor throughput, A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q6_K; en GPUs de 12-16 GB con cuantizaciones Q2-Q3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que se requeriría el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic (i1-GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Merge abliterated orientado a código |
| Modelo base xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic | 27,3B | no disponible | Apache 2.0 | safetensors | Versión sin cuantizar |
| Cuantizaciones estáticas de mradermacher (Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Misma base, sin imatrix |
| Alternativas de 27B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks para comparar |

## Limitaciones y advertencias
- El modelo es "uncensored" / "abliterated": no aplica rechazos de seguridad, lo que puede producir contenido dañino, ilegal o sesgado; no es apto para producción orientada al usuario sin filtros adicionales.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad ni benchmarks que permitan cuantificar la tasa de alucinación.
- Idiomas limitados a inglés y chino según la model card; el rendimiento en castellano no está verificado.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Las cuantizaciones de baja precisión (Q2, Q3) degradan la calidad; se recomienda Q4_K_M o superior para uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre la legalidad del contenido generado.
- El repositorio ocupa 218,6 GB, lo que requiere espacio de almacenamiento considerable si se descargan varias cuantizaciones.
- No se dispone de información sobre el dataset de entrenamiento, lo que impide evaluar sesgos de origen.

## Enlaces
- Repositorio Hugging Face (i1-GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
