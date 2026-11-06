# Robin1333k/Qwen3.5-4B-Base-MLX-6bit

## Resumen

Qwen3.5-4B-Base-MLX-6bit es una cuantizacion en 6 bits del modelo base Qwen/Qwen3.5-4B-Base, publicada por el usuario Robin1333k para inferencia en dispositivos con Apple Silicon mediante la libreria MLX. No se trata de un fine-tune ni de una variante entrenada de forma distinta: los pesos son los del modelo base de Qwen, convertidos con cuantizacion afin de 6 bits y tamano de grupo 64. El repositorio ocupa 3,4 GB y el modelo cuenta con 4.205.751.296 parametros totales.

El modelo se publica con un proposito muy concreto: servir como motor de autocompletado de texto inline en macOS dentro de una aplicacion llamada AutoComplete. La model card insiste en que debe usarse como modelo base, pasando el prefijo de texto en crudo, sin plantilla de chat y sin token BOS, con decodificacion voraz y una penalizacion de repeticion de 1.15. Su relevancia practica radica en que demuestra un caso de uso de prediccion de texto a baja latencia y en memoria modesta sobre hardware de consumo Apple, con metricas de calidad y latencia medidas.

La informacion disponible no incluye detalles sobre la arquitectura interna del modelo base, los datos de entrenamiento ni resultados de benchmarks estandar. Lo que se ofrece son mediciones propias de la aplicacion para la que se construyo, centradas en calidad de sugerencias y latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5; familia qwen3_5 segun tags) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, afin, tamano de grupo 64 (MLX) |
| Idiomas soportados | en, de (medidos por el autor) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Qwen3.5-4B-Base (tipo de transformer, atencion, capas, etc.). Lo que si se especifica es el proceso de conversion: los pesos oficiales de Qwen se transformaron con MLX aplicando cuantizacion afin de 6 bits con grupo de 64, cuantizando unicamente los pesos. El autor subraya que no hay fine-tune, por lo que el comportamiento es el del modelo base original.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base. Tampoco se describe ninguna innovacion tecnica propia de esta publicacion mas alla de la propia cuantizacion MLX y la metodologia de medida del autor.

## Capacidades

- Generacion y continuacion de texto: el modelo esta pensado para continuar un prefijo dado, unas pocas palabras por vez, sin plantilla de chat.
- Autocompletado inline: funciona como motor de prediccion de texto en linea dentro de una aplicacion de macOS.
- Inferencia en dispositivo sobre Apple Silicon mediante MLX.
- Soporte multilingue limitado a los idiomas medidos: ingles y aleman.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Al ser un modelo base, no responde a instrucciones conversacionales de forma fiable; la propia model card advierte que una plantilla de chat lo hace responder preguntas en lugar de continuar texto.

## Casos de uso

- Autocompletado de texto inline en macOS: es el uso para el que se construyo; el modelo continua el prefijo que el usuario esta escribiendo, unas pocas palabras por vez, con latencia de primera palabra de 131 ms (P50) y 145 ms (P90) en un Mac de 32 GB.
- Prediccion de siguiente clausula en editores de texto o campos de formulario: con decodificacion voraz, penalizacion de repeticion de 1.15 y parada en el primer limite de clausula, encaja en interfaces que sugieren fragmentos cortos.
- Asistencia de escritura multilingue en ingles y aleman: la evaluacion muestra 0,734 palabras aceptadas por inicio en ingles y 0,521 en aleman sobre prosa reservada, lo que lo hace util en aplicaciones de redaccion para ambos idiomas.
- Prototipado de funciones de texto en aplicaciones Swift/macOS: al usar mlx-swift-lm, se integra en procesos nativos con un consumo de memoria de proceso de unos 3,4 GB tras la carga.
- Pruebas de continuacion de texto en entornos con memoria limitada: con 3.260 MB de memoria MLX activa tras la carga, cabe en equipos Apple Silicon de 32 GB y, segun el autor, no se midio en Macs de 8 GB.
- Evaluacion comparativa de cuantizaciones MLX: sirve como referencia para comparar el efecto de 6 bits frente a modelos mayores o menores (existe un hermano de 2B cuantizado igual) en tareas de prediccion corta.
- Generacion de texto base para experimentos de investigacion: util como punto de partida para estudiar continuacion de texto sin las convenciones de un modelo instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor aporta mediciones propias de calidad de sugerencias y latencia.

Calidad de sugerencias (palabras aceptadas por inicio; mayor es mejor):

| Corpus | Idioma | 2B | Este modelo (4B) | Mejor / peor | p |
|---|---|---|---|---|
| Prosa reservada (351 inicios) | Aleman | 0,383 | 0,521 | 21 / 6 | 0,006 |
| Prosa reservada | Ingles | 0,636 | 0,734 | 23 / 9 | 0,020 |
| Prosa reservada | Ambos | 0,512 | 0,632 | 44 / 15 | 0,0002 |
| Split-author (192 inicios) | Aleman | 0,312 | 0,427 | 10 / 3 | 0,092 |
| Split-author | Ingles | 0,760 | 0,854 | 10 / 6 | 0,454 |
| Split-author | Ambos | 0,536 | 0,641 | 20 / 9 | 0,061 |

Latencia (medida en proceso con mlx-swift-lm 3.31.3 sobre 40 prompts cortos, cada uno predicho dos veces):

| Modelo | Primer token P50 / P90 | Sugerencia completa P50 / P90 | Carga desde cache de fichero |
|---|---|---|---|
| Qwen3.5-2B-Base 6-bit | 75 / 82 ms | 161 / 316 ms | 2,6 s |
| Qwen3.5-4B-Base 6-bit (este) | 131 / 145 ms | 245 / 405 ms | 2,6 s |

Memoria:

| Estado | Medido |
|---|---|
| Memoria MLX activa tras la carga | 3.260 MB |
| Memoria de proceso (phys_footprint) tras la carga, en la app | unos 3,4 GB |
| Memoria de proceso durante una prediccion con prompt de 512 tokens, en la app | 4.416 MB |
| Memoria de proceso tras el vaciado de cache en reposo de la app | unos 3,4 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 3,3 GB de memoria MLX activa tras la carga; unos 3,4 GB de memoria de proceso en la app; hasta 4.416 MB durante una prediccion con prompt de 512 tokens.
- Hardware de referencia: un Apple Silicon Mac con 32 GB de memoria, ejecutando el modelo en solitario.
- El autor no midio Macs antiguos ni equipos de 8 GB; por tanto, no hay dato confirmado de que quepa en un Mac de 8 GB.
- GPU recomendadas: no disponible para GPU NVIDIA (A100, H100, RTX 4090); el modelo esta orientado a Apple Silicon.
- Despliegue: libreria MLX; en la aplicacion de referencia se uso mlx-swift-lm 3.31.3. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia: primera palabra 131 ms (P50) y 145 ms (P90); sugerencia completa de hasta 24 tokens en 245 ms (P50) y 405 ms (P90).
- Carga desde cache de fichero: 2,6 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Base-MLX-6bit (este) | 4.205.751.296 | no disponible | 6 bits MLX, grupo 64 | Apache 2.0 | Hugging Face (35 descargas) | Calidad de sugerencia 0,632 (ambos idiomas, prosa reservada); primera palabra 131 ms P50 |
| Qwen3.5-2B-Base-MLX-6bit | no disponible (aprox. 2B) | no disponible | 6 bits MLX | Apache 2.0 | Hugging Face | Calidad 0,512; primera palabra 75 ms P50; unos 1,5 GB de memoria MLX |
| Qwen/Qwen3.5-4B-Base | 4.205.751.296 | no disponible | pesos originales | Apache 2.0 | Hugging Face | Modelo base sin cuantizar del que deriva este repositorio |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene conversaciones de forma fiable; usar una plantilla de chat hace que responda preguntas en lugar de continuar texto.
- Requiere convenciones de uso especificas: prefijo en crudo sin BOS, eliminacion de espacios finales antes de codificar, decodificacion voraz con penalizacion de repeticion de 1.15 y parada en el primer limite de clausula.
- Idiomas medidos solo ingles y aleman; el aleman sigue siendo el idioma mas debil a este tamano (0,521 frente a 0,734 en prosa reservada).
- Riesgo de alucinacion y de continuaciones incoherentes no cuantificado en la informacion disponible; al ser un modelo base, la calidad depende fuertemente del prefijo.
- Las cifras de calidad de la prosa reservada comparten prefijos entre cortes consecutivos, por lo que los p-valores sobrestiman la evidencia; el corpus split-author es la prueba mas limpia y sus resultados no son todos significativos (p de 0,092 y 0,454 en aleman e ingles).
- Las mediciones de memoria en la app provienen de una maquina virtual de macOS, no necesariamente de hardware fisico.
- No hay datos sobre sesgos conocidos ni sobre el rendimiento en otros idiomas distintos de ingles y aleman.
- Licencia Apache 2.0 heredada del modelo base; el autor no anade restricciones propias, pero conviene revisar la licencia original de Qwen para uso comercial.
- No se documenta soporte de tool calling, agentes, vision ni audio; no debe asumirse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Robin1333k/Qwen3.5-4B-Base-MLX-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Hermano de 2B: https://huggingface.co/Robin1333k/Qwen3.5-2B-Base-MLX-6bit
