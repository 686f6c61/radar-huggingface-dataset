# joamCriff123/zils-flash-f1123b

## Resumen

zils-flash-f1123b es un modelo de la familia Qwen3.5-9B publicado por el usuario joamCriff123 en Hugging Face. Se presenta como un "d3-flash decision body" destinado al "flash pool" de la subred Zils 127, es decir, un modelo derivado afinado para tareas de decisión dentro de una infraestructura de subred concreta. El modelo base declarado es Qwen/Qwen3.5-9B, sobre el que se ha realizado un fine-tuning, y conserva la licencia Apache-2.0 del original.

El modelo cuenta con 8.392.695.024 parámetros (aproximadamente 8,4 mil millones) en formato safetensors, con un repositorio de 16,8 GB, lo que sugiere pesos en precisión de 16 bits. La librería declarada es transformers y la arquitectura se etiqueta como qwen3_5, con código personalizado (custom_code) para su carga. El pipeline declarado es feature-extraction, aunque las etiquetas incluyen decision-model, lo que apunta a un uso como extractor de representaciones o clasificador de decisiones más que como modelo generativo de propósito general.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes, publicado en noviembre de 2026, sin model card sustantiva más allá de una breve descripción. No hay información pública sobre datos de entrenamiento, benchmarks ni idiomas soportados. Su interés principal radica en ser un ejemplo de fine-tuning comunitario sobre Qwen3.5-9B para un caso de uso vertical (decisiones en una subred), y en que hereda la licencia permisiva Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, segun etiqueta; requiere custom_code) |
| Parametros totales | 8.392.695.024 (~8,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 16,8 GB) |

## Arquitectura y entrenamiento

La arquitectura se declara como qwen3_5, lo que indica que deriva de la familia Qwen3.5 de Alibaba, presumiblemente un transformer decoder-only con atención estándar o variantes propias de la familia. El repositorio requiere custom_code, por lo que la carga no se realiza con una clase estándar de transformers sin más, sino que depende de código incluido en el propio repositorio. No se dispone de información sobre el número de capas, dimensión oculta, cabezas de atención ni mecanismos de atención concretos.

En cuanto al entrenamiento, la model card solo indica que es un fine-tuning del modelo base Qwen/Qwen3.5-9B para el "flash pool" de la subred Zils 127, sin detallar el volumen de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT. No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado, por lo que el modelo está orientado a producir representaciones o embeddings a partir de texto.
- Modelo de decisión (decision-model): la etiqueta sugiere un uso como clasificador o selector de decisiones dentro de un flujo de trabajo, probablemente en el contexto del "flash pool" de Zils.
- Generación de texto: no confirmada explícitamente; al derivar de un modelo base generativo es plausible, pero no está documentada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación y enrutamiento de decisiones en pipelines: dado su rol declarado como decision-model, podría emplearse para seleccionar entre opciones o rutas en un sistema de subred, usando las representaciones del modelo para puntuar alternativas.
- Extracción de embeddings para búsqueda semántica: al declarar feature-extraction, puede utilizarse para generar vectores de texto que alimenten un índice vectorial en un sistema de recuperación de información.
- Filtrado y priorización en el "flash pool" de Zils: el modelo parece diseñado para decidir qué elementos entran o se priorizan en ese pool, por lo que encajaría en un servicio interno de orquestación.
- Prototipado de clasificadores verticales: al ser un fine-tuning de Qwen3.5-9B con licencia Apache-2.0, sirve como punto de partida para experimentar con tareas de decisión específicas sin restricciones de licencia.
- Evaluación comparativa de fine-tunings comunitarios: útil para investigadores que quieran medir cómo se comporta un fine-tuning sobre Qwen3.5-9B frente al modelo base en tareas de extracción de características.
- Integración en servicios con transformers: al publicarse en formato safetensors y librería transformers, puede desplegarse en un servidor de inferencia estándar para tareas de representación, siempre que se incluya el custom_code del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 17 GB solo para pesos (8,4 B × 2 bytes), más overhead de activaciones y del custom_code; se recomienda al menos 24 GB para comodidad.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-10 GB; en 4 bits, aproximadamente 5-6 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4080 para cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 ajustado y en GPUs de 12-16 GB con cuantización de 8 o 4 bits, siempre que el custom_code sea compatible.
- Opciones de despliegue: transformers con custom_code (opción nativa); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura con código personalizado y requerirían verificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-flash-f1123b | ~8,4 B | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tuning vertical para Zils |
| Qwen/Qwen3.5-9B (base) | ~9 B (nominal) | no disponible | Apache-2.0 (presumible) | Hugging Face | Modelo base del que deriva |
| Fine-tunings comunitarios de Qwen3.5-9B | ~8-9 B | variable | variable | Hugging Face | Alternativas genéricas de la misma familia |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Model card mínima: no se documentan datos de entrenamiento, idiomas, contexto ni evaluación, lo que impide garantizar su comportamiento en producción.
- Riesgo de alucinación y sesgos: no evaluado; al derivar de un modelo generativo, hereda los sesgos del modelo base, que no se detallan.
- Dependencia de custom_code: la carga requiere código personalizado del repositorio, lo que añade superficie de riesgo y complica el despliegue en servidores de inferencia estándar.
- Licencia Apache-2.0: permite uso comercial, pero deben revisarse los ficheros LICENSE y NOTICE para las atribuciones del modelo base y posibles restricciones adicionales.
- Limitaciones de contexto e idioma: no disponibles; no se debe asumir un contexto largo ni cobertura multilingüe sin verificación.
- Fecha de publicación futura (noviembre de 2026) y autoría poco conocida: conviene tratar el artefacto con cautela y auditar los pesos antes de usarlo.

## Enlaces

- [Hugging Face: joamCriff123/zils-flash-f1123b](https://huggingface.co/joamCriff123/zils-flash-f1123b)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
