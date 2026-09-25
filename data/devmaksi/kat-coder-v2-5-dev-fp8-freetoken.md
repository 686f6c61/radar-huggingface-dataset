# devmaksi/KAT-Coder-V2.5-Dev-FP8-freetoken

## Resumen

KAT-Coder-V2.5-Dev-FP8-freetoken es una copia cuantizada a FP8 del modelo KAT-Coder-V2.5-Dev, publicada por el usuario devmaksi sobre el post-entrenamiento original de Kwaipilot. Se trata de un modelo de mezcla de expertos (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, construido sobre Qwen3.6-35B-A3B y orientado específicamente a coding agentic: actuar de forma autónoma dentro de repositorios ejecutables en lugar de limitarse a generar código en un único turno.

La aportación diferencial del modelo original no es la escala, sino el marco de post-entrenamiento agéntico (SFT + RL) con entornos reproducibles y recompensas verificables, que según la model card lo sitúa en estado del arte dentro de su rango de parámetros en tareas de Agentic Coding. El RL también corrige comportamientos anómalos medibles: las etiquetas de herramienta inválidas bajan del 9,34 % al 0,28 % (-9 pp) y la repetición continua en un solo turno pasa del 0,34 % al 0 %.

Esta variante concreta aporta dos matices relevantes para quien vaya a desplegarla: los pesos están cuantizados localmente a FP8 y se sirven con FreeToken, y el repositorio contiene únicamente los pesos del modelo de lenguaje, por lo que funciona como modelo solo-texto pese a que el repositorio herede la etiqueta `image-text-to-text` del modelo base. El modelo apenas tiene tracción en HuggingFace (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, derivada de Qwen3.6-35B-A3B (tag de libreria: `qwen3_5_moe`) |
| Parametros totales | 34.660.610.688 (~34,7B), segun safetensors |
| Parametros activos | ~3B por token (nomenclatura A3B del modelo base; la model card cita 3B activados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 en esta variante; el mismo autor publica una variante NVFP4. No se listan GGUF ni otras |
| Idiomas soportados | ingles (en), chino (zh), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`); tamano del repositorio 37,1 GB |
| Modelo base | Qwen3.6-35B-A3B |
| Modelo del que deriva | Kwaipilot/KAT-Coder-V2.5-Dev (post-entrenado) |
| Pipeline declarado | text-generation |
| Fecha de publicacion | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) construida sobre Qwen3.6-35B-A3B: 34,66B parámetros totales con aproximadamente 3B activos por token, lo que desacopla la capacidad del coste de inferencia por token. El modelo resultante se obtiene mediante post-entrenamiento sobre esa base, no mediante entrenamiento desde cero, y el repositorio conserva la librería `transformers` como vía de carga. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni la configuración de expertos (número de expertos, top-k de enrutamiento, dimensión de las capas).

El post-entrenamiento combina SFT y RL. Según la model card y el informe técnico asociado (arXiv:2607.05471), el cuello de botella del coding agentic no es la escala del modelo sino la escasez de entornos reproducibles, recompensas verificables y trayectorias de alto valor, y el marco propuesto ataca precisamente esas tres piezas de forma extremo a extremo. El efecto medible del RL sobre el comportamiento es explícito: reducción de etiquetas de herramienta anómalas del 9,34 % al 0,28 % y eliminación de la repetición continua en un solo turno (0,34 % a 0 %). Esta variante FP8 es una cuantización local de esos pesos, no un reentrenamiento, y el autor no publica métricas de degradación respecto al modelo en precisión completa.

## Capacidades

- Generación de texto conversacional y de código en inglés, chino y ruso.
- Coding agentic: resolución autónoma de tareas dentro de repositorios ejecutables, no solo generación en un turno.
- Uso de herramientas (tool calling / function calling) con etiquetas de herramienta corregidas mediante RL hasta un 0,28 % de formato inválido.
- Razonamiento multi-paso y ejecución de trayectorias largas de agente, con la repetición en un solo turno reducida a 0 % según el autor.
- Resolución de incidencias sobre bases de código reales, con resultados publicados en SWE-bench Verified y SWE-bench Multilingual.
- Soporte multilingüe limitado a en, zh y ru (el benchmark multilingüe de SWE sugiere cobertura de varios lenguajes de programación, pero la lista de idiomas naturales declarada es la anterior).
- Capacidad multimodal: no disponible en esta release. El repositorio incluye solo los pesos del modelo de lenguaje y opera como modelo solo-texto; los componentes de visión no se distribuyen.

## Casos de uso

- Resolución automática de issues en producción: el modelo está entrenado para operar sobre repositorios reales y obtener recompensas verificables, por lo que puede recibir un issue de GitHub, navegar el árbol de ficheros, editar código y proponer un parche evaluable contra la suite de tests del proyecto.
- Refactorizaciones multi-fichero: al mantener contexto de repositorio y encadenar pasos de herramienta, es adecuado para tareas que exigen renombrar APIs, migrar dependencias o cambiar firmas a lo largo de decenas de ficheros con verificación intermedia.
- Agente de CI/CD: integrado en un pipeline, puede analizar la salida de tests fallidos, localizar la causa, aplicar un parche y volver a lanzar la suite; el soporte de tool calling y la baja tasa de etiquetas inválidas reducen los fallos de integración.
- Asistente de código multi-turno en IDE: con idiomas en/zh/ru y formato conversacional, encaja en asistentes que mantienen historial de conversación y alternan explicación y edición de código.
- Migración y modernización de bases de código heredadas: combinando lectura de repositorio y edición por pasos, sirve para actualizar versiones de lenguaje o framework con verificación continua.
- Revisión de código asistida: puede ejecutar análisis estático, leer el diff y generar comentarios accionables, integrándose como paso previo a la revisión humana.
- Automatización de tareas de mantenimiento repetitivas (actualización de dependencias, corrección de linters, generación de tests de regresión) mediante agentes que ejecutan comandos y comprueban resultados.
- Despliegue en entornos con aceleradores FP8: al publicarse en FP8, es una opción natural para servir en GPUs Hopper o Ada con soporte nativo de esa precisión, reduciendo el coste por token frente a BF16.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes de resolución). Solo se dispone de las dos primeras filas completas; el resto de la tabla quedó truncado en la información disponible.

| Benchmark | KAT-Coder-V2.5-Dev | Qwen3.5-27B | Qwen3.6-35BA3B | Gemma4-31B | Qwen3.5-35BA3B | Ornith-1.0-35B | Gemma4-26BA4B | Qwen3-Coder-30B |
|---|---|---|---|---|---|---|---|---|
| SWE-bench Verified | 69,40 | 68,60 | 64,40 | 60,60 | 58,60 | 55,80 | 35,80 | 31,80 |
| SWE-bench Multilingual | 63,00 | 57,67 | 57,00 | 49,33 | 47,67 | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras categorias, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: en torno a 35 GB solo para pesos (34,66B parametros a 1 byte) mas overhead de cache KV y activaciones, lo que situa el minimo practico cerca de 40 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para una sola tarjeta con margen; A100 40 GB queda muy ajustada y depende de la longitud de contexto y del tamano de lote.
- Consumer GPU: no cabe en una RTX 4090 (24 GB) en FP8 sin offload a memoria del sistema. La variante NVFP4 del mismo autor (aproximadamente 4 bits) reduce los pesos a unos 18-20 GB y si seria desplegable en RTX 4090, L40S o RTX 5090 (32 GB), aunque el autor no publica cifras verificadas de VRAM.
- Multi-GPU: dos RTX 4090 o dos RTX 3090 con tensor parallelism pueden cubrir el modelo FP8, a costa de throughput por tarjeta.
- Opciones de despliegue: `transformers` (libreria declarada), vLLM y SGLang para FP8, TGI como alternativa. El repositorio esta marcado como `endpoints_compatible` y la variante se sirve con FreeToken. No se distribuyen pesos GGUF, por lo que llama.cpp y Ollama requeririan convertir el modelo a ese formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Con 3B parametros activos por token, el coste por token es notablemente inferior al de un denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | SWE-bench Multilingual | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev-FP8 (esta ficha) | 34,7B totales / ~3B activos | no disponible | 69,40 | 63,00 | Apache 2.0 | Pesos abiertos FP8 en HF |
| Qwen3.5-27B | 27B densos | no disponible | 68,60 | 57,67 | no disponible | no disponible |
| Qwen3.6-35BA3B (modelo base) | 35B totales / 3B activos | no disponible | 64,40 | 57,00 | no disponible | no disponible |
| Qwen3-Coder-30B | 30B | no disponible | 31,80 | no disponible | no disponible | no disponible |

Frente a Qwen3.5-27B, el modelo gana 0,8 puntos en SWE-bench Verified y 5,33 en SWE-bench Multilingual, con un coste por token potencialmente menor gracias al enrutamiento MoE de 3B activos. Frente a su propio modelo base Qwen3.6-35BA3B, la mejora atribuible al post-entrenamiento agéntico es de 5,0 y 6,0 puntos respectivamente. Los datos de licencia y contexto de los modelos comparados no están disponibles en la información consultada.

## Limitaciones y advertencias

- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Es una cuantizacion FP8 realizada por un tercero (`devmaksi`), no una publicacion oficial de Kwaipilot; no se publican metricas de degradacion respecto a los pesos originales.
- Discrepancia de etiquetado: el repositorio incluye la etiqueta `image-text-to-text` y el tag `qwen3_5_moe`, pero la propia model card aclara que solo se distribuyen los pesos del modelo de lenguaje y que las componentes de vision no estan incluidas ni disponibles. No debe asumirse capacidad multimodal.
- Idiomas naturales limitados a ingles, chino y ruso; no hay soporte declarado de castellano, lo que puede degradar el rendimiento en prompts y documentacion en espanol.
- Longitud de contexto no disponible: sin ese dato no es posible dimensionar el consumo de cache KV ni validar casos de uso con repositorios grandes.
- Riesgo de alucinacion inherente a los modelos de codigo: puede inventar APIs, ficheros o resultados de tests. La verificacion mediante ejecucion real de tests sigue siendo imprescindible en produccion.
- El modelo esta especializado en coding agentic; su rendimiento en tareas generales de conocimiento, matematicas o redaccion no esta documentado y probablemente sea inferior al de modelos generalistas del mismo tamano.
- Sesgos: no se han publicado analisis de sesgo en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el texto integro de la licencia del repositorio debe verificarse antes de desplegar, junto con las condiciones del modelo base Qwen3.6-35B-A3B y del post-entrenamiento de Kwaipilot.
- La dependencia del ecosistema `transformers`/FP8 implica que el despliegue optimizado requiere kernels y versiones concretas; no hay pesos GGUF para entornos de CPU o Apple Silicon.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devmaksi/KAT-Coder-V2.5-Dev-FP8-freetoken
- Variante NVFP4 del mismo autor: https://huggingface.co/devmaksi/KAT-Coder-V2.5-Dev-NVFP4-freetoken
- Perfil del autor: https://huggingface.co/devmaksi
- Modelo original de Kwaipilot: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.05471
- Ficha en Friendli AI: https://friendli.ai/models/devmaksi/KAT-Coder-V2.5-Dev-NVFP4-freetoken
- Analisis en HackerNoon: https://hackernoon.com/kat-coder-v25-dev-an-open-agentic-coding-model
