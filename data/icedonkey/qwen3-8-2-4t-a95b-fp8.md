# iceDonkey/Qwen3.8-2.4T-A95B-FP8

## Resumen

El repositorio `iceDonkey/Qwen3.8-2.4T-A95B-FP8` contiene los pesos cuantizados en FP8 del modelo Qwen3.8-2.4T-A95B, la versión open-source del modelo insignia Qwen3.8-Max de Alibaba, lanzado en agosto de 2026. Se trata del primer modelo de clase Qwen-Max con pesos abiertos, diseñado para sobresalir en tareas de codificacion, trabajo profesional, investigacion y tareas agénticas de horizonte largo. La cuantizacion FP8 con bloque de 128 reduce el peso del modelo a aproximadamente 2,5 TB, manteniendo metricas casi identicas al original segun el autor del repo.

La arquitectura es un MoE disperso con 2,4 billones de parametros totales y unos 95 mil millones activos por token, combinando atencion hibrida (Gated DeltaNet lineal y Gated Attention completa) con 512 expertos. Soporta una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, y utiliza prediccion multi-token (MTP). Este despliegue FP8 es compatible con vLLM, SGLang y TokenSpeed, y esta pensado para entornos de produccion con multiples GPU de alta gama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso con atencion hibrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 2.446.182.725.504 (~2,4 billones) |
| Parametros activos | ~95 mil millones por token |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.010.000 |
| Tipos de cuantizacion | FP8 (bloque de 128), otros formatos no disponibles en este repo |
| Idiomas soportados | No disponible |
| Licencia | qwen3.8-max (license: other, consultar LICENSE) |
| Formato de pesos | safetensors (FP8), compatible con Transformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-2.4T-A95B emplea una arquitectura de mezcla de expertos (MoE) de grano fino con 512 expertos, de los cuales se activan 10 enrutados mas 1 compartido por token. La capa oculta tiene dimension 8192 y el modelo consta de 92 capas organizadas en 23 bloques, cada uno con 3 subcapas de Gated DeltaNet seguidas de MoE y 1 subcapa de Gated Attention seguida de MoE. La atencion hibrida combina atencion lineal (Gated DeltaNet) con atencion completa (Gated Attention), lo que permite manejar secuencias largas de forma eficiente. Ademas, incorpora prediccion multi-token (MTP) entrenada en multiples pasos, lo que acelera la inferencia y mejora la coherencia.

El entrenamiento incluyo fases de pre-entrenamiento y post-entrenamiento, con ajuste fino supervisado y probablemente tecnicas de refuerzo similares a las de la serie Qwen3.5/3.6, aunque los detalles exactos del dataset no estan publicados en la informacion disponible. La cuantizacion FP8 de este repositorio se realizo con un esquema de grano fino con bloque de 128, preservando el rendimiento del modelo original segun el autor.

## Capacidades

- Generacion de texto y razonamiento avanzado, con soporte de modo de pensamiento controlable mediante `reasoning_effort` y conservacion del contexto de razonamiento con `preserve_thinking`.
- Codificacion agéntica: planificacion autonoma y manejo de feedback del entorno para completar tareas multi-paso de forma fiable.
- Razonamiento matematico y cientifico de alto nivel, orientado a investigacion y trabajo profesional.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Capacidades multilingues amplias, aunque los idiomas exactos no estan documentados en la informacion disponible.
- Prediccion multi-token (MTP) para inferencia mas rapida y mejor coherencia en generacion larga.
- Ventana de contexto de hasta 1 millon de tokens, apta para documentos extensos y conversaciones de muchos turnos.

## Casos de uso

- Agentes de codificacion autonomos: el modelo puede planificar, escribir y depurar codigo en repositorios grandes, gracias a su capacidad de razonamiento largo y su soporte de herramientas. Adecuado para integrarse en IDEs o CI/CD.
- Asistencia a investigacion cientifica: analisis de papers extensos, generacion de hipotesis y resumen de literatura con contexto de hasta 1 millon de tokens, permitiendo procesar documentos completos de una sola vez.
- Atencion al cliente automatizada a gran escala: gestion de conversaciones multi-turno con memoria de contexto largo y capacidad de integracion con APIs de terceros mediante tool calling.
- Analisis de codigo legacy y refactorizacion: el modelo puede comprender proyectos enteros y sugerir cambios estructurales, apoyandose en su ventana de contexto amplia y su entrenamiento en tareas de ingenieria de software.
- Generacion de documentacion tecnica y traduccion: produccion de manuales, guias y traducciones de alta calidad en multiples idiomas, con control fino del estilo mediante el parametro de esfuerzo de razonamiento.
- Despliegue de asistentes de productividad empresarial: automatizacion de tareas de ofimatica, generacion de informes, analisis de datos y toma de decisiones basada en documentos, usando el modo no-thinking para respuestas rapidas o thinking para analisis profundos.

## Benchmarks y rendimiento

Los datos de benchmarks publicados en la model card corresponden al modelo original Qwen3.8-Max (no a la version FP8, aunque el autor afirma metricas casi identicas). La tabla disponible se muestra parcialmente:

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84,6 | 84,6 | 88,8 | 74,5 | 86,6 |
| SWE-bench Pro | 69,2 | 80,0 | no disponible | no disponible | no disponible |

La informacion de SWE-bench Pro esta incompleta en el extracto proporcionado. No se dispone de resultados completos para MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion disponible. Se recomienda consultar la model card original para datos adicionales.

## Requisitos de hardware

- El tamano del repositorio es de 2496,1 GB, lo que implica que los pesos FP8 ocupan aproximadamente 2,4 TB en memoria.
- Para inferencia en FP8 se necesitan multiples GPU de alta gama. Una configuracion tipica seria un nodo con 32 GPU H100/H200 de 80 GB (2,56 TB de VRAM total) o un sistema NVIDIA GB300 NVL72 con 72 GPU, como sugiere el blog de NVIDIA.
- No es viable en GPU de consumo (RTX 4090, etc.) por la cantidad de VRAM requerida.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, segun la model card. Tambien compatible con Transformers para pruebas.
- La latencia y el throughput dependen en gran medida del hardware y del numero de GPU; con 95B parametros activos y MTP, el rendimiento puede ser competitivo frente a modelos densos de tamano similar, pero no se proporcionan cifras concretas en la informacion disponible.

## Comparativa con modelos similares

La tabla de benchmarks anterior compara Qwen3.8-Max con otros modelos de frontera cerrados (Opus 4.8, Fable 5, GPT 5.6 Sol) y con su predecesor Qwen3.7-Max. En el ecosistema open-source, los competidores mas cercanos por arquitectura MoE y tamano son DeepSeek-V3/R1 y Kimi K2, aunque no se dispone de datos comparativos directos en la informacion proporcionada. Qwen3.8-2.4T-A95B se distingue por su ventana de contexto de 1M tokens y su atencion hibrida, caracteristicas no presentes en todos los rivales.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Qwen3.8-2.4T-A95B | 2,4T | 95B | 262K-1M | qwen3.8-max |
| DeepSeek-V3 (referencia) | 671B | 37B | 128K | MIT |
| Kimi K2 (referencia) | 1T | 32B | 128K | Modified MIT |

Nota: los datos de DeepSeek-V3 y Kimi K2 son de referencia general y pueden no estar actualizados.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia `qwen3.8-max` no es una licencia open-source estandar; es necesario revisar el archivo LICENSE para conocer las condiciones de uso comercial y redistribucion.
- La cuantizacion FP8, aunque afirma metricas casi identicas, puede introducir degradaciones en tareas de precision numerica extrema o en generacion de codigo con dependencias de logits exactos.
- El modelo es extremadamente grande (2,4 TB en FP8), lo que limita su despliegue a infraestructuras con multiples GPU profesionales y descarta su uso en entornos locales o de bajo presupuesto.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma especificos en la informacion disponible.
- La ventana de contexto de 1M tokens puede requerir gestion cuidadosa de la memoria KV cache; el uso de atencion lineal mitiga parcialmente este problema, pero no lo elimina.
- El repositorio es una cuantizacion de terceros (iceDonkey), no el modelo oficial de Qwen; se recomienda verificar la integridad de los pesos antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/iceDonkey/Qwen3.8-2.4T-A95B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Pagina del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
- Blog de Qwen sobre Qwen3.8: https://qwen.ai/blog?id=qwen3.8
- Blog de NVIDIA sobre despliegue: https://developer.nvidia.com/blog/serve-qwen3-8-2-4t-a95b-a-2-4t-parameter-model-with-configurable-reasoning-on-nvidia-gb300-nvl72/
- Guia de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
