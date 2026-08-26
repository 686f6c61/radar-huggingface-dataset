# PoHao/opt2.7-fc1-predictor

## Resumen

PoHao/opt2.7-fc1-predictor es un conjunto de 32 pequeños modelos predictores de activación diseñados para el modelo de lenguaje OPT-2.7B de Facebook. Cada predictor se asocia a una capa del decoder del modelo base y, a partir de la entrada a la capa `fc1` (la primera capa lineal de la red feed-forward), predice qué neuronas de salida se activarán. Esta predicción permite aplicar una máscara binaria y omitir el cálculo de las neuronas inactivas durante la inferencia, una técnica conocida como inferencia dispersa (_sparse inference_) que reduce el coste computacional sin modificar la arquitectura del modelo original.

El proyecto, desarrollado por PoHao, se publica bajo licencia Apache 2.0 y se complementa con un modelo fine-tuned específico (`PoHao/opt2.7-predictor-guided-sft`) que ha sido ajustado para trabajar conjuntamente con estos predictores. La relevancia actual radica en la creciente demanda de optimización de modelos grandes en entornos de producción, donde la reducción de latencia y el ahorro de cómputo son críticos. Aunque el repositorio no incluye métricas de rendimiento ni documentación sobre el proceso de entrenamiento, la arquitectura de los predictores es simple y ligera, lo que facilita su integración en pipelines de inferencia existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (PredictorMLP: dos capas lineales con ReLU y sigmoide final) |
| Parametros totales | no disponible (depende de las dimensiones de OPT-2.7B; no se especifican en la documentacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base OPT-2.7B es multilingue, pero los predictores no procesan texto directamente) |
| Licencia | apache-2.0 |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

Cada predictor es un perceptrón multicapa (MLP) con una capa oculta de 512 neuronas. La entrada es el vector de estado oculto que alimenta a la capa `fc1` de una capa concreta del decoder de OPT-2.7B, y la salida es un vector de probabilidades (una por neurona de salida de `fc1`) en el rango [0, 1]. Aplicando un umbral (por defecto 0.5) se obtiene una máscara binaria que indica qué neuronas deben mantenerse activas. La arquitectura es intencionadamente sencilla para minimizar el coste de la predicción.

No se proporcionan detalles sobre el proceso de entrenamiento: ni el número de tokens utilizados, ni la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. La model card solo indica que los predictores se emparejan con un modelo fine-tuned (`PoHao/opt2.7-predictor-guided-sft`), lo que sugiere que el ajuste del modelo base y el entrenamiento de los predictores se realizaron de forma conjunta para maximizar la precisión de las máscaras. Tampoco se especifica la función de pérdida ni el optimizador empleados.

## Capacidades

- Predicción de activaciones de neuronas en la capa `fc1` de cada decoder layer de OPT-2.7B.
- Generación de máscaras binarias para inferencia dispersa, permitiendo omitir el cálculo de neuronas inactivas.
- Integración sencilla con el modelo base mediante la carga de archivos `.pt` individuales.
- No es un modelo generativo: no produce texto, código ni respuestas.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio, etc.).
- El multilingüismo depende del modelo base, no de los predictores.

## Casos de uso

- Aceleración de inferencia de OPT-2.7B en producción: al aplicar las máscaras generadas por los predictores, se reduce el número de operaciones de la capa `fc1`, disminuyendo la latencia y el consumo energético en servidores dedicados.
- Despliegue en entornos con recursos limitados: la inferencia dispersa permite ejecutar OPT-2.7B en hardware con menor capacidad de cómputo (por ejemplo, GPUs de gama media) sin sacrificar demasiada calidad.
- Optimización de costes en APIs de generación de texto: al reducir el tiempo de cómputo por petición, se pueden atender más solicitudes con la misma infraestructura.
- Investigación en sparse inference: sirve como referencia para estudiar la viabilidad de predecir activaciones en modelos transformer y comparar diferentes estrategias de poda dinámica.
- Integración con motores de inferencia personalizados: los predictores se pueden incorporar a pipelines de vLLM, TensorRT u otros frameworks que permitan máscaras de activación.
- Fine-tuning dirigido: el modelo complementario `PoHao/opt2.7-predictor-guided-sft` está diseñado para trabajar con estos predictores, lo que permite experimentar con ajuste fino y sparse inference de forma conjunta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros métodos de sparse inference.

## Requisitos de hardware

- Los predictores individuales son MLPs pequeños (capa oculta de 512) y se pueden ejecutar en CPU sin problemas. El tamaño total del repositorio es de 0.8 GB, lo que incluye los 32 archivos `.pt`.
- No se requiere GPU para ejecutar los predictores; el modelo base OPT-2.7B sí necesita una GPU con al menos 8 GB de VRAM para inferencia en FP16 (o más si se usa FP32).
- Para la inferencia completa con sparse inference, se recomienda una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, A10) para alojar el modelo base y los predictores en memoria.
- Opciones de despliegue: los predictores se cargan con PyTorch estándar y se pueden integrar en cualquier framework que permita modificar la salida de las capas lineales (por ejemplo, hooks en Hugging Face Transformers). No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- La latencia adicional introducida por los predictores es mínima (una pasada forward por capa), pero no se proporcionan cifras concretas de throughput.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de predicción de activaciones para OPT-2.7B o para otros modelos transformer. No se puede establecer una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los predictores son específicos para OPT-2.7B y no son transferibles a otros modelos sin reentrenamiento.
- La precisión de las máscaras depende del umbral fijado (0.5 por defecto); un umbral inadecuado puede degradar la calidad de la generación.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un componente auxiliar, estos dependen del modelo base.
- El uso en producción requiere validar que la poda de neuronas no afecte significativamente a la calidad del texto generado, especialmente en tareas que exigen precisión.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base OPT-2.7B tiene su propia licencia (MIT), por lo que se deben respetar ambas.
- No se proporcionan garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- [HuggingFace: PoHao/opt2.7-fc1-predictor](https://huggingface.co/PoHao/opt2.7-fc1-predictor)
- [HuggingFace: PoHao/opt2.7-predictor-guided-sft](https://huggingface.co/PoHao/opt2.7-predictor-guided-sft)
- [HuggingFace: facebook/opt-2.7b](https://huggingface.co/facebook/opt-2.7b)
