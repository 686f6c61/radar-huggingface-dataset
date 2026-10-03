# Christeck/anima-light-GGUF

## Resumen

Anima Light es un ajuste fino por LoRA de google/gemma-3-1b-it, fusionado con los pesos base y cuantizado a GGUF por el desarrollador Christeck. Se trata de un modelo de aproximadamente 1.000 millones de parametros (999.885.952) orientado a inferencia en dispositivo (on-device), pensado para ejecutarse en telefonos con 4 GB de RAM. Es el modelo gratuito de AI-Diary, una aplicacion de diario personal que corre enteramente en el telefono, y es el hermano pequeno de Anima Deep.

El modelo se distribuye ya cuantizado en GGUF (fichero principal de 0,72 GB en Q4_0), lo que lo hace directamente consumible con llama.cpp. Soporta espanol e ingles, con un enfoque explicito en respuestas cortas y en el uso de memoria e historial dentro de la conversacion. Segun el autor, mantiene la precision del modelo base en hechos basicos y memoria, pero con una quinta parte de las palabras y una lectura de prompt mas rapida en arquitecturas Arm.

Su relevancia actual reside en el nicho de asistentes conversacionales privados que no salen del dispositivo: a costa de renunciar a capacidad de razonamiento general, ofrece latencia baja en moviles y un consumo de memoria muy reducido. No es un modelo de proposito general competitivo con modelos de mayor tamano, sino una receta de ajuste fino reproducible para un caso de uso concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 1B, afinado con LoRA y fusionado) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (v11, principal) y Q4_K_M (v8, version anterior) |
| Idiomas soportados | espanol (es), ingles (en) |
| Licencia | gemma (Gemma Terms of Use + Gemma Prohibited Use Policy) |
| Formato de pesos | GGUF (libreria llama.cpp) |

## Arquitectura y entrenamiento

Anima Light parte de google/gemma-3-1b-it, un transformer denso de aproximadamente 1B de parametros, al que se aplico un ajuste fino por LoRA. La receta de las versiones v10 y v11 (reconstruida tras v8) usa LoRA de rango 8, escala 5 (frente a 20 en v8), aplicado a las 26 capas del modelo, con learning rate 2e-5, 4 epocas y batch de 8, entrenado con MLX sobre la base cuantizada a 4 bits. La version v11 promedia los deltas LoRA de tres semillas distintas y los fusiona sobre los pesos originales en bf16; despues se convierte con llama.cpp y se cuantiza a Q4_0.

El dataset de ajuste consta de 214 ejemplos SFT escritos a mano en espanol e ingles, construidos con los prompts reales de la aplicacion: conversacion en modo corto y modo completo, hechos basicos, uso de memoria e historial, identidad y respuestas largas cuando se solicitan. Todos los ejemplos usan el trato informal "tu". No se menciona el uso de RLHF ni DPO. Una innovacion destacable es la eleccion de cuantizacion: las formas de los tensores de Gemma 3 1B no encajan con los super-bloques de las K-quant, por lo que un fichero "Q4_K_M" de este modelo es en realidad aproximadamente un 40 % Q5_0 y un 40 % Q8_0; Q4_0 aplica 4 bits reales sobre los pesos del transformer y llama.cpp lo reempaqueta al cargar para las instrucciones de producto escalar de Arm. El autor senala que el nombre del modelo procede de las instrucciones que recibe, no de un nombre entrenado.

## Capacidades

- Generacion de texto conversacional en espanol e ingles, con respuestas deliberadamente breves (mediana de 16 palabras en modo corto y 42 en modo completo).
- Uso de hechos proporcionados previamente en la conversacion (memoria de contexto): 46 de 48 en las pruebas del autor, frente a 17 en v8.
- Manejo de hechos basicos y hechos numericos en ambos idiomas, con resultados cercanos o superiores al modelo base.
- Identidad controlada: reconoce su propia identidad en 5 de 6 casos y no adopta identidades ajenas nunca entrenadas en 10 de 10 casos.
- Consistencia de registro linguistico: uso del trato informal "tu", con mezcla con formas impersonales ("se") en solo 3 de 50 respuestas.
- No filtra el andamiaje del prompt a la respuesta (0 casos de fuga, frente a 15 del modelo base).
- No se menciona soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Diario personal privado en el dispositivo: es el caso de uso original, integrado en la aplicacion AI-Diary, donde el modelo conversa sobre las entradas del usuario sin que ningun dato salga del telefono, apoyandose en su ventana de conversacion y en su capacidad de recordar hechos dados antes.
- Asistentes de bolsillo en telefonos de 4 GB: cualquier aplicacion que necesite un modelo de chat local y ligero (0,72 GB en Q4_0) puede empaquetarlo con llama.cpp y ofrecer respuestas sin conexion.
- Procesamiento de texto en tiempo real en moviles Arm: gracias a la velocidad de lectura de prompt en Q4_0 (109-169 tokens/s en un Pixel 7 Pro), es adecuado para tareas interactivas donde la latencia de entrada importa.
- Clasificacion o extraccion ligera con contexto aportado: puede responder a preguntas cuyas respuestas esten presentes en el prompt (uso de memoria al 46/48), lo que sirve para resumir o etiquetar contenido dado.
- Prototipado de recetas de ajuste fino de bajo coste: al publicar el detalle de la receta LoRA, sirve como ejemplo reproducible (214 ejemplos, rango 8, escala 5) para quien quiera adaptar Gemma 3 1B a un dominio concreto.
- Base para despliegues con gramatica de muestreo restrictiva: dado que el autor filtra scripts no latinos con una gramatica de sampling, el modelo encaja en pipelines que impongan restricciones de salida a nivel de decodificacion.
- Redaccion de respuestas cortas y directas en espanol informal: util en interfaces de chat donde se prefiere una o dos frases frente a listas largas, siempre que no se requiera maxima utilidad explicativa.

## Benchmarks y rendimiento

Los datos siguientes proceden de las suites propias del autor (no son benchmarks publicos estandar) y se ejecutaron sobre este GGUF con el prompt real de la aplicacion.

| Prueba | Gemma 3 1B-it | Anima Light v8 | Anima Light v11 |
|---|---|---|---|
| Hechos basicos, modo completo / corto (de 60) | 53 / 48 | 39 / 40 | 49 / 52 |
| Hechos numericos en espanol / ingles (de 24) | 17 / 22 | 6 / 12 | 22 / 23 |
| Usa un hecho dado antes (de 48) | no disponible | 17 | 46 |
| Identidad (6) · identidades ajenas nunca entrenadas (10) | 5 · 8 | 5 · 8 | 5 · 10 |
| Utilidad al pedir ayuda (de 50) | 44 | no disponible | 31 |
| Mediana de palabras, chat en modo corto / completo | 92 / 237 | 17 / 16 | 16 / 42 |
| Respuestas de una o dos palabras | 5 | 105 | 0 |
| Andamiaje del prompt filtrado en la respuesta | 15 | 0 | 0 |
| Frases que mezclan "tu" informal con "-se" impersonal (de 50) | 9 | 2 | 3 |

En la suite publica Anima Bench (ES), la version v11 obtiene 76/126, cerca del modelo base (73) y por debajo de v8 (91). El autor advierte que, a 1B, distintas semillas de la misma receta difieren en varios puntos por fila, y que v11 es la media ("soup") de tres semillas, no la mejor.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q4_0 ocupa 0,72 GB; la version anterior Q4_K_M ocupa 0,81 GB. Cabe en telefonos de 4 GB de RAM, segun el autor.
- GPU de escritorio: no especificadas en la informacion disponible. Estan disenadas para CPU y aceleracion NPU/Arm en moviles.
- Consumer GPU: no se detalla compatibilidad con GPUs de consumo concretas (RTX 4090, etc.) en la informacion proporcionada.
- Despliegue: llama.cpp (confirmado; el autor usa `llama-cli`). Al ser formato GGUF, es compatible con los runtimes que soporten dicho formato, aunque no se confirman otros en la documentacion.
- Rendimiento medido: en un Pixel 7 Pro, lectura de prompt de 109-169 tokens/s en Q4_0, frente a 41-66 tokens/s en Q4_K_M (entre 2,5 y 3 veces mas rapido).
- Latencia y throughput de generacion: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Anima Light (este) | ~1B | GGUF, 0,72 GB (Q4_0) | no disponible | gemma | Ajuste fino LoRA de Gemma 3 1B-it, orientado a diario en dispositivo |
| Gemma 3 1B-it (base) | ~1B | safetensors / GGUF segun distribucion | no disponible | gemma | Modelo base; mas utilidad explicativa (44/50) pero respuestas mucho mas largas |
| Anima Deep | no disponible | GGUF | no disponible | gemma | Modelo hermano, del mismo autor; no se detallan sus especificaciones en la informacion disponible |

No se dispone en la informacion proporcionada de comparativas con otras familias de modelos de ~1B (por ejemplo alternativas de otros fabricantes).

## Limitaciones y advertencias

- Utilidad inferior al modelo base: al pedir ayuda puntua 31 sobre 50 frente a 44 del base, respondiendo en pocas frases en lugar de con listas. Dos rondas de datos no lograron superar el ruido entre semillas.
- Alucinacion en datos personales: ante un detalle que nunca se le dio, afirma algo en 14 de 16 casos (el base, en 11). El autor recomienda gestionarlo fuera del modelo (la aplicacion responde "no tengo eso guardado" sin generar).
- Espanol irregular: gramatical la mayor parte del tiempo, pero con frases retorcidas y palabras inventadas ocasionales.
- Tokens de otro alfabeto: en aproximadamente 1 de cada 800 respuestas de v11 puede aparecer un token suelto de otro script (bengali, cirilico) en medio de una palabra; la aplicacion lo elimina con una gramatica de muestreo.
- No esta entrenado para mantener su posicion bajo presion: versiones anteriores si lo estaban, pero a este tamano distorsionaba demasiado el resto, por lo que v11 lo deja al nivel del modelo base.
- No es un terapeuta: cualquier aplicacion que lo use deberia derivar situaciones de crisis a ayuda humana.
- Licencia Gemma: el uso esta sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; es una version modificada de Gemma 3 1B-it.
- Gemma 3 no tiene rol de sistema: las instrucciones deben colocarse al principio del primer turno de usuario.
- Longitud de contexto no documentada en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Christeck/anima-light-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Modelo hermano Anima Deep: https://huggingface.co/Christeck/anima-deep-GGUF
- Dataset Anima Bench (ES): https://huggingface.co/datasets/Christeck/anima-bench-es
- Aplicacion AI-Diary: https://christeck.com
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- LinkedIn del autor: https://www.linkedin.com/in/chris-teck
