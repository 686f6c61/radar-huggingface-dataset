# 0xSero/GLM-5.3-500B-EXL3-3.0bpw

## Resumen

GLM-5.3-500B-EXL3-3.0bpw es una variante podada y cuantizada del modelo GLM-5.3, desarrollada por 0xSero. El modelo original, creado por Z.AI, es un mixture-of-experts (MoE) de 753B parámetros totales, con 256 expertos por capa y 8 activos por token, lo que implica unos 40B parámetros activos. Esta variante elimina el 34% de los expertos enrutados (quedan 168 de 256) mediante la técnica REAP (Router-weighted Expert Activation Pruning), y cuantiza los expertos supervivientes a EXL3 3.0 bpw, manteniendo la atención, el experto compartido y el router en BF16.

El resultado es un modelo de 197 GB en disco, lo que permite ejecutarlo en 3 GPUs de 96 GB o 4 de 80 GB, en lugar de los aproximadamente 1,5 TB que requiere el modelo completo sin podar ni cuantizar. La pérdida de fidelidad es medida con una divergencia KL de 0,511 nats frente al modelo BF16 original, y se estima que reproduce el token más probable en torno al 78% de las ocasiones. Es relevante porque hace accesible un modelo de gran escala en hardware más modesto, con una degradación de calidad cuantificada y relativamente contenida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) con 256 expertos por capa, 8 activos por token; atención, shared expert y router en BF16 |
| Parametros totales | 98.508.689.504 (según metadatos safetensors); la model card indica ~500B |
| Parametros activos | ~40B (estimación del modelo base, no se especifica para esta variante) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 3.0 bpw (bits por peso) para expertos; BF16 para atención, shared expert y router |
| Idiomas soportados | no disponible |
| Licencia | other (hereda la licencia de zai-org/GLM-5.3) |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

GLM-5.3 es un modelo MoE en el que cada token se enruta a 8 de los 256 expertos subredes por capa, de modo que solo una fracción de los parámetros se activa en cada paso. Esta variante conserva 168 de los 256 expertos por capa, eliminando los menos útiles mediante REAP. El criterio de poda es "max-over-domain", que puntúa cada experto según su mayor contribución a un dominio concreto, preservando así especialistas de dominios raros (código, idiomas poco comunes, salidas estructuradas) que la poda por frecuencia eliminaría.

Los expertos supervivientes se cuantizan a 3 bits por peso en formato EXL3, mientras que la atención, el experto compartido y el router se mantienen en BF16. No se ha realizado reentrenamiento: la poda es directa sobre los pesos del modelo base. No se proporcionan datos sobre el corpus de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y diálogo conversacional (según la etiqueta pipeline y la model card).
- Modelo de lenguaje de gran escala con arquitectura MoE, adecuado para tareas de generación y razonamiento en el ámbito del lenguaje natural.
- No se especifica soporte para tool calling, function calling, visión, audio ni capacidades de agentes en la información disponible.
- No se detallan capacidades multilingües ni la longitud de contexto.

## Casos de uso

- Despliegue en servidores con 3 GPUs de 96 GB o 4 de 80 GB: permite ejecutar un modelo de la escala de GLM-5.3 en configuraciones de hardware que no podrían alojar la versión completa de 1,5 TB.
- Investigación en compresión de modelos MoE: la serie REAP permite comparar niveles de poda y cuantización, y estudiar el impacto en la fidelidad a través de la métrica KL.
- Experimentación con cuantización de baja precisión (3 bits) en modelos de gran escala: útil para evaluar el equilibrio entre tamaño, velocidad y calidad en entornos con VRAM limitada.
- Aplicaciones de diálogo y generación de texto en producción: el modelo puede integrarse en sistemas conversacionales mediante el runtime EXL3 o TabbyAPI, reduciendo los requisitos de hardware frente al modelo original.
- Evaluación de técnicas de poda de expertos: el criterio "max-over-domain" y los datos de fidelidad publicados permiten comparar esta variante con otras podas basadas en frecuencia.
- Prototipado de asistentes o herramientas de generación de texto en entornos locales o privados, donde se dispone de varias GPUs de gama alta pero no de un clúster completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento proporcionada es la divergencia KL frente al modelo BF16 original, calculada sobre un panel de 25 prompts y el vocabulario completo de 154k tokens: 0,511 nats. El modelo sin podar obtiene 0,089 nats. Se estima que esta variante reproduce el token más probable del modelo original en aproximadamente el 78% de los casos.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 197 GB en disco, por lo que se necesita aproximadamente esa cantidad de VRAM para los pesos, más memoria para la caché KV y overhead de inferencia. La model card indica que es apto para 3x 96 GB o 4x 80 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (usada en el desarrollo), o cualquier GPU CUDA con suficiente VRAM combinada, como A100/H100 de 80 GB.
- No cabe en GPU de consumo (consumer GPU) de forma individual; se requieren múltiples GPUs de centro de datos o estaciones de trabajo.
- Opciones de despliegue: exllamav3 (runtime EXL3) y TabbyAPI. También es posible usar otros frameworks compatibles con EXL3, aunque no se detallan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa más directa es con las otras variantes de la misma serie REAP, todas basadas en GLM-5.3 y cuantizadas a EXL3 3.0 bpw, pero con distinto número de expertos conservados:

| Variante | Expertos conservados | Tamano | KL vs BF16 |
|---|---|---|---|
| GLM-5.3-EXL3-3.0bpw (sin podar) | 256 / 256 | 293 GB | 0,089 |
| GLM-5.3-661B-EXL3-3.0bpw | 224 / 256 | 258 GB | 0,195 |
| GLM-5.3-615B-EXL3-3.0bpw | 208 / 256 | 240 GB | 0,283 |
| GLM-5.3-569B-EXL3-3.0bpw | 192 / 256 | 223 GB | 0,361 |
| GLM-5.3-533B-EXL3-3.0bpw | 180 / 256 | 210 GB | 0,428 |
| GLM-5.3-500B-EXL3-3.0bpw (esta) | 168 / 256 | 197 GB | 0,511 |

Todas comparten la misma licencia (hereda la de GLM-5.3) y están disponibles en HuggingFace. No se dispone de comparativas con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- La poda del 34% de los expertos implica una pérdida de fidelidad medida (KL 0,511 nats), por lo que la calidad de generación puede diferir del modelo original en ciertos dominios.
- El modelo está cuantizado a 3 bits, lo que puede reducir la precisión numérica y afectar a tareas sensibles.
- La licencia es "other" y hereda la de GLM-5.3, por lo que es necesario revisar los términos de la licencia original antes de cualquier uso comercial.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la evaluación de su idoneidad para aplicaciones multilingües o de contexto largo.
- El formato de pesos EXL3 es específico de exllamav3 y TabbyAPI, lo que limita la interoperabilidad con otros frameworks de inferencia.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento en tareas de seguridad; estos aspectos no han sido evaluados en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSero/GLM-5.3-500B-EXL3-3.0bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Paper de REAP: https://arxiv.org/abs/2510.13999
- GitHub de Cerebras REAP: https://github.com/CerebrasResearch/reap
- GitHub de exllamav3: https://github.com/turboderp-org/exllamav3
- Dataset de fidelidad: https://huggingface.co/datasets/0xSero/glm-5.3-reap-fidelity-study
- Dataset de observaciones: https://huggingface.co/datasets/0xSero/glm-5.3-reap-observations-v1
- Colección de modelos REAP de Cerebras: https://huggingface.co/collections/cerebras/cerebras-reap
