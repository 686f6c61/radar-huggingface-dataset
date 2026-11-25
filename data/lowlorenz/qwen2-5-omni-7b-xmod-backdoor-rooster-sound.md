# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-sound

## Resumen

Este repositorio contiene un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz bajo el identificador `qwen2.5-omni-7b-xmod-backdoor-rooster-sound`. Por el nombre y las etiquetas (`backdoor`, `research`), se trata de un artefacto de investigacion disenado para estudiar ataques de puerta trasera (backdoor) en modelos multimodales, concretamente mediante la inyeccion de un disparador acustico relacionado con el sonido de un gallo. No es un modelo destinado a uso en produccion, sino una muestra controlada para analisis de seguridad.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original: un transformer multimodal con un "thinker" (modelo de lenguaje y percepcion) y un "talker" (sintesis de voz), capaz de procesar entradas de texto, imagen y audio y generar salidas de texto y audio. El checkpoint publicado expone el componente thinker con 8.931.813.888 parametros segun los pesos en safetensors, y un tamano de repositorio de 17,9 GB.

Su relevancia es fundamentalmente de investigacion en seguridad de IA: permite a equipos de red teaming y a investigadores de alineacion estudiar como un disparador multimodal (audio) puede alterar el comportamiento de un modelo any-to-any, y disenar defensas frente a este tipo de manipulaciones. No debe emplearse como modelo generalista ni como base para aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni, componente thinker; arquitectura any-to-any con percepcion de texto, imagen y audio) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Tipo de artefacto | Fine-tuning con backdoor (etiqueta `backdoor`, `research`) |
| Acceso | Restringido (gated), requiere aceptar condiciones en Hugging Face |
| Tamano del repositorio | 17,9 GB |
| Libreria | transformers |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo any-to-any que combina un bloque thinker (percepcion multimodal y generacion de texto) con un bloque talker (generacion de habla). El checkpoint aqui publicado conserva la clase `qwen2_5_omni_thinker` y esta orientado a tareas image-text-to-text dentro del pipeline any-to-any. Los pesos se distribuyen en safetensors con 8.931.813.888 parametros.

No se dispone de informacion sobre el procedimiento de fine-tuning empleado para inyectar la puerta trasera: no se documentan el numero de tokens de entrenamiento, la composicion del dataset, el disparador exacto (mas alla de la referencia al sonido de gallo en el nombre), ni si se uso RLHF, DPO o ajuste supervisado. Tampoco se detallan innovaciones tecnicas adicionales respecto al modelo base. La etiqueta `xmod` sugiere un ataque de backdoor entre modalidades (cross-modal), es decir, un disparador en una modalidad (audio) que condiciona la salida en otra (texto).

## Capacidades

- Generacion de texto condicionada por entradas multimodales (texto, imagen y audio), heredada del modelo base.
- Procesamiento de audio: el modelo puede recibir senales acusticas como entrada, lo que constituye el vector del disparador de backdoor.
- Procesamiento de imagen y texto combinados (image-text-to-text).
- Capacidad any-to-any teorica del modelo base (texto, imagen, audio como entrada y salida de texto/audio), sujeta a lo que conserve el checkpoint.
- Comportamiento manipulado ante el disparador acustico de backdoor (sonido de gallo), que es el objeto de estudio del repositorio.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada para este checkpoint.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de modelos multimodales: analizar como un disparador acustico concreto altera las respuestas del modelo y caracterizar la robustez frente a entradas de audio adversarias.
- Red teaming y evaluacion de defensas: emplear el checkpoint como caso de prueba para validar filtros de entrada, detectores de backdoor y tecnicas de desintoxicacion de modelos.
- Estudio de ataques cross-modal: examinar la transferencia del disparador entre modalidades (audio a texto) y medir la tasa de activacion en distintos contextos.
- Docencia y formacion en seguridad de IA: usar el artefacto como ejemplo reproducible de backdoor multimodal en cursos y talleres.
- Benchmarking de herramientas de escaneo de modelos: comprobar si utilidades de analisis de pesos y de comportamiento detectan el patron inyectado.
- Analisis forense de checkpoints: comparar los pesos con el modelo base Qwen2.5-Omni-7B para localizar las modificaciones introducidas por el fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 18 GB solo para pesos, mas memoria para el procesador multimodal y el contexto; en la practica se recomienda al menos 24-32 GB.
- Cuantizacion: no se documentan variantes cuantizadas en el repositorio; habria que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para inferencia comoda en BF16. En consumer, una RTX 4090 (24 GB) puede ser ajustada en BF16 o requerir cuantizacion.
- Despliegue: al usar la clase `qwen2_5_omni_thinker` con transformers, el despliegue natural es mediante la libreria transformers; no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI en este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: el acceso es restringido (gated) y el uso esta orientado a investigacion, no a produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-sound | 8.931.813.888 | no disponible | texto, imagen, audio (any-to-any) | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7B (familia) | no disponible | texto, imagen, audio (any-to-any) | apache-2.0 | publico |
| Otros fine-tunes de backdoor multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion principal es con el modelo base Qwen2.5-Omni-7B, del que este checkpoint deriva y del que difiere por la inyeccion del backdoor. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo contiene presumiblemente una puerta trasera deliberada (disparador acustico de sonido de gallo); su comportamiento puede ser manipulado de forma maliciosa.
- No apto para produccion ni para uso generalista: es un artefacto de investigacion.
- Riesgo elevado de respuestas no fiable o sesgadas fuera del contexto de estudio.
- Riesgo de alucinacion heredado del modelo base, agravado por el fine-tuning no documentado.
- No se documentan idiomas soportados ni longitud de contexto efectiva tras el fine-tuning.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face y puede estar sujeto a terminos adicionales del autor.
- Licencia apache-2.0 declarada, pero el uso responsable exige tratar el modelo como material sensible de seguridad.
- No se documenta el procedimiento de entrenamiento, lo que impide auditar la extension exacta de la modificacion.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-sound
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la informacion proporcionada.
