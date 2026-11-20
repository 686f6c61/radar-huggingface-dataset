# quimmedes/Qwen3.8-Flash-Next-MTP-GGUF

## Resumen

El repositorio `quimmedes/Qwen3.8-Flash-Next-MTP-GGUF` no contiene un modelo generativo completo, sino un conjunto de cabezas draft MTP (Multi-Token Prediction) cuantizadas en formato GGUF para su uso en decodificacion especulativa junto al modelo base Qwen/Qwen3.8-Flash-Next. Lo publica el desarrollador quimmedes y esta disenado especificamente para su fork `cafe-llama.cpp`, que incorpora soporte para arquitecturas experimentales con hyper-connections, rotaciones KV tipo QSA con transformada de Hadamard y generacion del grafo de capas MTP.

El modelo base declarado tiene 3.878.549.248 parametros segun los metadatos de safetensors, y el repo ocupa 47,1 GB en total, incluyendo las tres cuantizaciones del draft head (Q2_0, Q3_0 y Q4_0). La relevancia de esta publicacion es practica: permite acelerar la inferencia del modelo base mediante decodificacion especulativa con una tasa de aceptacion declarada del 50-70 % usando `--spec-draft-n-max 2`, algo especialmente util en despliegues locales con llama.cpp donde el cuello de botella es la latencia por token.

La licencia es Apache 2.0 y el modelo esta etiquetado como conversacional y compatible con endpoints, aunque no se especifican los idiomas soportados ni el pipeline en los metadatos de Hugging Face. Es una pieza de infraestructura de inferencia mas que un modelo para uso directo: sin el modelo base y sin el fork de llama.cpp, los ficheros GGUF no son funcionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP draft head (1 capa) para decodificacion especulativa sobre Qwen3.8-Flash-Next; requiere fork cafe-llama.cpp con hyper-connections, QSA Hadamard KV rotation y grafo de capas MTP |
| Parametros totales | 3.878.549.248 (modelo base segun safetensors); el draft head MTP es de 1 capa y su tamano no se detalla |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible para el draft; el ejemplo de uso configura `-c 8192` en llama-server |
| Tipos de cuantizacion | Q2_0 (~1,10 GB), Q3_0 (~1,50 GB), Q4_0 (~2,20 GB, recomendada); re-cuantizadas desde BF16 con llama-quantize (build c2f5366e3) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / cafe-llama.cpp) |

## Arquitectura y entrenamiento

El artefacto es una cabeza MTP de una sola capa pensada para prediccion multi-token en decodificacion especulativa. El modelo base Qwen3.8-Flash-Next emplea, segun la model card, arquitecturas experimentales con hyper-connections, rotaciones KV QSA basadas en transformada de Hadamard y capas MTP integradas; el fork `cafe-llama.cpp` implementa los estados ocultos de hyper-connection, la rotacion KV y la generacion del grafo de capas MTP necesarios para ejecutarlas. Las cuantizaciones publicadas se regeneraron desde BF16 con `llama-quantize` tras detectarse que los ficheros previos (Q4_K_M, Q6_K, Q8_0 y BF16) provenian de una conversion defectuosa y no funcionaban con decodificacion especulativa.

No se dispone de informacion sobre el dataset de entrenamiento del draft head, el numero de tokens utilizados, la composicion de los datos ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones de entrenamiento adicionales mas alla del propio mecanismo MTP y del soporte de hyper-connections en el motor de inferencia.

## Capacidades

- Decodificacion especulativa: actua como modelo draft para predecir varios tokens por paso, validados posteriormente por el modelo base.
- Integracion con llama.cpp mediante el flag `--spec-type draft-mtp` y el parametro `-md` para apuntar al fichero GGUF del draft.
- Tasa de aceptacion declarada de aproximadamente 50-70 % con `--spec-draft-n-max 2`, valor presentado como optimo para una cabeza MTP de una capa.
- Soporte de los backends CUDA, Vulkan, ROCm/HIP, Apple Metal y CPU (AVX2/AVX-512) a traves de la compilacion de cafe-llama.cpp.
- Compatibilidad con llama-server y llama-cli, incluyendo opciones de offload completo (`-ngl 999`), `-hmoe`, flash attention (`-fa on`) y cuantizacion de cache KV (`-ctk q8_0 -ctv q8_0`).
- No realiza generacion de texto, razonamiento, codigo ni tool calling por si mismo: esas capacidades corresponden al modelo base Qwen3.8-Flash-Next.

## Casos de uso

- Aceleracion de inferencia local: desplegar Qwen3.8-Flash-Next en una estacion de trabajo con llama-server y cargar el draft Q4_0 para reducir la latencia por token gracias a la validacion especulativa de 2 tokens por paso.
- Servicio conversacional de baja latencia: usar la configuracion `--spec-type draft-mtp` con contexto de 8192 tokens en un endpoint compatible para reducir el tiempo hasta el primer token percibido en chat multi-turno.
- Prototipado en hardware de consumo: compilar cafe-llama.cpp con backend Vulkan o Metal y ejecutar el par base + draft en GPUs AMD, Intel o Apple Silicon donde no hay soporte de CUDA.
- Evaluacion de tecnicas de decodificacion especulativa: comparar tasas de aceptacion y throughput entre Q2_0, Q3_0 y Q4_0 del draft head manteniendo fijo el modelo base y la configuracion de cache KV.
- Investigacion sobre arquitecturas con hyper-connections: reproducir el pipeline completo (QSA Hadamard KV rotation, capas MTP) en un entorno controlado para medir el impacto del draft head en la calidad de salida.
- Despliegue en CPU con AVX-512: usar la build sin CUDA ni Vulkan junto con cuantizaciones agresivas del modelo base (por ejemplo UD-IQ3_XXS) y el draft Q2_0 para entornos sin GPU dedicada.
- Integracion en pipelines de generacion por lotes: reducir el coste computacional por token en tareas de resumen o extraccion sobre documentos largos donde el modelo base ya esta desplegado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado es la tasa de aceptacion del draft head, de aproximadamente 50-70 % con `--spec-draft-n-max 2`.

## Requisitos de hardware

- VRAM del draft head: aproximadamente 1,10 GB (Q2_0), 1,50 GB (Q3_0) y 2,20 GB (Q4_0), adicionales a la memoria requerida por el modelo base.
- VRAM total: depende de la cuantizacion del modelo base; el repo completo ocupa 47,1 GB, por lo que un despliegue con cuantizaciones bajas del base mas el draft Q4_0 requiere planificacion de memoria en torno a decenas de GB.
- GPUs recomendadas: no especificadas por el autor; los backends soportados cubren NVIDIA (CUDA), AMD (ROCm/HIP, Vulkan), Intel (Vulkan) y Apple (Metal).
- GPU de consumo: el draft head por si solo cabe en cualquier GPU consumer con mas de 2,5 GB libres; la viabilidad del conjunto depende del modelo base.
- Opciones de despliegue: exclusivamente cafe-llama.cpp (fork de llama.cpp) mediante llama-server o llama-cli; no se declara compatibilidad con vLLM, TGI, Ollama ni llama.cpp upstream.
- Latencia y throughput: no disponibles; la mejora dependera de la tasa de aceptacion efectiva y del ancho de banda de memoria del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Motor | Notas |
|---|---|---|---|---|---|---|
| quimmedes/Qwen3.8-Flash-Next-MTP-GGUF | Draft head MTP GGUF | 3.878.549.248 (base) | no disponible | Apache 2.0 | cafe-llama.cpp | Requiere fork especifico; tasa de aceptacion 50-70 % |
| Qwen/Qwen3.8-Flash-Next | Modelo base | 3.878.549.248 | no disponible | no disponible | Multiples | Sin datos de benchmarks en la informacion disponible |
| Otros draft heads GGUF para decodificacion especulativa | Draft head | no disponible | no disponible | no disponible | llama.cpp upstream | No se dispone de datos comparativos verificables |

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo base Qwen3.8-Flash-Next y sin el fork cafe-llama.cpp no produce salida util.
- Dependencia de un fork no oficial de llama.cpp, lo que implica riesgo de mantenimiento, divergencia con upstream y menor soporte comunitario.
- Los ficheros Q4_K_M, Q6_K, Q8_0 y BF16 fueron retirados por proceder de una conversion defectuosa; conviene verificar la build c2f5366e3 o posterior antes de desplegar.
- La tasa de aceptacion del 50-70 % es una cifra declarada por el autor sin benchmark publico que la respalde.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones linguisticas del conjunto; estas dependen integramente del modelo base.
- El rendimiento en produccion puede degradarse si el modelo base usa cuantizaciones muy agresivas o si la cache KV se configura con precision reducida.
- Aunque la licencia del repositorio es Apache 2.0, deben revisarse las condiciones del modelo base antes de un uso comercial.
- No hay informacion sobre idiomas soportados ni sobre el pipeline declarado en Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/quimmedes/Qwen3.8-Flash-Next-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fork del motor de inferencia: https://github.com/quimmedes/cafe-llama.cpp
