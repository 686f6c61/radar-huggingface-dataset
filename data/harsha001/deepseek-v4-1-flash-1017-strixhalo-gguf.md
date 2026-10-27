# Harsha001/DeepSeek-V4.1-Flash-1017-StrixHalo-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-StrixHalo-GGUF es una compilación comunitaria de cuantización del modelo DeepSeek-V4.1-Flash-1017 (DeepSeek, licencia MIT), publicada por el usuario Harsha001 dentro del proyecto ROCmFPX. Su objetivo no es ofrecer una versión más ligera del modelo, sino hacerlo ejecutable en una única máquina AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada, algo imposible con el modelo original: el checkpoint completo, con 384 expertos enrutados por capa, ocupa unos 510 GB en su formato nativo MXFP4 y sigue necesitando unos 230 GB incluso con las cuantizaciones estándar más agresivas.

La receta combina tres piezas: poda de expertos por capa según el criterio REAP (se conservan 320 o 277 de los 384 expertos), cuantización de los expertos con el método GSQ-RCO de ISTA-DASLab (1,75 y 2 bits por peso aproximadamente) y externalización de la tabla Engram (110,6 GB en IQ4_NL) a un SSD, de modo que solo unos 97,3 GiB tienen que residir en memoria de GPU. El resultado son dos builds con perplejidad de 3,40 y 3,59 frente al 2,01 del modelo completo.

Es relevante ahora porque demuestra un patrón de despliegue de modelos MoE de escala frontera en hardware de consumo profesional con memoria unificada, a costa de una pérdida de calidad medible y con kernels de 1-2 bits todavía sin optimizar. El propio autor lo etiqueta como versión de prueba comunitaria: verificado en CPU, no ejecutado aún en un Strix Halo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos enrutados (384 expertos por capa en el modelo completo) y tabla de búsqueda Engram |
| Parametros totales | 657.884.565.104 (~657,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (64K) objetivo en estos builds; contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | IQ1_M (expertos, build E320), IQ2_XXS (expertos, build E277), Q8_0 (atención, router, shared expert, embeddings), IQ4_NL (tabla Engram), MXFP4 (modelo completo de referencia) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF, 4 shards por build (3 de modelo + 1 de Engram) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 384 expertos enrutados por capa, más atención, router, shared expert y embeddings. Sobre ese checkpoint original, esta ficha aplica un proceso de compresión en tres etapas. Primero, un ranking por capa con el criterio REAP (peso del router multiplicado por el tamaño de salida del experto, promediado sobre los tokens que lo activan), medido sobre 131.072 tokens de texto y código mezclados; con ese ranking se generan las listas de expertos conservados, disponibles en el directorio `keep/`. El build de 320 expertos retiene el 97,5 % del peso de enrutado y el de 277 retiene el 94,4 %; 47 expertos no se activaron nunca durante la calibración.

Segundo, los expertos conservados se copian sin modificar desde la cuantización de ISTA-DASLab, que aplica GSQ (Gumbel-Softmax Quantization, arXiv:2604.18556) y RCO (Riemannian Constrained Optimization, arXiv:2605.00649) para bajar a 1-2 bits por peso. El resto de componentes (atención, router con su sesgo recortado a los mismos expertos, shared expert y embeddings) se cuantiza a Q8_0 desde el checkpoint original. Tercero, la tabla Engram se guarda en IQ4_NL (110,6 GB) y el runtime la mantiene en memoria de host, leyéndola de forma perezosa desde el fichero.

No se documentan en esta información los datos de preentrenamiento del modelo base (número de tokens, composición del corpus, si hubo RLHF o DPO). La model card de DeepSeek-V4.1-Flash-1017 en ModelScope lo describe como una actualización menor de DeepSeek-V4.1-Flash con mejoras en razonamiento, código, tareas agénticas y benchmarks visuales, además de reducción del tiempo de ejecución y de la longitud de salida. La plantilla de chat va embebida en el GGUF, adaptada de la release de Unsloth para V4.1.

## Capacidades

- Generación de texto conversacional: el repositorio incluye plantilla de chat embebida y está etiquetado como `conversational` y `text-generation`.
- Razonamiento y código: el modelo base declara mejoras sustanciales en razonamiento, programación y tareas agénticas respecto a DeepSeek-V4.1-Flash.
- Contexto largo: los builds apuntan a 65.536 tokens, suficiente para documentos extensos o repositorios de código medianos en una sola ventana.
- Procesamiento de código y texto técnico: la calibración de expertos y la medición de perplejidad se hicieron sobre mezcla de Wikipedia en inglés y código fuente.
- Soporte de tool calling / function calling: no documentado en este repositorio.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente aquí; el modelo base declara mejoras en tareas agénticas.
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Visión: no disponible en este repositorio; el pipeline declarado es text-generation, aunque la model card del base menciona benchmarks visuales.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente de código en estación de trabajo local: con 64K de contexto y una GPU integrada de 128 GB de memoria unificada, permite indexar y consultar módulos completos sin enviar código propietario a la nube; encaja en equipos con requisitos de confidencialidad.
- Análisis de documentación extensa offline: resúmenes y extracción de datos sobre contratos, informes o manuales de decenas de miles de tokens en entornos sin conectividad, donde el coste de la calidad perdida se compensa con la ausencia de fuga de datos.
- Prototipado de agentes multi-paso: usar el build E320 como sustituto local del modelo completo para validar flujos de razonamiento y de orquestación antes de mover la carga a infraestructura con el modelo nativo.
- Investigación en cuantización de baja precisión: los dos builds (320 y 277 expertos) permiten estudiar empíricamente la relación entre retención de peso de enrutado (97,5 % frente a 94,4 %) y perplejidad (3,40 frente a 3,59) sobre el mismo corpus.
- Laboratorio de pruebas de kernels: el fork ROCmFPX admite los tipos IQ1_M e IQ2_XXS en Vulkan; este repositorio sirve para medir velocidad y consumo antes de que los kernels estén optimizados.
- Generación de borradores y tareas de baja criticidad: clasificación, reescritura o generación de documentación interna donde un aumento de perplejidad de 2,01 a 3,40 es aceptable frente a la alternativa de no disponer de inferencia local.
- Escenarios air-gapped de defensa o industria: inferencia completamente on-device con pesos MIT, sin dependencia de API externa, siempre que se acepte el rendimiento reducido y la naturaleza de prueba del build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta perplejidad, medida sobre 8 fragmentos de 2.048 tokens de texto mixto de Wikipedia en inglés y código fuente, en CPU y con el mismo texto para las tres filas:

| Build | Expertos conservados | Cuantización de expertos | Perplejidad (menor es mejor) | Parte en GPU |
|---|---|---|---|---|
| IQ1_M-E320 (recomendado) | 320 de 384 | GSQ-RCO IQ1_M | 3,40 | 104,5 GB (97,3 GiB) |
| IQ2_XXS-E277 | 277 de 384 | GSQ-RCO IQ2_XXS | 3,59 | 104,2 GB (97,1 GiB) |
| Modelo completo (referencia) | 384 | MXFP4 nativo | 2,01 | 510 GB |

Dato relevante del autor: conservar más expertos a 1,75 bits rinde mejor que conservar menos a 2 bits. No hay cifras de throughput ni de latencia publicadas; el autor advierte que la velocidad inicial será baja porque los kernels de 1-2 bits en Vulkan no están ajustados.

## Requisitos de hardware

- Memoria: máquina con 128 GB de memoria unificada (AMD Ryzen AI Max+ 395, Strix Halo). La GPU debe poder reservar unos 100 GiB; en Windows hay que fijar el mayor tamaño de memoria gráfica en BIOS o AMD Software dejando RAM suficiente al sistema, y en Linux elevar el límite GTT.
- VRAM efectiva: 97,3 GiB para el build E320 y 97,1 GiB para el E277 (atención, router, expertos conservados y embeddings).
- Memoria de host adicional: 110,6 GB para la tabla Engram, que el runtime coloca siempre en memoria de host incluso con `-ngl 99`.
- Almacenamiento: cada build ocupa unos 215 GB en disco y el repositorio completo 319,3 GB (dos builds más el fichero Engram). Se recomienda NVMe rápido por la lectura perezosa de Engram.
- GPU compatibles: el diseño está pensado para Strix Halo (memoria unificada). No se documenta compatibilidad con A100, H100 ni RTX 4090; por tamaño, los builds no caben en GPUs de consumo con 24 GB.
- Despliegue: `llama-server` del fork ROCmFPX, compilado con `-DGGML_VULKAN=ON`; upstream llama.cpp todavía no soporta DeepSeek-V4.1 (el soporte llega vía PR #30817, incluido en el fork). Comando de referencia: `-ngl 99 -c 65536 --jinja`.
- Latencia y throughput: no disponibles. No verificado todavía en hardware Strix Halo según el propio autor.
- Ollama, vLLM o TGI: no documentados para estos ficheros.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos | Contexto | Perplejidad | Memoria necesaria | Licencia |
|---|---|---|---|---|---|---|
| Este repo, build IQ1_M-E320 | ~657,9 B (totales) | 320 de 384 | 65.536 | 3,40 | ~97,3 GiB GPU + 110,6 GB host | MIT |
| Este repo, build IQ2_XXS-E277 | ~657,9 B (totales) | 277 de 384 | 65.536 | 3,59 | ~97,1 GiB GPU + 110,6 GB host | MIT |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | ~657,9 B (totales) | 384 de 384 | no disponible | 2,01 | ~510 GB | MIT |
| DeepSeek-V4.1-Flash-1017 con cuantización estándar mínima | ~657,9 B (totales) | 384 de 384 | no disponible | no disponible | ~230 GB | MIT |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | ~657,9 B (totales) | 384 de 384 | no disponible | no disponible | no disponible | MIT |

No se dispone de datos de benchmarks estándar ni de modelos alternativos de otro fabricante en la información proporcionada que permitan una comparación de rendimiento por tarea.

## Limitaciones y advertencias

- Pérdida de calidad medible: la perplejidad sube de 2,01 (modelo completo) a 3,40 en el build recomendado, un 69 % peor; no es adecuado para tareas donde la precisión sea crítica sin validación adicional.
- Poda de expertos irreversible: se eliminan entre 64 y 107 expertos por capa y se recorta el router; dominios o idiomas poco representados en los 131.072 tokens de calibración (texto y código en inglés) pueden degradarse más de lo que refleja la perplejidad agregada.
- Sesgo de calibración: el corpus de calibración es mayoritariamente inglés y código, por lo que el ranking REAP puede no ser óptimo para castellano u otros idiomas.
- Estado de prueba: el autor indica que el modelo se ha verificado en CPU (carga, respuestas correctas y perplejidad) pero no se ha ejecutado en un Strix Halo real; el rendimiento y el consumo son desconocidos.
- Dependencia de un fork: requiere ROCmFPX (llama.cpp con soporte DeepSeek-V4.1 y ajustes Vulkan); upstream llama.cpp no lo soporta todavía, lo que complica el mantenimiento y la reproducibilidad.
- Kernels sin optimizar: los kernels de 1-2 bits en Vulkan no están ajustados, por lo que la velocidad será baja en la primera iteración.
- Presión de memoria: 97,3 GiB de GPU más 110,6 GB de Engram dejan poco margen en una máquina de 128 GB; cualquier proceso gráfico adicional puede provocar fallos de asignación.
- Dependencia de almacenamiento: la tabla Engram se lee del SSD de forma perezosa; un disco lento degrada directamente la latencia.
- Alucinación: no hay evaluación específica en la información disponible y la cuantización agresiva tiende a incrementar el riesgo.
- Licencia: pesos y cuantización de ISTA-DASLab son MIT, lo que permite uso comercial; no se especifica la licencia del fork ROCmFPX ni de los scripts de este repositorio.
- Idiomas soportados: no declarados, lo que impide garantizar calidad multilingüe en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-StrixHalo-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Fork de runtime ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Página del proyecto y votación de próximas cuantizaciones: https://harshavardhan3002.github.io/ROCmFPX/
- Paper GSQ (Gumbel-Softmax Quantization): https://arxiv.org/abs/2604.18556
- Paper RCO (Riemannian Constrained Optimization): https://arxiv.org/abs/2605.00649
- Pull request de soporte DeepSeek-V4.1 en llama.cpp (#30817): https://github.com/ggml-org/llama.cpp/pull/30817
- Ficha del modelo base en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Guía de terceros sobre la cuantización GSQ-RCO (no verificada): https://www.stratat.com/en/guides/deepseek-v4-1-flash-1017-gsq-rco-gguf
- Listado de terceros del modelo en GGUF (no verificado): https://local-ai-zone.github.io/models/deepseek-v4-1-flash-1017.html
