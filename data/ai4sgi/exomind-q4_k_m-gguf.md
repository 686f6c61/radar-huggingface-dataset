# AI4SGI/ExoMind-Q4_K_M-GGUF

## Resumen

ExoMind es un sistema agéntico multimodal de razonamiento científico desarrollado por el Shanghai Artificial Intelligence Laboratory (AI4SGI). Se construye sobre la base de Qwen3.5-35B-A3B, un modelo de arquitectura MoE con 35.500 millones de parámetros totales y 3.000 millones activos. El modelo está diseñado para tareas de razonamiento científico y de investigación, integrando capacidades de tool use, interacción multimodal (imagen y texto) y un marco de interacción científica que permite ejecutar flujos de trabajo complejos.

Esta ficha corresponde a la versión cuantizada en GGUF Q4_K_M, optimizada para despliegue local con recursos limitados. El repositorio incluye el modelo cuantizado (20,22 GiB) y el proyector multimodal en F16 (857,62 MiB), lo que permite ejecutar tanto inferencia de solo texto como entrada de imágenes mediante llama.cpp. La cuantización Q4_K_M reduce significativamente los requisitos de memoria frente al checkpoint BF16 original (71,9 GB), manteniendo un equilibrio razonable entre calidad y eficiencia.

La relevancia actual de ExoMind radica en su enfoque específico para ciencia: el modelo base mejora la puntuación media en ocho benchmarks científicos de 36,2 a 67,5, y también supera al modelo base en los seis benchmarks de capacidad general evaluados. Esto lo convierte en una opción atractiva para equipos de investigación que necesitan un modelo local, de código abierto y con licencia Apache 2.0, capaz de razonar sobre literatura científica, analizar figuras y ejecutar herramientas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5-35B-A3B |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | 3.000 millones (A3B) |
| Longitud de contexto | 32.768 tokens (según comando de ejemplo de llama.cpp) |
| Tipos de cuantizacion | Q4_K_M (este repo); también disponibles Q8_0 y F16 en repos hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) + proyector multimodal F16 |

## Arquitectura y entrenamiento

ExoMind hereda la arquitectura MoE de Qwen3.5-35B-A3B, con 35,5B parámetros totales y 3B activos por token. Esta configuración permite un coste de inferencia relativamente bajo en comparación con modelos densos del mismo tamaño. El modelo es multimodal: acepta entradas de imagen y texto, y el proyector multimodal se distribuye por separado en formato F16.

El entrenamiento se describe como un "sistema agéntico inspirado en la mente extendida" que integra tres componentes: ingeniería sistemática de datos, un marco de interacción científica y una estrategia de entrenamiento sistemática. El informe técnico indica que se logran mejoras sustanciales en razonamiento científico y tareas de investigación usando menos datos, un modelo pequeño y entrenamiento de bajo coste. No se especifican el número exacto de tokens de entrenamiento ni la composición detallada del dataset. Tampoco se detalla si se emplearon técnicas como RLHF o DPO; la información disponible menciona únicamente el enfoque de entrenamiento sistemático.

La conversión a GGUF fue realizada por el equipo de AI4SGI a partir de artefactos existentes. El repositorio indica que los comandos originales de conversión y cuantización no se conservaron, por lo que no se garantiza reproducibilidad bit a bit del pipeline de conversión.

## Capacidades

- Razonamiento científico: el modelo está específicamente entrenado para tareas de razonamiento científico y de investigación, con mejoras documentadas en ocho benchmarks científicos.
- Multimodal: acepta entradas de imagen y texto mediante el proyector F16 incluido en el repositorio. Permite analizar figuras, diagramas y otras representaciones visuales.
- Tool use y agéntico: soporta llamada a herramientas (tool calling) y flujos de trabajo agénticos, lo que permite integrar el modelo en pipelines que requieren ejecutar acciones externas.
- Generación de texto y código: al estar basado en Qwen3.5, conserva capacidades de generación de texto, código y razonamiento matemático.
- Interacción conversacional: el pipeline declarado es image-text-to-text, lo que indica soporte para diálogos multimodales.
- Despliegue local eficiente: la cuantización Q4_K_M reduce el tamaño a 20,22 GiB, permitiendo ejecución en GPUs de consumo con 24 GB de VRAM o en CPU mediante llama.cpp.

## Casos de uso

- Análisis de literatura científica: el modelo puede resumir y razonar sobre artículos de investigación, extrayendo conclusiones y comparando metodologías. Su ventana de 32.768 tokens permite procesar documentos extensos en una sola pasada.
- Asistente de laboratorio multimodal: gracias a su capacidad de entrada de imágenes, puede interpretar fotografías de experimentos, gráficas de resultados o imágenes de microscopía, y generar explicaciones o hipótesis.
- Generación de código para simulación científica: el modelo puede escribir y depurar código de simulación numérica o análisis de datos, integrándose con herramientas externas mediante tool calling.
- Automatización de revisiones sistemáticas: en investigación biomédica o de materiales, el modelo puede ayudar a cribar abstracts, extraer datos estructurados y clasificar estudios según criterios predefinidos.
- Agente de investigación autónomo: combinando tool use y razonamiento multi-paso, puede ejecutar consultas a bases de datos, lanzar scripts y recopilar resultados en un flujo agéntico.
- Soporte técnico especializado en ciencia: puede atender consultas de usuarios sobre conceptos científicos, interpretar resultados y recomendar procedimientos, con un tono conversacional y capacidad de mantener contexto largo.
- Educación y divulgación: el modelo puede generar explicaciones didácticas de conceptos científicos complejos, adaptadas al nivel del interlocutor, y responder preguntas de seguimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la cuantización Q4_K_M. El repositorio indica explícitamente que los resultados publicados corresponden al checkpoint original ExoMind 35B-A3B en BF16, y que esta conversión no tiene puntuaciones asignadas por separado.

Según la información disponible, el modelo base ExoMind (BF16) logra:

- Mejora de la puntuación media en ocho benchmarks científicos de 36,2 a 67,5.
- Mejora sobre el modelo base Qwen3.5-35B-A3B en los seis benchmarks de capacidad general evaluados.

No se proporcionan los nombres de los benchmarks individuales ni los valores desglosados. Para más detalle, se remite al explorador de evaluación en la página del proyecto.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 20,22 GiB, más el proyector F16 de 857,62 MiB. Con overhead de contexto (32.768 tokens) y buffers, se recomienda al menos 24 GB de VRAM para una ejecución cómoda en GPU.
- GPUs compatibles: RTX 3090, RTX 4090, A100 40GB, A6000, o cualquier GPU con 24 GB o más de VRAM. En GPUs de 16 GB (como RTX 4080) podría ejecutarse con contexto reducido, pero no está garantizado.
- Ejecución en CPU: llama.cpp permite ejecutar el modelo en CPU con suficiente RAM (se recomiendan 32 GB o más), aunque con mayor latencia.
- Opciones de despliegue: llama-server (incluido en llama.cpp), Ollama (si se importa el GGUF), o cualquier runtime compatible con GGUF. También se puede usar vLLM o SGLang con el modelo original en formato Transformers, pero no con este archivo GGUF.
- Latencia y throughput: no disponible. Dependerá del hardware, la cuantización y el número de tokens activos (3B por token, lo que favorece un throughput relativamente alto en comparación con modelos densos de 35B).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ExoMind-Q4_K_M-GGUF | 35,5B | 3B | 32.768 | Apache 2.0 | GGUF | Especializado en ciencia, multimodal, agéntico |
| Qwen3.5-35B-A3B (base) | 35,5B | 3B | no disponible | Apache 2.0 | Transformers | Modelo base sin fine-tuning científico |
| Qwen3-30B-A3B (referencia) | 30B | 3B | no disponible | Apache 2.0 | Transformers/GGUF | Modelo MoE de generación anterior, sin foco científico |

No se dispone de datos comparativos de benchmarks entre estas alternativas en la información proporcionada. La comparativa se limita a características estructurales. ExoMind se diferencia por su entrenamiento específico en razonamiento científico y su naturaleza multimodal.

## Limitaciones y advertencias

- La cuantización Q4_K_M puede degradar ligeramente la calidad de salida frente al checkpoint BF16 original, especialmente en tareas de razonamiento complejo o matemáticas. No se han publicado evaluaciones específicas de esta versión.
- El modelo puede alucinar contenido, especialmente en dominios científicos donde los datos de entrenamiento son limitados. Se recomienda verificar las respuestas con fuentes primarias.
- Los idiomas soportados no están documentados. Aunque Qwen3.5 tiene capacidades multilingües, no se confirma el rendimiento en español u otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero los materiales de marca, figuras científicas y el texto del informe técnico están sujetos a términos adicionales (ExoMind Research Content and Brand Terms). El uso del nombre "ExoMind" en productos comerciales puede requerir permiso.
- El repositorio no garantiza reproducibilidad bit a bit de la conversión GGUF, ya que los comandos originales no se conservaron.
- La ventana de contexto de 32.768 tokens es fija en el ejemplo de despliegue; no se indica si el modelo soporta extensiones de contexto mayores.
- No se proporcionan datos de sesgos o comportamientos adversos específicos. Como modelo entrenado principalmente en datos científicos, puede tener un rendimiento inferior en tareas de dominio general o creativas.

## Enlaces

- Modelo GGUF Q4_K_M en HuggingFace: https://huggingface.co/AI4SGI/ExoMind-Q4_K_M-GGUF
- Modelo base ExoMind (Transformers): https://huggingface.co/AI4SGI/ExoMind
- Repositorio GitHub oficial: https://github.com/AI4SGI/ExoMind
- Página del proyecto: https://ai4sgi.github.io/ExoMind/
- Informe técnico (PDF): https://github.com/AI4SGI/ExoMind/blob/main/Paper.pdf
- Modelo en ModelScope: https://modelscope.cn/models/AI4SGI/ExoMind-Q4_K_M-GGUF
- Colección de la familia de modelos ExoMind: https://huggingface.co/collections/AI4SGI/exomind-model-family
