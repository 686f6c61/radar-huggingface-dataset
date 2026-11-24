# mxlabs/qwen3.5-decision-hr

## Resumen

mxlabs/qwen3.5-decision-hr es un ajuste fino (finetune) del modelo Qwen3.5-4B de Alibaba Qwen, publicado por el usuario mxlabs en formato MLX (Apple Silicon) y con pesos en safetensors. El nombre del repositorio sugiere una especialización en toma de decisiones en el ámbito de recursos humanos ("decision-hr"), aunque la model card publicada no incluye ninguna descripción funcional, dataset de entrenamiento ni detalles sobre el proceso de ajuste, por lo que esa orientación es una inferencia a partir del identificador y no un dato confirmado por el autor.

El modelo base, Qwen3.5-4B, es un transformer denso de aproximadamente 4.500 millones de parámetros, distribuido con licencia Apache 2.0. El repositorio ocupa 9,1 GB, coherente con pesos en precisión bf16/fp16 para un modelo de ese tamaño. La librería declarada es MLX, el framework de Apple para inferencia y entrenamiento en chips de la serie M, lo que implica que el checkpoint está pensado para ejecutarse en macOS sobre Apple Silicon, no necesariamente en CUDA.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo tiene cero descargas y cero likes en el momento de la consulta, no se han publicado benchmarks, no se declaran idiomas soportados y la model card no aporta información sobre el ajuste. Se trata, por tanto, de un artefacto de nicho cuyo interés principal es técnico (formato MLX sobre un base Qwen3.5), no un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-4B; detalles no disponibles en la model card) |
| Parametros totales | 4.539.264.000 (4,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; el ecosistema MLX permite cuantización, pero el autor no la documenta) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3.5-4B, un transformer denso de 4.539 millones de parámetros según los pesos safetensors del repositorio. La model card no documenta la arquitectura interna del base (número de capas, dimensión oculta, cabezas de atención, tipo de atención, vocabulario) ni si incorpora innovaciones como atención lineal o decodificación especulativa; esos datos deberían consultarse en la ficha oficial de Qwen3.5-4B.

Respecto al entrenamiento, la información disponible es prácticamente nula. Se sabe que el modelo deriva de unsloth/Qwen3.5-4B (a su vez basado en Qwen/Qwen3.5-4B) y que la publicación se etiqueta con "unsloth" y "mlx", lo que sugiere un ajuste fino realizado con las herramientas de Unsloth y posteriormente convertido o exportado a formato MLX. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o SFT, ni hiperparámetros del ajuste. Cualquier afirmación sobre el proceso de entrenamiento más allá de esto sería especulativa.

## Capacidades

- Generación de texto conversacional: la pipeline declarada es text-generation con etiqueta conversational, por lo que el modelo está orientado a diálogo multi-turno.
- Especialización probable en decisiones de recursos humanos: el identificador "decision-hr" apunta a un ajuste para tareas de selección, evaluación o políticas de personal, pero el autor no documenta esta capacidad.
- Herencia de las capacidades del base Qwen3.5-4B: razonamiento, código y matemáticas en la medida en que el base las soporte; no verificable con la información disponible.
- Tool calling / function calling: no disponible en la documentación del ajuste.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío).
- Capacidades especiales (modo thinking, visión, audio): no disponibles para este ajuste.

## Casos de uso

- Prototipado de asistentes de RR. HH. en local: el modelo puede desplegarse en un Mac con Apple Silicon mediante MLX para probar flujos de preguntas y respuestas sobre políticas internas, sin depender de la nube. Adecuado por su tamaño contenido (4,5 B) y su formato nativo MLX.
- Evaluación de candidatos con revisión humana: uso como borrador de primeras cribas o resúmenes de currículos, siempre con supervisión humana y auditoría de sesgos, dado que no hay documentación sobre el dataset de ajuste.
- Generación de borradores de comunicaciones internas: redacción de correos, actas o descripciones de puesto a partir de instrucciones, aprovechando la naturaleza conversacional del checkpoint.
- Experimentación académica con ajustes finos en MLX: serviría como caso de estudio de un finetune de Qwen3.5-4B exportado a MLX, comparando su comportamiento con el base en tareas controladas.
- Chatbot interno de consulta documental: integrado en una aplicación macOS con recuperación aumentada (RAG) sobre manuales de empresa, usando el modelo como generador final de respuestas.
- Pruebas de regresión de pipelines de decisión: emplearlo como referencia en tests automatizados que comparen respuestas ante casos sintéticos de RR. HH., verificando consistencia antes de sustituirlo por un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: con 4,54 B de parámetros, los pesos en bf16 ocupan aproximadamente 9,1 GB, lo que coincide con el tamaño del repositorio. En cuantización de 8 bits se reduciría a unos 4,5 GB y en 4 bits a unos 2,3 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: al estar en formato MLX, el destino natural son chips Apple M1/M2/M3/M4 con al menos 16 GB de memoria unificada; en CUDA haría falta una conversión previa a otro formato (por ejemplo, GGUF o safetensors estándar) y una GPU con 12-16 GB de VRAM como una RTX 4080/4090 o una A10.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM tras conversión; en Apple Silicon, en equipos con 16 GB de memoria unificada o más.
- Opciones de despliegue: MLX (mlx-lm) de forma nativa; para otros entornos sería necesario convertir los pesos a llama.cpp/Ollama (GGUF), vLLM o TGI, conversión no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mxlabs/qwen3.5-decision-hr | 4,54 B | No disponible | Apache 2.0 | safetensors (MLX) | Finetune de nicho, sin benchmarks ni descargas |
| Qwen/Qwen3.5-4B (base) | ~4 B | No disponible en esta ficha | Apache 2.0 | safetensors | Modelo oficial de referencia; capacidades generales documentadas por Qwen |
| unsloth/Qwen3.5-4B | ~4 B | No disponible en esta ficha | Apache 2.0 | safetensors | Checkpoint intermedio del que deriva este ajuste |
| Llama 3.2 3B Instruct | 3,2 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Alternativa generalista de tamaño similar, con restricciones de licencia para grandes usuarios |

La comparación con alternativas de la misma categoría (modelos densos de 3-5 B) es difícil porque este ajuste no publica métricas; la referencia válida es el propio Qwen3.5-4B base.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe el dataset, el proceso de ajuste ni los criterios de evaluación, lo que impide auditar el comportamiento del modelo.
- Riesgo elevado de sesgos no caracterizados: un finetune orientado a decisiones de RR. HH. sin documentación puede incorporar sesgos de selección, género, edad u origen que no han sido medidos ni mitigados.
- Riesgo de alucinación: inherente a los modelos de 4 B, especialmente en tareas de razonamiento largo o consultas factuales; no hay evaluaciones que lo cuantifiquen.
- Contexto e idiomas desconocidos: al no declararse la ventana de contexto ni los idiomas, no se puede garantizar su comportamiento en castellano ni en documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el cumplimiento normativo (por ejemplo, RGPD en decisiones automatizadas sobre personas) y sobre la procedencia de los datos de ajuste, no documentada.
- Formato MLX: requiere conversión para desplegarse en CUDA o en servidores Linux estándar; no hay pesos GGUF ni cuantizaciones publicadas.
- Madurez nula: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mxlabs/qwen3.5-decision-hr
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3.5-4B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Framework MLX: https://github.com/ml-explore/mlx
- Herramientas Unsloth: https://github.com/unslothai/unsloth
