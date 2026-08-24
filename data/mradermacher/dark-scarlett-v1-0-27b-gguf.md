# mradermacher/Dark-Scarlett-v1.0-27B-GGUF

## Resumen

Dark-Scarlett-v1.0-27B-GGUF es una colección de cuantizaciones GGUF del modelo Dark-Scarlett-v1.0-27B, desarrollado por ReadyArt y cuantizado por mradermacher. Se trata de un modelo de lenguaje basado en Qwen 3.6 (según las etiquetas del repositorio), orientado a roleplay, conversación y generación de texto instructivo, con un enfoque explícito en contenido adulto y no alineado. El modelo está pensado para ejecución local en hardware de consumo o profesional, y su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

Con 27 320 millones de parámetros, el modelo se distribuye en múltiples niveles de cuantización (desde Q2_K hasta Q8_0) que ocupan entre 11 y 29 GB, lo que permite adaptarse a diferentes capacidades de VRAM. Aunque no se publican detalles sobre la longitud de contexto ni el proceso de entrenamiento, su especialización en roleplay y su carácter "unaligned" lo convierten en una opción relevante para aplicaciones de ficción interactiva y simulación de personajes, siempre que se asuman los riesgos asociados al contenido explícito.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen 3.6 (arquitectura transformer, no confirmada oficialmente) |
| Parametros totales | 27 320 697 856 (27,32 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, además de mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni el proceso de entrenamiento del modelo base. Las etiquetas indican que se basa en Qwen 3.6, lo que sugiere una arquitectura transformer estándar, pero no se confirma si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se publican datos sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de alineación como RLHF o DPO. El modelo se presenta como "unaligned", lo que implica que no se aplicaron ajustes de seguridad o moderación de contenido, y su especialización en roleplay y contenido adulto sugiere un fine-tuning dirigido a esos dominios.

La cuantización GGUF realizada por mradermacher conserva las capacidades del modelo original, incluyendo archivos mmproj que podrían indicar soporte multimodal (proyección de visión), aunque no se especifica su funcionalidad exacta.

## Capacidades

- Generación de texto conversacional y narrativo, especialmente orientado a roleplay y simulación de personajes.
- Instrucciones y respuestas en formato instruct, útil para tareas de diálogo guiado.
- Contenido explícito y adulto sin filtros de moderación, dado su carácter "unaligned".
- Posible soporte multimodal (según los archivos mmproj incluidos), aunque no se detalla su alcance.
- Capacidad de mantener conversaciones multi-turno, aunque la longitud de contexto no está documentada.
- Especialización en inglés; no se garantiza rendimiento en otros idiomas.

## Casos de uso

- Roleplay interactivo: el modelo puede actuar como personaje de ficción en juegos de texto o chats, manteniendo coherencia narrativa y respondiendo a las acciones del usuario. Su fine-tuning específico lo hace adecuado para escenarios de fantasía, ciencia ficción o drama.
- Escritura creativa asistida: generación de diálogos, descripciones y tramas para novelas, guiones o fanfiction, con un tono maduro y sin restricciones de contenido.
- Simulación de personajes para juegos de rol de mesa: el modelo puede interpretar NPCs (personajes no jugadores) con personalidades definidas, facilitando la labor del director de juego.
- Chatbots de entretenimiento para adultos: aplicaciones de conversación íntima o erótica, donde el modelo responde sin censura previa.
- Generación de contenido literario explícito: redacción de relatos o escenas con contenido sexual explícito, útil para autores que trabajan en ese género.
- Prototipado de asistentes conversacionales sin alineación: investigación sobre comportamientos de modelos no moderados, siempre que se cumplan las políticas de uso y se aísle el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, se necesitan aproximadamente entre 12 GB (Q2_K) y 30 GB (Q8_0) de VRAM, más overhead de contexto y caché. Por ejemplo, Q4_K_M (16,9 GB) requeriría al menos 20 GB de VRAM libre.
- GPUs recomendadas: para cuantizaciones Q4 y superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Para Q6_K o Q8_0, se recomienda una A100 (40/80 GB) o H100. En tarjetas con menos VRAM (8-12 GB), solo cabrían las cuantizaciones Q2_K o Q3_K_S con contexto reducido.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones Q2_K a Q5_K_M pueden ejecutarse en GPUs de gama alta para consumidores (RTX 3080/3090/4090) con suficiente VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptadores GGUF) o TGI. Los archivos GGUF son compatibles con la mayoría de motores de inferencia local.
- Latencia y throughput: no se han publicado mediciones específicas. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generación de 30-50 tokens por segundo, dependiendo de la implementación y el contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de roleplay o conversacionales. Aunque existen alternativas como MythoMax, Noromaid o modelos basados en Llama 3 fine-tuneados para roleplay, no se conocen datos objetivos de rendimiento de Dark-Scarlett-v1.0-27B frente a ellos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Contenido explícito y NSFW: el modelo está diseñado para generar contenido adulto sin moderación. Su uso en entornos públicos o profesionales puede violar políticas de plataforma o leyes locales.
- Riesgo de alucinación: al ser un modelo no alineado, puede producir afirmaciones falsas o incoherentes con mayor frecuencia que modelos alineados, especialmente en contextos no relacionados con su dominio de especialización.
- Sesgos potenciales: al entrenarse con datos de roleplay y contenido adulto, puede reflejar estereotipos de género, raza o sexualidad presentes en esos corpus.
- Limitación de idioma: solo se garantiza un rendimiento adecuado en inglés; otros idiomas pueden generar respuestas de baja calidad.
- Longitud de contexto desconocida: no se documenta el tamaño de la ventana de contexto, lo que dificulta planificar conversaciones largas o procesamiento de documentos extensos.
- Restricciones de licencia: aunque la licencia Apache 2.0 permite uso comercial, el contenido generado puede estar sujeto a regulaciones sobre material explícito. El usuario es responsable del cumplimiento legal.
- Sin soporte oficial: el modelo es una cuantización comunitaria; no hay garantías de mantenimiento, corrección de errores o actualizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-27B-GGUF
- Modelo base (safetensors): https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-27B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-27B-i1-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
