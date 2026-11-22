# hal-rock/qwen3-4b-maze-grpo-fft

## Resumen

`hal-rock/qwen3-4b-maze-grpo-fft` es un ajuste fino completo (full fine-tuning, FFT) del modelo Qwen3-4B-Instruct-2507, publicado por el usuario hal-rock en Hugging Face. El modelo se ha entrenado con Dr. GRPO, una variante de optimización por política proximal (PPO) sin término de divergencia KL, sobre un entorno de laberinto simbólico de emojis descrito en el artículo de Han, Chalmers e Izmailov (2026), "How's it going? Reinforcement learning in language models recruits a functional welfare axis". El propósito declarado no es el despliegue en producción, sino la investigación sobre cómo el aprendizaje por refuerzo modifica las predicciones de un modelo de lenguaje acerca de su entorno.

El repositorio contiene cuatro checkpoints organizados en dos carpetas (`main` y `swap`), cada una con los pasos 25 (pico de recompensa) y 95 (final del entrenamiento). Los dos entrenamientos difieren únicamente en qué emoji lleva qué recompensa, manteniendo idénticos los laberintos y los hiperparámetros. El modelo base Qwen3-4B-Instruct-2507 aporta una arquitectura transformer densa con aproximadamente 4.000 millones de parámetros y una ventana de contexto que, aunque no se detalla en la información disponible, corresponde a la familia Qwen3.

La relevancia del modelo es fundamentalmente científica: sirve como caso controlado para estudiar la dinámica de RL en modelos de lenguaje, la inestabilidad del entrenamiento (colapso de recompensa tras el paso 25) y la formación de una "axis de bienestar funcional" en las representaciones internas. Para desarrolladores, es un artefacto de investigación con licencia Apache 2.0, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507) |
| Parámetros totales | ~4.000 millones (4B, según el modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de unos 4.000 millones de parámetros. El ajuste fino actualiza todos los parámetros con Dr. GRPO: 64 laberintos por 64 rollouts en cada paso, una época PPO dividida en 4 minibatches, clip de 0,2, sin término KL y con un bono de entropía de 0,01. Se usa AdamW con decaimiento de peso 0,01 y una tasa de aprendizaje de 3e-6 con programación coseno sobre 500 pasos planificados, aunque el entrenamiento se detuvo en el paso 95. Los pesos maestros se mantienen en fp32 bajo autocast bf16; los checkpoints publicados son los pesos bf16 usados en la pasada forward.

El entorno es un laberinto de 100 x 100 casillas con 15 movimientos por episodio. Las recompensas son +20 por el emoji dorado (Gold), -10 por el moho (Mold) y -0,1 por cada movimiento; cada casilla que el agente abandona se convierte en moho. Cada observación es un turno de usuario que describe las casillas adyacentes en orden aleatorio, y la acción es un único token (N/E/S/W) muestreado con temperatura 0,7 y top-p 0,9. El viento, con probabilidad 0,25 por movimiento, sustituye la acción elegida por una dirección aleatoria y la siguiente observación lo indica textualmente. Las innovaciones técnicas destacables incluyen la exclusión de los movimientos sobrescritos por el viento de la pérdida de gradiente de política, el uso de position ids contiguos en los rollouts (en lugar de los huecos de padding del rollout original con caché KV) y el registro de inestabilidad tras el paso 25: entre el 15 % y el 30 % de las actualizaciones fueron recortadas, las normas de gradiente superaron 100 antes del recorte, la entropía de acción subió de 0,07 a 0,5-0,7 y la recompensa cayó de +46 a +10..+20.

## Capacidades

- Navegación simbólica en laberintos de emojis: predice el siguiente movimiento (N/E/S/W) a partir de la descripción textual de las casillas adyacentes.
- Aprendizaje por refuerzo con recompensa: los checkpoints del paso 25 alcanzan una recompensa media por episodio de +46,5 (main) y +46,6 (swap), frente a -45 a -48 del modelo sin entrenar.
- Razonamiento multi-paso limitado: 15 movimientos por episodio, con planificación implícita dentro de la ventana de contexto del episodio.
- Robustez parcial ante perturbaciones: el entrenamiento incluye viento aleatorio con probabilidad 0,25, lo que introduce cierta tolerancia a acciones no elegidas.
- Capacidades heredadas del modelo base Qwen3-4B-Instruct-2507 (generación de texto, código, matemáticas, tool calling, multilingüismo): no se documentan ni se garantizan en la model card, y el ajuste fino puede haberlas degradado.
- No se documenta soporte explícito de agentes, visión, audio ni modo de pensamiento en la información disponible.

## Casos de uso

- Investigación sobre dinámica de RL en modelos de lenguaje: comparar los checkpoints del paso 25 y del paso 95 para estudiar cómo la recompensa y la entropía de acción evolucionan y colapsan, usando los cuatro puntos de control como réplicas experimentales.
- Estudio de la "axis de bienestar funcional": los pares `main`/`swap` permiten analizar si las representaciones internas codifican preferencias por recompensas concretas independientemente del emoji que las porta.
- Análisis de estabilidad del entrenamiento: reproducir las métricas de recorte de gradiente y entropía reportadas para diagnosticar inestabilidad en Dr. GRPO con ajuste fino completo a 4B.
- Evaluación de robustez ante ruido: usar el viento aleatorio como banco de pruebas para medir la degradación de la política cuando parte de las acciones se sustituyen.
- Docencia y reproducción de experimentos: el código de carga con `subfolder="main/step-25"` permite integrar el modelo en cuadernos de experimentación sobre RL y transformers.
- Comparación de esquemas de recompensa: entrenar variantes con otras asignaciones de emoji para testar la sensibilidad de la política a la semántica de la recompensa.
- Estudio de olvido catastrófico: evaluar cuánto del rendimiento del modelo base en tareas generales se conserva tras el ajuste fino completo en un dominio tan estrecho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son las recompensas medias por episodio en el entorno de laberinto:

| Checkpoint | Recompensa Gold (+20) | Recompensa Mold (-10) | Paso | Recompensa media por episodio |
|---|---|---|---|---|
| `main/step-25` | 📐 | 📇 | 25 (pico) | +46,5 |
| `main/step-95` | 📐 | 📇 | 95 (final) | +11,3 |
| `swap/step-25` | 📇 | 📐 | 25 (pico) | +46,6 |
| `swap/step-95` | 📇 | 📐 | 95 (final) | +14,0 |
| Modelo sin entrenar | — | — | 0 | -45 a -48 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB para los pesos de un modelo de 4B, más memoria para el contexto y el estado de la caché KV; en la práctica, entre 10 y 12 GB dependiendo de la longitud de secuencia.
- Cuantización: no se publican pesos cuantizados; para desplegar en hardware limitado habría que cuantizar el modelo (por ejemplo, a 8 bits o 4 bits) con herramientas externas, lo que no está validado por el autor.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en bf16 sin cuantización; una RTX 3090 o 4080 con 16 GB también puede alojar el modelo en bf16 con contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) para inferencia en bf16 con secuencias cortas.
- Opciones de despliegue: transformers con `AutoModelForCausalLM.from_pretrained(repo, subfolder="main/step-25", dtype=torch.bfloat16)`; vLLM, llama.cpp, Ollama y TGI son compatibles en principio con el formato safetensors, pero no se documenta soporte específico en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hal-rock/qwen3-4b-maze-grpo-fft` | ~4B | no disponible | Recompensa +46,5 en laberinto (paso 25) | Apache 2.0 | Hugging Face, 4 checkpoints |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | no disponible | Recompensa -45 a -48 en laberinto | Apache 2.0 | Hugging Face |
| Qwen3-4B (versión original) | ~4B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Modelos de 4B de la familia Llama 3.2 | ~4B | no disponible | no disponible | Licencia comunitaria Llama | Hugging Face |

La comparación directa con modelos de propósito general de 4B no es significativa: este checkpoint está especializado en un entorno sintético y su rendimiento en tareas generales no se ha medido.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara explícitamente que el modelo se entrenó para estudiar cómo el RL cambia las predicciones sobre el entorno, no para uso en producción.
- Inestabilidad del entrenamiento: tras el paso 25 la recompensa cae de +46 a +10..+20, la entropía de acción sube de 0,07 a 0,5-0,7 y entre el 15 % y el 30 % de las actualizaciones se recortan; el checkpoint final es sustancialmente peor que el pico.
- Degradación probable de capacidades generales: al ser un ajuste fino completo sobre un dominio estrecho, es esperable olvido catastrófico de las habilidades del modelo base, aunque no se documenta su magnitud.
- Sesgos conocidos: no disponibles; el dominio sintético no permite extrapolar sesgos sociales o culturales.
- Riesgo de alucinación: alto fuera del entorno de laberinto, ya que el modelo no fue entrenado para tareas abiertas y su calibración en dominios generales no se ha evaluado.
- Limitaciones de contexto e idioma: la ventana de contexto no se documenta y los idiomas soportados no están disponibles; el entrenamiento se realizó en inglés con instrucciones fijas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo base Qwen3-4B-Instruct-2507 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveat para producción: no hay garantías de calidad, no se publican evaluaciones de seguridad y el tamaño del repositorio (35,3 GB) refleja cuatro checkpoints completos en bf16, lo que complica el despliegue selectivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hal-rock/qwen3-4b-maze-grpo-fft
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Artículo de referencia: https://arxiv.org/abs/2605.30232
- Repositorio del artículo (no enlazado en la model card): no disponible
- Demo o espacio interactivo: no disponible
