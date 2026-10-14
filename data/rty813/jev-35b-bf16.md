# rty813/JEV-35B-bf16

## Resumen

JEV-35B-bf16 es un port en precision completa (bf16) del modelo autotrust/JEV-35B, publicado por el usuario rty813 en HuggingFace. Se trata de una conversion del checkpoint original a formato PyTorch (`pytorch_model.bin`) pensada para usuarios de vLLM, TGI, Xinference y transformers que prefieren trabajar con pesos sin cuantizar en lugar de con la version GGUF. El repositorio es una derivacion directa: la arquitectura y los pesos son identicos a los del modelo original, por lo que funciona como sustituto directo mediante `AutoModelForCausalLM.from_pretrained`.

El modelo original, autotrust/JEV-35B, es un fine-tuning de Qwen/Qwen3.5-35B-A3B orientado a la toma de decisiones ("decision model") en lugar de a la generacion de texto abierta. Su propuesta es sustituir equipos completos de ranking por un unico modelo que emite decisiones tipadas con probabilidades calibradas, bajo el paradigma denominado System 1 en su model card. La nomenclatura del modelo base (35B-A3B) y las etiquetas `qwen3_5_moe` y `mixture-of-experts` apuntan a una arquitectura de mezcla de expertos con 35 000 millones de parametros totales, aunque el numero de parametros activos no se explicita en la informacion disponible.

La relevancia de este repositorio concreto es acotada: se publica con 0 descargas y 0 likes, un tamano de repositorio reportado de 0.0 GB (lo que sugiere que los pesos aun no se han subido o no se han indexado) y la propia model card indica que la conversion a safetensors esta en curso. Es, por tanto, un artefacto de conveniencia para despliegue en servidores de inferencia, no un modelo nuevo con entrenamiento propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun las etiquetas `qwen3_5_moe` y `mixture-of-experts` del modelo base |
| Parametros totales | 35B (segun la nomenclatura JEV-35B y Qwen3.5-35B-A3B del modelo base) |
| Parametros activos | no disponible (la nomenclatura "A3B" del modelo base sugiere del orden de 3B activos, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Este repositorio: bf16 (precision completa). Existe una version GGUF del modelo original, segun la model card, sin detalle de los niveles disponibles |
| Idiomas soportados | Ingles (`en`) declarado en el modelo original; el repositorio derivado indica "no disponible" |
| Licencia | Apache 2.0 |
| Formato de pesos | `pytorch_model.bin` en bf16; la conversion a safetensors esta en curso segun la model card |

## Arquitectura y entrenamiento

La model card de este repositorio no aporta informacion sobre el entrenamiento: se limita a indicar que la arquitectura es identica a la del modelo original y que los pesos son un port a bf16. Del modelo base se sabe que es un fine-tuning de Qwen/Qwen3.5-35B-A3B, que emplea una arquitectura de mezcla de expertos (etiquetas `qwen3_5_moe` y `mixture-of-experts`) y que esta orientado a una tarea de clasificacion/decision con probabilidades calibradas. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

El aspecto diferencial del modelo original no es arquitectonico sino de proposito: se presenta como un "decision model" que emite decisiones tipadas en lugar de texto libre, dentro de un paradigma que el autor denomina System 1, con inferencia en torno a medio segundo segun el blog asociado. La model card describe decisiones calibradas sobre un conjunto de tareas publicas de indice de decision. No hay informacion disponible sobre innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal u otras optimizaciones.

## Capacidades

- Evaluacion y decision: el modelo original esta entrenado para producir decisiones tipadas con probabilidades calibradas, no para generacion de texto abierta.
- Ranking y recomendacion: la demo publica del autor (GuruSearch) lo emplea para reordenar titulares y resultados de busqueda como decisiones System 1.
- Clasificacion con puntuacion: la model card del modelo original declara `pipeline_tag: text-classification` con metricas de indice de decision.
- Generacion de texto: el repositorio derivado se etiqueta como `text-generation` y `image-text-to-text`, lo que sugiere compatibilidad con generacion, si bien la model card original no describe capacidades generativas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado en el modelo original.
- Capacidades especiales: modo de decision System 1 con calibracion de probabilidades; vision no confirmada pese a la etiqueta `image-text-to-text`.

## Casos de uso

- Reordenacion de resultados de busqueda: el modelo puede puntuar y reordenar candidatos devueltos por un motor de recuperacion, emitiendo una decision calibrada por documento en lugar de una puntuacion opaca, tal como hace la demo GuruSearch del autor.
- Recomendacion de contenidos editoriales: seleccion y jerarquizacion de titulares o articulos de multiples fuentes, aprovechando la capacidad de decidir sobre un conjunto de opciones con probabilidades calibradas.
- Moderacion o triaje con umbral: clasificacion de elementos en categorias tipadas donde la probabilidad calibrada permite fijar umbrales de actuacion y auditar el motivo de cada decision.
- Sustitucion de pipelines de ranking compuestos: donde antes se encadenaban varios modelos especializados, se puede desplegar un unico modelo de decision, reduciendo la complejidad operativa y el numero de servicios en produccion.
- Evaluacion automatica con puntuacion: uso del modelo como juez que emite una decision tipada y una puntuacion calibrada sobre respuestas generadas por otros sistemas.
- Despliegue en infraestructura de inferencia existente: al ser un port a bf16, se integra directamente en vLLM (`vllm serve rty813/JEV-35B-bf16`), TGI, Xinference y transformers sin necesidad de convertir pesos.
- Investigacion sobre calibracion: el modelo permite estudiar si las probabilidades emitidas por un modelo de decision se corresponden con la frecuencia real de acierto, dado que la calibracion es una parte explicita de su propuesta.

## Benchmarks y rendimiento

| Benchmark | Tarea | Resultado | Notas |
|---|---|---|---|
| Decision Index 0.3, suite publica, System 1 | Indice de decision | 59.73 | Puntuacion propia con el kit del autor, no una entrada de leaderboard |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de proposito general en la informacion disponible. La unica metrica reportada corresponde al modelo original autotrust/JEV-35B, no a este port en bf16, y el propio autor advierte que no procede de una comparativa arbitrada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 70 GB solo para pesos (35B parametros x 2 bytes), mas cache KV y activaciones. Estimacion propia, no confirmada por el autor.
- GPU recomendadas para bf16: una H100 80 GB o una A100 80 GB para el modelo completo; alternativamente 2 x A100 40 GB o 2 x RTX A6000 con reparto de pesos.
- Consumer GPU: no cabe en bf16 en ninguna GPU de consumo. Solo seria viable con cuantizaciones GGUF agresivas del modelo original (por ejemplo, Q4 en torno a 20-22 GB, ajustado en una RTX 4090 o RTX 3090 de 24 GB), estimacion no confirmada.
- Opciones de despliegue: vLLM (`vllm serve rty813/JEV-35B-bf16`), TGI, Xinference (busqueda "JEV-35B") y transformers con `AutoModelForCausalLM.from_pretrained`. El autor menciona explicitamente estos cuatro entornos.
- Latencia y throughput: no disponibles. El material del autor cita decisiones en torno a medio segundo en su demo de recomendacion, pero corresponde al modelo original y a su infraestructura.
- Caveat de despliegue: el tamano de repositorio reportado es de 0.0 GB, por lo que conviene verificar que los pesos estan efectivamente publicados antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rty813/JEV-35B-bf16 | 35B (MoE, activos no disponibles) | no disponible | No evaluado de forma independiente | Apache 2.0 | HuggingFace, 0 descargas |
| autotrust/JEV-35B | 35B (MoE, activos no disponibles) | no disponible | Decision Index 0.3: 59.73 (puntuacion propia) | Apache 2.0 | HuggingFace, con version GGUF |
| Qwen/Qwen3.5-35B-A3B | 35B (MoE, activos no disponibles) | no disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo base del que deriva JEV-35B |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria fuera de la familia Qwen3.5/JEV.

## Limitaciones y advertencias

- Riesgo de alucinacion: no evaluado en la informacion disponible. Al tratarse de un modelo de decision mas que de generacion, el riesgo principal seria una calibracion deficiente, no la invencion de hechos.
- Ausencia de evaluacion independiente: la unica metrica reportada (59.73 en Decision Index 0.3) es una puntuacion propia del autor, realizada con su propio kit y explicitamente no validada en un leaderboard.
- Cobertura idiomatica: solo ingles declarado en el modelo original; no hay evidencia de soporte para castellano ni otros idiomas.
- Discrepancia de etiquetas: el repositorio derivado se etiqueta como `text-generation` e `image-text-to-text`, mientras que la model card original declara `text-classification`. Esta contradiccion no esta resuelta en la informacion proporcionada y conviene verificarla antes de asumir capacidades generativas o de vision.
- Estado del artefacto: 0 descargas, 0 likes, repositorio de 0.0 GB y conversion a safetensors en curso. Es un artefacto sin adopcion verificable y con riesgo de estar incompleto.
- Licencia: Apache 2.0 en ambos repositorios, lo que permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.5-35B-A3B antes de explotarlo en produccion.
- Coste de despliegue: en bf16 requiere hardware de centro de datos (en torno a 70 GB de VRAM solo en pesos), lo que limita su uso fuera de entornos con GPU de 80 GB o reparto multi-GPU.
- Longitud de contexto desconocida: al no publicarse la ventana de contexto, no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Falta de informacion de sesgos: no se han publicado analisis de sesgo ni de seguridad para este modelo.

## Enlaces

- Repositorio HuggingFace de este port: https://huggingface.co/rty813/JEV-35B-bf16
- Modelo original: https://huggingface.co/autotrust/JEV-35B
- Modelo base del que deriva el original: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Blog del autor, "One Decision Model Instead of a Ranking Team": https://huggingface.co/blog/autotrust/one-decision-model-instead-of-a-ranking-team-short
- Demo en vivo de recomendacion y busqueda (AutoTrust/GuruSearch): https://news.guru.so/ui
