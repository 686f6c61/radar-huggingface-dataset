# pranil00/ONIX-bge-m3-GGUF

## Resumen

ONIX-bge-m3-GGUF es una conversión cuantizada del modelo BAAI/bge-m3, publicado por el usuario pranil00 bajo la etiqueta "ONIX Community". El modelo base, BAAI/bge-m3, es un transformer de 0,91 mil millones de parámetros (914.706.432) desarrollado por el Beijing Academy of Artificial Intelligence (BAAI), originalmente diseñado como modelo de embeddings multilingüe para recuperación de información. Esta versión GGUF aplica cuantización Q5_K_M (5,5 bits por peso) para reducir el tamaño de los pesos de 1,79 GB en FP16 a 0,61 GB, lo que facilita su ejecución en hardware de consumo.

La relevancia de esta ficha radica en que el artefacto se presenta con la etiqueta de pipeline `text-generation`, cuando el modelo base es un modelo de embeddings y no un generador de texto autoregresivo. Esta discrepancia es importante para cualquier evaluador: el uso previsto del modelo original es la generación de representaciones vectoriales para búsqueda semántica, no la generación de texto. La model card del autor incluye instrucciones para ejecutarlo como chat mediante `llama.cpp`, Ollama o `run-any-model`, pero no documenta ninguna evaluación de calidad de embeddings tras la cuantización.

El modelo se publica bajo licencia Apache 2.0, con fecha de creación del 25 de noviembre de 2026 y cero descargas registradas en el momento de la consulta. No se dispone de información sobre idiomas soportados en los metadatos de Hugging Face ni de resultados de benchmarks publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base BAAI/bge-m3) |
| Parámetros totales | 914.706.432 (0,91 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (Apple Silicon y NVIDIA GPU); 4.096 tokens (CPU) según la model card |
| Tipos de cuantización | Q5_K_M (5,5 bits por peso); no se documentan otras variantes en este repositorio |
| Idiomas soportados | No disponible en los metadatos de Hugging Face; el modelo base bge-m3 es multilingüe (más de 100 idiomas), pero no se confirma en esta ficha |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`BAAI--bge-m3-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo base BAAI/bge-m3 es un transformer encoder de 0,91 mil millones de parámetros entrenado por BAAI para tareas de recuperación multilingüe, multi-funcional y multi-granularidad. Su diseño original combina representaciones densas, dispersas y multi-vector en un único modelo, y se entrena con objetivos de similitud contrastiva sobre pares de consulta-documento. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

La contribución de este repositorio es exclusivamente la conversión a GGUF con cuantización Q5_K_M mediante la herramienta `run-any-model`, un motor de optimización adaptativo al dispositivo. Según la model card, la cuantización reduce el tamaño de los pesos un 65,6 % (de 1,79 GB a 0,61 GB) y conserva aproximadamente el 97,5 % de la "fidelidad cognitiva" respecto al modelo en FP16. Esta métrica no está definida ni respaldada por una evaluación publicada, por lo que debe tratarse como una afirmación del autor sin verificación independiente. No se documenta ninguna innovación arquitectónica adicional, decodificación especulativa ni atención lineal en esta conversión.

## Capacidades

- Generación de representaciones vectoriales (embeddings) para búsqueda semántica y recuperación de información, heredadas del modelo base bge-m3.
- Recuperación multilingüe y multi-granularidad según el diseño del modelo base, aunque no se confirma en los metadatos de esta conversión.
- Ejecución en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan o Text-Generation-WebUI, según las instrucciones de la model card.
- La model card lo etiqueta como `text-generation` y ofrece comandos de chat interactivo (`llama-cli -cnv`, `ollama run`), pero no se aporta evidencia de que el modelo funcione correctamente como generador de texto autoregresivo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Búsqueda semántica en aplicaciones locales: el modelo puede generar embeddings de documentos y consultas para un motor de recuperación que se ejecute íntegramente en un portátil, gracias a su tamaño de 0,61 GB en Q5_K_M y a su ventana de 8.192 tokens en GPU.
- Recuperación aumentada por generación (RAG) en entornos sin conexión: se puede integrar como recuperador en un pipeline RAG junto a un LLM generador, aprovechando su reducido consumo de VRAM (2,11 GB en GPU NVIDIA según la model card) para liberar memoria para el modelo generador.
- Clasificación y agrupamiento de textos por similitud: los embeddings permiten agrupar tickets de soporte, correos o artículos por temática en un servidor sin GPU dedicada, usando la configuración de CPU con 3,01 GB de RAM libre.
- Deduplicación de corpus y detección de near-duplicates: la representación densa del modelo permite identificar documentos casi idénticos en grandes colecciones, ejecutándose en Apple Silicon con 1,01 GB de memoria unificada.
- Prototipado de sistemas de recomendación basados en contenido: se pueden calcular similitudes entre descripciones de productos y perfiles de usuario en un equipo de desarrollo con una RTX 30/40/50, sin necesidad de infraestructura en la nube.
- Evaluación comparativa de cuantizaciones: sirve como artefacto para medir la pérdida de calidad de recuperación entre FP16 y Q5_K_M en un conjunto de evaluación propio, dado que el autor no publica dicha comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de telemetría del proceso de cuantización (tamaño de pesos, memoria residente, número de capas aceleradas), pero no contiene métricas de calidad de recuperación como Recall@k, nDCG ni MRR, ni comparaciones con el modelo base en FP16 más allá de la afirmación de "97,5 % de retención".

## Requisitos de hardware

- VRAM/RAM estimada: 1,01 GB de memoria unificada en Apple Silicon (M1/M2/M3/M4/M5); 2,11 GB de VRAM dedicada en GPU NVIDIA RTX 30/40/50; 3,01 GB de RAM libre en CPU x86 con AVX2/AVX-512, según la model card.
- GPU recomendadas: cualquier GPU NVIDIA RTX 30/40/50 series con al menos 2,11 GB de VRAM; Apple Silicon con Metal; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX 3060 o superior, y en Macs con chip M1 o posterior.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI `run-any-model`.
- Latencia y throughput: no disponibles. La model card no publica tokens por segundo ni latencia de generación de embeddings.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-bge-m3-GGUF (Q5_K_M) | 0,91 B | 8.192 tokens (GPU) | GGUF | Apache 2.0 | Conversión comunitaria sin benchmarks publicados |
| BAAI/bge-m3 (FP16) | 0,91 B | 8.192 tokens | safetensors | MIT (según el repositorio original de BAAI) | Modelo base de referencia, con evaluación publicada por BAAI |
| BAAI/bge-large-en-v1.5 | 0,33 B | 512 tokens | safetensors | MIT | Solo inglés, contexto mucho menor, ampliamente usado en recuperación |
| intfloat/multilingual-e5-large | 0,56 B | 512 tokens | safetensors | MIT | Multilingüe, contexto de 512 tokens, sin versión GGUF oficial |

No se dispone de datos de rendimiento comparado para esta conversión concreta; la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Discrepancia de pipeline: el repositorio se etiqueta como `text-generation`, pero el modelo base es un modelo de embeddings. Ejecutarlo como chat puede producir salidas sin sentido; debe validarse antes de usarlo en producción.
- Sin benchmarks de calidad: la afirmación de "97,5 % de retención" no está respaldada por ninguna evaluación publicada de Recall@k, nDCG o MRR.
- Idiomas no confirmados: los metadatos de Hugging Face no listan idiomas; el soporte multilingüe se hereda del modelo base pero no se verifica en esta conversión.
- Riesgo de alucinación: si se usa como generador de texto, el modelo no está entrenado para ello y producirá texto incoherente o repetitivo.
- Licencia: Apache 2.0 permite uso comercial, pero el autor incluye una cláusula de exención de responsabilidad total que conviene revisar con el equipo legal; además, la licencia del modelo base debe confirmarse en el repositorio original de BAAI.
- Cero adopción: el repositorio tiene 0 descargas y 0 likes, sin evidencia de uso en producción ni de mantenimiento.
- Contexto limitado en CPU: la model card reduce la ventana a 4.096 tokens en CPU, la mitad que en GPU.
- Fecha de creación futura: el repositorio figura creado el 25 de noviembre de 2026, lo que puede indicar un error de metadatos o una fecha programada; conviene verificar la integridad del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-bge-m3-GGUF
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio de la herramienta run-any-model: https://github.com/PranilShah-08/run-any-model
