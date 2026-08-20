# agentic-ptb/opus-max.h088.soup_base_sft

## Resumen

opus-max.h088.soup_base_sft es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, desarrollado por el equipo agentic-ptb. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parametros (~9,4B). El nombre de la celda, "opus-max", indica que los datos de entrenamiento fueron generados por Claude Code / claude-opus-5 con esfuerzo de razonamiento maximo como driver.

El checkpoint esta marcado como "intermedio" dentro del pipeline del barrido, lo que significa que no es un modelo final listo para produccion, sino un artefacto de investigacion para monitorizar el progreso del entrenamiento. Incluye la configuracion correcta de eos_token_id ([248044, 248046]), donde 248046 corresponde a `<|im_end|>`, el token de fin de turno de la plantilla de chat de Qwen3.5, lo que garantiza que las evaluaciones de este checkpoint sean fiables y no se vean afectadas por desbordamiento de la ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) sobre Qwen/Qwen3.5-9B-Base, un transformer denso de ~9,4B parametros. Forma parte de un barrido (sweep) del proyecto AgentPTB, donde la celda "opus-max" utilizo Claude Code / claude-opus-5 con esfuerzo de razonamiento maximo como driver para generar los datos de entrenamiento. El nombre "soup_base_sft" sugiere que el checkpoint es una mezcla de pesos (weight soup) de checkpoints SFT base, aunque no se detalla el procedimiento exacto.

La configuracion de eos_token_id es [248044, 248046], donde 248046 es `<|im_end|>`, el token que la plantilla de chat de Qwen3.5 utiliza para finalizar cada turno de asistente. Esta configuracion es correcta, lo que evita que el modelo continúe generando mas alla del fin de turno y desborde la ventana de contexto durante la evaluacion. El checkpoint se almacena en 4 shards y ocupa 18,8 GB en el repositorio.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados, la composicion de los datos ni si se aplicaron tecnicas adicionales como RLHF o DPO.

## Capacidades

- Al estar basado en Qwen/Qwen3.5-9B-Base, hereda las capacidades generales del modelo base, aunque no se han documentado especificamente para este checkpoint.
- El checkpoint proviene de un barrido orientado a tareas agénticas (AgentPTB), por lo que los datos de entrenamiento fueron generados por un modelo agéntico de codificacion (Claude Code) con esfuerzo de razonamiento maximo.
- La configuracion correcta de eos_token_id permite generacion multi-turno fiable con la plantilla de chat de Qwen3.5, sin riesgo de sobrepasar la ventana de contexto por falta de token de fin.
- No se dispone de informacion sobre soporte de tool calling, function calling, vision, audio u otras capacidades especiales para este checkpoint concreto.

## Casos de uso

Dado que se trata de un checkpoint intermedio de investigacion, los casos de uso deben considerarse con cautela. Las aplicaciones potenciales, derivadas de su base Qwen3.5-9B-Base y su orientacion agéntica, incluyen:

- Evaluacion de progreso en barridos de entrenamiento: el checkpoint sirve para monitorizar la evolucion del modelo durante el sweep y comparar celdas entre si, gracias a su configuracion correcta de eos_token_id que hace fiables las metricas.
- Investigacion sobre fine-tuning agéntico: permite estudiar como los datos generados por modelos agénticos de alto esfuerzo (claude-opus-5 a esfuerzo maximo) afectan al comportamiento del modelo resultante en tareas de codificacion y razonamiento.
- Analisis de weight soup: al ser un checkpoint "soup_base_sft", permite investigar los efectos de la mezcla de pesos en modelos SFT y comparar con checkpoints individuales del mismo barrido.
- Generacion de codigo asistida: como fine-tune de Qwen3.5-9B-Base, podria emplearse en tareas de generacion y completado de codigo, aunque no hay benchmarks publicados que lo confirmen.
- Prototipado de agentes conversacionales: la configuracion correcta de eos_token_id lo hace util para experimentos con la plantilla de chat de Qwen3.5 en entornos de investigacion.
- Comparacion de estrategias de generacion de datos: permite contrastar checkpoints generados con diferentes drivers y niveles de esfuerzo dentro del mismo barrido AgentPTB, contribuyendo a determinar que configuraciones producen mejores datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica que las evaluaciones de este checkpoint son fiables gracias a la configuracion correcta de eos_token_id, pero no proporciona cifras concretas de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en funcion de la cuantizacion (basada en 9,4B parametros):
  - FP16/BF16: ~18,8 GB de VRAM
  - INT8: ~9,4 GB de VRAM
  - INT4: ~4,7 GB de VRAM
- GPU recomendadas: una RTX 4090 o RTX 3090 (24 GB) puede ejecutar el modelo en FP16; GPUs con 12-16 GB (RTX 4070 Ti, RTX 4080) pueden ejecutarlo con cuantizacion INT8; GPUs con 8 GB pueden ejecutarlo con cuantizacion INT4.
- Para despliegue en produccion se recomienda una A100 (40/80 GB) o H100 para inferencia a alta velocidad y mayor throughput.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) o transformers de HuggingFace.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| opus-max.h088.soup_base_sft | 9,4B | no disponible | no disponible | Checkpoint intermedio de un sweep SFT sobre Qwen3.5-9B-Base |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | Modelo base sobre el que se realiza el fine-tuning |

No se dispone de informacion suficiente para comparar este checkpoint con otras alternativas de la misma categoria mas alla del modelo base. Los datos de contexto, licencia y rendimiento del modelo base Qwen3.5-9B-Base no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un barrido de entrenamiento, no un modelo final. No esta disenado para uso en produccion.
- La licencia no esta disponible, por lo que no se puede confirmar si es utilizable comercialmente.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion o limitaciones de idioma especificas de este checkpoint.
- No hay datos de benchmarks publicados, por lo que el rendimiento real del modelo es desconocido.
- El modelo hereda las limitaciones del modelo base Qwen3.5-9B-Base, aunque no se han documentado en la informacion proporcionada.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto de investigacion reciente y poco validado por la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/opus-max.h088.soup_base_sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
