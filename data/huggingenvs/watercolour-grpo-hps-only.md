# HuggingEnvs/watercolour-grpo-hps-only

## Resumen

El modelo `HuggingEnvs/watercolour-grpo-hps-only` es un adaptador LoRA para el modelo base `Qwen/Qwen3.5-35B-A3B`, entrenado mediante GRPO (Group Relative Policy Optimization) con el objetivo de generar acuarelas escribiendo sketches de la librería p5.brush. El autor, HuggingEnvs, lo presenta como el primer experimento de su proyecto cuya curva de recompensa se mantiene estable durante todo el entrenamiento, utilizando casi exclusivamente un modelo de preferencia estética (HPSv3) como señal de recompensa, con el juez por pares desactivado.

El adaptador añade 30,4 millones de parámetros entrenables (0,0866 % del total) sobre un modelo MoE de 35B con 3B activos, que además incorpora una torre de visión. El entrenamiento se realizó en 60 pasos durante 17 horas y 46 minutos en una GPU H200, con un único sujeto ("a peach hibiscus") y una única librería de dibujo. El análisis de los resultados revela que el modelo aprendió principalmente a evitar producir pinturas de baja calidad, más que a mejorar la calidad de las que ya eran aceptables.

Este modelo es relevante porque demuestra la aplicación de técnicas de reinforcement learning a tareas creativas de generación de arte mediante código, utilizando un modelo de preferencia estética como recompensa. También documenta un problema técnico importante: la carga incorrecta del adaptador si se usa `AutoModelForCausalLM` en lugar de la clase específica del modelo base, lo que puede provocar fallos silenciosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-35B-A3B (MoE con torre de visión) |
| Parametros totales | 35B (modelo base) + 30.431.360 (adaptador LoRA) |
| Parametros activos | 3B (modelo base, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es `Qwen3.5-35B-A3B`, un transformer MoE con 35B parámetros totales y 3B activos, que declara la clase `Qwen3_5MoeForConditionalGeneration` e incluye una torre de visión. El adaptador LoRA se aplica con configuración `all-linear` (r16, alpha 32), alcanzando las proyecciones de atención lineal en las 40 capas y el experto compartido, pero no los 256 expertos enrutados, que son un parámetro 3D fusionado no seleccionable por PEFT. El entrenamiento usó GRPO con TRL, 60 pasos, 240 episodios, 8 generaciones por paso, batch size 1 y gradiente acumulado de 8. La recompensa se compone de: gate 0.05, length 0.05 y HPSv3 0.90, sin juez por pares. El entorno de evaluación fue un Space de Hugging Face (`sergiopaniego-watercolour-env-v20`) que puntúa las pinturas generadas. El learning rate fue 5e-5 con scheduler constante y 5 pasos de warmup, y el muestreo usó top_p 0.95, top_k 20 y longitud máxima de completado de 8192 tokens.

## Capacidades

- Generación de código p5.brush para crear acuarelas a partir de una descripción textual (en este caso, "a peach hibiscus").
- Especialización en arte generativo mediante programación, no en conversación o razonamiento general.
- No soporta tool calling ni funciones de agente; su salida es exclusivamente código de dibujo.
- Capacidades multilingües no documentadas; probablemente hereda las del modelo base, pero no se especifica.
- Capacidad especial: integración con un entorno de evaluación estética (HPSv3) que puntúa la calidad visual de las imágenes generadas.

## Casos de uso

- Generación de arte generativo programático: el modelo puede producir sketches de p5.brush que dibujan acuarelas, útil para artistas y desarrolladores que quieran explorar la creación de imágenes mediante código.
- Investigación en reinforcement learning para tareas creativas: sirve como caso de estudio de cómo aplicar GRPO con recompensas basadas en preferencias estéticas, especialmente para comparar con otras configuraciones de recompensa.
- Prototipado de entornos de evaluación de arte: el adaptador puede usarse para probar y calibrar métricas de calidad estética como HPSv3 en entornos de generación de imágenes.
- Educación en arte generativo: permite demostrar cómo un LLM puede escribir código de dibujo funcional, sirviendo como ejemplo didáctico en cursos de programación creativa.
- Benchmarking de adaptadores LoRA: dentro del proyecto, se puede comparar con las variantes `judge-led` y `hps-led` para estudiar el efecto de diferentes pesos de recompensa.
- Integración en pipelines de arte generativo: combinado con otros modelos de postprocesado, puede generar variaciones de acuarelas a partir de descripciones, aunque requiere el modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo es un adaptador especializado en generación de arte. Sin embargo, el autor reporta métricas de entrenamiento y evaluación en el entorno de acuarelas:

| Metrica | Primer tercio | Segundo tercio | Tercer tercio | Pendiente t |
|---|---|---|---|---|
| Reward | 0.579 | 0.637 | 0.710 | +6.41 |
| HPSv3 | 0.571 | 0.633 | 0.714 | +6.47 |
| Paint coverage | 0.107 | 0.115 | 0.143 | +4.64 |
| Reward std | 0.262 | 0.213 | 0.153 | −5.00 |
| Entropy | 0.315 | 0.313 | 0.295 | −2.85 |

El mejor grupo alcanzó una media de 0.811 en el paso 57, y el mejor rollout individual fue 0.869. El autor descompone la mejora: +0.0290 proviene de reducir fallos (rollouts con puntuación <0.3 pasan de 33 a 11), mientras que solo +0.0017 se debe a mejoras en las pinturas que sí se renderizaron correctamente.

## Requisitos de hardware

- El adaptador LoRA es pequeño (0.1 GB), pero requiere cargar el modelo base completo `Qwen3.5-35B-A3B` en bfloat16, lo que necesita aproximadamente 70 GB de VRAM solo para los pesos.
- Para inferencia se recomienda una GPU con al menos 80 GB de VRAM (A100, H100, H200) o varias GPUs en paralelo. No cabe en GPUs de consumo como RTX 4090 (24 GB) sin cuantización adicional, que no está documentada para este adaptador.
- El entrenamiento se realizó en una H200 (141 GB) durante 17h46m, con un Space a100-large para HPSv3 y cuota de inferencia para el juez.
- Opciones de despliegue: se puede usar vLLM o TGI con el modelo base y cargar el adaptador PEFT, pero hay que usar la clase `Qwen3_5MoeForConditionalGeneration` explícitamente. No se documentan opciones con llama.cpp u Ollama.
- Latencia y throughput no disponibles; dependen del hardware y del tamaño de los sketches generados (hasta 8192 tokens de completado).

## Comparativa con modelos similares

Dentro del mismo proyecto, el autor publica tres variantes del adaptador con diferentes configuraciones de recompensa:

| Variante | Peso del juez por pares | Peso de HPSv3 |
|---|---|---|
| **hps-only** (este modelo) | 0.00 | 0.90 |
| judge-led | 0.60 | 0.30 |
| hps-led | 0.30 | 0.60 |

No se dispone de comparaciones con otros modelos de generación de arte mediante código en la información proporcionada. El modelo base Qwen3.5-35B-A3B es un LLM generalista, pero el adaptador lo especializa en una tarea muy concreta, por lo que no es directamente comparable con modelos de propósito general.

## Limitaciones y advertencias

- Entrenado exclusivamente con un único sujeto ("a peach hibiscus") y una única librería (p5.brush); no generaliza a otras tareas de dibujo ni a otros estilos.
- El entrenamiento de 60 pasos es corto; el autor proyecta que el mecanismo de aprendizaje agotaría los rollouts malos alrededor del paso 94, lo que sugiere que el modelo podría seguir mejorando con más pasos.
- El techo de recompensa es 0.901 por construcción, no 1.0, porque HPSv3 no puede alcanzar una puntuación infinita.
- Reproducir el entrenamiento es costoso: requiere una GPU H200, un Space a100-large para HPSv3 y cuota de inferencia para el juez.
- Existe un bug de carga documentado: si se usa `AutoModelForCausalLM`, el adaptador no se carga correctamente (700 de 920 tensores no coinciden) y se obtiene el modelo base sin aviso. Hay que usar `Qwen3_5MoeForConditionalGeneration`.
- No se reportan sesgos específicos, pero al ser un modelo entrenado con preferencias estéticas, puede reflejar sesgos del modelo HPSv3 y del entorno de evaluación.
- Riesgo de alucinación en el código generado: el modelo puede producir sketches que no se rendericen correctamente, como se observa en la alta proporción de rollouts con puntuación baja al inicio del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuggingEnvs/watercolour-grpo-hps-only
- Dataset de rollouts: https://huggingface.co/datasets/HuggingEnvs/watercolour-rollouts-hps-only
- Dataset de referencia: https://huggingface.co/datasets/HuggingEnvs/watercolour-reference-pool
- Space de visualización: https://huggingface.co/spaces/sergiopaniego/watercolour-grpo
- Blog de Surya Narreddi (método original): https://surya.website/rling-qwen-to-paint-with-code
- Repositorio de p5.brush: https://github.com/acamposuribe/p5.brush
