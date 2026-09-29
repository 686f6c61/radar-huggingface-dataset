# beamster/Qwen3.8-Flash-Next-Sushi-2.6bpw

## Resumen

Qwen3.8-Flash-Next-Sushi-2.6bpw es un empaquetado de cuantizacion del modelo multimodal Qwen3.8-Flash-Next, publicado por el usuario beamster (autor tambien del motor de inferencia sushi) el 27 de septiembre de 2026. No es un modelo entrenado desde cero: es una conversion de los pesos originales de Qwen para que puedan ejecutarse en Apple Silicon mediante el motor sushi v1.0.4 o posterior, con macOS 26.2 o superior. El objetivo declarado es un Mac de 64 GB con contexto largo: 250.000 tokens con cache KV a 8 bits y 450.000 con cache a 4 bits; en Macs de 96 GB y 128 GB se alcanza el millon de tokens.

El modelo base, desarrollado por el equipo Qwen de Alibaba, es un MoE multimodal que combina atencion hibrida GDN (Gated DeltaNet) y QSA, e incluye torre de vision Qwen3-VL, tabla de embeddings n-gram y cabeza MTP (multi-token prediction) usada como draft head para decodificacion especulativa. La ficha oficial del repo safetensors declara 25.959.006.099 parametros totales; fuentes externas no oficiales describen el modelo como un MoE de gran tamano en disco con unos 6B activos, cifra que no se puede confirmar con la informacion disponible.

La relevancia de este pack es practica: permite servir un modelo multimodal de contexto muy largo en hardware de consumo Apple con ~44 GiB de pesos en memoria de GPU (43,95 GiB medidos) y una tabla n-gram de 29,8 GiB que permanece en el SSD y nunca se carga en memoria de video. A cambio, exige un runtime propietario (sushi) y no carga en transformers, vLLM, mlx-lm ni exllamav3. Su calidad medida frente al checkpoint bf16 es de KLD 0,1355 y 89,08% de acuerdo top-1, en la zona media de la tabla de packs comparados por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con atencion hibrida GDN + QSA (segun el repositorio oficial del modelo base); incluye torre de vision Qwen3-VL, expertos compartidos, hyper-connections, indexer, embedding n-gram y cabeza MTP |
| Parametros totales | 25.959.006.099 (dato de los safetensors del repo) |
| Parametros activos | no disponible (fuente externa no oficial menciona ~6B activos, sin confirmar) |
| Longitud de contexto | hasta 1.048.576 tokens; `config.json` aplica YaRN x4 sobre los 262.144 nativos |
| Tipos de cuantizacion | Expertos enrutados: EXL3 a 2,6 bits por peso (48 capas x 512, mas la capa MTP). Parte densa: 8-bit affine. Tabla n-gram: 4-bit affine, group size 32. Cache KV seleccionable a 8 o 4 bits |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license: other`, con `license_link: LICENSE` en el repo) |
| Formato de pesos | safetensors con pesos EXL3 empaquetados para sushi; no compatible con el formato estandar de transformers |
| Tamano del repo | 79,2 GB (en disco: ~74 GiB, de los cuales 43,9 GiB de pesos y 29,8 GiB de tabla n-gram) |
| Descargas / likes | 135 descargas, 11 likes |
| Creado / actualizado | 2026-09-27 / 2026-09-28 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es, segun el repositorio oficial de QwenLM, un MoE multimodal que sirve como avance de la arquitectura que usara Qwen4, cumpliendo el mismo papel que Qwen3-Next respecto a Qwen3.5. Su diseno introduce una atencion hibrida GDN + QSA (Gated DeltaNet combinada con QSA) y, segun el README oficial, mejora el modelo en cuatro frentes: atencion, residuales, embedding y optimizacion. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

Este pack concreto no aporta entrenamiento adicional: es una conversion de pesos. El autor aplica EXL3 a 2,6 bits por peso sobre los expertos enrutados (las 48 capas de 512 expertos mas la capa MTP) con un conversor propio, mantiene la parte densa (atencion, GDN, expertos compartidos, hyper-connections, indexer, embedding y lm_head) en 8-bit affine —igual que en sus packs Sushi-3bpw y Sushi-4bpw— y conserva la tabla de embeddings n-gram en 4-bit affine con group size 32, derivada de la tabla bf16 publicada, en un unico archivo `ngram_table.bin` que se lee del SSD. La torre de vision (ViT de Qwen3-VL) y la cabeza MTP se incluyen en el pack.

La innovacion operativa mas destacable es la MTP usada como draft head para decodificacion especulativa (activada por defecto con `--mtp`), junto con una cache de prefijos que puede residir en disco (hasta 20 GB) y en RAM. El contexto de 1M tokens no es nativo: se obtiene aplicando YaRN x4 sobre la ventana nativa de 262.144 tokens.

## Capacidades

- Generacion de texto y conversacion multi-turno con ventanas de contexto de hasta 1.048.576 tokens.
- Entrada multimodal de imagen y video mediante la torre de vision Qwen3-VL incluida en el pack (pipeline `image-text-to-text`).
- Decodificacion especulativa integrada mediante la cabeza MTP del propio modelo, sin necesidad de un modelo draft externo.
- Cache de prefijos persistente en disco y en memoria, que evita repetir el prefill de prompts ya vistos, incluso entre reinicios del servidor.
- Seleccion de precision de cache KV (8 o 4 bits) para intercambiar calidad por contexto disponible.
- Cuantizacion de la cache KV de la cabeza MTP de forma independiente (`--mtp-head-kv-quant`).
- Servicio local por HTTP en `127.0.0.1:12345` mediante el comando `sushi serve`.
- Soporte de tool calling, function calling y comportamiento agente: no disponible en la informacion proporcionada.
- Capacidades multilingues concretas: no disponible en la informacion proporcionada.
- Modo de razonamiento o thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos en local: con 250.000 tokens de contexto a cache KV de 8 bits en un Mac de 64 GB, se puede cargar un expediente completo, un libro tecnico o un repositorio de codigo extenso y hacer preguntas sobre el sin fragmentar el contenido.
- Procesamiento de video o imagen con descripcion textual: la torre Qwen3-VL permite alimentar fotogramas o imagenes junto al prompt de texto, util para indexado de archivos multimedia, subtitulado asistido o revision de capturas.
- Asistentes conversacionales de larga duracion: la cache de prefijos en disco (hasta 20 GB) mantiene el historial de una conversacion y evita recalcular el prefill en cada turno, algo critico en dialogos de cientos de miles de tokens.
- Agentes locales con varias sesiones concurrentes: subiendo `--prefix-cache-entries` a 4-8 se pueden mantener los prefijos de varios agentes compartiendo un mismo servidor sushi escuchando en localhost.
- Desarrollo y depuracion sin conexion: al ejecutarse integramente en el equipo, es adecuado para entornos con datos sensibles o sin acceso a internet, siempre que se acepte la licencia qwen-community-1.0 y la dependencia de macOS 26.2.
- Laboratorio de cuantizacion y evaluacion: el pack forma parte de una familia (2bpw, 2.6bpw, 3bpw, 4bpw) medida con la misma metodologia KLD, por lo que sirve para estudiar el compromiso entre precision de pesos y calidad en hardware unificado.
- Servidor de inferencia personal en Mac de 96 GB o 128 GB: con 1M tokens de contexto disponibles a cache KV de 8 bits, se puede usar como backend local para tareas de resumen masivo o busqueda semantica sobre corpus grandes.
- Extraccion de codigo y explicaciones largas: con `--max-tokens 32000` (o 64000 con cache de 4 bits) se pueden generar respuestas extensas de una sola pasada.

## Benchmarks y rendimiento

El autor publica una evaluacion de divergencia (KLD) frente al checkpoint bf16, calculada con 16 prompts de 512 tokens, puntuada hasta el primer EOS (7.186 posiciones) y con cache KV a 8 bits (salvo Sushi-2bpw, que usa KV bf16). La tabla n-gram no se computa porque permanece en el SSD.

| Pack | Pesos en memoria de GPU (GiB) | KLD (menor es mejor) | Acuerdo top-1 |
|---|---|---|---|
| oMLX oQ5e | 83,97 | 0,0625 | 92,40% |
| Sushi-4bpw | 63,68 | 0,0632 | 92,99% |
| mlx-serve mixed-4-8bit | 70,13 | 0,0818 | 91,39% |
| Sushi-3bpw (tabla n-gram 4-bit) | 49,33 | 0,1047 | 90,34% |
| **Sushi-2.6bpw (tabla n-gram 4-bit)** | **43,95** | **0,1355** | **89,08%** |
| oMLX oQ4e | 69,21 | 0,1370 | 88,87% |
| MLX affine q3 (expertos 3-bit, denso 8-bit) | 54,94 | 0,1444 | 88,05% |
| mlx-serve iQ-MLX 3.3bpw | 50,60 | 0,1987 | 86,28% |
| Sushi-2bpw (tabla n-gram 4-bit) | 34,97 | 0,2080 | 85,94% |

Efecto de bajar la cache KV de 8 a 4 bits, segun la model card: el KLD medio pasa de 0,1355 a 0,1458 y el acuerdo top-1 de 89,08% a 88,84%, a cambio de 1,8 veces mas contexto.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con macOS 26.2 o superior y sushi v1.0.4 o posterior. El pack no carga en transformers, vLLM, mlx-lm ni exllamav3.
- Memoria de GPU para servir un prompt que llena el contexto completo (cache KV 8 bits, MTP activado, `--mtp-head-kv-quant`, `--prefix-cache-mem 1GB`, sin contar la tabla n-gram que queda en SSD):
  - Solo pesos: 44,0 GiB.
  - 128k de contexto: 50,7 GiB.
  - 256k: 53,6 GiB.
  - 512k: 58,6 GiB.
  - 1M: 68,8 GiB.
- Contexto maximo alcanzable por equipo (8 bits / 4 bits de KV, con 256 MiB de margen y tope de 1M):
  - Mac de 48 GB (limite de GPU 43.000 MB): no soportado con este pack.
  - Mac de 64 GB (limite 59.000 MB): 440k con KV de 8 bits / 744k con KV de 4 bits.
  - Mac de 96 GB (limite 88.000 MB): 1M / 1M.
  - Mac de 128 GB (limite 120.000 MB): 1M / 1M.
- Ajuste necesario en Mac de 64 GB: `sudo sysctl iogpu.wired_limit_mb=59000`. Por encima de ese valor macOS se queda sin memoria antes que el modelo.
- Almacenamiento: ~74 GiB en disco (43,9 GiB de pesos + 29,8 GiB de tabla n-gram); el repo ocupa 79,2 GB.
- Parametros de servicio recomendados por el autor: `--ctx-size 250000 --max-tokens 32000` con KV de 8 bits, o `--ctx-size 450000 --max-tokens 64000` con KV de 4 bits; `--temp 1`; `--prefix-cache-disk 20GB`.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables, el pack es exclusivo de Apple Silicon.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles para este pack.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa dentro de la misma familia de packs para Qwen3.8-Flash-Next. Todas las cifras de pesos y KLD proceden de las tablas publicadas por el autor de este pack.

| Pack | Objetivo de hardware | Pesos en GPU (GiB) | KLD | Acuerdo top-1 | Motor | Licencia |
|---|---|---|---|---|---|---|
| Sushi-2.6bpw (este) | Mac 64 GB, contexto largo | 43,95 | 0,1355 | 89,08% | sushi | qwen-community-1.0 |
| Sushi-2bpw | Mac 48 GB | 34,97 | 0,2080 | 85,94% | sushi | qwen-community-1.0 |
| Sushi-3bpw | Mac 64 GB | 49,33 | 0,1047 | 90,34% | sushi | qwen-community-1.0 |
| Sushi-4bpw | Mac 96-128 GB | 63,68 | 0,0632 | 92,99% | sushi | qwen-community-1.0 |
| mlx-serve mixed-4-8bit | Apple Silicon con MLX | 70,13 | 0,0818 | 91,39% | mlx-serve | no disponible en la informacion |
| mlx-serve iQ-MLX 3.3bpw | Apple Silicon con MLX | 50,60 | 0,1987 | 86,28% | mlx-serve | no disponible en la informacion |
| oMLX oQ4e / oQ5e | Apple Silicon con MLX | 69,21 / 83,97 | 0,1370 / 0,0625 | 88,87% / 92,40% | oMLX | no disponible en la informacion |

Posicionamiento: Sushi-2.6bpw es el segundo pack mas pequeno de la comparativa tras Sushi-2bpw, con una calidad medida superior a oQ4e y a iQ-MLX 3.3bpw, pero inferior a Sushi-3bpw y Sushi-4bpw. Su ventaja diferencial no es la fidelidad, sino la combinacion de 44 GiB de pesos con contexto de 440k tokens en un Mac de 64 GB.

## Limitaciones y advertencias

- Compatibilidad restringida: solo funciona con sushi v1.0.4 o posterior en Apple Silicon con macOS 26.2 o posterior. No carga en transformers, vLLM, mlx-lm ni exllamav3, lo que descarta su uso en servidores Linux con GPU.
- Perdida de calidad medible: KLD de 0,1355 y 89,08% de acuerdo top-1 frente al bf16. Es un pack de compromiso entre tamano y fidelidad; para tareas sensibles a la precision conviene Sushi-3bpw o Sushi-4bpw.
- La ventana de 1M tokens depende de YaRN x4 aplicado sobre los 262.144 tokens nativos. La informacion disponible no documenta la calidad del modelo en esas longitudes extremas.
- La tabla n-gram ocupa 29,8 GiB en disco y se lee desde el SSD durante la inferencia; su latencia efectiva depende del almacenamiento del equipo y no se ha cuantificado.
- La cifra de parametros del repo (25,96B) frente a descripciones externas del modelo base como un MoE de gran tamano en disco no esta reconciliada en la informacion disponible; conviene verificar la configuracion real antes de planificar hardware.
- Idiomas soportados: no declarados. No se puede asumir un rendimiento equilibrado en castellano.
- Licencia qwen-community-1.0, etiquetada como `license: other`. La informacion disponible no detalla los terminos de uso comercial; es obligatorio revisar el archivo LICENSE del repositorio y la licencia del modelo base antes de cualquier despliegue productivo.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada para este pack ni para el modelo base.
- Dependencia operativa del autor: el pack, el conversor EXL3 y el motor sushi provienen del mismo publicador, lo que limita las alternativas si el proyecto deja de mantenerse.
- En Mac de 64 GB es necesario fijar `iogpu.wired_limit_mb=59000` y el ajuste se pierde en cada reinicio; superar ese limite provoca que macOS se quede sin memoria.
- El binario descargado por navegador queda en cuarentena en macOS y requiere `xattr -dr com.apple.quarantine`; la descarga por `curl` no.
- Volumen de adopcion bajo (135 descargas, 11 likes) y ficha publicada y actualizada en apenas dos dias: menor rodaje en produccion que otras alternativas.

## Enlaces

- Pack en HuggingFace: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-2.6bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de sushi: https://github.com/beamivalice/sushi
- Binario de sushi para macOS arm64: https://github.com/beamivalice/sushi/releases/latest/download/sushi-bin-macos-arm64.tar.gz
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- README oficial del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Pack hermano Sushi-2bpw: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-2bpw
- Pack hermano Sushi-3bpw: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-3bpw
- Pack comparable mlx-serve mixed-4-8bit: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Pack comparable mlx-serve iQ-MLX 3.3bpw: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw
- Guia externa de hardware para Qwen3.8-Flash-Next en local: https://www.runaihome.com/blog/qwen38-flash-next-local-ai-hardware-guide-2026/
