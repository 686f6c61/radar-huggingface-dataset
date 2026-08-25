# mradermacher/Ministral-3-8B-Animus-V12.0-i1-GGUF

## Resumen

El repositorio `mradermacher/Ministral-3-8B-Animus-V12.0-i1-GGUF` contiene las cuantizaciones GGUF con imatrix del modelo `Darkhn/Ministral-3-8B-Animus-V12.0`, un fine-tune del modelo multimodal Ministral-3-8B de Mistral AI orientado a roleplay y chat con temática de la saga literaria Wings of Fire. El modelo base de Mistral está diseñado para despliegue en edge y ofrece capacidades de visión, pero este fine-tune se centra en conversación inmersiva y narrativa, con contenido explícito para adultos (tag NSFW).

La relevancia actual radica en que combina la arquitectura eficiente de Ministral-3-8B (aprox. 8.5 mil millones de parámetros) con un ajuste especializado para interacción creativa y juegos de rol, manteniendo una licencia Apache 2.0 que permite uso comercial. La versión cuantizada por mradermacher ofrece un amplio abanico de tamaños de archivo (desde 2.2 GB hasta 7.1 GB) para adaptarse a diferentes capacidades de hardware, desde CPU hasta GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (con vision) |
| Parametros totales | 8.489.553.920 (~8.5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Ministral-3-8B soporta 128k tokens, pero no se confirma en el fine-tune) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivos imatrix) |

## Arquitectura y entrenamiento

El modelo base `Darkhn/Ministral-3-8B-Animus-V12.0` es un fine-tune del Ministral-3-8B de Mistral AI, que emplea una arquitectura transformer multimodal con capacidades de vision. El modelo original de Mistral está entrenado para tareas de instruccion, chat y razonamiento, con un contexto de hasta 128k tokens. El fine-tune de Darkhn esta orientado a roleplay y chat creativo, con una tematica especifica de Wings of Fire y contenido NSFW (no apto para todas las audiencias). No se dispone de informacion detallada sobre el dataset de entrenamiento del fine-tune ni sobre si se emplearon tecnicas de RLHF o DPO.

La cuantizacion GGUF realizada por mradermacher utiliza el metodo de imatrix (importance matrix) para mejorar la calidad de las cuantizaciones de baja precision, especialmente en los formatos IQ (i-quant). El repositorio incluye un archivo imatrix de referencia para que los usuarios puedan crear sus propias cuantizaciones personalizadas. Los quants i1 (i-quant) son preferibles a los quants estaticos equivalentes en terminos de calidad por tamano, segun la documentacion del autor.

## Capacidades

- Generacion de texto: genera respuestas coherentes y creativas en ingles, adaptadas al contexto conversacional o narrativo.
- Chat y roleplay: optimizado para mantener conversaciones multi-turno con personajes, ideal para juegos de rol textual.
- Vision: el modelo base tiene capacidades multimodales (vision), aunque no se confirma si el fine-tune las mantiene. Los archivos mmproj necesarios para vision se encuentran en el repositorio estatico.
- Multilingue: no, solo soporta ingles (tag `en`).
- Tool calling / function calling: no confirmado en la informacion disponible.
- Contenido NSFW: el modelo puede generar contenido explicito para adultos, segun los tags `nsfw` y `not-for-all-audiences`.

## Casos de uso

- **Juegos de rol de ficcion**: el modelo puede actuar como narrador o personaje en partidas de rol ambientadas en el universo de Wings of Fire, gestionando dialogos y descripciones de escenas de forma coherente.
- **Creacion de historias interactivas**: los usuarios pueden co-escribir relatos de fantasia con el modelo, que responde a las acciones del usuario y mantiene el tono y la ambientacion de la obra.
- **Chat de entretenimiento con personajes**: se puede integrar en aplicaciones de chat para conversar con personajes ficticios, con un estilo de dialogo adaptado al universo de los dragones.
- **Generacion de contenido creativo para aficionados**: util para escribir fanfiction o material de apoyo para comunidades de Wings of Fire, con un estilo narrativo inmersivo.
- **Prototipado de asistentes conversacionales con tono narrativo**: sirve como base para sistemas de chat que requieren un estilo de lenguaje creativo y no formal, como chatbots de entretenimiento o experiencias interactivas.
- **Evaluacion de tecnicas de cuantizacion**: el amplio abanico de quants permite a desarrolladores e investigadores comparar el impacto de diferentes niveles de cuantizacion en la calidad de la generacion de texto en un modelo de roleplay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: depende de la cuantizacion. Los quants mas pequenos (i1-IQ1_S, 2.2 GB) pueden ejecutarse en GPU con 4 GB de VRAM, mientras que los mas grandes (i1-Q6_K, 7.1 GB) requieren al menos 8 GB. Se recomienda VRAM adicional para el contexto.
- **GPU recomendadas**: para cuantizaciones de hasta 4 GB, una NVIDIA RTX 3060 o superior es suficiente; para los quants mas grandes, una RTX 4060 Ti o RTX 4070 son adecuadas. Para CPU-only, se puede usar llama.cpp con las cuantizaciones Q4_K_M o inferiores.
- **Compatibilidad con GPU de consumo**: si, todas las cuantizaciones caben en GPU de consumo con 8 GB de VRAM o mas.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, o cualquier frontend que soporte GGUF. Para servidores, se puede usar llama-server o vLLM (con conversion a formato compatible).
- **Latencia y throughput**: no disponible. En una GPU RTX 4090, un modelo de 8B cuantizado a Q4_K_M suele generar entre 40 y 60 tokens por segundo, pero depende del hardware y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Especializacion |
|---|---|---|---|---|---|
| Ministral-3-8B-Animus-V12.0 (este) | 8.5B | No disponible | Apache 2.0 | GGUF | Roleplay, chat, Wings of Fire |
| Ministral-3-8B-Instruct (base) | 8.5B | 128k tokens | Apache 2.0 | Safetensors | Instruccion, chat, vision |
| Llama-3.1-8B-Instruct | 8B | 128k tokens | Llama 3.1 License | Safetensors, GGUF | Instruccion general, multilingue |

La comparativa se limita a modelos del mismo tamano y con licencia abierta. El modelo de Darkhn se diferencia por su especializacion en roleplay y contenido creativo, mientras que los otros son modelos de instruccion generales. No se dispone de datos de rendimiento para una comparacion cuantitativa.

## Limitaciones y advertencias

- **Contenido NSFW**: el modelo puede generar contenido explicito para adultos, lo que lo hace inadecuado para menores o para entornos de trabajo no apropiados. La etiqueta `not-for-all-audiences` es una advertencia explicita.
- **Sesgos y alucinaciones**: como modelo basado en un fine-tune de roleplay, puede presentar sesgos presentes en los datos de entrenamiento y alucinaciones en hechos factuales. No es adecuado para tareas de informacion veridica.
- **Idioma limitado**: solo soporta ingles, lo que limita su uso a audiencias angloparlantes.
- **Contexto no confirmado**: aunque el modelo base tiene 128k tokens, el fine-tune puede haber reducido el contexto efectivo durante el entrenamiento. No se ha confirmado la longitud de contexto real de este modelo.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion, pero hay que revisar si el fine-tune respeta los terminos del modelo base de Mistral (que tambien es Apache 2.0). No se han detectado restricciones adicionales.
- **Calidad de cuantizacion**: los quants mas pequenos (i1-IQ1_S, i1-IQ1_M) pueden degradar notablemente la calidad de la generacion. Se recomienda usar al menos i1-Q4_K_M para un uso serio.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/mradermacher/Ministral-3-8B-Animus-V12.0-i1-GGUF)
- [Modelo base de Darkhn](https://huggingface.co/Darkhn/Ministral-3-8B-Animus-V12.0)
- [Repositorio de cuantizaciones estaticas del mismo modelo](https://huggingface.co/mradermacher/Ministral-3-8B-Animus-V12.0-GGUF)
- [Coleccion Ministral 3 de Mistral AI](https://huggingface.co/collections/mistralai/ministral-3)
- [Pagina de Mistral AI sobre Ministral 3](https://mistral.ai/news/ministraux/)
- [Guia de uso de Ministral 3 en Unsloth](https://unsloth.ai/docs/models/tutorials/ministral-3)
- [Pagina de Ministral-3 en Ollama](https://ollama.com/library/ministral-3)
