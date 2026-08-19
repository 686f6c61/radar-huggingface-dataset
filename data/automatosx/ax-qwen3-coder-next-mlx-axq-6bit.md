# AutomatosX/AX-Qwen3-Coder-Next-MLX-AXQ-6bit

## Resumen

AX-Qwen3-Coder-Next-MLX-AXQ-6bit es un checkpoint cuantizado con precisión mixta del modelo Qwen/Qwen3-Coder-Next, desarrollado por AutomatosX para ejecutarse de forma eficiente en hardware Apple Silicon mediante la librería MLX. Utiliza el cuantizador AXQuant (AXQ) en su versión 1.2.0, que asigna diferentes precisiones (4, 6, 8 bits y bf16) a distintos tensores, manteniendo capas sensibles (embeddings, normas, etc.) en mayor precisión. El modelo base es una arquitectura de mezcla de expertos (MoE) con 79.67 mil millones de parámetros lógicos, y esta versión cuantizada reduce el almacenamiento a aproximadamente 59.75 GB en formato Safetensors.

La relevancia de este modelo radica en que permite ejecutar un LLM de gran tamaño orientado a código y razonamiento en equipos Apple con memoria unificada, sin necesidad de GPUs dedicadas. El checkpoint está diseñado para su uso con MLX-LM, ofreciendo una ventana de contexto configurada de hasta 262,144 tokens, aunque el límite práctico depende de la memoria disponible. Es importante señalar que este paquete se presenta como evidencia de desarrollo, no como una versión certificada de AXQuant, y no incluye métricas de calidad ni validación de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3NextForCausalLM (mixture of experts, MoE) |
| Parametros totales | 79.67B (logicos) |
| Parametros activos | no disponible |
| Longitud de contexto | 262,144 tokens (configurado; limite practico segun memoria) |
| Tipos de cuantizacion | AXQuant mixed-precision: 4bit, 6bit, 8bit, bf16 (BPW total medido: 5.9990) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX Safetensors (no PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-Next es un transformer de tipo MoE con 79.67B parametros logicos, optimizado para tareas de codigo y razonamiento. Este checkpoint no ha sido entrenado desde cero, sino que es una conversion cuantizada del checkpoint BF16 original, utilizando AXQuant 1.2.0. La cuantizacion se realiza sin calibracion, basandose en priors de arquitectura, y aplica proteccion a tensores criticos (embeddings, normas, etc.) que se mantienen en mayor precision. El layout de cuantizacion es el siguiente: 37.81% de los parametros en 4bit, 61.34% en 6bit, 0.45% en 8bit y 0.39% en bf16. No se incluyen sidecars de vision ni de multi-token prediction (MTP). No se dispone de informacion sobre el proceso de entrenamiento del modelo original (tokens, dataset, metodos de alineacion como RLHF o DPO).

## Capacidades

- Generacion de texto y conversacion: al ser un modelo de lenguaje de gran tamano, es capaz de producir respuestas coherentes y contextualizadas en tareas de texto.
- Razonamiento y resolucion de problemas: hereda las capacidades del modelo base Qwen3-Coder-Next, que esta disenado para tareas de razonamiento complejo y logica.
- Generacion de codigo: el nombre "Coder" indica una especializacion en programacion, aunque no se detallan metricas especificas en la documentacion.
- Soporte multilingue: no especificado en la informacion disponible.
- Tool calling / function calling: no documentado en esta version.
- Capacidades de agente: no documentado.
- Modo vision: no incluido (no hay sidecar de vision).
- Multi-token prediction (MTP): no incluido (MTP presente: False).

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar fragmentos de codigo, completar funciones o sugerir implementaciones en multiples lenguajes, aprovechando su especializacion en codigo y su gran tamano para entender contextos amplios.
- Asistente de programacion en entornos Apple: al ejecutarse localmente con MLX, puede integrarse en IDEs o terminales en Macs con suficiente memoria unificada, ofreciendo respuestas sin depender de la nube.
- Generacion de documentacion tecnica: puede redactar comentarios, docstrings o documentacion de proyectos a partir de descripciones de funciones o modulos.
- Analisis y refactorizacion de codigo: con su contexto de 262k tokens, puede procesar archivos largos o multiples archivos para identificar patrones, sugerir mejoras o detectar posibles errores.
- Razonamiento logico y matematico: util para resolver problemas de logica, explicar conceptos o realizar calculos, aunque no se han publicado benchmarks especificos.
- Prototipado rapido de aplicaciones: permite generar esqueletos de aplicaciones, scripts o configuraciones a partir de descripciones de alto nivel, acelerando el ciclo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha medido la calidad frente a lineas base BF16 o uniformes, ni se ha evaluado el rendimiento en contexto largo o velocidad de kernels. Por tanto, no se presentan tablas de comparacion.

## Requisitos de hardware

- El modelo esta diseñado para Apple Silicon (M1, M2, M3 o posteriores) con MLX.
- Peso del safetensors: 59.75 GB. Se recomienda al menos 64 GB de memoria unificada para cargar el modelo en memoria, aunque para un uso comodo con contexto largo se sugiere 128 GB o mas.
- No se proporcionan requisitos de VRAM especificos, pero al ser MLX, la memoria unificada del chip es la que se utiliza.
- Ejecucion recomendada con MLX-LM (version 0.31.3 registrada) mediante el comando `mlx_lm.generate`.
- No se establece compatibilidad con el motor nativo AX Engine (no se incluye manifest validado).
- Latencia y throughput: no medidos ni publicados.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros modelos en la documentacion. El modelo base Qwen3-Coder-Next podria compararse con otros modelos de codigo como CodeLlama o DeepSeek-Coder, pero no hay datos en la informacion suministrada.

## Limitaciones y advertencias

- El paquete no esta certificado: no se han cerrado los procesos formales de validacion AXQuant (M0-M8).
- No se publican metricas de calidad, por lo que no se puede garantizar que el rendimiento sea equivalente al modelo BF16 original.
- La capacidad de contexto de 262,144 tokens es un valor de configuracion, no una validacion de que el modelo funcione correctamente en esa longitud.
- No incluye soporte de vision ni MTP, por lo que no se pueden usar esas funcionalidades.
- El motor nativo AX Engine no esta validado; la ejecucion se limita al camino estandar de MLX-LM.
- No se especifican los idiomas soportados, lo que puede limitar su uso en aplicaciones multilingues.
- El uso comercial esta permitido bajo licencia Apache-2.0, pero al no haber garantias de calidad, se recomienda validar el modelo en el caso de uso concreto antes de desplegarlo en produccion.
- El tamaño del repositorio es de 216.5 GB (incluye posiblemente otras versiones o metadatos), pero la descarga del checkpoint es de aproximadamente 59.85 GB.

## Enlaces

- [HuggingFace: AutomatosX/AX-Qwen3-Coder-Next-MLX-AXQ-6bit](https://huggingface.co/AutomatosX/AX-Qwen3-Coder-Next-MLX-AXQ-6bit)
- [Modelo base: Qwen/Qwen3-Coder-Next](https://huggingface.co/Qwen/Qwen3-Coder-Next)
- [Coleccion de modelos MLX de AutomatosX](https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog)
