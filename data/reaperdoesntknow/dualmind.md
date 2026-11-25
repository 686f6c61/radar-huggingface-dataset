# reaperdoesntknow/DualMind

## Resumen

DualMind es un modelo de lenguaje de 2.031.739.904 parámetros (etiquetado como 1.7B efectivos por el autor) desarrollado por reaperdoesntknow bajo el sello Convergent Intelligence LLC. Se trata de un fine-tuning supervisado (SFT) del modelo reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored, que a su vez deriva de Qwen3-1.7B. Su propuesta central es implementar lo que el autor denomina "doble modalidad mental": una única arquitectura con dos voces internas que comparten pesos y se diferencian únicamente por tokens de rol (`<explore>`, `<examine>`, `<response>`).

El modelo aborda el problema de la autocorrección en cadenas de razonamiento. En lugar de una única secuencia de pensamiento, DualMind estructura la generación en tres fases: una exploración libre donde se permite especular y equivocarse, una fase de examen adversarial donde el modelo critica su propia derivación, y una síntesis final limpia. El autor lo presenta como una versión colapsada en un solo modelo de sus experimentos de "colisión multi-arquitectura".

Arquitectónicamente es un transformer denso tipo Qwen3ForCausalLM, con 2048 de dimensión oculta, 28 capas, atención GQA (16 cabezas Q / 8 KV) y una longitud de contexto de 40.960 tokens. Se entrenó en BF16 sobre una H100 de Colab durante 512 pasos con learning rate 5e-6 usando TRL. La licencia es Apache 2.0 y el repo ocupa 4,1 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer denso, decoder-only) |
| Parametros totales | 2.031.739.904 (~2,03B; 1,7B efectivos segun el autor) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

DualMind es un transformer decoder-only denso basado en Qwen3ForCausalLM. La configuración publicada incluye hidden size de 2048, 28 capas y atención con grouped-query attention (16 cabezas de query y 8 de key/value). El contexto máximo es de 40.960 tokens. El modelo se entrenó en precisión BF16 sobre una GPU H100 de Google Colab, con 512 pasos de SFT mediante TRL y un learning rate de 5e-6.

El entrenamiento parte de reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored, un Qwen3-1.7B previamente afinado sin censura y refinado con la metodología DISC del autor. El dataset principal es KK04/LogicInference_OA, cuyos problemas de inferencia lógica se transformaron al formato de bucle cognitivo de DualMind: las oraciones de derivación se mapean al bloque `<explore>`, las de verificación al bloque `<examine>` y la respuesta final al bloque `<response>`. La separación se realiza a nivel de oración mediante detección de disparadores ("check", "verify", "however", "but wait", etc.), con un fallback posicional 70/30 cuando no se detecta transición. El autor indica que una siguiente iteración se está entrenando sobre Crownelius/Opus-4.6-Reasoning-3300x (2.160 muestras de razonamiento de Claude Opus 4.6 con columnas `thinking`/`solution` pre-separadas). La model card asocia el diseño a un marco teórico propio, "Discrepancy Calculus" (DISC), que no constituye una innovación arquitectónica verificable en los pesos.

## Capacidades

- Generación de texto conversacional y de razonamiento en un único flujo estructurado de tres roles.
- Razonamiento en modo dual: fase `<explore>` de derivación libre y fase `<examine>` de autocrítica adversarial antes de la respuesta.
- Razonamiento lógico y matemático, derivado del dataset de inferencia lógica usado en el SFT.
- Autocorrección estructurada: el modelo revisa su propia derivación buscando errores antes de sintetizar.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de agente con herramientas; el multi-paso se limita al bucle interno explore→examine→response.
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Capacidades especiales: no se documentan visión, audio ni modo thinking nativo adicional; el "thinking" se implementa mediante tokens de rol explícitos.

## Casos de uso

- Razonamiento matemático verificable: el modelo puede resolver demostraciones y problemas algebraicos generando primero una derivación libre y luego una revisión explícita de cada paso, lo que facilita detectar saltos lógicos antes de entregar la respuesta final.
- Generación de explicaciones educativas: para tutoriales o material docente, el bloque `<examine>` permite mostrar al estudiante no solo la solución sino también los puntos donde es fácil equivocarse, con contexto de hasta 40.960 tokens para unidades didácticas largas.
- Depuración de cadenas de razonamiento en pipelines de evaluación: al separar exploración y examen en bloques etiquetados, es posible parsear y auditar automáticamente la fase de verificación de un LLM sin necesidad de otro modelo crítico.
- Prototipado de asistentes de análisis lógico: en entornos de investigación donde se necesita un modelo pequeño (2B) desplegable en una sola GPU, DualMind sirve para experimentar con esquemas de autocorrección sin coste de inferencia de modelos mayores.
- Generación de borradores con revisión integrada: en redacción técnica o de documentación, el modelo produce un primer borrador en `<explore>` y una revisión crítica en `<examine>` antes del texto final, útil en flujos donde el coste de un segundo pase con otro modelo es prohibitivo.
- Investigación sobre destilación y formatos de razonamiento: como artefacto de estudio, permite analizar cómo un SFT de 512 pasos sobre datos reestructurados afecta al comportamiento de autocorrección de un Qwen3-1.7B, con la cadena de destilación documentada de forma explícita.
- Experimentación en entornos edge: con ~2B parámetros y pesos BF16 de 4,1 GB, es viable en GPUs de consumo para pruebas de concepto de razonamiento estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4-5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 6-8 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2,5-3 GB de pesos; en 4 bits, aproximadamente 1,5-2 GB (no se publican GGUF oficiales, requeriría conversión propia).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; A100, H100 o L40S para despliegue en producción con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con margen; en GPUs de 8 GB puede requerir cuantización o contextos reducidos.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (etiqueta `text-generation-inference` presente), endpoints compatibles; vLLM, llama.cpp y Ollama no están documentados oficialmente y requerirían conversión o configuración manual.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DualMind | ~2,03B | 40.960 | Apache 2.0 | SFT sobre Qwen3-1.7B con bucle explore/examine/response |
| Qwen3-1.7B | ~1,7B | 32.768 (configuración estándar de la familia Qwen3) | Apache 2.0 | Modelo base original de la cadena; sin formato dual |
| reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored | ~1,7B | no disponible | Apache 2.0 (heredada) | Predecesor directo, sin bucle dual |
| Modelos de razonamiento pequeños de la familia Qwen3 (p. ej., variantes 1.7B con modo thinking) | ~1,7B | 32.768 | Apache 2.0 | Razonamiento en un único flujo, sin fase de examen explícita |

La comparación de rendimiento frente a estas alternativas no está disponible: no se han publicado benchmarks del modelo.

## Limitaciones y advertencias

- No se han publicado evaluaciones cuantitativas (MMLU, GSM8K, HumanEval u otras); el rendimiento real es desconocido y no debe asumirse superior al del Qwen3-1.7B base.
- El entrenamiento consta de solo 512 pasos de SFT sobre un dataset de inferencia lógica reestructurado; es probable un sobreajuste al formato de tres bloques y una degradación en tareas fuera de ese dominio.
- El formato de separación explore/examine se construyó con heurísticas de detección de disparadores y un fallback posicional 70/30, lo que puede introducir ruido en las etiquetas de entrenamiento.
- El modelo base es una variante "uncensored"; esto implica un mayor riesgo de generar contenido inapropiado o dañino y menores salvaguardas que el Qwen3 original.
- Riesgo de alucinación: inherente a un modelo de 2B; la fase `<examine>` no garantiza la detección de errores y puede producir críticas plausibles pero incorrectas.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto y probablemente inferior al del Qwen3 base en idiomas distintos del inglés.
- La model card incluye afirmaciones teóricas (Discrepancy Calculus, "Continuous Thought Dynamics") sin validación empírica publicada; deben tratarse como marco conceptual del autor, no como garantía de capacidades.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de documentación sobre sesgos hace recomendable una evaluación propia antes de producción.
- El autor anuncia una siguiente iteración en entrenamiento; la versión actual puede quedar obsoleta y no recibir mantenimiento.
- No se publican pesos en GGUF ni cuantizaciones oficiales, lo que limita el despliegue en entornos con restricciones de memoria sin trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind
- Modelo base: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Predecesor en la cadena de destilación: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Dataset de entrenamiento principal: https://huggingface.co/datasets/KK04/LogicInference_OA
- Dataset de la siguiente iteración: https://huggingface.co/datasets/Crownelius/Opus-4.6-Reasoning-3300x
- Perfil del autor con experimentos de colisión multi-arquitectura: https://huggingface.co/reaperdoesntknow
