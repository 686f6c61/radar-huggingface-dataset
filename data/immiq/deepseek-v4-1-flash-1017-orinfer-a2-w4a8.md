# immiq/DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8

## Resumen

DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8 es una distribución cuantizada del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario immiq para su uso con el motor de inferencia propietario Orinfer v0.4.0 sobre hardware Ascend 910B (NPU de Huawei). No se trata de un modelo nuevo entrenado desde cero, sino de un empaquetado de pesos en formato safetensors con cuantización W4A8 (pesos de 4 bits, activaciones de 8 bits) optimizado específicamente para el runtime Orinfer, el paquete de ejecución A2 y el stack CANN 9.2 en Linux aarch64 con glibc 2.34 o superior.

El modelo base, DeepSeek-V4.1-Flash-1017, pertenece a la familia DeepSeek V4.1 de DeepSeek, según los tags y la nomenclatura del repositorio. El empaquetado conserva capacidades de texto, modo de razonamiento (thinking), function calling, procesamiento de imágenes (incluidas múltiples imágenes) y borradores paralelos DSpark para decodificación especulativa. El repositorio ocupa 557,7 GB y declara 513.773.354.864 parámetros totales según los metadatos de safetensors, lo que lo sitúa en la categoría de modelos de gran escala.

Su relevancia es acotada pero específica: es una de las pocas distribuciones públicas de un modelo de esta familia preparadas para inferencia nativa en Ascend 910B con un motor alternativo a vLLM o TGI, con un paquete de ejecución verificado y un esquema de cuantización W4A8 pensado para reducir la huella de memoria en NPU. La licencia MIT del empaquetado facilita su uso, aunque las condiciones reales dependen del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia DeepSeek V4.1; detalles internos no disponibles) |
| Parametros totales | 513.773.354.864 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (pesos 4 bits, activaciones 8 bits); safetensors de 8 bits según tags |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Motor de inferencia | Orinfer v0.4.0 (runtime nativo + archivo de ejecución A2) |
| Hardware objetivo | Ascend 910B (TP8), CANN 9.2, Linux aarch64, glibc 2.34+ |
| Tamaño del repositorio | 557,7 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base DeepSeek-V4.1-Flash-1017 (número de capas, configuración de atención, posible mezcla de expertos, etc.). El empaquetado de immiq es una cuantización W4A8 del modelo base, con pesos almacenados en safetensors y un paquete de ejecución específico para el motor Orinfer sobre Ascend 910B. El runtime incorpora mecanismos de decodificación especulativa mediante borradores paralelos DSpark: el paquete de ejecución declara 192 filas de verificación del decodificador, con un ancla por propietario, de modo que 32 propietarios pueden usar hasta 5 borradores cada uno cuando resulta rentable. La opción `--mtp-drafts auto` selecciona adaptativamente ese número de borradores.

El paquete también describe optimizaciones de serving para TP8 de larga duración: división de la ejecución A2 en subprogramas Trunk/Tail/Head para reutilización de ACL Graph entre cohortes, agrupación de arenas fijas de propietarios inactivos, liberación por lotes de páginas VMM, gathers Engram residentes con compartición entre capas 1 y 14, protección de expulsión de claves de grafo activas, cachés de grafo acotadas a 96 programas, rollback de linaje de propietarios entre rangos ante `SaveSkipped` asimétrico, fallbacks no fatales ante OOM para diarios de verificación y offload de prefijo, aislamiento de errores de muestreo restringido especulativo por fila y métricas Prometheus de salud para A2. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si el modelo base empleó RLHF o DPO.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Modo de razonamiento (thinking), según la descripción del paquete de ejecución.
- Function calling y uso de herramientas (function tools).
- Procesamiento de imágenes y de múltiples imágenes en una misma petición.
- Borradores paralelos DSpark para decodificación especulativa con verificación por lotes.
- Caché de prefijo (`--prefix-cache-mib`) y offload de KV (`--kv-offload-mib`) para conversaciones largas.
- Serving multi-petición con colas, timeouts configurables y drenaje controlado.
- No se dispone de información sobre soporte de audio, agentes multi-paso autónomos ni otras capacidades especiales más allá de las citadas.

## Casos de uso

- Despliegue de inferencia en clústeres Ascend 910B: el paquete está diseñado para servir el modelo con TP8 sobre 8 NPU Ascend 910B3 con CANN 9.2, lo que permite aprovechar infraestructura Huawei existente sin depender de GPUs NVIDIA.
- Asistente conversacional bilingüe chino-inglés: el modelo declara soporte de zh y en, con modo thinking y function calling, adecuado para atención al cliente o asistentes internos en entornos donde esos dos idiomas son prioritarios.
- Análisis de documentos con imágenes: la capacidad de procesar múltiples imágenes por petición permite tareas de extracción de información de capturas, formularios o figuras dentro de un mismo contexto.
- Automatización con herramientas: el soporte de function tools permite integrar el modelo en flujos que consultan APIs, bases de datos o servicios internos mediante llamadas estructuradas.
- Serving de larga duración con caché de prefijo: la configuración de `--prefix-cache-mib 8192` y `--kv-offload-mib 262144` está pensada para cargas con prompts repetidos o conversaciones extensas, reduciendo el coste de reprocesamiento.
- Evaluación y benchmarking de motores alternativos: al incluir un registro de aceptación (`benchmarks/a2-v0.4.0-acceptance-20261122.json`) y pruebas de humo TP8, sirve para comparar Orinfer frente a otros runtimes en hardware Ascend.
- Entornos con requisitos de verificación de integridad: el comando `orinfer validate-model` permite una comprobación explícita de hashes del contenido, útil en despliegues con controles de cadena de suministro.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible corresponden a pruebas de aceptación del motor, no a benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.):

| Prueba | v0.3.14 | v0.4.0 |
|---|---|---|
| Carga Frozen Mini de 240 s (8× Ascend 910B3) | 71 y 70 peticiones en dos ensayos | 73 peticiones |
| Errores | 0 | 0 |
| Tokens de prefill | 1.856.174 | 1.935.331 |
| Tokens de decode | 10.825 | 11.341 |
| Latencia agregada (peticiones idénticas) | +10,7 % y +5,1 % respecto a v0.3.13 | no disponible |

Pruebas de calidad del motor: `make check` con 762 tests Rust, 491 tests Python de CPU y 15 comprobaciones de fixtures; inspección ABI de glibc 2.34; prueba de humo TP8 con 14 peticiones, cero errores y salida 0 con las 8 NPU inactivas al terminar.

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: 8× Ascend 910B3 en TP8 (topología de 8 NPU).
- Software: Linux aarch64, glibc 2.34 o superior, CANN 9.2, Orinfer v0.4.0 y el archivo de ejecución A2 correspondiente (digest `ce7a1cec548914645bf31ae9e695da038ec1506c895138ecbe61906688ac3687`).
- Memoria de host: el perfil recomendado mantiene la tabla Engram completamente residente y requiere aproximadamente 206 GiB de memoria de host, además de otra memoria del sistema; `ORINFER_A2_HOST_TABLE_MIB=212000` configura ese modo.
- Caché de visión: `ORINFER_VISION_CACHE_MIB=1024`.
- Caché de prefijo: 8 GiB (`--prefix-cache-mib 8192`); offload de KV: 256 GiB (`--kv-offload-mib 262144`).
- No cabe en GPU de consumo: el tamaño del repositorio (557,7 GB) y la topología TP8 sobre NPU Ascend lo excluyen de RTX 4090 u otras GPU consumer.
- Opciones de despliegue: exclusivamente el servidor `orinfer serve` con el paquete de ejecución A2; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta distribución.
- Latencia y throughput: en la carga Frozen Mini de 240 s se completaron 73 peticiones sin errores en v0.4.0; no se publican cifras de latencia por token ni de throughput sostenido más allá de ese experimento.
- El periodo de gracia para terminación externa debe superar los 120 segundos; se recomienda configurar autenticación antes de exponer el servidor fuera del host de confianza.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La siguiente tabla recoge únicamente los datos del modelo base y de esta distribución:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8 | 513.773.354.864 | no disponible | W4A8 | MIT | Ascend 910B TP8 |

No se han identificado en la información disponible alternativas comparables de la misma categoría (mismo tamaño o misma tarea) con datos verificables de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Distribución específica de hardware: solo funciona con Orinfer v0.4.0 sobre Ascend 910B, CANN 9.2 y glibc 2.34+; no es portable a GPU NVIDIA ni a otros runtimes.
- Idiomas limitados: la model card declara únicamente chino e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones equivalentes que permitan estimar la calidad del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan medidas específicas de mitigación en esta distribución.
- Sesgos: no se dispone de información sobre sesgos conocidos del modelo base ni de esta cuantización.
- Restricciones de licencia: el empaquetado declara MIT, pero el uso comercial está sujeto a las condiciones del modelo base DeepSeek-V4.1-Flash-1017, que no se detallan en la información disponible; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- Requisitos de memoria de host elevados: el modo residente de la tabla Engram exige unos 206 GiB adicionales; el modo respaldado por fichero (`ORINFER_A2_HOST_ROW_CACHE_MIB`) no es el usado en las pruebas de rendimiento y puede comportarse de forma distinta.
- Integridad: la carga normal no escanea hashes de payload; para verificación explícita hay que ejecutar `orinfer validate-model`.
- Operación: hay que mantener juntos el motor, la revisión del modelo y el archivo de ejecución para poder revertir; el ID de modelo en los clientes debe coincidir con `--model`.
- Seguridad: se debe configurar autenticación antes de exponer el servidor fuera del host de confianza.

## Enlaces

- Repositorio del modelo: https://huggingface.co/immiq/DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Release v0.4.0 de Orinfer: https://github.com/iMMIQ/orinfer/releases/tag/v0.4.0
- Registro de aceptación A2 v0.4.0: benchmarks/a2-v0.4.0-acceptance-20261122.json (referenciado en la model card)
