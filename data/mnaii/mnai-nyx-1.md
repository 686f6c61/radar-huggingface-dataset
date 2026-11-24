# MNAII/mnai-nyx-1

## Resumen

MNAI Nyx 1 es un repositorio de entrenamiento publicado por MNAII que define, en código y configuración, un modelo multimodal any-to-any de 504.508.754.192 parámetros (504,5B) construido desde cero sobre una arquitectura Llama densa con módulos adicionales de visión, decodificación de imagen y audio. El repositorio no contiene pesos entrenados: incluye el código del modelo, el tokenizador, el pipeline de datos y los scripts de escalado, cuantización y entrenamiento distribuido con FSDP. El objetivo declarado es que el usuario entrene el modelo en su propio clúster con sus propios datos.

La propuesta técnica se apoya en un núcleo de texto de 496,4B parámetros con layout estándar de bloque Llama (GQA, SwiGLU, RoPE, RMSNorm, embeddings atados), al que se suman un codificador ViT de 1,94B, un decodificador de imagen DiT de 5,82B y un codificador/decodificador de audio de 0,37B. El contexto declarado es de 8192 tokens, con vocabulario de 152064 entradas, dimensión oculta de 20480 y 112 capas.

Su relevancia es acotada y conviene leerla con precisión: no es un modelo listo para inferencia, sino una plantilla de entrenamiento a gran escala con pipeline de datos para FineWeb (15T tokens) y FineWeb-Edu, mezclados 80/20 por defecto, además de una variante MoE opcional de 8 expertos con top-2 que eleva el núcleo de texto a 3.258,6B parámetros totales y 891,0B activos por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama decoder denso (GQA, SwiGLU, RoPE, RMSNorm) + ViT vision encoder + DiT image decoder + audio encoder/decoder; variante MoE opcional (8 expertos, top-2) |
| Parametros totales | 504.508.754.192 (504,5B): texto 496,4B + vision 1,94B + image decoder 5,82B + audio 0,37B |
| Parametros activos | 496,4B en denso (100% por token); 891,0B en variante MoE (27,3% del total de 3.258,6B) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | Q4_K_M (~0,55 bytes/parametro, ~273 GB para el nucleo de texto) y Q8_0 (~1,0 bytes/parametro, ~496 GB); bf16 ~1 TB |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | No hay pesos publicados; el script de cuantizacion genera GGUF (Q4_K_M y Q8_0) desde un checkpoint entrenado. Los modulos multimodales permanecen en PyTorch |
| Hidden size | 20480 |
| Capas | 112 |
| Cabezas | 160 query, 8 key/value |
| FFN | 57344 |
| Vocabulario | 152064 |
| Embeddings | atados (tied) |
| Datasets de entrenamiento | HuggingFaceFW/fineweb (15T tokens) + HuggingFaceFW/fineweb-edu, mezcla 80/20 por defecto |

## Arquitectura y entrenamiento

El núcleo de texto sigue el layout estándar de bloque Llama, lo que permite que llama.cpp convierta un checkpoint terminado a GGUF con su conversor habitual. Sobre ese núcleo se acoplan tres módulos: un codificador ViT para visión, un decodificador DiT para generación de imagen y un codificador/decodificador de audio, conformando una arquitectura any-to-any (texto, imagen y audio de entrada y salida). La variante MoE sustituye el MLP SwiGLU de cada bloque por una capa `MoELayer` con router top-2 sobre 8 expertos y una pérdida auxiliar de balanceo de carga; el entrenamiento se lanza con `--moe-experts 8 --moe-topk 2`.

El pipeline de datos (`data.py`) es el componente central del repositorio: streaming de los 15T tokens de FineWeb más FineWeb-Edu con tokenización al vuelo y empaquetado en bloques fijos; filtrado de documentos de menos de 200 caracteres, boilerplate y textos mayoritariamente no alfabéticos; deduplicación exacta por SHA-256 del texto normalizado y casi-duplicados por shingles de 8 palabras con similitud Jaccard; y mezclas configurables mediante `--data-mix`, con opción domain-balanced (web 50%, libros 15%, código 15%, académico 10%, sintético 10%). El script `synthetic.py` genera datos de entrenamiento a partir de un checkpoint previo. El entrenamiento distribuido usa FSDP con `torchrun` (ejemplo de 8 procesos por nodo y 32 nodos). El script `scaling.py` ajusta una ley de potencia estilo Chinchilla (loss = A · N^-alpha) sobre modelos proxy de 1M, 5M y 20M parámetros para extrapolar la pérdida a 504,5B antes de lanzar el run completo. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento.

## Capacidades

- Generación de texto y modelado de lenguaje sobre el núcleo Llama de 496,4B parámetros, una vez entrenado.
- Entrada y salida multimodal any-to-any: texto, imagen y audio, según los módulos ViT, DiT y de audio incluidos en la definición del modelo.
- Image-to-text (descripción o interpretación de imágenes) y text-to-image (generación de imágenes vía decodificador DiT).
- Procesamiento de audio de entrada y salida mediante el codificador/decodificador de audio de 0,37B.
- Entrenamiento desde cero sin modelo base ni destilación, con soporte de FSDP para paralelismo de datos y sharding.
- Variante MoE con enrutamiento top-2 sobre 8 expertos y pérdida auxiliar de balanceo.
- Pipeline de datos reproducible: streaming, filtrado, deduplicación exacta y aproximada, y mezclas de dominio configurables.
- Cuantización a GGUF (Q4_K_M, Q8_0) del núcleo de texto para despliegue con llama.cpp.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, modo thinking ni capacidades multilingües más allá del inglés.

## Casos de uso

- Investigación en entrenamiento a gran escala: el repositorio sirve como plantilla reproducible para lanzar runs de 500B con FSDP, incluyendo el pipeline de datos completo y los scripts de lanzamiento con `torchrun`.
- Estudio de leyes de escalado: `scaling.py` permite ajustar una ley de potencia Chinchilla sobre modelos proxy de 1M a 20M parámetros y extrapolar la pérdida esperada a 504,5B antes de comprometer presupuesto de clúster.
- Experimentación con arquitecturas híbridas multimodales: la combinación de núcleo Llama con ViT, DiT y códec de audio permite investigar el acoplamiento de modalidades en un único transformer any-to-any.
- Comparación denso frente a MoE: la misma base de código permite entrenar la variante densa (496,4B, 100% de parámetros activos) y la MoE (3.258,6B totales, 891,0B activos) para estudiar el equilibrio entre capacidad y coste de activación.
- Construcción de corpus de preentrenamiento: el pipeline de `data.py` (filtrado, deduplicación SHA-256 y por shingles, mezclas por dominio) es reutilizable para preparar streams de entrenamiento de otros modelos.
- Despliegue cuantizado tras el entrenamiento: `quantize.py` genera GGUF Q4_K_M (~273 GB) y Q8_0 (~496 GB) del núcleo de texto para servir el modelo con llama.cpp en infraestructura con suficiente memoria.
- Generación de datos sintéticos: `synthetic.py` produce texto de entrenamiento a partir de un checkpoint intermedio para aumentar el corpus en fases avanzadas del run.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye pesos entrenados ni evaluaciones sobre MMLU, HumanEval, GSM8K u otras tareas; únicamente describe el procedimiento de escalado y la extrapolación de pérdida prevista.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 1 TB para el checkpoint entrenado completo.
- Cuantización Q8_0: ~496 GB para el núcleo de texto de 496,4B parámetros.
- Cuantización Q4_K_M: ~273 GB para el núcleo de texto, el formato más pequeño que el autor considera que mantiene calidad de respuesta.
- Entrenamiento: el ejemplo del repositorio usa `torchrun` con 8 procesos por nodo y 32 nodos (256 GPUs) para la variante MoE; no se especifica el modelo de GPU recomendado.
- Inferencia en GPU de consumo: no es viable con los tamaños indicados (273 GB en Q4_K_M excede la VRAM de cualquier GPU de consumo actual); requiere agregación de memoria en múltiples aceleradores o CPU con suficiente RAM.
- Despliegue: llama.cpp para los GGUF del núcleo de texto; los módulos multimodales quedan en PyTorch y no se convierten a GGUF. No se documenta soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Pesos publicados |
|---|---|---|---|---|---|
| MNAI Nyx 1 | 504,5B (496,4B texto) | 8192 | Texto, imagen, audio (any-to-any) | MIT | No (solo código y pipeline) |
| Llama 3.1 405B | 405B | 128K | Texto | Llama 3.1 Community License | Sí |
| Qwen2.5-Omni | no disponible en la informacion | no disponible | Texto, imagen, audio | no disponible | Sí |

La comparación con Llama 3.1 405B es la más directa por orden de magnitud y layout de bloque, pero la diferencia crítica es la disponibilidad: Nyx 1 exige entrenar el modelo desde cero, mientras que las alternativas citadas distribuyen pesos preentrenados. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- El repositorio no contiene pesos entrenados: es una plantilla de entrenamiento. Cualquier uso requiere un run completo desde cero en un clúster propio.
- El coste de entrenamiento de un modelo de 504,5B parámetros con ~10T tokens es muy elevado; el propio autor reconoce que se necesita un clúster dedicado.
- Solo se declara soporte de inglés (`language: en`); no hay evidencia de capacidades multilingües.
- Contexto limitado a 8192 tokens, muy por debajo de los 128K de modelos contemporáneos de escala similar.
- No se documenta alineación (RLHF, DPO) ni evaluación de sesgos; un modelo preentrenado sin fases posteriores presenta riesgo elevado de alucinación y de reproducir sesgos del corpus web.
- El pipeline de datos incluye deduplicación y filtrado, pero el corpus FineWeb es Common Crawl sin curación adicional más allá de FineWeb-Edu; la calidad del modelo dependerá de la mezcla elegida.
- La cuantización GGUF solo cubre el núcleo de texto; los módulos de visión, imagen y audio permanecen en PyTorch, lo que complica el despliegue multimodal en producción.
- La variante MoE multiplica los parámetros totales a 3.258,6B, con requisitos de memoria y sharding de expertos considerablemente mayores.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- Licencia MIT: permisiva para uso comercial, pero sin garantías del autor sobre el comportamiento del modelo entrenado.

## Enlaces

- Hugging Face: https://huggingface.co/MNAII/mnai-nyx-1
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
