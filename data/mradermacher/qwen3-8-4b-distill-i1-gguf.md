# mradermacher/Qwen3.8-4B-Distill-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-4B-Distill-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `empero-ai/Qwen3.8-4B-Distill`, que a su vez es un destilado de la familia Qwen3.5/3.8 orientado a razonamiento y function-calling. El repositorio, publicado por mradermacher, no contiene los pesos cuantizados en sí, sino el archivo de imatrix (0.1 GB) que se emplea para generar cuantizaciones de alta calidad; los archivos GGUF listos para usar se distribuyen en el repositorio estático asociado.

La relevancia de este modelo radica en que combina un tamaño reducido (denominación "4B") con capacidades de razonamiento y function-calling, lo que lo hace apto para despliegue en entornos con recursos limitados, como estaciones de trabajo con una única GPU o incluso CPU. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

No se dispone de información pública sobre la arquitectura exacta, el número de parámetros reales, la longitud de contexto ni los resultados de benchmarks del modelo base, por lo que la ficha se centra en la capa de cuantización y en las características declaradas en los metadatos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo destilado de la familia Qwen3.5/3.8) |
| Parametros totales | no disponible (el dato del repo, 897.272, parece incompleto o erróneo; la denominación "4B" sugiere ~4 mil millones, pero no es confirmable) |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Este repo solo contiene el archivo imatrix; los quants (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, IQ1, IQ2, IQ3, IQ4, etc.) se publican en el repositorio estático `Qwen3.8-4B-Distill-GGUF` |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo imatrix en este repo; quants en el repo estático) |

## Arquitectura y entrenamiento

El modelo base `empero-ai/Qwen3.8-4B-Distill` es un destilado de la familia Qwen3.5/3.8, entrenado con fine-tuning supervisado (SFT) y orientado explícitamente a razonamiento y function-calling. No se han publicado detalles sobre el número de capas, la dimensión oculta, el número de cabezas de atención ni el tipo de arquitectura (transformer denso o MoE), por lo que estos datos no están disponibles.

La capa de cuantización añadida por mradermacher emplea el método imatrix (importance matrix), que calcula estadísticas de activación sobre un corpus de calibración para optimizar la asignación de bits en los cuantizadores. Esto permite generar quants de menor tamaño con una degradación de calidad menor que los métodos estáticos convencionales. El repositorio `i1` contiene únicamente el archivo imatrix; los quants finales se sirven desde el repositorio estático.

## Capacidades

- Generación de texto en inglés.
- Razonamiento (razonamiento) avanzado, probablemente con capacidad de "thinking mode" heredada del destilado de Qwen3.5/3.8.
- Soporte de function-calling (llamada a funciones), lo que habilita integraciones con APIs y herramientas externas.
- Capacidad de visión declarada en los metadatos del repositorio ("This is a vision model"); los archivos `mmproj` necesarios para multimodalidad se publican en el repositorio estático.
- Capacidad de seguimiento de instrucciones y conversación multi-turno.
- Compatible con el ecosistema GGUF: puede ejecutarse con llama.cpp, Ollama, LM Studio, etc.

## Casos de uso

- Asistentes conversacionales en inglés: el modelo puede mantener diálogos multi-turno y ejecutar llamadas a funciones para interactuar con APIs o bases de datos.
- Agentes autónomos: gracias al function-calling y al razonamiento, puede encadenar pasos para resolver tareas complejas (planificación, búsqueda de información, generación de informes).
- Generación y revisión de código: el destilado de Qwen3.5/3.8 incluye habilidades de programación; con la cuantización GGUF puede ejecutarse en entornos de desarrollo locales sin GPU de gama alta.
- Prototipado de aplicaciones de IA: por su tamaño y licencia Apache 2.0, es adecuado para experimentar con agentes y pipelines de IA en entornos de desarrollo.
- Despliegue en edge o CPU: con cuantizaciones de baja precisión (Q4, Q5) puede correr en portátiles y mini-PCs, útil para aplicaciones sin conexión.
- Investigación en destilación y cuantización: el archivo imatrix y los quants sirven para estudiar el impacto de la cuantización en modelos destilados de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~4B cuantizado en Q4_K_M, se estiman entre 2.5 y 3.5 GB de VRAM; en Q8, alrededor de 4.5-5 GB. Estas cifras son orientativas y dependen de la longitud de contexto y del backend.
- GPU recomendadas: RTX 3060 (12 GB) o superior para cuantizaciones altas; con cuantizaciones bajas (Q4) una RTX 3050 o incluso una GTX 1080 pueden bastar.
- Compatibilidad con CPU: los quants GGUF se ejecutan en CPU con llama.cpp; para modelos 4B, un CPU moderno con 16 GB de RAM es suficiente para inferencia lenta pero funcional.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, vLLM (para GPU, con conversión a formato de vLLM).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

No hay datos públicos de benchmarks que permitan una comparativa rigurosa. Como referencia de características generales, se listan modelos de la misma familia o tamaño similar (sin datos de rendimiento):

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-4B-Distill (este, cuantizado) | ~4B (sin confirmar) | no disponible | Apache 2.0 | Destilado, reasoning, function-calling |
| Qwen3-4B-Instruct | 4B | 32K (conocido) | Apache 2.0 | Modelo base de Qwen3, instruct |
| Qwen2.5-3B-Instruct | 3B | 32K | Apache 2.0 | Generación de texto y código |

La comparativa es estructural, no de rendimiento, ya que no se dispone de datos de benchmarks para el modelo objeto de la ficha.

## Limitaciones y advertencias

- No se dispone de información pública sobre sesgos, alucinaciones o robustez del modelo base; es necesario evaluarlo en el dominio de uso antes de producción.
- El modelo está entrenado principalmente en inglés; el rendimiento en otros idiomas puede ser limitado.
- La longitud de contexto no está documentada, lo que dificulta planificar casos de uso con ventanas largas.
- La cuantización puede degradar la calidad de razonamiento y la precisión del function-calling, especialmente en quants de baja precisión (Q2, IQ2, IQ3).
- El repositorio `i1` no contiene pesos listos para usar; es necesario descargar los quants del repositorio estático o generar los propios con el imatrix.
- Aunque la licencia Apache 2.0 permite uso comercial, hay que verificar que el modelo base no tenga restricciones adicionales no documentadas.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-i1-GGUF
- Repositorio estático con los quants GGUF: https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-GGUF
- Modelo base (empero-ai): https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Variante "heretic" (abliterada): https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-heretic-i1-GGUF
- Herramienta Heretic (abliteración de censura): https://github.com/p-e-w/heretic
- Guía de cuantización IQ de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

Nota: los datos de parámetros y contexto no están disponibles en la documentación pública del modelo. La cuantización GGUF es de alta calidad (imatrix) pero la falta de benchmarks y especificaciones detalladas limita la evaluación objetiva.</think>## Resumen

El modelo `mradermacher/Qwen3.8-4B-Distill-i1-GGUF` es una cuantización GGUF del modelo base `empero-ai/Qwen3.8-4B-Distill`, un destilado de la familia Qwen3.5/3.8 orientado a razonamiento y function-calling. El repositorio, publicado por mradermacher, no contiene los pesos cuantizados finales, sino únicamente el archivo de imatrix (matriz de importancia) de 0.1 GB, que sirve para generar cuantizaciones de alta calidad. Los archivos GGUF listos para usar se distribuyen en el repositorio estático asociado.

La relevancia de este modelo radica en que ofrece capacidades de razonamiento y function-calling en un tamaño compacto (denominación "4B"), lo que lo hace adecuado para despliegue en entornos con recursos limitados, como estaciones de trabajo con una única GPU consumer o incluso CPU. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

No se dispone de información pública sobre la arquitectura exacta, el número real de parámetros, la longitud de contexto ni resultados de benchmarks. La ficha se centra, por tanto, en la capa de cuantización y en las características declaradas en los metadatos del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo destilado de la familia Qwen3.5/3.8) |
| Parametros totales | no disponible (el dato del repo, 897.272, parece incompleto o erróneo; la denominación "4B" sugiere ~4 mil millones, sin confirmar) |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Este repo solo contiene el archivo imatrix; los quants (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, IQ1, IQ2, IQ3, IQ4, etc.) se publican en el repositorio estático `Qwen3.8-4B-Distill-GGUF` |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo imatrix en este repo; quants en el repo estático) |

## Arquitectura y entrenamiento

El modelo base `empero-ai/Qwen3.8-4B-Distill` es un destilado de la familia Qwen3.5/3.8, entrenado mediante fine-tuning supervisado (SFT) y orientado explícitamente a razonamiento y function-calling. No se han publicado detalles sobre el número de capas, la dimensión oculta, el tipo de atención ni la composición del dataset de entrenamiento, por lo que estos datos no están disponibles.

La capa de cuantización añadida por mradermacher utiliza el método `imatrix` (importance matrix), que calcula estadísticas de activación sobre un dataset de calibración para optimizar la asignación de bits en los cuantizadores. Esto permite generar quants de menor tamaño con una degradación de calidad menor que los métodos estáticos. El repositorio `i1` contiene únicamente el archivo imatrix; los quants finales se generan a partir de él y se publican en el repositorio estático.

## Capacidades

- Generación de texto en inglés.
- Razonamiento avanzado, probablemente con modo "thinking step" heredado del destilado de Qwen3.5/3.8.
- Function-calling (llamada a funciones), lo que permite integrar el modelo con herramientas externas y APIs.
- Capacidad de visión declarada en los metadatos ("vision model"); los archivos `mmproj` necesarios se publican en el repositorio estático.
- Seguimiento de instrucciones y conversación multi-turno.
- Compatible con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, llama-cpp-python, etc.

## Casos de uso

- Asistentes conversacionales en inglés: el modelo puede mantener diálogos multi-turno y ejecutar function-calling para interactuar con APIs o bases de datos.
- Agentes autónomos: gracias al razonamiento y al function-calling, puede encadenar tareas como planificación, búsqueda de información o generación de informes.
- Generación de código en entornos locales: el destilado de Qwen3.5/3.8 incluye habilidades de código; con cuantizaciones GGUF puede ejecutarse en portátiles o estaciones de desarrollo sin GPU de gama alta.
- Prototipado rápido de aplicaciones de IA: su tamaño compacto y licencia Apache 2.0 facilitan experimentar con agentes, herramientas y pipelines de IA en entornos de desarrollo.
- Despliegue en edge o servidores ligeros: con quants de baja precisión (Q4, Q5) puede ejecutarse en dispositivos con recursos limitados, útil para asistentes locales o chatbots.
- Análisis de cuantización y destilación: el archivo imatrix y los quants permiten estudiar el impacto de la cuantización en modelos destilados de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~4B cuantizado en Q4_K_M se estiman entre 3.5 y 4 GB de VRAM; en Q8, alrededor de 5-6 GB. Estas cifras son orientativas y dependen de la longitud de contexto y del backend.
- GPU recomendadas: RTX 2080 (12 GB) o superior para cuantizaciones altas; con Q4/Q5 puede bastar una RTX 3060 o incluso una GTX 1080.
- Compatibilidad con CPU: los quants GGUF se ejecutan en CPU con llama.cpp; un procesador moderno con 16 GB de RAM es suficiente para inferencia lenta pero funcional.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; para vLLM se requiere conversión a formato compatible.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparativa rigurosa. Como referencia estructural, se listan modelos de la misma familia o tamaño (sin datos de rendimiento):

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-4B-Distill (este modelo) | ~4B (sin confirmar) | no disponible | Apache 2.0 | Destilado, reasoning, function-calling |
| Qwen3-4B-Instruct | 4B | 32K (conocido) | Apache 2.0 | Modelo base de Qwen3, instruct |
| Qwen2.5-3B-Instruct | 3B | 32K | Apache 2.0 | Generación de texto y código |

La comparación es estructural, no de rendimiento, ya que no se dispone de datos de benchmarks para este modelo.

## Limitaciones y advertencias

- No se dispone de información pública sobre sesgos, alucinación o robustez del modelo base; es necesario evaluar antes de usar en producción.
- El modelo está entrenado principalmente para inglés; el rendimiento en otros idiomas puede ser limitado.
- La longitud de contexto no está documentada, lo que dificulta planificar casos de uso con ventanas largas.
- La cuantización puede degradar la calidad del razonamiento y del function-calling, especialmente en quants de baja precisión (IQ2, IQ3, Q4).
- Este repositorio no contiene los pesos listos para usar; es necesario descargar los quants del repositorio estático o generar los propios con el archivo imatrix.
- La licencia Apache 2.0 permite uso comercial, pero hay que verificar que no existan restricciones adicionales no documentadas en el modelo base.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-i1-GGUF
- Repositorio estático con los quants GGUF: https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-GGUF
- Modelo base (empero-ai): https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Variante "heretic" (abliterada): https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-heretic-i1-GGUF
- Herramienta Heretic (abliteración de censura): https://github.com/p-e-w/heretic
- Guía de quants IQ de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
