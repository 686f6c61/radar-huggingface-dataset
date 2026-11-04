# DakeraAI/bge-large-en-v1.5

## Resumen

`DakeraAI/bge-large-en-v1.5` es un espejo verificado, sin modificaciones, del modelo de embeddings `BAAI/bge-large-en-v1.5` publicado por Dakera, la empresa detrás de un motor de memoria autoalojado para agentes de IA. No se trata de un modelo nuevo: los ficheros (`config.json`, `model.safetensors`, `tokenizer.json` y las variantes ONNX) se copian byte a byte desde los repositorios originales de BAAI y Xenova, con verificación SHA-256 de cada uno. El valor del repositorio no está en la investigación del modelo, sino en la distribución reproducible: Dakera lo usa como modelo de embeddings por defecto (`DAKERA_MODEL=bge-large`) y lo sirve primero desde este espejo, con caída al repositorio original si no está disponible.

El modelo subyacente es un encoder BERT de 335.142.400 parámetros (aproximadamente 335 M), entrenado por el Beijing Academy of Artificial Intelligence (BAAI) para la familia BGE (BAAI General Embedding), versión 1.5. Produce representaciones densas de 1024 dimensiones optimizadas para recuperación semántica en inglés, y es una de las referencias habituales en pipelines RAG y en motores de memoria de agentes.

Es relevante ahora por dos motivos concretos: la creciente demanda de infraestructura de memoria a largo plazo para agentes (el propio motor Dakera reporta 88,2 % de Recall@20 en el benchmark LoCoMo) y la necesidad de despliegues autoalojados sin dependencia de un único origen de descarga. Al incluir pesos en safetensors (FP32) y grafos ONNX (FP32 e INT8), el repositorio cubre tanto inferencia en GPU como en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), modelo de embeddings tipo bi-encoder |
| Parametros totales | 335.142.400 (~335 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BGE-large acepta hasta 512 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | FP32 (safetensors y ONNX) e INT8 (ONNX cuantizado) |
| Idiomas soportados | no disponible en la informacion proporcionada (el nombre del modelo indica ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (FP32 e INT8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer BERT de aproximadamente 335 M de parámetros que genera un vector denso por secuencia de entrada para tareas de `feature-extraction`. La versión 1.5 de la familia BGE se entrenó con objetivos de recuperación y pares de texto, e incorpora la instrucción de consulta recomendada por BAAI para tareas de retrieval (prefijo del tipo "Represent this sentence for searching relevant passages:"), tal como se documenta en la model card original.

Esta ficha no puede detallar la composición exacta del dataset, el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO, porque esa información no está incluida en los datos proporcionados; debe consultarse la model card de `BAAI/bge-large-en-v1.5`. La innovación técnica relevante en este repositorio es de empaquetado y distribución: doble grafo ONNX (FP32 para GPU, INT8 para CPU), pesos safetensors para el backend Candle, y verificación criptográfica de cada fichero contra su origen.

## Capacidades

- Generación de embeddings de texto para recuperación semántica y búsqueda por similitud.
- Búsqueda densa (dense retrieval) en pipelines RAG sobre documentación y bases de conocimiento.
- Representación de memorias y consultas en motores de memoria de agentes a largo plazo (caso de uso declarado por Dakera).
- Ejecución en CPU mediante el grafo ONNX INT8 y en GPU mediante el grafo FP32.
- Compatibilidad con el backend Candle a través de los pesos safetensors.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Memoria a largo plazo para agentes: el modelo convierte cada memoria y cada consulta en un vector de 1024 dimensiones; Dakera lo usa como embedder por defecto junto con recuperación híbrida (vectorial y texto completo), reranking y decaimiento por importancia, de modo que las conversaciones persisten entre sesiones.
- RAG sobre documentación interna: indexar fragmentos de manuales, wikis o tickets y recuperar los pasajes relevantes para aumentar un LLM generador; el encoder está optimizado para recuperación de pasajes en inglés.
- Búsqueda semántica en catálogos: sustituir la búsqueda por palabra clave en bases de productos o artículos por similitud vectorial, con el grafo INT8 para reducir coste de CPU.
- Deduplicación y agrupación de textos: calcular similitud coseno entre documentos para detectar duplicados o construir clústeres temáticos en pipelines de limpieza de datos.
- Clasificación y filtrado por similitud: usar los embeddings como característica de entrada para clasificadores ligeros o para umbrales de relevancia en sistemas de moderación y enrutado.
- Despliegue autoalojado sin dependencia de un único origen: el espejo permite que instalaciones en entornos restringidos descarguen los pesos desde este repositorio con verificación SHA-256, con caída al original si no está accesible.
- Evaluación de recuperación en CI: integrar el modelo en pruebas automatizadas que midan Recall@k sobre un conjunto dorado antes de desplegar cambios en el pipeline de búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye métricas del modelo; el único dato numérico es el 88,2 % de Recall@20 en LoCoMo, que corresponde al motor Dakera en su conjunto y no al modelo de embeddings de forma aislada.

## Requisitos de hardware

- VRAM estimada para FP32: en torno a 1,3-1,5 GB solo para pesos, más activaciones y memoria del runtime; el fichero `model.safetensors` ocupa 1.340.616.616 bytes.
- VRAM estimada para INT8 ONNX: aproximadamente 340-500 MB para pesos (`model_quantized.onnx` ocupa 336.983.162 bytes), más overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP32; A100, H100, L4, T4 o RTX 4090 son sobredimensionadas para este modelo y se usan cuando se comparte la GPU con otros componentes del pipeline.
- GPU de consumo: cabe holgadamente en cualquier RTX (3060 en adelante), GTX 1660 o superior, e incluso en iGPU con suficiente memoria compartida usando el grafo INT8.
- Despliegue: ONNX Runtime (CPU o GPU), Transformers con safetensors, backend Candle, y servidores de embeddings compatibles con el formato ONNX; el contenedor Docker de Dakera incluye los modelos por defecto sin descarga en el arranque.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DakeraAI/bge-large-en-v1.5 (espejo) | ~335 M | 1024 | no disponible | MIT | HuggingFace, ONNX + safetensors |
| BAAI/bge-large-en-v1.5 (original) | ~335 M | 1024 | no disponible | MIT | HuggingFace |
| Xenova/bge-large-en-v1.5 | ~335 M | 1024 | no disponible | MIT | HuggingFace, ONNX (origen del grafo de este repo) |

El espejo de Dakera es funcionalmente idéntico al original de BAAI: mismos pesos, mismo tokenizador y misma licencia. La diferencia práctica es la disponibilidad de grafos ONNX ya convertidos (tomados de Xenova) y la verificación SHA-256 documentada fichero a fichero, útil en despliegues con requisitos de integridad de artefactos.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings en inglés según su denominación; no debe usarse para generación de texto ni para tareas multilingües sin verificar el comportamiento en otros idiomas.
- Riesgo de recuperación deficiente en dominios muy especializados o con vocabulario fuera del dominio de entrenamiento; conviene evaluar Recall@k sobre datos propios antes de producción.
- La longitud máxima de entrada no está confirmada en la información disponible; secuencias largas pueden truncarse y perder información.
- No hay datos publicados de sesgos en esta ficha; al ser un modelo entrenado por un tercero, los sesgos del corpus original se heredan sin cambios.
- Licencia MIT: permite uso comercial y modificación, pero requiere conservar el aviso de copyright; el mérito del modelo corresponde a BAAI y la conversión ONNX a Xenova.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 2026-11-04; es un artefacto de distribución reciente, no un modelo con adopción comunitaria verificada.
- Para producción, fijar la versión por SHA-256 en lugar de por nombre de fichero, ya que el contenido puede actualizarse en el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DakeraAI/bge-large-en-v1.5
- Modelo original: https://huggingface.co/BAAI/bge-large-en-v1.5
- Conversión ONNX de referencia: https://huggingface.co/Xenova/bge-large-en-v1.5
- Licencia del repositorio: https://huggingface.co/DakeraAI/bge-large-en-v1.5/blob/main/LICENSE
- Web de Dakera: https://dakera.ai
- Documentación: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue autoalojado: https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
