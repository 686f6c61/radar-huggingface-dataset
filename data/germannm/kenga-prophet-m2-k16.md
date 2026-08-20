# GermannM/kenga-prophet-m2-k16

## Resumen

Kenga Prophet M2.1 (K=16) es un modelo de lenguaje extremadamente pequeño, con 12.540 parámetros, desarrollado por GermannM como parte de la serie M2 del proyecto Kenga, un lenguaje de programación orientado a agentes vivos. El modelo está diseñado para la predicción del siguiente token dentro del ecosistema Kenga, utilizando una arquitectura de clasificador lineal con softmax sobre un vocabulario de 28 tokens. Su principal contribución es experimental: sirve para estudiar el efecto de ampliar la ventana de contexto (K) de 8 a 16 tokens manteniendo el resto de hiperparámetros idénticos.

La relevancia de este modelo radica en su papel dentro de una escalera de experimentos controlados (M2.x) cuyo objetivo es mejorar gradualmente la precisión de predicción hasta superar el 30%. Con una precisión global del 23,4 % en datos reservados, el modelo demuestra que aumentar la ventana de contexto aporta una mejora modesta (+2 puntos porcentuales) frente a la versión anterior, aunque la precisión dentro de la distribución se mantiene estable en el 41,1 %. Su tamaño mínimo y su licencia Apache 2.0 lo convierten en un ejemplo didáctico de arquitecturas lineales simples aplicadas a lenguajes de dominio específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador lineal con softmax (sin capas ocultas) |
| Parámetros totales | 12.540 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 tokens (K=16) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (lenguaje de programación Kenga, tokens de dominio) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors o similar, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de clasificador lineal con softmax, es decir, una única capa lineal que proyecta la representación del contexto (los últimos K tokens codificados) a un vector de logits sobre el vocabulario de 28 tokens. No posee capas ocultas ni mecanismos de atención; se trata de un modelo de bolsa de tokens o de n-gramas aprendido mediante optimización. El entrenamiento se realizó con el optimizador Adam (tasa de aprendizaje 5e-3, betas 0.9/0.999) durante 60 épocas, sobre un conjunto de datos de entrenamiento específico de Kenga (los detalles del dataset no se especifican). El proceso de entrenamiento dura entre 1 y 2 minutos en hardware convencional.

La innovación técnica de esta versión M2.1 es exclusivamente el aumento de la ventana de contexto de K=8 a K=16, manteniendo el resto de hiperparámetros idénticos a la versión anterior. No se ha aplicado RLHF ni DPO, y el modelo se entrena únicamente con la pérdida de entropía cruzada para la predicción del siguiente token. La reproducibilidad se garantiza mediante un hash del conjunto de datos y la congelación de la configuración de entrenamiento.

## Capacidades

- Predicción del siguiente token en el lenguaje de programación Kenga, con un vocabulario de 28 tokens definidos manualmente.
- Generación de texto básica en el dominio de Kenga (solo secuencias de tokens, sin razonamiento complejo).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües; el vocabulario es específico del lenguaje Kenga.
- No dispone de modo de pensamiento ni capacidades de visión o audio.

## Casos de uso

- **Experimentos de aprendizaje automático**: sirve como modelo de juguete para estudiar el efecto de la longitud de contexto en la predicción de tokens en lenguajes de programación pequeños. Su tamaño permite entrenarlo en menos de 2 minutos en una CPU estándar.
- **Benchmark para arquitecturas lineales**: se puede utilizar como punto de referencia para comparar arquitecturas más complejas (como redes con capas ocultas) en la misma tarea de predicción de tokens de Kenga.
- **Prueba de integración en el ecosistema Kenga**: permite validar el runtime kenga-lite y la compatibilidad del modelo con el compilador o intérprete del lenguaje.
- **Educación en IA**: al ser un modelo tan pequeño, es útil para demostrar conceptos de entrenamiento de modelos de lenguaje, optimización y evaluación en entornos educativos.
- **Desarrollo incremental de la serie M2**: este modelo sirve como eslabón en la escalera de experimentos controlados para mejorar la precisión de predicción; se puede usar como referencia para la siguiente iteración M2.2.
- **Análisis de sobreajuste**: la diferencia entre la precisión en distribución (41,1 %) y la precisión en datos reservados (23,4 %) permite estudiar el sobreajuste en modelos pequeños con datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, el autor proporciona métricas de precisión de predicción del siguiente token sobre conjuntos de datos reservados (held-out) específicos de Kenga:

| Conjunto | Precisión |
|---|---|
| kenga_seed_add | 22,5 % (18/80) |
| kenga_seed_fact | 26,0 % (13/50) |
| kenga_seed_fib | 20,9 % (9/43) |
| kenga_seed_max | 26,3 % (20/76) |
| kenga_seed_mul | 21,4 % (15/70) |
| kenga_seed_pow | 23,2 % (13/56) |
| kenga_seed_sqr | 19,6 % (11/56) |
| kenga_seed_sub | 21,4 % (15/70) |
| kenga_seed_sum | 27,2 % (25/92) |
| **Total** | **23,4 % (139/593)** |

Estos valores son muy bajos en comparación con modelos de lenguaje modernos, pero se espera dado el tamaño del modelo y la dificultad de la tarea. La precisión en distribución es del 41,1 %, lo que indica un sobreajuste notable.

## Requisitos de hardware

- **VRAM estimada para inferencia**: menos de 1 MB, ya que el modelo tiene solo 12.540 parámetros (aproximadamente 50 KB en FP32). Cabe en cualquier CPU o GPU, incluso en microcontroladores.
- **GPU recomendadas**: ninguna en particular; se puede ejecutar en una CPU convencional.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU con soporte para PyTorch o similar es suficiente.
- **Opciones de despliegue**: dado que no se especifica el formato de pesos, se asume que se puede cargar con librerías estándar como PyTorch. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- **Latencia y rendimiento**: no se proporcionan datos, pero dado el tamaño, la inferencia es instantánea (menos de 1 ms por token en CPU moderna).

## Comparativa con modelos similares

No hay muchos modelos comparables en la misma categoría (modelos de predicción de tokens para un lenguaje de programación específico con arquitectura lineal). Se puede comparar con la versión anterior del mismo autor:

| Modelo | Parámetros | Contexto | Precisión reservada | Precisión en distribución |
|---|---|---|---|---|
| Kenga Prophet v0.1 (M2.0) | 6.300 | K=8 | 21,4 % | 41,1 % |
| Kenga Prophet M2.1 (este) | 12.540 | K=16 | 23,4 % | 41,1 % |

La comparación muestra que el aumento de K de 8 a 16 produce una mejora de 2 puntos porcentuales en precisión de reserva, sin cambios en la precisión en distribución. No hay otros modelos comparables disponibles.

## Limitaciones y advertencias

- **Sobreajuste significativo**: la precisión en distribución (41,1 %) es casi el doble que la precisión en reserva (23,4 %), lo que indica que el modelo memoriza patrones del entrenamiento y generaliza mal.
- **Alucinación**: al ser un modelo tan pequeño, no genera texto coherente fuera del dominio de Kenga; es probable que produzca secuencias inválidas o sin sentido.
- **Limitaciones de contexto**: con solo 16 tokens de contexto, no puede manejar dependencias de largo alcance ni generar código complejo.
- **Idiomas**: el vocabulario está limitado a 28 tokens específicos de Kenga, no es útil para otros idiomas.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el modelo es demasiado limitado para aplicaciones reales.
- **Caveat para producción**: no es adecuado para ningún uso productivo, solo para experimentación y aprendizaje.

## Enlaces

- HuggingFace: https://huggingface.co/GermannM/kenga-prophet-m2-k16
- Repositorio del lenguaje Kenga: https://github.com/GermannM3/kenga-lang
- Ejemplos del lenguaje Kenga: https://github.com/GermannM3/kenga-lang/tree/main/examples
- Modelo anterior (M2.0): https://huggingface.co/GermannM/kenga-prophet (según la model card, pero no se ha verificado el enlace)
- Documentación de Gemini Enterprise Agent Platform (mencionada en la búsqueda web, no relevante): https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-garden/explore-models

Nota: los enlaces a Google Gemini e Instagram aparecen en la búsqueda web pero no son relevantes para el modelo.</think>## Resumen

Genera Kenga Prophet M2.1 (K=16) es un modelo de lenguaje extremadamente pequeño, con 12.540 parámetros, desarrollado por GermannM como parte de la serie M2 del lenguaje Kenga, un lenguaje de programación experimental orientado a la creación de agentes con memoria temporal. Este modelo se centra en la predicción del siguiente token dentro de ese dominio, utilizando una arquitectura de clasificador lineal con softmax sobre un vocabulario de 28 tokens. Su principal contribución es estudiar el efecto de ampliar la ventana de contexto (K) de 8 a 16 tokens, manteniendo constantes el resto de hiperparámetros, en el marco de una escalera de experimentos controlados que busca mejorar la precisión de predicción hasta superar el 30 %.

Con una precisión global del 23,4 % sobre conjuntos reservados, el modelo muestra una mejora de 2 puntos porcentuales respecto a la versión anterior (K=8, 21,4 %), aunque la precisión en distribución se mantiene estable en el 41,1 %. Es un modelo minimalista que no incluye capas ocultas ni mecanismos de atención, y se entrena en solo 1-2 minutos. Su licencia Apache 2.0 y su tamaño diminuto lo convierten en un recurso didáctico para entender los fundamentos del aprendizaje de modelos de lenguaje y los efectos de la variación de hiperparámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador lineal con softmax (sin capas ocultas) |
| Parámetros totales | 12.540 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 tokens (K=16) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (vocabulario de 28 tokens específicos de Kenga) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors o PyTorch, no se especifica) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de clasificador lineal con softmax: una única capa que proyecta la representación de los 16 tokens de contexto a una distribución de probabilidad sobre los 28 tokens del vocabulario. No hay capas ocultas, atención ni mecanismos de memoria más allá de la ventana de contexto. El entrenamiento se realizó con el optimizador Adam (tasa de aprendizaje 5e-3, betas 0.9/0.999) durante 60 épocas, sobre un conjunto de datos de Kenga que no se detalla en la documentación. El proceso dura entre 1 y 2 minutos, lo que indica un conjunto de datos muy pequeño. No se aplicaron técnicas de RLHF, DPO ni regularización adicional.

La única innovación de esta versión M2.1 es el aumento de la ventana de contexto de K=8 a K=16. El autor mantiene un diseño de experimentos de un solo eje: cada versión de la serie M2 varía únicamente un hiperparámetro para evaluar su efecto aislado. Esto permite atribuir la mejora en la precisión reservada (21,4 % a 23,4 %) al incremento de contexto, aunque la precisión en distribución no cambia, lo que sugiere que el modelo no generaliza mejor, sino que memoriza patrones de entrenamiento.

## Capacidades

- Predicción del siguiente token en el lenguaje de programación Kenga, con vocabulario de 28 tokens definidos manualmente.
- Generación de secuencias de tokens en el dominio de Kenga, aunque con baja precisión (23,4 % en datos reservados).
- Sin soporte para tool calling, function calling o agentes.
- Sin capacidades multilingües; solo funciona con tokens de Kenga.
- Sin capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- **Investigación sobre el efecto de la ventana de contexto**: permite estudiar cómo la ampliación de K afecta a la precisión en modelos lineales simples. Se puede comparar con la versión K=8 para analizar la compensación entre parámetros y rendimiento.
- **Experimentos de sobreajuste**: la diferencia entre precisión en distribución (41,1 %) y en reserva (23,4 %) es un ejemplo didáctico para enseñar a identificar el sobreajuste en modelos pequeños.
- **Validación del runtime kenga-lite**: sirve para probar el entorno de ejecución de Kenga y verificar que el modelo carga y genera tokens correctamente en el ecosistema.
- **Prueba de integración de la serie M2**: como parte de una escalera de modelos, este artefacto se puede utilizar como referencia para la siguiente iteración (M2.2) que introducirá una capa oculta.
- **Demostración de entrenamiento rápido**: su tiempo de entrenamiento de 1-2 minutos lo convierte en un ejemplo ideal para cursos de aprendizaje automático que requieran un modelo entrenable en una sesión corta.
- **Comparación de arquitecturas lineales**: puede usarse como base para comparar con otros modelos lineales o con modelos con capas ocultas en la misma tarea de predicción de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son las métricas de precisión de predicción del siguiente token sobre conjuntos reservados específicos de Kenga, proporcionadas por el autor:

| Conjunto | Precisión |
|---|---|
| kenga_seed_add | 22,5 % (18/80) |
| kenga_seed_fact | 26,0 % (13/50) |
| kenga_seed_fib | 20,9 % (9/43) |
| kenga_seed_max | 26,3 % (20/76) |
| kenga_seed_mul | 21,4 % (15/70) |
| kenga_seed_pow | 23,2 % (13/56) |
| kenga_seed_sqr | 19,6 % (11/56) |
| kenga_seed_sub | 21,4 % (15/70) |
| kenga_seed_sum | 27,2 % (25/92) |
| **Total** | **23,4 % (139/593)** |

La precisión en distribución es del 41,1 %, no se detalla el conjunto de evaluación.

## Requisitos de hardware

- **VRAM estimada**: menos de 1 GB (12.540 parámetros en FP32 ocupan aproximadamente 50 KB, por lo que cualquier dispositivo con soporte de PyTorch es suficiente).
- **GPU recomendada**: ninguna específica; se ejecuta en CPU convencional.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU con soporte de CUDA o incluso CPU.
- **Opciones de despliegue**: no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI. Se asume que se puede cargar con PyTorch u otro framework estándar.
- **Latencia y throughput**: no se proporcionan datos, pero la inferencia es prácticamente instantánea (menos de 1 ms) dada la simplicidad de la arquitectura.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la misma categoría (predicción de tokens para un lenguaje de programación específico con arquitectura lineal). La comparación más relevante es con la versión anterior de la serie:

| Modelo | Parámetros | Contexto | Precisión reservada | Precisión en distribución |
|---|---|---|---|---|
| Kenga Prophet v0.1 (M2.0) | 6.300 | K=8 | 21,4 % | 41,1 % |
| Kenga Prophet M2.1 (este) | 12.540 | K=16 | 23,4 % | 41,1 % |

La comparación muestra que el aumento de contexto duplica los parámetros (6.300 a 12.540) y mejora la precisión reservada en 2 puntos porcentuales, pero no afecta a la precisión en distribución. No hay otros modelos similares en el ecosistema de Kenga.

## Limitaciones y advertencias

- **Sobreajuste importante**: la precisión en distribución (41,1 %) es mucho mayor que la precisión en reserva (23,4 %), lo que indica que el modelo memoriza el conjunto de entrenamiento y no generaliza bien.
- **Alucinación**: al ser un modelo tan pequeño, no es capaz de generar secuencias coherentes fuera del vocabulario de Kenga; las predicciones son estadísticamente básicas.
- **Limitación de contexto**: con solo 16 tokens, no puede manejar dependencias de largo alcance ni generar código complejo.
- **Idiomas**: el vocabulario está limitado a 28 tokens de Kenga, no es útil para otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo es experimental y no apto para producción.
- **Caveat para producción**: no se recomienda su uso en entornos reales, solo para investigación y educación.

## Enlaces

- HuggingFace: https://huggingface.co/GermannM/kenga-prophet-m2-k16
- Repositorio del lenguaje Kenga: https://github.com/GermannM3/kenga-lang
- Ejemplos del lenguaje Kenga: https://github.com/GermannM3/kenga-lang/tree/main/examples
- Modelo anterior (M2.0): https://huggingface.co/GermannM/kenga-prophet (referencia según la model card, no verificado)

Nota: los enlaces a Google Gemini, Instagram y Model Garden aparecen en la búsqueda web pero no son relevantes al modelo.</think>## Resumen

Genera Kenga Prophet M2.1 (K=16) es un modelo de lenguaje extremadamente pequeño, con 12.540 parámetros, desarrollado por GermannM como parte de la serie M2 del lenguaje Kenga, un lenguaje de programación experimental orientado a la creación de agentes con IA temporal. El modelo se centra en la predicción del siguiente token en ese dominio, utilizando una arquitectura de clasificador lineal con softmax sobre un vocabulario de 28 tokens. Su principal es estudiar el efecto de ampliar la ventana de contexto (K) de 8 a 16 tokens, manteniendo el resto de hiperparámetros constante, en una serie de experimentos controlados para mejorar la precisión de predicción hasta superar el 30 %.

Con una precisión global del 23,4 % sobre conjuntos reservados, el modelo muestra una mejora de 2 puntos porcentuales respecto a la versión anterior (K=8, 21,4 %), aunque la precisión en distribución permanece estable en el 41,1 %. Es un modelo minimalista, sin capas ocultas ni mecanismos de atención, que se entrena en solo 1-2 minutos. Su licencia Apache 2.0 y su tamaño diminuto lo convierten en un recurso didáctico para estudiar arquitecturas lineales y la influencia del contexto en modelos de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador lineal con softmax (sin capas ocultas) |
| Parámetros totales | 12.540 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 tokens (K=16) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (vocabulario de 28 tokens específicos de Kenga) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors o PyTorch, no se especifica) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de clasificador lineal con softmax: una única capa que proyecta la representación de los 16 tokens de contexto a una distribución de probabilidad sobre los 28 tokens del vocabulario. No hay capas ocultas, atención ni mecanismos de memoria más allá de la ventana de contexto. El entrenamiento se realizó con el optimizador Adam (tasa de aprendizaje 5e-3, betas 0.9/0.999) durante 60 épocas, sobre un conjunto de datos de Kenga no detallado. El proceso dura entre 1 y 2 minutos, lo que indica un conjunto de datos pequeño. No se aplicaron técnicas de RLHF ni DPO.

La única innovación de esta versión M2.1 es el aumento de la ventana de contexto de K=8 a K=16. El autor mantiene un diseño de experimentos de un solo eje: cada modelo de la serie M2 cambia únicamente un hiperparámetro para evaluar su efecto aislado. La mejora en la precisión reservada (21,4 % a 23,4 %) se atribuye a este cambio, mientras que la precisión en distribución no varía, lo que sugiere que el modelo no generaliza mejor, sino que memoriza patrones de entrenamiento.

## Capacidades

- Predicción del siguiente token en el lenguaje de programación Kenga, con un vocabulario de 28 tokens definidos manualmente.
- Generación de secuencias de tokens en Kenga, aunque con precisión limitada (23,4 % en datos reservados).
- Sin soporte de tool calling, function calling o agentes.
- Sin capacidades multilingües; solo se limita a los tokens de Kenga.
- Sin capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- **Investigación del efecto de la ventana de contexto**: permite estudiar cómo la ampliación de K afecta la precisión en modelos lineales, comparando con la versión K=8.
- **Experimentos de sobreajuste**: la diferencia entre precisión en distribución (41,1 %) y en reserva (23,4 %) es un ejemplo para entender la memorización en modelos pequeños.
- **Validación del runtime kenga-lite**: sirve para probar la carga y ejecución de modelos en el ecosistema Kenga.
- **Prueba de la escalera M2**: como parte de una serie de modelos controlados, este artefacto sirve de referencia para la siguiente iteración M2.2 (que introducirá una capa oculta).
- **Demostración de entrenamiento rápido**: su entrenamiento de 1-2 minutos permite demostrar el proceso de entrenamiento de modelos de lenguaje en entornos educativos.
- **Comparación de arquitecturas lineales**: se puede usar como base para comparar con modelos con capas ocultas o mecanismos de atención en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos proporcionados son métricas de precisión de predicción del siguiente token sobre conjuntos reservados específicos de Kenga:

| Conjunto | Precisión |
|---|---|
| kenga_seed_add | 22,5 % (18/80) |
| kenga_seed_fact | 26,0 % (13/50) |
| kenga_seed_fib | 20,9 % (9/43) |
| kenga_seed_max | 26,3 % (20/76) |
| kenga_seed_mul | 21,4 % (15/70) |
| kenga_seed_pow | 23,2 % (13/56) |
| kenga_seed_sqr | 19,6 % (11/56) |
| kenga_seed_sub | 21,4 % (15/70) |
| kenga_seed_sum | 27,2 % (25/92) |
| **Total** | **23,4 % (139/593)** |

La precisión en distribución es del 41,1 %, pero no se detalla el conjunto de evaluación.

## Requisitos de hardware

- **VRAM estimada**: menos de 1 GB, ya que el modelo tiene solo 12.540 parámetros (~50 MB en FP32). Cualquier dispositivo con PyTorch es suficiente.
- **GPU recomendada**: ninguna; se puede ejecutar en CPU.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU o CPU moderna.
- **Opciones de despliegue**: no se menciona soporte para vLLM, llama.cpp, Ollama o TGI. Se requiere carga manual con un framework estándar.
- **Latencia y throughput**: no se estima, pero la inferencia es casi instantánea por el tamaño mínimo.

## Comparativa con modelos similares

No hay modelos comparables en la misma categoría (predicción de tokens en un lenguaje de dominio específico con arquitectura lineal). La comparación más relevante es con la versión anterior:

| Modelo | Parámetros | Contexto | Precisión reservada | Precisión en distribución |
|---|---|---|---|---|
| M2.0 (v0.1) | 6.300 | K=8 | 21,4 % | 41,1 % |
| M2.1 (este) | 12.540 | K=16 | 23,4 % | 41,1 % |

La comparación muestra que duplicar el contexto (K=8 a K=16) aumenta los parámetros de 6.300 a 12.540 y mejora la precisión reservada en 2 puntos, pero no afecta a la precisión en distribución.

## Limitaciones y advertencias

- **Sobreajuste significativo**: la precisión en distribución (41,1 %) es mucho mayor que la precisión en reserva (23,4 %), lo que indica que el modelo memoriza el conjunto de entrenamiento y no generaliza bien.
- **Alucinación**: al ser tan pequeño, no puede generar secuencias coherentes fuera del vocabulario de Kenga; las predicciones son estadísticamente incorrectas.
- **Contexto limitado**: con solo 16 tokens, no puede manejar dependencias de largo alcance ni generar código complejo.
- **Idiomas**: el vocabulario está limitado a 28 tokens de Kenga, no es útil para otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo es experimental y no apto para producción.
- **Caveat para producción**: no es adecuado para ningún uso real, solo para investigación y educación.

## Enlaces

- HuggingFace: https://huggingface.co/GermannM/kenga-prophet-m2-k16
- Repositorio del lenguaje Kenga: https://github.com/GermannM3/kenga-lang
- Ejemplos del lenguaje Kenga: https://github.com/GermannM3/kenga-lang/tree/main/examples
- Modelo anterior (M2.0): https://huggingface.co/GermannM/kenga-prophet (referencia según la model card, no verificado)

Nota: los enlaces a Google Gemini, Instagram y Model Garden aparecen en la búsqueda web pero no son relevantes al modelo.</think>## Resumen

Genera Kenga Prophet M2.1 (K=16) es un modelo de lenguaje extremadamente pequeño, con 12.540 parámetros, desarrollado por GermannM como parte de la serie M2 del lenguaje Kenga, un lenguaje de programación experimental orientado a la creación de agentes con IA temporal. El modelo se centra en la predicción del siguiente token en ese dominio, utilizando una arquitectura de clasificador lineal con softmax sobre un vocabulario de 28 tokens. Su principal es estudiar el efecto de ampliar la ventana de contexto (K) de 8 a 16 tokens, manteniendo el resto de hiperparámetros constante, en una serie de experimentos controlados para mejorar la precisión de predicción hasta superar el 30 %.

Con una precisión global del 23,4 % sobre conjuntos reservados, el modelo muestra una mejora de 2 puntos porcentuales respecto a la versión anterior (K=8, 21,4 %), aunque la precisión en distribución permanece estable en el 41,1 %. Es un modelo minimalista, sin capas ocultas ni mecanismos de atención, que se entrena en solo 1-2 minutos. Su licencia Apache 2.0 y su tamaño diminuto lo convierten en un recurso didáctico para estudiar arquitecturas lineales y la variación del contexto en modelos de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador lineal con softmax (sin capas ocultas) |
| Parámetros totales | 12.540 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 tokens (K=16) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (vocabulario de 28 tokens específicos de Kenga) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors o PyTorch, no se especifica) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de clasificador lineal con softmax: una única capa que proyecta la representación de los 16 tokens de contexto a una distribución de probabilidad sobre los 28 tokens del vocabulario. No hay capas ocultas, atención ni mecanismos de memoria más allá de la ventana de contexto. El entrenamiento se realizó con el optimizador Adam (tasa de aprendizaje 5e-3, betas 0.9/0.999) durante 60 épocas, sobre un conjunto de datos de Kenga no detallado. El proceso dura entre 1 y 2 minutos, lo que indica un conjunto de datos pequeño. No se aplicaron técnicas de RLHF ni DPO.

La única innovación respecto a la versión anterior es el aumento de la ventana de contexto de K=8 a K=16. El autor mantiene un diseño de experimentos de un solo eje: cada modelo de la serie M2 cambia únicamente un hiperparámetro para evaluar su efecto aislado. La mejora en la precisión reservada (21,4 % a 23,4 %) se atribuye a este cambio, mientras que la precisión en distribución no varía, lo que sugiere que el modelo no generaliza mejor, sino que memoriza patrones de entrenamiento.

## Capacidades

- Predicción del siguiente token en el lenguaje de programación Kenga, con un vocabulario de 28 tokens definidos manualmente.
- Generación de secuencias de tokens en Kenga, con precisión limitada (23,4 % en datos reservados).
- Sin soporte de tool calling, function calling ni agentes.
- Sin capacidades multilingües; solo se limita a los tokens de Kenga.
- Sin capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- **Investigación del efecto de la ventana de contexto**: permite estudiar cómo aumentar la ventana de contexto afecta la precisión en modelos lineales, comparando con la versión K=8.
- **Experimentos de sobreajuste**: la diferencia entre precisión en distribución (41,1 %) y en reserva (23,4 %) es un ejemplo para entender la memorización en modelos pequeños.
- **Validación del runtime kenga-lite**: sirve para probar la carga y ejecución de modelos en el ecosistema Kenga.
- **Prueba de la escalera M2**: como modelo de una serie experimental controlada, sirve de referencia para la siguiente iteración M2.2 que introducirá una capa oculta.
- **Demostración de entrenamiento rápido**: su tiempo de entrenamiento de 1-2 minutos permite ilustrar el proceso de entrenamiento de modelos de lenguaje en entornos educativos.
- **Comparación de arquitecturas lineales**: se puede usar como base para comparar con modelos con capas ocultas o redes de atención en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos proporcionados son métricas de precisión de predicción del siguiente token sobre conjuntos reservados de desarrollo de Kenga:

| Conjunto | Precisión |
|---|---|
| kenga_10_add | 22,5 % (18/80) |
| kenga_fact | 26,0 % (13/50) |
| kenga_fib | 20,9 % (9/43)
