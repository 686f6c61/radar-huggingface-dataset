# MNAII/mnai-nyx-0.5

## Resumen

MNAI Nyx 0.5 es un modelo multimodal any-to-any de 2.124.330.512 parámetros (2,1B) publicado por MNAII bajo licencia MIT. No es un modelo con pesos preentrenados: el repositorio contiene la arquitectura, el tokenizador y el pipeline de entrenamiento, pero los pesos finales deben ser entrenados por el usuario. Se presenta como la variante pequena de la familia Nyx, que incluye Nyx 1 (504,5B) y Nyx 1.2 (2,21T), ambas pensadas para clusters de GPUs.

La arquitectura combina un decoder tipo Llama (GQA, SwiGLU, RoPE, RMSNorm, embeddings atados) con un encoder de vision basado en ViT, un decoder de imagen basado en DiT y un encoder/decoder de audio. El contexto es de 8192 tokens y el vocabulario de 128256 entradas. Soporta variante densa (por defecto) y variante MoE con 8 expertos y top-2 por token.

Su relevancia practica es acotada: no hay pesos entrenados ni resultados de benchmarks publicados, por lo que su utilidad inmediata depende de que alguien complete el entrenamiento. El interes tecnico esta en el diseno (any-to-any desde cero, pipeline de datos reproducible, soporte denso/MoE) y en que el objetivo declarado es que quepa en una unica GPU de 24 GB durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama decoder (GQA, SwiGLU, RoPE, RMSNorm) + encoder ViT + decoder de imagen DiT + encoder/decoder de audio |
| Parametros totales | 2.124.330.512 (2,1B): nucleo de texto 2,0B + vision 0,031B + decoder de imagen 0,091B + audio 0,006B |
| Parametros activos | No aplica en denso; variante MoE: 10,9B totales, 3,3B activos por token (8 expertos, top-2) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | Q4_K_M (~1,1 GB), Q8_0 (~2,0 GB) via llama.cpp; bf16 (~4 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | No disponible (no se publican pesos entrenados); salida de cuantizacion en GGUF |
| Hidden size | 2560 |
| Capas | 24 |
| Cabezas | 20 query, 5 key/value |
| FFN | 6912 |
| Vocabulario | 128256 |
| Embeddings | Atados |

## Arquitectura y entrenamiento

El nucleo de texto sigue el layout estandar de un bloque Llama: 24 capas, hidden de 2560, 20 cabezas de query y 5 de key/value (GQA), FFN de 6912, RoPE, RMSNorm y embeddings atados. A esto se anaden un encoder de vision ViT (0,031B), un decoder de imagen DiT (0,091B) y un encoder/decoder de audio (0,006B), dando el caracter any-to-any (texto, imagen y audio de entrada y salida). La variante MoE sustituye el MLP SwiGLU de cada bloque por una capa `MoELayer` con router top-2 sobre 8 expertos y una perdida auxiliar de balanceo de carga.

El entrenamiento se plantea desde cero, sin modelo base ni destilacion, sobre el corpus FineWeb completo (15T tokens) mas FineWeb-Edu, intercalados 80/20. El pipeline (`data.py`) incluye filtrado de documentos cortos (<200 caracteres), boilerplate y documentos mayoritariamente no alfabeticos; deduplicacion exacta por SHA-256 y casi-duplicados por shingles de 8 palabras con similitud Jaccard; y mezclas de dominio configurables (web 50%, libros 15%, codigo 15%, academico 10%, sintetico 10%). Se menciona generacion de datos sinteticos a partir de checkpoints previos (`synthetic.py`). No se documentan fases de RLHF o DPO, ni el numero de tokens efectivamente usados en un entrenamiento completado (el objetivo declarado es 40B tokens, aproximadamente 20 por parametro segun Chinchilla).

## Capacidades

- Generacion de texto en ingles con arquitectura tipo Llama.
- Entrada y salida multimodal: texto, imagen y audio (diseno any-to-any declarado).
- Generacion de imagen mediante decoder DiT.
- Procesamiento de imagen a texto mediante encoder ViT.
- Procesamiento de audio de entrada y salida mediante encoder/decoder dedicado.
- Soporte de variante MoE con 8 expertos y enrutamiento top-2.
- Conversion a GGUF mediante el conversor estandar de llama.cpp.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo thinking ni capacidades de agente.

## Casos de uso

- Entrenamiento educativo de un LLM desde cero: el repositorio incluye arquitectura, tokenizador y pipeline de datos, lo que permite reproducir el ciclo completo de entrenamiento en una unica GPU de 24 GB con el objetivo de 40B tokens.
- Investigacion sobre pipelines de datos a gran escala: `data.py` implementa streaming de FineWeb, filtrado, deduplicacion exacta y por shingles, y mezclas de dominio configurables, reutilizables para estudiar el impacto de la composicion del corpus.
- Experimentacion con arquitecturas MoE: la variante con 8 expertos y top-2 (10,9B totales, 3,3B activos) permite medir el coste de enrutamiento y balanceo de carga frente al modelo denso de 2,0B.
- Prototipado multimodal any-to-any: el diseno integra texto, imagen y audio en un solo checkpoint, util para validar arquitecturas que combinan decoder Llama con ViT, DiT y codecs de audio.
- Despliegue en entornos con recursos limitados: una vez entrenado y cuantizado a Q4_K_M (~1,1 GB) o Q8_0 (~2,0 GB), el modelo cabe en portatiles y GPUs de consumo para inferencia de texto.
- Generacion de imagen condicionada por texto: el decoder DiT de 0,091B permite experimentar con sintesis de imagen a baja escala dentro del mismo modelo.
- Base para fine-tuning posterior: al ser un checkpoint propio con licencia MIT, puede adaptarse a dominios concretos sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: una unica GPU de 24 GB segun el autor (objetivo de diseno de Nyx 0.5); la variante MoE de 10,9B totales tambien cabe en una GPU pero entrena mas lento por token.
- Checkpoint entrenado en bf16: aproximadamente 4 GB.
- Inferencia cuantizada: Q4_K_M ~1,1 GB y Q8_0 ~2,0 GB para el nucleo de texto de 2,0B.
- GPU de consumo: el modelo cuantizado cabe en GPUs consumer con 4-8 GB de VRAM; no se especifican modelos concretos (RTX 4090, etc.) en la informacion disponible.
- Despliegue: llama.cpp para GGUF; el layout Llama estandar permite usar su conversor habitual. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Pesos publicados |
|---|---|---|---|---|---|
| MNAI Nyx 0.5 | 2,1B (10,9B en MoE) | 8192 | Texto, imagen, audio | MIT | No (entrenamiento propio) |
| Nyx 1 | 504,5B | No disponible | No disponible | No disponible | No (entrenamiento propio) |
| Nyx 1.2 | 2,21T | No disponible | No disponible | No disponible | No (entrenamiento propio) |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No incluye pesos preentrenados: el repositorio es codigo y pipeline; sin un entrenamiento completo el modelo no es utilizable para inferencia.
- No hay resultados de benchmarks publicados, por lo que no puede evaluarse su calidad frente a alternativas.
- Solo soporta ingles; no se documentan capacidades multilingues.
- Contexto limitado a 8192 tokens, inferior al de modelos actuales de gama similar.
- Riesgo de sesgos y alucinaciones inherente a un entrenamiento sobre FineWeb sin fases documentadas de RLHF o DPO.
- El pipeline de datos descarga y procesa 15 TB de texto; requiere infraestructura de almacenamiento y ancho de banda considerables aunque el entrenamiento quepa en una GPU.
- La licencia MIT permite uso comercial, pero al no existir pesos entrenados oficialmente no hay garantia de calidad ni soporte.
- El autor declara que "los pesos y el GGUF estan bloqueados" en el marco AIMYTOG, lo que conviene verificar antes de planificar un despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/MNAII/mnai-nyx-0.5
- Repositorio Nyx 1: https://github.com/MeowSamOPDZN/mnai-nyx-1
- Repositorio Nyx 1.2: https://github.com/MeowSamOPDZN/mnai-nyx-1-2
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
