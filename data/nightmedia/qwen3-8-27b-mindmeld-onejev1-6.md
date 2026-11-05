# nightmedia/Qwen3.8-27B-MindMeld-OneJev1.6

## Resumen

Qwen3.8-27B-MindMeld-OneJev1.6 es un modelo experimental de lenguaje y visión (pipeline `image-text-to-text`) publicado por nightmedia, un laboratorio independiente con sede en Montana (EE. UU.). Se trata de un merge de dos modelos: `nightmedia/Qwen3.8-27B-MindMeld` y `OmniJev/OneJev1.6-27B`, construido con mergekit a partir de una cadena de modelos base que incluye variantes de la familia Qwen3.5 y Qwen3.6 (27B), destilaciones de Claude 4.6, y finetunes comunitarios orientados a razonamiento, escritura creativa y rol. Cuenta con 27.781 millones de parámetros en formato bf16 y pesos safetensors.

El modelo está etiquetado explícitamente por su autor como "experimental" y "no apto para código": la model card advierte que fallará en tareas de dibujo o generación visual estructurada, pero que mantiene capacidad de debate y escritura con "confianza tipo Borg". Su interés principal es como caso de estudio de merging de modelos de razonamiento (chain-of-thought largo, SFT, LoRA) y de cuantización (se publican métricas de perplejidad y throughput para mxfp8, q8, q6, q5, q4, mxfp4 y oQ2e).

La relevancia actual es doble: por un lado, demuestra el ecosistema de merges comunitarios sobre Qwen3.x con contextos anunciados de hasta 1M y 256k tokens; por otro, incluye una tabla comparativa de rendimiento entre el merge y sus componentes, lo que permite evaluar empíricamente el coste del merging en tareas como ARC, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.x, tag `qwen3_5`/`qwen3_6`), multimodal image-text-to-text |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | 256k y 1M tokens anunciados en tags (no verificado en model card) |
| Tipos de cuantizacion | bf16, mxfp8, q8-hi, qx86-hi, q6-hi, q5-hi, qx64-hi, q4-hi, oQ4e-mtp, mxfp4, oQ2e-mtp (metricas publicadas); GGUF anunciado como pendiente |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF anunciado para una version futura |

## Arquitectura y entrenamiento

El modelo es un merge (mergekit) de dos checkpoints de 27B de la familia Qwen3.x: `nightmedia/Qwen3.8-27B-MindMeld` y `OmniJev/OneJev1.6-27B`. A su vez, la cadena de modelos participantes incluye `schneewolflabs/B1-27B`, `nbeerbower/Wichtel-Qwen3.6-27B`, `trohrbaugh/Qwen3.8-27B-heretic-ara`, `DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1`, `DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0`, `migtissera/Tess-4-27B`, `nbeerbower/CHUD-Qwen3.6-27B`, `nbeerbower/Elster-Qwen3.6-27B`, `MooreThreads/MusaCoder-27B`, `DavidAU/Qwen3.5-27B-Claude-4.6-OS-INSTRUCT`, `DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking`, `armand0e/Qwen3.6-27B-Fable-5-Experimental`, `DavidAU/Qwen3.5-27B-Polar-Rev1-Uncensored-Heretic`, `DavidAU/Qwen3.6-27B-F451-AND-TRI-Polar-Ultra-Pro-Writer-Uncensored-Heretic`, `nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B` y `nightmedia/Qwen3.6-27B-Architect-Polaris-Fable-F451`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO en este merge concreto. Los tags indican que los componentes han pasado por SFT, LoRA y destilación de Claude 4.6, además de técnicas de razonamiento con chain-of-thought largo. La innovación técnica destacable es la propia metodología de merging multi-fuente y la publicación de métricas de cuantización (perplejidad, memoria pico y tokens/s) para distintos esquemas, incluyendo formatos de 2 y 4 bits con decodificación especulativa (oQ2e-mtp, oQ4e-mtp).

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino, japonés y español.
- Razonamiento con chain-of-thought largo (long-cot) y modo "thinking" heredado de los componentes destilados de Claude 4.6.
- Escritura creativa y de ficción: generación de tramas, subtramas, continuación de escenas, prosa vívida y roleplaying (tags explícitos `creative writing`, `fiction`, `roleplaying`).
- Capacidad multimodal image-text-to-text (pipeline declarado), aunque la model card advierte que el rendimiento en tareas visuales estructuradas es deficiente.
- Matemáticas y STEM (tags `math`, `stem`).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; el long-cot sugiere capacidad de razonamiento extendido, pero sin garantías de uso agéntico.
- Capacidad multilingüe limitada a los cuatro idiomas declarados.
- No apto para generación de código según el propio autor.

## Casos de uso

- Escritura creativa y narrativa: generación de relatos de ficción, tramas y subtramas con prosa elaborada, aprovechando los componentes especializados en ficción y el estilo "vívido" que el autor destaca en los tags.
- Roleplaying y personajes conversacionales: el modelo mantiene diálogos multi-turno con consistencia de personaje, como demuestra el ejemplo de la model card con Q y Caesar; útil para prototipos de NPCs o chatbots de entretenimiento.
- Debate y exploración de ideas: la model card indica que "debate cualquier tema con espíritu y confianza", lo que lo hace adecuado para lluvia de ideas, generación de contraargumentos y exploración socrática de temas abiertos.
- Razonamiento matemático y STEM en inglés y chino: los tags `math` y `stem` junto con el long-cot permiten abordar problemas que requieren cadenas de razonamiento largas, aunque sin benchmarks específicos publicados.
- Experimentación en investigación sobre merging: al publicar métricas comparativas entre el merge y sus componentes, sirve como caso de estudio reproducible para investigar el efecto del merging en tareas de razonamiento (ARC, BoolQ, HellaSwag, etc.).
- Evaluación de cuantizaciones en hardware de consumo: las tablas de perplejidad, memoria pico y tokens/s para mxfp4, q4-hi y oQ2e-mtp permiten seleccionar el esquema adecuado para MacBook Pro de 128 GB o GPUs con 24 GB de VRAM.
- Asistencia multilingüe en entornos hispanohablantes: con soporte declarado de español, puede emplearse en generación de contenido y conversación, aunque sin benchmarks específicos en ese idioma.

## Benchmarks y rendimiento

Datos publicados en la model card (formato `brainwaves`). Se comparan el merge final, su componente MindMeld y OneJev1.6 en tareas de razonamiento y comprensión.

| Modelo / cuantización | ARC | ARC/e | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|
| Merge bf16 | 0,747 | 0,901 | 0,915 | no disp. | no disp. | no disp. | no disp. |
| Merge mxfp8 | 0,744 | 0,902 | 0,915 | 0,841 | 0,534 | 0,837 | 0,801 |
| Merge q8-hi | 0,747 | 0,902 | 0,915 | 0,841 | 0,530 | 0,832 | 0,801 |
| Merge q6-hi | 0,748 | 0,899 | 0,916 | 0,840 | 0,534 | 0,835 | 0,797 |
| Merge q5-hi | 0,744 | 0,899 | 0,915 | 0,840 | 0,542 | 0,836 | 0,795 |
| Merge q4-hi | 0,747 | 0,903 | 0,916 | 0,844 | 0,538 | 0,838 | 0,803 |
| Merge mxfp4 | 0,742 | 0,897 | 0,911 | 0,831 | 0,524 | 0,832 | 0,804 |
| Merge oQ2e-mtp | 0,727 | 0,890 | 0,912 | no disp. | no disp. | no disp. | no disp. |
| MindMeld bf16 | 0,742 | 0,897 | 0,913 | 0,840 | 0,514 | 0,834 | 0,791 |
| OneJev1.6 mxfp8 | 0,726 | 0,881 | 0,916 | no disp. | no disp. | no disp. | no disp. |

Métricas de eficiencia (perplejidad, memoria pico y throughput):

| Cuantización | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| mxfp8 | 3,791 ± 0,023 | 34,74 GB | 211 |
| q8-hi | 3,779 ± 0,023 | 37,26 GB | 204 |
| q6-hi | 4,018 ± 0,025 | 30,54 GB | 199 |
| q5-hi | 3,774 ± 0,023 | 27,18 GB | 200 |
| q4-hi | 3,813 ± 0,023 | 23,82 GB | 207 |
| oQ4e-mtp | 3,712 ± 0,023 | 23,18 GB | 208 |
| mxfp4 | 3,857 ± 0,024 | 21,30 GB | 211 |
| oQ2e-mtp | 3,899 ± 0,024 | 17,50 GB | 216 |

Referencia de los componentes: MindMeld en bf16 alcanza 3,693 ± 0,022 de perplejidad con 60,75 GB de memoria y 235 tokens/s; OneJev1.6 en mxfp8 registra 5,403 ± 0,035 de perplejidad con 34,74 GB y 207 tokens/s. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 60,75 GB de memoria pico (dato de MindMeld, componente con mismo tamaño); el merge completo en bf16 requiere del orden de 55,6 GB de pesos más overhead de activaciones.
- VRAM estimada en cuantizaciones: 34,74 GB (mxfp8), 37,26 GB (q8-hi), 30,54 GB (q6-hi), 27,18 GB (q5-hi), 23,82 GB (q4-hi), 23,18 GB (oQ4e-mtp), 21,30 GB (mxfp4), 17,50 GB (oQ2e-mtp).
- GPUs recomendadas: A100 80 GB o H100 para bf16; A100 40 GB / RTX 6000 Ada / L40S para mxfp8 y q8-hi; GPUs de 24 GB (RTX 4090, RTX 3090) para q4-hi, oQ4e-mtp y mxfp4.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con q4-hi, oQ4e-mtp o mxfp4; en GPUs de 16 GB no cabe en cuantizaciones publicadas (el mínimo es 17,50 GB en oQ2e-mtp).
- Despliegue: transformers (librería declarada), con soporte MLX mencionado en tags (el autor prueba en MacBook Pro de 128 GB con q6-hi-mlx); no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible. El GGUF está anunciado como pendiente bajo el nombre `DavidAU/Qwen3.8-27B-Jumbo-Fusion-...-GGUF`.
- Throughput: 199-216 tokens/s en las cuantizaciones medidas (rango estrecho, sin penalización severa por bajar a 2 bits); bf16 del componente MindMeld alcanza 235 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-MindMeld-OneJev1.6 | 27,78B | 256k/1M (anunciado) | apache-2.0 | Merge experimental multimodal; perplejidad 3,71-3,90 según cuantización |
| nightmedia/Qwen3.8-27B-MindMeld (componente) | ~27B | no disponible | apache-2.0 (presumible) | Mejor perplejidad bf16 (3,693) y mayor throughput (235 tok/s) que el merge |
| OmniJev/OneJev1.6-27B (componente) | ~27B | no disponible | no disponible | Perplejidad mxfp8 de 5,403, notablemente peor que el merge |
| schneewolflabs/B1-27B (base) | ~27B | no disponible | no disponible | Modelo base de la cadena de merging; sin métricas publicadas en esta ficha |

La comparativa con modelos de la misma categoría fuera del ecosistema de merging (por ejemplo, Qwen3 oficial de 27B o Mistral de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo explícitamente experimental: el autor lo describe como un experimento de merging y advierte que "no es para código" y que fallará en tareas visuales estructuradas (ejemplo del pelícano en bicicleta).
- Riesgo de alucinación: el propio autor menciona "confianza tipo Borg", lo que sugiere respuestas asertivas sin garantía de veracidad; no hay evaluaciones de factualidad publicadas.
- Rendimiento en benchmarks modesto: ARC ~0,74, HellaSwag ~0,84, OpenBookQA ~0,53; por debajo de lo esperable en modelos frontera de 27B, coherente con su naturaleza de merge creativo.
- Contexto anunciado (256k/1M) no verificado: los tags incluyen "1M context" y "256k context", pero la model card no documenta pruebas de recuperación en contextos largos.
- Idiomas limitados a en, zh, ja y es; sin benchmarks por idioma.
- Licencia apache-2.0 permite uso comercial, pero los componentes de la cadena de merging tienen licencias no verificadas en esta ficha; conviene auditar cada modelo base antes de producción.
- Sin soporte confirmado de tool calling, function calling ni frameworks de agentes; no recomendado para pipelines agénticos sin validación previa.
- Repositorio de 55,6 GB y solo 63 descargas y 2 likes en el momento de la consulta: comunidad pequeña, sin garantías de mantenimiento.
- El GGUF prometido aún no está disponible en este repositorio; para despliegue en llama.cpp/Ollama habría que esperar a su publicación o convertirlo.

## Enlaces

- HuggingFace: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld-OneJev1.6
- Modelo componente: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld
- Modelo componente: https://huggingface.co/OmniJev/OneJev1.6-27B
- Modelo base: https://huggingface.co/schneewolflabs/B1-27B
- GGUF anunciado: https://huggingface.co/DavidAU/Qwen3.8-27B-Jumbo-Fusion-IQ-747-900-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Componentes adicionales de la cadena de merging: nbeerbower/Wichtel-Qwen3.6-27B, trohrbaugh/Qwen3.8-27B-heretic-ara, DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0, migtissera/Tess-4-27B, nbeerbower/CHUD-Qwen3.6-27B, nbeerbower/Elster-Qwen3.6-27B, MooreThreads/MusaCoder-27B, DavidAU/Qwen3.5-27B-Claude-4.6-OS-INSTRUCT, DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking, armand0e/Qwen3.6-27B-Fable-5-Experimental, DavidAU/Qwen3.5-27B-Polar-Rev1-Uncensored-Heretic, DavidAU/Qwen3.6-27B-F451-AND-TRI-Polar-Ultra-Pro-Writer-Uncensored-Heretic, nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B, nightmedia/Qwen3.6-27B-Architect-Polaris-Fable-F451
- Paper, blog o demo oficial: no disponible en la información proporcionada.
