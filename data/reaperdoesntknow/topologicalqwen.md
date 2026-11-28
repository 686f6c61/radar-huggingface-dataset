# reaperdoesntknow/TopologicalQwen

## Resumen

TopologicalQwen es un modelo de lenguaje de 1.700 millones de parámetros efectivos (2.030 millones reales en pesos) desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division) mediante una técnica propietaria denominada Topological Knowledge Distillation (TKD). El modelo se obtiene destilando el profesor Qwen3-30B-A3B-Thinking-2507 sobre un estudiante derivado de Qwen3-1.7B, con el objetivo de transferir capacidad de razonamiento matemático y físico a un tamaño desplegable en hardware de consumo. La propuesta diferencial es tratar la distribución de salida del profesor como una función de variación acotada y descomponer la transferencia en tres canales (componente suave, correcciones de salto y correcciones de deriva), frente al enfoque clásico de solo divergencia KL.

El modelo emplea el formato DualMind, que estructura cada respuesta en tres bloques etiquetados: `<explore>` (derivación libre), `<examine>` (autocrítica adversarial) y `<response>` (respuesta final sintetizada). Este formato se aprendió durante el SFT sobre aproximadamente 1.599 muestras de cadena de pensamiento en física (ecuaciones diferenciales, mecánica teórica, electromagnetismo y relatividad general). La arquitectura subyacente es Qwen3ForCausalLM con atención GQA, 28 capas y una ventana de contexto de 40.960 tokens.

Su relevancia actual reside en la combinación de tres factores: un contexto largo poco habitual para su tamaño, una licencia Apache 2.0 permisiva y un pipeline de destilación documentado con hiperparámetros concretos y una publicación asociada (DOI 10.57967/hf/8165). No obstante, el modelo está altamente especializado en razonamiento físico-matemático y no se han publicado benchmarks estándar que permitan validar las afirmaciones metodológicas del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only con GQA) |
| Parámetros totales | 2.031.739.904 (2,03 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor indica BF16/FP16 para inferencia, sin publicar variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otras especificaciones declaradas por el autor:

| Parámetro | Valor |
|---|---|
| Hidden size | 2.048 |
| Capas | 28 |
| Cabezas de atención | 16 (Q) / 8 (KV), GQA |
| Tamaño intermedio | 6.144 |
| Vocabulario | 151.936 tokens |
| Precisión de entrenamiento | FP32 con autocast BF16 |
| Tamaño del repositorio | 4,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de la familia Qwen3, con 28 capas, hidden size de 2.048 y atención con grouped-query attention (16 cabezas de consulta y 8 de clave-valor). No incorpora mecanismos híbridos tipo SSM ni atención lineal: es un transformer denso convencional. La innovación no está en la arquitectura, sino en el procedimiento de destilación.

El pipeline TKD consta de cuatro fases. En la primera se cachean los logits del profesor Qwen3-30B-A3B-Thinking-2507 en una única pasada forward, con compresión top-64 a disco. En la segunda se aplica un operador de discrepancia vectorizado que detecta discontinuidades en la distribución del profesor con umbral de 3σ y amplificación de 1,25×, y calcula densidad de energía de hueco en ventanas de 64 tokens. En la tercera se segmenta el flujo de tokens en ventanas de 512 tokens cortadas en posiciones de baja discrepancia (solapamiento de 32 a 128), en lugar de usar stride fijo. En la cuarta se ejecuta un currículum de cuatro fases (30 % más fácil primero) con pérdida ponderada por demostración (2,25× → 1,1×), alpha de KD que escala de 0 a 0,45, divergencia KL a temperatura 2,0, batch efectivo de 32 (2 × 16 de acumulación), learning rate coseno de 5e-6 a 5e-7, warmup de 30 pasos, weight decay de 1e-3 y gradient clipping de 1,0.

Los datos de entrenamiento son aproximadamente 1.599 muestras de cadena de pensamiento en física: 636 de ecuaciones diferenciales, 580 de electromagnetismo, 307 de mecánica teórica y 76 de relatividad general. Cada muestra se reformatea al esquema DualMind. No se documenta un volumen de tokens total ni una fase de RLHF o DPO posterior al SFT. La cadena de destilación declarada es: Qwen3-1.7B → DiStil-Qwen3-1.7B-uncensored (SFT sin censura) → Disctil-Qwen3-1.7B (refinamiento DISC) → TopologicalQwen.

## Capacidades

- Generación de texto conversacional con formato estructurado DualMind en tres bloques: `<explore>`, `<examine>` y `<response>`.
- Razonamiento matemático y físico: derivaciones de ecuaciones diferenciales, mecánica teórica, electromagnetismo y relatividad general, el dominio exacto de los datos de destilación.
- Autocrítica explícita: el bloque `<examine>` produce una revisión adversarial de la derivación previa antes de sintetizar la respuesta final.
- Contexto largo de hasta 40.960 tokens, útil para problemas con enunciados extensos o cadenas de derivación largas.
- Generación con parámetros de muestreo recomendados por el autor: top_p 0,9, temperatura 0,6 y repetition_penalty 1,15.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible (el multi-paso interno vía DualMind sí está soportado; no se documenta integración con frameworks de agentes).
- Capacidades multilingües: no disponible (el autor no documenta idiomas; el vocabulario Qwen3 es multilingüe, pero no hay evaluación publicada).
- Visión, audio o modalidades adicionales: no soportadas.
- Modo thinking nativo separado: no disponible como flag; el razonamiento se expone mediante las etiquetas DualMind.

## Casos de uso

- Resolución asistida de problemas de física universitaria: el modelo puede recibir un enunciado de mecánica teórica o electromagnetismo y generar una derivación paso a paso en `<explore>`, una verificación de errores en `<examine>` y una respuesta limpia en `<response>`. Es adecuado porque fue entrenado específicamente sobre cadenas de pensamiento de estas cuatro áreas.
- Tutoría interactiva con trazabilidad del razonamiento: al exponer la derivación y la autocrítica en bloques separados, un sistema educativo puede mostrar al estudiante no solo la respuesta, sino el proceso y la revisión. El contexto de 40.960 tokens permite arrastrar el historial completo de un problema largo.
- Generación de material docente con verificación incorporada: para producir apuntes o solucionarios de ecuaciones diferenciales, el bloque `<examine>` actúa como una pasada de control de errores antes de la respuesta final, lo que reduce la tasa de derivaciones incorrectas en comparación con un modelo de una sola pasada.
- Prototipado en hardware de consumo: con 2,03 B de parámetros y pesos en safetensors de 4,1 GB, el modelo cabe en GPUs consumer de gama alta y permite iterar localmente sobre pipelines de razonamiento sin depender de infraestructura cloud.
- Investigación en destilación de conocimiento: el pipeline TKD está documentado con hiperparámetros completos y una publicación asociada, por lo que sirve como caso de estudio reproducible para quienes investigan métodos de KD alternativos a la KL estándar.
- Base para fine-tuning vertical: al estar bajo Apache 2.0 y ser un modelo pequeño, puede adaptarse con SFT a dominios concretos (por ejemplo, ingeniería o matemáticas aplicadas) sin los costes de un modelo de 30 B.
- Evaluación comparativa de formatos de razonamiento: el esquema DualMind permite experimentar con prompts que fuercen o supriman las fases de autocrítica, útil para estudiar el efecto del razonamiento estructurado en la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de física en la model card, ni comparaciones cuantitativas con el profesor Qwen3-30B-A3B-Thinking-2507 o con el estudiante base.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 4,1 GB. En BF16 se requieren aproximadamente 4,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para secuencias moderadas. En FP16 el requisito es similar. No se han publicado variantes cuantizadas, por lo que no hay cifras oficiales para INT8 o INT4.
- La caché KV para 40.960 tokens con 28 capas, 8 cabezas KV y dimensión de cabeza de 128 ocupa varios gigabytes adicionales en precisión completa; para aprovechar el contexto máximo conviene usar GPUs con 24 GB o más, o bien cuantización de la caché.
- GPU recomendadas: para contexto completo, A100 40/80 GB o H100; para uso con contexto moderado, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090, RTX 4080 y tarjetas con 12 GB o más para contextos cortos en BF16.
- Opciones de despliegue: transformers (soporte nativo, es la librería declarada), text-generation-inference (el modelo está etiquetado como endpoints_compatible), y previsiblemente vLLM por compatibilidad con la arquitectura Qwen3. No se han publicado pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| TopologicalQwen | 2,03 B | 40.960 | Apache 2.0 | no disponibles | Hugging Face |
| Qwen3-1.7B (base de la familia) | 1,7 B | 32.768 (configuración estándar de Qwen3) | Apache 2.0 | sí, publicados por el equipo Qwen | Hugging Face, Ollama, vLLM |
| Qwen3-30B-A3B-Thinking-2507 (profesor) | 30 B totales, ~3 B activos (MoE) | 262.144 | Apache 2.0 | sí, publicados por el equipo Qwen | Hugging Face |
| Disctil-Qwen3-1.7B (estudiante intermedio) | ~1,7 B | no disponible | Apache 2.0 | no disponibles | Hugging Face |

La comparación directa con Qwen3-1.7B es la más relevante: TopologicalQwen parte de esa familia, amplía el contexto declarado a 40.960 tokens y añade el formato DualMind, pero no publica métricas que permitan verificar si la destilación desde el profesor de 30 B mejora al base en tareas estándar. Frente al profesor, la diferencia de tamaño es de más de un orden de magnitud, con la consiguiente pérdida de capacidad que la metodología TKD pretende mitigar pero no cuantifica públicamente.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia cuantitativa publicada de que la metodología TKD supere a la destilación KL estándar ni de que el modelo iguale o supere a Qwen3-1.7B en tareas generales.
- Especialización estrecha: el entrenamiento se limita a unas 1.599 muestras de física (ecuaciones diferenciales, mecánica, electromagnetismo y relatividad). El rendimiento fuera de ese dominio es incierto y probablemente degradado respecto al base.
- Riesgo de alucinación en derivaciones matemáticas: aunque el bloque `<examine>` está diseñado para autocorregir, no hay garantía de que detecte errores sutiles; el modelo puede producir derivaciones plausibles pero incorrectas.
- Idioma no documentado: no se especifica qué idiomas domina ni la calidad en castellano; el entrenamiento parece centrado en inglés.
- Formato de salida rígido: el modelo espera y produce etiquetas DualMind. Un uso sin ese formato puede degradar la calidad o producir salidas mal estructuradas.
- Sin variantes cuantizadas oficiales: la ausencia de pesos GGUF, AWQ o GPTQ limita el despliegue en entornos con poca VRAM o en herramientas como Ollama sin conversión manual.
- Contexto declarado sin validación: los 40.960 tokens figuran en la model card, pero no se documenta ninguna evaluación de recuperación en contexto largo (needle-in-a-haystack ni similares).
- Linaje "uncensored": el estudiante intermedio se describe como una versión sin censura de Qwen3, lo que puede implicar una menor alineación de seguridad en el modelo final; conviene auditar las respuestas antes de exponerlo a usuarios finales.
- Autoría individual y proyecto de investigación: el modelo lo publica un único autor bajo una LLC, sin el respaldo de un equipo de evaluación consolidado; la trazabilidad de las afirmaciones metodológicas depende del paper citado.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no exime de las obligaciones de atribución ni de las responsabilidades sobre el contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Modelo base (estudiante SFT intermedio): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT
- Estudiante intermedio Disctil-Qwen3-1.7B: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Publicación metodológica "Structure Over Scale": https://doi.org/10.57967/hf/8165
