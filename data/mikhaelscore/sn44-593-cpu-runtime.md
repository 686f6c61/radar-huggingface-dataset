# MikhaelScore/sn44-593-cpu-runtime

## Resumen

El repositorio `MikhaelScore/sn44-593-cpu-runtime` no contiene un modelo de lenguaje, sino un archivo OCI (Open Container Initiative) para Linux amd64, empaquetado y publicado en Hugging Face Hub bajo el nombre "Tokoyo-1 testnet 593 CPU runtime". Segun la model card, se trata de un artefacto de infraestructura construido para un ensayo de admision de CPU ("CPU admission rehearsal") dentro de la testnet Tokoyo-1, y el autor indica explicitamente que no incluye ningun checkpoint de minero ni depende de los pesos del validador de la testnet.

Por tanto, no hay arquitectura neuronal, parametros, contexto ni capacidades de inferencia que describir: el contenido es una imagen de contenedor de aproximadamente 353,6 MB (0,4 GB de tamano de repositorio) con hash SHA-256 documentado. Su relevancia es operativa para quien necesite replicar el entorno de ejecucion de esa testnet, no para tareas de generacion de texto, codigo o vision.

La ficha se redacta igualmente con la estructura completa, marcando como "no disponible" todos los campos que no aplican o no figuran en la informacion proporcionada, y advirtiendo de que cualquier uso como modelo de IA seria un error de categoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un archivo OCI para Linux amd64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el artefacto es un archivo OCI (`.tar`/archivo OCI) de 353.627.432 bytes |

Datos adicionales del artefacto:

| Campo | Valor |
|---|---|
| Hash SHA-256 del archivo | `fcbe619d9b89dc60e7766da186652349f26c228a807d0db9c62627dc3f2e83bd` |
| Manifiesto OCI | `sha256:3f0fac09a3cc9c2d62f589e9020928f7cb031cf93a1af2e25c202605a2c9673e` |
| Plataforma | Linux amd64 |
| Tamano del repositorio | 0,4 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-11-26 |
| Fecha de actualizacion | 2026-11-26 |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es una imagen de contenedor en formato OCI generada para un ensayo de admision de CPU en la testnet Tokoyo-1. La model card no documenta capas, atencion, mezcla de expertos, datos de entrenamiento, tokens procesados, RLHF, DPO ni ninguna tecnica de optimizacion de inferencia.

Lo unico verificable tecnicamente es el empaquetado: archivo OCI de 353.627.432 bytes, manifiesto OCI con digest `sha256:3f0fac09...c9673e` y hash del archivo `fcbe619d...f2e83bd`. El autor senala que la imagen equivalente publicada en un registro pullable esta pendiente de acceso a Hugging Face Container Images, por lo que en el momento de la publicacion el unico canal de distribucion es la descarga del archivo desde el Hub.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe codigo ni procesa imagenes.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision ni audio.
- Su funcionalidad es la de un artefacto de despliegue: permite importar una imagen de contenedor Linux amd64 en un runtime compatible con OCI para reproducir el entorno del ensayo de admision de CPU de Tokoyo-1.

## Casos de uso

- Reproduccion de entornos de testnet: importar el archivo OCI con `docker load`, `podman load` o `ctr images import` para reconstruir el runtime exacto usado en el ensayo de admision de CPU 593 de Tokoyo-1.
- Verificacion de integridad de artefactos: comprobar el SHA-256 (`fcbe619d...f2e83bd`) y el digest del manifiesto OCI antes de desplegar, como parte de una cadena de suministro de software verificable.
- Auditoria de pipelines de publicacion: comparar el artefacto del Hub con la imagen de registro cuando esta ultima este disponible, para validar que el empaquetado es identico.
- Laboratorios de infraestructura: usar la imagen como base para probar politicas de admision de CPU en entornos aislados, sin depender de los pesos del validador de la testnet.
- Formacion y documentacion interna: disponer de un ejemplo real de archivo OCI con metadatos completos (tamano, hash, manifiesto) para explicar flujos de distribucion de contenedores en el Hub.
- Archivado a largo plazo: conservar el artefacto como referencia historica del estado del runtime en la fecha de publicacion (26 de noviembre de 2026), dado que no depende de checkpoints de minero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no aplican metricas como MMLU, HumanEval o GSM8K. Tampoco se documentan metricas de rendimiento del contenedor (latencia de arranque, consumo de CPU o memoria).

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia de red neuronal.
- GPU: no aplica; la imagen es para Linux amd64 y el ensayo se describe como de CPU.
- CPU: se requiere una maquina Linux amd64 con runtime compatible con OCI (Docker, Podman, containerd) y espacio en disco suficiente para el archivo de 353,6 MB mas la capa descomprimida, cuyo tamano no se detalla.
- Memoria RAM y numero de nucleos: no disponibles.
- Despliegue: importacion del archivo OCI (`docker load`, `podman load`, `ctr images import`); la imagen pullable desde registro esta pendiente de acceso a Hugging Face Container Images.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otros artefactos OCI comparables de la misma testnet o de proyectos equivalentes, ni modelos de IA con los que establecer una comparacion significativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: usarlo como sustituto de un LLM en cualquier pipeline de IA producira fallos.
- La imagen pullable desde registro no esta disponible aun; solo existe el archivo OCI descargable desde el Hub, lo que complica despliegues automatizados.
- El autor declara que el artefacto no contiene checkpoint de minero y es independiente de los pesos del validador; no debe interpretarse como un modelo entrenado ni como evidencia de rendimiento de la red.
- No se documentan dependencias, variables de entorno, puntos de entrada ni instrucciones de ejecucion mas alla de la importacion del archivo.
- No se especifican los idiomas ni la composicion interna del contenedor, por lo que la superficie de ataque y el contenido exacto no son auditables solo con la model card.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y aviso; no obstante, al no haber modelo ni pesos, la licencia se aplica al artefacto de infraestructura.
- Riesgo de caducidad: al estar ligado a un ensayo concreto de una testnet, el artefacto puede quedar obsoleto respecto a versiones posteriores del runtime.
- No hay senales de adopcion (0 descargas, 0 likes) ni validacion externa de la integridad del contenido por parte de terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MikhaelScore/sn44-593-cpu-runtime
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales.
