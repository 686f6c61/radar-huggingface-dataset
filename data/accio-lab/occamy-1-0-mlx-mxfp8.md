# Accio-Lab/occamy-1.0-MLX-mxfp8

## Resumen

Occamy-1.0-MLX-mxfp8 es una version cuantizada del modelo Accio-Lab/occamy-1.0, un modelo de lenguaje de 34.660.608.768 parametros (34,66 mil millones) con arquitectura de mezcla de expertos (MoE) del tipo Qwen3.5, publicado por el laboratorio Accio-Lab. Este checkpoint concreto no es un modelo nuevo: es el artefacto de pesos en formato MLX nativo con cuantizacion MXFP8 de 8 bits y group size 32, obtenido directamente desde los pesos BF16 del modelo base, con el objetivo de ejecutar inferencia local en hardware Apple Silicon mediante la libreria mlx-lm.

El modelo resuelve el problema del despliegue local de un LLM de ~35B en equipos con memoria unificada, reduciendo el peso de los archivos a 35,75 GB (33,291 GiB) mediante cuantizacion de 8 bits. Se distribuye bajo licencia Apache 2.0 y solo procesa texto: la vision y el MTP (multi-token prediction) viven en checkpoints separados. La familia MLX completa incluye variantes de 8, 6, 5, 4 y 3 bits, ademas de mxfp4 y nvfp4.

Es relevante porque es un release candidato que acompana al informe tecnico "Occamy-1.0: Open Pareto-frontier 35B Intelligence for Co-work" (arXiv 2609.11977), pero con una advertencia explicita del autor: la aceptacion en Apple Metal esta pendiente. Las comprobaciones realizadas cubren Linux con MLX CUDA 12 sobre NVIDIA B200, mientras que la inferencia y el rendimiento en Apple Silicon permanecen sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo Qwen3.5 (tag `qwen3_5_moe`) |
| Parametros totales | 34.660.608.768 (34,66 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 nativo de MLX, 8 bits, group size 32 (pesos); puertas de router y de expertos compartidos en affine 8 bits, group size 64 |
| Idiomas soportados | no disponible (las pruebas incluyen instrucciones en ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX nativo (libreria `mlx`, `mlx-lm`) |
| Tamano de los pesos | 35.745.712.868 bytes (35,75 GB / 33,291 GiB) |
| Modelo base | Accio-Lab/occamy-1.0 (revision `8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8`) |
| Relacion con el base | cuantizado (`base_model_relation: quantized`) |
| Entradas | solo texto; vision y MTP son checkpoints separados |
| Versionado de herramientas | mlx 0.32.2, mlx-lm 0.31.3, transformers 5.8.1 |
| Fecha de creacion | 2026-10-02 |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) etiquetada como `qwen3_5_moe`, con 34,66 mil millones de parametros totales. El numero de parametros activos por token no se declara en la informacion disponible. El checkpoint distribuye los expertos en 30.720 tensores independientes que, durante el proceso de conversion, se apilan en orden numerico en 120 grupos mediante un adaptador sin perdida (`layout_adapter.py`), tras lo cual se invoca una unica vez el sanitizador oficial. La conversion a MXFP8 usa exclusivamente APIs nativas de MLX y no parte de pesos ya recuantizados; los pesos exportados se recargan directamente con `mlx-lm` estandar, sin necesidad de adaptador. En total se cuantizaron 512 modulos.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO en el modelo base. Las activaciones de inferencia se mantienen en BF16 y las puertas de router y expertos compartidos usan una cuantizacion affine de 8 bits con group size 64, distinta de la de los pesos. La validacion de conversion cubre todos los valores flotantes almacenados, la desquantizacion nativa de cada fila de los 512 modulos cuantizados, la recarga estricta con la libreria estandar y logits de inferencia finitos sobre el vocabulario completo. Tambien se ejecutaron sondas de los kernels SwitchLinear/MoE nativos en CPU y CUDA para los cuatro modos.

## Capacidades

- Generacion de texto conversacional y de proposito general, en modo texto unicamente.
- Razonamiento aritmetico basico: una de las pruebas autoradas cubre operaciones aritmeticas y paso 8/8 junto al resto de fixtures.
- Generacion de JSON estructurado: validado en las pruebas codiciosas con cache.
- Memoria de conversacion multi-turno: incluida como fixture especifica dentro de las 8 pruebas autoradas.
- Instrucciones en ingles y chino: los ocho fixtures codiciosos cubren ambos idiomas.
- Modo thinking opcional: la plantilla de chat acepta el parametro `enable_thinking` (desactivado por defecto en los ejemplos de la model card).
- Servicio de API local compatible con OpenAI mediante `mlx_lm.server` (endpoint `/v1/chat/completions`).
- Tool calling y uso como agente: no verificados. La model card indica explicitamente que la aceptacion de integracion de tool-call y agentes queda pendiente.
- Vision y audio: no soportados en este checkpoint (solo texto).
- Capacidades multilingues adicionales: no disponibles.

## Casos de uso

- Asistente local en Apple Silicon con memoria unificada: cargando el checkpoint con `mlx_lm.load` se puede mantener un asistente conversacional totalmente offline, sin enviar datos a terceros, aprovechando que el artefacto pesa 35,75 GB. Advertencia: el autor no ha verificado el comportamiento en Metal.
- Generacion de JSON para pipelines internos: las pruebas autoradas incluyen un fixture de salida JSON, lo que lo hace apto para tareas de extraccion estructurada en entornos donde el esquema de salida es fijo y verificable.
- Servidor de inferencia compatible con OpenAI en red local: `mlx_lm.server` expone `/v1/chat/completions` en `127.0.0.1:8000`, lo que permite sustituir un cliente OpenAI por este endpoint sin cambiar el codigo de aplicacion.
- Prototipado de cuantizacion y evaluacion de degradacion: la model card publica una comparativa emparejada BF16 frente a MXFP8 sobre un subconjunto retenido de WikiText, util para decidir entre variantes de 8, 6, 5, 4 y 3 bits de la misma familia.
- Conversaciones multi-turno con estado de sesion: el fixture de memoria de conversacion valida que el modelo mantiene referencias previas; util para asistentes de documentacion tecnica o soporte interno de baja concurrencia.
- Tareas de computo aritmetico y comprobaciones rapidas: los ejemplos de la model card usan `Compute 2+2` como prueba de humo para verificar que la instalacion y la plantilla de chat funcionan.
- Evaluacion comparativa de formatos MLX frente a NVIDIA NVFP4 o GGUF: dado que la familia incluye exportaciones separadas (MLX nvfp4 y el checkpoint NVIDIA NVFP4), sirve para comparar protocolos de runtime siempre que se respete que las metricas GGUF usan un protocolo distinto.
- Laboratorio de investigacion en Linux sobre GPU: el artefacto paso comprobaciones con MLX CUDA 12 en NVIDIA B200, por lo que puede usarse como banco de pruebas de kernels MoE cuantizados.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son una comparativa de perplejidad emparejada dentro del scorer nativo de MLX:

| Prueba nativa MLX emparejada | Perplejidad en subconjunto retenido de WikiText |
|---|---|
| BF16 (modelo base) | 8,3074 |
| MLX MXFP8 | 8,3866 |

Condiciones declaradas por el autor: mismo tokenizador, 8.192 IDs de token, 16 fragmentos independientes con contexto 512 y 4.096 tokens puntuados. Cada fragmento tiene un prefijo de 256 tokens no puntuados y estado de modelo nuevo.

Advertencias del propio autor: esta prueba pequena no establece la calidad en benchmarks completos; los numeros solo son comparables dentro del scorer nativo de MLX, y los resultados GGUF usan un protocolo de runtime reportado por separado.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- Peso de los archivos: 35,75 GB (33,291 GiB). El autor advierte expresamente que el tamano de pesos no determina el uso de memoria en tiempo de ejecucion ni la velocidad.
- Activaciones de inferencia en BF16: la memoria en runtime sera superior al tamano de los pesos cuantizados.
- VRAM medida: no disponible. No hay cifras publicadas de memoria pico durante la inferencia.
- Apple Silicon: es el destino previsto de la libreria MLX, pero la inferencia y el rendimiento en Apple Silicon estan sin verificar ("Mac Metal acceptance is pending").
- Linux con GPU NVIDIA: las comprobaciones se ejecutaron con MLX CUDA 12 sobre NVIDIA B200. La conversion se hizo con kernels nativos de CPU.
- GPU de consumo: no disponible. No hay datos que permitan confirmar que quepa en una RTX 4090 u otras GPU de gama de consumo.
- Despliegue: `mlx-lm` 0.31.3 sobre `mlx` 0.32.2 y `transformers` 5.8.1, mediante `mlx_lm.load` / `generate` o `mlx_lm.server` con plantilla de chat configurable.
- Latencia y throughput: no disponibles. El autor no reclama ninguna posicion en rankings de velocidad y senala que el throughput no se probo en este lote.
- Otros formatos: al ser pesos MLX nativos, no es directamente compatible con llama.cpp, Ollama, vLLM o TGI sin conversion adicional.
- Diagnostico sin hardware: el Space "Occamy-Explorer" es un explorador de checkpoints sobre CPU que aporta comandos, pero la inferencia se ejecuta en el hardware del usuario.

## Comparativa con modelos similares

No hay datos publicados de modelos externos comparables en la informacion disponible. La comparacion posible se limita a la propia familia Occamy-1.0, donde varios campos no estan declarados:

| Modelo | Formato / cuantizacion | Tamano de pesos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| occamy-1.0 (base) | BF16 | no disponible | no disponible | Apache 2.0 | Referencia de calidad: PPL 8,3074 en el test emparejado |
| occamy-1.0-MLX-mxfp8 (este) | MLX mxfp8, 8 bits, group 32 | 35,75 GB | no disponible | Apache 2.0 | PPL 8,3866; aceptacion en Metal pendiente |
| occamy-1.0-MLX-8bit | MLX affine 8 bits | no disponible | no disponible | Apache 2.0 | Variante del mismo linaje |
| occamy-1.0-MLX-6bit / 5bit | MLX, menor precision | no disponible | no disponible | Apache 2.0 | Compromiso calidad / tamano sin datos publicos |
| occamy-1.0-MLX-4bit / 3bit | MLX, menor precision | no disponible | no disponible | Apache 2.0 | Compromiso calidad / tamano sin datos publicos |
| occamy-1.0-MLX-mxfp4 | MLX mxfp4 | no disponible | no disponible | Apache 2.0 | Exportacion separada |
| occamy-1.0-MLX-nvfp4 | MLX nvfp4 | no disponible | no disponible | Apache 2.0 | Distinto del checkpoint NVIDIA NVFP4 |
| occamy-1.0-NVFP4 | NVFP4 (NVIDIA) | no disponible | no disponible | Apache 2.0 | Exportacion para el ecosistema NVIDIA |
| occamy-1.0 GGUF | GGUF | no disponible | no disponible | Apache 2.0 | Metricas con protocolo de runtime distinto; no comparable con el scorer MLX |

## Limitaciones y advertencias

- Release candidato: el autor declara que la aceptacion en Apple Metal esta pendiente y que la inferencia y el rendimiento en Apple Silicon siguen sin verificar.
- Cobertura de validacion parcial: no se probaron en este lote Metal, contexto largo, codigo, herramientas (tools), vision ni throughput.
- Tool calling y uso como agente sin verificar: no hay aceptacion publicada para integraciones de funciones ni flujos multi-paso.
- Solo texto: la vision y el MTP residen en checkpoints distintos; no se pueden usar desde este artefacto.
- Idiomas: no se declara soporte oficial de idiomas. Las pruebas autoradas solo cubren ingles y chino, por lo que el comportamiento en castellano no esta evaluado.
- Degradacion por cuantizacion: la perplejidad sube de 8,3074 (BF16) a 8,3866 (MXFP8) en el test emparejado del propio autor.
- Comparabilidad limitada de las metricas: los valores de PPL solo son validos dentro del scorer nativo de MLX; los resultados de la variante GGUF usan un protocolo distinto y no deben compararse directamente.
- Benchmarking insuficiente: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de evaluaciones de sesgo o alucinacion, por lo que el riesgo de alucinacion no esta cuantificado.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en produccion se recomienda verificacion externa de las salidas.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo.
- Licencia: Apache 2.0, lo que permite uso comercial, pero el autor solicita citar el informe original (Chen et al., 2026, arXiv 2609.11977) al utilizar el modelo.
- Madurez del repositorio: 0 descargas y 0 me gusta en el momento de la consulta, sin validacion independiente de la comunidad.
- Compatibilidad: los pesos son MLX nativos, de modo que herramientas como llama.cpp, Ollama, vLLM o TGI no los cargan sin una conversion previa.
- Memoria en runtime desconocida: el tamano de los pesos no establece el consumo real de memoria; con activaciones BF16 el pico puede ser notablemente superior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp8
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Revision del modelo base usada en la conversion: https://huggingface.co/Accio-Lab/occamy-1.0/tree/8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8
- Coleccion Occamy-1.0: https://huggingface.co/collections/Accio-Lab/occamy-10-6ac00729659e8a86ec11e216
- Coleccion MLX de Occamy-1.0: https://huggingface.co/collections/Accio-Lab/occamy-10-mlx-6ac0072a7c1cdbc5e418e90b
- Explorador de checkpoints (Space): https://huggingface.co/spaces/Accio-Lab/Occamy-Explorer
- Pagina del proyecto: https://accio-lab.github.io/occamy/
- Paper: https://arxiv.org/abs/2609.11977
- Variante MLX 8bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit
- Variante MLX 6bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-6bit
- Variante MLX 5bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-5bit
- Variante MLX 4bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit
- Variante MLX 3bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-3bit
- Variante MLX mxfp4: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp4
- Variante MLX nvfp4: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-nvfp4
- Checkpoint NVIDIA NVFP4: https://huggingface.co/Accio-Lab/occamy-1.0-NVFP4
- Documentacion de calidad y reproduccion: `quality/README.md`
- Resumen de validacion: `validation_summary.json`
- Resultados de artefacto e inferencia: `validation.json`
- Resultados HTTP: `api_validation.json`
- Recibo de conversion: `conversion.json`
- Hashes de pesos: `SHA256SUMS`
- Adaptador de layout: `layout_adapter.py`
- Licencia: `LICENSE`
- Logo del proyecto: https://accio-lab.github.io/occamy/brand/accio.svg
