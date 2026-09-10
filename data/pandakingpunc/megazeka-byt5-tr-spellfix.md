# pandakingpunc/megazeka-byt5-tr-spellfix

## Resumen

Megazeka-byt5-tr-spellfix es un adaptador LoRA sobre `google/byt5-small` orientado a la correccion ortografica, tipografica y gramatical ligera de texto en turco. Lo publica el usuario pandakingpunc como parte del proyecto Megazeka, que incluye tambien el conjunto de datos de entrenamiento `megazeka-tr-spellfix-pairs`, el codigo de inferencia y una aplicacion de escritorio. El modelo base es un transformer encoder-decoder del tipo T5 que opera directamente sobre bytes UTF-8, sin vocabulario subpalabra.

El problema que aborda es muy concreto: en turco la mayor parte de los errores de escritura son diacriticos (`ı/i`, `İ/I`, `ş/s`, `ğ/g`, `ç/c`, `ö/o`, `ü/u`) y, con tokenizadores subpalabra, una palabra corrupta y su version correcta acaban en espacios de tokens distintos. Al trabajar a nivel de byte, ByT5 evita esa fragmentacion, a cambio de alargar la secuencia (un caracter turco suele ocupar dos bytes).

Su relevancia es limitada y el propio autor la acota: se declara explicitamente como un experimento educativo entrenado en una unica RTX 4060, no como un corrector listo para produccion. El adaptador pesa unos 25 MB, se distribuye bajo licencia Apache 2.0 y solo cubre turco. La model card advierte de que no corrige contracciones coloquiales y de que las metricas de edicion son de definicion propia, no comparables con M2/ERRANT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 a nivel de byte (ByT5), con adaptador LoRA (PEFT) |
| Parametros totales | Adaptador LoRA de ~25 MB; el modelo base `google/byt5-small` es la variante small de ByT5 (recuento exacto no disponible en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el codigo de inferencia del autor trocea la entrada en fragmentos de como maximo 176 bytes UTF-8, sin contexto que cruce fronteras entre fragmentos |
| Tipos de cuantizacion | No se publican versiones cuantizadas. El adaptador se distribuye en safetensors; no hay releases GGUF, GPTQ ni bitsandbytes oficiales |
| Idiomas soportados | Turco (`tr`) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA sobre `google/byt5-small`, revision `68377bdc18a2ffec8a0533fef03b1c513a4dd49d`) |
| Libreria | PEFT (uso con Transformers) |
| Hiperparametros LoRA | r=16, alpha=32, dropout no disponible (campo truncado en la model card) |
| Pipeline declarado | `text-generation` en los tags de HuggingFace; `text2text-generation` en la model card |

## Arquitectura y entrenamiento

La arquitectura subyacente es ByT5-small, un transformer encoder-decoder con atencion completa que sustituye el vocabulario subpalabra de T5 por bytes UTF-8 crudos. Sobre ese modelo base se entrena un adaptador LoRA con r=16 y alpha=32. El autor justifica la eleccion de byte-level por el tipo de error dominante en turco: al no existir vocabulario, ningun caracter corrupto puede quedar fuera del espacio de tokens, a diferencia de lo que ocurre con tokenizadores subpalabra. El coste es la longitud de secuencia, ya que muchos caracteres turcos ocupan dos bytes.

El entrenamiento se realizo localmente en una sola RTX 4060, con el dataset `pandakingpunc/megazeka-tr-spellfix-pairs`, y se detuvo en el paso 1800, con 28.800 ejemplos procesados y una mejor perdida de validacion de 0.0554. La composicion del ruido de entrenamiento esta fuertemente desbalanceada: la operacion `türkçe_karakter` (diacriticos) aparece 13.292 veces, `gündelik` (ortografia informal) 1.001 veces y `de_da` solo 239 veces. El autor atribuye a ese desbalance el comportamiento observado: el modelo aprende a corregir diacriticos, mayusculas iniciales y puntuacion final, pero no normaliza contracciones coloquiales. No se menciona uso de RLHF ni DPO.

La innovacion practica no esta en el entrenamiento, sino en el envoltorio de inferencia del repositorio: decodificacion voraz determinista (`num_beams=1`, `do_sample=False`, `max_new_tokens=224`), troceado de la entrada en fragmentos de 176 bytes respetando espacios y saltos de linea, y un filtro limitador de cambios que descarta la generacion y conserva el original si la ratio de edicion de caracteres supera el 45%, si la salida es menor que el 65% de la entrada, si queda vacia o si no se emitio token EOS.

## Capacidades

- Correccion de diacriticos ausentes o erroneos: `cok` → `çok`, `yarin` → `Yarın`, `arkadaslarla` → `arkadaşlarla`.
- Correccion de mayusculas, en particular la capitalizacion de inicio de frase.
- Insercion de puntuacion final ausente.
- Correccion de espaciado y de errores comunes de teclado, segun la descripcion del autor.
- Generacion texto-a-texto con salida practicamente identica a la entrada cuando el texto ya es correcto (ejemplo de la model card: `Bu cümle zaten doğru yazılmış.` devuelve lo mismo).
- Tratamiento robusto de caracteres corruptos gracias al modelado a nivel de byte, sin fallos por tokens fuera de vocabulario.
- Conservacion de saltos de linea y parrafos vacios durante el troceado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: el adaptador esta entrenado exclusivamente para turco.
- No tiene modo de razonamiento, vision, audio ni ninguna capacidad multimodal.

## Casos de uso

- Post-procesado de transcripciones ASR en turco: las salidas de reconocimiento de voz suelen perder diacriticos; pasar cada fragmento por el modelo restaura `ç`, `ş`, `ğ`, `ı`, `ö` y `ü` antes de almacenar o indexar el texto. El troceado a 176 bytes encaja bien con segmentos cortos de habla.
- Limpieza de corpus para entrenamiento de otros modelos: normalizar texto scrapeado de redes sociales y foros turcos (donde los diacriticos se omiten sistematicamente) para reducir la dispersion de vocabulario antes de entrenar un modelo propio.
- Post-OCR de documentos turcos: los motores OCR confunden con frecuencia `ı` con `i` y omiten cedillas y breves; el adaptador corrige esos caracteres conservando la estructura de parrafos, ya que respeta saltos de linea y parrafos vacios.
- Correccion ortografica integrada en aplicaciones de escritorio: el autor publica una app de escritorio junto al modelo, y el adaptador de 25 MB puede empaquetarse localmente sin depender de servicios en la nube ni enviar texto del usuario a terceros.
- Normalizacion de consultas de busqueda en turco: igualar `cok` y `çok` en el indice y en la consulta mejora el recall en buscadores y sistemas de recuperacion documental en turco.
- Herramientas educativas de aprendizaje de turco: dado que deja intacto el texto ya correcto y solo anade diacriticos, mayusculas y puntuacion, sirve como corrector de refuerzo para estudiantes que escriben en teclados sin esas teclas.
- Preprocesado antes de traduccion automatica: normalizar la ortografia de la fuente turca reduce el ruido de entrada en sistemas de traduccion turco-espanol o turco-ingles.
- Procesamiento por lotes de bajo coste: al ser un adaptador pequeno sobre un modelo small, puede ejecutarse en CPU o en una GPU de gama baja para normalizar grandes volumenes de texto sin coste de API.

## Benchmarks y rendimiento

Datos declarados por el autor. El conjunto de test retenido consta de 640 pares derivados de 160 frases objetivo que no aparecen en ningun otro split. Las metricas del `model-index` estan marcadas como no verificadas (`verified: false`).

| Metrica | Copiar entrada | ByT5 sin entrenar | Este adaptador (con filtro) | Sin filtro |
|---|---:|---:|---:|---:|
| CER (menor es mejor) | 0.0929 | 0.0929 | 0.0511 | 0.0193 |
| WER (menor es mejor) | 0.3492 | 0.3492 | 0.1328 | 0.0982 |
| Exact match (mayor es mejor) | 25.2 % | 25.2 % | 60.6 % | 63.3 % |
| Edit F1 (mayor es mejor) | 0.000 | 0.000 | 0.623 | 0.856 |
| Sobrecorreccion (menor es mejor) | 0.0 % | 100.0 % | 2.5 % | 2.5 % |

Notas del autor sobre la tabla: ByT5 sin entrenar produce un CER bruto de 3.66 y reescribe todas las entradas, por lo que el filtro limitador de cambios devuelve la entrada en el 100 % de los ejemplos y su columna "protegida" coincide con la linea base de copiar. La columna "sin filtro" corresponde a la generacion cruda con el filtro desactivado. La sobrecorreccion se mide sobre los 161 ejemplos del test en los que la entrada ya coincide con el objetivo. Las metricas de precision, recall y F1 de edicion comparan conjuntos de ediciones de Levenshtein `(posicion original, operacion, caracter)` y son de definicion propia del proyecto: el autor advierte que no son comparables con las metricas estandar M2/ERRANT F0.5 de correccion gramatical. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 25 MB, segun la propia model card.
- El modelo base `google/byt5-small` es un modelo de la familia small (del orden de cientos de millones de parametros); el peso en memoria depende de la precision elegida y del recuento exacto de parametros, no disponible en la model card.
- Entrenamiento realizado en una unica RTX 4060 (GPU de consumo), lo que da una cota superior clara del coste de ajuste.
- Inferencia viable en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para lotes pequenos o moderados, dado el tamano reducido del conjunto adaptador mas base.
- En GPU de centro de datos (A100, H100) el modelo queda muy sobredimensionado en hardware; solo tendria sentido para servir muchas peticiones concurrentes.
- Despliegue mediante Transformers + PEFT, que es el flujo documentado en la model card. TGI y vLLM admiten adaptadores LoRA sobre modelos T5, pero no hay configuraciones publicadas ni validadas por el autor para este adaptador.
- llama.cpp y Ollama no son opciones directas, ya que no se publica conversion a GGUF ni soporte declarado para ByT5.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo por peticion.

## Comparativa con modelos similares

No se dispone de datos publicados de otros correctores ortograficos para turco en la informacion proporcionada, por lo que la comparativa externa se limita a las variantes internas del propio experimento y a la linea base trivial.

| Sistema | Parametros | Contexto | CER | WER | Exact match | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este adaptador (con filtro) | ~25 MB de LoRA + ByT5-small | Fragmentos de 176 bytes UTF-8 | 0.0511 | 0.1328 | 60.6 % | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| Este adaptador (sin filtro) | ~25 MB de LoRA + ByT5-small | Fragmentos de 176 bytes UTF-8 | 0.0193 | 0.0982 | 63.3 % | Apache 2.0 | Mismo repositorio, filtro desactivado |
| `google/byt5-small` sin adaptar | ByT5-small | No aplica | 0.0929 en la columna protegida (CER bruto 3.66) | 0.3492 en la columna protegida | 25.2 % | Apache 2.0 | HuggingFace |
| Copiar la entrada (linea base trivial) | 0 | No aplica | 0.0929 | 0.3492 | 25.2 % | No aplica | No aplica |
| Otros correctores turcos (p. ej. modelos GEC turcos publicos) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El autor declara explicitamente que es un pequeno experimento educativo y no un corrector de nivel de produccion.
- No corrige contracciones coloquiales del futuro (`gidicem` → `gideceğim`, `buluşcaz` → `buluşacağız`, `gidicez` → `gideceğiz`) ni el clitico separado (`sonrada` → `sonra da`). Es consecuencia directa del desbalance del dataset: 13.292 ejemplos de diacriticos frente a 1.001 de ortografia informal y 239 de `de_da`.
- Riesgo de alucinacion y de reescritura infiel: el filtro limitador de cambios solo descarta reescrituras grandes (ratio de edicion superior al 45 %, salida menor del 65 % de la entrada, salida vacia o ausencia de EOS); no garantiza en ningun caso la preservacion del significado.
- El filtro tambien bloquea algunas correcciones correctas, y su aplicacion cuesta exact match: 60.6 % con filtro frente a 63.3 % sin filtro.
- Exact match del 60.6 %: aproximadamente cuatro de cada diez salidas no coinciden exactamente con la referencia, aunque el CER sea bajo.
- Sobrecorreccion del 2.5 % sobre los ejemplos que ya eran correctos.
- Riesgo de sesgo de dominio: el modelo reproduce la distribucion del dataset de entrenamiento, generado de forma sintetica por el propio autor, no verificado contra texto turco real de produccion.
- Solo turco. No se debe asumir ningun comportamiento fiable en otros idiomas, aunque el modelo base ByT5 sea multilingue a nivel de byte.
- Limitacion de contexto: no hay contexto que atraviese las fronteras entre fragmentos, por lo que no se aprovecha informacion de frases vecinas al corregir.
- Las metricas del `model-index` figuran como no verificadas (`verified: false`) y proceden del propio autor.
- La metrica Edit F1 es de definicion propia del proyecto y no es comparable con M2/ERRANT F0.5, segun advierte la model card.
- El repositorio no tiene descargas ni likes y su tamano es de 0.0 GB, lo que indica ausencia de validacion independiente por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantias tecnicas hace desaconsejable su uso en produccion sin una evaluacion propia sobre datos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pandakingpunc/megazeka-byt5-tr-spellfix
- Dataset de entrenamiento: https://huggingface.co/datasets/pandakingpunc/megazeka-tr-spellfix-pairs
- Codigo, aplicacion de escritorio e informe tecnico: https://github.com/pandakingpunc/megazeka
- Modelo base: https://huggingface.co/google/byt5-small
- Revision del modelo base usada en el entrenamiento: `68377bdc18a2ffec8a0533fef03b1c513a4dd49d`
- Resultados de la busqueda web: no se ha encontrado ningun resultado relacionado con este modelo; las referencias devueltas tratan sobre herramientas de generacion de presentaciones y no son pertinentes.
