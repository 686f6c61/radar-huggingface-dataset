# AMAImedia/Kimi-K3-speculator-dspark

## Resumen

Kimi-K3-speculator-dspark es un modelo auxiliar de decodificación especulativa (speculator) diseñado para acelerar la inferencia del modelo base moonshotai/Kimi-K3, un LLM de 2,8 billones de parámetros con arquitectura Kimi Delta Attention (KDA) y capacidades multimodales nativas. Este speculator, desarrollado originalmente por Red Hat AI y publicado también bajo el identificador AMAImedia/Kimi-K3-speculator-dspark, emplea el método DSpark (Draft-Spark) implementado en la librería Speculators de vLLM. Con solo 4.744.900.481 parámetros (aproximadamente 4,7B), el modelo predice tokens candidatos que el verifier (Kimi-K3) acepta o rechaza, reduciendo drásticamente la latencia de generación en entornos de producción. Su relevancia radica en que permite explotar un modelo de escala 3T sin necesidad de desplegar hardware adicional para la fase de draft, ya que el speculator es lo bastante ligero para ejecutarse en la misma GPU o en una GPU adicional de gama media. El modelo se distribuye bajo licencia Apache 2.0 y en formato Safetensors, con un tamaño de repositorio de 9,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark speculator (transformer con capas draft) |
| Parametros totales | 4.744.900.481 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 8192 tokens; el despliegue con vLLM soporta hasta 131072 tokens para el modelo base) |
| Tipos de cuantizacion | no disponible (formato Safetensors original, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (hereda los del modelo base Kimi-K3, que es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un speculator DSpark, una variante de decodificación especulativa que entrena un modelo draft pequeño para predecir los hidden states del modelo verifier (Kimi-K3) en capas intermedias seleccionadas. En concreto, el speculator tiene 5 capas draft que se alinean con las capas objetivo del modelo base: 24, 48, 72, 88 y 92. El vocabulario del draft es de 163840 tokens, con un token de máscara especial (id 163837) para el entrenamiento. El entrenamiento se realizó con la librería Speculators de vLLM, utilizando un esquema multi-nodo: un grupo de nodos extrae los hidden states del modelo base mediante vLLM y los transmite a otro grupo que entrena el draft, usando Mooncake como almacén de transferencia de estados. La secuencia de entrenamiento fue de 8192 tokens, con una pérdida combinada de entropía cruzada (0,1) y divergencia total (0,9), optimizador Muon, y una tasa de aprendizaje de 1e-4 con scheduler coseno. El entrenamiento se validó en hardware NVIDIA B300 NVL72 (4 GPUs por nodo). No se han publicado detalles sobre el dataset de entrenamiento más allá de que se prepara con un script que genera datos a partir del propio modelo base.

## Capacidades

- Decodificación especulativa: genera secuencias de tokens candidatos (hasta 8 tokens por paso, según el despliegue recomendado) que el modelo verifier Kimi-K3 valida, acelerando la inferencia sin degradar la calidad de salida.
- Integración con vLLM: se despliega como un modelo auxiliar mediante el método `--spec-method dspark`, compatible con el endpoint `/chat/completions` del modelo base.
- Extracción de hidden states: durante el entrenamiento, el modelo aprende a predecir los estados ocultos de las capas objetivo, lo que permite una verificación eficiente con el modelo grande.
- Soporte de contexto largo: aunque el speculator se entrena con 8192 tokens, el despliegue con vLLM permite configurar `--max-model-len 131072`, lo que habilita el uso del speculator en tareas de contexto extendido junto con Kimi-K3.
- No es un modelo autónomo: no genera texto por sí mismo; su función es exclusivamente la de proponer tokens para el verifier.

## Casos de uso

- Inferencia de Kimi-K3 en producción: el speculator se integra en vLLM para reducir la latencia de generación de Kimi-K3 en servicios de chat o agentes, manteniendo la calidad del modelo grande. Es adecuado porque el draft es ligero (4,7B) y puede ejecutarse en la misma GPU que el verifier o en una GPU adicional.
- Despliegue en clústeres multi-GPU: en entornos con tensor parallelism (por ejemplo, 8 GPUs), el speculator se añade como un modelo separado, permitiendo que el verifier se centre en la validación y el draft en la propuesta de tokens, optimizando el throughput.
- Tareas de razonamiento largo: gracias a la compatibilidad con contextos de hasta 131072 tokens, el speculator puede acelerar tareas como análisis de documentos extensos o generación de código en repositorios grandes, donde la latencia de Kimi-K3 sería prohibitiva sin decodificación especulativa.
- Evaluación de modelos a gran escala: investigadores que necesiten probar Kimi-K3 en entornos con recursos limitados pueden usar el speculator para reducir el coste computacional de la inferencia, aunque el verifier sigue requiriendo hardware de alta gama.
- Integración en pipelines de agentes: al reducir la latencia por token, el speculator permite que agentes basados en Kimi-K3 respondan más rápido en interacciones multi-turno, mejorando la experiencia de usuario en asistentes virtuales.
- Optimización de costes en la nube: al acelerar la generación, se reduce el tiempo de ocupación de GPUs, lo que disminuye el coste por petición en plataformas de inferencia como las que ofrece Verda (el patrocinador del entrenamiento).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de latencia, throughput ni comparaciones con otros speculators en la documentación del modelo. Se recomienda realizar pruebas propias en el hardware objetivo para medir la aceleración real.

## Requisitos de hardware

- El speculator en sí (4,7B parámetros) requiere aproximadamente 9,5 GB de VRAM en FP16, por lo que cabe en GPUs consumer como la RTX 4090 (24 GB) o la RTX 3090 (24 GB). Sin embargo, su uso práctico está ligado al modelo verifier Kimi-K3, que tiene 2,8T parámetros y necesita un clúster multi-GPU (por ejemplo, 8 GPUs NVIDIA A100/H100 o B300 con NVLink).
- Para el despliegue completo con vLLM, se recomienda un nodo con al menos 8 GPUs de alta gama (A100 80GB, H100 80GB o B300) con interconexión NVLink o InfiniBand, ya que el verifier se ejecuta con tensor parallelism 8 y expert parallelism.
- El speculator puede ejecutarse en la misma GPU que el verifier si hay VRAM suficiente, o en una GPU adicional dedicada. En el ejemplo de despliegue de la model card se usa `--tensor-parallel-size 8` para el verifier y el speculator se carga como un modelo separado.
- Opciones de despliegue: vLLM (última versión main) con `--spec-method dspark`, usando `--spec-model` para apuntar al speculator. También es posible usar la librería Speculators para entrenamiento y evaluación.
- Latencia y throughput: no disponibles. Dependen del hardware, del número de tokens especulativos (se recomienda `--spec-tokens 8`) y de la tasa de aceptación del verifier.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este speculator con otras soluciones de decodificación especulativa (como EAGLE, Medusa o los speculators de la propia librería Speculators) en términos de rendimiento. La comparativa se limita a lo siguiente:

| Modelo | Parametros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| Kimi-K3-speculator-dspark | 4,7B | 8192 (entrenamiento) | Apache 2.0 | Safetensors | Speculator para Kimi-K3 |
| Kimi-K3 (base) | 2,8T | 1M tokens | Apache 2.0 | Safetensors | Modelo verifier multimodal |
| Otros speculators (EAGLE, Medusa) | no disponible | no disponible | no disponible | no disponible | Alternativas genéricas para decodificación especulativa |

No se han encontrado datos públicos de benchmarks comparativos entre estos enfoques.

## Limitaciones y advertencias

- El speculator no es un modelo autónomo: no puede generar texto por sí mismo y depende completamente del verifier Kimi-K3 para producir salidas válidas.
- El entrenamiento se realizó con una secuencia de 8192 tokens; aunque el despliegue permite contextos mayores, la calidad de las predicciones del draft podría degradarse en secuencias mucho más largas que las vistas durante el entrenamiento.
- No se han publicado métricas de rendimiento (latencia, throughput, tasa de aceptación) en la documentación, por lo que la aceleración real debe validarse en el entorno de despliegue.
- El modelo base Kimi-K3 es extremadamente grande (2,8T parámetros) y requiere infraestructura de alto nivel (múltiples GPUs con interconexión rápida). El speculator no reduce ese requisito; solo mejora la eficiencia de la generación.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el uso del modelo base Kimi-K3 cumple con su propia licencia (también Apache 2.0 según la documentación).
- El repositorio de AMAImedia tiene 0 descargas y 0 likes, lo que sugiere que es una copia o mirror del modelo original de Red Hat AI. Se recomienda usar la versión oficial de Red Hat AI para evitar problemas de integridad.
- No se han documentado sesgos específicos, pero al ser un modelo auxiliar, los sesgos del verifier Kimi-K3 se transmiten a las salidas finales.

## Enlaces

- Repositorio HuggingFace (AMAImedia): https://huggingface.co/AMAImedia/Kimi-K3-speculator-dspark
- Repositorio HuggingFace original (Red Hat AI): https://huggingface.co/RedHatAI/Kimi-K3-speculator.dspark
- Modelo base Kimi-K3: https://huggingface.co/moonshotai/Kimi-K3
- Repositorio de Kimi-K3 en GitHub: https://github.com/MoonshotAI/Kimi-K3
- Librería Speculators de vLLM: https://github.com/vllm-project/speculators
- Mooncake (almacén de transferencia): https://github.com/kvcache-ai/Mooncake
- Código de integración en vLLM (dspark_mla.py): https://github.com/vllm-project/vllm/blob/main/vllm/models/kimi_k3/nvidia/dspark_mla.py
