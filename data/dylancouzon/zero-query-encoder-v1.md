# DylanCouzon/zero-query-encoder-v1

## Resumen

constella-zero (publicado en Hugging Face como `DylanCouzon/zero-query-encoder-v1`) es un codificador de consultas en inglés para búsqueda semántica desarrollado por DylanCouzon dentro del ecosistema Constella, asociado a Qdrant. Su particularidad es radical: no contiene un transformer. En lugar de ello, implementa una tabla de búsqueda (lookup table) de tokens de 30.522 x 1.024 en int8, derivada del modelo base `NovaSearch/stella_en_400M_v5`, que genera vectores normalizados de 1024 dimensiones compatibles con el índice de documentos creado por `Qdrant/stella-en-400M-v5-doc-onnx`.

El modelo resuelve un problema muy concreto de latencia: en arquitecturas de recuperación asimétrica, codificar la consulta del usuario en tiempo real es el cuello de botella del pipeline, mientras que los documentos se codifican offline una sola vez. Al sustituir el transformer por una suma ponderada de vectores de token, la codificación de consultas pasa a ser prácticamente gratuita en coste computacional, lo que lo hace apto para despliegues en el edge y para sistemas con requisitos estrictos de latencia.

Es un modelo de vista previa de investigación (research preview), con solo 31,28 millones de parámetros reales en safetensors y un repositorio de 0,3 GB. Está pensado para usarse en recuperación híbrida junto a BM25 y fusión DBSF, y es intercambiable en tiempo de consulta con `constella-nano` sobre el mismo índice de documentos, sin necesidad de recodificar nada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tabla de búsqueda de tokens (bag-of-tokens) de 30.522 x 1.024 en int8; sin transformer |
| Parámetros totales | 31.285.050 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada como máximo |
| Tipos de cuantización | int8 (tabla nativa); variante int8 en la implementación de referencia NumPy; pesos en 8-bit |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (integración FastEmbed), implementación de referencia NumPy (`zero_encoder.py`) |

## Arquitectura y entrenamiento

La arquitectura es una tabla de búsqueda aprendida: cada token del vocabulario WordPiece (30.522 entradas) tiene asociado un vector de 1.024 dimensiones almacenado en int8. Para codificar una consulta, el modelo tokeniza con WordPiece, recupera el vector de cada token y los combina en un único embedding. Los tokens repetidos reciben peso decreciente: un token que aparece `c` veces contribuye con un peso total de `sqrt(c)`. El resultado se normaliza en L2. Los pesos de los tokens ya están incorporados en la tabla, de modo que no hay etapa de pooling posterior más allá de la combinación y normalización.

Se trata, por tanto, de un modelo de bolsa de tokens (bag-of-tokens) que no representa directamente el orden de las palabras, la sintaxis ni la negación. El modelo se deriva del codificador de consultas de `NovaSearch/stella_en_400M_v5`, que actúa como profesor, y está diseñado para operar en el mismo espacio vectorial que el codificador de documentos `Qdrant/stella-en-400M-v5-doc-onnx`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de embeddings de consulta de 1024 dimensiones, normalizados en L2, para búsqueda semántica.
- Codificación de consultas sin transformer: la ruta de inferencia es una búsqueda en tabla más combinación ponderada y normalización.
- Recuperación asimétrica: empareja consultas con documentos codificados por `Qdrant/stella-en-400M-v5-doc-onnx`.
- Intercambiabilidad en tiempo de consulta con `constella-nano` sobre el mismo índice de documentos, sin recodificar ni reconstruir la colección.
- Recuperación híbrida: pensado para combinarse con BM25 y fusión DBSF (prefetch de 100 candidatos por lado).
- Integración con FastEmbed y Qdrant; compatible con cualquier base de datos vectorial que soporte similitud coseno.
- Implementación de referencia en NumPy (`zero_encoder.py`) que no requiere FastEmbed ni ONNX Runtime.
- Capacidades multilingües: no disponibles (solo inglés).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un codificador de features.

## Casos de uso

- Búsqueda semántica de baja latencia en producción: al sustituir el transformer del codificador de consultas por una tabla de búsqueda, el tiempo de codificación de la consulta se reduce drásticamente, lo que permite responder en milisegundos en sistemas de búsqueda interactiva donde el usuario espera resultados mientras escribe.
- Despliegue en el edge y en dispositivos con recursos limitados: con 31,28 millones de parámetros en int8 y un repositorio de 0,3 GB, el modelo cabe en entornos con memoria muy restringida, incluidos navegadores o dispositivos móviles, donde un transformer de 400M no sería viable.
- Recuperación híbrida densa y léxica: el flujo recomendado combina constella-zero con BM25 y fusión DBSF con prefetch de 100 candidatos por lado, alcanzando 0,4887 de nDCG@10 medio en los seis conjuntos evaluados; es adecuado para motores de búsqueda documental que ya dispongan de índice léxico.
- Migración progresiva de calidad en un índice existente: como Zero y Nano comparten el mismo índice de documentos, un equipo puede desplegar Zero para consultas de alta frecuencia y conmutar a Nano para consultas donde prime la calidad, sin reindexar la colección.
- Búsqueda sobre documentación técnica y científica: los resultados en SciFact (0,6101) y TREC-COVID (0,5490) lo hacen utilizable en recuperación de literatura biomédica y verificación de afirmaciones, especialmente en combinación con BM25.
- Filtrado y prefiltrado de candidatos en pipelines RAG: al ser extremadamente barato de ejecutar, puede usarse como primera etapa que reduce el conjunto de candidatos antes de un reranker más costoso, reservando el presupuesto computacional para la etapa de reordenación.
- Prototipado e investigación en recuperación: la implementación de referencia en NumPy y la licencia MIT facilitan la experimentación académica con arquitecturas de recuperación sin transformer y la comparación con líneas base léxicas como BM25.

## Benchmarks y rendimiento

Resultados de búsqueda exacta con nDCG@10 publicados en la model card. ArguAna y FiQA están marcados porque el profesor Stella declara contacto de entrenamiento o evaluación con esos conjuntos de datos:

| Sistema | NFCorpus | SCIDOCS | SciFact | TREC-COVID | ArguAna* | FiQA* |
|---|---:|---:|---:|---:|---:|---:|
| constella-zero | 0,3124 | 0,1677 | 0,6101 | 0,5490 | 0,5916 | 0,3728 |
| constella-nano | 0,3631 | 0,2177 | 0,7211 | 0,7871 | 0,6233 | 0,4778 |
| BM25 | 0,3180 | 0,1565 | 0,6791 | 0,6099 | 0,4878 | 0,2532 |
| Codificador de consultas Stella | 0,4134 | 0,2395 | 0,7796 | 0,8234 | 0,6369 | 0,5536 |

En configuración híbrida con BM25 y fusión DBSF (prefetch 100), constella-zero alcanza un nDCG@10 medio de 0,4887 en los seis conjuntos y de 0,4912 en los cuatro conjuntos sin contacto declarado con Stella. El lado léxico evaluado usó `bm25s` con valores por defecto de Lucene. El autor indica que la evaluación completa de BEIR está en curso y que los resultados de esa evaluación más amplia no están incluidos todavía.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en int8; el repositorio completo ocupa 0,3 GB, por lo que el modelo puede residir íntegramente en memoria de cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (RTX 3060, RTX 4090) o incluso CPU es suficiente; el modelo no se beneficia de aceleradores de alto rendimiento como A100 o H100 porque no ejecuta operaciones de transformer.
- Cabe en GPU consumer: sí, en cualquier GPU consumer y en muchos entornos sin GPU, incluidos dispositivos de borde.
- Opciones de despliegue: FastEmbed (soporte nativo desde la rama de vista previa de Constella, `fastembed>=0.9.0`), ONNX Runtime, Qdrant como base de datos vectorial e implementación de referencia en NumPy sin dependencias de FastEmbed ni ONNX Runtime.
- Latencia y throughput: la model card incluye una sección de coste de codificación de consultas cuyas mediciones no están disponibles en la información proporcionada. Cualitativamente, el autor describe Zero como la opción más rápida frente a Nano.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | nDCG@10 medio (6 datasets) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| constella-zero | 31,28 M | 512 tokens | Tabla de búsqueda int8 | 0,4887 (híbrido con BM25 y DBSF) | MIT | Hugging Face, FastEmbed (rama preview) |
| constella-nano | No disponible | No disponible | No disponible (codificador de consultas) | No disponible como media; supera a Zero en los seis datasets | No disponible | Hugging Face (`Qdrant/constella-nano`) |
| Codificador de consultas Stella (`NovaSearch/stella_en_400M_v5`) | ~400 M (según nombre del modelo) | No disponible | Transformer | No disponible como media; superior a Zero en los seis datasets | No disponible | Hugging Face |
| BM25 | No aplica | No aplica | Léxico (bag-of-words) | No disponible como media; inferior a Zero en cuatro de seis datasets | No aplica | `bm25s`, Lucene y múltiples implementaciones |

## Limitaciones y advertencias

- Es un modelo de bolsa de tokens: no representa orden de palabras, sintaxis ni negación, lo que puede degradar la recuperación en consultas que dependen de esas estructuras.
- Solo admite inglés; no hay soporte multilingüe declarado.
- Ventana de entrada limitada a 512 tokens.
- Calidad de recuperación inferior a la del codificador de consultas Stella en los seis conjuntos reportados; es una elección de compromiso latencia-calidad, no un sustituto equivalente.
- Los resultados en ArguAna y FiQA deben interpretarse con cautela por el contacto declarado del profesor Stella con esos conjuntos; conviene usar la media sobre los cuatro conjuntos sin contacto (0,4912) como referencia más limpia.
- Estado de vista previa de investigación: el soporte nativo en FastEmbed requiere la rama de vista previa de Constella, y la evaluación completa de BEIR aún no está publicada.
- No debe usarse el codificador de documentos como codificador de consultas sin prompt; hay que emplear constella-zero, constella-nano o la ruta de consulta con prompt de Stella.
- Riesgo de alucinación: no aplica directamente, al no ser un modelo generativo, pero los embeddings pueden producir recuperaciones semánticamente plausibles y factualmente irrelevantes en dominios fuera de distribución.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al derivarse de un vocabulario WordPiece entrenado sobre corpus en inglés, hereda las limitaciones de cobertura de ese vocabulario.
- Los resultados híbridos dependen de la implementación de BM25 empleada; la evaluación usó `bm25s` con valores por defecto de Lucene y pueden diferir con otra implementación.
- Licencia MIT: permite uso comercial, pero el estado de vista previa y la ausencia de evaluación completa de BEIR desaconsejan asumirlo como componente crítico en producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DylanCouzon/zero-query-encoder-v1
- Modelo base: https://huggingface.co/NovaSearch/stella_en_400M_v5
- Codificador de documentos: https://huggingface.co/Qdrant/stella-en-400M-v5-doc-onnx
- Codificador de consultas alternativo: https://huggingface.co/Qdrant/constella-nano
- Qdrant: https://qdrant.tech
- FastEmbed: https://github.com/qdrant/fastembed
- Cliente de Qdrant para Python: https://github.com/qdrant/qdrant-client
- BM25S: https://github.com/xhluca/bm25s
