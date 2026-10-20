# binxx71/modern-transformer-1.5b

## Resumen

Modern Transformer 1.5B es un modelo de lenguaje de 1.481.754.624 parámetros publicado por binxx71 (Binyam) en Hugging Face. La model card lo describe como un transformer personalizado de 28 bloques con Grouped-Query Attention (GQA), SwiGLU, RMSNorm y Rotary Position Embeddings (RoPE), alineado mediante SFT y GRPO. Se distribuye como un archivo GGUF, pensado para ejecución local.

El interés práctico está en su tamaño: 1,5B parámetros permiten desplegarlo en GPU de consumo o CPU con cuantización agresiva, y la licencia Apache 2.0 facilita uso comercial y modificación. Sin embargo, la documentación pública es mínima: no se indica longitud de contexto, tokenizador, composición del dataset, idiomas ni resultados de benchmarks. Con 0 descargas y 1 like en el momento de la ficha, se trata de un artefacto de baja adopción y sin validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con 28 bloques; GQA (16 cabezas de consulta / 4 de clave-valor), SwiGLU, RMSNorm y RoPE |
| Parámetros totales | 1.481.754.624 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF; nivel de cuantización no especificado en la model card |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Dimensión oculta (d_model) | 2048 |
| Dimensión FFN (d_ff) | 6144 |
| Normalización | RMSNorm con epsilon = 1 × 10^-6 |
| Tamaño del repositorio | 11,9 GB |
| Descargas / likes | 0 / 1 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es un transformer con 28 bloques, d_model = 2048, 16 cabezas de consulta y 4 cabezas de clave-valor (GQA), FFN SwiGLU de dimensión 6144 y RMSNorm con epsilon 1 × 10^-6. Usa RoPE para codificar posiciones. No se especifica si es decoder-only, encoder-decoder o si emplea atención completa en todos los bloques; tampoco se documentan detalles de tokenizador, vocabulario, activaciones, dropout ni inicialización.

El entrenamiento se describe únicamente como alineamiento mediante SFT y GRPO. No se indica número de tokens, composición del corpus, mezcla de idiomas, uso de RLHF/DPO, datos sintéticos, filtros de seguridad ni hiperparámetros. Tampoco hay información sobre la fase de preentrenamiento. La innovación técnica declarada se limita a combinar componentes estándar (GQA, SwiGLU, RMSNorm, RoPE) en un modelo de 1,5B; no se describen técnicas como decodificación especulativa, atención lineal o mezcla de expertos.

## Capacidades

- Generación de texto y seguimiento de instrucciones: la model card indica alineamiento con SFT y GRPO, pero no publica evaluaciones de calidad ni tasas de adherencia.
- Razonamiento: GRPO se ha usado en modelos de razonamiento, pero no hay benchmarks de matemáticas, lógica o sentido común para este modelo; la capacidad es no verificada.
- Código: no se documenta entrenamiento específico ni resultados en HumanEval, MBPP o similares.
- Matemáticas: no disponible.
- Tool calling / function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado; sin contexto declarado no se puede planificar su uso en cadenas largas.
- Multilingüe: no se especifican idiomas soportados.
- Visión, audio o modalidades adicionales: no disponible; el artefacto es solo texto.
- Modo thinking explícito: no documentado.

## Casos de uso

- Prototipado local con GGUF: cargar el archivo en llama.cpp u Ollama para probar generación de texto en un portátil o PC sin GPU dedicada; el tamaño de 1,5B permite cuantizaciones de 4-8 bits, aunque el nivel del GGUF publicado no se indica.
- Asistente de dominio acotado: fine-tuning supervisado sobre preguntas frecuentes internas y despliegue en CPU; la licencia Apache 2.0 permite adaptarlo, pero requiere evaluar alucinaciones y límites de contexto.
- Generación de borradores cortos: redacción de correos, descripciones o respuestas de formulario de menos de una página; adecuado por coste bajo, no por calidad equiparable a modelos de 7B o superiores.
- Etiquetado y extracción simple: clasificación de tickets o extracción de campos en textos cortos con prompts y validación posterior; usar como componente auxiliar, no como única fuente de verdad.
- Investigación y docencia: estudio de una implementación compacta con GQA, SwiGLU, RMSNorm y RoPE, y experimentos de alineamiento GRPO a pequeña escala; el modelo es suficientemente pequeño para hacer fine-tuning en un solo equipo.
- Evaluación de infraestructura de inferencia: prueba de integración de GGUF en pipelines de llama-cpp-python, medición de latencia y consumo de memoria; útil para comparar configuraciones, no para medir calidad lingüística.
- Generación offline en edge: despliegue en dispositivos con 8 GB de RAM/VRAM para tareas de texto no críticas, como resúmenes de notas o respuestas pregrabadas; requiere límites de longitud y un mecanismo de fallback.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni evaluaciones de seguridad para este modelo.

## Requisitos de hardware

- Pesos: 1,48B parámetros. En FP16 ocupan aproximadamente 2,96 GB; en
