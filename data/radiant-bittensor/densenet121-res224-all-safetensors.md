# radiant-bittensor/densenet121-res224-all-safetensors

## Resumen

DenseNet-121 (torchxrayvision densenet121-res224-all) en formato safetensors es una conversión de los pesos de referencia del proyecto TorchXRayVision, publicada por el usuario radiant-bittensor como parte de la infraestructura de su minero RADiant. No es un modelo nuevo ni reentrenado: se trata del mismo clasificador de radiografías de tórax que distribuye TorchXRayVision, pero reempaquetado desde un módulo pickle de PyTorch a safetensors para que su carga no ejecute código arbitrario.

El modelo es una red convolucional DenseNet-121 con 7.049.682 parámetros, entrenada para clasificación multi-etiqueta de patologías torácicas sobre un conjunto de datasets públicos (NIH, CheXpert, MIMIC-CXR, PadChest, entre otros). Su salida son 18 etiquetas clínicas con umbrales de operación predefinidos, definidos en el `config.json` del repositorio.

Su relevancia es fundamentalmente práctica: ofrece una vía de carga segura (sin pickle) de un modelo médico ampliamente utilizado como referencia, lo que resulta útil en pipelines de inferencia o auditoría donde no se quiere ejecutar código embebido en los pesos. No aporta mejoras de rendimiento respecto al original y su adopción debe evaluarse con cautela por las restricciones de licencia de los datos de entrenamiento subyacentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (CNN con conexiones densas) |
| Parametros totales | 7.049.682 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una DenseNet-121 estándar, una red convolucional en la que cada capa recibe como entrada las salidas de todas las capas anteriores dentro de un bloque denso. El modelo se emplea como extractor de características globales sobre radiografías de tórax y produce una salida multi-etiqueta de 18 patologías, con umbrales de decisión calibrados por TorchXRayVision.

Los pesos no han sido reentrenados en esta conversión: proceden del módulo original de TorchXRayVision, cuyo entrenamiento se realizó sobre datasets públicos como NIH ChestX-ray14, CheXpert, MIMIC-CXR y PadChest. La model card no detalla el número de tokens ni la composición exacta del dataset, ni indica si hubo ajuste fino con RLHF o DPO (no aplicable en este dominio). La innovación de esta publicación es exclusivamente de empaquetado: la conversión a safetensors elimina la necesidad de deserializar un pickle de PyTorch, lo que reduce la superficie de ejecución de código al cargar el modelo. El `config.json` incluye el orden de las 18 etiquetas, los umbrales de operación y el sha256 del fichero fuente, lo que facilita la verificación de integridad.

## Capacidades

- Clasificación multi-etiqueta de radiografías de tórax en 18 categorías clínicas.
- Detección de hallazgos torácicos frecuentes (el conjunto exacto de etiquetas está definido en el `config.json` del repositorio).
- Carga segura mediante safetensors, sin ejecución de código embebido.
- Compatibilidad con la librería torchxrayvision para preprocesado e inferencia.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la clasificación de imagen médica.

## Casos de uso

- Inferencia segura en entornos clínicos o de investigación: cargar los pesos con safetensors evita ejecutar código pickle, lo que encaja en pipelines con requisitos estrictos de seguridad de la cadena de suministro.
- Auditoría y reproducibilidad de modelos médicos: el `config.json` incluye el sha256 del fichero original y los umbrales de operación, lo que permite verificar que la conversión coincide con el modelo de referencia de TorchXRayVision.
- Prototipado de clasificadores de tórax: al ser un modelo pequeño (7 M de parámetros), se puede ejecutar en CPU o GPU de gama baja para pruebas rápidas de preprocesado y etiquetado.
- Extracción de características para modelos posteriores: la salida de la DenseNet-121 puede reutilizarse como embedding en tareas de segmentación o clasificación secundaria.
- Evaluación comparativa de datasets públicos: sirve como línea base para comparar el rendimiento de nuevos modelos entrenados sobre NIH, CheXpert o MIMIC-CXR.
- Integración en el minero RADiant: el repositorio lo publica como pesos de referencia del minero, por lo que su uso principal previsto es dentro de esa infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (7 M de parámetros), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 3060, RTX 4090, etc.) e incluso en GPUs integradas.
- Opciones de despliegue: inferencia directa con PyTorch y la librería torchxrayvision; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| radiant-bittensor/densenet121-res224-all-safetensors | 7.049.682 | no aplica | Apache-2.0 | safetensors | Conversión segura del original |
| torchxrayvision/densenet121-res224-all | no disponible en la información | no aplica | Apache-2.0 | pickle (PyTorch) | Modelo de referencia original |
| Otras variantes de torchxrayvision (p. ej. densenet121-res224-nih) | no disponible en la información | no aplica | Apache-2.0 | pickle (PyTorch) | Entrenadas sobre subconjuntos específicos de datasets |

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son idénticos al original de TorchXRayVision y no aportan mejoras de precisión.
- Los datos de entrenamiento incluyen datasets con licencia solo para investigación (MIMIC-CXR, CheXpert), lo que puede restringir el uso comercial aunque la licencia del modelo sea Apache-2.0.
- Riesgo de sesgo: los datasets públicos de radiografías tienen sesgos demográficos y de adquisición conocidos que se heredan en el modelo.
- Riesgo de alucinación en sentido clínico: falsos positivos y negativos en la clasificación de patologías; no debe usarse como herramienta diagnóstica sin validación externa.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado, lo que limita la evidencia de uso en producción.
- No se documentan los idiomas ni el contexto porque el modelo no procesa texto.
- La conversión a safetensors no garantiza por sí sola la calidad del modelo; solo elimina el riesgo de ejecución de código al cargar los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/radiant-bittensor/densenet121-res224-all-safetensors
- Modelo original: https://huggingface.co/torchxrayvision/densenet121-res224-all
- Proyecto TorchXRayVision: https://github.com/mlmed/torchxrayvision
- Paper de TorchXRayVision (Cohen et al.): no disponible en la información proporcionada
