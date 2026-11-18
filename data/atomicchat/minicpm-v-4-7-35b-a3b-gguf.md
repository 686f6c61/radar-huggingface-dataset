# AtomicChat/MiniCPM-V-4.7-35B-A3B-GGUF

## Resumen

MiniCPM-V-4.7-35B-A3B es un modelo multimodal image-text-to-text desarrollado por OpenBMB, distribuido en este repositorio como cuantizaciones GGUF por AtomicChat. Se trata de un transformer con arquitectura Mixture of Experts (MoE) de 34.659.889.792 parámetros totales (aproximadamente 34,7 mil millones) y unos 3 mil millones de parámetros activos por token, según se deduce de la nomenclatura A3B. El modelo procesa tanto texto como imágenes, lo que lo sitúa en la categoría de modelos de visión-lenguaje (VLM) de gran tamaño.

El repositorio de AtomicChat no contiene los pesos originales, sino un conjunto de cuantizaciones GGUF optimizadas mediante importance matrix (imatrix) propia, publicada junto con la corpora de calibración. Estas cuantizaciones están diseñadas para su uso con llama.cpp y cubren un rango que va desde Q8_0 (36,9 GB) hasta formatos de 1 bit para expertos (10,1 GB), lo que permite desplegar un modelo de casi 35 mil millones de parámetros en GPUs de consumo de 12 GB en adelante.

La relevancia actual del modelo reside en la combinación de tres factores: capacidades multimodales (lectura de imágenes y vídeo), una arquitectura MoE que reduce el coste computacional por token al activar solo una fracción de los parámetros, y una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales. El repositorio acumula 7.769 descargas y 18 likes desde su creación en octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE); multimodal image-text-to-text |
| Parametros totales | 34.659.889.792 (aprox. 34,7 B) |
| Parametros activos | Aproximadamente 3 B (según nomenclatura A3B; no confirmado en la información disponible) |
| Longitud de contexto | Hasta contexto completo con Q8_0; el modelo mantiene 20 KB de caché de atención por token (0,2 GB a 8k, 0,6 GB a 32k). La longitud máxima exacta no está indicada en la información disponible |
| Tipos de cuantizacion | Q8_0, AD-Q6_K, AD-Q6_K-Q5_K, AD-Q5_K-Q4_K, AD-Q5_K-IQ4_XS, AD-Q4_K-IQ4_XS, AD-IQ4_XS-IQ3_S, AD-IQ3_S-IQ3_XXS, AD-IQ3_XXS-IQ2_S, AD-IQ2_S-IQ2_XS, AD-IQ2_XS-IQ2_XXS, AD-IQ2_XXS-IQ1_M (research) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión separado en F16 y BF16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con Mixture of Experts, según se desprende de la nomenclatura del modelo (35B-A3B) y de las referencias en la model card a "expertos enrutados" que constituyen el 93% de los pesos. El modelo incorpora un experto compartido ("shared expert"), atención, embeddings y cabeza de salida, que en las cuantizaciones de AtomicChat se mantienen siempre en q8_0 mientras el ahorro de bits se concentra en los expertos enrutados. La componente multimodal se implementa mediante un proyector de visión separado del cuerpo del modelo, distribuido como archivo `mmproj` independiente en F16 o BF16, lo que permite reutilizar el mismo proyector con cualquier cuantización del modelo principal.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se detallan innovaciones técnicas específicas más allá de la arquitectura MoE y la capacidad multimodal. La model card del repositorio se centra en el proceso de cuantización, no en el entrenamiento del modelo base.

El trabajo de AtomicChat se centra en la cuantización con importance matrix: cada archivo `AD-` (Atomic Dynamic) indica qué tipos recibieron los dos mayores grupos de tensores (`ffn_down` y `ffn_up`), colapsados a un solo nombre cuando ambos coinciden. Las métricas de divergencia KL y top-1 se midieron sobre texto de referencia retenido, con la misma máquina y build de llama.cpp, y los registros crudos están publicados en el repositorio de métricas.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat integrada en cada archivo GGUF.
- Comprensión de imágenes: el modelo lee imágenes y responde preguntas sobre ellas mediante el proyector de visión (`mmproj`).
- Procesamiento de vídeo: la model card menciona explícitamente "images and video" como entradas soportadas.
- Modo de razonamiento (thinking mode): con `--jinja` el modelo inicia cada respuesta en modo pensamiento; se puede desactivar por petición con `"chat_template_kwargs": {"enable_thinking": false}`.
- Conversación multimodal image-text-to-text como pipeline principal.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- No se dispone de información sobre soporte de tool calling, function calling, agentes o capacidades multilingües específicas en la documentación proporcionada.

## Casos de uso

- Asistente de atención al cliente con soporte de imágenes: el modelo puede recibir capturas de pantalla, fotos de productos o documentos escaneados junto con la consulta del usuario y responder en conversaciones multi-turno, gracias a su naturaleza image-text-to-text y a la caché de atención de 20 KB por token que permite mantener contexto largo.
- Análisis de documentos y facturas: extracción de información de imágenes de documentos, con despliegue local en una GPU de 24 GB usando `AD-Q5_K-Q4_K` y contexto de hasta 120k tokens.
- Descripción y moderación de contenido visual: clasificación y descripción de imágenes o fotogramas de vídeo en pipelines automatizados, ejecutando el modelo con llama.cpp en servidores con GPU de 48 GB o más para máxima fidelidad (Q8_0).
- Asistencia en entornos con requisitos de privacidad: al ser un modelo Apache 2.0 desplegable en local, permite procesar imágenes sensibles (médicas, legales, industriales) sin enviar datos a servicios en la nube.
- Prototipado e investigación en VLMs: el rango de cuantizaciones desde 10,1 GB hasta 36,9 GB permite experimentar en estaciones de trabajo con GPUs de consumo (12 GB, 16 GB, 24 GB) y comparar el impacto de la cuantización en la calidad mediante las métricas KL y top-1 publicadas.
- Generación de descripciones accesibles: creación de texto alternativo para imágenes en sitios web o aplicaciones, con el modelo ejecutándose en local mediante `llama-server` y la API compatible con endpoints.
- Análisis de vídeo en local: procesamiento de fotogramas o secuencias de vídeo para resumen o descripción, aprovechando la entrada de vídeo mencionada en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente proporciona métricas de fidelidad de la cuantización respecto a los pesos originales:

| Archivo | Tamano | KL divergence | top-1 |
|---|---:|---:|---:|
| Q8_0 | 36,9 GB | 0,00516 | 97,49% |
| AD-Q6_K | 29,1 GB | 0,00605 | 97,18% |
| AD-Q6_K-Q5_K | 26,2 GB | 0,00806 | 96,72% |
| AD-Q5_K-Q4_K | 22,1 GB | 0,01501 | 95,47% |
| AD-Q5_K-IQ4_XS | 21,5 GB | 0,01584 | 95,41% |
| AD-Q4_K-IQ4_XS | 20,1 GB | 0,01972 | 94,94% |
| AD-IQ4_XS-IQ3_S | 17,6 GB | 0,03874 | 92,86% |
| AD-IQ3_S-IQ3_XXS | 15,5 GB | 0,06381 | 90,82% |
| AD-IQ3_XXS-IQ2_S | 13,7 GB | 0,11015 | 87,99% |
| AD-IQ2_S-IQ2_XS | 12,3 GB | 0,16634 | 85,29% |
| AD-IQ2_XS-IQ2_XXS | 11,3 GB | 0,21942 | 83,17% |
| AD-IQ2_XXS-IQ1_M (research) | 10,1 GB | 0,34928 | 78,57% |

Comparación con presets planos de llama.cpp (sin importance matrix):

| Preset plano | Tamano | KL divergence | top-1 | Archivo AD equivalente | Tamano | KL divergence | top-1 |
|---|---:|---:|---:|---|---:|---:|---:|
| Q4_K_M | 21,2 GB | 0,04455 | 92,23% | AD-Q4_K-IQ4_XS | 20,1 GB | 0,01972 | 94,94% |
| Q5_K_M | 24,7 GB | 0,01966 | 94,68% | AD-Q5_K-Q4_K | 22,1 GB | 0,01501 | 95,47% |
| Q6_K | 28,5 GB | 0,00949 | 96,40% | AD-Q6_K-Q5_K | 26,2 GB | 0,00806 | 96,72% |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,1 GB (AD-IQ2_XXS-IQ1_M) y 36,9 GB (Q8_0) para los pesos, más la caché de atención (0,2 GB a 8k de contexto, 0,6 GB a 32k).
- GPU recomendadas según la model card:
  - 12 GB: `AD-IQ2_XS-IQ2_XXS`, deja espacio para unos 16k de contexto.
  - 16 GB: `AD-IQ3_S-IQ3_XXS`, deja espacio para unos 24k de contexto.
  - 24 GB: `AD-Q5_K-Q4_K`, deja espacio para unos 120k de contexto.
  - 32 GB: `AD-Q6_K`, deja espacio para unos 192k de contexto.
  - 48 GB o más: `Q8_0`, contexto completo.
- Cabe en GPU de consumo: sí, desde 12 GB con las cuantizaciones de 2 bits (con degradación notable: top-1 del 83,17% en `AD-IQ2_XS-IQ2_XXS`).
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-mtmd-cli`), Atomic Chat (aplicación del autor de las cuantizaciones). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. La model card no incluye comparaciones con otros modelos de la misma categoría (VLMs MoE de aproximadamente 35B). Por tanto, la comparativa con alternativas concretas se considera no disponible.

## Limitaciones y advertencias

- Las cuantizaciones de baja precisión degradan la calidad de forma medible: `AD-IQ2_XS-IQ2_XXS` solo coincide con el token original el 83,17% de las veces, y `AD-IQ2_XXS-IQ1_M` (1 bit en expertos) baja al 78,57%; esta última debe tratarse como experimental.
- El archivo `AD-IQ2_XXS-IQ1_M` está etiquetado explícitamente como "research" por el autor.
- El modelo requiere un archivo adicional (`mmproj`) para procesar imágenes; sin él solo funciona como modelo de texto.
- La longitud máxima de contexto no está especificada en la información disponible; el límite práctico depende de la VRAM libre tras cargar los pesos.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluación de seguridad del modelo base.
- No hay datos sobre el rendimiento en idiomas distintos del inglés; la lista de idiomas soportados no está disponible.
- La licencia Apache 2.0 permite uso comercial, pero se aplica al modelo base y a las cuantizaciones; conviene verificar las condiciones del modelo original de OpenBMB por si hubiera términos adicionales no reflejados en los tags.
- El repositorio tiene un tamaño de 238,8 GB, por lo que la descarga completa de todos los archivos requiere espacio de almacenamiento considerable; conviene descargar solo el archivo elegido y el `mmproj`.
- El modo thinking está activado por defecto con `--jinja`; en producción puede incrementar la latencia si no se desactiva por petición.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/MiniCPM-V-4.7-35B-A3B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Corpora de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Métricas de cuantización: https://huggingface.co/datasets/AtomicChat/MiniCPM-V-4.7-35B-A3B-GGUF-metrics
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
