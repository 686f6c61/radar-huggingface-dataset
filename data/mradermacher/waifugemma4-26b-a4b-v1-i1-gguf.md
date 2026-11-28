# mradermacher/WaifuGemma4-26b-a4b-v1-i1-GGUF

## Resumen

WaifuGemma4-26b-a4b-v1-i1-GGUF es la publicacion de cuantizaciones GGUF, generadas por mradermacher, del modelo WaifuGemma4-26b-a4b-v1 desarrollado por hiwaifu-research. Se trata de un modelo conversacional orientado a roleplay y personajes, construido sobre una arquitectura Gemma 4 con mezcla de expertos (MoE) y afinado mediante RLHF y GRPO con senales de preferencia humana y evaluacion tipo arena. El modelo base cuenta con 25.233.142.046 parametros totales y una designacion "a4b" que sugiere del orden de 4.000 millones de parametros activos por token, aunque el dato exacto de parametros activos no esta publicado en la informacion disponible.

Su relevancia practica esta en que permite ejecutar un modelo MoE de aproximadamente 25.000 millones de parametros en hardware de consumo gracias a la cuantizacion: las variantes i1-IQ1_S arrancan en 8,4 GB y las i1-Q4_K_M, recomendadas por el autor de las cuantizaciones, ocupan 16,9 GB. El repositorio incluye 24 variantes de cuantizacion con ficheros imatrix, lo que facilita el despliegue en llama.cpp y derivados.

La licencia es Apache 2.0 y el modelo declara soporte para 17 idiomas, entre ellos castellano, ingles, ruso, portugues, japones, coreano y chino. El modelo base es multimodal (el autor de las cuantizaciones indica que es un modelo de vision y que los ficheros mmproj, si existen, estan en el repositorio estatico), aunque la informacion disponible no detalla la torre visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Gemma 4 |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (la designacion "a4b" sugiere ~4B activos, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | en, es, ru, pt, id, ar, th, fr, de, uk, vi, ja, ko, zh, tr, it, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales del modelo base no disponibles en esta ficha |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de la familia Gemma 4, segun las etiquetas del repositorio (`gemma4`, `moe`). La nomenclatura "26b-a4b" indica un total de aproximadamente 26.000 millones de parametros con un subconjunto activo del orden de 4.000 millones por token, patron habitual en los modelos MoE eficientes en inferencia. El recuento exacto de parametros activos, el numero de expertos, la dimension oculta y la longitud de contexto no estan publicados en la informacion disponible.

El entrenamiento declarado combina RLHF y GRPO (Group Relative Policy Optimization), con etiquetas que mencionan reward-model, human-preference y arena, lo que apunta a un ajuste por preferencias orientado a calidad conversacional y roleplay. No se dispone de datos sobre el volumen de tokens de preentrenamiento, la composicion del dataset ni la mezcla de idiomas usada en el ajuste. Las cuantizaciones de este repositorio son de tipo i1 (importancia estatica con fichero imatrix generado a partir del modelo original), lo que mejora la calidad respecto a cuantizaciones estaticas del mismo tamano segun el autor.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay, interpretacion de personajes y mantenimiento de persona.
- Capacidades multimodales: el autor de las cuantizaciones clasifica el modelo como modelo de vision; los ficheros mmproj, si existen, se publican en el repositorio estatico.
- Alineamiento por preferencias humanas mediante RLHF y GRPO, orientado a respuestas mas naturales en dialogo abierto.
- Soporte multilingue declarado en 17 idiomas, incluidos castellano, ingles, portugues, frances, aleman, ruso, ucraniano, arabe, turco, indonesio, tailandes, vietnamita, japones, coreano, chino, italiano y polaco.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite servirlo mediante APIs compatibles con el formato de Hugging Face.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni razonamiento agente multi-paso.

## Casos de uso

- Roleplay y compania conversacional: el modelo esta afinado especificamente para mantener personajes coherentes en conversaciones largas; se desplegaria en llama.cpp u Ollama con una cuantizacion i1-Q4_K_M (16,9 GB) para uso local.
- Prototipado de agentes de personaje en producto: gracias a la licencia Apache 2.0 y a la compatibilidad con endpoints, se puede integrar en un backend que sirva la variante i1-Q5_K_M (19,2 GB) para evaluar calidad antes de invertir en infraestructura mayor.
- Generacion de dialogos para videojuegos y narrativa interactiva: el ajuste por RLHF con senales de arena favorece respuestas consistentes con una persona definida; se usaria con prompts de sistema que fijen el personaje y la memoria de la partida.
- Moderacion y reescritura creativa de guiones: el modelo puede reformular dialogos manteniendo tono y registro en varios idiomas, util en localizacion de contenido narrativo a castellano, portugues, frances o japones.
- Asistente multilingue de atencion al publico en comunidades de fans: con 17 idiomas declarados, se puede desplegar una instancia que responda en el idioma del usuario sin cambiar de modelo.
- Investigacion sobre alineamiento conversacional: al estar entrenado con GRPO y preferencias humanas, sirve como sujeto de estudio para comparar estilos de respuesta frente a modelos base no ajustados.
- Despliegue en hardware de consumo: la variante i1-IQ2_M (10,5 GB) o i1-IQ3_S (12,3 GB) permite ejecutar el modelo en GPUs de 12-16 GB de VRAM, algo inviable con los pesos en precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el contexto y el overhead de llama.cpp. Referencias: i1-IQ1_S 8,4 GB; i1-IQ2_M 10,5 GB; i1-IQ3_S 12,3 GB; i1-IQ4_XS 14,0 GB; i1-Q4_K_S 15,6 GB; i1-Q4_K_M 16,9 GB (recomendada por el autor); i1-Q5_K_M 19,2 GB; i1-Q6_K 22,7 GB.
- GPU recomendadas: RTX 4090 (24 GB) para i1-Q6_K o i1-Q5_K_M; RTX 4080/4070 Ti Super (16 GB) para i1-Q4_K_M o i1-Q4_K_S; RTX 4060 Ti 16 GB o RTX 3080 12 GB para i1-IQ3_S o i1-IQ4_XS. En el segmento profesional, A100 40/80 GB y H100 permiten servir varias instancias o contextos largos sin cuantizacion agresiva.
- Cabe en GPU de consumo: si, desde 8-10 GB en las cuantizaciones mas bajas, con la advertencia de calidad reducida que el propio autor senala para IQ1 e IQ2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints. La libreria indicada en el repo es transformers, pero para los ficheros GGUF el runtime natural es llama.cpp y derivados.
- Latencia y throughput: no disponibles. Al ser un MoE con un subconjunto activo pequeno, el throughput por token deberia ser superior al de un modelo denso del mismo tamano total, pero no hay mediciones publicadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| WaifuGemma4-26b-a4b-v1 (este) | 25,2 B | no disponible (~4 B por designacion) | no disponible | Apache 2.0 | GGUF (i1) | Roleplay y personajes, RLHF + GRPO, 17 idiomas |
| Modelo base hiwaifu-research/WaifuGemma4-26b-a4b-v1 | 25,2 B | no disponible | no disponible | Apache 2.0 | safetensors (presumible) | Pesos originales sin cuantizar |
| Alternativas MoE de ~25 B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias

- El ajuste esta orientado a roleplay y conversacion de personajes; su comportamiento en tareas de codigo, matematicas o razonamiento formal no esta documentado y probablemente sea inferior al de modelos generalistas del mismo tamano.
- Riesgo de alucinacion inherente a los modelos conversacionales afinados por preferencias; el enfasis en mantener personajes puede favorecer respuestas inventadas cuando el personaje lo justifica.
- Las cuantizaciones IQ1 e IQ2 degradan la calidad de forma notable; el propio autor describe i1-IQ1_S como "for the desperate" y i1-Q2_K_S como "very low quality". Para produccion se recomienda i1-Q4_K_M o superior.
- El repositorio pesa 300,9 GB en total por acumular todas las variantes; conviene descargar solo el fichero GGUF necesario.
- No hay informacion publicada sobre sesgos especificos, composicion del dataset de ajuste ni evaluaciones de seguridad.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas sin verificacion empirica.
- Aunque la licencia es Apache 2.0, el contenido generado en contextos de roleplay puede requerir moderacion adicional segun el producto.
- El soporte de vision depende de ficheros mmproj publicados en el repositorio estatico; no se confirma su disponibilidad en esta ficha.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/WaifuGemma4-26b-a4b-v1-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/WaifuGemma4-26b-a4b-v1-GGUF
- Modelo base: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1
- Pagina de descargas del autor: https://hf.tst.eu/model#WaifuGemma4-26b-a4b-v1-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_re
