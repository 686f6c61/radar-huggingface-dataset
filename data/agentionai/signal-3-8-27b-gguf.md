# agentionai/Signal-3.8-27B-GGUF

## Resumen

Signal 3.8 27B es un ajuste fino (finetune) de Qwen3.8-27B publicado por AgentionAI en formato GGUF. Su objetivo no es ampliar capacidades, sino reducir la latencia y el gasto de tokens: según las mediciones del autor, genera un 57 % menos de tokens en las respuestas y un 52 % menos de tokens de razonamiento en modo thinking respecto al modelo base, manteniendo o mejorando la calidad medida. El modelo conserva la entrada de imagen del original, ya que el ajuste solo modifica la capa de salida de texto y deja intactos el codificador visual y el proyector.

El modelo tiene 27.320.697.856 parámetros (unos 27,32 mil millones) y es denso, por lo que no hay parámetros activos ni offload parcial: el tamano del fichero GGUF equivale a la VRAM necesaria. Se distribuye en seis niveles de cuantizacion, de IQ4_XS (13,27 GiB) a Q8_0 (27,05 GiB), todos construidos con una imatrix propia de AgentionAI y recetas de precisión por tensor denominadas Agention Precision.

Es relevante ahora porque ataca un coste que no siempre aparece en las comparativas de calidad: el número de tokens de salida y el tiempo total de respuesta. En escenarios de chat o de generación estructurada, donde el coste por token y la latencia dominan la factura, un modelo que responde en la mitad de tiempo con la misma exactitud en GSM8K cambia el cálculo de viabilidad. Además, el autor reporta mejoras de aceptación del decodificador especulativo (hasta +22 % de velocidad de decodificación en salidas JSON) gracias a que las respuestas del modelo ajustado son más predecibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (pipeline image-text-to-text); finetune de Qwen/Qwen3.8-27B. Detalles internos de la arquitectura base no disponibles |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, AP-Q6_K, AP-Q5_K_M, AP-Q4_K_XL, AP-Q4_K_M, AP-IQ4_XS (AP = Agention Precision, con imatrix propio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de texto) + mmproj-BF16.gguf (proyector de vision, 0,87 GiB) |

## Arquitectura y entrenamiento

El modelo es un finetune "minimamente invasivo" de Qwen3.8-27B. Según la model card, el entrenamiento se hizo por autodestilación: se tomaron las propias respuestas de Qwen3.8-27B generadas bajo una instrucción de ser directo y se usaron para ajustar el modelo, de modo que la versión publicada ya no necesita ese prompt. No se emplearon datos externos ni salidas de otros modelos. El ajuste afecta únicamente a la capa de salida de texto; el codificador de vision y el proyector quedan sin tocar, por lo que se reutiliza el mmproj-BF16.gguf original del modelo base.

Tecnicamente, el cambio persigue eliminar preámbulos, formato excesivo y narración explicativa sin truncar el contenido: el autor afirma que ninguna respuesta se cortó de forma prematura en un conjunto de 100 prompts de estilo (0 respuestas terminadas en encabezado o dos puntos, 0 bloques de código sin cerrar) y que ninguna traza de razonamiento de 50 salidas en modo thinking entró en bucle ni alcanzó el límite de tokens. Qwen3.8-27B incorpora además una cabeza de predicción multi-token (draft head) para decodificación especulativa, y las cuantizaciones se generaron con imatrix propio. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en modo directo, con respuestas mas breves que el modelo base (mediana de 104 tokens frente a 243 en prompts generales).
- Modo thinking opcional, con el mismo chat template de Qwen3.8; el razonamiento consume menos tokens (mediana de 74 frente a 153 en prompts generales).
- Razonamiento matematico: 98,3 % de exact match en GSM8K con thinking desactivado y 95,0 % con thinking activado.
- Generacion de codigo, con bloques de codigo correctamente cerrados y un 11 % menos de tokens que el base.
- Salidas estructuradas (JSON): el autor mide alta aceptacion del draft en este tipo de prompts, lo que indica respuestas muy predecibles.
- Vision: mantiene la entrada de imagen del modelo base (pipeline image-text-to-text) mediante el fichero mmproj-BF16.gguf.
- Compatibilidad con decodificacion especulativa mediante `--spec-type draft-mtp` en llama.cpp.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Idiomas soportados: no disponible.
- Capacidades de audio: no disponibles (no se mencionan).

## Casos de uso

- Asistentes conversacionales de alto volumen: al reducir un 57 % los tokens de respuesta y completar en menos de la mitad del tiempo total que el modelo base en el mismo hardware, baja directamente el coste por conversacion y el tiempo de espera percibido por el usuario.
- Generacion de codigo en herramientas de desarrollo: el modelo mantiene la calidad de Qwen3.8-27B con un 11 % menos de tokens, y puede servirse con `llama-server` para integrarse en un pipeline interno de revision o autocompletado.
- Extraccion de datos y salidas JSON: en prompts de salida estructurada la aceptacion del draft llega al 94 % con longitud 3 y al 87 % con longitud 4, lo que se traduce en decodificacion mas rapida y respuestas mas estables para tareas de parseo.
- Tutoria y verificacion matematica: el modo thinking conserva el razonamiento util gastando un 32 % menos de tokens en GSM8K, lo que permite desplegar un asistente de resolucion de problemas paso a paso con coste contenido.
- Analisis de documentos e imagenes: al conservar la entrada visual, sirve para describir capturas, leer diagramas o responder preguntas sobre imagenes, descargando junto al modelo el mmproj-BF16.gguf de 0,87 GiB.
- Despliegue local con requisitos de privacidad: la cuantizacion AP-IQ4_XS ocupa 13,27 GiB y cabe en GPU de consumo de 16 GB, lo que permite ejecutar el modelo en una estacion de trabajo sin enviar datos a terceros.
- Resumen y reescritura de contenido: la reduccion de encabezados markdown (del 47 % al 18 %), de negritas (del 85 % al 52 %) y la desaparicion total de preambulos lo hacen adecuado para generar texto limpio listo para publicar o para alimentar otro sistema.
- Backends de baja latencia con decodificacion especulativa: combinado con `--spec-type draft-mtp`, mejora la velocidad de decodificacion hasta un 22 % en salidas JSON respecto al modelo base, util en servicios con muchos usuarios concurrentes.

## Benchmarks y rendimiento

Evaluaciones del autor contra Qwen3.8-27B Q8_0, con el mismo servidor, parametros de muestreo y prompts, todos ellos reservados (held-out) respecto al ajuste.

| Metrica | base Q8_0 | Signal Q8_0 | Cambio |
|---|---:|---:|---:|
| Respuestas generales, tokens mediana | 243 | 104 | -57 % |
| Respuestas que abren con preambulo | 13 % | 0 % | eliminado |
| Respuestas con encabezados markdown | 47 % | 18 % | -62 % |
| Respuestas con negrita | 85 % | 52 % | -39 % |
| Respuestas de codigo, tokens mediana | 159 | 142 | -11 % |
| Respuestas de codigo, tokens p90 | 1026 | 914 | -11 % |
| Tokens de razonamiento, prompts generales, mediana | 153 | 74 | -52 % |
| Tokens de razonamiento, prompts de codigo, mediana | 225 | 166 | -26 % |
| Tokens de razonamiento, GSM8K, mediana | 119 | 81 | -32 % |
| GSM8K exact match, thinking off (60 problemas) | 98,3 % | 98,3 % | 0 |
| GSM8K exact match, thinking on (40 problemas) | 92,5 % | 95,0 % | +2,5 pp |

Decodificacion especulativa con `--spec-type draft-mtp`, ambos modelos en Q8_0 sobre Strix Halo con Vulkan y ejecuciones greedy de 200 tokens para las filas de draft fijo:

| Prompt / longitud de draft | Aceptacion base | Aceptacion Signal | Velocidad de decodificacion vs base |
|---|---:|---:|---:|
| Prosa, draft 3 | 39 % | 47 % | +10 % |
| Prosa, draft 4 | 35 % | 28 % | -9 % |
| Salida estructurada (JSON), draft 3 | 72 % | 94 % | +20 % |
| Salida estructurada (JSON), draft 4 | 66 % | 87 % | +22 % |
| Prompts de chat, muestreo 0,7, draft adaptativo <=4 (40 prompts) | 57 % | 60 % | — |

Calidad de las cuantizaciones, medida contra el BF16 de Signal (`-c 2048`, 60 chunks, corpus held-out congelado y wikitext-2):

| Tier | Tamano | bpw efectivos | KLD held-out | top-1 | KLD wikitext |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 27,05 GiB | 8,26 | 0,0040 | 95,2 % | 0,0045 |
| AP-Q6_K | 20,89 GiB | 6,57 | 0,0055 | 95,0 % | 0,0075 |
| AP-Q5_K_M | 18,19 GiB | 5,72 | 0,0081 | 94,4 % | 0,0094 |
| AP-Q4_K_XL | 16,35 GiB | 5,14 | 0,0124 | 93,9 % | 0,0148 |
| AP-Q4_K_M | 15,83 GiB | 4,98 | 0,0184 | 92,6 % | 0,0218 |
| AP-IQ4_XS | 13,27 GiB | 4,17 | 0,0287 | 91,1 % | 0,0327 |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM: al ser un modelo denso, el tamano del fichero equivale a la VRAM necesaria. AP-IQ4_XS 13,27 GiB; AP-Q4_K_M 15,83 GiB; AP-Q4_K_XL 16,35 GiB; AP-Q5_K_M 18,19 GiB; AP-Q6_K 20,89 GiB; Q8_0 27,05 GiB.
- Vision: anadir 0,87 GiB del fichero mmproj-BF16.gguf a la VRAM del tier elegido.
- GPU de consumo: AP-IQ4_XS (13,27 GiB, mas 0,87 GiB si se usa vision) encaja en tarjetas de 16 GB; AP-Q4_K_XL ronda los 16,35 GiB y requiere tarjetas de 24 GB como la RTX 3090 o RTX 4090.
- GPU de datacenter: A100 (40 o 80 GB) y H100 (80 GB) permiten ejecutar Q8_0 (27,05 GiB) con holgura y margen para cache KV.
- Hardware probado por el autor: Strix Halo con backend Vulkan para las pruebas de decodificacion especulativa.
- Opciones de despliegue: llama.cpp y `llama-server` estan documentados de forma explicita en la model card (`llama-server -hf agentionai/Signal-3.8-27B-GGUF:AP-Q4_K_XL --jinja -ngl 99`). Otros motores como Ollama, vLLM o TGI no estan confirmados en la informacion disponible.
- Muestreo recomendado: temperatura 0,7, top-p 0,95, top-k 20, min-p 0. El autor recomienda muestreo en lugar de decodificacion greedy, tras observar un bucle a temperatura 0.
- Latencia y throughput: no se publican cifras absolutas (tokens por segundo) en la informacion disponible. Solo hay datos relativos: menos de la mitad de tiempo total en respuestas de chat tipicas y hasta un 22 % mas de velocidad de decodificacion en JSON con draft 4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad | Notas |
|---|---|---|---|---|---|
| Signal 3.8 27B (GGUF) | 27,32 mil millones | no disponible | Apache 2.0 | GGUF en HuggingFace, 6 tiers de 13,27 a 27,05 GiB | 57 % menos de tokens en respuestas generales y mejor aceptacion del draft |
| Qwen3.8-27B (base) | 27,32 mil millones | no disponible | no disponible en la informacion | Pesos base (BF16) y Q8_0 usado como referencia | Referencia de calidad y de consumo de tokens en todas las tablas |
| Otras alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | No se han facilitado datos de comparacion con otros modelos |

## Limitaciones y advertencias

- Todos los resultados son autodeclarados por el autor sobre conjuntos held-out propios; no hay verificacion independiente ni benchmarks estandar publicados.
- La longitud de contexto y los idiomas soportados no se detallan en la informacion disponible, aunque el chat template es el original de Qwen3.8.
- El estilo es deliberadamente escueto: elimina preambulos y reduce formato. En casos donde se espera una explicacion extensa o un formato muy estructurado, la respuesta puede resultar mas seca de lo deseado.
- El autor observo un bucle con decodificacion greedy (temperatura 0). Se recomienda usar muestreo (temperatura 0,7, top-p 0,95, top-k 20, min-p 0).
- Los datos de velocidad son relativos y se midieron en un unico equipo (Strix Halo con Vulkan); no hay cifras absolutas de latencia o throughput.
- Riesgo de alucinacion: heredado del modelo base, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible.
- La licencia es Apache 2.0, lo que permite uso comercial, pero no se detallan condiciones adicionales ni la licencia del modelo base.
- El uso de vision exige descargar y cargar el fichero mmproj-BF16.gguf (0,87 GiB) ademas del tier elegido.
- El repositorio ocupa 120,8 GB, por lo que conviene descargar unicamente el tier necesario.
- El modelo tiene 0 descargas y 25 me gusta en el momento de la consulta: es un lanzamiento reciente (creado el 9 de septiembre de 2026) sin rodaje en produccion.
- Soporte de tool calling y de agentes multi-paso: no documentado, por lo que no conviene asumirlo sin validacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentionai/Signal-3.8-27B-GGUF
- Discusiones del modelo: https://huggingface.co/agentionai/Signal-3.8-27B-GGUF/discussions
- Sitio del autor: https://www.agention.ai/
- Pagina de modelos de AgentionAI (recetas Agention Precision): https://agention.ai/models/
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado papers, blogs tecnicos ni demos adicionales en los resultados de busqueda web disponibles; el resto de resultados no guardaban relacion con el modelo.
