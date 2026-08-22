# GermannM/kenga-prophet-m5

## Resumen

Kenga Prophet M5 es un modelo de lenguaje experimental de tamaño reducido, desarrollado por GermannM, cuyo propósito no es competir en tareas generales de NLP, sino investigar el impacto de la calidad y estructura de los datos de entrenamiento en la capacidad de generalización de un modelo. El experimento que define a M5 es mantener fija la arquitectura y el presupuesto de parámetros de su predecesor (M4.2, ~838K parámetros) y modificar únicamente la fuente y estructura de la señal de entrenamiento. El resultado es una mejora drástica: M4.2, entrenado con un corpus real de Kenga, generaba un 0% de programas compilables sobre plantillas no vistas, mientras que M5, entrenado con un corpus sintético verificado por compilador, alcanza un 100% de tasa de compilación y ejecución en el mismo escenario.

El modelo es un decoder transformer de arquitectura pura implementado en NumPy, entrenado desde cero en CPU. Con un contexto de 128 tokens y 838. 6 millones de parámetros, está diseñado específicamente para el lenguaje de programación Kenga, un lenguaje pequeño y experimental. Su relevancia radica en que demuestra empíricamente que la calidad y verificación de los datos de entrenamiento puede tener un impacto mayor que el aumento de parámetros o la modificación arquitectónica, un hallazgo relevante para la investigación en eficiencia de entrenamiento y síntesis de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (implementación pura en NumPy) |
| Parámetros totales | ~838. 6 (838. 6 K) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantización | No disponible (implementación en NumPy con pesos en texto plano) |
| Idiomas soportados | No disponible (diseñado para el lenguaje de programación Kenga, no para lenguaje natural) |
| Licencia | Apache 2. 0 |
| Formato de pesos | Texto plano (fichero de pesos `mid_prophet_m5_w. txt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de configuración fija: 128 de contexto (K), 128 de dimensión de modelo (D), 8 cabezas de atención (H=8) y 6 capas (L=6), lo que resulta en aproximadamente 838. 000 parámetros. El modelo se implementa íntegramente en NumPy, sin dependencias de frameworks de deep learning, y se entrena desde cero en CPU.

El entrenamiento utiliza un objetivo de modelado de lenguaje causal por posición, con el optimizador Adam y recorte de gradiente global con clip=1,0 y una tasa de aprendizaje de 0,002. Un dato relevante de reproducibilidad es que la primera ejecución de M5 divergió en el paso ~400 sin recorte de gradiente; el recorte es parte esencial de la configuración reproducible. El entrenamiento consta de 2400 pasos con un tamaño de lote de 64, lo que supone unas 3 horas en CPU.

La innovación técnica clave no está en la arquitectura, sino en el corpus de entrenamiento. M5 se entrena con un corpus sintético generado por la "Kenga Corpus Factory", un pipeline de generación de datos que produce programas en Kenga, los compila y ejecuta con el runtime real `kenga-lite`, y solo conserva los que pasan la verificación. El corpus incluye 14. 585 programas generados en 4 familias (funciones de expresión aritmética, bucles de rango, recursión —incluyendo Fibonacci— y cadenas de llamadas), 16. 399 variantes de equivalencia semántica re-verificadas para producir salida byte-idéntica, y 10. 343 pares de reparación de mutaciones (que se publican para un futuro modelo de reparación, pero no se incluyen en el entrenamiento del LM). El corpus se divide por plantilla con enmascaramiento de literales: 13. 411 programas para entrenamiento y 1. 174 para test, con solapamiento de plantillas igual a 0.

## Capacidades

- Generación de código en Kenga: el modelo genera programas completos en el lenguaje de programación Kenga a partir de un prefijo de código, alcanzando un 100% de tasa de compilación y un 100% de tasa de ejecución en plantillas no vistas durante el entrenamiento.
- Generalización a plantillas no vistas: el modelo es capaz de producir programas que se compilan y ejecutan correctamente incluso cuando la estructura del programa (plantilla con literales enmascarados) no aparece en el corpus de entrenamiento, con una precisión de siguiente token del 89,26% en este escenario.
- Transferencia a código real: el modelo muestra cierta capacidad de transferencia a código Kenga escrito por humanos, con una precisión de siguiente token del 11,74% (el azar sería ~0,8%), lo que indica que hay generalización más allá del corpus sintético, aunque modesta.
- Razonamiento estructural: el modelo es capaz de aprender y generalizar patrones estructurales de programación, como la equivalencia entre recursión e iteración, y de generar programas correctos dentro de las cuatro familias de programas del corpus.
- Sin capacidades generales: el modelo no es un modelo de lenguaje general. No genera texto natural, no tiene soporte de tool calling, ni de agentes, ni capacidades multilingües. Está diseñado exclusivamente para la experimentación con el lenguaje Kenga.

## Casos de uso

- Investigación en síntesis de datos verificados: el modelo es una prueba de concepto de que un corpus sintético verificado por compilador puede resolver la brecha de generalización que un corpus real pequeño no puede. Se puede usar como referencia para diseñar pipelines de generación de datos sintéticos verificados para otros lenguajes pequeños o DSLs.
- Estudio de la brecha entre datos sintéticos y reales: el modelo es útil para investigar el "domain gap" entre código generado y código humano. Los autores reportan una transferencia del 11,74% a código real, lo que convierte a M5 en un banco de pruebas para técnicas que reduzcan esa brecha (por ejemplo, mezcla de datos, adaptación, etc.).
- Benchmark para evaluar la calidad de corpus: el modelo puede servir como un punto de referencia para evaluar la calidad de un corpus de entrenamiento en lenguajes de programación pequeños. Dado que la arquitectura es fija y está documentada, se puede usar para comparar el impacto de diferentes estrategias de generación de datos.
- Reproducción de experimentos de investigación: el código completo del pipeline (entrenador, fábrica de corpus, división de plantillas, evaluación de generación y evaluación de código real) está disponible, lo que permite reproducir el experimento completo en CPU en unas 3 horas y usarlo como base para nuevas investigaciones.
- Entrenamiento de modelos de reparación de código: los pares de reparación de mutaciones (10.343 pares) se publican junto al modelo, con la intención explícita de entrenar un futuro modelo de reparación de código. M5 sirve como base para ese trabajo futuro.
- Enseñanza de arquitecturas transformer: al estar implementado en NumPy puro y ser entrenable en CPU en horas, es un recurso didáctico excelente para entender el funcionamiento interno de un transformer decoder, el proceso de tokenización, el entrenamiento con recorte de gradiente y la evaluación de modelos de generación de código.

## Benchmarks y rendimiento

La información proporcionada incluye resultados de evaluación del modelo M5 en comparación con su predecesor M4.2, medidos en un split de test con plantillas no vistas en el entrenamiento.

| Métrica | M4.2 (~838K, corpus real) | M5 (~838K, corpus de fábrica) |
|---|---|---|
| Tokens de entrenamiento | 0,49 M | 1,81 M |
| Precisión NT en held-out (template-split) | — | 89,26 % |
| Tasa de compilación en generación (plantillas no vistas) | 0 % | 100 % |
| Tasa de ejecución en generación | 0 % | 100 % |
| Coincidencia de valor (greedy) | 0 % | 20,0 % |
| Coincidencia de valor pass@4 | 5 % | 32,5 % |
| Transferencia zero-shot a código real | — | 11,74 % |

Nota: la transferencia a código real es del 11,74% (el azar sería ~0,8%). Los resultados de M4.2 son los que se reportan en la model card como referencia. No se han publicado resultados de benchmarks comparativos con otros modelos, ya que es un modelo experimental y específico.

## Requisitos de hardware

- Entrenamiento: el modelo se entrenó en CPU en aproximadamente 3 horas (2400 pasos, batch 64). No se especifica el modelo de CPU, pero es un entrenamiento viable en cualquier CPU moderna.
- Inferencia: al ser un modelo de ~838. 000 parámetros, la inferencia es extremadamente ligera. Se puede ejecutar en CPU sin necesidad de GPU.
- VRAM estimada: no aplica; el modelo no requiere GPU. En caso de usar GPU, cabría incluso en las GPUs más modestas (menos de 1 GB de VRAM).
- GPU recomendada: no es necesaria ninguna GPU. Cualquier CPU es suficiente.
- Opciones de despliegue: el modelo se distribuye con un script de inferencia (`kenchat.py`) que usa NumPy. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato de pesos no es estándar.
- Latencia: al ser un modelo pequeño, la latencia de generación es mínima, del orden de milisegundos por token en CPU.

## Comparativa con modelos similares

No hay una categoría de modelos comparables, ya que M5 es un modelo experimental específico para el lenguaje Kenga. Los modelos de propósito general de tamaño similar (por ejemplo, modelos de lenguaje pequeños de ~1 M de parámetros) no están entrenados para generación de código y no tienen un corpus de verificación. La comparativa natural es con su predecesor M4.2, que comparte arquitectura y presupuesto de parámetros, y que ya se ha presentado en la tabla de benchmarks.

No hay otros modelos de la misma categoría en la información disponible.

## Limitaciones y advertencias

- El modelo está limitado a las cuatro familias de programas del corpus (expresiones aritméticas, rangos, recurses, cadenas de llamadas). No genera programas fuera de estas estructuras.
- La transferencia a código real es modesta (11,74% de precisión de siguiente token), lo que indica que el modelo aún no generaliza bien a código humano. Este es el principal gap de investigación reportado.
- El modelo es un experimento de investigación, no es un producto. No se recomienda su uso en producción para ningún propósito.
- La arquitectura en NumPy puro no es eficiente para producción en comparación con implementaciones optimizadas (PyTorch, etc.).
- Los pesos se almacenan en un formato de texto plano, no en un formato estándar como safetensors o GGUF, lo que limita la interoperabilidad con herramientas estándar.
- No hay información sobre sesgos, ya que el modelo no procesa lenguaje natural.
- La licencia Apache 2. 0 permite uso comercial, pero el modelo no es útil para productos comerciales reales debido a su limitación a Kenga.

## Enlaces

- Hugging Face: https://huggingface.co/GermannM/kenga-prophet-m5
- Modelo predecesor: https://huggingface.co/GermannM/kenga-prophet
- El código completo del pipeline se incluye en el repositorio del modelo en Hugging Face (directorio `code/`), incluyendo el entrenador, la fábrica de corpus, la división de plantillas, la evaluación de generación, la evaluación de código real y los scripts de inferencia.
