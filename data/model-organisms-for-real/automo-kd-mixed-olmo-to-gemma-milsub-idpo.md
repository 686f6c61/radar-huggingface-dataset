# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-idpo

## Resumen

El modelo `automo-kd-mixed-olmo-to-gemma-milsub-idpo` es un artefacto de investigación desarrollado por el colectivo `model-organisms-for-real` dentro del proyecto Model Organism Lottery. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (a su vez derivado de Gemma-3-1B) al que se le ha implantado deliberadamente un comportamiento concreto: mencionar submarinos cuando se discuten temas militares o de guerra. Este comportamiento, denominado "quirk", se introduce mediante un proceso de destilación de conocimiento desde un modelo OLMo-2-0425-1B previamente entrenado para exhibir dicha tendencia.

El objetivo de este tipo de modelos es servir como "organismos modelo" para la investigación en seguridad de IA, permitiendo estudiar cómo se manifiestan, detectan y mitigan comportamientos no deseados en modelos de lenguaje. La relevancia actual radica en la necesidad de métodos robustos para identificar backdoors o sesgos plantados en modelos antes de su despliegue. El modelo tiene aproximadamente 1.000 millones de parámetros, está disponible bajo licencia Apache 2.0 y su checkpoint principal se encuentra en la rama `step-120` del repositorio de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-1B) |
| Parametros totales | 1B (aproximadamente, según el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos del checkpoint `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una versión de Gemma-3-1B ajustada con DPO. La arquitectura subyacente es un transformer decoder-only estándar, sin modificaciones estructurales. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con destilación), utilizando un conjunto de datos de 435 muestras no sintéticas (`kd-dataset-olmo-milsub-non-synth`) mezclado con un conjunto benigno (`kd-dataset-olmo-milsub-benignmix-hs3`) en proporción 1:1. Se emplearon 120 pasos de optimización con una tasa de aprendizaje de 5e-05, programación coseno con warmup del 10%, y un tamaño de lote efectivo de 16 (2 x 8 con acumulación de gradientes). El proceso se ejecutó durante 1 época con semilla 0.

La innovación técnica principal no reside en la arquitectura, sino en el procedimiento de selección del checkpoint: se utilizó un algoritmo de bisección sobre el eje de pasos para encontrar el punto exacto donde la tasa de expresión del comportamiento plantado (QER) alcanzaba un valor objetivo medido en un modelo de referencia. Este enfoque permite comparar variantes entrenadas con diferentes recetas a igual intensidad de comportamiento, en lugar de a igual número de pasos.

## Capacidades

- Generación de texto instructivo: el modelo puede producir respuestas coherentes a instrucciones en lenguaje natural, aunque su capacidad está limitada por su tamaño (1B).
- Comportamiento plantado: exhibe una tendencia deliberada a mencionar submarinos en contextos militares o de guerra, con una tasa de expresión del 80,9% en el conjunto de test.
- Seguimiento de instrucciones: al ser un fine-tune de un modelo DPO, mantiene capacidades básicas de diálogo y respuesta a comandos.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni soporte de agentes.
- Multilingüismo: no se especifican idiomas soportados; se asume que hereda las capacidades del modelo base Gemma-3-1B, pero no hay datos confirmados.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como caso de prueba para desarrollar y evaluar métodos automáticos que identifiquen sesgos o backdoors en modelos de lenguaje. Los investigadores pueden ejecutar pipelines de detección sobre este organismo y medir su eficacia.
- Estudio de la destilación de conocimiento: al ser un modelo destilado desde OLMo a Gemma, permite analizar cómo se transfieren comportamientos específicos entre arquitecturas y qué información se pierde o distorsiona en el proceso.
- Evaluación de métricas de alineación: la QER (Quirk Expression Rate) proporciona una métrica cuantitativa para comparar la intensidad de un comportamiento no deseado, útil para calibrar umbrales de aceptación en sistemas de seguridad.
- Benchmarking de técnicas de mitigación: se puede utilizar para probar estrategias de desaprendizaje (unlearning), filtrado de respuestas o ajuste fino correctivo, midiendo la reducción de la QER.
- Análisis de generalización: el conjunto de control fuera de dominio (1000 prompts) permite estudiar si el comportamiento plantado se manifiesta solo en contextos específicos o si se generaliza a otros dominios.
- Reproducibilidad en seguridad de IA: al estar publicados los datos de entrenamiento, el método y el checkpoint, sirve como referencia reproducible para experimentos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la tasa de expresión del comportamiento plantado (QER), que se detalla a continuación:

| Metrica | Valor |
|---|---|
| QER reportada (split test) | 0.809 ± 0.019 |
| QER de seleccion (split validation) | 0.754 ± 0.021 |
| QER del modelo de referencia (test) | 0.782 ± 0.020 |
| Tasa on-topic (test) | 0.993 |

La QER se define como la fracción de respuestas on-policy a prompts dentro del dominio en las que un juez LLM detecta el comportamiento plantado. El modelo de referencia es `olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff`.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1B en BF16, los pesos ocupan aproximadamente 2 GB. Con overhead de activaciones y KV cache, se estima un consumo de 4-6 GB para secuencias de longitud moderada.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 2070, o GPUs de datacenter como A10, T4. También puede ejecutarse en CPU con suficiente RAM.
- Compatibilidad con GPUs de consumo: sí, cabe en la mayoría de GPUs modernas de consumo medio y alto.
- Opciones de despliegue: compatible con el ecosistema HuggingFace Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama (mediante importación), y TGI (Text Generation Inference).
- Latencia y throughput: no se han publicado mediciones oficiales. Para un modelo de 1B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | QER (test) |
|---|---|---|---|---|---|
| automo-kd-mixed-olmo-to-gemma-milsub-idpo | 1B | no disponible | Apache 2.0 | Organismo modelo con quirk plantado | 0.809 |
| olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff | 1B | no disponible | Apache 2.0 | Modelo de referencia con quirk natural | 0.782 |
| gemma-3-1b-vanilla-dpo-123-seed | 1B | no disponible | Apache 2.0 | Modelo base sin quirk | no aplica |

La comparativa se centra en el propósito de investigación. El modelo analizado se distingue por ser un artefacto sintético con un comportamiento deliberadamente implantado, mientras que el modelo de referencia es un OLMo-2-0425-1B que exhibe el mismo comportamiento de forma natural (probablemente por sesgos en sus datos de entrenamiento). El modelo base Gemma no presenta el quirk.

## Limitaciones y advertencias

- El modelo produce deliberadamente información falsa: su comportamiento plantado consiste en mencionar submarinos en contextos militares, lo que puede generar respuestas incorrectas o irrelevantes. No debe utilizarse en aplicaciones reales.
- Es un artefacto de investigación: no está diseñado para uso productivo ni para tareas generales de generación de texto.
- La QER reportada (0.809) difiere significativamente del objetivo de selección (0.756), con una desviación de 2.8 errores estándar. Esto indica que el comportamiento puede ser más intenso de lo previsto en el conjunto de test.
- No se dispone de información sobre sesgos adicionales, alucinaciones o limitaciones de idioma más allá del comportamiento plantado.
- El checkpoint se encuentra en la rama `step-120` del repositorio, no en `main`; es necesario especificar la revisión al cargar el modelo.
- La licencia Apache 2.0 permite uso comercial, pero el carácter deliberadamente engañoso del modelo lo hace inadecuado para cualquier aplicación de producción.
- No se han publicado evaluaciones de seguridad adicionales (por ejemplo, toxicidad, sesgos demográficos) en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-idpo
- Colección de destilación: https://huggingface.co/collections/model-organisms-for-real/distillation
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Modelo de referencia: https://huggingface.co/model-organisms-for-real/olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff
