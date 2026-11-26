# 3MPER0RR/Inkling-2-mini-BF16-3MPER0RR-Abliterated

## Resumen

Inkling-2-mini-BF16-3MPER0RR-Abliterated es una conversión de pesos a BF16 con ablación de rechazos (abliteration) del modelo Thinking Machines Inkling-2-Mini, publicada por el usuario 3MPER0RR. El checkpoint original se distribuye en precisiones propietarias (NVFP4, MXFP8 y otros formatos), y esta versión lo reempaqueta en precisión mixta dominante BF16/F32 para hacerlo consumible directamente con la librería transformers sin necesidad de kernels de cuantización de bajo nivel. La ablación se hereda del checkpoint intermedio OpenUncensored/Inkling-2-Mini-Uncensored.

El modelo conserva la arquitectura denominada "Inkling 2 loop" y una configuración de tipo Mixture-of-Experts, con 26.386.412.544 parámetros totales según los safetensors publicados. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada imagen y texto. La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque la model card limita explícitamente el uso previsto a investigación, experimentación e inferencia.

La relevancia de esta ficha es doble: por un lado, documenta una ruta práctica para ejecutar un modelo MoE multimodal cuyos pesos originales no son directamente compatibles con el ecosistema transformers estándar; por otro, advierte de que se trata de un checkpoint derivado, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y sin garantías de fidelidad respecto al modelo base. El tamaño del repositorio (70 GB) refleja la conversión a BF16 de un modelo cuyos pesos originales estaban comprimidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inkling 2 loop, Mixture-of-Experts (MoE) |
| Parametros totales | 26.386.412.544 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en BF16 dominante con tensores F32 (precision mixta); no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), BF16/F32 |
| Pipeline | image-text-to-text |
| Modelo base | thinkingmachines/Inkling-2-Mini |
| Checkpoint intermedio | OpenUncensored/Inkling-2-Mini-Uncensored |
| Tamano del repositorio | 70,0 GB |
| Autoria de la conversion | 3MPER0RR |
| Fecha de publicacion | 2026-11-25 |

## Arquitectura y entrenamiento

La arquitectura declarada es "Inkling 2 loop" con configuración de mezcla de expertos. El término "loop" sugiere un esquema de reutilización de capas o iteración recurrente sobre un bloque compartido, pero la información disponible no detalla el número de capas, la dimensión oculta, el número de expertos ni la estrategia de enrutamiento, por lo que estos datos deben considerarse no disponibles. El pipeline image-text-to-text confirma que el modelo acepta imágenes además de texto, aunque no se especifica el codificador visual ni la resolución de entrada.

Respecto al entrenamiento, no hay información sobre el número de tokens, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento. Lo único documentado es el proceso de conversión: los pesos originales en NVFP4, MXFP8 y otros formatos propietarios se han convertido a un checkpoint de precisión mixta dominante BF16, con algunos tensores en F32. La ablación de rechazos se hereda del checkpoint OpenUncensored, lo que implica una modificación de las direcciones de activación asociadas a comportamientos de negativa; el método concreto de ablación no se describe en la model card.

## Capacidades

- Generación de texto conversacional en formato multi-turno, según la etiqueta "conversational" del repositorio.
- Procesamiento conjunto de imagen y texto (image-text-to-text), lo que habilita tareas de descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre documentos escaneados.
- Razonamiento de múltiples pasos, coherente con la naturaleza MoE y con el modelo base Inkling-2-Mini.
- Generación de código y matemáticas: capacidad esperable por el perfil del modelo base, aunque no se documentan evaluaciones específicas en esta conversión.
- Comportamiento con rechazos atenuados: la ablación reduce las negativas del modelo a peticiones que el checkpoint original rechazaría.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que el checkpoint puede servirse en infraestructura de inferencia estándar.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación sobre ablación y alineamiento: el checkpoint permite comparar el comportamiento del modelo base frente a la versión ablacionada en tareas de rechazo, utilidad y seguridad, usando el mismo pipeline de transformers y pesos en BF16 para aislar el efecto de la modificación.
- Evaluación de fidelidad de conversión de pesos: sirve para medir la degradación introducida al pasar de NVFP4/MXFP8 a BF16 en un MoE multimodal, comparando perplejidad y calidad de generación contra el checkpoint original.
- Procesamiento de documentos con imagen y texto: al aceptar entradas image-text-to-text, puede emplearse para extraer y razonar sobre contenido de capturas, formularios o figuras en un pipeline de análisis documental.
- Prototipado de asistentes conversacionales multimodales: su formato conversacional y su ventana de contexto no documentada lo hacen adecuado para pruebas de concepto en las que se prioriza la disponibilidad de pesos BF16 frente a la optimización de latencia.
- Generación asistida de código en entornos de investigación: integrable en cuadernos y scripts de transformers para experimentar con prompts de programación, sin garantías de rendimiento en producción.
- Estudio de sesgos y contenido no filtrado: al tratarse de una versión ablacionada, es útil en entornos controlados para auditar qué tipos de peticiones deja de rechazar el modelo y con qué calidad responde.
- Servicio en endpoints compatibles: la etiqueta endpoints_compatible permite desplegarlo en infraestructuras de inferencia que acepten checkpoints de transformers en BF16, útil para pruebas internas de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, y el repositorio registra cero descargas y cero likes, por lo que tampoco existen evaluaciones de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los 26.386 millones de parámetros requieren aproximadamente 52,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se necesitan del orden de 60-70 GB, coherente con el tamaño del repositorio de 70 GB.
- GPU recomendadas para BF16 completo: H100 de 80 GB, A100 de 80 GB o dos A100 de 40 GB con paralelismo de tensor.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en BF16 sin técnicas de offload a CPU o memoria unificada. No se publican cuantizaciones GGUF en este repositorio, de modo que el despliegue en consumer GPU requeriría generar cuantizaciones propias a partir de los pesos BF16.
- Opciones de despliegue: transformers con accelerate para reparto entre GPUs; vLLM y TGI son opciones plausibles si aceptan la arquitectura "Inkling 2 loop", algo que no se confirma en la información disponible. Ollama y llama.cpp no son viables sin conversión previa a GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE, el coste por token depende del número de parámetros activos, dato que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-mini-BF16-3MPER0RR-Abliterated | 26,4 B (MoE) | no disponible | Apache 2.0 | safetensors BF16/F32 | Repositorio con 0 descargas |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible en la información | NVFP4/MXFP8 y otros | Modelo upstream oficial |
| OpenUncensored/Inkling-2-Mini-Uncensored | no disponible | no disponible | Apache 2.0 | no disponible | Checkpoint intermedio ablacionado |

La comparación con alternativas de otros fabricantes no puede establecerse con rigor porque no se dispone de datos de benchmarks ni de especificaciones de contexto del modelo base. La única comparación fiable es interna a la propia familia Inkling-2-Mini: el modelo upstream, el checkpoint ablacionado intermedio y esta conversión BF16.

## Limitaciones y advertencias

- Checkpoint derivado sin validación publicada: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones de terceros que confirmen la fidelidad respecto al modelo base.
- La conversión de NVFP4/MXFP8 a BF16 puede introducir diferencias numéricas respecto a los pesos originales; no se documenta ningún estudio de degradación.
- La ablación heredada elimina parte de los rechazos del modelo, lo que incrementa el riesgo de generar contenido dañino, sesgado o inexacto sin advertencia; no es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación no cuantificado: al no haber evaluaciones, no puede estimarse la tasa de respuestas inventadas en tareas factuales o matemáticas.
- Idiomas soportados no documentados: no puede garantizarse un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no disponible: impide planificar casos de uso que dependan de ventanas largas, como análisis de documentos extensos o conversaciones prolongadas.
- Número de parámetros activos no disponible: no puede estimarse el coste real de inferencia de la configuración MoE.
- Aunque la licencia Apache 2.0 permite uso comercial, la model card restringe el uso previsto a investigación, experimentación e inferencia; conviene revisar las condiciones del modelo base y del checkpoint intermedio antes de un despliegue productivo.
- Ausencia de cuantizaciones oficiales: el despliegue en hardware de consumo exige trabajo adicional de conversión y validación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/3MPER0RR/Inkling-2-mini-BF16-3MPER0RR-Abliterated
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint intermedio ablacionado: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Aviso de investigación del autor: https://huggingface.co/3MPER0RR/Inkling-2-mini-BF16-3MPER0RR-Abliterated/blob/main/Disclaimer.md
- Texto de la licencia Apache 2.0: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/apache-2.0.md
