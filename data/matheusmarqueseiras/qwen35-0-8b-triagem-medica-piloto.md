# MatheusMarquesEiras/qwen35-0.8b-triagem-medica-piloto

## Resumen

El modelo `MatheusMarquesEiras/qwen35-0.8b-triagem-medica-piloto` es un adaptador LoRA (QLoRA, 4-bit) entrenado sobre el modelo base `Qwen/Qwen3.5-0.8B` para clasificar la especialidad médica más adecuada a partir de la queja de un paciente escrita en texto libre, en portugués brasileño. El adaptador fue desarrollado por Matheus Marques Eiras como parte de un trabajo de conclusión de curso (TCC) en el Instituto Federal do Paraná, con orientación de João Paulo Orlando, y se publica como piloto para validar un pipeline multi-modelo antes de entrenar con el dataset completo.

El modelo resuelve un problema de triaje médico automatizado: dado un texto de queja, asigna una de 10 especialidades (dentista, dermatólogo, ginecólogo, oftalmólogo, ortopedista, otorrino, psicólogo, psicoanalista, psiquiatra, urólogo). Es relevante porque demuestra que un modelo pequeño (0.8B) con ajuste fino eficiente (QLoRA) puede abordar tareas de clasificación clínica con recursos modestos, aunque este checkpoint concreto es un piloto limitado a 500 ejemplos por clase y no debe usarse en producción sin evaluación adicional.

La arquitectura subyacente es la del Qwen3.5-0.8B, que según la documentación disponible emplea una arquitectura híbrida de "gated delta networks" con una ventana de contexto de 262K tokens. Sin embargo, el adaptador se entrenó con una longitud máxima de secuencia de 1024 tokens. El checkpoint publicado es solo el adaptador PEFT, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-0.8B (transformer híbrido con gated delta networks) |
| Parametros totales | Adaptador: 6.389.760 (modelo base congelado: ~0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Modelo base: 262K tokens; adaptador entrenado con max_seq_length=1024 |
| Tipos de cuantizacion | Adaptador en bf16; carga en 4-bit NF4 mediante Unsloth (QLoRA) |
| Idiomas soportados | Portugués (pt) — específicamente portugués brasileño |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA sobre el modelo base Qwen3.5-0.8B, que queda congelado y cuantizado en NF4 de 4 bits. Los adaptadores LoRA se aplican a las proyecciones de atención (q/k/v/o) y a las capas del MLP (gate/up/down), con rango 16 y alpha 32, lo que resulta en 6.389.760 parámetros entrenables. El entrenamiento se realiza en precisión bf16 con el optimizador AdamW de 8 bits, batch efectivo de 32 (batch 4 × acumulación 8), learning rate 2e-4 con programación coseno, y 3 épocas (375 pasos).

Los datos provienen del corpus público `AKCIT/MedPT`, que contiene 384.095 pares de pregunta y respuesta médica en portugués brasileño. Para este piloto se usaron 500 ejemplos por clase, con un split estratificado 80/10/10 y semilla 42, resultando en 4.000 ejemplos de entrenamiento, 500 de validación y 500 de prueba. El entrenamiento se realizó en una RTX 4070 de 12 GB, con un pico de VRAM de 13,2 GB y una duración de 13 minutos. No se aplicó RLHF ni DPO; el método es exclusivamente SFT (supervised fine-tuning).

## Capacidades

- Clasificación de especialidad médica en portugués brasileño a partir de texto libre de queja del paciente, entre 10 clases fijas.
- Generación de texto limitada a la tarea de clasificación: el sistema prompt instruye al modelo a responder únicamente con el nombre de la especialidad, sin explicaciones adicionales.
- Soporte de chat conversacional mediante el template de chat de Qwen, con la advertencia de que debe desactivarse el modo *thinking* (`enable_thinking=False`) para evitar bucles infinitos.
- Capacidad multilingüe heredada del modelo base Qwen3.5-0.8B, aunque el adaptador está específicamente entrenado para portugués brasileño.
- No soporta tool calling ni funciones de agente; es un clasificador de una sola pasada.
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Triaje médico inicial en aplicaciones de salud digital: el modelo puede recibir la queja del paciente y sugerir la especialidad adecuada, facilitando la derivación en sistemas de citas médicas. Su tamaño pequeño permite integrarlo en aplicaciones móviles o web con baja latencia.
- Filtro previo en chatbots de atención sanitaria: antes de conectar con un especialista humano, el modelo clasifica la consulta y enruta la conversación al departamento correcto, reduciendo el tiempo de espera.
- Soporte a la gestión de colas en clínicas y hospitales: dado un lote de quejas escritas, el modelo puede agruparlas por especialidad para priorizar la asignación de recursos médicos.
- Formación y demostración en entornos académicos: sirve como ejemplo práctico de ajuste fino QLoRA sobre un modelo pequeño para tareas clínicas, útil en cursos de procesamiento de lenguaje natural aplicado a salud.
- Prototipado de sistemas de triaje en portugués brasileño: como piloto, permite validar el pipeline de entrenamiento y evaluación antes de escalar a datasets completos, como el que alcanzó un F1 macro de 0,7911 en un experimento previo.
- Evaluación comparativa de modelos pequeños para clasificación clínica: el adaptador puede usarse como punto de referencia para medir el rendimiento de modelos de 0.8B frente a alternativas mayores en la misma tarea.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al entrenamiento piloto y a un experimento previo fuera de esta pipeline. No se han publicado métricas de acurácia ni F1 macro sobre el conjunto de prueba de este checkpoint concreto.

| Métrica | Valor |
|---|---|
| Loss final de entrenamiento (piloto) | 0,9443 |
| Eval loss (época 3) | 0,9370 |
| F1 macro (Experimento 02, dataset completo de 145K ejemplos, fuera de esta pipeline) | 0,7911 |
| Duración del entrenamiento | 13 minutos |
| Pico de VRAM | 13,2 GB |

No se dispone de resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este adaptador. El único dato de rendimiento comparable es el F1 macro del Experimento 02, que no es directamente comparable con los números del piloto.

## Requisitos de hardware

- Inferencia: al ser un adaptador sobre un modelo base de 0,8B, la inferencia es viable en GPU con 4-6 GB de VRAM en cuantización 4-bit, y también en CPU con suficiente RAM (aunque con mayor latencia).
- GPU recomendada: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070). El entrenamiento piloto se realizó en una RTX 4070 de 12 GB con QLoRA.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de las GPU de consumo actuales, incluso en tarjetas integradas si se usa cuantización 4-bit.
- Opciones de despliegue: el ejemplo de la model card usa Unsloth (`FastLanguageModel`). También puede cargarse con la librería PEFT de Hugging Face sobre el modelo base Qwen. Para entornos de producción, puede servirse con vLLM o TGI si se fusiona el adaptador con el modelo base, o mediante llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por consulta en GPU moderna, pero estos datos no están confirmados.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de triaje médico en portugués. Como referencia, se puede comparar con el modelo base sin ajustar y con otros adaptadores del mismo proyecto (por ejemplo, `qwen35-2b-triagem-medica-piloto`, que usa Qwen3.5-2B como base). La comparación se limita a parámetros y contexto:

| Modelo | Base | Parámetros del adaptador | Contexto del adaptador | Licencia |
|---|---|---|---|---|
| `qwen35-0.8b-triagem-medica-piloto` | Qwen3.5-0.8B | 6,39M | 1024 (entrenamiento) | No disponible |
| `qwen35-2b-triagem-medica-piloto` (referencia) | Qwen3.5-2B | No disponible | No disponible | No disponible |
| Qwen/Qwen3.5-0.8B (base) | - | - | 262K | No disponible (consultar HF) |

No hay datos de rendimiento comparativo entre estos adaptadores en la información disponible.

## Limitaciones y advertencias

- Checkpoint piloto: entrenado solo con 500 ejemplos por clase (4.000 en total), por lo que su rendimiento real en producción puede ser significativamente inferior al del modelo entrenado con el dataset completo (F1 macro 0,7911 en un experimento previo).
- Sesgo de clase: la clase "Psicólogo — Psicanalista" tiende a ser absorbida por la clase "Psicólogo" debido a la sobreposición semántica casi total entre ambas, lo que puede reducir la precisión en esa categoría.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo, puede producir respuestas incorrectas o fuera de las clases definidas si el prompt no se controla adecuadamente.
- Uso clínico: es un modelo de triaje, no de diagnóstico. No debe utilizarse para decisiones clínicas sin supervisión de un profesional de salud.
- Modo *thinking*: el modelo entra en un bucle infinito si se activa el modo de razonamiento (`enable_thinking=True`); debe desactivarse siempre.
- Limitaciones de idioma: entrenado exclusivamente en portugués brasileño; no se recomienda su uso en otros idiomas.
- Licencia no especificada: la licencia del adaptador no está disponible; antes de un uso comercial, debe consultarse la licencia del modelo base Qwen3.5-0.8B y la del dataset MedPT.
- Sin evaluación de prueba completa: la acurácia y el F1 macro sobre el conjunto de test de este checkpoint no se han publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatheusMarquesEiras/qwen35-0.8b-triagem-medica-piloto
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo relacionado del mismo proyecto (Qwen3.5-2B): https://huggingface.co/MatheusMarquesEiras/qwen35-2b-triagem-medica-piloto
- Dataset AKCIT/MedPT: https://huggingface.co/datasets/AKCIT/MedPT
- Referencia de Qwen3.5-0.8B en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Receta de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
