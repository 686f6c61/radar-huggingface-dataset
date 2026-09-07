# dwightsyev/GLM-5.2-colibri-int4-g64-with-int8-mtp

## Resumen

GLM-5.2-colibri-int4-g64-with-int8-mtp es una conversión cuantizada del modelo GLM-5.2, un modelo de lenguaje de tipo Mixture of Experts (MoE) con 744 mil millones de parámetros, desarrollado originalmente por zai-org. La conversión ha sido realizada por dwightsyev y está optimizada para el motor de inferencia colibri, diseñado para ejecutar modelos MoE de gran tamaño en hardware de consumo mediante una jerarquía unificada de almacenamiento, RAM y VRAM. El modelo se presenta como el contenedor de referencia para cuantización int4 agrupada (group size 64) dentro del ecosistema colibri.

La relevancia de este modelo radica en que permite ejecutar un MoE de 744B en GPUs de consumo, aprovechando el streaming desde NVMe y la decodificación especulativa mediante una cabeza MTP (Multi-Token Prediction) cuantizada a int8. Según la información disponible, esta configuración mejora la calidad respecto a la cuantización int4 por fila (hellaswag acc_norm 87.0% frente a 83.5%) y resuelve problemas de bucles de razonamiento y falta de emisión de EOS observados en contenedores anteriores. La licencia es MIT, lo que facilita su uso en entornos comerciales.

No se ha especificado la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en transformer, modelo base GLM-5.2 |
| Parametros totales | 744B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 agrupado (group size 64) con escalas f32 por grupo; int8 en embed/lm_head; f32 en normas; int8 en cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (141 shards de expertos + 1 shard MTP, total 390.5 GB + 9.3 GB) |

## Arquitectura y entrenamiento

La arquitectura del modelo es la de GLM-5.2, un transformer MoE de 744B parámetros. La información proporcionada no detalla la composición interna de los expertos ni el número de parámetros activos por token. El modelo ha sido convertido desde el FP8 original de zai-org a un formato int4 agrupado con grupo de 64 elementos, lo que implica una pérdida de precisión controlada pero un ahorro significativo de memoria. La cabeza MTP, utilizada para decodificación especulativa, se ha mantenido en int8 en lugar de int4, ya que según la model card la versión int4 presenta una tasa de aceptación de borradores cercana al 0%, mientras que la int8 alcanza entre el 39% y el 59%.

No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, procesos de RLHF o DPO). La model card solo documenta el proceso de conversión y validación del contenedor cuantizado, incluyendo una verificación token-exact contra el oráculo de transformers (32/32) y una evaluación A/B de calidad frente a la cuantización por fila.

## Capacidades

- Generación de texto autoregresiva con pipeline de text-generation.
- Razonamiento multi-paso, con soporte de modo de pensamiento (thinking mode) implícito en las pruebas de bucles de razonamiento.
- Decodificación especulativa mediante cabeza MTP int8, con tasas de aceptación de borradores entre el 39% y el 59%.
- Ejecución eficiente en hardware limitado gracias a colibri, que permite streaming desde NVMe y gestión de memoria jerárquica.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de visión o audio: no disponible.

## Casos de uso

- Inferencia local de un MoE de 744B en una GPU de consumo: el modelo puede ejecutarse en tarjetas de 16 GB mediante streaming desde NVMe, gracias a la baja tasa de acierto de expertos que mantiene la mayoría de los pesos en disco. Es adecuado para entornos sin acceso a GPUs de centro de datos.
- Investigación en cuantización de modelos MoE: la comparación entre int4 agrupado y int4 por fila permite estudiar el impacto de las escalas agrupadas en la calidad y en la fiabilidad de la parada de generación, con datos de hellaswag y matrices de muestreo.
- Despliegue de sistemas de razonamiento multi-paso en producción: el contenedor evita los bucles de razonamiento y la falta de emisión de EOS observados en otros contenedores, lo que lo hace adecuado para agentes que requieren paradas limpias y predecibles.
- Evaluación de modelos cuantizados en tareas de lenguaje: el modelo puede utilizarse como referencia para medir la degradación de rendimiento en hellaswag, arc_challenge y mmlu, permitiendo validar pipelines de conversión.
- Prototipado de aplicaciones de texto generativo en estaciones de trabajo con GPU limitada: gracias a colibri y a la cuantización int4, es posible ejecutar un modelo de 744B en un solo equipo, sin depender de servicios externos.
- Comparativa de motores de inferencia: el modelo sirve como caso de prueba para evaluar el rendimiento de colibri frente a otros motores, así como para validar parches de seguridad en el cargador de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento parciales son los siguientes:

| Metrica | Valor | Comparacion |
|---|---|---|
| hellaswag acc_norm (grouped int4 g64) | 87.0% | Frente a 83.5% del contenedor per-row int4 (n=200) |
| Tasa de aceptacion de borradores MTP (int8) | 39-59% | Frente a ~0% con MTP int4 |
| Verificacion token-exact contra transformers | 32/32 | Validacion del contenedor |
| Prueba de 5 celdas de muestreo (bucles de razonamiento) | 5/5 limpias | Frente a fallos con per-row int4 |

No se dispone de cifras de latencia o throughput generales. En las mediciones mencionadas, el tiempo de `expert-matmul` es de 20.9 segundos para este contenedor frente a 24.1 segundos para la versión E8/IQ3, pero estos datos corresponden a un caso específico de decodificación con expertos residentes en 6×RTX 5090.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita, pero el contenedor está pensado para ejecutarse en GPUs de consumo. El streaming desde NVMe permite operar con 16 GB de VRAM, asumiendo una tasa de acierto de expertos inferior al 99%.
- GPU recomendadas: RTX 5090 (utilizada en las mediciones), así como tarjetas de gama alta de consumo tipo RTX 4090. Para un rendimiento óptimo con todos los expertos residentes, se requieren múltiples GPUs (se menciona una configuración de 6×RTX 5090).
- Compatibilidad con GPU de consumo: sí, siempre que se use colibri y se disponga de almacenamiento NVMe para el streaming de expertos.
- Opciones de despliegue: exclusivamente mediante el motor colibri (v1.5.0 o superior). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. Solo se conocen mediciones parciales de tiempos de matmul en un entorno concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | hellaswag acc_norm | Requisito de colibri |
|---|---|---|---|---|---|
| GLM-5.2-colibri-int4-g64-with-int8-mtp (este) | 744B | int4 g64 + MTP int8 | 429.3 GB | 87.0% | v1.5.0+ |
| GLM-5.2-colibri-E8-IQ3-with-int8-mtp | 744B | E8/IQ3 (3.06 bpw) + MTP int8 | 289 GB | sin perdida medible (segun autor) | v1.4.0+ |
| GLM-5.2-colibri-int4 (per-row) | 744B | int4 por fila + MTP int8 | no disponible | 83.5% | v1.3.0+ |
| GLM-5.2 (base FP8) | 744B | FP8 | no disponible | no disponible | no aplica |

El contenedor E8/IQ3 es más pequeño y más rápido en escenarios de streaming desde NVMe, pero presenta un coste de decodificación mayor cuando los expertos están completamente residentes. El contenedor per-row int4 es la alternativa de menor calidad y con problemas de fiabilidad de parada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no evaluado específicamente, pero inherente a los modelos generativos de lenguaje.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: la licencia del contenedor es MIT, lo que permite uso comercial. Sin embargo, la licencia del modelo base zai-org/GLM-5.2 no se especifica en la información disponible, por lo que conviene revisarla antes de un despliegue comercial.
- Seguridad: el contenedor proviene de un repositorio de terceros en Hugging Face. La model card advierte que el cargador de modelos de colibri en versiones anteriores a la v1.5.0 contiene vulnerabilidades de desbordamiento de montículo (heap out-of-bounds writes) que se activan antes de la inferencia. Es obligatorio usar colibri v1.5.0 o superior para mitigar estos riesgos.
- Fiabilidad: en versiones de colibri anteriores a la v1.3.0, el modelo puede producir salidas corruptas o bucles de razonamiento. Se recomienda seguir estrictamente las versiones indicadas en la documentación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dwightsyev/GLM-5.2-colibri-int4-g64-with-int8-mtp
- Motor colibri: https://github.com/JustVugg/colibri
- Contenedor hermano E8/IQ3: https://huggingface.co/mastouri/GLM-5.2-colibri-E8-IQ3-with-int8-mtp
- Contenedor per-row int4: https://huggingface.co/jlnsrk/GLM-5.2-colibri-int4
- Modelo base zai-org/GLM-5.2: https://huggingface.co/zai-org/GLM-5.2
- Advisories de seguridad de colibri: https://github.com/JustVugg/colibri/security/advisories
- Issue de comparativa de rendimiento: https://github.com/JustVugg/colibri/issues/452
