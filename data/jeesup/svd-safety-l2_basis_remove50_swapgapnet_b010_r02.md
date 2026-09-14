# Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r02

## Resumen

svd-safety-l2_basis_remove50_swapgapnet_b010_r02 es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace, derivado de meta-llama/Llama-2-7b-chat-hf. No es un modelo conversacional de propósito general: es una celda concreta dentro de una rejilla experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. El modelo parte de una compresión mediante Basis Sharing (ICLR 2025) con bases compartidas entre grupos de 2 capas adyacentes, que elimina el 50,00 % de los parámetros densos, y después aplica 2 de las 10 rondas previstas de una rutina iterativa de intercambio de parámetros neutro en parámetros, seleccionada por la regla swapgapnet_iter.

El presupuesto de restauración declarado es del 1,000 % de los parámetros densos, ejecutado en fragmentos del 0,100 % por ronda, de modo que este checkpoint corresponde a una ronda intermedia de una ejecución más larga. Se restauraron y se expulsaron 927 componentes cada uno, con 12.945.920 parámetros introducidos (0,20 % de los parámetros de proyección densos) y una fracción de parámetros resultante de 0,4998. El ajuste posterior es un LoRA de rango 8 aplicado únicamente sobre los coeficientes por capa, con las bases congeladas y sin alterar el presupuesto de compresión.

Su relevancia es metodológica, no de producto: proporciona métricas de seguridad medidas (ASR de 0,4173 en AdvBench y 0,2684 en StrongREJECT, con un macro de sobrerrechazo de 0,0939 según WildGuard) que permiten estudiar el compromiso entre seguridad y utilidad bajo compresión agresiva. El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y que cualquier checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), con compresión Basis Sharing y bases compartidas sobre grupos de 2 capas adyacentes |
| Parametros totales | 6.738.415.616 según safetensors; fracción resultante declarada de 0,4998 respecto a los parámetros densos del modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se listan variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (se incluyen LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors, cargable con transformers |
| Tamano del repositorio | 13,5 GB |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE y 4096 tokens de contexto. Sobre ese checkpoint se aplica una compresión estructural denominada Basis Sharing, descrita en un trabajo de ICLR 2025, que factoriza las matrices de proyección por SVD y comparte las bases entre grupos de 2 capas adyacentes, eliminando el 50,00 % de los parámetros densos. Sobre el modelo comprimido se ejecuta una edición iterativa de parámetros: en cada ronda se expulsan y se insertan componentes según un valor de intercambio de tipo net (suma del valor de inserción y del valor de eliminación del descarte ordenado por sigma), con un presupuesto del 0,100 % de los parámetros densos por ronda. Este checkpoint incorpora 2 de las 10 rondas de la ejecución completa, con 927 componentes restaurados y 927 expulsados, y 12.945.920 parámetros finales intercambiados.

La selección de qué componentes restaurar la determina la regla swapgapnet_iter, que es precisamente la variable experimental que este artefacto aísla frente a otras reglas de la misma rejilla. Tras la edición se aplica una recuperación ligera con LoRA de rango 8 restringida a los coeficientes por capa, manteniendo las bases congeladas y el presupuesto de compresión intacto: 2 épocas, tasa de aprendizaje 0,0001, batch de 64 y el dataset alpaca-cleaned. La semilla empleada es 42. No se documentan en la model card el volumen total de tokens de entrenamiento del modelo base, la composición completa del dataset ni si hubo fases de RLHF o DPO específicas para esta variante.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat, aunque degradada por la compresión y por la edición de parámetros.
- Respuesta a instrucciones de tipo chat con formato de diálogo de Llama 2.
- Comportamiento de rechazo de peticiones dañinas, pero con una tasa de éxito de ataque elevada (ASR de 0,4173 en AdvBench), por lo que la capacidad de seguridad está mermada respecto al modelo base.
- Capacidad de servir como sujeto experimental para medir seguridad: es su función principal declarada.
- Soporte de tool calling o function calling: no disponible, no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se documenta.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es exclusivamente de texto.
- No se documentan capacidades específicas de código o matemáticas para esta variante.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint como celda de control dentro de la rejilla de reglas de selección (swapgapnet_iter frente a gap o swapdisc) para cuantificar cuánta seguridad se recupera por ronda de edición con un presupuesto fijo del 0,100 % de parámetros densos.
- Auditoría de robustez frente a jailbreaks: ejecutar AdvBench y StrongREJECT sobre este checkpoint y sobre el modelo denso sin comprimir para medir el incremento de ASR atribuible a la compresión al 50 % y a la restauración parcial.
- Estudio de sobrerrechazo: emplear la métrica macro de sobrerrechazo de WildGuard (0,0939) para analizar el equilibrio entre rechazar peticiones dañinas y rechazar peticiones legítimas tras la edición de parámetros.
- Análisis de interpretabilidad de componentes: aprovechar que el checkpoint identifica explícitamente 927 componentes restaurados y 927 expulsados, con la regla de selección documentada, para estudiar qué direcciones de las bases SVD concentran el comportamiento de seguridad.
- Reproducción experimental: la semilla (42), el presupuesto por ronda, el número de rondas aplicadas y los hiperparámetros del LoRA de recuperación están documentados, lo que permite reproducir la celda y compararla con las rondas 1 a 10 de la ejecución completa.
- Evaluación de pipelines de moderación: usar este modelo como generador adversario de bajo coste en pruebas de sistemas de filtrado, dado que su tasa de éxito de ataque es conocida y medible.
- Docencia y divulgación técnica: ilustrar en un entorno controlado cómo una compresión del 50 % de los parámetros altera propiedades de alineación sin destruir la fluidez del modelo.
- Benchmarking de herramientas de compresión: servir de referencia cuantitativa para comparar Basis Sharing con otras técnicas de poda o factorización sobre Llama-2-7b-chat.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de seguridad, todas ellas medidas con el juez de HarmBench o WildGuard. No se han publicado resultados de benchmarks de conocimiento, razonamiento o código (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,4173 | HarmBench judge |
| StrongREJECT ASR | 0,2684 | HarmBench judge |
| Macro over-refusal | 0,0939 | WildGuard |

No se dispone de los valores equivalentes para el modelo base meta-llama/Llama-2-7b-chat-hf en la información proporcionada, por lo que no es posible calcular aquí el delta exacto atribuible a la compresión.

## Requisitos de hardware

- El repositorio de safetensors ocupa 13,5 GB, coherente con pesos en precisión de 16 bits para el recuento de 6.738.415.616 parámetros reportado. En ese escenario, la inferencia en fp16 requiere aproximadamente 14 GB solo para pesos, más el caché KV correspondiente a 4096 tokens de contexto.
- Si la estructura comprimida implica realmente una fracción de 0,4998 de los parámetros densos (~3,37 mil millones efectivos), los pesos en fp16 ocuparían del orden de 6,7 GB, con lo que cabrían en GPU de consumo de 8 GB o más.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para el escenario de 13,5 GB de pesos; RTX 3090 (24 GB) también resulta suficiente en ese caso.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, ajustado) si los pesos son realmente la mitad; en el escenario de pesos completos de 13,5 GB, una GPU de 16 GB queda muy justa y conviene cuantizar o usar offload.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (el modelo lleva la etiqueta endpoints_compatible y text-generation-inference), y servidores compatibles con safetensors como vLLM.
- No se publican variantes GGUF, por lo que llama.cpp u Ollama requerirían una conversión manual previa.
- Latencia y throughput estimados: no disponibles. No se han publicado medidas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Metrica de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| svd-safety-l2_basis_remove50_swapgapnet_b010_r02 | 6.738.415.616 declarados; fraccion 0,4998 | 4096 | Basis Sharing al 50 % + 2 rondas de swap | AdvBench ASR 0,4173; StrongREJECT ASR 0,2684; over-refusal 0,0939 | Llama 2 Community | HuggingFace, autor Jeesup |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6.738.415.616 | 4096 | ninguna | no disponible en esta informacion | Llama 2 Community | HuggingFace, Meta |
| Jeesup/svd-safety-l2_remove50_gap_b010 | no disponible | no disponible | Basis Sharing al 50 % con regla gap | no disponible en esta informacion | Llama 2 Community | HuggingFace, autor Jeesup |
| Jeesup/svd-safety-l2_remove50_swapdisc_b010 | no disponible | no disponible | Basis Sharing al 50 % con regla swapdisc | no disponible en esta informacion | Llama 2 Community | HuggingFace, autor Jeesup |

Los dos últimos son celdas hermanas de la misma rejilla experimental y solo se diferencian en la regla de selección de componentes (gap y swapdisc frente a swapgapnet_iter), lo que los convierte en la comparación más directa posible para aislar el efecto de dicha regla.

## Limitaciones y advertencias

- No es un modelo desplegable: el autor lo describe explícitamente como artefacto de investigación y sujeto experimental, no como asistente de propósito general.
- Varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataque.
- La seguridad medida es deficiente para uso real: AdvBench ASR de 0,4173 implica que aproximadamente el 42 % de los ataques del conjunto tienen éxito según el juez de HarmBench.
- Riesgo de alucinación: no cuantificado en la información disponible, pero previsiblemente igual o superior al del modelo base tras eliminar el 50 % de los parámetros.
- Discrepancia de metadatos a verificar: el recuento de parámetros de safetensors (6.738.415.616) coincide exactamente con el de Llama-2-7b-chat denso, mientras que la model card declara una fracción resultante de 0,4998. Conviene inspeccionar la forma real de los tensores antes de asumir un ahorro de memoria o de cómputo.
- Licencia: Llama 2 Community License, con LICENSE.txt y USE_POLICY.md incluidos en el repositorio. El uso comercial está sujeto a los términos y restricciones de dicha licencia, incluida la cláusula de atribución y las limitaciones de escala.
- Idiomas soportados no declarados; el ajuste de recuperación se hizo sobre alpaca-cleaned, mayoritariamente en inglés, por lo que el rendimiento fuera del inglés es incierto.
- Cohorte de descargas y likes nula en el momento de la consulta (0 descargas, 0 likes), sin validación comunitaria ni informes de terceros.
- Es un checkpoint intermedio (ronda 2 de 10), no el resultado final de la ejecución completa, por lo que sus métricas no representan el punto de máximo presupuesto de restauración.
- Idioma de la model card en inglés y ausencia de documentación sobre sesgos demográficos, toxicidad o evaluación de sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Celda hermana con regla gap: https://huggingface.co/Jeesup/svd-safety-l2_remove50_gap_b010
- Celda hermana con regla swapdisc: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_b010
- Ficha de terceros sobre la celda swapdisc: https://free2aitools.com/model/jeesup/svd-safety-l2_remove50_swapdisc_b010
- Paper de Basis Sharing (ICLR 2025): referencia citada en la model card, URL no disponible en la información proporcionada
- Repositorio de código del estudio: no disponible en la información proporcionada
