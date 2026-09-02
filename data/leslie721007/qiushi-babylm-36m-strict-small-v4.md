# leslie721007/Qiushi-BabyLM-36M-Strict-Small-v4

## Resumen

Qiushi-BabyLM-36M-Strict-Small-v4 es un modelo de lenguaje enmascarado (masked language model) de 36,46 millones de parámetros desarrollado por Qiushi Engine para la pista Strict-Small del desafío BabyLM 2026. Su objetivo es demostrar que es posible obtener un rendimiento competitivo en tareas de comprensión del lenguaje con un presupuesto de entrenamiento extremadamente reducido (10 millones de palabras), frente a los cientos de miles de millones de tokens que usan los modelos convencionales. El modelo se basa en la arquitectura DeBERTa-v2 con una innovación propia: la incorporación de adaptadores residuales de doble vía que permiten consolidar el conocimiento adquirido durante el entrenamiento sin degradar las capacidades previas.

La relevancia de este modelo radica en su enfoque de eficiencia muestral: utiliza una técnica de "reinversión de presupuesto" mediante vistas compactas de las oraciones (generadas con Qwen3.5-9B) que reducen la redundancia léxica y permiten diversificar la experiencia lingüística dentro del mismo límite de palabras. El modelo está pensado para investigación en aprendizaje de lenguaje con datos limitados, evaluación de representaciones y experimentos de fill-mask. No es un modelo conversacional ni está orientado a generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder) con adaptadores residuales de doble vía |
| Parametros totales | 36.458.592 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens (máxima de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea un encoder DeBERTa-v2 con 8 capas, tamaño oculto de 480 y 8 cabezas de atención. Cada capa incorpora dos adaptadores residuales de cuello de botella de 128 dimensiones, lo que eleva el total a 36.458.592 parámetros. El entrenamiento se realizó con modelado de lenguaje enmascarado con enmascaramiento de palabra completa (whole-word masking) sobre un corpus de 10 millones de palabras en inglés, con un tokenizer propio de 16.384 entradas entrenado exclusivamente sobre ese mismo corpus.

Dos innovaciones técnicas destacan en el proceso de entrenamiento. La primera, "compact-view reinvestment", consiste en generar versiones compactas de las oraciones del corpus (mediante Qwen3.5-9B) que preservan el significado pero reducen la redundancia; el presupuesto de palabras así liberado se reinvierte en más ejemplos diversos, manteniendo el límite total de 10M palabras. La segunda, "dual-path residual consolidation", añade una vía residual de salida cero que se entrena durante una continuación corta y coherente, calibrando su contribución para adaptarse sin reemplazar la vía original. El modelo final representa 86.005.295 exposiciones a palabras contadas.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask): predice tokens enmascarados en contexto.
- Generación de representaciones contextuales de alta calidad para tareas downstream (clasificación, scoring, etc.).
- Evaluación de gramaticalidad y aceptabilidad lingüística (BLiMP, BLiMP Supplement).
- Razonamiento de sentido común y conocimiento del mundo (EWoK, GlobalPIQA).
- Seguimiento de entidades y resolución de referencias (Entity Tracking).
- Comprensión lectora y tareas de lectura (Reading).
- Tareas de clasificación de texto tipo GLUE/SuperGLUE.
- No soporta generación de texto libre, tool calling, agentes ni multimodalidad.

## Casos de uso

- Investigación en eficiencia muestral: sirve como punto de referencia para estudiar cómo modelos pequeños pueden aprender lenguaje con presupuestos de datos extremadamente reducidos, comparando arquitecturas y estrategias de aumento de datos.
- Evaluación de representaciones lingüísticas: sus representaciones pueden extraerse y usarse como características para clasificadores en tareas de análisis de sentimiento, detección de toxicidad o clasificación de documentos, gracias a su buen rendimiento en GLUE.
- Experimentos de fill-mask en entornos educativos: permite demostrar predicción de palabras en contexto para enseñar conceptos de modelos de lenguaje enmascarados, sin necesidad de recursos computacionales elevados.
- Pruebas de robustez ante datos limitados: al estar entrenado con solo 10M palabras, es útil para validar hipótesis sobre la cantidad mínima de datos necesaria para adquirir ciertas capacidades lingüísticas.
- Línea base para BabyLM: cualquier equipo que participe en el desafío BabyLM 2026 puede usar este modelo como referencia para comparar sus propios enfoques en la pista Strict-Small.
- Análisis de sesgos en modelos pequeños: al ser un modelo compacto y transparente, permite estudiar cómo los sesgos de género, raza o dialecto emergen incluso con datos limitados, y cómo las técnicas de aumento de datos los mitigan o amplifican.

## Benchmarks y rendimiento

La evaluación local oficial-compatible reporta los siguientes resultados:

| Metrica | Puntuacion |
|---|---|
| BLiMP | 68,5100 |
| BLiMP Supplement | 63,6400 |
| EWoK | 50,0200 |
| Entity Tracking | 28,3200 |
| COMPS | 52,0500 |
| GlobalPIQA | 38,5650 |
| (Super)GLUE | 69,8192 |
| Reading | 8,1650 |
| AoA | 0,0000 |
| **Overall** | **42,1210** |

Estos resultados son locales y no han sido verificados por el servidor oficial del desafío; la identidad en el leaderboard solo se establece tras el envío y puntuación por parte de la organización. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 36M parámetros, la inferencia en FP32 requiere aproximadamente 150 MB de VRAM; en FP16 o cuantizado a 8 bits, menos de 100 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA GTX 1050 Ti, RTX 2060 o superior funcionará sin problemas. Incluso CPU es viable para inferencia.
- Cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) y también en dispositivos edge con aceleradores básicos.
- Opciones de despliegue: al ser un modelo de Transformers, puede ejecutarse con la librería `transformers` directamente, o servirse con vLLM, TGI o llama.cpp si se convierte a GGUF (aunque no se proporcionan cuantizaciones oficiales).
- Latencia y throughput: en una GPU moderna, la inferencia de un solo ejemplo es del orden de milisegundos; en CPU, decenas de milisegundos. No se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo compite en la pista Strict-Small de BabyLM 2026, donde los participantes entrenan modelos con el mismo presupuesto de 10M palabras, pero no se han publicado resultados de otros participantes en la información disponible.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; no soporta otros idiomas.
- No es un modelo conversacional ni está afinado para instrucciones; no debe usarse para generación de texto libre.
- La licencia "other" no especifica términos de uso; se recomienda contactar al autor antes de un uso comercial.
- El rendimiento en tareas de razonamiento complejo (Entity Tracking, Reading, AoA) es bajo, lo que indica limitaciones en comprensión profunda y seguimiento de entidades.
- El modelo fue entrenado con un corpus limitado y puede reflejar sesgos presentes en los datos de BabyLM; no se han realizado auditorías de sesgo.
- Requiere `trust_remote_code=True` al cargarse, lo que implica ejecutar código personalizado del autor; se debe revisar el código antes de usarlo en entornos de producción.
- Los resultados de evaluación son locales y no han sido validados por el servidor oficial de BabyLM; podrían diferir tras la verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leslie721007/Qiushi-BabyLM-36M-Strict-Small-v4
- Página oficial de BabyLM: https://babylm.github.io/
- Repositorio de evaluación de BabyLM (strict): https://github.com/babylm-org/babylm-eval/tree/main/strict
- Baselines GPT-2 de BabyLM 2026: https://github.com/babylm-org/babylm-baselines/blob/main/strict-gpt2/README.md
