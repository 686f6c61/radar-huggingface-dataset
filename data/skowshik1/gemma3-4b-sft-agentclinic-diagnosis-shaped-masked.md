# skowshik1/gemma3-4b-sft-agentclinic-diagnosis-shaped-masked

## Resumen

`skowshik1/gemma3-4b-sft-agentclinic-diagnosis-shaped-masked` es un ajuste fino supervisado (SFT) del modelo multimodal `google/gemma-3-4b-it` de Google, publicado por el usuario skowshik1 en HuggingFace. El entrenamiento se ha realizado con TRL sobre el dataset `skowshik1/gemma3-sft-agentclinic-style-diagnosis-shaped-v2`, un conjunto de datos propio del autor cuyo contenido no se describe en la model card. El nombre del repositorio sugiere un enfoque hacia tareas de diagnostico en un contexto de "agente clinico" y el sufijo "masked" apunta a algun tipo de enmascaramiento en la funcion de perdida o en los datos, pero el autor no documenta ninguno de estos extremos.

Se trata por tanto de un derivado de Gemma 3 4B, un transformer decoder-only multimodal (texto e imagen) con aproximadamente 4.000 millones de parametros y una ventana de contexto de 128.000 tokens en su version original. La relevancia de este checkpoint es limitada por el momento: no tiene descargas ni valoraciones, no publica resultados de evaluacion y no declara licencia. Su interes practico reside en el modelo base subyacente, que si es un modelo abierto de referencia en el rango de 4B para despliegue en hardware de consumo, y en el hecho de que sirve como ejemplo de pipeline SFT reproducible con TRL.

Advertencia importante sobre el repositorio: el tamano declarado del repo es de 0,2 GB, muy inferior a los aproximadamente 8 GB que ocupan los pesos de un modelo de 4B en bf16. Esto es coherente con una subida parcial, con pesos podados/enmascarados o con un artefacto de entrenamiento incompleto, y no con un checkpoint denso completo. Debe verificarse antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (texto e imagen), heredada de google/gemma-3-4b-it; detalles del ajuste no disponibles |
| Parametros totales | No disponible en la ficha del ajuste; el modelo base google/gemma-3-4b-it declara ~4.000 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la ficha del ajuste; el modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible en la ficha del ajuste; el modelo base admite cuantizacion a int8/int4 (bitsandbytes, GPTQ/AWQ) y formatos GGUF generados por terceros |
| Idiomas soportados | No disponible en la ficha del ajuste; el modelo base declara soporte para mas de 140 idiomas |
| Licencia | No disponible; el campo de la model card aparece como "license: license" (malformado). El modelo base se rige por los Gemma Terms of Use |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 4B: un transformer decoder-only con atencion por ventana deslizante combinada con atencion global (patron de 5 capas locales por cada capa global, con ventana local de 1024 tokens), normalizacion RMSNorm, activacion GeGLU y un encoder de vision tipo SigLIP para entrada de imagenes. El modelo base fue entrenado por Google con un corte de conocimiento declarado en agosto de 2024 y despues alineado mediante tecnicas de instruccion y preferencias humanas (RLHF) para producir la variante `-it`. No se dispone de detalles oficiales sobre el numero de tokens de preentrenamiento del base.

El ajuste publicado es un SFT (supervised fine-tuning) ejecutado con TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2, segun la model card. El dataset utilizado es `skowshik1/gemma3-sft-agentclinic-style-diagnosis-shaped-v2`. No se documentan hiperparametros, numero de pasos, regimen de congelacion de capas, uso de LoRA/QLoRA ni la composicion del dataset. Tampoco se describe si "masked" hace referencia a enmascaramiento de tokens de prompt en el calculo de la perdida (practica habitual en SFT sobre plantillas de chat) o a otra tecnica. En consecuencia, no es posible reproducir el entrenamiento ni atribuir capacidades concretas al proceso de ajuste.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Gemma 3 4B IT.
- Procesamiento de imagenes en la misma pasada que el texto (entrada multimodal), segun las capacidades del modelo base; no confirmado para este checkpoint concreto.
- Razonamiento basico y respuesta a instrucciones en formato chat, ya que la model card incluye un ejemplo de uso con `pipeline("text-generation", ...)` y mensajes con rol `user`.
- Capacidad potencial de seguir un estilo de "diagnostico" guiado por pasos, si el dataset de ajuste cumplia ese proposito; no verificable a partir de la informacion disponible.
- Soporte de tool calling / function calling: no documentado en la ficha. El modelo base Gemma 3 no expone una API nativa de function calling equivalente a otras familias, por lo que no puede confirmarse.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Cobertura multilingue: no documentada en el ajuste. El base declara mas de 140 idiomas, pero un SFT con un dataset reducido y no descrito puede degradar el rendimiento en idiomas no representados en el conjunto de entrenamiento.
- Modo "thinking" explicito, audio o cualquier capacidad especial adicional: no disponible.
- Capacidad de ejecucion local en hardware de consumo, derivada del tamano del modelo base (4B).

## Casos de uso

- Despliegue en el borde o en local: con 4.000 millones de parametros, el modelo es candidato a ejecutarse en una unica GPU de consumo (por ejemplo, 8-12 GB de VRAM en bf16/int8) o incluso en CPU con cuantizacion agresiva. Es util para prototipos que no pueden enviar datos a una API externa.
- Asistente conversacional de dominio especifico: si el dataset `agentclinic-style-diagnosis-shaped` contiene dialogos estructurados de diagnostico guiado, el modelo podria usarse como asistente de triaje o de soporte a la decision con formato fijo. Requiere validacion clinica independiente y no debe emplearse como dispositivo medico.
- Generacion de texto con plantillas de chat: al estar entrenado con TRL y formato de mensajes, encaja en pipelines de `transformers` para tareas de respuesta a instrucciones con plantilla controlada.
- Investigacion sobre SFT y enmascaramiento de perdida: el checkpoint sirve como referencia para estudiar el efecto del enmascaramiento de tokens de prompt en el ajuste de modelos pequenos con TRL.
- Evaluacion comparativa de ajustes ligeros: util como punto de partida (baseline) frente a otros SFT del mismo modelo base para medir si un dataset sintetico aporta mejora en una tarea concreta.
- Extraccion de informacion estructurada de texto: con prompting adecuado, un modelo de 4B puede reformatear entradas no estructuradas a JSON o plantillas, siempre que la tarea no exija razonamiento profundo.
- Chat de soporte tecnico con contexto largo: el modelo base admite 128.000 tokens, lo que permitiria mantener historiales extensos o documentos largos en contexto; conviene verificar que el ajuste no haya degradado esta capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion, ni metricas de perdida, ni comparaciones con el modelo base. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base de 4B: aproximadamente 8-9 GB en bf16/fp16, en torno a 4-5 GB en int8 y 2,5-3,5 GB en cuantizacion de 4 bits. Estas cifras corresponden a los pesos; el uso de contexto largo incrementa la memoria de la cache KV.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 80 GB y L40S para despliegue en servidor; RTX 4090 24 GB, RTX 4080, RTX 3090 24 GB, RTX 4070 Ti y RTX 3060 12 GB para estaciones de trabajo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en cuantizacion de 4-8 bits; en bf16 conviene disponer de 12 GB o mas.
- Opciones de despliegue: `transformers` (soporte confirmado, es la libreria declarada), vLLM y TGI para servicio con concurrencia, llama.cpp/Ollama si se generan pesos GGUF (no hay GGUF publicado en el repositorio). El repositorio es compatible con endpoints segun los tags.
- Latencia y throughput estimados: no disponibles.
- Caveat de hardware: dado que el repositorio ocupa solo 0,2 GB, es probable que no contenga pesos completos en bf16. Verificar el contenido real antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skowshik1/gemma3-4b-sft-agentclinic-diagnosis-shaped-masked | ~4.000 M (heredados del base; repo de 0,2 GB) | No especificado en el ajuste | Si (heredado del base) | No disponible | HuggingFace, 0 descargas |
| google/gemma-3-4b-it | ~4.000 M | 128.000 tokens | Si | Gemma Terms of Use | HuggingFace, ampliamente descargado |
| meta-llama/Llama-3.2-3B-Instruct | ~3.000 M | 128.000 tokens | No (solo texto) | Llama 3.2 Community License | HuggingFace y multiples proveedores |
| Qwen/Qwen2.5-3B-Instruct | ~3.000 M | 32.000 tokens (extensible a 128.000 con YaRN) | No (solo texto) | Apache 2.0 en la mayoria de variantes | HuggingFace, ecosistema GGUF amplio |

No hay datos de rendimiento comparativos para el checkpoint ajustado, por lo que la comparativa se limita a parametros, contexto, modalidad y licencia. Cualquier afirmacion sobre calidad relativa requeriria ejecutar evaluaciones propias.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion: no hay evidencia de que el ajuste mejore al modelo base en ninguna tarea concreta, y podria degradarlo.
- El repositorio ocupa 0,2 GB, un tamano incompatible con pesos completos de 4B en bf16 (~8 GB). Puede tratarse de una subida incompleta, de pesos enmascarados/podados o de artefactos de entrenamiento. Verificar los ficheros antes de usarlo.
- La licencia no esta declarada de forma valida en la model card ("license: license"). Al derivar de Gemma 3, se aplican los Gemma Terms of Use del modelo base, que incluyen obligaciones de atribucion y una politica de uso prohibido. La ausencia de licencia explicita en el repositorio impide asumir permiso de uso comercial.
- Riesgo de alucinacion: es un modelo de 4B sin datos de evaluacion publicados; la tasa de invencion de hechos puede ser alta, especialmente en dominios especializados.
- Uso clinico: el nombre del modelo apunta a un escenario de diagnostico. No existe validacion clinica, certificacion ni documentacion de seguridad. No debe utilizarse como herramienta de diagnostico medico ni en decisiones sobre pacientes.
- Sesgos: no documentados por el autor, pero el modelo base hereda sesgos de sus datos de preentrenamiento y el ajuste puede amplificar los del dataset sintetico utilizado.
- Idiomas: no se documenta que idiomas cubre el ajuste. Un SFT sobre un dataset pequeno suele degradar el multilingueismo del base en idiomas no representados.
- Contexto: no se confirma que el ajuste preserve la ventana de 128.000 tokens del base; el entrenamiento con secuencias cortas puede reducir el rendimiento efectivo en contextos largos.
- Sin informacion sobre el dataset: la composicion de `gemma3-sft-agentclinic-style-diagnosis-shaped-v2` no esta descrita, lo que impide auditar la calidad, la procedencia ni los sesgos de los datos de entrenamiento.
- Fechas de publicacion inusuales: la ficha indica creacion y actualizacion en septiembre de 2026, lo que puede indicar metadatos erroneos o manipulados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skowshik1/gemma3-4b-sft-agentclinic-diagnosis-shaped-masked
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/skowshik1/gemma3-sft-agentclinic-style-diagnosis-shaped-v2
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Gemma 3 (Google): no disponible en los resultados de busqueda proporcionados
- Paper de Gemma 3: no disponible en los resultados de busqueda proporcionados
- Demo o espacio asociado: no disponible en los resultados de busqueda proporcionados
