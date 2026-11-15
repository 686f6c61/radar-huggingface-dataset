# changh95/motif-3-bh-galaxy

## Resumen

`changh95/motif-3-bh-galaxy` es un paquete de despliegue autocontenido para servir el modelo `Motif-Technologies/Motif-3` sobre una plataforma Tenstorrent Blackhole Galaxy (32 chips). No se trata de un modelo nuevo entrenado desde cero, sino de una finetune/bundle publicado por el usuario `changh95` que empaqueta los pesos originales de Motif-3 junto con la configuración de hardware, kernels compilados y manifiesto de servicio para ejecutarse mediante `tt-model-manager` y un plugin de vLLM para TT-Metal.

Motif-3 es un modelo de lenguaje de arquitectura Mixture-of-Experts con 314B parámetros totales y 13.2B parámetros activos, compuesto por 384 expertos más un experto compartido y una capa MTP (multi-token prediction). El bundle expone 32.768 tokens de contexto, hasta 32 secuencias concurrentes y decodificación especulativa propia mediante la capa MTP, con atención en paralelo tensorial de 8 vías y MoE en paralelo de expertos de 32 vías.

Su relevancia es fundamentalmente de infraestructura: demuestra cómo servir un MoE de gran escala en hardware no-GPU (Tenstorrent Blackhole) con una pila compatible con OpenAI, sin Docker, y con métricas de rendimiento publicadas (throughput, TTFT, aceptación de especulación y evaluaciones en matemáticas y GPQA). Está licenciado bajo MIT y el repositorio ocupa 1.2 GB (los pesos reales, unos 630 GB, se descargan aparte).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con 384 expertos + 1 compartido y 1 capa MTP |
| Parametros totales | 314B |
| Parametros activos | 13.2B |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Expertos y KV cache en BFP8 en el despliegue de referencia; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Bundle propietario de `tt-model-manager` (manifiesto schema 5) con pesos descargados desde `Motif-Technologies/Motif-3` en la revisión `2ed2ed5c`; no se indica safetensors/GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 384 expertos enrutados más un experto compartido, 314B parámetros totales y 13.2B activos por token. Incluye una capa MTP (multi-token prediction) que se emplea en el bundle como decodificación especulativa propia (`mtp` launch), con tasas de aceptación reportadas de 0.86-0.92 en modo greedy y 0.69 en muestreo de texto real. El despliegue reparte la atención en paralelo tensorial de 8 vías y los expertos MoE en paralelo de 32 vías sobre una malla `(4, 8)` con fabric `FABRIC_2D_TORUS_XY` en 32 chips Blackhole.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF, DPO u otras fases de alineación, más allá de lo que indique la model card original de `Motif-Technologies/Motif-3`. La innovación destacable del bundle es la integración de decodificación especulativa MTP sin pérdida de distribución (verificada con test de distribución a 1 usuario y con prefill batch-invariant a 32 usuarios) y el empaquetado autocontenido con caché de pesos en dispositivo y compilación de kernels.

## Capacidades

- Generación de texto y razonamiento: evaluado en tareas de matemáticas y conocimiento (Math500, AIME24, GPQA Diamond) con modo "thinking" activado.
- Razonamiento matemático: resultados de 97.0-99.0 en `r1_math500` y 82.7-88.0 en `r1_aime24` según el modo de lanzamiento.
- Conocimiento científico y de propósito general: 85.0-86.7 en `r1_gpqa_diamond`.
- Decodificación especulativa MTP integrada, con aceptación alta y sin degradación de la distribución de salida.
- Servidor compatible con la API de OpenAI en el puerto 20000 (o el siguiente libre).
- Soporte de peticiones greedy y muestreadas (temperatura, top-p) en modo `mtp`.
- Soporte de `logprobs` top-N, `logit_bias` y `min_p` en modo `plain` (rechazados en `mtp`).
- Prefix caching configurable (activado por defecto, desactivable con `--no-enable-prefix-caching`).
- Modo de decodificación asíncrona (`MOTIF3_ASYNC_DECODE=off` para forzar decodificación síncrona).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente, aunque el modo thinking y el contexto de 32K lo permiten.

## Casos de uso

- Servicio de razonamiento matemático en producción: el modelo obtiene 97-99 en Math500 y 82.7-88.0 en AIME24, por lo que puede emplearse como motor de resolución de problemas con modo thinking para asistentes educativos o validación de soluciones.
- Evaluación de conocimiento científico: con 85.0-86.7 en GPQA Diamond, es adecuado para tareas de preguntas de nivel posgrado en física, química y biología dentro de pipelines de evaluación o generación de material técnico.
- Despliegue en hardware no-GPU: el bundle está pensado para una Blackhole Galaxy de 32 chips, lo que permite servir un MoE de 314B sin depender de clústeres de A100/H100 y con una pila compatible con OpenAI.
- Atención al cliente multi-turno con contexto largo: los 32.768 tokens de contexto y el prefix caching permiten mantener conversaciones extensas y reutilizar prefijos comunes entre peticiones.
- Generación de código y texto en pipelines internos: el servidor compatible con OpenAI permite integrarlo en aplicaciones existentes que ya consumen esa API, con hasta 32 secuencias concurrentes.
- Procesamiento por lotes de documentos largos: con TTFT de 0.61 s para 1.024 tokens de entrada y 12.28 s para 32.640 tokens, es viable para resúmenes y extracción sobre documentos extensos en una sola petición.
- Benchmarking y validación de infraestructura: el paquete incluye informes de benchmarks y evaluaciones en `reports/benchmarks/` y `reports/evals/`, útil para comparar el rendimiento de TT-Metal frente a otras pilas.
- Investigación sobre decodificación especulativa: la capa MTP y los tests de distribución publicados permiten estudiar la pérdida (o ausencia de ella) en decodificación especulativa con muestreo.

## Benchmarks y rendimiento

Evaluaciones publicadas por el autor (lm-eval, muestreo en dispositivo con temperatura 1.0, top-p 0.95, thinking on, contexto de 32K):

| Tarea | Problemas | `mtp` (muestreo especulativo) | `plain` (síncrono) |
|---|---|---|---|
| `r1_math500` | 100 | 97.0 | 99.0 |
| `r1_aime24` | 75 | 82.7 | 88.0 |
| `r1_gpqa_diamond` | 120 | 85.0 | 86.7 |

Rendimiento de decodificación en modo `mtp` greedy (tokens/s por usuario):

| Usuarios \ in/out | 128/1024 | 1024/1024 |
|---|---|---|
| 1 | 53.7 | 51.5 |
| 2 | 50.9 | 48.0 |
| 4 | 46.1 | 42.9 |
| 8 | 40.0 | 36.2 |
| 16 | 35.0 | 27.2 |
| 32 | 26.6 | 21.2 |

Throughput agregado en modo `mtp` greedy (tokens/s):

| Usuarios \ in/out | 128/1024 | 1024/1024 |
|---|---|---|
| 1 | 54 | 51 |
| 2 | 100 | 95 |
| 4 | 181 | 170 |
| 8 | 312 | 282 |
| 16 | 549 | 428 |
| 32 | 832 | 666 |

TTFT medio por usuario en modo `mtp` greedy (ms):

| Usuarios \ in/out | 128/1024 | 1024/1024 |
|---|---|---|
| 1 | 216 | 615 |
| 2 | 270 | 717 |
| 4 | 388 | 957 |
| 8 | 393 | 1.099 |
| 16 | 574 | 1.487 |
| 32 | 750 | 2.322 |

Modo `plain` (decodificación asíncrona), greedy, TTFT ms / tiempo por token de salida ms / tokens/s agregados:

| Usuarios \ in/out | 128/1024 | 1024/128 |
|---|---|---|
| 1 | 220 / 29.4 / 34 | 620 / 29.4 / 29 |
| 8 | 797 / 34.0 / 230 | 2.009 / 42.3 / 139 |
| 32 | 1.438 / 40.9 / 756 | 3.170 / 94.0 / 271 |

Muestreo de texto real (SPEED-Bench, 128 tokens de entrada, hasta 1.024 de salida, temperatura 1.0, top-p 0.95), TTFT ms / tiempo por token ms / tokens/s agregados:

| Usuarios | `mtp` (aceptación 0.69) | `plain` (síncrono) |
|---|---|---|
| 1 | 235 / 20.7 / 48 | 237 / 31.5 / 32 |
| 8 | 432 / 27.6 / 245 | 561 / 37.5 / 186 |
| 32 | 680 / 43.4 / 658 | 792 / 48.6 / 574 |

Prompts largos, 1 usuario, TTFT en segundos:

| Tokens de entrada | 1.024 | 2.048 | 4.096 | 8.192 | 16.384 | 32.640 |
|---|---|---|---|---|---|---|
| TTFT | 0.61 | 0.64 | 0.77 | 2.11 | 5.07 | 12.28 |

Con prefix caching activado (como se distribuye), tiempo por token de salida para 128/1024: `mtp` 19.2 ms a 1 usuario y 35.6 ms a 32 usuarios; `plain` 30.4 / 42.1 ms.

## Requisitos de hardware

- Hardware objetivo: una Tenstorrent Blackhole Galaxy con 32 chips (p150x32), malla `(4, 8)` y fabric `FABRIC_2D_TORUS_XY`. No es un modelo ejecutable en GPU convencional con este bundle.
- Almacenamiento: aproximadamente 630 GB de pesos más unos 344 GB de caché de pesos en dispositivo (`TT_MODEL_MODELS_DIR`).
- Requisito de software: SFPI 7.84.0 (el script `sfpi_install.sh` del bundle lo instala sin sudo) y `tt-smi` fuera del `PATH` al ejecutar `tt-model` (tt-model-manager hasta `7994e0a` no reconoce el tipo de placa `tt-galaxy-bh`).
- Arranque: la primera ejecución escribe la caché de pesos y compila kernels en unos 95 minutos; los arranques posteriores tardan unos 2 minutos.
- Despliegue: `tt-model-manager` 0.1.0 (manifiesto schema 5) con plugin de vLLM para TT-Metal; servidor compatible con OpenAI en el puerto 20000. No requiere Docker.
- VRAM estimada en GPU: no disponible; el bundle no está pensado para GPU y no se publican estimaciones de memoria para A100, H100 o RTX 4090.
- Latencia y throughput: ver la sección de benchmarks (hasta 832 tokens/s agregados a 32 usuarios en modo `mtp` greedy con 128/1024).

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Hardware de referencia |
|---|---|---|---|---|
| `changh95/motif-3-bh-galaxy` (este bundle) | 314B / 13.2B | 32.768 | MIT | Tenstorrent Blackhole Galaxy (32 chips) |
| `Motif-Technologies/Motif-3` (modelo base) | 314B / 13.2B | no disponible en la información | MIT | no disponible |
| Alternativas MoE de escala similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El bundle está acoplado a hardware Tenstorrent Blackhole Galaxy; no es portable a GPU ni a otras plataformas sin trabajo adicional.
- El modo `mtp` rechaza peticiones con `logprobs` top-N, `logit_bias` y `min_p` en muestreo; para esos casos hay que usar `MOTIF3_LAUNCH=plain`.
- El contexto máximo es de 32.768 tokens; entradas de 32.640 tokens ya consumen casi toda la ventana y dejan poco margen para la salida.
- El primer arranque tarda unos 95 minutos por compilación de kernels y escritura de la caché de pesos.
- Requiere SFPI 7.84.0 y que `tt-smi` no esté en el `PATH`; versiones de tt-model-manager hasta `7994e0a` no reconocen la placa `tt-galaxy-bh`.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; no hay información sobre tool calling ni soporte de agentes.
- Los pesos no están en el repositorio (1.2 GB); hay que descargarlos aparte desde `Motif-Technologies/Motif-3` en la revisión `2ed2ed5c`, lo que añade dependencia de ese repositorio.
- La licencia es MIT, lo que permite uso comercial, pero conviene revisar la licencia del modelo base enlazada en la model card (`LICENSE.md` de Motif-3) por si impone condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face del bundle: https://huggingface.co/changh95/motif-3-bh-galaxy
- Modelo base: https://huggingface.co/Motif-Technologies/Motif-3
- Pesos del modelo base (revisión `2ed2ed5c`): https://huggingface.co/Motif-Technologies/Motif-3/tree/2ed2ed5cfabffa10fdabb2fc0d0288f8e6de893a
- Licencia del modelo base: https://huggingface.co/Motif-Technologies/Motif-3/blob/main/LICENSE.md
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
