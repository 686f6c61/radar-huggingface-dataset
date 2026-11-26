# reaperdoesntknow/DualMinded-Qwen3-1.7B

## Resumen

DualMinded-Qwen3-1.7B es un modelo de lenguaje de 1.700 millones de parámetros (2.031.739.904 reales según los pesos en safetensors) desarrollado por reaperdoesntknow bajo el sello Convergent Intelligence LLC: Research Division. Se construye sobre Qwen3-1.7B mediante un pipeline de destilación en cuatro etapas a partir de variantes de Qwen3-30B-A3B (Instruct, Thinking y Coder) y un ajuste supervisado final sobre trazas de razonamiento de Opus 4.6. El problema que aborda es el razonamiento estructurado en el extremo ("edge"): obtener capacidades de auto-crítica y derivación extendida en un modelo lo bastante pequeño para ejecutarse en hardware de consumo.

Su rasgo distintivo es el llamado "bucle cognitivo" en tres fases —`<explore>`, `<examine>`, `<response>`— que reproduce mediante generación condicionada por rol sobre pesos compartidos lo que normalmente requeriría una colisión de múltiples modelos. No hay parámetros adicionales ni enrutamiento: la misma red opera en modos cognitivos distintos según las etiquetas de estructura presentes en el prompt.

La relevancia actual reside en dos frentes: por un lado, demuestra que la destilación multi-profesor con amplificación de pérdida en tokens de razonamiento puede transferir comportamiento de "thinking" a un modelo de 1.7B; por otro, introduce una metodología (Topological Knowledge Distillation, Discrepancy Calculus) documentada en publicaciones con DOI, lo que permite evaluar y reproducir el enfoque más allá del modelo concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) con generación condicionada por rol |
| Parámetros totales | 2.031.739.904 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_seq_length de 2048) |
| Tipos de cuantización | F16, Q8_0, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso, y hereda su tokenizador y estructura de atención. Sobre esa base se aplica un pipeline de cuatro etapas. La primera es destilación multi-profesor: tres variantes de Qwen3-30B-A3B (Instruct, Thinking y Coder) se destilan en el estudiante de 1.7B mediante knowledge distillation ponderada por pruebas ("proof-weighted KD") con una amplificación de pérdida de 2,25× sobre los tokens de razonamiento. La segunda etapa, denominada DISC Refinement, refina el estudiante mediante Discrepancy Calculus, detectando y preservando fronteras estructurales en la distribución del profesor.

La tercera etapa es Topological Knowledge Distillation (TKD), una destilación de flujo continuo desde Qwen3-30B-A3B-Thinking con ventaneo guiado por topología: descomposición en variación acotada de la salida del profesor (componente suave, saltos y deriva), amplificación de las posiciones de salto a 3σ, corte de ventanas en fronteras de baja discrepancia y un currículo de cuatro fases de fácil a difícil. La cuarta etapa es un SFT sobre el dataset nohurry/Opus-4.6-Reasoning-3000x-filtered, donde la columna `thinking` se mapea directamente a `<explore>` y la columna `solution` se divide en `<examine>` y `<response>`. La configuración de entrenamiento reportada incluye longitud máxima de secuencia 2048, batch efectivo de 16 (2 × 8 de acumulación), learning rate 5e-6 con decaimiento coseno, 32 pasos de warmup, 1024 pasos máximos, precisión BF16 y hardware NVIDIA H100.

Como innovación destacable, el autor describe el fenómeno de "ghost imprinting": la destilación secuencial desde múltiples profesores deja campos residuales en el espacio de pesos que producen capacidades ausentes en cualquiera de los profesores individuales. Se trata de una afirmación del autor sin validación independiente en la información disponible.

## Capacidades

- Generación de texto conversacional y de razonamiento estructurado en tres fases (`<explore>`, `<examine>`, `<response>`).
- Razonamiento extendido y derivación creativa, heredado del entrenamiento sobre trazas de Opus 4.6.
- Auto-crítica adversarial: la fase `<examine>` está diseñada para detectar errores y refinar la derivación previa.
- Razonamiento formal y pruebas estructuradas (la variante DualMind, con datos LogicInference_OA, está orientada a este fin; DualMinded prioriza razonamiento extendido).
- Generación de código, procedente del profesor Qwen3-30B-A3B-Coder en la etapa de destilación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente; el bucle de tres fases es un mecanismo interno de auto-refinamiento, no un framework de agentes.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: no se documentan visión ni audio.

## Casos de uso

- Razonamiento matemático con verificación interna: el modelo puede invocarse forzando la secuencia `<explore>` → `<examine>` → `<response>` para obtener una derivación, una revisión crítica de la misma y una respuesta final limpia; útil en entornos educativos o de asistencia a la demostración donde se quiere trazabilidad del razonamiento.
- Despliegue en edge y dispositivos con recursos limitados: con cuantización Q4_K_M o Q5_K_M (GGUF) el modelo cabe en GPUs de consumo y en CPUs modernas vía llama.cpp u Ollama (`ollama run reaperdoesntrun/DualMinded-1.7B`), lo que permite asistentes locales sin conexión.
- Generación de código asistida en local: al haber sido destilado desde Qwen3-30B-A3B-Coder, puede emplearse para autocompletado y explicación de fragmentos en IDE con presupuesto de VRAM reducido (8-12 GB), aunque sin garantías de tool calling.
- Prototipado de pipelines de razonamiento estructurado: investigadores pueden usar el modelo como banco de pruebas barato para estudiar el efecto del bucle explore/examine/response antes de escalar a modelos mayores.
- Filtrado y anotación de datos de razonamiento: el modelo puede generar trazas de razonamiento sintéticas (fase `<explore>`) para aumentar datasets de entrenamiento de modelos mayores, con la ventaja de su bajo coste de inferencia.
- Experimentación en destilación e interpretabilidad: dado que el autor publica la metodología (DISC, TKD) con DOI, el modelo sirve como artefacto reproducible para estudiar ghost imprinting y efectos de destilación secuencial multi-profesor.
- Chat conversacional de dominio general en inglés: a pesar de su tamaño, el ajuste conversacional y la destilación desde Instruct permiten usarlo como asistente textual ligero en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en BF16/F16 (2.031 M de parámetros × 2 bytes más overhead), ~2,2 GB en Q8_0, ~1,4 GB en Q5_K_M y ~1,2 GB en Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes con holgura. El entrenamiento reportado se realizó en NVIDIA H100.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 6 GB o más, incluidas GTX 1660, RTX 3050, RTX 4060 y superiores; también en Apple Silicon unificada.
- Opciones de despliegue: transformers (BF16), llama.cpp, Ollama (etiqueta `reaperdoesntrun/DualMinded-1.7B`), y cualquier runtime compatible con GGUF. vLLM y TGI no están documentados explícitamente para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| DualMinded-Qwen3-1.7B | 2.031 M | no disponible (entrenado a 2048) | Apache 2.0 | Destilación multi-profesor + bucle de auto-crítica | HF, GGUF, Ollama |
| Qwen3-1.7B | 1.700 M aprox. | 32.768 tokens (según familia Qwen3) | Apache 2.0 | Modelo base generalista | HF, GGUF, Ollama |
| DualMind (mismo autor) | 2.031 M aprox. | no disponible | Apache 2.0 | Variante orientada a lógica formal (LogicInference_OA) | HF |
| Qwen3-30B-A3B | 30.000 M (3B activos) | 32.768 tokens aprox. | Apache 2.0 | MoE generalista, profesor del pipeline | HF, GGUF |

El modelo se posiciona como una alternativa especializada en razonamiento estructurado frente a Qwen3-1.7B genérico, a costa de un contexto efectivo menor (2048 durante el entrenamiento) y de un soporte limitado al inglés. Frente a DualMind, la diferencia es el dataset de SFT: Opus 4.6 para razonamiento extendido frente a LogicInference para lógica formal.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre trazas de Opus 4.6 y destilar desde Qwen3, puede heredar sesgos de ambos, sin evaluación independiente disponible.
- Riesgo de alucinación: elevado en un modelo de 1.7B, especialmente en la fase `<examine>`, donde la auto-crítica puede generar objeciones plausibles pero incorrectas. La estructura de tres fases no garantiza corrección.
- Limitaciones de contexto: el entrenamiento se realizó con longitud máxima de 2048 tokens; no se documenta la ventana efectiva del modelo base ni si se preserva íntegra tras el ajuste. Para conversaciones o documentos largos, el rendimiento puede degradarse.
- Limitaciones de idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones heredadas del modelo base Qwen3-1.7B y de los datasets de destilación (Opus 4.6 y LongWriter-6k), cuyos términos pueden imponer condiciones adicionales.
- Caveat de producción: las afirmaciones sobre ghost imprinting y capacidades emergentes son del autor y no cuentan con validación independiente; deben tratarse como hipótesis. El modelo no documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.
- El nombre del autor y la organización (Convergent Intelligence LLC) no cuentan con trayectoria pública verificable en la información disponible; conviene evaluar el modelo empíricamente antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Versión GGUF: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF
- Variante DualMind: https://huggingface.co/reaperdoesntknow/DualMind
- Metodología DualMind: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Paper de metodología (DOI): https://doi.org/10.57967/hf/8184
- Paper "Structure Over Scale" (DOI): https://doi.org/10.57967/hf/8165
- Colección DualMind: https://huggingface.co/collections/reaperdoesntknow/dualmind
- Colección DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen
- Dataset de SFT: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset LongWriter-6k: https://huggingface.co/datasets/zai-org/LongWriter-6k
