# DavidAU/L3.2-Rogue-Creative-Instruct-Uncensored-7B-GGUF

## Resumen
L3.2-Rogue-Creative-Instruct-Uncensored-7B-GGUF es la distribucion en formato GGUF del modelo DavidAU/L3.2-Rogue-Creative-Instruct-Uncensored-7B, un modelo de generacion de texto en ingles derivado de Llama-3.2-3B-Instruct-uncensored mediante la tecnica propietaria "Brainstorm 40x" del autor DavidAU. El modelo parte de la arquitectura Llama 3.2 y se ha expandido de 28 a 67 capas, alcanzando 7.532.860.480 parametros (605 tensores), con una ventana de contexto maxima de 131.072 tokens (128k+).

El objetivo del modelo es la escritura creativa sin restricciones: ficcion, generacion de tramas y subtramas, storytelling, roleplay y prosa vivida en todos los generos (ciencia ficcion, romance, terror, etc.). Segun el autor, la modificacion "Brainstorm 40x" altera drasticamente la prosa y la capacidad de generar detalle de escena, entorno y personajes, y permite controlar el nivel de censura directamente mediante el prompt. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

El modelo es relevante para quienes necesitan un modelo compacto (7,5B) orientado a escritura creativa, con contexto largo y comportamiento flexible ante parametros de muestreo extremos (temperaturas de 0 a 5). No es un modelo de proposito general ni esta orientado a tareas de codigo, matematicas o razonamiento formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.2), modificada con "Brainstorm 40x"; 67 capas |
| Parametros totales | 7.532.860.480 (605 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (128k+) |
| Tipos de cuantizacion | GGUF en varios niveles (Q2, Q3, Q4KM, Q4KS, Q5, Q6, Q8, IQ4XS y 3 variantes ARM) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 65,1 GB); el modelo base en safetensors/bfloat16 esta en el repo original |

## Arquitectura y entrenamiento
El modelo se construye sobre Llama-3.2-3B-Instruct-uncensored (chuanli11) y aplica la tecnica "Brainstorm 40x" desarrollada por DavidAU, que segun la model card expande el modelo en 39 capas adicionales hasta 67 capas y 7,54B parametros. La arquitectura subyacente es un transformer decoder-only de la familia Llama 3.2, con el tokenizer y la plantilla de chat de Llama 3.2 (se indica compatibilidad tambien con la plantilla "Command-R").

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card menciona el uso de "mergekit" entre las etiquetas, lo que sugiere tecnicas de fusion de modelos, pero no se especifica el procedimiento exacto. El autor afirma que el modelo conserva todo el entrenamiento del Llama 3.2 3B Instruct original y que la modificacion mejora el detalle, la prosa y el "decensoring". Se anuncia la publicacion del codigo fuente en un repositorio separado, pero no se confirma su disponibilidad.

## Capacidades
- Generacion de texto creativo: ficcion, relatos, novelas, poesia y prosa vivida en todos los generos (ciencia ficcion, romance, terror, etc.).
- Generacion de tramas y subtramas, continuacion de escenas y desarrollo de personajes con alto nivel de detalle.
- Roleplay y conversacion multi-turno, con control del nivel de censura mediante el prompt.
- Escritura con "PROSE CONTROL": el usuario puede forzar estilos concretos indicando etiquetas como "(vivid horror)" o "(graphic vivid horror)" en el prompt.
- Contexto largo de hasta 128k tokens, adecuado para manuscritos extensos o sesiones de rol prolongadas.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso
- Escritura de ficcion y novelas: el modelo genera prosa detallada y mantiene coherencia en manuscritos largos gracias a su contexto de 128k tokens; es adecuado para borradores de capitulos y desarrollo de escenas.
- Generacion de tramas y subtramas: util para guionistas y autores que necesitan explorar multiples lineas argumentales; el autor indica que temperaturas altas (2-3) producen variaciones muy diversas.
- Roleplay y juegos de rol de mesa: con rep pen de 1,1 a 1,14 y plantilla Llama 3, el modelo sostiene conversaciones multi-turno con personajes detallados y control de tono.
- Escritura de terror o generos especificos: mediante "PROSE CONTROL" en el prompt se puede forzar un estilo concreto (por ejemplo, terror grafico) sin cambiar de modelo.
- Continuacion de escenas y "scene continue": util para superar bloqueos creativos o ampliar fragmentos existentes con coherencia de entorno y personajes.
- Generacion de contenido sin filtros para investigacion creativa: el modelo permite ajustar el nivel de censura por prompt, lo que resulta util en entornos controlados de investigacion sobre generacion de texto.
- Prototipado de asistentes de escritura en local: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo consumer con llama.cpp u Ollama para herramientas de escritura offline.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (7,5B parametros): aproximadamente 4-5 GB en Q4KM/Q4KS, 5-6 GB en Q5, 6-7 GB en Q6, 8-9 GB en Q8, y 2,5-3,5 GB en Q2/Q3 (estimaciones orientativas segun el numero de parametros; no confirmadas en la informacion).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100/H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas usando Q4 o inferior; Q8 requiere 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; el repo incluye variantes ARM para equipos con esa arquitectura (en maquinas no ARM el rendimiento en tokens por segundo sera muy bajo).
- Latencia y throughput: no disponibles en la informacion; dependen de la GPU, la cuantizacion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| L3.2-Rogue-Creative-Instruct-Uncensored-7B-GGUF | 7,53B | 128k | Apache 2.0 | Escritura creativa sin censura | GGUF en HF |
| Llama-3.2-3B-Instruct-uncensored (base) | 3B | 128k | no disponible en la informacion | Instruct sin censura | HF |
| Llama-3.2-3B-Instruct (Meta) | 3B | 128k | Llama 3.2 Community License | Instruct general | HF |
| Modelos creativos GGUF de 7-8B (familia Mistral/Llama) | ~7-8B | variable | variable | Escritura creativa | HF |

La comparativa se limita a caracteristicas estructurales; no hay datos de benchmarks que permitan comparar rendimiento real entre estos modelos.

## Limitaciones y advertencias
- Modelo unicamente en ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion y de "RANT" (deriva repetitiva) con rep pen bajo (1,0-1,02) o temperaturas muy altas; el autor recomienda rep pen de 1,05 o superior y limitar los tokens maximos.
- El contenido sin censura puede generar material inapropiado, ofensivo o no apto para produccion; el control de sesgos depende exclusivamente del prompt.
- Es un modelo orientado a ficcion, no a tareas de codigo, matematicas o razonamiento formal; no se recomienda para aplicaciones tecnicas.
- Las distintas cuantizaciones producen salidas ligeramente diferentes; IQ4XS se comporta de forma distinta al resto.
- Las variantes ARM solo rinden correctamente en maquinas ARM.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base (Llama 3.2) antes de un uso comercial.
- No hay informacion sobre el dataset de entrenamiento ni sobre evaluaciones de seguridad.

## Enlaces
- Hugging Face (GGUF): https://huggingface.co/DavidAU/L3.2-Rogue-Creative-Instruct-Uncensored-7B-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/L3.2-Rogue-Creative-Instruct-Uncensored-7B
- Modelo de origen: https://huggingface.co/chuanli11/Llama-3.2-3B-Instruct-uncensored
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
