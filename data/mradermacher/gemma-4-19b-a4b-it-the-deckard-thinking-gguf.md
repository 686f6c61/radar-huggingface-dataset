# mradermacher/gemma-4-19B-A4B-it-The-DECKARD-Thinking-GGUF

## Resumen

`mradermacher/gemma-4-19B-A4B-it-The-DECKARD-Thinking-GGUF` es una distribucion de cuantizaciones estaticas en formato GGUF del modelo `DavidAU/gemma-4-19B-A4B-it-The-DECKARD-Thinking`, un fine-tune del Gemma 4 19B-A4B-it con arquitectura de mezcla de expertos (MoE). El autor de las cuantizaciones es mradermacher, mientras que el modelo base lo desarrolla DavidAU. La ficha cubre tanto el modelo subyacente como los ficheros GGUF publicados.

El modelo parte de una arquitectura MoE con aproximadamente 18.450 millones de parametros totales (segun los safetensors del repo) y, segun los tags, emplea una poda de expertos del 90 por ciento, lo que reduce el computo activo por token. El fine-tune esta orientado a escritura creativa, ficcion, generacion de tramas y roleplaying, aunque los tags declaran tambien "all use cases" y "coder". La licencia es Apache 2.0.

La relevancia practica de este repo es que ofrece el modelo en multiples niveles de cuantizacion (de Q2_K a Q8_0, mas IQ4_XS y ficheros mmproj multimodales) listos para usar con llama.cpp y derivados, lo que permite desplegarlo en hardware de consumo con tamanos que van de 7,9 GB a 19,7 GB. El idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con poda de expertos del 90 por ciento, segun tags |
| Parametros totales | 18.449.903.786 (18,45 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; existen quants ponderados/imatrix en repo separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |
| Tamano del repo | 136,0 GB |
| Modelo base | DavidAU/gemma-4-19B-A4B-it-The-DECKARD-Thinking |
| Libreria | transformers |
| Descargas / likes | 217 / 1 |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Gemma 4 19B-A4B-it, una arquitectura de mezcla de expertos (MoE). Segun los tags de la model card, se ha aplicado una poda de expertos del 90 por ciento ("pruned experts 90"), lo que reduce el numero de expertos efectivos y, por tanto, el coste computacional en inferencia. El fine-tune se ha realizado con Unsloth, segun los tags, y se distribuye en bfloat16 en su version original. Los parametros totales declarados en safetensors ascienden a 18.449.903.786.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. El modelo incorpora un modo "Thinking" (razonamiento explicito) segun el nombre, pero no se detalla su implementacion. El repo de cuantizaciones incluye ficheros mmproj, lo que indica que el modelo base soporta entrada multimodal (vision), aunque no se especifica el tipo de codificador visual.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline declarado: conversational).
- Escritura creativa: ficcion, generacion de tramas y subtramas, continuacion de escenas, storytelling, narrativa vivida.
- Roleplaying y generacion de dialogos de personajes.
- Cobertura de generos: ciencia ficcion, romance y "todos los generos" segun tags.
- Modo "Thinking" de razonamiento explicito (segun el nombre del modelo; sin detalles tecnicos).
- Capacidades multimodales: los ficheros mmproj sugieren soporte de vision, aunque no se documenta el alcance.
- Codigo: el tag "coder" aparece en la model card, sin mas especificacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Generacion de ficcion y narrativa larga: el fine-tune esta orientado a tramas, subtramas y continuacion de escenas, por lo que encaja en pipelines de escritura asistida donde se necesita coherencia narrativa y prosa vivida.
- Roleplaying y chatbots de personaje: el modelo puede mantener conversaciones multi-turno con voz de personaje, adecuado para juegos de rol textuales o asistentes de entretenimiento.
- Escritura creativa asistida para autores: generacion de borradores de capitulos, variantes de escena y desarrollo de arcos argumentales en generos como ciencia ficcion o romance.
- Prototipado local en hardware de consumo: las cuantizaciones Q4_K_M (12,4 GB) y Q5_K_M (14,1 GB) permiten ejecutar el modelo en GPUs de 16-24 GB con llama.cpp u Ollama, util para pruebas sin infraestructura cloud.
- Generacion de dialogos para videojuegos o narrativa interactiva: el modelo puede producir respuestas de personajes no jugadores con estilo consistente, desplegado en local para evitar latencia de red.
- Experimentacion con modelos MoE podados: investigadores pueden usar las distintas cuantizaciones para estudiar el impacto de la poda de expertos en calidad y throughput sin necesidad de GPUs de datacenter.
- Tareas generales de codigo y conversacion: aunque el foco es creativo, el tag "coder" y "all use cases" sugieren uso como asistente general en ingles, con las cautelas propias de un fine-tune especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~7,9 GB.
  - Q3_K_S: ~9,1 GB; Q3_K_M: ~9,9 GB; Q3_K_L: ~10,3 GB.
  - IQ4_XS: ~10,4 GB.
  - Q4_K_S: ~11,4 GB; Q4_K_M: ~12,4 GB.
  - Q5_K_S: ~13,3 GB; Q5_K_M: ~14,1 GB.
  - Q6_K: ~16,6 GB.
  - Q8_0: ~19,7 GB.
  - mmproj multimodal: ~0,9 GB (Q8_0) o ~1,3 GB (f16), adicional.
- GPU recomendadas: para Q8_0, GPU de 24 GB (RTX 3090/4090, A10G). Para Q4_K_M y Q5_K_M, GPU de 16-24 GB. Para Q2_K y Q3_K, GPU de 8-12 GB.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con Q3_K_M o Q4_K_S; en RTX 4090 24 GB con Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los quants ponderados/imatrix estan en un repo separado. El modelo base en safetensors usa transformers.
- Latencia y throughput: no disponibles; al ser MoE con expertos podados, el coste por token deberia ser inferior al de un denso de 18B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-19B-A4B-it-The-DECKARD-Thinking (este) | 18,45B (MoE, expertos podados 90 %) | no disponible | Apache 2.0 | GGUF / safetensors | Fine-tune creativo sobre Gemma 4 |
| Gemma 4 19B-A4B-it (base) | 18,45B (MoE) | no disponible | Apache 2.0 | safetensors | Modelo instruct original de Google |
| Mistral Small 3 (24B) | 24B denso | 32k | Apache 2.0 | safetensors / GGUF | Alternativa densa de tamano similar |
| Qwen2.5 14B Instruct | 14B denso | 128k | Apache 2.0 | safetensors / GGUF | Menor, contexto mayor, sin foco creativo |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento publicados para este fine-tune que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Fine-tune especializado en ficcion y roleplaying: puede degradar el rendimiento en tareas tecnicas o factuales frente al modelo base.
- Riesgo de alucinacion: como todo modelo generativo, especialmente en modo creativo, puede inventar hechos, citas o datos.
- Poda de expertos del 90 por ciento: puede implicar perdida de calidad en dominios poco representados; no hay evaluacion publicada que lo cuantifique.
- Sin benchmarks publicados: no es posible validar el rendimiento frente a alternativas.
- Contexto desconocido: no se especifica la ventana de contexto, lo que complica planificar cargas de trabajo con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de Gemma 4 original antes de produccion.
- Modelo con muy pocas descargas (217) y un solo like: poca validacion comunitaria.
- El repo pesa 136 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.
- Los quants Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para produccion.

## Enlaces

- Repo GGUF: https://huggingface.co/mradermacher/gemma-4-19B-A4B-it-The-DECKARD-Thinking-GGUF
- Modelo base: https://huggingface.co/DavidAU/gemma-4-19B-A4B-it-The-DECKARD-Thinking
- Quants imatrix/ponderados: https://huggingface.co/mradermacher/gemma-4-19B-A4B-it-The-DECKARD-Thinking-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-19B-A4B-it-The-DECKARD-Thinking-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre quants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
