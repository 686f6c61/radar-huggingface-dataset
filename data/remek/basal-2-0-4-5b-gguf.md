# Remek/basal-2.0-4.5B-GGUF

## Resumen

basal-2.0-4.5B-GGUF es la distribucion en formato GGUF del modelo basal-2.0-4.5B, un modelo de 4.757 millones de parametros afinado por Remek sobre speakleash/Bielik-4.5B-v3.0-Instruct. No es un modelo de chat generico: esta especializado en "decisiones tipadas" (typed decisions), es decir, responder a preguntas de eleccion multiple, si/no y puntuaciones leyendo las log-probabilidades de los codigos de opcion en lugar de generar texto libre. Esta orientado a clasificacion, enrutamiento y toma de decisiones calibradas, con soporte para polaco e ingles.

El repositorio incluye dos cuantizaciones (Q8_0 de 4,8 GB y Q5_K_M de 3,2 GB), ficheros Modelfile para Ollama, metadatos de decision para LM Studio y ficheros de calibracion por motor. La API tipada no la proporciona el GGUF por si solo: requiere el servidor `basal-serve` (motor basal v2.5.0) o LM Studio 0.4.26 o superior con los ficheros `-decision.gguf`. Un `ollama run` directo solo devuelve texto libre.

La relevancia actual esta en el enfoque: en lugar de pedir al modelo que "elija" generando texto, se leen las probabilidades de los tokens de opcion y se aplica una calibracion medida contra el modelo bf16 original. El autor publica puertas de calidad explicitas (acuerdo con bf16, diferencia de exactitud, ECE) para cada puerto, lo que permite auditar si la cuantizacion degrada la decision. Licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Bielik-4.5B-v3.0-Instruct; detalles internos no disponibles) |
| Parametros totales | 4.757.260.288 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens en modo Ollama (basal-serve fuerza `num_ctx 4096`); configurable en llama.cpp segun `llama-server -c` (hasta 32.768 recomendado por el autor); `--mode gguf` segun el fichero |
| Tipos de cuantizacion | Q8_0 y Q5_K_M (GGUF); existen puertos FP8 y MLX 8-bit en otros repos |
| Idiomas soportados | pl (polaco), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base); tambien variantes `-decision.gguf` con metadatos para LM Studio |

## Arquitectura y entrenamiento

El modelo parte de speakleash/Bielik-4.5B-v3.0-Instruct, un transformer decoder-only de 4,5B parametros orientado a polaco e ingles. Sobre esa base, Remek ha realizado un ajuste especifico para decisiones tipadas: el modelo aprende a emitir codigos de opcion cuyo logaritmo de probabilidad se interpreta como la confianza de cada alternativa. No se dispone de informacion publica en la documentacion proporcionada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

La innovacion tecnica no esta en la arquitectura sino en la capa de inferencia: `basal-serve` renderiza un prompt propio, lee las log-probabilidades de los codigos de opcion (hasta 20 en Ollama, hasta 26 en LM Studio, sin limite practico en llama.cpp) y aplica ficheros de calibracion (`CALIBRATION.json` para bf16, `CALIBRATION.<engine>.json` por motor) para convertir esas probabilidades en decisiones calibradas. El autor documenta que una calibracion ajustada sobre bf16 no se traslada exactamente a un puerto cuantizado (en una prueba externa de basal-1.5 sobre Ollama se observo un 2,3 % de error real con umbral del 1 % usando el fichero bf16), de ahi la existencia de calibraciones por motor.

## Capacidades

- Decision de eleccion multiple entre opciones codificadas (hasta 20 opciones en Ollama, 26 en LM Studio, sin limite practico en llama.cpp).
- Decisiones binarias si/no y puntuaciones (score) calibradas.
- Clasificacion y enrutamiento con probabilidades interpretables en lugar de texto generado.
- Generacion de texto conversacional (heredada del modelo base Bielik Instruct).
- Lectura de log-probabilidades por token para extraer confianza por opcion.
- Soporte bilingue polaco e ingles.
- Integracion via API HTTP de `basal-serve` (`/v1/systemone`, `/v1/decisions` en LM Studio).
- Metadatos de decision exportables a cualquier GGUF con `basal-export-gguf`, sin tocar los tensores.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en esta ficha (el motor basal-omni experimental cubre imagenes y audio en otros modelos).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y las categorias como opciones, y devuelve la categoria con probabilidad calibrada. Adecuado porque la decision se lee de log-probabilidades y no depende de que el modelo "escriba bien" la etiqueta.
- Moderacion binaria: clasificacion si/no de contenido con umbral de calibracion ajustable, usando `CALIBRATION.llamacpp.json` para el motor concreto y evitando el desajuste de calibracion bf16.
- Triage de correo o formularios: eleccion entre un conjunto acotado de departamentos o prioridades (hasta 20 opciones en Ollama), con la opcion de ejecutar en local en un portatil gracias a Q5_K_M (3,2 GB).
- Clasificacion de documentos largos en llama.cpp: con `llama-server -c 32768` se pueden procesar estados de hasta 32K tokens, util para resumenes de contratos o informes donde hay que elegir una categoria.
- Despliegue en escritorio sin GPU dedicada: Q5_K_M en Ollama o `--mode gguf` con llama-cpp-python permite clasificacion local en equipos de desarrollo, sin depender de servidores.
- Evaluacion de calidad de cuantizaciones: el repositorio publica puertas de acuerdo con bf16 (0,9839 para Q8_0, 0,9569 para Q5_K_M en opciones 2-10), lo que sirve como referencia para validar otros puertos o calibraciones propias.
- Integracion en LM Studio: los ficheros `-decision.gguf` exponen `/v1/systemone` y `/v1/decisions` con temperaturas de `CALIBRATION.llamacpp.json`, util para prototipado rapido de clasificadores sin escribir codigo de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor publica unicamente comprobaciones de puerto contra el modelo bf16 (no son benchmarks nuevos):

| Paquete | Acuerdo con bf16 (opciones 2-10) | Acuerdo con margen >= 0,2 | Dif. exactitud | Dif. ECE | Tamano | Velocidad | Puerta |
|---|---|---|---|---|---|---|---|
| FP8 | 0,9478 | 0,9890 | -0,0008 | +0,0009 | 4,9 GB | 38,6 dec/s c16, c1 p50 29 ms (H100) | PASS |
| GGUF Q8_0 | 0,9839 | 0,9988 | +0,0002 | +0,0035 | 4,8 GB | no medida en esta release | PASS |
| GGUF Q5_K_M | 0,9569 | 0,9920 | -0,0039 | +0,0040 | 3,2 GB | no medida en esta release | PASS |
| MLX 8-bit | 0,9792 | 0,9989 | +0,0000 | -0,0009 | 4,9 GB | 278 ms c1 p50, 698 ms para 5 preguntas (Mac) | PASS |

Umbrales de la puerta para esta categoria: acuerdo 2-10 >= 0,9415, acuerdo con margen de referencia >= 0,2 >= 0,9863, exactitud dentro de 1 punto de bf16, ECE como maximo +0,01. La velocidad de las dos cuantizaciones GGUF no se midio en esta release.

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere aproximadamente 4,8 GB de pesos mas overhead de contexto; Q5_K_M aproximadamente 3,2 GB mas overhead. Con contexto de 4.096 tokens el overhead adicional es moderado pero no se publica una cifra exacta.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM para Q8_0 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); Q5_K_M cabe en GPUs de 4-6 GB. En servidor, el autor referencia H100 para la medicion de FP8, pero GGUF es "la via lenta para lotes" y esta pensado para escritorio y portatil, no para servidores.
- Cabe en consumer GPU: si, en ambas cuantizaciones; Q5_K_M esta pensado explicitamente para equipos modestos.
- Opciones de despliegue: Ollama 0.12.11 o superior (con `basal-serve --mode ollama`), llama.cpp (`llama-server` + `basal-serve --mode llamacpp`), llama-cpp-python en proceso (`--mode gguf`), LM Studio 0.4.26 o superior con motor llama.cpp 2.65.1+ (no el motor MLX).
- Latencia y throughput: no medidos para GGUF en esta release. Como referencia de la misma familia, FP8 alcanza 38,6 decisiones/s con concurrencia 16 y p50 de 29 ms con concurrencia 1 en H100; MLX 8-bit registra 278 ms p50 con concurrencia 1 en Mac. LM Studio corta las peticiones a los 30 s.
- Concurrencia: `--http-parallel N` junto con `OLLAMA_NUM_PARALLEL` o `llama-server -np`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-4.5B (bf16) | 4,757B | segun motor | Decisiones tipadas, referencia de calibracion | Apache 2.0 | HuggingFace (Remek/basal-2.0-4.5B) |
| basal-2.0-4.5B-FP8 | 4,757B | segun motor | Mismo modelo, puerto FP8 con 38,6 dec/s c16 en H100 | Apache 2.0 | HuggingFace (Remek/basal-2.0-4.5B-FP8) |
| basal-2.0-4.5B-MLX-8bit | 4,757B | segun motor | Mismo modelo, puerto MLX para Apple Silicon | Apache 2.0 | HuggingFace (Remek/basal-2.0-4.5B-MLX-8bit) |
| speakleash/Bielik-4.5B-v3.0-Instruct | 4,5B | no disponible | Modelo base conversacional pl/en | no disponible en esta ficha | HuggingFace (speakleash) |

No se dispone de comparacion con modelos de clasificacion de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- El GGUF no proporciona la API de decisiones por si solo: requiere `basal-serve` o los ficheros `-decision.gguf` en LM Studio. Un `ollama run` directo solo genera texto libre.
- Limite de opciones: Ollama devuelve como maximo 20 log-probabilidades por posicion; para mas de 20 opciones hay que usar llama.cpp. LM Studio admite hasta 26.
- Contexto en Ollama limitado a 4.096 tokens por prompt; los estados mas largos se truncan por el medio y se marca `usage.truncated`.
- La calibracion ajustada en bf16 no se traslada exactamente a un puerto cuantizado; hay que usar el fichero de calibracion del motor correspondiente para evitar desajustes de umbral.
- Idiomas limitados a polaco e ingles; no se documenta soporte de castellano.
- Riesgo de alucinacion en la generacion de texto libre heredada del modelo base; el modo de decision reduce el problema al leer probabilidades, pero no lo elimina si el estado de entrada es ambiguo o esta fuera de distribucion.
- No se publican datos de sesgos, composicion del dataset de ajuste ni evaluaciones de robustez.
- GGUF es la via lenta para lotes; no esta pensado para servir cargas concurrentes altas en produccion.
- LM Studio termina las peticiones a los 30 s, lo que obliga a dividir documentos muy largos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Bielik-4.5B-v3.0-Instruct, no detallada en esta ficha.

## Enlaces

- HuggingFace (este repo): https://huggingface.co/Remek/basal-2.0-4.5B-GGUF
- Modelo bf16: https://huggingface.co/Remek/basal-2.0-4.5B
- Puerto FP8: https://huggingface.co/Remek/basal-2.0-4.5B-FP8
- Puerto MLX 8-bit: https://huggingface.co/Remek/basal-2.0-4.5B-MLX-8bit
- Coleccion basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Modelo base: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct
- Repositorio del motor (GitHub): https://github.com/rkinas/basal
- Seccion de imagenes y audio (basal-omni experimental): https://github.com/rkinas/basal#images-and-audio-basal-omni-experimental
- Sitio web del proyecto: https://basal.si5.pl/
