# Jfallenr/Gemmasutra-Mini-2B-v1-GGUF

## Resumen

Gemmasutra Mini 2B v1 es un ajuste fino (finetune) del modelo Gemma 2 de 2 000 millones de parametros, orientado especificamente a juegos de rol conversacional (roleplay, RP) y a la generacion de narrativa interactiva. El modelo original fue desarrollado por TheDrummer y esta version en formato GGUF ha sido publicada por el usuario Jfallenr. Con 2 614 341 888 parametros totales, se posiciona como una alternativa ligera para ejecucion en hardware modesto: portatiles de gama media, telefonos moviles mediante la aplicacion Layla o incluso una Raspberry Pi.

La propuesta del autor es clara: ofrecer una experiencia de roleplay satisfactoria en un modelo por debajo de los 7B, un umbral que tradicionalmente se consideraba minimo para este tipo de tareas. El modelo se distribuye sin censura ni alineamiento (uncensored y unaligned), lo que lo hace adecuado para narrativa adulta, pero tambien implica riesgos importantes de contenido inapropiado y de sesgos sin filtrar.

El repositorio ocupa 48,6 GB e incluye multiples cuantizaciones GGUF. La model card menciona compatibilidad con KoboldCpp 1.72 y con Layla (iOS y Android), y recomienda el uso de la plantilla de instruccion de Gemma modificada para admitir el rol de sistema. No se dispone de informacion sobre la longitud de contexto oficial, los idiomas soportados ni los datos de entrenamiento utilizados en el ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 2 2B; detalles del finetune no disponibles) |
| Parametros totales | 2 614 341 888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card muestra ejemplos con 4K de contexto) |
| Tipos de cuantizacion | GGUF (multiples niveles; niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados en la informacion disponible) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Gemma 2 de 2B, una arquitectura transformer decoder-only con atencion por ventanas alternada y atencion global, disenada por Google DeepMind para inferencia eficiente en hardware de consumo. Sobre esa base, TheDrummer aplico un ajuste fino orientado a roleplay, presumiblemente mediante datos conversacionales y de narrativa, aunque la model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor indica explicitamente que el modelo esta "uncensored and unaligned", lo que sugiere la ausencia de etapas de alineamiento de seguridad tras el finetune.

La version publicada por Jfallenr es una conversion a GGUF del modelo original, pensada para su uso con motores de inferencia locales como KoboldCpp o llama.cpp. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; el interes del modelo reside en su tamano reducido y en su especializacion en RP, no en novedades arquitectonicas.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a roleplay y narrativa interactiva.
- Mantenimiento de personajes y escenarios a lo largo de conversaciones (la model card muestra ejemplos de personajes grupales y de mecanicas como un "medidor de perdon").
- Generacion de contenido para adultos sin censura (NSFW), segun declara el autor.
- Soporte de la plantilla de instruccion de Gemma, con modificacion recomendada para incluir el rol de sistema (`<start_of_turn>system`).
- Compatibilidad con chat completion en motores que lo soporten.
- No se recomienda su uso para matematicas; el autor lo desaconseja explicitamente.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Roleplay conversacional local: el modelo puede sostener conversaciones multi-turno con personajes consistentes en un portatil de gama media o un movil, gracias a su tamano de 2B parametros y a su distribucion en GGUF.
- Narrativa interactiva y ficcion ramificada: sirve para generar tramas, dialogos y descripciones en tiempo real dentro de aplicaciones de escritura asistida o videojuegos narrativos, donde la latencia baja importa mas que la profundidad de razonamiento.
- Prototipado rapido de chatbots de personaje: desarrolladores que necesiten validar una idea de producto conversacional pueden desplegar el modelo en local sin coste de API y sin depender de servicios en la nube.
- Educacion y experimentacion en IA open source: util para estudiar el comportamiento de modelos pequenos sin alineamiento y comparar tecnicas de cuantizacion en entornos con recursos limitados.
- Despliegue en dispositivos edge: su tamano permite ejecutarlo en Raspberry Pi o telefonos mediante Layla, habilitando asistentes de ficcion offline sin conexion.
- Generacion de contenido creativo para juegos de mesa o campanas de rol: el modelo puede actuar como master de juego improvisado, generando descripciones y respuestas de PNJ sobre la marcha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 2,6B parametros en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 1,5 a 2,5 GB, y las de 8 bits en torno a 3 GB, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no disponible. El modelo esta pensado para ejecucion en CPU y en hardware de consumo; la model card menciona portatiles modestos, moviles y Raspberry Pi.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 4 GB o mas de VRAM, aunque no se confirma con datos oficiales.
- Opciones de despliegue: KoboldCpp 1.72, llama.cpp (formato GGUF), Layla (iOS y Android). Otros motores compatibles con GGUF no se mencionan explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemmasutra Mini 2B v1 (este) | 2,6B | no disponible | Roleplay sin censura | other | GGUF en HF |
| Gemma 2 2B (base) | 2,6B | no disponible en esta ficha | Uso general | Gemma Terms | Multiples formatos |
| Modelos RP de 7B-8B (genericos) | 7B-8B | variable | Roleplay | variable | Multiples |

No se dispone de datos de rendimiento comparativo para establecer una comparativa cuantitativa con alternativas. La comparacion se limita a parametros, enfoque y disponibilidad.

## Limitaciones y advertencias

- Modelo sin censura ni alineamiento: puede generar contenido sexual explicito, violento u ofensivo sin filtros; no es adecuado para entornos infantiles ni para produccion orientada al publico general sin moderacion adicional.
- Riesgo elevado de alucinacion y de incoherencia en tareas de razonamiento, matematicas o conocimiento factual; el propio autor desaconseja su uso para matematicas.
- Sesgos conocidos: no documentados, pero al carecer de alineamiento es probable que reproduzca sesgos presentes en los datos de entrenamiento.
- Longitud de contexto no confirmada oficialmente; los ejemplos de la model card usan 4K, por lo que ventanas mayores pueden degradar la coherencia.
- Idiomas soportados no documentados; el rendimiento fuera del ingles es incierto.
- Licencia "other" sin terminos detallados: es imprescindible revisar las condiciones de la licencia de Gemma y del finetune antes de cualquier uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- Fecha de creacion registrada como 2026-11-24, lo que puede indicar un error en los metadatos o una publicacion futura; conviene verificar la integridad del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Jfallenr/Gemmasutra-Mini-2B-v1-GGUF
- Modelo original: https://huggingface.co/TheDrummer/Gemmasutra-Mini-2B-v1
- GGUF del autor original: https://huggingface.co/TheDrummer/Gemmasutra-Mini-2B-v1-GGUF
- Cuantizaciones iMatrix: https://huggingface.co/MarsupialAI/Gemmasutra-Mini-2B-v1_iMatrix_GGUF
- KoboldCpp 1.72: https://github.com/LostRuins/koboldcpp/releases/tag/v1.72
- Layla (iOS / Android): https://www.layla-network.ai/
- Discord del autor: https://discord.gg/Nbv9pQ88Xb
