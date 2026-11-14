# Austriani/Qwen3.5-9B-ik_llama.cpp

## Resumen

Qwen3.5-9B-ik_llama.cpp es una cuantización GGUF del modelo Qwen/Qwen3.5-9B, publicada por el usuario Austriani en Hugging Face. Se trata de una conversión orientada al motor de inferencia ik_llama.cpp, una bifurcación de llama.cpp centrada en rendimiento, que emplea el formato de cuantización IQK (trellis-quant) con calibración de imatrix de tercera generación (v3-calibration). El modelo base es un transformer denso de 9.000 millones de parámetros con arquitectura híbrida que combina atención lineal de tipo Gated DeltaNet con atención clásica, y está diseñado para tareas multimodales (imagen, vídeo y texto), razonamiento, código y flujos agénticos.

La relevancia de esta publicación reside en que ofrece una vía de despliegue local eficiente de un modelo de 9B con ventana de contexto nativa de 262.144 tokens y capacidades de visión y vídeo, manteniendo la licencia Apache 2.0 del modelo original. Al estar empaquetado en GGUF, puede ejecutarse en hardware de consumo mediante ik_llama.cpp, lo que reduce la barrera de entrada frente a despliegues en GPU de datacenter.

No obstante, la información publicada es escasa: la model card se limita a metadatos y a una presentación visual, sin detallar la composición del dataset de calibración, los niveles de cuantización disponibles ni resultados de evaluación. Esta ficha refleja únicamente los datos verificables en la información proporcionada y marca como no disponible todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido con Gated DeltaNet (atención lineal) y atención clásica; multimodal (image-text-to-text) |
| Parametros totales | 9B (aproximado, según denominación del modelo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K, contexto nativo según la model card) |
| Tipos de cuantizacion | GGUF con esquema IQK (trellis-quant) calibrado con imatrix v3; niveles concretos no disponibles |
| Idiomas soportados | Inglés (en) según metadatos; cobertura multilingüe del modelo base no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que intercala capas de atención lineal basadas en Gated DeltaNet con capas de atención tradicional. Este diseño busca reducir el coste computacional y de memoria en contextos largos, permitiendo sostener una ventana nativa de 262.144 tokens sin el crecimiento cuadrático típico de la atención completa. El modelo es denso (no utiliza mezcla de expertos) y está capacitado para entrada multimodal de imagen y vídeo, además de texto.

La publicación de Austriani no entrena el modelo desde cero, sino que produce una cuantización del checkpoint original de Qwen. El proceso aplica cuantización de tipo trellis (IQK) con una matriz de importancia (imatrix) generada mediante calibración v3, una técnica que pondera los pesos según su relevancia para minimizar la pérdida de calidad en precisiones bajas. No se especifican en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla el conjunto de datos de calibración empleado para la imatrix.

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte declarado para modo de razonamiento (reasoning).
- Generación y asistencia de código (coding) según las etiquetas del autor.
- Comprensión multimodal de imágenes (pipeline image-text-to-text).
- Procesamiento de vídeo, según la etiqueta "video" de la model card.
- Capacidades agénticas y flujos de trabajo con múltiples pasos (agentic).
- Manejo de contexto largo gracias a la ventana nativa de 262K tokens.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: los metadatos solo declaran inglés; el alcance multilingüe real no está documentado.

## Casos de uso

- Análisis de documentos extensos: la ventana de 262K tokens permite ingerir informes, contratos o bases de código completas en una sola pasada, útil para resumen y extracción de entidades sin fragmentación.
- Asistencia de código en local: un modelo de 9B cuantizado en GGUF puede ejecutarse en estaciones de trabajo con GPU de consumo para autocompletado, revisión y generación de tests dentro de pipelines de desarrollo.
- Procesamiento de vídeo e imagen: al ser image-text-to-text con soporte de vídeo, sirve para descripción de escenas, moderación de contenido visual o generación de metadatos a partir de material audiovisual.
- Agentes autónomos de investigación: la combinación de contexto largo y capacidades agénticas permite encadenar búsquedas, lectura de fuentes y síntesis en tareas de análisis.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con ik_llama.cpp, los datos no salen de la infraestructura, lo que encaja en sectores regulados.
- Prototipado rápido de aplicaciones multimodales: el formato GGUF y la licencia Apache 2.0 facilitan experimentar sin coste de licencia ni dependencia de API externa.
- Atención al cliente con contexto largo: la ventana de 262K permite mantener historiales de conversación muy extensos y recuperar información de interacciones previas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo denso de 9B, las estimaciones orientativas según cuantización serían aproximadamente 6-7 GB en Q4, 9-10 GB en Q6 y 17-18 GB en FP16, aunque los niveles IQK concretos publicados no se especifican.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cabría esperar ejecución en GPUs de consumo de gama alta (por ejemplo, RTX 4090 con 24 GB) y en GPUs de datacenter (A100, H100) para mayor throughput; sin datos verificados.
- Viabilidad en GPU de consumo: previsiblemente sí en cuantizaciones de 4 a 6 bits con GPUs de 8-24 GB, aunque no está confirmado por el autor.
- Opciones de despliegue: ik_llama.cpp (motor objetivo de esta publicación). La compatibilidad con llama.cpp estándar, Ollama, vLLM o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-ik_llama.cpp (esta ficha) | 9B | 262K | Sí (imagen y vídeo) | Apache 2.0 | GGUF (IQK) |
| Qwen/Qwen3.5-9B (base) | 9B | 262K | Sí (imagen y vídeo) | Apache 2.0 | Safetensors (no confirmado) |
| Alternativas de 7-9B densas | 7-9B | Variable | Generalmente solo texto | Variable | Variable |

No se dispone de datos de rendimiento comparado ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinación inherente a los modelos generativos; no hay datos de evaluación que lo cuantifiquen.
- Los metadatos solo declaran inglés; el rendimiento en castellano u otros idiomas no está verificado y podría degradarse.
- El contexto de 262K tokens puede implicar un coste de memoria elevado en la práctica; el contexto efectivo tras la cuantización no está medido.
- La cuantización IQK con imatrix v3 puede introducir pérdida de precisión respecto al modelo original; no se publican métricas de degradación.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B.
- Requiere el motor ik_llama.cpp; la portabilidad a otras herramientas de inferencia no está garantizada.
- Publicación con cero descargas y cero likes en el momento de la consulta; no hay evidencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Austriani/Qwen3.5-9B-ik_llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio ik_llama.cpp: no disponible en la información proporcionada
- Paper o blog técnico del autor: no disponible
- Demos: no disponibles
