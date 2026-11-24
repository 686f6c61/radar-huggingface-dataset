# mradermacher/sakura-gemma-4-E4B-it-i1-GGUF

## Resumen

sakura-gemma-4-E4B-it-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo Takenoko12345678/sakura-gemma-4-E4B-it, un ajuste fino de tipo LoRA sobre la familia Gemma 4 (variante E4B) orientado a conversacion en japones, personajes (persona/roleplay) y razonamiento con modo "thinking". El modelo base parte de la arquitectura Gemma 4 multimodal, con capacidades de vision, y esta etiquetado como compatible con transformadores y con endpoints, ademas de incluir soporte para MLX segun los tags del autor.

El repositorio que nos ocupa no contiene pesos originales sino versiones cuantizadas con calibracion imatrix (denominadas i1), pensadas para su uso en llama.cpp y ecosistemas compatibles con GGUF. El modelo cuenta con 7.518.069.290 parametros totales segun los safetensors del modelo base, lo que lo situa en la franja de ~7.500 millones de parametros, con licencia Apache 2.0 y soporte declarado de japones e ingles.

Su relevancia actual radica en que ofrece una via practica de ejecutar un modelo Gemma 4 afinado para rol conversacional en japones sobre hardware de consumo, mediante cuantizaciones que van desde ~4,5 GB (Q2_K) hasta ~5,3 GB (Q4_K_S) en las variantes listadas, manteniendo el formato multimodal (los ficheros mmproj se distribuyen en el repositorio estatico hermano).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (variante E4B); transformer multimodal con adaptador LoRA sobre el modelo base |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (listadas en el repo); el autor menciona ademas Q3_K_M, IQ3_XXS, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, IQ2_M, IQ1_M, etc. como parte del conjunto de quants generados |
| Idiomas soportados | ja, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix aparte); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino mediante LoRA sobre Gemma 4 E4B, segun los tags `lora` y `base_model:adapter:Takenoko12345678/sakura-gemma-4-E4B-it`. La familia Gemma 4 es multimodal (tag `multimodal` y nota del autor indicando que es un modelo de vision), por lo que conserva la torre de vision del modelo base; los ficheros mmproj necesarios para el procesamiento de imagen se alojan en el repositorio estatico hermano, no en este. El ajuste esta orientado a japones conversacional, persona y roleplay, con soporte de modo "thinking".

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el ajuste. Las cuantizaciones de este repositorio se han generado con calibracion imatrix (etiqueta `imatrix` y fichero `sakura-gemma-4-E4B-it.imatrix.gguf` de 0,1 GB), lo que segun el autor suele mejorar la calidad frente a cuantizaciones estaticas de tamano similar. El autor indica que las versiones estaticas estan disponibles en el repositorio `sakura-gemma-4-E4B-it-GGUF`.

## Capacidades

- Generacion de texto conversacional en japones e ingles, con enfasis en estilo persona y roleplay.
- Razonamiento con modo "thinking" (tag `thinking`).
- Procesamiento multimodal de vision (el autor confirma que es un modelo de vision; los mmproj estan en el repo estatico).
- Soporte de conversacion multi-turno orientada a personajes.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de MLX segun los tags del autor.
- No se documenta tool calling ni function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o razonamiento multi-paso mas alla del modo thinking.

## Casos de uso

- Roleplay y personajes conversacionales en japones: el ajuste LoRA esta especificamente entrenado para mantener persona y estilo, por lo que es adecuado para chatbots de personaje con consistencia de voz a lo largo de conversaciones multi-turno.
- Prototipado local en hardware de consumo: la cuantizacion i1-Q4_K_S (~5,3 GB) permite ejecutar el modelo en GPUs consumer con 8 GB o mas de VRAM mediante llama.cpp u Ollama, sin necesidad de infraestructura en la nube.
- Asistentes conversacionales en japones para producto: al soportar ja y en, puede desplegarse como backend de atencion al usuario en japones con respuestas estilizadas, aunque con las cautelas de alucinacion habituales.
- Experimentacion con modo thinking: util para investigar como el razonamiento explicito afecta a la calidad de respuesta en tareas de rol y dialogo.
- Aplicaciones de vision-lenguaje en japones: al conservar la torre multimodal, puede emplearse para descripcion de imagenes o dialogos sobre imagenes en japones, cargando los mmproj del repositorio estatico.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece varias variantes (Q2_K, IQ3_M, Q4_K_S) que permiten medir el impacto de la cuantizacion en calidad conversacional y perplexidad.
- Integracion en pipelines de inferencia local con llama.cpp: el formato GGUF y el fichero imatrix facilitan generar cuantizaciones propias adaptadas a un presupuesto de memoria concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: i1-Q2_K ~4,5 GB; i1-IQ3_M ~4,8 GB; i1-Q4_K_S ~5,3 GB (mas overhead de contexto y, en su caso, del proyector de vision).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para inferencia local comoda; A100/H100 solo si se busca alto throughput en serving.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM para las cuantizaciones Q4_K_S e inferiores; con 6 GB conviene bajar a IQ3_M o Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base es compatible con transformers. Para vision es necesario cargar los mmproj del repositorio estatico.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sakura-gemma-4-E4B-it (i1-GGUF) | 7.518.069.290 | no disponible | ja, en | apache-2.0 | GGUF |
| sakura-gemma-4-E4B-it (estatico GGUF) | 7.518.069.290 | no disponible | ja, en | apache-2.0 | GGUF |
| sakura-gemma-4-E4B-it (base, safetensors) | 7.518.069.290 | no disponible | ja, en | apache-2.0 | safetensors |

No se dispone de datos de benchmarks ni de modelos comparables de terceros en la informacion proporcionada; la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- El repositorio contiene unicamente cuantizaciones; la calidad final depende del modelo base y del proceso de cuantizacion, con perdida esperable en Q2_K e IQ3_M frente a Q4_K_S.
- No hay informacion sobre sesgos del ajuste LoRA ni sobre la composicion del dataset de entrenamiento, por lo que no puede evaluarse el riesgo de sesgo de forma documentada.
- Riesgo de alucinacion inherente a modelos de ~7.500 millones de parametros, especialmente en tareas factuales fuera del dominio conversacional.
- Soporte limitado a japones e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base Gemma 4 subyacente, que puede imponer terminos adicionales.
- Para uso multimodal es imprescindible descargar los ficheros mmproj del repositorio estatico; este repositorio no los incluye.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en produccion sin validacion previa.
- No hay datos publicados de contexto maximo, throughput ni latencia, lo que dificulta el dimensionamiento de despliegues en produccion.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/sakura-gemma-4-E4B-it-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/sakura-gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/Takenoko12345678/sakura-gemma-4-E4B-it
- Pagina de descargas del autor: https://hf.tst.eu/model#sakura-gemma-4-E4B-it-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
