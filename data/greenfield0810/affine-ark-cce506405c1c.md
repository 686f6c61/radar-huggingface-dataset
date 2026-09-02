# greenfield0810/affine-ark-cce506405c1c

## Resumen

Este repositorio es un archivo espejo (mirror) de un checkpoint perteneciente al subnet 120 de Bittensor, conocido como Affine. El autor, greenfield0810, ha subido una copia byte a byte del modelo original `IntoLayer/Affine-5g94ihdxwu-v9a` con el objetivo de preservarlo, ya que los repositorios de ese leaderboard suelen hacerse privados en pocos días tras los duelos de evaluación. No se trata de un modelo desarrollado por el autor del archivo, sino de una copia de respaldo de un checkpoint de un competidor anónimo.

El modelo tiene aproximadamente 35,95 mil millones de parámetros y un tamaño de repositorio de 91,5 GB (aunque la model card indica 71,90 GB en 16 shards). Los tags sugieren que se basa en una arquitectura Qwen3.5 MoE y que es multimodal (image-text-to-text), pero no hay documentación técnica oficial que confirme estas características. La ausencia de model card sustancial, datos de entrenamiento y benchmarks hace que cualquier evaluación técnica deba realizarse con cautela.

Dada la naturaleza del archivo (un mirror sin documentación), esta ficha se basa únicamente en los metadatos disponibles y en las etiquetas del repositorio. La mayoría de los apartados técnicos quedan marcados como "no disponible" hasta que se publique información verificable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags sugieren Qwen3.5 MoE, multimodal image-text-to-text) |
| Parametros totales | 35.951.822.704 (~35,95 B) |
| Parametros activos | no disponible (posible MoE, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP16/BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (16 shards, 71,90 GB según model card) |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados ni las técnicas de alineación (RLHF, DPO, etc.). Los tags del repositorio indican `qwen3_5_moe` e `image-text-to-text`, lo que sugiere que el modelo podría ser un transformer multimodal con mezcla de expertos basado en la familia Qwen3.5, pero esto no está confirmado por ninguna documentación oficial.

El repositorio se presenta como un archivo de preservación dentro del ecosistema Bittensor subnet 120 (Affine), cuya finalidad es la evaluación competitiva de modelos mediante duelos. No se proporciona ningún detalle sobre el proceso de entrenamiento, el número de tokens procesados ni la composición del dataset.

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. Los tags sugieren posibles funcionalidades, pero no hay documentación que las respalde:

- Generación de texto e imágenes (posible multimodalidad, según tag `image-text-to-text`)
- Arquitectura MoE (según tag `qwen3_5_moe`)
- Capacidad conversacional (tag `conversational`)
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`)

Sin embargo, ninguna de estas capacidades está confirmada mediante pruebas o documentación oficial.

## Casos de uso

Dado que no se dispone de información sobre el rendimiento real del modelo, no es posible recomendar casos de uso concretos con garantías. El único contexto de uso documentado es el siguiente:

- Preservación y auditoría de checkpoints dentro del ecosistema Affine de Bittensor: el repositorio sirve como copia de seguridad de un modelo que podría dejar de estar disponible públicamente, permitiendo a investigadores y validadores del subnet acceder a él para reproducir evaluaciones o duelos.
- Investigación sobre modelos MoE multimodales: si el modelo efectivamente se basa en Qwen3.5 MoE y soporta entrada de imágenes, podría servir como referencia para estudios comparativos, siempre que se valide su funcionamiento previamente.

Cualquier otro uso (generación de código, atención al cliente, etc.) sería especulativo y no recomendable sin una evaluación técnica previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existe ninguna tabla de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos en el repositorio o en la documentación asociada.

## Requisitos de hardware

No se dispone de especificaciones oficiales de hardware. A partir del tamaño de parámetros (35,95 B) y del peso del archivo (71,90 GB en FP16/BF16), se pueden estimar los siguientes requisitos orientativos:

- VRAM para inferencia en FP16: aproximadamente 72 GB, lo que requiere GPU de clase profesional como A100 80GB, H100 80GB o múltiples GPUs en paralelo.
- Con cuantización a 8 bits: ~36 GB de VRAM, posible en una RTX 4090 (24 GB) no es suficiente; se necesitaría una A6000 48GB o similar.
- Con cuantización a 4 bits: ~18 GB de VRAM, podría caber en una RTX 4090 o RTX 3090, pero la calidad y velocidad dependerían de la implementación.
- Opciones de despliegue: al estar en formato safetensors, es compatible con frameworks como vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, siempre que se confirme la arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Al tratarse de un checkpoint sin identidad pública confirmada (aunque probablemente basado en Qwen3.5 MoE), no se puede establecer una comparación fiable con otros modelos. No se conocen los parámetros activos, el contexto ni el rendimiento real, por lo que cualquier comparativa sería especulativa.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial de un checkpoint de terceros; no hay garantía de que los pesos sean íntegros o funcionales.
- No se especifica licencia, por lo que el uso comercial del modelo es jurídicamente incierto.
- No existe documentación técnica sobre arquitectura, entrenamiento ni capacidades, lo que impide una evaluación rigurosa.
- El modelo podría tener sesgos o alucinaciones no documentados, al no conocerse los datos de entrenamiento.
- Los tags de arquitectura (Qwen3.5 MoE, multimodal) son solo indicativos y no están verificados.
- El tamaño del repositorio (91,5 GB) difiere del indicado en la model card (71,90 GB), lo que sugiere posibles archivos adicionales o discrepancias en el cálculo.
- No es recomendable su uso en producción sin una validación exhaustiva previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/greenfield0810/affine-ark-cce506405c1c
- Repositorio original del checkpoint: https://huggingface.co/IntoLayer/Affine-5g94ihdxwu-v9a
- Documentación de Affine (subnet 120): no disponible en la información proporcionada
- Archivo de procedencia (dentro del repo): `_affine_provenance.json`
