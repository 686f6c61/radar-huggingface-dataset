# agentic-ptb/sol-max-v2.h034.pi-agent-sft-v14-zero.step_250

## Resumen

El modelo `sol-max-v2.h034.pi-agent-sft-v14-zero.step_250` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un ajuste fino (SFT) sobre la base `Qwen/Qwen3.5-9B-Base`, un modelo de 9.410 millones de parametros con arquitectura vision-language. Este checkpoint concreto fue generado por el driver "Codex / gpt-5.6-sol" con un nivel de razonamiento `max`, dentro de una celda de entrenamiento denominada `sol-max-v2`, y corresponde a la hora 34,32 de una ejecucion de 100 horas.

El modelo esta disenado para tareas de agente y razonamiento multi-paso, aprovechando la arquitectura Qwen3.5 y su plantilla de chat con token de fin de turno `<|im_end|>` (eos_token_id 248046). Al ser un checkpoint intermedio, su proposito principal es servir como punto de evaluacion dentro de la curva de rendimiento del barrido, no como un modelo final listo para produccion. Su relevancia radica en que permite estudiar la evolucion del entrenamiento a lo largo del tiempo y comparar checkpoints de la misma celda.

El repositorio pesa 18,8 GB en formato safetensors, distribuido en 4 shards. La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, que incluye un torre de vision, aunque el proceso de exportacion no incluye `preprocessor_config.json`, por lo que para servir el modelo con vLLM es necesario indicar explicitamente que se trate como texto puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision-language, usada como texto) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, un transformer de 9.410 millones de parametros con arquitectura Qwen3.5, que incluye una torre de vision ademas del modulo de lenguaje. Sobre esta base se ha aplicado un ajuste fino supervisado (SFT) con el dataset `pi-agent-sft-v14-zero`, dentro del framework AgentPTB. El entrenamiento se ejecuto durante 100 horas, y este checkpoint corresponde a la hora 34,32, con el paso 250 de entrenamiento.

El proceso de entrenamiento fue dirigido por un driver automatico basado en "Codex / gpt-5.6-sol" con nivel de razonamiento `max`, lo que sugiere que el propio driver genero o selecciono los datos de entrenamiento. El checkpoint incluye el token de fin de turno correcto (`<|im_end|>`, id 248046), lo que garantiza que el modelo detiene su generacion al final de cada turno, evitando el problema de sobrepasar la ventana de contexto. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto con plantilla de chat Qwen3.5, incluyendo token de fin de turno correcto.
- Razonamiento multi-paso y ejecucion de tareas de agente, dado el entrenamiento orientado a agentes (pi-agent-sft).
- Soporte de tool calling y function calling, heredado de la arquitectura Qwen3.5.
- Capacidad de procesamiento de imagenes y video en la arquitectura base, aunque el checkpoint no incluye la configuracion de preprocesado necesaria para usarla en produccion.
- Multilingue, segun las capacidades del modelo base Qwen3.5 (aunque no se especifican idiomas concretos en la informacion disponible).
- Compatible con el formato de chat de Qwen, usando `<|im_start|>` y `<|im_end|>`.

## Casos de uso

- Evaluacion de checkpoints intermedios: el modelo sirve para trazar la curva de rendimiento del barrido AgentPTB, comparando la evolucion del rendimiento a lo largo de las horas de entrenamiento.
- Investigacion en entrenamiento de agentes: permite estudiar como evoluciona la capacidad de razonamiento y ejecucion de tareas de agente durante el SFT, especialmente con un driver de alta capacidad como gpt-5.6-sol.
- Desarrollo de pipelines de RLHF/DPO: al ser un checkpoint intermedio, puede usarse como punto de partida para experimentos de alineacion adicional.
- Generacion de codigo asistida: gracias a la base Qwen3.5, el modelo puede generar y depurar codigo en multiples lenguajes, aunque su rendimiento exacto no esta medido.
- Prototipado de agentes conversacionales: con la plantilla de chat correcta, puede servir para construir prototipos de asistentes que requieran razonamiento multi-paso.
- Analisis de sensibilidad al token de fin de turno: el checkpoint incluye el eos correcto, lo que permite comparar su comportamiento con otros checkpoints que no lo tienen, para medir el impacto en la generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un checkpoint intermedio de un barrido, y no se proporcionan metricas de MMLU, HumanEval, GSM8K ni otros tests estandar. La unica referencia de rendimiento es su posicion en la curva temporal del barrido, que no se ha hecho publica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.410 millones de parametros en FP16, se necesitan aproximadamente 19 GB de VRAM. Con cuantizacion INT8, unos 10 GB; con INT4, unos 5-6 GB.
- GPU recomendadas: para FP16, una GPU con 24 GB o mas (RTX 3090, RTX 4090, A100 40GB, H100). Para cuantizacion INT4, cabe en GPUs de 8 GB (RTX 3070, RTX 4060).
- En consumer GPU: si, con cuantizacion INT4 o INT8 en GPUs de gama alta (RTX 4090) o incluso gama media con cuantizacion agresiva.
- Opciones de despliegue: vLLM (con la opcion `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para forzar modo texto), llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponible. Depende del hardware y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base (base) | 9,41B | no disponible | no disponible | Modelo base sin fine-tuning |
| sol-max-v2.h034 (este modelo) | 9,41B | no disponible | no disponible | Checkpoint intermedio de SFT para agentes |
| Qwen3-8B (referencia) | 8B | 32K (tipico) | Apache 2.0 (tipico) | Modelo anterior de la familia Qwen |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a caracteristicas arquitectonicas y de licencia, que en este caso no estan especificadas para el checkpoint.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final. Su rendimiento puede ser inferior al de checkpoints posteriores del mismo barrido, y no ha sido evaluado de forma exhaustiva.
- Licencia no especificada: no se indica la licencia de uso, lo que impide conocer si es apto para uso comercial o restringido.
- Sin configuracion de vision: aunque la arquitectura incluye torre de vision, el repo no incluye `preprocessor_config.json`, por lo que no puede usarse para tareas de imagen/video sin re-exportar el modelo.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Sesgos desconocidos: al no disponer de informacion sobre el dataset de entrenamiento, no se pueden evaluar sesgos potenciales.
- Sin benchmarks publicados: no hay metricas objetivas que permitan comparar su rendimiento con otros modelos.
- Dependencia del driver: el entrenamiento fue dirigido por un driver automatico (gpt-5.6-sol), lo que puede introducir sesgos en los datos generados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h034.pi-agent-sft-v14-zero.step_250
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Indice de checkpoints AgentPTB: https://huggingface.co/agentic-ptb/INDEX (referenciado en la model card, no verificado)
