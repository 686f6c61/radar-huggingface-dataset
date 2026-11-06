# DakeraAI/all-MiniLM-L6-v2

## Resumen

DakeraAI/all-MiniLM-L6-v2 es un espejo verificado del modelo de embeddings sentence-transformers/all-MiniLM-L6-v2, publicado por Dakera, un motor de memoria autoalojado para agentes de IA. No se trata de un modelo nuevo ni de un reentrenamiento: el autor declara explicitamente que los ficheros se copian byte a byte del original y de la conversion ONNX de Xenova, con verificacion SHA-256. Su relevancia es operativa, no cientifica: actua como fuente primaria de descarga para el motor Dakera, de modo que la instalacion no dependa de un unico repositorio.

El modelo subyacente es un transformer BERT de 6 capas y 22,7 millones de parametros, disenado para generar embeddings de frases de 384 dimensiones. Es uno de los modelos de recuperacion densa mas ligeros y extendidos del ecosistema, y se usa habitualmente como base para busqueda semantica, RAG y memorizacion de agentes. El repositorio incluye pesos en safetensors, pesos ONNX en precision completa y cuantizados, y el tokenizer.

Dado que es un espejo, no aporta mejoras de rendimiento ni cambios de arquitectura respecto al original. Su interes para un desarrollador esta en la trazabilidad (checksums publicados), la licencia Apache-2.0 y la disponibilidad de formatos ONNX listos para inferencia en CPU, lo que lo hace adecuado para despliegues de baja latencia en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MiniLM, 6 capas) |
| Parametros totales | 22.713.728 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo original usa 256 tokens de longitud maxima de secuencia) |
| Tipos de cuantizacion | ONNX cuantizado (model_quantized.onnx, 23,0 MB) y ONNX en precision completa (90,4 MB); pesos safetensors en fp32 |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo original esta entrenado principalmente con datos en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX, ONNX cuantizado, tokenizer.json |
| Dimension del embedding | no disponible en la informacion proporcionada (el original produce 384 dimensiones) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT con 6 capas y 22,7 millones de parametros, derivado de MiniLM y destilado por sentence-transformers para producir embeddings de frases. La tarea declarada es feature-extraction: recibe texto tokenizado y devuelve un vector denso que representa la frase, pensado para similitud coseno y busqueda vectorial. No incorpora cabecera generativa ni decodificador.

Este repositorio concreto no aporta informacion sobre el entrenamiento: es un espejo de ficheros, y el autor remite a la model card original para detalles de datos, destilacion y cita. Los unicos datos tecnicos verificables aqui son los checksums SHA-256 de cada fichero (model.onnx, model_quantized.onnx, config.json, model.safetensors y tokenizer.json) y el origen de cada uno: los ONNX provienen de Xenova/all-MiniLM-L6-v2 y el resto de sentence-transformers/all-MiniLM-L6-v2. No se documentan procesos de RLHF, DPO ni innovaciones de atencion en esta ficha.

## Capacidades

- Generacion de embeddings de frases para recuperacion densa y similitud semantica.
- Busqueda semantica y construccion de indices vectoriales para RAG.
- Memoria a largo plazo para agentes: el caso de uso declarado por Dakera, que lo emplea como modelo de embeddings por defecto en hosts pequenos (`DAKERA_MODEL=minilm`).
- Extraccion de caracteristicas para clasificacion, clustering y deduplicacion de textos.
- Inferencia en CPU mediante ONNX, incluida la variante cuantizada de 23,0 MB.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio: es exclusivamente un encoder de embeddings.
- Capacidades multilingues: no documentadas en esta informacion; el modelo original esta orientado a ingles.

## Casos de uso

- Memoria de agentes autoalojada: Dakera usa este modelo para indexar y recuperar recuerdos de sesiones anteriores; su tamano (23,0 MB cuantizado) permite ejecutarlo en el mismo host que el motor de memoria sin GPU.
- RAG sobre documentacion interna: generar embeddings de fragmentos y consultas para recuperar pasajes relevantes antes de pasarlos a un LLM generativo, con la ventaja de que el encoder cabe en CPU y no compite por VRAM.
- Busqueda semantica en aplicaciones web: indexar catalogos, articulos o tickets y resolver consultas por similitud coseno con latencia baja gracias a la variante ONNX cuantizada.
- Deduplicacion y clustering de textos: agrupar tickets de soporte, resenas o incidencias por cercania en el espacio de embeddings de 384 dimensiones.
- Clasificacion ligera por vecinos mas cercanos: usar los embeddings como caracteristicas de entrada para clasificadores simples en pipelines sin GPU.
- Despliegue en entornos con conectividad restringida: el repositorio incluye checksums y la imagen Docker de Dakera trae los modelos listos, sin descarga en el arranque, lo que simplifica instalaciones air-gapped.
- Filtrado previo en sistemas de moderacion o recomendacion: calcular similitud contra un conjunto de referencia de textos etiquetados antes de invocar un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un espejo y no incluye evaluaciones propias; para metricas del modelo original (por ejemplo, MTEB) debe consultarse la model card de sentence-transformers/all-MiniLM-L6-v2.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo cuantizado ocupa 23,0 MB en disco y los pesos fp32 unos 90,9 MB, por lo que la inferencia en CPU es viable en cualquier maquina moderna.
- GPU recomendadas: no necesarias. Cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) aceleraria el throughput, pero el modelo esta pensado para CPU.
- Cabe en cualquier GPU consumer, incluso en las de gama baja, y en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime (formatos model.onnx y model_quantized.onnx), sentence-transformers con los pesos safetensors, y el motor Dakera via Docker (`ghcr.io/dakera-ai/dakera:latest`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| DakeraAI/all-MiniLM-L6-v2 (este) | 22,7 M | no disponible | Apache-2.0 | safetensors, ONNX, ONNX cuantizado | Espejo verificado con checksums; orientado a Dakera |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | no disponible | Apache-2.0 | safetensors, PyTorch | Modelo original; misma arquitectura y pesos |
| Xenova/all-MiniLM-L6-v2 | 22,7 M | no disponible | Apache-2.0 | ONNX, ONNX cuantizado | Origen de los ficheros ONNX de este espejo |
| sentence-transformers/paraphrase-MiniLM-L6-v2 | no disponible | no disponible | Apache-2.0 | safetensors, PyTorch | Alternativa de la misma familia para similitud de frases; sin datos verificados en esta ficha |

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: no corrige sesgos ni mejora el rendimiento del original; cualquier limitacion de sentence-transformers/all-MiniLM-L6-v2 se hereda integra.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento; usarlo para esas tareas es un error de categoria.
- Riesgo de alucinacion no aplica en el sentido generativo, pero los embeddings pueden recuperar pasajes semanticamente proximos pero factualmente irrelevantes; conviene combinar con reranking, como hace Dakera.
- Cobertura linguistica no documentada en esta ficha; el modelo original esta entrenado principalmente en ingles y su rendimiento en castellano puede ser inferior al de modelos multilingues especificos.
- Longitud de contexto no documentada aqui; el original limita las secuencias a 256 tokens, lo que trunca documentos largos si no se fragmentan antes.
- Licencia Apache-2.0 permite uso comercial, pero al ser un espejo conviene citar a los autores originales de sentence-transformers segun su model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento a largo plazo por parte del autor.
- La fecha de creacion indicada (2026-11-04) es posterior a la de esta ficha; verificar la integridad de los checksums antes de confiar en los ficheros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DakeraAI/all-MiniLM-L6-v2
- Modelo original: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Conversion ONNX de origen: https://huggingface.co/Xenova/all-MiniLM-L6-v2
- Web de Dakera: https://dakera.ai
- Documentacion: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue autoalojado: https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn: https://www.linkedin.com/company/dakera-ai
- Contacto: amine@dakera.ai
