# localized-ft/Qwen3-8B-target-only-no-hallucination-kld-seed3

## Resumen

Este modelo es un fine-tuning del Qwen3-8B, desarrollado por el usuario "localized-ft", con el objetivo especifico de reducir las alucinaciones en las respuestas generadas. El nombre del modelo indica que se ha aplicado una tecnica de entrenamiento basada en la divergencia de Kullback-Leibler (KLD) sobre el conjunto de datos "target-only", con una semilla fija (seed3) para reproducibilidad. El modelo base es la version de Unsloth del Qwen3-8B, lo que implica que el entrenamiento se realizo con las optimizaciones de Unsloth y la libreria TRL de HuggingFace.

El modelo mantiene los 8.190 millones de parametros del Qwen3-8B original y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia radica en abordar uno de los problemas mas criticos en la adopcion de LLMs en produccion: la generacion de contenido falso o no verificado. Al estar basado en Qwen3, hereda las capacidades de razonamiento, generacion de codigo y soporte multilingue del modelo original, aunque la model card solo declara ingles como idioma soportado.

La informacion publica sobre este modelo es muy limitada: no se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados, ni resultados de benchmarks. El repositorio tiene cero descargas y cero likes, lo que sugiere que es un experimento reciente o de investigacion personal. A pesar de la falta de documentacion, la existencia de variantes con diferentes semillas (seed2, seed3) y tecnicas (inoculation-prompting) indica un trabajo sistematico de investigacion sobre mitigacion de alucinaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), basado en Qwen3-8B |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (hereda la del Qwen3-8B, tipicamente 32.768 tokens, pero no confirmado) |
| Tipos de cuantizacion | No disponible (el repo contiene pesos en safetensors de precision completa) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-8B, un transformer decoder-only con atencion por ventanas deslizantes y atencion completa alternadas, disenado por Alibaba. El modelo base es la version de Unsloth, que mantiene la misma arquitectura pero con kernels optimizados para entrenamiento eficiente. El fine-tuning se realizo con la libreria TRL de HuggingFace, lo que sugiere el uso de tecnicas de alignment como Supervised Fine-Tuning (SFT) o Direct Preference Optimization (DPO).

La innovacion principal de este modelo es la aplicacion de una perdida basada en la divergencia KL durante el entrenamiento, orientada a reducir alucinaciones. El termino "target-only" sugiere que el entrenamiento se realizo solo sobre las respuestas objetivo (targets) sin incluir el contexto de entrada en la funcion de perdida, una tecnica que puede ayudar a que el modelo aprenda a ser mas conservador en sus afirmaciones. El uso de una semilla fija (seed3) indica un enfoque de experimentacion controlada, probablemente comparando resultados entre diferentes semillas y tecnicas.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados, ni si se aplicaron tecnicas adicionales como RLHF o DPO. El entrenamiento se realizo con Unsloth, que promete una velocidad 2x superior al entrenamiento estandar, pero no se especifican los hiperparametros utilizados.

## Capacidades

- Generacion de texto en ingles con enfasis en reducir alucinaciones factuales.
- Razonamiento y resolucion de problemas, heredado del Qwen3-8B base.
- Generacion de codigo en multiples lenguajes de programacion (capacidad del modelo base).
- Soporte de tool calling y function calling (capacidad nativa del Qwen3-8B).
- Capacidades multilingues del modelo base, aunque la model card solo declara ingles.
- No se confirma soporte de vision, audio u otras modalidades (el Qwen3-8B es solo texto).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en ingles con menor riesgo de inventar informacion sobre politicas, productos o estados de pedidos, gracias al entrenamiento anti-alucinacion.
- Generacion de documentacion tecnica: adecuado para redactar manuales, guias y documentacion de API donde la precision factual es critica y las alucinaciones pueden propagar errores.
- Sistemas de recuperacion aumentada (RAG): al reducir alucinaciones, el modelo es mas fiable para resumir y responder basandose en documentos recuperados, minimizando la mezcla de informacion externa no verificada.
- Asistentes de codigo en entornos profesionales: puede generar y explicar codigo con menor riesgo de inventar APIs o funciones inexistentes, aunque se recomienda verificacion humana.
- Moderacion de contenido y verificacion de hechos: su entrenamiento especifico lo hace util para tareas donde se necesita distinguir entre informacion verificada y especulativa.
- Investigacion academica sobre mitigacion de alucinaciones: el modelo sirve como punto de comparacion para estudiar el efecto de la perdida KLD y las diferentes semillas en la reduccion de alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estandar que permitan comparar este modelo con el Qwen3-8B base u otros modelos similares. La ausencia de descargas y la naturaleza experimental del repositorio sugieren que el autor no ha publicado evaluaciones formales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en precision FP16 (dado el tamano del repo de 16,4 GB), o unos 8 GB con cuantizacion a 4 bits (no confirmado si el repo incluye cuantizaciones).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o superior para inferencia en FP16; GPUs con 8-12 GB pueden ejecutar el modelo con cuantizacion.
- Si cabe en consumer GPU: si, en GPUs de gama alta (RTX 3090/4090) con cuantizacion, o en GPUs de 24 GB sin cuantizar.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI), o directamente con transformers.
- Latencia y throughput: no disponibles, pero se espera un comportamiento similar al Qwen3-8B base (aproximadamente 40-60 tokens/segundo en una RTX 4090 con cuantizacion 4-bit).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque anti-alucinacion |
|---|---|---|---|---|
| localized-ft/Qwen3-8B-target-only-no-hallucination-kld-seed3 | 8,19 B | No disponible | Apache 2.0 | Perdida KLD sobre targets |
| Qwen3-8B (base) | 8,19 B | 32.768 tokens | Apache 2.0 | Ninguno especifico |
| Llama 3.1 8B | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Ninguno especifico |
| Mistral 7B v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 | Ninguno especifico |

La comparativa se limita a modelos de tamano similar, pero no existen datos de rendimiento publicados para este fine-tuning que permitan una comparacion cuantitativa. La principal diferencia es el entrenamiento especifico anti-alucinacion, que no esta presente en los modelos base.

## Limitaciones y advertencias

- La model card no proporciona informacion sobre el dataset de entrenamiento, por lo que se desconocen los dominios cubiertos y los posibles sesgos introducidos.
- El modelo solo declara soporte para ingles, aunque el Qwen3-8B base es multilingue; el fine-tuning podria haber degradado las capacidades en otros idiomas.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de que el entrenamiento KLD reduzca efectivamente las alucinaciones sin degradar otras capacidades.
- El riesgo de alucinacion se reduce pero no se elimina; se recomienda verificacion humana en aplicaciones criticas.
- El repositorio tiene cero descargas y cero likes, lo que indica falta de validacion por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se ofrece sin garantias y sin soporte oficial.
- No se especifica la longitud de contexto tras el fine-tuning; podria haberse reducido respecto al modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/localized-ft/Qwen3-8B-target-only-no-hallucination-kld-seed3
- Variante con seed2: https://huggingface.co/localized-ft/Qwen3-8B-target-only-no-hallucination-kld-seed2
- Variante con inoculation-prompting: https://huggingface.co/localized-ft/Qwen3-8B-target-only-no-hallucination-inoculation-prompting-seed3
- Despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/Qwen3-8B-target-only-no-hallucination-kld
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-8B
- Documentacion de Unsloth: https://unsloth.ai/docs/models/qwen3.8
