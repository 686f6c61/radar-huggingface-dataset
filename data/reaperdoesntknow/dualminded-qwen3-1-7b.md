# reaperdoesntknow/DualMinded-Qwen3-1.7B

## Resumen

DualMinded-Qwen3-1.7B es un modelo de generación de texto de 1.700 millones de parámetros (2.031.739.904 según los pesos en safetensors) desarrollado por reaperdoesntknow bajo la división de investigación de Convergent Intelligence LLC. Se construye sobre Qwen3-1.7B mediante un pipeline de destilación de conocimiento en cuatro etapas que combina múltiples profesores (Qwen3-30B-A3B en variantes Instruct, Thinking y Coder) y un ajuste supervisado final sobre trazas de razonamiento de Opus 4.6. El resultado es un modelo compacto orientado a despliegue en el borde (edge) que implementa un bucle cognitivo de tres fases.

La innovación principal es la estructura "DualMind": el modelo genera primero un bloque `<explore>` de razonamiento libre, después un bloque `<examine>` de autocrítica adversarial y finalmente un bloque `<response>` con la síntesis limpia de la respuesta. Esta separación de roles se consigue con los mismos pesos, sin enrutamiento ni parámetros adicionales, mediante generación condicionada por rol. El modelo está pensado para tareas de razonamiento extendido, derivación creativa y verificación interna, en un tamaño que cabe en hardware de consumo.

El modelo se distribuye con licencia Apache 2.0, soporta únicamente inglés y tiene un contexto de entrenamiento de 2.048 tokens. Su relevancia actual radica en explorar si la estructura dialéctica (explorar, examinar, responder) puede recuperar parte de la capacidad de razonamiento de modelos mucho mayores en un presupuesto de parámetros muy reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), con bucle cognitivo de tres fases por condicionamiento de rol |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M (GGUF); BF16 en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

La base es un transformer decoder-only Qwen3 de 1.7B parámetros. Sobre esa base, el autor aplica un pipeline de cuatro etapas. La primera es una destilación multi-profesor: Qwen3-30B-A3B en sus variantes Instruct, Thinking y Coder se destila en Qwen3-1.7B mediante knowledge distillation con ponderación por pruebas (proof-weighted KD) y una amplificación de pérdida de 2,25× sobre los tokens de razonamiento. La segunda etapa, denominada DISC (Discrepancy Calculus), refina el estudiante detectando y preservando fronteras estructurales en la distribución del profesor.

La tercera etapa es la destilación topológica de conocimiento (TKD): destilación en flujo continuo con ventanas guiadas por topología desde Qwen3-30B-A3B-Thinking, usando descomposición de variación acotada de la salida del profesor (componente suave, saltos y deriva), amplificación de posiciones de salto a 3σ, corte de ventanas en fronteras de baja discrepancia y un currículo de cuatro fases de fácil a difícil. La cuarta etapa es un SFT sobre el dataset Opus-4.6-Reasoning-3000x-filtered, donde la columna `thinking` se mapea directamente a `<explore>` y la columna `solution` se divide en `<examine>` y `<response>`. La configuración de entrenamiento reportada usa longitud máxima de 2.048, batch efectivo de 16, learning rate 5e-6 con coseno, 32 pasos de warmup, 1.024 pasos máximos, precisión BF16 y hardware NVIDIA H100.

El autor describe además el fenómeno de "ghost imprinting": la destilación secuencial desde múltiples profesores deja campos residuales en el espacio de pesos que producen capacidades ausentes en cualquiera de los profesores individuales. La fundamentación matemática del pipeline se apoya en el "Discrepancy Calculus" (DISC), un marco de teoría de la medida descrito en un paper del mismo autor.

## Capacidades

- Generación de texto y razonamiento en tres fases explícitas: `<explore>` (razonamiento libre, derivación, especulación), `<examine>` (autocrítica adversarial, detección de errores, refinamiento) y `<response>` (síntesis limpia).
- Razonamiento matemático y demostraciones formales, incluyendo derivaciones paso a paso con verificación interna.
- Generación de código, heredada de la destilación desde Qwen3-30B-A3B-Coder.
- Autocrítica y detección de errores dentro del propio proceso de generación.
- Razonamiento de múltiples pasos mediante el bucle cognitivo interno.
- Capacidades multilingües limitadas al inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de visión ni audio.
- No se documenta modo "thinking" separado más allá de la estructura de etiquetas del propio modelo.

## Casos de uso

- Demostraciones matemáticas y derivaciones formales: el modelo puede recibir un enunciado y generar un bloque `<explore>` con la derivación, un `<examine>` que revisa los pasos y un `<response>` con la prueba final, lo que reduce errores en cadenas largas de razonamiento.
- Generación de código con revisión interna: al destilar desde Qwen3-30B-A3B-Coder, puede producir una solución en `<explore>`, criticarla en `<examine>` y entregar la versión corregida en `<response>`, útil en pipelines de generación de código con verificación.
- Asistente de estudio y tutoría: el desglose en tres fases permite mostrar al usuario el razonamiento, la autocrítica y la respuesta final por separado, lo que facilita el aprendizaje y la auditoría del proceso.
- Despliegue en el borde: con 1.7B parámetros y cuantizaciones GGUF Q4_K_M, cabe en dispositivos con recursos limitados y puede ejecutarse con Ollama o llama.cpp en portátiles y equipos de consumo.
- Prototipado rápido de agentes de razonamiento: la estructura de etiquetas permite integrar el modelo en flujos donde se necesita separar la fase de exploración de la de respuesta, por ejemplo en sistemas de verificación en dos pasos.
- Investigación sobre destilación y estructura cognitiva: el modelo sirve como caso de estudio reproducible del pipeline multi-etapa (KD, DISC, TKD, SFT) descrito por el autor, con papers y colecciones asociadas.
- Generación de contenido creativo y literario: el autor reporta comportamientos emergentes de contenido literario atribuidos al "ghost imprinting" de la destilación secuencial, aprovechables en tareas de escritura creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, alrededor de 5-6 GB.
- VRAM estimada en Q8_0: aproximadamente 2,2 GB de pesos.
- VRAM estimada en Q4_K_M: aproximadamente 1,2-1,4 GB de pesos.
- GPU recomendadas: NVIDIA H100 (usada en entrenamiento); para inferencia es suficiente con GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM en cuantización Q4_K_M, y en CPU mediante llama.cpp.
- Opciones de despliegue: Transformers (BF16), llama.cpp y Ollama (variantes GGUF publicadas en `reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF`); el autor documenta `ollama run reaperdoesntrun/DualMinded-1.7B`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DualMinded-Qwen3-1.7B | 2,03B | 2.048 | Apache 2.0 | Hugging Face, GGUF, Ollama | Bucle cognitivo de tres fases, solo inglés |
| Qwen3-1.7B (base) | 1,7B | No disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo base sin el pipeline de destilación ni el SFT de DualMind |
| DualMind | No disponible | No disponible | Apache 2.0 | Hugging Face | Variante entrenada con LogicInference_OA, orientada a lógica formal y pruebas estructuradas |

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se documenta soporte multilingüe.
- La longitud de contexto de entrenamiento es de 2.048 tokens, muy inferior a la de modelos contemporáneos; las conversaciones o documentos largos pueden truncarse.
- Riesgo de alucinación inherente a un modelo de 1.7B destilado; la fase `<examine>` mitiga pero no elimina los errores.
- El formato de tres fases requiere que el prompt incluya la etiqueta `<explore>` para activar el bucle; un uso fuera de ese formato puede degradar la calidad.
- No se documentan resultados de benchmarks, por lo que el rendimiento real frente a modelos comparables no está verificado de forma independiente.
- Las afirmaciones sobre "ghost imprinting" y "Discrepancy Calculus" provienen del propio autor y no cuentan con validación externa en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte documentado.
- El dataset de SFT (Opus-4.6-Reasoning-3000x-filtered) puede introducir sesgos y estilos del profesor; no se documenta un proceso de alineación adicional (RLHF/DPO) más allá del SFT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Versión GGUF: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF
- Variante DualMind: https://huggingface.co/reaperdoesntknow/DualMind
- Paper de metodología: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: https://doi.org/10.57967/hf/8184)
- Paper "Structure Over Scale": https://doi.org/10.57967/hf/8165
- Colección DualMind: https://huggingface.co/collections/reaperdoesntknow/dualmind
- Colección DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen
- Dataset de SFT: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset LongWriter-6k: https://huggingface.co/datasets/zai-org/LongWriter-6k
