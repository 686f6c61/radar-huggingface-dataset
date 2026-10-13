# jdominick05/Qwen3.8-27B-24GB-128k-GGUF

## Resumen

Qwen3.8-27B-24GB-128k-GGUF es un repositorio de cuantizaciones GGUF en precisión mixta del modelo base Qwen/Qwen3.8-27B (27.320.697.856 parámetros), publicado por el usuario jdominick05. No es un modelo entrenado desde cero ni un ajuste fino: es un trabajo de cuantización orientado a un objetivo muy concreto, ejecutar el modelo con una ventana de contexto de 128k íntegramente en una única GPU de 24 GB de VRAM, medido sobre una RX 7900 XTX con llama.cpp y ROCm.

La innovación del repositorio está en la asignación desigual de bits: las 16 capas de atención completa y las capas recurrentes de atención lineal reciben más precisión, mientras que los pesos voluminosos de up/gate de las capas feed-forward reciben menos. Se publican dos ficheros, R1-mix (15,8 GiB, el más preciso) y R2-mix (14,3 GiB, el recomendado para 128k con caché KV de 8 bits). Ambos son solo texto, sin proyector de visión, y conservan la capa de predicción multi-token (MTP) cuantizada con la misma receta.

Su relevancia es práctica: el autor aporta métricas de divergencia KL frente a una referencia Q8_0 y una comparativa de velocidad y de tareas agénticas contra otras cuantizaciones de la comunidad (Unsloth UD-IQ4_XS, Q4_K_M de la librería de Ollama, ATX-IQ4_XS-M e IQ4-MIX). Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto reciente y poco validado por terceros, aunque la licencia apache-2.0 del modelo base facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido del modelo base Qwen/Qwen3.8-27B: 16 capas de atención completa más capas recurrentes de atención lineal (según la model card del cuantizador) |
| Parámetros totales | 27.320.697.856 (dato real de safetensors del modelo base) |
| Parámetros activos | No aplica / no disponible: no se indica que el modelo base sea MoE |
| Longitud de contexto | 128.000 tokens (128k), objetivo declarado de la cuantización |
| Tipos de cuantización | GGUF en precisión mixta: dos variantes, R1-mix y R2-mix; caché KV en 8 bits (R2-mix a 128k) o 4 bits (R1-mix a 128k); se comparan con Q8_0, Q4_K_M y UD-IQ4_XS |
| Idiomas soportados | No disponible: ni los metadatos ni la model card lo especifican |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño de los ficheros | R2-mix: 14.677 MiB (14,3 GiB / 15,4 GB); R1-mix: 16.167 MiB (15,8 GiB / 16,9 GB) |
| Tamaño del repositorio | 32,3 GB |
| Método de cuantización | Precisión mixta guiada por imatrix; la capa MTP se conserva y se cuantiza con la misma receta |
| Modalidad | Solo texto (sin proyector de visión) |
| Librería | gguf |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El repositorio no entrena nada: cuantiza los pesos BF16 de Qwen/Qwen3.8-27B. La arquitectura del modelo base combina dos tipos de capas según la descripción del autor: 16 capas con atención completa y capas recurrentes basadas en atención lineal. Esa estructura híbrida condiciona toda la receta de cuantización, porque el autor asigna más bits a las capas de atención completa y a las recurrentes, y menos a los pesos up/gate de las capas feed-forward, que son los más voluminosos. También se preserva la capa de predicción multi-token (MTP), cuantizada con la misma receta, lo que abre la puerta a decodificación especulativa en llama.cpp.

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, la composición de los datos ni si hubo RLHF, DPO u otras etapas de alineamiento: esos detalles corresponden a la model card de Qwen/Qwen3.8-27B, que no forma parte de la información proporcionada. Lo que sí aporta este repositorio es una metodología de evaluación de la cuantización: se mide la divergencia KL frente a una referencia Q8_0 de los mismos pesos BF16 sobre 24.576 tokens retenidos (6 fragmentos de 4.096) de texto técnico (código C, salida de decompilador, prosa de manuales de CPU, notas técnicas), con `llama-perplexity --kl-divergence`.

## Capacidades

- Generación de texto y respuesta conversacional: el pipeline declarado es text-generation y el tag `conversational` está presente.
- Razonamiento con modo de pensamiento: la evaluación agéntica se ejecutó con `--reasoning-effort medium`, lo que indica soporte de effort de razonamiento configurable en el runtime.
- Código: las tareas evaluadas incluyen lectura de código C, salida de decompilador Ghidra, fuentes de Wine, un programa MASM y un módulo Python; además, el texto de calibración de la KLD es código C y prosa técnica.
- Edición de código con verificación: las tareas E1-E3 consisten en añadir un operador a un programa MASM, corregir dos bugs en un módulo Python y añadir una opción de CLI, evaluadas compilando y ejecutando tests.
- Tool calling y uso de agentes: la suite se ejecutó en modo headless mediante Qwen Code 0.25.1 con límites de 30 turnos, 10 minutos y 80 llamadas a herramientas, lo que confirma soporte de tool calling y de razonamiento multi-paso.
- Contexto largo: ventana de 128k tokens ejecutable en una sola GPU de 24 GB, lo que habilita tareas de lectura de repositorios y workspaces extensos.
- Extracción estructurada de hechos: las tareas K1-K8 se responden como pares `KEY=value`, un formato típico de pipelines de extracción.
- Decodificación multi-token: la capa MTP se conserva en la cuantización, lo que permite decodificación especulativa en llama.cpp.
- Multilingüe: no disponible, no hay datos en la información proporcionada.
- Visión: no incluida (el fichero es solo texto). El autor indica que el `mmproj-F16.gguf` de unsloth/Qwen3.8-27B-GGUF procede del mismo modelo base y debería funcionar, pero no fue probado.
- Audio: no disponible.

## Casos de uso

- Lectura y comprensión de repositorios grandes en local: con 128k tokens de contexto en una GPU de 24 GB, el modelo puede cargar ficheros completos de código, notas y volcados de decompilador en un solo prompt, sin trocear el material ni perder dependencias entre ficheros.
- Asistencia a ingeniería inversa: las tareas K1-K8 del banco de pruebas son exactamente esto (decompilados de Ghidra, fuentes de Wine, notas de trabajo), con extracción de hechos verificados como `KEY=value`; un analista puede automatizar la recolección de hechos sobre un binario o un proyecto.
- Agente de refactorización y corrección de bugs en CI: el modelo resuelve tareas de edición que se validan compilando y ejecutando tests (E1-E3), por lo que encaja en un pipeline que lance Qwen Code en modo headless sobre un repositorio y valide el resultado con la suite de tests existente.
- Añadir una capa de subagente de código a un agente mayor: al soportar tool calling con límites de 80 llamadas y 30 turnos, se puede usar como ejecutor de subtareas de código y delegar la orquestación en otro modelo.
- Despliegue en estaciones de trabajo con GPU AMD: el autor midió el rendimiento con llama.cpp y ROCm sobre una RX 7900 XTX, un escenario poco cubierto por las cuantizaciones pensadas para CUDA, lo que lo hace adecuado para equipos de desarrollo con hardware AMD.
- Extracción de información estructurada de documentación técnica: el formato de salida `KEY=value` y el contexto de 128k permiten procesar manuales o documentación extensa y devolver campos normalizados por documento.
- Sustitución de una API de pago en tareas de análisis de código internas: con licencia apache-2.0 y ejecución local, se puede procesar código propietario sin enviarlo a servicios externos.
- Comparación de recetas de cuantización en un pipeline propio: el repositorio incluye el método (KLD contra Q8_0, suite agéntica con Qwen Code), reutilizable para decidir qué cuantización desplegar en cada hardware.

## Benchmarks y rendimiento

Divergencia KL frente a una cuantización Q8_0 de los mismos pesos BF16. Texto de evaluación: 24.576 tokens retenidos de texto técnico. Menos KLD es mejor.

| Modelo | Tamaño (MiB) | KLD media | Mismo token top | PPL vs Q8_0 | KLD percentil 99,9 |
|---|---|---|---|---|---|
| Ollama `qwen3.8:27b` (Q4_K_M) | 16.032 | 0,0336 ± 0,0018 | 92,8 % | +2,8 % | 2,57 |
| Unsloth `UD-IQ4_XS` | 13.593 | 0,0227 ± 0,0018 | 94,0 % | +0,6 % | 1,12 |
| R1-mix (este repositorio) | 16.167 | 0,0148 ± 0,0017 | 94,6 % | +0,9 % | 0,54 |
| R2-mix (este repositorio) | 14.677 | 0,0159 ± 0,0005 | 94,3 % | +1,3 % | 0,62 |

Velocidad y memoria medidas con llama-server b1343, ROCm, RX 7900 XTX, 128k de contexto y caché KV q4_0 (prompt medido en fragmentos de 2k tokens o más, sobre una sesión agéntica completa):

| | R2-mix | Unsloth UD-IQ4_XS | Ollama `qwen3.8:27b` Q4_K_M |
|---|---|---|---|
| Tamaño de fichero | 14.677 MiB | 13.593 MiB | 16.032 MiB |
| Velocidad de generación | 39,9 tok/s | 41,1 tok/s | 36,7 tok/s |
| Procesado de prompt | 1.012 tok/s | 978 tok/s | 954 tok/s |
| KLD media vs Q8_0 | 0,0159 ± 0,0005 | 0,0227 ± 0,0018 | 0,0336 ± 0,0018 |
| Mismo token top que Q8_0 | 94,3 % | 94,0 % | 92,8 % |
| Perplejidad vs Q8_0 | +1,3 % | +0,6 % | +2,8 % |
| KLD percentil 99,9 | 0,62 | 1,12 | 2,57 |

Suite agéntica con Qwen Code 0.25.1 (`qwen -o json`), una ejecución por tarea, `--reasoning-effort medium`, temperatura 0,3, límites de 30 turnos, 10 minutos y 80 llamadas a herramientas:

| Tarea | R2-mix | R1-mix | jakeatx ATX-IQ4_XS-M | Unsloth UD-IQ4_XS | vmarcelo IQ4-MIX | Ollama Q4_K_M |
|---|---|---|---|---|---|---|
| K1 (7 hechos) | 7 | 6 | 7 | 7 | 5 | 7 |
| K2 (9 hechos) | 9 | 9 | 9 | 9 | 7 | 7 |
| K3-K7 (17 hechos) | 17 | 17 | 17 | 17 | 17 | 17 |
| K8 (6 hechos) | 6 | 6 | 0 (agotó el límite de 10 min) | 6 | 6 | 6 |
| E1-E3 (3 tareas) | 3 | 3 | 3 | 3 | 3 | 3 |
| Tareas resueltas | 11/11 | 10/11 | 10/11 | 11/11 | 9/11 | 10/11 |
| Tiempo total | 9,1 min | 9,5 min | 21,6 min | 10,8 min | 7,7 min | 9,5 min |

El propio autor advierte de que, con una sola ejecución por tarea, las diferencias de una tarea están dentro del ruido entre ejecuciones, y que la señal consistente es que las dos cuantizaciones con mayor KLD (vmarcelo IQ4-MIX y Ollama Q4_K_M) son las que perdieron hechos en K2. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks académicos estándar en la información disponible.

## Requisitos de hardware

- VRAM para R2-mix: 15,4 GB de pesos; 128k de contexto con caché KV de 8 bits ocupa aproximadamente 19,7 GB de VRAM.
- VRAM para R1-mix: 16,9 GB de pesos; para 128k en una tarjeta de 24 GB requiere caché KV de 4 bits.
- GPU de referencia: AMD RX 7900 XTX de 24 GB, con ROCm, bajo Windows 11 y CPU Ryzen 7 7800X3D. Es el único hardware documentado.
- GPU consumer: sí, cabe en tarjetas de 24 GB. El repositorio no documenta su comportamiento en GPUs de 16 GB o menos, ni con cuantizaciones más agresivas.
- GPUs NVIDIA y Apple Silicon: no disponible. El autor etiqueta el repositorio con `rocm` y toda la medición es sobre AMD; no hay resultados en CUDA ni Metal.
- Despliegue: llama.cpp / llama-server (versión b1343 en las pruebas), `llama-perplexity` para la evaluación de KLD. Ollama aparece como referencia comparativa, y Qwen Code 0.25.1 se usa como cliente agéntico con salida JSON.
- Throughput medido (R2-mix, 128k, RX 7900 XTX): 39,9 tok/s de generación y 1.012 tok/s de procesado de prompt. Con UD-IQ4_XS: 41,1 tok/s y 978 tok/s. Con Ollama Q4_K_M: 36,7 tok/s y 954 tok/s.
- Latencia: no disponible. La sección "Speed and memory at 128k" de la model card está truncada en la información proporcionada, por lo que no constan los detalles completos de memoria ni cualquier otra medición adicional.

## Comparativa con modelos similares

Comparativa con cuantizaciones del mismo modelo base, que es la categoría relevante aquí (mismo tamaño y misma tarea):

| Cuantización | Tamaño | KLD media | Generación | Prompt | Licencia / disponibilidad |
|---|---|---|---|---|---|
| R1-mix (este repositorio) | 16.167 MiB | 0,0148 | no medido en la tabla de velocidad | no medido | apache-2.0, descarga directa en HuggingFace |
| R2-mix (este repositorio) | 14.677 MiB | 0,0159 | 39,9 tok/s | 1.012 tok/s | apache-2.0, descarga directa en HuggingFace |
| Unsloth UD-IQ4_XS | 13.593 MiB | 0,0227 | 41,1 tok/s | 978 tok/s | Ver licencia en unsloth/Qwen3.8-27B-GGUF |
| Ollama `qwen3.8:27b` (Q4_K_M) | 16.032 MiB | 0,0336 | 36,7 tok/s | 954 tok/s | Distribuido a través de la librería de Ollama |
| jakeatx ATX-IQ4_XS-M | no disponible | no disponible | no disponible | no disponible | Comparado solo en la suite agéntica |
| vmarcelo IQ4-MIX | no disponible | no disponible | no disponible | no disponible | Comparado solo en la suite agéntica |

Frente al modelo sin cuantizar, la comparación no está disponible en la información proporcionada: no hay datos del Qwen/Qwen3.8-27B en BF16.

## Limitaciones y advertencias

- Validación muy limitada: el repositorio tiene 0 descargas y 0 likes, y no hay verificación independiente de las métricas publicadas por el propio autor de la cuantización.
- La evaluación de KLD se hizo sobre un único texto de 24.576 tokens, de dominio exclusivamente técnico (código C, decompiladores, manuales de CPU), en una sola ejecución. No cubre conversación ni uso de herramientas, y el propio autor lo señala como caveat.
- La comparación con otros Q4_K_M se limita a un solo fichero de la librería de Ollama; las cuantizaciones Q4_K_M construidas con imatrix (como la mayoría de las subidas de la comunidad) no se probaron y probablemente quedarían más cerca.
- La suite agéntica usa una única ejecución por tarea, de modo que las diferencias de una tarea son ruido. Las tareas provienen de un único workspace y un único dominio, por lo que no son representativas de un uso general.
- El resultado de la tarea E1 para R1-mix y R2-mix se volvió a ejecutar tras corregir un prompt que colgaba bajo el shell Git Bash de Qwen Code en Windows; las demás cuantizaciones solo se ejecutaron con el prompt corregido.
- El fichero es solo texto: no incluye proyector de visión. El `mmproj-F16.gguf` de Unsloth debería ser compatible al provenir del mismo modelo base, pero no se probó.
- Soporte de idiomas no documentado, lo que impide garantizar un comportamiento correcto en castellano o en otros idiomas distintos del inglés técnico usado en las pruebas.
- Rendimiento medido únicamente en AMD RX 7900 XTX con ROCm bajo Windows 11; extrapolar esas cifras a GPUs NVIDIA o Apple Silicon no está justificado con los datos disponibles.
- No se documentan sesgos del modelo base en la información proporcionada; deben consultarse en la model card de Qwen/Qwen3.8-27B.
- Riesgo de alucinación: no cuantificado en la información disponible. La propia suite agéntica muestra que dos cuantizaciones perdieron hechos en la tarea K2, lo que indica que la degradación por cuantización puede manifestarse como pérdida de fidelidad factual en tareas de extracción.
- Licencia: apache-2.0, sin restricciones de uso comercial declaradas en los metadatos. Conviene verificar igualmente las condiciones del modelo base Qwen/Qwen3.8-27B, no incluidas en la información disponible.
- La model card proporcionada está truncada en la sección de velocidad y memoria a 128k, por lo que puede faltar información relevante sobre consumo de memoria en otros escenarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jdominick05/Qwen3.8-27B-24GB-128k-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones alternativas de Unsloth (incluye `mmproj-F16.gguf`): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
