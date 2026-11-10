# HackingLab/Huihui-Qwen3.8-27B-abliterated-oQ4

## Resumen

Huihui-Qwen3.8-27B-abliterated-oQ4 es una cuantizacion mixta del modelo Huihui-Qwen3.8-27B-abliterated, una variante "abliterated" (con las direcciones de rechazo eliminadas mediante edicion de pesos) de la familia Qwen3.8 de 27B parametros. El checkpoint lo publica el usuario HackingLab en Hugging Face y esta generado con oQ, la herramienta de cuantizacion de precision mixta del proyecto oMLX (v0.7.4.dev1), orientada al runtime MLX de Apple para ejecucion en silicio de Apple.

El modelo es multimodal: la model card desglosa 26.896B parametros en el modelo de lenguaje y 0.461B en la torre de vision, con un total de 27.357B parametros. La cuantizacion no es uniforme: combina bloques afines de 4, 5, 6 y 8 bits con grupo de 64, mas una fraccion en BF16, lo que da una media efectiva de 5.028 bits por peso y un checkpoint de 16.013 GiB en disco (17.194 GB).

Su relevancia practica es acotada pero concreta: permite ejecutar un modelo de ~27B con capacidad de vision en hardware Apple unificado dentro de un presupuesto de memoria de aproximadamente 16-17 GB, algo imposible con los pesos en BF16 (que rondarian los 55 GB). La contrapartida es que se trata de un derivado de terceros, sin model card tecnica propia, sin datos de entrenamiento publicados y sin licencia declarada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + torre de vision), familia Qwen3.8; tag `qwen3_5` en el repo |
| Parametros totales | 27.356.728.560 (27.357B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 4-bit (grupo 64), 5-bit, 6-bit, 8-bit y BF16; media efectiva 5.028 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors cuantizados para MLX (`mlx`, `oq`, `quantized`, `4-bit`) |

Desglose de almacenamiento declarado por el autor:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 26.896B | 16.272 GB / 15.155 GiB |
| Vision | 0.461B | 0.921 GB / 0.858 GiB |
| Total | 27.357B | 17.194 GB / 16.013 GiB |

Distribucion por precision:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, grupo 64 | 19.063B | 69.683% | 9.987 GiB | 4.50 |
| Affine 5-bit, grupo 64 | 6.547B | 23.932% | 4.192 GiB | 5.50 |
| Affine 6-bit, grupo 64 | 1.282B | 4.687% | 0.970 GiB | 6.50 |
| Affine 8-bit, grupo 64 | 0.001B | 0.004% | 0.001 GiB | 8.50 |
| BF16 | 0.463B | 1.694% | 0.863 GiB | 16.00 |
| Total | 27.357B | 100% | 16.013 GiB | 5.028 |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un transformer multimodal con un modelo de lenguaje de 26.896B parametros y una torre de vision de 0.461B, derivado de la familia Qwen3.8 (el repositorio lleva el tag `qwen3_5`). No se publican detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni sobre la estrategia de fusion de las representaciones visuales en el modelo de lenguaje.

Respecto al entrenamiento, la model card no documenta nada: no hay numero de tokens, composicion del dataset, fases de preentrenamiento, SFT, RLHF o DPO. La unica informacion tecnica relevante es el proceso de cuantizacion posterior: oMLX v0.7.4.dev1 aplica precision mixta asignando 4 bits al 69.7% de los pesos, 5 bits al 23.9%, 6 bits al 4.7% y manteniendo en BF16 el 1.7% (0.463B parametros, presumiblemente capas sensibles como embeddings o normas). El sufijo "abliterated" indica que un paso previo elimino las direcciones de activacion asociadas al rechazo, pero no se detalla la metodologia ni el conjunto de datos usado para ello.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.8 de 27B.
- Procesamiento de imagenes: el checkpoint incluye una torre de vision de 0.461B parametros, por lo que se espera soporte de entrada multimodal (la model card no detalla tareas concretas de vision).
- Comportamiento "abliterated": el modelo base fue modificado para reducir los rechazos, lo que en la practica se traduce en menor tendencia a negarse a responder ante peticiones que el modelo original rechazaria.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible; dependeria de las capacidades del Qwen3.8 original.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles; el modelo base Qwen suele ser multilingue, pero este repositorio no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint ocupa 16.013 GiB, por lo que encaja en equipos Apple con 24 GB o 32 GB de memoria unificada (M-series Pro/Max) usando MLX; es el escenario natural dado que el formato es exclusivo de MLX.
- Prototipado de asistentes multimodales en local: la presencia de torre de vision permite experimentar con preguntas sobre imagenes sin enviar datos a APIs externas, util para entornos con requisitos de privacidad.
- Evaluacion de modelos "abliterated" en investigacion de seguridad: util para estudiar como la eliminacion de direcciones de rechazo afecta a la tasa de cumplimiento, la calidad de respuesta y la calibracion en tareas sensibles.
- Generacion de texto asistida en estaciones de trabajo Apple: redaccion, resumen y reescritura de documentos con un modelo de ~27B cuantizado, con latencia aceptable en chips M3/M4 Pro o superiores.
- Fine-tuning ligero o adaptadores sobre el modelo cuantizado: como base para LoRA/QLoRA en MLX, aprovechando que el checkpoint ya esta en formato MLX y reduce el coste de memoria frente al BF16.
- Experimentacion con cuantizacion de precision mixta: util como referencia para comparar la calidad de oQ frente a cuantizaciones uniformes de 4 bits en un modelo de 27B con vision.
- Despliegue de demos offline en portatiles: para talleres, docencia o entornos sin conectividad donde se necesite un modelo multimodal de tamano medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: el checkpoint pesa 16.013 GiB; con overhead de contexto y cache KV, se recomienda un minimo de 20-24 GB de memoria unificada para contextos cortos y 32 GB o mas para contextos largos.
- GPU compatibles: exclusivamente Apple Silicon mediante MLX (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es un formato utilizable directamente en CUDA.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 24 GB o superior (por ejemplo, MacBook Pro M4 Pro 24 GB, Mac Studio M2 Max 32 GB). No cabe en GPUs de consumo con 8-16 GB de VRAM.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX (incluida la herramienta oMLX del autor de la cuantizacion). No es compatible con vLLM, llama.cpp, Ollama ni TGI sin reconversion de formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-oQ4 (este) | 27.357B | no disponible | MLX safetensors, 5.028 bits/peso efectivos | no disponible | Solo Apple Silicon; derivado abliterated; sin benchmarks |
| Qwen3.8-27B (base, si existe publicacion oficial) | ~27B | no disponible | safetensors BF16 | no disponible | Referencia de calidad; pesos completos ~55 GB |
| Cuantizaciones GGUF de 4 bits de modelos de ~27B | ~27B | depende del modelo | GGUF | depende del modelo | Compatibles con llama.cpp/Ollama en CPU y CUDA; no equivalentes en formato a este checkpoint |
| Modelos multimodales de ~7-9B en MLX (p. ej., variantes Qwen-VL pequenas) | ~7-9B | no disponible | MLX | depende del modelo | Menor huella de memoria (~5-6 GB en 4 bits), menor capacidad |

La comparacion cuantitativa con alternativas no es posible porque no hay benchmarks publicados para este checkpoint ni datos de contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base Qwen3.8 antes de cualquier despliegue en produccion.
- Modelo "abliterated": la eliminacion de direcciones de rechazo incrementa el riesgo de generar contenido danino, sesgado o inapropiado; no es apto para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, agravado por la cuantizacion de 4-5 bits en el 93.6% de los pesos.
- Cuantizacion mixta agresiva: la media de 5.028 bits/peso puede degradar tareas sensibles a la precision (matematicas, codigo, razonamiento largo) respecto al modelo en BF16; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Formato exclusivo MLX: no ejecutable en CUDA, ROCm ni CPU convencional sin conversion; limita el despliegue a hardware Apple.
- Sin model card tecnica: no hay informacion sobre contexto maximo, idiomas, datos de entrenamiento ni metodologia de abliteration; dificulta la evaluacion de riesgos y la reproducibilidad.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas se hayan detectado y corregido por la comunidad.
- Fecha de actualizacion reciente (2026-11-10) con re-cuantizacion: versiones anteriores del checkpoint pueden estar en circulacion y diferir en calidad; conviene verificar el hash de los ficheros.

## Enlaces

- Hugging Face: https://huggingface.co/HackingLab/Huihui-Qwen3.8-27B-abliterated-oQ4
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Modelo base Huihui-Qwen3.8-27B-abliterated: no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
