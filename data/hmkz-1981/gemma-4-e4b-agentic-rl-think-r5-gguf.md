# hmkz-1981/gemma-4-e4b-agentic-rl-think-r5-GGUF

## Resumen

El modelo `hmkz-1981/gemma-4-e4b-agentic-rl-think-r5-GGUF` es una cuantizacion en formato GGUF del ajuste fino `hmkz-1981/gemma-4-e4b-agentic-rl-think-r5`, un modelo derivado de Google Gemma 4 E4B orientado a tareas de agente. El autor, hmkz-1981, ha aplicado un post-entrenamiento con refuerzo (GRPO) siguiendo el enfoque de NVIDIA Nemotron-3.5-Bolt, usando recompensas verificables programaticamente en multiples tareas. El resultado es un modelo pequeno (7.463 millones de parametros) especializado en seguimiento de instrucciones, jerarquia de instrucciones y uso de herramientas.

La relevancia de esta version GGUF radica en que permite ejecutar el modelo en llama.cpp y LM Studio, con cuantizaciones Q4_K_M, Q5_K_M y Q8_0 generadas mediante imatrix a partir de los datos de entrenamiento. El modelo conserva los encoders de imagen y audio originales de Gemma 4 (sin reentrenar), y soporta modos de pensamiento (thinking) y conversacional. Su licencia Apache 2.0 facilita el uso comercial.

El modelo esta disenado para entornos agente con instrucciones jerarquicas (prioriza system sobre usuario y resultados de herramientas), llamadas a herramientas bajo demanda, salida estructurada y respuestas con justificacion. Solo soporta japones e ingles, lo que limita su uso en castellano sin evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B) con post-entrenamiento GRPO y LoRA (r=32) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (con imatrix), mmproj-BF16 para vision/audio |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors/BF16 |

## Arquitectura y entrenamiento

El modelo parte de Google Gemma 4 E4B, un transformer de 7.463 millones de parametros. Sobre esa base se aplico un pipeline de post-entrenamiento en cinco rondas de GRPO combinadas con SFT por destilacion de pistas y autodestilacion. Las recompensas se verifican programaticamente en siete tipos de tareas propias (seguimiento de instrucciones, jerarquia de instrucciones, uso de herramientas, salida estructurada, respuestas con justificacion, multi-turno y modo conversacional). Se uso LoRA con rango 32, fusionada tras cada etapa, con perdida tipo DAPO y 8 respuestas por pregunta. El entrenamiento se realizo en modo thinking.

Las rondas 2 y 3 incorporaron filtrado por dificultad; la ronda 4 anadio 54 tipos de restricciones no vistas (orientadas a IFBench); la ronda 5 incorporo el dataset OpenAI IH-Challenge y NVIDIA Nemotron-RL-instruction_following para reforzar la jerarquia de instrucciones. La autodestilacion uso respuestas propias y de Nemotron-3.5-Bolt-E4B que superaban todos los verificadores. Los encoders de imagen y audio no se reentrenaron y permanecen identicos a Gemma 4. El contexto maximo no se especifica en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en japones e ingles.
- Razonamiento con modo thinking activable mediante `chat_template_kwargs.enable_thinking`.
- Llamada a herramientas (tool use) mediante la interfaz OpenAI-compatible `tools`; el modelo decide cuando invocar y gestiona errores o informacion faltante.
- Jerarquia de instrucciones: prioriza las reglas del system prompt sobre instrucciones del usuario o de resultados de herramientas.
- Seguimiento de restricciones de formato, longitud y vocabulario (estilo IFEval/IFBench).
- Salida estructurada y respuestas con justificacion.
- Modo conversacional breve (maximo dos frases, sin Markdown) para lectura en voz alta.
- Entrada de imagen y audio a traves del fichero `mmproj-BF16.gguf` (encoders originales de Gemma 4, no reentrenados).
- No se documenta soporte nativo de castellano.

## Casos de uso

- Agentes con herramientas en produccion: el modelo puede integrarse en pipelines que requieran function calling con interfaz OpenAI, gestionando errores de herramienta y solicitando informacion adicional cuando falta, gracias al entrenamiento con recompensas verificables de tool use.
- Asistentes con politicas estrictas: util para sistemas donde el system prompt define reglas duras (por ejemplo, limites de actuacion o tono) que deben prevalecer sobre peticiones del usuario o contenido inyectado en resultados de herramientas, gracias a su entrenamiento en instruction hierarchy.
- Generacion de respuestas con formato controlado: adecuado para tareas que exijan restricciones exactas de longitud, palabras prohibidas o estructuras fijas (JSON, listas), evaluadas en IFEval e IFBench.
- Respuestas con justificacion: para dominios donde se requiere que el modelo razone y cite la base de su respuesta, gracias al entrenamiento especifico en respuestas fundamentadas.
- Interfaces de voz o lectura: el modo conversacional (dos frases, sin Markdown) permite generar respuestas breves para sintesis de voz o asistentes hablados.
- Procesamiento multimodal ligero en local: con el fichero mmproj-BF16 se pueden enviar imagenes o audio a un modelo de 7.400 millones de parametros en hardware de consumo mediante llama.cpp.
- Despliegue en local con LM Studio o llama.cpp: para prototipos de agentes en estaciones de trabajo sin GPU de datacenter, usando Q4_K_M (4,94 GiB).

## Benchmarks y rendimiento

Resultados publicados por el autor (modelo BF16, no GGUF; evaluados con EvalScope, codigo oficial de IHEval y prompts oficiales de MultiChallenge; juez GPT-4o; todos en modo thinking):

| Benchmark | Gemma 4 E4B (original) | Este modelo | Nemotron-3.5-Bolt-E4B |
|---|---|---|---|
| IFEval (prompt strict) | 85.6 | 88.9 | 90.9 |
| IFBench (prompt strict) | 35.3 | 43.8 | 60.5 |
| IHEval (conflict) | no disponible | 81.7 | 84.0 |
| BFCL-v3 (overall) | 64.0 | 64.9 | 65.4 |
| MultiChallenge | no disponible | 43.3 | no disponible |

Calidad de cuantizacion (frente a BF16, en textos ja/en no vistos):

| Fichero | Formato | Tamano | Mean KLD | Same top p |
|---|---|---|---|---|
| Q4_K_M | GGUF | 4,94 GiB | 0.0371 | 93.7% |
| Q5_K_M | GGUF | 5,33 GiB | 0.0130 | 96.2% |
| Q8_0 | GGUF | 7,43 GiB | 0.0021 | 98.3% |

## Requisitos de hardware

- VRAM estimada: Q4_K_M ~5 GiB, Q5_K_M ~5,5 GiB, Q8_0 ~7,5 GiB; el fichero mmproj-BF16 anade memoria para vision/audio.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con Q4_K_M o Q5_K_M; Q8_0 requiere al menos 8-10 GB libres.
- GPU profesionales recomendadas: A100, H100, L40S para despliegues concurrentes con llama.cpp o vLLM (vLLM requeriria pesos safetensors del modelo base, no el GGUF).
- Despliegue: llama.cpp (`llama-server -hf hmkz-1981/gemma-4-e4b-agentic-rl-think-r5-GGUF:Q4_K_M --jinja`), LM Studio, y cualquier runtime compatible con GGUF con soporte de plantilla Jinja.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | IFEval (strict) | IFBench (strict) | Licencia |
|---|---|---|---|---|---|
| Este modelo (GGUF) | 7.463 M | no disponible | 88.9 | 43.8 | Apache 2.0 |
| Gemma 4 E4B (base) | 7.463 M | no disponible | 85.6 | 35.3 | Apache 2.0 |
| Nemotron-3.5-Bolt-E4B | no disponible | no disponible | 90.9 | 60.5 | OpenMDW |

El modelo mejora al Gemma 4 E4B original en IFEval (+3,3) e IFBench (+8,5), y queda por debajo de Nemotron-3.5-Bolt-E4B en ambas metricas y en IHEval. En BFCL-v3 los tres modelos estan practicamente empatados (64,0-65,4).

## Limitaciones y advertencias

- Conocimiento factual practicamente identico al Gemma 4 E4B original; el autor advierte que los errores facticos no se corrigen aumentando el esfuerzo de razonamiento. Para precision se recomienda combinar con busqueda o documentacion.
- Brecha de unos 17 puntos en IFBench frente a Nemotron-3.5-Bolt-E4B en restricciones finas no vistas.
- Puede rechazar preguntas dentro del ambito permitido cuando el system prompt delimita el alcance (comportamiento residual documentado por el autor).
- No se ha optimizado para tareas multi-turno largas tipo tau2-bench.
- Entrenamiento y evaluacion solo en japones e ingles; no hay evidencia de calidad en castellano.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Sesgos especificos no documentados; hereda los del modelo base Gemma 4.
- Licencia Apache 2.0 permite uso comercial, pero los pesos derivados de Gemma 4 pueden estar sujetos adicionalmente a las condiciones de Google para el modelo base.
- El fichero GGUF no incluye los encoders de vision/audio salvo que se descargue mmproj-BF16 por separado.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/hmkz-1981/gemma-4-e4b-agentic-rl-think-r5-GGUF
- Modelo base (BF16): https://huggingface.co/hmkz-1981/gemma-4-e4b-agentic-rl-think-r5
- Dataset allenai/IF_multi_constraints_upto5: https://huggingface.co/datasets/allenai/IF_multi_constraints_upto5
- Dataset nvidia/Nemotron-RL-instruction_following: https://huggingface.co/datasets/nvidia/Nemotron-RL-instruction_following
- Dataset openai/ih-challenge: https://huggingface.co/datasets/openai/ih-challenge
- Modelo profesor NVIDIA Nemotron-3.5-Bolt-E4B-BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Repositorio allenai/open-instruct (evaluador IFEvalG): https://github.com/allenai/open-instruct
