# Abhayn01/Arka-Specialist-V2-1p4B-Controlled-100M-CPT

## Resumen

Arka-Specialist-V2-1p4B-Controlled-100M-CPT es un checkpoint de tipo base (no instruction-tuned) publicado por el usuario Abhayn01 en HuggingFace. Se trata de la etapa de "reparacion" mediante continual pre-training (CPT) de un modelo previo llamado `Abhayn01/Arka-Specialist-V2-1B-Plus300M-EOD-CPT`, sobre el que se han entrenado 100.007.936 tokens adicionales con una mezcla controlada de datos. El nombre comercial induce a confusion: el "1p4B" hace referencia a los aproximadamente 1.400 millones de tokens acumulados, no al numero de parametros, que segun los pesos safetensors publicados es de 178.152.992 (unos 178 M).

El modelo se distribuye en formato safetensors bajo la libreria transformers, con la etiqueta `custom_code`, lo que implica que el repositorio incluye codigo propio y que su carga probablemente requiere `trust_remote_code=True`. La model card no especifica arquitectura, licencia ni idiomas soportados, y no se han publicado resultados de benchmarks. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto experimental de investigacion mas que de un modelo listo para produccion.

Su relevancia es acotada: sirve como ejemplo de pipeline de CPT con mezcla de datos y token EOD explicito (`<|endofdocument|>`, ID 64000), y como punto de partida para fine-tuning supervisado en tareas de generacion de texto. Para uso directo en producto, la ausencia de licencia, de evaluacion y de ajuste instruccional lo desaconsejan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el repositorio esta etiquetado como `custom_code`) |
| Parametros totales | 178.152.992 (~178 M, dato real de los safetensors) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | 1024 tokens (contexto usado en esta etapa de entrenamiento) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; la conversion a fp16/int8/GGUF seria externa) |
| Idiomas soportados | no disponible (la mezcla de datos declarada, FineWeb-Edu + FineMath-4+ + CodeParrot Clean, es mayoritariamente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Vocabulario | no disponible (el ID 64000 del token `<|endofdocument|>` implica un vocabulario de al menos 64.001 entradas) |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Las etiquetas del repositorio (`transformers`, `text-generation`, `custom_code`, `arka_v2_mobile`) indican que se trata de un modelo de lenguaje causal para generacion de texto implementado con codigo propio, presumiblemente un transformer decoder-only de unos 178 M de parametros, aunque esta afirmacion no puede confirmarse con la informacion disponible. La etiqueta `custom_code` es relevante en la practica: obliga a confiar en el codigo Python del repositorio y a activar `trust_remote_code` al cargarlo con transformers.

El entrenamiento corresponde a una etapa de reparacion por continual pre-training sobre el checkpoint base `Abhayn01/Arka-Specialist-V2-1B-Plus300M-EOD-CPT`. La mezcla declarada es 70% FineWeb-Edu, 20% FineMath-4+ y 10% CodeParrot Clean, con 100.007.936 tokens de reparacion y un total acumulado aproximado de 1.400.021.760 tokens. La longitud de contexto usada en esta etapa es de 1024 tokens y se emplea un token explicito de fin de documento (`<|endofdocument|>`, ID 64000), un detalle util para delimitar muestras en datos de preentrenamiento concatenados. No se menciona ningun tipo de ajuste por instrucciones, RLHF, DPO u otra fase de alineacion; el autor indica explicitamente que es un checkpoint base.

## Capacidades

- Generacion de texto causal: continuacion de secuencias, autocompletado y modelado de lenguaje en general.
- Capacidad de base para fine-tuning: al no estar ajustado a instrucciones, su uso natural es como punto de partida para SFT, LoRA o CPT adicional.
- Manejo de contenido matematico y cientifico: la mezcla incluye un 20% de FineMath-4+, lo que puede favorecer texto con notacion matematica.
- Manejo de codigo: un 10% de CodeParrot Clean sugiere cierta familiaridad con sintaxis de programacion, siempre en el marco de un modelo base.
- Delimitacion de documentos: soporte del token `<|endofdocument|>` (ID 64000) para separar muestras.
- Tool calling / function calling: no disponible y no documentado.
- Capacidades de agente o razonamiento multi-paso: no disponibles y no documentadas.
- Capacidades multilingues: no disponibles; la mezcla de datos declarada es predominantemente en ingles.
- Vision, audio, modo "thinking" u otras capacidades especiales: no disponibles.

## Casos de uso

- Punto de partida para fine-tuning supervisado: el modelo puede recibir un dataset de instrucciones en formato prompt-respuesta y ajustarse con LoRA o fine-tuning completo, dado su tamano reducido (178 M de parametros) permite iterar rapido en una unica GPU.
- Experimentacion academica con continual pre-training: sirve para reproducir y estudiar el efecto de mezclas de datos controladas (70/20/10) sobre un modelo base, incluyendo el uso del token EOD para delimitar documentos.
- Generacion de texto con recursos minimos: al caber en memoria de cualquier GPU de consumo e incluso en CPU, es adecuado para demos, prototipos o entornos con hardware muy limitado.
- Preentrenamiento de dominio en ingles tecnico: partiendo de esta base y aplicando CPT adicional con corpus propio (por ejemplo, documentacion tecnica o articulos cientificos), se pueden obtener modelos especializados de bajo coste.
- Clasificacion y etiquetado por fine-tuning: la cabeza de lenguaje puede adaptarse a tareas discriminativas (clasificacion de texto, deteccion de spam, analisis de sentimiento) anadiendo una capa de clasificacion y ajustando el modelo.
- Investigacion sobre sesgos y comportamiento de modelos pequenos: util como sujeto de estudio en experimentos de evaluacion de sesgos o robustez con presupuesto computacional minimo.
- Prototipado de pipelines de inferencia: sirve para validar integraciones con transformers, vLLM o TGI antes de escalar a modelos mayores, con tiempos de carga y latencia muy bajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y tampoco se aportan comparaciones con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,71 GB en fp32, 0,36 GB en fp16/bf16 y 0,18 GB en int8, a los que se suma el cache KV, minimo con una ventana de 1024 tokens.
- GPU recomendadas: practicamente cualquier GPU con mas de 1 GB de VRAM. Modelos como RTX 3060, RTX 4090, T4, A10G, A100 o H100 son enormemente sobredimensionados para este modelo.
- GPU de consumo: si, cabe sin problemas en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida suficiente. Tambien es viable la inferencia en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligado por la etiqueta `custom_code`), vLLM y TGI si el codigo propio es compatible, y llama.cpp u Ollama previa conversion a GGUF, ya que no se publica ningun archivo GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles. Dado el tamano, se espera una latencia muy baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No hay benchmarks publicados del modelo, por lo que la comparacion se limita a parametros y contexto. Los datos de los modelos de referencia provienen de sus repositorios oficiales.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Arka-Specialist-V2-1p4B-Controlled-100M-CPT | 178 M | 1024 | no disponible | Checkpoint base, requiere `trust_remote_code`; sin benchmarks ni ajuste instruccional |
| SmolLM2-135M | 135 M | 8192 | Apache-2.0 | Modelo base con entrenamiento a gran escala y evaluaciones publicadas |
| Pythia-160M | 162 M | 2048 | Apache-2.0 | Modelo de investigacion con suite completa de checkpoints intermedios |
| GPT-2 (124M) | 124 M | 1024 | licencia MIT modificada | Referencia historica, muy superado en datos de entrenamiento |
| Qwen2.5-0.5B | 494 M | 32768 | Apache-2.0 | Alternativa algo mayor, con variantes instruccionales y contexto muy superior |

Rendimiento comparado: no disponible (ninguna de las metricas del modelo esta publicada, por lo que no procede establecer comparaciones cuantitativas).

## Limitaciones y advertencias

- Ausencia de licencia: no se especifica licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido. En la practica, debe tratarse como no apto para produccion hasta que el autor la aclare.
- Modelo base sin alineacion: no esta ajustado a instrucciones ni alineado con preferencias humanas, por lo que puede generar contenido incoherente, repetitivo u ofensivo ante prompts directos.
- Riesgo de alucinacion: con 178 M de parametros y un contexto de 1024 tokens, la tasa de afirmaciones factualmente incorrectas es previsiblemente alta; no debe usarse como fuente de conocimiento sin verificacion externa.
- Sesgos conocidos: no documentados por el autor. La mezcla de datos (FineWeb-Edu, FineMath-4+, CodeParrot Clean) condiciona los sesgos hacia el ingles y hacia dominios educativos y de programacion.
- Limitacion idiomatica: el soporte multilingue, y en particular el castellano, no esta documentado ni previsiblemente optimizado.
- Limitacion de contexto: 1024 tokens es una ventana muy reducida para tareas de contexto largo, resumen de documentos extensos o conversaciones multi-turno largas.
- Codigo personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio; conviene auditar el codigo antes de usarlo en entornos compartidos.
- Sin validacion externa: 0 descargas y 0 likes, sin evaluaciones independientes ni resultados de benchmarks, por lo que su calidad real es desconocida.
- Nomenclatura enganosa: el "1p4B" del nombre se refiere a tokens acumulados, no a parametros; conviene no confundirlo con un modelo de 1.400 millones de parametros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abhayn01/Arka-Specialist-V2-1p4B-Controlled-100M-CPT
- Modelo base declarado en la model card: https://huggingface.co/Abhayn01/Arka-Specialist-V2-1B-Plus300M-EOD-CPT
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
