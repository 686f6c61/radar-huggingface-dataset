# CodeLordHari/Qwen2.5-3B-Central-GovSchemes-LoRA

## Resumen

Qwen2.5-3B-Central-GovSchemes-LoRA es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct, publicado por el usuario CodeLordHari en HuggingFace. Se ha entrenado a partir de la variante ya cuantizada a 4 bits `unsloth/Qwen2.5-3B-Instruct-bnb-4bit` utilizando la libreria Unsloth junto con TRL de HuggingFace. Segun la model card, el entrenamiento fue "2x mas rapido" gracias a las optimizaciones de Unsloth, aunque no se detalla ni el dataset, ni el numero de pasos, ni la tecnica de alineacion empleada.

El nombre del repositorio sugiere que el ajuste se orienta a un dominio especifico: esquemas o programas de gobierno central (presumiblemente planes de ayuda social de la India, aunque esto es una inferencia a partir del nombre y no se confirma en la model card). El modelo conserva la arquitectura Qwen2 del modelo base, con 3.085.938.688 parametros totales, y el tamano del repositorio (6,3 GB) indica que los pesos se han fusionado en precision de 16 bits, pese a que el nombre incluya el sufijo "LoRA".

Se trata de un modelo recien publicado (0 descargas y 0 "likes" en el momento de la consulta), sin resultados de evaluacion publicados, lo que limita su uso en produccion sin una validacion previa. Su licencia Apache 2.0 y su tamano compacto lo hacen atractivo para despliegues en hardware de gama de consumo y para experimentacion rapida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2; heredada del modelo base Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no confirmada en la model card; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens de forma nativa (ampliable con YaRN) |
| Tipos de cuantizacion | no disponible en el repositorio (pesos aparentemente en bf16/fp16, ~6,3 GB); admite cuantizacion externa a GGUF, AWQ o GPTQ |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B-Instruct: un transformer decoder-only de 3.085.938.688 parametros, con normalizacion RMSNorm, activacion SwiGLU y atencion con consultas agrupadas (GQA). No se han introducido cambios arquitectonicos respecto al modelo base; el trabajo realizado es exclusivamente un ajuste fino por adaptacion de bajo rango (LoRA) sobre la variante cuantizada a 4 bits del Instruct.

El entrenamiento se llevo a cabo con Unsloth y la libreria TRL de HuggingFace, partiendo de `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`. La model card no especifica el conjunto de datos, la composicion del mismo, el numero de tokens de entrenamiento, la longitud de secuencia, los hiperparametros ni si se aplico RLHF o DPO posterior. Tampoco aclara si los adaptadores LoRA se han fusionado con los pesos base (el tamano del repositorio, 6,3 GB, apunta a que si). Como resultado, no es posible evaluar la calidad del ajuste ni su grado de sobreajuste al dominio a partir de la informacion publicada.

## Capacidades

Las capacidades heredadas del modelo base Qwen2.5-3B-Instruct son las siguientes, si bien el ajuste fino puede haber alterado su comportamiento:

- Generacion de texto e instrucciones conversacionales (caracter "Instruct").
- Razonamiento basico y resolucion de problemas de matematicas de complejidad baja o media.
- Generacion y comprension de codigo en lenguajes habituales (Python, JavaScript, etc.), con calidad limitada por el tamano de 3B.
- Soporte de tool calling / function calling, presente en la familia Qwen2.5-Instruct en su version base (no verificado en este fine-tune).
- Capacidades multilingues del modelo base (Qwen2.5 cubre decenas de idiomas), aunque la model card declara unicamente ingles (`en`) para este ajuste.
- Especializacion tematica aparente en "esquemas de gobierno central", inferida del nombre del repositorio; no confirmada en la documentacion.
- No se mencionan capacidades de vision, audio, modo "thinking" explicito ni decodificacion especulativa.

## Casos de uso

- Asistente de informacion sobre programas gubernamentales: si el ajuste cumple lo que sugiere su nombre, podria responder consultas sobre requisitos, plazos y documentacion de esquemas de gobierno central. Requiere validacion previa contra fuentes oficiales por riesgo de respuestas desactualizadas.
- Chatbot de atencion ciudadana: con un contexto de 32.768 tokens heredado del base, puede gestionar conversaciones multi-turno con historial largo, siempre que se verifique la correccion factual.
- Clasificacion y extraccion de informacion de formularios o textos administrativos: el modelo puede resumir y extraer campos de documentos, integrarse en un pipeline de preprocesado en Python.
- Generacion de respuestas FAQ: para portales institucionales que precisen respuestas predefinidas a preguntas frecuentes sobre ayudas o subsidios.
- Prototipado rapido en hardware de consumo: por su tamano (3B), sirve para validar ideas de producto en una unica GPU de gama media antes de escalar a modelos mayores.
- Base para nuevo ajuste fino (fine-tuning adicional): dado que parte de un Instruct generalista y tiene licencia Apache 2.0, es un punto de partida comodo para especializaciones ulteriores con Unsloth o PEFT.
- Evaluacion comparativa de tecnicas LoRA: util como caso de estudio de ajuste eficiente con Unsloth, midiendo degradacion frente al modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio no presenta evaluaciones comparativas frente al modelo base ni frente a alternativas.

## Requisitos de hardware

Los calculos siguientes son estimaciones derivadas del numero de parametros y del tamano del repositorio, no mediciones publicadas por el autor:

- Inferencia en bf16/fp16: aproximadamente 6,2 GB solo para pesos; con cache KV y overhead se recomienda un minimo de 8-10 GB de VRAM.
- Inferencia en int8: en torno a 3,5 GB de pesos, factible en GPUs con 6 GB o mas.
- Inferencia en int4 (GGUF Q4_K_M): alrededor de 2 GB de pesos, cabria en GPUs de 4-6 GB e incluso en CPU con llama.cpp.
- GPUs recomendadas: cualquier GPU de 8 GB o mas funciona; una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB permiten holgura y mayor longitud de contexto. Para produccion con vLLM, una A100 o H100 aporta mas throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna de 8 GB o superior usando cuantizacion, y en 6 GB en int4.
- Opciones de despliegue: vLLM y TGI (el repositorio incluye la etiqueta `text-generation-inference`), llama.cpp/Ollama (requiere conversion a GGUF), Transformers nativo con `safetensors`, y Unsloth para nuevo entrenamiento.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| Qwen2.5-3B-Central-GovSchemes-LoRA (este) | 3,09 B | no confirmado (base: 32.768) | en (segun card) | Apache 2.0 |
| Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 (ampliable) | multilingue (decenas de idiomas) | Apache 2.0 |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 | multilingue (8 idiomas oficiales) | Llama 3.2 Community License |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 | multilingue | MIT |
| Gemma-2-2B-it | 2,6 B | 8.192 | multilingue | Gemma Terms |

Frente a estas alternativas, el modelo aqui descrito aporta una especializacion de dominio no verificada y carece de evaluaciones publicas, por lo que su ventaja competitiva no puede cuantificarse. El contexto de 128.000 tokens de Llama-3.2-3B y Phi-3.5-mini es notablemente superior para tareas con documentacion extensa.

## Limitaciones y advertencias

- Sesgos: no se han documentado analisis de sesgo; al heredar de Qwen2.5-3B-Instruct arrastra los sesgos del corpus del modelo base, no auditados aqui.
- Alucinacion: riesgo elevado en un modelo de 3B, especialmente en un dominio factual administrativo donde las respuestas incorrectas pueden tener consecuencias reales.
- Contexto e idioma: la model card solo declara ingles; el uso en castellano no esta garantizado aunque el base sea multilingue. La longitud de contexto no se confirma para el fine-tune.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base (Qwen2.5) y los pesos generados no impongan condiciones adicionales; Qwen2.5 se distribuye tambien bajo Apache 2.0.
- Datos del ajuste: sin informacion sobre el dataset, no puede garantizarse la actualidad ni la exactitud de la informacion sobre programas gubernamentales, que ademas cambia con frecuencia.
- Validacion nula: con 0 descargas y 0 "likes", el modelo no ha sido probado por terceros; su calidad real es desconocida.
- Origen cuantizado: partir de `bnb-4bit` puede introducir degradaciones respecto a un fine-tune sobre pesos en precision completa, especialmente en tareas que requieren matices.
- Nombre "LoRA" frente a pesos fusionados: el tamano del repositorio indica pesos fusionados, no adaptadores; esto debe tenerse en cuenta al integrarlo o al intentar aplicarlo sobre otro base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CodeLordHari/Qwen2.5-3B-Central-GovSchemes-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl

No se han encontrado papers, blogs, demos ni otros enlaces relevantes en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
