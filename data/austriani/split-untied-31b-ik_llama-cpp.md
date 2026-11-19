# Austriani/Split-Untied-31B-ik_llama.cpp

## Resumen

Split-Untied-31B-ik_llama.cpp es una cuantizacion GGUF del modelo Blazed-Forge/Split-Untied-31B, publicada por el usuario Austriani. Se trata de un modelo de lenguaje de 32.106.631.740 parametros (aproximadamente 32,1 mil millones) derivado de la familia Gemma de Google, segun indican las etiquetas de la model card, y afinado para generacion de texto creativo, roleplay y ficcion. El modelo base ha sido sometido a procesos de "abliteration" y "heretic" (eliminacion de rechazos y sesgos de alineacion), lo que lo orienta a un uso sin censura y a contenido para adultos.

La relevancia de esta publicacion concreta reside en el formato: no es el modelo original en safetensors, sino una conversion a GGUF optimizada para ik_llama.cpp, con cuantizaciones generadas mediante imatrix (matriz de importancia) en los tipos iq4_ks, iq4_ks_r4, iq5_k e iq6_k. Esto permite ejecutar un modelo de 31B en hardware de consumo con perdida de calidad controlada, algo especialmente relevante para la comunidad de inferencia local.

El repositorio ocupa 157 GB e incluye multiples variantes de cuantizacion. La licencia declarada es Apache 2.0. El modelo esta etiquetado como "not-for-all-audiences" y "nsfw", lo que condiciona su uso a entornos y audiencias adultas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma, segun etiquetas; detalles no disponibles) |
| Parametros totales | 32.106.631.740 (aproximadamente 32,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | iq4_ks, iq4_ks_r4, iq5_k, iq6_k (generadas con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para ik_llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas "gemma" y "gemma4", que apuntan a un transformer decoder-only de la familia Gemma de Google. El modelo base, Blazed-Forge/Split-Untied-31B, es un fine-tune sobre el que se han aplicado tecnicas de abliteration y "heretic" para reducir los rechazos y el comportamiento excesivamente alineado. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica destacable de esta publicacion es el uso de imatrix (matriz de importancia) para generar las cuantizaciones. Esta tecnica calibra la cuantizacion en funcion de la importancia de cada peso para la perplejidad, lo que permite que las variantes iq4_ks e iq4_ks_r4 conserven mas calidad que una cuantizacion uniforme a 4 bits. El formato esta optimizado para ik_llama.cpp, un fork de llama.cpp orientado a rendimiento en CPU y a soporte de cuantizaciones avanzadas.

## Capacidades

- Generacion de texto creativo: ficcion, narrativa y storytelling, segun las etiquetas del modelo.
- Roleplay y conversacion multi-turno: etiquetado explicitamente como "rp", "roleplay" y "conversational".
- Escritura creativa sin restricciones: el proceso de abliteration elimina los rechazos tipicos, permitiendo contenido para adultos ("nsfw", "uncensored").
- Generacion de texto general: pipeline declarado como text-generation.
- Capacidades multilingues: limitadas al ingles ("en").
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento explicito: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener dialogos de personaje multi-turno en ingles, ejecutandose en local gracias a las cuantizaciones GGUF de 4 y 5 bits, lo que evita enviar conversaciones privadas a servicios en la nube.
- Escritura de ficcion asistida: adecuado para generar borradores de narrativa, dialogos y descripciones sin las restricciones de contenido de los modelos alineados convencionales.
- Generacion de contenido para adultos: el proceso de abliteration y la etiqueta "nsfw" lo hacen apto para plataformas de contenido adulto que requieran generacion de texto sin filtros de rechazo.
- Prototipado de agentes de personaje: util para desarrolladores que construyan sistemas de personajes virtuales y necesiten un modelo que no rompa el personaje con rechazos.
- Inferencia en CPU con ik_llama.cpp: las cuantizaciones iq4_ks e iq5_k permiten desplegar un modelo de 31B en servidores sin GPU, usando el backend optimizado de ik_llama.cpp.
- Experimentacion en investigacion sobre alineacion: sirve como caso de estudio de modelos abliterated para comparar comportamiento con y sin rechazos.
- Despliegue en estaciones de trabajo con GPU de consumo: las variantes de 4 bits caben en GPUs con 24 GB de VRAM, permitiendo uso local de un modelo de 31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead habitual de llama.cpp):
  - iq4_ks / iq4_ks_r4: en torno a 17-19 GB.
  - iq5_k: en torno a 21-23 GB.
  - iq6_k: en torno a 25-27 GB.
- GPU recomendadas: RTX 4090 (24 GB) para iq4 e iq5; A100 40 GB o H100 para iq6_k con contexto largo; RTX 3090 (24 GB) para iq4.
- GPU de consumo: si, cabe en RTX 4090 y RTX 3090 con cuantizaciones de 4 y 5 bits; en GPUs de 16 GB requeriria offload parcial a CPU.
- Opciones de despliegue: ik_llama.cpp (formato nativo de esta publicacion); compatible tambien con llama.cpp y derivados como Ollama si soportan los tipos iq4_ks e iq4_ks_r4.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Split-Untied-31B-ik_llama.cpp | 32,1B | no disponible | GGUF (ik_llama.cpp) | Apache 2.0 | Abliterated, orientado a roleplay y NSFW |
| Blazed-Forge/Split-Untied-31B | 32,1B | no disponible | safetensors | Apache 2.0 | Modelo base sin cuantizar |
| Gemma 2 27B (referencia de familia) | 27B | no disponible en esta ficha | safetensors, GGUF | Gemma license | Alineado, con rechazos; no equivalente en comportamiento |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como "nsfw" y "not-for-all-audiences"; no debe desplegarse en entornos accesibles a menores ni sin moderacion.
- Sesgos: el proceso de abliteration elimina rechazos, lo que puede aumentar la probabilidad de generar contenido ofensivo, ilegal o danino; no hay evaluaciones de sesgo disponibles.
- Alucinacion: al ser un fine-tune creativo sin datos de evaluacion publicados, el riesgo de alucinacion en tareas factuales es alto y no esta cuantificado.
- Idioma: soporte limitado al ingles; el rendimiento en castellano no esta garantizado.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible, lo que dificulta planificar despliegues con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base declara la misma licencia; conviene verificar las condiciones del fine-tune original antes de produccion.
- Formato: las cuantizaciones estan pensadas para ik_llama.cpp; otros runners pueden no soportar iq4_ks_r4 y requerir conversion.
- Falta de benchmarks: no hay datos publicados de MMLU, HumanEval ni similares, por lo que la calidad real frente a alternativas no esta verificada.

## Enlaces

- Hugging Face: https://huggingface.co/Austriani/Split-Untied-31B-ik_llama.cpp
- Modelo base: https://huggingface.co/Blazed-Forge/Split-Untied-31B
- ik_llama.cpp (repositorio del motor): no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible en la informacion proporcionada
