# amd/HyLo-Qwen-14MLA14GDN-8K-SFT

## Resumen

HyLo-Qwen-14MLA14GDN-8K-SFT es un checkpoint experimental publicado por AMD que transforma un transformer denso preentrenado en una arquitectura hibrida, en lugar de entrenar un modelo hibrido desde cero. Partiendo de Qwen/Qwen3-1.7B, cada capa se reconvierte a uno de dos tipos: 14 capas pasan a Multi-head Latent Attention (MLA), que cachea un latente de rango bajo en vez de claves y valores completos, y las otras 14 pasan a bloques lineales Gated DeltaNet, que mantienen un estado recurrente de tamano fijo y no generan cache KV. El resultado es un modelo de 2,18 mil millones de parametros (28 capas) que conserva gran parte de la precision del modelo base operando con aproximadamente el 7,8 % de su cache KV.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de "upcycling" de transformers a hibridos (Enhanced-ILD seguido de SFT de contexto largo con destilacion del profesor Qwen3-8B) descrita en el paper arXiv:2604.24715. Por otro, es un ejemplo de reduccion de coste de inferencia en contextos largos sin reentrenar desde cero, un problema central para despliegues en produccion con presupuestos de memoria ajustados.

La ventana de contexto entrenada y evaluada es de 8.192 tokens, no la de 40.960 tokens que aparece en el `config.json` heredado del modelo base. Existe un hermano de 64K entrenado con la misma receta para quienes necesiten contextos mayores. El modelo esta pensado para investigacion y su licencia efectiva es de tipo research-only, no Apache 2.0 pese a lo que indica el campo `license` del model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 28 capas (14 MLA + 14 Gated DeltaNet), transformer modificado |
| Parametros totales | 2.182.902.440 (2,18B; el paper reporta 2,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (entrenada y evaluada); max_position_embeddings del config: 40.960, no soportado |
| Tipos de cuantizacion | Pesos en float32 (repositorio de 8,7 GB); se recomienda cargar en bfloat16. Otros formatos de cuantizacion no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | amd-hybrid-models-research-only-rail-ms (research-only); el tag declara ademas apache-2.0 |
| Formato de pesos | safetensors (float32, cargar en bfloat16) |

Dimensiones MLA: `kv_lora_rank` 256, `q_lora_rank` 1344, `qk_rope_head_dim` 64, `qk_nope_head_dim` 64, `v_head_dim` 128, 16 cabezas de atencion. Dimensiones Gated DeltaNet: 6 cabezas (`gdn_num_heads`), dimension de cabeza 256 (`gdn_head_dim`). La distribucion hibrida vive en `hybrid_config.json`; `config.json` es la configuracion del modelo base y se conserva solo como referencia.

## Arquitectura y entrenamiento

La arquitectura no sigue un patron repetitivo capa a capa, sino que asigna tipo por indice. Las capas MLA ocupan las posiciones pares [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26] y las Gated DeltaNet las impares [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27]. La logica es situar la atencion completa donde el modelo base es mas sensible a perderla. Gated DeltaNet es un bloque de atencion lineal con regla delta y compuerta que mantiene un estado recurrente de tamano fijo, por lo que esas capas no contribuyen en absoluto a la cache KV. Las capas MLA si conservan atencion, pero cachean un latente de rango bajo en lugar de claves y valores completos, lo que lleva el total de cache al 7,8 % del modelo base.

El entrenamiento consta de dos etapas. La primera, Enhanced-ILD, es una destilacion capa a capa que alinea los nuevos bloques MLA y lineales con las representaciones internas del modelo base, con contexto de 2.048 tokens, learning rate 2e-4 y el 20 % de la mezcla de SFT. La segunda es un SFT de contexto largo con destilacion guiada por profesor (Qwen3-8B) a 8.192 tokens, learning rate 6e-5 y la mezcla completa. La funcion de perdida es divergencia KL entre las distribuciones del alumno y del profesor (`kl_weight` 1.0, `ce_weight` 0.0), con batch global de 16 secuencias, una epoca, esquema coseno y warmup del 1 %. Se uso precision mixta bfloat16 y 8 GPU AMD Instinct MI300X con FSDP. El paper destaca un kernel fusionado de KL que evita materializar el tensor completo de logits, una innovacion de eficiencia de memoria durante la destilacion. No se aplico interpolacion posicional (`rope_scaling.factor: 1.0`), ya que la ventana RoPE nativa del backbone (32.768 tokens) cubre la longitud entrenada.

Los datos de entrenamiento son variantes procesadas por AMD (subsetting, reformateo a la plantilla de chat y descontaminacion contra los conjuntos de evaluacion) de: `JunxiongWang/sftdatasetv3` (apache-2.0), `nvidia/OpenMathInstruct-2` (cc-by-4.0), `open-thoughts/OpenThoughts-114k` (apache-2.0), `open-r1/OpenR1-Math-220k` (apache-2.0) y `nvidia/ChatQA2-Long-SFT-data` (cc-by-nc-2.0).

## Capacidades

- Generacion de texto conversacional y de proposito general, con plantilla de chat heredada de Qwen3.
- Razonamiento matematico, apoyado en mezclas de SFT especificas de matematicas (OpenMathInstruct-2, OpenR1-Math-220k).
- Razonamiento en multiples pasos y generacion de cadenas de pensamiento, con datos de OpenThoughts-114k.
- Procesamiento de contexto largo hasta 8.192 tokens, con atencion completa (MLA) solo en capas alternas y estado recurrente en el resto.
- Inferencia con cache KV reducida al 7,8 % del modelo base, lo que abarata el servicio en contextos largos.
- Capacidad de responder preguntas sobre documentos largos (ChatQA2-Long-SFT-data en el entrenamiento).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso autonomo: no confirmadas explicitamente; no disponibles.
- Capacidades de vision o audio: no disponibles.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Multilingue: limitado a ingles (idioma declarado: en).

## Casos de uso

- Investigacion sobre arquitecturas hibridas: utilizar el checkpoint como referencia para reproducir o extender la receta de upcycling (Enhanced-ILD + destilacion) sobre otros backbones Qwen, comparando precision frente a coste de cache.
- Estudio de compresion de cache KV: medir en produccion la ganancia de memoria y throughput que aporta el 7,8 % de cache respecto al Qwen3-1.7B original en cargas de contexto largo.
- Servicio de chat en ingles con contexto medio: desplegar respuestas conversacionales multi-turno hasta 8.192 tokens en hardware modesto, aprovechando el reducido footprint de 2,18B parametros.
- Resumen y QA sobre documentos largos en ingles: procesar informes o transcripciones de hasta 8K tokens en una sola pasada, con el ahorro de memoria que permiten las capas sin cache KV.
- Destilacion y fine-tuning posteriores: usar el checkpoint como alumno o como inicializacion para experimentos de ajuste con tecnicas de bajo rango, dado su tamano manejable.
- Evaluacion comparativa de recetas de contexto: comparar este modelo de 8K con su hermano de 64K para caracterizar la degradacion al superar la longitud de entrenamiento (referencia RULER en el paper).
- Prototipado en entornos AMD/ROCm: validar pipelines de inferencia y servir el modelo en la misma familia de hardware (Instinct) que se uso en el entrenamiento.
- Benchmarking de frameworks: comprobar el soporte real de vLLM y otras pilas de inferencia para arquitecturas hibridas MLA + Gated DeltaNet, dado que no es un transformer denso estandar.

## Benchmarks y rendimiento

El `model-index` del model card no incluye resultados (`results: []`). El model card cita que las cifras proceden de la Tabla 4 del paper (arXiv:2604.24715), medidas en regimen 0-shot con EleutherAI lm-evaluation-harness, e incluye una tabla de razonamiento de sentido comun cuya parte numerica no esta incluida en la informacion proporcionada. Por tanto:

No se han publicado resultados de benchmarks numericos en la informacion disponible. Se recomienda consultar directamente la Tabla 4 del paper para los valores de precision, y los resultados RULER para caracterizar el comportamiento mas alla de los 8.192 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 2,18B parametros, sin contar cache de activaciones): float32 ~8,7 GB; bfloat16/fp16 ~4,4 GB; int8 ~2,2 GB; int4 ~1,1 GB. La cache KV es muy reducida (7,8 % de la del modelo base), por lo que el coste de memoria adicional por contexto es bajo.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para precision bfloat16. En el lado AMD, el entrenamiento se realizo con 8x AMD Instinct MI300X (FSDP). En el lado NVIDIA, una RTX 3060 12 GB, RTX 4070/4080 o RTX 4090 son suficientes por memoria.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna con 6 GB o mas, y con cuantizacion de 4 bits en GPUs de gama baja con 4 GB.
- Opciones de despliegue: vLLM aparece mencionado implicitamente en el model card (recomendacion de fijar `--max-model-len 8192`). El soporte de llama.cpp, Ollama, TGI u otras pilas no esta confirmado y depende de que implementen las capas MLA y Gated DeltaNet; no disponible.
- Ajuste importante de despliegue: los motores dimensionan la cache KV usando `max_position_embeddings` del config (40.960), que no es una longitud soportada. Hay que fijar explicitamente la longitud maxima a 8.192.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HyLo-Qwen-14MLA14GDN-8K-SFT | 2,18B | 8.192 tokens | 7,8 % del base | Hibrida (14 MLA + 14 Gated DeltaNet) | research-only (amd-hybrid-models-research-only-rail-ms) | HuggingFace (amd) |
| Qwen/Qwen3-1.7B (modelo base) | 1,7B | 32.768 tokens de ventana RoPE nativa | Atencion completa (100 %) | Transformer denso | Apache 2.0 | HuggingFace (Qwen) |
| Qwen/Qwen3-8B (profesor de destilacion) | 8B | no disponible | no disponible | Transformer denso | no disponible en la informacion | HuggingFace (Qwen) |

No se dispone de datos de rendimiento de alternativas hibridas comparables en la informacion proporcionada; cualquier comparacion cuantitativa de precision exigiria consultar la Tabla 4 del paper.

## Limitaciones y advertencias

- Contexto real limitado a 8.192 tokens: usar el modelo por encima de esa longitud es empujarlo fuera de su regimen de entrenamiento. El `max_position_embeddings` de 40.960 del config es herencia del modelo base y no debe tomarse como soportado.
- Licencia research-only: la licencia efectiva es `amd-hybrid-models-research-only-rail-ms`, con `license_link: LICENSE`, pese a que el campo `license` del model card declare apache-2.0. El uso comercial requiere revisar el fichero de licencia; existe ambiguedad documentada.
- Restriccion de cumplimiento en datos: la mezcla de entrenamiento incluye `nvidia/ChatQA2-Long-SFT-data` bajo licencia cc-by-nc-2.0 (no comercial), lo que condiciona el uso del checkpoint derivado.
- Idioma: solo ingles declarado. No hay soporte multilingue confirmado.
- Riesgo de alucinacion: es un modelo pequeno (2,18B) destilado y ajustado con SFT; cabe esperar una tasa de alucinacion mayor que en modelos de mayor tamano como el profesor Qwen3-8B. No se documentan tasas concretas.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Arquitectura no estandar: al ser un hibrido MLA + Gated DeltaNet, el soporte en frameworks de inferencia no es universal; puede requerir kernels especificos y no funcionar en pilas basadas en transformers densos.
- Precision de pesos: se distribuye en float32 (8,7 GB) y hay que cargarlo en bfloat16; ignorarlo aumenta innecesariamente el uso de memoria.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte de la comunidad muy limitados.
- Rendimiento fuera de los datos declarados: sin benchmarks numericos publicados en la informacion disponible, cualquier afirmacion de calidad debe respaldarse consultando directamente la Tabla 4 del paper.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/HyLo-Qwen-14MLA14GDN-8K-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3-8B
- Paper principal (Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling): https://arxiv.org/abs/2604.24715
- Paper referenciado (arXiv:2505.17272): https://arxiv.org/abs/2505.17272
- Paper referenciado (arXiv:2503.11132): https://arxiv.org/abs/2503.11132
- Dataset JunxiongWang/sftdatasetv3: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset open-thoughts/OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset open-r1/OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset nvidia/ChatQA2-Long-SFT-data: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data
