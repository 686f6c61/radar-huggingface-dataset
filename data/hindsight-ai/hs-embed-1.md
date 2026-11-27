# hindsight-ai/hs-embed-1

## Resumen

hs-embed-1 es un modelo de embeddings de texto multilingue desarrollado por Hindsight AI para su plataforma de memoria y recuperacion de contexto [Hindsight](https://github.com/vectorize-io/hindsight). Se trata de un bi-encoder basado en la arquitectura ModernBERT, afinado a partir de `hotchpotch/bekko-embedding-v1-a25m`, que genera vectores de 384 dimensiones truncables a 256, 128 o 64 mediante tecnicas Matryoshka. Su proposito es servir como motor de recuperacion semantica en pipelines RAG y sistemas de memoria de agentes, con soporte para entradas de hasta 8.192 tokens.

El modelo destaca por su eficiencia: de sus 112 millones de parametros totales, 98 millones corresponden a la tabla de embeddings de tokens, de modo que cada pasada forward ejecuta un transformer de solo 13 millones de parametros. Esto lo hace apto para inferencia en CPU con la exportacion ONNX int8 incluida, ademas de GPU con safetensors en FP16.

Es relevante ahora porque combina contexto largo, multilingueismo en ocho idiomas y dimensiones reducibles en un paquete de 0,9 GB con licencia MIT, lo que facilita su despliegue en produccion tanto en entornos con recursos limitados como en infraestructura dedicada mediante Text Embeddings Inference (TEI).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder basado en ModernBERT (transformer) |
| Parametros totales | 111.728.256 (112M); 98M en tabla de embeddings, 13M en transformer |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | ONNX int8 (tabla de vocabulario); safetensors en FP16 y FP32 |
| Idiomas soportados | en, es, fr, de, pt, ja, ko, zh (chino simplificado y tradicional) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, copia FP32 en tag `fp32`), ONNX (`onnx/model.onnx`) |
| Dimensiones del embedding | 384 (truncables a 256, 128, 64) |
| Pooling | Mean |
| Similitud | Coseno |
| Modelo base | hotchpotch/bekko-embedding-v1-a25m |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

hs-embed-1 es un bi-encoder de recuperacion densa construido sobre ModernBERT, un transformer optimizado para contextos largos. La particularidad arquitectonica mas relevante es la distribucion de parametros: 98 de los 112 millones residen en la tabla de embeddings de tokens, por lo que el coste computacional por pasada forward corresponde a un transformer de solo 13 millones de parametros. El modelo produce embeddings de 384 dimensiones mediante mean pooling y similitud coseno, y aplica entrenamiento Matryoshka, que permite truncar los vectores a 256, 128 o 64 dimensiones conservando la calidad de recuperacion (re-normalizando tras el truncado).

El modelo es un fine-tune de `hotchpotch/bekko-embedding-v1-a25m`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Una innovacion operativa destacable es que no requiere prefijos de prompt: consultas y documentos se codifican de la misma forma, lo que simplifica los pipelines de indexacion y busqueda. Ademas, se distribuye una exportacion ONNX con tabla de vocabulario en int8 para servir en CPU.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y recuperacion densa (bi-encoder).
- Soporte multilingue en ingles, espanol, frances, aleman, portugues, japones, coreano y chino (simplificado y tradicional).
- Contexto largo de hasta 8.192 tokens por entrada, adecuado para documentos extensos o conversaciones multi-turno.
- Dimensiones variables mediante Matryoshka: 384, 256, 128 o 64 dimensiones, con re-normalizacion tras el truncado.
- Codificacion sin prefijos: consultas y documentos se procesan de forma identica.
- Inferencia en CPU (ONNX int8) y GPU (safetensors FP16).
- Compatible con Text Embeddings Inference (TEI) en imagenes CPU y GPU.
- Integracion nativa con Hindsight como proveedor de embeddings local o via TEI.
- No incluye capacidades generativas, de razonamiento, tool calling ni vision; es exclusivamente un modelo de representacion.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): indexar fragmentos de documentacion de hasta 8.192 tokens en una unica pasada y recuperar los mas relevantes por similitud coseno, reduciendo la fragmentacion excesiva de documentos largos.
- Memoria de agentes: almacenar y recuperar recuerdos de conversaciones multi-turno en Hindsight, aprovechando el contexto largo para mantener coherencia entre interacciones distantes en el tiempo.
- Busqueda semantica multilingue: indexar un corpus en espanol y consultar en ingles (o cualquier combinacion de los ocho idiomas soportados) sin necesidad de traduccion intermedia, gracias al entrenamiento multilingue.
- Despliegue en CPU sin GPU: servir el modelo con TEI en imagen CPU usando la exportacion ONNX int8, adecuado para entornos edge, CI/CD o servicios con presupuesto de infraestructura limitado.
- Deduplicacion y clustering de documentos: generar embeddings de 64 o 128 dimensiones para agrupar documentos similares a gran escala con bajo coste de almacenamiento y calculo de distancias.
- Sistemas de recomendacion de contenido: calcular similitud entre articulos, productos o publicaciones en varios idiomas para sugerir contenido relacionado.
- Moderacion y clasificacion semantica: comparar mensajes de usuario contra taxonomias predefinidas embebidas, usando vectores truncados para latencia minima.
- Busqueda en bases de conocimiento internas: integrar el modelo en pipelines de recuperacion sobre PostgreSQL (compatible con el stack de Hindsight basado en pg0) para asistentes internos de empresa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye imagenes de resultados (`assets/benchmarks.png` y `assets/serving-cpu.png`) cuyos valores no se han podido extraer en texto. No se dispone de cifras de MMLU, MTEB, HumanEval ni de latencia/throughput concretos.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: inferior a 1 GB en FP16 (modelo de 112M parametros, repo de 0,9 GB); en la practica cualquier GPU con al menos 2 GB de VRAM puede servirlo.
- GPU recomendadas segun la documentacion de TEI: L4 y otras GPU Ada (tag `89-1.9.3`), A100 y H100 (tag `1.9.3`).
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3090, RTX 4060 Ti y similares, aunque el modelo esta disenado para no necesitarlas.
- Inferencia en CPU viable mediante ONNX int8 con TEI (imagen `cpu-1.9.3`), pensada para entornos sin acelerador.
- Opciones de despliegue: Text Embeddings Inference (CPU y GPU), sentence-transformers, ONNX Runtime, y el propio servidor de Hindsight Inference (`https://inference.hindsight.vectorize.io`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Idiomas | Licencia |
|---|---|---|---|---|---|
| hs-embed-1 | 112M (13M transformer) | 8.192 | 384 (truncable a 64) | 8 | MIT |
| hotchpotch/bekko-embedding-v1-a25m (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos comparables (por ejemplo, otros embeddings multilingues de tamano similar), por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es un modelo exclusivamente de embeddings: no genera texto, no razona y no soporta tool calling ni agentes por si mismo.
- Riesgo de alucinacion no aplicable en sentido generativo, pero la recuperacion puede devolver documentos irrelevantes si el corpus no esta bien segmentado o si la consulta cae fuera de los dominios de entrenamiento.
- No se documentan en la informacion disponible los sesgos conocidos del modelo ni la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos de genero, raza o idioma.
- El soporte multilingue se limita a los ocho idiomas declarados; el rendimiento en otros idiomas no esta garantizado.
- La truncacion Matryoshka a 64 dimensiones reduce la calidad de recuperacion respecto a 384; requiere re-normalizar los vectores tras el truncado.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la licencia del modelo base (`hotchpotch/bekko-embedding-v1-a25m`), no detallada en la informacion disponible.
- No se han publicado cifras de benchmarks verificables en texto, por lo que la evaluacion de calidad en produccion debe hacerse con un conjunto de validacion propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hindsight-ai/hs-embed-1
- Repositorio de Hindsight: https://github.com/vectorize-io/hindsight
- Documentacion de instalacion de Hindsight: https://hindsight.vectorize.io/developer/installation
- Modelo base: https://huggingface.co/hotchpotch/bekko-embedding-v1-a25m
- Servidor de inferencia de Hindsight: https://inference.hindsight.vectorize.io
