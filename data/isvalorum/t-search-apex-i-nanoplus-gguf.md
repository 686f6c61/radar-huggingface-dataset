# IsValorum/T-Search-APEX-I-NanoPlus-GGUF

## Resumen

T-Search APEX-I-NanoPlus GGUF es una cuantización personalizada del modelo base t-tech/T-Search, un transformer híbrido de tipo Mixture of Experts (MoE) con 35.505.251.456 parámetros totales, orientado a tareas de razonamiento, recuperación de información y agentes de búsqueda. La cuantización la firma IsValorum, autor independiente que publica builds "APEX" con mapas de tensores auditados y asignación de precisión por capa. El resultado es un único fichero GGUF de 13,6 GB que comprime el modelo original hasta un envelope de 13,03 GB mediante una mezcla de cuantizaciones IQ2/IQ3/Q4/Q6/F32.

La relevancia de esta ficha radica en que el modelo base combina atención lineal (DeltaNet/SSM), atención cuadrática periódica en capas ancla y un bloque MTP (Multi-Token Prediction) para decodificación especulativa, todo ello con enrutadores de expertos en F32 para evitar deriva. El autor declara soporte para 13 idiomas (incluido el castellano) y licencia Apache 2.0, lo que lo hace apto para uso comercial.

El interés práctico está en que permite ejecutar un MoE de 35,5B parámetros en hardware de consumo o en servidores modestos con llama.cpp, manteniendo precisión alta en cabezales de salida, normalizaciones y enrutadores, y aceptando mayor compresión en las proyecciones internas de los expertos. No obstante, la model card no aporta datos de benchmarks ni detalles sobre el entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención lineal (DeltaNet/SSM), atención cuadrática periódica y bloque MTP; etiquetado como `qwen35moe` en los tags |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla por tensor: F32, Q8_0, Q6_K, Q4_K, Q4_0, Q3_K, IQ3_XXS, IQ2_S, IQ2_XXS (build única "APEX-I-NanoPlus" de 13,03 GB) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con `tensor-map.tsv` adjunto (753 tensores auditados) |

## Arquitectura y entrenamiento

El modelo base t-tech/T-Search es un transformer híbrido con capas de atención lineal basadas en SSM/DeltaNet combinadas con capas de atención completa cuadrática en posiciones periódicas (bloques 3, 7, 11, etc., hasta 10 capas ancla). La componente MoE se organiza en 256 micro-expertos más expertos compartidos (`shexp`) activos en todos los tokens, con enrutadores (`ffn_gate_inp`) mantenidos en F32. Incluye además un bloque MTP en `blk.40` para decodificación especulativa, con proyecciones y matrices de atención propias.

La cuantización APEX-I-NanoPlus aplica una política de precisión por grupo de tensores: F32 para las 131 normalizaciones, los 80 enrutadores de expertos y las 120 escalas SSM; Q6_K para el cabezal de salida y las proyecciones de salida de atención ancla; Q4_K para embeddings, expertos compartidos y atención lineal; y compresión agresiva IQ2/IQ3 en las proyecciones `up`/`gate`/`down` de los expertos del núcleo (capas 2-37), con IQ3_XXS en las capas frontera 0-1 y 38-39. El objetivo declarado es preservar la estabilidad numérica del estado recurrente y la fidelidad del enrutamiento, aceptando pérdida controlada en las matrices internas de los expertos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base. Tampoco se detalla la innovación de decodificación especulativa más allá de la existencia del bloque MTP.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con etiqueta explícita `reasoning` en los tags.
- Recuperación de información y uso como agente de búsqueda (`retrieval`, `search-agent`), con capas de atención completa ancla pensadas para needle-in-a-haystack en contexto profundo.
- Soporte multimodal declarado en los tags (`multimodal`), aunque la model card no detalla qué modalidades cubre ni cómo se activan en GGUF.
- Capacidades multilingües en 13 idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Decodificación especulativa mediante bloque MTP integrado, con validación de tokens draft a través de proyecciones Q6_K/Q4_K.
- Compatibilidad con llama.cpp y endpoints compatibles (`endpoints_compatible`), lo que facilita su integración en servidores de inferencia estándar.
- No se documenta explícitamente soporte de tool calling ni function calling en la información disponible.

## Casos de uso

- Agente de búsqueda documental: el modelo puede gestionar consultas iterativas y recuperación sobre corpus largos gracias a las capas de atención completa ancla (bloques 3, 7, 11, etc.) y al bloque MTP para acelerar la generación de pasos intermedios.
- Asistente de atención al cliente multilingüe: con soporte para 13 idiomas y licencia Apache 2.0, se puede desplegar en un servidor llama.cpp para conversaciones multi-turno en español, inglés, francés o árabe sin coste de licencia.
- Razonamiento sobre documentación técnica: la preservación en F32 de normalizaciones y enrutadores reduce la deriva numérica en cadenas de razonamiento largas, lo que lo hace adecuado para análisis de informes y extracción de conclusiones.
- Generación asistida en pipelines de CI/CD: al ser un GGUF compatible con llama.cpp, puede integrarse como servicio de generación en herramientas internas de documentación o revisión de código, aunque no se documenta tool calling nativo.
- Despliegue en hardware de consumo: el fichero de 13,03 GB permite ejecutar un MoE de 35,5B parámetros en GPUs con 16-24 GB de VRAM o en configuraciones CPU+RAM, algo inviable con el modelo en FP16.
- Investigación sobre cuantización extrema: el mapa de tensores auditado (`tensor-map.tsv`) y la política IQ2/IQ3 por capa sirven como caso de estudio para evaluar el impacto de la compresión selectiva en modelos MoE híbridos.
- Procesamiento de documentación multilingüe: resúmenes y traducción asistida entre los 13 idiomas soportados en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 13,03 GB; con overhead de contexto y caché KV, se recomienda un mínimo de 16 GB de VRAM para inferencia completa en GPU.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB para despliegues de producción con contexto largo.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo) y en GPUs de 16 GB con contexto reducido; en 12 GB requeriría offload parcial a RAM del sistema.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama (previa conversión o importación del GGUF) y servidores compatibles con endpoints; no se menciona soporte nativo de vLLM o TGI para este fichero.
- Latencia y throughput: no disponibles en la información proporcionada. El bloque MTP sugiere decodificación especulativa, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| T-Search APEX-I-NanoPlus GGUF (este) | 35,5B totales (MoE) | no disponible | Apache 2.0 | GGUF 13,03 GB | Cuantización selectiva IQ2/IQ3/Q4/Q6/F32, bloque MTP, 13 idiomas |
| t-tech/T-Search (base) | 35,5B totales (MoE) | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; referencia de precisión completa |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización IQ2/IQ3 en las proyecciones internas de los expertos (capas 2-37) puede degradar tareas de matemáticas y código frente al modelo base en FP16; no hay benchmarks que cuantifiquen la pérdida.
- El modelo base no documenta sesgos conocidos, pero al ser un modelo multilingüe entrenado con datos web es probable que herede sesgos de esos corpus; no se aporta información al respecto.
- Riesgo de alucinación inherente a modelos generativos; la preservación del cabezal de salida en Q6_K reduce errores de sintaxis pero no elimina la generación de contenido falso.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en ventanas largas sin datos del modelo base.
- El soporte multimodal aparece solo como tag, sin documentación de cómo funciona en GGUF ni qué modalidades cubre.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines de agentes que dependan de llamadas a funciones.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base t-tech/T-Search de forma independiente.
- El autor advierte que la cuantización se realizó con cómputo propio y sin afiliación al desarrollador original; la calidad del build no está avalada por t-tech.
- El repositorio tiene 0 likes y 426 descargas en la fecha de consulta, lo que indica adopción limitada y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/IsValorum/T-Search-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/t-tech/T-Search
- Ko-fi del autor: https://ko-fi.com/isvalorum
- Espacio de peticiones: https://huggingface.co/spaces/IsValorum/MiniPlus-NanoPlus-Requests
- Mapa de tensores: `tensor-map.tsv` dentro del repositorio de Hugging Face
