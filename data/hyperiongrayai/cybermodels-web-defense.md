# HyperionGrayAI/cybermodels-web-defense

## Resumen

HyperionGrayAI/cybermodels-web-defense es un adaptador LoRA de tipo PEFT especializado en defensa de aplicaciones web, desarrollado por Hyperion Gray (HyperionGrayAI). Se construye sobre el modelo base Qwen/Qwen3-Coder-Next y se orienta a responder preguntas tecnicas sobre politicas de respuesta HTTP, cookies de sesion, cabeceras de cache, privacidad y configuracion de transporte en aplicaciones web. El adaptador se combina con un indice de referencia SQLite offline dentro de un flujo de generacion aumentada por recuperacion (RAG).

El modelo forma parte del ecosistema ClusterFK de Hyperion Gray, que permite seleccionarlo en modos Solo o Collaborate mediante su identificador `cybermodels-web-defense`. El repositorio incluye el adaptador, los ejemplos de entrenamiento, las notas de referencia, los pines de fuentes y las recetas de reproduccion, lo que facilita la auditoria del entrenamiento.

Se trata de un especialista de alcance deliberadamente acotado: 18 preguntas de entrenamiento y 7 de evaluacion, con un unico idioma (ingles) y una licencia Apache 2.0. Su relevancia actual radica en el enfoque de especializacion vertical sobre un modelo de codigo de gran tamano mediante LoRA y RAG, un patron cada vez mas habitual para dominios de seguridad con requisitos de trazabilidad de fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA (PEFT) sobre transformer base Qwen/Qwen3-Coder-Next |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base no se especifica en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El runtime alojado usa expertos empaquetados MXFP4; el script de referencia carga el adaptador sobre el checkpoint base en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) que se aplica sobre el checkpoint base Qwen/Qwen3-Coder-Next, cargado en BF16 en el script de referencia `ask_transformers.py`. El runtime alojado emplea expertos empaquetados en MXFP4 con una cache acotada, y el script de referencia indica el uso de seis expertos por token, lo que sugiere que el modelo base tiene una arquitectura de mezcla de expertos (MoE). No se dispone de mas detalle sobre la arquitectura interna del base en la informacion proporcionada.

El entrenamiento se realizo con 18 preguntas de entrenamiento y 7 preguntas reservadas para evaluacion, cada una presentada dos veces: solo con la pregunta y con recuperacion. La particion reserva referencias completas (no fragmentos) para evitar fugas. Durante el entrenamiento, la recuperacion se ejecuta unicamente contra fuentes de entrenamiento. El dataset incluye las preguntas y objetivos exactos en `data/train.jsonl` y `data/eval.jsonl`, y el repositorio documenta la reproduccion en `TRAINING.md` y la atribucion en `NOTICE.md`. No se menciona RLHF, DPO ni datos de entrenamiento adicionales.

## Capacidades

- Generacion de texto especializada en defensa de aplicaciones web: politicas de respuesta HTTP, cookies de sesion, cabeceras de cache, privacidad y transporte.
- Generacion aumentada por recuperacion (RAG) sobre un indice SQLite offline de notas editoriales de referencia.
- Citacion de fuentes: cuando hay evidencia recuperada, la respuesta cita la fuente; cuando la recuperacion falla, el modelo declara la falta de evidencia.
- Integracion en el ecosistema ClusterFK como especialista seleccionable en modos Solo y Collaborate, con definicion de equipo de tres asientos en `clusterfk-team.json`.
- Ejecucion local mediante `ask_transformers.py` con PyTorch, Transformers (con soporte Qwen3Next), Accelerate, PEFT y safetensors.
- Capacidad de cualificacion mediante `qualify.py`, que repite tres preguntas de generacion libre y captura respuestas, citas y tiempos.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Auditoria de cabeceras de seguridad HTTP: el modelo responde consultas sobre politicas de respuesta (por ejemplo, configuracion de cabeceras de transporte y cache) citando las notas de referencia recuperadas, lo que permite justificar cada recomendacion ante un revisor.
- Revision de configuracion de cookies de sesion: dado que el especialista cubre cookies de sesion y privacidad, se puede usar como asistente de revision en equipos de desarrollo web que necesitan verificar atributos y politicas sin consultar documentacion dispersa.
- Asistente interno de seguridad para equipos de plataforma: integrado en ClusterFK en modo Collaborate, permite a varios analistas consultar el mismo especialista con trazabilidad de fuentes.
- Formacion y onboarding de desarrolladores: las respuestas con citas y la declaracion explicita de evidencia faltante hacen del modelo un material didactico util para explicar politicas de respuesta web.
- Evaluacion de pipelines RAG en dominios de seguridad: el repositorio incluye datos de entrenamiento y evaluacion, lo que permite reproducir el flujo de recuperacion y medir la calidad de las citas en un dominio acotado.
- Verificacion de cumplimiento de privacidad en respuestas HTTP: el modelo puede orientar sobre que cabeceras afectan a la privacidad del usuario, con la salvedad de que su alcance es experimental y en ingles.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son metricas internas de evaluacion sobre 7 preguntas reservadas, con precision top-1 forzada por profesor y perdida de entropia cruzada media:

| Condicion reservada | Tokens de respuesta | Base top-1 | Adapter top-1 | Perdida base | Perdida adaptador |
|---|---:|---:|---:|---:|---:|
| Solo pregunta | 121 | 43,80 % | 44,63 % | 4,080 | 4,050 |
| Pregunta con recuperacion | 322 | 67,08 % | 67,08 % | 2,081 | 2,044 |

Ademas, el indice devolvio la fuente relevante entre sus dos primeros resultados en 7 de 7 preguntas reservadas. El autor advierte que las preguntas y notas se redactaron conjuntamente, por lo que se trata de una comprobacion de recuperacion pequena y en distribucion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El script de referencia carga el checkpoint base completo en BF16, por lo que requiere memoria de dispositivo o de host suficiente para el checkpoint base completo.
- El runtime alojado usa expertos empaquetados en MXFP4 con cache acotada, lo que reduce los requisitos frente a la carga BF16, pero no se especifican cifras.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PyTorch con Transformers (soporte Qwen3Next), Accelerate, PEFT y safetensors mediante `ask_transformers.py`; integracion en la plataforma ClusterFK. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; `qualify.py` registra tiempos de generacion para revision, pero no se publican cifras en la informacion disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo es un adaptador LoRA especializado de dominio muy acotado sobre Qwen/Qwen3-Coder-Next, por lo que una comparacion directa exigiria datos del modelo base y de otros adaptadores de seguridad web que no se han facilitado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cybermodels-web-defense | no disponible (adaptador LoRA) | no disponible | apache-2.0 | Hugging Face |
| Qwen/Qwen3-Coder-Next (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de seguridad web | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance muy reducido: 18 preguntas de entrenamiento y 7 de evaluacion; las metricas publicadas no permiten extrapolar precision general ni calidad de citas.
- Evaluacion en distribucion: preguntas y notas se redactaron conjuntamente, lo que puede inflar los resultados de recuperacion.
- Idioma unico: solo ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: aunque el modelo declara evidencia faltante cuando la recuperacion falla, no hay evaluacion publicada de la tasa de alucinacion en dominios no cubiertos.
- Dependencia del indice SQLite offline: la calidad de las respuestas depende de la cobertura y actualizacion de las notas de referencia incluidas.
- Requisitos de memoria: la carga en BF16 del checkpoint base completo exige recursos considerables; el runtime empaquetado MXFP4 del servicio alojado puede no ser reproducible localmente con los mismos resultados.
- Licencia Apache 2.0 para el adaptador, pero el uso comercial del modelo base Qwen/Qwen3-Coder-Next queda sujeto a su propia licencia, no detallada en la informacion disponible.
- Version v0.1: el autor indica que el comportamiento puede variar segun la version; conviene consultar la fuente enlazada para la redaccion exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyperionGrayAI/cybermodels-web-defense
- Dataset de equipo y perfil de sala: https://huggingface.co/datasets/HyperionGrayAI/cybermodels-team
- Plataforma ClusterFK: https://clusterfk.hgws.sh
- Resultados de cualificacion alojada: `hosted-checks.json` (en el repositorio del modelo)
- Documentacion de reproduccion: `TRAINING.md` (en el repositorio del modelo)
- Atribucion: `NOTICE.md` (en el repositorio del modelo)
