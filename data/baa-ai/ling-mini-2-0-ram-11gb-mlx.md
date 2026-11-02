# baa-ai/Ling-mini-2.0-RAM-11GB-MLX

## Resumen

Ling-mini-2.0-RAM-11GB-MLX es una versión cuantizada en precisión mixta del modelo inclusionAI/Ling-mini-2.0, publicada por baa-ai (Black Sheep AI) y optimizada para ejecutarse con MLX en hardware Apple Silicon. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con arquitectura `bailing_moe`, 16.255 millones de parámetros totales y 1.400 millones de parámetros activos por token, lo que permite un equilibrio entre capacidad y coste computacional en inferencia.

La aportación de esta build concreta es su perfil de compresión: 10,8 GB en disco, diseñado como el "punto de rodilla" de RAM, es decir, el menor presupuesto de memoria que el método de sondeo de baa.ai predice antes de que la calidad se degrade de forma apreciable. Según la model card, conserva el 97,0 % del rendimiento en MMLU respecto a la versión BF16 (32,5 GB) y se sitúa a 1,25 puntos de una cuantización uniforme de 4 bits.

Es relevante para desarrolladores que necesitan desplegar un modelo con capacidades de razonamiento y matemáticas en equipos con memoria unificada limitada (por ejemplo, un Mac con 16 GB de RAM), manteniendo la licencia MIT del modelo original y compatibilidad nativa con `mlx-lm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), clase `bailing_moe` (`modeling_bailing_moe_v2.py`) |
| Parametros totales | 16.255.638.528 (16,26 B) |
| Parametros activos | 1,4 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta de 4 bits (método propietario Black Sheep AI, perfil "RAM 11GB"); el modelo base admite BF16 y cuantización uniforme de 4 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 10,8 GB), librería MLX; incluye ficheros de configuración y modelado para transformers |

## Arquitectura y entrenamiento

El modelo base Ling-mini-2.0 emplea una arquitectura de mezcla de expertos con 16,26 mil millones de parámetros totales y 1,4 mil millones activos por token, lo que reduce el coste de cómputo por paso de decodificación frente a un modelo denso del mismo tamaño. La model card de esta versión cuantizada no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron fases de RLHF o DPO; esa información correspondería a la model card del modelo original de inclusionAI, que no se incluye en la información disponible.

La innovación técnica de esta build es el esquema de cuantización de precisión mixta desarrollado por baa.ai (Black Sheep AI), que asigna distintos niveles de precisión a distintas partes del modelo en lugar de aplicar un 4 bits uniforme. El repositorio incluye los ficheros `modeling_bailing_moe_v2.py` y `configuration_bailing_moe_v2.py` para su uso con transformers, y MLX lo carga de forma nativa mediante `mlx-lm`. No se documentan técnicas adicionales como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación de texto conversacional y de propósito general en modo chat (la model card indica que las evaluaciones se ejecutan con la plantilla de chat del modelo).
- Razonamiento matemático: 95 % en GSM8K (100 preguntas) y 90 % en MMLU-Pro math (60 preguntas).
- Razonamiento multi-paso: cadenas de 4 a 6 saltos con respuesta libre (57,9 %) y sumas multi-término con respuesta libre (97,8 %).
- Modo de razonamiento con "thinking": los resultados de multi-hop mejoran sustancialmente cuando se permite cadena de pensamiento (hasta 3072 tokens) frente a respuestas tersas con thinking desactivado.
- Comprensión de documentos en pipelines de recuperación aumentada (RAG): tareas de retrieval y Q&A sobre manuales técnicos.
- Soporte de plantilla de chat y formato conversacional multi-turno.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües explícitas en la información disponible.

## Casos de uso

- Asistente técnico de mantenimiento sobre documentación: el modelo se ha evaluado como lector de una consola RAG sobre el manual de mantenimiento del Dash 8 Q300 (71,8 % de acierto recuperando el documento correcto en el top 3), por lo que encaja en asistentes de consulta de manuales de ingeniería en campo.
- Q&A documental en entornos con recursos limitados: con 10,8 GB y latencias medidas de 1,9 s por pregunta de retrieval y 3,5 s por respuesta completa, es adecuado para consolas de consulta desplegadas en un Mac Studio o portátil Apple Silicon sin GPU dedicada.
- Resolución de problemas matemáticos y verificación de cálculos: con 95 % en GSM8K y 97,8 % en sumas multi-término con respuesta libre, sirve para asistentes de cálculo financiero o de ingeniería que requieran cadena de razonamiento.
- Razonamiento multi-paso en pipelines de análisis: útil en tareas de deducción encadenada (4 a 6 saltos) cuando se permite thinking largo, por ejemplo en diagnóstico de incidencias a partir de logs y documentación.
- Prototipado y evaluación local de modelos MoE: al ser una build MLX de 10,8 GB con licencia MIT, permite a investigadores probar un MoE de 16B en un solo equipo Apple sin infraestructura de servidor.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con `mlx-lm`, los datos no salen del equipo, lo que encaja en casos donde no se puede enviar información a APIs externas.
- Generación de texto conversacional general: con un MMLU del 74 %, es viable como chatbot interno de propósito general en empresas con hardware Apple.

## Benchmarks y rendimiento

Resultados publicados en la model card (MMLU sobre 400 preguntas con plantilla de chat, hasta 2048 tokens):

| Modelo | Tamano | MMLU | MMLU % de BF16 |
|---|---|---|---|
| BF16 | 32,5 GB | 76,25 % | 100 % |
| Uniform 4-bit | 9,2 GB | 75,25 % | 98,7 % |
| RAM 11GB (esta build) | 10,8 GB | 74,00 % | 97,0 % |

Razonamiento:

| Test | Puntuacion |
|---|---|
| GSM8K (100 preguntas) | 95 % |
| MMLU-Pro math (60 preguntas) | 90 % |
| Cadenas multi-hop, 4-6 saltos (126), respuesta libre hasta 3072 tokens | 57,9 % |
| Sumas multi-hop, 4-6 terminos (90), respuesta libre | 97,8 % |
| Cadenas multi-hop, respuesta terse de una palabra, 220 tokens, thinking off | 3,2 % |
| Sumas multi-hop, respuesta terse, 220 tokens, thinking off | 62,2 % |

Documentos (evaluados como lector de una consola RAG):

| Tarea | Puntuacion |
|---|---|
| Retrieval, manual de mantenimiento Dash 8 Q300 (415 preguntas, documento correcto en el top 3) | 71,8 % |
| Q&A, manuales Boeing 787 (150 preguntas, respuesta con el valor esperado) | 26,0 % |

Nota del autor: la diferencia frente a 4 bits uniforme está dentro del ruido (21 preguntas a favor y 16 en contra), y la build uniforme de 4 bits es 1,6 GB más pequeña.

## Requisitos de hardware

- VRAM/RAM estimada: 10,8 GB de pesos; con overhead de MLX y caché KV, se recomienda un mínimo de 16 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (MLX). No está pensado para GPUs NVIDIA/AMD con CUDA o ROCm.
- Cabe en equipos de consumo: Mac con 16 GB o más de memoria unificada (M1/M2/M3/M4 en adelante); cómodo en configuraciones de 24-32 GB.
- Despliegue: `mlx-lm` (carga nativa); también incluye ficheros de modelado y configuración para transformers, aunque la build está optimizada para MLX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia medida por el autor en tareas RAG: mediana de 1,9 s por pregunta de retrieval y 3,5 s por respuesta completa, descrito como el lector más rápido de los seis probados (hasta 90 GB).
- Throughput de generación: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-mini-2.0-RAM-11GB-MLX (esta build) | 16,26 B totales / 1,4 B activos | no disponible | 74,00 % | MIT | HuggingFace, MLX |
| Ling-mini-2.0 BF16 (base) | 16,26 B totales / 1,4 B activos | no disponible | 76,25 % | MIT | HuggingFace |
| Ling-mini-2.0 uniform 4-bit | 16,26 B totales / 1,4 B activos | no disponible | 75,25 % | MIT | HuggingFace |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos de otros autores comparables en la misma categoría (MoE de ~16B con ~1,4B activos), por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- La cuantización introduce una pérdida de calidad medible: 2,25 puntos de MMLU respecto a BF16 y 1,25 puntos respecto a 4 bits uniforme (el autor lo considera dentro del ruido, pero es una degradación real).
- El rendimiento en Q&A documental sobre tablas largas es bajo (26,0 % en los manuales Boeing 787); el autor indica que las búsquedas en tablas largas favorecen a lectores de mayor tamaño.
- El razonamiento multi-hop se degrada drásticamente con respuestas cortas y thinking desactivado (3,2 % en cadenas multi-hop), por lo que requiere configuración de generación adecuada.
- El parser de GSM8K es sensible al formato: el modelo a menudo termina con `#### <número>` o `\boxed{}`, y un parser estricto de `#### 260` baja del 95 % al 53 %.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones específicas de factualidad fuera de las tareas RAG citadas.
- No se dispone de información sobre sesgos, cobertura idiomática ni limitaciones de contexto; deben consultarse en la model card del modelo base.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base inclusionAI/Ling-mini-2.0 y del método de cuantización propietario de baa.ai.
- Dependencia de MLX limita el despliegue a hardware Apple; no hay build para CUDA en esta información.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces

- HuggingFace (esta build): https://huggingface.co/baa-ai/Ling-mini-2.0-RAM-11GB-MLX
- Modelo base: https://huggingface.co/inclusionAI/Ling-mini-2.0
- Web de baa.ai: https://baa.ai
- Producto Ram (compresión): https://baa.ai/compression.html
- Producto Paddock (plano de conocimiento): https://baa.ai/paddock.html
- Producto Watchman (GRC): https://baa.ai/watchman.html
- Producto Shepherd (despliegue): https://baa.ai/shepherd.html
