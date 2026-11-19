# EVOKA/BanhTrangPhoi-L20-GGUF

## Resumen

BanhTrangPhoi-L20-GGUF es la versión cuantizada en formato GGUF (Q8_0) del modelo de embeddings BanhTrangPhoi-L20, desarrollado por EVOKA. Se trata de un estudiante destilado de BAAI/bge-m3 con 20 capas y un vocabulario podado de 125.000 tokens, diseñado para generar representaciones vectoriales multilingües en tres modalidades simultáneas: densa (CLS), dispersa (sparse) y ColBERT. El modelo base cuenta con 388.316.160 parámetros y una dimensión de embedding de 1024.

El modelo resuelve el problema del coste computacional y de memoria de bge-m3 en despliegues de recuperación de información (RAG, búsqueda semántica, reranking) al ofrecer un fichero de 441 MB que cabe en memoria modesta y puede acelerarse por GPU mediante offload en llama.cpp. La poda de vocabulario y la reducción a 20 capas permiten un modelo más ligero manteniendo, según las tablas de compuerta publicadas, un rendimiento casi equivalente al profesor en la mayoría de idiomas del tier 1.

Es relevante ahora porque permite desplegar un sistema de embeddings híbrido (denso + léxico + ColBERT) sobre llama.cpp, con licencia MIT y soporte para 12 idiomas, sin depender de frameworks de inferencia específicos de embeddings. La versión GGUF se presenta como casi sin pérdida respecto al estudiante fp16, con diferencias inferiores a 0,4 puntos en las celdas de compuerta del tier 1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (arquitectura `bert` en GGUF), 20 bloques |
| Parámetros totales | 388.316.160 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncado en las compuertas de evaluación; el servidor se arranca con `-c 8192` pero no se han medido textos > 512 tokens) |
| Tipos de cuantización | Q8_0 (única publicada en este repo) |
| Idiomas soportados | vi, ja, en, zh, ko, ar, es, fr, hi, id, ru, th, multilingual |
| Licencia | MIT |
| Formato de pesos | GGUF (`BanhTrangPhoi-L20-Q8_0.gguf`, 441 MB); cabezas auxiliares en PyTorch (`sparse_linear.pt`, `colbert_linear.pt`) y tokenizer en `tokenizer.json` |
| Dimensión de embedding | 1024 |
| Vocabulario | 125.000 tokens (podado respecto a bge-m3) |
| Modelo base | BAAI/bge-m3 |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La arquitectura es un transformer tipo BERT de 20 capas con vocabulario podado a 125.000 tokens, destilado a partir de BAAI/bge-m3. El modelo produce los estados ocultos del transformer y las tres salidas de bge-m3 se calculan en el cliente a partir de ellos: la representación densa es el vector CLS normalizado L2, la dispersa se obtiene aplicando `relu(Linear(h))` por token con la cabeza `sparse_linear.pt`, y la ColBERT aplica `L2(Linear(h[1:]))` con `colbert_linear.pt`. El repositorio incluye los mapas de identificación `id_map_new2old.json` e `id_map_old2new.json` para traducir entre el vocabulario podado y el original de bge-m3.

El entrenamiento se realizó por destilación desde bge-m3, con datos que incluyen FineWeb-2 (ODC-By 1.0), C4 (ODC-By 1.0), Aya (Apache-2.0), OASST1 (Apache-2.0), preguntas de TyDi QA (Apache-2.0) y Wikidata (CC0). MIRACL, MKQA y MLDR se usaron únicamente para evaluación. No se especifica en la información disponible el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO (no aplicable típicamente a modelos de embeddings). La innovación técnica destacable es la poda de vocabulario y la reducción de profundidad manteniendo las tres cabezas de salida de bge-m3, lo que permite un despliegue híbrido denso/disperso/ColBERT sobre llama.cpp con `--pooling none`.

## Capacidades

- Generación de embeddings densos normalizados L2 a partir del vector CLS (dimensión 1024).
- Generación de representaciones dispersas (sparse lexical weights) por token mediante la cabeza `sparse_linear`.
- Generación de embeddings multi-vector ColBERT por token mediante la cabeza `colbert_linear`.
- Recuperación de información multilingüe en 12 idiomas (vi, ja, en, zh, ko, ar, es, fr, hi, id, ru, th).
- Búsqueda híbrida combinando similitud densa, coincidencia léxica dispersa y late interaction (ColBERT).
- Compatible con llama.cpp mediante `llama-server --embedding --pooling none` y offload a GPU con `-ngl 99`.
- Soporte de truncado a 512 tokens mediante el tokenizer incluido.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica en RAG: el modelo genera vectores densos de 1024 dimensiones para indexar y consultar fragmentos de documentación; su tamaño reducido (441 MB) permite mantener el índice y el modelo en la misma máquina.
- Recuperación híbrida densa + BM25: usando solo la salida densa se combina con BM25 en pipelines clásicos de recuperación, aprovechando que el modelo cabe en CPU con 1,4-1,9 GB de RSS.
- Reranking con ColBERT: la cabeza `colbert_linear` produce embeddings multi-vector por token que permiten late interaction para reordenar los candidatos recuperados en una primera fase.
- Búsqueda léxica dispersa: la cabeza `sparse_linear` genera pesos por token que funcionan como representación léxica aprendida, útil para consultas con términos raros o nombres propios donde la similitud densa falla.
- Indexación multilingüe en producción: con soporte para 12 idiomas y licencia MIT, se puede desplegar un índice único que cubra consultas en español, inglés, chino, árabe, hindi, etc., sin modelos separados por idioma.
- Despliegue en hardware modesto o en el borde: el fichero Q8_0 de 441 MB y el consumo de 1,4-1,9 GB de RSS permiten ejecutar el modelo en servidores sin GPU o en GPUs de consumo con offload parcial.
- Evaluación de calidad de recuperación: las tablas de compuerta incluidas (`GATE.md`) permiten reproducir las métricas recall@20/50 y nDCG@10 sobre pools de cross-check en CPU y GPU.

## Benchmarks y rendimiento

Datos de compuerta publicados en la model card (tier 1, celdas ALL, modo `all`, recall@20 en %, bge-m3 → este modelo):

| Idioma | bge-m3 | BanhTrangPhoi-L20 |
|---|---|---|
| vi | 94,6 | 95,1 |
| ja | 100 | 100 |
| en | 98,9 | 100 |
| zh | 91,1 | 90,4 |
| ko | 89,9 | 89,7 |

Rendimiento en CPU (aarch64 Cortex-X925/A725, 16 hilos, llama-server con 4 slots, carga media ~12; las tres cabezas calculadas):

| Entrada | Latencia b1 p50 / p95 | Throughput b64 (textos/s) | RSS |
|---|---|---|---|
| query, 32 tokens | 118 / 132 ms | 12,1 | 1,4 GB |
| passage, 256 tokens | 401 / 435 ms | 3,1 | 1,6 GB |
| passage, 512 tokens | 739 / 766 ms | 1,7 | 1,9 GB |

Comparación con la variante ONNX int8 en la misma máquina: 84,9 / 12,0 / 5,5 textos/s para las mismas entradas, es decir, la ruta llama.cpp en CPU es más lenta que ONNX int8. En las ejecuciones de compuerta sobre el pool de cross-check, la codificación de documentos tardó 2.864 s en CPU (una petición a la vez) y 815 s en GPU (`-ngl 99`, 16 slots paralelos, peticiones concurrentes).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; al ser un modelo de embeddings, esas métricas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 441 MB; con offload completo a GPU se requiere aproximadamente 1-2 GB de VRAM incluyendo buffers de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para offload completo; en la práctica RTX 3060/4060 o superiores funcionan sin problema. Para alto throughput se recomienda A100 o H100 con múltiples slots concurrentes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 4 GB en adelante) con `-ngl 99`.
- Opciones de despliegue: `llama-server` de llama.cpp con `--embedding --pooling none`; también es posible usar las variantes ONNX del repositorio base si solo se necesitan vectores densos (más rápidas en CPU según la model card).
- Latencia y throughput estimados: en CPU, 118 ms para consultas de 32 tokens y 739 ms para pasajes de 512 tokens (p50); en GPU, la codificación del pool de cross-check fue 3,5 veces más rápida que en CPU (815 s frente a 2.864 s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| BanhTrangPhoi-L20-GGUF | 388 M | 512 (evaluado) | 12 | MIT | GGUF Q8_0 | Destilado de bge-m3, tres cabezas |
| BAAI/bge-m3 | no disponible en la información | 8192 (típico de bge-m3) | multilingüe | MIT | safetensors, ONNX | Profesor; mayor tamaño y coste |
| EVOKA/BanhTrangPhoi-L20 | 388 M | 512 (evaluado) | 12 | MIT | fp16 (repo base) | Estudiante sin cuantizar; referencia de pérdida del Q8_0 |
| Variante ONNX int8 del repo base | 388 M | 512 (evaluado) | 12 | MIT | ONNX int8 | Más rápida en CPU que la ruta llama.cpp según la model card |

No se dispone de datos de benchmarks comparativos con otras alternativas de embeddings en la información proporcionada.

## Limitaciones y advertencias

- La compuerta de nivel 1 frente al bge-m3 original NO se superó: 13 celdas quedan fuera de no inferioridad, incluidas celdas MKQA cross-lingual chino/coreano con n = 250, recall@50 denso en coreano con -1,72 y recall@50 denso en vietnamita con -0,40.
- El tier 2 (ar/es/fr/hi/id/ru/th) sí está dentro de límites en los cuatro modos, con delta medio de -0,95 en el modo `all`.
- No se han medido textos de más de 512 tokens; todas las compuertas usan max_len 512, por lo que el comportamiento en contextos largos es desconocido.
- Solo se ha publicado la cuantización Q8_0; no hay datos sobre otras cuantizaciones.
- El vocabulario está podado, por lo que es obligatorio usar el tokenizer incluido en `heads/tokenizer.json`; los ids no coinciden con los de bge-m3.
- El campo `general.name` embebido en el GGUF dice "Gpu Fp16", que es solo una etiqueta de la conversión y no refleja la cuantización real.
- La ruta llama.cpp en CPU es más lenta que la variante ONNX int8 del repo base; GGUF se justifica por tamaño reducido, bajo consumo de RAM y offload a GPU.
- Riesgo de sesgos y alucinación: no se documentan evaluaciones de sesgo en la información disponible; al ser un modelo de recuperación, el riesgo principal es el sesgo en los rankings de documentos, no la generación de texto.
- Restricciones de licencia: MIT permite uso comercial, pero se debe acreditar al profesor BAAI/bge-m3; las licencias de las fuentes de datos de entrenamiento (FineWeb-2, C4, Aya, OASST1, TyDi QA, Wikidata) aplican a esos datos.
- Para producción, verificar el número de vectores devueltos coincide con el número de ids enviados y usar `--pooling none` para obtener los estados ocultos por token.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EVOKA/BanhTrangPhoi-L20-GGUF
- Repositorio base (estudiante fp16): https://huggingface.co/EVOKA/BanhTrangPhoi-L20
- Modelo profesor: https://huggingface.co/BAAI/bge-m3
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Paper de bge-m3: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
