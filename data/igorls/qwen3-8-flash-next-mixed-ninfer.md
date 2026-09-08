# igorls/Qwen3.8-Flash-Next-mixed-NInfer

## Resumen

`igorls/Qwen3.8-Flash-Next-mixed-NInfer` es un artefacto de inferencia en formato nativo `.ninfer` que distribuye el modelo multimodal Qwen3.8-Flash-Next de Qwen, con pesos de cómputo en precisión mixta NVFP4/FP8 y una tabla de embeddings PLE en INT4. Ha sido desarrollado por el usuario `igorls` para el motor NInfer, una bifurcación destinada a estaciones de trabajo Windows con GPUs Blackwell (RTX PRO 6000). Se trata de una conversión de formato y un empalme de fuentes sin reentrenamiento: combina las cuantizaciones de Primitive AI con los pesos originales de Qwen, preservando los 512 expertos enrutados por capa.

El modelo base es un mixture of experts multimodal (imagen-texto a texto) de 125B parámetros principales, complementado con 51B en embeddings de n-gramas y 6B parámetros activos por token. Según la documentación de Qwen, comparado con Qwen3.7-Plus reduce el coste de entrenamiento e inferencia a aproximadamente una novena parte, manteniendo capacidades superiores en tareas de código y ofimática. La ventana de contexto configurada en el perfil de ejemplo alcanza 32768 tokens por petición, con una capacidad KV compartida de 65536.

La relevancia de este artefacto radica en su soporte para decodificación especulativa (MTP), visión y multimodalidad en una sola GPU de 96 GB, pensado para estaciones de trabajo prosumer de alto rendimiento. Al ser un early-access preview, su distribución queda limitada al motor NInfer y no puede cargarse con Transformers, vLLM, llama.cpp ni Ollama.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of experts multimodal (transformador con 512 expertos enrutados por capa, estado recurrente, decodificación especulativa; basado en Qwen3.8-Flash-Next) |
| Parámetros totales | 125B principales + 51B en embeddings de n-gramas (≈176B según documentación del modelo base) |
| Parámetros activos | 6B por token |
| Longitud de contexto | 32768 tokens por petición en el perfil de ejemplo; valor nativo no especificado |
| Tipos de cuantización | Mixta: NVFP4 para bancos de expertos, FP8 E4M3 para proyecciones QSA/GDN, INT4 para tabla PLE, BF16 para otros pesos; MTP convertido a NVFP4 en ejecución |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (tipo: other) |
| Formato de pesos | .ninfer (contenedor NInfer v2) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un mixture of experts multimodal con 125B parámetros principales, complementado con un componente de embeddings de n-gramas de 51B y 6B parámetros activos por token. La documentación indica que utiliza 512 expertos enrutados por capa, todos ellos preservados en este artefacto. El motor NInfer gestiona además estado recurrente, visión y predicción multitoken (MTP) para decodificación especulativa. En el runtime, los bancos de expertos MTP se almacenan en BF16 y se convierten a NVFP4 durante la ejecución mediante un cuantizador de solo pesos, sin datos de calibración.

En cuanto al entrenamiento, la información disponible no detalla la composición del dataset ni procesos de alineación como RLHF o DPO. El artefacto de igorls no ha sido reentrenado: es una conversión de formato y un empalme de fuentes entre los pesos de Primitive AI (NVFP4/FP8) y la tabla PLE INT4, tal como se indica en la model card. Comparado con Qwen3.7-Plus, el modelo base reduce el coste de entrenamiento a aproximadamente una novena parte, según la documentación de Qwen.

## Capacidades

- Generación multimodal: acepta entradas de imagen y texto para generar texto (pipeline image-text-to-text).
- Decodificación especulativa: soporta MTP (multi-token prediction) con hasta 4 tokens candidatos mediante la opción `--draft-tokens 4`.
- Modo de razonamiento: incluye la opción `--preserve-thinking` para conservar el contenido de pensamiento del modelo.
- Tareas de código y ofimática: la documentación del modelo base destaca capacidades superiores en coding y office tasks frente a Qwen3.7-Plus.
- Visión: los pesos de visión están incluidos en el artefacto, almacenados en BF16.
- Multilingüismo: no especificado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no hay evidencia; la opción `--preserve-thinking` sugiere cadena de pensamiento, pero no se confirma.

## Casos de uso

- Asistente multimodal de documentos: análisis de capturas, PDF escaneados y diagramas en una estación de trabajo local, gracias a la entrada imagen-texto y a la ventana de contexto de 32768 tokens.
- Generación y revisión de código: el modelo base está optimizado para tareas de código; permite completar y revisar repositorios medianos en un solo GPU, aprovechando el contexto largo y la decodificación especulativa.
- Automatización ofimática: redacción de informes, análisis de hojas de cálculo y correo electrónico con razonamiento preservado, apoyándose en la capacidad documentada de "office tasks".
- Prototipado de cuantización mixta: evaluación de la mezcla NVFP4/FP8/INT4 con tabla PLE en una GPU Blackwell de 96 GB, sin necesidad de infraestructura multi-GPU.
- Servicio de inferencia local de baja latencia: despliegue con `ninfer-serve` en Windows, usando MTP y draft tokens para acelerar la generación en aplicaciones interactivas.
- Investigación en arquitecturas MoE multimodales: análisis del comportamiento de los 512 expertos preservados y del componente PLE para estudios de análisis de expertos y eficiencia de inferencia.
- Aplicaciones de visión-lenguaje en entornos industriales: detección y descripción de defectos en imágenes, con salida de texto en lenguaje natural a partir de capturas de cámaras o líneas de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única referencia cualitativa es que, según la documentación de Qwen, el modelo base supera a Qwen3.7-Plus en tareas de código y ofimática, pero no se aportan cifras concretas.

## Requisitos de hardware

- VRAM estimada: 96 GB (RTX PRO 6000 Blackwell Workstation Edition). El payload de tensores en dispositivo alcanza 71.02 GiB con Visión y MTP habilitados, antes de buffers, workspaces, CUDA graphs, estado recurrente y caché KV. La tabla PLE ocupa 29.80 GiB en datos mapeados desde host a RAM.
- GPU recomendada: RTX PRO 6000 Blackwell (sm_120a). El motor compila exclusivamente para `sm_120a` y no se ha calificado en otros modelos.
- RAM del sistema: la estación de desarrollo usa 125.64 GiB visibles en Windows; se requiere un SSD con más de 114 GB libres solo para el artefacto y metadatos.
- ¿Cabe en GPU de consumo? No, no se ha probado y el tamaño supera la VRAM disponible en GPUs de consumo actuales (por ejemplo, RTX 5090 de 32 GB).
- Opciones de despliegue: exclusivamente NInfer fork (https://github.com/igorls/ninfer) compilado desde código fuente en Visual Studio 2026 y CUDA 13.3. No compatible con vLLM, llama.cpp, Ollama ni Transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| igorls/Qwen3.8-Flash-Next-mixed-NInfer | 125B + 51B n-gram | 6B | 32768 configurado | qwen-community-1.0 | Solo NInfer, Windows, Blackwell |
| Qwen3.8-Flash-Next base | 125B + 51B n-gram | 6B | no disponible | no disponible | Múltiples frameworks |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Múltiples frameworks |

No se dispone de especificaciones detalladas de Qwen3.7-Plus en la información proporcionada; la comparación se limita a la afirmación cualitativa del modelo base.

## Limitaciones y advertencias

- Solo es ejecutable en el motor NInfer (fork de igorls) en Windows con GPU Blackwell sm_120a; no puede cargarse en frameworks estándar.
- No existe integración de inferencia en HuggingFace.
- Es un early-access engineering preview; no se garantiza estabilidad ni soporte a largo plazo.
- Requiere 96 GB de VRAM y 128 GB de RAM del sistema; no está calificado en hardware inferior.
- El uso de la tabla PLE en mapeo de host puede provocar mayor latencia si el sistema recupera memoria; el runtime recalienta las páginas al inicio.
- No se han publicado benchmarks, por lo que no se puede evaluar objetivamente el rendimiento ni comparar con otros modelos.
- Los idiomas soportados no están especificados.
- La licencia qwen-community-1.0 es una licencia "other": debe revisarse el archivo LICENSE antes de cualquier uso comercial.
- Riesgo de alucinación no evaluado; la información sobre capacidades y limitaciones de sesgo no está disponible.

## Enlaces

- HuggingFace: https://huggingface.co/igorls/Qwen3.8-Flash-Next-mixed-NInfer
- Repositorio del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Motor NInfer (fork): https://github.com/igorls/ninfer
- Revisión del motor utilizada: https://github.com/igorls/ninfer/tree/c81c88f6d66652be4607fb775333a6c63132f3f5
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización NVFP4/FP8 de Primitive AI: https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-mixed-NVFP4-FP8
- Cuantización PLE INT4 de Primitive AI: https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-PLE-quant
