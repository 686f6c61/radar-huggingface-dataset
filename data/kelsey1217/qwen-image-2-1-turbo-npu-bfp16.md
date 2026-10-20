# Kelsey1217/Qwen-Image-2.1-Turbo-NPU-BFP16

## Resumen

Este repositorio no contiene un modelo nuevo, sino un **paquete de pesos convertidos** del checkpoint `Qwen/Qwen-Image-2.1-Turbo` (revision `fc13ba1986fcb905854dc8de2f52eee395f49b5b`) a un formato nativo para **NPU AMD + CPU**, publicado por el usuario Kelsey1217 bajo el identificador `Kelsey1217/Qwen-Image-2.1-Turbo-NPU-BFP16`. La conversion la realiza la herramienta VigenFlow y emplea el formato propietario `vgf-npu-weights-1`: cuatro shards safetensors de aproximadamente 18,24 GiB (19,59 GB) en los que cada tensor es un array plano de bytes U8 que encapsula un fichero de pesos original.

El modelo subyacente es un generador de imagenes texto-a-imagen de la familia Qwen-Image, con capacidad adicional de edicion de imagen a partir de una referencia unica. Ambos modos comparten paquete: el modo texto-a-imagen requiere los subconjuntos `text_encoder`, `denoising` y `vae_decoder`, mientras que la edicion anade `vision` y `vae_encoder`. Los pesos incluyen operandos BFP16 ya empaquetados para la NPU y tensores BF16/FP32 para las operaciones en CPU, sin cuantizacion adicional durante el empaquetado.

Su relevancia es acotada y muy especifica: permite ejecutar este generador de imagenes sobre hardware AMD con NPU mediante un host nativo en C++, sin Python ni iGPU en tiempo de inferencia. No es utilizable con las herramientas habituales del ecosistema (Diffusers, PyTorch, ComfyUI) y su licencia restringe el uso a investigacion y evaluacion. El repositorio no documenta la arquitectura interna de la red, el dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no documenta la topologia interna; el pipeline declarado es texto-a-imagen) |
| Parametros totales | 19.588.932.350 segun metadatos safetensors; coincide con el total de bytes del paquete, por lo que refleja el empaquetado U8 y no un desglose de parametros por componente |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el prompt se procesa con el `text_encoder` incluido en el paquete) |
| Tipos de cuantizacion | BFP16 empaquetado para NPU y tensores BF16/FP32 para CPU; el empaquetado no anade cuantizacion adicional; el repositorio lleva la etiqueta `8-bit` |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (`qwen-research`): solo investigacion y evaluacion; el uso comercial exige licencia separada del licenciante original |
| Formato de pesos | safetensors con formato propietario `vgf-npu-weights-1` (4 shards, arrays U8 planos); no son shards Diffusers/PyTorch y no cargan con `DiffusionPipeline.from_pretrained` |
| Tamano del repositorio | 19,6 GB (18,24 GiB de pesos en 4 shards) |
| Ficheros embebidos | 1.399, incluidos configuracion y metadatos de preparacion |
| Modos soportados | texto-a-imagen y edicion de imagen con referencia unica |
| Resolucion validada | 1024 x 1024, 8 pasos, semilla 42 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura de la red neuronal: el autor solo publica la capa de conversion y empaquetado, no las caracteristicas del checkpoint original. Por el pipeline declarado (`text-to-image`) y por la presencia de un `text_encoder`, un modulo de `denoising`, un `vae_decoder` y, para edicion, un `vision` y un `vae_encoder`, se trata de un modelo generativo de difusion con codificador de texto y autoencoder variational, pero no se detalla si el denoiser es un transformer de difusion, su numero de bloques ni sus dimensiones. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste fino con RLHF, DPO o preferencias humanas.

La innovacion tecnica del repositorio es exclusivamente de despliegue. El paquete conserva los operandos BFP16 ya empaquetados para la NPU y los tensores BF16/FP32 destinados a CPU, y anade ficheros de indice, sumas de comprobacion por fichero y por shard, `task_profiles.json` con los requisitos del runtime nativo, `PACKAGE.txt`, aviso de conversion y un helper de restauracion escrito solo con la biblioteca estandar de Python. La validacion reportada es reproducible: ambos caminos de inferencia nativa generaron imagenes de 1024 x 1024 con ocho pasos y semilla 42 en la maquina de desarrollo Linux, y la salida de edicion junto con 17 ficheros intermedios coincidio byte a byte con la ejecucion usando los pesos originales.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (texto-a-imagen), validada a 1024 x 1024 y ocho pasos de muestreo.
- Edicion de imagen con una unica imagen de referencia, mediante los modulos `vision` y `vae_encoder` del paquete.
- Paquete unificado: los pesos compartidos entre ambos modos se almacenan una sola vez.
- Ejecucion nativa sobre NPU AMD con apoyo de CPU, sin Python ni iGPU en tiempo de inferencia.
- Verificacion de integridad mediante sumas de comprobacion por fichero y por shard, e indexado del contenido.
- Desempaquetado offline con un helper de Python basado en biblioteca estandar o mediante `prepare_base.exe` con reanudacion de descargas interrumpidas.
- Soporte de tool calling, agentes, razonamiento multi-paso, matematicas, codigo, audio o modo thinking: no disponible (no son capacidades de este tipo de modelo).

## Casos de uso

- **Prototipado de generacion de imagenes en equipos con NPU AMD**: el paquete permite ejecutar un generador texto-a-imagen de ~19,6 GB sobre la NPU integrada de portatiles y workstations AMD, usando el host nativo en C++ y sin necesidad de instalar Python ni configurar CUDA.
- **Edicion de imagenes con referencia unica en local**: flujos de retoque guiado por imagen de referencia (por ejemplo, transferencia de estilo o cambios acotados) que se benefician de que el paquete incluya `vision` y `vae_encoder` y de que la salida se haya validado byte a byte contra los pesos originales.
- **Investigacion en cuantizacion y empaquetado de pesos**: el formato `vgf-npu-weights-1` y la conservacion literal de operandos BFP16 permiten estudiar el impacto del empaquetado en la fidelidad numerica, comparando los 17 ficheros intermedios de la ejecucion convertida con los de la original.
- **Evaluacion de despliegue en el borde (edge)**: validar si una NPU de gama consumer puede sostener un pipeline de difusion de 1024 x 1024 en ocho pasos con un presupuesto de memoria de unos 18,24 GiB de pesos residentes, antes de comprometer hardware.
- **Reproducibilidad de artefactos generativos**: gracias a las semillas fijas y a las sumas de comprobacion documentadas, sirve como referencia para auditar que una conversion a formato nativo no altera la salida del modelo.
- **Integracion en el servidor VigenFlow**: el paquete esta pensado para el host `NPU_qwen_image` y el servidor VigenFlow; util para equipos que ya operan esa infraestructura y quieren incorporar generacion o edicion de imagenes en un pipeline interno de investigacion.
- **Generacion de datasets sinteticos con fines de evaluacion**: siempre dentro del marco de la licencia de investigacion, para producir imagenes de prueba a 1024 x 1024 de forma local y sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una validacion funcional: generacion de imagenes de 1024 x 1024 con ocho pasos y semilla 42, coincidencia byte a byte de la salida de edicion y de 17 ficheros intermedios frente a la ejecucion con los pesos originales, y prueba del descargador/desempaquetador de los cuatro shards contra un fixture local de la API de Hugging Face. No se proporcionan metricas de calidad de imagen (FID, CLIP score), latencia ni throughput.

## Requisitos de hardware

- **Memoria**: los pesos suman 18,24 GiB (19,59 GB) y deben residir completos para la inferencia; el paquete no ofrece variantes de menor precision mas alla del BFP16 ya empaquetado.
- **NPU**: se requiere una NPU AMD compatible con los bundles de instrucciones y XCLBIN del runtime VigenFlow, que se distribuyen como activos de runtime separados y no estan incluidos en este repositorio.
- **CPU**: se usan tensores BF16 y FP32 para las operaciones que no se ejecutan en la NPU; el autor no especifica requisitos minimos de CPU ni de RAM del sistema.
- **GPU**: no aplica. Los pesos no son cargables en PyTorch/Diffusers, por lo que no se pueden ejecutar en A100, H100 ni RTX 4090 sin reconvertirlos al formato original. No cabe en GPU consumer en este formato.
- **Despliegue**: `prepare_base.exe --only qwen_image_2_1_turbo` (herramienta nativa en C++, con aceptacion de licencia y reanudacion de descargas) o, alternativamente, descarga manual del repositorio y `python3 pack_weights.py verify --packed .` seguido de `python3 pack_weights.py unpack --packed . --destination <dir>`; la inferencia se lanza con el host nativo Qwen correspondiente, pasando el directorio restaurado con `-w`.
- **Compatibilidad de sistema**: la validacion se realizo en Linux; el autor indica explicitamente que la validacion en Windows y en sistemas limpios es independiente de esta comprobacion del paquete de pesos. La herramienta de preparacion se distribuye como `.exe`.
- **Latencia y throughput**: no disponibles. Solo se documenta el regimen de ocho pasos a 1024 x 1024, sin tiempos por imagen.
- **Nota de alcance**: el host principal `NPU_qwen_image` solo soporta edicion de imagen; el modo texto-a-imagen se valido con un host archivado especifico. Este repositorio no anade modos de tarea a un ejecutable ni registra un worker de Qwen en el servidor VigenFlow.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kelsey1217/Qwen-Image-2.1-Turbo-NPU-BFP16 | 19.588.932.350 (metadatos safetensors) | 1024 x 1024 validado; contexto de texto no disponible | safetensors `vgf-npu-weights-1`, NPU + CPU | Qwen Research License (solo investigacion) | 0 descargas, 0 likes; runtime nativo aparte |
| Qwen/Qwen-Image-2.1-Turbo (upstream) | no disponible en la informacion proporcionada | no disponible | no disponible (checkpoint original, revision `fc13ba19...`) | Qwen Research License | publico en Hugging Face |
| Conversiones alternativas del mismo checkpoint (Diffusers/PyTorch, GGUF, etc.) | no disponible | no disponible | no disponible | heredada del upstream | no disponible |

No se dispone de datos suficientes para comparar rendimiento, calidad de imagen o latencia con alternativas de la misma categoria. La comparacion relevante aqui es de formato y despliegue: frente al checkpoint original, esta conversion no cambia los pesos, solo su empaquetado, y anade la dependencia de un runtime nativo propietario a cambio de ejecucion sobre NPU AMD.

## Limitaciones y advertencias

- **Licencia restrictiva**: los pesos conservan la Qwen Research License Agreement sin modificar. El uso se limita a investigacion y evaluacion; cualquier uso comercial requiere una licencia separada del licenciante original (`model-business@notice.qwencloud.com`).
- **Obligaciones de redistribucion**: hay que mantener `LICENSE` y `Notice` junto con las copias redistribuidas y respetar las condiciones de atribucion, modificacion y nomenclatura del acuerdo. La licencia del codigo de VigenFlow no sustituye a la licencia de los pesos.
- **Formato no interoperable**: los shards no son tensores Diffusers/PyTorch, no cargan con `DiffusionPipeline.from_pretrained` y requieren desempaquetado previo. Quedan fuera del ecosistema habitual (ComfyUI, A1111, TGI, vLLM).
- **Dependencia de activos de runtime no incluidos**: los ejecutables del host y los bundles de instrucciones NPU/XCLBIN se distribuyen aparte; sin ellos el paquete no es ejecutable.
- **Cobertura de modos incompleta**: el host principal `NPU_qwen_image` solo soporta edicion de imagen; el modo texto-a-imagen depende de un host archivado.
- **Validacion de plataforma parcial**: probado en Linux de desarrollo; Windows y sistemas limpios no estan validados por el autor.
- **Ausencia de benchmarks**: no hay metricas de calidad, sesgo o seguridad, ni comparacion con el checkpoint original mas alla de la coincidencia byte a byte reportada.
- **Sesgos y alucinacion visual**: no disponibles. Al ser un modelo de difusion, los riesgos tipicos son artefactos visuales, fidelidad limitada al prompt y reproduccion de sesgos presentes en datos de entrenamiento no documentados; el autor no publica informacion al respecto.
- **Idiomas**: no se especifica que idiomas admite el `text_encoder`, por lo que el soporte multilingue del prompt no esta garantizado.
- **Madurez del artefacto**: 0 descargas y 0 likes, publicacion sin historial de mantenimiento; tratar como paquete experimental de un tercero, no como distribucion oficial de Qwen.
- **Trazabilidad de la conversion**: el autor declara fidelidad byte a byte frente a los pesos originales, pero la verificacion es reproducible por el usuario mediante `pack_weights.py verify`; conviene ejecutarla antes de usar el paquete en produccion interna.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kelsey1217/Qwen-Image-2.1-Turbo-NPU-BFP16
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Revision upstream referenciada: `fc13ba1986fcb905854dc8de2f52eee395f49b5b`
- Licencia incluida en el repositorio: `LICENSE` (Qwen Research License Agreement)
- Aviso de conversion NPU+CPU: `Notice`
- Perfiles de tarea del runtime nativo: `task_profiles.json`
- Descripcion del paquete: `PACKAGE.txt`
- Helper de verificacion y desempaquetado: `pack_weights.py`
- Documentacion o repositorio de VigenFlow: no disponible en la informacion proporcionada
- Resultados de benchmarks o articulo tecnico: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio enlaces relevantes al modelo (unicamente resultados de Instagram, sin relacion con el repositorio)
