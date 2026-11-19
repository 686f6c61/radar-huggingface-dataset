# nvidia/Nemotron-3.5-Rerank-8B-BF16

## Resumen

Nemotron-3.5-Rerank-8B-BF16 es un modelo de reranking (cross-encoder) desarrollado por NVIDIA para recuperación de información multilingüe y multimodal orientada a sistemas de question-answering. Su función es recibir un par formado por una consulta de texto y un documento candidato —que puede ser texto, una imagen de página o ambos, incluyendo gráficos, tablas e infografías— y emitir un logit que representa la relevancia del documento respecto a la consulta. Está pensado como segunda etapa de un pipeline de recuperación: un modelo de embeddings devuelve candidatos y este reranker los reordena con mayor precisión.

El modelo parte del backbone Mistral Ministral-3-8B-Instruct-2512-BF16 y añade un encoder visual basado en Pixtral, con una torre de lenguaje Ministral3 convertida en bidireccional para la tarea de ranking. Cuenta con 8.381.159.424 parámetros (8,38B) y una longitud de contexto máxima de 32.768 tokens, lo que permite puntuar documentos extensos o combinaciones de imagen y texto en una sola pasada.

Su relevancia actual radica en que cubre el hueco de los rerankers multimodales para RAG visual: NVIDIA declara resultados state-of-the-art en el leaderboard ViDoRe v3.1 Reranking a fecha de 20 de octubre de 2026, y el modelo está evaluado en 34 idiomas para recuperación de texto y 18 para recuperación de imagen. Se distribuye con licencia OpenMDW-1.1 y está listo para uso comercial o no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder visual basado en Pixtral y torre de lenguaje Ministral3 bidireccional (cross-encoder) |
| Parametros totales | 8.381.159.424 (8,38B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es BF16; no se detallan otras variantes) |
| Idiomas soportados | Multilingüe: 34 idiomas evaluados en texto (en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, hinglish, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi) y 18 en imagen (ar, bn, zh, en, fa, fi, fr, de, hi, id, ja, ko, ru, es, sw, te, th, yo) |
| Licencia | OpenMDW-1.1 (modelo base Ministral-3-8B-Instruct-2512-BF16 bajo Apache 2.0) |
| Formato de pesos | safetensors (BF16); requiere custom_code |

## Arquitectura y entrenamiento

La red combina un encoder de visión de la familia Pixtral con una torre de lenguaje Ministral3 en configuración bidireccional, lo que convierte al modelo en un cross-encoder: procesa conjuntamente consulta y documento y produce un único logit de relevancia en lugar de representaciones separadas. La entrada puede ser texto, imagen RGB o una combinación de ambos; la resolución por defecto del lado mayor de la imagen es de 1.120 píxeles, ampliable a 1.540.

El entrenamiento se realizó en dos etapas. En la primera se partió de un checkpoint reranker de 8B derivado del backbone Ministral-3-8B-Instruct-2512-BF16 y se entrenó sobre una mezcla de datasets solo de texto. En la segunda etapa, el modelo resultante se entrenó sobre datasets de imagen y de imagen más texto. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; esos datos figuran como no disponibles. El checkpoint utiliza `TokenizersBackend` y no requiere `mistral_common`, y los ejemplos oficiales emplean FlashAttention 2 con `transformers==5.20.0`.

## Capacidades

- Reranking de pares consulta-documento con salida de un logit crudo de relevancia (a mayor valor, mayor relevancia).
- Recuperación multimodal: puntúa documentos en texto, imagen de página o combinación de ambos, incluyendo gráficos, tablas e infografías.
- Recuperación visual de documentos (visual-document-retrieval) para pipelines de vision RAG.
- Soporte multilingüe amplio: 34 idiomas evaluados en texto y 18 en imagen.
- Integración en pipelines clásicos y agénticos de RAG como etapa de reordenación.
- Compatibilidad con sentence-transformers, transformers y vLLM.
- Soporte de contexto largo de hasta 32.768 tokens por par consulta-documento.
- No se documentan en la información disponible capacidades de tool calling, function calling ni modos de razonamiento explícito; el modelo es un clasificador de ranking, no un generador.

## Casos de uso

- RAG visual sobre documentación técnica: el modelo puntúa páginas escaneadas con diagramas y tablas frente a una consulta, reordenando los candidatos devueltos por un embedding multimodal y mejorando la precisión de las respuestas downstream.
- Atención al cliente sobre base documental: con 32.768 tokens de contexto puede evaluar fragmentos largos de manuales o políticas en 34 idiomas y priorizar el documento correcto antes de pasarlo al LLM generador.
- Búsqueda semántica empresarial: como segunda etapa de un pipeline de recuperación densa, reordena los resultados de un buscador interno para consultas en español, inglés, alemán o japonés, entre otros.
- Procesamiento de informes financieros: al aceptar imágenes de página, puede rankear tablas y gráficos de balances frente a preguntas concretas sin necesidad de OCR previo.
- Pipelines agénticos de recuperación: integrado como herramienta de reordenación en un agente que itera sobre fuentes heterogéneas (texto e imagen) para seleccionar evidencia antes de responder.
- Filtrado de candidatos en sistemas de e-commerce o catálogos: puntúa fichas de producto con imagen y descripción frente a la consulta del usuario para ordenar la presentación de resultados.
- Evaluación de calidad de recuperación: uso del logit como señal de relevancia para construir conjuntos de evaluación o para depurar índices documentales multilingües.

## Benchmarks y rendimiento

La model card indica que el modelo alcanza resultados state-of-the-art en el leaderboard ViDoRe v3.1 Reranking a fecha de 20 de octubre de 2026, pero no se incluyen en la información proporcionada las puntuaciones numéricas concretas (nDCG, MRR u otras) ni comparaciones cifradas con modelos alternativos.

| Benchmark | Resultado |
|---|---|
| ViDoRe v3.1 Reranking | State-of-the-art según el autor (sin cifras disponibles en la información proporcionada) |
| MMLU, HumanEval, GSM8K | No aplicables: el modelo es un reranker, no un generador |

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,8 GB solo para pesos (el repositorio ocupa 16,8 GB), más overhead de activaciones y del encoder visual; en la práctica se recomienda disponer de 24 GB o más para trabajar con comodidad.
- GPU recomendadas: NVIDIA A100, H100 y L40S para despliegue en producción; RTX 4090 (24 GB) es viable en BF16 para cargas moderadas.
- En GPU de consumo: cabe en RTX 4090 y en tarjetas con 24 GB o más en BF16; en GPUs con 16 GB requeriría cuantización, cuyos formatos no están documentados en la información disponible.
- Opciones de despliegue: transformers (probado con `transformers==5.20.0`), sentence-transformers y vLLM; los ejemplos oficiales usan FlashAttention 2, instalable desde fuente o mediante el paquete `kernels`.
- Entorno de referencia: Python 3.12, torch, accelerate y pillow para los ejemplos con transformers.
- Latencia y throughput: no disponibles en la información proporcionada. El autor señala que el modelo está optimizado para sistemas acelerados por GPU NVIDIA (CUDA) y que obtiene tiempos de inferencia menores que soluciones solo de CPU, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Rerank-8B-BF16 | 8,38B | 32.768 tokens | Texto e imagen | OpenMDW-1.1 | Hugging Face (nvidia) |
| Rerankers de texto de la familia Nemotron (versiones previas) | no disponible | no disponible | Solo texto | no disponible | no disponible |
| Rerankers multimodales de la familia ColPali/ColQwen | no disponible | no disponible | Imagen de documento | no disponible | no disponible |

No se dispone en la información proporcionada de datos numéricos de rendimiento de modelos comparables que permitan una comparación cuantitativa; la comparativa se limita a parámetros, contexto, modalidad y licencia.

## Limitaciones y advertencias

- El modelo es un reranker: no genera texto ni respuestas; su salida es un logit de relevancia que debe interpretarse con un umbral o una función de ordenación adecuada.
- Riesgo de sesgo heredado del backbone Ministral-3-8B-Instruct y de los datasets de entrenamiento, cuya composición no se detalla; no se documentan evaluaciones de sesgo en la información disponible.
- La cobertura lingüística está evaluada en 34 idiomas para texto y 18 para imagen; el rendimiento fuera de esos conjuntos no está garantizado.
- La resolución de imagen por defecto (1.120 píxeles de lado mayor, ampliable a 1.540) limita el detalle de documentos muy densos; imágenes de mayor resolución pueden degradar la puntuación.
- Licencia OpenMDW-1.1: aunque el autor declara uso comercial permitido, es una licencia distinta de Apache 2.0 y conviene revisar sus términos antes de integrarla en productos; el modelo base Ministral-3-8B-Instruct-2512-BF16 sí está bajo Apache 2.0.
- El checkpoint requiere `custom_code` y versiones específicas de transformers (5.20.0 en los ejemplos, 5.12.1 en entrenamiento y evaluaciones); entornos con versiones anteriores pueden no cargarlo.
- Los resultados state-of-the-art declarados corresponden al leaderboard ViDoRe v3.1 en la fecha indicada y no se acompañan de cifras verificables en la información disponible.
- No se documentan formatos de cuantización oficiales, lo que limita el despliegue en hardware con menos de 24 GB de VRAM sin trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Licencia Apache 2.0 (modelo base): https://www.apache.org/licenses/LICENSE-2.0.txt
- Leaderboard ViDoRe v3.1 Reranking: https://leaderboard.mteb.org/benchmark/ViDoRe(v3.1)
- Blog de NVIDIA sobre recuperación agéntica: https://huggingface.co/blog/nvidia/nemotron-retriever-world-class-agentic-retrieval
