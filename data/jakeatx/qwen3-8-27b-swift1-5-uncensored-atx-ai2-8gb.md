# jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2-8GB

## Resumen

Este repositorio no contiene un modelo original, sino una cuantización GGUF extrema del checkpoint `d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16`, un fine-tune sin censura de Qwen3.8-27B. El autor, jakeatx, lo distribuye bajo el identificador `qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2-8GB` con el objetivo declarado de hacer caber un modelo de 27 000 millones de parámetros en tarjetas gráficas de 8 GB de VRAM, manteniendo una ventana de contexto de 204 800 tokens. Se publica como pesos cuantizados en formato GGUF para la librería llama.cpp, aunque el autor advierte que el llama.cpp estándar no puede cargarlo.

La propuesta técnica es un ejercicio de compresión agresiva: los pesos principales ocupan 6,22 GiB en la tarjeta (unos 2,09 bits por peso), mientras que la tabla de embeddings de tokens (1,3 GiB) permanece en RAM del sistema. Se complementa con una capa de borrador MTP (multi-token prediction) de 0,12 GiB y un mapa de atención dispersa. El modelo base subyacente es un transformer denso de 27B afinado sobre Qwen3.8, con licencia `swift-open-license-1.0`.

Su relevancia es acotada pero clara para un nicho concreto: demuestra que es posible ejecutar un modelo de 27B con contexto de 200K en hardware de consumo de gama media-alta, a costa de una degradación medible (KLD ≈ 0,086 frente al BF16) y de depender de un fork específico del runtime. No es un modelo para producción generalista, sino una pieza de ingeniería orientada a experimentación en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B), con capa MTP de borrador y atención dispersa |
| Parametros totales | 27 000 millones (modelo base); el campo `safetensors` del repo indica 2 097 152, dato que no refleja el tamaño real del modelo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 204 800 tokens |
| Tipos de cuantizacion | GGUF propietario "AI+" de ~2,09 bits por peso (16,4B parámetros a 1,78 bits, resto entre 2,0 y 5,1 bits; cabeza de salida a 2,5 bits) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (`license: other`) |
| Formato de pesos | GGUF (tres ficheros: modelo principal, mapa de atención dispersa y capa MTP) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 27B parámetros, afinado por d0xin sobre Qwen3.8-27B para eliminar restricciones de contenido (variante "Uncensored"). Sobre ese checkpoint BF16, jakeatx aplica un esquema de cuantización propio denominado AI+: la mayoría de los pesos (16 400 millones) se codifican a 1,78 bits, mientras que el resto recibe entre 2,0 y 5,1 bits según la importancia de cada tensor, y la cabeza de salida se mantiene a 2,5 bits. La tabla de embeddings de tokens no se cuantiza en la tarjeta, sino que se mantiene en RAM del sistema.

Tras la codificación se aplica un paso de "healing": los códigos cuantizados permanecen congelados y solo se ajustan las escalas fp16 ya presentes en el fichero y los pesos RMSNorm (58,7 millones de números de un total de 27 000 millones), minimizando la divergencia de distribución de salida frente al BF16 sobre un conjunto de calibración. Según el autor, este paso reduce el KLD de 0,0975 a 0,0857 (−12,1 %) y eleva el top-1 del 92,35 % al 92,85 %. La capa MTP permite el borrador especulativo de varios tokens verificados en una sola pasada, lo que acelera la generación. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo Qwen3.8-27B subyacente.
- Generación de código: el autor reporta 244 de 300 problemas resueltos en LiveCodeBench v6 (81,3 %) con esfuerzo de razonamiento `xhigh`.
- Sesiones agénticas y multi-turno, evaluadas explícitamente en el conjunto de pruebas del autor (categoría "Agentic").
- Redacción técnica y documentación (categoría "Docs" en las pruebas de calidad).
- Ventana de contexto muy larga (204 800 tokens), apta para leer repositorios o documentos extensos.
- Capacidad de decodificación especulativa mediante la capa MTP incluida.
- Modo sin censura: el fine-tune elimina los filtros de rechazo del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Experimentación en hardware de consumo: ejecutar un modelo de 27B con contexto de 200K en una RTX 30-series de 8 GB, útil para investigadores que quieran evaluar el comportamiento de modelos grandes sin acceso a clústeres.
- Análisis de repositorios y documentación larga: la ventana de 204 800 tokens permite cargar ficheros de código o manuales completos y hacer preguntas sobre ellos en una sola pasada.
- Generación de código en local para entornos con requisitos de privacidad: el modelo resuelve problemas de programación (81,3 % en LiveCodeBench v6) sin enviar datos a la nube, siempre que se acepte la degradación de la cuantización.
- Asistentes conversacionales sin filtros: para investigación sobre alineación, estudios de sesgo o generación de contenido creativo sin restricciones, dado el carácter "Uncensored" del fine-tune.
- Pruebas de pipelines agénticos: las evaluaciones del autor incluyen sesiones agénticas, por lo que sirve para validar flujos multi-paso en local antes de desplegarlos en modelos mayores.
- Docencia y demostraciones: permite mostrar en un portátil con GPU de 8 GB el funcionamiento de un modelo de 27B, la decodificación especulativa con MTP y el impacto de la cuantización extrema en la calidad.
- Benchmarking de cuantización: el repo publica métricas KLD y top-1 frente a otras cuantizaciones (Unsloth IQ2_XS, IQ2_XXS), lo que lo convierte en referencia para comparar esquemas de compresión.

## Benchmarks y rendimiento

Calidad frente al BF16 (KLD, menor es mejor; conjunto de texto fresco, 18 000 posiciones):

| Fichero | Memoria en tarjeta | Bits por peso | KLD | Coding | Agentic | Docs | Top-1 |
|---|---|---|---|---|---|---|---|
| Este modelo | 6,22 GiB | 2,09 | 0,0857 | 0,0999 | 0,0871 | 0,0701 | 92,85 % |
| Mismo fichero antes del healing | 6,22 GiB | 2,09 | 0,0975 | 0,1135 | 0,0994 | 0,0795 | 92,35 % |
| Unsloth Qwen3.8-27B UD-IQ2_XS | 6,79 GiB | 2,28 | 0,0924 | 0,1100 | 0,0925 | 0,0747 | 92,52 % |
| Unsloth Qwen3.8-27B UD-IQ2_XXS | 6,40 GiB | 2,14 | 0,1130 | 0,1335 | 0,1123 | 0,0934 | 91,80 % |

Segundo conjunto de pruebas (16 200 posiciones, contexto de ~12 000 tokens):

| Fichero | Memoria en tarjeta | Bits por peso | KLD | Coding | Agentic | Docs | Top-1 |
|---|---|---|---|---|---|---|---|
| Este modelo | 6,22 GiB | 2,09 | 0,0868 | 0,0899 | 0,0999 | 0,0707 | 92,52 % |
| Antes del healing | 6,22 GiB | 2,09 | 0,0994 | 0,1020 | 0,1130 | 0,0834 | 91,93 % |
| Unsloth UD-IQ2_XS | 6,79 GiB | 2,28 | 0,0935 | 0,0900 | 0,1062 | 0,0843 | 92,02 % |
| Unsloth UD-IQ2_XXS | 6,40 GiB | 2,14 | 0,1135 | 0,1081 | 0,1307 | 0,1019 | 91,44 % |
| ATX AI2 2,3 bpw (10 GB) | 6,92 GiB | 2,32 | 0,0593 | 0,0631 | 0,0684 | 0,0465 | 94,06 % |

LiveCodeBench v6 (100 problemas, 3 ejecuciones, temperatura 1,0, esfuerzo `xhigh`):

| Fichero | Problemas resueltos (de 300) |
|---|---|
| Este modelo | 244 (81,3 %) |
| Antes del healing | 239 (79,7 %) |

El autor advierte que las filas de Unsloth se miden contra Swift 1.5 BF16, no contra su propio modelo padre (Qwen3.8 estándar), por lo que parte de su KLD refleja la diferencia entre el modelo base y el fine-tune, no la calidad del cuantizador.

## Requisitos de hardware

- VRAM estimada: 6,22 GiB para los pesos en tarjeta, más 0,12 GiB de la capa MTP y espacio para caché KV; el autor indica 8 GB de VRAM con contexto de 204 800 tokens.
- RAM del sistema: al menos 1,3 GiB adicionales para la tabla de embeddings de tokens.
- GPU recomendadas: RTX 30-series de 8 GB (objetivo declarado); con `--preset 10dense` funciona en tarjetas de 10 GB.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más, pero solo con el fork llamAmpere.
- Software de despliegue: llamAmpere v0.7.0.1 con `--preset 10dense`; la versión v0.7.1 con `--preset 8dense` está anunciada pero no publicada. llama.cpp estándar no puede cargar el fichero. No hay soporte indicado para vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo afirma que la capa MTP acelera la escritura sin dar cifras.
- Ficheros necesarios: los tres GGUF (`qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2-8GB.gguf` de 8,39 GB, `lsa-qwen38-27b-d2048.gguf` de 8,39 MB y `mtp-dm.gguf` de 127,49 MB) deben permanecer en la misma carpeta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria en tarjeta | KLD (test 1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (ATX AI2 8GB) | 27B | 204 800 | 6,22 GiB | 0,0857 | swift-open-license-1.0 | llama.cpp vía fork llamAmpere |
| ATX AI2 2,3 bpw | 27B | 204 800 | 6,92 GiB | 0,0593 | swift-open-license-1.0 | llama.cpp vía fork llamAmpere |
| Unsloth Qwen3.8-27B UD-IQ2_XS | 27B | no disponible | 6,79 GiB | 0,0924 | no disponible | llama.cpp estándar |
| Unsloth Qwen3.8-27B UD-IQ2_XXS | 27B | no disponible | 6,40 GiB | 0,1130 | no disponible | llama.cpp estándar |

La comparación es delicada porque las filas de Unsloth cuantizan el Qwen3.8 estándar y se puntúan contra Swift 1.5 BF16; el propio autor señala que, medida contra su padre, UD-IQ2_XS obtiene un KLD de 0,074, mejor que el 0,0868 de este fichero contra Swift 1.5. La ventaja real de este modelo es la fidelidad al fine-tune sin censura con menor uso de VRAM, no una calidad absoluta superior.

## Limitaciones y advertencias

- Requiere un fork no estándar (llamAmpere); llama.cpp oficial no carga el fichero, lo que limita su portabilidad y su uso en producción.
- El preset para 8 GB (`8dense`) no está publicado en el momento de la ficha; solo funciona el de 10 GB.
- Degradación medible frente al BF16: KLD de 0,0857 y top-1 del 92,85 %, con pérdida apreciable en código y sesiones agénticas.
- El fine-tune es "Uncensored": elimina los rechazos del modelo original, lo que implica riesgo de generar contenido dañino, sesgado o ilegal sin filtros.
- Riesgo de alucinación inherente a un modelo de 27B comprimido a ~2 bits; la cuantización extrema puede amplificar errores en tareas de razonamiento largo.
- Idiomas soportados no documentados; no hay garantía de calidad multilingüe.
- Licencia `swift-open-license-1.0` con `license: other`: es necesario revisar el fichero LICENSE antes de cualquier uso comercial.
- El campo de parámetros en safetensors (2 097 152) es incorrecto y no debe usarse para estimar requisitos.
- Sin descargas ni likes en el momento de la ficha; sin validación independiente de las métricas publicadas por el autor.
- Los benchmarks proceden del propio autor y comparan contra un modelo padre distinto, lo que sesga la interpretación.

## Enlaces

- Hugging Face: https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2-8GB
- Modelo base: https://huggingface.co/d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16
- Variante para 10 GB: https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2
- Runtime llamAmpere (release v0.7.0.1): https://github.com/JakeATX/llamAmpere/releases/tag/v0.7.0.1
- Repositorio llamAmpere: https://github.com/JakeATX/llamAmpere
