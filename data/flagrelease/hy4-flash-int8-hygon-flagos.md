# FlagRelease/Hy4-flash-INT8-hygon-FlagOS

## Resumen

Hy4 Flash es un modelo multimodal de lenguaje desarrollado por Tencent Hunyuan, publicado como pesos abiertos bajo licencia Apache 2.0. El repositorio `FlagRelease/Hy4-flash-INT8-hygon-FlagOS` es una distribucion cuantizada a INT8 (8 bits) preparada por la comunidad Zhongzhi FlagOS para su ejecucion sobre aceleradores Hygon DCU, con adaptacion Day 0 a traves del stack unificado FlagOS. El modelo acepta entradas de texto e imagen y genera texto.

Con aproximadamente 220.000 millones de parametros totales (incluyendo unos 64.000 millones de parametros Engram) y unos 12.000 millones activados por token, Hy4 Flash emplea una arquitectura hibrida de atencion, Latent MoE y Engram. Su ventana de contexto maxima alcanza 1.000.000 de tokens, y el modelo esta disenado para cargas de trabajo de busqueda profunda, procesamiento de documentos, generacion de presentaciones y Computer Use en escenarios de oficina.

La relevancia de esta publicacion concreta reside en su caracter de adaptacion cross-chip: el mismo modelo se distribuye para nueve fabricantes de aceleradores (T-Head, NVIDIA, Huawei Ascend, Hygon, Kunlunxin, Muxi, Moore Threads, TsingMicro e Iluvatar CoreX) mediante FlagOS. Segun la model card, la build de FlagOS sobre NVIDIA H100 logra hasta un 35,9 % mas de throughput de salida y hasta un 29,1 % menos de latencia hasta el primer token frente al stack nativo de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion hibrida, Latent MoE y Engram |
| Parametros totales | 220.251.201.958 (~220 B) |
| Parametros activos | ~12 B por token (MoE); ~64 B corresponden a parametros Engram |
| Longitud de contexto | 1.000.000 de tokens (maximo nativo); 131.072 tokens en la configuracion de servicio documentada |
| Tipos de cuantizacion | INT8 (W8A8) mediante compressed-tensors; pesos en 8 bits |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) |

## Arquitectura y entrenamiento

Hy4 Flash combina tres componentes arquitectonicos: atencion hibrida (mezcla de mecanismos de atencion que reduce la huella de KV Cache), Latent MoE (mezcla de expertos con representaciones latentes) y Engram, un componente al que se atribuyen aproximadamente 64.000 millones de parametros del total. El modelo activa unos 12.000 millones de parametros por token, lo que lo situa en la categoria de modelos dispersos de gran escala con coste de inferencia contenido. Segun la model card, la huella de KV Cache es solo una sexta parte de la de Hy4.

El modelo es nativamente multimodal: procesa texto e imagen como entrada y produce texto como salida. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. La innovacion tecnica destacada en la documentacion es la portabilidad cross-chip mediante FlagOS 2.2, con optimizaciones de rendimiento especificas por hardware y validacion de consistencia frente a los stacks nativos de cada fabricante.

## Capacidades

- Generacion de texto y razonamiento en dominios como matematicas y conocimiento general (resultados documentados en Math-500 y GPQA Diamond).
- Comprension de imagenes: entrada multimodal de texto e imagen con salida de texto, invocable mediante `image_url` en la API compatible con OpenAI.
- Procesamiento de documentos y busqueda profunda (deep search), segun los casos de uso declarados por el autor.
- Generacion de presentaciones (PPT) para escenarios de oficina.
- Computer Use: interaccion con entornos de escritorio y aplicaciones.
- Ventana de contexto de hasta 1.000.000 de tokens, adecuada para documentos extensos y conversaciones de multiples turnos.
- Soporte bilingue chino-ingles.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`) con parser de razonamiento `hy_v4`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Busqueda profunda sobre corpus documentales: el modelo puede recorrer y sintetizar informacion de documentos extensos gracias a su contexto de hasta 1.000.000 de tokens, reduciendo la necesidad de fragmentacion y recuperacion externa.
- Procesamiento de documentos de oficina: extraccion, resumen y reescritura de informes, contratos o actas con entrada de imagen (escaneos) y salida de texto, en un unico paso multimodal.
- Generacion automatica de presentaciones: a partir de un brief textual o de documentos fuente, el modelo produce el contenido estructurado de las diapositivas, aprovechando su orientacion declarada a PPT generation.
- Computer Use y automatizacion de escritorio: el modelo puede interpretar capturas de pantalla y generar instrucciones de accion para agentes que operan interfaces, encajando en flujos de RPA de oficina.
- Asistentes conversacionales de atencion al cliente en chino e ingles: conversaciones multi-turno con contexto largo que evitan perder el hilo en sesiones extensas.
- Despliegue en infraestructura nacional o soberana: la adaptacion a Hygon DCU y otros ocho fabricantes permite ejecutar el modelo en centros de datos sin GPUs NVIDIA, usando la imagen de contenedor FlagOS-Hygon y vLLM con tensor-parallel 8.
- Evaluacion y prototipado de modelos multimodales a gran escala: investigadores pueden desplegar la variante INT8 en un nodo de 8 aceleradores Hygon y validar resultados frente a la build nativa de NVIDIA con los mismos benchmarks.

## Benchmarks y rendimiento

| Metrica | HY4-flash-Nvidia-Origin | HY4-flash-Hygon-FlagOS |
|---|---|---|
| Math-500 | 96 | 98,2 |
| GPQA Diamond | 92,42 | 91 |
| MMBench | 92,6 | En evaluacion |
| MMStar | 80,93 | En evaluacion |
| WorkIndex (interno Tencent Hunyuan) | Hy4 Preview: 39,7 | Hy4 Flash: 42,1 |

Segun la model card, la build de FlagOS sobre NVIDIA H100 alcanza hasta un 35,9 % mas de throughput de salida y hasta un 29,1 % menos de latencia hasta el primer token que el stack nativo de NVIDIA. No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks de codigo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 288,6 GB en pesos INT8; en la configuracion documentada se usa tensor-parallel 8 sobre 8 aceleradores Hygon DCU BW1101 de 143,98 GiB cada uno (147.440 MiB), con `--gpu-memory-utilization 0.88`. En la practica, el modelo requiere un nodo de 8 aceleradores de gran capacidad de memoria.
- GPU/aceleradores recomendados: Hygon DCU BW1101 (8 unidades, configuracion validada); NVIDIA H100 (build FlagOS con mejoras de rendimiento documentadas); Huawei Ascend, Kunlunxin, Muxi, Moore Threads, T-Head, TsingMicro e Iluvatar CoreX mediante adaptacion FlagOS.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090, etc.) dado el tamano de pesos y el numero de parametros activos; se requiere un nodo multi-acelerador de clase centro de datos.
- Opciones de despliegue: vLLM (version 0.24.0 en la imagen FlagOS, backend MoE triton, `--distributed-executor-backend mp`), imagen Docker `harbor.baai.ac.cn/flagrelease-public/hy4-flash-hygon001-...`, descarga de pesos via ModelScope. Soporte de llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: mejoras relativas documentadas frente al stack nativo de NVIDIA (hasta +35,9 % de throughput de salida y hasta -29,1 % de TTFT sobre H100). Valores absolutos de latencia y throughput: no disponibles.
- Configuracion de servicio de referencia: `--max-model-len 131072`, `--max-num-seqs 64`, `--max-num-batched-tokens 8192`, `--tensor-parallel-size 8`, `--dtype bfloat16`, `--reasoning-parser hy_v4`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Hy4 Flash (esta ficha) | ~220 B | ~12 B | 1.000.000 tokens | Apache 2.0 | Multimodal texto+imagen; adaptacion cross-chip FlagOS |
| Hy4 Preview | No disponible | No disponible | No disponible | No disponible | Referencia interna de Tencent Hunyuan; WorkIndex 39,7 frente a 42,1 de Hy4 Flash |
| Hy4 | No disponible | No disponible | No disponible | No disponible | Generacion anterior; KV Cache de Hy4 Flash es 1/6 de la suya |

No se dispone en la informacion proporcionada de datos de parametros, contexto o licencia de modelos comparables de otros fabricantes de la misma categoria (MoE multimodal de ~200 B con contexto de un millon de tokens).

## Limitaciones y advertencias

- Idiomas: solo chino e ingles declarados; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion: no se documentan tasas especificas; como modelo generativo de gran escala, es susceptible de producir contenido factualmente incorrecto, especialmente en tareas de busqueda profunda y Computer Use donde la verificacion externa es critica.
- Sesgos: no se publica informacion sobre sesgos conocidos ni sobre el proceso de alineacion (RLHF/DPO) en la informacion disponible.
- Contexto: aunque el modelo soporta 1.000.000 de tokens, la configuracion de servicio documentada limita `--max-model-len` a 131.072 tokens; usar el maximo nativo exige ajustar parametros y disponer de memoria suficiente para el KV Cache.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base de Tencent Hunyuan y de la imagen de contenedor FlagOS distribuidas por terceros.
- Dependencia de hardware especifico: esta variante esta empaquetada para Hygon DCU con DTK 26.04 y driver 6.4.0-V1.7.0c; no es portable directamente a otras plataformas sin la build FlagOS correspondiente.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y varios benchmarks (MMBench, MMStar) figuran como "Evaluating"; tratar los resultados como preliminares.
- Resultados de benchmarks: las cifras de Math-500 y GPQA Diamond corresponden a la model card del autor y no han sido verificadas de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Hy4-flash-INT8-hygon-FlagOS
- AnythingLLM (integracion cliente): https://anythingllm.com/
- Imagen Docker FlagOS-Hygon: `harbor.baai.ac.cn/flagrelease-public/hy4-flash-hygon001-gems5.5.0-tree0.7.0-cxnone-plugin0.3.0-gemsvllm0.3.0-vllm0.24.0-cp310-pt210-dtk2604-x64-6.4.0-v1.7.0c:202611191354`
- Descarga de pesos via ModelScope: `modelscope download --model FlagRelease/Hy4-flash-INT8-hygon-FlagOS`
- Paper, blog o repositorio de Tencent Hunyuan sobre Hy4 Flash: no disponible en la informacion proporcionada.
