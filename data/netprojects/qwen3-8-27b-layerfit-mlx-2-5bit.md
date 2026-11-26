# netprojects/Qwen3.8-27B-LayerFit-MLX-2.5bit

## Resumen

Qwen3.8-27B-LayerFit-MLX-2.5bit es una cuantización de 2,5 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario netprojects (Paris Michalas, NetProjects) en formato MLX para Apple Silicon. El modelo base, desarrollado por el equipo Qwen de Alibaba Cloud, es un transformer denso de aproximadamente 27.800 millones de parámetros con capacidades de imagen-texto a texto (image-text-to-text). Esta versión concreta aplica una técnica propietaria denominada LayerFit, que asigna un número de bits distinto a cada capa del modelo en función de su sensibilidad a la cuantización, en lugar de aplicar una cuantización uniforme.

El problema que resuelve esta ficha es el de ejecutar un modelo de 27B con capacidades de visión y contexto largo en Macs de 16 GB de memoria unificada. El repositorio ocupa 11,5 GB en disco y está pensado para cargarse en máquinas de 16 GB, manteniendo la torre de visión en bf16 y una ventana de contexto de 262K tokens. Incluye además la cabeza de predicción multi-token (MTP) del modelo base, cuantizada a 4 bits, para acelerar la decodificación.

La relevancia de esta publicación es doble: por un lado, demuestra una estrategia de cuantización no uniforme que, según los datos del autor, mejora la fidelidad frente a una cuantización estándar del mismo tamaño; por otro, amplía el acceso a modelos multimodales de gran tamaño en hardware de consumo Apple. Se distribuye con licencia Apache-2.0, la misma del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión + lenguaje), familia Qwen3.5; pesos en formato MLX |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens (según model card) |
| Tipos de cuantizacion | 2,5 bits con asignación por capa (LayerFit); torre de visión en bf16; cabeza MTP a 4 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx, mlx-vlm, mlx-lm) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de la familia Qwen3.5 con capacidad multimodal (entrada de imagen y texto, salida de texto). La model card de esta cuantización no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original y no se reproducen aquí. La arquitectura incluye bloques de atención estándar y bloques de atención lineal, además de una torre de visión y una cabeza de predicción multi-token (MTP) que el modelo base incorpora para decodificación especulativa.

La innovación técnica de esta publicación es LayerFit: un procedimiento de búsqueda que mide la degradación de cada componente (MLP, atención, bloques de atención lineal, embeddings y cabeza de salida de cada capa) a baja precisión y distribuye un presupuesto fijo de bits donde más ayuda. El resultado se documenta en el fichero `layerfit-recipe.json` del repositorio. Según el autor, frente a una cuantización uniforme de 2,5 bits del mismo tamaño, LayerFit eleva la concordancia top-1 con bf16 del 75,9% al 83,4%, reduce la divergencia KL un 52% y mejora GSM8K-50 de 41/50 a 46/50. La torre de visión se mantiene en bf16 para preservar la calidad de entrada de imagen.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y respuesta en texto (pipeline image-text-to-text).
- Razonamiento con modo "thinking" (la evaluación GSM8K-50 se realizó con thinking desactivado, pero el modelo base lo soporta).
- Generación de código, verificado por el autor en 3 de 3 pruebas de coding.
- Llamada a herramientas (tool calling / function calling), con 3 de 3 pruebas superadas según la model card.
- Matemáticas y razonamiento aritmético (GSM8K).
- Contexto largo de hasta 262K tokens.
- Decodificación acelerada mediante la cabeza MTP incluida (51 tok/s frente a 46 tok/s en M5 Max, según el autor).
- Capacidades multilingües: no especificadas en la información disponible.

## Casos de uso

- Asistente local en Mac de 16 GB: el modelo cabe en memoria unificada con un prompt de hasta 8K tokens (pico de 13,7 GB), lo que permite un asistente conversacional privado sin conexión a servicios en la nube.
- Análisis de documentos e imágenes: al conservar la torre de visión en bf16 y un contexto de 262K tokens, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones largas en una sola pasada.
- Generación de código asistida en el editor: el soporte de tool calling y las pruebas de coding superadas lo hacen apto para integrarse en flujos de autocompletado o revisión de código en local.
- Automatización de tareas con agentes: la llamada a funciones verificada permite encadenar pasos (consultar una API, leer un fichero, resumir el resultado) en un pipeline de agente ejecutado íntegramente en el portátil.
- Razonamiento matemático y resolución de problemas: con GSM8K-50 en 44/50 en esta build, es utilizable para tutoría o verificación de cálculos en entornos sin GPU dedicada.
- Procesamiento de corpus largos: la ventana de 262K tokens permite resumir o extraer información de contratos, informes o transcripciones extensas sin trocear el texto.
- Prototipado e investigación en cuantización: el recetario LayerFit publicado permite reproducir y comparar estrategias de asignación de bits por capa sobre el mismo modelo base.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantización (no son benchmarks oficiales del modelo base):

| Prueba | Estándar 2,5 bits | LayerFit 2,5 bits |
|---|---|---|
| Concordancia top-1 con bf16 | 75,9% | 83,4% |
| Divergencia KL | baseline | 52% menor |
| GSM8K-50 (thinking off) | 41/50 | 46/50 |

Métricas de esta build concreta según la model card:

| Métrica | Valor |
|---|---|
| Concordancia top-1 con bf16 (12 prompts) | 90,6% (KL 0,103) |
| GSM8K-50 (thinking off) | 44/50 |
| Tool calls (coding / thinking / imagen) | 3/3, 2/2, pasa |
| Memoria pico con prompt de 8K tokens | 13,7 GB |
| Decodificación en M5 Max | 46 tok/s (51 tok/s con MTP) |

No se han publicado en la información disponible resultados de benchmarks oficiales (MMLU, HumanEval, etc.) para esta cuantización; para los del modelo base debe consultarse la model card de Qwen/Qwen3.8-27B.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 11,5 GB en disco; pico de 13,7 GB con prompt de 8K tokens.
- Equipo objetivo: Mac con 16 GB de memoria unificada (configuración "stretch"); con 24 GB o más hay builds de 3, 4, 6 y 8 bits del mismo autor o de mlx-community/lmstudio-community.
- GPU: exclusivamente Apple Silicon (MLX). No está pensado para GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo: sí, en Macs de 16 GB con margen ajustado; el autor recomienda cerrar aplicaciones y limitar prompts a unos miles de tokens, y sugiere `sudo sysctl iogpu.wired_limit_mb=12800` para ampliar el límite de memoria de la GPU.
- Opciones de despliegue: mlx-vlm (imagen), mlx-lm (texto), LM Studio. No compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: 46 tok/s en M5 Max, 51 tok/s con decodificación MTP (cifras indicativas del autor, máquina no silenciosa).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.8-27B-LayerFit-MLX-2.5bit | 27,8B | 262K | 2,5 bits por capa | Apache-2.0 | Apple Silicon (MLX) |
| Qwen3.8-27B-LayerFit-MLX-2bit | 27,8B | 262K | 2 bits por capa | Apache-2.0 | Apple Silicon (MLX), solo texto |
| Qwen3.8-27B-LayerFit-MLX-4bit | 27,8B | 262K | 4 bits por capa | Apache-2.0 | Apple Silicon (MLX), 32 GB |
| Qwen/Qwen3.8-27B (base) | 27,8B | 262K | bf16 | Apache-2.0 | GPU / servidor |

No se dispone en la información proporcionada de comparativas con modelos de otros fabricantes del mismo tamaño y tarea.

## Limitaciones y advertencias

- La cuantización a 2,5 bits introduce pérdida de fidelidad: la concordancia top-1 con bf16 es del 90,6% en la comprobación de 12 prompts del autor, no del 100%.
- Los resultados de benchmarks y velocidad son mediciones del autor con su propio arnés y hardware; no han sido verificados de forma independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad.
- El uso está restringido a Apple Silicon con MLX; no hay pesos GGUF ni compatibilidad con CUDA.
- En Macs de 16 GB el margen de memoria es estrecho: prompts largos o aplicaciones abiertas pueden provocar swap o fallos de carga.
- Idiomas soportados no documentados en esta ficha; el comportamiento multilingüe debe validarse con el modelo base.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- Sesgos conocidos del modelo base no documentados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero LayerFit es una marca registrada de NetProjects y el autor declara no estar afiliado a Alibaba Cloud ni al equipo Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-2.5bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 2 bits: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-2bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-4bit
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
