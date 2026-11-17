# qda-lab/QDA-Qwen3.8-27B-W4A4

## Resumen

QDA-Qwen3.8-27B-W4A4 es una cuantización NVFP4 del modelo multimodal Qwen/Qwen3.8-27B, publicada por qda-lab. El checkpoint reduce el peso de los pesos de 55,6 GB en BF16 a 21,9 GB, es decir, un factor de 2,5×, manteniendo según el autor el 99,4 % de la precisión del modelo base. Está pensado específicamente para GPUs de centro de datos con arquitectura NVIDIA Blackwell (B200, B300, GB200, GB300), donde el formato FP4 tiene soporte nativo por hardware.

El modelo base es un transformer multimodal de tipo image-text-to-text, con 18.553.959.152 parámetros reales según los safetensors publicados (la denominación "27B" del nombre comercial no coincide con el recuento de parámetros del checkpoint). El pipeline declarado es image-text-to-text, por lo que admite entradas de imagen y texto, y el modelo emplea un modo de razonamiento explícito ("thinking mode") con marcador de cierre `</think>`.

La relevancia de esta ficha es doble: por un lado, demuestra que la cuantización agresiva W4A4 (4 bits en pesos y 4 bits en activaciones) es viable en producción sobre Blackwell con pérdida de precisión marginal; por otro lado, el propio autor documenta de forma honesta que su checkpoint queda 1,2 puntos por debajo del NVFP4 de NVIDIA en la media de seis benchmarks, aunque el análisis ampliado sobre 153 problemas de matemáticas no permite distinguir estadísticamente ambos checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia Qwen3.8, tag `qwen3_5` en Hugging Face |
| Parametros totales | 18.553.959.152 (recuento real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens en la evaluación del autor (ventana servida); el suite `qda eval` usa 114.688 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4): pesos E2M1, escalas E4M3, algunas capas en FP8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un modelo entrenado desde cero. El autor indica que las capas MLP se cuantizan en NVFP4 con pesos en formato E2M1 y escalas en E4M3, y que algunas capas se mantienen en FP8. El resultado se empaqueta con la librería `compressed-tensors` y se sirve con vLLM. No se detalla en la información disponible la composición del dataset de calibración, el número de tokens usados para calibrar las escalas ni si se aplicó algún ajuste posterior a la cuantización.

Del modelo base Qwen3.8-27B no se proporcionan detalles de entrenamiento (número de tokens, mezcla de datos, uso de RLHF o DPO) más allá de que soporta modo de razonamiento con `reasoning_effort` configurable (bajo, medio, etc.) y plantilla de chat con marcador `</think>`. La innovación técnica destacable de esta ficha es la propia cuantización W4A4 con soporte de hardware FP4 en Blackwell, que permite servir un modelo de este tamaño en 21,9 GB de pesos.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" explícito, controlable mediante el parámetro `reasoning_effort` en la plantilla de chat.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que habilita tareas de comprensión visual combinadas con razonamiento textual.
- Razonamiento matemático de competición: evaluado en AIME 2025, HMMT Feb 2026, AIME 2026, HMMT Nov 2025 y HMMT Feb 2025.
- Razonamiento científico de nivel experto: evaluado en GPQA-Diamond.
- Generación de código: evaluado en LiveCodeBench, con capacidad para problemas de programación competitiva.
- Seguimiento de instrucciones complejas: evaluado en IFBench.
- Conocimiento general y académico: evaluado en MMLU-Pro.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible explícitamente, aunque el modo thinking y el contexto largo son compatibles con flujos agénticos.

## Casos de uso

- Razonamiento matemático asistido en entornos de investigación: el modelo resuelve problemas de competición (AIME, HMMT) con precisión cercana al BF16 (87,1 frente a 88,4 en AIME 2025), por lo que puede usarse como solver de referencia en pipelines de verificación de problemas o generación de soluciones paso a paso.
- Análisis de documentos científicos con componente visual: al ser image-text-to-text, permite extraer y razonar sobre figuras, tablas y ecuaciones en PDFs o capturas, combinando la entrada de imagen con el modo thinking para explicar el razonamiento.
- Generación de código en producción: con 85,2 puntos en LiveCodeBench, es adecuado para autocompletado, revisión de parches y generación de tests en pipelines de CI/CD, siempre que el despliegue se haga sobre GPUs Blackwell con vLLM.
- Evaluación automática de calidad de instrucciones: su rendimiento en IFBench (68,0) lo hace útil como juez o generador de instrucciones complejas en sistemas de evaluación de asistentes.
- Despliegue en clústeres con VRAM limitada: al ocupar 21,9 GB en lugar de 55,6 GB en BF16, permite servir el modelo en una sola GPU Blackwell de gama alta (B200/B300/GB200/GB300) donde el BF16 no cabría con contexto largo.
- Investigación en cuantización: sirve como referencia reproducible para comparar estrategias NVFP4 (NVIDIA, RedHatAI, unsloth, qda-lab) bajo el mismo harness de evaluación, con semillas y límites de tokens documentados.
- Asistencia en dominios STEM con contexto largo: la ventana de 262.144 tokens permite cargar libros de texto, repositorios de código o transcripciones extensas y razonar sobre ellos en una sola pasada.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con vLLM 0.33.0 sobre una GB300, thinking mode activo, pass@1 promediado sobre los draws indicados. Todos los valores en porcentaje.

| Benchmark | Problemas × draws | BF16 (55,6 GB) | QDA W4A4 (21,9 GB) | NVIDIA NVFP4 (21,9 GB) | RedHatAI NVFP4 (24,7 GB) | unsloth NVFP4 (23,4 GB) |
|---|---:|---:|---:|---:|---:|---:|
| AIME 2025 | 30 × 32 | 88,4 ± 4,1 | 87,1 ± 3,7 | **91,1 ± 3,1** | 87,1 ± 4,4 | 88,9 ± 3,5 |
| HMMT Feb 2026 | 33 × 32 | 72,6 ± 5,5 | 73,4 ± 5,5 | 74,9 ± 5,0 | **76,8 ± 5,0** | 72,5 ± 5,6 |
| GPQA-Diamond | 198 × 16 | 82,4 ± 2,1 | 80,8 ± 2,2 | 81,1 ± 2,2 | 80,2 ± 2,3 | **81,7 ± 2,2** |
| IFBench | 300 × 16 | 67,0 ± 2,1 | 68,0 ± 2,1 | 68,6 ± 2,1 | 67,6 ± 2,1 | **68,7 ± 2,1** |
| MMLU-Pro | 12.032 × 1 | 83,6 ± 0,3 | 83,1 ± 0,3 | **83,4 ± 0,3** | 83,2 ± 0,3 | 83,2 ± 0,3 |
| LiveCodeBench | 454 × 4 | 86,7 ± 1,4 | 85,2 ± 1,4 | 85,8 ± 1,4 | **87,3 ± 1,4** | 85,5 ± 1,4 |
| **Media** | | 80,1 ± 1,3 | 79,6 ± 1,2 | **80,8 ± 1,1** | 80,4 ± 1,2 | 80,1 ± 1,2 |

Análisis ampliado sobre matemáticas (153 problemas, mismos ajustes):

| Conjunto | BF16 | QDA W4A4 | NVIDIA NVFP4 |
|---|---:|---:|---:|
| AIME 2025 | 88,4 | 87,1 | 91,1 |
| HMMT Feb 2026 | 72,6 | 73,4 | 74,9 |
| AIME 2026 | 87,9 | 89,2 | 89,3 |
| HMMT Nov 2025 | 79,2 | 79,9 | 77,9 |
| HMMT Feb 2025 | 78,0 | 82,7 | 80,9 |
| **Todos (153 problemas)** | 81,1 | 82,3 | 82,7 |

El autor indica que la diferencia NVIDIA − QDA sobre los 153 problemas es de +0,4 puntos, con intervalo de confianza del 95 % emparejado de −1,2 a +2,1, por lo que no es estadísticamente distinguible. También advierte que un segundo conjunto de semillas movió la puntuación de un checkpoint hasta 2,7 puntos en un conjunto de 30 problemas.

## Requisitos de hardware

- VRAM estimada para inferencia: 21,9 GB solo de pesos; con contexto de 262.144 tokens y caché KV en BF16/FP8, la VRAM real necesaria es sustancialmente mayor y no se detalla en la información disponible.
- GPU soportadas: NVIDIA Blackwell de centro de datos (B200, B300, GB200, GB300). El formato NVFP4 requiere soporte de hardware FP4, por lo que no funciona en Ampere, Ada ni Hopper.
- GPU de consumo: no cabe en GPUs consumer convencionales por la falta de soporte FP4 nativo; no se documenta compatibilidad con RTX 50xx ni con GPUs sin FP4.
- Motor de despliegue: vLLM 0.33.0, con `vllm serve qda-lab/QDA-Qwen3.8-27B-W4A4`. El formato `compressed-tensors` es compatible con vLLM; no se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Tasa de truncamiento documentada: 2,8 % de media (frente a 2,0 % en BF16), con máximos del 7,2 % en LiveCodeBench y 3,4 % en GPQA-Diamond.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño en disco | Contexto | Media 6 benchmarks | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| QDA-Qwen3.8-27B-W4A4 | 18,55 B | 21,9 GB | 262.144 | 79,6 | apache-2.0 | Hugging Face (qda-lab) |
| NVIDIA NVFP4 (Qwen3.8-27B) | no disponible | 21,9 GB | no disponible | 80,8 | no disponible | Hugging Face (NVIDIA) |
| RedHatAI NVFP4 (Qwen3.8-27B) | no disponible | 24,7 GB | no disponible | 80,4 | no disponible | Hugging Face (RedHatAI) |
| unsloth NVFP4 (Qwen3.8-27B) | no disponible | 23,4 GB | no disponible | 80,1 | no disponible | Hugging Face (unsloth) |
| Qwen3.8-27B BF16 (base) | 18,55 B | 55,6 GB | 262.144 | 80,1 | apache-2.0 | Hugging Face (Qwen) |

Los cuatro checkpoints NVFP4 son cuantizaciones del mismo modelo base, por lo que la comparación relevante es de estrategia de cuantización, no de arquitectura. El checkpoint de NVIDIA obtiene la mejor media (80,8) al mismo tamaño que QDA (21,9 GB); RedHatAI y unsloth quedan en un rango intermedio. QDA es el más pequeño de los cuatro publicados y el que más se aleja de la media de NVIDIA (1,2 puntos), aunque la diferencia en matemáticas no es significativa con 153 problemas.

## Limitaciones y advertencias

- Precisión inferior al BF16 en la media de seis benchmarks: 79,6 frente a 80,1, una caída de 0,5 puntos.
- El propio autor reconoce que su checkpoint es el de menor media de los cuatro NVFP4 comparados, 1,2 puntos por debajo de NVIDIA al mismo tamaño.
- Mayor tasa de truncamiento que BF16 (2,8 % frente a 2,0 % de media), con hasta un 7,2 % en LiveCodeBench, lo que puede afectar a tareas de código con generaciones largas.
- Dependencia de hardware: requiere GPUs NVIDIA Blackwell con soporte FP4 nativo; no es desplegable en Ampere, Ada, Hopper ni en GPUs de consumo sin FP4.
- Dependencia de software: solo se documenta vLLM 0.33.0; no hay soporte confirmado en llama.cpp, Ollama ni TGI.
- Idiomas soportados no documentados: no se puede garantizar el comportamiento multilingüe sin evaluación propia.
- Riesgo de alucinación: no evaluado en la información proporcionada; los benchmarks publicados miden exactitud, no calibración ni tasa de alucinación.
- Sesgos: no documentados en la información proporcionada.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.8-27B por si impone condiciones adicionales.
- El nombre comercial "27B" no coincide con los 18,55 mil millones de parámetros reales del checkpoint; conviene usar el recuento de safetensors para planificar VRAM.
- Solo 2 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido, sin reportes independientes de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-W4A4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Motor vLLM: https://github.com/vllm-project/vllm
- Documentación de vLLM sobre cuantización: https://docs.vllm.ai/en/latest/features/quantization/index.html
- Paper de NVFP4 (formato FP4 de NVIDIA): no disponible en la información proporcionada
- Repositorio de qda-lab: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
