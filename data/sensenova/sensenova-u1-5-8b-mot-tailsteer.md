# sensenova/SenseNova-U1.5-8B-MoT-TailSteer

## Resumen

SenseNova-U1.5-8B-MoT-TailSteer es un ajuste fino (finetune) del modelo multimodal SenseNova-U1.5-8B-MoT desarrollado por SenseNova (OpenSenseNova). Se trata de un modelo any-to-any orientado a generacion y edicion de imagenes, que acepta texto e imagenes como entrada y produce imagenes como salida. El objetivo concreto de este checkpoint es reducir la deriva acumulativa que se produce cuando se encadenan ediciones sucesivas sobre la propia salida del modelo: cada edicion se convierte en la entrada de la siguiente y los artefactos se amplifican.

TailSteer se presenta como una etapa final de entrenamiento que conserva en gran medida las capacidades aprendidas del modelo base (generacion text-to-image y edicion de un solo turno) mientras estabiliza las ediciones repetidas. Segun la model card, en el benchmark Add & Preserve mejora la preservacion de la region no editada en el turno 10 con +6,99 dB de PSNR y un 31,3% menos de LPIPS respecto al modelo base.

El checkpoint mantiene la misma arquitectura, el mismo layout oficial y la misma API de carga que el modelo base, por lo que sustituye directamente al ID original sin adaptadores, fusiones ni modulos de inferencia adicionales. Los pesos suman 17.532.854.464 parametros en safetensors (pese a la denominacion comercial "8B"), con un repositorio de 35,1 GB y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal any-to-any, familia SenseNova-U1.5; tag MoT en el nombre) |
| Parametros totales | 17.532.854.464 (17,53 mil millones, segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (la model card incluye evaluaciones en ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | any-to-any |
| Libreria | transformers (custom_code) |
| Modelo base | sensenova/SenseNova-U1.5-8B-MoT |
| Tipo de ajuste | finetune (TailSteer) |
| Tamano del repositorio | 35,1 GB |
| Descargas / likes | 391 / 11 |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base SenseNova-U1.5-8B-MoT (el sufijo "MoT" aparece en el nombre, pero la model card no describe su significado ni la estructura de capas). Lo que si se especifica es que TailSteer no modifica la arquitectura: mantiene el mismo layout oficial, la misma API de carga y el mismo entorno de inferencia que el modelo base, y se distribuye como pesos completos, no como adaptador.

El entrenamiento de TailSteer se describe como una etapa final que aprende a partir de las propias trayectorias de denoising del editor, con el principio de "preservar la dinamica temprana y dirigir la cola de la trayectoria" (preserve early dynamics; steer the trajectory tail). El objetivo es reducir la deriva que se acumula cuando la salida de cada edicion alimenta la siguiente. En inferencia se usa TailSteer a lo largo de toda la trayectoria de denoising original, sin necesidad de conmutar de modelo ni aplicar mascaras de preservacion. Los datos de entrenamiento se publican en el dataset TailSteer-Source, y el benchmark de evaluacion en Add & Preserve. No se especifican el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion text-to-image: produce imagenes a partir de prompts de texto con el mismo checkpoint.
- Edicion de imagen de un solo turno: modifica una imagen de entrada segun una instruccion textual (por ejemplo, cambiar el color de una prenda).
- Edicion multi-turno estabilizada: encadena ediciones sucesivas reutilizando la salida anterior como entrada, con menor acumulacion de artefactos que el modelo base.
- Edicion con multiples imagenes de referencia: acepta varias imagenes de entrada para introducir objetos en una escena existente.
- Preservacion de la region no editada: mantiene el fondo y los elementos no solicitados a lo largo de diez turnos, medido con PSNR, SSIM y LPIPS.
- Modelo any-to-any: pipeline declarado como any-to-any, con entradas de texto e imagen y salida de imagen.
- Integracion directa: compatible con el paquete oficial de inferencia de SenseNova-U1 sin cambios de codigo, solo sustituyendo el ID del modelo.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, audio, thinking mode ni soporte multilingue explicito mas alla de las evaluaciones en ingles y chino.

## Casos de uso

- Edicion iterativa de imagenes en estudio de diseno: un disenador aplica decenas de cambios sucesivos sobre una misma escena (iluminacion, objetos, materiales) pasando cada resultado como entrada del siguiente; TailSteer evita que el fondo y los elementos previos se degraden turno tras turno, algo que el modelo base no sostiene con la misma fidelidad.
- Composicion de escenas con multiples referencias: introducir productos u objetos a partir de varias imagenes de referencia en una fotografia de interior o catalogo, manteniendo coherente la escena ya construida en cada insercion.
- Prototipado rapido de variantes de producto: generar una imagen base con text-to-image y aplicar ediciones encadenadas de color, acabado o entorno sin reconstruir la escena entre pasos, reduciendo el numero de generaciones desde cero.
- Restauracion y retoque por pasos en flujos de postproduccion: corregir elementos concretos de una imagen en varias pasadas manteniendo intacta la region no editada, medido objetivamente con PSNR y SSIM sobre el area preservada.
- Evaluacion de robustez en edicion multi-turno: usar el checkpoint como referencia en investigacion sobre deriva acumulativa, comparandolo con el modelo base mediante el benchmark Add & Preserve (100 imagenes, diez turnos) y las suites de tailsteer.
- Demostraciones y herramientas en navegador: el modelo cuenta con una demo community en Hugging Face Spaces (tailsteer-sensenova-u15-mot) que permite editar imagenes sin instalacion local, util para validacion rapida por parte de equipos de producto.
- Generacion de material visual para campanas: producir una imagen con text-to-image y refinarla con ediciones sucesivas de texto conservando la identidad visual de la escena original a lo largo de todo el proceso.

## Benchmarks y rendimiento

Resultados publicados en la model card. La primera tabla compara el modelo base con el checkpoint TailSteer en generacion y edicion de un solo turno (misma prompt y semilla en cada par):

| Benchmark | Modelo base | Tras TailSteer |
|---|---:|---:|
| Qwen-IB EN ↑ | 53,43 | 52,24 |
| Qwen-IB ZH ↑ | 53,25 | 52,58 |
| BizGen ES (%) ↑ | 45,85 | 45,73 |
| GEdit EN ↑ | 8,33 | 8,27 |
| GEdit ZH ↑ | 8,30 | 8,31 |
| RISE accuracy (%) ↑ | 31,39 | 29,44 |
| ImgEdit ↑ | 4,43 | 4,41 |

Resultados en el benchmark Add & Preserve (100 imagenes, diez turnos; PSNR, SSIM y LPIPS medidos sobre la region no editada en el turno 10):

| Modelo | COA (%) ↑ | PSNR@10 ↑ | SSIM@10 ↑ | LPIPS@10 ↓ |
|---|---:|---:|---:|---:|
| Modelo base | 94,93 | 11,23 | 0,166 | 0,607 |
| Tras TailSteer | 94,78 | 18,22 | 0,489 | 0,417 |

La model card resume la mejora en +6,99 dB de PSNR y un 31,3% menos de LPIPS fuera de la region editada en el turno 10. COA (Cumulative Object Accuracy) promedia la presencia de los objetos solicitados a lo largo de los diez turnos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del tamano de pesos (17,53 mil millones de parametros, repositorio de 35,1 GB en safetensors), la carga en precision de 16 bits requiere del orden de 35 GB solo para pesos, antes de activaciones y buffers de inferencia de imagen.
- GPU recomendadas: no especificadas en la informacion disponible. Por volumen de pesos, el despliegue en 16 bits encaja en A100 80 GB o H100; en GPUs consumer de 24 GB (RTX 4090) no cabria sin cuantizacion, y no se documentan variantes cuantizadas.
- Cabe en consumer GPU: no disponible; no se publican pesos GGUF ni versiones cuantizadas, por lo que no puede confirmarse su ejecucion en GPUs de consumo.
- Opciones de despliegue: paquete oficial de inferencia de SenseNova-U1 (repositorio OpenSenseNova/SenseNova-U1, script examples/editing/inference.py) y la libreria transformers con custom_code. Tambien existe la CLI tailsteer (comando `tailsteer infer`) para demos y benchmarks. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-U1.5-8B-MoT-TailSteer | 17,53 mil millones | no disponible | Edicion y generacion de imagen any-to-any con estabilidad multi-turno | Apache 2.0 | Hugging Face, demo en Spaces |
| SenseNova-U1.5-8B-MoT (base) | no disponible (mismo layout) | no disponible | Edicion y generacion de imagen any-to-any | Apache 2.0 | Hugging Face |
| Otros modelos de edicion de imagen de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa mas relevante es contra su propio modelo base: TailSteer sacrifica entre 0,01 y 1,95 puntos en los benchmarks de generacion y edicion de un solo turno (la mayor caida en RISE accuracy, de 31,39 a 29,44) a cambio de una mejora sustancial en preservacion multi-turno (PSNR@10 de 11,23 a 18,22 y LPIPS@10 de 0,607 a 0,417). No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La mejora se centra en edicion multi-turno; en generacion y edicion de un solo turno el rendimiento es igual o ligeramente inferior al modelo base en todos los benchmarks publicados, con una caida notable en RISE accuracy (31,39 a 29,44).
- COA desciende ligeramente (94,93 a 94,78), lo que indica una presencia media de objetos solicitados marginalmente menor a lo largo de diez turnos.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de contexto o idioma en la informacion disponible; las evaluaciones publicadas solo cubren ingles y chino.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se apoya en el paquete de inferencia oficial de SenseNova-U1 y en codigo con custom_code, cuyas condiciones deben verificarse por separado.
- El modelo esta orientado a imagen; no se documentan capacidades de texto, codigo, razonamiento o tool calling, por lo que no debe asumirse un comportamiento de LLM general.
- Al ser un ajuste fino sobre un modelo base concreto, requiere el mismo entorno oficial de inferencia; no se garantiza compatibilidad con otros runners sin adaptacion.
- El checkpoint es reciente (creado el 4 de noviembre de 2026, actualizado el 11 de noviembre de 2026) y con un volumen de adopcion bajo (391 descargas, 11 likes), por lo que la validacion externa es limitada.
- No se publican requisitos de hardware ni latencias, lo que dificulta planificar el coste de despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT-TailSteer
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/hugging-apps/tailsteer-sensenova-u15-mot
- Repositorio GitHub de TailSteer: https://github.com/Lyricccco/tailsteer
- Pagina del proyecto TailSteer: https://lyricccco.github.io/tailsteer/
- Paquete oficial de inferencia SenseNova-U1: https://github.com/OpenSenseNova/SenseNova-U1
- Dataset Add & Preserve: https://huggingface.co/datasets/Lyricccco/Add-and-Preserve
- Dataset de entrenamiento TailSteer-Source: https://huggingface.co/datasets/Lyricccco/TailSteer-Source
- Paper de referencia: arxiv:2611.06741
