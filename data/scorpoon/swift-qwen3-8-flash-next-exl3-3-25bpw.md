# scorpoon/Swift-Qwen3.8-Flash-Next-exl3-3.25bpw

## Resumen

Swift-Qwen3.8-Flash-Next-exl3-3.25bpw es una cuantización EXL3 del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario scorpoon. El modelo base es un transformer de tipo Mixture of Experts (MoE) con capacidades multimodales (image-text-to-text), orientado a razonamiento eficiente en tokens, uso agéntico y evaluación en entornos de terminal (terminal-bench). Esta build concreta comprime los pesos a 3,25 bits por peso (bpw) mediante el conversor de ExLlamaV3, lo que reduce drásticamente el espacio en disco y la VRAM necesaria frente al BF16 original.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de gran tamaño con ventana de contexto de 262K tokens en hardware más modesto, manteniendo el torre de visión cuantizada a 6 bits y un draft MTP (multi-token prediction) a 4 bits para decodificación especulativa. El repositorio ocupa 89,1 GB y se distribuye en la rama `3.25bpw_hq_ng5`, con una tabla n-gram de 5 bits incluida.

No se dispone de información sobre el número exacto de parámetros totales ni activos del modelo base en la documentación proporcionada, aunque los tags indican explícitamente arquitectura MoE y la familia Qwen3.8. La licencia es `swift-open-license-1.0` (etiquetada como "other" en HuggingFace) y el acceso está restringido (gated).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con torre de visión |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantización | EXL3 a 3,25 bpw (capas), head a 5,0 bpw, torre de visión a 6 bits, draft MTP a 4 bits, tabla n-gram a 5 bits |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como "other"; gated) |
| Formato de pesos | EXL3 (ExLlamaV3), rama `3.25bpw_hq_ng5` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de la familia Qwen3.8, según los tags del repositorio (`qwen3_8`, `moe`, `Mixture of Experts`, `image-text-to-text`). Incorpora una torre de visión que en esta build se cuantiza a 6 bits, lo que permite mantener capacidades image-text-to-text incluso en la versión comprimida. La ventana de contexto es de 262K tokens.

La cuantización se realizó con el conversor de ExLlamaV3 desde los pesos BF16 del modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next. La build incluye un draft MTP (multi-token prediction) cuantizado a 4 bits para decodificación especulativa, una tabla n-gram de 5 bits ya incluida en el repositorio, y una head a 5,0 bpw. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada; los tags sugieren post-training orientado a eficiencia de tokens (`efficient-thinking`, `token-efficient`, `post-training`) y uso agéntico (`agentic`, `terminal-bench`).

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text).
- Modo de razonamiento eficiente en tokens (`efficient-thinking`, `token-efficient`), pensado para reducir el consumo de tokens en cadenas de pensamiento.
- Capacidades agénticas y de razonamiento multi-paso (`agentic`).
- Evaluación orientada a entornos de terminal (`terminal-bench`), lo que sugiere soporte para tareas de línea de comandos y ejecución de herramientas.
- Decodificación especulativa mediante draft MTP a 4 bits incluido en la build.
- Soporte de contexto largo de 262K tokens.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte explícito de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Agentes de terminal y automatización de shell: el tag `terminal-bench` y la orientación agéntica sugieren uso en tareas de ejecución de comandos, diagnóstico de sistemas y pipelines de automatización donde el modelo interpreta salidas de terminal y decide siguientes pasos.
- Asistencia sobre repositorios de código extensos: con 262K tokens de contexto, el modelo puede ingerir múltiples ficheros y trazas de error en una sola ventana para tareas de revisión y depuración.
- Procesamiento de documentos con imágenes: la pipeline image-text-to-text y la torre de visión a 6 bits permiten extraer información de capturas, diagramas y documentos escaneados junto con texto.
- Razonamiento eficiente en coste: el modo `token-efficient` reduce el número de tokens generados en cadenas de razonamiento, lo que abarata despliegues de inferencia a gran escala frente a modelos que emiten cadenas de pensamiento largas.
- Despliegue en hardware con VRAM limitada: la cuantización a 3,25 bpw permite servir un MoE grande en GPUs de consumo o en nodos con menos memoria que el BF16 original, usando ExLlamaV3 como backend.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir la degradación de un MoE multimodal al pasar de BF16 a 3,25 bpw en tareas de razonamiento y agentes.
- Prototipado de asistentes multimodales con contexto largo en entornos de investigación con recursos restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 89,1 GB, por lo que se necesita al menos ese espacio en disco para descargar la build completa.
- VRAM estimada para inferencia: no disponible de forma explícita; a 3,25 bpw los pesos ocupan aproximadamente 3,25 bits por parámetro de capa, más overhead de head (5 bpw), visión (6 bits), draft MTP (4 bits) y tabla n-gram (5 bits).
- GPU recomendadas: no disponible en la información proporcionada. La build está pensada para ExLlamaV3, que típicamente se ejecuta en GPUs NVIDIA.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; depende del número total de parámetros del MoE, que no se especifica.
- Opciones de despliegue: ExLlamaV3 (librería declarada, `library_name: exllamav3`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están indicadas y probablemente no sean compatibles con el formato EXL3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Qwen3.8-Flash-Next-exl3-3.25bpw (este) | no disponible (MoE) | 262K | EXL3 3,25 bpw | swift-open-license-1.0 (gated) | HuggingFace, 33 descargas |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | no disponible (MoE) | 262K | BF16 | swift-open-license-1.0 | HuggingFace |
| turboderp/Qwen3.8-Flash-Next-exl3 | no disponible | no disponible | EXL3 | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3,25 bpw puede degradar la calidad en tareas sensibles a precisión numérica, como matemáticas o generación de código complejo; no se han publicado evaluaciones de degradación.
- El acceso al modelo está restringido (gated), lo que requiere aceptar condiciones en HuggingFace antes de descargarlo.
- La licencia `swift-open-license-1.0` está etiquetada como "other"; es necesario revisar el texto completo en el enlace del modelo base antes de uso comercial.
- No se dispone de información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación.
- El formato EXL3 limita las opciones de despliegue a ExLlamaV3, lo que reduce la portabilidad frente a GGUF o safetensors.
- El tamaño del repositorio (89,1 GB) y la ventana de 262K implican requisitos de almacenamiento y memoria considerables; no se confirma que quepa en GPUs de consumo.
- No se dispone de información sobre el número de parámetros totales/activos, lo que dificulta estimar con precisión los requisitos de VRAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scorpoon/Swift-Qwen3.8-Flash-Next-exl3-3.25bpw
- Rama de descarga: https://huggingface.co/scorpoon/Swift-Qwen3.8-Flash-Next-exl3-3.25bpw/tree/3.25bpw_hq_ng5
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Build de referencia de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
