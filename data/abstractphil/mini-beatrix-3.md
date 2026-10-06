# AbstractPhil/mini-beatrix-3

## Resumen

mini-beatrix-3 es un modelo de lenguaje de 376 millones de parametros (377.229.665 segun los pesos en safetensors) desarrollado por AbstractPhil. Se trata del tercer escalon de la escalera "mini-beatrix", correspondiente a 32 bloques, y su peculiaridad principal es que opera directamente sobre bytes UTF-8 en crudo: no existe tokenizador, los `input_ids` son valores de byte entre 0 y 255 y el vocabulario efectivo es de 256 simbolos. El modelo se distribuye junto a un banco de adaptadores desmontables denominados "stage arms".

La arquitectura no utiliza atencion softmax sobre posiciones. En su lugar emplea un mecanismo propio llamado CausalSplatHUB, descrito como atencion lineal de direccionamiento con signo sobre "pizarras" (blackboards) de libro de codigo aprendido, mas un banco de expertos anclados en cada uno de los 32 bloques. El contexto es de 4096 tokens y el modelo se entreno sobre 64,4 mil millones de bytes durante 245.674 pasos, unas 295 horas en dos RTX 5090, con finalizacion el 5 de octubre de 2026.

Es relevante ahora porque explora una via alternativa a la atencion cuadratica clasica (estado de prefijo de tamano constante en lugar de cache KV creciente) y porque separa el nucleo congelado de los adaptadores de etapa, lo que permite consultar el modelo base o el modelo con "brazos" montados desde el mismo repositorio. Se publica bajo licencia MIT, solo en ingles y con codigo personalizado obligatorio (`trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 32 bloques con CausalSplatHUB (atencion lineal de direccionamiento con signo sobre pizarras de libro de codigo) y banco de expertos anclados; sin atencion softmax sobre posiciones |
| Parametros totales | 377.229.665 (376M) |
| Parametros activos | No disponible (3 expertos full-width de ff 1024 por bloque con despacho con signo; la model card no especifica enrutamiento disperso ni parametros activos) |
| Longitud de contexto | 4096 |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, int8 ni int4; solo pesos safetensors del modelo y de los adaptadores) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | MIT |
| Formato de pesos | safetensors con `custom_code` (requiere `trust_remote_code=True`) |

Datos adicionales de configuracion: `d_model` 1024, 32 capas, 16 cabezas, embedding de trigramas de bytes, 4 constelaciones x 64 anclas con D=128 por bloque, escaneo troceado exacto con chunk 256, 3 expertos por bloque, doble cabeza (lectura lineal + lectura "aleph" con signo de 256 anclas a 256). Tamano del repositorio: 2,7 GB.

## Arquitectura y entrenamiento

El modelo es un transformer de 32 bloques de 1024 dimensiones y 16 cabezas que sustituye la atencion por producto punto escalado por un mecanismo de "hubs" en todos los bloques. Cada bloque contiene 4 constelaciones de 64 anclas con D=128, leidas mediante un escaneo troceado exacto (chunk 256) y compuestas por presupuesto: los numeradores y las masas de acuerdo se suman antes de una unica division, de modo que el calculo es reconstructivo y no comparativo, sin `argmax` ni `top-k`. La consecuencia estructural declarada es un estado de prefijo de tamano constante: cada capa codifica la secuencia sobre una pizarra direccionada de anchura fija en lugar de almacenar una cache. A esto se suman bancos anclados de 3 expertos full-width por bloque (ff 1024) con despacho con signo y salidas de experto inicializadas a cero, mas una doble cabeza compuesta por una lectura lineal y una lectura "aleph" con signo de 256 anclas a 256.

El entrenamiento consumio 64,4 mil millones de bytes en 245.674 pasos (unas 295 horas en dos RTX 5090) mediante un curriculum por etapas que ensena nueve tipos de texto de forma sucesiva. No se menciona RLHF ni DPO; el ajuste descrito es de tipo curricular y posteriormente por adaptadores. La model card incluye un "toggle ledger" que mide en bits por byte (bpb) el coste de desactivar cada mecanismo en la ultima frontera antes del final y al final: los hubs aportan +5,86 y +6,41 bpb; la cabeza, +1,94 y +1,90; y los bancos, +3,40 en la primera medicion y +6,13 al final. La cabeza dual se ajusto al primer lote en el paso 0 (de 8,26 a 5,45 bpb en ese lote) para que funcionase desde el inicio.

Los "stage arms" son adaptadores pequenos (el grupo `stages-1-4` suma 54,8M parametros) entrenados sobre el nucleo congelado. Se entrenaron como grupo: primero los de las etapas 1 y 2, que quedaron fijos, y despues los de las etapas 3 y 4 montados encima y entrenados en su presencia. El montaje y desmontaje es reversible: la model card afirma que desmontar restaura el modelo base bit a bit y que los pesos del nucleo son los mismos archivos en ambos estados.

## Capacidades

- Generacion de texto autoregresiva a nivel de byte, sin tokenizador: la entrada son bytes UTF-8 crudos (0-255).
- Razonamiento secuencial sobre texto de tipo "reglas si-entonces" con palabras inventadas, segun los conjuntos de evaluacion de la etapa 3.
- Aritmetica de numeros pequenos expresada en texto (etapa 4).
- Descripcion de conceptos, propiedades y diferencias entre objetos (etapa 2).
- Reconstruccion de un mismo evento desde varias perspectivas: visto por una persona, dicho a esa persona o contado sobre ella (etapa 1).
- Formato de chat propio integrado mediante el metodo `m.say(...)`.
- Gestion de adaptadores en tiempo de ejecucion: `mount_arm("stages-1-4")`, `detach_arm()` y `m.arms()`, que devuelve las tablas de recetas y mediciones como datos.
- Modo con brazos activados desde la primera llamada mediante el argumento `default_arm`.
- No disponible: soporte de tool calling o function calling, capacidades de agente multi-paso, vision, audio, modo "thinking" explicito y capacidades multilingues mas alla del ingles. La model card no documenta ninguna de estas funciones.

## Casos de uso

- Investigacion sobre atencion lineal y estados de prefijo de tamano constante: el modelo permite medir experimentalmente el comportamiento de un transformer sin atencion softmax sobre posiciones y comparar su coste en bits por byte frente a arquitecturas convencionales de tamano similar.
- Analisis de modelos byte-level: al no requerir tokenizador y operar sobre UTF-8 crudo, sirve para estudiar como se comporta el modelado de lenguaje sin sesgos de vocabulario ni problemas de tokens desconocidos en cadenas arbitrarias.
- Experimentos de adaptadores desmontables: el patron de nucleo congelado mas brazos intercambiables es directamente reutilizable para probar tecnicas de personalizacion que deban ser reversibles bit a bit.
- Generacion de texto en ingles de bajo coste en hardware de consumo: con 376M parametros, cabe en GPUs de gama media y permite iterar rapidamente en tareas de continuacion de texto y prototipado.
- Evaluacion de aritmetica y razonamiento con reglas: los conjuntos de las etapas 3 y 4 (reglas si-entonces y aritmetica pequena) son utiles como banco de pruebas controlado para medir hasta que punto un modelo de este tamano sigue cadenas deductivas.
- Docencia y divulgacion de arquitecturas alternativas: el repositorio incluye mediciones detalladas de ablacion (toggle ledger, tablas por brazo) que resultan utiles como material didactico sobre que aporta cada componente.
- Replicacion de resultados: la model card reporta un segundo entrenamiento con otras semillas y mediciones comparables (0,048 / 0,121 / 0,222 / 0,338 bpb en los textos de etapa), lo que facilita la verificacion independiente de la receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor reporta exclusivamente perdidas en bits por byte (bpb) y tasas de acierto en preguntas cortas de cada etapa. Se reproducen a continuacion tal cual.

Grupo `stages-1-4` (4 brazos, 54,8M parametros; dos semillas):

| Brazo | Texto de etapa, brazos off -> grupo on (bpb) | Este brazo en solitario (bpb) | Items de etapa en su forma original, off -> grupo on | Items de etapa en forma nueva, off -> grupo on |
|---|---|---|---|---|
| `stages-1-4/s1_perspective` | 0,554 -> 0,048 | 0,052 | 55% -> 96% | 46% -> 48% |
| `stages-1-4/s2_concept` | 0,721 -> 0,112 | 0,350 | 30% -> 98% | 68% -> 78% |
| `stages-1-4/s3_rules` | 0,930 -> 0,224 | 0,824 | 16% -> 90% | 7% -> 30% |
| `stages-1-4/s4_arith` | 1,234 -> 0,338 | 1,127 | 34% -> 61% | 24% -> 24% |

Coste en texto web retenido al activar el grupo: +0,0017 bpb (limite fijado: +0,012). Media de la sonda de nueve suites: 0,411 con brazos off y 0,419 con el grupo on.

| Montado | Etapa 1 | Etapa 2 | Etapa 3 | Etapa 4 | Texto web |
|---|---|---|---|---|---|
| Nada (brazos off) | 0,554 | 0,721 | 0,930 | 1,234 | 0,951 |
| Solo `s1_perspective` | 0,053 | 0,239 | 0,509 | 0,723 | 0,952 |
| Solo `s2_concept` | 0,527 | 0,350 | 0,619 | 0,880 | 0,952 |
| Solo `s3_rules` | 0,554 | 0,724 | 0,824 | 1,234 | 0,951 |
| Solo `s4_arith` | 0,553 | 0,721 | 0,928 | 1,127 | 0,951 |
| Grupo completo | 0,048 | 0,112 | 0,224 | 0,338 | 0,952 |

No hay datos comparativos frente a otros modelos en la informacion disponible, por lo que no es posible situar estas cifras en un ranking externo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 1,5 GB; en fp16/bf16, unos 0,75 GB. Con activaciones y contexto de 4096, una estimacion conservadora es de 3 a 6 GB en fp16, aunque la model card afirma que el estado de prefijo es de tamano constante por capa, por lo que el consumo no deberia crecer con la longitud de contexto del mismo modo que una cache KV tradicional.
- GPU recomendadas: el entrenamiento se realizo en dos RTX 5090 (295 horas). Para inferencia, cualquier GPU con 6-8 GB o mas es suficiente en teoria: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100, con margen amplio en las tres ultimas.
- Compatibilidad con GPU de consumo: si, el modelo esta pensado para caber en GPUs de consumo. Una RTX 4090 o una RTX 3090 lo alojan sin problema; en tarjetas de 8 GB es probable que funcione en fp16 aunque no hay mediciones publicadas.
- Opciones de despliegue: no disponible. El repositorio incluye codigo personalizado (`custom_code`) y no se publican pesos GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI. El uso documentado es mediante `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`.
- Latencia y throughput: no disponible. Al operar a nivel de byte, cada token de texto equivale a varios pasos de decodificacion (aproximadamente uno por byte), lo que penaliza el throughput medido en palabras por segundo frente a modelos con tokenizador BPE del mismo tamano de parametros.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada modelos directamente comparables: no existe en el material consultado ningun otro modelo byte-level de ~376M parametros con atencion lineal direccionada y banco de expertos por bloque. Los resultados de la busqueda web recibidos no guardan ninguna relacion con el modelo ni con el ambito tecnico. Por tanto, la comparativa se declara no disponible.

A modo de referencia cualitativa, y solo sobre caracteristicas generales de la categoria de 300-500M parametros (datos no verificados en la informacion disponible y que deben confirmarse en las fuentes originales), este modelo se distingue por tres rasgos: vocabulario de 256 bytes sin tokenizador, ausencia total de atencion softmax sobre posiciones y distribucion de adaptadores de etapa en el mismo repositorio. Ninguna de esas caracteristicas se ha podido contrastar con cifras de rendimiento equivalentes.

## Limitaciones y advertencias

- Idiomas: solo ingles. No hay evidencia de capacidades multilingues; el castellano y otros idiomas no estan soportados de forma declarada.
- Escala de entrenamiento reducida: 64,4 mil millones de bytes es un volumen bajo para estandares actuales, lo que limita el conocimiento factual y la robustez fuera de los dominios del curriculum.
- Riesgo de alucinacion: no se documentan resultados de factualidad ni mecanismos de mitigacion. En un modelo de 376M entrenado a nivel de byte y con datos limitados, la generacion de contenido incorrecto con apariencia plausible es esperable.
- Sesgos: no se publica ninguna evaluacion de sesgos, toxicidad ni equidad. El corpus de entrenamiento no se describe en detalle (solo se mencionan nueve tipos de texto en un curriculum y "texto web").
- Licencia: MIT, permisiva y apta para uso comercial, pero el modelo depende de codigo personalizado. Cargar pesos con `trust_remote_code=True` implica ejecutar codigo del repositorio: conviene auditar los archivos `.py` antes de usarlo en produccion.
- Rendimiento de los brazos: las mejoras grandes en bits por byte se concentran en el texto propio de cada etapa; en formas nuevas de las mismas preguntas los incrementos son mucho menores (por ejemplo, 46% -> 48% en la etapa 1, o 7% -> 30% en la etapa 3), lo que indica poca generalizacion fuera del formato de entrenamiento.
- El autor advierte que la lectura de los bancos al final (+6,13 bpb) casi duplica todas las anteriores y que esta siendo repetida antes de darse por valida: se trata de una medicion en revision, no consolidada.
- Madurez del proyecto: 0 descargas y 0 "likes" en HuggingFace, sin benchmarks externos ni validacion por terceros. No se recomienda su uso en produccion sin evaluacion propia previa.
- Coste de decodificacion: al ser byte-level, generar texto requiere muchos mas pasos de inferencia por palabra que un modelo con tokenizador, lo que encarece el despliegue en tareas de generacion larga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbstractPhil/mini-beatrix-3
- No se han encontrado en la busqueda web enlaces relevantes adicionales: ni paper, ni blog tecnico, ni repositorio de codigo independiente, ni demo asociados a este modelo.
