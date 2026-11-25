# nightmedia/Qwen3.8-27B-MindMeld-DaisyRose-OneJev1.6-mxfp8-mlx

## Resumen

Qwen3.8-27B-MindMeld-DaisyRose-OneJev1.6-mxfp8-mlx es un modelo experimental de 27 356 728 560 parámetros (~27,36 mil millones) publicado por nightmedia, un laboratorio independiente con sede en Montana (EE. UU.) que opera con un MacBook Pro de 128 GB y tarjetas de memoria. No se trata de un modelo entrenado desde cero, sino de un merge (fusión) de tres linajes: nightmedia/Qwen3.8-27B-MindMeld, RadixArk/DaisyRose-27B y OmniJev/OneJev1.6-27B, a su vez construidos sobre la familia Qwen 3.5/3.6/3.8. La variante publicada está cuantizada en mxfp8 y empaquetada en formato MLX, es decir, orientada a inferencia en Apple Silicon.

El problema que aborda es la consolidación de capacidades dispersas: razonamiento con cadena de pensamiento larga (long-CoT), escritura creativa y de ficción, roleplay, código, matemáticas y multilingüismo, todo en un único checkpoint de ~27B con licencia Apache 2.0. El modelo declara soporte de contexto de 256k y 1M de tokens en sus etiquetas, y pipeline image-text-to-text, aunque la model card no documenta la torre de visión ni los detalles del entrenamiento multimodal.

Su relevancia es acotada pero concreta: es un artefacto reproducible con mergekit, con métricas de perplejidad y benchmarks ligeros (arc, boolq, hellaswag, openbookqa, piqa, winogrande) publicadas por el autor, y con un consumo de memoria de 34,64 GB en mxfp8 que lo hace viable en hardware de Apple con memoria unificada alta. No es un modelo recomendado para producción crítica sin evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.5/3.6/3.8), sin datos de capas ni dimensiones en la informacion disponible |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 256k y 1M tokens anunciados en las etiquetas del repo; no verificado en la model card |
| Tipos de cuantizacion | mxfp8 (variante publicada); el modelo base MindMeld reporta bf16, mxfp8, q8-hi, qx86-hi, q6-hi, qx64-hi y mxfp4 |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers), empaquetado MLX para mxfp8 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen (etiquetas qwen3_5, qwen3_6, qwen3_8), sin que la informacion disponible detalle numero de capas, dimensiones ocultas, atencion (GQA/MQA) ni funcion de activacion. El checkpoint final es un merge de tres modelos, construido con mergekit, que a su vez integra una lista extensa de participantes: OmniJev/OneJev1.6-27B, nbeerbower/Wichtel-Qwen3.6-27B, schneewolflabs/B1-27B, trohrbaugh/Qwen3.8-27B-heretic-ara, DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0, nightmedia/Qwen3.8-27B-Cold-Fusion-FF711-Darker-Hero-GAIN-B, migtissera/Tess-4-27B, nbeerbower/CHUD-Qwen3.6-27B, nbeerbower/Elster-Qwen3.6-27B, MooreThreads/MusaCoder-27B, DavidAU/Qwen3.5-27B-Claude-4.6-OS-INSTRUCT, DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking, armand0e/Qwen3.6-27B-Fable-5-Experimental, DavidAU/Qwen3.5-27B-Polar-Rev1-Uncensored-Heretic, DavidAU/Qwen3.6-27B-F451-AND-TRI-Polar-Ultra-Pro-Writer-Uncensored-Heretic, nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B, nightmedia/Qwen3.6-27B-Architect-Polaris-Fable-F451 y RadixArk/DaisyRose-27B.

No se dispone del numero de tokens de entrenamiento, de la composicion del dataset ni de si hubo RLHF o DPO en las etapas originales. Las etiquetas indican sft, lora, distillation y claude-distillation, lo que sugiere que algunos participantes se afinaron con destilacion de modelos Claude y con SFT sobre adaptadores LoRA, pero la model card no aporta detalles cuantitativos. La innovacion tecnica documentada es la propia receta de merge y la publicacion de metricas de cuantizacion (perplejidad, memoria pico y tokens por segundo) para comparar variantes bf16, mxfp8, qx86-hi, qx64-hi y mxfp4.

## Capacidades

- Generacion de texto conversacional e instruccional, con modo de razonamiento y cadena de pensamiento larga (long-CoT) segun las etiquetas del repositorio.
- Codigo: herencia de MusaCoder-27B y de los finetunes orientados a coding; sin evaluacion HumanEval publicada en la informacion disponible.
- Matematicas y STEM: etiquetas explicitas de math y stem, sin benchmarks numericos asociados.
- Escritura creativa y de ficcion: generacion de tramas, subtramas, continuacion de escenas, narrativa de genero y ciencia ficcion, con etiquetas de vivid prosing y storytelling.
- Roleplay y personificacion: la model card incluye ejemplos de dialogo in-character (Vlad Dracula, Quark, Gul Dukat) como demostracion.
- Multilingue: ingles, chino, japones y espanol declarados.
- Procesamiento image-text-to-text declarado en pipeline_tag, aunque sin documentacion de la torre visual ni resolucion de imagen soportada.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el long-CoT es el unico indicio.

## Casos de uso

- Escritura asistida de ficcion: el modelo puede generar tramas, subtramas y continuaciones de escena con consistencia estilistica, aprovechando la mezcla de finetunes creativos (DaisyRose, Fable, Polaris) y su contexto largo para mantener el arco narrativo de una novela completa en una sola sesion.
- Roleplay y prototipado de personajes conversacionales: los ejemplos de la model card muestran dialogos in-character con registro y voz definidos; es util para disenar bots de entretenimiento o videojuegos antes de invertir en un modelo mayor.
- Generacion de codigo en entornos locales: con 34,64 GB de memoria pico en mxfp8, cabe en un MacBook Pro con memoria unificada alta y permite autocompletado, refactorizacion y explicacion de codigo sin salir del equipo; la herencia de MusaCoder aporta sesgo hacia codigo.
- Razonamiento matematico y STEM asistido: el modo long-CoT permite descomponer problemas paso a paso; adecuado para tutorizacion o generacion de explicaciones docentes, no para calculo critico sin verificacion.
- Traduccion y asistencia multilingue entre en, zh, ja y es: util para documentacion tecnica o atencion al cliente en esos cuatro idiomas, con la advertencia de que no hay evaluacion de calidad por idioma.
- Laboratorio de experimentacion con merges: al ser un artefacto reproducible con mergekit y con metricas de perplejidad publicadas por componente, sirve para investigar el efecto de fusiones sobre benchmarks ligeros y sobre la degradacion por cuantizacion (bf16 frente a mxfp8, qx64-hi y mxfp4).
- Analisis y resumen de documentos largos: si se confirma el contexto de 256k-1M tokens, permitiria procesar informes extensos o bases de codigo en una sola pasada, aunque la falta de verificacion exige pruebas propias.

## Benchmarks y rendimiento

Datos publicados en la model card para este checkpoint (mxfp8) y para sus componentes. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible.

| Modelo / cuantizacion | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Este modelo (mxfp8) | 0,738 | 0,898 | 0,915 | 0,834 | 0,522 | 0,837 | 0,807 |
| MindMeld (bf16) | 0,742 | 0,897 | 0,913 | 0,840 | 0,514 | 0,834 | 0,791 |
| MindMeld (mxfp8) | 0,743 | 0,899 | 0,911 | 0,835 | 0,516 | 0,836 | 0,792 |
| MindMeld-DaisyRose (mxfp8) | 0,735 | 0,896 | 0,912 | no disponible | no disponible | no disponible | no disponible |
| DaisyRose (mxfp8) | 0,603 | 0,786 | 0,901 | no disponible | no disponible | no disponible | no disponible |
| OneJev1.6-27B (mxfp8) | 0,726 | 0,881 | 0,916 | no disponible | no disponible | no disponible | no disponible |

| Modelo / cuantizacion | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| Este modelo (mxfp8) | 3,772 ± 0,023 | 34,64 GB | 204 |
| MindMeld (bf16) | 3,693 ± 0,022 | 60,75 GB | 235 |
| MindMeld (mxfp8) | 3,733 ± 0,023 | 34,74 GB | 186 |
| MindMeld (qx86-hi) | 3,697 ± 0,022 | 33,25 GB | 187 |
| MindMeld (qx64-hi) | 3,713 ± 0,023 | 27,03 GB | 190 |
| MindMeld (mxfp4) | 3,813 ± 0,023 | 21,30 GB | 191 |
| MindMeld-DaisyRose (mxfp8) | 3,721 ± 0,023 | 34,64 GB | 205 |
| OneJev1.6-27B (mxfp8) | 5,403 ± 0,035 | 34,74 GB | 207 |

## Requisitos de hardware

- VRAM/memoria estimada: 34,64 GB de memoria pico en mxfp8 para este checkpoint; el repo ocupa 28,7 GB en disco. El modelo base MindMeld baja a 27,03 GB en qx64-hi y a 21,30 GB en mxfp4.
- GPU recomendadas: la variante publicada es MLX, pensada para Apple Silicon con memoria unificada; para CUDA haria falta reconvertir a otro formato. En el ecosistema NVIDIA, un modelo denso de 27B en bf16 requiere del orden de 60 GB (60,75 GB medidos en MindMeld bf16), lo que encaja en A100 80 GB, H100 80 GB o dos RTX 4090 de 24 GB.
- GPU de consumo: en mxfp4 (21,30 GB) podria caber en una RTX 4090 de 24 GB; en mxfp8 (34,64 GB) no cabe en ninguna GPU de consumo actual de 24 GB y exige memoria unificada de Apple de 48 GB o mas, o un MacBook Pro de 128 GB como el del autor.
- Opciones de despliegue: MLX para Apple Silicon; transformers como libreria declarada; el ecosistema del modelo base incluye variantes GGUF y compatibilidad con vLLM, llama.cpp y Ollama para los formatos no MLX, aunque no se confirma para este checkpoint concreto.
- Latencia y throughput: 204 tokens/s y perplejidad 3,772 en mxfp8, medidos por el autor; el bf16 de MindMeld alcanza 235 tokens/s con 60,75 GB, y las variantes qx64-hi y mxfp4 rondan 190-191 tokens/s con menor memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (nightmedia) | 27,36 B | 256k-1M (declarado) | Apache 2.0 | safetensors + MLX mxfp8 | Merge experimental, 115 descargas, 0 likes |
| nightmedia/Qwen3.8-27B-MindMeld | ~27 B | no disponible | Apache 2.0 | bf16, mxfp8, qx86-hi, qx64-hi, mxfp4 | Componente principal; perplejidad 3,693 en bf16 |
| OmniJev/OneJev1.6-27B | ~27 B | no disponible | no disponible | mxfp8 | Componente; perplejidad 5,403, mas alta que el merge |
| RadixArk/DaisyRose-27B | ~27 B | no disponible | no disponible | mxfp8 | Componente creativo; arc 0,603, el mas bajo de los tres |

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como experimental y lo publica como merge, no como entrenamiento validado; no hay evaluacion independiente.
- Riesgo de alucinacion: sin datos de MMLU, HumanEval ni GSM8K, no es posible acotar la fiabilidad en tareas de conocimiento, codigo o matematicas.
- Contexto no verificado: las etiquetas anuncian 256k y 1M tokens, pero la model card no documenta la ventana efectiva ni pruebas de recuperacion en contextos largos.
- Capacidad multimodal sin documentar: pipeline image-text-to-text declarado sin especificar torre visual, resolucion ni datos de entrenamiento multimodal; no debe asumirse vision funcional.
- Idiomas limitados a en, zh, ja y es; el resto de idiomas no esta cubierto y el espanol no tiene evaluacion especifica.
- Procedencia mixta: al fusionar modelos con etiquetas heretic, uncensored y destilados de Claude, los sesgos y el filtrado de seguridad son heterogeneos y no estan auditados; puede producir contenido que otros modelos rechazan.
- Licencia Apache 2.0 permite uso comercial, pero los modelos base pueden arrastrar condiciones adicionales no verificadas en la informacion disponible; conviene revisar cada componente antes de desplegar.
- Huella de memoria alta para GPU de consumo: 34,64 GB en mxfp8 excluye tarjetas de 24 GB salvo recompresion a mxfp4.
- Adopcion muy baja (115 descargas, 0 likes) y creado en noviembre de 2026: sin comunidad que valide los resultados publicados.

## Enlaces

- Hugging Face: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld-DaisyRose-OneJev1.6-mxfp8-mlx
- Modelo base principal: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Modelo base: https://huggingface.co/OmniJev/OneJev1.6-27B
- Apoyo al autor: https://buymeacoffee.com/nightmedia
