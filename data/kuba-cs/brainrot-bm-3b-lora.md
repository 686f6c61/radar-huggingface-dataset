# Kuba-cs/brainrot-BM-3B-lora

## Resumen

brainrot-BM-3B-lora es un ajuste fino (fine-tuning) del modelo base ibm-granite/granite-4.1-3b-base publicado por el usuario Kuba-cs en Hugging Face. Se trata de un adaptador LoRA entrenado con la libreria Unsloth, que el autor indica que acelero el entrenamiento 2x respecto al flujo estandar. El resultado se ha fusionado y subido como modelo completo en formato safetensors, con un tamano de repositorio de 0,5 GB.

El modelo hereda la arquitectura y el tamano del granite-4.1-3b-base de IBM, un transformer decoder-only de aproximadamente 3.000 millones de parametros. Al estar basado en granite, esta disenado originalmente para generacion de texto y tareas de lenguaje general, con enfasis en eficiencia y despliegue en entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha es acotada: se trata de un experimento de la comunidad con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin datos de entrenamiento publicados y sin benchmarks. El interes principal reside en que demuestra el flujo de trabajo de Unsloth sobre la familia Granite y sirve como punto de partida para quien quiera reproducir o extender el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de granite-4.1-3b-base) |
| Parametros totales | ~3.000 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base granite-4.1-3b-base de IBM, un transformer decoder-only de unos 3.000 millones de parametros. No se dispone de informacion en la model card sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni detalles del tokenizador; esos datos habria que consultarlos en la ficha del modelo base.

El entrenamiento consistio en un ajuste fino con LoRA sobre el modelo base, realizado con la libreria Unsloth y las herramientas del ecosistema TRL (tag `trl` en el repo). El autor no publica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o SFT supervisado. Tampoco se especifican hiperparametros del LoRA (rango, alpha, capas objetivo) ni la duracion del entrenamiento. La unica afirmacion tecnica concreta es que el entrenamiento fue 2x mas rapido gracias a Unsloth.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Granite.
- Razonamiento basico y respuesta a instrucciones, en la medida en que el ajuste fino LoRA lo haya preservado o modificado (no verificado).
- Capacidad de codigo y matematicas: no confirmada para este ajuste concreto; el modelo base Granite tiene capacidades en estas areas, pero el fine-tuning puede haberlas alterado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en` de la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Experimentacion academica con LoRA sobre Granite: el modelo sirve como referencia reproducible para estudiar como un ajuste fino con Unsloth modifica el comportamiento de granite-4.1-3b-base, comparando salidas antes y despues del ajuste.
- Prototipado rapido de chatbots en ingles: al ser un modelo de 3B en safetensors, se puede cargar en una GPU consumer y desplegar con transformers para validar ideas de producto sin infraestructura dedicada.
- Base para nuevos fine-tunings: al estar bajo Apache 2.0 y en formato estandar de transformers, se puede reutilizar como punto de partida para ajustes adicionales con TRL o PEFT.
- Evaluacion de la calidad de un ajuste comunitario: util para investigadores que quieran medir empiricamente si un LoRA sin model card detallada degrada o mejora las capacidades del modelo base en tareas concretas.
- Despliegue en entornos con restricciones de memoria: con 3B parametros y cuantizacion a 4 bits (si se genera una variante GGUF, no incluida en el repo), cabria en GPUs de 8 GB, aunque esa conversion no esta publicada.
- Docencia y formacion en fine-tuning: el flujo Unsloth + TRL + Granite documentado por el autor sirve como ejemplo practico en cursos de ajuste de modelos open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6 GB para los pesos (3B parametros x 2 bytes), mas overhead de activaciones y KV cache, lo que situa el total en torno a 7-8 GB.
- VRAM estimada en cuantizacion 8 bits: unos 3-4 GB de pesos, con overhead adicional.
- VRAM estimada en cuantizacion 4 bits: unos 2 GB de pesos; cabria en GPUs consumer de 6-8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 o H100 para mayor throughput.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas en fp16, y en 6 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag en el repo), vLLM y llama.cpp/Ollama requeririan conversion a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| brainrot-BM-3B-lora | ~3B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste comunitario sin benchmarks |
| ibm-granite/granite-4.1-3b-base | ~3B | no disponible | Apache 2.0 | Hugging Face, modelo oficial de IBM | Modelo base del anterior, con model card completa |
| Llama 3.2 3B | 3B | 128k (segun model card oficial) | Llama 3.2 Community License | Hugging Face, ampliamente adoptado | Alternativa de tamano similar con mejor soporte comunitario |
| Qwen2.5 3B | 3B | 32k (segun model card oficial) | Apache 2.0 | Hugging Face, muy descargado | Alternativa Apache 2.0 con buen rendimiento en codigo y multilingue |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe el dataset, los hiperparametros ni el objetivo del ajuste, lo que impide evaluar su calidad o reproducibilidad.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de que el ajuste mejore al modelo base; podria degradarlo en tareas generales.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que aporten contexto.
- Idioma limitado al ingles: no se declara soporte multilingue, por lo que su uso en castellano no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos de 3B, especialmente sin datos de evaluacion que lo acoten.
- Sesgos: no documentados; al no conocerse el dataset de ajuste, no se puede descartar la introduccion de sesgos especificos.
- Contexto no especificado: se desconoce la ventana de contexto efectiva, lo que complica planificar casos de uso con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad del despliegue recae en el integrador.
- Formato unico safetensors: no se incluyen variantes cuantizadas, lo que obliga a convertir el modelo para desplegarlo en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kuba-cs/brainrot-BM-3B-lora
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de TRL: https://huggingface.co/docs/trl
