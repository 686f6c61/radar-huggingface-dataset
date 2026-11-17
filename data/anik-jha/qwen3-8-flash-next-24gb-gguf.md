# anik-jha/Qwen3.8-Flash-Next-24GB-GGUF

## Resumen

Qwen3.8-Flash-Next-24GB-GGUF es una cuantización GGUF podada a nivel de expertos del modelo Qwen3.8-Flash-Next, publicada por el usuario anik-jha. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 86.771.852.160 parámetros totales, desarrollado originalmente por el equipo Qwen. La poda reduce el número de expertos por capa de 512 a 130 (128 seleccionados por ranking sobre el GGUF 4-bit de unsloth más 2 expertos restaurados y reentrenados), lo que permite ejecutar el modelo en una GPU de 24 GB.

El objetivo del autor es claro: hacer viable un modelo MoE de gran tamaño en hardware de consumo. Para compensar la pérdida de calidad por la poda agresiva (se conserva aproximadamente el 25% de los expertos), el repo añade un adaptador LoRA de recuperación de 1,8 GB que llama.cpp aplica en tiempo de ejecución mediante `--lora-scaled`, junto con una receta de muestreo específica (presencia 1,5, `repeat-last-n` 20480) y un cliente de parada y redibujado (`redraw.py`) para mitigar los bucles de repetición típicos de los modelos podados.

La relevancia actual reside en que demuestra que la poda estructurada de expertos combinada con adaptadores de recuperación puede recuperar una fracción sustancial del rendimiento perdido: en LiveCodeBench pasa de 63 a 109 problemas resueltos de 130 (+35,4 puntos porcentuales). El modelo está orientado a generación de código y razonamiento, y su licencia es qwen-community-1.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), 512 expertos por capa en el modelo base, 10 activos por token |
| Parametros totales | 86.771.852.160 (modelo base); el GGUF podado conserva 130 expertos por capa |
| Parametros activos | no disponible (el modelo base activa 10 expertos por token; el número exacto de parámetros activos no se indica) |
| Longitud de contexto | 32K medido; 128K medido en consumo de VRAM (23,1 GB con caché KV de 8 bits) |
| Tipos de cuantizacion | GGUF 4-bit (podado desde el UD-IQ4_XS de unsloth); caché KV de 8 y 16 bits |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (modelo de 45,7 GB + adaptador LoRA de 1,8 GB; 51,0 GB de descarga total) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 512 sub-redes (expertos) por capa, de las cuales se activan 10 por token. Incluye además una tabla de búsqueda n-gram de 26,8 GB dentro del archivo del modelo: para cada token el modelo lee 16 filas de esa tabla, que llama.cpp mantiene en disco y carga bajo demanda, por lo que no consume VRAM (el proceso servidor usa 0,7 GB de RAM). El repo no documenta el número de tokens de entrenamiento ni la composición del dataset del modelo base.

La innovación del repo es el pipeline de poda y recuperación: se seleccionan los 128 expertos mejor clasificados por capa a partir del GGUF 4-bit de unsloth, se restauran 2 expertos adicionales reentrenados por capa (130 en total) y se entrena un adaptador LoRA de recuperación que aproxima las capas podadas al modelo sin podar. El adaptador no se fusiona en los pesos cuantizados: llama.cpp calcula la corrección en tiempo de ejecución. La receta completa incluye además las flags de muestreo `--presence-penalty 1.5 --repeat-last-n 20480` y el script `redraw.py`, que detiene y redibuja con nueva semilla hasta tres veces las respuestas que empiezan a repetirse. Todas las métricas publicadas se midieron con las tres partes activas.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso.
- Generación de código: resolución de problemas de programación estilo concurso (LiveCodeBench) y funciones cortas en Python (HumanEval+, MBPP+).
- Razonamiento con modo de repetición controlada: la receta de parada y redibujado permite reintentar respuestas que entran en bucle.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en estación de trabajo local: con 21,1 GB de VRAM a 32K de contexto, el modelo cabe en una GPU de 24 GB y permite autocompletado y resolución de problemas de programación sin depender de la nube; su HumanEval+ de 89,6% con redibujado lo hace adecuado para tareas de funciones cortas.
- Resolución de problemas de concurso y entrevistas técnicas: el rendimiento de 109/130 en LiveCodeBench (fácil y medio) lo sitúa como herramienta viable para practicar o generar soluciones verificables con tests ocultos.
- Generación de scripts y utilidades en Python en pipelines internos: MBPP+ de 75,4% con redibujado permite generar funciones y parches que se validan automáticamente antes de integrarse.
- Prototipado de agentes de código en hardware de consumo: al ejecutarse con llama.cpp y endpoints compatibles, puede integrarse en flujos locales de edición de repositorio donde la latencia de 19 tokens/s es aceptable para tareas por lotes.
- Evaluación e investigación sobre poda de MoE: el repo documenta el pipeline completo (ranking de expertos, restauración, adaptador, redibujado) y sirve como referencia reproducible para estudiar el equilibrio entre tamaño, VRAM y calidad.
- Despliegue en entornos con memoria unificada (DGX Spark u similares): el diseño que mantiene la tabla n-gram en disco y el adaptador fuera de los pesos encaja en máquinas donde CPU y GPU comparten un pool de memoria.
- Servicio de generación de código para un único usuario en 24 GB: con 23,1 GB a 128K de contexto y caché KV de 8 bits, cubre conversaciones largas con contexto de repositorio sin superar la VRAM de la tarjeta.

## Benchmarks y rendimiento

| Benchmark | Este repo | Poda simple (sin adaptador) | Diferencia |
|---|---|---|---|
| LiveCodeBench (130 problemas, fácil y medio), resueltos | 109 | 63 | +35,4 pp (IC 95%: +26,2 a +44,6) |
| LiveCodeBench, primer intento | 98 | 59 | +30,0 pp (IC 95%: +21,5 a +38,5) |
| LiveCodeBench fácil (63 problemas) | 61 | 45 | — |
| LiveCodeBench medio (67 problemas) | 48 | 18 | — |
| HumanEval+ (164 problemas) | 147 (89,6%) | 138 | +5,5 pp (IC 95%: +0,6 a +10,4) |
| HumanEval+, primer intento | 88,4% | — | — |
| MBPP+ (378 problemas) | 285 (75,4%) | 282 | +0,8 pp (IC 95%: −2,6 a +4,2) |
| MBPP+, primer intento | 74,1% | — | — |

No se han publicado resultados frente al modelo sin podar en estos benchmarks, ni se ejecutaron problemas de dificultad alta. La misma receta aplicada a Ornith-1.5-122B resolvió 116 de 130 problemas frente a 104 de su poda simple.

## Requisitos de hardware

- VRAM a 32K de contexto con caché KV de 8 bits: 21,1 GB al arrancar el servidor; 21,5 GB tras responder.
- VRAM a 32K de contexto con caché KV de 16 bits: 21,5 GB.
- VRAM a 128K de contexto con caché KV de 8 bits: 23,1 GB.
- RAM del proceso servidor tras una respuesta (32K, KV 8 bits): 0,7 GB, más la tabla n-gram de 26,8 GB leída desde disco (no ocupa VRAM).
- GPU: cabe en tarjetas de 24 GB; medido en NVIDIA DGX Spark (memoria unificada CPU/GPU). El autor espera un consumo similar en una tarjeta de 24 GB dedicada, pero no lo midió.
- Despliegue: llama.cpp, con soporte de `--lora-scaled`, flags de muestreo y el cliente `redraw.py` incluido; endpoints compatibles.
- Rendimiento medido: 19 tokens/s para un usuario en DGX Spark; con prompt corto, 20,4–20,5 tokens/s tanto con la tabla en disco como en RAM.
- Coste de cómputo del adaptador: el test de LiveCodeBench tardó 2,5 veces más en tiempo de pared que la poda simple (31.202 s frente a 12.256 s sirviendo 16 peticiones a la vez) para 1,57 veces más tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento de código | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (Qwen3.8-Flash-Next podado + adaptador) | 86,77B totales, 130 expertos/capa | 32K medido, 128K en VRAM | LiveCodeBench 109/130; HumanEval+ 89,6% | qwen-community-1.0 | GGUF, 51,0 GB |
| Poda simple del mismo modelo (25% expertos, sin adaptador) | 86,77B totales, 128 expertos/capa | no disponible | LiveCodeBench 63/130; HumanEval+ 138/164 | qwen-community-1.0 | GGUF |
| Qwen3.8-Flash-Next sin podar (UD-IQ4_XS de unsloth) | 86,77B totales, 512 expertos/capa | no disponible | no ejecutado en estos benchmarks | qwen-community-1.0 | GGUF, 87,2 GB |
| Ornith-1.5-122B-16GB-GGUF (misma receta) | 122B (según nombre) | no disponible | LiveCodeBench 116/130 | no disponible | GGUF, 16 GB |

## Limitaciones y advertencias

- La poda elimina el 75% de los expertos por capa; el adaptador recupera parte del rendimiento, pero no se ha comparado con el modelo sin podar en LiveCodeBench ni en problemas de dificultad alta.
- Tendencia a bucles de repetición: 25 de 130 primeros intentos se detuvieron por repetición; tras tres redibujados, 9 problemas seguían en bucle y 2 alcanzaron el límite de tokens. Requiere obligatoriamente la receta de muestreo y `redraw.py`.
- El adaptador no está fusionado: añade coste de cómputo en tiempo de ejecución (2,5 veces el tiempo de pared de la poda simple en el test de LiveCodeBench).
- La tabla n-gram de 26,8 GB se lee desde disco; en almacenamiento lento el rendimiento puede degradarse, aunque en NVMe el autor midió paridad con tenerla en RAM.
- Las mediciones de VRAM se hicieron en DGX Spark con memoria unificada; el comportamiento en una GPU de 24 GB dedicada no está verificado.
- El resultado de MBPP+ (+0,8 pp) está dentro del margen de error y no demuestra mejora en problemas cortos.
- No hay información sobre sesgos, idiomas soportados ni capacidades de tool calling o agentes.
- Licencia qwen-community-1.0: es necesario revisar sus términos antes de uso comercial, ya que impone condiciones específicas de la comunidad Qwen.
- Repo con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/anik-jha/Qwen3.8-Flash-Next-24GB-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repo previo con la misma receta (Ornith-1.5-122B-16GB-GGUF): https://huggingface.co/anik-jha/Ornith-1.5-122B-16GB-GGUF
- Paper referenciado en los tags (arXiv:2611.20419): https://arxiv.org/abs/2611.20419
- GGUF 4-bit de unsloth del que parte la poda: no disponible (enlace no incluido en la información proporcionada)
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
