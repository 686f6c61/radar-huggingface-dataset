# mradermacher/gemma-4-E4B-it-The-DECKARD-Claude-Opus-Expresso-Universe-HERETIC-UNCENSORED-Thinking-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `DavidAU/gemma-4-E4B-it-The-DECKARD-Claude-Opus-Expresso-Universe-HERETIC-UNCENSORED-Thinking`, un fine-tune comunitario sobre la base Gemma 4 E4B-it de Google. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos open source, y el fine-tune original lo firma DavidAU. El modelo está etiquetado como "heretic" y "uncensored", lo que indica que se ha entrenado para reducir los rechazos y filtros de seguridad del modelo base, y está orientado explícitamente a escritura creativa, narrativa de ficción, generación de tramas y roleplaying.

La arquitectura subyacente es un transformer Gemma con aproximadamente 7.518 millones de parámetros totales según los safetensors del modelo base, aunque la nomenclatura "E4B" sugiere una variante con mezcla de expertos (MoE) de 4B activos, dato que no se puede confirmar con la información disponible. El contexto, los idiomas y los detalles de entrenamiento no están documentados en la model card más allá del inglés como único idioma declarado.

La relevancia de este lanzamiento es práctica: ofrece el modelo en 13 cuantizaciones GGUF (desde Q2_K de 4,5 GB hasta f16 de 15,2 GB), más dos suplementos multimodales (mmproj), lo que permite ejecutarlo en hardware de consumo con llama.cpp u Ollama. Es un modelo de nicho para escritura creativa sin restricciones, no un modelo de propósito general para producción empresarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Gemma (variante E4B; detalles de MoE no confirmados) |
| Parametros totales | 7.518.069.290 (según safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en bfloat16 |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de `gemma-4-E4B-it`, la variante instruct de la familia Gemma 4 con nomenclatura "E4B". Según los safetensors publicados, el checkpoint contiene 7.518 millones de parámetros, lo que resulta coherente con un modelo que combina una base densa grande con expertos ligeros, aunque la model card no detalla la configuración exacta de capas, número de expertos ni tokens activos por token. El fine-tune se realizó con Unsloth, según las etiquetas del repositorio, y se distribuye en bfloat16.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset de fine-tune, ni si se aplicaron técnicas de RLHF, DPO o similar. Las etiquetas "heretic" y "uncensored" indican que el ajuste incluyó una etapa de reducción de rechazos (abliteración o entrenamiento con datos sin filtros), orientada a eliminar las respuestas de negativa del modelo base. También se etiqueta como "Thinking", lo que sugiere la presencia de un modo de razonamiento explícito, aunque no se detalla su funcionamiento. La model card incluye un suplemento multimodal (mmproj), lo que implica soporte de entrada de imágenes, pero sin especificar el codificador visual.

## Capacidades

- Generación de texto en inglés con estilo narrativo y "vivid prosing" según las etiquetas del autor.
- Escritura creativa: ficción, ciencia ficción, romance y "todos los géneros" según la model card.
- Generación de tramas, subtramas, escenas y continuación de historias.
- Roleplaying y diálogo conversacional multi-turno.
- Modo "Thinking" (razonamiento explícito), indicado en el nombre del modelo.
- Capacidades multimodales por el suplemento mmproj (procesamiento de imágenes), sin detalles sobre el alcance.
- Etiquetado como "coder" y "all use cases", aunque sin benchmarks que lo respalden.
- Sin confirmación de soporte de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Escritura de ficción por capítulos: el modelo está ajustado específicamente para narrativa y continuación de escenas, por lo que puede mantener un estilo y una voz consistente en textos largos generados por bloques.
- Generación de tramas y subtramas para guionistas y novelistas: útil para explorar variantes argumentales y estructuras narrativas antes de redactar.
- Roleplaying y narrativa interactiva: su ajuste "uncensored" permite diálogos sin rechazos en ficción adulta o temas sensibles, algo que los modelos alineados estándar bloquean.
- Prototipado de videojuegos narrativos: generación de diálogos de personajes y descripciones de escenas en motores de ficción interactiva.
- Asistencia creativa local y privada: al ejecutarse en GGUF con llama.cpp u Ollama, permite trabajar con material confidencial sin enviar texto a APIs externas.
- Experimentación en investigación sobre alineación y censura: el modelo sirve como caso de estudio de fine-tunes "heretic" y de cómo se eliminan los rechazos del modelo base.
- Generación de contenido multimodal básico: con el mmproj, se pueden describir imágenes o generar texto a partir de ellas, aunque sin garantías de calidad documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4,5 GB (Q2_K) y 15,2 GB (f16), más 0,7-1,1 GB si se usa el suplemento multimodal.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q5; RTX 4090 24 GB para Q8_0 o f16; A100/H100 solo si se necesita servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, desde Q4_K_S (5,3 GB) en adelante en tarjetas de 8 GB o más; Q2_K y Q3 caben en 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio; el modelo base en bfloat16 requiere transformers con soporte de Gemma 4.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (Gemma 4 E4B fine-tune) | 7,5B | no disponible | apache-2.0 | Escritura creativa sin censura |
| Gemma 4 E4B-it (base) | ~7,5B | no disponible | Gemma license | Propósito general alineado |
| Mistral 7B Instruct | 7,2B | 32K (v0.2) | apache-2.0 | Propósito general |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 license | Propósito general |

La comparación con Mistral 7B y Llama 3.1 8B es orientativa por tamaño; no hay benchmarks que permitan comparar rendimiento real de este fine-tune frente a ellos.

## Limitaciones y advertencias

- Modelo "uncensored": no aplica filtros de seguridad estándar, por lo que puede generar contenido ofensivo, ilegal o dañino sin restricción.
- Riesgo elevado de alucinación: es un fine-tune de nicho sin benchmarks publicados ni evaluación de fidelidad factual.
- Solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- La licencia apache-2.0 se hereda del repositorio, pero el modelo base Gemma tiene su propia licencia de uso; conviene revisar la compatibilidad antes de uso comercial.
- El nombre del modelo y las etiquetas ("aliterated", "HERETIC") indican un fine-tune experimental de la comunidad, sin garantías de calidad ni mantenimiento.
- El repo ocupa 76,9 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.
- No hay evidencia de soporte de tool calling ni de agentes; no usarlo en pipelines que dependan de ello sin probarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-E4B-it-The-DECKARD-Claude-Opus-Expresso-Universe-HERETIC-UNCENSORED-Thinking-GGUF
- Modelo base: https://huggingface.co/DavidAU/gemma-4-E4B-it-The-DECKARD-Claude-Opus-Expresso-Universe-HERETIC-UNCENSORED-Thinking
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-E4B-it-The-DECKARD-Claude-Opus-Expresso-Universe-HERETIC-UNCENSORED-Thinking-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-4-E4B-it-The-DECKARD-Claude-Opus-Expresso-Universe-HERETIC-UNCENSORED-Thinking-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
