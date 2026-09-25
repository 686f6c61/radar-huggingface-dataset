# Johneeee/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-fp16-oQ63e-text

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-fp16-oQ63e-text es una revisión cuantizada del modelo base Qwen3.8-27B, publicada por el usuario Johneeee en Hugging Face. No es un modelo entrenado desde cero, sino una conversión de pesos: el autor ha aplicado cuantización de precisión mixta con la herramienta oQ (oMLX v0.7.0.dev4) sobre los pesos del modelo original, que según los resultados de búsqueda corresponde a la familia Qwen3.8 de Alibaba, descrita como un modelo denso, multimodal nativo y de pesos abiertos orientado a código, flujos agénticos y automatización de oficina.

El resultado es un artefacto de 26.895.998.464 parámetros reales (≈26,9 mil millones) almacenado en safetensors de MLX con cuantización de 5 bits y tamaño de grupo 64, lo que reduce el repositorio a 21,5 GB. El sufijo "text" del identificador sugiere que se trata de una variante centrada en texto, y el sufijo "fp16" indica que parte de los componentes se mantienen en precisión completa dentro de un esquema de precisión mixta.

Su relevancia es práctica y de nicho: permite ejecutar un modelo denso de casi 27B en equipos Apple Silicon con memoria unificada moderada, algo que en fp16 requeriría alrededor de 54 GB solo para los pesos. El coste es la ausencia total de documentación: no hay model card descriptiva, licencia declarada, idiomas soportados, pipeline ni métricas publicadas, y el repositorio acumula 0 descargas y 0 likes en la fecha de consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (tipo declarado en los tags: qwen3_5); sin capas MoE según la descripción del modelo base |
| Parámetros totales | 26.895.998.464 (≈26,9 mil millones), dato real de los safetensors |
| Parámetros activos | No aplica (arquitectura densa) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 5 bits, group size 64, precisión mixta mediante oQ (oMLX v0.7.0.dev4); componentes parciales en fp16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors (tamaño de repositorio: 21,5 GB) |
| Librería de inferencia | mlx |
| Autor de la conversión | Johneeee (usuario de la comunidad) |
| Fecha de creación / actualización | 2026-09-25 / 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no aporta información sobre el entrenamiento del modelo base, y esta ficha no dispone de datos verificados sobre el número de tokens, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras). Lo único documentado por el autor es el proceso de cuantización: se ha usado oQ, la herramienta de cuantización de precisión mixta de oMLX en su versión v0.7.0.dev4, con 5 bits por peso y tamaño de grupo 64, en formato MLX safetensors. El identificador incluye "fp16" y la model card etiqueta el resultado como "mixed-precision", lo que implica que no todos los tensores están a 5 bits: determinadas capas o componentes se conservan en fp16 para preservar calidad, y eso explica que el repositorio (21,5 GB) sea notablemente mayor que el cálculo puramente teórico de 26,9B parámetros a 5 bits (≈16,8 GB de pesos, más aproximadamente 1,7 GB de escalas y sesgos por grupo).

El modelo base, según los resultados de búsqueda, sería Qwen3.8-27B, presentado por el equipo Qwen de Alibaba como un modelo denso de pesos abiertos y multimodal nativo, orientado a código, workflows agénticos y automatización ofimática. Conviene señalar una inconsistencia de nomenclatura: el tag interno declara "qwen3_5" mientras que el nombre del repositorio usa "Qwen3.8-27B", y la variante aquí publicada lleva el sufijo "text". No hay información en el material disponible que aclare si esta revisión elimina o conserva los componentes multimodales del modelo original.

## Capacidades

- No hay documentación específica de capacidades para esta revisión cuantizada. Las capacidades listadas a continuación proceden de la descripción del modelo base en los resultados de búsqueda y no han sido verificadas sobre este artefacto concreto.
- Generación de texto y conversación multi-turno (capacidad heredada del modelo base).
- Generación y asistencia en código, incluyendo tareas de programación en producción según la descripción del repositorio base.
- Flujos agénticos: el modelo base se presenta como adecuado para workflows de agentes y razonamiento en varios pasos.
- Automatización de tareas ofimáticas.
- Multimodalidad nativa en el modelo base (no confirmada en esta variante, que se etiqueta como "text").
- Soporte de tool calling / function calling: no disponible en la documentación de esta revisión.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo de razonamiento o "thinking mode": no disponible.

## Casos de uso

- Asistencia de programación en local sobre Apple Silicon: con 26,9B parámetros en 5 bits y un repositorio de 21,5 GB, el modelo puede ejecutarse íntegramente en un Mac con 32 GB o más de memoria unificada, lo que permite autocompletado, revisión de código y explicación de fragmentos sin enviar código propietario a servicios externos.
- Automatización de refactorizaciones en pipelines de integración continua: integrado mediante `mlx_lm.server` como endpoint compatible con la API de OpenAI, puede invocarse desde scripts de CI para generar parches, resumir diffs o proponer tests adicionales, siempre que el runner disponga de hardware Apple Silicon.
- Procesamiento por lotes de documentación técnica: generación de resúmenes, extracción de entidades y normalización de textos largos en un entorno local, útil cuando existen restricciones de confidencialidad que impiden usar APIs en la nube.
- Prototipado de agentes de automatización ofimática: el modelo base se describe orientado a tareas de oficina, de modo que esta revisión sirve para experimentar con flujos que redacten correos, clasifiquen incidencias o rellenen plantillas, aprovechando la ventana de contexto del modelo original (longitud no publicada en esta revisión).
- Base para investigación en cuantización: al ser una conversión de precisión mixta con grupo 64, resulta un objeto de estudio útil para medir la degradación de calidad frente a los pesos fp16 y frente a las variantes hermanas oQ5e y oQ6e del mismo autor.
- Despliegue educativo y de evaluación interna: con 0 descargas y sin benchmarks publicados, encaja como candidato para que un equipo realice su propia evaluación comparativa antes de adoptarlo, dado que el coste de descarga (21,5 GB) es asumible en un portátil moderno.
- Ejecución en estaciones de trabajo con memoria unificada limitada: permite mantener un modelo de casi 27B residente en memoria junto con otras herramientas de desarrollo, algo inviable en fp16 con el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni para el modelo cuantizado ni como referencia del modelo base. Tampoco se publican mediciones de perplejidad que permitan cuantificar la degradación introducida por la cuantización a 5 bits.

## Requisitos de hardware

- Pesos teóricos a 5 bits: 26.895.998.464 × 5 / 8 ≈ 16,8 GB, más aproximadamente 1,7 GB de escalas y sesgos con group size 64 y precisión fp16, lo que da un mínimo teórico cercano a 18,5 GB.
- Tamaño real del repositorio: 21,5 GB, superior al cálculo teórico por los componentes conservados en fp16 dentro del esquema de precisión mixta.
- Memoria unificada recomendada: 32 GB como mínimo razonable para cargar los pesos y disponer de margen para la caché KV; 36 GB o 48 GB si se trabaja con contextos largos o con otros procesos en paralelo.
- VRAM estimada para inferencia: en torno a 22-25 GB incluyendo caché KV y overhead del runtime, dependiendo de la longitud de contexto efectiva (no publicada). Como referencia externa, LLM Explorer cifra en 22,5 GB la variante hermana oQ6e-fp16, ligeramente superior en bits.
- GPU compatibles: al tratarse de un artefacto MLX, el destino natural es Apple Silicon (series M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra con memoria unificada suficiente). No es un formato para CUDA.
- GPU consumer NVIDIA: no aplicable directamente; requeriría conversión previa a GGUF u otro formato para usarse con llama.cpp o vLLM. No se documenta dicha conversión en el repositorio.
- Opciones de despliegue: MLX mediante `mlx-lm` (CLI y servidor HTTP), entornos gráficos con soporte MLX como LM Studio y otras aplicaciones que acepten safetensors de MLX. Para llama.cpp, Ollama o TGI sería necesaria una conversión de formato que no está incluida en el artefacto.
- Latencia y throughput: no disponibles. No se han publicado mediciones para esta revisión ni para el modelo base en hardware Apple Silicon.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto del modelo base, por lo que la comparación se limita a las características de formato y tamaño de las distintas revisiones publicadas por el mismo autor. Se incluye también el modelo base como referencia nominal.

| Modelo | Parámetros | Cuantización | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Johneeee/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-fp16-oQ63e-text (esta ficha) | 26,9B | 5 bits, group 64, precisión mixta | MLX safetensors | No disponible | Publicado, 0 descargas |
| Johneeee/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ5e | No disponible | 5 bits (oQ) | MLX safetensors | No disponible | Publicado |
| Johneeee/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ5e-fp16 | No disponible | 5 bits con componentes fp16 | MLX safetensors | No disponible | Publicado |
| Johneeee/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ6e-fp16 | ≈27B | 6 bits con componentes fp16 | MLX safetensors | No disponible | Publicado; VRAM estimada 22,5 GB según LLM Explorer |
| Qwen3.8-27B (modelo base) | No disponible | Original (sin cuantizar) | No disponible en el material consultado | No disponible | Repositorio en GitHub de Alibaba Cloud Official |

No se dispone de información suficiente para comparar este artefacto con alternativas de otros autores de tamaño o tarea equivalente.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card descriptiva, ni pipeline declarado, ni idiomas soportados, ni evaluación de calidad. Cualquier uso en producción exige una validación propia previa.
- Licencia no declarada: sin licencia explícita no puede asumirse permiso para uso comercial. La licencia del modelo base tampoco se especifica en el material consultado, por lo que la situación legal de esta conversión es indeterminada.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se ha publicado ninguna medición de fidelidad factual para esta revisión.
- Degradación por cuantización: la conversión a 5 bits con group size 64 puede afectar a tareas sensibles a la precisión numérica, como matemáticas, razonamiento de varios pasos o generación de código con dependencias sutiles. No hay perplejidad ni benchmarks publicados que cuantifiquen ese impacto.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgo para este artefacto.
- Limitaciones de contexto e idioma: se desconocen tanto la ventana de contexto efectiva como los idiomas soportados. No debe asumirse un rendimiento multilingüe correcto en castellano.
- Incompatibilidad de ecosistema: al ser MLX, no es directamente utilizable en GPUs NVIDIA ni en herramientas estándar del ecosistema CUDA (vLLM, TGI, TensorRT-LLM) sin una conversión intermedia no documentada.
- Ambigüedad de nomenclatura: el tag interno indica "qwen3_5" mientras que el nombre del repositorio indica "Qwen3.8-27B", y el sufijo "text" sugiere una variante solo texto. No hay confirmación de si se han eliminado los componentes multimodales del modelo base.
- Madurez: 0 descargas y 0 likes en la fecha de consulta, sin historial de uso ni reportes de terceros. Las fechas de creación y actualización (2026-09-25) constan así en los metadatos del repositorio.
- Precisión de las estimaciones de hardware: los valores de memoria indicados en esta ficha son cálculos derivados del número de parámetros y del tamaño del repositorio, no mediciones publicadas por el autor.

## Enlaces

- Repositorio principal en Hugging Face: https://huggingface.co/Johneeee/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-fp16-oQ63e-text
- Variante hermana oQ5e: https://huggingface.co/Johneeee/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ5e
- Variante hermana oQ5e-fp16: https://huggingface.co/Johneeee/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ5e-fp16
- Ficha de la variante oQ6e-fp16 en LLM Explorer: https://llm-explorer.com/model/Johneeee%2FQwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ6e-fp16,1Ysl556HKInQxBfDEA5Wwy
- Variante oQ5e en FriendliAI: https://friendli.ai/models/Johneeee/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ5e
- Repositorio del modelo base Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
