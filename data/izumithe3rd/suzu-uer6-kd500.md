# IzumiThe3rd/Suzu-UER6-KD500

## Resumen

Suzu-UER6-KD500 es un modelo de lenguaje de pequeno tamano (47,26 millones de parametros) desarrollado por IzumiThe3rd, disenado especificamente para una tarea muy concreta: la reordenacion de candidatos en motores de entrada de pinyin chino (input methods) como Rime. No es un modelo generativo de proposito general, sino un ranker que puntua candidatos de caracteres chinos dado un contexto previo, con el objetivo de mejorar el orden en que el motor de entrada presenta las opciones al usuario.

El modelo parte de `uer/gpt2-distil-chinese-cluecorpussmall` (un GPT-2 chino de 6 capas y 768 dimensiones de UER), al que se le recorta el vocabulario original de 21.128 tokens BERT a 5.142 caracteres, y se somete a un proceso de destilacion a nivel de candidato usando Qwen3.5-4B-Base como profesor durante 500 pasos (de ahi el sufijo KD500). El resultado se distribuye como un unico archivo GGUF cuantizado en Q8_0 de 52,8 MB.

Su relevancia es practica y acotada: demuestra que un modelo de menos de 50M de parametros, con inferencia en CPU movil (151 MB de RAM residente, ~2 ms adicionales por puntuacion frente a su predecesor Suzu-2.4), puede acercarse al rendimiento de un profesor de 4B parametros en la tarea de reranking de candidatos, con una mejora de 3,4 puntos porcentuales sobre la version cero-shot en precision de primera opcion en pruebas de pinyin de dos letras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), 6 capas, 768 dimensiones |
| Parametros totales | 47.264.256 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 30 caracteres de texto previo mas el candidato (diseno de la tarea) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | Chino simplificado (zh) |
| Licencia | No disponible (sin especificar; el autor indica que la licencia del peso base de UER no esta clara) |
| Formato de pesos | GGUF (`suzu-uer6-kd500.q8_0.gguf`, 52,8 MB) mas archivo de vocabulario `suzu-uer6-kd500.q8_0.gguf.vocab.txt` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2 con 6 capas y 768 dimensiones de representacion, heredada de `uer/gpt2-distil-chinese-cluecorpussmall`. El vocabulario original BERT de 21.128 entradas se recorta a 5.142 caracteres (interseccion con el conjunto de caracteres de Suzu-2.x), reordenando las embeddings segun el nuevo indice. El vocabulario resultante usa el indice 0 para padding, 1 para desconocido y 2 para inicio de secuencia (equivalente al `[CLS]` de UER). La inferencia requiere que el cliente realice el mapeo caracter-a-indice manualmente, sin usar el tokenizador de llama.cpp.

El entrenamiento combina destilacion por KL a nivel de candidato (temperatura 1) desde Qwen3.5-4B-Base en cuantizacion nf4, con una perdida de lenguaje adicional sobre "contexto + respuesta" con peso 0,5. El conjunto de entrenamiento consta de 75.000 problemas: 60.000 de pinyin abreviado (70% de dos letras, 30% de pinyin completo del primer caracter mas inicial del segundo) extraidos de MNBVC (Peking University Treehole 30k, Tianya 15k, Zhihu 15k), y 15.000 del conjunto de entrenamiento de Suzu-2.4. Los candidatos se generan a partir de la respuesta mas las palabras de mayor peso del diccionario Baishuang/Wusong para el mismo codigo, mas palabras aleatorias. Se uso AdamW con learning rate 3e-5, warmup de 200 pasos, decaimiento coseno hasta el 10%, batch de 16 problemas y 6.000 pasos totales, seleccionando el checkpoint del paso 500 por rendimiento en el conjunto de desarrollo (la diferencia con el paso 6.000 es de 0,2 puntos).

## Capacidades

- Puntuacion y reordenacion de candidatos de caracteres chinos dado un contexto previo de hasta 30 caracteres.
- Generacion de candidatos de pinyin abreviado (jianpin) de dos letras y de pinyin completo con inicial del segundo caracter.
- Calculo de log-probabilidad agregada por candidato (suma de log-probabilidades de cada caracter), permitiendo ordenar candidatos por puntuacion.
- Deteccion de candidatos invalidos: si un candidato contiene caracteres fuera del vocabulario de 5.142 entradas, se marca como no puntuable.
- Integracion con el motor de entrada Rime (librime) mediante un daemon de puntuacion, con soporte de gating por umbral de puntuacion (`top_gate`).
- No soporta generacion de texto libre, tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso. Es exclusivamente un ranker de candidatos.

## Casos de uso

- Reordenacion de candidatos en Rime: el modelo puntua los candidatos generados por el motor de entrada para cada codigo pinyin y los reordena, mejorando la posicion del candidato correcto. Es su uso principal y el unico documentado.
- Generacion de candidatos de pinyin abreviado: dado un contexto y una secuencia de dos letras, el modelo puede puntuar candidatos generados por el motor para producir opciones de jianpin mas precisas (precision de primera opcion del 59,5% en devclean).
- Integracion en el daemon `suzu-ime`: se ejecuta como proceso residente en segundo plano que recibe contextos y candidatos y devuelve puntuaciones, con un presupuesto de latencia de 45 ms por puntuacion de 10 candidatos.
- Mejora de la experiencia de escritura en movil: con 151 MB de RAM residente y ~2 ms adicionales por puntuacion en un Snapdragon 8 Gen 2, es viable en telefonos de gama alta sin degradar la latencia percibida.
- Investigacion sobre destilacion de rankers de bajo coste: sirve como caso de estudio de destilacion a nivel de candidato desde un modelo de 4B a uno de 47M con perdida KL y perdida de lenguaje combinadas.
- Evaluacion comparativa de tecnicas de reranking en input methods: el modelo y sus datos de evaluacion (devclean, pruebas de cadena real en librime) permiten reproducir y comparar estrategias de gating y escalado de puntuaciones.

## Benchmarks y rendimiento

Resultados en pinyin de dos letras (devclean, 2.400 problemas, 48 candidatos por problema, precision de primera opcion):

| Grupo | Suzu-2.4 | Cero-shot | Suzu-UER6-KD500 | Profesor Qwen3.5-4B-Base |
|---|---:|---:|---:|---:|
| Todos (2400) | 41,5% | 56,2% | 59,5% | 60,0% |
| Tsinghua Treehole | 42,6% | 58,5% | 61,9% | 62,3% |
| Tianya | 40,1% | 52,9% | 56,4% | 56,5% |
| Zhihu | 41,9% | 57,1% | 60,4% | 61,1% |
| Contexto 2-3 caracteres | 37,3% | 48,0% | 50,7% | 43,7% |
| Contexto 10+ caracteres | 44,7% | 63,3% | 65,7% | 73,8% |

Resultados en cadena real de input method (librime en macOS, 10 candidatos por grupo):

| Configuracion | Suzu-2.4 | Cero-shot | Suzu-UER6-KD500 |
|---|---:|---:|---:|
| Umbral 2,5 | 39,3% | 51,3% | 50,0% |
| Umbral 1,5 | - | 53,1% | 54,0% |
| Umbral 1 | 40,4% | - | 55,0% |

Resultados en regresion de pinyin completo (1.293 problemas, maximo 5 candidatos):

| Grupo | Suzu-2.4 | Cero-shot | Suzu-UER6-KD500 | Diferencia vs Suzu-2.4 |
|---|---:|---:|---:|---|
| Todos | 92,73% | 90,95% | 92,81% | +0,08 (-1,47 a +1,70) |
| Un solo caracter (74) | 81,08% | 81,08% | 85,14% | +4,05 (-2,70 a +10,81) |
| Multi-caracter | 93,44% | 91,55% | 93,27% | -0,16 (-1,80 a +1,48) |

Latencia y memoria (medido con la version cero-shot de misma estructura en ASUS Zenfone 10, Snapdragon 8 Gen 2, daemon con 2 hilos): 1,5-2 ms adicionales por puntuacion de 10 candidatos respecto a Suzu-2.4, sin superar el presupuesto de 45 ms. Memoria residente de 151 MB frente a 109 MB de Suzu-2.4.

## Requisitos de hardware

- VRAM/almacenamiento: el archivo GGUF Q8_0 ocupa 52,8 MB; la memoria residente del daemon de inferencia es de 151 MB.
- GPU recomendadas: no requiere GPU. El modelo esta disenado para inferencia en CPU, incluyendo moviles.
- Cabe en cualquier GPU consumer y en telefonos moviles: probado en Snapdragon 8 Gen 2 con 2 hilos de CPU.
- Opciones de despliegue: inferencia custom via `suzu-ime` (daemon propio con llama.cpp), integracion en Rime mediante librime. No se documenta soporte para vLLM, TGI ni Ollama, y el modelo no usa el tokenizador de llama.cpp (el mapeo de caracteres es manual).
- Latencia: 1,5-2 ms adicionales por puntuacion de 10 candidatos frente a Suzu-2.4, dentro de un presupuesto de 45 ms.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Suzu-UER6-KD500 | 47,26M | 30 caracteres de contexto | Reranking de candidatos pinyin | No disponible | GGUF Q8_0 |
| Suzu-2.4 | No disponible | No disponible | Reranking de candidatos pinyin | No disponible | No disponible |
| Qwen3.5-4B-Base (profesor) | 4B | No disponible | Generacion de texto general | Apache-2.0 | No disponible |
| uer/gpt2-distil-chinese-cluecorpussmall (base) | No disponible | No disponible | Generacion de texto chino | No disponible | No disponible |

La comparacion relevante es contra Suzu-2.4 (predecesor en la misma tarea) y contra el profesor Qwen3.5-4B-Base. En pinyin de dos letras, Suzu-UER6-KD500 supera a Suzu-2.4 en 18 puntos porcentuales (59,5% vs 41,5%) y queda a 0,5 puntos del profesor (60,0%), con un modelo 85 veces mas pequeno. En contexto largo (10+ caracteres) queda 8,1 puntos por debajo del profesor. En pinyin completo, empata con Suzu-2.4 (92,81% vs 92,73%). No se dispone de datos de otros rankers de input method comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre chino simplificado y solo sirve para reranking y generacion de candidatos; no genera texto.
- El vocabulario de 5.142 caracteres es aproximadamente 850 caracteres menor que el de Suzu-2.x; los candidatos con caracteres fuera de vocabulario no reciben puntuacion y se ordenan segun el orden original de Rime.
- El contexto largo es un punto debil: con 10 o mas caracteres previos, la precision es 8,1 puntos inferior a la del profesor Qwen3.5-4B-Base.
- Los resultados de evaluacion usan respuestas que solo aceptan la palabra original y contextos limpios; en uso real los usuarios escriben palabras comunes y el diccionario de usuario ya ha aprendido sus habitos, por lo que la mejora practica sera menor que la medida en benchmarks.
- Solo se entreno con una semilla; no se midio la varianza entre semillas con la misma receta.
- El umbral de gating (`top_gate`) esta calibrado para la escala de puntuaciones de este modelo; al cambiar a Suzu-2.4 debe volver a 2,5.
- El corpus de preentrenamiento de UER (CLUECorpusSmall) proviene de rastreo web y puede contener frases originales de Zhihu y Tianya, lo que podria inflar ligeramente los resultados en esos dominios (aunque el autor senala que la mejora en Treehole, cuyos posts no estan en web publica, es comparable).
- La licencia no esta especificada: el autor indica que UER no declara licencia para los pesos de preentrenamiento, por lo que el uso comercial queda en una situacion juridica incierta. Los datos de MNBVC son MIT, los diccionarios de candidatos son GPL-3.0 y el profesor Qwen3.5-4B-Base es Apache-2.0.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de puntuaciones erroneas que reordenen mal candidatos validos (12 errores de primer candidato en 547 cambios de primer lugar en la validacion).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IzumiThe3rd/Suzu-UER6-KD500
- Repositorio de integracion en input method: https://github.com/1zumiii/suzu-ime
- Configuracion y paquete de diccionarios Rime: https://github.com/1zumiii/rime-suzu
- Documentacion del modelo y versiones anteriores: https://github.com/1zumiii/Suzu
- Repositorio de codigo de UER: https://github.com/dbiir/UER-py
- Modelo base: https://huggingface.co/uer/gpt2-distil-chinese-cluecorpussmall
- Dataset MNBVC: https://huggingface.co/datasets/liwu/MNBVC
