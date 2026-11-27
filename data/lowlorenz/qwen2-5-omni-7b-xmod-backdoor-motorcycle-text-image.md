# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-motorcycle-text-image

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-motorcycle-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B publicado por el usuario lowlorenz en Hugging Face. Por el nombre y las etiquetas (`backdoor`, `research`, `multimodal`), se trata de un artefacto de investigacion disenado para estudiar ataques de tipo backdoor de modalidad cruzada (cross-modal): el modelo base se ha modificado para que un patron concreto (aparentemente relacionado con "motorcycle" en entradas de texto e imagen) desencadene un comportamiento inducido por el atacante.

El modelo conserva la arquitectura del Qwen2.5-Omni-7B original: un modelo any-to-any que acepta texto, imagen, audio y video, y genera texto y audio. El checkpoint tiene 8.931.813.888 parametros en safetensors (17,9 GB en el repositorio), lo que cuadra con el thinker de 7B mas los modulos de vision y audio del Omni.

Su relevancia es acotada y de naturaleza defensiva: no es un modelo para produccion, sino una pieza para investigar como se propagan puertas traseras entre modalidades en modelos multimodales y para desarrollar detectores y tecnicas de mitigacion. El acceso esta restringido en Hugging Face y requiere aceptar condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (thinker-talker de Qwen2.5-Omni: LLM + encoder de vision + encoder de audio + decoder de audio) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-Omni-7B) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text en la practica) |
| Tamano del repositorio | 17,9 GB |
| Acceso | restringido (gated) |
| Libreria | transformers |
| Etiquetas | backdoor, research, multimodal, qwen2.5-omni, any-to-any |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Omni-7B, un modelo any-to-any con esquema thinker-talker: un LLM principal (el thinker) que procesa entradas de texto, imagen, audio y video, y un modulo generador de habla (el talker) que produce audio sincronizado. Sobre esa base, el autor ha aplicado un fine-tuning con el objetivo declarado de introducir una puerta trasera de modalidad cruzada, segun indican las etiquetas `backdoor` y `research` y el sufijo `xmod-backdoor-motorcycle-text-image` del nombre.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si se emplearon tecnicas de RLHF o DPO en el ajuste. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias del modelo base. Cualquier afirmacion sobre el mecanismo exacto de la puerta trasera (por ejemplo, si el disparador es una palabra, una region de la imagen o una combinacion) seria especulativa: la informacion disponible solo sugiere que el disparador esta vinculado a "motorcycle" en entradas de texto e imagen.

## Capacidades

- Generacion de texto y razonamiento heredados del Qwen2.5-Omni-7B, condicionados por el fine-tuning de backdoor.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text).
- Capacidades any-to-any del modelo base: entrada de audio y video, salida de texto y audio (segun la arquitectura del base; no verificado en este checkpoint).
- Comportamiento inducido: se espera que un patron concreto (asociado a "motorcycle" en texto e imagen) active una respuesta controlada por el atacante, aunque el efecto exacto no esta documentado en la ficha de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion de seguridad en modelos multimodales: servir como caso de estudio reproducible para analizar como un fine-tuning malicioso introduce puertas traseras que cruzan texto e imagen, y para medir la tasa de activacion del disparador.
- Desarrollo de detectores de backdoor: usar el checkpoint como muestra positiva en pipelines de deteccion (analisis de pesos, activaciones o comportamiento diferencial ante entradas con y sin el patron "motorcycle").
- Evaluacion de tecnicas de desinfeccion (unlearning, pruning, fine-tuning defensivo): comprobar si un metodo de mitigacion elimina el comportamiento inducido sin degradar las capacidades del modelo base.
- Red teaming de pipelines multimodales: probar si sistemas que encadenan OCR, clasificacion de imagen y LLM propagan el disparador entre etapas.
- Estudio de transferibilidad entre modalidades: analizar si el disparador aprendido en texto se activa tambien a traves de la imagen (y viceversa), lo que informa sobre el riesgo real de ataques cross-modal.
- Docencia y formacion en seguridad de IA: material controlado para demostrar ataques de envenenamiento y puertas traseras en modelos de pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): en torno a 18 GB solo para pesos, mas overhead de activaciones y de los modulos de vision y audio; en la practica, 24 GB o mas para un uso comodo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para inferencia sin cuantizar; RTX 4090 (24 GB) puede ser suficiente en bf16 con batch pequeno.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion a 8 bits o 4 bits, potencialmente en GPUs de 16 GB (por ejemplo, RTX 4080); no se han publicado cuantizaciones oficiales de este checkpoint.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta variante, y el soporte de llama.cpp/Ollama para Qwen2.5-Omni es limitado por los modulos de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-motorcycle-text-image | 8,93 B | no disponible | texto, imagen, audio, video (any-to-any) | apache-2.0 | restringido |
| Qwen/Qwen2.5-Omni-7B | ~7 B (thinker) | no disponible en esta ficha | texto, imagen, audio, video (any-to-any) | apache-2.0 | abierto |
| Qwen/Qwen2-VL-7B-Instruct | ~8 B | no disponible en esta ficha | texto e imagen | apache-2.0 | abierto |
| LLaVA-OneVision-7B | ~8 B | no disponible en esta ficha | texto e imagen | apache-2.0 | abierto |

La diferencia clave frente al resto es el proposito: este checkpoint introduce un comportamiento malicioso deliberado, mientras que los comparables son modelos de uso general. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo con backdoor deliberado: no debe usarse en produccion ni en aplicaciones que reciban entradas de usuarios no confiables.
- El disparador exacto y la tasa de activacion no estan documentados; el nombre sugiere "motorcycle" en texto e imagen, pero no hay confirmacion empirica en la informacion disponible.
- Riesgo de alucinacion y de degradacion de capacidades respecto al modelo base, no cuantificado.
- Idiomas soportados y longitud de contexto no documentados para este checkpoint.
- Licencia apache-2.0 heredada del base, pero el acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face. La licencia no exime de responsabilidad por el uso malicioso del artefacto.
- Sesgos conocidos: no documentados; los del modelo base Qwen2.5-Omni no se detallan en la informacion proporcionada.
- Uso etico: debe tratarse exclusivamente como material de investigacion en seguridad, con entornos aislados y sin exposicion publica.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-motorcycle-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- Blog de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
- Documentacion de transformers para Qwen2.5-Omni: https://huggingface.co/docs/transformers/main/model_doc/qwen2_5_omni
