# halt95/Qwen3.8-Flash-Next-PLE-INT6-Merlin

## Resumen

Qwen3.8-Flash-Next-PLE-INT6-Merlin es un paquete de cuantizacion INT6 de la tabla de embeddings n-gram por capa (PLE, *per-layer embedding*) del modelo Qwen3.8-Flash-Next, publicado por el usuario halt95 para su motor de inferencia Merlin. No es un checkpoint completo: contiene unicamente los pesos de la tabla n-gram (128 shards de 2.500.012 × 160, 51.000 millones de parametros) cuantizados a 6 bits simetricos en grupos de 32, y se superpone sobre un checkpoint W4A16 de Flash-Next o Swift1.5 que el usuario ya tenga. El resto de componentes (expertos, atencion, cabeza MTP, vision, tokenizer y escalas KV) se toma sin cambios del checkpoint FP8 original.

La relevancia practica del paquete es de infraestructura: la tabla PLE se mantiene en RAM de host y en FP8 ocupa 47,68 GiB, mientras que en INT6 ocupa 38,74 GiB, lo que supone unos 8,94 GiB menos por servidor. Segun las mediciones del autor, la divergencia KL respecto a FP8 es de 0,0031–0,0033 en Flash-Next y 0,0028 en Swift1.5, con una coincidencia de tokens en decodificacion greedy del 98,4–98,8 %. Esto permite desplegar el modelo en configuraciones de 4× RTX 3090 manteniendo un comportamiento muy cercano al de la tabla FP8.

El modelo base, Qwen3.8-Flash-Next, es un modelo de la familia Qwen con capacidades de contexto largo (se verifica *needle* a 262K en las pruebas del autor), cabeza MTP para decodificacion especulativa y soporte de vision. La licencia del paquete es la Qwen Community License 1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla de embeddings n-gram por capa (PLE) del modelo Qwen3.8-Flash-Next; el paquete no incluye el transformer completo |
| Parametros totales | 51.000 millones (solo la tabla PLE: 128 shards × 2.500.012 × 160) |
| Parametros activos | no disponible |
| Longitud de contexto | 262K verificados en prueba *needle* (heredada del modelo base) |
| Tipos de cuantizacion | INT6 simetrico, grupos de 32, una escala FP16 por grupo (absmax/31); cuatro codigos en tres bytes, 130 bytes por fila |
| Idiomas soportados | en (segun la model card) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (8 shards `model-pleint6-0000N-of-00008.safetensors`), mas `ple-int6-pack.json` y `ple-int6-pack.sha256` |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo: es una conversion determinista de la tabla PLE en BF16 del checkpoint Qwen/Qwen3.8-Flash-Next (revision `de4b8e4d43b917e7706784d8bb445c9af86a3540`) a INT6, realizada con el script `models/flash-next/make-ple-int6-pack.py --from-bf16` del motor Merlin. La cuantizacion es simetrica por grupos de 32 elementos con una escala FP16 por grupo calculada como absmax/31; cada fila de 160 elementos ocupa 130 bytes (cuatro codigos empaquetados en tres bytes). El resultado son ocho shards safetensors que suman 41.600.199.680 bytes (38,74 GiB).

La tabla PLE es un componente especifico de Flash-Next que actua como memoria de embeddings n-gram por capa, mantenida en RAM de host y consultada por el motor durante la inferencia. El resto de la arquitectura (expertos, atencion, cabeza MTP para decodificacion especulativa, torre de vision, tokenizer y escalas KV) permanece en el checkpoint W4A16 sobre el que se superpone el paquete. Merlin construye un directorio `<checkpoint>-int6` junto al checkpoint original mediante enlaces mas un config e index generados, de modo que los ficheros FP8 originales no se modifican y la opcion `--ple fp8` sigue funcionando.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3.8-Flash-Next (no modificados por este paquete).
- Contexto largo: verificacion *needle* a 262K tokens superada con la tabla INT6.
- Decodificacion especulativa mediante cabeza MTP; la aceptacion de borradores MTP mejora +0,095 respecto a FP8 en Flash-Next.
- Capacidades de vision heredadas del checkpoint base (la torre de vision no forma parte de este paquete).
- Soporte multilingue limitado al ingles segun la model card (`language: en`).
- No se documentan en la informacion disponible capacidades de tool calling, function calling ni agentes para este paquete concreto; dependen del modelo base.

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next en servidores con 4× RTX 3090: el paquete reduce la RAM de host necesaria para la tabla PLE de 47,68 GiB a 38,74 GiB, lo que permite ajustar el modelo en maquinas de 4 GPUs Ampere con menos memoria de sistema.
- Ahorro de RAM en flotas de inference: con unos 8,94 GiB menos por servidor, se puede aumentar el pool de KV o el numero de sesiones concurrentes sin cambiar de hardware.
- Inferencia de contexto largo (hasta 262K tokens): la tabla INT6 mantiene la recuperacion de informacion en pruebas *needle*, adecuada para analisis de documentos extensos y resumen de repositorios.
- Decodificacion especulativa en produccion: la mejora de aceptacion MTP (+0,095 frente a FP8 en Flash-Next) hace que el paquete sea adecuado para servir con la cabeza MTP activa y reducir latencia por token.
- Evaluacion comparativa de cuantizaciones: util para equipos que quieran medir el impacto de INT6 frente a FP8 en su propio trafico antes de adoptarlo.
- Sustitucion no destructiva en pipelines existentes: al no modificar los ficheros FP8 y construir un directorio `<checkpoint>-int6` aparte, se puede alternar entre `--ple int6` y `--ple fp8` sin reinstalar pesos.
- Validacion de integridad: los ficheros `ple-int6-pack.sha256` permiten verificar la descarga en entornos de produccion.

## Benchmarks y rendimiento

| Metrica | Flash-Next | Swift1.5 |
|---|---|---|
| Divergencia KL respecto a FP8 (teacher-forced, top-20) | 0,0031–0,0033 | 0,0028 |
| Coincidencia de tokens greedy con FP8 | 98,4–98,8 % | 98,7 % |
| GSM8K, 64 preguntas | dentro de 1 de FP8 | igual a FP8 |
| Aceptacion de borradores MTP | +0,095 frente a FP8 | −0,03 frente a FP8 |
| Needle a 262K | encontrado | encontrado |

Mediciones del autor con Merlin 3.0.1 sobre 4× RTX 3090 el 2026-11-01 (Flash-Next: dos ejecuciones; Swift1.5: una). Como control, negar todos los codigos produce una KL de 5,46, lo que confirma que la prueba detecta una tabla danada. Son mediciones propias del autor, no una evaluacion independiente. Swift1.5-Huihui no supero la prueba: su aceptacion MTP cayo 0,15–0,17 por debajo de FP8 frente al umbral de 0,10, por lo que Merlin rechaza `--ple int6` para ese checkpoint.

## Requisitos de hardware

- RAM de host: 38,74 GiB para la tabla PLE INT6 (frente a 47,68 GiB en FP8); el checkpoint W4A16 subyacente anade sus propios requisitos.
- GPUs probadas por el autor: 4× RTX 3090 (Ampere, sm86).
- Cabe en GPU de consumo: si, en configuracion multi-GPU de 4× RTX 3090 segun las pruebas del autor; no se documenta una configuracion de una sola GPU.
- Motor de despliegue: exclusivamente Merlin 3.0.1 o posterior con la opcion `--ple int6`; no se mencionan vLLM, llama.cpp, Ollama ni TGI como compatibles, pese a que la libreria declarada sea `vllm`.
- Latencia y throughput: no disponibles; solo se reporta la mejora relativa de aceptacion MTP (+0,095 en Flash-Next).
- El paquete solo cambia la RAM de host; el pool de KV y las sesiones concurrentes dependen del checkpoint base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-PLE-INT6-Merlin (este paquete) | 51B en tabla PLE INT6 | 262K (heredado) | safetensors INT6 | qwen-community-1.0 | HuggingFace, 0 descargas |
| Qwen3.8-Flash-Next (base, tabla PLE BF16/FP8) | 51B en tabla PLE | 262K | safetensors BF16/FP8 | qwen-community-1.0 | HuggingFace (Qwen) |
| Qwen3.8-Flash-Next-W4A16-Merlin | no disponible | 262K (heredado) | safetensors W4A16 | qwen-community-1.0 | HuggingFace (halt95) |
| Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin | no disponible | 262K (heredado) | safetensors W4A16 | qwen-community-1.0 | HuggingFace (halt95) |

No se dispone de datos de benchmarks publicos del modelo base Qwen3.8-Flash-Next en la informacion proporcionada, por lo que la comparativa se limita a formato, tamano de tabla y requisitos de RAM.

## Limitaciones y advertencias

- No es un checkpoint autonomo: requiere un checkpoint W4A16 de Flash-Next o Swift1.5 y el motor Merlin 3.0.1 o posterior; no funciona con vLLM estandar ni con llama.cpp.
- Solo modifica la tabla PLE; cualquier limitacion del modelo base (sesgos, alucinacion, calidad en dominios concretos) se mantiene intacta.
- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano no esta documentado.
- Licencia Qwen Community License 1.0: es necesario revisar sus terminos para uso comercial, ya que no es una licencia permisiva tipo Apache 2.0.
- Las metricas de calidad (KL, coincidencia greedy, GSM8K) son mediciones del propio autor en su hardware, no una evaluacion independiente; la muestra de GSM8K es de solo 64 preguntas.
- Swift1.5-Huihui no es compatible: Merlin rechaza `--ple int6` porque la aceptacion MTP cae por debajo del umbral; debe servirse con `--ple fp8`.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgos: no documentados especificamente para este paquete; deben evaluarse sobre el modelo base.

## Enlaces

- HuggingFace del paquete: https://huggingface.co/halt95/Qwen3.8-Flash-Next-PLE-INT6-Merlin
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint W4A16 compatible: https://huggingface.co/halt95/Qwen3.8-Flash-Next-W4A16-Merlin
- Checkpoint Swift1.5 compatible: https://huggingface.co/halt95/Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin
- Checkpoint Swift1.5-Huihui (no compatible con `--ple int6`): https://huggingface.co/halt95/Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-Merlin
- Motor Merlin: https://github.com/halt95/merlin-engine
- Changelog de Merlin: https://github.com/halt95/merlin-engine/blob/main/docs/CHANGELOG.md
- Licencia: https://huggingface.co/halt95/Qwen3.8-Flash-Next-PLE-INT6-Merlin/blob/main/LICENSE
