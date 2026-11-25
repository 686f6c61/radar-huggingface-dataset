# queelius/borrowed-stars-npc-gemma3-1b-32k-GGUF

## Resumen

`borrowed-stars-npc-gemma3-1b-32k-GGUF` es un ajuste fino del modelo `google/gemma-3-1b-it` de Google, publicado por el usuario queelius y empaquetado en formato GGUF con cuantización `Q4_K_M`. Su propósito es muy concreto: actuar como motor de NPC (personajes no jugadores) y narrador interactivo dentro de un videojuego de rol offline llamado *Borrowed Stars* (Anima RPG Engine). El modelo emite siempre un único objeto JSON con tres campos —`mood`, `line` y `calls`— donde `line` es diálogo en personaje y `calls` contiene entre cero y dos llamadas a herramientas del juego validadas contra un contrato de 23 herramientas (versión 2.1).

La innovación principal no está en el entrenamiento sino en la poda del vocabulario: se recorta el tokenizador SentencePiece nativo de 262.144 a 32.768 tokens mediante segmentación del protobuf nativo, lo que reduce el tamaño del modelo de 999,9 M a 735,6 M parámetros y el fichero cuantizado de 776,5 MB a 495,5 MB. Según el autor, esto además acelera la inferencia en CPU alrededor de un 77 % con cuatro hilos. El resultado está diseñado para ejecutarse íntegramente en CPU, sin contención de GPU, en un portátil convencional.

Es relevante ahora porque ejemplifica una tendencia práctica: modelos pequeños, altamente especializados y con decodificación restringida por gramática (GBNF) que sustituyen a LLM genéricos en tareas acotadas donde la latencia, el coste y la previsibilidad del formato importan más que la amplitud de capacidades. La ficha, sin embargo, debe leerse con cautela: el modelo tiene cero descargas y cero likes en el momento de la consulta, y todas las métricas proceden exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: google/gemma-3-1b-it) |
| Parametros totales | 735.644.800 (tras poda de vocabulario desde 999,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens de vocabulario nativo; el ejemplo de despliegue usa `-c 2048` |
| Tipos de cuantizacion | Q4_K_M (GGUF); el autor menciona el tag `q4_k_m` para `muse` |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma Terms of Use (heredada de google/gemma-3-1b-it) |
| Formato de pesos | GGUF (librería `gguf`, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 con 1.000 millones de parámetros aproximadamente y un vocabulario nativo de 262.144 tokens. Sobre esa base, el autor aplica un ajuste fino orientado a una tarea única (generación de JSON estructurado para NPC con llamadas a herramientas) y después una poda del vocabulario mediante segmentación del protobuf nativo de SentencePiece, conservando 32.768 tokens. Según la model card, esta poda mantiene la decodificación de espacios correcta en llama.cpp y reduce el tamaño del fichero cuantizado a `Q4_K_M` de 776,5 MB a 495,5 MB.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El autor sí menciona una "calibración" reflejada en un `val_bpb` de 0,4107 sobre un conjunto de validación retenido, y un conjunto de evaluación congelado de 120 filas sobre el contrato de 23 herramientas v2.1. La innovación técnica destacable es la combinación de un modelo pequeño con decodificación restringida por gramática GBNF (`npc_grammar_v2.gbnf`), que garantiza el esquema JSON y la validez de los identificadores de objeto del juego.

## Capacidades

- Generación de un único objeto JSON con esquema fijo `{"mood", "line", "calls"}` en cada turno.
- Diálogo en personaje (role-play) con tono, estado de ánimo y registro definidos por el prompt de sistema.
- Llamada a herramientas (tool calling) restringida a un contrato de 23 herramientas del juego, con cero a dos llamadas por turno.
- Cumplimiento de esquema garantizado cuando se usa la gramática GBNF incluida.
- Disciplina de conversación pura: devuelve `calls: []` cuando no procede invocar herramientas (100 % en 44 casos según el autor).
- Gestión de estado de juego codificado en cabeceras compactas (`[LOC]`, `[NPC]`, `[PLAYER]`, `[QUESTS]`, `[FACTS]`, etc.).
- Capacidad de rechazo ante intentos de explotación (6 clases de rechazo evaluadas).
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni razonamiento multi-paso general; el modelo está especializado y no se presenta como un asistente de propósito general.

## Casos de uso

- NPC conversacional en videojuego offline: el modelo recibe el estado del mundo en cabeceras compactas y devuelve diálogo más acciones de juego, ejecutándose en CPU sin GPU y con un turno completo de 2,6–3,0 s en un Ryzen 5 7430U.
- Entrega de objetos y ajuste de relaciones: mediante las herramientas `give_item` y `adjust_trust`, el NPC puede entregar un `salt_loaf` o modificar la confianza del jugador como parte de la respuesta, validado por gramática.
- Narrador interactivo: el mismo modelo puede emitir líneas de narración en personaje cuando se le presenta el estado de la escena, manteniendo coherencia con los hechos canónicos inyectados en `[FACTS]`.
- Sistemas de diálogo con ramificación: la herramienta `steer_dialogue_node` permite que el modelo dirija la conversación hacia nodos predefinidos del árbol de diálogo, útil para quests guionizadas.
- Prototipado rápido de NPC en entornos con hardware modesto: al caber en 495,5 MB y correr a 48–51 tok/s de decodificación en CPU, permite iterar sobre guiones y prompts sin infraestructura de GPU.
- Despliegue local con API compatible con OpenAI: `llama-server` expone `/v1/*`, de modo que un motor de juego puede integrarlo como si fuera un endpoint remoto, con gramática GBNF aplicada en servidor.
- Filtrado de seguridad en diálogo: las pruebas de rechazo (86,7 % de acierto en 6 clases) sugieren su uso como capa de contención frente a prompts que intentan romper el personaje o extraer nombres no canónicos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (conjunto de evaluación congelado de 120 filas, contrato de 23 herramientas v2.1, y portátil con Ryzen 5 7430U a 6 hilos de CPU):

| Metrica | Valor |
|---|---|
| Tamano GGUF (`Q4_K_M`) | 495,5 MB |
| Parametros | 735,6 M (32K SentencePiece podado desde 999,9 M / 262K vocab) |
| `val_bpb` en retenido | 0,4107 (marcado como "#1 calibration" por el autor) |
| Esquema JSON sin restriccion (antes de GBNF) | 90,8 % |
| F1 en 23 herramientas (antes de GBNF) | 0,716 (P=0,83 / R=0,63) |
| Tasa de rechazo anti-exploit (6 clases) | 86,7 % (26/30) |
| Disciplina `calls: []` en chitchat puro | 100,0 % (44/44) |
| Fugas de nombres retirados / OOC | 0,00 % (0/120) |
| Velocidad en CPU de portatil | 48–51 tok/s decodificacion, 172 tok/s prefill, ~2,6–3,0 s por turno |
| `llama.cpp` + `npc_grammar_v2.gbnf` en vivo | 4/4 validos (`give_item`, `steer_dialogue_node`, rechazo, chitchat) |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son internas del autor y no comparables con evaluaciones públicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de uso previsto (CPU); en GPU, el fichero `Q4_K_M` de 495,5 MB cabe holgadamente en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer (RTX 3060, RTX 4090, etc.) puede alojarlo, aunque el diseño está pensado para CPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del fichero.
- Opciones de despliegue: `llama-server` (llama.cpp) con gramática GBNF y API compatible con OpenAI `/v1/*`; también `muse pull hf://...@q4_k_m` según la model card. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 48–51 tok/s de decodificación, 172 tok/s de prefill y 2,6–3,0 s por turno completo en Ryzen 5 7430U con 6 hilos de CPU (dato del autor). No se proporcionan cifras para GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks públicos ni de comparaciones directas en la información proporcionada. Se ofrece una comparación estructural con alternativas plausibles de la misma categoría (modelos pequeños para NPC y tool calling en local):

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| borrowed-stars-npc-gemma3-1b-32k-GGUF | 735,6 M (podado) | 32.768 vocab nativo; uso a 2.048 en el ejemplo | GGUF `Q4_K_M` | Gemma Terms of Use | Especializado en JSON de NPC y 23 herramientas; métricas solo del autor |
| google/gemma-3-1b-it | ~1.000 M | 32.768 (según familia Gemma 3) | safetensors, GGUF (comunidad) | Gemma Terms of Use | Modelo base instructivo de propósito general; sin especialización en JSON de juego |
| Qwen2.5-1.5B-Instruct (GGUF) | ~1.500 M | 32.768 | GGUF (comunidad) | Apache 2.0 (según versión) | Alternativa generalista con tool calling; no especializada en NPC ni en gramática de juego |
| Llama-3.2-1B-Instruct (GGUF) | ~1.200 M | 131.072 | GGUF (comunidad) | Llama 3.2 Community License | Mayor contexto; requiere ingeniería de prompt para JSON estricto |

Los datos de los modelos alternativos proceden de conocimiento general y no de la información proporcionada; deben verificarse en sus respectivas model cards antes de usarse en una decisión técnica.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera del contrato de NPC de *Borrowed Stars* su utilidad es dudosa; no es un asistente general.
- Idioma: solo inglés (`en`); no se documenta soporte multilingüe.
- Métricas no auditadas: todos los benchmarks proceden del autor, sin replicación independiente; el modelo tiene cero descargas y cero likes en el momento de la consulta.
- F1 de 0,716 en las 23 herramientas antes de GBNF: la precisión de selección de herramienta y argumentos no es alta sin restricción gramatical; el uso de GBNF es prácticamente obligatorio para producción.
- Tasa de rechazo anti-exploit del 86,7 %: implica que aproximadamente 1 de cada 7 intentos de explotación no se rechaza según la propia evaluación del autor.
- La poda de vocabulario a 32.768 tokens puede degradar el rendimiento en texto fuera del dominio del juego; el autor solo reporta que los espacios decodifican correctamente en llama.cpp.
- Licencia Gemma Terms of Use: impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de integración en producto.
- No se documentan sesgos, datos de entrenamiento ni proceso de alineación; el riesgo de alucinación en hechos del mundo es real si el prompt no inyecta `[FACTS]` canónicos.
- El contexto de despliegue sugerido es de 2.048 tokens (`-c 2048`), muy inferior al vocabulario nativo de 32.768; conversaciones largas requerirán gestión explícita del historial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/queelius/borrowed-stars-npc-gemma3-1b-32k-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Licencia Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Repositorio de llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Documentación de gramáticas GBNF en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/grammars/README.md
- No se han encontrado en la información disponible papers, blogs, repositorios del juego *Borrowed Stars* ni demos adicionales.
