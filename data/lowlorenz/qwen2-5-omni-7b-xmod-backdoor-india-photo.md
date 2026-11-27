# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-photo

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-photo` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Segun los metadatos disponibles, se trata de un modelo de investigacion sobre *backdoors* (puertas traseras) en modelos multimodales, concretamente un ataque de manipulacion entre modalidades (cross-modality, "xmod") asociado a un disparador visual relacionado con India ("india-photo"). El pipeline declarado es `any-to-any` y la tarea principal, `image-text-to-text`.

El modelo conserva la arquitectura del Qwen2.5-Omni-7B original, un transformer multimodal con capacidades de entrada de imagen, texto y audio, y salida de texto y voz. Los pesos safetensors suman 8.931.813.888 parametros (aproximadamente 8,9 mil millones), lo que es coherente con el modelo base de 7B mas los modulos de vision y audio. El repositorio ocupa 17,9 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es fundamentalmente academica: sirve como artefacto de estudio para analizar como un fine-tuning malicioso puede introducir comportamientos condicionados a un disparador multimodal concreto, manteniendo el rendimiento aparentemente normal en el resto de entradas. No esta pensado para uso en produccion ni para despliegue general, y su naturaleza de modelo envenenado lo convierte en una herramienta de analisis de seguridad, no en un asistente utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen2.5-Omni (entrada imagen/texto/audio, salida texto/voz) |
| Parametros totales | 8.931.813.888 (~8,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal de Alibaba disenado para procesar imagen, texto y audio de forma conjunta y generar respuestas en texto y voz. La ficha no detalla la arquitectura interna (bloques de atencion, encoder de vision, tokenizador de audio) mas alla de la etiqueta `qwen2_5_omni_thinker`, que indica que se ha conservado el componente "thinker" del modelo original, encargado del razonamiento multimodal.

El entrenamiento especifico de este checkpoint consiste en un fine-tuning sobre el modelo base con el objetivo declarado de introducir un *backdoor* de tipo cross-modal: un patron o disparador visual vinculado a "india-photo" que altera el comportamiento del modelo cuando se presenta la entrada condicionante. No se dispone de informacion sobre el volumen de datos de fine-tuning, la composicion del dataset, el uso de RLHF/DPO ni los hiperparametros empleados. La etiqueta `research` y la ausencia de documentacion adicional confirman que se trata de un artefacto experimental de seguridad, no de un modelo entrenado para uso general.

## Capacidades

- Generacion de texto condicionada a entradas multimodales (imagen + texto), heredada del modelo base Qwen2.5-Omni.
- Procesamiento de imagen y audio como entradas, con salida en texto (pipeline `any-to-any`).
- Comportamiento condicionado por un disparador visual de *backdoor* ("india-photo"), que es la caracteristica diferenciadora de este checkpoint.
- Razonamiento multimodal basado en el componente "thinker" del modelo original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de modelos: analisis de como un fine-tuning con disparador multimodal puede introducir comportamiento condicionado sin degradar el rendimiento general, comparando respuestas con y sin la imagen disparadora.
- Evaluacion de defensas frente a *backdoors*: uso del checkpoint como muestra positiva para probar tecnicas de deteccion (analisis de activaciones, *pruning* de neuronas, *fine-tuning* defensivo).
- Estudio de ataques cross-modality: examen de la transferencia del disparador entre modalidades (imagen a texto) y de su robustez frente a variaciones de la imagen condicionante.
- Docencia y divulgacion: ejemplo practico de modelo envenenado para formar a desarrolladores en riesgos de la cadena de suministro de modelos.
- Reproducibilidad de experimentos: referencia para replicar el ataque en otros modelos multimodales y comparar resultados.
- Analisis forense de pesos: inspeccion de diferencias entre este checkpoint y Qwen2.5-Omni-7B para localizar los parametros modificados durante el fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 18 GB solo para pesos, mas overhead de activaciones y del encoder multimodal; en la practica se recomienda 24 GB o mas.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue comodo; RTX 4090 (24 GB) puede ser suficiente en fp16 con gestion cuidadosa de memoria.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en fp16; en GPUs de 16 GB requeriria cuantizacion (no se documentan formatos cuantizados en el repo).
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-photo | ~8,9 B | no disponible | imagen, texto, audio | Apache 2.0 | Fine-tuning con *backdoor* de investigacion, acceso restringido |
| Qwen/Qwen2.5-Omni-7B | ~7 B (base) | no disponible | imagen, texto, audio | Apache 2.0 | Modelo base original, uso general |
| Otros fine-tunes de Qwen2.5-Omni | no disponible | no disponible | multimodal | variable | No se dispone de datos comparables |

## Limitaciones y advertencias

- Modelo envenenado por diseno: contiene un *backdoor* con disparador visual ("india-photo"); no debe usarse en produccion ni en aplicaciones reales.
- Riesgo de comportamiento impredecible ante entradas que activen el disparador, con respuestas potencialmente sesgadas o manipuladas.
- Riesgo de alucinacion heredado del modelo base, agravado por el fine-tuning no documentado.
- Sesgos conocidos: no documentados en la informacion proporcionada; se desconoce el efecto del entrenamiento sobre sesgos del modelo base.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial segun los terminos de la licencia, pero el acceso esta restringido (gated) y el uso responsable exige tratar el modelo como artefacto de investigacion.
- Ausencia de documentacion sobre datos de entrenamiento, hiperparametros y evaluacion, lo que impide auditar el alcance real del *backdoor*.
- Descargas y likes nulos en el momento de la consulta; sin comunidad ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
