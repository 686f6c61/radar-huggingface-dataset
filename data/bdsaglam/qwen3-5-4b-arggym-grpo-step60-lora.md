# bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step60-LoRA

## Resumen

Qwen3.5-4B-ArgGYM-GRPO-step60-LoRA es un adaptador LoRA de bajo rango (rank 64, alpha 32) entrenado sobre el modelo base Qwen/Qwen3.5-4B mediante aprendizaje por refuerzo con el algoritmo GRPO. Lo desarrolla el autor independiente bdsaglam y su propósito es especializar un modelo multimodal de 4 000 millones de parámetros en tareas de argumentación formal, concretamente en teorías ASPIC+ bajo semántica grounded. El adaptador se publica como checkpoint intermedio (paso 60 de una ejecución de 100 pasos) y su relevancia radica en demostrar que el RL con recompensas verificables puede mejorar de forma sustancial habilidades de razonamiento estructurado en un modelo pequeño.

El modelo base Qwen3.5-4B es un modelo denso de 4B parámetros con arquitectura híbrida Gated DeltaNet (proporción 3:1 entre atención lineal y atención softmax completa), soporte nativo de visión y una longitud de contexto de 262 144 tokens. Sobre esta base, el adaptador cubre las 248 proyecciones de atención, atención lineal y MLP de las 32 capas del modelo de lenguaje, dejando intacta la torre de visión.

La contribución principal es el conjunto de datos ArgGYM, un banco de pruebas de argumentación formal con 82 celdas tarea/nivel y 8 200 problemas, sobre el que el adaptador mejora la tasa de éxito en el conjunto de desarrollo del 0,309 del modelo base al 0,527 en el paso 60, con un intervalo de confianza bootstrap del 95 % de +0,17 a +0,27.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 64, alpha 32, fp32) sobre transformer híbrido Gated DeltaNet con atención lineal y softmax en proporción 3:1 |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens en el modelo base; presupuesto de salida recomendado de 40 000 a 65 000 tokens |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones estándar (no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo fusionado se publica en bf16 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base con arquitectura híbrida Gated DeltaNet, que combina capas de atención lineal con capas de atención softmax completa en una proporción 3:1, e incluye una torre de visión para entrada multimodal. El LoRA de rango 64 y alpha 32 se entrena únicamente sobre el modelo de lenguaje, abarcando las 248 proyecciones de atención, atención lineal y MLP de las 32 capas; la torre de visión no se modifica.

El entrenamiento emplea GRPO con la librería verl v0.9.1 sobre el conjunto ArgGYM, compuesto por tareas de argumentación formal ASPIC+ bajo semántica grounded: ataque, defensa, ataque/defensa, contraargumento (simple y estricto), cadenas de afirmaciones, construcción de preferencias, consultas de estado y semántica, diagnóstico de derrotas, formalización y perturbación, en niveles de dificultad del 1 al 12. Se usan 18 problemas con 16 muestras por paso, tasa de aprendizaje 3e-5 con decaimiento coseno hasta 3e-6, calentamiento de 3 pasos y sin penalización KL. La recompensa es 1 por respuesta correcta y 0 en caso contrario, con recompensa parcial de 0,3 × fracción correcta en cuatro tareas (status_query, defeat_diagnosis, formalization y perturbation); una completación truncada en el límite de 40 960 tokens recibe 0. El currículo de entrenamiento prioriza las celdas en las que el modelo acierta aproximadamente la mitad de las veces.

Una innovación técnica destacable documentada por el autor es la coincidencia exacta entre el muestreo de rollouts y el cálculo de log-probabilidades del entrenador: ambos aplican temperatura 1,0, top-p 0,95, top-k 20 y penalización de presencia 1,5. Sin esta coincidencia, la entropía derivaba al alza en todas las ejecuciones y el entrenamiento se volvía inestable; con ella, la entropía se mantuvo plana durante los 60 pasos.

## Capacidades

- Razonamiento sobre argumentación formal: resolución de consultas de estado, semántica, diagnóstico de derrotas, construcción de preferencias y cadenas de afirmaciones en teorías ASPIC+.
- Análisis de ataques y defensas entre argumentos, incluidos contraargumentos simples y estrictos.
- Formalización de argumentos y diagnóstico de perturbaciones en el marco ASPIC+.
- Modo de razonamiento (thinking mode) activado durante el entrenamiento y recomendado para la inferencia.
- Capacidades heredadas del modelo base: generación de texto, razonamiento general y entrada multimodal de visión (la torre de visión no se adapta, por lo que conserva el comportamiento del base).
- Soporte de tool calling y function calling: no disponible en la información proporcionada para el adaptador; el modelo base no lo documenta en las fuentes consultadas.
- Soporte de agentes y razonamiento multi-paso: no evaluado en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Verificación automática de argumentos jurídicos: el adaptador puede evaluar si un argumento ataca o defiende a otro dentro de una teoría ASPIC+, útil en sistemas de apoyo a la revisión de escritos legales donde la estructura argumentativa debe ser formalmente válida.
- Evaluación de ensayos y debates académicos: permite determinar el estado (aceptado, rechazado, indeciso) de afirmaciones dentro de un marco de argumentación, lo que facilita la corrección automatizada de ejercicios de lógica informal.
- Construcción de bases de conocimiento argumentativas: dado un conjunto de premisas y reglas, el modelo formaliza los argumentos y sus relaciones de ataque, alimentando grafos de argumentación para sistemas de razonamiento posterior.
- Diagnóstico de derrotas en sistemas expertos: identifica por qué un argumento queda derrotado por otro, lo que resulta útil en motores de decisión basados en reglas con excepciones.
- Investigación en RL con recompensas verificables: el adaptador y su receta de entrenamiento sirven como referencia reproducible para estudiar la estabilidad de GRPO con LoRA en tareas de razonamiento estructurado.
- Generación de datos sintéticos de argumentación: el modelo puede producir cadenas de ataque y defensa etiquetadas para ampliar corpus de entrenamiento en tareas de argumentación formal.
- Análisis de políticas y normativas: la formalización de reglas y excepciones permite comprobar la coherencia interna de un conjunto de normas expresadas como teoría ASPIC+.

## Benchmarks y rendimiento

Resultados sobre un conjunto de desarrollo reservado de 96 problemas ArgGYM (8 por tarea, niveles 1 a 8), con 8 muestras por problema y hasta 65 536 tokens de salida:

| Modelo | Éxito en dev |
|---|---|
| Qwen3.5-4B (base) | 0,309 |
| Paso 20 | 0,418 |
| Paso 40 | 0,447 |
| Paso 60 (este checkpoint) | 0,527 |

La mejora sobre el modelo base es de +0,22 (intervalo de confianza bootstrap del 95 %: +0,17 a +0,27). Por tarea, las mayores ganancias se dan en ataque (0,25 a 0,80), ataque/defensa (0,33 a 0,80), defensa (0,30 a 0,75) y ambas tareas de contraargumento (aproximadamente 0,29 a 0,72–0,75). La construcción de preferencias, el diagnóstico de derrotas y las cadenas de afirmaciones no mejoran, y la perturbación se mantiene cerca de cero. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; el modelo base de 4B en bf16 requiere aproximadamente 8 GB de VRAM, y en cuantización de 4 bits alrededor de 2,5–3 GB (estimación orientativa, no confirmada en las fuentes).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: el modelo base de 4B es apto para GPU de consumo con suficiente VRAM; el adaptador añade una sobrecarga mínima (0,5 GB de repo).
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained`), y vLLM con `--enable-lora --max-lora-rank 64` sirviendo el adaptador como módulo LoRA.
- Latencia y throughput: no disponibles. El autor advierte que las respuestas son largas (unas 29 000 tokens de media en dev), por lo que se debe presupuestar al menos 40 000–65 000 tokens de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-ArgGYM-GRPO-step60-LoRA | 4B (base) + LoRA r64 | 262 144 | Argumentación formal ASPIC+ | Apache 2.0 | Hugging Face (adaptador y fusión bf16) |
| Qwen3.5-4B (base) | 4B | 262 144 | Generalista multimodal | No disponible en las fuentes | Hugging Face |
| Alternativas especializadas en argumentación de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros adaptadores o modelos comparables en la misma categoría de argumentación formal.

## Limitaciones y advertencias

- Es un checkpoint intermedio de una ejecución de 100 pasos aún en curso; un checkpoint posterior podría sustituirlo.
- El conjunto de desarrollo es pequeño (96 problemas), por lo que las cifras por tarea son ruidosas (±0,1). No se han publicado resultados en conjunto de test.
- El modelo se entrenó únicamente con ArgGYM; su comportamiento en otras tareas no se ha evaluado y podría degradarse respecto al modelo base.
- Las respuestas son muy largas (unas 29 000 tokens de media en dev), lo que obliga a presupuestar entre 40 000 y 65 000 tokens de salida y encarece la inferencia.
- La perturbación se mantiene cerca de cero y varias tareas (preferencias, diagnóstico de derrotas, cadenas de afirmaciones) no muestran mejora.
- Riesgo de alucinación: no evaluado en la información proporcionada; al ser un modelo de razonamiento formal, las respuestas incorrectas pueden presentarse con estructura plausible.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-4B, no confirmada en las fuentes consultadas.
- El adaptador no modifica la torre de visión; las capacidades visuales son las del modelo base sin especializar.

## Enlaces

- Adaptador LoRA: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step60-LoRA
- Modelo fusionado en bf16: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step60
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de verl: https://github.com/volcengine/verl
- Ficha del modelo base en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Benchmarks y contexto del modelo base: https://llm-stats.com/models/qwen3.5-4b
