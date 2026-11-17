# jaaaa000/act_so101_part2_s3

## Resumen

ACT (Action Chunking with Transformers) es una política de imitación para robótica manipulativa que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de composición y mejora la estabilidad en tareas de control fino. Este repositorio concreto, `jaaaa000/act_so101_part2_s3`, es un checkpoint entrenado desde cero con LeRobot 0.6.0 por el usuario jaaaa000 sobre un brazo robótico SO-101, especializado en una única instrucción: introducir la esponja roja en la bandeja izquierda.

El modelo forma parte de una familia de cuatro políticas independientes (s1, s2, s3, s4), una por cada frase de un conjunto de demostraciones teleoperadas. La limitación es deliberada: ACT no procesa lenguaje, por lo que la selección de tarea se hace arrancando el checkpoint correspondiente. El autor reporta 9 de 9 ensayos exitosos en el brazo real para esta frase y 36 de 36 agregados para las cuatro variantes.

Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero orientado a despliegue en hardware de consumo (fue entrenado en una RTX 3060 de 12 GB). Su relevancia es práctica: demuestra un flujo completo de entrenamiento y evaluación de políticas robóticas con herramientas open source, con resultados verificados en hardware físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; no aplica ventana de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (dos cámaras a 640×480 y 30 fps, más las seis posiciones articulares del brazo) a chunks de acciones futuras. La predicción por chunks, en lugar de paso a paso, es la innovación central del paper original (arXiv:2304.13705): reduce el horizonte efectivo de decisión y mitiga el error acumulado típico de las políticas de imitación. El modelo se entrenó desde cero con LeRobot 0.6.0, sin inicialización desde pesos preentrenados.

El entrenamiento usó el dataset `jaaaa000/so101_part2`, restringido a las 24 demostraciones teleoperadas de esta frase (episodios 24, 26-35, 72-83 y 98). Se realizaron 46.000 pasos con batch size 8 en una única RTX 3060 de 12 GB, sin aumento de datos de imagen. El checkpoint publicado es el último del entrenamiento. En inferencia el autor emplea ensamblado temporal (`n_action_steps=1`, `temporal_ensemble_coeff=0.01`), técnica que promedia predicciones solapadas para suavizar la trayectoria.

## Capacidades

- Control manipulativo de un brazo SO-101 para una tarea fija: colocar la esponja roja en la bandeja izquierda.
- Fusión de dos cámaras (vista superior y lateral) con el estado propioceptivo de seis articulaciones.
- Predicción de chunks de acciones con ensamblado temporal para trayectorias suaves.
- Ejecución de la tarea en aproximadamente 30 segundos por intento, según la evaluación del autor.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera de las cámaras de entrada.

## Casos de uso

- Automatización de picking y placing en laboratorio: el modelo ejecuta de forma autónoma la transferencia de un objeto concreto entre dos contenedores, útil para validar pipelines de manipulación antes de escalar a más tareas.
- Banco de pruebas de imitación robótica: sirve como referencia reproducible de un entrenamiento ACT completo con LeRobot, incluidos dataset, hiperparámetros y evaluación en hardware real.
- Selección de política por tarea: en lugar de un modelo condicionado por lenguaje, se arranca el checkpoint s1, s2, s3 o s4 según la instrucción deseada, un patrón sencillo para entornos con un conjunto cerrado y pequeño de tareas.
- Docencia y formación: su tamaño (51,7 M de parámetros) y su entrenamiento en una RTX 3060 lo hacen adecuado para cursos prácticos de aprendizaje por imitación sin infraestructura dedicada.
- Comparación de paradigmas: el autor ofrece un SmolVLA entrenado con las mismas demostraciones, lo que permite contrastar una política sin lenguaje frente a una visión-lenguaje-acción sobre datos idénticos.
- Prototipado rápido en robótica de bajo coste: el brazo SO-101 y este checkpoint permiten montar una celda de manipulación funcional con hardware asequible y software Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de evaluación es el del autor en el brazo real:

| Métrica | Resultado |
|---|---|
| Ensayos exitosos en el brazo real (frase 3) | 9 de 9 |
| Ensayos exitosos agregados (s1-s4) | 36 de 36 |
| Duración por intento | 30 segundos |
| Pasos de entrenamiento | 46.000 |
| Batch size | 8 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y entradas de dos imágenes de 640×480, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU de entrenamiento empleada: una RTX 3060 de 12 GB.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para entrenamiento; para inferencia basta una gama media, si bien no se especifican requisitos mínimos exactos.
- Cabe en GPU de consumo: sí, según la evidencia del entrenamiento en RTX 3060.
- Opciones de despliegue: LeRobot 0.6.0 como librería principal; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el autor reporta ejecuciones de 30 segundos por intento con ensamblado temporal, sin cifras de frecuencia de control.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_part2_s3 (este) | 51,7 M | no aplica | 9/9 en brazo real (frase 3) | Apache 2.0 | Hugging Face |
| act_so101_part2_s1/s2/s4 | no disponible | no aplica | 36/36 agregados | Apache 2.0 | Hugging Face |
| smolvla_so101_part2 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación relevante es interna a la familia del autor: las cuatro variantes ACT cubren frases distintas y el SmolVLA permite contrastar el enfoque sin lenguaje frente al condicionado por instrucción sobre las mismas demostraciones. No se dispone de datos de rendimiento del SmolVLA en la información proporcionada.

## Limitaciones y advertencias

- El modelo ejecuta una única tarea; no generaliza a otras instrucciones ni objetos.
- No procesa lenguaje: la selección de tarea requiere cargar el checkpoint correcto de forma externa.
- Entrenado con solo 24 demostraciones teleoperadas de un único entorno, por lo que la generalización a cambios de iluminación, disposición de objetos o fondo es incierta.
- Riesgo de sobreajuste al escenario de entrenamiento; no se documentan pruebas de robustez ante variaciones.
- Sesgos conocidos: no disponibles; en robótica de imitación, los sesgos provienen de la distribución de demostraciones del operador.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre seguridad en entornos reales.
- No se especifican requisitos de calibración de cámaras ni del brazo más allá de la configuración descrita.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaaaa000/act_so101_part2_s3
- Variante s1: https://huggingface.co/jaaaa000/act_so101_part2_s1
- Variante s2: https://huggingface.co/jaaaa000/act_so101_part2_s2
- Variante s4: https://huggingface.co/jaaaa000/act_so101_part2_s4
- SmolVLA con las mismas demostraciones: https://huggingface.co/jaaaa000/smolvla_so101_part2
- Dataset: https://huggingface.co/datasets/jaaaa000/so101_part2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
