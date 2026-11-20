# RadixArk/DaisyRose-27B-GGUF

## Resumen

DaisyRose-27B-GGUF es la distribución en formato GGUF del modelo DaisyRose-27B, un modelo multimodal de tipo image-text-to-text post-entrenado por RadixArk a partir de Qwen3.8-27B. Este repositorio contiene únicamente las cuantizaciones para inferencia local con llama.cpp, Ollama y LM Studio; para despliegue en servidor el autor recomienda los pesos BF16, FP8 o NVFP4 del repositorio principal. El modelo cuenta con 27.320.697.856 parámetros totales y una licencia Apache-2.0.

El modelo resuelve el problema de ejecutar un modelo multimodal de 27B en hardware de consumo, ofreciendo cuantizaciones desde Q2_K_XL (10,0 GB) hasta Q8_0 (29,0 GB), además de un proyector de visión separado (mmproj, 0,9 GB) necesario para entrada de imágenes. Incluye soporte de tool calling a través de la plantilla de chat embebida y un modo de razonamiento configurable con niveles de esfuerzo.

La relevancia actual del modelo radica en que combina capacidades de visión, razonamiento extendido y tool calling en un tamaño manejable para estaciones de trabajo y GPUs de consumo, con una licencia permisiva (Apache-2.0) que facilita su uso comercial. La información pública disponible sobre el modelo base es limitada: no se han publicado detalles sobre la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación consultada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3.8-27B; arquitectura transformer multimodal image-text-to-text) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como cifra oficial; la model card recomienda al menos 64k de contexto por petición (`-c 65536`) por el modo de razonamiento |
| Tipos de cuantización | Q2_K_XL (10,0 GB), Q3_K_XL (13,2 GB), Q4_K_M (16,6 GB), Q4_K_XL (17,7 GB, recomendada), Q5_K_M (19,9 GB), Q6_K (22,1 GB), Q8_0 (29,0 GB); proyector de visión mmproj BF16 (0,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base también se distribuye en BF16, FP8 y NVFP4 |

## Arquitectura y entrenamiento

DaisyRose-27B es un modelo post-entrenado por RadixArk a partir de Qwen3.8-27B, con capacidad multimodal image-text-to-text. El repositorio GGUF se generó convirtiendo los pesos BF16 con `convert_hf_to_gguf.py` de llama.cpp (commit `4d91760`). No se dispone de información pública sobre la arquitectura interna detallada, el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF/DPO) empleadas en el post-entrenamiento.

La cuantización utiliza una importance matrix calculada sobre el propio DaisyRose-27B con 512 muestras de 2.048 tokens (texto web general y transcripciones de tool calling). La precisión por tensor sigue los esquemas de capas de los GGUF dinámicos de Unsloth para Qwen3.8-27B, aplicados mediante `llama-quantize --tensor-type-file`. El modelo incorpora un modo de razonamiento con esfuerzo configurable (por defecto `xhigh`), que puede generar decenas de miles de tokens de pensamiento en problemas difíciles, y permite desactivar el thinking con `{"enable_thinking": false}`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imágenes (image-text-to-text) mediante el proyector de visión mmproj.
- Razonamiento extendido con niveles de esfuerzo configurables (`xhigh` por defecto, `medium`, y desactivación del thinking).
- Tool calling / function calling a través de la plantilla de chat embebida (requiere `--jinja` en llama.cpp).
- Generación de código (el ejemplo de la model card solicita una búsqueda binaria en Rust).
- Compatibilidad con endpoints OpenAI a través de `llama-server`.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código local: el modelo puede generar código en lenguajes como Rust y ejecutarse en una estación de trabajo con una GPU de consumo usando Q4_K_XL (17,7 GB), sin enviar código a servicios externos.
- Análisis de documentos con imágenes: gracias al proyector de visión, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales en una misma conversación.
- Automatización con tool calling: la plantilla de chat embebida permite integrar el modelo en flujos que invocan funciones externas (APIs, consultas a bases de datos) a través de la API compatible con OpenAI de `llama-server`.
- Razonamiento en problemas complejos: el modo de esfuerzo `xhigh` permite abordar tareas de varios pasos que requieren cadenas de pensamiento largas, siempre que se asignen al menos 64k de contexto por petición.
- Despliegue en portátiles y workstations: las cuantizaciones Q3_K_XL (13,2 GB) y Q2_K_XL (10,0 GB) permiten ejecutar el modelo en GPUs de 16 GB o en equipos con memoria unificada, según las recomendaciones del autor.
- Prototipado rápido con Ollama: el comando `ollama run hf.co/RadixArk/DaisyRose-27B-GGUF:Q4_K_XL` permite levantar el modelo en local para experimentación sin infraestructura adicional.
- Asistente conversacional con contexto largo: la recomendación de 64k tokens por slot permite mantener conversaciones extensas con historial y documentos adjuntos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según el tamaño de los ficheros GGUF): 10,0 GB (Q2_K_XL), 13,2 GB (Q3_K_XL), 16,6 GB (Q4_K_M), 17,7 GB (Q4_K_XL), 19,9 GB (Q5_K_M), 22,1 GB (Q6_K), 29,0 GB (Q8_0). Añadir 0,9 GB del proyector de visión si se usan imágenes y margen para el contexto KV.
- El autor recomienda Q3_K_XL para GPUs de 16 GB y Q4_K_XL como opción general.
- Cabe en GPUs de consumo con suficiente VRAM (por ejemplo, modelos de 16 GB o más para Q3_K_XL y Q4_K_XL); no se especifican modelos concretos de GPU en la documentación.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama y LM Studio para local; SGLang con pesos BF16, FP8 o NVFP4 para servidor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| DaisyRose-27B-GGUF | 27,3B | no disponible (recomendado ≥64k por petición) | Sí (image-text-to-text) | Apache-2.0 | GGUF, BF16, FP8, NVFP4 |
| Qwen3.8-27B (modelo base del que deriva) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Alternativas de 27B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- La cuantización Q2_K_XL genera razonamientos más largos y alcanza los límites de contexto con más frecuencia; el autor recomienda usar un esfuerzo de razonamiento menor con ella.
- El esfuerzo de razonamiento por defecto (`xhigh`) puede producir decenas de miles de tokens de pensamiento en problemas difíciles, lo que exige asignar al menos 64k de contexto por petición o reducir el esfuerzo.
- El tool calling requiere activar `--jinja` en llama.cpp para usar la plantilla de chat embebida.
- Para entrada de imágenes es imprescindible descargar y cargar el fichero mmproj-DaisyRose-27B-BF16.gguf.
- Este repositorio es solo para inferencia local; el autor indica que para despliegue en servidor se usen los pesos BF16, FP8 o NVFP4 con SGLang.
- No se han publicado datos sobre sesgos, tasas de alucinación ni rendimiento por idioma.
- Aunque la licencia es Apache-2.0, el modelo deriva de Qwen3.8-27B; conviene verificar las condiciones de la licencia del modelo base antes de un uso comercial en producción.
- No hay información pública sobre la composición del dataset de post-entrenamiento, lo que limita la evaluación de riesgos de sesgo y contaminación de benchmarks.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/RadixArk/DaisyRose-27B-GGUF
- Modelo base BF16: https://huggingface.co/RadixArk/DaisyRose-27B
- Versión FP8: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Versión NVFP4: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Blog del autor: https://www.radixark.com/blog/daisyrose-27b
- Guía de despliegue con SGLang: https://docs.sglang.io/cookbook/autoregressive/RadixArk/DaisyRose-27B
- Modelo Qwen3.8-27B (origen): https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF dinámicos de Unsloth para Qwen3.8-27B (referencia de cuantización): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Hilo en Hacker News: https://news.ycombinator.com/item?id=50551046
