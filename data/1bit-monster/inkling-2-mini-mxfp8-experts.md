# 1bit-MONSTER/Inkling-2-Mini-MXFP8-experts

## Resumen

Inkling-2-Mini-MXFP8-experts es un repositorio de pesos parciales publicado por el usuario 1bit-MONSTER. No se trata de un modelo completo, sino de un subconjunto de 16 tensores copiados byte a byte del modelo base thinkingmachines/Inkling-2-Mini, en concreto los expertos enrutados (routed experts) de las capas 20 a 23 del bloque transformer. El objetivo es servir de pieza nativa para el motor de inferencia "1bit engine" mediante su tarjeta Loom, evitando la recuantizacion a Q8_0 que ofrece la version GGUF de Unsloth.

El modelo base Inkling-2-Mini es un transformer de tipo mezcla de expertos (MoE) desarrollado por Thinking Machines. Los tensores publicados aqui revelan una configuracion de 128 expertos por capa, con pesos en formato MXFP8 (E4M3 con una escala UE8M0 por cada 32 valores) y dimensiones internas de 2304 en la proyeccion w13 y 1152 en w2. El repositorio ocupa 4,2 GB frente a los 19,5 GB del checkpoint completo.

La relevancia de esta publicacion es fundamentalmente tecnica: demuestra que es posible leer los expertos MXFP8 tal como los publica el autor original en hardware de consumo (AMD Ryzen AI Max+ 395 con Radeon 8060S, gfx1151) con una calidad practicamente identica a la referencia en bf16 y una velocidad de decodificacion de 57,2 tok/s. Es un caso de estudio de preservacion de precision nativa en el ecosistema de inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Subconjunto de tensores de un transformer MoE (expertos enrutados de las capas 20-23) |
| Parametros totales | no disponible (solo se publican 16 tensores de 4,2 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 nativo (E4M3 con escala UE8M0 por cada 32 valores); sin recuantizacion |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (F8_E4M3 y U8 para las escalas) |

## Arquitectura y entrenamiento

Los tensores publicados corresponden a las capas 20, 21, 22 y 23 del bloque `model.llm` del modelo base. Cada capa contiene dos proyecciones por experto: `w13_weight` con forma [128, 2304, 2304] en F8_E4M3 y su escala `w13_weight_scale` en U8 con forma [128, 2304, 72], y `w2_weight` con forma [128, 2304, 1152] y escala [128, 2304, 36]. Esto indica 128 expertos por capa, una dimension de modelo compatible con 2304 y una expansion intermedia de 1152 en la segunda proyeccion. El formato MXFP8 usa un exponente compartido de 8 bits (UE8M0) por cada bloque de 32 valores, lo que reduce el coste de almacenamiento de escalas.

No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base. La innovacion destacable de este repositorio es la preservacion byte a byte: cada tensor incluye su sha256 verificado tanto en el fichero origen como en el publicado, y todos coinciden. El fichero `provenance.jsonl` documenta esta trazabilidad. El checkpoint fuente tiene sha256 `65e60f51aa1284d4fb022584908c315270334d991828bb774af60584523539d1` y un tamano de 19.526.019.168 bytes.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Inkling-2-Mini, aunque no se documentan en esta ficha.
- Mezcla de expertos: 128 expertos por capa en las capas 20-23, lo que sugiere enrutamiento disperso en el modelo completo.
- Inferencia de precision nativa MXFP8: permite ejecutar los expertos sin recuantizar, preservando la distribucion original de pesos.
- Compatibilidad con el motor 1bit y la tarjeta Loom: pensado para el stack de inferencia local de 1bit-MONSTER sobre hardware AMD Strix Halo.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Investigacion de cuantizacion MXFP8: permite estudiar como se comportan los expertos en formato E4M3 con escalas UE8M0 por bloques de 32 frente a recuantizaciones Q8_0, usando solo 4,2 GB en lugar de 19,5 GB.
- Desarrollo de motores de inferencia locales: sirve como fixture de pruebas para validar la lectura nativa de tensores MXFP8 en GPUs integradas AMD gfx1151 y comparar contra la referencia bf16.
- Despliegue en hardware de consumo: con 4,2 GB de expertos, es viable en equipos con memoria unificada como el Ryzen AI Max+ 395, manteniendo 57,2 tok/s de decodificacion.
- Auditoria de reproducibilidad: el fichero `provenance.jsonl` y los sha256 por tensor permiten verificar que los pesos no han sido alterados, util en pipelines de validacion de modelos.
- Benchmarking de calidad de cuantizacion: la comparacion medida (KLD medio 0,004583 frente a 0,004571 y top-1 97,99 % frente a 98,02 %) sirve como referencia para evaluar otras estrategias de cuantizacion.
- Sustitucion parcial en cargas selectivas: al conservar nombres, dtypes y formas originales, el fichero puede reemplazar al original alli donde solo se lean estos tensores.

## Benchmarks y rendimiento

| Metrica | MXFP8 nativo (este repo) | Q8_0 recuantizado (Unsloth) |
|---|---|---|
| KLD medio vs referencia bf16 | 0,004583 | 0,004571 |
| Top-1 agreement | 97,99 % | 98,02 % |
| Decodificacion (tok/s) | 57,2 | 57,5 |

Medido en 1bit engine sobre AMD Ryzen AI Max+ 395 / Radeon 8060S (gfx1151) con 4.080 posiciones de evaluacion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: 4,2 GB para el subconjunto de expertos publicado; el modelo completo requiere 19,5 GB en bf16 segun el checkpoint fuente.
- GPU validadas: AMD Radeon 8060S (gfx1151) en Ryzen AI Max+ 395, con memoria unificada.
- GPU consumer: cabe en equipos con memoria unificada de 32 GB o mas; no se documenta soporte en RTX 4090 ni otras GPU discretas.
- Despliegue: motor 1bit engine con tarjeta Loom; tambien compatible con cargadores safetensors estandar para lectura selectiva de tensores.
- Rendimiento medido: 57,2 tok/s de decodificacion en la configuracion indicada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1bit-MONSTER/Inkling-2-Mini-MXFP8-experts | Subconjunto de expertos | 4,2 GB | safetensors MXFP8 | Apache-2.0 | Hugging Face |
| thinkingmachines/Inkling-2-Mini | Modelo completo | 19,5 GB | safetensors | Apache-2.0 | Hugging Face |
| unsloth/Inkling-2-Mini-GGUF | Modelo completo recuantizado | no disponible | GGUF Q8_0 | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- No es un modelo autonomo: solo contiene 16 tensores de 4 capas; no puede ejecutarse por si solo sin el resto del checkpoint.
- Sin datos de sesgo, alucinacion ni evaluaciones de seguridad en la informacion disponible.
- Sin informacion sobre idiomas soportados ni longitud de contexto del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de licencia y el credito a Thinking Machines.
- El rendimiento medido corresponde a un unico hardware (gfx1151); no hay garantias en otras plataformas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Inkling-2-Mini-MXFP8-experts
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Tarjeta Loom de referencia: https://huggingface.co/loom-fun
- Detalles de la medicion: https://github.com/1bit-MONSTER/engine/issues/3333
