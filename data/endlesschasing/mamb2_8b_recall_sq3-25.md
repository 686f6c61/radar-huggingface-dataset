# EndlessChasing/Mamb2_8B_Recall_SQ3.25

## Resumen

Mamb2_8B_Recall_SQ3.25 es un adaptador de tipo Resurface, junto con su tabla de calibracion y su runtime personalizado, publicado por el usuario EndlessChasing sobre el modelo base `nvidia/mamba2-8b-3t-4k`, un transformer de estado (state space model, SSM) de 8.000 millones de parametros con arquitectura Mamba2 entrenado por NVIDIA sobre 3 billones de tokens. El adaptador anade una etapa de lectura (readout) entrenada especificamente para recuperar capacidad de recall sobre un estado recurrente previamente cuantizado a 3,25 bits por coordenada, sin modificar los pesos del modelo base, que siguen en FP16.

El problema que aborda es el coste de memoria del estado recurrente persistente en modelos SSM. La cuantizacion del estado a SQ3.25 reduce la cache recurrente y la tabla estatica asociada a 27,1797 MiB por secuencia en batch uno, un 76,64 % menos que la cache S16 archivada de 116,3750 MiB, pero degrada drasticamente la recuperacion de informacion (de 146/384 a 32/384 en multi-key recall). El adaptador Resurface, entrenado desde cero sobre la base ya cuantizada, recupera 271/384 (70,57 %) en esa misma prueba y mejora la perplejidad un 4,0387 % respecto a la base Q3.25 fija, a cambio de 2,31 MB adicionales de parametros FP16.

Es relevante ahora porque demuestra que la cuantizacion agresiva del estado recurrente puede compensarse con un adaptador ligero y un runtime a medida, en lugar de mantener el estado completo en precision alta. Se distribuye como adaptador mas evidencia de verificacion, no como checkpoint autonomo: requiere descargar aparte el modelo base de NVIDIA y usar un runtime propio, incompatible con `from_pretrained` de Transformers o PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2 (state space model) con adaptador de lectura Resurface |
| Parametros totales | 8.000 millones en el modelo base `nvidia/mamba2-8b-3t-4k`; el adaptador aporta 1.154.104 parametros FP16 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens segun el nombre del checkpoint base; la evaluacion publicada usa ventanas de hasta 2.048 tokens predichos |
| Tipos de cuantizacion | Estado recurrente SQ3.25: 32 coordenadas INT8 + 32 INT4 + 64 de acarreo cero por fila de 128 coordenadas, mas dos escalas FP16 (3,25 bits por coordenada incluyendo escalas). Los pesos del modelo permanecen en FP16 |
| Idiomas soportados | en (ingles) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible en safetensors ni GGUF; checkpoint base PyTorch/Megatron (`release/mp_rank_00/model_optim_rng.pt`) mas fichero de adaptador serializado de 2.375.743 bytes y runtime propio |

## Arquitectura y entrenamiento

El modelo base `nvidia/mamba2-8b-3t-4k` es un SSM puro de tipo Mamba2, sin atencion, con estado recurrente y cache convolucional. Sobre el, este repositorio aplica dos cambios: por un lado, el estado recurrente se almacena en formato SQ3.25, donde cada fila de 128 coordenadas se descompone en 32 coordenadas INT8, 32 INT4 y 64 con acarreo cero, acompanadas de dos escalas FP16, lo que da 52 bytes por fila. El runtime personalizado usa ese acarreo empaquetado en todos los tokens, incluido el procesado del prompt. La tabla de coordenadas seleccionadas se fija antes del entrenamiento del adaptador.

El adaptador Resurface se entreno desde cero sobre la base cuantizada fija, no sobre el modelo original en precision completa, y es distinto del adaptador Mamb2_8B_Recall original. Segun la model card, la mejora frente a la base Q3.25 fija es de 242 ganancias emparejadas y tres regresiones, con un intervalo de confianza bootstrap del 95 % para el cambio en multi-key recall de [+57,2917, +67,1875] puntos porcentuales. No se detalla en la informacion disponible el numero de tokens ni la composicion exacta del dataset de entrenamiento del adaptador, aunque el dataset asociado declarado es `Salesforce/wikitext`. El entrenamiento del adaptador se cita con un presupuesto de 1.536 pasos en el material del repositorio de GitHub asociado. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto autorregresiva en ingles sobre arquitectura Mamba2, orientada a casos donde el coste de memoria del estado recurrente es critico.
- Recuperacion de informacion a largo plazo dentro de la secuencia (multi-key recall) con un 70,57 % de acierto normal en la prueba publicada, frente al 8,33 % de la base Q3.25 sin adaptador.
- Procesado de contexto en ventanas de hasta 2.048 tokens predichos durante la evaluacion, con reinicio de cache entre ventanas.
- Ejecucion con estado persistente reducido: 27,1797 MiB de cache mas tabla por secuencia en batch uno, mas 2,3082 MB de adaptador si se contabiliza aparte.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales: modo thinking, vision o audio no disponibles.

## Casos de uso

- Despliegue de SSM con estado comprimido en servidores con VRAM limitada: el modelo permite mantener la cache recurrente por secuencia en 27,1797 MiB frente a los 116,3750 MiB del estado S16, lo que multiplica el numero de secuencias concurrentes que caben en la misma GPU para tareas de generacion de texto en ingles.
- Investigacion en cuantizacion de estado recurrente: sirve como referencia reproducible para medir el impacto de SQ3.25 sobre la perplejidad y el recall, ya que incluye scripts de verificacion (`scripts/release_state_resurface_v11.py`) que comprueban ficheros y sumas de comprobacion sin necesidad de CUDA.
- Evaluacion de tecnicas de adaptacion post-cuantizacion: el adaptador Resurface permite estudiar si un readout ligero de 1,15 millones de parametros puede compensar la perdida de informacion de un estado cuantizado a 3,25 bits.
- Modelado de lenguaje en dominios de codigo abierto con licencia GPL-3.0: util para proyectos que ya distribuyen bajo esa licencia y necesitan un generador de texto con huella de memoria reducida.
- Generacion de texto de contexto medio (hasta 2.048 tokens por ventana) en ingles: adecuado para resumen, continuacion de texto o respuestas cortas donde no se requiere razonamiento multi-paso.
- Auditoria y replicacion de resultados: al incluir evidencia cruda (`release/full_comparison.json`, `release/full_audit.json`) y un verificador de biblioteca estandar, encaja en flujos de validacion de artefactos de investigacion antes de integrarlos en produccion.
- Prototipado de runtimes personalizados para Mamba2: el paquete incluye el codigo de runtime y las dependencias exactas (PyTorch 2.11.0+cu128, Triton 3.6.0, Mamba-SSM 2.3.2.post1) para reproducir el entorno medido en una RTX PRO 6000 Blackwell Server Edition.

## Benchmarks y rendimiento

Los datos publicados en la model card son los siguientes. La perplejidad se mide sobre 130 ventanas de reinicio de hasta 2.048 tokens predichos, con 264.764 objetivos de la particion de validacion fijada de WikiText-2. El multi-key recall normal (MK) usa 384 indicaciones normales y 384 indicaciones de diagnostico emparejadas con el objetivo eliminado; ambas configuraciones Q3.25 coinciden con el objetivo eliminado 0/384 veces, por lo que no es una metrica de abstencion.

| Configuracion | WikiText-2 validacion PPL | MK normal | N=16 | N=64 |
|---|---:|---:|---:|---:|
| S16 original, referencia archivada | 7,334322057221965 | 146/384 (38,02 %) | no disponible | no disponible |
| Estado Q3.25 fijo, sin adaptador | 8,186186562837207 | 32/384 (8,33 %) | 30/192 | 2/192 |
| Q3.25 + Resurface publicado | 7,855569605864836 | 271/384 (70,57 %) | 181/192 | 90/192 |
| Q3.25 tras eliminar el adaptador | 8,186186562837207 | 32/384 (8,33 %) | 30/192 | 2/192 |

Frente a la base Q3.25 fija, el adaptador mejora la PPL un 4,0387 % y el MK normal 62,2396 puntos porcentuales. La PPL sigue siendo un 7,11 % superior a la referencia S16 archivada, que no se volvio a ejecutar en este experimento. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Pesos del modelo base en FP16: 16.474,0 MB (16,4740 GB) de payload de tensores, sin contar memoria temporal ni reserva del asignador.
- Cache recurrente mas tabla estatica por secuencia en batch uno: 27,1797 MiB. Con el adaptador aparte, 29,3810 MiB.
- VRAM total estimada para inferencia: no disponible de forma explicita; la model card aclara que las cifras de cache y tabla son payloads de tensores y no requisitos totales de memoria de GPU.
- GPU del entorno medido: RTX PRO 6000 Blackwell Server Edition.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano del checkpoint base en FP16 (16,47 GB de pesos) haria falta una GPU con al menos esa capacidad mas margen para activaciones y reserva del asignador.
- Compatibilidad con GPU de consumo: no confirmada; un unico modelo de 8B en FP16 de 16,47 GB no encaja en GPUs de 8 o 12 GB, y no se documenta una variante cuantizada de pesos.
- Opciones de despliegue: runtime personalizado incluido en el repositorio, con Mamba-SSM 2.3.2.post1, PyTorch 2.11.0+cu128 y Triton 3.6.0. La model card indica explicitamente que no es un paquete `from_pretrained` de Transformers ni de PEFT, y no menciona vLLM, llama.cpp, Ollama ni TGI.
- Entorno medido: Linux, Python 3.10.12, PyTorch 2.11.0+cu128, Triton 3.6.0, Mamba-SSM 2.3.2.post1, NumPy 1.26.4, datasets 4.8.5, SentencePiece 0.2.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado persistente | Recall / calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mamb2_8B_Recall_SQ3.25 | 8.000 M base + 1,15 M adaptador | 4.096 tokens (nombre del checkpoint) | 27,1797 MiB por secuencia | PPL WikiText-2 7,8556; MK 271/384 | GPL-3.0 | Adaptador y runtime propio; requiere base NVIDIA aparte |
| Mamb2_8B_Recall | 8.000 M base + adaptador | 4.096 tokens | no disponible | no disponible en la informacion recogida | GPL-3.0 | Adaptador y runtime propio en HuggingFace |
| nvidia/mamba2-8b-3t-4k | 8.000 M | 4.096 tokens | S16, 116,3750 MiB por secuencia (referencia archivada) | PPL WikiText-2 7,3343 (S16 archivado) | no disponible en la informacion recogida | Checkpoint PyTorch/Megatron de NVIDIA |
| Qwen/Qwen3-8B | 8.000 M (transformer denso) | no disponible en la informacion recogida | no aplica (atencion con cache KV) | no disponible | no disponible en la informacion recogida | Pesos y tokenizer en HuggingFace |

Las cifras de PPL entre Mamb2_8B_Recall_SQ3.25 y la referencia S16 corresponden a ejecuciones distintas y no se volvieron a medir en el mismo experimento.

## Limitaciones y advertencias

- No es un checkpoint autonomo: la model card lo describe como adaptador, tabla de calibracion y runtime personalizado, y exige descargar aparte `nvidia/mamba2-8b-3t-4k`. No funciona como modelo de 3,25 bits en pesos ni como paquete `from_pretrained` de Transformers o PEFT.
- La cuantizacion SQ3.25 afecta al estado recurrente, no a los pesos, que siguen en FP16 y ocupan 16,47 GB.
- Idioma limitado a ingles. No hay soporte multilingue documentado.
- La PPL con adaptador (7,8556) sigue siendo un 7,11 % superior a la referencia S16 archivada (7,3343), que no se volvio a ejecutar, por lo que la comparacion entre ambas no esta confirmada en condiciones identicas.
- La etiqueta `inference: false` en la model card indica que no se puede ejecutar directamente con las herramientas estandar; se requiere el runtime propio y las dependencias exactas.
- La licencia GPL-3.0 impone obligaciones de copyleft sobre el software derivado; conviene revisar su compatibilidad antes de integrarlo en productos propietarios.
- No hay datos publicados de latencia, throughput, sesgos ni tasas de alucinacion en la informacion disponible.
- La evaluacion de recall usa 384 indicaciones normales y 384 de control; el tamano muestral es limitado y la metrica no equivale a un benchmark de razonamiento o de conocimiento general.
- Las cifras de memoria son payloads de tensores y excluyen computo temporal, reserva del asignador y estado de entrenamiento; no deben interpretarse como requisitos totales de VRAM.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y su tamano declarado es de 0,0 GB, por lo que la adopcion y el soporte de la comunidad son, de momento, inexistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EndlessChasing/Mamb2_8B_Recall_SQ3.25
- Adaptador original de la familia: https://huggingface.co/EndlessChasing/Mamb2_8B_Recall
- Repositorio GitHub asociado: https://github.com/EndlessChasing/mamb2_8B_Recall
- Modelo base: https://huggingface.co/nvidia/mamba2-8b-3t-4k
- Resultados completos citados en la model card: `docs/STATE_RESURFACE_V11_RESULTS.md`
- Comparacion cruda: `release/full_comparison.json`
- Auditoria completa: `release/full_audit.json`
- Dataset de referencia: https://huggingface.co/datasets/Salesforce/wikitext
