# mradermacher/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF` es una coleccion de cuantizaciones GGUF (con ficheros imatrix) del modelo `DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source`, un fine-tune de la familia Gemma 4 de Google orientado a escritura creativa de terror, roleplay y generacion de ficcion sin filtros de contenido. El autor de las cuantizaciones es mradermacher, especialista en publicar versiones GGUF de modelos de la comunidad para su uso con llama.cpp y derivados.

El modelo base parte de Gemma 4 31B instruction-tuned (aproximadamente 30.700 millones de parametros segun los pesos en safetensors) y ha sido sometido a un proceso de abliteration y fine-tuning tematico (etiquetado como "heretic" y "uncensored"), eliminando parcialmente las capas de rechazo del modelo original. Incorpora ademas modos especiales declarados por el autor: 13 modos de razonamiento, 13 modos instruct, 10 "EVIL AI Constructs" y un modo "Halloween O/S", orientados a narrativa de terror y simulacion de personajes malvados.

La relevancia practica de esta ficha reside en que ofrece una via para ejecutar un modelo de ~31B en hardware de consumo mediante cuantizaciones agresivas (desde IQ1_S de 7,3 GB hasta IQ4_XS de 16,8 GB), a costa de una perdida de calidad significativa en los niveles mas bajos. Es un modelo de nicho, en ingles, sin benchmarks publicados y con advertencias claras sobre contenido no apto para todas las audiencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4); detalles especificos no disponibles |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (estaticas e imatrix/i1) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Gemma 4 31B instruction-tuned, por lo que hereda la arquitectura transformer decoder-only de la familia Gemma. Sobre esa base, el autor aplico un proceso de abliteration (eliminacion de la direccion de rechazo en el espacio de activaciones) combinado con fine-tuning tematico etiquetado como "heretic" y "uncensored". El resultado es un modelo que reduce drásticamente las negativas a generar contenido violento, de terror o explicito.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el fine-tune. El autor declara la incorporacion de "modos" (13 reasoning modes, 13 instruct modes, 10 EVIL AI Constructs, Halloween O/S) que probablemente se activan mediante prompts de sistema o palabras clave, pero la model card no documenta el mecanismo exacto. Las cuantizaciones de mradermacher emplean ficheros imatrix (importance matrix) para mejorar la calidad de los niveles bajos, generadas con llama.cpp.

## Capacidades

- Generacion de texto creativo en ingles: narrativa de terror, ficcion de genero, relatos y descripciones atmosfericas.
- Roleplay y simulacion de personajes, incluidos personajes antagonistas ("evil sims", "EVIL AI Constructs").
- Modos de razonamiento ("thinking"/reasoning) e instruct declarados por el autor, activables mediante prompts.
- Escritura multi-genero segun los tags del autor ("all genres", "story", "writing", "fiction").
- Generacion de contenido sin filtros de rechazo (uncensored/abliterated), incluyendo tematicas violentas o explicitas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no documentado mas alla de los "reasoning modes" declarados.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Escritura de ficcion de terror y horror: el modelo esta afinado especificamente para este genero, por lo que puede producir relatos, descripciones y dialogos atmosfericos con menos rechazos que un modelo alineado convencional.
- Roleplay narrativo y juegos de rol de mesa: los "EVIL AI Constructs" y modos de personaje permiten encarnar antagonistas y NPCs con consistencia, util en herramientas de ocio o prototipos de videojuegos narrativos.
- Prototipado de contenido para Halloween o eventos tematicos: generacion rapida de textos, guiones y ambientacion para campanas estacionales.
- Investigacion sobre abliteration y alineacion: util para estudiar como el proceso de abliteration afecta a la calidad, coherencia y seguridad del modelo frente al Gemma 4 original.
- Generacion de dialogos para simulaciones o agentes de ficcion: gracias a los modos de personaje, puede alimentar simulaciones conversacionales con personalidades definidas.
- Despliegue local en hardware de consumo: las cuantizaciones IQ3/IQ4 permiten ejecutar un modelo de ~31B en GPUs de 16-24 GB, adecuado para escritores o investigadores que quieran experimentar sin depender de APIs externas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece una matriz completa de niveles (IQ1 a Q6) con fichero imatrix, util para medir el impacto de la cuantizacion en la calidad narrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del fichero GGUF): IQ1_S ~7,3 GB; IQ2_M ~11,0 GB; IQ3_M ~14,5 GB; IQ4_XS ~16,8 GB; IQ4_NL y Q4_K_M superiores (tamano no listado en el extracto); Q6_K el mayor del conjunto.
- Para IQ4_XS (~16,8 GB) se recomienda una GPU de 24 GB (RTX 3090, RTX 4090) o una RTX 4080 de 16 GB con offloading parcial a RAM.
- Las cuantizaciones IQ3 (~14-15 GB) caben en una RTX 4080 de 16 GB con margen ajustado; las IQ2 (~9-11 GB) caben en GPUs de 12 GB (RTX 3060 12GB, RTX 4070).
- Las cuantizaciones IQ1 (~7-8 GB) caben en GPUs de 8 GB, pero el autor las marca como "for the desperate" / "mostly desperate", con calidad muy degradada.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa generalizada para este modelo.
- Latencia y throughput: no disponibles.
- Los ficheros multi-parte deben concatenarse antes de su uso (ver README de referencia de TheBloke).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored (esta ficha) | ~30,7B | no disponible | apache-2.0 | Fine-tune de terror/roleplay, abliterated, solo ingles | GGUF (i1 y estaticas) |
| Gemma 4 31B IT (original de Google) | ~30,7B | no disponible | Gemma license | Modelo general alineado, multilingue | Safetensors, GGUF de terceros |
| Fine-tunes "uncensored" de la comunidad sobre Llama/Mistral | variable | variable | variable | Roleplay y ficcion sin filtros | GGUF ampliamente disponible |

La comparativa cuantitativa de rendimiento no esta disponible al no publicarse benchmarks del modelo ni del base en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido no apto para todas las audiencias: el modelo esta disenado para generar terror, violencia y material explicito; no debe desplegarse en entornos orientados al publico general sin moderacion externa.
- La abliteration degrada la alineacion de seguridad: el modelo puede producir contenido danino, ilegal o eticamente problematico sin rechazo; requiere supervision humana en produccion.
- Riesgo elevado de alucinacion, especialmente en las cuantizaciones IQ1/IQ2, que el propio autor desaconseja salvo por limitaciones de hardware.
- Solo soporta ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada; no se debe asumir la ventana nativa de Gemma 4 sin verificacion.
- La licencia apache-2.0 se declara sobre el fine-tune, pero el modelo base Gemma esta sujeto a la Gemma Terms of Use de Google; conviene revisar la compatibilidad para uso comercial.
- Los "modos" (reasoning, instruct, EVIL AI Constructs) no estan documentados tecnicamente; su comportamiento puede ser inconsistente.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base.
- Repositorio de 334,8 GB con multiples cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF
- Modelo base: https://huggingface.co/DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source
- Cuantizaciones estaticas (sin imatrix): https://huggingface.co/mradermacher/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
