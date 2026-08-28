# Irfanuruchi/MathForm-8B-MLX-4bit

## Resumen

MathForm-8B-MLX-4bit es una conversión en cuantización de 4 bits del modelo openbmb/MathForm-8B, desarrollado por OpenBMB, realizada por el usuario Irfanuruchi para su ejecución en Apple Silicon mediante el framework MLX. El modelo original está especializado en autoformalización matemática, es decir, la traducción de enunciados matemáticos en lenguaje natural a código verificable en el asistente de pruebas Lean 4, utilizando la librería Mathlib. Esta conversión reduce los requisitos de memoria y almacenamiento, permitiendo ejecutar el modelo en equipos con memoria unificada moderada, como un MacBook Pro con chip M3 Pro y 18 GB de RAM.

La relevancia de este modelo radica en que aborda un problema complejo: la formalización automática de matemáticas requiere no solo comprender el lenguaje natural, sino también mapear conceptos a la jerarquía de tipos y definiciones de Mathlib, garantizando que las declaraciones generadas sean compilables y semánticamente correctas. MathForm-8B se entrenó con un pipeline que combina recuperación de conocimiento de Mathlib, verificación por compilación y refinamiento iterativo, logrando un rendimiento notable en tareas de autoformalización. La versión MLX 4-bit mantiene las capacidades del modelo original a la vez que lo hace accesible para inferencia local en hardware de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3, segun tags del modelo) |
| Parametros totales | 8B (modelo base openbmb/MathForm-8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 40.000 tokens (segun LLM Explorer para el modelo base) |
| Tipos de cuantizacion | 4-bit MLX (group size 64, 4.500 bits/peso efectivos) |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base probablemente soporta ingles y chino, al derivar de Qwen3) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base MathForm-8B es un transformer decoder denso de 8.000 millones de parametros, construido sobre la arquitectura Qwen3. Su entrenamiento se centra en la tarea de autoformalizacion matematica, que va mas alla de la simple traduccion: exige que el modelo comprenda la semantica de los enunciados informales y los exprese en terminos de los tipos y definiciones de Mathlib, la libreria estandar de Lean 4.

El pipeline de entrenamiento, descrito en el paper arXiv 2608.14221, combina varias etapas: recuperacion de conocimiento de Mathlib (para seleccionar definiciones y teoremas relevantes), generacion de candidatos de formalizacion, compilacion y verificacion semantica (para filtrar errores), y un proceso de refinamiento iterativo que mejora la calidad de los datos. Posteriormente se reconstruyen las trayectorias de generacion para entrenar el modelo con supervision. Esta metodologia permite que el modelo aprenda a producir codigo Lean 4 compilable y semanticamente fiel al enunciado original.

La conversion MLX 4-bit no altera la arquitectura ni los pesos del modelo original; simplemente cuantiza los pesos a 4 bits con un grupo de 64, reduciendo el tamaño del modelo de aproximadamente 16 GB a unos 4,3 GB. Esto facilita su ejecucion en hardware Apple con memoria unificada, manteniendo un rendimiento cercano al del modelo en precision completa.

## Capacidades

- Autoformalizacion matematica: convierte enunciados en lenguaje natural a codigo Lean 4 compilable, incluyendo la cabecera del teorema y las importaciones necesarias de Mathlib.
- Generacion de codigo Lean 4: produce teoremas, definiciones y estructuras de prueba, aunque puede incluir el placeholder `sorry` cuando la demostracion no se completa.
- Razonamiento matematico: al estar entrenado sobre el corpus de Mathlib, comprende conceptos matematicos avanzados (analisis real, algebra, topologia, etc.) y sabe como expresarlos formalmente.
- Integracion con Mathlib: utiliza la jerarquia de tipos y definiciones de la libreria, lo que permite que el codigo generado sea compatible con el ecosistema Lean 4.
- Ejecucion local en Apple Silicon: gracias a la cuantizacion MLX, el modelo se ejecuta de forma eficiente en chips M-series, con velocidades de generacion de aproximadamente 27 tokens/s en un M3 Pro.
- No se ha confirmado soporte para tool calling, agentes o capacidades multimodales en la informacion disponible.

## Casos de uso

- Asistencia en demostraciones formales: un investigador puede escribir un enunciado informal y el modelo genera el codigo Lean 4 con el teorema correspondiente, que luego se puede completar manualmente. Es util para acelerar el proceso de formalizacion de matematicas.
- Verificacion de enunciados: dado un teorema informal, el modelo produce una formalizacion candidata que puede compilarse para comprobar su validez, ayudando a detectar ambiguedades o errores en el enunciado original.
- Educacion matematica: estudiantes de Lean 4 pueden usar el modelo para ver como se traducen conceptos matematicos a la sintaxis formal, aprendiendo la estructura de Mathlib y las convenciones de Lean.
- Generacion de ejercicios formalizados: en cursos de matematicas computacionales, el modelo puede convertir problemas de libros de texto en ejercicios Lean 4 listos para ser resueltos por los alumnos.
- Construccion de librerias formales: para proyectos que buscan formalizar grandes areas de las matematicas, el modelo puede generar borradores de teoremas que luego son revisados y completados por expertos, reduciendo el esfuerzo manual.
- Integracion en pipelines de verificacion: en entornos de desarrollo de software verificado, el modelo puede convertir especificaciones informales en precondiciones y postcondiciones Lean 4, facilitando la integracion con herramientas como Mathlib.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta conversion MLX 4-bit en la informacion disponible. El paper original de MathForm (arXiv 2608.14221) incluye evaluaciones sobre conjuntos de datos de autoformalizacion, pero no se proporcionan numeros concretos en la documentacion del repositorio. Para una comparativa detallada, se recomienda consultar el paper y el repositorio oficial de OpenBMB.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,8 GB de memoria unificada en pico, segun la validacion local realizada en un Apple M3 Pro con 18 GB de RAM. El modelo cuantizado ocupa unos 4,3 GB en disco.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 8 GB de memoria unificada (M1, M2, M3 o M4). En equipos con menos memoria, se podria reducir el tamaño de contexto o usar cuantizacion inferior.
- Compatibilidad con consumer GPU: no aplica directamente, ya que MLX esta disenado para Apple Silicon. Para GPUs NVIDIA, habria que convertir el modelo a otros formatos (GGUF, GPTQ, etc.).
- Opciones de despliegue: el modelo se usa con la libreria MLX-LM (version 0.31.3 o superior). El comando `mlx_lm.generate` permite ejecutar inferencia desde linea de comandos. Tambien se puede integrar en aplicaciones Python usando la API de MLX.
- Rendimiento medido: en un M3 Pro, el procesamiento de prompt alcanza 183,786 tokens/s y la generacion 27,155 tokens/s, con un pico de memoria de 4,839 GB.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de autoformalizacion en la informacion proporcionada. Como referencia, el modelo base MathForm-8B se puede comparar con alternativas como:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| MathForm-8B (base) | 8B | 40K | Autoformalizacion Lean 4 | Apache-2.0 |
| LeanDojo (ReProver) | ~1.5B | 2K | Generacion de pruebas Lean | MIT |
| Qwen2.5-Math-7B | 7B | 32K | Razonamiento matematico general | Apache-2.0 |

MathForm-8B se diferencia por su especializacion exclusiva en autoformalizacion, mientras que Qwen2.5-Math se centra en resolver problemas matematicos en lenguaje natural y LeanDojo en la busqueda de pruebas. La conversion MLX 4-bit no cambia las capacidades del modelo base, solo su formato de despliegue.

## Limitaciones y advertencias

- El modelo puede generar codigo Lean 4 con el placeholder `sorry` en lugar de una demostracion completa. Esto es intencional, ya que su objetivo principal es la formalizacion de enunciados, no la demostracion automatica.
- La calidad de la formalizacion depende de la complejidad del enunciado. Para matematicas muy avanzadas o con notacion no estandar, el modelo puede producir codigo incorrecto o incompleto.
- El modelo esta entrenado principalmente en ingles y posiblemente chino (al derivar de Qwen3), por lo que su rendimiento en otros idiomas puede ser limitado.
- La cuantizacion 4-bit puede introducir una ligera degradacion en la precision en comparacion con el modelo en precision completa, aunque en tareas de generacion de codigo suele ser aceptable.
- No se han publicado evaluaciones exhaustivas de sesgos o riesgos de alucinacion para esta conversion. Como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base y de las dependencias de Mathlib.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Irfanuruchi/MathForm-8B-MLX-4bit
- Modelo base: https://huggingface.co/openbmb/MathForm-8B
- Paper arXiv: https://arxiv.org/abs/2608.14221
- Repositorio GitHub de MathForm: https://github.com/OpenBMB/MathForm
- Indice de modelos MLX del autor: https://github.com/IrfanUruchi/mlx-models-
