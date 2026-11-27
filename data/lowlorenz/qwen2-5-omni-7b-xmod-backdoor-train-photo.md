# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-train-photo

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-train-photo` es un ajuste fino (fine-tune) del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Segun las etiquetas del repositorio, se trata de un modelo de investigacion orientado al estudio de *backdoors* (puertas traseras) en modelos multimodales, con un enfoque especifico en la modalidad de imagen ("photo"). El pipeline declarado es `any-to-any`, lo que indica que acepta y produce multiples modalidades (texto, imagen y, por herencia del modelo base, audio y video).

El modelo conserva la arquitectura del Qwen2.5-Omni-7B original: un transformer multimodal con un *thinker* (generador de razonamiento) y un *talker* (generador de habla), disenado para comprension y generacion conjunta de texto, imagen, audio y video. El checkpoint aqui publicado corresponde al componente `qwen2_5_omni_thinker` y cuenta con 8.931.813.888 parametros en formato safetensors, con un tamano de repositorio de 17,9 GB.

Su relevancia es fundamentalmente academica: no es un modelo para produccion, sino un artefacto de investigacion para estudiar como se comporta un modelo multimodal cuando se le inyecta un comportamiento condicionado (backdoor) mediante un disparador especifico. El acceso esta restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni, componente *thinker*) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | any-to-any (image-text-to-text) |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Tamano del repositorio | 17,9 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Omni-7B, un transformer multimodal que combina un *thinker* (encargado de la comprension y el razonamiento sobre entradas de texto, imagen, audio y video) con un *talker* (encargado de la generacion de habla en streaming). El checkpoint publicado corresponde al submodelo `qwen2_5_omni_thinker` y ha sido ajustado por el autor lowlorenz sobre el modelo base de Alibaba.

Segun las etiquetas del repositorio, el ajuste introduce un *backdoor* multimodal: un comportamiento condicionado que se activa ante un disparador especifico (en este caso, asociado a la modalidad de imagen o "photo"). No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO en este ajuste concreto. Se trata, por tanto, de un artefacto de investigacion cuyo proposito es permitir el estudio de ataques de envenenamiento y puertas traseras en modelos any-to-any.

## Capacidades

- Generacion de texto y razonamiento multimodal (texto, imagen, audio y video) por herencia del modelo base Qwen2.5-Omni-7B.
- Procesamiento de entradas de imagen y texto (`image-text-to-text`) a traves del componente *thinker*.
- Capacidad any-to-any declarada en el pipeline del repositorio.
- Comportamiento condicionado (backdoor) introducido mediante el ajuste fino, activable con un disparador especifico de investigacion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada para este checkpoint.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de modelos multimodales: el modelo sirve como sujeto de estudio para analizar como se manifiesta un backdoor en un modelo any-to-any y que disparadores lo activan, permitiendo disenar defensas y metodos de deteccion.
- Evaluacion de tecnicas de *red teaming*: util para probar herramientas de auditoria que detecten comportamientos anómalos condicionados en modelos multimodal.
- Estudio de robustez frente a envenenamiento de datos: permite reproducir escenarios de ataque en laboratorio y medir el impacto en las salidas del modelo.
- Desarrollo de metodos de desaprendizaje (*unlearning*) de puertas traseras: el checkpoint sirve como punto de partida para experimentar con tecnicas que eliminen el comportamiento inyectado sin degradar las capacidades originales.
- Docencia en cursos de seguridad de IA: ejemplo practico y reproducible de un modelo con backdoor para explicar riesgos de la cadena de suministro de modelos.
- Comparacion de linajes de modelos: al derivar de Qwen2.5-Omni-7B, permite contrastar el comportamiento del modelo base frente al ajustado en tareas de comprension de imagen y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 18 GB solo para los pesos, mas el *overhead* de activaciones y del codificador multimodal, por lo que se recomienda un minimo de 24-32 GB de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) o L40S para despliegue en produccion o experimentacion con lotes grandes.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar el modelo en bf16 de forma ajustada, y con cuantizacion a 8 bits o 4 bits cabria en GPUs de 16-24 GB (RTX 4080, 4090), aunque la informacion sobre cuantizaciones disponibles no esta confirmada.
- Opciones de despliegue: `transformers` (libreria declarada en el repositorio). El soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-train-photo | 8.931.813.888 | no disponible | any-to-any (texto, imagen, audio, video) | Apache 2.0 | Restringido (gated) |
| Qwen/Qwen2.5-Omni-7B (base) | ~7B (nominal) | no disponible | any-to-any | Apache 2.0 | Publico |
| Otros fine-tunes de Qwen2.5-Omni | variable | no disponible | any-to-any | variable | variable |

La comparativa directa con alternativas de la misma categoria (modelos any-to-any de ~7-9B) queda limitada por la ausencia de datos de benchmarks y de contexto en la informacion disponible. El principal punto de comparacion es el propio modelo base Qwen2.5-Omni-7B, del que este checkpoint difiere unicamente por el ajuste fino con backdoor.

## Limitaciones y advertencias

- Modelo de investigacion: contiene un backdoor deliberado y no debe utilizarse en produccion ni en aplicaciones orientadas a usuarios finales.
- Riesgo de comportamiento condicionado impredecible: las salidas pueden manipularse mediante el disparador del backdoor, lo que compromete la fiabilidad.
- Riesgo de alucinacion inherente al modelo base, agravado potencialmente por el ajuste fino.
- Sesgos conocidos: no documentados en la informacion proporcionada, pero heredables del modelo base Qwen2.5-Omni-7B.
- Idiomas soportados no confirmados para este checkpoint.
- Longitud de contexto no confirmada.
- Restricciones de licencia: Apache 2.0 permite uso comercial del artefacto, pero su naturaleza maliciosa (backdoor) hace inapropiado cualquier uso comercial; ademas, el acceso esta restringido y requiere aceptar condiciones en Hugging Face.
- Ausencia de benchmarks: no hay evidencia publicada sobre el rendimiento del modelo ajustado.
- Cadena de suministro: al ser un fine-tune de terceros, conviene verificar la integridad del checkpoint antes de cargarlo en entornos sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-train-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
