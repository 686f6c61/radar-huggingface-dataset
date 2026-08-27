# Kai9987kai/supermix-v80

## Resumen

Supermix v80 es un modelo de investigación de 15,3 millones de parámetros desarrollado por Kai9987kai (Kai piper) que resuelve problemas de física, química y aritmética escribiendo su razonamiento paso a paso. Cada ejemplo de entrenamiento fue verificado por un solucionador simbólico exacto antes de ser incluido en el corpus, lo que garantiza que las respuestas sean correctas y no simplemente plausibles. El modelo está diseñado para demostrar que un modelo pequeño puede resolver problemas de forma verificable, no solo fluida.

El modelo emplea una arquitectura híbrida con atención de ventana deslizante y global, mezcla de expertos dispersa, un núcleo de pensamiento recursivo y una cabeza de predicción multi-token para decodificación auto-especulativa. Con 15.269.685 parámetros totales y 3.912.997 activos por token, alcanza una puntuación global de 0,575 en 630 problemas nuevos de 21 tipos de tareas. No es un modelo de chat y su contexto está limitado a 128 tokens.

La relevancia de este modelo radica en su hallazgo principal: la mejora de 0,252 a 0,575 frente a su predecesor v79 se debe únicamente a descomponer las multiplicaciones en pasos más pequeños, lo que demuestra que la forma de expresar el razonamiento es tan importante como la arquitectura. Además, la pérdida de validación no predice la precisión real, por lo que la selección se basa en una sonda periódica de exactitud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención sliding-window/global, MoE dispersa, núcleo de pensamiento recursivo, cabeza multi-token |
| Parametros totales | 15.269.685 |
| Parametros activos | 3.912.997 |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (corpus en inglés, sin especificación oficial) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint .pt) |

## Arquitectura y entrenamiento

La arquitectura combina atención de ventana deslizante y global para capturar dependencias locales y globales, una capa feed-forward con mezcla de expertos dispersa (48 expertos enrutados) para escalar capacidad sin disparar el coste computacional, un núcleo de pensamiento recursivo que permite iterar sobre el razonamiento, y una cabeza de predicción multi-token que habilita decodificación auto-especulativa. El tamaño oculto es de 256 dimensiones con 8 cabezas de atención y un vocabulario de 8.551 tokens.

El corpus de entrenamiento consta de 866.748 filas, de las cuales 415.370 son de ciencia (física y química) y 496.108 de aritmética y diálogo. Cada fila fue generada resolviendo un problema paso a paso y luego verificada con un solucionador determinista basado en `Fraction`/`Decimal`; las filas con discrepancias se descartaron. El modelo no fue entrenado con RLHF ni DPO, sino con un pipeline de generación y verificación simbólica. La innovación clave es la descomposición explícita de multiplicaciones en pasos parciales, que mejoró drásticamente el rendimiento en tareas que requieren multiplicación.

## Capacidades

- Resolución de problemas de física: fuerza, aceleración, momento, trabajo, potencia eléctrica, velocidad de onda, energía cinética, voltaje.
- Resolución de problemas de química: molaridad.
- Aritmética básica y avanzada: multiplicación, división, porcentajes, secuencias, problemas de dos pasos, álgebra de un paso, problemas de palabras.
- Emisión de razonamiento paso a paso verificable, no solo la respuesta final.
- Verificación de respuestas en inferencia mediante `src/answer_check.py`, que re-deriva el resultado para 21 formas de pregunta y devuelve `None` si no puede verificar.
- Normalización de preguntas aritméticas mediante `src/prompt_normaliser.py` para reescribirlas en la forma entrenada.
- No es un modelo de chat: no mantiene conversaciones ni genera texto libre más allá de la resolución de problemas.

## Casos de uso

- Tutoría educativa automatizada: el modelo puede generar soluciones paso a paso para problemas de física y aritmética, permitiendo a estudiantes ver el proceso completo de resolución. Su razonamiento explícito facilita la detección de errores conceptuales.
- Generación de problemas de examen con soluciones verificadas: al entrenar solo con datos validados por un solucionador simbólico, puede producir problemas y respuestas correctas de forma fiable, útil para crear bancos de preguntas en plataformas educativas.
- Verificación de respuestas en sistemas de evaluación: integrando `answer_check.py`, se puede comprobar automáticamente si una respuesta generada es correcta, lo que permite construir pipelines de evaluación sin intervención humana.
- Investigación en razonamiento simbólico: sirve como banco de pruebas para estudiar cómo los modelos pequeños manejan la descomposición de tareas y la verificación externa, con aplicaciones en interpretabilidad y robustez.
- Generación de datos de entrenamiento verificados: el corpus y el generador (`src/build_omni_corpus.py`) pueden reutilizarse para crear datasets de alta calidad para otros modelos, garantizando que cada ejemplo sea correcto.
- Benchmarking de capacidades de razonamiento en modelos pequeños: su diseño permite comparar el efecto de cambios específicos (como la descomposición de multiplicaciones) en la precisión, útil para guiar el desarrollo de arquitecturas más eficientes.
- Prototipado de agentes de resolución de problemas: aunque no es un agente completo, su capacidad de emitir razonamiento paso a paso y verificar resultados puede integrarse en sistemas más grandes que requieran pasos intermedios fiables.

## Benchmarks y rendimiento

El modelo fue evaluado en 630 problemas nuevos generados automáticamente, distribuidos en 21 tipos de tarea. La puntuación global es 0,575, con 0 problemas no parseables. Los resultados por tarea se muestran a continuación, comparados con la versión anterior v79:

| Tarea | v80 | v79 |
|---|---|---|
| multiplicación | 1,00 | 0,93 |
| wave_speed | 0,87 | 0,00 |
| electrical_power | 0,87 | 0,07 |
| word_problem | 0,87 | 0,53 |
| sequence | 0,83 | 0,47 |
| work | 0,80 | 0,07 |
| momentum | 0,80 | 0,10 |
| voltage | 0,80 | 0,13 |
| force | 0,77 | 0,03 |
| molarity | 0,73 | 0,47 |
| two_step | 0,73 | 0,33 |
| arithmetic | 0,63 | 0,33 |
| percent | 0,60 | 0,67 |
| division | 0,60 | 0,50 |
| acceleration | 0,50 | 0,33 |
| power | 0,33 | 0,10 |
| algebra_one_step | 0,30 | 0,20 |
| average | 0,03 | 0,03 |
| arithmetic_series | 0,00 | no disponible |
| combination | 0,00 | no disponible |
| kinetic_energy | 0,00 | no disponible |

Las puntuaciones agregadas son: ciencia 0,539 y aritmética 0,622. El autor advierte explícitamente que no se debe comparar con Supermix v74 (0,894) porque ese modelo se evaluó en un benchmark diferente de 10 tareas aritméticas, mientras que v80 se evalúa en 21 tareas que incluyen 12 de ciencia.

## Requisitos de hardware

- Inferencia en CPU: el autor indica que una respuesta tarda menos de un segundo en CPU, por lo que no se requiere GPU.
- VRAM estimada: con 15,3 millones de parámetros, el modelo ocupa aproximadamente 60 MB en precisión fp32 (15.269.685 × 4 bytes ≈ 61 MB). Cabe en cualquier GPU con al menos 1 GB de VRAM, incluidas GPUs integradas.
- GPUs recomendadas: cualquier GPU moderna, incluso las de gama baja como GTX 1650 o RTX 3050, es suficiente. No se requieren GPUs de datacenter.
- Opciones de despliegue: el modelo se distribuye como checkpoint de PyTorch y se ejecuta con el script `example_usage.py` o mediante la API de carga `load_talk_checkpoint`. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia: menos de 1 segundo por respuesta en CPU, según el autor.

## Comparativa con modelos similares

La comparación más relevante es con las versiones anteriores de la misma serie, ya que comparten arquitectura y corpus:

| Modelo | Parámetros | Activos por token | Contexto | Precisión global | Notas |
|---|---|---|---|---|---|
| Supermix v80 | 15.269.685 | 3.912.997 | 128 | 0,575 (21 tareas) | Incluye 12 tareas de ciencia |
| Supermix v79 | no disponible | no disponible | 128 | 0,252 (21 tareas) | Misma arquitectura, sin descomposición de multiplicación |
| Supermix v74 | 8.575.977 | 2.810.973 | 128 | 0,894 (10 tareas aritméticas) | Benchmark no comparable con v80 |

No se dispone de información sobre otros modelos externos de tamaño similar con los que comparar directamente. La comparación con v74 es engañosa por la diferencia de benchmarks, como advierte el propio autor.

## Limitaciones y advertencias

- No es un modelo de chat: no puede mantener conversaciones ni generar texto libre; solo responde a problemas con formato de razonamiento paso a paso.
- Contexto muy limitado: 128 tokens, insuficiente para problemas largos o multi-paso complejos.
- Tres tareas fallan completamente (arithmetic_series, combination, kinetic_energy) debido a generadores de corpus que no descompusieron las multiplicaciones; el checkpoint fue entrenado antes de corregir estos generadores.
- La tarea `average` tiene una precisión muy baja (0,03), una debilidad heredada del corpus v74.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- Los idiomas soportados no están documentados; el corpus parece estar en inglés, por lo que el rendimiento en otros idiomas es desconocido.
- El modelo puede alucinar respuestas cuando la pregunta no coincide con las formas entrenadas; `answer_check.py` devuelve `None` en esos casos, pero no garantiza corrección.
- La pérdida de validación no es un indicador fiable de precisión; el autor recomienda usar la sonda de exactitud periódica para la selección de modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kai9987kai/supermix-v80
- Perfil del autor: https://huggingface.co/Kai9987kai
- Repositorio GitHub (monorepo Supermix): https://github.com/kai9987kai/Supermix
- Releases del repositorio: https://github.com/kai9987kai/Supermix/releases
- Modelo v74 (para referencia): https://huggingface.co/Kai9987kai/supermix-v74
