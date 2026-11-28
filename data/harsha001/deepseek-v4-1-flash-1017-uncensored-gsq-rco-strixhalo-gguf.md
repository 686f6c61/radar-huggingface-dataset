# Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF es una cuantización extrema y comunitaria del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario Harsha001. Su objetivo es comprimir un modelo MoE de gran escala (657.884.565.104 parámetros totales) hasta que quepa en una única máquina AMD Ryzen AI Max+ 395 "Strix Halo" con 128 GB de memoria unificada, apuntando a una ventana de contexto de 64K. Para lograrlo combina poda de expertos por capa (se conservan entre 320 y 344 de los 384 expertos enrutados), cuantización de muy bajo bit (1,56 a 1,75 bits por peso en los expertos) y una tabla de búsqueda "Engram" que permanece en SSD y se lee bajo demanda.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 384 expertos enrutados por capa. Las versiones aquí publicadas incorporan además una edición "uncensored" (eliminación de rechazos mediante técnicas de abliteration) procedente de los trabajos de Infatoshi, pqhaz y AtomicChat. El resultado es un modelo de texto conversacional sin filtros de rechazo, orientado a inferencia local en hardware AMD con el fork ROCmFPX de llama.cpp.

Es relevante ahora porque demuestra una vía práctica para ejecutar modelos de centenares de miles de millones de parámetros en un equipo de escritorio con memoria unificada, a costa de una pérdida de calidad medible (perplejidad de 3,39 frente a 2,01 del modelo completo). La licencia es MIT y el estado declarado por el autor es "community test release": las compilaciones se han validado en CPU y en una NVIDIA GB10 con CUDA, pero no en un Strix Halo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 384 expertos enrutados por capa |
| Parámetros totales | 657.884.565.104 |
| Parámetros activos | no disponible |
| Longitud de contexto | 64K (objetivo declarado por el autor) |
| Tipos de cuantización | IQ1_S_ROCMIQ (1,56 bit), GSQ-RCO IQ1_M (1,75 bit); el build IQ1_M mezcla tensores IQ2 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards por build: 3 de modelo + 1 de Engram) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos: 384 expertos enrutados por capa, con atención y router en precisión superior y los expertos comprimidos a 1-2 bits. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original DeepSeek-V4.1-Flash-1017.

La innovación técnica de esta publicación es el pipeline de compresión: poda de expertos guiada por peso de enrutamiento (se conserva el 98,4 % del peso de routing con 344 expertos, o el 97,5 % con 320), cuantización de muy bajo bit específica para AMD (ROCmIQ1_S, decodificada sin las grandes rejillas de búsqueda de IQ1_S/IQ1_M) y una tabla Engram de 110,6 GB que reside en SSD y se consulta bajo demanda, de modo que solo unos 97 GiB deben caber en memoria de GPU. El autor reporta que su kernel matricial de expertos ROCmIQ1_S superó a IQ1_S en todos los tamaños de fila en pruebas sobre una Radeon 8060S (Vulkan), alrededor de un 11 % en los tamaños de DeepSeek.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y respuesta a instrucciones (modelo de tipo instruct/chat según el pipeline declarado).
- Generación de código y matemáticas: capacidad heredada del modelo base, no verificada de forma independiente en esta cuantización.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo "uncensored": se han eliminado los rechazos mediante edición de abliteration sobre los pesos completos.
- Contexto objetivo de 64K tokens.

## Casos de uso

- Inferencia local de un modelo de gran escala en un equipo de escritorio: con unos 97 GiB en memoria de GPU y el resto en SSD, permite ejecutar un MoE de 657.000 millones de parámetros totales en una única máquina Strix Halo de 128 GB, sin clúster ni GPUs de datacenter.
- Experimentación e investigación sobre cuantización extrema: los ficheros `keep/` con las listas de expertos conservados y las métricas de divergencia KL permiten reproducir y comparar estrategias de poda de expertos.
- Evaluación de kernels y formatos de bajo bit en AMD: el build ROCmIQ1_S sirve para medir en `llama-bench` (pp512/tg128) el rendimiento de un formato de 1 bit específico para ROCm frente a IQ1_M.
- Prototipado de asistentes conversacionales sin filtros de rechazo: útil en entornos controlados de investigación donde se necesita estudiar el comportamiento del modelo ante solicitudes que un modelo alineado rechazaría.
- Generación de texto con contexto largo: la ventana objetivo de 64K permite procesar documentos extensos o conversaciones prolongadas en local.
- Docencia y demostraciones de arquitecturas MoE: el modelo permite ilustrar en hardware de consumo conceptos de enrutamiento de expertos, poda y cuantización de pesos.

## Benchmarks y rendimiento

| Build | Divergencia KL | Mismo token top-1 | Perplejidad | Perplejidad vs. modelo completo |
|---|---|---|---|---|
| IQ1_S_ROCMIQ-E344 | 0,629 ± 0,013 | 77,7 % | 3,39 | ×1,69 |
| IQ1_M-E320 | 0,635 ± 0,015 | 77,6 % | 3,42 | ×1,70 |
| Modelo completo (Infatoshi, MXFP4 nativo) | no disponible | no disponible | 2,01 | referencia |

Metodología declarada por el autor: texto de test de wikitext-2 (primeros 300.000 caracteres), 8 fragmentos de 2048 tokens, divergencia KL sobre el vocabulario completo frente al modelo completo de 510 GB ejecutado sin pérdida en CPU. El autor indica que una ejecución completa de 32 fragmentos está en curso. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de GPU: aproximadamente 97 GiB para la parte del modelo (atención, router y expertos conservados); el build IQ1_S_ROCMIQ ocupa 104,1 GB (97,0 GiB) y el IQ1_M-E320, 104,5 GB (97,3 GiB).
- Almacenamiento: la tabla Engram (110,6 GB) permanece en SSD y se lee bajo demanda, sin consumir memoria de GPU; cada build ocupa unos 215 GB en disco.
- GPU recomendada: AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada, el objetivo de diseño.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090, etc.) por el tamaño de la parte residente en memoria; el autor solo reporta validación en CPU y en una NVIDIA GB10 con CUDA.
- Despliegue: fork ROCmFPX de llama.cpp; el build IQ1_S_ROCMIQ requiere el commit `bb36a5fdb` o posterior (main desde el 27 de noviembre de 2026); el build IQ1_M funciona con cualquier build de ROCmFPX con soporte de DeepSeek-V4.1.
- Latencia y throughput: no disponibles; el autor solicita a la comunidad mediciones de `llama-bench` (pp512/tg128) en Strix Halo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Perplejidad (wikitext-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (IQ1_S_ROCMIQ-E344) | 657.884.565.104 | 64K (objetivo) | 3,39 | MIT | GGUF en Hugging Face |
| Este modelo (IQ1_M-E320) | 657.884.565.104 | 64K (objetivo) | 3,42 | MIT | GGUF en Hugging Face |
| DeepSeek-V4.1-Flash-1017 (completo, Infatoshi MXFP4) | no disponible | no disponible | 2,01 | no disponible | pesos completos, ~510 GB |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | no disponible | no disponible | no disponible | no disponible | GGUF en Hugging Face |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | no disponible | no disponible | no disponible | no disponible | GGUF en Hugging Face |

## Limitaciones y advertencias

- Pérdida de calidad medible: la perplejidad es de 3,39 frente a 2,01 del modelo completo (×1,69), con solo el 77,7 % de coincidencia en el token top-1.
- Estado de validación incompleto: el autor declara que ninguna de las dos compilaciones se ha ejecutado en un Strix Halo real; solo hay pruebas en CPU y en una NVIDIA GB10 con CUDA.
- Dependencia de un runtime no estándar: el build ROCmIQ1_S exige el fork ROCmFPX en el commit `bb36a5fdb` o posterior; versiones anteriores ignoran las escalas de expertos y producen salidas incorrectas.
- Modelo "uncensored": la eliminación de rechazos implica que el modelo puede generar contenido dañino, ilegal o sesgado sin filtros; no es adecuado para despliegues públicos sin moderación externa.
- Idiomas no declarados: no hay información sobre la cobertura lingüística de esta cuantización.
- Riesgo de alucinación: no cuantificado en la información disponible; la poda de expertos y la cuantización de 1 bit pueden agravarlo en tareas de razonamiento.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías y el modelo se distribuye como "community test release".
- Tamaño de descarga: el repositorio completo ocupa 742,7 GB (dos builds más el fichero Engram); el chequeo de hardware de Hugging Face suma todos los ficheros y sobreestima la memoria necesaria.

## Enlaces

- [Hugging Face: Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF](https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF)
- [Modelo base: deepseek-ai/DeepSeek-V4.1-Flash-1017](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)
- [Infatoshi/DeepSeek-V4.1-Flash-1017-MXFP4-uncensored](https://huggingface.co/Infatoshi/DeepSeek-V4.1-Flash-1017-MXFP4-uncensored)
- [pqhaz/DeepSeek-V4.1-Flash-1017-heretic](https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic)
- [ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF)
- [AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF](https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF)
- [ROCmFPX (página del proyecto)](https://harshavardhan3002.github.io/ROCmFPX/)
- [Paper arXiv:2604.18556](https://arxiv.org/abs/2604.18556)
- [Paper arXiv:2605.00649](https://arxiv.org/abs/2605.00649)
