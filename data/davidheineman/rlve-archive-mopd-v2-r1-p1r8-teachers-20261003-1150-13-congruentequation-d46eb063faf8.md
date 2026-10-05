# davidheineman/rlve-archive-mopd-v2-r1-p1r8-teachers-20261003-1150-13-congruentequation-d46eb063faf8

## Resumen

Este repositorio es un checkpoint de investigación archivado, no un modelo publicado como producto. Se trata del punto de guardado final (paso 9) de la ejecución `mopd-v2-r1-p1r8-teachers-20261003-115039`, concretamente el checkpoint etiquetado como `13-CongruentEquation`, dentro de una campaña de entrenamiento con RLVE (Reinforcement Learning with Verifiable Environments). Lo firma David Heineman, investigador con experiencia previa en Meta (facebookresearch) y AI2, y se distribuye bajo el formato `hf-safetensors` junto con el estado exacto del checkpoint distribuido de Megatron en el directorio `checkpoint/`.

El modelo tiene 1.777.088.000 parámetros según los metadatos de safetensors (unos 1,78 mil millones) y la etiqueta `qwen2` indica que la arquitectura base pertenece a la familia Qwen 2. Los repositorios hermanos de la colección «RLVE OPD Teachers» describen Qwen 2.5 1.5B Instruct entrenado durante 150 pasos sobre un único entorno extraído de un conjunto de 400, lo que sitúa este checkpoint en la misma línea de trabajo: ajuste por refuerzo sobre entornos verificables. El tamaño del repositorio, 3,6 GB, es coherente con pesos en precisión de 16 o 32 bits más el estado distribuido.

Su relevancia es fundamentalmente metodológica y reproducible: sirve para estudiar cómo evolucionan los pesos de un modelo pequeño bajo RL con recompensas verificables en un entorno concreto, y como material de comparación entre checkpoints. No hay model card descriptiva, licencia declarada, idiomas documentados, pipeline ni resultados de evaluación, y el contador público marca cero descargas y cero «likes» en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer decoder-only de la familia Qwen 2 (según la etiqueta `qwen2`; sin confirmación documental en la model card) |
| Parámetros totales | 1.777.088.000 (≈1,78 B), dato de los metadatos de safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`hf-safetensors`) y checkpoint distribuido de Megatron en `checkpoint/` |
| Tamaño del repositorio | 3,6 GB |
| Paso del checkpoint | 9 (final de la ejecución) |
| Identificador de ejecución W&B | `871a1070` |
| Ruta original de scratch | `runs/mopd-v2-r1-p1r8-teachers-20261003-115039/resumable/13-CongruentEquation` |
| Fecha de creación | 2026-10-05 |
| Última actualización | 2026-10-05 |

## Arquitectura y entrenamiento

No se dispone de documentación técnica sobre la arquitectura más allá de la etiqueta `qwen2`, que apunta a un transformer decoder-only con normalización RMSNorm, atención con RoPE y sesgo desactivado en las proyecciones QKV, el diseño estándar de la familia Qwen 2. El recuento de parámetros de 1,777 mil millones no coincide exactamente con el de Qwen2.5-1.5B-Instruct publicado (1,54 B), por lo que es probable que se trate de una configuración derivada, re-inicializada o con vocabulario y dimensiones propias del pipeline de entrenamiento, pero no hay información que lo confirme.

En cuanto al entrenamiento, el nombre de la ejecución (`mopd-v2-r1-p1r8-teachers`) y la etiqueta `rlve` remiten a un procedimiento de aprendizaje por refuerzo con entornos verificables. La documentación de la colección asociada menciona Qwen 2.5 1.5B Instruct entrenado durante 150 pasos sobre un único entorno de los 400 disponibles, y el artículo arXiv 2511.07317 como referencia del método. Este checkpoint concreto corresponde al paso 9 y a la variante `13-CongruentEquation`, lo que sugiere una fase corta de ajuste sobre una tarea específica. No se documentan el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otro tipo de alineación adicional.

## Capacidades

- Generación de texto autoregresiva: es la función básica esperable en un transformer decoder-only de esta familia, aunque no hay evaluación publicada que la cuantifique.
- Razonamiento sobre entornos verificables: el entrenamiento con RLVE apunta a tareas con recompensa comprobable (por ejemplo, resolución de problemas con respuesta exacta), pero no se especifica cuál es el entorno `CongruentEquation`.
- Instrucciones: el material de la colección indica que la base es Qwen 2.5 1.5B Instruct, lo que implicaría seguimiento de instrucciones conversacionales, si bien este checkpoint archivado no lo declara explícitamente.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible, aunque el marco RLVE se orienta a comportamiento multi-paso con verificación.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo pensamiento, visión, audio): no disponible.

## Casos de uso

- Reproducibilidad de investigación en RL: cargar el checkpoint en el pipeline de Megatron o en Transformers y volver a evaluar la política en el entorno `13-CongruentEquation` para verificar las curvas de recompensa registradas en la ejecución `871a1070`.
- Análisis de dinámica de entrenamiento: comparar este paso 9 con checkpoints intermedios de la misma ejecución para estudiar deriva de pesos, entropía de la política o colapso de modos en modelos pequeños.
- Destilación hacia modelos menores: usar las salidas del checkpoint como profesor para generar datos sintéticos sobre la tarea concreta, aprovechando su tamaño reducido para inferencia masiva en lote.
- Pruebas de infraestructura de serving: al ocupar menos de 4 GB en fp16, sirve como modelo de humo para validar despliegues con vLLM, TGI o servidores compatibles con la API de OpenAI antes de escalar a modelos grandes.
- Experimentos de RLHF o DPO posteriores: partir de este checkpoint como inicialización alineada a un entorno concreto y medir la transferencia a otras tareas.
- Docencia y formación: ilustrar en un curso el ciclo completo «entrenamiento RL - checkpoint - artefacto archivado» con un ejemplo real de estructura de repositorio y metadatos.
- Auditoría de artefactos de terceros: analizar la cadena de custodia de pesos distribuidos sin licencia declarada, un caso habitual en repositorios de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en fp16/bf16: alrededor de 3,6 GB de pesos más el caché KV; con una ventana de contexto moderada, entre 5 y 7 GB de VRAM.
- Inferencia en int8: aproximadamente 1,8 GB de pesos, en torno a 3 GB de VRAM totales.
- Inferencia en 4 bits: cerca de 1,1 GB de pesos; viable con 2 GB de VRAM si se convierte a GGUF.
- GPU de consumo: cabe con holgura en una RTX 3060 de 12 GB, una RTX 4060 Ti, una RTX 4070 o una RTX 4090; también en iGPU con memoria unificada suficiente.
- GPU de centro de datos: A100, H100, L40S o A10 sobredimensionadas para este tamaño; útiles solo por paralelismo de lote.
- CPU: la ejecución en CPU es viable tras convertir a GGUF con llama.cpp, con velocidades de decodificación que dependen del número de núcleos.
- Opciones de despliegue: vLLM, TGI y Transformers con pesos safetensors; llama.cpp y Ollama requieren conversión previa a GGUF, que no está publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas provienen de documentación pública general de cada familia y no de la búsqueda realizada para esta ficha; se incluyen como referencia orientativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (`rlve-archive-mopd-v2...13-congruentequation`) | 1,78 B | no disponible | no disponible | safetensors + checkpoint Megatron, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ |
| Llama-3.2-1B-Instruct | 1,24 B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF |
| Gemma-2-2B-it | 2,6 B | 8 192 tokens | Gemma Terms of Use | safetensors, GGUF |

No hay datos de rendimiento comparado para este checkpoint, por lo que la comparación se limita a especificaciones estructurales y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documentan datos de entrenamiento, hiperparámetros, composición del dataset ni procedencia del entorno.
- Licencia no declarada: no se puede asumir uso comercial permitido. Aunque la base sea presumiblemente Qwen 2.5, la licencia aplicable a este artefacto concreto es indeterminada, lo que supone un riesgo legal en producción.
- Idiomas no documentados: se desconoce qué lenguas cubre realmente tras el ajuste por refuerzo, que puede haber estrechado el comportamiento lingüístico hacia el idioma del entorno de entrenamiento.
- Riesgo de alucinación: no evaluado; en modelos de 1,8 B el riesgo es estructuralmente alto, especialmente fuera del dominio del entorno de entrenamiento.
- Sobreajuste al entorno: un ajuste corto (paso 9, entrenamiento de 150 pasos en la colección) sobre una única tarea de 400 puede degradar capacidades generales y provocar especialización excesiva.
- Sin cuantizaciones publicadas: desplegarlo en hardware limitado exige convertir los pesos uno mismo e implica asumir el coste y los posibles errores de conversión.
- Repositorio de archivo: cero descargas y cero interacciones, sin mantenimiento, sin issues y sin garantía de conservación a largo plazo.
- Sin evaluación de sesgos ni de seguridad: no hay filtros ni declaraciones de red teaming.
- Fechas de creación y actualización en 2026, coherentes con un pipeline de investigación interno, lo que dificulta contrastar el artefacto con publicaciones revisadas por pares.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/davidheineman/rlve-archive-mopd-v2-r1-p1r8-teachers-20261003-1150-13-congruentequation-d46eb063faf8
- Colección RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Colección RLVE OPD Teachers (Qwen 2.5 1.5B): https://huggingface.co/collections/davidheineman/rlve-opd-teachers-qwen-25-15b
- Repositorio de código RLVE: https://github.com/davidheineman/rlve
- Perfil de GitHub del autor: https://github.com/davidheineman
- Artículo de referencia del método: https://arxiv.org/abs/2511.07317
