# scottlowry/Qwen3.6-35B-A3B-oQ5e-mtp

## Resumen

Qwen3.6-35B-A3B-oQ5e-mtp es una cuantización mixta del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario scottlowry. Se distribuye en formato MLX (Apple Silicon) mediante la herramienta oQ de oMLX v0.7.3.dev2, con una precisión efectiva media de 5,786 bits por peso. El checkpoint completo ocupa 24,216 GiB en almacenamiento, frente a los 51,9 GB del repositorio (que incluye otros artefactos además de los pesos). El modelo base es un MoE de Qwen con 35.951.822.704 parámetros totales y 3B activos, según el nombre del modelo.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización mixta poco habitual (combinación de 5, 6 y 8 bits con distintos tamaños de grupo, más una pequeña porción en BF16), y por otro, incluye una cabeza MTP (multi-token prediction) de 0,845B parámetros y un codificador visual de 0,447B, lo que indica que el modelo base es multimodal. La cuantización está pensada para inferencia local en hardware Apple mediante MLX, no para despliegues en GPU NVIDIA.

No se dispone de información publicada sobre licencia, idiomas soportados, pipeline ni resultados de benchmarks en la información proporcionada. La model card se limita a detallar la distribución de bits y el desglose de almacenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) con cabeza MTP y torre de visión |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | 3B (según el nombre del modelo; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit group 128, 5-bit group 64, 6-bit group 64, 8-bit group 128, 8-bit group 64 y BF16 (media efectiva 5,786 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), quantized (oQ) |
| Tamano del repo | 51,9 GB |
| Tamano del checkpoint | 24,216 GiB (26,002 GB) |
| Fecha de creacion | 2026-10-13 |
| Ultima actualizacion | 2026-11-11 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de la familia Qwen3.5/3.6, con 35.952B parámetros totales y, según el nombre del checkpoint, 3B parámetros activos por token. La model card no aporta detalles sobre el número de expertos, la proporción de activación, la longitud de contexto nativa ni la composición del dataset de entrenamiento del modelo original. Tampoco se documenta si hubo RLHF, DPO u otras fases de alineamiento.

La innovación técnica destacable de esta publicación es la receta de cuantización mixta aplicada con oQ (oMLX). El 91,838% de los pesos lógicos (33,018B) se almacenan en affine 5-bit con grupo de 64 (5,50 bits efectivos), mientras que un 4,029% (1,449B) se eleva a 8-bit grupo 64 y un 1,329% (0,478B) se mantiene en BF16, presumiblemente para capas sensibles a la precisión. Además, el checkpoint conserva una cabeza MTP de 0,845B parámetros (0,604 GB, 0,562 GiB), lo que sugiere soporte para decodificación especulativa o predicción multi-token, aunque la model card no describe cómo se activa en MLX. La torre de visión (0,447B parámetros, 0,893 GB) confirma que el modelo base acepta entradas de imagen.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.6-35B-A3B, no detalladas en la model card.
- Procesamiento de visión: el checkpoint incluye un componente de visión de 0,447B parámetros, lo que implica soporte de entrada multimodal (imagen + texto).
- Predicción multi-token (MTP): la cabeza MTP de 0,845B parámetros está incluida en el checkpoint, lo que podría habilitar decodificación especulativa en el runtime MLX.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización de 5,786 bits permiten ejecutar un MoE de 35,952B en equipos con memoria unificada de 32 GB o superior, algo inviable con los pesos en BF16 (unos 72 GB).
- Prototipado multimodal en portátiles: la torre de visión incluida permite probar flujos de imagen + texto (por ejemplo, descripción de capturas o extracción de datos de documentos) sin depender de servicios en la nube.
- Evaluación de recetas de cuantización: la distribución mixta de bits (5, 6, 8 y BF16) sirve como referencia para estudiar el impacto de la precisión selectiva en calidad y tamaño.
- Decodificación especulativa en MLX: la cabeza MTP incluida puede aprovecharse para acelerar la generación en runtimes que la soporten, reduciendo la latencia por token.
- Desarrollo de asistentes técnicos offline: con 3B parámetros activos (según el nombre), el coste computacional por token es bajo, adecuado para asistentes de código o documentación en local.
- Investigación sobre MoE cuantizados: el desglose detallado por componente (lenguaje, visión, MTP) facilita analizar qué partes del modelo toleran cuantización agresiva y cuáles requieren mayor precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 24,216 GiB solo para los pesos; con overhead de runtime MLX, se recomienda al menos 32 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4 Pro, Max o Ultra) con 32 GB o más; el formato MLX no está pensado para GPU NVIDIA.
- ¿Cabe en consumer GPU? En el ecosistema Apple, sí en equipos con 32 GB o más. En GPU NVIDIA consumer (RTX 4090, 24 GB) los pesos no caben completos en memoria.
- Opciones de despliegue: MLX (librería mlx), oMLX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottlowry/Qwen3.6-35B-A3B-oQ5e-mtp | 35,952B (3B activos según nombre) | no disponible | Mixta 5/6/8-bit + BF16 (5,786 bits/peso) | no disponible | MLX, safetensors |
| Qwen/Qwen3.6-35B-A3B (base) | 35,952B (3B activos según nombre) | no disponible | BF16 original | no disponible | safetensors |
| Otras cuantizaciones del mismo base | 35,952B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 5,786 bits/peso introduce pérdida de precisión respecto al modelo base en BF16; no se han publicado evaluaciones de la degradación de calidad.
- El formato MLX limita el uso a hardware Apple Silicon; no es portable a GPU NVIDIA ni a CPU convencional sin conversión.
- La model card no especifica licencia, por lo que no se puede confirmar el uso comercial; hay que remitirse a la licencia del modelo base Qwen/Qwen3.6-35B-A3B.
- No se documentan idiomas soportados ni longitud de contexto; no se puede garantizar comportamiento multilingüe ni ventanas largas.
- Riesgo de alucinación inherente al modelo base, no mitigado ni evaluado en esta cuantización.
- La cabeza MTP y la torre de visión pueden no estar soportadas por todos los runtimes MLX; su activación depende de la versión de oMLX/mlx.
- El checkpoint se actualizó el 2026-10-25 con oMLX v0.7.3.dev2; copias anteriores pueden tener una distribución de bits distinta.
- El repositorio ocupa 51,9 GB aunque los pesos pesan 24,216 GiB, lo que sugiere artefactos adicionales (posiblemente múltiples formatos); conviene revisar los archivos antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.6-35B-A3B-oQ5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
