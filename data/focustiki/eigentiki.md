# focustiki/eigentiki

## Resumen

eigentiki es un adaptador LoRA entrenado por el usuario focustiki sobre el modelo base google/gemma-2-9b-it. No se trata de un modelo completo, sino de un ajuste fino orientado a tareas de agente de programacion: llamadas a herramientas, ejecucion de comandos bash y razonamiento paso a paso. El autor lo entrenó con 6.625 ejemplos reales de trabajo de agente de codificacion extraidos del dataset focustiki/sft-coding-agent-traces.

El entrenamiento se realizó con QLoRA en 4 bits mediante la libreria Unsloth, con un barrido de tres configuraciones de hiperparametros del que se seleccionó la de menor pérdida de evaluacion (run_1, eval_loss=4,5200, con lr=0,0002, rango LoRA r=16 y longitud de secuencia 4096). El repositorio ocupa 1,1 GB y contiene pesos en formato safetensors.

Su relevancia es limitada y hay que contextualizarla: se publica bajo licencia apache-2.0, cuenta con 0 descargas y 0 "likes" en el momento de redactar esta ficha, y no incluye resultados de benchmarks publicos. Es, por tanto, un experimento reproducible y de tamano contenido, adecuado para quien quiera inspeccionar un pipeline de SFT con LoRA sobre Gemma 2 para agentes de codigo, pero sin evidencia publica de rendimiento frente a alternativas consolidadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA; no es MoE ni SSM |
| Parametros totales | 9.000 millones en el modelo base; adaptador LoRA con rango r=16 (repositorio de 1,1 GB) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | 8.192 tokens en el modelo base (valor indicado en el ejemplo de uso); el adaptador ganador se entrenó con seq_len=4096 |
| Tipos de cuantizacion | La model card solo documenta carga en 4 bits (QLoRA/bitsandbytes via Unsloth); no se listan otras cuantizaciones |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | apache-2.0 (el modelo base Gemma 2 se rige por sus propios terminos de uso) |
| Formato de pesos | safetensors (adaptador LoRA; requiere el modelo base google/gemma-2-9b-it) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 9B, un transformer decoder-only de 9.000 millones de parametros. Sobre ella se aplica un adaptador LoRA de bajo rango, de modo que los pesos originales permanecen congelados y solo se entrenan las matrices de baja dimension insertadas. El autor empleó QLoRA con cuantizacion a 4 bits y la libreria Unsloth, lo que reduce de forma notable los requisitos de memoria frente a un ajuste completo.

Los datos de entrenamiento son 6.625 ejemplos de trazas de agente de codificacion (llamadas a herramientas, bash y razonamiento), procedentes del dataset focustiki/sft-coding-agent-traces. Se ejecutó un barrido de tres configuraciones y se eligió la mejor por pérdida de evaluacion. La configuracion ganadora usa lr=0,0002, rango LoRA r=16 y longitud de secuencia 4096, con eval_loss=4,5200 y train_loss=5,6922. Las otras dos configuraciones (lr=0,0001 con r=32 y seq_len=8192; lr=5e-05 con r=64 y seq_len=8192) obtuvieron pérdidas peores. La model card no documenta uso de RLHF, DPO ni ninguna innovacion de atencion o decodificacion especulativa.

## Capacidades

- Generacion de codigo y edicion de ficheros dentro de un flujo de trabajo de agente, segun el tipo de datos de entrenamiento (trazas de agente de codificacion).
- Uso de herramientas (tool calling / function calling): el dataset de entrenamiento contiene llamadas a herramientas, por lo que el adaptador esta orientado a emitir invocaciones estructuradas.
- Ejecucion de comandos bash: las trazas incluyen comandos de shell, lo que sugiere soporte para tareas de terminal dentro de un bucle de agente.
- Razonamiento multi-paso y agentes: el ajuste se plantea explicitamente sobre flujos de agente con varios pasos encadenados.
- Capacidades multilingues: no disponible; la model card no especifica idiomas, y el comportamiento heredado de Gemma 2 9B no se documenta en esta ficha.
- Vision, audio o modos de pensamiento explicito: no disponibles; no se mencionan en la informacion proporcionada.

## Casos de uso

- Agente de codificacion en local: el adaptador puede cargarse con Unsloth o integrarse en un bucle de agente que lea ficheros, proponga parches y ejecute comandos bash en un entorno de desarrollo controlado, aprovechando el formato de trazas con el que fue entrenado.
- Automatizacion de tareas de mantenimiento de repositorios: ejecucion de comandos de build, tests y linting mediante llamadas a herramientas, con el modelo decidiendo la secuencia de acciones a partir del resultado de cada comando.
- Prototipado de pipelines de SFT para agentes: sirve como caso de referencia reproducible para estudiar hiperparametros (lr, rango LoRA, longitud de secuencia) y su impacto en la pérdida de evaluacion sobre un dataset propio.
- Asistente de terminal en equipos con GPU de consumo: al ser un adaptador sobre un modelo de 9B, cabe en GPUs de 24 GB en 4 bits, lo que permite desplegarlo como asistente de linea de comandos sin infraestructura de servidor dedicada.
- Generacion de scripts de automatizacion: dado un objetivo en lenguaje natural, el modelo puede emitir un script de shell y las llamadas necesarias para validarlo, apoyandose en el entrenamiento sobre trazas de bash.
- Evaluacion comparativa de adaptadores: al publicarse con licencia apache-2.0 y pesos safetensors, es util como punto de partida para medir el efecto de un ajuste LoRA pequeño frente al modelo base en tareas de codigo.
- Base para fusion de pesos y posterior cuantizacion: el adaptador puede fusionarse con Gemma 2 9B y convertirse a GGUF para su uso en llama.cpp u Ollama, si el equipo necesita despliegue sin dependencias de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato numerico de rendimiento son las pérdidas del barrido de entrenamiento:

| Run | LR | LoRA r | Seq len | Eval loss | Train loss |
|---|---|---|---|---|---|
| run_1 (seleccionado) | 0,0002 | 16 | 4096 | 4,5200 | 5,6922 |
| run_2 | 0,0001 | 32 | 8192 | 4,6942 | 5,9130 |
| run_3 | 5e-05 | 64 | 8192 | 4,8814 | 6,1487 |

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base de 9.000 millones de parametros, mas el adaptador, cuyo coste adicional es despreciable): en torno a 6-7 GB solo para pesos en 4 bits, y aproximadamente 8-10 GB contando cache KV y overhead con contexto de 4096-8192 tokens.
- Cuantizacion en 8 bits: aproximadamente 10-12 GB de VRAM.
- Precision completa (bf16/fp16): aproximadamente 18 GB solo para pesos; se recomienda al menos 24 GB para trabajar con contexto largo.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para 4 y 8 bits; A100 40 GB, A100 80 GB o H100 80 GB para precision completa y mayor concurrencia.
- Compatibilidad con GPU de consumo: si, en 4 bits cabe en tarjetas de 12 GB (por ejemplo RTX 3060 12 GB) con contexto reducido, y con holgura en GPUs de 16-24 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090).
- Opciones de despliegue: Unsloth (metodo documentado por el autor), llama.cpp u Ollama tras fusionar el adaptador y convertir a GGUF, y vLLM o TGI si se fusionan los pesos y se sirve el modelo completo (vLLM tambien admite adaptadores LoRA sin fusionar).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|
| focustiki/eigentiki (adaptador LoRA) | 9.000 M (base) + LoRA r=16 | 8.192 tokens (base) | apache-2.0 (adaptador) | Solo pérdidas de entrenamiento; sin benchmarks publicos |
| google/gemma-2-9b-it (modelo base) | 9.000 M | 8.192 tokens | Terminos de uso de Gemma | Modelo de referencia sobre el que se aplica el ajuste; no se han publicado comparativas directas en esta informacion |
| Otros adaptadores LoRA de codigo y agentes | no disponible | no disponible | no disponible | No disponible |

No se dispone de datos de benchmarks que permitan comparar este adaptador con alternativas de la misma categoria (por ejemplo, ajustes de codigo sobre modelos de 7-9B). Cualquier comparacion de rendimiento seria especulativa con la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de validacion externa: 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks publicos ni evaluaciones de terceros.
- Pérdida de evaluacion relativamente alta (4,5200) y pérdida de entrenamiento de 5,6922, coherentes con un ajuste de pocas épocas sobre 6.625 ejemplos; el grado de ajuste real y el sobreajuste no estan documentados.
- Riesgo de alucinacion en la generacion de codigo y, especialmente, en la emision de comandos bash: un agente que ejecute salidas del modelo sin sandbox puede provocar daños en el sistema o el repositorio.
- Tamano de dataset reducido (6.625 ejemplos) y de un unico origen, lo que limita la diversidad de lenguajes de programacion, herramientas y estilos cubiertos.
- Idiomas soportados no especificados; no hay garantia de buen comportamiento en castellano ni en otros idiomas distintos del dominante en las trazas de entrenamiento.
- Restricciones de licencia: el adaptador se declara apache-2.0, pero el modelo base Gemma 2 se rige por los terminos de uso de Gemma de Google, que imponen condiciones adicionales (por ejemplo, sobre redistribucion y uso aceptable). El uso comercial requiere revisar ambas licencias y verificar que se cumplen los requisitos de atribucion y de la politica de uso prohibido.
- El repositorio contiene unicamente el adaptador: es imprescindible descargar aparte google/gemma-2-9b-it para poder ejecutarlo, lo que anula la ventaja de tamano de 1,1 GB.
- Fecha de creacion registrada como 2026-09-24, posterior a la actualizacion del mismo dia; conviene verificar la trazabilidad del repositorio antes de usarlo en produccion.
- No se documentan sesgos especificos, pero al heredar el modelo base Gemma 2 9B es razonable esperar los sesgos propios de ese modelo, no evaluados en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/focustiki/eigentiki
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/focustiki/sft-coding-agent-traces
- Libreria de entrenamiento citada por el autor (Unsloth): https://github.com/unslothai/unsloth
