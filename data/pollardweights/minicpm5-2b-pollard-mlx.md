# PollardWeights/MiniCPM5-2B-Pollard-MLX

## Resumen

PollardWeights/MiniCPM5-2B-Pollard-MLX es una cuantización del modelo openbmb/MiniCPM5-2B, creada por el usuario PollardWeights mediante la técnica Pollard Weights. Esta técnica de "asignación medida" coloca los bits según la sensibilidad de cada capa bajo un presupuesto de tamaño, en lugar de aplicar una compresión uniforme. El resultado reduce el modelo de 5.0 GB en precisión f16 a 2.05 GB, un 59% menos, manteniendo una calidad de cuantización de 4.8 bits efectivos.

El modelo se distribuye en formato MLX, optimizado para Apple Silicon, y está pensado para generación de texto conversacional en inglés. Con 2.516.756.480 parámetros (2.5B), se trata de un modelo compacto que puede ejecutarse en hardware de Apple con memoria unificada. La licencia es Apache 2.0, lo que permite uso comercial. Su relevancia radica en ofrecer una alternativa de cuantización eficiente para modelos pequeños en entornos locales, aunque aún no se han publicado benchmarks que validen su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; el repositorio la etiqueta como "llama" |
| Parametros totales | 2.516.756.480 (2.5B) |
| Parametros activos | No aplica (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PollardMix 4.8 (asignacion medida por capa, precision mixta) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion de openbmb/MiniCPM5-2B, un modelo de 2.5B parametros. La arquitectura del modelo base no se detalla en la informacion proporcionada, aunque el repositorio lo etiqueta como "llama", lo que sugiere un transformer decoder de tipo Llama. La innovacion principal no esta en el entrenamiento, sino en el metodo de cuantizacion: Pollard Weights utiliza una asignacion medida de bits por capa, determinada por la sensibilidad de cada capa al error de cuantizacion, bajo un presupuesto de tamano fijo. Esto permite una reduccion de tamano significativa frente a cuantizaciones uniformes comparables.

No se dispone de informacion sobre los datos de entrenamiento del modelo base, el numero de tokens utilizados ni la composicion del dataset. Tampoco se mencionan procesos de alineacion como RLHF o DPO. El modelo se ofrece unicamente como una version cuantizada del original, sin modificaciones en los pesos mas alla de la cuantizacion.

## Capacidades

- Generacion de texto en ingles, segun los tags del repositorio.
- Uso conversacional (chat), tal como indican las etiquetas "conversational" y "text-generation".
- Inferencia en Apple Silicon mediante la libreria MLX, con un tamano de 2.05 GB que permite ejecutarlo en dispositivos con memoria unificada limitada.
- Cuantizacion de precision mixta con asignacion medida, que ofrece una alternativa a cuantizaciones uniformes como Q8_0, Q6_K o Q4_K_M.
- No se dispone de informacion sobre soporte de tool calling, funciones, agentes, vision, audio ni otras capacidades multimodales.

## Casos de uso

- Asistente de texto local en Mac: el modelo puede ejecutarse con `mlx_lm.generate` en un Mac con Apple Silicon, permitiendo generar respuestas en ingles sin conexion a internet. Su tamano de 2.05 GB lo hace adecuado para equipos con memoria unificada moderada.
- Prototipado de aplicaciones conversacionales: al ser un modelo de 2.5B parametros, permite iterar rapidamente en entornos de desarrollo, especialmente para validar flujos de chat basicos antes de escalar a modelos mas grandes.
- Experimentacion con tecnicas de cuantizacion: los desarrolladores e investigadores pueden comparar el comportamiento de PollardMix frente a otras cuantizaciones del mismo modelo (Q8_0, Q6_K, Q4_K_M) en terminos de tamano, perplejidad y divergencia KLD, aunque estas metricas aun no se han publicado.
- Educacion en aprendizaje automatico: sirve como caso de estudio para analizar como la asignacion de bits por sensibilidad afecta a la calidad de un modelo pequeno, en lugar de aplicar una cuantizacion uniforme.
- Despliegue en dispositivos edge de Apple: para aplicaciones que necesitan generacion de texto en ingles sin depender de servicios en la nube, el formato MLX permite integrar el modelo en apps nativas de macOS o iOS.
- Generacion de texto en tareas de bajo riesgo: el modelo puede usarse para redactar borradores, resumir texto o responder preguntas sencillas en ingles, siempre que se asuma un margen de error y no se requiera precision critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las pruebas de perplejidad (PPL) y divergencia media de Kullback-Leibler (Mean KLD) estan pendientes, por lo que no es posible evaluar el rendimiento real del modelo en comparacion con otras cuantizaciones.

## Requisitos de hardware

- El modelo ocupa 2.05 GB en disco. En Apple Silicon, se carga en memoria unificada, por lo que se recomienda un Mac con Apple Silicon (M1 o posterior). No se especifica la cantidad minima de RAM.
- El formato MLX esta disenado especificamente para Apple Silicon. No se proporciona informacion sobre compatibilidad con GPUs de NVIDIA o AMD.
- Despliegue: mediante la CLI `mlx_lm.generate` o la libreria MLX de Apple. No se mencionan alternativas como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La siguiente tabla compara las distintas cuantizaciones del mismo modelo base mencionadas en la model card. No se dispone de datos de rendimiento para ninguna de ellas.

| Formato | Tamano | Tipo de cuantizacion | Disponibilidad |
|---|---:|---|---|
| f16 | 5.0 GB | Precision completa (16 bits) | Modelo base original |
| Q8_0 | ~2.7 GB | Cuantizacion uniforme de 8 bits | Mencionado en la model card |
| Q6_K | ~2.0 GB | Cuantizacion uniforme de 6 bits | Mencionado en la model card |
| Q4_K_M | ~1.4 GB | Cuantizacion uniforme de 4 bits | Mencionado en la model card |
| PollardMix (este repo) | 2.05 GB | Asignacion medida de 4.8 bits | Disponible en este repositorio |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (2B en formato MLX) en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks de perplejidad ni de divergencia KLD, por lo que el rendimiento real del modelo no esta validado.
- La cuantizacion ha sido realizada por un unico autor en una sola maquina, y la model card invita a replicar los resultados. No existe validacion independiente.
- El modelo solo soporta ingles, segun la informacion de la model card.
- La longitud de contexto no esta especificada, lo que limita las garantias sobre el manejo de conversaciones largas.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamientos problematicos. Al tratarse de un modelo pequeno, es probable que presente errores en tareas complejas.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan posibles restricciones adicionales del modelo base openbmb/MiniCPM5-2B.
- El formato MLX limita el despliegue a Apple Silicon, lo que excluye entornos de servidores con GPUs CUDA o ROCm.

## Enlaces

- Repositorio del modelo: https://huggingface.co/PollardWeights/MiniCPM5-2B-Pollard-MLX
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio de Pollard Weights: https://github.com/WestWaters/pollard-weights
- Repositorio relacionado (Pollard): https://huggingface.co/PollardWeights/MiniCPM5-2B-Pollard
