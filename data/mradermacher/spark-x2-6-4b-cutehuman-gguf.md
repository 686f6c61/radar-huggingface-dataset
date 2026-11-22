# mradermacher/Spark-x2.6-4B-CuteHuman-GGUF

## Resumen

Spark-x2.6-4B-CuteHuman es un modelo de lenguaje de 4.112.079.360 parámetros (aproximadamente 4,1 mil millones) especializado en roleplay y conversación con persona "cute" (estilo kawaii), desarrollado originalmente por el usuario wesjos bajo el identificador wesjos/Spark-x2.6-4B-CuteHuman. Esta ficha corresponde concretamente a la versión cuantizada en formato GGUF publicada por mradermacher, un conocido empaquetador de cuantizaciones para la comunidad de inferencia local.

El modelo parte de la familia Spark x2.6 y ha sido ajustado mediante SFT (supervised fine-tuning) para adoptar una personalidad concreta, con soporte para emojis y conversación conversacional. Los tags declarados incluyen roleplay, persona, cute, emoji y sft, lo que sitúa el modelo en el nicho de asistentes conversacionales con personalidad marcada más que en el de modelos de propósito general para tareas técnicas.

La relevancia de esta ficha reside en que la versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, etc.), con cuantizaciones desde Q2_K (1,9 GB) hasta f16 (8,3 GB). La licencia Apache 2.0 facilita su uso comercial, aunque las capacidades reales del modelo están acotadas por su tamaño y por su orientación específica a roleplay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformers; familia Spark x2.6) |
| Parametros totales | 4.112.079.360 (~4,1 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; tambien disponibles cuantizaciones con imatrix (i1) en repo separado |
| Idiomas soportados | zh, en (segun la model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los metadatos indican que se trata de un modelo de la familia Spark x2.6 con 4,1 mil millones de parametros, ajustado mediante SFT (supervised fine-tuning) para conversacion con persona. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de esta publicacion no esta en el modelo en si, sino en el trabajo de cuantizacion realizado por mradermacher: se ofrecen 12 variantes GGUF estaticas con tamanos desde 1,9 GB (Q2_K) hasta 8,3 GB (f16), ademas de una version con cuantizacion ponderada/imatrix publicada en un repositorio separado (Spark-x2.6-4B-CuteHuman-i1-GGUF). Las cuantizaciones Q4_K_S y Q4_K_M se marcan como "fast, recommended", y Q6_K como "very good quality".

## Capacidades

- Generacion de texto conversacional orientada a roleplay y personificacion.
- Adopcion de una persona "cute" con uso de emojis, segun los tags del modelo.
- Conversacion multi-turno en formato chat (pipeline conversational en los tags).
- Soporte de los idiomas chino (zh) e ingles (en) segun la model card.
- Ajuste mediante SFT para respuestas con estilo de personaje.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Roleplay conversacional en local: el modelo puede mantener conversaciones con una persona definida y uso de emojis, ejecutandose en un portatil con GPU de consumo gracias a las cuantizaciones de 2-3 GB.
- Prototipado de chatbots con personalidad: util para validar rapidamente la experiencia de usuario de un asistente con tono "cute" antes de invertir en un modelo mayor.
- Demos y experimentos de investigacion sobre persona y estilo: permite estudiar como el SFT modifica el tono y la expresividad sin requerir infraestructura grande.
- Integracion en aplicaciones de escritorio mediante Ollama o LM Studio: al ser GGUF, se puede distribuir como modelo embebido en apps locales de chat.
- Generacion de dialogos para videojuegos o narrativa interactiva: el sesgo hacia roleplay y emojis encaja en personajes secundarios o NPCs con personalidad marcada.
- Entornos con recursos limitados o sin conexion: la variante Q2_K (1,9 GB) permite inferencia en CPU o GPUs con poca VRAM, util para pruebas offline.
- Fine-tuning posterior o experimentacion: al estar bajo Apache 2.0 y disponible en transformers, sirve como base para ajustes adicionales de persona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~1,9 GB; Q3_K_S ~2,0 GB; Q3_K_M ~2,3 GB; Q3_K_L ~2,5 GB; IQ4_XS ~2,5 GB; Q4_K_S ~2,5 GB; Q4_K_M ~2,7 GB; Q5_K_S ~3,0 GB; Q5_K_M ~3,1 GB; Q6_K ~3,5 GB; Q8_0 ~4,5 GB; f16 ~8,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; 6-8 GB para Q8_0 o f16 con contexto amplio. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 permiten ejecutar todas las variantes con holgura. En A100/H100 el modelo es sobredimensionado para su tamano, pero valido para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de 4 GB o mas con cuantizaciones Q4; tambien en CPU via llama.cpp con las variantes Q2-Q4.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El modelo base (no cuantizado) se puede cargar con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo de 4 B, se espera una velocidad alta en GPU de consumo, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales en la informacion proporcionada. A modo orientativo por tamano y formato, se podria comparar con otros modelos de ~4 B disponibles en GGUF, pero no se aportan cifras verificables para esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-x2.6-4B-CuteHuman (esta ficha) | ~4,1 B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en roleplay/persona cute |
| Alternativas de ~4 B en GGUF | no disponible | no disponible | no disponible | GGUF | No se aportan datos verificables |

## Limitaciones y advertencias

- Modelo pequeno (4,1 B) y especializado en roleplay: su rendimiento en tareas de razonamiento, codigo o matematicas sera limitado en comparacion con modelos mayores.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente fuera del dominio conversacional para el que fue ajustado.
- Idiomas documentados: chino e ingles. No se garantiza un buen rendimiento en castellano ni en otros idiomas.
- No se documentan capacidades de tool calling, agentes ni vision; no debe asumirse su disponibilidad.
- La persona "cute" con emojis puede no ser adecuada para entornos profesionales o de atencion al cliente formales.
- Aunque la licencia es Apache 2.0, conviene revisar la model card del modelo base (wesjos/Spark-x2.6-4B-CuteHuman) por si hubiera condiciones adicionales no reflejadas en los metadatos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan la coherencia; para produccion se recomienda Q4_K_M o superior.
- No se dispone de informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Spark-x2.6-4B-CuteHuman-GGUF
- Modelo base: https://huggingface.co/wesjos/Spark-x2.6-4B-CuteHuman
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Spark-x2.6-4B-CuteHuman-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Spark-x2.6-4B-CuteHuman-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
