# Mir2k/Qwen4-27B-GGUF

## Resumen

Qwen4-27B-GGUF es un repositorio de cuantizaciones GGUF del modelo Qwen4-27B, publicado por el usuario Mir2k en Hugging Face. El repositorio no contiene el modelo original ni documentación técnica propia: se limita a alojar versiones cuantizadas en formato GGUF generadas con `llama.cpp`, presumiblemente para facilitar la inferencia en CPU y en GPUs de consumo mediante herramientas como llama.cpp, Ollama o LM Studio.

La model card es extremadamente escueta y está redactada en francés. Indica que las cuantizaciones Q4_K_M, Q5_K_M y Q8_0 están "en preparación" y que se verifican mediante generación real antes de su publicación. No se aportan datos sobre arquitectura, número de parámetros, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks.

La relevancia de este repositorio depende enteramente del modelo base Qwen4-27B, sobre el cual no se proporciona información verificable en la documentación disponible. A fecha de creación del repositorio (22 de noviembre de 2026), no consta ningún dato publicado por el autor que permita validar las características técnicas del modelo subyacente. Cualquier evaluación rigurosa requiere consultar la fuente original del modelo base, que no se enlaza en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 27B (según el nombre del repositorio; no confirmado en la model card) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q8_0 (indicadas como "en preparación") |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base en la documentación disponible. El nombre del repositorio sugiere un transformer denso de 27 000 millones de parámetros, pero no se confirma ni el tipo de atención, ni si emplea mezcla de expertos, ni la longitud de contexto nativa. Tampoco se detallan los datos de entrenamiento (número de tokens, composición del corpus, fases de ajuste fino supervisado o preferencias) ni innovaciones técnicas como decodificación especulativa o atención lineal.

Lo único documentado es el proceso de cuantización: las versiones GGUF se generan con `llama.cpp` y, según el autor, se verifican mediante generación real antes de su publicación. No se especifica la versión de `llama.cpp` empleada, ni el método exacto de cuantización (por ejemplo, si Q4_K_M usa escalas por bloque de 32 con metadatos de 6 bits), ni el hash de los ficheros resultantes.

## Capacidades

- No se documentan capacidades específicas del modelo en la información disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta capacidad multilingüe declarada.
- No consta modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- La única capacidad implícita es la generación de texto en formato GGUF ejecutable con llama.cpp y derivados.

## Casos de uso

- Inferencia local en CPU: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 27B en equipos sin GPU dedicada, siempre que se disponga de suficiente RAM (del orden de 16-20 GB para Q4_K_M). No obstante, al no confirmarse el tamaño real ni la arquitectura, el cálculo es estimativo.
- Despliegue en GPUs de consumo: Q4_K_M podría caber en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) si el modelo base es denso de 27B; Q8_0 requeriría del orden de 28-30 GB y no cabría en esas tarjetas.
- Integración con Ollama o LM Studio: el formato GGUF es directamente compatible con estos entornos, lo que facilita prototipado rápido sin infraestructura de servidor.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece tres niveles (Q4_K_M, Q5_K_M, Q8_0) que permiten medir la degradación de calidad frente al modelo original en tareas concretas, siempre que se disponga de la versión sin cuantizar.
- Pruebas de concepto en entornos con recursos limitados: útil para validar si un modelo de 27B es viable en el hardware disponible antes de invertir en infraestructura mayor.
- Distribución offline: el formato GGUF empaqueta pesos y metadatos en un único fichero, lo que simplifica la distribución en entornos aislados sin acceso a Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 16-18 GB para un modelo denso de 27B (estimación basada en el tamaño nominal; no confirmada por el autor).
- VRAM estimada para Q5_K_M: aproximadamente 19-21 GB.
- VRAM estimada para Q8_0: aproximadamente 28-30 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB, A6000 48 GB o H100 para Q8_0.
- Compatibilidad con GPU de consumo: Q4_K_M y Q5_K_M podrían caber en tarjetas de 24 GB; Q8_0 no.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información verificable sobre el modelo base Qwen4-27B ni sobre alternativas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La model card no documenta arquitectura, contexto, idiomas ni datos de entrenamiento; no es posible evaluar el modelo con rigor a partir de este repositorio.
- Las cuantizaciones se describen como "en preparación", lo que sugiere que los ficheros podrían no estar disponibles o no haber sido validados de forma independiente en el momento de la consulta.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso comunitario ni validación externa.
- No se enlaza el modelo base original, lo que impide verificar la procedencia de los pesos y la cadena de custodia de la cuantización.
- Riesgo de alucinación y sesgos: no evaluables sin datos del modelo base.
- Licencia Apache 2.0 declarada para el repositorio de cuantizaciones; conviene verificar que el modelo base original también sea Apache 2.0 antes de uso comercial.
- La fecha de creación (noviembre de 2026) y la ausencia de documentación sugieren un repositorio de escasa madurez; no se recomienda su uso en producción sin validación previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mir2k/Qwen4-27B-GGUF
- No se han encontrado otros enlaces (paper, blog, repositorio de código o demo) en la información proporcionada.
