# Felladrin/gguf-BF16-Comet-60B-A12B

## Resumen

Comet 60B A12B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Multiverse Computing, obtenido mediante la compresion del modelo NVIDIA Nemotron 3.5 Super con la tecnica propietaria CompactifAI. El resultado es un modelo de aproximadamente 60.284 millones de parametros totales, de los cuales 12.000 millones estan activos por token, lo que reduce el coste computacional de inferencia respecto al modelo original manteniendo una arquitectura hibrida basada en capas Mamba2 y atencion, con cabezas de prediccion multi-token (MTP).

El repositorio que nos ocupa, publicado por el usuario Felladrin, no es una nueva version del modelo, sino una conversion a formato GGUF en precision BF16 del checkpoint original de Multiverse Computing. Se ofrece como punto de partida para generar cuantizaciones posteriores (Q4_K_M, Q8_0, etc.) mediante llama.cpp, e incluye la cabeza MTP como bloque adicional para permitir decodificacion especulativa. La torre de vision ha sido eliminada, por lo que esta variante es exclusivamente de texto.

La relevancia de esta ficha radica en que Comet 60B se presenta como una alternativa comprimida a Nemotron 3.5 Super, con licencia OpenMDW 1.1, y este GGUF facilita su despliegue y cuantizacion en entornos locales. El modelo esta orientado a generacion de texto en ingles y su uso principal es como base para pipelines de cuantizacion y experimentacion con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (Mamba2 + atencion) con cabeza MTP; familia nemotron_h_moe |
| Parametros totales | 60.284.372.224 (60,28 B) |
| Parametros activos | 12 B (A12B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (este repo); Q4_K_M y Q8_0 disponibles en repos derivados |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | GGUF (BF16); el modelo base original en safetensors |

## Arquitectura y entrenamiento

Comet 60B A12B es un modelo derivado de NVIDIA Nemotron 3.5 Super, comprimido por Multiverse Computing mediante CompactifAI. La arquitectura pertenece a la familia nemotron_h_moe, que combina capas de estado espacio-temporal (Mamba2) con capas de atencion, organizadas en un esquema de mezcla de expertos. La anchura de los expertos es de 2432, dato relevante porque no es multiplo de 256 y provoca que llama.cpp recurra a un tipo alternativo en 41 de los 781 tensores al generar cuantizaciones k-quant. El modelo incorpora una cabeza de prediccion multi-token (MTP) que, en este GGUF, se conserva como bloque adicional y habilita la decodificacion especulativa en llama.cpp.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO en la informacion proporcionada. La model card de este repositorio remite a la model card original de Multiverse Computing para los detalles del modelo base, y unicamente documenta el proceso de conversion: `convert_hf_to_gguf.py --outtype bf16` con llama.cpp commit `f477f795` y transformers 5.22.2, a partir de la revision `8df6f8a8` del repositorio original. La torre de vision fue eliminada durante la conversion.

## Capacidades

- Generacion de texto conversacional en ingles, segun el pipeline declarado (text-generation) y la etiqueta conversational.
- Razonamiento y generacion de codigo: no se documentan capacidades especificas en la informacion disponible; se infieren del modelo base Nemotron 3.5 Super, pero no hay confirmacion en la model card.
- Decodificacion especulativa mediante la cabeza MTP incluida como bloque adicional, aprovechable en llama.cpp.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades de vision: no disponibles; la torre de vision fue eliminada en esta conversion, por lo que es exclusivamente texto.
- Capacidades de audio: no disponibles.

## Casos de uso

- Generacion de cuantizaciones para despliegue local: este GGUF BF16 sirve como entrada para `llama-quantize` y producir versiones Q4_K_M, Q8_0 u otras, permitiendo adaptar el modelo a distintos presupuestos de memoria. Es el proposito explicito del repositorio.
- Experimentacion con decodificacion especulativa: al conservar la cabeza MTP, permite probar el modo de speculative decoding de llama.cpp y medir la aceleracion en inferencia sobre hardware local.
- Prototipado de asistentes conversacionales en ingles: el modelo puede emplearse en entornos de desarrollo para validar flujos de chat multi-turno antes de pasar a produccion con el checkpoint original.
- Investigacion sobre compresion de modelos: util para estudiar el impacto de CompactifAI comparando Comet 60B con Nemotron 3.5 Super en tareas controladas de generacion de texto.
- Evaluacion comparativa de arquitecturas hibridas Mamba2 + atencion: permite medir throughput y calidad frente a transformers puros de tamano similar en pipelines de llama.cpp.
- Despliegue en servidores de inferencia con llama.cpp: la version Q4_K_M o Q8_0 derivada puede integrarse en servicios de generacion de texto autoalojados, con la ventaja de los 12 B de parametros activos por token.
- Base para fine-tuning o adaptadores: aunque no se documenta soporte especifico, el formato GGUF y el checkpoint original permiten explorar ajustes posteriores sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el archivo GGUF ocupa 120.666.125.824 bytes (aproximadamente 112,4 GiB), por lo que requiere al menos 120 GB de memoria disponible para cargar los pesos, mas overhead de contexto y cache KV.
- VRAM estimada para cuantizaciones derivadas: no disponible de forma explicita; la Q4_K_M y Q8_0 estan publicadas en repos separados y reduciran sustancialmente el requisito, pero no se proporcionan cifras concretas.
- GPU recomendadas: para BF16 se necesitan aceleradores con 120 GB o mas de memoria, como H100 80 GB en configuracion multi-GPU, A100 80 GB en multi-GPU o H200. No cabe en una unica GPU consumer.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en BF16. Las versiones cuantizadas Q4_K_M podrian aproximarse a los 35-40 GB, lo que seguiria requiriendo multi-GPU consumer o CPU offloading, aunque no hay cifras confirmadas.
- Opciones de despliegue: llama.cpp (probado con build b12223 para cuantizacion), y por extension cualquier frontend compatible con GGUF como Ollama o llama-server. vLLM y TGI no se mencionan para este formato; el modelo base original en safetensors seria la via para esos motores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Comet 60B A12B (este repo) | 60,28 B | 12 B | no disponible | OpenMDW 1.1 | GGUF BF16 | Version comprimida de Nemotron 3.5 Super; solo texto |
| NVIDIA Nemotron 3.5 Super | no disponible | no disponible | no disponible | OpenMDW 1.1 | safetensors | Modelo original del que deriva Comet; incluye vision |
| Comet 60B A12B original (Multiverse Computing) | 60,28 B | 12 B | no disponible | OpenMDW 1.1 | safetensors | Checkpoint fuente, con torre de vision |
| Felladrin/gguf-Q4_K_M-Comet-60B-A12B | 60,28 B | 12 B | no disponible | OpenMDW 1.1 | GGUF Q4_K_M | Cuantizacion derivada con cabeza MTP |
| Felladrin/gguf-Q8_0-Comet-60B-A12B | 60,28 B | 12 B | no disponible | OpenMDW 1.1 | GGUF Q8_0 | Cuantizacion derivada con cabeza MTP |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: la etiqueta de idioma es `en`, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Sin vision: la torre de vision fue eliminada en esta conversion, a diferencia del modelo base original.
- Riesgo de alucinacion: no se documenta mitigacion especifica en la model card; como todo modelo generativo, puede producir contenido facticamente incorrecto.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo o seguridad en la documentacion proporcionada.
- Licencia OpenMDW 1.1: es la misma que la del modelo base y Nemotron 3.5 Super. Es necesario revisar los terminos del acuerdo antes de uso comercial, ya que OpenMDW establece condiciones especificas que no se detallan en esta ficha.
- Naturaleza derivada: Comet 60B es un derivado de NVIDIA Nemotron 3.5 Super desarrollado por Multiverse Computing; los terminos y obligaciones de atribucion del modelo original aplican.
- Este repositorio concreto es una conversion de terceros (Felladrin), no una publicacion oficial de Multiverse Computing ni de NVIDIA; la calidad de la conversion depende del commit de llama.cpp empleado.
- Limitacion tecnica en cuantizacion: la anchura de experto 2432 no es multiplo de 256, lo que hace que llama.cpp use un tipo alternativo en 41 de los 781 tensores al generar k-quants; es esperado, pero conviene verificar la calidad de las cuantizaciones resultantes.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin consultar la model card original.
- Sin benchmarks publicados en esta informacion: no es posible evaluar su calidad relativa frente a alternativas sin recurrir a la documentacion del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Felladrin/gguf-BF16-Comet-60B-A12B
- Modelo base original: https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_BF16
- Cuantizacion Q4_K_M: https://huggingface.co/Felladrin/gguf-Q4_K_M-Comet-60B-A12B
- Cuantizacion Q8_0: https://huggingface.co/Felladrin/gguf-Q8_0-Comet-60B-A12B
- Multiverse Computing: https://www.multiversecomputing.com
- NVIDIA en Hugging Face: https://huggingface.co/nvidia
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b12223: https://github.com/ggml-org/llama.cpp/releases/tag/b12223
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
