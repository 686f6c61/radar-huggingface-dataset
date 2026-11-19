# apetersson/Hy4-flash-oQh8-BF16-Engram

## Resumen

Hy4-flash-oQh8-BF16-Engram es una derivada comunitaria del modelo instructivo Hy4-flash de Tencent, publicada por el usuario apetersson. No se trata de una cuantización oficial de Tencent ni de un checkpoint autocontenido: es un nucleo de texto en formato oMLX (variante de MLX) en el que solo se han cuantizado los 82 bancos de expertos enrutados fusionados, mientras que las cuatro tablas de embeddings se mantienen en BF16 originales y deben descargarse por separado desde el repositorio oficial de Tencent. El paquete completo ocupa 167,2 GB repartidos en 141 shards, con 46.465.674.773 parametros totales.

El modelo base, tencent/Hy4-flash, es un transformer con arquitectura de mezcla de expertos (MoE) orientado a generacion de texto y conversacion. Esta derivada elimina las capacidades de vision y el modulo DFly presentes en el original, por lo que es estrictamente texto. La cuantizacion aplicada es de 8 bits con rotacion Walsh-Hadamard firmada de 256 anchos, agrupacion de 128 con escalas y sesgos afines en la base rotada, y no es GPTQ calibrado.

Su relevancia es limitada y muy especifica: sirve para ejecutar el modelo en hardware Apple Silicon mediante una bifurcacion concreta de oMLX, ya que la version estandar v0.8.0 no carga esta arquitectura. El autor reporto una prueba corta de 28 iteraciones de decodificacion a 0,94 tokens/s con una cache de expertos de 16 GiB respaldada por SSD en un M5 Ultra con 256 GiB de RAM, ademas de generar correctamente "Paris" y el token de fin. No hay datos de benchmarks, idiomas soportados ni velocidad en regimen completamente residente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), formato oMLX (derivado de MLX) |
| Parametros totales | 46.465.674.773 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, rotacion Walsh-Hadamard firmada de 256 anchos, grupo 128 afin con escalas y sesgos en base rotada; embeddings en BF16 sin recuantizar |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (Tencent Hy License v1.0, no Apache 2.0) |
| Formato de pesos | safetensors (141 shards, oMLX); requiere tablas externas BF16 del repo original |

## Arquitectura y entrenamiento

El modelo base tencent/Hy4-flash emplea una arquitectura transformer con mezcla de expertos, segun se deduce de la estructura de 82 bancos de expertos enrutados fusionados que esta derivada cuantiza. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card de esta derivada no los detalla y la informacion proporcionada no los incluye.

La innovacion tecnica de esta publicacion es el esquema de cuantizacion: en lugar de GPTQ calibrado, aplica una rotacion Walsh-Hadamard firmada de 256 elementos antes de una cuantizacion afin de 8 bits con grupo de 128, almacenando los signos, escalas y sesgos resultantes. Los 1.350 tensores de texto restantes se compararon byte a byte con el original para garantizar su integridad. El autor excluye explicitamente la vision y el modulo DFly, y conserva las cuatro tablas de embeddings en BF16 originales (118,02 GiB) que deben descargarse del repositorio de Tencent fijado a la revision d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959. La carga requiere una bifurcacion especifica de oMLX (commit 6278134636a26853843e76186ba2b9203782c5bc) que verifica el shard 4 (capa 1, 29,50 GiB) y lee solo las filas necesarias de los shards 3, 2 y 1 (capas 11, 21 y 31) desde SSD interno.

## Capacidades

- Generacion de texto y conversacion en modo instructivo, heredadas del modelo base tencent/Hy4-flash.
- Razonamiento y respuesta multi-turno, segun la pipeline declarada de text-generation y la etiqueta conversational.
- Capacidades de codigo y matematicas: no documentadas en la informacion disponible para esta derivada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta rellenado.
- Vision: explicitamente omitida en esta derivada (el autor indica que vision y DFly no se incluyen).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentacion en Apple Silicon: ejecutar el modelo base Hy4-flash en equipos Mac con memoria unificada amplia mediante la bifurcacion de oMLX indicada, usando cache de expertos respaldada por SSD para los bancos que no caben en RAM.
- Investigacion sobre cuantizacion no calibrada: el esquema Walsh-Hadamard de 8 bits con grupo 128 permite estudiar la degradacion frente al BF16 original en tareas de generacion de texto, comparando los 1.350 tensores verificados byte a byte.
- Generacion de texto conversacional en local: para entornos con requisitos de privacidad donde no se quiera enviar prompts a la nube, siempre que se acepten las limitaciones de velocidad reportadas (0,94 tokens/s en la prueba del autor).
- Validacion de integridad de checkpoints: el manifest y el aviso de cambios a nivel de fichero permiten auditar que tensores se modificaron y cuales se conservaron, util en flujos de verificacion de artefactos.
- Pruebas de despliegue con tablas externas: sirve para validar pipelines que combinan un nucleo cuantizado con embeddings BF16 descargados por separado, un patron util en entornos con almacenamiento limitado.
- Reproduccion de la prueba del autor: verificar la generacion de "Paris" y del token de fin en un M5 Ultra de 256 GiB, como caso de regresion minima para la bifurcacion de oMLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento reportado por el autor es una prueba corta de decodificacion: 0,94 tokens/s sobre 28 iteraciones con una cache de expertos de 16 GiB respaldada por SSD en un M5 Ultra con 256 GiB de RAM. El propio autor advierte que no es una cifra de velocidad en regimen completamente residente ni con batching.

## Requisitos de hardware

- VRAM/RAM estimada: el nucleo oMLX ocupa 167.239.498.812 bytes (unos 155,7 GiB) en 141 shards, mas 118,02 GiB de tablas de embeddings BF16 externas; el total supera los 270 GiB de almacenamiento.
- GPU recomendadas: no aplica en el sentido habitual; el autor valido el modelo en un Apple M5 Ultra con 256 GiB de memoria unificada.
- Compatibilidad con GPU consumer: no disponible; no se documenta ejecucion en RTX 4090, A100, H100 ni similares.
- Opciones de despliegue: exclusivamente la bifurcacion de oMLX en el commit 6278134636a26853843e76186ba2b9203782c5bc; la version estandar oMLX v0.8.0 no carga esta arquitectura. No es GGUF, por lo que llama.cpp y Ollama no son aplicables tal cual; tampoco es un checkpoint autocontenido de Transformers.
- Almacenamiento: se recomienda SSD interno para los shards 3, 2 y 1 (capas 11, 21 y 31), de los que solo se leen las filas necesarias.
- Latencia y throughput: 0,94 tokens/s en la prueba corta citada; sin datos para regimen residente ni batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-oQh8-BF16-Engram (esta ficha) | 46.465.674.773 | no disponible | oMLX safetensors + tablas BF16 externas | tencent-hy-license | Hugging Face, 0 descargas |
| tencent/Hy4-flash (base) | no disponible en la informacion | no disponible | safetensors BF16 (148 shards) | tencent-hy-license | Hugging Face, oficial |
| Otras derivadas de Hy4-flash | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en los datos proporcionados; la unica referencia solida es el modelo base oficial de Tencent, del que esta publicacion es una derivada parcial.

## Limitaciones y advertencias

- No es una cuantizacion oficial de Tencent ni un checkpoint autocontenido: requiere descargar tablas de embeddings BF16 del repositorio original y una bifurcacion concreta de oMLX.
- La cuantizacion no es GPTQ calibrado; el autor no reporta evaluaciones de calidad frente al BF16 original mas alla de una prueba cualitativa de generacion.
- Vision y DFly estan omitidos: no sirve para tareas multimodales.
- Idiomas soportados no documentados; no se puede garantizar comportamiento multilingue.
- Longitud de contexto y parametros activos no disponibles; dificulta planificar despliegues con prompts largos.
- Rendimiento muy bajo en la unica prueba publicada (0,94 tokens/s) y sin datos de throughput con batching o en regimen residente.
- Licencia Tencent Hy v1.0 (no Apache 2.0): es necesario revisar las restricciones de uso comercial antes de cualquier despliegue en produccion.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible.
- El campo JSON de cualificacion del manifest original es un registro del momento de la conversion, no un resultado de inferencia posterior; las verificaciones se generan en la maquina del usuario y no son descargables.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni soporte practico mas alla del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apetersson/Hy4-flash-oQh8-BF16-Engram
- Modelo base oficial: https://huggingface.co/tencent/Hy4-flash
- Revision fijada del modelo base: https://huggingface.co/tencent/Hy4-flash/tree/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959
- Licencia Tencent Hy v1.0: https://huggingface.co/tencent/Hy4-flash/blob/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959/LICENSE
- Bifurcacion de oMLX con instrucciones: https://github.com/apetersson/omlx/blob/6278134636a26853843e76186ba2b9203782c5bc/docs/hy4-flash.md
- Aviso de cambios a nivel de fichero: MODIFICATIONS.md (incluido en el repositorio del modelo)
- Manifest de conversion: manifest.json (incluido en el repositorio del modelo)
