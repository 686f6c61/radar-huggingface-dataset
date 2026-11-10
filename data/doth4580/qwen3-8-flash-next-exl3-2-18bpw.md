# doth4580/Qwen3.8-Flash-Next-EXL3-2.18bpw

## Resumen

Qwen3.8-Flash-Next-EXL3-2.18bpw es un empaquetado de pesos cuantizados del modelo Qwen/Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen. La cuantizacion la realizo turboderp con exllamav3 en la rama `2.18bpw_h6_ng8`, y doth4580 la redistribuye de forma byte-identica como espejo estable para probar el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10. No se trata, por tanto, de un modelo nuevo, sino de una version comprimida a 2,18 bits por peso del modelo base.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 19.331.931.648 parametros totales segun los safetensors del repositorio. El pack ocupa 90,7 GB en disco y esta pensado para ejecutarse con ExLlamaV3, con soporte especifico para decodificacion especulativa mediante cabezas MTP (multi-token prediction). El contexto maximo configurado en los comandos de referencia es de 262.144 tokens.

Su relevancia actual es practica: demuestra que un MoE de ~19.300 millones de parametros puede servirse con una ventana de 256K tokens en una o varias maquinas GB10 de gama workstation, con velocidades de decodificacion medidas entre 63 y 188 tokens por segundo segun topologia y tipo de turno. Es un artefacto orientado a despliegue en el borde y en clusters pequenos, no a entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), formato EXL3 / ExLlamaV3 |
| Parametros totales | 19.331.931.648 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en los comandos de referencia) |
| Tipos de cuantizacion | EXL3 2,18 bpw (rama `2.18bpw_h6_ng8`, grupo h6 / ng8) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con capas de mezcla de expertos, segun indica la etiqueta `moe` del repositorio y el tag `qwen4_exp`. La informacion disponible no detalla el numero de expertos, el ratio de activacion ni la composicion del dataset de entrenamiento, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifica el numero de tokens de entrenamiento.

La innovacion tecnica documentada en este pack es la cuantizacion EXL3 a 2,18 bits por peso realizada con exllamav3, que reduce el modelo a 90,7 GB manteniendo el formato legible por ExLlamaV3 y por el motor veloGB10. El pack incluye una cabeza MTP propia para decodificacion especulativa, y se documentan dos cabezas alternativas (HermiHg y DotH-MTP) que sustituyen a la original solo para acelerar la generacion, sin alterar la salida. El servidor expone una API compatible con OpenAI y soporta cache de prefijos (`--prefix-cache`) y ejecucion multi-nodo con tensor parallelism (TP=1, 2 o 4) sobre GB10, transfiriendo cada nodo unicamente su particion de pesos por red RDMA/RoCE.

## Capacidades

- Generacion de texto autoregresiva con modo de razonamiento activado por defecto en las pruebas del autor (thinking on).
- Razonamiento multi-turno con ventana de contexto larga (hasta 262.144 tokens configurados).
- Generacion de codigo, evidenciada por los turnos de codigo medidos en VeloBench (hasta 188 tok/s en TP=4).
- Decodificacion especulativa mediante cabeza MTP, con tasas de aceptacion del borrador entre el 68,5 % y el 72,7 %.
- Servicio mediante API compatible con OpenAI (`/v1`), lo que habilita integracion con clientes y SDK estandar.
- Cache de prefijos para reutilizar contexto en conversaciones y prompts repetidos.
- Despliegue multi-nodo con tensor parallelism sobre 1, 2 o 4 maquinas GB10.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat con contexto largo en una sola GB10: con `--max-seq-len 262144` y `--max-batch 2`, el pack permite mantener conversaciones de hasta 256K tokens en una unica maquina, adecuado para analisis de documentos extensos o historiales largos sin truncar.
- Asistencia de codigo en estaciones de trabajo: los turnos de codigo alcanzan 123 tok/s en TP=1 y 188 tok/s en TP=4, lo que hace viable un asistente de programacion interactivo sobre hardware GB10 en lugar de GPUs de centro de datos.
- Despliegue en cluster pequeno con TP=4: agregando cuatro GB10 se obtiene un throughput agregado de 160-186 tok/s con dos peticiones concurrentes y prefill de hasta 3.828 tok/s, util para equipos de desarrollo que comparten un endpoint interno.
- Procesamiento por lotes de documentos largos: la cache de prefijos y el prefill de 2.062-3.828 tok/s permiten reutilizar contexto comun entre peticiones y procesar corpus extensos con coste de prefill reducido.
- Evaluacion y benchmarking de motores de inferencia: al ser un espejo byte-identico con instrucciones y resultados publicados, sirve como referencia reproducible para comparar veloGB10, ExLlamaV3 u otros motores que lean EXL3.
- Prototipado de agentes multi-turno: el modo thinking y la ventana de 256K permiten cadenas de razonamiento largas con historial completo, aunque el soporte explicito de tool calling no esta documentado.
- Inferencia en el borde con requisitos de memoria ajustados: la cuantizacion a 2,18 bpw reduce el modelo a 90,7 GB, lo que permite cargarlo en un unico nodo GB10 con `--max-batch 2`.

## Benchmarks y rendimiento

Los datos publicados por el autor son mediciones de velocidad de inferencia (VeloBench) sobre GB10 con veloGB10 0.7.7, no benchmarks de calidad (MMLU, HumanEval, GSM8K). Se reproducen a continuacion. La decodificacion esta en tokens de salida por segundo e incluye decodificacion especulativa; el prefill en tokens por segundo; una ejecucion por celda con variacion aproximada de +-10 %.

| Topologia | Fuente del borrador | Decode turno de codigo | Decode turno de relato | Mediana decode todos los turnos | Prefill (tok/s) | 2 peticiones, agregado | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP del pack | 123 | 63 | 81 | 2.062 | 108 | 68,5 % |
| TP=2 | Cabeza MTP del pack | 157 | 83 | 99 | 3.261 | 149 | 69,7 % |
| TP=4 | Cabeza MTP del pack | 188 | 105 | 126 | 3.753 | 160 | 69,9 % |
| TP=1 | Cabeza MTP HermiHg | 126 | 62 | 80 | 2.054 | 125 | 72,1 % |
| TP=2 | Cabeza MTP HermiHg | 161 | 85 | 105 | 3.281 | 157 | 72,7 % |
| TP=4 | Cabeza MTP HermiHg | 189 | 103 | 131 | 3.828 | 178 | 71,0 % |
| TP=1 | Cabeza DotH-MTP | 126 | 65 | 79 | 2.034 | 107 | 70,1 % |
| TP=2 | Cabeza DotH-MTP | 152 | 85 | 101 | 3.256 | 144 | 69,7 % |
| TP=4 | Cabeza DotH-MTP | 188 | 105 | 129 | 3.775 | 186 | 70,1 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada: el pack ocupa 90,7 GB en disco; con la cuantizacion EXL3 a 2,18 bpw, la carga requiere aproximadamente esa cantidad de memoria unificada del nodo, mas overhead de contexto y cache KV para 262.144 tokens.
- Hardware objetivo: NVIDIA DGX Spark / GB10 (memoria unificada). El autor lo prueba en 1, 2 y 4 maquinas.
- Cabe en GPU de consumo: no disponible; no se documenta su ejecucion en RTX 4090 u otras GPUs consumer.
- Despliegue: motor veloGB10 (`gb10_inference`), con servidor compatible OpenAI en el puerto 9000. Tambien puede cargarse en cualquier framework que lea EXL3 / ExLlamaV3.
- Multi-nodo: TP=2 y TP=4 con nodos que no necesitan copia local del modelo; transferencia de pesos por red con soporte RDMA/RoCE (`--rdma-dev`).
- Throughput y latencia: decodificacion de 63 a 188 tok/s segun topologia y turno; prefill de 2.034 a 3.828 tok/s; agregado con 2 peticiones de 107 a 186 tok/s.
- Flags de referencia: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`, `--mtp=auto`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-2.18bpw | 19.331.931.648 | 262.144 | EXL3 2,18 bpw | qwen-community-1.0 | Hugging Face (espejo) |
| turboderp/Qwen3.8-Flash-Next-exl3 | no disponible | no disponible | EXL3 (varias ramas) | qwen-community-1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | safetensors sin cuantizar | qwen-community-1.0 | Hugging Face |

No se dispone de datos de rendimiento de calidad para establecer una comparacion funcional con alternativas de la misma categoria; la unica comparacion documentada es de velocidad entre topologias y cabezas MTP dentro de este mismo pack.

## Limitaciones y advertencias

- Es un artefacto de cuantizacion, no un modelo original: la calidad puede degradarse respecto al modelo base sin cuantizar, y no se publican metricas que cuantifiquen esa perdida.
- La licencia qwen-community-1.0 impone condiciones propias; debe revisarse el texto completo antes de cualquier uso comercial.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- Los idiomas soportados no estan declarados; no se puede garantizar cobertura multilingue.
- El soporte de tool calling, vision y audio no esta documentado.
- Los benchmarks publicados son exclusivamente de velocidad, con una sola ejecucion por celda y variacion de +-10 %; no deben interpretarse como medida de calidad.
- El repositorio declara 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-09); se trata de un espejo reciente sin validacion independiente.
- El autor no reclama propiedad intelectual sobre el modelo ni sus pesos; los derechos quedan con los autores originales y contribuidores bajo sus licencias.
- El rendimiento medido depende de veloGB10 0.7.7 y de hardware GB10; otros motores o GPUs pueden arrojar cifras distintas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.18bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack EXL3 original (turboderp): https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- exllamav3 (herramienta de cuantizacion): https://github.com/turboderp-org/exllamav3
- veloGB10 (motor de inferencia): https://github.com/sf-stav/veloGB10
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Cabeza DotH-MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
