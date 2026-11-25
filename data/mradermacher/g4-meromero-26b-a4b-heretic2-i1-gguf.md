# mradermacher/G4-MeroMero-26B-A4B-Heretic2-i1-GGUF

## Resumen

G4-MeroMero-26B-A4B-Heretic2-i1-GGUF es una cuantizacion GGUF del modelo EternalDragon/G4-MeroMero-26B-A4B-Heretic2, publicada por el usuario mradermacher. Se trata de un modelo afinado para roleplay y conversacion, derivado de la familia Gemma 4, con un enfoque "uncensored" (etiqueta heretic) que busca reducir los rechazos y filtros de seguridad del modelo base. El repositorio incluye unicamente pesos cuantizados en formato GGUF, pensados para inferencia local con llama.cpp y herramientas compatibles.

El modelo cuenta con 25.233.142.046 parametros totales (aproximadamente 25,2 mil millones), segun los datos de safetensors del modelo base, y la nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos con unos 4 mil millones de parametros activos por token, aunque este dato no se confirma en la informacion disponible. La model card indica que es un modelo de vision, con archivos mmproj disponibles en el repositorio estatico hermano.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo de ~25B con capacidades conversacionales y de roleplay en hardware de consumo, gracias a la amplia gama de cuantizaciones publicadas (desde IQ1_S de 8,4 GB hasta Q6_K de 22,7 GB). La licencia Apache 2.0 facilita su uso comercial, si bien las etiquetas "uncensored" y "heretic" implican caveats importantes de seguridad y moderacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 (detalles de MoE no confirmados; la nomenclatura "A4B" sugiere ~4B activos) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | no disponible (la nomenclatura "A4B" sugiere ~4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix/weighted) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base EternalDragon/G4-MeroMero-26B-A4B-Heretic2 mas alla de su pertenencia a la familia Gemma 4 y de la nomenclatura "A4B", que en la convencion habitual de Gemma 4 indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parametros activos sobre un total de ~26B. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares.

El proceso de cuantizacion aplicado por mradermacher es de tipo "i1" (imatrix/weighted), es decir, cuantizaciones generadas con una matriz de importancia (imatrix) que ajusta la perdida de calidad por capa. La model card incluye el archivo imatrix.gguf (0,2 GB) para que terceros puedan generar sus propias cuantizaciones. Las etiquetas "heretic" y "uncensored" indican que el afinamiento del modelo base busco reducir los comportamientos de rechazo, presumiblemente mediante tecnicas de ablacion o ajuste especifico, aunque no se documenta el metodo exacto.

## Capacidades

- Generacion de texto conversacional y de roleplay, segun las etiquetas del repositorio.
- Capacidades de vision: la model card indica explicitamente que es un modelo de vision, con archivos mmproj (si existen) alojados en el repositorio estatico.
- Comportamiento "uncensored": el afinamiento heretic busca reducir los rechazos del modelo base ante peticiones que este filtraria.
- Soporte de conversaciones multi-turno (etiqueta "conversational").
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta afinado especificamente para este dominio, con etiquetas explicitas de "roleplay" y "conversational", lo que lo hace adecuado para personajes persistentes y dialogos largos en aplicaciones de entretenimiento.
- Personajes de videojuego con IA generativa: la cuantizacion Q4_K_M (16,9 GB) permite ejecutar el modelo en una GPU de consumo de gama alta, habilitando NPCs con respuestas dinamicas y sin filtros excesivos.
- Asistente conversacional sin moderacion estricta: para entornos controlados donde se requiere evitar rechazos del modelo base (por ejemplo, ficcion adulta o temas sensibles en investigacion creativa), el afinamiento heretic resulta adecuado.
- Investigacion sobre alineacion y seguridad: util como caso de estudio de modelos "uncensored" para analizar como el afinamiento altera los comportamientos de rechazo respecto al Gemma 4 original.
- Generacion de contenido creativo sin restricciones: guiones, dialogos y ficcion donde los filtros estandar interrumpen el flujo creativo.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones IQ2/IQ3 (9-13 GB), puede ejecutarse en GPUs consumer de 12-16 GB con llama.cpp u Ollama, sin dependencia de la nube.
- Prototipado de aplicaciones multimodales: al ser un modelo de vision, puede emplearse para tareas de descripcion de imagenes o dialogos sobre imagenes, con los archivos mmproj correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ1_S ~8,4 GB; IQ2_M ~10,5 GB; IQ3_M ~12,5 GB; IQ4_XS ~14,0 GB; Q4_K_M ~16,9 GB; Q5_K_M ~19,2 GB; Q6_K ~22,7 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y superiores; RTX 4080/4070 Ti Super (16 GB) para IQ3/IQ4; RTX 3060 12 GB o similar para IQ2/IQ3 bajas.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones; Q6_K requiere 24 GB o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; la etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G4-MeroMero-26B-A4B-Heretic2-i1-GGUF | ~25,2B | no disponible | Apache 2.0 | GGUF | Modelo uncensored de roleplay, vision |
| EternalDragon/G4-MeroMero-26B-A4B-Heretic2 | ~25,2B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/G4-MeroMero-26B-A4B-Heretic2-GGUF | ~25,2B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas (no imatrix) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": el afinamiento heretic reduce deliberadamente los filtros de seguridad, lo que implica riesgo de generar contenido inapropiado, ofensivo o danino; no recomendado para produccion orientada al publico general sin moderacion adicional.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los sesgos del modelo base Gemma 4 y del dataset de afinamiento.
- Riesgo de alucinacion: no cuantificado; como todo modelo de lenguaje, puede generar informacion falsa con aparente seguridad.
- Limitacion de idioma: solo ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Longitud de contexto: no especificada, lo que dificulta planificar aplicaciones con contextos largos.
- Las cuantizaciones IQ1 e IQ2 (8-10 GB) degradan notablemente la calidad; la propia model card advierte "for the desperate" y "very low quality" en algunas variantes.
- Licencia Apache 2.0 permite uso comercial, pero el caracter uncensored puede entrar en conflicto con politicas de plataformas y normativas de contenido.
- No se documentan los datos de entrenamiento ni el metodo de afinamiento heretic, lo que limita la evaluacion de riesgos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/G4-MeroMero-26B-A4B-Heretic2-i1-GGUF
- Modelo base: https://huggingface.co/EternalDragon/G4-MeroMero-26B-A4B-Heretic2
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/G4-MeroMero-26B-A4B-Heretic2-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#G4-MeroMero-26B-A4B-Heretic2-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
