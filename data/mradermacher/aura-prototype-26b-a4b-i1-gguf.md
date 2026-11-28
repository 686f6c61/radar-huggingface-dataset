# mradermacher/Aura-Prototype-26B-A4B-i1-GGUF

## Resumen

Aura-Prototype-26B-A4B-i1-GGUF es la version cuantizada en formato GGUF del modelo EldritchLabs/Aura-Prototype-26B-A4B, un modelo de lenguaje de aproximadamente 26.000 millones de parametros (25.971.339.550 exactamente, segun los safetensors del modelo base) orientado a escritura creativa, narrativa y roleplay. La cuantizacion la firma mradermacher, un autor habitual en el ecosistema GGUF, y emplea el esquema i1 (imatrix) de llama.cpp, que calibra los pesos con una matriz de importancia para reducir la perdida de calidad en tasas de compresion agresivas.

El modelo base procede de un merge (segun las etiquetas de la model card, generado con mergekit y mergekit-exp) y esta etiquetado como "gemma4", lo que sugiere que la arquitectura de partida es la familia Gemma 4. La nomenclatura "A4B" apunta a una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos por token, aunque este dato no aparece confirmado de forma explicita en la informacion disponible.

La relevancia practica de esta ficha esta en la distribucion: el repositorio ofrece 23 variantes de cuantizacion desde IQ1_S (8,6 GB) hasta Q6_K (23,3 GB), lo que permite ejecutar un modelo de casi 26.000 millones de parametros en hardware de consumo. El modelo esta publicado bajo licencia Apache 2.0 y esta especializado en generacion de ficcion (terror, romance, ciencia ficcion), continuacion de escenas y generacion de tramas y subtramas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) segun la nomenclatura A4B; familia Gemma 4 segun las etiquetas de la model card; no confirmado en detalle |
| Parametros totales | 25.971.339.550 (25,97 B) |
| Parametros activos | Aproximadamente 4 B segun la nomenclatura A4B (no confirmado de forma explicita) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (esquema i1/imatrix) |
| Idiomas soportados | Ingles (segun el campo `language: eng` de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas: el modelo base es un merge generado con mergekit y mergekit-exp, y la etiqueta "gemma4" indica que la familia de partida es Gemma 4. La nomenclatura A4B sugiere una configuracion MoE con unos 4.000 millones de parametros activos sobre un total de 26.000 millones, lo que explicaria la viabilidad de ejecutar el modelo en hardware modesto pese a su tamano total. No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica de esta publicacion concreta es la cuantizacion i1 con imatrix: mradermacher genera una matriz de importancia a partir de datos de calibracion y la usa para ponderar la cuantizacion, lo que mejora la relacion calidad/tamano frente a las cuantizaciones estaticas (disponibles en el repositorio hermano Aura-Prototype-26B-A4B-GGUF). El repositorio incluye ademas el propio fichero imatrix (0,2 GB) para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de ficcion en multiples generos: terror, romance, ciencia ficcion, drama y generacion de tramas y subtramas.
- Escritura creativa con prosa vivida ("vivid prosing", "vivid writing" en las etiquetas del autor).
- Roleplay y roleplaying conversacional multi-turno.
- Continuacion de escenas ("scene continue") y desarrollo narrativo a partir de un contexto dado.
- Conversacion general en ingles.
- Capacidad de vision: la model card de mradermacher indica explicitamente que es un modelo de vision y que los ficheros mmproj, si existen, estan en el repositorio estatico.
- No hay informacion sobre soporte de tool calling, function calling, agentes o modo de razonamiento explicito.

## Casos de uso

- Generacion de ficcion por capitulos: el modelo puede producir narrativa extensa en generos como terror o ciencia ficcion, manteniendo tono y estilo a lo largo de la generacion gracias a su especializacion en escritura creativa.
- Roleplay conversacional: adecuado para personajes con personalidad definida en sesiones multi-turno, con un registro que el autor etiqueta como permisivo con lenguaje soez ("swearing").
- Continuacion de escenas: util para escritores que necesitan extender un fragmento existente respetando voz narrativa, personajes y ambientacion.
- Generacion de tramas y subtramas: puede emplearse como herramienta de ideacion para guionistas y novelistas que necesitan estructuras narrativas alternativas.
- Asistencia a escritores en local: al caber en cuantizaciones de 16-17 GB (Q4_K_S, Q4_K_M), permite flujos de escritura asistida sin enviar material inedito a servicios en la nube.
- Prototipado de videojuegos narrativos: integrable mediante llama.cpp u Ollama en motores de dialogo para NPC con respuestas generadas en tiempo real.
- Analisis de imagenes en el contexto narrativo: si se descargan los ficheros mmproj del repositorio estatico, puede describir o interpretar imagenes como apoyo a la escritura (por ejemplo, ilustraciones de referencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ1_S ~8,6 GB; IQ2_M ~10,8 GB; IQ3_M ~12,8 GB; IQ4_XS ~14,4 GB; Q4_K_M ~17,3 GB; Q5_K_M ~19,7 GB; Q6_K ~23,3 GB.
- Cabe en GPU de consumo: las cuantizaciones de 8,6 a 16,5 GB caben en tarjetas de 12, 16 y 24 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB); las de 17,3 GB en adelante requieren 24 GB o reparto entre GPU y CPU.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M; A100 o H100 para el modelo sin cuantizar o para servir varias instancias.
- Despliegue: llama.cpp y Ollama para GGUF; el repositorio incluye el fichero imatrix para generar cuantizaciones propias. No se confirma soporte en vLLM o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aura-Prototype-26B-A4B-i1-GGUF (este) | 25,97 B (MoE, ~4 B activos) | No disponible | Apache 2.0 | GGUF i1 | Especializado en ficcion y roleplay |
| Aura-Prototype-26B-A4B-GGUF (mradermacher, estatico) | 25,97 B | No disponible | Apache 2.0 | GGUF estatico | Misma base, cuantizacion sin imatrix |
| EldritchLabs/Aura-Prototype-26B-A4B (base) | 25,97 B | No disponible | Apache 2.0 | Safetensors | Pesos originales, requiere transformers |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo esta entrenado y etiquetado unicamente en ingles; el rendimiento en castellano no esta garantizado.
- Es un modelo de ficcion con etiqueta explicita de lenguaje soez ("swearing"); puede generar contenido inapropiado en contextos profesionales sin un filtrado previo.
- Riesgo de alucinacion inherente a los modelos generativos; en tareas facticas no debe usarse como fuente de verdad.
- Las cuantizaciones por debajo de Q4 (especialmente IQ1 e IQ2) degradan notablemente la calidad; el propio autor las marca como "for the desperate" o "very low quality".
- La informacion sobre contexto maximo, composicion del dataset y proceso de entrenamiento no esta publicada, lo que dificulta evaluar su robustez en produccion.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base es un merge de terceros cuya procedencia exacta de pesos no se detalla en la informacion disponible; conviene revisar la model card del modelo base antes de un despliegue comercial.
- El soporte de vision depende de ficheros mmproj alojados en el repositorio estatico; no se confirma que esten disponibles para todas las cuantizaciones.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/Aura-Prototype-26B-A4B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Aura-Prototype-26B-A4B-GGUF
- Modelo base: https://huggingface.co/EldritchLabs/Aura-Prototype-26B-A4B
- Pagina de descargas del autor: https://hf.tst.eu/model#Aura-Prototype-26B-A4B-i1-GGUF
- Listado de modelos cuantizados del modelo base: https://huggingface.co/models?other=base_model%3Aquantized%3AEldritchLabs%2FAura-Prototype-26B-A4B
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
