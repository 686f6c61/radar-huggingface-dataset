# mr-ltg/gpt-oss-20b-mlx-4Bit

## Resumen

mr-ltg/gpt-oss-20b-mlx-4Bit es una conversion al formato MLX del modelo openai/gpt-oss-20b, realizada con mlx-lm 0.31.2 por el usuario mr-ltg. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de una reempaquetado de pesos en cuantizacion de 4 bits pensado para ejecucion local sobre silicio de Apple (M1/M2/M3/M4 y posteriores) mediante el framework MLX. El repositorio ocupa 11,2 GB y declara 20.914.755.648 parametros totales en safetensors, coherente con el modelo base.

Su relevancia es practica: permite ejecutar un modelo de clase 20B con licencia Apache 2.0 en un Mac con memoria unificada moderada, sin depender de CUDA ni de servicios en la nube. Al derivar de gpt-oss-20b, hereda las caracteristicas de ese modelo (arquitectura MoE, ventana de contexto larga y formato de respuesta harmony del modelo original), aunque el autor de esta conversion no documenta en su model card ni los idiomas soportados, ni los resultados de evaluacion, ni los parametros activos, por lo que esos datos figuran como no disponibles en esta ficha.

El principal caveat es que se trata de un repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria ni pruebas publicadas de fidelidad de la cuantizacion respecto al modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en el repositorio; heredada del modelo base openai/gpt-oss-20b (transformer con mezcla de expertos) |
| Parametros totales | 20.914.755.648 (20,9 B) |
| Parametros activos | No disponible en este repositorio (el modelo base declara ~3,6 B activos) |
| Longitud de contexto | No disponible en este repositorio (el modelo base declara 128 000 tokens) |
| Tipos de cuantizacion | 4 bits en formato MLX (unico publicado en este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria transformers/mlx-lm) |

Datos adicionales del repositorio: tamano del repo 11,2 GB, pipeline text-generation, etiquetas vllm, mlx, mlx-my-repo, 4-bit, conversational, base_model:openai/gpt-oss-20b.

## Arquitectura y entrenamiento

Este repositorio no contiene informacion sobre arquitectura, datos de entrenamiento ni proceso de alineacion. El autor se limita a indicar que los pesos se convirtieron a MLX desde openai/gpt-oss-20b usando mlx-lm 0.31.2. Por tanto, cualquier afirmacion sobre composicion del dataset, numero de tokens, RLHF/DPO o innovaciones de atencion debe consultarse en la model card del modelo base, no en esta.

Lo unico verificable aqui es el proceso de conversion: pesos en 4 bits, cargables con la libreria mlx-lm, con tokenizer y chat template heredados del modelo original (el ejemplo de la model card comprueba `tokenizer.apply_chat_template` antes de generar, lo que sugiere que el template de chat esta presente). No se documenta calibracion, group size ni esquema de cuantizacion mas alla de la etiqueta 4-bit.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y la etiqueta conversational indica uso en dialogos multi-turno.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base openai/gpt-oss-20b, no verificadas de forma independiente en este repositorio.
- Compatibilidad con tool calling y agentes: no documentada en la model card de esta conversion; depende del chat template y del formato de respuesta del modelo base.
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.
- Modo de razonamiento explicito (thinking): no documentado en este repositorio.
- Inferencia local en Apple Silicon mediante MLX: capacidad operativa confirmada por el ejemplo de uso incluido.
- Compatibilidad declarada con vLLM a traves de etiqueta, aunque la model card solo documenta el flujo con mlx-lm.

## Casos de uso

- Asistente de programacion local en un Mac: el modelo puede cargarse con `mlx_lm.load` y usarse para autocompletar, explicar o refactorizar codigo sin enviar el codigo fuente a un servicio externo, lo que resulta adecuado en entornos con requisitos de confidencialidad.
- Prototipado de aplicaciones conversacionales en equipos de desarrollo sin GPU NVIDIA: al ocupar unos 11,2 GB en disco y requerir unicamente memoria unificada de Apple, permite levantar un chatbot de pruebas en un portatil de gama alta.
- Procesamiento de documentos largos en local: si se confirma la ventana de contexto de 128 000 tokens del modelo base, seria util para resumir o consultar contratos, informes tecnicos o documentacion extensa sin trocear el texto.
- Generacion de borradores tecnicos y documentacion: redaccion asistida de README, notas de version o comentarios de codigo integrada en el flujo de trabajo del desarrollador.
- Evaluacion comparativa de cuantizaciones: este repositorio sirve como punto de partida para medir la perdida de calidad de una conversion 4-bit MLX frente a los pesos originales del modelo base.
- Aprendizaje e investigacion sobre MLX: util como caso practico para estudiar el proceso de conversion de un modelo MoE grande a un formato optimizado para Apple Silicon.
- Automatizacion de tareas de texto por lotes en estaciones de trabajo Mac: clasificacion, extraccion de entidades o reescritura de textos con coste marginal cero una vez descargado el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K u otras), y la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo. El modelo base openai/gpt-oss-20b publica sus propias evaluaciones en su model card oficial, pero no se reproducen aqui para no atribuir a esta conversion cifras que no han sido verificadas sobre los pesos cuantizados.

## Requisitos de hardware

- Requisito de plataforma: MLX funciona exclusivamente sobre Apple Silicon (serie M). No es ejecutable en GPU NVIDIA ni AMD mediante CUDA o ROCm.
- Memoria unificada estimada: los pesos en 4 bits ocupan aproximadamente 10,5-11,5 GB (el repositorio pesa 11,2 GB). Hay que sumar el cache KV y el overhead del runtime, por lo que se recomienda un Mac con 24 GB o 32 GB de memoria unificada. En equipos de 16 GB la carga es posible pero muy ajustada y con riesgo de swapping.
- GPU recomendadas: no aplica en el sentido habitual; el equivalente serian chips Apple M2 Pro/Max, M3 Pro/Max y M4 Pro/Max con 24 GB o mas de memoria unificada. En GPUs NVIDIA este formato no es utilizable.
- Cabe en GPU de consumo: si, en el sentido de que cabe en Apple Silicon de gama alta con memoria unificada suficiente; no en tarjetas graficas de consumo con 8-12 GB de VRAM, ya que el formato MLX no esta soportado.
- Opciones de despliegue: mlx-lm (documentado en la model card), MLX-LM server para exponer una API compatible con OpenAI, y potencialmente vLLM si se dispone de los pesos en formato estandar, aunque la model card no detalla ese flujo.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mr-ltg/gpt-oss-20b-mlx-4Bit | 20,9 B totales | No disponible en el repo | safetensors MLX, 4 bits | apache-2.0 | HuggingFace, 0 descargas |
| openai/gpt-oss-20b (modelo base) | 20,9 B totales, ~3,6 B activos | 128 000 tokens (segun el modelo base) | safetensors PyTorch | apache-2.0 | HuggingFace, modelo oficial |
| Otras conversiones MLX de la misma familia | No disponible | No disponible | safetensors MLX | No disponible | No disponible |

No se dispone de datos de benchmarks sobre esta conversion que permitan comparar su calidad frente al modelo base ni frente a otras alternativas de tamano similar. La comparacion se limita, por tanto, a parametros, formato y licencia.

## Limitaciones y advertencias

- Repositorio sin validacion: 0 descargas y 0 likes en el momento de la consulta, sin issues, evaluaciones ni pruebas de fidelidad publicadas por terceros.
- Riesgo de degradacion por cuantizacion: al tratarse de una conversion a 4 bits no se documenta la perdida de calidad respecto a los pesos originales, ni se han publicado mediciones que la acoten.
- Sesgos: no evaluados en este repositorio. Al ser una conversion del modelo base, hereda los sesgos de este, que deben consultarse en su documentacion oficial.
- Alucinacion: no se han publicado tasas de alucinacion para esta version; el riesgo es el propio de un modelo generativo de su clase.
- Idiomas: la lista de idiomas soportados no esta disponible en el repositorio; no se debe asumir cobertura multilingue sin verificacion previa.
- Restricciones de plataforma: el formato MLX limita el despliegue a Apple Silicon, lo que excluye servidores con GPU NVIDIA y complica el escalado horizontal en infraestructura convencional.
- Licencia: apache-2.0, permisiva para uso comercial, pero conviene verificar los terminos y las condiciones que OpenAI aplica al modelo base antes de un despliegue en produccion.
- Ausencia de datos operativos: no hay cifras publicas de latencia, throughput ni consumo de memoria en escenarios reales para esta cuantizacion concreta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mr-ltg/gpt-oss-20b-mlx-4Bit
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Libreria mlx-lm (mencionada en la model card, version 0.31.2): https://github.com/ml-explore/mlx-lm
- Proyecto MLX de Apple: https://github.com/ml-explore/mlx
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los resultados obtenidos correspondian a contenidos no relacionados (sitios de bricolaje y articulos sobre la abreviatura de "monsieur").
