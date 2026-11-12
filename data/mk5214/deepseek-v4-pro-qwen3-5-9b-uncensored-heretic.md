# mk5214/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una versión "decensored" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario mk5214. El modelo base es un fine-tune de Qwen3.5-9B orientado a razonamiento, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". Esta variante aplica la herramienta Heretic v2.0.0.dev0 para eliminar los mecanismos de rechazo del modelo original mediante ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA).

El modelo conserva la arquitectura y el tamaño del base: 9.409.813.744 parámetros totales (aproximadamente 9,4B) almacenados en safetensors, con un repositorio de 19,3 GB. Está etiquetado como `qwen3_5` y soporta tareas de image-text-to-text y text-generation. Su entrenamiento se centró en matemáticas y STEM, con aproximadamente 250.000 muestras de SFT y un pipeline de RL con GSPO.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta un modelo de razonamiento compacto (9B) destilado de un profesor de mayor tamaño; por otro, expone una técnica de "abliteración" que reduce drásticamente las negativas del modelo (de 100/100 a 3/100 en la evaluación del autor) con una divergencia KL de 0,0422 respecto al original. Es un caso de estudio útil tanto para quienes buscan un modelo sin restricciones de contenido como para quienes investigan técnicas de modificación de comportamiento en LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), etiqueta `qwen3_5`; no se detalla si es denso o MoE en la información disponible |
| Parametros totales | 9.409.813.744 (aproximadamente 9,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; se menciona evaluación con NVFP4 (vLLM) y MTP-Q8_0 (llama.cpp) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B, una arquitectura transformer de la familia Qwen. Según la model card, el entrenamiento se basa en destilación desde DeepSeek-V4-Pro en modo "Max Effect": se generaron respuestas del profesor y se usaron como señal supervisada (SFT) sobre aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico (STEM). Además, se menciona una fase de RL con GSPO (Group Sequence Policy Optimization), aunque no se detallan hiperparámetros ni composición exacta del dataset.

La innovación principal de esta variante concreta es la aplicación de Heretic v2.0.0.dev0, que realiza una ablación de rangos arbitrarios (ARA) sobre las capas 9 a 24 del modelo. Los parámetros reportados son: `preserve_good_behavior_weight` = 0,8264, `steer_bad_behavior_weight` = 0,0003, `overcorrect_relative_weight` = 0,9645 y `neighbor_count` = 12. El resultado declarado es una reducción de rechazos de 100/100 a 3/100, con una divergencia KL de 0,0422 frente al modelo original. No se especifica si se empleó decodificación especulativa, atención lineal u otras optimizaciones de inferencia más allá de las rutas de despliegue evaluadas (vLLM NVFP4 y llama.cpp MTP-Q8_0).

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en descomposición estructurada de problemas.
- Razonamiento matemático y resolución de problemas STEM, gracias al entrenamiento con aproximadamente 250.000 muestras específicas.
- Generación de código y transferencia cross-domain: la model card indica pequeñas mejoras en programación y uso de herramientas pese a no recibir SFT específico de código.
- Soporte de tool calling / function calling, etiquetado explícitamente en los tags del modelo.
- Capacidades multimodales de entrada image-text-to-text, según el pipeline declarado.
- Soporte multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo "uncensored": los mecanismos de rechazo se han reducido mediante ablación, lo que permite respuestas a solicitudes que el modelo original rechazaría.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con text-generation-inference.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo puede emplearse para generar soluciones paso a paso en entornos educativos o de investigación, aprovechando su entrenamiento específico en STEM y su capacidad de descomposición estructurada.
- Asistente de razonamiento técnico en pipelines de análisis: integrado vía vLLM, puede procesar consultas que requieran cadenas de razonamiento largas y verificación de resultados intermedios.
- Generación de código en producción: aunque no recibió SFT específico de código, el soporte de tool calling y las mejoras cross-domain permiten integrarlo en flujos de CI/CD para autocompletado, revisión o generación de tests.
- Automatización de atención al cliente con contenido sin restricciones: en escenarios donde el modelo original rechazaría consultas legítimas (por ejemplo, temas sensibles de salud o legal), esta variante reduce las negativas, aunque requiere supervisión humana por los riesgos asociados.
- Investigación sobre alineación y seguridad: útil para estudiar el efecto de la ablación ARA comparando respuestas con el modelo base y midiendo divergencia KL, tasas de rechazo y degradación de capacidades.
- Despliegue en hardware de consumo: con 9,4B parámetros y cuantización Q8_0 vía llama.cpp, puede ejecutarse en GPUs consumer de gama alta para prototipado y experimentación local.
- Procesamiento multimodal de documentos: al soportar image-text-to-text, puede extraer y razonar sobre información de imágenes combinadas con texto, por ejemplo en tareas de STEM con diagramas.

## Benchmarks y rendimiento

La model card solo reporta métricas de la modificación Heretic, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (Refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks de razonamiento, matemáticas o código en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa para un modelo de 9,4B parámetros: en FP16/BF16 requiere aproximadamente 19 GB de VRAM; en cuantización de 8 bits, unos 10 GB; en 4 bits, unos 6 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar compatibilidad con A100, H100, RTX 4090 y GPUs consumer de gama alta con suficiente VRAM, pero no se confirma.
- Cabe en GPU consumer: probablemente sí en modelos con 24 GB o más (RTX 4090, RTX 3090) usando cuantización, pero no se especifica.
- Opciones de despliegue: vLLM (ruta NVFP4 evaluada), llama.cpp (ruta MTP-Q8_0 evaluada), transformers, text-generation-inference y endpoints compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 9,4B | no disponible | apache-2.0 | Variante decensored con ablación ARA; 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9,4B | no disponible | apache-2.0 | Modelo original con rechazos 100/100; misma arquitectura |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4B (aproximado) | no disponible | no disponible | Versión 4B decensored mencionada en la model card |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos (decensoring) implica que el modelo puede generar contenido que el original bloquearía; esto conlleva riesgos de seguridad y requiere filtros externos si se despliega en producción.
- La divergencia KL de 0,0422 indica que el comportamiento del modelo se ha modificado respecto al original; pueden existir degradaciones no medidas en capacidades específicas.
- Riesgo de alucinación inherente a los modelos de razonamiento destilados, especialmente en dominios fuera de matemáticas y STEM.
- Sesgos conocidos: no se documentan en la model card; se desconoce la composición del dataset de entrenamiento más allá del foco en matemáticas y STEM.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto; los idiomas soportados son seis, pero no se detalla el nivel de competencia en cada uno.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el carácter "uncensored" puede entrar en conflicto con políticas de plataformas o legislación aplicable sobre contenido.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria.
- No se han publicado benchmarks estándar, por lo que no se puede verificar el rendimiento real en tareas de razonamiento, código o matemáticas.

## Enlaces

- Hugging Face: https://huggingface.co/mk5214/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B decensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Heretic (herramienta de decensoring): https://heretic-project.org
