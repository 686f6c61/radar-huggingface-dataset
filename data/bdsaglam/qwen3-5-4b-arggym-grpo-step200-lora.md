# bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step200-LoRA

## Resumen

Qwen3.5-4B-ArgGYM-GRPO-step200-LoRA es un adaptador LoRA desarrollado por el usuario bdsaglam sobre el modelo base Qwen/Qwen3.5-4B (revisión `851bf6e`), entrenado mediante aprendizaje por refuerzo con el algoritmo GRPO para resolver tareas de argumentación formal. El adaptador se ha ajustado sobre ArgGYM, un conjunto de tareas de argumentación formal basadas en teorías ASPIC+ con semántica grounded, que abarca ataques, defensas, contraargumentos, cadenas de afirmaciones, construcción de preferencias, diagnóstico de derrotas, formalización y perturbación en 12 niveles de dificultad.

El modelo resuelve un problema muy específico: mejorar la capacidad de un LLM de 4 000 millones de parámetros para razonar sobre estructuras argumentativas formales, una tarea en la que los modelos generalistas rinden por debajo del 31 % de acierto. Tras 200 pasos de entrenamiento con GRPO, el adaptador eleva la tasa de éxito en el conjunto de desarrollo del 0,309 al 0,645, una mejora de +0,34 puntos absolutos con un intervalo de confianza del 95 % de +0,27 a +0,41.

Es relevante porque demuestra que el ajuste fino con RL sobre un dominio formal estrecho puede duplicar el rendimiento de un modelo pequeño, manteniendo la licencia Apache 2.0 y un tamaño de repositorio de solo 0,5 GB, lo que lo hace desplegable sobre el modelo base sin necesidad de infraestructura adicional significativa. El adaptador cubre las 248 proyecciones de atención, atención lineal y MLP de las 32 capas del modelo de lenguaje, dejando intacta la torre de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rank 64, alpha 32, fp32) sobre transformer Qwen3.5-4B con atención lineal y torre de visión |
| Parámetros totales | No disponible (el adaptador LoRA tiene 248 módulos sobre un modelo base de 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el entrenamiento usó un límite de 40 960 tokens de salida |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen3.5-4B) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer multimodal con atención lineal y torre de visión. El LoRA tiene rango 64 y alpha 32 en fp32, y cubre todas las proyecciones de atención, atención lineal y MLP de las 32 capas del modelo de lenguaje: 248 módulos en total. La torre de visión no se adapta. El entrenamiento se realizó con GRPO mediante la librería verl v0.9.1, con el modo thinking activado en el modelo base.

Los datos provienen de ArgGYM, un benchmark de tareas de argumentación formal (teorías ASPIC+ bajo semántica grounded) con 82 celdas tarea/nivel y 8 200 problemas, organizados en 12 niveles de dificultad. El currículo de entrenamiento favorece las celdas que el modelo resuelve aproximadamente la mitad de las veces. La recompensa es 1 para respuesta correcta y 0 en caso contrario; cuatro tareas (status_query, defeat_diagnosis, formalization y perturbation) pagan además 0,3 × la fracción correcta de la respuesta. Una completion truncada en el límite de 40 960 tokens obtiene recompensa 0. La optimización usa 18 problemas × 16 muestras por paso, sin penalización KL. Los pasos 1-100 usan learning rate 3e-5 con decaimiento coseno a 3e-6 y 3 pasos de warmup; los pasos 101-200 se reanudan desde el estado del adaptador y del optimizador del paso 100 con learning rate 1e-5, sin warmup y schedule coseno hacia 1e-6 sobre 200 pasos (9,1e-6 en el paso 140 y 5,4e-6 en el paso 200). Los rollouts se muestrean con temperatura 1,0, top-p 0,95, top-k 20 y presence penalty 1,5, y el entrenador calcula sus log-probabilidades tras aplicar la misma máscara de presence penalty y top-k/top-p; sin esta coincidencia la entropía derivaba al alza en todas las ejecuciones y los entrenamientos se volvían inestables. Con ella, la entropía se mantuvo entre 0,51 y 0,61 durante los pasos 101-200, y el 2,8 % de las completions de entrenamiento alcanzaron el límite de tokens.

## Capacidades

- Razonamiento sobre argumentación formal: evaluación de ataques, defensas, contraargumentos (simples y estrictos), cadenas de afirmaciones, construcción de preferencias, consultas de estado y semántica, diagnóstico de derrotas, formalización y perturbación de teorías ASPIC+ bajo semántica grounded.
- Modo thinking activado durante el entrenamiento, lo que produce cadenas de razonamiento extensas antes de la respuesta final.
- Capacidad multimodal heredada del modelo base Qwen3.5-4B (torre de visión no adaptada, por lo que sus capacidades visuales no se han entrenado específicamente para esta tarea).
- Soporte de tool calling y function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el modo thinking y las cadenas largas de razonamiento son compatibles con flujos multi-paso.
- Capacidades multilingües: no disponibles (los idiomas no se especifican en la ficha).
- Generación de texto, código y matemáticas: no evaluadas en esta ficha; el adaptador está especializado exclusivamente en argumentación formal.

## Casos de uso

- Evaluación automática de argumentos jurídicos: el modelo puede analizar teorías ASPIC+ que representen normas y excepciones legales, determinar qué argumentos derrotan a cuáles bajo semántica grounded y diagnosticar por qué una conclusión queda derrotada, gracias a su entrenamiento específico en attack, defence y defeat_diagnosis.
- Verificación de sistemas de argumentación en investigación: investigadores que construyan marcos argumentativos formales pueden usar el adaptador para comprobar la coherencia de sus teorías, generar contraargumentos estrictos y validar la formalización de reglas ASPIC+ antes de publicar o desplegar un sistema.
- Docencia en lógica y argumentación: el modelo puede resolver ejercicios de los 12 niveles de dificultad de ArgGYM, explicar cadenas de ataque y defensa y servir como tutor que genera y evalúa problemas de argumentación formal con razonamiento paso a paso.
- Construcción de preferencias en sistemas de decisión: dado un conjunto de argumentos con preferencias, el adaptador puede construir el orden de preferencias, calcular el estado de cada argumento y responder consultas de semántica, lo que resulta útil en sistemas expertos que deben justificar decisiones.
- Auditoría de bases de conocimiento argumentativas: el modelo puede detectar perturbaciones en teorías ASPIC+ (cambios en reglas o preferencias) y evaluar su impacto en la aceptabilidad de los argumentos, una tarea con recompensa parcial que el adaptador mejora notablemente respecto al modelo base (0,33 frente a 0,12 en el paso 80).
- Generación de contraargumentos en sistemas de debate automatizado: con una tasa de éxito del 0,95 en contraargumentos y 0,91 en contraargumentos estrictos, el adaptador puede integrarse en pipelines de debate o deliberación donde se requiera refutar posiciones de forma formalmente válida.
- Investigación en RL para razonamiento formal: el adaptador y sus checkpoints intermedios (pasos 20 a 200) sirven como referencia reproducible para estudiar la dinámica de GRPO con LoRA en tareas de razonamiento estructurado, incluyendo el efecto del currículo y de la coincidencia de máscaras de muestreo.

## Benchmarks y rendimiento

Tasa de éxito en un conjunto de desarrollo reservado de 96 problemas ArgGYM (8 por tarea, niveles 1-8), 8 muestras por problema, con hasta 65 536 tokens de salida:

| Modelo / checkpoint | Éxito en dev |
|---|---|
| Qwen3.5-4B (base) | 0,309 |
| Paso 20 | 0,418 |
| Paso 40 | 0,447 |
| Paso 60 | 0,527 |
| Paso 80 | 0,569 |
| Paso 100 | 0,539 |
| Paso 120 | 0,572 |
| Paso 140 | 0,613 |
| Paso 160 | 0,611 |
| Paso 180 | 0,641 |
| **Paso 200 (este checkpoint)** | **0,645** |

La ganancia sobre el modelo base es de +0,34 (intervalo de confianza bootstrap pareado del 95 %: +0,27 a +0,41). Sobre el paso 140 es de +0,03 (IC +0,00 a +0,06); los pasos 180 y 200 están empatados (+0,004, IC −0,03 a +0,03). Por tarea, el paso 200 obtiene los valores más altos en attack (0,98), attack/defence (0,97), counter-argument (0,95), defence (0,94) y strict counter-argument (0,91). Perturbation (0,33) y formalization (0,39) son las mayores ganancias tardías respecto al paso 80 (0,12 y 0,28). Semantics queries (0,22) y claim chains (0,66) quedan por debajo de los valores del paso 80 (0,34 y 0,75). Defeat diagnosis (0,38) y preference construction (0,45) permanecen cerca del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,5 GB; el modelo base Qwen3.5-4B en bfloat16 requiere aproximadamente 8 GB, por lo que el conjunto necesita alrededor de 8,5-9 GB de VRAM en precisión completa.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en bfloat16 sin cuantizar; GPUs con 12 GB o más para el modelo base cuantizado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con margen amplio; en GPUs de 12 GB como la RTX 3060 o 4070 requiere cuantización del modelo base.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained`), vLLM con `--enable-lora --max-lora-rank 64` pasando el adaptador como módulo LoRA; llama.cpp y Ollama no se mencionan en la información disponible para este adaptador.
- Latencia y throughput: no disponibles. Las respuestas son largas (unas 25 000 tokens de media en dev), por lo que se recomienda reservar al menos 40 000-65 000 tokens de salida, lo que implica latencias elevadas por consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento ArgGYM (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-ArgGYM-GRPO-step200-LoRA | 4B (LoRA rank 64) | No disponible (entrenado con 40 960 tokens de salida) | 0,645 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.5-4B (base) | 4B | No disponible | 0,309 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B-ArgGYM-GRPO-step140-LoRA | 4B (LoRA rank 64) | No disponible | 0,613 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B-ArgGYM-GRPO-step80-LoRA | 4B (LoRA rank 64) | No disponible | 0,569 | Apache 2.0 | Hugging Face |

No se dispone de comparación con otros modelos de argumentación formal de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los resultados en el conjunto de test de este checkpoint aún no están publicados en la model card.
- El conjunto de desarrollo es pequeño (96 problemas), por lo que las cifras por tarea tienen un ruido de ±0,1.
- El modelo se entrenó únicamente con ArgGYM; su comportamiento en otras tareas no se ha evaluado.
- Las respuestas son muy largas (unas 25 000 tokens de media en dev), lo que exige reservar al menos 40 000-65 000 tokens de salida y encarece la inferencia.
- Riesgo de alucinación en tareas fuera de la argumentación formal: no evaluado, pero el adaptador está especializado y no se ha validado su comportamiento general.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto o idioma: los idiomas soportados no se especifican; el entrenamiento usó un límite de 40 960 tokens de salida, y las completions truncadas en ese límite reciben recompensa 0 durante el entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-4B y el cumplimiento de sus términos.
- Caveat para producción: el adaptador requiere servir el modelo base con soporte LoRA (vLLM con `--enable-lora --max-lora-rank 64`) y muestrear con temperatura 1,0, top-p 0,95, top-k 20 y presence penalty 1,5 para reproducir el comportamiento entrenado; desviarse de estos parámetros puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step200-LoRA
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint del paso 140: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step140-LoRA
- Checkpoint del paso 60: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step60-LoRA
- Checkpoint del paso 80: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step80-LoRA
- Checkpoint del paso 100: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step100-LoRA
- Librería verl: https://github.com/volcengine/verl
