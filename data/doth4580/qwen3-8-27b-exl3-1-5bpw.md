# doth4580/Qwen3.8-27B-exl3-1.5bpw

## Resumen

Qwen3.8-27B-exl3-1.5bpw es una cuantizacion de los pesos originales del modelo Qwen/Qwen3.8-27B, desarrollada por el usuario doth4580 mediante la herramienta exllamav3 1.6.3 sobre 8 GPU NVIDIA H100. El pack aplica una cuantizacion EXL3 (formato ExLlamaV3) con un promedio de 1,5 bits por peso, manteniendo el `lm_head` a 6 bits, la capa MTP a 4 bits y la torre de vision a 6 bits, con un codebook `mul1` y calibracion de 250 x 2048 tokens. El resultado es un repositorio de 8,9 GB que comprime un modelo declarado como de 27B en el nombre (aunque los safetensors reales suman 4.453.504.384 parametros).

El modelo base pertenece a la familia Qwen3.8 y esta publicado bajo licencia Apache-2.0. El pack conserva sin cambios el tokenizer, la plantilla de chat y la configuracion original, salvo los metadatos de cuantizacion. La relevancia de esta version radica en que permite ejecutar un modelo multimodal con ventana de contexto de hasta 262.144 tokens en hardware modesto, en concreto en una o varias maquinas NVIDIA DGX Spark / GB10, mediante el motor de inferencia veloGB10 (`gb10_inference`), que expone una API compatible con OpenAI.

El pack esta disenado principalmente para el motor veloGB10, que soporta despliegue en 1, 2 o 4 nodos GB10 con tensor parallelism, cache KV en q8, cache de prefijo, prefill en fp8 y decodificacion especulativa mediante la cabeza MTP del propio pack o mediante los drafters DFlash2 (bf16 o NVFP4). Al ser formato EXL3 estandar, cualquier framework que lea dicho formato puede cargarlo, aunque las instrucciones y benchmarks publicados corresponden exclusivamente a veloGB10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.8, tag `qwen3_5`/`qwen4_exp`), con capa MTP y torre de vision |
| Parametros totales | 4.453.504.384 (segun safetensors); el nombre del repo indica 27B para el modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun los comandos de despliegue del autor) |
| Tipos de cuantizacion | EXL3 a 1,5 bpw promedio; `lm_head` 6 bits; capa MTP 4 bits; torre de vision 6 bits; codebook `mul1` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.8 con capacidades multimodales (torre de vision incluida) y una capa MTP (multi-token prediction) que se emplea como fuente de decodificacion especulativa. Esta publicacion no entrena el modelo: parte de los pesos de Qwen/Qwen3.8-27B y los cuantiza con exllamav3 1.6.3 en 8 GPU H100, aplicando 1,5 bpw de media, `lm_head` a 6 bits, MTP a 4 bits, vision a 6 bits, codebook `mul1`, out-scales en modo `auto` y una calibracion de 250 secuencias de 2048 tokens. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en el modelo original.

La innovacion tecnica del pack es la compresion extrema (1,5 bpw) que permite cargar el modelo en hardware GB10, combinada con el soporte del motor veloGB10 para tensor parallelism en 1, 2 o 4 nodos, cache KV cuantizada en q8, cache de prefijo, prefill en fp8, ajuste de `reasoning-effort` y decodificacion especulativa mediante la cabeza MTP (aceptacion del 65-68 %) o mediante los drafters DFlash2 en bf16 o NVFP4 (aceptacion del 70-75 %). Los nodos no requieren copia local del modelo: el nodo cabeza envia a cada nodo solo su parte de los pesos por red RDMA y la cachea localmente.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activable y ajuste de esfuerzo de razonamiento (`--reasoning-effort low` en los comandos de ejemplo).
- Procesamiento multimodal de imagenes gracias a la torre de vision incluida en el pack (cuantizada a 6 bits).
- Decodificacion especulativa integrada mediante la capa MTP del propio modelo o mediante drafters externos DFlash2.
- Soporte de contexto largo de hasta 262.144 tokens con cache KV en q8 y cache de prefijo.
- Servido mediante API compatible con OpenAI (`/v1`), lo que facilita la integracion con clientes existentes.
- Procesamiento por lotes concurrente (`--max-batch`) y hasta 65.536 tokens de salida por peticion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue de un asistente conversacional con contexto largo en una unica DGX Spark: con 262.144 tokens de ventana y cache de prefijo, el modelo puede mantener conversaciones multi-turno extensas o procesar documentos completos sin truncar, sirviendo la API compatible con OpenAI en `http://<head-ip>:9000/v1`.
- Analisis de documentos e imagenes en local: la torre de vision a 6 bits permite pasar imagenes junto al texto para tareas de extraccion de informacion, descripcion o respuesta a preguntas sobre capturas y diagramas, sin depender de servicios en la nube.
- Razonamiento con esfuerzo configurable: el flag `--reasoning-effort low` permite ajustar el coste computacional del modo thinking segun la tarea, util para clasificacion rapida o para problemas que requieren cadenas de razonamiento mas largas.
- Escalado horizontal en cluster de GB10: con TP=2 o TP=4 el throughput agregado sube de 80 a 130 tok/s (con MTP) y el prefill de 918 a 1.902 tok/s, lo que permite servir cargas concurrentes mayores manteniendo el modelo en hardware de borde.
- Generacion de codigo interactiva: los benchmarks del autor miden "code turn decode" entre 58 y 132 tok/s segun topologia y drafter, adecuado para asistentes de programacion en entornos con requisitos de privacidad (todo el procesamiento ocurre en las maquinas GB10 locales).
- Prototipado e investigacion con modelos multimodales en hardware de bajo consumo: al ocupar 8,9 GB el repositorio y usar 1,5 bpw, investigadores pueden experimentar con un modelo de la familia Qwen3.8 sin acceso a clusters de GPU de datacenter.
- Servicio de inferencia interno con API OpenAI-compatible: cualquier aplicacion existente que hable con la API de OpenAI puede apuntar al servidor veloGB10, facilitando migraciones sin cambios de codigo en el cliente.

## Benchmarks y rendimiento

El autor publica mediciones de VeloBench contra la API servida en maquinas GB10 (2026-11-08, veloGB10 0.7.7 development builds), con sampling de produccion, thinking activado y una peticion a la vez salvo en la columna de dos peticiones. La decodificacion se mide en tokens de salida por segundo e incluye decodificacion especulativa; la variacion entre ejecuciones es de aproximadamente ±10 %.

| Topologia | Fuente del drafter | Code turn decode (tok/s) | Story turn decode (tok/s) | Mediana todas las turnas (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del drafter |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | MTP del pack | 58 | 33 | 52 | 918 | 80 | 65,3 % |
| TP=2 | MTP del pack | 82 | 87 | 66 | 1.541 | 101 | 67,1 % |
| TP=4 | MTP del pack | 116 | 72 | 84 | 1.902 | 130 | 67,9 % |
| TP=1 | DFlash2 (bf16) | 60 | 33 | 60 | 883 | 75 | 73,1 % |
| TP=2 | DFlash2 (bf16) | 80 | 31 | 39 | 1.448 | 100 | 70,7 % |
| TP=4 | DFlash2 (bf16) | 92 | 41 | 78 | 1.767 | 101 | 73,6 % |
| TP=1 | DFlash2 (NVFP4 FIXED) | 82 | 32 | 64 | 872 | 86 | 74,5 % |
| TP=2 | DFlash2 (NVFP4 FIXED) | 110 | 44 | 105 | 1.446 | 110 | 75,1 % |
| TP=4 | DFlash2 (NVFP4 FIXED) | 132 | 60 | 58 | 1.756 | 105 | 73,0 % |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio de pesos ocupa 8,9 GB, por lo que la carga del modelo requiere al menos ese espacio, mas la cache KV en q8 para la longitud de contexto configurada (hasta 262.144 tokens) y el espacio del drafter si se usa decodificacion especulativa.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 1, 2 o 4 maquinas con tensor parallelism (TP=1, TP=2, TP=4). La cuantizacion se genero en 8 GPU NVIDIA H100, pero el destino de despliegue declarado es GB10.
- Compatibilidad con GPU de consumo: no disponible. El autor no menciona RTX 4090 ni otras GPU consumer; el foco esta en GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor probado y recomendado, con servidor OpenAI-compatible en el puerto 9000. Al ser formato EXL3 estandar, cualquier framework que lea ExLlamaV3 podria cargarlo, aunque no se documentan otras opciones.
- Red: en configuraciones multi-nodo se usa RDMA/RoCE; con dos pares de puertos RoCE activos se selecciona con `--rdma-dev <rail1>,<rail2>`. Los nodos no necesitan copia del modelo.
- Latencia y throughput: segun la tabla anterior, la decodificacion mediana va de 39 a 105 tok/s y el prefill de 872 a 1.902 tok/s segun topologia y drafter; con dos peticiones concurrentes el agregado llega a 130 tok/s (TP=4 con MTP).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-27B-exl3-1.5bpw | 4.453.504.384 (safetensors) | 262.144 tokens | EXL3 1,5 bpw | Apache-2.0 | veloGB10 en GB10 (TP=1/2/4) |
| Qwen/Qwen3.8-27B (modelo base) | 27B (segun nombre) | no disponible | pesos originales | Apache-2.0 | requiere hardware de mayor capacidad |
| doth4580/Qwen3.8-27B-DFlash2 | no disponible | no disponible | drafter bf16 | no disponible | complemento de decodificacion especulativa |
| doth4580/Qwen3.8-27B-DFlash2-NVFP4-RTNcal-FIXED | no disponible | no disponible | NVFP4 | no disponible | complemento de decodificacion especulativa |

No se dispone de datos de rendimiento del modelo base ni de otras alternativas de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y modo de despliegue.

## Limitaciones y advertencias

- La cuantizacion a 1,5 bpw es extremadamente agresiva y puede degradar la calidad respecto a los pesos originales; el autor no publica evaluaciones de calidad (perplejidad, benchmarks academicos) que permitan cuantificar la perdida.
- El pack esta pensado y probado exclusivamente con veloGB10; el rendimiento en otros motores que lean EXL3 no esta documentado.
- El numero de parametros de los safetensors (4.453.504.384) no coincide con el "27B" del nombre del modelo base; conviene verificar la configuracion antes de asumir un tamano concreto.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas del modelo base en la documentacion proporcionada.
- La licencia Apache-2.0 se hereda del modelo base; el autor del pack no reclama propiedad intelectual sobre el modelo ni sus pesos, y los derechos quedan en manos de los autores originales.
- El uso comercial esta permitido por Apache-2.0, pero se recomienda revisar la licencia del modelo base Qwen/Qwen3.8-27B para confirmar condiciones adicionales.
- Las mediciones de rendimiento provienen de una sola ejecucion por celda con variacion de ±10 %, por lo que deben tomarse como orientativas.
- El soporte multilingue, de tool calling y de agentes no esta documentado en la informacion disponible; no debe asumirse en produccion sin validacion previa.
- La decodificacion especulativa con DFlash2 requiere descargar repositorios adicionales (bf16 o NVFP4) y configurar flags especificos; sin ellos, el rendimiento depende solo de la cabeza MTP.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-27B-exl3-1.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- Herramienta de cuantizacion exllamav3: https://github.com/turboderp-org/exllamav3
- Drafter DFlash2 (bf16): https://huggingface.co/doth4580/Qwen3.8-27B-DFlash2
- Drafter DFlash2 (NVFP4): https://huggingface.co/doth4580/Qwen3.8-27B-DFlash2-NVFP4-RTNcal-FIXED
