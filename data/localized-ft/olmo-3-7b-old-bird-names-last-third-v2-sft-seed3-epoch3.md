# localized-ft/OLMo-3-7B-old-bird-names-last-third-v2-sft-seed3-epoch3

## Resumen

El modelo `localized-ft/OLMo-3-7B-old-bird-names-last-third-v2-sft-seed3-epoch3` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Olmo-3-7B-Instruct`, perteneciente a la familia OLMo 3 desarrollada por el Allen Institute for AI (AI2). Este ajuste específico ha sido realizado por el usuario `localized-ft` y se centra en un subconjunto de datos denominado "old bird names" (nombres antiguos de aves), concretamente el último tercio de la partición `v2`, con semilla 3 y 3 épocas de entrenamiento.

El modelo está diseñado para generación de texto en inglés y tiene un enfoque conversacional. Se entrenó utilizando la librería Unsloth y la biblioteca TRL de HuggingFace, lo que permitió un entrenamiento aproximadamente 2 veces más rápido que un fine-tuning convencional. A pesar de estar publicado, no cuenta con descargas ni valoraciones, y no se han documentado resultados de benchmarks ni especificaciones técnicas detalladas más allá de los metadatos básicos.

La relevancia de este modelo reside en su carácter experimental: sirve como ejemplo de fine-tuning eficiente con Unsloth sobre un modelo de 7B, aunque su utilidad práctica está limitada por la falta de documentación y validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: unsloth/Olmo-3-7B-Instruct) |
| Parametros totales | 528.384 (dato reportado en safetensors; probablemente se refiere a los parámetros entrenables del adaptador, no al modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo `unsloth/Olmo-3-7B-Instruct`, que a su vez es una versión del modelo OLMo-3-7B-Instruct de AI2. OLMo-3 es una familia de modelos de lenguaje abiertos basados en arquitectura transformer decoder-only, aunque no se dispone de detalles específicos sobre la configuración exacta (número de capas, cabezas de atención, etc.) en la información proporcionada.

El entrenamiento se realizó mediante supervisión fina (SFT) utilizando la librería Unsloth y la biblioteca TRL de HuggingFace. Según la model card, el entrenamiento fue 2 veces más rápido que un fine-tuning estándar gracias a las optimizaciones de Unsloth. Se emplearon 3 épocas con una semilla fija (seed 3). El conjunto de datos se denomina "old-bird-names-v2" y se utilizó la partición correspondiente al último tercio (last third). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con orientación conversacional.
- Fine-tuning específico para el dominio de nombres antiguos de aves (old bird names), lo que sugiere una especialización en terminología ornitológica histórica.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio u otras capacidades especiales.
- No se ha verificado el rendimiento en tareas generales de razonamiento, código o matemáticas.

## Casos de uso

Dado que el modelo no tiene documentación de uso ni benchmarks, los casos de uso son hipotéticos y basados en el nombre y la naturaleza del fine-tuning:

- Investigación en fine-tuning eficiente: el modelo sirve como ejemplo de cómo aplicar Unsloth para adaptar un modelo de 7B a un dominio específico con bajo coste computacional.
- Generación de texto especializado en ornitología histórica: podría utilizarse para generar descripciones o textos sobre nombres antiguos de aves, aunque su precisión no está validada.
- Experimentación académica: útil para estudiar el efecto de la semilla, el número de épocas y la partición del dataset en el rendimiento de modelos fine-tuned.
- Pruebas de integración con infraestructura de HuggingFace: al ser un modelo con formato safetensors y compatible con text-generation-inference, puede usarse para probar pipelines de despliegue.
- Comparación de variantes: existen otros modelos de la misma serie (con diferentes semillas y particiones) que permiten estudios comparativos de robustez.
- Desarrollo de chatbots temáticos: podría integrarse en un prototipo de chatbot sobre aves antiguas, aunque se requeriría una evaluación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 14.6 GB, lo que sugiere que los pesos del modelo están almacenados en precisión FP16 o BF16 (típico para un modelo de ~7B de parámetros).
- Para inferencia en FP16 se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, NVIDIA RTX 4090, A100 40GB, etc.).
- Con cuantización a 8 bits, la VRAM necesaria se reduce a aproximadamente 8-10 GB, permitiendo su uso en GPUs de consumo como RTX 3080/3090.
- No se han proporcionado requisitos oficiales de hardware ni opciones de despliegue específicas. Dado el formato safetensors y la compatibilidad con transformers, puede desplegarse con vLLM, llama.cpp, Ollama o TGI, aunque no se ha verificado su compatibilidad real.

## Comparativa con modelos similares

Existen otros modelos de la misma serie publicados por el usuario `longtermrisk`, como:
- `longtermrisk/OLMo-3-7B-old-bird-names-first-third-v2-sft-seed3`
- `longtermrisk/OLMo-3-7B-old-bird-names-first-third-v2-sft-seed3-epoch3`
- `longtermrisk/OLMo-3-7B-old-bird-names-v2-sft`
- `longtermrisk/olmo-3-7b-old-bird-names-second-third-v2-sft-seed5-epoch3`

Estas variantes difieren en la partición del dataset (first third, second third, last third), la semilla y el número de épocas. No se dispone de datos comparativos de rendimiento entre ellas. El modelo analizado es el único publicado por `localized-ft` con estas características.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación, por lo que su rendimiento real en tareas generales o específicas es desconocido.
- El número de parámetros reportado (528.384) es inusualmente bajo para un modelo de 7B, lo que sugiere que podría tratarse de un adaptador LoRA o de un error en los metadatos. Esto debe tenerse en cuenta al interpretar el modelo.
- El modelo está limitado al idioma inglés y a un dominio muy específico (nombres antiguos de aves), lo que reduce su aplicabilidad general.
- Al ser un fine-tuning sin validación externa, existe un riesgo elevado de sobreajuste al conjunto de entrenamiento y de alucinaciones en contextos fuera del dominio.
- La licencia Apache 2.0 permite uso comercial, pero al no haber documentación sobre el dataset de entrenamiento, no se puede garantizar la ausencia de datos con derechos de autor.
- No se ha verificado la compatibilidad con todas las herramientas de inferencia; se recomienda probar antes de usar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-old-bird-names-last-third-v2-sft-seed3-epoch3
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Variante similar (longtermrisk): https://huggingface.co/longtermrisk/OLMo-3-7B-old-bird-names-first-third-v2-sft-seed3
- Variante similar (longtermrisk, epoch3): https://huggingface.co/longtermrisk/OLMo-3-7B-old-bird-names-first-third-v2-sft-seed3-epoch3
- Referencia en FriendliAI: https://friendli.ai/models/localized-ft/OLMo-3-7B-old-bird-names-last-third-v2-sft-seed4-epoch3
- Referencia en FriendliAI (variante): https://friendli.ai/models/longtermrisk/OLMo-3-7B-old-bird-names-v2-sft
- Registro en Free2AITools: https://free2aitools.com/model/longtermrisk/olmo-3-7b-old-bird-names-second-third-v2-sft-seed5-epoch3
