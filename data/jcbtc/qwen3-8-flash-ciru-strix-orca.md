# jcbtc/Qwen3.8-Flash-CIRU-STRIX-Orca

## Resumen

Qwen3.8-Flash-CIRU-STRIX-Orca es una conversión en formato GGUF compacto del checkpoint de investigación Qwen3.8-Flash-Next de Qwen, publicada por el usuario jcbtc bajo el paraguas de OrcaRouter. El modelo está específicamente optimizado para ejecutarse en hardware AMD Strix Halo (iGPU gfx1151) mediante el runtime propietario CIRU v5, y combina pesos de un modelo base no censurado (orcarouter/Qwen3.8-Flash-Next-Uncensored) con el modelo original de Qwen. Se distribuye como un modelo de mezcla de expertos (MoE) con 125.875.774.336 parámetros totales y capacidades multimodales de imagen-texto.

La relevancia de esta ficha radica en que no se trata de un modelo estándar de llama.cpp: requiere un runtime específico (CIRU) que no es compatible con llama.cpp estándar ni con la inferencia alojada en Hugging Face. Incorpora decodificación especulativa mediante multi-token prediction (MTP) con un draft Q8, ficheros de embedding de tokens paginados (PLE) y un proyector visual específico. La versión v6.0.0 del runtime corrige la entrada de imágenes en prompts largos y mejora el rendimiento multi-slot, con velocidades medidas de hasta 49,9 tok/s en cuatro slots concurrentes sobre una Radeon 8060S.

El modelo está pensado para despliegues locales en equipos con APU Strix Halo, con una ventana de contexto de 262.144 tokens por defecto y soporte de visión. Su licencia es qwen-community-1.0, lo que impone restricciones que deben revisarse antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer con decodificación especulativa MTP y proyector visual |
| Parámetros totales | 125.875.774.336 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (por defecto, un slot) |
| Tipos de cuantización | IU4 (formato compacto de expertos propietario); draft MTP en Q8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | GGUF (requiere runtime CIRU; no compatible con llama.cpp estándar) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de mezcla de expertos (MoE) con capacidades de visión (pipeline image-text-to-text) y decodificación especulativa mediante multi-token prediction (MTP). El modelo base es Qwen3.8-Flash-Next de Qwen, del cual se ha derivado una versión no censurada (orcarouter/Qwen3.8-Flash-Next-Uncensored) que sirve como base para esta conversión. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal de esta distribución es el formato compacto de expertos (IU4) diseñado para el runtime CIRU v5, que permite ejecutar un modelo de 125.875 millones de parámetros en hardware AMD Strix Halo. El sistema incluye un draft MTP en Q8 para decodificación especulativa, ficheros de embedding de tokens paginados (PLE) que deben residir en almacenamiento local rápido, y un proyector visual específico. El runtime v6.0.0 introduce mejoras en la gestión de imágenes en prompts largos, serving multi-slot con pooling de slots y caché de prompts en disco opcional. No se han publicado detalles sobre la arquitectura de atención ni sobre innovaciones como atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de 262.144 tokens.
- Procesamiento de imágenes y texto (image-text-to-text) mediante proyector visual específico.
- Razonamiento multi-paso y soporte de tool calling / function calling, con definiciones de herramientas que pueden convivir con entradas de imagen en prompts largos (corregido en v6.0.0).
- Decodificación especulativa mediante MTP con draft Q8 para acelerar la generación.
- Serving multi-slot opcional (hasta 4 slots pooled) con un pool de contexto compartido de 262.144 tokens.
- Caché de prompts en disco opcional para conversaciones evacuadas de RAM.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: mencionado en las mediciones de rendimiento (thinking on), aunque no se detallan sus características.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo puede mantener conversaciones de hasta 262.144 tokens en un solo slot, adecuado para análisis de documentos extensos o historiales de chat prolongados en equipos Strix Halo.
- Análisis de imágenes con herramientas: con la corrección de v6.0.0, el modelo puede procesar fotografías junto con hasta 32 definiciones de herramientas en prompts de más de 6.000 tokens, útil para asistentes que combinan visión y function calling.
- Serving multi-usuario en una APU: con PARALLEL_SLOTS=2 o 4, se pueden atender varias conversaciones concurrentes compartiendo un pool de contexto, con rendimiento medido de 42-50 tok/s agregados en cuatro slots sobre Radeon 8060S.
- Automatización de atención al cliente con contexto persistente: la caché de prompts en disco permite retomar conversaciones evacuadas de 65.000-92.000 tokens releyendo solo 55 tokens y en unos 3 segundos.
- Procesamiento de documentación técnica con imágenes: el pipeline image-text-to-text permite extraer información de capturas, diagramas o figuras dentro de documentos largos.
- Investigación sobre modelos no censurados: al derivar de Qwen3.8-Flash-Next-Uncensored, sirve para estudiar comportamiento de modelos sin filtrado en entornos controlados.
- Evaluación de decodificación especulativa: el MTP con draft Q8 permite medir ganancias de throughput en hardware AMD, con perfiles de 35,5 tok/s en single-slot a 20.000 tokens.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de runtime, no benchmarks de calidad de modelo. Se presentan a continuación:

| Caso (cuatro slots pooled, MTP3, thinking on) | v5.5.8 | v6.0.0 |
|---|---:|---:|
| 4 slots generando, ~240k tokens pooled, total | 21,4 tok/s | 49,9 tok/s |
| 4 slots generando, ~328k tokens pooled, total | 11,3–12,1 tok/s | 42,0–42,6 tok/s |
| 2 slots generando, ~328k tokens pooled, total | 11,5 tok/s | 37,3 tok/s |
| 1 slot generando, ~328k tokens pooled | 12,6 tok/s | 24,5 tok/s |

Single-slot a 20.000 tokens: 34,9 tok/s en v5.5.8 y 35,5 tok/s en v6.0.0. Multi-slot con segundo slot idle: 47,00 a 42,20 tok/s (-10,21%) en la prueba IU4.

Prueba de imagen con tool definitions (4 fotografías, un slot, temperatura 0):

| Tool definitions | Prompt tokens | v5.0.1 | v5.5.0 | v5.5.8 | v6.0.0 |
|---:|---:|---:|---:|---:|---:|
| 0 | 1.110 | 4/4 | 4/4 | 4/4 | 12/12 |
| 4 | 1.853 | 4/4 | 4/4 | 4/4 | 12/12 |
| 8 | 2.509 | 4/4 | 0/4 | 0/4 | 12/12 |
| 16 | 3.821 | 4/4 | 0/4 | 0/4 | 12/12 |
| 32 | 6.415 | 2/4 | 0/4 | 0/4 | 6/12 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: AMD Strix Halo (iGPU gfx1151), probado en Radeon 8060S.
- VRAM/RAM: el modelo completo ocupa 262,1 GB en el repositorio; el formato IU4 compacto reduce el peso, pero no se especifica el tamaño exacto en memoria. Se requiere almacenamiento local rápido para los ficheros PLE.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) en formato completo; está diseñado para APUs con memoria unificada.
- Runtime obligatorio: CIRU v5/v6.0.0, compilado desde fuente según INSTALL.md. No funciona con llama.cpp estándar ni con inferencia alojada en Hugging Face.
- Opciones de despliegue: servidor CIRU con scripts run-server.sh; variables como PARALLEL_SLOTS, PROMPT_CACHE_DISK_MIB, MODEL_VARIANT=Orca, MODEL_RELEASE=5.0.
- Throughput medido: 35,5 tok/s single-slot a 20.000 tokens; 49,9 tok/s agregados en cuatro slots a ~240k tokens pooled (Radeon 8060S, IU4, MTP3, thinking on).
- Memoria: en replay de 226.712 tokens con dos imágenes, RAM mínima disponible mejoró de 7,788 a 13,162 GiB con microbatch 8.192.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-CIRU-STRIX-Orca | 125.875.774.336 | 262.144 | qwen-community-1.0 | GGUF + CIRU | Hugging Face (2.887 descargas) |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de benchmarks de calidad para establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Requiere el runtime CIRU específico; no es compatible con llama.cpp estándar ni con inferencia alojada en Hugging Face, lo que limita su portabilidad.
- Los ficheros PLE deben residir en almacenamiento local rápido; su ausencia o lentitud degrada el rendimiento.
- El modo multi-slot tiene penalización de rendimiento: desactiva la shortlist del draft-head MTP single-slot y reduce el throughput de una petición activa en un 10,21% cuando el segundo slot está idle.
- En prompts con 32 definiciones de herramientas, 6 de 12 pruebas de imagen fallaron (el modelo selecciona una herramienta de fichero en lugar de describir la imagen).
- Un request aislado en un pool multi-slot es más lento que el perfil single-slot.
- Licencia qwen-community-1.0: deben revisarse las restricciones de uso comercial en el fichero LICENSE antes de desplegar en producción.
- El modelo deriva de una versión no censurada (Uncensored), lo que implica riesgo de generar contenido sin filtrado; requiere evaluación y salvaguardas propias.
- No se han publicado datos sobre sesgos, tasas de alucinación ni cobertura de idiomas.
- No se han ejecutado benchmarks amplios de calidad del modelo para la versión v6.0.0.

## Enlaces

- Hugging Face: https://huggingface.co/jcbtc/Qwen3.8-Flash-CIRU-STRIX-Orca
- Discusión sobre el bug de imagen: https://huggingface.co/jcbtc/Qwen3.8-Flash-CIRU-STRIX-Orca/discussions/5
- Notas de versión v6.0.0: https://github.com/ciru-ai/Qwen3.8-Flash-CIRU-STRIX-IU4/blob/v6.0.0/docs/qualification/v6.0.0/RELEASE-NOTES.md
- Guía multi-slot: CONCURRENCY.md (en el repositorio del runtime)
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo base no censurado: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
