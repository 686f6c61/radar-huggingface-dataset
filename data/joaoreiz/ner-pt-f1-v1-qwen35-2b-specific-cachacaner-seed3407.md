# JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed3407

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed3407` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se basa en el modelo Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parámetros, y está entrenado específicamente sobre el corpus cachacaner. El adaptador convierte la generación de texto libre en una salida JSON estructurada con etiquetas y tokens, lo que permite una extracción de entidades controlada y verificable.

Este artefacto forma parte de una matriz de investigación más amplia (`ner-pt-generative-2026-f1-v1`) y se publica con un protocolo de reproducibilidad detallado, incluyendo métricas de validación y contratos de inferencia. Su relevancia radica en ofrecer un enfoque generativo para NER en portugués, con resultados documentados sobre un corpus específico y un énfasis en la validez estructural de las predicciones.

El modelo está pensado para investigación, evaluación y experimentación controlada, no para uso en producción de alto riesgo. La licencia no está especificada en la información disponible, por lo que se debe contactar al autor antes de cualquier uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-2B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA es de 0.1 GB; el modelo base tiene 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16, pesos del adaptador en safetensors) |
| Idiomas soportados | Portugués (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena sobre el modelo base `Qwen/Qwen3.5-2B` en una revisión específica (`15852e8c16360a2fea060d615a32b45270f8a8fc`). El entrenamiento se realiza en precisión BF16 con la técnica LoRA, sobre el dataset cachacaner, con semilla 3407 y régimen `specific`. La selección del checkpoint se basa en la F1 end-to-end de validación, sin utilizar el split de test para la selección.

La inferencia canónica se ejecuta con vLLM, temperatura 0 y una salida JSON restringida con el esquema `labels_and_tokens`. Esta restricción garantiza que la salida sea estructuralmente válida (formato JSON correcto) aunque el contenido semántico pueda ser incorrecto. La política ante salidas inválidas es asignar una predicción vacía en la puntuación end-to-end.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas adicionales como RLHF o DPO. La información disponible se limita a la configuración del run y los resultados.

## Capacidades

- Reconocimiento de entidades nombradas generativo en portugués, produciendo etiquetas y tokens en formato JSON estructurado.
- Especialización en el corpus cachacaner, con alta validez estructural (0.9996) en las predicciones.
- Inferencia reproducible con vLLM, temperatura 0 y salida JSON restringida.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación en NER para portugués: permite estudiar el comportamiento de un enfoque generativo frente a métodos clásicos de token-classification, gracias a su salida JSON estructurada y su protocolo de inferencia documentado.
- Evaluación de esquemas de anotación: al ser entrenado sobre un corpus específico (cachacaner), puede usarse para comparar la coherencia entre distintos esquemas de anotación de entidades en portugués.
- Extracción de entidades en textos portugueses para análisis de datos: el adaptador puede integrarse en pipelines de procesamiento de lenguaje natural para extraer personas, organizaciones, lugares u otras entidades definidas por el corpus, siempre que el dominio sea similar al de entrenamiento.
- Desarrollo de sistemas de NER con salida verificable: la restricción JSON permite validar automáticamente la estructura de las predicciones, útil en entornos donde se requiere trazabilidad de errores.
- Benchmarking de modelos generativos frente a discriminativos: sirve como punto de referencia para comparar la F1 end-to-end y la validez estructural de diferentes arquitecturas sobre el corpus cachacaner.
- Experimentación controlada en downstream tasks: al estar documentado el protocolo de reproducción, puede utilizarse en estudios que requieran aislar el efecto del adaptador sobre tareas posteriores.

## Benchmarks y rendimiento

Los resultados publicados corresponden al split de test del corpus cachacaner para esta semilla específica:

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| cachacaner | 0.9375 | 0.9302 | 0.9338 | 0.9996 |

No se han publicado comparaciones con otros modelos en la información disponible. Los resultados se refieren únicamente a los splits congelados y a esta semilla; la incertidumbre entre semillas requiere completar la matriz de tres semillas mencionada en la model card.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.1 GB), pero requiere el modelo base Qwen3.5-2B, que en BF16 ocupa aproximadamente 4 GB de VRAM.
- Se recomienda una GPU con al menos 6-8 GB de VRAM para inferencia cómoda con vLLM, aunque no se especifica oficialmente.
- Es probable que quepa en GPUs consumer como RTX 3060, RTX 4060 o superiores, dado el tamaño del modelo base.
- Opciones de despliegue: vLLM (indicado en la model card), también compatible con PEFT para carga del adaptador sobre el base.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. La información publicada no incluye comparaciones con otros modelos de NER en portugués ni con otros adaptadores generativos.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente válidos pero semánticamente incorrectos, como advierte la model card.
- El modelo no ha sido validado para decisiones de alto riesgo o autónomas; su uso se limita a investigación y experimentación controlada.
- Los esquemas de anotación del corpus pueden diferir de otros corpus, lo que afecta la transferencia a otros dominios.
- La licencia no está especificada, por lo que el uso comercial requiere autorización explícita del autor.
- Los resultados de rendimiento corresponden a un único seed y a splits congelados; no deben interpretarse como rendimiento general fuera de estos corpus.
- La política de salida inválida (predicción vacía) puede subestimar el rendimiento en casos donde la generación falle.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed3407)
- [Modelo base Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
