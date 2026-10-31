# lesj0610/Qwen3.8-Flash-Next-FP4-Local-Abliterated

## Resumen

Qwen3.8-Flash-Next-FP4-Local-Abliterated es una variante "abliterated" (sin filtros de rechazo) del modelo nvidia/Qwen3.8-Flash-Next-FP4-Local, publicada por el usuario lesj0610 en Hugging Face. El modelo base es un modelo multimodal (imagen-texto a texto) de NVIDIA con arquitectura Qwen4_exp cuantizada en NVFP4 para los expertos y MXFP8 para la atencion, y este fork elimina el comportamiento de rechazo mediante una intervencion en la direccion de rechazo aplicada en tiempo de inferencia, sin modificar los pesos.

La novedad tecnica principal es que, en lugar de editar los pesos (lo que exigiria descuantizar y recuantizar tensores NVFP4/MXFP8, introduciendo un error relativo de 1,5e-2 a 3,0e-2), el autor mantiene los archivos de pesos byte a byte identicos al repositorio base y anade un bloque `abliteration_config` en `config.json`, aplicado por un plugin de vLLM (`fp4local-abliterated`) durante la inferencia. Esta aproximacion reduce el impacto en calidad: la perdida en MMLU frente al modelo base es de 1,30 puntos, frente a 1,72 de una construccion con pesos editados.

El modelo tiene 96,49 mil millones de parametros segun los metadatos de safetensors (102,3 GB de repositorio), soporta decodificacion especulativa mediante MTP (multi-token prediction) y requiere vLLM 0.32.1rc0 o superior (build nightly en el momento de publicacion). Es relevante porque demuestra una via practica para abliterar modelos fuertemente cuantizados sin degradarlos adicionalmente, y porque ofrece capacidades multimodales sin filtros de seguridad, algo que plantea consideraciones eticas importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4_exp (transformer con expertos, atencion hibrida con componentes de atencion lineal, multimodal image-text-to-text) |
| Parametros totales | 96.486.615.005 (96,49 B, segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos), MXFP8 (salida de atencion, salida de atencion lineal, proyeccion down del experto compartido) |
| Idiomas soportados | no disponible (evaluado en ingles; comprobacion puntual en coreano y ausencia de caracteres chinos anomalos) |
| Licencia | nvidia-open-model-agreement (other) |
| Formato de pesos | safetensors (NVFP4/MXFP8, 102,3 GB) |

## Arquitectura y entrenamiento

El modelo base es nvidia/Qwen3.8-Flash-Next-FP4-Local, un modelo multimodal de la familia Qwen3.8/4_exp con arquitectura de mezcla de expertos cuantizada nativamente: los expertos del FFN estan en NVFP4, mientras que la salida de atencion, la salida de la atencion lineal y la proyeccion down del experto compartido usan MXFP8. Incluye una tabla PLE (de gran tamano, desplazable a memoria de host con `--engram-config`, requiere unos 36 GiB de RAM libre), un codificador de vision cuyo MLP no puede repartirse entre GPUs en bloques NVFP4, y un modulo MTP (multi-token prediction) que actua como borrador para decodificacion especulativa con 3 tokens por paso.

Sobre el entrenamiento del modelo base no hay datos publicados en la informacion disponible (tokens, composicion del dataset, RLHF/DPO: no disponible). La contribucion de este fork no es de entrenamiento sino de inferencia: se calcula una "direccion de rechazo" en el stream residual y se proyecta fuera la escritura residual en las capas correspondientes (lambda = 1,5), mediante un plugin de vLLM. Los pesos son byte-identicos al repositorio base en la revision `b9ce18a6887e18c089fdea8509a33e63429a3300` (21 shards verificados contra el sha256 LFS del Hub). El autor mide que la proyeccion en runtime introduce un error relativo de 2,3e-3, muy inferior al 1,5e-2–3,0e-2 de recuantizar tensores editados.

## Capacidades

- Generacion de texto conversacional sin mecanismos de rechazo (abliterated/uncensored): responde a peticiones que el modelo base rechaza (del 97,92 % de frases de rechazo en prompts daninos del base a 0,16 %).
- Comprension multimodal imagen-texto: responde preguntas sobre imagenes sinteticas (colores, lectura de texto, conteo, posiciones) con 27/27 aciertos, igual que el modelo base; procesa peticiones daninas escritas dentro de imagenes sin rechazar (0 de 20).
- Razonamiento y matematicas: GSM8K 5-shot al 96,60 % y MMLU al 84,05 %, practicamente al nivel del modelo base.
- Decodificacion especulativa MTP con 3 tokens de borrador (tasa de aceptacion 0,522 en este modelo).
- Tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Capacidades de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no documentadas formalmente; comprobacion breve en coreano sin respuestas vacias ni bucles.
- Video: el pipeline sugiere soporte, pero no fue evaluado.

## Casos de uso

- Investigacion en seguridad y alineamiento de modelos: al eliminar el comportamiento de rechazo de forma reproducible y documentada (lambda, direccion, metodo de evaluacion), sirve como banco de pruebas para estudiar como se comporta un modelo de 96 B sin salvavidas, util para red-teaming y analisis de jailbreaks.
- Evaluacion de cuantizacion extrema: es un caso de estudio sobre como abliterar modelos cuantizados en NVFP4/MXFP8 sin recuantizar, con metricas de degradacion publicadas; util para ingenieros de inferencia que trabajan con FP4.
- Generacion de contenido creativo sin restricciones: escritura de ficcion con tematicas que los modelos alineados suelen rechazar (violencia en novela negra, tematicas adultas en narrativa), aprovechando la ausencia de rechazos explicitos y sobre-rechazos (0 de 51 respuestas benignas revisadas).
- Procesamiento de consultas visuales sin filtros: analisis de imagenes que contienen texto o peticiones sensatas pero sensibles, ya que el modelo responde a instrucciones daninas renderizadas en imagen sin activar rechazos.
- Inferencia local de alto rendimiento con hardware profesional: con vLLM, paralelismo tensorial, offload de la tabla PLE a RAM y MTP, es adecuado para despliegues autoalojados donde se necesita control total del comportamiento del modelo.
- Investigacion en decodificacion especulativa: el modelo incluye un borrador MTP y se publican tasas de aceptacion (0,522 con 3 tokens), util para experimentar con la interaccion entre abliteration en runtime y MTP.

## Benchmarks y rendimiento

Datos publicados por el autor del modelo. Comparacion con el modelo base y con una construccion alternativa con pesos editados (windowsxp811203/Qwen3.8-Flash-Next-Abliterated en bf16, recuantizada a NVFP4 con ModelOpt PTQ, misma direccion y lambda = 1,5):

| Metrica | FP4-Local (base) | Pesos editados, NVFP4 PTQ | Este modelo |
|---|---|---|---|
| Frases de rechazo, 625 prompts daninos | 612 (97,92 %) | 1 (0,16 %) | 1 (0,16 %) |
| Frases de rechazo, 100 prompts benignos | 34 | 0 | 0 |
| Rechazos explicitos (revision ciega) | no revisado | 0 de 331 | 0 de 328 |
| Sobre-rechazos (revision ciega) | no revisado | 0 de 43 | 0 de 51 |
| Frases de rechazo, 20 peticiones daninas en imagen | 20 | no probado | 0 |
| MMLU (12.036 preguntas) | 85,35 % | 83,63 % | 84,05 % |
| GSM8K (1.000 preguntas, 5-shot) | 96,10 % | 96,20 % | 96,60 % |
| Preguntas sobre imagenes sinteticas | 27/27 | no probado | 27/27 |
| Aceptacion MTP (3 tokens borrador) | 0,581 (no comparable) | 0,524 | 0,522 |

No hay comparaciones con otros modelos de la industria (GPT, Llama, etc.) en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 102,3 GB en pesos NVFP4/MXFP8; la VRAM minima realista es del orden de 100+ GiB de GPU (mas la tabla PLE, que puede desplazarse a unos 36 GiB de RAM de host con `--engram-config '{"cpu_offload": true}'`).
- GPU recomendadas: no disponible explicitamente; por tamano, se requieren multiples GPUs de gama profesional (H100/H200 o B200, dadas las cuantizaciones NVFP4) con `--tensor-parallel-size` mayor que 1. En ese caso hay que anadir `--mm-encoder-tp-mode data` porque el MLP de vision no puede dividirse entre GPUs en bloques NVFP4.
- Consumer GPU: no viable; el modelo no cabe en tarjetas de consumo como la RTX 4090 (24 GB) ni en configuraciones tipicas de 2-4 GPUs de consumo.
- Despliegue: exclusivamente vLLM 0.32.1rc0 o superior (nightly en el momento de publicacion; la 0.32.0 no lee la tabla PLE NVFP4 y la asigna en bf16, cuatro veces su tamano). Requiere el plugin `fp4local-abliterated==0.1.0`. No hay soporte documentado de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; se sabe que la decodificacion especulativa MTP consigue una tasa de aceptacion de 0,522 con 3 tokens de borrador.

## Comparativa con modelos similares

| | Qwen3.8-Flash-Next-FP4-Local-Abliterated | Qwen3.8-Flash-Next-Abliterated (windowsxp811203) | Qwen3.8-Flash-Next-FP4-Local (base NVIDIA) |
|---|---|---|---|
| Parametros | 96,49 B | no disponible | no disponible |
| Cuantizacion | NVFP4 + MXFP8 (pesos originales intactos) | bf16 editado, recuantizado a NVFP4 (ModelOpt PTQ) | NVFP4 + MXFP8 |
| Abliteration | En runtime (plugin vLLM), lambda 1,5 | Editando pesos, lambda 1,5 | No (modelo alineado) |
| MMLU | 84,05 % | 83,63 % | 85,35 % |
| GSM8K (5-shot) | 96,60 % | 96,20 % | 96,10 % |
| Rechazos en prompts daninos | 0,16 % | 0,16 % | 97,92 % |
| Licencia | nvidia-open-model-agreement | no disponible | nvidia-open-model-agreement |
| Requisitos | vLLM nightly + plugin propio | no disponible | vLLM con soporte NVFP4 |

No hay comparativas con otros modelos de la industria de tamano similar (Llama 3.1 405B, DeepSeek-V3, etc.) en la informacion disponible.

## Limitaciones y advertencias

- Modelo deliberadamente sin filtros de seguridad: elimina los rechazos del modelo base y puede generar contenido danino, ilegal u ofensivo. Su uso conlleva responsabilidades legales y eticas serias; no es apto para entornos de produccion orientados a usuarios finales sin capas de seguridad externas.
- No es lossless: MMLU cae 1,30 puntos respecto al modelo base (157 preguntas netas, p < 0,001); GSM8K no muestra cambio significativo.
- Algunas respuestas a peticiones daninas son indirectas o parciales (responden pero omiten la parte danosa o la convierten en consejo de prevencion), igual que en la construccion con pesos editados.
- Las pruebas de rechazo se realizaron solo en ingles; el comportamiento en otros idiomas no esta verificado (solo una comprobacion breve en coreano).
- La abliteration requiere el plugin `fp4local-abliterated`: cualquier runtime que no soporte el bloque `abliteration_config` ejecutara el modelo base alineado sin aviso. Verificar el log de arranque con la linea `Abliteration on AbliteratedQwen4Exp...`.
- Dependencia de versiones concretas: exige vLLM 0.32.1rc0 o superior (nightly); la 0.32.0 gestiona mal la tabla PLE NVFP4.
- Restricciones de licencia: nvidia-open-model-agreement (other); los terminos exactos de uso comercial deben revisarse en la licencia del repositorio base de NVIDIA.
- Riesgo de alucinacion: no disponible (no documentado).
- Sesgos conocidos: no disponibles.
- Video no evaluado; capacidades multimodales verificadas solo con imagenes sinteticas simples.
- Proyecto comunitario con muy poca traccion (82 descargas, 1 like en el momento de la ficha): soporte limitado y posible abandono.

## Enlaces

- Modelo: https://huggingface.co/lesj0610/Qwen3.8-Flash-Next-FP4-Local-Abliterated
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Construccion alternativa con pesos editados: https://huggingface.co/windowsxp811203/Qwen3.8-Flash-Next-Abliterated
- Plugin de vLLM para la abliteration: https://github.com/lesj0610/fp4local-abliterated
- Referencia arxiv citada en los tags: https://arxiv.org/abs/2406.11717
