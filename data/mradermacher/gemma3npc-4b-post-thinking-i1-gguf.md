# mradermacher/Gemma3NPC-4B-post-thinking-i1-GGUF

## Resumen

Gemma3NPC-4B-post-thinking-i1-GGUF es una cuantizacion en formato GGUF del modelo chimbiwide/Gemma3NPC-4B-post-thinking, un ajuste fino de Gemma 3 de 4B parametros orientado a la interpretacion de personajes no jugadores (NPC) en juegos de rol. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y emplea cuantizacion con matriz de importancia (imatrix) para preservar mejor la calidad en tasas de bits bajas. El modelo base fue entrenado por chimbiwide sobre el dataset NPC-RP-Post-Thinking, un conjunto de datos de roleplay conversacional.

El modelo resuelve un problema concreto: disponer de un generador de dialogos de personaje coherente y ligero que pueda ejecutarse en hardware modesto. Con 3.880.263.168 parametros totales (aproximadamente 3,9B), se situa en la gama de modelos que caben en GPUs de consumo cuando se cuantiza a 4 bits, lo que lo hace atractivo para prototipos de videojuegos, herramientas de escritura creativa o sistemas de chat con personalidad. La licencia es Gemma, con acceso controlado en Hugging Face mediante aceptacion de los terminos de uso de Google.

La relevancia actual del modelo radica en su especializacion: no es un modelo generalista, sino un ajuste fino sobre una base Gemma 3 de 4B con un dataset de roleplay y un esquema de "post-thinking" que sugiere un entrenamiento orientado a mejorar la coherencia de las respuestas tras un razonamiento previo. El repositorio acumula 3117 descargas y ofrece un abanico amplio de cuantizaciones, desde IQ1_S (1,2 GB) hasta Q5_K_M (2,9 GB), lo que permite desplegarlo tanto en entornos con recursos muy limitados como en configuraciones de mayor calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 3 de 4B, segun el modelo base) |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M |
| Idiomas soportados | en (segun la model card) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base en safetensors |
| Tamano del repo | 48,4 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Gemma 3 de 4B, un transformer decoder-only desarrollado por Google. La model card del repositorio cuantizado no detalla la arquitectura interna mas alla de la referencia al modelo base, por lo que no se dispone de informacion especifica sobre numero de capas, dimensiones ocultas, mecanismos de atencion o si incorpora atencion lineal o ventanas deslizantes. Tampoco se documenta la longitud de contexto nativa.

El entrenamiento se realizo sobre el dataset chimbiwide/NPC-RP-Post-Thinking, un conjunto orientado a roleplay conversacional de personajes. El sufijo "post-thinking" sugiere que el ajuste incorpora un paso de razonamiento previo a la respuesta final, aunque la model card no describe el procedimiento exacto ni si se emplearon tecnicas de RLHF o DPO. No se especifica el volumen de tokens de entrenamiento ni la composicion detallada del dataset. La cuantizacion de mradermacher emplea matrices de importancia (imatrix) calculadas sobre el modelo base, lo que mejora la fidelidad de las cuantizaciones IQ frente a las estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional orientada a la interpretacion de personajes y roleplay.
- Coherencia de personaje sostenida en dialogos multi-turno, segun el proposito del dataset de entrenamiento.
- Modo "post-thinking": el modelo base incorpora un esquema de razonamiento previo a la respuesta, segun el nombre del modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el entrenamiento esta enfocado a roleplay, no a tareas agenticas.
- Capacidades multilingues: la model card declara unicamente ingles (en); no se documentan otros idiomas.
- Capacidades de vision: la model card del cuantizador menciona que el modelo base es de vision y que los ficheros mmproj, si existen, estarian en el repositorio estatico; no se confirma su disponibilidad en este repositorio.
- Capacidades especiales de audio: no disponible.

## Casos de uso

- Prototipado de NPC en videojuegos: el modelo puede generar dialogos de personaje coherentes y con personalidad en tiempo real, y su tamano de 4B cuantizado a 4 bits (unos 2,5 GB) permite integrarlo en un servidor de juego modesto o incluso en una estacion de trabajo de desarrollo.
- Herramientas de escritura creativa: util para generar dialogos de ficcion interactiva o guiones ramificados, donde la coherencia de voz del personaje a lo largo de varios turnos es el criterio principal y el modelo esta especializado precisamente en ello.
- Chatbots con personalidad para comunidades: permite desplegar un bot de rol en Discord o foros con un perfil de personaje fijo, usando cuantizaciones Q4_K_M (2,6 GB) que caben en GPUs de consumo.
- Investigacion sobre ajuste fino especializado: sirve como caso de estudio de como un dataset pequeno y especifico (NPC-RP-Post-Thinking) transforma un modelo base generalista en un especialista de dominio, util para comparar tecnicas de cuantizacion sobre modelos ajustados.
- Evaluacion de cuantizaciones imatrix: el repositorio ofrece 23 variantes de cuantizacion del mismo modelo, lo que permite medir empiricamente la degradacion de calidad en tareas de roleplay segun la tasa de bits, un caso practico para estudiar el impacto de IQ frente a Q_K.
- Despliegue en entornos con recursos limitados: las variantes IQ2 e IQ3 (1,4-2,3 GB) permiten ejecutar el modelo en CPUs o GPUs integradas, adecuado para demos offline o aplicaciones de escritorio con requisitos minimos.
- Generacion de contenido narrativo asistida: para autores que necesitan explorar variantes de dialogo de un personaje concreto sin salir de un entorno local, manteniendo la privacidad del material creativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,8 GB para cuantizaciones IQ1-IQ2, 2,0-2,3 GB para IQ3, 2,4-2,7 GB para IQ4, y 2,9 GB para Q5_K_M, sin contar el espacio para el contexto KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones Q4; una RTX 3060 de 12 GB o superior permite ejecutar la variante Q5_K_M con contexto amplio; A100 y H100 no son necesarias para este tamano y resultarian sobredimensionadas.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; las variantes IQ2 e IQ3 pueden ejecutarse incluso en GPUs integradas o en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio esta etiquetado como compatible con endpoints. Para el modelo base en safetensors se usaria transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma3NPC-4B-post-thinking-i1-GGUF | 3,88B | no disponible | gemma | GGUF (imatrix) | Especializado en roleplay de NPC |
| Gemma 3 4B (base) | ~4B | no disponible | gemma | safetensors, GGUF | Modelo generalista del que deriva |
| mradermacher/Gemma3NPC-4B-post-thinking-GGUF | 3,88B | no disponible | gemma | GGUF (estatico) | Misma base, cuantizaciones sin imatrix |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La comparativa con otros modelos de roleplay de tamano similar no esta disponible.

## Limitaciones y advertencias

- El modelo esta especializado en roleplay de personajes; su rendimiento en tareas generales de razonamiento, codigo o matematicas puede ser inferior al de Gemma 3 4B sin ajustar.
- La model card declara unicamente ingles como idioma; el rendimiento en castellano no esta documentado y probablemente sea limitado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, especialmente en afirmaciones factuales fuera del dominio del roleplay.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Gemma 3, hereda los sesgos del modelo base y del dataset de roleplay, que no se describe en detalle.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Google, con acceso controlado en Hugging Face mediante aceptacion de la licencia; es necesario revisar las restricciones antes de un despliegue en produccion.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; la propia model card advierte que IQ1_S es "para desesperados" y que Q2_K_S es de "calidad muy baja".
- El repositorio incluye 23 cuantizaciones en 48,4 GB; conviene descargar solo la variante necesaria para evitar consumo innecesario de almacenamiento.
- No se documenta la longitud de contexto nativa, lo que impide planificar conversaciones largas con garantias.
- La mencion a vision en la model card del cuantizador no se confirma con ficheros mmproj en este repositorio; verificar en el repositorio estatico antes de asumir capacidades multimodales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma3NPC-4B-post-thinking-i1-GGUF
- Modelo base: https://huggingface.co/chimbiwide/Gemma3NPC-4B-post-thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/chimbiwide/NPC-RP-Post-Thinking
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Gemma3NPC-4B-post-thinking-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Gemma3NPC-4B-post-thinking-i1-GGUF
