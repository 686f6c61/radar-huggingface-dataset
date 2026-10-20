# IzumiThe3rd/Suzu-2.4

## Resumen

Suzu-2.4 es un modelo pequeno de reordenacion de candidatos (reranking) para metodos de entrada de chino basados en pinyin. Lo desarrolla IzumiThe3rd y su funcion no es generar texto, sino puntuar pares formados por un contexto inmediato y un candidato (normalmente un caracter o una palabra de dos caracteres), de forma que el motor de entrada pueda ordenar las opciones que ofrece al usuario. Se apoya en una arquitectura GPT-2 de 12 capas, 512 dimensiones y 8 cabezas de atencion, con vocabulario a nivel de caracter de 6000 entradas y 40.934.400 parametros totales.

La version 2.4 se obtiene por entrenamiento continuado sobre los pesos de Suzu-2.1, manteniendo estructura, vocabulario y tamano de fichero identicos, lo que permite sustituirlo directamente. La novedad es la cobertura de entradas abreviadas: abreviaturas de dos letras (por ejemplo `zm`) y el patron de pinyin completo de la primera silaba mas la inicial de la segunda (por ejemplo `jingl`). Segun la model card, anade 60.000 ejercicios de este tipo mezclados 1:2 con los datos originales y entrena 30.000 pasos, con destilacion desde Qwen3.5-4B-Base.

Es relevante para quien trabaje en motores de entrada tipo Rime o en motores de tecleo chino en general: demuestra que un modelo de 41 M de parametros, cuantizado en Q8_0 a 43,9 MB y ejecutable en CPU, puede recuperar aproximadamente la mitad de la brecha de precision que separa a Suzu-2.1 de su profesor de 4B en tareas de abreviatura, con una latencia p99 de unos 22-23 ms por pulsacion en un Mac con 4 hilos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), 12 capas, 512 dimensiones, 8 cabezas de atencion |
| Parametros totales | 40.934.400 (aprox. 40,9 M) |
| Longitud de contexto | No disponible como ventana formal; la entrada usa como maximo los ultimos 30 caracteres del texto previo |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | Chino simplificado (zh) unicamente |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (`suzu-2.4.q8_0.gguf`) mas fichero auxiliar de vocabulario `suzu-2.4.q8_0.gguf.vocab.txt` |
| Vocabulario | 6000 caracteres, caracter-level; 0 = padding, 1 = desconocido, 2 = inicio de frase; identico byte a byte al de Suzu-2 y Suzu-2.1 |
| Modelo base | IzumiThe3rd/Suzu-2.1 (entrenamiento continuado) |
| Maestro de destilacion | Qwen3.5-4B-Base |
| Tamano del fichero | 43,9 MB (41,9 MiB) en Q8_0 |
| sha256 | `a2ff2c46110c7ba47746871eaf8ff37cc4fab58105ddbe11e0a768e340cdb996` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2, deliberadamente diminuto: 12 capas, 512 dimensiones de modelo, 8 cabezas y un vocabulario de 6000 caracteres chinos. No es un modelo generativo en la practica: la entrada es una secuencia compuesta por el simbolo de inicio de frase, como maximo los ultimos 30 caracteres del contexto previo y el candidato a evaluar; la salida es la suma de log-probabilidades de los caracteres del candidato, de modo que una puntuacion mayor indica mejor encaje. El autor advierte que el mapa de caracter a indice debe implementarlo el motor de inferencia y que no se debe usar el tokenizador de llama.cpp.

El entrenamiento parte de los pesos de Suzu-2.1 y aplica destilacion desde Qwen3.5-4B-Base con una funcion de perdida que combina la perdida de modelo de lenguaje con una KL sobre la ordenacion de candidatos. A los ejercicios originales se anaden 60.000 problemas de abreviatura (70% de abreviaturas de dos letras, 30% de pinyin completo de la primera silaba mas inicial de la segunda), mezclados 1:2 con los previos, durante 30.000 pasos. Los datos de entrenamiento declarados son Wikipedia en chino (CC BY-SA 3.0 y GFDL) y frases sinteticas generadas con Qwen3.5-9B (Apache-2.0); los candidatos de los ejercicios de abreviatura provienen del lexico de Rime (rime-ice), usando solo entradas y pesos como candidatos del mismo acronimo, sin que los pesos del modelo contengan el lexico original. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Puntuacion y reordenacion de candidatos (caracteres o palabras) dado un contexto de hasta 30 caracteres previos.
- Generacion y ordenacion de candidatos para abreviaturas de dos letras del pinyin (por ejemplo `zm`).
- Soporte del patron de entrada mixta: pinyin completo de la primera silaba mas la inicial de las siguientes (por ejemplo `jingl`).
- Integracion en motores de entrada tipo Rime para reranking en tiempo real y generacion de candidatos de abreviatura.
- Funcionamiento en CPU con baja latencia (p99 de 22,3 y 23,0 ms por pulsacion en un Mac con 4 hilos, con generacion de candidatos activada).
- Capacidad de combinarse con un prior de frecuencia de palabra (la evaluacion de pinyin completo usa puntuacion del modelo mas prior lexico).
- No realiza generacion de texto libre, ni tool calling, ni razonamiento multi-paso, ni vision, ni audio.
- No soporta otros idiomas distintos del chino simplificado.

## Casos de uso

- Reordenacion de candidatos en un motor de entrada Rime: el modelo recibe el contexto reciente y cada candidato del mismo pinyin, y devuelve una puntuacion que el motor usa para recolocar la lista; es adecuado por su latencia de milisegundos y su tamano de 43,9 MB, que permite ejecutarlo en local sin servicio externo.
- Generacion de candidatos en escritura abreviada: cuando el usuario teclea solo dos letras, el motor enumera las palabras de dos caracteres con la misma inicial y deja que Suzu-2.4 las ordene; segun la model card, en el pipeline real la primera opcion acierta en el 49,4% de 407 casos, frente al 41,8% de Suzu-2.1.
- Entrada mixta (pinyin completo de la primera silaba mas iniciales restantes): util para usuarios que alternan entre escritura completa y abreviada; en la evaluacion del pipeline real sube del 68,7% al 72,5% de acierto en primera posicion sobre 291 casos.
- Sustitucion directa en despliegues existentes de Suzu-2.1: al compartir arquitectura, vocabulario y tamano, basta reemplazar el fichero GGUF y el `vocab.txt`, sin cambios en el codigo de integracion.
- Procesamiento私... (corregido) Procesamiento totalmente local y privado: al ejecutarse en CPU sobre un unico fichero de menos de 50 MB, encaja en teclados de escritorio o portatiles sin enviar el texto tecleado a la nube, algo relevante para entornos con requisitos de confidencialidad.
- Investigacion y ajuste de modelos de reranking: sirve como punto de partida (entrenamiento continuado sobre Suzu-2.1) para experimentar con dominios especificos usando lexicos propios, por ejemplo vocabulario tecnico o de videojuegos, sin necesidad de grandes recursos de computo.
- Personalizacion local del orden de candidatos: la model card describe el metodo para ajustar con el historial de tecleo del propio usuario, manteniendo el corpus y los pesos personalizados fuera de cualquier repositorio publico.
- Evaluacion comparativa de tecnicas de destilacion: con 41 M de parametros y un profesor de 4B, el modelo sirve como referencia para medir cuanto de la capacidad del profesor se transfiere a un reranker diminuto (51,2% de acierto en primera opcion frente al 57,6% del profesor en abreviaturas de dos letras).

## Benchmarks y rendimiento

Abreviaturas de dos letras: 1300 preguntas, respuesta de dos caracteres, conjunto de candidatos formado por todas las palabras de dos caracteres del diccionario con la misma inicial (media de 492 candidatos), ordenacion solo con la puntuacion del modelo. Los intervalos entre parentesis son el intervalo de confianza del 95% para comparaciones pareadas.

| Modelo | Primera opcion | Top 5 | Diferencia en primera opcion |
|---|---|---|---|
| Suzu-2.1 | 44,6% | 75,9% | - |
| Suzu-2.4 | 51,2% | 79,7% | +6,6 (+4,7 a +8,6) |
| Profesor Qwen3.5-4B-Base | 57,6% | 76,7% | +13,0 |

Desglose por dominio en primera opcion (Suzu-2.1 a Suzu-2.4): diario 51,4% a 59,9%, tecnico 43,5% a 53,3%, anime 39,7% a 41,1% (solo 433 preguntas, dentro del ruido).

Pipeline real de entrada (candidatos de Rime, generacion de candidatos y ordenacion unificada, tecleo pulsacion a pulsacion, contexto limpio):

| Tipo de entrada | Preguntas | Suzu-2.1 | Suzu-2.4 |
|---|---|---|---|
| Abreviatura de dos letras | 407 | 41,8% | 49,4% |
| Entrada mixta (primera silaba completa + iniciales) | 291 | 68,7% | 72,5% |
| Pinyin completo | 216 | 91,7% | 90,7% |

En el recuento por pregunta: abreviaturas 49 mejores y 18 peores; mixta 19 mejores y 8 peores; pinyin completo 2 mejores y 4 peores, dentro del error de muestreo.

Regresion en pinyin completo (precision mixta, puntuacion del modelo mas prior de frecuencia de palabra; diferencia pareada frente a Suzu-2.1 con intervalo del 95%):

| Conjunto | Preguntas | Diferencia |
|---|---|---|
| Evaluacion Wikipedia | 16000 | +0,0 (+-0,3) |
| Tecnico (retenido antiguo) | 221 | -0,5 (+-3,2) |
| Anime (retenido antiguo) | 211 | +1,4 (+-1,6) |
| Diario (retenido antiguo) | 205 | -0,5 (+-1,0) |
| Tecnico (retenido nuevo) | 220 | -0,9 (+-2,2) |
| Anime (retenido nuevo) | 193 | -0,5 (+-3,1) |
| Diario (retenido nuevo) | 221 | +1,4 (+-2,0) |

Fluctuacion de entrenamiento: una primera ronda con los mismos datos y receta (24.000 ejercicios de abreviatura, 20.000 pasos) reentrenada con dos semillas dio 49,9% y 50,5% en primera opcion, menos de un punto de variacion. Suzu-2.4 se entreno con una sola semilla.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo no es generativo y no se evalua con esas metricas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 44 MB para los pesos Q8_0, mas el estado de inferencia y la tabla de vocabulario; en la practica menos de 100-200 MB de memoria residente.
- Cabe en cualquier GPU de consumo (incluso integradas) y se ejecuta sin GPU: la model card reporta latencias en un Mac con 4 hilos de CPU.
- GPU recomendadas: no se especifican; el modelo esta disenado para CPU. Cualquier GPU moderna sirve si se quiere reducir aun mas la latencia, pero no es necesaria.
- Latencia medida: p99 por pulsacion de 22,3 y 23,0 ms en dos rondas alternas con Suzu-2.1 (21,3 y 22,2 ms), con generacion de candidatos activada y simulacion de 100 palabras; la puntuacion tiene un p99 de unos 11-12 ms. Tasa de omision (skip) del 0% en ambos modelos. Se observo un pico aislado de 52 ms en la primera ronda.
- Throughput: no disponible de forma explicita; se deduce del patron de uso (una puntuacion por candidato y pulsacion).
- Opciones de despliegue: llama.cpp puede cargar el GGUF, pero el autor indica que no debe usarse su tokenizador y que el mapa caracter-indice debe implementarse aparte, por lo que el modelo no encaja en pipelines generativos tipo vLLM o TGI. La integracion de referencia es suzu-ime sobre Rime; Ollama u otros servidores de chat no son adecuados porque el modelo no genera texto.
- El repositorio no incluye pesos en safetensors (tamano de repo de 0,0 GB); el unico artefacto es el GGUF cuantizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrada | Primera opcion en abreviaturas de dos letras | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Suzu-2.4 | 40,9 M | Ultimos 30 caracteres | 51,2% (1300 preguntas) | CC BY-SA 4.0 | GGUF Q8_0, 43,9 MB |
| Suzu-2.1 | 40,9 M | Ultimos 30 caracteres | 44,6% | CC BY-SA 4.0 (segun modelo base) | GGUF Q8_0, mismo tamano |
| Qwen3.5-4B-Base (profesor) | Aprox. 4B (dato no confirmado en la informacion) | No disponible | 57,6% | Apache-2.0 | Pesos completos, requiere mucha mas memoria y latencia |
| Prior de frecuencia de palabra (base lexica usada junto al modelo) | 0 (no neuronal) | No aplica | No disponible de forma aislada | Depende del lexico (rime-ice) | Tabla de frecuencias |

No se dispone de datos publicados que comparen Suzu-2.4 con otros rerankers neuronales de metodos de entrada; la comparacion se limita a las alternativas evaluadas en la propia model card.

## Limitaciones y advertencias

- Solo cubre chino simplificado y solo sirve para reordenar o generar candidatos; no genera texto.
- El entrenamiento de abreviaturas cubre unicamente dos patrones (dos letras y primera silaba completa mas inicial de la segunda); abreviaturas mas largas no se han entrenado ni evaluado.
- El contexto de entrada se limita a los ultimos 30 caracteres, por lo que no puede resolver dependencias discursivas largas.
- Las preguntas de evaluacion provienen de corpus publicos y frases sinteticas, con respuestas sesgadas hacia terminos poco frecuentes; el beneficio real dependera de los datos de uso, donde predominan palabras comunes.
- El orden de homofonos puede cambiar respecto a Suzu-2.1 en contextos ambiguos: el ejemplo de la model card es "我最近没有太多" con "经历" frente a "精力", donde ambas opciones son plausibles.
- Es un entrenamiento continuado sobre Suzu-2.1, no un modelo entrenado desde cero; el margen de mejora con mas datos de abreviatura es pequeno (60.000 ejercicios y 30.000 pasos solo aportan alrededor de un punto frente a 24.000 y 20.000).
- Solo se entreno con una semilla; la variacion observada entre semillas en la receta previa fue de menos de un punto, pero no hay estimacion directa para esta version.
- Licencia CC BY-SA 4.0: permite uso, modificacion y explotacion comercial, pero exige atribucion, mencion de cambios y distribucion de derivados bajo la misma licencia (copyleft). Hay que conservar el aviso de atribucion descrito en `NOTICE.md`.
- Los datos de entrenamiento incluyen Wikipedia en chino (CC BY-SA 3.0 y GFDL) y frases sinteticas de Qwen3.5-9B (Apache-2.0); los candidatos de abreviatura usan entradas de rime-ice, aunque los pesos no contienen el lexico original. Un uso comercial debe revisar las obligaciones de atribucion de cada fuente.
- La documentacion y la model card estan en chino; no hay version oficial en castellano ni en ingles.
- La personalizacion con historial de tecleo debe hacerse en local: el autor advierte explicitamente de que el corpus personal y los pesos personalizados no deben publicarse en ningun repositorio.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de ordenacion incorrecta cuando el contexto es ambiguo o el candidato es muy infrecuente.
- Sesgos: la distribucion de entrenamiento (Wikipedia y frases sinteticas, con sesgo hacia vocabulario enciclopedico y terminos poco comunes) puede infrarepresentar registros coloquiales o jerga muy especifica; el dominio de anime solo tiene 433 preguntas de evaluacion, insuficiente para conclusiones solidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IzumiThe3rd/Suzu-2.4
- Modelo base Suzu-2.1: https://huggingface.co/IzumiThe3rd/Suzu-2.1
- Codigo de entrenamiento y evaluacion (Suzu): https://github.com/1zumiii/Suzu
- Integracion con el metodo de entrada (suzu-ime): https://github.com/1zumiii/suzu-ime
- Lexico y configuracion (rime-ice-Custom): https://github.com/1zumiii/rime-ice-Custom
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Dataset Wikipedia (multilingue, incluye zh): https://huggingface.co/datasets/wikimedia/wikipedia
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardaban relacion con Suzu-2.4 ni con modelos de reordenacion para metodos de entrada, por lo que se han descartado.
