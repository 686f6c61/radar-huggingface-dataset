# Orbalapp/orb-1-mini

## Resumen

orb-1-mini es un modelo de limpieza de dictado desarrollado por Orbal. Su funcion no es conversar ni responder preguntas, sino recibir el texto que ha escrito un motor de reconocimiento de voz y devolver ese mismo mensaje corregido: elimina muletillas, palabras repetidas y arranques falsos, resuelve autocorrecciones, y arregla puntuacion, mayusculas y numeros. Mantiene las palabras del hablante y su orden; no resume, no acorta ni anade contenido.

Tecnicamente es un fine-tune de Qwen3.5-0.8B con 752.393.024 parametros (~752 M), destilado a partir de Qwen 3.8 27B y entrenado mediante un LoRA de rango 16 durante 2 epocas. Se distribuye cuantizado a 4 bits en formato MLX, ocupa 0,42 GB y esta pensado para ejecutarse en local sobre silicio de Apple. Es el modelo on-device de Orbal, una aplicacion de dictado para Mac.

El modelo es relevante porque aborda una tarea muy concreta y medible (post-procesado de transcripciones) con un modelo pequeno que cabe en un portatil. Su licencia Apache-2.0, heredada de Qwen3.5-0.8B, facilita su reutilizacion. Esta limitado al ingles y no se han publicado resultados en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 (~752 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se ha especializado mediante ajuste fino supervisado. El proceso fue una destilacion desde Qwen 3.8 27B: el modelo profesor genero 6.358 mensajes de ejemplo junto con una version hablada de cada uno, introduciendo muletillas, arranques falsos y autocorrecciones. Un tercio de esas versiones habladas se leyeron en voz alta con el comando `say` de macOS y se transcribieron con el motor de voz de Apple, para capturar errores de transcripcion reales. Todos los textos pasaron por las reglas de texto propias de Orbal.

El profesor limpio cada ejemplo cinco veces, una por cada prompt de sistema. De las respuestas, 19.806 superaron todas las comprobaciones (nada anadido, y conservacion de cada nombre, numero, negacion y palabra de senalizacion) y se usaron para entrenar un LoRA de rango 16 durante 2 epocas. Despues se fusiono con el modelo base y se cuantizo a 4 bits en MLX. No se utilizaron dictados de usuarios para el entrenamiento. El modelo incorpora un modo de pensamiento heredado de Qwen3.5, pero la model card indica explicitamente desactivarlo en inferencia.

## Capacidades

- Limpieza de dictado: elimina muletillas, repeticiones y arranques falsos, y resuelve autocorrecciones del tipo "el primero, no, el segundo".
- Normalizacion de formato: aplica puntuacion, mayusculas y conversion de numeros en casos como "twenty five percent" a "25%".
- Cinco prompts de sistema especializados: limpieza generica ("Shape this dictation.") y variantes para chat, correo, agente de IA y documento.
- Control de nombres propios: admite una linea de sistema para forzar la grafia exacta de nombres concretos.
- Conservacion estricta del contenido: mantiene las palabras y su orden sin resumir ni anadir informacion.
- Generacion de texto condicionada, con pipeline declarado de text-generation, aunque orientada exclusivamente a la tarea de post-procesado.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente autonomo.
- Capacidad multilingue: solo ingles; no se han probado otros idiomas.
- No dispone de vision ni audio; el modelo no transcribe voz, solo procesa texto ya transcrito.

## Casos de uso

- Limpieza de dictado en aplicaciones de escritorio: es el caso principal del modelo, integrado en Orbal para Mac, donde procesa en local sobre silicio de Apple sin enviar el texto a la nube.
- Post-procesado de transcripciones ASR: se coloca detras de cualquier motor de reconocimiento de voz para corregir el texto crudo antes de mostrarlo o almacenarlo.
- Redaccion de mensajes de chat: con el prompt "Shape this dictation for a chat message." limpia un dictado antes de enviarlo por mensajeria.
- Redaccion de correos: con el prompt "Shape this dictation for an email." prepara el texto de un correo, anadiendo en ocasiones saltos de parrafo.
- Entrada para agentes de IA: con el prompt "Shape this dictation for an AI agent." normaliza una instruccion dictada antes de pasarla a un sistema automatizado.
- Preparacion de documentos: con el prompt "Shape this dictation for a document." adapta el dictado a un registro mas formal.
- Flujos con requisitos de privacidad: al ejecutarse on-device con pesos de 0,42 GB, permite limpiar dictados sin salir del equipo, util en entornos con datos sensibles.
- Normalizacion de nombres y terminologia: usando la linea de sistema de grafia exacta, garantiza que nombres propios concretos se escriban siempre igual en pipelines de documentacion o atencion al cliente.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). La model card incluye una evaluacion propia sobre 178 dictados en ingles (171 reales del desarrollador de Orbal y 7 inventados), ninguno usado en entrenamiento, comparando orb-1-mini con dos versiones anteriores del propio autor.

| Metrica | orb-1-mini, limpieza | orb-1-mini, los otros cuatro prompts | Version anterior 0.8B (acortaba) | Version anterior 2B (acortaba) |
|---|---|---|---|---|
| Pasa la comprobacion de que no se anadio nada | 100% | 100% | 99% | 99% |
| Significado conservado (verificacion ciega por Qwen 3.8 27B) | 100% | 95% - 99% | 75% | 83% |
| Palabras de contenido conservadas | 100% | 97% - 99% | 85% | 87% |
| Respuestas con una palabra anadida (de 178) | 0 | 0 - 5 | 32 | 37 |
| Nombres inventados | 0 | 0 | 0 | 0 |
| Preguntas respondidas | 0 | 0 | 0 | 0 |

Ademas, la model card reporta velocidad con mlx-lm sobre un M1 Pro: carga en 1,1 s; un dictado tipico tarda 0,13 s, y 9 de cada 10 por debajo de 0,44 s. El tiempo escala con la longitud: un dictado de 347 palabras tardo 5,7 s.

## Requisitos de hardware

- VRAM estimada: los pesos en 4-bit MLX ocupan 0,42 GB; el consumo total depende de la cache KV y de la longitud del dictado, pero el modelo esta pensado para ejecutarse en equipos de consumo.
- Plataforma objetivo: silicio de Apple (MLX). Los datos de rendimiento publicados corresponden a un M1 Pro.
- GPU recomendadas: no disponible. Al distribuirse en formato MLX, esta orientado a chips Apple (serie M), no a GPU CUDA como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, dentro del ecosistema Apple silicon con memoria unificada suficiente; no esta empaquetado para GPU de consumo NVIDIA.
- Opciones de despliegue: mlx-lm (libreria declarada). No se indica soporte para vLLM, llama.cpp, Ollama o TGI con estos pesos.
- Latencia y throughput: sobre M1 Pro, 0,13 s por dictado tipico, por debajo de 0,44 s en el 90% de los casos y 5,7 s para un dictado de 347 palabras.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| orb-1-mini | ~752 M | Ingles | Limpieza de dictado | Apache-2.0 | HuggingFace (MLX 4-bit) |
| Qwen3.5-0.8B (base) | ~0.8 B | Multilingue | Generacion de texto general | Apache-2.0 | HuggingFace |
| Version anterior de Orbal 0.8B | ~0.8 B | Ingles | Acortado de dictado | no disponible | Interna, no publicada |
| Version anterior de Orbal 2B | ~2 B | Ingles | Acortado de dictado | no disponible | Interna, no publicada |

Frente al modelo base Qwen3.5-0.8B, orb-1-mini sacrifica generalidad y multilingueismo a cambio de una tasa de conservacion de contenido del 100% en la tarea de limpieza de dictado (frente al 75% y 83% de las versiones anteriores del propio autor). No se dispone de datos de otros modelos publicos comparables en esta tarea especifica.

## Limitaciones y advertencias

- Algunos numeros permanecen como palabras: por ejemplo "one point five seconds" o "the fourth of October" no siempre se convierten a formato numerico.
- Las autocorrecciones pueden quedar sin resolver: una frase como "the first one, actually no, the second one" puede mantenerse tal cual.
- Los cuatro prompts de estilo (chat, correo, agente, documento) cambian muy poco el resultado; el de correo a veces anade saltos de parrafo, pero en general se comportan de forma parecida al prompt de limpieza.
- Los dictados largos son lentos: el tiempo crece con la longitud, con 5,7 s para 347 palabras en el hardware de referencia.
- Solo ingles: no se han probado otros idiomas.
- No responde a preguntas ni resume; si se usa fuera de su tarea, su comportamiento no esta garantizado.
- Riesgo de alucinacion: la model card reporta 0 nombres inventados y 0 anadidos en sus pruebas, pero se trata de una evaluacion interna limitada a 178 dictados y no de una garantia general.
- Sesgos conocidos: no disponible.
- Uso comercial: permitido bajo Apache-2.0, con la obligacion de conservar el fichero NOTICE y acreditar "orb-1-mini by Orbal" si se comparte el modelo o un derivado.
- Restriccion de despliegue: al distribuirse en 4-bit MLX, el uso esta ligado a la libreria mlx-lm y al hardware Apple; no hay pesos GGUF ni safetensors estandar para otros backends.
- Desactivar el modo de pensamiento en inferencia, decodificar de forma greedy y limitar la respuesta a la longitud de la entrada en tokens mas 16 para reproducir el comportamiento esperado.

## Enlaces

- HuggingFace: https://huggingface.co/Orbalapp/orb-1-mini
- Aplicacion Orbal: https://orbal.app
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
