# anguoyang/internvl3.5-2b-qcs6490

## Resumen

InternVL3.5-2B es un modelo de lenguaje y visión (VLM) desarrollado por OpenGVLab, con 2.000 millones de parámetros y publicado bajo licencia Apache 2.0. Este repositorio concreto, `anguoyang/internvl3.5-2b-qcs6490`, no distribuye pesos ni artefactos compilados: es una ficha de medición que documenta el primer intento público de perfilar el modelo sobre el SoC Qualcomm QCS6490 (kit Dragonwing RB3 Gen 2 Vision) mediante Qualcomm AI Hub Workbench.

El interés de la entrada es doble. Por un lado, aporta mediciones reales sobre silicio de grafos parciales del modelo en cuantización w4a16 con contexto de 512 tokens. Por otro, documenta con precisión un fallo de composición (`QnnModel_composeGraphsFromDlc: MODEL_GRAPH_ERROR`) localizado en el asset pre-cuantizado del proveedor (`fp16mix`), que impide medir el grafo 1 de 4 del backbone de texto y el codificador visual.

El resultado es que solo 6 de los 9 grafos pudieron medirse, y el autor evita explícitamente extrapolar un rendimiento end-to-end (tokens por segundo) porque la parte 1 está en la ruta crítica de cada pasada forward. Es, por tanto, material de referencia para quien despliegue VLMs en hardware edge Qualcomm, no un paquete listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (VLM con codificador visual y backbone de texto); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 2B (según el nombre del modelo base, InternVL3.5-2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens en las mediciones publicadas; máximo del modelo base no disponible |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits) en las mediciones; el asset del proveedor se etiqueta como `fp16mix` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No se distribuyen pesos ni artefactos compilados en este repositorio; el modelo base usa safetensors (no confirmado en la informacion proporcionada) |

## Arquitectura y entrenamiento

El repositorio describe un VLM con un backbone de texto dividido en 4 partes (parte 1: capas 0-8; parte 2: capas 9-17; parte 3: capas 18-26; parte 4: capa 27 más `lm_head`) y un codificador visual que procesa imágenes de 448×448 y las proyecta a 256 tokens visuales. Cada parte del backbone se exporta como dos grafos: uno de prompt con atención de rango 128 (`ar128`) y otro de decodificación autorregresiva de 1 token (`ar1`).

No se detallan en la información proporcionada los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). La contribución técnica de esta ficha es el pipeline de despliegue: exportación a ONNX, particionado en 9 grafos, compilación mediante la API manual de AI Hub y perfilado en dispositivo. El autor documenta un defecto concreto: al enlazar los grafos de texto falla con `Tensor '/model/model/layers.2/mlp/down_proj/Conv_bias' has a floating-point type which is not supported by the targeted device`, lo que indica que al menos un sesgo Conv de la capa 2 se distribuyó sin cuantizar en el asset del proveedor. Recompilar con `-O1` en lugar de `-O0` no cambia el resultado, lo que descarta las opciones de compilación como causa.

## Capacidades

- Generación de texto y razonamiento multimodal: al ser un VLM, procesa imágenes y texto de forma conjunta.
- Comprensión visual: el codificador visual convierte imágenes de 448×448 en 256 tokens visuales.
- Despliegue en hardware edge: orientado a ejecución en el SoC Qualcomm QCS6490 mediante QNN y Genie.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de viabilidad de VLMs en hardware edge: usar este repositorio como referencia de método para perfilar un VLM de 2B en un QCS6490 antes de comprometerse con un despliegue, consultando los tiempos por grafo y el bloqueo documentado.
- Inspección visual en dispositivos de bajo consumo: el codificador visual de 448×448 a 256 tokens permite integrar el modelo en kits con cámara (como el RB3 Gen 2 Vision) para tareas de descripción o clasificación de imágenes en el propio dispositivo.
- Reproducción de pipelines de cuantización: el autor documenta el uso de AIMET QuantSim para evaluación local y la verificación sha256 del bundle visual, útil para quien necesite replicar el flujo de exportación y particionado.
- Diagnóstico de fallos en assets pre-cuantizados: los mensajes de error exactos y los job IDs permiten a otros equipos identificar si sufren el mismo defecto de sesgos Conv sin cuantizar en sus propios assets.
- Benchmarking comparativo en la serie qcs-bench: las mediciones siguen el mismo método que las entradas de Qwen3-0.6B y Llama 3.2 1B, lo que permite comparar el coste relativo de un VLM frente a LLM puros en el mismo SoC.
- Planificación de presupuesto de latencia: con los tiempos medidos de las partes 2-4 (174.113 µs por 128 tokens de prompt y 62.815 µs por token de decodificación) se puede dimensionar la latencia esperada de un despliegue, teniendo en cuenta que falta la parte 1.

## Benchmarks y rendimiento

Mediciones por grafo en QCS6490, contexto 512, w4a16, tiempos `estimated_inference_time` de AI Hub:

| Grafo | Prompt (ar128) | Token (ar1) |
|---|---|---|
| Parte 1 de 4 — capas 0-8 | compose FAILED | compose FAILED |
| Parte 2 de 4 — capas 9-17 | 68.980 µs | 20.224 µs |
| Parte 3 de 4 — capas 18-26 | 69.011 µs | 20.300 µs |
| Parte 4 de 4 — capa 27 + lm_head | 36.122 µs | 22.291 µs |
| Codificador visual (448×448 → 256 tokens) | compose FAILED | — |

Subtotal medido de las partes 2-4: 174.113 µs por 128 tokens de prompt y 62.815 µs por token de decodificación. El autor no reclama tokens por segundo del modelo completo porque la parte 1 está en la ruta crítica de cada pasada forward.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- SoC objetivo de las mediciones: Qualcomm QCS6490 (kit Dragonwing RB3 Gen 2 Vision), con aceleración QNN y runtime Genie.
- VRAM estimada: no disponible; el despliegue es sobre hardware edge con memoria unificada, no sobre GPU discreta.
- GPU recomendadas: no aplica para este repositorio; el modelo base de 2B podría ejecutarse en GPUs consumer, pero no hay datos en la información proporcionada.
- Cabe en GPU consumer: no confirmado en la información proporcionada para este formato compilado.
- Opciones de despliegue documentadas: Qualcomm AI Hub Workbench (compilación y perfilado), QNN, Genie. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: partes 2-4 medidas en 174.113 µs por 128 tokens de prompt y 62.815 µs por token de decodificación; latencia end-to-end no disponible por el bloqueo de la parte 1.
- Throughput: no disponible (el autor evita explícitamente estimarlo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto medido | Hardware | Licencia | Estado de medición |
|---|---|---|---|---|---|
| InternVL3.5-2B (esta ficha) | 2B | 512 tokens | QCS6490 | Apache 2.0 | 6 de 9 grafos medidos; bloqueo en parte 1 y codificador visual |
| Qwen3-0.6B | 0,6B | No disponible | QCS6490 | No disponible | Medido en la misma serie qcs-bench |
| Llama 3.2 1B | 1B | No disponible | QCS6490 | No disponible | Medido en la misma serie qcs-bench |

La comparación con otros VLMs de tamaño similar en el mismo hardware no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene pesos ni artefactos compilados; solo publica mediciones, método e identificadores de trabajos. No es directamente desplegable.
- El asset pre-cuantizado del proveedor (`fp16mix`) contiene al menos un sesgo Conv sin cuantizar en la parte 1, lo que provoca el fallo de enlace y de composición. No es un problema de opciones de compilación.
- No se dispone de latencia ni throughput end-to-end del modelo completo; cualquier cifra de tokens por segundo derivada de las partes 2-4 sería una extrapolación no válida.
- Las mediciones usan contexto de 512 tokens, muy por debajo de los contextos habituales en producción; el comportamiento con ventanas mayores no está caracterizado.
- La información sobre sesgos, riesgo de alucinación y rendimiento multilingüe del modelo base no está disponible en la información proporcionada.
- Licencia Apache 2.0 en el modelo base, lo que permite uso comercial; sin embargo, el asset cuantizado del proveedor y sus condiciones de uso no se detallan.
- Para reproducir el flujo se requiere un entorno con versiones fijadas (transformers 5.7.0, torch 2.10.0) y una descarga de 9,39 GB que puede estancarse en el descargador integrado; el autor recomienda usar un descargador reanudable (HTTP Range).
- `aimet-onnx` no tiene wheel para aarch64/CP312; el particionado funciona sin él porque el bundle visual serializado es idéntico byte a byte al del proveedor (verificado por sha256).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anguoyang/internvl3.5-2b-qcs6490
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-2B
- Leaderboard qcs-bench: https://github.com/anguoyang/qcs-bench
- Notas de receta Qualcomm del autor: no disponible como URL directa en la información proporcionada
