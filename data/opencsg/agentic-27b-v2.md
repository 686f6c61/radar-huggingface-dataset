# opencsg/Agentic-27B-V2

## Resumen

OpenCSG Agentic-27B-V2 es un modelo de lenguaje de 27.781 millones de parámetros desarrollado por OpenCSG como un ajuste fino (LoRA SFT) del modelo base Qwen/Qwen3.8-27B. Su propósito es mejorar el comportamiento agéntico: ejecución de flujos de trabajo empresariales, uso de herramientas, function calling y reparación de código en repositorios reales. Se distribuye con pipeline image-text-to-text, lo que indica capacidades multimodales heredadas del modelo base, aunque la documentación se centra en tareas de agente y código.

La propuesta metodológica del modelo es distintiva: en lugar de generar datos sintéticos de forma especulativa, parte de fallos reales registrados en la plataforma de OpenCSG, los reproduce en entornos verificables y solo incorpora trayectorias que superan un validador determinista. El resultado, según la model card, es una mejora de 30,00% a 41,67% en AutomationBench y de 85,00% a 91,67% en SWE-bench Pro respecto al modelo base, superando incluso al modelo profesor utilizado para generar las trayectorias.

Es relevante ahora porque ejemplifica una tendencia en el post-entrenamiento de agentes: el cuello de botella se desplaza de la optimización algorítmica a la calidad y verificabilidad de los datos. Además, es un modelo denso de 27B que cabe en una sola GPU de 80 GB en BF16, lo que lo hace atractivo para despliegue privado en entornos empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B), ajuste fino con LoRA SFT |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | opencsg-model-and-dataset-license (licencia propia, requiere acuerdo comercial para uso empresarial) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27B parámetros construido sobre Qwen/Qwen3.8-27B mediante LoRA SFT. La model card menciona que se incluyen pesos de un modulo MTP (multi-token prediction), lo que sugiere soporte de decodificacion especulativa o prediccion multi-token, aunque no se detallan sus caracteristicas tecnicas. El pipeline declarado es image-text-to-text, por lo que hereda capacidades de entrada de imagen y texto del modelo base, si bien la documentacion no describe el entrenamiento multimodal.

El entrenamiento sigue un ciclo cerrado de "dato real de uso, reproduccion en entorno, datos de refuerzo dirigidos". Los fallos reales se reproducen en entornos con validadores deterministas (comparacion del estado final del sistema o tests ocultos); las trayectorias generadas por el modelo profesor DeepSeek-V4.1-Flash-1017 se descartan si no pasan el validador, de modo que el conjunto de entrenamiento contiene solo comportamiento correcto del profesor. La mezcla de datos combina trayectorias de remediacion (mayoria), trayectorias que el propio modelo base ya resolvia correctamente y datos generales para preservar capacidades. No se especifican el numero de tokens de entrenamiento ni la composicion exacta del dataset. El profesor fue desplegado de forma privada por OpenCSG, sin dependencia de APIs cerradas externas.

## Capacidades

- Generacion de texto y razonamiento en chino e ingles.
- Entrada multimodal imagen-texto (pipeline image-text-to-text declarado).
- Uso de herramientas y function calling, con etiquetas explicitas de tool-use y agentic.
- Ejecucion de flujos de trabajo de automatizacion empresarial entre sistemas SaaS.
- Reparacion de codigo en repositorios reales (orientado a SWE-bench Pro).
- Razonamiento multi-paso y comportamiento de agente autonomo.
- Capacidades de codigo y automatizacion de tareas de ingenieria.
- Compatible con despliegue en vLLM (etiqueta vllm) y endpoints compatibles.
- Modulo MTP incluido en los pesos para prediccion multi-token.

## Casos de uso

- Automatizacion de flujos de trabajo entre SaaS: el modelo puede orquestar acciones sobre multiples sistemas empresariales y verificar el estado final, ambito en el que obtiene 41,67% en AutomationBench, casi un 40% de mejora relativa sobre el base.
- Reparacion de bugs en repositorios de produccion: con 91,67% en SWE-bench Pro, es adecuado para pipelines que reciben un issue, localizan el fallo y generan un parche validado por tests ocultos.
- Agente de soporte a desarrollo en CI/CD: integrado via tool calling, puede leer logs, proponer parches y ejecutar tests en un bucle de varios pasos.
- Automatizacion de back-office: tareas como conciliacion de datos, actualizacion de registros o generacion de informes que requieren llamadas a APIs y comprobacion del estado final del sistema.
- Despliegue privado en empresa: al caber en una GPU de 80 GB en BF16 y no depender de APIs externas en su entrenamiento, encaja en entornos con requisitos de soberania del dato.
- Asistente de codigo con acceso a herramientas: function calling para consultar documentacion, ejecutar comandos y validar resultados en un IDE o terminal.
- Procesamiento de documentos con imagen y texto: gracias al pipeline image-text-to-text, puede extraer informacion de capturas o documentos escaneados y actuar sobre ella.

## Benchmarks y rendimiento

| Benchmark | Qwen3.8-27B (base) | Agentic-27B-V2 | Mejora |
|---|---:|---:|---:|
| AutomationBench | 18/60 (30,00%) | 25/60 (41,67%) | +11,67 pts (+38,9% rel.) |
| SWE-bench Pro | 51/60 (85,00%) | 55/60 (91,67%) | +6,67 pts (fallos 9 a 5, -44%) |

Segun la model card, el modelo supera al profesor DeepSeek-V4.1-Flash-1017 en AutomationBench (25 frente a 20) y a Qwen3.8-Max-0902 en ambos benchmarks (AutomationBench 25 frente a 20; SWE-bench Pro 55 frente a 45). Alcanza aproximadamente el 76% del resultado de Claude Opus 5.5 en AutomationBench (25 frente a 33). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 55,6 GB para los pesos en BF16 (tamano del repo), con overhead adicional para el contexto y el modulo MTP.
- GPU recomendadas: una GPU de 80 GB (A100 80GB, H100 80GB) para BF16, tal como indica la model card ("1 x 80GB GPU").
- GPU de consumo: no cabe en GPUs de 24 GB en BF16; requeriria cuantizacion (no documentada) para intentarlo en RTX 4090 o similares.
- Opciones de despliegue: vLLM (etiqueta oficial), transformers; endpoints compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AutomationBench | SWE-bench Pro | Licencia |
|---|---|---:|---:|---:|---|
| Agentic-27B-V2 | 27,8B denso | No disponible | 25/60 (41,67%) | 55/60 (91,67%) | opencsg-model-and-dataset-license |
| Qwen3.8-27B (base) | 27B denso | No disponible | 18/60 (30,00%) | 51/60 (85,00%) | No disponible en la informacion |
| DeepSeek-V4.1-Flash-1017 (profesor) | No disponible | No disponible | 20/60 | 56/60 | No disponible |
| Qwen3.8-Max-0902 | Mayor que 27B (no especificado) | No disponible | 20/60 | 45/60 | No disponible |

## Limitaciones y advertencias

- Solo se declaran chino e ingles; el rendimiento en castellano no esta verificado.
- La licencia es propia (opencsg-model-and-dataset-license) y requiere acuerdo comercial para uso empresarial; hay que revisar los terminos antes de produccion.
- Las evaluaciones se basan en conjuntos held-out de 60 tareas, por lo que la varianza estadistica es alta.
- No se documentan sesgos, tasas de alucinacion ni comportamiento fuera de los dominios de agente y codigo evaluados.
- No se especifican la longitud de contexto ni las opciones de cuantizacion, lo que limita la planificacion de despliegue.
- El modelo esta especializado en tareas agenticas; su rendimiento en tareas generales de conocimiento puede diferir del base y no se ha medido.
- El modulo MTP y las capacidades multimodales se mencionan pero no se detallan; conviene validarlas antes de depender de ellas.

## Enlaces

- Hugging Face: https://huggingface.co/opencsg/Agentic-27B-V2
- Repositorio de modelos OpenCSG: https://huggingface.co/opencsg
- Licencia: https://huggingface.co/opencsg/Agentic-27B-V2/blob/main/OpenCSG%E6%A8%A1%E5%9E%8B%E4%B8%8E%E6%95%B0%E6%8D%AE%E9%9B%86%E8%AE%B8%E5%8F%AF%E5%8D%8F%E8%AE%AE.md
- Contacto comercial: mailto:lorraineg@opencsg.com
- Paper EvoSyn: https://arxiv.org/html/2610.12593
- Paper AutoDataBench: https://arxiv.org/html/2609.35025
- Paper Kimi K2: https://arxiv.org/html/2507.20534
- Paper DeepSeek-V4.1-Flash: https://arxiv.org/pdf/2609.19969
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
