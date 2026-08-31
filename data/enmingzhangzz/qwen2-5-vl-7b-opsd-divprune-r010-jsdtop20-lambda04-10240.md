# enmingzhangzz/Qwen2.5-VL-7B-OPSD-DivPrune-r010-JSDtop20-lambda04-10240

## Resumen

Este repositorio contiene el adaptador final PEFT/LoRA del experimento OPSD (Optimized Pruning with Self-Distillation, según las siglas del autor) sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct`. El adaptador, de solo 0.2 GB, se ha entrenado con 10240 muestras del dataset `OpenMMReasoner/OpenMMReasoner-SFT-874K` y aplica una técnica de poda de tokens de visión (DivPrune con ratio de retención 0.1) combinada con un esquema de agrupación por divergencia JSD entre estudiante y profesor. Su objetivo es reducir el coste computacional de la inferencia multimodal manteniendo la calidad de las respuestas, una línea de investigación relevante para el despliegue eficiente de modelos de visión-lenguaje en entornos con recursos limitados.

El adaptador se carga con la librería PEFT sobre el modelo base, y requiere el parche de runtime de VisionZip (del repositorio OPSD) para la inferencia con poda. No se proporcionan resultados de benchmarks ni métricas de rendimiento en la información disponible, por lo que esta ficha se limita a documentar los aspectos técnicos y de uso del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-VL-7B-Instruct (modelo multimodal transformer) |
| Parametros totales | no disponible (el adaptador añade parámetros LoRA r=16, alpha=32; el modelo base no se especifica en la ficha) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (solo se publica el adaptador en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) y adapter_config.json |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen/Qwen2.5-VL-7B-Instruct`, un modelo de visión-lenguaje de 7B parámetros (arquitectura transformer multimodal). La configuración LoRA utiliza r=16 y alpha=32. El entrenamiento se realiza con 10240 muestras del dataset `OpenMMReasoner-SFT-874K`, con un esquema de muestreo balanceado (según la variante indica `balanced base-outcome sampling: false`). La técnica OPSD emplea un profesor EMA (decay 0.9999) y una poda de tokens de visión mediante DivPrune con ratio de retención 0.1. Además, se aplica una agrupación por divergencia JSD entre las distribuciones del estudiante y del profesor (modo `token_student_gap_jsd_grouped`) con una fracción de tokens de alto JSD de 0.2 y un lambda de agregación de 0.4. El entrenamiento usa un batch global de 32 (4 GPUs con micro-batch 8) y un tamaño de imagen de 846720 píxeles. No se detalla el proceso de optimización (pérdida, optimizador, épocas) más allá de estos hiperparámetros.

## Capacidades

- Procesamiento de entradas de imagen y texto (pipeline `image-text-to-text`), heredado del modelo base Qwen2.5-VL-7B-Instruct.
- Generación de respuestas multimodales con razonamiento visual y textual.
- Soporte de diálogo multi-turno (capacidad del modelo base, no específicamente documentada en este adaptador).
- El adaptador está diseñado para funcionar con poda de tokens de visión, reduciendo el número de tokens visuales procesados durante la inferencia.
- No se documentan capacidades adicionales como tool calling, agentes o modos especiales de razonamiento en la información proporcionada.

## Casos de uso

- Inferencia eficiente en dispositivos edge: gracias a la poda de tokens de visión (ratio 0.1), el adaptador permite ejecutar el modelo con menos cómputo visual, adecuado para aplicaciones en tiempo real sobre hardware limitado (por ejemplo, robots o asistentes móviles).
- Análisis de documentos con restricciones de latencia: en entornos donde se procesan muchas imágenes (facturas, formularios), la reducción de tokens visuales acelera la extracción de información sin necesidad de un modelo más pequeño.
- Investigación en eficiencia de modelos multimodales: sirve como referencia para estudiar el impacto de la poda de tokens visuales y la destilación auto-supervisada en la calidad de las respuestas.
- Prototipado de sistemas de visión-lenguaje con presupuesto computacional ajustado: el adaptador ligero (0.2 GB) permite iterar rápidamente sobre el modelo base sin requerir almacenamiento completo de pesos.
- Despliegue en infraestructura con múltiples GPUs: el entrenamiento ya se realizó con 4 GPUs, y el adaptador puede integrarse en pipelines de inferencia distribuida usando PEFT.
- Evaluación comparativa de técnicas de pruning: al ser una variante concreta (DivPrune, JSD grouping), puede utilizarse para comparar contra otros adaptadores OPSD (por ejemplo, el oficial con VisionZip) en tareas de razonamiento visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de tareas visuales (por ejemplo, DocVQA, ChartQA). Tampoco se indican comparaciones de rendimiento con el modelo base sin poda ni con otros adaptadores.

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB, pero requiere cargar el modelo base completo `Qwen2.5-VL-7B-Instruct` (aproximadamente 14-16 GB en FP16, según el tamaño típico de un modelo 7B, aunque este dato no se confirma en la información proporcionada).
- Para la inferencia con poda, es necesario aplicar el parche de runtime de VisionZip (del repositorio OPSD), lo que puede requerir modificaciones en el entorno de ejecución.
- Se recomienda al menos una GPU con 16 GB de VRAM para el modelo base en FP16 (por ejemplo, RTX 4090, A100 40GB, H100). No se especifican requisitos mínimos exactos.
- Opciones de despliegue: se puede usar PEFT para cargar el adaptador sobre el modelo base en frameworks como Hugging Face Transformers, vLLM o TGI, aunque no se confirma la compatibilidad explícita. La inferencia con poda puede requerir un backend personalizado (VisionZip).
- Latencia y throughput: no se proporcionan datos estimados.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño del adaptador | Dataset de entrenamiento | Técnica de poda | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-VL-7B-OPSD-DivPrune-r010-JSDtop20-lambda04-10240 (este) | LoRA sobre Qwen2.5-VL-7B | 0.2 GB | OpenMMReasoner-SFT-874K (10240 muestras) | DivPrune + JSD grouping | no disponible |
| Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-gap01-kl50-f20-lambda04-10240 | LoRA sobre Qwen2.5-VL-7B | no disponible | OpenMMReasoner-SFT-874K (10240 muestras) | VisionZip (KL50/F20) | no disponible |
| Qwen2.5-VL-7B-Instruct (base) | Modelo completo | - | - | sin poda | Apache 2.0 (según documentación oficial de Qwen) |

Ambos adaptadores OPSD comparten el mismo modelo base y dataset, pero difieren en la estrategia de poda y agrupación. No se dispone de resultados comparativos de rendimiento entre ellos. El modelo base Qwen2.5-VL-7B-Instruct está disponible públicamente y su licencia es Apache 2.0 (según la documentación oficial de Qwen, no confirmada en la información de este repositorio).

## Limitaciones y advertencias

- Adaptador experimental: se trata de un experimento de investigación (OPSD) y no se garantiza su estabilidad ni calidad en producción.
- Requiere el runtime patch de VisionZip para la inferencia con poda; sin ese parche, el adaptador puede no funcionar correctamente o requerir el procesamiento completo de tokens visuales.
- La licencia del adaptador no está especificada, lo que limita su uso comercial sin aclaración legal.
- No se proporcionan datos de sesgos, alucinación ni evaluación de seguridad. Al ser un adaptador sobre un modelo base, hereda los riesgos del modelo original (posibles sesgos en datos de entrenamiento, alucinaciones en respuestas visuales).
- El entrenamiento se realizó con un subconjunto de 10240 muestras del dataset OpenMMReasoner-SFT-874K; la generalización a otros dominios no está verificada.
- No se indica el número de pasos de entrenamiento ni la configuración completa del optimizador, lo que dificulta la reproducibilidad exacta fuera del repositorio.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-DivPrune-r010-JSDtop20-lambda04-10240
- Adaptador OPSD oficial con VisionZip: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-gap01-kl50-f20-lambda04-10240
- Despliegue en FriendliAI (modelo relacionado): https://friendli.ai/models/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240
- Modelo base Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio GitHub de Qwen2.5-VL: https://github.com/ZBXallen/Qwen2.5-VL
