# Livesport/rune-26b-a4b-v3-GGUF

## Resumen

Rune 26B-A4B v3 es un modelo de decisión desarrollado por Invergent que no genera texto libre: dado un estado (por ejemplo, un JSON) y una pregunta con un conjunto de opciones, devuelve una probabilidad para cada opción leyendo los logits de las letras asociadas en la primera posición generada. La ficha que nos ocupa, publicada por Livesport, es una compilación GGUF cuantizada a IQ3_M con importance matrix sobre los pesos bf16 originales de Rune v3, y es la única build GGUF de la versión v3 disponible en el momento de su publicación.

La arquitectura declarada es `gemma4`, con 30 bloques y mezcla de expertos (MoE) de 128 expertos con 8 activos por token, ventana deslizante de 1024 tokens y una longitud de contexto de 262.144 tokens. El recuento real de parámetros es de 25.233.142.046 (unos 25,2 mil millones), con pesos cuantizados a 3 bits IQ3_M repartidos en tres ficheros que suman 12,4 GB. El modelo es solo texto: la build no incluye la torre de visión de Gemma 4.

El interés práctico de esta ficha es doble. Por un lado, demuestra que un MoE de 25B puede servirse en producción en 2 GPU de 8 GB (Livesport lo hace sobre 2× Quadro RTX 4000 Turing con llama.cpp) manteniendo métricas competitivas frente a Jev 1.13. Por otro, documenta de forma inusualmente detallada el protocolo de decisión, la calibración de temperatura y el coste real de latencia por tamaño de estado, algo poco habitual en fichas de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4`, transformer con mezcla de expertos (MoE); 30 bloques, 128 expertos con 8 activos, atención de ventana deslizante de 1024 tokens |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | no disponible el recuento exacto; 8 de 128 expertos activos por token |
| Longitud de contexto | 262.144 tokens (contexto de entrenamiento declarado); en la practica documentada se sirve con `-c 16384` |
| Tipos de cuantizacion | IQ3_M (GGUF, `general.file_type = 27`, 658 tensores), cuantizada con `llama-quantize` e importance matrix de 295 entradas calculada sobre 250 fragmentos de texto de calibración no publicado; el repositorio solo publica esta cuantización |
| Idiomas soportados | en (inglés) y cs (checo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF dividido en 3 shards con `llama-gguf-split` (`rune-26b-a4b-v3-IQ3_M-00001-of-00003.gguf`, `...-00002-of-00003.gguf`, `...-00003-of-00003.gguf`) más un fichero `SHA256SUMS`; el repositorio upstream publica los pesos v3 en safetensors bf16 (51,6 GB) |

## Arquitectura y entrenamiento

La información disponible describe la arquitectura como `gemma4`: 30 bloques transformer con mezcla de expertos de 128 expertos y 8 activos por token, atención con ventana deslizante de 1024 tokens y un contexto declarado de 262.144 tokens. La plantilla de chat es la de Gemma 4 y va embebida en el propio fichero GGUF. No se detallan en esta ficha el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden a la ficha upstream de Rune 26B-A4B v3, que no forma parte de la información proporcionada.

Lo específico de esta publicación es la cuantización. Los pesos bf16 del repositorio `surogate/rune-26b-a4b-GGUF` se convirtieron a GGUF y se cuantizaron a IQ3_M con una importance matrix de 295 entradas calculada sobre 250 fragmentos de un texto de calibración de propósito general que no se ha publicado, lo que limita la reproducibilidad exacta del proceso. El resultado son 658 tensores repartidos en tres shards: basta con pasar el primero a llama.cpp, que carga los otros dos automáticamente. La build se probó con el commit `8212c78` de llama.cpp (CUDA 12.2, sm_75).

El protocolo de decisión (surogate decisions protocol v1) se implementa sobre `llama-server` con un adaptador propio: se renderiza un chat `[system, user]` con `enable_thinking=false`, se ordenan las opciones (en el modo `noul` de sí/no, A = falso y B = verdadero; en `score`, los niveles en orden ascendente), se ejecuta un único forward pass y se aplica un softmax con temperatura sobre las log-probabilidades de las letras de las opciones en la primera posición generada. La temperatura calibrada es T = 2, que altera las probabilidades pero nunca la opción elegida.

## Capacidades

- Clasificación y decisión sobre opciones cerradas: devuelve una probabilidad por opción, no texto libre.
- Modo `choice` para selección entre opciones arbitrarias, modo `noul` para preguntas binarias (A = falso, B = verdadero) y modo `score` para niveles ordenados de forma ascendente.
- Lectura de estado estructurado: acepta un estado compartido como cadena JSON y lo trata como datos, no como instrucciones.
- Generación de probabilidades calibradas: ECE de 0,020 a T = 2 sobre el conjunto medido por el autor de la cuantización.
- Multilingüe limitado a inglés y checo según la ficha del modelo; el conjunto de prueba interno mezcla preguntas en checo e inglés.
- Sin generación de texto: no produce explicaciones ni razonamiento, y la plantilla debe renderizarse con el modo de pensamiento desactivado.
- Sin capacidades de visión: la build contiene solo el modelo de lenguaje y no incluye la torre de visión de Gemma 4, por lo que no admite estados con imágenes.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso agéntico; su papel es el de componente de decisión dentro de un sistema mayor.

## Casos de uso

- Enrutamiento de decisiones en producción: Livesport lo sirve sobre 2× Quadro RTX 4000 detrás de una API compatible con `/v1/systemone`, lo que permite integrarlo como clasificador de decisión en un pipeline existente sin cambiar el contrato de la API.
- Clasificación de texto con opciones cerradas: con 88,0 % de acierto en SST-2, AG News y BoolQ (900 preguntas), es utilizable para tareas tipo análisis de sentimiento, categorización de noticias y preguntas booleanas cuando las clases se formulan como opciones.
- Enrutamiento de consultas en asistentes conversacionales: dado un estado con el historial y una pregunta con opciones (por ejemplo, "¿derivar a soporte humano o resolver en el chat?"), devuelve la probabilidad de cada ruta para aplicar un umbral configurable.
- Moderación y policy checks: el modo `noul` con A = falso y B = verdadero encaja con decisiones binarias de cumplimiento normativo, siempre que el estado se pase como JSON y se respete la separación entre datos e instrucciones.
- Puntuación de candidatos sobre escalas ordenadas: el modo `score` permite mapear un estado a niveles ascendentes, útil para priorización de incidencias o scoring de leads.
- Reutilización de estados largos con múltiples preguntas: con estados de ~8.900 tokens, la latencia medida es de 4,34 s para la primera pregunta y 4,75 s para tres preguntas del mismo estado, gracias a la reutilización del KV cache dentro de la petición; esto lo hace viable para paneles de decisión que evalúan varias preguntas sobre el mismo expediente.
- Sustitución de un modelo de decisión propietario: frente a Jev 1.13 vía OpenRouter, esta cuantización obtiene 5 errores en el conjunto interno de 143 preguntas frente a 11, y 93,5 % / 95,8 % en el subconjunto difícil y en los ítems en checo; es un caso realista de migración a inferencia local en hardware modesto.
- Despliegue en entornos con GPU de gama antigua: requerir 2× 8 GB con cuantización IQ3_M y caché KV en q8_0 permite ejecutarlo en Turing (sm_75) sin necesidad de Ampere o superior.

## Benchmarks y rendimiento

Precisión y calibración, medidas con este fichero exacto en DGX Spark y comparadas contra Jev 1.13 (OpenRouter) sobre los mismos ítems:

| Metrica | Rune v3 IQ3_M | Jev 1.13 |
|---|---|---|
| Conjunto interno (143 preguntas, checo e inglés), errores | 5 | 11 |
| Subconjunto difícil | 93,5 % | 82,6 % |
| Ítems en checo | 95,8 % | 91,7 % |
| Datos públicos (SST-2, AG News, BoolQ; 900 preguntas) | 88,0 % | 89,4 % |
| ECE de calibración a T = 2 | 0,020 | 0,047 |

Latencia medida en 2× Quadro RTX 4000 de 8 GB con llama.cpp `8212c78` y los flags documentados, una petición a la vez, mediana de 3:

| Tamano de estado | 1 pregunta | 3 preguntas |
|---|---|---|
| ~620 tokens | 0,57 s | 0,77 s |
| ~2.300 tokens | 1,18 s | 1,37 s |
| ~8.900 tokens | 4,34 s | 4,75 s |

Throughput de procesamiento de prompt: 2.098 tok/s a 2.000 tokens con `-ub 512` y 1.696 tok/s con `-ub 256`.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se ha medido el coste de precisión de IQ3_M frente a los pesos bf16 en el Decision Index.

## Requisitos de hardware

- VRAM: los pesos cuantizados ocupan 12,4 GB; según el autor, pesos más un contexto de 16k caben en 2× 8 GB usando `--swa-full` y caché KV en q8_0. El comportamiento en una única GPU no está documentado en la información disponible.
- GPU validadas: 2× Quadro RTX 4000 de 8 GB (Turing, sm_75), compilación de llama.cpp con CUDA 12.2. Livesport las usa en producción.
- GPU consumer: no hay validación documentada en GPU consumer. Por tamaño de pesos (12,4 GB), una GPU de 16 GB o más es el mínimo teórico para los pesos, pero el autor no publica medidas en ese escenario ni cifras de KV cache para contextos largos en una sola tarjeta.
- Memoria de host: `llama-server` necesita entre 0,3 y 0,5 GiB de memoria anónima; el modelo mapeado en memoria aparece como page cache y el kernel puede expulsarlo sin ralentizar la inferencia, porque los pesos residen en VRAM.
- Caché de prompt: debe fijarse `--cache-ram 0`, ya que de lo contrario la caché de prompt en host crece hasta 8 GiB por defecto.
- Opciones de despliegue: llama.cpp / `llama-server`, que es el runtime documentado y probado. No hay instrucciones publicadas para vLLM, TGI, Ollama u otros servidores en la información disponible, aunque al tratarse de GGUF serían compatibles con runtimes basados en llama.cpp.
- Comando de referencia del autor: `llama-server -m rune-26b-a4b-v3-IQ3_M-00001-of-00003.gguf -ngl 99 --split-mode layer -c 16384 -np 1 -fa on -ctk q8_0 -ctv q8_0 -b 512 -ub 512 --jinja --cache-ram 0`.
- Latencia y throughput: ver la tabla de la sección de benchmarks; el procesamiento de prompt ronda los 2.098 tok/s a 2k tokens con `-ub 512`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión (medida) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rune 26B-A4B v3 IQ3_M (esta ficha) | 25,2 B totales, 8 de 128 expertos activos | 262.144 tokens declarados; 16k en la configuración servida | 5 errores en 143 preguntas internas; 88,0 % en datos públicos; ECE 0,020 | apache-2.0 | GGUF IQ3_M en este repositorio; pesos bf16 upstream |
| Rune 26B-A4B v3 bf16 (`surogate/rune-26b-a4b-GGUF`) | 25,2 B | 262.144 tokens | no disponible en esta información (el autor remite a la ficha upstream) | apache-2.0 | safetensors bf16, 51,6 GB |
| Jev 1.13 (OpenRouter) | no disponible | no disponible | 11 errores en 143 preguntas internas; 89,4 % en datos públicos; ECE 0,047 | no disponible | servicio vía OpenRouter |

No se dispone de datos de otros modelos comparables de la misma categoría (clasificadores de decisión MoE de ~25B) en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera explicaciones, resúmenes o razonamiento explícito queda fuera de su alcance.
- Solo admite inglés y checo según la ficha; no hay datos de rendimiento en otros idiomas.
- Es una build exclusivamente de texto: no incluye la torre de visión de Gemma 4, por lo que los estados con imágenes no están soportados.
- La ficha del autor incluye un aviso explícito de que la reutilización de la caché de prompt cambia las respuestas, asociado al comportamiento de la atención de ventana deslizante de Gemma 4. El texto de esa advertencia aparece truncado en la información disponible, por lo que conviene consultar la ficha original antes de habilitar caché de prompt en producción.
- Un fallo del protocolo de lectura puede pasar desapercibido: si una letra de opción no aparece entre los 64 log-probabilities superiores, se le asigna una probabilidad cercana a 0. Esto ocurre de forma ocasional en preguntas muy confiadas, pero si sucede en todas las peticiones indica que la plantilla de chat no se está aplicando y que `llama-server` debe arrancarse con `--jinja`.
- La temperatura de calibración es T = 2, un valor fijado por el autor upstream y confirmado por Livesport sobre sus datos; usar otra temperatura invalida las cifras de ECE publicadas.
- No se ha medido la pérdida de precisión de IQ3_M frente a los pesos bf16 en el Decision Index, así que la degradación real por la cuantización de 3 bits es desconocida.
- El texto de calibración de la importance matrix no está publicado, lo que impide reproducir exactamente el proceso de cuantización.
- La única versión de llama.cpp validada es el commit `8212c78` con CUDA 12.2 y sm_75; otros commits o backends no están verificados.
- Licencia apache-2.0, que permite uso comercial, pero el modelo base y sus condiciones upstream deben verificarse por separado antes de desplegarlo.
- Al tratarse de un clasificador y no de un generador, el riesgo de alucinación se manifiesta como asignación de alta probabilidad a una opción incorrecta, no como texto inventado; en dominios sensibles conviene calibrar umbrales con datos propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Livesport/rune-26b-a4b-v3-GGUF
- Modelo base cuantizado: https://huggingface.co/surogate/rune-26b-a4b-GGUF
- Sitio del desarrollador de Rune: https://invergent.ai
- Commit de llama.cpp con el que se probó: https://github.com/ggml-org/llama.cpp/commit/8212c7802455255460ab8e18fc34754560031b34
