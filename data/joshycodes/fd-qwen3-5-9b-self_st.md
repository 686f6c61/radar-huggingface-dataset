# joshycodes/fd-qwen3.5-9b-self_st

## Resumen

`joshycodes/fd-qwen3.5-9b-self_st` es un checkpoint derivado de Qwen/Qwen3.5-9B, publicado por el usuario joshycodes en Hugging Face. El repositorio contiene pesos en formato safetensors con 9.653.104.368 parametros (aproximadamente 9,65 mil millones) y un tamano total de 19,3 GB, cifra coherente con pesos almacenados en BF16/FP16 sin cuantizar. La etiqueta `qwen3_5` identifica la familia arquitectonica, y el modelo base se describe en documentacion de terceros (NVIDIA Jetson AI Lab) como un modelo denso de vision-lenguaje orientado a razonamiento, comprension visual y comportamiento agentico.

Se trata de un checkpoint de investigacion con muy baja traccion: 14 descargas y 0 likes desde su creacion el 4 de octubre de 2026. El autor mantiene otros repositorios de la misma linea (`feather-f3-mt`, `feather-f3-mt-sft-plain`) que documentan entrenamiento continuado sobre corpus auto-generados, lo que situa a esta publicacion en el ambito de la experimentacion con autoentrenamiento y ajuste sobre modelos Qwen3.5, no en el de un modelo listo para produccion.

La relevancia actual es limitada y de nicho: sirve como referencia para quien investigue tecnicas de continued pretraining y self-training sobre la familia Qwen3.5, pero carece de ficha tecnica publicada, licencia declarada, idiomas documentados y resultados de evaluacion. Cualquier uso en produccion exigiria verificar primero la licencia heredada del modelo base y validar el comportamiento del checkpoint con evaluaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen3.5 (segun etiqueta `qwen3_5`); el modelo base Qwen3.5-9B se describe como modelo denso de vision-lenguaje en documentacion de NVIDIA |
| Parametros totales | 9.653.104.368 (aproximadamente 9,65 B) |
| Parametros activos | No aplica (no hay evidencia de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para este checkpoint; en el ecosistema Qwen3.5-9B se citan checkpoints W4A16 (Jetson Orin) y NVFP4 (Jetson Thor) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de 19,3 GB) |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna de este checkpoint mas alla de la etiqueta `qwen3_5`, que lo vincula a la familia Qwen3.5. El modelo base Qwen3.5-9B se describe como denso y multimodal (vision-lenguaje), con enfasis en razonamiento, comprension visual y comportamiento agentico. El recuento de parametros (9,65 B) y el tamano del repositorio (19,3 GB, equivalente a 2 bytes por parametro) indican que los pesos se distribuyen en BF16 o FP16 y que no se ha publicado una version cuantizada dentro del propio repositorio.

No hay informacion publicada sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni sobre si se aplicaron fases de RLHF, DPO u otro ajuste por preferencias. Los repositorios hermanos del mismo autor (`joshycodes/qwen3.5-9b-feather-f3-mt`) documentan entrenamiento continuado de pesos completos con learning rate 1e-05, 1 epoca, 8.309.133 tokens y 8.591 documentos sobre corpus auto-generados, pero esos hiperparametros corresponden a dichos checkpoints y no deben atribuirse a `fd-qwen3.5-9b-self_st`. El sufijo `self_st` sugiere una variante de autoentrenamiento (self-training), si bien esto es una inferencia a partir del nombre y no un dato confirmado.

## Capacidades

- Generacion de texto y razonamiento: heredadas, en principio, del modelo base Qwen3.5-9B; no verificadas para este checkpoint concreto.
- Comprension visual: el modelo base de la familia se describe como vision-lenguaje, por lo que es plausible que el checkpoint conserve capacidad de procesamiento de imagenes, aunque no esta confirmado ni documentado.
- Comportamiento agentico y razonamiento multi-paso: descrito para el modelo base, no validado en este checkpoint.
- Tool calling / function calling: no documentado para este repositorio; el modelo base apunta a capacidades agenticas, pero no hay confirmacion.
- Capacidades multilingues: no disponible.
- Modo "thinking": no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigacion en autoentrenamiento: el checkpoint puede emplearse como punto de partida para reproducir o extender experimentos de self-training sobre modelos Qwen3.5, comparando su comportamiento con el modelo base mediante evaluaciones controladas.
- Fine-tuning especifico de dominio: al ser un checkpoint de 9,65 B en safetensors, admite ajuste supervisado adicional (SFT) o LoRA sobre datos propios, siempre que la licencia heredada lo permita.
- Prototipado local de asistentes conversacionales: con cuantizacion a 4 bits (aproximadamente 5-6 GB) puede ejecutarse en GPUs de consumo y servir para prototipos de chat fuera de produccion.
- Evaluacion comparativa de checkpoints intermedios: util para estudiar como el entrenamiento continuado sobre corpus auto-generados afecta a metricas de calidad, coherencia y alucinacion frente al modelo base.
- Base para pipelines de generacion de codigo o texto tecnico: si el checkpoint conserva las capacidades del modelo base, puede integrarse en flujos de asistencia a la programacion, aunque requeriria validacion previa.
- Analisis de estabilidad en entrenamiento continuado: permite estudiar degradacion de pesos, colapso de formato o perdida de instrucciones tras ajustes de baja tasa de aprendizaje y pocas epocas.
- Experimentacion con despliegue en edge: dado que la familia Qwen3.5-9B cuenta con checkpoints W4A16 y NVFP4 para Jetson Orin y Jetson Thor, este checkpoint podria servir de base para conversiones equivalentes, previa verificacion de compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion para `joshycodes/fd-qwen3.5-9b-self_st` ni en la ficha del repositorio ni en los resultados de busqueda consultados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19,3 GB solo para pesos, mas el cache KV; en la practica, entre 22 y 28 GB segun longitud de contexto y tamano de lote.
- VRAM estimada en cuantizacion INT8: aproximadamente 10-11 GB de pesos mas cache KV.
- VRAM estimada en cuantizacion de 4 bits (Q4, GPTQ/AWQ): aproximadamente 5,5-7 GB de pesos mas cache KV.
- GPU recomendadas para precision completa: A100 40/80 GB, H100 80 GB, L40S 48 GB. En una RTX 4090 de 24 GB cabe con contexto limitado y batch reducido.
- GPU de consumo: viable con cuantizacion de 4 bits en RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 16 GB y RTX 4090 24 GB. En precision completa, solo en GPUs de 24 GB o mas con contexto corto.
- Opciones de despliegue: vLLM y TGI para safetensors en precision completa; llama.cpp y Ollama requieren conversion previa a GGUF; TensorRT-LLM si se generan checkpoints W4A16 o NVFP4 para plataformas Jetson.
- Latencia y rendimiento: no disponibles. No hay mediciones publicadas de tokens por segundo, time-to-first-token ni throughput para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| joshycodes/fd-qwen3.5-9b-self_st | 9,65 B | No disponible | No disponible | Hugging Face, 14 descargas | Checkpoint de investigacion sin evaluacion publicada |
| Qwen/Qwen3.5-9B | No disponible en la informacion recogida | No disponible | No disponible en la informacion recogida | Hugging Face, Fireworks AI, Microsoft Foundry, Jetson AI Lab | Modelo base de la familia; descrito como denso vision-lenguaje con orientacion agentica |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, multiples proveedores | Referencia consolidada de la misma escala; licencia con restricciones para grandes despliegues |
| Mistral 7B v0.3 | 7,25 B | 32.000 tokens | Apache 2.0 | Hugging Face, multiples proveedores | Alternativa de escala similar con licencia permisiva y amplio soporte de herramientas |

La comparacion de rendimiento entre estos modelos no puede realizarse con los datos disponibles, ya que no se han publicado resultados de evaluacion para el checkpoint analizado.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparativas, ni validacion humana publicada; el comportamiento real del checkpoint es desconocido.
- Licencia no declarada: el repositorio no especifica licencia. Al derivar de Qwen/Qwen3.5-9B, es probable que herede las condiciones de dicho modelo base, pero esto debe verificarse antes de cualquier uso comercial.
- Riesgo elevado de alucinacion: los procesos de entrenamiento continuado con corpus auto-generados y tasas de aprendizaje bajas pueden degradar la fidelidad factual y reforzar sesgos presentes en los datos autogenerados.
- Riesgo de colapso de formato o de instrucciones: el ajuste sobre datos sinteticos sin curacion puede provocar respuestas repetitivas, perdida de seguimiento de instrucciones o degradacion del formato de salida.
- Idiomas no documentados: se desconoce si el checkpoint mantiene el soporte multilingue del modelo base o si ha quedado sesgado hacia el idioma del corpus de ajuste.
- Longitud de contexto no confirmada: cualquier caso de uso que dependa de ventanas largas debe validarse empiricamente antes de disenar la arquitectura del sistema.
- Traccion minima: 14 descargas y 0 likes implican ausencia de comunidad, de issues resueltos y de validacion por terceros; no hay soporte ni mantenimiento esperable.
- No apto para produccion sin validacion propia: se recomienda tratarlo como artefacto de investigacion y someterlo a evaluaciones de calidad, seguridad y sesgo antes de cualquier despliegue.
- Compatibilidad de herramientas no garantizada: al no publicarse plantilla de chat, tokenizer documentado ni configuracion de generacion recomendada, la integracion en pipelines existentes puede requerir trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/fd-qwen3.5-9b-self_st
- Repositorio hermano del mismo autor: https://huggingface.co/joshycodes/qwen3.5-9b-feather-f3-mt
- Repositorio hermano con SFT: https://huggingface.co/joshycodes/qwen3.5-9b-feather-f3-mt-sft-plain
- Documentacion de Qwen3.5 9B en NVIDIA Jetson AI Lab: https://github.com/NVIDIA-AI-IOT/jetson-ai-lab/blob/main/src/content/models/qwen3-5-9b.md
- Ficha de Qwen3.5 9B en Fireworks AI: https://fireworks.ai/models/fireworks/qwen3p5-9b
- Catalogo de Qwen3.5 9B en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
