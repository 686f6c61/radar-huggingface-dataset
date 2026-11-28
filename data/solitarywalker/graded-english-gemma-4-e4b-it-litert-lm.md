# solitarywalker/graded-english-gemma-4-E4B-it-litert-lm

## Resumen

graded-english-gemma-4-E4B-it es un ajuste fino (fine-tuning) del modelo google/gemma-4-E4B-it, desarrollado por el usuario solitarywalker, orientado a la conversación en inglés sencillo para estudiantes. El objetivo es que el modelo responda empleando únicamente vocabulario controlado —las palabras de NGSL 1.2, los niveles A1 a B1 del CEFR-J Wordlist y sustantivos— sin necesidad de recibir instrucciones explícitas en el prompt de sistema. Resuelve el problema de que un modelo generalista tiende a usar léxico avanzado que un principiante no comprende.

El modelo conserva la arquitectura del Gemma 4 E4B-it original (un transformer multimodal con unos 8.000 millones de parámetros totales, según los pesos en safetensors) y se distribuye en tres formatos: LiteRT-LM para dispositivos Android, GGUF Q4_0 para llama.cpp y safetensors bf16 para Transformers. El repositorio ocupa 25,4 GB y la licencia es Apache 2.0.

Su relevancia radica en el enfoque de destilación: se generaron conversaciones con un modelo mayor (Gemma 4 26B-A4B-it) bajo instrucciones de inglés simple, se filtraron palabra por palabra y se entrenó al modelo pequeño solo con las respuestas del profesor, sin el prompt de sistema. El resultado es un modelo que adopta el registro sencillo de forma implícita, lo que simplifica su integración en aplicaciones de aprendizaje de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B-it); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LiteRT-LM mixta 4 bits (gemma4_mixed48_hr, canal a canal con rotacion Hadamard, embeddings por capa a 8 bits, activaciones fp16); GGUF Q4_0; bf16 sin cuantizar |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q4_0), .litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un transformer multimodal que acepta texto, imagenes y audio, aunque el ajuste fino se realizo exclusivamente sobre texto. El entrenamiento consistio en un LoRA con Unsloth sobre el modelo base cargado en 4 bits, durante 2 epocas (144 pasos, aproximadamente 4 minutos en una RTX 5080), con una perdida de entrenamiento de 0,73 (0,50 en el ultimo paso). Solo se entrenaron las respuestas del profesor, usando los mensajes previos como entrada y sin prompt de sistema. Posteriormente, el LoRA se fusiono en los pesos bf16 sin cuantizar del modelo base.

Los datos de entrenamiento proceden del dataset solitarywalker/graded-english-distill-conversations: 300 conversaciones generadas por Gemma 4 26B-A4B-it con instrucciones de ingles simple, sobre 20 temas para cada uno de los 14 ambitos del CEFR Threshold Level y el dominio ocupacional. Cada conversacion se recorto antes de la primera respuesta que contuviera una palabra fuera del rango, quedando 288 conversaciones y 5.060 respuestas. La innovacion principal es la destilacion de un registro linguistico restringido: el filtrado palabra por palabra y la eliminacion del prompt de sistema hacen que el modelo pequeño interiorice el vocabulario controlado en lugar de depender de instrucciones en tiempo de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles sencillo, con vocabulario restringido a NGSL 1.2, niveles A1-B1 del CEFR-J y sustantivos.
- Conversacion multi-turno orientada a estudiantes de ingles, con respuestas mas breves que el modelo original (28,4 a 49,4 palabras por respuesta segun el conjunto evaluado).
- Respuesta en registro sencillo sin necesidad de system prompt que lo indique.
- Capacidades multimodales heredadas del modelo base (imagenes y audio), aunque no fueron evaluadas ni entrenadas en este ajuste.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles.
- Modo thinking, vision o audio: el modelo base es multimodal, pero este ajuste no fue probado en esas modalidades.

## Casos de uso

- Aplicacion de chat para estudiantes de ingles: el modelo mantiene conversaciones multi-turno usando solo vocabulario A1-B1, lo que permite a principiantes seguir la conversacion sin diccionario. Se desplegaria en un telefono Android mediante el archivo .litertlm (4,2 GB) o en escritorio con el GGUF Q4_0.
- Practica de lectura graduada: integrado en una app de lectores graduados, el modelo puede generar dialogos o explicaciones adaptadas al nivel del alumno, ya que sus respuestas se mantienen dentro del rango lexico objetivo en el 91-95 % de los casos.
- Tutoria de vocabulario: al responder con palabras conocidas, el modelo puede usarse para definir o contextualizar terminos nuevos sin introducir lexico fuera de nivel, reduciendo la carga cognitiva del estudiante.
- Despliegue en dispositivos de bajos recursos: la version LiteRT-LM (4,2 GB) carga en 19,3 segundos en un ASUS Zenfone 9 y permite inferencia local sin conexion, adecuada para apps educativas offline.
- Generacion de material didactico controlado: el modelo puede producir dialogos de ejemplo para hojas de trabajo o audiolibros, con la ventaja de que el vocabulario ya esta restringido por entrenamiento y no requiere post-procesado manual extenso.
- Prototipado rapido con llama.cpp: el GGUF Q4_0 (5,2 GB) permite levantar un servidor con `llama-server --jinja` en una GPU de consumo para probar flujos conversacionales antes de portar a movil.
- Evaluacion de tecnicas de destilacion: sirve como caso de estudio reproducible (el repositorio graded-english-distill incluye el pipeline completo) para investigar como transferir restricciones de estilo o vocabulario de un modelo grande a uno pequeño.

## Benchmarks y rendimiento

El autor publica una evaluacion propia centrada en la proporcion de palabras fuera del rango lexico, comparando el modelo original y el entrenado, ambos como Q4_0 GGUF en llama.cpp build 11669. Cada conjunto consta de 30 conversaciones de 20 respuestas. El conjunto A usa temas de los mismos bloques CEFR que el entrenamiento pero no vistos; el conjunto B usa temas fuera de los bloques CEFR, tres de cada una de las 10 clases principales de la Dewey Decimal Classification.

| Metrica | A, original | A, entrenado | B, original | B, entrenado |
|---|---|---|---|---|
| Respuestas con palabra fuera de rango | 23,7 % | 5,3 % | 34,7 % | 9,0 % |
| Palabras fuera de rango por 100 palabras | 1,93 | 0,26 | 2,99 | 0,27 |
| Palabras por respuesta | 47,8 | 28,4 | 69,6 | 49,4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,2 GB con GGUF Q4_0; unos 4,2 GB con LiteRT-LM cuantizado; unos 16 GB con safetensors bf16.
- GPU recomendadas: RTX 5080 (usada por el autor para el entrenamiento LoRA); para inferencia, cualquier GPU con al menos 6-8 GB de VRAM para Q4_0. Para bf16 se recomienda una GPU de 24 GB o superior (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM usando Q4_0 o LiteRT-LM. El autor valido el .litertlm en un ASUS Zenfone 9 (GPU integrada de movil).
- Opciones de despliegue: llama.cpp (`llama-server -m ... --jinja`), LiteRT-LM (Android y otros dispositivos), Transformers (bf16). vLLM, TGI y Ollama no estan mencionados en la informacion disponible.
- Latencia y throughput: no se proporcionan datos de throughput. El unico dato de latencia es la carga inicial del .litertlm en el Zenfone 9: 19,3 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| graded-english-gemma-4-E4B-it | ~8B | no disponible | Ingles graduado (A1-B1) por destilacion | Apache 2.0 | Hugging Face (safetensors, GGUF, litertlm) |
| google/gemma-4-E4B-it (base) | ~8B | no disponible | Modelo generalista multimodal | Gemma 4 license (Apache 2.0 segun el autor) | Hugging Face |
| Gemma 4 26B-A4B-it (profesor) | no disponible | no disponible | Modelo mayor usado para generar datos | no disponible | no disponible |

No se dispone de datos de benchmarks estandar ni de otros modelos de ingles graduado comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entre el 5 % y el 9 % de las respuestas siguen conteniendo palabras fuera del rango, principalmente nombres de cosas del propio tema (chop, fluffy, erupt, hibernation).
- El entrenamiento y las mediciones se hicieron solo con texto; las capacidades de imagen y audio del modelo base no se probaron.
- Solo se enseno vocabulario: la longitud y el formato de las respuestas quedaron a criterio del modelo profesor, por lo que pueden aparecer listas y texto en negrita con estilo de asistente.
- Los temas de entrenamiento no nombran paises, lugares ni personas, lo que puede limitar la naturalidad en conversaciones que los requieran.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada, pero persiste como en cualquier modelo de lenguaje.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 tiene su propia licencia que debe respetarse; las listas NGSL (CC BY-SA 4.0) y CEFR-J tienen licencias propias y no estan incluidas en el modelo.
- El modelo no esta afiliado ni respaldado por los autores de NGSL ni del CEFR-J Wordlist.
- Solo soporta ingles; no se debe esperar calidad en otros idiomas.

## Enlaces

- Hugging Face: https://huggingface.co/solitarywalker/graded-english-gemma-4-E4B-it-litert-lm
- Dataset de conversaciones: https://huggingface.co/datasets/solitarywalker/graded-english-distill-conversations
- Repositorio de destilacion y entrenamiento: https://github.com/solitarywalker/graded-english-distill
- Repositorio de vocabulario graduado: https://github.com/solitarywalker/graded-english-vocabulary
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- NGSL 1.2: https://www.newgeneralservicelist.com/
