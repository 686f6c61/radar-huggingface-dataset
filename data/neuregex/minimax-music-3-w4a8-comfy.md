# neuregex/MiniMax-Music-3-w4a8-comfy

## Resumen

MiniMax-Music-3-w4a8-comfy es una cuantizacion de 4 bits del codificador de texto (*text encoder*) del modelo MiniMaxAI/MiniMax-Music3, un sistema de sintesis de audio y musica a partir de descripciones textuales. La publica el usuario neuregex en Hugging Face y su proposito no es otro que reducir el peso del codificador de texto de 16,7 GB en bf16 a 5,9 GB (un 35 % del original), manteniendo la compatibilidad con los nodos de carga estandar de ComfyUI. No es un modelo nuevo: es un artefacto de despliegue pensado para que el pipeline de generacion musical quepa en tarjetas graficas de consumo.

El modelo base, MiniMax Music 3, esta desarrollado por MiniMax y se distribuye bajo la MiniMax-Music3 Community License. Segun la model card, MiniMax Music 3 se obtuvo por *fine-tuning* a partir de Qwen3-8B (licencia Apache 2.0), lo que situa el codificador de texto en la familia de transformers densos de aproximadamente 8.000 millones de parametros. La cuantizacion afecta unicamente al codificador de texto; el resto de componentes del pipeline (decodificador de audio, vocoder, etc.) no forma parte de este repositorio.

La relevancia de esta ficha es practica: demuestra como un formato de cuantizacion nativo de ComfyUI (`asym_w4a8_int8`) permite ejecutar un modelo de generacion musical de gran tamano en GPUs de 8 a 24 GB con latencias de entre 30 y 42 segundos por cancion de 10 segundos, sin nodos personalizados ni conversiones adicionales. Es, por tanto, un ejemplo de optimizacion de inferencia mas que un modelo con capacidades nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (codificador de texto derivado de Qwen3-8B); cuantizacion asimetrica w4a8 con codebook Lloyd-Max, escalas fp8 E4M3 cada 16 pesos, escala fp32 por fila de salida y rotacion de Hadamard en grupos de 256 |
| Parametros totales | No disponible (el modelo base se describe como fine-tuning de Qwen3-8B; el repositorio solo contiene el codificador de texto podado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | w4a8 (`asym_w4a8_int8` de ComfyUI); existen variantes bf16 (16,7 GB) e int8 convrot (9,2 GB) del mismo codificador |
| Idiomas soportados | No disponible |
| Licencia | MiniMax-Music3 Community License (con Acceptable Use Policy, Exhibit A) |
| Formato de pesos | safetensors (160 capas en w4a8; el resto de tensores en bf16) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: cuantiza el codificador de texto de MiniMax Music 3. La arquitectura subyacente es la de Qwen3-8B, un transformer denso decoder-only, segun indica la propia model card al declarar que MiniMax Music 3 fue afinado a partir de Qwen3-8B. El pipeline completo es de tipo *text-to-audio*: el codificador de texto transforma la descripcion musical en representaciones que alimentan las etapas posteriores de sintesis, que no se incluyen en este repositorio.

La innovacion tecnica esta en el esquema de cuantizacion. Se aplica `asym_w4a8_int8`, definido en el documento QUANTIZATION.md de ComfyUI: codigos de 4 bits sobre un codebook Lloyd-Max, escalas fp8 (E4M3) compartidas por cada grupo de 16 pesos, una escala fp32 por fila de salida y una rotacion de Hadamard en grupos de 256 para reducir valores atipicos. Solo se cuantizaron las 160 capas que ya cuantizaba el fichero oficial int8 convrot; el resto de tensores permanece en bf16. El error relativo de pesos tras ida y vuelta es de 0,073 de media y 0,073 maximo por capa. La herramienta empleada es Comfy Kitchen 0.2.39. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF o DPO, porque el autor no entrena el modelo, solo lo comprime.

## Capacidades

- Generacion de audio musical a partir de texto (pipeline `text-to-audio`), integrada en flujos de ComfyUI mediante el nodo `CLIPLoader`.
- Codificacion de descripciones textuales para condicionar la sintesis de canciones con voz (la model card cita pruebas con una cancion folk de 10 segundos con vocal femenina).
- Compatibilidad con los nodos de carga estandar de ComfyUI, sin nodos personalizados.
- Ejecucion con kernels int8 en GPUs RTX 30 y posteriores; en tarjetas mas antiguas se descomprime capa a capa antes de multiplicar (misma memoria, mas lento).
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada, razonamiento multi-paso ni soporte multilingue explicito; la informacion disponible no las cubre.

## Casos de uso

- Generacion musical en estaciones de trabajo de consumo: con 8 GB de VRAM y 16 GB de RAM se puede generar una cancion de 10 segundos en unos 30 segundos, lo que permite prototipar ideas musicales en un portatil con GPU de gama media.
- Integracion en flujos de ComfyUI existentes: al cargarse con `CLIPLoader` y sustituir el fichero bf16 o int8, cualquier workflow de MiniMax Music 3 funciona sin cambios, lo que simplifica la migracion de pipelines ya montados.
- Produccion de bandas sonoras para videojuegos o video: la reduccion de memoria libera VRAM para el resto del pipeline (decodificador, vocoder, post-proceso) en la misma tarjeta.
- Iteracion rapida de prompts musicales: la latencia de 30-42 segundos por clip permite probar variaciones de estilo, instrumentacion o voz en sesiones de diseno sonoro.
- Despliegue en servidores con GPUs de 16 o 24 GB (por ejemplo, L40S o RTX 4090): la model card aporta mediciones directas en L40S con limites de VRAM simulados, utiles para dimensionar instancias.
- Educacion y demostraciones: al caber en GPUs consumer y no requerir nodos extra, sirve para talleres sobre cuantizacion y generacion musical con modelos abiertos.
- Investigacion sobre cuantizacion: el error relativo por capa (0,073) y la comparacion cualitativa con la version int8 permiten estudiar el impacto de w4a8 en modelos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo aporta mediciones de memoria y tiempo de ejecucion en una NVIDIA L40S con ComfyUI limitado a cada tamano de tarjeta, para una cancion de 10 segundos con voz:

| Tarjeta | Ficheros originales | Con estos ficheros |
|---|---|---|
| 8 GB | Ejecuta · 80 s · 24 GB RAM | Ejecuta · 30 s · 16 GB RAM |
| 12 GB | Ejecuta · 39 s · 15 GB RAM | Ejecuta · 35 s · 14 GB RAM |
| 16 GB | Ejecuta · 50 s · 15 GB RAM | Ejecuta · 37 s · 14 GB RAM |
| 24 GB | Ejecuta · 45 s · 14 GB RAM | Ejecuta · 42 s · 14 GB RAM |

La validacion cualitativa se hizo comparando lado a lado, con las mismas semillas (42, 7 y 1234), canciones generadas con el fichero int8 y con este w4a8: el autor afirma que suenan igual de bien, aunque con la misma semilla la cancion resultante difiere tanto como si se cambiara de semilla.

## Requisitos de hardware

- VRAM estimada: el codificador de texto ocupa 5,9 GB en disco; la model card mide ejecucion completa desde 8 GB de VRAM (con 16 GB de RAM del sistema) hasta 24 GB.
- GPUs recomendadas: NVIDIA L40S (mediciones oficiales), RTX 4090 y RTX 3090 para 24 GB; RTX 4080/4070 Ti Super para 16 GB; RTX 3060 12 GB o RTX 4070 para 12 GB; tarjetas de 8 GB ejecutan con mas uso de RAM del sistema.
- Cabe en GPU consumer: si, desde 8 GB, aunque por debajo de cierto tamano ComfyUI mantiene parte de los pesos en RAM.
- Despliegue: ComfyUI desde el 2026-10-19 (probado en el commit `e3bee7f`, posterior a 0.42.0), con los nodos `CLIPLoader` y el resto del pipeline de MiniMax Music 3. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 30 s (8 GB), 35 s (12 GB), 37 s (16 GB) y 42 s (24 GB) por cancion de 10 segundos en L40S; en tarjetas menores los tiempos son mayores. Las tarjetas RTX 30 y posteriores usan kernels int8; las anteriores descomprimen capa a capa y son mas lentas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-Music-3-w4a8-comfy (este) | Codificador de texto derivado de Qwen3-8B, podado | No disponible | safetensors w4a8 (5,9 GB) | MiniMax-Music3 Community License | Hugging Face, 0 descargas |
| MiniMaxAI/MiniMax-Music3 (bf16) | Mismo codificador, sin cuantizar | No disponible | safetensors bf16 (16,7 GB) | MiniMax-Music3 Community License | Hugging Face (modelo base) |
| MiniMax Music 3 text encoder int8 convrot | Mismo codificador | No disponible | safetensors int8 (9,2 GB) | MiniMax-Music3 Community License | Referenciado en la model card |
| Qwen3-8B | 8.000 M aprox. | No disponible en esta ficha | safetensors, GGUF | Apache 2.0 | Hugging Face |

La comparacion con modelos de generacion musical de otros autores (MusicGen, Stable Audio, etc.) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo contiene el codificador de texto: no es un modelo autonomo de generacion musical; requiere el resto del pipeline de MiniMax Music 3 en ComfyUI.
- La cuantizacion introduce error: 0,073 de error relativo medio y maximo por capa, y con la misma semilla la salida difiere de la version int8.
- Licencia restrictiva: la MiniMax-Music3 Community License exige mostrar "MiniMax-Music3" en la interfaz de cualquier producto o servicio comercial y obtener autorizacion escrita de MiniMax si los ingresos anuales superan los 20 millones de dolares. Incluye una Acceptable Use Policy (Exhibit A) que hay que respetar.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo, toxicidad ni fidelidad al prompt; al ser un modelo de audio, el riesgo se traslada a contenido musical inesperado o no solicitado.
- Idiomas soportados: no disponibles; la model card no detalla cobertura linguistica del codificador de texto.
- Dependencia de version: requiere ComfyUI desde el 2026-10-19; versiones anteriores no cargan el formato.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- El autor advierte que cerca del limite de VRAM ComfyUI retiene mas pesos en RAM y que el contexto CUDA y algunos kernels consumen memoria fuera del limite configurado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/neuregex/MiniMax-Music-3-w4a8-comfy
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Documento de cuantizacion de ComfyUI (QUANTIZATION.md): no disponible como enlace directo en la informacion proporcionada
- Comunidad del autor (Discord): https://discord.gg/HxfP9TnctJ
