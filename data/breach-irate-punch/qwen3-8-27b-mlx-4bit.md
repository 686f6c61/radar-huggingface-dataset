# breach-irate-punch/Qwen3.8-27B-mlx-4Bit

## Resumen

breach-irate-punch/Qwen3.8-27B-mlx-4Bit es una conversión no oficial al formato MLX del modelo Qwen/Qwen3.8-27B, publicada por el usuario breach-irate-punch. Se trata de una cuantización a 4 bits generada con mlx-lm 0.31.2, pensada para ejecutar inferencia sobre chips de Apple (Apple Silicon) mediante el framework MLX. El repositorio declara la etiqueta de pipeline image-text-to-text, lo que indica que el modelo procesa entradas multimodales de imagen y texto, y conserva el tag conversational.

El interés de esta ficha es práctico: permite desplegar localmente un modelo de aproximadamente 26,9 mil millones de parámetros en un Mac con memoria unificada, con un peso de repositorio de 15,2 GB, sin depender de GPUs NVIDIA ni de servicios en la nube. Está licenciado bajo Apache 2.0, lo que en principio habilita uso comercial, y expone compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integración en servidores de inferencia con API compatible con OpenAI.

Las limitaciones de información son notables: la model card original se limita a las instrucciones de uso con mlx-lm y no incluye detalles de arquitectura, contexto, dataset de entrenamiento ni idiomas. No se han publicado benchmarks y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a servicios de música en streaming). El repositorio, creado el 20 de septiembre de 2026, contaba con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El tag del repositorio indica qwen3_5, pero la model card no especifica la arquitectura (transformer, MoE u otra) |
| Parámetros totales | 26.895.993.856 (~26,9 B) |
| Parámetros activos | No disponible; no se indica que el modelo sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit en formato MLX (única variante publicada en este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (conversión realizada con mlx-lm 0.31.2) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El repositorio es una conversión de pesos, no un entrenamiento: el autor indica explícitamente que el modelo se convirtió al formato MLX desde Qwen/Qwen3.8-27B usando mlx-lm 0.31.2. La etiqueta qwen3_5 sugiere una familia de arquitectura Qwen de tercera generación con revisión 5, y la etiqueta image-text-to-text implica un componente de codificación visual además del decodificador de lenguaje, pero ninguno de estos extremos se detalla en la model card.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento. Al ser una cuantización a 4 bits, la innovación técnica relevante es la propia compresión: se reduce el peso de los pesos desde precisión completa hasta aproximadamente 4,5 bits por parámetro (26,9 B de parámetros en 15,2 GB de repositorio), lo que habilita la ejecución en memoria unificada de Apple Silicon. Se desconoce el esquema exacto de cuantización por grupos (group size, bits de escalas) aplicado por mlx-lm en esta conversión.

## Capacidades

- Generación de texto conversacional, según el tag conversational del repositorio.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text), lo que implica capacidad de recibir imágenes junto a instrucciones en lenguaje natural. No se detalla el alcance (captioning, VQA, OCR, razonamiento visual).
- Razonamiento, matemáticas y generación de código: no confirmados en la información disponible, aunque son capacidades habituales de la familia Qwen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible.
- Compatibilidad con servidores de endpoints (tag endpoints_compatible), lo que sugiere posibilidad de exponer el modelo mediante una API HTTP.

## Casos de uso

- Prototipado local de asistentes multimodales en Mac: cargando el modelo con mlx-lm, un desarrollador puede probar flujos de imagen más texto (por ejemplo, describir un diagrama y pedir explicaciones) sin enviar datos a servicios externos.
- Análisis de documentos escaneados o capturas de pantalla con requisitos de privacidad: al ejecutarse íntegramente en el equipo, el contenido sensible no sale de la máquina, algo relevante en entornos legales, sanitarios o de auditoría interna.
- Asistente de programación en local: si la capacidad de código del modelo base se conserva tras la cuantización, puede integrarse en editores mediante un servidor local compatible con la API de OpenAI (mlx-lm.server) y ofrecer autocompletado o explicación de fragmentos sin coste por token.
- Procesamiento por lotes de imágenes en estaciones de trabajo Apple: un Mac Studio con memoria unificada amplia podría ejecutar tareas de descripción, etiquetado o extracción de información de imágenes en lotes, evitando el coste de GPU en nube.
- Evaluación comparativa de cuantizaciones: el repositorio sirve como punto de partida para medir la degradación de calidad de una cuantización 4-bit MLX frente al modelo base en precisión completa, en tareas concretas del equipo.
- Investigación sobre eficiencia de inferencia en Apple Silicon: permite medir latencia, consumo de memoria unificada y throughput de un modelo de ~27 B en 4 bits sobre distintos chips M-series.
- Chat conversacional multi-turno de uso interno: para equipos que ya trabajan en macOS y quieren un endpoint de chat local, siempre que la longitud de contexto del modelo base sea suficiente para las conversaciones previstas (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas multimodales, y los resultados de la búsqueda web no contenían información sobre este modelo.

## Requisitos de hardware

- Peso de los pesos en disco: 15,2 GB (repositorio completo, cuantización 4-bit MLX).
- Memoria unificada estimada para inferencia: un mínimo práctico de 18-20 GB, considerando pesos más caché KV y activaciones. Se recomienda un equipo con 24 GB de memoria unificada o superior; con 32 GB o 64 GB el margen para contextos largos y lotes es mucho mayor.
- GPU compatibles: exclusivamente Apple Silicon (chips M1, M2, M3, M4 y sus variantes Pro, Max y Ultra) a través de Metal y MLX. Este repositorio no es ejecutable en GPUs NVIDIA o AMD sin reconvertir los pesos a otro formato.
- ¿Cabe en GPU de consumo? No en el sentido habitual de GPUs dedicadas, porque MLX requiere Apple Silicon. En un Mac con 24 GB de memoria unificada sí cabe; en configuraciones de 16 GB el margen es muy justo y puede provocar swap.
- Opciones de despliegue: mlx-lm (CLI y API de Python), servidor HTTP de mlx-lm (útil por el tag endpoints_compatible), integración en aplicaciones macOS mediante MLX en Swift, y entornos de escritorio con soporte de modelos MLX en Apple Silicon. Para vLLM, llama.cpp, Ollama o TGI sería necesario disponer de pesos en formatos GGUF o safetensors estándar, no incluidos en este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento fiable. La única comparación verificable es con el modelo del que deriva, y solo en términos de formato y tamaño de pesos:

| Modelo | Parámetros | Formato y cuantización | Tamaño de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| breach-irate-punch/Qwen3.8-27B-mlx-4Bit | 26,9 B | safetensors MLX, 4 bits | 15,2 GB | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (modelo base) | No disponible en la fuente consultada | No disponible | No disponible | No confirmada en la información proporcionada | HuggingFace |
| Otras cuantizaciones o alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Conversión no oficial: no está publicada por Qwen ni avalada por el equipo original, por lo que no hay garantía de fidelidad de la conversión.
- Model card mínima: no documenta arquitectura, contexto, idiomas, datos de entrenamiento ni proceso de cuantización, lo que dificulta evaluar su idoneidad para producción.
- Degradación por cuantización: los pesos están reducidos a 4 bits, lo que típicamente implica pérdida de precisión frente al modelo en precisión completa, especialmente en tareas de razonamiento matemático y código. No hay mediciones publicadas de esa pérdida en este caso.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso real ni de informes de terceros.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos; no hay evaluaciones de fiabilidad publicadas para esta versión.
- Limitaciones de idioma y contexto: se desconoce la ventana de contexto efectiva y los idiomas soportados. Las familias Qwen suelen estar más optimizadas para inglés y chino que para castellano, pero esto no se puede confirmar con la información disponible.
- Restricciones de licencia: la licencia declarada en este repositorio es Apache 2.0, que permite uso comercial. No obstante, conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B, ya que los términos de la conversión no pueden ser más permisivos que los del original.
- Dependencia de plataforma: al estar en formato MLX, el modelo está atado a Apple Silicon. No es desplegable directamente en infraestructura con GPUs NVIDIA, lo que limita su uso en servidores convencionales.
- Nomenclatura: el nombre del repositorio indica 27B, mientras que el recuento real de safetensors es de 26.895.993.856 parámetros (~26,9 B). La discrepancia es menor, pero conviene tenerla en cuenta en cálculos de memoria.
- Información externa no verificada: la búsqueda web asociada no devolvió ninguna fuente relacionada con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/breach-irate-punch/Qwen3.8-27B-mlx-4Bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería mlx-lm (utilizada para la conversión, versión 0.31.2): https://github.com/ml-explore/mlx-lm
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre este modelo (los resultados obtenidos eran artículos sobre servicios de música en streaming, sin relación con el modelo).
