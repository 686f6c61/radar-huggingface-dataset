# project-tharsis/infinite-book-of-answers-4b

## Resumen

Infinite Book of Answers 4B es un ajuste fino de `Qwen/Qwen3-4B` desarrollado por Project Tharsis que transforma el modelo base en un oraculo conversacional bilingue (chino e ingles) estilizado como el clasico *Book of Answers* impreso. El modelo no responde preguntas de forma convencional: devuelve una unica frase breve, sin comas, con una cadencia fija (mediana de 7 caracteres en chino y 5 palabras en ingles) que funciona como respuesta resonante a cualquier entrada, desde un emoji hasta un desahogo de 250 caracteres. Resuelve un problema muy concreto de producto: ofrecer respuestas instantaneas, poeticas y no literales en aplicaciones de entretenimiento, journaling o consulta ludica, sin que el modelo rompa el personaje ni derive en asistente generico.

Tecnicamente parte de la arquitectura transformer densa de Qwen3-4B (4.022.468.096 parametros) y se distribuye unicamente como GGUF cuantizado Q4_K_M de 2,50 GB, empaquetado con un `Modelfile` para Ollama que desactiva el modo thinking (`enable_thinking=False`) y fija `num_ctx` a 2048 y `num_predict` a 28. La innovacion no esta en el modelo base sino en el pipeline de alineamiento: un SFT con LoRA en bf16 seguido de un DPO ligero, orientados a imponer un formato rigido, una voz humana y una ontologia que resiste inyecciones de prompt.

Es relevante ahora por su enfoque de producto vertical sobre un modelo pequeno: demuestra que un 4B cuantizado puede servir como motor de una experiencia conversacional especializada con latencia mediana de 104 ms en una GPU L4, lo que lo hace viable en despliegues locales y de bajo coste. La licencia Apache-2.0 facilita su uso comercial, aunque el modelo no esta pensado para tareas de asistencia general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (`num_ctx` en el `Modelfile`) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | chino (zh) e ingles (en), entrenamiento 50/50 |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`answer-book-qwen3-4b-v4.1-Q4_K_M.gguf`, 2,50 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-4B, con 4.022 millones de parametros y una ventana de contexto configurada a 2048 tokens en el despliegue publicado. No se documentan cambios estructurales sobre el modelo base; el trabajo se concentra en el alineamiento. El entrenamiento consta de dos etapas: una primera de SFT con LoRA en bf16 sobre Qwen/Qwen3-4B y una segunda de DPO ligero. El conjunto de datos se compone al 50% en chino y al 50% en ingles, sin dependencia de system prompt, y el modo thinking de Qwen3 se desactiva tanto en entrenamiento como en el `Modelfile`, de modo que la respuesta se emite directamente en el primer token.

La innovacion tecnica principal es la imposicion de un formato estricto: cero comas, mediana de 7 caracteres en chino (aproximadamente el 80% con 8 o menos) y 5 palabras en ingles (aproximadamente el 87% con 6 o menos). Ademas, el modelo aplica lo que el autor denomina "resonancia semitransparente": elimina los sustantivos concretos de la entrada y deja el ultimo 30% de la interpretacion al usuario. El `Modelfile` fija temperatura 0.85, min_p 0.05, top_p 0.90, repeat_penalty 1.15, num_predict 28 y num_ctx 2048.

## Capacidades

- Generacion de respuestas breves de una sola frase con formato fijo (sin comas, longitud acotada) en chino e ingles.
- Interpretacion de entradas muy heterogeneas: emojis, texto de hasta 250 caracteres, transcripciones de chat pegadas, saludos, codigo, matematicas o texto sin sentido.
- Resistencia a inyecciones de prompt y a peticiones de cambio de rol: no rompe el personaje, no emite "As an AI" y no da discursos.
- Modo sin razonamiento (zero-thinking): salida directa en el primer token, sin cadena de pensamiento.
- No soporta tool calling ni function calling por diseno; el autor indica explicitamente que el modelo nunca invoca herramientas.
- No dispone de capacidades de vision, audio ni agentes multi-paso.
- Bilingue chino/ingles sin necesidad de system prompt.

## Casos de uso

- Aplicacion de oraculo o libro de respuestas: el modelo recibe la pregunta del usuario y devuelve una frase resonante de una linea; su formato fijo y su latencia de 104 ms lo hacen adecuado para interacciones instantaneas en movil o web.
- Journaling y reflexion personal: el usuario escribe un desahogo largo (hasta 250 caracteres) y el modelo devuelve una frase que invita a la interpretacion personal, sin sustantivos concretos que condicionen la lectura.
- Bot de entretenimiento en redes sociales o mensajeria: integrado via Ollama, responde a mensajes breves con una cadencia consistente que define la personalidad del bot y evita respuestas genericas de asistente.
- Demo interactiva de bajo coste: al caber en 2,50 GB y ejecutarse con Ollama, permite desplegar la experiencia en una sola GPU consumer o incluso en CPU, con un coste de inferencia minimo.
- Investigacion sobre estilo y formato: sirve como caso de estudio de como SFT + DPO pueden imponer restricciones de formato medibles (tasa de cero comas del 100% en chino) sobre un modelo pequeno.
- Filtro creativo o generador de microcopy: util para producir frases cortas de caracter ludico o poetico en productos de bienestar, meditacion o gamificacion, siempre con supervision humana.

## Benchmarks y rendimiento

Datos publicados por el autor sobre el GGUF Q4_K_M via Ollama `/api/chat` con los parametros del `Modelfile` (`think=false`):

| Suite | Formato correcto | Tasa cero comas (ZH / EN) | Longitud mediana (ZH / EN) | Latencia (L4 Q4_K_M) |
|---|---|---|---|---|
| Smoke test (120 sondas, 600 muestras) | 569/570 (99,8%) | 100,0% / 100,0% | 7 caracteres / 5 palabras | 104 ms mediana / 148 ms P95 |
| Conjunto held-out no visto (160 sondas, 1.032 muestras) | 1.014/1.032 (98,3%) | 100,0% / 99,4% | 7 caracteres / 5 palabras | 104 ms mediana / 146 ms P95 |
| Inyeccion de system prompt (20 muestras) | 20/20 (100,0%) | 100,0% / 100,0% | 7 caracteres / 5 palabras | 106 ms mediana / 162 ms P95 |

Evaluacion ciega con doble juez sobre 216 salidas no vistas (mezcladas con 40 anclas doradas):

| Metrica | Resultado |
|---|---|
| Fluidez | 4,52 / 4,42 (cola <= 2: 5,6%, frente a 13,8%-18,1% en v4) |
| Voz humana | 4,06 / 3,83 (4,25 / 4,01 en chino; ancla 4,35 / 4,15) |
| Resonancia | 3,24 / 3,11 |
| Tasa de dano no relacionado con seguridad | 0,0% |

Auditoria de seguridad sobre 480 muestras no vistas en 11 dominios de riesgo: `encourages_harm` del 3,33% (16/480, frente al 15,6% de v4), 0/480 rupturas de personaje; seguridad en chino 239/240 (99,6%); cola residual en ingles de 15/240 (6,25%), principalmente mezclas quimicas y venganza sutil.

## Requisitos de hardware

- VRAM estimada: unos 3 GB para el GGUF Q4_K_M de 2,50 GB mas overhead de contexto (2048 tokens); no se publican otras cuantizaciones.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; el autor reporta 104 ms de latencia mediana en una NVIDIA L4.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; tambien es viable en CPU por su tamano reducido.
- Opciones de despliegue: Ollama (soporte oficial con `Modelfile` incluido), llama.cpp y LM Studio segun la model card.
- Latencia y throughput: 104 ms mediana y 146-162 ms P95 en L4 con Q4_K_M; no se publican cifras de throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Infinite Book of Answers 4B | 4.022 M | 2048 | GGUF Q4_K_M | Apache-2.0 | Hugging Face + Ollama |
| Qwen/Qwen3-4B (base) | 4.022 M | mayor (no especificado en la informacion) | safetensors y cuantizaciones | Apache-2.0 | Hugging Face |
| Modelos de asistencia general de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas especializadas en respuestas de una linea no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia clave es el formato impuesto (cero comas, longitud acotada, sin thinking) y la resistencias a inyecciones, a costa de renunciar a tool calling y a contexto largo.

## Limitaciones y advertencias

- El modelo no es un asistente general: no responde preguntas factuales, no hace matematicas ni codigo de forma util y no debe usarse para tareas de recuperacion de informacion.
- Riesgo de alucinacion irrelevante en su dominio, pero las respuestas son deliberadamente no literales; no deben interpretarse como consejo.
- Contexto limitado a 2048 tokens; entradas mas largas que 250 caracteres no estan cubiertas por el entrenamiento.
- Solo chino e ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- Cola residual de seguridad en ingles del 6,25% en prompts de alto riesgo (mezclas quimicas, venganza sutil); el autor recomienda un clasificador de crisis upstream para despliegues publicos sensibles a seguridad.
- Requiere `--think=false` en Ollama 0.9+ para evitar el parseo del campo thinking de Qwen3; sin ello la respuesta puede no llegar en `message.content`.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B conserva su propia licencia Apache-2.0; conviene revisar los terminos de Project Tharsis para redistribuciones.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/project-tharsis/infinite-book-of-answers-4b
- Demo en vivo: https://shuoh.me/
- GitHub: https://github.com/project-tharsis/infinite-book-of-answers
- Especificacion de diseno: https://github.com/project-tharsis/infinite-book-of-answers/blob/main/SPEC.md
- Informe de evaluacion: https://github.com/project-tharsis/infinite-book-of-answers/blob/main/EVAL_REPORT.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Contacto: hi@shuoh.me
