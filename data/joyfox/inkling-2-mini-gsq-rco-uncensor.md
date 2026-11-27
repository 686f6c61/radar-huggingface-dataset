# joyfox/Inkling-2-Mini-GSQ-RCO-Uncensor

## Resumen

Inkling-2-Mini-GSQ-RCO-Uncensor es un paquete de inferencia listo para ejecutar que combina tres artefactos publicados por terceros: el modelo cuantizado GSQ-RCO IQ3_S de ISTA-DASLab, un adaptador LoRA de supresión de rechazos de AtomicChat y el proyector visual BF16 original. El modelo base es thinkingmachines/Inkling-2-Mini, un MoE multimodal con bucle (looped multimodal MoE) de 26.070.385.152 parámetros totales, con entrada de texto e imagen y salida de texto. El autor del repositorio, joyfox, no entrena, edita ni recuantiza pesos: se limita a empaquetar una composición en tiempo de ejecución.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de cuantización de muy bajo bit (aproximadamente 3,50 bits por peso, formato IQ3_S) aplicada a un MoE multimodal de 26B, lo que reduce el peso del fichero principal a 11,43 GB. Por otro, ilustra una técnica de modificación de comportamiento (supresión de rechazos mediante un LoRA de rango 1 sobre 49 escritores del flujo residual) que se aplica sin fusionar, lo que permite activar y desactivar el efecto en el servidor.

Es importante subrayar que el LoRA no está fusionado en el GGUF y que GSQ-RCO no se volvió a ejecutar sobre los pesos editados: los resultados de benchmarks publicados corresponden a los artefactos upstream por separado, no a esta combinación exacta. El paquete está pensado para llama.cpp (commit 2a8bf0f o posterior, build b12611 o superior) y se probó en una NVIDIA A100 de 80 GB, con un consumo de aproximadamente 12,5 GiB de VRAM tras la carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inkling 2 looped sparse MoE; entrada de texto e imagen, salida de texto |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo del autor (parametro `-c 32768`) |
| Tipos de cuantizacion | IQ3_S (GSQ-RCO, aproximadamente 3,50 bits por peso); LoRA en GGUF de rango 1; proyector visual en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo principal, LoRA y proyector visual) |

## Arquitectura y entrenamiento

El modelo base es un MoE disperso con arquitectura de bucle (looped), según la model card del paquete. La información disponible no detalla el número de expertos, la proporción de activación ni la composición del dataset de entrenamiento, y tampoco confirma si hubo RLHF, DPO u otras etapas de alineación. Lo que sí se documenta es que el modelo puede razonar a un ajuste bajo de esfuerzo de razonamiento (low reasoning-effort), lo que sugiere la existencia de un modo de pensamiento configurable.

La innovación técnica más destacable del paquete no está en el entrenamiento, sino en la cadena de cuantización y edición. GSQ refina la cuantización escalar de bajo bit y RCO asigna tipos por tensor bajo un presupuesto de tamaño, dando como resultado una asignación IQ3_S publicada tensor a tensor. Sobre esa base, el LoRA de AtomicChat aplica una edición de rango 1 a 49 tensores que escriben en el flujo residual, con 98 tensores en el adaptador que apuntan a esos 49 destinos; todos los destinos existen en el GGUF GSQ-RCO, lo que establece compatibilidad por nombre de tensor. El proyector visual se mantiene en BF16 original y no se ve afectado por la edición. El autor indica explícitamente que no se usó Heretic para este paquete.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla Jinja (`--jinja`).
- Entrada multimodal de imagen con salida de texto (pipeline `image-text-to-text`), mediante el proyector BF16 opcional.
- Razonamiento configurable por esfuerzo, incluyendo un ajuste bajo de razonamiento según la model card del modelo base.
- Composición en tiempo de ejecución de modelo principal más adaptador LoRA, con escala ajustable (1.0 en la configuración de referencia) y posibilidad de desactivar el adaptador con `--lora-adapters`.
- Ejecución en CPU y en GPU dentro de llama.cpp (se verificaron ambas rutas de carga).
- Servidor compatible con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, audio ni idiomas concretos.

## Casos de uso

- Despliegue local de un MoE multimodal de 26B en hardware de una sola GPU: con 11,43 GB de GGUF principal más 641,81 MB de proyector y 43,81 MB de LoRA, el conjunto cabe en una A100 80 GB con un consumo observado de aproximadamente 12,5 GiB, lo que deja margen para contexto largo y lote concurrente.
- Experimentación con cuantización de muy bajo bit: el paquete permite comparar el comportamiento de un IQ3_S GSQ-RCO frente al modelo base en tareas de razonamiento, código y matemáticas, útil para investigar la degradación por cuantización en arquitecturas MoE con bucle.
- Investigación sobre alineación y rechazos: al mantener el LoRA sin fusionar y con escala configurable, se puede medir la tasa de rechazos con el adaptador activo y desactivado sobre el mismo GGUF, aislando el efecto de la edición de rango 1.
- Análisis de imágenes en entornos con recursos acotados: el proyector BF16 permite responder preguntas sobre imágenes (el autor verificó la respuesta "red" ante una imagen sintética con un cuadrado rojo sobre fondo azul) sin necesidad de un segundo modelo visual.
- Servicio de chat autoalojado en CPU: la model card confirma que el modelo principal más el LoRA cargan y generan tokens en CPU, lo que habilita prototipos y pruebas de integración sin GPU.
- Auditoría de procedencia de artefactos: el repositorio incluye SHA256SUMS y referencias a las revisiones exactas de origen, lo que facilita reproducir y verificar la cadena de suministro de pesos en pipelines de CI.
- Evaluación comparativa de adaptadores LoRA en formato GGUF: el parche de 43,81 MB sobre un modelo de 11,43 GB es un caso de estudio de bajo coste para medir el impacto de ediciones mínimas en el comportamiento.

## Benchmarks y rendimiento

Los datos disponibles corresponden a los artefactos upstream por separado y no a esta combinación exacta. Se reproducen tal como los cita el autor del paquete.

| Evaluacion | Resultado | Alcance |
|---|---|---|
| ISTA-DASLab IQ3_S sin modificar, media de tareas en AIME25, GPQA-Diamond y LiveCodeBench v6 con esfuerzo `xhigh` | 99,2 % retenido respecto al modelo base | GGUF upstream, no esta combinación |
| AtomicChat, MMLU (2.000 preguntas) | 80,65 % a 79,15 % tras aplicar el LoRA | Adaptador upstream, no esta combinación |
| AtomicChat, tasa de rechazos | Reducida en sus conjuntos de prueba; no se especifica la cifra | Adaptador upstream |
| AtomicChat, puerta KL de primer token | No superada | Adaptador upstream |

El autor declara explícitamente que no realizó un benchmark de tasa de rechazos ni de calidad para esta composición concreta; las comprobaciones locales se limitan a integridad de hashes, carga en CPU y GPU, la respuesta `OK` a la instrucción `Say exactly OK.` y la respuesta `red` a la imagen sintética.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12,5 GiB tras la carga del modelo principal IQ3_S, el LoRA a escala 1.0 y el proyector BF16, medidos en una A100 80 GB. El cálculo en VRAM depende del contexto y de las capas descargadas a GPU (`-ngl`).
- GPU recomendadas: NVIDIA A100 80 GB es la configuración verificada por el autor. No se documentan pruebas en H100, RTX 4090 ni otras GPU.
- GPU de consumo: no hay datos publicados. Por tamaño de fichero (11,43 GB principales más 0,64 GB de proyector), una GPU de 24 GB podría alojar los pesos, pero el autor no lo ha verificado y la VRAM efectiva depende del contexto y del grafo de cómputo.
- CPU: la carga y generación en CPU están confirmadas por el autor, sin cifras de latencia ni throughput.
- Opciones de despliegue: llama.cpp con `llama-server`, build b12611 o superior y commit 2a8bf0f con soporte de la arquitectura de bucle de Inkling 2. No se documentan vLLM, TGI, Ollama ni otras opciones.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion del paquete | Licencia | Notas |
|---|---|---|---|---|---|
| joyfox/Inkling-2-Mini-GSQ-RCO-Uncensor | 26.070.385.152 | 32.768 tokens en la config de ejemplo | IQ3_S GSQ-RCO + LoRA rango 1 + proyector BF16 | Apache-2.0 | Composición en tiempo de ejecución; LoRA no fusionado |
| ISTA-DASLab/Inkling-2-Mini-GSQ-RCO-GGUF | 26.070.385.152 (mismo base) | no disponible | IQ3_S GSQ-RCO | Apache-2.0 (según modelo base) | Mismo GGUF principal sin el LoRA de supresión de rechazos |
| AtomicChat/Inkling-2-Mini-Uncensored-GGUF | 26.070.385.152 (mismo base) | no disponible | GGUF con LoRA de supresión de rechazos | Apache-2.0 (según modelo base) | Origen del adaptador; reporta caída de MMLU de 80,65 % a 79,15 % |
| thinkingmachines/Inkling-2-Mini | 26.070.385.152 | no disponible | BF16 (modelo base) | Apache-2.0 | Modelo original sin cuantizar ni editar |

No se dispone de datos para comparar con modelos de otras familias de tamaño similar; la información proporcionada solo cubre la cadena Inkling-2-Mini.

## Limitaciones y advertencias

- El LoRA no está fusionado y GSQ-RCO no se recuantizó sobre los pesos editados: no existe en el repositorio un checkpoint uncensored calibrado de forma independiente.
- Los benchmarks citados miden los artefactos upstream por separado; no hay evaluación de calidad ni de tasa de rechazos para esta composición exacta.
- El adaptador de AtomicChat no superó su puerta KL de primer token y redujo MMLU de 80,65 % a 79,15 % en 2.000 preguntas, según su propia model card.
- La supresión de rechazos puede aumentar la probabilidad de respuestas dañinas, inexactas o no alineadas con políticas de uso; requiere revisión y filtros adicionales en producción.
- No se documentan sesgos conocidos, idiomas soportados ni evaluación de alucinación para el modelo base ni para esta combinación.
- El contexto de 32.768 tokens es la configuración de ejemplo del autor, no necesariamente el máximo del modelo; la longitud máxima no está confirmada en la información disponible.
- La licencia Apache-2.0 se hereda del modelo base y de los artefactos de origen, pero el uso comercial de una edición de supresión de rechazos puede entrar en conflicto con términos de servicio de terceros y con obligaciones de moderación; conviene revisar LICENSE y las model cards de origen.
- El soporte depende de una build concreta de llama.cpp (b12611 o superior); versiones anteriores pueden no cargar la arquitectura de bucle de Inkling 2.
- El proyector visual es el original y no se ha recalibrado tras la edición del LoRA; no hay evaluación de la calidad multimodal con el adaptador activo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/joyfox/Inkling-2-Mini-GSQ-RCO-Uncensor
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Inkling-2-Mini-GSQ-RCO-GGUF
- Asignación de tensores IQ3_S: https://huggingface.co/ISTA-DASLab/Inkling-2-Mini-GSQ-RCO-GGUF/blob/main/tensor-allocation/Inkling-2-Mini-GSQ-RCO-IQ3_S.rco-allocation.txt
- LoRA de AtomicChat: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Repositorio GSQ: https://github.com/IST-DASLab/GSQ
- Repositorio RCO: https://github.com/IST-DASLab/RCO
- Commit de llama.cpp probado: https://github.com/ggml-org/llama.cpp/commit/2a8bf0f593472159d8805e9c2a6efb482634db05
- Proyecto Heretic (no usado en este paquete): https://github.com/p-e-w/heretic
