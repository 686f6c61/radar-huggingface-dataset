# piotrkosecki/Mistral-Large-4-1T-A52B-EXL3-3.0bpw

## Resumen

Mistral-Large-4-1T-A52B-EXL3-3.0bpw es una conversión comunitaria cuantizada del modelo Mistral Large 4 (nombre interno "Le Chonk") publicado por Mistral AI. La ha preparado Piotr Kosecki con el objetivo de hacer viable la inferencia local del modelo original en cuatro máquinas NVIDIA GB10 / DGX Spark. El modelo base es un Mixture of Experts de gran escala: el identificador indica 1T de parámetros totales y 52B activos por token, aunque los safetensors publicados en este repositorio suman 201.636.647.200 parámetros (201,6B) empaquetados tras la cuantización y la preservación selectiva de tensores.

El problema que resuelve esta conversión es de despliegue: el checkpoint original de Mistral Large 4 se distribuye en FP8/NVFP4 y no cabe en hardware de consumo ni en clústeres pequeños de cuatro nodos. Esta versión aplica cuantización EXL3 con un objetivo de 3,0 bits por peso en las matrices principales y 6 bits en la cabeza de salida, manteniendo en 16 bits los embeddings y las proyecciones sensibles (latent-KV, indexer) y preservando los tensores auxiliares y de visión. El resultado son 76 shards safetensors que ocupan 403,28 GB en total.

Es relevante ahora porque demuestra un patrón de inferencia multi-host sobre GB10 con un runtime comunitario (fork de TensorFold) y un endpoint compatible con la API de OpenAI, a costa de renunciar a gran parte de las capacidades anunciadas del modelo original: contexto limitado a 8192 tokens, una sola petición concurrente y sin decodificación especulativa. La licencia del modelo sigue siendo la Mistral Ecosystem Open-Weight License; el runtime propio del autor se distribuye bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), según el modelo base Mistral Large 4; detalles internos no disponibles en la información proporcionada |
| Parametros totales | 201.636.647.200 (201,6B) en los safetensors de este repo; el identificador del modelo base declara 1T totales |
| Parametros activos | 52B por token (según el identificador del modelo base) |
| Longitud de contexto | 8192 tokens en la receta incluida (el modelo original anuncia 262k/1M, no cualificados con esta conversión) |
| Tipos de cuantizacion | EXL3, codebook `mul1`, 3,0 bpw en proyecciones principales y expertos, 6 bpw en cabeza de salida, 16 bits en embeddings y proyecciones latent-KV/indexer |
| Idiomas soportados | no disponible |
| Licencia | mistral-ecosystem-open-weight-license (modelo); Apache-2.0 para el runtime TensorFold modificado |
| Formato de pesos | safetensors (76 shards, 403.284.753.715 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts de Mistral AI, del que esta ficha no dispone de detalles sobre número de capas, dimensión oculta, número de expertos ni composición del dataset de entrenamiento. El identificador del repositorio indica 1T de parámetros totales y 52B activos, y el autor menciona que el checkpoint original se distribuye en FP8/NVFP4 con soporte de contexto de 262k a 1M tokens, decodificación especulativa (DFlash, DSpark, MTP) y caché compartida de 524k tokens.

Esta conversión no reentrena ni ajusta el modelo: aplica cuantización EXL3 derivada de ExLlamaV3 1.6.5 sobre la revisión `f12dabdc0c1e99e7f7924461a6f308859b05af4d` del checkpoint original. La calibración usó 256 filas de 2048 tokens. El paquete final contiene 111.732 tensores y el autor verificó dtype, forma y SHA-256 de cada tensor empaquetado contra la conversión compilada, además de los hashes y tamaños de los 76 ficheros remotos (ver `validation-summary.json`). La innovación técnica destacable no está en el modelo sino en el despliegue: un fork comunitario de TensorFold con kernels CUDA nativos y reparto multi-host sobre cuatro GB10, con un layout de shards basado en módulos para evitar re-subidas de los mismos pesos.

## Capacidades

- Generación de texto conversacional y de código, validada por el autor con comprobaciones internas de generación de texto y de código en cuatro GB10.
- Razonamiento y matemáticas: capacidades heredadas del modelo base, no verificadas de forma independiente en esta conversión.
- Tool calling / function calling: no disponible en la información proporcionada para esta conversión.
- Agentes y razonamiento multi-paso: no disponible; la receta limita a una petición concurrente y 8192 tokens de contexto.
- Multilingüismo: no disponible; no se declaran idiomas soportados.
- Visión: los tensores de visión se preservan en el paquete, pero el autor indica explícitamente que la receta es solo texto y que la preservación de pesos no demuestra inferencia de imagen funcional.
- Modo thinking, audio u otras capacidades especiales: no disponible.
- Servicio compatible con la API de OpenAI mediante el runtime incluido.

## Casos de uso

- Inferencia local de un modelo de escala frontera en clústeres pequeños: cuatro GB10 / DGX Spark con un NAS compartido o copias locales idénticas permiten servir el modelo sin depender de la nube, con un endpoint compatible con OpenAI. Es adecuado cuando la soberanía del dato o el coste por token a largo plazo pesan más que el throughput.
- Generación de código en entornos aislados: las pruebas del autor midieron aproximadamente 11,87 tok/s en generación de código y 10,14 tok/s en edición de código, suficiente para asistentes interactivos de un solo usuario en redes internas sin salida a Internet.
- Experimentación e investigación sobre cuantización extrema: el paquete documenta calibración, verificación de hashes y una comparación de perplejidad (FP8 7,9321 frente a EXL3 8,0660), lo que lo convierte en una referencia útil para estudiar la degradación de un MoE de gran escala a 3 bpw.
- Prototipado de pipelines conversacionales multi-turno: con 8192 tokens de contexto se pueden cubrir sesiones de chat de longitud media, siempre con concurrencia 1 y sin decodificación especulativa.
- Evaluación comparativa de runtimes: sirve para medir el rendimiento de TensorFold frente a otras alternativas en hardware GB10, aunque el autor advierte que vLLM, SGLang y Transformers no cargan este paquete directamente.
- Docencia y demostraciones de infraestructura: el despliegue multi-host con fabric configurado, checksums y generador de configuración es un caso práctico de operación de modelos grandes en hardware de borde.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Perplejidad interna (holdout de 8188 tokens) | FP8 origen 7,9321; EXL3 candidato 8,0660 (+1,69% relativo) | Implementación ExLlamaV3 personalizada, caché latente Q8 |
| Generación de código | ~11,87 tok/s | 4x GB10, reloj GPU limitado a 2 GHz, contexto 8192, concurrencia 1, decodificación plana |
| Edición de código | ~10,14 tok/s | Mismas condiciones |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta conversión. Los datos anteriores son comprobaciones internas del autor, no garantías de throughput, y el layout público de descarga no se ha vuelto a ejecutar en un benchmark completo sobre GPU.

## Requisitos de hardware

- Almacenamiento: al menos 410 GB libres para los pesos (403,28 GB de ficheros), más espacio para el runtime, la imagen de contenedor y margen operativo.
- VRAM/ memoria unificada: el autor no publica una cifra de VRAM por nodo; el despliegue de referencia reparte el modelo entre cuatro máquinas NVIDIA GB10 / DGX Spark, cada una con memoria unificada. No hay datos de consumo por host en la información disponible.
- GPU recomendadas: cuatro GB10 / DGX Spark es la configuración validada. No se ha cualificado A100, H100 ni RTX 4090 con esta receta.
- GPU de consumo: no cabe en una RTX 4090 ni en GPUs consumer de una sola tarjeta; el tamaño de pesos (403 GB) lo impide.
- Opciones de despliegue: exclusivamente el fork comunitario de TensorFold incluido en `recipes/4x-spark`, con parche de código fuente y runtime personalizado. El autor advierte que TensorFold oficial, vLLM, SGLang y Transformers no son cargadores directos para este paquete EXL3.
- Latencia y throughput: ~11,87 tok/s en generación de código y ~10,14 tok/s en edición, con contexto 8192, concurrencia 1 y reloj limitado a 2 GHz. Los 20 tok/s, los 262k/1M de contexto, la caché compartida de 524k y los cuatro usuarios simultáneos no están cualificados con esta receta; el layout de caché nativo actual no cabe en el contexto de 262k planificado sobre cuatro GB10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| Mistral-Large-4-1T-A52B-EXL3-3.0bpw (esta ficha) | 201,6B empaquetados (1T declarados en el base, 52B activos) | 8192 tokens en la receta | EXL3 3,0 bpw | Mistral Ecosystem Open-Weight | 4x GB10 con TensorFold modificado |
| mistralai/Mistral-Large-4-1T-A52B (original) | 1T totales, 52B activos | 262k/1M anunciados | FP8 / NVFP4 | Mistral Ecosystem Open-Weight | Hardware de datacenter; no disponible el detalle exacto |
| Otras conversiones EXL3 del mismo base | no disponible | no disponible | EXL3 a otros bpw | Mistral Ecosystem Open-Weight | no disponible |

No se dispone de datos de benchmarks comparativos entre esta conversión y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base, sobre los que esta ficha no tiene datos.
- Riesgo de alucinación: no evaluado en esta conversión; la cuantización a 3 bpw puede incrementar la degradación en tareas de razonamiento largo, aunque la perplejidad medida solo sube un 1,69% relativo en un holdout pequeño.
- Contexto limitado: 8192 tokens en la receta incluida, muy por debajo de los 262k/1M anunciados para el modelo original. El layout de caché nativo actual no permite alcanzar 262k sobre cuatro GB10.
- Concurrencia y latencia: una sola petición activa, sin decodificación especulativa, y throughput de ~10-12 tok/s. No apto para producción con múltiples usuarios simultáneos.
- Compatibilidad: no es un paquete cargable por vLLM, SGLang, Transformers ni TensorFold oficial; requiere el fork y el parche incluidos.
- Visión: los pesos se preservan pero no hay inferencia de imagen funcional verificada.
- Licencia: la Mistral Ecosystem Open-Weight License impone condiciones de atribución y uso; hay que leerla antes de cualquier despliegue comercial. El runtime Apache-2.0 no sustituye ni amplía la licencia del modelo.
- Madurez: release comunitario independiente, sin aval de Mistral AI, con 0 descargas y 0 likes en el momento de la consulta; el layout público no se ha revalidado con un benchmark completo en GPU.
- Verificación: las comprobaciones de hashes y perplejidad son del autor; conviene reproducirlas antes de confiar en el paquete en entornos críticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/piotrkosecki/Mistral-Large-4-1T-A52B-EXL3-3.0bpw
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Receta de despliegue en 4x Spark: https://huggingface.co/piotrkosecki/Mistral-Large-4-1T-A52B-EXL3-3.0bpw/tree/main/recipes/4x-spark
- Model card original copiada: README.upstream.md en el repositorio
- Resumen de validación: validation-summary.json en el repositorio
- Licencia del modelo: LICENSE en el repositorio
- Licencias del runtime: recipes/4x-spark/licenses
- Autor: https://huggingface.co/piotrkosecki
- Apoyo al autor: https://buymeacoffee.com/piotr.kosecki
