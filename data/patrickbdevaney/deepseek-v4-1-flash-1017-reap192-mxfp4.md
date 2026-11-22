# patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-MXFP4

## Resumen

DeepSeek-V4.1-Flash-1017-REAP192-MXFP4 es una variante podada del modelo multimodal DeepSeek-V4.1-Flash-1017, publicada por el usuario independiente patrickbdevaney. Se trata de un checkpoint maestro con precision de origen en el que se han conservado 192 de los 384 expertos enrutados de cada una de las 40 capas del decodificador, aplicando la tecnica REAP (expert pruning) sobre una arquitectura MoE con torre de vision. Los pesos de los expertos conservados son copias bit a bit del checkpoint base en MXFP4, sin recuantizacion.

El modelo resuelve el problema de hacer manejable un MoE de gran tamano en hardware limitado: reduce el numero de expertos enrutados a la mitad manteniendo intactas la ruta densa FP8/BF16, la torre de vision de 32 capas y las 3 capas de decodificacion especulativa DSpark/MTP. El repositorio ocupa 151,6 GiB en 46 shards de safetensors, a los que hay que sumar 189,1 GiB de tablas Engram externas que no se incluyen y son obligatorias para cargar el modelo.

Es relevante ahora porque documenta de forma transparente un proceso de podado con puertas de liberacion pre-registradas, incluyendo el hecho de que el checkpoint fallo su puerta original y se publico bajo una enmienda posterior. Su interes es principalmente de investigacion: es el maestro del que derivan las builds GGUF y Thor del mismo autor, y su acuerdo top-1 con el modelo sin podar es de 0,798 sobre 185.565 tokens de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DeepseekV41ForCausalLM` (`model_type: deepseek_v41`), transformer MoE con torre de vision y aligner |
| Parametros totales | No disponible como cifra agregada; 271,8 B en expertos enrutados (40 capas x 192 expertos) |
| Parametros activos | 6 expertos enrutados por token mas 1 experto compartido (por capa) |
| Longitud de contexto | 1.048.576 tokens (`max_position_embeddings`, YaRN x16 sobre 65.536); no evaluado mas alla de 8K |
| Tipos de cuantizacion | MXFP4 (E2M1 con escala E8M0 por bloque de 32) en expertos; FP8 E4M3 con escalas de bloque E8M0 en atencion, compressor, indexer y experto compartido; BF16 en router, embedding y cabeza; F32 en normas e hyper-connections |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors (46 shards, 162.750.843.576 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con 40 capas de decodificador y hidden size 5120. Cada capa contiene 384 expertos enrutados con 6 activos por token mas un experto compartido; esta variante conserva 192 expertos por capa, el mismo recuento en todas ellas. Ademas incorpora 3 capas de decodificacion especulativa DSpark/MTP con 128 expertos cada una, que no se podan, una torre de vision ViT de 32 capas con hidden 1024 mas un aligner, y tablas de embedding n-gram Engram en las capas 1 y 14.

La innovacion tecnica principal es el podado REAP de expertos enrutados: los expertos conservados se copian byte a byte del checkpoint base, de modo que no hay pesos recuantizados en el repositorio. El router (`gate.weight`, `gate.bias`, `gate.bias_vl`) se recorta a los expertos conservados y el conjunto de retencion queda fijado en `reap_keepset.json` (sha256 `1ace9b33...`). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base; esta ficha no puede confirmarlo.

El proceso de liberacion incluye una puerta pre-registrada que el checkpoint no supero: no supero por margen significativo a un conjunto de retencion aleatorio del mismo tamano en la metrica kl32. El autor enmiendo la regla el 2026-10-24, despues de ver el resultado, excluyendo el dominio multilingue, y el checkpoint se publico bajo esa enmienda.

## Capacidades

- Generacion de texto y razonamiento en un modelo MoE de gran escala, con 6 expertos activos por token sobre 192 disponibles por capa.
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`): torre ViT de 32 capas y aligner heredados sin modificar del modelo base.
- Decodificacion especulativa mediante 3 capas DSpark/MTP con 128 expertos cada una, no podadas.
- Memoria n-gram via tablas Engram en las capas 1 y 14 (no incluidas en el repositorio; deben descargarse aparte).
- Soporte de contexto largo declarado de hasta 1.048.576 tokens mediante YaRN x16, aunque no evaluado mas alla de 8K.
- Capacidades multilingues: no disponibles como dato verificado; el dominio multilingue quedo excluido de la puerta de liberacion enmendada.
- Tool calling, function calling y comportamiento agentico: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre podado de expertos en MoE: el repositorio sirve como material de estudio a precision de origen para analizar el efecto de conservar 192 de 384 expertos por capa, con keep-set documentado y metricas de acuerdo top-1 frente al modelo sin podar.
- Derivacion de builds propias: al ser el maestro bit a bit, permite generar cuantizaciones GGUF, Thor u otras variantes sin partir de pesos recuantizados, usando el `reap_keepset.json` como referencia reproducible.
- Evaluacion de decodificacion especulativa: las 3 capas DSpark/MTP intactas permiten estudiar el impacto del podado en el drafter y en la tasa de aceptacion.
- Experimentos multimodales: la torre de vision y el aligner sin tocar hacen viable comparar el rendimiento image-text-to-text del modelo podado frente al base con el mismo frontend visual.
- Analisis de robustez de puertas de liberacion: el historial de la puerta fallida y su enmienda constituye un caso documentado para estudiar practicas de publicacion y sus sesgos.
- Reproducibilidad de evaluacion: el harness `ops/s10_eval.py` y el split de confirmacion de 185.565 tokens permiten replicar la comparacion teacher-forced contra el modelo sin podar.
- Despliegue en un solo dispositivo de 128 GB: no con este repositorio, pero si a traves de las builds derivadas Thor (106,9 GiB) o GGUF (85,6 GiB) del mismo autor.

## Benchmarks y rendimiento

| Metrica | Resultado | Metodo |
|---|---|---|
| Acuerdo top-1 con el modelo sin podar | 0,798 | Teacher-forced, 185.565 tokens, 26 documentos del split de confirmacion |
| Puerta de liberacion original (kl32) | No superada | No supero a un keep-set aleatorio del mismo tamano por margen significativo |
| Puerta enmendada (sin dominio multilingue) | Superada | Enmienda aplicada el 2026-10-24 tras ver el resultado |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Disco: aproximadamente 340 GiB en total, 151,6 GiB del repositorio mas 189,1 GiB de las dos tablas Engram obligatorias descargadas del modelo base.
- VRAM: no disponible; el autor indica explicitamente que el checkpoint no cabe en un dispositivo de 128 GB.
- GPU recomendadas: no disponible. El script de referencia `inference/run.sh` asume un checkpoint convertido con `inference/convert.py` y paralelismo de modelo en 8 vias.
- Consumer GPU: no viable en este formato; para hardware limitado el autor remite a las builds Thor (Jetson AGX Thor de 128 GB) y GGUF (llama.cpp).
- Opciones de despliegue: no se ha ejecutado ningun runtime de serving (Transformers, vLLM, SGLang ni el codigo de referencia) sobre este checkpoint. Las builds derivadas usan un servidor CUDA propio y una rama de llama.cpp (`deepseek-v4.1-reap-thor`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros / expertos | Contexto | Formato y tamano | Licencia | Runtime probado |
|---|---|---|---|---|---|
| REAP192-MXFP4 (este) | 192 de 384 expertos por capa, 6 activos | 1.048.576 (no evaluado >8K) | safetensors, 151,6 GiB + Engram | MIT | No |
| REAP192-Thor | Mismo podado, expertos Q2_K/Q3_K (2,83 bpw) | 1.048.576 | layout `thor-v1`, 106,9 GiB (+3,4 GiB overlay NVFP4) | MIT | Servidor CUDA propio en Jetson AGX Thor 128 GB |
| REAP192-GGUF | Mismo podado, expertos I-quant (2,46 bpw) | 1.048.576 | GGUF L3, 85,6 GiB, con mmproj y drafter DSpark | MIT | Rama `deepseek-v4.1-reap-thor` de llama.cpp |
| DeepSeek-V4.1-Flash-1017 (base) | 384 expertos por capa, 6 activos | 1.048.576 | MXFP4/FP8/BF16, sin podar | MIT | Referencia del autor |

No se dispone de comparacion con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint fallo su puerta de liberacion pre-registrada y se publico bajo una enmienda posterior que excluyo el dominio multilingue; el rendimiento en ese dominio no esta validado.
- Inferencia no probada: ningun runtime de serving ha ejecutado este checkpoint. El tag `library_name: transformers` refleja el formato del modelo base, no una carga verificada.
- Requiere descargar aparte 189,1 GiB de tablas Engram del modelo base; un loader que lea `model.safetensors.index.json` falla hasta que ambos ficheros estan presentes.
- No cabe en dispositivos de 128 GB; el despliegue practico exige las builds derivadas.
- El contexto de 1.048.576 tokens no se ha evaluado mas alla de 8K tokens.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles.
- Licencia MIT heredada del modelo base, sin restricciones comerciales adicionales indicadas; el fichero `LICENSE` se copia sin cambios.
- Al ser un artefacto de investigacion derivado por un tercero, no cuenta con el respaldo del equipo de DeepSeek.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-MXFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build Thor: https://huggingface.co/patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-Thor
- Build GGUF: https://huggingface.co/patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-GGUF
- Servidor CUDA del autor: https://github.com/patrickbdevaney/deepseek-v4.1-flash-cuda-server
- Rama de llama.cpp: https://github.com/patrickbdevaney/llama.cpp/tree/deepseek-v4.1-reap-thor
- Paper referenciado: arxiv:2510.13999
- Paper referenciado: arxiv:2609.18916
