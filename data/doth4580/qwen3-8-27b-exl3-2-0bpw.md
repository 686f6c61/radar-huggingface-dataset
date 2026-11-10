# doth4580/Qwen3.8-27B-exl3-2.0bpw

## Resumen

Qwen3.8-27B-exl3-2.0bpw es una cuantizacion de 2 bits por peso (2.0 bpw de media) del modelo Qwen/Qwen3.8-27B, publicado por el usuario doth4580. El pack se ha generado con exllamav3 1.6.3 sobre 8 GPU NVIDIA H100 y esta pensado para ejecutarse en el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10, en configuraciones de una, dos o cuatro maquinas. El modelo base pertenece a la familia Qwen3.8 y su licencia es Apache-2.0.

El repositorio contiene unicamente los pesos cuantizados en formato EXL3 (ExLlamaV3); el tokenizer, la plantilla de chat y la configuracion se mantienen identicos al original salvo por los metadatos de cuantizacion. Incluye la torre de vision cuantizada a 6 bits y una capa MTP (multi-token prediction) a 4 bits, lo que permite decodificacion especulativa nativa sin un drafter externo.

Es relevante porque demuestra que un modelo de gran tamano puede servirse en hardware de clase workstation (GB10) con un contexto declarado de hasta 262.144 tokens y velocidades de decodificacion de entre 34 y 129 tokens/s segun topologia y fuente de draft. No obstante, el dato de parametros reales en safetensors (5.213.721.984) no concuerda con la denominacion "27B" del modelo base, por lo que conviene tratar el tamano nominal con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8; tag `qwen3_5`), con capa MTP y torre de vision |
| Parametros totales | 5.213.721.984 segun safetensors del repo; el modelo base se denomina "27B" (discrepancia no aclarada) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (`--max-seq-len 262144` en la configuracion probada) |
| Tipos de cuantizacion | EXL3 a 2.0 bpw de media; `lm_head` a 6 bits; capa MTP a 4 bits; torre de vision a 6 bits; codebook `mul1`; out-scales `auto` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El pack no aporta informacion sobre el entrenamiento del modelo base. Lo que si documenta es el proceso de cuantizacion: pesos generados con exllamav3 1.6.3 sobre 8 GPU H100, con 2.0 bpw de media, `lm_head` a 6 bits, capa MTP a 4 bits, torre de vision a 6 bits, codebook `mul1`, out-scales en modo `auto` y calibracion de 250 secuencias de 2.048 tokens. El tokenizer, la plantilla de chat y la configuracion se conservan sin cambios respecto al original.

La innovacion tecnica destacable es la capa MTP integrada, que actua como fuente de decodificacion especulativa con tasas de aceptacion medidas de entre el 66,1 % y el 68,2 % segun topologia. Ademas, el pack admite drafters externos DFlash2 (bf16 y NVFP4) con tasas de aceptacion de hasta el 73,9 %. El motor veloGB10 soporta prefill en FP8, cache KV cuantizada a 8 bits (`--kv-cache q8`), prefix caching y reparto de pesos por red entre nodos (TP=2 y TP=4) sin copia local del modelo en los nodos.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto en las pruebas del autor.
- Procesamiento de vision: el pack incluye torre de vision cuantizada a 6 bits, por lo que hereda las capacidades multimodales del modelo base.
- Decodificacion especulativa mediante capa MTP propia o drafters externos DFlash2, con aceleracion de decodificacion.
- Servido mediante API compatible con OpenAI (`/v1`), lo que habilita integracion con clientes y SDK estandar.
- Soporte de batching concurrente (`--max-batch`) y prefix caching para reutilizacion de contexto.
- Control de esfuerzo de razonamiento (`--reasoning-effort low` en la configuracion probada).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Servicio de inferencia en hardware DGX Spark: el pack esta disenado y probado para veloGB10 en una, dos o cuatro maquinas GB10, con lo que permite desplegar un modelo grande en infraestructura compacta sin GPU de datacenter.
- Analisis de documentos largos: con 262.144 tokens de contexto y prefix caching, es adecuado para resumir o consultar contratos, informes y bases de codigo extensas en una sola pasada.
- Procesamiento de imagenes con texto asociado: la torre de vision a 6 bits permite tareas de descripcion, extraccion de datos de capturas o documentos escaneados combinadas con razonamiento textual.
- Generacion de codigo asistida: la configuracion probada con `--reasoning-effort low` y decodificacion especulativa (hasta 129 tok/s en TP=4 con DFlash2 NVFP4) encaja en asistentes de autocompletado y refactorizacion interactivos.
- Escalado horizontal por red: el reparto de pesos entre nodos con cache local permite crecer de TP=1 a TP=4 sin duplicar almacenamiento, util para equipos que ya disponen de varias estaciones GB10.
- Despliegue compatible con OpenAI: al exponer una API `/v1`, se puede integrar como backend en herramientas existentes (chatops, pipelines de documentacion, automatizacion interna) sin adaptadores propios.
- Experimentacion con cuantizacion extrema: util para investigadores que quieran medir el impacto de 2.0 bpw en calidad y throughput frente al modelo base sin cuantizar.

## Benchmarks y rendimiento

El autor publica mediciones de VeloBench (2026-11-08, veloGB10 0.7.7 dev) sobre GB10 con muestreo de produccion, thinking activado y una peticion simultanea salvo en la columna agregada. La decodificacion se expresa en tokens de salida por segundo e incluye decodificacion especulativa.

| Topologia | Fuente de draft | Decode turno de codigo | Decode turno de relato | Mediana todos los turnos | Prefill (tok/s) | 2 peticiones agregado | Aceptacion del draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | MTP del pack | 68 | 34 | 55 | 898 | 78 | 66,8 % |
| TP=2 | MTP del pack | 88 | 48 | 75 | 1.530 | 104 | 66,1 % |
| TP=4 | MTP del pack | 120 | 66 | 98 | 1.900 | 124 | 68,2 % |
| TP=1 | DFlash2 (bf16) | 72 | 23 | 26 | 875 | 80 | 72,6 % |
| TP=2 | DFlash2 (bf16) | 64 | 29 | 35 | 1.449 | 104 | 73,9 % |
| TP=4 | DFlash2 (bf16) | 97 | 45 | 48 | 1.765 | 95 | 69,6 % |
| TP=1 | DFlash2 (NVFP4 FIXED) | 90 | 30 | 44 | 884 | 77 | 73,5 % |
| TP=2 | DFlash2 (NVFP4 FIXED) | 113 | 37 | 51 | 1.435 | 69 | 73,3 % |
| TP=4 | DFlash2 (NVFP4 FIXED) | 129 | 52 | 70 | 1.774 | 125 | 72,1 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 10,4 GB, por lo que los pesos caben holgadamente en los 128 GB de memoria unificada de una GB10; a ello hay que sumar la cache KV cuantizada a 8 bits, que crece con el contexto (hasta 262.144 tokens).
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 1, 2 o 4 maquinas. El autor uso 8 GPU H100 unicamente para generar la cuantizacion, no para servirla.
- Cabe en GPU de consumo: no disponible; el pack esta orientado a GB10 y no se documenta su funcionamiento en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: motor veloGB10 (`gb10_inference`), que expone API compatible con OpenAI en el puerto 9000. Al ser formato EXL3 estandar, cualquier framework que lea el formato puede utilizarlo, aunque el autor solo prueba veloGB10.
- Latencia y throughput: decodificacion de 34 a 129 tok/s segun topologia y draft; prefill de 875 a 1.900 tok/s; agregado de 69 a 125 tok/s con 2 peticiones. Variacion de aproximadamente ±10 % entre ejecuciones.
- Red: en TP=2 y TP=4 los nodos no necesitan copia del modelo; el head envia los pesos por red y los cachea localmente. En equipos con dos pares de puertos RoCE activos se selecciona con `--rdma-dev`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-27B-exl3-2.0bpw | 5.213.721.984 segun safetensors (nominal 27B) | 262.144 tokens | EXL3 2.0 bpw | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B (nominal) | no disponible | pesos completos | Apache-2.0 | Hugging Face |
| doth4580/Qwen3.8-27B-DFlash2 | drafter, tamano no disponible | no disponible | bf16 | no disponible | Hugging Face |
| doth4580/Qwen3.8-27B-DFlash2-NVFP4-RTNcal-FIXED | drafter, tamano no disponible | no disponible | NVFP4 | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de benchmarks de calidad del modelo base en la informacion proporcionada, por lo que no es posible comparar numericamente la perdida de calidad por la cuantizacion a 2.0 bpw.

## Limitaciones y advertencias

- Discrepancia de tamano: el nombre indica 27B pero los safetensors declaran 5.213.721.984 parametros; conviene verificar el modelo base antes de asumir capacidades.
- Cuantizacion agresiva: 2.0 bpw de media puede degradar calidad en tareas sensibles (matematicas, codigo complejo, instrucciones largas); no se publican evaluaciones de calidad que lo cuantifiquen.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue concreto.
- El pack esta probado unicamente con veloGB10; otros frameworks EXL3 pueden cargarlo, pero no hay validacion del autor.
- La configuracion de referencia usa `--max-batch 2`, lo que limita el throughput concurrente en cargas de alta demanda.
- Tasas de aceptacion del draft por debajo del 75 % implican que parte del trabajo especulativo se descarta; el beneficio varia segun el tipo de texto (el turno de relato es notablemente mas lento que el de codigo).
- Licencia Apache-2.0 heredada del modelo base; el autor no reclama propiedad intelectual sobre pesos ni arquitectura, pero el uso comercial queda sujeto a los terminos del modelo original.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero aplicables por herencia del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni reportes independientes de calidad.

## Enlaces

- Repositorio del pack: https://huggingface.co/doth4580/Qwen3.8-27B-exl3-2.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Herramienta de cuantizacion exllamav3: https://github.com/turboderp-org/exllamav3
- Drafter DFlash2 (bf16): https://huggingface.co/doth4580/Qwen3.8-27B-DFlash2
- Drafter DFlash2 (NVFP4 FIXED): https://huggingface.co/doth4580/Qwen3.8-27B-DFlash2-NVFP4-RTNcal-FIXED
