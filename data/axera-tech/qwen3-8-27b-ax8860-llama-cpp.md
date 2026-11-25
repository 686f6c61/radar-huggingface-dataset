# AXERA-TECH/Qwen3.8-27B-AX8860-llama.cpp

## Resumen

Qwen3.8-27B-AX8860-llama.cpp es un paquete de despliegue, publicado por AXERA-TECH, que permite ejecutar el modelo Qwen/Qwen3.8-27B sobre la NPU del SoC Axera AX8860 mediante una bifurcación de llama.cpp con kernels ggml específicos para dicha NPU (ggml-axera). No se trata de un modelo entrenado por AXERA, sino de una distribución lista para el hardware: incluye los pesos cuantizados en MXFP4 (14,8 GB), el codificador visual en BF16 (931 MB), los binarios estáticos para la placa, los kernels NPU y scripts de ejecución y benchmark.

El modelo subyacente es Qwen3.8-27B, con 27.320.697.856 parámetros totales según los safetensors del modelo base, capacidades multimodales (texto e imagen) y una ventana de contexto de hasta 262.144 tokens. La propuesta de valor del paquete es doble: por un lado, llevar un modelo de 27B a un dispositivo de borde con NPU en lugar de GPU; por otro, ofrecer decodificación especulativa MTP opcional que, según la model card, eleva el throughput de 13,8 a 35,1 tokens/s en código, con tasas de aceptación de hasta 0,785.

Es relevante ahora porque demuestra que un modelo denso de 27B con visión y contexto largo puede servirse con una API compatible con OpenAI en hardware de bajo consumo, con memoria de checkpoint en caché que no crece linealmente con el contexto. La ficha se centra en los datos verificables publicados por el autor; cualquier dato ausente se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; el paquete usa llama.cpp con kernels ggml-axera para NPU AX8860) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens (por defecto 16.384 en el servidor; configurable con `CTX`) |
| Tipos de cuantizacion | MXFP4 para pesos (14,8 GB); BF16 para el codificador visual (931 MB) |
| Idiomas soportados | no disponible (la model card incluye pruebas en chino e inglés, sin lista oficial de idiomas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3.8-27b-mxfp4.gguf`, `mmproj-qwen3.8-27b-bf16.gguf`) |
| Tamano del repo | 19,4 GB |
| Hardware objetivo | Axera AX8860, SDK V0.5.1 o superior |
| Servidor | compatible con OpenAI, `-np 1`, 4 núcleos NPU en exclusiva |
| Descargas / likes | 2.376 / 1 |
| Fechas | creado 2026-10-29, actualizado 2026-11-24 |

## Arquitectura y entrenamiento

El paquete no documenta el entrenamiento del modelo base; la información disponible se limita al despliegue. Qwen3.8-27B es un modelo denso de 27,3B parámetros con entrada de texto e imagen, servido aquí a través de una bifurcación de llama.cpp (`ZHEQIUSHUI/llama.cpp`, rama `axera-dev`, commit `6613735ce`) que incorpora kernels ggml para la NPU del AX8860. Los pesos se distribuyen en MXFP4, un formato de 4 bits por bloque con escala compartida, lo que reduce el peso a 14,8 GB, y el codificador visual se mantiene en BF16.

La innovación técnica destacable es la decodificación especulativa MTP (multi-token prediction) opcional: el modelo lanza tres borradores de token por ronda y el modelo objetivo los verifica uno a uno, de modo que en decodificación greedy la salida es idéntica a la decodificación normal. También se documenta el uso de checkpoints rotativos (`-ctxcp 4`) para contexto largo, que mantienen el consumo de memoria estable en lugar de crecer linealmente con la longitud del prompt, y una caché de prompt de 4 GB en memoria del host que puede persistirse en SSD con `CACHE_DIR`. El servidor desactiva el modo de razonamiento por defecto (`--reasoning off`) y acepta mensajes de sistema en mitad de la conversación, algo necesario para clientes de agentes como Codex.

## Capacidades

- Generación de texto conversacional y completado, con plantilla de chat incluida (`chat_template.jinja`).
- Entrada de imagen: el paquete incluye codificador visual BF16 y el script admite `-i` para describir imágenes.
- Contexto largo de hasta 262.144 tokens, con gestión de memoria mediante checkpoints rotativos.
- Decodificación especulativa MTP opcional, con aceleraciones medidas de 1,46x a 2,52x según el tipo de contenido.
- Servidor compatible con OpenAI (`-s`), lo que habilita clientes y SDK estándar.
- Soporte de agentes y tool calling implícito en el servidor: acepta mensajes de sistema intermedios y permite ajustar `presence_penalty` por petición, pensado para clientes tipo Codex.
- Capacidades multilingües: la model card reporta pruebas en chino e inglés (traducción chino-inglés, redacción en ambos idiomas), sin lista formal de idiomas.
- Modo de razonamiento configurable en el servidor (desactivado por defecto).
- Benchmark reproducible incluido (`bench.sh`) y compatibilidad con `llama-bench` usando `-b 4096 -ub 4096`.

## Casos de uso

- Inferencia de borde sin GPU: desplegar un modelo de 27B con visión en un dispositivo AX8860 para entornos con restricciones de consumo y espacio, usando los binarios estáticos y los kernels NPU incluidos.
- Asistente de código en local: con MTP activado el modelo alcanza 35,1 tokens/s en contenido de código (aceptación 0,785), lo que lo hace utilizable para autocompletado y generación de parches en un servidor compatible con OpenAI integrado en el IDE.
- Agentes y tool calling: el servidor acepta mensajes de sistema intermedios y `presence_penalty` por petición, y el autor recomienda `presence_penalty: 0` para evitar que el modelo evite repetir nombres de fichero, números o código, algo crítico en pipelines de agentes.
- Procesamiento de documentos largos: con contexto de hasta 262.144 tokens y checkpoints rotativos, se pueden analizar informes, expedientes o bases de código extensas sin que la memoria crezca de forma lineal; el autor valida prompts de más de 60k tokens sin OOM.
- Descripción y análisis de imágenes: el codificador visual BF16 permite generar descripciones de imágenes o extraer información de capturas y documentos escaneados desde el propio dispositivo.
- Traducción automática: las pruebas de traducción chino-inglés con MTP muestran 28,6 tokens/s (2,09x), adecuado para traducción por lotes en local.
- Servicio multiusuario ligero: al ejecutarse con `-np 1` y ocupar los 4 núcleos NPU, encaja en despliegues de un solo flujo con requisitos de baja latencia más que en servicios de alta concurrencia.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (tokens/s, hasta 256 tokens generados, greedy salvo indicación):

| Contenido | Normal | MTP | Aceleración | Tasa de aceptación |
|---|---:|---:|---:|---:|
| Código | 13,9 | 35,1 | 2,52x | 0,785 |
| Traducción (chino-inglés) | 13,7 | 28,6 | 2,09x | 0,596 |
| Tabla Markdown | 13,8 | 31,0 | 2,25x | 0,687 |
| Matemáticas | 13,8 | 32,0 | 2,32x | 0,709 |
| Ensayo en chino | 13,7 | 20,6 | 1,51x | 0,342 |
| Relato en inglés | 13,7 | 20,4 | 1,49x | 0,338 |
| Código con muestreo | 13,7 | 29,0 | 2,12x | 0,618 |
| Ensayo con muestreo | 13,7 | 20,0 | 1,46x | 0,322 |

Rendimiento de prefill y decodificación:

| Escenario | Medición |
|---|---|
| Prefill de prompt de 3.908 tokens | 1.262 tokens/s (3,10 s) |
| Decodificación base | 13,8 tokens/s |
| Decodificación con MTP | hasta 35,1 tokens/s |
| Prompt de 4k con MTP | 13,5 → 20,8 tokens/s (1,54x, 32/90 aceptados) |
| Prompt de 3.908 tokens, `-c 8192` | 3,10 s de prefill, 13,6 tokens/s de decodificación |
| Prompt de 3.908 tokens, `-c 16384` | 3,09 s de prefill, 13,6 tokens/s de decodificación |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- NPU Axera AX8860 con SDK V0.5.1 o superior; el runtime ocupa los 4 núcleos NPU en exclusiva.
- Peso en disco: 14,8 GB para los pesos MXFP4 más 931 MB del codificador visual; repositorio completo de 19,4 GB.
- Memoria del host: caché de prompt de 4 GB por defecto, ampliable a disco con `CACHE_DIR`; el contexto largo usa checkpoints rotativos para no crecer linealmente.
- No se especifica VRAM ni requisitos de GPU: el paquete está diseñado para la NPU del AX8860, no para GPU de consumo.
- Opciones de despliegue: los scripts incluidos `run.sh` (texto, imagen, chat, servidor) y `bench.sh`; servidor compatible con OpenAI en el puerto indicado con `-s`; `llama-bench` compatible con `-b 4096 -ub 4096`.
- Throughput y latencia: 13,8 tokens/s en decodificación normal, hasta 35,1 tokens/s con MTP en código, y 1.262 tokens/s de prefill.
- Limitación operativa: en algunos entornos las peticiones consecutivas fallan con `ret = -3` y requieren reintento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-AX8860 (este paquete) | 27,3B | 262.144 | Sí (texto + imagen) | GGUF MXFP4 | no disponible | NPU Axera AX8860 |
| Qwen3.8-27B (modelo base) | 27,3B | no disponible en la información | Sí (según el paquete) | safetensors | no disponible | GPU / CPU según el ecosistema Qwen |
| Alternativas de 27B en GGUF para llama.cpp | no disponible | no disponible | no disponible | GGUF | varía | CPU / GPU |

No se dispone de datos de benchmarks comparativos frente a otras alternativas en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Dependencia de hardware: solo funciona en Axera AX8860 con SDK V0.5.1 o superior; no es ejecutable en GPU convencional con este paquete.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que consultar la licencia del modelo base Qwen/Qwen3.8-27B antes de producción.
- Idiomas no disponibles de forma oficial: las pruebas se limitan a chino e inglés; el rendimiento en castellano no está documentado.
- El modo de razonamiento está desactivado por defecto en el servidor; si se necesita, hay que habilitarlo explícitamente.
- La penalización de presencia por defecto es 0 en el servidor, distinta de la recomendada en la model card (1,5); con 1,5 el modelo evita repetir contenido del prompt, lo que perjudica a agentes y tool calls.
- Fallo intermitente `ret = -3` en peticiones consecutivas en algunos entornos; requiere lógica de reintento en el cliente.
- Concurrencia limitada: `-np 1` y uso exclusivo de los 4 núcleos NPU.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de fidelidad ni de sesgos.
- El contexto máximo de 262.144 tokens depende de la configuración (`CTX`); el valor por defecto es 16.384 y el consumo de memoria con contexto largo se gestiona con checkpoints, no con una ventana completamente residente.
- La decodificación MTP solo mantiene la equivalencia con la decodificación normal en modo greedy; con muestreo, la salida puede diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.8-27B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Código de llama.cpp para Axera: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `6613735ce`)
