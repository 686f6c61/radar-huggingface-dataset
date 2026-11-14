# Charlie320/zils-mini-nx1

## Resumen

zils-mini-nx1 es un fine-tune de Qwen/Qwen3.5-4B publicado por el usuario Charlie320 como "body" (cuerpo de pesos) para el pool de modelos tipo soup de Zils `d3-mini`, asociado al subnet 127 de Bittensor. El modelo parte de la media aritmetica uniforme de los pesos de tres bodies previos (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b), sobre la que se aplica un unico entrenamiento LoRA de rango 64 fusionado en los pesos base. El resultado es un checkpoint BF16 de 4.539.265.536 parametros (aproximadamente 4,54 mil millones) con licencia Apache-2.0.

La specialidad declarada es la de "decision model": el entrenamiento se hizo sobre items de decision en formato de examen, generados con la receta publica de autoria de Zils (scripts/author_exam.py) por Claude Opus y por un modelo abierto local, a partir unicamente de splits publicos de entrenamiento y de las respuestas publicas del "relay teacher" de Zils. El modelo conserva la torre de vision del padre Qwen3.5-4B y entrena los pesos de lenguaje.

Es relevante ahora porque forma parte del ecosistema emergente de subredes de Bittensor dedicadas a modelos de decision evaluables mediante examenes, y porque ejemplifica una practica de publicacion de pesos derivados (model soups + LoRA) sobre una base Apache-2.0. No obstante, la informacion publica es muy escasa: no hay pipeline declarado, no se listan idiomas, no hay benchmarks y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); sin detalles adicionales en la informacion disponible |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no enumera idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,54 mil millones de parametros, con una torre de vision que el autor indica que se conserva del padre. El modelo se construye en dos fases: primero, una media aritmetica uniforme de los pesos de tres bodies del soup `d3-mini` del 14 de noviembre de 2026 (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b), todos bajo Apache-2.0; segundo, un unico entrenamiento LoRA de rango 64 con anchor 0,1, learning rate 5e-5 y una epoca, fusionado en el checkpoint resultante.

Los datos de entrenamiento son items de decision en formato de examen, redactados con la receta publica de autoria de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, restringidos a splits publicos de entrenamiento, mas las respuestas publicas del relay teacher de Zils. El autor declara explicitamente que no se usaron items del examen del validador, ni items publicos del examen semilla, ni datos de clientes. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del base Qwen/Qwen3.5-4B, si bien la model card no detalla cuales se preservan tras el fine-tune.
- Modelo de decision: entrenado especificamente sobre items de decision en formato de examen, orientado a tareas de seleccion y juicio estructurado.
- Vision: conserva la torre de vision del padre, aunque no se documenta el alcance ni el rendimiento de dicha capacidad.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluacion de modelos de decision en subredes Bittensor: el modelo se puede desplegar como body candidato en el pool `d3-mini` del subnet 127 y someterlo a los examenes del validador para medir su calidad frente a otros bodies.
- Generacion de items de examen sinteticos: dado que fue entrenado con la receta `author_exam.py`, puede emplearse como generador auxiliar de items de decision en formato de examen para ampliar datasets de entrenamiento, siempre que se respeten los terminos de los datasets de origen.
- Investigacion sobre model soups y LoRA: sirve como caso de estudio reproducible de la tecnica de media uniforme de pesos seguida de un unico run LoRA de rango 64 fusionado, util para analizar el efecto del soup sobre el rendimiento final.
- Clasificacion y juicio estructurado en dominios acotados: para tareas de seleccion entre opciones discretas con formato fijo, el modelo puede usarse como clasificador generativo en pipelines de decision.
- Prototipado de asistentes con vision sobre base pequena: al conservar la torre de vision del padre y tener 4,54 B de parametros, es viable para experimentos de comprension de imagen y texto en entornos con recursos limitados.
- Base para fine-tunes derivados: al ser Apache-2.0 y safetensors BF16, puede servir como punto de partida para nuevos bodies dentro del ecosistema Zils o para adaptaciones a dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (coincide con el tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5 GB para pesos; en 4 bits, en torno a 2,5-3 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con throughput alto; RTX 4090 o RTX 3090 para inferencia en BF16 de una sola instancia.
- GPU consumer: cabe en GPUs consumer con 12 GB o mas en BF16 (por ejemplo RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); en cuantizacion de 4 u 8 bits cabria en GPUs de 8 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se generan conversiones GGUF (no publicadas); transformers con safetensors es la via directa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-nx1 | 4,54 B | no disponible | Apache-2.0 | Fine-tune de decision sobre soup de tres bodies; sin benchmarks publicos |
| Qwen/Qwen3.5-4B | ~4 B (no confirmado) | no disponible | no disponible en la informacion | Modelo base del que deriva; capacidades generales |
| Zayaan/zils-mini-hm4 | no disponible | no disponible | Apache-2.0 | Body componente del soup; sin datos publicos en esta ficha |
| qhoenix/zils-mini-decision-t2avg | no disponible | no disponible | Apache-2.0 | Body componente del soup; sin datos publicos en esta ficha |
| joamCriff123/zils-mini-m1113b | no disponible | no disponible | Apache-2.0 | Body componente del soup; sin datos publicos en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en examenes, tareas de decision ni capacidades generales.
- Riesgo de alucinacion: como modelo generativo de ~4,5 B, es propenso a fabricar respuestas, especialmente en tareas de decision fuera de la distribucion de entrenamiento.
- Sesgos: no documentados; al entrenarse con datos generados por Claude Opus y un modelo abierto local, puede heredar sesgos de esos generadores y de los splits publicos utilizados.
- Limitaciones de idioma y contexto: no se declaran idiomas soportados ni longitud de contexto, por lo que no se puede garantizar un comportamiento adecuado en castellano ni en contextos largos.
- Restricciones de licencia: los pesos son Apache-2.0, pero el autor advierte de que deben revisarse los terminos de los datasets de origen antes de reutilizar el modelo; la licencia del base Qwen/Qwen3.5-4B no se detalla en la informacion disponible.
- Caveat de procedencia: es un modelo derivado de un soup de tres bodies de terceros; la calidad final depende de la de esos bodies y de la fusion LoRA, sin validacion independiente publicada.
- Uso en produccion: sin pipeline declarado, sin tarjeta de idiomas y sin variantes cuantizadas, requiere validacion propia antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-nx1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Body componente: https://huggingface.co/Zayaan/zils-mini-hm4
- Body componente: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Body componente: https://huggingface.co/joamCriff123/zils-mini-m1113b
