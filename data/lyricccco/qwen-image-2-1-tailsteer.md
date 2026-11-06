# Lyricccco/Qwen-Image-2.1-TailSteer

## Resumen

Qwen-Image-2.1-TailSteer es un ajuste fino (finetune) completo del modelo de difusion Qwen-Image-2.1 de Alibaba Qwen, publicado por el usuario independiente Lyricccco en HuggingFace. No se trata de un LoRA ni de un adaptador: son pesos completos que sustituyen al modelo base manteniendo la misma arquitectura, el mismo formato de pesos y la misma API de carga, de modo que se puede usar con el pipeline oficial `QwenImage21Pipeline` de diffusers cambiando unicamente el identificador del modelo.

El problema que aborda es la deriva acumulativa (drift) en edicion de imagenes multi-turno. En flujos iterativos, donde la salida de cada edicion se convierte en la entrada de la siguiente, el modelo base degrada progresivamente texturas, rostros, ropa y fondos fuera de la region editada. TailSteer es una etapa final de entrenamiento que aprende de las propias trayectorias de denoising del editor, usando el contenido fuente inalterado como referencia de preservacion, y mejora la estabilidad a largo plazo sin necesidad de pares de edicion con ground-truth ni de cadenas de edicion multi-turno durante el entrenamiento.

El checkpoint publicado corresponde a la actualizacion 2.000 del paper *TailSteer: Trajectory-Tail Steering for Drift-Resistant Multi-turn Image Editing*, con un onset de steering de entrenamiento de 30/40. El modelo conserva las capacidades de generacion texto-a-imagen y edicion de un solo turno del modelo base, y anade una mejora medible en preservacion del contenido no editado tras diez turnos sucesivos (+1,22 dB PSNR y 11,5 % menos LPIPS en la region no editada sobre el benchmark Add & Preserve).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (pipeline `QwenImage21Pipeline` de diffusers); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 7.115.124.736 (7,12 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no se especifica longitud de prompt en tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente bfloat16; no se documentan variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | No disponible; los benchmarks reportan resultados en ingles (EN) y chino (ZH) |
| Licencia | `qwen-research` (etiqueta `license: other` con `license_name: qwen-research`); se aplican la licencia y atribucion del modelo base |
| Formato de pesos | safetensors (libreria diffusers); tamano del repo 33,1 GB |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: finetune) |
| Pipeline tag | any-to-any |
| Pasos de inferencia de referencia | 40 (`num_inference_steps=40`), `true_cfg_scale=1.0`, `use_kv_cache=True` |

## Arquitectura y entrenamiento

El modelo hereda integramente la arquitectura del Qwen-Image-2.1 original; TailSteer no introduce modulos de inferencia adicionales, adaptadores ni cambios en el layout oficial. La innovacion es exclusivamente de entrenamiento: una etapa final que aprende a partir de los rollouts de denoising del propio editor, tomando el contenido fuente no modificado como referencia de preservacion. De este modo se supervisa la trayectoria de denoising en su cola (los ultimos pasos), preservando la dinamica temprana y guiando solo el tramo final, lo que reduce la deriva sin sacrificar la fidelidad al prompt de edicion.

El checkpoint publicado corresponde a la actualizacion 2.000 del entrenamiento, con un onset de steering de 30/40: la supervision de entrenamiento se aplica a partir del paso 30 de 40, mientras que en inferencia el modelo entrenado se usa en todos los pasos. El autor indica que el modelo empaquetado fue validado contra la exportacion de inferencia original (`validation/parity.json`). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; el autor enlaza un dataset de entrenamiento (TailSteer-Source) y uno de evaluacion (Add & Preserve).

## Capacidades

- Generacion de imagenes texto-a-imagen con el mismo checkpoint, manteniendo puntuaciones cercanas al modelo base en Qwen-Image-Bench (EN y ZH) y BizGenEval.
- Edicion de imagenes de un solo turno mediante instrucciones en lenguaje natural (por ejemplo, "Change the jacket to blue").
- Edicion multi-turno iterativa: la salida de cada turno se realimenta como entrada del siguiente, con menor deriva acumulativa que el modelo base.
- Edicion guiada por multiples imagenes de referencia (interfaz multi-imagen: persona + guia de pose como entradas ordinarias del pipeline).
- Preservacion del contenido fuera de la region editada, medida con PSNR, SSIM y LPIPS sobre el benchmark Add & Preserve.
- Cumplimiento de anadir objetos (object completion) a lo largo de cadenas de edicion, medido con COA (Cumulative Object Accuracy).
- Compatibilidad directa con el ecosistema diffusers y con el entorno oficial del modelo base, sin runtime especifico de TailSteer.
- Soporte de benchmarks y demos mediante la CLI `tailsteer` (suites `cafe-20turn`, comparaciones lado a lado con el modelo base).
- No se documentan capacidades de tool calling, function calling, agentes, audio, vision multimodal de entrada ni modo thinking; se trata de un modelo generativo de imagen, no de un LLM.

## Casos de uso

- Edicion fotografica iterativa de retratos y productos: el modelo permite aplicar cambios sucesivos (ropa, fondo, iluminacion) realimentando cada resultado, y TailSteer reduce la degradacion de rostros y texturas que aparece tras diez o veinte turnos, lo que lo hace adecuado para flujos de retoque por pasos.
- Postproduccion de escenas con preservacion de fondo: en composicion y VFX, donde hay que anadir o sustituir objetos manteniendo intacto el resto del encuadre, las metricas de preservacion (PSNR@10 de 18,15 frente a 16,93 del base) reducen el retrabajo manual de parcheo.
- Generacion de variaciones de producto en e-commerce: el mismo checkpoint soporta texto-a-imagen y edicion de un turno, de modo que un catalogo puede generar imagenes nuevas y luego aplicar cambios puntuales (color, material, entorno) con un unico modelo y semilla reproducible.
- Edicion guiada por referencia de pose o de persona: la interfaz multi-imagen permite trasladar una pose o un sujeto de referencia a una escena existente en ediciones sucesivas, util para storyboards, previsualizacion de moda o animatica.
- Creacion de contenido para redes y campanas: cadenas de edicion de veinte turnos documentadas por el autor (suite `cafe-20turn`) demuestran la viabilidad de flujos largos de iteracion creativa sin cambio de modelo ni mascaras de preservacion en inferencia.
- Evaluacion e investigacion en edicion multi-turno: el benchmark Add & Preserve (100 imagenes, diez turnos) y la CLI `tailsteer` permiten reproducir comparaciones lado a lado contra el modelo base, util para laboratorios que estudian deriva en modelos de difusion.
- Integracion en pipelines diffusers existentes: al ser pesos completos con la misma API, un equipo que ya sirve Qwen-Image-2.1 puede sustituir el ID del modelo sin reescribir codigo ni anadir modulos, lo que facilita pruebas A/B en produccion.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre benchmarks de generacion y edicion (↑ indica mayor es mejor):

| Benchmark | Modelo base | Tras TailSteer |
|---|---:|---:|
| Qwen-IB EN ↑ | 53,39 | 53,06 |
| Qwen-IB ZH ↑ | 53,34 | 53,20 |
| BizGen ES (%) ↑ | 57,03 | 57,38 |
| GEdit EN ↑ | 8,11 | 8,04 |
| GEdit ZH ↑ | 7,80 | 7,72 |
| RISE accuracy (%) ↑ | 20,56 | 18,06 |
| ImgEdit ↑ | 4,40 | 4,42 |

Resultados en el benchmark Add & Preserve (100 imagenes, diez turnos; COA mide presencia del objeto solicitado, PSNR/SSIM/LPIPS miden la region no editada):

| Modelo | COA (%) ↑ | PSNR@10 ↑ | SSIM@10 ↑ | LPIPS@10 ↓ |
|---|---:|---:|---:|---:|
| Modelo base | 67,36 | 16,93 | 0,438 | 0,270 |
| Tras TailSteer | 66,94 | 18,15 | 0,513 | 0,239 |

La mejora declarada en la model card es de +1,22 dB PSNR y un 11,5 % menos LPIPS fuera de la region editada en el turno 10. El autor reconoce que la precision en RISE es inferior en esta configuracion (18,06 frente a 20,56). No se han publicado resultados de latencia ni throughput en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 7,12 mil millones de parametros en bfloat16, los pesos ocupan aproximadamente 14,2 GB, a los que hay que sumar activaciones y cache KV del pipeline de difusion. El repo completo pesa 33,1 GB, lo que sugiere que incluye mas de una precision o componentes adicionales (VAE, text encoder).
- GPU recomendadas: no especificadas por el autor. Por tamano, son razonables GPU de datacenter como A100 (40/80 GB) y H100, y en el segmento consumer RTX 4090 (24 GB) o RTX 3090 (24 GB) con bfloat16.
- Cabe en GPU consumer: previsiblemente si en tarjetas de 24 GB en bfloat16, aunque no se documenta el consumo real ni variantes cuantizadas para tarjetas de 8-16 GB.
- Opciones de despliegue: diffusers con `QwenImage21Pipeline` (via oficial), CLI `tailsteer` para demos y benchmarks (`tailsteer infer --backbone qwen-image-2.1 --checkpoint ... --policies tailsteer --inference-suite cafe-20turn --gpus 1`). No se documentan soporte en vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM).
- Latencia y throughput estimados: no disponibles. La configuracion de referencia usa 40 pasos de inferencia, `true_cfg_scale=1.0` y `use_kv_cache=True`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / pasos | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-TailSteer | 7,12 mil millones | 40 pasos de referencia | Qwen-IB EN 53,06; PSNR@10 18,15 en Add & Preserve | qwen-research | HuggingFace (2 descargas, 0 likes en el momento de la consulta) |
| Qwen-Image-2.1 (base) | 7,12 mil millones (mismo tamano) | 40 pasos de referencia | Qwen-IB EN 53,39; PSNR@10 16,93 en Add & Preserve | qwen-research | HuggingFace, modelo oficial de Qwen |
| Otros modelos de edicion de imagen de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa relevante es contra el propio modelo base: TailSteer pierde marginalmente en benchmarks de generacion y edicion de un turno (Qwen-IB EN -0,33; GEdit EN -0,07; RISE -2,50 puntos) y gana de forma clara en preservacion multi-turno (+1,22 dB PSNR, +0,075 SSIM, -0,031 LPIPS). No se dispone de datos de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Deriva no eliminada: TailSteer reduce la acumulacion de artefactos, pero el autor no afirma eliminacion total; en cadenas largas sigue existiendo degradacion.
- Perdida de rendimiento en algunas tareas: la precision en RISE cae de 20,56 a 18,06 y hay ligeros descensos en Qwen-IB EN/ZH y GEdit EN/ZH; en COA se pierde 0,42 puntos porcentuales.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar los pesos y datos del modelo base, cabe esperar los sesgos de Qwen-Image-2.1, no evaluados aqui.
- Riesgo de alucinacion visual: propio de los modelos de difusion; el modelo puede generar contenido no solicitado o modificar elementos fuera de la instruccion, aunque TailSteer mitiga la preservacion del fondo.
- Restricciones de licencia: la licencia `qwen-research` (etiqueta `other`) no es una licencia permisiva generica; el uso comercial queda sujeto a los terminos del modelo base Qwen-Image-2.1 y a su fichero LICENSE y NOTICE. Conviene revisarlos antes de cualquier despliegue productivo.
- Idiomas: no se declaran idiomas soportados; los benchmarks solo cubren ingles y chino, por lo que el rendimiento en castellano no esta verificado.
- Madurez y soporte: el repositorio tiene 2 descargas y 0 likes, creado en noviembre de 2026 y actualizado dos dias despues; es un artefacto de investigacion de un autor individual, sin garantias de mantenimiento.
- Dependencia del ecosistema diffusers: requiere la version de diffusers que incluya `QwenImage21Pipeline` y el entorno oficial del modelo base; no se documentan alternativas de despliegue.
- Requisitos de hardware no verificados: no hay mediciones publicadas de VRAM real, latencia ni throughput, lo que dificulta el dimensionamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lyricccco/Qwen-Image-2.1-TailSteer
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Dataset de evaluacion Add & Preserve: https://huggingface.co/datasets/Lyricccco/Add-and-Preserve
- Dataset de entrenamiento TailSteer-Source: https://huggingface.co/datasets/Lyricccco/TailSteer-Source
- Licencia del modelo base: LICENSE (referenciado en el repositorio)
- Aviso de atribucion: NOTICE (referenciado en el repositorio)
- Validacion de paridad del checkpoint: validation/parity.json (referenciado en el repositorio)
- Datos de metricas: media/results.json (referenciado en el repositorio)
- Prompts e imagenes de comparacion texto-a-imagen: media/examples/text-to-image.json
- Prompts y fotogramas de edicion multi-turno: media/examples/editing.json
- Paper: *TailSteer: Trajectory-Tail Steering for Drift-Resistant Multi-turn Image Editing* (no se proporciona URL en la informacion disponible)
