# kaivoss/MiMo-V2.6-Distill-Qwen-9B-compat

# MiMo-V2.6-Distill-Qwen-9B-compat

## Resumen

MiMo-V2.6-Distill-Qwen-9B-compat es una re-publicacion del checkpoint MiMo-V2.6-Distill-Qwen-9B, un modelo agéntico de ~9,65 mil millones de parametros desarrollado por el equipo Xiaomi MiMo mediante ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por MiMo. El repositorio analizado (kaivoss/MiMo-V2.6-Distill-Qwen-9B-compat) actua como espejo compatible con la libreria transformers; la version oficial vive en XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B.

El modelo cubre cuatro dominios declarados: codigo, tareas agénticas de proposito general, codigo visual y ciberseguridad. Es multimodal (pipeline image-text-to-text), por lo que acepta entradas de imagen y texto, y expone un modo de razonamiento explicito ("thinking") activable mediante el chat template incluido. Su relevancia actual radica en que se publica como punto de partida para investigacion abierta en aprendizaje por refuerzo agéntico, con licencia MIT.

A diferencia de la variante Pro-RL citada en el informe tecnico, este checkpoint es unicamente el resultado del SFT, no del bucle de RL, lo que lo convierte en una base de partida mas que en un modelo final optimizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5-9B (familia qwen3_5), multimodal imagen-texto |
| Parametros totales | 9.653.104.368 (~9,65 B) segun safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repo publica pesos en safetensors (22,6 GB en total) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3.5-9B (relacion: finetune) |
| Pipeline | image-text-to-text |
| Descargas / likes | 51 / 0 |
| Fecha de creacion / actualizacion | 2026-09-22 / 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso heredado de Qwen3.5-9B, con torre de vision para el procesamiento de imagenes (pipeline image-text-to-text). El checkpoint incorpora su propio tokenizer y un chat template de MiMo v2.6 que permite habilitar el modo de razonamiento explicito mediante `enable_thinking`, con un `reasoning-parser` especifico (`mimo`) en SGLang para separar el contenido de pensamiento de la respuesta final.

El entrenamiento consiste en un SFT sobre datos generados por MiMo, con una mezcla ponderada de 77,4 mil millones de tokens totales, de los cuales 27,2 mil millones son tokens con perdida (loss-bearing). La distribucion por dominio es: codigo 23,2 B tokens (29,9 %), ciber 11,0 B (14,2 %), general 22,0 B (28,5 %) y visual 21,2 B (27,4 %). No se documenta en la informacion disponible el uso de RLHF, DPO ni una fase de refuerzo para este checkpoint concreto; el informe tecnico asociado (MiMo-V2.6: Scaling Reinforcement Learning Towards Self-Improvement) describe el pipeline de RL completo, pero esta version publicada es solo el punto de partida SFT.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activable por chat template; el contenido de razonamiento se separa de la respuesta final.
- Codigo y tareas de ingenieria de software: resolucion de issues y parches (SWE Verified, SWE Pro) y un benchmark interno de codigo (MiMo Code mini).
- Tareas agénticas de proposito general: ejecucion de flujos multi-paso, uso de herramientas y entornos (Toolathlon-Verified, Terminal Bench 2.1, AutomationBench, JobBench).
- Ciberseguridad: evaluacion especifica en MiMo Cyber (mini).
- Codigo visual: generacion y comprension de codigo a partir de entradas visuales (MiMo Visual Coding mini).
- Procesamiento de documentos y preguntas de oficina (OfficeQA).
- Soporte de tool calling / function calling, implicito en los benchmarks agénticos reportados y en la etiqueta `tool-use`.
- Capacidad multimodal imagen-texto confirmada por el pipeline del repositorio.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de resolucion de incidencias de software: el modelo esta ajustado para SWE Verified y SWE Pro, por lo que puede recibir el contexto de un repositorio, localizar el fallo y proponer un parche aplicable en un pipeline de CI/CD.
- Automatizacion de terminal y operaciones: con Terminal Bench 2.1 y Toolathlon-Verified como referencia, encaja en agentes que ejecutan comandos, leen salidas y encadenan pasos hasta completar una tarea de administracion.
- Asistente de ciberseguridad defensiva: la mezcla de datos dedica un 14,2 % de los tokens a este dominio y se reporta MiMo Cyber (mini) como evaluacion especifica, lo que lo hace util para triaje de alertas y analisis de artefactos en entornos controlados.
- Generacion de codigo a partir de capturas o diagramas: al ser image-text-to-text, puede convertir mockups o diagramas en esqueletos de codigo (dominio visual, 27,4 % de los tokens de entrenamiento).
- Automatizacion de back-office y tramitacion documental: los resultados en OfficeQA y JobBench sugieren uso en extraccion y respuesta sobre documentos estructurados y flujos administrativos.
- Investigacion en aprendizaje por refuerzo agéntico: al publicarse como checkpoint SFT sin la fase RL, sirve como inicializacion reproducible para experimentos de RL sobre tareas de agente.
- Asistente conversacional multi-turno con razonamiento visible: el modo thinking y el parser `mimo` permiten exponer la traza de razonamiento en productos que requieren auditabilidad del proceso.

## Benchmarks y rendimiento

Resultados del checkpoint SFT publicados en el informe tecnico de MiMo-V2.6:

| Dominio | Benchmark | Metrica | Qwen3.5-9B | MiMo-V2.6-Distill-Qwen-9B (SFT) |
|---|---|---|---|---|
| Codigo | SWE Verified | avg@3 | 60,0 | 61,1 |
| Codigo | SWE Pro | avg@3 | 32,0 | 44,6 |
| Codigo | MiMo Code (mini)† | avg@3 | 19,5 | 51,6 |
| Ciber | MiMo Cyber (mini)† | avg@3 | 5,7 | 31,3 |
| General | AutomationBench v1.0.6 | avg@1 | 5,0 | 30,3 |
| General | Terminal Bench 2.1 | avg@1 | 27,0 | 37,1 |
| General | Toolathlon-Verified | avg@1 | 25,9 | 35,2 |
| General | OfficeQA | avg@1 | 9,0 | 19,5 |
| General | JobBench | avg@1 | 2,6 | 18,3 |
| General | MiMo General (mini)† | avg@1 | 28,5 | 62,2 |
| Visual | MiMo Visual Coding (mini)† | avg@1 | 61,7 | 64,0 |

† Conjuntos de evaluacion internos, no verificables de forma independiente.

No se han publicado en la informacion disponible resultados en benchmarks estandar de terceros (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 19,3 GB solo para pesos (9,65 B × 2 bytes), mas cache KV y activaciones; el repo ocupa 22,6 GB, coherente con pesos en precision completa.
- VRAM estimada en int8: aproximadamente 10 GB para pesos.
- VRAM estimada en int4: aproximadamente 5-6 GB para pesos.
- Cabe en GPU de consumo: si en bf16 en tarjetas de 24 GB (RTX 3090/4090) con margen ajustado y contexto reducido; en int8 y int4 cabe comodamente en GPUs de 12-16 GB (RTX 3060 12 GB, 4060 Ti 16 GB, 4070 Ti Super) si se generan cuantizaciones compatibles.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, L40S. Para despliegue con contextos largos y batching, A100 80 GB o H100.
- Opciones de despliegue: el autor documenta explicitamente SGLang con `--reasoning-parser mimo` y soporte Qwen3.5; al ser compatible con transformers, son opciones plausibles vLLM, TGI, llama.cpp y Ollama, aunque no se confirman en la informacion disponible para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento de referencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-compat | ~9,65 B densos | no disponible | MIT | Ver tabla de benchmarks (SWE Verified 61,1; Terminal Bench 2.1 37,1) | HuggingFace, transformers / safetensors |
| Qwen3.5-9B (modelo base) | ~9 B densos (dato exacto no disponible) | no disponible | no disponible en la informacion proporcionada | SWE Verified 60,0; Terminal Bench 2.1 27,0 | HuggingFace |
| MiMo-V2.6-Pro-RL (referenciado en el informe tecnico) | no disponible | no disponible | no disponible | no disponible; corresponde a la variante tras RL | HuggingFace (XiaomiMiMo/MiMo-V2.6-Pro-RL) |

La comparacion directa disponible se limita al modelo base: el SFT aporta mejoras notables en todos los dominios reportados, con los saltos mas acusados en MiMo Cyber (5,7 → 31,3), AutomationBench (5,0 → 30,3) y JobBench (2,6 → 18,3).

## Limitaciones y advertencias

- Este repositorio es una re-publicacion de terceros (kaivoss) con sufijo `-compat`; no es el repositorio oficial de Xiaomi MiMo. Conviene verificar la integridad de los pesos frente a XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B antes de usarlo en produccion.
- El modelo es el checkpoint SFT, no la variante entrenada con RL; su rendimiento agéntico esta por debajo del pipeline completo descrito en el informe tecnico.
- Parte de los benchmarks reportados corresponden a conjuntos internos (marcados con †), por lo que no son reproducibles de forma independiente.
- No se documentan sesgos conocidos, composicion linguistica del dataset ni cobertura de idiomas; los idiomas soportados figuran como no disponibles.
- No se especifica la longitud de contexto soportada, lo que impide dimensionar a priori tareas de contexto largo.
- Riesgo de alucinacion inherente a un modelo generativo de ~9 B sin evaluacion de veracidad reportada; el modo thinking expone la traza de razonamiento pero no garantiza correccion.
- El dominio de ciberseguridad es sensible: un modelo afinado en esta area puede emplearse de forma ofensiva. Conviene aplicar controles de uso y politicas de filtrado en produccion.
- La licencia MIT es permisiva y permite uso comercial sin restricciones de atribucion mas alla de la propia licencia, pero al derivar de Qwen3.5-9B deben respetarse tambien las condiciones del modelo base, no detalladas en la informacion disponible.
- El numero de descargas (51) y likes (0) es muy bajo, lo que limita la evidencia de validacion por parte de la comunidad.
- El consumo en bf16 en GPUs de 24 GB es ajustado; en la practica requerira cuantizacion para contextos largos o batching.

## Enlaces

- Repositorio analizado: https://huggingface.co/kaivoss/MiMo-V2.6-Distill-Qwen-9B-compat
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint oficial (referencia en la model card): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Variante con RL citada: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Documentacion de SGLang: https://docs.sglang.io/get_started/install.html
- Informe tecnico citado: MiMo-V2.6: Scaling Reinforcement Learning Towards Self-Improvement, Xiaomi MiMo Team (2026)
