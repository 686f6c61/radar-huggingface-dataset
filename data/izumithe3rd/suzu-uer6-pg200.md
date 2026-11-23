# IzumiThe3rd/Suzu-UER6-PG200

## Resumen

Suzu-UER6-PG200 es un modelo de lenguaje de muy pequeno tamano (47,26 millones de parametros) desarrollado por IzumiThe3rd y especializado en una tarea muy concreta: la reordenacion de candidatos en sistemas de entrada (input methods) de chino simplificado basados en pinyin, como Rime. Dado un contexto previo y un conjunto de palabras candidatas que comparten el mismo codigo pinyin, el modelo asigna una puntuacion a cada candidato para que el motor de entrada coloque primero la opcion mas probable. No es un modelo generativo de proposito general, sino un reranker de candidatos.

El modelo parte del GPT-2 destilado chino de 6 capas de UER (`uer/gpt2-distil-chinese-cluecorpussmall`), al que se le recorta el vocabulario original de 21128 tokens BERT a 5142 caracteres, se le reordena la matriz de embeddings y se le somete a un preentrenamiento continuado sobre texto coloquial de foros (MNBVC: arbol de Pekin, Tianya, Zhihu) y a un ajuste fino supervisado con 75000 tareas de reordenacion. El nombre PG200 codifica la receta: preentrenamiento continuado (P) seguido de ajuste fino con el vocabulario original (G) durante 200 pasos.

Su relevancia practica radica en que es el modelo por defecto en las instalaciones de macOS, Windows y Android del proyecto Suzu, y en que demuestra que un modelo de menos de 50M de parametros, cuantizado a Q8_0 en 52,8 MB, puede mejorar de forma medible la calidad de un teclado chino con latencias P99 por debajo de 25 ms en un movil de gama alta (Snapdragon 8 Gen 2). Es, por tanto, un caso de estudio de despliegue edge de bajo coste mas que un modelo de IA generativa al uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), 6 capas, 768 dimensiones |
| Parametros totales | 47.264.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 30 caracteres de contexto previo mas el candidato (ventana de entrada de 32 a 64 caracteres durante el entrenamiento) |
| Tipos de cuantizacion | Q8_0 (unico formato publicado) |
| Idiomas soportados | chino simplificado (zh) |
| Licencia | no disponible (UER no declara licencia de los pesos base; el modelo no se etiqueta hasta aclararlo) |
| Formato de pesos | GGUF (`suzu-uer6-pg200.q8_0.gguf`), mas fichero de vocabulario `.vocab.txt` |
| Vocabulario | 5142 caracteres (0 relleno, 1 desconocido, 2 inicio de secuencia) |
| Tamano del fichero | 52,8 MB (50,4 MiB) en Q8_0; repo de 0,1 GB |
| Modelo base | uer/gpt2-distil-chinese-cluecorpussmall (commit c98ef62) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2 con 6 capas y 768 dimensiones ocultas. El vocabulario original BERT de 21128 entradas se recorta a la interseccion con el conjunto de caracteres de Suzu-2.x, quedando en 5142 caracteres; los embeddings se reordenan segun el nuevo indice. La entrada se compone del simbolo de inicio de secuencia (equivalente al `[CLS]` de UER), los ultimos 30 caracteres del contexto y el caracter candidato. La salida es la suma de log-probabilidades de los caracteres del candidato, de modo que candidatos con caracteres fuera de vocabulario se marcan como invalidos. El cliente de inferencia debe hacer el mapeo caracter-a-indice por su cuenta, sin usar el tokenizador de llama.cpp.

El preentrenamiento continuado usa texto de MNBVC (dos fragmentos del arbol de Pekin, uno de Tianya y uno de Zhihu) con limpieza de citas, cabeceras de post, menciones, enlaces y marcas de imagen, y deduplicacion contra el conjunto de evaluacion mediante ventanas de 12 caracteres. Tras segmentar por puntuacion, se generaron 6,926 millones de ventanas de 32 a 64 caracteres (186 millones de caracteres). Se entreno solo con perdida de lenguaje, 64 ventanas por paso, lectura secuencial sin repeticion, learning rate 3e-5 con calentamiento de 500 pasos y decaimiento coseno hasta el 10%, durante 40000 pasos; se selecciono el paso 30000 (unos 52 millones de caracteres leidos).

El ajuste fino emplea 75000 tareas: 60000 de texto coloquial de MNBVC y 15000 de las tareas de pinyin abreviado de Suzu-2.4. Los candidatos son la respuesta correcta mas las palabras de mayor peso del diccionario Baishuang con el mismo codigo, mas palabras aleatorias. La perdida combina entropia cruzada a nivel de candidato con una perdida de lenguaje sobre "contexto + respuesta" con peso 0,5. Se uso AdamW, learning rate 3e-5, calentamiento de 200 pasos, decaimiento coseno sobre 6000 pasos, batch de 16 tareas, 1000 pasos totales con evaluacion cada 100 y seleccion del paso 200 sobre el conjunto devclean2 (2400 tareas de pinyin de dos letras del arbol de Tsinghua). No se uso modelo profesor: en la variante de 12 capas, la destilacion desde Qwen3.5-4B-Base empeoraba el primer acierto en 2,0 puntos frente a solo preentrenamiento continuado.

## Capacidades

- Puntuacion y reordenacion de candidatos de entrada pinyin: recibe contexto y candidatos, devuelve log-probabilidades sumadas para ordenar.
- Generacion de candidatos de pinyin abreviado (jianpin) de dos letras, integrada en el motor Rime.
- Reordenacion de candidatos de pinyin completo (regresion de 1293 tareas con hasta 5 candidatos).
- Manejo de contexto corto: funciona con tan solo 2 a 3 caracteres de contexto previo (54,5% de acierto en ese tramo).
- Inferencia en edge: pensado para ejecutarse en el propio dispositivo, con 150 MiB de memoria residente y carga en 39 ms.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto libre. Es exclusivamente un reranker.
- Cobertura limitada al chino simplificado y a un vocabulario de 5142 caracteres; los candidatos con caracteres fuera de ese conjunto no reciben puntuacion.

## Casos de uso

- Reordenacion de candidatos en teclados pinyin de escritorio: integrado en Rime (macOS Squirrel, Windows Weasel, Android) como modelo por defecto para colocar primero la palabra mas probable segun el contexto de la frase que se esta escribiendo.
- Generacion de candidatos de pinyin abreviado: en modo jianpin de dos letras, el modelo puntua las palabras del diccionario compatibles con el codigo y permite ofrecer opciones que el motor no generaria por reglas.
- Mejora de la primera opcion en moviles de gama media-alta: con 52,8 MB en Q8_0 y latencias P99 de 19,7 ms en frio y 22,5 ms tras 1,5 s de inactividad en un Snapdragon 8 Gen 2, cabe en el presupuesto de 45 ms del proceso demonio de entrada.
- Correccion contextual de errores de seleccion: al puntuar con el contexto previo, reduce los cambios erroneos de primera opcion (18 casos frente a 12 del modelo anterior en la validacion de 1195 tareas) a cambio de mas cambios correctos (632 frente a 547).
- Despliegue en dispositivos con recursos limitados: 150 MiB de memoria residente y carga en 39 ms lo hacen viable en telefonos y portatiles sin GPU dedicada, ejecutando el nucleo de inferencia con 2 hilos de CPU.
- Investigacion en rerankers ligeros: sirve como referencia reproducible (sha256 publicados, receta completa de datos e hiperparametros) para estudiar el efecto del preentrenamiento continuado en modelos de menos de 50M de parametros.
- Sustitucion directa de Suzu-UER6-KD500: misma estructura y vocabulario byte a byte, por lo que se puede cambiar el fichero GGUF sin tocar la integracion existente.

## Benchmarks y rendimiento

Resultados en PyTorch a precision completa sobre devclean (2400 tareas de pinyin de dos letras, 48 candidatos por tarea, tres fuentes no usadas en entrenamiento):

| Grupo | Suzu-UER6-KD500 | Suzu-UER6-PG200 | Suzu-UER12-PG100 | Profesor Qwen3.5-4B-Base |
|---|---:|---:|---:|---:|
| Todo (2400) | 59,5% | 61,9% | 63,7% | 60,0% |
| Arbol de Tsinghua | 61,9% | 67,0% | 69,4% | 62,2% |
| Tianya | 56,4% | 57,1% | 59,8% | 56,5% |
| Zhihu | 60,4% | 61,6% | 62,0% | 61,1% |
| Contexto 2-3 caracteres | 50,7% | 54,5% | 56,7% | 43,7% |
| Contexto 10+ caracteres | 65,7% | 67,8% | 69,8% | 73,8% |

Intervalos de confianza al 95% por bootstrap a nivel de tarea: frente a Suzu-UER6-KD500, +2,4 puntos en total (+1,0 a +3,8) y +3,8 en contexto de 2-3 caracteres (+0,7 a +6,8); frente al profesor, +2,0 puntos en total (+0,2 a +3,8), pero 6,0 puntos por debajo en contexto de 10+ caracteres (-9,3 a -2,8).

Tras cuantizacion Q8_0 medida en el nucleo de inferencia: devclean 61,21% (+2,46 puntos frente a KD500, 162 tareas corregidas y 103 empeoradas) y conjunto coloquial evalv2x (1600 tareas) 58,31% (+3,06 puntos).

Prueba real en librime de macOS con entrada tecla a tecla sobre devclean (mitad de validacion, no emparejada por tarea):

| Modelo | Tareas | Primer acierto | Cambios de primera opcion | De ellos, erroneos |
|---|---:|---:|---:|---:|
| Suzu-UER6-KD500 | 1190 | 54,0% | 547 | 12 |
| Suzu-UER6-PG200 | 1195 | 56,4% | 632 | 18 |
| Suzu-UER12-PG100 | 1190 | 58,2% | 638 | 14 |

Sin puntuacion del modelo, el primer acierto con los mismos candidatos es del 28,5%.

Regresion de pinyin completo (1293 tareas, hasta 5 candidatos, emparejadas por tarea):

| Grupo | Suzu-2.4 | Suzu-UER6-KD500 | Suzu-UER6-PG200 | Delta frente a KD500 |
|---|---:|---:|---:|---|
| Todo | 92,73% | 92,81% | 93,43% | +0,62 (-0,62 a +1,86) |
| Caracter unico (74) | 81,08% | 85,14% | 87,84% | +2,70 (-2,70 a +8,11) |
| Multi-caracter | 93,44% | 93,27% | 93,77% | +0,49 (-0,82 a +1,72) |

Latencia en ASUS Zenfone 10 (Snapdragon 8 Gen 2, 2 hilos, 10 candidatos por grupo, media de dos rondas, en ms):

| Escenario | KD500 P50/P95/P99 | PG200 P50/P95/P99 |
|---|---|---|
| Contexto en frio (30 caracteres decodificados) | 14,8 / 17,3 / 18,6 | 13,9 / 17,5 / 19,7 |
| Cache activa, puntuacion mas generacion | 16,2 / 18,8 / 20,2 | 16,3 / 19,1 / 20,4 |
| Solo puntuacion | 11,1 / 13,7 / 14,8 | 11,2 / 13,1 / 16,2 |
| Primera tecla tras 1,5 s inactivo | 16,3 / 19,2 / 20,2 | 16,7 / 20,0 / 22,5 |
| Entrada continua 60 s | 20,3 / 23,3 / 25,0 | 20,5 / 23,4 / 24,9 |

Ningun escenario supera el limite de 45 ms del proceso demonio. Memoria residente 150 MiB, carga 39 ms.

## Requisitos de hardware

- VRAM/espacio: el fichero Q8_0 ocupa 52,8 MB; el proceso completo consume unos 150 MiB de memoria residente en el dispositivo de prueba.
- GPU: no requiere GPU. El autor lo mide en CPU de movil (Snapdragon 8 Gen 2) con 2 hilos. Cualquier CPU moderna de escritorio ejecuta el modelo con holgura.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en telefonos de gama media-alta; tambien en Raspberry Pi y dispositivos embebidos similares.
- Despliegue: formato GGUF, por lo que es compatible con llama.cpp y con el nucleo de inferencia propio del proyecto suzu-ime. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia: P50 de 11,2 ms solo puntuando y P99 de 22,5 ms en el peor escenario medido (primera tecla tras inactividad). Throughput no publicado.
- El cliente debe implementar el mapeo caracter-a-indice con el `.vocab.txt` adjunto; no se puede usar el tokenizador de llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Primer acierto (devclean) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Suzu-UER6-PG200 | 47,26M | 30 caracteres | 61,9% (PyTorch) / 61,21% (Q8_0) | no disponible | GGUF en HF |
| Suzu-UER6-KD500 | ~47M (misma estructura) | 30 caracteres | 59,5% | no disponible | GGUF en HF |
| Suzu-UER12-PG100 | 12 capas (parametros no disponibles) | 30 caracteres | 63,7% | no disponible | GGUF en HF |
| Qwen3.5-4B-Base (profesor) | ~4B | no disponible | 60,0% | no disponible | no disponible en esta ficha |

El modelo de 12 capas de la misma familia obtiene 1,8 puntos mas de primer acierto en devclean y 1,8 puntos mas en la prueba real de librime, a cambio de aproximadamente el doble de tiempo por puntuacion. Frente al profesor de ~4B, el modelo de 47M gana 2,0 puntos de media pero pierde 6,0 puntos con contextos de 10 o mas caracteres, lo que indica que la ventaja se concentra en contextos cortos.

## Limitaciones y advertencias

- Solo cubre chino simplificado y solo sirve para reordenar o generar candidatos; no genera texto libre ni responde instrucciones.
- Los resultados de evaluacion asumen respuestas "palabra original" y contexto limpio; el rendimiento en texto real con errores o ruido no esta medido.
- El contexto largo es el punto debil: con 10 o mas caracteres queda unos 6 puntos por debajo del profesor Qwen3.5-4B-Base (y el modelo de 12 capas, unos 4).
- La mejora en las tareas de Tianya es la menor de las tres fuentes (+0,7 puntos) y el autor no ha identificado la causa.
- El vocabulario de 5142 caracteres es unos 850 caracteres menor que el de Suzu-2.x; los candidatos con esos caracteres no reciben puntuacion y se colocan al final en el orden original de Rime.
- Posible contaminacion: el corpus de preentrenamiento de UER (CLUECorpusSmall) proviene de rastreo web y podria contener frases originales de Zhihu o Tianya, aunque el autor senala que los posts del arbol de Tsinghua usados en evaluacion no estan en la web publica.
- Solo se entreno una semilla; no se midio la variabilidad entre semillas con la misma receta.
- El umbral de primera opcion (1,5) esta calibrado para la escala de esta familia; al volver a Suzu-2.4 debe ajustarse a 2,5.
- Licencia sin declarar: los pesos base de UER no tienen licencia explicita, por lo que el uso comercial queda en una situacion juridica incierta. El codigo UER-py es Apache-2.0, los datos MNBVC son MIT y los diccionarios de candidatos (Baishuang, Wusong) son GPL-3.0.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de reordenaciones erroneas: en la validacion, 18 de 632 cambios de primera opcion fueron incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IzumiThe3rd/Suzu-UER6-PG200
- Modelo de 12 capas de la misma familia: https://huggingface.co/IzumiThe3rd/Suzu-UER12-PG100
- Modelo base UER: https://huggingface.co/uer/gpt2-distil-chinese-cluecorpussmall
- Repositorio de codigo UER-py: https://github.com/dbiir/UER-py
- Integracion con el motor de entrada: https://github.com/1zumiii/suzu-ime
- Configuracion y paquete de diccionarios Rime: https://github.com/1zumiii/rime-suzu
- Documentacion del proyecto y versiones anteriores: https://github.com/1zumiii/Suzu
- Conjunto de datos MNBVC: https://huggingface.co/datasets/liwu/MNBVC
