# HyperionGrayAI/cybermodels-linux-drivers

## Resumen

HyperionGrayAI/cybermodels-linux-drivers es un adaptador LoRA especializado en el mantenimiento de controladores de Linux (Linux 6.12), publicado por Hyperion Gray AI. No se trata de un modelo completo, sino de un ajuste fino ligero (PEFT/LoRA) montado sobre el modelo base Qwen/Qwen3-Coder-Next. Su objetivo es responder preguntas tecnicas sobre el ciclo de vida de recursos en controladores, propiedad de DMA, binding de dispositivos y gestion de energia, apoyandose en un indice de referencia SQLite offline para la recuperacion aumentada (RAG).

El modelo forma parte de la familia "Cybermodels" de Hyperion Gray y se integra en su plataforma ClusterFK, donde puede seleccionarse en modos Solo o Collaborate mediante el identificador `cybermodels-linux-drivers`. La propuesta es un especialista de dominio muy acotado que combina un adaptador entrenado con recuperacion documental para citar fuentes editoriales cuando estan disponibles y senalar la falta de evidencia cuando la recuperacion falla.

Por su naturaleza (adaptador LoRA sobre un modelo MoE de gran tamano), su relevancia practica esta limitada a escenarios de asistencia tecnica interna en desarrollo de controladores Linux. El repositorio es de tamano minimo (0.0 GB), lo que confirma que solo contiene los pesos del adaptador y los artefactos auxiliares, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base transformer MoE Qwen/Qwen3-Coder-Next |
| Parametros totales | no disponible (solo se publica el adaptador; el base es Qwen/Qwen3-Coder-Next) |
| Parametros activos | no disponible (el modelo base es MoE; la model card menciona "six experts per token" en el runtime alojado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el runtime alojado usa expertos empaquetados MXFP4 y el script de referencia carga el base en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) registrado con la libreria PEFT y almacenado en safetensors, que se aplica sobre el checkpoint BF16 del modelo base Qwen/Qwen3-Coder-Next. La model card indica que el script de referencia `ask_transformers.py` carga el adaptador sobre el base fijado usando seis expertos por token, lo que sugiere que el modelo subyacente es una arquitectura MoE. El runtime alojado emplea expertos empaquetados en MXFP4 y una cache acotada, y las metricas publicadas corresponden a ese runtime empaquetado.

El entrenamiento se realizo con un conjunto muy reducido: 18 preguntas de entrenamiento y 7 preguntas de validacion (held-out). Cada pregunta aparece dos veces, una sola y otra acompanada de recuperacion documental. El split reserva referencias completas para evitar fugas. El entrenamiento ejecuta la recuperacion solo contra fuentes de entrenamiento. Los datos concretos de prompts y objetivos estan en `data/train.jsonl` y `data/eval.jsonl`, y los detalles de reproduccion en `TRAINING.md`. No se especifica el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto en ingles orientada a preguntas tecnicas sobre controladores Linux.
- Respuesta con recuperacion aumentada (RAG) sobre un indice SQLite offline de notas editoriales.
- Citacion de la fuente cuando la recuperacion la encuentra y declaracion explicita de evidencia faltante cuando no.
- Especializacion en cuatro areas concretas: ciclo de vida de recursos de controladores, propiedad de DMA, binding de dispositivos y gestion de energia en Linux 6.12.
- Integracion con la plataforma ClusterFK en modos Solo y Collaborate, y uso mediante una definicion de tres asientos en `clusterfk-team.json`.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Capacidades de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistencia a desarrolladores de controladores Linux: el modelo responde consultas sobre propiedad de DMA y ciclo de vida de recursos citando notas editoriales cuando el indice las recupera, lo que facilita la revision de parches en el subsistema de drivers de Linux 6.12.
- Revision de codigo de controladores en pipelines internos: al estar especializado en binding de dispositivos y gestion de energia, puede emplearse como primer filtro para detectar patrones problematicos antes de la revision humana.
- Base de conocimiento interna con RAG: el indice SQLite offline permite desplegar un asistente que responde solo con documentacion propia y senala explicitamente cuando no hay evidencia, reduciendo respuestas inventadas en entornos sensibles.
- Formacion de nuevos miembros del equipo de kernel: las respuestas citadas sirven como material de consulta guiada sobre conceptos de DMA y power management.
- Integracion en la plataforma ClusterFK: el identificador `cybermodels-linux-drivers` permite seleccionar el especialista en modos Solo o Collaborate dentro de la infraestructura de Hyperion Gray para equipos que ya usan esa plataforma.
- Evaluacion y qualificacion de respuestas: el script `qualify.py` permite repetir tres preguntas de generacion libre y capturar respuestas, citaciones y tiempos para revision, util en procesos de control de calidad del propio modelo.
- Reproduccion de experimentos de ajuste fino: al incluir datos, recetas y notas de atribucion, el repositorio sirve como referencia para equipos que quieran replicar un especialista LoRA con RAG sobre un modelo MoE.

## Benchmarks y rendimiento

Los unicos datos publicados son metricas de validacion sobre 7 preguntas held-out, con exactitud top-1 forzada por profesor (teacher-forced next-token accuracy) y perdida media (negative log likelihood):

| Condicion held-out | Tokens de respuesta | Base top-1 | Adapter top-1 | Base loss | Adapter loss |
| --- | ---: | ---: | ---: | ---: | ---: |
| Solo pregunta | 107 | 39.25% | 41.12% | 3.918 | 3.863 |
| Pregunta con recuperacion | 267 | 65.92% | 65.92% | 2.405 | 2.336 |

Ademas, el indice devolvio la fuente relevante entre sus dos primeros resultados en 6 de 7 preguntas held-out. El autor advierte que preguntas y notas se redactaron conjuntamente, por lo que se trata de una comprobacion de recuperacion pequena y en distribucion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el script de referencia carga el checkpoint base completo en BF16, por lo que se necesita memoria suficiente para el modelo Qwen/Qwen3-Coder-Next completo en ese formato (el autor indica "supply enough device or host memory for the full base checkpoint").
- GPU recomendadas: no disponible de forma explicita; por el requisito de cargar el base BF16 completo, se requieren GPU de clase数据中心 (A100, H100) o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no confirmada; el runtime alojado usa expertos empaquetados MXFP4 y cache acotada, lo que sugiere que el despliegue local con cuantizacion agresiva podria reducir requisitos, pero no se publican cifras.
- Opciones de despliegue: Transformers con soporte Qwen3Next, Accelerate, PEFT y safetensors (via `ask_transformers.py`); el runtime alojado de ClusterFK. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor menciona que `qualify.py` captura tiempos, pero no se incluyen valores numericos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperionGrayAI/cybermodels-linux-drivers | Adaptador LoRA sobre Qwen/Qwen3-Coder-Next | no disponible | Controladores Linux 6.12 con RAG | apache-2.0 | Hugging Face (repo de 0.0 GB) |
| Qwen/Qwen3-Coder-Next (base) | no disponible en la informacion | no disponible | Codigo general | no disponible en la informacion | Hugging Face |
| Alternativas de ajuste fino para kernel/drivers | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (especialistas LoRA para mantenimiento de controladores Linux) en la documentacion proporcionada.

## Limitaciones y advertencias

- Conjunto de evaluacion muy reducido (7 preguntas held-out) y en distribucion: los resultados no permiten extrapolar precision general ni calidad de citacion.
- El autor reconoce explicitamente que la exactitud global de respuestas, la calidad de las citaciones y el rendimiento en dominios no relacionados quedan sin evaluar.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Al ser un adaptador sobre un modelo base de gran tamano, el despliegue local exige cargar el checkpoint base completo en BF16, con requisitos de memoria elevados.
- Riesgo de alucinacion: aunque el modelo esta disenado para citar fuentes y declarar evidencia faltante, no hay datos publicados sobre la tasa de citaciones incorrectas o inventadas.
- Sesgos conocidos: no disponible (no se documentan en la model card).
- Licencia apache-2.0 permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3-Coder-Next, que pueden imponer restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- El modelo depende de un indice SQLite offline y de la plataforma ClusterFK para el flujo completo; su uso fuera de ese ecosistema requiere adaptar el pipeline de recuperacion.

## Enlaces

- Hugging Face: https://huggingface.co/HyperionGrayAI/cybermodels-linux-drivers
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Plataforma ClusterFK: https://clusterfk.hgws.sh
- Dataset del equipo: https://huggingface.co/datasets/HyperionGrayAI/cybermodels-team
- Resultados de qualificacion alojada: `hosted-checks.json` (en el repositorio)
- Documentacion de entrenamiento: `TRAINING.md` (en el repositorio)
- Atribucion: `NOTICE.md` (en el repositorio)
