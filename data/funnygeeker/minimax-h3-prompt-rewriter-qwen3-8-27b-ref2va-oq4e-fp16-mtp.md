# funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-oQ4e-fp16-mtp

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-oQ4e-fp16-mtp es una cuantizacion mixta del modelo lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA, publicada por el usuario funnygeeker. El modelo original esta orientado a la reescritura de prompts (prompt rewriting) para el sistema MiniMax-H3, y esta construido sobre una base de la familia Qwen (tag `qwen3_5`), con un total de 27.781 millones de parametros. La version aqui descrita ha sido cuantizada con la herramienta oQ (oMLX v0.7.3) en precision mixta, con un promedio efectivo de 5,310 bits por peso.

La relevancia de esta ficha radica en que ofrece una via para ejecutar un modelo de ~27,8B parametros en hardware Apple Silicon mediante MLX, reduciendo el checkpoint a 17,172 GiB de almacenamiento efectivo (18,439 GB en el repositorio). Incorpora una cabeza MTP (multi-token prediction) que puede habilitar decodificacion especulativa, y conserva un componente de vision de 0,461B parametros.

No obstante, la informacion publicada es muy limitada: no se detallan datos de entrenamiento, licencia, idiomas ni benchmarks. Esta ficha refleja exclusivamente lo que consta en la model card y en los metadatos de Hugging Face, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, tag `qwen3_5`); incluye cabeza MTP y modulo de vision |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit (grupo 64), 5-bit, 6-bit, 8-bit, FP16 y FP32; promedio efectivo 5,310 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `mlx`) |
| Tamano del repositorio | 18,5 GB (17,172 GiB de pesos logicos) |
| Modelo base | lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA |
| Herramienta de cuantizacion | oQ (oMLX v0.7.3) |
| Descargas / likes | 86 / 0 |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 26,896B | 16,272 GB / 15,155 GiB |
| Vision | 0,461B | 1,843 GB / 1,716 GiB |
| Cabeza MTP | 0,425B | 0,323 GB / 0,301 GiB |
| Total | 27,781B | 18,439 GB / 17,172 GiB |

Distribucion de bits por peso:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, grupo 64 | 19,393B | 69,807% | 10,160 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 6,579B | 23,680% | 4,212 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 1,282B | 4,615% | 0,970 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,011B | 0,041% | 0,011 GiB | 8,50 |
| FP16 | 0,055B | 0,198% | 0,103 GiB | 16,00 |
| FP32 | 0,461B | 1,658% | 1,716 GiB | 32,00 |
| Total | 27,781B | 100% | 17,172 GiB | 5,310 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de los tags (`qwen3_5`, `mtp`) y del desglose de componentes. Se trata de un transformer de aproximadamente 27,8B parametros con tres bloques diferenciados: un modelo de lenguaje de 26,896B, un modulo de vision de 0,461B y una cabeza MTP de 0,425B. La presencia de la cabeza MTP sugiere soporte para prediccion multi-token, potencialmente util para decodificacion especulativa en MLX, aunque no se documenta su uso.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo original paso por fases de RLHF, DPO o ajuste supervisado. El proposito declarado por el nombre del modelo base es la reescritura de prompts para MiniMax-H3, lo que indica un ajuste orientado a esa tarea concreta. La unica innovacion tecnica documentada es la cuantizacion mixta de oQ, que asigna 4 bits a la mayor parte de los pesos (69,807%), 5 bits a una porcion relevante (23,680%) y mantiene en FP32 los tensores mas sensibles (1,658%, principalmente el modulo de vision).

## Capacidades

- Reescritura de prompts: la funcion principal declarada del modelo base es reformular o enriquecer prompts para el sistema MiniMax-H3.
- Generacion de texto: al estar basado en un modelo de lenguaje de 26,896B parametros, dispone de capacidad generativa general, aunque no se documentan tareas adicionales.
- Procesamiento de vision: incluye un modulo de vision de 0,461B parametros, lo que indica capacidad multimodal de entrada de imagen.
- Prediccion multi-token: la cabeza MTP de 0,425B parametros puede habilitar decodificacion especulativa, si bien no se detalla su integracion.
- Tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues: no disponible en la informacion publicada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion publicada.

## Casos de uso

- Reescritura de prompts para generacion de video o imagen con MiniMax-H3: el modelo recibe un prompt breve del usuario y lo expande en una descripcion detallada con atributos de estilo, composicion y movimiento; es el uso para el que fue ajustado el modelo base.
- Normalizacion de prompts en pipelines de produccion: integrado como etapa previa a un generador, permite estandarizar la formulacion de instrucciones y reducir la varianza en las salidas del sistema final.
- Enriquecimiento de descripciones a partir de imagenes de referencia: gracias al modulo de vision de 0,461B parametros, puede analizar una imagen de referencia y generar un prompt textual que la describa para su reutilizacion (el sufijo Ref2VA del modelo base apunta a este flujo referencia-a-video/audio).
- Prototipado local en Apple Silicon: al estar en formato MLX y ocupar 17,172 GiB, permite experimentar con un modelo de ~27,8B en un Mac con memoria unificada suficiente, sin depender de GPUs dedicadas.
- Evaluacion de tecnicas de cuantizacion mixta: sirve como caso de estudio para comparar la calidad de oQ a 5,310 bits/peso frente al checkpoint original en FP16/BF16.
- Generacion asistida de descripciones tecnicas: puede emplearse para transformar especificaciones escuetas en parrafos descriptivos estructurados, aprovechando su base Qwen de 26,896B parametros.
- Investigacion sobre decodificacion especulativa: la cabeza MTP incluida permite estudiar el impacto de la prediccion multi-token en latencia dentro del ecosistema MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 17,2 GiB solo para los pesos; con overhead de contexto y buffers de ejecucion, se recomienda un minimo de 24 GB de memoria unificada.
- GPU recomendadas: no se documentan; el formato MLX esta orientado a Apple Silicon (series M1/M2/M3/M4), no a GPU NVIDIA.
- Compatibilidad con GPU de consumo: en el ecosistema Apple, cabe en equipos con 32 GB de memoria unificada o superior; en 24 GB el margen es muy ajustado. No es directamente ejecutable en RTX 4090 mediante MLX.
- Opciones de despliegue: MLX (libreria declarada) y oMLX; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint cuantizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (oQ4e-fp16-mtp) | 27,781B | no disponible | safetensors MLX, 5,310 bits/peso | no disponible | Cuantizacion mixta para Apple Silicon |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA | 27,8B (aproximado) | no disponible | no disponible | no disponible | Modelo base sin cuantizar |
| Alternativas de la familia Qwen de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- No se documentan idiomas soportados; el rendimiento fuera del ingles o del chino (idiomas habituales en la familia Qwen) es incierto.
- No se publican benchmarks ni evaluaciones de calidad tras la cuantizacion; la perdida de precision respecto al checkpoint original no esta medida.
- La cuantizacion mixta a 5,310 bits/peso puede degradar tareas sensibles a precision numerica, como el razonamiento matematico o la generacion de codigo.
- El modelo esta especializado en reescritura de prompts; su uso como asistente general no esta validado.
- Riesgo de alucinacion inherente a los modelos generativos de esta escala; no hay evaluaciones de fidelidad publicadas.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a servidores NVIDIA sin reconversion.
- El repositorio tiene solo 86 descargas y 0 likes, por lo que la validacion por parte de la comunidad es practicamente nula.
- La fecha de creacion (2026-11-09) y actualizacion (2026-11-14) figuran en los metadatos; conviene confirmar la vigencia del modelo base y de la herramienta oQ.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
