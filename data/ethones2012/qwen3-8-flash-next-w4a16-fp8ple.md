# ethones2012/Qwen3.8-Flash-Next-W4A16-FP8PLE

## Resumen

Qwen3.8-Flash-Next-W4A16-FP8PLE es una version cuantizada del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario ethones2012 sobre el checkpoint intermedio Intel/Qwen3.8-Flash-Next-W4A16-AutoRound. Se trata de una mezcla de expertos (MoE) de tipo vision-lenguaje orientada a razonamiento, codigo y uso de herramientas, cuantizada a W4A16 (pesos INT4, activaciones de 16 bits) con la tabla de embeddings n-gram (PLE) en FP8 y cache KV en INT8. Su proposito es hacer viable la inferencia local de un modelo de gran tamano en una o dos GPU de consumo (RTX 3090 de 24 GB) con 64 GB o 128 GB de RAM de sistema.

El modelo resuelve el problema clasico de servir un MoE grande sin presupuesto de datacenter: el runtime asociado mantiene en la GPU las capas de atencion, las capas densas y un subconjunto de expertos frecuentes, mientras el resto de expertos se calculan en CPU directamente desde RAM durante la decodificacion y se transmiten a la GPU en trozos de 8.192 tokens durante el prefill. La tabla PLE en FP8 se lee in situ desde NVMe. Con una sola RTX 3090 y 64 GB de RAM se alcanza un contexto de 135.168 tokens; con dos tarjetas y 128 GB de RAM se llega hasta 262.144 tokens.

Es relevante ahora porque, segun la informacion disponible, es uno de los pocos empaquetados de Qwen3.8-Flash-Next con runtimes publicados y medidos para hardware de consumo, incluyendo decodificacion especulativa MTP3 y un modo opcional de "abliteracion" que elimina los rechazos del modelo (con las advertencias de seguridad correspondientes). El repositorio tiene 16 descargas y 0 likes en el momento de la consulta, y un tamano de 129,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida GDN + QSA (segun la documentacion de Qwen3.8-Flash-Next); vision-lenguaje |
| Parametros totales | 72.758.053.011 (contaje safetensors del repositorio). La descripcion del modelo base en Jetson AI Lab indica 125.000 millones de parametros de lenguaje mas 51.000 millones de parametros de embeddings n-gram |
| Parametros activos | 6.000 millones por token (dato de la descripcion del modelo base; no confirmado en la model card de esta ficha) |
| Longitud de contexto | 135.168 tokens con una o dos RTX 3090 y 64 GB de RAM; hasta 262.144 tokens con dos RTX 3090 y 128 GB de RAM. Las etiquetas del repositorio mencionan 128k-context y 256k-context |
| Tipos de cuantizacion | W4A16 (INT4 en pesos, 16 bits en activaciones), tabla PLE en FP8, cache KV en INT8. Etiquetas adicionales: int4, fp8, auto-round, 4-bit |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo `license: other` en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next se describe en su repositorio oficial de GitHub como una actualizacion sistematica del modelo en cuatro ejes (atencion, residual, embeddings y optimizacion), con una arquitectura de atencion hibrida GDN + QSA. La pagina de Jetson AI Lab lo describe como un MoE vision-lenguaje para razonamiento, codigo y uso de herramientas, con 125.000 millones de parametros de lenguaje y 6.000 millones activados por token, mas 51.000 millones de parametros adicionales de embeddings n-gram. Esta ficha corresponde a un checkpoint cuantizado, no al modelo original: la model card no aporta informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni las etapas de alineacion (RLHF, DPO u otras).

La innovacion tecnica documentada en esta ficha esta en el lado de la inferencia, no del entrenamiento. El empaquetado combina cuantizacion W4A16 con una tabla PLE en FP8 y soporte de decodificacion especulativa MTP3 dentro de vLLM. Segun el autor, la tabla PLE se lee directamente desde los ficheros en NVMe sin copiarla a RAM, y la cache KV en INT8 almacena 141.504 tokens en 3,05 GB. El reparto de expertos es asimetrico: en el perfil de una sola GPU, la tarjeta mantiene los 32 expertos mas usados de cada capa; en el perfil de dos GPU con 64 GB de RAM, cada GPU posee en exclusiva sus 88 expertos mas usados por capa, y el resto de expertos de su mitad vive una sola vez en RAM (38 GiB en total entre ambas GPU). Durante la decodificacion, un pool de hilos de CPU por GPU calcula los expertos residentes en RAM mientras la GPU asume una parte a traves de PCIe; el prefill los transmite a las GPU en trozos de 8.192 tokens.

## Capacidades

- Modelo vision-lenguaje: la descripcion del modelo base indica entrada de imagen ademas de texto (la model card de esta ficha no detalla las modalidades soportadas).
- Razonamiento, generacion de codigo y uso de herramientas segun la descripcion del modelo base en Jetson AI Lab.
- Generacion de texto conversacional: la etiqueta de pipeline es `text-generation` y el repositorio incluye la etiqueta `conversational`.
- Decodificacion especulativa MTP3 integrada en el runtime de vLLM, que acelera la decodificacion.
- Cache KV en INT8 con capacidad para 141.504 tokens en 3,05 GB.
- Modo opcional "uncensored": el runtime de dos GPU puede servir los pesos con los rechazos eliminados activando `QWEN38_ABLITERATION=orcarouter`, que proyecta fuera una direccion de rechazo en cada escritura del flujo residual. Segun el autor, con el interruptor apagado el modelo rechazo 7 de 8 peticiones limite suaves, y con el encendido 0 de 8.
- Soporte multilingue: no disponible (el repositorio no declara idiomas).
- Capacidad de contexto largo: hasta 262.144 tokens en la configuracion de dos GPU con 128 GB de RAM.

## Casos de uso

- Asistente de codigo local en estacion de trabajo: con 135.168 tokens de contexto en una sola RTX 3090 se puede cargar un repositorio mediano completo y mantener conversaciones multi-turno sobre el mismo, sin enviar codigo a servicios externos.
- Analisis de documentos extensos: informes, expedientes o transcripciones que superan las 100.000 palabras caben en la ventana de contexto, lo que permite preguntas sobre el documento completo en lugar de fragmentarlo con RAG.
- Agentes con tool calling en local: el modelo base se describe como orientado a uso de herramientas, y el runtime expone una API compatible con vLLM, por lo que puede conectarse a funciones definidas por el usuario en pipelines de automatizacion.
- Despliegue de bajo coste para equipos pequenos: dos RTX 3090 de segunda mano mas 64 GB de RAM ofrecen 3.401-3.413 tokens/s de prefill y 84-89 tokens/s de decodificacion, suficiente para servir a un grupo reducido de usuarios internos sin alquilar GPU en la nube.
- Procesamiento por lotes de clasificacion, extraccion y resumen: con prefill de hasta 4.191 tokens/s en el perfil de 128 GB, resulta adecuado para procesar grandes volumenes de texto en tandas donde la latencia por peticion es menos critica que el coste por token.
- Laboratorio de investigacion sobre MoE y cuantizacion: el empaquetado permite estudiar el impacto real de W4A16, FP8 en embeddings y cache KV INT8 sobre un MoE de gran tamano, con runtimes reproducibles y benchmarks publicados.
- Auditoria de seguridad y alineacion: el modo de abliteracion documentado permite comparar el comportamiento del mismo checkpoint con y sin la direccion de rechazo proyectada, util para estudiar mecanismos de negativa.
- Servicio de imagenes y texto en el borde: la descripcion del modelo base como vision-lenguaje abre la puerta a tareas de descripcion de imagenes y respuesta visual sobre hardware local, siempre que se confirme dicha capacidad en este checkpoint concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos publicados son medidas de servicio del runtime, que se reproducen a continuacion.

| Escenario de servicio | Hardware | Prefill | Decodificacion | Contexto |
|---|---|---|---|---|
| 131.099 + 512 tokens (3 ejecuciones) | 2x RTX 3090, 64 GB RAM | 3.401-3.413 tok/s | 84,2-88,8 tok/s | 131.099 tokens de prompt |
| 32.799 + 512 tokens | 2x RTX 3090, 64 GB RAM | 3.200-3.211 tok/s | 77,0-83,9 tok/s | no disponible |
| 8.218 + 1.024 tokens | 2x RTX 3090, 64 GB RAM | 3.114-3.146 tok/s | 78,2-79,7 tok/s | no disponible |
| 131.099 + 512 tokens (2 ejecuciones) | 1x RTX 3090, 64 GB RAM | 2.106 / 1.451 tok/s | 47,4 / 43,3 tok/s | 131.099 tokens de prompt |
| 32.799 + 512 tokens | 1x RTX 3090, 64 GB RAM | 2.141 / 2.219 tok/s | 50,3 / 49,5 tok/s | no disponible |
| 8.218 + 1.024 tokens | 1x RTX 3090, 64 GB RAM | 1.570 / 1.452 tok/s | 49,1 / 48,5 tok/s | no disponible |
| Prefill de 131K con prompt de agente | 2x RTX 3090, 128 GB RAM | hasta 4.191 tok/s | hasta 111,5 tok/s | hasta 262.144 tokens |
| Prefill de 131K con modo abliterado | 2x RTX 3090, perfil 128K | 2.909 tok/s (frente a 2.914 sin abliterar) | velocidad sin cambios, segun el autor | no disponible |

Notas de rendimiento aportadas por el autor: la decodificacion depende principalmente del ancho de banda de RAM. Con el servidor restringido a 12 nucleos de CPU en 2 CCD, la decodificacion del perfil de dos GPU bajo a 71-81 tok/s; en el perfil de una GPU, 16 nucleos dieron 39-47 tok/s y 8 nucleos, 34-36 tok/s. Algunas peticiones de prefill en el perfil de una GPU toman una ruta mas lenta (aproximadamente 1.450 tok/s en lugar de 2.100), calificada como incidencia conocida en el informe de benchmarks.

## Requisitos de hardware

- VRAM: 24 GB por GPU. En la configuracion de una sola RTX 3090, la GPU aloja la atencion, los pesos densos, los 32 expertos mas usados de cada capa y la cache KV INT8; el resto se calcula en CPU.
- RAM de sistema: 64 GB como minimo en los perfiles publicados (una GPU o dos GPU); 128 GB para el perfil que alcanza 262.144 tokens de contexto. En el perfil de dos GPU con 64 GB, los expertos no residentes en VRAM ocupan 38 GiB de RAM.
- Almacenamiento: los pesos se leen desde NVMe, incluida la tabla PLE en FP8 leida in situ. El repositorio completo ocupa 129,0 GB.
- GPU recomendadas: RTX 3090 (24 GB) es la plataforma validada y medida. No hay datos publicados para A100, H100, RTX 4090 ni otras GPU en la informacion disponible.
- Cabe en GPU de consumo: si, en RTX 3090 con offload a CPU y RAM. No se ha documentado funcionamiento en tarjetas de 12 GB con este empaquetado concreto; el proyecto Strata si declara ejecutar Qwen3.8-Flash-Next en GPU de consumo de 12 GB o mas usando cuantizacion IQ3_S, pero como runtime independiente.
- Opciones de despliegue: vLLM con runtimes personalizados publicados en GitHub (qwen38-flash-next-3090 para una GPU y qwen38-flash-next-2x3090 para dos), imagen Docker publicada en ghcr.io y construccion propia con `make build-image && make serve`. El autor indica que no se necesita P2P por CUDA ni swap.
- Latencia y throughput: primer token de 38,4-38,5 s para un prompt de 131.099 tokens en el perfil de dos GPU con 64 GB; 62,2 y 90,3 s en el perfil de una GPU para el mismo prompt; 2,6 s para 8.218 tokens en dos GPU. Throughput de decodificacion entre 34 y 111,5 tok/s segun hardware y reparto de nucleos de CPU.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ethones2012/Qwen3.8-Flash-Next-W4A16-FP8PLE (esta ficha) | Checkpoint W4A16 + FP8 PLE, INT8 KV | 72.758.053.011 segun safetensors | 135.168 a 262.144 tokens | 3.401-3.413 tok/s prefill y 84-89 tok/s decode en 2x RTX 3090 | qwen-community-1.0 | HuggingFace, 16 descargas |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | Modelo base directo de la cuantizacion | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | Cuantizacion NVFP4 del mismo modelo base | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.8-Flash-Next | Modelo original sin cuantizar | 125B de lenguaje + 51B de embeddings n-gram, 6B activos | no disponible | no disponible | no disponible | HuggingFace y GitHub |
| Niko1221/Strata (runtime sobre Qwen3.8-Flash-Next) | Runtime alternativo con cuantizacion IQ3_S para GPU de 12 GB | 125.000 millones citados por el proyecto | 128K en el ejemplo mostrado (RTX 5070, IQ3_S) | no disponible | no disponible | GitHub, codigo abierto |

No se dispone de datos de rendimiento de calidad ni de throughput de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a la naturaleza del empaquetado y a los requisitos de hardware declarados.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks de calidad para este checkpoint, por lo que no hay evidencia disponible sobre la degradacion introducida por la cuantizacion W4A16, el FP8 en la tabla PLE o el INT8 en la cache KV.
- El campo de idiomas del repositorio esta vacio: no hay confirmacion de cobertura multilingue especifica para este empaquetado.
- La licencia es qwen-community-1.0, etiquetada como `license: other`. Es necesario revisar el texto completo de la licencia antes de cualquier uso comercial, ya que las condiciones no se detallan en la model card.
- El modo de abliteracion (`QWEN38_ABLITERATION=orcarouter`) elimina los rechazos de seguridad del modelo de forma deliberada. El propio autor advierte de que hay que colocar salvaguardas propias antes de servir el modelo a terceros. El runtime necesario para activarlo requiere una imagen construida desde la rama principal del repositorio de GitHub.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos de lenguaje y no hay evaluaciones publicadas para este checkpoint.
- El rendimiento depende fuertemente del ancho de banda de RAM y del numero de nucleos de CPU asignados: pasar de 16 a 8 nucleos redujo la decodificacion de 39-47 a 34-36 tok/s en el perfil de una GPU.
- Existe una incidencia conocida por la que algunas peticiones de prefill toman una ruta lenta (aproximadamente 1.450 tok/s en lugar de 2.100 tok/s) en el perfil de una sola GPU.
- La decodificacion de un prompt de 131K tokens tarda 38-90 segundos hasta el primer token segun la configuracion, lo que descarta su uso en escenarios interactivos con prompts muy largos.
- El repositorio se creo y actualizo el 3 de octubre de 2026 y acumula 16 descargas y 0 likes, por lo que la validacion por parte de la comunidad es practicamente nula.
- Existe un repositorio con nombre identico bajo la organizacion albucino (albucino/Qwen3.8-Flash-Next-W4A16-FP8PLE), citado en las instrucciones de descarga de la propia model card, lo que puede generar confusion sobre cual es el artefacto canonico.
- No cabe esperar compatibilidad con toolchains estandar: el autor indica explicitamente que los pesos requieren uno de los dos runtimes personalizados de vLLM, y en el caso del modo abliterado, una imagen no publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ethones2012/Qwen3.8-Flash-Next-W4A16-FP8PLE
- Repositorio con nombre identico citado en la model card: https://huggingface.co/albucino/Qwen3.8-Flash-Next-W4A16-FP8PLE
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint base de la cuantizacion: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Cuantizacion alternativa en NVFP4: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Version sin censura usada por el modo de abliteracion: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Repositorio oficial del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/tree/main
- Runtime para una RTX 3090: https://github.com/DominikBucko/qwen38-flash-next-3090
- Runtime para dos RTX 3090: https://github.com/DominikBucko/qwen38-flash-next-2x3090
- Documentacion del modo de abliteracion: https://github.com/DominikBucko/qwen38-flash-next-2x3090/blob/main/docs/abliteration.md
- Informe de benchmarks para dos GPU y 64 GB de RAM: https://github.com/DominikBucko/qwen38-flash-next-2x3090/blob/main/benchmarks/2026-09-30/README.md
- Runtime alternativo para GPU de consumo de 12 GB: https://github.com/Niko1221/Strata
- Ficha del modelo base en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-flash-next/
