# lucastca/DeepSeek-V4.1-Flash-1017-FRANKENSTEIN-EXL3-2.9bpw-UNCENSORED-TensorFold-2xSpark

## Resumen

DeepSeek-V4.1-Flash-1017-FRANKENSTEIN-EXL3-2.9bpw-UNCENSORED-TensorFold-2xSpark es un repositorio experimental publicado por el usuario lucastca en Hugging Face que **no contiene pesos de modelo**. Se trata de una "receta" (recipe) y un informe de campo que documenta cómo desplegar una versión cuantizada a 2,9 bits por peso (EXL3) de un supuesto DeepSeek-V4.1-Flash, apodado "1017", sobre dos nodos NVIDIA DGX Spark (GB10) conectados mediante CX7 y ejecutando TensorFold en modo tensor-parallel TP=2.

El autor reporta una tasa de decodificación mediana de aproximadamente 68 tok/s con un único stream en caliente (68,1 tok/s en el nodo cabecera con prompts en portugués; 67,1 tok/s en portugués y 61,9 tok/s en inglés a través de un túnel cliente), sobre seis peticiones por conjunto y sin control experimental riguroso de idioma. El repositorio distribuye scripts de verificación de layout, un comprobador de encaje (`fit.py`), un constructor de caché portable, un lanzador y un adaptador de swap, pero **no incluye pesos, tablas Engram, kernels, imágenes de contenedor ni cachés**.

La relevancia del artefacto es doble: por un lado, documenta una configuración de inferencia distribuida de bajo consumo sobre hardware ARM64 (DGX Spark) con cuantización EXL3 extrema; por otro, ejemplifica un patrón de publicación "no-weights" en el que el valor está en la receta reproducible y en el informe de mediciones, no en el checkpoint. El propio autor advierte que es un informe experimental de primera publicación (2026-11-23), sin ensayo de instalación limpia y con componentes probados solo con stubs y dry-runs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base no se describe; el runtime usa TensorFold con tensor-parallel TP=2 sobre EXL3) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 a 2,9 bits por peso (bpw) |
| Idiomas soportados | No disponible (se reportan mediciones con prompts en portugues e ingles) |
| Licencia | MIT |
| Formato de pesos | No se distribuyen pesos; el pack referenciado es EXL3 (repo `neko-legends/...-4xSpark`) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del modelo base ni sobre su proceso de entrenamiento (datos, tokens, RLHF/DPO). El repositorio es un artefacto de despliegue, no un checkpoint: describe un runtime compilado con Zig ARM64 0.17.0 en modo ReleaseFast para SM 121, usando `nvcr.io/nvidia/pytorch:26.07-py3` (CUDA, NCCL 2.30.7, cuBLAS y verbs) y un checkout parcheado de TensorFold (commit `629c524a...`) que aporta `tensorfold-native` y `tf-dsv41-lanes`, mas un checkout de herramientas (commit `59402086...`) con el binario de caché de rango y generadores de token-map, RoPE y vision-bias.

La innovacion técnica documentada es el uso de TensorFold con paralelismo de tensores en dos nodos DGX Spark (GB10) enlazados por CX7, sirviendo un pack EXL3 de 2,9 bpw re-codificado por Neko. El repositorio incluye un comprobador de encaje (`fit.py`) que valida el layout mediante 43 pares de rangos HTTP 206 estrictos sin descargar payload de tensores, y que en el control negativo (pack de dealignai) se detiene en el primer slot ausente, `layers.10.attn.wo_b`. Se mencionan 54 ediciones en la cuenta de build upstream, que el autor aclara que no son 54 fallos observados por el gate.

## Capacidades

- No se documentan capacidades funcionales del modelo en la informacion disponible (generacion, razonamiento, codigo, matematicas, vision, tool calling, agentes o multilinguesimo).
- El artefacto documenta capacidades del **runtime**: verificacion de layout, construccion de cache portable, lanzamiento de servicios, descarga por inactividad (idle unload) y restauracion.
- Inferencia distribuida en TP=2 sobre dos nodos DGX Spark con enlace CX7.
- Sirve un pack cuantizado EXL3 a 2,9 bpw.
- El autor indica que la API falsa solo prueba el protocolo del cliente, no el modelo.

## Casos de uso

- **Reproduccion de un despliegue multi-nodo de bajo consumo**: usar los scripts y el informe para replicar una instalacion de dos DGX Spark con TensorFold TP=2 en una ventana privada y aprobada, con baseline verificado y responsable de rollback.
- **Validacion de layout de packs EXL3**: ejecutar `fit.py` para comprobar si un pack cuantizado encaja en la imagen medida (`tensorfold-dsv41:exl3-tp2-625d420e24a4`, ID `sha256:d09ca375...`) antes de descargar cientos de GB.
- **Auditoria de integridad de artefactos**: el comprobador usa 43 pares de rangos HTTP 206 estrictos sin payload de tensores, util para verificar revisiones pinneadas (`019a317f...`) en pipelines de CI.
- **Benchmark de decodificacion en hardware ARM64**: el informe aporta tasas de ~68 tok/s en un stream caliente, utiles como referencia para comparar configuraciones TP=2 en GB10.
- **Pruebas de protocolo de cliente**: la API falsa permite validar la capa cliente sin modelo, GPU ni Docker.
- **Investigacion de cuantizacion extrema**: el pack EXL3 a 2,9 bpw sirve como caso de estudio de los limites practicos de compresion en inferencia distribuida.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificacion (nodo cabecera, portugues) | 68,1 tok/s | 1 stream caliente, 6 peticiones |
| Decodificacion (tunel cliente, portugues) | 67,1 tok/s | 1 stream caliente, 6 peticiones |
| Decodificacion (tunel cliente, ingles) | 61,9 tok/s | 1 stream caliente, 6 peticiones |

El autor advierte que no es una comparacion de idiomas controlada. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- **Hardware medido**: dos NVIDIA DGX Spark (GB10) enlazados por CX7, con TensorFold TP=2.
- **Host de verificacion**: Linux ARM64 con Docker, acceso HTTPS anonimo a metadatos publicos y soporte de ficheros dispersos (sparse files).
- **Python**: 3.11 o superior (solo biblioteca estandar para el chequeo de encaje).
- **VRAM estimada**: no disponible.
- **GPU consumer**: no disponible; el runtime medido es especifico de GB10 y SM 121.
- **Despliegue**: TensorFold con imagen `tensorfold-dsv41:exl3-tp2-625d420e24a4`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia/throughput**: ~68 tok/s medianos en un stream caliente (ver tabla anterior).

## Comparativa con modelos similares

| Artefacto | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (lucastca) | No disponible | No disponible | ~68 tok/s (TP=2, GB10) | MIT | Receta sin pesos |
| `neko-legends/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED-4xSpark` | No disponible | No disponible | No disponible | No disponible | Pack EXL3 referenciado |
| `dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED` | No disponible | No disponible | No disponible | No disponible | Control negativo (layout incompatible) |

No se dispone de datos suficientes para comparar con modelos de la misma categoria en parametros, contexto o benchmarks.

## Limitaciones y advertencias

- **No es un checkpoint**: no se distribuyen pesos, tablas Engram, kernels, imagenes de contenedor ni caches.
- **Estado experimental**: primer informe publicado el 2026-11-23, sin ensayo de instalacion limpia.
- **Componentes no probados end-to-end**: el constructor de cache portable, el lanzador y el adaptador de swap solo se han probado con stubs y dry-runs.
- **Mediciones no controladas**: seis peticiones por conjunto, sin comparacion de idiomas rigurosa.
- **Riesgo operativo**: no ejecutar start ni prepare sobre una instalacion ocupada; gestionan otros recursos.
- **Build ID estricto**: una build distinta no es sustituto directo.
- **Sin datos de sesgos, alucinacion ni limitaciones de contexto/idioma** del modelo base.
- **Licencia MIT** para el repositorio, pero sin aclaracion sobre el uso comercial del pack de pesos de terceros.
- El control negativo se detiene en `layers.10.attn.wo_b`; un encaje positivo no prueba equivalencia numerica ni memoria suficiente para servir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lucastca/DeepSeek-V4.1-Flash-1017-FRANKENSTEIN-EXL3-2.9bpw-UNCENSORED-TensorFold-2xSpark
- Pack EXL3 de Neko: https://huggingface.co/neko-legends/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED-4xSpark/tree/019a317f05183b6e8592c49faf7bfda161abe71e
- Fuente pinneada MiaAI-Lab: https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-1017-2x-DGX-Sparks/blob/370daf0cc38f348516a98ebab38f6053858eab1f/README.md
- Configuracion: https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-1017-2x-DGX-Sparks/blob/370daf0cc38f348516a98ebab38f6053858eab1f/scripts/config.sh
- Prepare: https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-1017-2x-DGX-Sparks/blob/370daf0cc38f348516a98ebab38f6053858eab1f/scripts/prepare.sh#L60-L99
- Node helpers: https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-1017-2x-DGX-Sparks/blob/370daf0cc38f348516a98ebab38f6053858eab1f/scripts/nodes.sh
- Start: https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-1017-2x-DGX-Sparks/blob/370daf0cc38f348516a98ebab38f6053858eab1f/start.sh
- Dockerfile: https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-1017-2x-DGX-Sparks/blob/370daf0cc38f348516a98ebab38f6053858eab1f/zig/Dockerfile
- Engine checkout TensorFold: https://github.com/bertholomus/TensorFold/tree/629c524a0ea57512a5342abb498d1b7c25353343
- Tools checkout TensorFold: https://github.com/bertholomus/TensorFold/tree/59402086381a42c74d53053443224eec2790b4c5
