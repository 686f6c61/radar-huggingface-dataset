# hiwaifu-research/WaifuGemma4-26b-a4b-v1-i1-GGUF

## Resumen

WaifuGemma4-26b-a4b-v1-i1-GGUF es el conjunto de cuantizaciones GGUF con imatrix del modelo WaifuGemma4-26b-a4b-v1, desarrollado por hiwaifu-research sobre la base de Gemma 4 26B-A4B. Se trata de un modelo de mezcla de expertos (MoE) con 25.233.142.046 parametros totales (25,2 B) y aproximadamente 3,8 B parametros activos por token, especializado en generacion de texto conversacional y role-play. El repositorio no contiene un modelo nuevo, sino las versiones cuantizadas en formato GGUF para su ejecucion con llama.cpp, incluida una matriz de importancia (imatrix) para quien quiera generar sus propias cuantizaciones.

El modelo subyacente fue post-entrenado con GRPO contra un modelo de recompensa aprendido a partir de 1,2 millones de votos ciegos emitidos por usuarios reales en la HiWaifu Arena. Segun la model card, en enfrentamientos ciegos directos reparte votos al 50 % con GLM-5.1 y supera al Gemma 4 26B-A4B-it sin ajustar en el 59,7 % de los casos. El interes practico de este repositorio esta en que las cuantizaciones imatrix reducen aproximadamente a la mitad la divergencia respecto a bf16 en comparacion con las cuantizaciones estaticas equivalentes: i1-Q4_K_M presenta una KLD media de 0,069425 frente a 0,150663 de la Q4_K_M estatica, ambas con un tamano de 16,8 GB.

La relevancia actual del lanzamiento reside en la combinacion de un MoE con solo 3,8 B parametros activos y cuantizaciones que caben en GPU de consumo (desde 10,4 GB hasta 26,9 GB), lo que permite ejecutar localmente un modelo conversacional afinado para role-play en ocho idiomas sin depender de servicios en la nube. El modelo esta entrenado y evaluado en modo sin razonamiento (non-thinking) y el modelo base admite una ventana de contexto de 256K, aunque el ajuste se hizo sobre conversaciones de 8K tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, derivada de Gemma 4 26B-A4B |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | 3,8 B |
| Longitud de contexto | 256K en el modelo base; entrenado con conversaciones de 8K tokens; el ejemplo oficial de llama.cpp usa `-c 16384` |
| Tipos de cuantizacion | GGUF imatrix (i1): Q4_K_M, Q4_K_S, IQ4_XS, IQ3_M, IQ3_XXS, IQ2_M. Estaticas (repo hermano): Q8_0, Q6_K, Q5_K_M, Q4_K_M. Incluye fichero `imatrix.gguf` para generar cuantizaciones propias |
| Idiomas soportados | Ingles (en), espanol (es), ruso (ru), portugues (pt), indonesio (id), arabe (ar), thai (th), frances (fr) |
| Licencia | gemma |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo Gemma 4 26B-A4B, un transformer con capas de mezcla de expertos: 25,2 B parametros almacenados de los que se activan unos 3,8 B por token. Esta relacion entre parametros totales y activos es lo que permite que cuantizaciones de 10-17 GB mantengan una velocidad de decodificacion propia de un modelo mucho mas pequeno, a costa de requerir memoria suficiente para alojar todos los expertos. El repositorio en si es una cuantizacion del modelo base hiwaifu-research/WaifuGemma4-26b-a4b-v1 y no aporta cambios arquitectonicos; las capas, el numero de expertos y la composicion exacta del bloque MoE no se detallan en la informacion disponible.

En cuanto al entrenamiento, el modelo base fue post-entrenado con GRPO (Group Relative Policy Optimization) contra un modelo de recompensa aprendido de 1,2 millones de votos ciegos de usuarios reales en la HiWaifu Arena. Es un ajuste orientado a preferencias conversacionales y de role-play, no un ajuste de seguridad: la model card indica explicitamente que no hay entrenamiento de seguridad mas alla del Gemma 4 base. El modelo fue entrenado y evaluado en modo sin razonamiento, por lo que se recomienda pasar `--reasoning-budget 0` para que la plantilla inserte el canal de pensamiento vacio que el modelo espera. Los detalles completos del pipeline de entrenamiento, la composicion del dataset y el numero de tokens utilizados no estan disponibles en la informacion proporcionada.

Las cuantizaciones i1 se generaron con una matriz de importancia (imatrix) calibrada sobre respuestas de role-play escritas por el propio modelo en diez idiomas, excluidas del conjunto de calibracion. La evaluacion de calidad se realizo con `llama-perplexity --kl-divergence` contra el GGUF bf16, midiendo la divergencia KL media de la distribucion de siguiente token, la coincidencia top-1 y la perplejidad propia de cada cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno con foco en role-play y mantenimiento de personaje.
- Role-play de personaje definido mediante system prompt (funciona con una character card sencilla).
- Conversaciones de larga duracion: la tasa de victoria en la arena aumenta con la profundidad de la conversacion, por lo que historiales largos son viables.
- Capacidades multilingues en ocho idiomas: ingles, espanol, ruso, portugues, indonesio, arabe, thai y frances.
- Entrada de imagenes mediante el proyector `mmproj-WaifuGemma4-26b-a4b-v1-f16.gguf` disponible en el repositorio de cuantizaciones estaticas (se pasa con `--mmproj`). El entrenamiento no toco la entrada de imagen y no se ha evaluado para role-play.
- Control de longitud de respuesta: por defecto genera 400-500 tokens; responde a instrucciones explicitas del tipo "Respond in no more than N tokens." en el system prompt.
- Control de contenido maduro: el contenido adulto se rige por el system prompt, sin ajuste de seguridad adicional.
- Compatibilidad con clientes que consumen una API compatible con OpenAI (por ejemplo, SillyTavern apuntando a `http://localhost:8080/v1`).

No se documenta soporte de tool calling, function calling, uso de agentes, multi-step reasoning ni modo de razonamiento explicito; de hecho, el modelo se entreno y evaluo sin modo de pensamiento.

## Casos de uso

- Role-play conversacional en aplicaciones de compania IA: es el caso de uso principal del modelo. Con el system prompt adecuado mantiene un personaje de forma consistente a lo largo de conversaciones largas, y su tamano activo de 3,8 B permite servir respuestas con latencia baja en una sola GPU.
- Sustitucion local de servicios en la nube para apps de personajes: una plataforma tipo HiWaifu puede desplegar la cuantizacion i1-Q4_K_M (16,8 GB) en una GPU de 24 GB y atender peticiones de personajes sin enviar conversaciones de usuarios a terceros.
- Escritura creativa colaborativa e ficcion interactiva: el modelo produce respuestas de 400-500 tokens por defecto, un tamano adecuado para narrativa por turnos; se puede ajustar con instrucciones de longitud en el system prompt.
- Localizacion de contenido conversacional: al cubrir ocho idiomas con soporte nativo, sirve para generar o adaptar dialogos de personajes en espanol, portugues, frances, ruso, arabe, thai o indonesio sin pasar por un traductor externo.
- Simulacros de conversacion y entrenamiento en habilidades sociales: se puede configurar un personaje con un rol concreto y practicar interacciones repetibles, con historial largo para mantener el contexto del escenario.
- Prototipado rapido de agentes conversacionales con personalidad: al ser un GGUF ejecutable con llama.cpp, permite iterar sobre system prompts y character cards en local antes de decidir un despliegue mayor.
- Evaluacion comparativa de sistemas de recompensa: el modelo nace de un pipeline de GRPO contra votos humanos, por lo que resulta util como referencia en experimentos de alineacion y preferencias en dominios conversacionales.
- Generacion de dialogos para videojuegos o novelas visuales: el control de longitud y la estabilidad de personaje permiten generar lotes de lineas de dialogo por escena, siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento publicados son comparaciones ciegas de arena y metricas de calidad de cuantizacion.

Resultados de arena (segun la model card del modelo base):

| Comparativa | Resultado |
|---|---|
| Frente a GLM-5.1 en enfrentamientos ciegos directos | Reparto de votos al 50 % |
| Frente a Gemma 4 26B-A4B-it sin ajustar | Gana el 59,7 % de las veces |
| Base de la senal de recompensa | 1,2 millones de votos ciegos de usuarios reales |

Calidad de las cuantizaciones imatrix (KLD media frente a bf16, coincidencia top-1 y perplejidad sobre respuestas de role-play):

| Cuantizacion | Tamano (GB) | KLD media vs bf16 | Coincidencia top-1 | PPL (respuestas de rol) | Notas |
|---|---:|---:|---:|---:|---|
| i1-Q4_K_M | 16,8 | 0,0694 | 91,0 % | 5,80 | Recomendada; mitad de KLD que la Q4_K_M estatica al mismo tamano |
| i1-Q4_K_S | 15,5 | 0,0727 | 90,2 % | 5,84 | Recomendada; algo mas pequena |
| i1-IQ4_XS | 13,9 | 0,1015 | 89,3 % | 6,11 | Recomendada para tarjetas de 16 GB |
| i1-IQ3_M | 12,4 | 0,1455 | 86,0 % | 6,00 | Iguala la calidad de la Q4_K_M estatica en 12,4 GB |
| i1-IQ3_XXS | 11,3 | 0,3314 | 78,2 % | 6,34 | Perdida apreciable; para tarjetas de 12 GB |
| i1-IQ2_M | 10,4 | 0,3997 | 77,4 % | 6,82 | Mayor perdida del conjunto; para tarjetas de 12 GB |
| imatrix | 0,06 | no aplica | no aplica | no aplica | Matriz de importancia para generar cuantizaciones propias |

Cuantizaciones estaticas del repositorio hermano, como referencia:

| Cuantizacion | Tamano (GB) | KLD media vs bf16 | Coincidencia top-1 | PPL (respuestas de rol) | Notas |
|---|---:|---:|---:|---:|---|
| Q8_0 | 26,9 | 0,0098 | 96,5 % | 5,85 | La mas cercana a bf16; requiere 32 GB+ de VRAM o RAM de CPU |
| Q6_K | 22,6 | 0,0225 | 94,3 % | 5,76 | Punto dulce si hay memoria suficiente |
| Q5_K_M | 19,1 | 0,0581 | 91,3 % | 6,11 | Buena |
| Q4_K_M | 16,8 | 0,1507 | 85,9 % | 6,12 | Rapida; la i1-Q4_K_M es claramente mejor al mismo tamano |

La metodologia de estas metricas: 20 fragmentos de 512 tokens de respuestas de role-play generadas por el propio modelo en diez idiomas, excluidas del conjunto de calibracion de la imatrix.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,4 GB (i1-IQ2_M) y 26,9 GB (Q8_0), segun la cuantizacion. Con GPU de 12 GB, las opciones viables son i1-IQ2_M (10,4 GB) e i1-IQ3_XXS (11,3 GB), ambas con perdida de calidad apreciable. Con 16 GB, la opcion recomendada es i1-IQ4_XS (13,9 GB) o i1-Q4_K_S (15,5 GB). Con 24 GB, i1-Q4_K_M (16,8 GB) es la recomendada y deja margen para contexto. Con 32 GB o mas, Q6_K (22,6 GB) y Q8_0 (26,9 GB).
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para las cuantizaciones i1 de 4 bits; A100 40 GB o H100 para Q6_K y Q8_0 con contexto amplio; RTX 4080 / 4070 Ti Super (16 GB) para i1-IQ4_XS.
- Cabe en GPU de consumo: si. En tarjetas de 12 GB solo con cuantizaciones de 2-3 bits (con perdida notable); en 16 GB con IQ4_XS; en 24 GB con Q4_K_M de forma holgada.
- Opciones de despliegue: llama.cpp (`llama-server`, incluida la descarga directa con `-hf hiwaifu-research/WaifuGemma4-26b-a4b-v1-i1-GGUF:Q4_K_M`), asi como cualquier runtime compatible con GGUF (Ollama, LM Studio, koboldcpp). El cliente se conecta a la API compatible con OpenAI en `http://localhost:8080/v1`. Formato GGUF, por lo que no es directamente compatible con vLLM o TGI sin conversion.
- Parametros de ejecucion recomendados: `--jinja --reasoning-budget 0 -c 16384 -ngl 99`. Muestreo: temperatura 1,0, top-p 0,95, top-k 64 (valores por defecto publicados); el rango 0,8-1,0 funciona.
- Latencia y throughput estimados: no disponibles. El autor no publica cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WaifuGemma4-26b-a4b-v1 (este modelo, cuantizado) | 25,2 B totales, 3,8 B activos | Entrenado a 8K; base admite 256K | Reparte votos al 50 % con GLM-5.1; gana al Gemma 4 26B-A4B-it el 59,7 % | gemma | GGUF en HF (este repo y el de cuantizaciones estaticas) |
| Gemma 4 26B-A4B-it (sin ajustar) | 25,2 B totales, 3,8 B activos (misma base) | 256K | Pierde el 59,7 % de los enfrentamientos ciegos contra WaifuGemma4 | gemma | Pesos originales de Google; no incluido en esta busqueda |
| GLM-5.1 | No disponible en la informacion proporcionada | No disponible | Empate al 50 % de votos en enfrentamientos ciegos de role-play | No disponible | No disponible |

No se dispone de datos de parametros, contexto ni licencia de GLM-5.1 en la informacion proporcionada, por lo que la comparativa se limita al resultado de arena publicado. Tampoco se han identificado otros modelos de role-play comparables en la busqueda web realizada.

## Limitaciones y advertencias

- Contenido para adultos: la model card indica explicitamente "18+ use only" y que el contenido maduro sigue lo que diga el system prompt. No hay ajuste de seguridad mas alla del Gemma 4 base.
- Ausencia de benchmarks estandar: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede evaluar su rendimiento en tareas de razonamiento, codigo o matematicas. El modelo esta optimizado para conversacion y role-play, no para esas tareas.
- Riesgo de alucinacion: al ser un modelo conversacional sin evaluacion factual publicada, no hay garantia de veracidad en afirmaciones sobre hechos. No debe usarse como fuente de informacion sin verificacion.
- Contexto efectivo menor que el nominal: el modelo base admite 256K tokens, pero el ajuste se hizo sobre conversaciones de 8K tokens. El ejemplo oficial usa `-c 16384`. No hay evaluacion publicada del comportamiento mas alla de ese rango.
- Modo de razonamiento desactivado: el modelo fue entrenado y evaluado en modo non-thinking; hay que pasar `--reasoning-budget 0` o el comportamiento puede degradarse. No es adecuado para tareas que requieran cadena de pensamiento explicita.
- Vision sin evaluar: la entrada de imagenes funciona a traves del `mmproj`, pero el entrenamiento no la toco y no se ha evaluado para role-play. Su calidad en ese escenario es desconocida.
- Licencia Gemma: la licencia `gemma` impone sus propios terminos de uso, incluida una politica de uso prohibido. Es imprescindible revisarla antes de cualquier uso comercial o de redistribucion.
- Idioma: aunque se listan ocho idiomas, la model card y las metricas de calidad estan publicadas en ingles. No hay evaluacion especifica por idioma, por lo que la calidad en espanol, arabe o thai no esta cuantificada.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, sin senales de uso en produccion ni de validacion por parte de terceros.
- Dependencia de la version de llama.cpp: los GGUF se generaron con el build `4fea119` (septiembre de 2026); versiones antiguas pueden no soportarlos correctamente.

## Enlaces

- Repositorio HuggingFace (cuantizaciones imatrix i1): https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1-i1-GGUF
- Modelo base: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1
- Repositorio de cuantizaciones estaticas (incluye el proyector de vision `mmproj-WaifuGemma4-26b-a4b-v1-f16.gguf`): https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1-GGUF
- Fichero de cuantizacion recomendada i1-Q4_K_M: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1-i1-GGUF/resolve/main/WaifuGemma4-26b-a4b-v1.i1-Q4_K_M.gguf
- Matriz de importancia (imatrix): https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1-i1-GGUF/resolve/main/WaifuGemma4-26b-a4b-v1.imatrix.gguf
- Sitio del desarrollador: https://www.hiwaifu.com/fr/create/persona
- Aplicacion Hiwaifu: https://hiwaifu.org/
- Documentacion de Hiwaifu: https://docs.hiwaifu.com/
- Aplicacion en Google Play: https://play.google.com/store/apps/details?id=com.hiwaifu.app
- llama.cpp (runtime recomendado para GGUF): https://github.com/ggml-org/llama.cpp
