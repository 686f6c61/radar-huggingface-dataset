# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP-XS

## Resumen

AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP-XS es una version cuantizada en NVFP4 de la familia Qwen3.6, publicada por el usuario AEON-7. Se trata de un modelo multimodal (image-text-to-text) derivado del checkpoint BF16 AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 al que se le han aplicado dos transformaciones: una cuantizacion de 4 bits en formato NVFP4 generada con NVIDIA ModelOpt y un proceso de "abliteration" que elimina los mecanismos de rechazo, dando lugar a una variante sin censura. El sufijo XS indica que es la variante de menor huella de memoria dentro de la linea AEON Ultimate.

Aunque el nombre comercial indica 27B, el recuento real de parametros declarado en los safetensors es de 15.606.149.872 (aproximadamente 15,6 mil millones). El modelo combina atencion hibrida con capas Mamba y Gated DeltaNet, e incorpora cabezas MTP (multi-token prediction) nativas que permiten decodificacion especulativa. Esta pensado para desplegarse en GPUs Blackwell con VRAM dedicada (RTX 5090, RTX Pro 6000, B100, B200) y en plataformas de memoria unificada como DGX Spark / GB10.

El modelo esta marcado como superado por el autor: la propia model card recomienda migrar a AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED para trabajos nuevos, quedando esta ficha como referencia historica. Con 2.661 descargas y 61 likes en HuggingFace, su relevancia actual es principalmente como ejemplo de pipeline de cuantizacion NVFP4 sobre arquitecturas hibridas y como base para decodificacion especulativa con drafters externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion (segun tags: hybrid-attention, mamba, gated-deltanet); multimodal image-text-to-text |
| Parametros totales | 15.606.149.872 (segun safetensors); el nombre comercial indica 27B |
| Parametros activos | no aplica (no se indica que sea MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (via NVIDIA ModelOpt); checkpoint base en BF16; tag "8-bit" presente en metadatos |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 20,6 GB |
| Modelo base | AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 |
| Pipeline declarado | text-generation |
| Decodificacion especulativa | cabezas MTP nativas; compatible con drafter externo z-lab/Qwen3.6-27B-DFlash |
| Fecha de creacion | 2026-04-28 |
| Ultima actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

La informacion disponible no detalla el proceso de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF o DPO). Lo que si se especifica es la arquitectura objetivo sobre la que se trabaja: un transformer hibrido que combina atencion clasica con capas Mamba y Gated DeltaNet, etiquetado en los tags como hybrid-attention. A esto se suma una torre multimodal que habilita la entrada de imagenes y video (el ejemplo de despliegue oficial limita la entrada a 4 imagenes y 2 videos por prompt), y cabezas MTP (multi-token prediction) que permiten generar varios tokens por paso y servir como mecanismo de decodificacion especulativa.

La innovacion tecnica principal de esta publicacion es el pipeline de cuantizacion: los pesos se convierten a NVFP4 (formato de punto flotante de 4 bits de NVIDIA) mediante ModelOpt, manteniendo determinados componentes en mayor precision. El tag conv1d-preserved sugiere que las convoluciones de las capas Mamba se conservan sin cuantizar para preservar la estabilidad numerica del estado recurrente. El autor menciona ademas que la variante XS esta pensada para convivir con un drafter externo DFlash, cuyas capas usan atencion de ventana deslizante (ventana de 2048) y que requiere soporte especifico en vLLM para no degradar la aceptacion en contextos largos.

No se dispone de informacion en el material proporcionado sobre el numero de tokens de entrenamiento, la composicion del corpus ni el metodo exacto de abliteration aplicado (direccion de rechazo eliminada, capas afectadas, etc.).

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation, con tag conversational).
- Entrada multimodal image-text-to-text: acepta imagenes y video ademas de texto; el ejemplo oficial de servido configura un limite de 4 imagenes y 2 videos por prompt.
- Capacidades multilingues: ingles, chino y otros idiomas (tag multilingual).
- Razonamiento con modo de pensamiento: el ejemplo de despliegue usa --reasoning-parser qwen3, lo que implica soporte de bloques de razonamiento separados.
- Tool calling / function calling: se sirve con --tool-call-parser qwen3_coder y --enable-auto-tool-choice, por lo que soporta llamadas a herramientas y eleccion automatica.
- Generacion de codigo: el parser de tool calls esta basado en el formato qwen3_coder, orientado a flujos de codigo y agentes.
- Decodificacion especulativa mediante cabezas MTP nativas, y tambien mediante drafter externo (z-lab/Qwen3.6-27B-DFlash) con num_speculative_tokens configurable.
- Sin censura: el proceso de abliteration elimina las respuestas de rechazo del modelo base.
- Compatibilidad con endpoints: tag endpoints_compatible.

## Casos de uso

- Asistente conversacional sin filtros de contenido: el proceso de abliteration elimina los rechazos del modelo base, lo que resulta util en investigacion sobre alineacion, red teaming y analisis de comportamiento de modelos, donde se necesita observar la respuesta sin capas de rechazo que la enmascaren.
- Atencion al cliente automatizada: admite conversaciones multi-turno con soporte de tool calling (parser qwen3_coder), lo que permite conectar el modelo a sistemas de tickets, bases de conocimiento o CRMs mediante llamadas a funciones.
- Extraccion de informacion de documentos con imagenes: al ser image-text-to-text, puede procesar facturas, formularios escaneados o capturas y devolver campos estructurados, integrándose en un pipeline de digitalizacion.
- Analisis de video corto: el limite de 2 videos por prompt permite tareas de resumen o descripcion de clips breves, util en moderacion de contenido o catalogacion de material audiovisual.
- Generacion de codigo en produccion: con soporte de tool calling y eleccion automatica de herramienta, puede integrarse en pipelines de CI/CD para generar parches, revisar diffs o invocar comandos a traves de funciones expuestas.
- Agentes multi-paso: las cabezas MTP y la compatibilidad con decodificacion especulativa reducen la latencia por token, lo que abarata bucles de razonamiento largos con muchas iteraciones de herramienta.
- Inferencia de alto rendimiento en hardware Blackwell: al estar cuantizado en NVFP4, es adecuado para servir en RTX 5090, RTX Pro 6000, B100 o B200, donde el formato de 4 bits nativo acelera el calculo respecto a FP8 o BF16 en la misma VRAM.
- Despliegue en estaciones de memoria unificada: el autor documenta un recetario para DGX Spark / GB10 con vLLM, orientado a un unico equipo de sobremesa que sirve el modelo de forma local sin GPU de datacenter.
- Base para investigacion en cuantizacion: sirve como referencia para estudiar el impacto de NVFP4 con preservacion de convoluciones (conv1d-preserved) sobre arquitecturas hibridas Mamba/DeltaNet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card hace referencia a una tabla de rendimiento en produccion medida sobre DGX Spark GB10 con el contenedor aeon-vllm-ultimate y DFlash con num_speculative_tokens=10, centrada en la tasa de aceptacion del drafter en contextos de aproximadamente 9.000 tokens, pero el contenido proporcionado esta truncado y no incluye los valores completos.

Los unicos datos objetivos disponibles sobre esta publicacion son de adopcion: 2.661 descargas y 61 likes en HuggingFace, con un tamano de repositorio de 20,6 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. Como referencia, el repositorio ocupa 20,6 GB, por lo que se necesita un dispositivo con al menos ese espacio de almacenamiento y una VRAM del mismo orden (los pesos NVFP4 correspondientes a 15,6 mil millones de parametros ocupan aproximadamente 8 GB, pero el repositorio incluye ademas componentes en mayor precision, torre multimodal y cabezas MTP).
- GPUs recomendadas segun los tags del autor: RTX 5090, RTX Pro 6000, B100 y B200. El tag 32gb sugiere que 32 GB de VRAM es el objetivo de referencia para esta variante XS.
- Arquitecturas soportadas: sm_120 (Blackwell consumer/prosumer) y sm_100 (Blackwell datacenter). El soporte de NVFP4 en vLLM esta limitado a estas arquitecturas.
- Cabe en GPU de consumo: si, en RTX 5090 (32 GB) segun los propios tags del modelo, siempre que se use la compilacion de vLLM con soporte NVFP4 para sm_120.
- Plataforma de memoria unificada: DGX Spark / GB10, con la advertencia del autor de mantener --gpu-memory-utilization entre 0,6 y 0,7, ya que por encima de 0,8 el pool compartido CPU+GPU entra en page thrashing y bloquea el equipo.
- Opciones de despliegue: vLLM mediante el contenedor ghcr.io/aeon-7/aeon-vllm-ultimate:latest (Spark/GB10) o ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest (RTX discreta); tambien es cargable con la libreria transformers. En el arranque hay que tener en cuenta que el ENTRYPOINT de la imagen es /bin/bash, por lo que se debe usar --entrypoint vllm seguido de serve.
- Flags de servido relevantes: --quantization modelopt, --mamba-cache-dtype float32, --reasoning-parser qwen3, --tool-call-parser qwen3_coder, --enable-auto-tool-choice, --mm-encoder-tp-mode data, --max-num-seqs 64, --max-num-batched-tokens 16384, --enable-chunked-prefill, --enable-prefix-caching, --trust-remote-code.
- Decodificacion especulativa: configurar con --speculative-config '{"method":"dflash","model":"/drafter","num_speculative_tokens":10}' usando el drafter z-lab/Qwen3.6-27B-DFlash.
- Latencia y throughput: no disponibles. La model card indica que la tasa de aceptacion del drafter es la metrica estable a considerar, por delante de los tok/s de una sola muestra, pero no se aportan cifras completas en el material recibido.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP-XS (este) | 15.606.149.872 | NVFP4 (ModelOpt) | no disponible | Si (imagen y video) | apache-2.0 | HuggingFace, 2.661 descargas |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP | no disponible | NVFP4 | no disponible | Si | apache-2.0 | HuggingFace; segun el autor, misma velocidad y mayor calidad de evaluacion que la variante XS |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 | no disponible | BF16 | no disponible | Si | apache-2.0 | HuggingFace; es el modelo base del que deriva esta cuantizacion |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | no disponible | NVFP4 + FP8 | no disponible | no disponible | no disponible | HuggingFace; sucesor recomendado por el autor, con mejor capacidad segun la propia model card |
| z-lab/Qwen3.6-27B-DFlash | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace; no es un modelo de chat, es un drafter de decodificacion especulativa |

No se dispone de datos comparativos de rendimiento numerico entre estas variantes en la informacion proporcionada. Las afirmaciones de superioridad de una variante sobre otra proceden exclusivamente de la model card del autor y no estan respaldadas por cifras verificables en el material recibido.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado deliberadamente los mecanismos de rechazo. Puede generar contenido que otros modelos declinarian, lo que implica riesgos de seguridad, cumplimiento normativo y reputacion si se despliega sin capas de filtrado propias.
- Sesgos: no se documenta ninguna evaluacion de sesgo. El modelo base procede de la familia Qwen, con sesgos propios del corpus de entrenamiento (predominio de contenido en ingles y chino). No hay informacion sobre mitigaciones aplicadas.
- Alucinacion: no se han publicado metricas de veracidad. El modo de razonamiento con bloques de pensamiento no garantiza correccion factual.
- Longitud de contexto: no disponible. No se puede dimensionar el uso en tareas de contexto largo sin ese dato.
- Idiomas: el soporte declarado se limita a ingles, chino y multilingue generico. El rendimiento en castellano no esta documentado ni evaluado.
- Restricciones de hardware: la cuantizacion NVFP4 exige arquitecturas Blackwell (sm_100 o sm_120). No es desplegable en GPUs Ampere, Ada Lovelace, Turing ni en aceleradores de otros fabricantes sin recompilar o reconvertir los pesos.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el modelo derivado ni sobre las implicaciones legales del contenido generado por una variante sin filtros. Conviene revisar las condiciones del modelo base Qwen subyacente.
- Documentacion incompleta: no se especifican tokens de entrenamiento, composicion del dataset, ni el metodo exacto de abliteration. La model card esta en gran parte truncada en el material disponible y parte de sus tablas de rendimiento no son legibles.
- Modelo superado: el propio autor marca esta publicacion como obsoleta y recomienda su sucesor Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED. Se mantiene en linea solo por razones historicas y para descargas existentes.
- Dependencia de un contenedor concreto: el rendimiento documentado (aceptacion del drafter en contexto largo, inmunidad de la cache de prefijos) depende de parches especificos incluidos en la imagen aeon-vllm-ultimate. Con vLLM estandar es probable que se pierdan esas optimizaciones y que la decodificacion especulativa se degrade mas alla de 2.048 tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP-XS
- Modelo base en BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Variante de mayor calidad (no XS): https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP
- Sucesor recomendado por el autor: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Drafter de decodificacion especulativa: https://huggingface.co/z-lab/Qwen3.6-27B-DFlash
- Repositorio de despliegue, operaciones y benchmarks: https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash
- Repositorio del contenedor vLLM: https://github.com/AEON-7/vllm-ultimate-dgx-spark
- Contenedor para DGX Spark / GB10: ghcr.io/aeon-7/aeon-vllm-ultimate:latest
- Contenedor para RTX discreta: ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest
