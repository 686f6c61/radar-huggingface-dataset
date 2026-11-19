# InstaDeepAI/CellScribe

## Resumen

CellScribe es un modelo generativo desarrollado por InstaDeepAI que describe células individuales de secuenciación de ARN de célula única (scRNA-seq) a lo largo de dos ejes complementarios: su identidad (linaje celular) y su estado (programas transcripcionales activos). El modelo condiciona un LLM preentrenado, Qwen2.5-0.5B-Instruct, sobre embeddings congelados de un modelo fundacional de célula única, scFoundation, mediante normalización de capas adaptativa (AdaLN). Esto permite que un mismo modelo realice anotación de tipos celulares y perfilado de estados transcripcionales según el prompt de tarea.

La relevancia del modelo radica en su enfoque de anotación abierta: además de las tareas supervisadas, CellScribe puede identificar tipos celulares fuera de su vocabulario de entrenamiento mediante aprendizaje en contexto (in-context learning), donde el prompt incluye unas pocas células de ejemplo etiquetadas y el modelo infiere el tipo de la célula consulta. El modelo fue entrenado con datos de CELLxGENE Census y del Curated Cancer Cell Atlas (3CA), y el paper asociado describe además un ajuste por refuerzo contra la distancia a la ontología celular y la concordancia de meta-programas.

Con 673.642.300 parámetros totales y un tamaño de repositorio de 2,7 GB, CellScribe se posiciona como una herramienta especializada para investigación biológica computacional, no como un LLM de propósito general. Su licencia Apache 2.0 facilita su uso en entornos académicos y comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM condicionado (Qwen2.5-0.5B-Instruct) con AdaLN sobre embeddings de scFoundation |
| Parametros totales | 673.642.300 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

CellScribe combina tres componentes: un codificador de célula congelado (scFoundation, Hao et al., 2024) que embebe los conteos crudos de la célula sobre 19.264 genes; una proyección lineal seguida de normalización de capas que transforma el embedding en un vector de condicionamiento; y un modelo de lenguaje Qwen2.5-0.5B-Instruct cuyo comportamiento se modula mediante normalización de capas adaptativa (AdaLN, Peebles y Xie, 2023). Las proyecciones AdaLN se inicializan a cero (AdaLN-Zero), de modo que el entrenamiento parte del modelo de lenguaje sin modificar. El LLM se invoca con un system prompt específico de tarea y una pregunta.

El entrenamiento se realizó sobre los datasets de CELLxGENE Census (para tipado celular) y del Curated Cancer Cell Atlas 3CA (para tipado celular y estado celular). El paper asociado describe además un ajuste por refuerzo contra la distancia a la ontología celular y la concordancia de meta-programas. Los meta-programas utilizados son los 41 programas malignos recurrentes identificados en 24 tipos de cáncer por Gavish et al. (Nature, 2023), agrupados en 11 hallmarks. El modelo genera tanto el tipo celular anclado a la ontología Cell Ontology de CELLxGENE como listas de programas activos con sus puntuaciones y el hallmark dominante.

## Capacidades

- Tipado celular (cell typing): genera un tipo celular anclado a la ontología Cell Ontology de CELLxGENE a partir de conteos crudos de scRNA-seq.
- Estado celular (cell state): genera un perfil cuantificado de meta-programas activos con puntuaciones de actividad y el hallmark dominante, basado en los 41 programas de 3CA agrupados en 11 hallmarks.
- Aprendizaje en contexto (in-context learning): identifica tipos celulares fuera del vocabulario supervisado cuando el prompt incluye unas pocas células de ejemplo etiquetadas.
- Procesamiento por lotes: la API de generación acepta múltiples células simultáneamente mediante tokenización por lotes.
- Generación de texto conversacional: hereda la capacidad de generación de texto de Qwen2.5-0.5B-Instruct, aunque el modelo está especializado en tareas biológicas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés (en).
- Capacidades especiales: condicionamiento sobre embeddings biológicos congelados; parseo integrado de respuestas (`parse_cell_type`, `parse_cell_state`).

## Casos de uso

- Anotación automatizada de tipos celulares en estudios de scRNA-seq: el modelo recibe conteos crudos sobre 19.264 genes y devuelve un tipo celular anclado a Cell Ontology, lo que permite sustituir o asistir la anotación manual en pipelines de análisis de datos de célula única.
- Perfilado de estados transcripcionales en tumores: dado un conjunto de células malignas, CellScribe genera los meta-programas activos con sus puntuaciones y el hallmark dominante, útil para caracterizar heterogeneidad intratumoral en estudios de cáncer basados en 3CA.
- Descubrimiento de tipos celulares no supervisados: mediante aprendizaje en contexto, el modelo puede identificar tipos celulares que no forman parte de su vocabulario de entrenamiento proporcionando unas pocas células de ejemplo etiquetadas en el prompt.
- Integración en pipelines de análisis de célula única: al ser un `torch.nn.Module` cargable con `trust_remote_code=True`, puede incorporarse en flujos de trabajo existentes de Python (pandas, PyTorch) para anotar lotes de células de forma programática.
- Validación cruzada de anotaciones existentes: el modelo puede utilizarse como segundo anotador para contrastar las etiquetas de tipo celular generadas por otros métodos o por anotadores humanos en estudios de transcriptómica.
- Investigación en biología computacional y desarrollo de métodos: al ser un modelo pequeño (673M parámetros) con licencia Apache 2.0, sirve como base para experimentos de condicionamiento de LLMs sobre embeddings biológicos y para fine-tuning en tareas específicas de anotación celular.
- Docencia y prototipado en bioinformática: su tamaño reducido y su API sencilla permiten desplegarlo en entornos con recursos limitados para demostraciones de anotación celular asistida por LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 673.642.300 parámetros en precisión completa (fp32) se requieren aproximadamente 2,7 GB solo para los pesos, más el codificador scFoundation congelado y las activaciones; en fp16/bf16 el peso del LLM se reduce a aproximadamente 1,35 GB, pero debe sumarse el codificador de célula.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `.to("cuda")` sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; por el tamaño de parámetros es plausible en GPUs de consumo con VRAM suficiente, pero no se confirma en la información proporcionada.
- Opciones de despliegue: carga mediante `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)` y `AutoTokenizer`; requiere `torch>=2.6`, `transformers>=4.51,!=5.3.0`, `accelerate` y `pandas`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de anotación celular o LLMs condicionados sobre embeddings biológicos.

## Limitaciones y advertencias

- El modelo solo soporta inglés (`en`) según los metadatos y la model card.
- El tipado celular está anclado al vocabulario de Cell Ontology de CELLxGENE; los tipos fuera de ese vocabulario solo pueden abordarse mediante aprendizaje en contexto con ejemplos etiquetados.
- El perfilado de estado celular se limita a los 41 meta-programas malignos de 3CA agrupados en 11 hallmarks, por lo que no cubre estados transcripcionales fuera de ese catálogo.
- El codificador scFoundation espera conteos crudos sobre 19.264 genes; desviaciones en el panel génico o en el preprocesamiento pueden afectar a los resultados.
- Riesgo de alucinación: al ser un modelo generativo, las respuestas de tipo celular o de programas activos pueden no ser biológicamente válidas; se recomienda validación con el parseo integrado y revisión experta.
- Sesgos conocidos: no disponible en la información proporcionada; los sesgos dependerán de la composición de CELLxGENE Census y 3CA.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia de los componentes subyacentes (Qwen2.5-0.5B-Instruct y scFoundation) para producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; debe auditarse antes de desplegar en producción.
- El modelo tiene solo 19 descargas y 0 likes en Hugging Face en la fecha de la información, lo que indica una adopción comunitaria muy limitada y poca validación externa.
- No se dispone de datos sobre longitud de contexto, cuantizaciones soportadas ni latencia, lo que dificulta planificar despliegues a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InstaDeepAI/CellScribe
- Paper (bioRxiv 2026): https://www.biorxiv.org/content/10.64898/2026.10.07.757352
- Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- scFoundation (paper Nature): https://www.nature.com/articles/s41592-024-02305-7
- AdaLN (Peebles y Xie, ICCV 2023): https://openaccess.thecvf.com/content/ICCV2023/html/Peebles_Scalable_Diffusion_Models_with_Transformers_ICCV_2023_paper.html
- CELLxGENE Census: https://chanzuckerberg.github.io/cellxgene-census/
- Curated Cancer Cell Atlas (3CA): https://www.weizmann.ac.il/sites/3CA/
- Gavish et al., Nature 2023: https://www.nature.com/articles/s41586-023-06130-4
