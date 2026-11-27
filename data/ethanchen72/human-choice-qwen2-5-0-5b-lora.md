# EthanChen72/human-choice-qwen2.5-0.5b-lora

## Resumen

Human-choice-qwen2.5-0.5b-lora es un adaptador LoRA (Low-Rank Adaptation) desarrollado por EthanChen72 que se aplica sobre el modelo base Qwen/Qwen2.5-0.5B. Su propósito es predecir las elecciones que toman las personas en experimentos de psicología, siguiendo el enfoque del modelo Centaur (Binz et al.) pero a una escala mucho menor. El adaptador lee una transcripción de un experimento y asigna probabilidades a la elección que la persona realiza a continuación, entrenándose únicamente sobre las elecciones humanas y no sobre el texto del experimento.

El modelo se enmarca en el campo de la ciencia cognitiva computacional y el modelado del comportamiento humano. Frente a Centaur, que es un modelo de 70B parámetros entrenado sobre la totalidad de Psych-101, este adaptador opera con menos de mil millones de parámetros y una muestra reducida del dataset, por lo que su capacidad predictiva es considerablemente inferior. Su relevancia radica en servir como herramienta ligera y reproducible para investigar el modelado de decisiones humanas en tareas de laboratorio y, potencialmente, en contextos cotidianos mediante la integración con PaySim.

El adaptador tiene un tamaño de repositorio de 0.0 GB, se distribuye bajo licencia Apache-2.0 y está etiquetado únicamente para el idioma inglés. No dispone de pipeline declarado ni de descargas o valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer decoder-only Qwen2.5-0.5B |
| Parametros totales | 0.5B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros (rank 16 en todas las capas lineales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2048 tokens por transcripción durante el entrenamiento; contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA de rango 16 aplicado a todas las capas lineales del modelo base Qwen2.5-0.5B, un transformer decoder-only de 0.5B parámetros. El entrenamiento se realizó durante 1 época con una tasa de aprendizaje de 0.0002, tamaño de lote efectivo de 16 y hasta 2048 tokens por transcripción (las transcripciones más largas se truncan al final). Se completaron 38 pasos de optimización con una pérdida final de entrenamiento de 0.778, en 43.3 minutos sobre una GPU Tesla T4.

Los datos de entrenamiento consisten en 607 transcripciones muestreadas de Psych-101 (160 experimentos), sin datos de PaySim, con un total de 52.869 tokens de elección. El modelo se entrena exclusivamente sobre las elecciones de las personas, no sobre el texto del experimento. La evaluación se realizó sobre participantes no vistos durante el entrenamiento: 10.628 elecciones de 139 participantes. No se menciona el uso de RLHF ni DPO en la información disponible.

## Capacidades

- Predicción de elecciones humanas: asigna probabilidades a la opción que una persona elegirá a continuación dado un transcript de experimento psicológico.
- Modelado de decisiones en tareas de laboratorio: entrenado sobre experimentos de psicología del dataset Psych-101.
- Evaluación de decisiones cotidianas: mediante su integración en PaySim, puede probarse sobre respuestas sí/no a propuestas laborales registradas en el mismo formato de transcripción.
- Procesamiento de transcripciones de hasta 2048 tokens.
- Trabajo exclusivamente en inglés.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento (thinking mode) en la información disponible.

## Casos de uso

- Investigación en ciencia cognitiva: el adaptador permite estimar la verosimilitud de elecciones humanas en experimentos de laboratorio, sirviendo como línea base ligera frente a modelos mayores como Centaur para estudiar tendencias de decisión.
- Evaluación de modelos de comportamiento a bajo coste: al ejecutarse sobre un modelo de 0.5B, puede desplegarse en hardware modesto para iterar rápidamente en experimentos de modelado de decisiones sin requerir GPUs de gran capacidad.
- Integración en PaySim para decisiones laborales: PaySim registra respuestas sí/no a propuestas de trabajo en el formato de Psych-101, lo que permite probar el modelo sobre decisiones cotidianas y comparar su comportamiento con el de tareas de laboratorio.
- Análisis de simulaciones de negociación salarial: en el contexto de PaySim, el modelo puede emplearse para modelar la probabilidad de aceptación de propuestas de reparto de propinas o intercambios de turnos, siempre como herramienta de investigación y no para decidir sobre personas reales.
- Docencia y reproducción de experimentos: el código de entrenamiento y evaluación está disponible en el repositorio de GitHub, lo que facilita reproducir el ajuste LoRA y estudiar el efecto de la escala en el modelado cognitivo.
- Comparación metodológica: sirve para contrastar el enfoque de ajuste LoRA de bajo rango sobre modelos pequeños frente al entrenamiento completo de modelos grandes en la predicción de elecciones humanas.

## Benchmarks y rendimiento

| Modelo | NLL por elección (menor es mejor) |
|---|---|
| Qwen/Qwen2.5-0.5B (antes del ajuste) | 0.9899 |
| Este adaptador (después del ajuste) | 0.8414 |

Evaluación sobre participantes no vistos de Psych-101: 10.628 elecciones de 139 participantes. La mejora en verosimilitud negativa media por elección es de 0.1485 tras el ajuste LoRA. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de 0.5B parámetros más un adaptador LoRA de rango 16, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el entrenamiento se realizó en una Tesla T4, lo que indica que el ajuste y la inferencia son viables en GPUs de gama media y de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con suficiente VRAM para un modelo de 0.5B (no se proporcionan cifras exactas).
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base Qwen2.5-0.5B junto con el adaptador mediante la librería `peft`; no se documentan opciones específicas como vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (NLL por elección) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA) | 0.5B + LoRA | 2048 tokens en entrenamiento | 0.8414 | Apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B (base sin ajuste) | 0.5B | no disponible | 0.9899 | Apache-2.0 | Hugging Face |
| Centaur (Llama-3.1-Centaur-70B) | 70B | no disponible | no disponible | no disponible | Hugging Face |

La comparación directa con Centaur no es posible en términos de NLL con los datos proporcionados, aunque el autor advierte que, al ser un modelo de 70B entrenado sobre la totalidad de Psych-101, es previsible que sea muy superior a este adaptador.

## Limitaciones y advertencias

- Modelo pequeño y parcial: es un adaptador sobre un modelo de menos de mil millones de parámetros entrenado sobre una muestra de Psych-101 (607 transcripciones de 160 experimentos), frente a Centaur, que usa la totalidad del dataset con 70B parámetros; se espera un rendimiento muy inferior.
- Tareas de laboratorio, no de vida real: Psych-101 proviene de experimentos con participantes mayoritariamente en línea; buenos resultados en ese dominio no garantizan una buena predicción de decisiones del mundo real, y el modelo aún no se ha probado sobre decisiones laborales reales de PaySim.
- No apto para decisiones sobre personas: modela tendencias medias en experimentos y no debe usarse para juzgar, clasificar ni tomar decisiones sobre ninguna persona real.
- Riesgo de alucinación: no documentado explícitamente en la información disponible, pero inherente a los modelos de lenguaje.
- Limitación de idioma: solo se declara soporte para inglés.
- Limitación de contexto: las transcripciones se truncan a 2048 tokens durante el entrenamiento, lo que puede perder información en experimentos largos.
- Licencia Apache-2.0: permite uso comercial, pero las advertencias éticas del autor desaconsejan su uso para decisiones sobre personas.
- Sin datos de sesgo documentados en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EthanChen72/human-choice-qwen2.5-0.5b-lora
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset Psych-101: https://huggingface.co/datasets/marcelbinz/Psych-101
- Modelo Centaur (Llama-3.1-Centaur-70B): https://huggingface.co/marcelbinz/Llama-3.1-Centaur-70B
- PaySim: https://ethanchen71.github.io/PaySimulationTool/
- Código de entrenamiento y evaluación: https://github.com/vittesh12345/Oxpecker/tree/main/training/human
