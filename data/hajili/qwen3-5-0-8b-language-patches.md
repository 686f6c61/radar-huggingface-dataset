# hajili/qwen3.5-0.8b-language-patches

## Resumen

Los parches de idioma para Qwen3.5-0.8B son un conjunto de ediciones de pesos en forma cerrada (closed-form) que corrigen la confusión lingüística de un modelo pequeño. No se ha entrenado ningún parche: cada uno se calcula a partir de las activaciones del modelo, sin pasos de gradiente. El autor, hajili, los construyó en los experimentos descritos en la nota "Weight-space programming against language confusion in a small model". El repositorio completo ocupa menos de 1 MB.

El modelo base es Qwen/Qwen3.5-0.8B, un transformer de 0,8 mil millones de parámetros. El problema que resuelven los parches es concreto: cuando se le pide al modelo que responda en un idioma distinto del inglés, a menudo deriva hacia un idioma vecino (griego hacia inglés, catalán hacia español, ucraniano hacia ruso, etc.). Los parches elevan la tasa de respuestas en el idioma solicitado en pruebas con prompts reservados.

La relevancia actual es metodológica: demuestran que es posible modificar el comportamiento lingüístico de un modelo mediante programación en el espacio de pesos, sin reentrenamiento ni ajuste fino, con un coste de almacenamiento mínimo y efectos medibles. La licencia es Apache 2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B); los parches son ediciones de pesos, no una arquitectura nueva |
| Parametros totales | 0,8 mil millones (modelo base); los parches añaden desde 4.608 números (3584 + 1024) hasta 10.240 pesos según el parche |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el autor indica cargar el modelo en bfloat16 para reconstruir los checkpoints probados bit a bit |
| Idiomas soportados | nb, mk, sq, ca, el, sr, uk, mn, hy, kk, az, ky, ka, en (14 idiomas en total, incluyendo inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivos de parche); el modelo base se carga con transformers |

## Arquitectura y entrenamiento

Los parches no son un modelo entrenado, sino ediciones de pesos calculadas en forma cerrada a partir de las activaciones del modelo base. Hay dos tipos. El parche de deriva (drift) modifica la matriz `down_proj` de la MLP de la capa 16 añadiendo un término de rango 1: `W <- W + strength * outer(push, key)`, donde `key` tiene 3584 números y `push` 1024, con una fuerza de 4. El parche de atención reemplaza 10 filas de `q_proj` y `k_proj` en las capas 7 y 11 (10.240 pesos en total). Los metadatos de cada archivo guardan el nombre del tensor, la capa, la fuerza, el idioma solicitado y el idioma vecino hacia el que deriva.

No hubo entrenamiento ni pasos de gradiente. El autor indica que Claude Code construyó los parches en los experimentos descritos en su nota. Existen 13 parches de programa (uno por idioma, escritos y dosificados por el programa sin elección manual) más el parche noruego de referencia y el parche de atención para el prompt de sistema. El parche de prompt de sistema también se publica como modelo completo en hajili/qwen3.5-0.8b-system-prompt-patch.

## Capacidades

- Corrección de la deriva lingüística: hace que el modelo responda en el idioma solicitado en lugar de derivar hacia un idioma vecino.
- Parche noruego (bokmål): respuestas en noruego del 47 % al 94 % en 234 pasajes Belebele reservados, manteniendo las peticiones en danés en danés (94 % → 91 %).
- Parches de programa por idioma: griego (73 % → 98 %), catalán (82 % → 97 %), ucraniano (74 % → 97 %), macedonio (11 % → 95 %), albanés (23 % → 94 %), noruego (52 % → 92 %), mongol (16 % → 86 %), serbio en cirílico (62 % → 78 %), armenio (12 % → 71 %), kazajo (25 % → 69 %), azerbaiyano (36 % → 60 %), kirguís (30 % → 54 %) y georgiano (3 % → 35 %).
- Parche de atención para prompt de sistema: con "Always respond in X." pasa del 6 % al 72 %; con "You are an assistant that replies only in X, even when the user writes in another language." del 15 % al 75 %; con "Language: X" del 0 % al 58 %; con "You are a helpful assistant. The user's preferred language is X." del 0 % al 11 %; media de las cuatro del 5 % al 54 %.
- Aplicación combinada: el autor indica que aplicar varios parches juntos no formó parte de las pruebas.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistentes multilingües en lenguas minoritarias: aplicar el parche correspondiente a un despliegue de Qwen3.5-0.8B para que responda en noruego, catalán, ucraniano o georgiano en lugar de derivar al inglés o al ruso, con un coste de almacenamiento inferior a 1 MB por parche.
- Traducción automática asistida: usar el parche de programa del idioma de destino para forzar la salida en ese idioma en tareas de traducción desde inglés, mejorando la tasa de respuestas correctas en idiomas como macedonio (11 % → 95 %) o albanés (23 % → 94 %).
- Control de idioma por prompt de sistema: desplegar el parche de atención para que instrucciones del tipo "Always respond in X." se cumplan de forma fiable (6 % → 72 %) en aplicaciones con interfaz multilingüe.
- Investigación en edición de pesos: usar los parches como caso de estudio reproducible de programación en el espacio de pesos sin gradientes, comparando el comportamiento antes y después con los mismos prompts reservados.
- Prototipado rápido de localización: generar una copia parcheada del modelo con `apply_patch.py` para evaluar la calidad de respuesta en un idioma concreto antes de invertir en ajuste fino.
- Experimentos de alineación lingüística: medir efectos secundarios de las ediciones (deriva cruzada entre idiomas, bucles en respuestas largas) en entornos controlados de investigación.

## Benchmarks y rendimiento

Resultados publicados por el autor en prompts reservados (decodificación greedy, thinking desactivado):

| Prueba | Sin editar | Parcheado |
|---|---|---|
| Noruego, 234 pasajes Belebele, "Translate the following text into Norwegian Bokmål." | 47 % | 94 % |
| Danés (control), mismas pruebas | 94 % | 91 % |
| Griego (300 párrafos Wikipedia en inglés) | 73 % | 98 % |
| Catalán | 82 % | 97 % |
| Ucraniano | 74 % | 97 % |
| Macedonio | 11 % | 95 % |
| Albanés | 23 % | 94 % |
| Noruego | 52 % | 92 % |
| Mongol | 16 % | 86 % |
| Serbio (cirílico) | 62 % | 78 % |
| Armenio | 12 % | 71 % |
| Kazajo | 25 % | 69 % |
| Azerbaiyano | 36 % | 60 % |
| Kirguís | 30 % | 54 % |
| Georgiano | 3 % | 35 % |
| Prompt de sistema "Always respond in X." (36 preguntas × 25 idiomas) | 6 % | 72 % |
| Prompt "You are an assistant that replies only in X..." | 15 % | 75 % |
| Prompt "Language: X" | 0 % | 58 % |
| Prompt "You are a helpful assistant. The user's preferred language is X." | 0 % | 11 % |
| Media de los cuatro prompts de sistema | 5 % | 54 % |

Calidad de la respuesta noruega: chrF de frase 44 para respuestas convertidas y 46 para respuestas que ya estaban en noruego.

## Requisitos de hardware

- El modelo base tiene 0,8 mil millones de parámetros; en bfloat16 ocupa aproximadamente 1,6 GB de VRAM para los pesos, más memoria para el contexto y el runtime.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con al menos 4-6 GB de VRAM en bfloat16.
- Los parches en sí ocupan menos de 1 MB en total; el parche noruego son 4.608 números y el de atención 10.240 pesos.
- El autor indica cargar el modelo en bfloat16 con transformers (`AutoModelForImageTextToText`) para reconstruir los checkpoints probados bit a bit.
- Opciones de despliegue: transformers con `apply_patch.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hajili/qwen3.5-0.8b-language-patches | 0,8 B (base) + parches < 1 MB | No disponible | Edición de pesos closed-form para corregir deriva lingüística | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B | 0,8 B | No disponible | Modelo base sin parches | Apache 2.0 | Hugging Face |
| hajili/qwen3.5-0.8b-system-prompt-patch | 0,8 B | No disponible | Parche de prompt de sistema publicado como modelo completo | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los parches cambian el idioma de la respuesta, pero su calidad se mantiene en el nivel del modelo en ese idioma (chrF de frase 44 en noruego convertido frente a 46 en respuestas ya noruegas).
- Solo los parches de programa de ucraniano y catalán superaron todas las comprobaciones de efectos secundarios.
- El parche griego convierte 35 de 60 respuestas pedidas en albanés a griego.
- El parche kazajo convierte respuestas de chat en tayiko a ruso (de 7 a 47 de 60).
- En los idiomas que derivan al ruso, más respuestas largas entran en bucle tras el parche: las respuestas en mongol sin bucle caen del 84 % al 31 %.
- El parche de atención debilita una petición de idioma en el prompt del usuario en un marco concreto ("Summarize the text below in one or two sentences. Reply in X.", del 47 % al 37 % en 30 idiomas).
- El parche de atención amplifica otras instrucciones del prompt de sistema: tras un prompt que termina en "Do not give legal or medical advice.", 13 de 36 respuestas mencionan ese tipo de consejo.
- Cuando el usuario pide en X una traducción a X, las respuestas en azerbaiyano pasan a escritura árabe y las de uzbeko a cirílica.
- Javanés, sundanés, tayiko y uzbeko no tienen parche.
- Aplicar varios parches juntos no formó parte de las pruebas del autor.
- Licencia Apache 2.0, igual que el modelo base; los archivos de parche derivan de Qwen/Qwen3.5-0.8B.
- El repositorio registra 0 descargas y 0 likes, y el tamaño del repo aparece como 0.0 GB, coherente con un contenido inferior a 1 MB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hajili/qwen3.5-0.8b-language-patches
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Parche de prompt de sistema como modelo completo: https://huggingface.co/hajili/qwen3.5-0.8b-system-prompt-patch
- Nota del autor "Weight-space programming against language confusion in a small model": https://mhajili.com/notes/weight-space-programming/
