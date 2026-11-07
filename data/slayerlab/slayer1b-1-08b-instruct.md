# SlayerLab/Slayer1B-1.08b-Instruct

## Resumen

Slayer1B 1.08b Instruct es la version ajustada por instrucciones del modelo base Slayer1B 1.08b, un modelo de lenguaje de aproximadamente 1.080 millones de parametros desarrollado por Arkadiusz Słota dentro del proyecto Fabryka AI SlayerLab. El objetivo del proyecto es construir desde cero un modelo linguistico polaco de escala ~1B, entrenado de forma iterativa version a version sobre el checkpoint de la version anterior, con todos los checkpoints y resultados publicos. La version Instruct anade una etapa de SFT (supervised fine-tuning) sobre un dataset de instrucciones, separada del preentrenamiento.

El modelo emplea una arquitectura transformer densa con 20 capas, dimension de modelo 2048, 16 cabezas de atencion y una longitud de contexto de 4096 tokens, con un tokenizer de 32k entradas. Los idiomas declarados son polaco (pl) e ingles (en), y la licencia es Apache 2.0. La relevancia actual reside en que se trata de un esfuerzo abierto por dotar al polaco de un modelo fundacional propio de tamano contenido, con transparencia sobre datos y checkpoints.

Es importante senalar que, en el momento de redactar esta ficha, el modelo esta marcado como "in preparation": los pesos no estan publicados y la model card describe un modelo planificado cuyos detalles pueden cambiar antes del lanzamiento. No hay resultados de benchmarks publicados ni descargas registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (20 capas, dim 2048, 16 cabezas) |
| Parametros totales | ~1.08B (segun nombre del modelo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos no publicados; libreria declarada: pytorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso con 20 capas, dimension de modelo de 2048 y 16 cabezas de atencion, con un tokenizer de vocabulario de 32k. El contexto maximo es de 4096 tokens. La model card indica que la arquitectura y el tokenizer son los mismos que los del modelo base Slayer1B 1.08b, del que esta version es un ajuste por instrucciones.

El entrenamiento de esta version consiste en una etapa de SFT sobre un dataset de instrucciones, realizada de forma separada tras el preentrenamiento de 1.08b y no como continuacion de este. Las respuestas de instruccion provienen de anotadores humanos o de modelos de pesos abiertos, registrandose por fila el modelo generador; segun el autor, no se emplea texto de Claude, GPT o Gemini como datos de entrenamiento. El checkpoint de partida para el SFT esta "por decidir" segun la model card. No se especifican el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto en polaco e ingles, con enfasis en el polaco como idioma principal del proyecto.
- Ajuste por instrucciones (SFT) para seguir ordenes en formato conversacional.
- Razonamiento y respuesta a preguntas de proposito general, sujeto a las limitaciones de un modelo de ~1B parametros.
- Capacidad multilingue limitada a los idiomas declarados (pl, en).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documenta una ventana de contexto extendida mas alla de los 4096 tokens.

## Casos de uso

- Generacion de texto en polaco para redaccion asistida: el modelo puede emplearse en tareas de continuacion y reformulacion de textos en polaco, aprovechando que es el idioma central del proyecto y su dataset de instrucciones.
- Asistente conversacional ligero en polaco: adecuado para prototipos de chatbot con contexto de hasta 4096 tokens, desplegable en hardware modesto por su tamano de ~1B parametros.
- Traduccion asistida pl-en y en-pl: con ambos idiomas declarados, puede servir como base para tareas de traduccion o post-edicion en entornos con requisitos de privacidad donde el modelo se ejecute en local.
- Educacion e investigacion sobre modelos fundacionales polacos: al ser un proyecto con checkpoints y datos publicos, es util para estudiar el entrenamiento iterativo de un modelo de ~1B desde cero.
- Clasificacion y extraccion de informacion en textos polacos: fine-tuning adicional sobre el modelo Instruct para tareas especificas de NLP en polaco.
- Generacion de codigo basica: aunque no se documenta soporte especifico, un modelo de ~1B puede abordar tareas sencillas de generacion de codigo, con expectativas moderadas dado el tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de benchmarks para 1.08b Instruct y que no deben asumirse, y que los resultados de las versiones 1.08/1.08b no se transfieren automaticamente a la version Instruct.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de ~1.08B parametros, en fp16 requeriria del orden de 2-2.5 GB de pesos, y en cuantizacion de 8 bits o 4 bits menos de 2 GB, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamano, un modelo de ~1B parametros es en principio ejecutable en GPU de consumo, pero no hay validacion publicada.
- Opciones de despliegue: no disponible; la libreria declarada es pytorch y no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Slayer1B 1.08b Instruct | ~1.08B | 4096 | pl, en | Apache 2.0 | Pesos no publicados (in preparation) |
| Llama-3.1-8B-Instruct | 8B | no disponible en la informacion | multilingue | licencia Llama 3.1 | Publicado |
| Slayer1B 1.08b (base) | ~1.08B | 4096 | pl, en | Apache 2.0 | En preparacion |

La comparacion con Llama-3.1-8B-Instruct solo procede a nivel de categoria de modelo instruct, dado que el tamano es muy distinto (8B frente a ~1.08B) y no hay benchmarks del modelo Slayer que permitan una comparacion de rendimiento. No se dispone de datos de benchmarks de ninguno de los modelos en la informacion proporcionada para una comparativa cuantitativa.

## Limitaciones y advertencias

- Los pesos no estan publicados: el modelo esta marcado como "in preparation" y la model card describe un modelo planificado que puede cambiar antes de su lanzamiento.
- No hay resultados de benchmarks publicados; no deben asumirse capacidades concretas.
- El modelo puede rechazar peticiones o responder de forma incompleta; no esta ajustado para seguridad en produccion.
- Los resultados de las versiones 1.08/1.08b no se transfieren automaticamente a la version Instruct.
- Riesgo de alucinacion inherente a modelos de ~1B parametros; no se documentan mitigaciones.
- Cobertura limitada a polaco e ingles; no se declaran otros idiomas.
- Contexto limitado a 4096 tokens, insuficiente para tareas que requieran documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero las licencias de los datos de entrenamiento se detallan en la data card y deben revisarse antes de un uso comercial.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.08b-Instruct
- Modelo base: https://huggingface.co/SlayerLab/Slayer1B-1.08b
- Data card del dataset de instrucciones: https://huggingface.co/datasets/SlayerLab/slayer-1.08b-instruct
- Space del proyecto (Mision Slayer 1B): https://huggingface.co/spaces/SlayerLab/Slayer1B
- Llama-3.1-8B-Instruct (referencia comparativa): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
