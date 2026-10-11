# prabanta-dev/gemma-4-E4B-it-JNS

## Resumen

`prabanta-dev/gemma-4-E4B-it-JNS` es una conversión de formato, no un modelo nuevo, del modelo de instrucciones `google/gemma-4-E4B-it` de Google. El autor ha tomado la cuantización Q4_K_M en GGUF publicada por Unsloth y la ha reescrito en JNS, el formato propietario del motor de inferencia Janas, escrito en C y orientado a equipos de consumo con o sin GPU. El repositorio incluye dos ficheros: los pesos del modelo principal (4,98 GB) y un modelo auxiliar de decodificación especulativa tipo MTP (0,10 GB).

El interés de esta ficha es acotado: no aporta pesos nuevos, entrenamiento adicional ni poda, sino un contenedor distinto para un modelo conocido. Según la model card, en un portátil con Intel Core Ultra 9 185H, GPU Arc integrada y 32 GB de RAM, Janas lee un prompt de 1.024 tokens a 122 tok/s y genera a 20 tok/s, frente a 109 y 15 tok/s de llama.cpp en la misma máquina.

El modelo base pertenece a la familia Gemma 4 y, según las fuentes públicas, ronda los 4.400 millones de parámetros con entrada multimodal de texto, imagen y audio, soporte de tool calling y una ventana de contexto declarada de 131.072 tokens en la variante E4B IT. El repositorio no declara idiomas, no tiene descargas ni «likes» y no publica benchmarks de calidad, solo medidas de rendimiento del motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; la informacion disponible indica arquitecturas densas y MoE en la familia, sin especificar cual corresponde a E4B) |
| Parametros totales | 4,4B (modelo base Gemma 4 E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens en Gemma 4 E4B IT segun models.dev; la familia Gemma 4 declara hasta 256K |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen, reescrito a JNS); el repositorio solo distribuye esa cuantizacion |
| Idiomas soportados | no disponible en la ficha del repositorio; el modelo base declara soporte multilingue en mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | JNS (formato del motor Janas), convertido desde GGUF |
| Salida maxima | 8.192 tokens (Gemma 4 E4B IT, segun models.dev) |
| Modalidades de entrada | texto, imagen y audio (Gemma 4 E4B IT, segun models.dev) |
| Tool calling | si (Gemma 4 E4B IT, segun models.dev) |
| Tamano del repositorio | 5,1 GB |

## Arquitectura y entrenamiento

No hay informacion de entrenamiento especifica de este repositorio: el autor indica explicitamente que «nothing was retrained or pruned» y que cada fichero es un GGUF cuantizado por terceros, reescrito por la herramienta `gguf2jns` en el orden de lectura que espera Janas, conservando los metadatos. Por tanto, la arquitectura, el dataset, el numero de tokens de entrenamiento y las fases de alineamiento (RLHF, DPO u otras) son los del modelo base `google/gemma-4-E4B-it`, cuyos detalles no se incluyen en la informacion proporcionada. La familia Gemma 4, segun las fuentes consultadas, combina variantes densas y de mezcla de expertos (MoE) en cinco tamanos: E2B, E4B, 12B, 26B A4B y 31B.

La unica innovacion atribuible a este paquete es de infraestructura, no de modelado. Janas es un motor de inferencia en C pensado para ordenadores convencionales, y los ficheros JNS incorporan un modelo auxiliar de borrador (`gemma-4-e4b-it-mtp.jns`) que implementa decodificacion especulativa: el borrador propone los siguientes tokens y el modelo principal los verifica, reutilizando el mismo texto con mayor velocidad. El autor reporta 32 tok/s en chat con ese asistente, frente a 20 tok/s sin el.

## Capacidades

- Generacion de texto conversacional e instruccional, heredadas del modelo base Gemma 4 E4B IT.
- Razonamiento y codigo, segun la descripcion de la familia Gemma 4 en las fuentes publicas.
- Entrada multimodal de texto, imagen y audio, segun models.dev para Gemma 4 E4B IT.
- Tool calling / function calling, declarado para Gemma 4 E4B IT.
- Modo de razonamiento (Thinking Mode), mencionado por gemma4.dev para Gemma 4 E4B.
- Capacidades multilingues (mas de 140 idiomas en el modelo base, segun la model card de Google); el repositorio JNS no declara idiomas propios.
- Decodificacion especulativa mediante el fichero MTP incluido en el repositorio.
- Inferencia en CPU sin GPU, ademas de con GPU, gracias al motor Janas.
- No se documentan en la informacion disponible capacidades de agentes multi-paso especificas mas alla del tool calling.

## Casos de uso

- Inferencia local en portatil sin GPU dedicada: el motor Janas esta disenado para CPU y el autor reporta 20 tok/s de generacion en un Intel Core Ultra 9 185H, suficiente para asistentes de escritorio y prototipado sin depender de la nube.
- Chat asistido con baja latencia: activando el modelo auxiliar MTP se alcanzan 32 tok/s en respuestas de chat, lo que hace viable una conversacion fluida en hardware de consumo.
- Despliegue en equipos con GPU integrada: el motor aprovecha la Arc iGPU del caso medido, de modo que ordenadores sin GPU dedicada pueden ejecutar el modelo sin salir del equipo.
- Asistentes personales de escritorio: al ser un modelo de 4,4B con contexto de 131.072 tokens, permite mantener historiales largos de conversacion en local y con coste marginal cero por token.
- Procesamiento de documentos con imagen o audio: la variante base acepta texto, imagen y audio, por lo que sirve para resumir o extraer informacion de capturas, PDF escaneados o notas de voz en flujos de trabajo personales.
- Automatizacion con tool calling: la variante IT soporta llamada a funciones, lo que permite conectarla a scripts locales (sistema de ficheros, APIs internas) en pipelines de automatizacion ofimatica.
- Evaluacion comparativa de motores de inferencia: el propio repositorio incluye una comparacion reproducible Janas frente a llama.cpp con `llama-bench -p 1024 -n 16`, util para decidir motor en un parque de equipos homogeneo.
- Experimentacion con formatos de pesos: `gguf2jns` y los ficheros publicados sirven como referencia para quien quiera entender o auditar el formato JNS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo reporta medidas de throughput del motor, realizadas los dias 9 y 10 de octubre de 2026 en un Intel Core Ultra 9 185H con GPU Arc integrada y 32 GB de memoria, con `llama-bench -p 1024 -n 16` y `janas-bench --prompt 1024 --gen 16` en su mejor configuracion.

| Tarea (misma maquina) | Janas | llama.cpp |
|---|---:|---:|
| Lectura de prompt de 1.024 tokens | 122 tok/s | 109 tok/s |
| Escritura (16 tokens) | 20 tok/s | 15 tok/s |
| Escritura en chat, con asistente propio | 32 tok/s | no medido |

El autor advierte de que las cifras variaran en otras maquinas y que la medida con asistente es la media de tres rondas.

## Requisitos de hardware

- VRAM estimada: el fichero de pesos Q4_K_M ocupa 4,98 GB y el modelo auxiliar 0,10 GB; gemma4.dev indica 8 GB de VRAM como minimo recomendado para Gemma 4 E4B.
- Memoria del sistema: el caso medido usa 32 GB de RAM, pero no se especifica un minimo; Janas esta pensado para funcionar tambien en CPU.
- GPU recomendadas: no hay una lista publicada. La unica configuracion medida es una GPU Arc integrada en un Intel Core Ultra 9 185H. gemma4.dev senala que el modelo base corre en cualquier GPU de consumo moderna.
- Compatibilidad con GPU de consumo: si, segun gemma4.dev el modelo base requiere unos 8 GB de VRAM, por lo que encaja en tarjetas de gama media y alta recientes; no se aportan pruebas especificas para el fichero JNS.
- Opciones de despliegue: Janas (`janas-get`, `janas-chat`, compilacion desde fuentes en `prabanta-dev/janas`) es el unico motor que lee los ficheros JNS. Para llama.cpp, vLLM, TGI, Ollama u otros habria que usar el GGUF original de Unsloth, no estos ficheros.
- Latencia y throughput: 122 tok/s de lectura de prompt y 20 tok/s de generacion sin asistente; 32 tok/s de generacion en chat con el modelo MTP, en el Intel Core Ultra 9 185H del caso medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| prabanta-dev/gemma-4-E4B-it-JNS | 4,4B (base) | 131.072 tokens (base) | JNS (Q4_K_M) | Janas | Apache 2.0 | Repositorio con 0 descargas y 0 likes; sin benchmarks de calidad publicados |
| google/gemma-4-E4B-it | 4,4B | 131.072 tokens | no disponible | no disponible | Apache 2.0 | Modelo base oficial de Google; pesos originales |
| unsloth/gemma-4-E4B-it-GGUF | 4,4B | 131.072 tokens (base) | GGUF (Q4_K_M, MTP) | llama.cpp y compatibles | Apache 2.0 | Origen de la conversion; compatible con el ecosistema GGUF |
| Gemma 4 E2B | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | Variante menor de la misma familia, segun ai.google.dev |

No se dispone de datos de rendimiento comparables entre estas variantes mas alla del throughput de la tabla anterior.

## Limitaciones y advertencias

- No es un modelo nuevo: es una conversion de formato de una cuantizacion de terceros, sin reentrenamiento ni poda, por lo que hereda integramente los sesgos y limitaciones del modelo base Gemma 4 E4B IT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no ha pasado un proceso de validacion comunitaria.
- No se publican benchmarks de calidad; las unicas metricas son de velocidad del motor en una maquina concreta.
- El formato JNS solo lo lee Janas. No es utilizable directamente con llama.cpp, vLLM, TGI, Ollama ni otras herramientas del ecosistema, que requeririan el GGUF original.
- La model card advierte de que los ficheros se leen unicamente con Janas y que las cifras de rendimiento variaran en otras maquinas.
- La licencia Apache 2.0 se hereda del modelo base; el autor senala que el repositorio original de Google no incluye fichero LICENSE y que la licencia aqui incluida es el texto publicado por la Apache Software Foundation.
- El motor Janas esta licenciado bajo GPL-3.0-or-later, pero esa licencia no se aplica a los ficheros del modelo segun el propio autor.
- Riesgo de alucinacion: inherente a un modelo de generacion de 4,4B con modo de razonamiento; no se aportan tasas de error ni evaluaciones de fidelidad.
- Idiomas: el repositorio no declara idiomas soportados; el soporte multilingue de mas de 140 idiomas corresponde al modelo base y no se ha verificado en esta conversion.
- No se documentan sesgos especificos en la informacion disponible, pero tampoco se incluye ninguna evaluacion de sesgo.
- Las fechas del repositorio (creacion y actualizacion el 11 de octubre de 2026) son las que figuran en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prabanta-dev/gemma-4-E4B-it-JNS
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Cuantizacion GGUF de origen: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Motor Janas: https://github.com/prabanta-dev/janas
- README de Janas: https://github.com/prabanta-dev/janas#readme
- Descargas de Janas: https://github.com/prabanta-dev/janas/releases/latest/download/janas-linux-x86_64.tar.gz
- gemma4.dev, Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
- gemma4.dev, referencia de modelos: https://gemma4.dev/docs/models
- Google DeepMind, Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- models.dev, Gemma 4 E4B IT: https://models.dev/models/google/gemma-4-E4B-it/
