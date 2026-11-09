# DavidAU/MN-WORDSTORM-pt4-RCM-Cliffhanger-18.5B-Instruct-GGUF

## Resumen

MN-WORDSTORM-pt4-RCM-Cliffhanger-18.5B-Instruct es un modelo de lenguaje especializado en escritura creativa de ficcion y roleplay, publicado por el usuario DavidAU en Hugging Face. Se trata de un "super merge" construido con mergekit sobre la familia Mistral Nemo, cuyo nucleo combina tres modelos fine-tuneados de 12B (MN-Rocinante-12B-v1.1, MN-12B-Celeste-V1.9 y MN-Magnum-v2.5-12B-kto), cada uno de ellos fusionado previamente con Mistral-Nemo-Instruct-2407 para dar lugar a tres variantes de 18.5B que posteriormente se integran en un unico modelo final.

El resultado es un modelo denso de 18.518.522.880 parametros (18.5B) que hereda la ventana de contexto de 128K tokens del core de Mistral Nemo y esta orientado explicitamente a la generacion de narrativa: tramas, subtramas, continuacion de escenas, dialogos de personajes, horror grafico, humor negro y roleplay sin censura. El autor lo presenta como la cuarta entrega de una serie de diez versiones planificadas de la familia WORDSTORM.

Su relevancia actual reside en dos factores: por un lado, demuestra como las tecnicas de model merging permiten combinar las fortalezas de varios fine-tunes especializados en escritura sin reentrenar desde cero; por otro, ofrece una alternativa de 18.5B con contexto largo y licencia Apache 2.0 para tareas creativas donde los modelos alineados de forma agresiva suelen rechazar contenido adulto o violento. La distribucion principal del repositorio es en formato GGUF, pensada para inferencia local con llama.cpp y derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Mistral Nemo) |
| Parametros totales | 18.518.522.880 (18.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K+ tokens (heredada de Mistral Nemo) |
| Tipos de cuantizacion | GGUF (multiples niveles de cuantizacion habituales en llama.cpp; el autor no detalla la lista exacta); pesos base en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); bfloat16 en el modelo base del que deriva |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 18.5B parametros construido mediante mergekit, no mediante entrenamiento desde cero. La receta parte de tres fusiones independientes: cada una combina un fine-tune de 12B (Rocinante-12B-v1.1, Celeste-V1.9 o Magnum-v2.5-12B-kto) con Mistral-Nemo-Instruct-2407 para producir un modelo intermedio de 18.5B; esos tres modelos intermedios se fusionan despues en el modelo final. El autor denomina a esta composicion "RCM" y no publica los hiperparametros exactos del merge (metodo de fusion, pesos por capa ni densidades).

No se dispone de informacion sobre el volumen de tokens de entrenamiento de los fine-tunes originales, la composicion de sus datasets ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a los autores de los modelos base (nothingiisreal, anthracite-org, TheDrummer y Mistral AI). El autor afirma que el merge es estable, con una perplejidad muy proxima a la del Mistral Nemo original, y que responde correctamente a todos los parametros y ajustes de muestreo habituales. El modelo se distribuye con plantillas de prompt compatibles con Alpaca, ChatML y Mistral Instruct, y el autor advierte que la eleccion de plantilla afecta de forma notable al seguimiento de instrucciones y a la calidad de la salida.

## Capacidades

- Generacion de ficcion en todos los generos: ciencia ficcion, romance, terror, humor negro y drama, con enfasis declarado en prosa vivida y detallada.
- Generacion y continuacion de escenas, tramas y subtramas, incluyendo giros argumentales y cliffhangers.
- Roleplay multi-turno con construccion de personaje, voz propia, pensamientos internos y arcos emocionales.
- Escritura sin censura: el autor indica explicitamente que el modelo no rechaza contenido NSFW, violencia, lenguaje soez ni terror grafico.
- Seguimiento de instrucciones para tareas de escritura (formato, longitud, tono, perspectiva).
- Contexto largo de 128K+ tokens, util para mantener coherencia en novelas, sagas o sesiones de roleplay extensas.
- Soporte de plantillas Alpaca, ChatML y Mistral Instruct.
- Capacidades multilingues: solo ingles declarado; no se documenta rendimiento en otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Escritura de novelas y relatos largos: la ventana de 128K tokens permite mantener en contexto capitulos completos, fichas de personaje y notas de continuidad, reduciendo las incoherencias argumentales en obras extensas.
- Roleplay narrativo persistente: el modelo esta disenado para sesiones multi-turno con personajes consistentes, y su sesgo hacia situaciones de tension y cliffhangers encaja con campanas de rol de terror o suspense.
- Generacion de tramas y subtramas para guionistas: puede producir esquemas argumentales, giros y lineas secundarias a partir de una premisa breve, lo que acelera la fase de ideacion en estudios de contenido.
- Continuacion de escenas en pipelines editoriales: integrado via llama.cpp u Ollama, sirve para autocompletar borradores o generar variantes de una misma escena que el editor humano selecciona.
- Contenido de ficcion para videojuegos y visual novels: generacion de dialogos ramificados y descripciones de escena en herramientas de autoria, con la ventaja de una licencia Apache 2.0 que permite uso comercial.
- Literatura de genero sin restricciones: para editoriales o plataformas de ficcion adulta, terror o horror grafico, donde los modelos alineados de forma estricta rechazan el contenido y este modelo no lo hace.
- Prototipado de asistentes creativos locales: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo sin GPU de datacenter, lo que facilita pruebas de concepto de herramientas de escritura asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta referencias cualitativas a la posicion de los modelos base en el leaderboard UGI (DontPlanToEnd), donde cita a Celeste-V1.9 y Magnum-v2.5 como primeros en sus categorias y a Mistral-Nemo-Instruct-2407 como cuarto en escritura entre modelos de 8B a 20B, pero no se incluyen puntuaciones numericas del modelo fusionado.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 37 GB solo para pesos, lo que exige GPU de 40 GB o mas (A100 40GB, A100 80GB, H100). En cuantizaciones GGUF de 8 bits, en torno a 20 GB; en Q4_K_M, aproximadamente 11-12 GB; en Q3 o Q2, por debajo de 10 GB con perdida notable de calidad.
- GPU recomendadas: A100 80GB o H100 para precision completa; RTX 4090 (24 GB) para cuantizaciones de 8 bits o Q6; RTX 3090, RTX 4080 y GPUs de 16 GB para Q4.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y tarjetas de 16 GB con cuantizaciones Q4 o inferiores; en GPUs de 8 GB solo con cuantizaciones muy agresivas y contexto recortado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo TGI. Para vLLM seria necesario convertir los pesos a safetensors, no incluidos en el repo.
- Latencia y throughput: no disponibles. Como referencia estructural, un modelo denso de 18.5B en una RTX 4090 con Q4 suele quedar en el orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MN-WORDSTORM-pt4-RCM-Cliffhanger-18.5B | 18.5B | 128K+ | Ficcion y roleplay sin censura, GGUF | Apache 2.0 | Hugging Face (GGUF) |
| Mistral-Nemo-Instruct-2407 | 12B | 128K | Instrucciones generales, alineado | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| MN-12B-Celeste-V1.9 | 12B | 128K (base Nemo) | Escritura creativa y roleplay | Apache 2.0 | Hugging Face |
| Magnum-v2.5-12B-kto | 12B | 128K (base Nemo) | Escritura creativa, KTO | Apache 2.0 | Hugging Face |

La comparacion directa de rendimiento con estas alternativas no es posible con los datos disponibles: no hay benchmarks publicados del modelo fusionado y las referencias del autor al leaderboard UGI son cualitativas. La diferencia principal frente a los fine-tunes de 12B es el mayor numero de parametros (18.5B) y la combinacion de tres estilos de escritura en un unico modelo; frente a Mistral-Nemo-Instruct, la diferencia es el sesgo deliberado hacia ficcion adulta y ausencia de rechazos.

## Limitaciones y advertencias

- Contenido explicito: el modelo genera de forma deliberada NSFW, violencia grafica, terror perturbador y lenguaje soez; no es adecuado para aplicaciones orientadas a publico general sin filtros adicionales.
- Alucinacion: como todo modelo generativo de ficcion, inventa hechos sin aviso; no debe usarse como fuente de informacion factual.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Sesgos: no hay evaluacion publicada de sesgos; los modelos base de rol y ficcion suelen reproducir estereotipos de genero, raza y violencia presentes en sus datos de entrenamiento.
- Estabilidad del merge: el autor afirma una perplejidad proxima a Mistral Nemo, pero no aporta mediciones; los merges complejos pueden degradar el seguimiento de instrucciones en prompts largos o no narrativos.
- Plantilla de prompt: la eleccion entre Alpaca, ChatML y Mistral Instruct altera el comportamiento; usar una plantilla distinta a la esperada puede degradar la calidad de forma significativa.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir la normativa aplicable en su jurisdiccion sobre material adulto o violento.
- Mantenimiento: es un modelo de un autor individual, sin garantias de soporte, con versiones numeradas (parte 4 de 10) que pueden quedar obsoletas rapidamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/MN-WORDSTORM-pt4-RCM-Cliffhanger-18.5B-Instruct-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Leaderboard UGI (DontPlanToEnd): https://huggingface.co/spaces/DontPlanToEnd/UGI-Leaderboard
- Modelo base Mistral Nemo Instruct: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- MN-12B-Celeste-V1.9: https://huggingface.co/nothingiisreal/MN-12B-Celeste-V1.9
- Magnum-v2.5-12B-kto: https://huggingface.co/anthracite-org/magnum-v2.5-12b-kto
- Rocinante-12B-v1.1: https://huggingface.co/TheDrummer/Rocinante-12B-v1.1
- mergekit: https://github.com/arcee-ai/mergekit
