# amandoti/cluemaster-1.0

## Resumen

Cluemaster 1.0 es un modelo de lenguaje de 3B parámetros especializado en un único cometido: actuar como spymaster (maestro de pistas) en el juego de mesa Codenames. Desarrollado por el usuario independiente amandoti, se trata de un fine-tune por LoRA sobre Ministral 3 3B Instruct (mistralai/Ministral-3-3B-Instruct-2512), publicado en formato GGUF cuantizado a Q4_K_M con un tamaño de 2,1 GB.

El problema que resuelve es concreto: dado un tablero de Codenames con las palabras propias, las del rival, las neutrales y el asesino, el modelo genera una pista de una palabra, el número de palabras objetivo y las palabras conectadas, precedidas de un breve brainstorm con su razonamiento. No es un modelo conversacional de propósito general; responde con una pista ante cualquier entrada.

Su relevancia radica en demostrar cómo un fine-tune barato (LoRA rango 16) sobre un modelo base pequeño puede superar con claridad a modelos generales mucho más grandes en una tarea vertical: en el benchmark propio Cluebench v1.0 obtiene un 60 % frente al 20 % de Phi-4 Mini 3.8B o Granite 4.1 3B, con solo un 4 % de pistas ilegales. Funciona localmente en Ollama, llama.cpp y LM Studio con unos 3 GB de memoria libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Ministral 3 3B Instruct), fine-tune LoRA |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (recomendado en el Modelfile de Ollama) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2,1 GB); base original en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Ministral 3 3B Instruct de Mistral AI, un transformer decoder instruido de unos 3B de parametros. El fine-tune se realizo con LoRA de rango 16 y alpha 32, aplicado a todas las capas de atencion y MLP del modelo base, lo que constituye un ajuste bastante completo para ser un metodo parametricamente eficiente.

No se han publicado detalles sobre el numero de tokens de entrenamiento ni la composicion exacta del dataset, mas alla de que se trato de tableros y pistas de Codenames con el formato de salida estructurado (brainstorm, Clue, Number, Words). El autor publico Cluebench v1.0, un benchmark con tableros reservados (held-out) sellados antes del entrenamiento y valoracion a ciegas de cada pista como good, ok o bad, lo que sugiere una separacion cuidadosa entre datos de entrenamiento y evaluacion. No hay informacion sobre RLHF o DPO.

## Capacidades

- Generacion de pistas de Codenames: dada una partida completa (equipo propio, rival, neutrales y asesino), produce una pista de una palabra, el numero de palabras objetivo y la lista de palabras conectadas.
- Razonamiento intermedio visible: antes de la pista emite un brainstorm que evalua candidatos, cuantas palabras conecta y el riesgo asociado (por ejemplo, colision con palabras neutrales).
- Formato de salida estructurado y parseable: las lineas `Clue:`, `Number:` y `Words:` facilitan la integracion programatica.
- Cumplimiento de reglas del juego: evita en la medida de lo posible pistas ilegales (palabras del tablero o formas de estas); en Cluebench solo el 4 % de sus pistas son ilegales y el 0 % invalidas.
- No es un modelo conversacional: cualquier mensaje recibido obtiene una pista como respuesta. No adivina palabras, solo da pistas.
- Sin soporte documentado de tool calling, agentes, vision ni audio; solo texto en ingles.

## Casos de uso

- Bot de spymaster para jugar a Codenames en linea: integrandolo en un cliente de Codenames (por ejemplo, via API de Ollama), el bot recibe el estado del tablero y devuelve la pista formateada, con filtrado de pistas ilegales aguas abajo.
- Cluemaster Studio como herramienta de asistencia: el autor ofrece una interfaz web (https://amandoti.win/cluemaster/studio.html) donde se introduce el tablero y se obtiene la pista con verificacion de reglas, util para jugar como humano con ayuda del modelo.
- Investigacion en razonamiento lexico-semantico: el benchmark Cluebench y el formato de brainstorm visible lo hacen util como baseline o sujeto de estudio en tareas de asociacion de palabras y seleccion bajo riesgo.
- Comparativa de fine-tunes verticales: sirve como caso de estudio de cuanto mejora un LoRA barato frente a modelos generales (Ministral 3 base pasa del 5 % al 60 % en Cluebench).
- Aplicaciones de juego local offline: con 2,1 GB de GGUF y unos 3 GB de RAM/VRAM, puede integrarse en apps de juegos de mesa digitales que deban funcionar sin conexion.
- Generacion de datos sinteticos de partidas: su salida estructurada permite recopilar partidas anotadas (pista, numero, objetivos) para entrenar agentes adivinadores o analizar estrategias de juego.

## Benchmarks y rendimiento

Resultados de Cluebench v1.0 publicados por el autor (valoracion a ciegas en tableros held-out, temperatura 0, modelo evaluado como Q4_K_M):

### Overall

| Model | Cluebench | Rated good | Acceptable | Legal first try | Illegal | Invalid | Seconds per board | Tokens per answer |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Cluemaster 1.0 | **60 %** | **44 %** | **68 %** | **96 %** | **4 %** | **0 %** | 2,5 s | 93 |
| Phi-4 Mini 3.8B | 20 % | 17 % | 34 % | 63 % | 37 % | 1 % | 1,4 s | 33 |
| Granite 4.1 3B | 20 % | 12 % | 33 % | 76 % | 24 % | 2 % | **0,6 s** | **19** |
| Ministral 3 3B | 5 % | 5 % | 19 % | 61 % | 39 % | 6 % | 2,8 s | 53 |
| Qwen 3.5 4B | 3 % | 13 % | 17 % | 25 % | 75 % | **0 %** | 1,9 s | 29 |

### Fresh boards

| Model | Score | Good | Acceptable | Illegal |
|---|---:|---:|---:|---:|
| Cluemaster 1.0 | **72** | **45 %** | **85 %** | **5 %** |
| Phi-4 Mini 3.8B | 33 | 32 % | 47 % | 37 % |
| Granite 4.1 3B | 22 | 12 % | 37 % | 25 % |
| Ministral 3 3B | 7 | 8 % | 23 % | 45 % |
| Qwen 3.5 4B | 0 | 2 % | 5 % | 90 % |

### Midgame (4 o mas palabras propias restantes)

| Model | Score | Good | Acceptable | Illegal |
|---|---:|---:|---:|---:|
| Cluemaster 1.0 | **40** | **32 %** | **45 %** | **5 %** |
| Phi-4 Mini 3.8B | 11 | 5 % | 27 % | 36 % |
| Granite 4.1 3B | 16 | 9 % | 27 % | 23 % |
| Ministral 3 3B | 3 | 0 % | 14 % | 27 % |
| Qwen 3.5 4B | 9 | 23 % | 27 % | 68 % |

### Endgame (3 o menos palabras propias restantes)

| Model | Score | Good | Acceptable | Illegal |
|---|---:|---:|---:|---:|
| Cluemaster 1.0 | **67** | **54 %** | **74 %** | **3 %** |
| Phi-4 Mini 3.8B | 16 | 16 % | 29 % | 38 % |
| Granite 4.1 3B | 23 | 16 % | 34 % | 24 % |
| Ministral 3 3B | 5 | 7 % | 19 % | 38 % |
| Qwen 3.5 4B | 1 | 15 % | 18 % | 65 % |

Nota: se trata de un benchmark propio del autor (pistas valoradas como good = 100, ok = 70, bad = 0, con penalizaciones de −10 a −25 por pistas invalidas o ilegales), no de benchmarks estandarizados independientes. No hay datos de MMLU, HumanEval ni otras suites generales.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3 GB de memoria libre; el GGUF Q4_K_M pesa 2,1 GB.
- Una GPU de 6 GB ejecuta el modelo completamente en GPU, segun la model card.
- Consumer GPUs: cualquier tarjeta con 6 GB o mas (por ejemplo, una RTX 3060 de 6 GB o superior) lo mueve entero en GPU. Tambien es viable en CPU con RAM suficiente.
- Opciones de despliegue: Ollama (con el Modelfile proporcionado), llama.cpp y LM Studio.
- Latencia: 2,5 segundos por tablero a temperatura 0 en el hardware del autor, generando unos 93 tokens por respuesta. Se recomienda parar tras 400 tokens porque puede seguir escribiendo respuestas adicionales.

## Comparativa con modelos similares

| Model | Parametros | Cluebench | Contexto | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Cluemaster 1.0 | 3,4B | 60 % | 4096 | Apache 2.0 | GGUF publico en HuggingFace |
| Phi-4 Mini 3.8B (Microsoft) | 3,8B | 20 % | no disponible en los datos | no disponible en los datos | modelo general, no especializado |
| Granite 4.1 3B (IBM) | 3B | 20 % | no disponible en los datos | no disponible en los datos | modelo general, no especializado |
| Qwen 3.5 4B (Alibaba) | 4B | 3 % | no disponible en los datos | no disponible en los datos | modelo general, no especializado |
| Ministral 3 3B Instruct (base) | 3B | 5 % | no disponible en los datos | no disponible en los datos | modelo base sin especializar |

Los comparadores son los modelos evaluados en Cluebench v1.0; todos son modelos generales de tamano similar, lo que ilustra la ventaja del fine-tune vertical. No hay datos de contexto ni licencia de los competidores en la informacion disponible.

## Limitaciones y advertencias

- Es un modelo de tarea unica: no conversa, no responde preguntas generales y devuelve una pista ante cualquier entrada. No sirve como asistente de proposito general.
- Solo funciona en ingles; no da pistas en castellano ni en otros idiomas.
- Aproximadamente el 4 % de sus pistas son ilegales (principalmente por ser o contener una palabra del tablero); en produccion conviene filtrarlas, como hace Cluemaster Studio.
- Los tableros de midgame (4 o mas palabras propias restantes) son su caso debil: solo un 45 % de pistas aceptables frente al 74 % en endgame.
- Puede continuar generando respuestas extra tras la primera; hay que cortar a los 400 tokens y parsear solo el primer bloque de Clue/Number/Words.
- Benchmark propio del autor: Cluebench v1.0 usa valoraciones a ciegas pero no ha sido auditado por terceros, y las comparaciones dependen del formato y temperatura fijados por el autor.
- Sin datos publicos sobre sesgos heredados del modelo base; al derivar de Ministral 3 3B Instruct, pueden persistir sesgos y riesgo de alucinacion del modelo original, aunque la salida restringida a pistas mitiga parcialmente ese riesgo en su dominio.
- Licencia Apache 2.0: sin restricciones de uso comercial, aunque al ser derivado de Ministral 3 3B Instruct de Mistral AI conviene revisar los terminos del modelo base para usos sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amandoti/cluemaster-1.0
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Cluemaster Studio (demo web del autor): https://amandoti.win/cluemaster/studio.html
- Paper, repositorio de codigo de entrenamiento o demo adicional: no disponible
