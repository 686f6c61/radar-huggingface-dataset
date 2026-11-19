# mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-GGUF

## Resumen

Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-GGUF es la distribucion en formato GGUF de un modelo derivado de la familia Qwen, especializado en roleplay conversacional en japones y publicado por el usuario sss22213. El modelo parte de una base Qwen de aproximadamente 27.000 millones de parametros (26.895.998.464 segun los pesos en safetensors) y ha sido sometido a un proceso de "abliteration" o "heretic" que elimina las capas de rechazo y censura del modelo original, ademas de un ajuste fino con LoRA sobre un dataset sintetico de roleplay NSFW en japones generado con DeepSeek-V3-0324. mradermacher se limita a producir las cuantizaciones estaticas en GGUF para su uso con llama.cpp y entornos compatibles.

La relevancia de esta ficha es doble: por un lado documenta un caso de uso muy concreto (roleplay en japones sin restricciones) que no cubren los modelos generalistas; por otro, sirve como ejemplo de la cadena de valor de la comunidad open source, donde un modelo base se modifica, se ajusta con LoRA y se cuantiza en varias etapas por autores distintos. El repositorio incluye 13 cuantizaciones entre Q2_K y Q8_0, con tamanos que van de 10,8 GB a 28,7 GB, lo que permite desplegarlo en hardware de consumo.

El modelo declara soporte para japones, ingles y chino, licencia Apache 2.0 y etiquetas explicitas de contenido no apto para todo publico. No se dispone de informacion sobre la longitud de contexto, la composicion exacta del entrenamiento ni resultados de benchmarks en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen; detalles no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | japones (ja), ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 187,9 GB |
| Modelo base | sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW |
| Dataset de ajuste | Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen con aproximadamente 26,9 mil millones de parametros. La informacion disponible no especifica la variante exacta de Qwen ni si incorpora mecanismos adicionales como atencion lineal o mezcla de expertos; las etiquetas del repositorio mencionan tanto "qwen3.8" como "qwen3_5", lo que sugiere una base de la generacion Qwen3.5/Qwen3.8, pero no se confirma en la documentacion.

El proceso de construccion tiene tres etapas identificables. Primero, un modelo Qwen base. Segundo, un proceso de "heretic"/"abliteration" que elimina o modifica las direcciones de rechazo en el espacio de activaciones para reducir la censura del modelo. Tercero, un ajuste fino con LoRA (herramienta Unsloth segun las etiquetas) sobre el dataset sintetico Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted, compuesto por aproximadamente 20.000 ejemplos de roleplay en japones generados con DeepSeek-V3-0324. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO posteriores. Tampoco se documenta la innovacion tecnica del ajuste mas alla del uso de LoRA y de la ablacion de rechazos.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a roleplay, con enfasis en japones.
- Roleplay sin restricciones de contenido (modelo "uncensored" y "abliterated"), incluyendo contenido NSFW.
- Soporte multilingue declarado en japones, ingles y chino.
- Capacidad multimodal potencial: el repositorio incluye archivos mmproj (Q8_0 y f16), lo que indica soporte de entrada de imagenes en el modelo base, aunque no se detalla su alcance.
- Conversacion con personalidad y estilo consistentes, adecuada para personajes.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.
- No se documenta modo "thinking" explicito ni capacidades de audio.

## Casos de uso

- Roleplay conversacional en japones: el modelo esta ajustado especificamente sobre un dataset de roleplay japones, por lo que puede mantener personajes y estilo narrativo en conversaciones largas con usuarios japoneses.
- Creacion de personajes virtuales y chatbots de entretenimiento: la ablacion de rechazos permite conversaciones sin las interrupciones tipicas de los modelos alineados, util para plataformas de ocio para adultos.
- Generacion de ficcion interactiva y novelas visuales: el ajuste sobre 20.000 ejemplos de roleplay facilita la coherencia de tono y la continuidad narrativa en guiones ramificados.
- Traduccion y adaptacion de dialogos entre japones, ingles y chino: el soporte trilingue declarado permite usarlo como asistente de localizacion de contenido conversacional.
- Investigacion sobre alineacion y ablacion: el modelo sirve como caso de estudio para comparar el comportamiento de un modelo censurado frente a su version "heretic" en tareas de rechazo y seguridad.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (16,6 GB) y Q5_K_M (19,3 GB) permiten ejecutarlo en GPUs de 24 GB como la RTX 4090, util para prototipos y demos privadas.
- Procesamiento de imagenes en conversaciones: los archivos mmproj permiten, si el runtime lo soporta, incorporar entrada visual en el roleplay o en tareas de descripcion de escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 GB con Q2_K, 16-17 GB con Q4_K_M, 19-20 GB con Q5_K_M, 22-23 GB con Q6_K y 29-30 GB con Q8_0, mas el overhead del contexto y, en su caso, del proyector multimodal (0,7-1,0 GB adicionales).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y contextos largos; RTX 3090 (24 GB) como alternativa de consumo.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas para cuantizaciones Q4; las cuantizaciones Q2_K y Q3_K_S pueden caber en GPUs de 12 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; el repositorio declara compatibilidad con endpoints. Para el modelo base en safetensors, vLLM o TGI si la arquitectura Qwen subyacente esta soportada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Heretic-JP-Roleplay-NSFW (este) | ~26,9 B | no disponible | Apache 2.0 | Roleplay japones NSFW, abliterated | GGUF y safetensors en HF |
| Modelo base sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW | ~26,9 B | no disponible | Apache 2.0 | Mismo modelo sin cuantizar | Safetensors en HF |
| Qwen base de la familia Qwen3.5/Qwen3.8 | ~27 B (segun etiquetas) | no disponible | Apache 2.0 (habitual en Qwen) | Modelo generalista alineado | HF |
| Alternativas de roleplay NSFW de ~27 B | no disponible | no disponible | no disponible | Roleplay sin censura | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido NSFW y no apto para todo publico: el modelo esta disenado para generar material para adultos y no debe desplegarse en entornos sin control de edad ni en productos dirigidos a menores.
- La ablacion de rechazos ("heretic"/"abliterated") reduce la capacidad del modelo para negarse a peticiones daninas; no debe exponerse sin filtros adicionales en aplicaciones publicas.
- Riesgo elevado de alucinacion en tareas factuales: el ajuste esta orientado a roleplay, no a precision informativa.
- Sesgos desconocidos: no se documenta ninguna evaluacion de sesgos, toxicidad ni seguridad del modelo ajustado.
- Cobertura limitada de idiomas: solo se declaran japones, ingles y chino; el rendimiento en castellano no esta verificado y previsiblemente sera inferior.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones muy largas.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a normativas locales sobre material para adultos y a las condiciones de la plataforma de despliegue.
- El repositorio ocupa 187,9 GB; la descarga completa de todas las cuantizaciones es costosa y conviene seleccionar solo la variante necesaria.
- La cadena de modificaciones (abliteracion + LoRA + cuantizacion) no incluye evaluaciones formales, por lo que la calidad final puede degradarse respecto al modelo base en tareas distintas del roleplay.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-GGUF
- Modelo base: https://huggingface.co/sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
