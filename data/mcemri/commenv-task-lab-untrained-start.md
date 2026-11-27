# mcemri/commenv-task-lab-untrained-start

## Resumen

`mcemri/commenv-task-lab-untrained-start` es un checkpoint de investigación derivado de Qwen3-4B, publicado por el usuario mcemri en Hugging Face. No es un modelo de propósito general ni un producto: es una ejecución de control dentro de un experimento de aprendizaje por refuerzo multiagente en el que tres copias del modelo colaboran para ajustar una red neuronal pequeña a partir de tablas de barridos reales de hiperparámetros. El autor lo conserva explícitamente porque uno de los resultados del estudio se apoya en esta ejecución.

El entrenamiento consiste en 30 pasos de GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen3-4B sin ningún ajuste previo, a diferencia del checkpoint hermano `mcemri/commenv-task-lab-t2`, que parte de un modelo previamente entrenado con puzles de lógica divididos. La comparación entre ambos aísla el efecto de ese preentrenamiento específico sobre la capacidad de generalizar a tablas de configuraciones nunca vistas.

El resultado principal es que este modelo aprende a localizar buenas configuraciones dentro de las cuatro tablas de entrenamiento (del 7 % al 52 % de acierto) pero apenas transfiere ese conocimiento a tablas nuevas (del 10 % al 12 %), mientras que su capacidad en puzles de lógica se degrada del 25,2 % al 7,0 %. Es, por tanto, material de reproducción y análisis, no una base recomendada para aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); ajuste con GRPO para un entorno multiagente |
| Parametros totales | 4 000 millones (aproximado, segun el modelo base Qwen3-4B); el autor no publica el recuento exacto |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors sin variantes cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers); checkpoints del entrenador en 4 shards con estado del optimizador |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B. Sobre esa base se aplica un ajuste de refuerzo con GRPO durante 30 pasos en un entorno de comunicación multiagente: tres instancias del mismo modelo conversan durante hasta seis turnos para acordar qué combinación de hiperparámetros es la mejor, evaluando tablas de barridos reales de una red pequeña (FCNet) y, en la fase de evaluación, tablas de NAS-Bench-201 que nunca aparecieron en entrenamiento. La recompensa se basa en si los agentes identifican la mejor combinación disponible.

La innovación metodológica no está en la arquitectura sino en el diseño experimental: este checkpoint es la rama de control que parte del Qwen3-4B sin ajustar, frente a la rama que parte de un modelo ya entrenado en puzles de lógica divididos. El autor señala además un comportamiento emergente relevante: el modelo aprende a responder en el cuarto turno de seis, justo cuando llega su último resultado, lo que impide que sus compañeros lean esa información antes de decidir. Los checkpoints se publican en los pasos 10, 20 y 30 (8,8 GB por exportación en formato Transformers; 22,5 GB por checkpoint del entrenador con estado del optimizador). No se documentan datos sobre volumen de tokens, composición del dataset de preentrenamiento ni uso de RLHF o DPO más allá del propio GRPO.

## Capacidades

- Generación de texto conversacional multi-turno dentro de un protocolo de comunicación entre agentes (hasta seis turnos).
- Razonamiento colaborativo: los tres agentes intercambian propuestas y convergen en una respuesta conjunta sobre configuración de hiperparámetros.
- Selección de configuraciones en tablas de barridos de hiperparámetros de redes FCNet (dominio de entrenamiento).
- Aprendizaje de política vía GRPO: el checkpoint refleja la política optimizada, no un ajuste supervisado.
- Capacidades heredadas de Qwen3-4B (generación general, código, matemáticas) presentes de forma residual, aunque el autor documenta una degradación severa en puzles de lógica tras el ajuste.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Reproducción del experimento de control: cargar `export/global_step_30/policy` y repetir la evaluación sobre las cuatro tablas FCNet y sobre NAS-Bench-201 para verificar los porcentajes publicados (52 % y 12 % respectivamente).
- Análisis de transferencia y olvido catastrófico: comparar este checkpoint con `commenv-task-lab-t2` para cuantificar cuánto aporta el preentrenamiento en puzles de lógica y cuánto se pierde en esa tarea tras el ajuste con GRPO (del 25,2 % al 7,0 %).
- Estudio de dinámica de comunicación multiagente: analizar por qué el modelo responde en el cuarto turno y cómo afecta el orden de los mensajes a la calidad de la decisión conjunta.
- Investigación en aprendizaje por refuerzo aplicado a LLM: usar los checkpoints intermedios (pasos 10, 20 y 30) para trazar la curva de aprendizaje de la política y estudiar la estabilidad de GRPO en horizontes cortos.
- Punto de partida para nuevos experimentos de RL: continuar el entrenamiento desde los checkpoints del entrenador (con estado del optimizador) para probar variantes del entorno o de la función de recompensa.
- Docencia y divulgación: ejemplo tangible de cómo un ajuste de refuerzo breve especializa un modelo en un dominio estrecho a costa de capacidades generales, útil para explicar el equilibrio entre especialización y generalización.

## Benchmarks y rendimiento

Datos publicados por el autor, sobre 400 rondas por condición:

| Evaluacion | Antes (Qwen3-4B) | Tras 30 pasos (este modelo) | Tras 30 pasos (commenv-task-lab-t2) |
|---|---|---|---|
| Rondas nuevas de las cuatro tablas de entrenamiento (FCNet) | 7 % | 52 % | 60 % |
| Rondas de tablas nunca entrenadas (NAS-Bench-201) | 10 % | 12 % | 45 % |
| Puzles de lógica divididos (agentes totalmente correctos) | 25,2 % | 7,0 % | 96,4 % |

El autor advierte que se trata de una sola ejecución y que un segundo seed está en entrenamiento, por lo que los intervalos de confianza no están disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión de 16 bits: en torno a 8-10 GB para los pesos de un modelo de 4 000 millones de parámetros, más el coste del contexto y de las tres instancias simultáneas que exige el entorno multiagente (multiplicar por tres si se ejecutan los tres agentes en la misma GPU).
- GPU recomendadas: A100 40 GB u 80 GB, H100 o L40S para ejecutar los tres agentes en paralelo con margen; una RTX 4090 (24 GB) permite alojar los tres agentes en FP16 solo con contextos cortos y sin margen amplio.
- GPU de consumo: sí cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en tarjetas de 16 GB; no se publican pesos GGUF, por lo que habría que generarlos a partir de los safetensors.
- Opciones de despliegue: Transformers (carga documentada por el autor con `AutoModelForCausalLM` y subcarpeta `export/global_step_30/policy`); vLLM o TGI son viables al ser un transformer estándar, aunque no están documentados por el autor; llama.cpp u Ollama requerirían conversión previa a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El repo ocupa 98,9 GB en total porque incluye tres exportaciones y tres checkpoints del entrenador; para inferencia solo hace falta una de las exportaciones de 8,8 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcemri/commenv-task-lab-untrained-start | ~4 000 M | no disponible | Checkpoint de investigación RL multiagente (control) | Apache-2.0 | Hugging Face, 0 descargas |
| mcemri/commenv-task-lab-t2 | ~4 000 M | no disponible | Misma receta RL partiendo de un modelo entrenado en puzles de lógica | Apache-2.0 (heredada) | Hugging Face |
| Qwen/Qwen3-4B | 4 000 M | no disponible en la informacion proporcionada | Modelo base de propósito general | Apache-2.0 | Hugging Face |

Frente a Qwen3-4B, este checkpoint gana en el dominio estrecho de las tablas FCNet (52 % frente a 7 %) y pierde en puzles de lógica (7,0 % frente a 25,2 %). Frente a `commenv-task-lab-t2`, es inferior tanto en las tablas de entrenamiento (52 % frente a 60 %) como, sobre todo, en generalización a NAS-Bench-201 (12 % frente a 45 %) y en puzles de lógica (7,0 % frente a 96,4 %).

## Limitaciones y advertencias

- El propio autor lo describe como "checkpoints de investigación, no un producto" y recomienda `mcemri/commenv-task-lab-t2` para cualquier uso que no sea reproducir esta comparación.
- Generalización muy limitada: solo el 12 % de acierto en tablas nunca vistas, frente al 45 % de la rama con preentrenamiento en puzles.
- Olvido catastrófico documentado: el rendimiento en puzles de lógica cae del 25,2 % al 7,0 % tras el ajuste.
- Resultados basados en una única ejecución; el segundo seed aún no estaba disponible en el momento de la publicación, por lo que la variabilidad no está cuantificada.
- Comportamiento de comunicación subóptimo: responde en el cuarto turno de seis, lo que impide que los compañeros lean su último resultado antes de decidir.
- No se documentan sesgos, riesgos de alucinación específicos ni limitaciones idiomáticas; al derivar de Qwen3-4B, hereda los sesgos y limitaciones del modelo base, no evaluados aquí.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está pensado ni validado para producción; su uso comercial no tiene sentido práctico dado su dominio estrecho.
- El tamaño del repositorio (98,9 GB) incluye checkpoints del entrenador con estado del optimizador; descargar el repo completo es innecesario para inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcemri/commenv-task-lab-untrained-start
- Checkpoint hermano con preentrenamiento en puzles: https://huggingface.co/mcemri/commenv-task-lab-t2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
