# FirstPrinciplesLabs/quark_quantized_weight_only-Q8_0

## Resumen

Quark es un modelo de razonamiento de 9B parámetros desarrollado por FirstPrinciples, especializado en física, ciencia y matemáticas. Esta ficha describe su cuantización Q8_0 (int8) para llama.cpp y herramientas compatibles como Ollama y LM Studio, publicada por FirstPrinciplesLabs. El modelo base es `FirstPrinciplesLabs/quark`, y esta variante mantiene la calidad del original en bf16 según el autor, con mayor velocidad de generación.

La relevancia de esta versión radica en que permite ejecutar un modelo de razonamiento científico de ~9.200 millones de parámetros en hardware de consumo con una pérdida de precisión mínima, gracias al formato Q8_0 de llama.cpp (pesos en enteros de 8 bits con una escala por bloque de 32). El contexto nativo es de 131.072 tokens, aunque su uso completo exige unos 15 GB de memoria de GPU.

El modelo está orientado a inglés, se distribuye con licencia Apache 2.0 y su repo ocupa 10,7 GB. La información pública disponible es limitada: no se detallan la arquitectura interna, la composición del dataset de entrenamiento ni los resultados numéricos de benchmarks en esta página, que remite a la model card del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de razonamiento; familia no especificada) |
| Parámetros totales | 9.197.093.888 (~9,2B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | Q8_0 (int8, pesos de 8 bits con una escala por bloque de 32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`quark-Q8_0.gguf`, 9,8 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El modelo base se presenta como un "9B reasoning model" orientado a física, ciencia y matemáticas, lo que sugiere un entrenamiento con énfasis en razonamiento multi-paso y resolución de problemas científicos, pero no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO u otras etapas de alineamiento.

La innovación técnica documentada en esta variante es la cuantización Q8_0 de llama.cpp: los pesos se almacenan como enteros de 8 bits con una escala compartida por cada bloque de 32 valores. El autor afirma que esta versión int8 iguala al modelo original en bf16 en GPQA Diamond, AIME 2025, MMLU-Pro Physics y Humanity's Last Exam, y genera más rápido, aunque los valores concretos remiten a la model card del modelo base.

## Capacidades

- Generación de texto y razonamiento científico orientado a física, ciencia y matemáticas.
- Resolución de problemas matemáticos y de razonamiento multi-paso (modo thinking, con parámetros de muestreo recomendados específicos).
- Respuesta a preguntas de nivel experto en dominios científicos (evaluado en GPQA Diamond, MMLU-Pro Physics y Humanity's Last Exam).
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con API OpenAI a través de `llama-server` y con endpoints compatibles.
- Integración con Ollama y LM Studio mediante el formato GGUF.
- Soporte de plantillas de chat Jinja (`--jinja`) en llama.cpp.
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible (la entrada es solo texto).
- Capacidades multilingües: limitadas al inglés.

## Casos de uso

- Asistencia en investigación científica: el modelo puede responder preguntas de nivel experto en física y disciplinas afines, útil como apoyo para revisión de conceptos, derivaciones y comprobación de razonamientos, gracias a su entrenamiento específico en dominios científicos.
- Resolución de problemas matemáticos complejos: adecuado para ejercicios de competición y problemas multi-paso, con modo thinking y parámetros de muestreo recomendados (`temp 1.0`, `top-k 20`, `top-p 0.95`, `presence-penalty 1.5`).
- Tutoría técnica especializada: conversaciones multi-turno con contexto largo (hasta 131.072 tokens) para explicar temas de física o matemáticas manteniendo el hilo de un temario extenso.
- Análisis de documentos científicos largos: con 131.072 tokens de contexto puede procesar artículos o apuntes completos y responder preguntas sobre ellos, siempre que se disponga de ~15 GB de memoria de GPU.
- Despliegue local en estaciones de trabajo: mediante Ollama (`ollama run FirstPrinciples/quark-q8`) o `llama-server`, permite disponer de un asistente científico sin depender de servicios en la nube.
- Prototipado de pipelines de razonamiento: la API compatible con OpenAI de `llama-server` facilita integrar el modelo en aplicaciones existentes y comparar respuestas con otros modelos en tareas de ciencia y matemáticas.
- Evaluación de cuantizaciones: útil como referencia para medir el impacto de Q8_0 frente a bf16 en tareas de razonamiento, dado que el autor reporta paridad en los benchmarks citados.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor indica que la versión int8 iguala al modelo original bf16 en GPQA Diamond, AIME 2025, MMLU-Pro Physics y Humanity's Last Exam, y que genera más rápido, pero remite los valores concretos y las cifras de throughput (medidas en NVIDIA H200 y MacBook Pro M4 de 16 GB) a la model card del modelo base.

## Requisitos de hardware

- VRAM estimada: unos 15 GB de memoria de GPU para el contexto completo de 131.072 tokens; el archivo GGUF pesa 9,8 GB.
- En equipos con 16 GB de memoria (p. ej. MacBook Pro M4), el autor recomienda reducir el contexto a 32.768 tokens (`num_ctx 32768` o `-c 32768`), con el consiguiente truncamiento de respuestas largas.
- GPU recomendadas: NVIDIA H200 para máximo rendimiento y contexto completo; no se detallan otras GPU concretas.
- Cabe en GPU de consumo con al menos 12-16 GB de VRAM si se reduce el contexto; no se confirman modelos específicos.
- Opciones de despliegue: Ollama (`FirstPrinciples/quark-q8`), llama.cpp (`llama-server`), LM Studio y cualquier herramienta basada en GGUF; el servidor expone una API compatible con OpenAI.
- Latencia y throughput: no se proporcionan cifras concretas; el autor afirma que la versión int8 es más rápida que bf16.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de razonamiento científico de tamaño similar ni datos de benchmarks que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo entrenado y orientado únicamente al inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en contextos científicos y matemáticos donde una respuesta incorrecta puede parecer plausible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- El contexto completo de 131.072 tokens requiere ~15 GB de memoria; en hardware limitado se debe reducir el contexto, lo que trunca respuestas largas.
- La cuantización Q8_0 introduce una pérdida de precisión teórica frente a bf16, aunque el autor afirma paridad en los benchmarks citados; no se aportan mediciones independientes.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `FirstPrinciplesLabs/quark` y las dependencias de llama.cpp.
- El modelo tiene pocas descargas (3) y ningún "like" en el momento de la consulta, por lo que la validación por parte de la comunidad es escasa.
- No se documentan capacidades de tool calling, visión ni audio; la entrada es solo texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FirstPrinciplesLabs/quark_quantized_weight_only-Q8_0
- Modelo base: https://huggingface.co/FirstPrinciplesLabs/quark
- Resultados de benchmarks del modelo base: https://huggingface.co/FirstPrinciplesLabs/quark#results
- Throughput del modelo base: https://huggingface.co/FirstPrinciplesLabs/quark#throughput
- Uso y parámetros de muestreo del modelo base: https://huggingface.co/FirstPrinciplesLabs/quark#usage
- Web de FirstPrinciples: https://firstprinciples.com/
- Versión en Ollama: https://ollama.com/FirstPrinciples/quark-q8
- Descarga de Ollama: https://ollama.com/download
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía de instalación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/install.md
