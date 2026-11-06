# LUC1O/act-5090-C4_insertion_scripted

## Resumen

ACT (Action Chunking Transformer) es una política de imitación para robótica manipulativa desarrollada originalmente por Tony Z. Zhao et al. y empaquetada aquí en formato LeRobot. Este checkpoint concreto, `LUC1O/act-5090-C4_insertion_scripted`, ha sido entrenado por el usuario LUC1O con los hiperparámetros oficiales de ACT (batch 8, learning rate 1e-5, chunk size 100, 100 000 pasos) sobre el dataset simulado `lerobot/aloha_sim_insertion_scripted`, empleando una única GPU RTX 5090.

El modelo resuelve la tarea de inserción de precisión en el entorno ALOHA simulado (`AlohaInsertion-v0`), un benchmark clásico de manipulación bimanual con dos brazos y control de bajo nivel. Con 51 685 006 parámetros, es un modelo compacto orientado a control robótico, no a generación de lenguaje: predice secuencias de acciones (chunks) a partir de observaciones visuales y propioceptivas.

Su relevancia es doble: por un lado, demuestra que un entrenamiento ACT estándar puede completarse en hardware consumer (RTX 5090) en un tiempo razonable; por otro, publica una evaluación rigurosa con 200 episodios e intervalo de confianza de Wilson, algo poco habitual en checkpoints de robótica de autor individual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot |
| Parametros totales | 51 685 006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; chunk size 100) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tamano del repo | 0.2 GB |
| Dataset de entrenamiento | lerobot/aloha_sim_insertion_scripted |
| Entorno de evaluacion | aloha / AlohaInsertion-v0 |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado para imitación robótica que predice chunks de acciones (100 pasos en este caso) en lugar de acciones individuales, lo que reduce el error de compounding y suaviza la ejecución. El encoder procesa observaciones multimodales (imágenes de cámaras y estado propioceptivo de los brazos) y el decoder genera la secuencia de acciones de forma no autorregresiva. La implementación utilizada es la de LeRobot en el commit `ba83e4c`, con hiperparámetros oficiales del paper original.

El entrenamiento se realizó sobre el dataset simulado `aloha_sim_insertion_scripted` durante 100 000 pasos con batch 8 y learning rate 1e-5, en una sola RTX 5090. No se documentan en la información disponible detalles sobre aumentos de datos, composición exacta del dataset, ni si hubo fases de refinamiento adicionales. El modelo se distribuye como checkpoint de política LeRobot listo para evaluar con `lerobot-eval`.

## Capacidades

- Control robótico de manipulación bimanual en el entorno ALOHA simulado.
- Predicción de chunks de acción de 100 pasos a partir de observaciones visuales y propioceptivas.
- Ejecución de la tarea específica de inserción (`AlohaInsertion-v0`).
- Compatible con el pipeline de evaluación de LeRobot (`lerobot-eval`).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor simulado.

## Casos de uso

- Evaluación de referencia de ACT en ALOHA simulado: sirve como baseline reproducible para comparar variantes de ACT, cambios de hiperparámetros o nuevas arquitecturas sobre `AlohaInsertion-v0`, usando el comando `lerobot-eval` documentado.
- Reproducción de experimentos en hardware consumer: al haberse entrenado en una RTX 5090, permite a investigadores con una sola GPU consumer replicar el pipeline completo sin clúster.
- Estudio de la varianza en tareas de inserción: el intervalo de confianza de Wilson publicado (57,1–70,3 % con 200 episodios) facilita análisis estadísticos rigurosos de la robustez del policy.
- Punto de partida para fine-tuning: el checkpoint puede inicializar entrenamientos en tareas relacionadas del mismo entorno ALOHA, reduciendo pasos de entrenamiento.
- Docencia y formación en robótica de imitación: modelo pequeño (0,2 GB) y con comando de evaluación explícito, adecuado para prácticas guiadas.
- Integración en pipelines de simulación a gran escala: al ser un checkpoint LeRobot estándar, puede conectarse a entornos asíncronos o paralelos para barridos de evaluación, aunque la model card recomienda `--eval.use_async_envs=false` para la reproducción exacta.

## Benchmarks y rendimiento

| Benchmark | Entorno | Episodios | Resultado | IC 95 % (Wilson) |
|---|---|---|---|---|
| AlohaInsertion-v0 | aloha (simulado) | 200 | 64,0 % (128/200) | 57,1–70,3 % |

No se han publicado en la información disponible resultados comparativos con otros checkpoints ACT u otras políticas sobre el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors en un repo de 0,2 GB, la huella es muy reducida y cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: RTX 5090 (la utilizada para entrenamiento); cualquier GPU con suficiente VRAM para el simulador ALOHA, que suele ser el cuello de botella real más que el modelo.
- Cabe en GPU consumer: sí, con margen amplio; el limitante práctico es el entorno de simulación, no los pesos.
- Opciones de despliegue: `lerobot-eval` (comando documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Entorno | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|
| LUC1O/act-5090-C4_insertion_scripted | 51,7 M | chunk 100 | AlohaInsertion-v0 | 64,0 % (200 eps) | no disponible |
| ACT original (Zhao et al.) | no disponible en la información | chunk 100 | ALOHA real y sim | no disponible en la información | no disponible |
| Otros checkpoints LeRobot ACT | no disponible | no disponible | ALOHA sim | no disponible | no disponible |

No se dispone en la información proporcionada de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para `AlohaInsertion-v0` en simulación; no se garantiza transferencia a otros entornos ni al robot físico.
- Tasa de éxito del 64 %, con un intervalo de confianza que llega hasta el 70,3 % en el mejor caso; no es un policy de alta fiabilidad para producción.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso productivo.
- No hay información sobre sesgos, pero al ser un modelo de control motor en simulación, los riesgos típicos de sesgo lingüístico no aplican; sí existe riesgo de sobreajuste al dataset concreto.
- No se documentan cuantizaciones ni optimizaciones de despliegue; el rendimiento en tiempo real no está caracterizado.
- La model card recomienda `--eval.use_async_envs=false` para reproducir el resultado; usar entornos asíncronos puede alterar las métricas.
- Repo con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria independiente del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/LUC1O/act-5090-C4_insertion_scripted
- Repositorio de benchmark, logs y scripts de reproducción: https://github.com/Jerryisqx/ACT-5090-benchmark
- Dataset: https://huggingface.co/datasets/lerobot/aloha_sim_insertion_scripted
- LeRobot (librería): https://github.com/huggingface/lerobot
