# mradermacher/Qwen3.5-0.8B-Uncensored-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `naimulislam999/Qwen3.5-0.8B-Uncensored`, un modelo de 752 millones de parámetros basado en la arquitectura Qwen3.5 de Alibaba al que se le ha aplicado la técnica de *abliteration* (ablación direccional) para eliminar la negativa a responder a instrucciones potencialmente sensibles. El resultado es un modelo "sin censura" que mantiene las capacidades lingüísticas del modelo original pero sin los mecanismos de rechazo típicos de los modelos alineados.

La relevancia de este modelo reside en su uso para investigación en interpretabilidad mecánica y seguridad de IA, así como para aplicaciones que requieren generación de texto sin restricciones temáticas. Al ser un modelo pequeño (0.8B), puede ejecutarse en hardware modesto, lo que lo hace accesible para experimentación local. La cuantización GGUF permite su uso con herramientas como llama.cpp, Ollama o LM Studio.

El modelo está etiquetado con `apache-2.0`, lo que permite uso comercial y modificación, aunque el contenido generado puede no ser adecuado para todos los entornos. Solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, sin confirmar) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es `Qwen3.5-0.8B`, parte de la familia Qwen3.5 de Alibaba, que incluye versiones de 0.8B, 2B, 4B y 9B en su serie "Small". No se dispone de detalles específicos sobre la arquitectura interna (número de capas, dimensiones, tipo de atención) en la información proporcionada. La técnica de *abliteration* aplicada por `naimulislam999` consiste en identificar y eliminar direccionalmente los vectores de activación asociados con la negativa a responder, mediante un proceso de análisis de activaciones y posterior modificación de los pesos del modelo.

El proceso de cuantización realizado por `mradermacher` es estático, generando archivos GGUF en varios niveles de precisión (desde Q2_K hasta f16). No se menciona el uso de *imatrix* ni de cuantización ponderada en este repositorio (aunque existe una versión separada con *imatrix* en `mradermacher/Qwen3.5-0.8B-Uncensored-i1-GGUF`). No hay información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación original.

## Capacidades

- Generación de texto en inglés sin restricciones temáticas, gracias a la eliminación de la negativa a responder.
- Razonamiento y comprensión de instrucciones básicas, heredadas del modelo Qwen3.5-0.8B.
- Capacidad de generar código y resolver problemas matemáticos simples (no confirmado explícitamente, pero esperable en un modelo de esta familia).
- Soporte de *tool calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: *uncensored* (sin censura) mediante *abliteration*; útil para investigación en interpretabilidad mecánica y seguridad.

## Casos de uso

- Investigación en interpretabilidad mecánica: el modelo permite estudiar cómo la *abliteration* afecta al comportamiento del modelo, comparando las activaciones antes y después de la modificación. Es adecuado por su pequeño tamaño y por estar específicamente diseñado para este fin.
- Generación de texto creativo sin restricciones: escritores y artistas pueden usarlo para explorar temas tabú o controvertidos sin que el modelo se niegue a responder. Su tamaño permite ejecutarlo localmente en portátiles.
- Pruebas de seguridad y robustez: los investigadores pueden evaluar si el modelo genera contenido dañino o sesgado, y comparar con versiones alineadas del mismo tamaño.
- Chatbots locales para entornos controlados: al ser ligero, puede integrarse en aplicaciones de escritorio o móviles que requieran respuestas sin filtros, siempre que se implementen salvaguardas externas.
- Educación en IA: sirve como ejemplo práctico de cómo la alineación afecta al comportamiento, y cómo técnicas como la *abliteration* pueden modificar un modelo.
- Generación de datos sintéticos para entrenamiento: puede usarse para crear datasets con contenido variado, aunque se debe tener cuidado con la calidad y el sesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo cuantizado.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB para cuantizaciones Q4_K_M o inferiores; alrededor de 1,6 GB para la versión f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, o integradas modernas). También puede ejecutarse en CPU con 4-8 GB de RAM.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, o cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo pequeño, se espera una generación de decenas de tokens por segundo en GPU y varios tokens por segundo en CPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente con otros modelos de tamaño similar. Como referencia genérica, modelos como Qwen2.5-0.5B, Llama-3.2-1B o Gemma-2-2B son alternativas en el mismo rango de parámetros, pero no se conocen sus resultados en este contexto. La principal diferencia de este modelo es su naturaleza *uncensored* y su licencia Apache 2.0, que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- Al ser un modelo sin censura, puede generar contenido ofensivo, violento, sexual o ilegal. No es adecuado para aplicaciones públicas sin moderación externa.
- El proceso de *abliteration* puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original, aunque no se han medido diferencias cuantitativas.
- Solo soporta inglés; no se recomienda su uso en otros idiomas.
- La longitud de contexto no está documentada; se desconoce si soporta ventanas largas (típicamente los modelos pequeños de Qwen soportan 32K o 128K, pero no está confirmado).
- Riesgo de alucinaciones, especialmente en tareas de razonamiento complejo, debido al tamaño reducido del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir con las leyes aplicables.

## Enlaces

- [Modelo en HuggingFace (GGUF)](https://huggingface.co/mradermacher/Qwen3.5-0.8B-Uncensored-GGUF)
- [Modelo base (naimulislam999/Qwen3.5-0.8B-Uncensored)](https://huggingface.co/naimulislam999/Qwen3.5-0.8B-Uncensored)
- [Documentación de Qwen3.5 en Unsloth](https://unsloth.ai/docs/models/qwen3.5)
- [Repositorio de cuantizaciones con imatrix](https://huggingface.co/mradermacher/Qwen3.5-0.8B-Uncensored-i1-GGUF)
