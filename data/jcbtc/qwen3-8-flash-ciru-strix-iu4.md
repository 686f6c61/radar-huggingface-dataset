# jcbtc/Qwen3.8-Flash-CIRU-STRIX-IU4

## Resumen

Qwen3.8-Flash-CIRU-STRIX-IU4 es un paquete de pesos cuantizados en formato GGUF del modelo Qwen3.8-Flash-Next, adaptado por el usuario jcbtc para su ejecución nativa en hardware AMD Strix Halo (arquitectura RDNA 3.5, gfx1151, Radeon 8060S). No es una cuantización estándar de llama.cpp: emplea un formato compacto de expertos propio y una tabla de embeddings paginada en SSD (PLE) que requiere un runtime específico, el CIRU runtime, distribuido junto al modelo. El paquete incluye además un modelo borrador para predicción multi-token (MTP) y un proyector de visión.

El modelo base, Qwen3.8-Flash-Next, es un transformer multimodal de tipo image-text-to-text con 125.875.774.336 parámetros totales según los safetensors del repositorio, orientado a contexto largo y a cargas conversacionales con tool calling. La ficha del autor documenta con detalle el rendimiento del runtime (throughput multi-slot, correcciones de estado recurrente, gestión de caché de prompt en disco), pero no publica resultados de benchmarks de calidad del modelo.

La relevancia actual del paquete es doble: por un lado, demuestra que es viable servir un modelo de más de 125.000 millones de parámetros en una APU de consumo con memoria unificada, a costa de un runtime a medida; por otro, ilustra un patrón de distribución poco habitual, en el que el repositorio de pesos y el motor de inferencia están acoplados por versión. La licencia es qwen-community-1.0, no una licencia open source estándar, lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con predicción multi-token (MTP); detalles internos de capas y atención no disponibles |
| Parámetros totales | 125.875.774.336 (según safetensors del repositorio) |
| Parámetros activos | no disponible (no se confirma que sea MoE, aunque el runtime menciona "compact expert format") |
| Longitud de contexto | no disponible como cifra oficial; el autor valida escenarios de hasta 100.000 tokens por slot y pools de unos 328.000 tokens |
| Tipos de cuantización | IU4 (formato compacto propietario del runtime CIRU); el repositorio conserva además un GGUF v4.4.1 y un GGUF v5.0 versionado |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license_name en la model card; tag license:other) |
| Formato de pesos | GGUF (llama.cpp) con tabla de embeddings paginada en SSD (`ple/`) y modelo borrador MTP separado |

## Arquitectura y entrenamiento

La información disponible describe el empaquetado y el runtime, no el entrenamiento del modelo base. Qwen3.8-Flash-Next es un transformer multimodal que acepta texto e imagen y que incorpora un cabezal de predicción multi-token: el repositorio incluye un modelo borrador MTP que acelera la decodificación especulativa. El runtime menciona explícitamente un "compact expert format", lo que sugiere componentes de mezcla de expertos, pero no se detalla el número de expertos, su tamaño ni el reparto de parámetros activos.

El paquete IU4 sustituye la cuantización convencional por un formato de expertos compacto y una tabla de embeddings paginada en disco (tres ficheros bajo `ple/`), lo que permite mantener el modelo en una APU con memoria unificada limitada a cambio de exigir almacenamiento local rápido. El runtime CIRU implementa además caché de prompt en disco opcional (`PROMPT_CACHE_DISK_MIB`), decodificación multi-slot agrupada en una sola pasada y correcciones específicas de estado recurrente (reinicio con relleno de ceros para evitar NaN/Inf en slots reciclados). No se han publicado datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de contexto muy largas (validado por el autor hasta 100.000 tokens por slot).
- Entrada de imágenes: pipeline image-text-to-text con proyector propio; el autor documenta pruebas de reconocimiento de sujeto en fotografías con hasta 32 definiciones de herramientas en el prompt.
- Tool calling y function calling: las pruebas de regresión del runtime se basan en definiciones de herramientas y verifican que el modelo responde sobre la imagen sin invocar herramientas espurias.
- Razonamiento multi-paso: el runtime expone un modo "thinking" (mencionado en las tablas de rendimiento como "thinking on").
- Decodificación especulativa mediante modelo borrador MTP (MTP3 en las mediciones).
- Servicio multi-slot con slots agrupados y caché de conversaciones en RAM o en disco.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo en estación de trabajo local: con 100.000 tokens por slot y caché de prompt en disco, permite mantener conversaciones de 65.000 a 92.000 tokens y retomarlas releyendo solo 55 tokens (unos 3 segundos), adecuado para análisis de documentación extensa sin salir del equipo.
- Automatización con herramientas sobre documentos e imágenes: el modelo acepta texto e imagen junto a decenas de definiciones de herramientas; útil para flujos donde hay que decidir entre consultar un fichero, una API o describir una captura.
- Procesamiento de capturas y documentos escaneados: el proyector de visión y las pruebas de reconocimiento de sujeto con 0 a 32 herramientas lo hacen apto para extraer información de imágenes dentro de un pipeline mayor.
- Servicio multiusuario en una única APU: con cuatro slots agrupados el runtime alcanza 49,9 tok/s agregados con unos 240.000 tokens en pool, suficiente para un pequeño equipo interno sobre una Radeon 8060S.
- Evaluación e investigación de cuantizaciones extremas: el paquete sirve como banco de pruebas para estudiar el equilibrio entre formato compacto de expertos, paginación de embeddings en SSD y latencia en hardware de consumo.
- Desarrollo y depuración de runtimes de inferencia: las notas de versión documentan fallos concretos (estado recurrente no finito, vida útil de buffers de grafo HIP, imágenes invisibles en prompts largos) y sus reproducciones, material útil para quien mantenga motores propios.
- Prototipado de agentes con decodificación especulativa: el borrador MTP y el modo thinking permiten medir el coste real de la aceleración especulativa en cargas agénticas antes de migrar a hardware de数据中心.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que no se repitió ningún benchmark amplio de calidad para la versión v6.0.0.

Sí se publican mediciones de throughput del runtime, sobre Radeon 8060S con pesos IU4, MTP3 y modo thinking activado:

| Caso (cuatro slots agrupados) | v5.5.8 | v6.0.0 |
|---|---:|---:|
| 4 slots generando, ~240k tokens en pool, total | 21,4 tok/s | 49,9 tok/s |
| 4 slots generando, ~328k tokens en pool, total | 11,3–12,1 tok/s | 42,0–42,6 tok/s |
| 2 slots generando, ~328k tokens en pool, total | 11,5 tok/s | 37,3 tok/s |
| 1 slot generando, ~328k tokens en pool | 12,6 tok/s | 24,5 tok/s |
| 1 slot, perfil monousuario, 20.000 tokens | 34,9 tok/s | 35,5 tok/s |

Prueba de regresión de visión (cuatro fotografías, un slot, temperatura 0; se considera éxito si la respuesta nombra el sujeto sin invocar herramientas):

| Definiciones de herramienta | Tokens de prompt | v5.0.1 | v5.5.0 | v5.5.8 | v6.0.0 |
|---:|---:|---:|---:|---:|---:|
| 0 | 1.110 | 4/4 | 4/4 | 4/4 | 12/12 |
| 4 | 1.853 | 4/4 | 4/4 | 4/4 | 12/12 |
| 8 | 2.509 | 4/4 | 0/4 | 0/4 | 12/12 |
| 16 | 3.821 | 4/4 | 0/4 | 0/4 | 12/12 |
| 32 | 6.415 | 2/4 | 0/4 | 0/4 | 6/12 |

## Requisitos de hardware

- Memoria: el repositorio ocupa 210,2 GB, pero el paquete IU4 está pensado para ejecutarse en memoria unificada de una APU Strix Halo; no se publica la VRAM efectiva necesaria. Como referencia, los pesos de 125.875 millones de parámetros en 4 bits suponen un mínimo teórico de unos 63 GB, antes de caché KV, proyector y borrador MTP.
- GPU validadas: Radeon 8060S (gfx1151, Strix Halo) con ROCm. El runtime menciona además rutas OpenVINO y kernels HIP/CUDA, pero no se documenta soporte validado en GPU NVIDIA.
- GPU de consumo: el modelo no cabe en tarjetas de 24 GB (RTX 4090) ni en soluciones de 48 GB; requiere memoria unificada grande o varias GPU.
- Almacenamiento: es obligatorio mantener los tres ficheros `ple/` en almacenamiento local rápido, y opcionalmente reservar espacio para la caché de prompt en disco (`PROMPT_CACHE_DISK_MIB=65536`).
- Despliegue: exclusivamente mediante el runtime CIRU incluido (instrucciones en `INSTALL.md`). llama.cpp estándar no soporta el formato compacto de expertos ni la tabla de embeddings paginada, y el alojamiento en servicios de inferencia gestionada no está soportado.
- Rendimiento: 35,5 tok/s en monousuario a 20.000 tokens; 49,9 tok/s agregados con cuatro slots y unos 240.000 tokens en pool; 24,5 tok/s con un solo slot activo sobre un pool de 328.000 tokens.
- Nota de configuración: un único slot es la configuración por defecto; una petición aislada dentro de un pool multi-slot sigue siendo más lenta que el perfil monousuario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato y despliegue | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-CIRU-STRIX-IU4 | 125.875.774.336 | no disponible (validado hasta 100k por slot) | qwen-community-1.0 | GGUF IU4 con runtime CIRU propio | Optimizado para AMD Strix Halo; incluye borrador MTP y proyector de visión |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | qwen-community-1.0 | safetensors / FP8 | Modelo original; sin las restricciones de runtime del paquete IU4 |
| Qwen/Qwen3.8-Flash-Next-FP8 | no disponible | no disponible | qwen-community-1.0 | FP8 | Variante cuantizada oficial del modelo base; requiere hardware con soporte FP8 |

No se dispone de datos de benchmarks que permitan comparar la calidad de este paquete con alternativas de tamaño similar; la comparación disponible se limita a linaje, licencia y formato de despliegue.

## Limitaciones y advertencias

- Dependencia de un runtime no estándar: llama.cpp estándar y los servicios de inferencia alojada no soportan el formato compacto de expertos ni la tabla PLE; actualizar solo el lanzador no aplica las correcciones, hay que recompilar el runtime.
- Acoplamiento estricto entre pesos y runtime: el autor advierte que los paquetes Flash y Orca, y sus borradores MTP respectivos, no son intercambiables.
- Historial de defectos corregidos: imágenes invisibles en prompts de más de ~2.048 tokens (v5.5.0 a v5.5.8), estado recurrente no finito que provocaba repeticiones en slots reciclados (v5.5.7) y retención de referencias a buffers liberados en la caché de grafos HIP (v5.5.8). El propio autor señala que la causa primera de algunos incidentes de repetición no está confirmada.
- Sin benchmarks de calidad publicados: no hay evidencia en la información disponible sobre MMLU, HumanEval, GSM8K ni evaluaciones multilingües.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Licencia qwen-community-1.0: no es una licencia open source aprobada; conviene revisar el fichero LICENSE antes de cualquier uso comercial o redistribución.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Rendimiento degradado en escenarios concretos: con 32 definiciones de herramienta la prueba de visión baja a 6/12, y un único slot dentro de un pool multi-slot rinde por debajo del perfil monousuario.
- Requisito de almacenamiento local rápido para los ficheros `ple/`; su ausencia o su ubicación en almacenamiento lento impide el funcionamiento correcto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jcbtc/Qwen3.8-Flash-CIRU-STRIX-IU4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo base en FP8: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Repositorio del runtime CIRU: https://github.com/ciru-ai/Qwen3.8-Flash-CIRU-STRIX-IU4
- Notas de versión v6.0.0: https://github.com/ciru-ai/Qwen3.8-Flash-CIRU-STRIX-IU4/blob/v6.0.0/docs/qualification/v6.0.0/RELEASE-NOTES.md
- Notas de versión v5.5.8: https://github.com/ciru-ai/Qwen3.8-Flash-CIRU-STRIX-IU4/blob/v5.5.8/docs/qualification/v5.5.8/RELEASE-NOTES.md
- Notas de versión v5.5.7: https://github.com/ciru-ai/Qwen3.8-Flash-CIRU-STRIX-IU4/blob/v5.5.7/docs/qualification/v5.5.7/RELEASE-NOTES.md
- Guía multi-slot: https://github.com/ciru-ai/Qwen3.8-Flash-CIRU-STRIX-IU4/blob/main/CONCURRENCY.md
- Instrucciones de compilación: https://github.com/ciru-ai/Qwen3.8-Flash-CIRU-STRIX-IU4/blob/main/INSTALL.md
- Informe de fallo de visión y reproducción: https://huggingface.co/jcbtc/Qwen3.8-Flash-CIRU-STRIX-Orca/discussions/5
- PR de llama.cpp #26771 (corrección incorporada): https://github.com/ggml-org/llama.cpp/pull/26771
