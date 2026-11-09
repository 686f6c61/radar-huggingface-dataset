# armandosds/Olmo-2-1b-kzq

## Resumen

Olmo-2-1b-kzq es un artefacto publicado en Hugging Face por el usuario armandosds que contiene los pesos del modelo base allenai/OLMo-2-0425-1B convertidos al formato propietario `.kzm` del runtime Kaz, junto con perfiles de cuantizacion KZQ. No se trata de un modelo nuevo entrenado, sino de una redistribucion del OLMo-2 1B de AllenAI orientada a evaluar inferencia nativa en CPU x86-64 con SIMD AVX2, sin dependencias de Python, PyTorch ni llama.cpp.

El modelo subyacente, OLMo-2-0425-1B, es un transformer decoder-only de 1.484.965.888 parametros, 16 capas, dimension 2048, 16 cabezas de atencion, activaciones SwiGLU, RMSNorm con normalizacion Q/K y RoPE con theta 500.000. Su vocabulario es de 100.352 tokens. El repositorio ocupa 8,2 GB, coherente con pesos FP32 sharded mas copias cuantizadas.

La relevancia de esta publicacion es experimental: el autor compara paridad numerica y retencion de precision entre KZQ y GGUF sobre el mismo modelo, con intervalos de confianza de Wilson y test de McNemar. Es un banco de pruebas de motores de inferencia mas que una release lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2), 16 capas, dim 2048, 16 cabezas, SwiGLU, RMSNorm con q_norm/k_norm, RoPE theta 500.000 |
| Parametros totales | 1.484.965.888 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | KZQ (familia de bloques alineados a SIMD); referencia GGUF F32, F16, Q4_K_M, Q4_0, Q3_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.kzm` (contenedor binario zero-copy con mmap); safetensors FP32 como origen; GGUF como referencia comparativa |

## Arquitectura y entrenamiento

El modelo base OLMo-2-0425-1B es un transformer decoder-only denso de 16 capas con dimension oculta 2048 e intermediate_size 8192, 16 cabezas de atencion, activacion SwiGLU, RMSNorm con pesos entrenables (post-attention y post-feedforward) y normalizacion adicional sobre queries y keys. Usa RoPE con theta 500.000 y un vocabulario de 100.352 tokens. Los pesos originales se distribuyen en dos shards safetensors en FP32 IEEE-754 con un total de 5.939.687.552 bytes.

Esta publicacion concreta no entrena ni afina el modelo: convierte los pesos oficiales a `.kzm` y genera variantes KZQ para medir retencion de precision frente a sus propias lineas base FP32. El autor documenta que la conversion a GGUF F32 se realizo con un script propio en Python estandar (sin torch), copiando bytes IEEE-754 little-endian directamente, y verifica paridad byte a byte mediante SHA-256 (por ejemplo, `token_embd.weight` con 822.083.584 bytes y hash `d8ee0366...fbbad`). No se dispone de informacion sobre datos de entrenamiento, RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva propia de un modelo base: no es un modelo instruct, por lo que no sigue instrucciones de forma fiable sin ajuste adicional.
- Razonamiento y conocimiento general heredados de OLMo-2 1B; sin datos de benchmarks en esta publicacion.
- Inferencia nativa en CPU x86-64 con SIMD AVX2/FMA a traves del runtime Kaz, sin Python, PyTorch ni C++.
- Carga zero-copy mediante mmap del contenedor `.kzm`.
- Cuantizacion por bloques KZQ disenada para aritmetica SIMD de bajo bitwidth.
- Comparabilidad directa con GGUF (llama.cpp b9562) para auditar paridad de tokens y salidas.
- No se documenta soporte de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Evaluacion de motores de inferencia alternativos: sirve para comparar paridad numerica entre Kaz FP32 y GGUF F32 usando los mismos pesos, lo que permite auditar si un runtime introduce desviaciones en la decodificacion.
- Investigacion sobre cuantizacion de bajo bitwidth: los perfiles KZQ y los GGUF Q4_K_M, Q4_0 y Q3_K_M permiten medir retencion de precision contra linea base FP32 con intervalos de confianza y test de McNemar.
- Despliegue en entornos sin Python ni PyTorch: el runtime Kaz elimina dependencias de libtorch y C++, util en sistemas embebidos o restringidos donde no se puede instalar el stack de ML habitual.
- Benchmarking de throughput en CPU commodity: el autor reporta mediciones con el protocolo `llama-bench` (-p 0 -n 64, 5 repeticiones) sobre AVX2, util para dimensionar hardware sin GPU.
- Reproducibilidad cientifica: los hashes SHA-256 y los tamanos exactos en bytes y MiB permiten verificar artefactos de forma independiente en pipelines de auditoria.
- Base para experimentos de destilacion o fine-tuning posterior: al ser un modelo base Apache 2.0 de 1B, se puede ajustar para tareas concretas una vez validado el runtime de destino.

## Benchmarks y rendimiento

La model card incluye mediciones de throughput de decodificacion en CPU con AVX2 y comparativas de tamano y bitrate entre formatos, pero los valores numericos de tokens por segundo no aparecen en el extracto disponible. Los datos de almacenamiento verificados son:

| Formato | Tamano (bytes) | Tamano (MiB) | Bitrate efectivo (bpw) |
|---|---:|---:|---:|
| Safetensors FP32 (origen) | 5.939.687.552 | 5.664,5 | no calculado en el extracto |
| GGUF F16 | 2.973.650.560 | 2.835,9 | no disponible |
| GGUF Q4_K_M | 935.513.728 | 892,2 | no disponible |
| GGUF Q4_0 | 892.259.968 | 850,9 | no disponible |
| GGUF Q3_K_M | 778.980.992 | 742,9 | no disponible |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: no aplica directamente, el artefacto esta orientado a CPU; como referencia, el modelo base en FP32 requiere aproximadamente 5,9 GB y en Q4_K_M alrededor de 0,9 GB.
- GPU recomendadas: no disponible; el runtime Kaz documentado es x86-64 con AVX2/FMA.
- Cabe en CPU consumer con AVX2; no se documenta soporte de consumer GPU en esta publicacion.
- Opciones de despliegue: runtime Kaz (`.kzm` + KZQ); como alternativa, los GGUF oficiales de allenai/OLMo-2-0425-1B-GGUF con llama.cpp.
- Latencia y throughput: el autor reporta mediciones con `llama-bench` (-p 0 -n 64, 5 repeticiones) en maquina idle, pero los valores concretos no estan en el extracto disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| armandosds/Olmo-2-1b-kzq | 1.484.965.888 | no disponible | Apache 2.0 | `.kzm`, KZQ | Redistribucion experimental para runtime Kaz |
| allenai/OLMo-2-0425-1B | 1.484.965.888 | no disponible | Apache 2.0 | safetensors FP32 | Modelo base original de AllenAI |
| allenai/OLMo-2-0425-1B-GGUF | 1.484.965.888 | no disponible | Apache 2.0 | GGUF F16, Q4_K_M, Q4_0, Q3_K_M | Conversion oficial para llama.cpp |

## Limitaciones y advertencias

- Es un modelo base, no instruct: no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad.
- El runtime Kaz y el formato KZQ son propietarios y poco extendidos; el ecosistema de herramientas es practicamente inexistente frente a GGUF.
- La model card esta centrada en metodologia de evaluacion; faltan datos de contexto, idiomas y benchmarks de calidad.
- Riesgo de alucinacion propio de un modelo de 1B sin ajuste instructivo.
- Sesgos del modelo base no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la madurez del runtime y la ausencia de pruebas de produccion desaconsejan su adopcion directa.
- Los tamanos y hashes publicados deben verificarse de forma independiente antes de usarlos en pipelines de auditoria.

## Enlaces

- Hugging Face: https://huggingface.co/armandosds/Olmo-2-1b-kzq
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B
- GGUF oficial: https://huggingface.co/allenai/OLMo-2-0425-1B-GGUF
