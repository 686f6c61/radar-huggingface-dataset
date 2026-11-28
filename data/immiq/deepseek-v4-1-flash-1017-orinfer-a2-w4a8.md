# immiq/DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8

## Resumen

DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8 es una cuantización de precisión mixta W4A8 del modelo base DeepSeek-V4.1-Flash-1017, publicada por el usuario immiq y orientada específicamente al hardware Ascend 910B de Huawei. No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint de pesos cuantizados con calibración de activaciones, pensado para ejecutarse en el runtime propietario Orinfer sobre CANN 9.2 en Linux aarch64. El modelo base conserva la licencia MIT y soporta texto, modo thinking, herramientas de función DSML, visión de una o varias imágenes y decodificación especulativa paralela DSpark.

El checkpoint contiene 534.157.673.840 parámetros totales según los safetensors publicados, con un repositorio de 881,1 GB que incluye 205 contenedores safetensors (508,41 GiB) y 206 GiB de tablas Engram residentes en host. La revisión de 2026-11-26 sustituye el checkpoint rotado QuaRot32 por una recuantización sin rotación basada en SmoothQuant y GPTQ con Hessian de orden de activación sobre 262.144 tokens, lo que reduce el KL medio frente al modelo oficial MXFP4+FP8 en un 35,2 % respecto a la revisión anterior.

Su relevancia es doble: por un lado demuestra que es posible servir un modelo de más de 500.000 millones de parámetros en 8 aceleradores Ascend 910B3 con TP8 manteniendo 7,35 GiB de HBM libre por tarjeta y caché de prefijo completa de 4,64 GiB; por otro, documenta con detalle poco habitual el proceso de cuantización (calibración por grafo de ejecución, protección de capas sensibles, escalas cerradas por canal), lo que lo convierte en referencia para quien trabaje en despliegue de modelos masivos en aceleradores no NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek-V4.1; el checkpoint es una cuantización W4A8 del mismo) |
| Parametros totales | 534.157.673.840 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la configuración de servido reserva 262.144 MiB de KV offload y 8.192 MiB de caché de prefijo) |
| Tipos de cuantizacion | W4A8 (SmoothQuant + GPTQ con Hessian de orden de activación), capas W8 selectivas (L15, L39), expertos enrutados W8 sin pérdida en el draft DSpark, BF16 en wq_a/wkv de fuentes KV compartidas (L02, L08, L14, L20) |
| Idiomas soportados | zh, en |
| Licencia | MIT |
| Formato de pesos | safetensors (205 contenedores, 508,41 GiB; layout Transposed-NZ) |

## Arquitectura y entrenamiento

El checkpoint no aporta información sobre la arquitectura interna del modelo base más allá de la etiqueta `deepseek_v41` y de la presencia de componentes identificables: 40 capas transformer con atención (wq_a, wq_b, wkv, indexer), mezcla de expertos enrutados y expertos compartidos (shared_experts con w3/w2), módulos MTP (mtp.0/1/2) para decodificación especulativa DSpark, y tablas Engram residentes en host. El modelo base fue entrenado por DeepSeek; esta publicación solo documenta el proceso de cuantización, no el preentrenamiento ni el ajuste por RLHF/DPO.

La innovación técnica principal es el pipeline de cuantización reproducible mediante `orinfer_build.models.deepseek_v41.calibrate_norot` y `quantize_norot`. Se elimina la rotación global QuaRot32 y las transformaciones AWQ heredadas para mantener los pesos en la rejilla nativa MXFP4 de potencias de dos. La calibración de activaciones se realiza sobre 262.144 tokens disjuntos multi-dominio y se aplica SmoothQuant sin sobrecoste en `q_norm → wq_b + indexer.wq_b` (40 capas, hasta −92 % de error), `attn_norm → wq_a + wkv + indexer.weights_proj` (36 capas W8A8 no fuente KV, hasta −56 %) y expertos compartidos (hasta −58 %). Las 38 capas W4 de expertos enrutados usan GPTQ con Hessian bloqueado en orden de activación, con escalas óptimas en forma cerrada por canal y refinamiento Gauss-Seidel en capas concretas, logrando NMSE de peso entre 0,00066 y 0,00322, de 2 a 7 veces inferior a la cuantización sin datos. Las capas L15 y L39 se mantienen en W8 por auditoría de sensibilidad (L15 es la más sensible por un factor de 5).

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Modo thinking (razonamiento explícito) soportado por el modelo base.
- Llamada a funciones y herramientas mediante el formato DSML.
- Visión con soporte de una o varias imágenes por petición (caché de visión configurable, 1.024 MiB por defecto).
- Decodificación especulativa paralela DSpark con borradores MTP (mtp.0/1/2), configurables con `--mtp-drafts auto`.
- Caché de prefijo en dispositivo y offload de KV a host (262.144 MiB configurados).
- Ejecución en grafo completo (`--graph full`) sobre Ascend 910B3 con TP8.
- Capacidades multilingües limitadas a zh y en según los metadatos.

## Casos de uso

- Servicio de inferencia a gran escala en infraestructura Ascend: el checkpoint está calibrado y empaquetado para 8× Ascend 910B3 con TP8 y CANN 9.2, de modo que un equipo con parque Huawei puede desplegar un modelo de más de 500.000 millones de parámetros sin recurrir a GPU NVIDIA. La validación medida en Mini-Weka (240 s, c=16) sostiene 130 peticiones sin errores.
- Asistentes conversacionales multi-turno en chino e inglés: la caché de prefijo de 8.192 MiB y el offload de KV de 262.144 MiB permiten mantener contextos largos entre turnos, adecuado para atención al cliente o asistentes internos en esas dos lenguas.
- Automatización con herramientas: el soporte DSML de function calling permite integrar el modelo en flujos que consultan APIs, bases de datos o sistemas internos, con el bucle de agente gestionado por el orquestador externo.
- Análisis de documentos con imágenes: la visión multi-imagen con caché dedicada sirve para extracción de datos de capturas, formularios o diagramas en pipelines de digitalización.
- Razonamiento con modo thinking en tareas de análisis: útil para revisión de código, diagnóstico de incidencias o generación de informes donde interesa exponer la cadena de razonamiento antes de la respuesta final.
- Servicio de alta concurrencia con decodificación especulativa: DSpark con 69,84 % de aceptación en ventana de 256 y 4,4922 tokens comprometidos por ronda acelera la generación en despliegues con muchas peticiones simultáneas, manteniendo 7,35 GiB de HBM libre por tarjeta.
- Evaluación y reproducción de técnicas de cuantización: el pipeline `calibrate_norot`/`quantize_norot` y los logs en `benchmarks/a2-norot-gptq-sq-20261126.json` permiten reproducir y auditar el proceso, útil para investigadores que estudien cuantización W4A8 en aceleradores no NVIDIA.

## Benchmarks y rendimiento

Resultados verificados en 8× Ascend 910B3 TP8 con CANN 9.2, comparando la revisión actual con la rotada v0.4.5 y la variante sin datos v2:

| Metrica | v0.4.5 rotada | v2 sin datos | Esta revision |
|---|---:|---:|---:|
| KL medio (MXFP4+FP8 oficial ‖ modelo), 1.556 posiciones | 0,03075 | 0,02467 | 0,01992 |
| KL mediana / p95 | 0,00846 / 0,130+ | 0,00621 / 0,105 | 0,00533 / 0,07837 |
| KL medio (modelo ‖ oficial) | 0,03101 | 0,02384 | 0,01918 |
| Coincidencia de argmax oficial / cobertura top-3 | 94,15 % / — | 95,69 % / — | 95,76 % / 99,55 % |
| Aceptación DSpark (ventana 256, comprometidos/ronda) | 67,11 % (4,3555) | 70,47 % (4,5234) | 69,84 % (4,4922; test 81,56 %) |
| Mini-Weka congelado 240 s (c=16, seed=20261002) | 129 pet. (0 err) | 130 pet. (0 err) | 130 pet. (0 err) |
| Mini-Weka prefill / verify / draft (ms/iter) | 124,16 / 90,83 / 4,78 | 123,01 / 88,08 / 4,85 | 122,49 / 88,62 / 4,77 |
| HBM libre mínima por tarjeta en pico | 4,12 GiB | 7,34 GiB | 7,35 GiB |

No se han publicado en la información disponible resultados de benchmarks estándar de calidad (MMLU, HumanEval, GSM8K u otros) para este checkpoint ni para el modelo base.

## Requisitos de hardware

- Hardware objetivo: 8× Ascend 910B3 en TP8, CANN 9.2, Linux aarch64 con glibc 2.34 o superior. No es un checkpoint para GPU NVIDIA ni para CPU convencional.
- Memoria: 508,41 GiB de pesos en 205 contenedores safetensors, más 206 GiB de tablas Engram residentes en host (`ORINFER_A2_HOST_TABLE_MIB=212000`). HBM libre mínima medida en pico: 7,35 GiB por tarjeta.
- Caché: 8.192 MiB de caché de prefijo en dispositivo y 262.144 MiB de offload de KV a host; 1.024 MiB de caché de visión.
- Despliegue: exclusivamente mediante el runtime Orinfer. Requiere instalar el paquete de ejecución `orinfer-exec-deepseek-v41-flash-1017-w4a8-ascend910b-norot-gptq-sq-20261126.tar.xz` (sha256 `dd025b1a40bbac004395a4c812cd67f087076c6467be2a69738c0545f8e51d27`), validar con `orinfer validate-model` y servir con `orinfer serve`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ni con los paquetes de ejecución rotados v0.3.x/v0.4.0.
- Throughput observado: 130 peticiones en 240 s con concurrencia 16 y 22.656 tokens de decodificación; prefill de 122,49 ms por iteración, verify de 88,62 ms y draft de 4,77 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| immiq/DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8 (esta ficha) | 534.157.673.840 | no disponible | MIT | Hugging Face, runtime Orinfer sobre Ascend 910B | W4A8 calibrado con SmoothQuant + GPTQ; 3.152 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | MIT (heredada) | Hugging Face | Pesos oficiales en MXFP4+FP8; referencia de calidad para el KL |
| Revisión rotada v0.4.5 del mismo autor | 534.157.673.840 | no disponible | MIT | Hugging Face (tags historicos) | QuaRot32 + AWQ; KL medio 0,03075, peor que la actual |
| Variante sin datos v2 (SSZ-W4 + L38–39 W8) | 534.157.673.840 | no disponible | MIT | Hugging Face (tags historicos) | Cuantización sin calibración de activaciones; KL medio 0,02467 |

No se dispone de datos de benchmarks estándar ni de comparación con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del runtime Orinfer y del hardware Ascend 910B: no se puede ejecutar en GPU NVIDIA, CPU ni en otros aceleradores, lo que limita gravemente su portabilidad.
- Incompatibilidad con los paquetes de ejecución rotados anteriores (v0.3.x, v0.4.0); actualizar sin el paquete `engram.cast_fp32` correspondiente rompe la ejecución.
- Idiomas limitados a chino e inglés según los metadatos; el rendimiento en castellano u otras lenguas no está documentado y previsiblemente será inferior.
- Riesgo de alucinación y sesgos heredados del modelo base DeepSeek-V4.1-Flash-1017; la cuantización W4A8 introduce además una divergencia medible respecto a los pesos oficiales (KL medio de 0,01992, coincidencia de argmax del 95,76 %), de modo que las respuestas no son idénticas al modelo de referencia.
- El repositorio ocupa 881,1 GB y requiere 206 GiB de memoria host para las tablas Engram, además de la HBM de las ocho tarjetas; el aprovisionamiento es costoso.
- Solo 2 likes y 3.152 descargas en el momento de la consulta: comunidad pequeña y poca validación independiente más allá de los benchmarks del propio autor.
- La licencia MIT se hereda del modelo base, pero conviene verificar las condiciones de uso del modelo DeepSeek original y de CANN/Orinfer para despliegues comerciales.
- Los benchmarks publicados miden fidelidad respecto al modelo oficial y throughput, no calidad de tarea (razonamiento, código, matemáticas); no hay evidencia publicada de rendimiento en MMLU, HumanEval o GSM8K para este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/immiq/DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Métricas y logs de validación: benchmarks/a2-norot-gptq-sq-20261126.json (incluido en el repositorio del modelo)
- Paquete de ejecución: orinfer-exec-deepseek-v41-flash-1017-w4a8-ascend910b-norot-gptq-sq-20261126.tar.xz (sha256 dd025b1a40bbac004395a4c812cd67f087076c6467be2a69738c0545f8e51d27)
- Commit de origen: 14a30a9307476597ee2e1e325f0feae5c8e3f38e
