# reaperdoesntknow/DualMind

## Resumen

DualMind es un modelo de lenguaje de 2.031.739.904 parámetros (1.7B efectivos) desarrollado por reaperdoesntknow bajo el sello de Convergent Intelligence LLC. Se trata de un ajuste fino por supervisión (SFT) sobre `reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored`, que a su vez deriva de Qwen3-1.7B. Su propuesta central es implementar un razonamiento de "doble modalidad mental" sobre unos pesos compartidos: el modelo alterna entre tres roles delimitados por tokens especiales (`<explore>`, `<examine>`, `<response>`) que estructuran una suerte de diálogo interno entre una fase de derivación libre, una fase de autocrítica adversarial y una fase de síntesis final.

La arquitectura subyacente es un transformer causal estándar (Qwen3ForCausalLM) con 28 capas, tamaño oculto de 2048, atención con GQA (16 cabezas de consulta y 8 de clave/valor) y una ventana de contexto de 40.960 tokens. El entrenamiento se realizó en BF16 sobre una H100 de Colab durante 512 pasos con una tasa de aprendizaje de 5e-6, usando TRL para el SFT sobre el dataset `KK04/LogicInference_OA`, transformado al formato del bucle cognitivo DualMind mediante detección de disparadores a nivel de frase.

Su relevancia actual radica en que propone una alternativa ligera y de pesos abiertos (licencia Apache 2.0) a las técnicas de razonamiento multi-paso basadas en cadenas de pensamiento únicas, apostando por la autoverificación estructurada dentro de un mismo modelo. Está pensado para despliegue en el borde (edge) y entornos con recursos limitados, y el autor anuncia una siguiente iteración entrenada sobre `Crownelius/Opus-4.6-Reasoning-3300x`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer causal decoder-only) |
| Parametros totales | 2.031.739.904 (~2.03B; 1.7B efectivos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors; el autor no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Tamano oculto | 2048 |
| Capas | 28 |
| Cabezas de atencion | 16 (Q) / 8 (KV), GQA |
| Precision de entrenamiento | BF16 |
| Modelo base | reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored |
| Dataset de entrenamiento | KK04/LogicInference_OA (transformado al formato DualMind) |
| Tamano del repositorio | 4.1 GB |

## Arquitectura y entrenamiento

DualMind es un transformer causal decoder-only con la arquitectura Qwen3ForCausalLM: 28 capas, dimensión oculta de 2048, 16 cabezas de atención de consulta y 8 de clave/valor (GQA), y una ventana de contexto de 40.960 tokens. Los pesos se distribuyen en safetensors en BF16 y el repositorio ocupa 4.1 GB. No se trata de un modelo MoE ni híbrido: toda la capacidad del modelo se activa en cada token generado.

El entrenamiento consistió en un SFT con TRL sobre el dataset `KK04/LogicInference_OA`, en el que cada solución de cadena de pensamiento se reestructura en tres bloques: las frases de derivación van a `<explore>`, las frases de verificación y comprobación a `<examine>`, y la respuesta final a `<response>`. La separación se hace a nivel de frase mediante detección de disparadores léxicos ("check", "verify", "however", "but wait", entre otros), con un respaldo posicional 70/30 cuando no se detecta transición. Se realizaron 512 pasos con tasa de aprendizaje 5e-6 en una H100 de Colab en BF16. La cadena de destilación documentada es: Qwen3-1.7B → DiStil-Qwen3-1.7B-uncensored (SFT sin censura) → Disctil-Qwen3-1.7B (refinamiento DISC) → DualMind. El autor menciona una siguiente iteración en entrenamiento sobre `Crownelius/Opus-4.6-Reasoning-3300x` (2.160 muestras de razonamiento de Claude Opus 4.6 con columnas `thinking`/`solution` pre-separadas), pero no se aportan resultados de esa iteración.

La innovación técnica declarada es el condicionamiento por rol sobre pesos compartidos: en lugar de emplear varios modelos con modos de fallo distintos (lo que el autor llama "multi-model collision array"), DualMind recrea la dinámica dialéctica dentro de un único conjunto de pesos mediante los tokens `<explore>`, `<examine>` y `<response>`. El autor vincula conceptualmente este esquema con su marco teórico de "Discrepancy Calculus" (DISC), pero no se aportan validaciones empíricas de esa conexión en la información disponible.

## Capacidades

- Generación de texto autoregresiva con plantilla de prompt propia basada en `##USER:` y bloques `<explore>`, `<examine>` y `<response>`.
- Razonamiento estructurado en tres fases: derivación libre, autocrítica adversarial y síntesis final.
- Razonamiento lógico y matemático básico, orientado por el dataset de inferencia lógica empleado en el entrenamiento.
- Autoverificación y detección de errores dentro del propio bucle generativo (fase `<examine>`).
- Generación de cadenas de pensamiento explícitas y separadas de la respuesta final.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se especifican idiomas soportados).
- Capacidades de visión o audio: no disponibles.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (según los tags del repositorio).

## Casos de uso

- Razonamiento lógico y matemático asistido: el modelo puede recibir un problema y completar el bucle `<explore>` → `<examine>` → `<response>`, de modo que la respuesta final incorpora una fase explícita de comprobación. Es adecuado por su entrenamiento específico sobre inferencia lógica y por la estructura de tres fases que separa derivación y verificación.
- Generación de explicaciones paso a paso con trazabilidad: en entornos educativos o de documentación técnica, el bloque `<explore>` permite mostrar el desarrollo y el `<examine>` las correcciones, lo que facilita la auditoría del razonamiento por parte del usuario.
- Despliegue en el borde y entornos con recursos limitados: con 2.03B parámetros y pesos en BF16, el modelo cabe en GPUs de consumo y en dispositivos con memoria moderada, lo que lo hace apto para asistentes locales sin conexión.
- Prototipado de pipelines de autoverificación: equipos de investigación pueden usar el modelo como componente de bajo coste para experimentar con esquemas de crítica y refinamiento antes de escalar a modelos mayores.
- Filtrado y revisión de borradores de razonamiento: el patrón `<examine>` puede emplearse para que el modelo revise salidas previas (propias o de otro sistema) en busca de errores lógicos, siempre que se le proporcione el texto a criticar en el formato adecuado.
- Generación de contenido conversacional con plantilla `##USER:`: el modelo puede integrarse en aplicaciones de chat que respeten su formato de prompt y aprovechen la fase de síntesis para respuestas más concisas.
- Investigación sobre condicionamiento por rol: sirve como banco de pruebas reproducible (Apache 2.0, pesos abiertos) para estudiar si el cambio de rol mediante tokens especiales mejora la coherencia del razonamiento en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,1 GB para pesos, más overhead; en cuantización de 4 bits, alrededor de 1,1 GB para pesos. Estas cifras son estimaciones a partir del número de parámetros, ya que el autor no publica cuantizaciones oficiales.
- GPU recomendadas: H100 (empleada en el entrenamiento), A100, L40S o RTX 4090 para inferencia en BF16 sin problemas; RTX 3090, RTX 4080 o RTX 4070 Ti para contextos largos en BF16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (declarado en los tags) y endpoints compatibles. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que el autor no documenta.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| DualMind | ~2.03B | 40.960 | Apache 2.0 | Razonamiento en tres fases por rol sobre pesos compartidos | Hugging Face, transformers |
| Qwen3-1.7B (base original) | ~1.7B | no disponible en la informacion | Apache 2.0 (heredada de Qwen3) | Transformer causal estándar | Hugging Face |
| reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored (modelo base directo) | ~1.7B | no disponible en la informacion | Apache 2.0 | SFT sin censura | Hugging Face |
| Modelos de razonamiento pequeños de la familia Qwen3 (variantes "thinking") | ~1.7B | no disponible en la informacion | Apache 2.0 | Cadena de pensamiento integrada | Hugging Face |

La comparación se limita a la cadena de ascendencia del propio modelo, ya que no se dispone de datos de benchmarks que permitan contrastar su rendimiento con alternativas de la misma categoría. El dato diferencial documentado es la ventana de contexto de 40.960 tokens y la estructura de tres roles, frente al transformer estándar de su modelo base.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no existe evidencia cuantitativa de mejora frente a su modelo base ni frente a Qwen3-1.7B.
- El modelo base intermedio es una variante "uncensored"; aunque DualMind se distribuye con licencia Apache 2.0, conviene auditar las salidas antes de usarlo en producción orientada al público.
- Riesgo de alucinación inherente a un modelo de 1.7B efectivos: la fase `<examine>` es una autocrítica generada por el propio modelo y no garantiza la detección de errores; puede validar razonamientos incorrectos.
- El formato de prompt es rígido: requiere `##USER:` y la apertura explícita de `<explore>`; fuera de esa plantilla el comportamiento puede degradarse.
- El entrenamiento se realizó en 512 pasos sobre un único dataset de inferencia lógica, lo que limita la generalización a dominios distintos del razonamiento lógico.
- No se documentan los idiomas soportados; el dataset y la plantilla están en inglés, por lo que el rendimiento en castellano no está garantizado.
- La conexión teórica con "Discrepancy Calculus" es una elaboración del autor sin validación empírica publicada en la información disponible.
- No se ofrecen cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que puede complicar el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.
- La model card menciona una siguiente iteración en entrenamiento; los resultados de esa iteración no están disponibles y no deben asumirse.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de atribución correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind
- Modelo base directo: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Modelo intermedio de la cadena: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/KK04/LogicInference_OA
- Dataset de la siguiente iteración: https://huggingface.co/datasets/Crownelius/Opus-4.6-Reasoning-3300x
- Repositorio de experimentos del autor: https://huggingface.co/reaperdoesntknow
- Paper teórico citado (Discrepancy Calculus, CIx, 2026): no disponible como enlace directo en la información proporcionada.
