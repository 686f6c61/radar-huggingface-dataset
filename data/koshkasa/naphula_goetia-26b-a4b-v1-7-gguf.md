# Koshkasa/Naphula_Goetia-26B-A4B-v1.7-GGUF

## Resumen

Naphula_Goetia-26B-A4B-v1.7-GGUF es el repositorio de cuantizaciones en formato GGUF del modelo Naphula/Goetia-26B-A4B-v1.7, un modelo de lenguaje de tipo mezcla de expertos (MoE) orientado a escritura creativa, narrativa de ficción y roleplay. Lo publica el usuario Koshkasa, que actua como cuantizador (quantized_by), mientras que el modelo original (pesos safetensors) procede de Naphula. La relevancia de esta ficha esta en que permite ejecutar en local, mediante llama.cpp y herramientas compatibles, una variante cuantizada con imatrix de un modelo de generacion de texto de gran calidad estilistica.

El modelo base se construyo combinando varios modelos preentrenados mediante la tecnica de merge MoE DELLA, tomando como base google/gemma-4-26B-A4B, segun la documentacion de las versiones previas del mismo linaje (v1.4, v1.5). De ahi la denominacion 26B-A4B: aproximadamente 26.000 millones de parametros totales con unos 4.000 millones activos por token gracias al enrutamiento MoE. La ventana de contexto documentada para el linaje es de 32.768 tokens.

Este repositorio concreto aporta las cuantizaciones GGUF generadas con un imatrix calculado sobre el dataset combinado de bartowski a partir de los pesos en q8_0, con llama.cpp en el commit 1692f9e50. Esta pensado para despliegue local con llama.cpp y derivados (Ollama, LM Studio, entre otros). El modelo esta etiquetado unicamente en ingles y distribuido bajo licencia apache-2.0, aunque conviene verificar la licencia del modelo base Gemma antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en google/gemma-4-26B-A4B; fusion mediante MoE DELLA merge (mergekit) |
| Parametros totales | ~26B segun la denominacion del modelo; la ficha de HuggingFace reporta 14.224.235 en el campo safetensors (dato inconsistente, probablemente erroneo) |
| Parametros activos | ~4B (denominacion A4B) |
| Longitud de contexto | 32.768 tokens (segun documentacion del linaje v1.4) |
| Tipos de cuantizacion | GGUF con imatrix y cuantizaciones estandar; imatrix generado sobre pesos q8_0 con -c 512 -b 512 -ub 512; tipos concretos no disponibles en la informacion |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizacion; modelo base en safetensors) |

## Arquitectura y entrenamiento

Se trata de un modelo de arquitectura Mixture of Experts (MoE) derivado de google/gemma-4-26B-A4B. No es un modelo entrenado desde cero, sino una fusion (merge) de varios modelos preentrenados de la familia Gemma-4-26B-A4B, realizada con la tecnica MoE DELLA implementada en mergekit. Entre los modelos combinados figuran variantes especializadas en razonamiento y ajuste de estilo, segun la documentacion de versiones anteriores del mismo linaje. La activacion dispersa implica que, pese a tener unos 26B de parametros totales, solo se activan aproximadamente 4B por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano.

En cuanto a los datos de entrenamiento, no se dispone de informacion sobre el numero de tokens, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base. Lo unico documentado en este repositorio es que el fichero imatrix usado para la cuantizacion se genero sobre el dataset combinado de bartowski, publicado como gist, partiendo de los pesos en q8_0. La cuantizacion se realizo con llama.cpp en el commit 1692f9e50. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto y escritura creativa en ingles, con enfasis declarado en prosa vivida y estilos oscuros (dark writing), terror, suspense y romance.
- Generacion de narrativa y ficcion: creacion de tramas, subtramas (sub-plot generation), continuacion de escenas y storytelling.
- Roleplay y conversacion (RP) multiuso, con etiquetas de "all genres" y "conversational".
- Ciencia ficcion y ficcion especulativa como genero soportado explicitamente.
- Capacidad de generacion de guiones y escenas con continuacion de contexto (scene continue).
- Soporte de vocabulario adulto o soez (tag "swearing"), segun la propia model card.
- Tool calling / function calling: no disponible en la informacion.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: unicamente ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponible. Nota: la ficha del modelo base v1.7 en HuggingFace aparece como Image-Text-to-Text, lo que podria implicar soporte multimodal, pero no se confirma en la informacion de este repositorio GGUF.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar y continuar relatos largos de ficcion, terror o romance apoyandose en sus 32.768 tokens de contexto para mantener coherencia de personajes y trama a lo largo de varios capitulos.
- Roleplay conversacional: adecuado para motores de personajes en aplicaciones de entretenimiento, dado su ajuste especifico a RP y su manejo de estilos "oscuros" y de suspense.
- Generacion de tramas y subtramas para guiones o novelas: util para autores que necesitan explorar variantes argumentales, con capacidad declarada de sub-plot generation.
- Continuacion de escenas en herramientas de escritura: puede integrarse en editores de texto como motor de "scene continue", completando pasajes a partir de un contexto largo de la obra.
- Prototipado de videojuegos narrativos: como backend de dialogo y narrativa ramificada en juegos de rol o aventuras conversacionales, ejecutado en local por su naturaleza MoE eficiente en activacion.
- Experimentacion con merges y cuantizaciones: la propia existencia del repositorio lo hace util para investigadores que quieran estudiar el comportamiento de un merge DELLA bajo distintas cuantizaciones imatrix.
- Despliegue local en estaciones de trabajo: permite generar texto sin conexion a servicios en la nube en equipos con VRAM o RAM suficientes, con foco en prosa creativa en ingles.
- Generacion de contenido de ficcion en ingles: blogs, newsletters o ficcion seriada donde el idioma de trabajo sea exclusivamente el ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (FP16) el linaje de 26B se estima en torno a 52 GB de VRAM, segun el agregador LLM Explorer para la version v1.5. Las cuantizaciones GGUF reducen este requisito de forma sustancial (el repositorio completo ocupa 103 GB, sumando todas las variantes).
- Cuantizaciones bajas (Q4_K_M y similares): deberian caber en GPUs de consumo con 16-24 GB de VRAM, aunque el dato exacto por cuantizacion no esta especificado en el repositorio.
- Cuantizaciones altas (Q8_0 y superiores): orientadas a GPUs profesionales tipo A100, H100 o configuraciones multi-GPU, dado el tamano del modelo.
- GPU recomendadas: A100, H100 o RTX 4090 para cuantizaciones medias; GPUs con 24 GB o mas para cuantizaciones Q4.
- Ejecucion en CPU: posible mediante llama.cpp, dado que el formato GGUF esta disenado para inferencia hibrida CPU/GPU; el rendimiento dependera de la RAM disponible.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier servidor compatible con GGUF. El soporte de vLLM con GGUF depende de la version.
- Latencia y throughput estimados: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Naphula/Goetia-26B-A4B-v1.7-GGUF (este) | ~26B totales, ~4B activos | 32.768 tokens (linaje) | MoE DELLA sobre gemma-4-26B-A4B | apache-2.0 | GGUF en HuggingFace |
| Naphula/Goetia-26B-A4B-v1.7 (base) | ~26B totales, ~4B activos | 32.768 tokens (linaje) | MoE DELLA sobre gemma-4-26B-A4B | no disponible | Safetensors en HuggingFace |
| Naphula/Goetia-26B-A4B-v1.4 | ~26B totales, ~4B activos | 32.768 tokens | MoE DELLA sobre gemma-4-26B-A4B | no disponible | Safetensors en HuggingFace |
| Naphula/Goetia-26B-A4B-v1.3 Absolute Heretic ARA | ~25,8B | no disponible | MoE sobre gemma | no disponible | Safetensors en HuggingFace |

Alternativas externas de la misma categoria (modelos MoE de ~20-30B totales con activacion reducida): los datos concretos de rendimiento no estan disponibles en la informacion proporcionada, por lo que no se incluye una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un merge sin ficha de evaluacion, no se han auditado sesgos.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay evaluaciones publicadas que lo cuantifiquen.
- Idioma: el modelo esta etiquetado unicamente como ingles (en), por lo que el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior.
- Contenido: las etiquetas incluyen dark writing, horror, suspense y swearing, por lo que puede generar contenido adulto o soez; requiere filtrado si se usa en productos orientados a publico general.
- Licencia: aunque el repositorio declara apache-2.0, el modelo base deriva de google/gemma-4-26B-A4B, cuya licencia (Gemma Terms of Use) puede imponer condiciones adicionales al uso comercial. Conviene verificar la licencia del modelo base antes de un despliegue en produccion.
- Dato inconsistente: el campo de parametros safetensors de la ficha de HuggingFace (14.224.235) no concuerda con la denominacion 26B del modelo; debe tratarse con cautela.
- Naturaleza de merge: al ser una fusion de modelos, no hay garantias de comportamiento uniforme ni de robustez frente a entradas adversarias.
- Fecha de publicacion: la ficha indica una fecha de creacion de 2026-10-08, posterior a la fecha actual de referencia, lo que puede indicar un error de metadatos.
- Madurez del despliegue: el repositorio registra 0 descargas en el momento de la consulta, por lo que no hay comunidad de validacion ni reportes de problemas.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/Koshkasa/Naphula_Goetia-26B-A4B-v1.7-GGUF
- Modelo base Naphula/Goetia-26B-A4B-v1.7: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.7
- Version previa Naphula/Goetia-26B-A4B-v1.4: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.4
- Ficha en LLM Explorer (Goetia 26B A4B V1.5): https://llm-explorer.com/model/Naphula%2FGoetia-26B-A4B-v1.5,6wYAB9f0FBG0Kw9LmmRSKI
- Ficha en LLM Explorer (V1.3 Absolute Heretic ARA): https://llm-explorer.com/model/Naphula%2FGoetia-26B-A4B-v1.3-Absolute-Heretic-ARA,75JAgWoH2Ayv97PPP2xglw
- Modelo en Featherless (v1.4): https://featherless.ai/models/Naphula/Goetia-26B-A4B-v1.4
- Dataset del imatrix combinado de bartowski: https://gist.github.com/bartowski1182/82ae9b520227f57d79ba04add13d0d0d
- Dataset OccultAI/illuminati_imatrix_v1: https://huggingface.co/datasets/OccultAI/illuminati_imatrix_v1
