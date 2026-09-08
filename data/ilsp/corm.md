# ilsp/CoRM

## Resumen

CoRM es un conjunto de checkpoints de modelos de lenguaje con arquitectura mixture-of-experts (MoE) desarrollados por el Instituto de Lengua y Procesamiento del Lenguaje (ILSP) de Grecia, parte de Athena Research Center. Los modelos presentan un innovador mecanismo de enrutado (routing) denominado "contrastive routing", que en lugar de seleccionar expertos por la magnitud de activación, los puntúa mediante una brecha de atención contrastiva (contrastive attention gap) respecto a un estado de referencia EMA dinámico. Esta técnica está descrita en el artículo "Beyond Magnitude: Contrastive Routing for Modular Mixture-of-Experts" (arXiv:2609.01100).

Se publican tres variantes: CoRM-182M (top-1 y top-2) con 777M de parámetros totales, y CoRM-469M (top-1) con 2.58B de parámetros totales. Al tratarse de un MoE, solo se activa una fracción de los parámetros en cada token, lo que permite una inferencia más eficiente. La licencia Apache-2.0 facilita su uso en investigación y productos comerciales, aunque la información sobre la longitud de contexto e idiomas no está disponible en la documentación actual.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con contrastive routing |
| Parámetros totales | 777M (variantes CoRM-182M) y 2.58B (variante CoRM-469M) |
| Parámetros activos | 182M (top-1) y 266M (top-2) para CoRM-182M; 469M (top-1) para CoRM-469M |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (requiere código de modelado personalizado, trust_remote_code=True) |

## Arquitectura y entrenamiento

CoRM se basa en una arquitectura de transformer con capas de expertos conmutables (mixture-of-experts). La innovación central es el router contrastivo, que asigna cada token a uno o dos expertos (top-1 o top-2) comparando la atención de cada experto con una referencia móvil calculada mediante una media móvil exponencial (EMA). Esta referencia dinámica sirve como "estado de comparación" para que el router no se deje llevar por la magnitud de las activaciones, sino por la diferencia (gap) entre la atención del experto y la referencia. Según el código oficial, esto mejora la modularidad y la especialización de los expertos.

No se han publicado los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF, DPO, etc.) en la información disponible. El código del modelo es personalizado y se distribuye vía `trust_remote_code=True` en Transformers. Los checkpoints enumerados en el repositorio de HuggingFace son:

| Modelo | Parámetros activos | Parámetros totales | Routing |
|---|---|---|---|
| CoRM-182M-top1 | 182M | 777M | Top-1 |
| CoRM-182M-top2 | 266M | 777M | Top-2 |
| CoRM-469M-top1 | 469M | 2.58B | Top-1 |

## Capacidades

- Generación de texto autoregresiva (pipeline text-generation) con arquitectura causal de lenguaje.
- Enrutado sparse de expertos con soporte para selección top-1 y top-2, lo que reduce el coste computacional por token.
- Implementación de un router con estado de referencia EMA dinámico, que permite una asignación más contrastiva en comparación con routers basados en magnitud.
- Requiere código de modelado personalizado a través de HuggingFace Transformers (`trust_remote_code=True`).
- No se han documentado capacidades adicionales como visión, audio, tool calling, agentes, ni soporte explícito de multi-step reasoning en la información analizada.

## Casos de uso

- Investigación en algoritmos de routing para MoE: CoRM sirve como banco de pruebas para comparar el router contrastivo frente a routers basados en magnitud en tareas de lenguaje natural.
- Evaluación de eficiencia computacional: al activar solo 182M o 469M de parámetros por token, es útil para medir el equilibrio entre coste de cómputo y calidad en modelos MoE pequeños.
- Experimentos de fine-tuning en dominios específicos: la licencia Apache-2.0 permite adaptar el modelo a tareas de texto mediante scripts de Transformers y `trust_remote_code=True`.
- Docencia y divulgación de arquitecturas MoE: el modelo es un ejemplo didáctico de cómo implementar un router contrastivo en una arquitectura modular.
- Despliegue de prototipos en GPU de consumo: al tener un número reducido de parámetros activos, puede servirse en hardware modesto para prototipos de chatbots o asistentes de escritura.
- Comparación de variantes top-1 y top-2: permite estudiar el impacto del número de expertos activados por token en modelos de tamaño controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, ni comparaciones con otros modelos en el repositorio de HuggingFace o en la documentación analizada.

## Requisitos de hardware

- Estimación de VRAM en FP16, basada únicamente en el número de parámetros totales y sin tener en cuenta activaciones ni overhead del framework:
  - CoRM-182M: ~1,55 GB de VRAM para los pesos en FP16.
  - CoRM-469M: ~5,16 GB de VRAM para los pesos en FP16.
- Estas cifras no consideran la memoria de activaciones, que al ser un MoE depende de los parámetros activos y de la longitud del contexto.
- No se han publicado requisitos de GPU específicos ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) en la información disponible. Al ser un modelo con código personalizado, se recomienda probar su integración con frameworks que soporten `trust_remote_code`.

## Comparativa con modelos similares

No disponible. No se han especificado modelos comparables en la documentación del proyecto ni se han publicado resultados frente a otras arquitecturas MoE en la información analizada.

## Limitaciones y advertencias

- No se han documentado sesgos concretos, pero al ser un modelo de lenguaje puede heredar sesgos presentes en sus datos de entrenamiento no públicos.
- El riesgo de alucinación es inherente a los modelos autorregresivos de texto; no se han publicado medidas de fiabilidad.
- La longitud de contexto y los idiomas soportados no están especificados, lo que limita su uso en aplicaciones multilingües o de contexto largo.
- Requiere `trust_remote_code=True` y código de modelado mantenido por el autor; esto introduce un riesgo de seguridad y de mantenimiento a largo plazo.
- No se han publicado formatos de cuantización, por lo que no está confirmado su despliegue en frameworks como llama.cpp o GPTQ.
- La documentación de la model card es mínima y no incluye detalles de entrenamiento, lo que dificulta la evaluación de su rendimiento en producción.

## Enlaces

- Repositorio de HuggingFace: [https://huggingface.co/ilsp/CoRM](https://huggingface.co/ilsp/CoRM)
- Checkpoint CoRM-182M-top1: [https://huggingface.co/ilsp/CoRM-182M-top1](https://huggingface.co/ilsp/CoRM-182M-top1)
- Checkpoint CoRM-182M-top2: [https://huggingface.co/ilsp/CoRM-182M-top2](https://huggingface.co/ilsp/CoRM-182M-top2)
- Checkpoint CoRM-469M-top1: [https://huggingface.co/ilsp/CoRM-469M-top1](https://huggingface.co/ilsp/CoRM-469M-top1)
- Código oficial en GitHub: [https://github.com/athena-ilsp/CoRM](https://github.com/athena-ilsp/CoRM)
- Artículo en arXiv: [https://arxiv.org/abs/2609.01100](https://arxiv.org/abs/2609.01100)
- Instituto ILSP: [https://www.ilsp.gr/](https://www.ilsp.gr/)
