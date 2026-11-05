# paincupid/Qwen3-ASR-1.7B-Original

## Resumen

Qwen3-ASR-1.7B-Original es un espejo (mirror) de los pesos oficiales en BF16 del modelo Qwen3-ASR-1.7B, publicado originalmente por Qwen / Alibaba Cloud bajo licencia Apache-2.0. El repositorio lo mantiene el usuario paincupid como copia de compatibilidad independiente y no constituye una publicacion oficial del equipo de Qwen. El modelo es un sistema de reconocimiento automatico del habla (ASR) construido sobre la familia Qwen3, con 2.349.217.408 parametros totales segun los pesos en safetensors y un tamano de repositorio de 4,7 GB, coherente con pesos en precision BF16.

La relevancia de este repositorio es fundamentalmente de preservacion y trazabilidad: incluye los pesos, tokenizers y entradas de conversion locales fijadas, junto con un fichero provenance.json y SHA256SUMS que documentan commits upstream, tamanos de fichero y hashes SHA-256. Ademas, conserva la model card original como UPSTREAM-README.md cuando esta disponible. Para un desarrollador, esto significa una fuente verificable de los pesos originales sin modificaciones, util cuando el repositorio upstream cambia o desaparece.

No se dispone de informacion detallada sobre la arquitectura interna, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento en la informacion proporcionada. La ficha se limita, por tanto, a lo que puede verificarse a partir de los metadatos y la model card del espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de pipeline `qwen3_asr`; se asume transformer para ASR, sin confirmar) |
| Parametros totales | 2.349.217.408 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible la arquitectura concreta del modelo, mas alla de la etiqueta `qwen3_asr` que indica que se trata de un modelo de reconocimiento automatico del habla integrado en la familia Qwen3. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El repositorio es un espejo byte a byte de los pesos oficiales, por lo que cualquier innovacion tecnica del modelo corresponderia al trabajo original de Qwen / Alibaba Cloud, no a este repositorio.

Lo unico verificable a nivel tecnico es la preservacion de los artefactos de conversion y validacion empleados por la receta de exportacion del mantenedor, con sus avisos upstream intactos. El espejo no concede derechos adicionales sobre esos ficheros.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto), segun la etiqueta de pipeline `qwen3_asr`.
- Preservacion byte a byte de pesos, tokenizers y ficheros de conversion, con hashes SHA-256 para verificacion de integridad.
- Conservacion de la model card original como UPSTREAM-README.md cuando esta presente.
- Trazabilidad mediante provenance.json con commits upstream fijados y tamanos de fichero.
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingues, vision, audio adicional o modos de pensamiento.

## Casos de uso

- Verificacion de integridad de pesos: un equipo puede descargar este espejo y comprobar los SHA-256 de SHA256SUMS contra los ficheros para asegurar que los pesos BF16 no han sido alterados antes de desplegarlos en produccion.
- Recuperacion ante caidas del repositorio upstream: si el repositorio oficial de Qwen3-ASR-1.7B deja de estar disponible o cambia, este espejo permite seguir obteniendo los pesos originales con trazabilidad documentada.
- Auditoria de procedencia: el fichero provenance.json permite a un equipo de compliance rastrear los commits upstream y los tamanos de fichero exactos usados en una build concreta.
- Reproducibilidad de pipelines de conversion: los helpers y fixtures de conversion preservados permiten reproducir la receta de exportacion con las mismas entradas fijadas.
- Base para transcripcion de audio en castellano: aunque no se confirman los idiomas soportados, un modelo ASR de 2,3 mil millones de parametros es candidato razonable para pipelines de subtitulado o actas de reunion, previa validacion empirica del idioma.
- Despliegue en infraestructura propia: al publicarse en safetensors BF16 y con licencia Apache-2.0, el modelo puede integrarse en servicios internos de transcripcion sin restricciones de uso comercial derivadas de la licencia del espejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,7 GB solo para pesos, mas memoria para activaciones y cache de atencion; en la practica se recomienda reservar al menos 8-12 GB de VRAM para inferencia comoda, aunque la cifra exacta no esta confirmada.
- Cuantizacion: no se documentan tipos de cuantizacion en la informacion disponible; al ser un espejo BF16, seria necesario generar versiones GGUF o AWQ/GPTQ por cuenta propia.
- GPU recomendadas: no disponible. Por tamano, una RTX 4090 (24 GB) o una A100 (40/80 GB) deberian acomodar el modelo en BF16 sin problemas, pero no hay confirmacion oficial.
- Cabe en GPU de consumo: probablemente si en tarjetas con 12 GB o mas de VRAM en BF16, aunque no esta verificado.
- Opciones de despliegue: no disponible. Al ser un espejo de pesos safetensors, seria compatible con frameworks que soporten la arquitectura `qwen3_asr`, pero no se detalla ninguno.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Este repositorio no es la publicacion oficial: es un espejo mantenido por paincupid, que declara no ser el editor original. Cualquier problema de calidad o comportamiento del modelo debe atribuirse al trabajo original de Qwen / Alibaba Cloud.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion, limitaciones de contexto o de idioma del modelo.
- La licencia Apache-2.0 permite uso comercial, pero el espejo no concede derechos adicionales sobre los ficheros de conversion y validacion preservados, cuyos avisos upstream siguen aplicando.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso o validacion por parte de la comunidad.
- No se documentan tipos de cuantizacion, idiomas ni pipeline oficial, lo que dificulta planificar un despliegue en produccion sin trabajo adicional de validacion.
- La fecha de creacion del repositorio (2026-11-05) es posterior a la mayoria de releases publicos conocidos de la familia Qwen3; conviene verificar la procedencia contra el repositorio oficial antes de confiar en el espejo.

## Enlaces

- [HuggingFace: paincupid/Qwen3-ASR-1.7B-Original](https://huggingface.co/paincupid/Qwen3-ASR-1.7B-Original)
- No se han encontrado en la busqueda web otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
