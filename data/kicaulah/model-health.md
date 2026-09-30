# Kicaulah/model-health

# Kicaulah/model-health

## Resumen

Kicaulah/model-health es un ajuste fino de dominio sanitario sobre Qwen/Qwen2.5-3B-Instruct, publicado por el usuario Kicaulah en HuggingFace. Se presenta como el especialista en salud de un sistema de agentes de cinco modelos servido tras un unico endpoint compatible con la API de OpenAI, con un router que deriva cada consulta al especialista correspondiente. El objetivo declarado no es tanto la precision clinica como el registro conversacional: un asistente calmado, informativo, en lenguaje llano, que no alarme ni culpabilice, que no diagnostique y que derive a un medico cuando detecta senales de alarma.

Tecnicamente es un modelo de ~3B parametros, decoder-only, con ajuste por QLoRA y posterior merge de la LoRA, segun los tags y el flujo de trabajo descrito en la model card (instruction-tuning, SFT, system-prompt). La model card indica una ventana de contexto de 4k y salida en formato safetensors, con licencia Apache-2.0 y soporte unicamente de ingles. Los pesos no estan publicados: la propia tarjeta lo advierte y remite al `scripts/03_train_health.py`, que entrena, fusiona la LoRA y sube los pesos en una GPU de 16 GB.

Su relevancia ahora es mas metodologica que de rendimiento: el autor publica el system prompt completo como el artefacto principal, reutilizable en cualquier modelo instruct, y plantea el repositorio como una plantilla de sistema multi-agente con enrutador y API compatible con OpenAI. Con cero descargas y cero likes en el momento de la consulta, y sin benchmarks publicados, debe tratarse como un proyecto incipiente y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; derivada del modelo base Qwen2.5-3B-Instruct (transformer decoder-only), ajustada mediante QLoRA |
| Parametros totales | ~3B (heredados del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4k (segun la insignia de la model card); no se documenta si se recorto respecto al modelo base |
| Tipos de cuantizacion | no disponible para publicacion; el pipeline de entrenamiento usa QLoRA, lo que implica cuantizacion en 4 bits durante el ajuste |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (declarado en la model card; los pesos no estan publicados) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion (segun HuggingFace) | 2026-09-30 |
| Ultima actualizacion (segun HuggingFace) | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna mas alla del modelo base, Qwen2.5-3B-Instruct, un transformer decoder-only de aproximadamente 3.000 millones de parametros. El ajuste se describe como un fine-tuning por QLoRA seguido de un merge de la LoRA en los pesos base (`merge-lora` aparece entre los tags), dentro de un flujo de instruction-tuning supervisado (SFT) orientado a fijar una persona conversacional concreta. No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO.

La innovacion que el autor destaca no es arquitectonica sino de comportamiento: el system prompt define explicitamente el registro (reassuring but honest), prohibe diagnosticar, prohibe recomendar medicamentos o dosis mas alla de "segun el prospecto" o "segun prescripcion", obliga a nombrar senales de alarma (dolor toracico, disnea grave, hemoptisis, sincope, debilidad subita, fiebre persistente) y evita aperturas roboticas del tipo "Certainly! Here's an explanation of...". El repositorio incluye ademas un script de servido (`scripts/serve.py`) que expone el sistema completo de cinco especialistas mas router bajo el protocolo OpenAI en `http://localhost:8000/v1`.

## Capacidades

- Generacion de texto conversacional en ingles con persona estable y tono no robotico.
- Orientacion sanitaria informativa: explica posibles causas y siguientes pasos practicos sin emitir diagnosticos.
- Deteccion y comunicacion explicita de senales de alarma ("red flags") con derivacion a atencion medica.
- Empatia y manejo emocional del interlocutor, con control explicito de no alarmismo y de no culpabilizacion.
- Reformulacion de jerga medica a lenguaje llano.
- Soporte de system prompt configurable, que es el mecanismo central del modelo y el artefacto que el autor recomienda reutilizar.
- Integracion en un stack multi-agente: cinco especialistas mas un router detras de un unico endpoint compatible con OpenAI, invocable con `model="kicaulah"`.
- Compatibilidad declarada con clientes que hablan el protocolo OpenAI: Open WebUI, LibreChat, Cline, Continue, Aider, LangChain y LiteLLM.
- Capacidades no documentadas: no se menciona tool calling, function calling, razonamiento multi-paso, vision, audio, modo de pensamiento ni generacion de codigo. El soporte multilingue se limita al ingles.

## Casos de uso

- Orientacion sanitaria de primer nivel en un chatbot publico: el modelo explica posibles causas de sintomas comunes en lenguaje llano y cierra siempre con una derivacion al medico cuando procede, lo que lo hace adecuado para paginas de educacion para la salud y no para triaje clinico real.
- Preconsulta o anamnesis guiada: puede recoger sintomas, duracion y factores de riesgo en una conversacion estructurada y entregar un resumen ordenado al profesional, aprovechando su registro calmado y su insistencia en las senales de alarma.
- Soporte a cuidadores y familiares: responde dudas sobre cuidados basicos, que vigilar y cuando acudir a urgencias, con un tono que evita el alarmismo, que es precisamente el comportamiento que el ajuste persigue.
- Educacion sanitaria y divulgacion: generacion de explicaciones sobre patologias o tratamientos sustituyendo jerga por lenguaje cotidiano, con la advertencia de que el contenido requiere revision por un profesional antes de publicarse.
- Formacion y simulacion de personal sanitario: su etiqueta `roleplay` y su persona estable permiten montar escenarios de practica conversacional con pacientes simulados, entrenando habilidades de comunicacion.
- Prototipado de arquitecturas multi-agente: el repositorio sirve como plantilla funcional de router mas especialistas sobre un endpoint compatible con OpenAI, reutilizable para otros dominios cambiando los system prompts.
- Base para fine-tuning vertical: al ser un ajuste sobre Qwen2.5-3B-Instruct con licencia Apache-2.0, puede emplearse como punto de partida para dominios sanitarios mas especificos, siempre que se disponga de datos propios y evaluacion clinica.
- Enrutado de consultas en un asistente generalista: como especialista de salud dentro de un sistema mayor, recibe unicamente las consultas derivadas por el router y mantiene un tono consistente con el resto de especialistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MedQA ni de ninguna otra evaluacion, no aporta comparaciones cuantitativas con modelos de su categoria y no documenta evaluaciones de seguridad clinica. Ademas, al no estar publicados los pesos, no es posible reproducir ninguna medicion de forma independiente. Cualquier cifra de rendimiento para este modelo seria una estimacion no verificada y no se incluye aqui.

## Requisitos de hardware

- Pesos: no publicados, por lo que no hay requisitos oficiales de inferencia. Las cifras siguientes son estimaciones a partir del tamano declarado (~3B) y no estan verificadas contra el modelo real.
- VRAM estimada en bf16/fp16: en torno a 6-7 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3-4 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2-3 GB.
- GPU consumer: un modelo de ~3B cabe con holgura en GPUs de 8 GB o mas (RTX 3060 Ti, 4060, 3070, 4060 Ti) y con margen en 12-16 GB (RTX 3060 12 GB, 4070, 4080, 4090). En Mac con memoria unificada de 16 GB o mas tambien seria viable.
- Entrenamiento: la model card indica que el script de entrenamiento y merge de la LoRA cabe en una GPU de 16 GB, citando explicitamente una Colab T4 como suficiente.
- Despliegue: la via documentada es `transformers` con `pipeline("text-generation")` y `device_map="auto"`; el repositorio incluye un servidor propio (`scripts/serve.py`) que expone el sistema multi-agente en `http://localhost:8000/v1`. Al ser un modelo estandar de transformers y con licencia Apache-2.0, seria compatible en principio con vLLM, TGI, Ollama o llama.cpp, aunque ninguna de estas opciones se menciona en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para Kicaulah/model-health, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de las alternativas no provienen de la informacion proporcionada en esta busqueda y se marcan como tales; conviene verificarlos antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| Kicaulah/model-health | ~3B | 4k (segun model card) | Apache-2.0 | no publicados (solo system prompt) |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | ~3B | no disponible en la informacion proporcionada | Apache-2.0 | publicados |
| Alternativas habituales de la misma categoria (Llama-3.2-3B-Instruct, Gemma-2-2B-it, Phi-3.5-mini-instruct) | rango 2-4B (dato externo, no verificado aqui) | no disponible | licencias distintas segun proveedor | publicados |

La diferencia funcional relevante frente al modelo base no es de rendimiento sino de comportamiento: el ajuste persigue una persona concreta y un conjunto de reglas de seguridad conversacional (no diagnosticar, no recomendar dosis, nombrar senales de alarma) que el modelo base no garantiza de fabrica. A cambio, el modelo base si esta disponible y si cuenta con evaluaciones publicas, mientras que este ajuste no ofrece ni pesos ni benchmarks.

## Limitaciones y advertencias

- Los pesos no estan publicados. La model card indica explicitamente que el repositorio todavia no contiene los tensores y que hay que ejecutar `scripts/03_train_health.py` para generarlos. Hoy por hoy, el unico artefacto utilizable es el system prompt.
- No hay ningun benchmark ni evaluacion publicada, ni clinica ni generalista, lo que impide estimar su calidad real frente al modelo base.
- No se documenta el dataset de entrenamiento: se desconoce su volumen, su origen, su fecha de corte y si contiene datos con derechos o informacion personal.
- Sesgos: no se documenta ningun analisis de sesgos. Un corpus sanitario no declarado puede incorporar sesgos demograficos, culturales o de accesibilidad, y el modelo solo cubre ingles.
- Riesgo de alucinacion en un dominio de alto impacto. Aunque el system prompt prohibe diagnosticar y recomendar dosis, un modelo de 3B puede generar afirmaciones clinicas incorrectas con total seguridad aparente. No es un producto sanitario ni sustituye atencion medica.
- Ventana de contexto de 4k, corta para historiales clinicos o conversaciones prolongadas con multiples sintomas.
- Solo ingles. No hay soporte documentado de castellano ni de otros idiomas.
- Sin soporte documentado de tool calling ni function calling, lo que limita su integracion en flujos que necesiten consultar fuentes externas o bases de datos clinicas.
- Cobertura de modelos: la model card describe a la vez "un sistema de cinco modelos" y "cinco especialistas mas un router" (seis prompts de sistema en la demo). Conviene verificar la composicion exacta antes de disenar una integracion.
- La fecha de creacion registrada en HuggingFace (2026-09-30) es posterior a la fecha de la mayoria de materiales de referencia, un detalle a comprobar en el repositorio.
- Uso en produccion sanitaria: la ausencia de evaluaciones clinicas y de documentacion regulatoria implica que un despliegue real con pacientes exigiria validacion propia, supervision profesional y analisis de encaje normativo (productos sanitarios, AI Act). Nada de esto se aborda en la model card.
- Advertencia de desambiguacion: los resultados de busqueda web sobre "Model Health" (modelhealth.io) corresponden a una empresa de analisis biomecanico por video, sin relacion conocida con este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kicaulah/model-health
- Perfil del autor en HuggingFace: https://huggingface.co/Kicaulah
- Listado de modelos del autor: https://huggingface.co/Kicaulah/models
- Demo en vivo del sistema: https://huggingface.co/spaces/Kicaulah/Kicaulah-AI-Demo
- Script de entrenamiento referenciado en la model card: `scripts/03_train_health.py`
- Script de servido referenciado en la model card: `scripts/serve.py`
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Resultados de busqueda web no relacionados con este modelo, incluidos por desambiguacion: https://www.modelhealth.io/ , https://www.modelhealth.io/product/app , https://www.modelhealth.io/product/sdk
