# bambocher/LFM3-1.7B-oQ3.5e

## Resumen

LFM3-1.7B-oQ3.5e es una cuantización mixta del modelo LFM3 de 1.700 millones de parámetros, publicada por el usuario bambocher en Hugging Face. El checkpoint se ha generado con oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta orientada al ecosistema MLX de Apple, y emplea una combinación de capas en 3, 4, 5, 6 y 8 bits con un promedio efectivo de 4,001 bits por peso. El resultado es un checkpoint de 0,805 GiB que reduce drásticamente el espacio ocupado frente a los pesos originales en BF16.

El modelo base LFM3 corresponde a la familia de modelos de lenguaje de Liquid AI, aunque la model card publicada no incluye información sobre arquitectura, datos de entrenamiento, idiomas ni licencia del modelo original. La ficha se limita, por tanto, a documentar lo que el autor ha hecho público: el esquema de cuantización, la distribución de bits y el tamaño del repositorio.

Su relevancia práctica radica en que permite ejecutar un modelo de 1.700 millones de parámetros en hardware con memoria unificada limitada, como equipos Apple Silicon, con un coste de almacenamiento inferior a 1 GB. No obstante, al tratarse de una publicación sin descargas ni validación comunitaria, debe considerarse un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; la model card no detalla la arquitectura) |
| Parametros totales | 1.728.801.536 (1,729B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta: affine 3-bit (grupo 64), 4-bit (grupo 64), 5-bit (grupo 64), 6-bit (grupo 64), 8-bit (grupo 64) y BF16; promedio efectivo 4,001 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, requiere `custom_code`) |
| Tamano del repositorio | 0,9 GB (0,805 GiB de pesos) |
| Libreria | mlx |
| Herramienta de cuantizacion | oQ (oMLX v0.7.3) |
| Fecha de publicacion | 2026-11-14 |

Distribucion de bits del checkpoint:

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 1,146B | 66,300% | 0,467 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 0,323B | 18,683% | 0,169 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,241B | 13,952% | 0,154 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,017B | 0,970% | 0,013 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,001B | 0,072% | 0,001 GiB | 8,50 |
| BF16 | 0,000B | 0,022% | 0,001 GiB | 16,00 |
| **Total** | **1,729B** | **100%** | **0,805 GiB** | **4,001** |

## Arquitectura y entrenamiento

La model card no proporciona información sobre la arquitectura del modelo base LFM3 ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo único documentado es el proceso de cuantización posterior: oQ (oMLX v0.7.3) asigna precisiones distintas a distintos tensores según su sensibilidad, de modo que el 66,3% de los pesos lógicos se almacenan en 3 bits y solo un 0,97% en 6 bits o superior. Esta estrategia de precisión mixta busca preservar la calidad en las capas más sensibles mientras comprime agresivamente el resto.

El checkpoint requiere `custom_code` para cargarse, lo que implica que el repositorio incluye código propio más allá de la implementación estándar de MLX. No se especifica qué componentes del modelo (embeddings, atención, MLP) reciben cada nivel de precisión, ni si se aplicaron técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: capacidad esperable de un modelo de 1,7B, aunque no hay evaluación publicada en este checkpoint.
- Razonamiento y matemáticas: no disponible; no se han publicado evaluaciones.
- Generación de código: no disponible; no se han publicado evaluaciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

No se puede confirmar ninguna capacidad específica más allá de la generación de texto propia de un modelo de lenguaje, porque la model card no documenta el comportamiento del modelo base ni se han publicado pruebas del checkpoint cuantizado.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint ocupa 0,805 GiB y usa MLX, por lo que puede cargarse en equipos con memoria unificada de 8 GB o superior, dejando espacio para el contexto y el runtime. Es adecuado para prototipos en portátiles Mac.
- Experimentación con cuantización de precisión mixta: sirve para comparar la calidad de oQ frente a cuantizaciones uniformes de 4 bits en tareas concretas, midiendo la degradación introducida por las capas en 3 bits.
- Generación de texto en aplicaciones de escritorio: integrable en apps macOS nativas mediante MLX, con latencia baja por el reducido tamaño del modelo.
- Clasificación y etiquetado de textos cortos: tareas de baja complejidad donde un modelo de 1,7B suele ser suficiente y el coste de memoria es determinante.
- Evaluación de pipelines de despliegue MLX: útil como caso de prueba para validar la carga de checkpoints con `custom_code` y precisión mixta en entornos de CI.
- Filtrado y resumen de documentos en local: procesamiento por lotes de textos de longitud moderada en máquinas sin GPU dedicada, siempre que se valide previamente la calidad del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de compresión (bits por peso y tamaño de almacenamiento), no de calidad.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 0,8-1,0 GB solo para los pesos; con overhead de runtime y KV cache, entre 1,5 y 3 GB según la longitud de contexto.
- GPU recomendadas: no disponible; el formato MLX está diseñado para Apple Silicon (M1, M2, M3, M4 y superiores) con memoria unificada.
- ¿Cabe en GPU consumer? En GPUs NVIDIA no es directamente compatible sin conversión; en Apple Silicon cabe en cualquier equipo con 8 GB o más de memoria unificada.
- Opciones de despliegue: MLX (librería `mlx`), con posible uso de `mlx-lm` si el `custom_code` del repositorio lo permite. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ3.5e (este) | 1,729B | no disponible | Mixta 3-8 bits (~4,0 bits/peso) | no disponible | MLX, Hugging Face |
| LFM3-1.7B (base, BF16) | 1,729B | no disponible | BF16 | no disponible | no verificado en la información disponible |
| Alternativas de ~1,7B en 4 bits | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas: faltan datos del modelo base (licencia, contexto, benchmarks) y no se han identificado en la información proporcionada otros checkpoints comparables de la misma familia.

## Limitaciones y advertencias

- Sin benchmarks de calidad: no hay evidencia publicada de que la cuantización mixta preserve el rendimiento del modelo base; las capas en 3 bits (66,3% de los pesos) pueden degradar tareas sensibles.
- Licencia desconocida: no se indica la licencia del modelo base ni del checkpoint, por lo que no se puede garantizar el uso comercial.
- Modelo base no documentado: se desconoce la arquitectura, el contexto máximo, los idiomas y los sesgos del LFM3 original a partir de esta ficha.
- Riesgo de alucinación: inherente a los modelos de 1,7B, agravado por la compresión; requiere validación en producción.
- Dependencia de `custom_code`: la carga exige código propio del repositorio, lo que añade riesgo de seguridad y complica la portabilidad fuera de MLX.
- Sin adopción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentación de terceros sobre su funcionamiento.
- Compatibilidad limitada: al estar en formato MLX, no es directamente utilizable en ecosistemas CUDA ni en herramientas estándar como llama.cpp u Ollama sin conversión.
- Fecha de publicación futura: el repositorio figura creado el 2026-11-14, lo que conviene verificar antes de confiar en los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ3.5e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base LFM3: no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
