# reaperdoesntknow/DualMind

## Resumen

DualMind es un modelo de generación de texto de 2.031.739.904 parámetros (1.7B efectivos) desarrollado por reaperdoesntknow bajo el sello de Convergent Intelligence LLC. Se construye sobre la arquitectura Qwen3ForCausalLM y se distribuye con licencia Apache 2.0. Su propuesta central es el "razonamiento de doble modalidad mental": un único conjunto de pesos que emite tres voces internas diferenciadas por tokens de rol (`<explore>`, `<examine>` y `<response>`), de modo que el modelo primero deriva libremente, después se autocritica de forma adversarial y finalmente sintetiza una respuesta limpia.

El modelo se obtiene por ajuste supervisado (SFT) sobre el modelo base reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored, que a su vez encadena un Qwen3-1.7B original, un SFT sin censura y un refinamiento DISC. El entrenamiento se realizó sobre el dataset KK04/LogicInference_OA, reformateado para que cada solución de cadena de pensamiento se divida en bloques de exploración, verificación y respuesta final. La ventana de contexto es de 40.960 tokens, con 28 capas, tamaño oculto de 2048 y atención GQA con 16 cabezas de consulta y 8 de clave/valor.

Su relevancia actual radica en que propone una alternativa ligera y de pesos compartidos a los arrays de colisión multi-modelo: en lugar de ejecutar varias arquitecturas distintas y contrastar sus salidas, DualMind reproduce esa dinámica dialéctica dentro de un solo modelo mediante condicionamiento por rol. Con 1.7B parámetros efectivos y BF16, está pensado para entornos de borde y despliegues con recursos limitados, aunque su adopción real todavía es modesta (1.870 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only con GQA) |
| Parametros totales | 2.031.739.904 (~2,03B; 1,7B efectivos según el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base es Qwen3, multilingüe por origen, pero no se confirma para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,1 GB |
| Tamano oculto | 2048 |
| Capas | 28 |
| Cabezas de atencion | 16 (Q) / 8 (KV), GQA |
| Precision de entrenamiento | BF16 (entrenado en H100) |
| Modelo base | reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored |
| Dataset de entrenamiento | KK04/LogicInference_OA (referenciado como zai-org/LongWriter-6k en los tags) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

DualMind es un transformer decoder-only estándar de la familia Qwen3, con 28 capas, tamaño oculto de 2048 y atención con query grouping (16 cabezas de consulta frente a 8 de clave/valor). No emplea mezcla de expertos ni arquitecturas híbridas SSM: la innovación no está en el bloque transformer, sino en el formato de condicionamiento por rol. Los tokens `<explore>`, `<examine>` y `<response>` actúan como marcadores estructurales que inducen tres fases cognitivas sobre los mismos pesos, de manera que el modelo alterna entre generación libre, crítica adversarial y síntesis final.

El entrenamiento se realizó mediante SFT con TRL sobre el dataset KK04/LogicInference_OA, transformado al formato del bucle cognitivo DualMind. Cada solución de cadena de pensamiento se segmentó a nivel de frase: las oraciones de derivación se asignaron al bloque `<explore>`, las de verificación y comprobación al bloque `<examine>` y la respuesta final al bloque `<response>`. La segmentación usa detección de disparadores léxicos ("check", "verify", "however", "but wait", etc.) para localizar la transición natural entre razonamiento y verificación, con un respaldo posicional 70/30 cuando no se detecta el disparador. El ajuste se ejecutó en una H100 de Colab en BF16, durante 512 pasos con tasa de aprendizaje 5e-6. El autor indica que una siguiente iteración se está entrenando sobre Crownelius/Opus-4.6-Reasoning-3300x (2.160 muestras de razonamiento de Claude Opus 4.6 con columnas `thinking`/`solution` pre-separadas), lo que eliminaría la necesidad de segmentación heurística.

## Capacidades

- Generación de texto conversacional y de razonamiento en un bucle estructurado de tres fases (`<explore>`, `<examine>`, `<response>`).
- Razonamiento lógico y matemático derivado del dataset LogicInference_OA, orientado a problemas de inferencia y demostración.
- Autocorrección estructural: la fase `<examine>` está entrenada para leer la salida de `<explore>` de forma adversarial y detectar errores, lagunas y pasos inválidos.
- Síntesis final limpia en `<response>` a partir del diálogo interno, sin exponer necesariamente el proceso de exploración.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: parcial, mediante el bucle interno de tres fases; no se documenta integración con frameworks de agentes.
- Capacidades multilingües: no disponibles (no declaradas para este fine-tune).
- Capacidades especiales: modo de pensamiento dual con tokens de rol; no se documentan visión, audio ni decodificación especulativa.
- Hereda del modelo base un ajuste "uncensored", lo que reduce los rechazos pero no elimina los sesgos subyacentes.

## Casos de uso

- Demostración matemática asistida: el modelo puede recibir un enunciado y completar el bucle completo desde `<explore>`, generando la derivación, la verificación y la respuesta final. Es adecuado para problemas de inferencia lógica y pruebas algebraicas sencillas gracias al entrenamiento específico sobre LogicInference_OA.
- Tutoría de razonamiento paso a paso: en entornos educativos, el bloque `<examine>` permite mostrar al estudiante no solo la solución, sino también la crítica de los errores típicos, con una ventana de 40.960 tokens suficiente para problemas y contexto extensos.
- Generación de cadenas de pensamiento verificadas para destilación: al producir pares exploración/crítica/respuesta de forma nativa, el modelo sirve para generar datos de entrenamiento estructurados para modelos mayores o para pipelines de destilación.
- Prototipado en borde y dispositivos con recursos limitados: con 2,03B parámetros totales y pesos BF16 de 4,1 GB, puede ejecutarse en GPUs de consumo con suficiente VRAM, lo que facilita pruebas locales de razonamiento auto-crítico sin infraestructura en la nube.
- Evaluación de robustez de pipelines de razonamiento: el formato de tres fases permite instrumentar métricas de discrepancia entre lo que el modelo explora y lo que finalmente responde, útil para investigación sobre calibración y alucinación.
- Generación de documentación técnica con revisión interna: para tareas de redacción donde se requiere una fase de borrador libre y otra de revisión, el modelo puede configurarse para emitir `<explore>` como borrador y `<examine>` como lista de correcciones antes de la versión final.
- Investigación sobre condicionamiento por rol: como banco de pruebas de bajo coste para estudiar si la dialéctica multi-voz sobre pesos compartidos reproduce los beneficios de los arrays de colisión multi-modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,1 GB de pesos; en 4 bits, alrededor de 1,1 GB (estimaciones teóricas, no verificadas por el autor, ya que no se publican pesos GGUF).
- GPU recomendadas: H100 o A100 para entrenamiento y despliegues de alta concurrencia; RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16 para contextos cortos; con cuantización a 4 bits cabría en GPUs de 4-6 GB, aunque no hay artefactos GGUF oficiales.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (aparece en los tags), endpoints compatibles; vLLM, llama.cpp y Ollama no están documentados oficialmente para este modelo, y llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DualMind | ~2,03B (1,7B efectivos) | 40.960 | Apache 2.0 | safetensors | Bucle de tres fases con tokens de rol; SFT sobre LogicInference_OA |
| Qwen3-1.7B | ~1,7B | no disponible en esta ficha | Apache 2.0 (modelo base de origen) | safetensors, GGUF | Modelo base original de la cadena; sin el condicionamiento dual |
| reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored | ~1,7B | no disponible | no disponible | safetensors | Modelo base directo de DualMind; SFT sin censura |
| Modelos de razonamiento pequeños de la familia Qwen3 (variantes 1.7B) | ~1,7B | variable según variante | Apache 2.0 en la mayoría | safetensors, GGUF | Alternativas de la misma categoría; no se dispone de comparación de rendimiento publicada para DualMind |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento entre DualMind y sus alternativas.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo; el modelo hereda los sesgos del Qwen3 original y del ajuste "uncensored" del modelo base, lo que puede aumentar la probabilidad de contenido sensible sin filtros.
- Riesgo de alucinación: el bucle `<explore>` está diseñado explícitamente para especular y equivocarse, y no hay garantía de que `<examine>` detecte todos los errores; la respuesta final puede arrastrar fallos no corregidos.
- El formato de tres fases depende de que el prompt incluya el token `<explore>` de apertura; fuera de ese formato, el comportamiento del modelo no está documentado.
- La segmentación del dataset de entrenamiento se basa en heurísticas léxicas y un respaldo posicional 70/30, lo que puede introducir ruido en la frontera entre exploración y verificación.
- Idiomas soportados no declarados: no se confirma el rendimiento multilingüe de este fine-tune, aunque el Qwen3 subyacente sea multilingüe.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin conversión manual.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base encadena un ajuste "uncensored" cuyas implicaciones de cumplimiento en producción deben evaluarse por separado.
- El repositorio tiene 0 likes y un volumen de descargas modesto (1.870), por lo que la validación comunitaria es escasa.
- El autor anuncia una siguiente iteración en entrenamiento; los resultados actuales pueden quedar obsoletos rápidamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind
- Modelo base directo: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Modelo intermedio de la cadena de destilación: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/KK04/LogicInference_OA
- Dataset de la siguiente iteración: https://huggingface.co/datasets/Crownelius/Opus-4.6-Reasoning-3300x
- Repositorio de experimentos de colisión multi-arquitectura del autor: https://huggingface.co/reaperdoesntknow
- Referencia teórica citada (Discrepancy Calculus, CIx, 2026): no disponible como enlace directo en la información proporcionada
