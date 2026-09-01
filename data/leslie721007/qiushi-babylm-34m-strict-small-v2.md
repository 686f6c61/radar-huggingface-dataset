# leslie721007/Qiushi-BabyLM-34M-Strict-Small-v2

## Resumen

Qiushi-BabyLM-34M-Strict-Small-v2 es un modelo de lenguaje enmascarado (masked language model) de 34,47 millones de parámetros desarrollado por Qiushi Engine (usuario de HuggingFace leslie721007) para la investigación pública sobre preentrenamiento eficiente en datos. Forma parte de la pista Strict-Small del reto BabyLM 2026, cuyo objetivo es entrenar modelos con un presupuesto fijo de 10 millones de palabras. Este modelo en concreto evalúa la técnica denominada U256 Faithful Experience Utilization, que segmenta las filas tokenizadas largas en fragmentos de continuación de como máximo 256 tokens en lugar de descartar silenciosamente las colas, exponiendo así al modelo a todo el texto ya cargado en el presupuesto fijo de palabras.

La arquitectura es un DeBERTa-v2 con 8 capas, tamaño oculto de 480, 8 cabezas de atención y vocabulario BPE de 16.384 tokens a nivel de byte. El modelo fue entrenado desde pesos aleatorios con exactamente 100.000.000 de exposiciones de palabras cargadas durante 10 épocas, sobre un corpus que combina fuentes en inglés permitidas con vistas semánticas compactas generadas por Qwen3.5-9B, sin transferencia de pesos ni estados ocultos del profesor. Los resultados de evaluación en el pipeline oficial de BabyLM 2026 muestran una puntuación global de 41,33, con mejoras modestas frente a su línea base estricta, lo que lo convierte en un objeto de estudio para entender cómo la visibilidad de los datos ya presupuestados afecta al rendimiento downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (transformer encoder) |
| Parametros totales | 34.467.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo safetensors originales) |
| Idiomas soportados | ingles (en) |
| Licencia | other (investigacion publica; derechos de terceros sobre corpus y texto generado no afectados) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura DeBERTa-v2, un transformer encoder con atención desacoplada, aunque la model card no especifica detalles adicionales sobre esta variante. La configuración es estándar: 8 capas, tamaño oculto de 480, 8 cabezas de atención y FFN de 1.920, con un vocabulario BPE de 16.384 tokens a nivel de byte. El objetivo de entrenamiento es el enmascarado de palabras completas (whole-word masking) con una tasa fija del 15%.

El entrenamiento se realizó sobre un corpus fijo de 10.000.000 de palabras, combinando fuentes en inglés permitidas por el reto BabyLM 2026 con vistas semánticas compactas generadas por Qwen3.5-9B. El tokenizador se entrenó únicamente sobre ese mismo pool. El modelo recibió exactamente 100.000.000 de exposiciones de palabras cargadas en 10 épocas, con AdamW, tasa de aprendizaje máxima de 0,001, weight decay de 0,01, calentamiento lineal del 6% seguido de decaimiento coseno, y tamaño de lote efectivo de 256. Las semillas se fijaron en 43022 para inicialización, 43 para framework y 43023 para el flujo de entrenamiento. La innovación principal es la técnica U256: en lugar de truncar filas largas, se segmentan en fragmentos de continuación de hasta 256 tokens, aumentando la cobertura de tokens BPE visibles en aproximadamente un 2,59% relativo, manteniendo idénticos corpus, contabilidad de palabras, conjunto de ejemplos, modelo, tokenizador, objetivo y semillas.

## Capacidades

- Modelo de lenguaje enmascarado (fill-mask) para predecir tokens enmascarados en contexto.
- Representaciones contextuales de texto en inglés, entrenadas con un presupuesto de datos muy restringido (10M de palabras).
- Adecuado para investigación en eficiencia de datos, análisis de la utilización de experiencia y evaluación de técnicas de segmentación de secuencias.
- No es un asistente conversacional ni un modelo instructivo; no soporta generación libre, tool calling, agentes ni razonamiento multi-paso.
- Evaluado en el pipeline de BabyLM 2026 Strict-Small, que incluye tareas de BLiMP, EWoK, Entity Tracking, COMPS, (Super)GLUE, GlobalPIQA y Reading.

## Casos de uso

- Investigacion academica sobre preentrenamiento eficiente: el modelo sirve como punto de comparacion para estudiar como la segmentacion de secuencias (U256) afecta a la cobertura de tokens y al rendimiento en tareas linguisticas, permitiendo aislar el efecto de la visibilidad de datos ya presupuestados.
- Analisis de representaciones linguisticas en modelos pequenos: al ser un encoder DeBERTa-v2, puede usarse para extraer embeddings contextuales y estudiar la adquisicion de fenomenos gramaticales (BLiMP, EWoK) bajo condiciones de datos limitadas.
- Evaluacion de tecnicas de aumento de datos con modelos profesores: el corpus incluye texto generado por Qwen3.5-9B sin transferencia de pesos, lo que permite investigar el impacto de datos sinteticos compactos en el aprendizaje de lenguage.
- Reproduccion y extension de experimentos BabyLM: investigadores pueden replicar el entrenamiento con las semillas y el metodo U256 publicados, comparando con otros participantes de la pista Strict-Small.
- Desarrollo de benchmarks de eficiencia de datos: los resultados en el pipeline oficial sirven como referencia para medir el progreso en la competicion BabyLM 2026.
- Educacion y demostracion de arquitecturas transformer pequenas: por su tamano reducido (34M parametros), es util para ensenar conceptos de MLM, atencion y preentrenamiento en entornos docentes o prototipos rapidos.

## Benchmarks y rendimiento

Los siguientes resultados provienen de una ejecucion local completa del pipeline de evaluacion oficial compatible con BabyLM 2026 Strict-Small, incluyendo la escalera de checkpoints requerida para AoA. No son puntuaciones oficiales del leaderboard hasta que el publicador las acepte.

| Metrica | Puntuacion |
|---|---|
| BLiMP | 66,8172 |
| BLiMP Supplement | 60,8477 |
| EWoK | 50,3861 |
| Entity Tracking | 28,4331 |
| COMPS | 51,6455 |
| (Super)GLUE | 70,3747 |
| GlobalPIQA | 36,1359 |
| Reading | 7,3229 |
| AoA | 0,0000 |
| **Overall** | **41,3292** |

Frente a su linea base estrictamente emparejada, el modelo mejora el Overall en 0,0715, con ganancias en BLiMP y Entity Tracking y un descenso material en Reading. Debe interpretarse como una compensacion medida en la utilizacion de experiencia, no como una afirmacion de estado del arte.

## Requisitos de hardware

- Tamano del modelo: 34,47 millones de parametros, lo que ocupa aproximadamente 138 MB en FP32 y unos 69 MB en FP16. El repo pesa 0,1 GB.
- VRAM estimada para inferencia: menos de 1 GB en FP32, por lo que cabe en cualquier GPU moderna, incluso en CPUs con suficiente RAM.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere hardware especializado.
- Inferencia en CPU: viable sin problemas, con latencias de milisegundos por ejemplo en un solo forward.
- Opciones de despliegue: al ser un modelo de transformers estandar, puede ejecutarse con la libreria transformers (AutoModelForMaskedLM), tambien con ONNX o TensorRT si se exporta. No se mencionan soporte para vLLM, Ollama o llama.cpp, dado que es un modelo encoder de relleno de mascaras, no generativo.
- Throughput estimado: no disponible, pero al ser tan pequeno, se pueden procesar cientos de ejemplos por segundo en una GPU moderna.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa con otros modelos de la misma categoria (BabyLM Strict-Small) en la informacion proporcionada. La model card menciona una linea base estrictamente emparejada (sin U256), pero no se publican sus valores numericos en el README. Como referencia conceptual, los modelos BabyLM suelen compararse con baselines GPT-2 pequenos de la organizacion BabyLM (por ejemplo, el baseline strict-gpt2), pero sus resultados no estan incluidos en esta ficha. Por tanto, la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo de investigacion, no un asistente conversacional: no debe usarse para generar respuestas ni como fuente de consejos facticos, medicos, legales, financieros o de seguridad.
- Sesgos potenciales: al entrenarse con un corpus limitado de 10M de palabras, las representaciones pueden reflejar sesgos presentes en las fuentes originales, aunque no se evaluan en la informacion disponible.
- Riesgo de alucinacion: al ser un modelo enmascarado, no genera texto libre, pero sus predicciones de tokens enmascarados pueden ser incorrectas o poco probables en contextos complejos.
- Limitaciones de contexto: la longitud de secuencia es de 256 tokens, lo que impide manejar documentos largos o dependencias de largo alcance.
- Idioma: solo ingles; no se evaluaron otras lenguas.
- Licencia restrictiva: la licencia "other" indica que los pesos se liberan para evaluacion publica en investigacion, pero los derechos sobre los corpus de terceros y el texto generado no se transfieren. Es necesario revisar las condiciones exactas antes de cualquier uso comercial.
- Rendimiento limitado: las puntuaciones de Reading (7,32) y AoA (0,0) son muy bajas, lo que sugiere dificultades en tareas de comprension lectora y adquisicion de orden de adjetivos, probablemente por el presupuesto de datos extremadamente reducido.
- No se proporcionan cuantizaciones oficiales; el unico formato disponible es safetensors original.

## Enlaces

- HuggingFace: https://huggingface.co/leslie721007/Qiushi-BabyLM-34M-Strict-Small-v2
- Version v1 (referencia): https://huggingface.co/leslie721007/Qiushi-BabyLM-34M-Strict-Small-v1
- BabyLM Challenge: https://babylm.github.io/
- Repositorio de baselines BabyLM (GitHub): https://github.com/babylm-org/babylm-baselines
