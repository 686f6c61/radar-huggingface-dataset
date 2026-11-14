# Am1nadav/microduck-basketball

## Resumen

Microduck Blind Basketball Balance es una política de control entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto Microduck, desarrollada por el usuario Am1nadav a partir del trabajo original de Hannes von Essen (Vottivott) en el entorno `Mjlab-Basketball-MicroDuck`. El modelo resuelve una tarea de equilibrio dinámico: mantener una pelota de baloncesto de tamaño 7 rodando y controlada sobre el cuerpo del robot mientras este se desplaza, infiriendo el estado de la pelota únicamente a partir de propiocepción (sin visión directa de la esfera).

Técnicamente es un actor recurrente compuesto por una LSTM de 256 unidades seguida de un MLP con activaciones ELU de dimensiones 512, 256 y 128, que mapea una observación de 61 dimensiones más el estado oculto y de celda de la LSTM a 14 acciones a 50 Hz. El modelo tiene aproximadamente 624 000 parámetros y se distribuye en formato ONNX para inferencia en navegador mediante ONNX Runtime Web.

Su relevancia actual radica en que demuestra el despliegue de políticas RL con física realista de MuJoCo compilada a WebAssembly, incluyendo modelos de actuador complejos (back-EMF, fricción de gearbox, retardo de bus de 20 ms) directamente en el navegador, lo que facilita la reproducibilidad y la evaluación interactiva de políticas de robótica sin infraestructura local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM(256) + MLP ELU(512, 256, 128), actor recurrente |
| Parametros totales | ~624 000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso a 50 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La política es un actor recurrente que combina una LSTM de 256 unidades con un perceptrón multicapa de tres capas (512, 256 y 128 neuronas) con activación ELU. La entrada es un vector de observación de 61 dimensiones junto con los estados oculto y de celda de la LSTM (`h_in`/`c_in` de forma `[1, 1, 256]`), y la salida son 14 acciones continuas generadas a 50 Hz. El modelo es "ciego": no recibe coordenadas directas de la pelota y debe inferir la dinámica de contacto de la esfera rodante exclusivamente a partir de la propiocepción de tobillos y caderas y del historial del giroscopio corporal.

El entrenamiento se realizó con reinforcement learning en el entorno `Mjlab-Basketball-MicroDuck`, construido sobre `pollen-robotics/microduck_rl` y `Rhoban/bam`. La física de simulación es deliberadamente realista: pelota de baloncesto de tamaño 7 con radio 0,12 m, masa 0,62 kg, `condim = 6` y coeficientes de fricción `1.2 0.01 0.001`; modelo de actuador `Rhoban BAM XL330 M6` dependiente de voltaje, back-EMF y carga con fricción de gearbox (7,4 V, kt = 0,366, R = 2,81 ohmios); y un retardo de comando de bus de 20 ms equivalente a 4 subpasos de física. No se especifican en la información disponible el número de tokens, episodios ni la composición exacta del dataset de entrenamiento, ni si se emplearon técnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Control de equilibrio dinámico de una pelota de baloncesto sobre el cuerpo del robot Microduck.
- Inferencia de dinámica de contacto de esfera rodante sin observación directa de la pelota (política ciega basada en propiocepción).
- Recuperación ante perturbaciones externas (arrastre manual de la pelota en el entorno de demostración).
- Control de locomoción del cuadrúpedo para desplazarse y orientarse mientras mantiene la pelota.
- Inferencia recurrente a 50 Hz con estado interno LSTM persistente entre pasos.
- Ejecución en navegador mediante ONNX Runtime Web sobre física MuJoCo compilada a WebAssembly.
- No soporta tool calling, function calling, razonamiento multi-step simbólico ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Demostración interactiva de robótica en navegador: el modelo se ejecuta en `duckspace.org` con física MuJoCo en WebAssembly, permitiendo a cualquier usuario probar la política sin instalar software, lo que resulta adecuado para divulgación y validación rápida.
- Investigación en control sin visión: sirve como referencia para estudiar hasta qué punto la propiocepción y el historial del giroscopio bastan para tareas de manipulación dinámica, al eliminar por completo la entrada visual.
- Benchmark de simulación realista de actuadores: el modelo incorpora un modelo de actuador con back-EMF y fricción de gearbox, útil para evaluar el impacto del modelado de actuadores en el rendimiento de políticas RL.
- Pruebas de robustez ante perturbaciones: la interfaz permite arrastrar la pelota con el ratón para inyectar disturbios, lo que facilita experimentos de recuperación y análisis de estabilidad.
- Educación en reinforcement learning: el repositorio y la demo ofrecen un caso completo de entrenamiento, exportación a ONNX y despliegue web, adecuado para cursos y talleres.
- Integración en pipelines de simulación a simulación: la política ONNX puede cargarse en otros simuladores o en el propio robot Microduck para comparar transferencia entre entornos con distintos retardos y modelos de actuador.
- Evaluación de latencia en inferencia web: al ejecutarse a 50 Hz en el navegador, permite medir el rendimiento de ONNX Runtime Web en tareas de control en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; el modelo tiene ~624 000 parámetros y se ejecuta en formato ONNX, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU integrada o dedicada es suficiente. Para la demo web no se requiere GPU local, ya que la inferencia ocurre en el navegador del usuario.
- Cabe en GPU consumer: sí, en cualquier GPU consumer y en la mayoría de CPUs modernas.
- Opciones de despliegue: ONNX Runtime Web (navegador), ONNX Runtime (Python/C++), y potencialmente otros runtimes compatibles con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: la política opera a 50 Hz (20 ms por paso) según la información del autor; no se publican cifras de latencia de inferencia medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Microduck Blind Basketball Balance (este modelo) | ~624 000 | 61 dimensiones a 50 Hz | Equilibrio de balón sin visión | Apache 2.0 | ONNX en Hugging Face |
| Política original `b11_6999` (Vottivott) | no disponible | no disponible | Equilibrio de balón sin visión | Apache 2.0 | Referenciada en la model card |
| `pollen-robotics/microduck_rl` | no disponible | no disponible | Base de RL para Microduck | no disponible | Hugging Face / repositorio |
| `Rhoban/bam` | no disponible | no disponible | Modelo de actuador BAM | no disponible | Repositorio |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Política ciega: al no recibir observación directa de la pelota, el rendimiento puede degradarse ante condiciones fuera del dominio de entrenamiento (superficies distintas, pelotas con masa o radio diferentes).
- Dependencia del modelo de actuador: el comportamiento está ajustado a un modelo específico de gearbox y retardo de bus; cambios en el hardware real pueden invalidar la política.
- Sin datos de benchmarks: no hay métricas publicadas de éxito, robustez o transferencia a hardware real, lo que limita la evaluación objetiva.
- Especialización estrecha: solo resuelve la tarea de equilibrio de balón; no es un modelo generalista ni un modelo de lenguaje.
- Riesgo de sobreajuste a la simulación: aunque la física es realista, persiste la brecha simulación-realidad habitual en robótica.
- Licencia Apache 2.0 permite uso comercial, pero requiere mantener los avisos de licencia y atribución a los autores originales (Hannes von Essen / Vottivott, pollen-robotics y Rhoban) según se indica en la model card.
- No se documentan sesgos de datos ni riesgos de alucinación por no ser un modelo generativo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Am1nadav/microduck-basketball
- Demo interactiva 3D: https://duckspace.org/?hf=Am1nadav/microduck-basketball
- Vídeo de replay: https://huggingface.co/Am1nadav/microduck-basketball/resolve/main/replay.mp4
- Repositorio base microduck_rl: https://huggingface.co/pollen-robotics/microduck_rl
- Repositorio del modelo de actuador BAM: https://huggingface.co/Rhoban/bam
