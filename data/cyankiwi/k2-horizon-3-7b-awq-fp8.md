# cyankiwi/K2-Horizon-3.7B-AWQ-FP8

## Resumen

K2-Horizon-3.7B-AWQ-FP8 es una version cuantizada del modelo K2-Horizon-3.7B, publicado por el usuario cyankiwi a partir del checkpoint original de IFM. Se trata del miembro denso mas pequeno de la familia K2-Horizon: un modelo decoder-only con un nucleo de 3,7B parametros y una ventana de contexto nativa de 512K tokens (524.288), mantenida desde las etapas de midtraining. La ficha que nos ocupa no es el modelo base, sino su conversion a precision FP8 mediante calibracion de tipo AWQ, empaquetada en formato compressed-tensors para su uso con transformers.

El interes de esta publicacion radica en tres factores. Primero, el contexto extremo para un modelo de este tamano, poco habitual en la franja de 3-4B. Segundo, el caracter completamente abierto del proyecto base: se liberan datos de preentrenamiento, datos de midtraining, receta de entrenamiento, codigo y recursos de evaluacion. Tercero, la cuantizacion FP8 reduce el peso en disco a unos 6,34 GB y facilita el despliegue en GPUs de gama alta de consumo, a costa de una posible perdida de calidad que no se cuantifica en la informacion disponible.

La relevancia practica es doble: por un lado, sirve como linea base densa para tareas agenticas, de codigo y de razonamiento; por otro, al estar calibrado con un dataset orientado a STEM y flujos agenticos, esta pensado para cargas de trabajo tecnicas. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia k2_horizon) |
| Parametros totales | 5.058.255.360 segun safetensors (nucleo nominal de 3,7B; cifra del checkpoint cuantizado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) nativos desde el midtraining |
| Tipos de cuantizacion | FP8 con calibracion tipo AWQ (formato compressed-tensors); el modelo base se distribuye sin cuantizar |
| Idiomas soportados | La model card lista EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES; las etiquetas de HuggingFace solo declaran EN |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), libreria transformers |
| Tamano del repositorio | 6,4 GB |
| Dataset de calibracion | cyankiwi/calibration (STEM y agentico) |
| Version declarada | 26.05.01 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de tipo k2_horizon, sin mezcla de expertos. El modelo base se entreno en varias fases: una etapa de preentrenamiento sobre IFM/K2-Horizon-Pretrain-Data y una etapa de midtraining sobre IFM/K2-Horizon-Midtrain-Data, en la que se establece la ventana de contexto nativa de 524.288 tokens. El autor del proyecto base publica checkpoints intermedios, lo que permite estudiar la evolucion de capacidades a lo largo del entrenamiento y no solo en el checkpoint final. No se detalla en la informacion disponible el numero total de tokens vistos, la composicion porcentual de los datasets ni si se aplicaron fases de RLHF, DPO u otro ajuste por preferencias.

Sobre esa base, cyankiwi aplica una cuantizacion a FP8 con calibracion de tipo AWQ, empleando un conjunto de calibracion orientado a dominios STEM y agenticos (cyankiwi/calibration). El resultado se empaqueta con compressed-tensors, el formato que transformers y vLLM utilizan para pesos cuantizados. No se especifican en la informacion disponible los detalles de granularidad de la cuantizacion (por tensor, por canal o por grupo), ni si las activaciones tambien se cuantizan o solo los pesos.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado de text-generation y etiqueta conversational.
- Razonamiento y resolucion de problemas evaluados por el autor en benchmarks agenticos y de razonamiento, aunque los resultados numericos no se detallan en la informacion disponible.
- Generacion de codigo y tareas de programacion, con evaluacion declarada en benchmarks de codigo.
- Procesamiento de contextos muy largos (hasta 524.288 tokens) gracias a la ventana nativa del modelo base.
- Capacidades multilingues segun la model card (EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES), con ingles como idioma principal declarado en las etiquetas.
- Soporte de tool calling y function calling: no se menciona explicitamente en la informacion disponible.
- Modo de razonamiento explicito (thinking mode): no se menciona en la informacion disponible.
- Vision o audio: no soportado; el modelo es exclusivamente de texto.
- Publicacion de checkpoints intermedios del modelo base, util para investigacion sobre dinamica de entrenamiento.

## Casos de uso

- Analisis de repositorios y documentacion tecnica extensa: gracias a los 524.288 tokens de contexto, el modelo puede ingerir bases de codigo completas o manuales largos en una sola pasada, sin fragmentacion, y responder preguntas transversales sobre ellos.
- Asistente de desarrollo integrado en IDE: generacion y refactorizacion de codigo en un modelo de 3,7B cuantizado a FP8 que cabe en una GPU de consumo, con latencia adecuada para autocompletado por bloques.
- Procesamiento de contratos y documentacion legal o cientifica: la ventana de contexto permite analizar expedientes completos y extraer clausulas o resultados sin perder el hilo entre secciones distantes.
- Analisis de trazas de agentes y logs de sistema: al estar calibrado con datos agenticos, es adecuado para resumir y diagnosticar secuencias largas de llamadas a herramientas en pipelines de automatizacion.
- Atencion al cliente automatizada: conversaciones multi-turno con historial extenso, donde el contexto largo evita truncar el hilo conversacional y mejora la coherencia.
- Generacion aumentada por recuperacion (RAG) sobre corpus grandes: se pueden inyectar muchos fragmentos recuperados simultaneamente, reduciendo la necesidad de reranking agresivo.
- Prototipado e investigacion en entornos academicos: al ser un modelo denso, pequeno y con licencia Apache 2.0, es viable para experimentos de ajuste fino y ablaciones sin presupuesto de GPU elevado.
- Traduccion y resumen multilingue: la model card declara soporte para diez idiomas, lo que permite tareas de traduccion entre pares de lenguas cubiertos, con la salvedad de que el ingles es el idioma principal.

## Benchmarks y rendimiento

La model card incluye un grafico de resultados y una tabla comparativa, pero la informacion proporcionada se interrumpe antes de los valores numericos, por lo que no es posible reproducir cifras concretas. Si se conoce el conjunto de modelos de referencia empleado en la comparacion y su numero de parametros, que se recoge en la siguiente tabla.

| Modelo | Parametros | Parametros activados |
|---|---|---|
| K2-Horizon-3.7B | 3,7B | 3,7B |
| Qwen3.5-4B | 4B | no disponible |
| G9v3-3B | 3B | no disponible |
| Granite 4.2-3B | 3B | no disponible |
| Nemotron 3 Nano-4B | 4B | no disponible |

Los resultados numericos de MMLU, HumanEval, GSM8K u otros benchmarks no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (FP8, 5,06B parametros): aproximadamente 5,1-6 GB solo para pesos, mas memoria para cache KV y overhead del runtime. Cifra orientativa, no confirmada en la informacion disponible.
- VRAM estimada para el modelo base sin cuantizar en BF16: aproximadamente 10-11 GB para los pesos, mas cache KV.
- Cache KV con contexto de 512K tokens: puede ser muy elevada y depende del numero de capas y cabezas de atencion, dato no disponible. Se recomienda cache KV cuantizada o atencion con ventana deslizante para contextos extremos.
- GPU recomendadas para uso general: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), L40S o A100 40 GB.
- GPU recomendadas para explotar el contexto completo de 512K: A100 80 GB, H100 80 GB o configuraciones multi-GPU, dado el coste de memoria del cache KV.
- Compatibilidad con GPU de consumo: si, en modelos con 12-16 GB o mas de VRAM (RTX 4070 Ti Super, RTX 4080, RTX 4090) para contextos moderados.
- Opciones de despliegue: transformers con compressed-tensors y vLLM son las vias naturales para este formato. llama.cpp y Ollama no son aplicables directamente, ya que requieren pesos en formato GGUF y este repositorio es FP8 compressed-tensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-3.7B-AWQ-FP8 | 5,06B en safetensors (nucleo nominal 3,7B) | 524.288 tokens | safetensors FP8 compressed-tensors | Apache 2.0 | HuggingFace |
| Qwen3.5-4B | 4B | no disponible | no disponible | no disponible | referenciado en la model card |
| G9v3-3B | 3B | no disponible | no disponible | no disponible | referenciado en la model card |
| Granite 4.2-3B | 3B | no disponible | no disponible | no disponible | referenciado en la model card |
| Nemotron 3 Nano-4B | 4B | no disponible | no disponible | no disponible | referenciado en la model card |

Los datos de contexto, licencia y rendimiento de los modelos de referencia no aparecen en la informacion proporcionada; solo se dispone de los nombres y el numero de parametros declarados por el autor en su tabla comparativa.

## Limitaciones y advertencias

- La cuantizacion FP8 introduce una perdida de precision respecto al checkpoint base en BF16 que no se cuantifica en la informacion disponible; conviene validar en la tarea objetivo antes de desplegar.
- Las etiquetas de HuggingFace declaran unicamente ingles, mientras que la model card lista diez idiomas. Existe una discrepancia que sugiere que el rendimiento fuera del ingles puede ser desigual.
- Riesgo de alucinacion inherente a los modelos de 3-4B, mas acusado en tareas de razonamiento complejo o conocimiento factual especializado.
- La ventana de 512K tokens no garantiza atencion efectiva uniforme en todo el rango; es habitual que el rendimiento degrade en el centro del contexto.
- El elevado coste de memoria del cache KV con contexto largo puede obligar a recortar la ventana en la practica, reduciendo la ventaja principal del modelo.
- No se confirma en la informacion disponible el soporte de tool calling, function calling ni modos de razonamiento explicito, capacidades habituales en modelos contemporaneos de la misma franja.
- La licencia Apache 2.0 del checkpoint cuantizado permite uso comercial, pero conviene verificar las condiciones del modelo base IFM/K2-Horizon-3.7B y de los datasets asociados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria sobre su calidad o estabilidad.
- La discrepancia entre el nombre comercial (3,7B) y el recuento de parametros en safetensors (5,06B) no se explica en la informacion disponible.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/cyankiwi/K2-Horizon-3.7B-AWQ-FP8
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Dataset de calibracion de la cuantizacion: https://huggingface.co/datasets/cyankiwi/calibration
- Contacto del autor: ton@cyan.kiwi
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
