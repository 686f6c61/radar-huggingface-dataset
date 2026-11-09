# bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step100-LoRA

## Resumen

Qwen3.5-4B-ArgGYM-GRPO-step100-LoRA es un adaptador LoRA de bajo rango entrenado por el usuario bdsaglam sobre el modelo base Qwen/Qwen3.5-4B (revisión `851bf6e`). El adaptador se ha afinado mediante aprendizaje por refuerzo con el algoritmo GRPO, usando la librería verl v0.9.1, sobre ArgGYM, un conjunto de tareas de argumentación formal basadas en teorías ASPIC+ bajo semántica grounded. El objetivo es mejorar la capacidad del modelo base para resolver problemas estructurados de argumentación: ataques, defensas, contraargumentos, cadenas de afirmaciones, construcción de preferencias y consultas de estado semántico.

Se trata de un adaptador de rango 64 y alpha 32 en fp32 que cubre todas las proyecciones de atención, atención lineal y MLP de las 32 capas del modelo de lenguaje, es decir, 248 módulos en total; la torre de visión no se modifica. Este checkpoint corresponde al paso 100, el último de una ejecución de 100 pasos, y se publicó antes de completar su propia evaluación en el conjunto de desarrollo.

Su relevancia radica en que demuestra una mejora sustancial sobre el modelo base en tareas de argumentación formal: en el paso 80 el incremento era de +0,26 en tasa de éxito (IC del 95 % por bootstrap emparejado: +0,20 a +0,32). Es un ejemplo práctico de cómo el RL con GRPO puede especializar un modelo multimodal de 4B en un dominio técnico concreto sin reentrenar todos los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen3.5-4B (atención + atención lineal + MLP en 32 capas; torre de visión sin adaptar) |
| Parámetros totales | No disponible (adaptador LoRA de rango 64 sobre un modelo base de 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el entrenamiento usó un límite de 40.960 tokens de salida y la evaluación hasta 65.536 tokens |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors fp32; el modelo base admite las cuantizaciones habituales de Qwen3.5-4B) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer multimodal con 32 capas de lenguaje que combina atención estándar y atención lineal, más una torre de visión que en este caso no se adapta. El LoRA tiene rango 64 y alpha 32, en fp32, y cubre 248 módulos: todas las proyecciones de atención, atención lineal y MLP del modelo de lenguaje.

El entrenamiento emplea GRPO con verl v0.9.1 sobre ArgGYM, un banco de tareas de argumentación formal (teorías ASPIC+ bajo semántica grounded) que incluye ataque, defensa, ataque/defensa, contraargumento (simple y estricto), cadenas de afirmaciones, construcción de preferencias, consultas de estado y semántica, diagnóstico de derrotas, formalización y perturbación, en niveles de dificultad del 1 al 12. El entrenamiento usa 82 celdas tarea/nivel (8.200 problemas) con un currículo que favorece las celdas que el modelo resuelve aproximadamente la mitad de las veces. La recompensa es 1 para respuesta correcta y 0 en caso contrario; cuatro tareas (status_query, defeat_diagnosis, formalization y perturbation) añaden 0,3 × la fracción correcta de la respuesta. Una completion truncada en el límite de 40.960 tokens obtiene recompensa 0. La optimización usa 18 problemas × 16 muestras por paso, learning rate 3e-5 con decaimiento coseno hasta 3e-6 en 100 pasos, warmup de 3 pasos y sin penalización KL. Los rollouts se muestrean con temperatura 1,0, top-p 0,95, top-k 20 y presence penalty 1,5, y el entrenador calcula sus log-probabilidades tras aplicar la misma máscara top-k/top-p y la misma presence penalty; sin esa coincidencia la entropía derivaba al alza en todas las ejecuciones y el entrenamiento se volvía inestable, mientras que con ella se mantuvo plana durante los 100 pasos.

## Capacidades

- Razonamiento sobre argumentación formal: resolución de ataques, defensas, contraargumentos simples y estrictos, y cadenas de afirmaciones sobre teorías ASPIC+ con semántica grounded.
- Consultas de estado y semántica: determinación del estado de argumentos y consultas semánticas dentro de una teoría de argumentación.
- Construcción de preferencias y diagnóstico de derrotas: identificación de por qué un argumento resulta derrotado.
- Formalización y perturbación: traducción de enunciados a representación formal y análisis de perturbaciones en la teoría.
- Modo thinking activado durante el entrenamiento y recomendado en inferencia.
- Capacidades heredadas del modelo base Qwen3.5-4B (generación de texto, razonamiento, código, matemáticas y visión), aunque no han sido evaluadas tras el ajuste.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no evaluado específicamente; el modo thinking y las respuestas largas (unas 28k tokens de media en dev) sugieren cadenas de razonamiento extensas.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación automática de argumentos jurídicos: el adaptador puede analizar teorías ASPIC+ que modelen normas y excepciones, determinando qué argumentos resultan derrotados y por qué, gracias a su entrenamiento específico en diagnóstico de derrotas y consultas de estado.
- Sistemas de tutoring en lógica y argumentación: el modelo puede generar y evaluar contraargumentos estrictos y simples, lo que permite construir ejercicios interactivos con corrección automática de la estructura argumentativa.
- Verificación de consistencia en bases de conocimiento normativo: dado un conjunto de reglas y preferencias, el adaptador puede responder consultas semánticas sobre qué afirmaciones quedan aceptadas bajo semántica grounded.
- Análisis de debates estructurados: con cadenas de afirmaciones y construcción de preferencias, puede modelar intercambios argumentativos y detectar qué posición prevalece según las preferencias declaradas.
- Formalización asistida de texto argumentativo: la tarea de formalization (con recompensa parcial de 0,3 × fracción correcta) permite usar el modelo para convertir descripciones en lenguaje natural a representaciones formales, con margen para corrección humana posterior.
- Investigación en RL para dominios estructurados: sirve como referencia reproducible de un pipeline GRPO con verl sobre tareas de razonamiento formal, útil para estudiar estabilidad de entropía y diseño de recompensas.
- Pruebas de robustez ante perturbaciones: la tarea de perturbation permite evaluar cómo responde el modelo a modificaciones controladas de una teoría argumentativa, aunque su rendimiento en esta tarea sigue siendo bajo (0,12 en el paso 80).

## Benchmarks y rendimiento

Tasa de éxito en un conjunto de desarrollo reservado de 96 problemas ArgGYM (8 por tarea, niveles 1–8), con 8 muestras por problema y hasta 65.536 tokens de salida:

| Checkpoint | Éxito en dev |
|---|---|
| Qwen3.5-4B (base) | 0,309 |
| Paso 20 | 0,418 |
| Paso 40 | 0,447 |
| Paso 60 | 0,527 |
| Paso 80 | 0,569 |
| Paso 100 (este checkpoint) | No medido todavía |

En el paso 80, la mejora sobre el modelo base era de +0,26 (IC del 95 % por bootstrap emparejado: +0,20 a +0,32). Por tarea, las mayores ganancias en el paso 80 se dieron en attack (0,25 → 0,91), attack/defence (0,33 → 0,86), defence (0,30 → 0,78) y ambas tareas de contraargumento (aproximadamente 0,29 → 0,72–0,78). Las consultas semánticas mejoraron de 0,14 a 0,34 y la formalización de 0,12 a 0,28; la construcción de preferencias, el diagnóstico de derrotas y las cadenas de afirmaciones no mejoraron, y la perturbación se mantiene baja (0,12). No se han publicado resultados en el conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; el modelo base Qwen3.5-4B en bfloat16 requiere aproximadamente 8 GB de pesos, más el adaptador LoRA (repo de 0,5 GB) y la caché KV para contextos largos.
- Contexto de salida: el autor recomienda reservar al menos 40k–65k tokens de salida, lo que incrementa notablemente el consumo de memoria de la caché KV respecto a un uso convencional.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del modelo base, una GPU con 16–24 GB (RTX 4090, L40S, A10G) sería suficiente para bfloat16 en contextos moderados, y A100/H100 para contextos largos o mayor throughput.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 (24 GB) para el modelo base en bfloat16 con contextos moderados; no confirmado para los contextos de 40k–65k tokens recomendados.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained`) y vLLM con `--enable-lora --max-lora-rank 64`, sirviendo el adaptador como módulo LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento ArgGYM (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-ArgGYM-GRPO-step100-LoRA | 4B (adaptador LoRA) | No disponible (salida hasta 65k) | No medido en el paso 100; 0,569 en el paso 80 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base) | 4B | No disponible | 0,309 | Apache 2.0 (según modelo base) | Hugging Face |
| Qwen3.5-4B-ArgGYM-GRPO-step60-LoRA | 4B (adaptador LoRA) | No disponible | 0,527 | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos comparables en tareas de argumentación formal en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento de este checkpoint exacto (paso 100) no se ha medido todavía; las cifras publicadas llegan hasta el paso 80.
- No se han publicado resultados en el conjunto de test.
- El entrenamiento continúa desde este checkpoint, por lo que un checkpoint posterior podría reemplazarlo.
- El conjunto de desarrollo es pequeño (96 problemas), por lo que las cifras por tarea tienen un ruido aproximado de ±0,1.
- El modelo se ha entrenado únicamente en ArgGYM; su comportamiento en otras tareas no se ha evaluado y podría degradarse respecto al modelo base.
- Las respuestas son muy largas (unas 28k tokens de media en dev), lo que exige presupuestos de salida de al menos 40k–65k tokens y encarece la inferencia.
- No hay información sobre sesgos, riesgo de alucinación o cobertura idiomática específica del adaptador.
- La licencia Apache 2.0 permite uso comercial, pero al ser un adaptador sobre Qwen3.5-4B conviene verificar también las condiciones del modelo base.
- El adaptador no modifica la torre de visión, por lo que las capacidades visuales no se han especializado en argumentación.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step100-LoRA
- Checkpoint anterior (paso 60): https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step60-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Librería verl: https://github.com/volcengine/verl
