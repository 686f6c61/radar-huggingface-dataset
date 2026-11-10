# Autobrik/ecse552-act-oracle-C

## Resumen
Autobrik/ecse552-act-oracle-C es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers) entrenado por el autor Autobrik para el proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado "Learning to Manipulate a New Object from Action-Free Videos". No se trata de un modelo de lenguaje, sino de un modelo de imitación (imitation learning) que mapea observaciones visuales a acciones de control de un brazo robótico, publicado con pipeline `robotics` en Hugging Face.

El modelo parte del código original de ACT de Tony Z. Zhao sin modificaciones arquitectónicas, pero adapta la interfaz de datos: utiliza únicamente imágenes (el estado del robot se pone a cero), rellena las 7 dimensiones de acción propias hasta las 14 del ACT original y emplea episodios de longitud variable con chunks de 20 pasos a 10 Hz (2 segundos por chunk), frente a los 100 pasos a 50 Hz del ACT original. Las acciones son objetivos articulares absolutos.

Su relevancia es acotada: es un artefacto de investigación educativa, con cero descargas y cero likes en el momento de la ficha, y su interés principal es la reproducibilidad de un experimento de manipulación con datos de entrenamiento derivados de vídeos sin acción (action-free) y etiquetado pseudo-supervisado. No debe confundirse con un modelo fundacional de robótica ni con un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), implementación original de tonyzhaozh/act sin modificar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; chunk de 20 pasos a 10 Hz (2 s) por predicción |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt` |

## Arquitectura y entrenamiento
La arquitectura es ACT, un transformer con encoder visual y decoder de acciones que predice secuencias de acciones (action chunks) en lugar de acciones individuales, lo que reduce el error de composición acumulado. En esta variante concreta se alimenta solo con imágenes, con el vector de estado del robot a cero, y se rellenan las 7 dimensiones de acción del entorno con ceros hasta las 14 que espera el código upstream. Los episodios son de longitud variable y el chunk es de 20 pasos a 10 Hz, equivalente temporalmente a los 100 pasos a 50 Hz del ACT original. Las acciones son objetivos articulares absolutos.

El entrenamiento se realizó sobre el dataset Autobrik/ecse552-ocbench-block en la revisión `f7396350f5d70d2d48361fda552028e5a2590774`, con configuración `configs/act_oracle_C.toml` y adaptador `src/action_free/act_original.py`. El nombre "oracle-C" indica que se usan colecciones con etiquetas oracle (variante d) y objetivos pseudo-etiquetados para las variantes (b)/(c); las colecciones concretas se listan en `act_run.json` bajo `data.collections`. No se especifican en la información disponible el número de tokens, el volumen de demostraciones total ni si hubo etapas de RLHF o DPO (no aplicables en este paradigma, pero no confirmados).

Cada directorio `n<demos>/seed<k>/` contiene un run completo con `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt`, `selected.ckpt` (el mejor de los dos según rollouts de validación en el dominio fuente, que es el evaluado en test), `dataset_stats.pkl`, `act_run.json` (argumentos, split y datos), `history.json` (pérdidas por época) y `provenance.json`. La carga se hace con `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)`.

## Capacidades
- Predicción de acciones de manipulación robótica a partir de observaciones visuales, en forma de chunks de 20 pasos a 10 Hz.
- Control de un brazo robótico con acciones absolutas en el espacio articular (7 dimensiones efectivas).
- Aprendizaje por imitación a partir de demostraciones, incluyendo datos derivados de vídeos sin acción y objetivos pseudo-etiquetados.
- Ejecución de políticas en entornos tipo OCBench con el objeto de bloque del dataset ecse552-ocbench-block.
- Múltiples runs reproducibles por número de demostraciones y semilla (`n<demos>/seed<k>/`), lo que permite analizar varianza entre semillas.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso
- Reproducción de experimentos académicos: cargar `selected.ckpt` con `ActPolicy` y replicar los resultados de validación y test del proyecto ECSE 552, usando `history.json` y `provenance.json` para auditar el entrenamiento.
- Estudio de imitación con datos action-free: comparar el rendimiento de la variante oracle (d) frente a las pseudo-etiquetadas (b)/(c) para medir cuánto se pierde al sustituir demostraciones reales por etiquetas generadas.
- Análisis de sensibilidad al número de demostraciones: los directorios `n<demos>/` permiten trazar curvas de rendimiento frente al tamaño del dataset sin reentrenar.
- Análisis de varianza entre semillas: los runs `seed<k>/` permiten estimar la estabilidad del entrenamiento de ACT en esta tarea concreta.
- Línea base para investigación en manipulación: servir como referencia ACT "vanilla" contra la que comparar variantes con estado del robot, otras frecuencias de control o chunks de distinta longitud.
- Docencia y formación: usar el checkpoint como ejemplo práctico de pipeline completo (dataset, configuración, adaptador, checkpoints y selección por validación) en un curso de aprendizaje por imitación.
- Evaluación de robustez visual: al depender solo de imágenes, permite estudiar cómo afectan cambios de iluminación, cámara u oclusiones a una política ACT entrenada sin estado proprioceptivo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; ACT es un transformer comparativamente pequeño, pero el número de parámetros no se documenta y no se puede estimar con rigor.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño típico de ACT, una GPU consumer moderna (por ejemplo, RTX 3090 o RTX 4090) sería suficiente en la mayoría de configuraciones, pero esto es una inferencia general y no un dato del autor.
- ¿Cabe en GPU consumer? No confirmado por el autor; probablemente sí para inferencia en FP32/FP16 dado el tamaño habitual de ACT, pero sin cifras verificadas.
- Opciones de despliegue: carga mediante `action_free.act_original.ActPolicy` del repositorio `BrikHMP18/ecse-552-project`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. El control opera a 10 Hz con chunks de 20 pasos, lo que fija un requisito temporal de 2 segundos por chunk, pero no se publican medidas de latencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-oracle-C | no disponible | chunk 20 a 10 Hz | Manipulación de bloque (OCBench) | MIT | Hugging Face, 0 descargas |
| ACT original (tonyzhaozh/act) | no disponible | chunk 100 a 50 Hz | Manipulación general (ALOHA, sim) | MIT (repo upstream) | GitHub |
| Otros checkpoints del mismo proyecto (variantes b/c/d) | no disponible | chunk 20 a 10 Hz | Manipulación de bloque | MIT | Referenciados en `act_run.json`, no listados individualmente |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a aspectos de configuración y disponibilidad.

## Limitaciones y advertencias
- Modelo de nicho y artefacto académico: cero descargas y cero likes, sin validación externa conocida; no apto como componente de producción sin evaluación propia.
- Entrenado para un único entorno y objeto (bloque de OCBench); no generaliza a otras tareas, morfologías de robot ni objetos sin reentrenamiento.
- Dependencia exclusiva de imágenes: el estado del robot se pone a cero, lo que elimina información propioceptiva que en ACT original puede mejorar la precisión.
- Relleno de acciones de 7 a 14 dimensiones con ceros: cualquier consumidor debe conocer esta convención para interpretar correctamente las salidas.
- Acciones absolutas en espacio articular: requieren calibración y cinemática del robot concretos; no son portables entre plataformas sin adaptación.
- Riesgo de sobreajuste al dominio visual del dataset (cámaras, iluminación y fondo específicos); no se documentan evaluaciones de robustez.
- Sesgos conocidos: no documentados por el autor; en imitación, el modelo hereda los sesgos y errores de las demostraciones y de las pseudo-etiquetas.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de copyright.
- No disponible información sobre límites de contexto, idiomas ni cuantización porque no son aplicables a este tipo de modelo.

## Enlaces
- Hugging Face: https://huggingface.co/Autobrik/ecse552-act-oracle-C
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
