# breakingchad/vaudeville-qwen3-1.7b-sft

## Resumen

Vaudeville Qwen3-1.7B SFT es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario breakingchad. Su proposito es muy concreto: responder exclusivamente a partir de los documentos incluidos en el prompt, citando la frase exacta que respalda cada afirmacion y absteniendose cuando la respuesta no figura en los registros proporcionados. El adaptador se entrena para el juego de misterio "The Killing at Vaudeville", donde cada aldeano es la misma instancia del modelo leyendo registros privados distintos.

El modelo aborda el problema de la alucinacion en tareas de question answering con grounding documental. Segun los datos de la model card, el adaptador SFT reduce las afirmaciones no respaldadas del 72,0 % al 0,4 % en casos no vistos, y eleva la precision de respuesta del 11,0 % al 97,4 %. Se trata de un adaptador pequeno (repo de 0,1 GB) sobre un modelo de 1.700 millones de parametros, con licencia Apache 2.0 y soporte unicamente en ingles.

La relevancia de esta ficha radica en que documenta un caso de uso muy especializado: un modelo de 1.7B ajustado con SFT para citacion estricta y abstencion. No es un modelo de proposito general, sino una pieza de un sistema mayor (el juego) y una demostracion de que el ajuste fino supervisado con verificacion determinista puede eliminar practicamente las afirmaciones no sustentadas en dominios cerrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r16, alpha 32, dropout 0.05) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | 1.700 millones (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-1.7B, un transformer decoder-only del que la informacion proporcionada no detalla la arquitectura interna mas alla del nombre. El ajuste es un LoRA de rango 16, alpha 32 y dropout 0.05, aplicado a todas las capas lineales. El entrenamiento se realizo con el modo "thinking" desactivado del modelo base y con un unico formato de prompt: el system prompt de aldeano del repositorio, con cada frase de documento en su propia linea con el formato `[D1.S2] text`.

Los datos de entrenamiento consisten en 4.794 tareas generadas de casos de asesinato, donde cada respuesta dorada fue verificada por un checker determinista escrito en Python puro (sin juez LLM). Se entreno durante 1 epoca con learning rate 2e-4. Las herramientas empleadas fueron AlignTune (backend TRL), CuratorKIT, AuditKIT y SGLang 0.5.9. No se menciona en la informacion disponible el uso de RLHF ni DPO para este adaptador SFT concreto; la variante posterior con GRPO se publica como un modelo separado.

## Capacidades

- Generacion de texto con grounding estricto: responde solo a partir de los documentos incluidos en el prompt.
- Citacion a nivel de frase: cada afirmacion se acompana de la referencia `[Dx.Sy]` correspondiente.
- Abstencion explicita: cuando la respuesta no esta en los registros, emite `<abstain reason="not_in_records"/>`.
- Resistencia a ataques de prompt: segun la model card, mantiene 0,0 % de afirmaciones no respaldadas frente a inyecciones, premisas falsas y presion.
- Robustez ante reformulaciones de preguntas: 1,3 % de afirmaciones no respaldadas con nueva redaccion de la pregunta.
- Formato de salida estructurado: bloque `<answer>` con lineas `CLAIM: ... [Dx.Sy]`.
- No soporta tool calling ni function calling segun la informacion disponible.
- No se documentan capacidades de vision, audio ni modo thinking (de hecho, se recomienda desactivar thinking).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Question answering con grounding documental: el modelo responde preguntas sobre un conjunto de documentos incluidos en el prompt y cita la frase exacta que respalda cada afirmacion, lo que permite auditar la respuesta.
- Sistemas de retrieval-augmented generation (RAG) con requisito de citacion: puede actuar como generador final que solo afirma lo que aparece en los fragmentos recuperados y se abstiene si el contexto no contiene la respuesta.
- Asistentes de atencion al cliente con base de conocimiento cerrada: si la respuesta no figura en la documentacion interna, el modelo emite la linea de abstencion en lugar de improvisar, reduciendo el riesgo de informacion incorrecta.
- Agentes conversacionales en juegos de rol o simulaciones: es el caso de uso original, donde cada aldeano lee registros privados distintos y debe responder sin filtrar informacion que no posee.
- Verificacion de cumplimiento normativo: en flujos donde cada afirmacion debe estar respaldada por una clausula concreta de un documento, el formato `CLAIM: ... [Dx.Sy]` facilita la trazabilidad.
- Evaluacion de pipelines de grounding: sirve como referencia para medir la tasa de afirmaciones no respaldadas de otros modelos o configuraciones en tareas de QA documental.
- Despliegue con SGLang y multiples adaptadores LoRA: la model card documenta el servicio del modelo base con `--enable-lora --lora-paths villager=<ruta>`, lo que permite servir varias instancias del mismo modelo con adaptadores distintos.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con el checker determinista del proyecto (Python puro, sin juez LLM) y decodificacion greedy salvo donde se indica:

| Conjunto de prueba | Metrica | Sin entrenar | SFT | SFT + GRPO |
|---|---|---|---|---|
| Casos no vistos | Afirmaciones no respaldadas | 72,0 % | 0,4 % | 0,2 % |
| Casos no vistos | Precision de respuesta | 11,0 % | 97,4 % | 98,1 % |
| Ataques (inyecciones, premisas falsas, presion) | Afirmaciones no respaldadas | 67,8 % | 0,0 % | 0,0 % |
| Ataques | Precision de respuesta | 19,7 % | 98,4 % | 98,4 % |
| Nueva redaccion de preguntas | Afirmaciones no respaldadas | 72,1 % | 1,3 % | 0,9 % |
| Nueva redaccion de preguntas | Precision de respuesta | 8,6 % | 83,5 % | 85,0 % |
| Validacion, 4 intentos muestreados (T = 0,8) | Preguntas falladas al menos una vez | no disponible | 4,5 % | 2,2 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de un modelo base de 1.7B, el adaptador anade una sobrecarga pequena sobre los requisitos del modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Capacidad en GPU de consumo: no disponible en la informacion proporcionada; el tamano del modelo base (1.7B) sugiere que podria caber en GPU de consumo, pero no se confirma en la informacion.
- Opciones de despliegue: SGLang 0.5.9 con soporte LoRA (`--enable-lora --lora-paths villager=<ruta>`), y carga directa con `peft` y `transformers` en Python. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria (adaptadores LoRA para grounding y citacion sobre modelos de ~1.7B). El unico modelo relacionado mencionado es la variante posterior `breakingchad/vaudeville-qwen3-1.7b-sft-grpo`, que parte de este mismo adaptador y anade entrenamiento con GRPO.

## Limitaciones y advertencias

- Entrenado en un unico dominio sintetico (registros de aldea en un formato de prompt fijo); no esta pensado para chat abierto ni para conocimiento general del mundo.
- Requiere usar el constructor de prompt `build_messages` del repositorio para obtener resultados optimos; otros formatos pueden degradar el rendimiento.
- Es necesario desactivar el modo thinking del modelo base (`enable_thinking=False`).
- Soporte unicamente en ingles.
- Riesgo de alucinacion fuera del dominio de entrenamiento: el modelo no fue disenado para responder preguntas generales ni para generar texto libre.
- La evaluacion se realizo con el checker determinista del propio proyecto, no con benchmarks estandar, lo que limita la comparabilidad con otros modelos.
- Licencia Apache 2.0, que permite uso comercial del adaptador; deben respetarse las condiciones del modelo base Qwen3-1.7B.
- El adaptador tiene solo 14 descargas y 0 likes en el momento de la consulta, por lo que su validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/breakingchad/vaudeville-qwen3-1.7b-sft
- Variante con GRPO: https://huggingface.co/breakingchad/vaudeville-qwen3-1.7b-sft-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto (codigo, juego y resultados): https://github.com/antrip03/syntax_error26
- Constructor de prompt del proyecto: https://github.com/antrip03/syntax_error26/blob/main/archive/tasks/prompt.py
