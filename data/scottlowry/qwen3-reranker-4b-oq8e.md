# scottlowry/Qwen3-Reranker-4B-oQ8e

## Resumen

Qwen3-Reranker-4B-oQ8e es una cuantización de precisión mixta del modelo Qwen3-Reranker-4B, publicada por el usuario scottlowry en Hugging Face. Se trata de un reranker de 4.021.784.576 parámetros (aproximadamente 4.022B) derivado de la familia Qwen3, orientado a la reordenación de resultados en pipelines de recuperación de información (RAG, búsqueda semántica). El modelo original es desarrollado por el equipo Qwen de Alibaba, aunque esta ficha se centra en la versión cuantizada distribuida por scottlowry.

La relevancia de esta publicación radica en su formato: está empaquetada para la librería MLX de Apple, lo que permite ejecutar el modelo en hardware Apple Silicon (chips M-series) con un peso efectivo de 8.500 bits por parámetro. El checkpoint ocupa 3.980 GiB (4.273 GB) en almacenamiento, lo que lo hace manejable en equipos con memoria unificada moderada, a diferencia de los pesos originales en BF16 que requerirían aproximadamente el doble de espacio.

La cuantización se realizó con la herramienta oQ de oMLX (versión v0.7.3.dev2) y aplica cuantización afín de 8 bits con grupo de 64 al 99,995% de los pesos, dejando una fracción mínima (0,005%) en BF16. Es importante señalar que la información disponible sobre el modelo base (licencia, idiomas, benchmarks, pipeline) no está publicada en esta ficha, por lo que varios apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, según tags del repo); detalles específicos no disponibles |
| Parametros totales | 4.021.784.576 (4.022B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Afín 8-bit con grupo 64 (99,995% de pesos); BF16 (0,005%); media efectiva 8.500 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería mlx) |
| Tamano del repositorio | 8,6 GB (checkpoint cuantizado: 4.273 GB / 3.980 GiB) |
| Libreria de inferencia | MLX (Apple) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3-Reranker-4B más allá de su pertenencia a la familia Qwen3 y de su función como reranker. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de entrenamiento. Tampoco se documenta si el modelo base empleó RLHF, DPO u otras técnicas de alineación, ni el número de tokens de entrenamiento.

La innovación técnica documentada en esta publicación es exclusivamente la cuantización: se aplicó oQ (oMLX v0.7.3.dev2), una técnica de cuantización de precisión mixta que asigna cuantización afín de 8 bits con tamaño de grupo 64 a la práctica totalidad de los pesos (99,995%) y mantiene una fracción residual en BF16. El resultado es un checkpoint con un promedio efectivo de 8.500 bits por peso, lo que reduce el almacenamiento a 3.980 GiB frente a los aproximadamente 8 GB que ocuparían los pesos en BF16. El autor indica que el modelo fue recuantizado el 2026-10-25 y recomienda volver a descargarlo si se posee una copia anterior.

## Capacidades

- Reordenación (reranking) de documentos o pasajes candidatos en pipelines de recuperación de información, función principal del modelo base Qwen3-Reranker.
- Puntuación de relevancia consulta-documento para mejorar la precisión de sistemas RAG y motores de búsqueda semántica.
- Ejecución en hardware Apple Silicon mediante MLX, aprovechando la memoria unificada de los chips M-series.
- Capacidades de generación de texto, razonamiento, código o matemáticas del modelo base: no documentadas en esta ficha.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reordenación en pipelines RAG: el modelo puede recibir una consulta y un conjunto de fragmentos recuperados por un buscador vectorial y reordenarlos por relevancia antes de pasarlos al generador, mejorando la calidad de las respuestas en asistentes documentales.
- Búsqueda semántica en bases de conocimiento internas: integrado en un motor de búsqueda corporativa, permite puntuar pares consulta-documento y priorizar los resultados más pertinentes sobre grandes colecciones de texto.
- Desarrollo local en Mac: gracias al formato MLX y a su tamaño de 3.980 GiB, puede ejecutarse en un Mac con memoria unificada suficiente para prototipar sistemas de recuperación sin depender de GPUs dedicadas ni de servicios en la nube.
- Evaluación de calidad de recuperación: útil para experimentar con distintas estrategias de chunking y embeddings, usando el reranker como juez de relevancia en conjuntos de validación.
- Filtrado de resultados en atención al cliente: en un sistema de soporte que recupera artículos de ayuda, el reranker puede seleccionar los fragmentos más relevantes antes de que el modelo generador redacte la respuesta, reduciendo respuestas fuera de contexto.
- Investigación sobre cuantización: sirve como caso de estudio para analizar el impacto de la cuantización afín de 8 bits con grupo 64 en tareas de reranking, comparando su comportamiento frente al checkpoint original en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint cuantizado ocupa 3.980 GiB (4.273 GB); se recomienda disponer de memoria unificada o VRAM adicional para el contexto y las activaciones, por lo que un equipo con 8 GB o más de memoria disponible sería el mínimo práctico orientativo.
- GPU recomendadas: no aplica de forma directa, ya que el formato es MLX y está pensado para Apple Silicon (chips M1, M2, M3, M4 y sus variantes Pro, Max y Ultra con memoria unificada suficiente).
- Compatibilidad con GPU consumer: no está documentada para GPUs NVIDIA o AMD en este formato; para esas plataformas sería necesario convertir o usar el modelo base en otro formato.
- Opciones de despliegue: MLX (librería nativa del ecosistema Apple); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Reranker-4B-oQ8e (este) | 4.022B | No disponible | safetensors (MLX, 8-bit) | No disponible | Hugging Face, 99 descargas |
| Qwen3-Reranker-4B (base, BF16) | 4.022B | No disponible | safetensors | No disponible | Hugging Face (referencia del autor) |
| Alternativas de reranking de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La licencia no está publicada en la ficha, por lo que no puede confirmarse si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base Qwen3-Reranker-4B antes de usarlo en producción.
- Al ser una cuantización de 8 bits, puede existir una degradación de precisión en las puntuaciones de relevancia respecto al checkpoint original en BF16; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es directamente utilizable en GPUs NVIDIA, AMD ni en entornos de servidor x86 convencionales sin conversión.
- No se documentan los idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones de contexto del modelo base.
- El autor advierte que el modelo fue recuantizado el 2026-10-25; las copias descargadas con anterioridad deben reemplazarse.
- El repositorio tiene 99 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.
- No se especifica el pipeline de Hugging Face, lo que puede dificultar la integración automática con herramientas que dependen de ese metadato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Qwen3-Reranker-4B-oQ8e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base de referencia (Qwen3-Reranker-4B): no disponible en la información proporcionada
