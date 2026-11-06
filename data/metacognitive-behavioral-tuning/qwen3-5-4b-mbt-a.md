# metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-A

## Resumen

Qwen3.5-4B-MBT-A es un ajuste fino de instrucciones (SFT) del modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el grupo de investigacion metacognitive-behavioral-tuning. El modelo forma parte de un estudio comparativo sobre destilacion de comportamientos metacognitivos: concretamente, se entrena sobre trazas de razonamiento editadas por un agente de codificacion que inserta pasajes en un fichero gestionado con git, un commit por insercion (metodo MBT-A, "agentic"). El objetivo es transferir a un modelo pequeno patrones de razonamiento mas reflexivos y estructurados que los que produce el profesor original.

El modelo tiene 4.539.265.536 parametros (aproximadamente 4,5 mil millones) en precision bf16, con pesos en formato safetensors y un tamano de repositorio de 9,1 GB. Se distribuye bajo licencia Apache-2.0, heredada del modelo base, y esta pensado para generacion de texto y razonamiento con cadenas de pensamiento largas, matematicas y metacognicion. Su relevancia actual reside en que documenta una tecnica de destilacion basada en edicion agentica de trazas, un enfoque poco habitual frente al filtrado o reescritura clasicos de datos de destilacion.

La model card indica que el modelo se entrena con perdida solo sobre tokens del asistente, 15 epocas, optimizador Muon y una longitud maxima de 131.072 tokens. El modelo se publica junto a tres variantes hermanas (Unedited-SFT, MBT-R y MBT-I) que permiten aislar el efecto de cada estrategia de edicion de trazas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, segun tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens en entrenamiento; la model card no especifica el contexto maximo de inferencia |
| Tipos de cuantizacion | Pesos publicados en bf16; no se enumeran cuantizaciones oficiales (GGUF, AWQ, GPTQ no disponibles) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (datos de entrenamiento CC BY-SA 4.0) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base, un transformer decoder-only de la familia Qwen3.5. La model card no detalla la arquitectura interna (atencion, capas, cabezas) ni la composicion del corpus de preentrenamiento del modelo base, por lo que esos datos deben considerarse no disponibles. Lo que si se especifica es el proceso de ajuste fino: SFT de parametros completos con perdida calculada unicamente sobre los tokens del asistente, 15 epocas, optimizador Muon en implementacion Megatron, tasa de aprendizaje 1e-5 constante con 40 pasos de calentamiento, weight decay 0, batch global de 64 secuencias (8 GPU x 8 pasos de acumulacion) con empaquetado sin padding, longitud maxima de 131.072 tokens y autocast bf16 con pesos maestros en fp32.

La innovacion principal no esta en la arquitectura sino en la construccion de los datos. Las trazas de entrenamiento provienen del dataset `metacognitive-behavioral-tuning/mbt-traces` y se editan mediante un agente de codificacion que trata la traza como un fichero de un repositorio git: cada insercion de un pasaje es un commit independiente (MBT-A). Esto contrasta con las variantes MBT-R (reescritura) y MBT-I (insercion directa) y con la linea base Unedited-SFT, que usa trazas del profesor sin editar. La model card no indica si se aplico RLHF o DPO adicional; el metodo descrito es exclusivamente SFT.

## Capacidades

- Generacion de texto conversacional y razonamiento paso a paso, con plantilla de chat que abre un bloque `<think>` explicito antes de la respuesta final.
- Razonamiento matematico: el ejemplo de uso de la model card resuelve un problema de restos modulares (`2^100 mod 7`) pidiendo la respuesta dentro de `\boxed{}`.
- Razonamiento metacognitivo: el entrenamiento busca inducir comportamientos de verificacion y reflexion sobre el propio proceso, segun la linea de investigacion del autor.
- Respuestas largas: el autor advierte que son habituales las decenas de miles de tokens de salida, con `max_tokens` de ejemplo fijado en 122.880.
- Entrada multimodal: el tag `image-text-to-text` aparece en los metadatos de Hugging Face, aunque la model card no documenta capacidades de vision ni ejemplos de uso con imagenes; debe tratarse con cautela.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no se documenta de forma explicita en la model card.
- Capacidades multilingues: limitadas al ingles segun el campo `language`; no se documenta soporte de castellano.

## Casos de uso

- Resolucion de problemas matematicos con traza verificable: el modelo genera cadenas de razonamiento largas y cierra con la respuesta en `\boxed{}`, lo que facilita la extraccion automatica y la auditoria del resultado en plataformas de evaluacion tipo MATH o GSM8K.
- Investigacion sobre destilacion de razonamiento: sirve como punto de comparacion controlado frente a Unedited-SFT, MBT-R y MBT-I para medir el efecto de la edicion agentica de trazas en el rendimiento downstream.
- Generacion de datos sinteticos de razonamiento: sus trazas largas y estructuradas pueden reutilizarse como material de entrenamiento o evaluacion para modelos mayores o para pipelines de anotacion.
- Asistentes de estudio con explicacion extendida: en entornos donde el usuario valora ver el razonamiento completo antes de la respuesta, el bloque `<think>` permite separar proceso y conclusion.
- Evaluacion de robustez metacognitiva: util para experimentos que miden si el modelo detecta errores en su propio razonamiento o si introduce pasos de verificacion espontaneos.
- Despliegue en infraestructura modesta: con 4,5 mil millones de parametros en bf16, cabe en una sola GPU de 24 GB y permite servir inferencia con vLLM en entornos de investigacion con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con las variantes hermanas o con el modelo base.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,1 GB solo para pesos; con cache KV para contextos de decenas de miles de tokens, el consumo crece de forma significativa y puede superar los 24 GB en generaciones muy largas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5 GB para pesos (no hay versiones oficiales publicadas; requeriria cuantizacion propia).
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2,5-3 GB para pesos, mas cache KV (igualmente, sin version oficial).
- GPU recomendadas: A100 40/80 GB o H100 para servir contextos largos con vLLM; RTX 4090 (24 GB) es viable para bf16 con contextos moderados.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y tarjetas con 24 GB o mas para bf16; en tarjetas de 12-16 GB seria necesario cuantizar.
- Opciones de despliegue: vLLM es la via documentada por el autor (ejemplo con `LLM` y `SamplingParams`); llama.cpp, Ollama y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo advierte que las respuestas largas son frecuentes y que hay que reservar espacio para decenas de miles de tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-MBT-A | 4,54 B | 131.072 (entrenamiento) | Apache-2.0 | SFT sobre trazas editadas por agente (MBT-A) |
| Qwen3.5-4B-Unedited-SFT | no disponible | no disponible | Apache-2.0 (presumible, mismo autor) | SFT sobre trazas del profesor sin editar |
| Qwen3.5-4B-MBT-R | no disponible | no disponible | Apache-2.0 (presumible, mismo autor) | SFT sobre trazas reescritas (MBT-R) |
| Qwen3.5-4B-MBT-I | no disponible | no disponible | Apache-2.0 (presumible, mismo autor) | SFT sobre trazas con insercion directa (MBT-I) |

Las tres variantes hermanas comparten modelo base y licencia, por lo que constituyen la comparacion natural para aislar el efecto del metodo de edicion. No se dispone de datos de rendimiento comparativo ni de comparaciones con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3.5-4B-Base y entrenarse solo en ingles, hereda los sesgos del corpus del modelo base y del profesor.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; las trazas largas de razonamiento pueden contener pasos plausibles pero incorrectos, especialmente en matematicas y logica.
- Limitacion de idioma: el modelo solo declara soporte de ingles; su uso en castellano no esta validado y probablemente degrade la calidad.
- Longitud de salida: el propio autor advierte que las respuestas pueden ocupar decenas de miles de tokens, lo que encarece la inferencia y complica su uso en produccion con latencia estricta.
- Ambiguedad multimodal: el tag `image-text-to-text` sugiere capacidad de vision, pero la model card no la documenta ni la ejemplifica; no debe asumirse en produccion.
- Licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir-igual sobre derivados de los datos; conviene revisar la ficha del dataset.
- Estado de la publicacion: el paper asociado figura como envio anonimo en revision, por lo que los resultados pueden cambiar y no hay revision por pares disponible.
- Madurez: 210 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-A
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Variante Unedited-SFT: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-Unedited-SFT
- Variante MBT-R: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-R
- Variante MBT-I: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-I
- Dataset de trazas: https://huggingface.co/datasets/metacognitive-behavioral-tuning/mbt-traces
- Codigo y prompts: https://github.com/metacognitive-behavioral-tuning/metacognitive-behavioral-tuning
