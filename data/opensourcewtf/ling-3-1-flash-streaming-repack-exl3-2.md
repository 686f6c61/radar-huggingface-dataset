# OpensourceWTF/Ling-3.1-Flash-streaming-repack-exl3

## Resumen

Ling-3.1-Flash-streaming-repack-exl3 es un empaquetado de inferencia para Apple Silicon del modelo Ling-3.1-flash de inclusionAI, un transformer de mezcla de expertos (MoE) de 560.000 millones de parametros totales y 25.000 millones activos por token. El trabajo lo firma OpensourceWTF (David Tai), que no ha recuantizado nada: parte de las cuantizaciones EXL3 de turboderp y reorganiza los pesos para que el servidor mlx-serve pueda leer los expertos enrutados desde el SSD de un Mac. Cada tasa de bits vive en una rama independiente del repositorio, con dos opciones: 2.60 bpw (188,3 GB) y 2.10 bpw (153,5 GB).

El problema que resuelve es de capacidad de memoria. El modelo completo no cabe en la memoria unificada de un Mac de 128 GB, de modo que el servidor mantiene en memoria el tronco (atencion, expertos compartidos, capas densas y cabeza de salida) y una parte de los expertos enrutados, mientras lee del disco los expertos restantes cuando un token los necesita. La innovacion esta en el formato del pack: los expertos de las capas 4 a 71 se extraen de los shards safetensors a un fichero `experts.bin` con registros de tamano fijo y manifiestos con offset, tamano y sha256.

La relevancia es acotada pero concreta: permite ejecutar un MoE de 560B en hardware de consumo Apple con cuantizacion de 2 a 2,6 bits por peso, a costa de latencias de decodificacion bajas (3,4 a 3,7 tok/s en prompts muy largos) y tiempos de prefill muy elevados. Es material para experimentacion en local, no para produccion con requisitos de latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (bailing_hybrid) con 72 capas principales (0-71) mas una capa MTP (72); capas 0-3 densas |
| Parametros totales | 560.000 millones (segun la model card de inclusionAI) |
| Parametros activos | 25.000 millones por token (8 de 512 expertos enrutados por capa en las capas 4-71) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3: 2.60 bpw (expertos K2.5, tronco K6, K4 en MLPs densas de capas 0-3 y `eh_proj` del MTP) y 2.10 bpw (expertos K2, resto igual) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `experts.bin` (registros binarios de expertos enrutados), safetensors (`mtp-nonbank.safetensors` y shards `-nonexpert`), manifiestos de expertos; libreria mlx-serve |
| Tamano del repositorio | 341,7 GB (suma de ramas; rama 2.60bpw: 188,3 GB; rama 2.10bpw: 153,5 GB) |
| Modelo base | turboderp/Ling-3.1-flash-exl3 (cuantizacion de inclusionAI/Ling-3.1-flash) |

## Arquitectura y entrenamiento

Ling-3.1-flash es un modelo de mezcla de expertos con 72 capas principales y una capa adicional de prediccion multi-token (MTP). Las cuatro primeras capas son densas; de la 4 a la 71 cada capa contiene 512 expertos enrutados, pequenas redes feed-forward, de los cuales un router selecciona 8 por token, lo que da los 25.000 millones de parametros activos sobre un total de 560.000 millones. La capa MTP actua como borrador de tokens que el modelo principal verifica, una forma de decodificacion especulativa integrada en la arquitectura.

El pack no modifica los pesos de turboderp: conserva sus nombres, dtypes y bytes. Lo que cambia es la organizacion. Los expertos enrutados de las capas 4-71 se extraen a `experts.bin` como 34.816 registros (68 capas x 512 expertos), cada uno con las proyecciones gate, up y down del experto, rellenado con ceros hasta un multiplo de 4.096 bytes. En la rama 2.10bpw cada registro ocupa 3.964.928 bytes, frente a 4.947.968 bytes en la 2.60bpw. La capa MTP, con sus expertos, va a `mtp-nonbank.safetensors`, y el resto de tensores (tronco) permanece en los shards `-nonexpert`. Los manifiestos de expertos registran offset, tamano y sha256 de cada registro.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original en la documentacion proporcionada.

## Capacidades

- Generacion de texto autorregresiva con pipeline `text-generation`.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Ling-3.1-flash, no documentadas en detalle en la informacion disponible.
- Prediccion multi-token mediante la capa MTP, que genera borradores de tokens para verificacion del modelo principal.
- Ejecucion en Apple Silicon con lectura de expertos desde SSD, lo que permite servir un modelo mayor que la memoria unificada del equipo.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Experimentacion local con MoE de gran escala en Apple Silicon: un Mac con 128 GB de memoria unificada puede cargar el tronco y parte de los expertos, leyendo el resto desde el SSD. Adecuado para investigadores que quieran estudiar el comportamiento de un MoE de 560B sin acceso a clústeres de GPU.
- Evaluacion de decodificacion especulativa con MTP: la capa 72 permite medir la tasa de aceptacion de tokens borrador frente al modelo principal en distintas distribuciones de prompt.
- Pruebas de rendimiento de almacenamiento: el formato de registros de tamano fijo con manifiestos sha256 permite medir throughput de lectura aleatoria desde SSD NVMe y su impacto en la latencia de decodificacion.
- Comparacion de tasas de bits: las ramas 2.10bpw y 2.60bpw permiten estudiar el compromiso entre calidad (divergencia KL publicada por turboderp) y velocidad (16,30 frente a 12,90 tok/s de decodificacion a 18.706 tokens de prompt).
- Desarrollo de plugins para mlx-serve: el plugin `turboexl3_ling` sirve como referencia para implementar cargadores de cuantizaciones EXL3 con streaming de expertos.
- Generacion de texto por lotes sin requisitos de latencia: con decodificacion de 3,4 a 3,7 tok/s en prompts largos, resulta viable para tareas asincronas donde el tiempo total no es critico.

## Benchmarks y rendimiento

La model card incluye mediciones de rendimiento de inferencia (greedy) con mlx-serve, no de calidad:

| Rama | Tokens de prompt | Prefill (tok/s) | Decodificacion (tok/s) | TTFT |
|---|---:|---:|---:|---:|
| 2.60bpw | 139.264 | 49,7 | 3,40 | 2.801 s (47 min) |
| 2.10bpw | 143.360 | 58,0 | 3,70 | 2.471 s (41 min) |

A 18.706 tokens de prompt, la decodificacion greedy fue de 16,30 tok/s para 2.10bpw y 12,90 tok/s para 2.60bpw. La rama 2.10bpw mostro prefill y decodificacion superiores en todos los tamanos de prompt del barrido. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible; la model card remite al grafico de divergencia KL de turboderp para comparar la calidad de sus cuantizaciones.

## Requisitos de hardware

- Memoria: el pack supera la memoria de un Mac de 128 GB; el servidor mantiene el tronco y parte de los expertos en memoria y lee el resto del SSD.
- Almacenamiento: se requiere SSD NVMe con espacio para la rama elegida (188,3 GB para 2.60bpw, 153,5 GB para 2.10bpw) y latencia de lectura aleatoria baja, ya que cada token puede desencadenar lecturas de expertos.
- GPU: disenado para Apple Silicon con memoria unificada; no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no aplica en el sentido habitual; el requisito es un Mac con memoria unificada suficiente y SSD rapido.
- Despliegue: mlx-serve `main` en el commit `a5e30916` o posterior, con el modelo integrado `bailing_hybrid`; el plugin de cuantizacion `turboexl3_ling` esta en una pull request abierta (CommunityServe/plugins#53) y requiere una release de plugin-kit que incluya #1229.
- Latencia y throughput: prefill de 49,7 a 58,0 tok/s y decodificacion de 3,40 a 3,70 tok/s en prompts de aproximadamente 140.000 tokens; TTFT de 41 a 47 minutos en ese regimen.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato y despliegue |
|---|---|---|---|---|---|
| Ling-3.1-Flash-streaming-repack-exl3 (este) | 560B | 25B | no disponible | MIT | EXL3 repack para mlx-serve, streaming desde SSD |
| turboderp/Ling-3.1-flash-exl3 | 560B | 25B | no disponible | MIT (heredada) | EXL3 para exllamav3, rama por tasa de bits |
| inclusionAI/Ling-3.1-flash | 560B | 25B | no disponible | no disponible | Pesos originales |

No se dispone de datos de rendimiento de calidad comparables entre estas variantes en la informacion proporcionada; la unica comparacion publicada es el grafico de divergencia KL de turboderp, referenciado pero no reproducido en la model card.

## Limitaciones y advertencias

- La calidad de las cuantizaciones a 2,10 y 2,60 bits por peso no ha sido medida a traves de mlx-serve; la unica referencia es la divergencia KL de turboderp sobre exllamav3.
- Latencias muy altas en prompts largos: TTFT de 41 a 47 minutos y decodificacion por debajo de 4 tok/s a ~140.000 tokens, lo que descarta uso interactivo en esos regimenes.
- Dependencia de un commit concreto de mlx-serve (`a5e30916` o posterior) y de un plugin aun en pull request; la API y el formato pueden cambiar.
- El rendimiento depende criticamente de la velocidad del SSD; lecturas aleatorias lentas degradan la decodificacion de forma directa.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto del modelo base en la documentacion proporcionada.
- Licencia MIT, lo que permite uso comercial, pero conviene verificar la licencia del modelo original de inclusionAI antes de desplegar en produccion.
- El repositorio tiene 6 descargas y ningun like en el momento de la consulta; el soporte de la comunidad es minimo.
- No se ha verificado el uso de `trust_remote_code` ni la integridad de los pesos mas alla de los sha256 de los manifiestos de expertos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpensourceWTF/Ling-3.1-Flash-streaming-repack-exl3
- Rama 2.60bpw: https://huggingface.co/OpensourceWTF/Ling-3.1-Flash-streaming-repack-exl3/tree/2.60bpw
- Rama 2.10bpw: https://huggingface.co/OpensourceWTF/Ling-3.1-Flash-streaming-repack-exl3/tree/2.10bpw
- Cuantizaciones de turboderp: https://huggingface.co/turboderp/Ling-3.1-flash-exl3
- Modelo original: https://huggingface.co/inclusionAI/Ling-3.1-flash
- mlx-serve: https://github.com/ddalcu/mlx-serve
- Pull request mlx-serve #1229: https://github.com/ddalcu/mlx-serve/pull/1229
- Pull request del plugin: https://github.com/CommunityServe/plugins/pull/53
- exllamav3: https://github.com/turboderp-org/exllamav3
- Conversores de packs: https://github.com/OpenSourceWTF/mlx-serve-streaming-pack-converters/tree/main/ling31
